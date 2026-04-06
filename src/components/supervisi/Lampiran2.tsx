import React from 'react';
import { User, School } from '../../types';

interface LampiranProps {
  user: User;
  school: School;
  printDate: string;
  academicYear: string;
}

export default function Lampiran2({ user, school, printDate, academicYear }: LampiranProps) {
  return (
    <>
      {/* Lampiran 9: Monitoring Administrasi */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 9</h1>
        <h2 className="text-center font-bold text-lg mb-8">INSTRUMEN MONITORING<br/>ADMINISTRASI PEMBELAJARAN<br/>{school.name.toUpperCase()}</h2>
        
        <table className="w-full mb-6 text-md">
          <tbody>
            <tr><td className="w-40">Nama Guru</td><td className="w-4">:</td><td>...................................................................</td></tr>
            <tr><td>Mata Pelajaran</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Materi Pokok</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Kelas/jam ke-</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Tanggal</td><td>:</td><td>...................................................................</td></tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-center w-32">Dokumen Administrasi</th>
              <th className="border border-black p-2 text-center">Indikator Kualitas</th>
              <th className="border border-black p-2 text-center w-24">Keterangan<br/>(Ada/Tidak)</th>
              <th className="border border-black p-2 text-center w-32">Catatan/Temuan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2">Program Tahunan (Prota)</td>
              <td className="border border-black p-2">Memuat distribusi kompetensi, relevan dengan kurikulum, realistis</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2">Program Semester (Promes)</td>
              <td className="border border-black p-2">Rinci, selaras dengan Prota, memuat alokasi waktu yang proporsional</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2">Kurikulum Operasional Sekolah (KOS)</td>
              <td className="border border-black p-2">Digunakan sebagai acuan perencanaan; disesuaikan dengan karakteristik sekolah & siswa</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2">Rencana Pelaksanaan Pembelajaran (RPP/Modul Ajar)</td>
              <td className="border border-black p-2">Tujuan selaras dengan CP & ATP</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2">Pendekatan Pembelajaran</td>
              <td className="border border-black p-2">Mengintegrasikan pendekatan pembelajaran mendalam (inquiry, kolaborasi, refleksi)</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2">Desain Pembelajaran</td>
              <td className="border border-black p-2">Memuat kegiatan lintas disiplin (jika relevan)</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2">Asesmen</td>
              <td className="border border-black p-2">Menyediakan asesmen autentik</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">8</td>
              <td className="border border-black p-2">Buku Nilai / Instrumen Penilaian</td>
              <td className="border border-black p-2">Penilaian autentik, mencakup sikap, pengetahuan, keterampilan, serta refleksi belajar</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">9</td>
              <td className="border border-black p-2">Jurnal Mengajar</td>
              <td className="border border-black p-2">Tersusun rapi, mencatat pelaksanaan pembelajaran, kendala, tindak lanjut</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">10</td>
              <td className="border border-black p-2">Bahan Ajar/Media</td>
              <td className="border border-black p-2">Kreatif, inovatif, kontekstual, dan mendukung keterlibatan aktif siswa</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">11</td>
              <td className="border border-black p-2">Dokumentasi Hasil Belajar Siswa</td>
              <td className="border border-black p-2">Portofolio, projek, refleksi siswa sebagai bukti deep learning</td>
              <td className="border border-black p-2">☐ Ada<br/>☐ Tidak</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td colSpan={4} className="border border-black p-2 text-right font-bold">Nilai</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        <div className="text-xs mt-2 mb-8">
          <strong>Skala Penilaian</strong><br/>
          Sangat Baik : Administrasi lengkap, mutakhir, dan sepenuhnya mendukung pembelajaran mendalam<br/>
          Baik : Administrasi lengkap, ada sedikit perbaikan yang perlu dilakukan<br/>
          Cukup : Administrasi belum lengkap, kualitas masih rendah, perlu pembinaan<br/>
          Kurang : Administrasi tidak tersedia atau sangat tidak sesuai
        </div>

        <div className="flex justify-between mt-8 text-md">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Kepala Sekolah</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">{user.name}</p>
            <p>NIP. {user.nip || '.........................'}</p>
          </div>
          <div className="text-center">
            <p>{school.address.split(',')[0] || 'Sekolah'}, {printDate}</p>
            <p>Guru Kelas</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 10: Supervisi Perpustakaan */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 10</h1>
        <h2 className="text-center font-bold text-lg mb-8">LEMBAR SUPERVISI PERPUSTAKAAN</h2>
        
        <table className="w-full mb-6 text-md">
          <tbody>
            <tr><td className="w-40">Nama Instansi</td><td className="w-4">:</td><td>{school.name}</td></tr>
            <tr><td>Nama Pegawai</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Jabatan</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Tugas Pokok</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Hari/Tanggal supervisi</td><td>:</td><td>...................................................................</td></tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-black p-2 text-center w-10" rowSpan={2}>No.</th>
              <th className="border border-black p-2 text-center" rowSpan={2}>Aspek yang Disupervisi</th>
              <th className="border border-black p-2 text-center" colSpan={3}>Nilai</th>
              <th className="border border-black p-2 text-center w-40" rowSpan={2}>Saran</th>
            </tr>
            <tr className="bg-blue-100">
              <th className="border border-black p-2 text-center w-8">3</th>
              <th className="border border-black p-2 text-center w-8">2</th>
              <th className="border border-black p-2 text-center w-8">1</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-black p-2 text-center">1.</td><td className="border border-black p-2">Kebersihan ruang perpustakaan</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">2.</td><td className="border border-black p-2">Kebersihan halaman perpustakaan</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">3.</td><td className="border border-black p-2">Kebersihan Buku Pustaka</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">4.</td><td className="border border-black p-2">Program kerja perpustakaan</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">5.</td><td className="border border-black p-2">Perlengkapan:</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">a. Buku induk perpustakaan</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">b. Klasifikasi buku</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">c. Katalog</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">d. Kartu peminjam</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">e. Buku peminjam</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">f. Daftar pengunjung</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">g. Kartu buku</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">6.</td><td className="border border-black p-2">Tempat penyimpanan:</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">a. Lemari</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">b. Rak</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center"></td><td className="border border-black p-2 pl-6">c. Meja baca + kursi</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">7.</td><td className="border border-black p-2">Tata tertib perpustakaan</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">8.</td><td className="border border-black p-2">Struktur organisasi perpustakaan</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">9.</td><td className="border border-black p-2">Koleksi audio video visual</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">10.</td><td className="border border-black p-2">Laporan keuangan</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">11.</td><td className="border border-black p-2">Laporan akhir semester</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 text-center">12.</td><td className="border border-black p-2">Laporan akhir tahun</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td colSpan={2} className="border border-black p-2 font-bold">JUMLAH NILAI</td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td colSpan={2} className="border border-black p-2 font-bold">NILAI AKHIR</td><td colSpan={3} className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td colSpan={2} className="border border-black p-2 font-bold">KUALIFIKASI</td><td colSpan={3} className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
          </tbody>
        </table>

        <div className="text-xs mt-2 mb-8">
          <strong>Keterangan (kualifikasi):</strong><br/>
          Di atas Ekspektasi : 86 s.d 100<br/>
          Sesuai Ekspektasi: 70 s.d 85<br/>
          Di bawah Ekspektasi : &lt; 70
        </div>

        <div className="flex justify-between mt-8 text-md">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Observer</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">{user.name}</p>
            <p>NIP. {user.nip || '.........................'}</p>
          </div>
          <div className="text-center">
            <p>{school.address.split(',')[0] || 'Sekolah'}, {printDate}</p>
            <p>Tenaga Kepustakaan</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 11: Supervisi Tenaga Kependidikan */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 11</h1>
        <h2 className="text-center font-bold text-lg mb-8">INSTRUMEN SUPERVISI TENAGA KEPENDIDIKAN<br/>(OPERATOR SEKOLAH)</h2>
        
        <table className="w-full mb-6 text-md">
          <tbody>
            <tr><td className="w-48">Nama Tenaga Kependidikan</td><td className="w-4">:</td><td>...................................................................</td></tr>
            <tr><td>Jabatan</td><td>:</td><td>Operator Sekolah</td></tr>
            <tr><td>Unit Kerja</td><td>:</td><td>{school.name}</td></tr>
            <tr><td>Tanggal Supervisi</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Supervisor</td><td>:</td><td>{user.name}</td></tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-center w-32">Aspek</th>
              <th className="border border-black p-2 text-center">Indikator</th>
              <th className="border border-black p-2 text-center w-16">Skor<br/>(1-4)</th>
              <th className="border border-black p-2 text-center w-32">Catatan/Temuan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2">Administrasi Data</td>
              <td className="border border-black p-2">- Kelengkapan Dapodik/EMIS<br/>- Ketepatan waktu entri data<br/>- Keakuratan data siswa, guru, sarpras</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2">Pelayanan Akademik</td>
              <td className="border border-black p-2">- Dukungan terhadap administrasi guru & siswa (ijazah, raport, absensi digital)<br/>- Layanan cepat, tepat, ramah</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2">Manajemen Dokumen</td>
              <td className="border border-black p-2">- Kearsipan rapi dan mudah diakses<br/>- Menyediakan laporan rutin untuk pimpinan sekolah</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2">Penguasaan Teknologi</td>
              <td className="border border-black p-2">- Penguasaan aplikasi Dapodik, ARKAS, SIPLah, e-raport<br/>- Pemanfaatan teknologi untuk efisiensi</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2">Etos Kerja & Tanggung Jawab</td>
              <td className="border border-black p-2">- Disiplin waktu<br/>- Tuntas dalam menyelesaikan tugas<br/>- Menjaga kerahasiaan data</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2">Kolaborasi</td>
              <td className="border border-black p-2">- Komunikasi dengan guru, kepala sekolah, komite<br/>- Dukungan pada program sekolah, termasuk pembelajaran mendalam</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2">Inovasi & Dukungan Mutu</td>
              <td className="border border-black p-2">- Memberi ide/solusi untuk efektivitas administrasi<br/>- Mendukung budaya mutu sekolah</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        <div className="text-xs mt-2 mb-8">
          <strong>Skala Penilaian</strong><br/>
          4 Sangat Baik : Melaksanakan tugas sangat efektif, inovatif, penuh tanggung jawab<br/>
          3 Baik : Melaksanakan tugas dengan baik, masih ada sedikit perbaikan<br/>
          2 Cukup : Tugas dilaksanakan minimal, perlu pembinaan lebih lanjut<br/>
          1 Kurang : Tugas tidak sesuai standar, perlu perbaikan mendasar
        </div>

        <div className="flex justify-between mt-8 text-md">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Supervisor</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">{user.name}</p>
            <p>NIP. {user.nip || '.........................'}</p>
          </div>
          <div className="text-center">
            <p>{school.address.split(',')[0] || 'Sekolah'}, {printDate}</p>
            <p>Operator Sekolah</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 12: Rencana Tindak Lanjut */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 12</h1>
        <h2 className="text-center font-bold text-lg mb-8">Lembar Rencana Tindak Lanjut Observasi Guru</h2>
        
        <table className="w-full mb-6 text-md">
          <tbody>
            <tr>
              <td className="w-32">Nama Guru</td><td className="w-4">:</td><td className="w-1/2">.......................................</td>
              <td className="w-32">Tahun pelajaran</td><td className="w-4">:</td><td>{academicYear}</td>
            </tr>
            <tr>
              <td>NIP</td><td>:</td><td>.......................................</td>
              <td>Sekolah</td><td>:</td><td>{school.name}</td>
            </tr>
            <tr>
              <td>Observer</td><td>:</td><td>1. .......................................</td>
              <td>Kelas</td><td>:</td><td>.......................................</td>
            </tr>
            <tr>
              <td></td><td></td><td>2. .......................................</td>
              <td>Mata Pelajaran</td><td>:</td><td>.......................................</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-green-200">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-center">Identifikasi Masalah</th>
              <th className="border border-black p-2 text-center">Rekomendasi Perbaikan</th>
              <th className="border border-black p-2 text-center">Rencana Kegiatan</th>
              <th className="border border-black p-2 text-center">Ukuran Keberhasilan</th>
              <th className="border border-black p-2 text-center w-24">Waktu</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-black p-2 h-16"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 h-16"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 h-16"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
            <tr><td className="border border-black p-2 h-16"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
          </tbody>
        </table>

        <div className="flex justify-between mt-16 text-md">
          <div className="text-center">
            <p>Mengetahui</p>
            <p>Kepala Sekolah</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">{user.name}</p>
            <p>NIP. {user.nip || '.........................'}</p>
          </div>
          <div className="text-center">
            <p>{school.address.split(',')[0] || 'Sekolah'}, ........................ 2025</p>
            <p>Guru yang mengajar</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>
    </>
  );
}
