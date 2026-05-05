import { Timestamp } from "firebase/firestore";

// ============================================================
// User / Streamer
// ============================================================

export interface Subscription {
  tier: "trial" | "starter" | "pro" | "pro_plus" | "expired";
  expiresAt: Timestamp;
  midtransOrderId?: string;
}

export interface Package {
  id: string;
  name: string;
  jalur: "normal" | "fast_track";
  nominal: number;
  gameCount: number;
  isBundle: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  username: string;
  createdAt: Timestamp;
  subscription: Subscription;
  packages: Package[];
}

/** Subset of UserProfile exposed on the public queue page */
export interface PublicUserInfo {
  username: string;
  displayName: string;
}

// ============================================================
// Session
// ============================================================

export type SessionStatus = "active" | "ended";

export interface Session {
  id: string;
  streamerId: string;
  createdAt: Timestamp;
  endedAt: Timestamp | null;
  status: SessionStatus;
  publicSlug: string;
}

// ============================================================
// Queue Entry
// ============================================================

export type QueueEntryStatus =
  | "waiting"
  | "playing"
  | "completed"
  | "carry_over"
  | "offline";

export type Jalur = "normal" | "fast_track";

export interface QueueEntry {
  id: string;
  sessionId: string;
  streamerId: string;
  mlId: string;
  jalur: Jalur;
  totalGames: number;
  gamesPlayed: number;
  gamesRemaining: number;
  status: QueueEntryStatus;
  createdAt?: Timestamp; // Original input time (display only)
  orderedAt: Timestamp;  // Current position in queue (used for sorting)
  isCarryOver: boolean;
  approvalType: "auto" | "manual";
  nominalDonasi: number;
}

// ============================================================
// Game Log
// ============================================================

export interface GameLog {
  id: string;
  entryId: string;
  sessionId: string;
  streamerId: string;
  mlId: string;
  gameNumber: number;
  startedAt: Timestamp;
  endedAt: Timestamp | null;
}

// ============================================================
// Auto-detect helpers
// ============================================================

export type DetectResultType = "bundle" | "fast_track" | "normal" | "anomaly";

export interface DetectResult {
  type: DetectResultType;
  package?: Package;
  jalur: Jalur;
  gameCount: number;
  matched: boolean;
}
