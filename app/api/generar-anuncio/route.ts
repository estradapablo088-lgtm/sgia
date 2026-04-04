import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const negocio    = formData.get('negocio') as string;
    const tipo       = formData.get('tipo') as string;
    const descripcion= formData.get('descripcion') as string;
    const oferta     = formData.get('oferta') as string;
    const publico    = formData.get('publico') as string;
    const tono       = formData.get('tono') as string;
    const formato    = formData.get('formato') as string;
    const extras     = formData.get('extras') as string;
    const imagenFiles = formData.getAll('imagenes') as File[];

    // Convertir imágenes a base64
    const imagesBase64: string[] = [];
    for (const file of imagenFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        imagesBase64.push(Buffer.from(bytes).toString('base64'));
      }
    }

    // ─── PASO 1: Analizar las imágenes con GPT-4o Vision ───
    let analisisImagen = '';
    if (imagesBase64.length > 0) {
      const imageContents: any[] = [
        { type: 'text', text: `Analiza estas ${imagesBase64.length} imagen(es) del negocio "${negocio}" (${tipo}). Describe TODO lo que ves con el mayor detalle posible: productos, colores, ambiente, decoración, estilo.` },
      ];
      // Agregar cada imagen al mensaje
      for (const b64 of imagesBase64) {
        imageContents.push({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${b64}`, detail: 'high' }
        });
      }

      const visionResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Eres un analista visual experto. Describe detalladamente lo que ves en las imágenes de un negocio. 
Incluye: colores predominantes, ambiente, tipo de establecimiento, productos visibles, decoración, estilo arquitectónico, 
iluminación, elementos de marca, tipo de comida si es restaurante, mobiliario, y cualquier detalle relevante.
Si hay varias imágenes, combina la información de todas.
Responde en español, solo la descripción, máximo 200 palabras.`
          },
          {
            role: 'user',
            content: imageContents
          }
        ],
        max_tokens: 400,
        temperature: 0.3,
      });
      analisisImagen = visionResponse.choices[0].message.content || '';
    }

    // ─── PASO 2: Generar copy publicitario ───
    const systemPrompt = `Eres un experto en copywriting publicitario para redes sociales en Latinoamérica. 
Tu trabajo es generar anuncios publicitarios que vendan, usando lenguaje natural y persuasivo.
Siempre respondes en español con JSON válido, sin texto adicional.`;

    const userPrompt = `Crea 3 variaciones de anuncio publicitario con estos datos:
- Negocio: ${negocio}
- Tipo: ${tipo}
- Lo que se promociona: ${descripcion}
- Oferta especial: ${oferta || 'ninguna'}
- Público objetivo: ${publico || 'público general'}
- Tono: ${tono}
- Formato: ${formato}
${extras ? `\n💬 INSTRUCCIONES ADICIONALES DEL USUARIO:\n${extras}\n\nES MUY IMPORTANTE que sigas estas instrucciones al pie de la letra.` : ''}
${analisisImagen ? `\n📸 ANÁLISIS DE LA FOTO DEL NEGOCIO:\n${analisisImagen}\n\nUSA esta descripción para inspirar el copy. Menciona detalles reales que viste en la foto (colores, ambiente, productos).` : ''}

Genera exactamente este JSON (sin texto antes ni después):
{
  "variaciones": [
    {
      "headline": "Titular impactante y creativo (máx 8 palabras, con emoji relevante)",
      "copy": "Texto persuasivo del anuncio (2-3 oraciones que conecten emocionalmente, mencionen lo que se ve en la foto)",
      "cta": "Llamada a la acción urgente (máx 5 palabras, con emoji)"
    }
  ],
  "descripcionImagen": "INSTRUCCIÓN PARA GENERAR IMAGEN: Crea una imagen publicitaria profesional que muestre [describe exactamente qué debe aparecer basándote en la foto real del negocio: productos, colores, ambiente]. Estilo: fotografía comercial de alta calidad, iluminación profesional, composición para ${formato === 'instagram-post' ? 'post cuadrado de Instagram' : formato === 'historia' ? 'historia vertical de Instagram' : 'banner web'}. Tono visual: ${tono}. NO incluir texto en la imagen. La imagen debe verse como una foto real profesional de un anuncio de ${tipo}."
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const rawText = completion.choices[0].message.content || '{}';
    let parsed: any = {};
    try {
      const clean = rawText.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { variaciones: [{ headline: '🎯 Anuncio generado', copy: rawText, cta: '¡Contáctanos!' }] };
    }

    // ─── PASO 3: Generar imagen con DALL-E 3 ───
    let imagenUrl: string | null = null;
    try {
      // Construir un prompt mucho más específico basado en la foto real
      let imgPrompt = parsed.descripcionImagen || '';
      
      if (!imgPrompt && analisisImagen) {
        imgPrompt = `Professional advertising photo for a ${tipo} called "${negocio}". 
Based on the actual business: ${analisisImagen}. 
Create a high-quality commercial photograph showing the products/services in an appetizing and attractive way.
Style: ${tono}, professional lighting, vibrant colors, ${formato === 'instagram-post' ? 'square composition' : formato === 'historia' ? 'vertical composition' : 'horizontal banner composition'}.
This should look like a real professional ad photo. Do NOT include any text or logos in the image.`;
      } else if (!imgPrompt) {
        imgPrompt = `Professional advertising photograph for a ${tipo} business called "${negocio}", promoting ${descripcion}. 
High quality commercial photography, ${tono} style, appetizing presentation, professional lighting, vibrant colors.
Composition for social media advertising. Do NOT include any text or logos.`;
      }

      // Asegurarnos de que el prompt no pide texto en la imagen
      imgPrompt += ' IMPORTANT: Do NOT render any text, letters, words, or typography in the image. Pure visual only.';

      const imgResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imgPrompt,
        size: formato === 'historia' ? '1024x1792' : formato === 'banner' ? '1792x1024' : '1024x1024',
        quality: 'hd',
        n: 1,
      });
      imagenUrl = imgResponse.data?.[0]?.url || null;
    } catch (imgErr) {
      console.warn('DALL-E falló, continuando sin imagen:', imgErr);
    }

    return NextResponse.json({
      variaciones: parsed.variaciones || [],
      imagenUrl,
    });

  } catch (error: any) {
    console.error('Error en /api/generar-anuncio:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
