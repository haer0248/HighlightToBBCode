if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            const canvas = this;
            setTimeout(() => {
                const binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
                const len = binStr.length;
                const arr = new Uint8Array(len);

                for (let i = 0; i < len; i++) {
                    arr[i] = binStr.charCodeAt(i);
                }

                callback(new Blob([arr], { type: type || 'image/png' }));
            });
        }
    });
}

const elements = {
    preview: document.getElementById('preview'),
    input: document.getElementById('input'),
    bbcode: document.getElementById('bbcode'),
    tab: document.getElementById('tab'),
    lang: document.getElementById('lang'),
    langUse: document.getElementById('lang-use'),
    theme: document.getElementById('theme'),
    previewImages: document.getElementById('preview_images'),
    imgDownload: document.getElementById('imgdl')
};

const languageTranslations = {
    html: 'HTML',
    xml: 'XML',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'Sass',
    less: 'Less',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    jsx: 'JSX (React)',
    tsx: 'TSX (React TypeScript)',
    json: 'JSON',
    yaml: 'YAML',
    markdown: 'Markdown',
    php: 'PHP',
    python: 'Python',
    ruby: 'Ruby',
    java: 'Java',
    kotlin: 'Kotlin',
    scala: 'Scala',
    go: 'Go',
    rust: 'Rust',
    swift: 'Swift',
    objectivec: 'Objective-C',
    perl: 'Perl',
    lua: 'Lua',
    r: 'R',
    julia: 'Julia',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    vbnet: 'VB.NET',
    fsharp: 'F#',
    bash: 'Bash',
    shell: 'Shell',
    powershell: 'PowerShell',
    batch: 'Batch',
    sql: 'SQL',
    mysql: 'MySQL',
    postgresql: 'PostgreSQL',
    plsql: 'PL/SQL',
    haskell: 'Haskell',
    erlang: 'Erlang',
    elixir: 'Elixir',
    clojure: 'Clojure',
    scheme: 'Scheme',
    lisp: 'Lisp',
    ocaml: 'OCaml',
    dart: 'Dart',
    groovy: 'Groovy',
    coffeescript: 'CoffeeScript',
    assembly: 'Assembly',
    x86asm: 'x86 Assembly',
    armasm: 'ARM Assembly',
    django: 'Django Template',
    handlebars: 'Handlebars',
    pug: 'Pug',
    twig: 'Twig',
    ini: 'INI',
    toml: 'TOML',
    properties: 'Properties',
    nginx: 'Nginx Config',
    apache: 'Apache Config',
    dockerfile: 'Dockerfile',
    http: 'HTTP',
    https: 'HTTPS',
    latex: 'LaTeX',
    tex: 'TeX',
    diff: 'Diff',
    patch: 'Patch',
    makefile: 'Makefile',
    cmake: 'CMake',
    gradle: 'Gradle',
    vbscript: 'VBScript',
    applescript: 'AppleScript',
    graphql: 'GraphQL',
    protobuf: 'Protocol Buffers',
    fortran: 'Fortran',
    cobol: 'COBOL',
    delphi: 'Delphi',
    pascal: 'Pascal',
    matlab: 'MATLAB',
    verilog: 'Verilog',
    vhdl: 'VHDL',
    prolog: 'Prolog',
    ada: 'Ada',
    d: 'D',
    nim: 'Nim',
    crystal: 'Crystal',
    zig: 'Zig',
    v: 'V',
    solidity: 'Solidity',
    wasm: 'WebAssembly',
    stylus: 'Stylus'
};

function convertColorToHex(colorString) {
    const matches = colorString.match(/\d+/gi);
    const alpha = matches.length === 4 ? parseFloat(matches[3]) : 1;

    const r = Math.round(parseInt(matches[0], 10) * alpha + (1 - alpha) * 255);
    const g = Math.round(parseInt(matches[1], 10) * alpha + (1 - alpha) * 255);
    const b = Math.round(parseInt(matches[2], 10) * alpha + (1 - alpha) * 255);

    return '#' +
        ('0' + r.toString(16)).substr(-2) +
        ('0' + g.toString(16)).substr(-2) +
        ('0' + b.toString(16)).substr(-2);
}

String.prototype.escapeHtml = function () {
    return this.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

function getMaxColorValue(colorString) {
    const matches = colorString.match(/\d+/gi);
    const alpha = matches.length === 4 ? parseFloat(matches[3]) : 1;
    const max = Math.max(
        parseInt(matches[0], 10),
        parseInt(matches[1], 10),
        parseInt(matches[2], 10)
    );
    return max * alpha + 255 * (1 - alpha);
}

function getColorStyle(className) {
    const tempPre = document.createElement('pre');
    tempPre.className = className;
    document.body.appendChild(tempPre);

    const computedStyle = getComputedStyle(tempPre, null);
    const textColor = computedStyle.color;
    const bgColor = computedStyle.backgroundColor;

    const result = {
        type: getMaxColorValue(textColor) < getMaxColorValue(bgColor) ? 0 : 1,
        bgcolor: bgColor
    };

    document.body.removeChild(tempPre);
    return result;
}
function onChangeTab() {
    const tabSize = parseInt(elements.tab.value, 10);
    const tabReplacement = ' '.repeat(tabSize);

    hljs.configure({
        tabReplace: tabReplacement
    });

    refreshOutput();
}

const onThemeChange = (() => {
    const originalClassName = elements.preview.parentElement.className;

    return function () {
        const selectedTheme = elements.theme.options[elements.theme.selectedIndex];
        const themePrefix = selectedTheme.innerHTML;

        elements.preview.parentElement.className = `${themePrefix} ${originalClassName}`;

        hljs.configure({
            classPrefix: `${themePrefix}-`
        });

        refreshOutput();
    };
})();

function refreshOutput() {
    const inputValue = hljs.fixMarkup(elements.input.value);
    let result;

    if (elements.lang.value === 'auto') {
        result = hljs.highlightAuto(inputValue);
    } else {
        result = hljs.highlight(elements.lang.value, inputValue, true);
    }

    const translatedLang = languageTranslations[result.language] || result.language;
    elements.langUse.textContent = translatedLang;
    elements.preview.className = result.language;
    elements.preview.innerHTML = result.value;
}

function getBBCode(element, backgroundColor, useTable) {
    if (element.firstChild === null) {
        return 'null';
    }

    const computedStyle = window.getComputedStyle(element, null);
    const bgColor = convertColorToHex(backgroundColor);
    const textColor = convertColorToHex(computedStyle.color);

    let output = '';

    if (useTable === 1) {
        output = `[table width=98% cellspacing=1 border=1][tr][td bgcolor=${bgColor}][font=Courier New][size=2][color=${textColor}]`;
    } else {
        output = `[bgcolor=${bgColor}][font=Courier New][size=2][color=${textColor}]`;
    }

    const closingTags = useTable === 1
        ? '[/size][/font][/td][/tr][/table]'
        : '[/size][/font][/bgcolor]';

    const stack = [{
        nodes: element.childNodes,
        idx: 0,
        endTag: closingTags
    }];

    while (stack.length > 0) {
        const top = stack[stack.length - 1];

        if (top.idx === top.nodes.length) {
            output += top.endTag;
            stack.pop();
            continue;
        }

        const node = top.nodes[top.idx++];

        switch (node.nodeType) {
            case Node.TEXT_NODE:
                output += node.nodeValue.replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
                break;

            case Node.ELEMENT_NODE:
                const nodeStyle = window.getComputedStyle(node, null);
                const nodeColor = convertColorToHex(nodeStyle.color);

                let openTags = `[color=${nodeColor}]`;
                let closeTags = '[/color]';

                if (nodeStyle.fontStyle.toLowerCase() === 'italic') {
                    openTags += '[i]';
                    closeTags = '[/i]' + closeTags;
                }

                if (parseInt(nodeStyle.fontWeight) > 550) {
                    openTags += '[b]';
                    closeTags = '[/b]' + closeTags;
                }

                output += openTags;
                stack.push({
                    nodes: node.childNodes,
                    idx: 0,
                    endTag: closeTags
                });
                break;
        }
    }

    return output;
}

class TSpanManager {
    constructor() {
        this.newLine = true;
        this.y = 0;
        this.dy = 20;
        this.styleStack = [];
    }

    pushStyle(element) {
        const computedStyle = window.getComputedStyle(element, null);

        this.styleStack.push({
            color: convertColorToHex(computedStyle.color),
            italic: computedStyle.fontStyle.toLowerCase() === 'italic' ? ';font-style:italic' : '',
            bold: parseInt(computedStyle.fontWeight) > 550 ? ';font-weight:bold' : ''
        });
    }

    popStyle() {
        if (this.styleStack.length > 0) {
            this.styleStack.pop();
        }
    }

    getStyle() {
        return this.styleStack.length > 0
            ? this.styleStack[this.styleStack.length - 1]
            : null;
    }

    writeText(text) {
        const lines = text.split('\n');
        let output = '';
        const style = this.getStyle();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (this.newLine) {
                this.y += this.dy;
                output += `<text x='0' y='${this.y}' style='font-size:16px;font-family:Courier New' xml:space='preserve'>`;
                this.newLine = false;
            }

            output += `<tspan style='fill:${style.color}${style.italic}${style.bold}'>${line.escapeHtml()}</tspan>`;

            if (i < lines.length - 1) {
                output += '</text>\n';
                this.newLine = true;
            }
        }

        return output;
    }
}

function getSvg(element, backgroundColor) {
    if (element.firstChild === null) {
        return 'null';
    }

    const tspan = new TSpanManager();
    const bgColor = convertColorToHex(backgroundColor);

    let output = `<svg xmlns="http://www.w3.org/2000/svg" style="background-color:${bgColor}"><g>\n`;

    const stack = [{
        nodes: element.childNodes,
        idx: 0,
        endTag: '</g></svg>'
    }];

    tspan.pushStyle(element);

    while (stack.length > 0) {
        const top = stack[stack.length - 1];

        if (top.idx === top.nodes.length) {
            output += top.endTag;
            stack.pop();
            tspan.popStyle();
            continue;
        }

        const node = top.nodes[top.idx++];

        switch (node.nodeType) {
            case Node.TEXT_NODE:
                output += tspan.writeText(node.nodeValue);
                break;

            case Node.ELEMENT_NODE:
                tspan.pushStyle(node);
                stack.push({
                    nodes: node.childNodes,
                    idx: 0,
                    endTag: ''
                });
                break;
        }
    }

    return output.replace('</tspan></svg>', '</tspan><text></svg>');
}

function createCanvasFromSvg(svgString, callback) {
    const div = document.createElement('div');
    div.style.cssText = 'width:0; height:0; box-sizing:content-box; overflow:hidden';
    document.body.appendChild(div);
    div.innerHTML = svgString;

    const svg = div.children[0];
    const bbox = svg.children[0].getBBox();

    svg.setAttributeNS(null, 'width', bbox.width + 16);
    svg.setAttributeNS(null, 'height', bbox.height + 16);
    svg.setAttributeNS(null, 'viewBox', [
        bbox.x - 8,
        bbox.y - 8,
        bbox.width + 16,
        bbox.height + 16
    ].join(' '));

    const blob = new Blob([div.innerHTML], { type: 'image/svg+xml' });
    const img = new Image();

    img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        div.removeChild(svg);
        div.appendChild(canvas);

        callback(canvas, div);
    };

    img.src = URL.createObjectURL(blob);
}

function clearContent() {
    elements.input.value = '';
    refreshOutput();
}

function confirmClear() {
    if (confirm('清除全部？')) {
        clearContent();
    }
}

function copyBBC(useTable) {
    const selectedTheme = elements.theme.options[elements.theme.selectedIndex];
    const bbcodeText = getBBCode(elements.preview, selectedTheme.dataset.bgcolor, useTable);

    if (bbcodeText === 'null') {
        alert('請輸入文字。');
        return;
    }

    elements.bbcode.value = bbcodeText;
    elements.bbcode.select();
    document.execCommand('copy');

    localStorage.setItem('theme', selectedTheme.innerHTML);

    const button = event.target;
    const originalText = button.innerHTML;
    const originalClass = button.className;

    button.innerHTML = '✓ 已複製至剪貼簿！';
    button.disabled = true;
    button.className = originalClass + ' copied';

    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        button.className = originalClass;
    }, 2000);
}

function getImg() {
    if (elements.input.value.length === 0) {
        alert('請輸入文字。');
        return;
    }

    const selectedTheme = elements.theme.options[elements.theme.selectedIndex];
    const svgString = getSvg(elements.preview, selectedTheme.dataset.bgcolor);
    const timestamp = getFormattedDate();

    createCanvasFromSvg(svgString, (canvas, div) => {
        canvas.toBlob((blob) => {
            elements.imgDownload.download = `code-${timestamp}.png`;
            elements.imgDownload.href = URL.createObjectURL(blob);
            elements.imgDownload.click();
            document.body.removeChild(div);
        });
    });

    localStorage.setItem('theme', selectedTheme.innerHTML);
}

function getFormattedDate() {
    var date = new Date();

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    return date.getFullYear() + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec;
}

function toImg() {
    if (elements.input.value.length === 0) {
        alert('請輸入文字。');
        return;
    }

    const selectedTheme = elements.theme.options[elements.theme.selectedIndex];
    const svgString = getSvg(elements.preview, selectedTheme.dataset.bgcolor);

    const button = event.target;
    const originalText = button.innerHTML;
    const originalClass = button.className;

    button.innerHTML = '處理中...';
    button.disabled = true;

    createCanvasFromSvg(svgString, (canvas, div) => {
        canvas.toBlob((blob) => {
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    button.innerHTML = '✓ 已複製至剪貼簿！';
                    button.className = originalClass + ' copied';

                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.disabled = false;
                        button.className = originalClass;
                    }, 2000);
                }).catch((err) => {
                    console.error('複製時發生錯誤', err);
                    showImageModal(blob);
                    button.innerHTML = originalText;
                    button.disabled = false;
                });
            } else {
                showImageModal(blob);
                button.innerHTML = originalText;
                button.disabled = false;
            }

            document.body.removeChild(div);
        });
    });
}

function showImageModal(blob) {
    const imageUrl = URL.createObjectURL(blob);
    elements.previewImages.innerHTML = `
        <img src="${imageUrl}" style="width: 90%;" alt="Code Preview"/>
        <p class="text-warning mt-2">您的瀏覽器不支援自動複製圖片，請右鍵點擊圖片選擇「複製圖片」</p>
    `;

    const modal = new bootstrap.Modal(document.getElementById('preimg'));
    modal.show();
}

function initialize() {
    const languages = hljs.listLanguages().sort();

    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.innerHTML = languageTranslations[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
        elements.lang.appendChild(option);
    });

    const brightThemes = [];
    const darkThemes = [];

    theme_data.css.forEach(themeName => {
        const style = getColorStyle(themeName);
        const themeData = [themeName, style.bgcolor];

        if (style.type === 0) {
            brightThemes.push(themeData);
        } else {
            darkThemes.push(themeData);
        }
    });

    let option = document.createElement('option');
    option.innerHTML = '亮系風格';
    option.disabled = true;
    elements.theme.appendChild(option);

    brightThemes.forEach(([name, bgcolor]) => {
        const opt = document.createElement('option');
        opt.dataset.bgcolor = bgcolor;
        opt.innerHTML = name;
        elements.theme.appendChild(opt);
    });

    option = document.createElement('option');
    option.innerHTML = '暗系風格';
    option.disabled = true;
    elements.theme.appendChild(option);

    darkThemes.forEach(([name, bgcolor]) => {
        const opt = document.createElement('option');
        opt.dataset.bgcolor = bgcolor;
        opt.innerHTML = name;
        elements.theme.appendChild(opt);
    });

    elements.theme.selectedIndex = 1;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        const options = Array.from(elements.theme.options);
        const savedIndex = options.findIndex(opt => opt.innerHTML === savedTheme);

        if (savedIndex >= 0) {
            elements.theme.selectedIndex = savedIndex;
        }
    }

    onThemeChange();
    onChangeTab();
    refreshOutput();
}
elements.input.addEventListener('change', refreshOutput);
elements.input.addEventListener('keyup', refreshOutput);
elements.tab.addEventListener('change', onChangeTab);
elements.lang.addEventListener('change', refreshOutput);
elements.theme.addEventListener('change', onThemeChange);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}