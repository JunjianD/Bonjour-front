<template>
  <el-container class="friend-page">
    <el-aside width="260px" class="friend-list-box">
      <div class="friend-list-header">
        <div class="friend-list-search">
          <el-input width="200px" placeholder="搜索好友" v-model="searchText">
            <template #append>
              <el-button>
                <i class="icon iconfont icon-search"></i>
              </el-button>
            </template>
          </el-input>
        </div>
        <el-button
            plain
            style="border: none; padding:12px; font-size: 20px;color: black;"
            title="添加好友"
            @click="onShowAddFriend()">
          <i class="icon iconfont icon-plus-circle"></i>
        </el-button>
        <add-friend v-model="showAddFriend"></add-friend>
      </div>
      <el-scrollbar class="friend-list-items">
        <div v-for="(friend,index) in $store.state.friendStore.friends" :key="index">
          <friend-item v-show="friend.nickName.startsWith(searchText) || friend.userName.startsWith(searchText)"
                       :index="index"
                       :active="friend == $store.state.friendStore.activeFriend"
                       @chat="() => onSendMessage(friend)"
                       @delete="() => onDelItem(friend, index)"
                       @click="() => onActiveItem(friend,index)">
          </friend-item>
        </div>
      </el-scrollbar>
    </el-aside>
    <el-container class="friend-box">
      <div class="friend-header" v-show="userInfo.userId">
        {{ userInfo.nickName }}
      </div>
      <div v-show="userInfo.userId">
        <div class="friend-detail">
          <head-image :size="200"
                      :name="userInfo.nickName"
                      :url="userInfo.headImage"
                      @click="showFullImage()"></head-image>
          <div style="width: 100%;">
            <div class="info-item">
              <el-descriptions title="好友信息" class="description" :column="1">
                <el-descriptions-item label="用户名">{{ userInfo.userName }}</el-descriptions-item>
                <el-descriptions-item label="昵称">{{ userInfo.nickName }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ userInfo.sex == 0 ? "男" : "女" }}</el-descriptions-item>
                <el-descriptions-item label="签名">{{ userInfo.signature }}</el-descriptions-item>
              </el-descriptions>

            </div>
            <div class="frient-btn-group">
              <el-button v-show="isFriend" type="primary" @click="onSendMessageUser(userInfo)">
                <i class="icon iconfont icon-message"></i>
                发送消息
              </el-button>
              <el-button v-show="!isFriend" type="primary" @click="onAddFriend(userInfo)">
                <i class="icon iconfont icon-plus-circle"></i>
                加为好友
              </el-button>
              <el-button v-show="isFriend" type="danger" @click="onDelItemUser(userInfo,activeIdx)">
                <i class="icon iconfont icon-delete"></i>
                删除好友
              </el-button>
            </div>
          </div>
        </div>
        <el-divider content-position="center"></el-divider>

      </div>
    </el-container>
  </el-container>
</template>

<script>
import FriendItem from "../components/friend/FriendItem.vue";
import AddFriend from "../components/friend/AddFriend.vue";
import HeadImage from "../components/common/HeadImage.vue";

export default {
  name: "BJFriend",
  components: {
    FriendItem,
    AddFriend,
    HeadImage
  },
  data() {
    return {
      searchText: "",
      showAddFriend: false,
      activeIdx: -1,
      userInfo: {}
      // {userId,userName,nickName,sex,userType,signature,headImage,headImageThumb,online}
    }
  },
  methods: {
    onShowAddFriend() {
      this.showAddFriend = true;
    },
    onCloseAddFriend() {
      this.showAddFriend = false;
    },
    onActiveItem(friend, idx) {
      this.$store.commit("activeFriend", idx);
      // this.activeIdx = idx
      let friendId = friend.id
      // console.log("选中的好友的id为：" + friend.id);
      this.loadUserInfo(friend, idx);
      this.loadOnlineStatus(friend, idx)

      const newIdx = this.$store.state.friendStore.friends.findIndex(f => f.id == friendId);
      this.activeIdx = newIdx;
    },
    onDelItem(friend, idx) {
      this.$confirm(`确认要解除与 '${friend.nickName}'的好友关系吗?`, '确认解除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: `/friend-server/friend/delete/${friend.id}`,
          method: 'delete'
        }).then((data) => {
          this.$message.success("删除好友成功");
          this.$store.commit("removeFriend", idx);
          this.$store.commit("removePrivateChat", friend.id);
        }).catch((e) => {
          this.$message.error("失败，请重试");
          // console.log("删除好友失败");
          // console.log(e);
          // this.$message.error("删除好友失败");
        })
      }).catch(() => {
        this.$message.primary("取消操作");
        // 用户点击取消
        // 什么都不做就行，避免报错
      });
    },
    onDelItemUser(friend, idx) {
      this.$confirm(`确认要解除与 '${friend.nickName}'的好友关系吗?`, '确认解除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: `/friend-server/friend/delete/${friend.userId}`,
          method: 'delete'
        }).then((data) => {
          this.$message.success("删除好友成功");
          this.$store.commit("removeFriend", idx);
          this.$store.commit("removePrivateChat", friend.userId);
        }).catch((e) => {
          this.$message.error("失败，请重试");
        })
      }).catch(() => {
        this.$message.primary("取消操作");
        // 用户点击取消
        // 什么都不做就行，避免报错
      });
    },
    onAddFriend(user) {
      this.$http({
        url: "/friend-server/friend/add",
        method: "post",
        params: {
          friendId: user.id
        }
      }).then((data) => {
        this.$message.success("添加成功，对方已成为您的好友");
        let friend = {
          id: user.id,
          nickName: user.nickName,
          headImage: user.headImage,
          online: user.online
        }
        this.$store.commit("addFriend", friend);
      })
    },
    onSendMessage(user) {
      let chat = {
        type: 'PRIVATE',
        targetId: user.id,
        showName: user.nickName,
        headImage: user.headImage,
      };
      this.$store.commit("openChat", chat);
      this.$store.commit("activeChat", 0);
      this.$router.push("/home/chat");
    },
    onSendMessageUser(user) {
      let chat = {
        type: 'PRIVATE',
        targetId: user.userId,
        showName: user.nickName,
        headImage: user.headImage,
      };
      this.$store.commit("openChat", chat);
      this.$store.commit("activeChat", 0);
      this.$router.push("/home/chat");
    },
    showFullImage() {
      if (this.userInfo.headImage) {
        this.$store.commit('showFullImageBox', this.userInfo.headImage);
      }
    },
    updateFriendInfo(friend, user, index) {
      // store的数据不能直接修改，深拷贝一份store的数据
      friend = JSON.parse(JSON.stringify(friend));
      friend.headImage = user.headImageThumb;
      friend.nickName = user.nickName;
      this.$http({
        url: "/friend-server/friend/update",
        method: "put",
        data: friend
      }).then(() => {
        this.$store.commit("updateFriend", friend);
        this.$store.commit("updateChatFromFriend", user);
      })
    },
    loadUserInfo(friend, index) {
      this.$http({
        url: `/user-server/user/find/${friend.id}`,
        method: 'get'
      }).then((user) => {
        this.userInfo = user;
        // 如果发现好友的头像和昵称改了，进行更新
        if (user.headImageThumb != friend.headImage ||
            user.nickName != friend.nickName) {
          this.updateFriendInfo(friend, user, index)
        }
      }).catch((e) => {
        this.$message.error("加载用户信息失败");
      })
    },
    loadOnlineStatus(friend, index) {
      this.$http({
        url: "/user-server/user/terminal/online",
        method: "get",
        params: {userIds: String(friend.id)}
      }).then((data) => {
        console.log(data)
        this.$store.commit("updateSingleOnlineStatus", {friendId: friend.id, onlineTerminals: data})
      }).catch((e) => {
        console.error("获取好友在线状态失败", e);
      })
    },
    // 👉 新增：刷新好友列表的方法
    refreshFriendList() {
      this.$store.dispatch('friendStore/loadFriend')
          .then(() => {
            console.log("好友列表刷新成功");
            // 可选：清空当前选中，或保留
            this.userInfo = {};
            this.activeIdx = -1;
          })
          .catch(err => {
            this.$message.error("刷新好友列表失败");
            console.error("刷新好友列表失败:", err);
          });
    }
  },
  watch: {
    $route(to, from) {
      if (to.path === '/home/friend') {
        this.refreshFriendList();
      }
    }
  },
  computed: {
    friendStore() {
      return this.$store.state.friendStore;
    },
    isFriend() {
      return this.friendStore.friends.find((f) => f.id == this.userInfo.userId);
    }
  }
}
</script>

<style scoped lang="scss">
.friend-page {
  .friend-list-box {
    display: flex;
    flex-direction: column;
    border: #dddddd solid 1px;
    background: white;

    .friend-list-header {
      height: 50px;
      display: flex;
      align-items: center;
      padding: 5px;
      background-color: white;

      .friend-list-search {
        flex: 1;
      }
    }

    .friend-list-items {
      flex: 1;
    }
  }

  .friend-box {
    display: flex;
    flex-direction: column;
    border: #dddddd solid 1px;

    .friend-header {
      width: 100%;
      height: 50px;
      padding: 5px;
      line-height: 50px;
      font-size: 20px;
      text-align: left;
      text-indent: 10px;
      font-weight: 600;
      background-color: white;
      border: #dddddd solid 1px;
    }

    .friend-detail {
      display: flex;
      align-items: center;
      padding: 50px 80px 20px 80px;
      text-align: center;

      .info-item {
        margin-left: 20px;
        margin-right: 20px;
        background-color: #ffffff;
      }

      .description {
        padding: 20px 20px 0px 20px;
      }
    }

    .frient-btn-group {
      text-align: center !important;
      //padding: 20px;
      //margin-left: 20px;
      margin-top: 10px;
    }
  }
}
</style>