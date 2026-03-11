import { API_URL } from "./constants"
import { APIResponseError, GetChatSummaryResponse, GetAllChatsResponse, GetOrCreateChatResponse, GetChatMessagesResponse } from "./types"

export async function getAllsChatsForUser(userId: number) : Promise<GetAllChatsResponse> {
  try {
    const res = await fetch(
      `${API_URL}/chats/all?userId=${userId}`, {
        method:'GET', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    })

    if (!res.ok) {
      const errorBody = JSON.parse(await res.text())
      return { error: new APIResponseError(errorBody.error, res.status), chats: [] }
    }

    const { chats } = await res.json()
    return { error: null, chats: chats }
  }
  catch(error) {
    return {error: new APIResponseError("An unexpected error occurred", 500), chats: []}
  }
}

export async function getOrCreateChat(userId: number, recipientId: number) : Promise<GetOrCreateChatResponse> {
  try {
    const res = await fetch(
      `${API_URL}/chats/findOrCreate`, {
        method:'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({userId: userId, recipientId: recipientId})
    })

    if (!res.ok) {
      const errorBody = JSON.parse(await res.text())
      return { error: new APIResponseError(errorBody.error, res.status), chat: null}
    }

    const { chat } = await res.json()
    return { error: null, chat: chat}
  }
  catch(error) {
    return {error: new APIResponseError("An unexpected error occurred", 500), chat: null}
  }
}

export async function getChatSummary(chatId: string) : Promise<GetChatSummaryResponse> {
  try {
    const res = await fetch(
      `${API_URL}/chats/${chatId}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    })

    if (!res.ok) {
      const errorBody = JSON.parse(await res.text())
      return { error: new APIResponseError(errorBody.error, res.status), chat: null, members: [] }
    }

    const { chat, members } = await res.json()
    return { error: null, chat: chat, members: members }
  }
  catch (error) {
    return { error: new APIResponseError("An unexpected error occurred", 500), chat: null, members: [] }
  }
}

export async function getChatMessages(chatId: string) : Promise<GetChatMessagesResponse> {
  try {
    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!res.ok) {
      const errorBody = JSON.parse(await res.text())
      return {error: new APIResponseError(errorBody.error, res.status), messages: []}
    }
    const { messages } = await res.json()
    return {error: null, messages: messages}
  } catch(error) {
return { error: new APIResponseError("An unexpected error occurred", 500), messages: [] }
  }
}