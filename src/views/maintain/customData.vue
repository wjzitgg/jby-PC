<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <custom v-show="!basicStatus" @choose="choose" :types="'4'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject" style="padding: 0"></el-button>{{ headDate.orgName }}</span>
      <span class="item">管理员手机号码：{{ headDate.telephone }}</span>
      <span class="item">联系人:{{ headDate.linkMan }}</span>
      <span class="item">联系人手机号码：{{ headDate.linkPhone }}</span>
      <span class="item">到期日期：{{ headDate.expireTime }}</span>
    </div>
    <material v-show="basicStatus" :headDate="headDate" :basicStatus="basicStatus" :types="'4'"></material>
    <el-dialog title="选择项目部" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="height: 500px;">
        <custom @choose="choose" ref="custom" :status="choiceShow"  :types="'4'"></custom>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import custom from "./compomemts/custom.vue";
import material from "./compomemts/material.vue";
export default {
  name: "customData",
  components: {
    custom,
    material
  },
  data() {
    return {
      basicStatus: false,
      headDate: {},
      choiceShow:false
    };
  },

  mounted() {
    // this.getData();
  },
  methods: {
    choose(item) {
      console.log(item);
      this.headDate = item;
      this.basicStatus = false;
      this.choiceShow = false;
      this.$nextTick(() => {
        this.basicStatus =true
      })
    },
    choiceProject() {
      this.choiceShow = true
      this.$nextTick(() => {
        this.$refs.custom.reset();
        
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.headline {
  background: #ccc;
  font-size: 16px;
  .item {
    padding: 0 20px;
  }
}
/deep/ .el-dialog__header {
  background: #ccc;
}
</style>
