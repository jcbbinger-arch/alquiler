import React from 'react';
import { CalculatedPayment } from '../types';
import { formatCurrency } from '../lib/utils';
import { Printer, X, Download, Zap, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceiptModalProps {
  payment: CalculatedPayment;
  onClose: () => void;
}

export function ReceiptModal({ payment, onClose }: ReceiptModalProps) {
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
        <div className="p-8 lg:p-12 print:p-0">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 print:mb-2">
              <span className="text-white text-2xl font-bold">R</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Recibo de Cobro</h2>
            <p className="text-slate-500 text-sm mt-1">Propiedad: Calle Alquiler Casa</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Para:</p>
              <p className="font-bold text-slate-800">Inquilino: Borja Álvarez</p>
              <p className="text-slate-600 text-sm italic">Periodo: {payment.month} {payment.year}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Fecha Recibo:</p>
              <p className="font-bold text-slate-800">{new Date().toLocaleDateString('es-ES')}</p>
              <p className="text-slate-600 text-sm">Ref: #{payment.id}</p>
            </div>
          </div>

            <div className="space-y-3 mb-10">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">Desglose de Conceptos</h4>
              
              <div className="flex justify-between items-center text-slate-700">
                <span>Alquiler mensual</span>
                <span className="font-mono">{formatCurrency(payment.rentAmount)}</span>
              </div>

              {/* Detailed Electricity */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-800 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                      <Zap size={14} />
                    </div>
                    <span>Suministro Luz</span>
                  </div>
                  <span className="font-mono">{formatCurrency(payment.electricityAmount)}</span>
                </div>
                {payment.electricityTotalInvoice > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">
                    <span>Base Fac: {formatCurrency(payment.electricityTotalInvoice)} ({payment.electricityPercentage}%)</span>
                    <span>{payment.electricityPeriodFrom && `Per: ${payment.electricityPeriodFrom} / ${payment.electricityPeriodTo}`}</span>
                  </div>
                )}
              </div>

              {/* Detailed Water */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-800 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                      <Droplets size={14} />
                    </div>
                    <span>Suministro Agua</span>
                  </div>
                  <span className="font-mono">{formatCurrency(payment.waterAmount)}</span>
                </div>
                {payment.waterTotalInvoice > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2">
                    <span>Base Fac: {formatCurrency(payment.waterTotalInvoice)} ({payment.waterPercentage}%)</span>
                    <span>{payment.waterPeriodFrom && `Per: ${payment.waterPeriodFrom} / ${payment.waterPeriodTo}`}</span>
                  </div>
                )}
              </div>

              {payment.otherExpenses > 0 && (
                <div className="flex justify-between items-center text-slate-700">
                  <span>Otros gastos</span>
                  <span className="font-mono">{formatCurrency(payment.otherExpenses)}</span>
                </div>
              )}
            
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-slate-900 font-bold">
              <span>Total conceptos mes actual</span>
              <span className="font-mono">{formatCurrency(payment.totalToPay)}</span>
            </div>

            {payment.pendingDebts.length > 0 && (
              <div className="space-y-2 pt-4">
                <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Pendiente de periodos anteriores</h5>
                {payment.pendingDebts.map((debt, idx) => (
                  <div key={idx} className="flex justify-between items-center text-rose-600 text-sm">
                    <span>{debt.period}</span>
                    <span className="font-mono">{formatCurrency(debt.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {payment.previousBalance > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-medium pt-4">
                <span>Saldo a favor acumulado (Crédito)</span>
                <span className="font-mono">-{formatCurrency(payment.previousBalance)}</span>
              </div>
            )}

            <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center text-white mt-10">
              <span className="font-bold text-sm uppercase tracking-wider">Total Neto a Pagar</span>
              <span className="text-2xl font-black font-mono">
                {formatCurrency(Math.max(0, payment.netDue))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10">
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Firma Arrendador</p>
               <div className="h-16 border-b border-slate-200" />
            </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Firma Arrendatario</p>
               <div className="h-16 border-b border-slate-200" />
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter leading-tight">
              Este documento acredita el recibo de las cantidades indicadas.<br/>
              Gracias por su puntualidad.
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
