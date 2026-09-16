/**
 * Formatting utilities for Indian Rupees (₹ Cr / Lakh / K), percentages, and dates.
 * Strictly guarantees that NaN, Infinity, or undefined are never displayed to the user.
 */

export function formatCurrency(
  val: number | null | undefined,
  currency = 'INR',
  compact = true
): string {
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  if (val === null || val === undefined || isNaN(val)) {
    return `${sym}0`;
  }

  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (currency === 'INR') {
    if (compact) {
      if (absVal >= 10000000) {
        return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
      } else if (absVal >= 100000) {
        return `${sign}₹${(absVal / 100000).toFixed(2)} L`;
      } else if (absVal >= 1000) {
        return `${sign}₹${(absVal / 1000).toFixed(1)}k`;
      }
    }
    return `${sign}₹${absVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  } else {
    // International standard format (USD, EUR, GBP)
    if (compact) {
      if (absVal >= 1000000000) {
        return `${sign}${sym}${(absVal / 1000000000).toFixed(2)}B`;
      } else if (absVal >= 1000000) {
        return `${sign}${sym}${(absVal / 1000000).toFixed(2)}M`;
      } else if (absVal >= 1000) {
        return `${sign}${sym}${(absVal / 1000).toFixed(1)}k`;
      }
    }
    return `${sign}${sym}${absVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
}

export function formatINR(val: number | null | undefined, compact = true): string {
  return formatCurrency(val, 'INR', compact);
}


export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '0';
  }
  return val.toLocaleString('en-IN');
}

export function formatPercent(val: number | null | undefined, showSign = true): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return 'N/A';
  }
  const sign = showSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (parts.length === 2) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
