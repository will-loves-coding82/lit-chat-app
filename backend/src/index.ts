import 'dotenv/config';
import express, { Router } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { attachWebSocket } from './ws/message.js';
import { usersRouter } from './routes/users.js';
import { authRouter } from './routes/auth.js';
import { chatsRouter } from './routes/chats.js';

const app = express();
const allowedOrigins = ['https://lit-frontend-production.up.railway.app', 'http://localhost'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Required if you send cookies or Authorization headers
}));

app.use(express.json());

export const router = Router()
app.use('/auth/', authRouter);
app.use('/users/', usersRouter);
app.use('/chats/', chatsRouter);

const server = createServer(app);
attachWebSocket(server);

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});