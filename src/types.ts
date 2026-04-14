export type Role = 'KEPALA_SEKOLAH' | 'GURU' | 'ADMIN';
export type Status = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface PlannedSchedule {
  ganjil?: {
    stage1?: string;
    stage2?: string;
    stage3?: string;
    stage4?: string;
  };
  genap?: {
    stage1?: string;
    stage2?: string;
    stage3?: string;
    stage4?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  school_id: string;
  nip?: string;
  status: Status;
  teaching_class?: string;
  rank_grade?: string;
  subject?: string;
  planned_schedule?: PlannedSchedule;
}

export interface School {
  id: string;
  name: string;
  address: string;
  header_text: string;
  logo_school?: string;
  logo_gov?: string;
  status: Status;
  academic_year?: string;
}

export interface Supervision {
  id: string;
  teacher_id: string;
  principal_id: string;
  teacher_name?: string;
  teacher_nip?: string;
  principal_name?: string;
  principal_nip?: string;
  date: string;
  status: 'BELUM' | 'PROSES' | 'SELESAI';
  stage1_data?: string;
  stage2_data?: string;
  stage3_data?: string;
  stage4_data?: string;
  stage5_data?: string;
  stage6_data?: string;
  stage7_data?: string;
  stage1_date?: string;
  stage2_date?: string;
  stage3_date?: string;
  stage4_date?: string;
  stage5_date?: string;
  stage6_date?: string;
  stage7_date?: string;
  final_score?: number;
  recommendations?: string;
  school_name?: string;
  school_id?: string;
  header_text?: string;
  logo_school?: string;
  logo_gov?: string;
}

export interface InstrumentItem {
  id: string;
  text: string;
  category?: string;
}

export interface StageData {
  items: { [key: string]: number | boolean | string };
  notes: string;
  score?: number;
}
