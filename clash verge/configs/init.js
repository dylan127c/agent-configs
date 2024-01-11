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
    const mode = [1, 1];
    return JSON.parse(get(
        console,
        params,
        mode,
        configuration));
}