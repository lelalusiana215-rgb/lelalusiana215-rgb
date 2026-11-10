import React, { useState } from "react";
import { User, School } from "../types";
import { FileText, Download, Printer, CheckCircle, Shield, Award, Sparkles } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { STAGE1_INSTRUMENTS, STAGE2_INSTRUMENTS, STAGE3_INSTRUMENTS, STAGE4_INSTRUMENTS, STAGE5_INSTRUMENTS, PRE_OBSERVATION_INSTRUMENTS, POST_OBSERVATION_INSTRUMENTS } from "../constants";

export default function TemplateInstrumen({ user }: { user: User }) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadTemplatePDF = (type: number | 'all') => {
    setDownloading(type.toString());
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      const drawHeader = (title: string, subtitle: string) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PEMERINTAH KABUPATEN / KOTA", pageWidth / 2, 15, { align: "center" });
        doc.text("DINAS PENDIDIKAN DAN KEBUDAYAAN", pageWidth / 2, 21, { align: "center" });
        doc.setFontSize(14);
        doc.text("LEMBAR INSTRUMEN SUPERVISI AKADEMIK", pageWidth / 2, 29, { align: "center" });
        
        doc.setLineWidth(0.5);
        doc.line(20, 34, pageWidth - 20, 34);
        doc.setLineWidth(0.2);
        doc.line(20, 35, pageWidth - 20, 35);

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), pageWidth / 2, 44, { align: "center" });
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(subtitle, pageWidth / 2, 50, { align: "center" });

        // Metadata Form Fields
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Nama Guru", 20, 60);
        doc.text(": ....................................................................", 55, 60);
        doc.text("NIP", 20, 66);
        doc.text(": ....................................................................", 55, 66);

        doc.text("Nama Supervisor", 110, 60);
        doc.text(": ....................................................................", 140, 60);
        doc.text("Hari / Tanggal", 110, 66);
        doc.text(": ....................................................................", 140, 66);
      };

      const drawSignatures = (finalY: number) => {
        let sigY = finalY + 15;
        if (sigY > 240) {
          doc.addPage();
          sigY = 30;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        doc.text("Guru yang Disupervisi,", 35, sigY);
        doc.text("( .................................................... )", 25, sigY + 25);
        doc.text("NIP. ............................................", 28, sigY + 31);

        doc.text("Supervisor / Kepala Sekolah,", pageWidth - 75, sigY);
        doc.text("( .................................................... )", pageWidth - 85, sigY + 25);
        doc.text("NIP. ............................................", pageWidth - 82, sigY + 31);
      };

      if (type === 'all' || type === 1) {
        drawHeader("Tahap 1: Telaah Kelengkapan Perangkat Pembelajaran", "Instrumen Telaah Administrasi & Perangkat Pembelajaran Kurikulum Merdeka");
        
        const tableBody = STAGE1_INSTRUMENTS.map((inst, idx) => [
          idx + 1,
          inst.text,
          "[   ] Lengkap (4)\n[   ] Sebagian Besar (3)\n[   ] Sebagian Kecil (2)\n[   ] Tidak Ada (0)",
          "........................................"
        ]);

        autoTable(doc, {
          startY: 75,
          head: [['No', 'Komponen Perangkat Pembelajaran', 'Pilihan Ketersediaan', 'Catatan / Tindak Lanjut']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [40, 40, 40], halign: 'center' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 85 },
            2: { cellWidth: 55 },
            3: { cellWidth: 40 }
          }
        });

        const lastTable = (doc as any).lastAutoTable;
        drawSignatures(lastTable ? lastTable.finalY : 150);
      }

      if (type === 'all') {
        doc.addPage();
      }

      if (type === 'all' || type === 2) {
        drawHeader("Tahap 2: Penilaian Hasil Belajar Peserta Didik", "Instrumen Telaah Hasil Belajar dan Asesmen Siswa");

        const tableBody = STAGE2_INSTRUMENTS.map((inst, idx) => [
          idx + 1,
          inst.text,
          "[   ] 4 - Lengkap\n[   ] 3 - Sebagian Besar\n[   ] 2 - Sebagian Kecil\n[   ] 1 - Belum Lengkap\n[   ] 0 - Tidak Ada",
          "........................................"
        ]);

        autoTable(doc, {
          startY: 75,
          head: [['No', 'Aspek Penilaian Hasil Belajar', 'Skala Penilaian (0-4)', 'Catatan']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [40, 40, 40], halign: 'center' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 85 },
            2: { cellWidth: 55 },
            3: { cellWidth: 40 }
          }
        });

        const lastTable = (doc as any).lastAutoTable;
        drawSignatures(lastTable ? lastTable.finalY : 150);
      }

      if (type === 'all') {
        doc.addPage();
      }

      if (type === 'all' || type === 3) {
        drawHeader("Tahap 3: Telaah Modul Ajar (Pembelajaran Mendalam)", "Instrumen Analisis Perencanaan & Desain Modul Ajar");

        const tableBody = STAGE3_INSTRUMENTS.map((inst, idx) => [
          idx + 1,
          inst.text,
          "[  ] 4  [  ] 3\n[  ] 2  [  ] 1  [  ] 0",
          "........................................"
        ]);

        autoTable(doc, {
          startY: 75,
          head: [['No', 'Komponen Modul Ajar', 'Skala (0-4)', 'Catatan Kritis']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [40, 40, 40], halign: 'center' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 95 },
            2: { cellWidth: 35, halign: 'center' },
            3: { cellWidth: 50 }
          }
        });

        const lastTable = (doc as any).lastAutoTable;
        drawSignatures(lastTable ? lastTable.finalY : 150);
      }

      if (type === 'all') {
        doc.addPage();
      }

      if (type === 'all' || type === 4) {
        drawHeader("Tahap 4: Instrumen Percakapan Pra-Observasi", "Panduan Diskusi & Persiapan Sebelum Observasi Kelas");

        const tableBody = PRE_OBSERVATION_INSTRUMENTS.map((inst, idx) => [
          idx + 1,
          inst.text,
          "Catatan / Respon Guru:\n\n..........................................................................................................."
        ]);

        autoTable(doc, {
          startY: 75,
          head: [['No', 'Pertanyaan Panduan Pra-Observasi', 'Catatan Wawancara']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [40, 40, 40], halign: 'center' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 80 },
            2: { cellWidth: 100 }
          }
        });

        const lastTable = (doc as any).lastAutoTable;
        drawSignatures(lastTable ? lastTable.finalY : 150);
      }

      if (type === 'all') {
        doc.addPage();
      }

      if (type === 'all' || type === 5) {
        drawHeader("Tahap 5: Observasi Pelaksanaan Pembelajaran", "Instrumen Pengamatan Langsung Kinerja Guru di Kelas");

        const tableBody = STAGE4_INSTRUMENTS.map((inst, idx) => [
          idx + 1,
          `[${inst.category}]\n${inst.text}`,
          "[ ] 4  [ ] 3  [ ] 2  [ ] 1",
          "............................"
        ]);

        autoTable(doc, {
          startY: 75,
          head: [['No', 'Aspek & Indikator Pengamatan', 'Skor (1-4)', 'Catatan / Bukti']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [40, 40, 40], halign: 'center' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 105 },
            2: { cellWidth: 35, halign: 'center' },
            3: { cellWidth: 40 }
          }
        });

        const lastTable = (doc as any).lastAutoTable;
        drawSignatures(lastTable ? lastTable.finalY : 150);
      }

      if (type === 'all') {
        doc.addPage();
      }

      if (type === 'all' || type === 6) {
        drawHeader("Tahap 6: Percakapan Pasca-Observasi", "Panduan Refleksi & Coaching Setelah Observasi");

        const tableBody = POST_OBSERVATION_INSTRUMENTS.map((inst, idx) => [
          idx + 1,
          inst.text,
          "Catatan / Umpan Balik:\n\n..........................................................................................................."
        ]);

        autoTable(doc, {
          startY: 75,
          head: [['No', 'Pertanyaan Refleksi Pasca-Observasi', 'Catatan Diskusi']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [40, 40, 40], halign: 'center' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 80 },
            2: { cellWidth: 100 }
          }
        });

        const lastTable = (doc as any).lastAutoTable;
        drawSignatures(lastTable ? lastTable.finalY : 150);
      }

      if (type === 'all') {
        doc.addPage();
      }

      if (type === 'all' || type === 7) {
        drawHeader("Tahap 7: Refleksi & Rencana Tindak Lanjut (RTL)", "Instrumen Evaluasi Akhir & Perumusan Tindak Lanjut");

        const tableBody = STAGE5_INSTRUMENTS.map((inst, idx) => [
          idx + 1,
          inst.text,
          "[  ] 4 - Sangat Sesuai\n[  ] 3 - Sesuai\n[  ] 2 - Cukup Sesuai\n[  ] 1 - Kurang Sesuai",
          "........................................"
        ]);

        autoTable(doc, {
          startY: 75,
          head: [['No', 'Komponen Refleksi & RTL', 'Skala Penilaian (1-4)', 'Catatan / Tindak Lanjut']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [40, 40, 40], halign: 'center' },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 85 },
            2: { cellWidth: 55 },
            3: { cellWidth: 40 }
          }
        });

        const lastTable = (doc as any).lastAutoTable;
        drawSignatures(lastTable ? lastTable.finalY : 150);
      }

      const fileName = type === 'all' ? 'Bundel_Lengkap_Template_Instrumen_Supervisi.pdf' : `Template_Instrumen_Tahap_${type}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error("Error generating template PDF:", e);
      alert("Gagal menghasilkan PDF template. Silakan coba lagi.");
    } finally {
      setDownloading(null);
    }
  };

  const stages = [
    { id: 1, title: "Tahap 1: Telaah Administrasi & Perangkat Pembelajaran", desc: "Instrumen untuk memeriksa kelengkapan administrasi dan perangkat ajar guru.", count: STAGE1_INSTRUMENTS.length },
    { id: 2, title: "Tahap 2: Penilaian Hasil Belajar Peserta Didik", desc: "Instrumen penilaian dan telaah asesmen hasil belajar siswa.", count: STAGE2_INSTRUMENTS.length },
    { id: 3, title: "Tahap 3: Telaah Modul Ajar (Pembelajaran Mendalam)", desc: "Instrumen analisis kualitas rancangan modul ajar berbasis pembelajaran mendalam.", count: STAGE3_INSTRUMENTS.length },
    { id: 4, title: "Tahap 4: Percakapan Pra-Observasi", desc: "Panduan wawancara dan persiapan sebelum melaksanakan observasi kelas.", count: PRE_OBSERVATION_INSTRUMENTS.length },
    { id: 5, title: "Tahap 5: Observasi Pelaksanaan Pembelajaran", desc: "Instrumen pengamatan langsung kegiatan belajar mengajar di kelas.", count: STAGE4_INSTRUMENTS.length },
    { id: 6, title: "Tahap 6: Percakapan Pasca-Observasi", desc: "Panduan refleksi, coaching, dan diskusi pasca observasi kelas.", count: POST_OBSERVATION_INSTRUMENTS.length },
    { id: 7, title: "Tahap 7: Refleksi & Rencana Tindak Lanjut (RTL)", desc: "Instrumen evaluasi akhir dan perumusan rencana pengembangan profesional.", count: STAGE5_INSTRUMENTS.length },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#141414] to-zinc-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
            <Sparkles size={14} />
            <span>Format Resmi Kurikulum Merdeka</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
            Unduh Template Instrumen Supervisi
          </h2>
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed mb-8">
            Dapatkan file PDF kosong yang presisi dan siap cetak untuk setiap tahap supervisi akademik. Anda dapat mengunduh per tahap secara mandiri atau langsung mengambil satu bundel lengkap mencakup seluruh 7 instrumen.
          </p>
          <button
            onClick={() => downloadTemplatePDF('all')}
            disabled={downloading !== null}
            className="flex items-center space-x-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Download size={18} className={downloading === 'all' ? 'animate-bounce' : ''} />
            <span>{downloading === 'all' ? 'Menyiapkan Bundel...' : 'Unduh Bundel Lengkap (Semua Tahap)'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-sm border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  0{stage.id}
                </span>
                <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
                  {stage.count} Butir Indikator
                </span>
              </div>
              <h3 className="text-lg font-black text-zinc-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {stage.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                {stage.desc}
              </p>
            </div>
            
            <button
              onClick={() => downloadTemplatePDF(stage.id)}
              disabled={downloading !== null}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-zinc-50 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-600 font-bold text-xs rounded-2xl border border-zinc-200/80 hover:border-emerald-200 transition-all disabled:opacity-50"
            >
              <Download size={15} />
              <span>{downloading === stage.id.toString() ? 'Mengunduh...' : 'Unduh PDF Presisi'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
