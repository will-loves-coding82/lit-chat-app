import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { authMiddleware } from './auth.js';

export const usersRouter = Router();

usersRouter.get('/count', async (_req: Request, res: Response) => {
  console.log('Handling GET request /users/count')
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count from lit_db.users;'
    );
    const count = result.rows[0].count ?? 0;
    return res.json({ count: count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: `Failed to get total count of users: ${error}` })
  }
})


usersRouter.get('/search', authMiddleware, async (_req: Request, res: Response) => {
  console.log('Handling GET request /users/search')
  const searchQuery = _req.query["searchQuery"] as string;
  try {
    console.log("Searching with query: ", searchQuery)
    const result = await pool.query(
      `SELECT id, first_name, last_name, email FROM lit_db.users 
      WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 LIMIT 20`,
      [`%${searchQuery}%`]
    )

    const matches = result.rows
    return res.json({ matches: matches })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: `Failed to search for users by query ${searchQuery}: ${error}` })
  }
})