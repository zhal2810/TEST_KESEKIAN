import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper: validasi bahwa user_id yang dikirim benar terdaftar dan rolenya admin/superadmin.
async function verifyAdminRole(supabase, userId, corsHeaders, allowedRoles = ['admin', 'superadmin']) {
  if (!userId) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ status: 'error', message: 'user_id wajib dikirim untuk validasi akses admin.' }),
        { status: 401, headers: corsHeaders }
      )
    };
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, role, cabang')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ status: 'error', message: 'Akun admin tidak ditemukan.' }),
        { status: 401, headers: corsHeaders }
      )
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ status: 'error', message: 'Akses ditolak. Role tidak memiliki izin untuk aksi ini.' }),
        { status: 403, headers: corsHeaders }
      )
    };
  }

  return { ok: true, user };
}

export default {
  async fetch(request, env, ctx) {
    // Tangani CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // INISIALISASI SUPABASE DENGAN BENAR (WAJIB DI DALAM SINI)
    if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
      return new Response(JSON.stringify({ status: 'error', message: 'Konfigurasi Supabase (URL/KEY) belum diatur di Cloudflare Secrets.' }), { status: 500, headers: corsHeaders });
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    const url = new URL(request.url);

    try {
      // 1. ENDPOINT: GET /members (Beranda & Leaderboard)
      if (url.pathname === '/members' && request.method === 'GET') {
        const cabang = url.searchParams.get('cabang') || 'madyopuro';
        const limit = parseInt(url.searchParams.get('limit')) || 100;
        const orderBy = cabang === 'karangduren' ? 'stamp' : 'point';

        const { data, error } = await supabase
          .from('members')
          .select('id, nama, point, stamp, jenis_ps, tgl_bermain, tgl_claim, cabang')
          .eq('cabang', cabang)
          .order(orderBy, { ascending: false })
          .limit(limit);

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data }), { headers: corsHeaders });
      }

      // 2. ENDPOINT: POST /auth/login (Login Kasir)
      if (url.pathname === '/auth/login' && request.method === 'POST') {
        const { username, pin } = await request.json();
        
        const { data, error } = await supabase
          .from('users')
          .select('id, username, role, cabang')
          .eq('username', username)
          .eq('pin', pin)
          .single();

        if (data) {
          // Sesuaikan nama field 'username' menjadi 'nama' agar sesuai dengan frontend Anda
          const userObj = { ...data, nama: data.username };
          return new Response(JSON.stringify({ status: 'ok', user: userObj }), { headers: corsHeaders });
        } else {
          return new Response(JSON.stringify({ status: 'error', error: 'Nama atau PIN salah.' }), { headers: corsHeaders });
        }
      }

      // 2B. ENDPOINT: GET /users (Daftar Admin)
      if (url.pathname === '/users' && request.method === 'GET') {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, role, cabang')
          .in('role', ['admin', 'superadmin'])
          .order('cabang', { ascending: true })
          .order('username', { ascending: true });

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data }), { headers: corsHeaders });
      }

      // 2C. ENDPOINT: POST /users (Tambah Admin)
      if (url.pathname === '/users' && request.method === 'POST') {
        const data = await request.json();
        const cekRole = await verifyAdminRole(supabase, data.user_id, corsHeaders, ['superadmin']);
        if (!cekRole.ok) return cekRole.response;

        if (!data.username || !data.pin || !data.role || !data.cabang) {
          return new Response(JSON.stringify({ status: 'error', message: 'Semua field wajib diisi' }), { status: 400, headers: corsHeaders });
        }

        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{ username: data.username, pin: data.pin, role: data.role, cabang: data.cabang }])
          .select('id, username, role, cabang')
          .single();

        if (error) {
          if (error.code === '23505') return new Response(JSON.stringify({ status: 'error', message: 'Username sudah dipakai.' }), { status: 409, headers: corsHeaders });
          throw error;
        }
        return new Response(JSON.stringify({ status: 'ok', data: newUser }), { headers: corsHeaders });
      }

      // 2D. ENDPOINT: PUT /users/:id (Edit Admin)
      if (url.pathname.startsWith('/users/') && request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const data = await request.json();
        const cekRole = await verifyAdminRole(supabase, data.user_id, corsHeaders, ['superadmin']);
        if (!cekRole.ok) return cekRole.response;

        const updateData = { username: data.username, role: data.role, cabang: data.cabang };
        if (data.pin && data.pin.trim() !== '') updateData.pin = data.pin;

        const { error } = await supabase.from('users').update(updateData).eq('id', id);

        if (error) {
          if (error.code === '23505') return new Response(JSON.stringify({ status: 'error', message: 'Username sudah dipakai.' }), { status: 409, headers: corsHeaders });
          throw error;
        }
        return new Response(JSON.stringify({ status: 'ok' }), { headers: corsHeaders });
      }

      // 3. ENDPOINT: GET /log (Log Personal)
      if (url.pathname === '/log' && request.method === 'GET') {
        const memberId = url.searchParams.get('member_id');
        const { data, error } = await supabase
          .from('member_logs')
          .select('tipe_log, keterangan, waktu_log')
          .eq('member_id', memberId)
          .order('waktu_log', { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data }), { headers: corsHeaders });
      }

      // ENDPOINT: GET /log/global
      if (url.pathname === '/log/global' && request.method === 'GET') {
        // Menggunakan relasi tabel jika sudah diset di Supabase
        const { data, error } = await supabase
          .from('member_logs')
          .select('id, keterangan, waktu_log, members (cabang)')
          .order('waktu_log', { ascending: false })
          .limit(1000);

        if (error) throw error;
        // Format ulang agar strukturnya sama dengan output JOIN SQL Anda sebelumnya
        const formattedData = data.map(log => ({
          id: log.id,
          keterangan: log.keterangan,
          waktu_log: log.waktu_log,
          cabang: log.members ? log.members.cabang : null
        }));
        return new Response(JSON.stringify({ status: 'ok', data: formattedData }), { headers: corsHeaders });
      }

      // 4. ENDPOINT: POST /reservasi
      if (url.pathname === '/reservasi' && request.method === 'POST') {
        const data = await request.json();
        const { data: res, error } = await supabase
          .from('reservations')
          .insert([{ 
            nama: data.nama, 
            no_hp: data.no_hp || '-', 
            cabang: data.cabang || 'madyopuro', 
            jenis_layanan: data.jenis, 
            keterangan: data.keterangan, 
            tanggal_booking: data.tanggal 
          }])
          .select('id')
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', id: res.id }), { headers: corsHeaders });
      }

      // A. ENDPOINT: GET /reservasi
      if (url.pathname === '/reservasi' && request.method === 'GET') {
        const { data, error } = await supabase
          .from('reservations')
          .select('id, nama, no_hp, cabang, jenis_layanan, keterangan, tanggal_booking, no_meja')
          .order('tanggal_booking', { ascending: false })
          .limit(100);

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data }), { headers: corsHeaders });
      }

      // B. ENDPOINT: PUT /reservasi/:id
      if (url.pathname.startsWith('/reservasi/') && request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const data = await request.json();
        const { error } = await supabase.from('reservations').update({ no_meja: data.no_meja }).eq('id', id);
        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok' }), { headers: corsHeaders });
      }

      // ENDPOINT: GET /rewards (Katalog reward Madyopuro)
      if (url.pathname === '/rewards' && request.method === 'GET') {
        const { data, error } = await supabase
          .from('reward_katalog')
          .select('*')
          .order('urutan', { ascending: true })
          .order('min_point', { ascending: true });

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data }), { headers: corsHeaders });
      }

      // ENDPOINT: POST /rewards (Tambah reward baru)
      if (url.pathname === '/rewards' && request.method === 'POST') {
        const data = await request.json();
        if (!data.nama_reward || data.min_point === undefined) {
          return new Response(JSON.stringify({ status: 'error', message: 'nama_reward dan min_point wajib diisi' }), { status: 400, headers: corsHeaders });
        }

        const { data: newReward, error } = await supabase
          .from('reward_katalog')
          .insert([{
            nama_reward: data.nama_reward,
            min_point: parseInt(data.min_point) || 0,
            urutan: data.urutan !== undefined ? parseInt(data.urutan) : null
          }])
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data: newReward }), { headers: corsHeaders });
      }

      // 1. ENDPOINT: GET /cafe
      if (url.pathname === '/cafe' && request.method === 'GET') {
        const { data, error } = await supabase
          .from('cafe_menu')
          .select('*')
          .order('cabang', { ascending: true })
          .order('nama', { ascending: true });

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data }), { headers: corsHeaders });
      }

      // 1B. ENDPOINT: POST /cafe
      if (url.pathname === '/cafe' && request.method === 'POST') {
        const data = await request.json();
        if (!data.nama || data.harga === undefined || !data.kategori || !data.cabang) {
          return new Response(JSON.stringify({ status: 'error', message: 'Semua field wajib diisi' }), { status: 400, headers: corsHeaders });
        }

        const { data: newMenu, error } = await supabase
          .from('cafe_menu')
          .insert([{
            nama: data.nama,
            deskripsi: data.deskripsi || '',
            harga: parseInt(data.harga) || 0,
            kategori: data.kategori,
            status: data.status || 'Tersedia',
            cabang: data.cabang,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data: newMenu }), { headers: corsHeaders });
      }

      // 2. ENDPOINT: PUT /cafe/status/:id
      if (url.pathname.startsWith('/cafe/status/') && request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const data = await request.json(); 
        const { error } = await supabase.from('cafe_menu').update({ status: data.status }).eq('id', id);
        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok' }), { headers: corsHeaders });
      }

      // 3. ENDPOINT: PUT /cafe/edit/:id
      if (url.pathname.startsWith('/cafe/edit/') && request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const data = await request.json(); 
        const { error } = await supabase.from('cafe_menu').update({ nama: data.nama, harga: parseInt(data.harga) }).eq('id', id);
        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok' }), { headers: corsHeaders });
      }

      // 6B. ENDPOINT: PUT /members/:id
      if (url.pathname.startsWith('/members/') && url.pathname !== '/members/cari' && request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const data = await request.json();

        const cekRole = await verifyAdminRole(supabase, data.user_id, corsHeaders);
        if (!cekRole.ok) return cekRole.response;
        const pelaku = cekRole.user;

        const { data: lama, error: errLama } = await supabase.from('members').select('*').eq('id', id).single();
        if (errLama || !lama) {
          return new Response(JSON.stringify({ status: 'error', message: 'Member tidak ditemukan.' }), { status: 404, headers: corsHeaders });
        }

        const nama = data.nama ?? lama.nama;
        const cabang = data.cabang ?? lama.cabang;
        const point = data.point !== undefined ? parseInt(data.point) || 0 : lama.point;
        const stamp = data.stamp !== undefined ? parseInt(data.stamp) || 0 : lama.stamp;
        const jenis_ps = data.jenis_ps ?? lama.jenis_ps;
        const tgl_claim = data.tgl_claim ?? lama.tgl_claim;
        const tgl_bermain = data.tgl_bermain ?? lama.tgl_bermain;

        const { error: errUpdate } = await supabase
          .from('members')
          .update({ nama, cabang, point, stamp, jenis_ps, tgl_claim, tgl_bermain })
          .eq('id', id);
        if (errUpdate) throw errUpdate;

        const parseDateSplit = (val) => {
          if (!val) return null;
          const d = new Date(val);
          return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        };

        const tglClaimLama = parseDateSplit(lama.tgl_claim);
        const tglClaimBaru = parseDateSplit(tgl_claim);
        const adaKlaimBaru = tglClaimBaru && tglClaimBaru !== tglClaimLama;

        const logType = adaKlaimBaru ? 'claim' : 'edit_admin';
        const logMsg = adaKlaimBaru 
          ? `Klaim reward dicatat oleh admin (${pelaku.username}). Point/stamp saat klaim: ${point}/${stamp}.` 
          : `Data member diperbarui oleh admin (${pelaku.username}).`;

        await supabase.from('member_logs').insert([{ member_id: id, tipe_log: logType, keterangan: logMsg, waktu_log: new Date().toISOString() }]);
        await supabase.from('admin_audit_logs').insert([{ 
          user_id: pelaku.id, 
          nama_admin: pelaku.username, 
          cabang: pelaku.cabang, 
          aksi: adaKlaimBaru ? 'claim_reward' : 'edit_member', 
          target_member: nama, 
          keterangan: `Mengubah data member "${lama.nama}" -> point:${lama.point}=>${point}, stamp:${lama.stamp}=>${stamp}`,
          waktu_log: new Date().toISOString()
        }]);

        const { data: updatedMember } = await supabase.from('members').select('*').eq('id', id).single();
        return new Response(JSON.stringify({ status: 'ok', data: updatedMember }), { headers: corsHeaders });
      }

      // 7. ENDPOINT: GET /members/cari
      if (url.pathname === '/members/cari' && request.method === 'GET') {
        const nama = url.searchParams.get('nama') || '';
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .ilike('nama', `%${nama}%`)
          .limit(15);

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', data }), { headers: corsHeaders });
      }

      // 8. ENDPOINT: GET /api/banner
      if (url.pathname === '/api/banner' && request.method === 'GET') {
        const { data, error } = await supabase.from('info_banner').select('*');
        if (error) throw error;
        const filtered = data.filter(b => b.is_aktif === true || b.is_aktif === 'true' || b.is_aktif === 't' || b.is_aktif === 1 || b.is_aktif === '1');
        return new Response(JSON.stringify(filtered), { headers: corsHeaders });
      }

      // 9. ENDPOINT: PUT /api/banner/:id
      if (url.pathname.startsWith('/api/banner/') && request.method === 'PUT') {
        const id = url.pathname.split('/').pop();
        const data = await request.json(); 

        const { data: existing, error: selectErr } = await supabase
          .from('info_banner')
          .select('id')
          .eq('id', id)
          .maybeSingle();

        if (selectErr) throw selectErr;

        let error;
        if (existing) {
          const res = await supabase.from('info_banner').update({ konten: data.konten }).eq('id', id);
          error = res.error;
        } else {
          const res = await supabase.from('info_banner').insert([{ id: parseInt(id), tipe: 'pengumuman', konten: data.konten, is_aktif: true }]);
          error = res.error;
        }

        if (error) throw error;
        return new Response(JSON.stringify({ status: 'ok', message: 'Banner berhasil diperbarui' }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ status: 'error', message: 'Endpoint tidak ditemukan' }), { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error('Database Error:', error);
      return new Response(JSON.stringify({ status: 'error', message: error.message || 'Terjadi kesalahan sistem' }), { status: 500, headers: corsHeaders });
    }
  }
};
