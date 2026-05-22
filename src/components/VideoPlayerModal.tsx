import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Tv, RefreshCw, Maximize, RotateCw, Volume2, ShieldAlert } from "lucide-react";

interface VideoPlayerProps {
  title: string;
  urls: {
    videoUrl1080?: string;
    videoUrl720?: string;
    videoUrl480?: string;
    videoUrl360?: string;
  };
  defaultAspect?: "horizontal" | "vertical";
  onClose: () => void;
  onPlayTracked: () => void;
}

export default function VideoPlayerModal({ 
  title, 
  urls, 
  defaultAspect = "horizontal", 
  onClose,
  onPlayTracked
}: VideoPlayerProps) {
  // Available qualities
  const qualities = [
    { label: "1080p", url: urls.videoUrl1080 },
    { label: "720p", url: urls.videoUrl720 },
    { label: "480p", url: urls.videoUrl480 },
    { label: "360p", url: urls.videoUrl360 },
  ].filter(q => q.url && q.url.trim() !== "");

  const [currentQuality, setCurrentQuality] = useState(() => {
    return qualities[0] || { label: "Source", url: urls.videoUrl1080 || urls.videoUrl720 || urls.videoUrl480 || urls.videoUrl360 || "" };
  });

  const [aspect, setAspect] = useState<"horizontal" | "vertical">(defaultAspect);
  const [loading, setLoading] = useState(true);
  const [errorFlag, setErrorFlag] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playTrackedRef = useRef(false);

  // Converts standard non-embeddable URLs on-the-fly to beautiful sandbox-friendly embed links
  const getEmbedUrl = (url: string): string => {
    if (!url) return "";
    let formatted = url.trim();

    // YouTube watch URLs converter
    if (formatted.includes("youtube.com/watch?v=")) {
      try {
        const urlObj = new URL(formatted);
        const videoId = urlObj.searchParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
      } catch (e) {
        // Fallback
      }
    }

    // YouTube short links converter
    if (formatted.includes("youtu.be/")) {
      try {
        const parts = formatted.split("youtu.be/");
        const videoId = parts[1]?.split("?")[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
      } catch (e) {
        // Fallback
      }
    }

    // Google Drive share links converter
    if (formatted.includes("drive.google.com/file/d/") && !formatted.includes("/preview")) {
      try {
        const parts = formatted.split("/file/d/");
        const fileId = parts[1]?.split("/")[0];
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }
      } catch (e) {
        // Fallback
      }
    }

    return formatted;
  };

  const detectPlayerMode = (url: string): "video" | "iframe" => {
    if (!url) return "video";
    const lowercase = url.toLowerCase();

    // Standard video sharing embedding triggers
    if (
      lowercase.includes("embed") ||
      lowercase.includes("iframe") ||
      lowercase.includes("youtube.com") ||
      lowercase.includes("youtu.be") ||
      lowercase.includes("drive.google.com") ||
      lowercase.includes("vimeo.com") ||
      lowercase.includes("player.") ||
      lowercase.includes("ok.ru") ||
      lowercase.includes("dood") ||
      lowercase.includes("streamtape") ||
      lowercase.includes("t.me") ||
      lowercase.includes("telegram")
    ) {
      return "iframe";
    }

    const directVideoExtensions = [".mp4", ".webm", ".m3u8", ".ogg", ".mov", ".avi", ".ts", ".mkv"];
    const hasExtension = directVideoExtensions.some(ext => lowercase.split('?')[0].endsWith(ext));

    return hasExtension ? "video" : "iframe";
  };

  const [playerMode, setPlayerMode] = useState<"video" | "iframe">(() => {
    return detectPlayerMode(currentQuality.url || "");
  });

  // Track play exactly once upon starting playback
  const handlePlay = () => {
    if (!playTrackedRef.current) {
      playTrackedRef.current = true;
      onPlayTracked();
    }
  };

  // Sync quality change but keep timestamp
  const handleQualityChange = (newQual: typeof qualities[0]) => {
    if (!newQual) return;
    setLoading(true);
    setCurrentQuality(newQual);
    setErrorFlag(false);

    const targetMode = detectPlayerMode(newQual.url || "");
    setPlayerMode(targetMode);

    if (targetMode === "video") {
      setTimeout(() => {
        if (!videoRef.current) return;
        try {
          videoRef.current.src = newQual.url!;
          videoRef.current.load();
          
          const onMetadataLoaded = () => {
            if (videoRef.current) {
              setLoading(false);
              videoRef.current.play().catch(e => console.log("Playback start prevented:", e));
              videoRef.current.removeEventListener("loadedmetadata", onMetadataLoaded);
            }
          };
          
          videoRef.current.addEventListener("loadedmetadata", onMetadataLoaded);
        } catch (e) {
          console.error("Video quality shift bug:", e);
          setLoading(false);
        }
      }, 50);
    } else {
      // Iframe mode finishes resolving with native frame onLoad
    }
  };

  return (
    <div id="video-overlay-player-modal" className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Neon Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-4xl flex items-center justify-between mb-4 z-10">
        <div className="min-w-0 pr-4">
          <span className="text-[10px] bg-brand/20 border border-brand/30 text-brand px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest font-mono">
            IN-APP FULLPLAYER
          </span>
          <h2 className="text-white text-base md:text-lg font-black truncate mt-1.5 italic uppercase tracking-tight">
            {title}
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/15 h-12 w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:rotate-90"
          title="Exit player"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Screen Stage */}
      <div 
        className={`relative bg-black rounded-3xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 z-10 select-none ${
          aspect === "vertical" 
            ? "h-[68vh] aspect-[9/16] max-h-[640px]" 
            : "w-full max-w-3xl aspect-[16/9]"
        }`}
      >
        {loading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-20">
            <RefreshCw className="w-8 h-8 text-brand animate-spin" />
            <p className="text-[10px] font-black uppercase text-white/45 tracking-wider font-mono">Calibrating Stream Connection...</p>
          </div>
        )}

        {errorFlag && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-1">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <p className="text-white font-extrabold text-sm uppercase tracking-wider">Playback Connection Denied</p>
            <p className="text-white/40 text-[10px] max-w-xs leading-normal">
              The direct stream provider rejected direct framing requests. Make sure you provided a valid direct video link (.mp4, etc.)
            </p>
            <button 
              onClick={() => setErrorFlag(false)}
              className="mt-2 text-[10px] font-black uppercase text-brand tracking-widest hover:underline"
            >
              Reset Error Overlay
            </button>
          </div>
        )}

        {playerMode === "iframe" ? (
          <iframe
            src={getEmbedUrl(currentQuality.url || "")}
            className="w-full h-full border-0 rounded-3xl bg-black"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="no-referrer"
            onLoad={() => {
              setLoading(false);
              handlePlay();
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={currentQuality.url || ""}
            controls
            autoPlay
            onPlay={handlePlay}
            onCanPlay={() => setLoading(false)}
            onWaiting={() => setLoading(true)}
            onError={() => {
              setLoading(false);
              if (currentQuality.url) {
                setErrorFlag(true);
              }
            }}
            className="w-full h-full object-cover rounded-3xl bg-black"
          />
        )}
      </div>

      {/* Bottom Option Controllers */}
      <div className="w-full max-w-3xl mt-6 flex flex-col md:flex-row items-center justify-between gap-4 z-10 bg-bg-dark border border-white/5 p-4 rounded-2xl">
        {/* Aspect orientation switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/35 font-black uppercase tracking-wider">Layout:</span>
            <div className="flex gap-1.5 p-1 bg-black/60 rounded-xl border border-white/5">
              <button
                onClick={() => setAspect("horizontal")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  aspect === "horizontal" 
                    ? "bg-brand text-white shadow-md" 
                    : "text-white/40 hover:text-white"
                }`}
              >
                Landscape
              </button>
              <button
                onClick={() => setAspect("vertical")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  aspect === "vertical" 
                    ? "bg-brand text-white shadow-md" 
                    : "text-white/40 hover:text-white"
                }`}
              >
                Portrait Reel
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/35 font-black uppercase tracking-wider">Engine:</span>
            <div className="flex gap-1.5 p-1 bg-black/60 rounded-xl border border-white/5">
              <button
                onClick={() => {
                  setPlayerMode("video");
                  setLoading(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  playerMode === "video" 
                    ? "bg-brand text-white shadow-md" 
                    : "text-white/40 hover:text-white"
                }`}
              >
                Direct MP4
              </button>
              <button
                onClick={() => {
                  setPlayerMode("iframe");
                  setLoading(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  playerMode === "iframe" 
                    ? "bg-brand text-white shadow-md" 
                    : "text-white/40 hover:text-white"
                }`}
              >
                Embed Frame
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Quality switches */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/35 font-black uppercase tracking-wider">Quality:</span>
          <div className="flex flex-wrap gap-1 bg-black/60 p-1 rounded-xl border border-white/5">
            {qualities.length > 0 ? (
              qualities.map(q => (
                <button
                  key={q.label}
                  onClick={() => handleQualityChange(q)}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                    currentQuality.label === q.label
                      ? "bg-brand text-white shadow-md"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {q.label}
                </button>
              ))
            ) : (
              <span className="text-[9px] font-black text-white/45 px-3 py-1.5">No quality config found</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
