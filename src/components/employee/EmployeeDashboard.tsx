import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSalary } from '../../context/SalaryContext';
import { formatRupiah, formatIndonesianDate, calculatePercentage } from '../../utils/currencyFormatter';
import { EmployeeSalaryMatrixProcess } from './EmployeeSalaryMatrixProcess';
import { EmployeeAttendanceView } from './EmployeeAttendanceView';
import { EmployeeDutyLetterView } from './EmployeeDutyLetterView';
import { EmployeeTransportUkkView } from './EmployeeTransportUkkView';
import { EmployeeUkkAdjustmentView } from './EmployeeUkkAdjustmentView';
import { synchronizeSalaryRecordFromAllSources } from '../../utils/salarySynchronizer';
import {
  Download,
  Eye,
  Calendar,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Building,
  CreditCard,
  FileText,
  HelpCircle,
  Sparkles,
  Info,
  CalendarDays,
  Percent,
  Layers,
  ChevronRight,
  ShieldCheck,
  Calculator,
  CalendarCheck,
  Briefcase,
  Bus,
  BadgePercent,
} from 'lucide-react';
import { SalaryRecord } from '../../types';

export const EmployeeDashboard: React.FC = () => {
  const { currentEmployee, employees, switchEmployee, setIsSwitcherOpen } = useAuth();
  const {
    getEmployeeRecords,
    openSlipModal,
    companyProfile,
    showToast,
    activeEmployeeTab,
    setActiveEmployeeTab,
    salaryMatrix,
    transportUkkRecords,
    ukkAdjustmentRecords,
  } = useSalary();

  if (!currentEmployee) {
    return (
      <div className="p-12 text-center text-slate-500">
        Silakan pilih profil karyawan terlebih dahulu.
      </div>
    );
  }

  const rawEmployeeRecords = getEmployeeRecords(currentEmployee.id, true);
  
  // Synchronize every record with Master Gaji Pokok & UKK Akhir
  const employeeRecords = rawEmployeeRecords.map((r) =>
    synchronizeSalaryRecordFromAllSources(
      r,
      salaryMatrix,
      transportUkkRecords,
      ukkAdjustmentRecords,
      employees
    )
  );

  // Selected period to inspect
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    employeeRecords.length > 0 ? employeeRecords[0].id : ''
  );

  // Active record to display
  const activeRecord: SalaryRecord | null =
    employeeRecords.find((r) => r.id === selectedRecordId) ||
    (employeeRecords.length > 0 ? employeeRecords[0] : null);

  // Find previous month record for comparison
  const activeIndex = employeeRecords.findIndex((r) => r.id === activeRecord?.id);
  const previousRecord: SalaryRecord | null =
    activeIndex !== -1 && activeIndex + 1 < employeeRecords.length
      ? employeeRecords[activeIndex + 1]
      : null;

  const diffNet = activeRecord && previousRecord ? activeRecord.netSalary - previousRecord.netSalary : 0;
  const isNetHigher = diffNet >= 0;

  const [inquiryText, setInquiryText] = useState('');
  const [isInquirySent, setIsInquirySent] = useState(false);

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setIsInquirySent(true);
    showToast('Pertanyaan slip gaji Anda telah diteruskan ke tim HRD.', 'success');
    setInquiryText('');
    setTimeout(() => setIsInquirySent(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. EMPLOYEE HEADER - CLEAN MINIMALISM */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Portal Karyawan
            </span>
            <span className="text-xs text-slate-400 font-medium">• Status: {currentEmployee.employmentStatus}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Slip Gaji Periode {activeRecord?.periodLabel || 'Terkini'}
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
            ID Karyawan: <span className="font-mono text-slate-700">{currentEmployee.nip}</span> • {currentEmployee.name} ({currentEmployee.position} - {currentEmployee.department})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Period Selector Dropdown */}
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <select
              id="select-employee-period"
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              aria-label="Pilih Periode Slip Gaji"
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {employeeRecords.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.periodLabel} {rec.id === employeeRecords[0]?.id ? '(Terbaru)' : ''}
                </option>
              ))}
            </select>
          </div>

          {activeRecord && (
            <button
              id="btn-quick-download-pdf"
              onClick={() => openSlipModal(activeRecord)}
              className="bg-slate-900 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all text-xs sm:text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Slip Gaji (PDF)</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. STATS SECTION - 3 CARDS AS SPECIFIED IN CLEAN MINIMALISM */}
      {activeRecord && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Main Take Home Pay Highlight (Blue 600) */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 flex flex-col justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">
                Total Gaji Diterima (Take Home Pay)
              </p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight font-mono">
                {formatRupiah(activeRecord.netSalary)}
              </p>
            </div>
            <div className="text-xs text-blue-100 mt-4 pt-3 border-t border-blue-500/40 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ditransfer ke {currentEmployee.bankName}
              </span>
              <button
                onClick={() => openSlipModal(activeRecord)}
                className="underline underline-offset-2 hover:text-white font-medium text-xs"
              >
                Lihat Slip
              </button>
            </div>
          </div>

          {/* Card 2: Total Penghasilan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                Total Penghasilan
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800 font-mono">
                {formatRupiah(activeRecord.totalEarnings)}
              </p>
            </div>
            <div className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 flex justify-between">
              <span>Gaji Pokok: {formatRupiah(activeRecord.basicSalary)}</span>
              <span>Tunjangan: {formatRupiah(activeRecord.totalEarnings - activeRecord.basicSalary)}</span>
            </div>
          </div>

          {/* Card 3: Total Potongan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-red-500 text-xs font-medium uppercase tracking-wider mb-1">
                Total Potongan
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 font-mono">
                -{formatRupiah(activeRecord.totalDeductions)}
              </p>
            </div>
            <div className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 flex justify-between">
              <span>BPJS & Pajak: {formatRupiah(activeRecord.bpjsKetenagakerjaan + activeRecord.bpjsKesehatan + activeRecord.pph21)}</span>
              <span>Lainnya: {formatRupiah(activeRecord.totalDeductions - (activeRecord.bpjsKetenagakerjaan + activeRecord.bpjsKesehatan + activeRecord.pph21))}</span>
            </div>
          </div>
        </section>
      )}

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs sm:text-sm font-semibold pb-2">
        <button
          id="tab-ringkasan"
          onClick={() => setActiveEmployeeTab('ringkasan')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeEmployeeTab === 'ringkasan'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Rincian Gaji Bulan Ini</span>
        </button>

        <button
          id="tab-skema"
          onClick={() => setActiveEmployeeTab('skema')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeEmployeeTab === 'skema'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-blue-50 font-medium'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Sumber & Proses Hitung Gaji Pokok</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            activeEmployeeTab === 'skema' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            Transparan
          </span>
        </button>

        {/* Dedicated Employee Transport & UKK Tab */}
        <button
          id="tab-transport-ukk"
          onClick={() => setActiveEmployeeTab('transport-ukk')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeEmployeeTab === 'transport-ukk'
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-emerald-50 font-medium'
          }`}
        >
          <Bus className="w-4 h-4 text-amber-400" />
          <span>Hitung Transport & UKK</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            activeEmployeeTab === 'transport-ukk' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Rincian
          </span>
        </button>

        {/* Dedicated Employee UKK Adjustment & Bank Tab */}
        <button
          id="tab-ukk-adjustments"
          onClick={() => setActiveEmployeeTab('ukk-adjustments')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeEmployeeTab === 'ukk-adjustments'
              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-emerald-50 font-medium'
          }`}
        >
          <BadgePercent className="w-4 h-4 text-emerald-400" />
          <span>Penyesuaian & Rekening UKK</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            activeEmployeeTab === 'ukk-adjustments' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Transfer
          </span>
        </button>

        {/* Dedicated Employee Attendance Tab */}
        <button
          id="tab-absensi"
          onClick={() => setActiveEmployeeTab('absensi')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeEmployeeTab === 'absensi'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-blue-50 font-medium'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Data Rekap Absensi (PDF/JPG)</span>
        </button>

        {/* Dedicated Employee Duty Letters Tab */}
        <button
          id="tab-surat-tugas"
          onClick={() => setActiveEmployeeTab('surat-tugas')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeEmployeeTab === 'surat-tugas'
              ? 'bg-amber-600 text-white font-semibold shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-amber-50 font-medium'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-500" />
          <span>Surat Tugas Bulanan (PDF/JPG)</span>
        </button>

        <button
          id="tab-riwayat"
          onClick={() => setActiveEmployeeTab('riwayat')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeEmployeeTab === 'riwayat'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Riwayat Gaji ({employeeRecords.length} Periode)</span>
        </button>

        <button
          id="tab-bantuan"
          onClick={() => setActiveEmployeeTab('bantuan')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeEmployeeTab === 'bantuan'
              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Bantuan & Tanya HRD</span>
        </button>
      </div>

      {/* 4. TAB CONTENT: RINGKASAN GAJI TERKINI */}
      {activeEmployeeTab === 'ringkasan' && activeRecord && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* TOP SUMMARY BANNER: SUMBER GAJI POKOK & UKK AKHIR */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-800/60">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                  Ringkasan Komponen Penggajian Resmi
                </span>
                <h2 className="text-lg sm:text-xl font-bold mt-1">
                  Sumber Gaji Pokok & UKK Akhir Diterima Pegawai
                </h2>
              </div>
              <div className="text-xs text-slate-300 font-mono">
                Bank Penyalur: <span className="font-bold text-white">{activeRecord.bankName || currentEmployee.bankName || 'BSI'} ({activeRecord.bankAccountNumber || currentEmployee.accountNumber || '-'})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4 text-xs">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-300 block font-medium">1. Sumber Gaji Pokok Akhir</span>
                <span className="text-base sm:text-lg font-bold font-mono text-white mt-1 block">
                  {formatRupiah(activeRecord.sumberGajiPokokAkhir || activeRecord.basicSalary)}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-300 block font-medium">2. Grand Total UKK Awal</span>
                <span className="text-base sm:text-lg font-bold font-mono text-slate-200 mt-1 block">
                  {formatRupiah(activeRecord.ukkGrandTotalAwal || (activeRecord.transportAllowance + activeRecord.mealAllowance))}
                </span>
              </div>

              <div className="bg-emerald-500/20 backdrop-blur-xs rounded-xl p-3 border border-emerald-400/40">
                <span className="text-[11px] text-emerald-300 block font-bold">3. UKK Akhir Diterima (Net)</span>
                <span className="text-base sm:text-lg font-bold font-mono text-emerald-300 mt-1 block">
                  {formatRupiah(activeRecord.ukkNetAkhirDiterima || (activeRecord.transportAllowance + activeRecord.mealAllowance))}
                </span>
              </div>

              <div className="bg-blue-500/25 backdrop-blur-xs rounded-xl p-3 border border-blue-400/40">
                <span className="text-[11px] text-blue-300 block font-bold">4. Total Gaji Dibayar (THP)</span>
                <span className="text-base sm:text-lg font-bold font-mono text-white mt-1 block">
                  {formatRupiah(activeRecord.netSalary)}
                </span>
              </div>
            </div>
          </div>

          {/* TWO COLUMN BREAKDOWN AS SPECIFIED IN CLEAN MINIMALISM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN: RINCIAN PENGHASILAN */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Rincian Penghasilan
                </h3>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Total: {formatRupiah(activeRecord.totalEarnings)}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
                {/* Gaji Pokok */}
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <div>
                    <span className="text-slate-700 font-medium text-xs sm:text-sm block">Gaji Pokok</span>
                    <span className="text-[11px] text-slate-400">Gaji dasar sesuai kontrak kerja</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                    {formatRupiah(activeRecord.basicSalary)}
                  </span>
                </div>

                {/* Tunjangan Jabatan */}
                {activeRecord.positionAllowance > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Tunjangan Jabatan</span>
                      <span className="text-[11px] text-slate-400">Tanggung jawab peran {currentEmployee.position}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                      {formatRupiah(activeRecord.positionAllowance)}
                    </span>
                  </div>
                )}

                {/* Tunjangan Transportasi */}
                {activeRecord.transportAllowance > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Tunjangan Transportasi</span>
                      <span className="text-[11px] text-slate-400">Operasional perjalanan dinas harian</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                      {formatRupiah(activeRecord.transportAllowance)}
                    </span>
                  </div>
                )}

                {/* Tunjangan Makan */}
                {activeRecord.mealAllowance > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Uang Makan</span>
                      <span className="text-[11px] text-slate-400">Tunjangan konsumsi hari kerja</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                      {formatRupiah(activeRecord.mealAllowance)}
                    </span>
                  </div>
                )}

                {/* Tunjangan Kehadiran */}
                {activeRecord.attendanceAllowance > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Tunjangan Kehadiran Penuh</span>
                      <span className="text-[11px] text-slate-400">{activeRecord.attendance.presentDays} hari hadir penuh</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                      {formatRupiah(activeRecord.attendanceAllowance)}
                    </span>
                  </div>
                )}

                {/* Lembur (Overtime) */}
                {activeRecord.overtimePay > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Upah Lembur</span>
                      <span className="text-[11px] text-slate-400">Kompensasi jam kerja tambahan</span>
                    </div>
                    <span className="font-bold text-emerald-600 font-mono text-xs sm:text-sm">
                      +{formatRupiah(activeRecord.overtimePay)}
                    </span>
                  </div>
                )}

                {/* Bonus Kinerja */}
                {activeRecord.bonusPay > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Bonus Kinerja / Insentif</span>
                      <span className="text-[11px] text-slate-400">Apresiasi pencapaian target bulanan</span>
                    </div>
                    <span className="font-bold text-emerald-600 font-mono text-xs sm:text-sm">
                      +{formatRupiah(activeRecord.bonusPay)}
                    </span>
                  </div>
                )}

                {/* THR */}
                {activeRecord.thrPay > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Tunjangan Hari Raya (THR)</span>
                      <span className="text-[11px] text-slate-400">Tunjangan keagamaan tahunan</span>
                    </div>
                    <span className="font-bold text-purple-600 font-mono text-xs sm:text-sm">
                      +{formatRupiah(activeRecord.thrPay)}
                    </span>
                  </div>
                )}

                {/* Tunjangan Wali Kelas */}
                {activeRecord.tunjanganWaliKelas !== undefined && activeRecord.tunjanganWaliKelas > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-emerald-50/40 px-2 rounded-lg">
                    <div>
                      <span className="text-slate-800 font-medium text-xs sm:text-sm block">Tunjangan Wali Kelas</span>
                      <span className="text-[11px] text-emerald-700">Tambahan tunjangan UKK</span>
                    </div>
                    <span className="font-bold text-emerald-700 font-mono text-xs sm:text-sm">
                      +{formatRupiah(activeRecord.tunjanganWaliKelas)}
                    </span>
                  </div>
                )}

                {/* Tunjangan Staff Pimpinan */}
                {activeRecord.tunjanganStaffPimpinan !== undefined && activeRecord.tunjanganStaffPimpinan > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-emerald-50/40 px-2 rounded-lg">
                    <div>
                      <span className="text-slate-800 font-medium text-xs sm:text-sm block">Tunjangan Staff Pimpinan</span>
                      <span className="text-[11px] text-emerald-700">Tambahan tunjangan UKK</span>
                    </div>
                    <span className="font-bold text-emerald-700 font-mono text-xs sm:text-sm">
                      +{formatRupiah(activeRecord.tunjanganStaffPimpinan)}
                    </span>
                  </div>
                )}

                {/* Other Earnings */}
                {activeRecord.otherEarnings > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">
                        Pendapatan Lainnya {activeRecord.otherEarningsNote && `(${activeRecord.otherEarningsNote})`}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 font-mono text-xs sm:text-sm">
                      +{formatRupiah(activeRecord.otherEarnings)}
                    </span>
                  </div>
                )}

                {/* Total Summary Row */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900 text-xs sm:text-sm">
                  <span>TOTAL PENERIMAAN (BRUTO)</span>
                  <span className="font-mono text-base">{formatRupiah(activeRecord.totalEarnings)}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: RINCIAN POTONGAN */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Rincian Potongan
                </h3>
                <span className="text-xs font-mono font-bold text-red-600">
                  Total: -{formatRupiah(activeRecord.totalDeductions)}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
                {/* BPJS Ketenagakerjaan */}
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <div>
                    <span className="text-slate-700 font-medium text-xs sm:text-sm block">BPJS Ketenagakerjaan</span>
                    <span className="text-[11px] text-slate-400">JHT (2%) + Jaminan Pensiun (1%)</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                    {formatRupiah(activeRecord.bpjsKetenagakerjaan)}
                  </span>
                </div>

                {/* BPJS Kesehatan */}
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <div>
                    <span className="text-slate-700 font-medium text-xs sm:text-sm block">BPJS Kesehatan</span>
                    <span className="text-[11px] text-slate-400">Iuran jaminan kesehatan (1%)</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                    {formatRupiah(activeRecord.bpjsKesehatan)}
                  </span>
                </div>

                {/* PPh 21 */}
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <div>
                    <span className="text-slate-700 font-medium text-xs sm:text-sm block">Pajak PPh 21</span>
                    <span className="text-[11px] text-slate-400">Pajak penghasilan status {currentEmployee.taxStatus}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                    {formatRupiah(activeRecord.pph21)}
                  </span>
                </div>

                {/* Potongan Keterlambatan */}
                {activeRecord.latePenalty > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Potongan Keterlambatan</span>
                      <span className="text-[11px] text-red-500">Terlambat {activeRecord.attendance.lateHours} jam kerja</span>
                    </div>
                    <span className="font-bold text-red-600 font-mono text-xs sm:text-sm">
                      -{formatRupiah(activeRecord.latePenalty)}
                    </span>
                  </div>
                )}

                {/* Cicilan Kasbon */}
                {activeRecord.loanDeduction > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Cicilan Kasbon / Pinjaman</span>
                      <span className="text-[11px] text-slate-400">Angsuran pinjaman pegawai</span>
                    </div>
                    <span className="font-bold text-red-600 font-mono text-xs sm:text-sm">
                      -{formatRupiah(activeRecord.loanDeduction)}
                    </span>
                  </div>
                )}

                {/* Iuran Koperasi */}
                {activeRecord.coopDeduction > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">Iuran Koperasi</span>
                      <span className="text-[11px] text-slate-400">Simpanan wajib koperasi karyawan</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                      {formatRupiah(activeRecord.coopDeduction)}
                    </span>
                  </div>
                )}

                {/* Potongan Kesra */}
                {activeRecord.potonganKesra !== undefined && activeRecord.potonganKesra > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-rose-50/40 px-2 rounded-lg">
                    <div>
                      <span className="text-slate-800 font-medium text-xs sm:text-sm block">Potongan Kesra</span>
                      <span className="text-[11px] text-rose-600">Potongan UKK</span>
                    </div>
                    <span className="font-bold text-rose-600 font-mono text-xs sm:text-sm">
                      -{formatRupiah(activeRecord.potonganKesra)}
                    </span>
                  </div>
                )}

                {/* Potongan Koperasi YPI */}
                {activeRecord.potonganKoperasiYpi !== undefined && activeRecord.potonganKoperasiYpi > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-rose-50/40 px-2 rounded-lg">
                    <div>
                      <span className="text-slate-800 font-medium text-xs sm:text-sm block">Potongan Koperasi YPI</span>
                      <span className="text-[11px] text-rose-600">Potongan UKK</span>
                    </div>
                    <span className="font-bold text-rose-600 font-mono text-xs sm:text-sm">
                      -{formatRupiah(activeRecord.potonganKoperasiYpi)}
                    </span>
                  </div>
                )}

                {/* Potongan Koperasi YWAM */}
                {activeRecord.potonganKoperasiYwam !== undefined && activeRecord.potonganKoperasiYwam > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-rose-50/40 px-2 rounded-lg">
                    <div>
                      <span className="text-slate-800 font-medium text-xs sm:text-sm block">Potongan Koperasi YWAM</span>
                      <span className="text-[11px] text-rose-600">Potongan UKK</span>
                    </div>
                    <span className="font-bold text-rose-600 font-mono text-xs sm:text-sm">
                      -{formatRupiah(activeRecord.potonganKoperasiYwam)}
                    </span>
                  </div>
                )}

                {/* Potongan YW AMJP */}
                {activeRecord.potonganYwAmjp !== undefined && activeRecord.potonganYwAmjp > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 bg-rose-50/40 px-2 rounded-lg">
                    <div>
                      <span className="text-slate-800 font-medium text-xs sm:text-sm block">Potongan YW AMJP</span>
                      <span className="text-[11px] text-rose-600">Potongan UKK</span>
                    </div>
                    <span className="font-bold text-rose-600 font-mono text-xs sm:text-sm">
                      -{formatRupiah(activeRecord.potonganYwAmjp)}
                    </span>
                  </div>
                )}

                {/* Other Deductions */}
                {activeRecord.otherDeductions > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div>
                      <span className="text-slate-700 font-medium text-xs sm:text-sm block">
                        Potongan Lainnya {activeRecord.otherDeductionsNote && `(${activeRecord.otherDeductionsNote})`}
                      </span>
                    </div>
                    <span className="font-bold text-red-600 font-mono text-xs sm:text-sm">
                      -{formatRupiah(activeRecord.otherDeductions)}
                    </span>
                  </div>
                )}

                {/* If no other deductions */}
                {activeRecord.loanDeduction === 0 && activeRecord.latePenalty === 0 && (
                  <div className="py-2 text-[11px] text-slate-400 italic">
                    Tidak ada potongan keterlambatan atau cicilan pinjaman aktif.
                  </div>
                )}

                {/* Total Summary Row */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-bold text-red-600 text-xs sm:text-sm">
                  <span>TOTAL POTONGAN RESMI</span>
                  <span className="font-mono text-base">-{formatRupiah(activeRecord.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER STATUS BAR AS SPECIFIED IN CLEAN MINIMALISM */}
          <footer className="mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 px-6 bg-white rounded-2xl border border-slate-200 gap-3 shadow-xs">
            <div className="flex flex-wrap gap-4 sm:gap-6 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Terakhir Diupdate: {formatIndonesianDate(activeRecord.paymentDate)}</span>
              <span>•</span>
              <span>Verified by HR System</span>
              <span>•</span>
              <span>No. Slip: {activeRecord.slipNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[12px] text-slate-600 font-medium">
                Status Gaji: Terbayarkan ({currentEmployee.bankName} - {currentEmployee.accountNumber})
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* 5. TAB CONTENT: RIWAYAT GAJI BULAN-BULAN SEBELUMNYA */}
      {activeEmployeeTab === 'riwayat' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Riwayat Slip Gaji ({employeeRecords.length} Periode)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lihat dan unduh kembali slip gaji Anda dari bulan-bulan sebelumnya secara mandiri
                </p>
              </div>
            </div>

            {/* Table of History */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4">Tanggal Transfer</th>
                    <th className="py-3 px-4">Total Pendapatan</th>
                    <th className="py-3 px-4">Total Potongan</th>
                    <th className="py-3 px-4">Gaji Bersih (THP)</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeeRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        rec.id === activeRecord?.id ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{rec.periodLabel}</div>
                        <div className="text-[10px] font-mono text-slate-400">{rec.slipNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatIndonesianDate(rec.paymentDate)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {formatRupiah(rec.totalEarnings)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-red-600">
                        -{formatRupiah(rec.totalDeductions)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        {formatRupiah(rec.netSalary)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`btn-open-history-${rec.id}`}
                          onClick={() => {
                            setSelectedRecordId(rec.id);
                            openSlipModal(rec);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: SUMBER & PROSES HITUNG GAJI POKOK (TRANSPARANSI SKEMA FORMULA) */}
      {activeEmployeeTab === 'skema' && <EmployeeSalaryMatrixProcess />}

      {/* 5b. TAB CONTENT: SUMBER & PROSES HITUNG TRANSPORT & UKK */}
      {activeEmployeeTab === 'transport-ukk' && <EmployeeTransportUkkView />}

      {/* 5c. TAB CONTENT: PENYESUAIAN TUNJANGAN & POTONGAN UKK */}
      {activeEmployeeTab === 'ukk-adjustments' && <EmployeeUkkAdjustmentView employee={currentEmployee} />}

      {/* 6. TAB CONTENT: REKAP ABSENSI RESMI PEGAWAI (PDF / SCAN JPG) */}
      {activeEmployeeTab === 'absensi' && <EmployeeAttendanceView />}

      {/* 7. TAB CONTENT: SURAT TUGAS BULANAN RESMI (PDF / SCAN JPG) */}
      {activeEmployeeTab === 'surat-tugas' && <EmployeeDutyLetterView />}

      {/* 8. TAB CONTENT: BANTUAN & TANYA HRD */}
      {activeEmployeeTab === 'bantuan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Pertanyaan Umum (FAQ)</h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900">Kapan slip gaji diterbitkan setiap bulannya?</div>
                <div className="text-slate-600 mt-1">
                  Slip gaji otomatis diterbitkan pada tanggal 25 setiap bulannya setelah verifikasi oleh tim Payroll & Finance.
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900">Bagaimana jika terdapat ketidaksesuaian nominal lembur/potongan?</div>
                <div className="text-slate-600 mt-1">
                  Anda dapat menghubungi HRD langsung melalui form pesan di sebelah kanan ini dengan mencantumkan nomor slip gaji Anda.
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900">Apakah dokumen PDF ini sah untuk keperluan bank/kredit?</div>
                <div className="text-slate-600 mt-1">
                  Ya, slip gaji PDF yang diunduh melalui portal ini dilengkapi dengan stempel digital, nomor dokumen unik, dan QR code resmi perusahaan.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Kirim Pertanyaan ke HRD / Finance</h2>
            <p className="text-xs text-slate-500 mb-4">
              Ada pertanyaan seputar gaji periode {activeRecord?.periodLabel || ''}?
            </p>

            <form onSubmit={handleSendInquiry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Karyawan Pengirim
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentEmployee.name} (${currentEmployee.nip})`}
                  className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pesan atau Pertanyaan Anda
                </label>
                <textarea
                  rows={4}
                  required
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="Contoh: Halo HRD, mohon informasi mengenai rincian perhitungan lembur tanggal 15 Januari kemarin..."
                  className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                />
              </div>

              {isInquirySent && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                  ✓ Pesan Anda telah terkirim ke HRD ({companyProfile.email}). Tim payroll akan menindaklanjuti dalam 1x24 jam.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                Kirim Pertanyaan ke HRD
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
