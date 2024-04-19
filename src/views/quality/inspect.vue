<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bgc search-mr">
      <el-form :model="searchData" class="form-data search-bar-box">
        <!-- <el-form-item label="项目" label-width="40px" v-if="user.orgType == 2 || user.orgType == 3 || user.orgType == 9">
          <el-select v-model="searchData.fkProjectId" size="mini" @change="projectIdChange">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="标段项目" label-width="90px" v-if="user.orgType !=5">
          <!-- <el-select v-model="searchData.fkProjectBidId" size="mini" :disabled="projectStatus">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
        <!-- <el-form-item label="上级单位" label-width="90px">
          <el-select v-model="searchData.inspectType" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option label="建设单位(业主方)" value="2"></el-option>
            <el-option label="监理公司" value="3"></el-option>
            <el-option label="施工单位" value="4"></el-option>
            <el-option label="其他" value="5"></el-option>
            <el-option label="设计院" value="6"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item class="writeTime" label="检查时间" label-width="90px" v-if="typeShow">
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.beginTime"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="检查主题" label-width="80px"  v-if="typeShow">
          <el-input v-model="searchData.inspectName" size="mini" class="wh-100" maxlength="50"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary"  v-if="typeShow" class="seek" @click.native="queryData" icon="el-icon-search">查询</el-button>
        <el-button type="primary" size="mini"  v-if="typeShow" class="add-staff" @click.native="addRecord" v-has="'quality:inspect:add'">新增记录</el-button>
      </el-form>
    </div>
    <div class="tab-container table-data"  v-if="typeShow">
      <el-table :data="tableData" v-loading="loading" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="fkProjectName" label="项目" align="center" show-overflow-tooltip v-if="user.orgType == 2 || user.orgType == 3 || user.orgType == 3"> </el-table-column>
        <el-table-column prop="fkBidProjectName" label="标段项目" align="center" show-overflow-tooltip v-if="user.orgType == 2 || user.orgType == 3 || user.orgType == 9 || user.orgType == 4"> </el-table-column>
        <el-table-column prop="inspectName" label="检查主题" align="center"> </el-table-column>
        <el-table-column label="检查单位" align="center" prop="inspectUnitName" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="inspectTime" label="检查时间" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="companyName" label="参加单位" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="participantName" label="参加人员" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="userName" label="录入人员" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="createTime" label="录入时间" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="400">
          <template slot-scope="{ row }">
            <el-button plain size="mini" type="primary" @click.native="lookOver(row)" v-has="'quality:inspect:query'">查看</el-button>
            <el-button plain size="mini" type="success" v-has="'quality:inspect:update'" @click.native="editRecord(row)" v-if="row.editStatus">编辑</el-button>
            <el-button plain size="mini" @click.native="handleDownload(row.enclosures)" v-if="row.enclosures.length" v-has="'quality:inspect:download'">下载</el-button>
            <el-button plain size="mini" type="danger" v-has="'quality:inspect:delete'" @click.native="deleteRecord(row.pkId)" v-if="row.deleteStatus">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 分页 -->
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    <!-- 弹窗 -->
    <el-dialog :close-on-press-escape="false" :title="title"  :visible.sync="popup" v-dialogDrag :close-on-click-modal="false" v-loading="loading" @close="close(false)">
      <div class="dialog-form">
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item label="检查单位" prop="inspectUnitName" label-width="110px">
            <!-- <el-select size="mini" @change="inspectTypeChange" v-model="form.inspectType" :disabled="disabledStatus" placeholder="请选择上级单位" class="wh">
              <el-option label="设计院" value="6"></el-option>
              <el-option label="监理单位" value="3"></el-option>
              <el-option label="施工单位" value="4"></el-option>
              <el-option label="建设单位" value="2"></el-option>
              <el-option label="其他" value="5"></el-option>
            </el-select> -->
            <el-input size="mini" v-model="form.inspectUnitName" :disabled="disabledStatus" maxlength="250"></el-input>
          </el-form-item>
          <el-form-item label="参加单位" prop="companyName" label-width="110px">
            <el-input size="mini" v-model="form.companyName" :disabled="disabledStatus" maxlength="250"></el-input>
          </el-form-item>
          <el-form-item label="参加人员" prop="participantName" label-width="110px">
            <el-input size="mini" v-model="form.participantName" :disabled="disabledStatus" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="检查主题" prop="inspectName" label-width="110px">
            <el-input size="mini" v-model="form.inspectName" :disabled="disabledStatus" placeholder="请输入检查主题" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item  label="检查时间" prop="inspectTime" label-width="110px">
            <el-date-picker size="mini" placeholder="请选择检查时间" :disabled="disabledStatus" value-format="yyyy-MM-dd" v-model="form.inspectTime" class="wh"></el-date-picker>
          </el-form-item>
          <el-form-item label="检查内容" label-width="110px" prop="content">
            <el-input type="textarea" :autosize="{ minRows: 8, maxRows: 8 }" placeholder="请输入内容" :disabled="disabledStatus" v-model="form.content" maxlength="500"> </el-input>
          </el-form-item>
          <el-form-item label="附件" label-width="110px" prop="enclosures">
            <div>
              <el-button size="small" v-if="!disabledStatus && form.enclosures.length != 10" type="primary" @click.native="uploading" :disabled="disabledStatus">点击上传</el-button>
              <div class="upLoad-show" >
                <p v-for="(item, index) in form.enclosures" :key="index">
                  <span class="succer" @click="preview(item)">{{ item.enclosureName }}</span>
                  <span v-if="!disabledStatus">
                    <el-button size="mini" style="color: red;border: none;" icon="el-icon-close" @click.native="remove(item, index)"></el-button>
                  </span>
                </p>
              </div>
              <div v-if="form.enclosures.length == 0 && disabledStatus">无附件</div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" v-if="!disabledStatus">
        <!-- @close="close -->
        <el-button type="primary" plain @click.native="popup = false">取 消</el-button>
        <el-button type="primary" @click.native="submit('form')">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 预览pdf弹框 -->
    <pdfPiev ref="pdfPiev" :urlr="url" :number="number" />
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.enclosureUrl" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj.enclosureUrl" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <input v-show="false" type="file" accept="" ref="files" id="upload" @change="upLoad" />
  </div>
</template>

<script>
import pageInation from "../../components/tablePaging";
import COS from "cos-js-sdk-v5";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
export default {
  name: "inspect",
  data() {
    return {
      // 搜索数据
      searchData: {
        hierarchyType: "1",
        projectName: "",

        inspectType: "",
        beginTime: "",
        endTime: "",
        inspectName: "",
        fkProjectId: "",
        fkProjectBidId: ""
      },
      options: [],
      subcontractorData: [], // 分项工程名称
      noProjectData: [], // 标段项目
      // 表格列表
      tableData: [],
      popup: false,
      disabledStatus: false,
      // 分页数据
      pageNum: 1,
      pageSize: 10,
      total: 20,
      loading: false,
      // 新增编辑弹框对象数据
      form: {
        inspectType: "",
        companyName: "",
        inspectName: "",
        inspectTime: "",
        content: "",
        hierarchyType: "1",
        enclosures: [],
        inspectUnitName:"",
        participantName:""
      },
      title: "",
      rules: {
        inspectUnitName: [
          {
            required: true,
            message: "请输入检查单位",
            trigger: ["change", "blur"]
          }
        ],
        companyName: [
          {
            required: true,
            message: "请输入参加单位名称",
            trigger: ["change", "blur"]
          }
        ],
        inspectName: [
          {
            required: true,
            message: "请输入检查主题",
            trigger: ["change", "blur"]
          }
        ],
        inspectTime: [
          {
            required: true,
            message: "请选择检查时间",
            trigger: ["change", "blur"]
          }
        ],
        content: [
          {
            required: true,
            message: "请输入描述内容",
            trigger: ["change", "blur"]
          }
        ],
        participantName: [
          {
            required: true,
            message: "请输入参加人员",
            trigger: ["change", "blur"]
          }
        ]
      },
      number: 1,
      url: "",
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      // 当前预览的
      nowPreviewObj: {},
      // 附件文件类型
      fileType: ["docx", "xlsx", "jpg", "jpeg", "png", "pdf"],
      projectStatus: false,
      delList: [], // 删除的附件集
      newAddList: [], // 本次操作新增的附件集
      typeShow:true
    };
  },
  components: {
    pageInation,
    pdfPiev
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  mounted() {
    
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
      } else {
        this.$message.error(res.msg);
      }
    });
    // 处理搜索条件问题 239  4  5  请求对应数据
    // if (this.user.orgType == 2 || this.user.orgType == 3 || this.user.orgType == 9) {
    //   this.getRoles();
    // }
    // if (this.user.orgType == 4) {
    //   this.noProject({ isWhole: 1, projectId: "" });
    // }
    if(this.user.orgType==5){
      this.getData();
    }
  },
  methods: {
    selectIds(arr,obj,isTrue){
      console.log('获取到的',arr,obj);
      if(arr.length){
        if(arr.length>1){
          this.searchData.fkProjectId = arr[0]
          this.searchData.fkProjectBidId = arr[1]
        }else{
          this.searchData.fkProjectBidId = arr[0]
        }
        if(isTrue){
          this.getData();
        }
      }
    },
    //
    inspectTypeChange(val) {
      //  console.log(val) 2 建设单位（业主方） 3监理公司 4施工单位 5 其他 6 设计院
      const obj = { 2: 0, 3: 1, 6: 2, 4: 3, 5: 4 };
      this.$api.searchByCompanyType({ type: obj[val] }).then(res => {
        this.form.companyName = res.data;
        console.log(res.data);
      });
    },
    // 根据项目id获取标段项目下拉列表
    projectIdChange(val) {
      this.searchData.fkProjectBidId = "";
      const data = {};
      if (val.length == 0) {
        data.isWhole = 1;
        data.projectId = val;
        this.projectStatus = true;
        this.searchData.fkProjectBidId = ""; // 清空标段项目
      } else {
        data.isWhole = 0;
        data.projectId = val;
        this.projectStatus = false;
      }
      this.$api.noProject(data).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.fkBidProjectName;
            item.value = item.fkBidProjectId;
          });
          this.noProjectData = res.data;
        }
      });
    },
    noProject(data) {
      this.$api.noProject(data).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.fkBidProjectName;
            item.value = item.fkBidProjectId;
          });

          this.noProjectData = res.data;
        }
      });
    },
    // 获取分页列表
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      };
      const obj = { ...params, ...this.searchData };
      this.loading = true;
      this.$api
        .getInspection(obj)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.loading = false;
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 查看
    lookOver(item) {
      this.disabledStatus = true;
      this.queryUserinfo(item.pkId);
      this.title = "检查记录信息";
      this.popup = true;
    },
    // 新增
    addRecord() {
      // 清空对象
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.title = "新增检查记录";
      this.popup = true;
    },
    // 编辑
    editRecord(item) {
      this.queryUserinfo(item.pkId);
      this.title = "编辑检查记录";
      this.popup = true;
    },
    queryUserinfo(id) {
      this.$api.queryInspection({ pkId: id }).then(res => {
        if (res.code == 200) {
          // res.data.inspectType = res.data.inspectType.toString();
          this.form = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 删除
    deleteRecord(pkId) {
      this.$confirm("确定删除该记录信息？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api
          .deleteInspection({ pkId })
          .then(res => {
            if (res.code === 200) {
              this.$message.success("删除成功");
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    // 上传
    uploading() {
      if (this.form.enclosures.length === 5) {
        return this.$message.warning("最多只能上传5个文件!");
      }
      this.$refs.files.click();
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
      const _this = this;
      const index = filename.lastIndexOf(".");
      const name = filename.substring(index + 1, filename.length);
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
            // const imgIdx = path.lastIndexOf("com/");
            // const imgName = path.substring(imgIdx + 4, path.length);
            _this.newAddList.push(path);
            _this.form.enclosures.push({ enclosureName: _this.$refs.files.files[0].name, enclosureUrl: path });
            _this.$refs.form.clearValidate("enclosures");
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.files.value = "";
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
      const fileObj = document.getElementById("upload").files[0];
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      // if (fileObj.size > 5242880) {
      //   this.$refs.file.value = "";
      //   return this.$message.warning("文件大小不能超过5M");
      // }
      if(this.form.enclosures.filter(item=>item.enclosureName == filename).length){
        return this.$message.warning("已有相同名字附件")
      }
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      const size = 100 * 1024 * 1024;
      if (fileObj.size > size) {
        this.$refs.file.value = "";
        return this.$message.warning("附件大小最大为100M");
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
              message: res.data.msg
            });
          }
        })
        .catch(err => {
          console.log(err);
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
    },
    // 附件清除
    remove(item, index) {
      this.delList.push(item.enclosureUrl);
      this.form.enclosures.splice(index, 1);
    },
    // 预览
    preview(row) {
      const str = row.enclosureUrl.substring(row.enclosureUrl.lastIndexOf(".") + 1);
      // 判断文件类型
      if (!this.fileType.includes(str)) {
        return this.$message("仅支持预览pdf，jpeg，jpg，pdf，docx，xlsx文件");
      }
      if (str == "xlsx" || str == "docx") {
        this.previewType = 1;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (str == "pdf") {
        this.previewType = 2;
        this.url = row.enclosureUrl;
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
    submit(formName) {
      console.log(this.form);
      this.$refs[formName].validate(valid => {
        if (valid) {
          const url = JSON.stringify(this.fileList);
          const data = {
            inspectType: this.form.inspectType,
            companyName: this.form.companyName,
            inspectName: this.form.inspectName,
            inspectTime: this.form.inspectTime, // moment().format("YYYY-MM-DD HH:mm:ss"),
            content: this.form.content,
            hierarchyType: 1,
            enclosures: this.form.enclosures,
            inspectUnitName:this.form.inspectUnitName,
            participantName:this.form.participantName
          };
          this.loading = true;
          if (this.title != "编辑检查记录") {
            this.$api
              .addInspection(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "新增成功"
                  });
                  this.getData();
                  this.close(true);
                  this.$refs[formName].resetFields();
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
          } else {
            data.pkId = this.form.pkId;
            this.$api
              .editInspection(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "编辑成功"
                  });
                  this.getData();
                  this.popup = false;
                  this.close(true);
                  this.$refs[formName].resetFields();
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
          }
        } else {
          return false;
        }
      });
    },
    // 下载
    handleDownload(row) {
      this.loading = true;
      if (row.length === 1) {
        const exit = row[0].enclosureUrl.substring(row[0].enclosureUrl.lastIndexOf(".") + 1);
        this.utils.fileLinkToStreamDownload(row[0].enclosureUrl, row[0].enclosureName, exit);
        this.loading = false;
      } else if (row.length > 1) {
        // const fileUrls = row.map(item => item.enclosureUrl).join(",");
        let fileList = row.map(item=>({fileUrl:item.enclosureUrl,fileName:item.enclosureName}))
        this.$api.compressFile({ fileName: "附件" + Date.now(), fileList }).then(res => {
          if (res.code === 200) {
            this.utils.fileLinkToStreamDownload(res.data, res.data.substring(res.data.lastIndexOf("/") + 1), "zip");
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        });
      }
    },
    // 弹窗取消按钮
    callOff() {
      this.popup = false;
    },
    // 获取项目列表
    getRoles() {
      this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          // this.options = [...this.roleList, ...res.data];
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          this.projectStatus = true;
          this.options = res.data;
        }
      });
    },
    close(isDel) {
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      this.popup = false;
      this.$refs.form.resetFields();
      this.disabledStatus = false;
    },
    // 外面搜索按钮
    queryData() {
      this.pageNum = 1;
      this.form.deptId = this.form.fkDeptId;
      this.form.roleId = this.addRoleIdList;
      this.getData();
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
    },
    // 点击那一页
    handleCurrentChange(data) {
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.pageNum = data;
      this.getData();
    },
    delFiles() {
      let urls = [];
      if (this.title === "新增检查记录") {
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
    }
  }
};
</script>

<style lang="scss" scoped>
.table-data {
  height: 80%;
}
.wraper {
  border: 1px solid #333333;
  width: 100%;
  height: 100%;
}
.form-data {
  display: flex;
  align-items: center;
  /deep/ .el-form-item {
    margin-bottom: 0 !important;
  }
}
.people {
  width: 15%;
  height: 696px;
  padding: 25px 0 25px 20px;
  // padding: 20px 60px 0 20px;
  // padding-left: 20px;
  border: 1px solid #ebeef5;
  font-size: 13px;
}
.form-input {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.form-flex {
  display: flex;
}
.sech-form {
  background-color: #f3f3f3;
  margin-bottom: 10px;
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
}
.seek {
  margin-left: 20px;
  height: 28px;
}
.add-staff {
  position: absolute;
  right: 40px;
}
.wh {
  width: 100%;
}
/deep/ .el-dialog__body {
  margin-top: 20px;
  .el-form {
    /deep/ .el-form-item {
      margin-bottom: 16px !important;
    }
  }
}
// 预览样式
.preview {
  /deep/ .el-dialog__headerbtn {
    display: none;
  }
  .previewHeight {
    min-height: 100px;
    max-height: 650px;
    overflow: auto;
    text-align: center;
    background: url("../../assets/loading.gif") no-repeat center center;
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
.succer {
  color: #c07314;
  cursor: pointer;
}
</style>
