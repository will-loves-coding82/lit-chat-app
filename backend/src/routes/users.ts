import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

export const usersRouter = Router();

usersRouter.get('/count', async(_req: Request, res: Response) => {
  console.log('Handling GET request /users/count')
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count from lit_db.users;'
    );
    const count = result.rows[0].count ?? 0;
    res.json({ count: count })
  } catch(err) {
    console.error(err)
    res.status(500).json({error: "Failed to fetch user count"})
  }
})

