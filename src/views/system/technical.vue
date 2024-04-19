<template>
  <div class="app-container">
    <search-bar  @search="search" :options="searchOptions" :total="totalCount" labelWidth="8em"
      ref="searchBar" @change="change" :showHandler="false"></search-bar>
    <el-button type="primary" size="mini" class="search-mr el-button-primary" @click="addUnit"
      v-has="'system:technical:add'">上传技术规范</el-button>
    <div class="tab-container">
      <div class="table-data" style="height:  82%;margin-top: 10px;">
        <el-table ref="tables" height="98%" :data="tableData" stripe style="width: 100%" v-loading="loading" :tooltip-effect="'light'"
          :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="enginerringTypeName" label="工程大类" min-width="120"></el-table-column>
          <el-table-column align="center" prop="professionalTypeName" label="专业类别" min-width="120"></el-table-column>
          <el-table-column align="center" prop="bookName" label="技术规范" min-width="180"></el-table-column>
          <el-table-column align="center" prop="bookPages" label="页数" min-width="60"></el-table-column>
          <el-table-column align="center" prop="remark" label="备注" min-width="180" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="alarmLevel" label="操作" fixed="right" min-width="320">
            <template slot-scope="scope">
              <el-button size="mini" plain v-has="'system:technical:query'" type="primary"
                @click.native="preview(scope.row)">预览</el-button>
              <el-button size="mini" type="success" plain v-has="'system:technical:edit'" @click.native="edit(scope.row)">编辑</el-button>
              <el-button type="success" plain size="mini" v-has="'system:technical:download'"
                @click.native="download(scope.row)">下载</el-button>
              <el-button type="danger" plain size="mini" v-has="'system:technical:delete'"
                @click.native="remove(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount"
        @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
    </div>
    <el-dialog :title="addTitle" width="500px" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false" @close="close1"
      :close-on-press-escape="false" v-loading="loading">
      <el-form :model="form" ref="form" :rules="rules" class="dialog-form">
        <el-form-item size="mini" label="工程大类" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
          <el-select style="width: 100%" placeholder="请选择" v-model="form.fkEnginerringTypeId"
            @change="fkEnginerringChange">
            <el-option v-for="item in projectType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业类别" prop="fkProfessionalTypeId" :label-width="formLabelWidth">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkProfessionalTypeId">
            <el-option v-for="item in professionalType" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="技术规范" prop="bookName" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.bookName" autocomplete="off" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.remark" type="textarea" style="resize: none" :rows="3" maxlength="100"
            placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="pdf文件" prop="bookUrl" :label-width="formLabelWidth">
          <div>
            <p class="fileT" ref="dsafds" @click="empty" v-show="form.bookUrl == null || form.bookUrl == ''">
              <input accept=".pdf" type="file" ref="file" id="upload" @change="upLoad" />
            </p>
            <p v-show="form.bookUrl != '' && form.bookUrl != null">
              <span>{{ pdfhuix }}</span>
              <span><i class="el-icon-close" style="color: red" @click="empty"></i></span>
            </p>
            <el-input v-model="form.bookUrl" autocomplete="off" v-show="false"></el-input>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="close1">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="submit('form')">保  存</el-button>
      </div>
    </el-dialog>
    <pdfPiev ref="pdfPiev" :urlr="url" />
  </div>
</template>
<!-- window.open(url, '_blank').location; -->
<script>
import COS from "cos-js-sdk-v5";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import pdf from "vue-pdf-signature";
export default {
  name: "technical",
  components: {
    // ImgUpload,
    pdf,
    pdfPiev
  },
  data() {
    return {
      img: "",
      totalCount: 0,
      searchOptions: [
        {
          type: "select",
          prop: "fkEnginerringTypeId",
          value: "",
          title: "工程大类",
          options: []
        },
        {
          type: "select",
          prop: "fkProfessionalTypeId",
          value: "",
          title: "专业类别",
          options: []
        },
        {
          type: "input",
          prop: "bookName",
          value: "",
          title: "技术规范",
          placeholder: "技术规范",
          maxlength:"50"
        }
      ],
      //搜索请求参数
      listQuery: {
        bookType: 0,
        pageNum: 1,
        pageSize: 10,
        bookName: "",
        fkEnginerringTypeId: ""
      },
      tableData: [],
      maxHeight: 0,
      show1: false,
      formLabelWidth: "80px",
      form: {
        bookName: "", //书名
        fkEnginerringTypeId: null, //工程类型
        fkProfessionalTypeId: "",
        remark: "", //备注
        bookUrl: null, //资料地址
        bookPages: null //pdf页数
      },
      addTitle: "技术规范",
      rules: {
        fkEnginerringTypeId: [
          {
            required: true,
            message: "工程大类不能为空",
            trigger: ["change", "blur"]
          }
        ],
        fkProfessionalTypeId: [
          {
            required: true,
            message: "专业类别不能为空",
            trigger: ["change", "blur"]
          }
        ],
        bookName: [
          {
            required: true,
            message: "书名不能为空",
            trigger: ["change", "blur"]
          }
        ],
        bookUrl: [
          {
            required: true,
            message: "请上传pdf文件",
            trigger: ["change", "blur"]
          }
        ]
      },
      showType: null,
      fileList: [],
      projectType: [],
      uploadDate: {},
      fileList: null,
      loading: false,
      // url:"https://epms-1307524156.cos.ap-guangzhou.myqcloud.com/%E8%80%81%E8%99%8E.pdf",
      // numPages: null, // pdf 总页数
      pdfhuix: "",
      professionalType: [],
      url: "http://image.cache.timepack.cn/nodejs.pdf",
      newAddList:[],
      delList:[]
    };
  },

  mounted() {
    this.searchTypeList();
    this.conditionPdf();
  },
  watch:{
    show1(val){
      if(!val){
        this.delFiles()
      }
    }
  },
  methods: {
    close1(){
      this.delList=[]
      this.show1=false
    },
    delFiles(){
      let urls=[]
      if(this.addTitle == "上传技术规范"){
        urls=this.newAddList.join(',')
      }else{
        urls=[...new Set([...this.delList,...this.newAddList])].join(',')
      }
      if(!urls.length){
        return
      }
      this.newAddList=[]
      this.delList=[]
      this.$api.delFiles({urls})
    },
    fkEnginerringChange(val) {
      this.form.fkProfessionalTypeId = "";
      this.projectType.forEach(item => {
        if (item.pkId == val) {
          item.typeSonList.forEach(i => {
            i.label = i.engTypeName;
            i.value = i.pkId;
          });
          this.professionalType = item.typeSonList;
        }
      });
    },
    change(val) {
      if (val.fkEnginerringTypeId != "") {
        let typeIdStatus = false;
        this.projectType.forEach(item => {
          if (val.fkEnginerringTypeId == item.pkId) {
            item.typeSonList.forEach(i => {
              i.label = i.engTypeName;
              i.value = i.pkId;
              if (i.pkId == val.fkProfessionalTypeId) {
                typeIdStatus = true;
              }
            });
            this.searchOptions[1].options = item.typeSonList;
          }
        });
        if (typeIdStatus == false) {
          this.$refs.searchBar.fkProfessionalTypeId();
        }
      } else {
        this.searchOptions[1].options = [];
        this.$refs.searchBar.fkProfessionalTypeId();
      }
    },
    preview(row) {
      this.url = row.bookUrl;
      this.$refs.pdfPiev.pdfShow = true;
    },
    empty() {
      this.delList.push(this.form.bookUrl)
      this.form.bookUrl = null;
      this.$refs.file.value = "";
    },
    upLoadsa() {
      this.$refs.file.upLoad();
    },
    //获取PDF总页数
    getNumPages() {
      let loadingTask = pdf.createLoadingTask(this.form.bookUrl);
      loadingTask.promise
        .then(pdf => {
          this.form.bookPages = pdf.numPages;
          this.loading = false;
          this.$message({
            type: "success",
            message: "上传成功"
          });
        })
        .catch(err => {
          this.loading = false;
          this.$message.warning("pdf 加载失败", err);
        });
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.projectType.forEach(items => {
            if (items.pkId == this.form.fkEnginerringTypeId) {
              this.form.enginerringTypeName = items.engTypeName;
              this.form.bookType = 0;
            }
          });
          this.loading = true;
          if (this.showType == 1) {
            this.$api.addPdf(this.form).then(res => {
              if (res.code == 200) {
                this.loading = false;
                 this.newAddList=[]
                this.$message({
                  type: "success",
                  message: "新增成功"
                });
                this.show1 = false;
                this.conditionPdf();
                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message({
                  type: "error",
                  message: res.msg
                });
              }
            });
          } else {
            let data = {
              bookType: 0,
              pkId: this.form.pkId,
              bookName: this.form.bookName,
              bookPages: this.form.bookPages,
              bookUrl: this.form.bookUrl,
              enginerringTypeName: this.form.enginerringTypeName,
              fkEnginerringTypeId: this.form.fkEnginerringTypeId,
              fkProfessionalTypeId: this.form.fkProfessionalTypeId,
              remark: this.form.remark
            };
            this.$api.modifyPdf(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                 this.newAddList=[]
                this.$message({
                  type: "success",
                  message: "编辑成功"
                });
                this.show1 = false;
                this.conditionPdf();
                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message({
                  type: "error",
                  message: res.msg
                });
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    //查询
    search(form) {
      this.listQuery.bookName = form.bookName;
      this.listQuery.fkEnginerringTypeId = form.fkEnginerringTypeId;
      this.listQuery.fkProfessionalTypeId = form.fkProfessionalTypeId;
      this.listQuery.pageNum = 1;
      this.conditionPdf();
    },
    //表格数据
    conditionPdf() {
      this.loading = true;
      this.$api.conditionPdf(this.listQuery).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.totalCount = parseInt(res.data.total);
          this.loading = false;
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    //获取工程类型数据
    searchTypeList() {
      this.$api.searchTypeList().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
          });
          this.searchOptions[0].options = res.data;
          this.projectType = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    //获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
      let bucket = "epms-1307524156";
      let appid = "1256287502";
      let region = "ap-guangzhou";
      let cos = new COS({
        // 必选参数
        getAuthorization: function (options, callback) {
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
          onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
          }
        },
        function (err, data) {
          if (data.statusCode == 200) {
            let path = "https://" + data.Location;
            _this.newAddList.push(path)
            _this.form.bookUrl = path;
            _this.pdfhuix = filename;
            _this.getNumPages();
          } else {
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
      this.pdfhuix = "";
      let fileObj = document.getElementById("upload").files[0];
      let blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      let filename = fileObj.name;
      if(fileObj.size<=0){
        return this.$message.warning("文件大小不能为0kb");
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
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
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
        getAuthorization: function (options, callback) {
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

    //DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },

    //查询
    // search(form) {},
    //页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.listQuery.pageNum = 1;
      this.conditionPdf();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    //页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.conditionPdf();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },

    //编辑
    edit(row) {
      this.projectType.forEach(item => {
        if (item.pkId == row.fkEnginerringTypeId) {
          item.typeSonList.forEach(i => {
            i.label = i.engTypeName;
            i.value = i.pkId;
          });
          this.professionalType = item.typeSonList;
        }
      });
      this.pdfhuix = row.bookName + ".pdf";
      let rowDate = JSON.stringify(row);
      this.show1 = true;
      this.showType = 2;
      this.addTitle = "编辑技术规范";
      this.form = JSON.parse(rowDate);
    },

    //下载
    download(row) {
      // window.open(row.bookUrl);
      // window.location.href = row.bookUrl
      let url = row.bookUrl;
      let name = row.bookName;
      this.fileLinkToStreamDownload(url, name, "pdf");
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
        xhr.onload = function () {
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
      }
    },
    //删除
    remove(row) {
      const _this = this;
      _this
        .$confirm("确定删除该技术规范及内容？", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.deletePdf({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.conditionPdf();
              this.$message({
                type: "success",
                message: "删除成功"
              });
            } else {
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => { });
    },
    //新增
    addUnit() {
      this.pdfhuix = "";
      if (this.$refs.file != undefined) {
        this.$refs.file.value = "";
      }
      this.professionalType = [];
      this.show1 = true;
      this.showType = 1;
      this.addTitle = "上传技术规范";
      this.form = {
        bookName: null, //书名
        fkEnginerringTypeId: null, //工程类型
        fkProfessionalTypeId: "",
        remark: null, //备注
        bookUrl: null, //资料地址
        bookPages: null //pdf页数
      };
      if (this.$refs.form != undefined) {
        this.$refs.form.resetFields();
      }
    },
    submitUpload() {
      this.$refs.upload.submit();
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    }
  }
};
</script>

<style lang="scss" scoped>

.el-icon-close:hover {
  cursor: pointer;
}

.search-mr {
  position: absolute;
  top: 86px;
  right: 42px;
  z-index: 2;
}
/deep/ .el-table__body-wrapper{
  background-color: #fff;
}
</style>
