const fs = require("fs");
const path = require("path");
const settings = require("./settings.json");

const NEW_LINE = "\n\n";

module.exports.output = () => {
  const mainCode = fs.readFileSync(path.resolve(__dirname, settings.main), "utf-8")
    .replace(/^.+require.+$\n/gm, "")
    .replace("module.exports.", "function ")
    .replace(" = (", "(")
    .replace(") =>", ")");
  const initializationCode = fs.readFileSync(path.resolve(__dirname, settings.initailizaion), "utf-8")
    .replace("module.exports.", "function ")
    .replace(" = (", "(")
    .replace(") =>", ")");

  let profileCode = "";
  const configs = fs.readdirSync(path.resolve(__dirname, settings.profiles));
  configs.forEach(fileName => {
    const profile = fs.readFileSync(path.resolve(__dirname, settings.profiles, fileName), "utf-8");
    profileCode += profile.replace("configuration", fileName.replace(".js", "")) + NEW_LINE;
  });
  profileCode = profileCode
    .replace(/module.exports\./gm, "const ");

  const initCode = fs.readFileSync(path.resolve(__dirname, settings.init), "utf-8") + NEW_LINE;

  const outputCode = mainCode + NEW_LINE +
    initializationCode + NEW_LINE +
    profileCode + NEW_LINE +
    initCode;

  fs.writeFileSync(path.resolve(__dirname, settings.output), outputCode, "utf-8");
  fs.writeFileSync(path.resolve(__dirname, settings.replace), outputCode, "utf-8");
}