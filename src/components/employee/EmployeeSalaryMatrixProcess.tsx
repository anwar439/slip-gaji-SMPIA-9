import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSalary } from '../../context/SalaryContext';
import { calculateSalaryMatrixRow } from '../../data/salaryMatrixData';
import { formatRupiah } from '../../utils/currencyFormatter';
import {
  Calculator,
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  Building2,
  Layers,
  ArrowRight,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  DollarSign,
  HeartHandshake,
  CheckCircle2,
  FileSpreadsheet,
  BadgeCheck,
  UserCheck,
} from 'lucide-react';

function cleanStr(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

export const EmployeeSalaryMatrixProcess: React.FC = () => {
  const { currentEmployee: authEmployee } = useAuth();
  const { salaryMatrix, employees, companyProfile } = useSalary();

  // Active current employee from either auth or salary context
  const currentEmployee = useMemo(() => {
    if (!authEmployee) return employees[0] || null;
    return employees.find((e) => e.id === authEmployee.id || (e.nip && authEmployee.nip && e.nip === authEmployee.nip)) || authEmployee;
  }, [authEmployee, employees]);

  // Find the exact matrix calculation row for this employee from admin data
  const employeeMatrixData = useMemo(() => {
    if (!currentEmployee) return null;
    const cleanNip = cleanStr(currentEmployee.nip);
    const cleanName = cleanStr(currentEmployee.name);

    return (
      salaryMatrix.find(
        (m) =>
          (m.nip && cleanNip && cleanStr(m.nip) === cleanNip) ||
          (cleanName && cleanStr(m.name) === cleanName) ||
          (cleanName && cleanStr(m.name).includes(cleanName)) ||
          (cleanName && cleanName.includes(cleanStr(m.name)))
      ) || null
    );
  }, [currentEmployee, salaryMatrix]);

  // Fallback calculated row if employee is not in matrix list
  const activeMatrix = useMemo(() => {
    if (employeeMatrixData) return employeeMatrixData;
    if (!currentEmployee) return null;

    // Generate calculated row from employee baseline
    return calculateSalaryMatrixRow({
      nip: currentEmployee.nip,
      name: currentEmployee.name,
      employeeStatus: currentEmployee.employeeStatus || 'GTY',
      level: currentEmployee.level || 'V C',
      category: currentEmployee.category || 'GURU',
      indexNumber: 22,
      performancePercent: 100,
      indexValueNew: 125000,
      indexValueOld: 123500,
      serviceYears: 10,
      serviceMonths: 0,
      husbandWifeCount: 1,
      childCount: 2,
      taxStatus: currentEmployee.taxStatus || 'K/2',
      positionAllowanceBasic: currentEmployee.baseSalary > 3000000 ? 500000 : 0,
    });
  }, [employeeMatrixData, currentEmployee]);

  // Interactive Simulation State (Sandbox for employee self-exploration)
  const [showSimulator, setShowSimulator] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  // Simulation Parameters - synced when activeMatrix changes
  const [simIndexNumber, setSimIndexNumber] = useState<number>(activeMatrix?.indexNumber || 22);
  const [simIndexValue, setSimIndexValue] = useState<number>(activeMatrix?.indexValueNew || 125000);
  const [simPerformance, setSimPerformance] = useState<number>(activeMatrix?.performancePercent || 100);
  const [simServiceYears, setSimServiceYears] = useState<number>(activeMatrix?.serviceYears || 10);
  const [simWifeCount, setSimWifeCount] = useState<number>(activeMatrix?.husbandWifeCount || 1);
  const [simChildCount, setSimChildCount] = useState<number>(activeMatrix?.childCount || 2);
  const [simPositionAllowance, setSimPositionAllowance] = useState<number>(activeMatrix?.positionAllowanceBasic || 0);

  useEffect(() => {
    if (activeMatrix) {
      setSimIndexNumber(activeMatrix.indexNumber || 22);
      setSimIndexValue(activeMatrix.indexValueNew || 125000);
      setSimPerformance(activeMatrix.performancePercent || 100);
      setSimServiceYears(activeMatrix.serviceYears || 10);
      setSimWifeCount(activeMatrix.husbandWifeCount || 0);
      setSimChildCount(activeMatrix.childCount || 0);
      setSimPositionAllowance(activeMatrix.positionAllowanceBasic || 0);
    }
  }, [activeMatrix]);

  // Calculated Simulation Result
  const simulatedResult = useMemo(() => {
    if (!activeMatrix) return null;
    return calculateSalaryMatrixRow({
      ...activeMatrix,
      indexNumber: simIndexNumber,
      indexValueNew: simIndexValue,
      performancePercent: simPerformance,
      serviceYears: simServiceYears,
      husbandWifeCount: simWifeCount,
      childCount: simChildCount,
      positionAllowanceBasic: simPositionAllowance,
      positionAllowance: simPositionAllowance,
    });
  }, [
    activeMatrix,
    simIndexNumber,
    simIndexValue,
    simPerformance,
    simServiceYears,
    simWifeCount,
    simChildCount,
    simPositionAllowance,
  ]);

  if (!currentEmployee || !activeMatrix) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Data Pegawai Belum Dipilih</h3>
        <p className="text-xs text-slate-500 mt-1">Silakan pilih data pegawai untuk melihat sumber dan alur hitung gaji pokok.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Employee Profile & Matrix Highlight */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                <Calculator className="w-3.5 h-3.5" />
                Sumber & Formula Perhitungan Gaji Pokok
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeMatrix.employeeStatus} • Golongan {activeMatrix.level}
              </span>
              {activeMatrix.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200">
                  {activeMatrix.category}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {activeMatrix.name}
            </h2>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                NIP: <strong className="text-white">{activeMatrix.nip || '-'}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Masa Kerja: <strong className="text-white">{activeMatrix.serviceYears} Th {activeMatrix.serviceMonths} Bln</strong>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Keluarga: <strong className="text-white">{activeMatrix.husbandWifeCount} Istri, {activeMatrix.childCount} Anak ({activeMatrix.taxStatus})</strong>
              </span>
            </div>
          </div>

          {/* Key Summary Cards */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10 text-right min-w-[170px]">
              <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
                Gaji Pokok Kinerja
              </span>
              <span className="text-lg font-bold font-mono text-blue-200">
                {formatRupiah(activeMatrix.performanceBasicSalary)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Indeks {activeMatrix.indexNumber} × {formatRupiah(activeMatrix.indexValueNew)}
              </span>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-md rounded-xl p-3.5 border border-emerald-400/30 text-right min-w-[180px]">
              <span className="text-[10px] text-emerald-200 block uppercase font-bold tracking-wider">
                HASIL AKHIR: DIBAYARKAN (THP)
              </span>
              <span className="text-xl font-bold font-mono text-emerald-300">
                {formatRupiah(activeMatrix.netSalaryPaid)}
              </span>
              <span className="text-[10px] text-emerald-200/80 block mt-0.5 font-medium">
                Tabel Sumber Gaji Pokok Resmi
              </span>
            </div>

            <button
              onClick={handlePrint}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors flex items-center justify-center"
              title="Cetak Rincian Perhitungan"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-blue-950">Transparansi Skema Perhitungan Gaji Pokok Pegawai</p>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            Halaman ini menampilkan secara mendalam bagaimana nominal <strong>Gaji Pokok Kinerja</strong>, tunjangan yayasan, tunjangan keluarga, tunjangan daerah, hingga potongan resmi dihitung secara bertahap sampai menghasilkan <strong>Gaji Dibayarkan (THP)</strong> pada tabel paling kanan master yayasan.
          </p>
        </div>
      </div>

      {/* 5-Step Visual Calculation Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Alur & Tahapan Perhitungan Lengkap (Step-by-Step)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Peraturan Standar Yayasan
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* TAHAP 1: Gaji Pokok Kinerja */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Tahap 1: Perhitungan Gaji Pokok Nilai Kinerja
                  </h4>
                  <p className="text-xs text-slate-500">
                    Formula: (Angka Indeks × Satuan Indeks Baru) × Prosen Kinerja (%)
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 self-start sm:self-auto">
                = {formatRupiah(activeMatrix.performanceBasicSalary)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Angka Indeks Pegawai</span>
                <span className="font-bold text-slate-900 text-sm">{activeMatrix.indexNumber}</span>
                <span className="text-[10px] text-slate-400 block">Sesuai Gol. {activeMatrix.level}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Satuan Indeks Baru</span>
                <span className="font-bold text-slate-900 text-sm">{formatRupiah(activeMatrix.indexValueNew)}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  Naik +{formatRupiah(activeMatrix.indexDiff)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Prosen Kinerja</span>
                <span className="font-bold text-slate-900 text-sm">{activeMatrix.performancePercent}%</span>
                <span className="text-[10px] text-slate-400 block">Kinerja Standar</span>
              </div>
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100">
                <span className="text-blue-700 block text-[11px] font-medium">Tunjangan Jabatan Dasar</span>
                <span className="font-bold text-blue-900 text-sm">{formatRupiah(activeMatrix.positionAllowanceBasic)}</span>
                <span className="text-[10px] text-blue-600 block">
                  Total Gaji+Tunj: {formatRupiah(activeMatrix.totalSalaryAndAllowance)}
                </span>
              </div>
            </div>
          </div>

          {/* TAHAP 2: Tunjangan Yayasan & Keluarga */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Tahap 2: Tunjangan Yayasan, Pengabdian, & Keluarga
                  </h4>
                  <p className="text-xs text-slate-500">
                    Dihitung dari persentase terhadap Gaji Pokok Dasar ({formatRupiah(activeMatrix.baseSalaryComponent)})
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 self-start sm:self-auto">
                Total Tunjangan = {formatRupiah(activeMatrix.totalAllowances)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 font-medium">Tunj. Pengabdian (Masa Kerja)</span>
                  <span className="font-bold text-indigo-600">{activeMatrix.dedicationAllowancePercent}%</span>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {formatRupiah(activeMatrix.dedicationAllowanceAmount)}
                </div>
                <span className="text-[10px] text-slate-400">Masa kerja: {activeMatrix.serviceYears} Tahun</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 font-medium">Tunj. Keluarga</span>
                  <span className="font-bold text-indigo-600">{activeMatrix.familyAllowancePercent}%</span>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {formatRupiah(activeMatrix.familyAllowanceAmount)}
                </div>
                <span className="text-[10px] text-slate-400">
                  {activeMatrix.husbandWifeCount > 0 ? 'Istri (10%)' : '0%'} + {activeMatrix.childCount} Anak ({activeMatrix.childCount * 5}%)
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 font-medium">Tunj. Jabatan Struktural</span>
                  <span className="font-bold text-indigo-600">Tetap</span>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {formatRupiah(activeMatrix.positionAllowance)}
                </div>
                <span className="text-[10px] text-slate-400">Tunjangan fungsi struktural</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-700 bg-slate-50/50 p-2.5 rounded-lg">
              <span>Hasil Gaji Kotor (Gapok + Total Tunjangan):</span>
              <span className="font-mono text-slate-900 font-bold">{formatRupiah(activeMatrix.grossSalary)}</span>
            </div>
          </div>

          {/* TAHAP 3: Fasilitas & Tunjangan Daerah */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Tahap 3: Tunjangan Daerah & Fasilitas BPJS Yayasan
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tunjangan Daerah 10% ({formatRupiah(activeMatrix.regionalAllowanceAmount)}) + Fasilitas BPJS Yayasan
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold font-mono text-teal-700 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100 self-start sm:self-auto">
                Total Bruto = {formatRupiah(activeMatrix.totalSalaryReceived)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Tunjangan Daerah (10%)</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {formatRupiah(activeMatrix.regionalAllowanceAmount)}
                </span>
                <span className="text-[10px] text-slate-400 block">10% × Gaji Kotor</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">BPJS Kesehatan (Yayasan 4%)</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {formatRupiah(activeMatrix.bpjsKesFoundation)}
                </span>
                <span className="text-[10px] text-emerald-600 block font-medium">Ditanggung Penuh Yayasan</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-[11px]">BPJS Ketenagakerjaan (Yayasan)</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {formatRupiah(activeMatrix.bpjsKtFoundation)}
                </span>
                <span className="text-[10px] text-emerald-600 block font-medium">Ditanggung Penuh Yayasan</span>
              </div>
            </div>
          </div>

          {/* TAHAP 4: Potongan & Iuran */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-rose-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Tahap 4: Rincian Potongan & Iuran Resmi Pegawai
                  </h4>
                  <p className="text-xs text-slate-500">
                    BPJS Pegawai, Infaq, Koperasi, dan Potongan Daerah
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold font-mono text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 self-start sm:self-auto">
                Total Potongan = {formatRupiah(activeMatrix.totalDeduction)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 text-xs">
              <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                <span className="text-slate-600 block text-[10px]">BPJS Kes (1%)</span>
                <span className="font-bold text-rose-700 font-mono text-xs">{formatRupiah(activeMatrix.bpjsKesDeduction)}</span>
              </div>
              <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                <span className="text-slate-600 block text-[10px]">BPJS KT Pegawai</span>
                <span className="font-bold text-rose-700 font-mono text-xs">{formatRupiah(activeMatrix.bpjsKtDeduction)}</span>
              </div>
              <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                <span className="text-slate-600 block text-[10px]">Infaq Masjid</span>
                <span className="font-bold text-rose-700 font-mono text-xs">{formatRupiah(activeMatrix.infaqMasjid)}</span>
              </div>
              <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                <span className="text-slate-600 block text-[10px]">Pinjaman / Koperasi</span>
                <span className="font-bold text-rose-700 font-mono text-xs">{formatRupiah(activeMatrix.coopLoanDeduction)}</span>
              </div>
              <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 col-span-2 sm:col-span-1">
                <span className="text-slate-600 block text-[10px]">Potongan Daerah (10%)</span>
                <span className="font-bold text-rose-700 font-mono text-xs">{formatRupiah(activeMatrix.regionalDeduction)}</span>
              </div>
            </div>
          </div>

          {/* TAHAP 5: HASIL AKHIR GAJI DIBAYAR (THP) */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-7 h-7 text-emerald-100" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-emerald-100 block">
                    Tahap 5 • HASIL AKHIR (TABEL PALING KANAN)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Gaji Pokok & THP yang Dibayarkan
                  </h3>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    Jumlah Diterima ({formatRupiah(activeMatrix.totalSalaryReceived)}) - Total Potongan ({formatRupiah(activeMatrix.totalDeduction)})
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center sm:text-right w-full sm:w-auto">
                <span className="text-[11px] text-emerald-100 block font-semibold">
                  Nominal Ditransfer ke Rekening:
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white block mt-0.5">
                  {formatRupiah(activeMatrix.netSalaryPaid)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Section (Pegawai Self-Simulation Sandbox) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div
          onClick={() => setShowSimulator(!showSimulator)}
          className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Simulasi Kenaikan Gaji Pokok & Masa Kerja Mandiri
              </h4>
              <p className="text-xs text-slate-500">
                Coba simulasikan bagaimana kenaikan angka indeks, masa kerja, atau satuan yayasan mempengaruhi THP Anda.
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {showSimulator ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showSimulator && simulatedResult && (
          <div className="p-6 bg-slate-50/50 space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Slider 1: Angka Indeks */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Angka Indeks</span>
                  <span className="font-mono text-blue-600 font-bold">{simIndexNumber}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="35"
                  value={simIndexNumber}
                  onChange={(e) => setSimIndexNumber(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>15 (Gol A)</span>
                  <span>35 (Gol Tinggi)</span>
                </div>
              </div>

              {/* Slider 2: Satuan Indeks Baru */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Satuan Indeks Yayasan</span>
                  <span className="font-mono text-blue-600 font-bold">{formatRupiah(simIndexValue)}</span>
                </div>
                <input
                  type="range"
                  min="120000"
                  max="150000"
                  step="2500"
                  value={simIndexValue}
                  onChange={(e) => setSimIndexValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Rp 120.000</span>
                  <span>Rp 150.000</span>
                </div>
              </div>

              {/* Slider 3: Masa Kerja */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Masa Kerja</span>
                  <span className="font-mono text-blue-600 font-bold">{simServiceYears} Tahun</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={simServiceYears}
                  onChange={(e) => setSimServiceYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 Th (Baru)</span>
                  <span>35 Th</span>
                </div>
              </div>
            </div>

            {/* Simulasi Live Comparison Result */}
            <div className="bg-white p-5 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                  Hasil Simulasi Proyeksi Gaji
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbandingan Gaji Saat Ini vs Hasil Simulasi Anda
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Gaji Saat Ini</span>
                  <span className="text-sm font-bold font-mono text-slate-700">
                    {formatRupiah(activeMatrix.netSalaryPaid)}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-blue-500 shrink-0" />

                <div className="text-right bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Proyeksi Simulasi (THP)</span>
                  <span className="text-lg font-bold font-mono text-emerald-700">
                    {formatRupiah(simulatedResult.netSalaryPaid)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    {simulatedResult.netSalaryPaid >= activeMatrix.netSalaryPaid ? '+' : ''}
                    {formatRupiah(simulatedResult.netSalaryPaid - activeMatrix.netSalaryPaid)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Master Specs Table (Transparansi Seluruh Parameter) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div
          onClick={() => setShowFullSpecs(!showFullSpecs)}
          className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Lihat Seluruh 40 Parameter Perhitungan Yayasan
              </h4>
              <p className="text-xs text-slate-500">
                Tabel master data parameter kepegawaian Anda yang tercatat pada database Admin HRD.
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {showFullSpecs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showFullSpecs && (
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 border-b border-slate-200">Parameter</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Nilai Tercatat</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Keterangan / Rumus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Nomor Induk Pegawai (NIP)</td>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">{activeMatrix.nip || '-'}</td>
                  <td className="py-2 px-3 text-slate-500">Identitas kepegawaian resmi</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Status Kepegawaian & Golongan</td>
                  <td className="py-2 px-3 font-bold">{activeMatrix.employeeStatus} • {activeMatrix.level}</td>
                  <td className="py-2 px-3 text-slate-500">Menentukan baseline angka indeks</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Angka Indeks Nilai Kinerja</td>
                  <td className="py-2 px-3 font-mono font-bold">{activeMatrix.indexNumber}</td>
                  <td className="py-2 px-3 text-slate-500">Poin indeks evaluasi</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Satuan Nilai Indeks Baru</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-600">{formatRupiah(activeMatrix.indexValueNew)}</td>
                  <td className="py-2 px-3 text-slate-500">Standar yayasan (Sebelumnya {formatRupiah(activeMatrix.indexValueOld)})</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Prosen Kinerja (%)</td>
                  <td className="py-2 px-3 font-mono font-bold">{activeMatrix.performancePercent}%</td>
                  <td className="py-2 px-3 text-slate-500">Persentase pencapaian kinerja</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Gaji Pokok Kinerja (Gapok)</td>
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">{formatRupiah(activeMatrix.performanceBasicSalary)}</td>
                  <td className="py-2 px-3 text-slate-500">Angka × Satuan × Prosen</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Tunjangan Pengabdian (Masa Kerja)</td>
                  <td className="py-2 px-3 font-mono">{formatRupiah(activeMatrix.dedicationAllowanceAmount)} ({activeMatrix.dedicationAllowancePercent}%)</td>
                  <td className="py-2 px-3 text-slate-500">{activeMatrix.serviceYears} Tahun {activeMatrix.serviceMonths} Bulan</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Tunjangan Keluarga</td>
                  <td className="py-2 px-3 font-mono">{formatRupiah(activeMatrix.familyAllowanceAmount)} ({activeMatrix.familyAllowancePercent}%)</td>
                  <td className="py-2 px-3 text-slate-500">Istri ({activeMatrix.husbandWifeCount}) + Anak ({activeMatrix.childCount})</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Tunjangan Jabatan</td>
                  <td className="py-2 px-3 font-mono">{formatRupiah(activeMatrix.positionAllowance)}</td>
                  <td className="py-2 px-3 text-slate-500">Tunjangan fungsional/struktural</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Tunjangan Daerah (10%)</td>
                  <td className="py-2 px-3 font-mono">{formatRupiah(activeMatrix.regionalAllowanceAmount)}</td>
                  <td className="py-2 px-3 text-slate-500">10% dari Gaji Kotor ({formatRupiah(activeMatrix.grossSalary)})</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Iuran BPJS Kesehatan Pegawai (1%)</td>
                  <td className="py-2 px-3 font-mono text-rose-600">-{formatRupiah(activeMatrix.bpjsKesDeduction)}</td>
                  <td className="py-2 px-3 text-slate-500">Iuran resmi BPJS Kes</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Iuran BPJS Ketenagakerjaan Pegawai</td>
                  <td className="py-2 px-3 font-mono text-rose-600">-{formatRupiah(activeMatrix.bpjsKtDeduction)}</td>
                  <td className="py-2 px-3 text-slate-500">JHT & JKK Pegawai</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Infaq Masjid Yayasan</td>
                  <td className="py-2 px-3 font-mono text-rose-600">-{formatRupiah(activeMatrix.infaqMasjid)}</td>
                  <td className="py-2 px-3 text-slate-500">Infaq sosial yayasan</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Pinjaman / Koperasi</td>
                  <td className="py-2 px-3 font-mono text-rose-600">-{formatRupiah(activeMatrix.coopLoanDeduction)}</td>
                  <td className="py-2 px-3 text-slate-500">Koperasi karyawan</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-700">Potongan Tunjangan Daerah (10%)</td>
                  <td className="py-2 px-3 font-mono text-rose-600">-{formatRupiah(activeMatrix.regionalDeduction)}</td>
                  <td className="py-2 px-3 text-slate-500">Offset tunjangan daerah</td>
                </tr>
                <tr className="bg-emerald-50/80 font-bold">
                  <td className="py-2.5 px-3 text-emerald-900">GAJI DIBAYAR (THP / Net)</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 text-sm">{formatRupiah(activeMatrix.netSalaryPaid)}</td>
                  <td className="py-2.5 px-3 text-emerald-800">Hasil Akhir Tabel Paling Kanan</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
