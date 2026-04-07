import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

    // ─── PASO 2: Generar copy publicitario (Ahora usando Claude 3.5 Sonnet) ───
    const systemPrompt = `Eres un experto en copywriting publicitario para redes sociales en Latinoamérica. 
Tu trabajo es generar anuncios publicitarios que vendan, usando lenguaje natural, empático y MUY persuasivo. Evita clichés baratos y busca conectar genuinamente.
Siempre respondes estrictamente con un JSON válido, sin texto adicional antes ni después del bloque JSON.`;

    const userPrompt = `Crea 3 variaciones creativas y humanas de anuncio publicitario con estos datos:
- Negocio: ${negocio}
- Tipo: ${tipo}
- Lo que se promociona: ${descripcion}
- Oferta especial: ${oferta || 'ninguna'}
- Público objetivo: ${publico || 'público general'}
- Tono: ${tono}
- Formato: ${formato}
${extras ? `\n💬 INSTRUCCIONES ADICIONALES DEL USUARIO:\n${extras}\n\nES MUY IMPORTANTE que sigas estas instrucciones al pie de la letra.` : ''}
${analisisImagen ? `\n📸 ANÁLISIS DE LA FOTO REAL DEL NEGOCIO (para inspirarte):\n${analisisImagen}\n\nUsa esta descripción para que el copy mencione colores reales, el ambiente o producto específico que se vio en la foto.` : ''}

Genera exactamente este JSON vacío (respeta las llaves y formato y no agregues nada más que JSON):
{
  "variaciones": [
    {
      "headline": "Titular impactante corto (máx 8 palabras, con emoji relevante)",
      "copy": "Texto muy persuasivo y conversacional del anuncio (2-3 oraciones fluidas, que conecten emocionalmente)",
      "cta": "Llamada a la acción clara (máx 5 palabras, emoji)"
    }
  ],
  "descripcionImagen": "INSTRUCCIÓN PARA GENERAR IMAGEN: Si el estilo es Minimalista esta variable se ignora. En caso contrario, describe una fotografía comercial fotorrealista basada estrictamente en lo analizado del negocio. Prohibido mencionar dibujos, renders o estilos animados. Debe ser fotografía real."
}`;

    let rawText = '{}';
    let parsed: any = {};
    
    try {
      // Intentar primero con Claude
      const completion = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      rawText = ('text' in completion.content[0]) ? completion.content[0].text : '{}';
    } catch (anthropicError: any) {
      console.warn("Claude falló (posible falta de fondos), usando GPT-4o como respaldo:", anthropicError.message);
      // Fallback a OpenAI (GPT-4o) para que el anuncio se genere sí o sí
      const openaiCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      rawText = openaiCompletion.choices[0].message?.content || '{}';
    }

    try {
      const clean = rawText.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = { variaciones: [{ headline: '🎯 Anuncio generado', copy: rawText, cta: '¡Contáctanos!' }] };
    }

    // ─── PASO 3: Generar imagen o fondo con DALL-E 3 ───
    let imagenUrl: string | null = null;
    try {
      let imgPrompt = '';
      
      // Lógica Híbrida: Si el estilo es Collage / Minimalista, generamos SOLO un fondo vacío increíble
      if (tono === 'Minimalista') {
         imgPrompt = `CREATE EXACTLY THIS: An empty professional photography studio background or highly aesthetic minimalist surface fitting the vibe of a ${tipo} business called "${negocio}". 
Possible ideas: Clean white or pastel advertising stage, elegant dark marble, clean wood from above, or vibrant solid gradient with subtle spotlight.
IMPORTANT: PURE BACKGROUND ONLY. ABSOLUTELY NO OBJECTS. NO SUBJECTS. NO PEOPLE. NO FOOD. NO TEXT. EMPTY MINIMALIST CANVAS. Meticulously photorealistic, 8k resolution, shot with DSLR.`;
      } else {
        // Lógica tradicional de generación completa
        imgPrompt = parsed.descripcionImagen || '';
        if (!imgPrompt && analisisImagen) {
          imgPrompt = `Ultra-realistic professional photography for a ${tipo} called "${negocio}". 
Based on the actual business: ${analisisImagen}. 
Create a high-quality commercial photograph showing the products/services in a hyper-realistic, authentic way.
Style: RAW photography, shot on 35mm lens, realistic lighting, vibrant but natural colors, ${formato === 'instagram-post' ? 'square composition' : formato === 'historia' ? 'vertical composition' : 'horizontal banner composition'}.
This MUST look like a real professional photo, NOT a 3D render or animation.`;
        } else if (!imgPrompt) {
          imgPrompt = `Ultra-realistic professional photography for a ${tipo} business called "${negocio}", promoting ${descripcion}. 
High quality commercial photography, appetizing presentation, natural realistic lighting, vivid but authentic colors.
Composition for social media advertising. This MUST look like a real professional photo, absolutely NO 3D renders or illustrations.`;
        }
        imgPrompt += ' IMPORTANT: Meticulously photorealistic, 8k resolution, shot with DSLR. Absolutely NO 3D renders, NO cartoons, NO illustrations, NO digital art, NO typography, NO words, NO text. Pure photographic realism only.';
      }

      const imgResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imgPrompt,
        size: formato === 'historia' ? '1024x1792' : formato === 'banner' ? '1792x1024' : '1024x1024',
        quality: 'hd',
        style: 'natural',
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
