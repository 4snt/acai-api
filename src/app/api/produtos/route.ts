import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nome = searchParams.get('nome')?.toLowerCase() || '';
  const tipo = searchParams.get('tipo') || '';

  let sql = `SELECT * FROM Produto WHERE 1=1`;
  const params: any[] = [];

  if (nome) {
    sql += ' AND LOWER(nome) LIKE ?';
    params.push(`%${nome}%`);
  }

  if (tipo) {
    sql += ' AND tipo = ?';
    params.push(tipo);
  }

  const [produtos] = await db.query(sql, params);

  return NextResponse.json({ produtos, sql });
}

export async function POST(request: Request) {
  const { nome, tipo, preco_custo, preco_venda } = await request.json();

  const [result]: any = await db.query(
    `INSERT INTO Produto (nome, tipo, preco_custo, preco_venda) VALUES (?, ?, ?, ?)`,
    [nome, tipo, preco_custo, preco_venda]
  );

  const sql = `INSERT INTO Produto (nome, tipo, preco_custo, preco_venda) VALUES ('${nome}', '${tipo}', ${preco_custo}, ${preco_venda});`;

  return NextResponse.json({ message: 'Produto criado', sql });
}

export async function PUT(request: Request) {
  const { cod_produto, nome, tipo, preco_custo, preco_venda } = await request.json();

  await db.query(
    `UPDATE Produto SET nome = ?, tipo = ?, preco_custo = ?, preco_venda = ? WHERE cod_produto = ?`,
    [nome, tipo, preco_custo, preco_venda, cod_produto]
  );

  const sql = `UPDATE Produto SET nome = '${nome}', tipo = '${tipo}', preco_custo = ${preco_custo}, preco_venda = ${preco_venda} WHERE cod_produto = ${cod_produto};`;

  return NextResponse.json({ message: 'Produto atualizado', sql });
}

export async function DELETE(request: Request) {
  try {
    const { cod_produto } = await request.json();

    if (!cod_produto) {
      return NextResponse.json({ error: 'Código do produto não fornecido.' }, { status: 400 });
    }

    await db.query(`DELETE FROM Produto WHERE cod_produto = ?`, [cod_produto]);

    const sql = `DELETE FROM Produto WHERE cod_produto = ${cod_produto};`;

    return NextResponse.json({ message: 'Produto excluído', sql });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir produto.' }, { status: 500 });
  }
}
