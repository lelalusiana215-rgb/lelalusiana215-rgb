import React, { useState, useEffect } from "react";
import { User } from "../types";
import { ShieldCheck, School, MapPin, FileText, Save, User as UserIcon, Sparkles, Key, ArrowLeft, PenTool } from "lucide-react";
import { motion } from "motion/react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

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

export default function PrincipalProfile({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('CUSTOM_GEMINI_API_KEY') || "");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    school_name: "",
    school_address: "",
    header_text: "",
    logo_school: "",
    logo_gov: ""
  });

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchProfile = async () => {
    if (!user.id || !user.school_id) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.id));
      const schoolDoc = await getDoc(doc(db, "schools", user.school_id));
      
      if (userDoc.exists() && schoolDoc.exists()) {
        const userData = userDoc.data();
        const schoolData = schoolDoc.data();
        setFormData({
          name: userData.name || "",
          nip: userData.nip || "",
          school_name: schoolData.name || "",
          school_address: schoolData.address || "",
          header_text: schoolData.header_text || "",
          logo_school: schoolData.logo_school || "",
          logo_gov: schoolData.logo_gov || ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      try {
        await updateDoc(doc(db, "users", user.id), {
          name: formData.name,
          nip: formData.nip
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
      }
      
      try {
        await updateDoc(doc(db, "schools", user.school_id), {
          name: formData.school_name,
          address: formData.school_address,
          header_text: formData.header_text,
          logo_school: formData.logo_school,
          logo_gov: formData.logo_gov
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `schools/${user.school_id}`);
      }
      
      setMessage({ type: "success", text: "Data berhasil diperbarui!" });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal memperbarui data: " + (err.message || "Akses ditolak.") });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Memuat data sekolah...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic font-bold text-zinc-900">Data Sekolah</h2>
          <p className="text-zinc-500 mt-1">Kelola informasi sekolah, logo, dan profil kepala sekolah.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            to="/program-supervisi"
            className="flex items-center space-x-2 bg-white text-emerald-600 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors font-bold shadow-sm"
          >
            <FileText size={18} />
            <span className="hidden sm:inline">Susun Program Supervisi</span>
          </Link>
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
          {/* Principal Info */}
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center">
              <UserIcon className="mr-2 text-emerald-500" size={20} />
              Profil Kepala Sekolah
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
          </div>

          {/* School Info */}
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
          </div>
        </div>

        {/* Logo Upload Section */}
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

        {/* Header Text Section */}
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

        {/* AI Configuration Section */}
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
            <p className="text-sm text-purple-900 leading-relaxed">
              Fitur AI digunakan untuk memberikan rekomendasi supervisi otomatis. 
              Anda dapat menggunakan API Key dari Google AI Studio untuk mengaktifkan fitur ini.
            </p>
            
            <div className="flex flex-wrap gap-3">
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
                <p className="text-[10px] text-zinc-400 italic">API Key ini akan disimpan secara lokal di browser Anda. Gunakan jika fitur "Pilih API Key" tidak tersedia.</p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (customApiKey.trim()) {
                      localStorage.setItem('CUSTOM_GEMINI_API_KEY', customApiKey.trim());
                      setMessage({ type: "success", text: "API Key kustom berhasil disimpan di perangkat ini." });
                    } else {
                      localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
                      setMessage({ type: "success", text: "API Key kustom dihapus. Menggunakan key bawaan sistem." });
                    }
                    setShowApiKeyInput(false);
                  }}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
                >
                  Simpan
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
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
