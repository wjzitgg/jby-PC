<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <div class="header-search">
      <el-form label-width="80px" :inline="true" class="myform">
        <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)">
          <treeSelect2 @selectIds="selectIds2" ref="sectionItem"></treeSelect2>
        </el-form-item>
        <!-- <el-form-item label="标段项目" v-if="user.orgType !== 5">
          <el-select v-model="inpData.fkProjectBidId" size="mini" @change="linkProChange($event, 1)" :disabled="!inpData.fkProjectId" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9" class="wh-140">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in proOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
          </el-select>
          <el-select v-model="inpData.fkProjectBidId" @change="linkProChange($event, 1)" size="mini" class="wh-200" v-else>
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="分项工程" v-if="typeShow">
          <treeSelect ref="treeSelect2" :disabled="!inpData.fkProjectBidId && user.orgType !== 5" :defaultProps="defaultProps" class="wh-200" :treeList="treeList" @selectIds="selectIds" :nodeKey="'pkId'" />
        </el-form-item>
        <el-form-item label="填表人" v-if="typeShow">
          <el-select v-model="inpData.userId" size="mini" class="wh-200">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in preparerList" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择时间" v-if="typeShow">
          <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.beginTime" :picker-options="pickerOptionsAnd"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.endTime" :picker-options="pickerOptionsEnd"></el-date-picker>
        </el-form-item>
        <el-button v-if="typeShow" size="mini" type="primary" class="ml-20 search el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
      </el-form>
      <el-button v-if="typeShow" size="mini" v-has="'production:journal:add'" class="el-button-primary" type="primary" @click="handleOpen(2)">新建</el-button>
    </div>
    <!-- 表格 -->
    <div class="table-data" style="height: 80%" v-if="typeShow">
      <el-table ref="tables" :data="tableData" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="time" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="项目" prop="projectName" show-overflow-tooltip align="center" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9"> </el-table-column>
        <el-table-column label="标段项目" prop="projectBidName" align="center" show-overflow-tooltip v-if="user.orgType !== 5"> </el-table-column>
        <el-table-column label="分项工程名称" prop="itemName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="填表人" prop="userName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="天气" prop="weatherCode" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="温度" prop="temperature" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="250">
          <template slot-scope="{ row }">
            <el-button plain @click="handleOpen(1, row)" size="mini" type="primary">查看</el-button>
            <el-button plain size="mini" v-has="'production:journal:update'" v-if="row.editStatus" type="success" @click="handleOpen(3, row)">编辑</el-button>
            <el-button plain size="mini" v-has="'production:journal:delete'" v-if="row.deleteStatus" type="danger" @click="handleDel(row)">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 分页组件 -->
    <tablePaging v-if="typeShow" :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    <!-- 日志弹框 -->
    <el-dialog :title="title" width="1200px" :visible.sync="dialogVisible" top="5vw" v-loading="loading" @close="dialogClose(false)" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form dialog-box">
        <div class="dialog-header" :class="type == 1 ? 'pt10' : ''">
          <div class="details" v-if="type != 1">
            <!-- <el-date-picker size="mini" :disabled="type !== 1" value-format="yyyy-MM-dd" v-model="dialogSearchDate.time"></el-date-picker> -->
            <h6>{{ dialogSearchDate.time }}</h6>
            <p>填表人: {{ user.userName }}</p>
          </div>
          <el-row>
            <el-col class="dialog-header-item" v-if="[2, 3, 9].includes(user.orgType)">
              <span class="label">项目</span>
              <el-select v-model="dialogSearchDate.fkProjectId" size="mini" @change="proChange($event, 2)">
                <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
              </el-select>
            </el-col>
            <el-col class="dialog-header-item" v-if="false">
              <span class="label">标段项目</span>
              <el-select v-model="dialogSearchDate.fkProjectBidId" @change="linkProChange($event, 2)" size="mini" :disabled="!dialogSearchDate.fkProjectId" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9">
                <el-option v-for="item in dialogProOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
              </el-select>
              <el-select v-model="dialogSearchDate.fkProjectBidId" @change="linkProChange($event, 2)" size="mini" v-else>
                <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
              </el-select>
            </el-col>
            <el-col class="dialog-header-item">
              <span class="label">分项工程</span>
              <treeSelect style="flex: 1" :defaultProps="defaultProps" :nodeKey="'pkId'" :checkedList="checkedList" :disabled="(type === 3 && user.orgType === 5) || (user.orgType !== 5 && !dialogSearchDate.fkProjectBidId)" :treeList="addTreeList" @selectIds="selectIds" ref="treeSelect" />
            </el-col>
            <el-col class="dialog-header-item" v-if="type == 1">
              <span class="label">日期</span>
              <el-date-picker size="mini" :disabled="type !== 1" value-format="yyyy-MM-dd" v-model="dialogSearchDate.time" class="item-select"></el-date-picker>
            </el-col>
            <el-col class="dialog-header-item" v-if="type == 1">
              <span class="label">填表人</span>
              <!-- <el-input size="mini" v-model="dialogSearchDate.userName" :disabled="type !== 1" maxlength="25"></el-input> -->
              <el-select v-model="dialogSearchDate.userId" size="mini" class="item-select">
                <el-option v-for="item in preparerList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-col>
            <el-col class="dialog-header-item" v-if="type !== 1">
              <span class="label">天气状态</span>
              <el-select v-model="dialogSearchDate.weatherCode" size="mini" class="item-select">
                <el-option v-for="item in wetherOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-col>
            <el-col class="dialog-header-item" v-if="type !== 1">
              <span class="label">温度</span>
              <el-select v-model="dialogSearchDate.temperature" size="mini" class="item-select">
                <el-option v-for="item in temOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-col>

            <el-col class="dialog-header-item" v-if="type !== 1">
              <span class="label">风力</span>
              <el-select v-model="dialogSearchDate.windGrade" size="mini" class="item-select">
                <el-option v-for="item in windGradeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-button size="mini" class="el-button-primary-search" v-if="type === 1" @click="dialogSearch">查询</el-button>
          <el-button size="mini" class=" el-button-primary-search empty" v-if="type === 1" @click="empty">清空</el-button>
        </div>

        <!-- <div class="bd"></div> -->

        <div class="dialog-main" v-if="type != 1 && logList.length > 0">
          <div class="dialog-main-item" v-for="item in logList" :key="item.id">
            <div class="item-header" v-if="type !== 1">
              <div class="proName">{{ item.itemName }}</div>
              <div class="remove" @click="removeLog(item)">X</div>
            </div>
            <div class="item-header2" v-else>
              <div class="date mr-20">{{ item.time }}</div>
              <div class="proName mb-20">分项：{{ item.itemName }}</div>
              <div class="draName mb-20">填表人：{{ item.userName }}</div>
              <div class="weather ">天气：{{ wetherOptions.filter(i => i.weatherCode === item.weatherCode)[0].weatherStats }}</div>
              <div class="temperature mr-20">温度：{{ item.temperature }}℃</div>
              <div class="temperature mr-20">风力：{{ item.windGradeName }}℃</div>
            </div>
            <div class="item-content">
              <el-input type="textarea" :class="logList.length == 1 ? 'inp-text' : ''" placeholder="请输入日志内容" :disabled="type === 1" :rows="5" v-model="item.content" maxlength="500" :autosize="{ minRows: 8, maxRows: 11 }" show-word-limit> </el-input>
            </div>
            <div class="title-file">
              <span></span>
              附件
            </div>
            <div class="item-bottom" v-if="(item.enclosures && item.enclosures.length && type === 1) || type !== 1">
              <div class="fileList">
                <div class="fileList-item" v-for="(row, idx) in item.enclosures" :key="idx">
                  <i class="fileIcon iconfont" :class="getFileTypes(row.enclosureUrl)"></i>
                  <div class="fileName" :title="row.enclosureName" @click="preview(row)">{{ row.enclosureName }}</div>
                  <span class="delFile" @click="removefile(item, idx)" v-if="type !== 1">X</span>
                </div>
              </div>
              <div class="uploadBtn" title="上传附件" @click="uploading(item)" v-if="type !== 1 && item.enclosures.length <= 10">
                <img src="../../assets/xiazai.png" class="el-icon-document-add" alt="" />
              </div>
            </div>
          </div>
        </div>
        <div class="bgcnone" v-if="logList.length == 0">
          <img src="../../assets/bgcnone.png" alt="" />
          <p>请选择分项工程</p>
        </div>
        <div class="dialog-main mt10" v-if="type == 1">
          <div class="dialog-main-item" v-for="item in logList" :key="item.id">
            <div class="item-header" v-if="type !== 1">
              <div class="proName">{{ item.itemName }}</div>
              <div class="remove" @click="removeLog(item)">X</div>
            </div>
            <div class="item-header2" v-else>
              <div>
                <div class="date mr-20">{{ item.time }}</div>
                <div class="proName mr-20"><img src="../../assets/guifan.png" alt="" />{{ item.itemName }}</div>
                <div class="draName mr-20"><img src="../../assets/ren.png" alt="" />填表人：{{ item.userName }}</div>
              </div>
              <div style="width: 68%;">
                <span class="weather mr-20">天气：{{ wetherOptions.filter(i => i.weatherCode === item.weatherCode)[0].weatherStats }}</span>
                <span class="temperature mr-20">温度：{{ item.temperature }}℃</span>
                <span class="temperature mr-20">风力：{{ item.windGradeName }}℃</span>
              </div>
            </div>
            <div class="item-content type1">
              <!-- <el-input type="textarea" :disabled="type === 1" :rows="5" v-model="item.content"> </el-input> -->
              <el-input type="textarea" :disabled="type === 1" v-model="item.content" maxlength="500" :autosize="{ minRows: 8, maxRows: 11 }" show-word-limit> </el-input>
            </div>
            <div class="title-file">
              <span></span>
              附件
            </div>
            <div class="item-bottom" v-if="(item.enclosures && item.enclosures.length && type === 1) || type !== 1">
              <div class="uploadBtn" title="上传附件" @click="uploading(item)" v-if="type !== 1 && item.enclosures.length < 10"><i class="el-icon-document-add"></i></div>
              <div class="fileList">
                <div class="fileList-item" v-for="(row, idx) in item.enclosures" :key="idx">
                  <i class="fileIcon iconfont" :class="getFileTypes(row.enclosureUrl)"></i>
                  <div class="fileName" :title="row.enclosureName" @click="preview(row)">{{ row.enclosureName }}</div>
                  <span class="delFile" @click="removefile(item, idx)" v-if="type !== 1">X</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button type="primary" plain @click="dialogClose(false)" v-if="type !== 1" class="abolish">取 消</el-button>
        <el-button v-if="type !== 1" type="primary" class="conserve" @click="btnOk">保 存</el-button>

        <div class="btns" v-if="type === 1">
          <div class="btns-item-export" @click="batchExportFile">
            <!-- <i class="el-icon-upload"></i> -->
            <div>导出</div>
          </div>
          <div class="btns-item-print" @click="printFile">
            <!-- <i class="el-icon-printer"></i> -->
            <div>打印</div>
          </div>
        </div>
      </div>
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
    <input v-show="false" type="file" ref="files" id="upload" @change="upLoad" />
  </div>
</template>

<script>
import { getFileType } from "@/utils/commond";
import treeSelect from "./components/treeSelect.vue";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import COS from "cos-js-sdk-v5";
import printJs from "print-js";
import treeSelect2 from "../../components/proTreeSelect/treeSelect.vue";
export default {
  components: { treeSelect, pdfPiev, treeSelect2 },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  data() {
    return {
      page: {
        pageSize: 10,
        pageNum: 1
      },
      total: 0,
      loading: false,
      options: [],
      proOptions: [],
      dialogProOptions: [],
      tableData: [],
      treeList: [],
      inpData: {
        fkProjectBidId: "",
        userId: "",
        fkItemIds: [],
        beginTime: "",
        endTime: "",
        fkProjectId: ""
      },
      searchData: {
        // userName: "",
        userId: "",
        fkItemIds: [],
        beginTime: "",
        endTime: "",
        fkProjectId: "",
        fkProjectBidId: ""
      },
      dialogVisible: false,
      type: 1,
      title: "新增施工日志",
      temOptions: [],
      wetherOptions: [],
      dialogSearchDate: {
        // userName: "",
        userId: "",
        time: "",
        weatherCode: "",
        temperature: "",
        fkItemIds: [],
        fkProjectId: "",
        fkProjectBidId: "",
        windGrade: ""
      },
      content: "",
      logList: [],
      checkedList: [],
      nowUploadObj: {},
      previewDialog: false,
      previewType: 1,
      url: "",
      printerShow: false,
      defaultProps: { children: "children", label: "itemName" },
      fileShow: true,
      addTreeList: [],
      newAddList: [],
      delList: [],
      windGradeList: [],
      typeShow: true,
      pickerOptionsEnd: {
        disabledDate: time => {
          if (this.inpData.beginTime) {
            let d;
            if (typeof this.inpData.beginTime == "string") {
              d = new Date(this.inpData.beginTime).getTime();
            } else {
              d = this.inpData.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      pickerOptionsAnd: {
        disabledDate: time => {
          if (this.inpData.endTime) {
            let d;
            if (typeof this.inpData.endTime == "string") {
              d = new Date(this.inpData.endTime).getTime();
            } else {
              d = this.inpData.endTime.getTime();
            }
            return time.getTime() > d;
          }
        }
      },
      preparerList: []
    };
  },
  watch: {
    tableData() {
      if (this.tableData.length > 0) {
        this.logUserList();
      }
    }
  },
  created() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          this.typeShow = false;
          return;
        }
        if (this.user.orgType !== 5) {
          this.getAllProject();
        } else {
          this.searchItemsByProjectId();
          this.searchPageJournal();
        }
        this.temperatureAllList();
        this.weatherStatsAllList();
        this.windGradeAllList();
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    selectIds2(arr, obj, isTrue) {
      console.log("获取到的", arr, obj);
      if (arr.length) {
        if (arr.length > 1) {
          this.inpData.fkProjectId = arr[0];
          this.inpData.fkProjectBidId = arr[1];
        } else {
          this.inpData.fkProjectBidId = arr[0];
        }
      }
      console.log(arr);
      if (isTrue && arr != "") {
        this.btnSearch();
      }
      this.linkProChange(this.inpData.fkProjectBidId, 1);
    },
    windGradeAllList() {
      this.$api.windGradeAllList().then(res => {
        if (res.code == 200) {
          this.windGradeList = res.data.map(item => ({ ...item, value: item.windGrade, label: item.windGradeName }));
          // this.windGradeList = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    logUserList() {
      let fkProjectBidId = "";
      if (this.user.orgType !== 5) {
        // console.log(this.inpData.fkProjectId);
        // console.log(this.$refs.sectionItem.checkValue);
        // console.log(this.searchData.fkProjectId);
        // fkProjectBidId = this.searchData.fkProjectId;
        fkProjectBidId = this.$refs.sectionItem.checkValue;
      }
      this.$api.logUserList({ fkProjectBidId }).then(res => {
        if (res.code == 200) {
          this.preparerList = res.data.map(item => ({ ...item, value: item.pkId, label: item.userName }));
          console.log(this.preparerList);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getFileTypes(url) {
      let type = getFileType(url);
      if (type === "image") {
        return "icontupian";
      } else if (type === "excel") {
        return "iconexcel1";
      } else if (type === "word") {
        return "iconwork1";
      } else if (type === "pdf") {
        return "iconpdf";
      } else {
        return "el-icon-document";
      }
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "", type) {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          if (type === 1) {
            this.proOptions = res.data;
          } else {
            this.dialogProOptions = res.data;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    //根据标段项目ID查询树形分项工程集
    searchItemsByProjectId(projectId = "", type) {
      this.$api.searchItemsByProjectId({ projectId }).then(res => {
        if (res.code === 200) {
          if (this.user.orgType === 5) {
            this.treeList = res.data;
            this.addTreeList = res.data;
          }
          if (type === 1) {
            this.treeList = res.data;
          } else if (type === 2) {
            this.addTreeList = res.data;
            this.$nextTick(() => {
              this.$refs.treeSelect.setTreeSelect(this.dialogSearchDate.fkItemIds);
            });
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据id查询日志
    selectJournalById(pkId) {
      this.$api.selectJournalById({ pkId }).then(res => {
        if (res.code === 200) {
          if (res.data) {
            this.dialogVisible = true;
            this.logList = [{ ...res.data }];
            // this.dialogSearchDate.userName = res.data.userName;
            this.dialogSearchDate.userId = res.data.createUser;
            this.dialogSearchDate.time = res.data.time;
            this.dialogSearchDate.fkItemIds = res.data.fkItemId.split(",");
            this.dialogSearchDate.temperature = res.data.temperature;
            this.dialogSearchDate.weatherCode = res.data.weatherCode;
            this.dialogSearchDate.windGrade = res.data.windGrade;
            if (this.user.orgType === 4) {
              this.dialogSearchDate.fkProjectBidId = res.data.fkBidProjectId;
              this.searchItemsByProjectId(this.dialogSearchDate.fkProjectBidId, 2);
            } else if ([2, 3, 9].includes(this.user.orgType)) {
              this.dialogSearchDate.fkProjectId = res.data.fkProjectId;
              this.allListBidByProId(0, res.data.fkProjectId, 2);
              this.dialogSearchDate.fkProjectBidId = res.data.fkBidProjectId;
              this.searchItemsByProjectId(this.dialogSearchDate.fkProjectBidId, 2);
            } else {
              this.$nextTick(() => {
                this.$refs.treeSelect.setTreeSelect(this.dialogSearchDate.fkItemIds);
              });
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 分页列表
    searchPageJournal() {
      let fkItemIds = this.searchData.fkItemIds.join(",");
      this.$api.searchPageJournal({ ...this.page, ...this.searchData, fkItemIds }).then(res => {
        console.log("分页", res);
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 树形下拉框返回的参数
    selectIds(ids, nodes) {
      console.log("返回的参数", ids, nodes, "日志列表", this.logList);
      if (this.dialogVisible) {
        this.dialogSearchDate.fkItemIds = ids;
        if (this.type === 2) {
          if (nodes.length) {
            if (this.logList.length) {
              let logIds = this.logList.length ? this.logList.map(item => item.fkItemId) : [];
              let diffList = this.diff(logIds, ids);
              // 判定删除id
              if (diffList[0].length) {
                this.removeLog(null, diffList[0]);
              }
              // 判定新增id
              if (diffList[1].length) {
                let addArr = [];
                nodes.forEach(item => {
                  diffList[1].forEach(item2 => {
                    if (item.pkId === item2) {
                      addArr.push({ itemName: item.itemName, enclosures: [], fkItemId: item.pkId, content: "", temperature: "", weatherCode: "" });
                    }
                  });
                });
                this.logList = [...this.logList, ...addArr];
              }
            } else {
              nodes.forEach(item => {
                this.logList.push({ itemName: item.itemName, enclosures: [], fkItemId: item.pkId, content: "", temperature: "", weatherCode: "" });
              });
            }
          } else {
            this.logList = [];
          }
        }
      } else {
        // 外部搜索框
        this.inpData.fkItemIds = ids;
      }
    },
    // 打开新增/编辑/查看弹框
    handleOpen(type, row) {
      this.type = type;
      if (type === 2) {
        this.title = "新增施工日志";
        // this.dialogSearchDate.userName = this.user.userName;
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        this.dialogSearchDate.time = year + "年" + month + "月" + day + "日";
        this.dialogVisible = true;
        this.dialogSearchDate.temperature = "";
        this.dialogSearchDate.windGrade = "";
      } else if (type === 1) {
        this.title = "查看施工日志";
      } else {
        this.title = "编辑施工日志";
      }
      if (type !== 2) {
        this.selectJournalById(row.pkId);
      }
    },
    dialogClose(isDel) {
      this.$refs.treeSelect.showTree = false;
      this.dialogVisible = false;
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      this.fileShow = true;
      this.logList = [];
      this.dialogSearchDate = {
        userName: "",
        time: "",
        weatherCode: "",
        temperature: "",
        windGrade: "",
        fkItemIds: [],
        fkProjectId: "",
        isWholeBid: 1,
        isWholeProject: 1,
        windGrade: ""
      };
      this.$refs.treeSelect.setTreeSelect([]);
    },
    // 删除
    handleDel(row) {
      this.$confirm("确定删除该日志?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.deleteJournal({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.searchPageJournal();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 选择项目部
    proChange(e, type) {
      if (type === 1) {
        this.inpData.fkProjectBidId = "";
        this.inpData.fkItemIds = [];
        this.$refs.treeSelect2.showTree = false;
        this.$refs.treeSelect2.setTreeSelect([]);
      } else {
        this.dialogSearchDate.fkProjectBidId = "";
        this.dialogSearchDate.fkItemIds = [];
        this.$refs.treeSelect.showTree = false;
        this.$refs.treeSelect.setTreeSelect([]);
      }
      if (e) {
        this.allListBidByProId(0, e, type);
      }
    },
    linkProChange(e, type) {
      if (type === 1) {
        this.inpData.fkItemIds = [];
        this.$refs.treeSelect2.showTree = false;
        this.$refs.treeSelect2.setTreeSelect([]);
      } else {
        this.dialogSearchDate.fkItemIds = [];
        this.$refs.treeSelect.showTree = false;
        this.$refs.treeSelect.setTreeSelect([]);
      }
      if (e) {
        this.searchItemsByProjectId(e, type);
      }
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchPageJournal();
    },
    // 获取温度下拉
    temperatureAllList() {
      this.$api.temperatureAllList().then(res => {
        if (res.code === 200) {
          this.temOptions = res.data.map(item => ({ ...item, value: item.temperature, label: item.temperatureName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取天气下拉
    weatherStatsAllList() {
      this.$api.weatherStatsAllList().then(res => {
        if (res.code === 200) {
          this.wetherOptions = res.data.map(item => ({ ...item, value: item.weatherCode, label: item.weatherStats }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.searchPageJournal();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchPageJournal();
    },
    // 弹框确定按钮
    btnOk() {
      if (!this.logList.length) {
        return this.$message.warning("请先选择分项工程");
      }
      if (this.dialogSearchDate.temperature == undefined || this.dialogSearchDate.temperature == null || this.dialogSearchDate.temperature.length == 0) {
        return this.$message.warning("请选择温度");
      }
      if (!this.dialogSearchDate.weatherCode) {
        return this.$message.warning("请选择天气状态");
      }
      for (let i = 0; i < this.logList.length; i++) {
        if (!this.logList[i].content) {
          return this.$message.warning("分项工程" + this.logList[i].itemName + "的日志内容不能为空");
        }
      }

      // 新增
      if (this.type === 2) {
        let data = this.logList.map(item => ({ ...item, temperature: this.dialogSearchDate.temperature, weatherCode: this.dialogSearchDate.weatherCode, windGrade: this.dialogSearchDate.windGrade }));
        console.log(data);
        this.loading = true;
        this.$api.addBatch(data).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.dialogClose(true);
            this.searchPageJournal();
            this.$message.success("新增日志成功");
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        // 编辑
        let data = this.logList.map(item => ({ ...item, temperature: this.dialogSearchDate.temperature, weatherCode: this.dialogSearchDate.weatherCode, windGrade: this.dialogSearchDate.windGrade }));
        console.log(data);
        this.loading = true;
        this.$api.updateJournal(data[0]).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.dialogClose(true);
            this.searchPageJournal();
            this.$message.success("编辑日志成功");
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    removeLog(row, ids) {
      if (!!ids) {
        for (let i = 0; i < ids.length; i++) {
          this.logList = this.logList.filter(item => item.fkItemId !== ids[i]);
        }
      } else {
        this.logList = this.logList.filter(item => item.fkItemId !== row.fkItemId);
        this.delList = [...this.delList, ...row.enclosures.map(item => item.enclosureUrl)];
        let ids = this.logList.map(item => item.fkItemId);
        this.$refs.treeSelect.setTreeSelect(ids);
      }
    },
    diff(arr1, arr2) {
      var arr3 = [];
      for (var i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) === -1) arr3.push(arr1[i]);
      }
      var arr4 = [];
      for (var j = 0; j < arr2.length; j++) {
        if (arr1.indexOf(arr2[j]) === -1) arr4.push(arr2[j]);
      }
      return new Array(arr3, arr4);
    },
    // 批量导出
    batchExportFile() {
      this.$confirm("是否确认导出当前日志列表", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let data = { ...this.dialogSearchDate, fkItemIds: this.dialogSearchDate.fkItemIds.join(",") };
        delete data.weatherCode;
        delete data.temperature;
        // let str = `userName=${data.userName}&time=${data.time}&fkItemIds=${data.fkItemIds}&fkProjectId=${data.fkProjectId}&isWholeBid=${data.isWholeBid}&isWholeProject=${data.isWholeProject}`;
        // let url = localStorage.getItem("httpurl") + "/eng/prodConstructionJournal/batchExportFile?" + str;
        // window.open(url);
        this.loading = true;
        this.$api.batchExportFile(data).then(res => {
          console.log("导出", res);
          if (res.code === 200) {
            let fileName = "";
            if (res.data.fileName) {
              fileName = res.data.fileName;
            } else {
              fileName = res.data.tableFileUrl.substring(res.data.tableFileUrl.lastIndexOf("/") + 1);
            }
            let exit = res.data.tableFileUrl.substring(res.data.tableFileUrl.lastIndexOf(".") + 1);
            this.fileLinkToStreamDownload(res.data.tableFileUrl, fileName, exit);
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        });
        this.$confirm("是否导出当前日志列表包含的文件", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.$api.batchCompress(data).then(res => {
            console.log(res);
            if (res.code === 200) {
              // let fileUrls = res.data.join(",");
              // let fileList = res.data.map((item, index) => ({ fileUrl: item, fileName: "附件" + index }));
              // this.$api.compressFile({ fileName: "附件" + Date.now(), fileList }).then(res => {
              if (res.code === 200) {
                this.fileLinkToStreamDownload(res.data, this.$moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + "-施工日志-附件", "zip");
              } else {
                this.$message.warning(res.msg);
              }
              // });
              // res.data.forEach(item => {
              //   this.fileLinkToStreamDownload(item, item.substring(item.lastIndexOf("/") + 1), item.substring(item.lastIndexOf(".") + 1));
              // });
            }
          });
        });
      });
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
    },
    // 打印接口
    printFile() {
      this.$confirm("是否打印当前日志列表内容", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let data = { ...this.dialogSearchDate, fkItemIds: this.dialogSearchDate.fkItemIds.join(",") };
        delete data.weatherCode;
        delete data.temperature;
        this.loading = true;
        this.$api
          .printFile(data)
          .then(res => {
            console.log(res);
            if (res.code === 200) {
              printJs({ printable: res.data, type: "pdf" });
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      });
    },
    //下载
    downloadExcel(data, name) {
      let blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }); // type为所需要下载的文件格式
      if (window.navigator && window.navigator.msSaveBlob) {
        // IE浏览器、微软浏览器
        /* 经过测试，微软浏览器Microsoft Edge下载文件时必须要重命名文件才可以打开，
            IE可不重命名，以防万一，所以都写上比较好 */
        window.navigator.msSaveBlob(blob, "");
      } else {
        //其他浏览器
        let link = document.createElement("a"); // 创建a标签
        link.style.display = "none";
        let objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = "";
        link.click();
        URL.revokeObjectURL(objectUrl);
      }
    },
    // 触发上传input框
    uploading(row) {
      this.nowUploadObj = row;
      this.$refs.files.click();
    },
    // 删除附件
    removefile(row, idx) {
      console.log(row);
      this.delList.push(row.enclosureUrl);
      row.enclosures.splice(idx, 1);
    },
    delFiles() {
      let urls = [];
      if (this.type === 2) {
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
    // 弹框搜索按钮
    dialogSearch() {
      this.fileShow = false;
      this.searchJournal();
    },
    empty() {
      this.$refs.treeSelect.setTreeSelect([]);
      this.dialogSearchDate.time = "";
      this.dialogSearchDate.userId = "";
      this.dialogSearchDate.fkItemIds = [];
    },
    // 根据条件查询日志
    searchJournal() {
      let data = { ...this.dialogSearchDate, fkItemIds: this.dialogSearchDate.fkItemIds.join(",") };
      console.log(data);
      delete data.weatherCode;
      delete data.temperature;
      this.$api.searchJournal(data).then(res => {
        if (res.code === 200) {
          this.logList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
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
            _this.newAddList.push(path);
            _this.nowUploadObj.enclosures.push({ enclosureName: _this.$refs.files.files[0].name, enclosureUrl: path });
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
      if (this.nowUploadObj.enclosures.filter(item => item.enclosureName == filename).length) {
        return this.$message.warning("已有相同名字附件");
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
            console.log("res", res);
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          console.log("err", err);
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
    }
  }
};
</script>

<style lang="scss" scoped>
.header-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 0 10px;
  margin-bottom: 5px;
  .myform {
    align-items: center;
    margin-top: 20px;
  }
  .search {
    margin-top: 6px;
  }
}
.bd {
  border-bottom: 1px solid #606266;
}
.bgcnone {
  flex: 1;
  height: 500px;
  text-align: center;
  padding-top: 146px;
  margin: 0 auto;
  img {
    width: 200px;
    height: 100px;
  }
  p {
    font-size: 16px;
    color: #d2d6dd;
  }
}
.dialog-main {
  flex: 1;
  height: 520px;
  padding-left: 38px;
  overflow: auto;
  .item-content {
    width: 100%;

    /deep/ .el-textarea__inner {
      min-height: 200px !important;
      background-color: #f9f9ff;
      padding-bottom: 20px;
    }
    .inp-text {
      /deep/ .el-textarea__inner {
        // min-height: 380px !important;
      }
    }
  }
  .type1 {
    /deep/ .el-textarea__inner {
      background: linear-gradient(180deg, #fefeff 0%, #f9f9ff 100%);
    }
  }
  .title-file {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    padding-top: 10px;
    padding-bottom: 6px;
    background-color: #f9f9ff;
    span {
      width: 4px;
      height: 12px;
      background-color: #a9b2c4;
      margin-right: 3px;
    }
  }
  .dialog-main-item {
    margin-bottom: 28px;
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      .remove {
        cursor: pointer;
      }
    }
    .item-header2 {
      padding: 20px;
      background-color: #f9f9ff;
      display: flex;
      justify-content: space-between;
      color: #77839a;
      .date {
        font-weight: 600;
        margin-bottom: 20px;
        font-size: 16px;
        color: #203457;
      }
      .proName {
        margin-bottom: 14px;
      }
      img {
        margin-right: 6px;
      }
    }
    .item-bottom {
      width: 100%;
      // display: flex;
      // align-items: center;
      .uploadBtn {
        cursor: pointer;
        background-color: #f6f6f6;
        width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 3px;
        img {
          width: 16px;
        }
      }
    }
  }
}
.btns {
  // position: absolute;
  display: flex;
  justify-content: flex-end;
  // top: -57px;
  // right: 50px;
  // z-index: 1;
  .btns-item-export {
    text-align: center;
    line-height: 40px;
    width: 160px;
    height: 40px;
    opacity: 1;
    border-radius: 2px;
    background: rgba(24, 144, 255, 1);
    margin-right: 15px;
    color: #fff;
    font-size: 14px;
  }
  .btns-item-print {
    width: 240px;
    height: 40px;
    opacity: 1;
    line-height: 40px;
    text-align: center;
    border-radius: 2px;
    background: rgba(24, 144, 255, 1);
    color: #fff;
    font-size: 14px;
  }
}
.fileList {
  display: flex;
  flex-wrap: wrap;
  background-color: #f9f9ff;
  .el-icon-document-add {
  }
  .fileList-item {
    width: 300px;
    height: 28px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    margin-right: 4px;
    border: 1px solid rgba(225, 227, 232, 1);
    position: relative;
    .fileName {
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .delFile {
      cursor: pointer;
      color: #aaaaaa;
      margin-left: 8px;
      position: absolute;
      right: 8px;
    }
    .fileIcon {
      font-size: 20px;
    }
  }
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
/deep/ .el-dialog__header {
  text-align: left;
}
.el-button-primary-search {
  width: 300px;
  height: 40px;
  opacity: 1;
  border-radius: 2px;
  background: #2a82e4;
  margin-top: 20px;
  color: #ffffff;
  // color: rgba(27, 119, 224, 1);
}

.dialog-box {
  display: flex;
  margin: 40px 60px;
  .dialog-header {
    width: 340px;
    padding-right: 37px;
    border-right: 1px solid #aaaaaa;
    .details {
      width: 100%;
      margin-bottom: 40px;
      h6 {
        font-size: 26px;
        color: #203457;
        letter-spacing: 2px;
        margin-bottom: 25px;
      }
      p {
        font-size: 14px;
        color: #a6aebc;
      }
    }
    .label {
      width: 62px;
      color: #4d5d79;
      font-size: 14px;
      margin-right: 8px;
      text-align: right;
    }

    .dialog-header-item {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      .item-select {
        flex: 1;
      }
      /deep/ .el-input__inner {
        width: 100%;
        height: 40px;
        line-height: 40px;
        background-color: #f9f9ff;
      }
      /deep/ .sel-tag {
        max-width: 188px;
      }
    }
    .dialog-header-item2 {
      position: relative;
      display: flex;
      align-items: center;
      height: 28px;
      margin: 7px 10px;
    }
    .empty {
      background: none;
      color: #2a82e4;
      border: 1px solid #2a82e4;
    }
  }
}
.abolish {
  width: 100px;
  height: 40px;
  background-color: #eeeeee;
  color: #aaaaaa;
}
.conserve {
  width: 200px;
  height: 40px;
  // line-height: 40px;
  background-color: #2a82e4;
  font-size: 14px;
}
/deep/ .el-dialog__footer {
  text-align: right;
}
.pt10 {
  margin-top: 10px;
}
</style>
