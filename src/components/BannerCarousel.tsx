import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  order: number;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("order", "asc"));
    return onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] max-h-[500px] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.a
          key={banners[currentIndex].id}
          href={banners[currentIndex].link}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute inset-0 block"
        >
          <img 
            src={banners[currentIndex].imageUrl} 
            alt="Promotion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-darker via-transparent to-transparent opacity-60" />
        </motion.a>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-brand' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
