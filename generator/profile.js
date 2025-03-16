/**********************************************************************************
 *** Add this content to Mihomo Party OVERRIDE SETTING. And record the config's ***
 *** name like this: 192b4acc89e.js. Finally, setup this path into params.js.   ***
 **********************************************************************************/

const MIHOMO_PARTY = "d:/program files/mihomo party/"; // *.MIHOMO PARTY 安装路径
const OVERRIDE_MAPPING = MIHOMO_PARTY + "data/override.yaml";
const PROVIDER_MAPPING = MIHOMO_PARTY + "data/profile.yaml";

const PROXY_PROVIDER_PATH = MIHOMO_PARTY + "data/profiles/";
const GROUP_PROVIDER_PATH = MIHOMO_PARTY + "data/override/"
const PROXY_PROVIDER_TYPE = "yaml";
const RULES_PROVIDER_TYPE = "yaml";

const READ_PROVIDER = (fs, yaml) => {
    const file = fs.readFileSync(PROVIDER_MAPPING, "utf8");
    const result = yaml.parse(file);

    const COMPREHENSIVE_CONFIG_PATH = MIHOMO_PARTY + "data/profiles/";
    const COMPREHENSIVE_CONFIG_NAME = result.current; // *.当前启用配置需定位到 COMPREHENSIVE_CONFIG 总配置上
    const COMPREHENSIVE_CONFIG_TYPE = "yaml";

    const PROXY_PROVIDERS_MAP = {};
    result.items.forEach(item => {
        if (item.id !== COMPREHENSIVE_CONFIG_NAME && item.override.length !== 0) {
            // *.只记录存在 override 的数据，不存在 override 值的视为不需要纳入 COMPREHENSIVE_CONFIG 配置
            // *.还需要确认 override 值是否存在导出的分组规则，这个判断逻辑交由 generate.js 来完成，这里仅记录数据
            // *.疑似 override 值对应的数组中，只会包含一个元素，那为什么它是数组类型呢？TODO: UNKNOWN
            const detail = {};
            detail.id = PROXY_PROVIDER_PATH + item.id + "." + PROXY_PROVIDER_TYPE; // *.id 为订阅配置对应的 YAML 文件路径
            detail.override = GROUP_PROVIDER_PATH + item.override[0]; // *.override 为订阅配置绑定的分组规则的 JS 文件路径，可以直接 require 进来

            PROXY_PROVIDERS_MAP[item.name] = detail; // *.key 为配置名称，value 包含 id 和 override 两个字段
        };
    });
    return { COMPREHENSIVE_CONFIG_PATH, COMPREHENSIVE_CONFIG_NAME, COMPREHENSIVE_CONFIG_TYPE, PROXY_PROVIDERS_MAP };
};

const AUTO_GROUPS = ["[AUTO] => HK", "[AUTO] => SG", "[AUTO] => TW", "[AUTO] => JP", "[AUTO] => US", "[AUTO] => KR"];
const DAILER_GROUPS = ["[DAILER] => HK", "[DAILER] => HK/CT", "[DAILER] => HK/CM"];

const AUTO_DIRECT = ["DIRECT"].concat(AUTO_GROUPS);
const AUTO_REJECT = ["REJECT"].concat(AUTO_GROUPS);
const DAILER_REJECT = ["REJECT", "ALL"].concat(DAILER_GROUPS);

const GROUPS = [
    { name: "ALL", type: "select", proxies: AUTO_GROUPS, icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Available.png" },
    { name: "DOWNLOAD", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[M|L\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Speedtest.png" },
    { name: "SPECIFIC", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Target.png" },

    { name: "ORACLE", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Oracle_Cloud.png" },
    { name: "CLAUDE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Claude.png" },
    { name: "OPENAI", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/ChatGPT.png" },
    { name: "CLOUDFLARE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Cloudflare.png" },
    { name: "GOOGLEDRIVE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Google_Drive.png" },
    { name: "GITHUB", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/GitHub.png" },
    { name: "TELEGRAM", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:SG).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Telegram.png" },
    { name: "YOUTUBE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[M|L\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/YouTube.png" },
    { name: "JETBRAINS", type: "select", proxies: DAILER_REJECT, icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/JetBrains.png" },
    { name: "GEMINI", type: "select", proxies: AUTO_REJECT, icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Google.png" },
    { name: "REDDIT", type: "select", proxies: AUTO_REJECT, icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Reddit.png" },
    { name: "STEAM", type: "select", proxies: AUTO_DIRECT, icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Steam.png" },

    { name: "[AUTO] => HK", type: "fallback", append: true, autofilter: "^.*HK", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_Hong_Kong.png" },
    { name: "[AUTO] => SG", type: "fallback", append: true, autofilter: "^.*SG", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_Singapore.png" },
    { name: "[AUTO] => TW", type: "fallback", append: true, autofilter: "^.*TW", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_Taiwan.png" },
    { name: "[AUTO] => JP", type: "fallback", append: true, autofilter: "^.*JP", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_Japan.png" },
    { name: "[AUTO] => US", type: "fallback", append: true, autofilter: "^.*US", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_United_States.png" },
    { name: "[AUTO] => KR", type: "fallback", append: true, autofilter: "^.*KR", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_South_Korea.png" },

    { name: "[DAILER] => HK", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK|OR).*HK$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_Hong_Kong.png" },
    { name: "[DAILER] => HK/CT", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK.*HK|OR.*HK.*CT)$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_Hong_Kong.png" },
    { name: "[DAILER] => HK/CM", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK.*HK|OR.*HK.*CM)$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/special/S_Hong_Kong.png" },
];

const FULLLIST = "fulllist"; // *.针对浏览器的分流规则，较完整，可根据 HTTP 和 SOCKS5 流量进一步分配策略组
const DOWNLOAD = "download"; // *.针对下载器或需求代理流量且流量较大的程序，遵循黑名单模式
const BLACKLIST = "blacklist"; // *.针对普通程序，分流规则遵循黑名单模式，即 MATCH 前匹配 PROXY 策略，MATCH 匹配 DIRECT 策略
const WHITELIST = "whitelist"; // *.针对普通程序，分流规则遵循白名单模式，即 MATCH 前匹配 DIRECT 策略，MATCH 匹配 PROXY 策略
const PROXY = "proxy"; // *.针对完全依赖代理的程序，将直接 MATCH 至 PROXY 策略

// *.QUALIFICATION SCREENING
const RULES = [
    "RULE-SET,addition-pre-block,REJECT", // *.需要提前拦截的域名，例如参与 PCDN 的域名（规则为 classical 类型）
    "RULE-SET,addition-pre-direct,DIRECT", // *.需要提前放行的域名，例如游戏或网盘程序（规则为 classical 类型）
    "RULE-SET,addition-pre-download,DOWNLOAD", // *.没有使用 DOWNLOAD 子规则的、但存在大量下载流量的域名（规则为 classical 类型）
    "RULE-SET,addition-pre-agents,ALL", // *.不纳入程序管控，但需要代理服务的域名（规则为 classical 类型）

    /**
     * 浏览器内置直连规则时，这些域名在不使用浏览器代理或代理插件的情况下，会走 TUN 模式
     * 的全局代理，提前过滤掉可以提高性能。
     */
    // "AND,((PROCESS-NAME,firefox.exe),(IN-TYPE,TUN)),DIRECT",

    /**
     * 特殊的程序在确认完全依赖代理后，可以使用 PROXY 子规则，或直接提供代理分组。
     * 
     * 由于 GoogleDrive 对节点质量有要求，因此这里直接提供质量较高的代理分组。于其他程序
     * 而言，如果对节点质量没有要求，那么可以直接使用 PROXY 子规则，它映射 ALL 日常代理。
     */
    "PROCESS-NAME,GoogleDriveFS.exe,GOOGLEDRIVE", // *.GOOGLE DRIVE

    /**
     * TUN 模式下，需要规避掉 BT 下载工具的流量，因为这些工具会发起大量的连接请求，对于 Clash 来说这无异于 DDOS 攻击。
     * 
     * 然而，规避 BT 流量的无法依靠配置 Clash 完成，所幸某些 BT 下载工具支持配置下载网卡。
     * 例如 BitComet 支持使用指定的网卡来完成下载请求，这种时候就可以选择让下载请求走物理网卡，而不使用 TUN 模式的虚拟网卡。
     * 
     * 严格来说 PikPak 流量也不应使用 TUN 模式，因为它的下载请求也会很多，可以选择开启另一个 Clash 实例并配置物理网卡名称，让 PikPak 走该实例。
     */
    // "PROCESS-NAME,BitComet.exe,DIRECT", // *.是否启用代理似乎不影响 BITCOMET 的下载策略，因此直接 DIRECT 处理
    // "SUB-RULE,(PROCESS-NAME,DownloadServer.exe)," + DOWNLOAD, // *.PIKPAK DOWNLOAD ENGINE


    /**
     * 于浏览器而言，需要访问的域名很多，较难区分使用黑名单模式好还是白名单模式好。
     * 
     * 这种情况下，使用黑、白名单整合得到的 FULLLIST 会更好。浏览器可以进一步使用
     * 插件或自带的代理模块，将 TCP 流量区分为 HTTP 流量或 SOCKS 流量。届时浏览器将
     * 不再使用 TUN 模式提供的全局代理服务，因为内置的代理服务优先级较高。
     * 
     * 那么 FULLLIST 就可以根据流量类型进一步控制访问行为，例如让 HTTP 类型的流量
     * 最终匹配 PROXY 策略，让 SOCKS 类型的流量最终匹配 DIRECT 策略。
     * 
     * 疑似 TUN 模式和浏览器的兼容性不是很好，有些网页加载十分缓慢，可能和 TUN 模式
     * 本身的性能相关，毕竟需要处理的连接很多，还是建议使用 HTTP/SOCKS5 类型。
     */
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
    "SUB-RULE,(PROCESS-NAME,IDMan.exe)," + DOWNLOAD, // *.IDM
    "SUB-RULE,(PROCESS-NAME,PotPlayerMini64.exe)," + DOWNLOAD, // *.POTPLAYER
    "SUB-RULE,(PROCESS-NAME,whisper-faster.exe)," + DOWNLOAD, // *.FASTER WHISPER
    "SUB-RULE,(PROCESS-NAME,PowerToys.Update.exe)," + DOWNLOAD, // *.POWERTOY UPDATER
    "SUB-RULE,(PROCESS-NAME,draw.io.exe)," + DOWNLOAD, // *.DRAW.IO

    "SUB-RULE,(PROCESS-NAME-REGEX,(?i).*docker.*)," + BLACKLIST, // *.DOCKER DESKTOP
    "SUB-RULE,(PROCESS-NAME,java.exe)," + BLACKLIST, // *.JAVA RUNTIME
    "SUB-RULE,(PROCESS-NAME,idea64.exe)," + BLACKLIST, // *.INTELLIJ IDEA
    "SUB-RULE,(PROCESS-NAME,pycharm64.exe)," + BLACKLIST, // *.PYCHARM
    "SUB-RULE,(PROCESS-NAME,datagrip64.exe)," + BLACKLIST, // *.DATAGRIP
    "SUB-RULE,(PROCESS-NAME,code.exe)," + BLACKLIST, // *.VISUAL STUDIO CODE

    "SUB-RULE,(PROCESS-NAME,Mihomo Party.exe)," + BLACKLIST, // *.MIHOMO PARTY
    "SUB-RULE,(PROCESS-NAME,WeaselServer.exe)," + BLACKLIST, // *.WEASEL SERVER
    "SUB-RULE,(PROCESS-NAME,thunderbird.exe)," + BLACKLIST, // *.THUNDERBIRD
    "SUB-RULE,(PROCESS-NAME,PowerToys.exe)," + BLACKLIST, // *.POWERTOY
    "SUB-RULE,(PROCESS-NAME,steam.exe)," + BLACKLIST, // *.STEAM
    "SUB-RULE,(PROCESS-NAME,steamwebhelper.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,steamservice.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,gitkraken.exe)," + BLACKLIST, // *.GITKRAKEN
    "SUB-RULE,(PROCESS-NAME,Postman.exe)," + BLACKLIST, // *.POSTMAN
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

    "SUB-RULE,(PROCESS-NAME,Telegram.exe)," + WHITELIST, // *.TELEGRAM
    "SUB-RULE,(PROCESS-NAME,pikpak.exe)," + WHITELIST, // *.PIKPAK

    "MATCH,DIRECT", // *.MATCH/ESCAPE
];

/**
 * 规则排序原则：访问频次高或优先级高的规则置前，反之置后，尽量让规则匹配。
 */
const SUB_RULES = {
    [FULLLIST]: [
        "RULE-SET,addition-reject,REJECT",
        "RULE-SET,addition-direct,DIRECT",
        "RULE-SET,addition-proxy,ALL",

        "RULE-SET,addition-specific,SPECIFIC",
        "RULE-SET,special-claude,CLAUDE",
        "RULE-SET,addition-oracle,ORACLE",
        "RULE-SET,addition-openai,OPENAI",
        "RULE-SET,addition-cloudflare,CLOUDFLARE",
        "RULE-SET,special-youtube,YOUTUBE",
        "RULE-SET,special-onedrive,DIRECT",
        "RULE-SET,addition-gemini,GEMINI",
        "RULE-SET,addition-copilot,ALL",
        "RULE-SET,special-reddit,REDDIT",
        "RULE-SET,special-telegram,TELEGRAM",
        "RULE-SET,original-telegramcidr,TELEGRAM,no-resolve",
        "RULE-SET,special-github,GITHUB",
        "RULE-SET,special-jetbrains,JETBRAINS",
        "RULE-SET,special-steam,STEAM",
        "RULE-SET,special-epic,ALL",

        "RULE-SET,original-applications,DIRECT",
        "RULE-SET,original-apple,DIRECT",
        "RULE-SET,original-icloud,DIRECT",
        "RULE-SET,original-private,DIRECT",
        "RULE-SET,original-direct,DIRECT",
        "RULE-SET,special-pikpak,ALL", // *.THIS FOR PIKPAK IN BROWSER, NO DOWNLOAD TRAFFIC
        "RULE-SET,original-greatfire,ALL",
        "RULE-SET,original-gfw,ALL",
        "RULE-SET,original-proxy,ALL",
        "RULE-SET,original-tld-not-cn,ALL",
        "RULE-SET,original-reject,REJECT",

        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",

        "IN-TYPE,SOCKS5,DIRECT", // *.WHEN TUN MODE ON, PROGRAM WITH PROXY SETUP HAVE IN-TYPE.(HTTP(S)/SOCKS5)
        "OR,((IN-TYPE,HTTP),(IN-TYPE,HTTPS)),ALL", // *.BROWSER CAN USE ZERO OMEGA TO DISTINGUISH TYPE, ACCOMPLISH QUICK PROXY SWICHING.

        "MATCH,DIRECT" // *.基本用不上但需要提供
    ],
    [DOWNLOAD]: [
        "RULE-SET,addition-proxy,DOWNLOAD",
        "RULE-SET,special-pikpak,DOWNLOAD",
        "RULE-SET,original-greatfire,DOWNLOAD",
        "RULE-SET,original-gfw,DOWNLOAD",
        "RULE-SET,original-proxy,DOWNLOAD",
        "RULE-SET,original-tld-not-cn,DOWNLOAD",

        "MATCH,DIRECT" // *.ELSE NO MATCHING TRAFFIC THAT NEED PROXY CONNECTION  CAN ADD TO PRE-DOWNLOAD RULES
    ],
    [BLACKLIST]: [
        "RULE-SET,addition-reject,REJECT",
        "RULE-SET,addition-proxy,ALL",

        "RULE-SET,addition-specific,SPECIFIC",
        "RULE-SET,special-claude,CLAUDE",
        "RULE-SET,addition-oracle,ORACLE",
        "RULE-SET,addition-openai,OPENAI",
        "RULE-SET,addition-cloudflare,CLOUDFLARE",
        "RULE-SET,special-youtube,YOUTUBE",
        "RULE-SET,special-onedrive,DIRECT",
        "RULE-SET,addition-gemini,GEMINI",
        "RULE-SET,addition-copilot,ALL",
        "RULE-SET,special-reddit,REDDIT",
        "RULE-SET,special-telegram,TELEGRAM",
        "RULE-SET,original-telegramcidr,TELEGRAM,no-resolve",
        "RULE-SET,special-github,GITHUB",
        "RULE-SET,special-jetbrains,JETBRAINS",
        "RULE-SET,special-steam,STEAM",
        "RULE-SET,special-epic,ALL",

        "RULE-SET,special-pikpak,DOWNLOAD",
        "RULE-SET,original-greatfire,ALL",
        "RULE-SET,original-gfw,ALL",
        "RULE-SET,original-proxy,ALL",
        "RULE-SET,original-tld-not-cn,ALL",
        "RULE-SET,original-reject,REJECT",

        "MATCH,DIRECT"
    ],
    [WHITELIST]: [
        "RULE-SET,addition-reject,REJECT",
        "RULE-SET,addition-direct,DIRECT",

        "RULE-SET,addition-specific,SPECIFIC",
        "RULE-SET,special-claude,CLAUDE",
        "RULE-SET,addition-oracle,ORACLE",
        "RULE-SET,addition-openai,OPENAI",
        "RULE-SET,addition-cloudflare,CLOUDFLARE",
        "RULE-SET,special-youtube,YOUTUBE",
        "RULE-SET,special-onedrive,DIRECT",
        "RULE-SET,addition-gemini,GEMINI",
        "RULE-SET,addition-copilot,ALL",
        "RULE-SET,special-reddit,REDDIT",
        "RULE-SET,special-telegram,TELEGRAM",
        "RULE-SET,original-telegramcidr,TELEGRAM,no-resolve",
        "RULE-SET,special-github,GITHUB",
        "RULE-SET,special-jetbrains,JETBRAINS",
        "RULE-SET,special-steam,STEAM",
        "RULE-SET,special-epic,ALL",

        "RULE-SET,original-applications,DIRECT",
        "RULE-SET,original-apple,DIRECT",
        "RULE-SET,original-icloud,DIRECT",
        "RULE-SET,original-private,DIRECT",
        "RULE-SET,original-direct,DIRECT",
        "RULE-SET,original-reject,REJECT",
        "RULE-SET,special-pikpak,DOWNLOAD",

        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",

        "MATCH,ALL" // *.PROGRAM WITH PROXY SETUP ONLY USE TUN MODE AND HAS NOT IN-TYPE PROPERTY, ALL NO MATCHING TRAFFIC GO HERE!!!
    ],
    [PROXY]: [
        "MATCH,ALL", // *.COMPLETE RELIANCE ON AGENTS
    ]
};

module.exports = {
    OVERRIDE_MAPPING,
    RULES_PROVIDER_TYPE,
    GROUPS,
    RULES,
    SUB_RULES,
    FULLLIST,
    READ_PROVIDER,
};