/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Payment } from '../types';
import { X, Save, Zap, Droplets } from 'lucide-react';
import { MONTHS } from '../constants';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface PaymentFormModalProps {
  payment?: Payment;
  onClose: () => void;
  onSave: (payment: Payment) => void;
}

export function PaymentFormModal({ payment, onClose, onSave }: PaymentFormModalProps) {
  const [formData, setFormData] = useState<Payment>(payment || {
    id: Math.random().toString(36).substr(2, 9),
    tenantId: 'tenant-1',
    year: new Date().getFullYear(),
    month: MONTHS[new Date().getMonth()],
    rentAmount: 250,
    electricityTotalInvoice: 0,
    electricityPercentage: 50,
    electricityAmount: 0,
    electricityPeriodFrom: '',
    electricityPeriodTo: '',
    waterTotalInvoice: 0,
    waterPercentage: 50,
    waterAmount: 0,
    waterPeriodFrom: '',
    waterPeriodTo: '',
    otherExpenses: 0,
    amountPaid: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    isPaid: false,
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val };
      
      // Auto-calculate electricityAmount if total or percentage changes
      if (name === 'electricityTotalInvoice' || name === 'electricityPercentage') {
        const total = name === 'electricityTotalInvoice' ? (val as number) : prev.electricityTotalInvoice;
        const pct = name === 'electricityPercentage' ? (val as number) : prev.electricityPercentage;
        updated.electricityAmount = parseFloat((total * (pct / 100)).toFixed(2));
      }
      
      // Auto-calculate waterAmount if total or percentage changes
      if (name === 'waterTotalInvoice' || name === 'waterPercentage') {
        const total = name === 'waterTotalInvoice' ? (val as number) : prev.waterTotalInvoice;
        const pct = name === 'waterPercentage' ? (val as number) : prev.waterPercentage;
        updated.waterAmount = parseFloat((total * (pct / 100)).toFixed(2));
      }
      
      return updated;
    });
  };

  const handleTogglePaid = () => {
    setFormData(prev => ({ ...prev, isPaid: !prev.isPaid }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[95vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h3 className="font-bold text-slate-800">
            {payment ? 'Editar Registro Mensual' : 'Nuevo Registro Mensual'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Header Data */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Año</label>
              <input 
                type="number" 
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mes</label>
              <select 
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all capitalize"
                required
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alquiler Base (€)</label>
              <input 
                type="number" 
                name="rentAmount"
                step="0.01"
                value={formData.rentAmount}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-blue-600 uppercase tracking-wider italic">Entregado / Pagado (€)</label>
              <input 
                type="number" 
                name="amountPaid"
                step="0.01"
                value={formData.amountPaid}
                onChange={handleChange}
                className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-black text-blue-700 text-lg shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            {/* Electricity Panel */}
            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 space-y-6 group hover:bg-amber-50 transition-colors">
              <h4 className="font-black text-amber-900 uppercase tracking-tighter flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                Suministro Eléctrico (Luz)
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-amber-700 uppercase">Factura Total (€)</label>
                  <input 
                    type="number" 
                    name="electricityTotalInvoice"
                    step="0.01"
                    value={formData.electricityTotalInvoice}
                    onChange={handleChange}
                    className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-amber-700 uppercase">% del Inquilino</label>
                  <input 
                    type="number" 
                    name="electricityPercentage"
                    value={formData.electricityPercentage}
                    onChange={handleChange}
                    className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex justify-between items-center shadow-inner">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-widest opacity-70">A abonar por inquilino</span>
                <span className="text-2xl font-black text-amber-600 font-mono">{formData.electricityAmount.toFixed(2)} €</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-amber-700 uppercase">Desde</label>
                  <input 
                    type="date" 
                    name="electricityPeriodFrom"
                    value={formData.electricityPeriodFrom || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-amber-700 uppercase">Hasta</label>
                  <input 
                    type="date" 
                    name="electricityPeriodTo"
                    value={formData.electricityPeriodTo || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2 outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Water Panel */}
            <div className="bg-sky-50/50 p-6 rounded-3xl border border-sky-100 space-y-6 group hover:bg-sky-50 transition-colors">
              <h4 className="font-black text-sky-900 uppercase tracking-tighter flex items-center gap-2">
                <Droplets size={18} className="text-sky-500" />
                Suministro de Agua
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-sky-700 uppercase">Factura Total (€)</label>
                  <input 
                    type="number" 
                    name="waterTotalInvoice"
                    step="0.01"
                    value={formData.waterTotalInvoice}
                    onChange={handleChange}
                    className="w-full bg-white border border-sky-200 rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-sky-700 uppercase">% del Inquilino</label>
                  <input 
                    type="number" 
                    name="waterPercentage"
                    value={formData.waterPercentage}
                    onChange={handleChange}
                    className="w-full bg-white border border-sky-200 rounded-xl px-4 py-2.5 outline-none focus:border-sky-500 font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-sky-500/10 p-4 rounded-2xl border border-sky-500/20 flex justify-between items-center shadow-inner">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-widest opacity-70">A abonar por inquilino</span>
                <span className="text-2xl font-black text-sky-600 font-mono">{formData.waterAmount.toFixed(2)} €</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-sky-700 uppercase">Desde</label>
                  <input 
                    type="date" 
                    name="waterPeriodFrom"
                    value={formData.waterPeriodFrom || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-sky-200 rounded-xl px-4 py-2 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-sky-700 uppercase">Hasta</label>
                  <input 
                    type="date" 
                    name="waterPeriodTo"
                    value={formData.waterPeriodTo || ''}
                    onChange={handleChange}
                    className="w-full bg-white border border-sky-200 rounded-xl px-4 py-2 outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Otros Gastos Varios (€)</label>
              <input 
                type="number" 
                name="otherExpenses"
                step="0.01"
                value={formData.otherExpenses}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Cobro Efectivo</label>
              <input 
                type="date" 
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-slate-900 rounded-[2rem] p-6 lg:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Alquiler Base</p>
                <p className="text-xl font-mono font-bold line-through opacity-30 decoration-2">{formData.rentAmount.toFixed(2)} €</p>
              </div>
              <div className="text-rose-400">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400/60 mb-1">Total Gastos</p>
                <p className="text-xl font-mono font-bold">
                  +{(formData.electricityAmount + formData.waterAmount + formData.otherExpenses).toFixed(2)} €
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Total Neto a Cobrar</p>
              <p className="text-4xl font-black font-mono">
                {(formData.rentAmount + formData.electricityAmount + formData.waterAmount + formData.otherExpenses).toFixed(2)} <span className="text-lg opacity-50 font-sans tracking-normal">€</span>
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex gap-4">
             <button 
              type="button"
              onClick={handleTogglePaid}
              className={cn(
                "flex-1 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border-2",
                formData.isPaid 
                  ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-100" 
                  : "bg-slate-50 border-slate-200 text-slate-400"
              )}
            >
              {formData.isPaid ? 'Pago Confirmado ✓' : 'Pendiente de Pago'}
            </button>
            <button 
              type="submit"
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
            >
              <Save size={20} />
              Guardar Movimiento
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
