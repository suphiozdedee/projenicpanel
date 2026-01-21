import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  if (!amount) return '0 ₺';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberInput(value) {
  if (!value) return '';
  // Remove non-digits
  const raw = value.toString().replace(/\D/g, '');
  // Format with dots
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function cleanNumberInput(value) {
  if (!value) return '';
  return value.toString().replace(/\./g, '');
}