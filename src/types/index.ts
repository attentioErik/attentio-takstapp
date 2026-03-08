export type ConditionGrade = 'TG0' | 'TG1' | 'TG2' | 'TG3' | 'TGIU';
export type ReportType = 'tilstandsrapport' | 'verditakst' | 'forhandstakst';
export type ReportStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
export type PropertyType = 'enebolig' | 'rekkehus' | 'leilighet' | 'fritidsbolig' | 'tomannsbolig';

export interface SectionImage {
  id: string;
  url: string;
  caption?: string;
  sortOrder?: number;
}

export interface MoistureMeasurement {
  location: string;
  value: number;
  unit: string;
  method: string;
  date?: string;
}

export interface ReportWithSections {
  id: string;
  userId: string;
  reportNumber: string;
  type: ReportType;
  status: ReportStatus;
  propertyAddress: string;
  postalCode?: string | null;
  city?: string | null;
  municipality?: string | null;
  gnr?: string | null;
  bnr?: string | null;
  snr?: string | null;
  fnr?: string | null;
  propertyType?: PropertyType | null;
  constructionYear?: number | null;
  bra?: number | null;
  prom?: number | null;
  numberOfFloors?: number | null;
  client?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  inspectionDate?: Date | string | null;
  reportDate?: Date | string | null;
  marketValue?: number | null;
  loanValue?: number | null;
  technicalValue?: number | null;
  plotValue?: number | null;
  rawNotes?: string | null;
  aiProcessedAt?: Date | string | null;
  summary?: string | null;
  totalRepairCost?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  sections?: BuildingSectionData[];
}

export interface BuildingSectionData {
  id: string;
  reportId: string;
  category: string;
  subcategory?: string | null;
  name: string;
  conditionGrade?: ConditionGrade | null;
  description?: string | null;
  observations?: string | null;
  cause?: string | null;
  consequence?: string | null;
  repairCost?: number | null;
  repairCostMin?: number | null;
  repairCostMax?: number | null;
  moistureMeasurements?: MoistureMeasurement[] | null;
  images?: SectionImage[] | null;
  sortOrder?: number;
  isRequired?: boolean;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export interface TGDistribution {
  TG0: number;
  TG1: number;
  TG2: number;
  TG3: number;
  TGIU: number;
}

export interface DashboardStats {
  totalReports: number;
  completedThisMonth: number;
  inProgress: number;
  avgTGDistribution: TGDistribution;
}

export interface WizardFormData {
  // Step 1
  type: ReportType;
  propertyAddress: string;
  postalCode: string;
  city: string;
  municipality: string;
  gnr: string;
  bnr: string;
  snr: string;
  fnr: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  // Step 2
  propertyType: PropertyType;
  constructionYear: number;
  bra: number;
  prom: number;
  numberOfFloors: number;
  inspectionDate: string;
  // Step 3
  rawNotes: string;
  // Step 4 populated by AI
  sections: Partial<BuildingSectionData>[];
}
