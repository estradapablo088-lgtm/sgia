import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const SECRET = process.env.PAYPAL_SECRET!;

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
    const body = await req.json();
    const { anuncioId, amount = '3.00' } = body;

    const accessToken = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount,
          },
          description: `SGIA - Anuncio HD #${anuncioId || 'nuevo'}`,
          custom_id: anuncioId || '',
        }],
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      console.error('PayPal create order error:', order);
      return NextResponse.json({ error: 'Error al crear orden de PayPal' }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
