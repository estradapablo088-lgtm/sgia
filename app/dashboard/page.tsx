'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [totalDescargas, setTotalDescargas] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Get profile (credits)
      const { data: profile } = await supabase
        .from('profiles')
        .select('creditos')
        .eq('id', session.user.id)
        .single();
      if (profile) setCredits(profile.creditos || 0);

      // Get anuncios
      const { data: ads } = await supabase
        .from('anuncios')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (ads) {
        setAnuncios(ads);
        setTotalDescargas(ads.filter((a: any) => a.pagado).length);
      }

      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>SGIA</Link>
        <div className={styles.headerRight}>
          <span className={styles.credits}>✦ {credits} crédito{credits !== 1 ? 's' : ''}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      {/* Content */}
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Bienvenido{user?.user_metadata?.nombre ? `, ${user.user_metadata.nombre}` : ''} 👋</h1>
          <p>Crea anuncios profesionales con IA en segundos.</p>
        </div>

        {/* Quick actions */}
        <div className={styles.actionsGrid}>
          <Link href="/crear" className={styles.actionCard}>
            <span className={styles.actionIcon}>🎨</span>
            <h3>Crear anuncio nuevo</h3>
            <p>Sube tu foto y genera un anuncio profesional con IA.</p>
            <span className={styles.actionArrow}>→</span>
          </Link>

          <Link href="/comprar" className={styles.actionCard}>
            <span className={styles.actionIcon}>📦</span>
            <h3>Recargar créditos</h3>
            <p>Desbloquea anuncios en HD. Packs desde Q25.</p>
            <span className={styles.actionArrow}>→</span>
          </Link>

          <Link href="/mis-anuncios" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <h3>Mis anuncios</h3>
            <p>{anuncios.length > 0 ? `${anuncios.length} anuncio${anuncios.length > 1 ? 's' : ''} generado${anuncios.length > 1 ? 's' : ''}` : 'Historial de anuncios generados.'}</p>
            <span className={styles.actionArrow}>→</span>
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{credits}</span>
            <span className={styles.statLabel}>Créditos disponibles</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{anuncios.length}</span>
            <span className={styles.statLabel}>Anuncios creados</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{totalDescargas}</span>
            <span className={styles.statLabel}>Descargas HD</span>
          </div>
        </div>

        {/* Recent ads */}
        <div className={styles.recentSection}>
          <h2>Anuncios recientes</h2>
          {anuncios.length === 0 ? (
            <div className={styles.emptyState}>
              <span>🎯</span>
              <p>Aún no has creado ningún anuncio.</p>
              <Link href="/crear" className="btn-primary">Crear mi primer anuncio →</Link>
            </div>
          ) : (
            <div className={styles.adList}>
              {anuncios.map((ad) => (
                <div key={ad.id} className={styles.adListItem}>
                  <div className={styles.adListInfo}>
                    <strong>{ad.negocio}</strong>
                    <span>{ad.descripcion}</span>
                    <span className={styles.adListDate}>
                      {new Date(ad.created_at).toLocaleDateString('es-GT')}
                    </span>
                  </div>
                  <div className={styles.adListStatus}>
                    {ad.pagado ? (
                      <span className={styles.statusPaid}>✓ Pagado</span>
                    ) : (
                      <span className={styles.statusPending}>Pendiente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
