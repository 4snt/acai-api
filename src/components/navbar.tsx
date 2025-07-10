'use client';

import Image from 'next/image';
import Link from 'next/link';
import logo from '../../public/logo.png';

export default function Navbar() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#3b0a45',
        padding: '1rem 2rem',
        color: 'white',
        borderRadius: '8px',
      }}
    >
      <Link href="/">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Image src={logo} alt="Logo" width={40} height={40} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>Açaí do Vale API</h1>
        </div>
      </Link>

      <ul style={{ display: 'flex', gap: '1.2rem', listStyle: 'none', margin: 0, padding: 0 }}>
        <li><Link href="/produtos">Produtos</Link></li>
        <li><Link href="/estoque">Estoque</Link></li>
        <li><Link href="/clientes">Clientes</Link></li>
        <li><Link href="/funcionarios">Funcionários</Link></li>
        <li><Link href="/vendas">Vendas</Link></li>
      </ul>
    </nav>
  );
}
