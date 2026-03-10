import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

export const messagesRouter = Router();

// GET /api/messages — fetch recent message history
messagesRouter.get('/messages/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || '50'), 200);
    const { rows } = await pool.query(
      'SELECT * FROM messages ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(rows.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

