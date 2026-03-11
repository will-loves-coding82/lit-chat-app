import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from '../db';
import 'dotenv/config';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export const authRouter = Router();

authRouter.get("/validateToken", async(_req: Request, res: Response) => {
  console.log("Handling GET request /validateToken")
  const token = _req.headers.authorization?.split(' ')[1]
   if (!token) {
    return res.status(401).json({error: 'No token found'})
  }

  try {
     jwt.verify(token, process.env.JWT_SECRET!, function(err, decoded) {
      if (err) {
        console.log("error verifying token: ", err)
        return res.status(401).json({error: err.message})
      }
      res.json({token: token, message: "token is valid"})
    })
  } catch(error) {
      console.error(error)
      res.status(500).json({error: "Failed to validate token: " + error})
  }
})

authRouter.post("/login", async(_req: Request, res: Response) => {
    console.log('Handling POST request /auth/login')
    try {
      const {email, password} = _req.body;
      const result = await pool.query(
        `SELECT * FROM lit_db.users WHERE email = $1`, [email]
      )
      const user = result.rows[0] as User
      if (!user) {
        return res.status(404).json({error: 'User does not exist'})
      }

      const passwordsMatch = await bcrypt.compare(password, user.password)
      if (!passwordsMatch) {
        return res.status(401).json({error: 'Invalid credentials'})
      }

      console.log("Credentials are valid")
      const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET!, {algorithm: 'HS256', expiresIn: "1h"})
      const { password: _, ...userWithoutPassword } = user
      console.log(userWithoutPassword)
      res.json({token: token, user: userWithoutPassword})
    } catch(err) {
      console.error(err)
      res.status(500).json({error: "Failed to login: " + err})
    }
});

authRouter.post("/signup", async(_req: Request, res: Response) => {
  console.log('Handling POST request /auth/signup')

  try {
    const {first_name, last_name, email, password} = _req.body;
    const hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      `INSERT INTO lit_db.users (first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING id, first_name, last_name, email`, [first_name, last_name, email, hash]
    )
    const user = result.rows[0] as User
    const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET!, {algorithm: 'HS256', expiresIn: "1m"})
    res.json({token: token, user: user})
  } catch(err) {
    console.error(err)
    res.status(500).json({error: "Failed to sign up: " + err})
  }
})


export function authMiddleware(_req: Request, res: Response, next: NextFunction) {
  const token = _req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({error: 'No token found'})
  }

  jwt.verify(token, process.env.JWT_SECRET!, function(err, decoded) {
    if (err) {
      console.log("error verifying token: ", err)
      return res.status(401).json({error: err.message})
    }
    next()
  })
}