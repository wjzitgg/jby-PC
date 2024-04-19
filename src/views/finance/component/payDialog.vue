<template>
  <div>
    <el-dialog :title="dialogTitle" :visible="dialogVisible" @close="closeDialog" :close-on-press-escape="false" v-loading="loading1" v-dialogDrag :close-on-click-modal="false">
      <el-form label-width="120px" ref="dialogForm" :rules="rules" :model="dialogForm" class="dialog-form">
        <el-row :span="24" class="el-row-data">
          <el-col :span="12">
            <el-form-item :label="tableType == 1 ? '供应商' : '分包单位'" prop="fkCustomerId">
              <el-select :disabled="dialogType === 1" size="mini" v-model="dialogForm.fkCustomerId" style="width:100%" v-if="dialogType !== 1" @change="customerChange">
                <el-option v-for="item in customList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
              <el-input v-model="dialogForm.customName" disabled v-if="dialogType === 1" size="mini"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="tableType == 1 ? '支付方式' : '收款方式'" prop="paymentCode">
              <el-select :disabled="dialogType === 1" size="mini" v-model="dialogForm.paymentCode" style="width:100%">
                <el-option v-for="item in payTypeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="tableType == 1 ? '支付账号' : '收款账号'" prop="payAccount">
              <el-input :disabled="dialogType === 1" size="mini" v-model="dialogForm.payAccount" maxlength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="tableType == 1 ? '支付单号' : '收款单号'" prop="payChannel">
              <el-input :disabled="dialogType === 1" size="mini" v-model="dialogForm.payChannel" maxlength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="累计结算金额">
              <el-input disabled size="mini" v-model="statistics.totalSettlementAmount"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上期末累计付款">
              <el-input disabled size="mini" v-model="statistics.payBalanceFront"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前应付金额">
              <el-input disabled size="mini" v-model="statistics.totalUnpaidAmount"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本期付款" prop="payAmount">
              <!-- oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="dialogForm.payAmount = $event.target.value" -->
              <el-input :disabled="dialogType === 1" size="mini" v-model="dialogForm.payAmount" @input="payAmountInput($event)"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本期末累计付款">
              <el-input disabled size="mini" :value="lastPayAmount"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="付款日期" prop="payTime">
              <el-date-picker :disabled="dialogType === 1" size="mini" value-format="yyyy-MM-dd" v-model="dialogForm.payTime" style="width:100%"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="上传凭证">
              <div class="imgList">
                <div class="imgs" v-for="(item, idx) in imgList" :key="idx">
                  <img :src="item" alt="" />
                  <div class="mask">
                    <span class="el-icon-zoom-in maskIcon" @click="perImg(item)"></span>
                    <span class="maskIcon el-icon-delete" v-if="dialogType !== 1" @click="delImg(idx)"></span>
                  </div>
                </div>
                <div class="uploadDiv" @click="clickUpload" v-if="imgList.length < 3 && dialogType !== 1">
                  <span class="el-icon-plus uploadIcon"></span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" v-if="dialogType !== 1">
        <el-button size="mini" @click="closeDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="btnOk">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 预览图片弹框 -->
    <el-dialog :visible.sync="ImgDialog" title="查看图片">
      <div class="prevDialog">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </div>
    </el-dialog>
    <!-- 上传用input框 -->
    <input v-show="false" type="file" ref="imgFiles" id="upload" accept=".jpeg,.jpg,.png" @change="upLoad" />
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5";
export default {
  props: {
    // 1为供应商结算，2份分包单位结算
    tableType: {
      type: Number
    },
    dialogVisible: {
      type: Boolean
    },
    // 1查看，2新增，3编辑
    dialogType: {
      type: Number
    },
    dialogTitle: {
      type: String,
      default: ""
    },
    id: ""
  },
  data() {
    return {
      loading1: false,
      dialogForm: {
        fkCustomerId: "",
        payAccount: "",
        payAmount: "",
        payChannel: "",
        payTime: "",
        paymentCode: "",
        sourceType: this.tableType === 1 ? 0 : 1,
        voucherUrl: ""
      },
      imgList: [],
      ImgDialog: false,
      dialogImageUrl: "",
      payTypeList: [],
      rules: {
        fkCustomerId: [{ required: true, message: `请选择${this.tableType === 1 ? "供应商" : "分包单位"}`, trigger: ["blur", "change"] }],
        payAccount: [{ required: true, message: "请填写支付账号", trigger: "blur" }],
        payAmount: [{ required: true, message: "请填写支付金额", trigger: "blur" }],
        payChannel: [{ required: true, message: "请填写支付渠道", trigger: "blur" }],
        payTime: [{ required: true, message: "请填写支付时间", trigger: "blur" }],
        paymentCode: [{ required: true, message: "请选择支付方式编码", trigger: ["blur", "change"] }]
      },
      customList: [],
      statistics: {
        payBalanceFront: 0,
        totalSettlementAmount: 0,
        totalUnpaidAmount: 0
      }
    };
  },
  computed: {
    lastPayAmount() {
      // dialogForm.payAmount
      let sum = this.dialogForm.payAmount ? this.statistics.payBalanceFront - 0 + (this.dialogForm.payAmount - 0) : this.statistics.payBalanceFront;
      return sum;
    }
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.getItemClass(14);
        if (this.dialogType !== 1) {
          this.getSubList();
        }
        // 1为供应商结算，2份分包单位结算
        if (this.tableType === 1) {
        } else {
        }
        if (this.dialogType !== 2) {
          if (this.id) {
            this.findProjFinanceIntercourseById();
          }
        }
      }
    }
  },
  methods: {
    findProjFinanceIntercourseById() {
      this.$api.findProjFinanceIntercourseById({ pkId: this.id }).then(res => {
        if (res.code === 200) {
          this.dialogForm = res.data;
          this.dialogForm.fkCustomerId = res.data.fkCustomerId == undefined ? res.data.customName : res.data.fkCustomerId;
          if (res.data.voucherUrl.length) {
            this.imgList = res.data.voucherUrl.split(",");
          } else {
            this.imgList = [];
          }

          this.statistics = {
            payBalanceFront: res.data.payBalanceFront,
            totalSettlementAmount: res.data.totalSettlementAmount,
            totalUnpaidAmount: res.data.totalUnpaidAmount
          };
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分包单位/供应商
    getSubList() {
      this.$api.subcontractor({ customType: this.tableType === 1 ? 3 : 4 }).then(res => {
        if (res.code === 200) {
          this.customList = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getItemClass(dictType) {
      this.$api.getItemClass({ dictType }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
          if (dictType === 14) {
            this.payTypeList = arr;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getStatistics(customId) {
      this.$api.getStatistics({ customId }).then(res => {
        console.log("统计", res);
        if (res.code === 200) {
          this.statistics = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    customerChange(e) {
      if (e) {
        this.getStatistics(e);
      } else {
        this.statistics = {
          payBalanceFront: 0,
          totalSettlementAmount: 0,
          totalUnpaidAmount: 0
        };
      }
    },
    payAmountInput(e) {
      console.log(e, this.statistics.totalUnpaidAmount);
      this.dialogForm.payAmount = this.$limitInputNumber(e, this.statistics.totalUnpaidAmount, "-999999999", 2);
    },
    async btnOk() {
      await this.$refs.dialogForm.validate();
      this.dialogForm.voucherUrl = this.imgList.join(",");
      console.log(this.dialogForm);
      this.loading1 = true;
      if (this.dialogType === 2) {
        this.$api
          .addProjFinanceIntercourse(this.dialogForm)
          .then(res => {
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.$emit("getList");
              this.closeDialog();
            } else {
              this.$message.warning(res.msg);
            }
            this.loading1 = false;
          })
          .catch(err => {
            this.loading1 = false;
          });
      } else if (this.dialogType === 3) {
        this.$api
          .updateProjFinanceIntercourse(this.dialogForm)
          .then(res => {
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.$emit("getList");
              this.closeDialog();
            } else {
              this.$message.warning(res.msg);
            }
            this.loading1 = false;
          })
          .catch(err => {
            this.loading1 = false;
          });
      }
    },
    closeDialog() {
      this.$emit("close");
      this.dialogForm = {
        fkCustomerId: "",
        payAccount: "",
        payAmount: "",
        payChannel: "",
        payTime: "",
        paymentCode: "",
        sourceType: this.tableType === 1 ? 3 : 4,
        voucherUrl: ""
      };
      this.imgList = [];
      this.statistics = {
        payBalanceFront: 0,
        totalSettlementAmount: 0,
        totalUnpaidAmount: 0
      };
      this.$refs.dialogForm.resetFields();
    },
    // 删除图片
    delImg(idx) {
      this.imgList.splice(idx, 1);
    },
    // 预览图片
    perImg(row) {
      console.log(row);
      this.dialogImageUrl = row;
      this.ImgDialog = true;
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
            _this.imgList.push(path);
            _this.loading1 = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.imgFiles.value = "";
          } else {
            _this.$refs.imgFiles.value = "";
            _this.loading1 = false;
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
      this.loading1 = true;
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
            this.loading1 = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          console.log("err", err);
          this.$refs.imgFiles.value = "";
          this.loading1 = false;
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
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.imgList {
  display: flex;
  //   justify-content: space-evenly;
  flex-wrap: wrap;
  width: 100%;
  .imgs {
    position: relative;
    margin: 0 20px 20px 20px;
    // margin-bottom: 20px;
    img {
      width: 100px;
      height: 100px;
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      width: 100px;
      height: 100px;
      background-color: rgba(0, 0, 0, 0);
      z-index: 5;
      .maskIcon {
        display: none;
        color: #fff;
        font-size: 20px;
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
}
.uploadDiv {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  margin: 0 20px 20px 20px;
  border: 1px dashed #c0ccda;
  cursor: pointer;
  .uploadIcon {
    font-size: 30px;
    color: #c0ccda;
  }
}
.prevDialog {
  height: 600px;
  overflow: auto;
}
</style>
