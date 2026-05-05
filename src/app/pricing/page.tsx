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
    price: 150000,
    features: [
      "Maksimal 20 antrian per sesi",
      "Game Log 7 hari terakhir",
      "Basic Auto-detect nominal",
      "Dukungan komunitas",
    ],
    icon: Zap,
    color: "text-[var(--qb-normal)]",
    bg: "bg-[var(--qb-normal)]",
    border: "border-[rgba(116,185,255,0.3)]",
    shadow: "shadow-[0_0_15px_rgba(116,185,255,0.15)]",
  },
  {
    id: "pro",
    name: "Pro",
    price: 300000,
    features: [
      "Antrian tidak terbatas",
      "Game Log 30 hari terakhir",
      "Smart Auto-detect & Anomaly",
      "Prioritas dukungan tim",
    ],
    icon: Sparkles,
    color: "text-[var(--qb-fast-track)]",
    bg: "bg-[var(--qb-fast-track)]",
    border: "border-[var(--qb-fast-track)]",
    shadow: "shadow-[0_0_20px_rgba(253,203,110,0.3)]",
    popular: true,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    price: 500000,
    features: [
      "Semua fitur Pro",
      "Game Log permanen",
      "Kustomisasi tema public queue",
      "Akses API (Post-MVP)",
    ],
    icon: ShieldCheck,
    color: "text-[var(--qb-accent)]",
    bg: "bg-[var(--qb-accent)]",
    border: "border-[rgba(0,206,201,0.3)]",
    shadow: "shadow-[0_0_15px_rgba(0,206,201,0.15)]",
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

  // Auto-checkout listener
  useEffect(() => {
    if (!loading && user && !hasAutoTriggered.current) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const autoTier = params.get("auto_checkout");
        if (autoTier) {
          const tierObj = TIERS.find((t) => t.id === autoTier);
          if (tierObj) {
            hasAutoTriggered.current = true;
            
            // Allow midtrans script a moment to load if needed
            setTimeout(() => {
              if ((window as any).snap) {
                handleSubscribe(tierObj);
              }
            }, 500);
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const handleSubscribe = async (tier: any) => {
    if (!user) return;
    setProcessingId(tier.id);

    try {
      const res = await fetch("/api/midtrans/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: tier.id,
          price: tier.price,
          userId: user.uid,
          email: user.email,
          name: user.displayName,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // Trigger Snap popup
      (window as any).snap.pay(data.token, {
        onSuccess: async function (result: any) {
          console.log("Success:", result);
          // For MVP frontend update (Webhook handles this in production)
          await handlePaymentSuccess(tier.id);
        },
        onPending: function (result: any) {
          console.log("Pending:", result);
          alert("Menunggu pembayaran Anda.");
          setProcessingId(null);
        },
        onError: function (result: any) {
          console.error("Error:", result);
          alert("Pembayaran gagal.");
          setProcessingId(null);
        },
        onClose: function () {
          setProcessingId(null);
        },
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
      // Simulate webhook processing on frontend for MVP simplicity
      const db = getFirebaseDb();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // +1 month
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
    <div className="min-h-screen pb-20 pt-12 px-4 relative overflow-hidden">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[var(--qb-primary)] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute top-0 left-0 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="text-center mb-16 pt-12 md:pt-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Pilih Paket <span className="gradient-text">QueueBareng</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Tingkatkan efisiensi manajemen antrian mabar Anda dengan platform profesional.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {TIERS.map((tier) => {
            const isCurrentTier = user?.subscription?.tier === tier.id;
            
            return (
            <div
              key={tier.id}
              className={`relative glass-strong rounded-[var(--radius-xl)] p-8 transition-all hover:-translate-y-2 ${
                tier.border
              } ${tier.popular ? `scale-105 ${tier.shadow}` : ""}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--qb-fast-track)] text-[var(--bg-base)] text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                  Paling Laris
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-[var(--bg-elevated)] ${tier.color}`}>
                  <tier.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold">
                  Rp {(tier.price / 1000).toLocaleString("id-ID")}k
                </span>
                <span className="text-[var(--text-muted)]">/bulan</span>
              </div>

              <div className="space-y-4 mb-8">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 ${tier.color}`} />
                    <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(tier)}
                disabled={processingId !== null || isCurrentTier}
                className={`w-full py-3 px-4 rounded-[var(--radius-md)] font-bold transition-all flex items-center justify-center gap-2 ${
                  isCurrentTier
                    ? "bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-default)]"
                    : tier.popular
                    ? "bg-[var(--qb-fast-track)] text-[var(--bg-base)] hover:bg-[rgba(253,203,110,0.9)] shadow-[0_4px_15px_rgba(253,203,110,0.3)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.1)] border border-[var(--border-default)]"
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
          )})}
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
              Terima kasih telah berlangganan. Status akun Anda telah diperbarui.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-primary w-full"
            >
              Lanjut ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
