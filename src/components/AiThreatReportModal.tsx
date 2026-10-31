import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  Printer,
  Copy,
  Check,
  Compass,
  FileText,
  UserCheck,
} from 'lucide-react';
import { AIAnalysisResult } from '../types/intelbase';
import { Lang, i18n } from '../utils/translations';
import { Emblem } from './Emblem';

interface AiThreatReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  targetType: 'email' | 'username' | 'phone';
  targetValue: string;
  analysis: AIAnalysisResult | null;
  loading: boolean;
}

export const AiThreatReportModal: React.FC<AiThreatReportModalProps> = ({
  isOpen,
  onClose,
  lang,
  targetType,
  targetValue,
  analysis,
  loading,
}) => {
  const t = i18n[lang];
  const [copied, setCopied] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const getThreatBadge = (level: string = 'MODERATE') => {
    switch (level) {
      case 'CRITICAL':
        return { label: 'CRITICAL THREAT', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
      case 'HIGH':
        return { label: 'HIGH RISK', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };
      case 'ELEVATED':
        return { label: 'ELEVATED RISK', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'MODERATE':
        return { label: 'MODERATE RISK', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' };
      case 'LOW':
        return { label: 'LOW RISK', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      default:
        return { label: level, color: 'bg-slate-700 text-slate-200' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReport = () => {
    if (!analysis) return;
    const text = `INTELBASE OSINT & THREAT INTELLIGENCE DOSSIER
Target: ${targetValue} (${targetType})
Threat Level: ${analysis.threatLevel}
Date: ${new Date().toISOString()}

EXECUTIVE SUMMARY:
${analysis.executiveSummary}

KEY FINDINGS:
${analysis.keyFindings.map((f) => `- ${f}`).join('\n')}

IDENTITY ASSESSMENT:
${analysis.identityAssessment || 'Single Persona'}

SOC REMEDIATION ACTIONS:
${analysis.remediationSteps.map((s) => `- ${s}`).join('\n')}

PIVOT TRAILS:
${(analysis.pivotOpportunities || []).map((p) => `- ${p}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badge = getThreatBadge(analysis?.threatLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-500/40 flex items-center justify-between bg-black/95">
          <div className="flex items-center space-x-3">
            <Emblem size="md" />
            <div>
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <span>{t.aiAnalystSummary}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Target: {targetValue} ({targetType})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              title="Print Brief"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyReport}
              title="Copy Summary Text"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-slate-300 font-medium">{t.generatingAi}</p>
              <p className="text-xs text-slate-500">
                IntelBase telemetriyasi, sizib chiqqan hisob maʼlumotlari va profil klasterlari tahlil qilinmoqda...
              </p>
            </div>
          ) : analysis ? (
            <>
              {/* Threat Level Indicator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-mono block">
                    {t.threatLevel}
                  </span>
                  <span className="font-bold text-slate-200 text-base">
                    Cyber Exposure Assessment
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Xulosa (Executive Summary)</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans">
                  {analysis.executiveSummary}
                </div>
              </div>

              {/* Key Findings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Muhim Xavf Koʻrsatkichlari (Key Findings)</span>
                </h4>
                <div className="space-y-1.5">
                  {analysis.keyFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2"
                    >
                      <span className="text-cyan-400 font-bold shrink-0">•</span>
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identity Assessment */}
              {analysis.identityAssessment && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Identifikatsiya & Shaxs Tahlili</span>
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    {analysis.identityAssessment}
                  </div>
                </div>
              )}

              {/* Prioritized SOC Remediation Guidance */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.remediationTitle}</span>
                </h4>
                <div className="space-y-1.5">
                  {analysis.remediationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex items-start space-x-2"
                    >
                      <span className="font-bold text-emerald-400">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pivot Opportunities */}
              {analysis.pivotOpportunities && analysis.pivotOpportunities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Compass className="w-4 h-4 text-purple-400" />
                    <span>{t.pivotSuggestions}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.pivotOpportunities.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-purple-950/30 border border-purple-800/40 text-purple-300 text-xs font-mono"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            IntelBase Intelligence Engine • SOC IR Standard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
