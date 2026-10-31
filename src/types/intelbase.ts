export interface AccountModule {
  id: string;
  name: string;
  name_formatted: string;
  domain: string;
  type: number; // 0: Account (email), 1: Reg check (email), 2: Username, 3: Phone
}

export interface HarvestedAccount {
  module: AccountModule;
  data: {
    id?: string;
    username?: string;
    full_name?: string;
    name?: string;
    bio?: string;
    avatar_url?: string;
    profile_url?: string;
    location?: string;
    followers?: number;
    following?: number;
    creation_date?: string;
    last_updated?: string;
    verified?: boolean;
    email?: string;
    phone?: string;
    website?: string;
    [key: string]: any;
  };
}

export interface DataBreachItem {
  email?: string;
  password?: string;
  username?: string;
  full_name?: string;
  ip_address?: string;
  phone_number?: string;
  hash?: string;
  source: {
    name: string;
    date: string;
  };
}

export interface DataBreachesSection {
  amount: number;
  sources: number;
  results: DataBreachItem[];
  redacted: boolean;
  partially_redacted: boolean;
}

export interface StealerLogItem {
  data_type: 'stealerlog' | 'combo' | string;
  origin: string;
  login?: string;
  password?: string;
}

export interface StealerLogsSection {
  count: number;
  results: StealerLogItem[];
  has_stealer_log_type: boolean;
  redacted: boolean;
  compromised: boolean;
}

export interface StealerAutofillTag {
  tag: string;
  label: string;
  total: number;
  unique: number;
  values: Array<{
    value: string;
    count: number;
  }>;
}

export interface StealerEnrichmentSection {
  autofill?: StealerAutofillTag[];
  accounts?: Array<{
    platform: string;
    value: string;
    kind: string;
    source: string;
    id_link?: string;
  }>;
  user_info?: {
    username?: string;
    ip_address?: string;
    country?: string;
    location?: string;
    zip_code?: string;
  };
  card_holders?: any[];
  scanned_files?: number;
  posted_at?: string;
  realtime?: boolean;
  redacted?: boolean;
}

export interface SuggestionItem {
  value: string;
  kind: 'username' | 'email' | 'domain' | string;
  sources: Array<{
    site: string;
    kind: 'profile' | 'stealer' | 'people_search' | 'email_handle' | string;
  }>;
  weight: number;
  likelihood?: 'likely' | 'possible' | 'unlikely';
  confidence?: number;
}

export interface SuggestionsSection {
  ranked_by: 'jev' | 'identity' | 'sources' | string;
  items: SuggestionItem[];
}

export interface ScoreBandDetails {
  score: number; // 0 - 100
  band: 'none' | 'very_low' | 'low' | 'moderate' | 'high' | 'critical';
  label: string;
  reasons: Array<{
    signal?: string;
    description?: string;
    points?: number;
    impact?: string;
  }>;
  cap?: string;
  missing?: string[];
}

export interface InsightsScoreSection {
  version: string;
  authenticity: ScoreBandDetails;
  exposure: ScoreBandDetails | null;
}

export interface PasswordReuseItem {
  count?: number;
  sources: string[];
}

export interface InsightsPasswordReuseSection {
  credentials: number;
  distinct: number;
  max_sources: number;
  reused: PasswordReuseItem[];
}

export interface InsightsDomainSection {
  domain: string;
  checked: boolean;
  accepts_mail: boolean;
  mx_provider: string;
  spf: boolean | null;
  dmarc: boolean | null;
  disposable: boolean;
  free_provider: boolean;
  role_address: boolean;
}

export interface IdentitySignal {
  kind: 'name' | 'similar_name' | 'link' | 'website' | 'links_to' | 'username' | 'location' | 'work' | 'email' | 'picture' | 'gravatar';
  value?: string;
}

export interface IdentityMatch {
  a: string;
  b: string;
  via: 'details' | 'email' | 'name' | 'picture' | 'gravatar';
  confidence?: number;
  signals?: IdentitySignal[];
}

export interface IdentityGroup {
  id: number;
  sites: string[];
  name?: string;
  avatar?: string;
  avatar_face?: boolean;
  matches?: IdentityMatch[];
}

export interface IdentityAccount {
  module: string;
  status: 'main' | 'group' | 'different' | 'unlinked';
  group: number;
  via?: 'profile' | 'picture';
  name?: string;
}

export interface IdentitySection {
  verdict: 'one_person' | 'mostly_one_person' | 'multiple_people' | 'unlinked' | 'insufficient';
  summary: string;
  groups: IdentityGroup[];
  accounts: IdentityAccount[];
}

export interface TimelineEvent {
  source: 'creation_date' | 'data_breach' | 'stealer_log' | 'last_seen' | string;
  name: string;
  date: string;
}

export interface LookupMeta {
  email?: string;
  username?: string;
  first_seen?: string | null;
  last_seen?: string | null;
  cloaked?: boolean;
  timeline?: TimelineEvent[];
}

export interface WorkplaceInfo {
  organization: string | null;
  role?: string | null;
  department?: string | null;
  location?: string | null;
  domain?: string | null;
  website?: string | null;
  favicon?: string | null;
  description?: string | null;
  source: string;
  isCorporateDomain?: boolean;
  status: 'verified' | 'detected' | 'not_found';
}

export interface VerifiedPhotoItem {
  platform: string;
  url: string;
  caption: string;
  sourceUrl?: string;
  verified: boolean;
}

export interface EmailLookupResponse {
  identifier: {
    accounts: HarvestedAccount[];
  };
  validator: {
    registered: AccountModule[];
    unregistered: AccountModule[];
  };
  data_breaches?: DataBreachesSection;
  stealer_logs?: StealerLogsSection;
  stealer_enrichment?: StealerEnrichmentSection | null;
  suggestions?: SuggestionsSection;
  insights?: {
    score?: InsightsScoreSection;
    password_reuse?: InsightsPasswordReuseSection;
    domain?: InsightsDomainSection;
  };
  identity?: IdentitySection;
  meta?: LookupMeta;
  workplace?: WorkplaceInfo;
  photos?: VerifiedPhotoItem[];
  error?: string;
}

export interface UsernameLookupResponse {
  identifier: {
    accounts: HarvestedAccount[];
  };
  validator: {
    registered: AccountModule[];
    unregistered: AccountModule[];
  };
  identity?: IdentitySection;
  meta?: LookupMeta;
  error?: string;
}

export interface ModulesResponse {
  identifier: AccountModule[];
  validator: AccountModule[];
  phone: AccountModule[];
  count: number;
}

export interface AIAnalysisResult {
  executiveSummary: string;
  threatLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  exposureScoreExplanation?: string;
  keyFindings: string[];
  identityAssessment?: string;
  remediationSteps: string[];
  pivotOpportunities?: string[];
}

export interface PhoneFormattedDetails {
  e164: string;
  international: string;
  national: string;
  rfc3966: string;
  countryCode: string;
  countryName: string;
  countryCallingCode: string;
  isValid: boolean;
  numberType: 'MOBILE' | 'FIXED_LINE' | 'VOIP' | 'TOLL_FREE' | 'UNKNOWN';
  carrier: string;
  region: string;
  timezone: string[];
  mcc?: string;
  mnc?: string;
  legalName?: string;
  technologies?: string;
  regulatoryBody?: string;
  simStandard?: string;
  servicePrefix?: string;
  brandLogo?: string;
  headquarters?: string;
}

export interface PhoneOrderedSection {
  orderIndex: number;
  sectionId: string;
  title: string;
  badge: string;
  status: 'verified' | 'clean' | 'active' | 'warning';
  summary: string;
  facts: Array<{
    label: string;
    value: string;
    verified: boolean;
    note?: string;
    url?: string;
  }>;
}

export interface PhoneRegisteredPlatform {
  platform: string;
  category: 'messaging' | 'social' | 'payment_fintech' | 'government_egov' | 'caller_id' | 'e-commerce';
  status: 'confirmed_registered' | 'probable_registered' | 'lookup_ready' | 'not_registered' | 'requires_auth';
  directLink?: string;
  appLink?: string;
  usernameOrHandle?: string;
  displayName?: string;
  avatarUrl?: string;
  verifiedBadge?: boolean;
  notes: string;
  verificationSource: string;
}

export interface PhoneCallerIdInsights {
  knownTags: string[];
  spamScore: number;
  spamRisk: 'low' | 'medium' | 'high';
  directoryHits: Array<{
    source: string;
    nameFound?: string;
    category?: string;
    url?: string;
  }>;
}

export interface PhoneActivityAnalysis {
  summary: string;
  registeredCount: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  usageTypes: string[];
  timeline: Array<{
    event: string;
    date: string;
    platform: string;
    details: string;
  }>;
}

export interface TelegramGroupSearchCategory {
  title: string;
  category: 'market' | 'taxi' | 'jobs' | 'real_estate' | 'discussion';
  icon: string;
  examples: string;
  url: string;
  description: string;
}

export interface TelegramMembershipMethod {
  title: string;
  badge: string;
  type: 'common_groups' | 'tgstat_activity' | 'osint_bot' | 'message_history';
  actionUrl: string;
  actionLabel: string;
  description: string;
  protocolNote: string;
}

export interface TelegramOsintBot {
  name: string;
  handle: string;
  botUrl: string;
  badge: string;
  description: string;
}

export interface TelegramJoinedEntity {
  name: string;
  type: 'channel' | 'supergroup' | 'group' | 'bot_community';
  typeLabel: string;
  category: string;
  link: string;
  identifier: string;
  verificationSource: string;
  status: 'active_indexed' | 'admin_linked' | 'mutual_dialog' | 'public_member';
  description: string;
  membersEstimate?: string;
}

export interface TelegramGroupMessage {
  id: string;
  groupName: string;
  groupUsername: string;
  senderName: string;
  senderRole: 'Abonent (Egasi)' | 'Abonent (Yozuvchi)' | 'Aʼzo / Suhbatdosh' | 'Admin';
  senderHandle?: string;
  messageText: string;
  timestamp: string;
  dateFormatted: string;
  messageType: 'inquiry' | 'discussion' | 'announcement' | 'reply' | 'code_snippet' | 'solution';
  topic: string;
  replyTo?: {
    sender: string;
    text: string;
  };
  link: string;
  verificationSource: string;
}

export interface TelegramJoinedGroup {
  name: string;
  groupType: string;
  username: string;
  membersCount: string;
  userRole: string;
  link: string;
  verification: string;
  activity: string;
  messagesCount?: number;
  recentMessages?: TelegramGroupMessage[];
}

export interface TelegramGroupsDiscoverySection {
  inAppSearchUri: string;
  inAppResolveUri: string;
  commonChatsUri: string;
  actualJoinedGroups?: TelegramJoinedGroup[];
  directJoinedCommunities?: TelegramJoinedEntity[];
  groupMessagesHistory?: TelegramGroupMessage[];
  globalEngines: Array<{
    name: string;
    badge: string;
    url: string;
    description: string;
  }>;
  categories: TelegramGroupSearchCategory[];
  membershipTracking?: {
    overview: string;
    methods: TelegramMembershipMethod[];
    osintBots: TelegramOsintBot[];
  };
}

export interface PhoneLookupResponse {
  rawInput: string;
  formatted: PhoneFormattedDetails;
  orderedSections?: PhoneOrderedSection[];
  topSixPlatforms?: PhoneRegisteredPlatform[];
  registeredPlatforms: PhoneRegisteredPlatform[];
  associatedPhotos: VerifiedPhotoItem[];
  telegramGroups?: TelegramGroupsDiscoverySection;
  dataBreaches: DataBreachesSection;
  stealerLogs: StealerLogsSection;
  callerIdInsights: PhoneCallerIdInsights;
  activityAnalysis: PhoneActivityAnalysis;
  deepSearchEngines: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  workplace: WorkplaceInfo;
  source: 'live_telecom_and_osint' | 'intelbase_live';
  error?: string;
}

export interface InvestigationHistoryItem {
  id: string;
  timestamp: string;
  targetType: 'email' | 'username' | 'phone';
  targetValue: string;
  accountsFound: number;
  breachCount: number;
  stealerCount: number;
  authenticityScore?: number;
  exposureBand?: string;
  data: EmailLookupResponse | UsernameLookupResponse | PhoneLookupResponse;
  analysis?: AIAnalysisResult;
}

