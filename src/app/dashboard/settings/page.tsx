"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserPackages } from "@/lib/firestore";
import PackageCard from "@/components/dashboard/PackageCard";
import PackageForm from "@/components/dashboard/PackageForm";
import type { Package } from "@/types";
import { generateId, formatRupiah } from "@/lib/utils";

// Default suggested packages per PRD section 3.2
const DEFAULT_PACKAGES: Package[] = [
  {
    id: generateId(),
    name: "1 Game Normal",
    jalur: "normal",
    nominal: 25000,
    gameCount: 1,
    isBundle: false,
  },
  {
    id: generateId(),
    name: "1 Game Fast Track",
    jalur: "fast_track",
    nominal: 51000,
    gameCount: 1,
    isBundle: false,
  },
  {
    id: generateId(),
    name: "5 Game Normal (Bundle)",
    jalur: "normal",
    nominal: 110000,
    gameCount: 5,
    isBundle: true,
  },
];

export default function DashboardSettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const packages = user?.packages || [];

  // ── Show toast briefly ──
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Save packages to Firestore ──
  const savePackages = useCallback(
    async (updated: Package[]) => {
      if (!user) return;
      setSaving(true);
      try {
        await updateUserPackages(user.uid, updated);
        await refreshProfile();
      } catch (err) {
        console.error("Failed to save packages:", err);
        showToast("Gagal menyimpan. Coba lagi.");
      } finally {
        setSaving(false);
      }
    },
    [user, refreshProfile, showToast]
  );

  // ── Add or update package ──
  const handleSave = useCallback(
    async (pkg: Package) => {
      const isEdit = packages.some((p) => p.id === pkg.id);
      const updated = isEdit
        ? packages.map((p) => (p.id === pkg.id ? pkg : p))
        : [...packages, pkg];

      await savePackages(updated);
      setShowForm(false);
      setEditPkg(null);
      showToast(isEdit ? "Paket berhasil diupdate." : "Paket berhasil ditambahkan.");
    },
    [packages, savePackages, showToast]
  );

  // ── Delete package ──
  const handleDelete = useCallback(
    async (id: string) => {
      const updated = packages.filter((p) => p.id !== id);
      await savePackages(updated);
      showToast("Paket dihapus.");
    },
    [packages, savePackages, showToast]
  );

  // ── Load default packages ──
  const handleLoadDefaults = useCallback(async () => {
    await savePackages(DEFAULT_PACKAGES);
    showToast("Paket default berhasil dimuat.");
  }, [savePackages, showToast]);

  // ── Edit handler ──
  const handleEdit = useCallback((pkg: Package) => {
    setEditPkg(pkg);
    setShowForm(true);
  }, []);

  // ── Close form ──
  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditPkg(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Paket Harga</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Atur daftar paket harga main bareng. Sistem akan auto-detect
            nominal donasi berdasarkan paket ini.
          </p>
        </div>
        <button
          onClick={() => {
            setEditPkg(null);
            setShowForm(true);
          }}
          className="btn btn-primary shrink-0"
          disabled={saving}
        >
          + Tambah Paket
        </button>
      </div>

      {/* Empty state */}
      {packages.length === 0 && (
        <div className="card text-center py-14">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-xl font-semibold mb-2">Belum Ada Paket</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Buat paket harga agar sistem bisa otomatis mendeteksi nominal
            donasi dari customer kamu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLoadDefaults}
              className="btn btn-accent"
              disabled={saving}
            >
              ⚡ Muat Paket Default
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-secondary"
              disabled={saving}
            >
              Buat Manual
            </button>
          </div>
          <div className="mt-6 text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            <p className="font-medium mb-2">Paket default yang disarankan:</p>
            <ul className="space-y-1 text-left inline-block">
              {DEFAULT_PACKAGES.map((pkg) => (
                <li key={pkg.id} className="flex items-center gap-2">
                  <span>{pkg.jalur === "fast_track" ? "⚡" : "📋"}</span>
                  <span>
                    {pkg.name} — {formatRupiah(pkg.nominal)} ({pkg.gameCount}{" "}
                    game)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Package list */}
      {packages.length > 0 && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card py-3 px-4 text-center">
              <p className="text-2xl font-bold">{packages.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Total Paket</p>
            </div>
            <div className="card py-3 px-4 text-center">
              <p className="text-2xl font-bold text-[var(--qb-normal)]">
                {packages.filter((p) => p.jalur === "normal").length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Normal</p>
            </div>
            <div className="card py-3 px-4 text-center">
              <p className="text-2xl font-bold text-[var(--qb-fast-track)]">
                {packages.filter((p) => p.jalur === "fast_track").length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Fast Track</p>
            </div>
            <div className="card py-3 px-4 text-center">
              <p className="text-2xl font-bold text-[var(--qb-success)]">
                {packages.filter((p) => p.isBundle).length}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Bundle</p>
            </div>
          </div>

          {/* Auto-detect info */}
          <div className="bg-[var(--bg-glass)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">
              💡 Cara kerja auto-detect:{" "}
            </span>
            Saat input order, sistem akan mencocokkan nominal donasi secara
            otomatis: bundle (exact match) → fast track (kelipatan) → normal
            (kelipatan). Jika tidak cocok, kamu pilih manual.
          </div>

          {/* Cards */}
          <div className="grid gap-3">
            {/* Fast Track packages first */}
            {packages.filter((p) => p.jalur === "fast_track").length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--qb-fast-track)] mb-2 flex items-center gap-1.5">
                  ⚡ Fast Track
                </h3>
                <div className="grid gap-3">
                  {packages
                    .filter((p) => p.jalur === "fast_track")
                    .map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Normal packages */}
            {packages.filter((p) => p.jalur === "normal").length > 0 && (
              <div className="mt-2">
                <h3 className="text-sm font-semibold text-[var(--qb-normal)] mb-2 flex items-center gap-1.5">
                  📋 Normal
                </h3>
                <div className="grid gap-3">
                  {packages
                    .filter((p) => p.jalur === "normal")
                    .map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal form */}
      {showForm && (
        <PackageForm
          editPackage={editPkg}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
          <div className="glass-strong rounded-[var(--radius-full)] px-5 py-2.5 text-sm font-medium shadow-[var(--shadow-lg)]">
            {toast}
          </div>
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-[150] bg-black/20 flex items-center justify-center pointer-events-none">
          <div className="glass-strong rounded-[var(--radius-lg)] px-6 py-4 flex items-center gap-3 shadow-[var(--shadow-lg)]">
            <svg
              className="animate-spin h-5 w-5 text-[var(--qb-primary)]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-sm font-medium">Menyimpan...</span>
          </div>
        </div>
      )}
    </div>
  );
}
