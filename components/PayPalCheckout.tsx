'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';

interface PayPalCheckoutProps {
  amount: string;
  anuncioId?: string;
  userId?: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

export default function PayPalCheckout({ amount, anuncioId, userId, onSuccess, onError }: PayPalCheckoutProps) {
  const [isPaying, setIsPaying] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return <p style={{ color: '#ff6b6b' }}>Error: PayPal no está configurado.</p>;
  }

  return (
    <PayPalScriptProvider options={{
      clientId,
      currency: 'USD',
      intent: 'capture',
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        {isPaying && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}>
            Procesando pago...
          </div>
        )}
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
            height: 45,
          }}
          createOrder={async () => {
            try {
              const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ anuncioId, amount }),
              });
              const data = await res.json();
              if (data.error) throw new Error(data.error);
              return data.orderId;
            } catch (err) {
              onError(err);
              throw err;
            }
          }}
          onApprove={async (data) => {
            setIsPaying(true);
            try {
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                  anuncioId,
                  userId,
                }),
              });
              const captureData = await res.json();
              if (captureData.error) throw new Error(captureData.error);
              onSuccess(captureData);
            } catch (err) {
              onError(err);
            } finally {
              setIsPaying(false);
            }
          }}
          onError={(err) => {
            console.error('PayPal error:', err);
            onError(err);
          }}
          onCancel={() => {
            console.log('Payment cancelled');
          }}
        />
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: '8px',
          opacity: 0.7,
        }}>
          🔒 Pago seguro con PayPal · Acepta tarjetas de crédito y débito
        </p>
      </div>
    </PayPalScriptProvider>
  );
}
