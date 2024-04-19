<template>
  <div class="box" v-loading="loading">
    <div class="box-title">
      <div v-if="type == '1'">{{ user.orgType != 5 ? tipText : "企业未实名,请联系施工单位管理员实名" }}</div>
      <!--  -->
      <div v-if="type == '2'">{{ user.orgType != 5 ? promptText : "企业授权已过期，请联系施工单位管理员进行授权" }}</div>
    </div>
    <div class="box-btn" v-if="user.isMaster == 1 && type == 1 && user.orgType != 5" @click="StartRealName">
      开始实名
    </div>
    <div class="box-btn" v-if="user.isMaster == 1 && type == 2 && user.orgType != 5" @click="authorization">
      开始授权
    </div>
    <!--企业认证验证-->
    <el-dialog :close-on-press-escape="false" class="edit-box edit-enterprise" title="企业与经办人实名认证" :append-to-body="appendToBody" :visible.sync="enterpriseShow" width="40%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div style="padding:20px">
        <el-form :model="enterpriseForm" ref="enterpriseForm">
          <el-form-item label="组织机构名称" prop="name" label-width="140px">
            <el-input size="mini" v-model.trim="enterpriseForm.orgName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="组织机构证件类型" prop="certType" label-width="140px">
            <el-select size="mini" v-model="enterpriseForm.certType" placeholder="请选择">
              <el-option label="统一社会信用代码" value="CRED_ORG_USCC"></el-option>
              <el-option label="工商注册号" value="CRED_ORG_REGCODE"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="组织机构证件号" prop="name" label-width="140px">
            <el-input size="mini" v-model.trim="enterpriseForm.certNo" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="组织机构类型" prop="organizationType" label-width="140px">
            <el-select size="mini" v-model="enterpriseForm.organizationType" placeholder="请选择">
              <el-option label="企业类" value="1"></el-option>
              <el-option label="个体工商户" value="2"></el-option>
              <el-option label="其他组织" value="99"></el-option>
            </el-select>
          </el-form-item>
          <el-radio-group v-model="enterpriseFormRadio" size="mini">
            <el-radio-button label="1">法人</el-radio-button>
            <el-radio-button label="2">经办人</el-radio-button>
          </el-radio-group>
          <div style="border: 1px solid #f3f3f3;">
            <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人姓名" prop="legalRepName" label-width="140px">
              <el-input size="mini" v-model.trim="enterpriseForm.legalRepName" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人证件类型" prop="legalRepCertType" label-width="140px">
              <el-select size="mini" v-model="enterpriseForm.legalRepCertType" placeholder="请选择">
                <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
                <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
                <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
                <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
                <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人证件号" prop="legalRepCertNo" label-width="140px">
              <el-input size="mini" v-model.trim="enterpriseForm.legalRepCertNo" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 1" label="法人手机号码" prop="account" label-width="140px">
              <el-input oninput="if(value.length>11)value=value.slice(0, 11)" type="number" size="mini" v-model.trim="enterpriseForm.legalRepacCount" autocomplete="off"></el-input>
            </el-form-item>

            <el-form-item v-if="enterpriseFormRadio == 2" label="经办人姓名" prop="repName" label-width="140px">
              <el-input size="mini" disabled v-model.trim="enterpriseForm.operatorName" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 2" label="经办人证件类型" prop="legalRepCertType" label-width="140px">
              <el-select size="mini" disabled v-model="enterpriseForm.operatorCertType" placeholder="请选择">
                <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
                <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
                <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
                <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
                <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 2" label="经办人证件号" prop="repCertNo" label-width="140px">
              <el-input size="mini" disabled v-model.trim="enterpriseForm.operatorCertNo" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 2" label="经办人手机号码" prop="account" label-width="140px">
              <el-input disabled @keydown.native="keyDown" oninput="if(value.length>11)value=value.slice(0, 11)" type="number" size="mini" v-model.trim="enterpriseForm.operatorMobile" autocomplete="off"></el-input>
            </el-form-item>
          </div>
        </el-form>
        <div style="text-align: center;margin-top:10px">
          <el-button type="primary" @click="personalCertificates">开始认证</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 二维码弹框 -->
    <el-dialog top="10vh" class="qr-title" width="30%" :visible="authenticationShow" :title="qrcodeTitle" :append-to-body="appendToBody" :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading" @close="codeClosure">
      <p class="hint-tit">请使用系统APP或者微信扫一扫</p>
      <p>完成企业或个人实名认证</p>
      <div ref="unnamedQrCodes" :id="'unnamedQrCodes' + ids" class="unnamedQrCodes">
        <div class="codeTime" title="刷新二维码" v-if="refreshCode"></div>
      </div>
      <div class="codeOk" v-if="codeOk">
        <i class="el-icon-circle-check iconColor mb-20"></i>
        <div class="mb-60">扫描成功</div>
        <div>请在手机上根据提示操作</div>
        <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog width="80%" :visible="controlPanelShow" title="E签宝企业控制台" :close-on-click-modal="true"
            @close="closeTheConsole" :close-on-press-escape="false" v-loading="loading">
            <iframe :src="controlPanelUrl" height="680px" width="100%" name="demo" scrolling="auto"
                sandbox="allow-same-origin allow-scripts"></iframe>
        </el-dialog> -->
    <!-- 变成二维码弹框 -->
    <!-- <el-dialog top="10vh" class="qr-title" width="30%" :visible="authenticationShwo" :title="qrcodeTitle"
            :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading" :show-close="false">
            <div class="close-qrcode">
                <el-button icon="el-icon-close" style="border: none;" @click="closeProgram"></el-button>
            </div>
            <p class="hint-tit">请使用系统APP或者微信扫一扫</p>
            <p>{{ hint }}</p>
            <div ref="qrCode" id="qrCode">
                <div class="codeTime" title="刷新二维码" v-if="refreshCode">
                    <i :class="haha ? 'el-icon-refresh-left' : 'el-icon-loading'" @click="refreshClick"></i>
                </div>
                <div class="codeOk" v-if="codeOk">
                    <i class="el-icon-circle-check iconColor mb-20"></i>
                    <div class="mb-60">扫描成功</div>
                    <div>请在手机上根据提示操作</div>
                    <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
                </div>
            </div>
        </el-dialog> -->
  </div>
</template>

<script>
import api from "@/api/api";
import QRCode from "qrcodejs2";

export default {
  props: {
    type: "", // 1实名 2授权
    appendToBody: {
      //弹框是否嵌套
      type: Boolean,
      default: false
    },
    ids: {
      type: String,
      default: "a"
    }
  },
  created() {},
  watch: {},
  data() {
    return {
      tipText: "企业未实名", //企业未实名请联系管理员实名
      promptText: "e签宝授权已过期", //企业授权已过期，请联系管理员进行授权
      loading: false,
      // isMaster
      enterpriseShow: false,
      enterpriseFormRadio: 1,
      enterpriseForm: {
        authType: "business",
        account: "",
        certNo: "",
        certType: "",
        name: "",
        legalRepCertNo: "",
        legalRepCertType: "",
        legalRepName: "",
        organizationType: "",
        distinguishType: "1",
        legalRepType: "",
        operatorCertNo: "",
        operatorCertType: "",
        operatorMobile: "",
        operatorName: "",
        orgName: ""
        // organizationType:""
      },
      // 二维码信息
      authenticationShow: false,
      refreshCode: false,
      codeOk: false,
      controlPanelUrl: "",
      qrcodeTitle: "",
      userFaceDistinguishId: "",
      hint: "",
      countdownTime: "",
      haha: false,
      authenticationUrl: ""
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  mounted() {
    console.log("ffffffffffffffffffffffff");
    console.log(this.type);
    console.log("ffffffffffffffffffffffff");
    if (this.user.isMaster == 1) {
      this.tipText = "企业未实名";
      this.promptText = "e签宝授权已过期";
    } else {
      this.tipText = "企业未实名请联系管理员实名";
      this.promptText = "企业授权已过期，请联系管理员进行授权";
    }
  },
  methods: {
    authorization() {
      // console.log("11111111111")
      this.qrcodeTitle = "授权验证";
      this.loading = true
      this.$api.authorization().then(res => {
        this.loading = false
        if (res.code == 200) {
          this.authenticationUrl = res.data.faceSwipingUrl;
          this.controlPanelUrl = res.data.faceSwipingUrl;
          this.userFaceDistinguishId = res.data.userFaceDistinguishId;
          this.hint = "完成账号的授权认证";
          this.authenticationShow = true;
          this.countdownTime = res.data.countdownTime;
          this.$nextTick(res => {
            this.getQrCode();
          });
          // this.getQrcode();
          this.timerTask();
          this.refreshCode = false;
          // this.haha = true;
        } else {
          this.$message.warning(res.msg);
        }
      }).catch(err=>{
        this.loading = false
      });
    },
    StartRealName() {
      this.qrcodeTitle = "实名认证";
      this.loading = true
      this.$api.getAuthInfo({ type: 1 }).then(res => {
        this.loading = false
        if (res.code == 200) {
          this.enterpriseForm = {
            authType: "business",
            legalRepacCount: res.data.legalRepacCount,
            certNo: res.data.certNo,
            certType: res.data.certType,
            orgName: res.data.orgName,
            legalRepCertNo: res.data.legalRepCertNo,
            legalRepCertType: res.data.legalRepCertType,
            legalRepName: res.data.legalRepName,
            organizationType: res.data.organizationType + "",
            distinguishType: "1",
            legalRepType: res.data.legalRepType,
            // legalRepType: "",
            operatorCertNo: res.data.operatorCertNo,
            operatorCertType: res.data.operatorCertType,
            operatorMobile: res.data.operatorMobile,
            operatorName: res.data.operatorName,
            orgName: res.data.orgName
          };
        } else {
          this.$message.warning(res.msg);
        }
      }).catch(err=>{
        this.loading = false
      });
      this.enterpriseShow = true;
    },
    getQrCode() {
      this.$nextTick(res => {
        // let api = this.$refs.unnamedQrCodes
        this.$refs.unnamedQrCodes.innerHTML = "";
        const location = window.location.origin;
        this.$api.addQRCode().then(res => {
          if (res.code === 200) {
            this.unique = res.data;
            console.log("xxxxxxxxxxxxxxxxx");
            console.log(this.unique);
            console.log("xxxxxxxxxxxxxxxxx");

            const data = JSON.stringify(encodeURIComponent(this.authenticationUrl));
            new QRCode("unnamedQrCodes" + this.ids, {
              width: 260,
              height: 260,
              text: `${location}/h5/#/pages/h5/scanCodeTran?type=2&unique=${this.unique}&data=${data}`
            });
            this.queryQRCode();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    codeClosure() {
      clearInterval(this.timer);
      this.authenticationShow = false;
      this.codeOk = false;
      this.clearCodetime();
    },
    clearCodetime() {
      // 清除定时器
      clearInterval(this.codeTimer);
      this.codeTimer = null;
      this.codeTimer2 = null;
    },
    timerTask() {
      this.timer = setInterval(() => {
        this.$api
          .userFaceDistinguishState({ pkId: this.userFaceDistinguishId, distinguishType: 0 })
          .then(res => {
            if (res.code == 200) {
              this.stopTime = this.stopTime + 3;

              if (res.data.status == 2) {
                clearInterval(this.timer);
                this.$emit("resh");
                this.getUserInfo();
                this.authenticationShow = false;
                this.enterpriseShow = false;

                this.$message.success("认证成功");
                this.getAuthInfos();
              } else if (res.data.status == 3) {
                clearInterval(this.timer);
                this.$message.warning(res.data.errorInfo);
                this.authenticationShow = false;
              }
            } else {
              clearInterval(this.timer);
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            clearInterval(this.timer);
          });
      }, 3000);
    },
    getAuthInfos() {
      this.$api.getAuthInfo({ type: 1 }).then(res => {
        console.log("xxxxxxxx111111111xxxxxxxxxxxxxx");
        console.log(res);
        console.log("xxxxxxxx111111111xxxxxxxxxxxxxx");
        if (res.code == 200) {
          if (res.data.authType == "business") {
            if (res.data.certNo == null || res.data.certNo == "") {
              // this.realNameVerify = 0;
              // sessionStorage.setItem("realNameVerify", 0);
              // navBar.data.realNameVerify
              this.$store.commit("setRealNameVerify", "0");
            } else {
              // this.realNameVerify = 1;
              // sessionStorage.setItem("realNameVerify", 1);
              // navBar.data.realNameVerify
              this.$store.commit("setRealNameVerify", "1");
            }
          } else {
            if (res.data.operatorMobile == null || (res.data.operatorMobile == "" && res.data.authType == "personal")) {
              // this.realNameVerify = 0;
              // sessionStorage.setItem("realNameVerify", 0);
              // navBar.data.realNameVerify
              this.$store.commit("setRealNameVerify", "0");
            } else {
              // this.realNameVerify = 1;
              // sessionStorage.setItem("realNameVerify", 1);
              // navBar.data.realNameVerify
              this.$store.commit("setRealNameVerify", "1");
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取个人信息
    getUserInfo() {
      api.getPersonInfo().then(res => {
        if (res.code === 200) {
          this.$store.commit("setUserinfo", res.data);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    queryQRCode() {
      // clearInterval(this.codeTimer);
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
    personalCertificates() {
      if (this.enterpriseForm.orgName == undefined || this.enterpriseForm.orgName == null || this.enterpriseForm.orgName.length == 0) {
        return this.$message.warning("组织机构名称不能为空");
      }
      if (this.enterpriseForm.certType == undefined || this.enterpriseForm.certType == null || this.enterpriseForm.certType.length == 0) {
        return this.$message.warning("组织机构证件类型不能为空");
      }
      if (this.enterpriseForm.certNo == undefined || this.enterpriseForm.certNo == null || this.enterpriseForm.certNo.length == 0) {
        return this.$message.warning("组织机构证件号不能为空");
      }
      if (this.enterpriseForm.organizationType == undefined || this.enterpriseForm.organizationType == null || this.enterpriseForm.organizationType.length == 0) {
        return this.$message.warning("组织机构类型不能为空");
      }
      if (this.enterpriseFormRadio == 1 && (this.enterpriseForm.legalRepName == undefined || this.enterpriseForm.legalRepName == null || this.enterpriseForm.legalRepName.length == 0)) {
        return this.$message.warning("法定代表人姓名不能为空");
      }
      if (this.enterpriseFormRadio != 1 && (this.enterpriseForm.operatorName == undefined || this.enterpriseForm.operatorName == null || this.enterpriseForm.operatorName.length == 0)) {
        return this.$message.warning("经办人姓名不能为空");
      }
      if (this.enterpriseFormRadio == 1 && (this.enterpriseForm.legalRepCertType == undefined || this.enterpriseForm.legalRepCertType == null || this.enterpriseForm.legalRepCertType.length == 0)) {
        return this.$message.warning("法定代表人证件类型不能为空");
      }
      if (this.enterpriseFormRadio != 1 && (this.enterpriseForm.operatorCertType == undefined || this.enterpriseForm.operatorCertType == null || this.enterpriseForm.operatorCertType.length == 0)) {
        return this.$message.warning("经办人证件类型不能为空");
      }
      if (this.enterpriseFormRadio == 1 && (this.enterpriseForm.legalRepCertNo == undefined || this.enterpriseForm.legalRepCertNo == null || this.enterpriseForm.legalRepCertNo.length == 0)) {
        return this.$message.warning("法定代表人证件号不能为空");
      } else {
        if (this.enterpriseForm.legalRepCertType == "CRED_PSN_CH_IDCARD") {
          const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          // 15位身份证号码校验正则
          const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
          if (reg.test(this.enterpriseForm.operatorCertNo) || regs.test(this.enterpriseForm.operatorCertNo)) {
          } else {
            console.log(this.enterpriseForm.operatorCertNo);
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
      if (this.enterpriseFormRadio != 1 && (this.enterpriseForm.operatorCertNo == undefined || this.enterpriseForm.operatorCertNo == null || this.enterpriseForm.operatorCertNo.length == 0)) {
        return this.$message.warning("经办人证件号不能为空");
      } else {
        if (this.enterpriseForm.operatorCertNo == "CRED_PSN_CH_IDCARD") {
          const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          // 15位身份证号码校验正则
          const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
          if (reg.test(this.enterpriseForm.operatorCertNo) || regs.test(this.enterpriseForm.operatorCertNo)) {
          } else {
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
      if (this.enterpriseFormRadio == 1 && (this.enterpriseForm.legalRepacCount == undefined || this.enterpriseForm.legalRepacCount == null || this.enterpriseForm.legalRepacCount.length == 0)) {
        return this.$message.warning("法人手机号码不能为空");
      }
      if (this.enterpriseFormRadio != 1 && (this.enterpriseForm.operatorMobile == undefined || this.enterpriseForm.operatorMobile == null || this.enterpriseForm.operatorMobile.length == 0)) {
        return this.$message.warning("经办人手机号码不能为空");
      }

      this.enterpriseForm.name = this.enterpriseForm.orgName;
      if (this.enterpriseFormRadio == 1) {
        this.enterpriseForm.legalRepType = 0;
        this.enterpriseForm.account = this.enterpriseForm.legalRepacCount;
      } else {
        this.enterpriseForm.legalRepType = 1;
        this.enterpriseForm.account = this.enterpriseForm.operatorMobile;
      }
      const data = { ...this.enterpriseForm };
      delete data.distinguishType;
      this.$api.faceSwiping(data).then(res => {
        if (res.code == 200) {
          this.countdownTime = res.data.countdownTime;
          this.authenticationUrl = res.data.faceSwipingUrl;
          this.authenticationShow = true;
          this.getQrCode();
          this.userFaceDistinguishId = res.data.userFaceDistinguishId;
          this.timerTask();
        } else {
          this.$message.warning(res.msg);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  background-color: #fff;
  height: 100%;
  text-align: center;

  .box-title {
    padding-top: 15%;
    font-size: 28px;
    font-weight: 800;
  }

  .box-btn {
    width: 160px;
    line-height: 40px;
    margin: 0 auto;
    margin-top: 50px;
    color: #fff;
    background: #169bd5;
    border-radius: 6px;
  }

  .box-btn:hover {
    cursor: pointer;
  }
}

/deep/ .el-select {
  width: 100%;
}

/deep/ .el-radio-group {
  width: 100%;
  text-align: left;
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
    background-color: #cfd7da;
    text-align: left;
  }

  .unnamedQrCodes {
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
    position: relative;

    p {
      color: #3aa1ff;
    }
  }
}
</style>
