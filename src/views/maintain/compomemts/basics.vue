<template>
  <div>
    <el-radio-group v-model="customType" size="mini" @change="orgTypeChange">
      <el-radio-button label="0">常用配置</el-radio-button>
      <el-radio-button label="1">PC端配置</el-radio-button>
      <el-radio-button label="2">APP端配置</el-radio-button>
    </el-radio-group>
    <div class="box">
      <!-- 审批核生认证 -->
      <div class="item" v-if="customType == 0">
        <div>
          <div class="item-title">审批核身验证：</div>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                处理业务时，启用人脸识别进行核验 身份，保证业务操作的实名性，杜绝冒认 签名。启用后，核验还受APP中的【核身间隔时间】参数影响，指定时间内不重复核验。
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <el-select placeholder="请选择" size="mini" v-model="enableStatus">
            <el-option label="启用" value="0"></el-option>
            <el-option label="停用" value="1"></el-option>
          </el-select>
          <el-input size="mini" v-model="validTime" v-if="enableStatus == 0" class="wh-100"></el-input>
          <span v-if="enableStatus == 0" class="size-14">小时</span>
        </div>
        <div class="item-center">
          <div class="item-title">审批启用电子签名：</div>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                处理业务时，是否需要审批人签名。启用后审批需要在APP中进行手签
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <el-select placeholder="请选择" size="mini" v-model="enableStatus1">
            <el-option label="启用" value="0"></el-option>
            <el-option label="停用" value="1"></el-option>
          </el-select>
        </div>
        <div class="item-center">
          <div class="item-title">可编辑数据范围：</div>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                是否允许编辑其他人数据。（除了工作流指定到具体人的操作外）
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <el-select placeholder="请选择" size="mini" v-model="enableStatus2">
            <el-option label="只能编辑自己新增数据" value="0"></el-option>
            <el-option label="可编辑自己权限范围内的数据" value="1"></el-option>
          </el-select>
        </div>
      </div>
      <!-- PC参数 -->
      <div class="item" v-if="customType == 1">
        <div class="item-title">PC超时退出系统：</div>
        <el-tooltip effect="dark" placement="bottom-start">
          <div slot="content">
            <div class="describe-title">
              参数描述
            </div>
            <div class="describe-box">
              账号在PC端登录后，在指定设置时间内没有操作，账号登录信息会自动过期，退出登录，保护账号安全。范围为5~120分钟。
            </div>
          </div>
          <i class="el-icon-warning-outline"></i>
        </el-tooltip>
        <!-- <el-input size="mini" v-model="validTime" class="wh-100"></el-input> -->
        <el-input-number size="mini" v-model="validTime" :min="5" :max="120"></el-input-number>
        <span class="size-14">分钟</span>
      </div>
      <!--  APP端配置-->
      <div class="item" v-if="customType == 2">
        <div>
          <div class="item-title">APP登录核身验证：</div>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                APP每次登录后，启用核验身份， 保证账号的人身匹配以及账号安全。
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <el-select placeholder="请选择" size="mini" v-model="enableStatus">
            <el-option label="启用" value="0"></el-option>
            <el-option label="停用" value="1"></el-option>
          </el-select>
        </div>
        <div class="item-center">
          <div class="item-title">APP登录过期时间：</div>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                账号在APP端登录后，无用户操作情况下，账号自动退出，下次操作时需要重新登录。
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <el-select placeholder="请选择" size="mini" v-model="validType">
            <el-option label="永不过期" value="0"></el-option>
            <el-option label="设置过期时间" value="1"></el-option>
          </el-select>
          <el-input size="mini" v-model="validTime" v-if="validType == 1" class="wh-100"></el-input>
          <span v-if="validType == 1" class="size-14">天</span>
        </div>
      </div>
      <div class="btn-text" v-if="customType != 0">
        <el-button type="text" @click="deFault">获取系统默认设置</el-button>
      </div>
      <div class="btn">
        <el-button type="primary"  v-has="'maintain:feature:add'" @click="submit">保存</el-button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "basicsEdit",
  props: {
    basicStatus: {
      type: Boolean
    },
    id: {
      type: String
    }
  },
  data() {
    return {
      customType: "0",
      enableStatus: "",
      validTime: "",
      validType: "",
      pkId: "",
      dataList: [],
      enableStatus1: "",
      enableStatus2: ""
    };
  },
  mounted() {},
  watch: {
    basicStatus(val) {
      if (val) {
        this.customType = "0";
        this.init();
      }
    }
  },
  methods: {
    orgTypeChange(val) {
      this.enableStatus = "";
      this.validTime = "";
      this.validType = "";
      this.pkId = "";
      this.init();
    },
    init() {
      this.$api.customFeature({ customType: this.customType, orgId: this.id }).then(res => {
        if (res.code == 200) {
          if (res.data.length) {
            res.data.forEach(item => {
              if (item.customCode == "审批核身验证" && item.customType == 0) {
                this.enableStatus = item.enableStatus + "";
                this.validTime = item.validTime;
              } else if (item.customCode == "审批启用电子签名" && item.customType == 0) {
                this.enableStatus1 = item.enableStatus + "";
              } else if (item.customCode == "可编辑数据范围" && item.customType == 0) {
                this.enableStatus2 = item.bizCode + "";
              } else if (item.customCode == "PC超时退出系统" && item.customType == 1) {
                this.validTime = item.validTime;
              } else if (item.customCode == "APP登录核身验证" && item.customType == 2) {
                this.enableStatus = item.enableStatus + "";
              } else if (item.customCode == "APP登录过期时间" && item.customType == 2) {
                this.validTime = item.validTime;
                this.validType = item.validType + "";
              }
            });
          } else {
            this.enableStatus = "";
            this.validTime = "";
            this.enableStatus1 = "";
            this.enableStatus2 = "";
            this.validType = "";
            // console.log( this.validTime)
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    deFault() {
      this.$api.customFeature({ customType: this.customType, orgId: this.id, isSystem: "1" }).then(res => {
        if (res.code == 200) {
          if (res.data.length) {
            res.data.forEach(item => {
              if (item.customCode == "审批核身验证" && item.customType == 0) {
                this.enableStatus = item.enableStatus + "";
                this.validTime = item.validTime;
              } else if (item.customCode == "审批启用电子签名" && item.customType == 0) {
                this.enableStatus1 = item.enableStatus + "";
              } else if (item.customCode == "可编辑数据范围" && item.customType == 0) {
                this.enableStatus2 = item.bizCode + "";
              } else if (item.customCode == "PC超时退出系统" && item.customType == 1) {
                this.validTime = item.validTime;
              } else if (item.customCode == "APP登录核身验证" && item.customType == 2) {
                this.enableStatus = item.enableStatus + "";
              } else if (item.customCode == "APP登录过期时间" && item.customType == 2) {
                this.validTime = item.validTime;
                this.validType = item.validType + "";
              }
            });
          } else {
            this.enableStatus = "";
            this.validTime = null;
            this.enableStatus1 = "";
            this.enableStatus2 = "";
            this.validType = "";
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    submit() {
      let arr = [];
      if (this.customType == 0) {
        arr = [
          {
            customCode: 0,
            customType: 0,
            enableStatus: this.enableStatus,
            fkOrgId: this.id,
            validTime: this.validTime
          },
          {
            customCode: 5,
            customType: 0,
            enableStatus: this.enableStatus1,
            fkOrgId: this.id
          },
          {
            customCode: 4,
            customType: 0,
            enableStatus: this.enableStatus2,
            fkOrgId: this.id,
            bizCode: this.enableStatus2
          }
        ];
      } else if (this.customType == 1) {
        arr = [
          {
            customCode: 1,
            customType: 1,
            enableStatus: "",
            fkOrgId: this.id,
            validTime: this.validTime
          }
        ];
      } else if (this.customType == 2) {
        arr = [
          {
            customCode: 2,
            customType: 2,
            fkOrgId: this.id,
            enableStatus: this.enableStatus
          },
          {
            customCode: 3,
            customType: 2,
            fkOrgId: this.id,
            enableStatus: "",
            validTime: this.validTime,
            validType: this.validType
          }
        ];
      }
      this.$api.customFeatureUpdate(arr).then(res => {
        if (res.code == 200) {
          this.$message.success("保存成功");
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
  position: relative;
  height: 80%;
  width: 100%;
  border: 1px solid #ccc;
  padding: 20px;
  .item {
    padding: 20px;
    width: 100%;
    height: 80%;
    background: #f3f3f3;
    .item-center {
      margin-top: 20px;
    }
    .item-title {
      display: inline-block;
      width: 160px;
      text-align: right;
      font-size: 14px;
    }
    .size-14 {
      font-size: 14px;
    }
  }
  .btn-text {
    position: absolute;
    top: 50px;
    right: 50px;
  }
  .btn {
    margin-top: 20px;
    text-align: center;
  }
}
</style>
