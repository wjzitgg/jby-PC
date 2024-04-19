<template>
  <div class="login-warp">
    <!-- <vue-particles
      color="#fff"
      :particleOpacity="0.7"
      :particlesNumber="60"
      shapeType="circle"
      :particleSize="4"
      linesColor="#fff"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="2"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
      class="lizi"
    >
    </vue-particles> -->
    <div class="box_left_bj">
      <img src="@/assets/bj.png" />
    </div>
    <!-- 登录框 -->
    <div class="login-box">
      <div class="yx-tit">重置密码</div>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-ruleForm" label-width="80px" style="padding-left: 50px; padding-right: 50px">
        <el-form-item label="个人账号" prop="loginName">
          <el-input v-model="ruleForm.loginName"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model.trim="ruleForm.phoneNumber" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
        </el-form-item>
        <el-form-item class="jw-code" label="验证码" prop="code">
          <el-input type="text" v-model="ruleForm.code" placeholder="请输入验证码" @input="ruleForm.code = $limitPhone2(ruleForm.code)" maxlength="4" style="width: 50%"> </el-input>
          <div class="login-code" @click="getCode">
            <el-button type="primary">获取验证码</el-button>
          </div>
        </el-form-item>
        <el-form-item class="gap">
          <el-button type="primary" class="button" @click="resetPassword('ruleForm')">重置密码</el-button>
          <el-button><router-link to="/login">返回登陆页</router-link></el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog :visible.sync="popup" center top="30vh" title="请输入图形验证码，再获取手机验证码!" width="24%" @close="closePop">
      <img :src="imgCode" class="spacing" />
      <el-input v-model.trim="ruleForm.code" placeholder="请输入图形验证码" maxlength="4"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="getImgecode">切换验证码</el-button>
        <el-button type="success" @click="getNote">获取短信验证码</el-button>
      </div>
      <!-- <div class="btn-code">
            <el-button type="primary">切换验证码</el-button>
            <el-button type="success">获取短信验证码</el-button>
          </div> -->
    </el-dialog>
    <div :show-close="false" class="fpsuee login-box" v-show="forgpass" :close-on-click-modal="false">
      <i class="iconfont el-icon-success"></i>
      <p>密码重置成功！</p>
      <p>您的登录密码已重置为<span style="color: #4678ff">888888</span></p>
      <div class="dialog-footer">
        <el-button type="primary"><router-link to="/login">返回登陆页</router-link></el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ruleForm: {
        loginName: "",
        code: "",
        uuid: "",
        phoneNumber: ""
      },
      rules: {
        loginName: [{ required: true, message: "个人账号不能为空", trigger: "blur" }],
        phoneNumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }],
        code: [{ required: true, message: "验证码不能为空", trigger: "blur" }]
      },
      imgCode: "",
      typeNumber: 0, //0图形验证码登录 1是手机验证码登录
      popup: false,
      forgpass: false
    };
  },
  created() {
    this.getImgecode();
  },
  methods: {
    resetPassword(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //判断验证码以及是哪种类型登录
          if (!this.ruleForm.loginName) {
            this.$message({ message: "请输入个人账号", type: "error" });
            return;
          }
          //校验手机号
          let myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
          if (!myreg.test(this.ruleForm.phoneNumber)) {
            this.$message({ message: "请输入正确的手机号码", type: "error" });
            return;
          }
          //手机验证码
          if (!this.ruleForm.code) {
            this.$message({ message: "请输入正确的验证码", type: "error" });
            return;
          }
          this.$api
            .resePasswords(this.ruleForm)
            .then(res => {
              console.log(res);
              if (res.code == 200) {
                this.forgpass = true;
              } else {
                this.$message.warning(res.msg);
              }
            })
            .catch(err => {});
        }
      });
    },
    //获取图形验证码
    async getImgecode() {
      await this.$api
        .imgCode()
        .then(res => {
          if (res.code === 200) {
            this.imgCode = res.img;
            this.ruleForm.uuid = res.uuid;
          } else {
            this.$message({ message: res, type: "error" });
          }
        })
        .catch(err => {});
    },

    // 获取手机验证码
    getCode() {
      //校验手机号
      let myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(this.ruleForm.phoneNumber)) {
        this.$message({ message: "请输入正确的手机号码", type: "error" });
        return;
      }
      this.judgePhone();
    },
    // 关闭获取短信的弹窗
    closePop() {
      this.ruleForm.code = "";
    },

    // 获取短信验证码
    getNote() {
      if (!this.ruleForm.code) {
        this.$message({ message: "请输入正确的图形验证码", type: "error" });
        return;
      }
      let data = {
        code: this.ruleForm.code,
        phoneNumber: this.ruleForm.phoneNumber,
        sendType: "3",
        uuid: this.ruleForm.uuid
      };
      this.$api
        .mobileMsg(data)
        .then(res => {
          if (res.code === 200) {
            this.popup = false;
            this.$message({ message: "验证码发送成功", type: "success" });
            this.ruleForm.uuid = res.data;
          } else {
            this.getImgecode();
            this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(err => {});
    },
    // 判断是否是当前账号的手机号
    judgePhone() {
      // ruleForm
      this.$api
        .isCurrentUsersTelephone({
          loginName: this.ruleForm.loginName,
          telephone: this.ruleForm.phoneNumber
        })
        .then(res => {
          console.log(res);
          if (res.code === 200) {
            if (res.data) {
              this.getImgecode();
              this.popup = true; //控制弹窗
            } else {
              this.$message.warning("账号或手机号不正确");
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
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
  margin-top: 40px;
  text-align: center;
  .button {
    margin-right: 40px;
  }
}
.login-warp {
  width: 100%;
  height: 100%;
  background-color: #4678ff;
  overflow-y: hidden;
  // background-image: url(../../assets/login-bg.jpg);
  // background-size: 100% 100%;
  .box_left_bj {
    width: 1340px;
    height: 794px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.login-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  background: #ffffff;
  width: 623px;
  height: 446px;
  padding: 55px 25px 5px 25px;
  .yx-tit {
    margin: 0 auto 30px auto;
    text-align: center;
    color: #000;
    font-size: 20px;
    font-weight: bold;
  }
}

.login-code {
  cursor: pointer;
  position: absolute;
  top: 0px;
  right: 0;
  width: 41%;
  height: 40px;
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
  p {
    text-align: center;
    line-height: 40px;
    font-size: 22px;
  }
  .primary {
    text-align: center;
  }
  .dialog-footer {
    margin-top: 60px;
    text-align: center;
  }
}
.el-icon-success {
  color: #4678ff;
  font-size: 50px;
  text-align: center;
  display: flow-root;
  margin-bottom: 38px;
}
</style>
