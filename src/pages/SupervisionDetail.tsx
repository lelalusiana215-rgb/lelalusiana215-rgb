import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Supervision, StageData } from "../types";
import { 
  ChevronLeft, ChevronRight, Save, Printer, FileText, 
  CheckCircle2, AlertCircle, Clock, Play, Pause, RotateCcw,
  Download, Award, MessageSquare, PenTool, Calendar, Sparkles,
  HelpCircle, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  STAGE1_INSTRUMENTS, STAGE2_INSTRUMENTS, 
  STAGE3_INSTRUMENTS, STAGE4_INSTRUMENTS, STAGE5_INSTRUMENTS,
  PRE_OBSERVATION_INSTRUMENTS, POST_OBSERVATION_INSTRUMENTS
} from "../constants";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { GoogleGenAI } from "@google/genai";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, ImageRun } from "docx";
import { saveAs } from "file-saver";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

export default function SupervisionDetail({ user }: { user: User }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supervision, setSupervision] = useState<Supervision | null>(null);
  const [school, setSchool] = useState<any>(null);
  const [activeStage, setActiveStage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: React.ReactNode } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Stage States
  const [stage1, setStage1] = useState<StageData>({ items: {}, notes: "" });
  const [stage2, setStage2] = useState<StageData>({ items: {}, notes: "" });
  const [stage3, setStage3] = useState<StageData>({ items: {}, notes: "" });
  const [stage4, setStage4] = useState<StageData>({ items: {}, notes: "" });
  const [stage5, setStage5] = useState<StageData>({ items: {}, notes: "" });
  const [stage6, setStage6] = useState<StageData>({ items: {}, notes: "" });
  const [stage7, setStage7] = useState<StageData>({ items: {}, notes: "" });

  // Timer for Stage 3
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "supervisions", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Supervision;
        setSupervision(data);
        if (data.stage1_data) setStage1(typeof data.stage1_data === 'string' ? JSON.parse(data.stage1_data) : data.stage1_data);
        if (data.stage2_data) setStage2(typeof data.stage2_data === 'string' ? JSON.parse(data.stage2_data) : data.stage2_data);
        if (data.stage3_data) setStage3(typeof data.stage3_data === 'string' ? JSON.parse(data.stage3_data) : data.stage3_data);
        if (data.stage4_data) setStage4(typeof data.stage4_data === 'string' ? JSON.parse(data.stage4_data) : data.stage4_data);
        if (data.stage5_data) setStage5(typeof data.stage5_data === 'string' ? JSON.parse(data.stage5_data) : data.stage5_data);
        if (data.stage6_data) setStage6(typeof data.stage6_data === 'string' ? JSON.parse(data.stage6_data) : data.stage6_data);
        if (data.stage7_data) setStage7(typeof data.stage7_data === 'string' ? JSON.parse(data.stage7_data) : data.stage7_data);

        // Fetch school data
        if (data.school_id) {
          getDoc(doc(db, "schools", data.school_id)).then(schoolSnap => {
            if (schoolSnap.exists()) {
              setSchool({ id: schoolSnap.id, ...schoolSnap.data() });
            }
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const calculateScore = (stage: number, data: StageData | null) => {
    if (!data || !data.items) return 0;
    const items = Object.values(data.items);
    
    if (stage === 1) {
      if (STAGE1_INSTRUMENTS.length === 0) return 0;
      const sum = (items as any[]).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
      const max = STAGE1_INSTRUMENTS.length * 2;
      const score = (sum / max) * 100;
      return isNaN(score) ? 0 : score;
    } else {
      let instruments: any[] = [];
      if (stage === 2) instruments = STAGE2_INSTRUMENTS;
      else if (stage === 3) instruments = STAGE3_INSTRUMENTS;
      else if (stage === 4) instruments = PRE_OBSERVATION_INSTRUMENTS;
      else if (stage === 5) instruments = STAGE4_INSTRUMENTS;
      else if (stage === 6) instruments = POST_OBSERVATION_INSTRUMENTS;
      else if (stage === 7) instruments = STAGE5_INSTRUMENTS;
      
      if (instruments.length === 0) return 0;
      // Interview stages (4 & 6) don't have scores 1-4
      if (stage === 4 || stage === 6) return 0;

      const sum = instruments.reduce((acc, inst) => acc + (Number(data.items[inst.id]) || 0), 0);
      const max = instruments.length * 4;
      const score = (sum / max) * 100;
      return isNaN(score) ? 0 : score;
    }
  };

  const handleSaveStage = async (statusOverride?: string) => {
    if (!id) return;
    setSaving(true);
    setMessage(null);
    try {
      let currentData;
      if (activeStage === 1) currentData = stage1;
      else if (activeStage === 2) currentData = stage2;
      else if (activeStage === 3) currentData = stage3;
      else if (activeStage === 4) currentData = stage4;
      else if (activeStage === 5) currentData = stage5;
      else if (activeStage === 6) currentData = stage6;
      else currentData = stage7;

      const score = calculateScore(activeStage, currentData);
      const status = statusOverride || (activeStage === 7 ? 'SELESAI' : 'PROSES');

      const updateData: any = {
        [`stage${activeStage}_data`]: { ...currentData, score },
        status
      };

      if (activeStage === 7 || status === 'SELESAI') {
        const s1 = calculateScore(1, stage1);
        const s2 = calculateScore(2, stage2);
        const s3 = calculateScore(3, stage3);
        const s5 = calculateScore(5, stage5);
        const s7 = calculateScore(7, stage7);
        
        const totalScore = (Number(s1) || 0) + (Number(s2) || 0) + (Number(s3) || 0) + (Number(s5) || 0) + (Number(s7) || 0);
        updateData.final_score = totalScore / 5; // Only 5 stages have scores
        updateData.recommendations = generateRecommendations(updateData.final_score);
      }

      await updateDoc(doc(db, "supervisions", id), updateData);
      setMessage({ type: 'success', text: 'Progres berhasil disimpan.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Gagal menyimpan progres.' });
    } finally {
      setSaving(false);
    }
  };

  const generateAINotes = async () => {
    try {
      if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
      }
    } catch (err) {
      console.error("Error checking API key:", err);
    }

    setIsGenerating(true);
    setMessage(null);
    try {
      // Use custom API key from localStorage if available, then process.env, then import.meta.env
      const customKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY');
      const apiKey = customKey || (typeof process !== 'undefined' && process.env ? (process.env as any).GEMINI_API_KEY : null);
      
      if (!apiKey) {
        throw new Error("API Key tidak ditemukan.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      let instruments: any[] = [];
      let currentData: any;
      let stageName = "";

      if (activeStage === 1) {
        instruments = STAGE1_INSTRUMENTS;
        currentData = stage1;
        stageName = "Administrasi";
      } else if (activeStage === 2) {
        instruments = STAGE2_INSTRUMENTS;
        currentData = stage2;
        stageName = "Telaah ATP";
      } else if (activeStage === 3) {
        instruments = STAGE3_INSTRUMENTS;
        currentData = stage3;
        stageName = "Telaah Modul Ajar";
      } else if (activeStage === 4) {
        instruments = PRE_OBSERVATION_INSTRUMENTS;
        currentData = stage4;
        stageName = "Pra Observasi";
      } else if (activeStage === 5) {
        instruments = STAGE4_INSTRUMENTS;
        currentData = stage5;
        stageName = "Pelaksanaan";
      } else if (activeStage === 6) {
        instruments = POST_OBSERVATION_INSTRUMENTS;
        currentData = stage6;
        stageName = "Pasca Observasi";
      } else {
        instruments = STAGE5_INSTRUMENTS;
        currentData = stage7;
        stageName = "Refleksi";
      }

      const results = instruments.map(inst => {
        const val = currentData.items[inst.id];
        let status = "";
        if (activeStage === 1) {
          status = val ? "Ada/Lengkap" : "Tidak Ada/Belum Lengkap";
        } else if (activeStage === 4 || activeStage === 6) {
          status = `Catatan: ${val || "-"}`;
        } else {
          status = `Skor: ${val || 0} dari 4`;
        }
        return `- ${inst.text}: ${status}`;
      }).join("\n");

      const prompt = `Anda adalah seorang Kepala Sekolah profesional. Berikan catatan/rekomendasi singkat, padat, dan konstruktif untuk guru berdasarkan hasil supervisi akademik tahap ${stageName} berikut:
      
      Data Instrumen:
      ${results}
      
      Berikan catatan dalam Bahasa Indonesia yang sopan dan memotivasi. Fokus pada area yang perlu ditingkatkan jika ada skor rendah, dan apresiasi jika skor tinggi. Maksimal 3-4 kalimat.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const generatedText = response.text || "Gagal mengenerate catatan.";
      
      if (activeStage === 1) setStage1({ ...stage1, notes: generatedText });
      else if (activeStage === 2) setStage2({ ...stage2, notes: generatedText });
      else if (activeStage === 3) setStage3({ ...stage3, notes: generatedText });
      else if (activeStage === 4) setStage4({ ...stage4, notes: generatedText });
      else if (activeStage === 5) setStage5({ ...stage5, notes: generatedText });
      else if (activeStage === 6) setStage6({ ...stage6, notes: generatedText });
      else if (activeStage === 7) setStage7({ ...stage7, notes: generatedText });

    } catch (err: any) {
      console.error(err);
      const isKeyError = err.message?.includes("Requested entity was not found") || err.message?.includes("API Key tidak ditemukan");
      if (isKeyError) {
        setMessage({ 
          type: "error", 
          text: (
            <span>
              API Key tidak valid atau belum dikonfigurasi. 
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                Klik di sini untuk mendapatkan API Key dari Google AI Studio.
              </a>
            </span>
          )
        });
        if ((window as any).aistudio?.openSelectKey) {
          (window as any).aistudio.openSelectKey();
        }
      } else {
        setMessage({ type: "error", text: "Gagal mengenerate catatan dengan AI. Pastikan API Key Anda sudah benar." });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRecommendations = (score: number) => {
    if (score >= 90) return "Sangat Baik. Pertahankan kualitas pembelajaran dan jadilah mentor bagi guru lain.";
    if (score >= 80) return "Baik. Tingkatkan inovasi dalam penggunaan media pembelajaran digital.";
    if (score >= 70) return "Cukup. Perlu penguatan pada aspek pengelolaan kelas dan diferensiasi.";
    return "Perlu Bimbingan. Diperlukan pendampingan intensif dalam penyusunan perangkat dan pelaksanaan pembelajaran.";
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const base64ToUint8Array = (base64: string) => {
    if (!base64) return new Uint8Array(0);
    try {
      const base64Content = base64.includes(',') ? base64.split(',')[1] : base64;
      const binaryString = window.atob(base64Content);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      console.error("Error converting base64 to ArrayBuffer", e);
      return new Uint8Array(0);
    }
  };

  const generateStagePDF = (stageNum: number) => {
    if (!supervision) return;
    const doc = new jsPDF();
    
    // Kop Surat
    if (supervision.logo_gov) {
      try {
        doc.addImage(supervision.logo_gov, 'PNG', 20, 10, 20, 20);
      } catch (e) { console.error("Error adding gov logo to PDF", e); }
    }
    if (supervision.logo_school) {
      try {
        doc.addImage(supervision.logo_school, 'PNG', 170, 10, 20, 20);
      } catch (e) { console.error("Error adding school logo to PDF", e); }
    }

    const headerLines = (supervision.header_text || "DINAS PENDIDIKAN\nLAPORAN SUPERVISI AKADEMIK").split('\n');
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    headerLines.forEach((line, i) => {
      doc.text(line, 105, 15 + (i * 6), { align: "center" });
    });
    
    const lineY = 15 + (headerLines.length * 6) + 2;
    doc.setLineWidth(0.5);
    doc.line(20, lineY, 190, lineY);
    doc.setLineWidth(0.2);
    doc.line(20, lineY + 1, 190, lineY + 1);

    // Title
    let stageName = "";
    let instruments: any[] = [];
    let stageData: StageData;

    if (stageNum === 1) { stageName = "Administrasi Guru"; instruments = STAGE1_INSTRUMENTS; stageData = stage1; }
    else if (stageNum === 2) { stageName = "Telaah Alur Tujuan Pembelajaran (ATP)"; instruments = STAGE2_INSTRUMENTS; stageData = stage2; }
    else if (stageNum === 3) { stageName = "Telaah Modul Ajar"; instruments = STAGE3_INSTRUMENTS; stageData = stage3; }
    else if (stageNum === 4) { stageName = "Instrumen Percakapan Pra Observasi"; instruments = PRE_OBSERVATION_INSTRUMENTS; stageData = stage4; }
    else if (stageNum === 5) { stageName = "Pelaksanaan Pembelajaran"; instruments = STAGE4_INSTRUMENTS; stageData = stage5; }
    else if (stageNum === 6) { stageName = "Instrumen Supervisi Pasca Observasi"; instruments = POST_OBSERVATION_INSTRUMENTS; stageData = stage6; }
    else { stageName = "Refleksi & Rencana Tindak Lanjut"; instruments = STAGE5_INSTRUMENTS; stageData = stage7; }

    doc.setFontSize(14);
    doc.text(`INSTRUMEN SUPERVISI: ${stageName.toUpperCase()}`, 105, lineY + 15, { align: "center" });

    // Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nama Guru`, 20, lineY + 25);
    doc.text(`: ${supervision.teacher_name}`, 60, lineY + 25);
    doc.text(`NIP`, 20, lineY + 30);
    doc.text(`: ${supervision.teacher_nip || "-"}`, 60, lineY + 30);
    doc.text(`Nama Supervisor`, 20, lineY + 35);
    doc.text(`: ${supervision.principal_name}`, 60, lineY + 35);
    doc.text(`Tanggal`, 20, lineY + 40);
    doc.text(`: ${new Date(supervision.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 60, lineY + 40);

    // Table
    const isInterview = stageNum === 4 || stageNum === 6;
    const tableBody = instruments.map((inst, index) => {
      const val = stageData.items[inst.id];
      let result = "";
      if (stageNum === 1) {
        if (val === 2) result = "Ada dan Sesuai";
        else if (val === 1) result = "Ada Tidak Sesuai";
        else result = "Tidak Ada";
      } else if (isInterview) {
        result = val ? val.toString() : "-";
      } else {
        result = val ? val.toString() : "0";
      }
      return [index + 1, inst.text, result];
    });

    (doc as any).autoTable({
      startY: lineY + 50,
      head: [['No', 'Komponen / Indikator', stageNum === 1 ? 'Ketersediaan' : (isInterview ? 'Catatan Supervisor' : 'Skor (1-4)')]],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: isInterview ? 80 : 30, halign: isInterview ? 'left' : 'center' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // Summary & Notes
    doc.setFont("helvetica", "bold");
    doc.text("Catatan / Rekomendasi:", 20, finalY + 10);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(stageData.notes || "Tidak ada catatan.", 20, finalY + 16, { maxWidth: 170 });

    // Signatures
    const sigY = finalY + 40;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Left side: Teacher
    doc.text("Guru yang Disupervisi,", 40, sigY);
    doc.text("(....................................)", 40, sigY + 25);
    doc.text(`Nama: ${supervision.teacher_name}`, 40, sigY + 30);
    doc.text(`NIP: ${supervision.teacher_nip || "-"}`, 40, sigY + 35);

    // Right side: Supervisor
    doc.text("Supervisor / Kepala Sekolah,", 130, sigY);
    doc.text("(....................................)", 130, sigY + 25);
    doc.text(`Nama: ${supervision.principal_name}`, 130, sigY + 30);
    doc.text(`NIP: ${supervision.principal_nip || "-"}`, 130, sigY + 35);

    doc.save(`Supervisi_${stageName}_${supervision.teacher_name}.pdf`);
  };

  const generatePDF = () => {
    if (!supervision) return;
    const doc = new jsPDF();
    
    // Kop Surat
    const logoGov = school?.logo_gov || supervision.logo_gov;
    const logoSchool = school?.logo_school || supervision.logo_school;
    const headerText = school?.header_text || supervision.header_text || "DINAS PENDIDIKAN\nLAPORAN SUPERVISI AKADEMIK";

    if (logoGov) {
      try {
        doc.addImage(logoGov, 'PNG', 20, 10, 20, 20);
      } catch (e) { console.error("Error adding gov logo to PDF", e); }
    }
    if (logoSchool) {
      try {
        doc.addImage(logoSchool, 'PNG', 170, 10, 20, 20);
      } catch (e) { console.error("Error adding school logo to PDF", e); }
    }

    const headerLines = headerText.split('\n');
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    headerLines.forEach((line, i) => {
      doc.text(line, 105, 15 + (i * 6), { align: "center" });
    });
    
    const lineY = 15 + (headerLines.length * 6) + 2;
    doc.setLineWidth(0.5);
    doc.line(20, lineY, 190, lineY);
    doc.setLineWidth(0.2);
    doc.line(20, lineY + 1, 190, lineY + 1);
    
    doc.setFontSize(14);
    doc.text("REKAPITULASI HASIL SUPERVISI AKADEMIK", 105, lineY + 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nama Guru`, 20, lineY + 25);
    doc.text(`: ${supervision.teacher_name}`, 60, lineY + 25);
    doc.text(`NIP`, 20, lineY + 30);
    doc.text(`: ${supervision.teacher_nip || "-"}`, 60, lineY + 30);
    doc.text(`Nama Kepala Sekolah`, 20, lineY + 35);
    doc.text(`: ${supervision.principal_name}`, 60, lineY + 35);
    doc.text(`Tanggal`, 20, lineY + 40);
    doc.text(`: ${new Date(supervision.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 60, lineY + 40);
    doc.text(`Skor Akhir`, 20, lineY + 45);
    doc.text(`: ${supervision.final_score?.toFixed(1) || "-"}%`, 60, lineY + 45);

    // Summary Table
    (doc as any).autoTable({
      startY: lineY + 55,
      head: [['Tahap', 'Skor (%)', 'Catatan / Rekomendasi']],
      body: [
        ['Administrasi', calculateScore(1, stage1).toFixed(1), stage1.notes || "-"],
        ['Telaah ATP', calculateScore(2, stage2).toFixed(1), stage2.notes || "-"],
        ['Telaah Modul Ajar', calculateScore(3, stage3).toFixed(1), stage3.notes || "-"],
        ['Pra Observasi', "-", stage4.notes || "-"],
        ['Pelaksanaan', calculateScore(5, stage5).toFixed(1), stage5.notes || "-"],
        ['Pasca Observasi', "-", stage6.notes || "-"],
        ['Refleksi & RTL', calculateScore(7, stage7).toFixed(1), stage7.notes || "-"],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      columnStyles: {
        1: { halign: 'center' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    doc.setFont("helvetica", "bold");
    doc.text("Kesimpulan & Rekomendasi Akhir:", 20, finalY + 10);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(supervision.recommendations || "-", 20, finalY + 16, { maxWidth: 170 });

    // Signatures
    const sigY = finalY + 40;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Left side: Teacher
    doc.text("Guru yang Disupervisi,", 40, sigY);
    doc.text("(....................................)", 40, sigY + 25);
    doc.text(`Nama: ${supervision.teacher_name}`, 40, sigY + 30);
    doc.text(`NIP: ${supervision.teacher_nip || "-"}`, 40, sigY + 35);

    // Right side: Supervisor
    doc.text("Supervisor / Kepala Sekolah,", 130, sigY);
    doc.text("(....................................)", 130, sigY + 25);
    doc.text(`Nama: ${supervision.principal_name}`, 130, sigY + 30);
    doc.text(`NIP: ${supervision.principal_nip || "-"}`, 130, sigY + 35);

    doc.save(`Rekap_Supervisi_${supervision.teacher_name}.pdf`);
  };

  const generateCoverPDF = () => {
    if (!supervision) return;
    const doc = new jsPDF();
    
    // Logos
    const logoGov = school?.logo_gov || supervision.logo_gov;
    const logoSchool = school?.logo_school || supervision.logo_school;
    const schoolName = school?.name || supervision.school_name || "SEKOLAH DASAR";

    if (logoGov) {
      try {
        doc.addImage(logoGov, 'PNG', 40, 20, 25, 25);
      } catch (e) { console.error(e); }
    }
    if (logoSchool) {
      try {
        doc.addImage(logoSchool, 'PNG', 145, 20, 25, 25);
      } catch (e) { console.error(e); }
    }

    // School Name at top
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(schoolName, 105, 40, { align: "center" });
    
    // Main Title
    doc.setFontSize(24);
    doc.text("LAPORAN HASIL AKHIR", 105, 80, { align: "center" });
    doc.text("SUPERVISI AKADEMIK", 105, 92, { align: "center" });
    
    doc.setLineWidth(1);
    doc.line(40, 100, 170, 100);
    
    // Teacher Info
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Disusun Oleh:", 105, 130, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(supervision.teacher_name || "-", 105, 140, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(`NIP: ${supervision.teacher_nip || "-"}`, 105, 148, { align: "center" });
    
    // Supervisor Info
    doc.text("Supervisor:", 105, 170, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(supervision.principal_name || "-", 105, 180, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(`NIP: ${supervision.principal_nip || "-"}`, 105, 188, { align: "center" });
    
    // Year at bottom
    const year = new Date(supervision.date).getFullYear();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`TAHUN PELAJARAN ${year}/${year + 1}`, 105, 250, { align: "center" });
    
    doc.save(`Cover_Supervisi_${supervision.teacher_name}.pdf`);
  };

  const generateCoverWord = async () => {
    if (!supervision) return;
    const year = new Date(supervision.date).getFullYear();

    const logoGov = school?.logo_gov || supervision.logo_gov;
    const logoSchool = school?.logo_school || supervision.logo_school;
    const schoolName = school?.name || supervision.school_name || "SEKOLAH DASAR";

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Logos in Table for Cover
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: "none" as any },
              bottom: { style: "none" as any },
              left: { style: "none" as any },
              right: { style: "none" as any },
              insideHorizontal: { style: "none" as any },
              insideVertical: { style: "none" as any },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: logoGov ? [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: base64ToUint8Array(logoGov),
                            transformation: { width: 80, height: 80 },
                          } as any),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ] : [],
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: schoolName, bold: true, size: 32 })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: logoSchool ? [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: base64ToUint8Array(logoSchool),
                            transformation: { width: 80, height: 80 },
                          } as any),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ] : [],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "LAPORAN HASIL AKHIR", bold: true, size: 48 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: "SUPERVISI AKADEMIK", bold: true, size: 48 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "_______________________________________________________", alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Disusun Oleh:", size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: supervision.teacher_name || "-", bold: true, size: 32 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: `NIP: ${supervision.teacher_nip || "-"}`, size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "Supervisor:", size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: supervision.principal_name || "-", bold: true, size: 32 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [new TextRun({ text: `NIP: ${supervision.principal_nip || "-"}`, size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: `TAHUN PELAJARAN ${year}/${year + 1}`, bold: true, size: 32 })],
            alignment: AlignmentType.CENTER,
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Cover_Supervisi_${supervision.teacher_name}.docx`);
  };

  const generateStageWord = async (stageNum: number) => {
    if (!supervision) return;

    let stageName = "";
    let instruments: any[] = [];
    let stageData: StageData;

    if (stageNum === 1) { stageName = "Administrasi Guru"; instruments = STAGE1_INSTRUMENTS; stageData = stage1; }
    else if (stageNum === 2) { stageName = "Telaah Alur Tujuan Pembelajaran (ATP)"; instruments = STAGE2_INSTRUMENTS; stageData = stage2; }
    else if (stageNum === 3) { stageName = "Telaah Modul Ajar"; instruments = STAGE3_INSTRUMENTS; stageData = stage3; }
    else if (stageNum === 4) { stageName = "Instrumen Percakapan Pra Observasi"; instruments = PRE_OBSERVATION_INSTRUMENTS; stageData = stage4; }
    else if (stageNum === 5) { stageName = "Pelaksanaan Pembelajaran"; instruments = STAGE4_INSTRUMENTS; stageData = stage5; }
    else if (stageNum === 6) { stageName = "Instrumen Supervisi Pasca Observasi"; instruments = POST_OBSERVATION_INSTRUMENTS; stageData = stage6; }
    else { stageName = "Refleksi & Rencana Tindak Lanjut"; instruments = STAGE5_INSTRUMENTS; stageData = stage7; }

    const isInterview = stageNum === 4 || stageNum === 6;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Kop Surat Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: "none" as any },
              bottom: { style: "none" as any },
              left: { style: "none" as any },
              right: { style: "none" as any },
              insideHorizontal: { style: "none" as any },
              insideVertical: { style: "none" as any },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    children: supervision.logo_gov ? [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: base64ToUint8Array(supervision.logo_gov),
                            transformation: { width: 60, height: 60 },
                          } as any),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ] : [],
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: (supervision.header_text || "DINAS PENDIDIKAN\nLAPORAN SUPERVISI AKADEMIK").split('\n').map(line => 
                      new Paragraph({
                        children: [new TextRun({ text: line, bold: true, size: 24 })],
                        alignment: AlignmentType.CENTER,
                      })
                    ),
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    children: supervision.logo_school ? [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: base64ToUint8Array(supervision.logo_school),
                            transformation: { width: 60, height: 60 },
                          } as any),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ] : [],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "________________________________________________________________________________", alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: `INSTRUMEN SUPERVISI: ${stageName.toUpperCase()}`, bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: `Nama Guru: ${supervision.teacher_name}`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `NIP: ${supervision.teacher_nip || "-"}`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `Nama Supervisor: ${supervision.principal_name}`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `Tanggal: ${new Date(supervision.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, bold: true })] }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "No", bold: true })] })], width: { size: 5, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Komponen / Indikator", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stageNum === 1 ? "Ketersediaan" : (isInterview ? "Catatan Supervisor" : "Skor (1-4)"), bold: true })] })], width: { size: isInterview ? 40 : 20, type: WidthType.PERCENTAGE } }),
                ],
              }),
              ...instruments.map((inst, index) => {
                const val = stageData.items[inst.id];
                let result = "";
                if (stageNum === 1) {
                  if (val === 2) result = "Ada dan Sesuai";
                  else if (val === 1) result = "Ada Tidak Sesuai";
                  else result = "Tidak Ada";
                } else if (isInterview) {
                  result = val ? val.toString() : "-";
                } else {
                  result = val ? val.toString() : "0";
                }
                return new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph((index + 1).toString())] }),
                    new TableCell({ children: [new Paragraph(inst.text)] }),
                    new TableCell({ children: [new Paragraph(result)] }),
                  ],
                });
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "Catatan / Rekomendasi:", bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: stageData.notes || "Tidak ada catatan.", italics: true })] }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: "none" as any },
              bottom: { style: "none" as any },
              left: { style: "none" as any },
              right: { style: "none" as any },
              insideHorizontal: { style: "none" as any },
              insideVertical: { style: "none" as any },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph("Guru yang Disupervisi,"),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph("(....................................)"),
                      new Paragraph(`Nama: ${supervision.teacher_name}`),
                      new Paragraph(`NIP: ${supervision.teacher_nip || "-"}`),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph("Supervisor / Kepala Sekolah,"),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph("(....................................)"),
                      new Paragraph(`Nama: ${supervision.principal_name}`),
                      new Paragraph(`NIP: ${supervision.principal_nip || "-"}`),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Supervisi_${stageName}_${supervision.teacher_name}.docx`);
  };

  const generateWord = async () => {
    if (!supervision) return;

    const logoGov = school?.logo_gov || supervision.logo_gov;
    const logoSchool = school?.logo_school || supervision.logo_school;
    const headerText = school?.header_text || supervision.header_text || "DINAS PENDIDIKAN\nLAPORAN SUPERVISI AKADEMIK";

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Kop Surat Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: "none" as any },
              bottom: { style: "none" as any },
              left: { style: "none" as any },
              right: { style: "none" as any },
              insideHorizontal: { style: "none" as any },
              insideVertical: { style: "none" as any },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    children: logoGov ? [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: base64ToUint8Array(logoGov),
                            transformation: { width: 60, height: 60 },
                          } as any),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ] : [],
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: headerText.split('\n').map(line => 
                      new Paragraph({
                        children: [new TextRun({ text: line, bold: true, size: 24 })],
                        alignment: AlignmentType.CENTER,
                      })
                    ),
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    children: logoSchool ? [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: base64ToUint8Array(logoSchool),
                            transformation: { width: 60, height: 60 },
                          } as any),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ] : [],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "________________________________________________________________________________", alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "REKAPITULASI HASIL SUPERVISI AKADEMIK", bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: `Nama Guru: ${supervision.teacher_name}`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `NIP: ${supervision.teacher_nip || "-"}`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `Nama Kepala Sekolah: ${supervision.principal_name}`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `Tanggal: ${new Date(supervision.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `Skor Akhir: ${supervision.final_score?.toFixed(1) || "-"}%`, bold: true })] }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tahap", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Skor (%)", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Catatan / Rekomendasi", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Administrasi")] }),
                  new TableCell({ children: [new Paragraph(calculateScore(1, stage1).toFixed(1))] }),
                  new TableCell({ children: [new Paragraph(stage1.notes || "-")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Telaah ATP")] }),
                  new TableCell({ children: [new Paragraph(calculateScore(2, stage2).toFixed(1))] }),
                  new TableCell({ children: [new Paragraph(stage2.notes || "-")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Telaah Modul Ajar")] }),
                  new TableCell({ children: [new Paragraph(calculateScore(3, stage3).toFixed(1))] }),
                  new TableCell({ children: [new Paragraph(stage3.notes || "-")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Pra Observasi")] }),
                  new TableCell({ children: [new Paragraph("-")] }),
                  new TableCell({ children: [new Paragraph(stage4.notes || "-")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Pelaksanaan")] }),
                  new TableCell({ children: [new Paragraph(calculateScore(5, stage5).toFixed(1))] }),
                  new TableCell({ children: [new Paragraph(stage5.notes || "-")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Pasca Observasi")] }),
                  new TableCell({ children: [new Paragraph("-")] }),
                  new TableCell({ children: [new Paragraph(stage6.notes || "-")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Refleksi & RTL")] }),
                  new TableCell({ children: [new Paragraph(calculateScore(7, stage7).toFixed(1))] }),
                  new TableCell({ children: [new Paragraph(stage7.notes || "-")] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "Kesimpulan & Rekomendasi Akhir:", bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: supervision.recommendations || "-", italics: true })] }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: "none" as any },
              bottom: { style: "none" as any },
              left: { style: "none" as any },
              right: { style: "none" as any },
              insideHorizontal: { style: "none" as any },
              insideVertical: { style: "none" as any },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph("Guru yang Disupervisi,"),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph("(....................................)"),
                      new Paragraph(`Nama: ${supervision.teacher_name}`),
                      new Paragraph(`NIP: ${supervision.teacher_nip || "-"}`),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph("Supervisor / Kepala Sekolah,"),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph("(....................................)"),
                      new Paragraph(`Nama: ${supervision.principal_name}`),
                      new Paragraph(`NIP: ${supervision.principal_nip || "-"}`),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Rekap_Supervisi_${supervision.teacher_name}.docx`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium animate-pulse">Memuat detail supervisi...</p>
      </div>
    );
  }

  if (!supervision) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-3xl border border-black/5 shadow-sm">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
          <FileText size={40} className="text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Supervisi Tidak Ditemukan</h2>
        <p className="text-zinc-500 mb-8">Data supervisi yang Anda cari mungkin telah dihapus atau Anda tidak memiliki akses.</p>
        <button 
          onClick={() => navigate('/supervisi')}
          className="px-8 py-3 bg-[#141414] text-white rounded-2xl font-bold shadow-lg hover:bg-zinc-800 transition-all"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const stages = [
    { id: 1, name: "1. Administrasi", icon: <FileText size={18} /> },
    { id: 2, name: "2. Telaah ATP", icon: <PenTool size={18} /> },
    { id: 3, name: "3. Telaah Modul", icon: <PenTool size={18} /> },
    { id: 4, name: "4. Pra Observasi", icon: <MessageSquare size={18} /> },
    { id: 5, name: "5. Pelaksanaan", icon: <Play size={18} /> },
    { id: 6, name: "6. Pasca Observasi", icon: <MessageSquare size={18} /> },
    { id: 7, name: "7. Refleksi", icon: <Award size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-20 print:pb-0 print:space-y-0">
      {/* COVER PAGE (Only visible when printing) */}
      <div className="hidden print:flex p-[20mm] min-h-[297mm] flex-col items-center justify-center text-black font-serif text-center relative bg-white">
        <div className="absolute top-[20mm] left-[20mm] right-[20mm] bottom-[20mm] border-4 border-double border-black pointer-events-none"></div>
        
        <div className="space-y-8 z-10 w-full px-12">
          <h1 className="text-3xl font-bold uppercase leading-relaxed">
            LAPORAN HASIL AKHIR<br />
            SUPERVISI AKADEMIK
          </h1>
          
          <div className="flex justify-center items-center gap-8 py-12">
            {(school?.logo_gov || supervision.logo_gov) && (
              <img src={school?.logo_gov || supervision.logo_gov} alt="Logo Pemerintah" className="w-32 h-32 object-contain" referrerPolicy="no-referrer" />
            )}
            {(school?.logo_school || supervision.logo_school) && (
              <img src={school?.logo_school || supervision.logo_school} alt="Logo Sekolah" className="w-32 h-32 object-contain" referrerPolicy="no-referrer" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xl">Disusun Oleh:</p>
            <p className="text-2xl font-bold uppercase">{supervision.teacher_name}</p>
            <p className="text-xl">NIP. {supervision.teacher_nip || '-'}</p>
          </div>

          <div className="pt-12 space-y-2">
            <p className="text-xl">Supervisor:</p>
            <p className="text-2xl font-bold uppercase">{supervision.principal_name}</p>
            <p className="text-xl">NIP. {supervision.principal_nip || '-'}</p>
          </div>

          <div className="pt-24 space-y-2">
            <h3 className="text-2xl font-bold uppercase">{school?.name || supervision.school_name || "SEKOLAH DASAR"}</h3>
            <p className="text-xl">TAHUN PELAJARAN {new Date(supervision.date).getFullYear()}/{new Date(supervision.date).getFullYear() + 1}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/supervisi')} className="p-2 hover:bg-white rounded-xl border border-black/5 shadow-sm transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-serif italic font-bold text-zinc-900">{supervision.teacher_name}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-xs text-zinc-400 uppercase tracking-widest">{new Date(supervision.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${supervision.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {supervision.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
              >
                {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setShowGuide(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-black/5 rounded-xl shadow-sm hover:bg-zinc-50 transition-all text-sm font-bold text-emerald-600"
          >
            <HelpCircle size={18} />
            <span className="hidden sm:inline">Panduan</span>
          </button>
          <button 
            onClick={generatePDF}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-black/5 rounded-xl shadow-sm hover:bg-zinc-50 transition-all text-sm font-bold"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Rekap PDF</span>
          </button>
          <button 
            onClick={generateWord}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-black/5 rounded-xl shadow-sm hover:bg-zinc-50 transition-all text-sm font-bold"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Rekap Word</span>
          </button>
          <div className="flex items-center bg-white border border-black/5 rounded-xl shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-r border-black/5 flex items-center space-x-2">
              <FileText size={18} className="text-zinc-400" />
              <span className="text-sm font-bold hidden sm:inline">Cover:</span>
            </div>
            <button 
              onClick={() => window.print()}
              className="px-3 py-2 hover:bg-zinc-50 transition-all text-[10px] font-bold uppercase tracking-tighter border-r border-black/5"
              title="Cetak Jilid (Print)"
            >
              Print
            </button>
            <button 
              onClick={generateCoverPDF}
              className="px-3 py-2 hover:bg-zinc-50 transition-all text-[10px] font-bold uppercase tracking-tighter border-r border-black/5"
            >
              PDF
            </button>
            <button 
              onClick={generateCoverWord}
              className="px-3 py-2 hover:bg-zinc-50 transition-all text-[10px] font-bold uppercase tracking-tighter"
            >
              Word
            </button>
          </div>
          <button 
            onClick={() => handleSaveStage()}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-[#141414] text-white rounded-xl shadow-lg hover:bg-zinc-800 transition-all text-sm font-bold disabled:opacity-50"
          >
            <Save size={18} />
            <span className="hidden sm:inline">{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm print:hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center">
            <Play size={16} className="mr-2 text-emerald-500" />
            Progres Supervisi
          </h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {Math.round(((supervision.status === 'SELESAI' ? 7 : activeStage - 1) / 7) * 100)}% Selesai
          </span>
        </div>
        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((supervision.status === 'SELESAI' ? 7 : activeStage - 1) / 7) * 100}%` }}
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          />
        </div>
        <div className="grid grid-cols-7 gap-2 mt-4">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div key={s} className="flex flex-col items-center space-y-1">
              <div className={`w-full h-1 rounded-full ${activeStage >= s ? 'bg-emerald-500' : 'bg-zinc-100'}`} />
              <span className={`text-[8px] font-bold uppercase tracking-tighter ${activeStage === s ? 'text-emerald-600' : 'text-zinc-400'}`}>
                Tahap {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Navigation */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-black/5 shadow-sm overflow-x-auto no-scrollbar print:hidden">
        {stages.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStage(s.id)}
            className={`flex-1 min-w-[140px] flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${activeStage === s.id ? 'bg-[#141414] text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}
          >
            {s.icon}
            <span className="text-sm font-bold whitespace-nowrap">{s.name}</span>
          </button>
        ))}
      </div>

      {/* Stage Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden print:hidden"
        >
          {activeStage === 1 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Tahap 1: Supervisi Administrasi</h3>
                  {supervision.stage1_date && (
                    <p className="text-xs text-zinc-400 mt-1 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Jadwal: {new Date(supervision.stage1_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Skor Tahap</p>
                  <p className="text-2xl font-bold text-emerald-600">{calculateScore(1, stage1).toFixed(1)}%</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => generateStagePDF(1)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => generateStageWord(1)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>Word</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {STAGE1_INSTRUMENTS.map((item) => (
                  <div key={item.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {item.id}
                      </div>
                      <span className="font-bold text-zinc-800">{item.text}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { val: 0, label: "Tidak Ada" },
                        { val: 1, label: "Ada Tidak Sesuai" },
                        { val: 2, label: "Ada Sesuai" }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => setStage1({ ...stage1, items: { ...stage1.items, [item.id]: opt.val } })}
                          className={`py-3 rounded-xl border font-bold text-[10px] uppercase tracking-tighter transition-all ${stage1.items[item.id] === opt.val ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-zinc-200 text-zinc-400 hover:border-emerald-200'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catatan Kepala Sekolah</label>
                  <button 
                    onClick={generateAINotes}
                    disabled={isGenerating}
                    className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    <span>{isGenerating ? 'Mengenerate...' : 'Generate dengan AI'}</span>
                  </button>
                </div>
                <textarea 
                  value={stage1.notes}
                  onChange={(e) => setStage1({ ...stage1, notes: e.target.value })}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[120px]"
                  placeholder="Berikan catatan atau masukan terkait administrasi guru..."
                />
              </div>
            </div>
          )}

          {activeStage === 2 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Tahap 2: Telaah ATP</h3>
                  {supervision.stage2_date && (
                    <p className="text-xs text-zinc-400 mt-1 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Jadwal: {new Date(supervision.stage2_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Skor Tahap</p>
                  <p className="text-2xl font-bold text-emerald-600">{calculateScore(2, stage2).toFixed(1)}%</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => generateStagePDF(2)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => generateStageWord(2)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>Word</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {STAGE2_INSTRUMENTS.map((item) => (
                  <div key={item.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {item.id}
                      </div>
                      <span className="font-bold text-zinc-800">{item.text}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((val) => (
                        <button
                          key={val}
                          onClick={() => setStage2({ ...stage2, items: { ...stage2.items, [item.id]: val } })}
                          className={`py-3 rounded-xl border font-bold transition-all ${stage2.items[item.id] === val ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-zinc-200 text-zinc-400 hover:border-emerald-200'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catatan Telaah ATP</label>
                  <button 
                    onClick={generateAINotes}
                    disabled={isGenerating}
                    className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    <span>{isGenerating ? 'Mengenerate...' : 'Generate dengan AI'}</span>
                  </button>
                </div>
                <textarea 
                  value={stage2.notes}
                  onChange={(e) => setStage2({ ...stage2, notes: e.target.value })}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[120px]"
                  placeholder="Berikan catatan perbaikan ATP..."
                />
              </div>
            </div>
          )}

          {activeStage === 3 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Tahap 3: Telaah Modul Ajar</h3>
                  {supervision.stage3_date && (
                    <p className="text-xs text-zinc-400 mt-1 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Jadwal: {new Date(supervision.stage3_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Skor Tahap</p>
                  <p className="text-2xl font-bold text-emerald-600">{calculateScore(3, stage3).toFixed(1)}%</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => generateStagePDF(3)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => generateStageWord(3)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>Word</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {STAGE3_INSTRUMENTS.map((item) => (
                  <div key={item.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {item.id}
                      </div>
                      <span className="font-bold text-zinc-800">{item.text}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((val) => (
                        <button
                          key={val}
                          onClick={() => setStage3({ ...stage3, items: { ...stage3.items, [item.id]: val } })}
                          className={`py-3 rounded-xl border font-bold transition-all ${stage3.items[item.id] === val ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-zinc-200 text-zinc-400 hover:border-emerald-200'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catatan Telaah Modul Ajar</label>
                  <button 
                    onClick={generateAINotes}
                    disabled={isGenerating}
                    className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    <span>{isGenerating ? 'Mengenerate...' : 'Generate dengan AI'}</span>
                  </button>
                </div>
                <textarea 
                  value={stage3.notes}
                  onChange={(e) => setStage3({ ...stage3, notes: e.target.value })}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[120px]"
                  placeholder="Berikan catatan perbaikan Modul Ajar..."
                />
              </div>
            </div>
          )}

          {activeStage === 4 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Tahap 4: Instrumen Percakapan Pra Observasi</h3>
                  <p className="text-xs text-zinc-400 mt-1">Lakukan wawancara coaching sebelum observasi kelas.</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => generateStagePDF(4)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => generateStageWord(4)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>Word</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {PRE_OBSERVATION_INSTRUMENTS.map((item) => (
                  <div key={item.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {item.id.split('.')[1]}
                      </div>
                      <span className="font-bold text-zinc-800">{item.text}</span>
                    </div>
                    <textarea 
                      value={stage4.items[item.id] as string || ""}
                      onChange={(e) => setStage4({ ...stage4, items: { ...stage4.items, [item.id]: e.target.value } })}
                      className="w-full p-4 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px] text-sm"
                      placeholder="Input catatan supervisor..."
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catatan Tambahan Pra Observasi</label>
                  <button 
                    onClick={generateAINotes}
                    disabled={isGenerating}
                    className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    <span>{isGenerating ? 'Mengenerate...' : 'Generate dengan AI'}</span>
                  </button>
                </div>
                <textarea 
                  value={stage4.notes}
                  onChange={(e) => setStage4({ ...stage4, notes: e.target.value })}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[120px]"
                  placeholder="Berikan kesimpulan atau catatan tambahan..."
                />
              </div>
            </div>
          )}

          {activeStage === 5 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Tahap 5: Supervisi Pelaksanaan</h3>
                  {supervision.stage4_date && (
                    <p className="text-xs text-zinc-400 mt-1 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Jadwal: {new Date(supervision.stage4_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="bg-[#141414] text-white px-6 py-3 rounded-2xl flex items-center space-x-4 shadow-xl">
                      <div className="text-2xl font-mono font-bold">{formatTime(timer)}</div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button onClick={() => { setTimer(0); setIsTimerRunning(false); }} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          <RotateCcw size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 italic">Gunakan timer untuk memantau durasi observasi kelas.</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Skor Tahap</p>
                  <p className="text-2xl font-bold text-emerald-600">{calculateScore(5, stage5).toFixed(1)}%</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => generateStagePDF(5)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => generateStageWord(5)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>Word</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {STAGE4_INSTRUMENTS.map((item) => (
                  <div key={item.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {item.id}
                      </div>
                      <span className="font-bold text-zinc-800">{item.text}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((val) => (
                        <button
                          key={val}
                          onClick={() => setStage5({ ...stage5, items: { ...stage5.items, [item.id]: val } })}
                          className={`py-3 rounded-xl border font-bold transition-all ${stage5.items[item.id] === val ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-zinc-200 text-zinc-400 hover:border-emerald-200'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catatan Observasi Langsung</label>
                  <button 
                    onClick={generateAINotes}
                    disabled={isGenerating}
                    className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    <span>{isGenerating ? 'Mengenerate...' : 'Generate dengan AI'}</span>
                  </button>
                </div>
                <textarea 
                  value={stage5.notes}
                  onChange={(e) => setStage5({ ...stage5, notes: e.target.value })}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[120px]"
                  placeholder="Input catatan kejadian penting selama observasi..."
                />
              </div>
            </div>
          )}

          {activeStage === 6 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Tahap 6: Instrumen Supervisi Pasca Observasi</h3>
                  <p className="text-xs text-zinc-400 mt-1">Lakukan wawancara coaching setelah observasi kelas.</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => generateStagePDF(6)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => generateStageWord(6)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>Word</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {POST_OBSERVATION_INSTRUMENTS.map((item) => (
                  <div key={item.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {item.id.split('.')[1]}
                      </div>
                      <span className="font-bold text-zinc-800">{item.text}</span>
                    </div>
                    <textarea 
                      value={stage6.items[item.id] as string || ""}
                      onChange={(e) => setStage6({ ...stage6, items: { ...stage6.items, [item.id]: e.target.value } })}
                      className="w-full p-4 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px] text-sm"
                      placeholder="Input catatan supervisor..."
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-6">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catatan Observer</label>
                  <textarea 
                    value={stage6.notes}
                    onChange={(e) => setStage6({ ...stage6, notes: e.target.value })}
                    className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px]"
                    placeholder="Input catatan observer..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kesepakatan Tindak Lanjut</label>
                  <textarea 
                    value={stage6.items['kesepakatan'] as string || ""}
                    onChange={(e) => setStage6({ ...stage6, items: { ...stage6.items, kesepakatan: e.target.value } })}
                    className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px]"
                    placeholder="Input kesepakatan tindak lanjut..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeStage === 7 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Tahap 7: Refleksi & RTL</h3>
                  {supervision.stage5_date && (
                    <p className="text-xs text-zinc-400 mt-1 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Jadwal: {new Date(supervision.stage5_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Skor Akhir Estimasi</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {((calculateScore(1, stage1) + calculateScore(2, stage2) + calculateScore(3, stage3) + calculateScore(5, stage5) + calculateScore(7, stage7)) / 5).toFixed(1)}%
                  </p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => generateStagePDF(7)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={() => generateStageWord(7)}
                      className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Download size={12} />
                      <span>Word</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-6">
                  {STAGE5_INSTRUMENTS.map((item) => (
                    <div key={item.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                          {item.id}
                        </div>
                        <span className="font-bold text-zinc-800">{item.text}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((val) => (
                          <button
                            key={val}
                            onClick={() => setStage7({ ...stage7, items: { ...stage7.items, [item.id]: val } })}
                            className={`py-3 rounded-xl border font-bold transition-all ${stage7.items[item.id] === val ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-zinc-200 text-zinc-400 hover:border-emerald-200'}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-emerald-800 font-bold flex items-center">
                      <Award className="mr-2" size={20} />
                      Rencana Tindak Lanjut (RTL)
                    </h4>
                    <button 
                      onClick={generateAINotes}
                      disabled={isGenerating}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50 bg-white px-3 py-1.5 rounded-full shadow-sm"
                    >
                      <Sparkles size={12} />
                      <span>{isGenerating ? 'Mengenerate...' : 'Generate RTL dengan AI'}</span>
                    </button>
                  </div>
                  <textarea 
                    value={stage7.notes}
                    onChange={(e) => setStage7({ ...stage7, notes: e.target.value })}
                    className="w-full p-4 bg-white border border-emerald-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[120px]"
                    placeholder="Tuliskan langkah konkret perbaikan dan target waktu..."
                  />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-zinc-900 text-white rounded-3xl shadow-xl gap-8">
                  <div className="text-center md:text-left">
                    <h4 className="text-lg font-bold">Finalisasi Supervisi</h4>
                    <p className="text-white/50 text-xs mt-1">Dengan menekan tombol ini, status supervisi akan menjadi SELESAI dan laporan akan dikunci.</p>
                  </div>
                  <button 
                    onClick={() => handleSaveStage('SELESAI')}
                    disabled={saving}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-3 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        <span>Selesaikan & Tanda Tangan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Quick Stats Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-black/5 px-8 py-3 flex items-center justify-center space-x-6 z-20 overflow-x-auto no-scrollbar print:hidden">
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">S1: {calculateScore(1, stage1).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">S2: {calculateScore(2, stage2).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">S3: {calculateScore(3, stage3).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">S5: {calculateScore(5, stage5).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">S7: {calculateScore(7, stage7).toFixed(0)}%</span>
        </div>
        <div className="h-4 w-px bg-zinc-200 mx-2"></div>
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-tighter">Skor Akhir: {supervision.final_score?.toFixed(1) || "0.0"}%</span>
        </div>
      </div>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-zinc-50">
                <h3 className="text-xl font-bold flex items-center">
                  <HelpCircle className="mr-2 text-emerald-500" size={24} />
                  Panduan Langkah Supervisi
                </h3>
                <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-zinc-900">Tahap 1: Administrasi</h4>
                      <p className="text-sm text-zinc-500 mt-1">Periksa kelengkapan dokumen administrasi guru seperti Kalender Pendidikan, Prota, Promes, ATP, Modul Ajar, dll. Centang item yang tersedia.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-zinc-900">Tahap 2: Telaah ATP</h4>
                      <p className="text-sm text-zinc-500 mt-1">Lakukan penelaahan terhadap Alur Tujuan Pembelajaran (ATP). Berikan skor 1-4 untuk setiap kriteria yang ada.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-zinc-900">Tahap 3: Telaah Modul Ajar</h4>
                      <p className="text-sm text-zinc-500 mt-1">Lakukan penelaahan terhadap Modul Ajar yang disusun guru. Berikan skor 1-4 untuk setiap kriteria.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-bold text-zinc-900">Tahap 4: Pra-Observasi</h4>
                      <p className="text-sm text-zinc-500 mt-1">Lakukan wawancara coaching sebelum observasi kelas. Catat poin-poin penting kesepakatan.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">5</div>
                    <div>
                      <h4 className="font-bold text-zinc-900">Tahap 5: Pelaksanaan Pembelajaran</h4>
                      <p className="text-sm text-zinc-500 mt-1">Observasi langsung di kelas. Gunakan timer untuk mencatat durasi. Berikan skor 1-4 berdasarkan pengamatan nyata.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">6</div>
                    <div>
                      <h4 className="font-bold text-zinc-900">Tahap 6: Pasca-Observasi</h4>
                      <p className="text-sm text-zinc-500 mt-1">Lakukan wawancara coaching setelah observasi kelas. Diskusikan hasil dan tindak lanjut.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">7</div>
                    <div>
                      <h4 className="font-bold text-zinc-900">Tahap 7: Refleksi & RTL</h4>
                      <p className="text-sm text-zinc-500 mt-1">Diskusikan hasil supervisi dengan guru. Isi refleksi dan Rencana Tindak Lanjut (RTL). Gunakan AI untuk membantu merumuskan RTL.</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Catatan:</strong> Pastikan Anda menekan tombol <strong>"Simpan Progres"</strong> di setiap tahap sebelum berpindah ke tahap berikutnya untuk memastikan data tersimpan dengan aman.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-black/5 flex justify-end">
                <button 
                  onClick={() => setShowGuide(false)}
                  className="px-8 py-3 bg-[#141414] text-white rounded-2xl font-bold shadow-lg hover:bg-zinc-800 transition-all"
                >
                  Mengerti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
