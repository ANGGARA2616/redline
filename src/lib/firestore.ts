import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { UserProfile, Package, Session, QueueEntry, GameLog } from "@/types";

// ============================================================
// Users
// ============================================================

/**
 * Get full user profile from Firestore by UID.
 */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

/**
 * Get public-safe user info by username (for public queue page).
 */
export async function getUserByUsername(
  username: string
): Promise<UserProfile | null> {
  const q = query(
    collection(getFirebaseDb(), "users"),
    where("username", "==", username)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
}

/**
 * Check if a username is already taken.
 * Reads from the public `usernames` collection — no auth required.
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
  const snap = await getDoc(doc(getFirebaseDb(), "usernames", username.toLowerCase()));
  return snap.exists();
}

/**
 * Create a new user profile in Firestore after Firebase Auth signup.
 */
export async function createUserProfile(
  uid: string,
  data: {
    displayName: string;
    email: string;
    username: string;
  }
): Promise<void> {
  const db = getFirebaseDb();
  const now = Timestamp.now();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  const slug = data.username.toLowerCase();

  const profile: Omit<UserProfile, "uid"> = {
    displayName: data.displayName,
    email: data.email,
    username: slug,
    createdAt: now,
    subscription: {
      tier: "trial",
      expiresAt: Timestamp.fromDate(trialEnd),
    },
    packages: [],
  };

  // Atomic write: user profile + username reservation
  const batch = writeBatch(db);
  batch.set(doc(db, "users", uid), profile);
  batch.set(doc(db, "usernames", slug), { uid, displayName: data.displayName });
  await batch.commit();
}

/**
 * Update user's packages array.
 */
export async function updateUserPackages(
  uid: string,
  packages: Package[]
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "users", uid), { packages });
}

// ============================================================
// Sessions
// ============================================================

/**
 * Create a new live session.
 */
export async function createSession(
  streamerId: string,
  publicSlug: string
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), "sessions"), {
    streamerId,
    createdAt: Timestamp.now(),
    endedAt: null,
    status: "active",
    publicSlug,
  });
  return ref.id;
}

/**
 * End a live session.
 */
export async function endSession(sessionId: string): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "sessions", sessionId), {
    status: "ended",
    endedAt: Timestamp.now(),
  });
}

/**
 * Get the currently active session for a streamer.
 */
export async function getActiveSession(
  streamerId: string
): Promise<Session | null> {
  const q = query(
    collection(getFirebaseDb(), "sessions"),
    where("streamerId", "==", streamerId),
    where("status", "==", "active")
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Session;
}

/**
 * Listen to active session changes (real-time).
 */
export function onActiveSession(
  streamerId: string,
  callback: (session: Session | null) => void
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), "sessions"),
    where("streamerId", "==", streamerId),
    where("status", "==", "active")
  );
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null);
    } else {
      callback({
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
      } as Session);
    }
  });
}

// ============================================================
// Queue Entries
// ============================================================

/**
 * Add a new queue entry.
 */
export async function addQueueEntry(
  entry: Omit<QueueEntry, "id">
): Promise<string> {
  const ref = await addDoc(
    collection(getFirebaseDb(), "queueEntries"),
    entry
  );
  return ref.id;
}

/**
 * Update a queue entry.
 */
export async function updateQueueEntry(
  entryId: string,
  data: Partial<QueueEntry>
): Promise<void> {
  // Remove 'id' field from data if present — it's the doc ID, not a field
  const { id: _id, ...updateData } = data as QueueEntry;
  await updateDoc(doc(getFirebaseDb(), "queueEntries", entryId), updateData);
}

/**
 * Delete a queue entry.
 */
export async function deleteQueueEntry(entryId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), "queueEntries", entryId));
}

/**
 * Listen to queue entries for a session (real-time).
 */
export function onQueueEntries(
  sessionId: string,
  callback: (entries: QueueEntry[]) => void
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), "queueEntries"),
    where("sessionId", "==", sessionId),
    orderBy("orderedAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as QueueEntry)
    );
    callback(entries);
  });
}

/**
 * Get carry-over entries from previous sessions.
 */
export async function getCarryOverEntries(
  streamerId: string
): Promise<QueueEntry[]> {
  const q = query(
    collection(getFirebaseDb(), "queueEntries"),
    where("streamerId", "==", streamerId),
    where("status", "==", "carry_over")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QueueEntry));
}

/**
 * Migrate carry-over entries to a new session.
 */
export async function migrateCarryOverEntries(
  streamerId: string,
  newSessionId: string
): Promise<number> {
  const entries = await getCarryOverEntries(streamerId);
  let count = 0;

  for (const entry of entries) {
    await updateDoc(doc(getFirebaseDb(), "queueEntries", entry.id), {
      sessionId: newSessionId,
      status: "waiting",
    });
    count++;
  }

  return count;
}

/**
 * Mark remaining entries as carry-over when ending a session.
 */
export async function markEntriesAsCarryOver(
  sessionId: string
): Promise<{ customerCount: number; gameCount: number }> {
  const q = query(
    collection(getFirebaseDb(), "queueEntries"),
    where("sessionId", "==", sessionId),
    where("status", "in", ["waiting", "playing"])
  );
  const snap = await getDocs(q);

  let customerCount = 0;
  let gameCount = 0;

  for (const d of snap.docs) {
    const entry = d.data() as QueueEntry;
    const remaining = entry.totalGames - entry.gamesPlayed;
    if (remaining > 0) {
      await updateDoc(doc(getFirebaseDb(), "queueEntries", d.id), {
        status: "carry_over",
        isCarryOver: true,
        gamesRemaining: remaining,
      });
      customerCount++;
      gameCount += remaining;
    } else {
      await updateDoc(doc(getFirebaseDb(), "queueEntries", d.id), {
        status: "completed",
      });
    }
  }

  return { customerCount, gameCount };
}

// ============================================================
// Game Logs
// ============================================================

/**
 * Create a game log entry (append-only).
 */
export async function createGameLog(
  log: Omit<GameLog, "id">
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), "gameLogs"), log);
  return ref.id;
}

/**
 * Listen to game logs for a session (real-time, newest first).
 */
export function onGameLogs(
  sessionId: string,
  callback: (logs: GameLog[]) => void
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), "gameLogs"),
    where("sessionId", "==", sessionId),
    orderBy("startedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const logs = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as GameLog)
    );
    callback(logs);
  });
}

/**
 * Update a game log (specifically to set endedAt).
 */
export async function updateGameLog(
  logId: string,
  data: Partial<GameLog>
): Promise<void> {
  const { id: _id, ...updateData } = data as GameLog;
  await updateDoc(doc(getFirebaseDb(), "gameLogs", logId), updateData);
}

/**
 * Delete a game log (used when an entry is skipped while playing).
 */
export async function deleteGameLog(logId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), "gameLogs", logId));
}
