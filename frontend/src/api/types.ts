export type User = {
  id: number
  first_name: string
  last_name: string,
  email: string
}

export type AuthResponse = {
  error: Error | null,
  user: User | null,
  token: string | null
}

export type GetUsersCountResponse = {
  error: Error | null,
  count: number
}