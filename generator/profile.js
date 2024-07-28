/***************************************************************************
 ***  Fill this configuration and place it under %homepath/.run/ folder. ***
 ***************************************************************************/

const PROXY_PROVIDER_PATH = "/.config/clash-verge/profiles/";
const PROXY_PROVIDER_TYPE = "yaml";
const ALL_PROFILES_OUTPUT = "lb5bxiDvPOOT";

const PROVIDER_A = "SW";
const PROVIDER_B = "CL";
const PROVIDER_C = "FR";
const PROVIDER_D = "XF";
const PROVIDER_E = "KL";

const PROXY_PROVIDERS_MAP = {
    [PROVIDER_A]: "rJMe6hhgkXaX",
    [PROVIDER_B]: "rSdFtH4ObdA9",
    [PROVIDER_C]: "rn5AYTWlsFb8",
    [PROVIDER_D]: "r3skwCrlQaeY",
    [PROVIDER_E]: "ruSoFEnwBdIJ",
};

const PROVIDER_GROUPS = {
    [PROVIDER_A]: [
        { name: "HK", type: "url-test", filter: "HK" },
        { name: "SG", type: "url-test", filter: "SG" },
        { name: "TW", type: "url-test", filter: "TW" },
        { name: "US", type: "url-test", filter: "US" },
        { name: "JP", type: "url-test", filter: "JP" },
    ],
    [PROVIDER_B]: [
        { name: "HK", type: "url-test", filter: "(?<=IEPL).*(?:香港)" },
        { name: "SG", type: "url-test", filter: "(?<=IEPL).*(?:新加坡)" },
        { name: "TW", type: "url-test", filter: "(?<=IEPL).*(?:台湾)" },
        { name: "JP", type: "url-test", filter: "(?<=IEPL).*(?:日本)" },
        { name: "KR", type: "url-test", filter: "(?<=IEPL).*(?:韩国)" },
    ],
    [PROVIDER_C]: [
        { name: "HK", type: "url-test", filter: "(?i)^.*kong.*[^L]$" },
        { name: "SG", type: "url-test", filter: "(?i)^.*singapore.*[^L]$" },
        { name: "TW", type: "url-test", filter: "(?i)^.*taiwan.*[^L]$" },
        { name: "US", type: "url-test", filter: "(?i)^.*states.*[^L]$" },
        { name: "JP", type: "url-test", filter: "(?i)^.*japan.*[^L]$" },
        { name: "KR", type: "url-test", filter: "(?i)^.*korea.*[^L]$" },
        { name: "HK-IEPL", type: "url-test", filter: "(?i)^.*kong.*[L]$" },
        { name: "SG-IEPL", type: "url-test", filter: "(?i)^.*singapore.*[L]$" },
        { name: "TW-IEPL", type: "url-test", filter: "(?i)^.*taiwan.*[L]$" },
    ],
    [PROVIDER_D]: [
        { name: "HK", type: "load-balance", filter: ".+香港.+" },
        { name: "SG", type: "load-balance", filter: ".+新加坡.+" },
        { name: "TW", type: "load-balance", filter: ".+台湾.+" },
        { name: "US", type: "load-balance", filter: ".+美国.+" },
        { name: "JP", type: "load-balance", filter: ".+日本.+" },
    ],
    [PROVIDER_E]: [
        { name: "HK", type: "load-balance", filter: "^(?!.*套餐)(?!.*剩余).*$" }
    ],
};

/***************************************************************************
 ***  CV FALLBACK allow adjust but can't reset, REJECT rules can fix it. ***
 ***************************************************************************/

const MAIN_GROUPS = ["🌠 Comprehensive", "REJECT"];

const AUTO_GROUPS = ["🇭🇰 SLOT-HK", "🇸🇬 SLOT-SG", "🇹🇼 SLOT-TW", "🇯🇵 SLOT-JP", "🇺🇸 SLOT-US", "🇰🇷 SLOT-KR", "🇺🇳 SLOT-SP"];
const DEFAULT_DIRECT = ["DIRECT"].concat(AUTO_GROUPS);
const DEFAULT_REJECT = ["REJECT"].concat(AUTO_GROUPS);

const ADD_ON_FILTER = "^(?!.*套餐)(?!.*剩余)(?!.*XF).*$";

const GROUPS = [
    { name: "🌠 Comprehensive", type: "select", proxies: AUTO_GROUPS },
    { name: "🟦 PikPak", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟩 OpenAI", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟩 Copilot", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟩 Gemini", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟧 Reddit", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟧 Telegram", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟧 GitHub", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟧 Steam", type: "select", proxies: DEFAULT_REJECT },
    { name: "🎇 PcapEsc", type: "select", proxies: MAIN_GROUPS },
    { name: "🌌 BlackHole", type: "select", proxies: DEFAULT_DIRECT },
    { name: "🇭🇰 SLOT-HK", type: "fallback", proxies: ["REJECT"], append: true, filter: "HK" },
    { name: "🇸🇬 SLOT-SG", type: "fallback", proxies: ["REJECT"], append: true, filter: "SG" },
    { name: "🇹🇼 SLOT-TW", type: "fallback", proxies: ["REJECT"], append: true, filter: "TW" },
    { name: "🇯🇵 SLOT-JP", type: "fallback", proxies: ["REJECT"], append: true, filter: "JP" },
    { name: "🇺🇸 SLOT-US", type: "fallback", proxies: ["REJECT"], append: true, filter: "US" },
    { name: "🇰🇷 SLOT-KR", type: "fallback", proxies: ["REJECT"], append: true, filter: "KR" },
    { name: "🇺🇳 SLOT-SP", type: "fallback", proxies: ["REJECT"], append: true, filter: "(KL|XF)" },
    { name: "🎆 SWIFT", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_A], filter: ADD_ON_FILTER },
    { name: "🎆 CLOVER", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_B], filter: ADD_ON_FILTER },
    { name: "🎆 FANRR", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_C], filter: ADD_ON_FILTER },
    { name: "🎆 XFSS", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_D], filter: ADD_ON_FILTER },
    { name: "🎆 KELE", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_E], filter: ADD_ON_FILTER },
];


/***************************************************************************
 ***   Rules must be compatible with the specific clash kernel version.  ***
 ***************************************************************************/

const RULES = [
    "RULE-SET,addition-reject,REJECT",
    "RULE-SET,addition-direct,DIRECT",
    "RULE-SET,addition-openai,🟩 OpenAI",
    "RULE-SET,addition-gemini,🟩 Gemini",
    "RULE-SET,addition-copilot,🟩 Copilot",
    "RULE-SET,special-reddit,🟧 Reddit",
    "RULE-SET,special-telegram,🟧 Telegram",
    "RULE-SET,original-telegramcidr,🟧 Telegram,no-resolve",
    "RULE-SET,special-github,🟧 GitHub",
    "RULE-SET,special-steam,🟧 Steam",
    "RULE-SET,addition-proxy,🌠 Comprehensive",
    "RULE-SET,original-applications,DIRECT",
    "RULE-SET,original-apple,DIRECT",
    "RULE-SET,original-icloud,DIRECT",
    "RULE-SET,original-private,DIRECT",
    "RULE-SET,original-direct,DIRECT",
    "RULE-SET,special-pikpak,🟦 PikPak",
    "RULE-SET,original-greatfire,🌠 Comprehensive",
    "RULE-SET,original-gfw,🌠 Comprehensive",
    "RULE-SET,original-proxy,🌠 Comprehensive",
    "RULE-SET,original-tld-not-cn,🌠 Comprehensive",
    "RULE-SET,original-reject,REJECT",
    "RULE-SET,original-lancidr,DIRECT,no-resolve",
    "RULE-SET,original-cncidr,DIRECT,no-resolve",
    "GEOIP,LAN,DIRECT,no-resolve",
    "GEOIP,CN,DIRECT,no-resolve",
    "AND,((PROCESS-NAME,pcapsvc.exe),(IN-TYPE,SOCKS5)),DIRECT",
    "AND,((PROCESS-NAME,pcapsvc.exe),(IN-TYPE,HTTPS)),🎇 PcapEsc",
    "OR,((IN-TYPE,HTTP),(IN-TYPE,HTTPS)),🌠 Comprehensive",
    "IN-TYPE,SOCKS5,DIRECT",
    "MATCH,🌌 BlackHole"
];

module.exports = {
    PROXY_PROVIDER_PATH,
    PROXY_PROVIDER_TYPE,
    PROXY_PROVIDERS_MAP,
    ALL_PROFILES_OUTPUT,
    PROVIDER_GROUPS,
    GROUPS,
    RULES,
};