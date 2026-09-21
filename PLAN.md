# Rencana Arsitektur: Pendataan Warga Komplek Celeste

## 1. Struktur Monorepo

```
celeste-warga/
├── backend/          # Laravel 11
├── frontend/        # React + Vite + Tailwind
├── docs/
│   └── reference/
├── PLAN.md
└── README.md
```

## 2. Desain Token (Tailwind Config)

### Warna Utama
- **Maroon (Primary):** `#7B1B36`
  - Celeste-maroon-50: #FDF2F4
  - Celeste-maroon-100: #FAE0E5
  - Celeste-maroon-200: #F5C0CA
  - Celeste-maroon-300: #E896A4
  - Celeste-maroon-400: #D66274
  - Celeste-maroon-500: #C13A4C
  - Celeste-maroon-600: #A62E3E
  - Celeste-maroon-700: #7B1B36 (base)
  - Celeste-maroon-800: #5F1428
  - Celeste-maroon-900: #4A101F

- **Gold (Accent):** `#D5A526`
  - Celeste-gold-50: #FDF9EB
  - Celeste-gold-100: #FAF0CC
  - Celeste-gold-200: #F5E099
  - Celeste-gold-300: #EDCA66
  - Celeste-gold-400: #E3B133
  - Celeste-gold-500: #D5A526 (base)
  - Celeste-gold-600: #B08A1E
  - Celeste-gold-700: #8C6B17
  - Celeste-gold-800: #685110
  - Celeste-gold-900: #4F3D0D

### Tipografi
- **Display/Logo:** Playfair Display (italic, bold) - untuk judul dan logo
- **Body:** Plus Jakarta Sans - untuk isi/formulir
- **Fallback:** Georgia, serif / system-ui, sans-serif

## 3. Logo SVG Components

Akan dibuat sebagai React components terpisah:
- `<CelesteLogo />` - logo lengkap dengan animasi
- `<CelesteWordmark />` - teks saja
- `<CelesteOrnament />` - ornamen emas (kiri & kanan)
- `<CelesteLeaf />` - tangkai individual (untuk animasi)

Animasi: stroke-dashoffset untuk tangkai, scale untuk bulatan, fade-in untuk teks

## 4. Backend API Design

### Public Endpoints
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/config` | Ambil config blok/unit |
| POST | `/api/warga/cek-ktp` | Cek KTP sudah terdaftar |
| POST | `/api/warga` | Submit data warga |

### Admin Endpoints (Auth: Sanctum)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/admin/login` | Login admin |
| POST | `/api/admin/logout` | Logout |
| GET | `/api/admin/me` | Data admin terkini |
| GET | `/api/admin/warga` | List warga (paginate/filter) |
| GET | `/api/admin/warga/{id}` | Detail warga |
| DELETE | `/api/admin/warga/{id}` | Hapus warga |
| GET | `/api/admin/statistik` | Dashboard stats |
| GET | `/api/admin/warga/export` | Export CSV |
| GET | `/api/admin/warga/{id}/foto/{jenis}` | Stream foto |

## 5. Database Schema

### Table: warga
```sql
- id (bigint, PK)
- blok (enum)
- unit (string)
- status_tempat_tinggal (enum: milik_sendiri, kontrak, kontrak_keluarga, kontrak_mahasiswa, kost, istri, anak)
- nama_kepala_keluarga (string)
- nama_lengkap (string)
- no_kk (string, encrypted)
- no_ktp (string, encrypted)
- no_ktp_hash (string, unique, HMAC-SHA256)
- no_hp (string)
- no_kontak_darurat (string, nullable)
- status_pernikahan (enum)
- pekerjaan (string)
- agama (enum)
- foto_kk (string, nullable)
- foto_ktp (string, nullable)
- foto_keluarga (string, nullable)
- foto_selfie (string, nullable)
- ip_pengisi (string, nullable)
- created_at, updated_at, deleted_at (soft deletes)
```

### Table: admins
```sql
- id (bigint, PK)
- name (string)
- email (string, unique)
- password (hashed)
- created_at, updated_at
```

## 6. Frontend Pages & Routes

### Public (Tanpa Login)
- `/` - Landing dengan hero 3D
- `/form` - Multi-step form (5 langkah)
- `/sukses` - Halaman terima kasih

### Admin (Laravel Sanctum)
- `/admin/login` - Halaman login
- `/admin/dashboard` - Dashboard dengan statistik
- `/admin/warga` - Tabel rekap data
- `/admin/warga/{id}` - Detail warga (drawer/modal)

## 7. Tahapan Implementasi

### Fase 1: Setup & Logo
- [x] Buat struktur direktori
- [x] SVG logo (traced dari reference)
- [x] Setup Tailwind dengan design tokens
- [x] Test logo render

### Fase 2: Backend Foundation
- [x] Laravel project setup
- [x] Database migration + seeder
- [x] API endpoints dasar
- [x] Authentication (Sanctum)
- [x] Test coverage (pending)

### Fase 3: Frontend Foundation
- [x] React + Vite setup
- [x] Tailwind + Framer Motion
- [x] Three.js hero (lazy-loaded)
- [x] Routing setup

### Fase 4: Formulir Warga
- [x] Multi-step form
- [x] Validasi (Zod)
- [x] Auto-save localStorage
- [x] Image compression
- [x] Progress animation

### Fase 5: Admin Dashboard
- [ ] Login page
- [ ] Dashboard dengan grafik
- [ ] Tabel data warga
- [ ] Filter & export
- [ ] Photo viewer

### Fase 6: Polish
- [ ] Loading states (skeleton)
- [ ] Error handling
- [ ] Responsive test
- [ ] Performance optimization
- [ ] Final build test

## 8. Teknologi Stack

### Backend
- PHP 8.2+
- Laravel 11
- MySQL 8
- Laravel Sanctum
- Intervention Image
- Pest/PHPUnit

### Frontend
- React 18
- Vite
- Tailwind CSS 3
- Framer Motion
- React Hook Form
- Zod
- @react-three/fiber + drei
- Recharts
- React Router
- Axios/TanStack Query
- browser-image-compression
