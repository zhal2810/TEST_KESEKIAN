export const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8787'
    : 'https://backend.afrizalafandi3090.workers.dev';

export function getApiUrl(cabang) {
    return API_URL; 
}

export async function muatBerandaAPI() {
    try {
        const [resMdy, resKdr] = await Promise.all([
            fetch(`${API_URL}/members?cabang=madyopuro&limit=100`),
            fetch(`${API_URL}/members?cabang=karangduren&limit=100`)
        ]);
        
        const dataMdy = await resMdy.json();
        const dataKdr = await resKdr.json();

        return {
            madyopuro: dataMdy.data || [],
            karangduren: dataKdr.data || []
        };
    } catch (e) {
        console.error('Gagal memuat data beranda API:', e);
        throw e;
    }
}
export async function cariMemberAPI(cabang, namaQuery) {
    try {
        // Hapus &cabang=${cabang} agar URL bersih
        const res = await fetch(`${API_URL}/members/cari?nama=${encodeURIComponent(namaQuery)}`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error(`Gagal mencari member:`, e);
        return [];
    }
}

export async function muatCafeMenuAPI() {
    try {
        const res = await fetch(`${API_URL}/cafe-menu`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error('Gagal memuat menu cafe:', e);
        return [];
    }
}

export async function updateStokCafeAPI(id, statusBaru) {
    try {
        const res = await fetch(`${API_URL}/cafe-menu/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: statusBaru })
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal update stok cafe:', e);
        return { error: true };
    }
}


export async function loginAPI(username, pin) {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.trim(), pin: pin.trim() })
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal melakukan autentikasi login:', e);
        return { status: 'error', error: 'Gagal terhubung ke server auth.' };
    }
}

export async function muatLogProfilAPI(cabang, memberId) {
    try {
        const res = await fetch(`${API_URL}/log?member_id=${memberId}`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error('Gagal memuat log aktivitas member:', e);
        return [];
    }
}

export async function kirimReservasiAPI(cabang, payload) {
    try {
        const res = await fetch(`${API_URL}/reservasi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal mengirim data reservasi:', e);
        return { error: true };
    }
}

export async function muatLogGlobalAPI() {
    try {
        const res = await fetch(`${API_URL}/log/global`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error('Gagal memuat log global:', e);
        return [];
    }
}
// Mengambil seluruh daftar antrean reservasi untuk kasir
export async function ambilSemuaReservasiAPI() {
    try {
        const res = await fetch(`${API_URL}/reservasi`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error('Gagal mengambil daftar reservasi:', e);
        return [];
    }
}

// Mengupdate nomor meja/tv/console pilihan admin
export async function updateNoMejaAPI(id, noMeja) {
    try {
        const res = await fetch(`${API_URL}/reservasi/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ no_meja: noMeja })
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal update nomor meja:', e);
        return { status: 'error' };
    }
}
// Mengambil semua menu cafe
export async function ambilMenuCafeAPI() {
    try {
        const res = await fetch(`${API_URL}/cafe`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error('Gagal mengambil menu cafe:', e);
        return [];
    }
}

// Update status stok menu oleh admin
export async function updateStatusMenuAPI(id, statusBaru) {
    try {
        const res = await fetch(`${API_URL}/cafe/status/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: statusBaru })
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal update status menu:', e);
        return { status: 'error' };
    }
}
// Menambahkan menu cafe baru (khusus admin)
export async function tambahMenuCafeAPI(payload) {
    try {
        const res = await fetch(`${API_URL}/cafe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal menambahkan menu cafe:', e);
        return { status: 'error' };
    }
}

// Mengambil daftar semua admin/superadmin
export async function ambilDaftarAdminAPI() {
    try {
        const res = await fetch(`${API_URL}/users`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        console.error('Gagal mengambil daftar admin:', e);
        return [];
    }
}

// Menambahkan admin baru
export async function tambahAdminAPI(payload) {
    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal menambahkan admin:', e);
        return { status: 'error', message: 'Gagal terhubung ke server.' };
    }
}

// Mengedit username / PIN / role / cabang admin
export async function updateAdminAPI(id, payload) {
    try {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal mengedit admin:', e);
        return { status: 'error', message: 'Gagal terhubung ke server.' };
    }
}

// Mengedit data member (khusus admin/superadmin) — sekaligus tercatat di member_logs & admin_audit_logs
export async function updateMemberAPI(id, payload) {
    try {
        const res = await fetch(`${API_URL}/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (e) {
        console.error('Gagal mengedit member:', e);
        return { status: 'error', message: 'Gagal terhubung ke server.' };
    }
}

export async function ambilAktivitasMemberAPI(memberId) {
    try {
        // Query ini mengambil log bermain 30 hari ke belakang
        const res = await fetch(`${API_URL}/member-logs/${memberId}?limit=30`);
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        return [];
    }
}