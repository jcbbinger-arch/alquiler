/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useMemo } from 'react';
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
  ArrowRight,
  LogIn
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
import { 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

import { Payment, CalculatedPayment, Tenant, DebtDetail, ManualCharge } from './types';
import { INITIAL_PAYMENTS, MONTHS, INITIAL_TENANTS } from './constants';
import { auth, db, signInWithGoogle } from './firebase';
import { StatsGrid } from './components/StatsGrid';
import { YearlyStats } from './components/YearlyStats';
import { PaymentTable } from './components/PaymentTable';
import { TenantProfile } from './components/TenantProfile';
import { TenantFormModal } from './components/TenantFormModal';
import { PaymentFormModal } from './components/PaymentFormModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ManualChargeModal } from './components/ManualChargeModal';
import { AuthContainer } from './components/AuthContainer';
import { cn, formatCurrency } from './lib/utils';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'tenant' | 'stats'>('dashboard');
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);
  const [editingTenant, setEditingTenant] = useState<Tenant | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CalculatedPayment | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [statsNavContext, setStatsNavContext] = useState<{ year: number, view: 'yearly' | 'monthly' } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTenants([]);
      setPayments([]);
      return;
    }

    const tenantsQuery = query(
      collection(db, 'tenants'),
      where('ownerId', '==', user.uid)
    );

    const paymentsQuery = query(
      collection(db, 'payments'),
      where('ownerId', '==', user.uid)
    );

    const unsubTenants = onSnapshot(tenantsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Tenant);
      setTenants(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'tenants'));

    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Payment);
      setPayments(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'payments'));

    return () => {
      unsubTenants();
      unsubPayments();
    };
  }, [user]);

  // Currently we just work with the latest tenant as the "active" one for new payments
  const activeTenant = useMemo(() => tenants.find(t => !t.leaseEndDate) || tenants[tenants.length - 1], [tenants]);

  // Logic to calculate monthly balances, surpluses and pending debts
  const calculatedPayments = useMemo(() => {
    // Sort payments chronologically (oldest first) to calculate carry-over and debts
    const sorted = [...payments].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    });

    let activeUnpaidItems: (DebtDetail & { date: Date })[] = [];
    const historicalResult: CalculatedPayment[] = [];
    let carriedSurplus = 0;

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];

      // 1. Separate this month's charges into DUE NOW and POSTPONED
      const currentDueNow: (DebtDetail & { date: Date })[] = [];
      const currentPostponed: (DebtDetail & { date: Date })[] = [];

      // Save current status for receipt display before applying payments
      const surplusBeingApplied = carriedSurplus;

      // Alquiler
      currentDueNow.push({
        concept: 'Alquiler',
        period: `${p.month} ${p.year}`,
        amount: p.rentAmount,
        month: p.month,
        year: p.year,
        date: new Date(p.year, MONTHS.indexOf(p.month))
      });

      // Luz
      if (p.electricityAmount > 0) {
        const item = {
          concept: p.includeElectricity === false ? 'Luz (Pospuesto)' : 'Luz',
          period: `${p.month} ${p.year}`,
          amount: p.electricityAmount,
          month: p.month,
          year: p.year,
          date: new Date(p.year, MONTHS.indexOf(p.month))
        };
        if (p.includeElectricity === false) currentPostponed.push(item);
        else currentDueNow.push(item);
      }

      // Agua
      if (p.waterAmount > 0) {
        const item = {
          concept: p.includeWater === false ? 'Agua (Pospuesto)' : 'Agua',
          period: `${p.month} ${p.year}`,
          amount: p.waterAmount,
          month: p.month,
          year: p.year,
          date: new Date(p.year, MONTHS.indexOf(p.month))
        };
        if (p.includeWater === false) currentPostponed.push(item);
        else currentDueNow.push(item);
      }

      // Otros
      const otherTotal = p.otherExpenses + (p.manualChargesAmount || 0);
      if (otherTotal > 0) {
        currentDueNow.push({
          concept: 'Otros',
          period: `${p.month} ${p.year}`,
          amount: otherTotal,
          month: p.month,
          year: p.year,
          date: new Date(p.year, MONTHS.indexOf(p.month))
        });
      }

      // 2. Prepare the queue of what can be paid with p.amountPaid
      // Priority 1: Oldest months first (handled by sorting by date)
      // Priority 2 (within same month): Utilities (Luz/Agua) > Rent > Others
      const previousDebt = activeUnpaidItems.reduce((sum, d) => sum + d.amount, 0);

      const getPriority = (concept: string) => {
        const c = concept.toLowerCase();
        if (c.includes('luz')) return 1;
        if (c.includes('agua')) return 2;
        if (c.includes('alquiler')) return 3;
        return 4;
      };

      // The payment covers past debt AND this month's due now charges
      const payableQueue = [...activeUnpaidItems, ...currentDueNow];
      
      // Before sorting, clean up concepts for historical items 
      // (Remove "(Pospuesto)" label for items being paid now)
      payableQueue.forEach(item => {
        if (item.concept.includes('(Pospuesto)')) {
          item.concept = item.concept.replace(' (Pospuesto)', '');
        }
      });

      payableQueue.sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return getPriority(a.concept) - getPriority(b.concept);
      });

      // Calculate gross debt BEFORE applying anything
      const grossDebt = payableQueue.reduce((sum, d) => sum + d.amount, 0) + 
                         currentPostponed.reduce((sum, d) => sum + d.amount, 0);

      // Total Exigible is Net: Gross Debt - Previous Surplus
      const netTotalExigible = Math.max(0, grossDebt - carriedSurplus);

      // Save for display BEFORE reduction
      const displayPendingBeforeReduction = [
        ...payableQueue,
        ...currentPostponed
      ].map(d => ({
        ...d,
        originalAmount: d.amount
      }));

      // 3. Apply payment logic:
      // If the tenant makes a payment (p.amountPaid > 0), we use it PLUS any existing surplus 
      // to settle the oldest debts in the queue.
      // If p.amountPaid is 0, we DON'T settle items yet, we just let both debt and surplus carry over.
      // This keeps the gross debt and credit visible in the receipt until a payment event occurs.
      if (p.amountPaid > 0) {
        let moneyToApply = p.amountPaid + carriedSurplus;
        for (let item of payableQueue) {
          if (moneyToApply <= 0) break;
          const toPay = Math.min(item.amount, moneyToApply);
          item.amount -= toPay;
          moneyToApply -= toPay;
        }
        carriedSurplus = moneyToApply;
      } else {
        // No payment made. Surplus stays as is, items stay unpaid.
        // Note: We don't reduce items with surplus here to satisfy user's request
        // of seeing the remanente carry over until a payment compensantes it.
      }

      // 4. New active unpaid = remaining in payableQueue + current postponed items
      activeUnpaidItems = [
        ...payableQueue.filter(d => d.amount > 0.01),
        ...currentPostponed
      ];

      // 5. Build pendingDebts for display
      const displayPending = displayPendingBeforeReduction.map(d => {
        const currentItem = [...payableQueue, ...currentPostponed].find(c => c.concept === d.concept && c.period === d.period);
        return {
          concept: d.concept,
          period: d.period,
          amount: currentItem ? currentItem.amount : 0,
          originalAmount: d.originalAmount,
          month: d.month,
          year: d.year,
          isPaid: (currentItem ? currentItem.amount : 0) <= 0.01
        };
      });

      // 6. Calculate total invoiced for this month
      const totalInvoicedThisMonth = p.rentAmount + 
                                    (p.includeElectricity !== false ? p.electricityAmount : 0) + 
                                    (p.includeWater !== false ? p.waterAmount : 0) + 
                                    otherTotal;

      historicalResult.push({
        ...p,
        totalToPay: totalInvoicedThisMonth,
        previousBalance: surplusBeingApplied, 
        netDue: Math.max(0, activeUnpaidItems.reduce((sum, d) => sum + d.amount, 0) - carriedSurplus),
        currentSurplus: carriedSurplus,
        previousDebt: previousDebt,
        pendingDebts: displayPending as any,
        totalExigible: netTotalExigible
      });

    }

    return historicalResult.reverse();
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
    
    // Add manual charges to total debt if they are not paid
    const manualChargesDebt = tenants.reduce((acc, t) => {
      return acc + (t.manualCharges || [])
        .filter(c => !c.isPaid)
        .reduce((sum, c) => sum + c.amount, 0);
    }, 0);

    // Total monthly debt is the deficit in the latest calculation
    const monthlyDebt = calculatedPayments.length > 0 
      ? Math.max(0, calculatedPayments[0].netDue - calculatedPayments[0].amountPaid) 
      : 0;
    
    return {
      totalRent,
      totalUtilities,
      totalPaid,
      totalDebt: monthlyDebt + manualChargesDebt,
      netGain: totalRent - totalUtilities
    };
  }, [payments, calculatedPayments, tenants]);

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

  const handleSavePayment = async (payment: Payment) => {
    if (!user) return;
    try {
      // If payment includes manual charges, mark them as paid in the tenant record
      if (payment.includedChargeIds && payment.includedChargeIds.length > 0) {
        const tenant = tenants.find(t => t.id === payment.tenantId);
        if (tenant) {
          const updatedCharges = (tenant.manualCharges || []).map(charge => {
            if (payment.includedChargeIds?.includes(charge.id)) {
              return { ...charge, isPaid: true, paymentDate: payment.paymentDate };
            }
            return charge;
          });
          
          await handleSaveTenant({
            ...tenant,
            manualCharges: updatedCharges
          });
        }
      }

      // Deep clone and clean undefined values
      const cleanPayment = JSON.parse(JSON.stringify(payment));
      const docRef = doc(db, 'payments', payment.id);
      await setDoc(docRef, {
        ...cleanPayment,
        ownerId: user.uid,
        updatedAt: serverTimestamp()
      });
      setShowAddModal(false);
      setEditingPayment(undefined);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `payments/${payment.id}`);
    }
  };

  const handleSaveTenant = async (tenantToSave: Tenant) => {
    if (!user) return;
    try {
      // Deep clone and clean undefined values
      const cleanTenant = JSON.parse(JSON.stringify(tenantToSave));
      const docRef = doc(db, 'tenants', tenantToSave.id);
      await setDoc(docRef, {
        ...cleanTenant,
        ownerId: user.uid,
        updatedAt: serverTimestamp()
      });
      setShowTenantModal(false);
      setEditingTenant(undefined);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tenants/${tenantToSave.id}`);
    }
  };

  const handleSaveManualCharge = async (tenantId: string, charge: ManualCharge) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const updatedManualCharges = [charge, ...(tenant.manualCharges || [])];
    await handleSaveTenant({
      ...tenant,
      manualCharges: updatedManualCharges
    });
    setShowChargeModal(false);
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await deleteDoc(doc(db, 'payments', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `payments/${id}`);
      }
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
           <button 
            onClick={() => setActiveTab('stats')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === 'stats' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <PieChartIcon size={20} />
            <span className="font-medium">Estadísticas</span>
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
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Gestión de Alquiler</h2>
              <p className="text-slate-500 mt-1">Sifras Reales & Control de Suministros</p>
            </div>
            <AuthContainer user={user} loading={authLoading} />
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
              onClick={() => setShowChargeModal(true)}
              className="bg-rose-50 text-rose-600 px-5 py-2.5 rounded-xl text-sm font-bold border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Añadir Cobro</span>
            </button>

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
          {!user ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <LogIn size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Bienvenido al Historial de Inquilinos</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Inicia sesión con tu cuenta de Google para gestionar tus cobros, suministros y contratos de forma segura y privada.
              </p>
              <button 
                onClick={() => auth.currentUser ? null : signInWithGoogle()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 transform hover:-translate-y-1 block mx-auto"
              >
                Acceder con Google
              </button>
              <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Nota Técnica:</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Si el panel de Google no aparece, asegúrate de que el dominio de esta aplicación esté añadido a "Dominios Autorizados" en tu consola de Firebase (Authentication → Settings → Authorized Domains).
                </p>
              </div>
            </div>
          ) : (
            <>
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
            ) : activeTab === 'stats' ? (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <YearlyStats 
                  payments={payments} 
                  initialYear={statsNavContext?.year}
                  initialView={statsNavContext?.view}
                />
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
                  payments={calculatedPayments}
                  onAddTenant={() => {
                    setEditingTenant(undefined);
                    setShowTenantModal(true);
                  }}
                  onEditTenant={(t) => {
                    setEditingTenant(t);
                    setShowTenantModal(true);
                  }}
                  onViewStats={(year) => {
                    setStatsNavContext({ year, view: 'monthly' });
                    setActiveTab('stats');
                  }}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
          </>
          )}
        </section>
      </main>

      {/* Modals */}
      {(showAddModal || editingPayment) && (
        <PaymentFormModal 
          payment={editingPayment}
          tenants={tenants}
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
          tenant={tenants.find(t => t.id === selectedReceipt.tenantId)}
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

      {showChargeModal && (
        <ManualChargeModal 
          tenants={tenants}
          onClose={() => setShowChargeModal(false)}
          onSave={handleSaveManualCharge}
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
