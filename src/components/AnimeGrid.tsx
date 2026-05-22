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
}

export default function AnimeGrid({ search = "", category = "All", sortBy = "latest" }: { search?: string, category?: string, sortBy?: "latest" | "trending" }) {
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "anime"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime)));
      setLoading(false);
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

  const handleLinkClick = async (id: string, link: string) => {
    try {
      const animeDocRef = doc(db, "anime", id);
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
    } catch (e) {
      console.error("Click logging error:", e);
    } finally {
      window.open(link, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {[...Array(12)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-8 gap-x-4 p-4">
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
            <AnimeCard anime={item} onClick={() => handleLinkClick(item.id, item.link)} />
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
