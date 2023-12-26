/**
 * 本方法用于输出 Stash 配置文件。
 * 
 * @async
 * @param {object} yaml yaml 框架
 * @param {string} rawAfter 已处理完毕的配置信息
 * @param {object} console 控制台调试对象
 */
module.exports.runStash = (yaml, rawAfter, console) => {

    console.log("[ INFO] output-stash.runStash =>", "Start output stash config.");
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