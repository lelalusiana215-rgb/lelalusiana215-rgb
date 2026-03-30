import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { LayoutDashboard, Users, ClipboardCheck, LogOut, Menu, X, ChevronRight, FileText, Printer, ShieldCheck, Clock, AlertCircle, XCircle, UserPlus, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Role, Status } from "./types";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, getDocFromServer, onSnapshot } from "firebase/firestore";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SupervisionList from "./pages/SupervisionList";
import SupervisionDetail from "./pages/SupervisionDetail";
import TeacherManagement from "./pages/TeacherManagement";
import PrincipalProfile from "./pages/PrincipalProfile";
import AdminPanel from "./pages/AdminPanel";

function Layout({ children, user, onLogout }: { children: React.ReactNode, user: User, onLogout: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex">
      {/* Sidebar */}
      <aside className={`bg-[#141414] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          {isSidebarOpen && <span className="font-serif italic text-xl font-bold tracking-tight">e-Supervisi360</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/" active={location.pathname === '/'} collapsed={!isSidebarOpen} />
          <SidebarItem icon={<ClipboardCheck size={20} />} label="Supervisi" to="/supervisi" active={location.pathname.startsWith('/supervisi')} collapsed={!isSidebarOpen} />
          {user.role === 'ADMIN' && (
            <SidebarItem icon={<ShieldCheck size={20} />} label="Admin Panel" to="/admin" active={location.pathname === '/admin'} collapsed={!isSidebarOpen} />
          )}
          {user.role === 'KEPALA_SEKOLAH' && (
            <>
              <SidebarItem icon={<Users size={20} />} label="Data Guru" to="/guru" active={location.pathname === '/guru'} collapsed={!isSidebarOpen} />
              <SidebarItem icon={<FileText size={20} />} label="Data Sekolah" to="/profil" active={location.pathname === '/profil'} collapsed={!isSidebarOpen} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} mb-4`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-white/50 truncate uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            className={`w-full flex items-center ${isSidebarOpen ? 'px-4 justify-start' : 'justify-center'} py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors`}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="ml-3">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-black/5 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-medium text-zinc-800">
            {location.pathname === '/' ? 'Dashboard Overview' : 
             location.pathname === '/supervisi' ? 'Daftar Supervisi' :
             location.pathname === '/guru' ? 'Manajemen Guru' : 
             location.pathname === '/profil' ? 'Data Sekolah' : 'Detail Supervisi'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, to, active, collapsed }: { icon: React.ReactNode, label: string, to: string, active: boolean, collapsed: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-xl transition-all ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      {!collapsed && <span className="ml-3 font-medium">{label}</span>}
    </Link>
  );
}

function PendingView({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl text-center space-y-6 border border-black/5">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl mx-auto flex items-center justify-center">
          <Clock size={40} />
        </div>
        <h1 className="text-2xl font-serif italic font-bold text-zinc-900">Pendaftaran Menunggu Persetujuan</h1>
        <p className="text-zinc-500 leading-relaxed">
          Halo <span className="font-bold text-zinc-800">{user.name}</span>, pendaftaran sekolah Anda sedang dalam proses peninjauan oleh Admin.
        </p>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-sm text-amber-700">
          Mohon tunggu 1-2 hari kerja. Kami akan mengaktifkan akun Anda segera setelah verifikasi selesai.
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}

function RejectedView({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl text-center space-y-6 border border-black/5">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl mx-auto flex items-center justify-center">
          <XCircle size={40} />
        </div>
        <h1 className="text-2xl font-serif italic font-bold text-zinc-900">Pendaftaran Ditolak</h1>
        <p className="text-zinc-500 leading-relaxed">
          Maaf <span className="font-bold text-zinc-800">{user.name}</span>, pendaftaran sekolah Anda tidak dapat kami setujui saat ini.
        </p>
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-sm text-red-700">
          Silakan hubungi Admin melalui WhatsApp untuk informasi lebih lanjut mengenai alasan penolakan.
        </div>
        <div className="space-y-3">
          <a 
            href="https://wa.me/6285294723793" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            Hubungi Admin
          </a>
          <button 
            onClick={() => signOut(auth)}
            className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Test connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsOffline(false);
      } catch (error: any) {
        if (error.message?.includes('offline') || error.code === 'unavailable' || error.code === 'failed-precondition') {
          setIsOffline(true);
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      if (firebaseUser) {
        // Listen to current user document for real-time updates
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            if (firebaseUser.email === "lelalusiana215@gmail.com") {
              setUser({ ...userData, id: firebaseUser.uid, role: "ADMIN", status: "ACTIVE" });
            } else {
              setUser({ id: firebaseUser.uid, ...userData });
            }
          } else {
            // Handle unregistered user
            if (firebaseUser.email === "lelalusiana215@gmail.com") {
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "Owner",
                email: firebaseUser.email,
                role: "ADMIN",
                school_id: "admin_school",
                status: "ACTIVE"
              } as User);
            } else {
              setUser({ 
                id: firebaseUser.uid, 
                email: firebaseUser.email || "", 
                name: firebaseUser.displayName || "User",
                role: "KEPALA_SEKOLAH",
                school_id: "",
                status: "UNREGISTERED" as any 
              } as User);
            }
          }
          setLoading(false);
        }, (err) => {
          console.error("Error listening to user data:", err);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <BrowserRouter>
      {isOffline ? (
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center">
              <WifiOff size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-zinc-900">Koneksi Terputus</h1>
              <p className="text-zinc-500">Aplikasi tidak dapat terhubung ke database. Pastikan koneksi internet stabil dan domain ini telah diizinkan di Firebase Console.</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-xl text-left text-xs space-y-2 font-mono">
              <p className="text-zinc-400 uppercase font-sans font-bold">Detail Teknis:</p>
              <p className="text-zinc-600">Domain: {window.location.hostname}</p>
              <p className="text-zinc-600">Project: gen-lang-client-0369480188</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="h-screen flex items-center justify-center bg-[#F5F5F0]">Memuat...</div>
      ) : user && (user as any).status === 'UNREGISTERED' ? (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus size={40} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-800 mb-4">Selesaikan Pendaftaran</h2>
            <p className="text-zinc-600 mb-8">
              Email <span className="font-bold">{user.email}</span> belum terdaftar di sistem. 
              Silakan selesaikan pendaftaran sekolah Anda terlebih dahulu.
            </p>
            <div className="space-y-3">
              <Link 
                to="/register"
                className="block w-full px-4 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
              >
                Daftar Sekarang
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Keluar
              </button>
            </div>
          </motion.div>
        </div>
      ) : user && user.status === 'PENDING' && user.role !== 'ADMIN' ? (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-800 mb-4">Menunggu Persetujuan</h2>
            <p className="text-zinc-600 mb-8">
              Akun dan sekolah Anda sedang dalam proses peninjauan oleh Admin. 
              Silakan hubungi Admin untuk mempercepat proses aktivasi.
            </p>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              Keluar
            </button>
          </motion.div>
        </div>
      ) : user && user.status === 'REJECTED' ? (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-800 mb-4">Pendaftaran Ditolak</h2>
            <p className="text-zinc-600 mb-8">
              Maaf, pendaftaran akun atau sekolah Anda telah ditolak oleh Admin.
            </p>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              Keluar
            </button>
          </motion.div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={user && (user as any).status !== 'UNREGISTERED' ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user && (user as any).status !== 'UNREGISTERED' ? <Navigate to="/" /> : <Register />} />
          <Route path="/*" element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/supervisi" element={<SupervisionList user={user} />} />
                  <Route path="/supervisi/:id" element={<SupervisionDetail user={user} />} />
                  <Route path="/admin" element={user.role === 'ADMIN' ? <AdminPanel user={user} /> : <Navigate to="/" />} />
                  <Route path="/guru" element={user.role === 'KEPALA_SEKOLAH' ? <TeacherManagement user={user} /> : <Navigate to="/" />} />
                  <Route path="/profil" element={user.role === 'KEPALA_SEKOLAH' ? <PrincipalProfile user={user} /> : <Navigate to="/" />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : <Navigate to="/login" />
          } />
        </Routes>
      )}
    </BrowserRouter>
  );
}
