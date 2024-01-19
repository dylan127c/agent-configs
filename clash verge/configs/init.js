function main(params) {
    let configuration;
    const count = params["proxy-groups"].length
    if (count === 11) {
        configuration = orient;
    } else if (count === 15) {
        configuration = kele;
    } else if (count === 3) {
        configuration = clover;
    }
    let mode = {
        originalStatus: true,
        additionStatus: true
    }

    /* WHITELIST MODE REVERSE DEFAULT GROUP FOR MATCH RULES */
    const provisional = configuration();
    provisional.groups.forEach(element => {
        if (element.name.match("规则逃逸")) {
            const reversed = element.proxies.reverse();
            element.proxies = reversed;
        }
    });

    const generateConfiguration = generate(console, mode, params, provisional);
    nameReplacer(generateConfiguration, provisional);
    return generateConfiguration;
}

function nameReplacer(configuraion, modifiedParams) {
    const replacementMap = modifiedParams.replacement;
    if (replacementMap) {
        configuraion.proxies.forEach(proxy => {
            proxy.name = replacement(proxy.name, replacementMap);
        });
        configuraion["proxy-groups"].forEach(group => {
            const replacedArray = group.proxies.map(name => {
                return replacement(name, replacementMap);
            })
            group.proxies = replacedArray;
        })
    }
}

function replacement(str, map) {
    if (!str.match(/\d\d/gm)) {
        return str;
    }
    for (const [search, replace] of Object.entries(map)) {

        if (search.includes("/gm")) {
            str = str.replace(eval(search), replace);
        } else {
            str = str.replace(search, replace);
        }
    }
    return str;
}