import React, { useState, useEffect } from "react";
import { User, School } from "../types";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Printer, Loader2, Download } from "lucide-react";
import { Link } from "react-router-dom";
import Bab1 from "../components/supervisi/Bab1";
import Bab2 from "../components/supervisi/Bab2";
import Bab3 from "../components/supervisi/Bab3";
import Bab4 from "../components/supervisi/Bab4";
import Lampiran2 from "../components/supervisi/Lampiran2";
import EmptyInstruments from "../components/supervisi/EmptyInstruments";

export default function ProgramSupervisi({ user }: { user: User }) {
  const [school, setSchool] = useState<School | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user.school_id) return;
        
        // Fetch school
        const schoolDoc = await getDoc(doc(db, "schools", user.school_id));
        if (schoolDoc.exists()) {
          setSchool({ id: schoolDoc.id, ...schoolDoc.data() } as School);
        }

        // Fetch teachers
        const q = query(
          collection(db, "users"),
          where("school_id", "==", user.school_id),
          where("role", "==", "GURU"),
          where("status", "==", "ACTIVE")
        );
        const querySnapshot = await getDocs(q);
        const teachersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch supervisions to get actual dates
        const supervisionsQ = query(
          collection(db, "supervisions"),
          where("school_id", "==", user.school_id)
        );
        const supervisionsSnapshot = await getDocs(supervisionsQ);
        const supervisionsData = supervisionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

        // Combine teacher data with their supervision dates
        const combinedTeachers = teachersData.map(teacher => {
          const supervision = supervisionsData.find(s => s.teacher_id === teacher.id);
          return {
            ...teacher,
            stage1_date: supervision?.stage1_date || null,
            stage2_date: supervision?.stage2_date || null,
            stage3_date: supervision?.stage3_date || null,
            stage4_date: supervision?.stage4_date || null,
            supervision_date: supervision?.stage3_date || supervision?.date || null,
            stage5_data: supervision?.stage5_data || null,
            stage7_data: supervision?.stage7_data || null
          };
        });

        setTeachers(combinedTeachers);
      } catch (err) {
        console.error("Error fetching data for program supervisi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.school_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (!school) {
    return <div>Data sekolah tidak ditemukan.</div>;
  }

  const academicYear = school?.academic_year || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
  const printDate = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const generateWord = () => {
    const element = document.getElementById("program-supervisi-content");
    if (!element) return;
    
    // Create a clone to manipulate
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Remove print:hidden elements from clone
    const hiddenElements = clone.querySelectorAll('.print\\:hidden');
    hiddenElements.forEach(el => el.parentNode?.removeChild(el));

    // Handle page breaks for Word
    const pageBreakElements = clone.querySelectorAll('.print\\:break-after-page');
    pageBreakElements.forEach(el => {
      el.classList.add('page-break');
    });
    
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Program Supervisi</title>
        <style>
          body { font-family: 'Times New Roman', serif; }
          h1, h2, h3, h4, h5, h6 { text-align: center; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid black; padding: 8px; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .mb-4 { margin-bottom: 16px; }
          .mt-8 { margin-top: 32px; }
          .page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        ${clone.innerHTML}
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Program_Supervisi.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-100 min-h-screen pb-12 print:bg-white print:pb-0">
      {/* Action Bar (Hidden when printing) */}
      <div className="print:hidden bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link to="/profil" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-zinc-600" />
          </Link>
          <h1 className="text-lg font-bold text-zinc-800">Program Supervisi</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-white border border-black/5 text-zinc-700 px-4 py-2 rounded-xl shadow-sm hover:bg-zinc-50 transition-all font-bold text-sm"
          >
            <Printer size={18} />
            <span>Simpan PDF / Print</span>
          </button>
          <button 
            onClick={generateWord}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition-all font-bold text-sm"
          >
            <Download size={18} />
            <span>Simpan Word</span>
          </button>
        </div>
      </div>

      {/* Document Container */}
      <div id="program-supervisi-content" className="max-w-[210mm] mx-auto mt-8 bg-white shadow-xl print:shadow-none print:mt-0 print:max-w-none">
        
        {/* COVER PAGE */}
        <div className="p-[20mm] min-h-[297mm] flex flex-col items-center justify-center print:p-0 print:break-after-page text-black font-serif text-center relative">
          <div className="absolute top-[20mm] left-[20mm] right-[20mm] bottom-[20mm] border-4 border-double border-black pointer-events-none"></div>
          
          <div className="space-y-8 z-10 w-full px-12">
            <h1 className="text-3xl font-bold uppercase leading-relaxed">
              PROGRAM SUPERVISI<br />
              KEPALA SEKOLAH
            </h1>
            
            <h2 className="text-2xl font-bold uppercase">
              TAHUN PELAJARAN {academicYear}
            </h2>

            <div className="flex justify-center items-center gap-8 py-12">
              {school.logo_gov && (
                <img src={school.logo_gov} alt="Logo Pemerintah" className="w-32 h-32 object-contain" referrerPolicy="no-referrer" />
              )}
              {school.logo_school && (
                <img src={school.logo_school} alt="Logo Sekolah" className="w-32 h-32 object-contain" referrerPolicy="no-referrer" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xl">Oleh:</p>
              <p className="text-2xl font-bold uppercase">{user.name}</p>
              <p className="text-xl">NIP. {user.nip || '-'}</p>
            </div>

            <div className="pt-24 space-y-2">
              <h3 className="text-2xl font-bold uppercase">{school.name}</h3>
              <p className="text-xl">{school.address}</p>
            </div>
          </div>
        </div>

        {/* PAGE 1: Lembar Pengesahan */}
        <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
          <h1 className="text-center font-bold text-xl mb-12">LEMBAR PENGESAHAN</h1>
          
          <table className="w-full mb-24 text-lg">
            <tbody>
              <tr>
                <td className="py-2 w-1/3">Nama Dokumen</td>
                <td className="py-2 w-4">:</td>
                <td className="py-2">Program Supervisi Kepala Sekolah</td>
              </tr>
              <tr>
                <td className="py-2">Tahun pelajaran</td>
                <td className="py-2">:</td>
                <td className="py-2">{academicYear}</td>
              </tr>
              <tr>
                <td className="py-2">Satuan pendidikan</td>
                <td className="py-2">:</td>
                <td className="py-2">{school.name}</td>
              </tr>
              <tr>
                <td className="py-2">Nama Kepala Sekolah</td>
                <td className="py-2">:</td>
                <td className="py-2">{user.name}</td>
              </tr>
              <tr>
                <td className="py-2">Alamat Sekolah</td>
                <td className="py-2">:</td>
                <td className="py-2">{school.address}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-16 text-lg">
            <div className="text-center">
              <p>Ditetapkan di : {school.address.split(',')[0] || 'Sekolah'}</p>
              <p>Pada Tanggal : {printDate}</p>
            </div>
          </div>

          <div className="flex justify-between mb-24 text-lg">
            <div className="text-center">
              <p>Mengetahui</p>
              <p>Ketua Komite Sekolah</p>
              <br /><br /><br /><br />
              <p className="font-bold underline">.........................................</p>
            </div>
            <div className="text-center">
              <p>Menetapkan</p>
              <p>Kepala Sekolah</p>
              <br /><br /><br /><br />
              <p className="font-bold underline">{user.name}</p>
              <p>NIP. {user.nip || '.........................'}</p>
            </div>
          </div>

          <div className="flex justify-center text-lg">
            <div className="text-center">
              <p>Mengesahkan</p>
              <p>Pengawas Binaan</p>
              <br /><br /><br /><br />
              <p className="font-bold underline">.........................................</p>
              <p>NIP. .........................</p>
            </div>
          </div>
          
          <div className="text-center mt-12">i</div>
        </div>

        {/* PAGE 2: Kata Pengantar */}
        <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
          <h1 className="text-center font-bold text-xl mb-8">KATA PENGANTAR</h1>
          
          <div className="space-y-4 text-justify leading-relaxed text-lg">
            <p>
              Alhamdulillah, puji syukur ke hadirat Allah Subhanahu Wa Ta'ala atas limpahan rahmat, taufik, hidayah, dan ridha-Nya sehingga penyusunan Program Supervisi {school.name} Tahun Pelajaran {academicYear} ini dapat diselesaikan. Shalawat dan salam semoga selalu tercurahkan kepada Nabi Muhammad SAW, keluarga, sahabat, dan semua umatnya, aamiin.
            </p>
            <p>
              Program Supervisi {school.name} Tahun Pelajaran {academicYear} ini merupakan garis besar program supervisi akademik dan manajerial Kepala Sekolah. Supervisi merupakan salah satu faktor penting dalam rangkaian upaya pencapaian visi, misi, dan tujuan sekolah. Mengingat arti penting kegiatan supervisi terhadap proses pendidikan, maka disusunlah program supervisi ini.
            </p>
            <p>
              Sebagai lembaga pendidikan, {school.name} memiliki visi dan misi yang jelas sehingga keduanya diharapkan dapat dicapai secara optimal. Pencapaian visi, misi, dan tujuan sekolah tidak begitu saja dapat diwujudkan tanpa adanya program sistematis dan lengkap yang meliputi perencanaan, proses serta evaluasi sehingga kegagalan pencapaian visi, misi, dan tujuan sekolah dapat diminimalisasikan.
            </p>
            <p>
              Program Supervisi ini tentu saja masih terlalu jauh dari sempurna mengingat keterbatasan berbagai aspek dari penyusun. Namun demikian harapan tetap mengedepan, kiranya program supervisi ini dapat membantu meski hanya sedikit upaya pencapaian visi, misi, dan tujuan {school.name} khususnya tahun pelajaran {academicYear}.
            </p>
            <p>
              Akhirnya, hanya do'a yang dapat dipanjatkan ke hadirat Allah, semoga seluruh kegiatan pendidikan di {school.name} diberikan kemudahan dan kesuksesan, aamiin.
            </p>
          </div>

          <div className="flex justify-end mt-16 text-lg">
            <div className="text-center">
              <p>{school.address.split(',')[0] || 'Sekolah'}, {printDate}</p>
              <br /><br /><br /><br />
              <p>Penyusun</p>
            </div>
          </div>
          
          <div className="text-center mt-12">ii</div>
        </div>

        {/* PAGE 3: Daftar Isi */}
        <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
          <h1 className="text-center font-bold text-xl mb-8">DAFTAR ISI</h1>
          
          <div className="space-y-4 text-lg">
            <div className="flex justify-between"><span>LEMBAR PENGESAHAN</span><span>i</span></div>
            <div className="flex justify-between"><span>KATA PENGANTAR</span><span>ii</span></div>
            <div className="flex justify-between"><span>DAFTAR ISI</span><span>iii</span></div>
            <div className="flex justify-between mt-4"><span>BAB I PENDAHULUAN</span><span>1</span></div>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between"><span>A. Latar Belakang</span><span>1</span></div>
              <div className="flex justify-between"><span>B. Definisi Supervisi</span><span>2</span></div>
              <div className="flex justify-between"><span>C. Dasar Hukum</span><span>2</span></div>
              <div className="flex justify-between"><span>D. Prinsip Supervisi</span><span>3</span></div>
              <div className="flex justify-between"><span>E. Jenis-Jenis Supervisi</span><span>4</span></div>
              <div className="flex justify-between"><span>F. Tujuan Supervisi</span><span>5</span></div>
              <div className="flex justify-between"><span>G. Ruang Lingkup Supervisi</span><span>6</span></div>
              <div className="flex justify-between"><span>H. Mekanisme Supervisi</span><span>6</span></div>
            </div>
            <div className="flex justify-between mt-4"><span>BAB II PELAKSANAAN SUPERVISI PEMBELAJARAN</span><span>8</span></div>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between"><span>A. Observasi Kelas</span><span>8</span></div>
              <div className="flex justify-between"><span>B. Saling Mengunjungi</span><span>9</span></div>
              <div className="flex justify-between"><span>C. Demonstrasi Belajar</span><span>9</span></div>
              <div className="flex justify-between"><span>D. Supervisi Klinis</span><span>10</span></div>
            </div>
            <div className="flex justify-between mt-4"><span>BAB III PERANGKAT DAN JADWAL SUPERVISI</span><span>11</span></div>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between"><span>A. Perangkat Supervisi</span><span>11</span></div>
              <div className="flex justify-between"><span>B. Mekanisme Supervisi</span><span>12</span></div>
              <div className="flex justify-between"><span>C. Jadwal Supervisi</span><span>13</span></div>
            </div>
            <div className="flex justify-between mt-4"><span>BAB IV PENUTUP</span><span>14</span></div>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between"><span>A. Kesimpulan</span><span>14</span></div>
              <div className="flex justify-between"><span>B. Saran</span><span>14</span></div>
            </div>
            <div className="flex justify-between mt-4 font-bold"><span>LAMPIRAN-LAMPIRAN</span><span></span></div>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between"><span>Lampiran 1. Rekapitulasi Rencana Tindak Lanjut</span><span>15</span></div>
              <div className="flex justify-between"><span>Lampiran 2. Instrumen Supervisi RPP</span><span>16</span></div>
              <div className="flex justify-between"><span>Lampiran 3. Instrumen Percakapan Pra Observasi</span><span>17</span></div>
              <div className="flex justify-between"><span>Lampiran 4. Instrumen Pelaksanaan Observasi</span><span>18</span></div>
              <div className="flex justify-between"><span>Lampiran 5. Instrumen Supervisi Pasca Observasi</span><span>20</span></div>
              <div className="flex justify-between"><span>Lampiran 6. Instrumen Monitoring Administrasi</span><span>22</span></div>
            </div>
          </div>
          <div className="text-center mt-12">iii</div>
        </div>

        <Bab1 />
        <Bab2 />
        <Bab3 />
        <Bab4 />

        <Lampiran2 user={user} school={school} printDate={printDate} academicYear={academicYear} teachers={teachers} />
        <EmptyInstruments />

      </div>
    </div>
  );
}
