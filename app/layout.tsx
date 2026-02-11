import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'ZapFlow - Robô de Atendimento Inteligente',
  description: 'Automatize seu atendimento com inteligência artificial. Respostas instantâneas, transcrição de áudio, processamento de imagens e muito mais.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg'
  },
  openGraph: {
    title: 'ZapFlow - Robô de Atendimento Inteligente',
    description: 'Automatize seu atendimento com inteligência artificial',
    images: ['/og-image.png']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
        <Script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </body>
    </html>
  );
}
