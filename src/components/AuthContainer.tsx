import React from 'react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { signInWithGoogle, logout } from '../firebase';
import { User } from 'firebase/auth';

interface AuthContainerProps {
  user: User | null;
  loading: boolean;
}

export function AuthContainer({ user, loading }: AuthContainerProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl animate-pulse w-32 h-10" />
    );
  }

  if (!user) {
    return (
      <button 
        onClick={signInWithGoogle}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200"
      >
        <LogIn size={18} />
        Iniciar Sesión
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <UserIcon size={16} />
          </div>
        )}
        <div className="hidden sm:block">
          <p className="text-xs font-black text-slate-800 leading-tight">{user.displayName}</p>
          <p className="text-[10px] text-slate-500 font-medium">{user.email}</p>
        </div>
      </div>
      <button 
        onClick={logout}
        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        title="Cerrar Sesión"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
