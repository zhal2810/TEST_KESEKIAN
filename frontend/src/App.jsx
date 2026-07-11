import React, { useState, useEffect, useRef } from 'react';
import Home from './pages/Home';
import Member from './pages/Member';
import Profile from './pages/Profile';
import Cafe from './pages/Cafe';
import Reservasi from './pages/Reservasi';
import Admin from './pages/Admin.jsx';
import logo from './assets/logo.png';
import { ambilJumlahReservasiPendingAPI, ambilUnitReservasiAPI } from './services/api';

const INTERVAL_BADGE_MS = 15000; // cek notifikasi reservasi baru tiap 15 detik
const SUARA_RESERVASI_BARU = '/sounds/notif-reservasi.wav';

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [isReservasiOpen, setIsReservasiOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [jumlahReservasiPending, setJumlahReservasiPending] = useState(0);
    const [isAdminAktif, setIsAdminAktif] = useState(false);
    const [suaraAktif, setSuaraAktif] = useState(() => localStorage.getItem('ngSuaraAktif') === '1');
    const suaraAktifRef = useRef(localStorage.getItem('ngSuaraAktif') === '1'); // dipakai di dalam polling supaya nilainya selalu up-to-date, hindari stale closure

    const audioRef = useRef(null);
    const jumlahSebelumnyaRef = useRef(0);
    const isFirstCekRef = useRef(true);

    // --- STATE FORM RESERVASI MENGAMBANG (BUNGLON) ---
    const [cabangReservasi, setCabangReservasi] = useState('madyopuro');
    const [jenisLayanan, setJenisLayanan] = useState('ditempat'); // 'ditempat' atau 'harian'
    const [nama, setNama] = useState('');
    const [noWa, setNoWa] = useState('');
    const [tvSlot, setTvSlot] = useState('');
    const [jamDatang, setJamDatang] = useState('');
    const [paketHarian, setPaketHarian] = useState('');
    const [alamatRumah, setAlamatRumah] = useState('');
    const [jaminanFisik, setJaminanFisik] = useState('');
    const [loadingReservasi, setLoadingReservasi] = useState(false);
    const [errorReservasi, setErrorReservasi] = useState('');

    // --- Daftar Paket (jenis 'Harian') & Jaminan (jenis 'Jaminan') dinamis, dikelola admin via 'Kelola Unit/TV' ---
    const [daftarPaketHarian, setDaftarPaketHarian] = useState([]);
    const [daftarJaminan, setDaftarJaminan] = useState([]);
    const [loadingPaketJaminan, setLoadingPaketJaminan] = useState(false);

    // Ambil daftar Paket & Jaminan tiap kali cabang berubah atau modal reservasi dibuka dengan jenis Harian
    useEffect(() => {
        if (!isReservasiOpen || jenisLayanan !== 'harian') return;
        const muat = async () => {
            setLoadingPaketJaminan(true);
            const [paket, jaminan] = await Promise.all([
                ambilUnitReservasiAPI(cabangReservasi, 'Harian'),
                ambilUnitReservasiAPI(cabangReservasi, 'Jaminan')
            ]);
            setDaftarPaketHarian(paket);
            setDaftarJaminan(jaminan);
            setLoadingPaketJaminan(false);
        };
        muat();
    }, [isReservasiOpen, jenisLayanan, cabangReservasi]);

    // Polling ringan buat badge + suara notifikasi reservasi baru (khusus admin)
    useEffect(() => {
        const rawSesi = sessionStorage.getItem('ngSesi');
        if (!rawSesi) return;
        const sesi = JSON.parse(rawSesi);
        if (sesi.role !== 'admin' && sesi.role !== 'superadmin') return;
        setIsAdminAktif(true);

        const cekJumlahPending = async () => {
            const jumlah = await ambilJumlahReservasiPendingAPI(sesi.cabang);

            if (!isFirstCekRef.current && jumlah > jumlahSebelumnyaRef.current) {
                putarSuaraNotifikasi();
            }
            jumlahSebelumnyaRef.current = jumlah;
            isFirstCekRef.current = false;

            setJumlahReservasiPending(jumlah);
        };

        cekJumlahPending();
        const interval = setInterval(cekJumlahPending, INTERVAL_BADGE_MS);
        return () => clearInterval(interval);
    }, []);

    const putarSuaraNotifikasi = () => {
        if (audioRef.current && suaraAktifRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => console.warn('Gagal memutar suara notifikasi:', err));
        }
    };

    // Browser blokir autoplay sebelum ada interaksi user
    const aktifkanSuara = () => {
        if (audioRef.current) {
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setSuaraAktif(true);
                suaraAktifRef.current = true;
                localStorage.setItem('ngSuaraAktif', '1'); // ingat status ini biar tidak perlu klik ulang tiap reload
            }).catch(err => console.warn('Gagal mengaktifkan suara:', err));
        }
    };

    // Kalau sebelumnya sudah pernah diaktifkan (tersimpan di localStorage),
    // coba unlock otomatis begitu admin melakukan interaksi apa pun pertama kali
    // setelah reload (klik/tap di mana saja), tanpa perlu klik tombol lagi.
    useEffect(() => {
        if (!isAdminAktif || suaraAktif) return;
        if (localStorage.getItem('ngSuaraAktif') !== '1') return;

        const cobaUnlockOtomatis = () => {
            aktifkanSuara();
            window.removeEventListener('click', cobaUnlockOtomatis);
            window.removeEventListener('touchstart', cobaUnlockOtomatis);
        };
        window.addEventListener('click', cobaUnlockOtomatis, { once: true });
        window.addEventListener('touchstart', cobaUnlockOtomatis, { once: true });
        return () => {
            window.removeEventListener('click', cobaUnlockOtomatis);
            window.removeEventListener('touchstart', cobaUnlockOtomatis);
        };
    }, [isAdminAktif, suaraAktif]);

    const handleGantiLayanan = (layanan) => {
        setJenisLayanan(layanan);
        setErrorReservasi('');
        setTvSlot('');
        setJamDatang('');
        setPaketHarian('');
        setAlamatRumah('');
        setJaminanFisik('');
    };

    const handleSubmitReservasi = async (e) => {
        e.preventDefault();
        setErrorReservasi('');

        if (!nama.trim()) { setErrorReservasi('⚠️ Nama pemesan wajib diisi.'); return; }
        if (!noWa.trim()) { setErrorReservasi('⚠️ Nomor WhatsApp wajib diisi.'); return; }

        const payload = {
            nama: nama.trim().toUpperCase(),
            jenis: jenisLayanan,
            tanggal: new Date().toISOString().split('T')[0]
        };

        if (jenisLayanan === 'ditempat') {
            if (!tvSlot) { setErrorReservasi('⚠️ Nomor TV wajib dipilih.'); return; }
            if (!jamDatang) { setErrorReservasi('⚠️ Jam kedatangan wajib diisi.'); return; }
            payload.no_hp = noWa.trim();
            payload.keterangan = `TV: ${tvSlot} | Rencana Jam: ${jamDatang}`;
        } else {
            if (!paketHarian) { setErrorReservasi('⚠️ Paket PS wajib dipilih.'); return; }
            if (!alamatRumah.trim()) { setErrorReservasi('⚠️ Alamat domisili wajib diisi.'); return; }
            payload.no_hp = noWa.trim();
            payload.keterangan = `Paket: ${paketHarian} | Alamat: ${alamatRumah.trim()} | Jaminan: ${jaminanFisik || '-'}`;
        }

        setLoadingReservasi(true);

        try {
            const res = await kirimReservasiAPI(cabangReservasi, payload);
            if (res?.status === 'ok' || res?.id) {
                alert(`✅ RESERVASI BERHASIL!\n\nNama: ${payload.nama}\n\nData sudah dikirim ke meja kasir.`);
                setNama('');
                setNoWa('');
                handleGantiLayanan('ditempat');
                setIsReservasiOpen(false); // Tutup modal otomatis setelah sukses
            } else {
                setErrorReservasi('⚠️ Tanggapan server gagal.');
            }
        } catch (err) {
            console.error(err);
            setErrorReservasi('❌ Kesalahan jaringan.');
        } finally {
            setLoadingReservasi(false);
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <Home />;
            case 'member': return <Member />;
            case 'reservasi': return <Reservasi setCurrentPage={setCurrentPage} />;
            case 'cafe': return <Cafe />;
            case 'profile': return <Profile />;
            case 'admin': return <Admin />;
            default: return <Home />;
        }
    };

    const navItems = [
        { id: 'home', label: 'HOME', icon: 'fa-house' },
        { id: 'member', label: 'SEARCH', icon: 'fa-user-gear' },
        { id: 'cafe', label: 'CAFE', icon: 'fa-mug-hot' }
    ];

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col p-4 md:p-6 font-sans">

            {/* HEADER BARIS TERATAS */}
            <header className="relative flex justify-between items-center mb-4 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-md min-h-[76px]">

                
                <div className="w-11 h-11 z-10" />
                <button
                    type="button"
                    onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }}
                    aria-label="Kembali ke Home"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 z-10 cursor-pointer active:scale-95 transition-transform"
                >
                    <img
                        src={logo}
                        alt="NG Gaming Logo"
                        className="w-10 h-10 rounded-full object-cover shadow-md border border-cyan-500/50"
                    />
                    <div className="text-left">
                        <h1 className="text-xl font-black tracking-wider text-white leading-none uppercase">NG GAMING PLAYSTATION</h1>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mt-0.5">JL.RAYA MADYOPURO & JL.RAYA KARANGDUREN</span>
                    </div>
                </button>

               
                <div className="flex items-center gap-3 z-10">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-11 h-11 bg-gray-950 border border-gray-700 hover:border-cyan-500/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all shadow-md flex-shrink-0"
                        title={isMenuOpen ? "Sembunyikan Menu" : "Tampilkan Menu"}
                    >
                        <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-base transition-transform duration-200`}></i>
                    </button>
                </div>
            </header>


            {isMenuOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">

                    {isAdminAktif && !suaraAktif && (
                        <button
                            onClick={aktifkanSuara}
                            title="Aktifkan nada dering notifikasi reservasi"
                            className="col-span-2 sm:col-span-5 -mt-1 mb-1 bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 text-[11px] font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                        >
                            <i className="fa-solid fa-volume-high"></i> Aktifkan Nada Dering
                        </button>
                    )}

                    {/* 1. HOME */}
                    <button
                        onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }}
                        className={`py-3 rounded-xl font-black text-xs tracking-wider uppercase flex flex-col items-center justify-center gap-1 transition-all border ${currentPage === 'home'
                            ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-700/50 hover:text-white'
                            }`}
                    >
                        <i className="fa-solid fa-house text-sm"></i>
                        <span>HOME</span>
                    </button>

                    {/* 2. SEARCH (Member) */}
                    <button
                        onClick={() => { setCurrentPage('member'); setIsMenuOpen(false); }}
                        className={`py-3 rounded-xl font-black text-xs tracking-wider uppercase flex flex-col items-center justify-center gap-1 transition-all border ${currentPage === 'member'
                            ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-700/50 hover:text-white'
                            }`}
                    >
                        <i className="fa-solid fa-magnifying-glass text-sm"></i>
                        <span>SEARCH</span>
                    </button>

                    {/* 3. RESERVASI (Memicu Modal) */}

                    <button
                        onClick={() => { setCurrentPage('reservasi'); setIsMenuOpen(false); setJumlahReservasiPending(0); }}
                        className={`relative py-3 rounded-xl font-black text-xs tracking-wider uppercase flex flex-col items-center justify-center gap-1 transition-all border ${currentPage === 'reservasi'
                            ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-700/50 hover:text-white'
                            }`}
                    >
                        {jumlahReservasiPending > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-blue-500 text-white text-[10px] font-black rounded-full border-2 border-gray-950 animate-pulse">
                                {jumlahReservasiPending > 9 ? '9+' : jumlahReservasiPending}
                            </span>
                        )}
                        <i className="fa-regular fa-calendar-check text-sm"></i>
                        <span>RESERVASI</span>
                    </button>

                    <audio ref={audioRef} src={SUARA_RESERVASI_BARU} preload="auto" />

                    {/* 4. CAFE */}
                    <button
                        onClick={() => { setCurrentPage('cafe'); setIsMenuOpen(false); }}
                        className={`py-3 rounded-xl font-black text-xs tracking-wider uppercase flex flex-col items-center justify-center gap-1 transition-all border ${currentPage === 'cafe'
                            ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-700/50 hover:text-white'
                            }`}
                    >
                        <i className="fa-solid fa-mug-hot text-sm"></i>
                        <span>CAFE</span>
                    </button>

                    {/* 5. PROFILE */}
                    <button
                        onClick={() => { setCurrentPage('profile'); setIsMenuOpen(false); }}
                        className={`py-3 rounded-xl font-black text-xs tracking-wider uppercase flex flex-col items-center justify-center gap-1 transition-all border ${currentPage === 'profile'
                            ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-700/50 hover:text-white'
                            }`}
                    >
                        <i className="fa-solid fa-user text-sm"></i>
                        <span>PROFILE</span>
                    </button>

                    {/* 6. ADMIN (Kelola Admin) */}
                    <button
                        onClick={() => { setCurrentPage('admin'); setIsMenuOpen(false); }}
                        className={`py-3 rounded-xl font-black text-xs tracking-wider uppercase flex flex-col items-center justify-center gap-1 transition-all border ${currentPage === 'admin'
                            ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-700/50 hover:text-white'
                            }`}
                    >
                        <i className="fa-solid fa-user-shield text-sm"></i>
                        <span>ADMIN</span>
                    </button>

                </div>
            )}


            <main className="flex flex-col gap-4 h-full min-h-[520px] flex-grow">
                {renderPage()}
            </main>

            {/* FOOTER & SOSMED */}
            <footer className="mt-8 mb-8 flex flex-col items-center justify-center gap-4">

                {/* Sosial Media Icons */}
                <div className="flex gap-6 text-gray-500">
                    <a href="https://instagram.com/ng_gaming.playstation" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors">
                        <i className="fa-brands fa-instagram text-xl"></i>
                    </a>
                    <a href="https://tiktok.com/@ng.gaming1" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                        <i className="fa-brands fa-tiktok text-xl"></i>
                    </a>
                    <a href="https://wa.me/6283848954367" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">
                        <i className="fa-brands fa-whatsapp text-xl"></i>
                    </a>
                    {/* Ikon YouTube yang diminta 
                    <a href="https://youtube.com/@nggaming" target="_blank" rel="noreferrer" className="hover:text-red-500 transition-colors">
                        <i className="fa-brands fa-youtube text-xl"></i>
                    </a> */}

                    <a href="https://facebook.com/" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">
                        <i className="fa-brands fa-facebook text-xl"></i>
                    </a>

                </div>

                {/* Branding & Version */}
                <div className="flex items-center gap-3 text-[10px] text-gray-600 tracking-widest font-black uppercase">
                    <span>NG-GAMING &copy; 2026 v.0.22.0</span>
                </div>
            </footer>

            {/* ================= FLOATING RESERVASI POP-UP INTERAKTIF (KUNCI PERBAIKAN 2) ================= */}
            {isReservasiOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 p-5 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-150">

                        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-gamepad text-cyan-400 text-sm"></i>
                                <h3 className="text-sm font-black uppercase tracking-wide text-white">Formulir NG Rental</h3>
                            </div>
                            {/* Tombol Close Berfungsi Mengubah State Menjadi False */}
                            <button onClick={() => setIsReservasiOpen(false)} className="text-gray-400 hover:text-red-400 text-xs font-bold font-mono">❌ CLOSE</button>
                        </div>

                        <form onSubmit={handleSubmitReservasi} className="space-y-3.5 text-left">
                            {/* PILIH CABANG */}
                            <div>
                                <label className="text-[9px] font-black tracking-wider text-gray-400 uppercase block mb-1">LOKASI RENTAL</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {['madyopuro', 'karangduren'].map((c) => (
                                        <button key={c} type="button" onClick={() => setCabangReservasi(c)} className={`py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${cabangReservasi === c ? 'bg-cyan-500 text-gray-950 shadow-md font-bold' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>{c}</button>
                                    ))}
                                </div>
                            </div>

                            {/* JENIS LAYANAN */}
                            <div>
                                <label className="text-[9px] font-black tracking-wider text-gray-400 uppercase block mb-1">JENIS LAYANAN</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button type="button" onClick={() => handleGantiLayanan('ditempat')} className={`py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${jenisLayanan === 'ditempat' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>🎮 Di Tempat</button>
                                    <button type="button" onClick={() => handleGantiLayanan('harian')} className={`py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${jenisLayanan === 'harian' ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-900 text-gray-500 border border-gray-800'}`}>🏠 Harian</button>
                                </div>
                            </div>

                            {/* IDENTITAS */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] font-black tracking-wider text-gray-400 block mb-0.5">Nama Pemesan</label>
                                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="NAMA" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white font-bold uppercase focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black tracking-wider text-gray-400 block mb-0.5">WhatsApp Active</label>
                                    <input type="tel" value={noWa} onChange={(e) => setNoWa(e.target.value)} placeholder="08XX" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500" />
                                </div>
                            </div>

                            {/* FORM MAIN DI TEMPAT */}
                            {jenisLayanan === 'ditempat' && (
                                <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-xl grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[9px] font-black text-cyan-400 block mb-0.5">Pilih Nomor TV</label>
                                        <select value={tvSlot} onChange={(e) => setTvSlot(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-xs text-white font-bold focus:outline-none">
                                            <option value="">-- PILIH --</option>
                                            <option value="TV 01 (PS4)">TV 01 (PS4)</option>
                                            <option value="TV 02 (PS4)">TV 02 (PS4)</option>
                                            <option value="TV 03 (PS4 PRO)">TV 03 (PS4 PRO)</option>
                                            <option value="TV 04 (PS5)">TV 04 (PS5)</option>
                                            <option value="TV 05 (PS3)">TV 05 (PS3)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-cyan-400 block mb-0.5">Jam Rencana Datang</label>
                                        <input type="text" value={jamDatang} onChange={(e) => setJamDatang(e.target.value)} placeholder="Misal: 19:30" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white font-bold uppercase focus:outline-none" />
                                    </div>
                                </div>
                            )}

                            {/* FORM SEWA HARIAN */}
                            {jenisLayanan === 'harian' && (
                                <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-xl space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[9px] font-black text-emerald-400 block mb-0.5">Paket Unit PS</label>
                                            <select value={paketHarian} onChange={(e) => setPaketHarian(e.target.value)} disabled={loadingPaketJaminan} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-xs text-white font-bold focus:outline-none disabled:opacity-50">
                                                <option value="">{loadingPaketJaminan ? 'Memuat...' : '-- PILIH --'}</option>
                                                {daftarPaketHarian.map((u) => (
                                                    <option key={u.id} value={u.nama_unit}>{u.nama_unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-emerald-400 block mb-0.5">Jaminan Fisik</label>
                                            <select value={jaminanFisik} onChange={(e) => setJaminanFisik(e.target.value)} disabled={loadingPaketJaminan} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-1.5 text-xs text-white font-bold focus:outline-none disabled:opacity-50">
                                                <option value="">{loadingPaketJaminan ? 'Memuat...' : '-- JAMINAN --'}</option>
                                                {daftarJaminan.map((j) => (
                                                    <option key={j.id} value={j.nama_unit}>{j.nama_unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-emerald-400 block mb-0.5">Alamat Lengkap Rumah</label>
                                        <textarea rows={1} value={alamatRumah} onChange={(e) => setAlamatRumah(e.target.value)} placeholder="Nama jalan, RT/RW, desa..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none resize-none"></textarea>
                                    </div>
                                </div>
                            )}

                            {errorReservasi && <div className="text-[11px] text-red-400 font-mono text-center font-bold">{errorReservasi}</div>}

                            <button type="submit" disabled={loadingReservasi} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-gray-950 font-black tracking-wider uppercase py-2.5 rounded-xl text-xs transition-all shadow-md">
                                {loadingReservasi ? 'MENGIRIM...' : 'KIRIM DATA RESERVASI '}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}