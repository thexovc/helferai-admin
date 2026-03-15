const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function createApiClient(baseUrl: string, tokenKey: string = 'adminToken') {
  async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token && token !== 'undefined' && token !== 'null') {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    const result = await response.json();
    return result.data ?? result;
  }

  return {
    get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  };
}

export const apiClient = createApiClient(BASE_URL, 'adminToken');

const INVENTORY_BASE_URL = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'http://localhost:3000/api'; // Using same fallback but can be different
export const inventoryClient = createApiClient(INVENTORY_BASE_URL, 'inventoryToken');
