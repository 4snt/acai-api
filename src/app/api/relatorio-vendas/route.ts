import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  // Total de vendas e valor total vendido
  const [res1]: any = await db.query(`
    SELECT COUNT(*) AS total_vendas, SUM(valor_total) AS valor_total_vendido FROM Venda
  `);
  const { total_vendas, valor_total_vendido } = res1[0];

  // Valor médio por venda
  const [res2]: any = await db.query(`
    SELECT AVG(valor_total) AS media_valor_venda FROM Venda
  `);
  const { media_valor_venda } = res2[0];

  // Produto mais vendido (quantidade)
  const [res3]: any = await db.query(`
    SELECT p.nome, SUM(vp.quantidade) AS total_vendida
    FROM Venda_Produto vp
    JOIN Produto p ON p.cod_produto = vp.cod_produto
    GROUP BY p.cod_produto
    ORDER BY total_vendida DESC
    LIMIT 1
  `);
  const produto_mais_vendido = res3[0];

  // Produto que mais gerou receita
  const [res4]: any = await db.query(`
    SELECT p.nome, SUM(vp.preco_vendido * vp.quantidade) AS receita_total
    FROM Venda_Produto vp
    JOIN Produto p ON p.cod_produto = vp.cod_produto
    GROUP BY p.cod_produto
    ORDER BY receita_total DESC
    LIMIT 1
  `);
  const produto_maior_receita = res4[0];

  return NextResponse.json({
    total_vendas,
    valor_total_vendido,
    media_valor_venda,
    produto_mais_vendido,
    produto_maior_receita
  });
}
