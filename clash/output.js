module.exports.run = (yaml, rawAfter) => {
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
    rules: configuration.rules,
    "proxy-groups": stashProxyGroups,
    "rule-providers": configuration["rule-providers"]
  });

  const outputFinal = outputStr
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


