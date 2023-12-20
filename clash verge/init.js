function main(params) {

    let configuration;
    const count = params["proxy-groups"].length
    if (count === 11) {
        configuration = configurationOn;
    } else if (count === 15) {
        configuration = configurationCc;
    }
    const mode = [1, 1];
    return JSON.parse(get(
        console,
        params,
        mode,
        configuration));
}