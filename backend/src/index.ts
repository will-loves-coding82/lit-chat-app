import 'dotenv/config';
import express, { Router } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { attachWebSocket } from './ws/chat.js';
import { messagesRouter } from './routes/messages.js';
import { usersRouter } from './routes/users.js';
import { authRouter } from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

export const router = Router()
app.use('/api/messages/', messagesRouter);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const server = createServer(app);
attachWebSocket(server);

const PORT = process.env.PORT ?? 3000;

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});