export interface TargetCompanyPreset {
  name: string;
  energyIntensity: number; // MWh / 10억원
  renewableRate: number;   // %
  ghgIntensity: number;    // tCO2eq / 10억원
  wasteIntensity: number;  // 톤 / 10억원
  recyclingRate: number;   // %
  disclosureScore: number; // 0-100
  socialScore: number;     // 0-100
  hasTarget: boolean;
  hasDisclosure: boolean;
  highlight: string;
}

export interface IndustryBenchmark {
  id: string;
  name: string;
  energyIntensity: number; // MWh / 10억원 매출
  renewableRate: number;   // %
  ghgIntensity: number;    // tCO2eq / 10억원 매출
  wasteIntensity: number;  // 톤 / 10억원 매출
  recyclingRate: number;    // %
  disclosureScore: number;  // 0-100
  socialScore: number;      // 0-100
  description: string;
  keyChallenge: string;
  targetCompanies: TargetCompanyPreset[];
}

export interface AIPriority {
  category: string;
  categoryName: string;
  title: string;
  rank: number;
  gapDescription: string;
  whyItMatters: string;
  actionPlan: string[];
}

export interface AIFeedback {
  summary: string;
  priorities: AIPriority[];
  overallFeedback: string;
}

export interface AnalysisResult {
  companyName: string;
  industry: IndustryBenchmark;
  revenue: number;
  targetCompany?: string;
  targetCompanyDetail?: TargetCompanyPreset;
  userCalculated: {
    energyIntensity: number;
    renewableRate: number;
    ghgIntensity: number;
    wasteIntensity: number;
    recyclingRate: number;
    hasTarget: boolean;
    hasDisclosure: boolean;
    disclosureScore: number;
    socialScore: number;
  };
  benchmark: {
    energyIntensity: number;
    renewableRate: number;
    ghgIntensity: number;
    wasteIntensity: number;
    recyclingRate: number;
    disclosureScore: number;
    socialScore: number;
    hasTarget: boolean;
    hasDisclosure: boolean;
  };
  gaps: {
    energyGapPct: number;
    renewableGapPct: number;
    ghgGapPct: number;
    wasteGapPct: number;
    recyclingGapPct: number;
    disclosureGapPct: number;
    socialGapPct: number;
  };
  aiFeedback: AIFeedback;
}
