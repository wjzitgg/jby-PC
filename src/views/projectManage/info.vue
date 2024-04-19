<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" >
      <el-tab-pane label="项目概况" name="1"> </el-tab-pane>
      <el-tab-pane label="工程项目表" name="2"> </el-tab-pane>
    </el-tabs>
    <div style="height:calc(100% - 60px)">
      <survey v-if="activeName == 1"></survey>
      <itemPage v-if="activeName == 2"></itemPage>
    </div>
  </div>
</template>

<script>
import itemPage from "./components/item.vue";
import survey from "./components/survey.vue";
export default {
  components: { itemPage, survey },
  data() {
    return {
      activeName: "1"
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
};
</script>

<style lang="scss" scoped>
.el-tabs {
  background-color: #fff;
}
</style>
