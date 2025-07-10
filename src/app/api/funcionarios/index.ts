import { db } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

const funcionariosHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET': {
      const [rows] = await db.query('SELECT * FROM funcionario');
      return res.status(200).json(rows);
    }
    case 'POST': {
      const { nome } = req.body;
      await db.query('INSERT INTO funcionario (nome) VALUES (?)', [nome]);
      return res.status(201).json({ message: 'Funcionário criado' });
    }
    default:
      return res.status(405).end();
  }
};

export default funcionariosHandler;