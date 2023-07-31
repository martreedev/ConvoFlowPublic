function parseText(str) {
    // remove newline characters
    str = str.replace(/(\r\n|\n|\r)/gm, " ");
    str = str.replace(/^\?/, '');
    str = str.trimStart();
    return str;
}
export default parseText
