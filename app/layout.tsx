import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SGIA — Generador de Anuncios con IA",
  description: "Crea anuncios publicitarios con diseños profesionales asistidos por inteligencia artificial en minutos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;600;800&family=Outfit:wght@300;400;600;800&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
