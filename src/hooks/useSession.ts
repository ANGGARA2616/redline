"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSession,
  endSession,
  onActiveSession,
  migrateCarryOverEntries,
  markEntriesAsCarryOver,
} from "@/lib/firestore";
import { generateId } from "@/lib/utils";
import type { Session } from "@/types";

interface UseSessionReturn {
  /** Current active session (null if no active session) */
  activeSession: Session | null;
  /** Loading state */
  loading: boolean;
  /** Start a new live session */
  startSession: () => Promise<void>;
  /** End the current session, returns carry-over info */
  closeSession: () => Promise<{ customerCount: number; gameCount: number }>;
  /** Whether a session operation is in progress */
  operating: boolean;
}

export function useSession(): UseSessionReturn {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [operating, setOperating] = useState(false);

  // Listen to active session in real-time
  useEffect(() => {
    if (!user) {
      setActiveSession(null);
      setLoading(false);
      return;
    }

    const unsub = onActiveSession(user.uid, (session) => {
      setActiveSession(session);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  // Start a new session
  const startSession = useCallback(async () => {
    if (!user) return;
    setOperating(true);
    try {
      const slug = `${user.username}-${generateId()}`;
      const sessionId = await createSession(user.uid, slug);
      // Migrate carry-over entries from previous sessions
      await migrateCarryOverEntries(user.uid, sessionId);
    } finally {
      setOperating(false);
    }
  }, [user]);

  // End the current session
  const closeSession = useCallback(async () => {
    if (!activeSession) return { customerCount: 0, gameCount: 0 };
    setOperating(true);
    try {
      // Mark remaining entries as carry-over
      const result = await markEntriesAsCarryOver(activeSession.id);
      // End the session
      await endSession(activeSession.id);
      return result;
    } finally {
      setOperating(false);
    }
  }, [activeSession]);

  return {
    activeSession,
    loading,
    startSession,
    closeSession,
    operating,
  };
}
