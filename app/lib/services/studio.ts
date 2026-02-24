import { STUDIO_USERS, STUDIO_MRR_DATA, MONTHLY_REVENUE_DATA, ARPU_DATA, RENEWAL_FORECAST, TRYON_DATA, ROLE_DISTRIBUTION, STUDIO_FINANCE_TRANSACTIONS, STUDIO_REVENUE_BY_PLAN, STUDIO_PAYMENT_METHODS } from '../data';
import type { StudioUser, ChartDataPoint, KPIMetric, FinanceTransaction } from '../types';

/**
 * Service for HelferAI Studio Backend
 */
export const StudioService = {
  async getUsers(): Promise<StudioUser[]> {
    // Simulate API call to Studio Backend
    return STUDIO_USERS;
  },

  async getUserById(id: string): Promise<StudioUser | undefined> {
    return STUDIO_USERS.find(u => u.id === id);
  },

  async getDashboardKPIs(): Promise<any> {
    return {
      mrr: { label: 'MRR', value: '₦1.04M', trend: '+18%', trendUp: true },
      arr: { label: 'ARR', value: '₦12.5M' },
      revenueToday: { value: '₦95K', trend: '+11%', trendUp: true },
      revenueMonth: { value: '₦2.28M', trend: '+16%', trendUp: true },
      arpu: { value: '₦16,200', trend: '+8%', trendUp: true },
      totalApis: { value: '24' },
    };
  },

  async getChartData(): Promise<{
    mrrTrend: ChartDataPoint[];
    monthlyRevenue: ChartDataPoint[];
    arpuTrend: ChartDataPoint[];
    renewalForecast: ChartDataPoint[];
  }> {
    // Note: In real app, these would come from the Studio backend
    return {
        mrrTrend: STUDIO_MRR_DATA,
        monthlyRevenue: MONTHLY_REVENUE_DATA.map(d => ({ ...d, value: Math.floor(d.value * 0.28) })),
        arpuTrend: ARPU_DATA.map(d => ({ ...d, value: Math.floor(d.value * 0.45) })),
        renewalForecast: RENEWAL_FORECAST.map(d => ({ ...d, value: Math.floor(d.value * 0.30) })),
    };
  },

  async getAnalysisData(): Promise<{
    overview: any[];
    tryonCategories: any[];
    roleDistribution: any[];
    configuration: any;
  }> {
    return {
      overview: [
        { label: 'Total Try-Ons', value: '36.5K', icon: 'bar', color: '#7c5cbf' },
        { label: 'Active Endpoints', value: '18', icon: 'settings', color: '#6c9e4e' },
        { label: 'Models Trained', value: '42', icon: 'sliders', color: '#3b82f6' },
      ],
      tryonCategories: TRYON_DATA,
      roleDistribution: ROLE_DISTRIBUTION,
      configuration: {
        core: [
          { label: 'Image Engine', value: 'v2.4.1 Stable', bg: '#f0ebff', color: '#7c5cbf' },
          { label: 'Video Generator', value: 'v1.8 Beta', bg: '#eef2ff', color: '#3b82f6' },
          { label: 'Auto-Scaling', value: 'Active', bg: '#eaf4e3', color: '#6c9e4e' },
        ],
        health: [
          { label: 'API Latency', value: '124ms', color: '#22c55e' },
          { label: 'GPU Utilization', value: '68%', color: '#f59e0b' },
          { label: 'Error Rate', value: '0.04%', color: '#22c55e' },
        ]
      }
    };
  },

  async getFinanceData(): Promise<{
    transactions: FinanceTransaction[];
    revenueByPlan: { plan: string; value: number }[];
    paymentMethods: { method: string; count: number; amount: number; color: string }[];
    revenueOverTime: ChartDataPoint[];
  }> {
    return {
      transactions: STUDIO_FINANCE_TRANSACTIONS,
      revenueByPlan: STUDIO_REVENUE_BY_PLAN,
      paymentMethods: STUDIO_PAYMENT_METHODS,
      revenueOverTime: STUDIO_MRR_DATA,
    };
  }
};

