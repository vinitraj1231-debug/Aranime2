import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function TopProgressBar() {
  const [loadingCount, setLoadingCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleStart = () => {
      setLoadingCount((c) => c + 1);
    };

    const handleEnd = () => {
      setLoadingCount((c) => Math.max(0, c - 1));
    };

    window.addEventListener("ar_progress_start", handleStart);
    window.addEventListener("ar_progress_end", handleEnd);

    return () => {
      window.removeEventListener("ar_progress_start", handleStart);
      window.removeEventListener("ar_progress_end", handleEnd);
    };
  }, []);

  const isLoading = loadingCount > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;

    if (isLoading) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) {
            clearInterval(interval);
            return 92;
          }
          // Smooth asymptotic progression
          const increment = (100 - prev) * 0.12;
          return prev + increment;
        });
      }, 120);
    } else {
      setProgress((prev) => {
        if (prev > 0) {
          timer = setTimeout(() => {
            setProgress(0);
          }, 350);
          return 100;
        }
        return 0;
      });
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  const showBar = progress > 0;

  return (
    <AnimatePresence>
      {showBar && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed top-0 left-0 right-0 h-[2.5px] z-[100000] pointer-events-none overflow-visible bg-white/[0.02]"
        >
          {/* Spring filled indicator banner */}
          <motion.div
            className="h-full bg-gradient-to-r from-brand/80 via-brand to-brand relative rounded-r-full"
            style={{ width: `${progress}%` }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 18,
            }}
          >
            {/* Front tail neon spark glow emitter */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-12 bg-brand/55 rounded-full blur-[4px] shadow-[0_0_12px_#f47521]" />
            <div className="absolute right-0 top-0 h-full w-4 bg-white/40 blur-[1px] rounded-r-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
