const emoTextList = [
    '憨笑', '媚眼', '开心', '坏笑', '可怜', '爱心', '笑哭', '拍手', '惊喜', '打气',
    '大哭', '流泪', '饥饿', '难受', '健身', '示爱', '色色', '眨眼', '暴怒', '惊恐',
    '思考', '头晕', '大吐', '酷笑', '翻滚', '享受', '鼻涕', '快乐', '雀跃', '微笑',
    '贪婪', '红心', '粉心', '星星', '大火', '眼睛', '音符', '叹号', '问号', '绿叶',
    '燃烧', '喇叭', '警告', '信封', '房子', '礼物', '点赞', '举手', '拍手', '点头',
    '摇头', '偷瞄', '庆祝', '疾跑', '打滚', '惊吓', '起跳'
];

// 将内容中符合格式的表情文本转换成图片标签
const transform = (content) => {
    return content.replace(/#[\u4E00-\u9FA5]{1,3};/gi, textToImg);
};

// 将匹配到的表情文本转换成 <img> 标签
const textToImg = (emoText) => {
    const word = emoText.replace(/[#;]/gi, '');
    const idx = emoTextList.indexOf(word);
    if (idx === -1) {
        return emoText;
    }
    // require 语法保持不变，适用于 Vue CLI
    const url = require(`@/assets/emoji/${idx}.gif`);
    return `<img src="${url}" style="width:35px; height:35px; vertical-align:bottom;" />`;
};

// 获取表情对应的图片路径
const textToUrl = (emoText) => {
    const word = emoText.replace(/[#;]/gi, '');
    const idx = emoTextList.indexOf(word);
    if (idx === -1) {
        return '';
    }
    const url = require(`@/assets/emoji/${idx}.gif`);
    return url;
};

export default {
    emoTextList,
    transform,
    textToImg,
    textToUrl
};
