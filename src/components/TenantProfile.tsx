/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tenant } from '../types';
import { User, Phone, ShieldCheck, Calendar, Users, FileText, Plus } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

interface TenantProfileProps {
  tenants: Tenant[];
  onAddTenant: () => void;
  onEditTenant: (tenant: Tenant) => void;
}

export function TenantProfile({ tenants, onAddTenant, onEditTenant }: TenantProfileProps) {
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
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm col-span-2 md:col-span-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">ID / DNI</p>
                      <p className="font-mono font-bold">{tenant.dni || '---'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Users size={18} className="text-indigo-600" />
                  Contacto de Emergencia
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre</p>
                    <p className="font-bold text-slate-800">{tenant.emergencyContact.name}</p>
                    <span className="text-xs text-indigo-600 font-medium px-2 py-0.5 bg-indigo-50 rounded-full mt-2 inline-block">
                      {tenant.emergencyContact.relationship}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Teléfono Directo</p>
                    <p className="font-bold text-slate-800 font-mono">{tenant.emergencyContact.phone}</p>
                  </div>
                </div>
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
