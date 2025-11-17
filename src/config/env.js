/**
 * Environment configuration
 * Centralizes all environment variables with validation
 */

const getEnvVar = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || defaultValue;
};

export const config = {
  api: {
    baseURL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080'),
    timeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'), 10),
  },
  oauth: {
    clientId: getEnvVar('VITE_OAUTH_CLIENT_ID', 'magic-link-client'),
    redirectUri: getEnvVar('VITE_OAUTH_REDIRECT_URI', 'http://localhost:3000/auth/callback'),
  },
  magicLink: {
    expiry: parseInt(getEnvVar('VITE_MAGIC_LINK_EXPIRY', '900000'), 10), // 15 minutes
  },
};

export default config;
