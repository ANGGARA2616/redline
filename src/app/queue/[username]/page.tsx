"use client";

import { useState, useEffect, use } from "react";
import { getFirebaseDb } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { formatTime } from "@/lib/utils";
import type { QueueEntry, Session } from "@/types";
import { Gamepad2, Frown, Moon, Zap, ClipboardList, RefreshCw, Search } from "lucide-react";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function PublicQueuePage({ params }: PageProps) {
  const { username } = use(params);
  const [streamerName, setStreamerName] = useState<string | null>(null);
  const [streamerId, setStreamerId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchMlId, setSearchMlId] = useState("");

  // Look up streamer directly from Firestore (client-side)
  useEffect(() => {
    const slug = username.toLowerCase();
    const ref = doc(getFirebaseDb(), "usernames", slug);

    getDoc(ref).then((snap) => {
      if (!snap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = snap.data();
      setStreamerName(data.displayName || slug);
      setStreamerId(data.uid);
    }).catch(() => {
      setNotFound(true);
      setLoading(false);
    });
  }, [username]);

  // Listen for active session once we have streamerId
  useEffect(() => {
    if (!streamerId) return;

    const sessQ = query(
      collection(getFirebaseDb(), "sessions"),
      where("streamerId", "==", streamerId),
      where("status", "==", "active")
    );

    const unsub = onSnapshot(sessQ, (snap) => {
      if (snap.empty) {
        setSession(null);
        setEntries([]);
        setLoading(false);
        return;
      }
      const s = { id: snap.docs[0].id, ...snap.docs[0].data() } as Session;
      setSession(s);
      setLoading(false);
    });

    return () => unsub();
  }, [streamerId]);

  // Listen to queue entries when session changes
  useEffect(() => {
    if (!session) { setEntries([]); return; }
    const q = query(
      collection(getFirebaseDb(), "queueEntries"),
      where("sessionId", "==", session.id),
      orderBy("orderedAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QueueEntry)));
    });
    return () => unsub();
  }, [session]);

  const fastTrack = entries.filter((e) => e.jalur === "fast_track" && e.status === "waiting");
  const normal = entries.filter((e) => e.jalur === "normal" && e.status === "waiting");
  const playingEntries = entries.filter((e) => e.status === "playing");
  const searchLower = searchMlId.trim().toLowerCase();
  const isMatch = (mlId: string) => searchLower && mlId.toLowerCase().includes(searchLower);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Gamepad2 className="w-10 h-10 text-[var(--qb-primary-light)]" />
          <p className="text-[var(--text-secondary)]">Memuat antrian...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Frown className="w-12 h-12 text-[var(--qb-danger)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Streamer Tidak Ditemukan</h1>
          <p className="text-[var(--text-secondary)]">Username &quot;{username}&quot; tidak terdaftar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-strong border-b border-[var(--border-default)] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[var(--qb-primary)]" />
            <div>
              <p className="font-bold text-sm">{streamerName}</p>
              <p className="text-[0.65rem] text-[var(--text-muted)]">@{username}</p>
            </div>
          </div>
          {session ? (
            <span className="badge badge-live"><span className="w-2 h-2 rounded-full bg-[var(--qb-danger)] animate-pulse"/>LIVE</span>
          ) : (
            <span className="badge bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)]">OFFLINE</span>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {/* No session */}
        {!session && (
          <div className="text-center py-16">
            <Moon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Tidak Ada Sesi Aktif</h2>
            <p className="text-sm text-[var(--text-secondary)]">{streamerName} belum memulai sesi live.</p>
          </div>
        )}

        {session && (
          <div className="space-y-5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                className="input pl-9"
                placeholder="Cari ML ID kamu..."
                value={searchMlId}
                onChange={(e) => setSearchMlId(e.target.value)}
              />
            </div>

            {/* Currently playing */}
            {playingEntries.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider flex items-center gap-1"><Gamepad2 className="w-4 h-4" /> Sedang Bermain ({playingEntries.length}/4)</h2>
                {playingEntries.map(playing => (
                  <div key={playing.id} className="card border-[rgba(108,92,231,0.4)] bg-[rgba(108,92,231,0.08)] py-3 px-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-live text-[0.6rem]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--qb-danger)] animate-pulse"/>LIVE</span>
                      <span className={`badge text-[0.6rem] ${playing.jalur === "fast_track" ? "badge-fast-track" : "badge-normal"}`}>
                        {playing.jalur === "fast_track" ? <><Zap className="w-3 h-3 inline mr-0.5" /> Fast Track</> : <><ClipboardList className="w-3 h-3 inline mr-0.5" /> Normal</>}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`font-mono font-bold text-lg ${isMatch(playing.mlId) ? "text-[var(--qb-accent)]" : ""}`}>{playing.mlId}</span>
                      <span className="text-sm text-[var(--text-secondary)]">Game {playing.gamesPlayed + 1}/{playing.totalGames}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fast Track */}
            <div>
              <h2 className="text-sm font-semibold text-[var(--qb-fast-track)] mb-2 flex items-center gap-1"><Zap className="w-4 h-4" /> Fast Track ({fastTrack.length})</h2>
              {fastTrack.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] px-4 py-3 text-center">Kosong</p>
              ) : (
                <div className="space-y-1.5">
                  {fastTrack.map((e, i) => (
                    <div key={e.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] border ${isMatch(e.mlId) ? "bg-[rgba(0,206,201,0.1)] border-[rgba(0,206,201,0.4)]" : "bg-[var(--bg-elevated)] border-[var(--border-default)]"}`}>
                      <span className="w-6 h-6 rounded-full bg-[rgba(253,203,110,0.15)] text-[var(--qb-fast-track)] flex items-center justify-center text-xs font-bold">{i+1}</span>
                      <span className={`font-mono font-semibold text-sm flex-1 ${isMatch(e.mlId) ? "text-[var(--qb-accent)]" : ""}`}>{e.mlId}</span>
                      <span className="text-xs text-[var(--text-muted)]">{e.gamesRemaining} game</span>
                      {e.isCarryOver && <RefreshCw className="w-3 h-3 text-[var(--qb-primary-light)]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Normal */}
            <div>
              <h2 className="text-sm font-semibold text-[var(--qb-normal)] mb-2 flex items-center gap-1"><ClipboardList className="w-4 h-4" /> Normal ({normal.length})</h2>
              {normal.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] px-4 py-3 text-center">Kosong</p>
              ) : (
                <div className="space-y-1.5">
                  {normal.map((e, i) => (
                    <div key={e.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] border ${isMatch(e.mlId) ? "bg-[rgba(0,206,201,0.1)] border-[rgba(0,206,201,0.4)]" : "bg-[var(--bg-elevated)] border-[var(--border-default)]"}`}>
                      <span className="w-6 h-6 rounded-full bg-[rgba(116,185,255,0.15)] text-[var(--qb-normal)] flex items-center justify-center text-xs font-bold">{i+1}</span>
                      <span className={`font-mono font-semibold text-sm flex-1 ${isMatch(e.mlId) ? "text-[var(--qb-accent)]" : ""}`}>{e.mlId}</span>
                      <span className="text-xs text-[var(--text-muted)]">{e.gamesRemaining} game</span>
                      {e.isCarryOver && <RefreshCw className="w-3 h-3 text-[var(--qb-primary-light)]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 border-t border-[var(--border-default)] text-center">
        <p className="text-xs text-[var(--text-muted)]">Powered by <span className="gradient-text font-semibold">QueueBareng</span></p>
      </footer>
    </div>
  );
}
