import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Buscar um cliente pelo ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  const [rows]: any = await db.query(`SELECT cod_cliente, nome FROM Cliente WHERE cod_cliente = ?`, [id]);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

// Atualizar um cliente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { nome } = await request.json();
  const id = Number(params.id);

  if (!nome) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  await db.query(`UPDATE Cliente SET nome = ? WHERE cod_cliente = ?`, [nome, id]);

  const sql = `-- UPDATE:\nUPDATE Cliente SET nome = '${nome}' WHERE cod_cliente = ${id};`;

  return NextResponse.json({ message: 'Cliente atualizado com sucesso', sql });
}

// Excluir um cliente
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  await db.query(`DELETE FROM Cliente WHERE cod_cliente = ?`, [id]);

  const sql = `-- DELETE:\nDELETE FROM Cliente WHERE cod_cliente = ${id};`;

  return NextResponse.json({ message: 'Cliente excluído com sucesso', sql });
}
