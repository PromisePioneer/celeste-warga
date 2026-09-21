# Pendataan Warga Komplek Celeste

Aplikasi web full-stack untuk pendataan warga Komplek Celeste.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4 + Framer Motion + Three.js
- **Backend:** Laravel 11 + MySQL + Laravel Sanctum
- **Bahasa:** Bahasa Indonesia

## Struktur Proyek

```
celeste-warga/
├── backend/          # Laravel API
├── frontend/        # React SPA
├── docs/           # Dokumentasi
├── PLAN.md         # Rencana arsitektur
└── README.md
```

## Setup Lokal

### Prerequisites

- PHP 8.2+
- Node.js 18+
- MySQL 8+
- Composer

### 1. Setup Backend

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Create database (MySQL)
mysql -u root -p -e "CREATE DATABASE celeste_warga;"

# Run migrations
php artisan migrate

# Seed demo data
php artisan db:seed

# Start server
php artisan serve
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 3. Akses Aplikasi

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api

### 4. Login Admin

```
Email: admin@celeste.local
Password: password
```

## Mengubah Daftar Blok

Daftar blok dan unit disimpan di `backend/config/celeste.php`:

```php
'blok' => [
    '89.A-P' => [
        'label' => 'Blok 89.A-P',
        'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
    ],
    // Tambahkan blok baru di sini
],
```

## Endpoint API

### Public
- `GET /api/config` - Ambil konfigurasi blok/unit
- `POST /api/warga/cek-ktp` - Cek KTP terdaftar
- `POST /api/warga` - Submit data warga

### Admin (Butuh Auth)
- `POST /api/admin/login` - Login
- `POST /api/admin/logout` - Logout
- `GET /api/admin/me` - Data admin
- `GET /api/admin/warga` - List warga (paginate)
- `GET /api/admin/statistik` - Statistik dashboard
- `GET /api/admin/warga/export` - Export CSV
- `DELETE /api/admin/warga/{id}` - Hapus warga

## Build Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
php artisan optimize
```

## Fitur

- [x] Logo Celeste dengan animasi SVG
- [x] Hero 3D dengan Three.js (lazy-loaded)
- [x] Form multi-step 5 tahap
- [x] Auto-save ke localStorage
- [x] Kompress foto di client
- [x] Pencegahan duplikat KTP
- [x] Dashboard admin dengan statistik
- [x] Export CSV
- [x] Enkripsi data sensitif
- [x] Rate limiting

## Lisensi

MIT
