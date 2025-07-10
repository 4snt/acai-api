import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import path from 'path';

export async function POST(req: Request) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true,
  });

  const sqlFile = await fs.readFile(path.join(process.cwd(), 'data', 'delete.sql'), 'utf8');

  try {
    await connection.query(sqlFile);
    await connection.end();
    return new Response(JSON.stringify({ message: 'Tabelas deletadas com sucesso!', sql: sqlFile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
