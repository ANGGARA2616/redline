"use client";

import type { QueueEntry } from "@/types";
import { formatTime, cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface QueueCardProps {
  entry: QueueEntry;
  position: number;
  compact?: boolean;
  onSkip?: () => void;
  onReturn?: () => void;
  onAdd?: () => void;
}

export default function QueueCard({
  entry,
  position,
  compact = false,
  onSkip,
  onReturn,
  onAdd,
}: QueueCardProps) {
  const timeSource = entry.createdAt || entry.orderedAt;
  const timeStr = timeSource?.toDate
    ? formatTime(timeSource.toDate())
    : "--:--";

  const isDraggable = entry.status === "waiting" || entry.status === "offline";

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => {
        if (isDraggable) {
          e.dataTransfer.setData("entryId", entry.id);
        }
      }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border transition-all",
        isDraggable && "cursor-grab active:cursor-grabbing",
        entry.status === "playing"
          ? "bg-[rgba(108,92,231,0.12)] border-[rgba(108,92,231,0.4)] shadow-[0_0_20px_rgba(108,92,231,0.15)]"
          : "bg-[var(--bg-elevated)] border-[var(--border-default)] hover:border-[rgba(167,169,190,0.3)]",
        compact && "py-2"
      )}
    >
      {/* Position number */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          entry.jalur === "fast_track"
            ? "bg-[rgba(253,203,110,0.15)] text-[var(--qb-fast-track)]"
            : "bg-[rgba(116,185,255,0.15)] text-[var(--qb-normal)]"
        )}
      >
        {position}
      </div>

      {/* ML ID */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-sm tracking-wide">
            {entry.mlId}
          </span>
          {entry.isCarryOver && (
            <span className="badge badge-carry-over text-[0.6rem]">
              🔄 CARRY-OVER
            </span>
          )}
          {entry.approvalType === "manual" && (
            <span className="badge bg-[rgba(253,203,110,0.1)] text-[var(--qb-warning)] border border-[rgba(253,203,110,0.25)] text-[0.6rem]">
              MANUAL
            </span>
          )}
        </div>
      </div>

      {/* Game count */}
      <div className="text-right shrink-0">
        <span className="text-sm font-semibold">
          {entry.gamesRemaining}
        </span>
        <span className="text-xs text-[var(--text-muted)]"> game</span>
      </div>

      {/* Actions / Timestamp */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        {!compact && (
          <div className="text-xs text-[var(--text-muted)] tabular-nums">
            {timeStr}
          </div>
        )}
        {(onSkip || onReturn || onAdd) && (
          <div className="flex gap-1 mt-1">
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center justify-center h-7 w-7 rounded border border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-colors"
                title="Tambahkan ke antrean bermain"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            {onSkip && (
              <button
                onClick={onSkip}
                className="btn btn-ghost btn-sm h-6 text-[0.65rem] px-2 text-[var(--qb-warning)] hover:bg-[rgba(253,203,110,0.1)]"
                title="Skip antrian (Offline)"
              >
                Skip
              </button>
            )}
            {onReturn && (
              <button
                onClick={onReturn}
                className="btn btn-ghost btn-sm h-6 text-[0.65rem] px-2 text-[var(--qb-success)] hover:bg-[rgba(0,184,148,0.1)]"
                title="Kembalikan ke antrian"
              >
                Kembalikan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
