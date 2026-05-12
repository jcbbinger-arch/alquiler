import React from 'react';
import { CalculatedPayment, Tenant } from '../types';
import { formatCurrency } from '../lib/utils';
import { Printer, X, Download, Zap, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceiptModalProps {
  payment: CalculatedPayment;
  tenant?: Tenant;
  onClose: () => void;
}

export function ReceiptModal({ payment, tenant, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden print:shadow-none print:m-0"
      >
        {/* Header - Not shown in print */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden">
          <h3 className="font-bold text-slate-800">Recibo de Alquiler</h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
              title="Imprimir"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 lg:p-10 print:p-0">
          <div className="text-center mb-8">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Liquidación Mensual</h2>
            <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase mt-1">Registro Interno Administrativo</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Inquilino:</p>
              <p className="font-bold text-slate-800">{tenant?.name || 'Borja Álvarez'}</p>
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Periodo: {payment.month} {payment.year}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Fecha Registro:</p>
              <p className="font-bold text-slate-800">{new Date().toLocaleDateString('es-ES')}</p>
              <p className="text-slate-500 text-[10px] font-mono">REF: {payment.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center text-slate-700 text-sm">
              <span className="font-medium">Alquiler mensual base</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(payment.rentAmount)}</span>
            </div>

            {/* Detailed Suministros */}
            <div className="grid grid-cols-1 gap-2 py-2">
              <div className="flex justify-between items-center text-slate-600 text-xs">
                <span className="flex items-center gap-2"><Zap size={12} className="text-amber-500" /> Suministro Luz</span>
                <span className="font-mono">{formatCurrency(payment.electricityAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 text-xs">
                <span className="flex items-center gap-2"><Droplets size={12} className="text-blue-500" /> Suministro Agua</span>
                <span className="font-mono">{formatCurrency(payment.waterAmount)}</span>
              </div>
            </div>

            {payment.otherExpenses > 0 && (
              <div className="flex justify-between items-center text-slate-600 text-xs border-t border-slate-50 pt-2">
                <span>Otros cargos puntuales</span>
                <span className="font-mono">{formatCurrency(payment.otherExpenses)}</span>
              </div>
            )}

            {(payment.manualChargesAmount || 0) > 0 && (
              <div className="flex justify-between items-center text-rose-600 text-xs border-t border-slate-50 pt-2 font-bold">
                <span>Cargos acumulados previos</span>
                <span className="font-mono">+{formatCurrency(payment.manualChargesAmount)}</span>
              </div>
            )}
            
            <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-slate-900 text-xs font-black uppercase tracking-widest">
              <span>Subtotal mes actual</span>
              <span className="font-mono text-sm">{formatCurrency(payment.totalToPay)}</span>
            </div>

            {payment.pendingDebts.length > 0 && (
              <div className="space-y-1.5 pt-3">
                <h5 className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Deuda Anterior Acumulada</h5>
                {payment.pendingDebts.map((debt, idx) => (
                  <div key={idx} className="flex justify-between items-center text-rose-600 text-[11px]">
                    <span>{debt.period}</span>
                    <span className="font-mono font-bold">{formatCurrency(debt.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {payment.previousBalance > 0 && (
              <div className="flex justify-between items-center text-emerald-600 text-[11px] pt-3 italic">
                <span>Crédito a favor (Saldo anterior)</span>
                <span className="font-mono">-{formatCurrency(payment.previousBalance)}</span>
              </div>
            )}

            <div className="p-4 bg-slate-100 rounded-2xl flex justify-between items-center text-slate-900 mt-8">
              <span className="font-black text-[10px] uppercase tracking-widest">Final a Liquidar</span>
              <span className="text-xl font-black font-mono">
                {formatCurrency(Math.max(0, payment.netDue))}
              </span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">
              Este resumen es de uso privado. No constituye un recibo legal ante terceros sin sello.<br/>
              Sistema de Gestión RentaControl
            </p>
          </div>
        </div>

        {/* Footer - Print only note */}
        <div className="hidden print:block absolute bottom-8 left-0 right-0 text-center text-xs text-slate-300">
          Documento generado por RentaControl App
        </div>
      </motion.div>
    </div>
  );
}
