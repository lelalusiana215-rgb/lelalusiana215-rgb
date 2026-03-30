import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, ShieldCheck, ArrowLeft, Chrome } from "lucide-react";
import { motion } from "motion/react";
import { auth, db, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, collection, addDoc, getDoc } from "firebase/firestore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFirestoreError = (error: any, operation: string, path: string) => {
    const errInfo = {
      error: error.message || String(error),
      operationType: operation,
      path: path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
      }
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    return errInfo;
  };

  const handleGoogleRegister = async () => {
    if (!schoolName || !schoolAddress || !nip) {
      setError("Silakan isi Nama Sekolah, Alamat Sekolah, dan NIP terlebih dahulu sebelum mendaftar dengan Google.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user already exists
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        setSuccess("Akun sudah terdaftar. Mengalihkan ke dashboard...");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      // 1. Create School
      const schoolRef = await addDoc(collection(db, "schools"), {
        name: schoolName,
        address: schoolAddress,
        header_text: `DINAS PENDIDIKAN\n${schoolName.toUpperCase()}`,
        logo_school: "",
        logo_gov: "",
        status: "PENDING"
      });

      // 2. Create User Profile
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        name: firebaseUser.displayName || name,
        role: "KEPALA_SEKOLAH",
        school_id: schoolRef.id,
        nip,
        status: "PENDING"
      });

      setSuccess("Pendaftaran berhasil!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      console.error(err);
      setError("Gagal mendaftar dengan Google: " + (err.message || "Silakan coba lagi."));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Create School
      let schoolRef;
      try {
        schoolRef = await addDoc(collection(db, "schools"), {
          name: schoolName,
          address: schoolAddress,
          header_text: `DINAS PENDIDIKAN\n${schoolName.toUpperCase()}`,
          logo_school: "",
          logo_gov: "",
          status: "PENDING"
        });
      } catch (err: any) {
        handleFirestoreError(err, 'create', 'schools');
        throw err;
      }

      // 3. Create User Profile in Firestore
      try {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email,
          name,
          role: "KEPALA_SEKOLAH",
          school_id: schoolRef.id,
          nip,
          status: "PENDING"
        });
      } catch (err: any) {
        handleFirestoreError(err, 'create', `users/${firebaseUser.uid}`);
        throw err;
      }

      setSuccess("Pendaftaran berhasil! Silakan masuk.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email sudah terdaftar");
      } else if (err.code === 'auth/weak-password') {
        setError("Kata sandi terlalu lemah (minimal 6 karakter)");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("ERROR KRITIKAL: Metode pendaftaran Email/Password belum diaktifkan di Firebase Console. Silakan aktifkan di menu 'Authentication' > 'Sign-in method' > 'Email/Password'.");
      } else if (err.message.includes("permission-denied") || err.code === "permission-denied") {
        setError("Akses ditolak oleh sistem keamanan. Silakan hubungi admin.");
      } else {
        setError("Terjadi kesalahan saat mendaftar: " + (err.message || "Silakan coba lagi."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5"
      >
        <div className="bg-[#141414] p-8 text-white text-center relative">
          <Link to="/login" className="absolute left-8 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-serif italic font-bold">Daftar Akun Baru</h1>
          <p className="text-white/50 text-sm mt-2 uppercase tracking-widest">Registrasi Kepala Sekolah & Sekolah</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="Drs. Nama Anda, M.Pd."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Sekolah</label>
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
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="NIP Anda..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>

          <div className="border-t border-zinc-100 pt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nama Sekolah</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="SD Negeri 01 Contoh"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Alamat Sekolah</label>
              <textarea
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all min-h-[100px]"
                placeholder="Jl. Pendidikan No. 123..."
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <span>Memproses...</span> : (
              <>
                <UserPlus size={20} />
                <span>Daftar Sekarang</span>
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
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full bg-white border border-zinc-200 text-zinc-700 py-4 rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Chrome size={20} className="text-red-500" />
            <span>Daftar dengan Google</span>
          </button>
        </form>
        
        <div className="bg-zinc-50 p-6 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-400">
            Sudah punya akun? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
