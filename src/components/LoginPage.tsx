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
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  School,
  FileText,
  BadgeCheck,
  BookmarkCheck,
  Trash2,
  History,
  Check,
} from 'lucide-react';

interface SavedCredential {
  id: string;
  username: string;
  role: 'employee' | 'admin';
  displayName?: string;
  password?: string;
  savedAt: string;
}

const REMEMBERED_ACCOUNTS_KEY = 'slip_gaji_saved_accounts_v2';
const LAST_LOGIN_CREDS_KEY = 'slip_gaji_last_login_creds_v2';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials, employees } = useAuth();
  const { companyProfile } = useSalary();

  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedCredential[]>([]);

  // Load saved accounts on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedAccounts(parsed);
        }
      }

      const lastCreds = localStorage.getItem(LAST_LOGIN_CREDS_KEY);
      if (lastCreds) {
        const parsedLast = JSON.parse(lastCreds);
        if (parsedLast && parsedLast.username) {
          setUsername(parsedLast.username);
          setPassword(parsedLast.password || '');
          if (parsedLast.role) setActiveTab(parsedLast.role);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSelectSavedAccount = (acc: SavedCredential) => {
    setActiveTab(acc.role);
    setUsername(acc.username);
    setPassword(acc.password || '');
    setErrorMessage('');
  };

  const handleDeleteSavedAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.id !== id);
    setSavedAccounts(updated);
    try {
      localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Quick fill helper
  const handleQuickFillEmployee = (nip: string, defaultPass: string) => {
    setUsername(nip);
    setPassword(defaultPass);
    setErrorMessage('');
  };

  const handleQuickFillAdmin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

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
        // Save credential if Remember Me is checked
        try {
          if (rememberMe) {
            // Save last creds
            localStorage.setItem(
              LAST_LOGIN_CREDS_KEY,
              JSON.stringify({ username, password, role: activeTab })
            );

            // Find name if employee
            let displayName = username;
            if (activeTab === 'employee') {
              const emp = employees.find(
                (x) => x.nip?.toLowerCase().trim() === username.toLowerCase().trim()
              );
              if (emp) displayName = emp.name;
            } else if (username === 'kepsek123') {
              displayName = 'Kepala Sekolah (Amirudin, M.Pd.)';
            } else if (username === 'wakasek123') {
              displayName = 'Wakil Kepala Sekolah';
            } else {
              displayName = 'Admin TU';
            }

            const existingIndex = savedAccounts.findIndex(
              (a) => a.username.toLowerCase() === username.toLowerCase() && a.role === activeTab
            );

            const newAcc: SavedCredential = {
              id: `${activeTab}-${username}`,
              username,
              password,
              role: activeTab,
              displayName,
              savedAt: new Date().toISOString(),
            };

            let updatedList: SavedCredential[];
            if (existingIndex >= 0) {
              updatedList = [...savedAccounts];
              updatedList[existingIndex] = newAcc;
            } else {
              updatedList = [newAcc, ...savedAccounts].slice(0, 10);
            }

            setSavedAccounts(updatedList);
            localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(updatedList));
          }
        } catch {
          // Ignore
        }
      }
    }, 300);
  };

  const filteredSavedAccounts = savedAccounts.filter((a) => a.role === activeTab);

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
                // check if we have saved employee creds
                const lastEmp = savedAccounts.find((a) => a.role === 'employee');
                if (lastEmp) {
                  setUsername(lastEmp.username);
                  setPassword(lastEmp.password || '');
                } else {
                  setUsername('');
                  setPassword('');
                }
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
                // check if we have saved admin creds
                const lastAdmin = savedAccounts.find((a) => a.role === 'admin');
                if (lastAdmin) {
                  setUsername(lastAdmin.username);
                  setPassword(lastAdmin.password || '');
                } else {
                  setUsername('kepsek123');
                  setPassword('kepsek123456');
                }
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

            {/* Saved Accounts Pill Selector if any exist */}
            {filteredSavedAccounts.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <History className="w-3.5 h-3.5 text-emerald-600" /> Akun Tersimpan di Perangkat Ini:
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Klik untuk mengisi</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filteredSavedAccounts.map((acc) => {
                    const isSelected = username.toLowerCase() === acc.username.toLowerCase();
                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleSelectSavedAccount(acc)}
                        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate max-w-[130px]">{acc.displayName || acc.username}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedAccount(acc.id, e)}
                          title="Hapus dari daftar tersimpan"
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
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
                    activeTab === 'employee' ? 'Masukkan NIP (Contoh: 102041398)' : 'Masukkan username (kepsek123 / wakasek123)'
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
                  Simpan User & Password di browser ini
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

            {/* Quick Fill / Demo Credentials Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Akun Cepat Terdaftar:</span>
                <span className="text-[10px] text-emerald-600 font-normal">Klik untuk mengisi</span>
              </div>

              {activeTab === 'employee' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFillEmployee('102041398', '102041398')}
                    className="p-2 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="font-bold text-xs text-slate-800 truncate">Amirudin, M.Pd.</div>
                    <div className="text-[10px] text-slate-500 font-mono">NIP: 102041398</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFillEmployee('107101784', '107101784')}
                    className="p-2 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="font-bold text-xs text-slate-800 truncate">M. Anwar Pratama</div>
                    <div className="text-[10px] text-slate-500 font-mono">NIP: 107101784</div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFillAdmin('kepsek123', 'kepsek123456')}
                    className="p-2.5 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>Admin 1 (Kepsek)</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Utama</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">User: kepsek123</div>
                    <div className="text-[10px] text-slate-400 font-mono">Pass: kepsek123456</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFillAdmin('wakasek123', 'wakasek123456')}
                    className="p-2.5 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>Admin 2 (Wakasek)</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">Wakasek</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">User: wakasek123</div>
                    <div className="text-[10px] text-slate-400 font-mono">Pass: wakasek123456</div>
                  </button>
                </div>
              )}
            </div>
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
