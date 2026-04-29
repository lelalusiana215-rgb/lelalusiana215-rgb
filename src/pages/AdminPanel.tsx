import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { User, School } from "../types";
import { Check, X, School as SchoolIcon, User as UserIcon, Loader2, AlertTriangle, RefreshCw, Key, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminPanel({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'schools' | 'config'>('pending');
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSchoolsList, setAllSchoolsList] = useState<School[]>([]);
  const [schools, setSchools] = useState<{ [key: string]: School }>({});
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [demoLoginCount, setDemoLoginCount] = useState<number | null>(null);
  const [isResettingDemo, setIsResettingDemo] = useState(false);

  useEffect(() => {
    // Fetch schools map for general use
    const unsubSchoolsMap = onSnapshot(collection(db, "schools"), (snapshot) => {
      const schoolsMap: { [key: string]: School } = {};
      const schoolsList: School[] = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() } as School;
        schoolsMap[doc.id] = data;
        schoolsList.push(data);
      });
      setSchools(schoolsMap);
      setAllSchoolsList(schoolsList);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const users: User[] = [];
      const pending: User[] = [];
      snapshot.forEach((doc) => {
        const u = { id: doc.id, ...doc.data() } as User;
        users.push(u);
        if (u.status === 'PENDING') pending.push(u);
      });
      setAllUsers(users);
      setPendingUsers(pending);
      setLoading(false);
    });

    const fetchConfig = async () => {
      const configSnap = await getDocs(collection(db, "config"));
      configSnap.forEach(doc => {
        if (doc.id === "gemini") {
          setApiKey(doc.data().apiKey || "");
        }
        if (doc.id === "demo_access") {
          setDemoLoginCount(doc.data().count || 0);
        }
      });
    };

    fetchConfig();

    return () => {
      unsubSchoolsMap();
      unsubUsers();
    };
  }, []);

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleApprove = async (userId: string, schoolId: string) => {
    setMessage({ type: "", text: "" });
    try {
      await updateDoc(doc(db, "users", userId), { status: "ACTIVE" });
      await updateDoc(doc(db, "schools", schoolId), { status: "ACTIVE" });
      setMessage({ type: "success", text: "Pendaftaran berhasil disetujui!" });
    } catch (err) {
      console.error("Error approving:", err);
      setMessage({ type: "error", text: "Gagal menyetujui pendaftaran." });
    }
  };

  const handleReject = async (userId: string, schoolId: string) => {
    setMessage({ type: "", text: "" });
    try {
      await updateDoc(doc(db, "users", userId), { status: "REJECTED" });
      await updateDoc(doc(db, "schools", schoolId), { status: "REJECTED" });
      setMessage({ type: "success", text: "Pendaftaran telah ditolak." });
    } catch (err) {
      console.error("Error rejecting:", err);
      setMessage({ type: "error", text: "Gagal menolak pendaftaran." });
    }
  };

  const handleResetApp = async () => {
    setIsResetting(true);
    setMessage({ type: "", text: "" });
    try {
      const collectionsToClear = ["supervisions", "schedules", "teacher_credentials", "schools", "users"];
      
      for (const coll of collectionsToClear) {
        const snapshot = await getDocs(collection(db, coll));
        const deletePromises: Promise<void>[] = [];
        
        snapshot.forEach((document) => {
          // Do not delete the current admin user
          if (coll === "users" && document.id === auth.currentUser?.uid) {
            return;
          }
          deletePromises.push(deleteDoc(doc(db, coll, document.id)));
        });
        
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
      }
      
      setMessage({ type: "success", text: "Aplikasi berhasil di-reset ke setelan awal." });
      setShowResetConfirm(false);
    } catch (err) {
      console.error("Error resetting app:", err);
      setMessage({ type: "error", text: "Gagal mereset aplikasi. Pastikan Anda memiliki izin." });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveApiKey = async () => {
    setIsSavingKey(true);
    setMessage({ type: "", text: "" });
    try {
      await updateDoc(doc(db, "config", "gemini"), { apiKey });
      setMessage({ type: "success", text: "API Key berhasil diperbarui!" });
    } catch (err: any) {
      console.error("Error saving API key:", err);
      // If document doesn't exist, create it
      if (err.code === 'not-found') {
        try {
          const { setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "config", "gemini"), { apiKey });
          setMessage({ type: "success", text: "API Key berhasil diperbarui!" });
        } catch (createErr) {
          setMessage({ type: "error", text: "Gagal menyimpan API Key." });
        }
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan API Key." });
      }
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleResetDemoLimit = async () => {
    setIsResettingDemo(true);
    setMessage({ type: "", text: "" });
    try {
      await updateDoc(doc(db, "config", "demo_access"), { count: 0 });
      setDemoLoginCount(0);
      setMessage({ type: "success", text: "Limit login demo berhasil di-reset!" });
    } catch (err: any) {
      console.error("Error resetting demo limit:", err);
      setMessage({ type: "error", text: "Gagal me-reset limit demo. Pastikan data akun demo sudah ada." });
    } finally {
      setIsResettingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 mb-2">Admin Panel</h2>
          <p className="text-zinc-500">Kelola pendaftaran, pengguna, dan konfigurasi sistem.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors font-medium text-sm"
          >
            <RefreshCw size={18} />
            Reset Aplikasi
          </button>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
        >
          Menunggu ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
        >
          Semua Pengguna ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('schools')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'schools' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
        >
          Semua Sekolah ({allSchoolsList.length})
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
        >
          Konfigurasi
        </button>
      </div>

      <div className="grid gap-4">
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 space-y-6">
              <div className="flex items-center gap-3 text-zinc-800">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Konfigurasi API Key Gemini</h3>
                  <p className="text-sm text-zinc-500">Gunakan API Key Anda sendiri untuk analisis AI.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 ml-1">Gemini API Key</label>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Masukkan API Key Gemini..."
                      className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-sm"
                    />
                    <button
                      onClick={handleSaveApiKey}
                      disabled={isSavingKey}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingKey ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Simpan
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 ml-1 italic">
                    * Dapatkan API Key gratis di <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">Google AI Studio</a>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 space-y-6">
              <div className="flex items-center gap-3 text-zinc-800">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Kontrol Akses Demo</h3>
                  <p className="text-sm text-zinc-500">Kelola batas penggunaan untuk akun demo.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div>
                  <p className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-1">Penggunaan Demo Saat Ini</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${demoLoginCount !== null && demoLoginCount >= 3 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {demoLoginCount !== null ? demoLoginCount : '-'} / 3
                    </span>
                    <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium">Kali Login</span>
                  </div>
                </div>
                <button
                  onClick={handleResetDemoLimit}
                  disabled={isResettingDemo}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors font-bold text-sm"
                >
                  {isResettingDemo ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Reset Limit Login
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <AnimatePresence mode="popLayout">
            {pendingUsers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="empty-pending"
                className="bg-white p-12 rounded-3xl text-center border border-dashed border-zinc-200"
              >
                <p className="text-zinc-400">Tidak ada pendaftaran yang menunggu persetujuan.</p>
              </motion.div>
            ) : (
              pendingUsers.map((u) => (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-800 text-lg">{u.name}</h3>
                      <p className="text-sm text-zinc-500 mb-2">{u.email} • NIP: {u.nip}</p>
                      <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                        <SchoolIcon size={14} className="mr-1.5" />
                        {schools[u.school_id]?.name || "Memuat nama sekolah..."}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleReject(u.id, u.school_id)}
                      className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <X size={18} className="mr-2" />
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(u.id, u.school_id)}
                      className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center"
                    >
                      <Check size={18} className="mr-2" />
                      Setujui
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Nama / NIP</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Sekolah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {allUsers.map((u) => (
                  <tr key={u.id} className="text-sm">
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">{u.name}</p>
                      <p className="text-xs text-zinc-500">{u.nip || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-medium">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                        u.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {schools[u.school_id]?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Nama Sekolah</th>
                  <th className="px-6 py-4">Alamat</th>
                  <th className="px-6 py-4">Lisensi</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {allSchoolsList.map((s) => (
                  <tr key={s.id} className="text-sm">
                    <td className="px-6 py-4 font-bold text-zinc-900">{s.name}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500 max-w-xs truncate">{s.address}</td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-600">{(s as any).license_key || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-black/5"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center gap-3 text-red-600">
                <AlertTriangle size={24} />
                <h3 className="text-xl font-bold">Reset Aplikasi?</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-zinc-600 leading-relaxed">
                  Tindakan ini akan <strong>menghapus SEMUA data</strong> dalam aplikasi, termasuk:
                </p>
                <ul className="list-disc list-inside text-zinc-600 space-y-1 ml-2">
                  <li>Data Sekolah</li>
                  <li>Data Kepala Sekolah & Guru</li>
                  <li>Jadwal & Hasil Supervisi</li>
                  <li>Kredensial Pengguna</li>
                </ul>
                <p className="text-red-600 text-sm font-medium mt-4">
                  Peringatan: Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                  className="px-4 py-2 text-zinc-600 font-medium hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetApp}
                  disabled={isResetting}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Mereset...
                    </>
                  ) : (
                    "Ya, Reset Semua Data"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
