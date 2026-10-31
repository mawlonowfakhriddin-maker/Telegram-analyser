import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Server,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  Zap,
} from 'lucide-react';
import { Lang, i18n } from '../utils/translations';
import { Emblem } from './Emblem';
import {
  fetchAccountIp,
  testIntelBaseKey,
  setStoredApiKey,
  getStoredApiKey,
  setStoredMode,
} from '../services/intelbaseApi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  onSaveKey: (key: string) => void;
  onSwitchToDemo: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSaveKey,
  onSwitchToDemo,
}) => {
  const t = i18n[lang];
  const [keyInput, setKeyInput] = useState<string>('');
  const [ip, setIp] = useState<string>('Yuklanmoqda...');
  const [copiedIp, setCopiedIp] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    status?: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getStoredApiKey());
      setTestResult(null);
      fetchAccountIp().then((res) => setIp(res.ip));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (ip && !ip.includes(' ')) {
      navigator.clipboard.writeText(ip);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  const handleTestKey = async () => {
    if (!keyInput.trim()) {
      setTestResult({
        valid: false,
        message:
          lang === 'uz'
            ? 'Iltimos, avval x-api-key kiriting'
            : 'Please enter an API key first',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await testIntelBaseKey(keyInput.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    setStoredApiKey(keyInput.trim());
    onSaveKey(keyInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-blue-500/40 flex items-center justify-between bg-black/95">
          <div className="flex items-center space-x-3">
            <Emblem size="sm" />
            <div>
              <h3 className="font-bold text-white text-base">
                {t.apiKeyModalTitle}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                https://api.intelbase.is
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-sm text-slate-300">
          {/* IP Whitelist Warning Box */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 text-blue-300 font-medium text-xs">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>{t.ipStatus}</span>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-[11px] font-mono text-cyan-300 transition-colors"
              >
                {copiedIp ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t.copyIp}</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2 bg-slate-950/80 rounded-lg font-mono text-xs text-cyan-300 select-all border border-blue-900/50 break-all">
              {ip}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'uz'
                ? "IntelBase xavfsizlik qoidasiga ko'ra, har bir API so'rovi faqat sizning IntelBase hisobingizda (dashboard) Whitelist ro'yxatiga kiritilgan IP manzildan kelishi shart. Yuqoridagi IP ni boshqaruv panelingizga kiriting."
                : 'IntelBase API requires that your lookup requests originate from an IP whitelisted in your dashboard. Whitelist the exact IP above.'}
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              IntelBase API Key (`x-api-key`)
            </label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="ib_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{t.apiKeyHelp}</span>
              <a
                href="https://intelbase.is/docs"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center space-x-1"
              >
                <span>Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                testResult.valid
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold">
                  {testResult.valid
                    ? lang === 'uz'
                      ? 'Ulanish Muvaffaqiyatli!'
                      : 'Connection Verified!'
                    : lang === 'uz'
                    ? 'Ulanishda Xatolik'
                    : 'Connection Failed'}
                </p>
                <p className="text-[11px] opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Quick Demo Switch Suggestion */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <p className="text-xs font-semibold text-amber-300 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {lang === 'uz' ? 'Kalitsiz sinab koʻrish' : 'Test without API key'}
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                {lang === 'uz'
                  ? 'Toʻliq interaktiv simulyatsiya rejimi bilan hamma modullarni darhol sinab koʻring.'
                  : 'Use full interactive simulation mode to explore all features instantly.'}
              </p>
            </div>
            <button
              onClick={() => {
                onSwitchToDemo();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-medium border border-amber-600/40 shrink-0 transition-colors"
            >
              {lang === 'uz' ? 'Demo Rejim' : 'Demo Mode'}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <button
            onClick={handleTestKey}
            disabled={testing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50 flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{testing ? 'Tekshirilmoqda...' : t.testConnection}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              {t.close}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
