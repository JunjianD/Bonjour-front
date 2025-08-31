<template>
  <el-container class="chat-page">
    <el-aside width="260px" class="chat-list-box">
      <div class="chat-list-header">
        <el-input width="200px" placeholder="搜索" v-model="searchText">
          <template #append>
            <el-button>
              <i class="icon iconfont icon-search"></i>
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="chat-list-loading"
           v-if="loading"
           v-loading="true"
           element-loading-text="消息接收中..."
           element-loading-background="#eee">
      </div>
      <el-scrollbar class="chat-list-items">
        <div v-for="(chat,index) in chatStore.chats" :key="index">
          <chat-item v-show="chat.showName.startsWith(searchText)"
                     :chat="chat"
                     :index="index"
                     :active="chat == chatStore.activeChat"
                     @click="onActiveItem(index)"
                     @delete="onDelItem(index)"
                     @top="onTop(index)">
          </chat-item>
        </div>
      </el-scrollbar>
    </el-aside>
    <el-container class="chat-box">
      <chat-box v-if="chatStore.activeChat"
                :chat="chatStore.activeChat">
      </chat-box>
    </el-container>
  </el-container>
</template>

<script>
import ChatItem from "../components/chat/ChatItem.vue";
import ChatBox from "../components/chat/ChatBox.vue";

export default {
  name: "UserChat",
  components: {
    ChatItem,
    ChatBox
  },
  data() {
    return {
      searchText: "",
      messageContent: "",
      group: {},
      groupMembers: []
    }
  },
  methods: {
    onActiveItem(index) {
      this.$store.commit("activeChat", index);
    },
    onDelItem(index) {
      this.$store.commit("removeChat", index);
    },
    onTop(chatIdx) {
      this.$store.commit("moveTop", chatIdx);
    },
  },
  computed: {
    chatStore() {
      return this.$store.state.chatStore;
    },
    loading() {
      return this.chatStore.loadingGroupMsg || this.chatStore.loadingPrivateMsg
    }
  }
}
</script>

<style lang="scss">
.chat-page {
  .chat-list-box {
    display: flex;
    flex-direction: column;
    border: #dddddd solid 1px;
    background: white;
    //width: 3rem;

    .chat-list-header {
      // 添加
      height: 50px;
      display: flex;
      align-items: center;
      // 原本
      padding: 5px;
      background-color: white;
      line-height: 50px;
    }

    .chat-list-loading {
      //flex: 1;
      height: 70px;
      background-color: #eee;
      position: relative;

      .el-loading-mask {
        position: relative !important; // 确保子元素绝对定位参考点
        height: 100%;
      }

      .el-loading-mask .el-loading-spinner {
        position: absolute !important;
        height: 100%;
        //top: 50%;
        left: 50%;
        transform: translate(-50%, -18%); // 完全居中
        display: flex !important;
        flex-direction: column;
        align-items: center !important;
        justify-content: center !important;
        //display: flex !important;          // flex 布局
        //flex-direction: column;            // svg 在上，文字在下
        //align-items: center !important;    // 水平居中
        //justify-content: center !important;// 垂直居中
        //line-height: normal;               // 避免文字行高影响
      }

      .el-loading-mask .el-loading-spinner svg,
      .el-loading-mask .el-loading-spinner p {
        display: block; // 避免 inline 元素对齐问题
        margin: 0;
        line-height: normal;
      }


      /* 针对 element-plus loading 蒙层 */

    }

    .chat-list-items {
      flex: 1;
    }
  }
}
</style>