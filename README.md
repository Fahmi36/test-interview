Cara Install

1. Pastikan Go 1.24.3 sudah terinstall
2. Clone atau download project ini
3. Install dependencies:

go mod download

4. Setup environment:
copy env.example .env
Lalu edit .env sesuai kebutuhan (database host, user, password, dll)

5. Jalankan aplikasi:
go run main.go

Aplikasi akan otomatis:
- Connect ke database
- Auto migrate tabel `posts` (kalau belum ada)
- Start server di port 3000 (atau sesuai PORT di .env)

Setup Database

Sebelum jalanin aplikasi, pastikan database MySQL sudah jalan. Ada 2 cara setup database:

Create Database Manual

Buat database dulu secara manual:

Via Command Line:
mysql -u root -p

Lalu jalankan SQL, kalau saya pakai database namanya article jadi nama database bisa di sesuaikan dengan .env anda ya

CREATE DATABASE IF NOT EXISTS `article` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Atau langsung pakai script:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS article CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

Setelah database dibuat:

A. Pakai Auto Migration (Recommended)
Tinggal jalankan aplikasi dengan go run main.go

B. Create Tabel Manual
Kalau mau create tabel manual, jalankan SQL ini:sql
USE `article`;

CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `status` VARCHAR(100) NOT NULL,
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

#Opsi 2: Full Auto (Database + Tabel)

Kalau user MySQL punya permission CREATE DATABASE, aplikasi bisa auto create database juga.


API Endpoints

#1. Create Article
POST `/article/`

Request:json
{
  "title": "Judul artikel minimal 20 karakter",
  "content": "Konten artikel harus minimal 200 karakter",
  "category": "Kategori",
  "status": "publish"
}

Response:json
{}

#2. Get All Articles (dengan pagination)
GET `/article/:limit/:offset`

Contoh: `GET /article/10/0`

Response:json
[
  {
    "title": "Judul",
    "content": "Konten",
    "category": "Kategori",
    "status": "publish"
  }
]

#3. Get Article by ID
GET `/article/:id`

Contoh: `GET /article/1`

Response:json
{
  "title": "Judul",
  "content": "Konten",
  "category": "Kategori",
  "status": "draf"
}

#4. Update Article
PUT atau PATCH `/article/:id`

Request json
{
  "title": "Judul yang diupdate minimal 20 karakter",
  "content": "Konten yang diupdate minimal 200 karakter",
  "category": "Kategori",
  "status": "draft"
}

Response:json
{}

#5. Delete Article
DELETE `/article/:id`

Contoh: `DELETE /article/1`

Response:json
{}

Validasi

Endpoint create dan update punya validasi:

- Title: Wajib, minimal 20 karakter
- Content: Wajib, minimal 200 karakter  
- Category: Wajib, minimal 3 karakter
- Status: Wajib, harus salah satu dari: `publish`, `draft`, atau `thrash`

Kalau validasi gagal, akan return error dengan detail field yang salah.

Postman Collection

Saya juga membuat file `Article_API.postman_collection.json` yang bisa diimport ke Postman. Semua endpoint sudah dikonfigurasi, tinggal import aja.

server port sesuai dengan .env ya saya pakai 3000 dan jangan lupa set variable `base_url` ke `http://localhost:3000`.

Error Response

Kalau ada error, response formatnya seperti ini di json
{
  "error": "Error"
}

Status code:
- `400` - Bad Request (validasi error, input salah)
- `404` - Not Found (artikel tidak ditemukan)
- `500` - Internal Server Error

Middleware

Aplikasi menggunakan beberapa middleware:

1. Recover - Tangkap panic, biar server ga crash
2. RequestID - Generate unique ID untuk setiap request (buat tracking)
3. CORS - Handle cross-origin requests
4. Logger - Log semua HTTP requests

Environment Variables

Edit file `.env` untuk konfigurasi:
env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=article

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Server
PORT=3000

Tips
- Untuk development, bisa langsung `go run main.go`
- Untuk production, build dulu: `go build -o test-service` lalu jalankan executable-nya
