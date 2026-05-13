import React from 'react';
import { CalculatedPayment, Tenant } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { MONTHS } from '../constants';
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden print:shadow-none print:m-0 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Not shown in print */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden z-10">
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

        {/* Receipt Content - Scrollable */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-8 lg:p-10 print:p-0 print:overflow-visible">
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

          <div className="space-y-6">
            {/* Main Charges List (Current Month) */}
            <div className="bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                 Cargos Periodo Actual ({payment.month} {payment.year})
              </h5>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-slate-600 text-sm">
                  <span>Alquiler mensual base</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(payment.rentAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center text-slate-600 text-sm">
                  <span className="flex items-center gap-2"><Zap size={14} className="text-amber-500" /> Suministro Luz</span>
                  <span className={cn("font-mono font-bold", payment.includeElectricity === false ? "text-slate-400 italic" : "text-slate-900")}>
                    {payment.includeElectricity === false ? 'Aplazado' : formatCurrency(payment.electricityAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600 text-sm">
                  <span className="flex items-center gap-2"><Droplets size={14} className="text-blue-500" /> Suministro Agua</span>
                  <span className={cn("font-mono font-bold", payment.includeWater === false ? "text-slate-400 italic" : "text-slate-900")}>
                    {payment.includeWater === false ? 'Aplazado' : formatCurrency(payment.waterAmount)}
                  </span>
                </div>

                {(payment.otherExpenses + (payment.manualChargesAmount || 0)) > 0 && (
                  <div className="flex justify-between items-center text-slate-600 text-sm border-t border-slate-100 pt-2.5">
                    <span>Otros cargos y ajustes</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(payment.otherExpenses + (payment.manualChargesAmount || 0))}</span>
                  </div>
                )}
                
                <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center text-slate-900 text-xs font-black uppercase tracking-widest">
                  <span>Total Invoiced (Excl. Aplazados)</span>
                  <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{formatCurrency(payment.totalToPay)}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100/50">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Entrega / Pago</p>
                <p className="text-2xl font-black text-indigo-600 font-mono leading-none">{formatCurrency(payment.amountPaid)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Final</p>
                <p className={cn("text-lg font-bold font-mono leading-none text-right", payment.netDue > 0 ? "text-rose-500" : "text-emerald-500")}>
                  {payment.netDue > 0 ? formatCurrency(payment.netDue) : 'LIQUIDADO'}
                </p>
              </div>
            </div>

            {/* Debt Breakdown / Settlement */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-100 pb-1 flex justify-between items-center">
                <span>ESTADO DE LIQUIDACIÓN POR MESES</span>
                {payment.netDue > 0 && <span className="text-[9px] font-normal lowercase italic text-rose-400 font-sans tracking-normal opacity-80">(Incluye cargos actuales no pagados)</span>}
              </h5>
              
              <div className="grid grid-cols-1 gap-3">
                {(() => {
                  const groupedDebts = payment.pendingDebts.reduce((acc, debt) => {
                    const period = debt.period;
                    if (!acc[period]) acc[period] = [];
                    acc[period].push(debt);
                    return acc;
                  }, {} as Record<string, typeof payment.pendingDebts>);

                  const sortedPeriods = Object.keys(groupedDebts).sort((a, b) => {
                    const [m1, y1] = a.split(' ');
                    const [m2, y2] = b.split(' ');
                    const date1 = new Date(parseInt(y1), MONTHS.indexOf(m1));
                    const date2 = new Date(parseInt(y2), MONTHS.indexOf(m2));
                    return date1.getTime() - date2.getTime();
                  });

                  const getConceptPriority = (concept: string) => {
                    if (concept.includes('Alquiler')) return 1;
                    if (concept.includes('Luz')) return 2;
                    if (concept.includes('Agua')) return 3;
                    return 4;
                  };

                  return sortedPeriods.map(period => (
                    <div key={period} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{period}</p>
                        {groupedDebts[period].every(d => d.isPaid) ? (
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-black uppercase tracking-tighter border border-emerald-100">Pagado</span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-black uppercase tracking-tighter border border-rose-100">Pendiente</span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {groupedDebts[period]
                          .sort((a, b) => getConceptPriority(a.concept) - getConceptPriority(b.concept))
                          .map((debt, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px]">
                              <span className={cn(debt.isPaid ? "text-slate-400" : "text-slate-700 font-medium")}>
                                {debt.concept}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={cn("font-mono", debt.isPaid ? "text-emerald-500 font-medium" : "text-rose-600 font-bold")}>
                                  {debt.isPaid ? 'PAGADO' : formatCurrency(debt.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="p-5 bg-slate-900 rounded-3xl flex justify-between items-center text-white mt-10 shadow-xl shadow-slate-200">
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Total Final Pendiente</span>
              <span className="text-2xl font-black font-mono">
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
