# Dokumen Penjelasan Aplikasi: RedLine

Dokumen ini disusun sebagai panduan dan penjelasan komprehensif mengenai aplikasi **RedLine**. Dokumen ini dapat digunakan sebagai referensi utama dalam penulisan jurnal, skripsi, atau laporan tugas akhir.

---

## 1. Deskripsi Umum Aplikasi

* **Nama Aplikasi:** RedLine
* **Tujuan Aplikasi:** RedLine adalah sebuah platform _Software as a Service_ (SaaS) yang dirancang untuk mengotomatisasi dan mengelola sistem antrian "Main Bareng" (mabar) secara _real-time_. Aplikasi ini mempermudah streamer dalam memfasilitasi penonton yang ingin bermain game bersama mereka, mencatat transaksi donasi, dan meminimalisir perselisihan (_dispute_) terkait antrian.
* **Target Pengguna:** 
  1. **Live Streamer:** Khususnya streamer game (seperti Mobile Legends) yang sering membuka sesi mabar berbayar atau via donasi.
  2. **Viewer / Penonton:** Penonton live streaming yang berpartisipasi dalam sesi mabar dan ingin memantau posisi antrian mereka secara transparan.

---

## 2. Latar Belakang Masalah

Dalam ekosistem _live streaming_, interaksi antara streamer dan penonton melalui sesi "Main Bareng" sangat diminati. Namun, terdapat beberapa masalah fundamental yang sering terjadi:
* **Manajemen Manual yang Merepotkan:** Streamer seringkali harus mencatat nama, In-Game ID, dan nominal donasi penonton secara manual menggunakan Notepad atau spreadsheet, yang sangat mengganggu fokus saat sedang _live_.
* **Sulitnya Melacak Prioritas Donasi:** Tidak ada sistem yang secara otomatis memisahkan antara antrian normal dan antrian prioritas (berdasarkan nominal donasi).
* **Potensi _Dispute_ (Perselisihan):** Sering terjadi kesalahpahaman di mana penonton mengklaim sudah berdonasi namun belum diajak bermain, atau streamer lupa giliran siapa yang seharusnya bermain.
* **Kehilangan Data:** Jika sesi live terputus atau berakhir, sisa antrian seringkali hilang dan tidak terakumulasi untuk sesi berikutnya.

---

## 3. Fitur Utama

Aplikasi RedLine menawarkan berbagai fitur utama untuk menyelesaikan masalah di atas:
* **Sistem Antrian _Real-Time_:** Dashboard manajemen antrian yang terbagi ke dalam dua jalur utama: _Fast Track_ (Prioritas) dan _Normal_. Perubahan status antrian langsung diperbarui tanpa perlu memuat ulang halaman (_refresh_).
* **Auto-Detect Nominal Donasi:** Sistem cerdas yang dapat mendeteksi nominal donasi secara otomatis, lalu memetakan penonton ke paket yang sesuai (misalnya donasi besar otomatis masuk jalur VIP/_Fast Track_).
* **Game Log Anti-Dispute:** Riwayat permainan yang mencatat setiap sesi game lengkap dengan _timestamp_ (waktu spesifik saat game dimulai dan selesai). Ini menjadi bukti konkret untuk menghindari klaim sepihak.
* **Carry-Over Otomatis:** Apabila sesi live streaming berakhir namun masih ada penonton di dalam antrian, sistem akan menyimpan sisa antrian tersebut dan secara otomatis menampilkannya saat streamer membuka sesi _live_ berikutnya.
* **Public Queue Page:** Halaman antrian publik berupa tautan (_link_) yang dapat dibagikan kepada penonton. Penonton dapat melacak nomor urut dan status mereka secara _mobile-friendly_.
* **Pemilihan Paket Harga Fleksibel:** Streamer memiliki kendali penuh untuk mengatur daftar harga, membuat paket reguler, paket prioritas, atau _bundle_ bermain beberapa kali.

---

## 4. Alur Sistem (Workflow)

Berikut adalah skenario alur penggunaan aplikasi RedLine dari awal hingga akhir:

1. **Setup Awal (Streamer):** Streamer melakukan registrasi/login, lalu mengatur paket antrian (contoh: Rp 10.000 untuk 1x main Normal, Rp 50.000 untuk _Fast Track_).
2. **Mulai Sesi (Streamer):** Streamer membuka _dashboard_ RedLine dan menekan tombol untuk memulai "Sesi Live Baru". Streamer kemudian menyematkan (_pin_) link *Public Queue* di kolom komentar atau deskripsi streaming mereka.
3. **Pendaftaran Antrian (Viewer):** Viewer memberikan donasi (melalui integrasi _payment gateway_) beserta pesan yang mencantumkan In-Game ID mereka. 
4. **Proses Automasi (Sistem):** Sistem membaca data transaksi, melakukan _auto-detect_ nominal, dan langsung mendaftarkan ID viewer ke _dashboard_ streamer di jalur yang tepat (Normal atau Fast Track).
5. **Eksekusi Game (Streamer):** Streamer melihat antrian teratas di _dashboard_, mengundang (_invite_) pemain ke dalam game, lalu menekan tombol "Mulai Game" di aplikasi RedLine.
6. **Pencatatan (Sistem):** Saat game selesai, streamer menekan tombol "Selesai". Sistem akan menghapus pemain dari antrian aktif dan memindahkannya ke "Game Log" dengan status selesai.

---

## 5. Teknologi yang Digunakan

Aplikasi ini dikembangkan menggunakan _stack_ teknologi modern yang _scalable_:

* **Frontend:**
  * **Next.js 16 (React 19):** Framework utama untuk membangun antarmuka pengguna berbasis komponen.
  * **TailwindCSS 4:** Framework CSS utilitas untuk mempermudah dan mempercepat penulisan gaya (styling) dan UI responsif.
  * **Lucide-React:** Pustaka ikon untuk elemen visual (_user interface_).
* **Backend & API:**
  * **Next.js API Routes (Serverless):** Menangani logika _backend_, autentikasi, dan validasi antrian.
  * **Vercel Cron Jobs:** Digunakan untuk menjalankan tugas terjadwal, seperti mengecek dan memperbarui masa aktif _subscription_ (berlangganan) streamer setiap harinya.
* **Database & Autentikasi:**
  * **Firebase Authentication:** Untuk mengelola login dan registrasi pengguna secara aman.
  * **Firestore (Firebase):** Bertindak sebagai database NoSQL _real-time_ untuk menyimpan data antrian, paket harga, riwayat game, dan profil streamer.
* **Payment Gateway:**
  * **Midtrans:** Untuk memproses dan memvalidasi pembayaran atau donasi dari viewer secara terintegrasi.
* **Hosting & Deployment:**
  * **Vercel:** Platform hosting untuk men-_deploy_ aplikasi Next.js secara optimal.

---

## 6. Arsitektur Sistem

Arsitektur aplikasi dibangun berdasarkan pola _Client-Server_ modern berbasis layanan (_Serverless_ & _BaaS - Backend as a Service_):

1. **Client Layer:** Antarmuka Next.js yang berjalan di browser pengguna (Streamer dan Viewer). Lapisan ini menggunakan Firebase Client SDK untuk berlangganan pada perubahan data (_onSnapshot_).
2. **Database Layer:** Firestore berperan sebagai _single source of truth_. Setiap perubahan pada dokumen antrian (misal: streamer menekan tombol "Mulai") akan langsung di-_push_ oleh Firestore ke semua _client_ yang terhubung secara _real-time_.
3. **Logic & Integration Layer:** Next.js API dan Firebase Admin SDK bertugas melakukan operasi sensitif (_privileged operations_) seperti pembaruan massal, _cron job_, dan mendengarkan _webhook_ dari Midtrans. Ketika ada pembayaran masuk, Midtrans mengirim _webhook_ ke API Next.js, API memvalidasi dan kemudian memperbarui database Firestore.

---

## 7. Keunikan / Kelebihan Aplikasi

* **Spesifik & Niche-Targeted:** Tidak seperti platform donasi umum (seperti Saweria atau Sociabuzz) yang hanya menampilkan _alert_, RedLine bertindak jauh lebih spesifik dengan mengubah data donasi menjadi bentuk antrian game yang terstruktur.
* **Transparansi Tinggi:** Fitur _Public Queue_ menghilangkan keraguan penonton mengenai "kapan giliran saya dimainkan", meningkatkan kepercayaan dan loyalitas audiens.
* **Mengurangi Beban Kognitif:** Streamer tidak perlu lagi alt-tab ke Notepad atau sibuk menghitung donasi. Fokus streamer 100% kembali pada bermain game dan menghibur penonton.

---

## 8. Keterbatasan Sistem

* **Ketergantungan Ekosistem Game Terbatas:** Saat ini antarmuka dan alur kerja paling optimal digunakan untuk game bertipe MOBA atau _Battle Royale_ (seperti Mobile Legends) yang memiliki konsep _party_ atau lobi yang jelas.
* **Ketergantungan Koneksi Real-Time:** Karena mengandalkan WebSockets/Real-time Listener dari Firebase, jika koneksi internet klien (streamer atau viewer) tidak stabil, pembaruan antrian dapat mengalami jeda (_delay_).
* **Validasi In-Game Manual:** Sistem belum bisa memverifikasi apakah pemain *benar-benar* sudah masuk ke dalam lobi di dalam game. Streamer tetap harus mengundang pemain secara manual di dalam aplikasi gamenya.

---

## 9. Potensi Pengembangan

Untuk penelitian atau pengembangan lebih lanjut, aplikasi ini memiliki potensi fitur masa depan:
* **Integrasi API Game (_Game API Hook_):** Bekerja sama dengan _publisher_ game untuk mendapatkan API resmi agar undangan (_invite_) lobi bisa dilakukan secara otomatis langsung dari _dashboard_ RedLine.
* **Chatbot Integrasi Platform:** Mengembangkan _bot_ untuk Twitch, YouTube, atau TikTok Live yang dapat membaca _chat_ (misal penonton mengetik `!queue` di live chat, bot akan membalas posisi antrian mereka).
* **Leaderboard & Gamification:** Menambahkan sistem poin atau _leaderboard_ untuk "Top Mabar Paling Sering" di _channel_ streamer untuk meningkatkan retensi penonton.
* **Ekspansi Global:** Menambahkan integrasi payment gateway internasional (seperti Stripe atau PayPal) untuk menjangkau pengguna di luar Asia Tenggara.

---
_Dokumen ini menguraikan esensi dari pengembangan aplikasi RedLine dan sangat cocok digunakan sebagai landasan analisis pada bab tinjauan pustaka, analisis sistem, maupun metodologi pada penulisan ilmiah._
