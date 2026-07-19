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
export interface IndustryBenchmark {
  id: string;
  name: string;
  energyIntensity: number; // MWh / 10억원 매출
  ghgIntensity: number;    // tCO2eq / 10억원 매출
  recyclingRate: number;    // %
  disclosureScore: number;  // 0-100
  socialScore: number;      // 0-100
  description: string;
  keyChallenge: string;
}

const INDUSTRY_PRESETS: IndustryBenchmark[] = [
  {
    id: 'manufacturing',
    name: '제조업 (Manufacturing)',
    energyIntensity: 210,
    ghgIntensity: 48.5,
    recyclingRate: 85,
    disclosureScore: 88,
    socialScore: 85,
    description: '에너지 소모와 제조 부산물이 많은 업종으로, 친환경 설비 도입 및 폐기물 재자원화가 핵심 과제입니다.',
    keyChallenge: '생산 가동 시 화석연료 대체 및 자원 순환 체계 도입 고도화'
  },
  {
    id: 'it-service',
    name: 'IT 및 서비스업 (IT & Service)',
    energyIntensity: 45,
    ghgIntensity: 9.8,
    recyclingRate: 60,
    disclosureScore: 92,
    socialScore: 90,
    description: '물리적 배출은 적으나 데이터 센터 구동 등으로 전력 사용량이 많으며, 공급망 전반의 Scope 3 배출 통제와 ESG 공시가 중요합니다.',
    keyChallenge: '친환경 데이터 센터 활용 및 공급망 ESG 관리 수준 향상'
  },
  {
    id: 'food-retail',
    name: '식음료 및 유통업 (Food & Retail)',
    energyIntensity: 115,
    ghgIntensity: 22.4,
    recyclingRate: 75,
    disclosureScore: 82,
    socialScore: 88,
    description: '포장재 쓰레기와 물류 이동 시 탄소 발생이 특징이며, 친환경 원료 수급과 플라스틱 절감이 핵심인 업종입니다.',
    keyChallenge: '포장재 재활용율 제고 및 물류 수송 과정 탄소 감축'
  },
  {
    id: 'fashion-textile',
    name: '패션 및 섬유업 (Fashion & Textile)',
    energyIntensity: 130,
    ghgIntensity: 31.2,
    recyclingRate: 80,
    disclosureScore: 80,
    socialScore: 86,
    description: '원단 가공 시 물과 화학물질 사용량이 많으며, 지속가능한 유기농/재활용 소재 사용과 윤리적 공급망 관리가 중요합니다.',
    keyChallenge: '친환경 및 재생 소재 사용량 확대, 전 공급망 노동 인권 점검'
  },
  {
    id: 'logistics-transport',
    name: '물류 및 운송업 (Logistics & Transport)',
    energyIntensity: 280,
    ghgIntensity: 65.0,
    recyclingRate: 55,
    disclosureScore: 85,
    socialScore: 82,
    description: '연료 연소로 인한 직접 배출량(Scope 1)이 가장 큰 비중을 차지하며, 친환경 모빌리티 전환과 경로 최적화가 필수적입니다.',
    keyChallenge: '전기·수소 화물차로의 조기 전환 및 유류 사용 절감 알고리즘 개발'
  },
  {
    id: 'construction',
    name: '건설 및 부동산 (Construction)',
    energyIntensity: 180,
    ghgIntensity: 42.0,
    recyclingRate: 90,
    disclosureScore: 78,
    socialScore: 80,
    description: '건설 자재 조달 및 폐기 단계에서 막대한 자원이 소요되므로, 친환경 공법 도입과 에너지를 자급하는 건축 기술(ZEB)이 요구됩니다.',
    keyChallenge: '친환경 저탄소 콘크리트 및 내구재 도입, 현장 자원 선별 재활용'
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
      ghgEmissions, // tCO2eq
      recyclingRate, // %
      disclosureScore, // 0-100
      socialScore, // 0-100
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

    // Convert revenue to Billion KRW to calculate intensities
    // Revenue in '억원' is divided by 10 to get '10억원' (Billion KRW)
    const revenueInBillion = Number(revenue) / 10;
    
    // Calculated User Intensities
    const userEnergyIntensity = revenueInBillion > 0 ? Number(energyUsage) / revenueInBillion : 0;
    const userGhgIntensity = revenueInBillion > 0 ? Number(ghgEmissions) / revenueInBillion : 0;
    const userRecyclingRate = Number(recyclingRate);
    const userDisclosureScore = Number(disclosureScore);
    const userSocialScore = Number(socialScore);

    // Benchmarks
    const benchmarkEnergy = selectedIndustry.energyIntensity;
    const benchmarkGhg = selectedIndustry.ghgIntensity;
    const benchmarkRecycling = selectedIndustry.recyclingRate;
    const benchmarkDisclosure = selectedIndustry.disclosureScore;
    const benchmarkSocial = selectedIndustry.socialScore;

    // Calculate percentage differences
    // For Energy and GHG, lower is better. A positive value means user uses MORE / emits MORE (bad gap).
    // For Recycling, Disclosure, and Social, higher is better. A positive value means user lags behind (bad gap).
    const energyGapPct = benchmarkEnergy > 0 ? ((userEnergyIntensity - benchmarkEnergy) / benchmarkEnergy) * 100 : 0;
    const ghgGapPct = benchmarkGhg > 0 ? ((userGhgIntensity - benchmarkGhg) / benchmarkGhg) * 100 : 0;
    const recyclingGapPct = benchmarkRecycling > 0 ? ((benchmarkRecycling - userRecyclingRate) / benchmarkRecycling) * 100 : 0;
    const disclosureGapPct = benchmarkDisclosure > 0 ? ((benchmarkDisclosure - userDisclosureScore) / benchmarkDisclosure) * 100 : 0;
    const socialGapPct = benchmarkSocial > 0 ? ((benchmarkSocial - userSocialScore) / benchmarkSocial) * 100 : 0;

    // Build standard structure to pass to Gemini
    const gapAnalysisText = `
      [기본 정보]
      - 회사명: ${companyName}
      - 산업군: ${selectedIndustry.name}
      - 매출액: ${revenue} 억 원 (분석 기준 매출: ${revenueInBillion.toFixed(2)} 10억 원)
      ${targetCompany ? `- 벤치마크/목표 기업: ${targetCompany}` : ''}

      [지표 비교 분석 (단위 매출 10억원당 강도화 적용)]
      1. 에너지 사용 집약도 (Energy Intensity):
         - 사용자: ${userEnergyIntensity.toFixed(2)} MWh / 10억원
         - 우수기업 벤치마크: ${benchmarkEnergy} MWh / 10억원
         - 격차: ${energyGapPct > 0 ? `우수기업 대비 ${energyGapPct.toFixed(1)}% 더 높음 (부족)` : `우수기업 대비 ${Math.abs(energyGapPct).toFixed(1)}% 더 효율적 (양호)`}

      2. 온실가스 배출 집약도 (GHG Emission Intensity):
         - 사용자: ${userGhgIntensity.toFixed(2)} tCO2eq / 10억원
         - 우수기업 벤치마크: ${benchmarkGhg} tCO2eq / 10억원
         - 격차: ${ghgGapPct > 0 ? `우수기업 대비 ${ghgGapPct.toFixed(1)}% 더 많이 배출 (부족)` : `우수기업 대비 ${Math.abs(ghgGapPct).toFixed(1)}% 더 적게 배출 (양호)`}

      3. 자원 순환 및 재활용률 (Resource Recycling Rate):
         - 사용자: ${userRecyclingRate}%
         - 우수기업 벤치마크: ${benchmarkRecycling}%
         - 격차: ${recyclingGapPct > 0 ? `우수기업 대비 ${recyclingGapPct.toFixed(1)}%p 더 낮음 (부족)` : `우수기업 대비 ${Math.abs(recyclingGapPct).toFixed(1)}%p 더 우수 (양호)`}

      4. ESG 정보공시 및 거버넌스 수준 (ESG Disclosure & Governance Score):
         - 사용자: ${userDisclosureScore}점 / 100점
         - 우수기업 벤치마크: ${benchmarkDisclosure}점 / 100점
         - 격차: ${disclosureGapPct > 0 ? `우수기업 대비 ${disclosureGapPct.toFixed(1)}% 더 낮음 (부족)` : `우수기업 대비 ${Math.abs(disclosureGapPct).toFixed(1)}% 더 체계적 (양호)`}

      5. 사회적 책임 성과 점수 (Social Responsibility Score):
         - 사용자: ${userSocialScore}점 / 100점
         - 우수기업 벤치마크: ${benchmarkSocial}점 / 100점
         - 격차: ${socialGapPct > 0 ? `우수기업 대비 ${socialGapPct.toFixed(1)}% 더 낮음 (부족)` : `우수기업 대비 ${Math.abs(socialGapPct).toFixed(1)}% 더 적극적 (양호)`}
    `;

    // Prompt definition for Gemini
    const systemPrompt = `
      당신은 전문적인 ESG(환경, 사회, 지배구조) 및 지속가능경영 전략 컨설턴트입니다.
      동종 업계의 지속가능성이 매우 높은 일류 기업(벤치마크 기업)의 데이터와 사용자의 사업 데이터를 정밀 비교한 결과를 바탕으로 전문적인 AI 피드백 보고서를 작성해 주십시오.

      제공된 데이터를 정밀 분석하고, 가장 부족한 핵심 항목을 선정하여 개선 우선순위(Priority)를 부여하십시오.
      각 부족한 항목에 대해 "보완이 필요한 규제적/비즈니스적 이유"와 "구체적이고 실현 가능한 단계적 개선 조치(Action Plan)"를 상세히 한국어로 제시해 주십시오.

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
                description: "분류: 'energy', 'ghg', 'recycling', 'disclosure', 'social' 중 하나"
              },
              categoryName: {
                type: Type.STRING,
                description: "한글 카테고리명 (예: '온실가스 배출', '에너지 사용', '자원 재활용', '정보공시/거버넌스', '사회적 책임')"
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
        model: 'gemini-3.5-flash',
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
      aiFeedback = {
        summary: `이 피드백은 로컬 시뮬레이션 결과입니다. (Gemini API 연결 오류 혹은 API 키 미설정 상태)
        사용자의 사업은 ${selectedIndustry.name}에 해당하며, 매출액 대비 에너지 및 온실가스 배출 등 주요 영역에서 벤치마크 기업 대비 개선점이 확인됩니다.`,
        priorities: [
          {
            category: 'ghg',
            categoryName: '온실가스 배출',
            title: '매출액 대비 탄소 감축 계획 수립',
            rank: 1,
            gapDescription: ghgGapPct > 0 
              ? `우수 기업 대비 탄소 배출 집약도가 약 ${ghgGapPct.toFixed(1)}% 높습니다.` 
              : `탄소 배출량 관리 체계 정교화 필요.`,
            whyItMatters: '글로벌 공급망 ESG 실사법 및 탄소 규제가 점차 중소·중견 기업까지 확대 적용되고 있으며, 친환경 바이어 선호도 증가로 인해 탄소 배출 절감은 지속가능경영의 필수 생존 조건입니다.',
            actionPlan: [
              '현장 설비별 에너지 계측기를 도입하여 온실가스 배출 배출원 파악',
              '업무용 차량의 무공해차 전환 및 보일러 등 연소 설비의 전기 구동화',
              '기업 내 저탄소 캠페인 시행 및 전력 소비 절감 알고리즘 구축'
            ]
          },
          {
            category: 'recycling',
            categoryName: '자원 재활용',
            title: '사업장 내 폐기물 분리 배출 및 순환 체계 구축',
            rank: 2,
            gapDescription: recyclingGapPct > 0 
              ? `우수 기업 벤치마크(${benchmarkRecycling}%) 대비 재활용률이 ${recyclingGapPct.toFixed(1)}%p 낮습니다.` 
              : `자원 재활용 비율 확대 및 에코 포장재 도입 제안.`,
            whyItMatters: '생산 부산물 및 포장재 폐기물에 대한 부담이 가중되는 친환경 규제 국면에서 자원 활용 효율성을 높이는 것은 원가 절감과 환경 보호를 동시에 달성할 수 있는 고효율 방안입니다.',
            actionPlan: [
              '원자재 투입 및 폐기 과정에 대한 라이프사이클(LCA) 간이 평가 수행',
              '재활용 전문 업체와의 제휴를 통한 고부가가치 폐자원 재활용 파트너십 구축',
              '일회용품 사용 축소 및 포장재 재생 플라스틱/종이 대체 적용'
            ]
          }
        ],
        overallFeedback: `에너지 사용과 탄소 감축 체계를 정비한다면 우수 기업의 지속가능 경영 수준에 신속하게 도달할 수 있을 것입니다. 단계적으로 개선을 시도해 보세요!`
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
        userCalculated: {
          energyIntensity: userEnergyIntensity,
          ghgIntensity: userGhgIntensity,
          recyclingRate: userRecyclingRate,
          disclosureScore: userDisclosureScore,
          socialScore: userSocialScore
        },
        benchmark: {
          energyIntensity: benchmarkEnergy,
          ghgIntensity: benchmarkGhg,
          recyclingRate: benchmarkRecycling,
          disclosureScore: benchmarkDisclosure,
          socialScore: benchmarkSocial
        },
        gaps: {
          energyGapPct,
          ghgGapPct,
          recyclingGapPct, // in %p difference
          disclosureGapPct, // in score difference
          socialGapPct // in score difference
        },
        aiFeedback
      }
    });

  } catch (err: any) {
    console.error('Server side process error:', err);
    res.status(500).json({
      status: 'error',
      message: '서버 분석 처리 중 예기치 못한 요류가 발생했습니다: ' + err.message
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
