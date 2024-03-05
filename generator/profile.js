const GROUPS = [
    { name: "🎇 Comprehensive", type: "select", proxies: ["REJECT", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🌠 Http(s)Escape", type: "select", proxies: ["🎇 Comprehensive", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🌠 Socks(5)Escape", type: "select", proxies: ["DIRECT", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🎆 PikPak", type: "select", proxies: ["DIRECT", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🎆 OpenAI", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 GitHub", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 Claude", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 Gemini", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 Copilot", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 YouTube", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 Steam", type: "select", proxies: ["REJECT"], use: false },
    { name: "🎆 Bilibili", type: "select", proxies: ["DIRECT"], use: false },
    { name: "🌠 FinalEscape", type: "select", proxies: ["DIRECT", "🌅 SPECIFIC-LINE"], use: false },
    { name: "🌅 SPECIFIC-LINE", type: "select", proxies: ["REJECT"], use: true, all: true, filter: "^[^(📮|⏰|💥|🎮|剩|套|地|续)]" },
    // { name: "🛂 SWIFT", type: "select", proxies: ["REJECT"], use: true, provider: ["SW"] },
    // { name: "🛂 CLOVER", type: "select", proxies: ["REJECT"], use: true, provider: ["CL"], filter: "^[^(剩|套)]" },
    // { name: "🛂 FANRR", type: "select", proxies: ["REJECT"], use: true, provider: ["FR"], filter: "^[^(📮|⏰|💥|🎮)]" },
    // { name: "🛂 XINYUN", type: "select", proxies: ["REJECT"], use: true, provider: ["XY"], filter: "^[^(地|续)]" },
    // { name: "🛂 KELE", type: "select", proxies: ["REJECT"], use: true, provider: ["KL"], filter: "^[^(剩|套)]" },
];

const PROVIDER_GROUPS = {
    "SW": [
        // { name: "HK-LB", type: "load-balance", filter: "🇭🇰" },
        // { name: "SG-LB", type: "load-balance", filter: "🇸🇬" },
        // { name: "TW-LB", type: "load-balance", filter: "🇹🇼" },
        // { name: "US-LB", type: "load-balance", filter: "🇺🇸" },
        // { name: "JP-LB", type: "load-balance", filter: "🇯🇵" },
        { name: "HK-UT", type: "url-test", filter: "🇭🇰" },
        { name: "SG-UT", type: "url-test", filter: "🇸🇬" },
        { name: "TW-UT", type: "url-test", filter: "🇹🇼" },
        { name: "US-UT", type: "url-test", filter: "🇺🇸" },
        { name: "JP-UT", type: "url-test", filter: "🇯🇵" },
    ],
    "CL": [
        // { name: "HK-IEPL-LB", type: "load-balance", filter: "(?<=IEPL).*(?:香港)" },
        // { name: "SG-IEPL-LB", type: "load-balance", filter: "(?<=IEPL).*(?:新加坡)" },
        // { name: "TW-IEPL-LB", type: "load-balance", filter: "(?<=IEPL).*(?:台湾)" },
        // { name: "KR-IEPL-LB", type: "load-balance", filter: "(?<=IEPL).*(?:韩国)" },
        // { name: "JP-IEPL-LB", type: "load-balance", filter: "(?<=IEPL).*(?:日本)" },
        // { name: "HK-TRANS-LB", type: "load-balance", filter: "^(?!.*(?:IEPL)).*香港" },
        // { name: "SG-TRANS-LB", type: "load-balance", filter: "^(?!.*(?:IEPL)).*新加坡" },
        // { name: "TW-TRANS-LB", type: "load-balance", filter: "^(?!.*(?:IEPL)).*台湾" },
        // { name: "KR-TRANS-LB", type: "load-balance", filter: "^(?!.*(?:IEPL)).*韩国" },
        // { name: "JP-TRANS-LB", type: "load-balance", filter: "^(?!.*(?:IEPL)).*日本" },
        { name: "HK-IEPL-UT", type: "url-test", filter: "(?<=IEPL).*(?:香港)" },
        { name: "SG-IEPL-UT", type: "url-test", filter: "(?<=IEPL).*(?:新加坡)" },
        { name: "TW-IEPL-UT", type: "url-test", filter: "(?<=IEPL).*(?:台湾)" },
        { name: "KR-IEPL-UT", type: "url-test", filter: "(?<=IEPL).*(?:韩国)" },
        { name: "JP-IEPL-UT", type: "url-test", filter: "(?<=IEPL).*(?:日本)" },
        { name: "HK-TRANS-UT", type: "url-test", filter: "^(?!.*(?:IEPL)).*香港" },
        { name: "SG-TRANS-UT", type: "url-test", filter: "^(?!.*(?:IEPL)).*新加坡" },
        { name: "TW-TRANS-UT", type: "url-test", filter: "^(?!.*(?:IEPL)).*台湾" },
        { name: "KR-TRANS-UT", type: "url-test", filter: "^(?!.*(?:IEPL)).*韩国" },
        { name: "JP-TRANS-UT", type: "url-test", filter: "^(?!.*(?:IEPL)).*日本" },
    ],
    "XY": [
        // { name: "HK-LB", type: "load-balance", filter: "香港.*" },
        // { name: "SG-LB", type: "load-balance", filter: "(?:狮城|新加坡).*" },
        // { name: "JP-LB", type: "load-balance", filter: "日本.*" },
        // { name: "US-LB", type: "load-balance", filter: "美国.*" },
        // { name: "TW-LB", type: "load-balance", filter: "台湾.*" },
        // { name: "UK-LB", type: "load-balance", filter: "英国.*" },
        { name: "HK-UT", type: "url-test", filter: "香港.*" },
        { name: "SG-UT", type: "url-test", filter: "(?:狮城|新加坡).*" },
        { name: "JP-UT", type: "url-test", filter: "日本.*" },
        { name: "US-UT", type: "url-test", filter: "美国.*" },
        { name: "TW-UT", type: "url-test", filter: "台湾.*" },
        { name: "UK-UT", type: "url-test", filter: "英国.*" },
    ],
    "FR": [
        { name: "HK", type: "load-balance", filter: "(?i)^.*kong((?!premium).)*$" },
        { name: "US", type: "load-balance", filter: "(?i)^.*states((?!premium).)*[^x]$" },
        { name: "JP", type: "load-balance", filter: "(?i)^.*japan((?!premium).)*[^x]$" },
        { name: "PREMIUM-HK", type: "load-balance", filter: "(?i)hong.*premium" },
        { name: "PREMIUM-SG", type: "load-balance", filter: "(?i)singapore.*premium" },
        { name: "PREMIUM-TW", type: "load-balance", filter: "(?i)taiwan.*premium" },
        { name: "PREMIUM-JP", type: "load-balance", filter: "(?i)japan.*premium" },
    ],
    "KL": [
        { name: "HK", type: "load-balance", filter: "香港.*" },
    ]
};

const RULE_PROVIDER_PATH = "h:/onedrive/repositories/proxy rules/commons/rules/";
const RULE_PROVIDER_TYPE = "yaml";
const RULES = [
    "RULE-SET,addition-reject,REJECT",
    "RULE-SET,addition-direct,DIRECT",
    "RULE-SET,addition-openai,🎆 OpenAI",
    "RULE-SET,addition-gemini,🎆 Gemini",
    "RULE-SET,addition-copilot,🎆 Copilot",
    "RULE-SET,special-pikpak,🎆 PikPak",
    "RULE-SET,special-bilibili,🎆 Bilibili",
    "RULE-SET,special-youtube,🎆 YouTube",
    "RULE-SET,special-github,🎆 GitHub",
    "RULE-SET,special-steam,🎆 Steam",
    "RULE-SET,addition-proxy,🎇 Comprehensive",
    "RULE-SET,original-applications,DIRECT",
    "RULE-SET,original-apple,DIRECT",
    "RULE-SET,original-icloud,DIRECT",
    "RULE-SET,original-private,DIRECT",
    "RULE-SET,original-direct,DIRECT",
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
    "IN-TYPE,HTTP,🌠 Http(s)Escape",
    "IN-TYPE,HTTPS,🌠 Http(s)Escape",
    "IN-TYPE,SOCKS5,🌠 Socks(5)Escape",
    "MATCH,🌠 FinalEscape"
];

const PROXY_PROVIDER_PATH = "c:/users/dylan/.config/clash-verge/profiles/";
const PROXY_PROVIDER_TYPE = "yaml";
const PROXY_PROVIDERS_MAP = {
    "CL": "rVHWildVA4kE",
    "XY": "rrs4tf1oAqZD",
    "SW": "rgdpxDKzALxP",
    "FR": "rTvDYQBQb8EX",
    "KL": "rKHPVl529aYE"
};

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
    PROXY_PROVIDER_PATH,
    PROXY_PROVIDER_TYPE,
    PROXY_PROVIDERS_MAP,
    FLAG,
    LOAD_BALANCE,
    LOAD_BALANCE_PARAMS,
    URL_TEST,
    URL_TEST_PARAMS,
    FALLBACK,
    FALLBACK_PARAMS,
    HEALTH_CHECK
};  