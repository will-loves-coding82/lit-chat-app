import { API_URL } from "./constants"
import { APIResponseError, AuthResponse } from "./types"


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

    if (!res.ok) {
      const errorBody = JSON.parse(await res.text())
      return { error: new APIResponseError(errorBody.error, res.status), user: null, token: null}
    }

    const {token, user} = await res.json()
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    return {error: null, user: user, token: token}
  }
  catch(error) {
    return {error: new APIResponseError("An unexpected error occurred", 500), user: null, token: null}
  }
}


export async function signup(first_name: string, last_name: string, email: string, password: string) : Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({first_name, last_name, email, password})
    })

    if (!res.ok) {
      const errorBody = JSON.parse(await res.text())
      return { error: new APIResponseError(errorBody.error, res.status), user: null, token: null}
    }

    const { token, user } = await res.json();
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    return { error: null, user: user, token: token}

  } catch (error) { 
    return {error: new APIResponseError("An unexpected error occurred", 500), user: null, token: null}
  }
}