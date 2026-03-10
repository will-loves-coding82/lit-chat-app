import { API_URL } from "./constants";
import { APIResponseError, GetUsersCountResponse, SearchUsersResponse } from "./types";


export async function getUsersCount(): Promise<GetUsersCountResponse> {
  try {
    const res = await fetch(`${API_URL}/users/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!res.ok) {
      const errorBody = JSON.parse(await res.text())
      return { error: new APIResponseError(errorBody.error, res.status), count: 0 }
    }
    
    const { count } = await res.json()
    return { error: null, count: count }
  }
  catch (error) {
    if (error instanceof Error) {
      return { error: new APIResponseError(error.message, 500), count: 0 }
    }
    return { error: new APIResponseError("An unexpected error occurred", 500), count: 0}
  }
}

export async function searchUsers(query: string): Promise<SearchUsersResponse> {
  try {
    const res = await fetch(`${API_URL}/users/search?searchQuery=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!res.ok) {
      const errorBody = JSON.parse(await res.text())
      return { error: new APIResponseError(errorBody.error, res.status), matches: [] }
    }

    const { matches } = await res.json()
    return { error: null, matches: matches }
  }
  catch (error) {
    if (error instanceof Error) {
      return { error: new APIResponseError(error.message, 500), matches: [] }
    }
    return { error: new APIResponseError("An unexpected error occurred", 500), matches: [] }
  }
}