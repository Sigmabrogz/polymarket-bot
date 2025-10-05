export const formatUsd = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 0 : 2
  }).format(value);

export const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: '2-digit'
  }).format(date);
};
