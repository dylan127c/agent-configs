const SOURCE_PATH = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash for windows/";
const DESTINATION_PATH = "H:/OneDrive/Documents/Repositories/Proxy Rules/shadowrocket/";
const URL = "https://raw.githubusercontent.com/dylan127c/proxy-rules/main/shadowrocket/rules/"

const RULE_FOLDER = DESTINATION_PATH + "rules";
const SOURCES = [
    {
        path: SOURCE_PATH + "default rules",
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
        path: SOURCE_PATH + "customize rules",
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
const REPLACELIST = {
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

/**
 * 
 * @param {*} yaml YAML框架
 * @param {*} rawAfter 已处理完毕的配置信息
 * @param {object} console 控制台调试对象
 */
module.exports.runShadowrocket = (yaml, rawAfter, console) => {

    updateCheckShadowrocket(console);

    console.log("[ INFO] output-shadowrocket.runShadowrocket =>", "Start output shadowrocket config.");
    const configuration = yaml.parse(rawAfter);

    let symbol = "on";

    const initProxyGroups = Object.assign(configuration["proxy-groups"]);
    const index = initProxyGroups.findLastIndex(ele => ele.name.includes("订阅详情"));
    if (index >= 0) {
        initProxyGroups.splice(index, 1);
        symbol = "cc";
    }

    let shadowrocketRule = "[Rule]\n";
    configuration.rules.forEach(ele => {
        if (ele.includes("RULE-SET")) {
            shadowrocketRule += ele.replace(/RULE-SET,/gm, "RULE-SET," + URL)
                .replace(/(?<!T),(?!n)/gm, ".list,") + "\n";
        } else {
            shadowrocketRule += ele + "\n"
        }
    });
    console.log("[ INFO] output-shadowrocket.runShadowrocket =>", "Rule constructed.");

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
    console.log("[ INFO] output-shadowrocket.runShadowrocket =>", "Proxy Group constructed.");

    /*
     * Shadowrocket中规则集已经和规则融合在一起了，只要规则和分组详情获取完毕，就可以输出到文件。
     * 
     * 目录下存在一个初始的配置文件：sr_rules_init.conf。
     * 通过覆盖初始配置文件的[Rule]和[Proxy Group]内容，即可得到最终的Shadowrocket配置文件。
     */
    const inputFileName = "sr_rules_init.conf";
    const inputFilePath = DESTINATION_PATH + inputFileName;

    const outputFileName = "sr_rules_" + symbol + ".conf"
    const outputFilePath = DESTINATION_PATH + outputFileName;

    const fs = require("fs");
    try {
        const inputContent = fs.readFileSync(inputFilePath, 'utf-8');
        console.log("[ INFO] output-shadowrocket.runShadowrocket =>",
            "Shadowrocket config", inputFileName, "has been inputted.");
        const outputContent = inputContent
            .replace(/\[Rule\]/g, shadowrocketRule)
            .replace(/\[Proxy Group\]/g, shadowrocketProxyGroup);
        fs.writeFileSync(outputFilePath, outputContent, "utf-8");
        console.log("[ INFO] output-shadowrocket.runShadowrocket =>",
            "Shadowrocket config", outputFileName, "has been outputted.");
    } catch (error) {
        console.log("[ERROR] output-shadowrocket.runShadowrocket =>", error);
    }
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
function updateCheckShadowrocket(console) {
    const fs = require("fs");
    const path = require("path");

    try {
        const data = fs.readFileSync(path.resolve(RULE_FOLDER, "..", "rule-timestamp.log"), "utf-8");
        const savedTimestamp = parseInt(data);
        const currentTimestamp = Date.now();

        const intervalInHours = (currentTimestamp - savedTimestamp) / (1000 * 60 * 60);
        if (intervalInHours >= 168) {
            console.log("[ INFO] output-shadowrocket.updateCheckShadowrocket =>",
                "Start transform rules.");
            transformClashRules(console);
        } else {
            console.log("[ INFO] output-shadowrocket.updateCheckShadowrocket =>",
                "Update time has not arrived yet.",
                "Last updated:", getFormatDate(new Date(savedTimestamp)));
        }
    } catch (error) {
        console.log("[ INFO] output-shadowrocket.updateCheckShadowrocket =>", "Init rules.");
        transformClashRules(console);
    }
}

function transformClashRules(console) {
    const fs = require("fs");
    const path = require("path");

    console.log("[ INFO] output-shadowrocket.transformClashRules =>", "Start transform rule files.")
    if (!fs.existsSync(RULE_FOLDER)) {
        fs.mkdirSync(RULE_FOLDER);
    }
    SOURCES.forEach(source => {
        if (!fs.existsSync(source.path)) {
            console.log("[ERROR] output-shadowrocket.transformClashRules =>",
                "Specified rules directory doesn't exist.");
            console.log("[ERROR] output-shadowrocket.transformClashRules =>",
                source.path);
            console.log("[ERROR] output-shadowrocket.transformClashRules =>",
                "Current transformation discarded.");
            return;
        }
        const sourceFiles = fs.readdirSync(source.path);
        sourceFiles.forEach(sourceFile => {
            if (sourceFile !== "timestamp.txt") {
                const inputPath = path.join(source.path, sourceFile);
                const outputPath = path.join(RULE_FOLDER, source.prefix + sourceFile.replace(/\..+$/gm, "") + ".list");

                if (fs.lstatSync(inputPath).isDirectory()) {
                    copyFolderSync(inputPath, outputPath);
                } else {
                    let fileContent = fs.readFileSync(inputPath, "utf-8");
                    const fileName = sourceFile.replace(/\..+$/gm, "");
                    for (const [search, replace] of Object.entries(REPLACELIST[source.search[fileName]])) {
                        fileContent = fileContent.replace(new RegExp(search, "gm"), replace);
                    }
                    fs.writeFileSync(outputPath, fileContent, "utf-8");
                }
            }
        });
    });
    console.log("[ INFO] output-shadowrocket.transformClashRules =>", "Rule files transformed.")
    updateTimestamp(console);
}

/**
 * 本方法用于更新时间戳rule-timestamp.log文件。
 * 
 * 当Date对象调用toString方法时，JS会根据实际运行环境来转换时间戳，得到符合当前时区的日期字符串。
 * 
* @param {object} console 控制台调试对象
*/
function updateTimestamp(console) {
    const fs = require("fs");
    const path = require("path");

    const currentTimestamp = Date.now();
    try {
        fs.writeFileSync(
            path.resolve(RULE_FOLDER, "..", "rule-timestamp.log"),
            currentTimestamp.toString(),
            "utf-8"
        );
        console.log("[ INFO] output-shadowrocket.updateTimestamp =>",
            "Shadowrocket timestamp has been updated:", getFormatDate(new Date(currentTimestamp)));
    } catch (error) {
        console.log("[ERROR] output-shadowrocket.updateTimestamp =>",
            "Shadowrocket timestamp update failure:", err);
    }
}

function getFormatDate(date) {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Shanghai'
    }).format(date);
}