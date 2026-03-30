import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
import { User, School } from "../types";
import { Check, X, School as SchoolIcon, User as UserIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminPanel({ user }: { user: User }) {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<{ [key: string]: School }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch schools first to have names for the user list
    const fetchSchools = async () => {
      const schoolsSnap = await getDocs(collection(db, "schools"));
      const schoolsMap: { [key: string]: School } = {};
      schoolsSnap.forEach(doc => {
        schoolsMap[doc.id] = { id: doc.id, ...doc.data() } as School;
      });
      setSchools(schoolsMap);
    };

    fetchSchools();

    const q = query(collection(db, "users"), where("status", "==", "PENDING"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
      });
      setPendingUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
        <h2 className="text-2xl font-bold text-zinc-800 mb-2">Persetujuan Pendaftaran</h2>
        <p className="text-zinc-500">Kelola pendaftaran sekolah dan kepala sekolah baru.</p>
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

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {pendingUsers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
      </div>
    </div>
  );
}
