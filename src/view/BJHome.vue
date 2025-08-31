<template>
  <el-container class="home-page">
    <el-aside width="80px" class="navi-bar">
      <div class="user-head-image">
        <head-image :name="$store.state.userStore.userInfo.nickName"
                    :url="$store.state.userStore.userInfo.headImageThumb" :size="60"
                    @click="showSetting">
        </head-image>
      </div>

      <el-menu background-color="#333333" text-color="#ddd" style="margin-top: 30px;">

        <el-menu-item title="聊天" index="/home/chat" @click="gotoChat">
          <span class="icon iconfont icon-message"></span>
          <!--          <router-link v-bind::to="'/home/chat'">-->
          <!--            <div v-show="unreadCount > 0" class="unread-text">{{ unreadCount }}</div>-->
          <!--          </router-link>-->
        </el-menu-item>

        <!-- 好友 -->
        <el-menu-item title="好友" index="/home/friend" @click="gotoFriend">
          <span class="icon iconfont icon-user"></span>
        </el-menu-item>

        <el-menu-item title="群聊" index="/home/chat" @click="gotoGroup">
          <span class="icon iconfont icon-team"></span>
        </el-menu-item>

        <!-- 设置 -->
        <el-menu-item title="设置" index="/home" @click="showSetting">
          <span class="icon iconfont icon-setting"></span>
        </el-menu-item>
      </el-menu>

      <div class="exit-box" @click="onExit()" title="退出">
        <span class="icon iconfont icon-close-circle"></span>
      </div>
    </el-aside>
    <el-main class="content-box">
      <router-view></router-view>
    </el-main>
    <setting v-model="showSettingDialog"></setting>
    <user-info v-show="uiStore.userInfo.show"
               :pos="uiStore.userInfo.pos"
               :user="uiStore.userInfo.user"
               @close="$store.commit('closeUserInfoBox')">
    </user-info>
    <full-image :visible="uiStore.fullImage.show"
                :url="uiStore.fullImage.url"
                @close="$store.commit('closeFullImageBox')">
    </full-image>
    <chat-private-video ref="privateVideo"
                        v-model="uiStore.chatPrivateVideo.show"
                        :friend="uiStore.chatPrivateVideo.friend"
                        :master="uiStore.chatPrivateVideo.master"
                        :offer="uiStore.chatPrivateVideo.offer"
                        @close="$store.commit('closeChatPrivateVideoBox')">
    </chat-private-video>
    <chat-video-acceptor ref="videoAcceptor"
                         v-show="uiStore.videoAcceptor.show"
                         :friend="uiStore.videoAcceptor.friend"
                         @close="$store.commit('closeVideoAcceptorBox')">
    </chat-video-acceptor>
  </el-container>
</template>

<script>
import HeadImage from '../components/common/HeadImage.vue';
import UserSetting from '../components/setting/UserSetting.vue';
import UserInfo from '../components/common/UserInfo.vue';
import FullImage from '../components/common/FullImage.vue';
import ChatPrivateVideo from '../components/chat/ChatPrivateVideo.vue';
import ChatVideoAcceptor from '../components/chat/ChatVideoAcceptor.vue';


export default {
  components: {
    HeadImage,
    Setting: UserSetting,
    UserInfo,
    FullImage,
    ChatPrivateVideo,
    ChatVideoAcceptor,
  },
  data() {
    return {
      showSettingDialog: false,
      lastPlayAudioTime: new Date() - 1000
    }
  },
  methods: {
    init() {
      this.$store.dispatch("load").then(() => {
        // 加载离线消息
        this.loadPrivateMessage(this.$store.state.chatStore.privateMsgMaxId);
        this.loadGroupMessage(this.$store.state.chatStore.groupMsgMaxId);

        // ws初始化
        this.$wsApi.connect(process.env.VUE_APP_WS_URL, sessionStorage.getItem("accessToken"));
        this.$wsApi.onMessage((cmd, msgInfo) => {
          if (cmd === 3) {
            // 关闭ws
            this.$wsApi.close(3000)
            // 异地登录，强制下线
            this.$alert("您已在其他地方登陆，将被强制下线", "强制下线通知", {
              confirmButtonText: '确定',
              callback: action => {
                location.href = "/";
              }
            });

          } else if (cmd === 4) {
            // 插入私聊消息
            this.handlePrivateMessage(msgInfo);
          } else if (cmd === 5) {
            // 插入群聊消息
            this.handleGroupMessage(msgInfo);
          }
        })
        this.$wsApi.onClose((e) => {
          console.log(e);
          if (e.code != 3000) {
            // 断线重连
            //this.$message.error("连接断开，正在尝试重新连接...");
            this.$wsApi.reconnect(process.env.VUE_APP_WS_URL, sessionStorage.getItem("accessToken"));
          }
        });
      }).catch((e) => {
        console.log("初始化失败", e);
      })
    },
    loadPrivateMessage(minId) {
      this.$store.commit("loadingPrivateMsg", true)
      this.$http({
        url: "/message-server/message/private/loadMessage?minId=" + minId,
        method: 'get'
      }).then((msgInfos) => {
        msgInfos.forEach((msgInfo) => {
          msgInfo.selfSend = msgInfo.sendId == this.$store.state.userStore.userInfo.userId;
          let friendId = msgInfo.selfSend ? msgInfo.recvId : msgInfo.sendId;
          let friend = this.$store.state.friendStore.friends.find((f) => f.id == friendId);
          if (friend) {
            this.insertPrivateMessage(friend, msgInfo);
          }
        })
        if (msgInfos.length == 100) {
          // 继续拉取
          this.loadPrivateMessage(msgInfos[99].id);
        } else {
          this.$store.commit("loadingPrivateMsg", false)
        }
      }).catch((e) => {
        console.log(e);
      });
    },
    loadGroupMessage(minId) {
      this.$store.commit("loadingGroupMsg", true)
      this.$http({
        url: "/message-server/message/group/loadMessage?minId=" + minId,
        method: 'get'
      }).then((msgInfos) => {
        msgInfos.forEach((msgInfo) => {
          msgInfo.selfSend = msgInfo.sendId == this.$store.state.userStore.userInfo.userId;
          let groupId = msgInfo.groupId;
          let group = this.$store.state.groupStore.groups.find((g) => g.id == groupId);
          if (group) {
            this.insertGroupMessage(group, msgInfo);
          }
        })
        if (msgInfos.length == 100) {
          // 继续拉取
          this.loadGroupMessage(msgInfos[99].id);
        } else {
          this.$store.commit("loadingGroupMsg", false)
        }
      }).catch((e) => {
        console.log(e);
      });
    },
    handlePrivateMessage(msg) {
      // 标记这条消息是不是自己发的
      msg.selfSend = msg.sendId == this.$store.state.userStore.userInfo.userId;
      // 好友id
      let friendId = msg.selfSend ? msg.recvId : msg.sendId;
      // 消息已读处理
      if (msg.type == this.$enums.MESSAGE_TYPE.READED) {
        if (msg.selfSend) {
          // 我已读对方的消息，清空已读数量
          let chatInfo = {
            type: 'PRIVATE',
            targetId: friendId
          }
          this.$store.commit("resetUnreadCount", chatInfo)
        } else {
          // 对方已读我的消息，修改消息状态为已读
          this.$store.commit("readedMessage", {friendId: friendId})
        }
        return;
      }

      this.loadFriendInfo(friendId).then((friend) => {
        this.insertPrivateMessage(friend, msg);
      })
    },
    insertPrivateMessage(friend, msg) {
      // webrtc 信令
      if (msg.type >= this.$enums.MESSAGE_TYPE.RTC_CALL &&
          msg.type <= this.$enums.MESSAGE_TYPE.RTC_CANDIDATE) {
        // 呼叫
        if (msg.type == this.$enums.MESSAGE_TYPE.RTC_CALL ||
            msg.type == this.$enums.MESSAGE_TYPE.RTC_CANCEL) {
          this.$store.commit("showVideoAcceptorBox", friend);
          this.$refs.videoAcceptor.handleMessage(msg)
        } else {
          this.$refs.videoAcceptor.close()
          this.$refs.privateVideo.handleMessage(msg)
        }
        return;
      }

      let chatInfo = {
        type: 'PRIVATE',
        targetId: friend.id,
        showName: friend.nickName,
        headImage: friend.headImage
      };
      // 打开会话
      this.$store.commit("openChat", chatInfo);
      // 插入消息
      this.$store.commit("insertMessage", msg);
      // 播放提示音
      if (!msg.selfSend && msg.status != this.$enums.MESSAGE_STATUS.READED) {
        this.playAudioTip();
      }
    },
    handleGroupMessage(msg) {
      // 标记这条消息是不是自己发的
      msg.selfSend = msg.sendId == this.$store.state.userStore.userInfo.userId;
      let groupId = msg.groupId;
      // 消息已读处理
      if (msg.type == this.$enums.MESSAGE_TYPE.READED) {
        // 我已读对方的消息，清空已读数量
        let chatInfo = {
          type: 'GROUP',
          targetId: groupId
        }
        this.$store.commit("resetUnreadCount", chatInfo)
        return;
      }
      this.loadGroupInfo(groupId).then((group) => {
        // 插入群聊消息
        this.insertGroupMessage(group, msg);
      })
    },
    insertGroupMessage(group, msg) {
      let chatInfo = {
        type: 'GROUP',
        targetId: group.id,
        showName: group.remark,
        headImage: group.headImageThumb
      };
      // 打开会话
      this.$store.commit("openChat", chatInfo);
      // 插入消息
      this.$store.commit("insertMessage", msg);
      // 播放提示音
      if (!msg.selfSend && msg.status != this.$enums.MESSAGE_STATUS.READED) {
        this.playAudioTip();
      }
    },
    onExit() {
      this.$wsApi.close(3000);
      sessionStorage.removeItem("accessToken");
      location.href = "/";
    },
    playAudioTip() {
      if (new Date() - this.lastPlayAudioTime > 1000) {
        this.lastPlayAudioTime = new Date();
        let audio = new Audio();
        let url = require(`@/assets/audio/tip.wav`);
        audio.src = url;
        audio.play().catch((e) => {});
      }
    },
    showSetting() {
      this.showSettingDialog = true;
    },
    closeSetting() {
      this.showSettingDialog = false;
    },
    loadFriendInfo(id) {
      return new Promise((resolve, reject) => {
        let friend = this.$store.state.friendStore.friends.find((f) => f.id == id);
        if (friend) {
          resolve(friend);
        } else {
          this.$http({
            url: `/friend-server/friend/find/${id}`,
            method: 'get'
          }).then((friend) => {
            this.$store.commit("addFriend", friend);
            resolve(friend)
          })
        }
      });
    },
    loadGroupInfo(id) {
      return new Promise((resolve, reject) => {
        let group = this.$store.state.groupStore.groups.find((g) => g.id == id);
        if (group) {
          resolve(group);
        } else {
          this.$http({
            url: `/group-server/group/find/${id}`,
            method: 'get'
          }).then((group) => {
            resolve(group)
            this.$store.commit("addGroup", group);
          })
        }
      });
    },
    gotoFriend() {
      this.$router.push("/home/friend");
      this.$store.dispatch('loadFriend')
    },
    gotoGroup() {
      this.$router.push("/home/group");
      // this.$store.dispatch('loadGroup')
    },
    gotoChat() {
      this.$router.push("/home/chat");
      this.$store.dispatch('loadChat')
    }
  },
  computed: {
    uiStore() {
      return this.$store.state.uiStore;
    },
    unreadCount() {
      let unreadCount = 0;
      let chats = this.$store.state.chatStore.chats;
      chats.forEach((chat) => {
        unreadCount += chat.unreadCount
      });
      return unreadCount;
    }
  },
  watch: {
    unreadCount: {
      handler(newCount, oldCount) {
        let tip = newCount > 0 ? `${newCount}条未读` : "";
        this.$elm.setTitleTip(tip);
      },
      immediate: true
    }
  },
  mounted() {
    this.init();
  },
  unmounted() {
    this.$wsApi.close();
  }
}
</script>

<style scoped lang="scss">
.navi-bar {
  background: #333333;
  // 为了布局统一，建议将左右 padding 改为 0，让子元素自己控制宽度
  padding: 0;
  padding-top: 50px;

  // 新增：让内部元素（头像、菜单、退出）作为一个整体垂直排列
  display: flex;
  flex-direction: column;
  align-items: center;

  /* --- ↓↓↓ 本次新增：让头像在其容器内居中 ↓↓↓ --- */
  .user-head-image {
    display: flex;
    justify-content: center;
    // 让头像和菜单项之间有固定的外边距，而不是依赖父元素的 padding-top
    margin-bottom: 25px;
  }

  /* --- ↑↑↑ 本次新增：让头像在其容器内居中 ↑↑↑ --- */


  .el-menu {
    border: none;
    // 移除 flex:1，因为我们不再需要它来填充空间
    // flex: 1;
    width: 100%; // 让菜单宽度占满父容器

    .el-menu-item {
      /* --- ↓↓↓ 这里是新增的修改 ↓↓↓ --- */
      padding: 0 !important;
      display: flex;
      justify-content: center;
      align-items: center;
      /* --- ↑↑↑ 这里是新增的修改 ↑↑↑ --- */
      margin: 25px 0;

      .router-link-exact-active span {
        color: white !important;
      }


      span {
        font-size: 24px !important;
        color: #aaaaaa;

        &:hover {
          color: white !important;
        }
      }

      .unread-text {
        position: absolute;
        line-height: 20px;
        background-color: #f56c6c;
        left: 36px;
        top: 7px;
        color: white;
        border-radius: 30px;
        padding: 0 5px;
        font-size: 10px;
        text-align: center;
        white-space: nowrap;
        border: 1px solid #f1e5e5;
      }
    }
  }

  //.exit-box {
  //  position: absolute;
  //  width: 60px;
  //  bottom: 40px;
  //  color: #aaaaaa;
  //  font-size: 24px;
  //  text-align: center;
  //  cursor: pointer;
  //
  //  &:hover {
  //    color: white !important;
  //  }
  //}

  /* --- ↓↓↓ 这里是重点修改的部分 ↓↓↓ --- */
  .exit-box {
    // 移除 position: absolute，让它自然地排在菜单下方
    // 移除 bottom 属性

    width: 60px; // 保持宽度
    height: 56px; // 设置和菜单项一样的高度
    cursor: pointer;
    margin-top: auto; //  这是个技巧：让退出按钮自动推到底部
    margin-bottom: 25px; // 设置一个底部间距

    // 使用 Flexbox 居中图标
    display: flex;
    justify-content: center;
    align-items: center;

    //// 将样式直接应用到图标 span 上
    //.el-icon-circle-close {
    //  color: #aaaaaa;
    //  font-size: 28px; // 将图标调得更大一些
    //}

    // 将样式直接应用到图标 span 上
    .iconfont {
      color: #aaaaaa;
      font-size: 28px; // 将图标调得更大一些
    }

    // 悬浮效果也应用到 span 上
    &:hover {
      .iconfont {
        color: white !important;
      }
    }
  }

  /* --- ↑↑↑ 这里是重点修改的部分 ↑↑↑ --- */
}

.content-box {
  padding: 0;
  background-color: #E9EEF3;
  color: #333;
  text-align: center;

}
</style>