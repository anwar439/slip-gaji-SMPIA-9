/**
 * Indonesian Currency and Date formatting utilities
 */

export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID').format(amount);
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getMonthName(monthIndex: number): string {
  return INDONESIAN_MONTHS[monthIndex] || '';
}

export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = INDONESIAN_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

export function getPeriodLabel(periodKey: string): string {
  // periodKey is format "YYYY-MM" e.g. "2025-01"
  if (!periodKey || !periodKey.includes('-')) return periodKey;
  const [yearStr, monthStr] = periodKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthName = INDONESIAN_MONTHS[monthIdx] || monthStr;
  return `${monthName} ${yearStr}`;
}

export function calculatePercentage(part: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
}
