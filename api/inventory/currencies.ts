import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryClient } from '../api-client';

export type CurrencyRate = {
    code: string;
    name: string;
    symbol: string;
    base: string;
    market_rate: number | null;
    manual_rate: number | null;
    mid_rate: number | null;
    buy_rate: number | null;
    sell_rate: number | null;
    buy_margin: number;
    sell_margin: number;
    enabled: boolean;
    source: 'base' | 'manual' | 'market' | 'none';
    fetched_at: string | null;
    updated_at: string | null;
    updated_by: string | null;
};

export type CurrencyUpdate = {
    manual_rate?: number | null;
    buy_margin?: number;
    sell_margin?: number;
    enabled?: boolean;
};

const URL = '/admin/api/inventory/currencies';
const KEY = ['admin-currencies'];

export const useCurrencyRates = () =>
    useQuery({
        queryKey: KEY,
        queryFn: () => inventoryClient.get<CurrencyRate[]>(URL),
        refetchInterval: 5 * 60 * 1000,
    });

export const useUpdateCurrency = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ code, dto }: { code: string; dto: CurrencyUpdate }) =>
            inventoryClient.put<CurrencyRate>(`${URL}/${code}`, dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

export const useRefreshRates = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => inventoryClient.post<CurrencyRate[]>(`${URL}/refresh`),
        onSuccess: (data) => qc.setQueryData(KEY, data),
    });
};
