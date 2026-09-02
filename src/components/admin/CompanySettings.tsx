import React, { useState, useRef } from 'react';
import { useSalary } from '../../context/SalaryContext';
import { CompanyProfile } from '../../types';
import {
  Building2,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  UserCheck,
  Award,
  Stamp,
  FileCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CompanySettings: React.FC = () => {
  const { companyProfile, updateCompanyProfile, showToast } = useSalary();
  const [formData, setFormData] = useState<CompanyProfile>({
    schoolName: 'SMP Islam Al Azhar 9 Bekasi',
    foundationName: 'Yayasan Wakaf Al Muhajirien Jakapermai',
    principalName: 'Amirudin, M.Pd.',
    principalNip: '102041398',
    principalTitle: 'Kepala SMP Islam Al Azhar 9',
    ...companyProfile,
  });

  const schoolLogoInputRef = useRef<HTMLInputElement>(null);
  const foundationLogoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof CompanyProfile
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({ ...prev, [field]: base64 }));
      showToast('Gambar berhasil diunggah dan siap disimpan', 'success');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field: keyof CompanyProfile) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(formData);
    showToast('Profil sekolah dan kepala sekolah berhasil diperbarui serta tersinkronisasi ke seluruh sistem!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Profil Sekolah, Yayasan & Kepala Sekolah
                </h1>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Tersinkronisasi
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Data dan logo yang diatur di sini otomatis muncul di Kop Slip Gaji PDF, Tanda Tangan Resmi, Dashboard & Header.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* SECTION 1: IDENTITAS SEKOLAH & YAYASAN */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              1. Identitas Sekolah & Yayasan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nama Yayasan Penyelenggara <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.foundationName || ''}
                onChange={(e) => setFormData({ ...formData, foundationName: e.target.value })}
                placeholder="Contoh: Yayasan Wakaf Al Muhajirien Jakapermai"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nama Sekolah Resmi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schoolName || ''}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value, name: e.target.value })}
                placeholder="Contoh: SMP Islam Al Azhar 9 Bekasi"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Alamat Lengkap Sekolah</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Contoh: Jl. Kemang Pratama Raya No. 9, Rawalumbu"
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Provinsi</label>
              <input
                type="text"
                value={formData.province || ''}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Kode Pos</label>
              <input
                type="text"
                value={formData.postalCode || ''}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">No. Telepon Sekolah</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Resmi Sekolah</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Website Sekolah</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: UPLOAD LOGO SEKOLAH & LOGO YAYASAN */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Upload Logo Resmi (Sekolah & Yayasan)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Logo Sekolah */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Logo SMP Islam Al Azhar 9</span>
                <span className="text-[10px] text-slate-500">Muncul di Kop Kiri Slip</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-emerald-300/80 p-2 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden">
                  {formData.schoolLogoUrl ? (
                    <img
                      src={formData.schoolLogoUrl}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-800 to-teal-950 text-amber-300 flex flex-col items-center justify-center text-[7px] font-black text-center p-1">
                      <span>SMP ISLAM</span>
                      <span>AL AZHAR 9</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="file"
                    ref={schoolLogoInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'schoolLogoUrl')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => schoolLogoInputRef.current?.click()}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formData.schoolLogoUrl ? 'Ganti Logo Sekolah' : 'Upload Logo Sekolah'}</span>
                  </button>

                  {formData.schoolLogoUrl && (
                    <button
                      type="button"
                      onClick={() => removeImage('schoolLogoUrl')}
                      className="w-full py-1.5 px-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus & Gunakan Emblem Default</span>
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Format PNG/JPG/SVG transparan, maks 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Logo Yayasan */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Logo Yayasan Al-Muhajirien</span>
                <span className="text-[10px] text-slate-500">Muncul di Kop Kanan Slip</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-teal-300/80 p-2 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden">
                  {formData.foundationLogoUrl ? (
                    <img
                      src={formData.foundationLogoUrl}
                      alt="Logo Yayasan"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-900 to-slate-950 text-white flex flex-col items-center justify-center text-[7px] font-black text-center p-1">
                      <span className="text-teal-200">YAYASAN</span>
                      <span className="text-amber-300">AL-MUHAJIRIEN</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    type="file"
                    ref={foundationLogoInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'foundationLogoUrl')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => foundationLogoInputRef.current?.click()}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    <span>{formData.foundationLogoUrl ? 'Ganti Logo Yayasan' : 'Upload Logo Yayasan'}</span>
                  </button>

                  {formData.foundationLogoUrl && (
                    <button
                      type="button"
                      onClick={() => removeImage('foundationLogoUrl')}
                      className="w-full py-1.5 px-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus & Gunakan Emblem Default</span>
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Format PNG/JPG/SVG transparan, maks 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DATA KEPALA SEKOLAH & PENGESAHAN SLIP */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              3. Data Kepala Sekolah & Pengesahan Slip Gaji
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nama Lengkap Kepala Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.principalName || ''}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                placeholder="Contoh: Amirudin, M.Pd."
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                NIP Kepala Sekolah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.principalNip || ''}
                onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                placeholder="Contoh: 102041398"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Jabatan Pengesahan Slip <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.principalTitle || ''}
                onChange={(e) => setFormData({ ...formData, principalTitle: e.target.value })}
                placeholder="Contoh: Kepala SMP Islam Al Azhar 9"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tanda Tangan Digital & Stempel Sekolah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            {/* Tanda Tangan Digital */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Tanda Tangan Digital Kepala Sekolah</span>
                <span className="text-[10px] text-slate-500">PNG Transparan</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-16 bg-white border border-slate-300 rounded-xl p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {formData.signatureImageUrl ? (
                    <img
                      src={formData.signatureImageUrl}
                      alt="Tanda Tangan"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-slate-600 text-xs">Amirudin</span>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={signatureInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'signatureImageUrl')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => signatureInputRef.current?.click()}
                    className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3 h-3 text-emerald-600" />
                    <span>Upload Tanda Tangan</span>
                  </button>
                  {formData.signatureImageUrl && (
                    <button
                      type="button"
                      onClick={() => removeImage('signatureImageUrl')}
                      className="text-[10px] text-rose-600 hover:underline block text-center w-full"
                    >
                      Hapus Tanda Tangan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stempel Sekolah */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Stempel Digital Resmi Sekolah</span>
                <span className="text-[10px] text-slate-500">PNG Transparan</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-16 bg-white border border-slate-300 rounded-xl p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {formData.stampImageUrl ? (
                    <img
                      src={formData.stampImageUrl}
                      alt="Stempel"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-emerald-600 text-emerald-700 flex flex-col items-center justify-center text-[5px] font-bold text-center">
                      <span>SMPI AL AZHAR 9</span>
                      <span>TERVERIFIKASI</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={stampInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'stampImageUrl')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => stampInputRef.current?.click()}
                    className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3 h-3 text-emerald-600" />
                    <span>Upload Stempel Resmi</span>
                  </button>
                  {formData.stampImageUrl && (
                    <button
                      type="button"
                      onClick={() => removeImage('stampImageUrl')}
                      className="text-[10px] text-rose-600 hover:underline block text-center w-full"
                    >
                      Hapus Stempel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nama Bendahara / Keuangan</label>
              <input
                type="text"
                value={formData.financeName || ''}
                onChange={(e) => setFormData({ ...formData, financeName: e.target.value })}
                placeholder="Contoh: Windy Farida, SE."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Jabatan Bendahara</label>
              <input
                type="text"
                value={formData.financeTitle || ''}
                onChange={(e) => setFormData({ ...formData, financeTitle: e.target.value })}
                placeholder="Contoh: Bendahara / Keuangan"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: DISCLAIMER & CATATAN KAKI */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              4. Catatan Kaki Slip Gaji (Footer Disclaimer)
            </h2>
          </div>

          <div>
            <textarea
              rows={3}
              value={formData.footerNote || ''}
              onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs leading-relaxed"
              placeholder="Dokumen ini merupakan slip gaji resmi yang sah dan diterbitkan secara digital..."
            />
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Perubahan otomatis tersimpan ke memori browser & database slip.</span>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Perubahan Profil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
