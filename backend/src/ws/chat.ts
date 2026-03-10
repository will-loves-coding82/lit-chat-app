import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { pool } from '../db.js';

export type MessageType = "user_joined" | "user_typing_start" | "user_typing_stop" | "user_left" | "message";

const MESSAGE_TYPES: Record<string, MessageType> = {
  USER_JOINED: "user_joined",
  USER_TYPING_START: "user_typing_start",
  USER_TYPING_STOP: "user_typing_stop",
  USER_LEFT: "user_left",
  MESSAGE: "message"
};

type IncomingMessage = {
  type: MessageType;
  sender_id: number;
  sender_name: string;
  chat_id: number;
  content: string;
}

type ClientData = {
  id: number;
  name: string;
  chat_id: number;
  isTyping: boolean;
}

type BroadcastMessage = {
  id: number;
  type: MessageType;
  chat_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  timestamp: string;
}

const clients = new Map<WebSocket, ClientData>()
const rooms = new Map<number, Set<WebSocket>>()

function broadcastStatusToChatRoom(chat_id: number, message: BroadcastMessage): void {
  const room = rooms.get(chat_id)
  if (!room) return

  for (const client of room) {
    if (client.readyState !== WebSocket.OPEN) continue
    
    const clientData = clients.get(client)
    if (!clientData) continue
    if (clientData.id !== message.sender_id) {
      console.log("broadcasting status to recipient: ", clientData)
      client.send(JSON.stringify({ type: message.type, message: message}))
    }
  }
}

function broadcastMessageToChatRoom(ws: WebSocket, chat_id: number, message: BroadcastMessage): void {
  const room = rooms.get(chat_id)
  if (!room) return
  console.log("broadcasting message to all clients: ", message)
  for (const client of room) {
    console.log("sending message to client: ", client)
      if (client.readyState !== WebSocket.OPEN) continue
      client.send(JSON.stringify({ type: message.type, message: message}))
  }
}



export function attachWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    clients.set(ws, {
      id: -1,
      name: "",
      chat_id: -1,
      isTyping: false
    })

    ws.on('message', async (data) => {
      let msg: IncomingMessage;
      try {
        msg = JSON.parse(data.toString()) as IncomingMessage;
      } catch {
        ws.send(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const client = clients.get(ws);
      if (!client) {
        console.log("No client")
        ws.send(JSON.stringify({error: "No client found"}))
        return
      }

      client.name = msg.sender_name
      client.id = msg.sender_id
      client.chat_id = msg.chat_id
      client.isTyping = false

      switch(msg.type) {
        case "user_joined": 
          console.log("user joined")
          if (!rooms.has(msg.chat_id)) {
            rooms.set(msg.chat_id, new Set())
          }
          rooms.get(msg.chat_id)?.add(ws)
          const joinedMessage : BroadcastMessage = {
            id: -1,
            type: MESSAGE_TYPES.USER_JOINED,
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            content: `${msg.sender_name} joined`,
            timestamp: new Date().toISOString()
          }
          broadcastStatusToChatRoom(msg.chat_id, joinedMessage)
          return

        case "user_typing_start":
          client.isTyping = true
          const typingStartMessage : BroadcastMessage = {
            id: -1,
            type: MESSAGE_TYPES.USER_TYPING_START,
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            content: `${msg.sender_name} is typing...`,
            timestamp: new Date().toISOString()
          }
          broadcastStatusToChatRoom(msg.chat_id, typingStartMessage)
          return

        case "user_typing_stop":
          client.isTyping = false
          const typingStopMessage : BroadcastMessage = {
            id: -1,
            type: MESSAGE_TYPES.USER_TYPING_STOP,
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            content: `${msg.sender_name} stopped typing`,
            timestamp: new Date().toISOString()
          }
          broadcastStatusToChatRoom(msg.chat_id, typingStopMessage)
          return

        case "message":
          try {
            const result = await pool.query(
              `INSERT INTO lit_db.messages (content, sender_id, chat_id) VALUES ($1, $2, $3) RETURNING id, created_at`, [msg.content, msg.sender_id, msg.chat_id]
            )
            if (!result.rows[0]) {
              ws.send(JSON.stringify({error: "Could not insert message"}))
            }

            const actualMessage : BroadcastMessage = {
              id: result.rows[0].id,
              type: MESSAGE_TYPES.MESSAGE,
              chat_id: msg.chat_id,
              sender_id: msg.sender_id,
              sender_name: msg.sender_name,
              content: msg.content,
              timestamp: result.rows[0].created_at
            }
            broadcastMessageToChatRoom(ws, msg.chat_id, actualMessage)
            client.isTyping = false
          } catch (error) {
            console.error(error)
            ws.send(JSON.stringify({error: "Could not insert message"}))
          }
          return
        case "user_left":
          rooms.get(msg.chat_id)?.add(ws)
          const leftMessage : BroadcastMessage = {
            id: -1,
            type: MESSAGE_TYPES.USER_LEFT,
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            sender_name: msg.sender_name,
            content: `${msg.sender_name} left`,
            timestamp: new Date().toISOString()
          }
          broadcastStatusToChatRoom( msg.chat_id, leftMessage)
          return
      }
    });

    ws.on('close', () => {
      const client = clients.get(ws)
      if (client) {

        const chat_id = client.chat_id
        const room = rooms.get(chat_id)
        if (room) {
          room.delete(ws)
          const disconnectMessage : BroadcastMessage = {
            id: -1,
            type: MESSAGE_TYPES.USER_LEFT,
            chat_id: chat_id,
            sender_id: client.id,
            sender_name: client.name,
            content: `${client.name} left`,
            timestamp: new Date().toISOString()
          }
          broadcastStatusToChatRoom(chat_id, disconnectMessage)

          if (room.size === 0) {
            rooms.delete(chat_id);
          }
        }
        clients.delete(ws)
      }
    });
  });

  return wss;
}
