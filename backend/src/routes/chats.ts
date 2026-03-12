import { Router, Request, Response } from 'express';
import { pool } from "../db";
import { authMiddleware } from './auth';

export const chatsRouter = Router();

// Gets all the chats that a user belongs to
chatsRouter.get('/all', authMiddleware, async (_req: Request, res: Response) => {
  console.log('Handling GET request /chats/all')
  const userId = _req.query["userId"] as string;

  try {
    const { rows: chatsRows } = await pool.query(
      `SELECT 
        c.id as id,
        c.created_at,
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email
        ) as recipient
      FROM lit_db.chats c
      JOIN lit_db.members m1 ON m1.chat_id = c.id AND m1.member_id = $1
      JOIN lit_db.members m2 ON m2.chat_id = c.id AND m2.member_id != $1
      JOIN lit_db.users u ON u.id = m2.member_id`,
      [userId]
    );

    return res.json({ chats: chatsRows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: `Failed to get all chats for user ${userId}: ${error}` })
  }
})

// Returns the chat data and members
chatsRouter.get('/:chatId/summary', authMiddleware, async(_req: Request, res:Response) => {
  console.log('Handling GET request /chats/summmary')
  const chatId = _req.params["chatId"] as string;

  try {
    const { rows: chatRows} = await pool.query(
      `SELECT * from lit_db.chats WHERE id = $1`, [chatId]
    );
    const { rows: memberRows } = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email FROM lit_db.members m JOIN lit_db.users u ON u.id = m.member_id WHERE m.chat_id = $1;`, [chatId]
    )
    console.log('membersResult rows:', memberRows);  // Debug output

    const chat = chatRows[0]
    const members = memberRows

    return res.json({ chat: chat, members: members })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: `Failed to fetch chat summary for chat ${chatId}: ${error}` })
  }
})

chatsRouter.get('/:chatId/messages/', authMiddleware, async (_req: Request, res: Response) => {
  const chatId = _req.params["chatId"] as string;
  console.log('Handling GET request /chats/:chatId/messages')

  try {
    const { rows } = await pool.query(
      'SELECT * FROM lit_db.messages WHERE chat_id = $1 ORDER BY created_at ASC', [chatId]
    );
    console.log("Messages: ", rows)
    res.json({messages: rows});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to fetch messages for chatId ${chatId}: ${error}` });
  }
});


chatsRouter.post('/create', authMiddleware, async (_req: Request, res: Response) => {
  console.log('Handling POST request /chats/find')
  const { userId, recipientId } = _req.body

  if (recipientId == userId) {
    return res.status(400).json({error: "Making a personal chat is not allowed"})
  }
  try {
    const { rows: chatRows } = await pool.query(
      `
        SELECT c.id from lit_db.chats c
        JOIN lit_db.members m1 ON m1.chat_id = c.id AND m1.member_id = $1
        JOIN lit_db.members m2 ON m2.chat_id = c.id AND m2.member_id = $2 
        LIMIT 1;
      `, [userId, recipientId]
    );

    if (chatRows.length > 0) {
      console.log(`Found existing chat for user ${userId} and recipient ${recipientId}: chat ${chatRows[0].id}`)
      return res.json({chatId: chatRows[0].id})
    }

    const { rows: insertRows } = await pool.query(
      `INSERT INTO lit_db.chats DEFAULT VALUES RETURNING *`
    )
    const chatId = insertRows[0].id
    await pool.query(
      `INSERT INTO lit_db.members (chat_id, member_id) VALUES($1, $2), ($1, $3)`,
      [chatId, userId, recipientId]
    )

    return res.json({chatId: insertRows[0].id})
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: `Failed to find or create chat: ${error}` })
  }
})

