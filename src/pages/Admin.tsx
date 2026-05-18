import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Plus, Trash2, Eye, LayoutGrid, Image as ImageIcon, BarChart3, X } from "lucide-react";
import { motion } from "motion/react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'stats' | 'anime' | 'banners'>('stats');
  const [anime, setAnime] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  
  // Forms
  const [animeForm, setAnimeForm] = useState({ title: '', thumbnail: '', link: '' });
  const [bannerForm, setBannerForm] = useState({ imageUrl: '', link: '', order: 0 });

  useEffect(() => {
    const qAnime = query(collection(db, "anime"), orderBy("createdAt", "desc"));
    const unsubAnime = onSnapshot(qAnime, (snap) => setAnime(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const qBanners = query(collection(db, "banners"), orderBy("order", "asc"));
    const unsubBanners = onSnapshot(qBanners, (snap) => setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubAnime(); unsubBanners(); };
  }, []);

  const handleAddAnime = async (e: FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "anime"), {
      ...animeForm,
      clicks: 0,
      createdAt: serverTimestamp(),
      isActive: true
    });
    setAnimeForm({ title: '', thumbnail: '', link: '' });
  };

  const handleAddBanner = async (e: FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "banners"), {
      ...bannerForm,
      order: Number(bannerForm.order),
      createdAt: serverTimestamp()
    });
    setBannerForm({ imageUrl: '', link: '', order: banners.length });
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const totalViews = anime.reduce((acc, curr) => acc + (curr.clicks || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon /> Admin Control Center
        </h1>
        <div className="flex gap-2 bg-bg-dark p-1 rounded-lg border border-white/5">
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 />} label="Stats" />
          <TabButton active={activeTab === 'anime'} onClick={() => setActiveTab('anime')} icon={<LayoutGrid />} label="Anime" />
          <TabButton active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} icon={<ImageIcon />} label="Banners" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Shows" value={anime.length} icon={<LayoutGrid className="text-brand" />} />
            <StatCard label="Total Clicks/Views" value={totalViews} icon={<Eye className="text-cyan-400" />} />
            <StatCard label="Active Banners" value={banners.length} icon={<ImageIcon className="text-purple-400" />} />
          </motion.div>
        )}

        {activeTab === 'anime' && (
          <div className="space-y-8">
            <section className="bg-bg-dark p-6 rounded-xl border border-white/5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 italic"><Plus className="w-4 h-4" /> Add New Anime</h2>
              <form onSubmit={handleAddAnime} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Title" value={animeForm.title} onChange={v => setAnimeForm({...animeForm, title: v})} required />
                <Input label="Thumbnail URL" value={animeForm.thumbnail} onChange={v => setAnimeForm({...animeForm, thumbnail: v})} required />
                <Input label="Redirect Link" value={animeForm.link} onChange={v => setAnimeForm({...animeForm, link: v})} required />
                <button className="sm:col-span-3 bg-brand hover:bg-brand-dark transition-colors py-3 rounded-lg font-bold mt-2">Publish Anime</button>
              </form>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anime.map(item => (
                <div key={item.id} className="bg-bg-dark p-4 rounded-xl border border-white/5 flex items-center gap-4">
                  <img src={item.thumbnail} className="w-16 h-20 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{item.title}</h3>
                    <p className="text-xs text-white/40 truncate">{item.link}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] bg-brand/20 text-brand px-2 py-0.5 rounded font-bold uppercase">{item.clicks} Views</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete('anime', item.id)} className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-8">
             <section className="bg-bg-dark p-6 rounded-xl border border-white/5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 italic"><Plus className="w-4 h-4" /> Add Banner</h2>
              <form onSubmit={handleAddBanner} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Banner Image URL" value={bannerForm.imageUrl} onChange={v => setBannerForm({...bannerForm, imageUrl: v})} required />
                <Input label="Target Link" value={bannerForm.link} onChange={v => setBannerForm({...bannerForm, link: v})} required />
                <Input label="Order" type="number" value={bannerForm.order.toString()} onChange={v => setBannerForm({...bannerForm, order: Number(v)})} />
                <button className="sm:col-span-3 bg-brand hover:bg-brand-dark transition-colors py-3 rounded-lg font-bold mt-2">Add Carousel Banner</button>
              </form>
            </section>

             <section className="grid grid-cols-1 gap-4">
              {banners.map(banner => (
                <div key={banner.id} className="bg-bg-dark p-4 rounded-xl border border-white/5 flex items-center gap-4">
                  <img src={banner.imageUrl} className="h-20 w-32 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/40 truncate">{banner.link}</p>
                    <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded font-bold mt-1 inline-block">Order: {banner.order}</span>
                  </div>
                  <button onClick={() => handleDelete('banners', banner.id)} className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsIcon() {
  return <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 text-brand"><BarChart3 className="w-5 h-5" /></div>;
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all text-sm font-bold ${active ? 'bg-brand text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-bg-dark p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</span>
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">{icon}</div>
      </div>
      <div className="text-4xl font-bold font-mono">{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="bg-bg-darker border border-white/10 focus:border-brand/60 rounded-lg p-2.5 outline-none transition-all text-sm text-white"
      />
    </div>
  );
}
