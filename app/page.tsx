'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* NAV */}
      <nav className={styles.nav}>
        <span className={styles.logo}>SGIA</span>
        <div className={styles.navLinks}>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#precios">Precios</a>
          <Link href="/login">Iniciar sesión</Link>
          <Link href="/registro" className="btn-primary" style={{padding: '10px 20px', fontSize: '14px'}}>
            Registrarse gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <p className={styles.badge}>✦ Potenciado por Inteligencia Artificial</p>
        <h1 className={styles.heroTitle}>
          Tu anuncio profesional<br />
          <span className={styles.accent}>en menos de 60 segundos</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Sube una foto de tu negocio, descríbenos lo que quieres y la IA genera el anuncio completo — imagen, texto y diseño — listo para publicar.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/crear" className="btn-primary">
            Crear mi primer anuncio →
          </Link>
          <a href="#como-funciona" className="btn-outline">
            Ver cómo funciona
          </a>
        </div>
        <p className={styles.heroNote}>✓ El primer anuncio es gratis &nbsp;·&nbsp; Sin tarjeta de crédito</p>
      </section>

      {/* DEMO PREVIEW */}
      <section className={styles.previewSection}>
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <span className={styles.previewDot} style={{background:'#ff5f57'}} />
            <span className={styles.previewDot} style={{background:'#febc2e'}} />
            <span className={styles.previewDot} style={{background:'#28c840'}} />
            <span style={{color:'var(--text-secondary)', fontSize:'12px', marginLeft:'8px'}}>Vista previa del anuncio generado</span>
          </div>
          <div className={styles.previewContent}>
            <div className={styles.previewLeft}>
              <div className={styles.previewImg}>
                <span>📸</span>
                <p>Tu foto aquí</p>
              </div>
            </div>
            <div className={styles.previewRight}>
              <span className={styles.previewTag}>Instagram Post</span>
              <h3 className={styles.previewAdTitle}>🍕 2x1 solo este fin de semana</h3>
              <p className={styles.previewAdCopy}>¿Antojado? Ven y trae a un amigo. Por cada pizza grande, la segunda es completamente GRATIS. Oferta válida hasta el domingo.</p>
              <span className={styles.previewCta}>¡Reserva tu mesa ahora!</span>
              <div className={styles.watermarkOverlay}>
                <span className={styles.watermarkText}>SGIA • SGIA • SGIA • SGIA</span>
                <button className={styles.unlockBtn}>🔓 Desbloquear anuncio — $3</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className={styles.stepsSection}>
        <p className={styles.sectionTag}>Proceso</p>
        <h2 className={styles.sectionTitle}>Así de simple</h2>
        <div className={styles.stepsGrid}>
          {[
            { num: '01', icon: '📤', title: 'Sube tu foto', desc: 'Sube una imagen de tu negocio, producto o servicio. Funciona con cualquier foto.' },
            { num: '02', icon: '✍️', title: 'Describe tu anuncio', desc: 'Cuéntanos qué quieres promocionar: "2x1 de pizza", "descuento 20%", "nuevo menú".' },
            { num: '03', icon: '🤖', title: 'La IA trabaja', desc: 'En 15 segundos, la IA analiza tu foto y genera el anuncio completo con imagen y texto.' },
            { num: '04', icon: '⬇️', title: 'Descarga en HD', desc: 'Paga $3 y descarga tu anuncio en alta resolución, sin marca de agua, listo para publicar.' },
          ].map((step) => (
            <div key={step.num} className={styles.stepCard}>
              <span className={styles.stepNum}>{step.num}</span>
              <span className={styles.stepIcon}>{step.icon}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIPOS DE ANUNCIO */}
      <section className={styles.formatsSection}>
        <p className={styles.sectionTag}>Formatos</p>
        <h2 className={styles.sectionTitle}>Para todas las plataformas</h2>
        <div className={styles.formatsGrid}>
          {[
            { icon: '▪️', label: 'Post Instagram', size: '1080×1080' },
            { icon: '📱', label: 'Historia / Reels', size: '1080×1920' },
            { icon: '🖼️', label: 'Banner Web', size: '1200×628' },
            { icon: '🏷️', label: 'Promoción especial', size: 'Con badge de oferta' },
          ].map((f) => (
            <div key={f.label} className={styles.formatCard}>
              <span style={{fontSize: '24px'}}>{f.icon}</span>
              <strong>{f.label}</strong>
              <span className={styles.formatSize}>{f.size}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className={styles.pricingSection}>
        <p className={styles.sectionTag}>Precios</p>
        <h2 className={styles.sectionTitle}>Sin suscripción, paga lo que usas</h2>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <h3>1 Crédito</h3>
            <div className={styles.price}><span>$3</span> USD</div>
            <p>1 anuncio en HD sin watermark</p>
            <Link href="/crear" className="btn-outline" style={{width:'100%', textAlign:'center', marginTop:'16px'}}>Empezar</Link>
          </div>
          <div className={`${styles.pricingCard} ${styles.pricingPopular}`}>
            <span className={styles.popularBadge}>⭐ Más popular</span>
            <h3>5 Créditos</h3>
            <div className={styles.price}><span>$10</span> USD</div>
            <p>5 anuncios — ahorras $5</p>
            <Link href="/crear" className="btn-primary" style={{width:'100%', textAlign:'center', marginTop:'16px'}}>Elegir este</Link>
          </div>
          <div className={styles.pricingCard}>
            <h3>15 Créditos</h3>
            <div className={styles.price}><span>$25</span> USD</div>
            <p>15 anuncios — mejor valor</p>
            <Link href="/crear" className="btn-outline" style={{width:'100%', textAlign:'center', marginTop:'16px'}}>Empezar</Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>¿Listo para crear tu primer anuncio?</h2>
          <p>Sin experiencia en diseño. Sin complicaciones. En menos de 1 minuto.</p>
          <Link href="/crear" className="btn-primary" style={{fontSize:'18px', padding:'16px 36px'}}>
            Crear anuncio gratis →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span className={styles.logo}>SGIA</span>
        <p>© 2025 SGIA — Sistema Generador de Anuncios con IA</p>
      </footer>
    </main>
  );
}
