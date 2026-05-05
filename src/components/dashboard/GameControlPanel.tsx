"use client";

import { useState } from "react";

import type { QueueEntry } from "@/types";
import { MAX_SLOTS } from "@/hooks/useQueue";
import { Square, SkipForward, Zap, ClipboardList } from "lucide-react";

interface GameControlPanelProps {
  playingEntries: QueueEntry[];
  onFinishGame: (entryId: string) => void;
  onFinishAllGames: () => void;
  onSkip: (entryId: string) => void;
  onManualCall: (entryId: string) => void;
  onSwapPlayingEntry: (newEntryId: string, oldEntryId: string) => void;
  loadingEntryId?: string | null;
  loadingAll?: boolean;
}

export default function GameControlPanel({
  playingEntries,
  onFinishGame,
  onFinishAllGames,
  onSkip,
  onManualCall,
  onSwapPlayingEntry,
  loadingEntryId,
  loadingAll,
}: GameControlPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverEntryId, setDragOverEntryId] = useState<string | null>(null);

  return (
    <div 
      className={`space-y-3 p-2 -m-2 rounded-[var(--radius-lg)] transition-all ${isDragOver ? "bg-[rgba(108,92,231,0.08)] border border-dashed border-[var(--qb-primary)]" : "border border-transparent"}`}
      onDragOver={(e) => {
        if (playingEntries.length < MAX_SLOTS) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const entryId = e.dataTransfer.getData("entryId");
        if (entryId) {
          onManualCall(entryId);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="badge badge-live">
            <span className="w-2 h-2 rounded-full bg-[var(--qb-danger)] animate-pulse" />
            SEDANG BERMAIN
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {playingEntries.length}/{MAX_SLOTS} slot terisi
          </span>
        </div>
        
        {playingEntries.length > 1 && (
          <button
            onClick={onFinishAllGames}
            className="btn btn-accent btn-sm"
            disabled={loadingAll}
          >
            {loadingAll ? "Memproses..." : <><Square className="w-4 h-4 mr-1 inline" /> Selesai Semua</>}
          </button>
        )}
      </div>

      {/* Slot grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
        {playingEntries.map((entry) => {
          const gameNumber = entry.gamesPlayed + 1;
          const isLoading = loadingAll || loadingEntryId === entry.id;
          const progress = (gameNumber / entry.totalGames) * 100;

          return (
            <div
              key={entry.id}
              className={`card relative overflow-hidden transition-all ${
                dragOverEntryId === entry.id
                  ? "scale-[1.02] border-[var(--qb-primary)] shadow-[0_0_15px_rgba(108,92,231,0.3)] z-10"
                  : "border-[rgba(108,92,231,0.35)] bg-[rgba(108,92,231,0.06)]"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverEntryId(entry.id);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOverEntryId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverEntryId(null);
                const newEntryId = e.dataTransfer.getData("entryId");
                if (newEntryId && newEntryId !== entry.id) {
                  onSwapPlayingEntry(newEntryId, entry.id);
                }
              }}
            >
              {dragOverEntryId === entry.id && (
                <div className="absolute inset-0 bg-[rgba(108,92,231,0.15)] flex items-center justify-center z-20 backdrop-blur-sm">
                  <span className="font-bold text-white tracking-widest drop-shadow-md">GANTI POSISI</span>
                </div>
              )}
              {/* Accent */}
              <div
                className={`absolute top-0 left-0 w-full h-[2px] ${
                  entry.jalur === "fast_track"
                    ? "bg-gradient-to-r from-[var(--qb-fast-track)] to-[var(--qb-fast-track-dark)]"
                    : "bg-gradient-to-r from-[var(--qb-primary)] to-[var(--qb-accent)]"
                }`}
              />

              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-lg font-mono font-bold tracking-wider">
                  {entry.mlId}
                </p>
                <span
                  className={`badge text-[0.6rem] ${
                    entry.jalur === "fast_track" ? "badge-fast-track" : "badge-normal"
                  }`}
                >
                  {entry.jalur === "fast_track" ? (
                    <><Zap className="w-3 h-3 inline mr-1" /> Fast Track</>
                  ) : (
                    <><ClipboardList className="w-3 h-3 inline mr-1" /> Normal</>
                  )}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                  <span>Game {gameNumber} / {entry.totalGames}</span>
                  <span>{entry.gamesRemaining} sisa</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--qb-primary)] to-[var(--qb-accent)] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onFinishGame(entry.id)}
                  className="btn btn-accent flex-1 btn-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Memproses..." : <><Square className="w-4 h-4 mr-1 inline" /> Selesai</>}
                </button>
                <button
                  onClick={() => onSkip(entry.id)}
                  className="btn btn-secondary btn-sm px-3"
                  title="Skip / Offline"
                  disabled={isLoading}
                >
                  <SkipForward className="w-4 h-4 mr-1 inline" /> Skip
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty slots */}
        {Array.from({ length: MAX_SLOTS - playingEntries.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className={`border border-dashed border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-6 flex items-center justify-center text-sm text-[var(--text-muted)] transition-colors ${isDragOver ? "bg-[rgba(108,92,231,0.1)] border-[var(--qb-primary)]" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const entryId = e.dataTransfer.getData("entryId");
              if (entryId) {
                onManualCall(entryId);
              }
            }}
          >
            {isDragOver ? "Lepaskan ke sini" : "Slot kosong (Tarik antrean ke sini)"}
          </div>
        ))}
      </div>
    </div>
  );
}
