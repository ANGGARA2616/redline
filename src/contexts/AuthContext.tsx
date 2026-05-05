"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { getFirebaseDb } from "@/lib/firebase";
import { getUserProfile, createUserProfile } from "@/lib/firestore";
import { doc, updateDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";

// ============================================================
// Context shape
// ============================================================

interface AuthContextValue {
  /** Firebase Auth user (low-level) */
  firebaseUser: FirebaseUser | null;
  /** Full Firestore profile */
  user: UserProfile | null;
  /** True while checking initial auth state */
  loading: boolean;
  /** Register a new streamer account */
  register: (
    email: string,
    password: string,
    displayName: string,
    username: string
  ) => Promise<void>;
  /** Log in with email + password */
  login: (email: string, password: string) => Promise<void>;
  /** Log out */
  logout: () => Promise<void>;
  /** Refresh user profile from Firestore */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Firestore profile whenever Firebase Auth user changes
  const fetchProfile = useCallback(async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setUser(null);
      return;
    }
    try {
      const profile = await getUserProfile(fbUser.uid);
      setUser((prev) => {
        // Prevent stale 'null' overwrites if a manual fetch already populated the profile
        if (prev && !profile) return prev;
        return profile;
      });

      // Silently sync displayName to usernames collection for public queue
      if (profile?.username && profile?.displayName) {
        try {
          await updateDoc(
            doc(getFirebaseDb(), "usernames", profile.username),
            { displayName: profile.displayName }
          );
        } catch {
          // Non-critical — ignore silently
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Add a slight delay to allow createUserProfile to finish if this is a new signup
        // and avoid the race condition where fetchProfile returns null.
        setTimeout(async () => {
          await fetchProfile(fbUser);
          setLoading(false);
        }, 500);
      } else {
        await fetchProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [fetchProfile]);

  // ---- Actions ----

  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      username: string
    ) => {
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password
      );
      await createUserProfile(cred.user.uid, {
        displayName,
        email,
        username,
      });
      await fetchProfile(cred.user);
    },
    [fetchProfile]
  );

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    // Explicitly fetch the profile so `user` is populated BEFORE redirecting
    await fetchProfile(cred.user);
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile(firebaseUser);
  }, [firebaseUser, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        register,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
