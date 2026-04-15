import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  FileText, 
  Users, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Key, 
  ShoppingBag,
  PlayCircle,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  const advantages = [
    {
      icon: <Zap className="text-amber-500" />,
      title: "Efisiensi Tinggi",
      description: "Proses supervisi yang biasanya memakan waktu berjam-jam kini dapat diselesaikan dalam hitungan menit dengan bantuan AI."
    },
    {
      icon: <Sparkles className="text-emerald-500" />,
      title: "Analisis AI Cerdas",
      description: "Dapatkan rekomendasi tindak lanjut yang objektif dan mendalam berdasarkan data instrumen yang diinput."
    },
    {
      icon: <BarChart3 className="text-blue-500" />,
      title: "Visualisasi Data",
      description: "Dashboard interaktif memberikan gambaran menyeluruh tentang performa guru dan kemajuan supervisi sekolah."
    },
    {
      icon: <FileText className="text-purple-500" />,
      title: "Laporan Instan",
      description: "Cetak laporan supervisi dalam format PDF atau Word yang profesional dan siap pakai hanya dengan satu klik."
    }
  ];

  const features = [
    { name: "Manajemen Data Guru", icon: <Users size={20} /> },
    { name: "Program Supervisi Tahunan", icon: <FileText size={20} /> },
    { name: "Penjadwalan Otomatis", icon: <Calendar size={20} /> },
    { name: "Instrumen Digital Lengkap", icon: <CheckCircle2 size={20} /> },
    { name: "Dashboard Monitoring", icon: <LayoutDashboard size={20} /> },
    { name: "Arsip Digital Terpusat", icon: <ShieldCheck size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-black/5 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            <span className="font-serif italic text-xl font-bold tracking-tight">e-Supervisi360</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-600">
            <a href="#keunggulan" className="hover:text-emerald-600 transition-colors">Keunggulan</a>
            <a href="#fitur" className="hover:text-emerald-600 transition-colors">Fitur</a>
            <a href="#tutorial" className="hover:text-emerald-600 transition-colors">Tutorial API</a>
            <Link to="/login" className="text-zinc-400 hover:text-zinc-600 transition-colors">Member Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-3xl"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Solusi Supervisi Masa Kini</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic font-bold leading-[1.1] text-zinc-900">
              Transformasi Digital <br />
              <span className="text-emerald-600">Supervisi Akademik</span>
            </h1>
            <p className="text-xl text-zinc-500 leading-relaxed mx-auto">
              Platform cerdas untuk Kepala Sekolah dalam merencanakan, melaksanakan, dan mengevaluasi supervisi akademik secara efisien, akurat, dan profesional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                <PlayCircle size={20} />
                <span>Coba Demo Gratis</span>
              </Link>
              <a 
                href="http://lynk.id/bugurulela" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white border border-zinc-200 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
              >
                <ShoppingBag size={20} />
                <span>Beli Lisensi Penuh</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advantages */}
      <section id="keunggulan" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-serif italic font-bold">Mengapa e-Supervisi360?</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">Dirancang khusus untuk memenuhi kebutuhan administrasi dan evaluasi pendidikan di era digital.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((adv, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-[#F5F5F0] rounded-[32px] space-y-4 border border-transparent hover:border-emerald-200 transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  {adv.icon}
                </div>
                <h3 className="text-xl font-bold">{adv.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{adv.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-8 text-center">
              <h2 className="text-4xl font-serif italic font-bold leading-tight">
                Fitur Lengkap untuk <br />
                <span className="text-emerald-600">Kendali Penuh</span> Sekolah
              </h2>
              <p className="text-zinc-500 text-lg mx-auto max-w-2xl">
                Semua instrumen supervisi telah disesuaikan dengan standar terbaru, memudahkan Anda dalam melakukan penilaian yang objektif.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                {features.map((feat, i) => (
                  <div key={i} className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-black/5 shadow-sm">
                    <div className="text-emerald-600">{feat.icon}</div>
                    <span className="font-medium text-sm">{feat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Section */}
      <section id="tutorial" className="py-24 bg-zinc-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-bold uppercase tracking-wider">
                <Key size={14} />
                <span>Panduan Teknis</span>
              </div>
              <h2 className="text-4xl font-serif italic font-bold">Cara Mengganti API Key</h2>
              <p className="text-white/60 leading-relaxed">
                Aplikasi ini menggunakan teknologi AI Gemini untuk analisis data. Anda dapat menggunakan API Key milik Anda sendiri untuk kontrol penuh dan kuota yang lebih besar melalui menu Data Sekolah.
              </p>
              <ol className="space-y-4">
                {[
                  "Dapatkan API Key dari Google AI Studio (aistudio.google.com)",
                  "Masuk ke aplikasi e-Supervisi360 sebagai Kepala Sekolah",
                  "Buka menu 'Data Sekolah' di sidebar",
                  "Scroll ke bawah hingga menemukan bagian 'Konfigurasi AI (Gemini)'",
                  "Pilih API Key dari akun Google Anda atau masukkan secara manual"
                ].map((step, i) => (
                  <li key={i} className="flex items-start space-x-4">
                    <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                    <p className="text-white/80 pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs text-white/40 font-mono">data_sekolah.tsx</span>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <p className="text-emerald-400 mb-2">// Konfigurasi Gemini AI</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">GEMINI_API_KEY</span>
                    <span className="text-white/30">••••••••••••••••</span>
                    <button className="text-xs px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-md border border-emerald-600/30">Ganti</button>
                  </div>
                </div>
                <div className="p-4 bg-emerald-600/10 rounded-xl border border-emerald-600/20 text-emerald-400">
                  <p>✓ API Key berhasil diperbarui</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-emerald-600 rounded-[48px] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-600/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif italic font-bold">Siap Memulai Digitalisasi Sekolah?</h2>
            <p className="text-emerald-50 text-lg max-w-2xl mx-auto">
              Dapatkan akses penuh ke semua fitur e-Supervisi360 dan tingkatkan standar kualitas pendidikan di sekolah Anda sekarang juga.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <a 
                href="http://lynk.id/bugurulela" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 px-10 py-5 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-zinc-50 transition-all shadow-xl"
              >
                <ShoppingBag size={20} />
                <span>Beli Lisensi Penuh</span>
              </a>
              <Link 
                to="/login" 
                className="flex items-center justify-center space-x-2 px-10 py-5 bg-emerald-700 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-all border border-emerald-500/30"
              >
                <PlayCircle size={20} />
                <span>Coba Demo Gratis</span>
              </Link>
            </div>
            <p className="text-emerald-200 text-sm">
              Butuh bantuan? Hubungi kami melalui <a href="https://wa.me/6285294723793" className="underline font-bold">WhatsApp</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-black/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white">
              <ShieldCheck size={16} />
            </div>
            <span className="font-serif italic text-lg font-bold tracking-tight">e-Supervisi360</span>
          </div>
          <p className="text-zinc-400 text-sm">© 2024 e-Supervisi360. Dibuat dengan ❤️ untuk Pendidikan Indonesia.</p>
          <div className="flex space-x-6 text-sm font-medium text-zinc-500">
            <Link to="/login" className="hover:text-emerald-600">Member Login</Link>
            <a href="http://lynk.id/bugurulela" className="hover:text-emerald-600">Beli Lisensi</a>
            <a href="https://wa.me/6285294723793" className="hover:text-emerald-600">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
