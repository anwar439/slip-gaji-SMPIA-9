import React, { useState } from 'react';
import { DutyLetter } from '../types';
import { formatFileSize, formatDateRangeIndonesian } from '../utils/dutyLetterGenerator';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react';

interface DutyLetterPreviewModalProps {
  letter: DutyLetter;
  onClose: () => void;
}

export const DutyLetterPreviewModal: React.FC<DutyLetterPreviewModalProps> = ({
  letter,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  const isPdf =
    letter.fileType.toLowerCase().includes('pdf') ||
    letter.fileMimeType?.includes('pdf') ||
    letter.fileName.toLowerCase().endsWith('.pdf') ||
    letter.fileData.startsWith('data:application/pdf');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = letter.fileData;
    link.download = letter.fileName || `Surat_Tugas_${letter.startDate}.${isPdf ? 'pdf' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (isPdf) {
      const printWindow = window.open(letter.fileData);
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cetak Surat Tugas - ${letter.title}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; background: white; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${letter.fileData}" onload="window.print();window.close()" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* TOP BAR */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
                  {letter.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono shrink-0">
                  {isPdf ? 'PDF' : 'JPG'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-amber-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateRangeIndonesian(letter.startDate, letter.endDate)}</span>
                </span>
                <span>•</span>
                <span>{formatFileSize(letter.fileSize)}</span>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-2">
            {!isPdf && (
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setZoom((prev) => Math.max(prev - 25, 50))}
                  className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-1 text-slate-300 min-w-[45px] text-center font-bold">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom((prev) => Math.min(prev + 25, 250))}
                  className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors ml-1 border-l border-slate-700 pl-2"
                  title="Putar 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Cetak Berkas Surat Tugas"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              title="Unduh Berkas Surat Tugas"
            >
              <Download className="w-4 h-4" />
              <span>Unduh {isPdf ? 'PDF' : 'JPG'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl transition-colors ml-1"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DOCUMENT VIEWER CANVAS */}
        <div className="flex-1 bg-slate-950 p-3 sm:p-5 flex items-center justify-center overflow-auto relative">
          {isPdf ? (
            <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-2xl flex flex-col">
              <object
                data={letter.fileData}
                type="application/pdf"
                className="w-full h-full flex-1"
              >
                <div className="p-8 text-center text-slate-800 flex flex-col items-center justify-center h-full">
                  <FileText className="w-16 h-16 text-amber-600 mb-3" />
                  <p className="font-bold text-base">Dokumen Surat Tugas PDF</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Pratinjau tertanam langsung di peramban. Anda dapat mengunduh atau mencetak berkas asli dengan tombol di atas.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 px-5 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Berkas PDF Resmi</span>
                  </button>
                </div>
              </object>
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 min-h-full">
              <img
                src={letter.fileData}
                alt={`Surat Tugas ${letter.title}`}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800 origin-center"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
