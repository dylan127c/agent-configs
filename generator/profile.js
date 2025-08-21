/**********************************************************************************
 *** Add this content to Mihomo Party OVERRIDE SETTING. And record the config's ***
 *** name like this: 192b4acc89e.js. Finally, setup this path into params.js.   ***
 **********************************************************************************/

const MIHOMO_PARTY = "d:/program files/mihomo party/";          // _.MIHOMO PARTY 安装路径（不区分大小写）

const OVERRIDE_MAPPING = MIHOMO_PARTY + "data/override.yaml";   // _.GUI => 覆写（OVERRIDE）结构文件
const PROVIDER_MAPPING = MIHOMO_PARTY + "data/profile.yaml";    // _.GUI => 订阅（PROVIDER）结构文件

const GROUP_PROVIDER_PATH = MIHOMO_PARTY + "data/override/";    // _.GUI => 覆写（OVERRIDE）结构目录
const PROXY_PROVIDER_PATH = MIHOMO_PARTY + "data/profiles/";    // _.GUI => 订阅（PROVIDER）结构目录
const RULES_PROVIDER_TYPE = "yaml";
const PROXY_PROVIDER_TYPE = "yaml";

const READ_PROVIDER = (fs, yaml) => {
    const file = fs.readFileSync(PROVIDER_MAPPING, "utf8");
    const result = yaml.parse(file);

    // *.必需确保 MIHOMO PARTY 中“启用配置”为自定义的综合配置（非供应商的订阅配置）
    const COMPREHENSIVE_CONFIG_NAME = result.current;
    const COMPREHENSIVE_CONFIG_PATH = MIHOMO_PARTY + "data/profiles/";
    const COMPREHENSIVE_CONFIG_TYPE = "yaml";

    const PROXY_PROVIDERS_MAP = {};
    result.items.forEach(item => {
        // *.存在 override 的订阅配置表示存在分组依据；不存在分组依据的订阅不需要纳入综合配置
        if (item.id !== COMPREHENSIVE_CONFIG_NAME && item.override.length !== 0) {
            const detail = {};

            detail.id = PROXY_PROVIDER_PATH + item.id + "." + PROXY_PROVIDER_TYPE;  // _.供应商的订阅配置路径
            detail.override = GROUP_PROVIDER_PATH + item.override[0];               // _.存储分组信息的订阅绑定（JS）文件路径

            // *.{key, value} => {name: {id, override}}
            PROXY_PROVIDERS_MAP[item.name] = detail;                                // _.其中 item.name 为订阅名称
        };
    });
    return { COMPREHENSIVE_CONFIG_PATH, COMPREHENSIVE_CONFIG_NAME, COMPREHENSIVE_CONFIG_TYPE, PROXY_PROVIDERS_MAP };
};

const ATUO_PREFIX = "[AUTO]";
const FILTER_GROUPS = [
    { name: ATUO_PREFIX + " => HK", type: "fallback", append: true, autofilter: "^.*HK", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => SG", type: "fallback", append: true, autofilter: "^.*SG", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => TW", type: "fallback", append: true, autofilter: "^.*TW", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => JP", type: "fallback", append: true, autofilter: "^.*JP", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => US", type: "fallback", append: true, autofilter: "^.*US", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
    { name: ATUO_PREFIX + " => KR", type: "fallback", append: true, autofilter: "^.*KR", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png" },
];

const AUTO_GROUPS = FILTER_GROUPS.filter(group => group.name.startsWith(ATUO_PREFIX)).map(group => group.name);
const AUTO_DIRECT = ["DIRECT"].concat(AUTO_GROUPS);
const AUTO_REJECT = ["REJECT"].concat(AUTO_GROUPS);

const SPECIFIC_GROUPS = [
    { name: "ALL", type: "select", proxies: AUTO_GROUPS.concat(["SPECIFIC"]), icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Available_1.png" },
    { name: "SPECIFIC", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ULB.png" },
    { name: "DOWNLOAD", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/SSID.png" },
    { name: "STREAMING", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Media.png" },

    // !.远程 SSH 需要代理的情况（例如配合 FinalShell 使用）
    { name: "SSH", type: "select", proxies: ["DIRECT"], single: true, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Round_Robin.png" },

    { name: "CLOUDFLARE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Cloudflare.png", url: "https://cloudflare.com/cdn-cgi/trace" },
    { name: "CURSOR", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Cursor.png" },
    { name: "GITHUB", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/GitHub_1.png", url: "https://api.github.com/zen" },
    { name: "LINUX.DO", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Cat.png", url: "https://status.linux.do/api/status-page/heartbeat/default" },

    // ?.PIKPAK 下载存在大量请求建议优先进行匹配
    { name: "PIKPAK.DS", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/pikpak.png" },

    // ?.JETBRAINS 日常使用推荐 H|M 类型节点；下载使用推荐 L 类型节点。规避风险选择 REJECT 策略组
    { name: "JETBRAINS", type: "select", proxies: ["DIRECT", "REJECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/JetBrains.png" },
    { name: "DOCKER", type: "select", proxies: ["DIRECT", "REJECT"], append: true, autofilter: "^.*(?:\\[H|M|L\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Docker.png" },
    { name: "CLAUDE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Claude.png" },
    { name: "OPENAI", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/ChatGPT.png" },
    { name: "GOOGLEDRIVE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Drive.png" },
    { name: "ONEDRIVE", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/OneDrive.png" },
    { name: "YOUTUBE", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:\\[M|L\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png" },
    { name: "TELEGRAM", type: "select", proxies: ["REJECT"], append: true, autofilter: "^.*(?:SG).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png" },
    { name: "STEAM", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Steam.png" },
    { name: "EPIC", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H\\]).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Epic_Games.png" },
    { name: "GEMINI", type: "select", proxies: AUTO_REJECT, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png" },
    { name: "REDDIT", type: "select", proxies: AUTO_REJECT, icon: "https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/reddit(1).png" },
    { name: "ORACLE", type: "select", proxies: ["DIRECT"], append: true, autofilter: "^.*(?:\\[H|M\\]).*$", icon: "https://raw.githubusercontent.com/dylan127c/agent-configs/main/commons/icons/normal/Orcl.png" },
];
const GROUPS = SPECIFIC_GROUPS.concat(FILTER_GROUPS);

const F_LIST = "fulllist";  // _.完整的规则集（常用于浏览器分流）
const B_LIST = "blacklist"; // _.黑名单模式（MATCH DIRECT）
const W_LIST = "whitelist"; // _.白名单模式（MATCH PROXY）
const D_LIST = "download";  // _.下载流量分流规则（DOWNLOAD）

const RULES = [
    // !.本规则的设计原则是基于 PROCESS 完成初次分流匹配，后续根据规则集针对请求深度分流
    // >.某些流量（已知或未知）可能需要提前进行分流（REJECT、DIRECT、PROXY 或 DOWNLOAD）
    // >.规则集 ADDITION-PRE-* 用于匹配这类型流量，以提前完成拦截、直连、代理或下载等需求
    // >.注意前置规则不能过多，TUN 模式下所有程序都要经过这些规则集的匹配，尽量保持少量精准

    // !.注意 ADDITION-PRE-* 规则文件是 CLASSICAL 类型
    // !.普通 ADDITION-* 规则则多使用 DOMAIN 而非 CLASSICAL 类型
    "RULE-SET,addition-pre-block,REJECT",                               // _.提前拦截（例如参与 PCDN 的域名）
    "RULE-SET,addition-pre-direct,DIRECT",                              // _.提前直连（例如游戏、网盘程序产生的流量）
    "RULE-SET,addition-pre-download,DOWNLOAD",                          // _.提前下载（或未知下载）
    "RULE-SET,addition-pre-agents,ALL",                                 // _.提前代理（或未知代理）
    
    // !.类似 CLASH VERGE 等工具使用 Microsoft Edge 作为渲染引擎来
    // !.存在 msedgewebview2.exe 进程发起类似 githubcontents.com 的请求
    // !.注意 Windows 系统中存在许多 msedgewebview2.exe 进程要求直连网络，不能一概而论地走代理
    "AND,((PROCESS-NAME,msedgewebview2.exe),(DOMAIN-KEYWORD,github)),GITHUB",

    // !.后续分流完全基于 PROCESS 规则，未匹配的程序将使用 DIRECT 策略（MATCH）
    // !.完全依赖代理服务的程序可以不使用规则集分流（推荐直接分配专用的代理策略组）
    "PROCESS-NAME,GoogleDriveFS.exe,GOOGLEDRIVE",                       // _.GOOGLE DRIVE

    // !.一般的下载程序根据请求是否需要代理服务来按需完成下载
    // !.PIKPAK 较为特殊，其存在国内 CDN 节点允许进行直连下载（尽量直连）
    "PROCESS-NAME,DownloadServer.exe,PIKPAK.DS",                        // _.PIKPAK DOWNLOAD SERVER
    
    // !.下载场景下未被规则集囊括的下载域名可能会被后续规则集囊括
    // !.从而造成下载流量走代理的情况，这里直接使用单独代理组管理流量
    "PROCESS-NAME,steam.exe,STEAM",                                     // _.STEAM
    "PROCESS-NAME,steamwebhelper.exe,STEAM",                            // _.STEAM WEBHELPER 
    "PROCESS-NAME,steamservice.exe,STEAM",                              // _.STEAM SERVICE   
    
    // !.单独代理组管理 EPIC 的原因和 STEAM 类似
    "PROCESS-NAME,EpicWebHelper.exe,EPIC",                              // _.EPIC
    "PROCESS-NAME,EpicGamesLauncher.exe,EPIC",                          // _.EPIC GAMES LAUNCHER

    // !.浏览器存在大量请求，使用 F_LIST 完整规则集分流
    "SUB-RULE,(PROCESS-NAME,zen.exe)," + F_LIST,                        // _.ZEN
    "SUB-RULE,(PROCESS-NAME,firefox.exe)," + F_LIST,                    // _.FIREFOX
    "SUB-RULE,(PROCESS-NAME,msedge.exe)," + F_LIST,                     // _.MICROSOFT EDGE
    "SUB-RULE,(PROCESS-NAME,chrome.exe)," + F_LIST,                     // _.GOOGLE CHROME

    // ?.注意 BT 程序产生的大量超时请求的问题（不推荐将 BT 程序纳入分流）
    // >.BT 可能产生的大量超时请求，这会让 CLASH 误判策略组存在问题；
    // >.DOWNLOAD 策略组存在问题时，CLASH 会反复对指定组别进行延迟测试；
    // >.长时间的、密集的延迟测试可能会影响 CLASH 核心的稳定性；
    // >.同时，请求量过大无异于对核心发起 DDOS 攻击。

    // !.普通下载需求使用 D_LIST 规则集
    "SUB-RULE,(PROCESS-NAME,IDMan.exe)," + D_LIST,                      // _.IDM
    "SUB-RULE,(PROCESS-NAME,draw.io.exe)," + D_LIST,                    // _.DRAW.IO
    "SUB-RULE,(PROCESS-NAME,PotPlayerMini64.exe)," + D_LIST,            // _.POTPLAYER
    "SUB-RULE,(PROCESS-NAME,PowerToys.Update.exe)," + D_LIST,           // _.POWERTOY UPDATER

    // !.黑名单模式
    "SUB-RULE,(PROCESS-NAME,curl.exe)," + B_LIST,                       // _.GIT => CLONE/PULL/PUSH
    "SUB-RULE,(PROCESS-NAME,ssh.exe)," + B_LIST,                        // _.GIT => SSH
    "SUB-RULE,(PROCESS-NAME,git-remote-https.exe)," + B_LIST,           // _.GIT => HTTPS

    // !.针对 JETBRAINS 关键字进程分流，同时对目标产品单独进行分流
    "SUB-RULE,(PROCESS-PATH-REGEX,(?i).*jetbrains.*)," + B_LIST,        // _.JETBRAINS
    "SUB-RULE,(PROCESS-NAME,idea64.exe)," + B_LIST,                     // _.INTELLIJ IDEA
    "SUB-RULE,(PROCESS-NAME,pycharm64.exe)," + B_LIST,                  // _.PYCHARM
    "SUB-RULE,(PROCESS-NAME,datagrip64.exe)," + B_LIST,                 // _.DATAGRIP
    "SUB-RULE,(PROCESS-NAME,goland64.exe)," + B_LIST,                   // _.GOLAND
    "SUB-RULE,(PROCESS-NAME,webstorm64.exe)," + B_LIST,                 // _.WEBSTORM

    // ?.内核版本 1.19.5 =>
    // ?.路径正则能够正常匹配类似 com.docker.backend.exe 这样的进程名
    "SUB-RULE,(PROCESS-PATH-REGEX,(?i).*docker.*)," + B_LIST,           // _.DOCKER DESKTOP

    "SUB-RULE,(PROCESS-NAME,java.exe)," + B_LIST,                       // _.JAVA RUNTIME
    "SUB-RULE,(PROCESS-NAME,go.exe)," + B_LIST,                         // _.GO RUNTIME
    "SUB-RULE,(PROCESS-NAME,cursor.exe)," + B_LIST,                     // _.CURSOR
    "SUB-RULE,(PROCESS-NAME,code.exe)," + B_LIST,                       // _.VISUAL STUDIO CODE/VSCODE

    "SUB-RULE,(PROCESS-NAME,Mihomo Party.exe)," + B_LIST,               // _.MIHOMO PARTY
    "SUB-RULE,(PROCESS-NAME,clash-verge.exe)," + B_LIST,                // _.CLASH VERGE
    "SUB-RULE,(PROCESS-NAME,Postman.exe)," + B_LIST,                    // _.POSTMAN

    "SUB-RULE,(PROCESS-NAME,thunderbird.exe)," + B_LIST,                // _.THUNDERBIRD
    "SUB-RULE,(PROCESS-NAME,PowerToys.exe)," + B_LIST,                  // _.POWERTOY
    "SUB-RULE,(PROCESS-NAME,memreduct.exe)," + B_LIST,                  // _.MEMREDUCT

    "SUB-RULE,(PROCESS-NAME,node.exe)," + B_LIST,                       // _.NODE.JS
    "SUB-RULE,(PROCESS-NAME,Postman.exe)," + B_LIST,                    // _.POSTMAN
    "SUB-RULE,(PROCESS-NAME,gitkraken.exe)," + B_LIST,                  // _.GITKRAKEN
    "SUB-RULE,(PROCESS-NAME,miktex-console.exe)," + B_LIST,             // _.MIKTEX CONSOLE

    "SUB-RULE,(PROCESS-NAME,CefSharp.BrowserSubprocess.exe)," + B_LIST, // _.STEAM/PLAYNITE

    // ?.内核版本 1.19.5 => 路径规则能够正常匹配使用“.”分割的进程名
    "SUB-RULE,(PROCESS-NAME,Playnite.DesktopApp.exe)," + B_LIST,        // _.PLAYNITE
    "SUB-RULE,(PROCESS-NAME,Playnite.FullscreenApp.exe)," + B_LIST,     // _.PLAYNITE FULLSCREEN
    "SUB-RULE,(PROCESS-NAME,Toolbox.exe)," + B_LIST,                    // _.PLAYNITE TOOLBOX

    "SUB-RULE,(PROCESS-NAME,bg3.exe)," + B_LIST,                        // _.BALDURS GATE 3
    "SUB-RULE,(PROCESS-NAME,bg3_dx11.exe)," + B_LIST,                   // _.BALDURS GATE 3 DX11
    "SUB-RULE,(PROCESS-NAME,LariLauncher.exe)," + B_LIST,               // _.LARIAN LAUNCHER

    // !.PIKPAK 不能使用 W_LIST 子规则（白名单不保留 ALL 策略组）
    // ?.原因是 mypikpak.com 域名存在于 original-direct 规则集
    // ?.规则集 speial-pikpak 需前置以提前匹配 mypikpak.com 域名
    "SUB-RULE,(PROCESS-NAME,pikpak.exe)," + B_LIST,                     // _.PIKPAK

    // !.白名单模式
    "SUB-RULE,(PROCESS-NAME,Telegram.exe)," + W_LIST,                   // _.TELEGRAM
    "SUB-RULE,(PROCESS-NAME,AdsPower Global.exe)," + W_LIST,            // _.ADSPOWER
    "SUB-RULE,(PROCESS-NAME,SunBrowser.exe)," + W_LIST,                 // _.SUN BROWSER

    // !.无匹配流量
    "MATCH,DIRECT",                                                     // _.ESCAPE REQUESTS
];


const ALL_SUB_RULES = [
    // !.一些广告拦截及直连请求
    // >.后续先匹配特殊代理分组以应用更贴切的代理节点
    "RULE-SET,addition-reject,REJECT",                              // _.REJECT
    "RULE-SET,addition-direct,DIRECT",                              // _.DIRECT

    // !.CLOUDFLARE 常用于验证，对很多服务来说都特别重要（建议置顶）
    "RULE-SET,addition-cloudflare,CLOUDFLARE",                      // _.CLOUDFLARE
    "RULE-SET,addition-oracle,ORACLE",                              // _.ORACLE

    // !.CURSOR
    "RULE-SET,addition-cursor,CURSOR",                              // _.CURSOR

    // !.AI 御三家
    "RULE-SET,special-claude,CLAUDE",                               // _.CLAUDE
    "RULE-SET,special-gemini,GEMINI",                               // _.GEMINI
    "RULE-SET,addition-openai,OPENAI",                              // _.OPENAI

    // !.JETBRAINS 组别要放在 Github 组别之后
    // !.因为 JETBRAINS 需要用到 Github API 服务
    "RULE-SET,special-github,GITHUB",                               // _.GITHUB
    "RULE-SET,special-jetbrains,JETBRAINS",                         // _.JETBRAINS

    // !.DOCKER 多用于下载镜像（IMAGE）
    "RULE-SET,addition-docker,DOCKER",                              // _.DOCKER

    // !.游戏、视频、网盘等
    "RULE-SET,addition-linux.do,LINUX.DO",                          // _.LINUX.DO
    "RULE-SET,addition-media,STREAMING",                            // _.STREAMING
    "RULE-SET,special-reddit,REDDIT",                               // _.REDDIT
    "RULE-SET,special-youtube,YOUTUBE",                             // _.YOUTUBE
    "RULE-SET,special-onedrive,ONEDRIVE",                           // _.ONEDRIVE

    // !.TELEGRAM
    "RULE-SET,special-telegram,TELEGRAM",                           // _.TELEGRAM
    "RULE-SET,original-telegramcidr,TELEGRAM,no-resolve",           // _.TELEGRAM

    // !.PIKPAK
    "RULE-SET,special-pikpak,ALL",                                  // _.PIKPAK

    // !.常见的自定义代理规则匹配
    "RULE-SET,addition-proxy,ALL",                                  // _.PROXY

    // !.内置规则（尽量避免匹配，影响性能）
    // >.此规则集合之前的规则应覆盖大部分的代理使用场景
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

    // !.局域网流量（等价 original-lancidr 规则集）
    "GEOIP,LAN,DIRECT,no-resolve",
    // !.国内流量（等价 original-cncidr 规则集）
    "GEOIP,CN,DIRECT,no-resolve",

    // !.浏览器优化：根据 SOCKS5/HTTP(S) 协议类型实现 DIRECT/PROXY 策略组动态匹配
    // >.简而言之，浏览器可选使用 SOCKS5 还是 HTTP(S) 协议连接代理服务
    // >.当请求未匹配时，可根据协议类型动态选择使用 DIRECT 还是 PROXY 策略组 
    "IN-TYPE,SOCKS5,DIRECT",
    "OR,((IN-TYPE,HTTP),(IN-TYPE,HTTPS)),ALL",

    // !.浏览器基本不需要使用 MATCH 规则
    "MATCH,DIRECT"
];

function simplify(erase, arr) {
    const { strategyErase = [], typeExclued = [], strategyMatch } = erase;
    return arr.filter(rule => {
        const hasType = typeExclued.some(t => rule.startsWith(t));
        const hasStrategy = strategyErase.some(s => rule.includes(s));

        return !(hasType || hasStrategy);
    }).concat(`MATCH,${strategyMatch}`);
}

function download(replaced, arr) {
    const { before, after, excluded = [], match } = replaced;
    return arr
        .filter(rule =>
            rule.includes(before) &&
            !excluded.some(t => rule.startsWith(t))
        )
        .map(rule => rule.replace(before, after))
        .concat(`MATCH,${match}`);
}

const BROWSER_ONLY = ["IN-TYPE", "OR", "MATCH"];
const SUB_RULES = {
    [F_LIST]: [...ALL_SUB_RULES],
    [B_LIST]: simplify(
        {
            strategyErase: ["DIRECT"],
            typeExclued: BROWSER_ONLY,
            strategyMatch: "DIRECT"
        },
        [...ALL_SUB_RULES]
    ),
    [W_LIST]: simplify(
        {
            strategyErase: ["ALL"],
            typeExclued: BROWSER_ONLY,
            strategyMatch: "ALL"
        },
        [...ALL_SUB_RULES]
    ),
    [D_LIST]: download(
        {
            before: "ALL",
            after: "DOWNLOAD",
            excluded: BROWSER_ONLY,
            match: "DIRECT",
        },
        [...ALL_SUB_RULES]),
};

module.exports = {
    OVERRIDE_MAPPING,
    RULES_PROVIDER_TYPE,
    GROUPS,
    RULES,
    SUB_RULES,
    FULLLIST: F_LIST,
    READ_PROVIDER,
};