# PRODUCT BRIEF — QueueBareng
### Platform Manajemen Antrian Main Bareng Mobile Legends untuk Live Streamer

**Versi:** 1.0  
**Tanggal:** Mei 2026  
**Status:** Pre-Development (MVP Planning)

---

## 1. RINGKASAN PRODUK

**QueueBareng** adalah platform SaaS berbasis web yang membantu live streamer Mobile Legends mengelola antrian jasa "main bareng" berbayar secara otomatis, transparan, dan anti-dispute.

**Masalah yang diselesaikan:**
- Streamer kewalahan mengatur antrian secara manual saat ramai
- Sering salah urutan karena pencatatan tidak terstruktur
- Tidak ada tracking berapa game yang sudah/belum dimainkan per customer
- Customer dapat membohongi streamer karena tidak ada game log

**Solusi:**
- Dashboard real-time yang auto-generate antrian dari input nominal donasi
- Game log per customer yang tercatat dengan timestamp
- Public queue page yang bisa dilihat penonton
- Carry-over sisa game ke sesi live berikutnya

---

## 2. TARGET PENGGUNA

**Primary User: Live Streamer Mobile Legends**
- Membuka jasa main bareng berbayar saat live streaming
- Platform live: YouTube, TikTok
- Platform donasi: Sociabuzz (dan platform donasi lainnya)
- Pain point: Manajemen antrian manual yang berantakan

**Secondary User: Customer/Penonton Streamer**
- Membayar jasa main bareng via donasi
- Ingin tahu posisi antrian mereka tanpa harus tanya di chat

---

## 3. LOGIKA BISNIS INTI

### 3.1 Struktur Slot Game
```
Total slot Mobile Legends Rank = 5
Slot streamer                  = 1
Slot tersedia untuk customer   = 4

Setiap customer menempati 1 slot dan bisa bermain berturut-turut
(misal: beli 5 game = 1 slot dimainkan 5 kali berturut-turut)
```

### 3.2 Sistem Pricing (Dikonfigurasi oleh Streamer)
Setiap streamer mengatur harga paket sendiri. Contoh konfigurasi umum:

| Paket | Jalur | Harga | Keterangan |
|-------|-------|-------|------------|
| 1 Game | Normal | Rp 25.000 | Harga satuan |
| 1 Game | Fast Track | Rp 51.000 | Prioritas antrian |
| 5 Game | Normal (Bundle) | Rp 110.000 | Diskon bundling |

Streamer dapat menambah, mengubah, atau menghapus paket sesuai kebutuhan.

### 3.3 Logika Auto-Mapping Nominal
```
Sistem menerima input: nominal donasi + ML ID dari streamer

Proses auto-detect:
1. Cek apakah nominal cocok dengan paket bundle (exact match)
   → Rp 110.000 = paket 5 game normal
2. Jika bukan bundle, cek apakah habis dibagi harga fast track
   → Rp 102.000 ÷ 51.000 = 2 (exact) → 2 game fast track
3. Jika bukan fast track, cek apakah habis dibagi harga normal
   → Rp 50.000 ÷ 25.000 = 2 (exact) → 2 game normal
4. Jika tidak cocok semua → FLAG sebagai "nominal anomali"
   → Streamer approve manual (masuk normal/fast track berapa game)
```

### 3.4 Logika Upgrade Jalur (Normal → Fast Track)
```
Kondisi: Customer memiliki order aktif di jalur normal, lalu donate lagi

Sistem mendeteksi:
- Apakah ML ID sudah ada di antrian aktif? → Ya
- Apakah nominal baru sesuai paket baru? → Tidak (nominal tanggung)
- Sistem menawarkan streamer opsi: UPGRADE JALUR ke fast track

Jika streamer approve upgrade:
- Entry customer dipindah ke jalur fast track
- Posisi fast track berdasarkan timestamp upgrade (bukan timestamp awal)
```

### 3.5 Logika Prioritas Antrian
```
URUTAN BERMAIN:
[FAST TRACK] → diurutkan berdasarkan timestamp donate (pertama donate = pertama main)
[NORMAL]     → diurutkan berdasarkan timestamp donate (pertama donate = pertama main)

Seluruh antrian fast track diselesaikan dulu sebelum lanjut ke antrian normal.
Jika fast track baru masuk saat antrian normal sedang berjalan,
fast track tersebut masuk ke posisi paling atas (mendahului normal yang menunggu).
```

### 3.6 Logika Sisa Game (Carry-Over)
```
Jika live streaming berakhir sementara customer masih punya sisa game:
- Sisa game disimpan ke database dengan status "carry-over"
- Saat streamer membuka sesi live baru, sisa game otomatis muncul kembali
- Posisi antrian carry-over: lebih dulu dari order baru di jalur yang sama
```

### 3.7 Format ML ID dari Sociabuzz
```
Format umum pesan donasi Sociabuzz:
"[ML ID] [pesan tambahan]"

Contoh: "166047234 gas kak mau bareng"

Sistem mengambil angka di awal string sebagai ML ID.
Sisanya adalah pesan opsional dari customer.
```

---

## 4. FITUR PRODUK

### 4.1 MVP (Harus Ada)

| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | Auth Streamer | Register, login, logout |
| 2 | Setup Paket Harga | Streamer atur harga per game dan paket bundle |
| 3 | Buat Sesi Live | Streamer buka sesi baru setiap mulai live |
| 4 | Input Order Manual | Form input: nominal + ML ID → auto-detect paket |
| 5 | Queue Dashboard | Tampil antrian fast track & normal secara real-time |
| 6 | Game Controls | Tombol "Mulai Game" dan "Selesai Game" per customer |
| 7 | Game Log | Riwayat semua game per customer dengan timestamp |
| 8 | Sisa Game Tracker | Counter otomatis sisa game per customer |
| 9 | Carry-Over | Sisa game tersimpan dan muncul di sesi berikutnya |
| 10 | Public Queue Page | Link publik antrian yang bisa dilihat penonton |

### 4.2 Post-MVP (Fase Berikutnya)

| No | Fitur | Deskripsi |
|----|-------|-----------|
| 11 | Sociabuzz Webhook | Auto-input order dari notif Sociabuzz |
| 12 | OBS Overlay | Widget antrian yang bisa ditampilkan di layar live |
| 13 | Customer Search | Penonton cari posisi antrian dengan ML ID |
| 14 | Analytics | Laporan revenue dan jumlah game per sesi |
| 15 | Multi-Platform Donate | Support platform donasi selain Sociabuzz |

---

## 5. ALUR PENGGUNA (USER FLOW)

### Alur Streamer
```
1. Register / Login ke QueueBareng
2. Setup paket harga (sekali, bisa diubah kapanpun)
3. Buat Sesi Live baru (setiap mulai streaming)
4. Salin link Public Queue Page → share ke penonton
5. Saat ada donasi masuk di Sociabuzz:
   a. Lihat nominal dan ML ID dari notif Sociabuzz
   b. Input ke form QueueBareng
   c. Sistem auto-detect → antrian otomatis terbentuk
6. Klik "Mulai Game" saat mengundang customer masuk lobby
7. Klik "Selesai Game" saat game berakhir → sisa game berkurang otomatis
8. Ulangi langkah 6-7 sampai antrian habis
9. Tutup Sesi Live
```

### Alur Customer/Penonton
```
1. Lihat link antrian dari streamer (di deskripsi/chat live)
2. Buka Public Queue Page
3. Lihat posisi antrian realtime
4. (Opsional) Input ML ID untuk cek posisi antrian sendiri
```

---

## 6. MODEL BISNIS

### Pricing
| Tier | Harga | Fitur | Target |
|------|-------|-------|--------|
| Free Trial | Rp 0 | Semua fitur, 7 hari | Akuisisi user baru |
| Starter | Rp 150.000/bulan | Maks 50 order/bulan | Streamer kecil |
| Pro | Rp 300.000/bulan | Unlimited order | Streamer aktif |
| Pro+ | Rp 500.000/bulan | Unlimited + OBS Overlay + Multi-akun | Streamer besar |

### Asumsi Unit Economics
```
Streamer yang buka mainbar:
- Layani 20 customer/sesi × 3 sesi/minggu = 60 customer/minggu
- Revenue mainbar: 60 × Rp 25.000 = Rp 1.500.000/minggu
- Revenue mainbar/bulan: ±Rp 6.000.000

Biaya berlangganan Pro = Rp 300.000
= hanya 5% dari revenue mainbar streamer
→ Value proposition sangat kuat
```

### Payment Gateway
- Provider: Midtrans
- Fee: Rp 4.000–5.000 per transaksi (virtual account)
- Pembayaran subscription: bulanan, auto-renewal

---

## 7. TECH STACK

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | Next.js + Tailwind CSS | React ecosystem, SSR, familiar |
| Backend | Firebase Functions | Serverless, terintegrasi Firebase |
| Database | Firebase Firestore | Real-time listener untuk queue |
| Auth | Firebase Auth | Mudah setup, gratis sampai skala besar |
| Hosting | Firebase Hosting | CDN global, free tier cukup untuk MVP |
| Payment | Midtrans | Payment gateway Indonesia terpercaya |
| Dev Tools | Google Antigravity | Agentic AI IDE untuk development |

---

## 8. BATASAN & ASUMSI MVP

- Input order dilakukan **manual** oleh streamer (bukan otomatis dari Sociabuzz API)
- Tidak ada sistem verifikasi pembayaran otomatis — streamer yang verify
- Customer tidak perlu membuat akun — identitas hanya via ML ID
- Tidak ada fitur chat/notifikasi ke customer di MVP
- Satu akun streamer = satu sesi aktif dalam satu waktu

---

## 9. RISIKO & MITIGASI

| Risiko | Kemungkinan | Mitigasi |
|--------|-------------|----------|
| Streamer tidak mau bayar subscription | Sedang | Free trial 7 hari + tier Starter Rp 150k |
| Sociabuzz tidak punya public API | Tinggi | MVP pakai input manual dulu |
| Customer punya ML ID sama (berbagi akun) | Rendah | Noted sebagai edge case, handle manual |
| Streamer lupa klik "Selesai Game" | Tinggi | Reminder UI + auto-prompt setelah durasi tertentu |

---

*Dokumen ini adalah living document. Update sesuai perkembangan riset dan feedback user.*
