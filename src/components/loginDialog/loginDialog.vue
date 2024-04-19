<template>
  <div>
    <el-dialog :visible.sync="dialogShow" v-loading="loading" :close-on-click-modal="false" :close-on-press-escape="false" class="loginDia">
      <div class="login-box">
        <!-- 手机号登录 -->
        <div class="returnBtn" title="返回登录页">
          <el-button type="primary" size="mini" icon="el-icon-back" @click="back"></el-button>
        </div>
        <div class="trans" @click="loginMethodClick(false)" v-show="loginMethod">
          <img class="trans" style="border-radius: 5px;" src="@/assets/QRcode.png" alt="" />
          <img class="trans" style="transform: rotate(180deg);    top: 3px;" src="@/assets/masking.png" alt="" />
        </div>
        <div class="trans" @click="loginMethodClick(true)" v-show="!loginMethod">
          <img class="trans" style="border-radius: 5px;" src="@/assets/brain.png" alt="" />
          <img class="trans" style="transform: rotate(180deg);" src="@/assets/masking.png" alt="" />
        </div>
        <div v-if="loginMethod" style=" padding: 25px 45px 5px 45px;">
          <div class="yx-tit">
            <img src="@/assets/logo.png" alt="" />
          </div>
          <div class="text box-administration">
            建必优工程生产管理系统
          </div>
          <div class="left-text">
            <div class="left-ico"></div>
            账号登录
          </div>
          <el-form :model="ruleForm" ref="ruleForm" class="demo-ruleForm" :hide-requied-aterisk="false">
            <el-form-item>
              <el-row class="phone-area">
                <el-col :span="6" style="position: relative;">
                  <el-select v-model="areaCode" placeholder="请选择" disabled>
                    <el-option label="+86" :value="1"></el-option>
                  </el-select>
                  <span class="right-vertical"></span>
                </el-col>
                <el-col :span="18">
                  <el-input type="number" disabled @mousewheel.native.prevent v-model.trim="user.telephone"> </el-input>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item class="jw-code">
              <el-input type="text" v-model.trim="ruleForm.code" placeholder="请输入验证码" @input="ruleForm.code = $limitPhone2(ruleForm.code)" maxlength="4" style="width: 60%"> </el-input>
              <div class="login-code" @click="getCode" v-if="timerStatus">
                <el-button type="primary">获取验证码</el-button>
              </div>
              <div class="login-code" v-if="!timerStatus">
                <el-button type="primary">{{ timer }}秒后重试</el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm()" style="width: 100%">
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-if="!loginMethod">
          <div class="scanning-prompt">手机扫码,安全登录</div>
          <div class="code-box" style="position: relative;">
            <div ref="codeImg" id="codeImg"></div>
            <div v-if="codeImgStatus" class="mask-layer">
              <div class="mask-layer-text">
                二维码已失效
              </div>
              <div @click="loginMethodClick(false)" class="mask-layer-btn">刷新二维码</div>
            </div>
            <div class="codeOk" v-if="codeOk">
              <i class="el-icon-circle-check iconColor mb-20" v-if="!codeOk2"></i>
              <i class="el-icon-circle-close iconColor2 mb-20" v-if="codeOk2"></i>
              <div class="mb-60">{{ !codeOk2 ? "扫描成功" : codeErr }}</div>
              <div v-if="!codeOk2">请在手机上根据提示操作</div>
              <el-button type="text" @click="loginMethodClick(false)">重新加载二维码</el-button>
            </div>
          </div>

          <div class="explain-box">
            <el-row>
              <el-col :span="5" style="position: relative;">
                <img class="explain-img" src="@/assets/xaxrszhaopin.png" alt="" />
              </el-col>
              <el-col :span="18" class="explain-text">
                <div>打开建必优APP</div>
                <div>扫一扫登录</div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="popup" v-loading="loadings" center top="30vh" title="请输入图形验证码，再获取手机验证码!" :close-on-click-modal="false" :close-on-press-escape="false" width="24%" @close="closePop">
      <!-- <div class="dialog-form">
        <img :src="imgCode" class="spacing" />
        <el-input v-model="ruleFormCode" placeholder="请输入图形验证码"></el-input>
        <div slot="footer" class="dialog-footer" style="padding: 15px;text-align: center;">
          <el-button type="primary" @click="getImgecode">切换验证码</el-button>
          <el-button type="success" @click="getNote">获取短信验证码</el-button>
        </div>
      </div> -->
      <div class="dialog-form" style="padding-bottom:20px">
        <Slider style="margin: 0 auto;" v-if="imgCodeStatus" :imgurl="imgCode.img" :miniimgurl="imgCode.smallImage" :h="imgCode.oriImageHeight" :w="imgCode.oriImageWidth" :sw="imgCode.slidingWidth" :sh="imgCode.slidingHeight" :sliderText="imgCode.captchaType" :blocky="imgCode.yHeight" @getNote="getNote" :code="imgCode.xWidth" @refresh="refresh" :errShow="errShow" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from "qrcodejs2";
// import Slider from "@/components/SlideVerify";
import Slider from "./../SlideVerify.vue";
export default {
  components: {
    Slider
  },
  computed: {
    dialogShow() {
      return this.$store.state.logDialog ? this.$store.state.logDialog : false;
    },
    user() {
      return this.$store.state.user.pkId ? this.$store.state.user : JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {
    dialogShow(val) {
      console.log(val);
      if (!val) {
        this.ruleForm.code = "";
        this.clearCodetime();
      }
    }
  },
  data() {
    return {
      ruleForm: {
        // loginName: "",
        code: "",
        uuid: "",
        forceType: 0, // 强制登录的问题
        sourceType: 1, // 登录来源
        phoneNumber: ""
      },
      loading: false,
      // imgCode: "",
      popup: false,
      timerStatus: true,
      timer: 60,
      ruleFormCode: "",
      loadings: false,
      areaCode: 1,
      loginMethod: true,
      scanCodeData: {},
      codeImgStatus: true,
      codeOk: false,
      codeOk2: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      codeErr: "",
      imgCode: {},
      imgCodeStatus: false,
      errShow: false
    };
  },
  methods: {
    refresh() {
      this.getImgecode();
    },
    back() {
      this.clearCodetime();
      this.$router.push("/login");
    },
    submitForm() {
      // 校验手机号
      const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(this.user.telephone)) {
        this.$message({ message: "请输入正确的手机号码", type: "warning" });
        return;
      }
      // 手机验证码
      if (!this.ruleForm.code) {
        this.$message({ message: "请输入正确的验证码", type: "waring" });
        return;
      }
      let data = {
        code: this.ruleForm.code,
        oldToken: sessionStorage.getItem("token"),
        phoneNumber: this.user.telephone,
        pkId: this.user.pkId,
        sourceType: 1,
        tokenSign: this.$store.state.tokenSign,
        uuid: this.ruleForm.uuid
      };
      console.log(data);
      this.loading = true;
      this.$api.switchAnewLogin(data).then(res => {
        this.loading = false;
        if (res.code === 200) {
          sessionStorage.setItem("token", res.data.access_token);
          this.$store.commit("setLoginDialog", false);
          this.$emit("getUserList");
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    clearCodetime() {
      // 清除定时器
      clearInterval(this.codeTimer);
      this.codeTimer = null;
      this.codeTimer2 = null;
    },
    loginMethodClick(status) {
      this.loginMethod = status;
      this.codeOk2 = false;
      if (status) {
        clearInterval(this.timers);
        this.clearCodetime();
      } else {
        this.codeImgStatus = false;
        this.codeOk = false;
        clearInterval(this.timers);
        const location = window.location.origin;
        this.$api.preconditions({ userId: this.user.pkId }).then(res => {
          if (res.code == 200) {
            this.$refs.codeImg.innerHTML = "";
            const sendData = res.data.scanCode;
            // this.$api.addQRCode().then(res => {
            //   if (res.code === 200) {
            this.unique = res.data.scanCode;
            const data = `scanCode?scanCode=${sendData}`;
            new QRCode("codeImg", {
              // width: 252,
              // height: 252,
              text: `${location}/h5/#/pages/h5/scanCodeTran?type=1&unique=${res.data.scanCode}&data=${data}`
            });
            this.queryQRCode(1);
            //   } else {
            //     this.$message.warning(res.msg);
            //   }
            // });
            this.scanCodeData = {
              expireTime: res.data.expireTime,
              scanCode: res.data.scanCode,
              serviceTime: res.data.serviceTime
            };
            this.scanCodeTask();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    queryQRCode() {
      clearInterval(this.codeTimer);
      this.codeTimer = setInterval(() => {
        this.$api.queryQRCode({ unique: this.unique }).then(res => {
          if (res.code === 200) {
            if (res.data === 1) {
              clearInterval(this.codeTimer);
              this.codeOk = true;
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
    scanCodeTask() {
      const _this = this;
      const expireTime = this.scanCodeData.expireTime / 1000;
      let time = 0;
      this.timers = setInterval(() => {
        time = time + 1;
        if (time >= expireTime) {
          this.codeImgStatus = true;
          this.codeOk = false;
          clearInterval(this.timers);
        } else {
        }
        this.$api.scanCodeLogin({ scanCode: this.scanCodeData.scanCode }).then(res => {
          if (res.code == 200) {
            if ([3, 4].includes(res.data.loginStatus)) {
              clearInterval(this.timers);
              sessionStorage.setItem("token", res.data.access_token);
              this.loadings = false;
              this.$store.commit("setLoginDialog", false);
              this.$emit("getUserList");
            } else if (res.data.loginStatus == 5) {
              clearInterval(this.timers);
            } else if (res.data.loginStatus == 6) {
              clearInterval(this.timers);
              this.codeErr = res.data.errorMsg;
              this.codeOk2 = true;
            }
          } else {
            clearInterval(this.timers);
            this.codeImgStatus = true;
            this.codeOk = false;
            this.loading = false;
            this.$message.warning(res.msg);
          }
        });
      }, 3000);
    },
    // 获取图形验证码
    async getImgecode() {
      this.loadings = true;
      this.imgCodeStatus = false;
      this.popup = true; // 控制弹窗
      await this.$api
        .imgCode()
        .then(res => {
          if (res.code === 200) {
            this.loadings = false;
            // this.imgCode = res.img;
            this.imgCode = res;
            this.ruleForm.uuid = res.uuid;
            this.imgCodeStatus = true;
          } else {
            this.loadings = false;
            this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(err => {
          this.loadings = false;
        });
    },

    // 获取手机验证码
    getCode() {
      // 校验手机号
      const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(this.user.telephone)) {
        this.$message({ message: "请输入正确的手机号码", type: "error" });
        return;
      }
      this.ruleForm.code = "";
      this.getImgecode();
    },
    // 关闭获取短信的弹窗
    closePop() {
      this.ruleForm.code = "";
      this.ruleFormCode = "";
      console.log("关闭了短信弹窗");
    },

    // 获取短信验证码
    getNote(val) {
      // if (!this.ruleFormCode) {
      //   this.$message({ message: "请输入正确的图形验证码", type: "error" });
      //   return;
      // }
      this.loadings = true;
      const data = {
        code: val,
        phoneNumber: this.user.telephone,
        uuid: this.ruleForm.uuid,
        sendType: 1
      };
      this.$api
        .mobileMsg(data)
        .then(res => {
          // this.closePop(); //清空输入框code uuid
          if (res.code === 200) {
            this.loadings = false;
            this.popup = false;
            this.$message({ message: "短信验证码发送成功", type: "success" });
            this.ruleForm.uuid = res.data;
            const _this = this;
            _this.timerStatus = false;
            const authTimer = setInterval(() => {
              _this.timer--;
              if (_this.timer <= 0) {
                // _this.disableds = true;
                _this.timerStatus = true;
                _this.timer = 60;
                clearInterval(authTimer);
              }
            }, 1000);
          } else {
            this.loadings = false;
            this.getImgecode();
            this.errShow = true;
            setTimeout(() => {
              this.errShow = false;
            }, 3000);
            // this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(err => (this.loadings = false));
    }
  }
};
</script>

<style scoped lang="scss">
@import "../../styles/variables.scss";
.loginDia {
  /deep/ .el-dialog {
    width: 400px;
  }
}
.jw-code {
  margin-bottom: 18px;
}

.login-warp {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-image: url(../../assets/loginBg.jpg);
  background-size: 100% 100%;
  justify-content: center;
  align-items: center;
}

.login-box {
  // width: 438px;
  width: 400px;
  height: 500px;
  border-radius: 6px;
  background: #ffffff;

  .yx-tit {
    margin: 0 auto;
    text-align: center;
    margin-top: 20px;

    img {
      width: 200px;
      height: 65px;
      opacity: 1;
    }
  }

  .text {
    text-align: center;
    color: #74bcff;
    font-size: 17px;
    text-indent: 1em;
  }

  .left-text {
    margin: 30px 0px;
    text-indent: 1em;
    // border-left: 4px solid #56a9ff;
    color: #56a9ff;
    position: relative;

    .left-ico {
      position: absolute;
      width: 4px;
      height: 20px;
      background-color: #1890ff;
      border-radius: 2px;
      left: 0;
      top: 0x;
    }
  }

  .scanning-prompt {
    margin-top: 38px;
    margin-left: 50px;
    font-size: 17px;
    color: #000;
    font-weight: 600;
  }

  .code-box {
    width: 282px;
    height: 282px;
    margin: 0 auto;
    background-color: #f1f1f1;
    padding: 15px;
    margin-top: 35px;

    .mask-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);

      .mask-layer-text {
        font-size: 18px;
        font-weight: 700;
        color: rgba(51, 51, 51, 1);
        margin-top: 94px;
        text-align: center;
      }

      .mask-layer-btn {
        margin: 0 auto;
        margin-top: 40px;
        width: 153px;
        height: 40px;
        line-height: 40px;
        opacity: 1;
        border-radius: 2px;
        color: #fff;
        background: rgba(24, 144, 255, 1);
        text-align: center;
      }
    }

    .code-img {
      width: 252px;
      height: 252px;
      opacity: 1;
    }

    .codeOk {
      top: 0;
      left: 0;
    }
  }

  .explain-box {
    width: 282px;
    margin: 0 auto;
    height: 30px;
    margin-top: 35px;
    margin-bottom: 75px;

    .explain-img {
      width: 30px;
      height: 30px;
    }

    .explain-text {
      font-size: 12px;
    }
  }
}

.login-code {
  cursor: pointer;
  position: absolute;
  top: 0px;
  right: 0;
  width: 40%;
  height: 40px;
  text-align: right;

  img {
    width: 100%;
    height: 100%;
  }
}

// 记住密码
.operate {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 10px;
  cursor: pointer;

  .forget-password {
    color: $mainColor;
  }
}

// 修改input位number类型时，光标不居中的问题
/deep/ .el-input__inner {
  line-height: 0 !important;
}

.hint {
  font-size: 16px;
}

.spacing {
  display: block;
  margin: 0 auto 15px;
}

.btn-code {
  margin: 20px 0;
}

.no-yet {
  /* display: flex;
    justify-content: space-between; */
  margin-top: 30px;
  font-size: 14px;
  text-align: center;

  span:nth-child(2) {
    color: $mainColor;
    cursor: pointer;
  }
}

.record {
  color: #fff;
  width: 100%;
  text-align: center;
  position: fixed;
  left: 0;
  font-size: 13px;
  bottom: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
}

/deep/ .el-form-item__label {
  text-align: left;
}

/deep/ .el-form-item__label:before {
  display: none;
}

.multi-account {
  background-image: url(../../assets/maskLayer.png);

  /deep/ .el-dialog__footer {
    border: none;
  }

  .multi-account-title {
    font-size: 24px;
    color: #52acff;
    padding-top: 62px;
    padding-bottom: 35px;
  }

  .center {
    // margin-top: 25px;
    text-align: center;
  }

  /deep/ .el-dialog__header {
    padding: 0;
  }

  /deep/ .el-dialog {
    background: #fff;
    border-radius: 10px;
  }

  /deep/ .el-dialog__title {
    font-size: 24px;
    // font-weight: 800;
    color: #3b7ce6;
  }

  .radio-button {
    display: block;

    /deep/ .el-radio-button__inner {
      width: 100%;
    }
  }

  .centerDialog {
    max-height: 478px;
    overflow: auto;

    .item-box {
      width: 340px;
      height: 90px;
      background-color: #e4edf3;
      margin: 0 auto;
      border-radius: 8px;
      margin-bottom: 20px;
      color: #333333;

      .head-portrait {
        width: 60px;
        height: 60px;
        line-height: 60px;
        margin-top: 16px;
      }

      .filleted-corner {
        background: #fff;
        border-radius: 50%;
      }

      .item-box-title {
        text-align: left;
        font-size: 16px;
        line-height: 18px;
        margin-top: 13px;
        width: 200px;
        overflow: hidden; //溢出内容隐藏
        text-overflow: ellipsis; //文本溢出部分用省略号表示
        display: -webkit-box; //特别显示模式
        -webkit-line-clamp: 2; //行数
        line-clamp: 2;
        -webkit-box-orient: vertical; //盒子中内容竖直排列
      }

      .mange-user {
        position: relative;
        margin-top: 6px;
        width: 72px;
        height: 24px;
        background: #1890ff;
        border-radius: 12px;
        color: #fff;
        font-size: 12px;

        .mange-user-img {
          position: absolute;
          left: 6px;
          top: 3px;

          .user-img-ico {
            width: 18px;
            height: 18px;
            line-height: 17px;
            color: #1890ff;
            background: #fff;

            /deep/ .el-icon-user-solid {
              font-size: 12px;
            }
          }
        }

        .mange-user-text {
          position: absolute;
          left: 29px;
          top: 4px;
        }
      }
    }
    .item-box-forbidden {
      background-color: #ccc;
    }
    .pitch-on {
      background: repeating-linear-gradient(to bottom, #7cd1f8, #21b2f2);
      color: #fff;

      .mange-user {
        background-color: #fff;
        color: #1890ff;

        .mange-user-img {
          .user-img-ico {
            color: #fff;
            background: #1890ff;
          }
        }
      }
    }
  }

  ::-webkit-scrollbar {
    width: 3px;
    color: #fff;
    background-color: #fcfcfc;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgb(209, 209, 209);
  }

  .btn-width {
    width: 157px;
  }
}

.violet {
  font-size: 14px;
  color: rgb(90, 11, 163);
}

.edit-box {
  background-image: url(../../assets/maskLayer.png);

  /deep/ .el-form-item__label {
    text-align: right;
  }

  .close-program {
    position: absolute;
    top: 5px;
    right: 0;
  }
}

.qr-title {
  text-align: center;

  .close-qrcode {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  .hint-tit {
    padding-top: 20px;
  }

  /deep/ .el-dialog__header {
    // background-color: #cfd7da;
    text-align: left;
  }

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
      color: #3aa1ff;
    }
  }
}

// 新数据
.bj-text {
  position: absolute;
  left: 701px;
  top: 360px;
  width: 352px;
  height: 125px;
}

.phone-area {
  border: 1px solid #c0c4cc;
  border-radius: 4px;

  .right-vertical {
    width: 1px;
    height: 20px;
    background: #c0c4cc;
    display: inline-block;
    position: absolute;
    right: 0;
    top: 10px;
  }
}

.phone-area /deep/ .el-input__inner {
  border: none;
  box-shadow: none;
}
.returnBtn {
  position: absolute;
  left: 2px;
  top: 1px;
  z-index: 5;
}
// ==================
.trans {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 50px;
  // background-image: url(../../assets/QRcode.png);
  // background-color: #2b96e6; //图标优化 -- 换为白色线条图标 背景层添加背景色QRcode
}

.imgApp {
  width: 64px;
  height: 64px;
  background: linear-gradient(225deg, transparent 45px, #fff 0);
}

.code {
  width: 100%;
  height: 100%; //将登录框挤出显示区域
  text-align: center;
  display: none;
}

.code img {
  margin-top: 80px;
}

.codeOk {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 1;
  border: 2px solid #000;

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

.dialog-footers {
  display: flex;
  justify-content: center;
  align-items: center;

  .mr-20 {
    margin-right: 20px;
  }

  .footerBrn {
    padding: 12px 64px;
    border-radius: 2px;
    color: #fff;
    cursor: pointer;
  }

  .okBtn {
    background: linear-gradient(180deg, rgba(124, 209, 248, 1) 0%, rgba(7, 169, 240, 1) 100%);
  }

  .cancelBtn {
    background: linear-gradient(180deg, rgba(214, 214, 214, 1) 0%, rgba(171, 171, 171, 1) 100%);
  }
}
</style>
