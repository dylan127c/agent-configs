const PROFILE_PATH = "d:/program files/mihomo party/data/override/192b4acc89e.js";

const COLLECT_APPEND = true;
const COLLECT_SYMBOL = "(ALL)";
const COLLECT_TYPE = "select";
const COLLECT_PROXIES = ["REJECT"];
const COLLECT_ICON = "https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Universal/Airport.png";
const COLLECT_FILTER = "^(?!.*(?:套|剩|网|请|官|备|此|重)).*$";

const FLAG = { HK: "🇭🇰", SG: "🇸🇬", TW: "🇹🇼", US: "🇺🇸", JP: "🇯🇵", UK: "🇬🇧", KR: "🇰🇷", MY: "🇲🇾", PL: "🇵🇱", UN: "🏴‍☠️" };

const IPCIDR = "ipcidr";
const CLASSICAL = "classical";
const DOMAIN = "domain";

const TYPE_MAP = {
    IPCIDR: ["cidr"],
    CLASSICAL: ["special", "application", "pre"],
}

/**
 * 节点之间的质量差距不大时，可以选用 load-balance 策略。
 */
const LOAD_BALANCE = "load-balance"
const LOAD_BALANCE_PARAMS = {
    url: "http://www.google.com/generate_204",
    strategy: "consistent-hashing",
    lazy: true,
    interval: 300,
    timeout: 2500,
    'max-failed-times': 2,
    'disable-udp': false,
};

/**
 * 节点之间的质量存在一定差距时，选用 url-test 策略。
 */
const URL_TEST = "url-test";
const URL_TEST_PARAMS = {
    url: "http://www.google.com/generate_204",
    tolerance: 50, // *.目标节点的延迟小于当前选择节点的延迟至少 tolerance 值时，才会切换到目标节点
    lazy: true,
    interval: 300,
    timeout: 2500,
    'max-failed-times': 2,
    'disable-udp': false,
};

/**
 * 不同于 load-balance 和 url-test 策略， fallback 更像一种高可用方案。
 */
const FALLBACK = "fallback";
const FALLBACK_PARAMS = {
    url: "http://www.google.com/generate_204",
    lazy: true,
    interval: 120,
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
        url: "http://www.google.com/generate_204",
        lazy: true,
        interval: 300
    }
};

const OVERRIDE = {
    "override": {
        "udp": true,
        "tfo": true,
        "mptcp": true,
        "skip-cert-verify": true,
    }
};

/**
 * 许多配置 Mihomo Party 都有提供，默认情况下客户端提供的规则会覆盖本配置文件提供的规则。
 * 即客户端上的规则其优先级高于配置文件中的规则，为了避免不必要的错误，尽量保持客户端上的规则与本配置一致。
 */
const BASIC_BUILT = () => {

    /* INITIALIZE */
    let initConfiguration = {};

    /* BASIC CONFIGURATION */
    initConfiguration["mixed-port"] = 13766;
    initConfiguration["port"] = 0; // *.HTTP(S) 代理端口
    initConfiguration["socks-port"] = 0; // *.SOCKS5 代理端口
    initConfiguration["redir-port"] = 0; // *.Redirect 透明代理端口，仅限 Linux(Android) 和 macOS 系统，仅代理 TCP 流量
    initConfiguration["tproxy-port"] = 0; // *.TProxy 透明代理端口，仅限 Linux(Android) 系统，可代理 TCP/UDP 流量

    initConfiguration.mode = "rule";
    initConfiguration["log-level"] = "info";
    initConfiguration.ipv6 = false;

    initConfiguration["allow-lan"] = true;
    initConfiguration["lan-allowed-ips"] = ["0.0.0.0/0", "::/0"];
    initConfiguration["lan-disallowed-ips"] = [];
    initConfiguration.authentication = [];
    initConfiguration["skip-auth-prefixes"] = ["127.0.0.1/32"];

    initConfiguration["external-controller"] = "127.0.0.1:9090";
    initConfiguration.secret = "";

    initConfiguration["bind-address"] = "*";
    initConfiguration["find-process-mode"] = "strict";

    initConfiguration["unified-delay"] = true; // *.是否启用 RTT 延迟测试
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

    /*
     * DNS
     *
     * TUN 模式下，所有使用 DIRECT 或遇到未添加 no-resolve 的 IP 规则的域名，
     * 都需要使用到 DNS 规则。
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
    initConfiguration["hosts"] = {}; // *. hosts 关键字配置的多种类型的映射
    initConfiguration["dns"] = {};
    initConfiguration.dns.enable = false;
    initConfiguration.dns.ipv6 = false;
    initConfiguration.dns.listen = "0.0.0.0:53";
    
    initConfiguration.dns["use-hosts"] = false; // *.是否使用 hosts 关键字配置的映射
    initConfiguration.dns["use-system-hosts"] = false; // *.是否使用系统 host 文件的 IP 映射

    initConfiguration.dns["enhanced-mode"] = "fake-ip";
    initConfiguration.dns["fake-ip-range"] = "192.18.0.1/16";
    initConfiguration.dns["fake-ip-filter"] = [
        "+.msftncsi.com",
        "+.msftconnecttest.com",
        "+.time.windows.com",
        "+.ipv6.microsoft.com",
        "+.lan",
    ];

    initConfiguration.dns["default-nameserver"] = [
        "223.5.5.5", // *.Alidns
        "223.6.6.6",
        "119.29.29.29", // *.DNSPod
        "119.28.28.28",
        "101.226.4.6", // *.360DNS
        "218.30.118.6",
        "180.76.76.76" // *.BaiduDNS
    ];
    initConfiguration.dns.nameserver = [
        "https://dns.alidns.com/dns-query", // *.Alidns
        "https://223.5.5.5/dns-query",
        "https://223.6.6.6/dns-query",
        "https://doh.pub/dns-query", // *.DNSPod
        "https://1.12.12.12/dns-query",
        "https://120.53.53.53/dns-query",
        "https://doh.360.cn/dns-query" // *.360DNS
    ];

    initConfiguration.dns["respect-rules"] = true;
    initConfiguration.dns["proxy-server-nameserver"] = initConfiguration.dns.nameserver.slice(); // *.硬拷贝 nameserver 配置
   
    initConfiguration.dns.fallback = [];
    initConfiguration.dns["fallback-filter"] = {};

    /*
     * TUN（仅接管 TCP/UDP 流量）
     *
     * 大部分浏览器默认开启 “安全 DNS” 功能，此功能会影响 TUN 模式劫持 DNS 请求导致反推域名失败，
     * 请在浏览器设置中关闭此功能以保证 TUN 模式正常运行。
     * 
     * 注意，在 tun.enable = true 时，CFW 会在完成配置更新时自动打开 TUN 模式，这显然不合理。
     * 而对于 CV 来说，无论 tun.enable 的值是什么，TUN 模式都不会被自动打开。
     * 
     * 因此，建议 tun.enable 保持 false 状态，在需要使用到 TUN 模式时，再手动代开。
     * 
     * 另外，tun.stack 默认为 gvisor 模式，但该模式兼容性欠佳，因此建议改为 system 模式。
     * 
     * 但需要注意，使用 system 模式需要先添加防火墙规则 Add firewall rules，
     * 同时还要安装、启用服务模式 Service Mode。
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
        "strict-route": false // *.可能造成问题，建议不启用
    };

    /*
     * PROFILE
     *
     * 遗留问题：使用 clash-tracing 项目监控 CFW 流量时，则需要在 ~/.config/clash/config.yaml 中添加 profile 配置。
     * 但目前 CFW 并无法正确识别该配置，即便将配置写入 config.yaml 中也不会生效。
     * 
     * 解决方法：直接在配置中添加 profile 信息，这样就可以使用 clash-tracing 项目来监控 CFW 流量了。
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
    PROFILE_PATH,
    COLLECT_APPEND,
    COLLECT_SYMBOL,
    COLLECT_TYPE,
    COLLECT_PROXIES,
    COLLECT_ICON,
    COLLECT_FILTER,
    BASIC_BUILT,
};  