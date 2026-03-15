import { apiClient, inventoryClient } from '../api-client';
import * as T from './auth.types';

export const authApi = {
  login: (dto: T.AdminLoginDto) => apiClient.post<T.AuthResponse>('/admin/auth/login', dto),
  inventoryLogin: (dto: T.AdminLoginDto) => inventoryClient.post<T.AuthResponse>('/admin/auth/login', dto),
};
