let websock = null;
let rec = null; // 断线重连定时器，断线重连后，延迟5秒重新创建WebSocket连接  rec用来存储延迟请求的代码
let isConnect = false; // 连接状态标识
let messageCallBack = null;
let closeCallBack = null;

const connect = (wsurl, accessToken) => {
    if (isConnect) return;
    console.log('尝试创建 WebSocket 连接:', wsurl);

    try {
        console.log('连接WebSocket');
        websock = new WebSocket(wsurl);

        websock.onmessage = (e) => {
            let sendInfo;
            // const sendInfo = JSON.parse(e.data);
            try {
                sendInfo = JSON.parse(e.data);
            } catch (parseError) {
                console.error('WebSocket 消息解析失败，非合法 JSON:', e.data);
                return;
            }
            if (sendInfo.systemInfo === 0) {
                // heartCheck.start();
                heartCheck.reset(); // 重置心跳
                console.log('WebSocket登录成功');
            } else if (sendInfo.systemInfo === 1) {
                // console.log('收到心跳响应');
                heartCheck.reset();
            } else {
                console.log('收到消息:', sendInfo);
                messageCallBack && messageCallBack(sendInfo.systemInfo, sendInfo.content);
            }
        };

        websock.onclose = (e) => {
            console.log('WebSocket连接关闭',e.code, e.reason);
            isConnect = false;
            websock = null;
            closeCallBack && closeCallBack(e);
            reconnect(wsurl, accessToken);
        };

        websock.onopen = () => {
            console.log('WebSocket连接成功');
            isConnect = true;

            try{
                const loginInfo = {
                    systemInfo: 0,
                    content: { accessToken }
                };
                websock.send(JSON.stringify(loginInfo));
                heartCheck.reset();
            }catch(sendError) {
                console.error('发送登录信息失败:', sendError);
            }
        };

        websock.onerror = () => {
            console.log('WebSocket连接发生错误');
            isConnect = false;
            // reconnect(wsurl, accessToken);
        };
    } catch (e) {
        console.log('尝试创建连接失败',e);
        // 如果无法连接上webSocket 那么重新连接！可能会因为服务器重新部署，或者短暂断网等导致无法创建连接
        reconnect(wsurl, accessToken);
    }
};

const reconnect = (wsurl, accessToken) => {
    console.log('尝试重新连接');
    if (isConnect) return;

    if (rec) clearTimeout(rec);
    rec = setTimeout(() => {
        connect(wsurl, accessToken);
    }, 15000);
};

const close = (code) => {
    websock && websock.close(code);
};

const heartCheck = {
    timeout: 5000,
    timeoutObj: null,

    start() {
        if (isConnect) {
            // console.log('发送WebSocket心跳');
            const heartBeat = {
                systemInfo: 1,
                content: {}
            };
            websock.send(JSON.stringify(heartBeat));
        }
    },

    reset() {
        clearTimeout(this.timeoutObj);
        this.timeoutObj = setTimeout(() => {
            this.start();
        }, this.timeout);
    }
};

const sendMessage = (agentData) => {
    if (websock?.readyState === WebSocket.OPEN) {
        websock.send(JSON.stringify(agentData));
    } else if (websock?.readyState === WebSocket.CONNECTING) {
        setTimeout(() => sendMessage(agentData), 1000);
    } else {
        setTimeout(() => sendMessage(agentData), 1000);
    }
};

const onMessage = (callback) => {
    messageCallBack = callback;
};

const onClose = (callback) => {
    closeCallBack = callback;
};

export {
    connect,
    reconnect,
    close,
    sendMessage,
    onMessage,
    onClose
};
