import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";
import { ClipboardCheck, CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, User as UserIcon, School } from "lucide-react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc, setDoc, addDoc } from "firebase/firestore";

export default function Dashboard({ user }: { user: User }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, completed: 0, ongoing: 0 });
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalSchools: 0, activeSchools: 0, pendingSchools: 0 });
  const [registeredSchools, setRegisteredSchools] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.email === "demo@supervisi.com") {
      const seedDemoData = async () => {
        try {
          const schoolRef = doc(db, "schools", "demo_school");
          const schoolSnap = await getDoc(schoolRef);
          if (!schoolSnap.exists()) {
            await setDoc(schoolRef, {
              name: "SD Negeri Contoh (DEMO)",
              address: "Jl. Pendidikan No. 123, Kota Demo",
              header_text: "DINAS PENDIDIKAN\nSD NEGERI CONTOH (DEMO)",
              logo_school: "",
              logo_gov: "",
              status: "ACTIVE"
            });
            
            const teachers = [
              { name: "Budi Santoso, S.Pd.", nip: "198501012010011001", role: "GURU", school_id: "demo_school", status: "ACTIVE", email: "guru_demo1@sekolah.local", created_at: new Date().toISOString() },
              { name: "Siti Aminah, S.Pd.SD", nip: "198805052015012002", role: "GURU", school_id: "demo_school", status: "ACTIVE", email: "guru_demo2@sekolah.local", created_at: new Date().toISOString() }
            ];
            for (const t of teachers) {
              await addDoc(collection(db, "users"), t);
            }

            // Add a sample supervision
            await addDoc(collection(db, "supervisions"), {
              school_id: "demo_school",
              principal_id: user.id,
              teacher_id: "demo_teacher_1",
              teacher_name: "Budi Santoso, S.Pd.",
              date: new Date().toISOString().split('T')[0],
              status: "PROSES",
              stage1_data: { items: { "1": 2, "2": 1, "3": 2 }, notes: "Perangkat administrasi cukup lengkap." },
              created_at: new Date().toISOString()
            });

            // Create the demo user document if it doesn't exist
            const userRef = doc(db, "users", user.id);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                email: user.email,
                name: user.name,
                role: "KEPALA_SEKOLAH",
                school_id: "demo_school",
                status: "ACTIVE",
                created_at: new Date().toISOString()
              });
            }
          }
        } catch (e) {
          console.error("Error seeding demo data:", e);
        }
      };
      seedDemoData();
    }
  }, [user.email, user.id, user.name]);

  useEffect(() => {
    if (!user.id) return;

    let unsubSchools: (() => void) | null = null;
    let unsubUsers: (() => void) | null = null;
    let unsubSups: (() => void) | null = null;

    if (user.role === 'ADMIN') {
      const schoolsRef = collection(db, "schools");
      const usersRef = collection(db, "users");

      unsubSchools = onSnapshot(schoolsRef, (snapshot) => {
        const schools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const active = schools.filter((s: any) => s.status === 'ACTIVE').length;
        const pending = schools.filter((s: any) => s.status === 'PENDING').length;
        
        setAdminStats(prev => ({ ...prev, totalSchools: schools.length, activeSchools: active, pendingSchools: pending }));
        const sorted = [...schools].sort((a: any, b: any) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        setRegisteredSchools(sorted.slice(0, 10));
      });

      unsubUsers = onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdminStats(prev => ({ ...prev, totalUsers: snapshot.size }));
        const sortedUsers = [...users].sort((a: any, b: any) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        setRegisteredUsers(sortedUsers.slice(0, 10));
      });
      
      setLoading(false);
    } else {
      // Query for supervisions related to this user
      const supervisionsRef = collection(db, "supervisions");
      let q;
      
      if (user.role === 'KEPALA_SEKOLAH') {
        q = query(
          supervisionsRef,
          where("school_id", "==", user.school_id)
        );
      } else {
        q = query(
          supervisionsRef,
          where("teacher_id", "==", user.id)
        );
      }

      unsubSups = onSnapshot(q, (snapshot) => {
        const sups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const total = sups.length;
        const completed = sups.filter((s: any) => s.status === "SELESAI").length;
        const ongoing = sups.filter((s: any) => s.status === "PROSES").length;

        setStats({ total, completed, ongoing });

        const sortedAgenda = [...sups]
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        setAgenda(sortedAgenda);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      });
    }

    return () => {
      if (unsubSchools) unsubSchools();
      if (unsubUsers) unsubUsers();
      if (unsubSups) unsubSups();
    };
  }, [user.id, user.school_id, user.role]);

  const chartData = [
    { name: "Selesai", value: stats.completed, color: "#10b981" },
    { name: "Proses", value: stats.ongoing, color: "#f59e0b" },
    { name: "Belum", value: Math.max(0, stats.total - stats.completed - stats.ongoing), color: "#ef4444" },
  ];

  if (loading) return <div className="h-64 flex items-center justify-center">Memuat data dashboard...</div>;

  if (user.role === 'ADMIN') {
    return (
      <div className="space-y-8">
        <div className="bg-[#141414] text-white p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-serif italic font-bold mb-4">Halo, Admin</h2>
            <p className="text-white/60 text-lg max-w-xl">
              Selamat datang di Panel Kontrol Utama e-Supervisi360. 
              Gunakan menu Admin Panel untuk meninjau dan menyetujui pendaftaran sekolah baru.
            </p>
            <button 
              onClick={() => navigate('/admin')}
              className="mt-8 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Buka Admin Panel
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Total Pengguna" 
            value={adminStats.totalUsers} 
            icon={<UserIcon className="text-blue-500" />} 
            trend="Total akun terdaftar"
            color="blue"
          />
          <StatCard 
            title="Total Sekolah" 
            value={adminStats.totalSchools} 
            icon={<School className="text-indigo-500" />} 
            trend="Seluruh sekolah"
            color="indigo"
          />
          <StatCard 
            title="Sekolah Aktif" 
            value={adminStats.activeSchools} 
            icon={<CheckCircle2 className="text-emerald-500" />} 
            trend="Lisensi aktif"
            color="emerald"
          />
          <StatCard 
            title="Selesai Ditinjau" 
            value={adminStats.pendingSchools} 
            icon={<AlertCircle className="text-amber-500" />} 
            trend="Perlu verifikasi"
            color="amber"
          />
        </div>

        {/* Registered Schools and Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schools List */}
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <School className="mr-2 text-emerald-500" size={20} />
              Sekolah Terdaftar Terkini
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                    <th className="pb-4">Nama Sekolah</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {registeredSchools.map((s: any) => (
                    <tr key={s.id} className="group">
                      <td className="py-4">
                        <p className="text-sm font-bold text-zinc-900">{s.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">{s.address}</p>
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => navigate('/admin')}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <UserIcon className="mr-2 text-blue-500" size={20} />
              Pengguna Terdaftar Terkini
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100">
                    <th className="pb-4">Nama Pengguna</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {registeredUsers.map((u: any) => (
                    <tr key={u.id} className="group">
                      <td className="py-4">
                        <p className="text-sm font-bold text-zinc-900">{u.name}</p>
                        <p className="text-[10px] text-zinc-500">{u.nip || 'NIP -'}</p>
                      </td>
                      <td className="py-4">
                        <span className="text-[10px] font-bold px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md">
                          {u.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-[10px] text-zinc-500">{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif italic font-bold text-zinc-900">Selamat Datang, {user.name}</h2>
          <p className="text-zinc-500 mt-1">Berikut adalah ringkasan progres supervisi guru di sekolah Anda.</p>
        </div>
        <div className="hidden md:block">
          <div className="bg-white px-4 py-2 rounded-2xl border border-black/5 flex items-center space-x-3 shadow-sm">
            <Calendar className="text-emerald-500" size={20} />
            <span className="text-sm font-medium">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Supervisi" 
          value={stats.total} 
          icon={<ClipboardCheck className="text-blue-500" />} 
          trend="+2 dari bulan lalu"
          color="blue"
        />
        <StatCard 
          title="Selesai" 
          value={stats.completed} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          trend="85% Tingkat penyelesaian"
          color="emerald"
        />
        <StatCard 
          title="Dalam Proses" 
          value={stats.ongoing} 
          icon={<Clock className="text-amber-500" />} 
          trend="3 Perlu tindak lanjut"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-black/5 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center">
              <TrendingUp className="mr-2 text-emerald-500" size={20} />
              Statistik Progres Supervisi
            </h3>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  cursor={{ fill: '#f8f8f8' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Notifications */}
        <div className="bg-[#141414] text-white p-8 rounded-3xl shadow-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <AlertCircle className="mr-2 text-emerald-400" size={20} />
            Agenda Terdekat
          </h3>
          <div className="space-y-6">
            {agenda.length > 0 ? (
              agenda.map((item) => (
                <AgendaItem 
                  key={item.id}
                  title={`Supervisi ${item.teacher_name || item.principal_name}`} 
                  time={new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} 
                  teacher={item.teacher_name || item.principal_name} 
                  type={item.status === 'BELUM' ? 'Jadwal' : 'Proses'}
                  onClick={() => { navigate(`/supervisi/${item.id}`); }}
                />
              ))
            ) : (
              <p className="text-white/50 text-sm italic">Tidak ada agenda terdekat.</p>
            )}
          </div>
          <button 
            onClick={() => navigate('/supervisi')}
            className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all"
          >
            Lihat Semua Jadwal
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string, value: number, icon: React.ReactNode, trend: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bulan Ini</span>
      </div>
      <h4 className="text-zinc-500 text-sm font-medium">{title}</h4>
      <div className="flex items-baseline space-x-2 mt-1">
        <span className="text-3xl font-bold text-zinc-900">{value}</span>
        <span className="text-xs text-emerald-500 font-medium">{trend}</span>
      </div>
    </motion.div>
  );
}

function AgendaItem({ title, time, teacher, type, onClick }: { title: string, time: string, teacher: string, type: string, onClick?: () => void, key?: any }) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold group-hover:text-emerald-400 transition-colors">{title}</p>
          <p className="text-xs text-white/50 mt-1">{teacher}</p>
        </div>
        <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md uppercase tracking-tighter">{type}</span>
      </div>
      <div className="flex items-center mt-2 text-[10px] text-white/30">
        <Clock size={10} className="mr-1" />
        {time}
      </div>
      <div className="h-px bg-white/5 mt-4"></div>
    </div>
  );
}
