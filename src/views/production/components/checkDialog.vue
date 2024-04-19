<template>
  <div>
    <el-dialog title="试验检测" :visible="checkDialog" center width="70%" @close="closeCheckDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="checkDialog">
        <div class="header-seach">
          <el-form :inline="true" class="myform" label-width="72px">
            <el-form-item label="检测日期">
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.beginTime"></el-date-picker>
              <span>起 至</span>
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker>
              <span>止</span>
            </el-form-item>
            <el-form-item label="检验状态">
              <el-select v-model="inpData.detectionCode" size="mini" class="wh-100">
                <el-option value="" label="全部"></el-option>
                <el-option v-for="item in checkTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="检测物料">
              <!-- <el-select v-model="inpData.materialIds" size="mini" class="wh-100">
                <el-option value="" label="全部"></el-option> -->
              <!-- <el-option v-for="item in checkTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option> -->
              <!-- </el-select> -->
              <el-cascader :options="options" clearable size="mini" v-model="inpData.materialIds" :props="setProps" class="wh-100" filterable :show-all-levels="false"></el-cascader>
            </el-form-item>
            <el-form-item label="关联入库单号" label-width="100px">
              <el-input size="mini" v-model="inpData.orderCode" class="wh-140"></el-input>
            </el-form-item>
            <el-button size="mini" type="primary" class="search el-button-primary" @click="btnSearch">搜索</el-button>
          </el-form>
        </div>
        <div class="tables">
          <el-table :tooltip-effect="'light'" :data="tableData" style="width: 100%" border height="100%">
            <el-table-column align="center" label="序号" type="index" width="80">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="关联入库单" align="center" prop="orderCode"> </el-table-column>
            <el-table-column label="待检测物料名称" align="center" prop="materialName"> </el-table-column>
            <el-table-column label="检测状态" align="center" prop="detectionCode" show-overflow-tooltip> </el-table-column>
            <el-table-column label="检测人" align="center" prop="inspectorName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="检测时间" align="center" prop="serviceTime" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作" align="center" prop="" width="150">
              <template slot-scope="{ row }">
                <el-button size="mini" v-if="row.isQuery == '1'" @click="detection(row, 2)">查看</el-button>
                <el-button type="primary"  v-if="row.isCheck == '1'" size="mini" @click="detection(row, 1)">检测</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="checkDialog"></tablePaging>
      </div>
    </el-dialog>
    <el-dialog center :title="checkMaterDialogTitle" :visible="checkMaterDialog" @close="closeCheckMaterDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading2" :close-on-press-escape="false">
      <div class="tabs" v-if="checkMaterDialogType === 2">
        <div class="tabs-item" :class="{ nobd: index !== dateList.length - 1, clicknow: index === tab }" v-for="(item, index) in dateList" :key="index" @click="tabsClick(index, item)">
          {{ item.ageTerm }}
          <i class="icons" :class="{ 'el-icon-check': true, 'el-icon-close': false }"></i>
        </div>
      </div>
      <el-form label-width="80px" :model="checkForm">
        <el-row :span="24" class="el-row-data">
          <el-col :span="8">
            <el-form-item label="检测编号">
              <el-input v-model="checkForm.orderCode" size="mini" :disabled="checkMaterDialogType === 2"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="入库单号">
              <el-input v-model="checkForm.publicClassForm" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="materialList[0].typeCode == 'materials_beton'?'龄期':'检测类型'">
              <el-input v-model="checkForm.ageTerm" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检测人">
              <el-input v-model="checkForm.inspectorName" size="mini" :disabled="checkMaterDialogType === 2"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="检测时间">
              <el-date-picker size="mini" type="datetime" :disabled="checkMaterDialogType === 2" :picker-options="pickerOptions"  
              style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="checkForm.serviceTime"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="checkMaterDialogType === 1 || (checkMaterDialogType === 2 && fileList.length)">
            <el-form-item label="附件">
              <input type="file" ref="files" id="upload" @change="upLoad" v-if="fileList.length < 10 && checkMaterDialogType === 1" />
              <div class="fileList" v-if="fileList.length">
                <div class="fileList-item" v-for="(item, index) in fileList" :key="index">
                  <div class="fileName" :title="item.fileName">{{ item.fileName }}</div>
                  <span class="delBtn" @click="delFile(index)" v-if="checkMaterDialogType === 1">X</span>
                  <el-button size="mini" @click="download(item)" type="success" plain>下载</el-button>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="检测报告">
              <el-input v-model="checkForm.reports" type="textarea" :rows="4" resize="none" size="mini" :disabled="checkMaterDialogType === 2"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <h3 class="tac">检测物料信息</h3>
      <div class="h-200">
        <el-table :tooltip-effect="'light'" :data="materialList" style="width: 100%" height="100%" border>
          <el-table-column align="center" label="序号" type="index" width="60"> </el-table-column>
          <el-table-column align="center" label="物料名称" prop="materialName"> </el-table-column>
          <el-table-column align="center" label="物料类型" :prop="checkMaterDialogType === 2 ? 'materialTypeName' : 'fkTypeName'" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" label="检测结果" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <el-select v-model="row.detectionCode" style="width:100%" size="mini" :disabled="checkMaterDialogType === 2">
                <el-option value="1" label="合格"></el-option>
                <el-option value="2" label="不合格"></el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" @click="checkMaterDialogOk" v-if="checkMaterDialogType === 1">保存</el-button>
        <el-button @click="closeCheckMaterDialog">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5";
import moment from "moment";
export default {
  props: {
    checkDialog: {
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
      loading: false,
      loading2: false,
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      tableData: [{}],
      inpData: {
        detectionCode:""
      },
      searchData: {},
      checkMaterDialogTitle: "",
      checkMaterDialog: false,
      checkMaterDialogType: 1,
      checkForm: {
        orderCode: "", //检测单号
        publicClassForm: "", //入库单号
        ageTerm: "", //龄期
        inspectorName: "", //检测人
        serviceTime: "", //检测时间
        reports: "", //检测报告
        // detectionCode: "",
        // fileName: "",
        // fileUrl: "",
        fkInventoryId: 0,
        inspectorName: ""
      },
      fileList: [],
      // pickerOptions: {
      //   shortcuts: [
      //     {
      //       text: "今天",
      //       onClick(picker) {
      //         picker.$emit("pick", new Date());
      //       }
      //     },
      //     {
      //       text: "昨天",
      //       onClick(picker) {
      //         const date = new Date();
      //         date.setTime(date.getTime() - 3600 * 1000 * 24);
      //         picker.$emit("pick", date);
      //       }
      //     },
      //     {
      //       text: "一周前",
      //       onClick(picker) {
      //         const date = new Date();
      //         date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
      //         picker.$emit("pick", date);
      //       }
      //     }
      //   ]
      // },
      materialList: [{}],
      dateList: [],
      tab: 0,
      checkTypeList: [
        { label: "待检测", value: "0" },
        { label: "检测中", value: "1" },
        { label: "检测合格", value: "2" },
        { label: "检测不合格", value: "3" }
      ],
      allowModify: "",
      limitNum: "",
      options: [],
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList"
        // checkStrictly: true
      },
      pickerOptions: {
        // 时间不能大于当前时间
        disabledDate: time => {
          return time.getTime() > Date.now()
        },
        selectableRange: '00:00:00 - 23:59:59'
      }
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  watch: {
    checkDialog(val) {
      if (val) {
        // this.$store.dispatch("getDictionariesData", 21).then(res => {
        //   this.checkTypeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        // });
        this.testCheckSearchPage();
        this.searchMaterialByInput();
      }
    }
  },
  methods: {
    closeCheckDialog() {
      this.$emit("update:checkDialog", false);
      this.cleanSearchData();
      this.tab = 0;
    },
    // 获取业务单号
    getBusinessCode(businessType) {
      this.$api.getBusinessCode({ businessType }).then(res => {
        console.log("业务单号", res);
        if (res.code === 200) {
          if (businessType === 10) {
            this.allowModify = res.data.allowModify;
            this.limitNum = res.data.limitNum;
            this.checkForm.orderCode = res.data.typeCode;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchMaterialByInput() {
      this.$api.searchMaterialByInput().then(res => {
        if (res.code == 200) {
          this.options = res.data;
        } else {
          this.options = [];
          this.$message.warning(res.msg);
        }
      });
    },
    tabsClick(index, item) {
      this.tab = index;
      this.checkForm.orderCode = item.orderCode;
      this.checkForm.ageTerm = item.ageTerm;
      this.checkForm.inspectorName = item.inspectorName;
      this.checkForm.serviceTime = item.serviceTime;
      this.checkForm.reports = item.reports;
      this.materialList = item.detectionDetails;
    },
    // 检测
    detection(row, type) {
      this.checkMaterDialogType = type;
      this.checkForm.ageTerm = row.ageTerm;
      this.checkForm.publicClassForm = row.orderCode;
      if (type === 1) {
        this.checkMaterDialogTitle = "检测";
        this.getBusinessCode(10);
        this.checkForm.fkInventoryId = row.pkId;
        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        this.checkForm.serviceTime = time;
        this.checkMaterDialog = true;
        this.findInputById(row.pkId);
      } else {
        this.checkMaterDialogTitle = "检测信息";
        this.checkMaterDialog = true;
        this.testCheckEdit(row.pkId);
      }
    },
    // 根据ID查询检测物料信息
    findInputById(id) {
      this.$api.findInputById({ pkId: id }).then(res => {
        if (res.code == 200) {
          this.materialList = res.data.detailsVoList;
          // if(this.){

          // }
        }
      });
    },
    // 查看详情接口
    testCheckEdit(id) {
      this.$api.testCheckEdit({ inputId: id }).then(res => {
        if (res.code == 200) {
          this.dateList = [];
          this.tab = 0;
          // res.data.forEach(item => {
          //   this.dateList.push(item.ageTerm);
          // });
          this.dateList = res.data;
          this.checkForm.orderCode = res.data[0].orderCode;
          this.checkForm.ageTerm = res.data[0].ageTerm;
          this.checkForm.inspectorName = res.data[0].inspectorName;
          this.checkForm.serviceTime = res.data[0].serviceTime;
          this.checkForm.reports = res.data[0].reports;
          this.materialList = res.data[0].detectionDetails;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 检测弹框确认
    checkMaterDialogOk() {
      let fileName = this.fileList.map(item => item.fileName).join(",");
      let fileUrl = this.fileList.map(item => item.fileUrl).join(",");
      let data = { ...this.checkForm, fileName, fileUrl };

      data.allowModify = this.allowModify;
      data.limitNum = this.limitNum;
      this.loading2 = true;
      data.detectionDetails = [];
      this.materialList.forEach(item => {
        data.detectionDetails.push({ detectionCode: item.detectionCode, fkDetailsId: item.pkId });
      });
      data.enclosures = [{ enclosureName: data.fileName, enclosureUrl: data.fileUrl }];
      delete data.fileName;
      delete data.fileUrl;
      this.$api
        .testCheckAdd(data)
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.$message.success("保存成功");
            // this.closeCheckDialog();
            this.testCheckSearchPage();
            this.checkMaterDialog = false
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    closeCheckMaterDialog() {
      this.checkMaterDialog = false;
      this.checkForm = { detectionCode: "", fileName: "", fileUrl: "", fkInventoryId: 0, inspectorName: "", orderCode: "", reports: "", serviceTime: "" };
      this.fileList = [];
    },
    delFile(index) {
      this.fileList.splice(index, 1);
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.testCheckSearchPage();
    },
    testCheckSearchPage() {
      let data = { ...this.searchData };
      data.pageNum = this.page.pageNum;
      data.pageSize = this.page.pageSize;
      if (data.materialIds instanceof Array) {
        data.materialIds = data.materialIds[data.materialIds.length - 1] + "";
      }
      this.$api.testCheckSearchPage(data).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
        }
      });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.testCheckSearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.testCheckSearchPage();
    },
    // 清空搜索栏
    cleanSearchData() {
      this.inpData = {};
      this.searchData = {};
      this.page = { pageSize: 10, pageNum: 1 };
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
            _this.fileList.push({ fileName: _this.$refs.files.files[0].name, fileUrl: path });
            _this.loading2 = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.files.value = "";
          } else {
            _this.loading2 = false;
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
      if(fileObj.size<=0){
        return this.$message.warning("文件大小不能为0kb");
      }
      if (fileObj.size > 5242880) {
        this.$refs.files.value = "";
        return this.$message.warning("文件大小不能超过5M");
      }
      let sign = "";
      let path = "";
      this.loading2 = true;
      this.$api
        .getUploadFileToken()
        .then(res => {
          if (res.code == 200) {
            sign = res.data.token;
            path = res.data.endpoint;
            this.uploadDate = res.data;
            this.$options.methods.upLoads.bind(this)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime);
          } else {
            this.loading2 = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          console.error(err);
          this.loading2 = false;
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
    },
    // 下载
    download(item) {
      let exit = item.path.substring(item.fileUrl.lastIndexOf(".") + 1);
      this.fileLinkToStreamDownload(item.fileUrl, item.fileName, exit);
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
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f3f3f3;
  padding: 0 20px;
  margin-bottom: 5px;
  .myform {
    align-items: center;
    margin-top: 20px;
  }
  .search-right {
    display: flex;
    align-items: center;
    .el-radio-group {
      display: flex;
    }
  }
}
.search {
  margin-left: 6px;
  margin-top: 6px;
}
.tables {
  height: 500px;
}
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.fileList {
  display: flex;
  flex-wrap: wrap;
  .fileList-item {
    display: flex;
    align-items: center;
    width: 50%;
    .fileName {
      width: 300px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .delBtn {
      cursor: pointer;
      color: red;
      margin-right: 10px;
    }
  }
}
.dialog-form {
  display: flex;
  align-items: center;
  .dialog-form-item {
    position: relative;
    display: flex;
    .labels {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 80px;
    }
    .content {
      flex: 1;
    }
    .w-90 {
      width: 90px;
    }
    .w-100 {
      width: 100px;
    }
    .w-110 {
      width: 110px;
    }
  }
}
.h-200 {
  height: 200px;
}
.tac {
  text-align: center;
}
.tabs {
  display: flex;
  width: 100%;
  height: 40px;
  border-bottom: 1px solid #c0c4cc;
  overflow: hidden;
  .tabs-item {
    position: relative;
    min-width: 80px;
    padding: 0 10px;
    height: 100%;
    line-height: 40px;
    text-align: center;
    cursor: pointer;
    border: 1px solid #c0c4cc;
    border-bottom: none;
    .icons {
      position: absolute;
      right: 3px;
      bottom: 2px;
      font-weight: 700;
    }
    .el-icon-check {
      color: green;
    }
    .el-icon-close {
      color: red;
    }
  }
  .nobd {
    border-right: none;
  }
  .clicknow {
    background-color: #409eff;
    color: #fff;
    transition: 0.3s;
  }
}
</style>
