import type { MetadataRoute } from 'next';

// Lets the admin be installed as an app (home screen / dock)
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Helfer Admin',
    short_name: 'Helfer Admin',
    description: 'HelferAI Admin Dashboard',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b1424',
    theme_color: '#0b1424',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
