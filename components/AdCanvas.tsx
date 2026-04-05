'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AdCanvasProps {
  imageUrl: string;
  headline: string;
  copy: string;
  cta: string;
  tono: string;
  formato: string;
  onRendered: (dataUrl: string) => void;
}

export default function AdCanvas({ imageUrl, headline, copy, cta, tono, formato, onRendered }: AdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  // Dimensiones basadas en formato
  const getDimensions = () => {
    switch (formato) {
      case 'historia': return { width: 1080, height: 1920 };
      case 'banner': return { width: 1200, height: 628 };
      case 'instagram-post':
      default: return { width: 1080, height: 1080 };
    }
  };

  useEffect(() => {
    if (!imageUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getDimensions();
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = 'anonymous'; // IMPORTANTE para evitar problemas de CORS al exportar base64
    img.onload = () => {
      // 1. Dibujar Imagen de Fondo
      ctx.drawImage(img, 0, 0, width, height);

      // 2. Aplicar Plantilla según "tono"
      drawTemplate(ctx, width, height, tono);

      // 3. Notificar a parent
      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          setIsRendered(true);
          onRendered(dataUrl);
        } catch (e) {
          console.error("CORS / Canvas Export Error", e);
        }
      }, 500); // Pequeño retraso para asegurar que las fuentes web hayan cargado
    };
    img.onerror = () => {
      console.error("Error cargando la imagen para el Canvas.");
    };
    
    // Usamos el proxy para las imágenes de DALL-E para evadir restricciones de CORS del bucket remoto
    img.src = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;

  }, [imageUrl, headline, copy, cta, tono, formato]);

  // Función para envolver texto (Word Wrap)
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
  };

  const drawTemplate = (ctx: CanvasRenderingContext2D, w: number, h: number, style: string) => {
    // Restaurar estado
    ctx.restore();
    ctx.save();

    // Plantillas (Styles)
    if (style === 'Divertido' || style === 'Urgente') { // ESTILO BOLD / IMPACTO
      // Overlay oscuro degradado abajo
      const grad = ctx.createLinearGradient(0, h * 0.4, 0, h);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Headline
      ctx.font = '800 80px Anton, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      
      // Sombra fuerte
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      const lastY = wrapText(ctx, headline.toUpperCase(), w/2, h * 0.65, w * 0.85, 90);

      // Copy
      ctx.font = '600 32px Montserrat, sans-serif';
      ctx.fillStyle = '#ffcc00'; // Toque vibrante
      ctx.shadowBlur = 4;
      const copyY = wrapText(ctx, copy, w/2, lastY + 60, w * 0.8, 42);

      // CTA Box
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#ff3333'; // Botón Urgente
      const ctaW = 400;
      const ctaH = 80;
      ctx.fillRect(w/2 - ctaW/2, copyY + 60, ctaW, ctaH);
      
      ctx.font = '700 36px Montserrat, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(cta.toUpperCase(), w/2, copyY + 115);

    } else if (style === 'Elegante' || style === 'Profesional') { // ESTILO VINTAGE / DE LUJO
      // Marco
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, w - 80, h - 80);
      ctx.strokeRect(50, 50, w - 100, h - 100);

      // Panel superior
      ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
      ctx.fillRect(50, 50, w - 100, 280);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'italic 40px "Playfair Display", serif';
      ctx.fillText('— PRESENTING —', w/2, 120);

      ctx.font = '700 60px "Playfair Display", serif';
      ctx.fillStyle = '#d4af37'; // Dorado
      wrapText(ctx, headline, w/2, 180, w - 140, 70);

      // Panel inferior (Copy y CTA)
      const bottomH = 260;
      ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
      ctx.fillRect(50, h - 50 - bottomH, w - 100, bottomH);

      ctx.fillStyle = '#eeeeee';
      ctx.font = '400 30px Montserrat, sans-serif';
      wrapText(ctx, copy, w/2, h - 50 - bottomH + 60, w - 140, 42);

      // Línea divisora
      ctx.strokeStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(w/2 - 100, h - 150);
      ctx.lineTo(w/2 + 100, h - 150);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 34px "Playfair Display", serif';
      ctx.fillText(cta, w/2, h - 100);
      
    } else { // ESTILO MODERNO SPLIT
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      
      if (formato === 'banner') {
        // Caja texto izquierda
        ctx.fillRect(0, 0, w * 0.45, h);
        ctx.fillStyle = '#111';
        ctx.textAlign = 'left';
        ctx.font = '800 64px Outfit, sans-serif';
        const hy = wrapText(ctx, headline, 60, 150, w * 0.4 - 80, 75);
        ctx.font = '400 32px Inter, sans-serif';
        ctx.fillStyle = '#444';
        const cy = wrapText(ctx, copy, 60, hy + 60, w * 0.4 - 80, 45);
        
        ctx.fillStyle = '#28c840';
        ctx.fillRect(60, cy + 60, 300, 70);
        ctx.fillStyle = 'white';
        ctx.font = '600 28px Inter, sans-serif';
        ctx.fillText(cta, 210, cy + 105);
      } else {
        // Caja texto inferior (Post / Storie)
        const boxH = h * 0.4;
        ctx.fillRect(0, h - boxH, w, boxH);
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#111';
        ctx.font = '800 64px Outfit, sans-serif';
        const hy = wrapText(ctx, headline, w/2, h - boxH + 80, w * 0.85, 70);
        
        ctx.fillStyle = '#444';
        ctx.font = '400 34px Inter, sans-serif';
        const cy = wrapText(ctx, copy, w/2, hy + 40, w * 0.85, 45);

        ctx.fillStyle = '#000';
        ctx.fillRect(w/2 - 200, cy + 50, 400, 80);
        ctx.fillStyle = 'white';
        ctx.font = '600 30px Inter, sans-serif';
        ctx.fillText(cta, w/2, cy + 100);
      }
    }
    ctx.restore();
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          maxWidth: '100%', 
          maxHeight: '600px', 
          objectFit: 'contain',
          display: isRendered ? 'block' : 'none'
        }} 
      />
      {!isRendered && (
        <div style={{ padding: '60px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Renderizando diseño tipográfico...
        </div>
      )}
    </div>
  );
}
