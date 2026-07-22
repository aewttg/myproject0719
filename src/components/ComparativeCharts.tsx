import React, { useState } from 'react';
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
import { Zap, Globe, Leaf, FileText, Users, ArrowUpRight, BarChart3, Target, Trash2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ComparativeChartsProps {
  result: AnalysisResult;
}

export default function ComparativeCharts({ result }: ComparativeChartsProps) {
  const [activeTab, setActiveTab] = useState<'radar' | 'bar'>('radar');

  const benchmarkName = result.targetCompanyDetail?.name || result.targetCompany || '우수 선도기업';
  const shortBenchmarkName = result.targetCompanyDetail?.name 
    ? (result.targetCompanyDetail.name.length > 6 ? result.targetCompanyDetail.name.substring(0, 5) + '..' : result.targetCompanyDetail.name)
    : (result.targetCompany ? (result.targetCompany.length > 6 ? result.targetCompany.substring(0, 5) + '..' : result.targetCompany) : '우수');

  // Multi-dimensional metrics scored out of 100
  const getRadarChartsData = () => {
    // 1. Energy Score (Lower is better)
    const energyScore = result.userCalculated.energyIntensity <= result.benchmark.energyIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.energyIntensity - result.benchmark.energyIntensity) / result.benchmark.energyIntensity) * 100));

    // 2. Renewable Score (Higher is better)
    const renewableScore = result.benchmark.renewableRate > 0
      ? Math.min(120, Math.round((result.userCalculated.renewableRate / result.benchmark.renewableRate) * 100))
      : 100;

    // 3. GHG Score (Lower is better)
    const ghgScore = result.userCalculated.ghgIntensity <= result.benchmark.ghgIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.ghgIntensity - result.benchmark.ghgIntensity) / result.benchmark.ghgIntensity) * 100));

    // 4. Waste Score (Lower is better)
    const wasteScore = result.userCalculated.wasteIntensity <= result.benchmark.wasteIntensity
      ? 100
      : Math.max(10, Math.round(100 - ((result.userCalculated.wasteIntensity - result.benchmark.wasteIntensity) / result.benchmark.wasteIntensity) * 100));

    // 5. Recycling Score (Higher is better)
    const recyclingScore = result.benchmark.recyclingRate > 0
      ? Math.min(120, Math.round((result.userCalculated.recyclingRate / result.benchmark.recyclingRate) * 100))
      : 100;

    // 6. Disclosure Score (Higher is better)
    const disclosureScorePct = Math.round((result.userCalculated.disclosureScore / result.benchmark.disclosureScore) * 100);

    return [
      {
        subject: '에너지 효율',
        '우리 기업 (역량점수)': Math.min(100, energyScore),
        '우수기업 기준': 100,
        rawUser: `${result.userCalculated.energyIntensity.toFixed(0)} MWh/10억`,
        rawBenchmark: `${result.benchmark.energyIntensity} MWh/10억`
      },
      {
        subject: '재생에너지 전환',
        '우리 기업 (역량점수)': Math.min(100, renewableScore),
        '우수기업 기준': 100,
        rawUser: `${result.userCalculated.renewableRate}%`,
        rawBenchmark: `${result.benchmark.renewableRate}%`
      },
      {
        subject: '탄소배출 제어',
        '우리 기업 (역량점수)': Math.min(100, ghgScore),
        '우수기업 기준': 100,
        rawUser: `${result.userCalculated.ghgIntensity.toFixed(1)} tCO2/10억`,
        rawBenchmark: `${result.benchmark.ghgIntensity} tCO2/10억`
      },
      {
        subject: '폐기물 저감',
        '우리 기업 (역량점수)': Math.min(100, wasteScore),
        '우수기업 기준': 100,
        rawUser: `${result.userCalculated.wasteIntensity.toFixed(2)} 톤/10억`,
        rawBenchmark: `${result.benchmark.wasteIntensity} 톤/10억`
      },
      {
        subject: '자원 재활용률',
        '우리 기업 (역량점수)': Math.min(120, recyclingScore),
        '우수기업 기준': 100,
        rawUser: `${result.userCalculated.recyclingRate}%`,
        rawBenchmark: `${result.benchmark.recyclingRate}%`
      },
      {
        subject: '정보공개 투명성',
        '우리 기업 (역량점수)': Math.min(120, disclosureScorePct),
        '우수기업 기준': 100,
        rawUser: `${result.userCalculated.disclosureScore}점`,
        rawBenchmark: `${result.benchmark.disclosureScore}점`
      }
    ];
  };

  const getDirectBarData = () => {
    return [
      {
        name: '에너지 MWh/10억',
        '우리 기업': Math.round(result.userCalculated.energyIntensity),
        [benchmarkName]: result.benchmark.energyIntensity,
      },
      {
        name: '재생에너 %',
        '우리 기업': result.userCalculated.renewableRate,
        [benchmarkName]: result.benchmark.renewableRate,
      },
      {
        name: '온실가 tCO2/10억',
        '우리 기업': Math.round(result.userCalculated.ghgIntensity * 10) / 10,
        [benchmarkName]: result.benchmark.ghgIntensity,
      },
      {
        name: '폐기물 톤/10억',
        '우리 기업': Math.round(result.userCalculated.wasteIntensity * 100) / 100,
        [benchmarkName]: result.benchmark.wasteIntensity,
      },
      {
        name: '재활용률 %',
        '우리 기업': result.userCalculated.recyclingRate,
        [benchmarkName]: result.benchmark.recyclingRate,
      }
    ];
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">BENCHMARK COMPARATIVE VISUAL</h4>
          <h3 className="text-base font-extrabold text-white mt-0.5">우리 기업 vs {benchmarkName} 지표 상세</h3>
        </div>

        {/* Premium Tab Selectors */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'radar' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            종합 역량 방사형
          </button>
          <button
            onClick={() => setActiveTab('bar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'bar' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            개별 수치 직접 비교
          </button>
        </div>
      </div>

      {/* Recharts Wrapper */}
      <div className="h-72 w-full flex items-center justify-center" id="chart_container">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'radar' ? (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarChartsData()}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 120]} tick={{ fill: '#475569', fontSize: 9 }} />
              <Radar name="우리 기업 (점수)" dataKey="우리 기업 (역량점수)" stroke="#34d399" strokeWidth={2} fill="#10b981" fillOpacity={0.25} />
              <Radar name={benchmarkName} dataKey="우수기업 기준" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }}
                formatter={(value: any, name: any, props: any) => {
                  const payload = props.payload as any;
                  return [`${value}점 (${name === '우리 기업 (점수)' ? payload.rawUser : payload.rawBenchmark})`, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8', marginTop: '10px' }} />
            </RadarChart>
          ) : (
            <BarChart data={getDirectBarData()} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="우리 기업" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey={benchmarkName} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Calculated Intensities Bento list */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-[11px]">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>에너지 강도</span>
          </div>
          <p className="text-slate-400">우리: <span className="font-mono text-white font-bold">{result.userCalculated.energyIntensity.toFixed(0)}</span></p>
          <p className="text-slate-400">{shortBenchmarkName}: <span className="font-mono text-emerald-400 font-bold">{result.benchmark.energyIntensity}</span></p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <Leaf className="w-3.5 h-3.5" />
            <span>재생에너지 비율</span>
          </div>
          <p className="text-slate-400">우리: <span className="font-mono text-white font-bold">{result.userCalculated.renewableRate}%</span></p>
          <p className="text-slate-400">{shortBenchmarkName}: <span className="font-mono text-emerald-400 font-bold">{result.benchmark.renewableRate}%</span></p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1 text-rose-400 font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>온실가스 강도</span>
          </div>
          <p className="text-slate-400">우리: <span className="font-mono text-white font-bold">{result.userCalculated.ghgIntensity.toFixed(1)}</span></p>
          <p className="text-slate-400">{shortBenchmarkName}: <span className="font-mono text-emerald-400 font-bold">{result.benchmark.ghgIntensity}</span></p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1 text-indigo-400 font-bold">
            <Trash2 className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
            <span>폐기물 강도</span>
          </div>
          <p className="text-slate-400">우리: <span className="font-mono text-white font-bold">{result.userCalculated.wasteIntensity.toFixed(2)}</span></p>
          <p className="text-slate-400">{shortBenchmarkName}: <span className="font-mono text-emerald-400 font-bold">{result.benchmark.wasteIntensity}</span></p>
        </div>
      </div>
    </div>
  );
}
export type { ComparativeChartsProps };
