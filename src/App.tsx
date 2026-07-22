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
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import local types and subcomponents
import { IndustryBenchmark, AnalysisResult } from './types';
import { DEFAULT_INDUSTRIES } from './data/industryPresets';
import { runClientSideAnalysis } from './utils/analysisEngine';
import BenchmarkRegistry from './components/BenchmarkRegistry';
import ComparativeCharts from './components/ComparativeCharts';
import AIFeedbackPanel from './components/AIFeedbackPanel';
import {
  Factory,
  Laptop,
  ShoppingBag,
  Shirt,
  Truck,
  HardHat
} from 'lucide-react';

export default function App() {
  const [industries, setIndustries] = useState<IndustryBenchmark[]>(DEFAULT_INDUSTRIES);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('manufacturing');
  const [companyName, setCompanyName] = useState<string>('');
  const [revenue, setRevenue] = useState<string>('120'); // 기본값 120억 원
  const [energyUsage, setEnergyUsage] = useState<string>('18000'); // 기본값 18000 MWh
  const [renewableRate, setRenewableRate] = useState<number>(12); // 기본값 12%
  const [ghgEmissions, setGhgEmissions] = useState<string>('4200'); // 기본값 4200 tCO2eq
  const [wasteAmount, setWasteAmount] = useState<string>('150'); // 기본값 150 톤 (신설!)
  const [recyclingRate, setRecyclingRate] = useState<number>(60); // 기본값 60%
  const [hasTarget, setHasTarget] = useState<boolean>(false); // 신설!
  const [hasDisclosure, setHasDisclosure] = useState<boolean>(false); // 신설!
  const [disclosureScore, setDisclosureScore] = useState<number>(55); 
  const [socialScore, setSocialScore] = useState<number>(65); 
  const [targetCompany, setTargetCompany] = useState<string>(''); // 목표 벤치마킹 기업
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch industry presets from API
  useEffect(() => {
    fetch('/api/industry-presets')
      .then((res) => {
        if (!res.ok) throw new Error('업종 프리셋 데이터를 불러오지 못했습니다.');
        return res.json();
      })
      .then((resJson) => {
        if (resJson.status === 'success' && Array.isArray(resJson.data) && resJson.data.length > 0) {
          setIndustries(resJson.data);
          setSelectedIndustryId((prev) => {
            if (resJson.data.some((i: IndustryBenchmark) => i.id === prev)) {
              return prev;
            }
            return resJson.data[0].id;
          });
        }
      })
      .catch((err) => {
        console.error('API Industry Presets Error:', err);
      });
  }, []);

  const getIndustryIcon = (id: string) => {
    switch (id) {
      case 'manufacturing':
        return <Factory className="w-4 h-4" />;
      case 'it-service':
        return <Laptop className="w-4 h-4" />;
      case 'food-retail':
        return <ShoppingBag className="w-4 h-4" />;
      case 'fashion-textile':
        return <Shirt className="w-4 h-4" />;
      case 'logistics-transport':
        return <Truck className="w-4 h-4" />;
      case 'construction':
        return <HardHat className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const selectedIndustry = industries.find((i) => i.id === selectedIndustryId);

  // Reassuring loading messages
  useEffect(() => {
    if (!loading) return;
    const steps = [
      '선택한 업종의 우수 기업 벤치마크 데이터를 정밀 수집하는 중...',
      '입력하신 매출 및 정량 사용량 대비 에너지·폐기물·온실가스 집약도 지표를 연동 계산 중...',
      '지표별 격차(Gap) 분석 및 주요 보완 우선순위를 판별하는 중...',
      'Gemini AI 비즈니스 컨설턴트가 부족 원인과 실천 가능한 개선 방향을 생성 중...',
      '마지막 고품질 분석 보고서를 예쁘게 가공하고 있습니다...'
    ];
    let currentIndex = 0;
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < steps.length) {
        setLoadingStep(steps[currentIndex]);
      }
    }, 1500);

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
      let isSuccess = false;
      let analysisData = null;

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
            renewableRate,
            ghgEmissions: Number(ghgEmissions) || 0,
            wasteAmount: Number(wasteAmount) || 0,
            recyclingRate,
            hasTarget,
            hasDisclosure,
            disclosureScore,
            socialScore,
            targetCompany: targetCompany.trim() || undefined
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.status === 'success') {
            isSuccess = true;
            analysisData = resJson.data;
          } else if (response.status === 400 || (resJson.message && resJson.message.includes('지속가능성 정보'))) {
            throw new Error(resJson.message);
          }
        } else {
          const errJson = await response.json().catch(() => null);
          if (response.status === 400 && errJson?.message) {
            throw new Error(errJson.message);
          }
        }
      } catch (apiErr: any) {
        if (apiErr.message && (apiErr.message.includes('지속가능성 정보') || apiErr.message.includes('확인할 수 없습니다') || apiErr.message.includes('입력해 주세요'))) {
          throw apiErr;
        }
        console.warn('Backend API call fallback activated for Vercel/External deployment.', apiErr);
      }

      if (!isSuccess || !analysisData) {
        const curIndustry = selectedIndustry || DEFAULT_INDUSTRIES[0];
        analysisData = runClientSideAnalysis({
          selectedIndustry: curIndustry,
          companyName,
          revenue: Number(revenue),
          energyUsage: Number(energyUsage) || 0,
          renewableRate,
          ghgEmissions: Number(ghgEmissions) || 0,
          wasteAmount: Number(wasteAmount) || 0,
          recyclingRate,
          hasTarget,
          hasDisclosure,
          disclosureScore,
          socialScore,
          targetCompany: targetCompany.trim() || undefined
        });
      }

      setResult(analysisData);
      setTimeout(() => {
        document.getElementById('analysis-result-title')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);

    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate overall grade
  const calculateGradeAndGap = () => {
    if (!result) return { grade: 'B-', gapText: '25%', gapLevel: '보통 (Moderate Gap)' };

    // Simple aggregate score calculation to decide a Grade
    const energyScore = result.userCalculated.energyIntensity <= result.benchmark.energyIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.energyIntensity - result.benchmark.energyIntensity) / result.benchmark.energyIntensity) * 100));

    const ghgScore = result.userCalculated.ghgIntensity <= result.benchmark.ghgIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.ghgIntensity - result.benchmark.ghgIntensity) / result.benchmark.ghgIntensity) * 100));

    const wasteScore = result.userCalculated.wasteIntensity <= result.benchmark.wasteIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.wasteIntensity - result.benchmark.wasteIntensity) / result.benchmark.wasteIntensity) * 100));

    const renewableScore = result.benchmark.renewableRate > 0 ? Math.min(100, Math.round((result.userCalculated.renewableRate / result.benchmark.renewableRate) * 100)) : 100;
    const recyclingScore = result.benchmark.recyclingRate > 0 ? Math.min(100, Math.round((result.userCalculated.recyclingRate / result.benchmark.recyclingRate) * 100)) : 100;
    const disclosureScorePct = Math.min(100, Math.round((result.userCalculated.disclosureScore / result.benchmark.disclosureScore) * 100));
    const socialScorePct = Math.min(100, Math.round((result.userCalculated.socialScore / result.benchmark.socialScore) * 100));

    const avgScore = (energyScore + renewableScore + ghgScore + wasteScore + recyclingScore + disclosureScorePct + socialScorePct) / 7;

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
      result.gaps.renewableGapPct,
      result.gaps.ghgGapPct,
      result.gaps.wasteGapPct,
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
                <span className="hidden xs:inline-block px-2 py-0.5 text-[9px] bg-slate-900 text-slate-400 font-mono border border-slate-800 rounded-full">v1.5</span>
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
        
        {/* HERO INTRO CARD */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800/80 p-6 sm:p-8 relative overflow-hidden shadow-2xl" id="hero_section">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 p-12 opacity-5 pointer-events-none">
            <Activity className="w-80 h-80 text-emerald-400" />
          </div>
          <div className="relative z-10 max-w-4xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>지속가능한 사업의 조건과 격차 정밀 매핑</span>
            </div>
            <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-white">
              우수 선도 기업의 ESG 데이터를 분석하고,<br />
              사용자의 비즈니스를 정밀 매핑하여 <span className="text-emerald-400">성장 로드맵</span>을 제안합니다.
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
              에너지 사용량, 재생에너지 비율, 온실가스 탄소 배출, 폐기물 발생 및 재활용율 등 6대 핵심 지속가능성 정량 지표를 우수 기업 선도 모델과 입체적으로 비교합니다. 
              최고 수준의 Gemini 3.5 AI 컨설턴트가 사업 성장의 위협 요인을 사전에 완벽히 분석하고 우선순위에 맞춰 실천적인 계획을 수립합니다.
            </p>
          </div>
        </section>

        {/* MAIN LAYOUT (Form + Dashboards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT FORM: 5 Cols */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 01: Industry Presets selector */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl" id="industry_preset_card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-emerald-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">STEP 01</h3>
                  <p className="text-base font-extrabold text-white">비교 대상 업종 및 벤치마크 선택</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    지속가능 경영 비교 업종 선택
                  </label>

                  {/* Interactive Industry Cards Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {industries.map((ind) => {
                      const isSelected = ind.id === selectedIndustryId;
                      return (
                        <button
                          key={ind.id}
                          type="button"
                          onClick={() => setSelectedIndustryId(ind.id)}
                          className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/60 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'}`}>
                              {getIndustryIcon(ind.id)}
                            </div>
                            <span className={`text-xs font-bold block truncate ${isSelected ? 'text-emerald-300 font-extrabold' : 'text-slate-200'}`}>
                              {ind.name.split(' (')[0]}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown Select Alternative */}
                  <div className="pt-1">
                    <select
                      value={selectedIndustryId}
                      onChange={(e) => setSelectedIndustryId(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 font-semibold focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                    >
                      {industries.map((ind) => (
                        <option key={ind.id} value={ind.id} className="bg-slate-900 text-slate-100">
                          {ind.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedIndustry && (
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3.5 text-xs">
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
                        핵심 이행 과제 (Key Challenge)
                      </p>
                      <p className="text-slate-300 font-semibold">{selectedIndustry.keyChallenge}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 02: Business Data Input Form */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl" id="input_data_form_card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">STEP 02</h3>
                  <p className="text-base font-extrabold text-white">우리 사업 데이터 정밀 입력</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name and Revenue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">회사 / 사업명 <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="예: (주)한울테크"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none transition-all"
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
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-3.5 pr-14 py-2.5 text-xs sm:text-sm text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-xs font-bold text-slate-500 font-sans">
                        억 원
                      </div>
                    </div>
                  </div>
                </div>

                {/* Energy Usage & Renewable energy % */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">연간 에너지 사용량</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="예: 18000"
                        value={energyUsage}
                        onChange={(e) => setEnergyUsage(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-3.5 pr-14 py-2.5 text-xs sm:text-sm text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-xs font-bold text-slate-500 font-sans">
                        MWh
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-widest">재생에너지 사용률</span>
                      <span className="text-emerald-400 font-extrabold font-mono">{renewableRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={renewableRate}
                      onChange={(e) => setRenewableRate(Number(e.target.value))}
                      className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                  </div>
                </div>

                {/* GHG Carbon emission & Waste production amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">연간 온실가스 배출량</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="예: 4200"
                        value={ghgEmissions}
                        onChange={(e) => setGhgEmissions(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-3.5 pr-16 py-2.5 text-xs sm:text-sm text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 ml-2 pointer-events-none text-[11px] font-bold text-slate-500 font-sans">
                        tCO2eq
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">연간 폐기물 발생량</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="예: 150"
                        value={wasteAmount}
                        onChange={(e) => setWasteAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-3.5 pr-14 py-2.5 text-xs sm:text-sm text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-xs font-bold text-slate-500 font-sans">
                        톤 (Tons)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualitative Goal Checkboxes / Toggles */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setHasTarget(!hasTarget)}
                    className="flex flex-col items-start gap-1 p-2 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800/80 text-left transition-all cursor-pointer"
                  >
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">환경 목표 수립 여부</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {hasTarget ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-600" />
                      )}
                      <span className={`text-[11px] font-bold ${hasTarget ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {hasTarget ? '목표 보유' : '목표 없음'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasDisclosure(!hasDisclosure)}
                    className="flex flex-col items-start gap-1 p-2 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800/80 text-left transition-all cursor-pointer"
                  >
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">환경 정보 공시 여부</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {hasDisclosure ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-600" />
                      )}
                      <span className={`text-[11px] font-bold ${hasDisclosure ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {hasDisclosure ? '공식 공개' : '비공개'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Sliders styled premium */}
                <div className="space-y-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                  {/* Recycling Rate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">자원 순환 재활용률</span>
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
                      <span>0% (매립)</span>
                      <span>50%</span>
                      <span>100% (재순환)</span>
                    </div>
                  </div>

                  {/* Disclosure Score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">ESG 정보공시 투명도</span>
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
                      <span>0점 (미관리)</span>
                      <span>50점</span>
                      <span>100점 (GRI 준수)</span>
                    </div>
                  </div>

                  {/* Social score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">사회적 책임 성과 점수</span>
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
                      <span>0점 (준비안됨)</span>
                      <span>50점</span>
                      <span>100점 (글로벌 표준)</span>
                    </div>
                  </div>
                </div>

                {/* Target Benchmark Company */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">목표로 삼는 기업 (선택)</label>
                    <span className="text-[9px] text-slate-500">예: 파타고니아, 풀무원, 애플</span>
                  </div>
                  <input
                    type="text"
                    placeholder="지속가능 환경의 롤모델 기업"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-semibold focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <p className="font-semibold leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="uppercase tracking-wide">격차 진단 및 AI 매핑 구동 중...</span>
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

          {/* RIGHT VIEW: 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
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

                  <div className="mt-8 font-mono text-[10px] text-slate-600 bg-slate-950/80 py-2 px-4 rounded-lg border border-slate-900">
                    GET_BENCHMARK_PRESETS_SUCCESS // EXPANDED_6_DIMENSIONAL_INGEST // AI_PROMPT_COMPILE
                  </div>
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  key="placeholder_widget"
                  className="space-y-6"
                >
                  {/* Real-time Benchmark Registry showing top companies for chosen industry */}
                  <BenchmarkRegistry selectedIndustry={selectedIndustry} />

                  <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[300px] shadow-2xl space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-md">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-white">지속가능 경영 격차 매핑 & AI 피드백 결과 대시보드</h3>
                      <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                        왼쪽 폼에 우리 사업의 6대 정량/정성 데이터를 채운 뒤 아래 [지속가능성 격차 매핑 및 AI 분석 실행] 단추를 눌러주세요. 격차 분석 그래프, 종합 등급 판정 및 맞춤형 AI 우선순위 로드맵이 이곳에 아름다운 Bento Grid 리포트로 생성됩니다.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* REPORT BOARD IS COMPLETED */}
              {!loading && result && (
                <motion.div
                  key="active_dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {result.targetCompanyDetail && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 animate-pulse">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              목표 기업 연계 완료
                            </span>
                          </div>
                          <h4 className="font-extrabold text-white text-sm sm:text-base mt-1.5">
                            검색 검증 완료: '{result.targetCompanyDetail.name}'
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed font-sans">
                            {result.targetCompanyDetail.highlight}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex sm:flex-col items-start sm:items-end gap-2 sm:gap-0.5 flex-shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">RE100/공시 상태</span>
                        <span className="text-xs text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          {result.targetCompanyDetail.hasTarget ? '✓ 목표 수립' : '미수립'} / {result.targetCompanyDetail.hasDisclosure ? '✓ 보고서 공시' : '미공시'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* BENTO STATS row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    
                    {/* Stat Card 1: Sustainability Gap */}
                    <div className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg hover:border-slate-700 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-black text-lg font-mono">
                        {gapText}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">최대 환경 격차 수준</p>
                        <p className="font-extrabold text-white text-sm sm:text-base">{gapLevel}</p>
                      </div>
                    </div>

                    {/* Stat Card 2: Current Grade */}
                    <div className="sm:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg hover:border-slate-700 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-2xl font-mono">
                        {grade}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">종합 지속가능 등급</p>
                        <p className="font-extrabold text-white text-sm sm:text-base">목표 벤치마크 등급: A+</p>
                      </div>
                    </div>

                  </div>

                  <h3 id="analysis-result-title" className="text-base font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    격차 종합 매핑 리포트
                  </h3>

                  {/* Charts */}
                  <ComparativeCharts result={result} />

                  {/* Benchmark registry shown underneath the graph for user's continuous reading */}
                  <BenchmarkRegistry selectedIndustry={selectedIndustry} />

                  {/* AI Diagnosis and Priority plans */}
                  <AIFeedbackPanel result={result} />

                  {/* Reset analysis */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>새로 분석하기 / 초기화</span>
                    </button>
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
            지속가능한 성장은 데이터의 정확한 측정에서 시작됩니다. 기후변화 위기와 글로벌 규제 공시 요구 국면에서 귀사의 안전한 성장을 완벽히 보좌합니다.
          </p>
        </div>
      </footer>

      {/* FULL-SCREEN GLASS-MORPHIC LOADING OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 200, damping: 25 }}
              className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Background Ambient Light */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Leaf Loader */}
              <div className="relative mb-6 mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-slate-800 border-t-emerald-400 border-r-emerald-400 animate-spin" style={{ animationDuration: '1s' }} />
                <div className="absolute inset-2 rounded-full border border-slate-800 border-b-blue-400 border-l-blue-400 animate-spin animate-reverse" style={{ animationDuration: '1.6s' }} />
                <Leaf className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>

              {/* Status Header */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                  ECO-SYNC AI Engine
                </span>
                <h3 className="text-lg font-extrabold text-white">지속가능 경영 정밀 분석 중</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  귀사의 맞춤형 6대 지속가능 지표와 로드맵을 수집 및 연산하고 있습니다.
                </p>
              </div>

              {/* Live Loading Steps */}
              <div className="mt-8 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 min-h-[110px] flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs sm:text-sm text-emerald-300 font-bold leading-relaxed max-w-sm"
                  >
                    {loadingStep}
                  </motion.p>
                </AnimatePresence>
                <span className="text-[9px] text-slate-500 font-mono mt-3 animate-pulse">
                  잠시만 기다려 주십시오...
                </span>
              </div>

              {/* Loading Bar */}
              <div className="mt-6 space-y-1.5">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-emerald-400 to-blue-500 h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 7, ease: 'easeInOut' }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                  <span>정량 연산</span>
                  <span>AI 분석 조립</span>
                  <span>최적화 완료</span>
                </div>
              </div>

              <div className="mt-6 text-[9px] text-slate-500 font-mono border-t border-slate-800/60 pt-4">
                SECURE SSL // NO_DATA_RETENTION // GEMINI_3.5_FLASH
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
