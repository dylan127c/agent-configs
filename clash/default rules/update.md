由于国内网络原因，远程规则 REMOTE RULES 在应用过程中，经常出现无法获取的现象。如果 Clash for Windows 无法正确获取远程规则，那么相应的配置也无法使用。

更特殊地，即便 Clash for Windows 开启了 TUN 模式，也是无法解决规则无法获取时的网络故障。

因此默认情况下，本配置的 Clash for Windows 会优先使用本地的 customize rules 和 remote rules 目录中的规则文件。其中 remote rules 目录中的文件是下载自远程服务器的，规则来自 [clash-rules](https://github.com/Loyalsoldier/clash-rules) 项目。

该远程 remote rules 目录中添加了用于更新规则的 update.bat 文件，使用它需要提供代理：

```bash
@echo off

echo [--- FILE UPDATING ---] && echo.

curl -x "http://127.0.0.1:13766" ^
-o "direct.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/direct.txt" ^
-o "proxy.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/proxy.txt" ^
-o "reject.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/reject.txt" ^
-o "private.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/private.txt" ^
-o "apple.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/apple.txt" ^
-o "icloud.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/icloud.txt" ^
-o "gfw.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/gfw.txt" ^
-o "greatfire.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/greatfire.txt" ^
-o "tld-not-cn.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/tld-not-cn.txt" ^
-o "telegramcidr.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/telegramcidr.txt" ^
-o "lancidr.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/lancidr.txt" ^
-o "cncidr.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/cncidr.txt" ^
-o "applications.yaml" "https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/applications.txt"

echo. && echo [--- UPDATE FINISH. ---] && echo.

pause && exit
```

更新远程规则时，将代理端口修改为为本地代理端口即可。由于远程规则实际不常更新，更推荐手动使用 update.bat 的方式更新规则。

如果网络允许，可以将 clash 目录中 settings.ymal 内的 disableHttp 修改为 false 参数：

```yaml
# DEFAULT VARIABLE IS TRUE
disableHttp: false
```

这样远程规则将直接通过 HTTPS 请求下载，并不再应用本地预下载的远程规则。