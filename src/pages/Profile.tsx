import React, { useState, useEffect } from "react";
import { User } from "../types";
import { ShieldCheck, School, MapPin, FileText, Save, User as UserIcon, Sparkles, Key, ArrowLeft, PenTool, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Profile({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [customApiKey, setCustomApiKey] = useState(user.api_key || localStorage.getItem('CUSTOM_GEMINI_API_KEY') || "");
  const [systemApiKeyActive, setSystemApiKeyActive] = useState<boolean | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    school_name: "",
    school_address: "",
    header_text: "",
    logo_school: "",
    logo_gov: "",
    academic_year: "",
    teaching_class: "",
    rank_grade: "",
    subject: ""
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user.id) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.id));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        let schoolData: any = null;
        if (user.school_id) {
          const schoolDoc = await getDoc(doc(db, "schools", user.school_id));
          if (schoolDoc.exists()) {
            schoolData = schoolDoc.data();
          }
        }
        
        if (userData) {
          setFormData({
            name: userData.name || "",
            nip: userData.nip || "",
            school_name: schoolData?.name || "",
            school_address: schoolData?.address || "",
            header_text: schoolData?.header_text || "",
            logo_school: schoolData?.logo_school || "",
            logo_gov: schoolData?.logo_gov || "",
            academic_year: schoolData?.academic_year || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
            teaching_class: userData.teaching_class || "",
            rank_grade: userData.rank_grade || "",
            subject: userData.subject || ""
          });

          if (userData.api_key) {
            setCustomApiKey(userData.api_key);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const checkSystemApiKeyStatus = async () => {
      try {
        const configSnap = await getDoc(doc(db, "config", "gemini"));
        const hasFirestoreKey = configSnap.exists() && !!configSnap.data().apiKey;
        const hasEnvKey = !!(typeof process !== 'undefined' && process.env && (process.env as any).GEMINI_API_KEY);
        setSystemApiKeyActive(hasFirestoreKey || hasEnvKey);
      } catch (err) {
        console.error("Error checking system API key:", err);
        setSystemApiKeyActive(false);
      }
    };

    fetchProfileData();
    checkSystemApiKeyStatus();
  }, [user.id, user.school_id, user.role]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'school' | 'gov') => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ukuran gambar terlalu besar. Maksimal 5MB." });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image element to resize
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setFormData(prev => ({
            ...prev,
            [type === 'school' ? 'logo_school' : 'logo_gov']: compressedBase64
          }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckApiKey = async () => {
    if (!customApiKey.trim()) {
      setMessage({ type: "error", text: "Silakan masukkan API Key terlebih dahulu." });
      return;
    }

    setTestingApiKey(true);
    setApiKeyStatus('none');
    try {
      const ai = new GoogleGenAI({ apiKey: customApiKey.trim() });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Say 'OK'",
      });
      
      if (response.text) {
        setApiKeyStatus('valid');
        setMessage({ type: "success", text: "API Key valid dan aktif!" });
      } else {
        throw new Error("Respon kosong dari AI.");
      }
    } catch (err: any) {
      console.error("API Key Check Error:", err);
      setApiKeyStatus('invalid');
      setMessage({ type: "error", text: "API Key tidak valid atau tidak aktif. Detail: " + (err.message || "Pastikan kunci benar dan kuota mencukupi.") });
    } finally {
      setTestingApiKey(false);
    }
  };

  const handleSaveApiKey = async () => {
    setSaving(true);
    try {
      const keyToSave = customApiKey.trim();
      await updateDoc(doc(db, "users", user.id), {
        api_key: keyToSave
      });
      
      if (keyToSave) {
        localStorage.setItem('CUSTOM_GEMINI_API_KEY', keyToSave);
        setMessage({ type: "success", text: "API Key kustom berhasil disimpan ke akun Anda." });
      } else {
        localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
        setMessage({ type: "success", text: "API Key kustom dihapus dari akun Anda." });
      }
      setShowApiKeyInput(false);
    } catch (err: any) {
      console.error("Error saving API Key:", err);
      setMessage({ type: "error", text: "Gagal menyimpan API Key: " + (err.message || "Terjadi kesalahan.") });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      try {
        const updateData: any = {
          name: formData.name,
          nip: formData.nip
        };
        
        if (user.role === 'GURU') {
          updateData.teaching_class = formData.teaching_class;
          updateData.rank_grade = formData.rank_grade;
          updateData.subject = formData.subject;
        }

        await updateDoc(doc(db, "users", user.id), updateData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
      }
      
      if (user.role === 'KEPALA_SEKOLAH' && user.school_id) {
        try {
          await updateDoc(doc(db, "schools", user.school_id), {
            name: formData.school_name,
            address: formData.school_address,
            header_text: formData.header_text,
            logo_school: formData.logo_school,
            logo_gov: formData.logo_gov,
            academic_year: formData.academic_year
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `schools/${user.school_id}`);
        }
      }
      
      setMessage({ type: "success", text: "Data profil berhasil diperbarui!" });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal memperbarui data: " + (err.message || "Akses ditolak.") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Memuat data profil...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic font-bold text-zinc-900">Profil Saya</h2>
          <p className="text-zinc-500 mt-1">Kelola informasi pribadi{user.role === 'KEPALA_SEKOLAH' ? ', data sekolah,' : ''} dan konfigurasi AI.</p>
        </div>
        <div className="flex items-center space-x-3">
          {user.role === 'KEPALA_SEKOLAH' && (
            <>
              <Link 
                to="/jadwal-supervisi"
                className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors font-bold shadow-sm"
              >
                <Clock size={18} />
                <span className="hidden sm:inline">Jadwal Rencana</span>
              </Link>
              <Link 
                to="/program-supervisi"
                className="flex items-center space-x-2 bg-white text-emerald-600 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors font-bold shadow-sm"
              >
                <FileText size={18} />
                <span className="hidden sm:inline">Susun Program Supervisi</span>
              </Link>
            </>
          )}
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
            <ShieldCheck size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Status: {user.status}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {message.text && (
          <div className={`p-4 rounded-2xl text-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info */}
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center">
              <UserIcon className="mr-2 text-emerald-500" size={20} />
              Profil {user.role === 'KEPALA_SEKOLAH' ? 'Kepala Sekolah' : 'Guru'}
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nama Lengkap</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">NIP</label>
              <input 
                type="text" required
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email (Akun)</label>
              <input 
                type="email" disabled
                value={user.email}
                className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-zinc-400 italic">Email tidak dapat diubah untuk keamanan akun.</p>
            </div>
            
            {user.role === 'GURU' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mata Pelajaran</label>
                  <input 
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kelas</label>
                    <input 
                      type="text"
                      value={formData.teaching_class}
                      onChange={(e) => setFormData({ ...formData, teaching_class: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pangkat/Gol</label>
                    <input 
                      type="text"
                      value={formData.rank_grade}
                      onChange={(e) => setFormData({ ...formData, rank_grade: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* School Info (Conditional) */}
          {user.role === 'KEPALA_SEKOLAH' ? (
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
              <h3 className="text-lg font-bold flex items-center">
                <School className="mr-2 text-indigo-500" size={20} />
                Informasi Sekolah
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nama Sekolah</label>
                <input 
                  type="text" required
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Alamat Sekolah</label>
                <textarea 
                  required
                  value={formData.school_address}
                  onChange={(e) => setFormData({ ...formData, school_address: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tahun Ajaran</label>
                <select 
                  required
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    const academicYear = `${year}/${year + 1}`;
                    return <option key={academicYear} value={academicYear}>{academicYear}</option>;
                  })}
                </select>
              </div>
            </div>
          ) : (
            <div className="bg-[#141414] p-8 rounded-3xl border border-white/5 shadow-xl space-y-6 text-white flex flex-col justify-center">
              <div className="space-y-2 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <School size={40} />
                </div>
                <h3 className="text-xl font-bold">Informasi Instansi</h3>
                <p className="text-zinc-400 text-sm">
                  Pengaturan data sekolah hanya dapat dilakukan oleh Kepala Sekolah penanggung jawab akun utama.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Terdaftar di:</p>
                  <p className="font-bold text-emerald-500">{formData.school_name || "Memuat..."}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logo Upload Section (Conditional) */}
        {user.role === 'KEPALA_SEKOLAH' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
              <h3 className="text-lg font-bold flex items-center">
                <ShieldCheck className="mr-2 text-blue-500" size={20} />
                Logo Pemerintah (Kiri)
              </h3>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl flex items-center justify-center overflow-hidden">
                  {formData.logo_gov ? (
                    <img src={formData.logo_gov} alt="Logo Gov" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-zinc-400 text-center px-2">Belum ada logo</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-3 px-4 rounded-xl text-center transition-all">
                    Pilih Logo Pemerintah
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'gov')} />
                  </label>
                  <p className="text-[10px] text-zinc-400 italic">Format: PNG/JPG, Maks 500KB</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
              <h3 className="text-lg font-bold flex items-center">
                <School className="mr-2 text-emerald-500" size={20} />
                Logo Sekolah (Kanan)
              </h3>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl flex items-center justify-center overflow-hidden">
                  {formData.logo_school ? (
                    <img src={formData.logo_school} alt="Logo School" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-zinc-400 text-center px-2">Belum ada logo</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider cursor-pointer bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-3 px-4 rounded-xl text-center transition-all">
                    Pilih Logo Sekolah
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'school')} />
                  </label>
                  <p className="text-[10px] text-zinc-400 italic">Format: PNG/JPG, Maks 500KB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Text Section (Conditional) */}
        {user.role === 'KEPALA_SEKOLAH' && (
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center">
              <FileText className="mr-2 text-amber-500" size={20} />
              Kop Surat Laporan
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Teks Kop Surat (Gunakan \n untuk baris baru)</label>
              <textarea 
                required
                value={formData.header_text}
                onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono text-sm"
                placeholder="DINAS PENDIDIKAN\nSD NEGERI 01 CONTOH"
              />
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Pratinjau Kop:</p>
              <div className="text-center font-bold text-sm text-zinc-800 whitespace-pre-line">
                {formData.header_text}
              </div>
            </div>
          </div>
        )}

        {/* AI Configuration Section - Hidden for Demo Account */}
        {user.email !== "demo@supervisi.com" && (
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center">
                <Sparkles className="mr-2 text-purple-500" size={20} />
                Konfigurasi AI (Gemini)
              </h3>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-purple-600 hover:underline flex items-center"
              >
                Dapatkan API Key di Google AI Studio
                <ArrowLeft size={10} className="ml-1 rotate-180" />
              </a>
            </div>
            
            <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 space-y-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-purple-900 leading-relaxed font-medium">
                  Fitur AI membantu memberikan rekomendasi dan catatan otomatis yang konstruktif. 
                  Anda dapat menggunakan API Key pribadi Anda jika API Key sistem telah mencapai limit.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${systemApiKeyActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                    {systemApiKeyActive ? 'SYSTEM KEY: AKTIF' : 'SYSTEM KEY: TIDAK AKTIF'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${customApiKey || user.api_key ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                    {(customApiKey || user.api_key) ? 'CUSTOM KEY: AKTIF' : 'CUSTOM KEY: TIDAK AKTIF'}
                  </div>
                </div>
                {(!systemApiKeyActive && !customApiKey && !user.api_key) && (
                  <p className="text-xs text-red-500 font-bold bg-white/50 p-2 rounded-lg border border-red-100 mt-2">
                    ⚠️ AI tidak aktif. Silakan masukkan API Key Anda di bawah ini untuk mengaktifkan fitur rekomendasi otomatis.
                  </p>
                )}
                {(systemApiKeyActive && !customApiKey && !user.api_key) && (
                  <p className="text-xs text-emerald-600 italic mt-2">
                    Aplikasi sedang menggunakan API Key sistem (shared). Anda dapat menambahkan API Key kustom Anda sendiri untuk kuota pribadi.
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (typeof (window as any).aistudio !== 'undefined' && (window as any).aistudio.openSelectKey) {
                        await (window as any).aistudio.openSelectKey();
                        setMessage({ type: "success", text: "Dialog pemilihan API Key berhasil dibuka." });
                      } else {
                        setShowApiKeyInput(true);
                      }
                    } catch (err) {
                      console.error("Error opening API Key dialog:", err);
                      setShowApiKeyInput(true);
                    }
                  }}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all font-bold shadow-lg shadow-purple-200"
                >
                  <Key size={18} />
                  <span>Pilih API Key (Akun Google)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-xl border border-purple-200 hover:bg-purple-50 transition-all font-bold"
                >
                  <PenTool size={18} />
                  <span>Input Manual</span>
                </button>
              </div>
            </div>
            
            {showApiKeyInput && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-200"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">API Key Gemini Kustom</label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="Masukkan API Key Anda di sini..."
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <p className="text-[10px] text-zinc-400 italic">API Key ini akan disimpan di akun Anda dan dapat diakses di perangkat lain.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={testingApiKey}
                    onClick={handleCheckApiKey}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      apiKeyStatus === 'valid' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : apiKeyStatus === 'invalid'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {testingApiKey ? <Loader2 size={16} className="animate-spin" /> : 
                     apiKeyStatus === 'valid' ? <CheckCircle2 size={16} /> : 
                     apiKeyStatus === 'invalid' ? <XCircle size={16} /> : <Key size={16} />}
                    <span>{testingApiKey ? 'Mengecek...' : apiKeyStatus === 'valid' ? 'Aktif' : apiKeyStatus === 'invalid' ? 'Tidak Aktif' : 'Cek Keaktifan'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan ke Akun'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyInput(false)}
                    className="px-4 py-2 bg-white text-zinc-600 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-[#141414] text-white px-8 py-4 rounded-2xl shadow-lg hover:bg-zinc-800 transition-all font-bold disabled:opacity-50"
          >
            {saving ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <Save size={20} />
                <span>Simpan Perubahan Profil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

