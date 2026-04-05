'use client';

import Link from 'next/link';

export default function Terminos() {
  return (
    <main style={{ minHeight: '100vh', padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <nav style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
          SGIA
        </Link>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Volver al Inicio →
        </Link>
      </nav>

      <article style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
        <h1 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '36px', marginBottom: '24px' }}>
          Términos y Condiciones
        </h1>
        <p style={{ marginBottom: '16px' }}>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        
        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>1. Aceptación de los Términos</h2>
        <p style={{ marginBottom: '16px' }}>Al acceder y utilizar el servicio de generación de anuncios profesionales asistidos por IA ("SGIA"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte, no podrá acceder al servicio.</p>

        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>2. Descripción del Servicio</h2>
        <p style={{ marginBottom: '16px' }}>SGIA provee servicios de diseño gráfico para materiales publicitarios mediante el uso de tecnologías asistidas por software y modelos de inteligencia artificial. Entregamos composiciones visuales (imágenes) en formato digital.</p>

        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>3. Uso Aceptable e Imágenes de Usuario</h2>
        <p style={{ marginBottom: '16px' }}>Al subir imágenes a nuestra plataforma, el usuario declara poseer los derechos comerciales de las mismas. No se permite la generación de contenido ilegal, ofensivo o inapropiado. SGIA se reserva el derecho de procesar o no cualquier material que viole estas políticas.</p>

        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>4. Entrega del Producto Digital</h2>
        <p style={{ marginBottom: '16px' }}>El producto final se entrega en formato digital de alta resolución, disponible para su descarga en la plataforma. Los tiempos de procesamiento suelen ser agilizados por nuestro sistema, garantizando la entrega final en un plazo máximo de 24 horas hábiles tras la confirmación del pago.</p>

        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>5. Contacto</h2>
        <p style={{ marginBottom: '16px' }}>Para consultas referentes a nuestros servicios, contacte a nuestro equipo de atención al cliente en <strong>soporte@sgia-app.com</strong>.</p>
        
      </article>

      <footer style={{ marginTop: '80px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} SGIA. Servicio de Diseño Profesional.</p>
      </footer>
    </main>
  );
}
