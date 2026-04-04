import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const SECRET = process.env.PAYPAL_SECRET!;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, anuncioId, userId, credits: requestedCredits } = await req.json();

    // Calculate credits from amount if not specified
    const getCreditsForAmount = (amount: string) => {
      const val = parseFloat(amount);
      if (val >= 25) return 15;
      if (val >= 10) return 5;
      return 1;
    };

    const accessToken = await getAccessToken();

    // Capture the payment
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok || captureData.status !== 'COMPLETED') {
      console.error('PayPal capture error:', captureData);
      return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 });
    }

    // Update anuncio to paid in Supabase
    if (anuncioId) {
      await supabaseAdmin
        .from('anuncios')
        .update({ pagado: true })
        .eq('id', anuncioId);
    }

    // Record payment in pagos table
    if (userId) {
      await supabaseAdmin.from('pagos').insert({
        user_id: userId,
        anuncio_id: anuncioId || null,
        monto: parseFloat(captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '3.00'),
        paypal_order_id: orderId,
        estado: 'completado',
      });

      // Add credits to user profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profile) {
        const paidAmount = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '3.00';
        const creditsToAdd = requestedCredits || getCreditsForAmount(paidAmount);
        await supabaseAdmin
          .from('profiles')
          .update({ credits: (profile.credits || 0) + creditsToAdd })
          .eq('id', userId);
      }
    }

    return NextResponse.json({
      success: true,
      captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    });
  } catch (error: any) {
    console.error('Capture order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
