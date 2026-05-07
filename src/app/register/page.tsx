"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { isUsernameTaken } from "@/lib/firestore";
import { Gamepad2, ArrowLeft, Loader2 } from "lucide-react";

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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setTierParam(params.get("tier"));
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) { setError("Nama streamer wajib diisi."); return; }

    const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (slug.length < 3) { setError("Username minimal 3 karakter (huruf, angka, - atau _)."); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter."); return; }
    if (password !== confirmPassword) { setError("Konfirmasi password tidak cocok."); return; }

    setLoading(true);
    try {
      const taken = await isUsernameTaken(slug);
      if (taken) { setError("Username sudah dipakai. Coba yang lain."); setLoading(false); return; }

      await register(email, password, displayName.trim(), slug);
      if (tierParam) {
        router.push(`/pricing?auto_checkout=${tierParam}`);
      } else {
        router.push("/dashboard/settings");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[120px]"
          style={{ background: "var(--qb-primary)" }} />
        <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] rounded-full opacity-[0.10] blur-[120px]"
          style={{ background: "var(--qb-accent)" }} />
        <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full opacity-[0.06] blur-[80px]"
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
            <span className="text-2xl font-bold gradient-text">QueueBareng</span>
          </Link>
          <p className="text-[var(--text-secondary)] mt-3 text-sm">Buat akun streamer baru — gratis 7 hari</p>
        </div>

        {/* Card */}
        <div className="card shadow-[var(--shadow-lg)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="label">Nama Streamer</label>
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

            <div>
              <label htmlFor="username" className="label">Username</label>
              <div className="flex items-center">
                <span className="text-sm text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-default)] border-r-0 rounded-l-[var(--radius-md)] px-3 h-[2.625rem] flex items-center select-none shrink-0">
                  /queue/
                </span>
                <input
                  id="username"
                  type="text"
                  className="input rounded-l-none"
                  placeholder="jessnolimit"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  required
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                URL antrian publik: /queue/<span className="text-[var(--qb-primary-light)]">{username || "username"}</span>
              </p>
            </div>

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
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label">Konfirmasi</label>
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
            </div>

            {error && (
              <div className="text-sm text-[var(--qb-danger)] bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.2)] rounded-[var(--radius-md)] px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...
                </span>
              ) : "Daftar & Mulai Gratis"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border-default)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Sudah punya akun?{" "}
              <Link
                href={`/login${tierParam ? `?tier=${tierParam}` : ""}`}
                className="text-[var(--qb-primary-light)] hover:underline font-medium"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center mt-5">
          ✨ Free trial 7 hari otomatis aktif. Tanpa kartu kredit.
        </p>
      </div>
    </div>
  );
}
