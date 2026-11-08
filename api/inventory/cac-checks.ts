import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryClient } from '../api-client';

export type CacStatus = 'checking' | 'auto_verified' | 'needs_review' | 'not_found' | 'error' | 'approved' | 'rejected';

export type CacCheck = {
    businessId: string;
    merchant: string;
    email: string | null;
    phone: string | null;
    regNumber: string;
    cacName: string | null;
    cacNumber: string | null;
    cacType: string | null;
    cacStatus: string | null;
    cacRegisteredAt: string | null;
    matchScore: number | null;
    status: CacStatus;
    note: string | null;
    checkedAt: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
};

export type CacChecksResponse = {
    success: boolean;
    ready: boolean;
    data: CacCheck[];
    counts: Partial<Record<CacStatus, number>>;
    unchecked: number;
    backfilling: boolean;
    meta: { total: number; page: number; per_page: number; last_page: number };
};

const URL = '/admin/api/inventory/cac-checks';
const KEY = ['admin-cac-checks'];

export const useCacChecks = (params: { status?: string; search?: string; page?: number; per_page?: number }) =>
    useQuery({
        queryKey: [...KEY, params],
        queryFn: () => {
            const q = new URLSearchParams();
            Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && q.set(k, String(v)));
            return inventoryClient.get<CacChecksResponse>(`${URL}?${q.toString()}`);
        },
        refetchInterval: 30 * 1000,
    });

export const useCacAction = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ businessId, action, note }: { businessId: string; action: 'approve' | 'reject' | 'recheck'; note?: string }) =>
            inventoryClient.post<any>(`${URL}/${businessId}/${action}`, note ? { note } : {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

export const useCheckAllCac = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => inventoryClient.post<any>(`${URL}/check-all`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
