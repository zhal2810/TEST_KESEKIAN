import React, { useState, useEffect } from 'react';
import { ambilMenuCafeAPI, updateStatusMenuAPI, tambahMenuCafeAPI } from '../services/api';

export default function Cafe() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [kategoriAktif, setKategoriAktif] = useState('Makanan');
  const [daftarMenu, setDaftarMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editNama, setEditNama] = useState('');
  const [editHarga, setEditHarga] = useState('');

  // State untuk form Tambah Menu Baru
  const [showFormTambah, setShowFormTambah] = useState(false);
  const [simpanLoading, setSimpanLoading] = useState(false);
  const [formNama, setFormNama] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formHarga, setFormHarga] = useState('');
  const [formKategori, setFormKategori] = useState('Makanan');
  const [formCabang, setFormCabang] = useState('madyopuro');

  useEffect(() => {
    // 1. Cek Sesi (Apakah Admin?)
    const rawSesi = sessionStorage.getItem('ngSesi');
    if (rawSesi) {
      const sesi = JSON.parse(rawSesi);
      if (sesi.role === 'admin' || sesi.role === 'superadmin') {
        setIsAdmin(true);
      }
    }
    // 2. Tarik data menu
    muatDataMenu();
  }, []);

  const muatDataMenu = async () => {
    setLoading(true);
    const data = await ambilMenuCafeAPI();
    setDaftarMenu(data);
    setLoading(false);
  };

  // Fungsi khusus admin untuk mengubah status Tersedia/Habis
  // 1. Fungsi khusus admin untuk mengubah status Tersedia/Habis
  const handleToggleStatus = async (id, statusSekarang) => {
    if (!isAdmin) return; // Pelanggan tidak bisa klik ini
    
    const statusBaru = statusSekarang === 'Tersedia' ? 'Habis' : 'Tersedia';
    
    // Update sementara di layar agar terasa instan (Optimistic UI)
    setDaftarMenu(prev => prev.map(item => item.id === id ? { ...item, status: statusBaru } : item));
    
    // Hit API di background
    await updateStatusMenuAPI(id, statusBaru);
  };

  // Fungsi untuk membuka form Tambah Menu (kategori default ikut tab yang sedang aktif)
  const bukaFormTambah = () => {
    setFormNama('');
    setFormDeskripsi('');
    setFormHarga('');
    setFormKategori(kategoriAktif);
    setFormCabang('madyopuro');
    setShowFormTambah(true);
  };

  // Fungsi untuk menyimpan menu baru ke database
  const handleTambahMenu = async () => {
    if (!formNama.trim() || !formHarga) {
      alert('Nama dan harga wajib diisi.');
      return;
    }

    setSimpanLoading(true);
    const payload = {
      nama: formNama.trim(),
      deskripsi: formDeskripsi.trim(),
      harga: parseInt(formHarga) || 0,
      kategori: formKategori,
      cabang: formCabang,
      status: 'Tersedia'
    };

    const hasil = await tambahMenuCafeAPI(payload);
    setSimpanLoading(false);
   

    if (hasil && hasil.status === 'ok') {
      setDaftarMenu(prev => [...prev, hasil.data]);
      setShowFormTambah(false);
    } else {
      alert(`Gagal menambahkan menu: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
    }
  };

  // 2. Fungsi untuk memunculkan input edit
  const mulaiEdit = (item) => {
    setEditingId(item.id);
    setEditNama(item.nama);
    setEditHarga(item.harga);
  };

  // 3. Fungsi untuk menyimpan perubahan
  const handleSimpanEdit = async (id) => {
    // Ubah langsung di UI agar tidak perlu loading lama (Optimistic Update)
    const menuTerbaru = daftarMenu.map(item => {
      if (item.id === id) {
        return { ...item, nama_menu: editNama, harga: parseInt(editHarga) || 0 };
      }
      return item;
    });
    setDaftarMenu(menuTerbaru);
    setEditingId(null); // Tutup form edit

    
    try {
      
      await fetch(`${API_URL}/cafe/edit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        
        body: JSON.stringify({ nama: editNama, harga: parseInt(editHarga) || 0 })
      });
    } catch (error) {
      console.error("Gagal menyimpan perubahan menu:", error);
    }
  };
  // Filter menu berdasarkan kategori yang sedang diklik (Tab)
  const menuTampil = daftarMenu.filter(item => item.kategori === kategoriAktif);

  return (
    <div className="w-full max-w-md mx-auto p-4 pb-24">
      {/* HEADER */}
      <div className="text-center mb-6 mt-2">
        <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-2xl rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/10">
          <i className="fa-solid fa-mug-hot"></i>
        </div>
        <h2 className="text-xl font-black tracking-wider uppercase text-white">NG CAFE & SNACK</h2>
        <p className="text-xs text-gray-400 mt-1">
          {isAdmin ? "Mode Manajemen Inventori Stok (Tap untuk Ubah)" : "Menu Spesial Peneman Push Rank"}
        </p>
      </div>

      {/* TABS KATEGORI */}
      <div className="flex gap-2 mb-4 bg-gray-900 p-1.5 rounded-2xl border border-gray-800">
        {['Makanan', 'Minuman', 'Lainnya'].map((kat) => (
          <button
            key={kat}
            onClick={() => setKategoriAktif(kat)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              kategoriAktif === kat
                ? 'bg-orange-500 text-gray-950 shadow-md'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {kat}
          </button>
        ))}
      </div>

      {/* TOMBOL TAMBAH MENU — KHUSUS ADMIN */}
      {isAdmin && (
        <button
          onClick={bukaFormTambah}
          className="w-full mb-6 py-3 rounded-2xl border border-dashed border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-widest hover:bg-orange-500/10 hover:border-orange-500/70 transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Tambah Menu Baru
        </button>
      )}

      {/* MODAL FORM TAMBAH MENU */}
      {showFormTambah && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Tambah Menu Baru</h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Nama Menu"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-400"
              />
              <textarea
                value={formDeskripsi}
                onChange={(e) => setFormDeskripsi(e.target.value)}
                placeholder="Deskripsi (opsional)"
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-400 resize-none"
              />
              <input
                type="number"
                value={formHarga}
                onChange={(e) => setFormHarga(e.target.value)}
                placeholder="Harga (Misal: 15000)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-400"
              />

              <div className="flex gap-2">
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-400"
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Lainnya">Lainnya</option>
                </select>

                <select
                  value={formCabang}
                  onChange={(e) => setFormCabang(e.target.value)}
                  className="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-400"
                >
                  <option value="madyopuro">Madyopuro</option>
                  <option value="karangduren">Karangduren</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleTambahMenu}
                disabled={simpanLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-gray-900 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
              >
                {simpanLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => setShowFormTambah(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST MENU */}
      {loading ? (
        <div className="text-center py-10 text-orange-400 font-bold animate-pulse">Memuat Menu...</div>
      ) : menuTampil.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-bold border border-dashed border-gray-800 rounded-3xl">
          Belum ada item di kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {menuTampil.map((item) => (
            <div
              key={item.id}
              className={`bg-gray-800 border p-4 rounded-2xl shadow-lg flex justify-between items-center transition-all ${item.status === 'Habis' ? 'border-red-500/30 opacity-75' : 'border-gray-700'
                }`}
            >
              {/* === MODE EDIT JIKA editingId SAMA DENGAN item.id === */}
              {editingId === item.id ? (
                <div className="flex flex-col w-full gap-2 pr-4">
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full bg-gray-900 border border-orange-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-400"
                    placeholder="Nama Menu"
                  />
                  <input
                    type="number"
                    value={editHarga}
                    onChange={(e) => setEditHarga(e.target.value)}
                    className="w-full bg-gray-900 border border-orange-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-orange-400"
                    placeholder="Harga (Misal: 15000)"
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => handleSimpanEdit(item.id)} className="bg-orange-500 hover:bg-orange-400 text-gray-900 px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
                      SIMPAN
                    </button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
                      BATAL
                    </button>
                  </div>
                </div>
              ) : (
                /* === MODE NORMAL (TAMPILAN BIASA) === */
                <>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wide">{item.nama}</h3>
                      {/* Tombol Pensil Khusus Admin */}
                      {isAdmin && (
                        <button onClick={() => mulaiEdit(item)} className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/20 text-[10px] bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 transition-colors">
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      {/* Badge Cabang Global */}
                      <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase border ${item.cabang === 'madyopuro'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                        📍 {item.cabang}
                      </span>

                      {/* Harga */}
                      <span className="text-xs font-mono font-bold text-gray-300">
                        Rp {item.harga.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge / Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    disabled={!isAdmin} // Kunci jika bukan admin
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all flex-shrink-0 ${item.status === 'Tersedia'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      } ${isAdmin && 'hover:scale-105 active:scale-95 cursor-pointer shadow-md'}`}
                  >
                    {item.status}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}