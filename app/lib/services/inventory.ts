import { api } from '../api';
import type { Business, ChartDataPoint, FinanceTransaction } from '../types';

/**
 * Service for HelferAI Inventory Backend
 */
export const InventoryService = {
  async getBusinesses(): Promise<Business[]> {
    return api.get<any>('/admin/api/inventory/businesses').then(res => res.data || res);
  },

  async getBusinessById(id: string): Promise<Business | undefined> {
    return api.get<Business>(`/admin/api/inventory/businesses/${id}`);
  },

  async getDashboardKPIs(): Promise<any> {
    const data = await api.get<any>('/admin/api/inventory/dashboard/kpis');
    return {
      mrr: { label: 'MRR', value: `₦${(data.mrr.value / 1000000).toFixed(2)}M`, trend: data.mrr.trend, trendUp: data.mrr.trendUp },
      arr: { label: 'ARR', value: `₦${(data.arr.value / 1000000).toFixed(1)}M` },
      revenueToday: { value: `₦${(data.revenueToday.value / 1000).toFixed(0)}K`, trend: data.revenueToday.trend, trendUp: data.revenueToday.trendUp },
      revenueMonth: { value: `₦${(data.revenueMonth.value / 1000000).toFixed(2)}M`, trend: data.revenueMonth.trend, trendUp: data.revenueMonth.trendUp },
      arpu: { value: `₦${data.arpu.value.toLocaleString()}`, trend: data.arpu.trend, trendUp: data.arpu.trendUp },
      pendingRenewals: { value: `₦${(data.pendingRenewals.value / 1000000).toFixed(2)}M` },
    };
  },

  async getChartData(): Promise<{
    mrrTrend: ChartDataPoint[];
    monthlyRevenue: ChartDataPoint[];
    arpuTrend: ChartDataPoint[];
    renewalForecast: ChartDataPoint[];
  }> {
    const data = await api.get<any[]>('/admin/api/inventory/dashboard/charts');
    return {
      mrrTrend: data.map(d => ({ month: d.month, value: d.mrr })),
      monthlyRevenue: data.map(d => ({ month: d.month, value: d.revenue })),
      arpuTrend: data.map(d => ({ month: d.month, value: d.arpu })),
      renewalForecast: [], // Forecast still mock or separate endpoint in requirements
    };
  },

  async getFinanceData(): Promise<{
    transactions: FinanceTransaction[];
    revenueByPlan: { plan: string; value: number }[];
    paymentMethods: { method: string; count: number; amount: number; color: string }[];
    revenueOverTime: ChartDataPoint[];
  }> {
    const transactions = await api.get<FinanceTransaction[]>('/admin/api/inventory/finance/transactions');
    const charts = await api.get<any[]>('/admin/api/inventory/dashboard/charts');

    return {
      transactions,
      revenueByPlan: [], // Will be derived or mock until backend provides specific breakdown
      paymentMethods: [], // Will be derived or mock until backend provides specific breakdown
      revenueOverTime: charts.map(d => ({ month: d.month, value: d.revenue })),
    };
  },

  async getAIUsage(): Promise<any> {
    const data = await api.get<any>('/admin/api/inventory/ai/usage');
    return {
      stats: [
        { label: 'Total AI Predictions', value: data.totalPredictions.toLocaleString(), trend: '+22%', color: '#6c9e4e' },
        { label: 'Demand Forecasts Sent', value: data.forecastsSent.toLocaleString(), trend: '+18%', color: '#7c5cbf' },
        { label: 'Low Stock Alerts', value: data.lowStockAlerts.toLocaleString(), trend: '-4%', color: '#f59e0b' },
        { label: 'Avg AI Accuracy', value: data.avgAccuracy, trend: '+1.2%', color: '#22c55e' },
      ],
      usageByBusiness: data.usageByBusiness.map((b: any) => ({
        biz: b.biz,
        pred: b.pred,
        forecast: Math.round(b.pred * 0.2), // Derived
        alerts: Math.round(b.pred * 0.05), // Derived
        acc: b.acc,
        active: true
      })),
    };
  },

  async getBroadcastHistory(): Promise<any[]> {
    return api.get<any[]>('/admin/api/inventory/broadcasts/history');
  },

  async getReferralAnalytics(): Promise<any> {
    return api.get<any>('/admin/api/inventory/referrals/analytics');
  },

  async getIntegrations(): Promise<any[]> {
    return api.get<any[]>('/admin/api/inventory/integrations');
  },

  async getTestimonials(): Promise<any[]> {
    return api.get<any[]>('/admin/api/inventory/testimonials');
  },

  async getActivityLogs(): Promise<any[]> {
    return api.get<any[]>('/admin/api/inventory/activity-logs');
  },

  async getProducts(): Promise<any[]> {
    return api.get<any[]>('/admin/api/inventory/products');
  }
};


