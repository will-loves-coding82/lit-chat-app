import { API_URL } from "./constants";
import { GetUsersCountResponse } from "./types";


export async function getUsersCount() : Promise<GetUsersCountResponse> {
  try {
    const res = await fetch(`${API_URL}/users/count`, {
      method:'GET', 
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      return {error: new Error("Something went wrong"), count: 0}
    }

    const { count } = await res.json()
    return {error: null, count: count}
  }
  catch(error) {
    if (error instanceof Error) {
      return {error: error, count: 0}
    }
    return {error: new Error("An unexpected error occurred"), count: 0}
  }
}