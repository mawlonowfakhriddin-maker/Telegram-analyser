import React, { useState } from 'react';
import {
  Boxes,
  Search,
  CheckSquare,
  Square,
  Copy,
  Check,
  Filter,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { AccountModule } from '../types/intelbase';
import { Lang, i18n } from '../utils/translations';

interface ModulesExplorerViewProps {
  lang: Lang;
  modules: AccountModule[];
}

export const ModulesExplorerView: React.FC<ModulesExplorerViewProps> = ({
  lang,
  modules,
}) => {
  const t = i18n[lang];
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<number | 'all'>('all');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const filtered = modules.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.name_formatted.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleSelect = (name: string) => {
    if (selectedModules.includes(name)) {
      setSelectedModules(selectedModules.filter((x) => x !== name));
    } else {
      setSelectedModules([...selectedModules, name]);
    }
  };

  const selectAllFiltered = () => {
    const names = filtered.map((m) => m.name);
    setSelectedModules(Array.from(new Set([...selectedModules, ...names])));
  };

  const clearSelection = () => {
    setSelectedModules([]);
  };

  const handleCopyConfig = () => {
    const code = `"include_modules": ${JSON.stringify(selectedModules, null, 2)}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 0:
        return { label: 'Type 0: Profile Data (Email)', color: 'bg-blue-500/10 text-cyan-400 border-blue-500/20' };
      case 1:
        return { label: 'Type 1: Registration Check (Email)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 2:
        return { label: 'Type 2: Username Site', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 3:
        return { label: 'Type 3: Phone Module', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default:
        return { label: `Type ${type}`, color: 'bg-slate-800 text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Boxes className="w-6 h-6 text-blue-400" />
              <span>{t.tabModules}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'uz'
                ? "IntelBase API tomonidan qo'llab-quvvatlanadigan barcha razvedka va tekshiruv modullari katalogi (GET /lookup/modules)."
                : 'Complete registry of IntelBase intelligence modules supported by GET /lookup/modules.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Jami Modullar: <strong className="text-cyan-400">{modules.length}</strong>
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Modul nomi yoki domen boʻyicha qidirish (google, github, spotify)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">Barcha Turlar (All Types)</option>
              <option value={0}>Type 0: Profil Maʼlumotlari (Email)</option>
              <option value={1}>Type 1: Roʻyxatdan Oʻtganlik (Email)</option>
              <option value={2}>Type 2: Nik / Username Saytlari</option>
              <option value={3}>Type 3: Telefon Modullari</option>
            </select>
          </div>
        </div>
      </div>

      {/* Code generator for selected modules */}
      {selectedModules.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-100">
                {selectedModules.length} ta modul tanlandi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              include_modules: [{selectedModules.slice(0, 4).join(', ')}{selectedModules.length > 4 ? ` +${selectedModules.length - 4}` : ''}]
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyConfig}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-md shadow-blue-500/20"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? t.copied : 'JSON Kodni Nusxalash'}</span>
            </button>
            <button
              onClick={clearSelection}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Tozalash
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Koʻrsatilmoqda: {filtered.length} ta modul</span>
        <div className="space-x-2">
          <button
            onClick={selectAllFiltered}
            className="hover:text-cyan-400 transition-colors"
          >
            Filtrdagilarni tanlash
          </button>
          <span>•</span>
          <button
            onClick={clearSelection}
            className="hover:text-cyan-400 transition-colors"
          >
            Tanlovni bekor qilish
          </button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((mod) => {
          const isSelected = selectedModules.includes(mod.name);
          const typeBadge = getTypeLabel(mod.type);

          return (
            <div
              key={mod.id || mod.name}
              onClick={() => toggleSelect(mod.name)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2.5 ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-cyan-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(mod.name);
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                  <div>
                    <h4 className="font-semibold text-slate-100 text-xs">
                      {mod.name_formatted}
                    </h4>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {mod.name}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://${mod.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-500 hover:text-slate-300 p-1"
                  title={mod.domain}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-800/80">
                <span className="text-slate-500">{mod.domain}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${typeBadge.color}`}>
                  Type {mod.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
