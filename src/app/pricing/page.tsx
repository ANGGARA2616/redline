"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Check, Loader2, Sparkles, Zap, ShieldCheck, ArrowLeft } from "lucide-react";
import Script from "next/script";

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: 50000,
    features: [
      "Maksimal 20 antrian per sesi",
      "Input manual antrian",
      "Auto-detect nominal donasi",
      "Dukungan komunitas",
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 300000,
    features: [
      "Maksimal 100 antrian per sesi",
      "Input manual antrian",
      "Webhook Sociabuzz otomatis",
      "Auto-detect nominal donasi",
      "Prioritas dukungan tim",
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    price: 500000,
    features: [
      "Antrian tidak terbatas",
      "Semua fitur Pro",
      "OBS Overlay",
      "Kustomisasi tema public queue",
    ],
    icon: ShieldCheck,
    popular: false,
  },
];

export default function PricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasAutoTriggered = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/pricing");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !hasAutoTriggered.current) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const autoTier = params.get("auto_checkout");
        if (autoTier) {
          const tierObj = TIERS.find((t) => t.id === autoTier);
          if (tierObj) {
            hasAutoTriggered.current = true;
            setTimeout(() => {
              if ((window as any).snap) handleSubscribe(tierObj);
            }, 500);
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const handleSubscribe = async (tier: typeof TIERS[number]) => {
    if (!user) return;
    setProcessingId(tier.id);
    try {
      const res = await fetch("/api/midtrans/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tier.id, price: tier.price, userId: user.uid, email: user.email, name: user.displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      (window as any).snap.pay(data.token, {
        onSuccess: async (result: any) => {
          console.log("Success:", result);
          await handlePaymentSuccess(tier.id);
        },
        onPending: () => { alert("Menunggu pembayaran Anda."); setProcessingId(null); },
        onError: () => { alert("Pembayaran gagal."); setProcessingId(null); },
        onClose: () => setProcessingId(null),
      });
    } catch (error) {
      console.error(error);
      alert("Gagal memproses pembayaran");
      setProcessingId(null);
    }
  };

  const handlePaymentSuccess = async (tierId: string) => {
    if (!user) return;
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        await updateDoc(userRef, {
          "subscription.tier": tierId,
          "subscription.expiresAt": expiresAt.toISOString(),
        });
      }
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to update subscription:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--qb-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-12 px-4 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: "var(--qb-primary)" }} />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: "var(--qb-accent)" }} />
        <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: "var(--qb-fast-track)" }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Pilih Paket <span className="gradient-text">RedLine</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Tingkatkan efisiensi manajemen antrian mabar kamu dengan platform profesional.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center pt-6">
          {TIERS.map((tier) => {
            const isCurrentTier = user?.subscription?.tier === tier.id;
            return (
              <div
                key={tier.id}
                className={`lp-pricing ${tier.popular ? "lp-pricing--popular" : ""}`}
              >
                {tier.popular && <div className="lp-pricing-tag">Paling Laris</div>}

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`lp-card-icon ${tier.popular ? "lp-card-icon--magenta" : ""}`}
                    style={{ marginBottom: 0 }}
                  >
                    <tier.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{tier.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-black text-white">
                    Rp {(tier.price / 1000).toLocaleString("id-ID")}k
                  </span>
                  <span className="text-[var(--lp-text-muted)] ml-1">/bulan</span>
                </div>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.popular ? "lp-magenta-text" : "lp-cyan-text"}`} />
                      <span className="text-sm text-[var(--lp-text-dim)]">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={processingId !== null || isCurrentTier}
                  className={`lp-btn w-full ${
                    isCurrentTier
                      ? "opacity-40 cursor-not-allowed !border-white/10 !text-white/40 !bg-transparent !shadow-none"
                      : tier.popular
                      ? "lp-btn-primary"
                      : "lp-btn-secondary"
                  }`}
                >
                  {isCurrentTier ? (
                    "Paket Saat Ini"
                  ) : processingId === tier.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Pilih ${tier.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm glass-strong rounded-[var(--radius-xl)] p-8 text-center animate-slide-up shadow-[var(--shadow-lg)]">
            <div className="w-16 h-16 rounded-full bg-[rgba(0,206,201,0.15)] text-[var(--qb-accent)] flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Terima kasih telah berlangganan. Status akun kamu telah diperbarui.
            </p>
            <button onClick={() => router.push("/dashboard")} className="btn btn-primary w-full">
              Lanjut ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
