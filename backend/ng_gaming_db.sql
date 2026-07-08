INSERT INTO members (nama, cabang, point, stamp, jenis_ps, tgl_claim, tgl_bermain)
VALUES (
    'TEST2',          -- nama
    'karangduren',     -- cabang
    '0',               -- point (angka tanpa tanda kutip)
    '9',               -- stamp (angka, tidak boleh '')
    'PS5',           -- jenis_ps
    NULL,            -- tgl_claim (jika kosong, gunakan NULL)
    '2026-07-04'     -- tgl_bermain (format standar tanggal SQL)
);