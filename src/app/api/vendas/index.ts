import { db } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

const vendasHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET': {
      const [rows] = await db.query('SELECT * FROM venda');
      return res.status(200).json(rows);
    }
    case 'POST': {
      const { data, hora, valor_total, cod_cliente, cod_funcionario } = req.body;
      await db.query(
        'INSERT INTO venda (data, hora, valor_total, cod_cliente, cod_funcionario) VALUES (?, ?, ?, ?, ?)',
        [data, hora, valor_total, cod_cliente, cod_funcionario]
      );
      return res.status(201).json({ message: 'Venda registrada' });
    }
    default:
      return res.status(405).end();
  }
};

export default vendasHandler;
