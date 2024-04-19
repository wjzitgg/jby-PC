<template>
  <div>
    <el-dialog :close-on-press-escape="false" title="节点处理信息" :visible="dialogVisible2" width="75%" top="5vh" @close="handleCancel" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-forms">
        <el-container>
          <!-- 左侧流程图 -->
          <div class="bpmns" v-if="dialogVisible2">
            <div class="flow-chart-box h700">
              <div class=" flow-char-begin">
                <div class="circle">
                  <div class="circle-item"></div>
                  <div class="circle-icon-bottom">
                    <i class="el-icon-arrow-down circle-icon"></i>
                  </div>
                  <div v-if="approveSum != null && beginRow" class="circle-icon-right">
                    <i class="el-icon-arrow-left icon-right-left"></i>
                  </div>
                </div>
                <div class="begin-details">
                  <div>{{ formData.createUserName }}</div>
                  <div>{{ formData.createTime }}</div>
                  <div>发起流程</div>
                </div>
              </div>

              <div class="flow-char-item" v-for="(item, index) in formData.taskFinishVoList.slice(1)" :key="index">
                <div class="char-item-left" :class="{ 'char-item-pass': item.approveStatus == 2, 'char-item-nopass': item.approveStatus == 1 }">
                  <div class="char-item-left-name">
                    <img src="../../../assets/avg.svg" alt="" />
                    <div>{{ item.activityName }}</div>
                  </div>
                  <div class="down-arrow">
                    <i class="el-icon-arrow-down arrow"></i>
                  </div>
                  <div class="circle-icon-right" v-show="item.approveStatus == 3">
                    <i class="el-icon-arrow-left icon-right-left"></i>
                  </div>
                  <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'right-arrow': item.approveStatus == 3, 'right-arrow2': item.approveStatus == 1 }"></div>
                  <div v-show="approveSum > index || approveSum == index" :class="{ 'upper-right': item.approveStatus != 1, 'upper-right2': item.approveStatus == 1 }"></div>
                  <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'turn-down': item.approveStatus == 1, 'turn-down2': item.approveStatus == 3 }">{{ item.approveStatus == 1 ? "审批不通过" : "撤回" }}</div>
                </div>
                <div class="char-item-right">
                  <div>{{ item.assignee ? item.assignee : "跳过" }}</div>
                  <div v-if="item.endTime != null">{{ item.endTime }}</div>
                  <div v-if="item.approveStatus == 2">审批通过</div>
                  <div v-if="item.approveStatus == 1">审批不通过</div>
                </div>
              </div>
              <div class="flow-char-end">
                <div class="circle">
                  <div class="circle-item"></div>
                  <div class="end">结束</div>
                </div>
                <div class="begin-details"></div>
              </div>
            </div>
          </div>
          <el-main style="position: relative;">
            <el-tabs v-model="activeName1">
              <el-tab-pane label="处理信息" name="first">
                <!-- 头部信息 -->
                <div class="dialog-header">
                  <el-row :span="24" style="width:100%">
                    <el-col :span="6">
                      <div class="dialog-header-item">
                        <div class="label">处理结果：</div>
                        <!-- 审批状态 0 审批不通过 1 通过 -->
                        <div class="value">{{ formData.approveStatus ? "审批通过" : "审批不通过" }}</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="dialog-header-item">
                        <div class="label">处理岗位：</div>
                        <div class="value">{{ formData.roleName }}</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="dialog-header-item">
                        <div class="label">处理人：</div>
                        <div class="value">{{ formData.approver }}</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="dialog-header-item">
                        <div class="label">处理时间：</div>
                        <div class="value">{{ formData.approveTime }}</div>
                      </div>
                    </el-col>
                    <el-col :span="24">
                      <div class="dialog-header-item">
                        <div class="label">处理意见：</div>
                        <div class="value">
                          <el-input type="textarea" rows="5" :value="formData.approveComment" disabled resize="none"> </el-input>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div>
                  <!-- class="borders" -->
                  <el-tabs v-model="activeName2" :key="cardRandomKey">
                    <el-tab-pane :label="item.tableName" :name="'userTables' + index" v-for="(item, index) in tableDTOS" :key="index">
                      <div class="tab-box" @scroll="handleScroll">
                        <div class="text-html">
                          <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
                            <tr v-for="(item, idx) in item.tableHtml" :key="idx" style="" v-show="item.status">
                              <td style="box-sizing: content-box;border:none;margin:0;padding:0" :contentEditable="false" @blur="tdBlur(item, id, $event.target.innerText, $event, i)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                                <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                                <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" :disabled="true" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
                                <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:<img width="100px" crossorigin="anonymous" :src="i.signatureDate.img" alt=""/></span>
                                <el-select ref="scroll" v-if="i.attributeTypes == 2" size="mini" :disabled="true" v-model="i.name" placeholder="请选择">
                                  <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                                </el-select>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane label="附件" name="files">
                      <div class="table1 table-data">
                        <el-table stripe :header-cell-style="{ background: '#f1f6ff' }" :data="accessoryList" height="100%" style="width: 100%" :tooltip-effect="'light'">
                          <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                          <el-table-column label="附件内容描述" align="center" prop="remark" show-overflow-tooltip> </el-table-column>
                          <el-table-column label="附件" align="center" prop="fileName"> </el-table-column>
                          <div slot="empty" class="empty" style="width: 100%">
                            <img src="@/assets/empty.svg" class="zanwu" />
                            <span>暂无数据</span>
                          </div>
                        </el-table>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-main>
        </el-container>
      </div>
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.fileUrl" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj.fileUrl" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
  </div>
</template>

<script>
import pdfPiev from "../../../components/pdf-preview/pdf-preview.vue";
export default {
  components: { pdfPiev },
  props: {
    // 控制弹框开关
    dialogVisible2: {
      type: Boolean,
      default: false
    },
    getData: {}
  },
  data() {
    return {
      activeName1: "first",
      activeName2: "files",
      formData: {
        approver: "",
        settleName: "",
        // fkApproverId: "",
        beginDate: "",
        endDate: "",
        endSettleAmount: 0,
        finishAmount: 0,
        lastSettleAmount: 0,
        remark: "",
        settleAmount: 0,
        settleDate: "",
        settleStatus: 0,
        settleDetails: [],
        fkContractId: ""
      },
      loading: false,
      checkList: [],
      // 附件列表
      accessoryList: [],
      // 当前点击表单上传的数据
      nowUploadObj: {},
      // 当前预览的表单obj
      nowPreviewObj: {},
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      // pdf弹框数据
      url: "",
      signDate: {},
      tableDTOS: [],
      contractList: [],
      cardRandomKey: Math.random(),
      approveSum: null,
      beginRow: false
    };
  },
  methods: {
    // 关闭模态框
    handleCancel() {
      this.$emit("update:dialogVisible2", false);
      this.formData = {
        approver: "",
        settleName: "",
        beginDate: "",
        endDate: "",
        endSettleAmount: 0,
        finishAmount: 0,
        lastSettleAmount: 0,
        remark: "",
        settleAmount: 0,
        settleDate: "",
        settleStatus: 0,
        settleDetails: [],
        fkContractId: ""
      };
      this.beginRow = false;
      this.activeName1 = "first";
      this.activeName2 = "files";
      this.accessoryList = [];
    },
    // 下载附件
    downloadAcc(row) {
      const url = row.fileUrl;
      const name = row.fileName;
      this.fileLinkToStreamDownload(url, name, "pdf");
    },
    fileLinkToStreamDownload(url, fileName, type) {
      const xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.setRequestHeader("Content-Type", `application/${type}`);
      xhr.responseType = "blob";
      xhr.onload = function() {
        if (this.status == 200) {
          // 接受二进制文件流
          const blob = this.response;
          const blobUrl = window.URL.createObjectURL(blob);
          // 这里的文件名根据实际情况从响应头或者url里获取
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(blobUrl);
        }
      };
      xhr.send();
    },
    // 预览
    preview(row) {
      const str = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1);
      if (str == "xlsx" || str == "docx") {
        this.previewType = 1;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (str == "pdf") {
        this.url = row.fileUrl;
        this.$refs.pdfPiev.pdfShow = true;
      } else {
        this.previewType = 3;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      }
    },
    // 自定义表格方法
    handleScroll(val) {
      if (this.$refs.scroll != undefined) {
        this.$refs.scroll.forEach(item => {
          item.blur();
        });
      }
    },
    tdBlur(item, id, val, e, i) {
      if (item.arr[id].checkout == true) {
        return;
      }
      item.arr[id].name = val;
      e.target.innerText = item.arr[id].name;
      if (i.disabled) {
        // let data = JSON.parse(sessionStorage.getItem("user"))
        i.id = this.user.pkId;
      }
      console.log();
    },
    tdNameChange(item, id, val) {
      //  纯数字
      if (item.arr[id].checkType == 1) {
        val = val.replace(/[^0-9]/g, "");
        item.arr[id].name = val;
      }
      // 小数
      if (item.arr[id].checkType == 2) {
        val = val.replace(/[^\d.]/g, "");
        item.arr[id].name = val;
      }
      // 金额
      if (item.arr[id].checkType == 3) {
        val = val.replace(/[^\d.]/g, ""); // 清除“数字”和“.”以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(".", "$#$");
        val = val.replace(/\./g, "");
        val = val.replace("$#$", ".");
        val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
        item.arr[id].name = val;
      }
      // // 日期
      if (item.checkType == 4) {
        val = val.replace(/[^0-9-]/g, "");
        item.arr[id].name = val;
      }
      // 电话号码
      if (item.arr[id].checkType == 5) {
        val = val.replace(/[^0-9]/g, "");
        val = val.slice(0, 11);
        if (val.length >= 11) {
          const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
          if (!reg.test(val)) {
            this.$message.warning("请输入正确的手机号");
            item.arr[id].name = "";
          } else {
            item.arr[id].name = val;
          }
        }
      }
      // 身份证
      if (item.checkType == 6) {
        val = val.replace(/[\u4e00-\u9fa5/\s+/]|[^a-zA-Z0-9\u4E00-\u9FA5]/g, "");
        item.arr[id].name = val;
      }
    },
    tdNameBlur(item, id, val) {
      // 手机号
      if (item.arr[id].checkType == 5) {
        const mobile = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        if (val.length != 0) {
          if (!mobile.test(val)) {
            this.$message.warning("请输入正确的手机号");
            item.arr[id].name = "";
          }
        }
      }

      // 日期
      if (item.arr[id].checkType == 4) {
        const data = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
        if (val.length != 0) {
          if (data.test(val)) {
          } else {
            item.arr[id].name = "";
            return this.$message.warning("请输入正确的时间格式xxxx-xx-xx");
          }
        }
      }
      // 身份证
      if (item.arr[id].checkType == 6) {
        const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        // 15位身份证号码校验正则
        const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
        if (val.length != 0) {
          if (reg.test(val) || regs.test(val)) {
          } else {
            item.arr[id].name = "";
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user")) || [];
    }
  },
  watch: {
    previewDialog(val) {
      if (!val) {
        this.nowPreviewObj = {};
      }
    },
    dialogVisible2(val) {
      if (val) {
        if (this.getData) {
          this.formData = this.getData;
          this.formData.createUserName = this.getData.taskFinishVoList[0].assignee;
          this.formData.createTime = this.getData.taskFinishVoList[0].endTime;
          this.approveSum = null;
          this.getData.taskFinishVoList.slice(1).forEach((item, index) => {
            if (item.approveStatus == 1 || item.approveStatus == 3) {
              this.approveSum = index;
            }
            if (item.approveStatus == 1) {
              this.beginRow = true;
            }
          });
          this.accessoryList = this.getData.fileList ? this.getData.fileList : [];
          this.tableDTOS = this.getData.workflowTableList ? JSON.parse(JSON.stringify(this.getData.workflowTableList)) : [];
          if (this.tableDTOS.length) {
            this.activeName2 = "userTables0";
            this.tableDTOS.forEach(item => {
              item.tableHtml = this.utils.unzip(item.tableHtml);
              if (item.tableHtml instanceof Array) {
              } else {
                item.tableHtml = JSON.parse(item.tableHtml);
              }
            });
          } else {
            this.activeName2 = "files";
          }
        } else {
          this.formData = { taskFinishVoList: [] };
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-forms {
  margin: 0 10px 10px;
}

/deep/ .el-dialog__footer {
  text-align: center;
}

.dialog-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 10px;
  // background-color: #f3f3f3;

  span {
    display: block;
    width: 105px;
    margin-right: 10px;
    text-align: center;
  }

  .dialog-header-item {
    display: flex;
    // align-items: center;
    margin: 7px 10px;

    .label {
      width: 90px;
      padding-right: 6px;
      text-align: right;
    }

    .value {
      flex: 1;
      display: flex;
      align-items: center;
    }
  }
}

.el-main {
  padding-top: 0;
  padding-bottom: 0;
  width: 90%;

  .approveDetail {
    display: flex;
    justify-content: space-evenly;
    margin-top: 7px;

    .approveDetail-left {
      flex: 1;
      border-right: 1px #ccc solid;
      padding-right: 5px;

      .appResult {
        display: flex;
        align-items: center;
        margin-bottom: 3px;
      }

      .el-radio {
        margin-top: 3px;
      }

      // display: flex;
      .appReamrk {
        flex: 2;
        display: flex;

        .remark {
          width: 80px;
        }
      }
    }

    .approveDetail-right {
      flex: 1;
      height: 75px;
      margin-left: 5px;
      overflow: auto;

      .accessory-item {
        display: flex;
        align-items: center;

        span {
          margin-right: 5px;
        }

        .uploadBtn {
          cursor: pointer;
          font-size: 20px;
        }
      }
    }
  }

  .approveBtn {
    margin: 20px 0;
    text-align: center;
  }
}

// /deep/.el-date-editor.el-input {
//   width: 100px;
// }

.bpmns {
  width: 360px;
  border-right: 1px solid #f0f0f0;

  // width: 200px !important;
  // height: 600px;
  ::-webkit-scrollbar {
    height: 8px;
  }

  ::-webkit-scrollbar-track-piece {
    height: 8px;
    border-radius: 10px;
    background-color: #f5f7fa;
  }

  ::-webkit-scrollbar-thumb {
    height: 8px;
    border-radius: 10px;
    background-color: #e9e9e9;
    background-clip: padding-box;
  }

  .canvas {
    width: 300px;
    height: 100%;
    // padding-left: 40px;
    text-align: center;
    overflow: hidden auto;
  }

  .h600 {
    height: 600px;
  }

  .h700 {
    height: 700px;
  }
}

.table1 {
  height: 400px;
}

.fileName {
  width: 210px;
  overflow: hidden;
  /*超出部分隐藏*/
  white-space: nowrap;
  /*禁⽌换⾏*/
  text-overflow: ellipsis;
  /*省略号*/
}

.preview {
  /deep/ .el-dialog__headerbtn {
    display: none;
  }

  .previewHeight {
    min-height: 100px;
    max-height: 650px;
    overflow: auto;
    text-align: center;
    background: url("../../../assets/loading.gif") no-repeat center center;
  }

  .iframe {
    width: 100%;
    height: 640px;
  }

  .img {
    max-width: 900px;
    // max-height: 610px;
  }
}

.tab-box {
  position: relative;
  height: 400px;
  overflow: auto;

  .text-html {
    input {
      // background-color: red;
      text-align: center;
    }
  }
}

/deep/ .el-icon-arrow-right:before {
  content: "\e791";
  font-size: 16px;
}

/deep/ .el-tabs__item {
  color: #a8a8a8;

  &:hover {
    color: #3aa3dc;
  }
}

/deep/ .el-tabs__item.is-active {
  color: #3aa3dc;
}

.borders {
  border: 1px solid #f0f0f0;
  padding: 10px 10px 0;
}

.table-data {
  /deep/ .el-table__body-wrapper {
    background-color: #fff;
  }
}

.flow-chart-box {
  width: 300px;
  height: 100%;
  overflow: hidden auto;

  .flow-char-begin {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .circle {
      width: 90px;
      line-height: 60px;
      text-align: center;
      vertical-align: middle;
      text-align: center;
      position: relative;

      .circle-item {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        border: 1px solid;
        vertical-align: middle;
        display: inline-block;
      }

      .circle-icon-bottom {
        width: 1px;
        height: 40px;
        border-right: 1px solid #70b603;
        position: absolute;
        left: 49%;
        bottom: -34px;

        .circle-icon {
          color: #70b603;
          position: absolute;
          bottom: -9px;
          left: -7px;
        }
      }

      .circle-icon-right {
        position: absolute;
        width: 50px;
        border-top: 1px solid;
        top: 27px;
        left: 73%;

        .icon-right-left {
          position: absolute;
          bottom: -7px;
          left: -5px;
        }
      }
    }

    .begin-details {
      width: 120px;
      height: 60px;
      text-align: center;
      border: 1px dashed;
      font-size: 11px;
    }
  }

  .flow-char-item {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .char-item-left {
      width: 90px;
      // line-height: 60px;
      text-align: center;
      border: 1px solid;
      vertical-align: middle;
      position: relative;
      border-radius: 5px;

      .char-item-left-name {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60px;
      }

      .down-arrow {
        width: 1px;
        height: 40px;
        border-right: 1px dashed;
        position: absolute;
        left: 49%;

        .arrow {
          position: absolute;
          bottom: -6px;
          left: -7px;
        }
      }
      .circle-icon-right {
        position: absolute;
        width: 25px;
        border-top: 1px solid;
        top: 27px;
        right: -27px;
        .icon-right-left {
          position: absolute;
          bottom: -7px;
          left: -5px;
        }
      }
      .right-arrow {
        position: absolute;
        width: 70px;
        border-top: 1px solid;
        top: 78px;
        left: 50%;
      }

      .upper-right {
        position: absolute;
        height: 52px;
        border-right: 1px solid;
        left: 114px;
        bottom: -19px;
      }

      .right-arrow2 {
        position: absolute;
        width: 25px;
        border-top: 1px solid;
        top: 35px;
        left: 89px;
      }

      .upper-right2 {
        position: absolute;
        height: 114px;
        border-right: 1px solid;
        left: 114px;
        bottom: 24px;
      }

      .turn-down {
        position: absolute;
        background: #ffff;
        left: 110px;
        top: -77px;
      }
      .turn-down2 {
        position: absolute;
        background: #ffff;
        left: 110px;
        top: 52%;
      }
    }

    .char-item-pass {
      background: #dafba9;
      border-color: #dafba9;

      .down-arrow {
        border-right: 1px solid #70b603;

        .arrow {
          color: #70b603;
        }
      }
    }

    .char-item-nopass {
      background: #f2a6af;
      border-color: #f2a6af;
    }

    .char-item-right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 60px;
      // text-align: center;
      border: 1px dashed;
      // line-height: 60px;
      font-size: 12px;
    }
  }
  .flow-char-end {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .circle {
      width: 90px;
      line-height: 60px;
      text-align: center;
      vertical-align: middle;
      text-align: center;
      position: relative;

      .circle-item {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        border: 1px solid;
        vertical-align: middle;
        display: inline-block;
        background-color: #000;
      }

      .circle-icon-bottom {
        width: 1px;
        height: 40px;
        border-right: 1px solid #70b603;
        position: absolute;
        left: 49%;
        bottom: -34px;

        .circle-icon {
          color: #70b603;
          position: absolute;
          bottom: -9px;
          left: -7px;
        }
      }

      .circle-icon-right {
        position: absolute;
        width: 50px;
        border-top: 1px solid;
        top: 27px;
        left: 73%;

        .icon-right-left {
          position: absolute;
          bottom: -7px;
          left: -5px;
        }
      }
    }
    .end {
      position: absolute;
      top: 0;
      right: -15px;
    }
    .begin-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 60px;
      // text-align: center;
      // border: 1px dashed;
      font-size: 11px;
    }
  }
}

.background-red {
  /deep/ .el-input__inner {
    padding: 0;
    background-color: #f4b4bc !important;
  }
}
</style>
