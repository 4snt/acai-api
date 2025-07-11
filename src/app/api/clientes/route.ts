import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Listar todos os clientes
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filtros = searchParams.get('filtros') || '';

  const sql = `
SELECT cod_cliente, nome FROM Cliente
WHERE nome LIKE '%${filtros}%'
`.trim();

  const [rows] = await db.query(
    `SELECT cod_cliente, nome FROM Cliente WHERE nome LIKE ?`,
    [`%${filtros}%`]
  );

  return NextResponse.json({ data: rows, sql });
}

// Criar um novo cliente
export async function POST(request: Request) {
  const { nome } = await request.json();

  if (!nome) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  await db.query(`INSERT INTO Cliente (nome) VALUES (?)`, [nome]);

  const sql = `-- INSERT:\nINSERT INTO Cliente (nome) VALUES ('${nome}');`;

  return NextResponse.json({ message: 'Cliente criado com sucesso', sql });
}