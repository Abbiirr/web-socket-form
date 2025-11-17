/**
 * Authentication related type definitions
 */

export interface TokenResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
  tokenType?: string;
  token_type?: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface DecodedToken {
  exp: number;
  iat?: number;
  sub?: string;
  email?: string;
  user_id?: string;
  userId?: string;
  roles?: string[];
  [key: string]: any;
}

export interface UserInfo {
  email: string;
  userId: string;
  roles: string[];
  [key: string]: any;
}

export interface MagicLinkRequest {
  email: string;
  clientId: string;
  redirectUri: string;
}

export interface MagicLinkVerifyRequest {
  token: string;
  clientId: string;
}

export interface MagicLinkResponse {
  message: string;
  expiresIn?: number;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}
