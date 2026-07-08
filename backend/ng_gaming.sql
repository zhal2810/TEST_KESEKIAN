-- ============================================================
-- ng_gaming schema (reconstructed — original dump had no CREATE TABLE)
-- ============================================================

CREATE TABLE public.members (
    id BIGSERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    cabang TEXT NOT NULL,
    point INTEGER DEFAULT 0,
    stamp INTEGER DEFAULT 0,
    jenis_ps TEXT,
    tgl_claim TIMESTAMP,
    tgl_bermain TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE public.users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    pin TEXT NOT NULL,
    role TEXT NOT NULL,
    cabang TEXT NOT NULL,
    member_id BIGINT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE public.admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    nama_admin TEXT,
    cabang TEXT,
    aksi TEXT,
    target_member TEXT,
    keterangan TEXT,
    waktu_log TIMESTAMP DEFAULT now()
);

CREATE TABLE public.cafe_menu (
    id SERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    kategori TEXT NOT NULL, -- 'Makanan', 'Minuman', 'Lainnya'
    harga INTEGER NOT NULL,
    cabang TEXT NOT NULL,   -- 'madyopuro', 'karangduren'
    status TEXT DEFAULT 'Tersedia', -- 'Tersedia' atau 'Habis'
    created_at TIMESTAMP DEFAULT now()
);



CREATE TABLE public.info_banner (
    id BIGSERIAL PRIMARY KEY,
    tipe TEXT,
    konten TEXT,
    is_aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE public.member_logs (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT,
    tipe_log TEXT,
    keterangan TEXT,
    waktu_log TIMESTAMP DEFAULT now()
);

CREATE TABLE public.reservations (
    id BIGSERIAL PRIMARY KEY,
    nama TEXT NOT NULL,
    no_hp TEXT,
    cabang TEXT,
    jenis_layanan TEXT,
    keterangan TEXT,
    status_reservasi TEXT DEFAULT 'pending',
    tanggal_booking TIMESTAMP,  -- Diubah menjadi TIMESTAMP agar jam & menit tersimpan
    no_meja TEXT,               -- Ditambahkan untuk fitur plot meja oleh Admin
    created_at TIMESTAMP DEFAULT now()
);

-- ============================================================
-- Data (from your original ng_gaming.sql dump)
-- ============================================================
COPY public.members (id, nama, cabang, point, stamp, jenis_ps, tgl_claim, tgl_bermain, created_at) FROM stdin;
1	TEST	madyopuro	100	0	PS5	\N	2026-07-04 00:00:00	2026-07-04 21:59:39.026103
2	TEST2	karangduren	0	9	PS5	\N	2026-07-04 00:00:00	2026-07-04 22:00:22.281117
\.


--
-- TOC entry 4958 (class 0 OID 16440)
-- Dependencies: 224
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, pin, role, cabang, member_id, created_at) FROM stdin;
1	owner	1213	superadmin	global	\N	2026-07-04 15:22:47.715324
2	adi	0000	admin	global	\N	2026-07-04 15:23:39.668944
3	aabbee	0000	admin	global	\N	2026-07-04 15:23:49.779548
\.

COPY public.cafe_menu (id, nama, kategori, harga, cabang, status, created_at) FROM stdin;
1	Indomie Goreng Telur	Makanan	10000	madyopuro	Tersedia	2026-07-05 14:00:00
2	Es Teh Manis Jumbo	Minuman	5000	madyopuro	Tersedia	2026-07-05 14:00:00
3	Rokok Surya 12	Lainnya	25000	madyopuro	Tersedia	2026-07-05 14:00:00
4	Indomie Kuah Soto	Makanan	10000	karangduren	Tersedia	2026-07-05 14:00:00
5	Kopi Hitam Kapal Api	Minuman	5000	karangduren	Tersedia	2026-07-05 14:00:00
\.
--
-- TOC entry 4966 (class 0 OID 16510)
-- Dependencies: 232
-- Data for Name: admin_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_audit_logs (id, user_id, nama_admin, cabang, aksi, target_member, keterangan, waktu_log) FROM stdin;
\.


--
-- TOC entry 4960 (class 0 OID 16461)
-- Dependencies: 226
-- Data for Name: cafe_menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cafe_menu (id, nama, deskripsi, harga, kategori, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4964 (class 0 OID 16496)
-- Dependencies: 230
-- Data for Name: info_banner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.info_banner (id, tipe, konten, is_aktif, created_at) FROM stdin;
\.


--
-- TOC entry 4956 (class 0 OID 16423)
-- Dependencies: 222
-- Data for Name: member_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_logs (id, member_id, tipe_log, keterangan, waktu_log) FROM stdin;
\.


--
-- TOC entry 4962 (class 0 OID 16479)
-- Dependencies: 228
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, nama, no_hp, cabang, jenis_layanan, keterangan, status_reservasi, tanggal_booking, created_at) FROM stdin;
\.

-- Fix sequences to continue after the imported IDs
SELECT pg_catalog.setval('public.members_id_seq', COALESCE((SELECT MAX(id) FROM public.members), 1), true);
SELECT pg_catalog.setval('public.users_id_seq', COALESCE((SELECT MAX(id) FROM public.users), 1), true);
SELECT pg_catalog.setval('public.admin_audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM public.admin_audit_logs), 1), false);
SELECT pg_catalog.setval('public.cafe_menu_id_seq', COALESCE((SELECT MAX(id) FROM public.cafe_menu), 1), false);
SELECT pg_catalog.setval('public.info_banner_id_seq', COALESCE((SELECT MAX(id) FROM public.info_banner), 1), false);
SELECT pg_catalog.setval('public.member_logs_id_seq', COALESCE((SELECT MAX(id) FROM public.member_logs), 1), false);
SELECT pg_catalog.setval('public.reservations_id_seq', COALESCE((SELECT MAX(id) FROM public.reservations), 1), false);