import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "motion/react";
import AnimeCard from "./AnimeCard";

interface Anime {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  category?: string;
  clicks: number;
}

export default function AnimeGrid({ search = "", category = "All" }: { search?: string, category?: string }) {
  const [items, setItems] = useState<Anime[]>([]);

  useEffect(() => {
    const q = query(collection(db, "anime"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime)));
    });
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleLinkClick = async (id: string, link: string) => {
    try {
      await updateDoc(doc(db, "anime", id), {
        clicks: increment(1)
      });
      window.open(link, '_blank');
    } catch (e) {
      console.error(e);
      window.open(link, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {filteredItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <AnimeCard anime={item} onClick={() => handleLinkClick(item.id, item.link)} />
        </motion.div>
      ))}
      
      {filteredItems.length === 0 && (
        <div className="col-span-full py-20 text-center text-white/30">
          <p className="text-lg">No anime found{search ? ` for "${search}"` : ""}.</p>
          <p className="text-sm">Try a different search term or come back later!</p>
        </div>
      )}
    </div>
  );
}
