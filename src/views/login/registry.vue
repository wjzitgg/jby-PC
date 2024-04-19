<template>
  <div class="login-warp">
    <!-- 左侧logo -->
    <div class="left-logo"></div>
    <!-- 左侧注册框 -->
    <div class="right-box">
      <div class="reverse-back" @click="backLogin">
        <img src="@/assets/reverseback.png" alt="" />
        返回登陆页
      </div>
      <div class="login-box" v-loading="loading">
        <div class="yx-tit">账号注册</div>
        <div>
          <div style="display: flex">
            <div style="padding-top: 50px">
              <img style="display: block" src="../../assets/step1.png" alt="" />
              <div style="width: 1px; height: 118px; background: #45a2fc; margin-left: 50%"></div>
              <img style="display: block" src="../../assets/step2.png" alt="" />
              <div style="width: 1px; height: 124px; background: #45a2fc; margin-left: 50%"></div>
              <img style="display: block" src="../../assets/step3.png" alt="" />
              <div style="width: 1px; height: 124px; background: #45a2fc; margin-left: 50%"></div>
              <img style="display: block" src="../../assets/step4.png" alt="" />
            </div>
            <div>
              <div class="step-box step-box-min">
                <div class="step-table">第一步选择类型</div>
                <div style="margin-top: 14px">
                  <div class="step-text" style="margin-right: 20px; font-size: 16px; color: #333333ff">注册类型</div>
                  <div class="step-text step-radio small-hand" style="margin-right: 8px" :class="{ 'pitch-on': ruleForm.orgType == 6 }" @click="registrationStatus(6)">
                    <div class="supply"></div>
                    <span> 供应商</span>
                    <img class="register-img" v-if="ruleForm.orgType == 6" src="@/assets/select.png" alt="" />
                  </div>
                  <div class="step-text step-radio small-hand" :class="{ 'pitch-on': ruleForm.orgType == 7 }" @click="registrationStatus(7)">
                    <div class="sub-package"></div>
                    <span> 分包单位</span>
                    <img class="register-img" v-if="ruleForm.orgType == 7" src="@/assets/select.png" alt="" />
                  </div>
                </div>
              </div>
              <div class="step-box step-box-center">
                <div class="step-table">第二步：输入企业名称</div>
                <div style="margin-top: 14px">
                  <el-input placeholder="请输入企业名称" v-model.trim="ruleForm.orgName" maxlength="50" @blur="checkOrgName"></el-input>
                </div>
              </div>
              <div class="step-box step-box-center">
                <div class="step-table">第三步：输入手机号码</div>
                <div style="margin-top: 14px">
                  <el-row>
                    <el-col :span="16">
                      <el-row class="phone-area">
                        <el-col :span="6" style="position: relative">
                          <el-select v-model="areaCode" placeholder="请选择">
                            <el-option label="+86" :value="1"></el-option>
                          </el-select>
                          <span class="right-vertical"></span>
                        </el-col>
                        <el-col :span="18">
                          <el-input v-model.trim="ruleForm.linkPhone" maxlength="11" placeholder="请输入手机号码" @input="focusCode" @keydown.native="keyDown"> </el-input>
                        </el-col>
                      </el-row>
                    </el-col>
                    <el-col :span="8">
                      <div class="login-code" @click="getCode" v-if="disableds">
                        <el-button type="primary" :disabled="ruleForm.linkPhone.length != 11">获取验证码</el-button>
                      </div>
                      <div class="login-code" v-if="!disableds">
                        <el-button type="primary">{{ timer }}秒后重试</el-button>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <div class="step-box step-box-max">
                <div class="step-table">第四步：输入验证码</div>
                <div style="margin-top: 8px">
                  <div class="g-remove-check-code_content" @keyup="fnCheckCodeKeyup" @keydown="fnCheckCodeKeydown" @paste="fnCheckCodeKeyPaste" @input="fnCheckCodeInputEvent">
                    <input :class="{ 'g-code-input_color': aCheckCodeInputComputed[0] !== '' }" max="9" min="0" maxlength="1" data-index="0" v-model.trim.number="aCheckCodeInputComputed[0]" type="number" :disabled="codeStatus" ref="firstInputRef" />
                    <input :class="{ 'g-code-input_color': aCheckCodeInputComputed[1] !== '' }" max="9" min="0" maxlength="1" data-index="1" v-model.trim.number="aCheckCodeInputComputed[1]" type="number" :disabled="codeStatus" />
                    <input :class="{ 'g-code-input_color': aCheckCodeInputComputed[2] !== '' }" max="9" min="0" maxlength="1" data-index="2" v-model.trim.number="aCheckCodeInputComputed[2]" type="number" :disabled="codeStatus" />
                    <input :class="{ 'g-code-input_color': aCheckCodeInputComputed[3] !== '' }" max="9" min="0" maxlength="1" data-index="3" v-model.trim.number="aCheckCodeInputComputed[3]" type="number" :disabled="codeStatus" />
                  </div>
                  <p class="g-remove-check-code_tip" v-if="timeShow">
                    <i class="el-icon-warning"></i>
                    <!-- ruleForm.linkPhone -->
                    短信验证码已发送至您的手机号码:{{ telephone }}; 有效结束:<span>0{{ minutes }}: <span v-if="seconds.length == 1">0</span>{{ seconds }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="register-btn small-hand" @click="registry">注册</div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="popup" center top="30vh" title="请完成下列验证!" width="24%" @close="closePop">
      <div class="dialog-form" style="padding-bottom: 20px">
        <Slider style="margin: 0 auto" v-if="imgCodeStatus" :imgurl="imgCode.img" :miniimgurl="imgCode.smallImage" :h="imgCode.oriImageHeight" :w="imgCode.oriImageWidth" :sw="imgCode.slidingWidth" :sh="imgCode.slidingHeight" :sliderText="imgCode.captchaType" :blocky="imgCode.yHeight" @getNote="getNote" :code="imgCode.xWidth" @refresh="refresh" :errShow="errShow" />
      </div>
    </el-dialog>
    <el-dialog :visible.sync="forgpass" center :show-close="false" class="fpsuee" :close-on-click-modal="false">
      <!-- <div class="dialog-form"> -->
      <img src="../../assets/u298.svg" alt="" />
      <!-- <p>我们会尽快审核您提交的资料</p>
      <p>审核结果会通过短信方式通知您</p> -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="backs">选择账号</el-button>
      </span>
      <!-- </div> -->
    </el-dialog>
  </div>
</template>

<script>
import pictureUpload from "@/components/pictureUpload";
import Slider from "@/components/SlideVerify";
export default {
  components: {
    pictureUpload,
    Slider
  },
  data() {
    return {
      ruleForm: {
        orgType: "",
        orgName: "",
        orgScale: "",
        linkMan: "",
        linkPhone: "",
        loginName: "",
        loginPassword: "",
        code: "",
        uuid: "",
        authPhotoUrl: ""
      },
      imgCode: "",
      typeNumber: 0, // 0图形验证码登录 1是手机验证码登录
      popup: false,
      forgpass: false,
      disableds: true,
      timer: 60,
      areaCode: 1,
      aCheckCodeInput: ["", "", "", ""], // 存储输入验证码内容
      aCheckCodePasteResult: [],
      process: 0,
      minutes: 9,
      seconds: 59,
      timeShow: false,
      imgCode: {},
      imgCodeStatus: false,
      errShow: false,
      loading: false,
      telephone: "",
      codeStatus: true,
      checkOrgStatus: true
    };
  },
  created() {
    this.getImgecode();
  },
  computed: {
    // 验证码计算属性
    aCheckCodeInputComputed() {
      if (this.aCheckCodePasteResult.length === 4) {
        return this.aCheckCodePasteResult;
      } else if (this.aCheckCodeInput && Array.isArray(this.aCheckCodeInput) && this.aCheckCodeInput.length === 4) {
        return this.aCheckCodeInput;
      } else if (/^\d{4}$/.test(this.aCheckCodeInput.toString())) {
        return this.aCheckCodeInput.toString().split("");
      } else {
        return new Array(4);
      }
    }
  },
  watch: {
    "ruleForm.linkPhone"(val) {
      // if (val.length == 11) {
      // this.seconds = 0;

      this.timeShow = false;
      window.clearInterval(this.time);
      sessionStorage.setItem("timeShow", JSON.stringify("false"));
      // clearInterval(this.time);
      this.minutes = 9;
      this.seconds = 59;
      this.disableds = true;
      clearInterval(this.authTimer);
      this.timer = 60;
      // }
    }
  },
  methods: {
    checkOrgName() {
      this.$api.checkOrgName({ orgName: this.ruleForm.orgName }).then(res => {
        if (res.code == 200) {
          if (res.data == false) {
            this.$message.error("企业名称已经在系统存在，请重新输入");
            this.checkOrgStatus = res.data;
          }
          this.checkOrgStatus = res.data;
        } else {
          this.$message.error(res.data);
        }
      });
    },
    backs() {
      this.$router.push("/login");
    },
    // 清空验证码
    focusCode(value) {
      let val = value;
      val = val.replace(/^\.+|[^\d.]/g, "");
      this.ruleForm.linkPhone = val;
      if (this.ruleForm.linkPhone.length > 11) this.ruleForm.linkPhone = this.ruleForm.linkPhone.slice(0, 11);
      if (this.ruleForm.linkPhone.length < 11) {
        this.aCheckCodeInputComputed.forEach((item, index) => {
          this.$set(this.aCheckCodeInputComputed, index, "");
        });
      }
    },
    // linkPhoneChange(){
    //   if(this.ruleForm.linkPhone.length ==11){
    //     alert(2222)
    //   }
    // },
    backLogin() {
      this.$router.push("/login");
    },
    registrationStatus(type) {
      this.ruleForm.orgType = type;
      this.process = 1;
    },
    // orgNameInput(val) {
    //   if (this.process != 1 && this.process != 2) {
    //     this.ruleForm.orgName = ""
    //     return this.$message.warning("请选择第一步 注册类型")
    //   }
    // },
    // orgNameBlur() {
    //   // console.log(this.ruleForm.orgName)
    //   if (this.ruleForm.orgName.length < 2) {
    //     this.$message({ message: "企业名称长度只能在2-50之间", type: "error" });
    //     return;
    //   }
    //   if (this.ruleForm.orgName.length >= 2) {
    //     this.process = 2
    //   }
    // },
    // linkPhoneInput(val) {
    //   if (this.process != 2 && this.process != 3) {
    //     this.ruleForm.orgName = ""
    //     return this.$message.warning("请操作第二步 输入企业名称")
    //   }
    // },
    // linkPhoneBlur() {
    //   const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
    //   if (!myreg.test(this.ruleForm.linkPhone)) {
    //     this.$message({ message: "请输入正确的手机号码", type: "error" });
    //     return;
    //   }
    // },
    // 输入验证码，更新验证码数据
    fnCheckCodeKeyup(e) {
      // if (this.process != 3 && this.process != 4) {
      //   this.aCheckCodeInput = ['', '', '', ''];
      //   return this.$message.warning("请操作第三步 获取验证码")
      // }
      const index = e.target.dataset.index * 1;
      const el = e.target;
      // 解决输入e的问题
      el.value = el.value.replace(/Digit|Numpad/i, "").slice(0, 1);
      if (/Digit|Numpad/i.test(e.code)) {
        // 必须在这里赋值，否则输入框会是空值
        this.aCheckCodeInput.splice(index, 1, e.code.replace(/Digit|Numpad/i, ""));
        el.nextElementSibling && el.nextElementSibling.focus();
        if (index === 3) {
          if (this.aCheckCodeInput.join("").length === 4) document.activeElement.blur();
        }
      }
    },
    // 输入验证码，检测位置变化
    fnCheckCodeKeydown(e) {
      let index = e.target.dataset.index * 1;
      const el = e.target;
      if (e.key === "Backspace") {
        if (this.aCheckCodeInput[index].length > 0) {
          this.aCheckCodeInput.splice(index, 1, "");
        } else {
          if (el.previousElementSibling) {
            el.previousElementSibling.focus();
            this.aCheckCodeInput[index - 1] = "";
          }
        }
      } else if (e.key === "Delete") {
        if (this.aCheckCodeInput[index].length > 0) {
          this.aCheckCodeInput.splice(index, 1, "");
        } else {
          if (el.nextElementSibling) {
            el.nextElementSibling.focus();
            this.aCheckCodeInput[++index] = "";
          }
        }
      } else if (e.key === "Home") {
        el.parentElement.children[0] && el.parentElement.children[0].focus();
      } else if (e.key === "End") {
        el.parentElement.children[this.aCheckCodeInput.length - 1] && el.parentElement.children[this.aCheckCodeInput.length - 1].focus();
      } else if (e.key === "ArrowLeft") {
        if (el.previousElementSibling) el.previousElementSibling.focus();
      } else if (e.key === "ArrowRight") {
        if (el.nextElementSibling) el.nextElementSibling.focus();
      }
    },
    // 输入验证码，解决一个输入框输入多个字符的问题
    fnCheckCodeInputEvent(e) {
      const index = e.target.dataset.index * 1;
      const el = e.target;
      el.value = el.value.replace(/Digit|Numpad/i, "").slice(0, 1);
      console.log(this.aCheckCodeInput);
      this.aCheckCodeInput[index] = el.value;
      const arr = this.aCheckCodeInput.join("");
      if (arr.length == 4) {
        this.process = 4;
      }
    },
    // 验证码粘贴
    fnCheckCodeKeyPaste(e) {
      e.clipboardData.items[0].getAsString(str => {
        if (str.toString().length === 4) {
          this.aCheckCodePasteResult = str.split("");
          document.activeElement.blur();
          this.aCheckCodeInput = this.aCheckCodeInputComputed;
          this.aCheckCodePasteResult = [];
        } else {
          // 如果粘贴内容不合规，清除所有内容
          this.aCheckCodeInput = ["", "", "", ""];
        }
      });
    },

    // 禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    isNumber(str) {
      // 利用正则表达式进行匹配
      return /^\d+$/.test(str);
    },
    registry() {
      // if (this.process != 4) {
      //   return this.$message.warning("请完成上面所有步骤")
      // }
      if (!this.ruleForm.orgType) {
        return this.$message.warning("请选择注册类型");
      }
      if (!this.ruleForm.orgName) {
        return this.$message.warning("请输入企业名称");
      }
      if (!this.checkOrgStatus) {
        return this.$message.warning("企业名称重复请重新输入");
      }
      if (this.ruleForm.orgName.length < 2 || this.ruleForm.orgName.length > 50) {
        this.$message({ message: "企业名称长度只能在2-50之间", type: "error" });
        return;
      }
      if (!this.ruleForm.linkPhone) {
        return this.$message.warning("请输入手机号码");
      }
      this.ruleForm.code = this.aCheckCodeInput.join("");
      if (this.ruleForm.code.length != 4) {
        return this.$message.warning("请输入正确的验证码");
      }
      if (!this.isNumber(this.ruleForm.code)) {
        return this.$message.warning("请输入正确的验证码");
      }
      const data = { ...this.ruleForm };
      data.authPhotoUrl = this.ruleForm.authPhotoUrl[0];
      this.loading = true;
      this.$api
        .AccountRegistration(data)
        .then(res => {
          this.loading = false;
          console.log(res);
          if (res.code == 200) {
            sessionStorage.setItem("restoken", res.data.access_token);
            sessionStorage.setItem("personalCertificateShow", 1);
            sessionStorage.setItem("registryData", JSON.stringify(res.data));
            sessionStorage.setItem("accountList", JSON.stringify(this.userList));
            sessionStorage.setItem("ruleForm", JSON.stringify(this.ruleForm));
            this.forgpass = true;
            console.log(sessionStorage.getItem("personalCertificateShow"));
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    refresh() {
      this.getImgecode();
    },
    // 获取图形验证码
    async getImgecode() {
      this.imgCodeStatus = false;
      await this.$api
        .imgCode()
        .then(res => {
          if (res.code === 200) {
            this.imgCode = res.img;
            this.ruleForm.uuid = res.uuid;

            this.imgCode = res;
            this.imgCodeStatus = true;
          } else {
            this.refresh();
            this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(err => {});
    },

    // 获取手机验证码
    getCode() {
      // 校验手机号
      const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(this.ruleForm.linkPhone)) {
        this.$message({ message: "请输入正确的手机号码", type: "error" });
        return;
      }
      this.getImgecode();
      this.ruleForm.code = "";
      this.popup = true; // 控制弹窗
    },
    // 关闭获取短信的弹窗
    closePop() {
      this.ruleForm.code = "";
      // this.ruleForm.uuid = "";
      // console.log("关闭了短信弹窗");
    },

    // 获取短信验证码
    getNote(val) {
      // if (!this.ruleForm.code) {
      //   this.$message({ message: "请输入正确的图形验证码", type: "error" });
      //   return;
      // }
      const data = {
        code: val,
        phoneNumber: this.ruleForm.linkPhone,
        sendType: "4",
        uuid: this.ruleForm.uuid
      };
      this.$api
        .mobileMsg(data)
        .then(res => {
          // this.closePop(); //清空输入框code uuid
          if (res.code === 200) {
            this.popup = false;
            this.add();
            this.timeShow = true;
            this.process = 3;
            this.$message({ message: "短信验证码发送成功", type: "success" });
            this.telephone = this.ruleForm.linkPhone;
            this.ruleForm.uuid = res.data;
            this.ruleForm.code = "";
            const _this = this;
            _this.disableds = false;
            this.codeStatus = false;
            const authTimer = setInterval(() => {
              _this.timer--;
              if (_this.timer <= 0) {
                _this.disableds = true;
                _this.timer = 60;
                clearInterval(authTimer);
                // _this.telephone = ""
              }
            }, 1000);
          } else {
            this.getImgecode();
            this.errShow = true;
            setTimeout(() => {
              this.errShow = false;
            }, 3000);
          }
        })
        .catch(err => {});
    },
    add() {
      const _this = this;
      const time = window.setInterval(function() {
        if (_this.seconds === 0 && _this.minutes !== 0) {
          _this.seconds = 59;
          _this.minutes -= 1;
        } else if (_this.minutes === 0 && _this.seconds === 0) {
          _this.seconds = 0;
          _this.timeShow = false;
          window.clearInterval(time);
          sessionStorage.setItem("timeShow", JSON.stringify("false"));
        } else {
          _this.seconds -= 1;
        }
      }, 1000);
    }
  }
};
</script>
<style scoped lang="scss">
@import "../../styles/variables.scss";

.jw-code {
  margin-bottom: 18px;
}

.gap {
  margin-top: 26px;
}

.login-warp {
  width: 100%;
  height: 100%;
  display: flex;

  .left-logo {
    width: 459px;
    height: 100%;
    background-image: url(../../assets/register.png);
  }

  .right-box {
    position: relative;

    .reverse-back {
      position: absolute;
      top: 56px;
      left: 66px;
      color: rgba(24, 144, 255, 1);
      width: 138px;
      line-height: 48px;
      background: rgba(231, 244, 255, 1);
      text-align: center;
      border-radius: 22px;

      img {
        display: inline-block;
        vertical-align: middle;
        height: 17px;
      }
    }

    .reverse-back:hover {
      cursor: pointer;
    }
  }
}

.login-box {
  position: fixed;
  top: 7%;
  left: 55%;
  // width: 100%;
  margin-left: -225px;
  border-radius: 6px;
  background: #ffffff;
  width: 700px;
  padding: 45px 45px 45px 45px;
  .yx-tit {
    // width: 400px;
    // text-align: center;
    padding-left: 35%;
    color: #1890ffff;
    font-size: 28px;
  }
}

.login-code {
  cursor: pointer;
  position: absolute;
  top: 0px;
  right: 0;
  width: 41%;
  height: 40px;
  text-align: right;

  img {
    width: 100%;
    height: 100%;
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
  display: flex;
  justify-content: space-between;
  font-size: 14px;

  span:nth-child(2) {
    color: $mainColor;
    cursor: pointer;
  }
}

/deep/ .el-form-item__label:before {
  content: "" !important;
}

.fpsuee {
  img {
    display: block;
    margin: 0 auto 20px;
  }

  p {
    text-align: center;
    line-height: 1.5;
    font-size: 22px;
  }
}

/deep/.el-form-item {
  margin-bottom: 5px;
}

.iconkaiye {
  color: red;
  font-size: 50px;
  text-align: center;
  display: flow-root;
}

.avatar-uploader {
  width: 320px;
  height: 200px;
  text-align: center;
  border: 1px dashed #bbb3b3;
  border-radius: 6px;
  cursor: pointer;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.registry {
  width: 120px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 320px;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
}

.el-icon-error {
  font-size: 20px;
  position: absolute;
  right: -16px;
  top: -16px;
}

.step01,
.step02,
.step03,
.step04 {
  width: 35px;
  height: 35px;
  background-size: 100% 100%;
}

.step01 {
  background-image: url("../../assets/step1.png");
}

.step02 {
  background-image: url("../../assets/step2.png");
}

.step03 {
  background-image: url("../../assets/step3.png");
}

.step04 {
  background-image: url("../../assets/step4.png");
}

// =====
/deep/ .el-steps {
  width: 80%;

  .el-step.is-horizontal .el-step__line {
    top: 50%;
    left: 94px;
    right: 48px;
  }

  .el-step__head.is-process {
    border-color: #dedede;
  }

  .el-step__head.is-finish {
    border-color: #285edf;
  }

  .el-step__title.is-process {
    color: #dedede;
  }

  .el-step__title.is-finish {
    color: #285edf;
  }

  .el-step__icon {
    width: 56px;
    height: 56px;
  }

  .is-finish .step02 {
    // background-image: url("~@/assets/images2/1_bank.png");
  }

  .is-finish .step03 {
    // background-image: url("~@/assets/images2/1_legal_person.png");
  }

  .is-finish .step04 {
    // background-image: url("~@/assets/images2/user_user.png");
  }
}

/deep/ .el-step__line {
  left: 26px !important;
}

.supply {
  position: absolute;
  top: 8px;
  left: 0;
  display: inline-block;
  height: 40px;
  width: 42px;
  background-image: url(../../assets/subpackage.png);
}

.sub-package {
  position: absolute;
  top: 8px;
  left: 0;
  display: inline-block;
  height: 40px;
  width: 42px;
  background-image: url(../../assets/supply.png);
}

.register-img {
  display: inline-block;
  vertical-align: middle;
}

.step-box {
  margin-top: 30px;
  margin-left: 20px;
  background: #f6f7fa;
  padding: 10px;
  width: 472px;
  height: 144px;
  border-radius: 10px;

  .step-table {
    font-size: 20px;
    font-weight: 500 !important;
    color: #333333ff !important;
  }

  .step-text {
    display: inline-block;
    line-height: 50px;
    font-size: 16px;
  }

  .step-radio {
    position: relative;
    padding-left: 42px;
    width: 164px;
    height: 50px;
    background: #fff;
    border-radius: 8px;
  }

  span {
    display: inline-block;
    margin: 0 20px 0 10px;
    color: #777777ff;
    font-size: 16px;
  }
}

.step-box-center {
  padding: 24px 59px 39px 24px;
}

.step-box-min {
  height: 124px;
  padding-top: 24px;
  padding-left: 24px;
}

.step-box-max {
  height: 164px;
  padding-top: 24px;
  padding-left: 24px;
}

.pitch-on {
  background: #d6ebff !important;
  border: 1px solid #1890ff;
  color: rgba(51, 51, 51, 1);
}

.small-hand:hover {
  cursor: pointer;
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
    right: -19px;
    top: 10px;
  }
}

.phone-area /deep/ .el-input__inner {
  border: none;
  box-shadow: none;
}

/deep/ .el-input--suffix .el-input__inner {
  padding-right: 0.5625vw !important;
}

.g-remove-check-code_title {
  font-size: 14px;
  color: #666;
}

.g-remove-check-code_content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 400px;
  padding: 18px 0 20px 0;
  margin: 0 auto;
}

.g-remove-check-code_content input {
  width: 40px;
  height: 40px;
  font-size: 28px;
  text-align: center;
  border: none;
  outline: none;
  border: solid 1px #50aafe;
  border-radius: 4px;
  -moz-appearance: textfield;
}

.g-remove-check-code_content input.g-code-input_color {
  border-color: #5290ff;
}

.g-remove-check-code_content input::-webkit-outer-spin-button,
.g-remove-check-code_content input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.g-remove-check-code_tip {
  font-size: 12px;
  color: #178fff;
  text-align: center;

  span {
    color: #178fff;
    font-size: 12px;
    font-weight: 400;
  }
}

.register-btn {
  text-align: center;
  width: 368px;
  height: 48px;
  background: #3f94fd;
  border-radius: 25px;
  color: #fff;
  line-height: 48px;
  margin: 0 auto;
  margin-top: 20px;
  box-shadow: 4px 8px 8px 1px #cfe3fe;
}
</style>
