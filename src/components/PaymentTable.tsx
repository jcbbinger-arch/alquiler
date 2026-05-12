import React from 'react';
import { CalculatedPayment, Payment } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Edit3, 
  Trash2, 
  ArrowRightCircle, 
  ChevronRight,
  Calculator,
  Zap,
  Droplets
} from 'lucide-react';

interface PaymentTableProps {
  payments: CalculatedPayment[];
  onEdit?: (payment: Payment) => void;
  onViewReceipt?: (payment: CalculatedPayment) => void;
  onDelete?: (id: string) => void;
}

export function PaymentTable({ payments, onEdit, onViewReceipt, onDelete }: PaymentTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mes/Año</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Cargos Mes</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Crédito Prev.</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Neto a Pagar</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Pagado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Sobrante</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 capitalize">{payment.month}</span>
                    <span className="text-xs text-slate-400 font-mono">{payment.year}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total:</span>
                      <span className="font-mono text-sm text-slate-900 font-bold">{formatCurrency(payment.totalToPay)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter" title="Alquiler Base">R:{payment.rentAmount}</span>
                      
                      {(payment.electricityAmount + payment.waterAmount + (payment.otherExpenses || 0) + (payment.manualChargesAmount || 0)) > 0 && (
                        <div className="flex flex-wrap items-center justify-end gap-1.5 mt-1">
                          {payment.electricityAmount > 0 && (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-100 rounded text-[9px] font-black text-amber-600" title="Luz">
                              <Zap size={8} /> {payment.electricityAmount.toFixed(2)}
                            </div>
                          )}
                          {payment.waterAmount > 0 && (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded text-[9px] font-black text-blue-600" title="Agua">
                              <Droplets size={8} /> {payment.waterAmount.toFixed(2)}
                            </div>
                          )}
                          {(payment.otherExpenses > 0 || (payment.manualChargesAmount || 0) > 0) && (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 border border-rose-100 rounded text-[9px] font-black text-rose-600" title="Otros / Pendientes">
                              <Receipt size={8} /> {(payment.otherExpenses + (payment.manualChargesAmount || 0)).toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={cn(
                    "font-mono text-sm",
                    payment.previousBalance > 0 ? "text-emerald-600 font-bold" : "text-slate-400"
                  )}>
                    {payment.previousBalance > 0 ? `-${formatCurrency(payment.previousBalance)}` : '€0,00'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                      {formatCurrency(Math.max(0, payment.netDue))}
                    </span>
                    {(payment.electricityAmount + payment.waterAmount + (payment.otherExpenses || 0)) > 0 && (
                      <span className="text-[11px] font-black text-rose-600 uppercase tracking-tighter">
                         Incl. {formatCurrency(payment.electricityAmount + payment.waterAmount + (payment.otherExpenses || 0))} gastos
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                     <span className={cn(
                        "font-bold font-mono",
                        payment.amountPaid >= payment.netDue ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {formatCurrency(payment.amountPaid)}
                      </span>
                      <span className="text-[10px] text-slate-400">{payment.paymentDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={cn(
                    "font-mono text-sm px-2 py-1 rounded-lg",
                    payment.currentSurplus > 0 ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-300"
                  )}>
                    {payment.currentSurplus > 0 ? `+${formatCurrency(payment.currentSurplus)}` : '€0,00'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onViewReceipt?.(payment)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Ver Recibo"
                    >
                      <FileText size={18} />
                    </button>
                    <button 
                      onClick={() => onEdit?.(payment)}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete?.(payment.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
