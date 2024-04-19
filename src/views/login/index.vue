<template>
  <div class="login-warp">
    <!-- <img src="../../assets/loginBg.jpg" width="100%" height="100%" alt=""> -->
    <div class="record">版权所有 建网科技&nbsp;&nbsp;<img src="../../assets/ba.png" alt="" />&nbsp;&nbsp;粤公网安备&nbsp;<a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44011802000659" target="_blank">44011802000659</a>号 &nbsp;<a href="https://beian.miit.gov.cn" target="_blank">| 粤ICP备2022038882号-1</a></div>

    <!-- <div class="bj-text">
      <img src="@/assets/copyWriter.png" alt="" />
    </div> -->
    <div class="login-box">
      <!-- 手机号登录 -->
      <div class="trans" @click="loginMethodClick(false)" v-show="loginMethod">
        <img class="trans" style="border-radius: 5px" src="@/assets/QRcode.png" alt="" />
        <img class="trans" style="transform: rotate(180deg); top: 3px" src="@/assets/masking.png" alt="" />
      </div>
      <div class="trans" @click="loginMethodClick(true)" v-show="!loginMethod">
        <img class="trans" style="border-radius: 5px" src="@/assets/brain.png" alt="" />
        <img class="trans" style="transform: rotate(180deg)" src="@/assets/masking.png" alt="" />
      </div>
      <div v-if="loginMethod" style="padding: 25px 45px 5px 45px">
        <div class="yx-tit">
          <img src="@/assets/logo.png" alt="" />
        </div>
        <div class="text box-administration">建必优工程生产管理系统</div>
        <div class="left-text">
          <div class="left-ico"></div>
          账号登录
        </div>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-ruleForm" :hide-requied-aterisk="false">
          <el-form-item>
            <el-row class="phone-area">
              <el-col :span="6" style="position: relative">
                <el-select v-model="areaCode" placeholder="请选择">
                  <el-option label="+86" :value="1"></el-option>
                </el-select>
                <span class="right-vertical"></span>
              </el-col>
              <el-col :span="18">
                <!-- <el-input type="number"  @mousewheel.native.prevent v-model.trim="ruleForm.phoneNumber" maxlength="11" placeholder="请输入手机号码" oninput="if(value.length>11)value=value.slice(0, 11)" onkeyup="value=value.replace(/[^\d]/g,' ')" @keydown.native="keyDown"> </el-input> -->
                <el-input @mousewheel.native.prevent v-model.trim="ruleForm.phoneNumber" maxlength="11" placeholder="请输入手机号码" @input="phoneInput"> </el-input>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item class="jw-code">
            <!-- <el-input type="number" :disabled="codeStatus" v-model.trim="ruleForm.code" @keydown.native="keyDown" oninput="if(value.length>4)value=value.slice(0, 4)" placeholder="请输入验证码" maxlength="4" style="width: 60%"> </el-input> -->
            <el-input :disabled="codeStatus" v-model.trim="ruleForm.code" @input="ruleForm.code = $limitPhone2(ruleForm.code)" placeholder="请输入验证码" maxlength="4" style="width: 60%"> </el-input>
            <div class="login-code" @click="getCode" v-if="timerStatus">
              <el-button type="primary" :disabled="ruleForm.phoneNumber.length != 11">获取验证码</el-button>
            </div>
            <div class="login-code" v-if="!timerStatus">
              <el-button type="primary">{{ timer }}秒后重试</el-button>
            </div>
          </el-form-item>

          <div class="operate">
            <!-- <el-checkbox
            label="记住我"
            name="type"
            v-model="checked"
          ></el-checkbox> -->
            <span></span>
            <!-- <router-link to="/forgetPassword"> <span class="forget-password">忘记密码?</span></router-link> -->
          </div>

          <el-form-item>
            <el-button type="primary" :disabled="ruleForm.phoneNumber.length != 11" @click="submitForm('ruleForm')" style="width: 100%">
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
            <div class="no-yet">
              <span style="color: #cacaca">还没有账户？</span>
              <span><router-link to="/registry">注册</router-link></span>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="!loginMethod">
        <div class="scanning-prompt">手机扫码,安全登录</div>
        <div class="code-box" style="position: relative">
          <div ref="codeImg" id="codeImg"></div>
          <div v-if="codeImgStatus" class="mask-layer">
            <div class="mask-layer-text">二维码已失效</div>
            <div @click="loginMethodClick(false)" class="mask-layer-btn">刷新二维码</div>
          </div>
          <div class="codeOk" v-if="codeOk">
            <i class="el-icon-circle-check iconColor mb-20"></i>
            <div class="mb-60">扫描成功</div>
            <div>请在手机上根据提示操作</div>
            <el-button type="text" @click="loginMethodClick(false)">重新加载二维码</el-button>
          </div>
        </div>

        <div class="explain-box">
          <el-row>
            <el-col :span="5" style="position: relative">
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
    <el-dialog :visible.sync="popup" v-loading="loadings" center top="30vh" title="请完成下列验证!" :close-on-click-modal="false" :close-on-press-escape="false" width="24%" @close="closePop">
      <div class="dialog-form" style="padding-bottom:20px;min-height: 238px;">
        <Slider style="margin: 0 auto;" v-if="imgCodeStatus" :miniimgurl="imgCode.smallImage" :imgurl="imgCode.img" :h="imgCode.oriImageHeight" :w="imgCode.oriImageWidth" :sw="imgCode.slidingWidth" :sh="imgCode.slidingHeight" :sliderText="imgCode.captchaType" :blocky="imgCode.yHeight" @getNote="getNote" :code="imgCode.xWidth" @refresh="refresh" :errShow="errShow" />
      </div>
    </el-dialog>
    <!-- 多用户弹窗 -->
    <el-dialog v-loading="loadings" :visible.sync="centerDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" class="multi-account" width="600px" center>
      <!-- <div class="multi-account-title">选择账户</div> -->
      <div class="multi-account-title2 mt-20">请选择</div>
      <div class="center centerDialog">
        <!-- 'pitch-on': tabPosition == item.userId, -->
        <div class="item-box " v-for="item in userList" :key="item.userId" :class="{ bg1: [4, 10, 7, 8].includes(item.orgType), bg2: [2, 3, 12, 6].includes(item.orgType), bg3: [5, 9, 11].includes(item.orgType), bg4: [0].includes(item.orgType), bg5: [1].includes(item.orgType), 'item-box-forbidden': item.pastStatus == 0 || item.pastStatus == 2 }" @click="itemClick(item)">
          <el-row :span="24" style="width:100%">
            <el-col :span="4">
              <img v-if="item.orgType == 0" class="head-portrait" src="@/assets/headPortrait/yy.png" />
              <img v-if="item.orgType == 1" class="head-portrait" src="@/assets/headPortrait/dl.png" />
              <img v-if="item.orgType == 2" class="head-portrait" src="@/assets/headPortrait/js.png" />
              <img v-if="item.orgType == 3" class="head-portrait" src="@/assets/headPortrait/jl.png" />
              <img v-if="item.orgType == 4" class="head-portrait filleted-corner" src="@/assets/headPortrait/sg.png" />
              <img v-if="item.orgType == 5" class="head-portrait filleted-corner" src="@/assets/headPortrait/xm.png" />
              <img v-if="item.orgType == 6" class="head-portrait filleted-corner" src="@/assets/headPortrait/gy.png" />
              <img v-if="item.orgType == 7" class="head-portrait filleted-corner" src="@/assets/headPortrait/fb.png" />
              <img v-if="item.orgType == 8" class="head-portrait filleted-corner" src="@/assets/headPortrait/lw.png" />
              <img v-if="item.orgType == 9" class="head-portrait filleted-corner" src="@/assets/headPortrait/sj.png" />
              <img v-if="item.orgType == 10" class="head-portrait filleted-corner" src="@/assets/headPortrait/sgjt.png" />
              <img v-if="item.orgType == 11" class="head-portrait filleted-corner" src="@/assets/headPortrait/zfjg.png" />
              <img v-if="item.orgType == 12" class="head-portrait filleted-corner" src="@/assets/headPortrait/jsjt.png" />
            </el-col>
            <el-col :span="20">
              <div class="item-box-title">{{ item.orgName }}</div>
              <div class="df">
                <div class="loginName">{{ item.loginName }}</div>
                <div v-if="item.isMaster == 1" class="mange-user">
                  <div>管理员</div>
                </div>
                <div class="shabi el-icon-lock" v-if="item.pastStatus == 0 || item.pastStatus == 2"></div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <div style="height:84px"></div>
      <!-- <span slot="footer" class="dialog-footer flex">
        <div class="footerBrn mr-20 okBtn" @click="multipleAccountSelection" :disabled="btnDisable">确 定</div>
        <div class="footerBrn cancelBtn" @click="centerDialogVisible = false">取 消</div>
      </span> -->
    </el-dialog>
    <!-- 个人认证 -->
    <el-dialog :close-on-press-escape="false" class="edit-box" :show-close="false" title="个人实名认证" :visible.sync="personalCertificateShow" width="500px" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form" style="padding: 20px">
        <div class="close-program">
          <el-button icon="el-icon-circle-close" style="border: none" @click="closeProgram"></el-button>
        </div>
        <el-form :model="personalForm" ref="personalForm">
          <el-form-item label="个人姓名" prop="name" label-width="110px">
            <el-input v-model.trim="personalForm.name" size="mini" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="个人证件类型" prop="certType" label-width="110px">
            <el-select v-model="personalForm.certType" size="mini" placeholder="请选择" style="width: 100%">
              <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
              <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
              <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
              <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
              <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="个人证件号" prop="certNo" label-width="110px">
            <el-input v-model.trim="personalForm.certNo" size="mini" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="account" label-width="110px">
            <el-input @keydown.native="keyDown" size="mini" oninput="if(value.length>11)value=value.slice(0, 11)" type="number" v-model.trim="personalForm.account" autocomplete="off" disabled></el-input>
          </el-form-item>
        </el-form>
        <div style="text-align: center">
          <el-button type="primary" size="mini" @click="personalCertificate">开始验证</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 变成二维码弹框 -->
    <el-dialog top="10vh" class="qr-title" width="30%" :visible="authenticationShwo" :title="qrCodeType == 1 ? '实名认证' : '授权认证'" :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading" :show-close="false">
      <div class="close-qrcode">
        <el-button icon="el-icon-circle-close" style="border: none" @click="closePrograms"></el-button>
      </div>
      <p class="hint-tit">请使用<span v-if="qrCodeType != 1">系统APP或者</span>微信扫一扫</p>
      <p>完成个人{{ qrCodeType == 1 ? "实名认证" : "授权认证" }}</p>
      <!-- <div v-if="refreshCode"><el-button @click="refreshClick">刷新二维码</el-button></div> -->
      <div ref="qrCode" id="qrCode">
        <div class="codeTime" title="刷新二维码" v-show="refreshCode">
          <i :class="haha ? 'el-icon-refresh-left' : 'el-icon-loading'" @click="refreshClick"></i>
        </div>
        <div class="codeOk" v-if="codeOk2">
          <i class="el-icon-circle-check iconColor mb-20"></i>
          <div class="mb-60">扫描成功</div>
          <div>请在手机上根据提示操作</div>
          <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from "qrcodejs2";
import Slider from "@/components/SlideVerify";

export default {
  components: {
    Slider
  },
  data() {
    return {
      ruleForm: {
        // loginName: "",
        password: "",
        code: "",
        uuid: "",
        forceType: 0, // 强制登录的问题
        sourceType: 1, // 登录来源
        phoneNumber: ""
      },
      rules: {
        loginName: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "账号长度在4-20个字符之间",
            trigger: "blur"
          }
        ],
        password: [{ required: true, message: "密码不能为空", trigger: "blur" }]
      },
      loading: false,
      imgCode: "",
      checked: false, // 记住密码
      typeNumber: 0, // 0图形验证码登录 1是手机验证码登录
      popup: false,
      centerDialogVisible: false,
      tabPosition: "",
      userList: [],
      timerStatus: true,
      timer: 60,
      ruleFormCode: "",
      loadings: false,
      personalCertificateShow: false,
      personalForm: {
        authType: "personal",
        name: "", // 个人姓名
        account: "", // 手机号
        certType: "", // 个人认证类型
        certNo: "", // 个人证件号
        distinguishType: "1",
        type: 0
        // redirectUrl: "http://www.baidu.com/"
      },
      authenticationShwo: false,
      refreshCode: false,
      haha: true,
      authenticationUrl: "",
      countdownTime: "",
      userFaceDistinguishId: "",
      longDate: {},
      mobileStatus: true,
      areaCode: 1,
      codeStatus: true,
      loginMethod: true,
      scanCodeData: {},
      codeImgStatus: true,
      codeOk: false,
      codeOk2: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      qrCodeType: "1",
      // =====================================================
      imgCode: {},
      imgCodeStatus: false,
      errShow: false,
      authTimer: ""
    };
  },
  mounted() {
    // this.getImgecode();
    const sel = sessionStorage.getItem("selOpen") ? sessionStorage.getItem("selOpen") : 0;
    const sel2 = sessionStorage.getItem("personalCertificateShow") ? sessionStorage.getItem("personalCertificateShow") : 0;
    console.log(sel, sel2);
    if (sel == 1) {
      sessionStorage.setItem("token", sessionStorage.getItem("restoken"));
      if (sessionStorage.getItem("accountList")) {
        this.userList = JSON.parse(sessionStorage.getItem("accountList"));
        localStorage.setItem("accountList", JSON.stringify(this.userList));
        this.ruleForm = sessionStorage.getItem("ruleForm") ? JSON.parse(sessionStorage.getItem("ruleForm")) : { password: "", code: "", uuid: "", forceType: 0, phoneNumber: "" };
      }
      this.centerDialogVisible = true;
    }
    if (sel2 == 1) {
      sessionStorage.setItem("token", sessionStorage.getItem("restoken"));
      let data = sessionStorage.getItem("registryData") ? JSON.parse(sessionStorage.getItem("registryData")) : {};
      let obj = sessionStorage.getItem("ruleForm") ? JSON.parse(sessionStorage.getItem("ruleForm")) : {};
      this.ruleForm = { password: "", code: "", uuid: "", forceType: 0, sourceType: 1, phoneNumber: obj.linkPhone };
      this.regs({ data });
    }
  },
  watch: {
    "ruleForm.phoneNumber"(val) {
      this.codeStatus = true;
      this.timerStatus = true;
      if (this.timer != 60) {
        this.timer = 0;
      }
      this.ruleForm.code = "";

      this.clearCodetime();
      this.$nextTick(() => {
        clearInterval(this.authTimer);
        clearInterval(this.timers);
        clearInterval(this.authTimer);
        clearInterval(this.codeTimer);
        this.timer = 60;
      }, 1000);
    },
    personalCertificateShow(val) {
      if (!val) {
        sessionStorage.removeItem("personalCertificateShow");
      }
    }
    //
  },
  beforeDestroy() {
    // 清除定时器
    this.clearCodetime();
  },
  methods: {
    regs(res) {
      console.log(res.data.authStatusVo.checkStatus);
      if (res.data.authStatusVo.checkStatus == 0) {
        this.personalForm = {
          authType: "personal",
          name: "", // 个人姓名
          account: this.ruleForm.phoneNumber, // 手机号
          certType: "", // 个人认证类型
          certNo: "", // 个人证件号
          distinguishType: "1",
          type: 0
        };
        this.personalCertificateShow = true;
        this.qrCodeType = "1";
      } else if (res.data.authStatusVo.checkStatus == 3) {
        // 重新授权
        this.$api.noTokenFaceSwipingNoParam().then(res => {
          if (res.code == 200) {
            //  console.log(res.data)
            this.qrCodeType = "2";
            this.haha = true;
            this.refreshCode = false;
            // this.countdownTime = 30;
            this.countdownTime = res.data.countdownTime;
            this.authenticationUrl = res.data.faceSwipingUrl;
            this.userFaceDistinguishId = res.data.userFaceDistinguishId;
            this.authenticationShwo = true;
            this.getQrcode();
            this.timerTask();
            this.loading = false;
          } else {
          }
        });
      } else {
        // 判断多账号 还是一个账号
        if (res.data.userList.length == 1) {
          this.loadings = false;
          this.$router.replace("/home/home");

          this.$message({
            message: "恭喜你,登录成功",
            type: "success"
          });
        } else {
          this.userList = res.data.userList;
          sessionStorage.setItem("restoken", res.data.access_token);
          sessionStorage.setItem("accountList", JSON.stringify(this.userList));
          sessionStorage.setItem("ruleForm", JSON.stringify(this.ruleForm));
          this.centerDialogVisible = true;
        }
      }
      this.userList = res.data.userList;
      localStorage.setItem("accountList", JSON.stringify(this.userList));
      sessionStorage.removeItem("personalCertificateShow");
      sessionStorage.removeItem("registryData");
    },

    phoneInput(value) {
      let val = value;
      val = val.slice(0, 11);
      val = val.replace(/\D|^'0'/g, "");
      this.ruleForm.phoneNumber = val;
    },

    loginMethodClick(status) {
      this.loginMethod = status;
      if (status) {
        clearInterval(this.timers);
        this.clearCodetime();
      } else {
        this.codeImgStatus = false;
        this.codeOk = false;
        clearInterval(this.timers);
        const location = window.location.origin;
        this.$api.preconditions({ userId: "" }).then(res => {
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
              text: `${location}/h5/#/pages/h5/scanCodeTran?type=1&unique=${this.unique}&data=${data}`
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
    queryQRCode(type) {
      clearInterval(this.codeTimer);
      this.codeTimer = setInterval(() => {
        this.$api.queryQRCode({ unique: this.unique }).then(res => {
          if (res.code === 200) {
            if (res.data === 1) {
              clearInterval(this.codeTimer);
              if (type === 1) {
                this.codeOk = true;
              } else {
                this.codeOk2 = true;
              }
            }
          } else {
            clearInterval(this.codeTimer);
          }
        });
      }, 5000);
      this.codeTimer2 = setTimeout(() => {
        clearInterval(this.codeTimer);
        if (type === 1) {
          this.codeOk = true;
        } else {
          this.codeOk2 = true;
        }
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
            // if (res.data.loginStatus == true) {
            //   clearInterval(this.timers);
            //   sessionStorage.setItem("token", res.data.access_token);
            //   this.loadings = false;
            //   localStorage.setItem("accountList", JSON.stringify(res.data.userList));
            //   this.$router.replace("/home/home");
            // } else {
            // }
            if ([3, 4].includes(res.data.loginStatus)) {
              clearInterval(this.timers);
              sessionStorage.setItem("token", res.data.access_token);
              this.loadings = false;
              localStorage.setItem("accountList", JSON.stringify(res.data.userList));
              this.$router.replace("/home/home");
              this.codeOk = true;
            } else if (res.data.loginStatus == 5) {
              clearInterval(this.timers);
            } else if (res.data.loginStatus == 6) {
              clearInterval(this.timers);
              this.codeErr = res.data.errorMsg;
              this.codeImgStatus = true;
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

    itemClick(item) {
      // return console.log(item)
      if (item.pastStatus == 0 || item.pastStatus == 2) {
        return;
      }
      this.tabPosition = item.userId;
      this.multipleAccountSelection();
    },

    getQrcode() {
      this.$nextTick(res => {
        //
        const location = window.location.origin;
        this.$api.addQRCode().then(res => {
          if (res.code === 200) {
            this.unique = res.data;
            // this.$refs.qrCode.innerHTML =""
            // this.authenticationUrl
            const data = JSON.stringify(encodeURIComponent(this.authenticationUrl));
            new QRCode("qrCode", {
              width: 260,
              height: 260,
              text: `${location}/h5/#/pages/h5/scanCodeTran?type=2&unique=${this.unique}&data=${data}`
            });
            this.queryQRCode(2);
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    timerTask() {
      const _this = this;
      this.timers = setInterval(() => {
        const data = {
          // code: this.ruleForm.code,
          // mobile: this.ruleForm.phoneNumber,
          // uuid: this.ruleForm.uuid,
          // phoneNumber: this.personalForm.account
          distinguishType: 0,
          pkId: this.userFaceDistinguishId
        };
        // if (this.mobileStatus) {

        // } else {
        //   data.mobile = this.personalForm.account
        // }
        this.$api.userFaceDistinguishState(data).then(res => {
          if (res.code == 200) {
            if (res.data.status == 2) {
              clearInterval(this.timers);
              this.authenticationShwo = false;
              this.personalCertificateShow = false;
              this.enterpriseShow = false;

              this.$store.commit("statusAlter", true);
              sessionStorage.setItem("statusAlter", true);
              if (this.mobileStatus) {
                this.$message.success("认证成功");
                if (this.userList.length == 1) {
                  this.$router.replace("/home/home");
                  this.$message({
                    message: "恭喜你,登录成功",
                    type: "success"
                  });
                } else {
                  this.centerDialogVisible = true;
                }
                // this.findUserByTelephone(_this.longDate);
              } else {
                this.$message.success("认证成功,请重新登录");
                this.timerStatus = true;
                this.loading = false;
                this.ruleForm = {
                  password: "",
                  code: "",
                  uuid: "",
                  forceType: 0, // 强制登录的问题
                  sourceType: 1, // 登录来源
                  phoneNumber: ""
                };
              }
            } else if (res.data.status == 3) {
              // 5542bug
              // this.authenticationShwo = false;
              clearInterval(this.timers);
              this.closePrograms();
              this.loading = false;
              this.$message.warning(res.data.errorInfo);
            } else {
            }
          } else {
            clearInterval(this.timers);
            this.loading = false;
            this.$message.warning(res.msg);
          }
        });
      }, 3000);
    },
    refreshClick() {
      this.haha = false;
      this.codeOk2 = false;
      const dom = this.$refs.qrCode;
      dom.removeChild(dom.childNodes[2]);
      dom.removeChild(dom.childNodes[2]);
    },
    clearCodetime() {
      // 清除定时器
      clearInterval(this.codeTimer);
      this.codeTimer = null;
      this.codeTimer2 = null;
    },
    personalCertificate() {
      if (this.personalForm.name.length == 0) {
        return this.$message.warning("个人姓名不能为空");
      }
      if (this.personalForm.account.length == 0) {
        return this.$message.warning("手机号码不能为空");
      }
      if (this.personalForm.certType.length == 0) {
        return this.$message.warning("个人认证类型不能为空");
      }
      if (this.personalForm.certNo.length == 0) {
        return this.$message.warning("个人证件号不能为空");
      } else {
        if (this.personalForm.certType == "CRED_PSN_CH_IDCARD") {
          const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          // 15位身份证号码校验正则
          const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
          if (reg.test(this.personalForm.certNo) || regs.test(this.personalForm.certNo)) {
          } else {
            // callback('请输入正确的身份证号码')
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
      // code: this.ruleForm.code,
      //       mobile: this.ruleForm.phoneNumber,
      //       uuid: this.ruleForm.uuid
      this.personalForm.code = this.ruleForm.code;
      this.personalForm.uuid = this.ruleForm.uuid;
      this.personalForm.phoneNum = this.ruleForm.phoneNumber;
      if (this.personalForm.account != this.personalForm.phoneNum) {
        this.$confirm("当前输入的手机号与登录时号码不一致，请确认当前号码为登录号码?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.mobileStatus = false;
            this.noTokenFaceSwiping();
          })
          .catch(() => {});
      } else {
        this.mobileStatus = true;
        this.noTokenFaceSwiping();
      }
    },
    noTokenFaceSwiping() {
      this.loading = true;
      this.$api
        .noTokenFaceSwiping(this.personalForm)
        .then(res => {
          if (res.code == 200) {
            this.haha = true;
            this.refreshCode = false;
            // this.countdownTime = 30;
            this.countdownTime = res.data.countdownTime;
            this.authenticationUrl = res.data.faceSwipingUrl;
            this.userFaceDistinguishId = res.data.userFaceDistinguishId;
            this.authenticationShwo = true;
            this.getQrcode();
            this.timerTask();
            this.loading = false;
          } else {
            this.$message.warning(res.msg);
            this.loading = false;
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    closeProgram() {
      this.ruleForm.code = "";
      this.personalCertificateShow = false;
      this.loading = false;
    },
    closePrograms() {
      clearInterval(this.timers);
      this.$refs.qrCode.innerHTML = "";
      this.authenticationShwo = false;
      this.clearCodetime();
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
    dropOut() {
      this.timerStatus = true;
      this.loading = false;
      this.ruleForm.code = "";
      this.ruleForm.uuid = "";
      this.centerDialogVisible = false;
      sessionStorage.removeItem("restoken");
      sessionStorage.removeItem("selOpen");
      sessionStorage.removeItem("ruleForm");
      sessionStorage.removeItem("accountList");
    },
    submitForm(formName) {
      // localStorage.setItem('token','12312312321');
      // this.$router.replace('/');
      // return
      // localStorage.clear();
      console.log(this.ruleForm.phoneNumber.length);
      sessionStorage.clear();
      this.$store.commit("setTagsList", [{ path: "/home/home", title: "首页", name: "home" }]);
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 判断验证码以及是哪种类型登录
          if (!this.ruleForm.code && this.typeNumber == 0) {
            this.$message({ message: "请输入正确的验证码", type: "error" });
            return;
          }
          // 校验手机号
          const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
          if (!myreg.test(this.ruleForm.phoneNumber) && this.typeNumber == 1) {
            this.$message({ message: "请输入正确的手机号码", type: "error" });
            return;
          }
          // 手机验证码
          if (!this.ruleForm.code && this.typeNumber == 1) {
            this.$message({ message: "请输入正确的验证码", type: "error" });
            return;
          }

          sessionStorage.setItem("statusAlter", false);
          this.loading = true;
          const data = {
            code: this.ruleForm.code,
            phoneNumber: this.ruleForm.phoneNumber,
            uuid: this.ruleForm.uuid,
            sourceType: 1
          };
          if (data.uuid.length == 0) {
            this.$message({ message: "请重新获取取验证码", type: "error" });
            this.loading = false;
            return;
          }
          this.userLogin(data);
          // this.$api
          //   .getAuthStatus({
          //     code: this.ruleForm.code,
          //     mobile: this.ruleForm.phoneNumber,
          //     uuid: this.ruleForm.uuid
          //   })
          //   .then(res => {
          //     if (res.code == 200) {
          //       if (res.data.checkStatus == 0) {
          //         this.personalForm = {
          //           authType: "personal",
          //           name: "", // 个人姓名
          //           account: "", // 手机号
          //           certType: "", // 个人认证类型
          //           certNo: "", // 个人证件号
          //           distinguishType: "1",
          //           type: 0
          //         };
          //         this.personalCertificateShow = true;
          //         this.longDate = data;
          //       } else {
          //         this.findUserByTelephone(data);
          //       }
          //     } else {
          //       this.loading = false;
          //       this.$message.warning(res.msg);
          //     }
          //   });
        }
      });
    },
    findUserByTelephone(data) {
      this.userList = [];
      this.$api.findUserByTelephone(data).then(res => {
        if (res.code == 200) {
          this.ruleForm.uuid = res.data.uuid;
          if (res.data.userList.length == 1) {
            this.ruleForm.loginName = res.data.userList[0].loginName;
            this.ruleForm.pkId = res.data.userList[0].userId;

            this.userLogin();
          } else {
            this.userList = res.data.userList;
            this.centerDialogVisible = true;
          }
        } else {
          this.timerStatus = true;
          // this.timer = 60;
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    multipleAccountSelection() {
      if (this.tabPosition == "") {
        return this.$message.warning("请选择账户登录");
      }
      this.loadings = true;
      this.userList.forEach(item => {
        if (item.userId == this.tabPosition) {
          // this.ruleForm.loginName = item.loginName;
          this.ruleForm.pkId = item.userId;
          // this.ruleForm.uuid = item.uuid
        }
      });
      this.switchLogin();
    },
    switchLogin() {
      this.loadings = true;
      const data = this.ruleForm;
      sessionStorage.removeItem("restoken");
      sessionStorage.removeItem("selOpen");
      sessionStorage.removeItem("ruleForm");
      sessionStorage.removeItem("accountList");
      this.$api.switchLogin(data).then(res => {
        if (res.code == 200) {
          sessionStorage.setItem("token", res.data.access_token);
          // this.loadings = false;
          this.$router.replace("/home/home");
          this.$message({
            message: "恭喜你,登录成功",
            type: "success"
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    userLogin(data) {
      this.$api
        .userLogin(this.ruleForm)
        .then(res => {
          console.log(res);
          if (res.code == 200) {
            // this.$store.commit("setTagsList", [{ path: "/home/home", title: "首页", name: "home" }]);
            // 是否记住密码登录成功存token
            if (this.checked) {
              localStorage.setItem("token", res.data.access_token);
            } else {
              sessionStorage.setItem("token", res.data.access_token);
            }
            // 认证
            if (res.data.authStatusVo.checkStatus == 0) {
              this.personalForm = {
                authType: "personal",
                name: "", // 个人姓名
                account: this.ruleForm.phoneNumber, // 手机号
                certType: "", // 个人认证类型
                certNo: "", // 个人证件号
                distinguishType: "1",
                type: 0
              };
              this.personalCertificateShow = true;
              this.longDate = data;
              this.qrCodeType = "1";
            } else if (res.data.authStatusVo.checkStatus == 3) {
              // 重新授权
              this.$api.noTokenFaceSwipingNoParam().then(res => {
                if (res.code == 200) {
                  //  console.log(res.data)
                  this.qrCodeType = "2";
                  this.haha = true;
                  this.refreshCode = false;
                  // this.countdownTime = 30;
                  this.countdownTime = res.data.countdownTime;
                  this.authenticationUrl = res.data.faceSwipingUrl;
                  this.userFaceDistinguishId = res.data.userFaceDistinguishId;
                  this.authenticationShwo = true;
                  this.getQrcode();
                  this.timerTask();
                  this.loading = false;
                } else {
                }
              });
            } else {
              // 判断多账号 还是一个账号
              if (res.data.userList.length == 1) {
                this.loadings = false;
                this.$router.replace("/home/home");

                this.$message({
                  message: "恭喜你,登录成功",
                  type: "success"
                });
              } else {
                this.userList = res.data.userList;
                sessionStorage.setItem("restoken", res.data.access_token);
                sessionStorage.setItem("selOpen", 1);
                sessionStorage.setItem("accountList", JSON.stringify(this.userList));
                sessionStorage.setItem("ruleForm", JSON.stringify(this.ruleForm));
                this.centerDialogVisible = true;
              }
            }
            // 处理认证账号问题+缓存账号列表
            this.userList = res.data.userList;
            localStorage.setItem("accountList", JSON.stringify(this.userList));

            // checkStatus

            // this.centerDialogVisible = false;
          } else if (res.code == 203917) {
            this.loadings = false;
            this.$alert(res.msg, "提示", {
              confirmButtonText: "确定",
              callback: action => {
                if (action == "confirm") {
                  this.ruleForm.forceType = 1;
                  // this.submitForm(formName);
                  this.userLogin();
                }
              }
            });
          } else {
            this.loadings = false;
            // this.getImgecode();
            this.loading = !this.loading;
            this.$message({ message: res.msg, type: "error" });
            //  错误三次就手机
            if (res.data == 4) {
              this.typeNumber = 1;
              this.ruleForm.code = "";
            }
          }
        })
        .catch(err => {
          this.loading = !this.loading;
        });
    },
    refresh() {
      this.getImgecode();
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
            this.imgCode = res;
            // this.imgCode = [];
            // this.imgCode = [res.img, res.smallImage];
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
      if (!myreg.test(this.ruleForm.phoneNumber)) {
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
      // if (!val) {
      //   this.$message({ message: "请输入正确的图形验证码", type: "error" });
      //   return;
      // }
      this.loadings = true;
      const data = {
        code: val,
        phoneNumber: this.ruleForm.phoneNumber,
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
            this.codeStatus = false;
            this.ruleForm.uuid = res.data;
            const _this = this;
            _this.timerStatus = false;
            this.authTimer = setInterval(() => {
              _this.timer--;
              if (_this.timer <= 0) {
                // _this.disableds = true;
                _this.timerStatus = true;
                _this.timer = 60;
                clearInterval(this.authTimer);
              }
            }, 1000);
          } else {
            this.loadings = false;
            this.errShow = true;
            this.getImgecode();
            setTimeout(() => {
              this.errShow = false;
            }, 3000);
          }
        })
        .catch(err => (this.loadings = false));
    }
  }
};
</script>
<style scoped lang="scss">
@import "../../styles/variables.scss";

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
  position: absolute;
  top: 233px;
  left: 1326px;
  // width: 438px;
  width: 400px;
  height: 500px;
  // height: 575px;
  margin-left: -200px;
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
      top: 2px;
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
    // color: #52acff;
    padding-top: 62px;
    padding-bottom: 35px;
    padding-left: 30px;
    font-weight: 700;
  }
  .multi-account-title2 {
    margin-top: 20px;
    padding-left: 30px;
    font-size: 20px;
    font-weight: 700;
    color: rgba(32, 52, 87, 1);
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
      display: flex;
      align-items: center;
      width: 540px;
      height: 90px;
      background-color: #e4edf3;
      margin: 0 auto;
      border-radius: 8px;
      margin-bottom: 20px;
      color: #333333;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);

      .head-portrait {
        width: 60px;
        height: 60px;
        // line-height: 60px;
        // margin-top: 16px;
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
        width: 420px;
        overflow: hidden; //溢出内容隐藏
        text-overflow: ellipsis; //文本溢出部分用省略号表示
        display: -webkit-box; //特别显示模式
        -webkit-line-clamp: 2; //行数
        line-clamp: 2;
        -webkit-box-orient: vertical; //盒子中内容竖直排列
      }

      .mange-user {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 16px;
        margin-left: 6px;
        background: linear-gradient(90deg, rgba(204, 204, 204, 1) 0%, rgba(204, 204, 204, 0) 100%);
        color: rgba(32, 52, 87, 0.4);
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
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(170, 170, 170, 0.1) 100%) !important;
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
    .bg1 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 159, 63, 0.1) 100%);
    }
    .bg2 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(212, 48, 48, 0.1) 100%);
    }
    .bg3 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(42, 130, 228, 0.1) 100%);
    }
    .bg4 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(18, 224, 101, 0.1) 100%);
    }
    .bg5 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(66, 18, 224, 0.1) 100%);
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
.orgTyepName {
  display: flex;
  align-items: center;
  height: 90px;
  margin-left: 10px;
  writing-mode: horizontal-tb;
  color: blue;
}
.shabi {
  position: absolute;
  right: 20px;
  bottom: 20px;
  color: rgba(204, 204, 204, 1);
  font-size: 14px;
}
.df {
  display: flex;
  align-items: center;
  margin-top: 6px;
  .loginName {
    display: flex;
    justify-content: start;
    max-width: 400px;
    text-align: left;
    color: rgba(32, 52, 87, 0.6);
  }
}
</style>
