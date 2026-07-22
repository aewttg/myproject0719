import { IndustryBenchmark, AnalysisResult, TargetCompanyPreset, AIFeedback, AIPriority } from '../types';

export function runClientSideAnalysis(params: {
  selectedIndustry: IndustryBenchmark;
  companyName: string;
  revenue: number; // 억 원
  energyUsage: number;
  renewableRate: number;
  ghgEmissions: number;
  wasteAmount: number;
  recyclingRate: number;
  hasTarget: boolean;
  hasDisclosure: boolean;
  disclosureScore: number;
  socialScore: number;
  targetCompany?: string;
}): AnalysisResult {
  const {
    selectedIndustry,
    companyName,
    revenue,
    energyUsage,
    renewableRate,
    ghgEmissions,
    wasteAmount,
    recyclingRate,
    hasTarget,
    hasDisclosure,
    disclosureScore,
    socialScore,
    targetCompany
  } = params;

  // Revenue in Billion KRW (10억 원 단위)
  const revenueInBillion = revenue / 10;
  
  // Calculate intensities
  const userEnergyIntensity = revenueInBillion > 0 ? energyUsage / revenueInBillion : 0;
  const userGhgIntensity = revenueInBillion > 0 ? ghgEmissions / revenueInBillion : 0;
  const userWasteIntensity = revenueInBillion > 0 ? wasteAmount / revenueInBillion : 0;

  // Target Company details if matched or fallback preset
  let targetCompanyDetail: TargetCompanyPreset | undefined = undefined;
  if (targetCompany && targetCompany.trim()) {
    const trimmed = targetCompany.trim();
    const matchedInIndustry = selectedIndustry.targetCompanies?.find(c => c.name.toLowerCase().includes(trimmed.toLowerCase()));
    if (matchedInIndustry) {
      targetCompanyDetail = matchedInIndustry;
    } else {
      // Dynamic fallback preset for popular target companies
      const lower = trimmed.toLowerCase();
      if (lower.includes('apple') || lower.includes('애플')) {
        targetCompanyDetail = {
          name: '애플 (Apple)',
          energyIntensity: 8.5,
          renewableRate: 100,
          ghgIntensity: 1.2,
          wasteIntensity: 0.05,
          recyclingRate: 90,
          disclosureScore: 98,
          socialScore: 95,
          hasTarget: true,
          hasDisclosure: true,
          highlight: '공급망 RE100 100% 달성 및 제품 100% 탄소중립 보증 로드맵 추진'
        };
      } else if (lower.includes('patagonia') || lower.includes('파타고니아')) {
        targetCompanyDetail = {
          name: '파타고니아 (Patagonia)',
          energyIntensity: 12.0,
          renewableRate: 95,
          ghgIntensity: 2.1,
          wasteIntensity: 0.1,
          recyclingRate: 95,
          disclosureScore: 94,
          socialScore: 98,
          hasTarget: true,
          hasDisclosure: true,
          highlight: '유기농/재생 섬유 100% 사용 및 지구 환경 기급 1% 지불 체계 확립'
        };
      } else if (lower.includes('풀무원') || lower.includes('pulmuone')) {
        targetCompanyDetail = {
          name: '풀무원',
          energyIntensity: 95.0,
          renewableRate: 48,
          ghgIntensity: 18.5,
          wasteIntensity: 1.2,
          recyclingRate: 88,
          disclosureScore: 90,
          socialScore: 92,
          hasTarget: true,
          hasDisclosure: true,
          highlight: '식물성 지향 식품 확대 및 자원 재활용 포장재 전면 적용'
        };
      } else {
        targetCompanyDetail = {
          name: trimmed,
          energyIntensity: Math.round(selectedIndustry.energyIntensity * 0.75),
          renewableRate: Math.min(100, Math.round(selectedIndustry.renewableRate * 1.3)),
          ghgIntensity: Number((selectedIndustry.ghgIntensity * 0.7).toFixed(1)),
          wasteIntensity: Number((selectedIndustry.wasteIntensity * 0.65).toFixed(2)),
          recyclingRate: Math.min(100, Math.round(selectedIndustry.recyclingRate * 1.15)),
          disclosureScore: Math.min(100, Math.round(selectedIndustry.disclosureScore * 1.05)),
          socialScore: Math.min(100, Math.round(selectedIndustry.socialScore * 1.05)),
          hasTarget: true,
          hasDisclosure: true,
          highlight: `${trimmed}의 ESG 선도 체계 및 글로벌 지속가능성 리더십`
        };
      }
    }
  }

  // Benchmarks
  const benchmarkEnergy = targetCompanyDetail ? targetCompanyDetail.energyIntensity : selectedIndustry.energyIntensity;
  const benchmarkRenewable = targetCompanyDetail ? targetCompanyDetail.renewableRate : selectedIndustry.renewableRate;
  const benchmarkGhg = targetCompanyDetail ? targetCompanyDetail.ghgIntensity : selectedIndustry.ghgIntensity;
  const benchmarkWaste = targetCompanyDetail ? targetCompanyDetail.wasteIntensity : selectedIndustry.wasteIntensity;
  const benchmarkRecycling = targetCompanyDetail ? targetCompanyDetail.recyclingRate : selectedIndustry.recyclingRate;
  const benchmarkDisclosure = targetCompanyDetail ? targetCompanyDetail.disclosureScore : selectedIndustry.disclosureScore;
  const benchmarkSocial = targetCompanyDetail ? targetCompanyDetail.socialScore : selectedIndustry.socialScore;

  // Gap calculations (%)
  const energyGapPct = benchmarkEnergy > 0 ? Number((((userEnergyIntensity - benchmarkEnergy) / benchmarkEnergy) * 100).toFixed(1)) : 0;
  const renewableGapPct = Number((benchmarkRenewable - renewableRate).toFixed(1));
  const ghgGapPct = benchmarkGhg > 0 ? Number((((userGhgIntensity - benchmarkGhg) / benchmarkGhg) * 100).toFixed(1)) : 0;
  const wasteGapPct = benchmarkWaste > 0 ? Number((((userWasteIntensity - benchmarkWaste) / benchmarkWaste) * 100).toFixed(1)) : 0;
  const recyclingGapPct = Number((benchmarkRecycling - recyclingRate).toFixed(1));
  const disclosureGapPct = Number((benchmarkDisclosure - disclosureScore).toFixed(1));
  const socialGapPct = Number((benchmarkSocial - socialScore).toFixed(1));

  const targetName = targetCompanyDetail ? targetCompanyDetail.name : '산업 우수 기업';

  // Construct Priorities
  const priorities: AIPriority[] = [
    {
      category: 'energy',
      categoryName: '에너지 & RE100',
      title: '에너지 사용 효율화 및 재생에너지(RE100) 조기 도입',
      rank: 1,
      gapDescription: userEnergyIntensity > benchmarkEnergy
        ? `에너지 소모 강도가 벤치마크 대비 ${energyGapPct}% 초과 상태입니다.`
        : `에너지 효율성은 양호하나 재생에너지 비율(${renewableRate}%)의 상향이 필요합니다.`,
      whyItMatters: '글로벌 공급망 탄소중립 요구와 Scope 2 전력 사용 비용 절감을 위한 핵심 과제입니다.',
      actionPlan: [
        '공정 고효율 모터 및 변속 드라이브(VFD) 교체',
        '태양광 자가발전 인프라 구축 및 재생에너지 PPA 계약 추진',
        '피크 전력 모니터링 FEMS 시스템 도입'
      ]
    },
    {
      category: 'waste',
      categoryName: '자원순환 & 폐기물',
      title: '공정 부산물 재자원화 및 폐기물 제로화(ZWTL)',
      rank: 2,
      gapDescription: `폐기물 발생 강도는 ${userWasteIntensity.toFixed(2)}톤이며 자원 재활용률은 ${recyclingRate}%입니다.`,
      whyItMatters: '순환경제 기본법 대응 및 폐기물 처리비용 감축을 통해 제조 원가율을 직접 개선합니다.',
      actionPlan: [
        '폐기물 분리 배출 매뉴얼 고도화 및 재활용 가능 소재 분류 확대',
        '친환경 자원순환 전문 업체와의 전략적 제휴를 통한 순환자원 인정 확보',
        '포장재 재생 소재(PCR) 50% 이상 적용'
      ]
    },
    {
      category: 'disclosure',
      categoryName: 'ESG 정보공시 & 거버넌스',
      title: '국제 표준(GRI, ISSB) 기반 지속가능경영 공시 체계 강화',
      rank: 3,
      gapDescription: `정보공시 및 사회적 책임 점수가 ${disclosureScore}점으로, 선도기업(${benchmarkDisclosure}점) 수준으로 상향 필요합니다.`,
      whyItMatters: '투명한 공시는 투자 유치 및 금융기관 ESG 평가 우대 금리 혜택의 필수 요건입니다.',
      actionPlan: [
        'Scope 1, 2, 3 온실가스 배출량 제3자 제3자 검증서 확보',
        'GRI Standards 2021 가이드라인 준수 지속가능경영보고서 발간',
        '협력사 ESG 가이드라인 수립 및 정기 위험도 측정'
      ]
    }
  ];

  const aiFeedback: AIFeedback = {
    summary: `${companyName}의 지속가능경영 지표 진단 결과, ${selectedIndustry.name} 및 목표 벤치마크 기업인 '${targetName}' 대비 경쟁력 강화 포인트가 도출되었습니다. 현재 매출 10억원당 에너지 강도는 ${userEnergyIntensity.toFixed(1)} MWh, 온실가스 강도는 ${userGhgIntensity.toFixed(1)} tCO2eq 수준입니다.`,
    priorities,
    overallFeedback: `${companyName}은 단기적으로 에너지 효율 개선과 자원 재활용 확대를 통해 온실가스를 저감하고, 중장기적으로 RE100 이행 로드맵과 Scope 3 공시 체계를 정립하여 '${targetName}' 수준의 지속가능 리더십을 확보할 수 있습니다.`
  };

  return {
    companyName,
    industry: selectedIndustry,
    revenue,
    targetCompany,
    targetCompanyDetail,
    userCalculated: {
      energyIntensity: userEnergyIntensity,
      renewableRate,
      ghgIntensity: userGhgIntensity,
      wasteIntensity: userWasteIntensity,
      recyclingRate,
      hasTarget,
      hasDisclosure,
      disclosureScore,
      socialScore
    },
    benchmark: {
      energyIntensity: benchmarkEnergy,
      renewableRate: benchmarkRenewable,
      ghgIntensity: benchmarkGhg,
      wasteIntensity: benchmarkWaste,
      recyclingRate: benchmarkRecycling,
      disclosureScore: benchmarkDisclosure,
      socialScore: benchmarkSocial,
      hasTarget: true,
      hasDisclosure: true
    },
    gaps: {
      energyGapPct,
      renewableGapPct,
      ghgGapPct,
      wasteGapPct,
      recyclingGapPct,
      disclosureGapPct,
      socialGapPct
    },
    aiFeedback
  };
}
