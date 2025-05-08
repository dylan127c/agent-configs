const fs = require("fs");
const path = require("path");

const FILE_NAME = path.basename(__filename).replace(".js", "");
function mark(name) {
    return FILE_NAME + "." + name + " =>";
}

// function homepath() {
//     return process.env.homepath.replace(/^\\/gm, "c:\\");
// }

delete require.cache[require.resolve("./params.js")];
const {
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
} = require("./params.js");

delete require.cache[require.resolve(PROFILE_PATH)];
const {
    OVERRIDE_MAPPING,
    RULES_PROVIDER_TYPE,
    GROUPS,
    RULES,
    SUB_RULES,
    READ_PROVIDER,
} = require(PROFILE_PATH);

function addonWriteIntoCVR(log, output, ...paths) {
    const funcName = "addonWriteIntoCVR";
    // *.将配置同步到 CVR_PROFILES 中（CLASH VERGE REV）
    paths.forEach(p => {
        // *.检查文件是否存在，如果存在则写入；如果不存在则跳过
        if (fs.existsSync(p)) {
            fs.writeFileSync(p, output, "utf-8");
            log.info(mark(funcName), "["+ path.basename(p) + "]", "done.");
        }
    });
}

function generate(log, yaml) {
    const funcName = "generate";

    // *.配置备份，将 PROFILE_PATH 中的配置文件备份到 PROFILE_SAVE 中
    fs.copyFileSync(PROFILE_PATH, PROFILE_SAVE);

    const {
        COMPREHENSIVE_CONFIG_PATH,
        COMPREHENSIVE_CONFIG_NAME,
        COMPREHENSIVE_CONFIG_TYPE,
        PROXY_PROVIDERS_MAP
    } = READ_PROVIDER(fs, yaml);

    params = BASIC_BUILT();
    params["proxy-providers"] = getProxyProvider(PROXY_PROVIDERS_MAP);
    params["rules"] = RULES;
    params["sub-rules"] = SUB_RULES;
    params["rule-providers"] = getRuleProvider(params, yaml, OVERRIDE_MAPPING); // *.带 params 参数允许反复调用 getRuleProvider 函数
    params["proxy-groups"] = getProxyGroups(PROXY_PROVIDERS_MAP);

    const output = yaml.stringify(params);
    fs.writeFileSync(
        path.join(
            COMPREHENSIVE_CONFIG_PATH,
            COMPREHENSIVE_CONFIG_NAME.replace(/$/gm, "." + COMPREHENSIVE_CONFIG_TYPE)
        ),
        output, "utf-8");
    addonWriteIntoCVR(log, output, ...CVR_PROFILES); // *.将配置同步到 CVR_PROFILES 中（CLASH VERGE REV）
    log.info(mark(funcName), "done.");
}

function getProxyGroups(map) {
    const providerCollection = []; // *.如果 COLLECT_APPEND 为 false 则此数组为空
    const providerGroupsName = [];
    const providerGroups = [];

    for (const [key, value] of Object.entries(map)) {
        const providerName = formatName(PROXY_PROVIDER_REG, key) || key;
        if (value.hasOwnProperty("override")) { // *.以防万一可以检查一下是否存在 override 字段
            const script = value.override;
            delete require.cache[require.resolve(script)];
            const { GROUP } = require(script); // *.读取绑定至各个订阅配置上的 OVERRIDE 脚本中自定义 EXPORT 的 GROUP 变量

            if (GROUP) { // *.如果存在 GROUP 则进行下一步，它可能为 undefined 值
                if (COLLECT_APPEND) {
                    const collect = {};
                    const collectName = formatName(SUBS_COLLECT_REGEX, key) || key;
                    if (collectName === key) {
                        collect.name = collectName + COLLECT_SYMBOL; // *.PROXY PROVIDER 名称不能和 PROXY GROUP 名称相同
                    } else {
                        collect.name = collectName;
                    }

                    collect.type = COLLECT_TYPE;
                    collect.proxies = COLLECT_PROXIES;
                    collect.use = [providerName];
                    collect.icon = COLLECT_ICON;
                    collect.filter = COLLECT_FILTER;
                    providerCollection.push(collect);
                }

                let groupName = formatName(PROXY_GROUPS_REGEX, key) || key;
                if (groupName !== key) {
                    const saver = groupName.replace(/[-|,]/gm, "[");
                    if (groupName !== saver) {
                        groupName = saver.replace(/$/gm, "]"); // *.替换成功，继续替换
                    } else {
                        groupName = saver; // *.不存在目标字符，不进行替换
                    }
                }
                GROUP.forEach(group => {
                    if (!group.hasOwnProperty("icon")) {
                        for (const [search, flag] of Object.entries(FLAG)) {
                            if (group.name.includes(search) || search === "UN") {
                                group.name = flag + " " + groupName + " => " + group.name;
                                break;
                            }
                        }
                    } else {
                        group.name = groupName + " => " + group.name;
                    }
                    providerGroupsName.push(group.name); // *.将自动生成的分组名称先存储起来，以便后续使用

                    const construct = {}; // *.根据配置的分组规则自动构建这些分组
                    construct.name = group.name;
                    construct.type = group.type;
                    construct.proxies = ["REJECT"];
                    construct.filter = group.filter
                    construct.use = [providerName];

                    if (group.hasOwnProperty("interval")) {
                        construct.interval = group.interval;
                    }
                    if (group.hasOwnProperty("lazy")) {
                        construct.lazy = group.lazy;
                    }
                    if (group.hasOwnProperty("icon")) {
                        construct.icon = group.icon;
                    }
                    providerGroups.push(addTypeParams(construct)); // *.将构建好的分组存储起来
                });
            }
        }
    }

    const groupsArr = [];
    GROUPS.forEach(preset => {
        const group = {};
        group.name = preset.name;
        group.type = preset.type;

        if (preset.hasOwnProperty("proxies")) {
            group.proxies = preset.proxies;
        } else {
            group.proxies = [];
        }

        if (preset.hasOwnProperty("interval")) {
            group.interval = preset.interval;
        }
        if (preset.hasOwnProperty("lazy")) {
            group.lazy = preset.lazy;
        }
        if (preset.hasOwnProperty("icon")) {
            group.icon = preset.icon;
        }
        if (preset.hasOwnProperty("url")) {
            group.url = preset.url;
        }

        if (!preset.hasOwnProperty("append") || !preset.append) {
            if (isEmptyArray(group.proxies)) {
                group.proxies.push(...providerGroupsName);
            }
            groupsArr.push(addTypeParams(group));
            return; // *.进行下一次迭代
        }

        if (!preset.hasOwnProperty("autofilter")) {
            if (isEmptyArray(group.proxies)) {
                group.proxies.push(...providerGroupsName);
            }
            groupsArr.push(addTypeParams(group));
            return; // *.进行下一次迭代
        }

        const filtered = providerGroupsName.filter(name => new RegExp(preset.autofilter, "i").test(name));

        // *.使用 relay 代理链模式时具备 reverse 属性，它可以更灵活地控制链式代理的顺序
        if (preset.hasOwnProperty("reverse") && preset.reverse) {
            filtered.reverse();
        }

        group.proxies.push(...filtered);
        groupsArr.push(addTypeParams(group));
    });

    groupsArr.push(...providerCollection);
    groupsArr.push(...providerGroups);
    return groupsArr;

    function addTypeParams(group) {

        const paramsMap = {
            [LOAD_BALANCE]: LOAD_BALANCE_PARAMS,
            [URL_TEST]: URL_TEST_PARAMS,
            [FALLBACK]: FALLBACK_PARAMS
        };

        const defaultParams = paramsMap[group.type] || {};
        if (Object.keys(defaultParams).length === 0) {
            return group;
        }

        return Object.assign({}, group, defaultParams,
            group.hasOwnProperty("interval") ? { interval: group.interval } : {},
            group.hasOwnProperty("lazy") ? { lazy: group.lazy } : {},
        );
    }

    function isEmptyArray(arr) {
        return Array.isArray(arr) && arr.length === 0;
    }
}

function getRuleProvider(params, yaml, override) {

    const file = fs.readFileSync(override, "utf8");
    const result = yaml.parse(file);

    const provider = params["rule-providers"] || {};
    result.items.forEach(item => {
        if (item.ext === RULES_PROVIDER_TYPE) { // *.只添加类型为 YAML 的文件为规则提供者
            const providerName = item.name;
            provider[providerName] = {};
            provider[providerName].type = "file";
            provider[providerName].behavior = getBehavior(providerName);
            provider[providerName].path = override.replace(/\./gm, "/" + item.id + ".");
            provider[providerName].interval = 86400;
        }
    });

    return provider;

    function getBehavior(name) {
        if (TYPE_MAP.IPCIDR.some(keyword => name.includes(keyword))) {
            return IPCIDR;
        }
        if (TYPE_MAP.CLASSICAL.some(keyword => name.includes(keyword))) {
            return CLASSICAL;
        }
        return DOMAIN;
    }
}

function getProxyProvider(map) {
    const provider = {};
    for (const [key, value] of Object.entries(map)) {
        // *.其中 key 为完整的 MP 上的订阅名称
        const providerName = formatName(PROXY_PROVIDER_REG, key) || key;

        provider[providerName] = {};
        provider[providerName].type = "file";
        provider[providerName].path = value.id;

        // *.默认不跳过证书验证（较为安全）
        let skipCertVerify = false;

        // *.根据完整的订阅名称来判断是否需要启用 skip-cert-verify 属性
        PROTOCOL_SKIP_CERT_VERIFY.forEach(protocol => {
            if (key.toLowerCase().includes(protocol.toLowerCase())) {
                // *.skip-cert-verify: true => 跳过证书验证
                provider[providerName] = Object.assign(provider[providerName], HEALTH_CHECK, JSON.parse(JSON.stringify(OVERRIDE_SKIP_CERT_VERIFY)));
                skipCertVerify = true;
                return;
            }
        });

        if (!skipCertVerify) {
            // *.skip-cert-verify: false => 不跳过证书验证（较为安全）
            provider[providerName] = Object.assign(provider[providerName], HEALTH_CHECK, JSON.parse(JSON.stringify(OVERRIDE)));
        }
    }
    return provider;
}

function formatName(reg, str) {
    // *.提取名称，不符合正则时返回 undefined
    const result = reg.exec(str);
    if (result) {
        return result[0];
    }
    return result;
}

module.exports = { generate };