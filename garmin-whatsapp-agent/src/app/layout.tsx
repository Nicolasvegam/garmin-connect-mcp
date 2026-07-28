import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Garmin WhatsApp Agent',
  description: 'Tu asistente de Garmin Connect por WhatsApp, con tu suscripcion de Claude',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
