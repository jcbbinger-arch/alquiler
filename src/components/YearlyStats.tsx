/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
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
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { Payment } from '../types';
import { MONTHS } from '../constants';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface YearlyStatsProps {
  payments: Payment[];
  initialYear?: number;
  initialView?: 'yearly' | 'monthly';
}

export function YearlyStats({ payments, initialYear, initialView }: YearlyStatsProps) {
  const [viewType, setViewType] = useState<'yearly' | 'monthly'>(initialView || 'yearly');
  const years = useMemo(() => [...new Set(payments.map(p => p.year))].sort((a, b) => b - a), [payments]);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || years[0] || new Date().getFullYear());

  // Update internal state if props change (optional, but good for navigation)
  React.useEffect(() => {
    if (initialYear) setSelectedYear(initialYear);
    if (initialView) setViewType(initialView);
  }, [initialYear, initialView]);

  const yearlyData = useMemo(() => {
    const sortedYears = [...years].sort((a, b) => a - b);
    let cumulativeAvgLuz = 0;
    let cumulativeAvgAgua = 0;
    
    return sortedYears.map((year, index) => {
      const yearPayments = payments.filter(p => p.year === year);
      const monthsWithData = new Set(yearPayments.map(p => p.month)).size || 1;
      
      const totalLuz = yearPayments.reduce((acc, p) => acc + p.electricityAmount, 0);
      const totalAgua = yearPayments.reduce((acc, p) => acc + p.waterAmount, 0);
      
      const monthlyAvgLuz = totalLuz / monthsWithData;
      const monthlyAvgAgua = totalAgua / monthsWithData;

      cumulativeAvgLuz += monthlyAvgLuz;
      cumulativeAvgAgua += monthlyAvgAgua;
      const count = index + 1;

      return {
        name: year.toString(),
        year: year,
        Luz: monthlyAvgLuz,
        Agua: monthlyAvgAgua,
        avgLuz: cumulativeAvgLuz / count,
        avgAgua: cumulativeAvgAgua / count,
        totalTotalLuz: totalLuz,
        totalTotalAgua: totalAgua,
        monthsCount: monthsWithData
      };
    });
  }, [payments, years]);

  const monthlyData = useMemo(() => {
    const yearPayments = payments.filter(p => p.year === selectedYear);
    const sortedMonths = MONTHS.map(m => m);
    
    let totalLuz = 0;
    let totalAgua = 0;
    let monthsWithData = 0;

    return sortedMonths.map((month) => {
      const p = yearPayments.find(pay => pay.month === month);
      const luz = p?.electricityAmount || 0;
      const agua = p?.waterAmount || 0;
      
      if (luz > 0 || agua > 0) {
        totalLuz += luz;
        totalAgua += agua;
        monthsWithData++;
      }

      return {
        name: month.charAt(0).toUpperCase() + month.slice(1, 3),
        longName: month,
        Luz: luz,
        Agua: agua,
        avgLuz: monthsWithData > 0 ? totalLuz / monthsWithData : 0,
        avgAgua: monthsWithData > 0 ? totalAgua / monthsWithData : 0
      };
    }).filter(d => {
      const lastMonthIdx = Math.max(...yearPayments.map(p => MONTHS.indexOf(p.month)), -1);
      return MONTHS.indexOf(d.longName) <= lastMonthIdx;
    });
  }, [payments, selectedYear]);

  const currentData = viewType === 'yearly' ? yearlyData : monthlyData;

  const totalElec = currentData.reduce((acc, d) => acc + d.Luz, 0);
  const totalWater = currentData.reduce((acc, d) => acc + d.Agua, 0);
  const avgElec = totalElec / (currentData.length || 1);
  const avgWater = totalWater / (currentData.length || 1);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Estadísticas de Suministros
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {viewType === 'yearly' ? 'Promedio mensual por año (Ajustado por meses registrados)' : 'Gasto por mes del año seleccionado'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl items-center">
            <button
              onClick={() => setViewType('yearly')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewType === 'yearly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <BarChart3 size={14} /> Anual
            </button>
            <button
              onClick={() => setViewType('monthly')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                viewType === 'monthly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Calendar size={14} /> Mensual
            </button>
            
            {viewType === 'monthly' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="ml-2 bg-transparent text-xs font-bold text-slate-600 outline-none border-l border-slate-200 pl-2 cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px'
                }}
                formatter={(value: number, name: string, props: any) => {
                  const label = viewType === 'yearly' ? `Media Mensual ${name}` : name;
                  return [formatCurrency(value), label];
                }}
                labelFormatter={(label) => {
                  if (viewType === 'yearly') {
                    const data = yearlyData.find(d => d.name === label);
                    return `Año ${label} (${data?.monthsCount} meses)`;
                  }
                  return label;
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px' }}
                formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>}
              />
              
              {/* Media lines */}
              <ReferenceLine 
                y={avgElec} 
                stroke="#F59E0B" 
                strokeDasharray="4 4" 
                label={{ 
                  position: 'right', 
                  value: `Media Luz: ${formatCurrency(avgElec)}`, 
                  fill: '#D97706', 
                  fontSize: 10, 
                  fontWeight: 700 
                }} 
              />
              <ReferenceLine 
                y={avgWater} 
                stroke="#3B82F6" 
                strokeDasharray="4 4" 
                label={{ 
                  position: 'left', 
                  value: `Media Agua: ${formatCurrency(avgWater)}`, 
                  fill: '#2563EB', 
                  fontSize: 10, 
                  fontWeight: 700 
                }} 
              />

              <Bar dataKey="Luz" name={viewType === 'yearly' ? 'Luz (Media)' : 'Luz'} fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="Agua" name={viewType === 'yearly' ? 'Agua (Media)' : 'Agua'} fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          Tendencia Temporal
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="Luz" 
                stroke="#F59E0B" 
                strokeWidth={4} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Luz"
              />
              <Line 
                type="monotone" 
                dataKey="avgLuz" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                name="Media Luz Hist."
              />
              <Line 
                type="monotone" 
                dataKey="Agua" 
                stroke="#3B82F6" 
                strokeWidth={4} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Agua"
              />
              <Line 
                type="monotone" 
                dataKey="avgAgua" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                name="Media Agua Hist."
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
