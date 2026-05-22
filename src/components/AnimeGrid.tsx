import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import AnimeCard from "./AnimeCard";
import { CardSkeleton } from "./Skeleton";

interface Anime {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  category?: string;
  keywords?: string;
  rating?: number;
  isFeatured?: boolean;
  clicks: number;
  videoType?: "redirect" | "video";
  videoUrl1080?: string;
  videoUrl720?: string;
  videoUrl480?: string;
  videoUrl360?: string;
  videoAspect?: "horizontal" | "vertical";
}

export default function AnimeGrid({ search = "", category = "All", sortBy = "latest" }: { search?: string, category?: string, sortBy?: "latest" | "trending" }) {
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ar_progress_start"));
    const q = query(collection(db, "anime"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime)));
      setLoading(false);
      window.dispatchEvent(new CustomEvent("ar_progress_end"));
    }, (error) => {
      console.error(error);
      setLoading(false);
      window.dispatchEvent(new CustomEvent("ar_progress_end"));
    });
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.keywords && item.keywords.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "trending") {
      return (b.clicks || 0) - (a.clicks || 0);
    }
    return 0; // retain natural firestore order (newest created first)
  });

  const handleLinkClick = async (item: Anime) => {
    if (item.videoType === "video") {
      window.dispatchEvent(new CustomEvent("ar_play_video", { detail: item }));
      return;
    }

    try {
      const animeDocRef = doc(db, "anime", item.id);
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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
      if (item.link) {
        window.open(item.link, '_blank');
      }
    } catch (e) {
      console.error("Click logging error:", e);
      if (item.link) {
        window.open(item.link, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-6 p-4 max-w-[1600px] mx-auto">
        {[...Array(12)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-6 p-4 max-w-[1600px] mx-auto">
      <AnimatePresence mode="popLayout">
        {sortedItems.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.03,
              ease: [0.23, 1, 0.32, 1] 
            }}
          >
            <AnimeCard anime={item} onClick={() => handleLinkClick(item)} />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {sortedItems.length === 0 && (
        <div className="col-span-full py-20 text-center text-white/30">
          <p className="text-lg">No anime found{search ? ` for "${search}"` : ""}.</p>
          <p className="text-sm">Try a different search term or come back later!</p>
        </div>
      )}
    </div>
  );
}
