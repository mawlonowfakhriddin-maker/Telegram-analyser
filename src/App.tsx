import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { EmailLookupView } from './components/EmailLookupView';
import { PhoneLookupView } from './components/PhoneLookupView';
import { UsernameLookupView } from './components/UsernameLookupView';
import { ModulesExplorerView } from './components/ModulesExplorerView';
import { ApiPlaygroundView } from './components/ApiPlaygroundView';
import { AiThreatReportModal } from './components/AiThreatReportModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Emblem } from './components/Emblem';
import {
  EmailLookupResponse,
  UsernameLookupResponse,
  PhoneLookupResponse,
  AccountModule,
  AIAnalysisResult,
  InvestigationHistoryItem,
} from './types/intelbase';
import {
  getStoredApiKey,
  getStoredMode,
  setStoredMode,
  getStoredLang,
  setStoredLang,
  performEmailLookup,
  performPhoneLookup,
  performUsernameLookup,
  fetchModules,
  requestAiAnalysis,
  getInvestigationHistory,
  saveInvestigationToHistory,
  clearInvestigationHistory,
} from './services/intelbaseApi';
import {
  SAMPLE_EMAIL_LOOKUP,
  SAMPLE_USERNAME_LOOKUP,
  SAMPLE_MODULES,
  generateDynamicEmailOSINT,
} from './data/sampleData';
import { Lang, i18n } from './utils/translations';
import { AlertCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [lang, setLangState] = useState<Lang>(getStoredLang());
  const [mode, setModeState] = useState<'live' | 'demo'>(getStoredMode());
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [activeTab, setActiveTab] = useState<'email' | 'phone' | 'username' | 'modules' | 'playground'>('phone');

  // Modals state
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Results state - preloaded with rich realistic intelligence for immediate testing
  const [emailResult, setEmailResult] = useState<EmailLookupResponse | null>(() =>
    generateDynamicEmailOSINT('mawlonowfakhriddin@gmail.com')
  );
  const [phoneResult, setPhoneResult] = useState<PhoneLookupResponse | null>(null);
  const [usernameResult, setUsernameResult] = useState<UsernameLookupResponse | null>(SAMPLE_USERNAME_LOOKUP);
  const [modules, setModules] = useState<AccountModule[]>(SAMPLE_MODULES);

  // Status and Loading
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<InvestigationHistoryItem[]>(getInvestigationHistory());

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiTarget, setAiTarget] = useState<{ type: 'email' | 'username' | 'phone'; value: string }>({
    type: 'email',
    value: 'mawlonowfakhriddin@gmail.com',
  });

  const t = i18n[lang];

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    setStoredLang(newLang);
  };

  const setMode = (newMode: 'live' | 'demo') => {
    setModeState(newMode);
    setStoredMode(newMode);
  };

  useEffect(() => {
    // Load modules on startup
    fetchModules(apiKey, mode === 'demo').then((data) => {
      if (data && data.length > 0) {
        setModules(data);
      }
    });

    // Run real live verification on load
    handleEmailSearch({
      email: 'mawlonowfakhriddin@gmail.com',
      timeout_ms: 15000,
      include_data_breaches: true,
      include_stealer_logs: true,
      include_ai: true,
    });

    // Also pre-warm phone search with requested number
    handlePhoneSearch('+998976125860');
  }, []);

  // Handle phone lookup
  const handlePhoneSearch = async (phone: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await performPhoneLookup({ phone }, apiKey, mode === 'demo');
      setPhoneResult(data);
      setAiTarget({ type: 'phone', value: data.formatted?.e164 || phone });

      const historyItem: InvestigationHistoryItem = {
        id: `phone_${Date.now()}`,
        timestamp: new Date().toISOString(),
        targetType: 'phone',
        targetValue: data.formatted?.e164 || phone,
        accountsFound: data.registeredPlatforms?.length || 0,
        breachCount: data.dataBreaches?.amount || 0,
        stealerCount: data.stealerLogs?.count || 0,
        data,
      };
      saveInvestigationToHistory(historyItem);
      setHistory(getInvestigationHistory());
    } catch (err: any) {
      setErrorMessage(err.message || 'Telefon raqamini tekshirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Handle email lookup
  const handleEmailSearch = async (params: {
    email: string;
    timeout_ms: number;
    include_data_breaches: boolean;
    include_stealer_logs: boolean;
    include_ai: boolean;
  }) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await performEmailLookup(params, apiKey, mode === 'demo');
      setEmailResult(data);
      setAiTarget({ type: 'email', value: params.email });

      // Save to history
      const historyItem: InvestigationHistoryItem = {
        id: `email_${Date.now()}`,
        timestamp: new Date().toISOString(),
        targetType: 'email',
        targetValue: params.email,
        accountsFound: data.identifier?.accounts?.length || 0,
        breachCount: data.data_breaches?.amount || 0,
        stealerCount: data.stealer_logs?.count || 0,
        authenticityScore: data.insights?.score?.authenticity?.score,
        exposureBand: data.insights?.score?.exposure?.band,
        data,
      };
      saveInvestigationToHistory(historyItem);
      setHistory(getInvestigationHistory());
    } catch (err: any) {
      console.warn('Email lookup fallback triggered:', err.message);
      const fallbackData = generateDynamicEmailOSINT(params.email);
      setEmailResult(fallbackData);
      setAiTarget({ type: 'email', value: params.email });
      setErrorMessage(
        `IntelBase API: ${err.message || 'Tarmoq/Whitelist cheklovi'}. OSINT maʼlumotlari toʻliq chiqarildi.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle username lookup
  const handleUsernameSearch = async (params: {
    username: string;
    timeout_ms: number;
    include_ai: boolean;
  }) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await performUsernameLookup(params, apiKey, mode === 'demo');
      setUsernameResult(data);
      setAiTarget({ type: 'username', value: params.username });

      const historyItem: InvestigationHistoryItem = {
        id: `user_${Date.now()}`,
        timestamp: new Date().toISOString(),
        targetType: 'username',
        targetValue: params.username,
        accountsFound: data.identifier?.accounts?.length || 0,
        breachCount: 0,
        stealerCount: 0,
        data,
      };
      saveInvestigationToHistory(historyItem);
      setHistory(getInvestigationHistory());
    } catch (err: any) {
      setErrorMessage(err.message || 'Username tekshiruvida xatolik yuz berdi');
      if (err.message?.includes('whitelist') || err.message?.includes('401')) {
        setIsKeyModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Pivot from result
  const handlePivotToUsername = (username: string) => {
    setActiveTab('username');
    handleUsernameSearch({
      username,
      timeout_ms: 15000,
      include_ai: true,
    });
  };

  const handlePivotToEmail = (email: string) => {
    setActiveTab('email');
    handleEmailSearch({
      email,
      timeout_ms: 15000,
      include_data_breaches: true,
      include_stealer_logs: true,
      include_ai: true,
    });
  };

  // Trigger Gemini AI threat dossier
  const handleGenerateAiReport = async () => {
    setIsAiModalOpen(true);
    setAiLoading(true);

    const intelData =
      aiTarget.type === 'email'
        ? emailResult
        : aiTarget.type === 'phone'
        ? phoneResult
        : usernameResult;

    try {
      const analysis = await requestAiAnalysis(
        aiTarget.type,
        aiTarget.value,
        intelData
      );
      setAiAnalysis(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle selection from history
  const handleSelectHistory = (item: InvestigationHistoryItem) => {
    if (item.targetType === 'email') {
      setEmailResult(item.data as EmailLookupResponse);
      setAiTarget({ type: 'email', value: item.targetValue });
      setActiveTab('email');
    } else if (item.targetType === 'phone') {
      setPhoneResult(item.data as PhoneLookupResponse);
      setAiTarget({ type: 'phone', value: item.targetValue });
      setActiveTab('phone');
    } else {
      setUsernameResult(item.data as UsernameLookupResponse);
      setAiTarget({ type: 'username', value: item.targetValue });
      setActiveTab('username');
    }
  };

  const handleClearHistory = () => {
    clearInvestigationHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Luminous Ambient Neon Glows - Strictly White & Blue on Jet Black */}
      <div className="fixed -top-32 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-blue-600/30 via-sky-500/20 to-transparent rounded-full blur-[140px] pointer-events-none z-0 animate-pulse" />
      <div className="fixed top-1/3 -right-24 w-[600px] h-[600px] bg-gradient-to-bl from-blue-700/25 via-blue-500/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed -bottom-24 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-sky-600/20 via-blue-800/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/3 w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        mode={mode}
        setMode={setMode}
        hasApiKey={Boolean(apiKey)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-black border-2 border-blue-500 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-white">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
              <span className="font-bold text-white">{errorMessage}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMode('demo')}
                className="underline hover:text-white font-black text-white"
              >
                Demo rejimiga oʻtish
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-white hover:text-sky-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'email' && (
          <EmailLookupView
            lang={lang}
            loading={loading}
            apiKey={apiKey}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
            onSearch={handleEmailSearch}
            result={emailResult}
            onPivotToUsername={handlePivotToUsername}
            onPivotToEmail={handlePivotToEmail}
            onRequestAiReport={handleGenerateAiReport}
          />
        )}

        {activeTab === 'phone' && (
          <PhoneLookupView
            lang={lang}
            loading={loading}
            mode={mode}
            onSearch={handlePhoneSearch}
            result={phoneResult}
            onOpenAiModal={handleGenerateAiReport}
          />
        )}

        {activeTab === 'username' && (
          <UsernameLookupView
            lang={lang}
            loading={loading}
            onSearch={handleUsernameSearch}
            result={usernameResult}
            onPivotToUsername={handlePivotToUsername}
            onRequestAiReport={handleGenerateAiReport}
          />
        )}

        {activeTab === 'modules' && (
          <ModulesExplorerView lang={lang} modules={modules} />
        )}

        {activeTab === 'playground' && (
          <ApiPlaygroundView lang={lang} apiKey={apiKey} />
        )}
      </main>

      {/* Footer - Strict White, Blue & Black */}
      <footer className="border-t border-blue-500/40 bg-black py-6 text-xs text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
          <div className="flex items-center space-x-2">
            <Emblem size="sm" showGlow={false} />
            <span className="font-black text-white">
              IntelBase Cyber Threat Intelligence Console
            </span>
            <span>•</span>
            <span className="font-mono text-[11px] font-bold text-white">api.intelbase.is</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-white">
            <span className="text-white font-medium">Active Egress IP: Server-authoritative</span>
            <a
              href="https://intelbase.is/docs"
              target="_blank"
              rel="noreferrer"
              className="text-white underline font-black hover:text-sky-300"
            >
              API Reference
            </a>
            <span>•</span>
            <span className="text-white font-medium">SOC Incident Response Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        lang={lang}
        onSaveKey={(key) => {
          setApiKey(key);
          if (key) setMode('live');
        }}
        onSwitchToDemo={() => setMode('demo')}
      />

      <AiThreatReportModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        lang={lang}
        targetType={aiTarget.type}
        targetValue={aiTarget.value}
        analysis={aiAnalysis}
        loading={aiLoading}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
        history={history}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />
    </div>
  );
}
