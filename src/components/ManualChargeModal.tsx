import React, { useState } from 'react';
import { Tenant, ManualCharge } from '../types';
import { X, Save, Calendar, Plus, Wallet, Receipt, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, handleNumericKeyDown, parseSpanishNumber } from '../lib/utils';

interface ManualChargeModalProps {
  tenants: Tenant[];
  onClose: () => void;
  onSave: (tenantId: string, charge: ManualCharge) => void;
}

export function ManualChargeModal({ tenants, onClose, onSave }: ManualChargeModalProps) {
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [charge, setCharge] = useState<ManualCharge>({
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString().split('T')[0],
    concept: '',
    amount: 0,
    isPaid: false,
    category: 'extra'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !charge.concept || charge.amount <= 0) return;
    onSave(selectedTenantId, charge);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-rose-600 rounded-2xl text-white shadow-lg shadow-rose-100">
                  <Receipt size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Registrar Cargo Extra</h2>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-1">Documentación interna administrativa</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Seleccionar Inquilino</label>
                <select 
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 transition-all outline-none"
                  required
                >
                  <option value="" disabled>Elige un inquilino</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Periodo Asociado</label>
                  <input 
                    type="text" 
                    value={charge.period || ''}
                    onChange={(e) => setCharge(prev => ({ ...prev, period: e.target.value }))}
                    placeholder="Ej. Mayo 2024"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Categoría</label>
                  <select 
                    value={charge.category}
                    onChange={(e) => setCharge(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-black uppercase text-slate-700 transition-all outline-none"
                    required
                  >
                    <option value="extra">Cobro Extra</option>
                    <option value="luz">Suministro Luz</option>
                    <option value="agua">Suministro Agua</option>
                    <option value="rotura">Rotura / Reparación</option>
                    <option value="atraso">Atraso / Recargo</option>
                    <option value="servicio">Servicio Especial</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Concepto / Motivo</label>
                <input 
                  type="text" 
                  value={charge.concept}
                  onChange={(e) => setCharge(prev => ({ ...prev, concept: e.target.value }))}
                  placeholder="Ej. Reparación cerradura, Limpieza extra..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 transition-all outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Fecha Registro</label>
                  <input 
                    type="date" 
                    value={charge.date}
                    onChange={(e) => setCharge(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Importe (€)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={charge.amount || ''}
                    onChange={(e) => setCharge(prev => ({ ...prev, amount: parseSpanishNumber(e.target.value) }))}
                    onKeyDown={handleNumericKeyDown}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-black text-rose-600 transition-all outline-none"
                    required
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-8 py-4 bg-slate-50 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-[2] px-8 py-4 bg-rose-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-3"
              >
                <Save size={20} />
                Guardar Cobro
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
