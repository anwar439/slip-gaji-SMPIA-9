import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSalary } from '../../context/SalaryContext';
import { AttendanceRecord } from '../../types';
import { AttendanceDocPreviewModal } from '../AttendanceDocPreviewModal';
import { formatFileSize } from '../../utils/attendanceGenerator';
import {
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ShieldCheck,
  Building,
  User,
  Layers,
  Sparkles,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

export const EmployeeAttendanceView: React.FC = () => {
  const { currentEmployee } = useAuth();
  const {
    attendanceRecords,
    availablePeriods,
    selectedPeriod,
    companyProfile,
    showToast,
  } = useSalary();

  if (!currentEmployee) {
    return (
      <div className="p-8 text-center text-slate-500">
        Silakan pilih profil pegawai Anda terlebih dahulu.
      </div>
    );
  }

  // Filter attendance records to ONLY this logged-in employee (strictly restricted to own view)
  const myAttendanceRecords: AttendanceRecord[] = useMemo(() => {
    return attendanceRecords
      .filter((rec) => rec.employeeId === currentEmployee.id)
      .sort((a, b) => b.period.localeCompare(a.period));
  }, [attendanceRecords, currentEmployee.id]);

  // Selected period to view (default to current or latest available for this employee)
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<string>(() => {
    const match = myAttendanceRecords.find((r) => r.period === selectedPeriod);
    if (match) return selectedPeriod;
    return myAttendanceRecords.length > 0 ? myAttendanceRecords[0].period : selectedPeriod;
  });

  // Modal preview state
  const [previewModalRecord, setPreviewModalRecord] = useState<AttendanceRecord | null>(null);

  // Active record based on selected period
  const activeRecord: AttendanceRecord | undefined = myAttendanceRecords.find(
    (r) => r.period === selectedPeriodFilter
  );

  const isPdf =
    activeRecord &&
    (activeRecord.fileType.toLowerCase().includes('pdf') ||
      activeRecord.fileName.toLowerCase().endsWith('.pdf') ||
      activeRecord.fileData.startsWith('data:application/pdf'));

  const attendanceRate =
    activeRecord && activeRecord.summary.workDays > 0
      ? Math.round((activeRecord.summary.presentDays / activeRecord.summary.workDays) * 100)
      : 100;

  const handleDownload = (recordToDownload?: AttendanceRecord) => {
    const target = recordToDownload || activeRecord;
    if (!target) return;

    const link = document.createElement('a');
    link.href = target.fileData;
    link.download = target.fileName || `Rekap_Absensi_${currentEmployee.name}_${target.period}.${isPdf ? 'pdf' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Mengunduh berkas absensi periode ${target.periodLabel || target.period}`, 'info');
  };

  const handlePrint = () => {
    if (!activeRecord) return;
    if (isPdf) {
      const printWindow = window.open(activeRecord.fileData);
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cetak Rekap Absensi - ${activeRecord.employeeName}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${activeRecord.fileData}" onload="window.print();window.close()" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & PERIOD SWITCHER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Rekapitulasi Kehadiran Pegawai
            </span>
            <span className="text-xs text-slate-400 font-medium">• Khusus Akses Pribadi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Absensi & Kehadiran Bulanan
          </h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
            Lihat salinan resmi berkas rekap absensi (PDF / JPG) yang telah diunggah dan diverifikasi oleh HRD untuk Anda.
          </p>
        </div>

        {/* Period Selector Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <select
              value={selectedPeriodFilter}
              onChange={(e) => setSelectedPeriodFilter(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {availablePeriods.map((p) => {
                const hasMyRecord = myAttendanceRecords.some((r) => r.period === p.value);
                return (
                  <option key={p.value} value={p.value}>
                    {p.label} {hasMyRecord ? '(Tersedia)' : '(Belum Ada Berkas)'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* 2. MAIN ATTENDANCE CARD IF RECORD EXISTS */}
      {activeRecord ? (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Card 1: Attendance Rate */}
            <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-lg shadow-blue-500/10 flex flex-col justify-between">
              <p className="text-blue-100 text-[10px] uppercase font-bold tracking-wider">
                Tingkat Hadir
              </p>
              <p className="text-2xl sm:text-3xl font-black font-mono mt-1">{attendanceRate}%</p>
              <p className="text-[10px] text-blue-200 mt-1">Sangat Baik</p>
            </div>

            {/* Card 2: Hari Hadir */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Hari Hadir
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
                {activeRecord.summary.presentDays}{' '}
                <span className="text-xs font-normal text-slate-400">/ {activeRecord.summary.workDays} H</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Hari Kerja Efektif</p>
            </div>

            {/* Card 3: Izin */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Izin / Cuti
              </p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-1">
                {activeRecord.summary.leaveDays}{' '}
                <span className="text-xs font-normal text-slate-400">Hari</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Terdata Berizin</p>
            </div>

            {/* Card 4: Sakit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Sakit
              </p>
              <p className="text-xl sm:text-2xl font-black text-rose-600 font-mono mt-1">
                {activeRecord.summary.sickDays}{' '}
                <span className="text-xs font-normal text-slate-400">Hari</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Surat Dokter / Izin</p>
            </div>

            {/* Card 5: Alpa */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Alpa / Tanpa Ket.
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-700 font-mono mt-1">
                {activeRecord.summary.alphaDays}{' '}
                <span className="text-xs font-normal text-slate-400">Hari</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Nol Pelanggaran</p>
            </div>

            {/* Card 6: Keterlambatan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Keterlambatan
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
                {activeRecord.summary.lateMinutes}{' '}
                <span className="text-xs font-normal text-slate-400">Menit</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Total Kumulatif</p>
            </div>
          </div>

          {/* Document Preview & Verification Container */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
            {/* Header of the Document Container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center font-bold">
                  {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Berkas Rekap Absensi: {activeRecord.fileName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Terverifikasi
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Format: <span className="font-bold uppercase">{isPdf ? 'Dokumen PDF' : 'Scan Gambar JPG'}</span> • Ukuran: {formatFileSize(activeRecord.fileSize)} • Diunggah: {new Date(activeRecord.uploadDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewModalRecord(activeRecord)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Buka Pratinjau Layar Penuh"
                >
                  <Maximize2 className="w-4 h-4 text-slate-600" />
                  <span>Layar Penuh</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Cetak Berkas"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Cetak</span>
                </button>

                <button
                  onClick={() => handleDownload()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                  title="Unduh Berkas Rekap"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh {isPdf ? 'PDF' : 'JPG'}</span>
                </button>
              </div>
            </div>

            {/* Embedded Document Viewer */}
            <div className="bg-slate-950 rounded-2xl p-3 sm:p-4 overflow-hidden flex flex-col items-center justify-center min-h-[420px] max-h-[650px]">
              {isPdf ? (
                <div className="w-full h-[520px] rounded-xl overflow-hidden bg-white shadow-xl flex flex-col">
                  <object
                    data={activeRecord.fileData}
                    type="application/pdf"
                    className="w-full h-full flex-1"
                  >
                    <div className="p-8 text-center text-slate-800 flex flex-col items-center justify-center h-full">
                      <FileText className="w-16 h-16 text-blue-600 mb-3" />
                      <p className="font-bold text-base">Pratinjau Berkas PDF Rekap Absensi</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">
                        Klik tombol di bawah untuk melihat tampilan penuh atau mengunduh berkas PDF resmi Anda.
                      </p>
                      <button
                        onClick={() => setPreviewModalRecord(activeRecord)}
                        className="mt-4 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        Buka Pratinjau Dokumen
                      </button>
                    </div>
                  </object>
                </div>
              ) : (
                <div className="flex items-center justify-center p-2 max-h-[520px] overflow-auto">
                  <img
                    src={activeRecord.fileData}
                    alt={`Rekap Absensi ${activeRecord.employeeName}`}
                    className="max-h-[480px] max-w-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              )}
            </div>

            {/* HRD Notes & Verification Badge */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-emerald-950">Catatan & Pengesahan Bagian HRD:</p>
                  <p className="text-slate-600 mt-0.5">
                    {activeRecord.notes || 'Data kehadiran ini telah dicocokkan dengan mesin presensi dan diverifikasi untuk penentuan hak gaji & tunjangan operasional.'}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono self-end sm:self-center shrink-0">
                Pemeriksa: {activeRecord.uploadedBy}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NO RECORD FOUND FOR SELECTED PERIOD */
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Belum Ada Berkas Absensi untuk Periode Ini
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
              Bagian HRD belum mengunggah rekapitulasi berkas absensi untuk bulan{' '}
              <span className="font-bold text-slate-700">
                {availablePeriods.find((p) => p.value === selectedPeriodFilter)?.label || selectedPeriodFilter}
              </span>
              . Silakan periksa kembali beberapa saat lagi atau pilih bulan sebelumnya.
            </p>
          </div>

          {myAttendanceRecords.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setSelectedPeriodFilter(myAttendanceRecords[0].period)}
                className="px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Lihat Berkas Bulan {myAttendanceRecords[0].periodLabel || myAttendanceRecords[0].period}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. HISTORY ARCHIVE TABLE OF ALL MONTHS (RESTRICTED TO THIS EMPLOYEE ONLY) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Arsip Rekap Absensi Pribadi ({myAttendanceRecords.length} Periode)
            </h3>
            <p className="text-xs text-slate-500">
              Daftar seluruh rekap kehadiran Anda yang tersimpan di arsip sekolah
            </p>
          </div>
        </div>

        {myAttendanceRecords.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">Belum ada riwayat berkas absensi tersimpan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">Nama Dokumen</th>
                  <th className="py-3 px-4 text-center">Format</th>
                  <th className="py-3 px-4 text-center">Hadir</th>
                  <th className="py-3 px-4 text-center">Izin / Sakit</th>
                  <th className="py-3 px-4">Tanggal Unggah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAttendanceRecords.map((rec) => {
                  const isRecPdf =
                    rec.fileType.toLowerCase().includes('pdf') ||
                    rec.fileName.toLowerCase().endsWith('.pdf');
                  const isSelected = rec.period === selectedPeriodFilter;

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {rec.periodLabel || rec.period}
                        {isSelected && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                            Sedang Dilihat
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-2">
                          {isRecPdf ? (
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          <span className="truncate max-w-[200px]">{rec.fileName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {isRecPdf ? 'PDF' : 'JPG'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                        {rec.summary.presentDays} / {rec.summary.workDays} H
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-600">
                        {rec.summary.leaveDays} Izin / {rec.summary.sickDays} Skt
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(rec.uploadDate).toLocaleDateString('id-ID')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedPeriodFilter(rec.period);
                              setPreviewModalRecord(rec);
                            }}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(rec)}
                            className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                            title="Unduh Berkas"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL FULLSCREEN PREVIEW */}
      {previewModalRecord && (
        <AttendanceDocPreviewModal
          record={previewModalRecord}
          onClose={() => setPreviewModalRecord(null)}
        />
      )}
    </div>
  );
};
