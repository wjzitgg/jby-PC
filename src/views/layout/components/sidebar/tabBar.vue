<template>
  <el-tabs
    v-model="$store.state.layout.editableTabsValue"
    type="border-card"
    closable
    @tab-remove="removeTab"
    @tab-click="clickTab"
  >
    <el-tab-pane label="动态首页" name="动态首页" :closable="false">
      <router-view></router-view>
    </el-tab-pane>
    <el-tab-pane
      v-for="item in $store.state.layout.editableTabs"
      :key="item.name"
      :label="item.title"
      :name="item.name"
      class="tabs"
    >
      <router-view></router-view>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { mapMutations } from "vuex";
export default {
  methods: {
    ...mapMutations(["removeTab", "checkHome", "clickTab"])
  }
};
</script>
<style lang="scss" scoped>
.el-tabs {
  width: 100%;
  /deep/.el-tabs--border-card > .el-tabs__header {
    background-color: #3aa1ff;
    border: 0;
    margin-top: -1px;
  }
  /deep/ .el-tabs__item {
    border-radius: 5px;
    color: #000;
    background-color: #d7d7d7;
    vertical-align: text-bottom;
  }
}

</style>
