import { Outfit } from 'next/font/google';
import type { Viewport } from 'next';
import './globals.css';
import './extra.css'
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

// 💡 Sin esto, Next fija el viewport pero deja el zoom bloqueado en algunos
// navegadores: en pantallas pequeñas el usuario necesita poder ampliar una tabla
// o un formulario sin que se le corte el contenido.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
