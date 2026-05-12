import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const sql = neon(process.env.DATABASE_URL);
    try {
        if (req.method === 'GET') {
            const data = await sql`SELECT * FROM presenca ORDER BY confirmado_em DESC`;
            return res.status(200).json(data);
        }
        if (req.method === 'POST') {
            const { nome } = req.body;
            await sql`INSERT INTO presenca (nome) VALUES (${nome})`;
            return res.status(201).json({ message: 'Confirmado' });
        }
        if (req.method === 'DELETE') {
            const { id } = req.query;
            await sql`DELETE FROM presenca WHERE id = ${id}`;
            return res.status(200).json({ message: 'Removido' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}