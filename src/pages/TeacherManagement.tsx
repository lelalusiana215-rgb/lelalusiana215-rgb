import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Plus, Search, Mail, User as UserIcon, MoreVertical, Trash2, Edit2, X, AlertCircle, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, setDoc, getDoc, getDocs, writeBatch } from "firebase/firestore";

export default function TeacherManagement({ user }: { user: User }) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "",
    nip: "",
    teaching_class: "",
    rank_grade: "",
    subject: "",
    schedule: {
      stage1: "",
      stage2: "",
      stage3: "",
      stage4: ""
    }
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewedPassword, setViewedPassword] = useState<{name: string, password: string} | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user.id) return;

    const usersRef = collection(db, "users");
    const q = query(
      usersRef, 
      where("school_id", "==", user.school_id),
      where("role", "==", "GURU"),
      where("status", "==", "ACTIVE")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teachs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teachs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.id, user.school_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingTeacher) {
        // Update existing teacher in Firestore directly
        try {
          await updateDoc(doc(db, "users", editingTeacher.id), {
            name: formData.name,
            nip: formData.nip,
            teaching_class: formData.teaching_class,
            rank_grade: formData.rank_grade,
            subject: formData.subject,
            email: formData.email // Keep email as plain data if provided
          });
          setMessage({ type: "success", text: "Data guru berhasil diperbarui." });
        } catch (err) {
          console.error("Error updating teacher:", err);
          setError("Gagal memperbarui data guru.");
          setSubmitting(false);
          return;
        }
      } else {
        // Directly create Teacher in Firestore without Auth account
        try {
          const teacherData = {
            email: formData.email || `${formData.nip || Math.random().toString(36).substring(7)}@sekolah.local`,
            name: formData.name || "",
            role: "GURU",
            school_id: user.school_id || "",
            principal_id: user.id || "",
            nip: formData.nip || "",
            teaching_class: formData.teaching_class || "",
            rank_grade: formData.rank_grade || "",
            subject: formData.subject || "",
            status: "ACTIVE",
            created_at: serverTimestamp()
          };

          const docRef = await addDoc(collection(db, "users"), teacherData);
          const teacherId = docRef.id;

          // Create initial supervision if schedule provided
          if (formData.schedule.stage1) {
            await addDoc(collection(db, "supervisions"), {
              teacher_id: teacherId,
              teacher_name: formData.name,
              teacher_nip: formData.nip,
              principal_id: user.id,
              principal_name: user.name,
              principal_nip: user.nip || "-",
              school_id: user.school_id,
              date: formData.schedule.stage1,
              stage1_date: formData.schedule.stage1,
              stage2_date: formData.schedule.stage2,
              stage3_date: formData.schedule.stage3,
              stage4_date: formData.schedule.stage4,
              status: "BELUM",
              final_score: 0,
              created_at: serverTimestamp()
            });
          }
          setMessage({ type: "success", text: "Guru berhasil ditambahkan ke database." });
        } catch (err) {
          console.error("Error creating teacher document:", err);
          setError("Gagal menyimpan data guru.");
          setSubmitting(false);
          return;
        }
      }

      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData({ 
        name: "", email: "", password: "", nip: "", teaching_class: "", rank_grade: "", subject: "",
        schedule: { stage1: "", stage2: "", stage3: "", stage4: "" }
      });
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleEdit = (teacher: any) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      password: "", // Don't show password
      nip: teacher.nip || "",
      teaching_class: teacher.teaching_class || "",
      rank_grade: teacher.rank_grade || "",
      subject: teacher.subject || "",
      schedule: {
        stage1: "",
        stage2: "",
        stage3: "",
        stage4: ""
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = (teacherId: string) => {
    setTeacherToDelete(teacherId);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    
    setMessage({ type: "", text: "" });
    try {
      // 1. Delete credentials
      try {
        await deleteDoc(doc(db, "teacher_credentials", teacherToDelete));
      } catch (e) {
        console.log("No credentials to delete or permission denied");
      }

      // 2. Delete all supervisions for this teacher
      const supervisionsRef = collection(db, "supervisions");
      const q = query(
        supervisionsRef, 
        where("school_id", "==", user.school_id) // Query by school_id only to avoid composite index error
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const deletePromises: Promise<void>[] = [];
        querySnapshot.forEach((docSnap) => {
          if (docSnap.data().teacher_id === teacherToDelete) {
            deletePromises.push(deleteDoc(doc(db, "supervisions", docSnap.id)));
          }
        });
        
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
      }

      // 3. Delete user profile from Firestore
      await deleteDoc(doc(db, "users", teacherToDelete));

      // 4. Delete user from Firebase Auth via Backend API
      try {
        await fetch(`/api/teachers/${teacherToDelete}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.error("Error deleting teacher from Auth:", e);
        // We continue even if Auth deletion fails, as the profile is already gone
      }
      
      setMessage({ type: "success", text: "Guru dan data supervisi terkait berhasil dihapus." });
    } catch (err) {
      console.error("Error deleting teacher or supervisions:", err);
      setMessage({ type: "error", text: "Gagal menghapus guru atau data supervisi. Pastikan Anda memiliki izin." });
    } finally {
      setTeacherToDelete(null);
    }
  };

  const handleViewPassword = async (teacher: any) => {
    try {
      const credDoc = await getDoc(doc(db, "teacher_credentials", teacher.id));
      if (credDoc.exists()) {
        setViewedPassword({ name: teacher.name, password: credDoc.data().password });
      } else {
        setViewedPassword({ name: teacher.name, password: teacher.nip || "guru12345" });
      }
    } catch (err) {
      console.error("Error fetching password:", err);
      setMessage({ type: "error", text: "Gagal mengambil kata sandi." });
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.nip && t.nip.includes(searchQuery))
  );

  if (loading) return <div>Memuat data guru...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama guru atau NIP..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[#141414] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-zinc-800 transition-all font-bold"
        >
          <Plus size={20} />
          <span>Tambah Guru & Jadwal</span>
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <motion.div 
            key={teacher.id}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 text-xl font-bold">
                {teacher.name.charAt(0)}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{teacher.name}</h3>
            <div className="space-y-3 mt-4">
              <div className="flex items-center text-sm text-zinc-500">
                <Mail size={16} className="mr-3 text-zinc-300" />
                {teacher.email}
              </div>
              <div className="flex items-center text-sm text-zinc-500">
                <UserIcon size={16} className="mr-3 text-zinc-300" />
                NIP: {teacher.nip || "-"}
              </div>
              <div className="flex items-center text-sm text-zinc-500">
                <div className="w-4 mr-3 flex justify-center text-zinc-300 font-bold text-[10px]">MP</div>
                Mapel: {teacher.subject || "-"}
              </div>
              <div className="flex items-center text-sm text-zinc-500">
                <div className="w-4 mr-3 flex justify-center text-zinc-300 font-bold text-[10px]">KL</div>
                Kelas: {teacher.teaching_class || "-"}
              </div>
              <div className="flex items-center text-sm text-zinc-500">
                <div className="w-4 mr-3 flex justify-center text-zinc-300 font-bold text-[10px]">PG</div>
                Pangkat: {teacher.rank_grade || "-"}
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-8 pt-6 border-t border-zinc-50">
              <button 
                onClick={() => handleEdit(teacher)}
                className="flex-1 flex items-center justify-center space-x-2 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold transition-all"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => handleDelete(teacher.id)}
                className="flex-1 flex items-center justify-center space-x-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 size={14} />
                <span>Hapus</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {teacherToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Hapus Guru
                </h3>
                <button 
                  onClick={() => setTeacherToDelete(null)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-600">
                  Apakah Anda yakin ingin menghapus guru ini? Akun dan data guru akan dihapus permanen dan tidak dapat dikembalikan.
                </p>
              </div>
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                <button 
                  onClick={() => setTeacherToDelete(null)}
                  className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Password Modal */}
      <AnimatePresence>
        {viewedPassword && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">Kata Sandi Guru</h3>
                <button 
                  onClick={() => setViewedPassword(null)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-500">
                  Berikut adalah kata sandi untuk akun <span className="font-bold text-zinc-900">{viewedPassword.name}</span>. Silakan berikan kata sandi ini kepada guru yang bersangkutan agar mereka dapat masuk ke sistem.
                </p>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
                  <code className="text-lg font-mono font-bold text-emerald-600">{viewedPassword.password}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(viewedPassword.password);
                      setMessage({ type: "success", text: "Kata sandi disalin ke clipboard!" });
                    }}
                    className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Salin ke clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
              </div>
              <div className="p-6 bg-zinc-50 border-t border-zinc-100">
                <button 
                  onClick={() => setViewedPassword(null)}
                  className="w-full py-3 bg-[#141414] text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Teacher Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif italic font-bold">
                    {editingTeacher ? "Edit Data Guru" : "Tambah Guru & Jadwal Supervisi"}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {editingTeacher ? "Perbarui informasi profil guru." : "Lengkapi data guru dan tentukan jadwal supervisi akademik."}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTeacher(null);
                  }} 
                  className="text-zinc-400 hover:text-zinc-900"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-zinc-900 border-l-4 border-emerald-500 pl-3">Data Pribadi Guru</h4>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nama Lengkap</label>
                      <input 
                        type="text" required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="Nama Guru..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email (Opsional)</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="email@guru.id"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">NIP</label>
                      <input 
                        type="text" required
                        value={formData.nip}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="NIP Guru..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mata Pelajaran</label>
                      <input 
                        type="text" required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="Contoh: Tematik / Matematika"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kelas</label>
                        <input 
                          type="text" required
                          value={formData.teaching_class}
                          onChange={(e) => setFormData({ ...formData, teaching_class: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          placeholder="Contoh: 1A"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pangkat/Gol</label>
                        <input 
                          type="text" required
                          value={formData.rank_grade}
                          onChange={(e) => setFormData({ ...formData, rank_grade: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          placeholder="Contoh: III/a"
                        />
                      </div>
                    </div>
                  </div>

                  {!editingTeacher && (
                    <div className="space-y-6">
                      <h4 className="text-sm font-bold text-zinc-900 border-l-4 border-indigo-500 pl-3">Jadwal Supervisi</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tahap 1: Administrasi</label>
                          <input 
                            type="date" required
                            value={formData.schedule.stage1}
                            onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, stage1: e.target.value } })}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tahap 2: Perencanaan</label>
                          <input 
                            type="date" required
                            value={formData.schedule.stage2}
                            onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, stage2: e.target.value } })}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tahap 3: Pelaksanaan</label>
                          <input 
                            type="date" required
                            value={formData.schedule.stage3}
                            onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, stage3: e.target.value } })}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tahap 4: Refleksi</label>
                          <input 
                            type="date" required
                            value={formData.schedule.stage4}
                            onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, stage4: e.target.value } })}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-100 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTeacher(null);
                    }}
                    className="flex-1 py-4 rounded-xl font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : (editingTeacher ? "Perbarui Guru" : "Simpan Guru & Jadwal")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
