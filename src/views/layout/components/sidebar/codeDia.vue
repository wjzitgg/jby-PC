<template>
  <div>
    <el-dialog :title="title" top="10vw" class="qr-title" :visible="codeDia" v-loading="loading" width="25%" center @close="closeDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="dialog-form">
        <p class="hint-tit">请使用系统APP或微信扫一扫</p>
        <p>完成{{ title }}</p>
        <!-- <div v-if="refreshCode"><el-button @click="refreshClick">刷新二维码</el-button></div> -->
        <div ref="changePhoneCode" id="changePhoneCode">
          <div class="codeTime" title="刷新二维码" v-show="refreshCode">
            <i :class="haha ? 'el-icon-refresh-left' : 'el-icon-loading'" @click="refreshClick"></i>
          </div>
          <div class="codeOk" v-show="codeOk">
            <i class="el-icon-circle-check iconColor mb-20"></i>
            <div class="mb-60">扫描成功</div>
            <div>请在手机上根据提示操作</div>
            <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from "qrcodejs2";
export default {
  props: {
    codeDia: {
      type: Boolean,
      default: false
    },
    faceUrl:"",
    userFaceDistinguishId:""
  },
  beforeDestroy() {
    //清除定时器
    clearInterval(this.timer);
    this.timer = null;
    this.clearCodetime();
  },
  data() {
    return {
      loading: false,
      refreshCode: false,
      authenticationUrl: "",
      haha: false,
      appStatus: "",
      signId: "",
      timer: "",
      title: "核身认证",
      codeOk: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      clickId: ""
    };
  },
  watch:{
    codeDia(val){
      if(!val){
        clearInterval(this.timer);
        this.timer = null;
        this.clearCodetime();
      }
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user")) || [];
    }
  },
  methods: {
    queryQRCode() {
      clearInterval(this.codeTimer);
      this.codeTimer = setInterval(() => {
        this.$api.queryQRCode({ unique: this.unique }).then(res => {
          if (res.code === 200) {
            if (res.data === 1) {
              clearInterval(this.codeTimer);
              this.codeOk = true;
              // this.userFaceDistinguishState()
            }
          } else {
            clearInterval(this.codeTimer);
          }
        });
      }, 5000);
      this.codeTimer2 = setTimeout(() => {
        clearInterval(this.codeTimer);
        this.codeOk = true;
      }, 1800000);
    },
    // 判定人脸识别是否完成
    userFaceDistinguishState() {
      this.timer = setInterval(() => {
        this.$api
          .userFaceDistinguishState({ pkId: this.userFaceDistinguishId, distinguishType: 0 })
          .then(res => {
            if (res.code === 200) {
              if (res.data.status === 2) {
                this.scanOk();
                clearInterval(this.timer);
              } else if (res.data.status === 3) {
                this.closeDialog();
                clearInterval(this.timer);
                this.$message.warning("认证失败");
              }
            } else {
              clearInterval(this.timer);
              this.closeDialog();
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            clearInterval(this.timer);
            this.closeDialog();
            this.loading = false;
          });
      }, 3000);
    },
    // 二维码
    getQrcode() {
      this.$emit("update:codeDia", true);
      this.$emit("closeLoading");
      this.loading = false;
      const location = window.location.origin;
      this.$nextTick(() => {
        this.$api.addQRCode().then(res => {
          if (res.code === 200) {
            this.unique = res.data;
            const data = JSON.stringify(encodeURIComponent(this.faceUrl));
            new QRCode("changePhoneCode", {
              width: 260,
              height: 260,
              correctLevel: 3,
              text: `${location}/h5/#/pages/h5/scanCodeTran?type=2&unique=${this.unique}&data=${data}`
            });
            this.queryQRCode();
            this.userFaceDistinguishState()
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    timerTask() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        // clearInterval(this.timer);
        this.refreshCode = false;
      }, 3000);
    },
    refreshClick() {
      this.haha = false;
      this.clearCodes();
      // this.getQrcode();
      this.$emit("reshCode")
      this.codeOk = false;
    },
    clearCodetime() {
      //清除定时器
      clearInterval(this.codeTimer);
      this.codeTimer = null;
    },
    scanOk(img, id) {
      this.clearCodes();
      this.$emit("scanOk");
      this.$emit("update:codeDia", false);
      this.clearCodetime();
    },
    closeDialog() {
      this.clearCodes();
      clearInterval(this.timer);
      this.$emit("update:codeDia", false);
      this.$emit("close");
      this.appStatus = "";
      this.codeOk = false;
      this.clearCodetime();
    },
    clearCodes() {
      if (this.codeDia) {
        const dom = this.$refs.changePhoneCode;
        if(dom.childNodes[3]){
          dom.removeChild(dom.childNodes[3]);
          dom.removeChild(dom.childNodes[3]);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.qr-title {
  //   text-align: center;
  .close-qrcode {
    position: absolute;
    right: 10px;
    top: 10px;
  }
  .hint-tit {
    padding-top: 20px;
  }
  //   /deep/ .el-dialog__header {
  //     background-color: #cfd7da;
  //     text-align: left;
  //   }
  #changePhoneCode {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    position: relative;
    height: 300px;
    .codeTime {
      width: 260px;
      height: 260px;
      line-height: 260px;
      font-size: 30px;
      font-weight: 600;
      position: absolute;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      text-align: center;
      i {
        cursor: pointer;
      }
    }
  }
  .el-dialog__body {
    p {
      text-align: center;
      color: #3aa1ff;
      font-size: 24px;
    }
  }
}
.codeOk {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 260px;
  height: 260px;
  background-color: #fff;
  z-index: 1;
  .iconColor {
    color: #6bc839;
    font-size: 40px;
  }
  .mb-20 {
    margin-bottom: 20px;
  }
  .mb-60 {
    margin-bottom: 60px;
  }
}
</style>
