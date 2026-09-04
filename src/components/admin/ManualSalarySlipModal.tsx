import React, { useState, useEffect, useMemo } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { SalaryRecord } from '../../types';
import { formatRupiah } from '../../utils/currencyFormatter';
import { synchronizeSalaryRecordFromAllSources } from '../../utils/salarySynchronizer';
import {
  X,
  Check,
  Calculator,
  User,
  Calendar,
  DollarSign,
  TrendingDown,
  Clock,
  Sparkles,
  Info,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface ManualSalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: SalaryRecord | null;
}

export const ManualSalarySlipModal: React.FC<ManualSalarySlipModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
}) => {
  const {
    employees,
    salaryMatrix,
    transportUkkRecords,
    ukkAdjustmentRecords,
    selectedPeriod,
    getCurrentPeriodConfig,
    updateSalaryRecord,
    addSalaryRecord,
    showToast,
  } = useSalary();

  const currentPeriodConfig = getCurrentPeriodConfig();

  // Selected employee for creating new or viewing
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    recordToEdit?.employeeId || employees[0]?.id || ''
  );

  // Administrative Editable State
  const [slipNumber, setSlipNumber] = useState('');
  const [period, setPeriod] = useState(selectedPeriod);
  const [periodLabel, setPeriodLabel] = useState(currentPeriodConfig.label);
  const [periodStartDate, setPeriodStartDate] = useState(currentPeriodConfig.startDate);
  const [periodEndDate, setPeriodEndDate] = useState(currentPeriodConfig.endDate);
  const [paymentDate, setPaymentDate] = useState(`${selectedPeriod}-25`);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [notes, setNotes] = useState(
    'Slip gaji resmi ini telah disinkronisasikan secara otomatis dari Master Gaji Pokok dan Transport & UKK Al Azhar 9.'
  );

  // Find currently active employee
  const currentEmp = useMemo(() => {
    return employees.find((e) => e.id === selectedEmpId) || employees[0];
  }, [employees, selectedEmpId]);

  // Sync and derive fully compliant salary numbers from all sources
  const syncedRecord = useMemo(() => {
    if (!currentEmp) return null;

    const baseSlip: SalaryRecord = recordToEdit
      ? { ...recordToEdit }
      : {
          id: `slip-${currentEmp.id}-${period}`,
          slipNumber: `SLIP/${period.replace('-', '')}/${(currentEmp.nip || '000').replace(/[^0-9]/g, '').slice(-4) || '001'}`,
          employeeId: currentEmp.id,
          employeeNip: currentEmp.nip,
          employeeName: currentEmp.name,
          employeePosition: currentEmp.position,
          employeeDepartment: currentEmp.department,
          period,
          periodLabel,
          periodStartDate,
          periodEndDate,
          paymentDate,
          status,
          attendance: {
            workDays: 22,
            presentDays: 22,
            sickDays: 0,
            permissionDays: 0,
            paidLeaveDays: 0,
            absentDays: 0,
            lateHours: 0,
          },
          basicSalary: currentEmp.baseSalary || 2750000,
          positionAllowance: 0,
          transportAllowance: 0,
          mealAllowance: 0,
          attendanceAllowance: 0,
          overtimePay: 0,
          bonusPay: 0,
          thrPay: 0,
          otherEarnings: 0,
          bpjsKetenagakerjaan: 0,
          bpjsKesehatan: 0,
          pph21: 0,
          latePenalty: 0,
          absencePenalty: 0,
          loanDeduction: 0,
          coopDeduction: 0,
          otherDeductions: 0,
          totalEarnings: 0,
          totalDeductions: 0,
          netSalary: 0,
          notes,
        };

    return synchronizeSalaryRecordFromAllSources(
      baseSlip,
      salaryMatrix,
      transportUkkRecords,
      ukkAdjustmentRecords,
      employees
    );
  }, [
    currentEmp,
    recordToEdit,
    period,
    periodLabel,
    periodStartDate,
    periodEndDate,
    paymentDate,
    status,
    notes,
    salaryMatrix,
    transportUkkRecords,
    ukkAdjustmentRecords,
    employees,
  ]);

  // Reset or initialize state
  useEffect(() => {
    if (recordToEdit) {
      setSelectedEmpId(recordToEdit.employeeId);
      setSlipNumber(recordToEdit.slipNumber);
      setPeriod(recordToEdit.period);
      setPeriodLabel(recordToEdit.periodLabel);
      setPeriodStartDate(recordToEdit.periodStartDate || currentPeriodConfig.startDate);
      setPeriodEndDate(recordToEdit.periodEndDate || currentPeriodConfig.endDate);
      setPaymentDate(recordToEdit.paymentDate || `${selectedPeriod}-25`);
      setStatus(recordToEdit.status);
      setNotes(
        recordToEdit.notes ||
          'Slip gaji resmi ini telah disinkronisasikan secara otomatis dari Master Gaji Pokok dan Transport & UKK Al Azhar 9.'
      );
    } else if (currentEmp) {
      const generatedSlipNo = `SLIP/${selectedPeriod.replace('-', '')}/${(currentEmp.nip || '000').replace(/[^0-9]/g, '').slice(-4) || '001'}`;
      setSlipNumber(generatedSlipNo);
      setPeriod(selectedPeriod);
      setPeriodLabel(currentPeriodConfig.label);
      setPeriodStartDate(currentPeriodConfig.startDate);
      setPeriodEndDate(currentPeriodConfig.endDate);
      setPaymentDate(`${selectedPeriod}-25`);
      setStatus('published');
    }
  }, [recordToEdit, isOpen, currentEmp, selectedPeriod]);

  if (!isOpen || !syncedRecord || !currentEmp) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalPayload: SalaryRecord = {
      ...syncedRecord,
      id: recordToEdit?.id || `rec-${currentEmp.id}-${period}-${Date.now()}`,
      slipNumber: slipNumber || syncedRecord.slipNumber,
      employeeId: currentEmp.id,
      employeeNip: currentEmp.nip,
      employeeName: currentEmp.name,
      employeePosition: currentEmp.position,
      employeeDepartment: currentEmp.department,
      period,
      periodLabel,
      periodStartDate,
      periodEndDate,
      paymentDate,
      status,
      notes,
    };

    if (recordToEdit) {
      updateSalaryRecord(finalPayload);
      showToast(
        `Slip gaji ${currentEmp.name} (${finalPayload.slipNumber}) berhasil diperbarui dan disinkronkan.`,
        'success'
      );
    } else {
      addSalaryRecord(finalPayload);
      showToast(
        `Slip gaji untuk ${currentEmp.name} periode ${periodLabel} berhasil ditambahkan dan disinkronkan.`,
        'success'
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span>{recordToEdit ? 'Rincian Slip Gaji Terverifikasi' : 'Buat Slip Gaji dari Pegawai'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Sinkronisasi Otomatis</span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Komponen nominal tersinkronisasi langsung dari Master Gaji Pokok & Transport-UKK.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Enforcement Notice Banner */}
        <div className="px-6 py-3 bg-amber-50/90 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Integritas Data Aktif: Komponen Nominal Gaji & UKK Terkunci Otomatis
            </p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Sesuai aturan sistem, rincian nominal di bawah ini <strong>tidak dapat diedit manual</strong> di slip.
              Untuk mengubah gaji pokok, indeks, atau tunjangan keluarga silakan ubah pada menu <strong>Master Gaji Pokok</strong>.
              Untuk mengubah kehadiran, UKK, atau potongan koperasi silakan ubah pada menu <strong>Transport & UKK / UKK Akhir</strong>.
            </p>
          </div>
        </div>

        {/* Live Calculation Summary Banner */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">A. Gaji Pokok Akhir</span>
            <span className="font-bold font-mono text-blue-300 text-sm">
              {formatRupiah(syncedRecord.sumberGajiPokokAkhir || syncedRecord.totalGajiBulananBersih || 0)}
            </span>
          </div>

          <div className="text-slate-500 text-sm font-bold">+</div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">B. UKK Akhir Diterima</span>
            <span className="font-bold font-mono text-emerald-300 text-sm">
              {formatRupiah(syncedRecord.ukkNetAkhirDiterima || syncedRecord.totalRekapHarianBersih || 0)}
            </span>
          </div>

          <div className="text-slate-500 text-sm font-bold">=</div>

          <div className="bg-emerald-600 px-4 py-1.5 rounded-xl shadow-xs">
            <span className="text-[10px] text-emerald-100 uppercase font-black block">
              TOTAL GAJI DIBAYAR (THP)
            </span>
            <span className="font-black font-mono text-white text-base">
              {formatRupiah(syncedRecord.jumlahYangDibayarkan || syncedRecord.netSalary || 0)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. IDENTITAS PEGAWAI & PERIODE */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Identitas Pegawai & Dokumen Penggajian</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pilih Pegawai Terdaftar (Kelola Pegawai):
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  disabled={!!recordToEdit}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 disabled:opacity-75 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.nip || 'NIP -'}) • {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Dokumen Slip:
                </label>
                <input
                  type="text"
                  value={slipNumber}
                  onChange={(e) => setSlipNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Status Penerbitan:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  <option value="published">Terbit (Dapat Dilihat Pegawai)</option>
                  <option value="draft">Draft (Hanya Akses Admin)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tanggal Mulai Periode:
                </label>
                <input
                  type="date"
                  value={periodStartDate}
                  onChange={(e) => setPeriodStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tanggal Selesai Periode:
                </label>
                <input
                  type="date"
                  value={periodEndDate}
                  onChange={(e) => setPeriodEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tanggal Transfer Pembayaran:
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. REKAP PRESENSI & KEHADIRAN */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>2. Rekap Presensi & Kehadiran (Tersinkronisasi UKK)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Terkunci Otomatis</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Hari Kerja</span>
                <span className="text-xs font-black font-mono text-slate-900">{syncedRecord.hariKerja ?? 22}</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="block text-[10px] font-bold text-emerald-800 mb-0.5">Hadir (Hari)</span>
                <span className="text-xs font-black font-mono text-emerald-800">{syncedRecord.attendance?.presentDays ?? syncedRecord.hariKerja ?? 22}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Sakit</span>
                <span className="text-xs font-bold font-mono text-slate-700">{syncedRecord.attendance?.sickDays ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Izin</span>
                <span className="text-xs font-bold font-mono text-slate-700">{syncedRecord.attendance?.permissionDays ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Cuti</span>
                <span className="text-xs font-bold font-mono text-slate-700">{syncedRecord.attendance?.paidLeaveDays ?? 0}</span>
              </div>
              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <span className="block text-[10px] font-bold text-rose-700 mb-0.5">Alpha</span>
                <span className="text-xs font-bold font-mono text-rose-800">{syncedRecord.attendance?.absentDays ?? 0}</span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <span className="block text-[10px] font-bold text-amber-800 mb-0.5">TL &lt; 5m / &gt; 5m</span>
                <span className="text-xs font-bold font-mono text-amber-900">
                  {syncedRecord.datangLambatMin5 ?? 0} / {syncedRecord.datangLambatPlus5 ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* 3. SECTION A: GAJI BULANAN (DARI MASTER GAJI POKOK) */}
          <div className="border border-blue-200 rounded-2xl p-4 bg-blue-50/20 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-950">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Bagian A: Gaji Pokok & Tunjangan Bulanan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>Sumber: Master Gaji Pokok</span>
                </span>
                <span className="text-xs font-mono font-bold text-blue-900">
                  Subtotal Bersih: {formatRupiah(syncedRecord.sumberGajiPokokAkhir || syncedRecord.totalGajiBulananBersih || 0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pendapatan Bulanan */}
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-blue-100">
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-100 flex justify-between">
                  <span>Komponen Pendapatan Pokok:</span>
                  <span className="font-mono text-blue-600">
                    +{formatRupiah(syncedRecord.subtotalPendapatanBulanan || 0)}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Gaji Pokok Kinerja:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(syncedRecord.gajiPokokBulanan || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tunjangan Pengabdian:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.tunjanganPengabdian || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tunjangan Keluarga:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.tunjanganKeluarga || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tunjangan Jabatan:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.tunjanganJabatanBulanan || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tunjangan Yayasan / Pajak:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah((syncedRecord.tunjanganYayasan || 0) + (syncedRecord.bantuanPajak || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Potongan Bulanan */}
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-rose-100">
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-100 flex justify-between">
                  <span>Komponen Potongan Gaji Pokok:</span>
                  <span className="font-mono text-rose-600">
                    -{formatRupiah(syncedRecord.subtotalPotonganBulanan || 0)}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">BPJS Ketenagakerjaan:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganBpjsKetenagakerjaan || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">BPJS Kesehatan:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganBpjsKesehatan || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Infaq / ZIS Masjid:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganZis || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Koperasi Al Azhar / Pinjaman:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganKoperasiAlAzhar || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Pajak PPh 21:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganPajak || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. SECTION B: REKAPITULASI UKK & PENYESUAIAN */}
          <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/20 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>Bagian B: Rekap Harian (Transport, Makan & UKK Akhir)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Sumber: Transport & UKK / UKK Akhir</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900">
                  Subtotal Bersih: {formatRupiah(syncedRecord.ukkNetAkhirDiterima || syncedRecord.totalRekapHarianBersih || 0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pendapatan UKK & Tunjangan */}
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-emerald-100">
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-100 flex justify-between">
                  <span>Komponen UKK & Tunjangan:</span>
                  <span className="font-mono text-emerald-600">
                    +{formatRupiah(syncedRecord.subtotalPendapatanHarian || 0)}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">UKK Bruto:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.ukkKotorHarian || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tunjangan Transport:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.transportHarian || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Uang Makan:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.uangMakanHarian || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tunjangan Wali Kelas:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.tunjanganWaliKelas || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tunjangan Staff Pimpinan / Kepur:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.tunjanganKepalaUrusan || syncedRecord.tunjanganStaffPimpinan || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Potongan UKK & Koperasi */}
              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-rose-100">
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-100 flex justify-between">
                  <span>Potongan UKK & Koperasi:</span>
                  <span className="font-mono text-rose-600">
                    -{formatRupiah(syncedRecord.subtotalPotonganHarian || 0)}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">KESRA (7114...):</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganKesra || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">KOPERASI YPI (7210...):</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganKoperasiYpi || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">KOPERASI YWAM:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganKoperasiYwam || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">YW AMJP:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganYwAmjp || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Potongan Terlambat & UKK:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatRupiah(syncedRecord.potonganUkkHarian || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. CATATAN DOKUMEN SLIP */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Catatan / Pernyataan HRD pada Dokumen Slip Gaji:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
              placeholder="Keterangan pengesahan slip gaji..."
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Tutup
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-200 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{recordToEdit ? 'Simpan Data Slip Terverifikasi' : 'Terbitkan Slip Pegawai Ini'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
