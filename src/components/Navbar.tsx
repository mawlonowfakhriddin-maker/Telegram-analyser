import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Key,
  Globe,
  Radio,
  History,
  Copy,
  Check,
  Zap,
  ExternalLink,
  Server
} from 'lucide-react';
import { Lang, i18n } from '../utils/translations';
import { fetchAccountIp } from '../services/intelbaseApi';
import { Emblem } from './Emblem';

interface NavbarProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  mode: 'live' | 'demo';
  setMode: (mode: 'live' | 'demo') => void;
  hasApiKey: boolean;
  onOpenKeyModal: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  activeTab: string;
  setActiveTab: (tab: 'email' | 'phone' | 'username' | 'modules' | 'playground') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  mode,
  setMode,
  hasApiKey,
  onOpenKeyModal,
  onOpenHistory,
  historyCount,
  activeTab,
  setActiveTab,
}) => {
  const [ip, setIp] = useState<string>('Yuklanmoqda...');
  const [copiedIp, setCopiedIp] = useState<boolean>(false);
  const t = i18n[lang];

  useEffect(() => {
    fetchAccountIp().then((res) => {
      setIp(res.ip);
    });
  }, []);

  const handleCopyIp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ip && !ip.includes(' ')) {
      navigator.clipboard.writeText(ip);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  return (
    <header className="border-b border-blue-500/40 bg-black/95 backdrop-blur-xl sticky top-0 z-40 shadow-xl shadow-blue-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Blue & White Heraldic Emblem & Brand */}
          <div className="flex items-center space-x-3.5 group cursor-pointer">
            <Emblem size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-white drop-shadow-md">
                  IntelBase
                </span>
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white border border-sky-300 shadow-sm shadow-blue-500/30">
                  api.intelbase.is
                </span>
              </div>
              <p className="text-xs text-white hidden sm:block font-bold">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Strict Black, Blue & White Palette */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-black p-1.5 rounded-2xl border-2 border-blue-500/50 shadow-inner">
            <button
              onClick={() => setActiveTab('email')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                activeTab === 'email'
                  ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/50 border border-sky-400'
                  : 'text-white hover:text-white hover:bg-blue-950/60'
              }`}
            >
              {t.tabEmail}
            </button>
            <button
              onClick={() => setActiveTab('phone')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                activeTab === 'phone'
                  ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/60 border border-sky-300 scale-105'
                  : 'text-white hover:text-white hover:bg-blue-950/60'
              }`}
            >
              {t.tabPhone}
            </button>
            <button
              onClick={() => setActiveTab('username')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                activeTab === 'username'
                  ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/50 border border-sky-400'
                  : 'text-white hover:text-white hover:bg-blue-950/60'
              }`}
            >
              {t.tabUsername}
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                activeTab === 'modules'
                  ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/50 border border-sky-400'
                  : 'text-white hover:text-white hover:bg-blue-950/60'
              }`}
            >
              {t.tabModules}
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all ${
                activeTab === 'playground'
                  ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/50 border border-sky-400'
                  : 'text-white hover:text-white hover:bg-blue-950/60'
              }`}
            >
              {t.tabApiDocs}
            </button>
          </nav>

          {/* Right Controls: IP Whitelist Egress, Mode Toggle, Key Modal, Lang, History */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Egress IP Badge */}
            <div
              onClick={handleCopyIp}
              title={`IntelBase sees requests from this IP: ${ip}. Click to copy for Whitelist.`}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-black border-2 border-blue-500/60 hover:border-sky-300 cursor-pointer text-xs transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-mono text-[11px] font-bold max-w-[120px] truncate">
                {ip}
              </span>
              <button
                type="button"
                className="text-white hover:text-sky-300 transition-colors pl-1"
                aria-label="Copy IP"
              >
                {copiedIp ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <Copy className="w-3 h-3 text-white" />
                )}
              </button>
            </div>

            {/* Mode Toggle: Live vs Demo */}
            <button
              onClick={() => setMode(mode === 'live' ? 'demo' : 'live')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                mode === 'live'
                  ? 'bg-blue-600 text-white border-sky-300 shadow-md shadow-blue-600/40'
                  : 'bg-black text-white border-blue-500 hover:bg-blue-950'
              }`}
            >
              <Radio className="w-3 h-3 animate-ping text-white" />
              <span className="text-white">{mode === 'live' ? 'Live API' : 'Demo Mode'}</span>
            </button>

            {/* API Key Config Button */}
            <button
              onClick={onOpenKeyModal}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 ${
                hasApiKey
                  ? 'bg-black text-white border-blue-500 hover:bg-blue-950'
                  : 'bg-blue-600 text-white border-sky-300 shadow-lg shadow-blue-600/50'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline text-white">{t.apiKeyBtn}</span>
              {hasApiKey && (
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              )}
            </button>

            {/* History Drawer Button */}
            <button
              onClick={onOpenHistory}
              title={t.history}
              className="p-1.5 rounded-xl bg-black border-2 border-blue-500/70 text-white hover:bg-blue-950 transition-colors relative"
            >
              <History className="w-4 h-4 text-white" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-[10px] font-black rounded-full flex items-center justify-center text-white border border-sky-300">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'uz' ? 'en' : 'uz')}
              className="px-2.5 py-1 rounded-xl bg-black border-2 border-blue-500/70 text-xs font-mono font-black text-white hover:bg-blue-950 transition-colors uppercase"
            >
              {lang}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-blue-500/40 text-xs">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-2.5 py-1 rounded-lg font-black ${
              activeTab === 'email' ? 'bg-blue-600 text-white' : 'text-white'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`px-2.5 py-1 rounded-lg font-black ${
              activeTab === 'phone' ? 'bg-blue-600 text-white' : 'text-white'
            }`}
          >
            Telefon
          </button>
          <button
            onClick={() => setActiveTab('username')}
            className={`px-2.5 py-1 rounded-lg font-black ${
              activeTab === 'username' ? 'bg-blue-600 text-white' : 'text-white'
            }`}
          >
            Nik
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-3 py-1 rounded-lg font-black ${
              activeTab === 'modules' ? 'bg-blue-600 text-white' : 'text-white'
            }`}
          >
            {t.tabModules}
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1 rounded-lg font-black ${
              activeTab === 'playground' ? 'bg-blue-600 text-white' : 'text-white'
            }`}
          >
            API
          </button>
        </div>
      </div>
    </header>
  );
};
