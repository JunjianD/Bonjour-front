import http from '../api/httpRequest.js'
import {TERMINAL_TYPE} from "../api/enums.js"

export default {

    state: {
        friends: [],
        activeFriend: null,
        timer: null
    },
    // friend:{id, nickName, headImage}
    mutations: {
        setFriends(state, friends) {
            state.friends = friends;
        },
        updateFriend(state, friend) {
            state.friends.forEach((f, index) => {
                if (f.id == friend.id) {
                    // 拷贝属性
                    let online = state.friends[index].online;
                    Object.assign(state.friends[index], friend);
                    state.friends[index].online = online;
                }
            })
        },
        activeFriend(state, idx) {
            state.activeFriend = state.friends[idx];
        },
        removeFriend(state, idx) {
            if (state.friends[idx] == state.activeFriend) {
                state.activeFriend = null;
            }
            state.friends.splice(idx, 1);
        },
        addFriend(state, friend) {
            state.friends.push(friend);
        },
        // refreshOnlineStatus(state){
        // 	let userIds = [];
        // 	if(state.friends.length ==0){
        // 		return;
        // 	}
        // 	state.friends.forEach((f)=>{userIds.push(f.id)});
        // 	http({
        // 		url: '/user-server/user/terminal/online',
        // 		method: 'get',
        // 		params: {userIds: userIds.join(',')}
        // 	}).then((onlineTerminals) => {
        //         // list({userId,terminalIds})
        // 		this.commit("setOnlineStatus",onlineTerminals);
        // 	}).catch(err => {
        //         console.error('refreshOnlineStatus | 获取在线状态失败:', err);
        //     }).finally(() =>{
        //         // 30s后重新拉取
        //         clearTimeout(state.timer);
        //         state.timer = setTimeout(()=>{
        //             this.commit("refreshOnlineStatus");
        //         },30000)
        //         }
        //     )
        // },
        setOnlineStatus(state, onlineTerminals) {
            state.friends.forEach((f) => {
                // 得到单个满足条件的对象：{userId,terminalIds}
                let userTerminal = onlineTerminals.find((o) => f.id == o.userId);
                if (userTerminal) {
                    f.online = true;
                    f.onlineTerminals = userTerminal.terminalIds;
                    f.onlineWeb = userTerminal.terminalIds.indexOf(TERMINAL_TYPE.WEB) >= 0
                    f.onlineApp = userTerminal.terminalIds.indexOf(TERMINAL_TYPE.APP) >= 0
                } else {
                    f.online = false;
                    f.onlineTerminals = [];
                    f.onlineWeb = false;
                    f.onlineApp = false;
                }
            });
            // 在线的在前面
            state.friends.sort((f1, f2) => {
                if (f1.online && !f2.online) {
                    return -1;
                }
                if (f2.online && !f1.online) {
                    return 1;
                }
                return f1.nickName.localeCompare(f2.nickName, undefined, { sensitivity: 'base' });
                // return 0;
            });
        },
        updateSingleOnlineStatus(state, {friendId, onlineTerminals}) {
            const friend = state.friends.find(f => f.id == friendId);
            if (onlineTerminals.length == 0) {
                friend.online = false;
                friend.onlineTerminals = [];
                friend.onlineWeb = false;
                friend.onlineApp = false;
            }else{
                let userTerminal = onlineTerminals[0];
                friend.online = true;
                friend.onlineTerminals = userTerminal.terminalIds;
                friend.onlineWeb = userTerminal.terminalIds.indexOf(TERMINAL_TYPE.WEB) >= 0
                friend.onlineApp = userTerminal.terminalIds.indexOf(TERMINAL_TYPE.APP) >= 0
            }

            // 在线的在前面
            state.friends.sort((f1, f2) => {
                if (f1.online && !f2.online) {
                    return -1;
                }
                if (f2.online && !f1.online) {
                    return 1;
                }
                // if(f1.nickName)
                // return 0;
                return f1.nickName.localeCompare(f2.nickName, undefined, { sensitivity: 'base' });
            });
            // // 查找friendId对应的对象的最新的idx，并更新activeIdx和activeFriend
            // const idx = state.friends.findIndex(f => f.id === friendId);
        },
        clear(state) {
            clearTimeout(state.timer);
            state.friends = [];
            state.timer = null;
            state.activeFriend = [];
        },
        setTimer(state, timer) {
            state.timer = timer;
        },
        clearTimer(state) {
            if (state.timer) {
                clearTimeout(state.timer);
                state.timer = null;
            }
        }
    },
    actions: {
        loadFriend(context) {
            if (context.state.timer) {
                clearTimeout(context.state.timer);
            }
            return new Promise((resolve, reject) => {
                http({
                    url: '/friend-server/friend/list',
                    method: 'GET'
                }).then((friends) => {
                    context.commit("setFriends", friends);
                    context.dispatch("refreshOnlineStatus");
                    console.log("loadFriend")
                    resolve()
                }).catch((res) => {
                    console.log("loadFriend error:", res);
                    reject();
                })
            });
        },

        refreshOnlineStatus(context) {
            if (context.state.timer) {
                clearTimeout(context.state.timer);
            }
            if (context.state.friends.length == 0) {
                const timer = setTimeout(() => context.dispatch('refreshOnlineStatus'), 30000);
                context.commit("setTimer", timer);
                return;
            }
            // let userIds = [];
            // state.friends.forEach((f)=>{userIds.push(f.id)});
            const userIds = context.state.friends.map(f => f.id).join(',');
            http({
                url: '/user-server/user/terminal/online',
                method: 'get',
                params: {userIds: userIds}
            }).then((onlineTerminals) => {
                // list({userId,terminalIds})
                context.commit("setOnlineStatus", onlineTerminals);
            }).catch(err => {
                console.error('refreshOnlineStatus | 获取在线状态失败:', err);
            }).finally(() => {
                // 30s后重新拉取
                const timer = setTimeout(() => {
                    context.dispatch("refreshOnlineStatus");
                }, 30000);
                context.commit("setTimer", timer);
            });
        },
    }
}
