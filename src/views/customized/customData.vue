<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <custom v-show="!basicStatus" style="height: 93%;" @choose="choose" :types="'4'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject" style="padding: 0"></el-button>{{ headDate.orgName }}</span>
      <span class="item">管理员手机号码：{{ headDate.telephone }}</span>
      <span class="item">联系人:{{ headDate.linkMan }}</span>
      <span class="item">联系人手机号码：{{ headDate.linkPhone }}</span>
      <span class="item">到期日期：{{ headDate.expireTime }}</span>
    </div>
    <material v-show="basicStatus" style="height: 93%;" :headDate="headDate" :basicStatus="basicStatus" :types="'4'"></material>
    <el-dialog title="选择企业" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="height: 560px;">
        <custom @choose="choose" ref="custom" style="height: 85%;" :status="choiceShow"  :types="'4'"></custom>
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
  background: #fff;
  font-size: 14px;
  .item {
    padding: 0 20px;
  }
}
/deep/ .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell{
  background-color: #fafcff;
}
.search-bgc{
  line-height: 50px;
  border-radius: 5px;
  background-color: #fff;
  font-size: 12px;
}
/deep/ .el-dialog__body .table-data{
  margin-top: 0 !important;
  padding-top: 0;
}
</style>
