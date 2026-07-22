import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  Globe,
  Leaf,
  FileText,
  Users,
  Target,
  CheckCircle2,
  Lightbulb,
  Building2,
  Trash2,
  Bookmark
} from 'lucide-react';
import { AnalysisResult, AIPriority } from '../types';

interface AIFeedbackPanelProps {
  result: AnalysisResult;
}

export default function AIFeedbackPanel({ result }: AIFeedbackPanelProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'renewable':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'ghg':
        return <Globe className="w-5 h-5 text-rose-400" />;
      case 'waste':
        return <Trash2 className="w-5 h-5 text-indigo-400" />;
      case 'recycling':
        return <Leaf className="w-5 h-5 text-teal-400" />;
      case 'target':
        return <Target className="w-5 h-5 text-purple-400" />;
      case 'disclosure':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'social':
        return <Users className="w-5 h-5 text-indigo-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Summary */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles className="w-32 h-32 text-emerald-400" />
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="uppercase tracking-widest text-xs">AI EXECUTIVE STRATEGIC INSIGHT</span>
        </div>
        <h3 className="text-base font-extrabold text-white mb-2">지속가능 경영 총평 및 비즈니스 영향</h3>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium bg-slate-950/60 p-5 rounded-2xl border border-slate-800/50">
          {result.aiFeedback.summary}
        </p>
      </div>

      {/* Priorities list */}
      <div className="space-y-4">
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
              {/* Rank Badge */}
              <div className="absolute top-0 right-0 px-4 py-2 bg-slate-800 text-emerald-400 text-xs font-mono font-bold rounded-bl-2xl border-l border-b border-slate-800">
                PRIORITY {item.rank < 10 ? `0${item.rank}` : item.rank}
              </div>

              <div className="flex items-center gap-2">
                {getCategoryIcon(item.category)}
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 uppercase tracking-widest border border-slate-800">
                  {item.categoryName}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors pr-16">
                  {item.title}
                </h4>
                <p className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 inline-block">
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

      {/* Warm concluding statement */}
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

    </div>
  );
}
export type { AIFeedbackPanelProps };
