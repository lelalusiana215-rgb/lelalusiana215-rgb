import React from 'react';
import { User, School } from '../../types';

interface LampiranProps {
  user: User;
  school: School;
  printDate: string;
  academicYear: string;
  teachers: any[];
}

export default function Lampiran2({ user, school, printDate, academicYear, teachers }: LampiranProps) {
  return (
    <div className="p-[20mm] min-h-[297mm] print:p-0 print:break-after-page text-black font-serif">
      <h1 className="text-center font-bold text-lg mb-2">LAMPIRAN 2</h1>
      <h2 className="text-center font-bold text-lg mb-8">REKAPITULASI RENCANA TINDAK LANJUT HASIL SUPERVISI AKADEMIK<br/>TAHUN PELAJARAN {academicYear}</h2>
      
      <table className="w-full border-collapse border border-black text-[10px]">
        <thead>
          <tr className="bg-green-100">
            <th className="border border-black p-1 text-center w-8">No</th>
            <th className="border border-black p-1 text-center w-32">Nama Guru</th>
            <th className="border border-black p-1 text-center">Identifikasi Masalah</th>
            <th className="border border-black p-1 text-center">Rekomendasi Perbaikan</th>
            <th className="border border-black p-1 text-center">Rencana Kegiatan (RTL)</th>
            <th className="border border-black p-1 text-center">Ukuran Keberhasilan</th>
            <th className="border border-black p-1 text-center w-20">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length > 0 ? teachers.map((teacher, index) => {
            const stage5Data = typeof teacher.stage5_data === 'string' ? JSON.parse(teacher.stage5_data) : teacher.stage5_data;
            const notes = stage5Data?.notes || "-";
            
            return (
              <tr key={teacher.id}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1 font-bold">{teacher.name}</td>
                <td className="border border-black p-1 text-center">-</td>
                <td className="border border-black p-1 text-center">-</td>
                <td className="border border-black p-1">{notes}</td>
                <td className="border border-black p-1 text-center">-</td>
                <td className="border border-black p-1 text-center">-</td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={7} className="border border-black p-4 text-center italic">Belum ada data rekapitulasi.</td>
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
  );
}
