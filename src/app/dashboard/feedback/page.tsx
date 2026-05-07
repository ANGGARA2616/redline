"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { submitFeedback } from "@/lib/firestore";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Star,
  CheckCircle,
  Loader2,
} from "lucide-react";

type FeedbackType = "bug" | "fitur" | "pengalaman" | "lainnya";

const TYPES: { value: FeedbackType; label: string; icon: React.ReactNode; color: string; activeClass: string }[] = [
  {
    value: "bug",
    label: "Laporan Bug",
    icon: <Bug className="w-4 h-4" />,
    color: "var(--qb-danger)",
    activeClass: "border-[var(--qb-danger)] bg-[rgba(255,107,107,0.1)] text-[var(--qb-danger)]",
  },
  {
    value: "fitur",
    label: "Saran Fitur",
    icon: <Lightbulb className="w-4 h-4" />,
    color: "var(--qb-fast-track)",
    activeClass: "border-[var(--qb-fast-track)] bg-[rgba(253,203,110,0.1)] text-[var(--qb-fast-track)]",
  },
  {
    value: "pengalaman",
    label: "Pengalaman",
    icon: <Star className="w-4 h-4" />,
    color: "var(--qb-accent)",
    activeClass: "border-[var(--qb-accent)] bg-[rgba(0,206,201,0.1)] text-[var(--qb-accent)]",
  },
  {
    value: "lainnya",
    label: "Lainnya",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "var(--text-secondary)",
    activeClass: "border-[var(--border-default)] bg-[var(--bg-glass)] text-[var(--text-primary)]",
  },
];

export default function FeedbackPage() {
  const { user } = useAuth();

  const [type, setType] = useState<FeedbackType>("pengalaman");
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setType("pengalaman");
    setRating(null);
    setHoverRating(null);
    setTitle("");
    setDescription("");
    setError(null);
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError("Judul minimal 5 karakter.");
      return;
    }

    if (type === "pengalaman" && rating === null) {
      setError("Pilih rating bintang untuk feedback pengalaman.");
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      await submitFeedback({
        userId: user.uid,
        username: user.username,
        email: user.email,
        type,
        rating: type === "pengalaman" ? rating : null,
        title: title.trim(),
        description: description.trim(),
      });
      setSubmitted(true);
    } catch {
      setError("Gagal mengirim feedback. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card flex flex-col items-center text-center gap-4 py-12">
          <div className="w-16 h-16 rounded-full bg-[rgba(0,184,148,0.15)] flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[var(--qb-success)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Terima kasih atas feedback-nya!</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm">
              Pesan kamu sudah kami terima dan akan segera kami tinjau untuk membuat RedLine lebih baik.
            </p>
          </div>
          <button onClick={resetForm} className="btn btn-secondary mt-2">
            Kirim Feedback Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="w-7 h-7 text-[var(--qb-primary-light)]" />
        <div>
          <h1 className="text-2xl font-bold">Feedback & Ulasan</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Laporkan bug, usulkan fitur, atau ceritakan pengalamanmu menggunakan RedLine.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card space-y-6">
          {/* Type selector */}
          <div>
            <label className="label block mb-2">Jenis Feedback</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setType(t.value);
                    if (t.value !== "pengalaman") setRating(null);
                  }}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                    type === t.value
                      ? t.activeClass
                      : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[rgba(167,169,190,0.35)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t.icon}
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Star rating — only for "pengalaman" */}
          {type === "pengalaman" && (
            <div>
              <label className="label block mb-2">Rating Pengalaman</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating ?? rating ?? 0) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="transition-transform hover:scale-110"
                      title={`${star} bintang`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          filled
                            ? "text-[var(--qb-fast-track)] fill-[var(--qb-fast-track)]"
                            : "text-[var(--border-default)]"
                        }`}
                      />
                    </button>
                  );
                })}
                {rating && (
                  <span className="ml-2 self-center text-sm text-[var(--text-secondary)]">
                    {["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"][rating]}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="label block" htmlFor="fb-title">
              Judul / Ringkasan
            </label>
            <input
              id="fb-title"
              type="text"
              className="input mt-1"
              placeholder={
                type === "bug"
                  ? "Contoh: Tombol 'Panggil Berikutnya' tidak merespons"
                  : type === "fitur"
                  ? "Contoh: Bisa tambah gambar profil streamer"
                  : "Ringkasan singkat feedback kamu"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Description */}
          <div>
            <label className="label block" htmlFor="fb-desc">
              Deskripsi Detail <span className="text-[var(--text-muted)] font-normal">(opsional)</span>
            </label>
            <textarea
              id="fb-desc"
              className="input mt-1 resize-none"
              rows={5}
              placeholder={
                type === "bug"
                  ? "Jelaskan langkah-langkah yang menyebabkan bug ini terjadi, dan apa yang kamu harapkan seharusnya terjadi."
                  : type === "fitur"
                  ? "Jelaskan fitur yang kamu inginkan dan bagaimana fitur itu akan membantu kamu."
                  : "Ceritakan pengalamanmu menggunakan RedLine sejauh ini."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1 text-right">
              {description.length}/2000
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[var(--qb-danger)] bg-[rgba(255,107,107,0.1)] px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim...
              </span>
            ) : (
              "Kirim Feedback"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
