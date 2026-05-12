/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Payment, CalculatedPayment, Tenant } from '../types';
import { User, Phone, ShieldCheck, Calendar, Users, FileText, Plus, Receipt, AlertCircle, CheckCircle2, Zap, Droplets, Wallet, Trash2, TrendingUp, DollarSign, Calculator, ChevronRight } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

interface TenantProfileProps {
  tenants: Tenant[];
  payments: CalculatedPayment[];
  onAddTenant: () => void;
  onEditTenant: (tenant: Tenant) => void;
}

export function TenantProfile({ tenants, payments, onAddTenant, onEditTenant }: TenantProfileProps) {
  const [addingChargeTo, setAddingChargeTo] = React.useState<string | null>(null);
  const [newCharge, setNewCharge] = React.useState({ concept: '', amount: 0, category: 'extra' as const });

  const getPendingManualChargesTotal = (tenant: Tenant) => {
    return (tenant.manualCharges || [])
      .filter(c => !c.isPaid)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const handleToggleCharge = async (tenant: Tenant, chargeId: string) => {
    const updatedCharges = (tenant.manualCharges || []).map(c => 
      c.id === chargeId ? { ...c, isPaid: !c.isPaid, paymentDate: !c.isPaid ? new Date().toISOString().split('T')[0] : undefined } : c
    );
    onEditTenant({ ...tenant, manualCharges: updatedCharges });
  };

  const handleAddCharge = async (tenant: Tenant) => {
    if (!newCharge.concept || newCharge.amount <= 0) return;
    const charge = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      isPaid: false,
      ...newCharge
    };
    onEditTenant({
      ...tenant,
      manualCharges: [charge, ...(tenant.manualCharges || [])]
    });
    setAddingChargeTo(null);
    setNewCharge({ concept: '', amount: 0, category: 'extra' });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'luz': return <Zap size={18} />;
      case 'agua': return <Droplets size={18} />;
      case 'rotura': return <Trash2 size={18} />;
      case 'atraso': return <AlertCircle size={18} />;
      case 'servicio': return <FileText size={18} />;
      default: return <Wallet size={18} />;
    }
  };

  const getCategoryColor = (category: string, isPaid: boolean) => {
    if (isPaid) return "bg-slate-100 text-slate-400";
    switch (category) {
      case 'luz': return "bg-amber-100 text-amber-600";
      case 'agua': return "bg-blue-100 text-blue-600";
      case 'extra': return "bg-rose-100 text-rose-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Historial de Inquilinos</h3>
        <button 
          onClick={onAddTenant}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={18} />
          Nuevo Inquilino
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {tenants.map(tenant => (
          <div key={tenant.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Basic Info Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group">
              <div className="bg-indigo-600 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <User size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center font-black text-2xl">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight">{tenant.name}</h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="text-indigo-100 flex items-center gap-1.5 text-xs">
                            <span className="font-bold uppercase tracking-widest text-[10px] opacity-70">Fecha Inicio:</span>
                            <Calendar size={12} />
                            {new Date(tenant.leaseStartDate).toLocaleDateString('es-ES')}
                          </p>
                          {tenant.leaseEndDate && (
                            <p className="text-indigo-100 flex items-center gap-1.5 text-xs">
                              <span className="font-bold uppercase tracking-widest text-[10px] opacity-70">Fecha Fin:</span>
                              <Calendar size={12} />
                              {new Date(tenant.leaseEndDate).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onEditTenant(tenant)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">Teléfono</p>
                      <p className="font-mono font-bold flex items-center gap-2 italic">
                        <Phone size={14} />
                        {tenant.phone}
                      </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">Fianza</p>
                      <p className="font-mono font-bold flex items-center gap-2">
                        <ShieldCheck size={14} />
                        {formatCurrency(tenant.deposit)}
                      </p>
                      {tenant.depositMonths && (
                        <p className="text-[10px] text-indigo-100 mt-1 italic">
                          ({tenant.depositMonths} {tenant.depositMonths === 1 ? 'mes' : 'meses'})
                        </p>
                      )}
                      {tenant.additionalDeposits && tenant.additionalDeposits.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Entregas Extra:</p>
                          {tenant.additionalDeposits.map((dep, dIdx) => (
                            <div key={dIdx} className="flex justify-between items-center text-[10px] text-indigo-50">
                              <span>{new Date(dep.date).toLocaleDateString('es-ES')}:</span>
                              <span className="font-bold">+{formatCurrency(dep.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm col-span-2 md:col-span-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">ID / DNI</p>
                      <p className="font-mono font-bold">{tenant.dni || '---'}</p>
                    </div>
                  </div>
                </div>
              </div>
                
                {/* Statistics Highlights */}
                <div className="px-8 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {(() => {
                      const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
                      const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amountPaid, 0);
                      const totalRent = tenantPayments.reduce((sum, p) => sum + p.rentAmount, 0);
                      const totalElectricity = tenantPayments.reduce((sum, p) => sum + p.electricityAmount, 0);
                      const totalWater = tenantPayments.reduce((sum, p) => sum + p.waterAmount, 0);
                      const totalOthers = tenantPayments.reduce((sum, p) => sum + (p.otherExpenses || 0) + (p.manualChargesAmount || 0), 0);
                      
                      return (
                        <>
                          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Total Pagado</p>
                            <p className="text-xl font-black text-indigo-700 font-mono italic">{formatCurrency(totalPaid)}</p>
                            <p className="text-[10px] font-bold text-indigo-300 mt-1 uppercase tracking-widest">Alquiler: {formatCurrency(totalRent)}</p>
                          </div>
                          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Suministro Luz</p>
                            <p className="text-xl font-black text-amber-700 font-mono italic">{formatCurrency(totalElectricity)}</p>
                            <p className="text-[10px] font-bold text-amber-400 mt-1 uppercase tracking-widest">Media: {formatCurrency(totalElectricity / (tenantPayments.length || 1))}</p>
                          </div>
                          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">Suministro Agua</p>
                            <p className="text-xl font-black text-blue-700 font-mono italic">{formatCurrency(totalWater)}</p>
                            <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase tracking-widest">Media: {formatCurrency(totalWater / (tenantPayments.length || 1))}</p>
                          </div>
                          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-1">Otros Gastos</p>
                            <p className="text-xl font-black text-rose-700 font-mono italic">{formatCurrency(totalOthers)}</p>
                            <p className="text-[10px] font-bold text-rose-400 mt-1 uppercase tracking-widest">Total histórico</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="px-8 pb-8 border-t border-slate-100 pt-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <TrendingUp size={14} className="text-indigo-400" />
                    Desglose por Años y Periodos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
                      const years = [...new Set(tenantPayments.map(p => p.year))].sort((a,b) => b-a);
                      
                      return years.map(year => {
                        const yearPayments = tenantPayments.filter(p => p.year === year);
                        const yearlyPaid = yearPayments.reduce((sum, p) => sum + p.amountPaid, 0);
                        return (
                          <div key={year} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group/year hover:border-indigo-100 transition-all">
                            <div>
                              <p className="text-sm font-black text-slate-900">AÑO {year}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{yearPayments.length} meses registrados</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-indigo-600 font-mono">{formatCurrency(yearlyPaid)}</p>
                              <div className="flex items-center gap-1 justify-end opacity-0 group-hover/year:opacity-100 transition-opacity">
                                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Ver Detalles</span>
                                <ChevronRight size={10} className="text-indigo-400" />
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                    {payments.filter(p => p.tenantId === tenant.id).length === 0 && (
                      <div className="col-span-full py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-dashed border-slate-200 rounded-2xl">
                        Sin actividad de pagos registrada todavía
                      </div>
                    )}
                  </div>
                </div>

              <div className="p-8 space-y-10 border-t border-slate-100">
                {/* Emergency Contacts */}
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" />
                    Contactos de Emergencia / Familiares
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(tenant.emergencyContacts || [(tenant as any).emergencyContact]).filter(Boolean).map((contact, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-indigo-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-800">{contact.name}</p>
                          <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-full">
                            {contact.relationship}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Teléfono Directo</p>
                        <p className="font-bold text-slate-800 font-mono text-sm">{contact.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Charges / Internal Ledger */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                      <Receipt size={18} />
                      Ficha de Cobros y Gastos
                    </h4>
                    <div className="flex items-center gap-3">
                      {getPendingManualChargesTotal(tenant) > 0 && (
                        <div className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 flex items-center gap-2">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Pendiente: {formatCurrency(getPendingManualChargesTotal(tenant))}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setAddingChargeTo(tenant.id)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all border border-rose-100"
                        title="Nuevo Cargo"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {addingChargeTo === tenant.id && (
                    <div className="mb-6 p-6 bg-rose-50/30 border border-rose-100 rounded-3xl space-y-4 animate-in zoom-in-95">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-1 space-y-1">
                          <label className="text-[9px] font-black text-rose-400 uppercase ml-1">Tipo</label>
                          <select 
                            value={newCharge.category}
                            onChange={(e) => setNewCharge(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full bg-white border border-rose-100 rounded-xl px-2 py-2 text-[10px] font-black uppercase outline-none"
                          >
                            <option value="extra">Extra</option>
                            <option value="rotura">Rotura</option>
                            <option value="atraso">Atraso</option>
                            <option value="servicio">Servicio</option>
                          </select>
                        </div>
                         <div className="md:col-span-7 space-y-1">
                          <label className="text-[9px] font-black text-rose-400 uppercase ml-1">Concepto</label>
                          <input 
                            type="text" 
                            placeholder="Ej. Recargo suministros, reparaciones..."
                            value={newCharge.concept}
                            onChange={(e) => setNewCharge(prev => ({ ...prev, concept: e.target.value }))}
                            className="w-full bg-white border border-rose-100 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] font-black text-rose-400 uppercase ml-1">Importe</label>
                          <input 
                            type="number" 
                            value={newCharge.amount}
                            onChange={(e) => setNewCharge(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white border border-rose-100 rounded-xl px-4 py-2 text-xs font-black text-rose-600 outline-none"
                          />
                        </div>
                        <div className="md:col-span-2 flex items-end gap-2">
                           <button 
                            onClick={() => handleAddCharge(tenant)}
                            className="flex-1 h-9 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                          >
                            Agregar
                          </button>
                          <button 
                            onClick={() => setAddingChargeTo(null)}
                            className="w-9 h-9 bg-white text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all border border-rose-100"
                          >
                            <Plus size={16} className="rotate-45" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-3">
                    {tenant.manualCharges && tenant.manualCharges.length > 0 ? (
                      tenant.manualCharges.map((charge) => (
                        <div key={charge.id} className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all group/charge",
                          charge.isPaid 
                            ? "bg-slate-50/50 border-slate-100 text-slate-400 opacity-60" 
                            : "bg-white border-rose-100 shadow-sm shadow-rose-50"
                        )}>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleToggleCharge(tenant, charge.id)}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                charge.isPaid ? "bg-emerald-50 text-emerald-500" : getCategoryColor(charge.category, false)
                              )}
                            >
                              {charge.isPaid ? <CheckCircle2 size={18} /> : getCategoryIcon(charge.category)}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={cn("text-xs font-bold", charge.isPaid ? "text-slate-400" : "text-slate-800")}>
                                  {charge.concept || charge.category.toUpperCase()}
                                </p>
                                {charge.period && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black uppercase tracking-widest leading-none">
                                    {charge.period}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] uppercase font-black tracking-widest opacity-50">
                                {new Date(charge.date).toLocaleDateString('es-ES')} • {charge.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-sm font-black", charge.isPaid ? "text-slate-400 line-through" : "text-rose-600")}>
                              {formatCurrency(charge.amount)}
                            </p>
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-50">
                              {charge.isPaid ? `Pagado (${new Date(charge.paymentDate || charge.date).toLocaleDateString('es-ES')})` : 'Pendiente cobro'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No hay cobros internos pendientes</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                {tenant.notes && tenant.notes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <FileText size={18} />
                      Anotaciones e Incidencias
                    </h4>
                    <div className="space-y-4">
                      {tenant.notes.map((note) => (
                        <div key={note.id} className="relative pl-6 border-l-2 border-amber-100 py-1">
                          <div className="absolute top-2 -left-[5px] w-2 h-2 rounded-full bg-amber-400" />
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                              {new Date(note.date).toLocaleDateString('es-ES')}
                            </span>
                            {note.category && (
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {note.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed italic">"{note.content}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Snapshot */}
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-3xl border",
                tenant.leaseEndDate ? "bg-slate-50 border-slate-200" : "bg-emerald-50 border-emerald-100"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "p-2 rounded-xl text-white",
                    tenant.leaseEndDate ? "bg-slate-400" : "bg-emerald-500"
                  )}>
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className={cn(
                    "font-black uppercase tracking-tighter",
                    tenant.leaseEndDate ? "text-slate-600" : "text-emerald-900"
                  )}>
                    {tenant.leaseEndDate ? 'Periodo Finalizado' : 'Periodo Activo'}
                  </h4>
                </div>
                <p className={cn(
                  "text-sm leading-relaxed font-medium",
                  tenant.leaseEndDate ? "text-slate-500" : "text-emerald-700"
                )}>
                  {tenant.leaseEndDate 
                    ? `Este contrato finalizó tras ${Math.round((new Date(tenant.leaseEndDate).getTime() - new Date(tenant.leaseStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} meses de ocupación.`
                    : 'Actualmente al corriente de pago y en vigencia.'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
