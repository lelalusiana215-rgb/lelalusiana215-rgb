import React from 'react';

export default function Bab3() {
  return (
    <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif text-justify relative bg-white pb-16">
      <h1 className="text-center font-bold text-xl mb-8">BAB III<br/>PERANGKAT DAN JADWAL SUPERVISI</h1>
      
      <div className="space-y-6 text-lg leading-relaxed">
        <div>
          <h2 className="font-bold mb-2">A. Perangkat Supervisi</h2>
          <p className="mb-2 indent-8">
            Perangkat supervisi akademik yang digunakan dalam program ini telah disesuaikan dengan standar Kurikulum Merdeka dan pendekatan Pembelajaran Mendalam (Deep Learning). Instrumen disusun secara sistematis dan komprehensif, mencakup:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2">
            <li><strong>Instrumen Telaah Administrasi & Perangkat Ajar:</strong> Memeriksa kelengkapan administrasi pembelajaran, ATP, modul ajar, dan bahan pendukung.</li>
            <li><strong>Instrumen Penilaian Hasil Belajar:</strong> Menelaah kualitas asesmen dan pencapaian kompetensi peserta didik.</li>
            <li><strong>Instrumen Telaah Modul Ajar:</strong> Menganalisis kedalaman materi, diferensiasi, dan keterlibatan siswa.</li>
            <li><strong>Instrumen Pra-Observasi:</strong> Panduan diskusi awal antara kepala sekolah dan guru sebelum observasi kelas.</li>
            <li><strong>Instrumen Pelaksanaan Observasi Kelas:</strong> Lembar pengamatan langsung praktik mengajar berdasarkan indikator keterlibatan siswa dan pembelajaran mendalam.</li>
            <li><strong>Instrumen Pasca-Observasi & Refleksi:</strong> Panduan coaching dan umpan balik reflektif setelah observasi.</li>
            <li><strong>Instrumen Refleksi & RTL:</strong> Lembar perumusan rencana tindak lanjut pengembangan kompetensi guru.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold mb-2">B. Mekanisme Supervisi</h2>
          <p className="mb-2 indent-8">
            Mekanisme pelaksanaan supervisi akademik dilaksanakan melalui 4 (empat) tahapan utama yang terintegrasi secara profesional:
          </p>
          <ol className="list-decimal list-outside ml-6 space-y-3">
            <li>
              <strong>Perencanaan & Koordinasi</strong>
              <ul className="list-[lower-alpha] list-outside ml-6 mt-1">
                <li>Penyusunan program supervisi dan sosialisasi instrumen kepada seluruh guru.</li>
                <li>Penetapan jadwal dan penugasan supervisor.</li>
              </ul>
            </li>
            <li>
              <strong>Tahap Pra-Observasi</strong>
              <ul className="list-[lower-alpha] list-outside ml-6 mt-1">
                <li>Pertemuan dialog awal antara supervisor dan guru untuk membahas perangkat ajar, tujuan pembelajaran, dan fokus pengamatan yang diinginkan.</li>
              </ul>
            </li>
            <li>
              <strong>Tahap Pelaksanaan Observasi</strong>
              <ul className="list-[lower-alpha] list-outside ml-6 mt-1">
                <li>Pengamatan proses pembelajaran secara objektif di kelas menggunakan instrumen yang telah disiapkan.</li>
              </ul>
            </li>
            <li>
              <strong>Tahap Pasca-Observasi & Tindak Lanjut</strong>
              <ul className="list-[lower-alpha] list-outside ml-6 mt-1">
                <li>Sesi refleksi dan coaching bersama guru untuk membahas temuan, mengapresiasi kekuatan, serta merumuskan rencana tindak lanjut perbaikan secara kolaboratif.</li>
                <li>Supervisor memberikan rekomendasi program pengembangan, seperti pelatihan, pendampingan, lesson study, atau peer teaching.</li>
                <li>Dilakukan monitoring untuk melihat implementasi perbaikan pada pembelajaran berikutnya.</li>
                <li>Hasil tindak lanjut didokumentasikan dalam log supervisi sebagai dasar evaluasi berkelanjutan.</li>
              </ul>
            </li>
          </ol>
        </div>

        <div>
          <h2 className="font-bold mb-2">C. Jadwal Supervisi</h2>
          <p className="mb-2 indent-8">
            Jadwal supervisi disusun sebagai pedoman waktu pelaksanaan kegiatan supervisi agar berjalan teratur, terarah, dan sesuai dengan program yang telah direncanakan. Penyusunan jadwal ini penting untuk memastikan bahwa seluruh guru mendapatkan kesempatan yang adil dalam memperoleh pembinaan, serta agar kegiatan supervisi dapat terintegrasi dengan kalender akademik sekolah. Dengan adanya jadwal supervisi, diharapkan pelaksanaan supervisi tidak hanya menjadi formalitas, tetapi benar-benar terjadwal secara sistematis dan berkesinambungan dalam mendukung peningkatan mutu pembelajaran. Supervisi dilaksanakan sepanjang Tahun Pelajaran. Terdapat 1x pelaksanaan setiap semester oleh kepala sekolah. Jadwal kegiatan dapat diuraikan pada daftar lampiran laporan ini.
          </p>
        </div>
      </div>

      {/* Footer Page Number */}
      <div className="text-center mt-16 print:absolute print:bottom-8 print:left-0 print:right-0 text-black font-serif text-lg">
        11
      </div>
      <div style={{ msoElement: 'footer' }} className="word-footer">
        <p style={{ textAlign: 'center', fontFamily: 'Times New Roman, serif', fontSize: '11pt' }}>11</p>
      </div>
    </div>
  );
}
