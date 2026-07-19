import React, { useState, useEffect } from 'react';
import {
  Leaf,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Building2,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  RotateCcw,
  Zap,
  Globe,
  Trash2,
  FileText,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Award,
  Minus
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces aligned with backend response
interface IndustryBenchmark {
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

interface AIPriority {
  category: string;
  categoryName: string;
  title: string;
  rank: number;
  gapDescription: string;
  whyItMatters: string;
  actionPlan: string[];
}

interface AIFeedback {
  summary: string;
  priorities: AIPriority[];
  overallFeedback: string;
}

interface AnalysisResult {
  companyName: string;
  industry: IndustryBenchmark;
  revenue: number;
  targetCompany?: string;
  userCalculated: {
    energyIntensity: number;
    ghgIntensity: number;
    recyclingRate: number;
    disclosureScore: number;
    socialScore: number;
  };
  benchmark: {
    energyIntensity: number;
    ghgIntensity: number;
    recyclingRate: number;
    disclosureScore: number;
    socialScore: number;
  };
  gaps: {
    energyGapPct: number;
    ghgGapPct: number;
    recyclingGapPct: number;
    disclosureGapPct: number;
    socialGapPct: number;
  };
  aiFeedback: AIFeedback;
}

export default function App() {
  const [industries, setIndustries] = useState<IndustryBenchmark[]>([]);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('manufacturing');
  const [companyName, setCompanyName] = useState<string>('');
  const [revenue, setRevenue] = useState<string>('120'); // 기본값 120억 원
  const [energyUsage, setEnergyUsage] = useState<string>('18000'); // 기본값 18000 MWh
  const [ghgEmissions, setGhgEmissions] = useState<string>('4200'); // 기본값 4200 tCO2eq
  const [recyclingRate, setRecyclingRate] = useState<number>(60); // 기본값 60%
  const [disclosureScore, setDisclosureScore] = useState<number>(55); // 기본값 55점
  const [socialScore, setSocialScore] = useState<number>(65); // 기본값 65점
  const [targetCompany, setTargetCompany] = useState<string>(''); // 목표 벤치마킹 기업
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'bar'>('radar');

  // Fetch industry presets from API
  useEffect(() => {
    fetch('/api/industry-presets')
      .then((res) => {
        if (!res.ok) throw new Error('업종 프리셋 데이터를 불러오지 못했습니다.');
        return res.json();
      })
      .then((resJson) => {
        if (resJson.status === 'success') {
          setIndustries(resJson.data);
          if (resJson.data.length > 0) {
            setSelectedIndustryId(resJson.data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        // Fallback in case of fetch issues
        const fallbackPresets: IndustryBenchmark[] = [
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
          }
        ];
        setIndustries(fallbackPresets);
      });
  }, []);

  const selectedIndustry = industries.find((i) => i.id === selectedIndustryId);

  // Reassuring loading messages
  useEffect(() => {
    if (!loading) return;
    const steps = [
      '선택한 업종의 우수 기업 벤치마크 데이터를 수집하는 중...',
      '입력하신 매출 규모 대비 에너지 및 온실가스 집약도 지표를 계산 중...',
      '지표별 격차(Gap) 분석 및 주요 보완 우선순위를 판별하는 중...',
      'Gemini AI 비즈니스 컨설턴트가 부족 원인과 실천 가능한 개선 방향을 생성 중...',
      '마지막 고품질 분석 보고서를 포맷팅하고 있습니다...'
    ];
    let currentIndex = 0;
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < steps.length) {
        setLoadingStep(steps[currentIndex]);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('회사명을 입력해 주세요.');
      return;
    }
    if (Number(revenue) <= 0 || isNaN(Number(revenue))) {
      setError('매출액은 0보다 큰 숫자여야 합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industryId: selectedIndustryId,
          companyName,
          revenue: Number(revenue),
          energyUsage: Number(energyUsage) || 0,
          ghgEmissions: Number(ghgEmissions) || 0,
          recyclingRate,
          disclosureScore,
          socialScore,
          targetCompany: targetCompany.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('서버 분석 요청 중 문제가 발생했습니다.');
      }

      const resJson = await response.json();
      if (resJson.status === 'success') {
        setResult(resJson.data);
        // Scroll to result section
        setTimeout(() => {
          document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(resJson.message || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get formatted charts data
  const getChartsData = () => {
    if (!result) return [];

    // 1. Energy Score (Lower is better, so if user is <= benchmark, score is 100. If user is higher, score decays)
    const energyScore = result.userCalculated.energyIntensity <= result.benchmark.energyIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.energyIntensity - result.benchmark.energyIntensity) / result.benchmark.energyIntensity) * 100));

    // 2. GHG Score (Lower is better)
    const ghgScore = result.userCalculated.ghgIntensity <= result.benchmark.ghgIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.ghgIntensity - result.benchmark.ghgIntensity) / result.benchmark.ghgIntensity) * 100));

    // 3. Recycling Score (Higher is better, direct pct comparison)
    const recyclingScore = Math.round((result.userCalculated.recyclingRate / result.benchmark.recyclingRate) * 100);

    // 4. Disclosure Score (Higher is better)
    const disclosureScorePct = Math.round((result.userCalculated.disclosureScore / result.benchmark.disclosureScore) * 100);

    // 5. Social Score (Higher is better)
    const socialScorePct = Math.round((result.userCalculated.socialScore / result.benchmark.socialScore) * 100);

    return [
      {
        subject: '에너지 효율성',
        '우리 기업 (점수)': Math.min(100, energyScore),
        '우수기업 기준': 100,
        fullMark: 100,
        rawUser: `${result.userCalculated.energyIntensity.toFixed(0)} MWh/10억`,
        rawBenchmark: `${result.benchmark.energyIntensity} MWh/10억`
      },
      {
        subject: '탄소 배출 관리',
        '우리 기업 (점수)': Math.min(100, ghgScore),
        '우수기업 기준': 100,
        fullMark: 100,
        rawUser: `${result.userCalculated.ghgIntensity.toFixed(1)} tCO2/10억`,
        rawBenchmark: `${result.benchmark.ghgIntensity} tCO2/10억`
      },
      {
        subject: '자원 재활용률',
        '우리 기업 (점수)': Math.min(120, recyclingScore),
        '우수기업 기준': 100,
        fullMark: 100,
        rawUser: `${result.userCalculated.recyclingRate}%`,
        rawBenchmark: `${result.benchmark.recyclingRate}%`
      },
      {
        subject: '정보공시/거버넌스',
        '우리 기업 (점수)': Math.min(120, disclosureScorePct),
        '우수기업 기준': 100,
        fullMark: 100,
        rawUser: `${result.userCalculated.disclosureScore}점`,
        rawBenchmark: `${result.benchmark.disclosureScore}점`
      },
      {
        subject: '사회적 책임 성과',
        '우리 기업 (점수)': Math.min(120, socialScorePct),
        '우수기업 기준': 100,
        fullMark: 100,
        rawUser: `${result.userCalculated.socialScore}점`,
        rawBenchmark: `${result.benchmark.socialScore}점`
      }
    ];
  };

  const getDirectBarData = () => {
    if (!result) return [];
    return [
      {
        name: '에너지 (MWh/10억)',
        '우리 기업': Math.round(result.userCalculated.energyIntensity),
        '우수 기업': result.benchmark.energyIntensity,
      },
      {
        name: '온실가스 (tCO2/10억)',
        '우리 기업': Math.round(result.userCalculated.ghgIntensity * 10) / 10,
        '우수 기업': result.benchmark.ghgIntensity,
      },
      {
        name: '자원 순환 (%)',
        '우리 기업': result.userCalculated.recyclingRate,
        '우수 기업': result.benchmark.recyclingRate,
      },
      {
        name: '공시 수준 (점)',
        '우리 기업': result.userCalculated.disclosureScore,
        '우수 기업': result.benchmark.disclosureScore,
      },
      {
        name: '사회적 성과 (점)',
        '우리 기업': result.userCalculated.socialScore,
        '우수 기업': result.benchmark.socialScore,
      }
    ];
  };

  // Helper to calculate overall grade
  const calculateGradeAndGap = () => {
    if (!result) return { grade: 'B-', gapText: '25%', gapLevel: '보통 (Moderate Gap)' };

    const energyScore = result.userCalculated.energyIntensity <= result.benchmark.energyIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.energyIntensity - result.benchmark.energyIntensity) / result.benchmark.energyIntensity) * 100));

    const ghgScore = result.userCalculated.ghgIntensity <= result.benchmark.ghgIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.ghgIntensity - result.benchmark.ghgIntensity) / result.benchmark.ghgIntensity) * 100));

    const recyclingScore = Math.min(100, Math.round((result.userCalculated.recyclingRate / result.benchmark.recyclingRate) * 100));
    const disclosureScorePct = Math.min(100, Math.round((result.userCalculated.disclosureScore / result.benchmark.disclosureScore) * 100));
    const socialScorePct = Math.min(100, Math.round((result.userCalculated.socialScore / result.benchmark.socialScore) * 100));

    const avgScore = (energyScore + ghgScore + recyclingScore + disclosureScorePct + socialScorePct) / 5;

    let grade = 'C';
    if (avgScore >= 92) grade = 'A+';
    else if (avgScore >= 84) grade = 'A';
    else if (avgScore >= 75) grade = 'B+';
    else if (avgScore >= 65) grade = 'B';
    else if (avgScore >= 55) grade = 'C+';
    else if (avgScore >= 45) grade = 'C';
    else if (avgScore >= 35) grade = 'D';
    else grade = 'F';

    // Greatest gap percentage
    const maxGap = Math.max(
      result.gaps.energyGapPct,
      result.gaps.ghgGapPct,
      result.gaps.recyclingGapPct,
      result.gaps.disclosureGapPct,
      result.gaps.socialGapPct
    );

    let gapText = `${Math.round(Math.max(0, maxGap))}%`;
    if (maxGap <= 0) gapText = '0% (지속가능 선도)';

    let gapLevel = '양호 (Optimal)';
    if (maxGap > 50) gapLevel = '심각한 격차 (Critical Gap)';
    else if (maxGap > 25) gapLevel = '우려 수준 (Significant)';
    else if (maxGap > 5) gapLevel = '보통 격차 (Moderate)';

    return { grade, gapText, gapLevel };
  };

  const { grade, gapText, gapLevel } = calculateGradeAndGap();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'ghg':
        return <Globe className="w-5 h-5 text-rose-400" />;
      case 'recycling':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'disclosure':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'social':
        return <Users className="w-5 h-5 text-indigo-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* ECO-SYNC ANALYTICS PREMIUM HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900" id="header_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white uppercase">
                  ECO-SYNC <span className="text-emerald-400">ANALYTICS</span>
                </h1>
                <span className="hidden xs:inline-block px-2 py-0.5 text-[9px] bg-slate-900 text-slate-400 font-mono border border-slate-800 rounded-full">v1.2</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">지속가능성 벤치마킹 및 AI 분석 피드백 프로그램</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-slate-300 font-medium font-mono">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              {selectedIndustry ? selectedIndustry.name.split(' (')[0] : '산업군 분석 엔진'}
            </div>
            <div className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-full font-bold text-xs shadow-md shadow-emerald-500/10">
              AI Professional
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* HERO INTRO CARD (Bento Accent) */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800/80 p-6 sm:p-8 relative overflow-hidden shadow-2xl" id="hero_section">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 p-12 opacity-5 pointer-events-none">
            <Activity className="w-80 h-80 text-emerald-400" />
          </div>
          <div className="relative z-10 max-w-4xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>지속가능한 사업의 조건과 격차 진단</span>
            </div>
            <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-white">
              우수 선도 기업의 ESG 데이터를 분석하고,<br />
              사용자의 비즈니스를 정밀 매핑하여 <span className="text-emerald-400">성장 로드맵</span>을 제안합니다.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
              에너지 강도, 탄소 배출, 폐자원 순환율, 공시 투명성, 사회적 책임 등의 정량 지표를 업계 평균 우수 벤치마크와 공정 비교합니다. 
              최첨단 Gemini 3.5 AI 컨설턴트가 사업 성장의 위협 요인을 사전에 모니터링하고 시급한 순위에 따른 처방을 실시간 지원합니다.
            </p>
          </div>
        </section>

        {/* BENTO LAYOUT MAIN INNER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: 5 cols on large screen (Inputs & Presets) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Bento Block 1: Industry Selection */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl" id="industry_preset_card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-emerald-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">STEP 01</h3>
                  <p className="text-base font-extrabold text-white">업계 선도 벤치마크 선택</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">분석 대상 산업군 선택</label>
                  <select
                    value={selectedIndustryId}
                    onChange={(e) => setSelectedIndustryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 font-semibold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer"
                  >
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id} className="bg-slate-900 text-slate-100">
                        {ind.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedIndustry && (
                  <motion.div
                    key={selectedIndustry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-4 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        업종 지속가능 환경 분석
                      </p>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {selectedIndustry.description}
                      </p>
                    </div>

                    <div className="h-px bg-slate-800/60" />

                    <div className="space-y-1">
                      <p className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        가장 시급한 친환경 당면 과제
                      </p>
                      <p className="text-slate-300 font-semibold">{selectedIndustry.keyChallenge}</p>
                    </div>

                    <div className="h-px bg-slate-800/60" />

                    <div className="space-y-2">
                      <p className="font-bold text-slate-300">최상위 10% ESG 선도기업 평균 실적치</p>
                      <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/50">
                          <span className="text-slate-500 block uppercase tracking-wider text-[9px] mb-0.5">에너지 사용</span>
                          <span className="text-white font-extrabold text-sm">{selectedIndustry.energyIntensity}</span> <span className="text-slate-400 text-[10px]">MWh/10억</span>
                        </div>
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/50">
                          <span className="text-slate-500 block uppercase tracking-wider text-[9px] mb-0.5">온실가스 배출</span>
                          <span className="text-white font-extrabold text-sm">{selectedIndustry.ghgIntensity}</span> <span className="text-slate-400 text-[10px]">tCO2eq/10억</span>
                        </div>
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/50">
                          <span className="text-slate-500 block uppercase tracking-wider text-[9px] mb-0.5">자원 재활용</span>
                          <span className="text-emerald-400 font-extrabold text-sm">{selectedIndustry.recyclingRate}%</span> <span className="text-slate-400 text-[10px]">최소 비율</span>
                        </div>
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/50">
                          <span className="text-slate-500 block uppercase tracking-wider text-[9px] mb-0.5">공시 및 거버넌스</span>
                          <span className="text-blue-400 font-extrabold text-sm">{selectedIndustry.disclosureScore}점</span> <span className="text-slate-400 text-[10px]">100점 만점</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bento Block 2: Business Input Form */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl" id="input_data_form_card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">STEP 02</h3>
                  <p className="text-base font-extrabold text-white">우리 기업 사업 데이터 입력</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name and Revenue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">회사/사업명 <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="예: (주)한울글로벌"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 font-medium placeholder-slate-600 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">연간 총 매출액 <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="120"
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-3.5 pr-14 py-2.5 text-sm text-slate-100 font-medium placeholder-slate-600 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-xs font-bold text-slate-500">
                        억 원
                      </div>
                    </div>
                  </div>
                </div>

                {/* Energy & Carbon Emissions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">연간 총 에너지 사용</label>
                      <span className="text-[9px] text-slate-500">전력·가스 합산</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="예: 18000"
                        value={energyUsage}
                        onChange={(e) => setEnergyUsage(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-3.5 pr-14 py-2.5 text-sm text-slate-100 font-medium placeholder-slate-600 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-xs font-bold text-slate-500">
                        MWh
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">연간 온실가스 배출</label>
                      <span className="text-[9px] text-slate-500">Scope 1, 2 배출</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="예: 4200"
                        value={ghgEmissions}
                        onChange={(e) => setGhgEmissions(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-3.5 pr-16 py-2.5 text-sm text-slate-100 font-medium placeholder-slate-600 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-[11px] font-bold text-slate-500">
                        tCO2eq
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slider Inputs styled premium */}
                <div className="space-y-2 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/60 space-y-4">
                  {/* Recycling Rate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">자원 순환 및 재활용률</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{recyclingRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={recyclingRate}
                      onChange={(e) => setRecyclingRate(Number(e.target.value))}
                      className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>0% (매립/전량 폐기)</span>
                      <span>50%</span>
                      <span>100% (완전 재자원화)</span>
                    </div>
                  </div>

                  {/* Disclosure Score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">ESG 정보공시 및 투명성 점수</span>
                      <span className="text-blue-400 font-extrabold text-sm">{disclosureScore}점</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={disclosureScore}
                      onChange={(e) => setDisclosureScore(Number(e.target.value))}
                      className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>0점 (미보고)</span>
                      <span>50점</span>
                      <span>100점 (GRI/지속가능 보고서 발간)</span>
                    </div>
                  </div>

                  {/* Social score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">사회적 책임 성과</span>
                      <span className="text-indigo-400 font-extrabold text-sm">{socialScore}점</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={socialScore}
                      onChange={(e) => setSocialScore(Number(e.target.value))}
                      className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>0점 (규칙 없음)</span>
                      <span>50점</span>
                      <span>100점 (인권/안전보건 최고수준)</span>
                    </div>
                  </div>
                </div>

                {/* Target Benchmark Company */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">지향하는 목표 기업 (선택)</label>
                    <span className="text-[9px] text-slate-500">예: 풀무원, 파타고니아, 애플</span>
                  </div>
                  <input
                    type="text"
                    placeholder="지속가능 경영의 워너비 롤모델 기업"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 font-medium placeholder-slate-600 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="uppercase tracking-wide">격차 진단 엔진 구동 중...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      <span>지속가능성 격차 매핑 및 AI 분석 실행</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT PANEL: 7 cols (Bento dashboard or placeholder) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading_widget"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[580px] shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Tech loader */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="w-7 h-7 text-emerald-400 animate-pulse" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">ECO-SYNC AI AUDIT ENGINE</h3>
                  <div className="h-10 flex items-center justify-center px-4">
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs sm:text-sm text-slate-400 font-semibold max-w-md leading-relaxed"
                    >
                      {loadingStep}
                    </motion.p>
                  </div>

                  {/* Simulated terminal activity line */}
                  <div className="mt-8 font-mono text-[10px] text-slate-600 bg-slate-950/80 py-2 px-4 rounded-lg border border-slate-900">
                    GET_BENCHMARK_PRESETS_SUCCESS // INGESTING_USER_INPUT_METRICS // CORE_AI_CONNECTING
                  </div>
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  key="placeholder_widget"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[580px] shadow-2xl space-y-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-md">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-white">지속가능 경영 종합 대시보드</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                      왼쪽의 정량 데이터를 채운 뒤 분석을 요청해 주세요. 
                      우수 기업 기준과의 격차 분석 그래프, 종합 등급 판정, 그리고 보완 우선순위별 구체적인 실행 계획(Action Plan)이 이곳에 Bento 형태로 로드됩니다.
                    </p>
                  </div>
                  
                  {/* Quick Preview of Indicators to show high fidelity Bento theme */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md text-left pt-2">
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60 flex flex-col justify-between h-24">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">최대 환경 격차</p>
                        <p className="text-lg font-bold text-slate-400 font-mono">-</p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">대기 상태</div>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60 flex flex-col justify-between h-24">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">가상 예측 등급</p>
                        <p className="text-lg font-bold text-slate-400 font-mono">B-</p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">목표 등급: A+</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ACTIVE BENTO BOARD REPORT */}
              {!loading && result && (
                <motion.div
                  key="active_dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                  id="analysis-result"
                >
                  
                  {/* BENTO STATS row (Matches the Bento Grid HTML preview) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    
                    {/* Stat Card 1: Sustainability Gap */}
                    <div className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg hover:border-slate-700 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-black text-xl font-mono">
                        {gapText}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">최대 환경 격차 수준</p>
                        <p className="font-extrabold text-white text-base">{gapLevel}</p>
                      </div>
                    </div>

                    {/* Stat Card 2: Current Grade */}
                    <div className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg hover:border-slate-700 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-2xl font-mono">
                        {grade}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">현재 평가 등급</p>
                        <p className="font-extrabold text-white text-base">목표 벤치마크 등급: A+</p>
                      </div>
                    </div>

                  </div>

                  {/* BENTO BLOCK 3: Comparative Visual Charts Container (8 cols inside row-span-3 in design) */}
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">BENCHMARK COMPARATIVE VISUAL</h4>
                        <h3 className="text-base font-extrabold text-white mt-0.5">우리 기업 vs 우수 기업 지표 상세</h3>
                      </div>

                      {/* Premium Tab Selectors */}
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 self-start sm:self-auto">
                        <button
                          onClick={() => setActiveTab('radar')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'radar' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          종합 역량 방사형
                        </button>
                        <button
                          onClick={() => setActiveTab('bar')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'bar' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          개별 수치 비교
                        </button>
                      </div>
                    </div>

                    {/* Recharts Wrapper */}
                    <div className="h-72 w-full flex items-center justify-center" id="chart_container">
                      <ResponsiveContainer width="100%" height="100%">
                        {activeTab === 'radar' ? (
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getChartsData()}>
                            <PolarGrid stroke="#1e293b" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 120]} tick={{ fill: '#475569', fontSize: 9 }} />
                            <Radar name="우리 기업 (점수)" dataKey="우리 기업 (점수)" stroke="#34d399" strokeWidth={2} fill="#10b981" fillOpacity={0.25} />
                            <Radar name="우수 선도기업" dataKey="우수기업 기준" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                              formatter={(value: any, name: any, props: any) => {
                                const payload = props.payload as any;
                                return [`${value}점 (${name === '우리 기업 (점수)' ? payload.rawUser : payload.rawBenchmark})`, name];
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }} />
                          </RadarChart>
                        ) : (
                          <BarChart data={getDirectBarData()} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }} />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Bar dataKey="우리 기업" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="우수 기업" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    {/* Calculated Intensities Bento list */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
                      
                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <Zap className="w-4 h-4" />
                          <span>에너지 효율 강도</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400">우리: <span className="font-mono text-white font-bold">{result.userCalculated.energyIntensity.toFixed(1)} MWh</span></p>
                          <p className="text-slate-400">우수: <span className="font-mono text-emerald-400 font-bold">{result.benchmark.energyIntensity} MWh</span></p>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                          <Globe className="w-4 h-4" />
                          <span>온실가스 배출 강도</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400">우리: <span className="font-mono text-white font-bold">{result.userCalculated.ghgIntensity.toFixed(1)} tCO2</span></p>
                          <p className="text-slate-400">우수: <span className="font-mono text-emerald-400 font-bold">{result.benchmark.ghgIntensity} tCO2</span></p>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <Leaf className="w-4 h-4" />
                          <span>자원 순환 재활용률</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400">우리: <span className="font-mono text-white font-bold">{result.userCalculated.recyclingRate}%</span></p>
                          <p className="text-slate-400">우수: <span className="font-mono text-emerald-400 font-bold">{result.benchmark.recyclingRate}%</span></p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* BENTO BLOCK 4: AI Executive Diagnosis Summary (4 cols row-span-4 in preview design) */}
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Sparkles className="w-32 h-32 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                      <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                      <span className="uppercase tracking-widest text-xs">AI EXECUTIVE STRATEGIC INSIGHT</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mb-2">지속가능 경영 총평 및 비즈니스 영향</h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium bg-slate-950/60 p-5 rounded-2xl border border-slate-800/50">
                      {result.aiFeedback.summary}
                    </p>
                  </div>

                  {/* BENTO BLOCK 5: AI PRIORITIES (List item bento style) */}
                  <div className="space-y-4" id="feedback_section">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-lg">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-white">우수기업 추격을 위한 핵심 보완 과제</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {result.aiFeedback.priorities && result.aiFeedback.priorities.map((item, index) => (
                        <motion.div
                          key={item.category + index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden group hover:border-slate-700 transition-all"
                        >
                          {/* Rank Badge absolute top right corner */}
                          <div className="absolute top-0 right-0 px-4 py-2 bg-slate-800 text-emerald-400 text-xs font-mono font-bold rounded-bl-2xl border-l border-b border-slate-800">
                            PRIORITY {item.rank < 10 ? `0${item.rank}` : item.rank}
                          </div>

                          <div className="flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 uppercase tracking-widest border border-slate-800">{item.categoryName}</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors pr-16">{item.title}</h4>
                            <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 inline-block">
                              지표 진단 격차: {item.gapDescription}
                            </p>
                          </div>

                          {/* Why it matters */}
                          <div className="space-y-1 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                            <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">리스크 진단 (RISK ASSESSMENT)</p>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                              {item.whyItMatters}
                            </p>
                          </div>

                          {/* Action plans */}
                          <div className="space-y-2">
                            <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center">
                              <Lightbulb className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                              단계별 구체적 실행 조치 (Action Plan)
                            </p>
                            <ul className="grid grid-cols-1 gap-2">
                              {item.actionPlan.map((action, actionIdx) => (
                                <li
                                  key={actionIdx}
                                  className="flex items-start text-xs text-slate-300 bg-slate-950/30 p-3 rounded-xl border border-slate-800/40 hover:bg-slate-800/40 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="font-semibold leading-relaxed">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* BENTO BLOCK 6: Warm concluding roadmap statement */}
                  <div className="bg-gradient-to-br from-slate-900 to-emerald-950/80 border border-emerald-500/20 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none">
                      <Sparkles className="w-48 h-48 text-emerald-400" />
                    </div>
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <Sparkles className="w-5 h-5" />
                        <span className="uppercase tracking-widest text-xs">ROADMAP CONCLUDING RECOMMENDATION</span>
                      </div>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-semibold">
                        {result.aiFeedback.overallFeedback}
                      </p>
                      <div className="h-px bg-slate-800/50 my-2" />
                      <div className="text-[10px] text-slate-500 font-mono leading-normal">
                        * 본 리포트의 가이드는 입력된 매출 및 정량 사용량을 기준으로 최고 수준의 지속가능 데이터베이스 및 국책 ESG 공시안을 반영하여 설계된 시뮬레이션입니다.
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950 py-12 text-center text-xs text-slate-500 font-mono" id="footer_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-bold text-slate-400">© 2026 ECO-SYNC SUSTAINABILITY BENCHMARK & AI AUDITOR</p>
          <p className="max-w-md mx-auto text-slate-600 leading-relaxed font-sans">
            지속가능한 성장은 데이터의 정확한 측정에서 시작됩니다. 기후변화 위기와 의무 규제 공시 시대에 맞춰 귀사의 안전한 성장을 지원합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
