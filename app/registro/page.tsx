'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.logo}>SGIA</Link>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>Crear cuenta gratis</h1>
          <p>Tu primer anuncio es completamente gratis</p>
        </div>

        {success ? (
          <div className={styles.successMsg}>
            ✅ ¡Cuenta creada! Revisa tu email para confirmar tu cuenta.
          </div>
        ) : (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field}>
              <label>Nombre</label>
              <input type="text" placeholder="Tu nombre" value={nombre}
                onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input type="email" placeholder="tu@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label>Contraseña</label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && <p className={styles.errorMsg}>❌ {error}</p>}

            <button type="submit" className="btn-primary" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis →'}
            </button>
          </form>
        )}

        <p className={styles.switch}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
