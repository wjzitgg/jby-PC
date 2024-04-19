<!-- 保险 -->
<template>
  <div class="app-container">
    <div class="header-seach">
      <!-- <el-collapse-transition> -->
      <el-form :inline="true" :model="queryForm" class="search-mr formBox">
        <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)">
          <treeSelect @selectIds="selectIds"></treeSelect>
        </el-form-item>
        <el-form-item label="标段项目" label-width="70px" v-if="user.orgType == 7 && typeShow">
          <el-select size="mini" class="wh-200" v-model="queryForm.noProjectId" placeholder="请选择" @change="listByProjectId">
            <el-option v-for="(item, index) in noProjectData" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分包单位" label-width="70px" v-if="user.orgType != 7 && typeShow">
          <el-select size="mini" class="wh-200" v-model="queryForm.fkOrgId" placeholder="请选择" :disabled="subcontractorStatus" @change="subcontractorSelect">
            <el-option v-for="(item, index) in subcontractorData" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班组" label-width="70px" v-if="typeShow">
          <el-select size="mini" class="wh-200" v-model="queryForm.fkTeamId" placeholder="请选择" :disabled="groupStatus">
            <el-option v-for="item in teamSpinner" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="保险类型" label-width="70px" v-if="typeShow">
          <el-select class="wh-200" size="mini" v-model="queryForm.insureType" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="社保" value="1"></el-option>
            <el-option label="意外险" value="2"></el-option>
            <el-option label="其他" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="有效期限" label-width="70px" v-if="typeShow">
          <el-date-picker value-format="yyyy-MM-dd" size="mini" v-model="queryForm.beginTime" type="date" class="wh-200" clearable placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="至" label-width="" v-if="typeShow">
          <el-date-picker value-format="yyyy-MM-dd" :picker-options="queryOptionsEnd" size="mini" class="wh-200" v-model="queryForm.endTime" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="劳务人员" label-width="70px" v-if="typeShow">
          <el-input size="mini" v-model="queryForm.userName" class="wh-200" autocomplete="off" maxlength="25"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" label-width="70px" v-if="typeShow">
          <el-input size="mini" class="wh-200" @keydown.native="keyDown($event, 1)" type="number" oninput="if(value.length>11)value=value.slice(0, 11)" v-model="queryForm.telephone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label-width="1px" style="margin: 0px" v-if="typeShow">
          <el-button type="primary" class="el-button-primary" size="mini" v-has="'work:insurance:query'" @click.native="search">查询</el-button>
          <el-button v-if="user.orgType == 7" type="primary" class="el-button-primary" size="mini" v-has="'work:insurance:add'" @click="addInsurance">新增保险</el-button>
        </el-form-item>
      </el-form>
      <!-- </el-collapse-transition> -->
    </div>
    <div class="tab-container" v-if="typeShow">
      <div class="table-data" style="margin-top: 10px" :style="{ height: [2, 3, 9, 7].includes(user.orgType) ? '80%' : '88%' }">
        <el-table :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="userName" label="劳务人员" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="insureType" label="保险类型" min-width="90">
            <template slot-scope="scope">
              <div v-if="scope.row.insureType == 1">社保</div>
              <div v-if="scope.row.insureType == 2">意外险</div>
              <div v-if="scope.row.insureType == 3">其他</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="cardNum" label="身份证" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="telephone" label="手机号码" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="endTime" label="保险有效期限" min-width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.beginTime }}</span
              >至 <span>{{ scope.row.endTime }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column align="center" prop="projectName" v-if="user.orgType != 5 && user.orgType != 7" label="项目" min-width="90"> </el-table-column> -->
          <!-- <el-table-column align="center" prop="projectBidName" v-if="user.orgType != 5" label="标段项目" min-width="90"> </el-table-column> -->
          <el-table-column align="center" prop="orgName" v-if="user.orgType != 7" label="所属分包单位" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="teamName" label="所属班组" min-width="90"> </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" fixed="right" min-width="130">
            <template slot-scope="scope">
              <el-button plain size="mini" type="primary" @click.native="examine(scope.row)">查看</el-button>
              <el-button plain v-if="user.orgType == 7" type="warning" size="mini" v-has="'work:insurance:update'" @click.native="edit(scope.row)">编辑</el-button>
              <el-button plain v-if="user.orgType == 7" type="danger" size="mini" v-has="'work:insurance:delete'" @click.native="batchDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
      </div>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <el-dialog top="8vh" :title="showTitle" :visible.sync="show" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading" @close="close1">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules" class="dialog-form" :hide-required-asterisk="asterisk">
        <el-row>
          <el-col :span="24">
            <el-form-item label="劳务人员" prop="userName" :label-width="formLabelWidth">
              <el-input size="mini" disabled v-model="ruleForm.userName" autocomplete="off">
                <el-button slot="append" v-if="showTitle != '保险信息'" icon="el-icon-user-solid" :disabled="showTitle == '编辑保险'" @click="personnel"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="身份证号" prop="cardNum" :label-width="formLabelWidth">
              <el-input size="mini" disabled v-model="ruleForm.cardNum" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="手机号码" prop="telephone" :label-width="formLabelWidth">
              <el-input size="mini" disabled v-model="ruleForm.telephone" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="标段项目" prop="projectName" :label-width="formLabelWidth">
              <el-input size="mini" disabled v-model="ruleForm.projectBidName" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="班组" prop="teamName" :label-width="formLabelWidth">
              <el-input size="mini" disabled v-model="ruleForm.teamName" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="保险类型" prop="insureType" :label-width="formLabelWidth">
              <el-select size="mini" :disabled="showTitle == '保险信息'" v-model="ruleForm.insureType" placeholder="请选择" style="width: 100%">
                <el-option label="社保" value="1"></el-option>
                <el-option label="意外险" value="2"></el-option>
                <el-option label="其他" value="3"></el-option>
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="有效期限" prop="beginTime" :label-width="formLabelWidth"> <el-date-picker size="mini" value-format="yyyy-MM-dd" :disabled="showTitle == '保险信息'" style="width: 100%" v-model="ruleForm.beginTime" type="date" placeholder="选择日期"></el-date-picker> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="至" prop="endTime" :label-width="formLabelWidth">
              <el-date-picker size="mini" value-format="yyyy-MM-dd" :picker-options="pickerOptionsEnd" :disabled="showTitle == '保险信息'" style="width: 100%" v-model="ruleForm.endTime" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="购买日期" prop="purchaseTime" :label-width="formLabelWidth"> <el-date-picker size="mini" value-format="yyyy-MM-dd" :disabled="showTitle == '保险信息'" style="width: 100%" v-model="ruleForm.purchaseTime" type="date" placeholder="选择日期"></el-date-picker> </el-form-item
          ></el-col>
          <el-col :span="24">
            <el-form-item label="附件" :label-width="formLabelWidth" v-if="fileList.length != 0 || showTitle != '保险信息'">
              <div>
                <el-button v-if="showTitle != '保险信息'" size="small" class="el-button-primary" type="primary" @click="uploading">点击上传</el-button>
                <div class="upLoad-show">
                  <p v-for="(item, idx) in fileList" :key="idx">
                    <span>{{ item.name }}</span>
                    <el-button size="mini" @click="imgPreview(item)">预览</el-button>
                    <span v-if="showTitle != '保险信息'">
                      <el-button size="mini" style="color: red; border: none" icon="el-icon-close" @click="remove(item, idx)"></el-button>
                    </span>
                  </p>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="showTitle != '保险信息'">
        <el-button size="mini" @click="close1">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="submit('ruleForm')">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择劳务人员" width="90%" :visible.sync="serviceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="team-show-header">
          <el-collapse-transition>
            <el-form :inline="true" :model="teamShowQuery" class="search-mr formBox2">
              <el-form-item label="标段项目" label-width="70px">
                <el-select size="mini" v-model="teamShowQuery.fkProjectId" placeholder="请选择" @change="selectProject">
                  <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="班组" label-width="70px">
                <el-select size="mini" v-model="teamShowQuery.fkTeamId" placeholder="请选择" :disabled="disabledStatus2">
                  <el-option v-for="item in teamSpinner" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="入职时间" label-width="70px">
                <el-date-picker value-format="yyyy-MM-dd" size="mini" style="width: 100%" v-model="teamShowQuery.startTime" type="date" placeholder="选择日期"></el-date-picker>
              </el-form-item>
              <el-form-item label="至">
                <el-date-picker value-format="yyyy-MM-dd" size="mini" style="width: 100%" v-model="teamShowQuery.behindTime" type="date" placeholder="选择日期"></el-date-picker>
              </el-form-item>
              <el-form-item label="劳务人员" label-width="70px">
                <el-input size="mini" v-model="teamShowQuery.userName" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="手机号码" label-width="70px">
                <el-input size="mini" v-model="teamShowQuery.telephone" autocomplete="off" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
              </el-form-item>
              <el-form-item label-width="1px">
                <el-button type="primary" class="el-button-primary" size="mini" @click.native="serviceSearch">查询</el-button>
              </el-form-item>
            </el-form>
          </el-collapse-transition>
        </div>
        <div style="margin-top: 20px">
          <el-table
            :data="serviceStaff"
            stripe
            height="500px"
            style="width: 100%"
            v-loading="loading"
            :header-cell-style="{
              background: '#f1f6ff',
              'text-align': 'center'
            }"
            :cell-style="{ align: 'center' }"
          >
            <el-table-column prop="alarmLevel" label="选择" align="center" min-width="80">
              <template slot-scope="scope">
                <el-button size="mini" @click.native="selectServices(scope.row)">选择</el-button>
              </template>
            </el-table-column>
            <el-table-column align="center" label="序号" min-width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (teamShowQuery.pageNum - 1) * teamShowQuery.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="teamName" label="所属班组" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="userName" label="劳务人员" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="cardNum" label="身份证" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="telephone" label="手机号码" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="inductionTime" label="入职日期" min-width="90"> </el-table-column>
            <!-- <el-table-column align="center" prop="resignationTime" label="离职日期" min-width="90"> </el-table-column> -->
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <table-paging :current-page="teamShowQuery.pageNum" :page-size="teamShowQuery.pageSize" :total="teamShowQuery.totalCount" @handleSizeChange="teamShowSize" @handleCurrentChange="teamShowpageCurrent"></table-paging>
        </div>
      </div>
    </el-dialog>
    <!-- 凭证预览 -->
    <el-dialog title="预览" width="500px" :visible.sync="imgShow" v-dialogDrag :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading">
      <div>
        <img width="100%" :src="imgUrl" alt="" />
      </div>
    </el-dialog>
    <input v-show="false" type="file" accept="image/*" ref="files" id="upload" @change="upLoad" />
  </div>
</template>
<script>
import moment from "moment";
import COS from "cos-js-sdk-v5";
import treeSelect from "../../components/proTreeSelect/treeSelect.vue";
export default {
  components: { treeSelect },
  data() {
    return {
      totalCount: 0,
      tableData: [],
      loading: false,
      formLabelWidth: "110px",
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      ruleForm: {
        userName: "",
        cardNum: "",
        telephone: "",
        projectBidName: "",
        teamName: "",
        fkMemberId: "",
        beginTime: "",
        endTime: "",
        enclosureUrl: "",
        insureType: "",
        purchaseTime: ""
      },
      show: false,
      rules: {
        userName: [
          {
            required: true,
            message: "点击右边按钮选择劳务人员",
            trigger: ["change", "blur"]
          }
        ],
        insureType: [
          {
            required: true,
            message: "选择保险类型",
            trigger: ["change", "blur"]
          }
        ],
        beginTime: [
          {
            required: true,
            message: "请选择有效期限",
            trigger: ["change", "blur"]
          }
        ],
        endTime: [
          {
            required: true,
            message: "请选择有效期限",
            trigger: ["change", "blur"]
          }
        ],
        purchaseTime: [
          {
            required: true,
            message: "请选择购买日期",
            trigger: ["change", "blur"]
          }
        ]
      },
      options: [],
      showTitle: "",
      teamSpinner: [{ label: "全部", value: "" }], // 班组下拉
      serviceStaff: [], // 劳务人员
      serviceShow: false,
      teamShowQuery: {
        // 劳务人员查询条件
        pageNum: 1,
        pageSize: 10,
        fkProjectId: "",
        fkTeamId: "",
        userName: "",
        telephone: "",
        beginTime: "",
        endTime: ""
      },
      queryForm: {
        beginTime: "",
        endTime: "",
        fkProjectId: "",
        fkTeamId: "",
        fkOrgId: "",
        insureType: "",
        userName: "",
        telephone: "",
        noProjectId: "",
        projectId: ""
      },
      user: {},
      subcontractorData: [{ label: "全部", value: "" }], // 分包单位下拉
      noProjectData: [{ label: "全部", value: "" }], // 标段项目
      imgShow: false,
      imgUrl: "",
      pickerOptionsEnd: {
        disabledDate: time => {
          if (this.ruleForm.beginTime) {
            let d;
            if (typeof this.ruleForm.beginTime == "string") {
              d = new Date(this.ruleForm.beginTime).getTime();
            } else {
              d = this.ruleForm.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      queryOptionsEnd: {
        disabledDate: time => {
          if (this.queryForm.beginTime) {
            let d;
            if (typeof this.queryForm.beginTime == "string") {
              d = new Date(this.queryForm.beginTime).getTime();
            } else {
              d = this.queryForm.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      fileList: [],
      disabledStatus2: true,
      projectStatus: false, // 控制标段项目不能选择
      subcontractorStatus: true, // 控制分包单位不能选择
      groupStatus: true, // 控制班组不能选择
      asterisk: true, // 控制表单的from的校验星号
      newAddList: [],
      delList: [],
      typeShow: true
    };
  },
  created() {
    this.user = JSON.parse(sessionStorage.getItem("user"));
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        // 如果是建设、监理、设计院才隐藏下面的
        if (this.user.orgType == 2 || this.user.orgType == 3 || this.user.orgType == 9) {
          this.projectStatus = true;
        }
        // 分包单位、施工、供应商展示标段项目
        if (this.user.orgType == 4 || this.user.orgType == 6 || this.user.orgType == 7) {
          // 获取标段项目，标段项目下拉选择获取班组
          this.listByProjectId();
        }
        if (this.user.orgType == 5) {
          this.subcontractorStatus = false;
          this.subcontractor();
        }
        this.insuranceSearchPage();
        // this.listByProjectId();
        this.noProject();
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  watch: {
    imgShow(val) {
      if (val == false) {
        this.imgUrl = "";
      }
    },
    serviceShow(val) {
      if (val == false) {
        this.teamShowQuery = {
          pageNum: 1,
          pageSize: 10,
          fkProjectId: "",
          fkTeamId: "",
          userName: "",
          telephone: "",
          beginTime: "",
          endTime: ""
        };
      }
    },
    show(val) {
      if (!val) {
        this.delFiles();
      }
    }
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      this.queryForm.fkOrgId = ""; // 分包单位为空
      this.subcontractorData.unshift({ label: "全部", value: "" });
      this.groupStatus = true;
      if (arr.length) {
        if (arr.length > 1) {
          this.queryForm.projectId = arr[0];
          this.queryForm.noProjectId = arr[1];
        } else {
          this.queryForm.noProjectId = arr[0];
        }
        this.listByProjectId(this.queryForm.noProjectId);
        if (isTrue) {
          this.search();
        }
      }
    },
    close1() {
      this.delList = [];
      this.show = false;
    },
    // 删除附件
    delFiles() {
      let urls = [];
      if (this.showTitle.indexOf("新增") !== -1) {
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
    // 标段项目下拉选择
    selectProject(data) {
      if (data) {
        this.disabledStatus2 = false;
      } else {
        this.disabledStatus2 = true;
        // this.teamShowQuery.fkTeamId = "";
      }
      this.$api.listByProjectId({ projectId: this.queryForm.noProjectId, fkOrgId: this.queryForm.fkOrgId }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.teamName;
            item.value = item.pkId;
          });
          if (this.teamShowQuery.fkTeamId != undefined && this.teamShowQuery.fkTeamId != null) {
            this.teamShowQuery.fkTeamId = "";
          }
          this.teamSpinner = res.data;
          this.teamSpinner.unshift({ label: "全部", value: "" });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 上传
    uploading() {
      this.$refs.files.click();
    },
    // 移除凭证
    remove(item, idx) {
      this.delList.push(item.path);
      this.fileList.splice(idx, 1);
    },
    // 凭证预览
    imgPreview(item) {
      this.imgUrl = "";
      this.imgUrl = item.path;
      this.imgShow = true;
    },
    personnel() {
      if (this.showTitle == "编辑保险") return;
      this.serviceShow = true;
      this.crewSearchPage();
    },
    // 劳务人员查询
    serviceSearch() {
      this.teamShowQuery.pageNum = 1;
      this.teamShowQuery.pageSize = 10;
      this.crewSearchPage();
    },
    crewSearchPage() {
      this.$api.crewSearchPage({ ...this.teamShowQuery, dismissalStatus: 0 }).then(res => {
        if (res.code == 200) {
          console.log(res);
          this.serviceStaff = res.data.records;
        }
      });
    },
    // 选择劳务人员
    selectServices(row) {
      this.ruleForm.userName = row.userName;
      this.ruleForm.cardNum = row.cardNum;
      this.ruleForm.telephone = row.telephone;
      this.ruleForm.projectBidName = row.projectBidName;
      this.ruleForm.teamName = row.teamName;
      this.ruleForm.fkMemberId = row.pkId;
      this.serviceShow = false;
    },
    // 劳务人员页数改变事件
    teamShowSize(pageSize) {
      this.teamShowQuery.pageSize = pageSize;
      this.crewSearchPage();
    },
    // 劳务人员页码改变事件
    teamShowpageCurrent(currentPage) {
      this.teamShowQuery.pageNum = currentPage;
      this.crewSearchPage();
    },
    // 班组下拉
    listByProjectId() {
      let id = "";
      // 标段项目如果不是全部
      if (this.queryForm.noProjectId != "") {
        id = this.queryForm.noProjectId;
        if (this.user.orgType == 4 || this.user.orgType == 6 || this.user.orgType == 7) {
          this.groupStatus = false; // 班组展示
        } else {
          this.subcontractorStatus = false; // 分包单位展示
        }
      }
      if (this.queryForm.noProjectId == "") {
        id = "";
        this.groupStatus = true;
        this.subcontractorStatus = true;
        this.queryForm.fkOrgId = ""; // 分包单位为空
        this.queryForm.fkTeamId = ""; // 班组清空
        return;
      }
      if ([2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
        // 根据标段项目获取分包单位下拉列表
        this.subcontractorList(id);
      } else {
        // 4 6 7情况
        this.$api.listByProjectId({ projectId: this.queryForm.noProjectId, fkOrgId: this.queryForm.fkOrgId }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.teamName;
              item.value = item.pkId;
            });
            if (this.queryForm.fkTeamId != undefined && this.queryForm.fkTeamId != null) {
              this.queryForm.fkTeamId = "";
            }
            this.teamSpinner = res.data; // 班主下拉列表
            this.teamSpinner.unshift({ label: "全部", value: "" });
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    // 根据标段项目获取分包单位下拉列表
    subcontractorList(id) {
      this.$api.searchByProjectIds({ projectId: id, customType: 4 }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.fkLinkOrgId;
          });
          this.subcontractorData = res.data;
          this.subcontractorData.unshift({ value: "", label: "全部" });
        }
      });
    },
    // 项目部登录时候，分包单位下拉列表选择
    subcontractorSelect(id) {
      if (id) {
        this.groupStatus = false;
        this.$api.listByProjectId({ projectId: this.queryForm.noProjectId, fkOrgId: this.queryForm.fkOrgId }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.teamName;
              item.value = item.pkId;
            });
            if (this.queryForm.fkTeamId != undefined && this.queryForm.fkTeamId != null) {
              this.queryForm.fkTeamId = "";
            }
            this.teamSpinner = res.data; // 班主下拉列表
            this.teamSpinner.unshift({ label: "全部", value: "" });
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        // id等于空的时候
        this.groupStatus = true;
        this.queryForm.fkTeamId = "";
      }
    },
    // 项目下拉列表
    noProject() {
      this.$api.getItemListNoUserId({ isWhole: 1, projectId: "" }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          if (this.user.orgType == 7 || this.user.orgType == 4) {
            this.noProjectData = res.data;
            this.noProjectData.unshift({ value: "", label: "全部" });
          } else {
            this.options = res.data;
            this.options.unshift({ value: "", label: "全部" });
            this.noProjectData.unshift({ value: "", label: "全部" });
          }
        }
      });
    },
    // 项目部分部商下拉列表
    subcontractor() {
      this.$api.searchLinkOrgId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.fkLinkOrgId;
          });
          this.subcontractorData = res.data;
          this.subcontractorData.unshift({ value: "", label: "全部" });
        }
      });
    },
    // 根据项目id获取标段项目下拉列表
    projectIdChange(val) {
      this.queryForm.noProjectId = "";
      const data = {};
      if (val.length == 0) {
        data.isWhole = 1;
        data.projectId = val;
        this.projectStatus = true;
        this.subcontractorStatus = true;
        this.groupStatus = true;
        this.queryForm.noProjectId = ""; // 清空标段项目
        this.queryForm.fkOrgId = ""; // 分包单位为空
        this.queryForm.fkTeamId = ""; // 班组清空
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
          this.noProjectData.unshift({ value: "", label: "全部" });
        }
      });
    },
    insuranceSearchPage() {
      this.loading = true;
      this.$api
        .insuranceSearchPage(this.listQuery)
        .then(res => {
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
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.insuranceSearchPage();
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.insuranceSearchPage();
    },
    search() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 10
      };

      if (this.queryForm.endTime != null && this.queryForm.endTime.length != 0) {
        this.listQuery.endTime = moment(this.queryForm.endTime).format("YYYY-MM-DD HH:mm:ss");
      } else {
        this.listQuery.endTime = this.queryForm.endTime;
      }
      if (this.queryForm.beginTime != null && this.queryForm.beginTime.length != 0) {
        this.listQuery.beginTime = moment(this.queryForm.beginTime).format("YYYY-MM-DD HH:mm:ss");
      } else {
        this.listQuery.beginTime = this.queryForm.beginTime;
      }
      this.listQuery.fkTeamId = this.queryForm.fkTeamId;
      this.listQuery.fkOrgId = this.queryForm.fkOrgId;
      this.listQuery.insureType = this.queryForm.insureType;
      this.listQuery.userName = this.queryForm.userName;
      this.listQuery.telephone = this.queryForm.telephone;
      this.listQuery.fkProjectId = this.queryForm.projectId;
      this.listQuery.fkProjectBidId = this.queryForm.noProjectId;
      this.insuranceSearchPage();
    },
    addInsurance() {
      this.showTitle = "新增保险";
      Object.keys(this.ruleForm).forEach(key => {
        this.ruleForm[key] = "";
      });
      this.fileList = [];
      this.show = true;
      this.$nextTick(() => {
        this.$refs.ruleForm.clearValidate();
      });
    },
    examine(row) {
      this.fileList = [];
      this.$api.insuranceFindById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          console.log(res);
          this.showTitle = "保险信息";
          this.show = true;
          this.fileList = JSON.parse(res.data.enclosureUrl);
          this.ruleForm = res.data;
          this.ruleForm.insureType = this.ruleForm.insureType + "";
        } else {
          this.$message.warning(res.msg);
        }
      });
    },

    edit(row) {
      this.fileList = [];
      this.$api.insuranceFindById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.showTitle = "编辑保险";
          this.show = true;
          this.fileList = JSON.parse(res.data.enclosureUrl);
          this.ruleForm = res.data;
          this.ruleForm.insureType = this.ruleForm.insureType + "";
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    batchDelete(row) {
      this.$confirm("确定删除该保险信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.insuranceDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.insuranceSearchPage();
            } else {
              this.$message({
                type: "warning",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.fileList.length < 1) {
            return this.$message.warning("请上传附件");
          }
          const url = JSON.stringify(this.fileList);
          const data = {
            beginTime: moment(this.ruleForm.beginTime).format("YYYY-MM-DD HH:mm:ss"),
            enclosureUrl: url,
            endTime: moment(this.ruleForm.endTime).format("YYYY-MM-DD HH:mm:ss"),
            fkMemberId: this.ruleForm.fkMemberId,
            insureType: this.ruleForm.insureType,
            purchaseTime: moment(this.ruleForm.purchaseTime).format("YYYY-MM-DD HH:mm:ss")
          };
          this.loading = true;
          if (this.showTitle != "编辑保险") {
            this.$api
              .insuranceAdd(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "新增成功"
                  });
                  this.newAddList = [];
                  this.insuranceSearchPage();
                  this.show = false;
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
            data.pkId = this.ruleForm.pkId;
            this.$api
              .insuranceUpdate(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "编辑成功"
                  });
                  this.newAddList = [];
                  this.insuranceSearchPage();
                  this.show = false;
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
            const imgIdx = path.lastIndexOf("com/");
            const imgName = path.substring(imgIdx + 4, path.length);
            _this.fileList.push({ name: imgName, path });
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

    // 排序值禁止输入事件
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
.header-search {
  position: relative;

  .add-btn {
    position: absolute;
    top: 12px;
    right: 8px;
  }
}

.search-bar-demo {
  /deep/ .el-date-editor--daterange {
    width: 270px !important;
  }
}

// /deep/ .datetime-end {
//   .el-form-item__label {
//     width: 2em !important;
//   }
// }

// /deep/ .el-dialog__header {
//   background: #f3f3f3;
// }
.team-show-header {
  margin-top: 20px;
}

.upLoad-show {
  max-height: 80px;
  overflow: auto;
}

::-webkit-scrollbar {
  width: 5px;
  color: #fff;
  background-color: #fcfcfc;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}

.wh-150 {
  width: 150px;
}

.header-seach {
  background-color: #fff;
  padding-top: 20px;
  padding-left: 10px;
  border-radius: 5px;
  .wh-100 {
    width: 200px;
  }
  //    .el-form--inline .el-form-item {
  //   width: 15.5vw;
  // }
  // /deep/ .el-input__inner{
  //   width: auto !important;
  // }
  // /deep/ .el-input__suffix{
  //   right: -83px;
  // }
}

.formBox {
  display: flex;
  flex-wrap: wrap;
  width: 1600px;
}
.formBox2 {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
</style>
