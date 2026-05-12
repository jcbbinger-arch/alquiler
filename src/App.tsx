/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Home, 
  Droplets, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  LayoutDashboard, 
  History,
  FileText,
  PieChart as PieChartIcon,
  Filter,
  Calendar,
  User,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';

import { Payment, CalculatedPayment, Tenant, DebtDetail } from './types';
import { INITIAL_PAYMENTS, MONTHS, INITIAL_TENANTS } from './constants';
import { StatsGrid } from './components/StatsGrid';
import { PaymentTable } from './components/PaymentTable';
import { TenantProfile } from './components/TenantProfile';
import { TenantFormModal } from './components/TenantFormModal';
import { PaymentFormModal } from './components/PaymentFormModal';
import { ReceiptModal } from './components/ReceiptModal';
import { cn, formatCurrency } from './lib/utils';

export default function App() {
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'tenant'>('dashboard');
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CalculatedPayment | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // Currently we just work with the latest tenant as the "active" one for new payments
  const activeTenant = useMemo(() => tenants.find(t => !t.leaseEndDate) || tenants[tenants.length - 1], [tenants]);

  // Logic to calculate monthly balances, surpluses and pending debts
  const calculatedPayments = useMemo(() => {
    // Sort payments chronologically (oldest first) to calculate carry-over and debts
    const sorted = [...payments].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    });

    let cumulativeSurplus = 0;
    const historicalResult: CalculatedPayment[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      const totalToPay = p.rentAmount + p.electricityAmount + p.waterAmount + p.otherExpenses;
      
      const pendingDebts: DebtDetail[] = [];
      
      historicalResult.forEach(prevCalc => {
          const deficit = prevCalc.netDue - prevCalc.amountPaid;
          if (deficit > 0) {
              pendingDebts.push({
                  concept: 'Saldo pendiente',
                  period: `${prevCalc.month} ${prevCalc.year}`,
                  amount: deficit
              });
          }
      });

      const previousBalance = cumulativeSurplus;
      const totalPendingHistory = pendingDebts.reduce((acc, d) => acc + d.amount, 0);
      
      const netDue = totalToPay + totalPendingHistory - previousBalance;
      
      // Surplus is what's left after covering netDue
      const currentSurplus = Math.max(0, p.amountPaid - Math.max(0, netDue));
      
      historicalResult.push({
        ...p,
        totalToPay,
        previousBalance,
        netDue,
        currentSurplus,
        pendingDebts
      });

      cumulativeSurplus = currentSurplus;
    }

    return historicalResult.reverse(); // Show latest first in UI
  }, [payments]);

  // Filtered views
  const filteredPayments = useMemo(() => {
    if (selectedYear === 'all') return calculatedPayments;
    return calculatedPayments.filter(p => p.year === selectedYear);
  }, [calculatedPayments, selectedYear]);

  const years = useMemo(() => {
    return [...new Set(payments.map(p => p.year))].sort((a, b) => (b as number) - (a as number));
  }, [payments]);

  const stats = useMemo(() => {
    const totalRent = payments.reduce((acc, p) => acc + p.rentAmount, 0);
    const totalUtilities = payments.reduce((acc, p) => acc + p.electricityAmount + p.waterAmount, 0);
    const totalPaid = payments.reduce((acc, p) => acc + p.amountPaid, 0);
    
    // Total debt is the sum of deficits in the latest calculation
    const totalDebt = calculatedPayments.length > 0 
      ? Math.max(0, calculatedPayments[0].netDue - calculatedPayments[0].amountPaid) 
      : 0;
    
    return {
      totalRent,
      totalUtilities,
      totalPaid,
      totalDebt,
      netGain: totalRent - totalUtilities
    };
  }, [payments, calculatedPayments]);

  const chartData = useMemo(() => {
    const data = [...years].reverse().map(year => {
      const yearPayments = payments.filter(p => p.year === year);
      return {
        name: year.toString(),
        total: yearPayments.reduce((acc, p) => acc + (p.rentAmount + p.electricityAmount + p.waterAmount + p.otherExpenses), 0),
        paid: yearPayments.reduce((acc, p) => acc + p.amountPaid, 0),
        rent: yearPayments.reduce((acc, p) => acc + p.rentAmount, 0),
      };
    });
    return data;
  }, [payments, years]);

  const handleSavePayment = (payment: Payment) => {
    setPayments(prev => {
      const exists = prev.find(p => p.id === payment.id);
      if (exists) {
        return prev.map(p => p.id === payment.id ? payment : p);
      }
      return [payment, ...prev]; // Latest first
    });
    setShowAddModal(false);
    setEditingPayment(undefined);
  };

  const handleSaveTenant = (tenantToSave: Tenant) => {
    setTenants(prev => {
      const exists = prev.find(t => t.id === tenantToSave.id);
      if (exists) {
        return prev.map(t => t.id === tenantToSave.id ? tenantToSave : t);
      }
      return [...prev, tenantToSave];
    });
    setShowTenantModal(false);
    setEditingTenant(undefined);
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Desktop Only */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Home className="text-white" size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">RentaControl</h1>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'dashboard' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Panel Principal</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'history' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <History size={20} />
            <span className="font-medium">Historial</span>
          </button>
          <button 
            onClick={() => setActiveTab('tenant')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'tenant' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <User size={20} />
            <span className="font-medium">Inquilino</span>
          </button>
        </nav>

        <div className="mt-auto bg-slate-100 p-5 rounded-2xl border border-slate-200">
           <div className="flex items-center gap-3 text-slate-800 font-bold text-sm mb-2">
            <TrendingUp size={16} className="text-emerald-600" />
            <span>Balance Global</span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
            {formatCurrency(stats.totalPaid)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Total acumulado cobrado</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Gestión de Alquiler</h2>
            <p className="text-slate-500 mt-1">Sifras Reales & Control de Suministros</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex items-center px-3 gap-2">
               <Calendar size={16} className="text-slate-400" />
               <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="text-sm font-bold text-slate-700 outline-none bg-transparent"
               >
                 <option value="all">Filtro: Todos</option>
                 {years.map(y => <option key={y} value={y}>{y}</option>)}
               </select>
             </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Añadir Pago</span>
            </button>
          </div>
        </header>

        <section className="space-y-8">
          {stats.totalDebt > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 p-6 rounded-3xl mb-8 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-200">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-black text-rose-900 uppercase tracking-tighter">Atención: Pendiente de Cobro</h3>
                  <p className="text-rose-700 text-sm font-medium">Hay un total de {formatCurrency(stats.totalDebt)} acumulados por cobrar.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const lastPayment = calculatedPayments[0]; // Latest is index 0 due to reverse()
                  setSelectedReceipt(lastPayment);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-200 flex items-center gap-2"
              >
                Liquidación Pendiente
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          <StatsGrid 
            stats={[
              { label: 'Bruto Alquiler', value: stats.totalRent, icon: DollarSign, colorClass: 'text-indigo-600' },
              { label: 'Total Suministros', value: stats.totalUtilities, icon: Zap, colorClass: 'text-amber-600' },
              { label: 'Beneficio Neto', value: stats.netGain, icon: TrendingUp, colorClass: 'text-emerald-600' },
              { label: 'Deuda Pendiente', value: stats.totalDebt, icon: AlertCircle, colorClass: 'text-rose-600' },
            ]} 
          />


          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-500" />
                        Evolución Anual
                      </h3>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => [formatCurrency(value), '']}
                          />
                          <Bar dataKey="rent" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Solo Alquiler" />
                          <Bar dataKey="total" fill="#94A3B8" radius={[6, 6, 0, 0]} name="Total con Gastos" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Liquidity Chart */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-indigo-500" />
                        Proporción Pagada vs Due
                      </h3>
                    </div>
                    <div className="h-72 w-full flex items-center justify-center">
                       <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                          <Tooltip 
                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                          />
                          <Line type="monotone" dataKey="paid" stroke="#10B981" strokeWidth={4} dot={{r: 8, fill: '#10B981', strokeWidth: 0}} name="Total Recibido" />
                          <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} strokeDasharray="5 5" name="Total Facturado" />
                        </LineChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Estado de Cuentas {selectedYear !== 'all' ? `- ${selectedYear}` : ''}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" /> Surplus Accumulator Active
                    </div>
                  </div>
                  <PaymentTable 
                    payments={filteredPayments} 
                    onEdit={(p) => setEditingPayment(p)}
                    onViewReceipt={(p) => setSelectedReceipt(p)}
                    onDelete={handleDeletePayment}
                  />
                </div>
              </motion.div>
            ) : activeTab === 'history' ? (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {years.map(year => {
                  const yearPayments = calculatedPayments.filter(p => p.year === year);
                  if (yearPayments.length === 0) return null;
                  
                  return (
                    <div key={year} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-black tracking-widest">
                          AÑO {year}
                        </div>
                        <div className="h-px bg-slate-200 flex-1" />
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                          {yearPayments.length} Registros
                        </div>
                      </div>
                      <PaymentTable 
                        payments={yearPayments} 
                        onEdit={(p) => setEditingPayment(p)}
                        onViewReceipt={(p) => setSelectedReceipt(p)}
                        onDelete={handleDeletePayment}
                      />
                    </div>
                  );
                })}
              </motion.div>
            ) : activeTab === 'tenant' ? (
              <motion.div
                key="tenant"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TenantProfile 
                  tenants={tenants} 
                  onAddTenant={() => {
                    setEditingTenant(undefined);
                    setShowTenantModal(true);
                  }}
                  onEditTenant={(t) => {
                    setEditingTenant(t);
                    setShowTenantModal(true);
                  }}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </main>

      {/* Modals */}
      {(showAddModal || editingPayment) && (
        <PaymentFormModal 
          payment={editingPayment}
          onClose={() => {
            setShowAddModal(false);
            setEditingPayment(undefined);
          }}
          onSave={handleSavePayment}
        />
      )}

      {selectedReceipt && (
        <ReceiptModal 
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {showTenantModal && (
        <TenantFormModal 
          tenant={editingTenant}
          onClose={() => {
            setShowTenantModal(false);
            setEditingTenant(undefined);
          }}
          onSave={handleSaveTenant}
        />
      )}
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
