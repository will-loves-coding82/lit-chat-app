import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { pool } from '../db.js';

interface IncomingMessage {
  senderId: number;
  chatId: number;
  content: string;
}

export function attachWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcast(data: object): void {
    const payload = JSON.stringify(data);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    ws.on('message', async (raw) => {
      let msg: IncomingMessage;
      try {
        msg = JSON.parse(raw.toString()) as IncomingMessage;
      } catch {
        ws.send(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const { senderId, chatId, content } = msg;
      if (!content?.trim()) {
        ws.send(JSON.stringify({ error: 'content is required' }));
        return;
      }

      try {
        const { rows } = await pool.query(
          'INSERT INTO messages (sender_id, chat_id, content) VALUES ($1, $2, $3) RETURNING *',
          [senderId, chatId, content.trim()]
        );
        broadcast({ type: 'message', data: rows[0] });
      } catch (err) {
        console.error(err);
        ws.send(JSON.stringify({ error: 'Failed to save message' }));
      }
    });

    ws.on('close', () => console.log('Client disconnected'));
  });

  return wss;
}
