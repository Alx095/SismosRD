'use client';

import { useEffect } from 'react';

/* helper para convertir la VAPID pública */
function urlBase64ToUint8Array(base64: string) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const data = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(data);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export default function PushInit() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    (async () => {
      console.log('✔ Registrando SW…');
      const reg = await navigator.serviceWorker.register('/worker.js');

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        console.log('✔ Suscripción ya existente');
        return;
      }

      const vapid = process.env.NEXT_PUBLIC_VAPID_KEY!;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid)
      });

      console.log('✔ Suscrito, enviando al backend…', sub);
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });
    })().catch(err => console.error('❌ Push init error', err));
  }, []);

  return null; // no pinta nada
}
