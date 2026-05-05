"use client";

import { useState, useEffect, use } from "react";
import { getFirebaseDb } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import type { QueueEntry, Session } from "@/types";
import { Zap, ClipboardList, Gamepad2, RefreshCw } from "lucide-react";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function OBSOverlayPage({ params }: PageProps) {
  const { username } = use(params);
  const [streamerName, setStreamerName] = useState<string | null>(null);
  const [streamerId, setStreamerId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Force transparent background for OBS
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.classList.add("obs-body");
    return () => {
      document.documentElement.style.background = "";
      document.body.style.background = "";
      document.body.classList.remove("obs-body");
    };
  }, []);

  // Look up streamer directly from Firestore (client-side)
  useEffect(() => {
    const slug = username.toLowerCase();
    const ref = doc(getFirebaseDb(), "usernames", slug);

    getDoc(ref).then((snap) => {
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      const data = snap.data();
      setStreamerName(data.displayName || slug);
      setStreamerId(data.uid);
    }).catch(() => {
      setLoading(false);
    });
  }, [username]);

  // Listen for active session
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

  // Listen to queue entries
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

  if (loading) {
    return <div className="obs-overlay obs-overlay--loading"><Gamepad2 className="w-6 h-6 animate-pulse" /></div>;
  }

  if (!session || !streamerName) {
    // Show nothing when offline — OBS will just show transparent
    return <div style={{ background: "transparent" }} />;
  }

  return (
    <div className="obs-overlay">
      {/* Header */}
      <div className="obs-header">
        <Gamepad2 className="w-5 h-5 text-[var(--qb-primary)]" />
        <span className="obs-header__name">{streamerName}</span>
        <span className="obs-badge-live"><span className="obs-badge-live__dot" />LIVE</span>
      </div>

      {/* Playing now */}
      {playingEntries.length > 0 && (
        <div className="obs-section">
          <div className="obs-section__title obs-section__title--playing">
            <Gamepad2 className="w-3.5 h-3.5" /> Bermain ({playingEntries.length}/4)
          </div>
          {playingEntries.map((e) => (
            <div key={e.id} className="obs-entry obs-entry--playing">
              <span className="obs-entry__badge-live"><span className="obs-badge-live__dot" /></span>
              <span className={`obs-entry__badge ${e.jalur === "fast_track" ? "obs-entry__badge--ft" : "obs-entry__badge--nm"}`}>
                {e.jalur === "fast_track" ? <><Zap className="w-3 h-3 inline" /> FT</> : <><ClipboardList className="w-3 h-3 inline" /> NM</>}
              </span>
              <span className="obs-entry__mlid">{e.mlId}</span>
              <span className="obs-entry__games">G{e.gamesPlayed + 1}/{e.totalGames}</span>
            </div>
          ))}
        </div>
      )}

      {/* Fast Track */}
      {fastTrack.length > 0 && (
        <div className="obs-section">
          <div className="obs-section__title obs-section__title--ft">
            <Zap className="w-3.5 h-3.5" /> Fast Track ({fastTrack.length})
          </div>
          {fastTrack.map((e, i) => (
            <div key={e.id} className="obs-entry">
              <span className="obs-entry__pos obs-entry__pos--ft">{i + 1}</span>
              <span className="obs-entry__mlid">{e.mlId}</span>
              <span className="obs-entry__games">{e.gamesRemaining}g</span>
              {e.isCarryOver && <RefreshCw className="w-3 h-3 text-[var(--qb-primary-light)]" />}
            </div>
          ))}
        </div>
      )}

      {/* Normal */}
      {normal.length > 0 && (
        <div className="obs-section">
          <div className="obs-section__title obs-section__title--nm">
            <ClipboardList className="w-3.5 h-3.5" /> Normal ({normal.length})
          </div>
          {normal.map((e, i) => (
            <div key={e.id} className="obs-entry">
              <span className="obs-entry__pos obs-entry__pos--nm">{i + 1}</span>
              <span className="obs-entry__mlid">{e.mlId}</span>
              <span className="obs-entry__games">{e.gamesRemaining}g</span>
              {e.isCarryOver && <RefreshCw className="w-3 h-3 text-[var(--qb-primary-light)]" />}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {playingEntries.length === 0 && fastTrack.length === 0 && normal.length === 0 && (
        <div className="obs-empty">Antrian kosong</div>
      )}
    </div>
  );
}
