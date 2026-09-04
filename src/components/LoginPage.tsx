import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalary } from '../context/SalaryContext';
import {
  ShieldCheck,
  User,
  Key,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  School,
  BookmarkCheck,
  BadgeCheck,
} from 'lucide-react';

const LAST_LOGIN_USER_KEY = 'slip_gaji_last_username';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials } = useAuth();
  const { companyProfile } = useSalary();

  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved username if remember me was used
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LAST_LOGIN_USER_KEY);
      if (savedUser) {
        setUsername(savedUser);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = loginWithCredentials(username, password, activeTab);
      if (!result.success) {
        setErrorMessage(result.message);
        setIsLoading(false);
      } else {
        try {
          if (rememberMe) {
            localStorage.setItem(LAST_LOGIN_USER_KEY, username);
          } else {
            localStorage.removeItem(LAST_LOGIN_USER_KEY);
          }
        } catch {
          // Ignore
        }
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex flex-col justify-between text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Header Decorative */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-emerald-800/40 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {companyProfile.schoolLogoUrl ? (
            <img
              src={companyProfile.schoolLogoUrl}
              alt="Logo Sekolah"
              className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md border border-emerald-400/30">
              <School className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block">
              slip gaji id SMPI Al Azhar 9
            </span>
            <span className="text-[11px] text-emerald-300 font-medium">
              {companyProfile.schoolName || 'SMP Islam Al Azhar 9 Bekasi'}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-200/80 bg-emerald-900/40 px-3 py-1.5 rounded-full border border-emerald-700/40 font-medium">
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          <span>Portal Resmi Penggajian Elektronik</span>
        </div>
      </header>

      {/* Main Login Content Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Logo & School Header Banner */}
          <div className="bg-gradient-to-b from-emerald-800 to-emerald-900 p-6 sm:p-7 text-center text-white relative">
            <div className="flex items-center justify-center gap-4 mb-3">
              {companyProfile.foundationLogoUrl && (
                <div className="w-12 h-12 bg-white/95 rounded-2xl p-1.5 shadow-md flex items-center justify-center border border-white/40">
                  <img
                    src={companyProfile.foundationLogoUrl}
                    alt="Logo Yayasan"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              {companyProfile.schoolLogoUrl ? (
                <div className="w-14 h-14 bg-white/95 rounded-2xl p-1.5 shadow-lg flex items-center justify-center border-2 border-emerald-300">
                  <img
                    src={companyProfile.schoolLogoUrl}
                    alt="Logo SMPI Al Azhar 9"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-emerald-700 rounded-2xl p-1.5 shadow-lg flex items-center justify-center border-2 border-emerald-400 text-white font-extrabold text-xl">
                  A9
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              slip gaji id SMPI Al Azhar 9
            </h1>
            <p className="text-xs text-emerald-200 font-medium mt-1">
              {companyProfile.foundationName || 'Yayasan Wakaf Al Muhajirien Jakapermai'}
            </p>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Portal Akses Mandiri Slip Gaji Guru & Karyawan
            </p>
          </div>

          {/* Role Navigation Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('employee');
                setErrorMessage('');
                setUsername('');
                setPassword('');
              }}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'employee'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Pegawai / Guru</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage('');
                setUsername('');
                setPassword('');
              }}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin / Kepsek</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {activeTab === 'employee' ? 'Nomor Induk Pegawai (NIP)' : 'Username Administrator'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    activeTab === 'employee' ? 'Masukkan NIP Anda' : 'Masukkan username administrator'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {activeTab === 'employee' ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password Login
                </label>
                {activeTab === 'employee' && (
                  <span className="text-[10px] text-slate-400">
                    Default: NIP Pegawai
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda..."
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Ingat username di perangkat ini
                </span>
              </label>
            </div>

            {/* Information Notice for Employees */}
            {activeTab === 'employee' && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-[11px] text-emerald-900 space-y-1">
                <p className="font-semibold flex items-center gap-1 text-emerald-950">
                  <Key className="w-3.5 h-3.5 text-emerald-700" /> Panduan Login Pegawai:
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  Gunakan <strong>NIP</strong> sebagai User ID dan Password (default). Password juga dapat disesuaikan oleh Admin TU.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                activeTab === 'employee'
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950'
              }`}
            >
              <span>{isLoading ? 'Memverifikasi...' : activeTab === 'employee' ? 'Masuk ke Portal Pegawai' : 'Masuk sebagai Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 text-center text-[11px] text-slate-500">
            SMP Islam Al Azhar 9 Bekasi &copy; {new Date().getFullYear()} • Sistem Slip Gaji Terpadu
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="px-6 py-4 text-center text-xs text-emerald-300/70 border-t border-emerald-800/40 bg-slate-950/40 backdrop-blur-md">
        <p>
          Portal Slip Gaji Digital Resmi SMP Islam Al Azhar 9 Kemang Pratama Bekasi
        </p>
      </footer>
    </div>
  );
};
