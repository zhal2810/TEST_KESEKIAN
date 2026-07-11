import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { ambilSemuaReservasiAPI, updateNoMejaAPI, updateStatusReservasiAPI, kirimReservasiAPI, ambilUnitReservasiAPI, tambahUnitReservasiAPI, editUnitReservasiAPI, hapusUnitReservasiAPI } from '../services/api';
=======
import { ambilSemuaReservasiAPI, updateNoMejaAPI, updateStatusReservasiAPI, kirimReservasiAPI } from '../services/api';
>>>>>>> 687f302f1d1bf7f93e4103e527bcebc6f816b7f8

export default function Reservasi({ setCurrentPage }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [cabangAdmin, setCabangAdmin] = useState('');
    const [daftarReservasi, setDaftarReservasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prosesId, setProsesId] = useState(null); // id yang lagi diproses terima/batalkan

    // --- STATE FORMULIR ASLI MILIKMU (VIEW PUBLIK) ---
    const [lokasiRental, setLokasiRental] = useState('madyopuro');
    const [jenisLayanan, setJenisLayanan] = useState('Di Tempat');
    const [namaPemesan, setNamaPemesan] = useState('');
    const [whatsApp, setWhatsApp] = useState('');
    const [pilihTV, setPilihTV] = useState('');
    const [jamDatang, setJamDatang] = useState('');

    // State untuk admin menginput nomor meja per ID booking
    const [inputMeja, setInputMeja] = useState({});

    // --- Daftar unit/TV dinamis (bukan hardcode lagi) ---
    const [daftarUnit, setDaftarUnit] = useState([]);
    const [loadingUnit, setLoadingUnit] = useState(false);

    // --- Panel kelola unit/TV khusus admin ---
    const [showKelolaUnit, setShowKelolaUnit] = useState(false);
    const [cabangKelola, setCabangKelola] = useState('madyopuro');
    const [jenisKelola, setJenisKelola] = useState('Di Tempat');
    const [daftarUnitKelola, setDaftarUnitKelola] = useState([]);
    const [showFormUnit, setShowFormUnit] = useState(false);
    const [editingUnitId, setEditingUnitId] = useState(null);
    const [unitForm, setUnitForm] = useState({ nama_unit: '', urutan: '' });
    const [unitLoading, setUnitLoading] = useState(false);

    useEffect(() => {
        // Cek apakah ada admin yang sedang login
        const rawSesi = sessionStorage.getItem('ngSesi');
        if (rawSesi) {
            const sesi = JSON.parse(rawSesi);
            if (sesi.role === 'admin' || sesi.role === 'superadmin') {
                setIsAdmin(true);
                setCabangAdmin(sesi.cabang);
                muatAntreanReservasi();
                return;
            }
        }
        setLoading(false);
    }, []);

    // Ambil daftar unit/TV dinamis tiap kali lokasi rental atau jenis layanan berubah (form publik)
    useEffect(() => {
        if (isAdmin) return; // panel admin punya mekanisme muat sendiri
        const muatUnit = async () => {
            setLoadingUnit(true);
            setPilihTV('');
            const data = await ambilUnitReservasiAPI(lokasiRental, jenisLayanan);
            setDaftarUnit(data);
            setLoadingUnit(false);
        };
        muatUnit();
    }, [lokasiRental, jenisLayanan, isAdmin]);

    // Muat daftar unit untuk panel kelola admin, tiap kali cabang/jenis kelola berubah atau panel dibuka
    useEffect(() => {
        if (!showKelolaUnit) return;
        const muat = async () => {
            const data = await ambilUnitReservasiAPI(cabangKelola, jenisKelola);
            setDaftarUnitKelola(data);
        };
        muat();
    }, [showKelolaUnit, cabangKelola, jenisKelola]);

    const handleSimpanUnit = async () => {
        if (!unitForm.nama_unit.trim()) {
            alert('Nama unit/TV wajib diisi.');
            return;
        }

        setUnitLoading(true);
        const payload = {
            cabang: cabangKelola,
            jenis_layanan: jenisKelola,
            nama_unit: unitForm.nama_unit.trim(),
            urutan: unitForm.urutan !== '' ? parseInt(unitForm.urutan) : undefined
        };

        const hasil = editingUnitId
            ? await editUnitReservasiAPI(editingUnitId, payload)
            : await tambahUnitReservasiAPI(payload);
        setUnitLoading(false);

        if (hasil && hasil.status === 'ok') {
            const dataTerbaru = await ambilUnitReservasiAPI(cabangKelola, jenisKelola);
            setDaftarUnitKelola(dataTerbaru);
            setUnitForm({ nama_unit: '', urutan: '' });
            setEditingUnitId(null);
            setShowFormUnit(false);
        } else {
            alert(`Gagal menyimpan unit: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
        }
    };

    const handleBukaEditUnit = (unit) => {
        setEditingUnitId(unit.id);
        setUnitForm({
            nama_unit: unit.nama_unit,
            urutan: unit.urutan !== null && unit.urutan !== undefined ? String(unit.urutan) : ''
        });
        setShowFormUnit(true);
    };

    const handleHapusUnit = async (unit) => {
        if (!window.confirm(`Hapus unit "${unit.nama_unit}"?`)) return;
        const hasil = await hapusUnitReservasiAPI(unit.id);
        if (hasil && hasil.status === 'ok') {
            setDaftarUnitKelola(prev => prev.filter(u => u.id !== unit.id));
        } else {
            alert(`Gagal menghapus unit: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
        }
    };

    const muatAntreanReservasi = async () => {
        setLoading(true);
        const data = await ambilSemuaReservasiAPI();
        setDaftarReservasi(data);
        setLoading(false);
    };

    // Aksi Terima / Batalkan reservasi
    const handleUbahStatus = async (id, statusBaru) => {
        setProsesId(id);
        const res = await updateStatusReservasiAPI(id, statusBaru);
        if (res.status === 'ok') {
            setDaftarReservasi(prev => prev.map(r => r.id === id ? { ...r, status: statusBaru } : r));
        } else {
            alert('Gagal memperbarui status reservasi.');
        }
        setProsesId(null);
    };

    // Aksi Klik Tombol PLOT oleh Admin
    const handleSimpanMeja = async (id) => {
        const nomorMejaBaru = inputMeja[id] || '';
        const res = await updateNoMejaAPI(id, nomorMejaBaru);
        if (res.status === 'ok') {
            alert(`Meja/TV berhasil di-set ke: ${nomorMejaBaru}`);
            muatAntreanReservasi();
        } else {
            alert('Gagal memperbarui nomor meja.');
        }
    };
    // Aksi Kirim Data oleh Pelanggan
    const handleKirimFormPelanggan = async (e) => {
        e.preventDefault();
        const payload = {
            nama: namaPemesan,
            no_hp: whatsApp,
            cabang: lokasiRental,
            jenis: jenisLayanan,
            keterangan: `Pilihan TV: ${pilihTV}`,
            tanggal: jamDatang
        };

        const res = await kirimReservasiAPI(lokasiRental, payload);
        if (res.status === 'ok') {
            alert('Data Reservasi Berhasil Dikirim!');
            // Reset Form
            setNamaPemesan('');
            setWhatsApp('');
            setPilihTV('');
            setJamDatang('');
        } else {
            alert(`Gagal mengirim reservasi: ${res?.message || 'Terjadi kesalahan pada server.'}`);
        }
    };

    // =========================================================
    // VIEW 1: TAMPILAN DASHBOARD ADMIN (JIKA LOGIN ADMIN)
    // =========================================================
    if (isAdmin) {
        return (
            <div className="w-full bg-gray-900 text-white p-2 md:p-4">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
                    <div>
                        <h2 className="text-xl font-black text-cyan-400 tracking-wide">RESERVASI MASUK</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Memonitor Cabang: <span className="text-yellow-500 font-bold uppercase">{cabangAdmin}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setCabangKelola(cabangAdmin || 'madyopuro'); setShowKelolaUnit(true); }}
                            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold transition-all"
                        >
                            <i className="fa-solid fa-tv mr-1"></i> KELOLA UNIT/TV
                        </button>
                        <button onClick={muatAntreanReservasi} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-bold transition-all">
                            <i className="fa-solid fa-rotate mr-1"></i> REFRESH
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-cyan-400 font-bold animate-pulse">MEMUAT DATA...</div>
                ) : daftarReservasi.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 font-bold border border-dashed border-gray-800 rounded-3xl">Belum ada data bookingan.</div>
                ) : (
                    <div className="space-y-3">
                        {daftarReservasi.map((resv) => (
                            <div key={resv.id} className={`bg-gray-800 border p-4 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between gap-4 ${resv.status === 'pending' ? 'border-blue-500/50' : resv.status === 'diterima' ? 'border-emerald-700/50' : 'border-gray-700'}`}>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-base font-black uppercase text-white">{resv.nama}</span>
                                        <span className="text-[9px] font-black tracking-wider bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded uppercase border border-cyan-500/20">📍 {resv.cabang}</span>
                                        <span className="text-[9px] font-black tracking-wider bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded uppercase">{resv.jenis_layanan}</span>
                                        {resv.status === 'pending' && (
                                            <span className="text-[9px] font-black tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded uppercase animate-pulse">🔵 BARU</span>
                                        )}
                                        {resv.status === 'diterima' && (
                                            <span className="text-[9px] font-black tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">✅ DITERIMA</span>
                                        )}
                                        {resv.status === 'dibatalkan' && (
                                            <span className="text-[9px] font-black tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded uppercase">❌ DIBATALKAN</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">📱 WA: <span className="font-mono text-gray-300">{resv.no_hp}</span></p>
                                    <p className="text-xs text-gray-400">🕒 Rencana Datang: <span className="text-emerald-400 font-mono">{(() => {
                                        const d = new Date(resv.tanggal_booking);
                                        return isNaN(d.getTime()) ? '-' : `${d.toLocaleString('id-ID')} WIB`;
                                    })()}</span></p>
                                    {resv.keterangan && <p className="text-xs bg-gray-950/40 p-2 rounded-lg text-gray-400 mt-1 italic">{resv.keterangan}</p>}
                                </div>

                                {(!resv.status || resv.status === 'pending') ? (
                                    /* Tombol Terima/Batalkan untuk reservasi baru */
                                    <div className="flex flex-col justify-end items-end gap-1.5 border-t md:border-t-0 pt-3 md:pt-0 border-gray-700">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Aksi</label>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={prosesId === resv.id}
                                                onClick={() => handleUbahStatus(resv.id, 'dibatalkan')}
                                                className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 font-black text-xs px-4 py-1.5 rounded-xl transition-all disabled:opacity-50"
                                            >
                                                BATALKAN
                                            </button>
                                            <button
                                                disabled={prosesId === resv.id}
                                                onClick={() => handleUbahStatus(resv.id, 'diterima')}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs px-4 py-1.5 rounded-xl transition-all shadow-md disabled:opacity-50"
                                            >
                                                {prosesId === resv.id ? '...' : 'TERIMA'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Input Nomor Meja / TV — hanya muncul setelah diterima */
                                    resv.status === 'diterima' && (
                                        <div className="flex flex-col justify-end items-end gap-1.5 border-t md:border-t-0 pt-3 md:pt-0 border-gray-700">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Plotting Meja / TV</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={resv.no_meja || "Set No. Meja"}
                                                    value={inputMeja[resv.id] || ''}
                                                    onChange={(e) => setInputMeja({ ...inputMeja, [resv.id]: e.target.value })}
                                                    className="w-28 bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-center font-bold text-white uppercase focus:outline-none focus:border-cyan-500"
                                                />
                                                <button
                                                    onClick={() => handleSimpanMeja(resv.id)}
                                                    className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs px-4 py-1.5 rounded-xl transition-all shadow-md"
                                                >
                                                    PLOT
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {showKelolaUnit && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">Kelola Unit/TV</h3>
                                <button
                                    onClick={() => {
                                        setEditingUnitId(null);
                                        setUnitForm({ nama_unit: '', urutan: '' });
                                        setShowFormUnit(true);
                                    }}
                                    className="text-[10px] font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <i className="fa-solid fa-plus"></i> Tambah
                                </button>
                            </div>

                            {/* Filter cabang & jenis layanan */}
                            <div className="flex gap-2 mb-3">
                                <select
                                    value={cabangKelola}
                                    onChange={(e) => setCabangKelola(e.target.value)}
                                    className="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none focus:border-cyan-400"
                                >
                                    <option value="madyopuro">Madyopuro</option>
                                    <option value="karangduren">Karangduren</option>
                                </select>
                                <select
                                    value={jenisKelola}
                                    onChange={(e) => setJenisKelola(e.target.value)}
                                    className="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none focus:border-cyan-400"
                                >
                                    <option value="Di Tempat">Di Tempat</option>
                                    <option value="Harian">Harian (Bawa Pulang)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                                {daftarUnitKelola.length === 0 && (
                                    <p className="text-xs text-gray-500 text-center py-6">Belum ada unit untuk kombinasi ini. Klik "Tambah" untuk membuat.</p>
                                )}
                                {daftarUnitKelola.map((u) => (
                                    <div key={u.id} className="flex justify-between items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5">
                                        <div>
                                            <p className="text-xs font-bold text-white">{u.nama_unit}</p>
                                            {u.urutan !== null && u.urutan !== undefined && (
                                                <p className="text-[10px] font-bold text-gray-500">urutan {u.urutan}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleBukaEditUnit(u)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors"
                                                title="Edit unit"
                                            >
                                                <i className="fa-solid fa-pen text-xs"></i>
                                            </button>
                                            <button
                                                onClick={() => handleHapusUnit(u)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                                title="Hapus unit"
                                            >
                                                <i className="fa-solid fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowKelolaUnit(false)}
                                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}

                {showFormUnit && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">
                                {editingUnitId ? 'Edit Unit/TV' : 'Tambah Unit/TV'}
                            </h3>
                            <p className="text-[10px] text-gray-500 mb-4 uppercase font-bold">
                                {cabangKelola} · {jenisKelola}
                            </p>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Nama Unit</label>
                                    <input
                                        type="text"
                                        value={unitForm.nama_unit}
                                        onChange={(e) => setUnitForm(f => ({ ...f, nama_unit: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                                        placeholder="Contoh: TV 01 (PS4)"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Urutan (opsional)</label>
                                    <input
                                        type="number"
                                        value={unitForm.urutan}
                                        onChange={(e) => setUnitForm(f => ({ ...f, urutan: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-5">
                                <button
                                    onClick={handleSimpanUnit}
                                    disabled={unitLoading}
                                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-900 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
                                >
                                    {unitLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                <button
                                    onClick={() => { if (!unitLoading) { setShowFormUnit(false); setEditingUnitId(null); } }}
                                    disabled={unitLoading}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================
    // VIEW 2: TAMPILAN FORMULIR ASLI PUBLIK (JIKA LOGOUT / MEMBER)
    // =========================================================
    return (
        <div className="max-w-md w-full mx-auto p-2">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-5 shadow-xl relative">

                {/* Header Form */}
                <div className="flex justify-between items-center mb-5 border-b border-gray-700 pb-3">
                    <div>
                        <h2 className="text-base font-black tracking-wider uppercase text-white">Formulir NG Rental</h2>
                        <p className="text-[10px] text-gray-400">Silakan isi data booking bermain</p>
                    </div>
                    <button
                        onClick={() => setCurrentPage('home')}
                        className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black rounded-lg uppercase tracking-wide hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                        ❌ CLOSE
                    </button>
                </div>

                <form onSubmit={handleKirimFormPelanggan} className="space-y-4">

                    {/* LOKASI RENTAL */}
                    <div>
                        <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1.5">LOKASI RENTAL</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['madyopuro', 'karangduren'].map((c) => (
                                <button
                                    key={c} type="button"
                                    onClick={() => setLokasiRental(c)}
                                    className={`py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all border ${lokasiRental === c ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-md' : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-white'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* JENIS LAYANAN */}
                    <div>
                        <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1.5">JENIS LAYANAN</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'Di Tempat', label: '🎮 Di Tempat' },
                                { id: 'Harian', label: '🏠 Harian' }
                            ].map((l) => (
                                <button
                                    key={l.id} type="button"
                                    onClick={() => setJenisLayanan(l.id)}
                                    className={`py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all border ${jenisLayanan === l.id ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-md' : 'bg-gray-900 text-gray-500 border-gray-800 hover:text-white'
                                        }`}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* NAMA PEMESAN */}
                    <div>
                        <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1">Nama Pemesan</label>
                        <input
                            type="text" required
                            value={namaPemesan}
                            onChange={(e) => setNamaPemesan(e.target.value)}
                            placeholder="NAMA LENGKAP"
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 uppercase font-bold"
                        />
                    </div>

                    {/* WHATSAPP ACTIVE */}
                    <div>
                        <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1">WhatsApp Active</label>
                        <input
                            type="text" required
                            value={whatsApp}
                            onChange={(e) => setWhatsApp(e.target.value)}
                            placeholder="08XXXXXXXXXX"
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                    </div>

                    {/* PILIH NOMOR TV */}
                    <div>
                        <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1">Pilih Nomor TV</label>
                        <select
                            value={pilihTV} required
                            onChange={(e) => setPilihTV(e.target.value)}
                            disabled={loadingUnit}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-bold disabled:opacity-50"
                        >
                            <option value="">{loadingUnit ? 'Memuat daftar unit...' : '-- PILIH --'}</option>
                            {daftarUnit.map((u) => (
                                <option key={u.id} value={u.nama_unit}>{u.nama_unit}</option>
                            ))}
                        </select>
                        {!loadingUnit && daftarUnit.length === 0 && (
                            <p className="text-[10px] text-red-400 mt-1">Belum ada unit tersedia untuk cabang & jenis layanan ini.</p>
                        )}
                    </div>

                    {/* JAM RENCANA DATANG */}
                    <div>
                        <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1">Jam Rencana Datang</label>
                        <input
                            type="datetime-local" required
                            value={jamDatang}
                            onChange={(e) => setJamDatang(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                        />
                    </div>

                    {/* BUTTON SUBMIT */}
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-black tracking-wider uppercase py-3 rounded-xl text-xs transition-all mt-2 shadow-lg"
                    >
                        KIRIM DATA RESERVASI
                    </button>

                </form>
            </div>
        </div>
    );
}
