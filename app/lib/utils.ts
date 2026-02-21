export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === '-') return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function calcDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDaysRemainingColor(days: number): string {
  if (days < 0) return '#ef4444';
  if (days <= 5) return '#ef4444';
  if (days <= 30) return '#f59e0b';
  return '#22c55e';
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'Active':    return { bg: '#dcfce7', text: '#15803d' };
    case 'Trial':     return { bg: '#fef9c3', text: '#a16207' };
    case 'Expired':   return { bg: '#fee2e2', text: '#b91c1c' };
    case 'Cancelled': return { bg: '#f3f4f6', text: '#4b5563' };
    case 'Suspended': return { bg: '#ffedd5', text: '#c2410c' };
    case 'Inactive':  return { bg: '#f3f4f6', text: '#6b7280' };
    default:          return { bg: '#f3f4f6', text: '#6b7280' };
  }
}

export function numberWithCommas(n: number): string {
  return n.toLocaleString('en-NG');
}

export function truncate(str: string, len = 30): string {
  return str.length > len ? str.slice(0, len) + '…' : str;
}
