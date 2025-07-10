import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
// Demosntração de select
export async function GET() {
  const [rows] = await db.query(`
    SELECT e.cod_estoque, e.cod_produto, p.nome, p.tipo, e.tipo AS tipo_estoque, e.quantidade
    FROM Estoque e
    JOIN Produto p ON e.cod_produto = p.cod_produto
  `);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { cod_produto, tipo, quantidade } = await request.json();

  if (!cod_produto || !tipo || quantidade == null) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  // Verifica se já existe esse estoque
  const [rows]: any = await db.query(
    `SELECT cod_estoque, quantidade FROM Estoque WHERE cod_produto = ? AND tipo = ?`,
    [cod_produto, tipo]
  );

  if (rows.length > 0) {
    // Já existe → atualiza a quantidade
    const estoqueExistente = rows[0];
    const novaQuantidade = estoqueExistente.quantidade + quantidade;

    await db.query(
      `UPDATE Estoque SET quantidade = ? WHERE cod_estoque = ?`,
      [novaQuantidade, estoqueExistente.cod_estoque]
    );

    const sqlUpdate = `-- UPDATE:
UPDATE Estoque SET quantidade = ${novaQuantidade.toFixed(2)} WHERE cod_estoque = ${estoqueExistente.cod_estoque};`;

    return NextResponse.json({
      message: 'Quantidade atualizada',
      sql: sqlUpdate,
    });
  } else {
    // Não existe → insere novo
    await db.query(
      `INSERT INTO Estoque (cod_produto, tipo, quantidade) VALUES (?, ?, ?)`,
      [cod_produto, tipo, quantidade]
    );

    const sqlInsert = `-- INSERT:
INSERT INTO Estoque (cod_produto, tipo, quantidade)
VALUES (${cod_produto}, '${tipo}', ${quantidade});`;

    return NextResponse.json({
      message: 'Estoque criado',
      sql: sqlInsert,
    });
  }
}
