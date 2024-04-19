<template>
  <div>
    <el-dialog :title="title" top="10vw" class="qr-title" :visible="approveCodeDialog" v-loading="loading" width="25%" center @close="closeDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="dialog-form">
        <p class="hint-tit">请使用系统APP扫一扫</p>
        <p>完成{{ title }}</p>
        <!-- <div v-if="refreshCode"><el-button @click="refreshClick">刷新二维码</el-button></div> -->
        <div ref="qrCode" id="qrCode">
          <div class="codeTime" title="刷新二维码" v-show="refreshCode">
            <i :class="haha ? 'el-icon-refresh-left' : 'el-icon-loading'" @click="refreshClick"></i>
          </div>
          <div class="codeOk" v-show="codeOk">
            <i class="el-icon-circle-check iconColor mb-20" v-if="!errors"></i>
            <div class="mb-60" v-if="!errors">扫描成功</div>
            <div v-if="!errors">请在手机上根据提示操作</div>
            <i class="el-icon-circle-close iconColor2 mb-20" v-if="errors"></i>
            <div class="mb-60" v-if="errors">扫描失败</div>
            <div v-if="errors">{{errMsg}}</div>
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
    approveCodeDialog: {
      type: Boolean,
      default: false
    },
    bizType: {
      type: Number
    },
    signDate: {
      type: Object,
      default: () => {
        return {
          fkBizId: "",
          fkNodeId: "",
          fkTemplateId: ""
        };
      }
    },
    siStatus: {
      type: Boolean,
      default: false
    },
    noApprove: {
      type: Boolean,
      default: false
    },
    signed: {
      type: Boolean,
      default: false
    },
    appCodeType:""
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
      authData: {},
      title: "核身认证",
      codeOk: false,
      errors: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      clickId: "",
      status: false,
      errMsg:"",
      qrCodes:null
    };
  },
  watch: {
    approveCodeDialog(val) {
      if (val) {
        // this.getApproveStatus()
      } else {
        // this.clearCodes();
      }
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user")) || [];
    }
  },
  methods: {
    getApproveStatus(status,noApproveSign) {
      if (status) {
        this.status = true;
      } else {
        this.status = false;
      }
      this.loading = true;
      this.$api
        .getApproveStatus()
        .then(res => {
          console.log('啊？',this.appCodeType,res.data,!this.noApprove,!noApproveSign,this.appCodeType!==res.data&&!this.noApprove&&!noApproveSign);
          if(this.appCodeType||this.appCodeType===0){
            if(this.appCodeType!==res.data&&!this.noApprove){
              this.loading = false;
              this.$emit("closeLoading");
              console.log("进来");
              this.$confirm('配置已变更，将重新加载最新状态!', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                closeOnClickModal:false
              }).then(() => {
                this.$emit("getNew")
              })
              return
            }
          }
          // 0:不认证 1:核身认证 2:签名 3:核身并签名
          if (res.code === 200) {
            this.appStatus = res.data;
            if (res.data === 0) {
              this.loading = false;
              this.unique = ""
              this.approveOk();
            } else if (res.data === 1) {
              // this.authenticationUrl = `app/approverDate?appStatus=${this.appStatus}&userId=${this.user.pkId}`;
              // this.$emit("update:approveCodeDialog", true);
              // this.getQrcode();
              // this.userFaceDistinguishState();
              this.title = "核身认证";
              // this.swipingAuthentication();
              this.$emit("update:approveCodeDialog", true);
              this.$emit("closeLoading");
              this.getQrcode(0);
            } else if (res.data === 2) {
              if (this.siStatus&&!this.noApprove&&!noApproveSign) {
                this.title = "电子签名";
                this.$emit("update:approveCodeDialog", true);
                this.$emit("closeLoading");
                this.getQrcode(1);
              } else {
                this.loading = false;
                this.approveOk((noApproveSign||this.noApprove||!this.signed)?null:this.unique);
              }
            } else if (res.data === 3) {
              if ((this.noApprove||noApproveSign)&&!status) {
                this.title = "核身认证";
                this.$emit("update:approveCodeDialog", true);
                this.$emit("closeLoading");
                this.getQrcode(0);
              } else {
                if (this.siStatus) {
                  this.title = "核身认证并电子签名";
                  // this.createSign();
                  this.$emit("update:approveCodeDialog", true);
                  this.$emit("closeLoading");
                  this.getQrcode(1);
                } else {
                  if (this.signed) {
                    this.loading = false;
                    this.approveOk(this.unique);
                  } else {
                    this.title = "核身认证";
                    this.$emit("update:approveCodeDialog", true);
                    this.$emit("closeLoading");
                    this.getQrcode(0);
                  }
                }
              }
            }
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    getAppSignStatus(status) {
      if (status) {
        this.status = true;
      } else {
        this.status = false;
      }
      this.$api
        .getAppSignStatus()
        .then(res => {
          if (res.code === 200) {
            this.appStatus = res.data ? 2 : 0;
            if (res.data === 0) {
              this.loading = false;
              this.approveOk(this.unique);
            } else {
              if (this.siStatus) {
                this.title = "电子签名";
                this.createSign();
              } else {
                this.loading = false;
                this.approveOk(this.unique);
              }
            }
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 生成签名 返回签名主键
    createSign() {
      const data = { ...this.signDate, bizType: this.bizType };
      console.log(data);
      this.$api
        .createSign(data)
        .then(res => {
          if (res.code === 200) {
            this.signId = res.data;
            this.authenticationUrl = `http://192.168.2.16/h5/#/pages/h5/wechatCode?appStatus=${this.noApprove ? 1 : this.appStatus}&signId=${this.signId}&phoneNum=${this.user.telephone}&fkNodeId=${this.signDate.fkNodeId}`;
            this.$emit("update:approveCodeDialog", true);
            this.$emit("closeLoading");
            this.getQrcode();
            this.getSignStatus();
          } else {
            this.loading = false;
            this.$emit("closeLoading");
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    swipingAuthentication() {
      this.$api.swipingAuthentication({ callbackUrl: "https://erp.jianwangkeji.cn/back.html?contextId=5" }).then(res => {
        if (res.code === 200) {
          this.authData = res.data;
          this.authenticationUrl = `http://192.168.2.16/h5/#/pages/h5/wechatCode?appStatus=${this.appStatus}&phoneNum=${this.user.telephone}&faceId=${res.data.userFaceDistinguishId}&faceUrl=${res.data.faceSwipingUrl}`;
          this.$emit("update:approveCodeDialog", true);
          this.$emit("closeLoading");
          this.getQrcode();
          // this.getSignStatus();
          // this.userFaceDistinguishState();
        } else {
          this.loading = false;
          this.$emit("closeLoading");
          this.$message.warning(res.msg);
        }
      });
    },
    queryQRCode() {
      clearInterval(this.codeTimer);
      clearInterval(this.codeTimer2)
      this.codeTimer = setInterval(() => {
        this.$api
          .queryQRCode({ unique: this.unique })
          .then(res => {
            if (res.code === 200) {
              if (res.data === 1) {
                clearInterval(this.codeTimer);
                clearInterval(this.codeTimer2)
                this.codeOk = true;
                this.errors = false
                if(this.appStatus==1){
                  this.judgeScanCompleted()
                }else{
                  this.getSignStatus();
                }
              }else if(res.data==2){
                clearInterval(this.codeTimer);
                clearInterval(this.codeTimer2)
                this.errors = true
                this.codeOk = true;
                this.errMsg="扫码人错误"
              }
            } else {
              clearInterval(this.codeTimer);
              clearInterval(this.codeTimer2)
              this.errors = true
              this.codeOk = true;
              this.errMsg=res.msg
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.codeOk = true;
            this.errors = false
            this.errMsg='二维码已过期'
            clearInterval(this.codeTimer);
            clearInterval(this.codeTimer2)
          });
      }, 5000);
      this.codeTimer2 = setTimeout(() => {
        clearInterval(this.codeTimer);
        this.errMsg="二维码已过期"
        this.errors = true
        this.codeOk = true;
      }, 1800000);
    },
    // 判定是否签名完成
    getSignStatus() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.$api
          .judgeScanCompleted({ unique: this.unique })
          .then(res => {
            if (res.code === 200) {
              if (res.data.status === 2) {
                clearInterval(this.timer);
                //  return
                if (this.status) {
                  this.$emit("signature", res);
                  this.$emit("update:approveCodeDialog", false);
                } else {
                  this.approveOk(this.unique);
                }
              } else if (res.data.status === 3) {
                this.closeDialog();
                clearInterval(this.timer);
                this.$message.warning("认证失败");
              }
            } else {
              clearInterval(this.timer);
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            clearInterval(this.timer);
            this.loading = false;
          });
      }, 3000);
    },
    // 判定人脸识别是否完成
    judgeScanCompleted() {
      this.timer = setInterval(() => {
        this.$api
          .judgeScanCompleted({ unique: this.unique })
          .then(res => {
            if (res.code === 200) {
              if (res.data.status === 2) {
                this.approveOk(this.unique);
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
    getQrcode(needSign) {
      this.loading = false;
      const location = window.location.origin;
      this.$nextTick(res => {
        // this.clearCodes();
        // this.$refs.qrCode.innerHTML = ""
        this.$api.addQRCode2({ needSign }).then(res => {
          if (res.code === 200) {
            this.unique = res.data;
            this.authenticationUrl = `http://192.168.2.16/h5/#/pages/h5/wechatCode?appStatus=${(this.noApprove || !needSign) ? 1 : this.appStatus}&phoneNum=${this.user.telephone}&codeId=${this.unique}`;
            const data = JSON.stringify(encodeURIComponent(this.authenticationUrl));
            if(this.qrCodes){
              this.qrCodes.makeCode(`${location}/h5/#/pages/h5/scanCodeTran?type=3&unique=${this.unique}&data=${data}`)
            }else{
              this.qrCodes = new QRCode("qrCode", {
                 width: 260,
                 height: 260,
                 correctLevel: QRCode.CorrectLevel.H,
                 text: `${location}/h5/#/pages/h5/scanCodeTran?type=3&unique=${this.unique}&data=${data}`
               });
            }
            console.log("生成了");
            this.queryQRCode();
          } else {
            this.$message.warning(res.msg);
          }
        }).catch(err=>{
          console.log(err);
        });
        // this.$refs.qrCode.innerHTML = "";
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
      // this.clearCodes();
      this.getQrcode([2, 3].includes(this.appStatus) ? 1 : 0);
      this.codeOk = false;
    },
    clearCodetime() {
      //清除定时器
      clearInterval(this.codeTimer);
      clearInterval(this.codeTimer2)
      this.codeTimer = null;
    },
    approveOk(codeId) {
      console.log('来了',codeId);
      // this.clearCodes();
      this.$emit("approveOk", codeId);
      this.$emit("update:approveCodeDialog", false);
      this.clearCodetime();
    },
    closeDialog() {
      // this.clearCodes();
      clearInterval(this.timer);
      this.$emit("update:approveCodeDialog", false);
      this.$emit("close");
      this.appStatus = "";
      this.errors = false;
      this.codeOk = false;
      this.clearCodetime();
    },
    clearCodes() {
      if (this.approveCodeDialog) {
        const dom = this.$refs.qrCode;
        let length = dom.childNodes.length - 3;
        for (let i = 0; i < length; i++) {
          dom.removeChild(dom.childNodes[3]);
        }
        // if(dom.childNodes.length>3){
        //   dom.removeChild(dom.childNodes[3]);
        //   dom.removeChild(dom.childNodes[3]);
        // }
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
  #qrCode {
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
  .iconColor2 {
    color: red;
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
