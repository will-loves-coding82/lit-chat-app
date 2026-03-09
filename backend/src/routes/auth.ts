import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from '../db';
import 'dotenv/config';

export const authRouter = Router();
authRouter.post("/login", async(_req: Request, res: Response) => {
    console.log('Handling POST request /auth/login')
    try {
      const {email, password} = _req.body;
      const result = await pool.query(
        `SELECT * FROM lit_db.users WHERE email = $1`, [email]
      )
      const user = result.rows[0]
      if (!user) {
        return res.status(404).json({error: 'User does not exist'})
      }

      const passwordsMatch = await bcrypt.compare(password, user.password)
      if (passwordsMatch) {
        return res.status(401).json({error: 'Invalid credentials'})
      }

      const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET!, {algorithm: 'HS256', expiresIn: "1h"})
      res.json({token: token, user: user})
    } catch(err) {
      console.error(err)
      res.status(500).json({error: "Failed to login"})
    }
});

authRouter.post("/signup", async(_req: Request, res: Response) => {
  console.log('Handling POST request /auth/signup')

  try {
    const {first_name, last_name, email, password} = _req.body;
    const hash = bcrypt.hash(password, 12)
    const result = await pool.query(
      `INSERT INTO lit_db.users (first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING id`, [first_name, last_name, email, hash]
    )

    const user = result.rows[0]
    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET!, {algorithm: 'HS256', expiresIn: "1h"})
    console.log("Inserted user: ", user)
    res.json({token: token, user: user})
  } catch(err) {
    console.error(err)
    res.status(500).json({error: "Failed to sign up"})
  }
})


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({error: 'Unauthorized'})
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    next()
  } catch(error) {
    res.status(401).json({error: 'Invalid token'})
  }
}