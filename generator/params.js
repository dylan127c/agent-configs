const PROFILE_SAVE = "h:/github/agent configs/generator/profile.js"; // *.仓库内的配置文件路径（备份）
const PROFILE_PATH = "d:/program files/mihomo party/data/override/192b4acc89e.js"; // *.MP 覆写内的配置文件路径

const CVR_PROFILES = [
    "C:/Users/dylan/AppData/Roaming/io.github.clash-verge-rev.clash-verge-rev/profiles/LXYasedmprkb.yaml",  // *.LAN.NETWORK
    "C:/Users/dylan/AppData/Roaming/io.github.clash-verge-rev.clash-verge-rev/profiles/LF56hOZiUPpV.yaml",  // *.WLAN.NETWORK
];

const PROXY_PROVIDER_REG = /\b.*/;
const SUBS_COLLECT_REGEX = /\b.+?\b/;
const PROXY_GROUPS_REGEX = /(?<=\[).*?(?=\])/;

const COLLECT_APPEND = true;        // *.是否在代理组中添加指定订阅的节点集合
const COLLECT_SYMBOL = "[COL]";     // *.如果 SUBS_COLLECT_REGEX 无法匹配成功，则在节点集合（代理组）的命名后添加 COLLECT_SYMBOL（后缀）
const COLLECT_TYPE = "select";      // *.节点集合的默认类型
const COLLECT_PROXIES = ["REJECT"]; // *.节点集合的初始代理节点
const COLLECT_ICON = "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Puzzle.png"; // *.节点集合的图标
const COLLECT_FILTER = "^(?!.*(?:套|剩|网|请|官|备|此|重|跳)).*$"; // *.节点入组时过滤掉包含指定关键字的节点（过滤条件）


const FLAG = { HK: "🇭🇰", SG: "🇸🇬", TW: "🇹🇼", US: "🇺🇸", JP: "🇯🇵", UK: "🇬🇧", KR: "🇰🇷", MY: "🇲🇾", PL: "🇵🇱", UN: "🏴‍☠️" };

const IPCIDR = "ipcidr";
const CLASSICAL = "classical";
const DOMAIN = "domain";

const TYPE_MAP = {
    IPCIDR: ["cidr"],
    CLASSICAL: ["special", "application", "pre"],
};

/**
 * 关于嵌套组之间 lazy: false 的问题，该参数不具备传递性。
 * 
 * 一个简单的场景，即 A 组为 select 类型，其中嵌套了 B 组 fallback 类型，同时 B 组中嵌套了 C 组 url-test 类型，
 * 后俩组均设置了 lazy: false 参数。那么：
 * 
 * - 当规则匹配 A 组时，它只会使用选中的 B 组节点而不会触发该 B 组的 lazy: false 策略，因为当前直接使用的是 A 组而不是 B 组；
 * - 同样地，如果特地去对 B 组进行延迟，那么它也不会触发 C 组的 lazy: false 策略，因为延迟测试直接针对的是 B 组而不是 C 组。
 * 
 * 一种错觉是认为 lazy: false 参数会传递给所有嵌套组，但实际上软件启动时会对所有组进行一次延迟测试。所以只要节点质量高，
 * 那网络就不会断连。这便产生了一种错觉，让人误以为 lazy: false 参数生效了（可传递），实际只是因为节点质量高，仅此而已。
 * 
 * 所以很多时候会看到订阅提供商会将所有节点集中在一个组中，并直接使用 load-balance 或 url-test 策略，而不使用所谓嵌套组。
 * 这样能够保证直接使用的永远是 load-balance 或 url-test 策略组，以保证 lazy: false 参数一直生效。
 */

/**
 * 节点之间的质量差距不大时，可选用 load-balance 策略。
 */
const LOAD_BALANCE = "load-balance"
const LOAD_BALANCE_PARAMS = {
    url: "https://www.google.com/generate_204",
    strategy: "consistent-hashing", // *.consistent-hashing：相同域名的请求会被转发到同一个节点
    lazy: false,
    interval: 300,
    timeout: 2500,
    'max-failed-times': 2,
    'disable-udp': false,
};

/**
 * 节点之间的质量存在一定差距时，可选用 url-test 策略。
 */
const URL_TEST = "url-test";
const URL_TEST_PARAMS = {
    url: "https://www.google.com/generate_204",
    tolerance: 50, // *.目标节点的延迟小于当前选择节点的延迟至少 tolerance 值时，才会切换到目标节点
    lazy: false,
    interval: 300,
    timeout: 2500,
    'max-failed-times': 2,
    'disable-udp': false,
};

/**
 * 不同于 load-balance 和 url-test 策略， fallback 更像一种高可用方案。
 * 
 * 提示：GUI 通常会提供一种按节点延迟排序的功能，该功能配合 fallback 时即等同于使用 url-test 策略。
 */
const FALLBACK = "fallback";
const FALLBACK_PARAMS = {
    url: "https://www.google.com/generate_204",
    lazy: false,
    interval: 300,
    timeout: 2500,
    'max-failed-times': 2,
    'disable-udp': false,
};

/**
 * 提供给 proxy-providers 的 health-check 配置。
 * 
 * 注意，如果 proxy-groups 中使用了 proxy-providers 提供的节点，那么就必须启用 health-check 功能。
 * 否则，即便 proxy-groups 中具有 interval 参数，也无法保证 health-check 功能的正常运行。
 */
const HEALTH_CHECK = {
    "health-check": {
        enable: true,
        url: "https://www.google.com/generate_204",
        lazy: true,
        interval: 300
    }
};

/**
 * 产生 UDP 流量的服务有游戏、通讯应用、流媒体等。 
 */
const OVERRIDE = {
    "override": {
        "udp": true,
        "tfo": true,
        "mptcp": true,
        "skip-cert-verify": false,
    }
};

/**
 * 某些协议支持使用 SNI 指定了 TLS 握手时的服务器，它能够实现连接伪装、流量伪装等功能。
 * 
 * 当指定了 SNI 为例如 cdn.alibaba.com 但实际访问的是 xxx-proxy-cdn.top 时，证书验证
 * 必然会失败。此时需要将 skip-cert-verify 设置为 true 值来跳过证书验证。
 * 
 * 将 skip-cert-verify 设置为 true 值，可以 确保即使证书域名不匹配，连接也能成功建立。
 */
const OVERRIDE_SKIP_CERT_VERIFY = {
    "override": {
        "udp": true,
        "tfo": true,
        "mptcp": true,
        "skip-cert-verify": true,
    }
};

const PROTOCOL_SKIP_CERT_VERIFY = [
    "trojan",
    "vmess",
    "vless",
];

/**
 * 许多配置 Mihomo Party 都有提供，默认情况下客户端提供的规则会覆盖本配置文件提供的规则。
 * 即客户端上的规则其优先级高于配置文件中的规则，为了避免不必要的错误，尽量保持客户端上的规则与本配置一致。
 * 
 * 例如 DNS 配置，仅修改此配置的 DNS 配置是无法生效的，必须在客户端上同步修改 DNS 配置（或只修改客户端上的 DNS 配置）。
 */
const BASIC_BUILT = () => {

    /* INITIALIZE */
    let initConfiguration = {};

    /* BASIC CONFIGURATION */
    initConfiguration["mixed-port"] = 13766;    // *.HTTP(S) 和 SOCKS5 代理端口，后续使用 listeners 可以配置其他的监听端口
    initConfiguration["port"] = 0;              // *.HTTP(S) 代理端口
    initConfiguration["socks-port"] = 0;        // *.SOCKS5 代理端口
    initConfiguration["redir-port"] = 0;        // *.Redirect 透明代理端口，仅限 Linux(Android) 和 macOS 系统，仅代理 TCP 流量
    initConfiguration["tproxy-port"] = 0;       // *.TProxy 透明代理端口，仅限 Linux(Android) 系统，可代理 TCP/UDP 流量

    initConfiguration.mode = "rule";
    initConfiguration["log-level"] = "info";
    initConfiguration.ipv6 = false;

    initConfiguration["allow-lan"] = true;
    initConfiguration["lan-allowed-ips"] = ["0.0.0.0/0", "::/0"];
    initConfiguration["lan-disallowed-ips"] = [];
    initConfiguration.authentication = [];
    initConfiguration["skip-auth-prefixes"] = ["127.0.0.1/32"];

    initConfiguration["external-controller"] = "127.0.0.1:9097"; // *.该配置的 GUI 优先级较高
    initConfiguration.secret = ""; // *.该配置的 GUI 优先级较高

    initConfiguration["bind-address"] = "*";
    initConfiguration["find-process-mode"] = "strict";

    initConfiguration["unified-delay"] = true;  // *.是否启用 RTT 延迟测试
    initConfiguration["tcp-concurrent"] = true; // *.是否开启 TCP 并发连接数限制

    initConfiguration["geodata-mode"] = true;
    initConfiguration["geodata-loader"] = "standard";
    initConfiguration["geo-auto-update"] = true;
    initConfiguration["geo-update-interval"] = 24;
    initConfiguration["geox-url"] = {
        geoip: "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat",
        geosite: "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat",
        mmdb: "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb",
        asn: "https://cdn.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb",
    };
    initConfiguration["global-ua"] = "clash.rev";   // *.如果保持默认值 clash.meta 那么 MP 似乎无法更新某些资源，例如 GeoLite2-ASN.mmdb 文件
    initConfiguration["etag-support"] = true;       // *.是否启用 ETag 支持

    /**
     * listeners 可以配置多个监听器， CLASH 会在所有监听器上同时监听。这实际等同于
     * 在 CLASH 中配置多个其他端口，数组中的每个对象都代表一个监听器。
     * 
     * 监听器可以支持添加 rule、proxy 等参数，其中 proxy 参数的优先级较高，它可以是代理
     * 或代理组，也可以是内置的 DIRECT 或 REJECT 等规则。
     * 
     * 参数 rule 表示此监听器所遵循的规则， 一般会将它配置为某个 sub-rule 的名称。如果子
     * 规则无效，则  CLASH 会使用默认值 rules 来进行匹配。
     * 
     * 根据规则配置，只有符合要求的应用能够使用某些子规则。但利用监听器，可直接通过端口
     * 的形式将子规则开放给所有其他应用使用，只要应用能够连接到此端口就可以使用此子规则。
     */
    initConfiguration["listeners"] = [
        // {
        //     name: "PROXYCAP_BLACKLIST", // *.监听器名称，只用作标识符而没有其他用处
        //     type: "mixed",              // *.HTTPS/SOCKS5
        //     listen: "0.0.0.0",          // *.监听地址
        //     port: 37412,                // *.监听端口
        //     rule: "blacklist",          // *.子规则名称
        // },
        // {
        //     name: "PROXYCAP_WHITELIST", // *.监听器名称，只用作标识符而没有其他用处
        //     type: "mixed",              // *.HTTPS/SOCKS5
        //     listen: "0.0.0.0",          // *.监听地址
        //     port: 37413,                // *.监听端口
        //     rule: "whitelist",          // *.子规则名称
        // },
        // {
        //     name: "PROXYCAP_DOWNLOAD",  // *.监听器名称，只用作标识符而没有其他用处
        //     type: "mixed",              // *.HTTPS/SOCKS5
        //     listen: "0.0.0.0",          // *.监听地址
        //     port: 37414,                // *.监听端口
        //     rule: "download",           // *.子规则名称
        // },
        {
            name: "PROXYCAP_DIRECT",   // *.监听器名称，只用作标识符而没有其他用处
            type: "mixed",                  // *.HTTPS/SOCKS5
            listen: "0.0.0.0",              // *.监听地址
            port: 51162,                    // *.监听端口
            proxy: "DIRECT",           // *.策略组名称
        }
    ];

    /**
     * NTP （Network Time Protocol）配置如果启用，则会在 CLASH 启动时自动
     * 向指定的 NTP 服务器发送请求以获取当前时间，并将其写入系统时间。
     * 
     * 这点非常好，因为某些代理服务提供商的节点会对时间进行验证，如果系统时间
     * 不正确，则可能会导致节点无法使用。
     * 
     * 对于 MP 来说可以正常使用，因为它本身启动就需要管理员权限。
     * 
     * 同步时间还可以使用第三方的 NTP 客户端来实现，例如 NetTime 等。（推荐）
     * 如果已安装了诸如 NetTime 等第三方 NTP 客户端，则将下述 ntp 配置注释掉。
     */
    // initConfiguration["ntp"] = {
    //     enable: true,
    //     "write-to-system": true,   // *.是否将时间写入系统（需管理员权限）
    //     server: "ntp.aliyun.com",  // *.NTP 服务器
    //     port: 123,
    //     interval: 30, // *.更新间隔（单位：分）
    // };

    // *.全局 TLS 指纹，用于对抗网络检查，提高一致性和隐蔽性。
    // *.可选：chrome、firefox、safari、iOS、android、edge、360、qq 和 random 等。
    // *.若选择 random，则按 Cloudflare Radar 数据按概率生成一个现代浏览器指纹。
    initConfiguration["global-client-fingerprint"] = "chrome";

    /**
     * DNS
     *
     * TUN 模式下，所有使用 DIRECT 或遇到未添加 no-resolve 的 IP 规则的域名，
     * 都需要使用到 DNS 解析服务。
     * 
     * CLASH 将同时使用 nameserver 和 fallback 中的所有 DNS 服务器，来查询
     * 域名的真实 IP 地址，其中 fallback 中的 DNS 解析结果的优先级较高。
     * 
     * 通常的配置策略是 nameserver 中提供国内的 DNS 服务器，而在 fallback 中
     * 提供国外的 DNS 服务器。 当需要解析国内域名时，基本能够保证结果的可靠性；
     * 如果需要解析国外域名，即便 nameserver 返回被污染的 IP 地址，也还可以
     * 依靠 fallback 中国外的 DNS 服务器所解析出来的 IP 地址。
     * 
     * 对于 CFW 来说，TUN 模式自带了 DNS 配置，且该配置默认处于启用状态，并无法更改。
     * 这意味着使用 CFW 开启 TUN 模式后，默认生效的 DNS 配置永远是 TUN 模式自带的 DNS 配置。
     * 
     * 配置文件内的 DNS 配置可以选择性开启或关闭。如果开启 DNS 配置，则所有经过 CFW/CV 的请求
     * 都会用 nameserver、fallback 中的 DNS 服务器进行解析（同时解析）。
     * 如果关闭 DNS 配置（dns.enable = false），则意味 CFW/CV 会使用系统默认的 DNS 解析服务。
     * 
     * 建议日常将 dns.enable 设置 false，以免未启用 TUN 时使用了 DNS 配置中的服务器。
     * 
     * 无论是 CFW 还是 CV，都需要启用服务模式后，才能正常使用 TUN 模式。
     */
    initConfiguration["hosts"] = {
        // *.hosts 关键字配置的多种类型的映射，相当于CLASH 自己的 hosts 文件

        // *.注意 dns 配置中的 use-hosts 参数只控制 dns 回应，CLASH 内部的 resolver 依旧遵循此 hosts 配置
        // *.或者简单来说，即便 use-hosts 为 false 值，CLASH 依旧会使用此 hosts 配置
        // *.这也是为什么 use-hosts 疑似无效的原因
    };
    initConfiguration["dns"] = {};
    initConfiguration.dns.enable = true;
    initConfiguration.dns.ipv6 = false;
    initConfiguration.dns.listen = "0.0.0.0:53";

    initConfiguration.dns["use-hosts"] = false;         // *.是否使用 hosts 关键字配置的映射
    initConfiguration.dns["use-system-hosts"] = true;   // *.是否使用系统 hosts 文件的 IP 映射

    /**
     * fake-ip 模式建立的映射关系是：域名 → 虚假 IP 地址（无文档记录，但猜测这样才合理）
     */
    initConfiguration.dns["enhanced-mode"] = "fake-ip";
    initConfiguration.dns["fake-ip-range"] = "192.18.0.1/16";

    /**
     * 正常情况下的 DNS 解析流程：
     * 
     * 1.虚假 IP 分配：当应用程序请求解析域名时，CLASH 不向实际 DNS 服务器查询，
     *   而是直接从内部的 fake-ip-range 中分配一个虚假 IP 地址返回给应用程序。
     * 2.建立连接：应用程序拿到这个虚假的 IP 地址后，尝试与其建立连接；
     * 3.CLASH 内部处理：当应用使用虚假 IP 地址建立连接时，CLASH 可以捕获请求，
     *   并根据 FakeIP 映射查找到原始的域名并应用规则，以使用代理或直连策略。
     * 
     * 应用失效的关键：远程控制、P2P 等应用程序依赖真实的 IP 完成连接！
     * 
     * 例如，向日葵远程控制软件从 CLASH 中获取到虚假 IP 后：
     * 
     * 1.向日葵会尝试与虚假 IP 建立 P2P 连接；
     * 2.但虚假 IP 是 CLASH 内部分配的虚假地址，并不存在于实际的网络中；
     * 3.这将表现为向日葵无法与远程主机连接的假象，即远程控制无法建立。
     * 
     * 当域名被添加到 fake-ip-filter 后：
     * 
     * 1.CLASH 会使用 nameserver 和 fallback 中的 DNS 服务器对域名进行解析；
     * 2.得到真实的 IP 地址后，CLASH 会将其返回给应用程序；
     * 3.应用程序使用目标服务器的真实 IP 地址与之建立连接。
     * 
     * 其主要的作用是屏蔽特定域名使用 fake-ip 模式进行解析，以保证部分应用能够正常运行。
     * 
     * 例如向日葵远程控制软件，使用 fake-ip 模式后会导致无法连接到远程主机。这时候需要
     * 将下述三个域名添加到 fake-ip-filter 中才能保证正常运行：
     * 
     * 1. "+.orayimg.com",
     * 2. "+.oray.com",
     * 3. "+.oray.net",
     * 
     * 同样，像 QQ 网页版等依赖真实 IP 的应用，也需要添加到 fake-ip-filter 中以避免因解析
     * 到虚假 IP 导致异常或错误。
     * 
     * 最后需注意，即使 fake‑ip‑filter 返回了真实 IP，这个真实 IP 也仅用于建立连接；规则匹配过程
     * 依然会基于原始的域名来进行判断，即解析得到的真实 IP 在规则匹配时无效。
     * 
     * 如何获得原始域名？例如建立 HTTPS 连接时，原始域名信息回放在 SNI 字段中，那么 CLASH 就能从中
     * 取到原始域名并进行规则匹配。
     * 
     * 推荐根据实际情况来决定是否需要将域名添加 fake-ip-filter 参数中，例如并非所有远程控制软件
     * 都需要添加特定域名信息到 fake-ip-filter 中，因此推荐根据实际异常情况来决定是否添加。
     * 
     * 综合 GUI 提供的日志功能及应用表现出来的异常行为，一般就可以判断出是否有必要将该应用程序关联
     * 的域名添加到 fake-ip-filter 中了。
     */
    initConfiguration.dns["fake-ip-filter"] = [ // *.MP 需要到 DNS 配置中添加 fake-ip-filter 参数（GUI 的配置优先级较高）
        "+.lan",
        "+.ntp.aliyun.com",
        "+.ntp.tencent.com",
        "+.time.asia.apple.com",
        "+.time.windows.com",
        "+.time.nist.gov",
        "+.msftncsi.com",
        "+.msftconnecttest.com",
        "+.ipv6.microsoft.com",
        "+.qq.com",
        "+.mihoyo.com",
        "+.bhsr.com",
        "+.anticheatexpert.com",
        "+.kurogame.com",
        "+.aki-game.com",
        "+.orayimg.com",
        "+.oray.com",
        "+.oray.net",
        "+.todesk.com"
    ];

    // *.支持 DoH 协议，但域名需为 IP 地址形式（不是所有 IPv4 地址都支持 DoH 协议，因此不能直接将 IPv4 书写为 DoH 协议）
    initConfiguration.dns["default-nameserver"] = [
        "223.5.5.5", // *.Alidns
        "223.6.6.6",
        "119.29.29.29", // *.DNSPod
        "119.28.28.28",
        "101.226.4.6", // *.360DNS
        "218.30.118.6",
        "114.114.114.114", // *.114DNS
        "114.114.115.115",
        "180.76.76.76", // *.BaiduDNS
    ];
    initConfiguration.dns.nameserver = [
        "https://dns.alidns.com/dns-query", // *.Alidns
        "https://223.5.5.5/dns-query",
        "https://223.6.6.6/dns-query",
        "https://doh.pub/dns-query", // *.DNSPod
        "https://1.12.12.12/dns-query",
        "https://120.53.53.53/dns-query",
        "https://doh.360.cn/dns-query", // *.360DNS
    ];

    // *.用于 DIRECT 出口的 DNS 服务器，如果不填则遵循 nameserver-policy、nameserver 和 fallback 的配置
    initConfiguration.dns["direct-nameserver"] = initConfiguration.dns.nameserver.slice(); // *.硬拷贝 nameserver 配置

    initConfiguration.dns["respect-rules"] = true; // *.如果此项为 true 值，则需要配置 proxy-server-nameserver 参数
    initConfiguration.dns["proxy-server-nameserver"] = initConfiguration.dns.nameserver.slice(); // *.解析代理节点的 DNS 服务器，即用于解析代理提供商的节点

    initConfiguration.dns.fallback = []; // *.后备域名解析服务器，一般情况下使用境外 DNS 服务器
    initConfiguration.dns["fallback-filter"] = {}; // *.配置 fallback 后默认启用 fallback-filter 功能，其中 geoip-code 为 cn 值

    /*
     * TUN（仅接管 TCP/UDP 流量）
     *
     * 大部分浏览器默认开启 “安全 DNS” 功能，此功能会影响 TUN 模式劫持 DNS 请求导致反推域名失败，
     * 请在浏览器设置中关闭此功能以保证 TUN 模式正常运行。
     * 
     * 注意，在 tun.enable = true 时，CFW 会在完成配置更新时自动打开 TUN 模式，这显然不合理。
     * 而对于 CV 来说，无论 tun.enable 的值是什么，TUN 模式都不会被自动打开。
     * 
     * 因此，建议 tun.enable 保持 false 状态，在需要使用到 TUN 模式时，再手动打开。
     * 
     * 另外，tun.stack 默认为 gvisor 模式，但该模式兼容性欠佳，因此建议改为 system 模式。
     * 
     * 但需要注意，使用 system 模式需要先添加防火墙规则 Add firewall rules，
     * 同时还要安装、启用服务模式 Service Mode（实际就是一个 Windows 服务）。
     */
    // initConfiguration["interface-name"] = "以太网"; // *.如果指定网卡则 tun.auto-detect-interface 为 false 值
    initConfiguration["tun"] = {
        enable: false,
        stack: "system",
        "auto-route": true,
        "auto-detect-interface": true, // *.如果存在 interface-name 那么这里为 false 值
        "dns-hijack": ["any:53"],
        "auto-redirect": false, // *.仅支持 Linux 系统，Windows 系统下配置无效
        "mtu": 1500,
        /**
         * Windows 系统中严格路由会添加防火墙规则以组织 Windows 的普通多宿主 DNS 解析行为造成的 DNS 泄漏。
         * 但它也可能使某些应用程序（如 VirtualBox 等）在某些情况下无法正常工作。
         * 
         * 实测，启用此选项会让默认情况下的 Vue3 应用无法本地访问，需在 vite.config.js 中添加额外的 server 配置:
         * export default defineConfig({
         *   plugins: [vue()],
         *   server: {
         *     host: true,         // *.TUN 模式启用严格路由的情况下，需要监听所有地址（包括局域网和公网地址）才能访问项目地址
         *     port: 5173,         // *.默认端口
         *     strictPort: false,  // *.如果端口已被占用，则尝试下一个可用端口
         *     open: false,        // *.启动时是否自动在浏览器中打开
         *   }
         * })
         * 
         * 同时，严格路由一般由 CLASH GUI 接管，是否选择启用严格路由请谨慎考虑，推荐不启用。
         */
        "strict-route": false // *.此选项会让默认情况下的 Vue3 应用无法本地访问
    };

    /*
     * PROFILE
     *
     * 在配置中添加 profile 信息，这样就可以使用 clash-tracing 项目来监控 CLASH 流量了。
     */
    // initConfiguration["profile"] = { "tracing": false };
    initConfiguration["profile"] = {
        "store-selected": true,
        "store-fake-ip": true
    };

    return initConfiguration;
}

module.exports = {
    IPCIDR,
    CLASSICAL,
    DOMAIN,
    TYPE_MAP,
    FLAG,
    LOAD_BALANCE,
    LOAD_BALANCE_PARAMS,
    URL_TEST,
    URL_TEST_PARAMS,
    FALLBACK,
    FALLBACK_PARAMS,
    HEALTH_CHECK,
    OVERRIDE,
    OVERRIDE_SKIP_CERT_VERIFY,
    PROTOCOL_SKIP_CERT_VERIFY,
    PROFILE_SAVE,
    PROFILE_PATH,
    COLLECT_APPEND,
    COLLECT_SYMBOL,
    COLLECT_TYPE,
    COLLECT_PROXIES,
    COLLECT_ICON,
    COLLECT_FILTER,
    PROXY_PROVIDER_REG,
    SUBS_COLLECT_REGEX,
    PROXY_GROUPS_REGEX,
    BASIC_BUILT,
    CVR_PROFILES,
};  