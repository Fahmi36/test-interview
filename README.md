Setup

1. Install dependencies:

npm install

2. Copy `.env.example` ke `.env`:

copy .env.example .env

3. Edit file `.env` dan sesuaikan URL backend:

VITE_API_URL=http://localhost:3000

4. Pastikan backend sudah jalan di URL yang dikonfigurasi

5. Jalankan development server:

npm run dev

Aplikasi akan jalan di `http://localhost:5173` (atau port lain jika 5173 sudah dipakai)

Build untuk Production


npm run build

Output akan ada di folder `dist/`. Untuk preview hasil build:


npm run preview

Fitur

#1. All Posts
- Tabs: Published, Drafts, Trashed
- Table: Menampilkan title, category, dan action buttons
- Action: 
  - Icon Edit → Navigate ke halaman edit
  - Icon Trash → Pindahkan artikel ke trash (tidak muncul di tab Trashed)
- Table Features: 
  - Pagination otomatis (10 items per page)
  - Sorting (dari TanStack Table)
  - Responsive

#2. Add New
- Form Fields:
  - Title (min 20 karakter)
  - Content (min 200 karakter)
  - Category (min 3 karakter)
- Buttons:
  - Publish → Create artikel dengan status "publish"
  - Draft → Create artikel dengan status "draft"
- Validation: Client-side validation sesuai requirement

#3. Edit Article
- Form Fields: Sama seperti Add New (pre-filled dengan data artikel)
- Buttons:
  - Publish → Update status jadi "publish"
  - Draft → Update status jadi "draft"
- Navigation: Bisa diakses dari action button Edit di table

#4. Preview
- Menampilkan semua artikel dengan status "publish"
- Pagination: 5 artikel per halaman
- Tampilan blog-style untuk preview artikel

Navigation

Sidebar navigation dengan menu:
- All Posts - Kelola semua artikel
- Add New - Tambah artikel baru
- Preview - Preview blog

Note: Semua variable yang dimulai dengan `VITE_` akan di-expose ke client-side code.

API Integration

Frontend berkomunikasi dengan backend melalui `src/services/api.ts`. Endpoint yang digunakan:

- `POST /article/` - Create artikel
- `GET /article/:limit/:offset` - Get semua artikel
- `GET /article/:id` - Get artikel by ID
- `PUT /article/:id` - Update artikel
- `DELETE /article/:id` - Delete artikel

Styling

Menggunakan Tailwind CSS dengan custom theme dari shadcn/ui. Color scheme bisa diubah di `src/index.css` pada bagian CSS variables.

Tips

- Pastikan backend sudah running sebelum start frontend
- Jika ada CORS error, pastikan backend sudah setup CORS middleware
- Untuk development, bisa pakai browser dev tools untuk debugging
- Hot reload otomatis aktif saat development

Troubleshooting

Port sudah dipakai?
- Vite akan otomatis cari port berikutnya, atau bisa set manual di `vite.config.ts`

API connection error?
- Cek apakah backend sudah running
- Cek URL di `.env` sudah benar
- Cek CORS setting di backend
