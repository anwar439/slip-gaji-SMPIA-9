import React, { useState } from 'react';
import { SalaryCalculationSource } from '../../types';
import { calculateSalaryMatrixRow } from '../../data/salaryMatrixData';
import { formatRupiah } from '../../utils/currencyFormatter';
import { X, Plus, Calculator, CheckCircle2 } from 'lucide-react';

interface AddSalaryMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newRow: Partial<SalaryCalculationSource>) => void;
}

export const AddSalaryMatrixModal: React.FC<AddSalaryMatrixModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState<Partial<SalaryCalculationSource>>({
    name: '',
    nip: '',
    npwp: '',
    employeeStatus: 'GTY',
    level: 'V C',
    category: 'GURU',
    joinDateStr: '01/07/2020',
    serviceYears: 5,
    serviceMonths: 0,
    husbandWifeCount: 1,
    childCount: 2,
    taxStatus: 'K/2',
    indexNumber: 22,
    performancePercent: 100,
    indexValueNew: 125000,
    indexValueOld: 123500,
    positionAllowanceBasic: 0,
    dedicationAllowancePercent: 5,
    familyAllowancePercent: 10,
    foundationAllowancePercent: 0,
    positionAllowance: 0,
    regionalAllowancePercent: 10,
    bpjsKesPremium: 250000,
    bpjsKesEmployee: 50000,
    bpjsKesFoundation: 200000,
    bpjsKtPremium: 300000,
    bpjsKtEmployee: 70000,
    bpjsKtFoundation: 230000,
    infaqMasjid: 50000,
    coopLoanDeduction: 0,
    regionalDeduction: 0,
    notes: '',
  });

  if (!isOpen) return null;

  const handleChange = (field: keyof SalaryCalculationSource, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'husbandWifeCount' || field === 'childCount') {
        const wife = field === 'husbandWifeCount' ? Number(value) : Number(prev.husbandWifeCount || 0);
        const child = field === 'childCount' ? Number(value) : Number(prev.childCount || 0);
        updated.familyAllowancePercent = (wife > 0 ? 10 : 0) + (Math.min(child, 3) * 5);
      }
      if (field === 'serviceYears') {
        const years = Number(value);
        if (years >= 20) updated.dedicationAllowancePercent = 25;
        else if (years >= 15) updated.dedicationAllowancePercent = 20;
        else if (years >= 10) updated.dedicationAllowancePercent = 15;
        else if (years >= 5) updated.dedicationAllowancePercent = 10;
        else if (years > 0) updated.dedicationAllowancePercent = 5;
      }
      return updated;
    });
  };

  const previewCalc = calculateSalaryMatrixRow(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Tambah Pegawai ke Skema Perhitungan Gaji
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Masukkan identitas, angka indeks, dan komponen tunjangan untuk dihitung secara otomatis.
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

        {/* Live preview banner */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimasi Gapok Kinerja</span>
            <span className="font-bold font-mono text-blue-300 text-sm">
              {formatRupiah(previewCalc.performanceBasicSalary)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimasi Total Potongan</span>
            <span className="font-bold font-mono text-rose-300 text-sm">
              {formatRupiah(previewCalc.totalDeduction)}
            </span>
          </div>
          <div className="bg-emerald-600 px-3 py-1 rounded-lg">
            <span className="text-[9px] text-emerald-100 uppercase font-black block">HASIL GAJI DIBAYAR (THP)</span>
            <span className="font-black font-mono text-white text-sm">
              {formatRupiah(previewCalc.netSalaryPaid)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                placeholder="Nama Guru / Staf"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Pegawai
              </label>
              <input
                type="text"
                value={formData.nip || ''}
                onChange={(e) => handleChange('nip', e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
                placeholder="Misal: 19850101..."
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
                placeholder="00.000.000.0-000.000"
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
                Golongan
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
                Angka Indeks Golongan
              </label>
              <input
                type="number"
                value={formData.indexNumber ?? 22}
                onChange={(e) => handleChange('indexNumber', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold px-3 py-2 border border-blue-300 rounded-xl font-mono text-blue-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prosen Kinerja (%)
              </label>
              <input
                type="number"
                value={formData.performancePercent ?? 100}
                onChange={(e) => handleChange('performancePercent', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tunj. Jabatan Struktural (Rp)
              </label>
              <input
                type="number"
                value={formData.positionAllowance ?? 0}
                onChange={(e) => handleChange('positionAllowance', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tunj. Pengabdian (%)
              </label>
              <input
                type="number"
                value={formData.dedicationAllowancePercent ?? 0}
                onChange={(e) => handleChange('dedicationAllowancePercent', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tunj. Keluarga (%)
              </label>
              <input
                type="number"
                value={formData.familyAllowancePercent ?? 0}
                onChange={(e) => handleChange('familyAllowancePercent', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Potongan BPJS Kes (Pegawai)
              </label>
              <input
                type="number"
                value={formData.bpjsKesDeduction ?? 0}
                onChange={(e) => handleChange('bpjsKesDeduction', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Potongan BPJS KT (Pegawai)
              </label>
              <input
                type="number"
                value={formData.bpjsKtDeduction ?? 0}
                onChange={(e) => handleChange('bpjsKtDeduction', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-medium px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan ke Skema</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
