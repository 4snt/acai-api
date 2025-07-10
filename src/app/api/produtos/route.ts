import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const [rows] = await db.query('SELECT * FROM Produto');
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { nome, tipo, preco_custo, preco_venda } = body;

  await db.query(
    'INSERT INTO Produto (nome, tipo, preco_custo, preco_venda) VALUES (?, ?, ?, ?)',
    [nome, tipo, preco_custo, preco_venda]
  );

  return NextResponse.json({ message: 'Produto criado com sucesso' });
}
