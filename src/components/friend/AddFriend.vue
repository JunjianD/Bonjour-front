<template>
  <el-dialog title="添加好友" v-model="visible" width="30%" :before-close="onClose">
    <el-input placeholder="输入用户名或昵称,最多展示20条" class="input-with-select" v-model="searchText"
              @keyup.enter="onSearch">
      <template #append>
        <el-button @click="onSearch()">
          <i class="icon iconfont icon-search"></i>
        </el-button>
      </template>
    </el-input>
    <el-scrollbar style="height:400px">
      <div v-for="user in filteredUsers" :key="user.userId" v-show="user.userId != $store.state.userStore.userInfo.userId">
        <div class="item">
          <div class="avatar">
            <head-image :name="user.nickName"
                        :url="user.headImage"
                        :online="user.online"
            ></head-image>
          </div>
          <div class="add-friend-text">
            <div class="text-user-name">
              <div>{{ user.userName }}</div>
              <div :class="user.online ? 'online-status  online':'online-status'">
                {{ user.online ? "[在线]" : "[离线]" }}
              </div>
            </div>
            <div class="text-nick-name">
              <div>昵称:{{ user.nickName }}</div>
            </div>
          </div>
          <el-button type="success" size="small" v-show="!isFriend(user.userId)" plain @click="onAddFriend(user)">添加
          </el-button>
          <el-button type="info" size="small" v-show="isFriend(user.userId)" plain disabled>已添加</el-button>
        </div>
      </div>
    </el-scrollbar>
  </el-dialog>
</template>

<script>
import HeadImage from '../common/HeadImage.vue'


export default {
  name: "addFriend",
  components: {
    HeadImage
  },
  props: {
    modelValue:{
      type: Boolean
    }
  },
  data() {
    return {
      users: [],
      searchText: "",
    }
  },
  methods: {
    onClose() {
      this.$emit('update:modelValue', false);
    },
    onSearch() {
      this.$http({
        url: "/user-server/user/findByName",
        method: "get",
        params: {
          name: this.searchText
        }
      }).then((data) => {
        // console.log("搜寻到的好友有：",data)
        this.users = data;
      })
    },
    onAddFriend(user) {
      this.$http({
        url: "/friend-server/friend/add",
        method: "post",
        params: {
          friendId: user.userId
        }
      }).then((data) => {
        this.$message.success("添加成功，对方已成为您的好友");
        let friend = {
          id: user.userId,
          nickName: user.nickName,
          headImage: user.headImage,
          online: user.online
        }
        this.$store.commit("addFriend", friend);
      })
    },
    isFriend(userId) {
      let friends = this.$store.state.friendStore.friends;
      let friend = friends.find((f) => f.id == userId);
      return friend != undefined;
    }
  },
  computed: {
    filteredUsers() {
      const myId = this.$store.state.userStore.userInfo.userId;
      return this.users.filter(user => user.userId !== myId);
    },
    visible: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      }
    }
  },
  watch: {
  },

}
</script>

<style lang="scss">
.el-dialog {
  min-width: 400px;
}

.item {
  height: 65px;
  display: flex;
  position: relative;
  padding-left: 15px;
  align-items: center;
  padding-right: 25px;

  .add-friend-text {
    margin-left: 15px;
    flex: 3;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;

    .text-user-name {
      display: flex;
      flex-direction: row;
      font-weight: 600;
      font-size: 16px;
      line-height: 25px;

      .online-status {
        font-size: 12px;
        font-weight: 600;

        &.online {
          color: #5fb878;
        }
      }
    }

    .text-nick-name {
      display: flex;
      flex-direction: row;
      font-size: 12px;
      line-height: 20px;
    }

  }
}
</style>
