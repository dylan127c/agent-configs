/***************************************************************************
 ***  Fill this configuration and place it under %homepath/.run/ folder. ***
 ***************************************************************************/

const PROXY_PROVIDER_PATH = "/.config/clash-verge/profiles/";
const PROXY_PROVIDER_TYPE = "yaml";
const ALL_PROFILES_OUTPUT = "lb5bxiDvPOOT";

const PROVIDER_K = "AK";
const PROVIDER_Y = "OR";
const PROVIDER_A = "SW";
const PROVIDER_D = "MC";
const PROVIDER_Z = "LD";
const PROVIDER_C = "FR";
const PROVIDER_B = "XF";

const PROXY_PROVIDERS_MAP = {
    [PROVIDER_K]: "rAiGByko9FG8",
    [PROVIDER_Y]: "rPtUeRVeo6Qd",
    [PROVIDER_A]: "rgz4yTSVjiEf",
    [PROVIDER_D]: "rUFbrlndDbcg",
    [PROVIDER_Z]: "rwjdN9tg4Ls0",
    [PROVIDER_C]: "rn5AYTWlsFb8",
    [PROVIDER_B]: "rPv2M2SID2co",
};

const PROVIDER_GROUPS = {
    [PROVIDER_K]: [
        { name: "HK", type: "url-test", filter: "HKG" },
        { name: "SG", type: "url-test", filter: "SGP" },
        { name: "TW", type: "url-test", filter: "TWN" },
        { name: "JP", type: "url-test", filter: "JPN" },
        { name: "US", type: "url-test", filter: "美国" },
        { name: "KR", type: "url-test", filter: "(?i)KOREA" },
    ],
    [PROVIDER_Y]: [
        { name: "HK-IEPL/CM", type: "url-test", filter: "移动/深港" },
        { name: "HK-IEPL/CT", type: "url-test", filter: "电信/深港" },
        { name: "JP-IEPL/CT", type: "url-test", filter: "电信/沪日" },
        { name: "HK", type: "url-test", filter: "香港.*(?:HK|BGP)" },
        { name: "JP", type: "url-test", filter: "日本.*(?:Akamai|IIJ|NTT)" },
        { name: "TW", type: "url-test", filter: "台湾.*" },
        { name: "SG", type: "url-test", filter: "新加坡.*" },
        { name: "US", type: "url-test", filter: "美国.*" },
        { name: "KR", type: "url-test", filter: "韩国.*" },
    ],
    [PROVIDER_A]: [
        { name: "HK", type: "url-test", filter: "HK" },
        { name: "SG", type: "url-test", filter: "SG" },
        { name: "TW", type: "url-test", filter: "TW" },
        { name: "US", type: "url-test", filter: "US" },
        { name: "JP", type: "url-test", filter: "JP" },
    ],
    [PROVIDER_D]: [
        { name: "HK", type: "url-test", filter: "HK.*[^x]$" },
        { name: "SG", type: "url-test", filter: "SG" },
        { name: "TW", type: "url-test", filter: "TW" },
        { name: "US", type: "url-test", filter: "US" },
        { name: "JP", type: "url-test", filter: "JP" },
        { name: "KR", type: "url-test", filter: "KOR" },
        { name: "MY", type: "url-test", filter: "MYS" },
    ],

    // *.配置文件 params.js 中已将 load-balance 类型策略调整为 round-robin 模式，该策略不适用于日常使用。
    // *.策略 round-robin 下会把所有的请求分配给策略组内不同的代理节点，这适用于资源的下载。
    [PROVIDER_Z]: [
        { name: "HK", type: "load-balance", filter: "香港" },
        { name: "SG", type: "load-balance", filter: "新加坡" },
        { name: "TW", type: "load-balance", filter: "台湾" },
        { name: "US", type: "load-balance", filter: "美国" },
        { name: "JP", type: "load-balance", filter: "日本" },
        { name: "KR", type: "load-balance", filter: "韩国" },
        { name: "PL", type: "load-balance", filter: "波兰" },
    ],
    [PROVIDER_C]: [
        { name: "HK", type: "load-balance", filter: "(?i)^.*kong.*[^L]$" },
        { name: "SG", type: "load-balance", filter: "(?i)^.*singapore.*[^L]$" },
        { name: "TW", type: "load-balance", filter: "(?i)^.*taiwan.*[^L]$" },
        { name: "US", type: "load-balance", filter: "(?i)^.*states.*[^L]$" },
        { name: "JP", type: "load-balance", filter: "(?i)^.*japan.*[^L]$" },
        { name: "KR", type: "load-balance", filter: "(?i)^.*korea.*[^L]$" },
    ],
    [PROVIDER_B]: [
        { name: "HK", type: "load-balance", filter: "香港" },
        { name: "SG", type: "load-balance", filter: "新加坡" },
        { name: "TW", type: "load-balance", filter: "台湾" },
        { name: "US", type: "load-balance", filter: "美国" },
        { name: "JP", type: "load-balance", filter: "日本" },
    ],
};

/***************************************************************************
 ***  CV FALLBACK allow adjust but can't reset, REJECT rules can fix it. ***
 ***************************************************************************/

const AUTO_GROUPS = ["🇭🇰 SLOT-HK", "🇸🇬 SLOT-SG", "🇹🇼 SLOT-TW", "🇯🇵 SLOT-JP", "🇺🇸 SLOT-US", "🇰🇷 SLOT-KR"];
const DEFAULT_DIRECT = ["DIRECT"].concat(AUTO_GROUPS);
const DEFAULT_REJECT = ["REJECT"].concat(AUTO_GROUPS);

const ADD_ON_FILTER = "^(?!.*套餐)(?!.*剩余)(?!.*网址)(?!.*(?:请|官|备|此)).*$";

const GROUPS = [
    { name: "🌠 ALL", type: "select", proxies: AUTO_GROUPS },

    { name: "🟥 OPEN-AI", type: "select", proxies: ["REJECT"], append: true, filter: "^(?!.*(?:LD|FR|XF)).*$" },
    { name: "🟦 PIKPAK", type: "select", append: true, filter: "LD|FR|XF" },
    { name: "🟩 COPILOT", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟩 GEMINI", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟧 REDDIT", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟧 TELEGRAM", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟧 GITHUB", type: "select", proxies: DEFAULT_REJECT },
    { name: "🟧 STEAM", type: "select", proxies: DEFAULT_DIRECT },
    { name: "🟧 EPIC", type: "select", proxies: DEFAULT_DIRECT },

    { name: "🌐 ARISAKA", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_K], filter: ADD_ON_FILTER },
    { name: "🌐 TOUHOU", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_Y], filter: ADD_ON_FILTER },
    { name: "🌐 SWIFT", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_A], filter: ADD_ON_FILTER },
    { name: "🌐 MCD", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_D], filter: ADD_ON_FILTER },
    { name: "🌐 LINUXDO", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_Z], filter: ADD_ON_FILTER },
    { name: "🌐 FANRR", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_C], filter: ADD_ON_FILTER },
    { name: "🌐 XFSS", type: "select", proxies: ["REJECT"], append: true, provider: [PROVIDER_B], filter: ADD_ON_FILTER },

    { name: "🇭🇰 SLOT-HK", type: "fallback", proxies: ["REJECT"], append: true, filter: "^(?!.*(?:SP)).*HK" },
    { name: "🇸🇬 SLOT-SG", type: "fallback", proxies: ["REJECT"], append: true, filter: "^(?!.*(?:SP)).*SG" },
    { name: "🇹🇼 SLOT-TW", type: "fallback", proxies: ["REJECT"], append: true, filter: "^(?!.*(?:SP)).*TW" },
    { name: "🇯🇵 SLOT-JP", type: "fallback", proxies: ["REJECT"], append: true, filter: "^(?!.*(?:SP)).*JP" },
    { name: "🇺🇸 SLOT-US", type: "fallback", proxies: ["REJECT"], append: true, filter: "^(?!.*(?:SP)).*US" },
    { name: "🇰🇷 SLOT-KR", type: "fallback", proxies: ["REJECT"], append: true, filter: "^(?!.*(?:SP)).*KR" },

    { name: "⚫ BLACKLIST-ESC", type: "select", proxies: DEFAULT_DIRECT },
];


/***************************************************************************
 ***   Rules must be compatible with the specific clash kernel version.  ***
 ***************************************************************************/

const FULLLIST = "fulllist"; // *.FULLLIST GENERALLY FOR BROWSER THAT CAN DYNAMIC ADJUST IN-TYPE PROPERTY
const BLACKLIST = "blacklist"; // *.FINAL DIRECT, FILTER PROXY RULES, MOST OF THE TIME USE DIRECT CONNECTION
const WHITELIST = "whitelist"; // *.FINAL PROXY, FILTER DIRECT RULES, MOST OF THE TIME USE PROXY CONNECTION
const PROXIES = "proxies"; // *.COMPLETE RELIANCE ON AGENTS

// *.QUALIFICATION SCREENING
const RULES = [
    "SUB-RULE,(PROCESS-NAME,GoogleDriveFS.exe)," + PROXIES, // *.GOOGLE DRIVE

    "SUB-RULE,(PROCESS-NAME,firefox.exe)," + FULLLIST, // *.BROWSER
    "SUB-RULE,(PROCESS-NAME,msedge.exe)," + FULLLIST,
    "SUB-RULE,(PROCESS-NAME,chrome.exe)," + FULLLIST,

    /**
     * 特殊说明，某些下载程序有类似 PikPak 内置下载器 DowanloadServer.exe 发起数量庞大 IP 请求的行为。这些 IP 请求
     * 如果都属于国内 CDN 且分流规则无法判断其所属，那么在白名单模式下，程序将会使用 PROXY 反复发起请求。
     * 
     * 这种情况下会产生大量的超时请求，大量的超时请求会让 mihomo 内核误判断为 PROXY 对应的组别出现问题，从而开始对 
     * PROXY 组别进行反复的延迟测试。
     * 
     * 这种实际节点可用，但由分流规则和 MATCH 规则导致的问题，会让程序的内存使用量不断攀升，造成 TUN 模式不稳定的情
     * 况。不排除在长时间运行程序的情况下，会出现 MMO 等异常现象。
     * 
     * 建议慎用白名单模式，特别是对于 BT 下载工具来说。确定软件大多数情况下都会发起国外域名或 IP 请求的情况下，再使
     * 用白名单，否则还是使用黑名单模式，因为对于 DIRECT 策略出现的大量超时请求，mihomo 内核一般不作处理。
     */
    "SUB-RULE,(PROCESS-NAME,DownloadServer.exe)," + BLACKLIST, // *.PIKPAK DOWNLOAD ENGINE

    "SUB-RULE,(PROCESS-NAME,idea64.exe)," + BLACKLIST, // *.INTELLIJ IDEA
    "SUB-RULE,(PROCESS-NAME,pycharm64.exe)," + BLACKLIST, // *.PYCHARM
    "SUB-RULE,(PROCESS-NAME,code.exe)," + BLACKLIST, // *.VISUAL STUDIO CODE
    "SUB-RULE,(PROCESS-NAME,steam.exe)," + BLACKLIST, // *.STEAM
    "SUB-RULE,(PROCESS-NAME,steamwebhelper.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,steamservice.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,gitkraken.exe)," + BLACKLIST, // *.GITKRAKEN
    "SUB-RULE,(PROCESS-NAME,node.exe)," + BLACKLIST, // *.NODE.JS
    "SUB-RULE,(PROCESS-NAME,Playnite.DesktopApp.exe)," + BLACKLIST, // *.PLAYNITE
    "SUB-RULE,(PROCESS-NAME,Playnite.FullscreenApp.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,CefSharp.BrowserSubprocess.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,Toolbox.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,bg3.exe)," + BLACKLIST, // *.BALDURS GATE 3
    "SUB-RULE,(PROCESS-NAME,bg3_dx11.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,curl.exe)," + BLACKLIST, // *.GITHUB/REPO
    "SUB-RULE,(PROCESS-NAME,ssh.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,git-remote-https.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,draw.io.exe)," + BLACKLIST, // *.DRAW.IO
    "SUB-RULE,(PROCESS-NAME,IDMan.exe)," + BLACKLIST, // *.IDM
    "SUB-RULE,(PROCESS-NAME,firefoxpwa.exe)," + BLACKLIST, // *.FIREFOX PWA
    "SUB-RULE,(PROCESS-NAME,firefoxpwa-connector.exe)," + BLACKLIST,

    "SUB-RULE,(PROCESS-NAME,Clash Verge.exe)," + WHITELIST, // *.CLASH VERGE
    "SUB-RULE,(PROCESS-NAME,pikpak.exe)," + WHITELIST, // *.PIKPAK
    "SUB-RULE,(PROCESS-NAME,PotPlayerMini64.exe)," + WHITELIST, // *.POTPLAYER

    "MATCH,DIRECT", // *.MATCH/ESCAPE
];

const SUB_RULES = {
    [FULLLIST]: [
        "RULE-SET,addition-reject,REJECT",
        "RULE-SET,addition-direct,DIRECT",
        "RULE-SET,addition-openai,🟥 OPEN-AI",
        "RULE-SET,addition-gemini,🟩 GEMINI",
        "RULE-SET,addition-copilot,🟩 COPILOT",
        "RULE-SET,special-reddit,🟧 REDDIT",
        "RULE-SET,special-telegram,🟧 TELEGRAM",
        "RULE-SET,original-telegramcidr,🟧 TELEGRAM,no-resolve",
        "RULE-SET,special-github,🟧 GITHUB",
        "RULE-SET,special-steam,🟧 STEAM",
        "RULE-SET,special-epic,🟧 EPIC",
        "RULE-SET,addition-proxy,🌠 ALL",
        "RULE-SET,original-applications,DIRECT",
        "RULE-SET,original-apple,DIRECT",
        "RULE-SET,original-icloud,DIRECT",
        "RULE-SET,original-private,DIRECT",
        "RULE-SET,original-direct,DIRECT",
        "RULE-SET,special-pikpak,🟦 PIKPAK",
        "RULE-SET,original-greatfire,🌠 ALL",
        "RULE-SET,original-gfw,🌠 ALL",
        "RULE-SET,original-proxy,🌠 ALL",
        "RULE-SET,original-tld-not-cn,🌠 ALL",
        "RULE-SET,original-reject,REJECT",

        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",

        "IN-TYPE,SOCKS5,DIRECT", // *.WHEN TUN MODE ON, PROGRAM WITH PROXY SETUP HAVE IN-TYPE.(HTTP(S)/SOCKS5)
        "OR,((IN-TYPE,HTTP),(IN-TYPE,HTTPS)),🌠 ALL", // *.BROWSER CAN USE ZERO OMEGA TO DISTINGUISH TYPE, ACCOMPLISH QUICK PROXY SWICHING.

        "MATCH,DIRECT"
    ],
    [BLACKLIST]: [
        "RULE-SET,addition-reject,REJECT",
        "RULE-SET,addition-openai,🟥 OPEN-AI",
        "RULE-SET,addition-gemini,🟩 GEMINI",
        "RULE-SET,addition-copilot,🟩 COPILOT",
        "RULE-SET,special-reddit,🟧 REDDIT",
        "RULE-SET,special-telegram,🟧 TELEGRAM",
        "RULE-SET,original-telegramcidr,🟧 TELEGRAM,no-resolve",
        "RULE-SET,special-github,🟧 GITHUB",
        "RULE-SET,special-steam,🟧 STEAM",
        "RULE-SET,special-epic,🟧 EPIC",
        "RULE-SET,addition-proxy,🌠 ALL",
        "RULE-SET,special-pikpak,🟦 PIKPAK",
        "RULE-SET,original-greatfire,🌠 ALL",
        "RULE-SET,original-gfw,🌠 ALL",
        "RULE-SET,original-proxy,🌠 ALL",
        "RULE-SET,original-tld-not-cn,🌠 ALL",
        "RULE-SET,original-reject,REJECT",
        "MATCH,⚫ BLACKLIST-ESC" // *.PROGRAM WITH PROXY SETUP ONLY USE TUN MODE AND HAS NOT IN-TYPE PROPERTY, ALL NO MATCHING TRAFFIC GO HERE!!!
    ],
    [WHITELIST]: [
        "RULE-SET,addition-reject,REJECT",
        "RULE-SET,addition-direct,DIRECT",
        "RULE-SET,addition-openai,🟥 OPEN-AI",
        "RULE-SET,addition-gemini,🟩 GEMINI",
        "RULE-SET,addition-copilot,🟩 COPILOT",
        "RULE-SET,special-reddit,🟧 REDDIT",
        "RULE-SET,special-telegram,🟧 TELEGRAM",
        "RULE-SET,original-telegramcidr,🟧 TELEGRAM,no-resolve",
        "RULE-SET,special-github,🟧 GITHUB",
        "RULE-SET,special-steam,🟧 STEAM",
        "RULE-SET,special-epic,🟧 EPIC",
        "RULE-SET,original-applications,DIRECT",
        "RULE-SET,original-apple,DIRECT",
        "RULE-SET,original-icloud,DIRECT",
        "RULE-SET,original-private,DIRECT",
        "RULE-SET,original-direct,DIRECT",
        "RULE-SET,special-pikpak,🟦 PIKPAK",
        "RULE-SET,original-reject,REJECT",
        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",
        "MATCH,🌠 ALL" // *.PROGRAM WITH PROXY SETUP ONLY USE TUN MODE AND HAS NOT IN-TYPE PROPERTY, ALL NO MATCHING TRAFFIC GO HERE!!!
    ],
    [PROXIES]: [
        "MATCH,🌠 ALL", // *.COMPLETE RELIANCE ON AGENTS
    ]
};

module.exports = {
    PROXY_PROVIDER_PATH,
    PROXY_PROVIDER_TYPE,
    PROXY_PROVIDERS_MAP,
    ALL_PROFILES_OUTPUT,
    PROVIDER_GROUPS,
    GROUPS,
    RULES,
    SUB_RULES,
    FULLLIST,
};