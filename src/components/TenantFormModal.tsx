import React, { useState } from 'react';
import { Tenant, EmergencyContact, TenantNote, ManualCharge } from '../types';
import { X, Save, Calendar, Plus, Trash2, MessageSquare, ShieldCheck, Wallet, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, handleNumericKeyDown, parseSpanishNumber } from '../lib/utils';

interface TenantFormModalProps {
  tenant?: Tenant;
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
}

export function TenantFormModal({ tenant, onClose, onSave }: TenantFormModalProps) {
  const [formData, setFormData] = useState<Tenant>(() => {
    if (tenant) {
      const t = tenant as any;
      return {
        ...tenant,
        emergencyContacts: tenant.emergencyContacts || (t.emergencyContact ? [t.emergencyContact] : [{ name: '', relationship: '', phone: '' }]),
        notes: tenant.notes || [],
        manualCharges: tenant.manualCharges || [],
        depositMonths: tenant.depositMonths || 1,
        depositInitialDate: tenant.depositInitialDate || tenant.leaseStartDate,
        additionalDeposits: tenant.additionalDeposits || []
      };
    }
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      phone: '',
      dni: '',
      deposit: 0,
      depositMonths: 1,
      depositInitialDate: new Date().toISOString().split('T')[0],
      additionalDeposits: [],
      rentAmount: 300,
      leaseStartDate: new Date().toISOString().split('T')[0],
      leaseEndDate: '',
      emergencyContacts: [{ name: '', relationship: '', phone: '' }],
      manualCharges: [],
      notes: []
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumeric = ['deposit', 'depositMonths', 'rentAmount'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: isNumeric ? parseSpanishNumber(value) : value
    }));
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', relationship: '', phone: '' }]
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const addNote = () => {
    const newNote: TenantNote = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      content: '',
      category: 'general'
    };
    setFormData(prev => ({ ...prev, notes: [newNote, ...(prev.notes || [])] }));
  };

  const updateNote = (id: string, field: keyof TenantNote, value: string) => {
    setFormData(prev => ({
      ...prev,
      notes: (prev.notes || []).map(n => n.id === id ? { ...n, [field]: value } : n)
    }));
  };

  const removeNote = (id: string) => {
    setFormData(prev => ({
      ...prev,
      notes: (prev.notes || []).filter(n => n.id !== id)
    }));
  };
  
  const addManualCharge = () => {
    const newCharge: ManualCharge = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      concept: '',
      amount: 0,
      isPaid: false,
      category: 'extra'
    };
    setFormData(prev => ({ ...prev, manualCharges: [newCharge, ...(prev.manualCharges || [])] }));
  };

  const updateManualCharge = (id: string, field: keyof ManualCharge, value: any) => {
    setFormData(prev => ({
      ...prev,
      manualCharges: (prev.manualCharges || []).map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const removeManualCharge = (id: string) => {
    setFormData(prev => ({
      ...prev,
      manualCharges: (prev.manualCharges || []).filter(c => c.id !== id)
    }));
  };

  const addDepositRecord = () => {
    const newDep = { 
      id: Math.random().toString(36).substr(2, 9), 
      amount: 0, 
      date: new Date().toISOString().split('T')[0] 
    };
    setFormData(prev => ({ ...prev, additionalDeposits: [...(prev.additionalDeposits || []), newDep] }));
  };

  const updateDepositRecord = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      additionalDeposits: (prev.additionalDeposits || []).map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const removeDepositRecord = (id: string) => {
    setFormData(prev => ({
      ...prev,
      additionalDeposits: (prev.additionalDeposits || []).filter(d => d.id !== id)
    }));
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
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {tenant ? 'Editar Ficha' : 'Nueva Ficha de Inquilino'}
            </h3>
            <p className="text-sm font-medium text-slate-500">Completa la información contractual y de contacto</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all text-slate-400 hover:text-slate-600 shadow-sm hover:shadow">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
          {/* Section: Basic & Contract */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-indigo-600" />
                Información Personal
              </h4>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej. Borja Álvarez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">DNI / ID</label>
                    <input 
                      type="text" 
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Teléfono</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-emerald-600" />
                Condiciones de Alquiler
              </h4>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Alquiler Mensual Base (€)</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="rentAmount"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  onKeyDown={handleNumericKeyDown}
                  placeholder="Ej. 300"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-lg text-slate-700"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">F. Inicio Contrato</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date" 
                      name="leaseStartDate"
                      value={formData.leaseStartDate}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 outline-none font-medium"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">F. Fin (Opcional)</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date" 
                      name="leaseEndDate"
                      value={formData.leaseEndDate || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Fianza / Deposit */}
          <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-8">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-100">
                  <ShieldCheck size={16} />
                </div>
                Garantías y Fianza
              </h4>
              <button 
                type="button" 
                onClick={addDepositRecord}
                className="flex items-center gap-2 text-[10px] font-black text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all border border-emerald-100"
              >
                <Plus size={14} />
                Añadir Entrega Extra
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Total Fianza Inicial (€)</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  onKeyDown={handleNumericKeyDown}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 outline-none font-black text-slate-700 text-lg shadow-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Mensualidades Equiv.</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  name="depositMonths"
                  value={formData.depositMonths}
                  onChange={handleChange}
                  onKeyDown={handleNumericKeyDown}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 outline-none font-bold text-slate-600 shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Fecha Entrega Inicial</label>
                <input 
                  type="date" 
                  name="depositInitialDate"
                  value={formData.depositInitialDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 outline-none font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Additional Deposits List */}
            {formData.additionalDeposits && formData.additionalDeposits.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Entregas Adicionales de Fianza/Garantía</p>
                {formData.additionalDeposits.map((dep) => (
                  <div key={dep.id} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Cantidad (€)</label>
                        <input 
                          type="text" 
                          inputMode="decimal"
                          value={dep.amount}
                          onChange={(e) => updateDepositRecord(dep.id, 'amount', parseSpanishNumber(e.target.value))}
                          onKeyDown={handleNumericKeyDown}
                          className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Fecha</label>
                        <input 
                          type="date" 
                          value={dep.date}
                          onChange={(e) => updateDepositRecord(dep.id, 'date', e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Notas / Motivo</label>
                      <input 
                        type="text" 
                        value={dep.notes || ''}
                        onChange={(e) => updateDepositRecord(dep.id, 'notes', e.target.value)}
                        placeholder="Ej. Refuerzo fianza..."
                        className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-medium"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeDepositRecord(dep.id)}
                      className="self-end p-2 text-rose-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Emergency Contacts */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-indigo-600" />
                Contactos de Emergencia / Familiares
              </h4>
              <button 
                type="button" 
                onClick={addContact}
                className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
              >
                <Plus size={16} />
                Añadir Contacto
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-50/50 border border-slate-100 rounded-3xl relative group">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nombre</label>
                    <input 
                      type="text" 
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Parentesco</label>
                    <input 
                      type="text" 
                      value={contact.relationship}
                      onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Teléfono</label>
                    <input 
                      type="text" 
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none font-mono"
                    />
                  </div>
                  <div className="flex items-end pb-1 justify-center">
                    {formData.emergencyContacts.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeContact(index)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Manual Charges / Extras */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-rose-600" />
                Cargos Manuales / Gastos Pendientes
              </h4>
              <button 
                type="button" 
                onClick={addManualCharge}
                className="flex items-center gap-2 text-xs font-black text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all"
              >
                <Plus size={16} />
                Nuevo Cargo
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {formData.manualCharges?.map((charge) => (
                <div key={charge.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm relative group hover:border-rose-100 transition-colors">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Fecha</label>
                    <input 
                      type="date" 
                      value={charge.date}
                      onChange={(e) => updateManualCharge(charge.id, 'date', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="md:col-span-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Tipo</label>
                    <select 
                      value={charge.category}
                      onChange={(e) => updateManualCharge(charge.id, 'category', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-2 py-2 text-[10px] font-black uppercase outline-none"
                    >
                      <option value="rotura">Rotura</option>
                      <option value="atraso">Atraso</option>
                      <option value="extra">Extra</option>
                      <option value="servicio">Servicio</option>
                    </select>
                  </div>
                  <div className="md:col-span-5 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Concepto / Descripción</label>
                    <input 
                      type="text" 
                      value={charge.concept}
                      placeholder="Ej. Reparación grifo cocina..."
                      onChange={(e) => updateManualCharge(charge.id, 'concept', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-medium outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Importe (€)</label>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={charge.amount}
                      onChange={(e) => updateManualCharge(charge.id, 'amount', parseSpanishNumber(e.target.value))}
                      onKeyDown={handleNumericKeyDown}
                      className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-black text-rose-600 outline-none"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end justify-center pb-1">
                    <button 
                      type="button" 
                      onClick={() => updateManualCharge(charge.id, 'isPaid', !charge.isPaid)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        charge.isPaid ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                      )}
                      title={charge.isPaid ? "Pagado" : "Pendiente"}
                    >
                      {charge.isPaid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </button>
                  </div>
                  <div className="md:col-span-1 flex items-end justify-center pb-1">
                    <button 
                      type="button" 
                      onClick={() => removeManualCharge(charge.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {(!formData.manualCharges || formData.manualCharges.length === 0) && (
                <div className="text-center py-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-[2rem]">
                  <Receipt size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sin cargos manuales pendientes</p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Notes / Annotations */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-amber-600" />
                Notas de Comportamiento e Incidencias
              </h4>
              <button 
                type="button" 
                onClick={addNote}
                className="flex items-center gap-2 text-xs font-black text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-xl transition-all"
              >
                <Plus size={16} />
                Añadir Nota
              </button>
            </div>

            <div className="space-y-4">
              {formData.notes?.map((note) => (
                <div key={note.id} className="bg-amber-50/30 border border-amber-100 p-6 rounded-[2rem] space-y-4 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <input 
                        type="date" 
                        value={note.date}
                        onChange={(e) => updateNote(note.id, 'date', e.target.value)}
                        className="bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-900 outline-none"
                      />
                      <select 
                        value={note.category}
                        onChange={(e) => updateNote(note.id, 'category', e.target.value)}
                        className="bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider text-amber-700 outline-none"
                      >
                        <option value="general">General</option>
                        <option value="comportamiento">Comportamiento</option>
                        <option value="rotura">Rotura/Daño</option>
                        <option value="incidencia">Incidencia</option>
                      </select>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeNote(note.id)}
                      className="p-2 text-amber-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea 
                    value={note.content}
                    onChange={(e) => updateNote(note.id, 'content', e.target.value)}
                    placeholder="Escribe aquí los detalles de la incidencia..."
                    className="w-full bg-white border border-amber-200 rounded-2xl px-5 py-3 outline-none focus:border-amber-400 text-sm italic text-amber-900 shadow-inner h-24 resize-none"
                  />
                </div>
              ))}
              {(!formData.notes || formData.notes.length === 0) && (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem]">
                  <MessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No hay notas registradas</p>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
           <button 
            type="button"
            onClick={onClose}
            className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-slate-800 transition-all border border-slate-200"
          >
            Atrás / Cerrar
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all flex items-center gap-3 transform hover:-translate-y-1"
          >
            <Save size={18} />
            Guardar Ficha
          </button>
        </div>
      </motion.div>
    </div>
  );
}
