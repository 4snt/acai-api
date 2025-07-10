import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { cod_cliente, cod_funcionario, produtos } = body;

  if (!cod_cliente || !cod_funcionario || !Array.isArray(produtos) || produtos.length === 0) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  // Calcular valor total
  const valor_total = produtos.reduce((acc: number, p: any) => {
    return acc + p.quantidade * p.preco_vendido;
  }, 0);

  // Data e hora atual
  const now = new Date();
  const data = now.toISOString().split('T')[0];
  const hora = now.toTimeString().split(' ')[0];

  // Inserir a venda
  const [result]: any = await db.query(
    `INSERT INTO Venda (data, hora, valor_total, cod_cliente, cod_funcionario)
     VALUES (?, ?, ?, ?, ?)`,
    [data, hora, valor_total, cod_cliente, cod_funcionario]
  );

  const cod_venda = result.insertId;

  // Inserir os produtos
  for (const item of produtos) {
    await db.query(
      `INSERT INTO Venda_Produto (cod_venda, cod_produto, quantidade, preco_vendido)
       VALUES (?, ?, ?, ?)`,
      [cod_venda, item.cod_produto, item.quantidade, item.preco_vendido]
    );
  }

  // SQL demonstrativo (opcional)
  const sqlInsert = `-- INSERT Venda:
INSERT INTO Venda (data, hora, valor_total, cod_cliente, cod_funcionario)
VALUES ('${data}', '${hora}', ${valor_total.toFixed(2)}, ${cod_cliente}, ${cod_funcionario});

-- INSERT Venda_Produto:
${produtos
  .map(
    (p) =>
      `INSERT INTO Venda_Produto (cod_venda, cod_produto, quantidade, preco_vendido) VALUES (${cod_venda}, ${p.cod_produto}, ${p.quantidade}, ${p.preco_vendido});`
  )
  .join('\n')}
`;

  return NextResponse.json({
    message: 'Venda registrada com sucesso',
    cod_venda,
    valor_total: valor_total.toFixed(2),
    sql: sqlInsert,
  });
}
