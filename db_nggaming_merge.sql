--
-- PostgreSQL database dump
--

\restrict 5VZBkrQaFSLEEaUWdlANwd1dGXVU3nomgBG1JGmlOkdDYyj0orcRLgd0lXIYbFh

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-08 18:29:41

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 16510)
-- Name: admin_audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_audit_logs (
    id integer NOT NULL,
    user_id integer,
    nama_admin character varying(50) NOT NULL,
    cabang character varying(20) NOT NULL,
    aksi character varying(20) NOT NULL,
    target_member character varying(50) NOT NULL,
    keterangan text NOT NULL,
    waktu_log timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_audit_logs OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16509)
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_audit_logs_id_seq OWNER TO postgres;

--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 231
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_audit_logs_id_seq OWNED BY public.admin_audit_logs.id;


--
-- TOC entry 226 (class 1259 OID 16461)
-- Name: cafe_menu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cafe_menu (
    id integer NOT NULL,
    nama character varying(100) NOT NULL,
    deskripsi text,
    harga integer DEFAULT 0 NOT NULL,
    kategori character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'tersedia'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cabang text
);


ALTER TABLE public.cafe_menu OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16460)
-- Name: cafe_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cafe_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cafe_menu_id_seq OWNER TO postgres;

--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 225
-- Name: cafe_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cafe_menu_id_seq OWNED BY public.cafe_menu.id;


--
-- TOC entry 230 (class 1259 OID 16496)
-- Name: info_banner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.info_banner (
    id integer NOT NULL,
    tipe character varying(20) NOT NULL,
    konten text NOT NULL,
    is_aktif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.info_banner OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16495)
-- Name: info_banner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.info_banner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.info_banner_id_seq OWNER TO postgres;

--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 229
-- Name: info_banner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.info_banner_id_seq OWNED BY public.info_banner.id;


--
-- TOC entry 222 (class 1259 OID 16423)
-- Name: member_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_logs (
    id integer NOT NULL,
    member_id integer,
    tipe_log character varying(20) NOT NULL,
    keterangan text,
    waktu_log timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.member_logs OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16422)
-- Name: member_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.member_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 221
-- Name: member_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.member_logs_id_seq OWNED BY public.member_logs.id;


--
-- TOC entry 220 (class 1259 OID 16406)
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id integer NOT NULL,
    nama character varying(50) NOT NULL,
    cabang character varying(20) NOT NULL,
    point integer DEFAULT 0,
    stamp integer DEFAULT 0,
    jenis_ps character varying(20) DEFAULT 'PS4'::character varying,
    tgl_claim timestamp without time zone,
    tgl_bermain timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.members OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16405)
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.members_id_seq OWNER TO postgres;

--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 219
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- TOC entry 228 (class 1259 OID 16479)
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id integer NOT NULL,
    nama character varying(50) NOT NULL,
    no_hp character varying(20) NOT NULL,
    cabang character varying(20) NOT NULL,
    jenis_layanan character varying(20) NOT NULL,
    keterangan text,
    status_reservasi character varying(20) DEFAULT 'pending'::character varying,
    tanggal_booking date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    no_meja character varying
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16478)
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservations_id_seq OWNER TO postgres;

--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 227
-- Name: reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;


--
-- TOC entry 224 (class 1259 OID 16440)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    pin character varying(4) NOT NULL,
    role character varying(20) DEFAULT 'member'::character varying NOT NULL,
    cabang character varying(20) NOT NULL,
    member_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16439)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4807 (class 2604 OID 16513)
-- Name: admin_audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_audit_logs_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 16464)
-- Name: cafe_menu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafe_menu ALTER COLUMN id SET DEFAULT nextval('public.cafe_menu_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 16499)
-- Name: info_banner id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.info_banner ALTER COLUMN id SET DEFAULT nextval('public.info_banner_id_seq'::regclass);


--
-- TOC entry 4791 (class 2604 OID 16426)
-- Name: member_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_logs ALTER COLUMN id SET DEFAULT nextval('public.member_logs_id_seq'::regclass);


--
-- TOC entry 4785 (class 2604 OID 16409)
-- Name: members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 16482)
-- Name: reservations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 16443)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4990 (class 0 OID 16510)
-- Dependencies: 232
-- Data for Name: admin_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_audit_logs (id, user_id, nama_admin, cabang, aksi, target_member, keterangan, waktu_log) FROM stdin;
1	3	navi	madyopuro	edit_member	test	Mengubah data member "test" -> point:20=>20, stamp:0=>0	2026-07-08 17:44:23.751709
2	3	navi	madyopuro	edit_member	test2	Mengubah data member "test2" -> point:140=>100, stamp:0=>0	2026-07-08 17:47:11.761073
3	3	navi	madyopuro	claim_reward	test2	Mengubah data member "test2" -> point:100=>0, stamp:0=>0	2026-07-08 17:55:55.778275
4	3	navi	madyopuro	edit_member	test	Mengubah data member "test" -> point:20=>250, stamp:0=>0	2026-07-08 17:57:10.20399
5	3	navi	madyopuro	claim_reward	test	Mengubah data member "test" -> point:250=>0, stamp:0=>0	2026-07-08 17:57:39.276701
6	3	navi	madyopuro	edit_member	test2	Mengubah data member "test2" -> point:0=>110, stamp:0=>0	2026-07-08 18:04:15.125702
7	3	navi	madyopuro	claim_reward	test2	Mengubah data member "test2" -> point:110=>0, stamp:0=>0	2026-07-08 18:04:49.818538
8	3	navi	madyopuro	edit_member	test	Mengubah data member "test" -> point:0=>250, stamp:0=>0	2026-07-08 18:05:18.431998
9	3	navi	madyopuro	claim_reward	test	Mengubah data member "test" -> point:250=>50, stamp:0=>0	2026-07-08 18:06:30.241422
\.


--
-- TOC entry 4984 (class 0 OID 16461)
-- Dependencies: 226
-- Data for Name: cafe_menu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cafe_menu (id, nama, deskripsi, harga, kategori, status, created_at, updated_at, cabang) FROM stdin;
1	Indomie Goreng Telur	\N	10000	Makanan	Tersedia	2026-07-05 17:43:19.371343	2026-07-05 17:43:19.371343	madyopuro
2	Es Teh Manis Jumbo	\N	5000	Minuman	Tersedia	2026-07-05 17:43:19.371343	2026-07-05 17:43:19.371343	madyopuro
3	Rokok Surya 12	\N	25000	Lainnya	Tersedia	2026-07-05 17:43:19.371343	2026-07-05 17:43:19.371343	madyopuro
5	Kopi Hitam Kapal Api	\N	5000	Minuman	Tersedia	2026-07-05 17:43:19.371343	2026-07-05 17:43:19.371343	karangduren
6	test	test	3000	Makanan	Tersedia	2026-07-08 16:02:54.445306	2026-07-08 16:02:54.445306	madyopuro
4	Indomie Kuah 	\N	6000	Makanan	Habis	2026-07-05 17:43:19.371343	2026-07-05 17:43:19.371343	karangduren
\.


--
-- TOC entry 4988 (class 0 OID 16496)
-- Dependencies: 230
-- Data for Name: info_banner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.info_banner (id, tipe, konten, is_aktif, created_at) FROM stdin;
1	PENGUMUMAN	test	t	2026-07-08 15:19:20.028505
\.


--
-- TOC entry 4980 (class 0 OID 16423)
-- Dependencies: 222
-- Data for Name: member_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_logs (id, member_id, tipe_log, keterangan, waktu_log) FROM stdin;
1	707	edit_admin	Data member diperbarui oleh admin (navi).	2026-07-08 17:40:48.71416
2	707	edit_admin	Data member diperbarui oleh admin (navi).	2026-07-08 17:42:16.489248
3	707	edit_admin	Data member diperbarui oleh admin (navi).	2026-07-08 17:42:34.819827
4	707	edit_admin	Data member diperbarui oleh admin (navi).	2026-07-08 17:44:23.749793
5	708	edit_admin	Data member diperbarui oleh admin (navi).	2026-07-08 17:47:11.759618
6	708	claim	Klaim reward dicatat oleh admin (navi). Point/stamp saat klaim: 0/0.	2026-07-08 17:55:55.776364
7	707	edit_admin	Data member diperbarui oleh admin (navi).	2026-07-08 17:57:10.202475
8	707	claim	Klaim reward dicatat oleh admin (navi). Point/stamp saat klaim: 0/0.	2026-07-08 17:57:39.274962
9	708	edit_admin	Data member diperbarui oleh admin (navi).	2026-07-08 18:04:15.124003
10	708	claim	Klaim reward dicatat oleh admin (navi). Point/stamp saat klaim: 0/0.	2026-07-08 18:04:49.817041
11	707	edit_admin	Data member diperbarui oleh admin (navi).	2026-07-08 18:05:18.42923
12	707	claim	Klaim reward dicatat oleh admin (navi). Point/stamp saat klaim: 50/0.	2026-07-08 18:06:30.238795
\.


--
-- TOC entry 4978 (class 0 OID 16406)
-- Dependencies: 220
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, nama, cabang, point, stamp, jenis_ps, tgl_claim, tgl_bermain, created_at) FROM stdin;
634	paijon	madyopuro	\N	0	PS5	\N	2025-08-25 00:00:00	2026-07-08 14:20:23.105474
677	riyanjalil	madyopuro	\N	0	PS4	\N	2026-03-15 00:00:00	2026-07-08 14:20:23.105474
700	satria4	madyopuro	\N	0	PS4	\N	2026-07-05 00:00:00	2026-07-08 14:20:23.105474
715	juned	karangduren	\N	6	PS3	\N	2026-03-06 00:00:00	2026-07-08 14:20:23.105474
716	mekob	karangduren	\N	12	PS3	\N	2026-06-12 00:00:00	2026-07-08 14:20:23.105474
717	yeriko	karangduren	\N	2	PS4	\N	2026-07-04 00:00:00	2026-07-08 14:20:23.105474
718	agung	karangduren	\N	2	PS3	\N	2025-10-05 00:00:00	2026-07-08 14:20:23.105474
719	ramma	karangduren	\N	9	PS3	\N	2026-07-04 00:00:00	2026-07-08 14:20:23.105474
720	aloq	karangduren	\N	5	PS3	\N	2026-06-21 00:00:00	2026-07-08 14:20:23.105474
721	anam	karangduren	\N	1	PS3	\N	2026-06-22 00:00:00	2026-07-08 14:20:23.105474
722	rohman	karangduren	\N	1	PS3	\N	2025-10-18 00:00:00	2026-07-08 14:20:23.105474
723	alip	karangduren	\N	9	PS3	\N	2026-06-07 00:00:00	2026-07-08 14:20:23.105474
724	albani	karangduren	\N	8	PS3	\N	2026-06-02 00:00:00	2026-07-08 14:20:23.105474
725	wahyu	karangduren	\N	11	PS3	\N	2025-11-05 00:00:00	2026-07-08 14:20:23.105474
726	wildan	karangduren	\N	6	PS3	\N	2026-07-07 00:00:00	2026-07-08 14:20:23.105474
727	daus	karangduren	\N	11	PS3	\N	2026-06-14 00:00:00	2026-07-08 14:20:23.105474
728	syahroni	karangduren	\N	2	PS3	2026-06-22 00:00:00	2026-07-08 00:00:00	2026-07-08 14:20:23.105474
729	uki	karangduren	\N	7	PS3	\N	2026-02-21 00:00:00	2026-07-08 14:20:23.105474
730	bandi	karangduren	\N	11	PS3	\N	2026-06-09 00:00:00	2026-07-08 14:20:23.105474
731	mamad	karangduren	\N	2	PS3	\N	2026-06-03 00:00:00	2026-07-08 14:20:23.105474
732	panji	karangduren	\N	8	PS4	\N	2026-07-01 00:00:00	2026-07-08 14:20:23.105474
733	yus	karangduren	\N	9	PS4	\N	2026-06-01 00:00:00	2026-07-08 14:20:23.105474
734	fendi	karangduren	\N	6	PS4	\N	2025-10-22 00:00:00	2026-07-08 14:20:23.105474
735	argy	karangduren	\N	6	PS4	\N	2026-05-16 00:00:00	2026-07-08 14:20:23.105474
736	sharul	karangduren	\N	1	PS4	\N	2026-03-28 00:00:00	2026-07-08 14:20:23.105474
737	fian	karangduren	\N	0	PS4	\N	2026-07-04 00:00:00	2026-07-08 14:20:23.105474
738	vari	karangduren	\N	8	PS4	\N	2025-11-25 00:00:00	2026-07-08 14:20:23.105474
739	ramma 4	karangduren	\N	1	PS4	\N	2026-06-22 00:00:00	2026-07-08 14:20:23.105474
740	pipop	karangduren	\N	7	PS4	\N	2026-02-07 00:00:00	2026-07-08 14:20:23.105474
741	tony	karangduren	\N	3	PS4	\N	2026-06-22 00:00:00	2026-07-08 14:20:23.105474
742	sukebi	karangduren	\N	6	PS4	\N	2025-10-25 00:00:00	2026-07-08 14:20:23.105474
743	wisma	karangduren	\N	1	PS4	\N	2026-07-04 00:00:00	2026-07-08 14:20:23.105474
744	gilang4	karangduren	\N	6	PS4	\N	2026-06-02 00:00:00	2026-07-08 14:20:23.105474
745	fendi 4	karangduren	\N	0	PS4	\N	\N	2026-07-08 14:20:23.105474
746	lazada	karangduren	\N	0	PS4	\N	2025-12-12 00:00:00	2026-07-08 14:20:23.105474
747	reza/surya( pes )	karangduren	\N	4	PS4	\N	2026-04-01 00:00:00	2026-07-08 14:20:23.105474
748	surya(gow)	karangduren	\N	5	PS4	\N	2026-07-05 00:00:00	2026-07-08 14:20:23.105474
749	angga.g(fifa)	karangduren	\N	7	PS4	\N	2026-02-08 00:00:00	2026-07-08 14:20:23.105474
750	uyab	karangduren	\N	0	PS4	\N	2026-02-07 00:00:00	2026-07-08 14:20:23.105474
751	wildan 4	karangduren	\N	8	PS4	\N	2026-04-16 00:00:00	2026-07-08 14:20:23.105474
752	septian	karangduren	\N	6	PS4	\N	2026-04-25 00:00:00	2026-07-08 14:20:23.105474
753	alafi	karangduren	\N	0	PS4	\N	2026-03-26 00:00:00	2026-07-08 14:20:23.105474
754	anas	karangduren	\N	4	PS4	\N	2026-04-03 00:00:00	2026-07-08 14:20:23.105474
755	saihu	karangduren	\N	2	PS4	\N	2026-04-26 00:00:00	2026-07-08 14:20:23.105474
756	gradax	karangduren	\N	0	PS4	2026-06-07 00:00:00	\N	2026-07-08 14:20:23.105474
757	alan	karangduren	\N	8	PS4	\N	2026-06-21 00:00:00	2026-07-08 14:20:23.105474
758	kia/dafa	karangduren	\N	7	PS4	\N	2026-06-21 00:00:00	2026-07-08 14:20:23.105474
759	nafis ramadan	karangduren	\N	0	PS4	2026-06-03 00:00:00	2026-07-02 00:00:00	2026-07-08 14:20:23.105474
760	farid	karangduren	\N	6	PS5	\N	2026-03-06 00:00:00	2026-07-08 14:20:23.105474
761	gilang	karangduren	\N	5	PS5	\N	2026-06-12 00:00:00	2026-07-08 14:20:23.105474
762	amin	karangduren	\N	0	PS5	\N	2026-05-01 00:00:00	2026-07-08 14:20:23.105474
763	saihu 5	karangduren	\N	10	PS5	\N	2026-05-27 00:00:00	2026-07-08 14:20:23.105474
764	baim	karangduren	\N	0	PS5	\N	2025-12-09 00:00:00	2026-07-08 14:20:23.105474
765	nanang	karangduren	\N	2	PS5	\N	2026-04-24 00:00:00	2026-07-08 14:20:23.105474
766	uyab 5	karangduren	\N	7	PS5	\N	2026-06-04 00:00:00	2026-07-08 14:20:23.105474
767	alafi 5	karangduren	\N	4	PS5	\N	2026-03-26 00:00:00	2026-07-08 14:20:23.105474
768	gembul	karangduren	\N	4	PS5	\N	2026-06-14 00:00:00	2026-07-08 14:20:23.105474
577	avatar	madyopuro	10	0	PS4	2026-06-20 00:00:00	2026-06-21 00:00:00	2026-07-08 14:20:23.105474
578	paijhon	madyopuro	80	0	ps4	\N	2026-05-05 00:00:00	2026-07-08 14:20:23.105474
579	dimsam	madyopuro	90	0	PS3	\N	2026-04-11 00:00:00	2026-07-08 14:20:23.105474
580	raul/cilok	madyopuro	130	0	PS3	\N	2026-07-04 00:00:00	2026-07-08 14:20:23.105474
581	java	madyopuro	0	0	PS4	\N	2026-05-16 00:00:00	2026-07-08 14:20:23.105474
582	sumo	madyopuro	0	0	PS3	\N	\N	2026-07-08 14:20:23.105474
583	bhakir	madyopuro	0	0	PS4	\N	2026-03-11 00:00:00	2026-07-08 14:20:23.105474
584	zhal	madyopuro	70	0	PS5	\N	2026-05-18 00:00:00	2026-07-08 14:20:23.105474
585	darulmts	madyopuro	100	0	PS5	\N	2026-07-06 00:00:00	2026-07-08 14:20:23.105474
586	reza	madyopuro	0	0	PS5	\N	2025-07-25 00:00:00	2026-07-08 14:20:23.105474
587	bidin	madyopuro	90	0	PS3	\N	2026-07-07 00:00:00	2026-07-08 14:20:23.105474
588	catur	madyopuro	110	0	PS4	\N	2026-06-30 00:00:00	2026-07-08 14:20:23.105474
589	angga fitnes	madyopuro	70	0	PS4	\N	2026-06-14 00:00:00	2026-07-08 14:20:23.105474
590	bleki	madyopuro	0	0	PS3	\N	2025-11-05 00:00:00	2026-07-08 14:20:23.105474
591	aril vip	madyopuro	70	0	PS5	\N	2026-05-29 00:00:00	2026-07-08 14:20:23.105474
592	kevin,j	madyopuro	60	0	PS3	\N	2026-06-29 00:00:00	2026-07-08 14:20:23.105474
593	ade pangestu	madyopuro	30	0	PS3	\N	2026-01-11 00:00:00	2026-07-08 14:20:23.105474
594	mas supri	madyopuro	65	0	PS4	\N	2026-06-29 00:00:00	2026-07-08 14:20:23.105474
595	ilham/dani	madyopuro	0	0	PS4	\N	2025-12-29 00:00:00	2026-07-08 14:20:23.105474
596	alvin/reza	madyopuro	0	0	PS4	\N	2025-12-25 00:00:00	2026-07-08 14:20:23.105474
597	satria	madyopuro	130	0	PS3	\N	2026-06-06 00:00:00	2026-07-08 14:20:23.105474
598	gentalo	madyopuro	20	0	PS4	\N	2026-06-13 00:00:00	2026-07-08 14:20:23.105474
599	very bocil	madyopuro	100	0	PS4	\N	2026-05-01 00:00:00	2026-07-08 14:20:23.105474
600	arko/jepri	madyopuro	30	0	PS4	\N	2026-05-05 00:00:00	2026-07-08 14:20:23.105474
601	roni	madyopuro	0	0	PS4	\N	2025-09-03 00:00:00	2026-07-08 14:20:23.105474
602	samsul	madyopuro	0	0	PS3	\N	2025-10-04 00:00:00	2026-07-08 14:20:23.105474
603	katon	madyopuro	60	0	PS3	\N	2026-03-08 00:00:00	2026-07-08 14:20:23.105474
604	dihell	madyopuro	40	0	PS3	\N	2026-04-06 00:00:00	2026-07-08 14:20:23.105474
605	hendar	madyopuro	0	0	PS4	\N	2025-12-21 00:00:00	2026-07-08 14:20:23.105474
606	veri bocil	madyopuro	0	0	PS3	\N	2026-04-19 00:00:00	2026-07-08 14:20:23.105474
607	mendol	madyopuro	0	0	PS5	2026-06-22 00:00:00	2026-06-13 00:00:00	2026-07-08 14:20:23.105474
608	rizalkastam	madyopuro	80	0	PS3	\N	2026-03-30 00:00:00	2026-07-08 14:20:23.105474
609	bayu shopee	madyopuro	40	0	PS4	\N	2026-06-06 00:00:00	2026-07-08 14:20:23.105474
610	sutangga	madyopuro	0	0	PS4	\N	2025-06-25 00:00:00	2026-07-08 14:20:23.105474
611	holil	madyopuro	10	0	PS3	\N	2026-04-07 00:00:00	2026-07-08 14:20:23.105474
612	pangestu	madyopuro	30	0	PS4	\N	2026-05-18 00:00:00	2026-07-08 14:20:23.105474
613	miq	madyopuro	0	0	PS3	\N	2025-10-18 00:00:00	2026-07-08 14:20:23.105474
614	dapit bunul	madyopuro	80	0	PS4	\N	2026-07-07 00:00:00	2026-07-08 14:20:23.105474
615	zidan bri	madyopuro	80	0	PS3	\N	2026-06-05 00:00:00	2026-07-08 14:20:23.105474
616	rian	madyopuro	10	0	PS3	\N	2025-06-22 00:00:00	2026-07-08 14:20:23.105474
617	nawaw	madyopuro	0	0	PS3	\N	2026-02-05 00:00:00	2026-07-08 14:20:23.105474
618	wahyu aji	madyopuro	50	0	PS4	\N	2026-04-02 00:00:00	2026-07-08 14:20:23.105474
619	raphael	madyopuro	0	0	PS4	\N	2025-07-25 00:00:00	2026-07-08 14:20:23.105474
620	faqih	madyopuro	0	0	PS4	\N	2025-08-03 00:00:00	2026-07-08 14:20:23.105474
621	andy p&g	madyopuro	30	0	PS4	\N	2026-05-31 00:00:00	2026-07-08 14:20:23.105474
622	azam	madyopuro	0	0	PS3	\N	2025-07-04 00:00:00	2026-07-08 14:20:23.105474
623	manziz	madyopuro	10	0	PS5	\N	2026-05-01 00:00:00	2026-07-08 14:20:23.105474
624	zuhri ps5	madyopuro	0	0	PS5	\N	2025-08-03 00:00:00	2026-07-08 14:20:23.105474
625	rio	madyopuro	0	0	PS4	\N	2025-07-04 00:00:00	2026-07-08 14:20:23.105474
626	yani	madyopuro	0	0	PS4	\N	2025-09-20 00:00:00	2026-07-08 14:20:23.105474
627	rhns	madyopuro	0	0	PS5	\N	2025-07-13 00:00:00	2026-07-08 14:20:23.105474
628	ibra	madyopuro	0	0	PS3	\N	2025-07-25 00:00:00	2026-07-08 14:20:23.105474
629	rehan iphone	madyopuro	130	0	PS4	\N	2026-07-02 00:00:00	2026-07-08 14:20:23.105474
630	gelandangan	madyopuro	0	0	PS3	\N	2025-08-14 00:00:00	2026-07-08 14:20:23.105474
631	andika new	madyopuro	0	0	PS4	\N	2025-09-30 00:00:00	2026-07-08 14:20:23.105474
632	apan	madyopuro	0	0	PS4	\N	2025-08-03 00:00:00	2026-07-08 14:20:23.105474
633	ikik	madyopuro	0	0	PS4	\N	2025-08-04 00:00:00	2026-07-08 14:20:23.105474
635	inul	madyopuro	115	0	PS5	2026-06-13 00:00:00	2026-06-29 00:00:00	2026-07-08 14:20:23.105474
636	bill	madyopuro	0	0	PS4	\N	2025-10-17 00:00:00	2026-07-08 14:20:23.105474
637	erton	madyopuro	0	0	PS3	\N	2025-09-21 00:00:00	2026-07-08 14:20:23.105474
638	isco	madyopuro	70	0	PS4	\N	2026-07-03 00:00:00	2026-07-08 14:20:23.105474
639	ditoyu(aditonyyudi)	madyopuro	0	0	PS4	\N	2025-11-30 00:00:00	2026-07-08 14:20:23.105474
640	sulton	madyopuro	0	0	PS3	\N	2025-09-05 00:00:00	2026-07-08 14:20:23.105474
641	pandi 08	madyopuro	20	0	PS3	\N	2026-06-26 00:00:00	2026-07-08 14:20:23.105474
642	josjis	madyopuro	40	0	PS3	\N	2026-03-06 00:00:00	2026-07-08 14:20:23.105474
643	restu/rizki	madyopuro	120	0	PS3	\N	2026-07-06 00:00:00	2026-07-08 14:20:23.105474
644	labu	madyopuro	0	0	PS4	\N	2025-09-08 00:00:00	2026-07-08 14:20:23.105474
645	mas dede	madyopuro	90	0	PS3	\N	2026-04-28 00:00:00	2026-07-08 14:20:23.105474
646	uget	madyopuro	60	0	PS3	\N	2026-07-06 00:00:00	2026-07-08 14:20:23.105474
647	aji tok	madyopuro	0	0	PS3	\N	2025-11-02 00:00:00	2026-07-08 14:20:23.105474
648	ifan/aan	madyopuro	40	0	PS4	\N	2026-07-04 00:00:00	2026-07-08 14:20:23.105474
649	sam adam	madyopuro	0	0	PS3	\N	2025-09-18 00:00:00	2026-07-08 14:20:23.105474
650	ifander	madyopuro	0	0	PS5	\N	2025-09-20 00:00:00	2026-07-08 14:20:23.105474
651	nafis mi	madyopuro	70	0	PS3	\N	2026-06-12 00:00:00	2026-07-08 14:20:23.105474
652	soni	madyopuro	0	0	PS3	\N	2025-09-27 00:00:00	2026-07-08 14:20:23.105474
653	adi kepet	madyopuro	90	0	PS5	\N	2026-05-23 00:00:00	2026-07-08 14:20:23.105474
654	alex	madyopuro	0	0	PS5	\N	2025-10-03 00:00:00	2026-07-08 14:20:23.105474
655	mas wawan	madyopuro	70	0	PS3	\N	2026-07-04 00:00:00	2026-07-08 14:20:23.105474
656	huda	madyopuro	145	0	PS3	\N	2026-07-06 00:00:00	2026-07-08 14:20:23.105474
657	troy	madyopuro	0	0	PS3	\N	2025-10-03 00:00:00	2026-07-08 14:20:23.105474
658	robbyphy	madyopuro	120	0	PS4	\N	2026-04-08 00:00:00	2026-07-08 14:20:23.105474
659	toyu ( tony yudi )	madyopuro	10	0	PS3	\N	2026-04-22 00:00:00	2026-07-08 14:20:23.105474
660	ricky	madyopuro	0	0	PS3	\N	2025-10-06 00:00:00	2026-07-08 14:20:23.105474
661	dap	madyopuro	0	0	PS4	\N	2025-10-12 00:00:00	2026-07-08 14:20:23.105474
662	yohan.p	madyopuro	0	0	PS4	\N	2025-10-19 00:00:00	2026-07-08 14:20:23.105474
663	gunawan	madyopuro	60	0	PS4	\N	2026-02-08 00:00:00	2026-07-08 14:20:23.105474
664	rhsn	madyopuro	40	0	PS3	\N	2026-02-01 00:00:00	2026-07-08 14:20:23.105474
665	inot tunggal	madyopuro	30	0	PS4	\N	2026-01-23 00:00:00	2026-07-08 14:20:23.105474
666	zidane bocil gta	madyopuro	130	0	PS3	\N	2026-05-11 00:00:00	2026-07-08 14:20:23.105474
667	sandi	madyopuro	0	0	PS4	\N	2025-12-03 00:00:00	2026-07-08 14:20:23.105474
668	aripendot	madyopuro	40	0	PS4	\N	2026-07-01 00:00:00	2026-07-08 14:20:23.105474
669	aris btu	madyopuro	70	0	PS3	\N	2026-01-03 00:00:00	2026-07-08 14:20:23.105474
670	mas hasar	madyopuro	20	0	PS4	\N	2026-05-27 00:00:00	2026-07-08 14:20:23.105474
671	dio	madyopuro	0	0	PS3	\N	2026-01-04 00:00:00	2026-07-08 14:20:23.105474
672	mekar	madyopuro	30	0	PS3	\N	2026-01-07 00:00:00	2026-07-08 14:20:23.105474
673	andi semir	madyopuro	50	0	PS3	\N	2026-01-14 00:00:00	2026-07-08 14:20:23.105474
674	angga mantan ng	madyopuro	0	0	PS5	\N	2026-01-15 00:00:00	2026-07-08 14:20:23.105474
675	selep vip	madyopuro	20	0	PS3	\N	2026-01-16 00:00:00	2026-07-08 14:20:23.105474
676	faiq	madyopuro	0	0	PS3	\N	2026-02-02 00:00:00	2026-07-08 14:20:23.105474
706	riyan,jalil	madyopuro	20	0	PS4	\N	\N	2026-07-08 14:20:23.105474
678	mas fahur	madyopuro	50	0	PS3	\N	2026-06-11 00:00:00	2026-07-08 14:20:23.105474
679	king max/huda	madyopuro	40	0	PS3	\N	2026-04-05 00:00:00	2026-07-08 14:20:23.105474
680	ivan/ambon	madyopuro	70	0	PS3	\N	2026-03-20 00:00:00	2026-07-08 14:20:23.105474
681	firman vip	madyopuro	50	0	PS5	\N	2026-02-27 00:00:00	2026-07-08 14:20:23.105474
682	ricky/dimas	madyopuro	30	0	PS4	\N	2026-04-19 00:00:00	2026-07-08 14:20:23.105474
683	fathqur	madyopuro	10	0	PS4	\N	2026-02-18 00:00:00	2026-07-08 14:20:23.105474
684	dika petek	madyopuro	30	0	PS3	\N	2026-07-07 00:00:00	2026-07-08 14:20:23.105474
685	dika pret	madyopuro	110	0	PS3	\N	2026-07-04 00:00:00	2026-07-08 14:20:23.105474
686	ryu	madyopuro	40	0	PS4	\N	2026-06-05 00:00:00	2026-07-08 14:20:23.105474
687	fandi	madyopuro	20	0	PS4	\N	2026-03-02 00:00:00	2026-07-08 14:20:23.105474
688	abii	madyopuro	30	0	PS3	\N	2026-05-05 00:00:00	2026-07-08 14:20:23.105474
689	aurel ciwi	madyopuro	60	0	PS3	\N	2026-04-22 00:00:00	2026-07-08 14:20:23.105474
690	iqbal/adit	madyopuro	30	0	PS5	\N	2026-03-17 00:00:00	2026-07-08 14:20:23.105474
691	mas ivon	madyopuro	60	0	PS3	\N	2026-04-28 00:00:00	2026-07-08 14:20:23.105474
692	carlos	madyopuro	40	0	PS4	\N	2026-03-26 00:00:00	2026-07-08 14:20:23.105474
693	alfa	madyopuro	20	0	PS4	\N	2026-06-01 00:00:00	2026-07-08 14:20:23.105474
694	abe	madyopuro	70	0	PS4	\N	2026-07-05 00:00:00	2026-07-08 14:20:23.105474
695	farel	madyopuro	20	0	PS5	\N	2026-04-07 00:00:00	2026-07-08 14:20:23.105474
696	editmasil	madyopuro	70	0	PS3	\N	2026-06-06 00:00:00	2026-07-08 14:20:23.105474
697	keysha	madyopuro	50	0	PS4	\N	2026-05-25 00:00:00	2026-07-08 14:20:23.105474
698	irfan	madyopuro	90	0	PS4	\N	2026-06-07 00:00:00	2026-07-08 14:20:23.105474
699	baim kecubung	madyopuro	30	0	PS5	\N	2026-05-29 00:00:00	2026-07-08 14:20:23.105474
701	lukaku	madyopuro	0	0	PS3	\N	2026-06-26 00:00:00	2026-07-08 14:20:23.105474
702	pi'i	madyopuro	20	0	PS4	\N	2026-07-05 00:00:00	2026-07-08 14:20:23.105474
703	rohman kacamata	madyopuro	40	0	PS3	\N	2026-03-18 00:00:00	2026-07-08 14:20:23.105474
704	bayu shopeee	madyopuro	40	0	PS3	\N	2026-07-01 00:00:00	2026-07-08 14:20:23.105474
705	jaya	madyopuro	30	0	PS4	\N	2026-06-13 00:00:00	2026-07-08 14:20:23.105474
709	zxz	madyopuro	70	0	PS4	\N	2026-06-25 00:00:00	2026-07-08 14:20:23.105474
710	riski vip	madyopuro	100	0	PS5	\N	2026-07-01 00:00:00	2026-07-08 14:20:23.105474
711	ilham/aril	madyopuro	50	0	PS3	\N	2026-07-05 00:00:00	2026-07-08 14:20:23.105474
712	angga fitnes 3	madyopuro	80	0	PS3	\N	2026-06-29 00:00:00	2026-07-08 14:20:23.105474
713	king max huda	madyopuro	40	0	PS4	\N	2026-07-02 00:00:00	2026-07-08 14:20:23.105474
714	ilham vip	madyopuro	20	0	PS5	\N	2026-07-03 00:00:00	2026-07-08 14:20:23.105474
708	test2	madyopuro	0	0	PS5	2026-07-08 00:00:00	2026-07-08 00:00:00	2026-07-08 14:20:23.105474
707	test	madyopuro	50	0	PS4	2026-07-08 00:00:00	2026-07-08 00:00:00	2026-07-08 14:20:23.105474
\.


--
-- TOC entry 4986 (class 0 OID 16479)
-- Dependencies: 228
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, nama, no_hp, cabang, jenis_layanan, keterangan, status_reservasi, tanggal_booking, created_at, no_meja) FROM stdin;
2	test	123456789	madyopuro	Di Tempat	Pilihan TV: TV 01 (PS4)	pending	2026-07-08	2026-07-08 16:53:42.717378	
3	test22	089999999666	karangduren	Di Tempat	Pilihan TV: TV 02 (PS4)	pending	2026-07-08	2026-07-08 16:55:06.210124	\N
\.


--
-- TOC entry 4982 (class 0 OID 16440)
-- Dependencies: 224
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, pin, role, cabang, member_id, created_at) FROM stdin;
3	navi	1234	admin	madyopuro	\N	2026-07-08 16:12:51.778342
4	admin	1221	superadmin	madyopuro	\N	2026-07-08 16:58:25.141404
\.


--
-- TOC entry 5004 (class 0 OID 0)
-- Dependencies: 231
-- Name: admin_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_audit_logs_id_seq', 9, true);


--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 225
-- Name: cafe_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cafe_menu_id_seq', 6, true);


--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 229
-- Name: info_banner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.info_banner_id_seq', 1, true);


--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 221
-- Name: member_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.member_logs_id_seq', 12, true);


--
-- TOC entry 5008 (class 0 OID 0)
-- Dependencies: 219
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.members_id_seq', 768, true);


--
-- TOC entry 5009 (class 0 OID 0)
-- Dependencies: 227
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservations_id_seq', 3, true);


--
-- TOC entry 5010 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 4826 (class 2606 OID 16524)
-- Name: admin_audit_logs admin_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 16477)
-- Name: cafe_menu cafe_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cafe_menu
    ADD CONSTRAINT cafe_menu_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 16508)
-- Name: info_banner info_banner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.info_banner
    ADD CONSTRAINT info_banner_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 16433)
-- Name: member_logs member_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_logs
    ADD CONSTRAINT member_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2606 OID 16419)
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- TOC entry 4822 (class 2606 OID 16494)
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 16421)
-- Name: members unique_member_cabang; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT unique_member_cabang UNIQUE (nama, cabang);


--
-- TOC entry 4816 (class 2606 OID 16452)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 16454)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4829 (class 2606 OID 16525)
-- Name: admin_audit_logs admin_audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit_logs
    ADD CONSTRAINT admin_audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4827 (class 2606 OID 16434)
-- Name: member_logs member_logs_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_logs
    ADD CONSTRAINT member_logs_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- TOC entry 4828 (class 2606 OID 16455)
-- Name: users users_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


-- Completed on 2026-07-08 18:29:41

--
-- PostgreSQL database dump complete
--

\unrestrict 5VZBkrQaFSLEEaUWdlANwd1dGXVU3nomgBG1JGmlOkdDYyj0orcRLgd0lXIYbFh

