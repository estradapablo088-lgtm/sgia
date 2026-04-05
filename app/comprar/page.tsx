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
              <h3 style={{color:'#d4af37'}}>Recarga Manual</h3>
              <p className={styles.checkoutSummary}>
                Invierte <b>GTQ {selectedPack.priceGtq}</b> para adquirir el paquete de {selectedPack.credits} crédito{selectedPack.credits > 1 ? 's' : ''}.
              </p>
              
              <div style={{background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'24px', margin:'20px auto', maxWidth:'400px', textAlign:'center'}}>
                <h4 style={{margin:'0 0 12px', color:'white', fontSize:'16px'}}>Pasos para recargar:</h4>
                <ol style={{margin:'0', padding:'0 0 0 20px', textAlign:'left', color:'var(--text-secondary)', fontSize:'14px', lineHeight:'1.8'}}>
                  <li>Comunícate con nuestro soporte vía WhatsApp.</li>
                  <li>Solicita el número de cuenta.</li>
                  <li>Deposita <b>GTQ {selectedPack.priceGtq}</b>.</li>
                  <li>Recargaremos tu cuenta inmediatamente.</li>
                </ol>
              </div>

              <button 
                className="btn-primary"
                style={{background:'#25D366', color:'white', fontSize:'16px', width:'100%', maxWidth:'400px', padding:'16px 32px'}}
                onClick={() => {
                  const whatsappMsg = `¡Hola! Me gustaría solicitar el número de cuenta porque quiero comprar el paquete de ${selectedPack.credits} crédito(s) por GTQ ${selectedPack.priceGtq} en SGIA.\n\nMi correo registrado es: *${user?.email}*`;
                  const whatsappNumber = "50230236365"; 
                  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                }}>
                💬 Solicitar Cuenta por WhatsApp
              </button>
              <p style={{fontSize:'12px', color:'var(--text-secondary)', marginTop:'16px'}}>Tu saldo se actualizará en cuanto validemos el depósito.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
