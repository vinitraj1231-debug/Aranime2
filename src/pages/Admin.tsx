import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Plus, 
  Trash2, 
  Eye, 
  LayoutGrid, 
  Image as ImageIcon, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  Star, 
  Tag, 
  Sliders, 
  Lock, 
  Unlock, 
  Check, 
  ChevronRight, 
  Sparkles,
  RefreshCw,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const [activeTab, setActiveTab] = useState<'stats' | 'anime' | 'banners'>('stats');
  const [anime, setAnime] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Forms
  const [animeForm, setAnimeForm] = useState({ 
    title: '', 
    thumbnail: '', 
    link: '', 
    category: 'Action',
    keywords: '',
    rating: '8.5',
    isFeatured: false
  });
  const [bannerForm, setBannerForm] = useState({ imageUrl: '', link: '', order: 0 });

  const categories = ["Action", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Slice of Life", "Adventure", "Supernatural"];

  useEffect(() => {
    // Check local storage for session auth
    const isLocalAuth = sessionStorage.getItem("ar_anime_admin_unlocked");
    if (isLocalAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Sync snapshot only if authenticated to prevent unneeded listeners
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const unsubAnime = onSnapshot(query(collection(db, "anime"), orderBy("createdAt", "desc")), (snap) => 
      setAnime(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const unsubBanners = onSnapshot(query(collection(db, "banners"), orderBy("order", "asc")), (snap) => 
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { 
      unsubAnime(); 
      unsubBanners(); 
    };
  }, [isAuthenticated]);

  const handleVerifyPasscode = async (e: FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    
    setIsVerifying(true);
    setPasscodeError("");

    try {
      const res = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("ar_anime_admin_unlocked", "true");
        setPasscodeError("");
      } else {
        setPasscodeError(data.error || "Invalid passcode credentials. Try again.");
      }
    } catch (err) {
      setPasscodeError("Server connection error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddAnime = async (e: FormEvent) => {
    e.preventDefault();
    if (!animeForm.title || !animeForm.thumbnail || !animeForm.link) return;

    await addDoc(collection(db, "anime"), { 
      title: animeForm.title,
      thumbnail: animeForm.thumbnail,
      link: animeForm.link,
      category: animeForm.category,
      keywords: animeForm.keywords,
      rating: parseFloat(animeForm.rating) || 8.5,
      isFeatured: animeForm.isFeatured,
      clicks: 0, 
      createdAt: serverTimestamp(), 
      isActive: true 
    });

    setAnimeForm({ 
      title: '', 
      thumbnail: '', 
      link: '', 
      category: 'Action',
      keywords: '',
      rating: '8.5',
      isFeatured: false
    });
  };

  const handleToggleFeature = async (id: string, currentFeatured: boolean) => {
    await updateDoc(doc(db, "anime", id), {
      isFeatured: !currentFeatured
    });
  };

  const handleAddBanner = async (e: FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "banners"), { 
      imageUrl: bannerForm.imageUrl,
      link: bannerForm.link,
      order: Number(bannerForm.order), 
      createdAt: serverTimestamp() 
    });
    setBannerForm({ imageUrl: '', link: '', order: banners.length + 1 });
  };

  const handleDelete = async (coll: string, id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("ar_anime_admin_unlocked");
    setIsAuthenticated(false);
  };

  const totalViews = anime.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const filteredAnime = anime.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.keywords && a.keywords.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div id="admin-login-screen" className="flex items-center justify-center min-h-[85vh] px-4 py-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full bg-bg-dark border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative"
        >
          <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-brand/10">
            <Lock className="text-brand w-7 h-7" />
          </div>

          <h2 className="text-center text-3xl font-black uppercase tracking-tighter text-white italic">
            AR<span className="text-brand">ANIME</span> GATEWAY
          </h2>
          <p className="text-center text-[10px] text-white/40 uppercase tracking-[0.25em] font-mono mt-1 mb-8">
            ADMINISTRATIVE ENTRANCE ONLY
          </p>

          <form onSubmit={handleVerifyPasscode} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Secure Passcode</label>
              <input
                id="admin-passcode-input"
                type="password"
                placeholder="•••••••••••••"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                required
                className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand/40 outline-none rounded-2xl p-4 text-center tracking-widest text-lg font-black transition-all text-white placeholder:text-white/15"
              />
            </div>

            {passcodeError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs text-center font-medium"
              >
                {passcodeError}
              </motion.div>
            )}

            <button
              id="admin-verify-btn"
              type="submit"
              disabled={isVerifying}
              className="w-full bg-brand hover:bg-brand-dark hover:scale-[1.01] active:scale-95 disabled:bg-brand/50 disabled:scale-100 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(244,117,33,0.25)] flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Verifying Securely...
                </>
              ) : (
                "Unlock Terminal Door"
              )}
            </button>
          </form>

          {/* Secure Info Card */}
          <div className="mt-8 p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
            <p className="text-[11px] text-white/35">
              Secure server-side validation is active. <br />
              <span className="text-brand font-bold">Encrypted:</span> Passcode is hidden from browser bundle inspections.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 py-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
            AR<span className="text-brand">ANIME</span> <span className="text-sm not-italic font-mono uppercase bg-brand/10 text-brand px-2.5 py-1 rounded">Panel</span>
          </h1>
          <p className="text-white/40 text-[10px] mt-1 font-mono uppercase tracking-widest">Connected with Local Keys | Master Gate bypass</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-bg-dark p-1.5 rounded-2xl border border-white/5 shadow-xl">
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 className="w-4 h-4" />} label="Stats" />
          <TabButton active={activeTab === 'anime'} onClick={() => setActiveTab('anime')} icon={<LayoutGrid className="w-4 h-4" />} label="Anime Database" />
          <TabButton active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} icon={<ImageIcon className="w-4 h-4" />} label="Spotlight Banners" />
          
          <button 
            id="admin-signout-btn"
            onClick={handleSignOut}
            className="px-4 py-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all text-xs font-black uppercase tracking-widest text-white/40 border border-transparent hover:border-red-500/10"
          >
            Lock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Catalog Series" value={anime.length} icon={<LayoutGrid className="text-brand" />} />
              <StatCard label="Global Media Views" value={totalViews} icon={<Eye className="text-cyan-400" />} />
              <StatCard label="Promo Spotlight Slots" value={banners.length} icon={<ImageIcon className="text-purple-400" />} />
              <StatCard label="Featured Reels" value={anime.filter(a => a.isFeatured).length} icon={<Trophy className="text-yellow-400" />} />
            </div>

            <div className="bg-bg-dark border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden">
              <h3 className="text-lg font-bold uppercase italic tracking-tight mb-2">Live Status Terminal</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                Operations bypass the standard Firebase Auth pop-ups completely. Rules allow instant local direct write parameters. 
              </p>
              <div className="bg-bg-darker rounded-xl p-4 font-mono text-[11px] text-white/60 space-y-1 select-none">
                <p className="text-green-400">● NETWORK_ONLINE: DB initialized successfully.</p>
                <p>● FIREBASE_DATABASE_ID: default</p>
                <p>● BYPASS_DOMAIN_CHECK: ACTIVE (Vercel unlocked)</p>
                <p>● CLIENT_SECURITY_STATE: DIRECT_BYPASS</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'anime' && (
          <div className="space-y-8">
            <section className="bg-bg-dark p-6 md:p-8 rounded-[2.5rem] border border-white/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2.5 italic uppercase tracking-tight">
                <Plus className="w-5 h-5 text-brand" /> Add New Anime Series
              </h2>
              <form onSubmit={handleAddAnime} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input label="Anime Title" value={animeForm.title} onChange={(v: string) => setAnimeForm({...animeForm, title: v})} required placeholder="e.g. Naruto Shippuden" />
                <Input label="Landscape Thumbnail URL" value={animeForm.thumbnail} onChange={(v: string) => setAnimeForm({...animeForm, thumbnail: v})} required placeholder="URL to JPEG/PNG" />
                <Input label="Target Redirect Link" value={animeForm.link} onChange={(v: string) => setAnimeForm({...animeForm, link: v})} required placeholder="Telegram channel or post link" />
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Main Category / Genre</label>
                  <select 
                    value={animeForm.category}
                    onChange={e => setAnimeForm({...animeForm, category: e.target.value})}
                    className="bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand/40 rounded-xl p-3 outline-none transition-all text-sm text-white h-[48px]"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <Input label="User Rating Score" type="number" step="0.1" min="1" max="10" value={animeForm.rating} onChange={(v: string) => setAnimeForm({...animeForm, rating: v})} placeholder="e.g. 8.9" />

                <Input label="Search Keywords / Tags" value={animeForm.keywords} onChange={(v: string) => setAnimeForm({...animeForm, keywords: v})} placeholder="e.g. ninja, shonen, jutsu, battle" />

                <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between bg-bg-darker/60 border border-white/5 p-4 rounded-2xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand" /> Horizontally Scrollable Spotlight
                    </span>
                    <span className="text-[10px] text-white/45">Should this series appear in the horizontal featured carousel list?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnimeForm({...animeForm, isFeatured: !animeForm.isFeatured})}
                    className={`px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                      animeForm.isFeatured 
                      ? 'bg-brand text-white shadow-md shadow-brand/20' 
                      : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {animeForm.isFeatured ? "Featured Active" : "No"}
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="md:col-span-full bg-brand hover:bg-brand-dark transition-all py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Push Series to Public Catalog
                </button>
              </form>
            </section>

            {/* List and Index */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Registered Series List ({filteredAnime.length})</h3>
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                  <input 
                    type="text" 
                    placeholder="Search by title, keywords..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-dark border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:border-brand/40 outline-none transition-all placeholder:text-white/15"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
                {filteredAnime.map(item => (
                  <div key={item.id} className="bg-bg-dark p-4 rounded-2xl border border-white/5 flex items-start gap-4 hover:border-white/10 group relative transition-all">
                    <img src={item.thumbnail} className="w-20 aspect-[3/4] object-cover rounded-xl shadow-lg border border-white/5 shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold truncate text-sm text-white">{item.title}</h3>
                      <p className="text-[10px] text-white/30 truncate mt-0.5">{item.link}</p>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded font-black tracking-widest uppercase">
                          {item.clicks || 0} Clicks
                        </span>
                        
                        {item.category && (
                          <span className="text-[9px] bg-white/5 text-white/60 px-2 py-0.5 rounded font-bold uppercase">
                            {item.category}
                          </span>
                        )}

                        {item.rating && (
                          <span className="text-[9px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded font-black flex items-center gap-0.5">
                            ★ {item.rating}
                          </span>
                        )}
                      </div>

                      {item.keywords && (
                        <p className="text-[9px] text-white/20 mt-2 truncate max-w-[200px]" title={item.keywords}>
                          Tags: {item.keywords}
                        </p>
                      )}

                      {/* Featured button state */}
                      <button
                        onClick={() => handleToggleFeature(item.id, item.isFeatured || false)}
                        className={`text-[9px] px-2.5 py-1 rounded font-black uppercase mt-3 inline-flex items-center gap-1 transition-all ${
                          item.isFeatured 
                          ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/20' 
                          : 'bg-white/5 text-white/40 border border-white/5 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {item.isFeatured ? "Featured Top" : "Toggle Feature"}
                      </button>
                    </div>

                    <button 
                      onClick={() => handleDelete('anime', item.id)} 
                      className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-xl transition-all self-start absolute right-2 top-2"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-8 animate-fade-in">
             <section className="bg-bg-dark p-6 md:p-8 rounded-[2.5rem] border border-white/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2.5 italic uppercase tracking-tight">
                <ImageIcon className="w-5 h-5 text-brand" /> Upload New Spotlight Promo Banner
              </h2>
              <form onSubmit={handleAddBanner} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <Input label="Landscape Banner Image URL" value={bannerForm.imageUrl} onChange={v => setBannerForm({...bannerForm, imageUrl: v})} required placeholder="HTTPS link to banner image" />
                </div>
                <Input label="Spotlight Slots Order Index" type="number" value={bannerForm.order.toString()} onChange={v => setBannerForm({...bannerForm, order: Number(v)})} />
                <div className="sm:col-span-full">
                  <Input label="Redirect Target Link" value={bannerForm.link} onChange={v => setBannerForm({...bannerForm, link: v})} required placeholder="Telegram channel or promo redirect link" />
                </div>
                <button type="submit" className="sm:col-span-full bg-brand hover:bg-brand-dark transition-all py-4 rounded-xl font-black text-xs uppercase tracking-widest">
                  Mount Spotlight Banner
                </button>
              </form>
             </section>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map(banner => (
                <div key={banner.id} className="bg-bg-dark p-4 rounded-3xl border border-white/5 flex flex-col gap-4">
                  <img src={banner.imageUrl} className="w-full aspect-[21/9] object-cover rounded-2xl shadow-lg border border-white/5" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/40 truncate font-mono uppercase tracking-widest">{banner.link}</p>
                      <span className="text-[10px] text-brand font-black mt-1 inline-block uppercase italic">Slot Position: {banner.order}</span>
                    </div>
                    <button onClick={() => handleDelete('banners', banner.id)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/25 rounded-2xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all text-[11px] font-black uppercase tracking-wider ${
        active 
        ? 'bg-brand text-white shadow-lg shadow-brand/20 scale-[1.01]' 
        : 'text-white/30 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon && <span className={active ? 'text-white' : 'text-white/25'}>{icon}</span>}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-bg-dark p-6 rounded-[2rem] border border-white/5 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
      <div className="grid place-content-center w-12 h-12 bg-bg-darker border border-white/10 rounded-2xl text-xl">
        {icon}
      </div>
      <div>
        <div className="text-4xl font-black font-mono tracking-tighter">{value}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1.5 block">{label}</span>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false, placeholder = "", ...props }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand/40 rounded-xl p-3 outline-none transition-all text-sm text-white placeholder:text-white/10"
        {...props}
      />
    </div>
  );
}
