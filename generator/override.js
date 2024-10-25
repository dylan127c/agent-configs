function main(config) { // *.保留这部分以保证原本的覆写功能不受影响
  return config
}

/**
 * 以下为分组配置格式，将此覆写链接到指定的订阅上，程序会自动读取这些配置。
 */
const GROUP = [
  { name: "HK", type: "url-test", filter: "HKG", interval: 300, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png" },
  { name: "SG", type: "url-test", filter: "SGP", interval: 300, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png" },
  { name: "TW", type: "url-test", filter: "TWN", interval: 300, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Taiwan.png" },
  { name: "JP", type: "url-test", filter: "JPN", interval: 300, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png" },
  { name: "US", type: "url-test", filter: "USA", interval: 300, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png" },
  { name: "KR", type: "url-test", filter: "KOR", interval: 300, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png" },
];

module.exports = {
  GROUP
};