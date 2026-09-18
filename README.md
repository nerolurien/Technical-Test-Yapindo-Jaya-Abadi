Task Management REST API with AI Integration

REST API untuk sistem Task Management yang dibangun menggunakan framework AdonisJS v6 (Node.js/TypeScript) dan terintegrasi dengan Google Gemini API untuk eksekusi perintah berbasis teks (AI Command).

1. Spesifikasi Teknis

* Framework: AdonisJS v6
* Bahasa: TypeScript
* Database: PostgreSQL / MySQL (menggunakan Lucid ORM)
* Autentikasi: Access Token (JWT)
* AI Integration: Google Gemini API via SDK @google/genai

2. Struktur Database
Sistem menggunakan 4 tabel utama sesuai kebutuhan spesifikasi:
* users: id, name, email, password, role ('admin', 'user').
* projects: id, name, description, created_by (fk ke users).
* tasks: id, project_id (fk ke projects), title, description, status ('todo', 'in_progress', 'done'), priority ('low', 'medium', 'high'), assignee_id (fk ke users).
* audit_logs: id, user_id (fk ke users), action, request_payload, response_payload, status ('success', 'failed'), failed_reason, created_at.

3. Instalasi dan Setup

Clone Repository dan Install Dependency
```bash
git clone [https://github.com/nerolurien/Technical-Test-Yapindo-Jaya-Abadi.git](https://github.com/nerolurien/Technical-Test-Yapindo-Jaya-Abadi.git)
cd Technical-Test-Yapindo-Jaya-Abadi
npm install
```

Konfigurasi Environment (.env)
Salin template konfigurasi dari .env.example:
```bash
cp .env.example .env
```
Migrasi Database dan Seeding
Jalankan migrasi untuk membuat tabel dan mengisi data awal (dummy users, dummy project, dummy task):
```bash
node ace migration:fresh --seed
```
Kredensial akun uji coba dari seeder:   
Admin: admin@mail.com | password123   
User: budi@mail.com | password123   
User: siti@mail.com | password123  

4. Menjalankan Aplikasi
Jalankan server dalam mode development:
```bash
npm run dev
```

5. Perancangan AI Prompt Engineering
Fitur POST /ai/command menggunakan Google Gemini API dengan ketentuan teknis berikut:
a. System Instruction dan Guardrail Keamanan
Model diinstruksikan secara spesifik hanya boleh mengembalikan aksi untuk tabel tasks (CREATE, UPDATE, DELETE).
Diberikan pembatasan tegas bahwa model dilarang memanipulasi atau menghapus data user. Jika input mengandung perintah terkait perubahan data user, AI diarahkan untuk menolak perintah tersebut melalui flag rejection.

b. Structured Output (JSON Schema)
Menggunakan fitur responseSchema dari SDK Gemini API agar output yang dihasilkan selalu berbentuk JSON valid dengan struktur yang konsisten.
Langkah ini mencegah halusinasi teks, teks markdown (seperti pembuka ```json), atau teks acak yang dapat menyebabkan JSON.parse() pada backend mengalami crash.

c. Database Transaction (Atomicity)
Seluruh operasi yang dihasilkan oleh AI dieksekusi di dalam satu blok db.transaction().
Jika salah satu perintah gagal (misalnya task ID tidak ditemukan pada aksi update atau delete), maka seluruh operasi yang dieksekusi sebelumnya langsung dibatalkan melalui mekanisme rollback, memastikan integritas data tetap konsisten (all-or-nothing).

d. Audit Logging
Setiap request yang masuk ke endpoint AI command dicatat ke tabel audit_logs.
Operasi insert ke audit_logs dilakukan di luar transaksi CRUD task, sehingga request yang berstatus gagal (failed) beserta failed_reason tetap tersimpan ke database untuk kebutuhan pelacakan

6. Dokumentasi API
Koleksi Postman untuk pengujian API telah disediakan pada repositori ini di folder:
docs/postman_collection.json
