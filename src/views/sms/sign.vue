<!-- 短信签名 -->
<template>
  <div class="app-container">
    <div class="header-seach search-bar-box" style="position: relative;">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="状态" label-width="40px">
          <el-select v-model="inpData.enableStatus" size="mini" class="wh-140">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in typeOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="短信签名">
          <el-input size="mini" v-model="inpData.signName" maxlength="25"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" icon="el-icon-search" class="ml-20 search el-button-primary"
          @click="btnSearch">查询</el-button>
        <el-button v-has="'sms:sign:add'" style="position: absolute;top: 30px;right: 40px;" size="mini"
          class="add el-button-primary" type="primary" @click="add">新增</el-button>
      </el-form>
    </div>
    <div class="table-data" style="height:88%;margin-top: 10px;">
      <el-table stripe height="90%" ref="tables" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
        <el-table-column label="序号" align="center" width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="短信签名" align="center" prop="signName"> </el-table-column>
        <el-table-column label="用途" align="center" prop="reason"></el-table-column>
        <el-table-column label="申请人" align="center" prop="createUser"></el-table-column>
        <el-table-column label="申请时间" align="center" prop="createTime"></el-table-column>
        <el-table-column label="状态" align="center" prop="enableStatusName"></el-table-column>
        <el-table-column label="审批结果" align="center" prop="remark"> </el-table-column>
        <el-table-column label="是否默认" align="center" prop="isDefault">
          <template slot-scope="{ row }">
            <span v-if="row.enableStatus == 2">{{ row.isDefault == 1 ? '是' : '否' }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" prop="smsStatus" width="220">
          <template slot-scope="{ row }">
            <el-button type="primary" plain v-has="'sms:sign:query'" size="mini"
              @click="viewEdit(row.pkId, 0)">查看</el-button>
            <el-button plain v-if="row.enableStatus == 0" type="primary" size="mini" v-has="'sms:sign:edit'"
              @click="viewEdit(row.pkId, 1)">编辑</el-button>
            <el-button plain v-if="row.isDefault == 0 && row.enableStatus == 2" v-has="'sms:sign:setDefault'"
              type="success" size="mini" @click="setDefault(row)">设为默认</el-button>
            <el-button plain v-if="row.enableStatus == 1" type="warning" v-has="'sms:sign:recall'" size="mini"
              @click="revocation(row)">撤回</el-button>
            <el-button plain v-if="row.enableStatus == 0" v-has="'sms:sign:delete'" type="danger" @click="delBtn(row)"
              size="mini">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum"
        @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    </div>
    <el-dialog :title="addTitle" width="500px" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false"
      @close="cancel" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="form" ref="form" :rules="rules" class="dialog-form">
        <el-form-item label="" prop="signName" :label-width="formLabelWidth" v-if="form.enableStatus == 3">
          <div class="failure">审核结果：{{ form.remark }}</div>
        </el-form-item>
        <el-form-item label="短信签名" prop="signName" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.signName" autocomplete="off" maxlength="10" :disabled="showType == 0"></el-input>
        </el-form-item>
        <el-form-item label="用 途" prop="reason" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.reason" type="textarea" style="resize: none" :disabled="showType == 0"
            :rows="3" maxlength="250" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="附件" prop="bookUrl" :label-width="formLabelWidth">
          <div style="cursor: pointer;">
            <p class="fileT" ref="dsafds" @click="empty" v-show="(bookUrl == '' || bookUrl == null) && showType != 0">
              <input accept=".jpeg,.jpg,.png" type="file" ref="file" id="upload" @change="upLoad" />
            </p>
            <p v-show="bookUrl != '' && bookUrl != null">
              <span @click.stop="clcikImg" style="color:blue">{{ accessoryName }}</span>
              <span><i class="el-icon-close" style="color: red" @click="empty" v-if="showType != 0"></i></span>
            </p>
            <el-input v-model="bookUrl" autocomplete="off" v-show="false"></el-input>
          </div>
          <div class="failure" v-if="showType != 0">
            请提供与该签名有关的证明，如：品牌证书、企业营业执照或其它证明
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="showType != 0">
        <el-button size="mini" type="primary" class="el-button-primary" @click="submit('form', 0)">保存草稿</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="submit('form', 1)">提交审核</el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <pdfPiev ref="pdfPiev" :urlr="bookUrl" />
    <el-dialog custom-class="imgDialog" :visible.sync="dialogVisibleImg" width="30%" :before-close="handleClose">
      <img v-if="bookUrl" style="width: 100%;" :src="bookUrl" alt="">
    </el-dialog>
  </div>
</template>
<script>
import pdfPiev from "@/components/pdf-preview/pdf-preview"
import COS from "cos-js-sdk-v5";
export default {
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  components: {
    pdfPiev
  },
  data() {
    return {
      dialogVisibleImg: false,
      loading: false,
      typeOptions: [
        { label: "草稿", value: 0 },
        { label: "审批中", value: 1 },
        { label: "审批通过", value: 2 },
        { label: "审批不通过", value: 3 },
      ],
      tableData: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      inpData: {
        enableStatus: "",
        signName: "",
      },
      addTitle: "",
      show1: false,
      form: {},
      rules: {
        signName: [
          {
            required: true,
            message: "签名名称不能为空",
            trigger: ["change", "blur"]
          }
        ],
        reason: [
          {
            required: true,
            message: "用途不能为空",
            trigger: ["change", "blur"]
          }
        ],
      },
      formLabelWidth: "80px",
      accessoryName: "",
      bookUrl: "",
      showType: 0,
      newAddList: [],
      delList: [],
    };
  },
  mounted() {

    this.searchNoticPage();
  },
  watch: {
    show1(val) {
      if (!val) {
        this.delFiles()
      }
    }
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },

    clcikImg() {
      let url = this.bookUrl
      // 使用JavaScript的字符串处理方法获取链接的文件名
      const fileName = url.substring(url.lastIndexOf('/') + 1);

      // 使用JavaScript的字符串处理方法获取文件名的后缀名
      const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
      console.log('fileExtension -----> ', fileExtension);
      if (fileExtension==='pdf') {

        this.$refs.pdfPiev.pdfShow = true
      }else{

        this.dialogVisibleImg=true
      }
    },
    cancel() {
      this.delList = []
      this.show1 = false
      this.$refs['form'].resetFields();
    },
    // 删除附件
    delFiles() {
      let urls = []
      if (this.addTitle.indexOf('新增') !== -1) {
        urls = this.newAddList.join(',')
      } else {
        urls = [...new Set([...this.delList, ...this.newAddList])].join(',')
      }
      if (!urls.length) {
        return
      }
      this.newAddList = []
      this.delList = []
      this.$api.delFiles({ urls })
    },
    //
    delBtn(row) {
      this.$confirm("确定删除该短信签名申请？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.smsSignDelete({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.searchNoticPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    setDefault(row) {
      this.$confirm("确定将此签名设为默认短信签名？", "设为默认签名确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.smsSignSetConsent({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("设置成功");
            this.searchNoticPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    revocation(row) {
      this.$confirm("确定撤回该短信签名申请？", "撤回确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.smsSignRecallSign({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("撤回成功");
            this.searchNoticPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    viewEdit(id, type) {
      if (type == 0) {
        this.addTitle = "短信签名信息"
        this.showType = 0
      } else {
        this.addTitle = "编辑短信签名"
        this.showType = 2
      }
      this.show1 = true
      this.smsSignFindById(id)
    },
    smsSignFindById(pkId) {
      this.$api.smsSignFindById({ pkId }).then(res => {
        if (res.code == 200) {
          this.form = res.data
          this.accessoryName = res.data.enclosures[0].enclosureName
          this.bookUrl = res.data.enclosures[0].enclosureUrl
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    submit(formName, type) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let data = { ...this.form, enableStatus: type }
          data.enclosures = [{ enclosureName: this.accessoryName, enclosureUrl: this.bookUrl }]
          this.loading = true;
          if (this.showType == 1) {
            this.$api.smsSignAdd(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.$message.success("操作成功")
                this.newAddList = []
                this.show1 = false;
                this.searchNoticPage();
                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message.warning(res.msg)
              }
            });
          } else {
            delete data.fkOrgId
            delete data.remark
            this.$api.smsSignUpdate(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.$message.success("操作成功")
                this.newAddList = []
                this.show1 = false;
                this.searchNoticPage();
                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message.warning(res.msg)
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    add() {
      this.show1 = true
      this.form = {
        signName: "",
        reason: ""
      }
      if (this.$refs.file != undefined) {
        this.$refs.file.value = "";
      }
      this.addTitle = "新增短信签名"
      this.showType = 1
      this.accessoryName = ""
      this.bookUrl = ""
      this.$nextTick(() => {
        this.$refs['form'].resetFields();
      })
    },
    empty() {
      console.log('this.bookUrl -----> ', this.bookUrl);
      this.delList.push(this.bookUrl)
      this.bookUrl = null;
      this.$refs.file.value = "";
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
            _this.bookUrl = path;
            _this.accessoryName = filename;
            // _this.getNumPages();
            _this.loading = false;
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
      this.accessoryName = "";
      let fileObj = document.getElementById("upload").files[0];
      let blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
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
    // 搜索
    btnSearch() {
      this.page.pageNum = 1;
      this.searchNoticPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageNum = 1;
      this.page.pageSize = val;
      this.searchNoticPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchNoticPage();
    },
    searchNoticPage() {
      let data = {
        ...this.page,
        ...this.inpData
      };
      this.$api.smsSignSearchPage(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          const options = {
            0: "草稿",
            1: "审批中",
            2: "审批通过",
            3: "审批不通过",
          };
          this.tableData.forEach(item => {
            item.enableStatusName = options[item.enableStatus];
          })
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .imgDialog .el-dialog__header {
  padding: 0;
  border: 0px;
}

/deep/ .imgDialog .el-dialog__body {
  height: 3px;
}

.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 0 20px;
  margin-bottom: 5px;
  border-radius: 5px;

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
  margin-top: 6px;
}

.mb-10 {
  margin-bottom: 10px;
}

.mr-20 {
  margin-right: 20px;
}

.succeed {
  color: #67C23A;
}

.failure {
  color: #F56C6C;
}

.dialog-footer {
  text-align: center;
}

.search-bar-box {
  /deep/ .el-form-item__content {
    vertical-align: middle;
  }
}
</style>
