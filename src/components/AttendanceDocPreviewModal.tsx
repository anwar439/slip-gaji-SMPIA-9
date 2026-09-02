import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import { formatFileSize } from '../utils/attendanceGenerator';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface AttendanceDocPreviewModalProps {
  record: AttendanceRecord;
  onClose: () => void;
}

export const AttendanceDocPreviewModal: React.FC<AttendanceDocPreviewModalProps> = ({
  record,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  const isPdf =
    record.fileType.toLowerCase().includes('pdf') ||
    record.fileMimeType?.includes('pdf') ||
    record.fileName.toLowerCase().endsWith('.pdf') ||
    record.fileData.startsWith('data:application/pdf');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = record.fileData;
    link.download = record.fileName || `Rekap_Absensi_${record.employeeName}_${record.period}.${isPdf ? 'pdf' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (isPdf) {
      // Open in new tab for browser printing
      const printWindow = window.open(record.fileData);
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cetak Rekap Absensi - ${record.employeeName}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; background: white; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${record.fileData}" onload="window.print();window.close()" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const attendanceRate =
    record.summary.workDays > 0
      ? Math.round((record.summary.presentDays / record.summary.workDays) * 100)
      : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Top Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center">
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
                  {record.fileName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                  {isPdf ? 'DOKUMEN PDF' : 'GAMBAR / SCAN JPG'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{record.employeeName}</span>
                <span>•</span>
                <span>Periode: {record.periodLabel || record.period}</span>
                <span>•</span>
                <span>{formatFileSize(record.fileSize)}</span>
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {!isPdf && (
              <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-300">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(250, z + 25))}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 ml-1 transition-colors"
                  title="Putar Gambar (90°)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
              title="Cetak Dokumen"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              title="Unduh Berkas Asli"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Tutup Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Content Viewer + Summary Bar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Viewer (Left / Center) */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-auto p-4 relative min-h-0">
            {isPdf ? (
              <div className="w-full h-full rounded-xl overflow-hidden bg-white shadow-xl flex flex-col">
                <object
                  data={record.fileData}
                  type="application/pdf"
                  className="w-full h-full flex-1"
                >
                  <div className="p-8 text-center text-slate-800 flex flex-col items-center justify-center h-full">
                    <FileText className="w-16 h-16 text-blue-600 mb-3" />
                    <p className="font-bold text-base">Pratinjau PDF siap diakses</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Peramban Anda tidak mendukung pratinjau langsung, klik tombol di bawah untuk mengunduh atau membuka di tab baru.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="mt-4 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Buka / Unduh Berkas PDF
                    </button>
                  </div>
                </object>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                <img
                  src={record.fileData}
                  alt={`Rekap Absensi ${record.employeeName}`}
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl origin-center"
                />
              </div>
            )}
          </div>

          {/* Right Info Sidebar: Summary & Metadata */}
          <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 space-y-5 overflow-y-auto shrink-0">
            {/* Kehadiran Summary Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ringkasan Kehadiran
                </span>
                <span className="text-xs font-black text-emerald-400 font-mono">
                  {attendanceRate}% Hadir
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-400">Hari Hadir</p>
                  <p className="text-lg font-black text-blue-400 font-mono mt-0.5">
                    {record.summary.presentDays} <span className="text-xs font-normal text-slate-400">/ {record.summary.workDays}</span>
                  </p>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-400">Izin / Cuti</p>
                  <p className="text-lg font-black text-amber-400 font-mono mt-0.5">
                    {record.summary.leaveDays} <span className="text-xs font-normal text-slate-400">Hari</span>
                  </p>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-400">Sakit / Alpa</p>
                  <p className="text-lg font-black text-rose-400 font-mono mt-0.5">
                    {record.summary.sickDays} S / {record.summary.alphaDays} A
                  </p>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-400">Terlambat</p>
                  <p className="text-lg font-black text-slate-200 font-mono mt-0.5">
                    {record.summary.lateMinutes} <span className="text-xs font-normal text-slate-400">Mnt</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Identitas Pegawai
              </span>
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama:</span>
                  <span className="font-semibold text-white text-right">{record.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NIP:</span>
                  <span className="font-mono text-slate-300">{record.employeeNip || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jabatan:</span>
                  <span className="text-slate-300 text-right">{record.employeePosition || 'Staff'}</span>
                </div>
              </div>
            </div>

            {/* File & Verification Details */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Metadata Berkas
              </span>
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 space-y-2 text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Terverifikasi Bagian HRD</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 space-y-1">
                  <p>Diunggah oleh: <span className="text-slate-200 font-medium">{record.uploadedBy}</span></p>
                  <p>Waktu: <span className="text-slate-200 font-mono">{new Date(record.uploadDate).toLocaleString('id-ID')}</span></p>
                  <p>Ukuran: <span className="text-slate-200 font-mono">{formatFileSize(record.fileSize)}</span></p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-blue-200">
                <p className="font-bold text-blue-300 mb-1">Catatan HRD:</p>
                <p className="leading-relaxed text-slate-300 text-[11px]">{record.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
