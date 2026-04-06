'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdCanvas from '@/components/AdCanvas';
import styles from './crear.module.css';

const STEPS = ['Sube tus fotos', 'Tu negocio', 'Tu anuncio', 'Generando...'];
const MAX_IMAGES = 5;

const TONOS = ['Profesional', 'Divertido', 'Urgente', 'Elegante', 'Moderno'];
const FORMATOS = [
  { id: 'instagram-post', label: 'Post Instagram', size: '1080×1080', icon: '▪️' },
  { id: 'historia', label: 'Historia / Reel', size: '1080×1920', icon: '📱' },
  { id: 'banner', label: 'Banner Web', size: '1200×628', icon: '🖼️' },
  { id: 'promocion', label: 'Promoción', size: 'Con badge oferta', icon: '🏷️' },
];

export default function CrearPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    negocio: '', tipo: '', descripcion: '',
    oferta: '', publico: '', tono: 'Moderno', formato: 'instagram-post', extras: '',
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [paid, setPaid] = useState(false);
  const [payError, setPayError] = useState('');
  const [renderedImages, setRenderedImages] = useState<Record<number, string>>({});
  const [credits, setCredits] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('creditos')
        .eq('id', userId)
        .single();
        
      if (data) {
        setCredits(data.creditos || 0);
      } else if (error && error.code === 'PGRST116') {
        await supabase.from('profiles').insert({ id: userId, creditos: 0 });
        setCredits(0);
      }
    } catch (e) {
      console.error("Error loading credits", e);
    }
  };

  // Check auth
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      // Load credits initially
      await loadCredits(session.user.id);
    };
    checkUser();
  }, [router]);

  const handleImages = (files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const combined = [...images, ...newFiles].slice(0, MAX_IMAGES);
    setImages(combined);

    // Generate previews for new files
    const existingPreviews = [...imagePreviews];
    newFiles.forEach((file) => {
      if (existingPreviews.length >= MAX_IMAGES) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, e.target?.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleImages(e.dataTransfer.files);
  };

  const handleGenerar = async () => {
    setStep(3);
    setLoading(true);
    setError('');
    setLoadingStepIdx(0);

    try {
      // Animate loading steps
      const stepTimer1 = setTimeout(() => setLoadingStepIdx(1), 3000);
      const stepTimer2 = setTimeout(() => setLoadingStepIdx(2), 7000);

      const formData = new FormData();
      images.forEach((img) => formData.append('imagenes', img));
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));

      const res = await fetch('/api/generar-anuncio', {
        method: 'POST', body: formData,
      });
      const data = await res.json();

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) throw new Error(data.error || 'Error al generar');

      // Save to Supabase
      if (user) {
        const { error: dbError } = await supabase.from('anuncios').insert({
          user_id: user.id,
          negocio: form.negocio,
          tipo: form.tipo,
          descripcion: form.descripcion,
          oferta: form.oferta,
          tono: form.tono,
          formato: form.formato,
          variaciones: data.variaciones,
          imagen_url: data.imagenUrl,
          pagado: false,
        });
        if (dbError) console.warn('Error guardando anuncio:', dbError);
      }

      setResultado(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHD = (dataUrl: string, idx: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `sgia-premium-${form.negocio || 'ad'}-var${idx+1}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  const loadingSteps = [
    { label: `Analizando ${images.length} imagen${images.length !== 1 ? 'es' : ''} con IA`, done: loadingStepIdx > 0 },
    { label: 'Generando copy publicitario...', done: loadingStepIdx > 1 },
    { label: 'Creando imagen profesional...', done: false },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.back}>← Volver</Link>
        <span className={styles.logo}>SGIA</span>
        <span />
      </header>

      {/* Progress bar */}
      {step < 3 && (
        <div className={styles.progressWrap}>
          <div className={styles.steps}>
            {STEPS.slice(0,3).map((s, i) => (
              <div key={s} className={`${styles.stepItem} ${i <= step ? styles.active : ''}`}>
                <div className={styles.stepBubble}>{i < step ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* PASO 0 — Sube fotos */}
      {step === 0 && (
        <div className={styles.stepContent}>
          <h1 className={styles.stepTitle}>Sube las fotos de tu negocio</h1>
          <p className={styles.stepDesc}>Sube hasta {MAX_IMAGES} fotos. La IA analizará todas para generar el anuncio perfecto.</p>
          
          {/* Preview grid */}
          {imagePreviews.length > 0 && (
            <div className={styles.imageGrid}>
              {imagePreviews.map((preview, i) => (
                <div key={i} className={styles.imageThumb}>
                  <img src={preview} alt={`Foto ${i + 1}`} />
                  <button className={styles.removeImg} onClick={() => removeImage(i)}>✕</button>
                  <span className={styles.imgNum}>{i + 1}</span>
                </div>
              ))}
              {imagePreviews.length < MAX_IMAGES && (
                <div
                  className={styles.addMore}
                  onClick={() => fileRef.current?.click()}
                >
                  <span>+</span>
                  <p>Agregar</p>
                </div>
              )}
            </div>
          )}

          {/* Dropzone (only show when no images yet) */}
          {imagePreviews.length === 0 && (
            <div
              className={styles.dropzone}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              <span className={styles.dropIcon}>📁</span>
              <p>Arrastra tus imágenes aquí o <strong>haz clic para seleccionar</strong></p>
              <span className={styles.dropHint}>JPG, PNG, WEBP — máx 10MB · hasta {MAX_IMAGES} fotos</span>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" multiple hidden
            onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleImages(e.target.files); e.target.value = ''; }} />
          
          {imagePreviews.length > 0 && (
            <div className={styles.actions}>
              <button className="btn-outline" onClick={() => { setImages([]); setImagePreviews([]); }}>
                Quitar todas
              </button>
              <button className="btn-primary" onClick={() => setStep(1)}>
                Continuar con {imagePreviews.length} foto{imagePreviews.length > 1 ? 's' : ''} →
              </button>
            </div>
          )}
        </div>
      )}

      {/* PASO 1 — Info del negocio */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <h1 className={styles.stepTitle}>Cuéntanos sobre tu negocio</h1>
          <p className={styles.stepDesc}>Esta información permite que la IA personalice el anuncio.</p>
          <div className={styles.form}>
            <div className={styles.field}>
              <label>Nombre del negocio *</label>
              <input placeholder="Ej: Restaurante El Rincón" value={form.negocio}
                onChange={(e) => setForm({...form, negocio: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>Tipo de negocio *</label>
              <select value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})}>
                <option value="">Selecciona...</option>
                <option>Restaurante / Comida</option>
                <option>Barbería / Salón</option>
                <option>Tienda / Retail</option>
                <option>Servicios profesionales</option>
                <option>Gimnasio / Fitness</option>
                <option>Otro</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>¿A quién va dirigido? (público objetivo)</label>
              <input placeholder="Ej: Familias jóvenes en la ciudad" value={form.publico}
                onChange={(e) => setForm({...form, publico: e.target.value})} />
            </div>
          </div>
          <div className={styles.actions}>
            <button className="btn-outline" onClick={() => setStep(0)}>← Atrás</button>
            <button className="btn-primary"
              disabled={!form.negocio || !form.tipo}
              onClick={() => setStep(2)}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* PASO 2 — Info del anuncio */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <h1 className={styles.stepTitle}>Describe tu anuncio</h1>
          <p className={styles.stepDesc}>Mientras más detalle das, mejor será el resultado.</p>
          <div className={styles.form}>
            <div className={styles.field}>
              <label>¿Qué quieres promocionar? *</label>
              <input placeholder='Ej: "Oferta 2x1 en pizzas", "Nuevo menú de desayunos"'
                value={form.descripcion}
                onChange={(e) => setForm({...form, descripcion: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>Oferta especial (opcional)</label>
              <input placeholder='Ej: "20% de descuento", "2x1 solo este fin de semana"'
                value={form.oferta}
                onChange={(e) => setForm({...form, oferta: e.target.value})} />
            </div>
            <div className={styles.field}>
              <label>Tono del anuncio</label>
              <div className={styles.chips}>
                {TONOS.map((t) => (
                  <button key={t}
                    className={`${styles.chip} ${form.tono === t ? styles.chipActive : ''}`}
                    onClick={() => setForm({...form, tono: t})}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Formato del anuncio</label>
              <div className={styles.formatGrid}>
                {FORMATOS.map((f) => (
                  <button key={f.id}
                    className={`${styles.formatBtn} ${form.formato === f.id ? styles.formatActive : ''}`}
                    onClick={() => setForm({...form, formato: f.id})}>
                    <span>{f.icon}</span>
                    <strong>{f.label}</strong>
                    <span className={styles.fmtSize}>{f.size}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Comentarios extras para la IA (opcional)</label>
              <textarea
                className={styles.textarea}
                placeholder='Ej: "Usa colores rojos", "Menciona que abrimos domingos", "El anuncio es para Instagram Stories"'
                value={form.extras}
                onChange={(e) => setForm({...form, extras: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <button className="btn-outline" onClick={() => setStep(1)}>← Atrás</button>
            <button className="btn-primary"
              disabled={!form.descripcion}
              onClick={handleGenerar}>
              🤖 Generar anuncio
            </button>
          </div>
        </div>
      )}

      {/* PASO 3 — Generando / Resultado */}
      {step === 3 && (
        <div className={styles.stepContent} style={{textAlign:'center'}}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <h2 className={styles.stepTitle}>La IA está generando tu anuncio...</h2>
              <p className={styles.stepDesc}>Analizando tu imagen y creando el copy perfecto. Esto tarda ~15 segundos.</p>
              <div className={styles.loadingSteps}>
                {loadingSteps.map((ls, i) => (
                  <span key={i} className={styles.loadingStep}>
                    {ls.done ? '✅' : i <= loadingStepIdx ? '⏳' : '○'} {ls.label}
                  </span>
                ))}
              </div>
            </div>
          ) : error ? (
            <div>
              <p style={{color:'#ff6b6b', marginBottom:'20px'}}>❌ {error}</p>
              <button className="btn-primary" onClick={() => setStep(2)}>← Intentar de nuevo</button>
            </div>
          ) : resultado ? (
            <div className={styles.resultado}>
              <p className={styles.sectionTag} style={{textAlign:'center', marginBottom:'8px'}}>¡Listo!</p>
              <h2 className={styles.stepTitle}>{paid ? '✅ ¡Anuncio desbloqueado!' : 'Tu anuncio está generado'}</h2>
              <p className={styles.stepDesc}>{paid ? 'Tu anuncio está listo para descargar en alta calidad.' : 'Desbloquea para descargar en alta calidad sin marca de agua.'}</p>

              <div className={styles.adCards}>
                {resultado.variaciones?.map((v: any, i: number) => (
                  <div key={i} className={styles.adCard}>
                    <div className={styles.adImageWrap} style={{ width: '100%', marginBottom: '20px' }}>
                      {resultado.imagenUrl ? (
                        <div className={!paid && renderedImages[i] ? styles.canvasBlurred : ''}>
                          <AdCanvas
                            imageUrl={resultado.imagenUrl}
                            headline={v.headline}
                            copy={v.copy}
                            cta={v.cta}
                            tono={i === 0 ? form.tono : ['Divertido', 'Elegante', 'Moderno'].filter(t => t !== form.tono && (t !== 'Profesional' || form.tono !== 'Elegante') && (t !== 'Urgente' || form.tono !== 'Divertido'))[(i - 1) % 2]}
                            formato={form.formato}
                            onRendered={(dataUrl) => setRenderedImages(prev => ({...prev, [i]: dataUrl}))}
                          />
                        </div>
                      ) : (
                        <div className={styles.adImagePlaceholder}>
                          {imagePreviews[0] && <img src={imagePreviews[0]} alt="Base" style={{width:'100%', height:'100%', objectFit:'cover', opacity:0.4}} />}
                          <div className={styles.adOverlay}>
                            <strong>{v.headline}</strong>
                          </div>
                        </div>
                      )}
                      {!paid && renderedImages[i] && (
                        <div className={styles.adWatermark}>
                          <span>PREVIEW</span>
                          <span>PREVIEW</span>
                          <span>PREVIEW</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.adInfo} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <span className={styles.adBadge}>Variación {i + 1}</span>
                      <h3 className={styles.adHeadline}>{v.headline}</h3>
                      <p className={styles.adCopy}>{v.copy}</p>
                      <span className={styles.adCta}>👉 {v.cta}</span>
                      {paid && (
                        <button className="btn-primary" style={{marginTop:'12px', fontSize:'13px', padding:'8px 16px'}}
                          onClick={() => {
                            const text = `${v.headline}\n\n${v.copy}\n\n${v.cta}`;
                            navigator.clipboard.writeText(text);
                            alert('¡Texto copiado!');
                          }}>
                          📋 Copiar texto
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!paid ? (
                <div className={styles.unlockSection}>
                  {credits > 0 ? (
                    <div className={styles.unlockBox} style={{borderColor:'var(--accent-color)'}}>
                      <h3>🔓 Desbloquear anuncio en HD</h3>
                      <p>Tienes <strong>{credits} créditos</strong> disponibles en tu cuenta.</p>
                      
                      <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <button 
                          className="btn-primary" 
                          disabled={actionLoading}
                          style={{marginTop:'16px', padding:'16px 32px', fontSize:'18px', flex:'1'}}
                          onClick={async () => {
                            setActionLoading(true);
                            setPayError('');
                            const { error } = await supabase
                              .from('profiles')
                              .update({ creditos: credits - 1 })
                              .eq('id', user.id);
                              
                            if (!error) {
                              setCredits(credits - 1);
                              setPaid(true);
                            } else {
                              setPayError('Error al procesar el crédito. Intenta de nuevo.');
                            }
                            setActionLoading(false);
                          }}>
                          {actionLoading ? 'Desbloqueando...' : 'Desbloquear por 1 Crédito'}
                        </button>
                        
                        <button 
                          className="btn-outline"
                          title="Actualizar mi saldo de créditos si acabo de recargar"
                          style={{marginTop:'16px', padding:'16px', fontSize:'18px'}}
                          onClick={async () => {
                             if(user) await loadCredits(user.id);
                          }}>
                          🔄
                        </button>
                      </div>
                      {payError && <p style={{color:'#ff6b6b', marginTop:'12px'}}>❌ {payError}</p>}
                    </div>
                  ) : (
                    <div className={styles.unlockBox}>
                      <h3 style={{color:'#d4af37'}}>⚠️ Sin créditos suficientes</h3>
                      <p>Para descargar estas piezas en alta calidad necesitas saldo. Realiza una recarga manual de créditos.</p>
                      
                      <div style={{background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'24px', margin:'20px auto', maxWidth:'400px', textAlign:'center'}}>
                        <h4 style={{margin:'0 0 12px', color:'white', fontSize:'16px'}}>Pasos para recargar:</h4>
                        <ol style={{margin:'0', padding:'0 0 0 20px', textAlign:'left', color:'var(--text-secondary)', fontSize:'14px', lineHeight:'1.8'}}>
                          <li>Comunícate con nuestro soporte vía WhatsApp.</li>
                          <li>Solicita el número de cuenta.</li>
                          <li>Deposita el valor de los créditos que quieras (<b>Q25 por 1 crédito</b>).</li>
                          <li>Tus créditos serán recargados inmediatamente.</li>
                        </ol>
                      </div>

                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'16px'}}>
                        <button 
                          className={styles.payBtn} 
                          style={{background:'#25D366', color:'white', fontSize:'16px', flex:'1'}}
                          onClick={() => {
                            const whatsappMsg = `¡Hola! Me gustaría solicitar el número de cuenta para recargar saldo (créditos) en mi cuenta de SGIA.\n\nMi correo registrado es: *${user?.email}*`;
                            const whatsappNumber = "50230236365"; 
                            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                          }}>
                          💬 Solicitar Cuenta por WhatsApp
                        </button>
                        <button 
                          className="btn-outline"
                          title="Refrescar Saldo"
                          style={{fontSize:'16px', padding:'14px'}}
                          onClick={async () => {
                             setActionLoading(true);
                             if(user) await loadCredits(user.id);
                             setActionLoading(false);
                          }}>
                          🔄
                        </button>
                      </div>
                      <p className={styles.unlockNote}>Te atenderemos en breve. Si ya pagaste y te dimos los créditos, aprieta 🔄.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.unlockSection}>
                  <div className={styles.unlockBox} style={{borderColor:'rgba(40,200,100,0.4)', background:'rgba(40,200,100,0.06)'}}>
                    <h3>✅ ¡Desbloqueado!</h3>
                    <p>Tus anuncios están listos HD.</p>
                    <div style={{display:'flex', gap:'12px', justifyContent:'center', marginTop:'16px', flexWrap:'wrap'}}>
                      {resultado.variaciones?.map((v: any, i: number) => (
                        renderedImages[i] && (
                          <button key={i} className={styles.payBtn} style={{background:'#28c840'}}
                            onClick={() => handleDownloadHD(renderedImages[i], i)}>
                            ⬇️ Descargar Var {i+1}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button className="btn-outline" style={{marginTop:'30px'}}
                onClick={() => { setStep(0); setResultado(null); setImages([]); setImagePreviews([]); setPaid(false); setPayError(''); setRenderedImages({}); }}>
                Crear otro anuncio
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
