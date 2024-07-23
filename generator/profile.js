/***************************************************************************
 ***  Fill this configuration and place it under %homepath/.run/ folder. ***
 ***************************************************************************/

const PROXY_PROVIDER_PATH = "/.config/clash-verge/profiles/";
const PROXY_PROVIDER_TYPE = "yaml";
const ALL_PROFILES_OUTPUT = "lb5bxiDvPOOT";

const PROVIDER_A = "SW";
const PROVIDER_B = "CL";
const PROVIDER_C = "FR";
const PROVIDER_D = "KL";

const PROXY_PROVIDERS_MAP = {
    [PROVIDER_A]: "rJMe6hhgkXaX",
    [PROVIDER_B]: "rSdFtH4ObdA9",
    [PROVIDER_C]: "rn5AYTWlsFb8",
    [PROVIDER_D]: "ruSoFEnwBdIJ",
};

const PROVIDER_GROUPS = {
    [PROVIDER_A]: [
        { name: "HK", type: "url-test", filter: "🇭🇰" },
        { name: "SG", type: "url-test", filter: "🇸🇬" },
        { name: "TW", type: "url-test", filter: "🇹🇼" },
        { name: "US", type: "url-test", filter: "🇺🇸" },
        { name: "JP", type: "url-test", filter: "🇯🇵" },
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
        { name: "HK-IEPL", type: "url-test", filter: "(?i)^.*kong.*L$" },
        { name: "SG-IEPL", type: "url-test", filter: "(?i)^.*singapore.*L$" },
        { name: "TW-IEPL", type: "url-test", filter: "(?i)^.*taiwan.*L$" },
    ],
    [PROVIDER_D]: [
        { name: "HK-CM", type: "load-balance", filter: "cm-hk" },
        { name: "HK-CU", type: "load-balance", filter: "cu-hk" },
        { name: "HK-CT", type: "load-balance", filter: "ct-hk" },
    ]
};

const AUTO_GROUPS = ["🇭🇰 HK-AUTO", "🇸🇬 SG-AUTO", "🇹🇼 TW-AUTO", "🇯🇵 JP-AUTO", "🇰🇷 KR-AUTO"];
const DEFAULT_DIRECT = ["DIRECT"].concat(AUTO_GROUPS);
const DEFAULT_REJECT = ["REJECT"].concat(AUTO_GROUPS);
const DEFAULT_MIX_UP = ["🎇 Comprehensive", "🌅 Specific"].concat(AUTO_GROUPS);

const GROUPS = [
    { name: "🎇 Comprehensive", type: "select", proxies: ["REJECT", "🌅 Specific"].concat(AUTO_GROUPS), use: false },
    { name: "🌠 SocksEsc", type: "select", proxies: ["DIRECT"].concat(DEFAULT_MIX_UP), use: false },
    { name: "🌠 HttpsEsc", type: "select", proxies: DEFAULT_MIX_UP, use: false },
    { name: "🌠 PcapsEsc", type: "select", proxies: DEFAULT_MIX_UP, use: false },
    { name: "🎆 PikPak", type: "select", proxies: DEFAULT_DIRECT, use: false },
    { name: "🎆 Steam", type: "select", proxies: DEFAULT_DIRECT, use: false },
    { name: "🎆 OpenAI", type: "select", proxies: DEFAULT_REJECT, use: false },
    { name: "🎆 GitHub", type: "select", proxies: DEFAULT_REJECT, use: false },
    { name: "🎆 Gemini", type: "select", proxies: DEFAULT_REJECT, use: false },
    { name: "🎆 Copilot", type: "select", proxies: DEFAULT_REJECT, use: false },
    { name: "🎆 YouTube", type: "select", proxies: DEFAULT_REJECT, use: false },
    { name: "🌅 Specific", type: "select", proxies: ["REJECT"], use: true, all: true, filter: "^[^(剩|套)]" },
    { name: "🌌 BlackHole", type: "select", proxies: ["DIRECT"].concat(DEFAULT_MIX_UP), use: false },
    { name: "🛂 SWIFT", type: "select", proxies: ["REJECT"], use: true, provider: [PROVIDER_A] },
    { name: "🛂 CLOVER", type: "select", proxies: ["REJECT"], use: true, provider: [PROVIDER_B], filter: "^[^(剩|套)]" },
    { name: "🛂 FANRR", type: "select", proxies: ["REJECT"], use: true, provider: [PROVIDER_C], filter: "^[^(剩|套)]" },
    { name: "🛂 KELE", type: "select", proxies: ["REJECT"], use: true, provider: [PROVIDER_D], filter: "^[^(剩|套)]" },
    { name: "🇭🇰 HK-AUTO", type: "url-test", use: false, filter: "HK" },
    { name: "🇸🇬 SG-AUTO", type: "url-test", use: false, filter: "SG" },
    { name: "🇹🇼 TW-AUTO", type: "url-test", use: false, filter: "TW" },
    { name: "🇯🇵 JP-AUTO", type: "url-test", use: false, filter: "JP" },
    { name: "🇰🇷 KR-AUTO", type: "url-test", use: false, filter: "KR" },
];


/***************************************************************************
 ***   Rules must be compatible with the specific clash kernel version.  ***
 ***************************************************************************/

const RULES = [
    "RULE-SET,addition-reject,REJECT",
    "RULE-SET,addition-direct,DIRECT",
    "RULE-SET,addition-openai,🎆 OpenAI",
    "RULE-SET,addition-gemini,🎆 Gemini",
    "RULE-SET,addition-copilot,🎆 Copilot",
    "RULE-SET,special-youtube,🎆 YouTube",
    "RULE-SET,special-github,🎆 GitHub",
    "RULE-SET,special-steam,🎆 Steam",
    "RULE-SET,addition-proxy,🎇 Comprehensive",
    "RULE-SET,original-applications,DIRECT",
    "RULE-SET,original-apple,DIRECT",
    "RULE-SET,original-icloud,DIRECT",
    "RULE-SET,original-private,DIRECT",
    "RULE-SET,original-direct,DIRECT",
    "RULE-SET,special-pikpak,🎆 PikPak",
    "RULE-SET,original-greatfire,🎇 Comprehensive",
    "RULE-SET,original-gfw,🎇 Comprehensive",
    "RULE-SET,original-proxy,🎇 Comprehensive",
    "RULE-SET,original-tld-not-cn,🎇 Comprehensive",
    "RULE-SET,original-reject,REJECT",
    "RULE-SET,original-telegramcidr,🎇 Comprehensive,no-resolve",
    "RULE-SET,original-lancidr,DIRECT,no-resolve",
    "RULE-SET,original-cncidr,DIRECT,no-resolve",
    "GEOIP,LAN,DIRECT,no-resolve",
    "GEOIP,CN,DIRECT,no-resolve",
    "AND,((PROCESS-NAME,pcapsvc.exe),(IN-TYPE,SOCKS5)),DIRECT",
    "AND,((PROCESS-NAME,pcapsvc.exe),(IN-TYPE,HTTPS)),🌠 PcapsEsc",
    "OR,((IN-TYPE,HTTP),(IN-TYPE,HTTPS)),🌠 HttpsEsc",
    "IN-TYPE,SOCKS5,🌠 SocksEsc",
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