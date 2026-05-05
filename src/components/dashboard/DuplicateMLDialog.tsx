"use client";

import { useState } from "react";
import type { QueueEntry, Package, Jalur } from "@/types";
import { autoDetectPackage, describeDetectResult } from "@/lib/autoDetect";
import { formatRupiah } from "@/lib/utils";
import { User, Zap, ClipboardList, Plus, RefreshCw } from "lucide-react";

interface DuplicateMLDialogProps {
  mlId: string;
  existingEntry: QueueEntry;
  newNominal: number;
  newGameCount: number;
  newJalur: Jalur;
  packages: Package[];
  onAddGames: () => void;
  onUpgrade: () => void;
  onRecalculate: (jalur: Jalur, gameCount: number, totalNominal: number) => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

export default function DuplicateMLDialog({
  mlId,
  existingEntry,
  newNominal,
  newGameCount,
  newJalur,
  packages,
  onAddGames,
  onUpgrade,
  onRecalculate,
  onCreateNew,
  onCancel,
}: DuplicateMLDialogProps) {
  const [showRecalc, setShowRecalc] = useState(false);
  const [recalcJalur, setRecalcJalur] = useState<Jalur>("fast_track");
  const [recalcGames, setRecalcGames] = useState("1");

  // Calculate remaining nominal value from existing entry
  // Use per-game price from matching package, or estimate from nominalDonasi
  const existingRemainingNominal = existingEntry.gamesRemaining > 0
    ? Math.round(
        (existingEntry.nominalDonasi / existingEntry.totalGames) *
          existingEntry.gamesRemaining
      )
    : 0;

  const combinedNominal = existingRemainingNominal + newNominal;

  // Try auto-detect on combined nominal
  const recalcResult = autoDetectPackage(combinedNominal, packages);

  // Pre-fill recalc if auto-detect matched
  const autoRecalcGames = recalcResult.matched ? recalcResult.gameCount : 0;
  const autoRecalcJalur = recalcResult.matched ? recalcResult.jalur : "fast_track";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md glass-strong rounded-[var(--radius-xl)] p-6 animate-slide-up shadow-[var(--shadow-lg)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[rgba(116,185,255,0.15)] flex items-center justify-center">
            <User className="w-5 h-5 text-[var(--qb-normal)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">ML ID Sudah Ada</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-mono">{mlId}</span> punya antrian aktif
            </p>
          </div>
        </div>

        {/* Current entry info */}
        <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-md)] px-4 py-3 mb-3">
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Antrian Saat Ini</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Jalur</span>
              <span className="font-medium flex items-center gap-1">{existingEntry.jalur === "fast_track" ? <><Zap className="w-3.5 h-3.5 text-[var(--qb-fast-track)]" /> Fast Track</> : <><ClipboardList className="w-3.5 h-3.5 text-[var(--qb-normal)]" /> Normal</>}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Game</span>
              <span className="font-medium">{existingEntry.gamesPlayed}/{existingEntry.totalGames} dimainkan · {existingEntry.gamesRemaining} sisa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Donasi</span>
              <span className="font-medium">{formatRupiah(existingEntry.nominalDonasi)}</span>
            </div>
            <div className="flex justify-between text-[var(--qb-primary-light)]">
              <span>Sisa nilai</span>
              <span className="font-semibold">{formatRupiah(existingRemainingNominal)}</span>
            </div>
          </div>
        </div>

        {/* New donation info */}
        <div className="bg-[rgba(0,184,148,0.06)] border border-[rgba(0,184,148,0.2)] rounded-[var(--radius-md)] px-4 py-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Donasi baru</span>
            <span className="font-semibold text-[var(--qb-success)]">+ {formatRupiah(newNominal)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1 pt-1 border-t border-[rgba(0,184,148,0.15)]">
            <span className="font-medium">Total gabungan</span>
            <span className="font-bold">{formatRupiah(combinedNominal)}</span>
          </div>
          {recalcResult.matched && (
            <p className="text-xs text-[var(--qb-success)] mt-2">
              ✓ Auto-detect: {describeDetectResult(recalcResult)}
            </p>
          )}
        </div>

        {/* Options */}
        {!showRecalc ? (
          <div className="space-y-2.5">
            {/* Option 1: Add games (same lane) */}
            <button onClick={onAddGames} className="btn btn-primary w-full justify-start gap-3">
              <Plus className="w-5 h-5 text-[var(--bg-base)]" />
              <div className="text-left">
                <p className="font-semibold">Tambah {newGameCount} Game</p>
                <p className="text-xs opacity-70 font-normal">
                  Total jadi {existingEntry.gamesRemaining + newGameCount} game di jalur yang sama
                </p>
              </div>
            </button>

            {/* Option 2: Recalculate (combined nominal → new lane/games) */}
            {recalcResult.matched ? (
              <button
                onClick={() => onRecalculate(autoRecalcJalur, autoRecalcGames, combinedNominal)}
                className="btn btn-accent w-full justify-start gap-3"
              >
                <RefreshCw className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Recalculate → {describeDetectResult(recalcResult)}</p>
                  <p className="text-xs opacity-70 font-normal">
                    Gabung nominal: {formatRupiah(combinedNominal)} → {autoRecalcGames} game{" "}
                    {autoRecalcJalur === "fast_track" ? "Fast Track" : "Normal"}
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setShowRecalc(true)}
                className="btn btn-accent w-full justify-start gap-3"
              >
                <RefreshCw className="w-5 h-5 text-[var(--text-secondary)]" />
                <div className="text-left">
                  <p className="font-semibold">Recalculate Manual</p>
                  <p className="text-xs opacity-70 font-normal">
                    Gabung {formatRupiah(combinedNominal)} dan tentukan jalur + game baru
                  </p>
                </div>
              </button>
            )}

            {/* Option 3: Simple upgrade (no recalc) */}
            {existingEntry.jalur === "normal" && (
              <button onClick={onUpgrade} className="btn btn-secondary w-full justify-start gap-3">
                <Zap className="w-5 h-5 text-[var(--qb-fast-track)]" />
                <div className="text-left">
                  <p className="font-semibold">Upgrade ke Fast Track</p>
                  <p className="text-xs opacity-70 font-normal">
                    Pindah jalur saja, game count tetap {existingEntry.gamesRemaining}
                  </p>
                </div>
              </button>
            )}

            {/* Option 4: Create new entry */}
            <button onClick={onCreateNew} className="btn btn-secondary w-full justify-start gap-3">
              <ClipboardList className="w-5 h-5 text-[var(--text-secondary)]" />
              <div className="text-left">
                <p className="font-semibold">Buat Entry Terpisah</p>
                <p className="text-xs opacity-70 font-normal">Antrian baru, tidak digabung</p>
              </div>
            </button>

            <button onClick={onCancel} className="btn btn-ghost w-full mt-1 text-sm">Batal</button>
          </div>
        ) : (
          /* Manual recalculate form */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const count = parseInt(recalcGames, 10);
              if (count > 0) onRecalculate(recalcJalur, count, combinedNominal);
            }}
            className="space-y-4"
          >
            <p className="text-sm font-medium">
              Total nominal gabungan: <span className="text-[var(--qb-accent)]">{formatRupiah(combinedNominal)}</span>
            </p>
            <div>
              <label className="label">Jalur Baru</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setRecalcJalur("normal")}
                  className={`px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium border transition-all ${recalcJalur === "normal" ? "bg-[rgba(116,185,255,0.15)] border-[rgba(116,185,255,0.5)] text-[var(--qb-normal)]" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)]"}`}>
                  <span className="flex items-center justify-center gap-1.5"><ClipboardList className="w-4 h-4" /> Normal</span>
                </button>
                <button type="button" onClick={() => setRecalcJalur("fast_track")}
                  className={`px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium border transition-all ${recalcJalur === "fast_track" ? "bg-[rgba(253,203,110,0.15)] border-[rgba(253,203,110,0.5)] text-[var(--qb-fast-track)]" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)]"}`}>
                  <span className="flex items-center justify-center gap-1.5"><Zap className="w-4 h-4" /> Fast Track</span>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="recalc-games" className="label">Jumlah Game (sisa baru)</label>
              <input id="recalc-games" type="number" className="input" min="1" value={recalcGames} onChange={(e) => setRecalcGames(e.target.value)} required />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1">Apply Recalculate</button>
              <button type="button" onClick={() => setShowRecalc(false)} className="btn btn-secondary">Kembali</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
