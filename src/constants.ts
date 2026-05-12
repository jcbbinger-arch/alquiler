import { Payment, Tenant } from './types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Borja Álvarez',
    phone: '664 00 57 34',
    deposit: 100,
    leaseStartDate: '2021-07-28',
    emergencyContact: {
      name: 'Candelaria',
      relationship: 'Madre',
      phone: '637400934'
    }
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  // Recent 2025 records with more detail based on the spreadsheet
  { 
    id: '2025-07', 
    tenantId: 'tenant-1', 
    year: 2025, 
    month: 'julio', 
    rentAmount: 250, 
    electricityTotalInvoice: 145.19,
    electricityPercentage: 50,
    electricityAmount: 72.60, 
    electricityPeriodFrom: '2025-05-24',
    electricityPeriodTo: '2025-06-24',
    waterTotalInvoice: 74.43,
    waterPercentage: 50,
    waterAmount: 37.22, 
    otherExpenses: 0, 
    amountPaid: 359.81, 
    paymentDate: '2025-09-10', 
    isPaid: true 
  },
  { 
    id: '2025-06', 
    tenantId: 'tenant-1', 
    year: 2025, 
    month: 'junio', 
    rentAmount: 250, 
    electricityTotalInvoice: 89.25,
    electricityPercentage: 50,
    electricityAmount: 44.63, 
    electricityPeriodFrom: '2025-04-24',
    electricityPeriodTo: '2025-05-24',
    waterTotalInvoice: 0,
    waterPercentage: 50,
    waterAmount: 0, 
    otherExpenses: 0, 
    amountPaid: 294.63, 
    paymentDate: '2025-09-10', 
    isPaid: true 
  },
  
  // Historical mapping (Simplified for brevity but compatible)
  { id: '2021-08', tenantId: 'tenant-1', year: 2021, month: 'agosto', rentAmount: 250, electricityTotalInvoice: 0, electricityPercentage: 50, electricityAmount: 0, waterTotalInvoice: 0, waterPercentage: 50, waterAmount: 0, otherExpenses: 0, amountPaid: 250, paymentDate: '2021-08-03', isPaid: true },
  { id: '2021-09', tenantId: 'tenant-1', year: 2021, month: 'septiembre', rentAmount: 250, electricityTotalInvoice: 84, electricityPercentage: 50, electricityAmount: 42, waterTotalInvoice: 36, waterPercentage: 50, waterAmount: 18, otherExpenses: 0, amountPaid: 310, paymentDate: '2021-09-10', isPaid: true },
];


export const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];
