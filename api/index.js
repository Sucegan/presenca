import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Conecta ao banco usando a variável de ambiente do Vercel
    const sql = neon(process.env.DATABASE_URL);

    try {
        // LISTAR CONVIDADOS (Usado no admin.html)
        if (req.method === 'GET') {
            const guests = await sql`SELECT id, nome, acompanhantes FROM convidados ORDER BY data_registro DESC`;
            return res.status(200).json(guests);
        }
        
        // SALVAR NOVO CONVIDADO (Usado no index.html)
        else if (req.method === 'POST') {
            const { nome, companionNames } = req.body;
            const jsonAcompanhantes = JSON.stringify(companionNames || []);
            
            await sql`INSERT INTO convidados (nome, acompanhantes) VALUES (${nome}, ${jsonAcompanhantes})`;
            return res.status(201).json({ message: 'Convidado salvo com sucesso!' });
        }
        
        // APAGAR CONVIDADO (Usado no admin.html)
        else if (req.method === 'DELETE') {
            const { id } = req.body;
            await sql`DELETE FROM convidados WHERE id = ${id}`;
            return res.status(200).json({ message: 'Convidado removido!' });
        }
        
        // MÉTODO NÃO RECONHECIDO
        else {
            return res.status(405).json({ message: 'Método não permitido' });
        }

    } catch (error) {
        console.error("Erro no Banco de Dados:", error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}