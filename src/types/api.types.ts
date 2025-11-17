/**
 * API related type definitions
 */

import { AxiosRequestConfig } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retry?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  clientId: string;
}

export interface LogoutRequest {
  token: string;
}
