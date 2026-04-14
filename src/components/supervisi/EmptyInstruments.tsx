import React from 'react';

export default function EmptyInstruments() {
  return (
    <>
      {/* Lampiran 2: INSTRUMEN SUPERVISI RPP */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">Lampiran 2</h1>
        <h2 className="text-center font-bold text-lg mb-8 uppercase">INSTRUMEN SUPERVISI RPP<br/>(PEMBELAJARAN MENDALAM)</h2>
        
        <div className="mb-6 space-y-1">
          <div className="flex"><span className="w-32">Nama Guru</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Mata Pelajaran</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Kelas/jam ke-</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Tanggal</span><span>: ...............................................................................</span></div>
        </div>

        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr>
              <th className="border border-black p-2 text-center w-8">No</th>
              <th className="border border-black p-2 text-center w-32">Komponen RPP</th>
              <th className="border border-black p-2 text-center">Indikator Supervisi (Pembelajaran Mendalam)</th>
              <th className="border border-black p-2 text-center w-12">Skor (1-4)</th>
              <th className="border border-black p-2 text-center w-40">Catatan/Temuan</th>
            </tr>
          </thead>
          <tbody>
            {[
              { comp: "Identitas RPP", ind: "RPP memuat identitas lengkap (mapel, kelas, materi, waktu)." },
              { comp: "Tujuan Pembelajaran", ind: "Tujuan dirumuskan sesuai CP/TP, menggunakan kata kerja operasional, berorientasi HOTS dan pembelajaran mendalam." },
              { comp: "Materi Pembelajaran", ind: "Materi relevan, kontekstual, mendorong pemahaman konsep, bukan hafalan semata." },
              { comp: "Model/Metode", ind: "Menggunakan pendekatan pembelajaran mendalam (misalnya: discovery learning, problem based learning, project based learning, inquiry)." },
              { comp: "Kegiatan Pendahuluan", ind: "Apersepsi menghubungkan pengetahuan lama dengan baru; memotivasi siswa; menjelaskan tujuan pembelajaran." },
              { comp: "Kegiatan Inti", ind: "a. Mengaktifkan siswa (kolaborasi, diskusi, eksperimen, eksplorasi).\nb. Mengintegrasikan keterampilan berpikir kritis, kreatif, komunikasi, kolaborasi.\nc. Memberikan kesempatan refleksi." },
              { comp: "Kegiatan Penutup", ind: "Melibatkan siswa dalam menyimpulkan, refleksi, tindak lanjut, serta penguatan nilai karakter." },
              { comp: "Media & Sumber Belajar", ind: "Variatif, relevan, kontekstual, mendukung eksplorasi konsep dan pengalaman belajar mendalam." },
              { comp: "Asesmen Pembelajaran", ind: "Berbasis autentik (produk, proyek, portofolio, unjuk kerja, refleksi), tidak sekadar tes tertulis." },
              { comp: "Diferensiasi Pembelajaran", ind: "Memberi ruang bagi perbedaan kemampuan, minat, dan gaya belajar siswa." }
            ].map((item, i) => (
              <tr key={i}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2">{item.comp}</td>
                <td className="border border-black p-2 whitespace-pre-line">{item.ind}</td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 border border-black p-2 min-h-[60px]">
          <p className="font-bold uppercase text-xs">REKOMENDASI</p>
        </div>

        <div className="mt-4 text-[10px]">
          <p>Skala Penilaian</p>
          <p>4 = Sangat Baik</p>
          <p>3 = Baik</p>
          <p>2 = Cukup</p>
          <p>1 = Perlu Bimbingan</p>
        </div>

        <div className="flex justify-between mt-12 text-sm">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Observer</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
          <div className="text-center">
            <p>...................., .................... 2025</p>
            <p>Guru yang Mengajar</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 3: INSTRUMEN PERCAKAPAN PRA OBSERVASI */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">Lampiran 3</h1>
        <h2 className="text-center font-bold text-lg mb-8 uppercase">INSTRUMEN PERCAKAPAN PRA OBSERVASI</h2>
        
        <div className="mb-6 space-y-1">
          <div className="flex"><span className="w-32">Nama Guru</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Mata Pelajaran</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Kelas/jam ke-</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Tanggal</span><span>: ...............................................................................</span></div>
        </div>

        <h3 className="font-bold mb-2">A. Panduan Pertanyaan Coaching</h3>
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-black p-2 text-center w-8">No</th>
              <th className="border border-black p-2 text-center">Pertanyaan Reflektif (Coaching)</th>
              <th className="border border-black p-2 text-center w-1/2">Catatan Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Apa tujuan utama pembelajaran yang ingin Anda capai pada pertemuan ini?",
              "Bagaimana Anda merancang agar siswa benar-benar memahami konsep secara mendalam, bukan hanya menghafal?",
              "Strategi atau model pembelajaran apa yang Anda pilih? Mengapa strategi itu relevan untuk pembelajaran mendalam?",
              "Bagaimana cara Anda mengaktifkan siswa agar berpikir kritis, kreatif, dan kolaboratif selama pembelajaran?",
              "Media atau sumber belajar apa yang akan digunakan, dan bagaimana mendukung pemahaman siswa?",
              "Bagaimana Anda menilai keberhasilan siswa dalam pembelajaran ini? Apakah asesmen Anda berbasis autentik?",
              "Dari pengalaman sebelumnya, bagian mana dari pembelajaran yang menurut Anda paling perlu mendapat perhatian saat diobservasi?",
              "Dukungan apa yang Anda harapkan dari saya sebagai supervisor agar kegiatan ini berjalan lancar?"
            ].map((q, i) => (
              <tr key={i}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2">{q}</td>
                <td className="border border-black p-2 min-h-[40px]"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8">
          <h3 className="font-bold mb-2">B. Kesepakatan Fokus Observasi</h3>
          <div className="border border-black p-4 min-h-[100px]"></div>
        </div>

        <div className="flex justify-between mt-12 text-sm">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Observer</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
          <div className="text-center">
            <p>...................., .................... 2025</p>
            <p>Guru yang Mengajar</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 4: INSTRUMEN PELAKSANAAN OBSERVASI */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">Lampiran 4</h1>
        <h2 className="text-center font-bold text-lg mb-8 uppercase">INSTRUMEN PELAKSANAAN OBSERVASI<br/>(PENDEKATAN PEMBELAJARAN MENDALAM)</h2>
        
        <div className="mb-6 space-y-1">
          <div className="flex"><span className="w-32">Nama Guru</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Mata Pelajaran</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Materi Pokok</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Kelas/jam ke-</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Tanggal</span><span>: ...............................................................................</span></div>
        </div>

        <h3 className="font-bold mb-2 uppercase">A. Tujuan Observasi</h3>
        <ol className="list-decimal list-outside ml-6 mb-6 text-xs">
          <li>Menilai keterlaksanaan pembelajaran yang mendorong pemahaman mendalam.</li>
          <li>Mengamati penerapan pembelajaran lintas disiplin ilmu untuk memperkuat konteks dan relevansi.</li>
          <li>Memberikan umpan balik konstruktif agar guru dapat meningkatkan mutu pembelajaran.</li>
        </ol>

        <h3 className="font-bold mb-2 uppercase">B. Aspek dan Indikator Observasi</h3>
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-black p-2 text-center w-8">No</th>
              <th className="border border-black p-2 text-center w-32">Aspek Supervisi</th>
              <th className="border border-black p-2 text-center">Indikator Pembelajaran Mendalam Lintas Disiplin</th>
              <th className="border border-black p-2 text-center w-12">Skor (1-4)</th>
              <th className="border border-black p-2 text-center w-40">Catatan Observer</th>
            </tr>
          </thead>
          <tbody>
            {[
              { aspect: "Perencanaan", ind: "RPP/lks jelas, memuat tujuan pembelajaran mendalam, integrasi lintas disiplin (misal: Matematika–IPA–IPS–Bahasa)" },
              { aspect: "Pembukaan", ind: "Guru mengaitkan topik dengan kehidupan nyata dan memancing rasa ingin tahu siswa melalui pertanyaan pemantik interdisipliner" },
              { aspect: "Aktivasi Pengetahuan", ind: "Guru membantu siswa menghubungkan pengetahuan awal dengan konsep baru dari berbagai disiplin ilmu" },
              { aspect: "Eksplorasi", ind: "Siswa diberi kesempatan melakukan eksplorasi, diskusi, eksperimen, atau proyek yang melibatkan lebih dari satu bidang ilmu" },
              { aspect: "Kolaborasi", ind: "Siswa bekerja dalam kelompok, berbagi ide, dan memecahkan masalah dengan perspektif interdisipliner" },
              { aspect: "Pemahaman Mendalam", ind: "Guru menuntun siswa untuk menemukan konsep esensial, membuat koneksi lintas mata pelajaran, dan menerapkan dalam konteks nyata" },
              { aspect: "Keterampilan Abad 21", ind: "Aktivitas siswa melatih berpikir kritis, kreativitas, komunikasi, kolaborasi (4C), serta literasi digital bila memungkinkan" },
              { aspect: "Penilaian (Asesmen)", ind: "Guru menggunakan asesmen autentik (portofolio, produk, proyek, refleksi) untuk mengukur pemahaman mendalam dan keterkaitan lintas ilmu" },
              { aspect: "Penutup", ind: "Guru bersama siswa melakukan refleksi pembelajaran, menarik kesimpulan lintas disiplin, dan memberi tindak lanjut" },
              { aspect: "Iklim Kelas", ind: "Lingkungan belajar aman, inklusif, partisipatif, dan mendukung kebebasan berpikir siswa" }
            ].map((item, i) => (
              <tr key={i}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2">{item.aspect}</td>
                <td className="border border-black p-2">{item.ind}</td>
                <td className="border border-black p-2"></td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-4">
          <div className="border border-black p-2 min-h-[60px]">
            <p className="font-bold uppercase text-xs">C. Catatan Observer</p>
          </div>
          <div className="border border-black p-2 min-h-[60px]">
            <p className="font-bold uppercase text-xs">D. Rekomendasi</p>
          </div>
        </div>

        <div className="mt-4 text-[10px]">
          <p>Skala Penilaian</p>
          <p>4 = Sangat Baik</p>
          <p>3 = Baik</p>
          <p>2 = Cukup</p>
          <p>1 = Perlu Bimbingan</p>
        </div>

        <div className="flex justify-between mt-12 text-sm">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Observer</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
          <div className="text-center">
            <p>...................., .................... 2025</p>
            <p>Guru yang Mengajar</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 5: INSTRUMEN SUPERVISI PASCA OBSERVASI */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">Lampiran 5</h1>
        <h2 className="text-center font-bold text-lg mb-8 uppercase">INSTRUMEN SUPERVISI PASCA OBSERVASI</h2>
        
        <div className="mb-6 space-y-1">
          <div className="flex"><span className="w-32">Nama Guru</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Mata Pelajaran</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Materi Pokok</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Kelas/jam ke-</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Tanggal</span><span>: ...............................................................................</span></div>
        </div>

        <h3 className="font-bold mb-2 uppercase">A. Tujuan Observasi</h3>
        <ol className="list-decimal list-outside ml-6 mb-6 text-xs">
          <li>Memberikan ruang refleksi bagi guru untuk menganalisis praktik pembelajaran yang telah dilakukan.</li>
          <li>Membantu guru menemukan kekuatan serta area pengembangan dalam pembelajaran.</li>
          <li>Menyusun strategi tindak lanjut untuk meningkatkan kualitas pembelajaran, khususnya dalam mendukung Pembelajaran Mendalam dan lintas disiplin ilmu.</li>
        </ol>

        <h3 className="font-bold mb-2 uppercase">B. Panduan Percakapan</h3>
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-black p-2 text-center w-8">No</th>
              <th className="border border-black p-2 text-center">Pertanyaan Reflektif (Coaching)</th>
              <th className="border border-black p-2 text-center w-1/2">Catatan Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Bagaimana perasaan Bapak/Ibu setelah melaksanakan pembelajaran tadi?",
              "Apa harapan utama Bapak/Ibu dari percakapan kita hari ini?",
              "Menurut Bapak/Ibu, bagian mana dari pembelajaran tadi yang berjalan paling baik?",
              "Apa yang membuat bagian itu berhasil?",
              "Apakah ada momen ketika siswa terlihat benar-benar terlibat secara mendalam?",
              "Bagian mana dari pembelajaran yang menurut Bapak/Ibu kurang sesuai harapan?",
              "Faktor apa saja yang mempengaruhi hal tersebut?",
              "Bagaimana penerapan pendekatan lintas disiplin dapat lebih diperkuat di kelas Bapak/Ibu?",
              "Jika ada kesempatan mengajar ulang, apa yang akan Bapak/Ibu lakukan secara berbeda?",
              "Strategi atau metode apa yang ingin Bapak/Ibu coba untuk meningkatkan pemahaman mendalam siswa?",
              "Bagaimana asesmen autentik bisa lebih membantu Bapak/Ibu melihat perkembangan siswa?",
              "Langkah konkret apa yang akan Bapak/Ibu lakukan dalam pembelajaran berikutnya?",
              "Sumber daya atau dukungan apa yang Bapak/Ibu butuhkan untuk mencapainya?",
              "Bagaimana saya (sebagai observer/coach) bisa membantu Bapak/Ibu mewujudkan rencana tersebut?"
            ].map((q, i) => (
              <tr key={i}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2">{q}</td>
                <td className="border border-black p-2 min-h-[40px]"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-4">
          <div className="border border-black p-2 min-h-[60px]">
            <p className="font-bold uppercase text-xs">C. Catatan Observer</p>
          </div>
          <div className="border border-black p-2 min-h-[60px]">
            <p className="font-bold uppercase text-xs">D. Kesepakatan Tindak Lanjut</p>
          </div>
        </div>

        <div className="flex justify-between mt-12 text-sm">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Observer</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
          <div className="text-center">
            <p>...................., .................... 2025</p>
            <p>Guru yang Mengajar</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 6: INSTRUMEN MONITORING ADMINISTRASI PEMBELAJARAN */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">Lampiran 6</h1>
        <h2 className="text-center font-bold text-lg mb-8 uppercase">INSTRUMEN MONITORING ADMINISTRASI PEMBELAJARAN</h2>
        
        <div className="mb-6 space-y-1">
          <div className="flex"><span className="w-32">Nama Guru</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Mata Pelajaran</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Materi Pokok</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Kelas/jam ke-</span><span>: ...............................................................................</span></div>
          <div className="flex"><span className="w-32">Tanggal</span><span>: ...............................................................................</span></div>
        </div>

        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr>
              <th className="border border-black p-2 text-center w-8">No</th>
              <th className="border border-black p-2 text-center w-32">Dokumen Administrasi</th>
              <th className="border border-black p-2 text-center">Indikator Kualitas</th>
              <th className="border border-black p-2 text-center w-20">Keterangan (Ada/Tidak)</th>
              <th className="border border-black p-2 text-center w-40">Catatan/Temuan</th>
            </tr>
          </thead>
          <tbody>
            {[
              { doc: "Program Tahunan (Prota)", ind: "Memuat distribusi kompetensi, relevan dengan kurikulum, realistis" },
              { doc: "Program Semester (Promes)", ind: "Rinci, selaras dengan Prota, memuat alokasi waktu yang proporsional" },
              { doc: "Kurikulum Operasional Sekolah (KOS)", ind: "Digunakan sebagai acuan perencanaan; disesuaikan dengan karakteristik sekolah & siswa" },
              { doc: "Rencana Pelaksanaan Pembelajaran (RPP/Modul Ajar)", ind: "Tujuan selaras dengan CP & ATP" },
              { doc: "Pendekatan Pembelajaran", ind: "Mengintegrasikan pendekatan pembelajaran mendalam (inquiry, kolaborasi, refleksi)" },
              { doc: "Desain Pembelajaran", ind: "Memuat kegiatan lintas disiplin (jika relevan)" },
              { doc: "Asesmen", ind: "Menyediakan asesmen autentik" },
              { doc: "Buku Nilai / Instrumen Penilaian", ind: "Penilaian autentik, mencakup sikap, pengetahuan, keterampilan, serta refleksi belajar" },
              { doc: "Jurnal Mengajar", ind: "Tersusun rapi, mencatat pelaksanaan pembelajaran, kendala, tindak lanjut" },
              { doc: "Bahan Ajar/Media", ind: "Kreatif, inovatif, kontekstual, dan mendukung keterlibatan aktif siswa" },
              { doc: "Dokumentasi Hasil Belajar Siswa", ind: "Portofolio, projek, refleksi siswa sebagai bukti deep learning" }
            ].map((item, i) => (
              <tr key={i}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2">{item.doc}</td>
                <td className="border border-black p-2">{item.ind}</td>
                <td className="border border-black p-2 text-center">☐ Ada<br/>☐ Tidak</td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-[10px]">
          <p className="font-bold">Skala Penilaian</p>
          <p>Sangat Baik : Administrasi lengkap, mutakhir, dan sepenuhnya mendukung pembelajaran mendalam</p>
          <p>Baik : Administrasi lengkap, ada sedikit perbaikan yang perlu dilakukan</p>
          <p>Cukup : Administrasi belum lengkap, kualitas masih rendah, perlu pembinaan</p>
          <p>Kurang : Administrasi tidak tersedia atau sangat tidak sesuai</p>
        </div>

        <div className="flex justify-between mt-12 text-sm">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Kepala Sekolah</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
          <div className="text-center">
            <p>...................., .................... 2025</p>
            <p>Guru Kelas</p>
            <br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>
    </>
  );
}
