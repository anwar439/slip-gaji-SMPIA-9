import React, { useState, useRef } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { Employee } from '../../types';
import { formatRupiah } from '../../utils/currencyFormatter';
import {
  downloadEmployeeTemplateExcel,
  parseEmployeeExcel,
  exportEmployeesToExcel,
  ParsedEmployeeExcelResult,
} from '../../utils/excelHelper';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Key,
  Lock,
  Copy,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  'Semua Kategori',
  'GURU SMP ISLAM AL AZHAR 9',
  'TATA USAHA SMP ISLAM AL AZHAR 9',
  'JANITOR SMP ISLAM AL AZHAR 9',
  'SECURITY SMP ISLAM AL AZHAR 9',
];

export const EmployeeManagement: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    deleteMultipleEmployees,
    importEmployees,
    showToast,
  } = useSalary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBatchDeleteConfirmOpen, setIsBatchDeleteConfirmOpen] = useState(false);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ParsedEmployeeExcelResult | null>(null);
  const [uploadMode, setUploadMode] = useState<'merge' | 'replace'>('merge');

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    no: 1,
    nip: '',
    nik: '',
    nuptk: '',
    name: '',
    gender: 'L',
    birthPlace: '',
    birthDate: '',
    employeeStatus: 'GTY',
    level: 'V A',
    statusClassification: 'GTY, Gol. V A',
    subject: '',
    category: 'GURU SMP ISLAM AL AZHAR 9',
    email: '',
    phone: '',
    password: '',
    baseSalary: 6000000,
    bankName: 'BSI',
    accountNumber: '',
    taxStatus: 'K/1',
    employmentStatus: 'Tetap',
  });

  const handleCopyPassword = (emp: Employee) => {
    const pwd = emp.password || emp.nip || '123456';
    navigator.clipboard.writeText(pwd);
    setCopiedId(emp.id);
    showToast(`Password ${emp.name} disalin: ${pwd}`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered employees
  const filteredEmployees = employees.filter((e) => {
    const matchesCategory =
      selectedCategory === 'Semua Kategori' ||
      (e.category && e.category.toLowerCase() === selectedCategory.toLowerCase()) ||
      (!e.category && selectedCategory === 'GURU SMP ISLAM AL AZHAR 9');

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesSearch =
      (e.name && e.name.toLowerCase().includes(query)) ||
      (e.nip && e.nip.toLowerCase().includes(query)) ||
      (e.nik && e.nik.toLowerCase().includes(query)) ||
      (e.nuptk && e.nuptk.toLowerCase().includes(query)) ||
      (e.subject && e.subject.toLowerCase().includes(query)) ||
      (e.position && e.position.toLowerCase().includes(query)) ||
      (e.email && e.email.toLowerCase().includes(query)) ||
      (e.phone && e.phone.toLowerCase().includes(query)) ||
      (e.birthPlace && e.birthPlace.toLowerCase().includes(query)) ||
      (e.statusClassification && e.statusClassification.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  // Select all / Deselect all
  const handleSelectAll = () => {
    if (selectedEmpIds.length === filteredEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(filteredEmployees.map((e) => e.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingEmp(null);
    setShowModalPassword(false);
    const nextNo = (employees.length > 0 ? Math.max(...employees.map((e) => e.no || 0)) : 0) + 1;
    setFormData({
      no: nextNo,
      nip: '',
      nik: '',
      nuptk: '',
      name: '',
      gender: 'L',
      birthPlace: '',
      birthDate: '',
      employeeStatus: 'GTY',
      level: 'V A',
      statusClassification: 'GTY, Gol. V A',
      subject: '',
      category: selectedCategory !== 'Semua Kategori' ? selectedCategory : 'GURU SMP ISLAM AL AZHAR 9',
      email: '',
      phone: '',
      password: '',
      baseSalary: 6000000,
      bankName: 'BSI',
      accountNumber: '',
      taxStatus: 'K/1',
      employmentStatus: 'Tetap',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setShowModalPassword(false);
    setFormData({
      no: emp.no || 1,
      nip: emp.nip || '',
      nik: emp.nik || '',
      nuptk: emp.nuptk || '',
      name: emp.name || '',
      gender: emp.gender || 'L',
      birthPlace: emp.birthPlace || '',
      birthDate: emp.birthDate || '',
      employeeStatus: emp.employeeStatus || 'GTY',
      level: emp.level || '',
      statusClassification: emp.statusClassification || '',
      subject: emp.subject || emp.position || '',
      category: emp.category || emp.department || 'GURU SMP ISLAM AL AZHAR 9',
      email: emp.email || '',
      phone: emp.phone || '',
      password: emp.password || emp.nip || '123456',
      baseSalary: emp.baseSalary || 6000000,
      bankName: emp.bankName || 'BSI',
      accountNumber: emp.accountNumber || '',
      taxStatus: emp.taxStatus || 'K/1',
      employmentStatus: emp.employmentStatus || 'Tetap',
    });
    setIsAddModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Nama Lengkap Pegawai wajib diisi.', 'error');
      return;
    }

    const calculatedClassification =
      formData.statusClassification?.trim() ||
      (formData.level && formData.level !== '-'
        ? `${formData.employeeStatus}, Gol. ${formData.level}`
        : formData.employeeStatus || 'GTY');

    const cleanPassword = formData.password?.trim() || formData.nip?.trim() || '123456';

    if (editingEmp) {
      updateEmployee({
        ...editingEmp,
        ...(formData as Employee),
        password: cleanPassword,
        statusClassification: calculatedClassification,
        position: formData.subject || formData.position || 'Staff',
        department: formData.category || formData.department || 'GURU',
      });
      showToast(`Data pegawai ${formData.name} berhasil diperbarui.`, 'success');
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        no: Number(formData.no) || employees.length + 1,
        nip: formData.nip?.trim() || '-',
        nik: formData.nik?.trim() || '-',
        nuptk: formData.nuptk?.trim() || '-',
        name: formData.name.trim(),
        gender: formData.gender || 'L',
        birthPlace: formData.birthPlace?.trim() || '-',
        birthDate: formData.birthDate?.trim() || '-',
        employeeStatus: formData.employeeStatus?.trim() || 'GTY',
        level: formData.level?.trim() || '-',
        statusClassification: calculatedClassification,
        subject: formData.subject?.trim() || 'Staff',
        category: formData.category || 'GURU SMP ISLAM AL AZHAR 9',
        department: formData.category || 'GURU',
        position: formData.subject?.trim() || 'Staff',
        email: formData.email?.trim() || `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@smpia9.sch.id`,
        phone: formData.phone?.trim() || '-',
        password: cleanPassword,
        joinDate: new Date().toISOString().split('T')[0],
        bankName: formData.bankName || 'BSI',
        accountNumber: formData.accountNumber || '-',
        taxStatus: formData.taxStatus || 'K/1',
        employmentStatus: formData.employmentStatus || 'Tetap',
        baseSalary: Number(formData.baseSalary) || 6000000,
      };
      addEmployee(newEmp);
      showToast(`Pegawai baru ${newEmp.name} berhasil ditambahkan.`, 'success');
    }

    setIsAddModalOpen(false);
  };

  // Handle Excel File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await parseEmployeeExcel(file);
      setUploadResult(result);
    } catch (err: any) {
      showToast(err.message || 'Gagal membaca file Excel.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Confirm and Apply Excel Upload
  const handleApplyUpload = () => {
    if (!uploadResult || uploadResult.validRows === 0) {
      showToast('Tidak ada baris data valid yang dapat diimpor.', 'error');
      return;
    }

    const validEmps = uploadResult.employees.filter((emp) => emp.isValid);
    importEmployees(validEmps, uploadMode === 'replace');
    setIsUploadModalOpen(false);
    setUploadResult(null);
  };

  // Confirm Single Delete
  const handleConfirmSingleDelete = () => {
    if (deleteConfirmId) {
      deleteEmployee(deleteConfirmId);
      setSelectedEmpIds((prev) => prev.filter((id) => id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  // Confirm Batch Delete
  const handleConfirmBatchDelete = () => {
    if (selectedEmpIds.length > 0) {
      deleteMultipleEmployees(selectedEmpIds);
      setSelectedEmpIds([]);
      setIsBatchDeleteConfirmOpen(false);
    }
  };

  // Category counts
  const categoryCounts = {
    'Semua Kategori': employees.length,
    'GURU SMP ISLAM AL AZHAR 9': employees.filter((e) => e.category?.includes('GURU') || (!e.category && e.employeeStatus?.startsWith('G'))).length,
    'TATA USAHA SMP ISLAM AL AZHAR 9': employees.filter((e) => e.category?.includes('TATA USAHA')).length,
    'JANITOR SMP ISLAM AL AZHAR 9': employees.filter((e) => e.category?.includes('JANITOR')).length,
    'SECURITY SMP ISLAM AL AZHAR 9': employees.filter((e) => e.category?.includes('SECURITY')).length,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Kelola Data Pegawai</h1>
                <p className="text-sm text-slate-500">
                  Data master kepegawaian SMP Islam Al Azhar 9 (Guru, Tata Usaha, Janitor, Security)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => downloadEmployeeTemplateExcel(employees)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Download Template Format Excel Sesuai PDF"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Template Excel
            </button>

            <button
              onClick={() => exportEmployeesToExcel(employees)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Export Semua Data Pegawai ke Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Excel ({employees.length})
            </button>

            <button
              onClick={() => {
                setUploadResult(null);
                setIsUploadModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Masal Excel
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Pegawai
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat as keyof typeof categoryCounts] ?? 0;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedEmpIds([]);
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Batch Actions Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NIP, NIK, NUPTK, mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showPasswords
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Tampilkan / Sembunyikan Password Login Pegawai"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{showPasswords ? 'Sembunyikan Password' : 'Lihat Password Akun'}</span>
            </button>

            {selectedEmpIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">
                  {selectedEmpIds.length} terpilih
                </span>
                <button
                  onClick={() => setIsBatchDeleteConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Terpilih
                </button>
              </div>
            )}
            <div className="text-xs text-slate-500">
              Menampilkan <span className="font-semibold text-slate-800">{filteredEmployees.length}</span> dari{' '}
              <span className="font-semibold text-slate-800">{employees.length}</span> pegawai
            </div>
          </div>
        </div>
      </div>

      {/* Main Table: Exact PDF Columns + Password Login */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 sticky top-0">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                    title="Pilih Semua"
                  >
                    {selectedEmpIds.length === filteredEmployees.length && filteredEmployees.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 whitespace-nowrap">NIP</th>
                <th className="p-3 whitespace-nowrap">NIK</th>
                <th className="p-3 whitespace-nowrap">NUPTK</th>
                <th className="p-3 min-w-[200px]">N A M E</th>
                <th className="p-3 text-center">L/P</th>
                <th className="p-3 whitespace-nowrap bg-emerald-50/70 text-emerald-900 border-x border-emerald-100">
                  <span className="flex items-center gap-1">
                    <Key className="w-3 h-3 text-emerald-600" /> PASSWORD LOGIN
                  </span>
                </th>
                <th className="p-3 whitespace-nowrap">PLACE</th>
                <th className="p-3 whitespace-nowrap">DATE OF BIRTH</th>
                <th className="p-3 whitespace-nowrap text-center">EMPLOYEE STATUS</th>
                <th className="p-3 whitespace-nowrap text-center">LEVEL</th>
                <th className="p-3 whitespace-nowrap">EMPLOYEE STATUS & CLASSIFICATION</th>
                <th className="p-3 min-w-[150px]">SUBJECT / TUGAS</th>
                <th className="p-3 whitespace-nowrap">EMAIL</th>
                <th className="p-3 whitespace-nowrap">NO. HANDPHONE</th>
                <th className="p-3 whitespace-nowrap">KATEGORI</th>
                <th className="p-3 text-right sticky right-0 bg-slate-100 shadow-sm z-10 w-24">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={18} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">Tidak ada data pegawai yang cocok</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau kategori filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const isSelected = selectedEmpIds.includes(emp.id);
                  const isFemale = emp.gender === 'P';
                  const empPassword = emp.password || emp.nip || '123456';
                  const isCopied = copiedId === emp.id;

                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/50' : index % 2 === 1 ? 'bg-slate-50/30' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(emp.id)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-500">
                        {emp.no || index + 1}
                      </td>
                      <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                        {emp.nip && emp.nip !== '-' ? (
                          <span className="font-medium text-slate-900">{emp.nip}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                        {emp.nik && emp.nik !== '-' ? emp.nik : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                        {emp.nuptk && emp.nuptk !== '-' ? emp.nuptk : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="p-3 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isFemale
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold">{emp.name}</span>
                            {emp.baseSalary ? (
                              <div className="text-[10px] text-slate-500">
                                Gapok: {formatRupiah(emp.baseSalary)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isFemale ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {emp.gender || 'L'}
                        </span>
                      </td>
                      {/* Password Column */}
                      <td className="p-3 whitespace-nowrap bg-emerald-50/30 border-x border-emerald-100/50">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                            {showPasswords ? empPassword : '••••••••'}
                          </span>
                          <button
                            onClick={() => handleCopyPassword(emp)}
                            className="p-1 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 rounded transition-colors"
                            title="Salin Password"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {emp.birthPlace && emp.birthPlace !== '-' ? emp.birthPlace : '-'}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {emp.birthDate && emp.birthDate !== '-' ? emp.birthDate : '-'}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {emp.employeeStatus || '-'}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap font-medium">
                        {emp.level && emp.level !== '-' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {emp.level}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-800 whitespace-nowrap font-medium">
                        {emp.statusClassification || (emp.level ? `${emp.employeeStatus}, Gol. ${emp.level}` : emp.employeeStatus || '-')}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                        {emp.subject || emp.position || '-'}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {emp.email ? (
                          <a
                            href={`mailto:${emp.email}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {emp.email}
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {emp.phone && emp.phone !== '-' ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {emp.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {emp.category || emp.department || 'GURU'}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap sticky right-0 bg-white shadow-sm z-10">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingEmp(emp)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Edit Data Pegawai"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(emp.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD MASAL EXCEL PEGAWAI                                         */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Masal Data Pegawai (Excel)</h3>
                  <p className="text-xs text-slate-500">
                    Format file disesuaikan dengan data Excel/PDF resmi SMP Islam Al Azhar 9
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Template helper banner */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    Format Kolom Excel yang Didukung:
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    No, NIP, NIK, NUPTK, NAME, L/P, PLACE, DATE OF BIRTH, EMPLOYEE STATUS, LEVEL, EMPLOYEE STATUS AND CLASSIFICATION, SUBJECT, EMAIL, NO. HANDPHONE, KATEGORI.
                  </p>
                </div>
                <button
                  onClick={() => downloadEmployeeTemplateExcel(employees)}
                  className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Klik untuk memilih file Excel (.xlsx / .xls)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atau drag & drop file data pegawai ke area ini
                  </p>
                </div>
              </div>

              {/* Upload Result Preview */}
              {uploadResult && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-bold text-slate-900">
                        Hasil Analisis File: {uploadResult.validRows} data siap diimpor
                      </span>
                    </div>
                    {uploadResult.invalidRows > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                        {uploadResult.invalidRows} tidak valid
                      </span>
                    )}
                  </div>

                  {/* Mode switch */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Pilih Mode Impor:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`p-3 rounded-lg border cursor-pointer text-xs flex items-start gap-2.5 transition-all ${
                        uploadMode === 'merge' ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold' : 'border-slate-200 bg-white text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="uploadMode"
                          checked={uploadMode === 'merge'}
                          onChange={() => setUploadMode('merge')}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="font-bold block">Tambah / Perbarui</span>
                          <span className="text-[11px] text-slate-500 font-normal">
                            Menambahkan pegawai baru & update yang sudah ada
                          </span>
                        </div>
                      </label>

                      <label className={`p-3 rounded-lg border cursor-pointer text-xs flex items-start gap-2.5 transition-all ${
                        uploadMode === 'replace' ? 'border-red-500 bg-red-50 text-red-950 font-semibold' : 'border-slate-200 bg-white text-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="uploadMode"
                          checked={uploadMode === 'replace'}
                          onChange={() => setUploadMode('replace')}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="font-bold block text-red-700">Ganti Seluruh Data</span>
                          <span className="text-[11px] text-slate-500 font-normal">
                            Menghapus database lama dan mengganti dengan file Excel ini
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Sample rows preview */}
                  <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 text-xs divide-y divide-slate-100">
                    {uploadResult.employees.slice(0, 10).map((emp, i) => (
                      <div key={i} className="py-1.5 px-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{emp.no}. {emp.name}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({emp.subject || emp.position} - {emp.category})</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{emp.nip || emp.employeeStatus}</span>
                      </div>
                    ))}
                    {uploadResult.employees.length > 10 && (
                      <div className="py-1 text-center text-[11px] text-slate-400 italic">
                        + {uploadResult.employees.length - 10} data pegawai lainnya
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyUpload}
                disabled={!uploadResult || uploadResult.validRows === 0}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Terapkan Impor ({uploadResult ? uploadResult.validRows : 0} Pegawai)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT DATA PEGAWAI MANUAL                                  */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  {editingEmp ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingEmp ? `Edit Data Pegawai: ${editingEmp.name}` : 'Tambah Pegawai Manual'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi data pegawai sesuai dengan data kepegawaian SMP Islam Al Azhar 9
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* 1. DATA IDENTITAS UTAMA */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> 1. Data Identitas & Nomor Induk
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">No. Urut</label>
                      <input
                        type="number"
                        value={formData.no ?? 1}
                        onChange={(e) => setFormData({ ...formData, no: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">NIP (Nomor Induk Pegawai)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 102041398 atau -"
                        value={formData.nip || ''}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">NIK (KTP)</label>
                      <input
                        type="text"
                        placeholder="32750..."
                        value={formData.nik || ''}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">NUPTK</label>
                      <input
                        type="text"
                        placeholder="17437..."
                        value={formData.nuptk || ''}
                        onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nama Lengkap (NAME) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Amirudin, M.Pd."
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Kelamin (L/P)</label>
                      <select
                        value={formData.gender || 'L'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value="L">L (Laki-laki)</option>
                        <option value="P">P (Perempuan)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Tempat Lahir (PLACE)</label>
                      <input
                        type="text"
                        placeholder="Contoh: Jakarta / Serang"
                        value={formData.birthPlace || ''}
                        onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Lahir (DATE OF BIRTH)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 11 April 1979"
                        value={formData.birthDate || ''}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. JABATAN, MAPEL & STATUS KEPEGAWAIAN */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> 2. Kategori, Status & Penugasan
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Pegawai</label>
                      <select
                        value={formData.category || 'GURU SMP ISLAM AL AZHAR 9'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value="GURU SMP ISLAM AL AZHAR 9">GURU SMP ISLAM AL AZHAR 9</option>
                        <option value="TATA USAHA SMP ISLAM AL AZHAR 9">TATA USAHA SMP ISLAM AL AZHAR 9</option>
                        <option value="JANITOR SMP ISLAM AL AZHAR 9">JANITOR SMP ISLAM AL AZHAR 9</option>
                        <option value="SECURITY SMP ISLAM AL AZHAR 9">SECURITY SMP ISLAM AL AZHAR 9</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Mata Pelajaran / Tugas / Posisi (SUBJECT)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Bahasa Arab, Matematika, Staf TU, Janitor, Security"
                        value={formData.subject || ''}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Employee Status</label>
                      <input
                        type="text"
                        placeholder="Contoh: GTY / GTYK / CPG / GTT / KTY / KTT"
                        value={formData.employeeStatus || ''}
                        onChange={(e) => setFormData({ ...formData, employeeStatus: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Golongan / Level</label>
                      <input
                        type="text"
                        placeholder="Contoh: VI C / V D / V C / V B / V A / -"
                        value={formData.level || ''}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Status & Klasifikasi</label>
                      <input
                        type="text"
                        placeholder="Contoh: GTY, Gol. VI C"
                        value={formData.statusClassification || ''}
                        onChange={(e) => setFormData({ ...formData, statusClassification: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. KONTAK & PENGGAJIAN */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> 3. Kontak & Gaji Pokok
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="nama@smpia9.sch.id / gmail.com"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">No. Handphone</label>
                      <input
                        type="text"
                        placeholder="0813-xxxx-xxxx"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Gaji Pokok (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        value={formData.baseSalary || 6000000}
                        onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Bank Penggajian</label>
                      <select
                        value={formData.bankName || 'BSI'}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                        <option value="BCA">BCA</option>
                        <option value="Mandiri">Bank Mandiri</option>
                        <option value="BRI">BRI</option>
                        <option value="BNI">BNI</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">No. Rekening Bank</label>
                      <input
                        type="text"
                        placeholder="7102-xxxx-xx"
                        value={formData.accountNumber || ''}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. AKUN LOGIN PEGAWAI (NIP & PASSWORD) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-100 pb-1.5 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-700" /> 4. Akun Login Mandiri Pegawai (NIP & Password)
                  </h4>

                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <Key className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-950">Akses Mandiri Slip Gaji untuk Pegawai</p>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Pegawai dapat login ke portal ini dengan <strong>NIP</strong> sebagai ID Pengguna dan <strong>Password</strong> di bawah ini untuk melihat serta mendownload slip gaji mereka secara mandiri.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Password Akun Pegawai <span className="text-slate-400 font-normal">(Default: NIP Pegawai)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {formData.nip && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, password: formData.nip })}
                            className="text-[11px] text-emerald-700 hover:underline font-medium"
                          >
                            Samakan dgn NIP
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const gen = Math.random().toString(36).slice(-8);
                            setFormData({ ...formData, password: gen });
                          }}
                          className="text-[11px] text-blue-700 hover:underline font-medium"
                        >
                          Generate Acak
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type={showModalPassword ? 'text' : 'password'}
                        placeholder={formData.nip ? `Contoh: ${formData.nip}` : 'Masukkan password login...'}
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 pr-10 text-sm font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showModalPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingEmp ? 'Simpan Perubahan' : 'Tambah Pegawai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETAIL PROFIL PEGAWAI                                              */}
      {/* ========================================================================= */}
      {viewingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-base">
                  {viewingEmp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">{viewingEmp.name}</h3>
                  <p className="text-xs text-emerald-100">{viewingEmp.category || viewingEmp.department}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingEmp(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">NIP</span>
                  <span className="font-mono font-bold text-slate-800">{viewingEmp.nip || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">NIK</span>
                  <span className="font-mono font-bold text-slate-800">{viewingEmp.nik || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">NUPTK</span>
                  <span className="font-mono font-bold text-slate-800">{viewingEmp.nuptk || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jenis Kelamin</span>
                  <span className="font-bold text-slate-800">{viewingEmp.gender === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}</span>
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-700" /> Kredensial Login Pegawai
                  </span>
                  <button
                    onClick={() => handleCopyPassword(viewingEmp)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300"
                  >
                    <Copy className="w-3 h-3" /> Salin Password
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">Username (NIP):</span>
                    <span className="font-mono font-bold text-slate-900">{viewingEmp.nip || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Password Login:</span>
                    <span className="font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                      {viewingEmp.password || viewingEmp.nip || '123456'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                  <span className="font-medium text-slate-800">
                    {viewingEmp.birthPlace || '-'}, {viewingEmp.birthDate || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Status & Golongan</span>
                  <span className="font-medium text-slate-800">{viewingEmp.statusClassification || viewingEmp.employeeStatus}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Mata Pelajaran / Tugas</span>
                  <span className="font-semibold text-emerald-800">{viewingEmp.subject || viewingEmp.position}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-blue-600">{viewingEmp.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">No. Handphone</span>
                  <span className="font-mono font-medium text-slate-800">{viewingEmp.phone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Gaji Pokok Master</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatRupiah(viewingEmp.baseSalary)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setViewingEmp(null);
                  handleOpenEdit(viewingEmp);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION: SINGLE DELETE                                               */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Data Pegawai?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pegawai{' '}
              <span className="font-bold text-slate-900">
                {employees.find((e) => e.id === deleteConfirmId)?.name}
              </span>{' '}
              dari database?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Hapus Pegawai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION: BATCH DELETE                                                */}
      {/* ========================================================================= */}
      {isBatchDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus {selectedEmpIds.length} Pegawai Terpilih?</h3>
                <p className="text-xs text-slate-500">Tindakan penghapusan massal</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Anda akan menghapus <span className="font-bold text-slate-900">{selectedEmpIds.length} pegawai</span> dari sistem. Apakah Anda ingin melanjutkan?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setIsBatchDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Hapus Semua Terpilih
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
