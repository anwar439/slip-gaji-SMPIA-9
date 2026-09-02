import React, { useRef, useState } from 'react';
import { useSalary } from '../context/SalaryContext';
import { OfficialSalarySlip } from './OfficialSalarySlip';
import { downloadSlipPdfFromElement, printCurrentSlip } from '../utils/pdfHelper';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Printer,
  FileCheck2,
  Share2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export const SlipPdfModal: React.FC = () => {
  const { activeSlipModal, closeSlipModal, companyProfile, employees, showToast } = useSalary();
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  if (!activeSlipModal) return null;

  const employee = employees.find((e) => e.id === activeSlipModal.employeeId) || null;

  const handleDownloadPdf = async () => {
    if (!slipRef.current) return;
    setIsDownloading(true);
    try {
      const cleanName = activeSlipModal.employeeName.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanPeriod = activeSlipModal.periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Slip_Gaji_${cleanName}_${cleanPeriod}.pdf`;

      const success = await downloadSlipPdfFromElement(slipRef.current, fileName);
      if (success) {
        showToast('Dokumen Slip Gaji berhasil diunduh dalam format PDF!', 'success');
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      } else {
        showToast('Gagal membuat PDF. Silakan coba fitur Cetak/Print.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat mengunduh PDF.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printCurrentSlip();
  };

  const handleCopySummary = () => {
    const summary = `SLIP GAJI - ${companyProfile.name}\nPeriode: ${activeSlipModal.periodLabel}\nNama: ${activeSlipModal.employeeName} (${activeSlipModal.employeeNip})\nJabatan: ${activeSlipModal.employeePosition}\nTotal Pendapatan: ${activeSlipModal.totalEarnings}\nTotal Potongan: ${activeSlipModal.totalDeductions}\nTake Home Pay: ${activeSlipModal.netSalary}\nNo Slip: ${activeSlipModal.slipNumber}`;
    navigator.clipboard.writeText(summary);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
    showToast('Ringkasan slip gaji disalin ke clipboard.', 'info');
  };

  return (
    <div
      id="slip-pdf-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div className="bg-slate-100 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                Pratinjau Slip Gaji Resmi
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono hidden sm:inline-block border border-slate-200">
                  {activeSlipModal.periodLabel}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {activeSlipModal.employeeName} ({activeSlipModal.employeeNip})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-close-slip-modal"
              onClick={closeSlipModal}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Header Banner */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Format standar resmi dengan verifikasi barcode & stempel legal.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-slip-info"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200 shadow-2xs"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{hasCopied ? 'Tersalin' : 'Salin Info'}</span>
            </button>

            <button
              id="btn-print-slip"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak / Print</span>
            </button>

            <button
              id="btn-download-slip-pdf"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-200 disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Mengenerate PDF...' : 'Unduh PDF (Slip Gaji)'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
          <div className="max-w-4xl mx-auto">
            <OfficialSalarySlip
              ref={slipRef}
              record={activeSlipModal}
              company={companyProfile}
              employee={employee}
            />
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="bg-white border-t border-slate-200 px-6 py-2.5 text-center text-xs text-slate-500 flex items-center justify-between flex-shrink-0">
          <span>Karyawan dapat mengunduh dokumen slip gaji ini kapan saja secara mandiri.</span>
          <span className="font-mono text-slate-600 font-semibold">{activeSlipModal.slipNumber}</span>
        </div>
      </div>
    </div>
  );
};
