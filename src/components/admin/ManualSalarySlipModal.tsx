import React, { useState, useEffect } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { SalaryRecord, Employee } from '../../types';
import { formatRupiah } from '../../utils/currencyFormatter';
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
    selectedPeriod,
    getCurrentPeriodConfig,
    updateSalaryRecord,
    addSalaryRecord,
  } = useSalary();

  const currentPeriodConfig = getCurrentPeriodConfig();

  // Selected employee for creating new or viewing
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    recordToEdit?.employeeId || employees[0]?.id || ''
  );

  // Form State
  const [slipNumber, setSlipNumber] = useState('');
  const [period, setPeriod] = useState(selectedPeriod);
  const [periodLabel, setPeriodLabel] = useState(currentPeriodConfig.label);
  const [periodStartDate, setPeriodStartDate] = useState(currentPeriodConfig.startDate);
  const [periodEndDate, setPeriodEndDate] = useState(currentPeriodConfig.endDate);
  const [paymentDate, setPaymentDate] = useState(`${selectedPeriod}-25`);
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Attendance
  const [workDays, setWorkDays] = useState(22);
  const [presentDays, setPresentDays] = useState(22);
  const [sickDays, setSickDays] = useState(0);
  const [permissionDays, setPermissionDays] = useState(0);
  const [paidLeaveDays, setPaidLeaveDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [lateHours, setLateHours] = useState(0);

  // 1. Pemasukan / Earnings
  const [basicSalary, setBasicSalary] = useState(0);
  const [dailySalaryRate, setDailySalaryRate] = useState(0);
  const [dailySalaryDays, setDailySalaryDays] = useState(0);
  const [positionAllowance, setPositionAllowance] = useState(0);
  const [transportAllowance, setTransportAllowance] = useState(0);
  const [mealAllowance, setMealAllowance] = useState(0);
  const [attendanceAllowance, setAttendanceAllowance] = useState(0);
  const [overtimePay, setOvertimePay] = useState(0);
  const [bonusPay, setBonusPay] = useState(0);
  const [thrPay, setThrPay] = useState(0);
  const [otherEarnings, setOtherEarnings] = useState(0);
  const [otherEarningsNote, setOtherEarningsNote] = useState('');

  // 2. Potongan / Deductions
  const [bpjsKetenagakerjaan, setBpjsKetenagakerjaan] = useState(0);
  const [bpjsKesehatan, setBpjsKesehatan] = useState(0);
  const [pph21, setPph21] = useState(0);
  const [latePenalty, setLatePenalty] = useState(0);
  const [absencePenalty, setAbsencePenalty] = useState(0);
  const [loanDeduction, setLoanDeduction] = useState(0);
  const [coopDeduction, setCoopDeduction] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [otherDeductionsNote, setOtherDeductionsNote] = useState('');

  const [notes, setNotes] = useState(
    'Slip gaji resmi ini telah diverifikasi dan disahkan oleh Departemen HRD & Finance.'
  );

  // Initialize or reset form when modal opens or recordToEdit changes
  useEffect(() => {
    if (recordToEdit) {
      setSelectedEmpId(recordToEdit.employeeId);
      setSlipNumber(recordToEdit.slipNumber);
      setPeriod(recordToEdit.period);
      setPeriodLabel(recordToEdit.periodLabel);
      setPeriodStartDate(recordToEdit.periodStartDate || currentPeriodConfig.startDate);
      setPeriodEndDate(recordToEdit.periodEndDate || currentPeriodConfig.endDate);
      setPaymentDate(recordToEdit.paymentDate);
      setStatus(recordToEdit.status);

      // Attendance
      setWorkDays(recordToEdit.attendance.workDays);
      setPresentDays(recordToEdit.attendance.presentDays);
      setSickDays(recordToEdit.attendance.sickDays);
      setPermissionDays(recordToEdit.attendance.permissionDays);
      setPaidLeaveDays(recordToEdit.attendance.paidLeaveDays);
      setAbsentDays(recordToEdit.attendance.absentDays);
      setLateHours(recordToEdit.attendance.lateHours);

      // Earnings
      setBasicSalary(recordToEdit.basicSalary || 0);
      setDailySalaryRate(recordToEdit.dailySalaryRate || 0);
      setDailySalaryDays(recordToEdit.dailySalaryDays || 0);
      setPositionAllowance(recordToEdit.positionAllowance || 0);
      setTransportAllowance(recordToEdit.transportAllowance || 0);
      setMealAllowance(recordToEdit.mealAllowance || 0);
      setAttendanceAllowance(recordToEdit.attendanceAllowance || 0);
      setOvertimePay(recordToEdit.overtimePay || 0);
      setBonusPay(recordToEdit.bonusPay || 0);
      setThrPay(recordToEdit.thrPay || 0);
      setOtherEarnings(recordToEdit.otherEarnings || 0);
      setOtherEarningsNote(recordToEdit.otherEarningsNote || '');

      // Deductions
      setBpjsKetenagakerjaan(recordToEdit.bpjsKetenagakerjaan || 0);
      setBpjsKesehatan(recordToEdit.bpjsKesehatan || 0);
      setPph21(recordToEdit.pph21 || 0);
      setLatePenalty(recordToEdit.latePenalty || 0);
      setAbsencePenalty(recordToEdit.absencePenalty || 0);
      setLoanDeduction(recordToEdit.loanDeduction || 0);
      setCoopDeduction(recordToEdit.coopDeduction || 0);
      setOtherDeductions(recordToEdit.otherDeductions || 0);
      setOtherDeductionsNote(recordToEdit.otherDeductionsNote || '');
      setNotes(recordToEdit.notes || '');
    } else {
      // New record defaults
      const emp = employees.find((e) => e.id === selectedEmpId) || employees[0];
      if (emp) {
        setBasicSalary(emp.baseSalary || 0);
        const positionAllow = emp.position.includes('Senior') ? 2500000 : 1500000;
        setPositionAllowance(positionAllow);
        setTransportAllowance(800000);
        setMealAllowance(1100000);
        setAttendanceAllowance(500000);
        setBpjsKetenagakerjaan(Math.round(emp.baseSalary * 0.03));
        setBpjsKesehatan(Math.round(emp.baseSalary * 0.01));
        setPph21(Math.round(emp.baseSalary * 0.045));
        setCoopDeduction(100000);
      }
      setSlipNumber(`SLIP/${selectedPeriod.replace('-', '')}/${emp?.nip?.replace('NIT-', 'EMP') || '001'}`);
      setPeriod(selectedPeriod);
      setPeriodLabel(currentPeriodConfig.label);
      setPeriodStartDate(currentPeriodConfig.startDate);
      setPeriodEndDate(currentPeriodConfig.endDate);
      setPaymentDate(`${selectedPeriod}-25`);
      setStatus('published');
    }
  }, [recordToEdit, isOpen, selectedEmpId]);

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Auto Calculations
  const calculatedDailySalary = dailySalaryRate * dailySalaryDays;

  const totalEarnings =
    Number(basicSalary || 0) +
    Number(calculatedDailySalary || 0) +
    Number(positionAllowance || 0) +
    Number(transportAllowance || 0) +
    Number(mealAllowance || 0) +
    Number(attendanceAllowance || 0) +
    Number(overtimePay || 0) +
    Number(bonusPay || 0) +
    Number(thrPay || 0) +
    Number(otherEarnings || 0);

  const totalDeductions =
    Number(bpjsKetenagakerjaan || 0) +
    Number(bpjsKesehatan || 0) +
    Number(pph21 || 0) +
    Number(latePenalty || 0) +
    Number(absencePenalty || 0) +
    Number(loanDeduction || 0) +
    Number(coopDeduction || 0) +
    Number(otherDeductions || 0);

  const netSalary = totalEarnings - totalDeductions;

  // Auto calculate late penalty based on late hours
  const handleLateHoursChange = (hours: number) => {
    setLateHours(hours);
    setLatePenalty(hours * 50000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmp) return;

    const payload: SalaryRecord = {
      id: recordToEdit?.id || `rec-${currentEmp.id}-${period}-${Date.now()}`,
      slipNumber: slipNumber || `SLIP/${period.replace('-', '')}/${currentEmp.nip.replace('NIT-', 'EMP')}`,
      employeeId: currentEmp.id,
      employeeNip: currentEmp.nip,
      employeeName: currentEmp.name,
      employeePosition: currentEmp.position,
      employeeDepartment: currentEmp.department,
      period,
      periodLabel: periodLabel || currentPeriodConfig.label,
      periodStartDate,
      periodEndDate,
      paymentDate,
      status,
      attendance: {
        workDays: Number(workDays || 0),
        presentDays: Number(presentDays || 0),
        sickDays: Number(sickDays || 0),
        permissionDays: Number(permissionDays || 0),
        paidLeaveDays: Number(paidLeaveDays || 0),
        absentDays: Number(absentDays || 0),
        lateHours: Number(lateHours || 0),
      },
      basicSalary: Number(basicSalary || 0),
      dailySalaryRate: Number(dailySalaryRate || 0),
      dailySalaryDays: Number(dailySalaryDays || 0),
      dailySalaryTotal: Number(calculatedDailySalary || 0),
      positionAllowance: Number(positionAllowance || 0),
      transportAllowance: Number(transportAllowance || 0),
      mealAllowance: Number(mealAllowance || 0),
      attendanceAllowance: Number(attendanceAllowance || 0),
      overtimePay: Number(overtimePay || 0),
      bonusPay: Number(bonusPay || 0),
      thrPay: Number(thrPay || 0),
      otherEarnings: Number(otherEarnings || 0),
      otherEarningsNote,
      totalEarnings,

      bpjsKetenagakerjaan: Number(bpjsKetenagakerjaan || 0),
      bpjsKesehatan: Number(bpjsKesehatan || 0),
      pph21: Number(pph21 || 0),
      latePenalty: Number(latePenalty || 0),
      absencePenalty: Number(absencePenalty || 0),
      loanDeduction: Number(loanDeduction || 0),
      coopDeduction: Number(coopDeduction || 0),
      otherDeductions: Number(otherDeductions || 0),
      otherDeductionsNote,
      totalDeductions,

      netSalary,
      notes,
      publishedAt: status === 'published' ? `${paymentDate} 09:00:00` : undefined,
      uploadedAt: recordToEdit?.uploadedAt || new Date().toISOString().replace('T', ' ').substr(0, 19),
    };

    if (recordToEdit) {
      updateSalaryRecord(payload);
    } else {
      addSalaryRecord(payload);
    }

    onClose();
  };

  return (
    <div
      id="manual-slip-editor-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {recordToEdit ? 'Edit Slip Gaji Manual (Admin)' : 'Tambah Slip Gaji Baru Manual'}
              </h2>
              <p className="text-xs text-slate-300">
                Atur pemasukan, gaji pokok, gaji harian, potongan, & periode tanggal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Top Live Summary Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center shadow-xs">
            <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Total Pendapatan (A)
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-950 font-mono mt-0.5">
                {formatRupiah(totalEarnings)}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
                Total Potongan (B)
              </span>
              <div className="text-base sm:text-lg font-black text-rose-950 font-mono mt-0.5">
                {formatRupiah(totalDeductions)}
              </div>
            </div>

            <div className="bg-blue-600 p-3 rounded-xl text-white shadow-md shadow-blue-100">
              <span className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">
                Take Home Pay (A - B)
              </span>
              <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                {formatRupiah(netSalary)}
              </div>
            </div>
          </div>

          {/* 1. INFORMASI PEGAWAI & PERIODE */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Identitas Pegawai & Periode Penggajian</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Pilih Pegawai:
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  disabled={!!recordToEdit}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 disabled:opacity-60 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.nip}) - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nomor Dokumen Slip:
                </label>
                <input
                  type="text"
                  value={slipNumber}
                  onChange={(e) => setSlipNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Status Terbit:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  <option value="published">Terbit (Karyawan Bisa Melihat)</option>
                  <option value="draft">Draft (Hanya Admin)</option>
                </select>
              </div>
            </div>

            {/* Rentang Tanggal Periode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tanggal Mulai Periode:
                </label>
                <input
                  type="date"
                  value={periodStartDate}
                  onChange={(e) => setPeriodStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. REKAP KEHADIRAN (ATTENDANCE) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>2. Rekap Presensi & Kehadiran (Bulan Ini)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Hari Kerja</label>
                <input
                  type="number"
                  min="0"
                  value={workDays}
                  onChange={(e) => setWorkDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-700 mb-1">Hadir (Hari)</label>
                <input
                  type="number"
                  min="0"
                  value={presentDays}
                  onChange={(e) => setPresentDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Sakit</label>
                <input
                  type="number"
                  min="0"
                  value={sickDays}
                  onChange={(e) => setSickDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Izin</label>
                <input
                  type="number"
                  min="0"
                  value={permissionDays}
                  onChange={(e) => setPermissionDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Cuti</label>
                <input
                  type="number"
                  min="0"
                  value={paidLeaveDays}
                  onChange={(e) => setPaidLeaveDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-rose-600 mb-1">Alpha / Mangkir</label>
                <input
                  type="number"
                  min="0"
                  value={absentDays}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAbsentDays(val);
                    if (val > 0) setAbsencePenalty(val * 150000);
                  }}
                  className="w-full px-2.5 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-700 mb-1">Terlambat (Jam)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={lateHours}
                  onChange={(e) => handleLateHoursChange(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900"
                />
              </div>
            </div>
          </div>

          {/* 3. DUA KOLOM: RINCIAN PENDAPATAN & RINCIAN POTONGAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* KOLOM KIRI: PENDAPATAN (EARNINGS) */}
            <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/20 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  Rincian Pendapatan (Earnings)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  {formatRupiah(totalEarnings)}
                </span>
              </div>

              {/* Gaji Pokok */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Gaji Pokok (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Gaji Harian (Tarif & Jumlah Hari) */}
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                  <span>Gaji Harian (Opsional):</span>
                  <span className="font-mono text-emerald-700">
                    Total: {formatRupiah(calculatedDailySalary)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Tarif / Hari (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={dailySalaryRate}
                      onChange={(e) => setDailySalaryRate(Number(e.target.value))}
                      placeholder="150000"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Jumlah Hari Kerja</label>
                    <input
                      type="number"
                      min="0"
                      value={dailySalaryDays}
                      onChange={(e) => setDailySalaryDays(Number(e.target.value))}
                      placeholder="20"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Tunjangan-tunjangan */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Tunjangan Jabatan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={positionAllowance}
                    onChange={(e) => setPositionAllowance(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Tunjangan Transport (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={transportAllowance}
                    onChange={(e) => setTransportAllowance(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Uang Makan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={mealAllowance}
                    onChange={(e) => setMealAllowance(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Tunjangan Kehadiran (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={attendanceAllowance}
                    onChange={(e) => setAttendanceAllowance(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Lembur, Bonus, THR */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-amber-800 mb-0.5">
                    Lembur (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={overtimePay}
                    onChange={(e) => setOvertimePay(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 mb-0.5">
                    Bonus / Insentif
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bonusPay}
                    onChange={(e) => setBonusPay(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-purple-800 mb-0.5">
                    THR (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={thrPay}
                    onChange={(e) => setThrPay(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Pendapatan Lainnya */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-100">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Pendapatan Lainnya (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={otherEarnings}
                    onChange={(e) => setOtherEarnings(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Keterangan Tambahan</label>
                  <input
                    type="text"
                    value={otherEarningsNote}
                    onChange={(e) => setOtherEarningsNote(e.target.value)}
                    placeholder="e.g. Komisi Proyek"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: POTONGAN (DEDUCTIONS) */}
            <div className="border border-rose-200 rounded-2xl p-4 bg-rose-50/20 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                <span className="font-bold text-xs uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-rose-700" />
                  Rincian Pemotongan (Deductions)
                </span>
                <span className="text-xs font-mono font-bold text-rose-800">
                  {formatRupiah(totalDeductions)}
                </span>
              </div>

              {/* BPJS & PPh21 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    BPJS TK (JHT+JP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bpjsKetenagakerjaan}
                    onChange={(e) => setBpjsKetenagakerjaan(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    BPJS Kesehatan (1%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bpjsKesehatan}
                    onChange={(e) => setBpjsKesehatan(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Pajak PPh 21
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pph21}
                    onChange={(e) => setPph21(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Potongan Terlambat & Mangkir */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-rose-50/80 rounded-xl border border-rose-200">
                  <label className="block text-[10px] font-bold text-rose-800 mb-0.5">
                    Potongan Terlambat (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={latePenalty}
                    onChange={(e) => setLatePenalty(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-mono font-bold text-rose-900"
                  />
                </div>

                <div className="p-2 bg-rose-50/80 rounded-xl border border-rose-200">
                  <label className="block text-[10px] font-bold text-rose-800 mb-0.5">
                    Potongan Alpha / Mangkir
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={absencePenalty}
                    onChange={(e) => setAbsencePenalty(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-mono font-bold text-rose-900"
                  />
                </div>
              </div>

              {/* Kasbon & Koperasi */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Potongan Kasbon / Pinjaman
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={loanDeduction}
                    onChange={(e) => setLoanDeduction(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Iuran Koperasi / Simpan Pinjam
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={coopDeduction}
                    onChange={(e) => setCoopDeduction(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Potongan Lainnya */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-100">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Potongan Lainnya (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Keterangan Potongan</label>
                  <input
                    type="text"
                    value={otherDeductionsNote}
                    onChange={(e) => setOtherDeductionsNote(e.target.value)}
                    placeholder="e.g. Asuransi Jiwa"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. CATATAN SLIP */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Catatan / Pesan HRD pada Slip Gaji:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-200 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{recordToEdit ? 'Simpan Perubahan Slip' : 'Buat Slip Gaji'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
