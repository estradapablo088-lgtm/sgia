'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './anuncios.module.css';

type FilterType = 'todos' | 'pagados' | 'pendientes';

export default function MisAnunciosPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>('todos');
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [credits, setCredits] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data: ads } = await supabase
        .from('anuncios')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ads) setAnuncios(ads);
      
      // Load credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', session.user.id)
        .single();
      if (profile) setCredits(profile.credits || 0);

      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleUnlockAd = async (adId: string) => {
    if (credits <= 0) {
      router.push('/comprar');
      return;
    }

    if (actionLoading || !user) return;
    setActionLoading(true);

    try {
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: credits - 1 })
        .eq('id', user.id);

      if (creditError) throw creditError;

      const { error: adError } = await supabase
        .from('anuncios')
        .update({ pagado: true })
        .eq('id', adId);

      if (adError) throw adError;

      setCredits(credits - 1);
      setAnuncios(anuncios.map(ad => ad.id === adId ? { ...ad, pagado: true } : ad));
      if (selectedAd?.id === adId) {
        setSelectedAd({ ...selectedAd, pagado: true });
      }
      alert('¡Anuncio desbloqueado exitosamente!');
    } catch (e) {
      console.error(e);
      alert('Hubo un error al usar tus créditos.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = anuncios.filter((ad) => {
    if (filter === 'pagados') return ad.pagado;
    if (filter === 'pendientes') return !ad.pagado;
    return true;
  });

  const totalPagados = anuncios.filter(a => a.pagado).length;

  const handleCopyText = (v: any) => {
    const text = `${v.headline}\n\n${v.copy}\n\n${v.cta}`;
    navigator.clipboard.writeText(text);
    alert('¡Texto copiado al portapapeles!');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.back}>← Volver al dashboard</Link>
        <span className={styles.logo}>SGIA</span>
        <span />
      </header>

      <main className={styles.main}>
        <p className={styles.sectionTag}>Historial</p>
        <h1 className={styles.title}>Mis anuncios</h1>
        <p className={styles.subtitle}>Todos los anuncios que has generado con SGIA.</p>
        
        {/* Current credits banner */}
        <div style={{background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', border:'1px solid rgba(255,255,255,0.1)'}}>
           <div>
             <span style={{color:'var(--text-secondary)', fontSize:'14px'}}>Saldo disponible:</span>
             <strong style={{color:'var(--accent-color)', marginLeft:'8px', fontSize:'16px'}}>{credits} Crédito{credits !== 1 ? 's' : ''}</strong>
           </div>
           <Link href="/comprar" className="btn-outline" style={{padding:'8px 16px', fontSize:'13px'}}>Recargar</Link>
        </div>

        {/* Stats */}
        <div className={styles.statsBar}>
          <div className={styles.statPill}>
            🎯 Total: <strong>{anuncios.length}</strong>
          </div>
          <div className={styles.statPill}>
            ✅ Pagados: <strong>{totalPagados}</strong>
          </div>
          <div className={styles.statPill}>
            ⏳ Pendientes: <strong>{anuncios.length - totalPagados}</strong>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filterTabs}>
          {([
            { key: 'todos', label: `Todos (${anuncios.length})` },
            { key: 'pagados', label: `Pagados (${totalPagados})` },
            { key: 'pendientes', label: `Pendientes (${anuncios.length - totalPagados})` },
          ] as { key: FilterType; label: string }[]).map((f) => (
            <button
              key={f.key}
              className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Ads grid */}
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <span>{filter === 'todos' ? '🎯' : filter === 'pagados' ? '✅' : '⏳'}</span>
            <h3>
              {filter === 'todos'
                ? 'Aún no tienes anuncios'
                : filter === 'pagados'
                ? 'No tienes anuncios pagados'
                : 'No tienes anuncios pendientes'}
            </h3>
            <p>
              {filter === 'todos'
                ? 'Crea tu primer anuncio con IA y aparecerá aquí.'
                : 'Los anuncios aparecerán aquí cuando cambien de estado.'}
            </p>
            {filter === 'todos' && (
              <Link href="/crear" className="btn-primary">Crear mi primer anuncio →</Link>
            )}
          </div>
        ) : (
          <div className={styles.adsGrid}>
            {filtered.map((ad) => (
              <div key={ad.id} className={styles.adCard} onClick={() => setSelectedAd(ad)}>
                <div className={styles.adImageWrap}>
                  {ad.imagen_url ? (
                    <img src={ad.imagen_url} alt={ad.negocio} className={styles.adImage} />
                  ) : (
                    <div className={styles.adPlaceholder}>
                      <span>🎨</span>
                      <p>{ad.tipo || 'Anuncio'}</p>
                    </div>
                  )}
                  {!ad.pagado && (
                    <div className={styles.adWatermark}>
                      <span>SGIA • SGIA • SGIA • SGIA</span>
                      <span>SGIA • SGIA • SGIA • SGIA</span>
                    </div>
                  )}
                  <span className={`${styles.statusBadge} ${ad.pagado ? styles.statusPaid : styles.statusPending}`}>
                    {ad.pagado ? '✓ HD' : '🔒 Bloqueado'}
                  </span>
                </div>
                <div className={styles.adBody}>
                  <h3 className={styles.adNegocio}>{ad.negocio}</h3>
                  <p className={styles.adDescripcion}>{ad.descripcion || ad.oferta || 'Sin descripción'}</p>
                  <div className={styles.adMeta}>
                    <span className={styles.adDate}>
                      {new Date(ad.created_at).toLocaleDateString('es-GT', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                    {ad.tono && <span className={styles.adTono}>{ad.tono}</span>}
                  </div>
                  <div className={styles.adActions}>
                    <button className={styles.adBtn} onClick={(e) => { e.stopPropagation(); setSelectedAd(ad); }}>
                      👁️ Ver detalle
                    </button>
                    {ad.pagado ? (
                      <button
                        className={`${styles.adBtn} ${styles.adBtnPrimary}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (ad.imagen_url) {
                            const link = document.createElement('a');
                            link.href = ad.imagen_url;
                            link.download = `sgia-${ad.negocio}.png`;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                      >
                        ⬇️ Descargar
                      </button>
                    ) : (
                      <button
                        className={`${styles.adBtn} ${styles.adBtnPrimary}`}
                        disabled={actionLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockAd(ad.id);
                        }}
                        style={{ textAlign: 'center' }}
                      >
                        {actionLoading ? '⏳' : `🔓 Desbloquear`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal — Ad detail */}
      {selectedAd && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAd(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedAd(null)}>✕</button>
            <h2 className={styles.modalTitle}>{selectedAd.negocio}</h2>

            {selectedAd.imagen_url && (
              <div className={styles.modalImage}>
                <img src={selectedAd.imagen_url} alt={selectedAd.negocio} />
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
                <strong style={{ color: 'white' }}>Tipo:</strong> {selectedAd.tipo}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
                <strong style={{ color: 'white' }}>Promoción:</strong> {selectedAd.descripcion}
              </p>
              {selectedAd.oferta && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
                  <strong style={{ color: 'white' }}>Oferta:</strong> {selectedAd.oferta}
                </p>
              )}
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px' }}>
                <strong style={{ color: 'white' }}>Tono:</strong> {selectedAd.tono}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0' }}>
                <strong style={{ color: 'white' }}>Formato:</strong> {selectedAd.formato}
              </p>
            </div>

            {selectedAd.variaciones && selectedAd.variaciones.length > 0 && (
              <>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', color: 'white', margin: '24px 0 12px' }}>
                  Variaciones del copy
                </h3>
                <div className={styles.variacionesList}>
                  {selectedAd.variaciones.map((v: any, i: number) => (
                    <div key={i} className={styles.variacion}>
                      <h4>{v.headline}</h4>
                      <p>{v.copy}</p>
                      <span className={styles.variacionCta}>👉 {v.cta}</span>
                      {selectedAd.pagado && (
                        <button className={styles.copyBtn} onClick={() => handleCopyText(v)}>
                          📋 Copiar texto
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {selectedAd.pagado && selectedAd.imagen_url && (
                <button
                  className="btn-primary"
                  style={{ padding: '12px 24px' }}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedAd.imagen_url;
                    link.download = `sgia-${selectedAd.negocio}.png`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  ⬇️ Descargar HD
                </button>
              )}
              {!selectedAd.pagado && (
                <button 
                  className="btn-primary" 
                  style={{ padding: '12px 24px' }}
                  disabled={actionLoading}
                  onClick={() => handleUnlockAd(selectedAd.id)}
                >
                  {actionLoading ? '⏳...' : `🔓 Usar 1 Crédito (${credits} disponibles)`}
                </button>
              )}
              <button className="btn-outline" style={{ padding: '12px 24px' }} onClick={() => setSelectedAd(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
