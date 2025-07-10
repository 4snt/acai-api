import { db } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

const clientesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET': {
      const [rows] = await db.query('SELECT * FROM cliente');
      return res.status(200).json(rows);
    }
    case 'POST': {
      const { nome } = req.body;
      await db.query('INSERT INTO cliente (nome) VALUES (?)', [nome]);
      return res.status(201).json({ message: 'Cliente criado' });
    }
    default:
      return res.status(405).end();
  }
};

export default clientesHandler;
