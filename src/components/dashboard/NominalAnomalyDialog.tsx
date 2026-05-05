"use client";

import { useState, type FormEvent } from "react";
import type { Package, Jalur } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { AlertTriangle, Zap, ClipboardList } from "lucide-react";

interface NominalAnomalyDialogProps {
  nominal: number;
  mlId: string;
  packages: Package[];
  onConfirm: (jalur: Jalur, gameCount: number) => void;
  onCancel: () => void;
}

export default function NominalAnomalyDialog({
  nominal,
  mlId,
  packages,
  onConfirm,
  onCancel,
}: NominalAnomalyDialogProps) {
  const [jalur, setJalur] = useState<Jalur>("normal");
  const [gameCount, setGameCount] = useState("1");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const count = parseInt(gameCount, 10);
    if (count > 0) onConfirm(jalur, count);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md glass-strong rounded-[var(--radius-xl)] p-6 animate-slide-up shadow-[var(--shadow-lg)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[rgba(253,203,110,0.15)] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[var(--qb-warning)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Nominal Tidak Dikenal</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {formatRupiah(nominal)} — ML ID: {mlId}
            </p>
          </div>
        </div>

        {/* Reference: available packages */}
        <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] px-4 py-3 mb-5">
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
            Paket Tersedia
          </p>
          <div className="space-y-1.5">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                  {pkg.jalur === "fast_track" ? <Zap className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />} {pkg.name}
                </span>
                <span className="text-[var(--text-muted)] font-mono text-xs">
                  {formatRupiah(pkg.nominal)}
                </span>
              </div>
            ))}
            {packages.length === 0 && (
              <p className="text-xs text-[var(--text-muted)]">Belum ada paket.</p>
            )}
          </div>
        </div>

        {/* Manual input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Pilih Jalur</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setJalur("normal")}
                className={`px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium border transition-all ${
                  jalur === "normal"
                    ? "bg-[rgba(116,185,255,0.15)] border-[rgba(116,185,255,0.5)] text-[var(--qb-normal)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><ClipboardList className="w-4 h-4" /> Normal</span>
              </button>
              <button
                type="button"
                onClick={() => setJalur("fast_track")}
                className={`px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium border transition-all ${
                  jalur === "fast_track"
                    ? "bg-[rgba(253,203,110,0.15)] border-[rgba(253,203,110,0.5)] text-[var(--qb-fast-track)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5"><Zap className="w-4 h-4" /> Fast Track</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="anomaly-game-count" className="label">Jumlah Game</label>
            <input
              id="anomaly-game-count"
              type="number"
              className="input"
              min="1"
              value={gameCount}
              onChange={(e) => setGameCount(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn btn-primary flex-1">
              Approve Manual
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
