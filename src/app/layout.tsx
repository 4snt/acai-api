import { Inter } from 'next/font/google';
import { NavbarWrapper } from '../components/NavbarWrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Açaí do Vale',
  description: 'Gerenciador da sorveteria Açaí do Vale',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}
