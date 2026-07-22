import React from 'react';
import {
  Building2,
  CheckCircle,
  XCircle,
  Zap,
  Globe,
  Trash2,
  RotateCcw,
  Award,
  Sparkles,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { IndustryBenchmark, TargetCompanyPreset } from '../types';

interface BenchmarkRegistryProps {
  selectedIndustry: IndustryBenchmark | undefined;
}

export default function BenchmarkRegistry({ selectedIndustry }: BenchmarkRegistryProps) {
  if (!selectedIndustry) return null;

  // Prepare chart data comparing selected industry benchmarks with its best-performing companies
  const chartData = selectedIndustry.targetCompanies.map(company => ({
    name: company.name,
    '에너지 강도 (MWh)': Math.round(company.energyIntensity),
    '재생에너지 비율 (%)': company.renewableRate,
    '온실가스 강도 (tCO2)': Math.round(company.ghgIntensity * 10) / 10,
    '폐기물 강도 (톤)': Math.round(company.wasteIntensity * 100) / 100,
    '재활용률 (%)': company.recyclingRate,
  }));

  // Add the industry benchmark (average of top 10%) as a standard baseline comparison
  chartData.push({
    name: '업계 우수평균 (Top 10%)',
    '에너지 강도 (MWh)': Math.round(selectedIndustry.energyIntensity),
    '재생에너지 비율 (%)': selectedIndustry.renewableRate,
    '온실가스 강도 (tCO2)': Math.round(selectedIndustry.ghgIntensity * 10) / 10,
    '폐기물 강도 (톤)': Math.round(selectedIndustry.wasteIntensity * 100) / 100,
    '재활용률 (%)': selectedIndustry.recyclingRate,
  });

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6" id="benchmark_registry_card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">BENCHMARK REGISTRY</h4>
            <h3 className="text-lg font-extrabold text-white">동종 업계 우수 선도 기업 데이터</h3>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-bold font-mono">
          {selectedIndustry.name.split(' (')[0]}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        아래 기업들은 업종 내에서 환경 정보 공시가 투명하며, 에너지 효율 및 순환 자원 사용 지표가 공인된 최우수 선도 모델입니다. 우리 기업의 지속가능 사업 로드맵을 설계할 때 가장 객관적인 기준점으로 작동합니다.
      </p>

      {/* Grid of best performing companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedIndustry.targetCompanies.map((company, index) => (
          <div key={company.name} className="bg-slate-950/60 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase tracking-wider border border-emerald-500/20">
                  선도 기업 0{index + 1}
                </span>
                <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  {company.name}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800/80">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>정상 가동 중</span>
              </div>
            </div>

            {/* Feature Highlight Badge */}
            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/15 text-xs text-emerald-300 font-semibold flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="leading-normal">{company.highlight}</p>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 space-y-0.5">
                <span className="text-slate-500 block">에너지 사용 집약도</span>
                <span className="font-mono text-white font-bold">{company.energyIntensity}</span> <span className="text-slate-500 text-[9px]">MWh/10억</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 space-y-0.5">
                <span className="text-slate-500 block">재생에너지 사용률</span>
                <span className="font-mono text-emerald-400 font-bold">{company.renewableRate}%</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 space-y-0.5">
                <span className="text-slate-500 block">온실가스 배출 집약도</span>
                <span className="font-mono text-white font-bold">{company.ghgIntensity}</span> <span className="text-slate-500 text-[9px]">tCO2/10억</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 space-y-0.5">
                <span className="text-slate-500 block">폐기물 배출 집약도</span>
                <span className="font-mono text-rose-400 font-bold">{company.wasteIntensity}</span> <span className="text-slate-500 text-[9px]">톤/10억</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 space-y-0.5 col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">폐기물 재활용률</span>
                  <span className="font-mono text-white font-extrabold">{company.recyclingRate}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${company.recyclingRate}%` }} />
                </div>
              </div>
            </div>

            {/* Qualitative indicators */}
            <div className="flex gap-4 pt-1.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                {company.hasTarget ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span className={company.hasTarget ? 'text-slate-300 font-bold' : 'text-slate-500'}>환경 목표 수립</span>
              </div>
              <div className="flex items-center gap-1.5">
                {company.hasDisclosure ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span className={company.hasDisclosure ? 'text-slate-300 font-bold' : 'text-slate-500'}>환경 정보 공식공시</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Comparison Graph */}
      <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <p className="text-xs font-bold text-white">우수기업별 핵심 정량 지표 상호 비교 차트</p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 500 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
              <Bar dataKey="재생에너지 비율 (%)" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="재활용률 (%)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="온실가스 강도 (tCO2)" fill="#f43f5e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
