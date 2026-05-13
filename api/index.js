const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Banco Neon (A URL virá das variáveis de ambiente da Vercel)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Criar tabela se não existir (Executa na primeira chamada)
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS convidados (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL
    )
  `);
};
initDb();

// Rota para salvar presença
app.post('/api/presenca', async (req, res) => {
  const { nome } = req.body;
  try {
    await pool.query('INSERT INTO convidados (nome) VALUES ($1)', [nome]);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para o Admin ver a lista
app.get('/api/presenca', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM convidados ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para o Admin atualizar um nome
app.put('/api/presenca', async (req, res) => {
  const { id, nome } = req.body;
  if (!id || !nome) {
    return res.status(400).json({ error: 'ID e nome são obrigatórios.' });
  }
  try {
    await pool.query('UPDATE convidados SET nome = $1 WHERE id = $2', [nome, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para o Admin deletar
app.delete('/api/presenca', async (req, res) => {
  const { id } = req.query;
  try {
    await pool.query('DELETE FROM convidados WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;