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
        <p className={styles.badge}>✦ Diseño de anuncios asistidos por IA</p>
        <h1 className={styles.heroTitle}>
          Mejora la imagen de tu negocio<br />
          <span className={styles.accent}>con contenido visual profesional</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Obtén diseños publicitarios personalizados para tus redes sociales. Sube la foto de tus productos, indica tus requisitos y nuestro sistema preparará tu campaña publicitaria.
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
            { num: '01', icon: '📤', title: 'Proporciona tus imágenes', desc: 'Sube una imagen general de tu producto, servicio o local comercial para mantener el contexto de tu marca.' },
            { num: '02', icon: '✍️', title: 'Indica los detalles', desc: 'Especifica qué información incluir en el arte: "Promoción 2x1", "Nuevo menú", u otros datos.' },
            { num: '03', icon: '💻', title: 'Procesamiento de diseño', desc: 'Nuestro sistema compone y estructura el diseño visual y los textos publicitarios de tu anuncio de forma experta.' },
            { num: '04', icon: '⬇️', title: 'Entrega en formato digital', desc: 'Descarga tu anuncio en alta resolución, sin marca de agua, listo para publicar (Tiempos de entrega máx. 24h).' },
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

      {/* ENTREGABLES */}
      <section className={styles.deliverablesSection}>
        <p className={styles.sectionTag}>Qué recibes</p>
        <h2 className={styles.sectionTitle}>Entregables del Servicio</h2>
        <div className={styles.deliverablesGrid}>
          <div className={styles.delivCard}>
            <span className={styles.delivIcon}>🖼️</span>
            <h3>Imagen Final Alta Resolución</h3>
            <p>Diseño finalizado en calidad máxima (PNG/JPG), optimizado para evitar compresión en redes.</p>
          </div>
          <div className={styles.delivCard}>
            <span className={styles.delivIcon}>📐</span>
            <h3>Formatos Oficiales</h3>
            <p>Recibe tu contenido dimensionado según las normas oficiales de las plataformas seleccionadas.</p>
          </div>
          <div className={styles.delivCard}>
            <span className={styles.delivIcon}>⏱️</span>
            <h3>Tiempos de Entrega</h3>
            <p>El diseño se procesa de forma digital para tu control y descarga, con una entrega garantizada de máximo 24 horas.</p>
          </div>
        </div>
      </section>

      {/* EJEMPLOS REALES */}
      <section className={styles.examplesSection}>
        <p className={styles.sectionTag}>Ejemplos Reales</p>
        <h2 className={styles.sectionTitle}>Calidad de Resultados</h2>
        <div className={styles.examplesGrid}>
          <div className={styles.exampleCard}>
            <span className={styles.exampleBadge}>Antes</span>
            <div className={styles.exampleImgPlaceholder}>
              <span style={{fontSize: '32px', marginBottom: '8px', display: 'block'}}>📸</span>
              Foto original del negocio sin procesar
            </div>
          </div>
          <div className={styles.exampleArrow}>→</div>
          <div className={styles.exampleCard}>
            <span className={styles.exampleBadge}>Después</span>
            <div className={styles.exampleImgPlaceholderDark}>
               <span style={{fontSize: '32px', marginBottom: '8px', display: 'block'}}>✨</span>
              Diseño publicitario profesional
            </div>
          </div>
        </div>
        <p className={styles.exampleDisclaimer}>*Ejemplos demostrativos de composiciones realizadas con nuestro flujo de trabajo.</p>
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
          <h2>¿Listo para mejorar la imagen de tu negocio?</h2>
          <p>Obtén diseños publicitarios impactantes de forma ágil y profesional.</p>
          <Link href="/crear" className="btn-primary" style={{fontSize:'18px', padding:'16px 36px'}}>
            Crear anuncio gratis →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerCol}>
            <span className={styles.logo}>SGIA</span>
            <p className={styles.footerDesc}>Diseño de anuncios publicitarios personalizados asistidos con IA.</p>
            <p className={styles.footerContact}>Atención al cliente: <strong>soporte@sgia-app.com</strong><br/>Respuesta habitual: 24 horas hábiles.</p>
          </div>
          <div className={styles.footerCol}>
            <h3 className={styles.footerTitle}>Legal</h3>
            <Link href="/terminos" className={styles.footerLink}>Términos y Condiciones</Link>
            <Link href="/reembolso" className={styles.footerLink}>Política de Reembolso</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} SGIA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
