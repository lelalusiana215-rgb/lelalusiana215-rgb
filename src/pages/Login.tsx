import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, ShieldCheck, Chrome, Wifi, WifiOff, AlertCircle, ArrowLeft } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'gate' | 'login'>('gate');
  const navigate = useNavigate();

  useEffect(() => {
    // If coming from landing page with demo=true, we could auto-trigger demo, 
    // but the user wants a clear gate.
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
        
        // Detailed guidance for developers/admins
        if (err.code === 'auth/invalid-credential') {
          setConnectionError("Firebase Auth: auth/invalid-credential. Ini biasanya berarti kata sandi salah, akun tidak ditemukan, atau metode 'Email/Password' belum diaktifkan di Firebase Console.");
          setShowTroubleshooter(true);
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Metode login Email/Password belum diaktifkan di Firebase Console. Silakan aktifkan di menu Authentication > Sign-in method.");
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
      setSuccess("Link reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.");
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
        setError("Domain ini belum diizinkan di Firebase Console.");
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
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      navigate("/");
    } catch (err: any) {
      console.error("Demo login failed:", err);
      // In Firebase v10+, invalid-credential is the common error for both user-not-found and wrong-password
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          console.log("Attempting to auto-create demo account...");
          await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          navigate("/");
        } catch (createErr: any) {
          console.error("Failed to auto-create demo account:", createErr);
          if (createErr.code === 'auth/operation-not-allowed') {
            setError("Metode Email/Password belum diaktifkan di Firebase Console. Akun demo tidak dapat dibuat.");
          } else if (createErr.code === 'auth/email-already-in-use') {
            setError("Akun demo sudah ada dengan kata sandi berbeda. Silakan hubungi admin.");
          } else {
            setError(`Gagal menyiapkan akun demo: ${createErr.message || "Kesalahan tidak dikenal"}`);
          }
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Metode login Email/Password belum diaktifkan di Firebase Console.");
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
        <div className="bg-[#141414] p-8 text-white text-center relative">
          <Link to="/" className="absolute left-8 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-serif italic font-bold">e-Supervisi360 SD</h1>
          <p className="text-white/50 text-sm mt-2 uppercase tracking-widest">Sistem Digital Supervisi Guru</p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {viewMode === 'gate' ? (
              <motion.div
                key="gate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-zinc-800">Selamat Datang</h2>
                  <p className="text-sm text-zinc-500">Akses penuh hanya tersedia untuk pengguna yang telah memiliki lisensi.</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleDemoLogin}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span>{loading ? 'Memproses...' : 'Coba Akun Demo Gratis'}</span>
                  </button>

                  <a
                    href="http://lynk.id/bugurulela"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white border-2 border-zinc-100 text-zinc-700 py-5 rounded-2xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center space-x-3"
                  >
                    <LogIn size={20} className="text-emerald-600" />
                    <span>Beli Lisensi Penuh</span>
                  </a>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex flex-col items-center space-y-3">
                  <button
                    onClick={() => setViewMode('login')}
                    className="text-sm font-bold text-zinc-400 hover:text-emerald-600 transition-colors"
                  >
                    Sudah punya lisensi? Masuk di sini
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => setViewMode('gate')}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center"
                  >
                    ← Kembali
                  </button>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Member Login</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {(connectionStatus === 'offline' || connectionError) && (
                    <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-xs border border-amber-100">
                      <div className="flex items-start space-x-3">
                        {connectionStatus === 'offline' ? <WifiOff className="flex-shrink-0 mt-0.5" size={16} /> : <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />}
                        <div>
                          <p className="font-bold">{connectionStatus === 'offline' ? 'Koneksi Bermasalah' : 'Peringatan Konfigurasi'}</p>
                          <p className="mt-1 text-[10px] leading-relaxed">
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
                        className="bg-zinc-900 text-zinc-100 p-6 rounded-2xl text-[10px] space-y-4 overflow-hidden"
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
                            <li>Menu: <span className="text-white">Authentication</span> &gt; <span className="text-white">Sign-in method</span></li>
                            <li>Aktifkan: <span className="text-emerald-400 font-bold">Email/Password</span></li>
                            <li>Menu: <span className="text-white">Settings</span> &gt; <span className="text-white">Authorized domains</span></li>
                            <li>Tambahkan: <span className="text-emerald-400 font-mono">{window.location.hostname}</span></li>
                          </ul>
                        </div>

                        <button 
                          type="button"
                          onClick={() => window.location.reload()}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold transition-colors mt-2"
                        >
                          Segarkan Halaman
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs border border-red-100">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-xs border border-emerald-100">
                      {success}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Sekolah / NIP</label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                      placeholder="nama@sekolah.id atau NIP"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kata Sandi</label>
                      <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        Lupa?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
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
                        <LogIn size={18} />
                        <span>Masuk Member</span>
                      </>
                    )}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-2 text-zinc-300 tracking-widest">Atau</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white border border-zinc-200 text-zinc-700 py-3 rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
                  >
                    <Chrome size={18} className="text-red-500" />
                    <span>Masuk dengan Google</span>
                  </button>

                  <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
                    <p className="text-xs text-zinc-400">
                      Belum punya akun? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Daftar Sekolah Baru</Link>
                      <br />
                      <span className="text-[10px] italic mt-1 block">(Khusus Pemegang Lisensi)</span>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="bg-zinc-50 p-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
            © 2024 e-Supervisi360 SD • Versi 1.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
