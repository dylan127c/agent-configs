module.exports.runStash = (yaml, rawAfter) => {
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

module.exports.runShadowrocket = (yaml, rawAfter, console) => {

    const configuration = yaml.parse(rawAfter);

    let symbol = "on";

    const stashProxyGroups = Object.assign(configuration["proxy-groups"]);
    const index = stashProxyGroups.findLastIndex(ele => ele.name.includes("订阅详情"));
    if (index >= 0) {
        stashProxyGroups.splice(index, 1);
        symbol = "cc";
    }

    let shadowrocketRule = "[Rule]\n";
    const url = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/shadowrocket/rules"
    configuration.rules.forEach(ele => {
        if (ele.includes("RULE-SET")) {
            shadowrocketRule += ele.replace(/RULE-SET,/gm, "RULE-SET," + url + "/")
                .replace(/(?<!T),(?!n)/gm, ".yaml,") + "\n";
        } else {
            shadowrocketRule += ele + "\n"
        }
    });

    let shadowrocketProxyGroup = "[Proxy Group]\n";
    stashProxyGroups.forEach(ele => {
        shadowrocketProxyGroup += ele.name + " = " + ele.type + ",";
        ele.proxies.forEach(proxy => {
            shadowrocketProxyGroup += proxy + ","
        });
        shadowrocketProxyGroup += "interval=600,timeout=5,select=0,url=http://www.gstatic.com/generate_204\n";
    });

    const fs = require("fs");
    const input = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/sr_rules_init.conf"
    const initContent = fs.readFileSync(input, 'utf-8');

    const output = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/sr_rules_" + symbol + ".conf";
    const outputContent = initContent
        .replace(/\[Rule\]/g, shadowrocketRule)
        .replace(/\[Proxy Group\]/g, shadowrocketProxyGroup);

    fs.writeFileSync(output, outputContent, "utf-8");




    // const destination = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/rules";

    // const defaultRulePath = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/default rules";
    // const customizeRulePath = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/customize rules";

    // const mode = {
    //     default: "",
    //     customize: ""
    // };
    // try {
    //     fs.accessSync(defaultRulePath, fs.constants.F_OK);
    //     mode.default = defaultRulePath;
    // } catch (error) {
    //     console.log("Rules default is not exist.")
    // }

    // try {
    //     fs.accessSync(customizeRulePath, fs.constants.F_OK);
    //     mode.customize = customizeRulePath;
    // } catch (error) {
    //     console.log("Rules customize is not exist.")
    // }

    // // 如果clash中的default rule和customize rule都不存在，那么就不需要进行复制了
    // if (!mode.default && !mode.customize) {
    //     return;
    // }

    // 检查时间戳，因为目标文件夹只有一个，因此不能够在确认要复制的时候检查时间戳
    shadowrocketRulesUpdateCheck(console);

}

/**
 * 本方法用于检查是否需要更新默认规则目录（default rules）下的文件。
 * 
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
                // shadowrocketRulesUpdate(console);
                updateTimestamp(console, destination);
            } else {
                const savedTimestamp = parseInt(data);
                const currentTimestamp = Date.now();

                const intervalInHours = (currentTimestamp - savedTimestamp) / (1000 * 60 * 60);

                if (intervalInHours >= 168) {
                    // shadowrocketRulesUpdate(console);
                    updateTimestamp(console, destination);
                } else {
                    console.log("No update required for default rule.\nLast updated:",
                        new Date(savedTimestamp).toString(), "\n");
                }
            }
        });
}

function shadowrocketRulesUpdate(console) {


    const fs = require("fs");
    const path = require("path");

    const defaultSearch = {
        "applications": { type: "PROCESS-NAME", mode: "DIRECT" },
        "apple": { type: "DOMAIN-SUFFIX", mode: "DIRECT" },
        "icloud": { type: "DOMAIN-SUFFIX", mode: "DIRECT" },
        "private": { type: "DOMAIN-SUFFIX", mode: "DIRECT" },
        "direct": { type: "DOMAIN-SUFFIX", mode: "DIRECT" },
        "greatfire": { type: "DOMAIN-SUFFIX", mode: "PROXY-BETTER" },
        "gfw": { type: "DOMAIN-SUFFIX", mode: "PROXY-BETTER" },
        "proxy": { type: "DOMAIN-SUFFIX", mode: "PROXY-BETTER" },
        "tld-not-cn": { type: "DOMAIN-SUFFIX", mode: "PROXY-BETTER" },
        "reject": { type: "DOMAIN-SUFFIX", mode: "REJECT" },
        "telegramcidr": { type: "IP-CIDR", mode: "PROXY-BETTER" },
        "lancidr": { type: "IP-CIDR", mode: "DIRECT" },
        "cncidr": { type: "IP-CIDR", mode: "DIRECT" },
    }

    const customizeSearch = {
        "applications": { type: "PROCESS-NAME", mode: "DIRECT" },
        "reject": { type: "DOMAIN-SUFFIX", mode: "REJECT" },
        "direct": { type: "DOMAIN-SUFFIX", mode: "DIRECT" },
        "edge": { type: "DOMAIN-SUFFIX", mode: "PROXY-EDGE" },
        "openai": { type: "DOMAIN-SUFFIX", mode: "PROXY-OPENAI" },
        "brad": { type: "DOMAIN-SUFFIX", mode: "PROXY-BRAD" },
        "copilot": { type: "DOMAIN-SUFFIX", mode: "PROXY-COPILOT" },
        "proxy": { type: "DOMAIN-SUFFIX", mode: "PROXY-BETTER" },
    }

    const source = {
        default: {
            path: "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/default rules",
            prefix: "default-",
            search: defaultSearch
        },
        customize: {
            path: "H:/OneDrive/Documents/Repositories/Proxy Rules/clash/customize rules",
            prefix: "customzie-",
            search: customizeSearch
        }
    }

    // const destination = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/rules";
    const url = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/shadowrocket/rules"

    const endStrRules = "GEOIP,LAN,DIRECT,no-resolve\n" +
        "GEOIP,CN,DIRECT,no-resolve\n" +
        "FINAL,FINAL-CHOOSE";

    // const fileContent = fs.readFileSync(output, 'utf-8');



    let defaultStrRules = "";
    let customizeStrRules = "";
    if (mode.default) {
        // do replace and copy and rename default
        // fs.readFile(path.resolve(mode.default));
        defaultStrRules = copyFolderSync(source.default, destination);
    }

    if (mode.customize) {
        // do replace and copy and rename  customize
        customizeStrRules = copyFolderSync(source.customize, destination);
    }

    const startStrRulse = customizeStrRules + defaultStrRules;

    function copyFolderSync(source, destination) {
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination);
        }

        const sourceFiles = fs.readdirSync(source.path);

        let startRules = "";

        sourceFiles.forEach(sourceFile => {
            if (sourceFile !== "timestamp.txt") {
                const sourcePath = path.join(source.path, sourceFile);
                const destinationPath = path.join(destination, source.prefix + sourceFile);

                if (fs.lstatSync(sourcePath).isDirectory()) {
                    copyFolderSync(sourcePath, destinationPath);
                } else {
                    const fileContent = fs.readFileSync(sourcePath, 'utf-8');

                    const fileName = sourceFile.replace(".yaml", "");
                    const modificationContent = fileContent
                        .replace(new RegExp(/^payload:\n/, "gm"), "")
                        .replace(new RegExp(/^.+?'\+\./, "gm"), source.search[fileName].type + ",")
                        .replace(new RegExp(/^  - '/, "gm"), source.search[fileName].type + ",")
                        .replace(new RegExp(/^.+?PROCESS-NAME,/, "gm"), source.search[fileName].type + ",")
                        .replace(new RegExp(/'$/, "gm"), "")
                        // .replace(new RegExp(/(?<=^[\d\w\.,-/:]+)$/, "gm"), "," + source.search[fileName].mode)
                        .replace(new RegExp(/  #/, "gm"), "#");
                    fs.writeFileSync(destinationPath, modificationContent, "utf-8");

                    startRules += "RULE-SET," + url + "/" + source.prefix + sourceFile + "," + source.search[fileName].mode + "\n"
                }
            }
        });
        return startRules;
    }

    const input = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/sr_rules_init.conf"
    const initContent = fs.readFileSync(input, 'utf-8');

    const output = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/sr_rules.conf";
    const outputContent = initContent.replace(new RegExp(/\[Rule\]/, "g"), "[Rule]\n" + startStrRulse + endStrRules)
    fs.writeFileSync(output, outputContent, "utf-8");
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