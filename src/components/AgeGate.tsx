import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Check, HelpCircle } from "lucide-react";

export default function AgeGate() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isAccepted = localStorage.getItem("ar_anime_18_accepted");
    if (!isAccepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ar_anime_18_accepted", "true");
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="age-gate-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            id="age-gate-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-lg bg-bg-dark border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Shield Icon */}
            <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/10 mx-auto">
              <ShieldAlert className="text-brand w-8 h-8 animate-pulse" />
            </div>

            <h2 className="text-center text-3xl font-black uppercase tracking-tighter text-white italic">
              B <span className="text-brand">BLAZE</span> VERIFICATION
            </h2>
            <p className="text-center text-[10px] uppercase tracking-[0.25em] text-white/40 mt-1 mb-6 font-bold">
              Age Gate / Terms &amp; Conditions
            </p>

            <div className="bg-bg-darker border border-white/5 rounded-2xl p-5 mb-8 h-40 overflow-y-auto text-xs text-white/50 space-y-4 leading-relaxed custom-scrollbar text-left select-none">
              <p className="font-bold text-white text-sm">Welcome to B BLAZE Network.</p>
              <p>
                By accessing this platform, you affirm under penalty of perjury that you are at least 18 years of age (or the age of majority in your jurisdiction, whichever is older).
              </p>
              <p className="font-bold text-white">1. Content Limitation &amp; Warning</p>
              <p>
                This application serves as a catalogue and cataloged search tool. Users will be redirected to external, third-party distribution files or video links. We do not host, store, or manage any videos or interactive media files directly on our servers.
              </p>
              <p className="font-bold text-white">2. External Links &amp; Liability</p>
              <p>
                All redirects and outbound destination folders (e.g. Telegram or storage directories) are compiled from publicly available materials. Clicking external resources is performed at your own discretion and absolute liability.
              </p>
              <p className="font-bold text-white">3. Platform Compliance</p>
              <p>
                As this app runs in a sandboxed mini app container, link tracking handles clicks on redirect objects for statistical indexing. No PII is collected or tracked.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                id="age-gate-decline-btn"
                onClick={handleDecline}
                className="flex-1 border border-white/10 hover:border-white/20 bg-white/5 text-white/60 hover:text-white transition-all py-3.5 rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Exit (I am under 18)
              </button>
              <button
                id="age-gate-accept-btn"
                onClick={handleAccept}
                className="flex-1 bg-brand hover:bg-brand-dark hover:scale-[1.02] shadow-[0_0_20px_rgba(244,117,33,0.3)] text-white transition-all py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> I Agree &amp; Enter (18+)
              </button>
            </div>

            <p className="text-center text-[10px] text-white/25 mt-6 font-mono">
              IP tracking is disabled. Encryption keys active.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
