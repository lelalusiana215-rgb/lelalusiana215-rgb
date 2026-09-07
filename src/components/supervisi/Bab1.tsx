import React from 'react';

export default function Bab1() {
  return (
    <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif text-justify">
      <h1 className="text-center font-bold text-xl mb-8 uppercase">BAB I<br/>PENDAHULUAN</h1>
      
      <div className="space-y-6 text-lg leading-relaxed">
        {/* A. Latar Belakang & Perubahan Paradigma */}
        <div>
          <h2 className="font-bold mb-2">A. Latar Belakang & Perubahan Paradigma</h2>
          <p className="mb-4 indent-8">
            Implementasi Kurikulum Merdeka menuntut perubahan pada praktik pembelajaran. Pembelajaran tidak lagi sebatas penyampaian materi untuk mengejar target kurikulum, melainkan harus memberikan pengalaman belajar yang memungkinkan siswa memahami konsep secara mendalam, menghubungkan materi dengan kehidupan nyata, serta membentuk karakter dan kemampuan berpikir kritis.
          </p>
          <p className="indent-8">
            Oleh karena itu, instrumen dan pelaksanaan supervisi akademik perlu disesuaikan. Supervisi tidak boleh lagi berfokus semata-mata pada kelengkapan administratif atau formalitas dokumen. Supervisi akademik dengan pendekatan Pembelajaran Mendalam (Deep Learning) dirancang untuk memastikan pendampingan profesional yang bermakna bagi guru dan berdampak nyata bagi perkembangan peserta didik.
          </p>
        </div>

        {/* B. Tujuan Utama Supervisi Akademik */}
        <div>
          <h2 className="font-bold mb-2">B. Tujuan Utama Supervisi Akademik</h2>
          <p className="mb-4 indent-8">
            Supervisi akademik dikembangkan bukan sebagai alat penilaian kaku atau pencarian kesalahan guru. Perannya bertransformasi menjadi:
          </p>
          <ul className="list-disc list-outside ml-8 space-y-2 mb-4">
            <li>
              <strong>Pendampingan berkelanjutan bagi guru:</strong> Membantu guru secara persuasif dan konsisten dalam memecahkan kendala pembelajaran di kelas.
            </li>
            <li>
              <strong>Sarana refleksi atas praktik pengajaran yang telah dilakukan:</strong> Memfasilitasi ruang dialog untuk mengevaluasi dampak pengajaran terhadap kualitas belajar siswa.
            </li>
            <li>
              <strong>Peningkatan kompetensi profesional guru secara kolaboratif:</strong> Membangun ekosistem belajar bersama di satuan pendidikan guna menumbuhkan budaya kerja sama yang positif.
            </li>
          </ul>
        </div>

        {/* C. Prinsip Utama Pembelajaran Mendalam */}
        <div>
          <h2 className="font-bold mb-2">C. Prinsip Utama Pembelajaran Mendalam</h2>
          <p className="mb-4 indent-8">
            Dalam supervisi ini, proses pembelajaran diamati berdasarkan keberadaan tiga prinsip utama Pembelajaran Mendalam (Deep Learning), yaitu:
          </p>
          <ul className="list-disc list-outside ml-8 space-y-3 mb-4">
            <li>
              <strong>Berkesadaran (mindful):</strong> Mendorong kesadaran penuh dalam proses belajar, menumbuhkan atensi aktif, fokus tinggi, serta empati dalam kelas.
            </li>
            <li>
              <strong>Bermakna (meaningful):</strong> Mengaitkan materi pembelajaran dengan konteks, tantangan sesungguhnya, dan pengalaman kehidupan nyata peserta didik.
            </li>
            <li>
              <strong>Menggembirakan (joyful):</strong> Menciptakan suasana belajar yang positif, interaktif, inklusif, dan menyenangkan bagi seluruh siswa.
            </li>
          </ul>
        </div>

        {/* D. Tiga Tahap Pengalaman Belajar Peserta Didik */}
        <div>
          <h2 className="font-bold mb-2">D. Tiga Tahap Pengalaman Belajar Peserta Didik</h2>
          <p className="mb-4 indent-8">
            Supervisi ini melihat sejauh mana guru memfasilitasi siswa untuk melalui tiga tingkatan pengalaman belajar yang berjenjang:
          </p>
          <ol className="list-decimal list-outside ml-8 space-y-3 mb-4">
            <li>
              <strong>Memahami:</strong> Menguasai konsep dasar secara utuh, bukan sekadar menghafal fakta atau definisi secara instan.
            </li>
            <li>
              <strong>Mengaplikasi:</strong> Menerapkan pengetahuan dan pemahaman konsep ke dalam situasi baru atau pemecahan masalah nyata sehari-hari.
            </li>
            <li>
              <strong>Merefleksi:</strong> Memikirkan kembali apa yang telah dipelajari, bagaimana mereka mempelajarinya, serta bagaimana proses belajar tersebut berdampak positif pada diri mereka sendiri maupun lingkungan.
            </li>
          </ol>
        </div>

        {/* E. Komponen Utama Instrumen Supervisi */}
        <div>
          <h2 className="font-bold mb-3">E. Komponen Utama Instrumen Supervisi & Fokus Pengamatan</h2>
          <p className="mb-4 indent-8">
            Dalam melakukan pengamatan secara terukur, instrumen supervisi difokuskan pada 6 (enam) komponen utama sebagai berikut:
          </p>
          <table className="w-full border-collapse border border-black text-[13px] mb-4">
            <thead>
              <tr className="bg-zinc-100 font-bold">
                <th className="border border-black p-2.5 text-center w-2/5">Komponen Supervisi</th>
                <th className="border border-black p-2.5 text-left">Fokus Pengamatan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2.5 font-bold">Perencanaan Pembelajaran</td>
                <td className="border border-black p-2.5 text-left">Kesesuaian tujuan, materi/esensi, strategi, dan asesmen dengan kebutuhan serta karakteristik peserta didik.</td>
              </tr>
              <tr>
                <td className="border border-black p-2.5 font-bold">Pelaksanaan Pembelajaran</td>
                <td className="border border-black p-2.5 text-left">Penciptaan lingkungan belajar yang aman dan kondusif, penggunaan pertanyaan pemantik, dorongan kolaborasi, serta keterhubungan dengan dunia nyata.</td>
              </tr>
              <tr>
                <td className="border border-black p-2.5 font-bold">Penerapan Prinsip Pembelajaran Mendalam</td>
                <td className="border border-black p-2.5 text-left">Keterlaksanaan prinsip <em>mindful</em>, <em>meaningful</em>, dan <em>joyful</em> selama pembelajaran berlangsung.</td>
              </tr>
              <tr>
                <td className="border border-black p-2.5 font-bold">Pengalaman Belajar Siswa</td>
                <td className="border border-black p-2.5 text-left">Kesempatan bagi peserta didik untuk melalui proses memahami, mengaplikasi, dan merefleksi.</td>
              </tr>
              <tr>
                <td className="border border-black p-2.5 font-bold">Asesmen Pembelajaran</td>
                <td className="border border-black p-2.5 text-left">Pemanfaatan hasil asesmen untuk memantau perkembangan siswa, memberikan <em>feedback</em> konstruktif, dan menentukan langkah tindak lanjut.</td>
              </tr>
              <tr>
                <td className="border border-black p-2.5 font-bold">Refleksi & Tindak Lanjut</td>
                <td className="border border-black p-2.5 text-left">Dialog reflektif pasca-observasi antara supervisor (kepala sekolah) dan guru untuk mengidentifikasi praktik baik serta area yang perlu ditingkatkan.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* F. Karakteristik Indikator Penilaian */}
        <div>
          <h2 className="font-bold mb-2">F. Karakteristik Indikator Penilaian</h2>
          <p className="mb-4 indent-8">
            Indikator dalam instrumen supervisi ini dirumuskan dalam bentuk <strong>perilaku atau praktik konkret yang dapat diamati dan dibuktikan secara langsung</strong> di kelas (seperti partisipasi aktif siswa, kemampuan bertanya kritis, pemanfaatan teknologi secara relevan, dan pemberian umpan balik). Hal ini sangat penting agar hasil supervisi bersifat objektif, transparan, serta tidak bergantung pada persepsi subjektif supervisor.
          </p>
        </div>

        {/* G. Dasar Hukum */}
        <div>
          <h2 className="font-bold mb-2">G. Dasar Hukum</h2>
          <p className="mb-3 indent-8">
            Setiap kegiatan supervisi harus dilandasi oleh aturan perundang-undangan yang berlaku agar memiliki kejelasan arah, wewenang, serta tanggung jawab:
          </p>
          <ol className="list-decimal list-outside ml-8 space-y-1">
            <li>Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi (Permendikbudristek) Nomor 29 Tahun 2023.</li>
            <li>Peraturan Direktur Jenderal Guru dan Tenaga Kependidikan Nomor 4831/B/Hk.03.01/2023.</li>
            <li>Permendikdasmen No. 11 Tahun 2025 tentang Pemenuhan Beban Kerja Guru (Pasal 21).</li>
            <li>Permendikdasmen No. 7 Tahun 2025 tentang Penugasan Guru sebagai Kepala Sekolah.</li>
            <li>Permendikdasmen No. 13 Tahun 2025 (Perubahan atas Permendikbudristek No. 12 Tahun 2024 tentang Kurikulum).</li>
            <li>Permendikbudristek No. 46 Tahun 2023 tentang Pencegahan dan Penanganan Kekerasan di Satuan Pendidikan (PPKSP).</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
