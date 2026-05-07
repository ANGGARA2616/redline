"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  Gamepad2,
  Zap,
  LayoutDashboard,
  ScrollText,
  RefreshCw,
  Globe,
  Wallet,
  ClipboardList,
  Video,
  CreditCard,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-theme min-h-screen flex flex-col">
      {/* Animated ambient orbs */}
      <div className="lp-ambient-orbs" aria-hidden="true">
        <div className="lp-orb lp-orb--cyan-1" />
        <div className="lp-orb lp-orb--magenta" />
        <div className="lp-orb lp-orb--cyan-2" />
      </div>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'lp-nav' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 group">
            <div className="relative">
              <Gamepad2 className="w-7 h-7 lp-cyan-text" />
              <div className="absolute inset-0 blur-md opacity-60">
                <Gamepad2 className="w-7 h-7 lp-cyan-text" />
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight lp-gradient-text">
              RedLine
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#demo" className="text-sm font-medium text-[var(--lp-text-dim)] hover:text-white transition-colors">
              Live Demo
            </Link>
            <Link href="#features" className="text-sm font-medium text-[var(--lp-text-dim)] hover:text-white transition-colors">
              Fitur
            </Link>
            <Link href="#how" className="text-sm font-medium text-[var(--lp-text-dim)] hover:text-white transition-colors">
              Cara Kerja
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-[var(--lp-text-dim)] hover:text-white transition-colors">
              Harga
            </Link>
            <Link href="#faq" className="text-sm font-medium text-[var(--lp-text-dim)] hover:text-white transition-colors">
              FAQ
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {loading ? null : user ? (
              <Link href="/dashboard" className="lp-btn lp-btn-primary lp-btn-sm">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="lp-btn lp-btn-ghost lp-btn-sm hidden sm:inline-flex">
                  Masuk
                </Link>
                <Link href="/register" className="lp-btn lp-btn-primary lp-btn-sm">
                  Mulai Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Stats Ticker */}
      <div className="lp-ticker fixed top-16 w-full z-40" aria-hidden="true">
        <div className="lp-ticker-track">
          <span><i></i> 4,287 ANTRIAN HARI INI</span>
          <span><i className="m"></i> RP 142M DONASI TERPROSES</span>
          <span><i className="g"></i> 99.97% UPTIME</span>
          <span><i></i> 0 DISPUTE BULAN INI</span>
          <span><i className="m"></i> 312 STREAMER AKTIF</span>
          <span><i className="g"></i> AUTO-DETECT &lt; 80MS</span>
          <span><i></i> 4,287 ANTRIAN HARI INI</span>
          <span><i className="m"></i> RP 142M DONASI TERPROSES</span>
          <span><i className="g"></i> 99.97% UPTIME</span>
          <span><i></i> 0 DISPUTE BULAN INI</span>
          <span><i className="m"></i> 312 STREAMER AKTIF</span>
          <span><i className="g"></i> AUTO-DETECT &lt; 80MS</span>
        </div>
      </div>

      <main className="flex-1 relative z-10">
        {/* ── Hero ── */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden -mt-16">
          <div className="lp-blob lp-blob--cyan" style={{ top: "0%", left: "-10%" }} />
          <div className="lp-blob lp-blob--magenta" style={{ top: "10%", right: "-10%" }} />

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <div className="text-center lg:text-left">
              <div className="lp-badge-live mb-5 inline-flex">
                <span className="lp-badge-live__dot" />
                LIVE · 312 STREAMER ON-AIR
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-5 tracking-tight">
                Antrian Mabar
                <br />
                Rasa{" "}
                <span className="lp-gradient-text">Esports.</span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--lp-text-dim)] max-w-xl mb-8 leading-relaxed lg:mx-0 mx-auto">
                Auto-detect nominal donasi, antrian real-time dual-lane, dan game log anti-dispute. Satu dashboard untuk semua chaos saat live streaming Mobile Legends.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10 lg:mb-0">
                <Link href="/register" className="lp-btn lp-btn-primary lp-btn-lg">
                  Mulai Gratis 7 Hari
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#pricing" className="lp-btn lp-btn-secondary lp-btn-lg">
                  Lihat Harga
                </Link>
              </div>

              <div className="lp-hero-meta justify-center lg:justify-start">
                <div className="stat">
                  <strong><em>312</em></strong>
                  Streamer aktif
                </div>
                <div className="stat">
                  <strong><em>4.2K</em></strong>
                  Antrian / hari
                </div>
                <div className="stat">
                  <strong><em>0</em></strong>
                  Dispute bulan ini
                </div>
              </div>
            </div>

            {/* Right column - Dashboard Preview */}
            <div className="lg:pl-4">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* ── Live Demo / Explainer ── */}
        <section className="py-16 px-6 relative" id="demo">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase lp-cyan-text border border-[rgba(0,245,255,0.3)] rounded-full">
                Live Demo
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Dari donasi penonton<br />
                <span className="lp-gradient-text">ke antrian dashboard.</span>
              </h2>
              <p className="text-[var(--lp-text-dim)] max-w-xl mx-auto">
                Lihat bagaimana sebuah donasi otomatis ter-parse jadi entry antrian — tanpa input manual, tanpa delay.
              </p>
            </div>

            <LiveDemoAnimation />
          </div>
        </section>

        <div className="lp-divider max-w-5xl mx-auto" />

        {/* ── Features ── */}
        <section className="py-16 px-6 relative" id="features">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase lp-cyan-text border border-[rgba(0,245,255,0.3)] rounded-full">
                Fitur
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Semua yang Kamu <span className="lp-gradient-text">Butuhkan</span>
              </h2>
              <p className="text-[var(--lp-text-dim)] max-w-xl mx-auto">
                Dari input order sampai game log, RedLine mengurus semuanya.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="lp-card animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`lp-card-icon ${f.magenta ? "lp-card-icon--magenta" : ""}`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                  <p className="text-sm text-[var(--lp-text-dim)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-16 px-6 relative" id="how">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,245,255,0.08), transparent 60%)",
            }}
          />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase lp-magenta-text border border-[rgba(255,45,120,0.3)] rounded-full">
                Cara Kerja
              </div>
              <h2 className="text-3xl sm:text-4xl font-black">
                Dari Donasi ke <span className="lp-gradient-text">Antrian</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="text-center animate-fade-in relative"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="lp-step-num mx-auto">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--lp-text-dim)]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-16 px-6 relative" id="pricing">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase lp-cyan-text border border-[rgba(0,245,255,0.3)] rounded-full">
                Harga
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Pilih Paket <span className="lp-gradient-text">RedLine</span>
              </h2>
              <p className="text-[var(--lp-text-dim)] max-w-2xl mx-auto">
                Tingkatkan efisiensi manajemen antrian mabar Anda.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {TIERS.map((tier) => (
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
                        <Check
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            tier.popular ? "lp-magenta-text" : "lp-cyan-text"
                          }`}
                        />
                        <span className="text-sm text-[var(--lp-text-dim)]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/register?tier=${tier.id}`}
                    className={`lp-btn w-full ${
                      tier.popular ? "lp-btn-primary" : "lp-btn-secondary"
                    }`}
                  >
                    Pilih {tier.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 px-6 relative" id="faq">
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center mb-10">
              <div className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest uppercase lp-magenta-text border border-[rgba(255,45,120,0.3)] rounded-full">
                FAQ
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-3">
                Pertanyaan <span className="lp-gradient-text">Umum</span>
              </h2>
              <p className="text-sm text-[var(--lp-text-dim)] max-w-xl mx-auto">
                Jawaban untuk pertanyaan yang sering ditanyakan tentang RedLine.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 px-6 relative overflow-hidden">
          <div className="lp-blob lp-blob--cyan" style={{ bottom: "-30%", left: "20%", opacity: 0.3 }} />
          <div className="lp-blob lp-blob--magenta" style={{ bottom: "-30%", right: "20%", opacity: 0.3 }} />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div
              className="rounded-3xl p-12 sm:p-16 border"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))",
                borderColor: "var(--lp-border)",
                boxShadow: "0 0 60px rgba(0, 245, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <h2 className="text-3xl sm:text-5xl font-black mb-4">
                Siap Upgrade <span className="lp-gradient-text">Antrian Kamu</span>?
              </h2>
              <p className="text-[var(--lp-text-dim)] mb-8 text-lg">
                Daftar sekarang dan nikmati 7 hari gratis. Tanpa kartu kredit.
              </p>
              <Link href="/register" className="lp-btn lp-btn-primary lp-btn-lg">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 border-t border-[var(--lp-border)] relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 lp-cyan-text" />
            <span className="font-bold lp-gradient-text">RedLine</span>
          </div>
          <p className="text-sm text-[var(--lp-text-muted)]">
            © {new Date().getFullYear()} RedLine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Live Demo Animation Component ──
function LiveDemoAnimation() {
  return (
    <div className="lp-explainer-stage">
      {/* LEFT: Stream + Chat */}
      <div>
        <div className="lp-stream-panel">
          <div className="lp-stream-bar">
            <span className="lp-stream-live">
              <i></i>LIVE
            </span>
            <span className="lp-stream-viewers">👁 2,481</span>
          </div>

          <div className="lp-stream-view">
            <div className="lp-stream-hud">
              <div className="top">
                <span className="lp-stream-badge">
                  RANK · <b>MYTHIC</b>
                </span>
                <span className="lp-stream-badge">15:42 · 04:18</span>
              </div>
            </div>

            {/* Donation popup that animates in */}
            <div className="lp-don-popup">
              <div className="top">
                <div className="nom">Rp 50.000</div>
                <div className="from">
                  dari <b>ReddRoses</b>
                </div>
              </div>
              <div className="id">ML ID · 166047234</div>
              <div className="msg">"gas kak, aim-nya jangan miss 🔥"</div>
            </div>
          </div>

          <div className="lp-live-chat">
            <div className="head">// LIVE CHAT</div>
            <div className="lp-chat-msg">
              <b>NikoX:</b> mantap kak
            </div>
            <div className="lp-chat-msg">
              <b>FahmiR:</b> kapan mabar?
            </div>
            <div className="lp-chat-msg">
              <b>JJaay:</b> push terus
            </div>
            <div className="lp-chat-msg">
              <b>Tania_:</b> 1 lagi kalah
            </div>
            <div className="lp-chat-msg donate">
              <b>ReddRoses</b> donasi 50K
            </div>
            <div className="lp-chat-msg">
              <b>RioG:</b> wkwkwk
            </div>
            <div className="lp-chat-msg">
              <b>Kak_Ezra:</b> 🔥🔥🔥
            </div>
          </div>
        </div>
        <div className="lp-ex-caption mg">
          01 · <b>Donasi masuk</b> di livestream
        </div>
      </div>

      {/* Data flow connector */}
      <div className="lp-data-flow">
        <div className="lp-data-packet"></div>
        <div className="lp-data-packet p2"></div>
        <div className="lp-data-packet p3"></div>
      </div>

      {/* RIGHT: Dashboard reveal */}
      <div>
        <div className="lp-ex-dashboard">
          <div className="lp-dash-bar-ex">
            <span style={{ color: "var(--lp-text-muted)" }}>
              redline.app/dashboard
            </span>
            <span className="lt">
              <i></i>SYNCED
            </span>
          </div>
          <div className="lp-ex-lane">
            <h4>
              FAST TRACK <span className="count">5</span>
            </h4>
            <div className="lp-ex-row">
              <span className="n">01</span>
              <span className="nm">
                RyzenML <small>ML · 192847123</small>
              </span>
              <span className="pk">100k</span>
            </div>
            <div className="lp-ex-row">
              <span className="n">02</span>
              <span className="nm">
                Kak_Ezra <small>ML · 287340912</small>
              </span>
              <span className="pk">100k</span>
            </div>
            <div className="lp-ex-row incoming">
              <span className="n">03</span>
              <span className="nm nm-wrap">
                <span className="nm-pending">
                  ??? <small>menunggu data...</small>
                </span>
                <span className="nm-real">
                  ReddRoses <small>ML · 166047234</small>
                </span>
              </span>
              <span className="pk">50k</span>
            </div>
            <div className="lp-ex-row" style={{ opacity: 0.5 }}>
              <span className="n">04</span>
              <span className="nm">
                DwiPro <small>ML · 309821740</small>
              </span>
              <span className="pk">200k</span>
            </div>
          </div>
        </div>
        <div className="lp-ex-caption">
          02 · <b>Dashboard ter-update</b> otomatis
        </div>
      </div>
    </div>
  );
}

// ── FAQ Item Component ──
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lp-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <h3 className="text-base font-bold text-white">{question}</h3>
        <ChevronDown
          className={`w-4 h-4 lp-cyan-text shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-[var(--lp-text-dim)] leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Preview Component ──
function DashboardPreview() {
  return (
    <div className="select-none">
      <div className="lp-dashboard">
        <div className="lp-dash-bar">
          <span className="lp-status-pill">
            <span className="lp-pip-mg" />
            SEDANG BERMAIN
          </span>
        </div>

        <div className="lp-dash-body">
          {/* Active Slots */}
          <div className="lp-slots-grid">
            <div className="lp-slot">
              <div className="lp-slot-top-bar" />
              <div className="lp-slot-head">
                <span className="lp-slot-id">1234567</span>
                <span className="lp-slot-tag lp-slot-tag--norm">NORMAL</span>
              </div>
              <div className="lp-slot-game">
                <span>Game 2 / 5</span>
                <span className="sisa">3 sisa</span>
              </div>
              <div className="lp-progress">
                <div className="lp-bar" style={{ width: "40%" }} />
              </div>
            </div>

            <div className="lp-slot">
              <div className="lp-slot-top-bar lp-slot-top-bar--fast" />
              <div className="lp-slot-head">
                <span className="lp-slot-id">3333333</span>
                <span className="lp-slot-tag lp-slot-tag--fast">FAST TRACK</span>
              </div>
              <div className="lp-slot-game">
                <span>Game 1 / 8</span>
                <span className="sisa">7 sisa</span>
              </div>
              <div className="lp-progress">
                <div className="lp-bar lp-bar--fast" style={{ width: "12%" }} />
              </div>
            </div>
          </div>

          {/* Call Next Button */}
          <button className="lp-call-next">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5,4 15,12 5,20" fill="currentColor" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
            Panggil Berikutnya
          </button>

          {/* Queue Lanes */}
          <div className="lp-lanes">
            <div className="lp-lane">
              <div className="lp-lane-head">
                <span className="lp-lane-title">FAST TRACK</span>
                <span className="lp-lane-count lp-lane-count--fast">2</span>
              </div>
              <div className="lp-qrow">
                <span className="lp-qnum lp-qnum--fast">1</span>
                <span className="lp-qid">1111111</span>
                <span className="lp-qmeta"><b>7</b> game</span>
              </div>
              <div className="lp-qrow">
                <span className="lp-qnum lp-qnum--fast">2</span>
                <span className="lp-qid">12345678</span>
                <span className="lp-qmeta"><b>3</b> game</span>
              </div>
            </div>

            <div className="lp-lane">
              <div className="lp-lane-head">
                <span className="lp-lane-title lp-lane-title--norm">NORMAL</span>
                <span className="lp-lane-count lp-lane-count--norm">2</span>
              </div>
              <div className="lp-qrow">
                <span className="lp-qnum lp-qnum--norm">1</span>
                <span className="lp-qid">9999999</span>
                <span className="lp-qmeta"><b>5</b> game</span>
              </div>
              <div className="lp-qrow">
                <span className="lp-qnum lp-qnum--norm">2</span>
                <span className="lp-qid">8888888</span>
                <span className="lp-qmeta"><b>2</b> game</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Static data ──

const FEATURES = [
  {
    icon: Zap,
    title: "Auto-Detect Nominal",
    desc: "Input nominal donasi, sistem otomatis mendeteksi paket dan jalur antrian. Tidak perlu hitung manual.",
  },
  {
    icon: LayoutDashboard,
    title: "Queue Real-Time",
    desc: "Dashboard dua jalur (Fast Track & Normal) yang update otomatis tanpa refresh.",
    magenta: true,
  },
  {
    icon: ScrollText,
    title: "Game Log Anti-Dispute",
    desc: "Setiap game tercatat dengan timestamp. Tidak ada lagi customer yang bisa bohong.",
  },
  {
    icon: RefreshCw,
    title: "Carry-Over Otomatis",
    desc: "Sisa game tersimpan dan muncul otomatis di sesi live berikutnya.",
    magenta: true,
  },
  {
    icon: Globe,
    title: "Public Queue Page",
    desc: "Link antrian yang bisa di-share ke penonton. Real-time dan mobile-friendly.",
  },
  {
    icon: Wallet,
    title: "Paket Harga Fleksibel",
    desc: "Atur sendiri paket harga, termasuk bundle. Sistem auto-mapping dari nominal.",
    magenta: true,
  },
];

const STEPS = [
  { icon: ClipboardList, title: "Setup Paket", desc: "Atur daftar harga paket main bareng kamu." },
  { icon: Video, title: "Mulai Sesi", desc: "Buka sesi live baru saat mulai streaming." },
  { icon: CreditCard, title: "Input Donasi", desc: "Masukkan nominal & ML ID, antrian terbentuk otomatis." },
  { icon: Gamepad2, title: "Main!", desc: "Klik mulai & selesai game. Log otomatis tercatat." },
];

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
  },
];

const FAQS = [
  {
    question: "Bagaimana cara kerja auto-detect nominal donasi?",
    answer: "Sistem RedLine otomatis mendeteksi paket berdasarkan nominal donasi yang Anda input. Misalnya, jika Anda atur paket 50k untuk 5 game dan ada donasi 100k, sistem langsung mendeteksi sebagai 10 game dan menempatkan di jalur yang sesuai.",
  },
  {
    question: "Apakah saya perlu install aplikasi khusus?",
    answer: "Tidak perlu. RedLine adalah aplikasi web yang bisa diakses langsung dari browser. Cukup login dan mulai kelola antrian Anda. Dashboard dapat dibuka di laptop, tablet, atau smartphone.",
  },
  {
    question: "Bagaimana jika ada dispute dari customer?",
    answer: "RedLine mencatat setiap game dengan timestamp lengkap di game log. Anda bisa tunjukkan riwayat game yang sudah dimainkan sebagai bukti. Fitur ini sangat membantu menghindari dispute dan menjaga reputasi Anda.",
  },
  {
    question: "Apakah bisa mengatur paket harga custom?",
    answer: "Ya, Anda bisa atur paket harga sesuai kebutuhan. Bisa buat paket normal (5k/game), fast track (10k/game), atau bundle special seperti 50k untuk 6 game. Sistem akan otomatis mapping dari nominal donasi.",
  },
  {
    question: "Bagaimana dengan sisa game yang belum selesai?",
    answer: "Sisa game otomatis tersimpan dan akan muncul kembali di sesi live berikutnya. Fitur carry-over ini memastikan customer tidak kehilangan hak mereka meskipun live stream sudah selesai.",
  },
  {
    question: "Apakah ada trial gratis?",
    answer: "Ya, semua paket mendapatkan free trial 7 hari tanpa perlu kartu kredit. Anda bisa mencoba semua fitur dan lihat sendiri bagaimana RedLine membantu manajemen antrian Anda.",
  },
];
