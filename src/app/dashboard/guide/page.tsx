"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  Play,
  Globe,
  Monitor,
  Webhook,
  LayoutDashboard,
  Copy,
  Check,
  Zap,
  ClipboardList,
  BookOpen,
} from "lucide-react";

function CopyableUrl({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <code className="flex-1 font-mono text-sm bg-[var(--bg-elevated)] text-[var(--qb-accent)] px-3 py-2 rounded-lg overflow-x-auto">
        {value}
      </code>
      <button
        onClick={handleCopy}
        className="btn btn-ghost btn-sm shrink-0"
        title="Salin URL"
      >
        {copied ? (
          <Check className="w-4 h-4 text-[var(--qb-success)]" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[rgba(108,92,231,0.2)] text-[var(--qb-primary-light)] flex items-center justify-center font-bold text-sm shrink-0">
      {n}
    </div>
  );
}

function TierBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: color, color: "var(--bg-base)" }}
    >
      {label}
    </span>
  );
}

export default function GuidePage() {
  const { user } = useAuth();
  const username = user?.username ?? "username-kamu";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://app.redline.gg";

  const publicUrl = `${origin}/queue/${username}`;
  const overlayUrl = `${origin}/queue/${username}/overlay`;
  const webhookUrl = `${origin}/api/webhook/sociabuzz?username=${username}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-[var(--qb-primary-light)]" />
        <div>
          <h1 className="text-2xl font-bold">Panduan Penggunaan</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Langkah-langkah setup RedLine dari awal sampai live.
          </p>
        </div>
      </div>

      {/* Section 1 — Setup Paket */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <StepBadge n={1} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-[var(--qb-primary-light)]" />
              <h2 className="text-base font-semibold">Setup Paket Harga</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Sebelum bisa menerima antrian, kamu harus membuat daftar paket harga terlebih dahulu. Paket ini yang dipakai sistem untuk mendeteksi otomatis berapa game yang didapat dari nominal donasi.
            </p>
            <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">1.</span>
                <span>Buka halaman <strong className="text-[var(--text-primary)]">Paket Antrian</strong> dari navbar di atas.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">2.</span>
                <span>Klik <strong className="text-[var(--text-primary)]">+ Tambah Paket</strong> atau gunakan tombol <strong className="text-[var(--text-primary)]">Load Paket Default</strong> untuk mengisi paket bawaan.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">3.</span>
                <span>Tentukan nama paket, nominal (IDR), jalur (<Zap className="w-3 h-3 inline text-[var(--qb-fast-track)]" /> Fast Track atau <ClipboardList className="w-3 h-3 inline text-[var(--qb-normal)]" /> Normal), dan jumlah game.</span>
              </div>
            </div>
            <a href="/dashboard/settings" className="btn btn-secondary btn-sm mt-4 inline-flex">
              Buka Paket Antrian →
            </a>
          </div>
        </div>
      </div>

      {/* Section 2 — Mulai Sesi */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <StepBadge n={2} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Play className="w-5 h-5 text-[var(--qb-success)]" />
              <h2 className="text-base font-semibold">Mulai Sesi Live</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Antrian hanya bisa menerima entry baru saat ada <strong className="text-[var(--text-primary)]">sesi aktif</strong>. Kamu perlu memulai sesi setiap kali mulai live.
            </p>
            <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">1.</span>
                <span>Buka <strong className="text-[var(--text-primary)]">Dashboard</strong> dari navbar.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">2.</span>
                <span>Klik tombol <strong className="text-[var(--text-primary)]">Mulai Sesi</strong> di bagian atas.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">3.</span>
                <span>Antrian sekarang terbuka. Saat selesai live, klik <strong className="text-[var(--text-primary)]">Akhiri Sesi</strong> — penonton dengan game tersisa akan masuk carry-over ke sesi berikutnya.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 — Halaman Publik */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <StepBadge n={3} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-5 h-5 text-[var(--qb-normal)]" />
              <h2 className="text-base font-semibold">Bagikan Link Antrian ke Penonton</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Setiap akun punya halaman antrian publik yang bisa dilihat siapa saja tanpa login. Tempel link ini di deskripsi stream, chat, atau bio.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">Link halaman publik kamu:</p>
            <CopyableUrl value={publicUrl} />
            <p className="text-xs text-[var(--text-muted)] mt-3">
              Penonton bisa melihat posisi antrian mereka secara real-time, tanpa perlu login.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4 — OBS Overlay */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <StepBadge n={4} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="w-5 h-5 text-[var(--qb-accent)]" />
              <h2 className="text-base font-semibold">OBS Overlay</h2>
              <TierBadge label="Pro+" color="var(--qb-accent)" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Tampilkan antrian langsung di layar stream kamu via Browser Source di OBS. Overlay punya background transparan sehingga menyatu dengan scene OBS.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">URL overlay kamu:</p>
            <CopyableUrl value={overlayUrl} />
            <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)] text-xs uppercase tracking-wider">Cara setup di OBS:</p>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">1.</span>
                <span>Di OBS, klik <strong className="text-[var(--text-primary)]">+</strong> di panel Sources → pilih <strong className="text-[var(--text-primary)]">Browser</strong>.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">2.</span>
                <span>Tempel URL overlay di kolom URL.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">3.</span>
                <span>Set <strong className="text-[var(--text-primary)]">Width: 420</strong>, <strong className="text-[var(--text-primary)]">Height: 650</strong>.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">4.</span>
                <span>Centang <strong className="text-[var(--text-primary)]">"Shutdown source when not visible"</strong> agar ringan.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">5.</span>
                <span>Klik OK, lalu atur posisi di canvas sesuai selera.</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-2 rounded-lg">
              Overlay otomatis tersembunyi saat sesi tidak aktif (tidak ada yang tampil di stream).
            </div>
          </div>
        </div>
      </div>

      {/* Section 5 — Webhook Sociabuzz */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <StepBadge n={5} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Webhook className="w-5 h-5 text-[var(--qb-fast-track)]" />
              <h2 className="text-base font-semibold">Integrasi Webhook Sociabuzz</h2>
              <TierBadge label="Pro" color="var(--qb-fast-track)" />
              <TierBadge label="Pro+" color="var(--qb-accent)" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Dengan webhook, setiap donasi dari Sociabuzz yang mengandung ML ID akan otomatis masuk ke antrian — tanpa input manual. Sistem mendeteksi paket secara otomatis dari nominal donasi.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">URL webhook kamu:</p>
            <CopyableUrl value={webhookUrl} />
            <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)] text-xs uppercase tracking-wider">Cara setup di Sociabuzz:</p>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">1.</span>
                <span>Login ke <strong className="text-[var(--text-primary)]">sociabuzz.com</strong> → buka menu profil.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">2.</span>
                <span>Masuk ke <strong className="text-[var(--text-primary)]">Settings → Webhook</strong> (atau Alert Settings).</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">3.</span>
                <span>Tempel URL webhook di atas ke kolom Webhook URL.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--text-muted)]">4.</span>
                <span>Pilih event <strong className="text-[var(--text-primary)]">Donation</strong>. Simpan & klik Test.</span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-2 rounded-lg">
                <strong className="text-[var(--text-primary)]">Format pesan donor:</strong> Donor harus menyertakan <strong className="text-[var(--text-primary)]">ML ID</strong> (angka) di pesan donasi. Contoh: <code className="font-mono">123456789 (1234)</code>
              </div>
              <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-2 rounded-lg">
                Hanya donasi bervaluta <strong className="text-[var(--text-primary)]">IDR</strong> yang diproses. Sesi harus <strong className="text-[var(--text-primary)]">aktif</strong> saat donasi masuk.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6 — Kelola Antrian */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <StepBadge n={6} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-[var(--qb-primary-light)]" />
              <h2 className="text-base font-semibold">Kelola Antrian Saat Live</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Semua kontrol antrian ada di halaman Dashboard. Berikut alur kerja tipikal saat live:
            </p>
            <div className="mt-3 space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="flex gap-3 items-start">
                <span className="badge badge-fast-track shrink-0 mt-0.5">⚡ Fast Track</span>
                <span>Jalur prioritas — dipanggil lebih dulu dari antrian Normal. Biasanya harga lebih tinggi per game.</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="badge badge-normal shrink-0 mt-0.5">Normal</span>
                <span>Jalur standar — dipanggil setelah slot Fast Track habis.</span>
              </div>
              <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)]">→</span>
                  <span>Klik <strong className="text-[var(--text-primary)]">Panggil Berikutnya</strong> untuk memindahkan antrian ke slot "Sedang Main" (maks. 4 slot).</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)]">→</span>
                  <span>Klik <strong className="text-[var(--text-primary)]">Selesai Game</strong> pada slot yang bermain untuk mencatat satu game selesai. Game log otomatis tersimpan.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)]">→</span>
                  <span>Jika penonton tidak hadir, klik <strong className="text-[var(--text-primary)]">Skip</strong> untuk memindahkannya ke seksi Offline. Bisa dipanggil kembali kapan saja.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--text-muted)]">→</span>
                  <span>Penonton dengan game sisa saat sesi berakhir akan muncul otomatis di antrian sesi berikutnya sebagai <strong className="text-[var(--text-primary)]">carry-over</strong>.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
