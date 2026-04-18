/**
 * Utility functions for Indonesian localization of currency and dates.
 */

/**
 * Formats a number or string as Indonesian Rupiah (IDR).
 * @param amount The amount to format
 * @returns Formatted currency string, e.g., "Rp 1.000.000"
 */
export const formatCurrencyID = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formats an ISO date string or Date object to Indonesian format DD-MM-YYYY.
 * @param date Input date (ISO string, Date object, or timestamp)
 * @returns Formatted date string, e.g., "31-12-2024"
 */
export const formatDateID = (date: string | Date | number | undefined | null): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Formats an ISO date string to Indonesian Month Year format.
 * @param period ISO string or similar
 * @returns e.g., "April 2024"
 */
export const formatPeriodID = (period: string | undefined | null): string => {
  if (!period) return '-';
  
  const d = new Date(period);
  if (isNaN(d.getTime())) return period; // Fallback to raw string if not a date

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return `${months[d.getMonth()]} ${d.getFullYear()}`;
};
