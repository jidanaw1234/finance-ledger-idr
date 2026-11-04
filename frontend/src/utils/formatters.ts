export function formatIDR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatCompactIDR(amount: number): string {
  if (amount >= 1000000000) {
    return 'Rp ' + (amount / 1000000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (amount >= 1000000) {
    return 'Rp ' + (amount / 1000000).toFixed(1).replace('.0', '') + 'Jt';
  }
  if (amount >= 1000) {
    return 'Rp ' + (amount / 1000).toFixed(0) + 'Rb';
  }
  return formatIDR(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

