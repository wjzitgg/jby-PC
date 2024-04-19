<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" v-if="this.user.orgType!=3">
      <el-tab-pane label="施工合同" name="1"> </el-tab-pane>
      <el-tab-pane label="监理合同" name="2"> </el-tab-pane>
    </el-tabs>
    <div style="height:100%" :key="activeName">
      <ContractTable :id="activeName - 0" />
    </div>
  </div>
</template>

<script>
import ContractTable from "./components/ContractTable";
export default {
  components: { ContractTable },
  data() {
    return {
      activeName: "1"
    };
  },
  created() {
    if(this.user.orgType==3){
      this.activeName='2'
    }
  },
  computed:{
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.el-tabs {
  background-color: #fff;
}
</style>
