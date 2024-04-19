<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bgc search-mr">
      <el-form :model="searchData" class="form-data search-bar-box">
        <!-- <el-form-item label="项目" label-width="40px" v-if="user.orgType == 2 || user.orgType == 3 || user.orgType == 9">
          <el-select v-model="searchData.projectId" size="mini" @change="projectIdChange">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in projectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="标段项目" label-width="90px" v-if="user.orgType != 5">
          <!-- <el-select v-model="searchData.noProjectId" size="mini" @change="listByProjectId">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
        <el-form-item label="记录类型" label-width="90px" v-if="typeShow">
          <el-select v-model="searchData.inspectType" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in typeList" :key="item.inspectType" :label="item.inspectTypeName" :value="item.inspectType"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分项工程" label-width="90px" v-if="typeShow">
          <treeSelect :defaultProps="defaultProps" :showCheckbox="false" :nodeKey="'pkId'" :checkedList="checkedList2" :treeList="treeData2" @selectIds="checked2" ref="treeSelect2" />
        </el-form-item>
        <el-form-item class="writeTime" label="记录时间" label-width="90px" v-if="typeShow">
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.startTime"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="经手人" label-width="80px" v-if="typeShow">
          <el-input v-model="searchData.agent" size="mini" class="wh-100" maxlength="25"></el-input>
        </el-form-item>
        <el-button size="mini" v-if="typeShow" type="primary" class="seek" icon="el-icon-search" @click.native="queryData">查询</el-button>
        <el-button type="primary" v-if="typeShow" size="mini" class="add-staff" @click.native="addRecord" v-has="'security:management:add'">新增记录</el-button>
      </el-form>
    </div>
    <div class="tab-container table-data" v-if="typeShow">
      <el-table :data="tableData" v-loading="loading" height="100%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="fkProjectName" label="项目" align="center" show-overflow-tooltip v-if="user.orgType == 2 "> </el-table-column> -->
        <!-- <el-table-column prop="fkBidProjectName" label="标段项目" align="center" show-overflow-tooltip v-if="user.orgType == 2 || user.orgType == 9 "> </el-table-column> -->
        <el-table-column prop="inspectTypeName" label="记录类型" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="itemName" label="分项工程名称" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="createTime" label="记录时间" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="userName" label="经手人" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="describeContent" label="记录内容" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="400">
          <template slot-scope="{ row }">
            <el-button size="mini" plain type="primary" @click.native="lookOver(row)" v-has="'security:management:query'">查看</el-button>
            <el-button size="mini" plain type="success" v-has="'security:management:update'" @click.native="editRecord(row)" v-if="row.editStatus">编辑</el-button>
            <el-button size="mini" plain @click.native="handleDownload(row.enclosures)" v-if="row.enclosures && row.enclosures.length" v-has="'security:management:download'">下载</el-button>
            <el-button size="mini" plain type="danger" v-has="'security:management:delete'" @click.native="deleteRecord(row.pkId)" v-if="row.deleteStatus">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 分页 -->
    </div>
    <pageInation   v-if="typeShow" :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 弹窗 -->
    <el-dialog :close-on-press-escape="false" :title="title" :visible.sync="popup" v-dialogDrag :close-on-click-modal="false" v-loading="loading" @close="close(false)" class="tree-list">
      <div class="dialog-form">
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item label="记录类型" label-width="80px">
            <el-select v-model="form.inspectType" size="mini" style="width: 100%">
              <el-option v-for="item in typeList" :key="item.inspectType" :label="item.inspectTypeName" :value="item.inspectType"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分项工程" prop="projectName" label-width="80px">
            <!-- <el-select v-show="treeSelectInput" v-model="form.projectName" clearable :disabled="disabledStatus" placeholder="请选择分项工程名称" class="wh"></el-select> -->
            <treeSelect :treeDateItem="treeDateItem" v-if="popup" :disabled="title == '记录信息' ? true : false" :defaultProps="defaultProps" :nodeKey="'pkId'" :checkedList="checkedList" :treeList="treeData" @selectIds="checked" ref="treeSelect" />
          </el-form-item>
          <el-form-item label="记录内容" label-width="80px" prop="remark">
            <el-input type="textarea" :autosize="{ minRows: 8, maxRows: 8 }" maxlength="3000" placeholder="请输入内容" :disabled="disabledStatus" v-model="form.remark"> </el-input>
          </el-form-item>
          <el-form-item label="附件" label-width="80px" prop="accessory">
            <div>
              <el-button size="small" type="primary" @click.native="uploading" v-if="form.accessory.length != 10" :disabled="disabledStatus">点击上传</el-button>
              <div class="upLoad-show">
                <p v-for="(item, index) in form.accessory" :key="index">
                  <span class="succer" @click="preview(item)">{{ item.enclosureName }}</span>
                  <!-- <el-button size="mini" @click.native="preview(item)">预览</el-button> -->
                  <span>
                    <el-button size="mini" style="color: red; border: none" icon="el-icon-close" @click.native="remove(item, index)" v-if="title != '记录信息'"></el-button>
                  </span>
                </p>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" v-if="title != '记录信息'">
        <el-button type="primary" plain @click.native="close(false)">取 消</el-button>
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
import treeSelect from "./component/treeSelect.vue";
import pageInation from "../../components/tablePaging";
import COS from "cos-js-sdk-v5";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
export default {
  name: "staff",
  data() {
    return {
      treeSelectInput: false,
      treeData: [],
      treeData2: [],
      defaultProps: {
        children: "children",
        label: "itemName"
      },
      // 搜索数据
      searchData: {
        projectId: "",
        noProjectId: "",
        fkItemId: "",
        startTime: "",
        endTime: "",
        agent: "",
        inspectType: ""
      },
      options: [],
      projectList: [],
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
        projectName: "",
        remark: "",
        accessory: [],
        inspectType: ""
      },
      title: "",
      rules: {
        projectName: [
          {
            required: true,
            message: "请选择分项工程",
            trigger: ["change", "blur"]
          }
        ],
        remark: [
          {
            required: true,
            message: "请输入描述内容",
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
      treeStatus: true,
      filterText: "",
      checkedList: [],
      checkedList2: [],
      hierarchyType: 2,
      pkId: "",
      delList: [], // 删除的附件集
      newAddList: [], // 本次操作新增的附件集
      treeDateItem: "", // 子组件数据回显
      typeList: [],
      typeShow:true
    };
  },
  components: {
    pageInation,
    pdfPiev,
    treeSelect
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
          return  (this.typeShow = false);;
        }
        // 处理搜索条件问题 239  4  5  请求对应数据
        if (this.user.orgType == 2 || this.user.orgType == 3 || this.user.orgType == 9) {
          this.noProject();
        }
        if (this.user.orgType == 4) {
          // 获取所有的标段项目
          this.projectData();
        }
        // if (this.user.orgType == 5) {
        // 获取分项工程 新增编辑查看用
        this.searchItemsByProjectId("");
        this.inspectTypeAllList();
        // }
        this.getData();
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      console.log("获取到的", arr, obj);
      if (arr.length) {
        if (arr.length > 1) {
          this.searchData.projectId = arr[0];
          this.searchData.noProjectId = arr[1];
        } else {
          this.searchData.noProjectId = arr[0];
        }
        this.listByProjectId();
        if (isTrue) {
          this.getData();
        }
      }
    },
    inspectTypeAllList() {
      this.$api.inspectTypeAllList().then(res => {
        if (res.code === 200) {
          this.typeList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分页列表
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        hierarchyType: this.hierarchyType,
        beginTime: this.searchData.startTime,
        endTime: this.searchData.endTime,
        fkProjectBidId: this.searchData.noProjectId,
        fkProjectId: this.searchData.projectId,
        fkItemId: this.searchData.fkItemId, // 分项工程id
        userName: this.searchData.agent, // 经手人
        inspectType:this.searchData.inspectType
      };
      
      this.loading = true;
      this.$api
        .getSearchPage(params)
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
      this.treeDateItem = item;
      this.disabledStatus = true;
      this.queryUserinfo(item.pkId);
      this.title = "记录信息";
      this.treeSelectInput = true;
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
      this.title = "新增记录";
      this.popup = true;
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },
    // 编辑
    editRecord(item) {
      this.treeDateItem = false;
      this.queryUserinfo(item.pkId);
      this.pkId = item.pkId;
      this.title = "编辑记录";
    },
    // 查询信息
    queryUserinfo(id) {
      this.$api.queryQualitySafety({ pkId: id }).then(res => {
        if (res.code == 200) {
          this.form.accessory = res.data.enclosures;
          this.form.projectName = res.data.fkItemId;
          this.form.remark = res.data.describeContent;
          this.form.inspectType = res.data.inspectType;
          this.popup = true;
          this.$nextTick(() => {
            this.$refs.treeSelect.setTreeSelect([this.form.projectName]);
          });
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
          .deleteQualitySafety({ pkId })
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
    // 根据项目id获取标段项目下拉列表
    projectIdChange(val) {
      this.searchData.noProjectId = "";
      const data = {};
      if (val.length == 0) {
        data.isWhole = 1;
        data.projectId = val;
        this.searchData.noProjectId = ""; // 清空标段项目
        this.searchData.fkItemId = ""; // 分项工程名称清空
        this.noProjectData = [];
        this.treeData2 = [];
        return;
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
    // 施工单位获取标段项目
    projectData() {
      this.$api.noProject({ isWhole: 1, projectId: "" }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.fkBidProjectName;
            item.value = item.fkBidProjectId;
          });
          this.noProjectData = res.data;
        }
      });
    },
    // 根绝标段项目id获取分项工程
    listByProjectId() {
      if (this.searchData.noProjectId) {
        this.searchItemsByProjectId(this.searchData.noProjectId);
      } else {
        this.treeData2 = [];
        this.searchData.fkItemId = "";
      }
    },
    // 获取分项工程
    searchItemsByProjectId(id) {
      this.$api.searchItemsByProjectId2({ projectId: id }).then(res => {
        console.log("res.data -----> ", res.data);
        if (res.code == 200) {
          if (id !== "") {
            this.treeData2 = res.data;
          } else {
            this.treeData = res.data;
          }
          if (this.user.orgType == 5) {
            this.treeData2 = res.data;
          }
        }
      });
    },
    // 选择节点
    checked(id) {
      console.log(id);
      this.form.projectName = id[0];
    },
    checked2(id, obj) {
      console.log(obj);
      this.searchData.fkItemId = obj.pkId;
    },
    // 上传
    uploading() {
      if (this.form.accessory.length === 5) {
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
      const _this = this;
      const index = filename.lastIndexOf(".");
      const name = filename.substring(index + 1, filename.length);
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
            const path = "https://" + data.Location;
            // const imgIdx = path.lastIndexOf("com/");
            // const imgName = path.substring(imgIdx + 4, path.length);
            _this.newAddList.push(path);
            _this.form.accessory.push({ enclosureName: _this.$refs.files.files[0].name, enclosureUrl: path });
            _this.$refs.form.clearValidate("accessory");
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
      if(this.form.accessory.filter(item=>item.enclosureName == filename).length){
        return this.$message.warning("已有相同名字附件")
      }
      // if (fileObj.size > 5242880) {
      //   this.$refs.file.value = "";
      //   return this.$message.warning("文件大小不能超过5M");
      // }
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
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },
    // 附件清除
    remove(item, index) {
      this.delList.push(item.enclosureUrl);
      this.form.accessory.splice(index, 1);
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
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            fkItemId: this.form.projectName,
            hierarchyType: this.hierarchyType,
            describeContent: this.form.remark,
            enclosures: this.form.accessory,
            inspectType: this.form.inspectType
          };
          this.loading = true;
          if (this.title == "新增记录") {
            this.$api
              .addQualitySafety(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message.success("新增成功");
                  this.getData();
                  this.$refs[formName].clearValidate();
                  this.close(true);
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
            data.pkId = this.pkId;
            this.$api
              .modifyQualitySafety(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message.success("编辑成功");
                  this.getData();
                  this.popup = false;
                  this.close(true);
                  this.$refs[formName].clearValidate();
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
    // 获取项目下拉列表
    noProject() {
      this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          this.projectList = res.data;
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
      this.$refs.form.clearValidate();
      this.popup = false;
      this.disabledStatus = false;
      this.treeSelectInput = false;
    },
    // 外面搜索按钮
    queryData() {
      this.pageNum = 1;
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
      if (this.title === "新增记录") {
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
// 弹框
.table-data {
  height: 80%;
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
// 树形工程
.tree-project {
  background-color: #fff0f0;
  position: absolute;
  left: 100px;
  top: 110px;
  border: 1px solid #edc7c7;
  z-index: 999;
  // 头部搜索
  .head-selc {
    display: flex;
    justify-content: space-between;
    padding: 5px 10px;
    .text-select {
      margin-right: 20px;
    }
  }
  // 树形数据
  .tree-list {
    height: 350px;
    overflow: auto;
    // 树形结构让叶子才显示选择框
    /deep/ .el-tree {
      width: 100%;
      height: 350px;
      overflow: auto;
      .label {
        display: block;
        width: 250px;
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*禁⽌换⾏*/
        text-overflow: ellipsis; /*省略号*/
      }
      .el-tree-node {
        .is-leaf + .el-checkbox .el-checkbox__inner {
          display: inline-block;
        }
        .el-checkbox .el-checkbox__inner {
          display: none;
        }
      }
    }
  }
}
// 树形数据
.tree-list {
  // 树形结构让叶子才显示选择框
  /deep/ .el-tree {
    .label {
      display: block;
    }
    .el-tree-node {
      .is-leaf + .el-checkbox .el-checkbox__inner {
        display: inline-block;
      }
      .el-checkbox .el-checkbox__inner {
        display: none;
      }
    }
  }
}
</style>
