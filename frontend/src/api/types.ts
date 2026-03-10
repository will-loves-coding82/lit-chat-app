export type User = {
  id: number
  first_name: string
  last_name: string
  email: string
}

export type MessageType = "user_joined" | "user_typing_start" | "user_typing_stop" | "user_left" | "message";

export const MESSAGE_TYPES: Record<string, MessageType> = {
  USER_JOINED: "user_joined",
  USER_TYPING_START: "user_typing_start",
  USER_TYPING_STOP: "user_typing_stop",
  USER_LEFT: "user_left",
  MESSAGE: "message"
};

export type SenderMessage = {
  type: MessageType;
  sender_id: number;
  sender_name: string;
  chat_id: number;
  content: string;
}

export type IncomingMessage = {
  id: number;
  type: MessageType;
  chat_id: number;
  sender_id: number;
  sender_mame: string;
  content: string;
  timestamp: string;
}

export type Message = {
  id: number
  content: string
  created_at: string
  sender_id: number
  first_name: string
  last_name: string
}

export type Chat = {
  id: number
  created_at: string
  recipient: User
}

export type AuthResponse = {
  error: APIResponseError | null
  user: User | null
  token: string | null
}

export type GetChatSummaryResponse = {
  error: APIResponseError | null
  chat: Chat | null
  members: User[]
}

export type GetChatMessagesResponse = {
  error: APIResponseError | null
  messages: IncomingMessage[]
}

export type GetUsersCountResponse = {
  error: APIResponseError | null
  count: number
}

export type SearchUsersResponse = {
  error: APIResponseError | null
  matches: User[]
}

export type GetAllChatsResponse = {
  error: APIResponseError | null
  chats: Chat[]
}

export type GetOrCreateChatResponse = {
  error: APIResponseError | null
  chat: Chat | null
}

export type GetMessagesResponse = {
  error: APIResponseError | null
  chats: Message[]
}

export class APIResponseError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.status = status
    this.name = 'ApiResponseError'
  }
}
