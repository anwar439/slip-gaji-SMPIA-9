import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSalary } from '../../context/SalaryContext';
import { formatRupiah } from '../../utils/currencyFormatter';
import {
  Bus,
  Award,
  Utensils,
  Calculator,
  CalendarCheck,
  Clock,
  DollarSign,
  Info,
  ShieldCheck,
  Sparkles,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export const EmployeeTransportUkkView: React.FC = () => {
  const { currentEmployee } = useAuth();
  const { getEmployeeTransportUkk, selectedPeriod, getCurrentPeriodConfig } = useSalary();

  if (!currentEmployee) return null;

  const transportUkkData = getEmployeeTransportUkk(currentEmployee.nip || currentEmployee.name, selectedPeriod);
  const periodConfig = getCurrentPeriodConfig();

  return (
    <div id="employee-transport-ukk-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
              <Bus className="w-3.5 h-3.5" />
              Transparansi Rincian Transportasi, UKK & Uang Makan
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Rincian Perhitungan Transport & UKK Anda
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              Periode: <strong>{periodConfig.label}</strong> ({periodConfig.startDate} s/d {periodConfig.endDate})
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-300">Total Komponen Diterima</div>
            <div className="text-xl font-extrabold text-white">
              {transportUkkData ? formatRupiah(transportUkkData.grandTotal || transportUkkData.totalJumlahUang || ((transportUkkData.ukkDiterima || 0) + (transportUkkData.transporDiterima || 0) + (transportUkkData.uangMakanDiterima || 0))) : 'Rp 0'}
            </div>
          </div>
        </div>
      </div>

      {!transportUkkData ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Data Perhitungan Belum Tersedia</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Data perhitungan transport & UKK untuk NIP <strong>{currentEmployee.nip}</strong> pada periode ini sedang diproses oleh HRD & Keuangan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>Presensi Kehadiran</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {transportUkkData.jumlahHadir} / {transportUkkData.hariKerja} <span className="text-xs font-normal text-slate-400">Hari</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Sakit: {transportUkkData.sakit} | Izin: {transportUkkData.izin} | Alpa: {transportUkkData.alpa}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>UKK Bersih</span>
                <Award className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatRupiah(transportUkkData.ukkDiterima)}
              </div>
              <div className="text-[11px] text-rose-500 mt-1">
                Potongan: -{formatRupiah(transportUkkData.ukkPotongan)} ({transportUkkData.totalPotonganPersen}%)
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>Uang Transportasi</span>
                <Bus className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatRupiah(transportUkkData.transporDiterima)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {transportUkkData.jumlahHadir} hari x {formatRupiah(transportUkkData.tarifTransporHarian)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>Uang Makan</span>
                <Utensils className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatRupiah(transportUkkData.uangMakanDiterima)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {transportUkkData.jumlahHadir} hari x {formatRupiah(transportUkkData.tarifUangMakanHarian)}
              </div>
            </div>
          </div>

          {/* Formula Breakdown Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              Rincian Rumus & Kalkulasi Sinkron
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: UKK */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="font-bold text-indigo-900 dark:text-indigo-200 text-xs flex items-center justify-between">
                  <span>1. Uang Kehadiran & Kinerja (UKK)</span>
                  <Award className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>UKK Bruto:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(transportUkkData.ukkBruto)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tarif UKK Harian:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatRupiah(transportUkkData.ukkPerhari || 132250)} / hari</span>
                  </div>
                  
                  {/* Rincian Keterlambatan & Pulang Cepat */}
                  {((transportUkkData.datangLambatMin5 || 0) > 0 || (transportUkkData.datangLambatPlus5 || 0) > 0 || (transportUkkData.pulangCepatMin5 || 0) > 0 || (transportUkkData.pulangCepatPlus5 || 0) > 0) && (
                    <div className="py-1 px-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 space-y-1 text-[11px]">
                      {(transportUkkData.datangLambatMin5 || 0) > 0 && (
                        <div className="flex justify-between text-rose-700 dark:text-rose-300">
                          <span>• Terlambat &lt; 5m (Pot. 50% UKK):</span>
                          <span>{transportUkkData.datangLambatMin5}x (-{formatRupiah((transportUkkData.datangLambatMin5 || 0) * 0.5 * (transportUkkData.ukkPerhari || 132250))})</span>
                        </div>
                      )}
                      {(transportUkkData.datangLambatPlus5 || 0) > 0 && (
                        <div className="flex justify-between text-rose-700 dark:text-rose-300 font-semibold">
                          <span>• Terlambat &gt; 5m (Hilang 100% UKK):</span>
                          <span>{transportUkkData.datangLambatPlus5}x (-{formatRupiah((transportUkkData.datangLambatPlus5 || 0) * 1.0 * (transportUkkData.ukkPerhari || 132250))})</span>
                        </div>
                      )}
                      {(transportUkkData.pulangCepatMin5 || 0) > 0 && (
                        <div className="flex justify-between text-rose-700 dark:text-rose-300">
                          <span>• Pulang Cepat &lt; 5m (Pot. 50% UKK):</span>
                          <span>{transportUkkData.pulangCepatMin5}x (-{formatRupiah((transportUkkData.pulangCepatMin5 || 0) * 0.5 * (transportUkkData.ukkPerhari || 132250))})</span>
                        </div>
                      )}
                      {(transportUkkData.pulangCepatPlus5 || 0) > 0 && (
                        <div className="flex justify-between text-rose-700 dark:text-rose-300 font-semibold">
                          <span>• Pulang Cepat &gt; 5m (Hilang 100% UKK):</span>
                          <span>{transportUkkData.pulangCepatPlus5}x (-{formatRupiah((transportUkkData.pulangCepatPlus5 || 0) * 1.0 * (transportUkkData.ukkPerhari || 132250))})</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Potongan Keterlambatan:</span>
                    <span className="text-rose-600 font-medium">{transportUkkData.potonganTerlambatPersen}%</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Potongan Absensi / Alpa:</span>
                    <span className="text-rose-600 font-medium">{transportUkkData.potonganAbsenPersen}% ({((transportUkkData.sakit || 0) + (transportUkkData.izin || 0) + (transportUkkData.alpa || 0) + (transportUkkData.dinluar || 0))} hari)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                    <span>Total Pemotongan UKK:</span>
                    <span className="font-bold text-rose-600">-{formatRupiah(transportUkkData.ukkPotongan)} ({transportUkkData.totalPotonganPersen}%)</span>
                  </div>
                  <div className="flex justify-between text-indigo-900 dark:text-indigo-200 pt-2 border-t border-indigo-200 dark:border-indigo-800 font-bold text-sm">
                    <span>UKK Bersih Diterima:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(transportUkkData.ukkDiterima)}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Transport */}
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="font-bold text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
                  <span>2. Biaya Transportasi</span>
                  <Bus className="w-4 h-4 text-amber-600" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tarif per Hari:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(transportUkkData.tarifTransporHarian)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Hari Hadir Efektif:</span>
                    <span className="font-semibold">{transportUkkData.jumlahHadir} hari</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Transpor Bruto:</span>
                    <span>{formatRupiah(transportUkkData.transporBruto)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-amber-200 dark:border-amber-800">
                    <span>Potongan Alpa:</span>
                    <span className="text-rose-600">-{formatRupiah(transportUkkData.transporPotongan)}</span>
                  </div>
                  <div className="flex justify-between text-amber-900 dark:text-amber-200 pt-2 border-t border-amber-200 dark:border-amber-800 font-bold">
                    <span>Transpor Bersih Diterima:</span>
                    <span>{formatRupiah(transportUkkData.transporDiterima)}</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Uang Makan */}
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-3">
                <div className="font-bold text-purple-900 dark:text-purple-200 text-xs flex items-center justify-between">
                  <span>3. Uang Makan</span>
                  <Utensils className="w-4 h-4 text-purple-600" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tarif per Hari:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(transportUkkData.tarifUangMakanHarian || transportUkkData.uangMakanPerhari || 30000)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Hari Hadir Efektif:</span>
                    <span className="font-semibold">{transportUkkData.jumlahHadir} hari</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Formula:</span>
                    <span className="font-mono text-[10px]">Hadir x Tarif</span>
                  </div>
                  <div className="flex justify-between text-purple-900 dark:text-purple-200 pt-6 border-t border-purple-200 dark:border-purple-800 font-bold">
                    <span>Uang Makan Diterima:</span>
                    <span>{formatRupiah(transportUkkData.uangMakanDiterima)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Grand Formula Bar */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Grand Total Akumulasi (UKK + Transpor + Uang Makan)
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Nilai ini otomatis disinkronkan ke slip penghasilan bulanan Anda.
                  </div>
                </div>
              </div>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                {formatRupiah(transportUkkData.grandTotal || transportUkkData.totalJumlahUang || ((transportUkkData.ukkDiterima || 0) + (transportUkkData.transporDiterima || 0) + (transportUkkData.uangMakanDiterima || 0)))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
