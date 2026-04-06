import React, { useState, useEffect } from "react";
import { User, Supervision } from "../types";
import { Plus, Search, Filter, ChevronRight, FileText, CheckCircle2, Clock, AlertCircle, X, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function SupervisionList({ user }: { user: User }) {
  const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newSupervision, setNewSupervision] = useState({ 
    teacher_id: "", 
    date: "",
    stage1_date: "",
    stage2_date: "",
    stage3_date: "",
    stage4_date: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.id) return;

    // Listen to supervisions
    const supervisionsRef = collection(db, "supervisions");
    const qSup = query(supervisionsRef, where("school_id", "==", user.school_id));
    
    const unsubscribeSup = onSnapshot(qSup, (snapshot) => {
      const sups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supervision));
      setSupervisions(sups);
      setLoading(false);
    });

    // Listen to teachers (users with role GURU in the same school)
    const usersRef = collection(db, "users");
    const qTeach = query(
      usersRef, 
      where("school_id", "==", user.school_id),
      where("role", "==", "GURU"),
      where("status", "==", "ACTIVE")
    );

    const unsubscribeTeach = onSnapshot(qTeach, (snapshot) => {
      const teachs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teachs);
    });

    return () => {
      unsubscribeSup();
      unsubscribeTeach();
    };
  }, [user.id, user.school_id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const teacher = teachers.find(t => t.id === newSupervision.teacher_id);
      const docRef = await addDoc(collection(db, "supervisions"), {
        ...newSupervision,
        school_id: user.school_id,
        principal_id: user.id,
        principal_name: user.name,
        principal_nip: user.nip || "-",
        teacher_name: teacher?.name || "Guru",
        teacher_nip: teacher?.nip || "-",
        status: "BELUM",
        created_at: serverTimestamp(),
        final_score: 0
      });
      navigate(`/supervisi/${docRef.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setMessage({ type: "", text: "" });
    try {
      const supervisionsRef = collection(db, "supervisions");
      const q = query(supervisionsRef, where("school_id", "==", user.school_id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const deletePromises: Promise<void>[] = [];
        querySnapshot.forEach((document) => {
          deletePromises.push(deleteDoc(doc(db, "supervisions", document.id)));
        });
        
        await Promise.all(deletePromises);
      }
      
      setMessage({ type: "success", text: "Semua data supervisi berhasil dihapus. Anda dapat menjadwalkan ulang supervisi sekarang." });
      setIsResetModalOpen(false);
    } catch (err) {
      console.error("Error resetting supervisions:", err);
      setMessage({ type: "error", text: "Gagal mereset data supervisi. Pastikan Anda memiliki izin." });
    } finally {
      setIsResetting(false);
    }
  };

  const filteredSupervisions = supervisions.filter(sup => {
    const matchesSearch = sup.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sup.status?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || sup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div>Memuat daftar supervisi...</div>;

  return (
    <div className="space-y-6">
      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari guru atau jadwal..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 bg-white border border-black/5 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="BELUM">Belum Dimulai</option>
            <option value="PROSES">Sedang Berjalan</option>
            <option value="SELESAI">Selesai</option>
          </select>
          {user.role === 'KEPALA_SEKOLAH' && (
            <>
              <button 
                onClick={() => setIsResetModalOpen(true)}
                className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl shadow-sm hover:bg-red-100 transition-all font-bold"
                title="Reset Jadwal Supervisi"
              >
                <RefreshCw size={20} />
                <span className="hidden sm:inline">Reset Jadwal</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-[#141414] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-zinc-800 transition-all font-bold"
              >
                <Plus size={20} />
                <span>Supervisi Baru</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Guru / Jadwal</th>
              <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Skor Akhir</th>
              <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filteredSupervisions.map((sup) => (
              <tr key={sup.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold">
                      {sup.teacher_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{sup.teacher_name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{new Date(sup.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                        {sup.stage1_date && <span className="text-[9px] bg-zinc-50 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-100">T1: {new Date(sup.stage1_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                        {sup.stage2_date && <span className="text-[9px] bg-zinc-50 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-100">T2: {new Date(sup.stage2_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                        {sup.stage3_date && <span className="text-[9px] bg-zinc-50 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-100">T3: {new Date(sup.stage3_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                        {sup.stage4_date && <span className="text-[9px] bg-zinc-50 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-100">T4: {new Date(sup.stage4_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={sup.status} />
                </td>
                <td className="px-8 py-6">
                  {sup.final_score ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-zinc-900">{sup.final_score.toFixed(1)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sup.final_score >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {sup.final_score >= 85 ? 'A' : sup.final_score >= 75 ? 'B' : 'C'}
                      </span>
                    </div>
                  ) : <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/supervisi/${sup.id}`}
                      className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                      title="Detail Supervisi"
                    >
                      <FileText size={18} />
                    </Link>
                    <button onClick={() => navigate(`/supervisi/${sup.id}`)} className="p-2 hover:bg-zinc-100 text-zinc-400 rounded-lg transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSupervisions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-zinc-400 italic">
                  {searchTerm ? "Tidak ada hasil pencarian." : "Belum ada data supervisi."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-xl font-serif italic font-bold">Mulai Supervisi Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pilih Guru</label>
                <select 
                  required
                  value={newSupervision.teacher_id}
                  onChange={(e) => setNewSupervision({ ...newSupervision, teacher_id: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tanggal Utama Supervisi</label>
                <input 
                  type="date" 
                  required
                  value={newSupervision.date}
                  onChange={(e) => setNewSupervision({ ...newSupervision, date: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">T1: Administrasi</label>
                  <input 
                    type="date" required
                    value={newSupervision.stage1_date}
                    onChange={(e) => setNewSupervision({ ...newSupervision, stage1_date: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">T2: Perencanaan</label>
                  <input 
                    type="date" required
                    value={newSupervision.stage2_date}
                    onChange={(e) => setNewSupervision({ ...newSupervision, stage2_date: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">T3: Pelaksanaan</label>
                  <input 
                    type="date" required
                    value={newSupervision.stage3_date}
                    onChange={(e) => setNewSupervision({ ...newSupervision, stage3_date: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">T4: Refleksi</label>
                  <input 
                    type="date" required
                    value={newSupervision.stage4_date}
                    onChange={(e) => setNewSupervision({ ...newSupervision, stage4_date: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                >
                  Buat Jadwal Supervisi
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-black/5"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertTriangle size={24} />
                  <h3 className="text-xl font-bold">Reset Jadwal Supervisi?</h3>
                </div>
                <button onClick={() => setIsResetModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-zinc-600 leading-relaxed">
                  Tindakan ini akan <strong>menghapus SEMUA data supervisi</strong> di sekolah Anda.
                </p>
                <p className="text-zinc-600 leading-relaxed">
                  Gunakan fitur ini jika Anda ingin menjadwalkan ulang supervisi dari awal untuk semua guru. Data guru tidak akan dihapus.
                </p>
                <p className="text-red-600 text-sm font-medium mt-4">
                  Peringatan: Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  disabled={isResetting}
                  className="px-4 py-2 text-zinc-600 font-medium hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Mereset...
                    </>
                  ) : (
                    "Ya, Hapus Semua Jadwal"
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

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    'BELUM': { icon: <AlertCircle size={12} />, text: 'Belum Mulai', color: 'bg-zinc-100 text-zinc-600' },
    'PROSES': { icon: <Clock size={12} />, text: 'Dalam Proses', color: 'bg-amber-100 text-amber-600' },
    'SELESAI': { icon: <CheckCircle2 size={12} />, text: 'Selesai', color: 'bg-emerald-100 text-emerald-600' },
  };
  const config = configs[status] || configs['BELUM'];
  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
}
