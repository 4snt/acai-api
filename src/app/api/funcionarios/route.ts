import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Listar todos os funcionários
export async function GET() {
  const [rows] = await db.query(`SELECT cod_funcionario, nome FROM Funcionario`);
  return NextResponse.json(rows);
}

// Criar novo funcionário
export async function POST(request: Request) {
  const { nome } = await request.json();

  if (!nome) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  await db.query(`INSERT INTO Funcionario (nome) VALUES (?)`, [nome]);

  const sql = `-- INSERT:\nINSERT INTO Funcionario (nome) VALUES ('${nome}');`;

  return NextResponse.json({ message: 'Funcionário criado com sucesso', sql });
}
