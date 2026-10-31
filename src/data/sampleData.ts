import { EmailLookupResponse, UsernameLookupResponse, AccountModule } from '../types/intelbase';

export interface ExtendedModule extends AccountModule {
  category: 'social' | 'dev' | 'gaming' | 'media' | 'productivity' | 'finance';
  icon?: string;
  popular?: boolean;
}

export const PLATFORM_REGISTRY: ExtendedModule[] = [
  // Messengers & Social
  { id: 'app_tg', name: 'telegram', name_formatted: 'Telegram Messenger', domain: 'telegram.org', type: 2, category: 'social', popular: true },
  { id: 'app_goog', name: 'google', name_formatted: 'Google (Gmail, YouTube, Drive)', domain: 'google.com', type: 0, category: 'social', popular: true },
  { id: 'app_ig', name: 'instagram', name_formatted: 'Instagram', domain: 'instagram.com', type: 2, category: 'social', popular: true },
  { id: 'app_fb', name: 'facebook', name_formatted: 'Facebook (Meta)', domain: 'facebook.com', type: 1, category: 'social', popular: true },
  { id: 'app_tw', name: 'twitter', name_formatted: 'X (formerly Twitter)', domain: 'x.com', type: 2, category: 'social', popular: true },
  { id: 'app_wa', name: 'whatsapp', name_formatted: 'WhatsApp Web', domain: 'whatsapp.com', type: 3, category: 'social', popular: true },
  { id: 'app_tt', name: 'tiktok', name_formatted: 'TikTok', domain: 'tiktok.com', type: 2, category: 'social', popular: true },
  { id: 'app_disc', name: 'discord', name_formatted: 'Discord', domain: 'discord.com', type: 2, category: 'social', popular: true },
  { id: 'app_red', name: 'reddit', name_formatted: 'Reddit', domain: 'reddit.com', type: 2, category: 'social', popular: true },
  { id: 'app_li', name: 'linkedin', name_formatted: 'LinkedIn Professional', domain: 'linkedin.com', type: 1, category: 'social', popular: true },
  { id: 'app_pin', name: 'pinterest', name_formatted: 'Pinterest', domain: 'pinterest.com', type: 2, category: 'social' },
  { id: 'app_snap', name: 'snapchat', name_formatted: 'Snapchat', domain: 'snapchat.com', type: 1, category: 'social' },

  // Developer & IT
  { id: 'app_gh', name: 'github', name_formatted: 'GitHub Developer', domain: 'github.com', type: 2, category: 'dev', popular: true },
  { id: 'app_gl', name: 'gitlab', name_formatted: 'GitLab', domain: 'gitlab.com', type: 2, category: 'dev', popular: true },
  { id: 'app_so', name: 'stackoverflow', name_formatted: 'Stack Overflow', domain: 'stackoverflow.com', type: 1, category: 'dev', popular: true },
  { id: 'app_grav', name: 'gravatar', name_formatted: 'Gravatar (Automattic)', domain: 'gravatar.com', type: 0, category: 'dev', popular: true },
  { id: 'app_h1', name: 'hackerone', name_formatted: 'HackerOne Bounty', domain: 'hackerone.com', type: 2, category: 'dev' },
  { id: 'app_docker', name: 'docker', name_formatted: 'Docker Hub', domain: 'docker.com', type: 1, category: 'dev' },
  { id: 'app_replit', name: 'replit', name_formatted: 'Replit Cloud IDE', domain: 'replit.com', type: 2, category: 'dev' },
  { id: 'app_kb', name: 'keybase', name_formatted: 'Keybase Identity', domain: 'keybase.io', type: 2, category: 'dev' },

  // Media & Streaming
  { id: 'app_spot', name: 'spotify', name_formatted: 'Spotify Music', domain: 'spotify.com', type: 1, category: 'media', popular: true },
  { id: 'app_netf', name: 'netflix', name_formatted: 'Netflix Streaming', domain: 'netflix.com', type: 1, category: 'media', popular: true },
  { id: 'app_twit', name: 'twitch', name_formatted: 'Twitch Gaming TV', domain: 'twitch.tv', type: 2, category: 'media', popular: true },
  { id: 'app_sc', name: 'soundcloud', name_formatted: 'SoundCloud Music', domain: 'soundcloud.com', type: 2, category: 'media' },

  // Gaming
  { id: 'app_stm', name: 'steam', name_formatted: 'Steam Gaming Community', domain: 'steamcommunity.com', type: 2, category: 'gaming', popular: true },
  { id: 'app_epic', name: 'epicgames', name_formatted: 'Epic Games Store', domain: 'epicgames.com', type: 1, category: 'gaming', popular: true },
  { id: 'app_chess', name: 'chess', name_formatted: 'Chess.com', domain: 'chess.com', type: 2, category: 'gaming', popular: true },
  { id: 'app_psn', name: 'playstation', name_formatted: 'PlayStation Network', domain: 'playstation.com', type: 1, category: 'gaming' },
  { id: 'app_roblox', name: 'roblox', name_formatted: 'Roblox Platform', domain: 'roblox.com', type: 2, category: 'gaming' },

  // Cloud & Productivity
  { id: 'app_ms', name: 'microsoft', name_formatted: 'Microsoft (Office 365, Outlook)', domain: 'microsoft.com', type: 1, category: 'productivity', popular: true },
  { id: 'app_apple', name: 'apple', name_formatted: 'Apple ID (iCloud)', domain: 'apple.com', type: 1, category: 'productivity', popular: true },
  { id: 'app_drop', name: 'dropbox', name_formatted: 'Dropbox Storage', domain: 'dropbox.com', type: 1, category: 'productivity', popular: true },
  { id: 'app_notion', name: 'notion', name_formatted: 'Notion Workspace', domain: 'notion.so', type: 1, category: 'productivity', popular: true },
  { id: 'app_figma', name: 'figma', name_formatted: 'Figma Design', domain: 'figma.com', type: 1, category: 'productivity', popular: true },
  { id: 'app_canva', name: 'canva', name_formatted: 'Canva Design', domain: 'canva.com', type: 1, category: 'productivity', popular: true },
  { id: 'app_zoom', name: 'zoom', name_formatted: 'Zoom Meetings', domain: 'zoom.us', type: 1, category: 'productivity', popular: true },
  { id: 'app_duo', name: 'duolingo', name_formatted: 'Duolingo Languages', domain: 'duolingo.com', type: 1, category: 'productivity', popular: true },

  // Finance & Shopping
  { id: 'app_bin', name: 'binance', name_formatted: 'Binance Crypto', domain: 'binance.com', type: 1, category: 'finance', popular: true },
  { id: 'app_paypal', name: 'paypal', name_formatted: 'PayPal Payments', domain: 'paypal.com', type: 1, category: 'finance', popular: true },
  { id: 'app_amz', name: 'amazon', name_formatted: 'Amazon Retail', domain: 'amazon.com', type: 1, category: 'finance' },
  { id: 'app_dd', name: 'doordash', name_formatted: 'DoorDash Delivery', domain: 'doordash.com', type: 3, category: 'finance' },
];

export const SAMPLE_MODULES: AccountModule[] = PLATFORM_REGISTRY.map((m) => ({
  id: m.id,
  name: m.name,
  name_formatted: m.name_formatted,
  domain: m.domain,
  type: m.type,
}));

// Smart dynamic generator that parses any input email (e.g. mawlonowfakhriddin@gmail.com)
// and produces realistic, rich intelligence data covering all platforms
export function generateDynamicEmailOSINT(rawEmail: string): EmailLookupResponse {
  const email = (rawEmail || 'target.intel@gmail.com').trim().toLowerCase();
  const [handle, domain = 'gmail.com'] = email.split('@');

  // Format a friendly display name from the handle
  const cleanParts = handle.replace(/[^a-zA-Z0-9]/g, ' ').split(' ').filter(Boolean);
  let formattedName = cleanParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
  if (!formattedName || formattedName.length < 2) {
    formattedName = 'Fakhriddin Mawlonov';
  }

  // Consistent pseudo-random hash based on email string
  let hashVal = 0;
  for (let i = 0; i < email.length; i++) {
    hashVal = (hashVal << 5) - hashVal + email.charCodeAt(i);
    hashVal |= 0;
  }
  const posHash = Math.abs(hashVal);

  // Deterministically decide which platforms are registered
  // Major ones like Google, Telegram, GitHub, Instagram, Spotify, Discord are almost always active
  const registeredModules: AccountModule[] = [];
  const unregisteredModules: AccountModule[] = [];

  PLATFORM_REGISTRY.forEach((mod, index) => {
    // Top services have high registration probability (>85%)
    const threshold = mod.popular ? 0.85 : 0.55;
    const isReg = ((posHash + index * 17) % 100) / 100 < threshold;

    const baseModule: AccountModule = {
      id: mod.id,
      name: mod.name,
      name_formatted: mod.name_formatted,
      domain: mod.domain,
      type: mod.type,
    };

    if (isReg) {
      registeredModules.push(baseModule);
    } else {
      unregisteredModules.push(baseModule);
    }
  });

  // Harvest rich profile cards for high-profile registered services
  const accounts = [
    {
      module: { id: 'app_goog', name: 'google', name_formatted: 'Google Workspace & Gmail', domain: 'google.com', type: 0 },
      data: {
        id: `10${(posHash % 899999999) + 100000000}`,
        username: handle,
        full_name: formattedName,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        creation_date: '2018-03-14T09:22:00Z',
        verified: true,
      },
    },
    {
      module: { id: 'app_tg', name: 'telegram', name_formatted: 'Telegram Messenger', domain: 'telegram.org', type: 2 },
      data: {
        username: handle,
        full_name: formattedName,
        profile_url: `https://t.me/${handle}`,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        phone_hidden: true,
        verified: true,
      },
    },
    {
      module: { id: 'app_gh', name: 'github', name_formatted: 'GitHub Developer', domain: 'github.com', type: 2 },
      data: {
        id: `${(posHash % 8999999) + 1000000}`,
        username: handle,
        full_name: formattedName,
        profile_url: `https://github.com/${handle}`,
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        bio: 'Software Engineer & Security Architecture Specialist',
        location: 'Tashkent / Remote',
        followers: (posHash % 150) + 12,
        following: (posHash % 80) + 5,
        creation_date: '2019-06-20T14:15:22Z',
      },
    },
    {
      module: { id: 'app_ig', name: 'instagram', name_formatted: 'Instagram', domain: 'instagram.com', type: 2 },
      data: {
        username: handle,
        full_name: formattedName,
        profile_url: `https://instagram.com/${handle}`,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        followers: (posHash % 400) + 90,
      },
    },
    {
      module: { id: 'app_spot', name: 'spotify', name_formatted: 'Spotify Music', domain: 'spotify.com', type: 1 },
      data: {
        username: handle,
        profile_url: `https://open.spotify.com/user/${handle}`,
        subscription: 'Active',
      },
    },
    {
      module: { id: 'app_red', name: 'reddit', name_formatted: 'Reddit Community', domain: 'reddit.com', type: 2 },
      data: {
        username: handle,
        profile_url: `https://reddit.com/user/${handle}`,
        creation_date: '2020-11-05T18:40:11Z',
      },
    },
  ];

  return {
    identifier: {
      accounts,
    },
    validator: {
      registered: registeredModules,
      unregistered: unregisteredModules,
    },
    data_breaches: {
      amount: 4,
      sources: 3,
      results: [
        {
          email,
          password: 'SuperSecret2021!',
          username: handle,
          full_name: formattedName,
          ip_address: '185.120.45.19',
          phone_number: '+998 90 *** ** 44',
          hash: '$2y$10$e8w.x7Wq5Dk9...',
          source: {
            name: 'Naz.API Combolist & Credential Leak',
            date: '2024-01',
          },
        },
        {
          email,
          password: 'OldPassword123#',
          username: handle,
          full_name: formattedName,
          ip_address: '194.27.12.8',
          phone_number: '',
          hash: 'e10adc3949ba59abbe56e057f20f883e',
          source: {
            name: 'Exploit.In Massive Combo Dump',
            date: '2022-09',
          },
        },
        {
          email,
          password: 'SuperSecret2021!',
          username: handle,
          full_name: formattedName,
          ip_address: '89.236.210.15',
          phone_number: '',
          hash: '',
          source: {
            name: 'RedLine Stealer Aggregated Logs',
            date: '2023-05',
          },
        },
      ],
      redacted: false,
      partially_redacted: false,
    },
    stealer_logs: {
      count: 2,
      results: [
        {
          data_type: 'stealerlog',
          origin: 'https://accounts.google.com/signin',
          login: email,
          password: 'SuperSecret2021!',
        },
        {
          data_type: 'stealerlog',
          origin: 'https://github.com/login',
          login: handle,
          password: 'GitMasterKey2023!',
        },
      ],
      has_stealer_log_type: true,
      redacted: false,
      compromised: true,
    },
    stealer_enrichment: {
      autofill: [
        {
          tag: 'email',
          label: 'Email Addresses',
          total: 5,
          unique: 2,
          values: [
            { value: email, count: 4 },
            { value: `${handle}.backup@proton.me`, count: 1 },
          ],
        },
        {
          tag: 'phone',
          label: 'Phone Numbers',
          total: 2,
          unique: 1,
          values: [{ value: '+998 90 123 45 67', count: 2 }],
        },
      ],
      accounts: [
        { platform: 'github.com', value: handle, kind: 'username', source: 'credential', id_link: `https://github.com/${handle}` },
        { platform: 'telegram.org', value: handle, kind: 'username', source: 'session_storage' },
        { platform: 'binance.com', value: email, kind: 'email', source: 'autofill' },
      ],
      user_info: {
        username: 'Workstation_PC',
        ip_address: '89.236.210.15',
        country: 'Uzbekistan',
        location: 'Tashkent, Tashkent City',
        zip_code: '100000',
      },
      scanned_files: 284,
      posted_at: '2023-11-18T14:30:00Z',
      realtime: false,
      redacted: false,
    },
    suggestions: {
      ranked_by: 'identity',
      items: [
        {
          value: handle,
          kind: 'username',
          sources: [{ site: 'github.com', kind: 'profile' }, { site: 'stealer', kind: 'stealer' }],
          weight: 98,
          likelihood: 'likely',
          confidence: 0.96,
        },
        {
          value: `${handle}.backup@proton.me`,
          kind: 'email',
          sources: [{ site: 'browser_autofill', kind: 'stealer' }],
          weight: 85,
          likelihood: 'likely',
          confidence: 0.89,
        },
        {
          value: `${handle}_sec`,
          kind: 'username',
          sources: [{ site: 'reddit.com', kind: 'profile' }, { site: 'telegram.org', kind: 'stealer' }],
          weight: 79,
          likelihood: 'likely',
          confidence: 0.84,
        },
      ],
    },
    insights: {
      score: {
        version: '2.1',
        authenticity: {
          score: 94,
          band: 'high',
          label: 'Tashkil etilgan Faol Shaxsiy/Ishchi Pochta',
          reasons: [
            { signal: 'age', description: 'Hisob yozuvi 5 yildan ortiq vaqtdan beri faol', points: 35 },
            { signal: 'breadth', description: `${registeredModules.length} dan ortiq servisda ro'yxatdan o'tgan`, points: 32 },
            { signal: 'domain_mx', description: 'Rasmiy MX va SPF/DMARC konfiguratsiyasi mavjud', points: 27 },
          ],
        },
        exposure: {
          score: 78,
          band: 'high',
          label: 'Yuqori Hisob Maʼlumotlari Sizib Chiqishi',
          reasons: [
            { signal: 'stealer_presence', description: 'Infostealer zararli dasturlarida parollar aniqlangan', points: 40 },
            { signal: 'password_reuse', description: 'Bir xil parol turli bazalarda qayta ishlatilgan', points: 25 },
            { signal: 'combo_dumps', description: 'Ommaviy leak to\'plamlarida mavjud', points: 13 },
          ],
        },
      },
      password_reuse: {
        credentials: 3,
        distinct: 2,
        max_sources: 2,
        reused: [
          {
            count: 2,
            sources: ['Naz.API Combolist & Credential Leak', 'RedLine Stealer Aggregated Logs'],
          },
        ],
      },
      domain: {
        domain,
        checked: true,
        accepts_mail: true,
        mx_provider: domain.includes('gmail')
          ? 'Google LLC Workspace MX'
          : domain.includes('proton')
          ? 'Proton AG Encrypted MX'
          : `${domain} Mail Server`,
        spf: true,
        dmarc: true,
        disposable: ['tempmail.com', '10minutemail.com', 'mailinator.com', 'guerrillamail.com'].includes(domain),
        free_provider: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'proton.me', 'mail.ru', 'yandex.ru'].includes(domain),
        role_address: false,
      },
    },
    identity: {
      verdict: 'one_person',
      summary: `Barcha ${accounts.length} ta aniqlangan profil va fotosuratlar 96% ishonch bilan bitta shaxsga (${formattedName}) tegishli.`,
      groups: [
        {
          id: 0,
          name: formattedName,
          sites: ['github.com', 'google.com', 'telegram.org', 'instagram.com', 'reddit.com'],
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          avatar_face: true,
          matches: [
            {
              a: 'github.com',
              b: 'google.com',
              via: 'name',
              confidence: 0.95,
              signals: [{ kind: 'name', value: formattedName }, { kind: 'username', value: handle }],
            },
            {
              a: 'github.com',
              b: 'telegram.org',
              via: 'details',
              confidence: 0.94,
              signals: [{ kind: 'username', value: handle }],
            },
          ],
        },
      ],
      accounts: [
        { module: 'github', status: 'main', group: 0, via: 'profile', name: formattedName },
        { module: 'google', status: 'main', group: 0, via: 'profile', name: formattedName },
        { module: 'telegram', status: 'main', group: 0, via: 'profile', name: handle },
        { module: 'instagram', status: 'main', group: 0, via: 'picture', name: formattedName },
      ],
    },
    meta: {
      email,
      first_seen: '2018-03-14T09:22:00Z',
      last_seen: '2024-01-15T00:00:00Z',
      cloaked: false,
      timeline: [
        { source: 'creation_date', name: 'Google Account Registered', date: '2018-03-14T09:22:00Z' },
        { source: 'creation_date', name: 'GitHub Account Registered', date: '2019-06-20T14:15:22Z' },
        { source: 'creation_date', name: 'Telegram Messenger Registered', date: '2019-10-02T12:00:00Z' },
        { source: 'creation_date', name: 'Reddit Account Registered', date: '2020-11-05T18:40:11Z' },
        { source: 'data_breach', name: 'Exploit.In Combo Leak', date: '2022-09-01T00:00:00Z' },
        { source: 'stealer_log', name: 'RedLine Stealer Infection', date: '2023-05-12T00:00:00Z' },
      ],
    },
    workplace: {
      organization: 'Tech Systems & Security',
      role: 'Full-Stack Developer & Analyst',
      location: 'Tashkent / Remote',
      source: 'GitHub & Profil tahlili',
      isCorporateDomain: false,
      status: 'verified',
    },
    photos: [
      {
        platform: 'GitHub',
        url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
        caption: `${formattedName} (GitHub Developer)`,
        sourceUrl: `https://github.com/${handle}`,
        verified: true,
      },
      {
        platform: 'Telegram',
        url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        caption: `${formattedName} (Telegram Messenger)`,
        sourceUrl: `https://t.me/${handle}`,
        verified: true,
      },
    ],
  };
}

export const SAMPLE_EMAIL_LOOKUP: EmailLookupResponse = generateDynamicEmailOSINT('target.intel@gmail.com');

export const SAMPLE_USERNAME_LOOKUP: UsernameLookupResponse = {
  identifier: {
    accounts: [
      {
        module: { id: "mod_gh_02", name: "github", name_formatted: "GitHub", domain: "github.com", type: 2 },
        data: {
          id: "8472910",
          username: "shadow_agent",
          full_name: "Shadow Agent Tech",
          profile_url: "https://github.com/shadow_agent",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          bio: "Offensive Security Researcher & Reverse Engineer. Golang, Rust & C++.",
          location: "Dubai / Remote",
          followers: 489,
          following: 34,
          creation_date: "2017-02-14T11:00:00Z"
        }
      },
      {
        module: { id: "mod_red_06", name: "reddit", name_formatted: "Reddit", domain: "reddit.com", type: 2 },
        data: {
          username: "shadow_agent",
          profile_url: "https://reddit.com/user/shadow_agent",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          creation_date: "2017-04-18T16:22:10Z"
        }
      },
      {
        module: { id: "mod_tw_07", name: "twitter", name_formatted: "X / Twitter", domain: "x.com", type: 2 },
        data: {
          username: "shadow_agent",
          full_name: "Shadow Agent 🛡️",
          profile_url: "https://x.com/shadow_agent",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          bio: "Cyber threat intel, zero-days & defense in depth.",
          followers: 3200,
          creation_date: "2018-01-09T08:14:00Z"
        }
      },
      {
        module: { id: "mod_stm_08", name: "steam", name_formatted: "Steam", domain: "steamcommunity.com", type: 2 },
        data: {
          id: "76561198000000000",
          username: "shadow_agent",
          profile_url: "https://steamcommunity.com/id/shadow_agent",
          avatar_url: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
        }
      },
      {
        module: { id: "mod_h1_22", name: "hackerone", name_formatted: "HackerOne", domain: "hackerone.com", type: 2 },
        data: {
          username: "shadow_agent",
          profile_url: "https://hackerone.com/shadow_agent",
          bio: "Top 500 security researcher. Specializing in IDOR & API vulnerability assessment."
        }
      }
    ]
  },
  validator: {
    registered: [
      { id: "mod_gh_02", name: "github", name_formatted: "GitHub", domain: "github.com", type: 2 },
      { id: "mod_red_06", name: "reddit", name_formatted: "Reddit", domain: "reddit.com", type: 2 },
      { id: "mod_tw_07", name: "twitter", name_formatted: "X / Twitter", domain: "x.com", type: 2 },
      { id: "mod_stm_08", name: "steam", name_formatted: "Steam", domain: "steamcommunity.com", type: 2 },
      { id: "mod_h1_22", name: "hackerone", name_formatted: "HackerOne", domain: "hackerone.com", type: 2 },
      { id: "mod_tg_04", name: "telegram", name_formatted: "Telegram", domain: "telegram.org", type: 2 },
      { id: "mod_disc_05", name: "discord", name_formatted: "Discord", domain: "discord.com", type: 2 },
      { id: "mod_gl_17", name: "gitlab", name_formatted: "GitLab", domain: "gitlab.com", type: 2 },
      { id: "mod_kb_19", name: "keybase", name_formatted: "Keybase", domain: "keybase.io", type: 2 },
      { id: "mod_twit_13", name: "twitch", name_formatted: "Twitch", domain: "twitch.tv", type: 2 },
      { id: "mod_sc_23", name: "soundcloud", name_formatted: "SoundCloud", domain: "soundcloud.com", type: 2 }
    ],
    unregistered: [
      { id: "mod_tt_15", name: "tiktok", name_formatted: "TikTok", domain: "tiktok.com", type: 2 },
      { id: "mod_pin_16", name: "pinterest", name_formatted: "Pinterest", domain: "pinterest.com", type: 2 },
      { id: "mod_ch_18", name: "chess", name_formatted: "Chess.com", domain: "chess.com", type: 2 }
    ]
  },
  identity: {
    verdict: "mostly_one_person",
    summary: "GitHub, Twitter, Reddit, and HackerOne accounts exhibit matching facial avatars, bio terminology, and shared cross-links.",
    groups: [
      {
        id: 0,
        name: "Shadow Agent Tech (Security Researcher)",
        sites: ["github.com", "x.com", "reddit.com", "hackerone.com"],
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        avatar_face: true,
        matches: [
          {
            a: "github.com",
            b: "x.com",
            via: "picture",
            confidence: 0.98,
            signals: [{ kind: "picture" }, { kind: "website" }, { kind: "name", value: "Shadow Agent" }]
          },
          {
            a: "github.com",
            b: "reddit.com",
            via: "picture",
            confidence: 0.94,
            signals: [{ kind: "picture" }]
          }
        ]
      },
      {
        id: 1,
        name: "Steam Gamer Persona",
        sites: ["steamcommunity.com"],
        avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
        avatar_face: true,
        matches: []
      }
    ],
    accounts: [
      { module: "github", status: "main", group: 0, via: "picture", name: "Shadow Agent Tech" },
      { module: "twitter", status: "main", group: 0, via: "picture", name: "Shadow Agent 🛡️" },
      { module: "reddit", status: "main", group: 0, via: "picture", name: "shadow_agent" },
      { module: "hackerone", status: "main", group: 0, via: "profile", name: "shadow_agent" },
      { module: "steam", status: "group", group: 1, via: "profile", name: "shadow_agent" }
    ]
  },
  meta: {
    username: "shadow_agent",
    cloaked: false
  }
};
