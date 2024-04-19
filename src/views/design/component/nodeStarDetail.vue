<template>
  <div>
    <el-dialog title="发起信息" :visible="dialogShow" width="70%" center top="0vw" @close="handleCancel" v-loading="loading" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <!-- 左侧流程图 -->
        <div class="bpmns" v-if="dialogShow">
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
        <div style="flex:1">
          <!-- 非项目部新增时展示 -->
          <el-form :inline="true" :model="formData" ref="addform1" label-width="80px" v-if="user.orgType !== 5">
            <el-form-item label="变更编号" label-width="120px" prop="changesCode">
              <el-input size="mini" v-model.trim="formData.changesCode" class="wh-200" disabled></el-input>
            </el-form-item>
            <el-form-item label="项目" prop="fkProjectId" v-if="user.orgType !== 4" disabled>
              <el-input size="mini" v-model.trim="formData.fkProjectName" class="wh-87per" maxlength="100" disabled></el-input>
            </el-form-item>
            <el-form-item label="标段" prop="fkBidProjectId" v-if="user.orgType !== 4" disabled>
              <el-input size="mini" v-model.trim="formData.fkBidProjectName" class="wh-87per" maxlength="100" disabled></el-input>
            </el-form-item>
          </el-form>
          <el-form label-width="120px" :model="formData" ref="addform2">
            <el-form-item label="变更编号" v-if="user.orgType === 5" prop="changesCode">
              <el-input size="mini" v-model.trim="formData.changesCode" class="wh-87per" disabled></el-input>
            </el-form-item>
            <el-form-item label="变更名称" prop="changesName">
              <el-input size="mini" v-model.trim="formData.changesName" class="wh-87per" maxlength="50" disabled></el-input>
            </el-form-item>
            <el-form-item label="变更类型" prop="fkWorkflowTemplateId">
              <el-input size="mini" v-model="formData.fkWorkflowTemplateName" class="wh-87per" maxlength="100" disabled></el-input>
            </el-form-item>
            <el-tabs v-model="activeName" type="card">
              <el-tab-pane label="变更信息" name="1">
                <el-form-item label="变更设计原因" prop="changesReason">
                  <el-input v-model="formData.changesReason" type="textarea" maxlength="1500" :rows="4" resize="none" class="wh-87per" disabled> </el-input>
                </el-form-item>
                <el-form-item label="变更设计方案" prop="changesPlan">
                  <el-input v-model="formData.changesPlan" type="textarea" maxlength="2000" :rows="4" resize="none" class="wh-87per" disabled> </el-input>
                </el-form-item>
                <el-form-item label="变更预估成本" prop="changesCost">
                  <el-input v-model="formData.changesCost" type="textarea" maxlength="2000" :rows="4" resize="none" class="wh-87per" disabled> </el-input>
                </el-form-item>
                <el-form-item label="附件">
                  <div class="fileList">
                    <div class="fileList-item" v-for="(row, idx) in formData.fileList" :key="idx">
                      <div class="fileName" :title="row.fileName" @click="preview(row)">{{ row.fileName }}</div>
                    </div>
                  </div>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane v-for="(item, index) in tableDTOS" :key="index" :label="item.tableName" :name="2 + index + ''">
                <div class="tab-box h-480" @scroll="handleScroll">
                  <div class="text-html">
                    <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
                      <tr v-for="(item, idx) in item.tableHtml" :key="idx" style="" v-show="item.status">
                        <td style="box-sizing: content-box;border:none;margin:0;padding:0" :contentEditable="false" @blur="tdBlur(item, id, $event.target.innerText, $event, i)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                          <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                          <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" :disabled="i.id != '' && i.id == user.pkId && i.name != ''" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
                          <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:<img width="100px" crossorigin="anonymous" :src="i.signatureDate.img" alt=""/></span>
                          <el-select ref="scroll" v-if="i.attributeTypes == 2" size="mini" :disabled="i.id != '' && i.id == user.pkId && i.name != ''" v-model="i.name" placeholder="请选择">
                            <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                          </el-select>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-form>
        </div>
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
    getData: {},
    dialogShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeName: "1",
      formData: {
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
      this.$emit("update:dialogShow", false);
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
      this.activeName = "1";
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
    dialogShow(val) {
      if (val) {
        if (this.getData) {
          this.activeName = "1";
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
            this.tableDTOS.forEach(item => {
              item.tableHtml = this.utils.unzip(item.tableHtml);
              if (item.tableHtml instanceof Array) {
              } else {
                item.tableHtml = JSON.parse(item.tableHtml);
              }
            });
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
.dialog-form {
  display: flex;
}
.bpmns {
  width: 300px;
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
img {
  max-width: 900px;
  // max-height: 610px;
}
.preview {
  /deep/ .el-dialog__headerbtn {
    display: none;
  }

  .previewHeight {
    display: flex;
    justify-content: center;
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
.fileName {
  cursor: pointer;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  /*禁⽌换⾏*/
  text-overflow: ellipsis;
  /*省略号*/
}
</style>
