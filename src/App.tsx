import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SalaryProvider, useSalary } from './context/SalaryContext';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { SlipPdfModal } from './components/SlipPdfModal';
import { PeriodDateRangeModal } from './components/PeriodDateRangeModal';
import { LoginPage } from './components/LoginPage';
import {
  Menu,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldCheck,
  User,
  ArrowRightLeft,
  LogOut,
  School,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role, isLoggedIn, currentUser, currentEmployee, setIsSwitcherOpen, logout } = useAuth();
  const {
    toast,
    companyProfile,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useSalary();

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  // If user is not logged in, render dedicated LoginPage
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* 1. FIXED LEFT SIDEBAR (Tidak ikut bergerak saat scroll) */}
      <Sidebar onOpenPeriodModal={() => setIsPeriodModalOpen(true)} />

      {/* 2. MAIN CONTENT AREA (Offset by sidebar width on desktop) */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-h-screen min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              id="btn-open-mobile-sidebar"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {companyProfile.schoolLogoUrl ? (
                <img
                  src={companyProfile.schoolLogoUrl}
                  alt="Logo"
                  className="w-7 h-7 object-contain rounded"
                />
              ) : (
                <div className="w-7 h-7 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  A9
                </div>
              )}
              <span className="font-extrabold text-xs text-slate-900 truncate max-w-[150px]">
                slip gaji id SMPI Al Azhar 9
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <ArrowRightLeft className="w-3 h-3 text-emerald-700" />
              <span>{role === 'admin' ? 'Admin' : currentEmployee?.name.split(' ')[0]}</span>
            </button>
            <button
              onClick={logout}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Main View */}
        <main className="flex-1 pb-16">
          {role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">{companyProfile.schoolName || 'SMP Islam Al Azhar 9'}</span>
              <span>•</span>
              <span>slip gaji id SMPI Al Azhar 9</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
              >
                Ganti Akun (Admin / Pegawai)
              </button>
              <span>•</span>
              <button
                onClick={logout}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Keluar
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div
          id="global-toast"
          className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-500'
                : 'bg-slate-900 text-white border-blue-500'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <RoleSwitcherModal />
      <SlipPdfModal />
      <PeriodDateRangeModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SalaryProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </SalaryProvider>
  );
}
