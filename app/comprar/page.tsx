'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PayPalCheckout from '@/components/PayPalCheckout';
import styles from './comprar.module.css';

const PACKS = [
  { id: '1', credits: 1, price: '3.00', label: '1 Crédito', priceLabel: '$3', detail: '1 anuncio HD', savings: '' },
  { id: '5', credits: 5, price: '10.00', label: '5 Créditos', priceLabel: '$10', detail: '$2 por anuncio', savings: 'Ahorras $5', popular: true },
  { id: '15', credits: 15, price: '25.00', label: '15 Créditos', priceLabel: '$25', detail: '$1.67 por anuncio', savings: 'Ahorras $20' },
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
        .select('credits')
        .eq('id', session.user.id)
        .single();
      if (profile) setCredits(profile.credits);
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
              <h3>Pagar {selectedPack.priceLabel} USD</h3>
              <p className={styles.checkoutSummary}>
                {selectedPack.credits} crédito{selectedPack.credits > 1 ? 's' : ''} — desbloquea {selectedPack.credits} anuncio{selectedPack.credits > 1 ? 's' : ''} HD
              </p>
              {payError && <p style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '16px' }}>❌ {payError}</p>}
              <PayPalCheckout
                amount={selectedPack.price}
                userId={user?.id}
                onSuccess={() => {
                  setPaySuccess(true);
                  setPayError('');
                }}
                onError={(err: any) => {
                  setPayError(err?.message || 'Error al procesar el pago. Intenta de nuevo.');
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
