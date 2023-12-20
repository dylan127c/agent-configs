const transform = () => {
  const fs = require('fs');
  const babel = require('./lib/node_modules/@babel/core');

  const autoReplaceConfigFile = "C:/Users/dylan/.config/clash-verge/profiles/sYIbECUXS8H8.js";

  const inputPath = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash for windows/";
  const outputPath = "H:/OneDrive/Documents/Repositories/Proxy Rules/clash verge/";

  const inputFile = inputPath + "configuration.js";
  const outputFile = outputPath + "clash-verge.js";

  const newCodeFile = [inputPath + "config-on.js", inputPath + "config-cc.js", outputPath + "init.js"];

  let newCode = "";
  newCodeFile.forEach(file => {
    newCode = newCode + fs.readFileSync(file, "utf-8") + "\n\n";
  });
  newCode = newCode.replace(/module.exports\./gm, "const ");

  const originalCode = fs.readFileSync(inputFile, 'utf-8');
  const noCommnetCode = originalCode
    .replace(/^ *\/\*.*$\n/gm, "")
    .replace(/^ *\*.*$\n/gm, "")
    .replace(/(?<!:)\/\/.*$\n/gm, "");
  const noModuleExportsCode = noCommnetCode
    .replace("module.exports.", "function ")
    .replace("= async ", "")
    .replace("=>", "");

  const transformedCode = babel.transformSync(noModuleExportsCode, {
    plugins: [
      function customPlugin() {
        return {
          visitor: {
            FunctionDeclaration(path) {
              // const node = path.node;
              // each path.remove() will change the path val into null.

              if (path.node.id && path.node.id.name === 'parse') {
                path.remove();
              } else if (path.node.id && path.node.id.name === 'getConfig') {
                path.remove();
              } else if (path.node.id && path.node.id.name === 'outputStash') {
                path.remove();
              } else if (path.node.id && path.node.id.name === 'outputShadowrocket') {
                path.remove();
              } else if (path.node.id && path.node.id.name === 'getMode') {
                path.remove();
              } else if (path.node.id && path.node.id.name === 'updateCheck') {
                path.remove();
              } else if (path.node.id && path.node.id.name === 'updateRules') {
                path.remove();
              } else if (path.node.id && path.node.id.name === 'updateTimestamp') {
                path.remove();
              } else if (path.node.id && path.node.id.name === 'getFormatDate') {
                path.remove();
              }
            }
          },
        };
      },
    ],
  }).code;

  const formatTransformedCode = transformedCode.replace(/^function /gm, "\nfunction ");
  const outputCode = formatTransformedCode + "\n\n" + newCode;

  // console.log(formatTransformedCode);
  fs.writeFileSync(outputFile, outputCode, "utf-8");
  fs.writeFileSync(autoReplaceConfigFile, outputCode, "utf-8");
}
transform();