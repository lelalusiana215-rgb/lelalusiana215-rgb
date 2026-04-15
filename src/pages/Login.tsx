import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, ShieldCheck, Chrome, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDocFromServer } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [connectionError, setConnectionError] = useState<string>("");
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setConnectionStatus('online');
      } catch (err: any) {
        console.error("Connection test failed:", err);
        setConnectionError(err.message || String(err));
        if (err.message?.includes('offline') || err.code === 'unavailable' || err.code === 'failed-precondition') {
          setConnectionStatus('offline');
        } else {
          // If it's a permission error, it means we ARE connected but just can't read the test doc
          setConnectionStatus('online');
        }
      }
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Jika input tidak mengandung '@', asumsikan itu NIP guru
      const loginEmail = email.includes('@') ? email : `guru_${email.replace(/[^a-zA-Z0-9]/g, '')}@sekolah.local`;
      await signInWithEmailAndPassword(auth, loginEmail, password);
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Email/NIP atau kata sandi salah. Pastikan Anda sudah terdaftar dan menggunakan kredensial yang benar.");
        // If it's invalid-credential, it could also mean the provider is disabled or config is wrong
        if (err.code === 'auth/invalid-credential') {
          setConnectionError("Firebase Auth: auth/invalid-credential. Pastikan metode 'Email/Password' sudah diaktifkan di Firebase Console.");
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Metode pendaftaran Email/Password belum diaktifkan di Firebase Console. Silakan aktifkan di menu Authentication > Sign-in method.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      } else {
        setError("Terjadi kesalahan saat masuk: " + (err.message || "Silakan coba lagi."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Silakan masukkan Email atau NIP Anda terlebih dahulu di kolom atas.");
      return;
    }
    
    // Jika itu adalah akun guru (menggunakan NIP atau email .local)
    if (!email.includes('@') || email.endsWith('@sekolah.local')) {
      setError("Untuk akun Guru, kata sandi tidak dapat direset melalui email. Silakan hubungi Kepala Sekolah atau Admin Anda untuk mereset kata sandi.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Link reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam. (Catatan: Jika Anda menggunakan email palsu saat mendaftar, Anda tidak akan menerima email ini).");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("Email tidak terdaftar dalam sistem.");
      } else {
        setError("Gagal mengirim email reset. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain ini belum diizinkan di Firebase Console. Silakan tambahkan domain 'e-supervisi.my.id' ke menu 'Authentication' > 'Settings' > 'Authorized domains' di Firebase Console.");
      } else {
        setError("Gagal masuk dengan Google. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    const demoEmail = "demo@supervisi.com";
    const demoPass = "demo123456";
    try {
      // Coba masuk terlebih dahulu
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      navigate("/");
    } catch (err: any) {
      console.error("Demo login failed:", err);
      // Jika akun tidak ditemukan atau kredensial tidak valid (karena belum ada)
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          // Coba buat akun demo secara otomatis
          console.log("Attempting to auto-create demo account...");
          await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          navigate("/");
        } catch (createErr: any) {
          console.error("Failed to auto-create demo account:", createErr);
          if (createErr.code === 'auth/email-already-in-use') {
            setError("Email demo sudah terdaftar tetapi kata sandi berbeda. Silakan gunakan email Anda sendiri untuk mendaftar.");
          } else if (createErr.code === 'auth/operation-not-allowed') {
            setError("Metode Email/Password belum diaktifkan di Firebase Console. Silakan hubungi admin.");
          } else {
            setError(`Gagal menyiapkan akun demo: ${createErr.message || "Kesalahan tidak dikenal"}`);
          }
        }
      } else {
        setError(`Akun demo tidak dapat diakses: ${err.message || "Kesalahan tidak dikenal"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5"
      >
        <div className="bg-[#141414] p-8 text-white text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-serif italic font-bold">e-Supervisi360 SD</h1>
          <p className="text-white/50 text-sm mt-2 uppercase tracking-widest">Sistem Digital Supervisi Guru</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {(connectionStatus === 'offline' || connectionError) && (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-xs border border-amber-100">
              <div className="flex items-start space-x-3">
                {connectionStatus === 'offline' ? <WifiOff className="flex-shrink-0 mt-0.5" size={16} /> : <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />}
                <div>
                  <p className="font-bold">{connectionStatus === 'offline' ? 'Koneksi Bermasalah' : 'Peringatan Konfigurasi'}</p>
                  <p className="mt-1">
                    {connectionStatus === 'offline' 
                      ? 'Aplikasi tidak dapat terhubung ke Firebase. Periksa domain yang diizinkan.' 
                      : 'Terdeteksi masalah teknis yang mungkin menghambat proses masuk.'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowTroubleshooter(true)}
                className="mt-3 w-full bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 rounded-lg font-bold transition-colors"
              >
                Buka Troubleshooter
              </button>
            </div>
          )}

          <AnimatePresence>
            {showTroubleshooter && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-900 text-zinc-100 p-6 rounded-2xl text-xs space-y-4 overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-emerald-400 uppercase tracking-wider">Troubleshooter</h3>
                  <button onClick={() => setShowTroubleshooter(false)} className="text-zinc-500 hover:text-white">Tutup</button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-zinc-400">1. Domain Saat Ini:</p>
                  <code className="block bg-black/50 p-2 rounded border border-white/10 text-emerald-300">{window.location.hostname}</code>
                </div>

                <div className="space-y-2">
                  <p className="text-zinc-400">2. Langkah Perbaikan:</p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    <li>Buka <a href="https://console.firebase.google.com" target="_blank" className="text-emerald-400 underline">Firebase Console</a></li>
                    <li>Pilih Proyek: <span className="text-white font-mono">gen-lang-client-0369480188</span></li>
                    <li>Menu: <span className="text-white">Authentication</span> &gt; <span className="text-white">Settings</span> &gt; <span className="text-white">Authorized domains</span></li>
                    <li>Tambahkan: <span className="text-emerald-400 font-mono">{window.location.hostname}</span></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-zinc-400">3. Google Cloud Console:</p>
                  <p className="text-zinc-300">Pastikan domain juga ditambahkan ke <span className="italic">Authorized JavaScript origins</span> di Google Cloud Console.</p>
                </div>

                {connectionError && (
                  <div className="space-y-2">
                    <p className="text-zinc-400">4. Pesan Kesalahan Teknis:</p>
                    <code className="block bg-red-950/30 p-2 rounded border border-red-500/30 text-red-400 break-all">{connectionError}</code>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold transition-colors mt-2"
                >
                  Segarkan Halaman & Cek Lagi
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm border border-emerald-100">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Sekolah / NIP</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="nama@sekolah.id"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kata Sandi</label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-[10px] font-bold text-emerald-600 hover:underline"
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <span>Memproses...</span> : (
              <>
                <LogIn size={20} />
                <span>Masuk ke Sistem</span>
              </>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400">Atau</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-zinc-200 text-zinc-700 py-4 rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Chrome size={20} className="text-red-500" />
            <span>Masuk dengan Google</span>
          </button>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center space-x-2 border border-emerald-200/50"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Coba Demo Gratis (Terbatas)</span>
            </button>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs text-zinc-400">
              Belum punya akun? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Daftar Sekolah Baru</Link>
            </p>
          </div>
        </form>
        
        <div className="bg-zinc-50 p-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
            © 2024 e-Supervisi360 SD • Versi 1.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
