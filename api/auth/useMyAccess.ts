'use client';
import { useQuery } from '@tanstack/react-query';
import { inventoryClient } from '@/api/api-client';

export type MyAccess = { id: string; name: string; email: string; role: string; isSuperAdmin: boolean; pages: string[] };

// Page key of an admin path: /inventory/finance/... -> "finance"
export const pageKeyOf = (path: string) => path.replace(/^\/inventory\/?/, '').split('/')[0] || 'dashboard';

// The signed-in admin and the admin pages their role can open
export function useMyAccess() {
    const q = useQuery({
        queryKey: ['admin-auth', 'me'],
        queryFn: () => inventoryClient.get<MyAccess>('/admin/auth/me'),
        staleTime: 60_000,
    });
    const canOpen = (key: string) => !q.data || q.data.isSuperAdmin || q.data.pages.includes(key);
    return { ...q, me: q.data, canOpen };
}
