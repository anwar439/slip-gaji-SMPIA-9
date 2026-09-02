import React, { useState, useMemo, useRef } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { Employee, AttendanceRecord, AttendanceSummary } from '../../types';
import { AttendanceDocPreviewModal } from '../AttendanceDocPreviewModal';
import {
  fileToDataUrl,
  formatFileSize,
  generateAttendancePdfDataUrl,
} from '../../utils/attendanceGenerator';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Users,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  FileCheck,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const {
    employees,
    attendanceRecords,
    selectedPeriod,
    setSelectedPeriod,
    availablePeriods,
    getCurrentPeriodConfig,
    companyProfile,
    addAttendanceRecord,
    deleteAttendanceRecord,
    importAttendanceRecords,
    showToast,
  } = useSalary();

  const currentPeriodConfig = getCurrentPeriodConfig();

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'uploaded' | 'missing'>('all');

  // Modals state
  const [previewRecord, setPreviewRecord] = useState<AttendanceRecord | null>(null);
  const [isSingleUploadOpen, setIsSingleUploadOpen] = useState<boolean>(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState<boolean>(false);
  const [selectedEmployeeForUpload, setSelectedEmployeeForUpload] = useState<Employee | null>(null);

  // Single Upload Form State
  const [uploadEmployeeId, setUploadEmployeeId] = useState<string>('');
  const [uploadPeriod, setUploadPeriod] = useState<string>(selectedPeriod);
  const [uploadedFileData, setUploadedFileData] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileType, setUploadedFileType] = useState<'pdf' | 'image'>('pdf');
  const [uploadedFileSize, setUploadedFileSize] = useState<number>(0);
  const [summaryWorkDays, setSummaryWorkDays] = useState<number>(22);
  const [summaryPresentDays, setSummaryPresentDays] = useState<number>(22);
  const [summaryLeaveDays, setSummaryLeaveDays] = useState<number>(0);
  const [summarySickDays, setSummarySickDays] = useState<number>(0);
  const [summaryAlphaDays, setSummaryAlphaDays] = useState<number>(0);
  const [summaryLateMinutes, setSummaryLateMinutes] = useState<number>(0);
  const [summaryNotes, setSummaryNotes] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Period records map
  const periodAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords
      .filter((a) => a.period === selectedPeriod)
      .forEach((a) => {
        map.set(a.employeeId, a);
      });
    return map;
  }, [attendanceRecords, selectedPeriod]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.position && emp.position.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchCat =
        filterCategory === 'all' ||
        (emp.category && emp.category.toUpperCase() === filterCategory.toUpperCase()) ||
        (emp.department && emp.department.toUpperCase() === filterCategory.toUpperCase());

      // Status
      const hasRecord = periodAttendanceMap.has(emp.id);
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'uploaded' && hasRecord) ||
        (filterStatus === 'missing' && !hasRecord);

      return matchSearch && matchCat && matchStatus;
    });
  }, [employees, searchQuery, filterCategory, filterStatus, periodAttendanceMap]);

  // Overall Statistics for active period
  const totalEmployeesCount = employees.length;
  const uploadedCount = employees.filter((emp) => periodAttendanceMap.has(emp.id)).length;
  const missingCount = totalEmployeesCount - uploadedCount;

  const currentRecordsList = useMemo(() => {
    return attendanceRecords.filter((a) => a.period === selectedPeriod);
  }, [attendanceRecords, selectedPeriod]);

  const avgPresentRate = useMemo(() => {
    if (currentRecordsList.length === 0) return 100;
    const totalPresent = currentRecordsList.reduce((s, r) => s + r.summary.presentDays, 0);
    const totalWork = currentRecordsList.reduce((s, r) => s + r.summary.workDays, 0);
    return totalWork > 0 ? Math.round((totalPresent / totalWork) * 100) : 100;
  }, [currentRecordsList]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.category) set.add(e.category);
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Handle single file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isFilePdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    const isFileImage =
      file.type.includes('image') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg') ||
      file.name.toLowerCase().endsWith('.png');

    if (!isFilePdf && !isFileImage) {
      showToast('Format berkas harus berupa PDF atau Gambar (JPG/JPEG/PNG).', 'error');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setUploadedFileData(dataUrl);
      setUploadedFileName(file.name);
      setUploadedFileType(isFilePdf ? 'pdf' : 'image');
      setUploadedFileSize(file.size);

      // Auto-match employee by filename if not chosen yet
      if (!uploadEmployeeId) {
        const found = employees.find(
          (emp) =>
            file.name.toLowerCase().includes(emp.nip.toLowerCase()) ||
            file.name.toLowerCase().includes(emp.name.toLowerCase().split(' ')[0])
        );
        if (found) {
          setUploadEmployeeId(found.id);
        }
      }

      showToast(`Berkas "${file.name}" siap diunggah.`, 'info');
    } catch (err) {
      showToast('Gagal memproses berkas.', 'error');
    }
  };

  // Open single upload modal with specific employee pre-selected
  const openSingleUploadForEmployee = (emp?: Employee) => {
    const targetEmp = emp || employees[0];
    const existingRec = targetEmp ? periodAttendanceMap.get(targetEmp.id) : null;

    setSelectedEmployeeForUpload(targetEmp || null);
    setUploadEmployeeId(targetEmp ? targetEmp.id : '');
    setUploadPeriod(selectedPeriod);

    if (existingRec) {
      setUploadedFileData(existingRec.fileData);
      setUploadedFileName(existingRec.fileName);
      setUploadedFileType(existingRec.fileType.includes('image') ? 'image' : 'pdf');
      setUploadedFileSize(existingRec.fileSize);
      setSummaryWorkDays(existingRec.summary.workDays);
      setSummaryPresentDays(existingRec.summary.presentDays);
      setSummaryLeaveDays(existingRec.summary.leaveDays);
      setSummarySickDays(existingRec.summary.sickDays);
      setSummaryAlphaDays(existingRec.summary.alphaDays);
      setSummaryLateMinutes(existingRec.summary.lateMinutes);
      setSummaryNotes(existingRec.notes || '');
    } else {
      setUploadedFileData('');
      setUploadedFileName('');
      setUploadedFileType('pdf');
      setUploadedFileSize(0);
      setSummaryWorkDays(22);
      setSummaryPresentDays(22);
      setSummaryLeaveDays(0);
      setSummarySickDays(0);
      setSummaryAlphaDays(0);
      setSummaryLateMinutes(0);
      setSummaryNotes('');
    }

    setIsSingleUploadOpen(true);
  };

  // Generate Standard PDF via jsPDF if admin doesn't have an external file
  const handleAutoGenerateStandardPdf = () => {
    const emp = employees.find((e) => e.id === uploadEmployeeId);
    if (!emp) {
      showToast('Pilih pegawai terlebih dahulu.', 'error');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const summary: AttendanceSummary = {
        workDays: summaryWorkDays,
        presentDays: summaryPresentDays,
        leaveDays: summaryLeaveDays,
        sickDays: summarySickDays,
        alphaDays: summaryAlphaDays,
        lateMinutes: summaryLateMinutes,
      };

      const periodLabel = availablePeriods.find((p) => p.value === uploadPeriod)?.label || uploadPeriod;
      const pdfDataUrl = generateAttendancePdfDataUrl(
        {
          name: emp.name,
          nip: emp.nip,
          position: emp.position,
          department: emp.department,
        },
        periodLabel,
        summary,
        companyProfile.name,
        summaryNotes
      );

      setUploadedFileData(pdfDataUrl);
      setUploadedFileName(`Rekap_Absensi_${emp.nip || emp.id}_${uploadPeriod}.pdf`);
      setUploadedFileType('pdf');
      setUploadedFileSize(49200);

      showToast(`Dokumen PDF rekap resmi untuk ${emp.name} berhasil dibuat otomatis!`, 'success');
    } catch (e) {
      showToast('Gagal membuat dokumen PDF.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Save single upload record
  const handleSaveSingleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === uploadEmployeeId);
    if (!emp) {
      showToast('Silakan pilih pegawai.', 'error');
      return;
    }

    let fileDataToSave = uploadedFileData;
    let fileNameToSave = uploadedFileName;
    let fileTypeToSave = uploadedFileType;
    let fileSizeToSave = uploadedFileSize;

    // If no file uploaded or generated, auto-generate official PDF
    if (!fileDataToSave) {
      const periodLabel = availablePeriods.find((p) => p.value === uploadPeriod)?.label || uploadPeriod;
      fileDataToSave = generateAttendancePdfDataUrl(
        {
          name: emp.name,
          nip: emp.nip,
          position: emp.position,
          department: emp.department,
        },
        periodLabel,
        {
          workDays: summaryWorkDays,
          presentDays: summaryPresentDays,
          leaveDays: summaryLeaveDays,
          sickDays: summarySickDays,
          alphaDays: summaryAlphaDays,
          lateMinutes: summaryLateMinutes,
        },
        companyProfile.name,
        summaryNotes
      );
      fileNameToSave = `Rekap_Absensi_${emp.nip || emp.id}_${uploadPeriod}.pdf`;
      fileTypeToSave = 'pdf';
      fileSizeToSave = 49200;
    }

    const periodLabel = availablePeriods.find((p) => p.value === uploadPeriod)?.label || uploadPeriod;

    const newRecord: AttendanceRecord = {
      id: `att-${uploadPeriod}-${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeNip: emp.nip,
      employeePosition: emp.position,
      period: uploadPeriod,
      periodLabel,
      fileName: fileNameToSave,
      fileType: fileTypeToSave,
      fileMimeType: fileTypeToSave === 'pdf' ? 'application/pdf' : 'image/jpeg',
      fileData: fileDataToSave,
      fileSize: fileSizeToSave || 45000,
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Admin HRD (Drs. Anwar Fauzi)',
      summary: {
        workDays: summaryWorkDays,
        presentDays: summaryPresentDays,
        leaveDays: summaryLeaveDays,
        sickDays: summarySickDays,
        alphaDays: summaryAlphaDays,
        lateMinutes: summaryLateMinutes,
      },
      notes: summaryNotes || `Kehadiran ${summaryPresentDays}/${summaryWorkDays} hari kerja efektif.`,
      isVerified: true,
    };

    addAttendanceRecord(newRecord);
    setIsSingleUploadOpen(false);
  };

  // Handle Batch File Drop / Upload
  const handleBatchFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let matchedCount = 0;
    const newRecords: AttendanceRecord[] = [];
    const periodLabel = currentPeriodConfig.label;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isFilePdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const isFileImage =
        file.type.includes('image') ||
        file.name.toLowerCase().endsWith('.jpg') ||
        file.name.toLowerCase().endsWith('.jpeg') ||
        file.name.toLowerCase().endsWith('.png');

      if (!isFilePdf && !isFileImage) continue;

      // Try matching employee by filename
      const emp = employees.find(
        (e) =>
          file.name.toLowerCase().includes(e.nip.toLowerCase()) ||
          file.name.toLowerCase().includes(e.name.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
          file.name.toLowerCase().includes(e.name.split(' ')[0].toLowerCase())
      );

      if (emp) {
        try {
          const dataUrl = await fileToDataUrl(file);
          newRecords.push({
            id: `att-${selectedPeriod}-${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.name,
            employeeNip: emp.nip,
            employeePosition: emp.position,
            period: selectedPeriod,
            periodLabel,
            fileName: file.name,
            fileType: isFilePdf ? 'pdf' : 'image',
            fileMimeType: isFilePdf ? 'application/pdf' : 'image/jpeg',
            fileData: dataUrl,
            fileSize: file.size,
            uploadDate: new Date().toISOString(),
            uploadedBy: 'Admin HRD (Batch Upload)',
            summary: {
              workDays: 22,
              presentDays: 22,
              leaveDays: 0,
              sickDays: 0,
              alphaDays: 0,
              lateMinutes: 0,
            },
            notes: 'Diunggah melalui upload masal.',
            isVerified: true,
          });
          matchedCount++;
        } catch (err) {
          console.error(err);
        }
      }
    }

    if (newRecords.length > 0) {
      importAttendanceRecords(newRecords);
      setIsBatchUploadOpen(false);
      showToast(`Berhasil mencocokkan dan mengunggah ${matchedCount} berkas absensi ke pegawai!`, 'success');
    } else {
      showToast('Tidak ada berkas yang cocok dengan NIP atau nama pegawai dalam sistem.', 'error');
    }
  };

  // Generate All Missing Standard PDFs with 1-click
  const handleGenerateAllMissingPdfs = () => {
    const missingEmployees = employees.filter((e) => !periodAttendanceMap.has(e.id));
    if (missingEmployees.length === 0) {
      showToast('Semua pegawai sudah memiliki berkas absensi pada periode ini.', 'info');
      return;
    }

    const periodLabel = currentPeriodConfig.label;
    const generatedRecords: AttendanceRecord[] = missingEmployees.map((emp, idx) => {
      const workDays = 22;
      const leaveDays = idx % 6 === 0 ? 1 : 0;
      const sickDays = idx % 8 === 0 ? 1 : 0;
      const presentDays = workDays - leaveDays - sickDays;
      const lateMinutes = idx % 4 === 0 ? 15 : 0;

      const summary: AttendanceSummary = {
        workDays,
        presentDays,
        leaveDays,
        sickDays,
        alphaDays: 0,
        lateMinutes,
      };

      const pdfData = generateAttendancePdfDataUrl(
        {
          name: emp.name,
          nip: emp.nip,
          position: emp.position,
          department: emp.department,
        },
        periodLabel,
        summary,
        companyProfile.name
      );

      return {
        id: `att-${selectedPeriod}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeNip: emp.nip,
        employeePosition: emp.position,
        period: selectedPeriod,
        periodLabel,
        fileName: `Rekap_Absensi_${emp.nip || emp.id}_${selectedPeriod}.pdf`,
        fileType: 'pdf',
        fileMimeType: 'application/pdf',
        fileData: pdfData,
        fileSize: 48900,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'Admin HRD (Auto-Generate)',
        summary,
        notes: `Kehadiran ${presentDays}/${workDays} hari. Otomatis diterbitkan oleh sistem HRD.`,
        isVerified: true,
      };
    });

    importAttendanceRecords(generatedRecords);
    showToast(`Berhasil menerbitkan ${generatedRecords.length} berkas PDF rekap absensi otomatis!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Dokumen Kehadiran Bulanan
              </span>
              <span className="text-xs text-slate-400 font-medium">• Hak Akses: Pegawai hanya melihat data miliknya</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Rekapitulasi & Upload Berkas Absensi Pegawai
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
              Unggah berkas rekap absensi (PDF / JPG) per bulan untuk masing-masing guru & staf, dapat diakses langsung oleh pegawai bersangkutan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-open-batch-upload"
              onClick={() => setIsBatchUploadOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
              title="Upload Banyak File PDF / JPG Sekaligus"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Upload Masal (Batch)</span>
            </button>

            <button
              id="btn-auto-generate-all"
              onClick={handleGenerateAllMissingPdfs}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
              title="Terbitkan Dokumen PDF Resmi Otomatis untuk Semua Pegawai yang Belum Memiliki Berkas"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Generate PDF Otomatis</span>
            </button>

            <button
              id="btn-open-single-upload"
              onClick={() => openSingleUploadForEmployee()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Berkas Baru</span>
            </button>
          </div>
        </div>

        {/* 2. Top Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Pegawai</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{totalEmployeesCount} Orang</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700">Berkas Terunggah</p>
              <p className="text-2xl font-black text-emerald-900 mt-0.5">
                {uploadedCount} <span className="text-xs font-bold text-emerald-700">/ {totalEmployeesCount} Berkas</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700">Rata-Rata Kehadiran</p>
              <p className="text-2xl font-black text-blue-900 mt-0.5">{avgPresentRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700">Belum Ada Berkas</p>
              <p className="text-2xl font-black text-amber-900 mt-0.5">{missingCount} Pegawai</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pegawai, NIP, atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-hidden font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Periode:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-hidden cursor-pointer"
            >
              {availablePeriods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Unit / Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="all">Semua Unit / Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="all">Semua Status Berkas ({totalEmployeesCount})</option>
            <option value="uploaded">Sudah Upload ({uploadedCount})</option>
            <option value="missing">Belum Upload ({missingCount})</option>
          </select>
        </div>
      </div>

      {/* 4. Employee Attendance List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Pegawai & NIP</th>
                <th className="py-3.5 px-4">Unit / Bidang Tugas</th>
                <th className="py-3.5 px-4 text-center">Status Berkas</th>
                <th className="py-3.5 px-4 text-center">Ringkasan Hadir</th>
                <th className="py-3.5 px-4">Info Dokumen</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-10 h-10 text-slate-300" />
                      <p className="font-semibold text-sm">Tidak ada data pegawai yang sesuai filter.</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau reset filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const record = periodAttendanceMap.get(emp.id);
                  const isPdf = record?.fileType.includes('pdf') || record?.fileName.toLowerCase().endsWith('.pdf');

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. No */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold">
                        {index + 1}
                      </td>

                      {/* 2. Employee Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{emp.name}</p>
                            <p className="text-[11px] font-mono text-slate-400">NIP: {emp.nip || '-'}</p>
                          </div>
                        </div>
                      </td>

                      {/* 3. Department / Position */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700 block">{emp.position || 'Staff'}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{emp.department || emp.category || 'Akademik'}</span>
                      </td>

                      {/* 4. File Status */}
                      <td className="py-3.5 px-4 text-center">
                        {record ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPdf ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isPdf ? <FileText className="w-3.5 h-3.5 text-blue-600" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{isPdf ? 'PDF Tersedia' : 'JPG Tersedia'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Belum Ada Berkas</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Summary Stats */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {record ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 text-xs">
                              {record.summary.presentDays} <span className="text-slate-400">/ {record.summary.workDays} H</span>
                            </span>
                            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                              <span className="text-amber-600 font-semibold">{record.summary.leaveDays} Izin</span>
                              <span>•</span>
                              <span className="text-rose-600 font-semibold">{record.summary.sickDays} Skt</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">-</span>
                        )}
                      </td>

                      {/* 6. File Metadata */}
                      <td className="py-3.5 px-4">
                        {record ? (
                          <div className="text-slate-600 text-xs space-y-0.5">
                            <p className="font-semibold text-slate-900 truncate max-w-[170px]" title={record.fileName}>
                              {record.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(record.fileSize)} • {new Date(record.uploadDate).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {record ? (
                            <>
                              <button
                                onClick={() => setPreviewRecord(record)}
                                className="p-2 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-xl transition-colors"
                                title="Lihat Pratinjau Berkas"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <a
                                href={record.fileData}
                                download={record.fileName}
                                className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-colors inline-block"
                                title="Unduh Berkas"
                              >
                                <Download className="w-4 h-4" />
                              </a>

                              <button
                                onClick={() => openSingleUploadForEmployee(emp)}
                                className="p-2 hover:bg-amber-50 text-amber-600 hover:text-amber-800 rounded-xl transition-colors"
                                title="Ganti Berkas / Edit Catatan"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Hapus berkas absensi untuk ${emp.name}?`)) {
                                    deleteAttendanceRecord(record.id);
                                  }
                                }}
                                className="p-2 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-xl transition-colors"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openSingleUploadForEmployee(emp)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: SINGLE UPLOAD & GENERATE FORM */}
      {isSingleUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Berkas Absensi Pegawai</h3>
                  <p className="text-xs text-slate-500">Mendukung format PDF resmi, JPG, JPEG, dan PNG</p>
                </div>
              </div>
              <button
                onClick={() => setIsSingleUploadOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleRecord} className="space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pilih Pegawai
                </label>
                <select
                  value={uploadEmployeeId}
                  onChange={(e) => setUploadEmployeeId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.nip || 'No NIP'}) - {emp.position || 'Staff'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Periode Bulan
                </label>
                <select
                  value={uploadPeriod}
                  onChange={(e) => setUploadPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                >
                  {availablePeriods.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop File Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pilih Berkas PDF / Gambar Rekap Scan (JPG / PNG)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-5 text-center cursor-pointer transition-all space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  {uploadedFileName ? (
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-xs mx-auto">
                        {uploadedFileName}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        ✓ Berkas siap disimpan ({formatFileSize(uploadedFileSize)})
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Klik untuk memilih berkas atau seret ke sini
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PDF, JPG, JPEG, PNG (Maksimal 15 MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Auto generate button shortcut */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-500">Belum ada file scan fisik?</span>
                  <button
                    type="button"
                    onClick={handleAutoGenerateStandardPdf}
                    disabled={isGeneratingPdf || !uploadEmployeeId}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline underline-offset-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Buat Rekap Dokumen PDF Otomatis</span>
                  </button>
                </div>
              </div>

              {/* Attendance Statistics Inputs */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ringkasan Angka Kehadiran
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Hari Kerja</label>
                    <input
                      type="number"
                      min={0}
                      value={summaryWorkDays}
                      onChange={(e) => setSummaryWorkDays(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Hari Hadir</label>
                    <input
                      type="number"
                      min={0}
                      value={summaryPresentDays}
                      onChange={(e) => setSummaryPresentDays(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-700 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Izin / Cuti</label>
                    <input
                      type="number"
                      min={0}
                      value={summaryLeaveDays}
                      onChange={(e) => setSummaryLeaveDays(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-amber-700 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Sakit</label>
                    <input
                      type="number"
                      min={0}
                      value={summarySickDays}
                      onChange={(e) => setSummarySickDays(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-rose-700 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Alpa</label>
                    <input
                      type="number"
                      min={0}
                      value={summaryAlphaDays}
                      onChange={(e) => setSummaryAlphaDays(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Terlambat (Mnt)</label>
                    <input
                      type="number"
                      min={0}
                      value={summaryLateMinutes}
                      onChange={(e) => setSummaryLateMinutes(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan HRD / Evaluasi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  placeholder="Contoh: Kehadiran memenuhi standar kedisiplinan dan jam kerja operasional sekolah."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSingleUploadOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Berkas Absensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: BATCH UPLOAD MULTIPLE FILES */}
      {isBatchUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Banyak Berkas Sekaligus</h3>
                  <p className="text-xs text-slate-500">Pencocokan NIP & Nama secara otomatis</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchUploadOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl text-xs text-blue-900 space-y-2">
              <p className="font-bold">💡 Tips Penamaan Berkas untuk Pencocokan Otomatis:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Sertakan <span className="font-bold">NIP</span> atau <span className="font-bold">Nama Depan Pegawai</span> pada nama berkas.</li>
                <li>Contoh: <span className="font-mono font-bold text-blue-800">19780415_Anwar.pdf</span> atau <span className="font-mono font-bold text-blue-800">Absensi_Ahmad_Januari.jpg</span></li>
                <li>Sistem akan mendeteksi dan mengunggah langsung ke akun pegawai yang bersangkutan.</li>
              </ul>
            </div>

            <div
              onClick={() => batchFileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <input
                ref={batchFileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleBatchFiles}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Pilih atau Seret Banyak Berkas PDF/JPG ke Sini
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung upload hingga 100 berkas sekaligus
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchUploadOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PREVIEW MODAL */}
      {previewRecord && (
        <AttendanceDocPreviewModal
          record={previewRecord}
          onClose={() => setPreviewRecord(null)}
        />
      )}
    </div>
  );
};
