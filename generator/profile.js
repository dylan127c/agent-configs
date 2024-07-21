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