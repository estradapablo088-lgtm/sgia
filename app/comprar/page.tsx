'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './comprar.module.css';
const PACKS = [
  { id: '1', credits: 1, priceGtq: '25.00', label: '1 Crédito', priceLabel: 'Q25', detail: '1 anuncio HD', savings: '' },
  { id: '5', credits: 5, priceGtq: '80.00', label: '5 Créditos', priceLabel: 'Q80', detail: 'Q16 por anuncio', savings: 'Ahorras Q45', popular: true },
  { id: '15', credits: 15, priceGtq: '200.00', label: '15 Créditos', priceLabel: 'Q200', detail: 'Q13.33 por anuncio', savings: 'Ahorras Q175' },
];

export default function ComprarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState(PACKS[1]); // default: 5 credits
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('creditos')
        .eq('id', session.user.id)
        .single();
      if (profile) setCredits(profile.creditos || 0);
      setLoading(false);
    };
    getUser();
  }, [router]);

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
        <p className={styles.sectionTag}>Créditos</p>
        <h1 className={styles.title}>Comprar créditos</h1>
        <p className={styles.subtitle}>
          Cada crédito desbloquea 1 anuncio en alta resolución, sin marca de agua, listo para publicar.
        </p>

        {/* Current credits */}
        <div className={styles.currentCredits}>
          <span>Tu saldo actual</span>
          <strong>✦ {credits} crédito{credits !== 1 ? 's' : ''}</strong>
        </div>

        {/* Pricing cards */}
        <div className={styles.pricingGrid}>
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`${styles.pricingCard} ${selectedPack.id === pack.id ? styles.selected : ''}`}
              onClick={() => { setSelectedPack(pack); setPaySuccess(false); setPayError(''); }}
            >
              {pack.popular && <span className={styles.popularBadge}>⭐ Más popular</span>}
              <h3>{pack.label}</h3>
              <div className={styles.price}>{pack.priceLabel} <span>USD</span></div>
              <p className={styles.priceDetail}>{pack.detail}</p>
              {pack.savings && <span className={styles.savings}>{pack.savings}</span>}
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div className={styles.checkoutSection}>
          {paySuccess ? (
            <div className={styles.successBox}>
              <h3>✅ ¡Pago exitoso!</h3>
              <p>Se agregaron {selectedPack.credits} crédito{selectedPack.credits > 1 ? 's' : ''} a tu cuenta.</p>
              <Link href="/crear" className="btn-primary" style={{ display: 'inline-block', padding: '14px 32px' }}>
                🎨 Crear un anuncio ahora →
              </Link>
              <br />
              <button
                className="btn-outline"
                style={{ marginTop: '12px' }}
                onClick={() => {
                  setPaySuccess(false);
                  setCredits(credits + selectedPack.credits);
                }}
              >
                Comprar más créditos
              </button>
            </div>
          ) : (
            <div className={styles.checkoutBox}>
              <h3 style={{color:'#d4af37'}}>Transferencia Bancaria</h3>
              <p className={styles.checkoutSummary}>
                Paga <b>GTQ {selectedPack.priceGtq}</b> para comprar el paquete de {selectedPack.credits} crédito{selectedPack.credits > 1 ? 's' : ''}.
              </p>
              
              <div style={{background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'20px', margin:'20px auto', maxWidth:'400px', textAlign:'left'}}>
                <p style={{margin:'0 0 8px', color:'var(--text-secondary)', fontSize:'13px'}}>Banco destino</p>
                <p style={{margin:'0 0 16px', fontWeight:'700', fontSize:'18px', color:'white'}}>Banco Industrial</p>
                
                <p style={{margin:'0 0 8px', color:'var(--text-secondary)', fontSize:'13px'}}>No. de Cuenta (Monetaria)</p>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <p style={{margin:'0', fontWeight:'700', fontSize:'22px', color:'var(--accent-color)', letterSpacing:'2px'}}>123-456789-0</p>
                  <button onClick={() => { navigator.clipboard.writeText('1234567890'); alert('Copiado'); }} style={{background:'none', border:'none', color:'white', cursor:'pointer', padding:'4px'}}>📋</button>
                </div>
                <p style={{margin:'8px 0 0', color:'var(--text-secondary)', fontSize:'13px'}}>A nombre de: <b>Tu Nombre o Empresa</b></p>
              </div>

              <button 
                className="btn-primary"
                style={{background:'#25D366', color:'white', fontSize:'16px', width:'100%', maxWidth:'400px', padding:'16px 32px'}}
                onClick={() => {
                  const whatsappMsg = `¡Hola! Acabo de hacer una transferencia de GTQ ${selectedPack.priceGtq} para comprar el paquete de ${selectedPack.credits} crédito(s) en SGIA.\n\nMi correo registrado es: *${user?.email}*\n\nAdjunto comprobante 👇`;
                  const whatsappNumber = "50200000000"; // Reemplazar
                  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                }}>
                💬 Enviar Comprobante por WhatsApp
              </button>
              <p style={{fontSize:'12px', color:'var(--text-secondary)', marginTop:'16px'}}>Tus créditos se añadirán a tu cuenta en cuanto validemos el comprobante manualmente.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
