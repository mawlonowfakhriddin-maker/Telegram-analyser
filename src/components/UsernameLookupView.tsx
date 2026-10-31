import React, { useState } from 'react';
import {
  Search,
  AtSign,
  UserCheck,
  Users,
  Shield,
  Sparkles,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Activity,
  Layers,
  Copy,
  Check,
  Camera,
  CheckCircle,
  XCircle,
  Terminal,
} from 'lucide-react';
import { UsernameLookupResponse, HarvestedAccount, IdentityGroup } from '../types/intelbase';
import { Lang, i18n } from '../utils/translations';
import { Emblem } from './Emblem';

interface UsernameLookupViewProps {
  lang: Lang;
  loading: boolean;
  onSearch: (params: {
    username: string;
    timeout_ms: number;
    include_ai: boolean;
  }) => void;
  result: UsernameLookupResponse | null;
  onPivotToUsername: (username: string) => void;
  onRequestAiReport: () => void;
}

export const UsernameLookupView: React.FC<UsernameLookupViewProps> = ({
  lang,
  loading,
  onSearch,
  result,
  onPivotToUsername,
  onRequestAiReport,
}) => {
  const t = i18n[lang];
  const [usernameInput, setUsernameInput] = useState<string>('shadow_agent');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [timeoutMs, setTimeoutMs] = useState<number>(20000);
  const [includeAi, setIncludeAi] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profiles' | 'identity' | 'unregistered' | 'json'>('profiles');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    onSearch({
      username: usernameInput.trim(),
      timeout_ms: timeoutMs,
      include_ai: includeAi,
    });
  };

  const handleCopyJson = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'one_person':
        return {
          label: lang === 'uz' ? 'Aniq 1 Shaxs (One Person)' : 'Single Person (Confirmed)',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        };
      case 'mostly_one_person':
        return {
          label: lang === 'uz' ? 'Katta Ehtimol Bilan 1 Shaxs' : 'Mostly One Person',
          color: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        };
      case 'multiple_people':
        return {
          label: lang === 'uz' ? 'Bir Nechta Har Xil Odamlar' : 'Multiple Distinct People',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
      case 'unlinked':
        return {
          label: lang === 'uz' ? 'Bogʻlanmagan (Unlinked)' : 'Unlinked Profiles',
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        };
      default:
        return {
          label: lang === 'uz' ? 'Yetarli Maʼlumot Yoʻq' : 'Insufficient Data',
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner - Strict Blue, White & Black with Emblem */}
      <div className="bg-black/95 p-6 rounded-2xl border-2 border-blue-500/70 shadow-2xl shadow-blue-950/80 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Emblem size="lg" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
              <span>{t.tabUsername}</span>
            </h2>
            <p className="text-xs text-white font-bold">
              {lang === 'uz'
                ? "Foydalanuvchi nomini (nik) 580+ platformalar bo'ylab qidirish va sun'iy intellekt orqali qaysi akkauntlar bitta odamga tegishli ekanligini klasterlash."
                : 'Check usernames across 580+ sites and use IntelBase AI identity grouping to disambiguate personas.'}
            </p>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={t.searchPlaceholderUsername}
                required
                className="w-full pl-12 pr-32 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-white" />
                    <span>{t.searching}</span>
                  </>
                ) : (
                  <>
                    <span>{t.runLookup}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Suggestions & Options */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span>{t.quickExamples}</span>
                <button
                  type="button"
                  onClick={() => setUsernameInput('shadow_agent')}
                  className="font-mono text-cyan-400 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
                >
                  shadow_agent
                </button>
                <button
                  type="button"
                  onClick={() => setUsernameInput('fakhriddin-cyber')}
                  className="font-mono text-cyan-400 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
                >
                  fakhriddin-cyber
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  {showAdvanced
                    ? lang === 'uz'
                      ? 'Sozlamalarni yopish'
                      : 'Hide Settings'
                    : lang === 'uz'
                    ? 'Sozlamalar (timeout, AI identity)'
                    : 'Settings (timeout, AI identity)'}
                </span>
              </button>
            </div>

            {/* Advanced Configuration Panel */}
            {showAdvanced && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Timeout (ms): {timeoutMs}ms
                  </label>
                  <input
                    type="range"
                    min={5000}
                    max={60000}
                    step={1000}
                    value={timeoutMs}
                    onChange={(e) => setTimeoutMs(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="username_ai_check"
                    checked={includeAi}
                    onChange={(e) => setIncludeAi(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="username_ai_check" className="text-slate-300 cursor-pointer">
                    include_ai (Identity clustering & face verification)
                  </label>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Target Header */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <AtSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-white text-base">
                  @{result.meta?.username || usernameInput}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {result.identifier?.accounts?.length || 0} profiles discovered •{' '}
                  {result.validator?.registered?.length || 0} sites confirmed
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onRequestAiReport}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t.generateAiReport}</span>
              </button>

              <button
                onClick={handleCopyJson}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Identity Disambiguation Card */}
          {result.identity && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-blue-900/40 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-cyan-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 text-sm">
                      {lang === 'uz'
                        ? 'IntelBase AI Identifikatsiya Tahlili'
                        : 'IntelBase AI Identity Disambiguation'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {result.identity.summary}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    getVerdictBadge(result.identity.verdict).color
                  }`}
                >
                  {getVerdictBadge(result.identity.verdict).label}
                </span>
              </div>

              {/* Groups breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {result.identity.groups.map((group: IdentityGroup, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        {group.avatar ? (
                          <div className="relative">
                            <img
                              src={group.avatar}
                              alt={group.name || 'Group Avatar'}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                            {group.avatar_face && (
                              <span
                                title="Biometric face detected"
                                className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-blue-600 text-[10px] text-white"
                              >
                                <Camera className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                            G{group.id}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-slate-200 text-xs block">
                            {group.name || `Persona Group #${group.id + 1}`}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {group.sites.length} linked platforms
                          </span>
                        </div>
                      </div>

                      {group.id === 0 ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                          Main Persona
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          Alternate Group
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {group.sites.map((site, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-[11px]"
                        >
                          {site}
                        </span>
                      ))}
                    </div>

                    {group.matches && group.matches.length > 0 && (
                      <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-900">
                        {group.matches.map((m, mIdx) => (
                          <div key={mIdx} className="flex items-center justify-between font-mono">
                            <span>
                              {m.a} ↔ {m.b}
                            </span>
                            <span className="text-emerald-400 font-semibold">
                              {Math.round((m.confidence || 0.95) * 100)}% match ({m.via})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Navigation */}
          <div className="border-b border-slate-800 flex items-center space-x-2 text-xs">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-3.5 py-2 font-medium rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'profiles'
                  ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                {lang === 'uz' ? 'Topilgan Profillar' : 'Harvested Profiles'} (
                {result.identifier?.accounts?.length || 0})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('unregistered')}
              className={`px-3.5 py-2 font-medium rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'unregistered'
                  ? 'bg-slate-900 text-slate-200 border-t-2 border-slate-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>
                {t.unregisteredServices} ({result.validator?.unregistered?.length || 0})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3.5 py-2 font-medium rounded-t-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'json'
                  ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{t.rawJson}</span>
            </button>
          </div>

          {/* Tab Content: Profiles */}
          {activeTab === 'profiles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(result.identifier?.accounts || []).map((acc: HarvestedAccount, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {acc.data.avatar_url ? (
                        <img
                          src={acc.data.avatar_url}
                          alt={acc.module.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                          {acc.module.name_formatted?.[0] || '@'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm">
                          {acc.module.name_formatted}
                        </h4>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {acc.module.domain}
                        </span>
                      </div>
                    </div>

                    {acc.data.profile_url && (
                      <a
                        href={acc.data.profile_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-cyan-400 p-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                    {acc.data.full_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Name:</span>
                        <span className="text-slate-200">{acc.data.full_name}</span>
                      </div>
                    )}
                    {acc.data.followers !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Followers:</span>
                        <span className="text-cyan-400 font-bold">{acc.data.followers}</span>
                      </div>
                    )}
                    {acc.data.creation_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Registered:</span>
                        <span className="text-slate-400">
                          {new Date(acc.data.creation_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {acc.data.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-slate-300">{acc.data.location}</span>
                      </div>
                    )}
                    {acc.data.bio && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-2 pt-1">
                        "{acc.data.bio}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Unregistered Sites */}
          {activeTab === 'unregistered' && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>Checked Platforms with No Record</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(result.validator?.unregistered || []).map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono"
                  >
                    {m.name_formatted}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: JSON */}
          {activeTab === 'json' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px]">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
