/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Payment {
  id: string;
  tenantId: string;
  year: number;
  month: string;
  rentAmount: number;
  
  // Detailed Electricity
  electricityTotalInvoice: number;
  electricityPercentage: number; // e.g., 50 for 50%
  electricityAmount: number; // Calculated result: total * (percentage/100)
  electricityPeriodFrom?: string;
  electricityPeriodTo?: string;

  // Detailed Water
  waterTotalInvoice: number;
  waterPercentage: number;
  waterAmount: number; // Calculated result
  waterPeriodFrom?: string;
  waterPeriodTo?: string;

  otherExpenses: number;
  amountPaid: number;
  paymentDate: string;
  isPaid: boolean;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface TenantNote {
  id: string;
  date: string;
  content: string;
  category?: 'comportamiento' | 'rotura' | 'incidencia' | 'general';
}

export interface DepositPayment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface ManualCharge {
  id: string;
  date: string;
  concept: string;
  amount: number;
  isPaid: boolean;
  paymentDate?: string;
  category: 'rotura' | 'atraso' | 'extra' | 'servicio';
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  dni?: string;
  deposit: number; // Total deposit sum
  depositMonths?: number;
  depositInitialDate?: string;
  additionalDeposits?: DepositPayment[];
  leaseStartDate: string;
  leaseEndDate?: string;
  emergencyContacts: EmergencyContact[];
  manualCharges?: ManualCharge[];
  notes?: TenantNote[];
  ownerId?: string;
  updatedAt?: any;
}

export interface DebtDetail {
  concept: string;
  period: string;
  amount: number;
}

export interface CalculatedPayment extends Payment {
  totalToPay: number; // Sum of rent + utilities + others in current month
  previousBalance: number; // Credit carried from previous month (positive number means credit)
  netDue: number; // totalToPay - previousBalance
  currentSurplus: number; // amountPaid - netDue (if positive)
  pendingDebts: DebtDetail[]; // List of unpaid items from previous months
}
