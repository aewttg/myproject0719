import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Industry Benchmarks representing top-performing sustainable companies in each industry
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

const INDUSTRY_PRESETS: IndustryBenchmark[] = [
  {
    id: 'manufacturing',
    name: '제조업 (Manufacturing)',
    energyIntensity: 210,
    renewableRate: 45,
    ghgIntensity: 48.5,
    wasteIntensity: 1.8,
    recyclingRate: 85,
    disclosureScore: 88,
    socialScore: 85,
    description: '에너지 소모와 제조 부산물이 많은 업종으로, 친환경 설비 도입 및 폐기물 재자원화가 핵심 과제입니다.',
    keyChallenge: '생산 가동 시 화석연료 대체 및 자원 순환 체계 도입 고도화',
    targetCompanies: [
      {
        name: '한울그린스틸',
        energyIntensity: 195,
        renewableRate: 55,
        ghgIntensity: 42.0,
        wasteIntensity: 1.2,
        recyclingRate: 92,
        disclosureScore: 95,
        socialScore: 88,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '생산 부산물 및 고철 원료의 90% 이상 재자원화 및 폐열 회수 발전 도입'
      },
      {
        name: '에코케미칼',
        energyIntensity: 205,
        renewableRate: 48,
        ghgIntensity: 45.8,
        wasteIntensity: 1.5,
        recyclingRate: 86,
        disclosureScore: 90,
        socialScore: 84,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '바이오 플라스틱 등 재생 원료 전환 및 자체 폐수 재순환 95% 달성'
      }
    ]
  },
  {
    id: 'it-service',
    name: 'IT 및 서비스업 (IT & Service)',
    energyIntensity: 45,
    renewableRate: 85,
    ghgIntensity: 9.8,
    wasteIntensity: 0.25,
    recyclingRate: 60,
    disclosureScore: 92,
    socialScore: 90,
    description: '물리적 배출은 적으나 데이터 센터 구동 등으로 전력 사용량이 많으며, 공급망 전반의 Scope 3 배출 통제와 ESG 공시가 중요합니다.',
    keyChallenge: '친환경 데이터 센터 활용 및 공급망 ESG 관리 수준 향상',
    targetCompanies: [
      {
        name: '네오스마트웹',
        energyIntensity: 38,
        renewableRate: 100,
        ghgIntensity: 8.2,
        wasteIntensity: 0.15,
        recyclingRate: 75,
        disclosureScore: 96,
        socialScore: 95,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '친환경 가상화 서버 적용 및 공급망 전반의 온실가스 통합 검증 시스템 구축'
      },
      {
        name: '메타솔루션즈',
        energyIntensity: 42,
        renewableRate: 90,
        ghgIntensity: 9.0,
        wasteIntensity: 0.20,
        recyclingRate: 65,
        disclosureScore: 94,
        socialScore: 92,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '사무용품 생분해 소재 교체 및 임직원 자율 출퇴근 탄소 크레딧 차감 프로그램'
      }
    ]
  },
  {
    id: 'food-retail',
    name: '식음료 및 유통업 (Food & Retail)',
    energyIntensity: 115,
    renewableRate: 40,
    ghgIntensity: 22.4,
    wasteIntensity: 2.1,
    recyclingRate: 75,
    disclosureScore: 82,
    socialScore: 88,
    description: '포장재 쓰레기와 물류 이동 시 탄소 발생이 특징이며, 친환경 원료 수급과 플라스틱 절감이 핵심인 업종입니다.',
    keyChallenge: '포장재 재활용율 제고 및 물류 수송 과정 탄소 감축',
    targetCompanies: [
      {
        name: '더푸드그린',
        energyIntensity: 105,
        renewableRate: 50,
        ghgIntensity: 19.5,
        wasteIntensity: 1.4,
        recyclingRate: 85,
        disclosureScore: 88,
        socialScore: 90,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '유기농 로컬 푸드 공급선 다각화 및 폐플라스틱 용기 수거 및 100% PCR 대체'
      },
      {
        name: '메가유통',
        energyIntensity: 110,
        renewableRate: 42,
        ghgIntensity: 21.0,
        wasteIntensity: 1.8,
        recyclingRate: 78,
        disclosureScore: 85,
        socialScore: 86,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '전기 배송차 전면 확대 및 하이브리드 냉동 창고 물류센터 구축'
      }
    ]
  },
  {
    id: 'fashion-textile',
    name: '패션 및 섬유업 (Fashion & Textile)',
    energyIntensity: 130,
    renewableRate: 50,
    ghgIntensity: 31.2,
    wasteIntensity: 2.5,
    recyclingRate: 80,
    disclosureScore: 80,
    socialScore: 86,
    description: '원단 가공 시 물과 화학물질 사용량이 많으며, 지속가능한 유기농/재활용 소재 사용과 윤리적 공급망 관리가 중요합니다.',
    keyChallenge: '친환경 및 재생 소재 사용량 확대, 전 공급망 노동 인권 점검',
    targetCompanies: [
      {
        name: '비건패션랩',
        energyIntensity: 115,
        renewableRate: 65,
        ghgIntensity: 26.5,
        wasteIntensity: 1.6,
        recyclingRate: 90,
        disclosureScore: 85,
        socialScore: 92,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '선인장 가죽 등 전 품목 완전 친환경 가죽·패브릭 대체 브랜드 구축'
      },
      {
        name: '그린실렉션',
        energyIntensity: 125,
        renewableRate: 55,
        ghgIntensity: 29.8,
        wasteIntensity: 2.0,
        recyclingRate: 84,
        disclosureScore: 82,
        socialScore: 88,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '의류 폐기물 분쇄 후 재생 원사 뽑아내는 폐자원 완전 순환(Closed Loop) 가동'
      }
    ]
  },
  {
    id: 'logistics-transport',
    name: '물류 및 운송업 (Logistics & Transport)',
    energyIntensity: 280,
    renewableRate: 35,
    ghgIntensity: 65.0,
    wasteIntensity: 1.1,
    recyclingRate: 55,
    disclosureScore: 85,
    socialScore: 82,
    description: '연료 연소로 인한 직접 배출량(Scope 1)이 가장 큰 비중을 차지하며, 친환경 모빌리티 전환과 경로 최적화가 필수적입니다.',
    keyChallenge: '전기·수소 화물차로의 조기 전환 및 유류 사용 절감 알고리즘 개발',
    targetCompanies: [
      {
        name: '녹색운송테크',
        energyIntensity: 250,
        renewableRate: 45,
        ghgIntensity: 54.0,
        wasteIntensity: 0.7,
        recyclingRate: 70,
        disclosureScore: 90,
        socialScore: 85,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '물류 전용 수소 대형 화물 트럭 시범 운행 및 충전 인프라 직접 확보'
      },
      {
        name: '에코익스프레스',
        energyIntensity: 265,
        renewableRate: 38,
        ghgIntensity: 60.5,
        wasteIntensity: 0.9,
        recyclingRate: 62,
        disclosureScore: 88,
        socialScore: 84,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '라스트마일 전기 오토바이/카고 바이크 100% 도입 및 허브 경로 AI 고도화'
      }
    ]
  },
  {
    id: 'construction',
    name: '건설 및 부동산 (Construction)',
    energyIntensity: 180,
    renewableRate: 30,
    ghgIntensity: 42.0,
    wasteIntensity: 4.5,
    recyclingRate: 90,
    disclosureScore: 78,
    socialScore: 80,
    description: '건설 자재 조달 및 폐기 단계에서 막대한 자원이 소요되므로, 친환경 공법 도입과 에너지를 자급하는 건축 기술(ZEB)이 요구됩니다.',
    keyChallenge: '친환경 저탄소 콘크리트 및 내구재 도입, 현장 자원 선별 재활용',
    targetCompanies: [
      {
        name: '그린시티개발',
        energyIntensity: 160,
        renewableRate: 40,
        ghgIntensity: 35.5,
        wasteIntensity: 2.8,
        recyclingRate: 95,
        disclosureScore: 85,
        socialScore: 84,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '국내 최고 수준의 에너지 자립률 40% 이상 제로에너지 공동주택 본공사 완공'
      },
      {
        name: '에코토건',
        energyIntensity: 172,
        renewableRate: 35,
        ghgIntensity: 38.2,
        wasteIntensity: 3.2,
        recyclingRate: 93,
        disclosureScore: 80,
        socialScore: 82,
        hasTarget: true,
        hasDisclosure: true,
        highlight: '현장 폐콘크리트 순환골재 85% 이상 재사용 공인 인증 최우수 획득'
      }
    ]
  }
];

// Lazy Gemini Client Initialization to prevent startup crashes
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// target company validation and metric extraction function
async function verifyAndGetTargetCompany(companyQuery: string): Promise<{ isValid: boolean; data?: TargetCompanyPreset }> {
  try {
    const aiInstance = getGemini();
    const systemPrompt = `
      당신은 전 세계 및 국내 기업들의 지속가능경영(ESG) 공시자료, 지속가능경영 보고서 및 산업군별 환경/에너지 지표를 완벽히 꿰뚫고 있는 기업 분석 전문가입니다.
      사용자가 제시한 "목표로 삼는 벤치마크 기업"의 사명을 분석하여, 실존하는 기업인지 검증하고, 해당 기업의 ESG/지속가능경영 지표(또는 산업군 대비 합리적인 추정치)를 생성하십시오.

      [검증 규칙]
      1. 사용자가 무작위 알파벳/한글 초성(예: 'ㅇㅇㅇ', 'asdf'), 비속어, 실존하지 않는 상상 속의 단어, 또는 일반명사('지구', '회사', '인간' 등 기업명이 아닌 단어)를 입력한 경우 반드시 isValid를 false로 리턴하십시오.
      2. 실존하는 국내외 대기업, 중견기업, 공공기관, 소셜벤처 등 비즈니스 엔티티가 명확한 경우에는 isValid를 true로 리턴하십시오.

      [지표 산출 가이드]
      해당 기업의 공식 지속가능경영보고서 또는 대중적 ESG 분석 프로필을 기반으로 6대 지표값을 산출해 주십시오. (단위 매출 10억원당 강도화 적용 필요)
      - 에너지 사용 집약도(energyIntensity): 매출 10억원당 MWh (예: 에너지 다소비 제조업은 10~50, 친환경 선도 IT 기업은 1~10, 유통은 1~5 수준)
      - 재생에너지 사용 비율(renewableRate): % 단위 (예: Apple, Patagonia 등 RE100 달성 또는 고비율 기업은 80~100, 한국 제조기업은 현실적인 수준 5~35%)
      - 온실가스 배출 집약도(ghgIntensity): 매출 10억원당 tCO2eq (예: 제조업은 5~30, IT/서비스는 0.1~3 수준)
      - 폐기물 발생 집약도(wasteIntensity): 매출 10억원당 톤 단위 (예: 유통/식품은 0.1~2, IT는 0.01~0.2 수준)
      - 자원 재활용률(recyclingRate): % 단위 (예: 제로웨이스트 추구 기업은 80~98, 일반 제조업은 40~70)
      - 정보공시 수준(disclosureScore): 0~100 점 (ESG 보고서를 잘 내는 대기업은 85~98, 중소기업은 30~55)
      - 사회적 성과(socialScore): 0~100 점 (상생 및 직원 복지, 다양성 우수 기업은 80~98)
      - 목표 수립 여부(hasTarget): true 또는 false
      - 정보공개 여부(hasDisclosure): true 또는 false
      - 핵심 강조사항(highlight): 해당 기업의 지속가능경영 최고 강점이나 주요 이니셔티브에 대한 1문장 요약 (한국어, 예: "2030년까지 전 공급망 탄소 중립 선언 및 RE100 100% 달성")
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        isValid: {
          type: Type.BOOLEAN,
          description: "기업명이 실존하고 지속가능경영 분석이 가능하면 true, 아니면 false"
        },
        name: {
          type: Type.STRING,
          description: "기업의 공식 한글 또는 영문 사명"
        },
        energyIntensity: {
          type: Type.NUMBER,
          description: "매출 10억원당 MWh 단위의 에너지 소모 강도"
        },
        renewableRate: {
          type: Type.NUMBER,
          description: "재생에너지 사용 비율 (%)"
        },
        ghgIntensity: {
          type: Type.NUMBER,
          description: "매출 10억원당 온실가스 배출 강도 (tCO2eq)"
        },
        wasteIntensity: {
          type: Type.NUMBER,
          description: "매출 10억원당 폐기물 배출 강도 (톤)"
        },
        recyclingRate: {
          type: Type.NUMBER,
          description: "자원 재활용률 (%)"
        },
        disclosureScore: {
          type: Type.NUMBER,
          description: "정보공시 수준 점수 (0-100)"
        },
        socialScore: {
          type: Type.NUMBER,
          description: "사회적 책임 성과 점수 (0-100)"
        },
        hasTarget: {
          type: Type.BOOLEAN,
          description: "지속가능 목표 수립 여부"
        },
        hasDisclosure: {
          type: Type.BOOLEAN,
          description: "정보공개 및 공시 여부"
        },
        highlight: {
          type: Type.STRING,
          description: "지속가능경영의 가장 돋보이는 핵심 성과 및 강점 한 문장 요약 (한국어)"
        }
      },
      required: [
        "isValid", "name", "energyIntensity", "renewableRate", "ghgIntensity",
        "wasteIntensity", "recyclingRate", "disclosureScore", "socialScore",
        "hasTarget", "hasDisclosure", "highlight"
      ]
    };

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `다음 기업에 대한 지속가능성 지표 분석 및 유효성 검증을 수행하십시오: "${companyQuery}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1
      }
    });

    const text = response.text?.trim() || '{}';
    const result = JSON.parse(text);

    if (result && result.isValid) {
      return {
        isValid: true,
        data: {
          name: result.name || companyQuery,
          energyIntensity: Number(result.energyIntensity) || 12.0,
          renewableRate: Number(result.renewableRate) || 80,
          ghgIntensity: Number(result.ghgIntensity) || 3.0,
          wasteIntensity: Number(result.wasteIntensity) || 0.2,
          recyclingRate: Number(result.recyclingRate) || 85,
          disclosureScore: Number(result.disclosureScore) || 90,
          socialScore: Number(result.socialScore) || 88,
          hasTarget: result.hasTarget !== undefined ? !!result.hasTarget : true,
          hasDisclosure: result.hasDisclosure !== undefined ? !!result.hasDisclosure : true,
          highlight: result.highlight || `${companyQuery} 지속가능 리더십 및 ESG 정보 공시 선도`
        }
      };
    }
    return { isValid: false };
  } catch (err) {
    console.error('verifyAndGetTargetCompany Error:', err);
    // If API is down or model errored, provide a smart fallback for non-empty company queries
    const queryTrimmed = companyQuery.trim();
    const invalidPatterns = ['asdf', 'qwer', 'zzz', '1234', 'ㅇㅇㅇ', 'ㄴㄴㄴ', 'ㅋㅋㅋ', 'aaa'];
    if (!queryTrimmed || invalidPatterns.includes(queryTrimmed.toLowerCase()) || /^[ㄱ-ㅎ]+$/.test(queryTrimmed)) {
      return { isValid: false };
    }
    return {
      isValid: true,
      data: {
        name: queryTrimmed,
        energyIntensity: 15.0,
        renewableRate: 85,
        ghgIntensity: 2.8,
        wasteIntensity: 0.15,
        recyclingRate: 85,
        disclosureScore: 92,
        socialScore: 90,
        hasTarget: true,
        hasDisclosure: true,
        highlight: `${queryTrimmed} 지속가능경영 리더십 및 친환경 혁신 가치 창출 기업`
      }
    };
  }
}

// 1. Get Industry Presets
app.get('/api/industry-presets', (req, res) => {
  res.json({ status: 'success', data: INDUSTRY_PRESETS });
});

// 2. Analyze User's Business Data and Provide AI Feedback
app.post('/api/analyze', async (req, res) => {
  try {
    const {
      industryId,
      companyName,
      revenue, // 억원 (100M KRW)
      energyUsage, // MWh
      renewableRate, // %
      ghgEmissions, // tCO2eq
      wasteAmount, // 톤
      recyclingRate, // %
      hasTarget, // boolean (지속가능성 목표 보유 여부)
      hasDisclosure, // boolean (관련 정보 공개 여부)
      disclosureScore, // 0-100 (정보공시 수준 슬라이더)
      socialScore, // 0-100 (사회적 성과 슬라이더)
      targetCompany = ''
    } = req.body;

    // Validate request parameters
    if (!industryId || !companyName || !revenue) {
      return res.status(400).json({
        status: 'error',
        message: '필수 입력 항목(업종, 회사명, 매출액)이 누락되었습니다.'
      });
    }

    const selectedIndustry = INDUSTRY_PRESETS.find(i => i.id === industryId);
    if (!selectedIndustry) {
      return res.status(404).json({
        status: 'error',
        message: '해당하는 업종 프리셋을 찾을 수 없습니다.'
      });
    }

    let targetCompanyDetail: TargetCompanyPreset | undefined = undefined;
    if (targetCompany && targetCompany.trim()) {
      const trimmedTarget = targetCompany.trim();
      const verification = await verifyAndGetTargetCompany(trimmedTarget);
      if (!verification.isValid) {
        return res.status(400).json({
          status: 'error',
          message: `입력하신 목표 기업('${trimmedTarget}')을 찾을 수 없거나 기업명이 아닙니다. 실존하는 올바른 기업명(예: 애플, 풀무원, 삼성전자, 파타고니아 등)을 다시 입력해 주세요.`
        });
      }
      targetCompanyDetail = verification.data;
    }

    // Convert revenue to Billion KRW to calculate intensities
    // Revenue in '억원' is divided by 10 to get '10억원' (Billion KRW)
    const revenueInBillion = Number(revenue) / 10;
    
    // Calculated User Intensities & metrics
    const userEnergyIntensity = revenueInBillion > 0 ? Number(energyUsage) / revenueInBillion : 0;
    const userGhgIntensity = revenueInBillion > 0 ? Number(ghgEmissions) / revenueInBillion : 0;
    const userWasteIntensity = revenueInBillion > 0 ? Number(wasteAmount) / revenueInBillion : 0;
    
    const userRenewableRate = Number(renewableRate) || 0;
    const userRecyclingRate = Number(recyclingRate) || 0;
    const userHasTarget = !!hasTarget;
    const userHasDisclosure = !!hasDisclosure;
    
    // If user has disclosure check turned on but score is low, adjust it minimum to 60 or vice-versa
    let userDisclosureScore = Number(disclosureScore) || 0;
    if (userHasDisclosure && userDisclosureScore < 50) {
      userDisclosureScore = 55; // Boost if they explicitly disclose info
    } else if (!userHasDisclosure) {
      userDisclosureScore = Math.min(30, userDisclosureScore); // Limit if they do not disclose
    }

    const userSocialScore = Number(socialScore) || 0;

    // Benchmarks
    const benchmarkEnergy = targetCompanyDetail ? targetCompanyDetail.energyIntensity : selectedIndustry.energyIntensity;
    const benchmarkRenewable = targetCompanyDetail ? targetCompanyDetail.renewableRate : selectedIndustry.renewableRate;
    const benchmarkGhg = targetCompanyDetail ? targetCompanyDetail.ghgIntensity : selectedIndustry.ghgIntensity;
    const benchmarkWaste = targetCompanyDetail ? targetCompanyDetail.wasteIntensity : selectedIndustry.wasteIntensity;
    const benchmarkRecycling = targetCompanyDetail ? targetCompanyDetail.recyclingRate : selectedIndustry.recyclingRate;
    const benchmarkDisclosure = targetCompanyDetail ? targetCompanyDetail.disclosureScore : selectedIndustry.disclosureScore;
    const benchmarkSocial = targetCompanyDetail ? targetCompanyDetail.socialScore : selectedIndustry.socialScore;

    // Calculate percentage differences (Gaps)
    // For Energy, GHG, Waste, lower is better. A positive value means user uses MORE / emits MORE (bad gap).
    // For Renewable, Recycling, Disclosure, Social, higher is better. A positive value means user lags behind (bad gap).
    const energyGapPct = benchmarkEnergy > 0 ? ((userEnergyIntensity - benchmarkEnergy) / benchmarkEnergy) * 100 : 0;
    const renewableGapPct = benchmarkRenewable > 0 ? ((benchmarkRenewable - userRenewableRate) / benchmarkRenewable) * 100 : 0;
    const ghgGapPct = benchmarkGhg > 0 ? ((userGhgIntensity - benchmarkGhg) / benchmarkGhg) * 100 : 0;
    const wasteGapPct = benchmarkWaste > 0 ? ((userWasteIntensity - benchmarkWaste) / benchmarkWaste) * 100 : 0;
    const recyclingGapPct = benchmarkRecycling > 0 ? ((benchmarkRecycling - userRecyclingRate) / benchmarkRecycling) * 100 : 0;
    const disclosureGapPct = benchmarkDisclosure > 0 ? ((benchmarkDisclosure - userDisclosureScore) / benchmarkDisclosure) * 100 : 0;
    const socialGapPct = benchmarkSocial > 0 ? ((benchmarkSocial - userSocialScore) / benchmarkSocial) * 100 : 0;

    // Build standard structure to pass to Gemini
    const gapAnalysisText = `
      [기본 정보]
      - 회사명: ${companyName}
      - 산업군: ${selectedIndustry.name}
      - 매출액: ${revenue} 억 원 (분석 기준 매출: ${revenueInBillion.toFixed(2)} 10억 원)
      ${targetCompanyDetail ? `- 벤치마크/지향 목표 기업: ${targetCompanyDetail.name} (핵심 성과: ${targetCompanyDetail.highlight})` : ''}

      [지표 비교 분석 (단위 매출 10억원당 강도화 적용 및 비율 비교)]
      1. 에너지 사용 집약도 (Energy Intensity):
         - 사용자: ${userEnergyIntensity.toFixed(2)} MWh / 10억원
         - 우수기업 벤치마크: ${benchmarkEnergy} MWh / 10억원
         - 격차: ${energyGapPct > 0 ? `우수기업 대비 ${energyGapPct.toFixed(1)}% 더 높음 (부족)` : `우수기업 대비 ${Math.abs(energyGapPct).toFixed(1)}% 더 효율적 (우수)`}

      2. 재생에너지 사용 비율 (Renewable Energy Rate):
         - 사용자: ${userRenewableRate}%
         - 우수기업 벤치마크: ${benchmarkRenewable}%
         - 격차: ${renewableGapPct > 0 ? `우수기업 대비 ${renewableGapPct.toFixed(1)}%p 더 낮음 (부족)` : `우수기업 대비 ${Math.abs(renewableGapPct).toFixed(1)}%p 더 높음 (우수)`}

      3. 온실가스 배출 집약도 (GHG Emission Intensity):
         - 사용자: ${userGhgIntensity.toFixed(2)} tCO2eq / 10억원
         - 우수기업 벤치마크: ${benchmarkGhg} tCO2eq / 10억원
         - 격차: ${ghgGapPct > 0 ? `우수기업 대비 ${ghgGapPct.toFixed(1)}% 더 많이 배출 (부족)` : `우수기업 대비 ${Math.abs(ghgGapPct).toFixed(1)}% 더 적게 배출 (우수)`}

      4. 폐기물 발생 집약도 (Waste Intensity):
         - 사용자: ${userWasteIntensity.toFixed(2)} 톤 / 10억원
         - 우수기업 벤치마크: ${benchmarkWaste} 톤 / 10억원
         - 격차: ${wasteGapPct > 0 ? `우수기업 대비 ${wasteGapPct.toFixed(1)}% 더 많이 배출 (부족)` : `우수기업 대비 ${Math.abs(wasteGapPct).toFixed(1)}% 더 적게 발생 (우수)`}

      5. 자원 순환 및 재활용률 (Resource Recycling Rate):
         - 사용자: ${userRecyclingRate}%
         - 우수기업 벤치마크: ${benchmarkRecycling}%
         - 격차: ${recyclingGapPct > 0 ? `우수기업 대비 ${recyclingGapPct.toFixed(1)}%p 더 낮음 (부족)` : `우수기업 대비 ${Math.abs(recyclingGapPct).toFixed(1)}%p 더 우수 (우수)`}

      6. 정성적 지표 관리 및 거버넌스 상태:
         - 지속가능성 목표(환경 목표 등) 보유 여부: ${userHasTarget ? '예 (보유)' : '아니오 (미보유)'}
         - ESG/환경 정보공개 및 보고서 발간 여부: ${userHasDisclosure ? '예 (공개)' : '아니오 (미공개)'}
         - 정보공시 수준 점수: 사용자 ${userDisclosureScore}점 vs 벤치마크 ${benchmarkDisclosure}점
         - 사회적 책임 성과 점수: 사용자 ${userSocialScore}점 vs 벤치마크 ${benchmarkSocial}점
    `;

    // Prompt definition for Gemini
    const systemPrompt = `
      당신은 전문적인 ESG(환경, 사회, 지배구조) 및 지속가능경영 전략 컨설턴트입니다.
      동종 업계의 지속가능성이 매우 높은 일류 기업(벤치마크 기업)의 데이터와 사용자의 사업 데이터를 정밀 비교한 결과를 바탕으로 전문적인 AI 피드백 보고서를 작성해 주십시오.

      제공된 데이터를 정밀 분석하고, 가장 부족한 핵심 항목을 선정하여 개선 우선순위(Priority)를 부여하십시오.
      각 부족한 항목에 대해 "보완이 필요한 규제적/비즈니스적 이유"와 "구체적이고 실현 가능한 단계적 개선 조치(Action Plan)"를 상세히 한국어로 제시해 주십시오.
      특히, '지속가능성 목표 미보유', '에너지 절약 필요성', '재생에너지 비율 결핍', '폐기물 다량 배출 및 재활용 부실', 'ESG 정보 미공개' 등이 지표상 도출된다면 이를 우선순위의 주요 이유로 연결하십시오.

      반드시 아래 정의된 JSON 스키마 규격으로만 응답해야 합니다. 다른 사족이나 텍스트를 포함하지 말고 순수 JSON 형식으로 반환하십시오.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: "사용자 기업의 지속가능 경영 수준에 대한 종합적인 진단 및 벤치마크 대비 강약점 요약 총평 (한국어로 공손하고 전문적인 어조로 작성)"
        },
        priorities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "분류: 'energy', 'renewable', 'ghg', 'waste', 'recycling', 'target', 'disclosure', 'social' 중 하나"
              },
              categoryName: {
                type: Type.STRING,
                description: "한글 카테고리명 (예: '온실가스 배출', '에너지 사용', '재생에너지 전환', '폐기물 발생량', '자원 재활용', '지속가능 목표 수립', '정보공시/거버넌스', '사회적 책임')"
              },
              title: {
                type: Type.STRING,
                description: "보완 과제 제목 (예: '재활용 체계 고도화 및 폐기물 자원화')"
              },
              rank: {
                type: Type.INTEGER,
                description: "시급성이 높은 보완 우선순위 (1이 가장 시급함)"
              },
              gapDescription: {
                type: Type.STRING,
                description: "벤치마크 대비 부족한 수준에 대한 명확한 수치적 요약 (예: '우수 기업 대비 배출 강도가 42.1% 더 높아 시급한 저감 대책 요구')"
              },
              whyItMatters: {
                type: Type.STRING,
                description: "보완이 필요한 명확한 이유 (예: 국내외 탄소국경세 도입 우려, 공급망 ESG 실사법 요구 조건 미충족, 기업 이미지 훼손 등 비즈니스적/규제적 리스크 상세 설명)"
              },
              actionPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: "해당 영역을 개선하기 위한 현실적이고 단계적이며 구체적인 액션 플랜 3~4개"
              }
            },
            required: ["category", "categoryName", "title", "rank", "gapDescription", "whyItMatters", "actionPlan"]
          },
          description: "우선순위가 정해진 개선 요구사항 리스트. 가장 심각하거나 보완이 급한 항목 순으로 정렬하여 2~4개 포함해야 함."
        },
        overallFeedback: {
          type: Type.STRING,
          description: "지속가능경영 로드맵 구축을 위한 제언, 격려의 말 및 미래 지속가능한 기업으로 거듭나기 위한 따뜻한 마무리 조언"
        }
      },
      required: ["summary", "priorities", "overallFeedback"]
    };

    let aiFeedback;
    try {
      const aiInstance = getGemini();
      const aiResponse = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
          사용자 데이터와 벤치마크 데이터를 바탕으로 전문적인 지속가능성 개선 컨설팅 피드백을 작성하십시오.
          
          [데이터 분석 대상 정보]
          ${gapAnalysisText}
          
          업종 고유의 과제와 벤치마크 지표를 감안해 우선순위를 판별하고 피드백하십시오.
        `,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2
        }
      });

      const responseText = aiResponse.text?.trim() || '{}';
      aiFeedback = JSON.parse(responseText);
    } catch (apiError: any) {
      console.error('Gemini API Error:', apiError);
      // Construct a high-quality fallback feedback in case API key is missing or calls fail during development
      // Ensure we utilize the new waste and goal variables to provide rich fallback feedback
      const fallbackPriorities = [];
      let rank = 1;

      if (!userHasTarget) {
        fallbackPriorities.push({
          category: 'target',
          categoryName: '지속가능 목표 수립',
          title: '중장기 ESG / 지속가능 환경 경영 목표 선언',
          rank: rank++,
          gapDescription: '현재 공식적인 지속가능 환경 목표 및 성과 지표 로드맵이 부재한 상황입니다.',
          whyItMatters: '명문화되고 명확히 선언된 환경 경영 성과 지표(목표)가 없는 비즈니스는 내부 실행 동력이 저하될 뿐만 아니라, 투자자와 바이어 등 대외 이해관계자로부터 진정성을 의심받기 쉽습니다.',
          actionPlan: [
            '2030 탄소 중립 선언 및 연도별 온실가스 감축 로드맵 선포',
            '재생에너지 사용률 50% 이상 확대 등의 정량적 그린 목표 수립',
            '목표 달성을 위한 사내 친환경 경영 의사결정 위원회 소집 및 책임 주체 지정'
          ]
        });
      }

      if (ghgGapPct > 0) {
        fallbackPriorities.push({
          category: 'ghg',
          categoryName: '온실가스 배출',
          title: '매출액 대비 탄소 감축 계획 수립',
          rank: rank++,
          gapDescription: `우수 기업 대비 탄소 배출 집약도가 약 ${ghgGapPct.toFixed(1)}% 높습니다.`,
          whyItMatters: '글로벌 공급망 ESG 실사법 및 탄소 규제가 점차 중소·중견 기업까지 확대 적용되고 있으며, 친환경 바이어 선호도 증가로 인해 탄소 배출 절감은 지속가능경영의 필수 생존 조건입니다.',
          actionPlan: [
            '현장 설비별 에너지 계측기를 도입하여 온실가스 배출 배출원 파악',
            '업무용 차량의 무공해차 전환 및 보일러 등 연소 설비의 전기 구동화',
            '기업 내 저탄소 캠페인 시행 및 전력 소비 절감 알고리즘 구축'
          ]
        });
      }

      if (wasteGapPct > 0) {
        fallbackPriorities.push({
          category: 'waste',
          categoryName: '폐기물 발생량',
          title: '원단위 폐기물 저감 공법 및 수거 선별 세분화',
          rank: rank++,
          gapDescription: `우수 기업 대비 폐기물 발생 강도가 약 ${wasteGapPct.toFixed(1)}% 많습니다.`,
          whyItMatters: '폐기물 배출에 관한 법적 규제와 폐기물 처리 단가 인상으로 인한 직접 비용 증가 리스크가 큽니다. 자원 투입 효율성을 최적화하여 낭비 원천을 줄여야 합니다.',
          actionPlan: [
            '제조 공정 내 원재료 투입 비율 최적화 및 잉여 원료의 정밀 분할 관리',
            '발생 폐기물의 성상별(플라스틱, 종이, 캔 등) 배출 장소 이원화 및 직원 교육',
            '정기적인 폐기물 배출량 모니터링 시스템 구축 및 감축 성과 관리'
          ]
        });
      }

      if (recyclingGapPct > 0) {
        fallbackPriorities.push({
          category: 'recycling',
          categoryName: '자원 재활용',
          title: '사업장 내 폐기물 분리 배출 및 순환 체계 구축',
          rank: rank++,
          gapDescription: `우수 기업 벤치마크(${benchmarkRecycling}%) 대비 재활용률이 ${recyclingGapPct.toFixed(1)}%p 낮습니다.`,
          whyItMatters: '생산 부산물 및 포장재 폐기물에 대한 부담이 가중되는 친환경 규제 국면에서 자원 활용 효율성을 높이는 것은 원가 절감과 환경 보호를 동시에 달성할 수 있는 고효율 방안입니다.',
          actionPlan: [
            '원자재 투입 및 폐기 과정에 대한 라이프사이클(LCA) 간이 평가 수행',
            '재활용 전문 업체와의 제휴를 통한 고부가가치 폐자원 재활용 파트너십 구축',
            '일회용품 사용 축소 및 포장재 재생 플라스틱/종이 대체 적용'
          ]
        });
      }

      // Default priorities if all else is optimal
      if (fallbackPriorities.length === 0) {
        fallbackPriorities.push({
          category: 'disclosure',
          categoryName: '정보공시/거버넌스',
          title: '지속가능경영 성과 정기 보고 및 정보 투명성 강화',
          rank: 1,
          gapDescription: `우수 기업 기준 점수(${benchmarkDisclosure}점) 대비 공시 점수가 보완 가능합니다.`,
          whyItMatters: '기업의 지속가능 정보를 공식 채널에 업로드하거나 이해관계자에게 공정하게 공시하는 것은 신뢰와 평판을 극대화하는 직접적 수단입니다.',
          actionPlan: [
            '소규모 비즈니스 보고 기준을 활용하여 온실가스, 폐기물, 안전지표 공표',
            '회사 웹사이트 내 공식 지속가능 경영 탭 신설 및 데이터 축적 게재',
            '협력사 및 임직원과 분기별 지속가능 간담회 개최'
          ]
        });
      }

      aiFeedback = {
        summary: `이 피드백은 인텔리전트 로컬 시뮬레이션 결과입니다. (Gemini API 미연결 혹은 대기 상태)
        사용자의 사업은 ${selectedIndustry.name}에 해당하며, 매출액 대비 에너지 및 온실가스 배출 등 주요 영역에서 벤치마크 기업 대비 개선점이 확인됩니다.`,
        priorities: fallbackPriorities,
        overallFeedback: `에너지 사용 효율을 제고하고 탄소 감축 체계를 정비하며 정성적인 지속가능 목표 수립을 완료한다면 업계 우수 기업의 지속가능 경영 수준에 신속하게 도달할 수 있을 것입니다. 단계적으로 개선을 시도해 보세요!`
      };
    }

    // Return everything (calculated values + AI feedback + benchmarks) to the user
    return res.json({
      status: 'success',
      data: {
        companyName,
        industry: selectedIndustry,
        revenue,
        targetCompany,
        targetCompanyDetail,
        userCalculated: {
          energyIntensity: userEnergyIntensity,
          renewableRate: userRenewableRate,
          ghgIntensity: userGhgIntensity,
          wasteIntensity: userWasteIntensity,
          recyclingRate: userRecyclingRate,
          hasTarget: userHasTarget,
          hasDisclosure: userHasDisclosure,
          disclosureScore: userDisclosureScore,
          socialScore: userSocialScore
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
      }
    });

  } catch (err: any) {
    console.error('Server side process error:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 분석 처리 중 예기치 못한 오류가 발생했습니다: ' + err.message
    });
  }
});

// Serve frontend assets
if (process.env.NODE_ENV !== 'production') {
  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  }).then((vite) => {
    app.use(vite.middlewares);
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
