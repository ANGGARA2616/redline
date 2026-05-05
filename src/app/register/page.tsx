"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { isUsernameTaken } from "@/lib/firestore";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tierParam, setTierParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setTierParam(params.get("tier"));
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Validations
    if (!displayName.trim()) {
      setError("Nama streamer wajib diisi.");
      return;
    }

    const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (slug.length < 3) {
      setError("Username minimal 3 karakter (huruf, angka, - atau _).");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      // Check username uniqueness
      const taken = await isUsernameTaken(slug);
      if (taken) {
        setError("Username sudah dipakai. Coba yang lain.");
        setLoading(false);
        return;
      }

      await register(email, password, displayName.trim(), slug);
      if (tierParam) {
        router.push(`/pricing?auto_checkout=${tierParam}`);
      } else {
        router.push("/dashboard/settings");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan.";
      if (msg.includes("email-already-in-use")) {
        setError("Email sudah terdaftar. Silakan login.");
      } else if (msg.includes("invalid-email")) {
        setError("Format email tidak valid.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--qb-primary), transparent)",
        }}
      />

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-20"
      >
        <span className="text-lg">←</span>
        <span className="text-sm font-medium">Kembali</span>
      </Link>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🎮</span>
            <span className="text-2xl font-bold gradient-text">
              QueueBareng
            </span>
          </Link>
          <p className="text-[var(--text-secondary)] mt-2">
            Buat akun streamer baru
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="label">
                Nama Streamer
              </label>
              <input
                id="displayName"
                type="text"
                className="input"
                placeholder="e.g. Jess No Limit"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <div className="flex items-center gap-0">
                <span className="text-sm text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-default)] border-r-0 rounded-l-[var(--radius-md)] px-3 py-[0.625rem] select-none">
                  /queue/
                </span>
                <input
                  id="username"
                  type="text"
                  className="input rounded-l-none"
                  placeholder="jessnolimit"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                    )
                  }
                  required
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                URL public queue kamu: /queue/{username || "username"}
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="streamer@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-[var(--qb-danger)] bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.2)] rounded-[var(--radius-md)] px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Mendaftar...
                </span>
              ) : (
                "Daftar & Mulai Gratis"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-[var(--border-default)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Sudah punya akun?{" "}
              <Link
                href={`/login${tierParam ? `?tier=${tierParam}` : ''}`}
                className="text-[var(--qb-primary-light)] hover:underline font-medium"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Trial info */}
        <p className="text-xs text-[var(--text-muted)] text-center mt-4">
          ✨ Free trial 7 hari otomatis aktif. Tanpa kartu kredit.
        </p>
      </div>
    </div>
  );
}
