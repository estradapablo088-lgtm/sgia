'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from '../registro/auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.logo}>SGIA</Link>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>Iniciar sesión</h1>
          <p>Bienvenido de vuelta</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="tu@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Contraseña</label>
            <input type="password" placeholder="Tu contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className={styles.errorMsg}>❌ {error}</p>}

          <button type="submit" className="btn-primary" style={{width:'100%'}} disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión →'}
          </button>
        </form>

        <p className={styles.switch}>
          ¿No tienes cuenta? <Link href="/registro">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}
