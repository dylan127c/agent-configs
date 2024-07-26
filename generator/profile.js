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
const PROVIDER_E = "XF";

const PROXY_PROVIDERS_MAP = {
    [PROVIDER_A]: "rJMe6hhgkXaX",
    [PROVIDER_B]: "rSdFtH4ObdA9",
    [PROVIDER_C]: "rn5AYTWlsFb8",
    [PROVIDER_D]: "ruSoFEnwBdIJ",
    [PROVIDER_E]: "r3skwCrlQaeY",
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
    ],
    [PROVIDER_E]: [
        { name: "HK", type: "load-balance", filter: ".+香港.+" },
        { name: "SG", type: "load-balance", filter: ".+新加坡.+" },
        { name: "TW", type: "load-balance", filter: ".+台湾.+" },
        { name: "US", type: "load-balance", filter: ".+美国.+" },
        { name: "JP", type: "load-balance", filter: ".+日本.+" },
    ],
    [PROVIDER_D]: [
        { name: "HK-CM", type: "load-balance", filter: "cm-hk" },
        { name: "HK-CU", type: "load-balance", filter: "cu-hk" },
        { name: "HK-CT", type: "load-balance", filter: "ct-hk" },
    ],
};

const AUTO_GROUPS = ["🇸🇬 SG-AUTO", "🇭🇰 HK-AUTO", "🇹🇼 TW-AUTO", "🇯🇵 JP-AUTO", "🇰🇷 KR-AUTO", "🇺🇸 US-AUTO"];
const DEFAULT_DIRECT = ["DIRECT"].concat(AUTO_GROUPS);
const DEFAULT_REJECT = ["REJECT"].concat(AUTO_GROUPS);
const ADD_ON_FILTER = "^(?!.*套餐)(?!.*剩余)(?!.*XF).*$";

const GROUPS = [
    { name: "🌠 Comprehensive", type: "fallback", proxies: AUTO_GROUPS, append: false },
    { name: "🟩 PikPak", type: "select", proxies: ["REJECT"], append: true, use: false },
    { name: "🟦 Copilot", type: "select", proxies: ["REJECT"], append: true, use: false },
    { name: "🟦 Gemini", type: "select", proxies: ["REJECT"], append: true, use: false },
    { name: "🟦 OpenAI", type: "select", proxies: ["REJECT"], append: true, use: false },
    { name: "🎇 PcapEsc", type: "fallback", proxies: AUTO_GROUPS, append: false },
    { name: "🟧 Reddit", type: "fallback", proxies: AUTO_GROUPS, append: false },
    { name: "🟧 Telegram", type: "fallback", proxies: AUTO_GROUPS, append: false },
    { name: "🟧 GitHub", type: "fallback", proxies: AUTO_GROUPS, append: false },
    { name: "🟧 Steam", type: "fallback", proxies: AUTO_GROUPS, append: false },
    { name: "🌌 BlackHole", type: "select", proxies: DEFAULT_DIRECT, append: false },
    { name: "🎆 SW-ALL", type: "select", proxies: ["REJECT"], append: true, use: true, provider: [PROVIDER_A], filter: ADD_ON_FILTER },
    { name: "🎆 CL-ALL", type: "select", proxies: ["REJECT"], append: true, use: true, provider: [PROVIDER_B], filter: ADD_ON_FILTER },
    { name: "🎆 FR-ALL", type: "select", proxies: ["REJECT"], append: true, use: true, provider: [PROVIDER_C], filter: ADD_ON_FILTER },
    { name: "🎆 KL-ALL", type: "select", proxies: ["REJECT"], append: true, use: true, provider: [PROVIDER_D], filter: ADD_ON_FILTER },
    { name: "🎆 XF-ALL", type: "select", proxies: ["REJECT"], append: true, use: true, provider: [PROVIDER_E], filter: ADD_ON_FILTER },
    { name: "🇭🇰 HK-AUTO", type: "url-test", append: true, use: false, filter: "HK" },
    { name: "🇸🇬 SG-AUTO", type: "url-test", append: true, use: false, filter: "SG" },
    { name: "🇹🇼 TW-AUTO", type: "url-test", append: true, use: false, filter: "TW" },
    { name: "🇯🇵 JP-AUTO", type: "url-test", append: true, use: false, filter: "JP" },
    { name: "🇰🇷 KR-AUTO", type: "url-test", append: true, use: false, filter: "KR" },
    { name: "🇺🇸 US-AUTO", type: "url-test", append: true, use: false, filter: "US" },
];


/***************************************************************************
 ***   Rules must be compatible with the specific clash kernel version.  ***
 ***************************************************************************/

const RULES = [
    "RULE-SET,addition-reject,REJECT",
    "RULE-SET,addition-direct,DIRECT",
    "RULE-SET,addition-openai,🟦 OpenAI",
    "RULE-SET,addition-gemini,🟦 Gemini",
    "RULE-SET,addition-copilot,🟦 Copilot",
    "RULE-SET,special-reddit,🟧 Reddit",
    "RULE-SET,special-telegram,🟧 Telegram",
    "RULE-SET,original-telegramcidr,🟧 Telegram",
    "RULE-SET,special-github,🟧 GitHub",
    "RULE-SET,special-steam,🟧 Steam",
    "RULE-SET,addition-proxy,🌠 Comprehensive",
    "RULE-SET,original-applications,DIRECT",
    "RULE-SET,original-apple,DIRECT",
    "RULE-SET,original-icloud,DIRECT",
    "RULE-SET,original-private,DIRECT",
    "RULE-SET,original-direct,DIRECT",
    "RULE-SET,special-pikpak,🟩 PikPak",
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