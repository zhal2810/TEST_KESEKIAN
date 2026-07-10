import React, { useState, useEffect } from 'react';
// Import fungsi pencarian dari pusat komunikasi API
import { cariMemberAPI, updateMemberAPI, ambilKatalogRewardAPI, tambahRewardAPI, editRewardAPI, hapusRewardAPI, tambahMemberAPI } from '../services/api';

export default function Member() {
  const [keyword, setKeyword] = useState('');
  const [hasilCari, setHasilCari] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  // Status admin/superadmin (dibaca dari sesi login, sama seperti pola di Admin.jsx)
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);

  // State untuk modal edit member
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    nama: '', cabang: '', point: 0, stamp: 0, jenis_ps: '', tgl_claim: '', tgl_bermain: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // State untuk modal tambah member baru (khusus admin)
  const [showTambahMember, setShowTambahMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    nama: '', cabang: 'madyopuro', jenis_ps: 'PS4', point: 0, stamp: 0
  });
  const [memberLoading, setMemberLoading] = useState(false);

  // State untuk modal tambah/edit reward (khusus admin)
  const [showKelolaReward, setShowKelolaReward] = useState(false);
  const [showTambahReward, setShowTambahReward] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState(null); // null = mode tambah, ada isi = mode edit
  const [rewardForm, setRewardForm] = useState({ nama_reward: '', min_point: '', urutan: '' });
  const [rewardLoading, setRewardLoading] = useState(false);

  useEffect(() => {
    const rawSesi = sessionStorage.getItem('ngSesi');
    if (rawSesi) {
      const sesi = JSON.parse(rawSesi);
      if (sesi.role === 'admin' || sesi.role === 'superadmin') {
        setIsAdmin(true);
        setAdminInfo(sesi);
      }
    }
  }, []);

  // Ubah tanggal raw (bisa null) jadi format yyyy-MM-dd untuk input type="date"
  const toDateInputValue = (raw) => {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const bukaModalEdit = (member) => {
    setEditingMember(member);
    setEditForm({
      nama: member.nama || '',
      cabang: member.cabang || '',
      point: member.point || 0,
      stamp: member.stamp || 0,
      jenis_ps: member.jenis_ps || '',
      tgl_claim: toDateInputValue(member.tgl_claim),
      tgl_bermain: toDateInputValue(member.tgl_bermain)
    });
  };

  const tutupModalEdit = () => {
    if (editLoading) return;
    setEditingMember(null);
  };

  const handleSimpanEditMember = async () => {
    if (!editForm.nama.trim()) {
      alert('Nama member wajib diisi.');
      return;
    }

    setEditLoading(true);
    const hasil = await updateMemberAPI(editingMember.id, {
      nama: editForm.nama.trim(),
      cabang: editForm.cabang,
      point: parseInt(editForm.point) || 0,
      stamp: parseInt(editForm.stamp) || 0,
      jenis_ps: editForm.jenis_ps,
      tgl_claim: editForm.tgl_claim || null,
      tgl_bermain: editForm.tgl_bermain || null,
      // Info admin yang melakukan aksi, untuk dicatat di admin_audit_logs
      user_id: adminInfo?.id,
      nama_admin: adminInfo?.nama || adminInfo?.username,
      cabang_admin: adminInfo?.cabang
    });
    setEditLoading(false);

    if (hasil && hasil.status === 'ok') {
      setHasilCari(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...hasil.data } : m));
      setEditingMember(null);
    } else {
      alert(`Gagal menyimpan perubahan: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
    }
  };

  const handleSimpanMemberBaru = async () => {
    if (!memberForm.nama.trim()) {
      alert('Nama member wajib diisi.');
      return;
    }

    setMemberLoading(true);
    const hasil = await tambahMemberAPI({
      nama: memberForm.nama.trim(),
      cabang: memberForm.cabang,
      jenis_ps: memberForm.jenis_ps,
      point: parseInt(memberForm.point) || 0,
      stamp: parseInt(memberForm.stamp) || 0
    });
    setMemberLoading(false);

    if (hasil && hasil.status === 'ok') {
      setMemberForm({ nama: '', cabang: 'madyopuro', jenis_ps: 'PS4', point: 0, stamp: 0 });
      setShowTambahMember(false);
      alert(`Member "${hasil.data.nama}" berhasil ditambahkan. Cari namanya untuk melihat kartunya.`);
    } else {
      alert(`Gagal menambah member: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
    }
  };

  const handleSimpanReward = async () => {
    if (!rewardForm.nama_reward.trim() || rewardForm.min_point === '') {
      alert('Nama reward dan minimal point wajib diisi.');
      return;
    }

    setRewardLoading(true);
    const payload = {
      nama_reward: rewardForm.nama_reward.trim(),
      min_point: parseInt(rewardForm.min_point) || 0,
      urutan: rewardForm.urutan !== '' ? parseInt(rewardForm.urutan) : undefined
    };

    const hasil = editingRewardId
      ? await editRewardAPI(editingRewardId, payload)
      : await tambahRewardAPI(payload);
    setRewardLoading(false);

    if (hasil && hasil.status === 'ok') {
      if (editingRewardId) {
        setKatalogMadyopuro(prev => prev
          .map(r => r.id === editingRewardId ? { ...r, ...payload } : r)
          .sort((a, b) => (a.urutan || 0) - (b.urutan || 0) || a.min_point - b.min_point));
      } else {
        setKatalogMadyopuro(prev => [...prev, hasil.data].sort((a, b) => (a.urutan || 0) - (b.urutan || 0) || a.min_point - b.min_point));
      }
      setRewardForm({ nama_reward: '', min_point: '', urutan: '' });
      setEditingRewardId(null);
      setShowTambahReward(false);
    } else {
      alert(`Gagal menyimpan reward: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
    }
  };

  const handleBukaEditReward = (reward) => {
    setEditingRewardId(reward.id);
    setRewardForm({
      nama_reward: reward.nama_reward,
      min_point: String(reward.min_point ?? ''),
      urutan: reward.urutan !== null && reward.urutan !== undefined ? String(reward.urutan) : ''
    });
    setShowTambahReward(true);
  };

  const handleHapusReward = async (reward) => {
    if (!window.confirm(`Hapus reward "${reward.nama_reward}"?`)) return;

    const hasil = await hapusRewardAPI(reward.id);
    if (hasil && hasil.status === 'ok') {
      setKatalogMadyopuro(prev => prev.filter(r => r.id !== reward.id));
    } else {
      alert(`Gagal menghapus reward: ${hasil?.message || 'Tidak ada detail error dari server.'}`);
    }
  };

  // Katalog reward Madyopuro — sekarang diambil dari Supabase (tabel reward_katalog)
  const [katalogMadyopuro, setKatalogMadyopuro] = useState([]);

  useEffect(() => {
    const muatKatalog = async () => {
      const data = await ambilKatalogRewardAPI();
      setKatalogMadyopuro(data);
    };
    muatKatalog();
  }, []);

  
  const handleSearch = async (e) => {
    const val = e.target.value;
    setKeyword(val);
    const query = val.trim().toLowerCase();

    if (query.length < 2) {
      setHasilCari([]);
      setErrorStatus('');
      return;
    }

    setLoading(true);
    setErrorStatus('');

    try {
      // Cabang dikirim 'global' atau kosong karena backend sudah diatur mencari semua cabang
      const data = await cariMemberAPI('global', query);

      if (data.length === 0) {
        setErrorStatus('❌ Nama tidak ditemukan.');
        setHasilCari([]);
      } else {
        setHasilCari(data);
      }
    } catch (err) {
      console.error(err);
      setErrorStatus('⚠️ Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };
 
  const formatTanggalWIB = (tanggalRaw) => {
    if (!tanggalRaw) return '-'; // Jika tanggal kosong / null

    const date = new Date(tanggalRaw);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short', 
      year: 'numeric',
      timeZone: 'Asia/Jakarta' 
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full flex-grow">

      {/* INPUT KOTAK PENCARIAN GLOBAL */}
      <div className="bg-gray-800 border border-gray-700 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-gray-400 tracking-wider uppercase flex items-center gap-2">
            <i className="fa-solid fa-users"></i> Pencarian Member Ng-Gaming
          </h3>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTambahMember(true)}
                className="text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-user-plus"></i> Member Baru
              </button>
              <button
                onClick={() => setShowKelolaReward(true)}
                className="text-[10px] font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-gift"></i> Kelola Katalog Reward
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={handleSearch}
            placeholder="Cari nama member ..."
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-3 px-4 pl-11 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors uppercase"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
        </div>
        {loading && <div className="text-xs text-cyan-400 font-mono mt-2 animate-pulse">Mencari di seluruh cabang...</div>}
        {errorStatus && <div className="text-xs text-red-400 font-mono mt-2">{errorStatus}</div>}
      </div>

      {/* KONTEN GRID UTAMA HASIL PENCARIAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto max-h-[460px] pr-1">
        {hasilCari.map((member, idx) => {
          // LOGIKA PENTING: Deteksi tampilan kartu berdasarkan kolom cabang dari database
          const isMadyopuro = (member.cabang || '').toLowerCase() === 'madyopuro';
          const point = member.point || member.total_point || 0;

          // ================= RENDER KARTU MADYOPURO (POINT) =================
          if (isMadyopuro) {
            const nextReward = katalogMadyopuro.find(k => k.min_point > point);
            const nextRewardLabel = nextReward ? `${point}/${nextReward.min_point} POINT` : `${point} POINT ✅`;

            return (
              <div key={idx} className="bg-gray-800 border border-gray-700 rounded-3xl p-5 shadow-md flex flex-col justify-between border-t-4 border-t-cyan-500">
                <div>
                  <div className="flex justify-between items-start border-b border-gray-700/50 pb-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-white uppercase tracking-wide">{member.nama}</h4>
                        {isAdmin && (
                          <button
                            onClick={() => bukaModalEdit(member)}
                            className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/20 text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 transition-colors"
                          >
                            <i className="fa-solid fa-pen"></i> Edit
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">MADYOPURO</span>
                    </div>
                    <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-cyan-500/10 font-mono uppercase">
                      {member.jenis_ps || 'PS4'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-xl border border-gray-800 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">POINT KAMU</span>
                      <span className="text-xl font-black text-cyan-400 font-mono">💎 {point}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">NEXT REWARD</span>
                      <span className="text-xs font-black text-white font-mono">{nextRewardLabel}</span>
                    </div>
                  </div>

                  {/* LIST REWARD */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {katalogMadyopuro.map((k, kIdx) => {
                      const unlocked = point >= k.min_point;
                      return (
                        <div key={kIdx} className={`flex justify-between items-center px-3 py-2 rounded-xl text-xs border ${unlocked ? 'bg-emerald-500/5 border-emerald-500/20 text-white' : 'bg-gray-900/20 border-gray-800/60 text-gray-500'
                          }`}>
                          <div className="flex items-center gap-2 font-medium">
                            {unlocked ? <i className="fa-solid fa-circle-check text-emerald-400"></i> : <span className="w-4 text-center font-mono font-bold text-[10px] bg-gray-900 text-gray-600 rounded">{k.min_point}</span>}
                            <span>{k.nama_reward}</span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded ${unlocked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-900 text-gray-600'
                            }`}>
                            {unlocked ? 'TUKAR POIN' : 'POIN KURANG'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bagian bawah kartu hasil pencarian  */}
                <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-between items-center text-xs">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                      <i className="fa-solid fa-gift text-cyan-500/70 mr-1"></i> Tgl Claim
                    </span>
                    <span className="font-mono text-gray-300 font-medium">
                      {formatTanggalWIB(member.tgl_claim)}
                    </span>
                  </div>

                  {/* Kolom 2: Terakhir Main (Sudah format WIB) */}
                  <div className="text-right">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                      <i className="fa-solid fa-clock-rotate-left text-cyan-500/70 mr-1"></i> Terakhir Main
                    </span>
                    <span className="font-mono text-gray-300 font-medium">
                      {formatTanggalWIB(member.tgl_bermain)}
                    </span>
                  </div>

                </div>
              </div>
            );
          }

          // ================= RENDER KARTU KARANGDUREN (STAMP) =================
          const targetStamp = (member.jenis_ps || '').toLowerCase().includes('3') ? 15 : 10;
          const stamp = member.stamp || 0;
          const stampArray = Array.from({ length: targetStamp }, (_, i) => i < stamp);

          return (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-md flex flex-col justify-between border-t-4 border-t-emerald-500">
              <div>
                <div className="flex justify-between items-start border-b border-gray-700/50 pb-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white uppercase tracking-wide">{member.nama}</h4>
                      {isAdmin && (
                        <button
                          onClick={() => bukaModalEdit(member)}
                          className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/20 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 transition-colors"
                        >
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">KARANGDUREN</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-500/10 font-mono uppercase">
                    {member.jenis_ps || 'PS4'}
                  </span>
                </div>


                <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-xl border border-gray-800 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">STAMP KAMU</span>
                    <span className="text-xl font-black text-amber-500 font-mono">🔥 {stamp}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">TARGET STAMP</span>
                    <span className="text-xs font-black text-white font-mono">{stamp}/{targetStamp} STAMP</span>
                  </div>
                </div>

                {/* VISUALISASI STAMP BULATAN */}
                <div className="flex flex-wrap gap-1.5 bg-gray-900/30 p-3 rounded-xl border border-gray-800/40 justify-center">
                  {stampArray.map((filled, sIdx) => (
                    <i
                      key={sIdx}
                      className={`text-sm ${filled ? 'fa-solid fa-circle-check text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]' : 'fa-regular fa-circle text-gray-700'
                        }`}
                    ></i>
                  ))}
                </div>

                {/* HEATMAP 30 HARI TERAKHIR */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">30 DAYS ACTIVITY</span>
                    <span className="text-[9px] font-bold text-gray-400">🔥 {member.aktif_count || 0} HARI</span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 30 }).map((_, i) => {
                      // Logika: Jika i (hari ke-i dari hari ini) ada di log member, beri warna hijau
                      // Catatan: Pastikan 'member.active_days' adalah array tanggal (YYYY-MM-DD)
                      const dateKey = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      const isPlayed = member.active_days?.includes(dateKey);

                      return (
                        <div
                          key={i}
                          className={`h-3 rounded-[2px] ${isPlayed ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-gray-800'}`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
                {/* JOINED DATE */}
                <div className="flex justify-between items-center bg-gray-950 p-2 rounded-lg border border-gray-800 mb-4">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">JOINED</span>
                  <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">
                    {(() => {
                      const d = new Date(member.created_at);
                      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
                    })()}
                  </span>
                </div>
              </div>

              {/* Bagian bawah kartu hasil pencarian */}
              <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-between items-center text-xs">

                {/* Kolom 1: Tanggal Claim  */}
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                    <i className="fa-solid fa-gift text-green-500/70 mr-1"></i> Tgl Claim
                  </span>
                  <span className="font-mono text-gray-300 font-medium">
                    {formatTanggalWIB(member.tgl_claim)}
                  </span>
                </div>

                {/* Kolom 2: Terakhir Main  */}
                <div className="text-right">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                    <i className="fa-solid fa-clock-rotate-left text-green-500/70 mr-1"></i> Terakhir Main
                  </span>
                  <span className="font-mono text-gray-300 font-medium">
                    {formatTanggalWIB(member.tgl_bermain)}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {showTambahMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Tambah Member Baru</h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Nama</label>
                <input
                  type="text"
                  value={memberForm.nama}
                  onChange={(e) => setMemberForm(f => ({ ...f, nama: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400 uppercase"
                  placeholder="Nama member"
                />
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Cabang</label>
                  <select
                    value={memberForm.cabang}
                    onChange={(e) => setMemberForm(f => ({ ...f, cabang: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none focus:border-cyan-400"
                  >
                    <option value="madyopuro">Madyopuro</option>
                    <option value="karangduren">Karangduren</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Jenis PS</label>
                  <input
                    type="text"
                    value={memberForm.jenis_ps}
                    onChange={(e) => setMemberForm(f => ({ ...f, jenis_ps: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                    placeholder="PS4 / PS5"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Point Awal</label>
                  <input
                    type="number"
                    value={memberForm.point}
                    onChange={(e) => setMemberForm(f => ({ ...f, point: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Stamp Awal</label>
                  <input
                    type="number"
                    value={memberForm.stamp}
                    onChange={(e) => setMemberForm(f => ({ ...f, stamp: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSimpanMemberBaru}
                disabled={memberLoading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-900 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
              >
                {memberLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => { if (!memberLoading) setShowTambahMember(false); }}
                disabled={memberLoading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">Edit Member</h3>
            <p className="text-[10px] text-gray-500 mb-4">ID: {editingMember.id}</p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Nama</label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm(f => ({ ...f, nama: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  placeholder="Nama member"
                />
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Cabang</label>
                  <select
                    value={editForm.cabang}
                    onChange={(e) => setEditForm(f => ({ ...f, cabang: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none focus:border-cyan-400"
                  >
                    <option value="madyopuro">Madyopuro</option>
                    <option value="karangduren">Karangduren</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Jenis PS</label>
                  <input
                    type="text"
                    value={editForm.jenis_ps}
                    onChange={(e) => setEditForm(f => ({ ...f, jenis_ps: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                    placeholder="PS4 / PS5"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Point</label>
                  <input
                    type="number"
                    value={editForm.point}
                    onChange={(e) => setEditForm(f => ({ ...f, point: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Stamp</label>
                  <input
                    type="number"
                    value={editForm.stamp}
                    onChange={(e) => setEditForm(f => ({ ...f, stamp: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Tgl Claim</label>
                  <input
                    type="date"
                    value={editForm.tgl_claim}
                    onChange={(e) => setEditForm(f => ({ ...f, tgl_claim: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Tgl Bermain</label>
                  <input
                    type="date"
                    value={editForm.tgl_bermain}
                    onChange={(e) => setEditForm(f => ({ ...f, tgl_bermain: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-[10px] font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSimpanEditMember}
                disabled={editLoading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-900 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
              >
                {editLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={tutupModalEdit}
                disabled={editLoading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showKelolaReward && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Kelola Katalog Reward</h3>
              <button
                onClick={() => {
                  setEditingRewardId(null);
                  setRewardForm({ nama_reward: '', min_point: '', urutan: '' });
                  setShowTambahReward(true);
                }}
                className="text-[10px] font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus"></i> Tambah
              </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1">
              {katalogMadyopuro.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">Belum ada reward. Klik "Tambah" untuk membuat.</p>
              )}
              {katalogMadyopuro.map((k) => (
                <div key={k.id} className="flex justify-between items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-xs font-bold text-white">{k.nama_reward}</p>
                    <p className="text-[10px] font-bold text-gray-500">Min. {k.min_point} point{k.urutan !== null && k.urutan !== undefined ? ` · urutan ${k.urutan}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleBukaEditReward(k)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors"
                      title="Edit reward"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      onClick={() => handleHapusReward(k)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                      title="Hapus reward"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowKelolaReward(false)}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showTambahReward && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              {editingRewardId ? 'Edit Reward' : 'Tambah Reward Baru'}
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Nama Reward</label>
                <input
                  type="text"
                  value={rewardForm.nama_reward}
                  onChange={(e) => setRewardForm(f => ({ ...f, nama_reward: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  placeholder="Contoh: FREE 2 JAM"
                />
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Min. Point</label>
                  <input
                    type="number"
                    value={rewardForm.min_point}
                    onChange={(e) => setRewardForm(f => ({ ...f, min_point: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                    placeholder="110"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-1">Urutan (opsional)</label>
                  <input
                    type="number"
                    value={rewardForm.urutan}
                    onChange={(e) => setRewardForm(f => ({ ...f, urutan: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSimpanReward}
                disabled={rewardLoading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-900 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
              >
                {rewardLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => { if (!rewardLoading) { setShowTambahReward(false); setEditingRewardId(null); } }}
                disabled={rewardLoading}
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
