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
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

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

  const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Error converting image to base64:", e);
      return imageUrl;
    }
  };

  const generateWord = async () => {
    setIsGeneratingWord(true);
    try {
      const element = document.getElementById("program-supervisi-content");
      if (!element) return;
      
      // Convert logos to base64 so MS Word renders them without failing
      let govLogoBase64 = "";
      let schoolLogoBase64 = "";
      if (school.logo_gov) {
        govLogoBase64 = await getBase64ImageFromUrl(school.logo_gov);
      }
      if (school.logo_school) {
        schoolLogoBase64 = await getBase64ImageFromUrl(school.logo_school);
      }

      const clone = element.cloneNode(true) as HTMLElement;
      
      const imgs = clone.querySelectorAll('img');
      imgs.forEach((img, idx) => {
        if (idx === 0 && govLogoBase64) img.src = govLogoBase64;
        if (idx === 1 && schoolLogoBase64) img.src = schoolLogoBase64;
        if (!img.src.startsWith('data:')) {
          if (school.logo_gov && img.alt.includes('Pemerintah')) img.src = govLogoBase64;
          if (school.logo_school && img.alt.includes('Sekolah')) img.src = schoolLogoBase64;
        }
      });
      
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
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: black; }
            h1, h2, h3, h4, h5, h6 { text-align: center; font-family: 'Times New Roman', serif; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-family: 'Times New Roman', serif; }
            th, td { border: 1px solid black; padding: 6px 8px; font-family: 'Times New Roman', serif; vertical-align: top; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .mb-4 { margin-bottom: 16px; }
            .mt-8 { margin-top: 32px; }
            .page-break { page-break-after: always; mso-break-type: section-break; }
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
      link.download = `Program_Supervisi_${school.name.replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error generating Word document:", e);
      alert("Gagal mengunduh dokumen Word. Silakan coba lagi.");
    } finally {
      setIsGeneratingWord(false);
    }
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
            <span>Simpan PDF / Print Langsung</span>
          </button>
          <button 
            onClick={generateWord}
            disabled={isGeneratingWord}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition-all font-bold text-sm disabled:opacity-50"
          >
            <Download size={18} className={isGeneratingWord ? 'animate-bounce' : ''} />
            <span>{isGeneratingWord ? 'Memproses Word...' : 'Simpan Word (.doc)'}</span>
          </button>
        </div>
      </div>

      {/* Document Container */}
      <div id="program-supervisi-content" className="max-w-[210mm] mx-auto mt-8 bg-white shadow-xl print:shadow-none print:mt-0 print:max-w-none">
        
        {/* COVER PAGE */}
        <div className="p-[20mm] min-h-[297mm] flex flex-col items-center justify-center print:p-0 print:break-after-page text-black font-serif text-center relative bg-white">
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
        <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif bg-white">
          <h1 className="text-center font-bold text-xl mb-12">LEMBAR PENGESAHAN</h1>
          
          <table className="w-full mb-24 text-lg border-none">
            <tbody>
              <tr>
                <td className="py-2 w-1/3 border-none">Nama Dokumen</td>
                <td className="py-2 w-4 border-none">:</td>
                <td className="py-2 border-none">Program Supervisi Kepala Sekolah</td>
              </tr>
              <tr>
                <td className="py-2 border-none">Tahun pelajaran</td>
                <td className="py-2 border-none">:</td>
                <td className="py-2 border-none">{academicYear}</td>
              </tr>
              <tr>
                <td className="py-2 border-none">Satuan pendidikan</td>
                <td className="py-2 border-none">:</td>
                <td className="py-2 border-none">{school.name}</td>
              </tr>
              <tr>
                <td className="py-2 border-none">Nama Kepala Sekolah</td>
                <td className="py-2 border-none">:</td>
                <td className="py-2 border-none">{user.name}</td>
              </tr>
              <tr>
                <td className="py-2 border-none">Alamat Sekolah</td>
                <td className="py-2 border-none">:</td>
                <td className="py-2 border-none">{school.address}</td>
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
        <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif bg-white">
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
        <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif bg-white">
          <h1 className="text-center font-bold text-xl mb-8">DAFTAR ISI</h1>
          
          <table className="w-full text-lg border-none">
            <tbody>
              <tr><td className="py-1 border-none font-bold">LEMBAR PENGESAHAN</td><td className="py-1 border-none text-right font-bold">i</td></tr>
              <tr><td className="py-1 border-none font-bold">KATA PENGANTAR</td><td className="py-1 border-none text-right font-bold">ii</td></tr>
              <tr><td className="py-1 border-none font-bold">DAFTAR ISI</td><td className="py-1 border-none text-right font-bold">iii</td></tr>
              <tr><td className="py-1 pt-3 border-none font-bold">BAB I PENDAHULUAN</td><td className="py-1 pt-3 border-none text-right font-bold">1</td></tr>
              <tr><td className="py-1 pl-6 border-none">A. Latar Belakang & Perubahan Paradigma</td><td className="py-1 border-none text-right">1</td></tr>
              <tr><td className="py-1 pl-6 border-none">B. Tujuan Utama Supervisi Akademik</td><td className="py-1 border-none text-right">2</td></tr>
              <tr><td className="py-1 pl-6 border-none">C. Prinsip Utama Pembelajaran Mendalam</td><td className="py-1 border-none text-right">2</td></tr>
              <tr><td className="py-1 pl-6 border-none">D. Tiga Tahap Pengalaman Belajar Peserta Didik</td><td className="py-1 border-none text-right">3</td></tr>
              <tr><td className="py-1 pl-6 border-none">E. Komponen Utama Instrumen & Fokus Pengamatan</td><td className="py-1 border-none text-right">4</td></tr>
              <tr><td className="py-1 pl-6 border-none">F. Karakteristik Indikator Penilaian</td><td className="py-1 border-none text-right">5</td></tr>
              <tr><td className="py-1 pl-6 border-none">G. Dasar Hukum</td><td className="py-1 border-none text-right">5</td></tr>
              <tr><td className="py-1 pt-3 border-none font-bold">BAB II PELAKSANAAN SUPERVISI PEMBELAJARAN</td><td className="py-1 pt-3 border-none text-right font-bold">8</td></tr>
              <tr><td className="py-1 pl-6 border-none">A. Observasi Kelas</td><td className="py-1 border-none text-right">8</td></tr>
              <tr><td className="py-1 pl-6 border-none">B. Saling Mengunjungi</td><td className="py-1 border-none text-right">9</td></tr>
              <tr><td className="py-1 pl-6 border-none">C. Demonstrasi Belajar</td><td className="py-1 border-none text-right">9</td></tr>
              <tr><td className="py-1 pl-6 border-none">D. Supervisi Klinis</td><td className="py-1 border-none text-right">10</td></tr>
              <tr><td className="py-1 pt-3 border-none font-bold">BAB III PERANGKAT DAN JADWAL SUPERVISI</td><td className="py-1 pt-3 border-none text-right font-bold">11</td></tr>
              <tr><td className="py-1 pl-6 border-none">A. Perangkat Supervisi</td><td className="py-1 border-none text-right">11</td></tr>
              <tr><td className="py-1 pl-6 border-none">B. Mekanisme Supervisi</td><td className="py-1 border-none text-right">12</td></tr>
              <tr><td className="py-1 pl-6 border-none">C. Jadwal Supervisi</td><td className="py-1 border-none text-right">13</td></tr>
              <tr><td className="py-1 pt-3 border-none font-bold">BAB IV PENUTUP</td><td className="py-1 pt-3 border-none text-right font-bold">14</td></tr>
              <tr><td className="py-1 pl-6 border-none">A. Kesimpulan</td><td className="py-1 border-none text-right">14</td></tr>
              <tr><td className="py-1 pl-6 border-none">B. Saran</td><td className="py-1 border-none text-right">14</td></tr>
              <tr><td className="py-1 pt-3 border-none font-bold">LAMPIRAN-LAMPIRAN</td><td className="py-1 pt-3 border-none text-right font-bold">15</td></tr>
              <tr><td className="py-1 pl-6 border-none">Lampiran 1. Rekapitulasi Rencana Tindak Lanjut</td><td className="py-1 border-none text-right">15</td></tr>
              <tr><td className="py-1 pl-6 border-none">Lampiran 2. Instrumen Supervisi RPP</td><td className="py-1 border-none text-right">16</td></tr>
              <tr><td className="py-1 pl-6 border-none">Lampiran 3. Instrumen Percakapan Pra Observasi</td><td className="py-1 border-none text-right">17</td></tr>
              <tr><td className="py-1 pl-6 border-none">Lampiran 4. Instrumen Pelaksanaan Observasi</td><td className="py-1 border-none text-right">18</td></tr>
              <tr><td className="py-1 pl-6 border-none">Lampiran 5. Instrumen Supervisi Pasca Observasi</td><td className="py-1 border-none text-right">20</td></tr>
              <tr><td className="py-1 pl-6 border-none">Lampiran 6. Instrumen Monitoring Administrasi</td><td className="py-1 border-none text-right">22</td></tr>
            </tbody>
          </table>
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
