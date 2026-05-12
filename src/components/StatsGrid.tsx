/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatCurrency } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(stat.value)}</p>
          </div>
          <div className={`p-3 rounded-xl ${stat.colorClass} bg-opacity-10`}>
            <stat.icon size={24} className={stat.colorClass} />
          </div>
        </div>
      ))}
    </div>
  );
}
