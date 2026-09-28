const configuredApiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

export const API_ORIGIN = configuredApiUrl.replace(/\/api\/v1$/i, '');
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;