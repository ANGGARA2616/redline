"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/hooks/useSession";
import { onGameLogs } from "@/lib/firestore";
import { formatTime, formatDate } from "@/lib/utils";
import type { GameLog } from "@/types";

export default function GameLogPage() {
  const { user } = useAuth();
  const { activeSession } = useSession();
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSession) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const unsub = onGameLogs(activeSession.id, (data) => {
      setLogs(data);
      setLoading(false);
    });

    return unsub;
  }, [activeSession]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Game Log</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {activeSession
            ? "Riwayat semua game yang sudah dimainkan di sesi ini"
            : "Mulai sesi live untuk melihat game log"}
        </p>
      </div>

      {/* No active session */}
      {!activeSession && !loading && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-semibold mb-2">Tidak Ada Sesi Aktif</h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Game log akan muncul di sini saat ada sesi live yang aktif.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-pulse text-[var(--text-secondary)]">Memuat log...</div>
        </div>
      )}

      {/* Empty log */}
      {activeSession && !loading && logs.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-semibold mb-2">Belum Ada Game</h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Game log akan terisi otomatis saat kamu menyelesaikan game di dashboard.
          </p>
        </div>
      )}

      {/* Log table */}
      {logs.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <div className="badge badge-success">{logs.length} game tercatat</div>
            {activeSession && (
              <span className="text-xs text-[var(--text-muted)]">
                Sesi dimulai: {formatDate(activeSession.createdAt.toDate())}{" "}
                {formatTime(activeSession.createdAt.toDate())}
              </span>
            )}
          </div>

          {/* Info banner */}
          <div className="bg-[var(--bg-glass)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">🔒 Read-only: </span>
            Log ini tidak bisa diubah atau dihapus. Setiap game tercatat dengan timestamp sebagai bukti.
          </div>

          {/* Log entries */}
          <div className="space-y-2">
            {logs.map((log, i) => {
              const startTime = log.startedAt?.toDate
                ? formatTime(log.startedAt.toDate())
                : "--:--";
              const endTime = log.endedAt?.toDate
                ? formatTime(log.endedAt.toDate())
                : "...";

              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Index */}
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)] shrink-0">
                    {logs.length - i}
                  </div>

                  {/* ML ID */}
                  <div className="flex-1 min-w-0">
                    <span className="font-mono font-semibold text-sm tracking-wide">
                      {log.mlId}
                    </span>
                  </div>

                  {/* Game number */}
                  <div className="text-sm text-[var(--text-secondary)] shrink-0">
                    Game {log.gameNumber}
                  </div>

                  {/* Time range */}
                  <div className="text-xs text-[var(--text-muted)] tabular-nums shrink-0">
                    {startTime} → {endTime}
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    {log.endedAt ? (
                      <span className="w-2 h-2 rounded-full bg-[var(--qb-success)] inline-block" title="Selesai" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[var(--qb-warning)] inline-block animate-pulse" title="Sedang bermain" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
