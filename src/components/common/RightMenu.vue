<template>
  <div class="right-menu-mask" @click="close($event)" @contextmenu.prevent="close($event)">
    <div class="right-menu" :style="{'left':pos.x+'px','top':pos.y+'px'}">
      <el-menu text-color="#333333" @select="onSelectMenu">
        <el-menu-item v-for="(item) in items"
                      :key="item.key"
                      :title="item.name"
                      :index="item.key">
          <span :class="item.icon"></span>
          <span>{{ item.name }}</span>

        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script>
export default {
  name: "rightMenu",
  data() {
    return {}
  },
  props: {
    pos: {
      type: Object
    },
    items: {
      type: Array
    }
  },
  methods: {
    close(e) {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      this.$emit("close");
    },
    // onSelectMenu(e, item) {
    //   this.close(e);
    //   this.$emit("select", item);
    // }
    onSelectMenu(key) {
      const item = this.items.find(i => i.key === key);
      this.close();
      this.$emit("select", item);
    }
  }
}
</script>

<style lang="scss">
.right-menu-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  cursor: default;
}

.right-menu {
  position: fixed;
  box-shadow: 0px 0px 10px #ccc;

  .el-menu {
    border: 1px solid #b4b4b4;
    border-radius: 7px;
    overflow: hidden;

    .el-menu-item {
      height: 40px;
      line-height: 40px;
      cursor: pointer;
      padding: 0 12px !important; /* 给左右留点空 */
      display: flex; /* 横向布局 */
      justify-content: space-between; /* 两端对齐，自动扩散 */
      align-items: center; /* 垂直居中 */
      //gap: 10px; /* 图标和文字间距 */
      border-bottom: 1px solid #d0d0d0;

      span {
        font-weight: 500;
      }
    }
  }
}
</style>