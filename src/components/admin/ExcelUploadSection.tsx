import React, { useState, useRef } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { parseSalaryExcel, downloadSalaryTemplateExcel, ParsedExcelResult } from '../../utils/excelHelper';
import { formatRupiah } from '../../utils/currencyFormatter';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import { SalaryRecord } from '../../types';

interface ExcelUploadSectionProps {
  onSuccess?: () => void;
}

export const ExcelUploadSection: React.FC<ExcelUploadSectionProps> = ({ onSuccess }) => {
  const { employees, selectedPeriod, importSalaryRecords, showToast } = useSalary();
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedExcelResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    downloadSalaryTemplateExcel(employees, selectedPeriod);
    showToast(`Template Excel penggajian ${selectedPeriod} berhasil diunduh!`, 'success');
  };

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      showToast('Harap upload file berformat .xlsx, .xls, atau .csv', 'error');
      return;
    }

    setIsParsing(true);
    setFileName(file.name);
    try {
      const result = await parseSalaryExcel(file, selectedPeriod);
      setParsedResult(result);
      if (result.success) {
        showToast(`Berhasil membaca ${result.records.length} baris data dari ${file.name}.`, 'success');
      } else {
        showToast('Ada kesalahan dalam file Excel. Silakan periksa tabel pratinjau.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal memproses file Excel.', 'error');
      setParsedResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImportToDatabase = () => {
    if (!parsedResult || parsedResult.validRows === 0) return;

    const validRecords = parsedResult.records.filter((r) => r.isValid);
    const newSalaryRecords: SalaryRecord[] = validRecords.map((r, idx) => {
      const existingEmp = employees.find((e) => e.nip.toLowerCase() === r.nip.toLowerCase());
      const periodCode = r.period.replace('-', '');
      const empId = existingEmp ? existingEmp.id : `emp-custom-${Date.now()}-${idx}`;

      return {
        id: `rec-${empId}-${r.period}-${Date.now()}`,
        slipNumber: `SLIP/${periodCode}/${r.nip.replace(/[^a-zA-Z0-9]/g, '')}`,
        employeeId: empId,
        employeeNip: r.nip,
        employeeName: r.name,
        employeePosition: r.position,
        employeeDepartment: r.department,
        period: r.period,
        periodLabel: `${r.period}`,
        periodStartDate: r.periodStartDate,
        periodEndDate: r.periodEndDate,
        paymentDate: r.paymentDate,
        status: 'draft', // uploaded as draft for admin review before publishing
        attendance: r.attendance,
        basicSalary: r.basicSalary,
        dailySalaryRate: r.dailySalaryRate,
        dailySalaryDays: r.dailySalaryDays,
        dailySalaryTotal: r.dailySalaryTotal,
        positionAllowance: r.positionAllowance,
        transportAllowance: r.transportAllowance,
        mealAllowance: r.mealAllowance,
        attendanceAllowance: r.attendanceAllowance,
        overtimePay: r.overtimePay,
        bonusPay: r.bonusPay,
        thrPay: r.thrPay,
        otherEarnings: r.otherEarnings,
        otherEarningsNote: r.otherEarningsNote,
        totalEarnings: r.totalEarnings,

        bpjsKetenagakerjaan: r.bpjsKetenagakerjaan,
        bpjsKesehatan: r.bpjsKesehatan,
        pph21: r.pph21,
        latePenalty: r.latePenalty,
        absencePenalty: r.absencePenalty,
        loanDeduction: r.loanDeduction,
        coopDeduction: r.coopDeduction,
        otherDeductions: r.otherDeductions,
        otherDeductionsNote: r.otherDeductionsNote,
        totalDeductions: r.totalDeductions,

        netSalary: r.netSalary,
        notes: r.notes || 'Slip gaji resmi.',
        uploadedAt: new Date().toISOString(),
      };
    });

    importSalaryRecords(newSalaryRecords, 'Admin HRD');
    setParsedResult(null);
    setFileName('');
    if (onSuccess) onSuccess();
  };

  // One-click demo test payload for quick evaluation
  const handleLoadDemoPayload = () => {
    const demoRows: ParsedExcelResult['records'] = employees.map((emp, i) => {
      const basic = emp.baseSalary;
      const pos = emp.position.includes('Senior') ? 2500000 : 1500000;
      const trans = 800000;
      const meal = 1100000;
      const att = 500000;
      const overtime = i % 2 === 0 ? 1250000 : 0;
      const bonus = i === 2 ? 2000000 : 0;
      const totalEarn = basic + pos + trans + meal + att + overtime + bonus;

      const bpjsTk = Math.round(basic * 0.03);
      const bpjsKes = Math.round(basic * 0.01);
      const pph = Math.round(basic * 0.045);
      const coop = 100000;
      const totalDed = bpjsTk + bpjsKes + pph + coop;

      return {
        nip: emp.nip,
        name: emp.name,
        position: emp.position,
        department: emp.department,
        period: selectedPeriod,
        paymentDate: `${selectedPeriod}-25`,
        attendance: {
          workDays: 22,
          presentDays: 22,
          sickDays: 0,
          permissionDays: 0,
          paidLeaveDays: 0,
          absentDays: 0,
          lateHours: 0,
        },
        basicSalary: basic,
        positionAllowance: pos,
        transportAllowance: trans,
        mealAllowance: meal,
        attendanceAllowance: att,
        overtimePay: overtime,
        bonusPay: bonus,
        thrPay: 0,
        otherEarnings: 0,
        otherEarningsNote: '',
        totalEarnings: totalEarn,

        bpjsKetenagakerjaan: bpjsTk,
        bpjsKesehatan: bpjsKes,
        pph21: pph,
        latePenalty: 0,
        loanDeduction: 0,
        coopDeduction: coop,
        otherDeductions: 0,
        otherDeductionsNote: '',
        totalDeductions: totalDed,

        netSalary: totalEarn - totalDed,
        notes: `Gaji bulan ${selectedPeriod} telah diverifikasi.`,
        isValid: true,
        validationErrors: [],
      };
    });

    setFileName(`Data_Gaji_${selectedPeriod}_Demo.xlsx`);
    setParsedResult({
      success: true,
      records: demoRows,
      totalRows: demoRows.length,
      validRows: demoRows.length,
      invalidRows: 0,
      errors: [],
    });
    showToast('Data demo penggajian Excel berhasil dimuat untuk pratinjau!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Upload Data Gaji Bulanan via Excel</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Admin dapat mengunggah file Excel/CSV berisi komponen gaji seluruh karyawan untuk periode yang dipilih. Sistem akan otomatis menghitung Total Pendapatan, Total Potongan, dan Take Home Pay.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <button
            id="btn-download-excel-template"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors border border-emerald-200"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Format Template Excel (.xlsx)</span>
          </button>

          <button
            id="btn-load-demo-excel"
            onClick={handleLoadDemoPayload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Isi Data Sampel Otomatis</span>
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        id="excel-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/80 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-800">
          {fileName ? `File terpilih: ${fileName}` : 'Tarik & Letakkan File Excel Gaji di Sini'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          atau klik untuk memilih file dari komputer Anda (Format didukung: <strong>.xlsx, .xls, .csv</strong>)
        </p>

        <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Kolom otomatis dipetakan ke NIP, Gaji Pokok, Tunjangan, BPJS, PPh21, dan Potongan.</span>
        </div>
      </div>

      {/* Parse Preview Table Section */}
      {parsedResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Pratinjau Data Gaji Terbaca</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  {parsedResult.totalRows} Baris
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Periksa keakuratan data sebelum menyimpan ke database slip gaji karyawan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {parsedResult.validRows} Valid
                </span>
                {parsedResult.invalidRows > 0 && (
                  <span className="flex items-center gap-1 text-rose-600 font-bold">
                    <XCircle className="w-3.5 h-3.5" /> {parsedResult.invalidRows} Error
                  </span>
                )}
              </div>

              <button
                id="btn-confirm-import-excel"
                onClick={handleImportToDatabase}
                disabled={parsedResult.validRows === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Simpan & Buat Slip Gaji ({parsedResult.validRows})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">NIP</th>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3">Gaji Pokok</th>
                  <th className="py-2.5 px-3">Total Tunjangan</th>
                  <th className="py-2.5 px-3">Total Potongan</th>
                  <th className="py-2.5 px-3 font-mono">Gaji Bersih (THP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedResult.records.map((row, idx) => {
                  const allowancesTotal =
                    row.positionAllowance +
                    row.transportAllowance +
                    row.mealAllowance +
                    row.attendanceAllowance +
                    row.overtimePay +
                    row.bonusPay +
                    row.thrPay +
                    row.otherEarnings;

                  return (
                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                      <td className="py-2.5 px-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> OK
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded cursor-help"
                            title={row.validationErrors.join(', ')}
                          >
                            <AlertTriangle className="w-3 h-3" /> Error
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{row.nip}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{row.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{formatRupiah(row.basicSalary)}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700">+{formatRupiah(allowancesTotal)}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-700">-{formatRupiah(row.totalDeductions)}</td>
                      <td className="py-2.5 px-3 font-mono font-black text-slate-900 text-sm">
                        {formatRupiah(row.netSalary)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
