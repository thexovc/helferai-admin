import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';
import * as T from './auth.types';

export const useAdminLogin = () => {
  return useMutation({
    mutationFn: (dto: T.AdminLoginDto) => authApi.login(dto),
    onSuccess: (data) => {
      localStorage.setItem('adminToken', data.access_token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
    },
  });
};

export const useInventoryLogin = () => {
  return useMutation({
    mutationFn: (dto: T.AdminLoginDto) => authApi.inventoryLogin(dto),
    onSuccess: (data) => {
      localStorage.setItem('inventoryToken', data.access_token);
      localStorage.setItem('inventoryUser', JSON.stringify(data.user));
    },
  });
};
