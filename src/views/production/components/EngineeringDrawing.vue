<template>
  <div>
    <el-dialog :close-on-press-escape="false" title="工程图纸" :visible="EngDraDialog" @close="handleClose" width="60%" center v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <!-- 头部搜索框 -->
        <SearchBar>
          <template slot="left">
            <el-input size="mini" placeholder="请输入要搜索的图纸名称" v-model="inpData" maxlength="25"></el-input>
            <el-button size="mini" type="primary" class="el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
          </template>
          <template slot="right">
            <el-button size="mini" type="primary" v-has="'production:setting:drawingUpload'" class="el-button-primary" @click="handleOpen()" v-if="orgType === 5">上传图纸</el-button>
          </template>
        </SearchBar>
        <div class="drawtable table-data">
          <el-table :data="tableData" style="width: 100%" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
            <el-table-column align="center" label="序号" type="index" width="80">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="图纸名称" prop="drawingName" />
            <el-table-column align="center" label="图纸页数" prop="drawingPages" show-overflow-tooltip />
            <el-table-column align="center" label="备注" prop="remark" show-overflow-tooltip />
            <el-table-column align="center" label="操作" width="400">
              <template slot-scope="{ row }">
                <el-button size="mini" plain v-has="'production:setting:drawingView'" @click="openPdf(row)" type="primary">预览</el-button>
                <el-button size="mini" plain v-has="'production:setting:drawingView'" @click="openCheckDialog(row.pkId)" type="primary">详情</el-button>
                <!-- v-show="row.isUpdateAndDelete == '1'" -->
                <el-button size="mini" plain @click="handleOpen(row.pkId)" v-if="orgType === 5" v-has="'production:setting:drawingEdit'">编辑</el-button>
                <el-button size="mini" v-has="'production:setting:drawingDownload'" plain @click="download(row)" v-if="orgType === 5" type="success">下载图纸</el-button>
                <el-button size="mini" plain type="danger" v-has="'production:setting:drawingDelete'" @click="handleDel(row.pkId)" v-if="orgType === 5">删除</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
      </div>
    </el-dialog>
    <!-- 查看图纸模态框 -->
    <el-dialog :close-on-press-escape="false" title="查看图纸" :visible="checkDialog" width="30%" @close="closeCheckDialog" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-form label-width="80px">
          <el-form-item label="图纸名称">
            <el-input size="mini" disabled maxlength="25" minlength="2" :value="formData.drawingName"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" rows="3" resize="none" maxlength="100" disabled :value="formData.remark"></el-input>
          </el-form-item>
        </el-form>
        <div class="h-400 table-data">
          <el-table height="100%" :data="linkList" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column align="center" label="序号" type="index" width="60" />
            <el-table-column align="center" label="工程" prop="itemName" show-overflow-tooltip />
            <el-table-column align="center" label="关联页数" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <span>第{{ row.beginPage }}页</span>
                <span v-show="row.endPage">-第{{ row.endPage }}页</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="{ row }">
                <el-button size="mini" @click="openPdf2(row)">查看</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <Pagination :pageSize="linkPage.pageSize" :total="linkTotal" :currentPage="linkPage.pageNum" @handleSizeChange="handleLinkSizeChange" @handleCurrentChange="handleLinkCurrentChange" />
      </div>
    </el-dialog>
    <!-- 新增/编辑模态框 -->
    <el-dialog :close-on-press-escape="false" title="上传图纸" :visible.sync="operationDialog" @close="closeOperationDialog(false)" width="30%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <el-form label-width="80px" :rules="rules" ref="form" :model="formData">
          <el-form-item label="图纸名称" prop="drawingName">
            <el-input size="mini" v-model.trim="formData.drawingName" :maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" rows="3" resize="none" :maxlength="100" v-model="formData.remark"></el-input>
          </el-form-item>
          <el-form-item label="PDF图纸">
            <div>
              <p class="fileT">
                <input accept=".pdf" type="file" ref="file" id="upload" @change="upLoad()" v-if="!formData.drawingUrl" />
                <span v-if="formData.drawingUrl">{{ formData.drawingName }}</span>
                <span class="delPdf" @click="delPDF" v-if="formData.drawingUrl">X</span>
              </p>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" class="el-button-primary" @click="handleSave">保 存</el-button>
        <el-button type="primary" plain @click="closeOperationDialog(false)">取 消</el-button>
      </span>
    </el-dialog>
    <pdfPiev ref="pdfPiev" :urlr="url" :number="number" />
  </div>
</template>

<script>
import SearchBar from "./SearchBar.vue";
import Pagination from "@/components/tablePaging";
import api from "@/api/api";
import COS from "cos-js-sdk-v5";
import pdf from "vue-pdf";
import pdfPiev from "../../../components/pdf-preview/pdf-preview.vue";
export default {
  components: { SearchBar, Pagination, pdfPiev },
  props: {
    EngDraDialog: {
      type: Boolean,
      default: false
    },
    orgType: {
      type: Number
    },
    fkOrgId: ""
  },
  data() {
    return {
      tableData: [],
      formData: {
        drawingName: "",
        drawingPages: "",
        drawingUrl: "",
        remark: ""
      },
      linkList: [],
      checkDialog: false,
      operationDialog: false,
      sendPDFdata: {
        drawingName: "",
        drawingPages: "",
        drawingUrl: "",
        remark: ""
      },
      uploadDate: {},
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      inpData: "",
      searchData: "",
      linkPage: {
        pageNum: 1,
        pageSize: 10
      },
      linkTotal: 0,
      linkPkId: "",
      rules: {
        drawingName: [
          { required: true, message: "请填写图纸名称", trigger: "blur" },
          { min: 2, message: "图纸名称长度为2-25", trigger: "blur" }
        ]
      },
      loading: false,
      url: "",
      number: 1,
      newAddList: [],
      delList: []
    };
  },
  methods: {
    // 获取图纸列表分页展示
    getDrawPageList() {
      api
        .conditionQueryDrawing({
          ...this.page,
          drawingName: this.searchData,
          fkOrgId: this.fkOrgId
        })
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
          } else {
            this.$message.warning(res.msg);
          }
        });
    },
    // 根据id获取图纸信息
    getDrawById(pkId) {
      api.queryDrawing({ pkId }).then(res => {
        if (res.code === 200) {
          this.formData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取图纸关联表
    getLinkDrawList(pkId) {
      api.findProdReItemDrawingById({ ...this.linkPage, pkId }).then(res => {
        if (res.code === 200) {
          this.linkList = res.data.records;
          this.linkTotal = res.data.total - 0;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    //
    delPDF() {
      // this.$refs.file.value = "";
      if (this.formData.linkItemStatus) {
        this.$confirm("是否解除该图纸关联的分项?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.delList.push(this.formData.drawingUrl);
          this.formData.drawingUrl = "";
        });
      } else {
        this.delList.push(this.formData.drawingUrl);
        this.formData.drawingUrl = "";
      }
    },
    //获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
      let bucket = "epms-1307524156";
      let appid = "1256287502";
      let region = "ap-guangzhou";
      let cos = new COS({
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
      let _this = this;
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
            let path = "https://" + data.Location;
            _this.newAddList.push(path);
            _this.formData.drawingUrl = path;
            _this.getNumPages();
          } else {
            _this.loading = false;
            _this.$message.error("上传失败");
          }
        }
      );
    },
    upLoad() {
      let fileObj = document.getElementById("upload").files[0];
      if (fileObj.type != "application/pdf") {
        document.getElementById("upload").value = "";
        return this.$message.warning("只能上传pdf文件");
      }
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      let blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      let filename = fileObj.name;
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
            // this.$message.success(res.msg);
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    //上传腾讯云
    uploadFile(sign, folder, file, filename) {
      let bucket = "epms-1307524156";
      let appid = "1256287502";
      let region = "ap-guangzhou";

      let cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            ExpiredTime: startTime, // 时间戳，单位秒，如：1580000900
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
    },
    //DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },
    //下载
    download(row) {
      let url = row.drawingUrl;
      let name = row.drawingName;
      this.fileLinkToStreamDownload(url, name, "pdf");
    },
    fileLinkToStreamDownload(url, fileName, type) {
      let xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.setRequestHeader("Content-Type", `application/${type}`);
      xhr.responseType = "blob";
      xhr.onload = function() {
        if (this.status == 200) {
          //接受二进制文件流
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
    },
    //获取PDF总页数
    getNumPages() {
      let loadingTask = pdf.createLoadingTask(this.formData.drawingUrl);
      loadingTask.promise
        .then(pdf => {
          this.formData.drawingPages = pdf.numPages;
          this.$message.success("上传成功");
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          this.formData.drawingUrl = "";
          this.$message.warning("文件错误，请重新上传");
          console.error("pdf 加载失败", err);
        });
    },
    //   关闭模态框
    handleClose() {
      this.$emit("update:EngDraDialog", false);
      this.tableData = [];
      this.inpData = "";
      this.searchData = "";
      this.page = {
        pageNum: 1,
        pageSize: 10
      };
    },
    // 打开查看模态框
    openCheckDialog(pkId) {
      this.getDrawById(pkId);
      this.getLinkDrawList(pkId);
      this.linkPkId = pkId;
      this.checkDialog = true;
    },
    // 关闭查看模态框
    closeCheckDialog() {
      this.checkDialog = false;
      this.linkPage = {
        pageNum: 1,
        pageSize: 10
      };
      this.formData = {
        drawingName: "",
        drawingPages: "",
        drawingUrl: "",
        remark: ""
      };
      this.linkList = [];
      this.linkPkId = "";
    },
    // 删除按钮
    handleDel(pkId) {
      this.$confirm("确定删除该图纸信息?", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        api.deleteDrawing({ pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.getDrawPageList();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 打开编辑/新增模态框
    handleOpen(pkId) {
      pkId && this.getDrawById(pkId);
      this.operationDialog = true;
    },
    // 点击保存
    async handleSave() {
      await this.$refs.form.validate();
      if (!this.formData.drawingUrl) {
        return this.$message.warning("请上传对应图纸");
      }
      this.loading = true;
      let promise = this.formData.pkId ? api.modifyDrawing : api.addDrawing;
      promise(this.formData)
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.getDrawPageList();
            this.closeOperationDialog(true);
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 关闭编辑/新增模态框
    closeOperationDialog(isDel) {
      this.$refs.form.clearValidate();
      this.formData = {
        drawingName: "",
        drawingPages: "",
        drawingUrl: "",
        remark: ""
      };
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      // this.$refs.file.value = "";
      this.operationDialog = false;
    },
    delFiles() {
      let urls = [];
      if (!this.formData.pkId) {
        urls = this.newAddList.join(",");
      } else {
        urls = [...new Set([...this.delList, ...this.newAddList])].join(",");
      }
      if (!urls.length) {
        return;
      }
      this.newAddList = [];
      this.delList = [];
      this.$api.delFiles({ urls });
    },
    // 搜素按钮
    btnSearch() {
      this.searchData = this.inpData;
      this.getDrawPageList();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getDrawPageList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getDrawPageList();
    },
    // 查看模态框pageSize改变
    handleLinkSizeChange(val) {
      this.linkPage.pageSize = val;
      this.getLinkDrawList(this.linkPkId);
    },
    // 查看模态框current改变
    handleLinkCurrentChange(val) {
      this.linkPage.pageNum = val;
      this.getLinkDrawList(this.linkPkId);
    },
    openPdf(row) {
      this.url = row.drawingUrl;
      this.number = 1;
      this.$refs.pdfPiev.pdfShow = true;
    },
    openPdf2(row) {
      this.url = this.formData.drawingUrl;
      this.number = row.beginPage;
      this.$refs.pdfPiev.pdfShow = true;
    }
  },
  watch: {
    EngDraDialog(val) {
      if (val) {
        this.page = {
          pageNum: 1,
          pageSize: 10
        };
        this.getDrawPageList();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.delPdf {
  cursor: pointer;
  color: red;
}

.drawtable {
  height: 500px;
}

.h-400 {
  height: 400px;
}
</style>
