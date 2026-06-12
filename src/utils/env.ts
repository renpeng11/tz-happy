export const getEnv = (key: string, defaultValue?: string): string => {
  return import.meta.env[key] || defaultValue || '';
};

export const API_URL = getEnv('VITE_API_URL', '/api');

export const APP_ENV = getEnv('VITE_APP_ENV', 'development');