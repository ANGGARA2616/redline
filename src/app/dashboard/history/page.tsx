"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { formatDate, formatTime } from "@/lib/utils";
import type { Session, GameLog } from "@/types";

export default function SessionHistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<(Session & { logCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<GameLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const q = query(
        collection(getFirebaseDb(), "sessions"),
        where("streamerId", "==", user!.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const items: (Session & { logCount: number })[] = [];
      for (const d of snap.docs) {
        const s = { id: d.id, ...d.data() } as Session;
        const logSnap = await getDocs(
          query(collection(getFirebaseDb(), "gameLogs"), where("sessionId", "==", d.id))
        );
        items.push({ ...s, logCount: logSnap.size });
      }
      setSessions(items);
      setLoading(false);
    }
    load();
  }, [user]);

  async function toggleExpand(sid: string) {
    if (expandedId === sid) { setExpandedId(null); return; }
    setExpandedId(sid);
    setLogsLoading(true);
    const q = query(collection(getFirebaseDb(), "gameLogs"), where("sessionId", "==", sid), orderBy("startedAt", "desc"));
    const snap = await getDocs(q);
    setExpandedLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GameLog)));
    setLogsLoading(false);
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-pulse text-[var(--text-secondary)]">Memuat...</div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Sesi</h1>
        <p className="text-sm text-[var(--text-secondary)]">Semua sesi live yang pernah kamu buat</p>
      </div>

      {sessions.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📁</div>
          <h2 className="text-xl font-semibold mb-2">Belum Ada Riwayat</h2>
          <p className="text-[var(--text-secondary)]">Riwayat muncul setelah kamu membuat sesi live.</p>
        </div>
      )}

      {sessions.map((session) => {
        const isExp = expandedId === session.id;
        const start = session.createdAt?.toDate ? session.createdAt.toDate() : new Date();
        const end = session.endedAt?.toDate ? session.endedAt.toDate() : null;
        let dur = "";
        if (end) { const d = end.getTime() - start.getTime(); const h = Math.floor(d/3600000); const m = Math.floor((d%3600000)/60000); dur = h > 0 ? `${h}j ${m}m` : `${m}m`; }

        return (
          <div key={session.id}>
            <button onClick={() => toggleExpand(session.id)} className="card w-full text-left hover:border-[rgba(108,92,231,0.3)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${session.status === "active" ? "bg-[rgba(255,107,107,0.15)]" : "bg-[var(--bg-elevated)]"}`}>
                    {session.status === "active" ? "🔴" : "📁"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{formatDate(start)}</p>
                      {session.status === "active" && <span className="badge badge-live text-[0.6rem]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--qb-danger)] animate-pulse"/>AKTIF</span>}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{formatTime(start)}{end && ` → ${formatTime(end)}`}{dur && ` · ${dur}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right"><p className="text-sm font-semibold">{session.logCount}</p><p className="text-[0.65rem] text-[var(--text-muted)]">game</p></div>
                  <span className={`text-[var(--text-muted)] transition-transform ${isExp ? "rotate-180" : ""}`}>▾</span>
                </div>
              </div>
            </button>
            {isExp && (
              <div className="mt-2 ml-6 border-l-2 border-[var(--border-default)] pl-4 space-y-1.5 animate-fade-in">
                {logsLoading ? <p className="text-sm text-[var(--text-muted)] py-3 animate-pulse">Memuat log...</p>
                 : expandedLogs.length === 0 ? <p className="text-sm text-[var(--text-muted)] py-3">Tidak ada game tercatat.</p>
                 : expandedLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-elevated)] rounded-[var(--radius-sm)] text-sm">
                    <span className="font-mono font-semibold text-xs">{log.mlId}</span>
                    <span className="text-[var(--text-muted)]">Game {log.gameNumber}</span>
                    <span className="text-xs text-[var(--text-muted)] tabular-nums ml-auto">
                      {log.startedAt?.toDate ? formatTime(log.startedAt.toDate()) : "--:--"} → {log.endedAt?.toDate ? formatTime(log.endedAt.toDate()) : "..."}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
