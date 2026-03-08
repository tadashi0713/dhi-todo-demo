import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM todos ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { title } = req.body as { title: string };
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  const result = await pool.query(
    'INSERT INTO todos (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body as { title?: string; completed?: boolean };
  const result = await pool.query(
    `UPDATE todos
     SET title = COALESCE($1, title),
         completed = COALESCE($2, completed)
     WHERE id = $3
     RETURNING *`,
    [title?.trim() ?? null, completed ?? null, id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  res.json(result.rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM todos WHERE id = $1 RETURNING id',
    [id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  res.status(204).send();
});

export default router;
