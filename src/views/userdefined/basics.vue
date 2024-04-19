<template>
  <div class="app-container" v-loading="loading">
    <!-- <el-radio-group v-model="customType" size="mini" @change="orgTypeChange">
      <el-radio-button label="0">常用配置</el-radio-button>
      <el-radio-button label="1">PC端配置</el-radio-button>
      <el-radio-button label="2">APP端配置</el-radio-button>
    </el-radio-group> -->
    <el-tabs v-model="customType" @tab-click="orgTypeChange">
      <el-tab-pane label="常用配置" name="0"></el-tab-pane>
      <el-tab-pane label="PC端配置" name="1"></el-tab-pane>
      <el-tab-pane label="APP端配置" name="2"></el-tab-pane>
    </el-tabs>
    <div class="box">
      <!-- 审批核生认证 -->
      <div class="item" v-if="customType == 0">
        <div v-if="![10, 11, 12].includes(user.orgType)">
          <span style="display: inline-block;text-indent: 2em;">审批核身验证：</span>
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
          <el-input size="mini" type="number" onKeypress="return(/[\d\.]/.test(String.fromCharCode(event.keyCode)))" v-model="validTime" v-if="enableStatus == 0" @input="validTime = $limitInputNumber(validTime, 48, 2, 0)" class="wh-100"></el-input>
          <span v-if="enableStatus == 0">小时</span>
        </div>

        <div class="item-center" v-if="![4, 10, 11, 12].includes(user.orgType)">
          <span>审批启用电子签名：</span>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                处理业务时，是否需要审批人签名。启用后审批需要在APP中进行手签。
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <el-select placeholder="请选择" size="mini" v-model="validType">
            <el-option label="启用" value="0"></el-option>
            <el-option label="停用" value="1"></el-option>
          </el-select>
        </div>

        <!-- <div class="item-center">
          <span class="item-title">审批流程跳过节点：</span>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                当设置为可跳过，在流程审批过程中，下个节点匹配不到相应人员时，则跳过该节点。当设置未不可跳过，则需配置好下个节点人员，否则当前节点无法进行提交审批到下一节点。
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <el-select placeholder="请选择" size="mini" v-model="enableStatus3">
            <el-option label="可跳过匹配不到人员节点" value="0"></el-option>
            <el-option label="不可跳过流程节点" value="1"></el-option>
          </el-select>
          
        </div> -->
        <div class="item-center" v-if="user.orgType == 5">
          <div class="item-title">分项工程完成标志：</div>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                需要完成验收流程的所有工序：完成验收流程的生产施工工序和生产验收工序才算分项工程完成。 完成验收流程的生产施工工序：只需要完成验收流程的生产施工工序即算分项工程完成。
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <el-select placeholder="请选择" size="mini" v-model="enableStatus4">
            <el-option label="需要完成验收流程的所有工序" value="0"></el-option>
            <el-option label="完成验收流程的生产施工工序" value="1"></el-option>
          </el-select>
        </div>

        <div class="item-center">
          <div class="item-title">系统名称：</div>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                设置后，系统顶部名称显示为设置的名称，企业端未自定义系统名称时，默认为运营商设置的名称
              </div>
            </div>
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
          <div class="item-contents">
            <el-input size="mini" v-model="systemName" maxlength="50"></el-input>
          </div>
        </div>
        <div class="item-center item-center2">
          <div class="item-title">系统LOGO：</div>
          <el-tooltip effect="dark" placement="bottom-start">
            <div slot="content">
              <div class="describe-title">
                参数描述
              </div>
              <div class="describe-box">
                设置后，系统顶部LOGO显示为设置的LOGO，企业端未自定义系统LOGO时，默认为运营商设置的LOGO
              </div>
            </div>
            <i class="el-icon-warning-outline h-16"></i>
          </el-tooltip>
          <div class="item-contents ml-10">
            <div class="imgs" v-if="!!logoUrl">
              <img :src="logoUrl" alt="" />
              <div class="mask">
                <!-- <span class="el-icon-zoom-in maskIcon" @click="perImg(item)"></span> -->
                <span class="maskIcon el-icon-delete" @click="delImg"></span>
              </div>
            </div>
            <div class="uploadDiv" @click="clickUpload" v-else>
              <span class="el-icon-plus uploadIcon"></span>
              <span class="size">最佳尺寸：100 x 100</span>
            </div>
          </div>
        </div>
      </div>
      <!-- PC参数 -->
      <div class="item" v-if="customType == 1">
        <span>PC超时退出系统：</span>
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
        <el-input-number size="mini" v-model="validTime" :min="5" :max="120" label="描述文字" @keydown.native="keyDown"></el-input-number>
        <span>分钟</span>
      </div>
      <!--  APP端配置-->
      <div class="item" v-if="customType == 2">
        <div>
          <span>APP登录核身验证：</span>
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
          <span>APP登录过期时间：</span>
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
          <el-input size="mini" v-model="validTime" type="number" onKeypress="return(/[\d\.]/.test(String.fromCharCode(event.keyCode)))" v-if="validType == 1" class="wh-100" @input="validTime = $limitInputNumber(validTime, 30, 1, 0)"></el-input>
          <span v-if="validType == 1">天</span>
        </div>
      </div>
      <div class="btn-text">
        <el-button type="text" v-if="user.orgType != 0" @click="deFault">获取系统默认设置</el-button>
      </div>
      <div class="btn">
        <el-button type="primary" class="el-button-primary" v-has="'userdefined:basics:save'" @click="submit">保存</el-button>
      </div>
    </div>
    <!-- 上传用input框 -->
    <input v-show="false" type="file" ref="imgFiles" id="upload" accept=".jpeg,.jpg,.png" @change="upLoad" />
  </div>
</template>
<script>
import COS from "cos-js-sdk-v5";
export default {
  name: "menuList",
  data() {
    return {
      customType: "0",
      enableStatus: "",
      validTime: "",
      validType: "",
      pkId: "",
      dataList: [],
      enableStatus3: "",
      systemName: "",
      logoUrl: "",
      loading: false,
      enableStatus4: ""
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    // 禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    orgTypeChange(val) {
      this.enableStatus = "";
      this.validTime = "";
      this.validType = "";
      this.pkId = "";
      this.init();
    },
    init() {
      this.$api.searchByCustomType({ customType: this.customType, isSystem: "0" }).then(res => {
        if (res.code == 200) {
          if (this.customType == 1) {
            if (res.data.length > 0) {
              let ght = res.data.length - 1;
              this.enableStatus = res.data[ght].enableStatus + "";
              this.validTime = res.data[ght].validTime;
              this.validType = res.data[ght].validType;
              this.pkId = res.data[ght].pkId;
            }
          } else if (this.customType == 2) {
            if (res.data.length != 0) {
              res.data.forEach(item => {
                if (item.customCode == "APP登录核身验证") {
                  this.enableStatus = item.enableStatus + "";
                }
                if (item.customCode == "APP登录过期时间") {
                  this.validType = item.validType + "";
                  this.validTime = item.validTime;
                }
              });
              this.dataList = res.data;
            }
          } else if (this.customType == 0) {
            if (res.data.length != 0) {
              res.data.forEach(item => {
                if (item.customCode == "审批核身验证") {
                  this.enableStatus = item.enableStatus + "";
                  this.validTime = item.validTime;
                }
                if (item.customCode == "审批启用电子签名") {
                  this.validType = item.enableStatus + "";
                }
                // if (item.customCode == "跳过流程审批节点") {
                //   this.enableStatus3 = item.enableStatus + "";
                // }
                if (item.customCode == "系统名称") {
                  this.systemName = item.keyword;
                }
                if (item.customCode == "系统LOGO") {
                  this.logoUrl = item.keyword;
                }
                if (item.customCode == "分项工程完成标志") {
                  this.enableStatus4 = item.enableStatus + "";
                }
              });
              this.dataList = res.data;
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    deFault() {
      this.$api.searchByCustomType({ customType: this.customType, isSystem: "1" }).then(res => {
        if (res.code == 200) {
          if (this.customType == 1) {
            if (res.data.length > 0) {
              let ght = res.data.length - 1;
              this.enableStatus = res.data[ght].enableStatus + "";
              this.validTime = res.data[ght].validTime;
              this.validType = res.data[ght].validType;
              this.pkId = res.data[ght].pkId;
            }
          } else if (this.customType == 2) {
            if (res.data.length != 0) {
              res.data.forEach(item => {
                if (item.customCode == "APP登录核身验证") {
                  this.enableStatus = item.enableStatus + "";
                }
                if (item.customCode == "APP登录过期时间") {
                  this.validType = item.validType + "";
                  this.validTime = item.validTime;
                }
              });
              this.dataList = res.data;
            }
          }
          if (this.customType == 0) {
            if (res.data.length != 0) {
              res.data.forEach(item => {
                if (item.customCode == "审批核身验证") {
                  this.enableStatus = item.enableStatus + "";
                  this.validTime = item.validTime;
                }
                if (item.customCode == "审批启用电子签名") {
                  this.validType = item.enableStatus + "";
                }
                if (item.customCode == "系统名称") {
                  this.systemName = item.keyword;
                }
                if (item.customCode == "系统LOGO") {
                  this.logoUrl = item.keyword;
                }
              });
              this.dataList = res.data;
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    submit() {
      let data = {
        customType: this.customType,
        enableStatus: this.enableStatus,
        validTime: this.validTime,
        customCode: this.customType
      };

      if (this.pkId != null && this.pkId.length != 0) {
        data.pkId = this.pkId;
      }
      let arr = [];
      if (this.customType == 1) {
        arr.push(data);
      } else if (this.customType == 2) {
        // return console.log(this.dataList)
        // if (this.dataList.length) {
        //   this.dataList.forEach(item => {
        //     if (item.customCode == "APP登录核身验证") {
        //       item.enableStatus = this.enableStatus;
        //     }
        //     if (item.customCode == "APP登录过期时间") {
        //       item.validType = this.validType;
        //       item.validTime = this.validTime;
        //     }
        //   });
        //   arr = this.dataList;
        // }else{
        arr = [
          {
            customCode: 2,
            enableStatus: this.enableStatus,
            customType: 2
          },
          {
            customCode: 3,
            validType: this.validType,
            enableStatus: "",
            customType: 2,
            validTime: parseFloat(this.validTime)
          }
        ];
      } else if (this.customType == 0) {
        arr = [
          {
            customCode: 5,
            enableStatus: this.validType,
            customType: 0
          },
          {
            customCode: 0,
            enableStatus: this.enableStatus,
            customType: 0,
            validTime: this.validTime
          },
          // {
          //   customCode: 6,
          //   customType: 0,
          //   enableStatus: this.enableStatus3
          // },
          {
            customCode: 9,
            customType: 0,
            enableStatus: 0,
            keyword: this.systemName
          },
          {
            customCode: 10,
            customType: 0,
            enableStatus: 0,
            keyword: this.logoUrl
          },
          {
            customCode: 11,
            customType: 0,
            enableStatus: this.enableStatus4
          }
        ];
      }
      if (this.customType == 2 && this.validType == 1 && this.validTime < 1) {
        return this.$message.warning("APP超时退出系统的设置时间不能小于2");
      }
      this.loading = true;
      // return console.log(arr);
      this.$api
        .addAndUpdate(arr)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("保存成功");
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    delImg() {
      this.logoUrl = "";
    },
    clickUpload() {
      this.$refs.imgFiles.click();
    },
    // 获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";
      const cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            StartTime: startTime, // 时间戳，单位秒，如：1580000000
            ExpiredTime: expiredTime, // 时间戳，单位秒，如：1580000900
            // ExpiredTime: 1646819905,
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
      const index = filename.lastIndexOf(".");
      const name = filename.substring(index + 1, filename.length);
      const _this = this;
      cos.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: _this.uploadDate.objectKey + "." + name,
          Body: file,
          onProgress: function(progressData) {
            console.log(JSON.stringify(progressData));
          }
        },
        function(err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            _this.logoUrl = path;
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.imgFiles.value = "";
          } else {
            _this.$refs.imgFiles.value = "";
            _this.loading = false;
            _this.$message({
              type: "error",
              message: "上传失败"
            });
          }
        }
      );
    },
    upLoad() {
      const fileObj = document.getElementById("upload").files[0];
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      if (!["image/png", "image/jpeg", "image/jpg"].includes(fileObj.type)) {
        return this.$message.warning("仅支持上传jpeg，jpg，png类型的图片");
      }
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      if (fileObj.size > 5242880) {
        this.$refs.files.value = "";
        return this.$message.warning("文件大小不能超过5M");
      }
      let sign = "";
      let path = "";
      this.loading = true;
      this.$api
        .getUploadFileToken()
        .then(res => {
          if (res.code == 200) {
            sign = res.data.token;
            path = res.data.endpoint;
            this.uploadDate = res.data;
            this.$options.methods.upLoads.bind(this)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime);
          } else {
            console.log("res", res);
            this.$refs.imgFiles.value = "";
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          console.log("err", err);
          this.$refs.imgFiles.value = "";
          this.loading = false;
        });
    },
    // 上传腾讯云
    uploadFile(sign, folder, file, filename) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";

      const cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            // StartTime: 1646818105, // 时间戳，单位秒，如：1580000000
            ExpiredTime: startTime, // 时间戳，单位秒，如：1580000900
            // ExpiredTime: 1646819905,startTime
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  position: relative;
  height: 93%;
  width: 100%;
  // border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  .item {
    padding: 20px;
    width: 100%;
    height: 80%;
    // background: #f3f3f3;
    .item-center {
      margin-top: 20px;
    }
    .item-center2 {
      display: flex;
    }
    .item-title {
      display: inline-block;
      width: 145px;
      text-align: right;
    }
    .h-16 {
      height: 16px;
    }
    .item-contents {
      display: inline-block;
    }
    .ml-10 {
      margin-left: 10px;
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
/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
.imgs {
  position: relative;
  // margin-bottom: 20px;
  img {
    width: 150px;
    height: 150px;
  }
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 150px;
    height: 150px;
    background-color: rgba(0, 0, 0, 0);
    z-index: 5;
    .maskIcon {
      display: none;
      color: #fff;
      font-size: 30px;
      cursor: pointer;
    }
    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
      transition: 0.5s;
      .maskIcon {
        display: flex;
      }
    }
  }
}
.uploadDiv {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  border: 1px dashed #c0ccda;
  cursor: pointer;
  .uploadIcon {
    font-size: 30px;
    color: #c0ccda;
  }
  .size {
    position: absolute;
    font-size: 12px;
    bottom: 20px;
    color: #aaaaaa;
  }
}
</style>
