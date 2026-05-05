"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setLoading(true);

    try {
      await login(email, password);
      if (tierParam) {
        router.push(`/pricing?auto_checkout=${tierParam}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan.";
      if (
        msg.includes("user-not-found") ||
        msg.includes("wrong-password") ||
        msg.includes("invalid-credential")
      ) {
        setError("Email atau password salah.");
      } else if (msg.includes("too-many-requests")) {
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
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
            "radial-gradient(circle, var(--qb-accent), transparent)",
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
            Masuk ke dashboard streamer
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                autoFocus
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
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Masuk...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-[var(--border-default)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Belum punya akun?{" "}
              <Link
                href={`/register${tierParam ? `?tier=${tierParam}` : ''}`}
                className="text-[var(--qb-primary-light)] hover:underline font-medium"
              >
                Daftar gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
