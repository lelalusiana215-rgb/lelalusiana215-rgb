import React from 'react';
import { User, School } from '../../types';

interface LampiranProps {
  user: User;
  school: School;
  teachers: any[];
  academicYear: string;
  printDate: string;
}

export default function Lampiran({ user, school, teachers, academicYear, printDate }: LampiranProps) {
  return (
    <>
      {/* Lampiran 2: Jadwal Teman Sejawat Ganjil */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-xl mb-2">LAMPIRAN 2</h1>
        <h2 className="text-center font-bold text-lg mb-8">JADWAL SUPERVISI KELAS OLEH TEMAN SEJAWAT<br/>TAHUN PELAJARAN {academicYear} SEMESTER GANJIL</h2>
        
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black p-2 text-center w-12">No</th>
              <th className="border border-black p-2 text-center">Nama Guru</th>
              <th className="border border-black p-2 text-center">OBSERVER</th>
              <th className="border border-black p-2 text-center">Kelas/Mapel</th>
              <th className="border border-black p-2 text-center">Hari/Tanggal</th>
              <th className="border border-black p-2 text-center w-24">Ket</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? teachers.map((teacher, index) => {
              const observer = teachers[(index + 1) % teachers.length];
              const date = new Date();
              date.setMonth(date.getMonth() + 1);
              date.setDate(date.getDate() + index + 15);
              const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
              const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              
              return (
                <tr key={teacher.id}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2">{teacher.name}</td>
                  <td className="border border-black p-2">{observer ? observer.name : '-'}</td>
                  <td className="border border-black p-2 text-center">{teacher.teaching_class || '-'}</td>
                  <td className="border border-black p-2">{dayName}, {dateString}</td>
                  <td className="border border-black p-2"></td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="border border-black p-4 text-center italic">Belum ada data guru.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-16 text-md">
          <div className="text-center">
            <p>{school.address.split(',')[0] || 'Sekolah'}, {printDate}</p>
            <p>Kepala Sekolah</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">{user.name}</p>
            <p>NIP. {user.nip || '.........................'}</p>
          </div>
        </div>
      </div>

      {/* Lampiran 3: Jadwal Kepala Sekolah Genap */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-xl mb-2">LAMPIRAN 3</h1>
        <h2 className="text-center font-bold text-lg mb-8">JADWAL SUPERVISI KELAS OLEH KEPALA SEKOLAH<br/>TAHUN PELAJARAN {academicYear} SEMESTER GENAP</h2>
        
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black p-2 text-center w-12">No</th>
              <th className="border border-black p-2 text-center">Nama Guru</th>
              <th className="border border-black p-2 text-center">NIP</th>
              <th className="border border-black p-2 text-center">Kelas/Mapel</th>
              <th className="border border-black p-2 text-center">Hari/Tanggal</th>
              <th className="border border-black p-2 text-center w-24">Ket</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? teachers.map((teacher, index) => {
              const date = new Date();
              date.setMonth(date.getMonth() + 6);
              date.setDate(date.getDate() + index);
              const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
              const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              
              return (
                <tr key={teacher.id}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2">{teacher.name}</td>
                  <td className="border border-black p-2 text-center">{teacher.nip || '-'}</td>
                  <td className="border border-black p-2 text-center">{teacher.teaching_class || '-'}</td>
                  <td className="border border-black p-2">{dayName}, {dateString}</td>
                  <td className="border border-black p-2"></td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="border border-black p-4 text-center italic">Belum ada data guru.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-16 text-md">
          <div className="text-center">
            <p>{school.address.split(',')[0] || 'Sekolah'}, {printDate}</p>
            <p>Kepala Sekolah</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">{user.name}</p>
            <p>NIP. {user.nip || '.........................'}</p>
          </div>
        </div>
      </div>

      {/* Lampiran 4: Jadwal Teman Sejawat Genap */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-xl mb-2">LAMPIRAN 4</h1>
        <h2 className="text-center font-bold text-lg mb-8">JADWAL SUPERVISI KELAS OLEH TEMAN SEJAWAT<br/>TAHUN PELAJARAN {academicYear} SEMESTER GENAP</h2>
        
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black p-2 text-center w-12">No</th>
              <th className="border border-black p-2 text-center">Nama Guru</th>
              <th className="border border-black p-2 text-center">OBSERVER</th>
              <th className="border border-black p-2 text-center">Kelas/Mapel</th>
              <th className="border border-black p-2 text-center">Hari/Tanggal</th>
              <th className="border border-black p-2 text-center w-24">Ket</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length > 0 ? teachers.map((teacher, index) => {
              const observer = teachers[(index + 1) % teachers.length];
              const date = new Date();
              date.setMonth(date.getMonth() + 6);
              date.setDate(date.getDate() + index + 15);
              const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
              const dateString = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              
              return (
                <tr key={teacher.id}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2">{teacher.name}</td>
                  <td className="border border-black p-2">{observer ? observer.name : '-'}</td>
                  <td className="border border-black p-2 text-center">{teacher.teaching_class || '-'}</td>
                  <td className="border border-black p-2">{dayName}, {dateString}</td>
                  <td className="border border-black p-2"></td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="border border-black p-4 text-center italic">Belum ada data guru.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-16 text-md">
          <div className="text-center">
            <p>{school.address.split(',')[0] || 'Sekolah'}, {printDate}</p>
            <p>Kepala Sekolah</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">{user.name}</p>
            <p>NIP. {user.nip || '.........................'}</p>
          </div>
        </div>
      </div>

      {/* Lampiran 5: Instrumen RPP */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 5</h1>
        <h2 className="text-center font-bold text-lg mb-8">INSTRUMEN SUPERVISI RPP<br/>(PEMBELAJARAN MENDALAM)<br/>{school.name.toUpperCase()}</h2>
        
        <table className="w-full mb-6 text-md">
          <tbody>
            <tr><td className="w-40">Nama Guru</td><td className="w-4">:</td><td>...................................................................</td></tr>
            <tr><td>Mata Pelajaran</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Kelas/jam ke-</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Tanggal</td><td>:</td><td>...................................................................</td></tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-center w-40">Komponen RPP</th>
              <th className="border border-black p-2 text-center">Indikator Supervisi (Pembelajaran Mendalam)</th>
              <th className="border border-black p-2 text-center w-16">Skor<br/>(1-4)</th>
              <th className="border border-black p-2 text-center w-40">Catatan/Temuan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2">Identitas RPP</td>
              <td className="border border-black p-2">RPP memuat identitas lengkap (mapel, kelas, materi, waktu).</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2">Tujuan Pembelajaran</td>
              <td className="border border-black p-2">Tujuan dirumuskan sesuai CP/TP, menggunakan kata kerja operasional, berorientasi HOTS dan pembelajaran mendalam.</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2">Materi Pembelajaran</td>
              <td className="border border-black p-2">Materi relevan, kontekstual, mendorong pemahaman konsep, bukan hafalan semata.</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2">Model/Metode</td>
              <td className="border border-black p-2">Menggunakan pendekatan pembelajaran mendalam (misalnya: discovery learning, problem based learning, project based learning, inquiry).</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2">Kegiatan Pendahuluan</td>
              <td className="border border-black p-2">Apersepsi menghubungkan pengetahuan lama dengan baru; memotivasi siswa; menjelaskan tujuan pembelajaran.</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2">Kegiatan Inti</td>
              <td className="border border-black p-2">a. Mengaktifkan siswa (kolaborasi, diskusi, eksperimen, eksplorasi).<br/>b. Mengintegrasikan keterampilan berpikir kritis, kreatif, komunikasi, kolaborasi.<br/>c. Memberikan kesempatan refleksi.</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2">Kegiatan Penutup</td>
              <td className="border border-black p-2">Melibatkan siswa dalam menyimpulkan, refleksi, tindak lanjut, serta penguatan nilai karakter.</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">8</td>
              <td className="border border-black p-2">Media & Sumber Belajar</td>
              <td className="border border-black p-2">Variatif, relevan, kontekstual, mendukung eksplorasi konsep dan pengalaman belajar mendalam.</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">9</td>
              <td className="border border-black p-2">Asesmen Pembelajaran</td>
              <td className="border border-black p-2">Berbasis autentik (produk, proyek, portofolio, unjuk kerja, refleksi), tidak sekadar tes tertulis.</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">10</td>
              <td className="border border-black p-2">Diferensiasi Pembelajaran</td>
              <td className="border border-black p-2">Memberi ruang bagi perbedaan kemampuan, minat, dan gaya belajar siswa.</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td colSpan={5} className="border border-black p-2 font-bold">REKOMENDASI:</td>
            </tr>
            <tr>
              <td colSpan={5} className="border border-black p-2 h-16"></td>
            </tr>
          </tbody>
        </table>

        <div className="text-xs mt-2 mb-8">
          Skala Penilaian:<br/>
          4 = Sangat Baik<br/>
          3 = Baik<br/>
          2 = Cukup<br/>
          1 = Perlu Bimbingan
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
            <p>Guru yang Mengajar</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 6: Pra Observasi */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 6</h1>
        <h2 className="text-center font-bold text-lg mb-8">INSTRUMEN PERCAKAPAN PRA OBSERVASI<br/>{school.name.toUpperCase()}</h2>
        
        <table className="w-full mb-6 text-md">
          <tbody>
            <tr><td className="w-40">Nama Guru</td><td className="w-4">:</td><td>...................................................................</td></tr>
            <tr><td>Mata Pelajaran</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Kelas/jam ke-</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Tanggal</td><td>:</td><td>...................................................................</td></tr>
          </tbody>
        </table>

        <h3 className="font-bold mb-2">A. Panduan Pertanyaan Coaching</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-center w-1/2">Pertanyaan Reflektif (Coaching)</th>
              <th className="border border-black p-2 text-center">Catatan Supervisor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2">Apa tujuan utama pembelajaran yang ingin Anda capai pada pertemuan ini?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2">Bagaimana Anda merancang agar siswa benar-benar memahami konsep secara mendalam, bukan hanya menghafal?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2">Strategi atau model pembelajaran apa yang Anda pilih? Mengapa strategi itu relevan untuk pembelajaran mendalam?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2">Bagaimana cara Anda mengaktifkan siswa agar berpikir kritis, kreatif, dan kolaboratif selama pembelajaran?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2">Media atau sumber belajar apa yang akan digunakan, dan bagaimana mendukung pemahaman siswa?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2">Bagaimana Anda menilai keberhasilan siswa dalam pembelajaran ini? Apakah asesmen Anda berbasis autentik?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2">Dari pengalaman sebelumnya, bagian mana dari pembelajaran yang menurut Anda paling perlu mendapat perhatian saat diobservasi?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">8</td>
              <td className="border border-black p-2">Dukungan apa yang Anda harapkan dari saya sebagai supervisor agar kegiatan ini berjalan lancar?</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        <h3 className="font-bold mt-6 mb-2">B. Kesepakatan Fokus Observasi</h3>
        <div className="border-b border-dotted border-black w-full mt-8 mb-16"></div>

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
            <p>Guru yang Mengajar</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 7: Pelaksanaan Observasi */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 7</h1>
        <h2 className="text-center font-bold text-lg mb-8">INSTRUMEN PELAKSANAAN OBSERVASI<br/>(PENDEKATAN PEMBELAJARAN MENDALAM)<br/>{school.name.toUpperCase()}</h2>
        
        <table className="w-full mb-6 text-md">
          <tbody>
            <tr><td className="w-40">Nama Guru</td><td className="w-4">:</td><td>...................................................................</td></tr>
            <tr><td>Mata Pelajaran</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Materi Pokok</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Kelas/jam ke-</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Tanggal</td><td>:</td><td>...................................................................</td></tr>
          </tbody>
        </table>

        <h3 className="font-bold mb-2">A. Tujuan Observasi</h3>
        <ol className="list-decimal list-outside ml-6 mb-4">
          <li>Menilai keterlaksanaan pembelajaran yang mendorong pemahaman mendalam.</li>
          <li>Mengamati penerapan pembelajaran lintas disiplin ilmu untuk memperkuat konteks dan relevansi.</li>
          <li>Memberikan umpan balik konstruktif agar guru dapat meningkatkan mutu pembelajaran.</li>
        </ol>

        <h3 className="font-bold mb-2">B. Aspek dan Indikator Observasi</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-center w-32">Aspek Supervisi</th>
              <th className="border border-black p-2 text-center">Indikator Pembelajaran Mendalam Lintas Disiplin</th>
              <th className="border border-black p-2 text-center w-16">Skor<br/>(1-4)</th>
              <th className="border border-black p-2 text-center w-32">Catatan Observer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2">Perencanaan</td>
              <td className="border border-black p-2">RPP/lks jelas, memuat tujuan pembelajaran mendalam, integrasi lintas disiplin (misal: Matematika-IPA-IPS-Bahasa)</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2">Pembukaan</td>
              <td className="border border-black p-2">Guru mengaitkan topik dengan kehidupan nyata dan memancing rasa ingin tahu siswa melalui pertanyaan pemantik interdisipliner</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2">Aktivasi Pengetahuan</td>
              <td className="border border-black p-2">Guru membantu siswa menghubungkan pengetahuan awal dengan konsep baru dari berbagai disiplin ilmu</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2">Eksplorasi</td>
              <td className="border border-black p-2">Siswa diberi kesempatan melakukan eksplorasi, diskusi, eksperimen, atau proyek yang melibatkan lebih dari satu bidang ilmu</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2">Kolaborasi</td>
              <td className="border border-black p-2">Siswa bekerja dalam kelompok, berbagi ide, dan memecahkan masalah dengan perspektif interdisipliner</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2">Pemahaman Mendalam</td>
              <td className="border border-black p-2">Guru menuntun siswa untuk menemukan konsep esensial, membuat koneksi lintas mata pelajaran, dan menerapkan dalam konteks nyata</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2">Keterampilan Abad 21</td>
              <td className="border border-black p-2">Aktivitas siswa melatih berpikir kritis, kreativitas, komunikasi, kolaborasi (4C), serta literasi digital bila memungkinkan</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">8</td>
              <td className="border border-black p-2">Penilaian (Asesmen)</td>
              <td className="border border-black p-2">Guru menggunakan asesmen autentik (portofolio, produk, proyek, refleksi) untuk mengukur pemahaman mendalam dan keterkaitan lintas ilmu</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">9</td>
              <td className="border border-black p-2">Penutup</td>
              <td className="border border-black p-2">Guru bersama siswa melakukan refleksi pembelajaran, menarik kesimpulan lintas disiplin, dan memberi tindak lanjut</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">10</td>
              <td className="border border-black p-2">Iklim Kelas</td>
              <td className="border border-black p-2">Lingkungan belajar aman, inklusif, partisipatif, dan mendukung kebebasan berpikir siswa</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        <h3 className="font-bold mt-6 mb-2">C. Catatan Observer</h3>
        <div className="border-b border-dotted border-black w-full mt-8"></div>
        <div className="border-b border-dotted border-black w-full mt-8"></div>
        <div className="border-b border-dotted border-black w-full mt-8 mb-6"></div>

        <h3 className="font-bold mb-2">D. Rekomendasi</h3>
        <div className="border-b border-dotted border-black w-full mt-8"></div>
        <div className="border-b border-dotted border-black w-full mt-8"></div>
        <div className="border-b border-dotted border-black w-full mt-8 mb-8"></div>

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
            <p>Guru yang Mengajar</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

      {/* Lampiran 8: Pasca Observasi */}
      <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
        <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 8</h1>
        <h2 className="text-center font-bold text-lg mb-8">INSTRUMEN SUPERVISI PASCA OBSERVASI<br/>{school.name.toUpperCase()}</h2>
        
        <table className="w-full mb-6 text-md">
          <tbody>
            <tr><td className="w-40">Nama Guru</td><td className="w-4">:</td><td>...................................................................</td></tr>
            <tr><td>Mata Pelajaran</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Materi Pokok</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Kelas/jam ke-</td><td>:</td><td>...................................................................</td></tr>
            <tr><td>Tanggal</td><td>:</td><td>...................................................................</td></tr>
          </tbody>
        </table>

        <h3 className="font-bold mb-2">A. Tujuan Observasi</h3>
        <ol className="list-decimal list-outside ml-6 mb-4">
          <li>Memberikan ruang refleksi bagi guru untuk menganalisis praktik pembelajaran yang telah dilakukan.</li>
          <li>Membantu guru menemukan kekuatan serta area pengembangan dalam pembelajaran.</li>
          <li>Menyusun strategi tindak lanjut untuk meningkatkan kualitas pembelajaran, khususnya dalam mendukung Pembelajaran Mendalam dan lintas disiplin ilmu.</li>
        </ol>

        <h3 className="font-bold mb-2">B. Panduan Percakapan</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-black p-2 text-center w-10">No</th>
              <th className="border border-black p-2 text-center w-1/2">Pertanyaan Reflektif (Coaching)</th>
              <th className="border border-black p-2 text-center">Catatan Supervisor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 text-center">1</td>
              <td className="border border-black p-2">Bagaimana perasaan Bapak/Ibu setelah melaksanakan pembelajaran tadi?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">2</td>
              <td className="border border-black p-2">Apa harapan utama Bapak/Ibu dari percakapan kita hari ini?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">3</td>
              <td className="border border-black p-2">Menurut Bapak/Ibu, bagian mana dari pembelajaran tadi yang berjalan paling baik?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">4</td>
              <td className="border border-black p-2">Apa yang membuat bagian itu berhasil?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2">Apakah ada momen ketika siswa terlihat benar-benar terlibat secara mendalam?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">6</td>
              <td className="border border-black p-2">Bagian mana dari pembelajaran yang menurut Bapak/Ibu kurang sesuai harapan?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">7</td>
              <td className="border border-black p-2">Faktor apa saja yang mempengaruhi hal tersebut?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">8</td>
              <td className="border border-black p-2">Bagaimana penerapan pendekatan lintas disiplin dapat lebih diperkuat di kelas Bapak/Ibu?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">9</td>
              <td className="border border-black p-2">Jika ada kesempatan mengajar ulang, apa yang akan Bapak/Ibu lakukan secara berbeda?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">10</td>
              <td className="border border-black p-2">Strategi atau metode apa yang ingin Bapak/Ibu coba untuk meningkatkan pemahaman mendalam siswa?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">11</td>
              <td className="border border-black p-2">Bagaimana asesmen autentik bisa lebih membantu Bapak/Ibu melihat perkembangan siswa?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">12</td>
              <td className="border border-black p-2">Langkah konkret apa yang akan Bapak/Ibu lakukan dalam pembelajaran berikutnya?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">13</td>
              <td className="border border-black p-2">Sumber daya atau dukungan apa yang Bapak/Ibu butuhkan untuk mencapainya?</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center">14</td>
              <td className="border border-black p-2">Bagaimana saya (sebagai observer/coach) bisa membantu Bapak/Ibu mewujudkan rencana tersebut?</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>

        <h3 className="font-bold mt-6 mb-2">C. Catatan Observer</h3>
        <div className="border-b border-dotted border-black w-full mt-8"></div>
        <div className="border-b border-dotted border-black w-full mt-8"></div>

        <h3 className="font-bold mt-6 mb-2">D. Kesepakatan Tindak Lanjut</h3>
        <div className="border-b border-dotted border-black w-full mt-8"></div>
        <div className="border-b border-dotted border-black w-full mt-8"></div>

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
            <p>Guru yang Mengajar</p>
            <br /><br /><br /><br />
            <p className="font-bold underline">.........................................</p>
            <p>NIP. .........................</p>
          </div>
        </div>
      </div>

    </>
  );
}
