import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import AgeGate from "./components/AgeGate";
import VideoPlayerModal from "./components/VideoPlayerModal";
import TopProgressBar from "./components/TopProgressBar";
import { doc, onSnapshot, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Wrench, ShieldAlert, ArrowRight } from "lucide-react";

function AppContent() {
  const [search, setSearch] = useState("");
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  
  const location = useLocation();

  useEffect(() => {
    // Safety timeout to prevent infinite loader if Firestore is offline
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 4500);

    const unsub = onSnapshot(doc(db, "config", "maintenance"), (snap) => {
      if (snap.exists()) {
        setIsMaintenance(snap.data().enabled || false);
      }
      setLoading(false);
      clearTimeout(safetyTimeout);
    }, (error) => {
      console.error("Error checking maintenance state:", error);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });
    return () => {
      unsub();
      clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    const handlePlayRequest = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setActiveVideo(detail);
      }
    };
    window.addEventListener("ar_play_video", handlePlayRequest);
    return () => window.removeEventListener("ar_play_video", handlePlayRequest);
  }, []);

  const handlePlayTrackedFromInApp = async (id: string) => {
    try {
      const animeDocRef = doc(db, "anime", id);
      const todayStr = new Date().toISOString().split('T')[0];
      const statDocRef = doc(db, "stats", todayStr);

      await Promise.all([
        updateDoc(animeDocRef, {
          clicks: increment(1)
        }),
        setDoc(statDocRef, {
          date: todayStr,
          totalClicks: increment(1)
        }, { merge: true })
      ]);
      console.log("Play confirmed and total clicks successfully incremented.");
    } catch (err) {
      console.error("Failed to log play clicks:", err);
    }
  };

  const normalizedPath = location.pathname.toLowerCase().trim().replace(/\/$/, "");
  const isAdminPath = normalizedPath.includes("admin") || window.location.pathname.toLowerCase().includes("admin") || window.location.hash.toLowerCase().includes("admin");

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-darker flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isMaintenance && !isAdminPath) {
    return (
      <>
        <AgeGate />
        <div className="min-h-screen bg-bg-darker text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Neon Glow spots */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/10 rounded-full blur-[125px] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand/5 rounded-full blur-[125px] pointer-events-none animate-pulse" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full bg-bg-dark border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative text-center z-10"
          >
            {/* Maintenance Glowing Ring */}
            <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
              <Wrench strokeWidth={1.2} className="text-brand w-9 h-9 animate-[transform_3s_ease-in-out_infinite] transform hover:rotate-45 transition-transform" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[8px] font-black font-mono">!</span>
              </span>
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tight italic mb-3">
              B <span className="text-brand">BLAZE</span> CALIBRATION
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black text-red-400 uppercase tracking-widest mb-6">
              <ShieldAlert strokeWidth={1.2} className="w-3.5 h-3.5" />
              <span>Offline Maintenance Active</span>
            </div>

            <p className="text-white/60 text-xs leading-relaxed mb-8">
              We are currently executing scheduled backend routing updates and network database calibrations to elevate your high-speed streaming experience. Normal access will resume instantly.
            </p>

            <div className="p-4 bg-bg-darker border border-white/5 rounded-2xl mb-8">
              <p className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-1">Status Report</p>
              <p className="text-xs font-bold text-brand uppercase font-mono">ENCRYPTED DATABASE OPTIMIZATION RUNNING</p>
            </div>

            {/* Secret entrance button */}
            <Link 
              to="/admin" 
              className="group inline-flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors cursor-pointer animate-pulse"
            >
              <span>Administrative Entrance</span>
              <ArrowRight strokeWidth={1.2} className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-brand" />
            </Link>
          </motion.div>

          <footer className="mt-12 text-center opacity-25 z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/50">B BLAZE SERVICE NET | SECURED CONTAINER</p>
          </footer>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 18+ Age Gate overlay */}
      <AgeGate />
      
      {/* Dynamic top-of-page slim progress bar */}
      <TopProgressBar />
      
      <div className="min-h-screen bg-bg-darker flex flex-col">
        <Navbar user={null} isAdmin={false} search={search} setSearch={setSearch} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home search={search} setSearch={setSearch} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <VideoPlayerModal
            title={activeVideo.title}
            urls={{
              videoUrl1080: activeVideo.videoUrl1080,
              videoUrl720: activeVideo.videoUrl720,
              videoUrl480: activeVideo.videoUrl480,
              videoUrl360: activeVideo.videoUrl360,
            }}
            defaultAspect={activeVideo.videoAspect || 'horizontal'}
            onClose={() => setActiveVideo(null)}
            onPlayTracked={() => handlePlayTrackedFromInApp(activeVideo.id)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
