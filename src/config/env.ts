/**
 * Environment configuration
 * Centralizes all environment variables with validation
 */

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

interface Config {
  api: ApiConfig;
  websocket: WebSocketConfig;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || defaultValue;
};

export const config: Config = {
  api: {
    baseURL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080'),
    timeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'), 10),
  },
  websocket: {
    url: getEnvVar('VITE_WS_URL', 'ws://localhost:8080/ws'),
    reconnectInterval: 3000, // 3 seconds
    maxReconnectAttempts: 5,
  },
};

export default config;
