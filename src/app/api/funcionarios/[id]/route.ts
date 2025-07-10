import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Buscar funcionário por ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [rows]: any = await db.query(
    `SELECT cod_funcionario, nome FROM Funcionario WHERE cod_funcionario = ?`,
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

// Atualizar funcionário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { nome } = await request.json();

  if (!nome) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  await db.query(`UPDATE Funcionario SET nome = ? WHERE cod_funcionario = ?`, [nome, id]);

  const sql = `-- UPDATE:\nUPDATE Funcionario SET nome = '${nome}' WHERE cod_funcionario = ${id};`;

  return NextResponse.json({ message: 'Funcionário atualizado com sucesso', sql });
}

// Excluir funcionário
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  await db.query(`DELETE FROM Funcionario WHERE cod_funcionario = ?`, [id]);

  const sql = `-- DELETE:\nDELETE FROM Funcionario WHERE cod_funcionario = ${id};`;

  return NextResponse.json({ message: 'Funcionário excluído com sucesso', sql });
}
