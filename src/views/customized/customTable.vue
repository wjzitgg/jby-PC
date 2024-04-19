<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <custom v-show="!basicStatus" style="height: 93%;" @choose="choose" :types="'3'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject" style="padding: 0"></el-button>{{ headDate.orgName }}</span>
      <span class="item">管理员手机号码：{{ headDate.telephone }}</span>
      <span class="item">联系人:{{ headDate.linkMan }}</span>
      <span class="item">联系人手机号码：{{ headDate.linkPhone }}</span>
      <span class="item">到期日期：{{ headDate.expireTime }}</span>
    </div>
    <tablue v-show="basicStatus" style="height: 93%;" ref="tableInt" :headDate="headDate" :basicStatus="basicStatus" :types="'3'"></tablue>
    <el-dialog title="选择企业" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="height: 580px;">
        <custom @choose="choose" style="height: 85%;" ref="custom" :status="choiceShow" :types="'3'"></custom>
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
      choiceShow: false,
      timers:null
    };
  },

  mounted() {
    // this.getData();
    this.openTimer()
  },
  beforeDestroy() {
    //清除定时器
    this.clearTimer()
  },
  methods: {
    effective(){
      this.$api.effective({token:sessionStorage.getItem("token")}).then(res=>{
        if(res.code==200){
          if(res.data.isEffective){
            this.clearTimer()
            this.$alert(res.data.errorMsg, "账号退出提示", {
            confirmButtonText: "重新登录",
            cancelButtonText: "返回首页",
            type: "warning",
            showClose: false,
            showCancelButton: true,
            callback: action => {
              if (action == "cancel") {
                this.$router.push("/login");
              } else {
                this.$store.commit("setLoginDialog", true);
                this.$store.commit("setTokenSign", res.data.tokenSign);
              }
            }
          });
          }
        }else{
          this.$message.warning(res.msg)
        }
      })
    },
    openTimer(){
      this.clearTimer()
      this.effective()
     this.timers= setInterval(()=>{
        this.effective()
      },10000)
    },
    clearTimer(){
      clearInterval(this.timers)
    },
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
  background: #fff;
  font-size: 14px;
  .item {
    padding: 0 20px;
  }
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
