"use client";

import { useState, useEffect, type FormEvent } from "react";
import type { Package, Jalur } from "@/types";
import { generateId, formatRupiah } from "@/lib/utils";
import { Zap, ClipboardList } from "lucide-react";

interface PackageFormProps {
  /** If provided, form opens in edit mode */
  editPackage?: Package | null;
  /** Called on save with the new/updated package */
  onSave: (pkg: Package) => void;
  /** Called when user cancels / closes */
  onCancel: () => void;
}

export default function PackageForm({
  editPackage,
  onSave,
  onCancel,
}: PackageFormProps) {
  const isEdit = !!editPackage;

  const [name, setName] = useState("");
  const [jalur, setJalur] = useState<Jalur>("normal");
  const [nominal, setNominal] = useState("");
  const [gameCount, setGameCount] = useState("");
  const [isBundle, setIsBundle] = useState(false);
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editPackage) {
      setName(editPackage.name);
      setJalur(editPackage.jalur);
      setNominal(editPackage.nominal.toString());
      setGameCount(editPackage.gameCount.toString());
      setIsBundle(editPackage.isBundle);
    }
  }, [editPackage]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama paket wajib diisi.");
      return;
    }

    const parsedNominal = parseInt(nominal, 10);
    if (!parsedNominal || parsedNominal <= 0) {
      setError("Nominal harus lebih dari 0.");
      return;
    }

    const parsedGameCount = parseInt(gameCount, 10);
    if (!parsedGameCount || parsedGameCount <= 0) {
      setError("Jumlah game harus lebih dari 0.");
      return;
    }

    const pkg: Package = {
      id: editPackage?.id || generateId(),
      name: trimmedName,
      jalur,
      nominal: parsedNominal,
      gameCount: parsedGameCount,
      isBundle: isBundle || parsedGameCount > 1,
    };

    onSave(pkg);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-strong rounded-[var(--radius-xl)] p-6 animate-slide-up shadow-[var(--shadow-lg)]">
        <h2 className="text-lg font-bold mb-5">
          {isEdit ? "Edit Paket" : "Tambah Paket Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Paket */}
          <div>
            <label htmlFor="pkg-name" className="label">
              Nama Paket
            </label>
            <input
              id="pkg-name"
              type="text"
              className="input"
              placeholder='e.g. "1 Game Normal"'
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Jalur */}
          <div>
            <label className="label">Jalur Antrian</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setJalur("normal")}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium border transition-all ${
                  jalur === "normal"
                    ? "bg-[rgba(116,185,255,0.15)] border-[rgba(116,185,255,0.5)] text-[var(--qb-normal)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[rgba(116,185,255,0.3)]"
                }`}
              >
                <><ClipboardList className="w-4 h-4 inline" /> Normal</>
              </button>
              <button
                type="button"
                onClick={() => setJalur("fast_track")}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium border transition-all ${
                  jalur === "fast_track"
                    ? "bg-[rgba(253,203,110,0.15)] border-[rgba(253,203,110,0.5)] text-[var(--qb-fast-track)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[rgba(253,203,110,0.3)]"
                }`}
              >
                <><Zap className="w-4 h-4 inline" /> Fast Track</>
              </button>
            </div>
          </div>

          {/* Nominal & Game Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pkg-nominal" className="label">
                Nominal (Rp)
              </label>
              <input
                id="pkg-nominal"
                type="number"
                className="input"
                placeholder="25000"
                min="1"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="pkg-game-count" className="label">
                Jumlah Game
              </label>
              <input
                id="pkg-game-count"
                type="number"
                className="input"
                placeholder="1"
                min="1"
                value={gameCount}
                onChange={(e) => setGameCount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Preview */}
          {nominal && gameCount && parseInt(gameCount) > 0 && (
            <div className="bg-[var(--bg-glass)] rounded-[var(--radius-md)] px-4 py-3 text-sm">
              <span className="text-[var(--text-muted)]">Preview: </span>
              <span className="font-medium">
                {formatRupiah(parseInt(nominal) || 0)}
              </span>
              <span className="text-[var(--text-muted)]"> untuk </span>
              <span className="font-medium">{gameCount} game</span>
              <span className="text-[var(--text-muted)]"> jalur </span>
              <span
                className={
                  jalur === "fast_track"
                    ? "text-[var(--qb-fast-track)] font-medium"
                    : "text-[var(--qb-normal)] font-medium"
                }
              >
                {jalur === "fast_track" ? "Fast Track" : "Normal"}
              </span>
              {parseInt(gameCount) > 1 && (
                <>
                  <br />
                  <span className="text-[var(--text-muted)]">
                    Harga per game:{" "}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {formatRupiah(
                      Math.round(
                        (parseInt(nominal) || 0) / parseInt(gameCount)
                      )
                    )}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Bundle toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isBundle}
              onChange={(e) => setIsBundle(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--qb-primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">
              Tandai sebagai paket bundle
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="text-sm text-[var(--qb-danger)] bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.2)] rounded-[var(--radius-md)] px-4 py-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary flex-1">
              {isEdit ? "Simpan Perubahan" : "Tambah Paket"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
