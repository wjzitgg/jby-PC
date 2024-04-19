<template>
  <div class="app-container">
    <custom @choose="choose" :types="'1'" v-show="!basicStatus"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject" style="padding: 0"></el-button>{{ data.orgName }}</span>
      <span class="item">管理员手机号码：{{ data.telephone }}</span>
      <span class="item">联系人:{{ data.linkMan }}</span>
      <span class="item">联系人手机号码：{{ data.linkPhone }}</span>
      <span class="item">到期日期：{{ data.expireTime }}</span>
    </div>
    <basics v-show="basicStatus" :basicStatus="basicStatus" :id="data.pkId"></basics>
    <el-dialog title="选择项目部" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div style="height: 500px;">
        <custom @choose="choose" ref="custom" :types="'1'" :status="choiceShow"></custom>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import basics from "./compomemts/basics.vue";
import custom from "./compomemts/custom.vue";
export default {
  name: "feature",
  components: {
    basics,
    custom
  },
  data() {
    return {
      data: {
        pkId: ""
      },
      loading: false,
      basicStatus: false,
      choiceShow: false
    };
  },
  mounted() {},
  methods: {
    choose(item) {
      console.log(item);
      this.data = item;
      this.basicStatus = false;
      this.choiceShow = false;
      this.$nextTick(() => {
        this.basicStatus = true;
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
.add-department {
  margin: 10px 20px;
}
/deep/ .el-dialog__header {
  background: #ccc;
}
.headline {
  background: #ccc;
  font-size: 16px;
  .item {
    padding: 0 20px;
  }
}
</style>
