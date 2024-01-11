const transform = () => {
  const fs = require('fs');
  const babel = require('./lib/node_modules/@babel/core');

  const inputPath = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash for windows/";
  const outputPath = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash verge/";

  const inputFile = inputPath + "configuration.js";
  const outputFile = outputPath + "clash-verge.js";

  const originalCode = fs.readFileSync(inputFile, 'utf-8');

  let constructCode = originalCode
    /* 移除所有注释。*/
    .replace(/^ *\/\*.*$\n/gm, "")
    .replace(/^ *\*.*$\n/gm, "")
    .replace(/(?<!:)\/\/.*$\n/gm, "")
    /* 将导出的模块函数替换为普通函数。*/
    .replace("module.exports.", "function ")
    .replace("= async ", "")
    .replace("=>", "");

  /* 需要移除的函数的名称。*/
  const functionsToRemove = [
    "parse",
    "getConfig",
    "outputStash",
    "outputShadowrocket",
    "getMode",
    "updateCheck",
    "updateRules",
    "updateTimestamp",
    "getFormatDate"
  ];

  const transformedCode = babel.transformSync(constructCode, {
    plugins: [
      function customPlugin() {
        return {
          visitor: {
            FunctionDeclaration(path) {
              // const node = path.node;
              // each path.remove() will change the path val into null.
              if (path.node.id && functionsToRemove.includes(path.node.id.name)) {
                path.remove();
              }
            }
          },
        };
      },
    ],
  }).code;

  const formatTransformedCode = transformedCode
    /* 格式化代码，在方法之间添加空行。*/
    .replace(/^function /gm, "\nfunction ")
    /* 移除 require 全局方法。*/
    .replace(/^.+require.+$\n/gm, "")
    /* 替换 __dirname 内置常量。*/
    .replace(/__dirname.+?(?=;)/gm, "\"" + inputPath + "\"");

  const newCodeFile = [inputPath + "config-on.js", inputPath + "config-cc.js", inputPath + "config-cl.js", outputPath + "init.js"];

  /* 读取必要的 .js 配置并合并在一起。*/
  let newCode = "";
  newCodeFile.forEach(file => {
    newCode = newCode + fs.readFileSync(file, "utf-8") + "\n\n";
  });
  newCode = newCode.replace(/module.exports\./gm, "const ");

  const outputCode = formatTransformedCode + "\n\n" + newCode;

  fs.writeFileSync(outputFile, outputCode, "utf-8");

  const autoReplaceConfigFile = "C:/Users/dylan/.config/clash-verge/profiles/sjWWJPGyS5p0.js";
  fs.writeFileSync(autoReplaceConfigFile, outputCode, "utf-8");
}

transform();