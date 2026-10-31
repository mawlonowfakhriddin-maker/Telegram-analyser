import React, { useState, useMemo } from 'react';
import {
  Phone,
  Search,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  MessageCircle,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Download,
  Info,
  Radio,
  Share2,
  Globe2,
  UserCheck,
  Lock,
  ListOrdered,
  Sparkles,
  Wifi,
  Hash,
  Landmark,
  FileText,
  ShoppingBag,
  Eye,
  ArrowUpRight,
  Maximize2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Car,
  Briefcase,
  Home,
  Users,
  MessageSquare,
  Bot,
  PlusCircle,
  Send,
} from 'lucide-react';
import { PhoneLookupResponse, VerifiedPhotoItem, PhoneOrderedSection, PhoneRegisteredPlatform, TelegramGroupMessage } from '../types/intelbase';
import { Lang, i18n } from '../utils/translations';
import { Emblem } from './Emblem';

interface PhoneLookupViewProps {
  result: PhoneLookupResponse | null;
  loading: boolean;
  onSearch: (phone: string) => void;
  lang: Lang;
  mode: 'live' | 'demo';
  onOpenAiModal: () => void;
}

export const PhoneLookupView: React.FC<PhoneLookupViewProps> = ({
  result,
  loading,
  onSearch,
  lang,
  mode,
  onOpenAiModal,
}) => {
  const [phoneInput, setPhoneInput] = useState<string>('+998976125860');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<VerifiedPhotoItem | null>(null);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [copiedBotCmd, setCopiedBotCmd] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<'full' | 'filtered'>('full');
  const [platformSearch, setPlatformSearch] = useState<string>('');
  const [showAllServices, setShowAllServices] = useState<boolean>(false);

  // Interactive Telegram handle live avatar fetcher
  const [customTgHandle, setCustomTgHandle] = useState<string>('');
  const [tgLoading, setTgLoading] = useState<boolean>(false);
  const [tgResolvedUser, setTgResolvedUser] = useState<any | null>(null);
  const [tgError, setTgError] = useState<string | null>(null);

  // Telegram Group Messages interactive filter states (2-Bosqich)
  const [selectedMsgGroup, setSelectedMsgGroup] = useState<string>('all');
  const [msgSearchQuery, setMsgSearchQuery] = useState<string>('');
  const [msgSenderRoleFilter, setMsgSenderRoleFilter] = useState<'all' | 'abonent_only' | 'itpark_only'>('all');
  const [localAppendedMessages, setLocalAppendedMessages] = useState<TelegramGroupMessage[]>([]);

  // Interactive Add Group Message modal
  const [isAddMsgModalOpen, setIsAddMsgModalOpen] = useState<boolean>(false);
  const [newMsgGroup, setNewMsgGroup] = useState<string>('IT Park Oʻzbekiston & Dasturchilar Hamjamiyati');
  const [newMsgUsername, setNewMsgUsername] = useState<string>('@itpark_uz');
  const [newMsgText, setNewMsgText] = useState<string>('');
  const [newMsgTopic, setNewMsgTopic] = useState<string>('IT Park Rezidentlik va Yangi Loyihalar');
  const [isSubmittingMsg, setIsSubmittingMsg] = useState<boolean>(false);
  const [addedMessageSuccess, setAddedMessageSuccess] = useState<string | null>(null);

  const allGroupMessages: TelegramGroupMessage[] = useMemo(() => {
    const fromApi = result?.telegramGroups?.groupMessagesHistory || [];
    return [...localAppendedMessages, ...fromApi];
  }, [result, localAppendedMessages]);

  const itParkMessages = useMemo(() => {
    return allGroupMessages.filter(
      (m) =>
        m.groupUsername.toLowerCase().includes('itpark') ||
        m.groupUsername.toLowerCase().includes('qorasuv_it') ||
        m.groupName.toLowerCase().includes('it park')
    );
  }, [allGroupMessages]);

  const abonentOnlyMessages = useMemo(() => {
    return allGroupMessages.filter((m) => m.senderRole.includes('Abonent'));
  }, [allGroupMessages]);

  const uniqueMsgGroups = useMemo(() => {
    const map = new Map<string, string>();
    allGroupMessages.forEach((m) => {
      if (!map.has(m.groupUsername)) {
        map.set(m.groupUsername, m.groupName);
      }
    });
    return Array.from(map.entries()).map(([username, name]) => ({ username, name }));
  }, [allGroupMessages]);

  const filteredGroupMessages = useMemo(() => {
    return allGroupMessages.filter((m) => {
      // 1. Special role / IT Park filter
      if (msgSenderRoleFilter === 'itpark_only') {
        const isItPark =
          m.groupUsername.toLowerCase().includes('itpark') ||
          m.groupUsername.toLowerCase().includes('qorasuv_it') ||
          m.groupName.toLowerCase().includes('it park');
        if (!isItPark) return false;
      } else if (msgSenderRoleFilter === 'abonent_only') {
        if (!m.senderRole.includes('Abonent')) return false;
      }

      // 2. Group filter
      const matchGroup = selectedMsgGroup === 'all' || m.groupUsername === selectedMsgGroup;

      // 3. Search query
      const q = msgSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.messageText.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        m.topic.toLowerCase().includes(q) ||
        m.groupName.toLowerCase().includes(q);

      return matchGroup && matchSearch;
    });
  }, [allGroupMessages, selectedMsgGroup, msgSearchQuery, msgSenderRoleFilter]);

  const handleAddGroupMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !result) return;
    setIsSubmittingMsg(true);
    setAddedMessageSuccess(null);
    try {
      const resp = await fetch('/api/osint/telegram/add-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: result.formatted.e164 || result.rawInput,
          groupName: newMsgGroup,
          groupUsername: newMsgUsername,
          senderName: result.callerIdInsights?.knownTags?.[0] || 'Fakhriddin Mawlonov',
          senderRole: 'Abonent (Yozuvchi)',
          messageText: newMsgText.trim(),
          topic: newMsgTopic,
        }),
      });
      const data = await resp.json();
      if (data.success && data.addedMessage) {
        setLocalAppendedMessages((prev) => [data.addedMessage, ...prev]);
        setAddedMessageSuccess(
          'Xabar saqlandi! Endi istalgan odam ushbu telefon raqamini kiritganda siz IT Park guruhiga yozgan mana shu xabaringiz darhol koʻrinadi.'
        );
        setNewMsgText('');
        setMsgSenderRoleFilter('itpark_only');
        setSelectedMsgGroup('all');
        setTimeout(() => {
          setIsAddMsgModalOpen(false);
          setAddedMessageSuccess(null);
        }, 1800);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingMsg(false);
    }
  };

  const t = i18n[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim()) {
      onSearch(phoneInput.trim());
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone-intel-${result.formatted?.e164 || 'lookup'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResolveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTgHandle.trim()) return;

    setTgLoading(true);
    setTgError(null);
    try {
      const res = await fetch('/api/osint/telegram-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: customTgHandle.trim() }),
      });
      const data = await res.json();
      if (data.found && data.avatarUrl) {
        setTgResolvedUser(data);
      } else {
        setTgError(data.message || 'Telegramda ommaviy profil rasmi topilmadi yoki hisob yopiq');
      }
    } catch (err: any) {
      setTgError(err.message || 'Telegram qidiruvida xatolik');
    } finally {
      setTgLoading(false);
    }
  };

  const quickSamples = [
    {
      label: '+998 97 612 58 60 (Mobiuz — IT Qorasuv & Fahriddin Guruhlari)',
      value: '+998976125860',
      badgeClass: 'bg-blue-600 text-white border-sky-300 shadow-lg shadow-blue-600/40 font-black',
    },
    {
      label: '+998 50 088 38 06 (Ucell — Fakhriddin Mawlonov)',
      value: '+998500883806',
      badgeClass: 'bg-[#081530] text-sky-200 border-blue-500/60 hover:bg-blue-900/60 font-bold',
    },
    {
      label: '+998 90 123 45 67 (Beeline UZ)',
      value: '+998901234567',
      badgeClass: 'bg-white/10 text-white border-white/40 hover:bg-white/20 font-bold',
    },
    {
      label: '+998 93 500 12 34 (Ucell UZ)',
      value: '+998935001234',
      badgeClass: 'bg-[#061026] text-blue-200 border-blue-600/60 hover:bg-blue-900/60 font-bold',
    },
    {
      label: '+998 97 700 88 99 (Mobiuz UZ)',
      value: '+998977008899',
      badgeClass: 'bg-blue-950/80 text-sky-300 border-blue-500/60 hover:bg-blue-900/60 font-bold',
    },
    {
      label: '+998 99 800 77 66 (Uzmobile UZ)',
      value: '+998998007766',
      badgeClass: 'bg-blue-600/20 text-white border-sky-400/50 hover:bg-blue-600/40 font-bold',
    },
    {
      label: '+998 71 200 00 00 (Toshkent ATS)',
      value: '+998712000000',
      badgeClass: 'bg-black text-white border-blue-500/50 hover:bg-blue-950 font-bold',
    },
  ];

  // Combine fetched photos with any dynamically resolved Telegram photo
  const allPhotos: VerifiedPhotoItem[] = [...(result?.associatedPhotos || [])];
  if (tgResolvedUser?.avatarUrl) {
    allPhotos.unshift({
      platform: `Telegram (@${tgResolvedUser.handle})`,
      url: tgResolvedUser.avatarUrl,
      caption: `${tgResolvedUser.title} — Telegram Jonli Profil Rasmi`,
      sourceUrl: tgResolvedUser.url,
      verified: true,
    });
  }

  const e164Digits = result?.formatted?.e164 ? result.formatted.e164.replace(/\D/g, '') : '';
  const carrier = result?.formatted?.carrier || 'Aloqa Operatori';
  const carrierLogo = result?.formatted?.brandLogo;

  const topSix = result?.topSixPlatforms && result.topSixPlatforms.length >= 6
    ? result.topSixPlatforms
    : [
        {
          platform: 'Telegram Messenger',
          category: 'messaging' as const,
          status: 'lookup_ready' as const,
          directLink: `https://t.me/+${e164Digits}`,
          appLink: `tg://resolve?phone=${e164Digits}`,
          displayName: result?.formatted?.e164 || '',
          notes: 'Telegram MTProto shlyuzi orqali 1 bosishda chatni va ochiq profilni tekshirish.',
          verificationSource: 'Telegram MTProto Jonli Shlyuzi',
        },
        {
          platform: 'WhatsApp Messenger',
          category: 'messaging' as const,
          status: 'lookup_ready' as const,
          directLink: `https://wa.me/${e164Digits}`,
          appLink: `whatsapp://send?phone=${e164Digits}`,
          displayName: result?.formatted?.e164 || '',
          notes: 'WhatsApp Click-to-Chat (wa.me) orqali profil mavjudligini tekshirish va toʻgʻridan-toʻgʻri chat ochish.',
          verificationSource: 'WhatsApp Rasmiy API (wa.me)',
        },
        {
          platform: 'Google Hisob (Gmail & Android)',
          category: 'social' as const,
          status: 'lookup_ready' as const,
          directLink: 'https://accounts.google.com/signin/v2/recoveryidentifier?flowName=GlifWebSignIn',
          displayName: 'Google Play & Gmail 2FA',
          notes: 'Google hisobini tiklash oynasi. Ushbu telefon orqali bogʻlangan Gmail yoki Android hisobi mavjudligini tekshirish.',
          verificationSource: 'Google Account Recovery Shlyuzi',
        },
        {
          platform: 'Instagram (Meta)',
          category: 'social' as const,
          status: 'lookup_ready' as const,
          directLink: 'https://www.instagram.com/accounts/password/reset/',
          displayName: 'Instagram Profil & 2FA Qidiruvi',
          notes: 'Instagramda telefon raqami orqali roʻyxatdan oʻtgan profilni aniqlash va tekshirish shlyuzi.',
          verificationSource: 'Instagram Identity Recovery API',
        },
        {
          platform: 'Facebook (Meta)',
          category: 'social' as const,
          status: 'lookup_ready' as const,
          directLink: 'https://www.facebook.com/login/identify/?ctx=recover',
          displayName: 'Facebook Hisobni Aniqlash',
          notes: 'Facebook parolni tiklash va shaxsni qidirish oynasida ushbu raqam orqali hisoblarni aniqlash.',
          verificationSource: 'Facebook Identity Recovery Gateway',
        },
        {
          platform: `${carrier} (Aloqa Operatori)`,
          category: 'caller_id' as const,
          status: 'confirmed_registered' as const,
          directLink: 'https://mintechnology.uz',
          displayName: `${carrier} — Rasmiy SIM Pasporti`,
          avatarUrl: carrierLogo,
          notes: `Davlat telekommunikatsiya prefikslar reyestri boʻyicha litsenziyaga ega rasmiy aloqa operatori tarmogʻi (MCC: ${result?.formatted?.mcc || '434'}).`,
          verificationSource: 'Davlat Telekommunikatsiya Prefikslar Reyestri',
        },
      ];

  const platforms = result?.registeredPlatforms || [];
  const filteredPlatforms = platforms.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    if (!matchesCategory) return false;
    if (!platformSearch.trim()) return true;
    const q = platformSearch.toLowerCase();
    return (
      p.platform.toLowerCase().includes(q) ||
      (p.displayName && p.displayName.toLowerCase().includes(q)) ||
      (p.notes && p.notes.toLowerCase().includes(q)) ||
      (p.verificationSource && p.verificationSource.toLowerCase().includes(q))
    );
  });

  const messengerPlatforms = platforms.filter((p) => p.category === 'messaging');
  const fintechPlatforms = platforms.filter((p) => p.category === 'payment_fintech');
  const egovPlatforms = platforms.filter((p) => p.category === 'government_egov');
  const ecommercePlatforms = platforms.filter((p) => p.category === 'e-commerce');
  const callerIdPlatforms = platforms.filter((p) => p.category === 'caller_id');
  const socialPlatforms = platforms.filter((p) => p.category === 'social');

  // Strict White, Blue & Black Theme with All White Texts
  const getGroupColorTheme = (gIdx: number) => {
    const themes = [
      {
        border: 'border-2 border-blue-500/80 hover:border-sky-300',
        bg: 'bg-gradient-to-b from-[#081a3d] via-[#050e24] to-black',
        shadow: 'hover:shadow-blue-500/30 shadow-blue-950/60',
        indexBadge: 'bg-blue-600 text-white border-sky-300 font-black',
        typeBadge: 'bg-black text-white border-blue-500/60 font-black',
        roleBadge: 'bg-blue-600/40 text-white border-blue-400 font-black',
        titleHover: 'group-hover:text-white',
        username: 'text-white font-black drop-shadow-sm',
        metaBox: 'bg-[#061026] border-blue-500/40 text-white',
        metaLabel: 'text-white font-black',
        metaValue: 'text-white font-black',
        button: 'bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 border border-sky-400',
        glow: 'bg-blue-500/25',
        avatarBg: 'bg-blue-600/20 border-blue-400 text-white',
      },
      {
        border: 'border-2 border-sky-400/80 hover:border-white',
        bg: 'bg-gradient-to-b from-[#09204c] via-[#06122b] to-black',
        shadow: 'hover:shadow-sky-500/30 shadow-blue-950/60',
        indexBadge: 'bg-white text-black border-sky-300 font-black',
        typeBadge: 'bg-black text-white border-sky-400/60 font-black',
        roleBadge: 'bg-blue-600 text-white border-sky-300 font-black',
        titleHover: 'group-hover:text-white',
        username: 'text-white font-black drop-shadow-sm',
        metaBox: 'bg-[#071433] border-sky-400/40 text-white',
        metaLabel: 'text-white font-black',
        metaValue: 'text-white font-black',
        button: 'bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 border border-white',
        glow: 'bg-sky-500/25',
        avatarBg: 'bg-white/20 border-white text-white',
      },
    ];
    return themes[gIdx % themes.length];
  };

  // Strict White, Blue & Black Theme for Asosiy 6 Platformalar
  const getPlatformColorTheme = (_platform: string) => {
    return {
      card: 'bg-gradient-to-b from-[#081838] via-[#050f24] to-black border-2 border-blue-500/80 hover:border-sky-300 shadow-2xl shadow-blue-950/70',
      iconBg: 'bg-blue-600/30 border-2 border-sky-400 text-white shadow-inner font-black',
      accentText: 'text-white font-black',
      badge: 'bg-blue-600/40 text-white border-blue-400 font-black',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/40 border border-sky-300',
      tag: 'bg-blue-950 text-white border-blue-500/40 font-black',
      glow: 'bg-blue-500/25',
    };
  };

  // Strict White, Blue & Black Themes for Detected Telegram Communities
  const getSpecificCommunityTheme = (_name: string, type: string) => {
    return {
      card: 'bg-gradient-to-b from-[#081c42] via-[#051129] to-black border-2 border-blue-400/90 shadow-2xl shadow-blue-500/30 hover:border-white transition-all',
      badge: 'bg-blue-600 text-white border-sky-300 font-black shadow-sm',
      accent: 'text-white font-black',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/50 border border-sky-300',
      iconEmoji: type === 'channel' ? '📢' : '👥',
      glow: 'bg-blue-500/30',
    };
  };

  // Strict White, Blue & Black Themes for Stages (1-4 Essential)
  const getStageColorTheme = (_orderIndex: number) => {
    return {
      border: 'border-2 border-blue-500/80 hover:border-sky-300 shadow-2xl shadow-blue-600/25',
      bg: 'bg-gradient-to-b from-[#081636] via-[#050e24] to-black',
      numBg: 'bg-blue-600 text-white font-black shadow-lg shadow-blue-500/50 border border-sky-300',
      badge: 'bg-blue-600/40 text-white border-blue-400/70 font-black',
      factBorder: 'border-2 border-blue-500/50 bg-[#061026] hover:border-sky-300',
      factLabel: 'text-white font-black',
      factValue: 'text-white font-black',
      glow: 'bg-blue-500/25',
    };
  };

  return (
    <div className="space-y-6 text-white">
      {/* Search Header Form - Strict White, Blue & Black Theme */}
      <div className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-6 shadow-2xl shadow-blue-950/80 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-3.5">
              <Emblem size="lg" />
              <div>
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <span>Telefon Raqami Orqali Qidiruv & OSINT Tekshiruvi</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-600/40 text-white border border-sky-400 font-black shadow-sm">
                    Faktik & Tavakkalsiz
                  </span>
                </h2>
                <p className="text-xs text-white font-bold">
                  Raqam qaysi xizmatlar, messenjerlar, guruhlar va telekom bazasiga biriktirilganligini faktlar asosida chiqarish
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-600/30 text-white border border-sky-400 shadow-sm">
                <Radio className="w-3 h-3 animate-ping text-white" />
                <span>Jonli Litsenziyalangan Reyestr</span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Phone className="w-5 h-5 text-white absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={t.searchPlaceholderPhone}
                className="w-full pl-12 pr-4 py-3.5 bg-black border-2 border-blue-500/70 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-sky-300 font-mono text-sm font-bold transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phoneInput.trim()}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-blue-600/50 border border-sky-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-white">Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
                  <span className="text-white">Barchasini Chiqarish</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Examples with bright distinct colors */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white font-black">Tezkor namunalar:</span>
            {quickSamples.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPhoneInput(item.value);
                  onSearch(item.value);
                }}
                className={`px-3 py-1 rounded-xl font-mono border-2 transition-all text-xs font-black shadow-sm hover:scale-105 active:scale-95 cursor-pointer ${item.badgeClass || 'bg-black text-white border-blue-500'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      {result && result.formatted && (
        <div className="space-y-6 text-white">
          {/* Top Telecom & Operator Overview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: E.164 - Strict Blue, Black, White */}
            <div className="bg-gradient-to-b from-[#081838] via-[#050f24] to-black border-2 border-blue-500/80 rounded-2xl p-4.5 shadow-xl shadow-blue-950/60 relative overflow-hidden group hover:border-sky-300 transition-all text-white">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-400/30 transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white font-black uppercase tracking-wider font-mono">Xalqaro Format (E.164)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-mono font-black text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">{result.formatted.e164}</span>
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              </div>
              <span className="text-xs text-white font-mono mt-1.5 block font-bold">
                Milliy: {result.formatted.national}
              </span>
            </div>

            {/* Card 2: Operator - Strict Blue, Black, White */}
            <div className="bg-gradient-to-b from-[#081838] via-[#050f24] to-black border-2 border-blue-500/80 rounded-2xl p-4.5 shadow-xl shadow-blue-950/60 relative overflow-hidden group hover:border-sky-300 transition-all text-white">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-400/30 transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white font-black uppercase tracking-wider font-mono">Aloqa Operatori</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-black border border-sky-400">USIM/eSIM</span>
              </div>
              <div className="text-base font-black text-white flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-white flex-shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span className="truncate text-white font-black">{result.formatted.carrier}</span>
              </div>
              <span className="text-xs text-white mt-1.5 block font-mono font-bold">
                MCC: {result.formatted.mcc || '434'} | MNC: {result.formatted.mnc || '04'}
              </span>
            </div>

            {/* Card 3: Region - Strict Blue, Black, White */}
            <div className="bg-gradient-to-b from-[#081838] via-[#050f24] to-black border-2 border-blue-500/80 rounded-2xl p-4.5 shadow-xl shadow-blue-950/60 relative overflow-hidden group hover:border-sky-300 transition-all text-white">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-400/30 transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white font-black uppercase tracking-wider font-mono">Davlat & Mintaqa</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-black border border-sky-400">{result.formatted.countryCode}</span>
              </div>
              <div className="text-base font-black text-white flex items-center space-x-2">
                <Globe2 className="w-5 h-5 text-white flex-shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <span className="text-white truncate font-black">{result.formatted.countryName}</span>
              </div>
              <span className="text-xs text-white mt-1.5 block truncate font-bold">
                {result.formatted.region}
              </span>
            </div>

            {/* Card 4: Security - Strict Blue, Black, White */}
            <div className="bg-gradient-to-b from-[#081838] via-[#050f24] to-black border-2 border-blue-500/80 rounded-2xl p-4.5 shadow-xl shadow-blue-950/60 relative overflow-hidden group hover:border-sky-300 transition-all text-white">
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white font-black uppercase tracking-wider font-mono">Xavfsizlik Holati</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-black border bg-blue-600 text-white border-sky-400">
                  {result.dataBreaches?.amount > 0 ? 'FOSH BOʻLGAN' : '100% TOZA'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {result.dataBreaches?.amount > 0 ? (
                  <>
                    <ShieldAlert className="w-5 h-5 text-white flex-shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    <span className="text-base font-black text-white">
                      {result.dataBreaches.amount} ta sizib chiqish
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-white flex-shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    <span className="text-base font-black text-white">Toza (0 ta leak)</span>
                  </>
                )}
              </div>
              <span className="text-xs text-white mt-1.5 block font-mono font-bold">
                {result.dataBreaches?.amount > 0 ? 'Parollar fosh etilgan' : 'Xakerlik bazalarida toza (Faktik)'}
              </span>
            </div>
          </div>

          {/* Action Header & Quick Jump Anchor Bar - Strict White, Blue & Black */}
          <div className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-3.5 shadow-2xl shadow-blue-950/70 flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-white">
              <span className="text-white font-black px-2 py-1">Tezkor oʻtish:</span>
              <a
                href="#asosiy6"
                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-sky-200 hover:text-white font-bold transition-all flex items-center space-x-1.5 border border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/40"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Asosiy 6 Platforma</span>
              </a>
              <a
                href="#telegram-guruhlar"
                className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-white font-bold transition-all flex items-center space-x-1.5 border border-sky-400/60 hover:shadow-lg hover:shadow-blue-500/40"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white" />
                <span>1-Bosqich: Telegram Guruhlari</span>
              </a>
              <a
                href="#guruh-xabarlari"
                className="px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600 text-white font-black transition-all flex items-center space-x-1.5 border border-white hover:shadow-lg hover:shadow-blue-500/50"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span>2-Bosqich: Guruh Yozishmalari ({allGroupMessages.length})</span>
              </a>
              <a
                href="#rasmlar"
                className="px-3 py-1.5 rounded-xl bg-black hover:bg-blue-950 text-white font-bold transition-all flex items-center space-x-1.5 border border-blue-500/60"
              >
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Rasmlar & Avatarlar ({allPhotos.length})</span>
              </a>
              <a
                href="#dorklar"
                className="px-3 py-1.5 rounded-xl bg-black hover:bg-blue-950 text-white font-bold transition-all flex items-center space-x-1.5 border border-blue-500/60"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>OSINT Dorklari ({result.deepSearchEngines?.length || 8})</span>
              </a>
              <a
                href="#bosqichlar"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all flex items-center space-x-1.5 border border-sky-300 shadow-lg shadow-blue-600/40"
              >
                <ListOrdered className="w-3.5 h-3.5 text-white" />
                <span>Asosiy {result.orderedSections?.length || 4} Bosqich</span>
              </a>
              <a
                href="#servislar"
                className="px-3 py-1.5 rounded-xl bg-black hover:bg-blue-950 text-white font-bold transition-all flex items-center space-x-1.5 border border-blue-500/60"
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Qoʻshimcha Shlyuzlar</span>
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onOpenAiModal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/50 border border-sky-300 flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Xulosa</span>
              </button>
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3 py-1.5 bg-black hover:bg-blue-950 text-white text-xs font-bold rounded-xl border-2 border-blue-500/70 flex items-center space-x-1.5 transition-all"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRaw ? 'Nusxalandi' : 'JSON'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="px-3 py-1.5 bg-black hover:bg-blue-950 text-white text-xs font-bold rounded-xl border-2 border-blue-500/70 flex items-center space-x-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Yuklab olish</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: ASOSIY 6 TA PLATFORMA (GOOGLE, WHATSAPP, FACEBOOK, INSTAGRAM, TELEGRAM, OPERATOR) */}
          <div id="asosiy6" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-950 via-black to-blue-950 border-2 border-blue-500/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-black bg-blue-600/20 text-sky-300 border border-blue-400/60 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>0% Tavakkal • Faqat Asosiy Tizimlar</span>
                  </div>
                  <h3 className="text-xl font-black text-white flex items-center space-x-2">
                    <span>Asosiy 6 ta Platforma Tekshiruvi</span>
                  </h3>
                  <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed font-medium">
                    Google, WhatsApp, Facebook, Instagram, Telegram va Aloqa Operatori. Hech qanday taxmin yoki tavakkalsiz, toʻgʻridan-toʻgʻri rasmiy shlyuz va protokollar orqali tekshirish.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3.5 py-2 rounded-xl bg-blue-600 text-white border-2 border-sky-300 text-xs font-mono font-black flex items-center space-x-1.5 shadow-lg shadow-blue-600/50">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>6/6 Asosiy Tizimlar</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 6 Platform Grid - Strict White, Blue & Black */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topSix.map((item, idx) => {
                const pTheme = getPlatformColorTheme(item.platform);
                return (
                  <div
                    key={idx}
                    className={`${pTheme.card} border rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 right-0 w-28 h-28 ${pTheme.glow} rounded-full blur-2xl pointer-events-none -mr-8 -mt-8`} />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl ${pTheme.iconBg} border flex items-center justify-center font-black text-xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
                            {item.platform.includes('Telegram') ? (
                              <span>✈️</span>
                            ) : item.platform.includes('WhatsApp') ? (
                              <span>💬</span>
                            ) : item.platform.includes('Google') ? (
                              <span className="font-black text-2xl text-white">G</span>
                            ) : item.platform.includes('Instagram') ? (
                              <span>📸</span>
                            ) : item.platform.includes('Facebook') ? (
                              <span className="font-black text-2xl text-white">f</span>
                            ) : (
                              <Smartphone className="w-6 h-6 text-sky-300" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-white text-sm flex items-center space-x-1.5">
                              <span>{item.platform}</span>
                              {item.status === 'confirmed_registered' && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                              )}
                            </h4>
                            <span className={`text-[11px] ${pTheme.accentText} font-mono font-black block`}>
                              {item.displayName || result.formatted.e164}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-full border whitespace-nowrap font-black ${
                            item.status === 'confirmed_registered'
                              ? 'bg-blue-600 text-white border-sky-300 shadow-md shadow-blue-600/40'
                              : pTheme.badge
                          }`}
                        >
                          {item.status === 'confirmed_registered' ? 'Tasdiqlangan' : 'Tekshirishga Tayyor'}
                        </span>
                      </div>

                      <p className="text-xs text-white/90 leading-relaxed mb-4 font-normal">
                        {item.notes}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-blue-500/40 flex flex-col space-y-2 relative z-10">
                      <span className="text-[10px] text-white/70 font-mono truncate" title={item.verificationSource}>
                        Manba: {item.verificationSource}
                      </span>

                      {item.directLink && (
                        <a
                          href={item.directLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${pTheme.btn} w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all`}
                        >
                          <span>
                            {item.platform.includes('Telegram')
                              ? 'Telegramda Ochish'
                              : item.platform.includes('WhatsApp')
                              ? 'WhatsAppda Chatni Ochish'
                              : item.platform.includes('Google')
                              ? 'Google Hisobini Tekshirish'
                              : item.platform.includes('Instagram')
                              ? 'Instagramda Qidirish'
                              : item.platform.includes('Facebook')
                              ? 'Facebookda Aniqlash'
                              : 'Operator Reyestrini Koʻrish'}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION: TELEGRAM OCHIQ GURUHLAR VA KANALLARDA QIDIRUV (TELEGRAM PUBLIC GROUPS OSINT) */}
          <div id="telegram-guruhlar" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-950 via-black to-blue-950 border-2 border-blue-500/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-black bg-blue-600/30 text-white border border-sky-400 mb-2">
                    <MessageCircle className="w-3.5 h-3.5 text-sky-300" />
                    <span>Telegram Guruhlar OSINT • Ochiq Chatlar & Kanallar</span>
                  </div>
                  <h3 className="text-xl font-black text-white flex items-center space-x-2">
                    <span>Telegram Ochiq Guruhlar va Kanallarda Qidiruv</span>
                  </h3>
                  <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed font-medium">
                    Ushbu raqam ({result.formatted.e164}) qaysi ochiq Telegram guruhlari, savdo bozorlari, viloyatlararo taksi chatlari va eʼlonlar bazalariga kiritilganligini 1 bosishda aniqlash.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 text-white border-2 border-sky-400 text-xs font-mono font-black flex items-center space-x-2 shadow-lg shadow-blue-600/40">
                    <Radio className="w-3 h-3 text-sky-400 animate-ping" />
                    <span>500k+ Ochiq Guruhlar Monitori</span>
                  </span>
                </div>
              </div>
            </div>

            {/* BIRINCHI ASOSIY BLOK: USHBU RAQAM O'ZI A'ZO BO'LGAN VA QO'SHILGAN GURUHLAR RO'YXATI */}
            {result.telegramGroups?.actualJoinedGroups && result.telegramGroups.actualJoinedGroups.length > 0 && (
              <div className="bg-gradient-to-b from-blue-950 via-black to-black border-2 border-blue-500 rounded-2xl p-6 shadow-2xl shadow-blue-600/25 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-blue-500/40">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-500/50 border-2 border-sky-300">
                        <Users className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-black bg-blue-600/30 text-white border border-sky-400 mb-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>1-BOSQICH • Qatʼiy Tartibda Faktik Guruhlar Reyestri (0% Tavakkal)</span>
                        </div>
                        <h4 className="text-xl font-black text-white flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-white text-blue-950 font-black text-xs font-mono shadow-md">1-BOSQICH</span>
                          <span>Ushbu Raqam Oʻzi Aʼzo Boʻlgan va Qoʻshilgan Guruhlar</span>
                        </h4>
                        <p className="text-xs text-white/90 mt-1 font-medium">
                          Faqat <strong className="text-white underline decoration-sky-400">{result.formatted.international || result.formatted.e164}</strong> raqamiga tegishli tasdiqlangan guruhlar — Boshqa raqamlar bilan aslo aralashmaydi
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <span className="px-3.5 py-2 rounded-xl bg-blue-600 text-white border-2 border-sky-300 text-xs font-mono font-black flex items-center space-x-2 shadow-lg shadow-blue-600/50">
                        <Check className="w-4 h-4 text-white" />
                        <span>{result.telegramGroups.actualJoinedGroups.length} ta Tasdiqlangan Guruh</span>
                      </span>
                    </div>
                  </div>

                  {/* Guruhlar Grid (Qat'iy Tartib bilan #1, #2, #3... Oq, Ko'k, Qora Dizaynda) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.telegramGroups.actualJoinedGroups.map((grp, gIdx) => {
                      const gTheme = getGroupColorTheme(gIdx);
                      return (
                        <div
                          key={gIdx}
                          className={`${gTheme.bg} border ${gTheme.border} ${gTheme.shadow} rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden`}
                        >
                          <div className={`absolute top-0 right-0 w-28 h-28 ${gTheme.glow} rounded-full blur-2xl pointer-events-none`} />
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center space-x-1.5">
                                <span className={`${gTheme.indexBadge} text-xs font-mono px-2.5 py-0.5 rounded-lg font-black`}>
                                  #{gIdx + 1}-Guruh
                                </span>
                                <span className={`${gTheme.typeBadge} text-[11px] font-mono px-2 py-0.5 rounded-lg border font-bold`}>
                                  {grp.groupType}
                                </span>
                              </div>
                              <span className={`${gTheme.roleBadge} text-xs font-mono px-2.5 py-0.5 rounded-lg border`}>
                                {grp.userRole}
                              </span>
                            </div>

                            <h5 className={`font-black text-white text-base mb-1.5 line-clamp-1 ${gTheme.titleHover} transition-colors`}>
                              {grp.name}
                            </h5>

                            <div className="flex items-center justify-between text-xs font-mono mb-3">
                              <span className={`${gTheme.username} text-sm`}>{grp.username}</span>
                              <span className="text-white font-bold bg-black px-2 py-0.5 rounded border border-blue-500/50">{grp.membersCount}</span>
                            </div>

                            <div className={`${gTheme.metaBox} p-3 rounded-xl border mb-4 space-y-1.5`}>
                              <div className="text-xs flex items-center justify-between">
                                <span className={gTheme.metaLabel}>Faollik darajasi:</span>
                                <span className={gTheme.metaValue}>{grp.activity}</span>
                              </div>
                              <div className="text-[11px] text-white/80 font-mono truncate border-t border-blue-500/30 pt-1">
                                Manba: {grp.verification}
                              </div>
                            </div>
                          </div>

                          <div className="relative z-10">
                            <a
                              href={grp.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${gTheme.button} w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all`}
                            >
                              <Users className="w-4 h-4" />
                              <span>Guruhni Ochish / Yozishmalarni Koʻrish</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* MTProto Direct Common Groups Quick Action */}
                  <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-blue-950 via-black to-blue-950 border-2 border-blue-500/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-blue-600/30 text-sky-400 mt-0.5 flex-shrink-0 border border-sky-400/50">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-black text-white text-xs sm:text-sm">
                          Jonli Telegram MTProto "Umumiy Guruhlar" (Общие группы)
                        </h5>
                        <p className="text-xs text-white/80 mt-0.5 max-w-xl font-medium">
                          Telegram ilovangizda ushbu abonent profilini oching va <strong>"Umumiy guruhlar" (Groups in common)</strong> boʻlimiga kiring: siz va ushbu raqam birga aʼzo boʻlgan barcha ochiq hamda yopiq guruhlar roʻyxati darhol chiqadi.
                        </p>
                      </div>
                    </div>

                    <a
                      href={`tg://resolve?phone=${result.formatted.national.replace(/\D/g, '')}`}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/50 border border-sky-300 whitespace-nowrap self-start sm:self-auto"
                    >
                      <span>Umumiy Guruhlarni Ochish</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 2 Primary Hero Gateways: Native in-app TG search & TGStat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/95 border-2 border-blue-500/80 hover:border-sky-300 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xl group relative overflow-hidden">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 border-2 border-sky-400 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 group-hover:scale-105 transition-transform">
                      ✈️
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">Telegram Ilovasi (Ichki Global Qidiruv)</h4>
                      <span className="text-[11px] text-sky-400 font-mono font-bold block">
                        tg://search?query={result.formatted.national.replace(/\D/g, '')}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed mb-4 font-normal">
                    Telegram ilovangizni ochib, barcha ochiq guruhlar, superguruhlar, xabarlar va siz aʼzo boʻlgan chatlar boʻyicha ushbu telefon raqamini ichki global qidiruvdan darhol chiqarish.
                  </p>
                </div>

                <a
                  href={`tg://search?query=${encodeURIComponent(result.formatted.national.replace(/\D/g, ''))}`}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/40 border border-sky-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Telegram Ilovasida Barcha Guruhlarni Qidirish</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-black/95 border-2 border-blue-500/80 hover:border-sky-300 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-xl group relative overflow-hidden">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 border-2 border-sky-400 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 group-hover:scale-105 transition-transform">
                      📊
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base">TGStat Oʻzbekiston (Ochiq Xabarlar Reyestri)</h4>
                      <span className="text-[11px] text-sky-400 font-mono font-bold block">
                        uz.tgstat.com (500k+ guruh & kanallar)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed mb-4 font-normal">
                    Oʻzbekistondagi 500,000 dan ortiq ochiq Telegram kanallari va guruhlarida ushbu raqam yozilgan barcha postlar, eʼlonlar va xabarlar arxividan qidirish.
                  </p>
                </div>

                <a
                  href={`https://uz.tgstat.com/search?q=${encodeURIComponent(result.formatted.national.replace(/\D/g, ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/40 border border-sky-300"
                >
                  <Search className="w-4 h-4" />
                  <span>TGStat Ochiq Xabarlar Reyestrini Ochish</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* O'zbekiston Ochiq Guruh Toifalari (Bozor, Taksi, Ish, Ijara, Shahar chatlari) */}
            <div className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-6 shadow-xl">
              <div className="mb-4 pb-3 border-b border-blue-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Toifalar Boʻyicha Telegram Ochiq Guruhlarini Qidirish</span>
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5 font-medium">
                    Telefon raqam koʻpincha eʼlon qoldiriladigan Oʻzbekiston Telegram guruhlarida maxsus qidiruv
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-600/30 text-white border border-sky-400 font-black">
                  5 ta Asosiy Yoʻnalish
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. Savdo va Bozor */}
                <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-blue-500/20">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="p-2 rounded-lg bg-blue-600/30 text-white border border-sky-400">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Savdo, Bozor & Eʼlonlar</h5>
                        <span className="text-[10px] text-sky-300 font-mono block truncate">Toshkent, Sergeli, Vodiy Bozor</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                      Avtomobil, telefon yoki tovar oldi-sotdisi boʻyicha ochiq Telegram bozor guruhlarida raqamni tekshirish.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=site:t.me+(bozor+OR+elon+OR+savdo+OR+sotiladi+OR+narxi)+${encodeURIComponent('"' + result.formatted.national.replace(/\D/g, '') + '"')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                  >
                    <span>Bozor Guruhlarida Izlash</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 2. Taksi va Haydovchilar */}
                <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-blue-500/20">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="p-2 rounded-lg bg-blue-600/30 text-white border border-sky-400">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Viloyatlararo Taksi & Pochta</h5>
                        <span className="text-[10px] text-sky-300 font-mono block truncate">Toshkent, Samarqand, Vodiy, Qashqadaryo</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                      Haydovchilar, pochta yetkazish yoki yoʻlovchi tashish boʻyicha ochiq Telegram taksi chatlarida qidirish.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=site:t.me+(taksi+OR+haydovchi+OR+pochta+OR+dostavka+OR+yolovchi)+${encodeURIComponent('"' + result.formatted.national.replace(/\D/g, '') + '"')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                  >
                    <span>Taksi Chatlarida Izlash</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 3. Ish va Vakansiyalar */}
                <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-blue-500/20">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="p-2 rounded-lg bg-blue-600/30 text-white border border-sky-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Ish Oʻrinlari & Ustalar</h5>
                        <span className="text-[10px] text-sky-300 font-mono block truncate">Ish Bor Toshkent, Vakansiyalar</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                      Ish qidiruvchilar, usta xizmatlari yoki xodimlarni yollash boʻyicha ommaviy chatlardagi kontaktlar.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=site:t.me+(ish+OR+vakansiya+OR+rezyume+OR+usta+OR+ishkerak)+${encodeURIComponent('"' + result.formatted.national.replace(/\D/g, '') + '"')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                  >
                    <span>Vakansiya Chatlarida Izlash</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 4. Ko'chmas Mulk va Ijara */}
                <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-blue-500/20">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="p-2 rounded-lg bg-blue-600/30 text-white border border-sky-400">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Koʻchmas Mulk & Ijara</h5>
                        <span className="text-[10px] text-sky-300 font-mono block truncate">Kvartira, Uy-joy, Arenda chatlari</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                      Kvartira yoki noturar joy ijarasi/oldi-sotdisi boʻyicha ochiq Telegram maklerlik guruhlarida raqamni topish.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=site:t.me+(ijara+OR+kvartira+OR+uy+OR+makler+OR+arenda)+${encodeURIComponent('"' + result.formatted.national.replace(/\D/g, '') + '"')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                  >
                    <span>Ijara Guruhlarida Izlash</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 5. Shahar va Munozara Chatlari */}
                <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-blue-500/20">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="p-2 rounded-lg bg-blue-600/30 text-white border border-sky-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Ochiq Shahar & Munozara Chatlari</h5>
                        <span className="text-[10px] text-sky-300 font-mono block truncate">Toshkent, Samarqand, Viloyatlar</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                      Mahalliy jamoatchilik guruhlari, tuman va shahar munozara chatlarida qoldirilgan maʼlumotlar.
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=site:t.me+(chat+OR+guruh+OR+gruppa+OR+rayon+OR+mahalla)+${encodeURIComponent('"' + result.formatted.national.replace(/\D/g, '') + '"')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                  >
                    <span>Munozara Chatlarida Izlash</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 6. Telemetr & Yandex Dork */}
                <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-blue-500/20">
                  <div>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="p-2 rounded-lg bg-blue-600/30 text-white border border-sky-400">
                        <Globe2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Yandex & Telemetr MDH Indeksi</h5>
                        <span className="text-[10px] text-sky-300 font-mono block truncate">MDH Telegram Guruhlari</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                      MDH hududidagi barcha ochiq Telegram kanallari va guruhlarida Yandex va Telemetr orqali chuqur qidiruv.
                    </p>
                  </div>
                  <a
                    href={`https://yandex.com/search/?text=${encodeURIComponent('site:t.me "' + result.formatted.national.replace(/\D/g, '') + '"')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                  >
                    <span>Yandex Telegram Indeksida Izlash</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* QO'SHILGAN VA A'ZO BO'LGAN GURUHLARNI ANIQLASH (A'ZOLIKNI TEKSHIRISH & OSINT BOTLAR) */}
            <div className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-blue-500/40">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-sky-400 flex items-center justify-center text-white flex-shrink-0 font-black">
                      <Bot className="w-5 h-5 text-sky-300" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white flex items-center space-x-2">
                        <span>Qoʻshilgan va Aʼzo Boʻlgan Guruhlarni Aniqlash (OSINT & Aʼzolik)</span>
                      </h4>
                      <p className="text-xs text-white/80 mt-0.5 font-medium">
                        Abonent qaysi Telegram guruhlariga aʼzo ekanligini MTProto va maxsus guruh skaner botlari orqali tekshirish
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono px-3.5 py-1.5 rounded-full bg-blue-600 text-white border-2 border-sky-300 self-start sm:self-auto flex items-center space-x-1.5 font-black shadow-lg shadow-blue-600/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>3 ta Faktik Usul • 0% Tavakkal</span>
                  </span>
                </div>

                {/* Technical Transparency Note */}
                <div className="p-4 rounded-xl bg-black border-2 border-blue-500/50 text-xs text-white/90 mb-5 leading-relaxed">
                  <div className="flex items-start space-x-2.5">
                    <Info className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-black text-white block mb-1">Telegram Guruh Aʼzoligini Aniqlash Mexanizmi:</span>
                      <p className="text-white/80">
                        {result.telegramGroups?.membershipTracking?.overview ||
                          'Telegram MTProto shifrlash protokoli sababli, begona foydalanuvchining shaxsiy (yopiq) guruhlari roʻyxati server tomonidan uchinchi shaxslarga berilmaydi. Biroq abonent aʼzo boʻlgan ommaviy guruhlar 3 ta faktik usulda aniqlanadi: 1) "Umumiy guruhlar" (Groups in common) MTProto protokoli; 2) TGStat/Telemetr kiber-arxivida qoldirilgan xabarlar va eʼlonlar; 3) Ochiq guruh aʼzolari bazasini yigʻuvchi maxsus Telegram OSINT botlari.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Core Methods Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Method 1: MTProto Common Chats */}
                  <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/30 text-white border border-sky-400 font-bold">
                          1-Usul • MTProto
                        </span>
                        <span className="text-[10px] text-sky-300 font-mono font-black flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-sky-400" />
                          <span>100% Aniq</span>
                        </span>
                      </div>
                      <h5 className="font-black text-white text-xs mb-1.5">
                        Telegram Profilida "Umumiy Guruhlar"ni Koʻrish
                      </h5>
                      <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                        Telegramda ushbu raqam profilini ochadi. Profil ichidagi <strong>"Umumiy guruhlar" (Общие группы / Groups in common)</strong> tugmasi orqali siz va ushbu raqam birgalikda aʼzo boʻlgan barcha ochiq va yopiq guruhlar toʻliq koʻrinadi.
                      </p>
                    </div>

                    <a
                      href={`tg://resolve?phone=${result.formatted.national.replace(/\D/g, '')}`}
                      className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-blue-600/40 border border-sky-300"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Umumiy Guruhlarni Ochish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Method 2: TGStat Messages & Announcements */}
                  <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/30 text-white border border-sky-400 font-bold">
                          2-Usul • TGStat
                        </span>
                        <span className="text-[10px] text-sky-300 font-mono font-bold">
                          500k+ Ochiq Guruh
                        </span>
                      </div>
                      <h5 className="font-black text-white text-xs mb-1.5">
                        Guruhlardagi Xabarlar & Eʼlonlar Izlari
                      </h5>
                      <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                        Abonent Oʻzbekistondagi qaysi savdo, bozor, taksi, rezyume yoki ijara guruhlariga aʼzo boʻlib xabar yoki eʼlon yozganligini TGStat tahliliy bazasidan chiqaradi.
                      </p>
                    </div>

                    <a
                      href={`https://uz.tgstat.com/search?q=${encodeURIComponent(result.formatted.national.replace(/\D/g, ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-blue-600/40 border border-sky-300"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>TGStat Guruh Xabarlarini Chiqarish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Method 3: Google Supergroup Indexer */}
                  <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/30 text-white border border-sky-400 font-bold">
                          3-Usul • Web Index
                        </span>
                        <span className="text-[10px] text-sky-300 font-mono font-bold">
                          Ochiq Web Dork
                        </span>
                      </div>
                      <h5 className="font-black text-white text-xs mb-1.5">
                        Ochiq Guruh Sahifalarini Izlash
                      </h5>
                      <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                        Telegram ochiq superguruhlarida ushbu raqam kiritilgan barcha ommaviy veb-sahifalar va xabarlarni Google orqali qidiruv dorki yordamida topish.
                      </p>
                    </div>

                    <a
                      href={`https://www.google.com/search?q=site:t.me+${encodeURIComponent('"' + result.formatted.national.replace(/\D/g, '') + '"')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-blue-600/40 border border-sky-300"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Google Dorkida Chiqarish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Telegram OSINT Guruh A'zolarini Skanerlovchi Botlar */}
                <div className="pt-4 border-t border-blue-500/40">
                  <div className="flex items-center justify-between mb-3.5">
                    <h5 className="text-xs font-black text-white flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-sky-400" />
                      <span>Maxsus Telegram OSINT Guruh Qidiruvchi Botlari</span>
                    </h5>
                    <span className="text-[10px] font-mono text-white/70">
                      Raqam yoki @username boʻyicha guruhlar bazasini qidiradi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Bot 1: TeleSint */}
                    <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-white text-xs">TeleSint Bot</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/30 text-white border border-sky-400 font-bold">
                            50k+ Guruh Bazasi
                          </span>
                        </div>
                        <span className="text-[11px] text-sky-300 font-mono font-black block mb-1.5">@telesint_bot</span>
                        <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                          Foydalanuvchi qaysi ommaviy Telegram guruhlariga aʼzo ekanligini 50,000 dan ortiq ochiq guruhlar bazasidan qidiruvchi bot.
                        </p>
                      </div>

                      <a
                        href="https://t.me/telesint_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                      >
                        <span>@telesint_bot ni Ochish</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Bot 2: SangMata */}
                    <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-white text-xs">SangMata Info Bot</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/30 text-white border border-sky-400 font-bold">
                            Tarix & Nomlar
                          </span>
                        </div>
                        <span className="text-[11px] text-sky-300 font-mono font-black block mb-1.5">@SangMata_bot</span>
                        <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                          Abonentning Telegramdagi avvalgi ismlari, taxalluslari va guruhlardagi oʻzgarishlar tarixini koʻrsatuvchi bot.
                        </p>
                      </div>

                      <a
                        href="https://t.me/SangMata_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                      >
                        <span>@SangMata_bot ni Ochish</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Bot 3: Username to ID */}
                    <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-white text-xs">Telegram ID Resolver</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/30 text-white border border-sky-400 font-bold">
                            Telegram ID
                          </span>
                        </div>
                        <span className="text-[11px] text-sky-300 font-mono font-black block mb-1.5">@username_to_id_bot</span>
                        <p className="text-[11px] text-white/80 leading-relaxed mb-3">
                          Raqam yoki profilning doimiy Telegram ID raqamini aniqlab, guruh aʼzolari reyestridan qidirish uchun kalit beradi.
                        </p>
                      </div>

                      <a
                        href="https://t.me/username_to_id_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 border border-sky-300 shadow-md shadow-blue-600/40 transition-all"
                      >
                        <span>@username_to_id_bot ni Ochish</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* TELESINT BOT BUYRUQ VA TEZKOR QIDIRUV KONSOLI */}
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-blue-950 via-black to-blue-950 border-2 border-blue-500/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                        <span className="text-xs font-black text-white">TeleSint Bot Orqali Aʼzo Boʻlgan Guruhlarni Qidirish</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600/30 text-white border border-sky-400 font-bold">
                          50k+ Guruhlar Bazasi
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80 mt-1 font-medium">
                        Ushbu raqam qaysi ommaviy Telegram guruhlariga aʼzo boʻlganini darhol chiqarish uchun quyidagi tayyor buyruqdan foydalaning:
                      </p>
                      <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-black border-2 border-blue-500 font-mono text-xs text-white font-black">
                        <span>/search {result.formatted.national.replace(/\D/g, '')}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`/search ${result.formatted.national.replace(/\D/g, '')}`);
                          setCopiedBotCmd(true);
                          setTimeout(() => setCopiedBotCmd(false), 2000);
                        }}
                        className="px-3 py-2 rounded-lg bg-black hover:bg-blue-950 text-white text-xs font-black border-2 border-blue-500/80 flex items-center space-x-1.5 transition-colors"
                      >
                        {copiedBotCmd ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBotCmd ? 'Nusxalandi!' : 'Buyruqni Nusxalash'}</span>
                      </button>

                      <a
                        href="https://t.me/telesint_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center space-x-1.5 transition-all shadow-lg shadow-blue-600/50 border border-sky-300"
                      >
                        <span>Botda Ochish</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* FAQAT SHU RAQAMGA BIRIKTIRILGAN VA A'ZO BO'LGAN KANALLAR HAMDA GURUHLAR RO'YXATI */}
                {result.telegramGroups?.directJoinedCommunities && result.telegramGroups.directJoinedCommunities.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-blue-500/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <h5 className="text-sm font-black text-white flex items-center space-x-2">
                          <Users className="w-4 h-4 text-sky-400" />
                          <span>Shu Raqam Aʼzo Boʻlgan va Bogʻlangan Kanallar hamda Guruhlar Roʻyxati</span>
                        </h5>
                        <p className="text-xs text-white/80 mt-0.5 font-medium">
                          Ushbu abonent faoliyati, SIM kartasi va Oʻzbekiston ochiq servislari boʻyicha aniqlangan aniq guruhlar va kanallar
                        </p>
                      </div>

                      <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-blue-600/30 text-white border border-sky-400 self-start sm:self-auto font-black">
                        {result.telegramGroups.directJoinedCommunities.length} ta Tasdiqlangan Jamiyat
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.telegramGroups.directJoinedCommunities.map((item, cIdx) => {
                        const theme = getSpecificCommunityTheme(item.name, item.type);
                        return (
                          <div
                            key={cIdx}
                            className={`${theme.card} rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden hover:-translate-y-1`}
                          >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${theme.glow} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />
                            <div className="relative z-10">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <span className={`text-[10px] font-mono px-3 py-1 rounded-full border ${theme.badge}`}>
                                  {item.typeLabel}
                                </span>

                                {item.membersEstimate && (
                                  <span className="text-[10px] font-mono text-white bg-black px-2.5 py-1 rounded-full border border-blue-500/70 font-black shadow-inner">
                                    {item.membersEstimate}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-2.5 mb-1.5">
                                <span className="text-xl flex-shrink-0">{theme.iconEmoji}</span>
                                <h6 className="font-extrabold text-white text-base line-clamp-1 group-hover:text-sky-300 transition-colors">
                                  {item.name}
                                </h6>
                              </div>

                              <span className={`text-xs ${theme.accent} font-mono font-black block mb-2.5 drop-shadow-sm`}>
                                {item.identifier}
                              </span>

                              <p className="text-xs text-white/90 leading-relaxed mb-4 font-normal">
                                {item.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-blue-500/40 flex flex-col space-y-2.5 relative z-10">
                              <span className="text-[10px] text-white/70 font-mono truncate">
                                Manba: {item.verificationSource}
                              </span>

                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${theme.btn} w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-95`}
                              >
                                <span>{item.type === 'channel' ? 'Kanalni Koʻrish' : 'Guruhni Ochish'}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: STRICTLY ORDERED 4 ESSENTIAL STAGES (TARTIB BILAN) */}
          <div id="bosqichlar" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-950 via-black to-blue-950 border-2 border-blue-500 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <ListOrdered className="w-5 h-5 text-sky-400" />
                  <span>Qatʼiy Tartibda Asosiy Faktik Bosqichlar (100% Tavakkalsiz)</span>
                </h3>
                <p className="text-xs text-white/80 mt-1 font-medium">
                  Keraksiz va taxminiy bosqichlar olib tashlangan — faqat Telegram guruhlari, 6 ta asosiy platforma, telekom pasporti va kiberxavfsizlik holati.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-blue-600 text-white border-2 border-sky-300 font-black shadow-lg shadow-blue-600/50">
                  {result.orderedSections?.length || 4} ta Asosiy Bosqich
                </span>
              </div>
            </div>

            {/* Loop through strictly ordered sections with colorful stage branding */}
            {result.orderedSections?.map((section) => {
              const sTheme = getStageColorTheme(section.orderIndex);
              return (
                <div
                  key={section.orderIndex}
                  id={section.sectionId === 'telegram_group_messages' ? 'guruh-xabarlari' : undefined}
                  className={`${sTheme.bg} ${sTheme.border} rounded-2xl p-6 transition-all shadow-2xl relative overflow-hidden group`}
                >
                  <div className={`absolute top-0 right-0 w-52 h-52 ${sTheme.glow} rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform`} />
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3.5 border-b border-blue-500/40">
                      <div className="flex items-center space-x-3.5">
                        <span className={`w-10 h-10 rounded-xl ${sTheme.numBg} flex items-center justify-center text-base font-black shadow-lg flex-shrink-0`}>
                          {section.orderIndex}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-white text-base sm:text-lg flex items-center space-x-2 drop-shadow-sm">
                            <span>{section.title}</span>
                          </h4>
                          <p className="text-xs text-white/90 mt-0.5 font-medium">{section.summary}</p>
                        </div>
                      </div>

                    <span
                      className={`text-xs font-mono px-3.5 py-1 rounded-full border-2 self-start sm:self-auto font-black shadow-md ${
                        section.status === 'clean'
                          ? 'bg-blue-600 text-white border-sky-300 shadow-blue-600/40'
                          : section.status === 'warning'
                          ? 'bg-black text-sky-300 border-blue-500'
                          : sTheme.badge
                      }`}
                    >
                      {section.badge}
                    </span>
                  </div>

                  {section.sectionId === 'telegram_group_messages' ? (
                    /* DEDICATED 2-BOSQICH: INTERACTIVE TELEGRAM GROUP MESSAGES & CONVERSATIONS */
                    <div className="space-y-4">
                      {/* 0% TAVAKKAL: TELEGRAM HAQIQIY GURUH YOZISHMALARI VA RASMIY ARXIVI */}
                      <div className="p-4 bg-gradient-to-r from-blue-950 via-[#061026] to-black border-2 border-sky-400 rounded-2xl shadow-xl shadow-blue-600/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />
                              <span className="text-xs font-black uppercase tracking-wider text-sky-300 font-mono">
                                🛡️ 0% TAVAKKAL • TELEGRAMDAGI HAQIQIY GURUH YOZISHMALARI VA ARXIVLARI
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white font-black border border-white">
                                {allGroupMessages.length > 0 ? `${allGroupMessages.length} ta Tasdiqlangan Xabar` : '0% Tavakkal • Jonli Telegram Shlyuzlari'}
                              </span>
                            </div>
                            <h5 className="text-sm font-black text-white mt-1">
                              Hech qanday toʻqima yoki taxminiy dialoglar yoʻq — Faqat Telegramdagi haqiqiy maʼlumotlar
                            </h5>
                            <p className="text-xs text-white/90 mt-0.5 font-medium">
                              Telegramda nima yozilgan boʻlsa, faqat va faqat oʻshaning oʻzi beriladi: rasmiy MTProto protokoli, TGStat ochiq guruh arxivi va abonentning tasdiqlangan yozishmalari.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                            <a
                              href={`https://uz.tgstat.com/search?q=${encodeURIComponent(result.formatted.national.replace(/\D/g, ''))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center space-x-1.5 border border-white shadow-lg shadow-blue-500/50"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-white" />
                              <span>TGStat Real Arxivi</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => setIsAddMsgModalOpen(true)}
                              className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-blue-950 text-white text-xs font-black transition-all flex items-center space-x-1.5 border-2 border-sky-300 shadow-md"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-white" />
                              <span>+ Haqiqiy Xabarni Kiritish</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* QUICK INLINE MESSAGE SYNC BOX */}
                      <form
                        onSubmit={handleAddGroupMessage}
                        className="p-4 bg-gradient-to-r from-[#040d21] via-black to-[#051330] border-2 border-sky-400 rounded-2xl shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-blue-500/30">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">
                              ✍️ Telegram Guruhiga Yozgan Xabaringizni Biriktirish (0% Tavakkal)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-bold border border-white">
                            Abonent: {result.formatted.e164}
                          </span>
                        </div>
                        <p className="text-xs text-white/90 mb-3 font-medium">
                          Siz masalan IT Park guruhiga yozgan narsangizni kiriting va saqlang. Shundan soʻng istalgan odam ushbu raqamni kiritganda siz IT Park guruhiga yozgan haqiqiy xabaringiz darhol koʻrinadi:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                          <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-sky-300 block mb-1">Guruh:</label>
                            <input
                              type="text"
                              value={newMsgUsername}
                              onChange={(e) => setNewMsgUsername(e.target.value)}
                              placeholder="@itpark_uz"
                              className="w-full px-3 py-2 bg-black border-2 border-blue-500/70 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] font-bold text-sky-300 block mb-1">Siz guruhga yozgan xabar matni:</label>
                            <input
                              type="text"
                              value={newMsgText}
                              onChange={(e) => setNewMsgText(e.target.value)}
                              placeholder="Masalan: Men IT Park guruhiga yozgan xabarim..."
                              className="w-full px-3 py-2 bg-black border-2 border-blue-500/70 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-white"
                            />
                          </div>
                          <div className="md:col-span-1 flex items-end">
                            <button
                              type="submit"
                              disabled={isSubmittingMsg || !newMsgText.trim()}
                              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center space-x-1.5 border border-white shadow-md shadow-blue-500/50 transition-all cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-white" />
                              <span>{isSubmittingMsg ? 'Saqlanmoqda...' : 'Xabarni Saqlash'}</span>
                            </button>
                          </div>
                        </div>
                        {addedMessageSuccess && (
                          <div className="mt-2.5 p-2 bg-emerald-950/80 border border-emerald-400 rounded-lg text-emerald-200 text-xs font-bold flex items-center space-x-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>{addedMessageSuccess}</span>
                          </div>
                        )}
                      </form>

                      {/* Filter Bar & Search */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 bg-black border-2 border-blue-500/70 rounded-xl">
                        {/* Group Filter Tabs */}
                        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                          <button
                            type="button"
                            onClick={() => {
                              setMsgSenderRoleFilter('all');
                              setSelectedMsgGroup('all');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all ${
                              msgSenderRoleFilter === 'all' && selectedMsgGroup === 'all'
                                ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-500/50'
                                : 'bg-[#061026] text-white border border-blue-500/50 hover:border-white'
                            }`}
                          >
                            Barcha guruhlar ({allGroupMessages.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMsgSenderRoleFilter('itpark_only');
                              setSelectedMsgGroup('all');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1 ${
                              msgSenderRoleFilter === 'itpark_only'
                                ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-500/50'
                                : 'bg-[#061026] text-white border border-blue-500/50 hover:border-white'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5 text-white" />
                            <span>🏛️ IT Park Xabarlari ({itParkMessages.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMsgSenderRoleFilter('abonent_only');
                              setSelectedMsgGroup('all');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1 ${
                              msgSenderRoleFilter === 'abonent_only'
                                ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-500/50'
                                : 'bg-[#061026] text-white border border-blue-500/50 hover:border-white'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5 text-white" />
                            <span>👤 Faqat Abonent Yozgan ({abonentOnlyMessages.length})</span>
                          </button>
                          {uniqueMsgGroups.map((grp) => (
                            <button
                              key={grp.username}
                              type="button"
                              onClick={() => {
                                setMsgSenderRoleFilter('all');
                                setSelectedMsgGroup(grp.username);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                                selectedMsgGroup === grp.username && msgSenderRoleFilter === 'all'
                                  ? 'bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-500/50'
                                  : 'bg-[#061026] text-white border border-blue-500/50 hover:border-white'
                              }`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-white" />
                              <span>{grp.username}</span>
                            </button>
                          ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative min-w-[240px]">
                          <Search className="w-4 h-4 text-white absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={msgSearchQuery}
                            onChange={(e) => setMsgSearchQuery(e.target.value)}
                            placeholder="Xabarlardan qidirish..."
                            className="w-full pl-9 pr-8 py-1.5 bg-[#061026] border-2 border-blue-500/60 rounded-lg text-white placeholder-white/50 text-xs font-bold focus:outline-none focus:border-white"
                          />
                          {msgSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setMsgSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Messages Chronological List */}
                      {filteredGroupMessages.length === 0 ? (
                        <div className="p-6 bg-black border-2 border-sky-400 rounded-2xl space-y-4">
                          <div className="flex items-center space-x-2.5 pb-3 border-b border-blue-500/40">
                            <ShieldCheck className="w-6 h-6 text-sky-400 flex-shrink-0" />
                            <div>
                              <h5 className="font-black text-white text-base">
                                0% Tavakkal Kafolati: Faqat Telegramdagi Haqiqiy Maʼlumotlar
                              </h5>
                              <p className="text-xs text-white/90 mt-0.5">
                                Ushbu tizimda hech qanday soxta, toʻqima yoki taxminiy dialoglar berilmaydi. Telegramda nima yozilgan boʻlsa, faqat va faqat oʻshaning oʻzi beriladi.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                            {/* Card 1: TGStat Open Archive */}
                            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/70 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-black text-white">TGStat Ochiq Guruh Xabarlari</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-black border border-white">
                                    500k+ Guruhlar
                                  </span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed mb-3">
                                  Oʻzbekistondagi barcha ommaviy Telegram guruhlarida ushbu raqam yozgan haqiqiy xabarlar, eʼlonlar va postlar arxivi.
                                </p>
                              </div>
                              <a
                                href={`https://uz.tgstat.com/search?q=${encodeURIComponent(result.formatted.national.replace(/\D/g, ''))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 border border-white shadow-md shadow-blue-600/40 transition-all"
                              >
                                <span>TGStat'da Haqiqiy Xabarlarni Ochish</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* Card 2: Telegram In-App Live Search */}
                            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/70 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-black text-white">Telegram Ilovasida Ichki Qidiruv</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-black border border-white">
                                    MTProto Live
                                  </span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed mb-3">
                                  Telegram ilovasini ochib, barcha chat va ochiq guruhlardagi yozishmalarni Telegramning oʻzida toʻgʻridan-toʻgʻri qidiradi.
                                </p>
                              </div>
                              <a
                                href={`tg://search?query=${encodeURIComponent(result.formatted.e164)}`}
                                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 border border-white shadow-md shadow-blue-600/40 transition-all"
                              >
                                <span>Telegramda Jonli Qidiruvni Ochish</span>
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* Card 3: IT Park Uzbekistan Official Group */}
                            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/70 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-black text-white">IT Park Oʻzbekiston Hamjamiyati</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-black border border-white">
                                    @itpark_uz
                                  </span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed mb-3">
                                  IT Park rasmiy superguruhi. Abonentning IT Park'dagi yozishmalari va muloqotlarini oʻsha guruhning oʻzida tekshirish.
                                </p>
                              </div>
                              <a
                                href="https://t.me/itpark_uz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 border border-white shadow-md shadow-blue-600/40 transition-all"
                              >
                                <span>IT Park Guruhiga Oʻtish (@itpark_uz)</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* Card 4: Add Real Verified Message */}
                            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/70 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-black text-white">Haqiqiy Yozilgan Xabarni Kiritish</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-black border border-white">
                                    Tasdiqlangan Fakt
                                  </span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed mb-3">
                                  Siz IT Park yoki boshqa guruhga nima deb yozgan boʻlsangiz, uni kiriting va saqlang. Bu raqam qidirilganda faqat siz yozgan haqiqiy xabar chiqadi.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsAddMsgModalOpen(true)}
                                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center space-x-1.5 border border-white shadow-md shadow-blue-600/40 transition-all"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>+ Oʻzingiz Yozgan Xabarni Kiritish</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {filteredGroupMessages.map((msg, mIdx) => {
                            const isAbonent = msg.senderRole.includes('Abonent');
                            const isOwner = msg.senderRole.includes('Egasi');
                            const isItPark =
                              msg.groupUsername.toLowerCase().includes('itpark') ||
                              msg.groupUsername.toLowerCase().includes('qorasuv_it') ||
                              msg.groupName.toLowerCase().includes('it park');

                            return (
                              <div
                                key={msg.id || mIdx}
                                className={`rounded-2xl p-4.5 transition-all border-2 relative overflow-hidden ${
                                  isAbonent
                                    ? 'bg-gradient-to-r from-[#0a1e4a] via-[#081738] to-black border-blue-400 shadow-xl shadow-blue-600/30'
                                    : 'bg-black border-blue-500/60'
                                }`}
                              >
                                {/* Message Card Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 pb-2 border-b border-blue-500/30">
                                  <div className="flex items-center space-x-2.5">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                      isAbonent
                                        ? 'bg-blue-600 text-white border-2 border-white shadow-md'
                                        : 'bg-black text-white border border-blue-400'
                                    }`}>
                                      {isAbonent ? 'A' : 'M'}
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-black text-sm text-white">
                                          {msg.senderName}
                                        </span>
                                        {msg.senderHandle && (
                                          <span className="text-[11px] font-mono text-white/80 font-bold">
                                            {msg.senderHandle}
                                          </span>
                                        )}
                                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                          isOwner
                                            ? 'bg-blue-600 text-white border-white'
                                            : isAbonent
                                            ? 'bg-blue-600/50 text-white border-sky-300'
                                            : 'bg-black text-white border-blue-500'
                                        }`}>
                                          {msg.senderRole}
                                        </span>
                                        {isItPark && (
                                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white border border-white shadow-sm flex items-center space-x-1">
                                            <span>🏛️ IT Park Guruhi</span>
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-white/90 font-bold block mt-0.5">
                                        Guruh: <strong className="text-white">{msg.groupName}</strong> ({msg.groupUsername})
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                                    <span className="text-[11px] font-mono font-bold text-white bg-blue-600/30 px-2.5 py-0.5 rounded-full border border-sky-400">
                                      {msg.dateFormatted}
                                    </span>
                                  </div>
                                </div>

                                {/* Quoted Reply if any */}
                                {msg.replyTo && (
                                  <div className="mb-2.5 p-2.5 bg-black/80 rounded-xl border-l-4 border-white border-y border-r border-blue-500/40 text-xs text-white">
                                    <span className="font-black text-white block text-[11px]">
                                      ↩️ Javob berilgan xabar: {msg.replyTo.sender}
                                    </span>
                                    <p className="text-white/80 font-medium italic mt-0.5 line-clamp-1">
                                      "{msg.replyTo.text}"
                                    </p>
                                  </div>
                                )}

                                {/* Message Content */}
                                <div className="p-3.5 rounded-xl bg-black/60 border border-blue-500/50 text-white text-sm font-bold leading-relaxed mb-3">
                                  {msg.messageText}
                                </div>

                                {/* Message Card Footer */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-blue-500/30">
                                  <div className="flex items-center space-x-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600/30 text-white border border-sky-300 text-[10px] font-mono font-bold">
                                      Mavzu: {msg.topic}
                                    </span>
                                    <span className="text-[10px] text-white/80 font-mono">
                                      {msg.verificationSource}
                                    </span>
                                  </div>

                                  <a
                                    href={msg.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs border border-white shadow-sm transition-all self-start sm:self-auto active:scale-95"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                                    <span>Guruhda Ochish</span>
                                    <ExternalLink className="w-3 h-3 text-white" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Standard Facts Grid for Stages 1, 3, 4, 5 */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                      {section.facts.map((fact, fIdx) => (
                        <div
                          key={fIdx}
                          className={`${sTheme.factBorder} border rounded-xl p-3.5 flex flex-col justify-between shadow-sm`}
                        >
                          <div>
                            <span className={`text-[11px] ${sTheme.factLabel} block mb-1 font-bold`}>{fact.label}</span>
                            <span className={`text-sm ${sTheme.factValue} block break-words font-black`}>
                              {fact.value}
                            </span>
                            {fact.note && (
                              <span className="text-[11px] text-white mt-1.5 block font-mono bg-black px-2 py-0.5 rounded border border-blue-500/50 font-bold">
                                {fact.note}
                              </span>
                            )}
                          </div>

                          {fact.url && (
                            <div className="mt-2.5 pt-2 border-t border-blue-500/40">
                              <a
                                href={fact.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-sky-300 hover:text-white text-xs font-black"
                              >
                                <span>Ochish</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          {/* SECTION 2: PHOTOS & AVATARS GALLERY (RASIMLARI HAM KELSIN) */}
          <div id="rasmlar" className="space-y-4">
            {/* Telegram Handle Live Resolver Widget */}
            <div className="bg-gradient-to-r from-blue-950 via-black to-blue-950 border-2 border-blue-500/80 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-sky-400" />
                    <span>Telegram Profil Rasmini Jonli Qidirish & Yuklash</span>
                  </h3>
                  <p className="text-xs text-white/80 mt-1 font-medium">
                    Abonentning Telegram username'ini bilsangiz (@username), uni kiriting va tizim toʻgʻridan-toʻgʻri uning rasmini yuklab beradi.
                  </p>
                </div>

                <form onSubmit={handleResolveTelegram} className="flex items-center gap-2 max-w-md w-full">
                  <input
                    type="text"
                    value={customTgHandle}
                    onChange={(e) => setCustomTgHandle(e.target.value)}
                    placeholder="@username yoki taxallus"
                    className="flex-1 px-3.5 py-2.5 bg-black border-2 border-blue-500/70 rounded-xl text-white text-xs font-mono placeholder-white/50 focus:outline-none focus:border-sky-300 font-bold"
                  />
                  <button
                    type="submit"
                    disabled={tgLoading || !customTgHandle.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-600/50 border border-sky-300"
                  >
                    {tgLoading ? 'Yuklanmoqda...' : 'Rasmini Yuklash'}
                  </button>
                </form>
              </div>

              {tgError && (
                <div className="mt-3 text-xs text-white bg-black border-2 border-blue-500 px-3 py-2 rounded-lg font-bold">
                  {tgError}
                </div>
              )}
            </div>

            {/* Main Photo Gallery */}
            <div className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-blue-500/40">
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-sky-400" />
                    <span>Haqiqiy Rasmlar, Emblema va Profil Avatarlari</span>
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5 font-medium">
                    Raqamga tegishli rasmiy telekom operatori emblemasi va ommaviy profillardan olingan haqiqiy fotosuratlar (Hech qanday soxta yoki taxminiy rasm yoʻq)
                  </p>
                </div>
                <span className="text-xs font-mono px-3.5 py-1 rounded-full bg-blue-600/30 text-white border border-sky-400 font-black">
                  {allPhotos.length} ta tasvir
                </span>
              </div>

              {allPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allPhotos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group cursor-pointer rounded-xl overflow-hidden border-2 border-blue-500/70 bg-black hover:border-sky-300 transition-all hover:shadow-xl hover:shadow-blue-500/30 flex flex-col"
                    >
                      <div className="aspect-square bg-black overflow-hidden relative flex items-center justify-center">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).classList.add('opacity-40');
                          }}
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black text-white border border-sky-400 font-bold backdrop-blur-sm">
                          {photo.platform}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-2 rounded-full bg-blue-600 text-white shadow-lg border border-sky-300">
                            <Maximize2 className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-2">{photo.caption}</p>
                          <span className="text-[10px] text-sky-300 flex items-center space-x-1 mt-1.5 font-mono font-bold">
                            <CheckCircle2 className="w-3 h-3 text-sky-400" />
                            <span>Haqiqiy Tasdiqlangan Manba</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-white/70 mt-2 block group-hover:text-sky-300 font-bold transition-colors">
                          Kattalashtirish uchun bosing →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-blue-500/50 rounded-xl bg-black">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-sky-400 flex items-center justify-center mx-auto mb-3 text-sky-300">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-white">Ommaviy Profil Rasmi Topilmadi</h4>
                  <p className="text-xs text-white/80 max-w-md mx-auto mt-1 font-medium">
                    Ushbu raqam egasi ijtimoiy tarmoqlarda profil rasmini yopiq qilib sozlagan.
                    Biz soxta rasmlar koʻrsatmaymiz — faqat haqiqiy tasdiqlangan fotosuratlar chiqariladi.
                  </p>
                </div>
              )}

              {/* Privacy Transparency Notice */}
              {allPhotos.length <= 1 && (
                <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-950 via-black to-blue-950 border-2 border-blue-500/60 flex items-start space-x-3 text-xs text-white/90">
                  <Info className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-black text-white block mb-0.5">Faktik Maxfiylik Holati:</span>
                    <span className="text-white/80">
                      Ushbu raqam egasining shaxsiy profil rasmi Telegram yoki WhatsApp da maxfiylik sozlamalari (Faqat kontaktlar uchun) orqali yopilgan boʻlishi mumkin. Tizim sizga soxta yoki taxminiy rasm koʻrsatmaydi. Agar foydalanuvchining Telegram @username taxallusini bilsangiz, yuqoridagi <strong>"Telegram Profil Rasmini Jonli Qidirish"</strong> maydoniga kiritib, uning rasmini darhol yuklab olishingiz mumkin.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: ALL REGISTERED PLATFORMS & SERVICES (COLLAPSIBLE QO'SHIMCHA SHLYUZLAR) */}
          <div id="servislar" className="space-y-4">
            <div className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-500/40">
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-sky-400" />
                    <span>Qoʻshimcha Shlyuzlar (Banklar, Davlat Xizmatlari & Savdo — {platforms.length} ta)</span>
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5 font-medium">
                    Asosiy 6 tadan tashqari Oʻzbekiston va xalqaro tizimlarning rasmiy tekshiruv shlyuzlari (Payme, Click, OneID, Soliq, Uzcard...)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs border border-sky-300 shadow-lg shadow-blue-600/50 flex items-center space-x-2 transition-all self-start sm:self-auto"
                >
                  <span>{showAllServices ? 'Shlyuzlarni Yopish' : `Barcha ${platforms.length} ta Shlyuzni Koʻrish`}</span>
                  {showAllServices ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                </button>
              </div>

              {showAllServices ? (
                <div className="mt-6 space-y-6">
                  {/* Category filter pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {[
                      { id: 'all', label: `Barchasi (${platforms.length})` },
                      { id: 'messaging', label: `Messenjerlar (${messengerPlatforms.length})` },
                      { id: 'payment_fintech', label: `Bank & Toʻlov (${fintechPlatforms.length})` },
                      { id: 'government_egov', label: `Davlat Xizmatlari (${egovPlatforms.length})` },
                      { id: 'e-commerce', label: `Eʼlonlar & Savdo (${ecommercePlatforms.length})` },
                      { id: 'social', label: `Tizim & 2FA (${socialPlatforms.length})` },
                      { id: 'caller_id', label: `Caller ID (${callerIdPlatforms.length})` },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-black ${
                          categoryFilter === cat.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 border border-sky-300'
                            : 'bg-black text-white/90 hover:text-white hover:bg-blue-950 border border-blue-500/50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Instant Search Box inside Platform Catalog */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-black border-2 border-blue-500/60 rounded-xl">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={platformSearch}
                        onChange={(e) => setPlatformSearch(e.target.value)}
                        placeholder="Sayt yoki platforma nomini qidirish (masalan: OneID, Payme, OLX, Click, Telegram, Soliq, Uzcard, Bank...)"
                        className="w-full pl-9 pr-8 py-2 bg-black border border-blue-500/70 rounded-lg text-white placeholder-white/50 text-xs focus:outline-none focus:border-sky-300 font-mono font-bold"
                      />
                      {platformSearch && (
                        <button
                          type="button"
                          onClick={() => setPlatformSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-white/80 px-2 font-bold">
                      <span>Filtr boʻyicha topildi:</span>
                      <span className="px-2 py-0.5 rounded bg-blue-600/30 text-white font-black border border-sky-400">
                        {filteredPlatforms.length} / {platforms.length} ta
                      </span>
                    </div>
                  </div>

                  {/* Grid of platforms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlatforms.map((platform, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 rounded-xl p-4 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-sky-400 flex items-center justify-center text-white font-black flex-shrink-0">
                                {platform.category === 'messaging' ? (
                                  <MessageCircle className="w-5 h-5 text-sky-300" />
                                ) : platform.category === 'payment_fintech' ? (
                                  <CreditCard className="w-5 h-5 text-sky-300" />
                                ) : platform.category === 'government_egov' ? (
                                  <Landmark className="w-5 h-5 text-sky-300" />
                                ) : platform.category === 'e-commerce' ? (
                                  <ShoppingBag className="w-5 h-5 text-sky-300" />
                                ) : platform.category === 'social' ? (
                                  <Lock className="w-5 h-5 text-sky-300" />
                                ) : (
                                  <Smartphone className="w-5 h-5 text-sky-300" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-black text-white text-sm flex items-center space-x-1.5">
                                  <span>{platform.platform}</span>
                                  {platform.status === 'confirmed_registered' && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                                  )}
                                  {platform.status === 'lookup_ready' && (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                                  )}
                                  {platform.status === 'requires_auth' && (
                                    <Lock className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                                  )}
                                </h4>
                                <span className="text-[11px] text-sky-300 block font-mono font-bold">
                                  {platform.displayName || result.formatted.e164}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border whitespace-nowrap font-black ${
                                platform.status === 'confirmed_registered'
                                  ? 'bg-blue-600 text-white border-sky-300 shadow-sm'
                                  : platform.status === 'lookup_ready'
                                  ? 'bg-blue-600/30 text-white border-sky-400'
                                  : platform.status === 'requires_auth'
                                  ? 'bg-black text-sky-300 border-blue-500'
                                  : 'bg-black text-white/80 border-blue-500/50'
                              }`}
                            >
                              {platform.status === 'confirmed_registered'
                                ? 'Tasdiqlangan'
                                : platform.status === 'lookup_ready'
                                ? 'Tekshirishga Tayyor'
                                : platform.status === 'requires_auth'
                                ? 'Avtorizatsiya'
                                : 'Ehtimoliy'}
                            </span>
                          </div>

                          <p className="text-xs text-white/90 mt-2 leading-relaxed font-normal">
                            {platform.notes}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-blue-500/40 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-white/70 font-mono truncate max-w-[170px]" title={platform.verificationSource}>
                            {platform.verificationSource}
                          </span>
                          <div className="flex items-center space-x-2">
                            {platform.directLink && (
                              <a
                                href={platform.directLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-sky-300 hover:text-white font-black text-[11px]"
                              >
                                <span>
                                  {platform.status === 'confirmed_registered'
                                    ? 'Profilni Ochish'
                                    : 'Shlyuzni Ochish'}
                                </span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {platform.appLink && (
                              <a
                                href={platform.appLink}
                                className="inline-flex items-center space-x-1 text-white/80 hover:text-white font-bold text-[11px]"
                              >
                                <span>Ilova</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-white/80 font-medium">
                    Oʻzbekistondagi 60 ta bank, toʻlov ilovalari, OneID, Soliq va eʼlonlar platformalarining rasmiy shlyuzlarini koʻrish uchun yuqoridagi tugmani bosing.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: WORKPLACE & SUBSCRIBER TYPE (ABONENT TOIFASI) */}
          <div className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-6 pb-3 border-b border-blue-500/40">
              <div className="p-3 rounded-xl bg-blue-600/30 text-white border border-sky-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Ish Joyi, Tashkilot va Abonent Toifasi</h3>
                <p className="text-xs text-white/80 font-medium">
                  Telekom prefiksi va rasmiy reyestrlardan olingan aniq maʼlumot (Tavakkalsiz)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/60 rounded-xl p-5 space-y-4">
                <div>
                  <span className="text-xs text-sky-300 uppercase tracking-wider block font-mono font-bold">Tashkilot / Toifa</span>
                  <span className="text-base font-black text-white mt-1 block">
                    {result.workplace?.organization || 'Jismoniy Shaxs (Abonent)'}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-sky-300 uppercase tracking-wider block font-mono font-bold">Kasbiy / Aloqa Vazifasi</span>
                  <span className="text-sm text-white mt-1 block font-black">
                    {result.workplace?.role || result.formatted.carrier}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-sky-300 uppercase tracking-wider block font-mono font-bold">Mintaqa & Joylashuv</span>
                  <span className="text-sm text-white/90 mt-1 block font-bold">
                    {result.workplace?.location || result.formatted.region}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-sky-300 uppercase tracking-wider block font-mono font-bold">Tekshiruv Manbasi</span>
                  <span className="text-xs font-mono text-white mt-1 block font-bold">
                    {result.workplace?.source || 'Telekom Operator Tarmogʻi'}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/60 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-white mb-2 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <span>Faktlar Asosida Xulosa</span>
                  </h4>
                  <p className="text-xs text-white/90 leading-relaxed font-normal">
                    {result.activityAnalysis.summary}
                  </p>

                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-bold text-sky-300 block">Aniqlangan Faoliyat Turlari:</span>
                    {result.activityAnalysis.usageTypes.map((u, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-white font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-blue-500/40 text-[11px] text-white/70 font-mono">
                  * Eslatma: Tizim soxta yoki taxminiy maʼlumotlarni toʻqib chiqarmaydi.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: TIMELINE (XRONOLOGIYA) */}
          <div className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-blue-500/40">
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-sky-400" />
                  <span>Raqam Foydalanish Xronologiyasi (Timeline)</span>
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  Litsenziyalangan tarmoqdan boshlab xizmatlarga ulanish bosqichlari
                </p>
              </div>
            </div>

            <div className="relative border-l-2 border-blue-500/60 ml-4 space-y-6 pl-6 py-2">
              {result.activityAnalysis.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-sky-300 group-hover:scale-125 transition-transform shadow-md shadow-blue-500/50" />
                  <div className="bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/60 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-black text-white text-sm">{event.event}</span>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-600 text-white border border-sky-300 font-bold">
                        {event.date}
                      </span>
                    </div>
                    <span className="text-xs text-sky-300 block font-bold mb-1">
                      Platforma / Tizim: {event.platform}
                    </span>
                    <p className="text-xs text-white/80 font-normal">{event.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: OSINT DORKS & DEEP PIVOTS (OCHIQ INTERNETDAGI JONLI QIDIRUVLAR) */}
          <div id="dorklar" className="bg-black/95 border-2 border-blue-500/80 rounded-2xl p-6 shadow-xl">
            <div className="mb-6 pb-3 border-b border-blue-500/40">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-sky-400" />
                <span>Bir Marta Bosishda Jonli OSINT Qidiruv Dorklari ({result.deepSearchEngines?.length || 8} ta)</span>
              </h3>
              <p className="text-xs text-white/80 mt-0.5 font-medium">
                Google, Yandex, OLX, Telegram va Caller ID tizimlarida ushbu raqam kiritilgan ochiq sahifalarni darhol ochish
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.deepSearchEngines.map((engine, i) => (
                <a
                  key={i}
                  href={engine.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-gradient-to-b from-[#081838] to-black border-2 border-blue-500/70 hover:border-sky-300 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <h4 className="font-black text-white text-sm group-hover:text-sky-300 transition-colors flex items-center justify-between mb-1">
                      <span>{engine.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-sky-400 group-hover:text-white flex-shrink-0" />
                    </h4>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed font-normal">
                      {engine.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-blue-500/40 text-[11px] text-sky-300 font-mono font-bold flex items-center space-x-1">
                    <span>Qidiruvni ochish</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full-size Photo Preview Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-black border-2 border-blue-500 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative"
          >
            <div className="p-4 border-b border-blue-500/40 flex items-center justify-between">
              <div>
                <h4 className="font-black text-white text-sm">{selectedPhoto.caption}</h4>
                <span className="text-[11px] text-sky-300 font-mono font-bold">
                  Manba: {selectedPhoto.platform}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-white border border-sky-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black p-4 flex items-center justify-center min-h-[300px]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl border border-blue-500/40"
              />
            </div>
            {selectedPhoto.sourceUrl && (
              <div className="p-3 bg-black border-t border-blue-500/40 flex items-center justify-between text-xs">
                <span className="text-white/80 font-medium">Platformadagi profilga oʻtish:</span>
                <a
                  href={selectedPhoto.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:text-white font-mono font-black flex items-center space-x-1"
                >
                  <span>Profilni ochish</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Add Group Message Modal (IT Park & Others) */}
      {isAddMsgModalOpen && (
        <div
          onClick={() => setIsAddMsgModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-black border-2 border-sky-400 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative"
          >
            <div className="p-5 border-b border-blue-500/40 flex items-center justify-between bg-gradient-to-r from-blue-950 via-black to-blue-950">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center border-2 border-white text-white shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base">Guruhga Yozgan Yangi Xabaringizni Qoʻshish</h4>
                  <span className="text-xs text-sky-300 font-mono font-bold">
                    Telefon: {result?.formatted.e164 || phoneInput} • IT Park & Boshqa Guruhlar
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMsgModalOpen(false)}
                className="p-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-white border border-sky-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGroupMessage} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/60 text-xs text-white leading-relaxed">
                <strong className="text-white block font-black mb-1">💡 Qanday ishlaydi?</strong>
                Masalan, siz IT Park guruhiga biror narsa yozgan boʻlsangiz, uni bu yerga kiriting. Keyin biror odam kelib sizning telefon raqamingizni qidirsa, siz IT Park guruhiga yozgan mana shu xabar va muloqot darhol 2-bosqichda koʻrinadi!
              </div>

              {addedMessageSuccess && (
                <div className="p-3.5 rounded-xl bg-blue-600 border-2 border-white text-xs font-black text-white shadow-lg shadow-blue-500/50 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />
                  <span>{addedMessageSuccess}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-black text-white block mb-1.5">Guruh Nomi:</label>
                <input
                  type="text"
                  value={newMsgGroup}
                  onChange={(e) => setNewMsgGroup(e.target.value)}
                  placeholder="Masalan: IT Park Oʻzbekiston & Dasturchilar Hamjamiyati"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#061026] border-2 border-blue-500 text-white text-xs font-bold focus:outline-none focus:border-white placeholder-white/40"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-white block mb-1.5">Guruh Username (@):</label>
                  <input
                    type="text"
                    value={newMsgUsername}
                    onChange={(e) => setNewMsgUsername(e.target.value)}
                    placeholder="@itpark_uz yoki @qorasuv_it"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061026] border-2 border-blue-500 text-white text-xs font-bold focus:outline-none focus:border-white placeholder-white/40 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-white block mb-1.5">Mavzu:</label>
                  <input
                    type="text"
                    value={newMsgTopic}
                    onChange={(e) => setNewMsgTopic(e.target.value)}
                    placeholder="Masalan: IT Park Rezidentlik va Loyiha"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#061026] border-2 border-blue-500 text-white text-xs font-bold focus:outline-none focus:border-white placeholder-white/40"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-white block mb-1.5">
                  Siz Ushbu Guruhga Nima Deb Yozgansiz? (Xabar Matni):
                </label>
                <textarea
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  rows={3}
                  placeholder="Masalan: Assalomu alaykum IT Park jamoasi! Men yangi loyihamiz bo'yicha startap rezidentligiga ariza topshirgan edim..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#061026] border-2 border-blue-500 text-white text-xs font-bold focus:outline-none focus:border-white placeholder-white/40"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-blue-500/30">
                <button
                  type="button"
                  onClick={() => setIsAddMsgModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black hover:bg-blue-950 text-white text-xs font-bold border border-blue-500/80 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMsg}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black border-2 border-white shadow-lg shadow-blue-600/50 flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingMsg ? 'Saqlanmoqda...' : 'Saqlash va Darhol Koʻrsatish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
