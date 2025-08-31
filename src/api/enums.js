const MESSAGE_TYPE = {
    TEXT: 0,
    IMAGE: 1,
    FILE: 2,
    AUDIO: 3,
    VIDEO: 4,
    WITHDRAW: 10,
    READED: 11,
    TIP_TIME: 20,
    RTC_CALL: 101,
    RTC_ACCEPT: 102,
    RTC_REJECT: 103,
    RTC_CANCEL: 104,
    RTC_FAILED: 105,
    RTC_HANDUP: 106,
    RTC_CANDIDATE: 107
};

const USER_STATE = {
    OFFLINE: 0,
    FREE: 1,
    BUSY: 2
};

const TERMINAL_TYPE = {
    PC: 0,
    APP: 1,
    TABLET: 2,
    WEB: 3,
};

const MESSAGE_STATUS = {
    UNSEND: 0,
    SENDED: 1,
    WITHDRAW: 2,
    READED: 3
};

export {
    MESSAGE_TYPE,
    USER_STATE,
    TERMINAL_TYPE,
    MESSAGE_STATUS
};