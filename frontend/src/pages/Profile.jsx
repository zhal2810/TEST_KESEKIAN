import React, { useState, useEffect } from 'react';
// PERBAIKAN: Memastikan semua API yang dipakai di-import
import { muatLogGlobalAPI, loginAPI, muatLogProfilAPI } from '../services/api';

export default function Profile() {
  // --- State Manajemen Sesi & Login ---
  const [sesi, setSesi] = useState(null);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [cabangLogin, setCabangLogin] = useState('madyopuro');
  const [loginError, setLoginError] = useState('');
  // PERBAIKAN: Pisahkan loading untuk form login
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // --- State Data Profil & Heatmap ---
  const [profilData, setProfilData] = useState(null);
  const [logs, setLogs] = useState([]);
  // PERBAIKAN: Pisahkan loading untuk heatmap
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(true);
  const [riwayatBermain, setRiwayatBermain] = useState([]);
  const [tahunAktif, setTahunAktif] = useState(new Date().getFullYear());

  // Memeriksa token sesi dan load log global saat pertama kali buka halaman
  useEffect(() => {
    const raw = sessionStorage.getItem('ngSesi');
    if (raw) {
      const dataSesi = JSON.parse(raw);
      setSesi(dataSesi);
      muatDetailProfil(dataSesi);
    }

    // Tarik data heatmap global untuk 2 cabang
    muatLogGlobalAPI().then(data => {
      setLogs(data);
      setIsLoadingHeatmap(false);
    });
  }, []);

  // --- Fungsi Hit API Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !pin.trim()) {
      setLoginError('Nama & PIN wajib diisi.');
      return;
    }

    setIsAuthenticating(true);
    setLoginError('');

    try {
      const data = await loginAPI(username, pin);

      if (data.status === 'ok' && data.user) {
        const dataSesi = {
          id: data.user.id,
          nama: data.user.nama,
          role: data.user.role || 'member',
          cabang: data.user.cabang
        };
        sessionStorage.setItem('ngSesi', JSON.stringify(dataSesi));
        setSesi(dataSesi);
        muatDetailProfil(dataSesi);
      } else {
        setLoginError(data.error || 'Nama atau PIN salah.');
      }
    } catch (err) {
      setLoginError('⚠️ Gagal terhubung ke server auth.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // --- Ambil Data Riwayat & Log Member ---
  const muatDetailProfil = async (dataSesi) => {
    try {
      const logData = await muatLogProfilAPI(dataSesi.cabang, dataSesi.id);
      setRiwayatBermain(logData);

      setProfilData({
        nama: dataSesi.nama,
        cabang: dataSesi.cabang,
        jenis_ps: logData[0]?.jenis_ps || 'PS4',
        total_claim: logData.filter(l => l.tipe === 'claim' || l.tipe_log === 'claim').length
      });
    } catch (err) {
      console.error('Gagal memuat detail log profil:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ngSesi');
    setSesi(null);
    setProfilData(null);
    setRiwayatBermain([]);
    setUsername('');
    setPin('');
  };

  // --- LOGIKA WARNA KOTAK ---
  const getWarnaKotak = (tanggal) => {
    const logHariIni = logs.filter(log => {
      if (!log.waktu_log) return false;
      const d = new Date(log.waktu_log);
      if (isNaN(d.getTime())) return false;
      const tglLog = d.toISOString().split('T')[0];
      return tglLog === tanggal;
    });

    const adaMadyopuro = logHariIni.some(log => log.cabang === 'madyopuro');
    const adaKarangduren = logHariIni.some(log => log.cabang === 'karangduren');

    if (adaMadyopuro && adaKarangduren) {
      return 'bg-gradient-to-br from-cyan-400 to-green-400 shadow-[0_0_10px_rgba(56,189,248,0.6)] border-transparent';
    }
    if (adaMadyopuro) {
      return 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] border-transparent';
    }
    if (adaKarangduren) {
      return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] border-transparent';
    }

    return 'bg-gray-800/40 border-gray-600/30';
  };

  // PERBAIKAN: Bungkus logika heatmap ke dalam fungsi
  const renderGitHubHeatmap = () => {
    const kotakHeatmap = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const tanggalStr = (d && !isNaN(d.getTime())) ? d.toISOString().split('T')[0] : '';

      kotakHeatmap.push(
        <div
          key={i}
          title={`Aktivitas pada ${tanggalStr}`}
          className={`w-3.5 h-3.5 rounded-[3px] border transition-all duration-300 hover:scale-150 cursor-crosshair z-10 hover:z-50 ${getWarnaKotak(tanggalStr)}`}
        ></div>
      );
    }

    return (
      <div className="mt-8 bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-6 border-b border-gray-700/50 pb-4">
          <div>
            <h3 className="text-white font-black text-xl tracking-wide flex items-center">
              <i className="fa-solid fa-chart-line text-cyan-400 mr-3"></i>
              MONITORING OPERASIONAL
            </h3>
            <p className="text-gray-400 text-sm mt-1">Transparansi aktivitas seluruh cabang NG GAMING</p>
          </div>

          <div className="flex gap-4 text-xs font-bold uppercase tracking-wider mt-4 md:mt-0 bg-gray-950/50 py-2 px-4 rounded-lg border border-gray-800">
            <span className="flex items-center text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
              <div className="w-3 h-3 bg-cyan-500 mr-2 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
              Madyopuro
            </span>
            <span className="flex items-center text-green-400 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]">
              <div className="w-3 h-3 bg-green-500 mr-2 rounded-sm shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              Karangduren
            </span>
          </div>
        </div>

        {isLoadingHeatmap ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-2 bg-gray-950/30 rounded-xl border border-black/20 inset-shadow-sm">
            {kotakHeatmap}
          </div>
        )}
      </div>
    );
  };

  // --- KONDISI RENDER 1: JIKA BELUM LOGIN ---
  if (!sesi) {
    return (
      <div className="max-w-md w-full mx-auto my-auto bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xl rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <i className="fa-solid fa-user-lock"></i>
          </div>
          <h2 className="text-lg font-black tracking-wider uppercase text-white">Login Member / Admin</h2>
          <p className="text-xs text-gray-400 mt-1">Silakan masuk ke sistem tunggal NG Gaming</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">


          <div>
            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1.5">Nama Member</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="NAMA KAMU"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 uppercase font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-black tracking-wider text-gray-400 uppercase block mb-1.5">4-Digit PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="••••"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 tracking-widest text-center font-bold"
            />
          </div>

          {loginError && <div className="text-xs text-red-400 font-mono text-center font-bold">{loginError}</div>}

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-gray-900 font-black tracking-wider uppercase py-3 rounded-xl text-xs transition-all mt-2"
          >
            {isAuthenticating ? 'VERIFIKASI...' : 'MASUK'}
          </button>
        </form>
      </div>
    );
  }

  // --- KONDISI RENDER 2: JIKA SUDAH LOGIN ---
  return (
    <div className="flex flex-col gap-4 w-full h-full flex-grow p-4 md:p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-cyan-500 text-gray-950 font-black text-xl rounded-full flex items-center justify-center uppercase shadow-md">
            {sesi.nama.slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wide text-white">{sesi.nama}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-black tracking-wider bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded uppercase border border-cyan-500/10">📍 {sesi.cabang}</span>
              <span className="text-[9px] font-black tracking-wider bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded uppercase border border-yellow-500/20">👑 {sesi.role}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-900 hover:bg-red-600/10 hover:text-red-400 border border-gray-700 hover:border-red-500/20 text-gray-400 text-xs font-black tracking-wider uppercase rounded-xl transition-all"
        >
          <i className="fa-solid fa-power-off mr-1.5"></i> Keluar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        <div className="bg-gray-800 border border-gray-700 p-3.5 rounded-2xl text-center shadow-md">
          <span className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider mb-0.5">Kunjungan</span>
          <span className="text-base font-black font-mono text-white">{riwayatBermain.length} Kali</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-3.5 rounded-2xl text-center shadow-md">
          <span className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider mb-0.5">Status Akun</span>
          <span className="text-base font-black font-mono text-emerald-400 uppercase">AKTIF</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-3.5 rounded-2xl text-center shadow-md">
          <span className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider mb-0.5">Total Hadiah</span>
          <span className="text-base font-black font-mono text-white">{profilData?.total_claim || 0} Gift</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-3.5 rounded-2xl text-center shadow-md">
          <span className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider mb-0.5">Konsol Favorit</span>
          <span className="text-base font-black font-mono text-cyan-400 uppercase">{profilData?.jenis_ps || 'PS4'}</span>
        </div>
      </div>

      {/* Render komponen Heatmap di bawah info profil */}
      {renderGitHubHeatmap()}
    </div>
  );
}