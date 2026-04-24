export interface PatientDetails {
  name: string;
  age: string;
  gender: string;
  reportId: string;
  collectionDate: string;
  generationDate: string;
}

export interface VitalityScores {
  overall: number;
  liver: number;
  metabolism: number;
}

export interface TestResult {
  parameter: string;
  result: string | number;
  unit: string;
  refRange: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
}

export interface ReportData {
  patient: PatientDetails;
  scores: VitalityScores;
  results: TestResult[];
  remarks: string;
  aiInsights: string[];
}
