import React, { useState } from 'react';
import { CalculatedPayment, Tenant } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { MONTHS } from '../constants';
import { Printer, X, Download, Zap, Droplets, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReceiptModalProps {
  payment: CalculatedPayment;
  tenant?: Tenant;
  onClose: () => void;
}

export function ReceiptModal({ payment, tenant, onClose }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const copyToWhatsApp = () => {
    const pendingText = payment.pendingDebts
      .filter(d => !d.isPaid)
      .map(d => `• ${d.concept} (${d.period}): ${formatCurrency(d.amount)}`)
      .join('\n');

    const message = `*LIQUIDACIÓN ALQUILER*\n` +
      `📅 *Periodo:* ${payment.month} ${payment.year}\n` +
      `👤 *Inquilino:* ${tenant?.name || 'Inquilino'}\n\n` +
      `*DETALLE DEL MES:*\n` +
      `🏠 Alquiler: ${formatCurrency(payment.rentAmount)}\n` +
      `⚡ Luz: ${payment.includeElectricity === false ? 'Aplazado' : formatCurrency(payment.electricityAmount)}\n` +
      `💧 Agua: ${payment.includeWater === false ? 'Aplazado' : formatCurrency(payment.waterAmount)}\n` +
      (payment.otherExpenses > 0 ? `➕ Otros: ${formatCurrency(payment.otherExpenses)}\n` : '') +
      `💰 *Total Mes:* ${formatCurrency(payment.totalToPay)}\n\n` +
      (payment.previousBalance > 0 ? `✨ *Sobrante anterior:* ${formatCurrency(payment.previousBalance)}\n` : '') +
      (pendingText ? `*DEUDAS PENDIENTES:*\n${pendingText}\n\n` : '') +
      `📥 *Entrega registrada:* ${formatCurrency(payment.amountPaid)}\n` +
      `❗ *SALDO FINAL:* ${formatCurrency(payment.netDue)}`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white print:hidden z-10">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-2">Recibo Digital</span>
          <div className="flex gap-2">
            <button 
              onClick={copyToWhatsApp}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-xs font-bold",
                copied ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              )}
              title="Copiar para WhatsApp"
            >
              {copied ? '¡Copiado!' : <><Copy size={16} /> WhatsApp</>}
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
              title="Imprimir"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Receipt Content - Scrollable */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 lg:p-8 print:p-0 print:overflow-visible bg-white">
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Estado de Liquidación</h2>
            <p className="text-slate-400 text-[9px] font-black tracking-widest uppercase mt-0.5">Gestión Administrativa</p>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-4 mb-6 border border-slate-100/50 flex justify-between items-start text-xs">
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Inquilino</p>
              <p className="font-black text-slate-800 text-sm">{tenant?.name || 'Borja Álvarez'}</p>
              <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">
                {payment.month} {payment.year}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Fecha</p>
              <p className="font-bold text-slate-700">{new Date().toLocaleDateString('es-ES')}</p>
              <p className="text-slate-400 text-[9px] font-mono">ID: {payment.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Zap size={10} className="text-amber-500" /> Cargos Mes
                </p>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alquiler</span>
                    <span className="font-mono font-bold">{formatCurrency(payment.rentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Luz</span>
                    <span className={cn("font-mono", payment.includeElectricity === false ? "text-slate-300 italic" : "font-bold text-slate-700")}>
                      {payment.includeElectricity === false ? 'Aplazado' : formatCurrency(payment.electricityAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agua</span>
                    <span className={cn("font-mono", payment.includeWater === false ? "text-slate-300 italic" : "font-bold text-slate-700")}>
                      {payment.includeWater === false ? 'Aplazado' : formatCurrency(payment.waterAmount)}
                    </span>
                  </div>
                  <div className="pt-1.5 mt-1 border-t border-slate-50 flex justify-between font-black text-indigo-600">
                    <span className="uppercase">Subtotal</span>
                    <span>{formatCurrency(payment.totalToPay)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Entrega / Pago</p>
                    {payment.previousBalance > 0 && (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">+{formatCurrency(payment.previousBalance)} Sobrante</span>
                    )}
                  </div>
                  <p className="text-xl font-black text-white font-mono">{formatCurrency(payment.amountPaid)}</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Balance Pendiente</p>
                  <p className={cn("text-base font-black font-mono", payment.netDue > 0 ? "text-rose-400" : "text-emerald-400")}>
                    {payment.netDue > 0 ? formatCurrency(payment.netDue) : '0,00 €'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Status Table */}
            <div className="space-y-3">
              <h5 className="text-[9px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-50 pb-1 flex justify-between items-center">
                <span>ESTADO DE CUENTA POR PERÍODOS</span>
              </h5>
              
              <div className="space-y-1.5">
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

                  return sortedPeriods.map(period => {
                    const isFullyPaid = groupedDebts[period].every(d => d.isPaid);
                    if (isFullyPaid) return null; // Don't show fully paid periods for compactness

                    return (
                      <div key={period} className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-16 border-r border-slate-50 text-[9px] font-black text-slate-400 leading-tight">
                          {period.split(' ')[0]}<br/>{period.split(' ')[1]}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          {groupedDebts[period]
                            .filter(d => !d.isPaid)
                            .sort((a, b) => {
                              const getConceptPriority = (concept: string) => {
                                if (concept.includes('Alquiler')) return 1;
                                if (concept.includes('Luz')) return 2;
                                if (concept.includes('Agua')) return 3;
                                return 4;
                              };
                              return getConceptPriority(a.concept) - getConceptPriority(b.concept);
                            })
                            .map((debt, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-600 truncate max-w-[80px]">{debt.concept}</span>
                                <span className="font-mono text-rose-500 font-bold">{formatCurrency(debt.amount)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-2xl flex justify-between items-center text-slate-900 border border-slate-200">
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-500">Saldo Total Exigible</span>
              <span className="text-lg font-black font-mono">
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
