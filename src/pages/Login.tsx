import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Navigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface LoginProps {
  user: any | null;
}

export default function Login({ user }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request') {
        // User closed the popup, ignore or just reset state
        console.log("Login popup closed by user");
      } else {
        console.error(err);
        setError(err.message || "An error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-bg-dark border border-white/5 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="text-brand w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          Access restricted to authorized personnel only. Please sign in with your Google account to manage the anime platform.
        </p>

        {error && (
          <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all py-4 px-6 rounded-2xl font-bold text-lg group"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-5 h-5"
              />
              Sign in with Google
            </>
          )}
        </button>

        <div className="mt-8 pt-8 border-t border-white/5 w-full flex items-center justify-center gap-6">
           <div className="flex flex-col items-center gap-1 opacity-40">
             <span className="text-[10px] font-bold uppercase tracking-widest">Security</span>
             <div className="h-1 w-8 bg-brand rounded-full" />
           </div>
           <div className="flex flex-col items-center gap-1 opacity-40 text-white/20">
             <span className="text-[10px] font-bold uppercase tracking-widest">Access</span>
             <div className="h-1 w-8 bg-white/20 rounded-full" />
           </div>
        </div>
      </motion.div>
    </div>
  );
}
