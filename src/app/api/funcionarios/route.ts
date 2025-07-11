import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function formatSqlWithParams(sql: string, params: any[]) {
  let i = 0;
  return sql.replace(/\?/g, () => {
    const val = params[i++];
    if (typeof val === 'string') return `'${val}'`;
    return val;
  });
}

// Listar todos os funcionários
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nome = searchParams.get('nome')?.toLowerCase() || '';

  let sql = 'SELECT cod_funcionario, nome FROM Funcionario WHERE 1=1';
  const params: any[] = [];

  if (nome) {
    sql += ` AND LOWER(nome) LIKE ?`;
    params.push(`%${nome}%`);
  }

  const [rows] = await db.query(sql, params);

  const demonstrativo = `
-- SELECT:
${sql.replace(/\?/g, (_, i) => `'${params[i] || ''}'`)}
`.trim();

  return NextResponse.json({ data: rows, sql: demonstrativo });
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
