"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  onQueueEntries,
  addQueueEntry,
  updateQueueEntry,
  deleteQueueEntry,
  createGameLog,
  updateGameLog,
  deleteGameLog,
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import type { QueueEntry, GameLog, Jalur } from "@/types";

/** Max concurrent playing slots (ML 5v5: 4 teammates) */
export const MAX_SLOTS = 4;

interface UseQueueReturn {
  allEntries: QueueEntry[];
  fastTrackQueue: QueueEntry[];
  normalQueue: QueueEntry[];
  /** Entries that were skipped because customer is offline */
  offlineEntries: QueueEntry[];
  /** All entries currently playing (up to MAX_SLOTS) */
  playingEntries: QueueEntry[];
  /** How many empty slots are available */
  availableSlots: number;
  loading: boolean;
  addEntry: (data: {
    streamerId: string;
    mlId: string;
    jalur: Jalur;
    totalGames: number;
    nominalDonasi: number;
    approvalType: "auto" | "manual";
  }) => Promise<string>;
  /** Call next entries to fill available slots */
  callNext: () => Promise<void>;
  /** Move a specific entry into playing */
  manualCall: (entryId: string) => Promise<void>;
  /** Swap a playing entry with a waiting/offline entry */
  swapPlayingEntry: (newEntryId: string, oldEntryId: string) => Promise<void>;
  /** Finish game for a specific playing entry */
  finishGame: (entryId: string, streamerId: string) => Promise<void>;
  /** Finish game for all currently playing entries at once */
  finishAllGames: (streamerId: string) => Promise<void>;
  addGamesToEntry: (entryId: string, extraGames: number, extraNominal: number) => Promise<void>;
  /** Skip an entry and mark it offline */
  skipEntry: (entryId: string) => Promise<void>;
  /** Return an offline entry back to the waiting queue */
  returnToQueue: (entryId: string) => Promise<void>;
  /** Recalculate: replace existing entry with new jalur/gameCount based on combined nominal */
  recalculateEntry: (
    entryId: string,
    newJalur: Jalur,
    newTotalGames: number,
    newTotalNominal: number
  ) => Promise<void>;
  upgradeToFastTrack: (entryId: string) => Promise<void>;
  /** Map of entryId → active GameLog for currently playing entries */
  activeGameLogs: Map<string, GameLog>;
}

export function useQueue(sessionId: string | null): UseQueueReturn {
  const [allEntries, setAllEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGameLogs, setActiveGameLogs] = useState<Map<string, GameLog>>(new Map());

  // Real-time listener
  useEffect(() => {
    if (!sessionId) {
      setAllEntries([]);
      setLoading(false);
      return;
    }
    const unsub = onQueueEntries(sessionId, (entries) => {
      setAllEntries(entries);
      setLoading(false);
    });
    return unsub;
  }, [sessionId]);

  // Derived queues
  const fastTrackQueue = useMemo(
    () => allEntries.filter((e) => e.jalur === "fast_track" && e.status === "waiting"),
    [allEntries]
  );

  const normalQueue = useMemo(
    () => allEntries.filter((e) => e.jalur === "normal" && e.status === "waiting"),
    [allEntries]
  );

  const offlineEntries = useMemo(
    () => allEntries.filter((e) => e.status === "offline"),
    [allEntries]
  );

  const playingEntries = useMemo(
    () => allEntries.filter((e) => e.status === "playing"),
    [allEntries]
  );

  const availableSlots = MAX_SLOTS - playingEntries.length;

  // Add entry
  const addEntry = useCallback(
    async (data: {
      streamerId: string;
      mlId: string;
      jalur: Jalur;
      totalGames: number;
      nominalDonasi: number;
      approvalType: "auto" | "manual";
    }) => {
      if (!sessionId) throw new Error("No active session");
      return addQueueEntry({
        sessionId,
        streamerId: data.streamerId,
        mlId: data.mlId,
        jalur: data.jalur,
        totalGames: data.totalGames,
        gamesPlayed: 0,
        gamesRemaining: data.totalGames,
        status: "waiting",
        createdAt: Timestamp.now(),
        orderedAt: Timestamp.now(),
        isCarryOver: false,
        approvalType: data.approvalType,
        nominalDonasi: data.nominalDonasi,
      });
    },
    [sessionId]
  );

  // Call next — fills available slots (fast track priority)
  const callNext = useCallback(async () => {
    if (availableSlots <= 0) return;

    // Build a priority list: fast track first, then normal
    const waitingQueue = [...fastTrackQueue, ...normalQueue];
    const toCall = waitingQueue.slice(0, availableSlots);

    for (const entry of toCall) {
      await updateQueueEntry(entry.id, { status: "playing" });

      const log: Omit<GameLog, "id"> = {
        entryId: entry.id,
        sessionId: entry.sessionId,
        streamerId: entry.streamerId,
        mlId: entry.mlId,
        gameNumber: entry.gamesPlayed + 1,
        startedAt: Timestamp.now(),
        endedAt: null,
      };
      const logId = await createGameLog(log);
      setActiveGameLogs((prev) => {
        const next = new Map(prev);
        next.set(entry.id, { id: logId, ...log });
        return next;
      });
    }
  }, [availableSlots, fastTrackQueue, normalQueue]);

  // Manually move a specific entry into playing
  const manualCall = useCallback(async (entryId: string) => {
    if (availableSlots <= 0) return;
    const entry = allEntries.find((e) => e.id === entryId);
    if (!entry || (entry.status !== "waiting" && entry.status !== "offline")) return;

    await updateQueueEntry(entry.id, { status: "playing" });

    const log: Omit<GameLog, "id"> = {
      entryId: entry.id,
      sessionId: entry.sessionId,
      streamerId: entry.streamerId,
      mlId: entry.mlId,
      gameNumber: entry.gamesPlayed + 1,
      startedAt: Timestamp.now(),
      endedAt: null,
    };
    const logId = await createGameLog(log);
    setActiveGameLogs((prev) => {
      const next = new Map(prev);
      next.set(entry.id, { id: logId, ...log });
      return next;
    });
  }, [availableSlots, allEntries]);

  // Swap playing entry
  const swapPlayingEntry = useCallback(async (newEntryId: string, oldEntryId: string) => {
    const newEntry = allEntries.find((e) => e.id === newEntryId);
    const oldEntry = allEntries.find((e) => e.id === oldEntryId);
    if (!newEntry || !oldEntry) return;

    if (oldEntry.status === "playing") {
      const log = activeGameLogs.get(oldEntry.id);
      if (log) {
        await deleteGameLog(log.id);
        setActiveGameLogs((prev) => {
          const next = new Map(prev);
          next.delete(oldEntry.id);
          return next;
        });
      }
      await updateQueueEntry(oldEntry.id, { status: "waiting" });
    }

    if (newEntry.status === "waiting" || newEntry.status === "offline") {
      await updateQueueEntry(newEntry.id, { status: "playing" });
      const log: Omit<GameLog, "id"> = {
        entryId: newEntry.id,
        sessionId: newEntry.sessionId,
        streamerId: newEntry.streamerId,
        mlId: newEntry.mlId,
        gameNumber: newEntry.gamesPlayed + 1,
        startedAt: Timestamp.now(),
        endedAt: null,
      };
      const logId = await createGameLog(log);
      setActiveGameLogs((prev) => {
        const next = new Map(prev);
        next.set(newEntry.id, { id: logId, ...log });
        return next;
      });
    }
  }, [allEntries, activeGameLogs]);

  // Finish game for a specific entry
  const finishGame = useCallback(
    async (entryId: string, streamerId: string) => {
      const entry = allEntries.find((e) => e.id === entryId);
      if (!entry || entry.status !== "playing") return;

      // Close game log
      const log = activeGameLogs.get(entryId);
      if (log) {
        await updateGameLog(log.id, { endedAt: Timestamp.now() });
        setActiveGameLogs((prev) => {
          const next = new Map(prev);
          next.delete(entryId);
          return next;
        });
      }

      const newGamesPlayed = entry.gamesPlayed + 1;
      const newRemaining = entry.totalGames - newGamesPlayed;

      if (newRemaining <= 0) {
        await updateQueueEntry(entryId, {
          gamesPlayed: newGamesPlayed,
          gamesRemaining: 0,
          status: "completed",
        });
      } else {
        // Stay in playing state
        await updateQueueEntry(entryId, {
          gamesPlayed: newGamesPlayed,
          gamesRemaining: newRemaining,
          status: "playing",
        });

        // Create a new game log for the next game immediately
        const newLog: Omit<GameLog, "id"> = {
          entryId: entry.id,
          sessionId: entry.sessionId,
          streamerId: entry.streamerId,
          mlId: entry.mlId,
          gameNumber: newGamesPlayed + 1,
          startedAt: Timestamp.now(),
          endedAt: null,
        };
        const newLogId = await createGameLog(newLog);
        setActiveGameLogs((prev) => {
          const next = new Map(prev);
          next.set(entry.id, { id: newLogId, ...newLog });
          return next;
        });
      }
    },
    [allEntries, activeGameLogs]
  );

  // Finish game for all playing entries
  const finishAllGames = useCallback(
    async (streamerId: string) => {
      if (playingEntries.length === 0) return;
      const promises = playingEntries.map((entry) => finishGame(entry.id, streamerId));
      await Promise.all(promises);
    },
    [playingEntries, finishGame]
  );

  // Add games + accumulate nominal
  const addGamesToEntry = useCallback(
    async (entryId: string, extraGames: number, extraNominal: number) => {
      const entry = allEntries.find((e) => e.id === entryId);
      if (!entry) return;
      await updateQueueEntry(entryId, {
        totalGames: entry.totalGames + extraGames,
        gamesRemaining: entry.gamesRemaining + extraGames,
        nominalDonasi: entry.nominalDonasi + extraNominal,
      });
    },
    [allEntries]
  );

  // Skip entry (offline)
  const skipEntry = useCallback(
    async (entryId: string) => {
      const entry = allEntries.find((e) => e.id === entryId);
      if (!entry) return;

      if (entry.status === "playing") {
        const log = activeGameLogs.get(entryId);
        if (log) {
          await deleteGameLog(log.id);
          setActiveGameLogs((prev) => {
            const next = new Map(prev);
            next.delete(entryId);
            return next;
          });
        }
      }
      await updateQueueEntry(entryId, { status: "offline" });
    },
    [allEntries, activeGameLogs]
  );

  // Return to queue
  const returnToQueue = useCallback(async (entryId: string) => {
    await updateQueueEntry(entryId, {
      status: "waiting",
      orderedAt: Timestamp.now(), // Put at the bottom of their lane
    });
  }, []);

  // Recalculate: update existing entry with new lane, game count, nominal
  // Used when customer donates more to upgrade (e.g. normal→fast track with recalc)
  const recalculateEntry = useCallback(
    async (
      entryId: string,
      newJalur: Jalur,
      newTotalGames: number,
      newTotalNominal: number
    ) => {
      const entry = allEntries.find((e) => e.id === entryId);
      if (!entry) return;

      // New total = games already played + new remaining
      const newGamesRemaining = newTotalGames;

      await updateQueueEntry(entryId, {
        jalur: newJalur,
        totalGames: entry.gamesPlayed + newGamesRemaining,
        gamesRemaining: newGamesRemaining,
        nominalDonasi: newTotalNominal,
        approvalType: "manual",
        orderedAt: newJalur !== entry.jalur ? Timestamp.now() : entry.orderedAt,
      });
    },
    [allEntries]
  );

  // Upgrade to fast track (simple lane switch)
  const upgradeToFastTrack = useCallback(async (entryId: string) => {
    await updateQueueEntry(entryId, {
      jalur: "fast_track",
      orderedAt: Timestamp.now(),
    });
  }, []);

  return {
    allEntries,
    fastTrackQueue,
    normalQueue,
    offlineEntries,
    playingEntries,
    availableSlots,
    loading,
    addEntry,
    callNext,
    manualCall,
    swapPlayingEntry,
    finishGame,
    finishAllGames,
    addGamesToEntry,
    skipEntry,
    returnToQueue,
    recalculateEntry,
    upgradeToFastTrack,
    activeGameLogs,
  };
}
