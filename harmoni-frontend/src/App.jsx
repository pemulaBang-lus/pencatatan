import { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('pencatatan'); 
  const [kategoriList, setKategoriList] = useState(['SPK', 'Invoice', 'Memo Dinas', 'Laporan Keuangan']);
  const [inputKategoriBaru, setInputKategoriBaru] = useState('');
  
  // Storage Lokal Browser
  const [dokumenList, setDokumenList] = useState(() => {
    const saved = localStorage.getItem('ptpn_dokumen_data');
    return saved ? JSON.parse(saved) : [
      { id: 1, jenis_dokumen: 'SPK', nomor_dokumen: 'SPK/2026/VIII/012', mpp: 'MPP-88321', dpbb: 'DPBB-4451', tujuan_dept: 'Bagian Akuntansi', pic_penerima: 'Pak Budi', status_posisi: 'Sedang di Bagian Lain', nama_bank: 'Mandiri', rekening: '1050009876543' },
      { id: 2, jenis_dokumen: 'Invoice', nomor_dokumen: 'INV/PTPN4/2026/089', mpp: 'MPP-88490', dpbb: 'DPBB-4490', tujuan_dept: 'Bagian Keuangan', pic_penerima: 'Bu Maya', status_posisi: 'Sudah Kembali ke IT', nama_bank: 'BRI', rekening: '034101002345508' }
    ];
  });

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    jenis_dokumen: 'SPK', nomor_dokumen: '', mpp: '', dpbb: '', 
    tujuan_dept: '', pic_penerima: '', status_posisi: 'Sedang di Bagian Lain', 
    nama_bank: 'Mandiri', rekening: '', status_rekening: 'Belum Diinput'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('Semua');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ visible: false, id: null });

  useEffect(() => {
    localStorage.setItem('ptpn_dokumen_data', JSON.stringify(dokumenList));
  }, [dokumenList]);

  useEffect(() => {
    if (!toast.visible) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2600);

    return () => clearTimeout(timer);
  }, [toast.visible]);

  const handleTambahKategori = (e) => {
    e.preventDefault();
    if (inputKategoriBaru.trim() !== '' && !kategoriList.includes(inputKategoriBaru)) {
      const updated = [...kategoriList, inputKategoriBaru];
      setKategoriList(updated);
      setForm({ ...form, jenis_dokumen: updated[0] });
      setInputKategoriBaru('');
    }
  };

  const handleHapusKategori = (namaKategori) => {
    if (kategoriList.length <= 1) {
      alert("Minimal harus ada 1 jenis dokumen!");
      return;
    }
    const updated = kategoriList.filter((kat) => kat !== namaKategori);
    setKategoriList(updated);
    if (form.jenis_dokumen === namaKategori) {
      setForm({ ...form, jenis_dokumen: updated[0] });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleSubmitDokumen = (e) => {
    e.preventDefault();
    
    if (editingId) {
      const updatedList = dokumenList.map((doc) => 
        doc.id === editingId ? { ...form, id: editingId } : doc
      );
      setDokumenList(updatedList);
      showToast('Data dokumen berhasil diperbarui');
    } else {
      const newDoc = { ...form, id: Date.now() };
      setDokumenList([newDoc, ...dokumenList]);
      showToast('Data dokumen berhasil disimpan');
    }

    resetForm();
  };

  const handleEditClick = (doc) => {
    setEditingId(doc.id);
    setForm({
      jenis_dokumen: doc.jenis_dokumen || kategoriList[0],
      nomor_dokumen: doc.nomor_dokumen || '',
      mpp: doc.mpp || doc.npp || '', // Auto-convert kalau ada data lama NPP
      dpbb: doc.dpbb || '',
      tujuan_dept: doc.tujuan_dept || '',
      pic_penerima: doc.pic_penerima || '',
      status_posisi: doc.status_posisi || 'Sedang di Bagian Lain',
      nama_bank: doc.nama_bank || 'Mandiri',
      rekening: doc.rekening || '',
      status_rekening: doc.status_rekening || 'Belum Diinput'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ 
      jenis_dokumen: kategoriList[0] || 'SPK', 
      nomor_dokumen: '', mpp: '', dpbb: '', 
      tujuan_dept: '', pic_penerima: '', status_posisi: 'Sedang di Bagian Lain', 
      nama_bank: 'Mandiri', rekening: '', status_rekening: 'Belum Diinput' 
    });
  };

  const handleDeleteAsk = (id) => {
    setConfirmDelete({ visible: true, id });
  };

  const handleDelete = () => {
    if (!confirmDelete.id) return;

    const updatedList = dokumenList.filter((doc) => doc.id !== confirmDelete.id);
    setDokumenList(updatedList);
    setConfirmDelete({ visible: false, id: null });
    showToast('Data dokumen berhasil dihapus');
  };

  const filteredDokumen = dokumenList.filter((doc) => {
    const matchCategory = selectedFilterCategory === 'Semua' || doc.jenis_dokumen === selectedFilterCategory;
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      (doc.nomor_dokumen && doc.nomor_dokumen.toLowerCase().includes(query)) ||
      (doc.rekening && doc.rekening.toLowerCase().includes(query)) ||
      (doc.nama_bank && doc.nama_bank.toLowerCase().includes(query)) ||
      (doc.mpp && doc.mpp.toLowerCase().includes(query)) ||
      (doc.dpbb && doc.dpbb.toLowerCase().includes(query)) ||
      (doc.pic_penerima && doc.pic_penerima.toLowerCase().includes(query)) ||
      (doc.tujuan_dept && doc.tujuan_dept.toLowerCase().includes(query));

    return matchCategory && matchSearch;
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f5fff7,_#ebf7ee_35%,_#e0f2e6_100%)] text-slate-800 font-sans">
      {toast.visible && (
        <div className="fixed right-5 top-5 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur-md ${toast.type === 'success' ? 'border-emerald-200 bg-white/90 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {toast.type === 'success' ? '✓' : '!'}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Notifikasi</p>
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {confirmDelete.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_30px_60px_rgba(15,23,42,0.2)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-xl text-rose-600">!</div>
            <h3 className="text-lg font-black text-slate-900">Hapus dokumen?</h3>
            <p className="mt-2 text-sm text-slate-600">Tindakan ini akan menghapus data yang dipilih secara permanen.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete({ visible: false, id: null })} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="button" onClick={handleDelete} className="rounded-xl bg-gradient-to-r from-[#046205] to-[#137f41] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#137f41]/25">Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/backgroundweb.jpg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#046205]/75 via-[#137f41]/65 to-[#022b12]/80" />
      </div>

      <header className="relative z-10 overflow-hidden border-b border-white/20 shadow-[0_14px_50px_rgba(4,98,5,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#046205]/90 via-[#137f41]/80 to-[#0d3f23]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%)]" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/ptpnlogo.png"
                alt="Logo PTPN 4 Regional 1"
                className="h-12 w-12 md:h-14 md:w-14 rounded-full border border-white/40 bg-white/10 p-1 shadow-lg object-contain backdrop-blur-sm"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                  <span className="text-[10px] md:text-[11px] font-black tracking-[0.25em] text-white/90 uppercase">PTPN 4 Regional 1</span>
                </div>
                <h1 className="text-xl md:text-3xl font-black tracking-tight text-white drop-shadow-md">
                  Sistem Tracking & Pencatatan Dokumen
                </h1>
              </div>
            </div>

            <div className="inline-flex self-start md:self-auto items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm shadow-md">
              <span className="inline-flex h-2 h-2 rounded-full bg-lime-300 animate-pulse" />
              Pengelola: <span className="font-black text-white">Bu Susi (Bagian IT)</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-[#cfead6] bg-white/70 p-2 shadow-[0_12px_30px_rgba(4,98,5,0.08)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveTab('pencatatan')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'pencatatan'
                ? 'bg-gradient-to-r from-[#046205] to-[#137f41] text-white shadow-lg shadow-[#137f41]/30'
                : 'bg-white text-[#246b39] border border-[#d4ead9] hover:bg-[#f4fbf5]'
            }`}
          >
            📝 Pencatatan & Tracking Dokumen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kategori')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'kategori'
                ? 'bg-gradient-to-r from-[#046205] to-[#137f41] text-white shadow-lg shadow-[#137f41]/30'
                : 'bg-white text-[#246b39] border border-[#d4ead9] hover:bg-[#f4fbf5]'
            }`}
          >
            📁 Kelola Jenis Dokumen ({kategoriList.length})
          </button>
        </div>

        {activeTab === 'kategori' && (
          <div className="mb-8 max-w-2xl rounded-3xl border border-[#d5eada] bg-white/80 p-6 shadow-[0_18px_40px_rgba(4,98,5,0.08)] backdrop-blur-sm">
            <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#0d5c2b]">Buat atau Hapus Jenis Dokumen</h2>
            <form onSubmit={handleTambahKategori} className="mb-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={inputKategoriBaru}
                onChange={(e) => setInputKategoriBaru(e.target.value)}
                placeholder="Misal: Berita Acara..."
                className="flex-1 rounded-xl border border-[#d3e7d7] bg-[#f5faf6] px-3.5 py-2.5 text-xs text-slate-700 outline-none ring-0 transition focus:border-[#137f41] focus:bg-white"
              />
              <button type="submit" className="rounded-xl bg-gradient-to-r from-[#046205] to-[#137f41] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#137f41]/25 transition hover:brightness-110">
                + Tambah Jenis
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {kategoriList.map((kat, index) => (
                <div key={index} className="flex items-center gap-2 rounded-full border border-[#b9dbc0] bg-[#edf9f1] px-3 py-1.5 text-xs font-semibold text-[#0d5c2b]">
                  <span>📁 {kat}</span>
                  <button type="button" onClick={() => handleHapusKategori(kat)} className="ml-1 text-base font-bold text-[#2a6a3a] transition hover:text-[#a11c1c]">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pencatatan' && (
          <>
            <div className={`mb-8 rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(4,98,5,0.08)] backdrop-blur-sm transition-all ${editingId ? 'border-[#f3d19d] bg-gradient-to-br from-[#fffaf0] to-[#fff] ' : 'border-[#d5eada] bg-white/85'}`}>
              <div className="mb-4 flex items-center justify-between border-b border-[#ebf2ed] pb-3">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0d5c2b]">
                  {editingId ? '✏️ Mode Edit Data Dokumen' : 'Form Input & Tracking Berkas'}
                </h2>
                {editingId && (
                  <button type="button" onClick={resetForm} className="text-xs font-bold text-[#b45309] transition hover:text-[#92400e]">
                    Batal Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitDokumen}>
                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">Jenis Dokumen</label>
                    <select name="jenis_dokumen" value={form.jenis_dokumen} onChange={handleChange} className="rounded-xl border border-[#d9eadf] bg-[#edf9f1] px-3 py-2.5 text-xs font-semibold text-[#0d5c2b] outline-none transition focus:border-[#137f41] focus:bg-white">
                      {kategoriList.map((kat, i) => (<option key={i} value={kat}>{kat}</option>))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">Nomor Dokumen <span className="text-rose-500">*</span></label>
                    <input name="nomor_dokumen" value={form.nomor_dokumen} onChange={handleChange} required className="rounded-xl border border-[#d9eadf] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20" placeholder="Isi nomor dokumen..." />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">Nomor MPP</label>
                    <input name="mpp" value={form.mpp} onChange={handleChange} className="rounded-xl border border-[#d9eadf] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20" placeholder="Opsional" />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">Nomor DPBB</label>
                    <input name="dpbb" value={form.dpbb} onChange={handleChange} className="rounded-xl border border-[#d9eadf] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20" placeholder="Opsional" />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">Departemen Tujuan</label>
                    <input name="tujuan_dept" value={form.tujuan_dept} onChange={handleChange} className="rounded-xl border border-[#d9eadf] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20" placeholder="Misal: Bagian Akuntansi" />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#0d5c2b]">Nama Pemegang (PIC)</label>
                    <input name="pic_penerima" value={form.pic_penerima} onChange={handleChange} className="rounded-xl border border-[#a8d4b6] bg-[#f2fbf4] px-3 py-2.5 text-xs text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20" placeholder="Misal: Pak Budi" />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#0d5c2b]">Status Lokasi Berkas</label>
                    <select name="status_posisi" value={form.status_posisi} onChange={handleChange} className="rounded-xl border border-[#a8d4b6] bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20">
                      <option value="Sedang di Bagian Lain">🚚 Masih di Bagian Lain</option>
                      <option value="Sudah Kembali ke IT">📁 Sudah Kembali (Arsip Bu Susi)</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">Bank & Rekening</label>
                    <div className="flex gap-2">
                      <select name="nama_bank" value={form.nama_bank} onChange={handleChange} className="w-1/3 rounded-xl border border-[#d9eadf] bg-white px-2 py-2.5 text-xs text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20">
                        <option value="Mandiri">Mandiri</option>
                        <option value="BRI">BRI</option>
                        <option value="BNI">BNI</option>
                        <option value="BCA">BCA</option>
                        <option value="Bank Sumut">Bank Sumut</option>
                      </select>
                      <input name="rekening" value={form.rekening} onChange={handleChange} className="w-2/3 rounded-xl border border-[#d9eadf] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20" placeholder="No. Rekening" />
                    </div>
                  </div>
                </div>

                <button type="submit" className={`w-full rounded-2xl py-3 text-xs font-black text-white shadow-lg transition hover:brightness-110 ${editingId ? 'bg-gradient-to-r from-[#d97706] to-[#f59e0b]' : 'bg-gradient-to-r from-[#046205] to-[#137f41]'}`}>
                  {editingId ? '✓ Perbarui Data Dokumen' : '+ Simpan & Track Dokumen'}
                </button>
              </form>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[#d5eada] bg-white/90 shadow-[0_18px_40px_rgba(4,98,5,0.08)] backdrop-blur-sm">
              <div className="flex flex-col gap-3 border-b border-[#edf2ef] bg-gradient-to-r from-[#f2fbf4] to-[#edf8ef] p-3.5 md:flex-row md:items-center md:justify-between">
                <input
                  type="text"
                  placeholder="🔍 Cari No. Dokumen, Pemegang, Rekening, MPP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full max-w-md rounded-xl border border-[#dcefe2] bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-[#137f41] focus:ring-2 focus:ring-[#137f41]/20"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#3b6b4a]">Filter:</span>
                  <button type="button" onClick={() => setSelectedFilterCategory('Semua')} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${selectedFilterCategory === 'Semua' ? 'bg-[#046205] text-white shadow-md' : 'border border-[#dcefe2] bg-white text-[#2f5d3d] hover:bg-[#f4faf6]'}`}>Semua</button>
                  {kategoriList.map((kat, index) => (
                    <button type="button" key={index} onClick={() => setSelectedFilterCategory(kat)} className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${selectedFilterCategory === kat ? 'bg-[#046205] text-white shadow-md' : 'border border-[#dcefe2] bg-white text-[#2f5d3d] hover:bg-[#f4faf6]'}`}>{kat}</button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#edf2ef] bg-[#f4faf5] text-[11px] font-black uppercase tracking-[0.18em] text-[#3e6049]">
                      <th className="p-3.5">Jenis & No. Dokumen</th>
                      <th className="p-3.5">Referensi (MPP / DPBB)</th>
                      <th className="p-3.5">Lokasi & Pemegang</th>
                      <th className="p-3.5">Bank & Rekening</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef4f0] text-xs">
                    {filteredDokumen.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center font-medium text-slate-400">Belum ada dokumen yang tercatat.</td></tr>
                    ) : (
                      filteredDokumen.map((doc) => (
                        <tr key={doc.id} className="transition hover:bg-[#f5fbf7]">
                          <td className="p-3.5">
                            <span className="mb-1 inline-block rounded-full border border-[#bfe0c7] bg-[#edf9f1] px-2 py-0.5 text-[10px] font-black text-[#0d5c2b]">{doc.jenis_dokumen}</span>
                            <div className="font-black text-slate-900">{doc.nomor_dokumen}</div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-600">
                            <div><span className="text-slate-400">MPP:</span> {doc.mpp || doc.npp || '-'}</div>
                            <div><span className="text-slate-400">DPBB:</span> {doc.dpbb || '-'}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-black text-slate-900">{doc.tujuan_dept || '-'}</div>
                            <span className={`my-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${doc.status_posisi === 'Sudah Kembali ke IT' ? 'border border-[#b1d7ff] bg-[#eef6ff] text-[#1d4ed8]' : 'border border-[#f4d7a3] bg-[#fff7eb] text-[#b45309]'}`}>
                              {doc.status_posisi}
                            </span>
                            <div className="text-slate-500">Pemegang: <span className="font-bold text-slate-700">{doc.pic_penerima || '-'}</span></div>
                          </td>
                          <td className="p-3.5 font-mono">
                            <div className="font-black text-slate-700">{doc.nama_bank}</div>
                            <div className="text-slate-600">{doc.rekening || '-'}</div>
                          </td>
                          <td className="p-3.5 text-center">
                            <button type="button" onClick={() => handleEditClick(doc)} className="mr-3 font-black text-[#0d5c2b] transition hover:text-[#042f0f]">Edit</button>
                            <button type="button" onClick={() => handleDeleteAsk(doc.id)} className="font-bold text-slate-400 transition hover:text-[#b91c1c]">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;