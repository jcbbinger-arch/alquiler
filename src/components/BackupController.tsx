import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { db } from '../firebase';
import { collection, writeBatch, doc, getDocs, query, where } from 'firebase/firestore';

interface BackupControllerProps {
  payments: any[];
  tenants: any[];
  ownerId?: string;
  onRestore: () => void;
}

export function BackupController({ payments, tenants, ownerId }: BackupControllerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadBackup = () => {
    const data = {
      payments,
      tenants,
      backupDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rentacontrol_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const uploadBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !ownerId) return;

    if (!window.confirm("¿Seguro que deseas restaurar la copia de seguridad? Esto SOBREESCRIBIRÁ los datos actuales de pagos e inquilinos.")) {
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.payments || !data.tenants) throw new Error("Formato de backup inválido");

        const batch = writeBatch(db);
        
        // 1. Delete current data
        const currentTenants = await getDocs(query(collection(db, 'tenants'), where('ownerId', '==', ownerId)));
        currentTenants.docs.forEach(d => batch.delete(d.ref));
        
        const currentPayments = await getDocs(query(collection(db, 'payments'), where('ownerId', '==', ownerId)));
        currentPayments.docs.forEach(d => batch.delete(d.ref));

        // 2. Add new data
        data.tenants.forEach((t: any) => {
            const docRef = doc(collection(db, 'tenants'));
            batch.set(docRef, { ...t, ownerId });
        });

        data.payments.forEach((p: any) => {
            const docRef = doc(collection(db, 'payments'));
            batch.set(docRef, { ...p, ownerId });
        });

        await batch.commit();
        alert("Copia restaurada correctamente.");
        window.location.reload(); // Refresh to reflect new state
      } catch (err) {
        console.error(err);
        alert("Error al restaurar: " + (err instanceof Error ? err.message : "Error desconocido"));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pt-2 border-t border-slate-200 mt-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Copia de Seguridad</p>
      <div className="flex gap-2 px-4">
        <button 
          onClick={downloadBackup}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 py-2 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all"
        >
          <Download size={12} /> Descargar
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all"
        >
          <Upload size={12} /> Cargar
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={uploadBackup}
          className="hidden"
          accept=".json"
        />
      </div>
    </div>
  );
}
