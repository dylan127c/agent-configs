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