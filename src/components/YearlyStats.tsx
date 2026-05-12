/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  Legend
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { Payment } from '../types';

interface YearlyStatsProps {
  payments: Payment[];
}

export function YearlyStats({ payments }: YearlyStatsProps) {
  const chartData = useMemo(() => {
    const years = [...new Set(payments.map(p => p.year))].sort((a, b) => a - b);
    
    // Calculate global averages
    const allYearsUtilities = payments.reduce((acc, p) => acc + p.electricityAmount + p.waterAmount, 0);
    const averageUtilities = allYearsUtilities / (years.length || 1);

    return years.map(year => {
      const yearPayments = payments.filter(p => p.year === year);
      const totalElectricity = yearPayments.reduce((acc, p) => acc + p.electricityAmount, 0);
      const totalWater = yearPayments.reduce((acc, p) => acc + p.waterAmount, 0);
      
      return {
        name: year.toString(),
        Luz: totalElectricity,
        Agua: totalWater,
        Media: averageUtilities / 12 // Simplified, need to adjust based on months in year
      };
    });
  }, [payments]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-6">Comparativa Anual Luz y Agua</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Luz" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Agua" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-6">Tendencia de Suministros</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="Luz" stroke="#F59E0B" strokeWidth={3} />
              <Line type="monotone" dataKey="Agua" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
