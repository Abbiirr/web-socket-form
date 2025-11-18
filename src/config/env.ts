/**
 * Environment configuration
 * Centralizes all environment variables with validation
 */

interface ApiConfig {
  baseURL: string;
  verifyEndpoint: string;
  timeout: number;
}

interface WebSocketConfig {
  url: string;
  retryDelay: number;
  retryAttempts: number;
}

interface IntegrationConfig {
  platform: string;
  strategy: string;
  loginUrl: string;
}

interface Config {
  api: ApiConfig;
  websocket: WebSocketConfig;
  integration: IntegrationConfig;
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
    verifyEndpoint: getEnvVar('VITE_API_VERIFY_ENDPOINT', '/api/v1/common/private/integration/verify'),
    timeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'), 10),
  },
  websocket: {
    url: getEnvVar('VITE_WS_URL', 'ws://localhost:8080/ws/register'),
    retryDelay: parseInt(getEnvVar('VITE_WS_RETRY_DELAY', '30000'), 10),
    retryAttempts: parseInt(getEnvVar('VITE_WS_RETRY_ATTEMPTS', '3'), 10),
  },
  integration: {
    platform: getEnvVar('VITE_PLATFORM', 'jobstreet'),
    strategy: getEnvVar('VITE_STRATEGY', 'USERNAME_PASSWORD'),
    loginUrl: getEnvVar('VITE_LOGIN_URL', 'https://my.employer.seek.com/dashboard'),
  },
};

export default config;
