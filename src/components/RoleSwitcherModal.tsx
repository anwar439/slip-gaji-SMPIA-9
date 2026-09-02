import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Check, ArrowRight, X, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/currencyFormatter';

export const RoleSwitcherModal: React.FC = () => {
  const {
    isSwitcherOpen,
    setIsSwitcherOpen,
    role,
    currentUser,
    currentEmployee,
    switchEmployee,
    loginWithCredentials,
    employees,
  } = useAuth();

  if (!isSwitcherOpen) return null;

  return (
    <div
      id="role-switcher-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Ganti Akun & Profil Pegawai</h2>
              <p className="text-xs text-slate-500">
                Pilih profil untuk menguji portal Admin TU atau portal Pegawai/Guru
              </p>
            </div>
          </div>
          <button
            id="btn-close-role-switcher"
            onClick={() => setIsSwitcherOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Admin Role Cards */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pilihan Akun Administrator / Pimpinan:
            </div>

            {/* Admin 1: kepsek123 */}
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/60 hover:border-emerald-300 transition-colors shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">Amirudin, M.Pd. (Kepala Sekolah)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Admin 1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">User: kepsek123 • Akses Penuh Sistem</p>
                </div>
              </div>
              <button
                onClick={() => {
                  loginWithCredentials('kepsek123', 'kepsek123456', 'admin');
                  setIsSwitcherOpen(false);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  role === 'admin' && currentUser.name.includes('Amirudin')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {role === 'admin' && currentUser.name.includes('Amirudin') ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Aktif</span>
                  </>
                ) : (
                  <>
                    <span>Pilih</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            {/* Admin 2: wakasek123 */}
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/60 hover:border-emerald-300 transition-colors shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">Wakil Kepala Sekolah</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-300 font-bold px-1.5 py-0.2 rounded-full uppercase">
                      Admin 2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">User: wakasek123 • Kurikulum & SDM</p>
                </div>
              </div>
              <button
                onClick={() => {
                  loginWithCredentials('wakasek123', 'wakasek123456', 'admin');
                  setIsSwitcherOpen(false);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  role === 'admin' && currentUser.name.includes('Wakil')
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {role === 'admin' && currentUser.name.includes('Wakil') ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Aktif</span>
                  </>
                ) : (
                  <>
                    <span>Pilih</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Employee Role Header */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Akun 2: Pilih Profil Karyawan (Employee Portal)
              </div>
              <span className="text-[11px] text-slate-400 font-medium">6 Profil Tersedia</span>
            </div>

            <div className="space-y-2">
              {employees.map((emp) => {
                const isActive = role === 'employee' && currentEmployee?.id === emp.id;

                return (
                  <div
                    key={emp.id}
                    id={`employee-select-${emp.id}`}
                    onClick={() => {
                      switchEmployee(emp.id);
                      setIsSwitcherOpen(false);
                    }}
                    className={`border rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/60 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">{emp.name}</span>
                          {emp.email === 'anwar@smpia9.sch.id' && (
                            <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200/60 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> User Akun
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                          <span className="font-mono">{emp.nip}</span>
                          <span>•</span>
                          <span>{emp.position}</span>
                          <span>•</span>
                          <span>{formatRupiah(emp.baseSalary)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isActive ? (
                        <span className="p-1 bg-blue-600 text-white rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1">
                          Pilih <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 text-center text-xs text-slate-500">
          Anda dapat berpindah akun kapan saja melalui tombol peran di bilah atas aplikasi.
        </div>
      </div>
    </div>
  );
};
