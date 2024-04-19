<template>
  <div>
    <!-- 查看弹框 -->
    <el-dialog title="查看交底" center top="5vw" :visible="disclosureDialog" @close="checkDialogClose" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div style="position: relative;" class="dialog-form">
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="查看交底" name="first">
            <div class="h-520">
              <el-form label-width="80px">
                <el-row :span="24" class="el-row-data">
                  <el-col :span="12" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9">
                    <el-form-item label="项目">
                      <el-input :value="formDate.fkProjectName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="user.orgType !== 5">
                    <el-form-item label="标段项目">
                      <el-input :value="formDate.fkBidProjectName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交底名称">
                      <el-input :value="formDate.disclosureName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交底方式">
                      <el-select v-model="formDate.receivingType" size="mini" style="width:100%" disabled>
                        <el-option v-for="(item, idx) in receivingTypeList" :key="idx" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <!-- <el-col :span="12" v-if="radio != 2">
                    <el-form-item label="交底单位">
                      <el-input :value="formDate.fkOrgName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col> -->
                  <el-col :span="12">
                    <el-form-item label="交底部门">
                      <el-input :value="formDate.fkDeptName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交底人">
                      <el-input :value="formDate.fkUserName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交底时间">
                      <el-input :value="formDate.disclosureTime" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <!-- <el-col :span="12" v-if="radio != 2">
                    <el-form-item label="接收单位">
                      <el-input :value="formDate.fkReceivingOrgName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="radio != 3">
                    <el-form-item label="接收部门">
                      <el-input :value="formDate.fkReceivingDeptName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col> -->
                  <el-col :span="12">
                    <el-form-item label="接收人">
                      <el-input :value="formDate.fkReceivingUserName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="接收时间">
                      <el-input :value="formDate.receivingTime" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="this.formDate.fkParentId == 0 ? '发起人' : '抄送人'">
                      <el-input :value="formDate.userName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="this.formDate.fkParentId == 0 ? '发起时间' : '抄送时间'">
                      <el-input :value="formDate.createTime" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="附件" v-if="fileList.length">
                      <div>
                        <span v-for="(item, idx) in fileList" :key="idx" class="file-item">
                          <input class="fileCheckBox" type="checkbox" @change="checkBoxChange($event, item)" />
                          <span type="primary" style="text-decoration: underline;color:#4196e8;cursor: pointer" @click="preview(item)">{{ item.enclosureName }}</span>
                        </span>
                      </div>
                      <span style="color:#4196e8;cursor: pointer;" @click="downLoad">下载</span>
                    </el-form-item>
                    <el-form-item label="附件" v-if="!fileList.length">无</el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="抄送记录" name="second" v-if="this.formDate.fkParentId === '0'">
            <div class="h-520 table-data">
              <el-table :data="copyRecordList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
                <el-table-column align="center" prop="disclosureName" label="交底名称"> </el-table-column>
                <el-table-column align="center" prop="fkDeptName" label="抄送人部门" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="fkUserName" label="抄送人" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="createTime" label="抄送发送时间" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="fkReceivingDeptName" label="接收部门" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="fkReceivingUserName" label="接收人" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="receivingTime" label="接收时间" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" label="交流方式">
                  <template slot-scope="{ row }">
                    {{ row.receivingType === 1 ? "会议交底" : row.receivingType === 2 ? "书面交底" : row.receivingType === 3 ? "会议与书面交底" : "" }}
                  </template>
                </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                  <img src="@/assets/empty.svg" class="zanwu" />
                  <span>暂无数据</span>
                </div>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
        <!-- <el-form label-width="80px" class="number">
          <el-form-item label="编号">
            <el-input :value="formDate.technicalCode" size="mini" disabled></el-input>
          </el-form-item>
        </el-form> -->
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="checkDialogClose">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + url" v-if="previewType == 1"></iframe>
        <img class="img" :src="url" alt="" v-if="previewType == 3" />
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
    disclosureDialog: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  data() {
    return {
      // 1：会议交底， 2：书面交底，3：会议与书面交底
      receivingTypeList: [
        { value: 1, label: "会议交底" },
        { value: 2, label: "书面交底" },
        { value: 3, label: "会议与书面交底" }
      ],
      fileList: [],
      checkList: [],
      url: "",
      previewType: 3,
      previewDialog: false,
      activeName: "first",
      formDate: {
        disclosureName: "",
        disclosureTime: "",
        disclosureType: null,
        enableStatus: null,
        enclosures: [],
        fkBidProjectId: null,
        fkDeptId: null,
        fkProjectId: null,
        fkReceivingDeptId: null,
        fkReceivingOrgId: null,
        fkReceivingUserId: null,
        fkUserId: null,
        forwardType: null,
        receivingType: null
      }
    };
  },
  methods: {
    // 根据id查询交底
    selectDisclosureById(pkId) {
      this.$api.selectDisclosureById({ pkId }).then(res => {
        if (res.code === 200) {
          this.formDate = res.data;
          this.fileList = res.data.enclosures ? res.data.enclosures : [];
          this.copyRecordList = res.data.copyVos ? res.data.copyVos : [];
          this.$emit("update:disclosureDialog", true);
          this.$emit("closeLoading");
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    checkDialogClose() {
      this.fileList = [];
      this.formDate = {
        disclosureName: "",
        disclosureTime: "",
        disclosureType: null,
        enclosures: [],
        enableStatus: null,
        fkBidProjectId: null,
        fkDeptId: null,
        fkProjectId: null,
        fkReceivingDeptId: null,
        fkReceivingOrgId: null,
        fkReceivingUserId: null,
        fkUserId: null,
        forwardType: null,
        receivingType: null
      };
      this.activeName = "first";
      this.$emit("update:disclosureDialog", false);
    },
    // 下载多选框
    checkBoxChange(e, row) {
      let check = e.target.checked;
      if (check) {
        this.checkList.push(row);
      } else {
        this.checkList = this.checkList.filter(item => item !== row);
      }
    },
    // 预览
    preview(row) {
      console.log(row);
      if (!row.enclosureUrl) {
        return this.$message.warning("无法识别的文件");
      }
      let exit = row.enclosureUrl.substring(row.enclosureUrl.lastIndexOf(".") + 1);
      let imgList = ["png", "jpg", "jpeg"];
      let orderList = ["docx", "xlsx"];
      this.url = row.enclosureUrl;
      if (exit === "pdf") {
        this.$refs.pdfPiev.pdfShow = true;
      } else if (imgList.includes(exit)) {
        this.previewType = 3;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (orderList.includes(exit)) {
        this.previewType = 1;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else {
        this.$message.warning("该文件无法预览");
      }
    },
    // 下载
    downLoad() {
      if (this.checkList.length === 1) {
        let exit = this.checkList[0].enclosureUrl.substring(this.checkList[0].enclosureUrl.lastIndexOf(".") + 1);
        this.fileLinkToStreamDownload(this.checkList[0].enclosureUrl, this.checkList[0].enclosureName, exit);
      } else if (this.checkList.length > 1) {
        // let fileUrls = this.checkList.map(item => item.enclosureUrl).join(",");
        let fileList = this.checkList.map(item=>({fileUrl:item.enclosureUrl,fileName:item.enclosureName}))
        this.loading = true;
        this.$api
          .compressFile({ fileName: "附件" + Date.now(), fileList })
          .then(res => {
            console.log("压缩包", res);
            if (res.code === 200) {
              this.fileLinkToStreamDownload(res.data, this.formDate.disclosureName + '-附件', "zip");
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    fileLinkToStreamDownload(url, fileName, type) {
      let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/;
      if (!reg.test(url)) {
        throw new Error("传入参数不合法,不是标准的文件链接");
      } else {
        let xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.setRequestHeader("Content-Type", `application/${type}`);
        xhr.responseType = "blob";
        xhr.onload = function() {
          if (this.status == 200) {
            //接受二进制文件流
            // console.log(this);
            var blob = this.response;
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
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.fileList {
  display: flex;
  flex-wrap: wrap;
  max-height: 80px;
  overflow: auto;
  .fileList-item {
    display: flex;
    .fileName {
      cursor: pointer;
      max-width: 120px;
      overflow: hidden;
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
  }
}
::-webkit-scrollbar {
  width: 5px;
  color: #fff;
  background-color: #fcfcfc;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.file-item {
  margin: 0 10px;
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
.h-520 {
  height: 520px;
}
.number {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
