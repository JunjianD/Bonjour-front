// 判断是否是昨天
const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        yesterday.getFullYear() === date.getFullYear() &&
        yesterday.getMonth() === date.getMonth() &&
        yesterday.getDate() === date.getDate()
    );
};

// 判断是否是今年
const isThisYear = (date) => {
    return date.getFullYear() === new Date().getFullYear();
};

// 格式化日期时间
const formatDateTime = (date) => {
    if (!date) return '';

    const dateObject = new Date(date);
    const y = dateObject.getFullYear();
    const m = String(dateObject.getMonth() + 1).padStart(2, '0');
    const d = String(dateObject.getDate()).padStart(2, '0');
    const h = String(dateObject.getHours()).padStart(2, '0');
    const minute = String(dateObject.getMinutes()).padStart(2, '0');
    const second = String(dateObject.getSeconds()).padStart(2, '0');

    return `${y}/${m}/${d} ${h}:${minute}:${second}`;
};

// 时间戳转可读文本
const toTimeText = (timeStamp, simple = false) => {
    const dateTime = new Date(timeStamp);
    const currentTime = Date.now();
    const timeDiff = currentTime - dateTime.getTime();

    if (timeDiff <= 60_000) {
        return '刚刚';
    } else if (timeDiff < 3_600_000) {
        //1小时内
        return `${Math.floor(timeDiff / 60_000)}分钟前`;
    } else if (timeDiff < 86_400_000 && !isYesterday(dateTime)) {
        //今日
        return formatDateTime(dateTime).substring(11, 16);
    } else if (isYesterday(dateTime)) {
        //昨天
        return `昨天${formatDateTime(dateTime).substring(11, 16)}`;
    } else if (isThisYear(dateTime)) {
        //今年
        return formatDateTime(dateTime).substring(5, simple ? 10 : 19);
    } else {
        //不属于今年
        let text = formatDateTime(dateTime);
        return simple ? text.substring(2, 5) : text;
    }
};

export {
    toTimeText,
    isYesterday,
    isThisYear,
    formatDateTime
};
