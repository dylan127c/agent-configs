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
    return JSON.parse(generate(
        console,
        mode,
        params,
        configuration()));
}