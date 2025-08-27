export interface AuthUser {
  id: string
  email?: string
  phone?: string
  app_metadata: {
    provider?: string
    [key: string]: any
  }
  user_metadata: {
    full_name?: string
    avatar_url?: string
    [key: string]: any
  }
  aud: string
  created_at: string
  updated_at?: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  token_type: string
  user: AuthUser
}

export interface SignUpRequest {
  email: string
  password: string
  metadata?: Record<string, any>
}

export interface SignInRequest {
  email: string
  password: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface UpdatePasswordRequest {
  password: string
}

export interface UpdateProfileRequest {
  data: Record<string, any>
}

export interface AuthResponse {
  message: string
  user?: AuthUser
  session?: AuthSession
  error?: string
} 