"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "@/hooks/useSession";
import { useQueue, MAX_SLOTS } from "@/hooks/useQueue";
import QueueCard from "@/components/dashboard/QueueCard";
import InputOrderForm from "@/components/dashboard/InputOrderForm";
import GameControlPanel from "@/components/dashboard/GameControlPanel";
import { Gamepad2, CheckCircle, Clapperboard, Play, Link, Square, SkipForward, Zap, ClipboardList, Moon, Monitor, Webhook } from "lucide-react";
import type { Jalur } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeSession, loading: sessionLoading, startSession, closeSession, operating } = useSession();
  const {
    fastTrackQueue, normalQueue, offlineEntries, playingEntries, availableSlots, allEntries,
    loading: queueLoading, addEntry, callNext, manualCall, swapPlayingEntry, finishGame, finishAllGames,
    addGamesToEntry, skipEntry, returnToQueue, recalculateEntry, upgradeToFastTrack,
  } = useQueue(activeSession?.id ?? null);

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [endResult, setEndResult] = useState<{ customerCount: number; gameCount: number } | null>(null);
  const [loadingEntryId, setLoadingEntryId] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const publicQueueUrl = activeSession && user
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/queue/${user.username}`
    : null;

  const obsOverlayUrl = activeSession && user
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/queue/${user.username}/overlay`
    : null;

  const sociabuzzWebhookUrl = user
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/sociabuzz`
    : null;

  const copyLink = useCallback(() => {
    if (publicQueueUrl) navigator.clipboard.writeText(publicQueueUrl);
  }, [publicQueueUrl]);

  const copyObs = useCallback(() => {
    if (obsOverlayUrl) navigator.clipboard.writeText(obsOverlayUrl);
  }, [obsOverlayUrl]);

  const copySociabuzz = useCallback(() => {
    if (sociabuzzWebhookUrl) navigator.clipboard.writeText(sociabuzzWebhookUrl);
  }, [sociabuzzWebhookUrl]);

  const handleSubmitOrder = useCallback(
    async (data: { mlId: string; jalur: Jalur; totalGames: number; nominalDonasi: number; approvalType: "auto" | "manual" }) => {
      if (!user) return;
      await addEntry({ streamerId: user.uid, ...data });
    },
    [user, addEntry]
  );

  const handleFinishGame = useCallback(async (entryId: string) => {
    if (!user) return;
    setLoadingEntryId(entryId);
    try { await finishGame(entryId, user.uid); }
    finally { setLoadingEntryId(null); }
  }, [user, finishGame]);

  const handleFinishAllGames = useCallback(async () => {
    if (!user) return;
    setLoadingAll(true);
    try { await finishAllGames(user.uid); }
    finally { setLoadingAll(false); }
  }, [user, finishAllGames]);

  const handleEndSession = useCallback(async () => {
    const result = await closeSession();
    setEndResult(result);
    setShowEndConfirm(false);
  }, [closeSession]);

  const loading = sessionLoading || queueLoading;
  const waitingCount = fastTrackQueue.length + normalQueue.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Gamepad2 className="w-10 h-10 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)]">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // ── No active session ──
  if (!activeSession) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Kelola antrian main bareng kamu</p>
        </div>
        {endResult && (
          <div className="card border-[rgba(0,184,148,0.3)] bg-[rgba(0,184,148,0.06)]">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[var(--qb-success)]" />
              <div>
                <p className="font-semibold">Sesi berakhir</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {endResult.customerCount > 0
                    ? `${endResult.customerCount} customer dengan ${endResult.gameCount} sisa game akan carry-over.`
                    : "Semua antrian selesai. Tidak ada carry-over."}
                </p>
              </div>
              <button onClick={() => setEndResult(null)} className="btn btn-ghost btn-sm ml-auto">✕</button>
            </div>
          </div>
        )}
        <div className="card text-center py-16">
          <Clapperboard className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Belum Ada Sesi Aktif</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Mulai sesi live baru untuk membuka antrian.
          </p>
          <button onClick={startSession} className="btn btn-primary btn-lg" disabled={operating}>
            {operating ? "Memulai sesi..." : <><Play className="w-4 h-4 inline mr-2" /> Mulai Sesi Live</>}
          </button>
        </div>
      </div>
    );
  }

  // ── Active session ──
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <span className="badge badge-live">
              <span className="w-2 h-2 rounded-full bg-[var(--qb-danger)] animate-pulse" />LIVE
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {playingEntries.length}/{MAX_SLOTS} slot · {waitingCount} menunggu
          </p>
        </div>
        <div className="flex items-center gap-2">
          {publicQueueUrl && (
            <button onClick={copyLink} className="btn btn-secondary btn-sm"><Link className="w-4 h-4 inline mr-1" /> Salin Link</button>
          )}
          {obsOverlayUrl && (
            <button onClick={copyObs} className="btn btn-secondary btn-sm" title="Salin URL OBS Overlay"><Monitor className="w-4 h-4 inline mr-1" /> OBS</button>
          )}
          {sociabuzzWebhookUrl && (
            <button onClick={copySociabuzz} className="btn btn-secondary btn-sm" title="Salin URL Webhook Sociabuzz"><Webhook className="w-4 h-4 inline mr-1" /> Webhook</button>
          )}
          <button onClick={() => setShowEndConfirm(true)} className="btn btn-danger btn-sm" disabled={operating}>
            <Square className="w-4 h-4 inline mr-1" /> Akhiri Sesi
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        {/* Sidebar */}
        <div className="space-y-4">
          <InputOrderForm
            packages={user?.packages || []}
            allEntries={allEntries}
            onSubmitOrder={handleSubmitOrder}
            onAddGames={addGamesToEntry}
            onUpgrade={upgradeToFastTrack}
            onRecalculate={recalculateEntry}
          />
          <div className="grid grid-cols-3 gap-2">
            <div className="card py-2 px-3 text-center">
              <p className="text-lg font-bold text-[var(--qb-fast-track)]">{fastTrackQueue.length}</p>
              <p className="text-[0.65rem] text-[var(--text-muted)]">Fast Track</p>
            </div>
            <div className="card py-2 px-3 text-center">
              <p className="text-lg font-bold text-[var(--qb-normal)]">{normalQueue.length}</p>
              <p className="text-[0.65rem] text-[var(--text-muted)]">Normal</p>
            </div>
            <div className="card py-2 px-3 text-center">
              <p className="text-lg font-bold text-[var(--qb-success)]">{allEntries.filter((e) => e.status === "completed").length}</p>
              <p className="text-[0.65rem] text-[var(--text-muted)]">Selesai</p>
            </div>
          </div>
        </div>

        {/* Queue area */}
        <div className="space-y-4">
          {/* Playing slots */}
          {playingEntries.length > 0 && (
            <GameControlPanel
              playingEntries={playingEntries}
              onFinishGame={handleFinishGame}
              onFinishAllGames={handleFinishAllGames}
              onSkip={skipEntry}
              onManualCall={manualCall}
              onSwapPlayingEntry={swapPlayingEntry}
              loadingEntryId={loadingEntryId}
              loadingAll={loadingAll}
            />
          )}

          {/* Call next button */}
          {availableSlots > 0 && (
            <div className="card border-dashed border-[var(--border-default)] text-center py-4">
              <button onClick={callNext} className="btn btn-primary" disabled={waitingCount === 0}>
                {waitingCount === 0 ? "Tidak ada antrian" : <><SkipForward className="w-4 h-4 inline mr-2" /> Panggil Berikutnya ({availableSlots} slot tersedia)</>}
              </button>
            </div>
          )}

          {/* Queues Section */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Fast Track Queue */}
            <div className="bg-gradient-to-b from-[rgba(253,203,110,0.05)] to-transparent p-4 rounded-[var(--radius-lg)] border border-[rgba(253,203,110,0.15)] flex flex-col max-h-[450px]">
              <h2 className="text-sm font-semibold text-[var(--qb-fast-track)] mb-3 uppercase tracking-wider flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Fast Track</span>
                <span className="bg-[var(--qb-fast-track)] text-[var(--bg-base)] px-2 py-0.5 rounded-full text-xs font-bold">{fastTrackQueue.length}</span>
              </h2>
              {fastTrackQueue.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-[var(--radius-md)] px-4 py-3 text-center border border-dashed border-[var(--border-default)]">Kosong</div>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {fastTrackQueue.map((e, i) => <QueueCard key={e.id} entry={e} position={i + 1} onAdd={() => manualCall(e.id)} />)}
                </div>
              )}
            </div>

            {/* Normal Queue */}
            <div className="bg-gradient-to-b from-[rgba(116,185,255,0.05)] to-transparent p-4 rounded-[var(--radius-lg)] border border-[rgba(116,185,255,0.15)] flex flex-col max-h-[450px]">
              <h2 className="text-sm font-semibold text-[var(--qb-normal)] mb-3 uppercase tracking-wider flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1"><ClipboardList className="w-4 h-4" /> Normal</span>
                <span className="bg-[var(--qb-normal)] text-[var(--bg-base)] px-2 py-0.5 rounded-full text-xs font-bold">{normalQueue.length}</span>
              </h2>
              {normalQueue.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-[var(--radius-md)] px-4 py-3 text-center border border-dashed border-[var(--border-default)]">Kosong</div>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {normalQueue.map((e, i) => <QueueCard key={e.id} entry={e} position={i + 1} onAdd={() => manualCall(e.id)} />)}
                </div>
              )}
            </div>
          </div>

          {/* Offline / Skip Queue */}
          {offlineEntries.length > 0 && (
            <div className="bg-[var(--bg-elevated)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] flex flex-col max-h-[350px]">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1"><Moon className="w-4 h-4" /> Skip / Offline</span>
                <span className="bg-[var(--bg-surface)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full text-xs font-bold">{offlineEntries.length}</span>
              </h2>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {offlineEntries.map((e, i) => <QueueCard key={e.id} entry={e} position={i + 1} onReturn={() => returnToQueue(e.id)} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* End session modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEndConfirm(false)} />
          <div className="relative w-full max-w-sm glass-strong rounded-[var(--radius-xl)] p-6 animate-slide-up shadow-[var(--shadow-lg)]">
            <div className="text-center mb-5 flex flex-col items-center">
              <Square className="w-10 h-10 text-[var(--qb-danger)] mb-3" />
              <h2 className="text-lg font-bold">Akhiri Sesi?</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {waitingCount + playingEntries.length > 0
                  ? `${waitingCount + playingEntries.length} customer dengan sisa game akan carry-over.`
                  : "Semua antrian sudah selesai."}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleEndSession} className="btn btn-danger flex-1" disabled={operating}>
                {operating ? "Mengakhiri..." : "Ya, Akhiri"}
              </button>
              <button onClick={() => setShowEndConfirm(false)} className="btn btn-secondary flex-1">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
