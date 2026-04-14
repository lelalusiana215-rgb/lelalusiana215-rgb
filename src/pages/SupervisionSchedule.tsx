import React, { useState, useEffect } from "react";
import { User, School } from "../types";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Printer, ArrowLeft, Calendar, User as UserIcon, BookOpen, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function SupervisionSchedule({ user }: { user: User }) {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState<"ganjil" | "genap">("ganjil");

  useEffect(() => {
    fetchData();
  }, [user.school_id]);

  const fetchData = async () => {
    if (!user.school_id) return;
    try {
      // Fetch school data
      const schoolDoc = await getDoc(doc(db, "schools", user.school_id));
      if (schoolDoc.exists()) {
        setSchool({ id: schoolDoc.id, ...schoolDoc.data() } as School);
      }

      // Fetch teachers
      const teachersQ = query(
        collection(db, "users"),
        where("school_id", "==", user.school_id),
        where("role", "==", "GURU"),
        where("status", "==", "ACTIVE")
      );
      const teachersSnapshot = await getDocs(teachersQ);
      const teachersData = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setTeachers(teachersData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat jadwal...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header - Hidden on Print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Link to="/profil" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h2 className="text-3xl font-serif italic font-bold text-zinc-900">Jadwal Rencana Supervisi</h2>
            <p className="text-zinc-500 mt-1">Lampiran jadwal rencana supervisi akademik semester ganjil dan genap.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-xl border border-zinc-200 flex">
            <button
              onClick={() => setActiveSemester("ganjil")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSemester === 'ganjil' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
            >
              Semester Ganjil
            </button>
            <button
              onClick={() => setActiveSemester("genap")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSemester === 'genap' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
            >
              Semester Genap
            </button>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all font-bold"
          >
            <Printer size={20} />
            <span>Cetak Jadwal</span>
          </button>
        </div>
      </div>

      {/* Document Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-16 rounded-[40px] shadow-xl border border-black/5 min-h-[1000px] print:shadow-none print:border-none print:p-0"
      >
        {/* Kop Surat */}
        <div className="flex items-center justify-between border-b-4 border-black pb-6 mb-10">
          {school?.logo_gov && (
            <img src={school.logo_gov} alt="Logo Gov" className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
          )}
          <div className="flex-1 text-center px-4">
            <div className="text-lg font-bold uppercase whitespace-pre-line leading-tight">
              {school?.header_text || "PEMERINTAH KABUPATEN/KOTA\nDINAS PENDIDIKAN"}
            </div>
            <div className="text-sm mt-2">{school?.address}</div>
          </div>
          {school?.logo_school && (
            <img src={school.logo_school} alt="Logo School" className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
          )}
        </div>

        {/* Title */}
        <div className="text-center space-y-2 mb-10">
          <h3 className="text-xl font-bold uppercase underline">JADWAL RENCANA SUPERVISI AKADEMIK</h3>
          <p className="font-bold uppercase">SEMESTER {activeSemester === 'ganjil' ? 'GANJIL' : 'GENAP'}</p>
          <p className="font-bold uppercase">TAHUN PELAJARAN {school?.academic_year || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-zinc-50">
                <th className="border border-black p-3 text-center w-12" rowSpan={2}>No</th>
                <th className="border border-black p-3 text-center" rowSpan={2}>Nama Guru / NIP</th>
                <th className="border border-black p-3 text-center" rowSpan={2}>Mata Pelajaran / Kelas</th>
                <th className="border border-black p-3 text-center" colSpan={4}>Rencana Tanggal Pelaksanaan</th>
              </tr>
              <tr className="bg-zinc-50">
                <th className="border border-black p-2 text-center text-[10px]">Tahap 1: Administrasi</th>
                <th className="border border-black p-2 text-center text-[10px]">Tahap 2: Perencanaan</th>
                <th className="border border-black p-2 text-center text-[10px]">Tahap 3: Pelaksanaan</th>
                <th className="border border-black p-2 text-center text-[10px]">Tahap 4: Refleksi</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((teacher, index) => {
                  const schedule = teacher.planned_schedule?.[activeSemester];
                  return (
                    <tr key={teacher.id}>
                      <td className="border border-black p-3 text-center">{index + 1}</td>
                      <td className="border border-black p-3">
                        <div className="font-bold">{teacher.name}</div>
                        <div className="text-xs text-zinc-500">NIP: {teacher.nip || "-"}</div>
                      </td>
                      <td className="border border-black p-3 text-center">
                        <div>{teacher.subject || "-"}</div>
                        <div className="text-xs text-zinc-500">Kelas: {teacher.teaching_class || "-"}</div>
                      </td>
                      <td className="border border-black p-2 text-center text-xs">
                        {formatDate(schedule?.stage1)}
                      </td>
                      <td className="border border-black p-2 text-center text-xs">
                        {formatDate(schedule?.stage2)}
                      </td>
                      <td className="border border-black p-2 text-center text-xs">
                        {formatDate(schedule?.stage3)}
                      </td>
                      <td className="border border-black p-2 text-center text-xs">
                        {formatDate(schedule?.stage4)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="border border-black p-8 text-center text-zinc-400 italic">
                    Belum ada data guru atau jadwal yang diisi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-16 grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="mb-20">Mengetahui,<br />Pengawas Sekolah</p>
            <div className="w-48 border-b border-black mx-auto mb-1"></div>
            <p>NIP.</p>
          </div>
          <div className="text-center">
            <p className="mb-20">
              {school?.address?.split(',')[0] || "Ditetapkan di"}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
              Kepala Sekolah
            </p>
            <div className="w-48 border-b border-black mx-auto mb-1 font-bold uppercase">{user.name}</div>
            <p>NIP. {user.nip || "-"}</p>
          </div>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
