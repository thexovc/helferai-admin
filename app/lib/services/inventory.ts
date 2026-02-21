import { BUSINESSES, MRR_DATA, MONTHLY_REVENUE_DATA, ARPU_DATA, RENEWAL_FORECAST } from '../data';
import type { Business, KPIMetric, ChartDataPoint } from '../types';

/**
 * Service for HelferAI Inventory Backend
 */
export const InventoryService = {
  async getBusinesses(): Promise<Business[]> {
    // Simulate API call to Inventory Backend
    return BUSINESSES;
  },

  async getBusinessById(id: string): Promise<Business | undefined> {
    return BUSINESSES.find(b => b.id === id);
  },

  async getDashboardKPIs(): Promise<any> {
    return {
      mrr: { label: 'MRR', value: '₦2.52M', trend: '+12%', trendUp: true },
      arr: { label: 'ARR', value: '₦30.2M' },
      revenueToday: { value: '₦380K', trend: '+8%', trendUp: true },
      revenueMonth: { value: '₦8.15M', trend: '+14%', trendUp: true },
      arpu: { value: '₦36,000', trend: '+6%', trendUp: true },
      pendingRenewals: { value: '₦2.45M' },
    };
  },

  async getChartData(): Promise<{
    mrrTrend: ChartDataPoint[];
    monthlyRevenue: ChartDataPoint[];
    arpuTrend: ChartDataPoint[];
    renewalForecast: ChartDataPoint[];
  }> {
    return {
      mrrTrend: MRR_DATA,
      monthlyRevenue: MONTHLY_REVENUE_DATA,
      arpuTrend: ARPU_DATA,
      renewalForecast: RENEWAL_FORECAST,
    };
  },

  async getAIUsage(): Promise<any> {
    return {
      stats: [
        { label: 'Total AI Predictions', value: '14,280', trend: '+22%', color: '#6c9e4e' },
        { label: 'Demand Forecasts Sent', value: '3,840', trend: '+18%', color: '#7c5cbf' },
        { label: 'Low Stock Alerts', value: '1,206', trend: '-4%', color: '#f59e0b' },
        { label: 'Avg AI Accuracy', value: '93.4%', trend: '+1.2%', color: '#22c55e' },
      ],
      usageByBusiness: [
        { biz: 'Konga Retail Ltd', pred: 4200, forecast: 840, alerts: 320, acc: '94.2%', active: true },
        { biz: 'Shoprite Nigeria', pred: 3100, forecast: 620, alerts: 180, acc: '92.8%', active: true },
        { biz: 'GlowUp Cosmetics', pred: 1890, forecast: 410, alerts: 95, acc: '91.5%', active: true },
        { biz: 'AgroFresh Farms', pred: 340, forecast: 68, alerts: 22, acc: '88.0%', active: false },
        { biz: 'SwiftPrint Hub', pred: 780, forecast: 156, alerts: 48, acc: '90.3%', active: true },
      ],
    };
  }
};
