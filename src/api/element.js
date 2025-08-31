// 递归计算元素到页面顶部的偏移量
const fixTop = (el) => {
    let offset = el.offsetTop;
    if (el.offsetParent) {
        offset += fixTop(el.offsetParent);
    }
    return offset;
};

// 递归计算元素到页面左侧的偏移量
const fixLeft = (el) => {
    let offset = el.offsetLeft;
    if (el.offsetParent) {
        offset += fixLeft(el.offsetParent);
    }
    return offset;
};

// 设置页面标题（带可选提示）
const setTitleTip = (tip) => {
    let title = process.env.VUE_APP_NAME; // CLI 5 依旧用这种方式
    if (tip) {
        title = `(${tip})${title}`;
    }
    document.title = title;
};

export default {
    fixTop,
    fixLeft,
    setTitleTip
};
