'use client';

import Link from 'next/link';

export default function Reembolso() {
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
          Política de Reembolso
        </h1>
        <p style={{ marginBottom: '16px' }}>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        
        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>1. Naturaleza del Servicio y Bienes Digitales</h2>
        <p style={{ marginBottom: '16px' }}>SGIA proporciona un servicio de diseño y procesamiento de materiales publicitarios. Debido a que el producto que entregamos es de naturaleza completamente digital y se expulsa inmediatamente a través del consumo de recursos computacionales de la plataforma, <strong>todas las ventas de créditos o diseños descargados son definitivas.</strong></p>

        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>2. Excepciones para Reembolso</h2>
        <p style={{ marginBottom: '16px' }}>Como norma general, <strong>no ofrecemos reembolsos</strong> por diseños generados o créditos consumidos. Sin embargo, un cliente podrá ser elegible para una devolución o reposición de créditos exclusivamente en los siguientes casos comprobables:</p>
        <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
          <li style={{ marginBottom: '8px' }}>Errores técnicos severos de la plataforma que impidieron la descarga total del archivo digital por el cual se pagó.</li>
          <li style={{ marginBottom: '8px' }}>El archivo descargado se encuentre corrupto de origen o ilegible informáticamente en más de 24 horas después del pago.</li>
          <li style={{ marginBottom: '8px' }}>Cargos duplicados realizados por error de la pasarela de pago para una misma transacción.</li>
        </ul>

        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>3. Proceso de Disputa e Incidencias</h2>
        <p style={{ marginBottom: '16px' }}>Si experimenta algún problema técnico o cree cumplir con las excepciones descritas anteriormente, debe comunicarse directamente con nuestro equipo de soporte enviando un correo a <strong>soporte@sgia-app.com</strong> antes de presentar cualquier reclamo en plataformas de terceros. Debe incluir en el correo la prueba de la transacción y una descripción detallada del error.</p>

        <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginTop: '32px', marginBottom: '16px' }}>4. Resoluciones</h2>
        <p style={{ marginBottom: '16px' }}>En caso de proceder debido a fallos técnicos del sistema, nuestra prioridad será reponer los créditos a la cuenta del usuario para que pueda realizar la descarga satisfactoriamente.</p>
        
      </article>

      <footer style={{ marginTop: '80px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} SGIA. Servicio de Diseño Profesional.</p>
      </footer>
    </main>
  );
}
