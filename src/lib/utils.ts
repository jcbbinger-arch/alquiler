import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === '.') {
    e.preventDefault();
    const input = e.currentTarget;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const value = input.value;
    
    input.value = value.substring(0, start) + ',' + value.substring(end);
    input.setSelectionRange(start + 1, start + 1);
    
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);
  }
};

export const parseSpanishNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value.toString().replace(',', '.')) || 0;
};
