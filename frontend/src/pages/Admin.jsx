import React, { useState, useEffect } from 'react';
import { ambilDaftarAdminAPI, tambahAdminAPI, updateAdminAPI } from '../services/api';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [daftarAdmin, setDaftarAdmin] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editRole, setEditRole] = useState('admin');
  const [editCabang, setEditCabang] = useState('madyopuro');
  const [editLoading, setEditLoading] = useState(false);

  const [showFormTambah, setShowFormTambah] = useState(false);
  const [simpanLoading, setSimpanLoading] = useState(false);
  const [formUsername, setFormUsername] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formRole, setFormRole] = useState('admin');
  const [formCabang, setFormCabang] = useState('madyopuro');

  useEffect(() => {
    const rawSesi = sessionStorage.getItem('ngSesi');
    if (rawSesi) {
      const sesi = JSON.parse(rawSesi);
      if (sesi.role === 'admin' || sesi.role === 'superadmin') {
        setIsAdmin(true);
      }
    }
    muatDaftarAdmin();
  }, []);

  const muatDaftarAdmin = async () => {
    setLoading(true);
    const data = await ambilDaftarAdminAPI();
    setDaftarAdmin(data);
    setLoading(false);
  };

  const bukaFormTambah = () => {
    setFormUsername('');
    setFormPin('');
    setFormRole('admin');
    setFormCabang('madyopuro');
    setShowFormTambah(true);
  };

  const handleTambahAdmin = async () => {
    if (!formUsername.trim() || !formPin.trim()) {
      alert('Username dan PIN wajib diisi.');
      return;
    }

    setSimpanLoading(true);
    const hasil = await tambahAdminAPI({
      username: formUsername.trim(),
      pin: formPin.trim(),
      role: formRole,
      cabang: formCabang
    });
    setSimpanLoading(false);

    if (hasil && hasil.status === 'ok') {
      setDaftarAdmin(prev => [...prev, hasil.data]);
      setShowFormTambah(false);
    } else {
      alert(`Gagal menambahkan admin: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
    }
  };

  const mulaiEdit = (item) => {
    setEditingId(item.id);
    setEditUsername(item.username);
    setEditPin(''); // Kosong = PIN lama tidak diubah
    setEditRole(item.role);
    setEditCabang(item.cabang);
  };

  const handleSimpanEdit = async (id) => {
    if (!editUsername.trim()) {
      alert('Username wajib diisi.');
      return;
    }

    setEditLoading(true);
    const hasil = await updateAdminAPI(id, {
      username: editUsername.trim(),
      pin: editPin.trim(), // Kalau kosong, backend tidak akan mengubah PIN
      role: editRole,
      cabang: editCabang
    });
    setEditLoading(false);

    if (hasil && hasil.status === 'ok') {
      setDaftarAdmin(prev => prev.map(item =>
        item.id === id ? { ...item, username: editUsername.trim(), role: editRole, cabang: editCabang } : item
      ));
      setEditingId(null);
    } else {
      alert(`Gagal menyimpan perubahan: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-16 text-gray-500 font-bold border border-dashed border-gray-800 rounded-3xl">
        <i className="fa-solid fa-lock text-2xl mb-3 block"></i>
        Halaman ini khusus admin. Silakan login lewat halaman Profile.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 pb-24">
      {/* HEADER */}
      <div className="text-center mb-6 mt-2">
        <div className="w-14 h-14 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-2xl rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-yellow-500/10">
          <i className="fa-solid fa-user-shield"></i>
        </div>
        <h2 className="text-xl font-black tracking-wider uppercase text-white">KELOLA ADMIN</h2>
        <p className="text-xs text-gray-400 mt-1">Tambah, edit username, dan reset PIN admin</p>
      </div>

      {/* TOMBOL TAMBAH ADMIN */}
      <button
        onClick={bukaFormTambah}
        className="w-full mb-6 py-3 rounded-2xl border border-dashed border-yellow-500/40 text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/10 hover:border-yellow-500/70 transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-user-plus"></i> Tambah Admin Baru
      </button>

      {/* MODAL FORM TAMBAH ADMIN */}
      {showFormTambah && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Tambah Admin Baru</h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-400"
              />
              <input
                type="text"
                value={formPin}
                onChange={(e) => setFormPin(e.target.value)}
                maxLength={4}
                placeholder="4-Digit PIN"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-400 tracking-widest text-center"
              />

              <div className="flex gap-2">
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-400"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>

                <select
                  value={formCabang}
                  onChange={(e) => setFormCabang(e.target.value)}
                  className="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-400"
                >
                  <option value="madyopuro">Madyopuro</option>
                  <option value="karangduren">Karangduren</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleTambahAdmin}
                disabled={simpanLoading}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
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

      {/* LIST ADMIN */}
      {loading ? (
        <div className="text-center py-10 text-yellow-400 font-bold animate-pulse">Memuat Daftar Admin...</div>
      ) : daftarAdmin.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-bold border border-dashed border-gray-800 rounded-3xl">
          Belum ada admin terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {daftarAdmin.map((item) => (
            <div
              key={item.id}
              className="bg-gray-800 border border-gray-700 p-4 rounded-2xl shadow-lg flex justify-between items-center"
            >
              {editingId === item.id ? (
                <div className="flex flex-col w-full gap-2">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-gray-900 border border-yellow-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-400"
                    placeholder="Username"
                  />
                  <input
                    type="text"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    maxLength={4}
                    className="w-full bg-gray-900 border border-yellow-500/50 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-yellow-400 tracking-widest text-center"
                    placeholder="PIN baru (kosongkan jika tidak diubah)"
                  />
                  <div className="flex gap-2">
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-1/2 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none focus:border-yellow-400"
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                    <select
                      value={editCabang}
                      onChange={(e) => setEditCabang(e.target.value)}
                      className="w-1/2 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none focus:border-yellow-400"
                    >
                      <option value="madyopuro">Madyopuro</option>
                      <option value="karangduren">Karangduren</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleSimpanEdit(item.id)}
                      disabled={editLoading}
                      className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
                    >
                      {editLoading ? 'Menyimpan...' : 'SIMPAN'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
                    >
                      BATAL
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wide">{item.username}</h3>
                      <button
                        onClick={() => mulaiEdit(item)}
                        className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/20 text-[10px] bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 transition-colors"
                      >
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase border ${item.cabang === 'madyopuro'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                        📍 {item.cabang}
                      </span>
                      <span className="text-[9px] font-black tracking-wider bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded uppercase border border-yellow-500/20">
                        👑 {item.role}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}