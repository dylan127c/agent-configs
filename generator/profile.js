const GROUPS = [
    { name: "🎇 Comprehensive", type: "select", proxies: ["REJECT", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🌠 SocksEscape", type: "select", proxies: ["DIRECT", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🌠 HttpsEscape", type: "select", proxies: ["🎇 Comprehensive", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🌠 PcapsvcEscape", type: "select", proxies: ["🎇 Comprehensive"], use: false },
    { name: "🎆 PikPak", type: "select", proxies: ["DIRECT"], use: false },
    { name: "🎆 OpenAI", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 GitHub", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 Gemini", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 Copilot", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 YouTube", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 Steam", type: "select", proxies: ["DIRECT"], use: false },
    { name: "🌠 FinalEscape", type: "select", proxies: ["DIRECT", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🌅 SPECIFIC-LINE", type: "select", proxies: ["REJECT"], use: true, all: true, filter: "^[^(📮|⏰|💥|🎮|剩|套|地|续)]" },
    // { name: "🛂 ORIENT", type: "select", proxies: ["REJECT"], use: true, provider: ["OR"] },
    { name: "🛂 SWIFT", type: "select", proxies: ["REJECT"], use: true, provider: ["SW"] },
    { name: "🛂 CLOVER", type: "select", proxies: ["REJECT"], use: true, provider: ["CL"], filter: "^[^(剩|套)]" },
    { name: "🛂 FANRR", type: "select", proxies: ["REJECT"], use: true, provider: ["FR"], filter: "^[^(剩|套|先)]" },
    { name: "🛂 KELE", type: "select", proxies: ["REJECT"], use: true, provider: ["KL"], filter: "^[^(剩|套)]" },
];

const PROVIDER_GROUPS = {
    // "OR": [
    //     { name: "HK-IEPL/CM", type: "url-test", filter: "深港专线" },
    //     { name: "HK-IEPL/CT", type: "url-test", filter: "沪港专线" },
    //     { name: "JP-IEPL/CT", type: "url-test", filter: "沪日专线" },
    //     { name: "HK", type: "url-test", filter: "香港.*(?:HK|BGP)" },
    //     { name: "JP", type: "url-test", filter: "日本.*(?:Akamai|IIJ|NTT)" },
    //     { name: "TW", type: "url-test", filter: "台湾.*" },
    //     { name: "SG", type: "url-test", filter: "新加坡.*" },
    //     { name: "US", type: "url-test", filter: "美国.*" },
    //     { name: "KR", type: "url-test", filter: "韩国.*" },
    // ],
    "SW": [
        { name: "HK", type: "url-test", filter: "🇭🇰" },
        { name: "SG", type: "url-test", filter: "🇸🇬" },
        { name: "TW", type: "url-test", filter: "🇹🇼" },
        { name: "US", type: "url-test", filter: "🇺🇸" },
        { name: "JP", type: "url-test", filter: "🇯🇵" },
    ],
    "CL": [
        { name: "HK", type: "url-test", filter: "(?<=IEPL).*(?:香港)" },
        { name: "SG", type: "url-test", filter: "(?<=IEPL).*(?:新加坡)" },
        { name: "TW", type: "url-test", filter: "(?<=IEPL).*(?:台湾)" },
        { name: "JP", type: "url-test", filter: "(?<=IEPL).*(?:日本)" },
        { name: "KR", type: "url-test", filter: "(?<=IEPL).*(?:韩国)" },
    ],
    "FR": [
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
    "KL": [
        { name: "HK-CM", type: "load-balance", filter: "cm-hk" },
        { name: "HK-CU", type: "load-balance", filter: "cu-hk" },
        { name: "HK-CT", type: "load-balance", filter: "ct-hk" },
    ],
};

const RULE_PROVIDER_PATH = "../commons/rules/";
const RULE_PROVIDER_TYPE = "yaml";
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
    // "AND,((PROCESS-NAME,msedge.exe),(IN-TYPE,SOCKS5)),DIRECT",
    // "AND,((PROCESS-NAME,msedge.exe),(IN-TYPE,HTTPS)),🎇 Comprehensive",
    // "AND,((PROCESS-NAME,pcapsvc.exe),(IN-TYPE,SOCKS5)),DIRECT",
    "AND,((PROCESS-NAME,pcapsvc.exe),(IN-TYPE,HTTPS)),🌠 PcapsvcEscape",
    "IN-TYPE,SOCKS5,🌠 SocksEscape",
    "IN-TYPE,HTTP,🌠 HttpsEscape",
    "IN-TYPE,HTTPS,🌠 HttpsEscape",
    "MATCH,🌠 FinalEscape"
];

const FLAG = { HK: "🇭🇰", SG: "🇸🇬", TW: "🇹🇼", US: "🇺🇸", JP: "🇯🇵", UK: "🇬🇧", KR: "🇰🇷", UN: "🇺🇳" };

const IPCIDR = "ipcidr";
const CLASSICAL = "classical";
const DOMAIN = "domain";

const TYPE_MAP = {
    IPCIDR: ["cidr"],
    CLASSICAL: ["special", "application"],
}

const LOAD_BALANCE = "load-balance"
const LOAD_BALANCE_PARAMS = {
    url: "https://www.gstatic.com/generate_204",
    lazy: true,
    strategy: "consistent-hashing",
    interval: 300
};

const URL_TEST = "url-test";
const URL_TEST_PARAMS = {
    url: "https://www.gstatic.com/generate_204",
    lazy: true,
    tolerance: 50,
    interval: 300
};

const FALLBACK = "fallback";
const FALLBACK_PARAMS = {
    url: "https://www.gstatic.com/generate_204",
    lazy: true,
    interval: 300
};

const HEALTH_CHECK = {
    "health-check": {
        enable: true,
        url: "https://www.gstatic.com/generate_204",
        interval: 300
    }
};

module.exports = {
    GROUPS,
    PROVIDER_GROUPS,
    IPCIDR,
    CLASSICAL,
    DOMAIN,
    TYPE_MAP,
    RULE_PROVIDER_PATH,
    RULE_PROVIDER_TYPE,
    RULES,
    FLAG,
    LOAD_BALANCE,
    LOAD_BALANCE_PARAMS,
    URL_TEST,
    URL_TEST_PARAMS,
    FALLBACK,
    FALLBACK_PARAMS,
    HEALTH_CHECK
};  