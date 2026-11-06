'use client';
import { useEffect } from 'react';

// Registers the service worker that makes the admin installable and shows push alerts
export default function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);
  return null;
}
