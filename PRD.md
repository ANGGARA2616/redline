# PRD — QueueBareng
### Product Requirements Document

**Versi:** 1.0  
**Tanggal:** Mei 2026  
**Status:** Draft  
**Scope:** MVP

---

## 1. TUJUAN PRODUK

### Problem Statement
Live streamer Mobile Legends yang membuka jasa main bareng berbayar mengalami kesulitan mengelola antrian secara manual. Masalah utama yang terjadi:

1. **Salah urutan antrian** — order masuk via chat donasi berantakan, tidak ada sistem yang memastikan urutan
2. **Lupa tracking sisa game** — tidak ada catatan berapa game yang sudah dimainkan per customer
3. **Customer berbohong** — customer mengklaim belum bermain padahal sudah, karena streamer tidak punya bukti log

### Goal
Membangun platform web yang memungkinkan streamer mengelola antrian main bareng secara terstruktur, real-time, dan dengan game log yang tak terbantahkan.

### Success Metrics
- Streamer berhasil mengelola sesi tanpa salah urutan
- Waktu setup antrian baru < 10 detik per order
- Zero dispute karena semua game log tercatat dengan timestamp

---

## 2. SCOPE MVP

### In Scope
- Sistem autentikasi streamer
- Konfigurasi paket harga per streamer
- Manajemen sesi live
- Input order manual + auto-detect paket dari nominal
- Queue dashboard real-time (dua jalur: Fast Track & Normal)
- Game controls (Mulai / Selesai) + game log
- Tracking sisa game per customer dengan carry-over antar sesi
- Public queue page (read-only untuk penonton)
- Subscription management + Midtrans integration

### Out of Scope (Post-MVP)
- Sociabuzz webhook / API integration
- OBS Overlay widget
- Notifikasi WhatsApp/email ke customer
- Analytics dan laporan revenue
- Multi-akun per streamer

---

## 3. USER STORIES

### 3.1 Autentikasi

**US-01: Register**
```
Sebagai streamer baru,
Saya ingin mendaftar akun dengan email dan password,
Agar saya bisa mengakses platform.

Acceptance Criteria:
- Form register: nama streamer, email, password, konfirmasi password
- Validasi email unik
- Setelah register, streamer mendapat free trial 7 hari otomatis
- Redirect ke halaman setup paket harga setelah register pertama kali
```

**US-02: Login / Logout**
```
Sebagai streamer terdaftar,
Saya ingin login dan logout,
Agar saya bisa mengakses dan mengamankan akun saya.

Acceptance Criteria:
- Login dengan email + password
- Session persists (tidak perlu login ulang setiap buka browser)
- Tombol logout tersedia di navbar
```

---

### 3.2 Setup Paket Harga

**US-03: Buat Paket Harga**
```
Sebagai streamer,
Saya ingin mengatur daftar paket harga saya sendiri,
Agar sistem bisa otomatis mendeteksi jenis order dari nominal donasi.

Acceptance Criteria:
- Streamer dapat membuat minimal 1 paket harga
- Field per paket: nama paket, jalur (Normal/Fast Track), nominal (Rp), jumlah game
- Streamer dapat menambah, mengedit, menghapus paket
- Paket tersimpan permanen dan digunakan di semua sesi berikutnya
- Sistem menggunakan daftar paket ini untuk auto-detect nominal donasi

Contoh paket default yang disarankan saat onboarding:
  - "1 Game Normal" → Rp 25.000 → 1 game → jalur Normal
  - "1 Game Fast Track" → Rp 51.000 → 1 game → jalur Fast Track
  - "5 Game Normal (Bundle)" → Rp 110.000 → 5 game → jalur Normal
```

---

### 3.3 Manajemen Sesi Live

**US-04: Buat Sesi Live**
```
Sebagai streamer,
Saya ingin membuat sesi live baru setiap kali mulai streaming,
Agar antrian terorganisir per sesi dan sisa game carry-over tampil otomatis.

Acceptance Criteria:
- Tombol "Mulai Sesi Live" di dashboard
- Sesi baru otomatis mengambil sisa game carry-over dari sesi sebelumnya
- Carry-over ditampilkan di atas antrian baru dengan label "CARRY-OVER"
- Hanya boleh ada 1 sesi aktif dalam satu waktu
- Sesi punya link public queue yang unik per sesi
```

**US-05: Tutup Sesi Live**
```
Sebagai streamer,
Saya ingin menutup sesi live,
Agar sisa game customer yang belum terlayani tersimpan untuk sesi berikutnya.

Acceptance Criteria:
- Tombol "Akhiri Sesi" di dashboard
- Konfirmasi dialog: "Ada X customer dengan Y sisa game. Lanjutkan ke sesi berikutnya?"
- Semua entry dengan status belum selesai otomatis carry-over
- Dashboard kembali ke state "tidak ada sesi aktif"
```

---

### 3.4 Input Order

**US-06: Input Order Manual**
```
Sebagai streamer,
Saya ingin input nominal donasi dan ML ID customer,
Agar sistem otomatis menempatkan customer di antrian yang tepat.

Acceptance Criteria:
- Form di sidebar dashboard: field "Nominal" (angka) + field "ML ID" (angka)
- Setelah submit, sistem menjalankan logika auto-detect:

  LOGIKA AUTO-DETECT:
  1. Cek apakah nominal exact match dengan paket bundle yang ada
     → Jika ya: buat entry sesuai paket bundle
  2. Jika bukan bundle, cek apakah nominal habis dibagi harga fast track
     → Jika ya (sisa 0): jumlah game = nominal ÷ harga fast track, jalur Fast Track
  3. Jika bukan fast track, cek apakah nominal habis dibagi harga normal
     → Jika ya (sisa 0): jumlah game = nominal ÷ harga normal, jalur Normal
  4. Jika tidak cocok semua → tampil dialog "Nominal Tidak Dikenal"
     → Streamer pilih manual: berapa game, jalur mana

- Jika ML ID sudah ada di antrian aktif dengan sisa game:
  → Tampil dialog "ML ID ini sudah punya antrian aktif"
  → Opsi: (a) Tambah game ke antrian existing, (b) Upgrade ke Fast Track, (c) Buat entry baru

- Entry baru langsung muncul di queue dashboard setelah submit
- Timestamp entry = waktu submit form
```

**US-07: Handle Nominal Anomali**
```
Sebagai streamer,
Saya ingin tetap bisa memasukkan donasi dengan nominal yang tidak sesuai paket manapun,
Agar tidak ada order yang terlewat meski customer salah nominal.

Acceptance Criteria:
- Sistem menampilkan modal "Nominal Tidak Dikenal: Rp [X]"
- Modal menampilkan paket-paket yang tersedia sebagai referensi
- Streamer bisa pilih: jalur (Normal/Fast Track) + jumlah game secara manual
- Entry dibuat dengan label "Manual Approval" di game log
```

---

### 3.5 Queue Dashboard

**US-08: Tampilkan Antrian Real-Time**
```
Sebagai streamer,
Saya ingin melihat antrian dalam dua jalur secara real-time,
Agar saya selalu tahu siapa yang harus dipanggil selanjutnya.

Acceptance Criteria:
- Dashboard menampilkan dua section: FAST TRACK (atas) dan NORMAL (bawah)
- Setiap entry menampilkan: posisi, ML ID, sisa game, timestamp order, status
- Urutan dalam masing-masing jalur berdasarkan timestamp (ASC)
- Update real-time tanpa perlu refresh halaman (Firestore listener)
- Entry yang sedang bermain ditampilkan di bagian paling atas dengan highlight

Layout dashboard:
┌──────────────────────────────────────────┐
│  SEDANG BERMAIN                          │
│  ML ID: 166047234  │  Game 2 dari 5      │
│  [⏹ Selesai Game]                        │
├──────────────────────────────────────────┤
│  ⚡ FAST TRACK                            │
│  1. 998877123  │  3 game  │  14:32       │
│  2. 112233445  │  1 game  │  14:45       │
├──────────────────────────────────────────┤
│  📋 NORMAL                               │
│  1. 554433221  │  5 game  │  14:10  🔄   │
│  2. 776655443  │  2 game  │  14:22       │
└──────────────────────────────────────────┘
│  [+ Input Order]   [⏭ Panggil Berikutnya]│
└──────────────────────────────────────────┘

Keterangan: 🔄 = carry-over dari sesi sebelumnya
```

---

### 3.6 Game Controls & Log

**US-09: Mulai Game**
```
Sebagai streamer,
Saya ingin menandai bahwa game sedang berlangsung,
Agar sistem mencatat waktu mulai dan customer yang sedang bermain.

Acceptance Criteria:
- Tombol "Panggil Berikutnya" mengambil entry pertama dari antrian (Fast Track dulu, baru Normal)
- Status entry berubah menjadi "Sedang Bermain"
- Timestamp mulai tercatat di game log
- Dashboard menampilkan entry tersebut di section "Sedang Bermain"
- Tidak bisa panggil berikutnya jika ada yang sedang bermain (harus selesaikan dulu)
```

**US-10: Selesai Game**
```
Sebagai streamer,
Saya ingin menandai bahwa game sudah selesai,
Agar sisa game customer berkurang dan log tercatat dengan timestamp.

Acceptance Criteria:
- Tombol "Selesai Game" pada entry yang sedang bermain
- Sistem mencatat: ML ID, game ke-N dari total, timestamp selesai, sesi ID
- Counter "sisa game" customer berkurang 1
- Jika sisa game = 0: entry dihapus dari antrian, status "Selesai"
- Jika sisa game > 0: entry kembali ke antrian di posisi PALING ATAS jalurnya
  (customer yang belum selesai semua game-nya tetap prioritas)
- Setelah selesai, tombol "Panggil Berikutnya" aktif kembali
```

**US-11: Lihat Game Log**
```
Sebagai streamer,
Saya ingin melihat riwayat semua game yang sudah dimainkan dalam sesi ini,
Agar saya punya bukti jika ada customer yang mengklaim belum bermain.

Acceptance Criteria:
- Tab "Log" di dashboard menampilkan semua game yang sudah selesai
- Setiap entry log menampilkan: ML ID, game ke-N dari total, timestamp mulai, timestamp selesai, sesi ID
- Log diurutkan dari terbaru ke terlama
- Log tidak bisa dihapus atau diubah (read-only, append-only)
```

---

### 3.7 Public Queue Page

**US-12: Lihat Antrian sebagai Penonton**
```
Sebagai penonton/customer,
Saya ingin melihat posisi antrian tanpa perlu login,
Agar saya tahu kapan giliran saya.

Acceptance Criteria:
- URL: /queue/[streamerUsername] atau /queue/[sessionId]
- Halaman menampilkan: antrian fast track dan normal (tanpa kontrol apapun)
- Update real-time (Firestore listener)
- Terdapat kolom search: "Cari ML ID saya" → highlight posisi customer
- Menampilkan status sesi: Aktif / Tidak Ada Sesi Aktif
- Mobile-friendly (banyak penonton akses dari HP)
```

---

### 3.8 Subscription

**US-13: Free Trial**
```
Sebagai streamer baru,
Saya ingin mencoba platform gratis selama 7 hari,
Agar saya bisa memastikan produk ini berguna sebelum berlangganan.

Acceptance Criteria:
- Free trial 7 hari otomatis aktif setelah register
- Banner countdown trial tampil di dashboard
- H-1 sebelum trial habis: muncul notifikasi upgrade
- Setelah trial habis: akses dashboard diblokir, hanya bisa lihat halaman pricing
```

**US-14: Berlangganan**
```
Sebagai streamer,
Saya ingin berlangganan setelah trial,
Agar saya bisa terus menggunakan platform tanpa batas.

Acceptance Criteria:
- Halaman Pricing menampilkan tiga tier: Starter (150k), Pro (300k), Pro+ (500k)
- Pembayaran via Midtrans (Virtual Account BCA/BNI/BRI, QRIS)
- Setelah pembayaran sukses: akses ter-unlock otomatis
- Invoice tersimpan dan bisa diunduh
- Reminder perpanjangan H-3 dan H-1 sebelum expired
```

---

## 4. SPESIFIKASI DATA

### 4.1 Schema Firestore

**Collection: users**
```
users/{userId}
  ├── displayName: string
  ├── email: string
  ├── username: string (unique, untuk URL public queue)
  ├── createdAt: timestamp
  ├── subscription: {
  │     tier: "trial" | "starter" | "pro" | "pro_plus"
  │     expiresAt: timestamp
  │     midtransOrderId: string
  │   }
  └── packages: [  ← array paket harga milik streamer
        {
          id: string
          name: string           ← "1 Game Normal"
          jalur: "normal" | "fast_track"
          nominal: number        ← 25000
          gameCount: number      ← 1
          isBundle: boolean
        }
      ]
```

**Collection: sessions**
```
sessions/{sessionId}
  ├── streamerId: string (ref to users)
  ├── createdAt: timestamp
  ├── endedAt: timestamp | null
  ├── status: "active" | "ended"
  └── publicSlug: string (untuk URL public queue)
```

**Collection: queueEntries**
```
queueEntries/{entryId}
  ├── sessionId: string
  ├── streamerId: string
  ├── mlId: string
  ├── jalur: "normal" | "fast_track"
  ├── totalGames: number
  ├── gamesPlayed: number
  ├── gamesRemaining: number    ← computed: totalGames - gamesPlayed
  ├── status: "waiting" | "playing" | "completed" | "carry_over"
  ├── orderedAt: timestamp      ← timestamp donasi diinput
  ├── isCarryOver: boolean
  ├── approvalType: "auto" | "manual"
  └── nominalDonasi: number
```

**Collection: gameLogs**
```
gameLogs/{logId}
  ├── entryId: string
  ├── sessionId: string
  ├── streamerId: string
  ├── mlId: string
  ├── gameNumber: number        ← game ke-N dari totalGames
  ├── startedAt: timestamp
  └── endedAt: timestamp
```

---

## 5. SPESIFIKASI UI/UX

### 5.1 Halaman & Routing

| Route | Halaman | Auth |
|-------|---------|------|
| / | Landing Page | Public |
| /register | Register | Public |
| /login | Login | Public |
| /dashboard | Dashboard Streamer | Private |
| /dashboard/settings | Pengaturan Paket Harga | Private |
| /dashboard/log | Game Log Sesi Ini | Private |
| /dashboard/history | Riwayat Sesi | Private |
| /queue/[username] | Public Queue Page | Public |
| /pricing | Halaman Pricing | Public |

### 5.2 Komponen Utama

**QueueCard** — kartu antrian per customer
- Menampilkan: ML ID, posisi, sisa game, jalur, badge carry-over
- State: waiting / playing / completed

**InputOrderForm** — form input order baru
- Field: Nominal (number), ML ID (number)
- Button: "Tambah ke Antrian"
- Output: dialog konfirmasi paket yang terdeteksi

**GameControlPanel** — panel kontrol game aktif
- Menampilkan: ML ID yang sedang main, game ke-N dari total
- Button: "Selesai Game"

**PublicQueueView** — tampilan penonton
- Dua kolom: Fast Track dan Normal
- Search bar ML ID
- Real-time badge "LIVE"


---


## 6. PERTANYAAN TERBUKA (Open Questions)

| # | Pertanyaan | Status |
|---|-----------|--------|
| 1 | Apakah Sociabuzz punya public webhook API untuk developer? | Belum diverifikasi |
| 2 | Bagaimana handle customer dengan ML ID yang sama di akun berbeda? | Belum diputuskan |
| 3 | Apakah perlu fitur pause antrian (misal streamer break makan)? | Belum diputuskan |
| 4 | Berapa maksimum customer dalam 1 antrian? | Belum ada limit |
| 5 | Apakah game log bisa diexport/download oleh streamer? | Post-MVP |

---

*PRD ini adalah dokumen hidup yang akan diperbarui seiring progres development dan feedback dari early adopter.*
