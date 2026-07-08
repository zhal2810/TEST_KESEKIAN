import React, { useState, useEffect } from 'react';
import { muatBerandaAPI, API_URL } from '../services/api';

export default function Home() {
  // --- State data beranda ---
  const [informasi, setInformasi] = useState('Turnamen NG Gaming babak kualifikasi akan segera dimulai! Kumpulkan poin dan stamp kamu sebanyak-banyaknya.');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempInfo, setTempInfo] = useState('');

  const [topMadyopuro, setTopMadyopuro] = useState([]);
  const [topKarangduren, setTopKarangduren] = useState([]);
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState([]);
  const [loading, setLoading] = useState(true);

  // Periksa apakah yang login saat ini adalah Admin/Superadmin (diambil dari sessionStorage)
  const sessionRaw = sessionStorage.getItem('ngSesi');
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const isAdmin = session && (session.role === 'admin' || session.role === 'superadmin');

  // --- Mengambil data gabungan saat halaman pertama kali dimuat ---
useEffect(() => {
    async function sinkronisasiDataBeranda() {
      try {
        // 1. Memanggil fungsi dari src/services/api.js
        const dataBeranda = await muatBerandaAPI();
        
        // 2. MENGAMBIL DATA BANNER (URUTAN DIPERBAIKI)
        const resBanner = await fetch(`${API_URL}/api/banner`); // Pastikan port backend benar
        const bannerData = await resBanner.json(); // <-- Pindahkan ke sini (sebelum if)
        
        if (bannerData && bannerData.length > 0) {
          const activeBanner = bannerData.find(b => b.is_aktif === true || b.is_aktif === 'true' || b.is_aktif === 't' || b.is_aktif === 1 || b.is_aktif === '1');
          if (activeBanner) {
            setInformasi(activeBanner.konten);
          }
        }

        // 3. PROSES DATA LEADERBOARD
        const dataMdy = dataBeranda.madyopuro;
        const dataKdr = dataBeranda.karangduren;

        // Cabang Madyopuro: Diurutkan berdasarkan Point tertinggi
        const top3Mdy = [...dataMdy]
          .sort((a, b) => (b.point || b.total_point || 0) - (a.point || a.total_point || 0))
          .slice(0, 3);

        // Cabang Karangduren: Diurutkan berdasarkan Stamp tertinggi
        const top3Kdr = [...dataKdr]
          .sort((a, b) => (b.stamp || 0) - (a.stamp || 0))
          .slice(0, 3);

        setTopMadyopuro(top3Mdy);
        setTopKarangduren(top3Kdr);

        // 4. PROSES DATA AKTIVITAS TERBARU (GABUNGAN LOG)
        const gabunganLog = [
          ...dataMdy.map(m => ({ ...m, lokasi_cabang: 'MADYOPURO' })),
          ...dataKdr.map(m => ({ ...m, lokasi_cabang: 'KARANGDUREN' }))
        ]
          .filter(m => m.tgl_bermain && m.tgl_bermain !== '-')
          .sort((a, b) => {
            const dateA = new Date(a.tgl_bermain);
            const dateB = new Date(b.tgl_bermain);
            const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
            const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
            return timeB - timeA;
          })
          .slice(0, 15);

        setAktivitasTerbaru(gabunganLog);
        setLoading(false);
      } catch (error) {
        console.error('Gagal menyinkronkan data komponen beranda:', error);
        setLoading(false);
      }
    }

    sinkronisasiDataBeranda();
  }, []);
  // --- Fungsi Simpan Perubahan Informasi Manual (Khusus Admin) ---
 const handleSaveInfo = async () => {
    // 1. Ubah tampilan di UI secara instan
    setInformasi(tempInfo);
    setIsEditingInfo(false);

    // 2. Kirim data teks yang baru ke Backend (Database)
    try {
        const apiUrl = `${API_URL}`; // Pastikan port backend Anda benar
        
        // Kita gunakan ID 1 dengan asumsi ini adalah banner pengumuman utama
        const response = await fetch(`${apiUrl}/api/banner/1`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            // tempInfo berisi teks baru yang diketik oleh admin
            body: JSON.stringify({ konten: tempInfo }) 
        });

        if (!response.ok) {
            console.error("Gagal menyimpan ke database");
            alert("Gagal menyimpan banner. Pastikan server backend sedang berjalan.");
        } else {
            console.log("Banner berhasil diperbarui di database!");
        }
    } catch (error) {
        console.error("Terjadi kesalahan koneksi jaringan:", error);
    }
};
  const formatTanggalWIB = (tanggalRaw) => {
    if (!tanggalRaw) return '-'; // Jika tanggal kosong / null

    const date = new Date(tanggalRaw);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short', // Akan tampil seperti: Jan, Feb, Jul
      year: 'numeric',
      timeZone: 'Asia/Jakarta' // Memaksa zona waktu ke WIB
    });
  };

  const sameDate = (a, b) => {
    if (!a || !b) return false;
    const dateA = new Date(a);
    const dateB = new Date(b);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return false;
    return dateA.toISOString().split('T')[0] === dateB.toISOString().split('T')[0];
  };
  return (
    <div className="flex flex-col gap-4 h-full flex-grow justify-between">

      {/* ================= PANEL 1: INFORMASI (ATAS) ================= */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-lg min-h-[120px] relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-black text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
            <i className="fa-solid fa-bullhorn text-sm"></i> Informasi & Event Rental
          </h3>
          {isAdmin && !isEditingInfo && (
            <button
              onClick={() => { setIsEditingInfo(true); setTempInfo(informasi); }}
              className="text-gray-400 hover:text-cyan-400 text-xs flex items-center gap-1 bg-gray-900/60 px-2.5 py-1 rounded-lg border border-gray-700 transition-all"
            >
              <i className="fa-solid fa-pen text-[10px]"></i> Edit
            </button>
          )}
        </div>

        {isEditingInfo ? (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              value={tempInfo}
              onChange={(e) => setTempInfo(e.target.value)}
              className="w-full bg-gray-900 border border-cyan-500/50 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditingInfo(false)} className="px-3 py-1 bg-gray-700 rounded-lg text-xs font-bold hover:bg-gray-600">Batal</button>
              <button onClick={handleSaveInfo} className="px-3 py-1 bg-cyan-500 rounded-lg text-xs font-bold hover:bg-cyan-400 text-gray-900">Simpan</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-300 leading-relaxed font-medium mt-1">{informasi}</p>
        )}
      </div>


      {/* ================= PANEL 2: TOP 3 LEADERBOARD GABUNGAN (TENGAH) ================= */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-lg min-h-[160px]">
        <h3 className="text-xs font-black text-yellow-400 tracking-wider uppercase mb-4 flex items-center gap-1.5">
          <i className="fa-solid fa-trophy text-sm"></i> Top 3 Leaderboard Member
        </h3>

        {loading ? (
          <div className="text-gray-500 text-xs animate-pulse font-mono uppercase tracking-widest text-center py-6">MEMUAT LEADERBOARD...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* SUB-KOLOM 1: MADYOPURO */}
            <div className="bg-gray-900/40 border border-gray-700/50 p-4 rounded-2xl">
              <h4 className="text-[11px] font-black text-gray-400 tracking-wider uppercase mb-3 border-b border-gray-800 pb-1.5 flex justify-between">
                <span>Madyopuro</span>
                <span className="text-cyan-400 font-mono">TOP POINT</span>
              </h4>
              <div className="flex flex-col gap-2.5">
                {topMadyopuro.length > 0 ? topMadyopuro.map((member, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-900/60 px-3 py-2 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wide block">{member.nama}</span>
                        <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase">{member.jenis_ps || 'PS4'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-cyan-400 font-mono">⭐ {member.point || member.total_point || 0} PTS</span>
                  </div>
                )) : <div className="text-xs text-gray-600 py-2">Belum ada data member.</div>}
              </div>
            </div>

            {/* SUB-KOLOM 2: KARANGDUREN */}
            <div className="bg-gray-900/40 border border-gray-700/50 p-4 rounded-2xl">
              <h4 className="text-[11px] font-black text-gray-400 tracking-wider uppercase mb-3 border-b border-gray-800 pb-1.5 flex justify-between">
                <span>Karangduren</span>
                <span className="text-emerald-400 font-mono">TOP STAMP</span>
              </h4>
              <div className="flex flex-col gap-2.5">
                {topKarangduren.length > 0 ? topKarangduren.map((member, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-900/60 px-3 py-2 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wide block">{member.nama}</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">{member.jenis_ps || 'PS3'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">🎫 {member.stamp || 0} STAMP</span>
                  </div>
                )) : <div className="text-xs text-gray-600 py-2">Belum ada data member.</div>}
              </div>
            </div>

          </div>
        )}
      </div>


      {/* ================= PANEL 3: AKTIVITAS TERBARU GABUNGAN (BAWAH) ================= */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-lg min-h-[180px] flex flex-col flex-grow">
        <h3 className="text-xs font-black text-yellow-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
          <i className="fa-solid fa-clock-rotate-left text-sm"></i> Aktivitas Member Terbaru
        </h3>

        {loading ? (
          <div className="text-gray-500 text-xs animate-pulse font-mono uppercase tracking-widest text-center py-8">MEMUAT LIVE LOGS...</div>
        ) : (
          <div className="flex-grow overflow-y-auto max-h-[220px] pr-1 space-y-2">
            {aktivitasTerbaru.length > 0 ? aktivitasTerbaru.map((log, index) => {
              const isKlaim = sameDate(log.tgl_claim, log.tgl_bermain);

              return (
                <div
                  key={index}
                  className={`bg-gray-900/40 border border-gray-800 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-900/70 transition-colors ${isKlaim ? 'border-l-2 border-l-yellow-500' : 'border-l-2 border-l-emerald-500'
                    }`}
                >
                  <div className="text-xs">
                    <span className="text-gray-400">Member</span>{' '}
                    <span className="font-black uppercase text-white tracking-wide">{log.nama}</span>{' '}
                    {isKlaim ? (
                      <span className="text-yellow-400 font-bold">telah melakukan klaim reward 🎁</span>
                    ) : (
                      <span className="text-gray-400">
                        {log.lokasi_cabang === 'MADYOPURO'
                          ? `telah memiliki total ${log.point || log.total_point || 0} point ⭐`
                          : 'telah mengumpulkan total ' + (log.stamp || 0) + ' stamp 🎫'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
                      {formatTanggalWIB(log.tgl_bermain)}
                    </span>
                    <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase ${log.lokasi_cabang === 'MADYOPURO' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                      {log.lokasi_cabang}
                    </span>
                    <span className="text-[10px] font-mono font-black text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                      {log.jenis_ps || 'PS4'}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-xs text-gray-600 text-center py-6">Tidak ada aktivitas kunjungan terbaru.</div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
