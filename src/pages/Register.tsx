import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, ShieldCheck, ArrowLeft, Chrome, Key } from "lucide-react";
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
  const [licenseKey, setLicenseKey] = useState("");
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
    if (!schoolName || !schoolAddress || !nip || !licenseKey) {
      setError("Silakan isi semua data termasuk Kode Lisensi terlebih dahulu.");
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
        status: "PENDING",
        license_key: licenseKey,
        created_at: new Date().toISOString()
      });

      // 2. Create User Profile
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        name: firebaseUser.displayName || name,
        role: "KEPALA_SEKOLAH",
        school_id: schoolRef.id,
        nip,
        status: "PENDING",
        created_at: new Date().toISOString()
      });

      setSuccess("Pendaftaran berhasil! Akun Anda akan diverifikasi oleh Admin.");
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
    if (!licenseKey) {
      setError("Kode Lisensi wajib diisi.");
      return;
    }
    
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
          status: "PENDING",
          license_key: licenseKey,
          created_at: new Date().toISOString()
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
          status: "PENDING",
          created_at: new Date().toISOString()
        });
      } catch (err: any) {
        handleFirestoreError(err, 'create', `users/${firebaseUser.uid}`);
        throw err;
      }

      setSuccess("Pendaftaran berhasil! Silakan tunggu verifikasi Admin.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email sudah terdaftar. Silakan gunakan email lain.");
      } else if (err.code === 'auth/weak-password') {
        setError("Kata sandi terlalu lemah (minimal 6 karakter)");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Kredensial tidak valid. Periksa konfigurasi Firebase.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Metode Email/Password belum diaktifkan di Firebase.");
      } else if (err.message.includes("permission-denied") || err.code === "permission-denied") {
        setError("Akses ditolak oleh sistem keamanan Firestore.");
      } else {
        setError("Terjadi kesalahan: " + (err.message || "Silakan coba lagi."));
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
          <h1 className="text-2xl font-serif italic font-bold">Registrasi Member</h1>
          <p className="text-white/50 text-sm mt-2 uppercase tracking-widest">Khusus Pemegang Lisensi e-Supervisi360</p>
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

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-700">
              <Key size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wider">Verifikasi Lisensi</h3>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Kode Lisensi / Bukti Pembelian</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono"
                placeholder="Masukkan kode lisensi Anda..."
                required
              />
              <p className="text-[10px] text-emerald-600/60 italic">Kode ini didapatkan setelah Anda melakukan pembelian di lynk.id/bugurulela</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="Drs. Nama Anda, M.Pd."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Sekolah</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="nama@sekolah.id"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="NIP Anda..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kata Sandi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nama Sekolah</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="SD Negeri 01 Contoh"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Alamat Sekolah</label>
              <textarea
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[80px] text-sm"
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
                <span>Daftar & Aktivasi</span>
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
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full bg-white border border-zinc-200 text-zinc-700 py-3 rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
          >
            <Chrome size={18} className="text-red-500" />
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
