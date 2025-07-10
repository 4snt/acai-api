import { db } from '@/lib/db';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sqlFilePath = path.resolve(process.cwd(), 'data', 'script.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Divide o script em comandos separados por ";"
    const commands = sql.split(';').map(cmd => cmd.trim()).filter(cmd => cmd.length > 0);

    for (const command of commands) {
      await db.query(command);
    }

    res.status(200).json({ message: 'Script SQL executado com sucesso!' });
  } catch (error) {
    console.error('Erro ao executar script SQL:', error);
    res.status(500).json({ error: 'Erro ao executar script SQL' });
  }
}