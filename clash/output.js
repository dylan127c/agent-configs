/**
 * 
 * @param {*} yaml YAML框架
 * @param {*} rawAfter 已处理完毕的配置信息
 * @param {object} console 控制台调试对象
 */
module.exports.runStash = (yaml, rawAfter, console) => {
    const configuration = yaml.parse(rawAfter);

    let symbol = "ON";

    const stashProxyGroups = Object.assign(configuration["proxy-groups"]);
    const index = stashProxyGroups.findLastIndex(ele => ele.name.includes("订阅详情"));
    if (index >= 0) {
        stashProxyGroups.splice(index, 1);
        symbol = "CC";
    }

    const outputStr = yaml.stringify({
        name: symbol,
        desc: "Replace original configuration file.",
        dns: configuration.dns,
        rules: configuration.rules,
        "proxy-groups": stashProxyGroups,
        "rule-providers": configuration["rule-providers"]
    });

    const outputFinal = outputStr
        .replace("dns:", "dns: #!replace")
        .replace("rules:", "rules: #!replace")
        .replace("proxy-groups:", "proxy-groups: #!replace")
        .replace("rule-providers:", "rule-providers: #!replace");

    const fs = require("fs");
    const path = require("path");
    fs.writeFile(
        path.resolve(__dirname, "..", "stash", symbol + ".stoverride"),
        outputFinal,
        (err) => { throw err; }
    );
}

/**
 * 
 * @param {*} yaml YAML框架
 * @param {*} rawAfter 已处理完毕的配置信息
 * @param {object} console 控制台调试对象
 */
module.exports.runShadowrocket = (yaml, rawAfter, console) => {

    const configuration = yaml.parse(rawAfter);

    let symbol = "on";

    const initProxyGroups = Object.assign(configuration["proxy-groups"]);
    const index = initProxyGroups.findLastIndex(ele => ele.name.includes("订阅详情"));
    if (index >= 0) {
        initProxyGroups.splice(index, 1);
        symbol = "cc";
    }

    let shadowrocketRule = "[Rule]\n";
    const url = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/shadowrocket/rules"
    configuration.rules.forEach(ele => {
        if (ele.includes("RULE-SET")) {
            shadowrocketRule += ele.replace(/RULE-SET,/gm, "RULE-SET," + url + "/")
                .replace(/(?<!T),(?!n)/gm, ".list,") + "\n";
        } else {
            shadowrocketRule += ele + "\n"
        }
    });

    let shadowrocketProxyGroup = "[Proxy Group]\n";
    initProxyGroups.forEach(ele => {
        shadowrocketProxyGroup += ele.name + " = " + ele.type + ",";
        ele.proxies.forEach(proxy => {
            if (symbol === "on" && proxy.match(/\d\d/gm)) {
                /*
                 * Shadowrocket中的分组不支持显示Emoji表情，
                 * 这里采用正则表达式来去除某些分组名称中的Emoji表情。
                 */
                shadowrocketProxyGroup += proxy.replace(/^\W+? (?!\d)/gm, "") + ","
            } else {
                shadowrocketProxyGroup += proxy + ","
            }
        });
        /**
         * Shadowrocket中无论分组中的Type类型是什么，都需要添加以下条目。
         * 处于某些分组类型时，Shadowrocket会忽略条目中的某些键值。
         */
        shadowrocketProxyGroup += "interval=600,timeout=5,select=0,url=http://www.gstatic.com/generate_204\n";
    });

    /*
     * Shadowrocket中规则集已经和规则融合在一起了，只要规则和分组详情获取完毕，就可以输出到文件。
     * 
     * 目录下存在一个初始的配置文件：sr_rules_init.conf。
     * 通过覆盖初始配置文件的[Rule]和[Proxy Group]内容，即可得到最终的Shadowrocket配置文件。
     */
    const fs = require("fs");
    const input = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/sr_rules_init.conf"
    const initContent = fs.readFileSync(input, 'utf-8');

    const output = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/sr_rules_" + symbol + ".conf";
    const outputContent = initContent
        .replace(/\[Rule\]/g, shadowrocketRule)
        .replace(/\[Proxy Group\]/g, shadowrocketProxyGroup);

    fs.writeFileSync(output, outputContent, "utf-8");

    /* 规则更新 */
    shadowrocketRulesUpdateCheck(console);
}

/**
 * 本方法用于检查是否需要更新规则目录（rules）下的文件。
 * 
 * - 更新只依赖Clash的规则目录，直接读取其中的文件并将其转换为Shadowrocket支持的规则。
 * - 如果时间戳文件不存在，则进行更新；否则检查该时间与当前时间的间隔是否大于一周。
 * - 如果时间间隔大于一周，则进行文件更新；否则将跳过更新并输出上次文件更新的日期。
 * 
 * @param {object} console 控制台调试对象
 */
function shadowrocketRulesUpdateCheck(console) {
    const fs = require("fs");
    const path = require("path");

    const destination = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/rules";

    fs.readFile(path.resolve(destination, "timestamp.txt"),
        'utf8',
        (err, data) => {
            if (err) {
                shadowrocketRulesUpdate(console);
                updateTimestamp(console, destination);
            } else {
                const savedTimestamp = parseInt(data);
                const currentTimestamp = Date.now();

                const intervalInHours = (currentTimestamp - savedTimestamp) / (1000 * 60 * 60);

                if (intervalInHours >= 168) {
                    shadowrocketRulesUpdate(console);
                    updateTimestamp(console, destination);
                } else {
                    console.log("No update required for default rule.\nLast updated:",
                        new Date(savedTimestamp).toString(), "\n");
                }
            }
        });
}

function shadowrocketRulesUpdate(console) {

    const sources = [
        {
            path: "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/default rules",
            prefix: "default-",
            search: {
                "applications": "PROCESS-NAME",
                "apple": "DOMAIN-SUFFIX",
                "icloud": "DOMAIN-SUFFIX",
                "private": "DOMAIN-SUFFIX",
                "direct": "DOMAIN-SUFFIX",
                "greatfire": "DOMAIN-SUFFIX",
                "gfw": "DOMAIN-SUFFIX",
                "proxy": "DOMAIN-SUFFIX",
                "tld-not-cn": "DOMAIN-SUFFIX",
                "reject": "DOMAIN-SUFFIX",
                "telegramcidr": "IP-CIDR",
                "lancidr": "IP-CIDR",
                "cncidr": "IP-CIDR",
            }
        },
        {
            path: "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/customize rules",
            prefix: "customize-",
            search: {
                "applications": "PROCESS-NAME",
                "reject": "DOMAIN-SUFFIX",
                "direct": "DOMAIN-SUFFIX",
                "edge": "DOMAIN-SUFFIX",
                "openai": "DOMAIN-SUFFIX",
                "brad": "DOMAIN-SUFFIX",
                "copilot": "DOMAIN-SUFFIX",
                "proxy": "DOMAIN-SUFFIX",
            }
        }
    ]
    const destination = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/rules";

    const replacelist = {
        "PROCESS-NAME": {
            "^payload:\n": "",
            "^  #": "#",
            "^  - ": ""
        },
        "DOMAIN-SUFFIX": {
            "^payload:\n": "",
            "^  #": "#",
            "^.+?'\\+?\\.?": "DOMAIN-SUFFIX,",
            "'$": ""
        },
        "IP-CIDR": {
            "^payload:\n": "",
            "^  #": "#",
            "^  - '": "IP-CIDR,",
            "'$": ""
        }
    }

    const fs = require("fs");
    const path = require("path");

    syncRuleFiles(sources, destination, replacelist);

    function syncRuleFiles(sources, destination, replacelist) {
        // 不存在destination目录就创建它
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination);
        }

        sources.forEach(source => {
            // clash规则目录不存在，就结束当前循环，进入下一个循环
            if (!fs.existsSync(source.path)) {
                return;
            }
            const sourceFiles = fs.readdirSync(source.path);
            sourceFiles.forEach(sourceFile => {
                if (sourceFile !== "timestamp.txt") {
                    const inputPath = path.join(source.path, sourceFile);
                    const outputPath = path.join(destination, source.prefix + sourceFile.replace(/\..+$/gm, "") + ".list" );

                    if (fs.lstatSync(inputPath).isDirectory()) {
                        copyFolderSync(inputPath, outputPath);
                    } else {
                        let fileContent = fs.readFileSync(inputPath, "utf-8");
                        const fileName = sourceFile.replace(/\..+$/gm, "");
                        for (const [search, replace] of Object.entries(replacelist[source.search[fileName]])) {
                            fileContent = fileContent.replace(new RegExp(search, "gm"), replace);
                        }
                        fs.writeFileSync(outputPath, fileContent, "utf-8");
                    }
                }
            });
        });
    }
}

/**
 * 本方法用于更新时间戳（timestamp.txt）文件。
 * 
 * 当Date对象调用toString方法时，JS会根据实际运行环境来转换时间戳，得到符合当前时区的日期字符串。
 * 
* @param {object} console 控制台调试对象
*/
function updateTimestamp(console, destination) {
    const fs = require("fs");
    const path = require("path");

    const currentTimestamp = Date.now();
    fs.writeFile(path.resolve(destination, "timestamp.txt"),
        currentTimestamp.toString(),
        (err) => {
            if (err) {
                console.log("Timestamp update failure:", err, "\n");
            } else {
                console.log(
                    "The timestamp has been updated:",
                    new Date(currentTimestamp).toString(), "\n");
            }
        });
}