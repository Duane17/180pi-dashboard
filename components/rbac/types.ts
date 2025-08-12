export type Role = "admin" | "member" | "viewer"

export interface Permission {
  id: string
  name: string
  description?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  permissions?: string[]
  avatarUrl?: string
}

export interface AuthzContext {
  user: User | null
  isLoading: boolean
}
