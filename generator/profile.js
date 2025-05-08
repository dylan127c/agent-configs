/**********************************************************************************
 *** Add this content to Mihomo Party OVERRIDE SETTING. And record the config's ***
 *** name like this: 192b4acc89e.js. Finally, setup this path into params.js.   ***
 **********************************************************************************/

const MIHOMO_PARTY = "d:/program files/mihomo party/"; // *.MIHOMO PARTY 安装路径（不区分大小写）

const OVERRIDE_MAPPING = MIHOMO_PARTY + "data/override.yaml";   // *.GUI => 覆写（OVERRIDE）结构文件
const PROVIDER_MAPPING = MIHOMO_PARTY + "data/profile.yaml";    // *.GUI => 订阅（PROVIDER）结构文件

const GROUP_PROVIDER_PATH = MIHOMO_PARTY + "data/override/";    // *.GUI => 覆写（OVERRIDE）结构目录
const PROXY_PROVIDER_PATH = MIHOMO_PARTY + "data/profiles/";    // *.GUI => 订阅（PROVIDER）结构目录
const RULES_PROVIDER_TYPE = "yaml";
const PROXY_PROVIDER_TYPE = "yaml";

const READ_PROVIDER = (fs, yaml) => {
    const file = fs.readFileSync(PROVIDER_MAPPING, "utf8");
    const result = yaml.parse(file);

    const COMPREHENSIVE_CONFIG_PATH = MIHOMO_PARTY + "data/profiles/";
    const COMPREHENSIVE_CONFIG_NAME = result.current; // *.确保“启用配置”为自定义的 COMPREHENSIVE_CONFIG 总配置
    const COMPREHENSIVE_CONFIG_TYPE = "yaml";

    const PROXY_PROVIDERS_MAP = {};
    result.items.forEach(item => {
        if (item.id !== COMPREHENSIVE_CONFIG_NAME && item.override.length !== 0) {
            // *.只记录存在 override 的数据，不存在 override 值的视为不需要纳入 COMPREHENSIVE_CONFIG 配置
            // *.还需要确认 override 值是否存在已导出的分组依据，这个逻辑判断交由 generate.js 完成
            const detail = {};

            // *.detail.id 为其他“订阅配置”所对应的 YAML 文件路径
            detail.id = PROXY_PROVIDER_PATH + item.id + "." + PROXY_PROVIDER_TYPE;

            // *.detail.override 为其他“订阅配置”所绑定的分组依据（JS 文件路径），该文件在 generate.js 中可用 require 并读取
            detail.override = GROUP_PROVIDER_PATH + item.override[0];

            // *.item.name 为其他“订阅配置”所对应的组名，这里将其作为 key 值，将 detail 作为对应的 value 值
            // *.{key, value} => {name: {id, override}}
            PROXY_PROVIDERS_MAP[item.name] = detail;
        };
    });
    return { COMPREHENSIVE_CONFIG_PATH, COMPREHENSIVE_CONFIG_NAME, COMPREHENSIVE_CONFIG_TYPE, PROXY_PROVIDERS_MAP };
};

const ATUO_PREFIX = "[AUTO]";
const DAILER_PREFIX = "[DIALER]";

const FILTER_GROUPS = [
    { name: ATUO_PREFIX + " => HK", type: "fallback", append: true, autofilter: "^.*HK", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => SG", type: "fallback", append: true, autofilter: "^.*SG", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => TW", type: "fallback", append: true, autofilter: "^.*TW", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => JP", type: "fallback", append: true, autofilter: "^.*JP", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => US", type: "fallback", append: true, autofilter: "^.*US", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => KR", type: "fallback", append: true, autofilter: "^.*KR", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },

    // *.内核官方提示 relay 策略即将被弃用，并建议在 proxies 上指定 dialer-proxy 以替代 relay 策略。
    // *.然而奇怪的是 relay 策略下可用的链式代理配置转换为 dialer-proxy 后不再可用，疑似存在某些问题。
    // *.对于生成式配置来说完成 dialer-proxy 的部署需要添加巨量的配置，而配置 relay 则仅需添加几个分组。
    // { name: DAILER_PREFIX + " => OR-JP-CT/AK-HK", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK.*HK|OR.*JP.*CT).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bypass.png" },
    // { name: DAILER_PREFIX + " => OR-HK-CT/AK-HK", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK.*HK|OR.*HK.*CT).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bypass.png" },
    // { name: DAILER_PREFIX + " => MC-SG/AK-HK", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK.*HK|MC.*SG).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bypass.png" },
    // { name: DAILER_PREFIX + " => OR-JP-CT/AK-SG", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK.*SG|OR.*JP.*CT).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bypass.png" },
    // { name: DAILER_PREFIX + " => OR-HK-CT/AK-SG", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK.*SG|OR.*HK.*CT).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bypass.png" },
    // { name: DAILER_PREFIX + " => MC-HK/AK-SG", type: "relay", reverse: true, append: true, autofilter: "^.*(?:AK.*SG|MC.*HK).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bypass.png" },
];

const AUTO_GROUPS = FILTER_GROUPS.filter(group => group.name.startsWith(ATUO_PREFIX)).map(group => group.name);
const DAILER_GROUPS = FILTER_GROUPS.filter(group => group.name.startsWith(DAILER_PREFIX)).map(group => group.name);

const AUTO_DIRECT = ["DIRECT"].concat(AUTO_GROUPS);
const AUTO_REJECT = ["REJECT"].concat(AUTO_GROUPS);
const DEFAULT_DAILER = DAILER_GROUPS.concat(["ALL"]);

const SPECIFIC_GROUPS = [
    { name: "ALL", type: "select", proxies: AUTO_GROUPS.concat(["SPECIFIC"]), icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Available_1.png" },
    { name: "SPECIFIC", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ULB.png" },

    /**
     * 关于 DOWNLOAD 的说明：灵活处理流量，尽量使用 DIRECT 策略。
     * 只有在 DIRECT 策略下无法完成下载操作时，才选择使用代理策略。
     */
    { name: "DOWNLOAD", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/SSID.png" },
    { name: "MEDIA", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Media.png" },

    /**
     * 关于 GITHUB 的说明：这里专门为 GitHub 提供了特殊的健康检查 URL，
     * 主动测速时，会使用该 URL 来测试节点的连通性，而非使用谷歌的链接。
     * 
     * 注意即便是 SELECT 策略组也可以提供测速 URL，对于一些拥有测速 API
     * 的服务商来说，使用自家的测速 API 来测试节点的连通性一般是最好的。
     * 
     * 考虑到 GitHub Copilot 的特殊性，这里不提供 DIRECT 策略组。
     */
    { name: "GITHUB", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/GitHub_1.png", url: "https://api.github.com/zen" },

    /**
     * 关于 JetBrains 的说明：个人使用的情况下可以选择代理或者 DIRECT 策略。
     * 涉及商用时，为了避免检查机制，可以选择使用 REJECT 策略来处理流量。
     * 
     * 如果 JetBrains 需要进行插件下载等耗费流量的操作，则建议使用 DIRECT 策略；
     * 当 DIRECT 策略下无法完成下载操作时，则选择性使用代理策略。
     * 
     * 由于追求的完全避免检测，因此所有 JetBrains 的流量都不会在其他规则中出现，
     * 包括下载等耗费流量的连接请求。REJECT 策略下的流量将直接丢弃。
     * 
     * 代理用于日常时，推荐 H|M 类型节点；代理用于下载时，推荐 L 类型节点。
     */
    { name: "JETBRAINS", type: "select", proxies: ["DIRECT", "REJECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/JetBrains.png" },
    { name: "DOCKER", type: "select", proxies: ["DIRECT", "REJECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Docker.png" },
    { name: "CLAUDE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Claude.png" },
    { name: "OPENAI", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/ChatGPT.png" },
    { name: "CLOUDFLARE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Cloudflare.png" },
    { name: "GOOGLEDRIVE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Drive.png" },
    { name: "ONEDRIVE", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/OneDrive.png" },
    { name: "YOUTUBE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png" },
    { name: "TELEGRAM", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:SG).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png" },
    { name: "GEMINI", type: "select", proxies: AUTO_REJECT, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png" },
    { name: "REDDIT", type: "select", proxies: AUTO_REJECT, icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/reddit(1).png" },
    { name: "STEAM", type: "select", proxies: AUTO_DIRECT, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Steam.png" },
    { name: "EPIC", type: "select", proxies: AUTO_DIRECT, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Epic_Games.png" },
    { name: "ORACLE", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Orcl.png" },
];

const GROUPS = SPECIFIC_GROUPS.concat(FILTER_GROUPS);

const FULLLIST = "fulllist";    // *.针对浏览器的分流规则，较完整，可根据 HTTP 和 SOCKS5 流量进一步分配策略组
const BLACKLIST = "blacklist";  // *.针对普通程序，分流规则遵循黑名单模式，即 MATCH 前匹配 PROXY 策略，MATCH 匹配 DIRECT 策略
const WHITELIST = "whitelist";  // *.针对普通程序，分流规则遵循白名单模式，即 MATCH 前匹配 DIRECT 策略，MATCH 匹配 PROXY 策略
const DOWNLOAD = "download";    // *.针对下载器或需求代理流量但流量较大的程序，遵循黑名单模式
const PROXY = "proxy";          // *.针对完全依赖代理的程序，将直接 MATCH 至 PROXY 策略

// *.QUALIFICATION SCREENING
const RULES = [
    /**
     * 规则集 addition-pre-xxx 均为 classical 类型，可以配置多种规则，
     * 例如 DOMAIN-REGEX 、 DOMAIN-KEYWORD 或 IP-CIDR 等等。
     * 
     * 关于 addition-pre-download 的说明，例如 JetBrains 会产生大量的下载流量：
     * 
     * - gradle.org
     * - download-cdn.jetbrains.com
     * - download.jetbrains.com
     * - downloads.marketplace.jetbrains.com
     * 
     * 但本身它需求使用代理服务，因此存在 JETBRAINS 策略组。而该组别显然不是用来
     * 处理下载流量的，对于 JetBrains 而言，上述域名应当使用 DOWNLOAD 策略组。
     * 
     * 因此，上述域名可以加入到 addition-pre-download 规则集中，该规则集将直接
     * 使用 DOWNLOAD 策略组来处理规则集中的域名流量。
     */
    "RULE-SET,addition-pre-block,REJECT",       // *.提前拦截的流量，例如参与 PCDN 的域名
    "RULE-SET,addition-pre-direct,DIRECT",      // *.提前放行的流量，例如游戏、网盘程序产生的流量
    "RULE-SET,addition-pre-download,DOWNLOAD",  // *.未知程序产生的、需要下载服务的流量；或已被管控的程序中存在大量下载请求的流量
    "RULE-SET,addition-pre-agents,ALL",         // *.未知程序产生的、需要代理服务的流量；或已知程序产生的，但仅有少量域名需要代理服务的流量

    /**
     * 特殊的程序在确认完全依赖代理后，可以使用 proxy 子规则，或提供专门的代理分组。
     * 
     * 由于 GoogleDrive 对节点质量有要求，推荐提供质量更高的代理分组。于其他程序而言，
     * 如果对节点质量没有要求，那么可以直接使用 proxy 子规则，它映射 ALL 日常代理组。
     */
    "PROCESS-NAME,GoogleDriveFS.exe,GOOGLEDRIVE",       // *.GOOGLE DRIVE

    /**
     * 于浏览器而言，需要访问的域名很多，较难区分使用黑名单模式好还是白名单模式好。
     * 
     * 因此这里会将黑、白名单模式整合为统一的 fulllist 子规则。浏览器将借用代理插件或
     * 自带的代理模块，将 TCP 流量区分为 HTTP 流量或 SOCKS 流量。
     * 
     * fullist 内则首先会按 RULE-SET 和 GEOIP 规则匹配流量，再使用 IN-TYPE 规则匹配
     * 流量。IN-TYPE 规则会让 SOCKS 流量匹配至 DIRECT 策略、HTTP 流量匹配至 PROXY 策略。
     * 
     * 这样浏览器可以通过灵活切换 TCP 流量的代理模式，来间接完成黑、白名单模式的切换。
     */
    "SUB-RULE,(PROCESS-NAME,firefox.exe)," + FULLLIST,  // *.BROWSER
    "SUB-RULE,(PROCESS-NAME,msedge.exe)," + FULLLIST,
    "SUB-RULE,(PROCESS-NAME,chrome.exe)," + FULLLIST,

    /**
     * TUN 模式下，应当规避掉不需要代理服务的 BT 下载工具的流量，因为这些工具会发起大量的连接请求，
     * 如果不需求代理服务但要求 CLASH 核心处理大量的 BT 请求，则对于核心来说这无异于 DDOS 攻击。
     * 
     * 然而，规避这类型的 BT 流量并无法依靠配置 CLASH 完成，因为即便使用 DIRECT 策略，流量仍然会
     * 走 TUN 模式的虚拟网卡。也就是说，流量仍然会被 CLASH 核心处理。
     * 
     * 所幸某些 BT 下载工具支持配置下载网卡。例如 BitComet 支持使用指定的网卡来完成下载请求，这种
     * 时候就可以选择让下载请求走物理网卡，而不使用 TUN 模式的虚拟网卡。
     * 
     * 对于需求代理服务的 BT 下载工具例如 PikPak ，只能选择提供代理服务（使用 download 子规则）。
     * 
     * 特殊说明，download 子规则为黑名单模式，即 MATCH 规则匹配 DIRECT 策略， MATCH 前匹配的是
     * DOWNLOAD 策略组，该策略组允许自行选用使用 DIRECT 策略还是 PROXY 策略。
     * 
     * 注意，不建议让 BT 下载工具使用白名单模式，理由和此前的类似，因为 BT 下载工具会发起大量的
     * 连接请求。
     * 
     * CLASH 核心在能够正确处理大量请求的情况下，如果这些请求同为 IP 请求，并同时隶属于国内 CDN 
     * 且 DOWNLOAD 策略组选用 PROXY 策略，那么 CLASH 核心将可能出现反复发起请求超时的情况。
     * 
     * 大量的超时请求会让 CLASH 核心误判断 DOWNLOAD 策略组出现问题，从而开始对策略组进行反复的
     * 延迟测试。这种误判会让程序的内存使用量节节攀升，造成 TUN 模式不稳定的情况。
     * 
     * 不排除在程序长时间运行的情况下，会出现 MMO 等异常现象，因此不建议使用白名单模式。黑名单
     * 模式下无法匹配的流量会使用  DIRECT 策略，该策略下出现的超时请求， CLASH 核心一般不作处理。
     */

    "SUB-RULE,(PROCESS-NAME,DownloadServer.exe)," + DOWNLOAD,       // *.PIKPAK DOWNLOAD ENGINE
    "SUB-RULE,(PROCESS-NAME,IDMan.exe)," + DOWNLOAD,                // *.IDM
    "SUB-RULE,(PROCESS-NAME,PotPlayerMini64.exe)," + DOWNLOAD,      // *.POTPLAYER
    "SUB-RULE,(PROCESS-NAME,PowerToys.Update.exe)," + DOWNLOAD,     // *.POWERTOY UPDATER
    "SUB-RULE,(PROCESS-NAME,draw.io.exe)," + DOWNLOAD,              // *.DRAW.IO

    /**
     * 黑名单模式下，未匹配流量将使用 DIRECT 策略，匹配流量将使用 PROXY 策略，或自定义策略组。
     * 
     * blaklist 子规则是 fulllist 子规则的优化，它将 MATCH 前大量明确匹配 DIRECT 策略的规则
     * 移除，并不再区分流量类型（移除 IN-TYPE 规则），最后未匹配流量将直接使用 DIRECT 策略。
     */
    "SUB-RULE,(PROCESS-NAME,curl.exe)," + BLACKLIST,                // *.GITHUB => CLONE/PULL/PUSH
    "SUB-RULE,(PROCESS-NAME,ssh.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,git-remote-https.exe)," + BLACKLIST,

    /**
     * DOCKER DESKTOP 默认安装在 C:\Program Files\Docker 目录下，推荐规则匹配同时对路径
     * 和程序名进行匹配，这样会比较完善。
     */
    "SUB-RULE,(PROCESS-PATH-REGEX,(?i).*docker.*)," + BLACKLIST,    // *.DOCKER DESKTOP
    "SUB-RULE,(PROCESS-NAME-REGEX,(?i).*docker.*)," + BLACKLIST,

    /**
     * 为了避免其他 JETBRAINS 的漏网之鱼，除了匹配 JETBRAINS 的 PROCESS-PATH-REGEX 外，后续
     * 还会进一步根据 JETBRAINS 程序的具体 PROCESS-NAME 进行匹配。
     */
    "SUB-RULE,(PROCESS-PATH-REGEX,(?i).*jetbrains.*)," + BLACKLIST, // *.JETBRAINS
    "SUB-RULE,(PROCESS-NAME,idea64.exe)," + BLACKLIST,              // *.INTELLIJ IDEA
    "SUB-RULE,(PROCESS-NAME,pycharm64.exe)," + BLACKLIST,           // *.PYCHARM
    "SUB-RULE,(PROCESS-NAME,datagrip64.exe)," + BLACKLIST,          // *.DATAGRIP
    "SUB-RULE,(PROCESS-NAME,goland64.exe)," + BLACKLIST,            // *.GOLAND
    "SUB-RULE,(PROCESS-NAME,webstorm64.exe)," + BLACKLIST,          // *.WEBSTORM

    "SUB-RULE,(PROCESS-NAME,java.exe)," + BLACKLIST,                // *.JAVA RUNTIME
    "SUB-RULE,(PROCESS-NAME,code.exe)," + BLACKLIST,                // *.VISUAL STUDIO CODE/VSCODE

    "SUB-RULE,(PROCESS-NAME,Mihomo Party.exe)," + BLACKLIST,        // *.MIHOMO PARTY
    "SUB-RULE,(PROCESS-NAME,clash-verge.exe)," + BLACKLIST,         // *.CLASH VERGE
    "SUB-RULE,(PROCESS-NAME,thunderbird.exe)," + BLACKLIST,         // *.THUNDERBIRD
    "SUB-RULE,(PROCESS-NAME,PowerToys.exe)," + BLACKLIST,           // *.POWERTOY

    "SUB-RULE,(PROCESS-NAME,steam.exe)," + BLACKLIST,               // *.STEAM
    "SUB-RULE,(PROCESS-NAME,steamwebhelper.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,steamservice.exe)," + BLACKLIST,

    "SUB-RULE,(PROCESS-NAME,gitkraken.exe)," + BLACKLIST,           // *.GITKRAKEN
    "SUB-RULE,(PROCESS-NAME,Postman.exe)," + BLACKLIST,             // *.POSTMAN
    "SUB-RULE,(PROCESS-NAME,node.exe)," + BLACKLIST,                // *.NODE.JS

    "SUB-RULE,(PROCESS-NAME,Playnite.DesktopApp.exe)," + BLACKLIST, // *.PLAYNITE
    "SUB-RULE,(PROCESS-NAME,Playnite.FullscreenApp.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,CefSharp.BrowserSubprocess.exe)," + BLACKLIST,
    "SUB-RULE,(PROCESS-NAME,Toolbox.exe)," + BLACKLIST,

    "SUB-RULE,(PROCESS-NAME,bg3.exe)," + BLACKLIST,                 // *.BALDURS GATE 3
    "SUB-RULE,(PROCESS-NAME,bg3_dx11.exe)," + BLACKLIST,

    /**
     * 白名单模式下，未匹配流量将使用 PROXY 策略，匹配流量将使用 DIRECT 策略，或自定义策略组。
     * 
     * whitelist 子规则是 fulllist 子规则的优化，它将 MATCH 前大量明确匹配 PROXY 策略的规则
     * 移除，并不再区分流量类型（移除 IN-TYPE 规则），最后未匹配流量将直接使用 PROXY 策略。
     */
    "SUB-RULE,(PROCESS-NAME,Telegram.exe)," + WHITELIST,            // *.TELEGRAM
    "SUB-RULE,(PROCESS-NAME,pikpak.exe)," + WHITELIST,              // *.PIKPAK

    "MATCH,DIRECT", // *.MATCH/ESCAPE
];

/**
 * 规则排序：
 * 
 * 1.访问频次高或优先级高的规则要前置；
 * 2.服务可能依赖的规则要前置，例如 Github 和 JetBrains 的规则；
 */
const SUB_RULES = {
    [FULLLIST]: [
        "RULE-SET,addition-reject,REJECT",
        "RULE-SET,addition-direct,DIRECT",

        "RULE-SET,addition-cloudflare,CLOUDFLARE",
        "RULE-SET,addition-oracle,ORACLE",

        "RULE-SET,special-docker,DOCKER",
        "RULE-SET,special-claude,CLAUDE",
        "RULE-SET,addition-openai,OPENAI",
        "RULE-SET,special-gemini,GEMINI",

        /**
         * JETBRAINS 组别要放在 Github 组别之后，因为它会用到 Github 的 API 服务
         */
        "RULE-SET,special-github,GITHUB",
        "RULE-SET,special-jetbrains,JETBRAINS",

        "RULE-SET,special-onedrive,ONEDRIVE",

        "RULE-SET,special-reddit,REDDIT",
        "RULE-SET,special-youtube,YOUTUBE",
        "RULE-SET,special-steam,STEAM",
        "RULE-SET,special-epic,EPIC",

        "RULE-SET,special-telegram,TELEGRAM",
        "RULE-SET,original-telegramcidr,TELEGRAM,no-resolve",

        /**
         * 本规则集是浏览器专用的规则集，主要用于处理浏览器的流量。
         * 
         * 浏览器中产生的匹配 special-pikpak 的流量一般非下载流量，即这里不需要使用
         * 专门的策略组（DOWNLOAD）来处理，这里直接分配 ALL 策略组（日常代理流量）。
         * 
         * 后续 blacklist 和 whitelist 子规则中匹配的 special-pikpak 流量则是由应用
         * 程序产生的流量，但它只匹配 pikpak.exe 的流量，它实际不产生下载流量。
         * 
         * 应用程序 PikPak 中产生的下载流量只来自 DownloadServer.exe 进程，仅这部分
         * 流量需要使用专门的策略组（DOWNLOAD）来处理，其他流量可使用 ALL 策略组。
         */
        "RULE-SET,special-pikpak,ALL", // *.THIS FOR PIKPAK IN BROWSER, NO DOWNLOAD TRAFFIC

        "RULE-SET,addition-media,MEDIA", // *.MEDIA GROUP

        /**
         * 额外的、需要代理服务的域名规则，推荐后置在特殊的分组规则之后。
         * 
         * 例如 google.com 域名会建议添加到 addition-proxy 规则集，避免匹配后续
         * 数量庞大的默认规则集。
         * 
         * 但该规则会覆盖掉大部分 special-gemini 规则集内的域名规则，为了避免代理
         * 组 GEMINI 失效，建议将 addition-proxy 规则集后置。
         * 
         * 因此 addition-proxy 规则集的最佳位置应该是在特殊代理组之后，同时保持在
         * 默认规则集之前。
         */
        "RULE-SET,addition-proxy,ALL",

        /**
         * 默认规则集。
         * 
         * 后续为自定义策略组无法处理的流量，规则集 original-xxx 是更为全面的规则集，
         * 但全面意味着数量庞大，顺序匹配的情况下，可能会影响 CLASH 核心的性能。
         * 
         * 因此，常用的流量尽可能拥有自定义的策略组及对应的规则集，尽量避免使用到后续
         * 提供的 original-xxx 规则集或 GEOIP 规则。
         * 
         * 但注意 original-xxx 规则集并非无意义，毕竟总会存在一些访问频次中等的域名
         * 或 IP 地址，这种情况下使用自定义的策略组并不合适。
         */
        "RULE-SET,original-applications,DIRECT",
        "RULE-SET,original-apple,DIRECT",
        "RULE-SET,original-icloud,DIRECT",
        "RULE-SET,original-private,DIRECT",
        "RULE-SET,original-direct,DIRECT",
        "RULE-SET,original-greatfire,ALL",
        "RULE-SET,original-gfw,ALL",
        "RULE-SET,original-proxy,ALL",
        "RULE-SET,original-tld-not-cn,ALL",
        "RULE-SET,original-reject,REJECT",

        "GEOIP,LAN,DIRECT,no-resolve",  // *.等价于 original-lancidr 规则集，用于局域网流量
        "GEOIP,CN,DIRECT,no-resolve",   // *.等价于 original-cncidr 规则集，用于国内流量

        "IN-TYPE,SOCKS5,DIRECT", // *.WHEN TUN MODE ON, PROGRAM WITH PROXY SETUP HAVE IN-TYPE.(HTTP(S)/SOCKS5)
        "OR,((IN-TYPE,HTTP),(IN-TYPE,HTTPS)),ALL", // *.BROWSER CAN USE ZERO OMEGA TO DISTINGUISH TYPE, ACCOMPLISH QUICK PROXY SWICHING.

        "MATCH,DIRECT" // *.基本用不上但需要提供
    ],
    [BLACKLIST]: [
        "RULE-SET,addition-reject,REJECT",

        "RULE-SET,addition-cloudflare,CLOUDFLARE",
        "RULE-SET,addition-oracle,ORACLE",

        "RULE-SET,special-docker,DOCKER",
        "RULE-SET,special-claude,CLAUDE",
        "RULE-SET,addition-openai,OPENAI",
        "RULE-SET,special-gemini,GEMINI",

        "RULE-SET,special-github,GITHUB",
        "RULE-SET,special-jetbrains,JETBRAINS",

        "RULE-SET,special-onedrive,ONEDRIVE",

        "RULE-SET,special-reddit,REDDIT",
        "RULE-SET,special-youtube,YOUTUBE",
        "RULE-SET,special-steam,STEAM",
        "RULE-SET,special-epic,EPIC",

        "RULE-SET,special-telegram,TELEGRAM",
        "RULE-SET,original-telegramcidr,TELEGRAM,no-resolve",

        "RULE-SET,special-pikpak,ALL", // *.NOT DOWNLOAD TRAFFIC, IT CAME FROM PIKPAK.EXE

        "RULE-SET,addition-media,MEDIA", // *.MEDIA GROUP

        "RULE-SET,addition-proxy,ALL",

        /**
         * 后续为自定义策略组无法处理的流量，规则集 original-xxx 是更为全面的规则集，
         * 但全面意味着数量庞大，顺序匹配的情况下，可能会影响 CLASH 核心的性能。
         * 
         * 因此，常用的流量尽可能拥有自定义的策略组及对应的规则集，尽量避免使用到后续
         * 提供的 original-xxx 规则集或 GEOIP 规则。
         * 
         * 但注意 original-xxx 规则集并非无意义，毕竟总会存在一些访问频次中等的域名
         * 或 IP 地址，这种情况下使用自定义的策略组并不合适。
         */
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

        "RULE-SET,addition-cloudflare,CLOUDFLARE",
        "RULE-SET,addition-oracle,ORACLE",

        "RULE-SET,special-docker,DOCKER",
        "RULE-SET,special-claude,CLAUDE",
        "RULE-SET,addition-openai,OPENAI",
        "RULE-SET,special-gemini,GEMINI",

        "RULE-SET,special-github,GITHUB",
        "RULE-SET,special-jetbrains,JETBRAINS",

        "RULE-SET,special-onedrive,ONEDRIVE",

        "RULE-SET,special-reddit,REDDIT",
        "RULE-SET,special-youtube,YOUTUBE",
        "RULE-SET,special-steam,STEAM",
        "RULE-SET,special-epic,EPIC",

        "RULE-SET,special-telegram,TELEGRAM",
        "RULE-SET,original-telegramcidr,TELEGRAM,no-resolve",

        "RULE-SET,special-pikpak,ALL", // *.NOT DOWNLOAD TRAFFIC, IT CAME FROM PIKPAK.EXE

        "RULE-SET,addition-media,MEDIA", // *.MEDIA GROUP

        /**
         * 后续为自定义策略组无法处理的流量，规则集 original-xxx 是更为全面的规则集，
         * 但全面意味着数量庞大，顺序匹配的情况下，可能会影响 CLASH 核心的性能。
         * 
         * 因此，常用的流量尽可能拥有自定义的策略组及对应的规则集，尽量避免使用到后续
         * 提供的 original-xxx 规则集或 GEOIP 规则。
         * 
         * 但注意 original-xxx 规则集并非无意义，毕竟总会存在一些访问频次中等的域名
         * 或 IP 地址，这种情况下使用自定义的策略组并不合适。
         */
        "RULE-SET,original-applications,DIRECT",
        "RULE-SET,original-apple,DIRECT",
        "RULE-SET,original-icloud,DIRECT",
        "RULE-SET,original-private,DIRECT",
        "RULE-SET,original-direct,DIRECT",
        "RULE-SET,original-reject,REJECT",

        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",

        "MATCH,ALL" // *.PROGRAM WITH PROXY SETUP ONLY USE TUN MODE AND HAS NOT IN-TYPE PROPERTY, ALL NO MATCHING TRAFFIC GO HERE!!!
    ],
    /**
     * download 子规则是专门提供给下载器使用的规则集，它从 fulllist 子规则中优化而来，
     * 只讲需要使用代理服务的规则集提取，并让它们使用 DOWNLOAD 策略组。
     * 
     * 为了避免未匹配的国内流量大量使用代理服务产生大量超时请求， download 子规则最终
     * 的 MATCH 规则将使用 DIRECT 策略。
     */
    [DOWNLOAD]: [
        "RULE-SET,special-pikpak,DOWNLOAD",
        "RULE-SET,addition-proxy,DOWNLOAD",
        "RULE-SET,original-greatfire,DOWNLOAD",
        "RULE-SET,original-gfw,DOWNLOAD",
        "RULE-SET,original-proxy,DOWNLOAD",
        "RULE-SET,original-tld-not-cn,DOWNLOAD",

        "MATCH,DIRECT" // *.ELSE NO MATCHING TRAFFIC THAT NEED PROXY CONNECTION  CAN ADD TO PRE-DOWNLOAD RULES
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