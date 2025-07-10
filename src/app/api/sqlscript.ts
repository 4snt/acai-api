import { promises as fs } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'data', 'script.sql');
  const fileContents = await fs.readFile(filePath, 'utf-8');
  res.status(200).json({ sql: fileContents });
}