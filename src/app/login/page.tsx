"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Gamepad2, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tierParam, setTierParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[120px]"
          style={{ background: "var(--qb-primary)" }} />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] rounded-full opacity-[0.10] blur-[120px]"
          style={{ background: "var(--qb-accent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]"
          style={{ background: "var(--qb-primary-light)" }} />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-20 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--qb-primary)] to-[var(--qb-accent)] flex items-center justify-center shadow-[0_0_20px_rgba(108,92,231,0.4)] group-hover:shadow-[0_0_30px_rgba(108,92,231,0.6)] transition-shadow">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold lp-gradient-text">RedLine</span>
          </Link>
          <p className="text-[var(--text-secondary)] mt-3 text-sm">Masuk ke dashboard streamer kamu</p>
        </div>

        {/* Card */}
        <div className="card shadow-[var(--shadow-lg)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
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

            <div>
              <label htmlFor="password" className="label">Password</label>
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

            {error && (
              <div className="text-sm text-[var(--qb-danger)] bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.2)] rounded-[var(--radius-md)] px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Masuk...
                </span>
              ) : "Masuk"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border-default)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Belum punya akun?{" "}
              <Link
                href={`/register${tierParam ? `?tier=${tierParam}` : ""}`}
                className="text-[var(--qb-primary-light)] hover:underline font-medium"
              >
                Daftar gratis
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center mt-5">
          ✨ Free trial 7 hari untuk akun baru. Tanpa kartu kredit.
        </p>
      </div>
    </div>
  );
}
