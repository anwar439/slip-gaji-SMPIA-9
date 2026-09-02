import React, { useState } from 'react';
import { SalaryCalculationSource } from '../../types';
import { calculateSalaryMatrixRow } from '../../data/salaryMatrixData';
import { formatRupiah } from '../../utils/currencyFormatter';
import {
  X,
  Save,
  Calculator,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Users,
  Percent,
} from 'lucide-react';

interface EditSalaryMatrixModalProps {
  data: SalaryCalculationSource;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: SalaryCalculationSource) => void;
}

export const EditSalaryMatrixModal: React.FC<EditSalaryMatrixModalProps> = ({
  data,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SalaryCalculationSource>({ ...data });
  const [activeTab, setActiveTab] = useState<'general' | 'indeks' | 'bpjs' | 'tunjangan' | 'potongan' | 'preview'>('general');
  const [autoCalculate, setAutoCalculate] = useState<boolean>(true);

  if (!isOpen) return null;

  // Handle value changes with reactive auto-calculation across all dependencies
  const handleChange = (field: keyof SalaryCalculationSource, value: any) => {
    setFormData((prev) => {
      const updated: Partial<SalaryCalculationSource> = { ...prev, [field]: value };
      
      // When wife count or child count changes, automatically sync family allowance percentage
      if (field === 'husbandWifeCount' || field === 'childCount') {
        const wife = field === 'husbandWifeCount' ? Number(value) : Number(prev.husbandWifeCount || 0);
        const child = field === 'childCount' ? Number(value) : Number(prev.childCount || 0);
        updated.familyAllowancePercent = (wife > 0 ? 10 : 0) + (Math.min(child, 3) * 5);
      }

      // When service years changes, auto-suggest standard dedication percentage
      if (field === 'serviceYears') {
        const years = Number(value);
        if (years >= 20) updated.dedicationAllowancePercent = 25;
        else if (years >= 15) updated.dedicationAllowancePercent = 20;
        else if (years >= 10) updated.dedicationAllowancePercent = 15;
        else if (years >= 5) updated.dedicationAllowancePercent = 10;
        else if (years > 0) updated.dedicationAllowancePercent = 5;
      }

      if (autoCalculate) {
        return calculateSalaryMatrixRow(updated);
      }
      return updated as SalaryCalculationSource;
    });
  };

  const handleRecalculateNow = () => {
    setFormData(calculateSalaryMatrixRow(formData));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(calculateSalaryMatrixRow(formData));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Edit Sumber & Formula Perhitungan Gaji
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                  {formData.level} • {formData.employeeStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {formData.name} (NIP: {formData.nip || '-'})
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

        {/* Live Result Highlight Bar (Tabel Paling Kanan) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Gapok Kinerja</span>
              <span className="font-bold font-mono text-sm text-blue-300">
                {formatRupiah(formData.performanceBasicSalary)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Gaji Kotor</span>
              <span className="font-bold font-mono text-sm text-emerald-300">
                {formatRupiah(formData.grossSalary)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Potongan</span>
              <span className="font-bold font-mono text-sm text-rose-300">
                {formatRupiah(formData.totalDeduction)}
              </span>
            </div>
          </div>

          {/* HASIL AKHIR TABEL PALING KANAN */}
          <div className="bg-emerald-600/90 border border-emerald-400/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-xs">
            <div>
              <span className="text-[9px] text-emerald-100 uppercase font-black tracking-wider block">
                HASIL AKHIR: GAJI DIBAYAR (THP)
              </span>
              <span className="font-black font-mono text-base text-white">
                {formatRupiah(formData.netSalaryPaid)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto text-xs font-semibold py-2">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'general'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Identitas & Status
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('indeks')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'indeks'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Angka & Indeks Kinerja
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bpjs')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'bpjs'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. BPJS & JHT
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tunjangan')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'tunjangan'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Tunjangan Yayasan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('potongan')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'potongan'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            5. Potongan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'preview'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            6. Rekapitulasi Lengkap
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: IDENTITAS & STATUS */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Informasi Pegawai & Golongan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    type="text"
                    value={formData.nip || ''}
                    onChange={(e) => handleChange('nip', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NPWP
                  </label>
                  <input
                    type="text"
                    value={formData.npwp || ''}
                    onChange={(e) => handleChange('npwp', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Kepegawaian
                  </label>
                  <select
                    value={formData.employeeStatus || 'GTY'}
                    onChange={(e) => handleChange('employeeStatus', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="GTYK">GTYK (Guru Tetap Yayasan Khusus)</option>
                    <option value="CPG">CPG (Calon Pegawai Guru)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="KTY">KTY (Karyawan Tetap Yayasan)</option>
                    <option value="KTT">KTT (Karyawan Tidak Tetap)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Golongan (Level)
                  </label>
                  <select
                    value={formData.level || 'V C'}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                  >
                    <option value="VI D">VI D</option>
                    <option value="VI C">VI C</option>
                    <option value="V D">V D</option>
                    <option value="V C">V C</option>
                    <option value="V B">V B</option>
                    <option value="V A">V A</option>
                    <option value="IV D">IV D</option>
                    <option value="IV C">IV C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Unit
                  </label>
                  <select
                    value={formData.category || 'GURU'}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="GURU">GURU</option>
                    <option value="TATA USAHA">TATA USAHA</option>
                    <option value="JANITOR">JANITOR</option>
                    <option value="SECURITY">SECURITY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mulai Tugas (Tgl / Thn)
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.joinDateStr || ''}
                    onChange={(e) => handleChange('joinDateStr', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Masa Kerja (Tahun & Bulan)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center border border-slate-300 rounded-xl px-2">
                      <input
                        type="number"
                        min="0"
                        value={formData.serviceYears ?? 0}
                        onChange={(e) => handleChange('serviceYears', parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-medium py-1.5 border-none outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-400 font-bold ml-1">Th</span>
                    </div>
                    <div className="flex-1 flex items-center border border-slate-300 rounded-xl px-2">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={formData.serviceMonths ?? 0}
                        onChange={(e) => handleChange('serviceMonths', parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-medium py-1.5 border-none outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-400 font-bold ml-1">Bln</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Tanggungan / PTKP
                  </label>
                  <select
                    value={formData.taxStatus || 'K/0'}
                    onChange={(e) => handleChange('taxStatus', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                  >
                    <option value="K/3">K/3 (Kawin, 3 Tanggungan)</option>
                    <option value="K/2">K/2 (Kawin, 2 Tanggungan)</option>
                    <option value="K/1">K/1 (Kawin, 1 Tanggungan)</option>
                    <option value="K/0">K/0 (Kawin, 0 Tanggungan)</option>
                    <option value="TK/0">TK/0 (Tidak Kawin)</option>
                    <option value="P">P (Peralihan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan Jabatan
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl"
                  placeholder="Contoh: Guru Matematika / Kepala Sekolah"
                />
              </div>
            </div>
          )}

          {/* TAB 2: INDEKS & NILAI KINERJA */}
          {activeTab === 'indeks' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
                <span className="font-bold block">Rumus Perhitungan Gaji Pokok Nilai Kinerja Yayasan Al Azhar:</span>
                <p className="font-mono text-[11px] text-blue-800">
                  Gapok Nilai Kinerja = (Angka Indeks × Nilai Indeks Baru) × (Prosen Kinerja ÷ 100)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Angka Indeks Golongan
                  </label>
                  <input
                    type="number"
                    value={formData.indexNumber ?? 0}
                    onChange={(e) => handleChange('indexNumber', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl font-mono text-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Misal: 25, 22, 26, 21, 20, 19</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prosen Nilai Kinerja (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.performancePercent ?? 0}
                    onChange={(e) => handleChange('performancePercent', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Misal: 100% (Penuh), 80% (CPG), 50% (Part-time)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Indeks Baru (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.indexValueNew ?? 0}
                    onChange={(e) => handleChange('indexValueNew', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Standar Yayasan: Rp 125.000</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Indeks Lama (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.indexValueOld ?? 0}
                    onChange={(e) => handleChange('indexValueOld', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Standar Lama: Rp 123.500</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gapok Nilai Kinerja (Hasil)
                  </label>
                  <input
                    type="number"
                    value={formData.performanceBasicSalary ?? 0}
                    onChange={(e) => handleChange('performanceBasicSalary', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-black px-3 py-2 border border-blue-300 bg-blue-50/50 rounded-xl font-mono text-blue-800"
                  />
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    = {formatRupiah(formData.performanceBasicSalary)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tunjangan Jabatan Struktural (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.positionAllowanceBasic ?? 0}
                    onChange={(e) => handleChange('positionAllowanceBasic', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Misal: Rp 3.500.000 (Kepsek), Rp 3.000.000 (Wakepsek)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BPJS & JHT */}
          {activeTab === 'bpjs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Data BPJS Kesehatan & BPJS Ketenagakerjaan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BPJS Kesehatan Card */}
                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900">BPJS Kesehatan</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                      Subsidi Yayasan 4% + Pegawai 1%
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Total Premi BPJS Kesehatan (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.bpjsKesPremium ?? 0}
                      onChange={(e) => handleChange('bpjsKesPremium', parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono px-3 py-2 border border-teal-300 rounded-xl bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Potongan Pegawai (1%)
                      </label>
                      <input
                        type="number"
                        value={formData.bpjsKesEmployee ?? 0}
                        onChange={(e) => handleChange('bpjsKesEmployee', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono px-3 py-1.5 border border-teal-300 rounded-xl bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Yayasan (4%)
                      </label>
                      <input
                        type="number"
                        value={formData.bpjsKesFoundation ?? 0}
                        onChange={(e) => handleChange('bpjsKesFoundation', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono px-3 py-1.5 border border-teal-300 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* BPJS Ketenagakerjaan Card */}
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">BPJS Ketenagakerjaan (JHT, JKK, JKM, JP)</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                      BPJS TK
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Total Premi BPJS KT (Rp)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.bpjsKtPremium ?? 0}
                      onChange={(e) => handleChange('bpjsKtPremium', parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-mono px-3 py-2 border border-indigo-300 rounded-xl bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Potongan Pegawai (Rp)
                      </label>
                      <input
                        type="number"
                        value={formData.bpjsKtEmployee ?? 0}
                        onChange={(e) => handleChange('bpjsKtEmployee', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono px-3 py-1.5 border border-indigo-300 rounded-xl bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Yayasan (Rp)
                      </label>
                      <input
                        type="number"
                        value={formData.bpjsKtFoundation ?? 0}
                        onChange={(e) => handleChange('bpjsKtFoundation', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono px-3 py-1.5 border border-indigo-300 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* JHT Jiwasraya */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    No. Sertifikat JHT
                  </label>
                  <input
                    type="text"
                    value={formData.certificateNumber || ''}
                    onChange={(e) => handleChange('certificateNumber', e.target.value)}
                    className="w-full text-xs font-mono px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                    placeholder="Misal: 3715 / 3426"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    JHT Jiwasraya / Tahun (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.jhtPerYear ?? 0}
                    onChange={(e) => handleChange('jhtPerYear', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Potongan JHT (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.jhtDeduction ?? 0}
                    onChange={(e) => handleChange('jhtDeduction', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TUNJANGAN YAYASAN */}
          {activeTab === 'tunjangan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Komponen Tunjangan Yayasan & Daerah
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Tunjangan Pengabdian */}
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-900">Tunj. Pengabdian</span>
                    <span className="text-[10px] font-mono text-amber-700">
                      {formData.dedicationAllowancePercent ?? 0}% dari Gapok
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <input
                        type="number"
                        value={formData.dedicationAllowancePercent ?? 0}
                        onChange={(e) => handleChange('dedicationAllowancePercent', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold px-2.5 py-1.5 border border-amber-300 rounded-xl font-mono text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={formData.dedicationAllowanceAmount ?? 0}
                        onChange={(e) => handleChange('dedicationAllowanceAmount', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-amber-300 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-800 font-medium font-mono">
                    = {formatRupiah(formData.dedicationAllowanceAmount)}
                  </p>
                </div>

                {/* Tunjangan Keluarga */}
                <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-900">Tunj. Keluarga</span>
                    <span className="text-[10px] font-mono text-purple-700">
                      {formData.familyAllowancePercent ?? 0}% dari Gapok
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <input
                        type="number"
                        value={formData.familyAllowancePercent ?? 0}
                        onChange={(e) => handleChange('familyAllowancePercent', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold px-2.5 py-1.5 border border-purple-300 rounded-xl font-mono text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={formData.familyAllowanceAmount ?? 0}
                        onChange={(e) => handleChange('familyAllowanceAmount', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-purple-300 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-purple-800 font-medium font-mono">
                    = {formatRupiah(formData.familyAllowanceAmount)}
                  </p>
                </div>

                {/* Tunjangan Yayasan / Peralihan */}
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-900">Tunj. Yayasan / Peralihan</span>
                    <span className="text-[10px] font-mono text-blue-700">
                      {formData.foundationAllowancePercent ?? 0}% dari Gapok
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <input
                        type="number"
                        value={formData.foundationAllowancePercent ?? 0}
                        onChange={(e) => handleChange('foundationAllowancePercent', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold px-2.5 py-1.5 border border-blue-300 rounded-xl font-mono text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={formData.foundationAllowanceAmount ?? 0}
                        onChange={(e) => handleChange('foundationAllowanceAmount', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-mono font-bold px-2.5 py-1.5 border border-blue-300 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-800 font-medium font-mono">
                    = {formatRupiah(formData.foundationAllowanceAmount)}
                  </p>
                </div>

                {/* Tunjangan Jabatan */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Tunjangan Jabatan</span>
                  <input
                    type="number"
                    value={formData.positionAllowance ?? 0}
                    onChange={(e) => handleChange('positionAllowance', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    = {formatRupiah(formData.positionAllowance)}
                  </p>
                </div>

                {/* Tunjangan Daerah (10%) */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-900">Tunjangan Daerah</span>
                    <span className="text-[10px] font-mono text-emerald-700">
                      {formData.regionalAllowancePercent ?? 0}% Gaji Kotor
                    </span>
                  </div>
                  <input
                    type="number"
                    value={formData.regionalAllowanceAmount ?? 0}
                    onChange={(e) => handleChange('regionalAllowanceAmount', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold px-3 py-1.5 border border-emerald-300 rounded-xl bg-white"
                  />
                  <p className="text-[10px] text-emerald-800 font-mono">
                    = {formatRupiah(formData.regionalAllowanceAmount)}
                  </p>
                </div>

                {/* Total Gaji Kotor */}
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-1 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Total Gaji Kotor & Diterima
                  </span>
                  <div>
                    <span className="text-xs text-slate-300 block">Gaji Kotor: {formatRupiah(formData.grossSalary)}</span>
                    <span className="text-sm font-black font-mono text-emerald-400 block">
                      Jumlah Diterima: {formatRupiah(formData.totalSalaryReceived)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: POTONGAN */}
          {activeTab === 'potongan' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rincian Potongan Gaji Pegawai
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    BPJS Kesehatan (Pegawai)
                  </label>
                  <input
                    type="number"
                    value={formData.bpjsKesDeduction ?? 0}
                    onChange={(e) => handleChange('bpjsKesDeduction', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    BPJS Ketenagakerjaan (Pegawai)
                  </label>
                  <input
                    type="number"
                    value={formData.bpjsKtDeduction ?? 0}
                    onChange={(e) => handleChange('bpjsKtDeduction', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Infaq Masjid / Yayasan (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.infaqMasjid ?? 0}
                    onChange={(e) => handleChange('infaqMasjid', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl font-bold text-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Koperasi / Kasbon Pinjaman (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.coopLoanDeduction ?? 0}
                    onChange={(e) => handleChange('coopLoanDeduction', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl font-bold text-rose-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Potongan Daerah (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.regionalDeduction ?? 0}
                    onChange={(e) => handleChange('regionalDeduction', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                {/* Total Potongan */}
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-rose-700 uppercase font-bold tracking-wider">
                    Total Seluruh Potongan
                  </span>
                  <span className="text-base font-black font-mono text-rose-700">
                    {formatRupiah(formData.totalDeduction)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REKAPITULASI LENGKAP */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl border border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700 gap-2">
                  <div>
                    <h4 className="font-extrabold text-base text-white">{formData.name}</h4>
                    <p className="text-xs text-slate-300 font-mono">
                      NIP: {formData.nip} • Status: {formData.employeeStatus} • Gol: {formData.level}
                    </p>
                  </div>
                  <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs px-3 py-1 rounded-full font-mono font-bold text-right">
                    THP: {formatRupiah(formData.netSalaryPaid)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Gapok Kinerja</span>
                    <span className="font-mono font-bold text-blue-300 text-sm">
                      {formatRupiah(formData.performanceBasicSalary)}
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Total Tunjangan</span>
                    <span className="font-mono font-bold text-purple-300 text-sm">
                      {formatRupiah(formData.totalAllowances)}
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Gaji Kotor + Daerah</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {formatRupiah(formData.totalSalaryReceived)}
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Total Potongan</span>
                    <span className="font-mono font-bold text-rose-300 text-sm">
                      {formatRupiah(formData.totalDeduction)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-300">
                  <span>Tabel Paling Kanan (Gaji Dibayar):</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {formatRupiah(formData.netSalaryPaid)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCalculate}
                  onChange={(e) => setAutoCalculate(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Kalkulasi Rumus Otomatis Saat Data Diubah</span>
              </label>

              <button
                type="button"
                onClick={handleRecalculateNow}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Hitung Ulang</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
