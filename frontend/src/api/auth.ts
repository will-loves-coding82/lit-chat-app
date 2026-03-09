import { API_URL } from "./constants"
import { AuthResponse } from "./types"


export async function login(email: string, password: string) : Promise<AuthResponse> {
  try {
    const res = await fetch(
      `${API_URL}/auth/login`, {
        method:'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
      }
    )

    if (res.status !== 200) {
      return {error: new Error("Something went wrong"), user: null, token: null}
    }

    const {token, user} = await res.json()
    localStorage.setItem('token', token)

    return {error: null, user: user, token: token}
  }
  catch(error) {
    if (error instanceof Error) {
      return {error: error, user: null, token: null}
    }
    return {error: new Error("An unexpected error occurred"), user: null, token: null}
  }
}


export async function signup(first_name: string, last_name: string, email: string, password: string) : Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({first_name, last_name, email, password})
    })

    const { token, user } = await res.json();
    localStorage.setItem('token', token)
    return { error: null, user: user, token: token}

  } catch (error) { 
    if (error instanceof Error) {
      return {error: error, user: null, token: null}
    }
    return {error: new Error("An unexpected error occurred"), user: null, token: null}
  }
}