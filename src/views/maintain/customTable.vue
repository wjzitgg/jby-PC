<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <custom v-show="!basicStatus" @choose="choose" :types="'3'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <!-- <span class="item"><el-button size="mini" icon="el-icon-s-unfold" style="padding: 0"></el-button>标段项目</span>
      <span class="item">联系电话号码：130000000</span>
      <span class="item">联系人:张三</span>
      <span class="item">到期日期：2022-10-27</span> -->
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject" style="padding: 0"></el-button>{{ headDate.orgName }}</span>
      <span class="item">管理员手机号码：{{ headDate.telephone }}</span>
      <span class="item">联系人:{{ headDate.linkMan }}</span>
      <span class="item">联系人手机号码：{{ headDate.linkPhone }}</span>
      <span class="item">到期日期：{{ headDate.expireTime }}</span>
    </div>
    <tablue v-show="basicStatus"  ref="tableInt" :headDate="headDate" :basicStatus="basicStatus" :types="'3'"></tablue>
    <el-dialog title="选择项目部" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="height: 500px;">
        <custom @choose="choose" ref="custom" :status="choiceShow" :types="'3'"></custom>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import custom from "./compomemts/custom.vue";
import tablue from "./compomemts/form.vue";
// import material from "./compomemts/material.vue";
export default {
  name: "customTable",
  components: {
    custom,
    tablue
    // material
  },
  data() {
    return {
      basicStatus: false,
      headDate: {},
      fkOrgId: "",
      choiceShow: false
    };
  },

  mounted() {
    // this.getData();
  },
  methods: {
    choose(item) {
      this.headDate = item;
      this.fkOrgId = item.pkId;
      this.basicStatus = false;
      this.choiceShow = false;
      this.$nextTick(() => {
        this.basicStatus =true
      });
    },
    choiceProject() {
      this.choiceShow = true;
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
