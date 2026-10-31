import React, { useState, useMemo } from 'react';
import {
  History,
  X,
  Search,
  Trash2,
  Download,
  Mail,
  Phone,
  AtSign,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Clock,
  Filter,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { InvestigationHistoryItem } from '../types/intelbase';
import { Lang, i18n } from '../utils/translations';
import { Emblem } from './Emblem';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Lang;
  history: InvestigationHistoryItem[];
  onSelect: (item: InvestigationHistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  history,
  onSelect,
  onClear,
}) => {
  const t = i18n[lang];
  const [filter, setFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'phone' | 'email' | 'username'>('all');
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const filtered = useMemo(() => {
    return history.filter((h) => {
      const matchesSearch =
        h.targetValue.toLowerCase().includes(filter.toLowerCase()) ||
        h.targetType.toLowerCase().includes(filter.toLowerCase());
      const matchesType = typeFilter === 'all' || h.targetType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [history, filter, typeFilter]);

  if (!isOpen) return null;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelbase_investigations_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'phone':
        return lang === 'uz' ? 'Telefon' : 'Phone';
      case 'email':
        return 'Email';
      case 'username':
        return lang === 'uz' ? 'Foydalanuvchi' : 'Username';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-black border-l-2 border-blue-500/80 w-full max-w-lg h-full flex flex-col shadow-2xl shadow-blue-950/80 relative overflow-hidden">
        {/* Radiant Blue Glows in background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header - Striking Black, Electric Blue & White */}
        <div className="p-5 border-b-2 border-blue-500/50 flex items-center justify-between bg-black/95 relative z-10 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <Emblem size="sm" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-white text-base tracking-tight flex items-center space-x-2">
                  <span>{lang === 'uz' ? 'Tergov & Qidiruv Tarixi' : t.history}</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono font-black border border-white shadow-sm shadow-blue-500/50">
                  {history.length}
                </span>
              </div>
              <p className="text-[11px] text-white font-bold">
                {lang === 'uz' ? 'Barcha saqlangan OSINT tekshiruvlari' : 'Saved intelligence lookups archive'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExport}
                  title={lang === 'uz' ? 'JSON formatda yuklab olish' : 'Export History (JSON)'}
                  className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-white border border-blue-400/50 hover:border-white transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setConfirmClear(true)}
                  title={lang === 'uz' ? 'Tarixni tozalash' : 'Clear History'}
                  className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-white border border-blue-400/50 hover:border-white transition-all shadow-sm active:scale-95"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-white border border-blue-400/50 hover:border-white transition-all shadow-sm active:scale-95"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Clear Confirmation Prompt if active */}
        {confirmClear && (
          <div className="p-4 bg-blue-950/90 border-b-2 border-white flex items-center justify-between gap-3 text-white relative z-10 animate-in fade-in">
            <div className="text-xs font-bold text-white">
              {lang === 'uz' ? 'Barcha qidiruvlar tarixini tozalashni tasdiqlaysizmi?' : 'Clear all search history items?'}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClear();
                  setConfirmClear(false);
                }}
                className="px-3 py-1 bg-white text-black font-black text-xs rounded-lg hover:bg-blue-100 transition-all shadow-sm"
              >
                {lang === 'uz' ? 'Ha, tozalansin' : 'Yes, Clear'}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1 bg-black text-white font-bold text-xs rounded-lg border border-blue-400 hover:border-white transition-all"
              >
                {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Filter Input & Category Tabs */}
        <div className="p-4 border-b-2 border-blue-500/40 bg-black/90 space-y-3 relative z-10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-white" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={lang === 'uz' ? 'Qidiruv (raqam, email yoki nik)...' : 'Search by phone, email or username...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061026] border-2 border-blue-500/60 text-white placeholder-white/60 text-xs font-mono font-bold focus:outline-none focus:border-white shadow-inner transition-all"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                typeFilter === 'all'
                  ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-500/50'
                  : 'bg-[#061026] text-white border border-blue-500/40 hover:border-white'
              }`}
            >
              {lang === 'uz' ? 'Barchasi' : 'All'} ({history.length})
            </button>
            <button
              onClick={() => setTypeFilter('phone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1 ${
                typeFilter === 'phone'
                  ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-500/50'
                  : 'bg-[#061026] text-white border border-blue-500/40 hover:border-white'
              }`}
            >
              <Phone className="w-3 h-3 text-white" />
              <span>{lang === 'uz' ? 'Telefon' : 'Phone'}</span>
            </button>
            <button
              onClick={() => setTypeFilter('email')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1 ${
                typeFilter === 'email'
                  ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-500/50'
                  : 'bg-[#061026] text-white border border-blue-500/40 hover:border-white'
              }`}
            >
              <Mail className="w-3 h-3 text-white" />
              <span>Email</span>
            </button>
            <button
              onClick={() => setTypeFilter('username')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1 ${
                typeFilter === 'username'
                  ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-500/50'
                  : 'bg-[#061026] text-white border border-blue-500/40 hover:border-white'
              }`}
            >
              <AtSign className="w-3 h-3 text-white" />
              <span>{lang === 'uz' ? 'Nik' : 'Username'}</span>
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
          {filtered.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="flex justify-center">
                <Emblem size="lg" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white">
                  {lang === 'uz' ? 'Tarix boʻsh yoki natija topilmadi' : 'History is empty or no match'}
                </p>
                <p className="text-xs text-white/80 font-bold max-w-xs mx-auto">
                  {lang === 'uz'
                    ? 'Telefon raqami yoki email kiritib qidiruvni boshlang. Natijalar avtomatik bu yerda saqlanadi.'
                    : 'Start a search with phone number or email to populate investigation archives.'}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isPhone = item.targetType === 'phone';
              const isEmail = item.targetType === 'email';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#071330] via-[#040b1c] to-black border-2 border-blue-500/60 hover:border-white hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer transition-all duration-200 flex items-center justify-between group transform hover:-translate-y-0.5"
                >
                  <div className="space-y-2 flex-1 mr-3">
                    {/* Top Row: Type Badge + Value */}
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center border border-white shadow-md shadow-blue-600/40 flex-shrink-0">
                        {isPhone ? (
                          <Phone className="w-4 h-4 text-white" />
                        ) : isEmail ? (
                          <Mail className="w-4 h-4 text-white" />
                        ) : (
                          <AtSign className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-white group-hover:text-sky-300 transition-colors truncate drop-shadow-sm">
                            {item.targetValue}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-white/90">
                          {getTypeLabel(item.targetType)} OSINT Tergovi
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Stats & Timestamp */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black border border-white/80 shadow-sm text-[11px] flex items-center space-x-1">
                        <Layers className="w-3 h-3 text-white" />
                        <span>{item.accountsFound} ta manba</span>
                      </span>

                      {item.breachCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-700 text-white font-black border border-white shadow-sm text-[11px] flex items-center space-x-1">
                          <ShieldAlert className="w-3 h-3 text-white" />
                          <span>{item.breachCount} ta xavf</span>
                        </span>
                      )}

                      <span className="text-white font-bold text-[11px] flex items-center space-x-1 ml-auto">
                        <Clock className="w-3 h-3 text-white" />
                        <span>
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center pl-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/30 group-hover:bg-blue-600 border border-blue-400 group-hover:border-white flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-black border-t-2 border-blue-500/50 flex items-center justify-between text-xs text-white font-bold relative z-10">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Mahalliy xavfsiz kesh xotirasi</span>
          </div>
          <span className="font-mono text-[11px] text-white font-black">
            {filtered.length} ta yozuv
          </span>
        </div>
      </div>
    </div>
  );
};
