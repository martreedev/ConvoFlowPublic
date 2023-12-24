function parseText(str) {// function used to parse gpt responses
    // remove newline characters
    str = str.replace(/(\r\n|\n|\r)/gm, " ");
    str = str.replace(/^\?/, '');
    str = str.trimStart();
    return str;
}
export default parseText
