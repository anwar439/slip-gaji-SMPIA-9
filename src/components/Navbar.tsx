import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalary } from '../context/SalaryContext';
import {
  ShieldCheck,
  User,
  ArrowRightLeft,
  School,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  activeAdminTab?: string;
  setActiveAdminTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeAdminTab, setActiveAdminTab }) => {
  const { role, currentUser, currentEmployee, setIsSwitcherOpen, logout } = useAuth();
  const { companyProfile } = useSalary();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Institution Info */}
          <div className="flex items-center gap-3">
            {companyProfile.schoolLogoUrl ? (
              <img
                src={companyProfile.schoolLogoUrl}
                alt="Logo SMPI Al Azhar 9"
                className="w-9 h-9 object-contain rounded-xl p-0.5 bg-slate-50 border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs">
                A9
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  slip gaji id
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300/70 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">
                  SMPI Al Azhar 9
                </span>
              </div>
              <p className="text-xs text-emerald-800 font-semibold truncate max-w-[180px] sm:max-w-xs">
                {companyProfile.schoolName || 'SMP Islam Al Azhar 9'}
              </p>
            </div>
          </div>

          {/* Right Navigation & Role Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Indicator & Switcher Button */}
            <button
              id="btn-open-role-switcher"
              onClick={() => setIsSwitcherOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-medium text-slate-700 shadow-2xs"
            >
              {role === 'admin' ? (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Admin TU/HRD</span>
                  <span className="sm:hidden">Admin</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">{currentEmployee?.name?.split(' ')[0] || 'Pegawai'}</span>
                  <span className="sm:hidden">Pegawai</span>
                </div>
              )}
              <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-mono flex items-center gap-1">
                <ArrowRightLeft className="w-2.5 h-2.5" /> Ganti Akun
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs transition-colors hidden sm:flex items-center gap-1"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[11px] font-medium">Keluar</span>
            </button>

            {/* Profile Avatar Chip */}
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                  role === 'admin' ? 'bg-slate-900 text-white' : 'bg-emerald-700 text-white'
                }`}
              >
                {role === 'admin' ? 'AD' : currentEmployee?.name ? currentEmployee.name.substring(0, 2).toUpperCase() : 'PG'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {role === 'admin' ? currentUser.name : currentEmployee?.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {role === 'admin' ? 'admin.smpia9' : currentEmployee?.nip}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
