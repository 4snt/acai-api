import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nome = searchParams.get('nome')?.toLowerCase() || '';
  const tipo = searchParams.get('tipo') || '';

  let sql = `
    SELECT e.cod_estoque, e.cod_produto, p.nome, p.tipo, e.tipo AS tipo_estoque, e.quantidade
    FROM Estoque e
    JOIN Produto p ON e.cod_produto = p.cod_produto
    WHERE 1=1
  `;
  const params: any[] = [];

  if (nome) {
    sql += ' AND LOWER(p.nome) LIKE ?';
    params.push(`%${nome}%`);
  }

  if (tipo) {
    sql += ' AND e.tipo = ?';
    params.push(tipo);
  }

  const [rows] = await db.query(sql, params);
  return NextResponse.json({
    produtos: rows,
    sql: db.format(sql, params),
  });
}

export async function POST(request: Request) {
  let { cod_produto, tipo, quantidade } = await request.json();

  if (!cod_produto || !tipo || quantidade == null) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  quantidade = Number(quantidade);

  const [rows]: any = await db.query(
    `SELECT cod_estoque, quantidade FROM Estoque WHERE cod_produto = ? AND tipo = ?`,
    [cod_produto, tipo]
  );

  if (rows.length > 0) {
    const estoqueExistente = rows[0];
    const novaQuantidade = estoqueExistente.quantidade + quantidade;

    await db.query(
      `UPDATE Estoque SET quantidade = ? WHERE cod_estoque = ?`,
      [novaQuantidade, estoqueExistente.cod_estoque]
    );

    const sqlUpdate = `-- UPDATE:\nUPDATE Estoque SET quantidade = ${novaQuantidade.toFixed(2)} WHERE cod_estoque = ${estoqueExistente.cod_estoque};`;

    return NextResponse.json({
      message: 'Quantidade atualizada',
      sql: sqlUpdate,
    });
  } else {
    await db.query(
      `INSERT INTO Estoque (cod_produto, tipo, quantidade) VALUES (?, ?, ?)`,
      [cod_produto, tipo, quantidade]
    );

    const sqlInsert = `-- INSERT:\nINSERT INTO Estoque (cod_produto, tipo, quantidade)\nVALUES (${cod_produto}, '${tipo}', ${quantidade});`;

    return NextResponse.json({
      message: 'Estoque criado',
      sql: sqlInsert,
    });
  }
}

export async function DELETE(request: Request) {
  const { cod_estoque } = await request.json();

  await db.query(`DELETE FROM Estoque WHERE cod_estoque = ?`, [cod_estoque]);

  return NextResponse.json({
    message: 'Estoque removido',
    sql: `-- DELETE:\nDELETE FROM Estoque WHERE cod_estoque = ${cod_estoque};`,
  });
}
