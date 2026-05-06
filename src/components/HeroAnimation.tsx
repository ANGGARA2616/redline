"use client";
import React from "react";
import { motion } from "framer-motion";
import { User, DollarSign, Activity, Zap, MessageSquare, Gamepad2, ClipboardList } from "lucide-react";

export default function HeroAnimation() {
  const LOOP_DURATION = 10; // seconds

  return (
    <div className="relative w-full aspect-[4/3] flex items-center justify-center font-sans">

      {/* --- Stage 3: Data Flow Connection --- */}
      {/* Path line background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <line
          x1="35%" y1="20%" x2="55%" y2="70%"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <motion.line
          x1="35%" y1="20%" x2="55%" y2="70%"
          stroke="url(#glowGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            pathLength: [0, 0, 1, 1, 0, 0],
            opacity: [0, 0, 1, 0, 0, 0],
          }}
          transition={{
            duration: LOOP_DURATION,
            repeat: Infinity,
            times: [0, 0.55, 0.65, 0.7, 0.9, 1], // Starts at 5.5s, ends at 6.5s
            ease: "easeInOut",
          }}
        />
        <defs>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan */}
            <stop offset="100%" stopColor="#d946ef" /> {/* Magenta */}
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Particle */}
      <motion.div
        className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_3px_rgba(217,70,239,0.8)] z-20 pointer-events-none"
        animate={{
          left: ["35%", "35%", "55%", "55%", "35%"],
          top: ["20%", "20%", "70%", "70%", "20%"],
          opacity: [0, 0, 1, 0, 0],
          scale: [0.5, 0.5, 1.2, 0.5, 0.5]
        }}
        transition={{
          duration: LOOP_DURATION,
          repeat: Infinity,
          times: [0, 0.55, 0.65, 0.7, 1],
          ease: "easeInOut",
        }}
      />

      {/* --- Stage 1 & 2: Stream Window --- */}
      <div className="absolute top-[5%] left-[5%] w-[80%] md:w-[60%] h-[45%] md:h-[50%] bg-neutral-900/80 backdrop-blur-md rounded-xl border border-neutral-700/50 shadow-xl overflow-hidden flex flex-col z-10">
        {/* Browser/Window Header */}
        <div className="h-6 bg-neutral-950/50 border-b border-neutral-800 flex items-center px-3 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <div className="ml-2 text-[10px] text-neutral-500 font-medium">youtube.com/live</div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15)_0%,transparent_60%)] pointer-events-none" />
            
            {/* Dot Pattern */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                 style={{ backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }}
            />

            {/* Typography Art */}
            <div className="relative z-0 flex flex-col items-center justify-center text-center select-none pointer-events-none opacity-20">
              <div className="text-[28px] md:text-[40px] font-black leading-none tracking-tighter text-white">
                NOW
              </div>
              <div className="text-[24px] md:text-[36px] font-black leading-none tracking-tighter text-white -mt-1 md:-mt-2">
                STREAMING
              </div>
              <div className="mt-2 md:mt-3 px-3 py-1 bg-white/20 border border-white/20 rounded-full text-[8px] md:text-[10px] text-white font-mono tracking-widest uppercase">
                Waiting for players...
              </div>
            </div>

            {/* LIVE Badge */}
            <div className="px-2 py-0.5 bg-red-600/90 backdrop-blur-sm rounded text-[9px] font-bold text-white absolute top-3 left-3 flex items-center gap-1 shadow-lg z-10 border border-red-500/50">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>

            {/* Donation Notification Overlay (Stage 2) */}
            <motion.div
              className="absolute top-[10%] md:top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center z-20 w-full max-w-[180px]"
              animate={{
                opacity: [0, 0, 1, 1, 0, 0],
                y: [15, 15, 0, 0, -15, -15],
                scale: [0.85, 0.85, 1, 1, 0.85, 0.85]
              }}
              transition={{
                duration: LOOP_DURATION,
                repeat: Infinity,
                times: [0, 0.1, 0.15, 0.55, 0.6, 1],
                ease: "easeOut",
              }}
            >
              {/* Cyan Thanks Box */}
              <div className="bg-[#1abc9c] rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-lg flex flex-col items-center justify-center relative overflow-hidden w-auto min-w-[120px] md:min-w-[140px]">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-wider mb-0.5" 
                    style={{ textShadow: "1.5px 1.5px 0 #0f172a, 3px 3px 0 #0f172a" }}>
                  THANKS!
                </h1>
                <div className="w-3/4 h-[3px] md:h-1 bg-white relative mt-0.5 md:mt-1">
                  <div className="absolute top-[1.5px] md:top-[2px] left-0 w-full h-[2px] bg-[#0f172a]" />
                </div>
              </div>
              
              {/* Text underneath */}
              <div className="text-center font-black mt-1.5 md:mt-2 leading-tight w-full drop-shadow-md" 
                   style={{ textShadow: "1.5px 1.5px 0 #000, -1px -1px 0 #000, 1.5px -1px 0 #000, -1px 1.5px 0 #000, 0px 2px 3px rgba(0,0,0,1)" }}>
                <div className="text-[9px] md:text-[11px]">
                  <span className="text-[#39ff14]">IDR 50,000</span>
                  <span className="text-white mx-1">dari</span>
                  <span className="text-[#39ff14]">ReddRoses</span>
                </div>
                <div className="text-[#ffff00] text-[8px] md:text-[10px] mt-0.5 md:mt-1">
                  Sukses selalu ya!
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chat Area */}
          <div className="w-[30%] min-w-[100px] border-l border-neutral-700/50 bg-neutral-900/50 p-2 flex flex-col gap-2 overflow-hidden relative">
            <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Live Chat</div>
            <motion.div 
              className="flex flex-col gap-2"
              animate={{ y: [0, -120] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-start gap-1.5 opacity-60">
                  <div className="w-3 h-3 rounded-full bg-neutral-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 bg-neutral-600 rounded-full w-1/2" />
                    <div className="h-1.5 bg-neutral-700 rounded-full w-full" />
                  </div>
                </div>
              ))}
            </motion.div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-neutral-900 to-transparent" />
          </div>
        </div>
      </div>

      {/* --- Stage 4: Dashboard Window --- */}
      <div className="absolute bottom-[5%] right-[5%] w-[85%] md:w-[70%] h-[45%] md:h-[55%] bg-[var(--bg-base,#121212)] backdrop-blur-xl rounded-xl border border-[var(--border-default,#333)] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-10">
        {/* Dashboard Header */}
        <div className="h-8 md:h-10 border-b border-[var(--border-default,#333)] bg-[var(--bg-surface,#1e1e1e)] px-3 md:px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2 font-bold text-[10px] md:text-[12px] text-[var(--text-primary,#fff)]">
            <Gamepad2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--qb-primary,#0984e3)]" />
            <span>Dashboard</span>
          </div>
          <span className="bg-[var(--qb-danger,#d63031)]/20 text-[var(--qb-danger,#d63031)] px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--qb-danger,#d63031)] animate-pulse" /> LIVE
          </span>
        </div>
        
        {/* Queues */}
        <div className="flex-1 p-2.5 md:p-3 flex gap-2.5 md:gap-3 overflow-hidden">
          {/* Fast Track Column */}
          <div className="flex-1 bg-gradient-to-b from-[rgba(253,203,110,0.05)] to-transparent p-2 md:p-2.5 rounded-lg border border-[rgba(253,203,110,0.15)] flex flex-col min-w-0">
             <h2 className="text-[9px] md:text-[10px] font-semibold text-[var(--qb-fast-track,#fdcb6e)] mb-2 uppercase flex items-center justify-between shrink-0">
               <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> <span className="truncate">Fast Track</span></span>
               <div className="relative bg-[var(--qb-fast-track,#fdcb6e)] text-[var(--bg-base,#121212)] rounded-full text-[8px] md:text-[9px] font-bold w-4 h-4 md:w-4 md:h-4 flex items-center justify-center overflow-hidden shrink-0">
                 <motion.span 
                   className="absolute"
                   animate={{ y: [0, 0, -20, -20, 0] }}
                   transition={{ duration: LOOP_DURATION, repeat: Infinity, times: [0, 0.68, 0.73, 0.9, 1], ease: "backOut" }}
                 >1</motion.span>
                 <motion.span 
                   className="absolute"
                   animate={{ y: [20, 20, 0, 0, 20] }}
                   transition={{ duration: LOOP_DURATION, repeat: Infinity, times: [0, 0.68, 0.73, 0.9, 1], ease: "backOut" }}
                 >2</motion.span>
               </div>
             </h2>
             <div className="flex flex-col gap-1.5 overflow-hidden">
               {/* New Animated Entry */}
               <motion.div
                  className="overflow-hidden relative shrink-0"
                  animate={{
                    opacity: [0, 0, 1, 1, 0],
                    height: [0, 0, 52, 52, 0],
                    marginBottom: [0, 0, 6, 6, 0]
                  }}
                  transition={{ duration: LOOP_DURATION, repeat: Infinity, times: [0, 0.65, 0.7, 0.9, 1], ease: "easeOut" }}
               >
                 <motion.div 
                    className="p-1.5 md:p-2 rounded-lg bg-[var(--bg-elevated,#2a2a2a)] border border-[var(--qb-fast-track,#fdcb6e)]/30 h-[46px] flex flex-col justify-center"
                    animate={{ x: [20, 20, 0, 0, 0], scale: [0.9, 0.9, 1, 1, 0.9] }}
                    transition={{ duration: LOOP_DURATION, repeat: Infinity, times: [0, 0.65, 0.7, 0.9, 1], ease: "easeOut" }}
                 >
                   <div className="flex justify-between items-start mb-1">
                     <div className="text-[10px] md:text-[11px] font-bold text-[var(--text-primary,#fff)] truncate pr-1">ReddRoses</div>
                     <div className="text-[8px] md:text-[9px] font-mono text-[var(--text-secondary,#aaa)] shrink-0">Rp 50k</div>
                   </div>
                   <div>
                     <div className="text-[8px] md:text-[9px] text-[var(--qb-fast-track,#fdcb6e)] font-semibold bg-[var(--qb-fast-track,#fdcb6e)]/10 inline-block px-1 rounded">2 Game</div>
                   </div>
                 </motion.div>
               </motion.div>
               
               {/* Existing Entry */}
               <div className="p-1.5 md:p-2 rounded-lg bg-[var(--bg-elevated,#2a2a2a)] border border-[var(--border-default,#444)] shrink-0">
                 <div className="flex justify-between items-start mb-1">
                   <div className="text-[10px] md:text-[11px] font-bold text-[var(--text-primary,#fff)] truncate pr-1">ProGamer99</div>
                   <div className="text-[8px] md:text-[9px] font-mono text-[var(--text-secondary,#aaa)] shrink-0">Rp 20k</div>
                 </div>
                 <div className="text-[8px] md:text-[9px] text-[var(--text-secondary,#aaa)] font-semibold bg-[var(--bg-surface,#1e1e1e)] inline-block px-1 rounded border border-[var(--border-default,#444)]">1 Game</div>
               </div>
             </div>
          </div>
          
          {/* Normal Column */}
          <div className="flex-1 bg-gradient-to-b from-[rgba(116,185,255,0.05)] to-transparent p-2 md:p-2.5 rounded-lg border border-[rgba(116,185,255,0.15)] flex flex-col min-w-0">
             <h2 className="text-[9px] md:text-[10px] font-semibold text-[var(--qb-normal,#74b9ff)] mb-2 uppercase flex items-center justify-between shrink-0">
               <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" /> <span className="truncate">Normal</span></span>
               <span className="bg-[var(--qb-normal,#74b9ff)] text-[var(--bg-base,#121212)] px-1.5 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold">1</span>
             </h2>
             <div className="flex flex-col gap-1.5 overflow-hidden">
               <div className="p-1.5 md:p-2 rounded-lg bg-[var(--bg-elevated,#2a2a2a)] border border-[var(--border-default,#444)] shrink-0">
                 <div className="flex justify-between items-start mb-1">
                   <div className="text-[10px] md:text-[11px] font-bold text-[var(--text-primary,#fff)] truncate pr-1">NoobMaster</div>
                   <div className="text-[8px] md:text-[9px] font-mono text-[var(--text-secondary,#aaa)] shrink-0">Rp 10k</div>
                 </div>
                 <div className="text-[8px] md:text-[9px] text-[var(--text-secondary,#aaa)] font-semibold bg-[var(--bg-surface,#1e1e1e)] inline-block px-1 rounded border border-[var(--border-default,#444)]">1 Game</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
