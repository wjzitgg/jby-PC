<!-- 班组管理 -->
<template>
  <div class="app-container">
    <div class="hader-search">
      <search-bar class="search-bar-demo" @search="search" :options="searchOptions" :total="totalCount" labelWidth="8em" ref="searchBar" :showHandler="false"></search-bar>
      <div class="hader-btn">
        <el-button type="primary" class="el-button-primary" size="mini" @click="teamType">管理班组类别</el-button>
        <el-button type="primary" class="el-button-primary" size="mini" @click="addTeam">创建班组</el-button>
        <el-button type="primary" class="el-button-primary" size="mini" @click="invitationCode">新增人员邀请码</el-button>
      </div>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height:88%;margin-top: 10px;">
        <el-table :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="fkProjectName" label="标段项目" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="teamName" label="班组名称" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="leaderName" label="负责人" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="leaderPhone" label="负责人手机号码" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="number" label="班组人数" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="fkClassName" label="班组类别" min-width="100"> </el-table-column>
          <el-table-column align="center" prop="remark" label="备注" min-width="80" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" min-width="140">
            <template slot-scope="scope">
              <el-button plain type="primary" size="mini" @click.native="examine(scope.row)">查看</el-button>
              <el-button plain type="warning" size="mini" @click.native="edit(scope.row)">编辑</el-button>
              <el-button plain type="danger" size="mini" @click.native="batchDelete(scope.row)">删除</el-button>
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
    <!-- 管理班组类别 -->
    <el-dialog title="班组类别" :visible.sync="show" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="team-show-header">
          <span>类别名称</span>
          <el-input style="display: inline-block; width: 200px;" v-model="teamShowQuery.className" size="mini" autocomplete="off"></el-input>
          <el-button size="mini" type="primary" icon="el-icon-search" class="el-button-primary" @click="teamShowSearch">查询</el-button>
          <div class="team-show-btn">
            <el-button type="primary" class="el-button-primary" size="mini" @click="teamShowAdd">创建班组类别</el-button>
          </div>
        </div>
        <div style="margin-top:20px">
          <el-table
            :tooltip-effect="'light'"
            :data="teamShowData"
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
            <el-table-column align="center" label="序号" min-width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (teamShowQuery.pageNum - 1) * teamShowQuery.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="className" label="类别名称" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="sortval" label="排序值" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="remark" label="备注" min-width="90" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="alarmLevel" label="详情" align="center" min-width="140">
              <template slot-scope="scope">
                <el-button plain type="primary" size="mini" @click.native="teamShowExamine(scope.row)">查看</el-button>
                <el-button plain type="warning" size="mini" @click.native="teamShowEdit(scope.row)">编辑</el-button>
                <el-button plain type="danger" size="mini" @click.native="teamShowDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <table-paging :current-page="teamShowQuery.pageNum" :page-size="teamShowQuery.pageSize" :total="teamShowQuery.totalCount" @handleSizeChange="teamShowSize" @handleCurrentChange="teamShowpageCurrent"></table-paging>
        </div>
      </div>
    </el-dialog>
    <!-- 班组类型详情 -->
    <el-dialog :title="teanTypeTitle" width="500px" :visible.sync="teanTypeShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules" class="dialog-form">
        <el-form-item label="类别名称" prop="className" label-width="80px">
          <el-input size="mini" v-model="ruleForm.className" :disabled="teanTypeTitle == '班组类别详情'" maxlength="25" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="排序值" prop="sortval" label-width="80px">
          <el-input size="mini" :disabled="teanTypeTitle == '班组类别详情'" v-model.trim="ruleForm.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="keyDown"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark" label-width="80px">
          <el-input size="mini" :disabled="teanTypeTitle == '班组类别详情'" v-model="ruleForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="teanTypeTitle != '班组类别详情'">
        <el-button size="mini" @click="teanTypeShow = false">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="submitForm('ruleForm')">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 新增班组 -->
    <el-dialog :title="teanTypeTitle" width="500px" :visible.sync="teamShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="teamForm" ref="teamForm" :rules="rules" class="dialog-form">
        <el-form-item label="班组名称" prop="teamName" :label-width="formLabelWidth">
          <el-input size="mini" v-model="teamForm.teamName" :disabled="teanTypeTitle == '班组详情'" maxlength="25" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属标段" prop="fkProjectId" :label-width="formLabelWidth">
          <el-input size="mini" v-model="teamForm.fkProjectName" disabled v-if="teanTypeTitle == '班组详情' || relationStatus == '0'" autocomplete="off"></el-input>
          <el-select size="mini" v-model="teamForm.fkProjectId" placeholder="请选择" style="width: 100%" v-else :disabled="teanTypeTitle == '班组详情' || relationStatus == '0'">
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班组类别" prop="fkClassId" :label-width="formLabelWidth">
          <el-select size="mini" v-model="teamForm.fkClassId" placeholder="请选择" style="width: 100%" :disabled="teanTypeTitle == '班组详情'">
            <el-option v-for="item in teamCategoryData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="leaderName" :label-width="formLabelWidth">
          <el-input size="mini" v-model="teamForm.leaderName" :disabled="teanTypeTitle == '班组详情' || teanTypeTitle == '编辑班组'" autocomplete="off" maxlength="25"></el-input>
        </el-form-item>
        <el-form-item label="负责人手机" prop="leaderPhone" :label-width="formLabelWidth">
          <el-input size="mini" v-model="teamForm.leaderPhone" type="number" @keydown.native="keyDown" oninput="if(value.length>11)value=value.slice(0, 11)" :disabled="teanTypeTitle == '班组详情' || teanTypeTitle == '编辑班组'" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="menuName" :label-width="formLabelWidth" v-show="teanTypeTitle != '班组详情' && teanTypeTitle != '新增班组'">
          <div style="text-align: right;">
            <el-button size="mini" @click="selectPersonnel">调整人员</el-button>
          </div>
        </el-form-item>
        <el-form-item label="班组人员" prop="users" :label-width="formLabelWidth" v-show="teanTypeTitle != '新增班组'">
          <el-input size="mini" disabled v-model="teamForm.users" type="textarea" style="resize: none" :rows="5" maxlength="100" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark" :label-width="formLabelWidth" style="margin-top: 10px;">
          <el-input size="mini" :disabled="teanTypeTitle == '班组详情'" v-model="teamForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="teanTypeTitle != '班组详情'">
        <el-button size="mini" @click="teamShow = false">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="submitTeamForm('teamForm')">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 选择人员 -->
    <el-dialog title="选择人员" class="team-people-show" :visible.sync="teamPeopleShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <el-table
          :data="teamPeopleData"
          stripe
          height="460px"
          style="width: 100%"
          v-loading="loading"
          :header-cell-style="{
            background: '#f1f6ff',
            'text-align': 'center'
          }"
          :cell-style="{ align: 'center' }"
        >
          <el-table-column prop="alarmLevel" label="操作" align="center" min-width="140">
            <template slot-scope="scope">
              <el-radio @change="principal(scope.row)" :label="scope.row.pkId" v-model="principalRadio">设为负责人</el-radio>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="userName" label="劳务人员" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="cardNum" label="身份证号码" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="telephone" label="手机号码" min-width="90"> </el-table-column>

          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <div class="btn-box">
          <el-button type="primary" class="el-button-primary" size="mini" @click.native="selectSave">确定</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 邀请码 -->
    <el-dialog title="新增人员邀请码" class="team-people-show" width="360px" :visible.sync="inviteShow" v-dialogDrag @close="inviteShowclose" :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form" v-if="type == 1">
        <el-form class="invite-form " :rules="rules">
          <el-form-item label="合同模板" prop="fkTemplateId" label-width="110px">
            <el-select size="mini" v-model="inviteForm.fkTemplateId" @change="pactDataChange" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in pactData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="加入班组" prop="fkTeamId" label-width="110px">
            <el-select size="mini" v-model="inviteForm.fkTeamId" @change="teamSpinnerChange" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in teamSpinner" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="签署截止时间" prop="deadline" label-width="110px">
            <!-- <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" size="mini" style="width: 100%" v-model="inviteForm.deadline"
              type="datetime" @change="deadlineChange" placeholder="选择日期"></el-date-picker> -->
            <div style="display:flex">
              <el-date-picker v-model="time1" size="mini" :picker-options="pickerOption" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" style="width:50%" @change="timeChange1"> </el-date-picker>
              <el-time-select placeholder="选择时间" size="mini" value-format="HH:mm:ss" v-model="time2" :disabled="!time1" :picker-options="pickerOption2" style="width:50%" @change="deadlineChange"> </el-time-select>
            </div>
          </el-form-item>
        </el-form>
        <div v-if="inviteForm.fkTemplateId.length != 0 && inviteForm.fkTeamId.length != 0 && this.inviteForm.deadline != null" style="display:flex;justify-content: center;text-align: center;margin-top: 10px;padding:5px;padding-top:30px;border: 1px solid #fad5a2;position: relative;">
          <el-checkbox v-model="checked" @change="checkChange" class="checked">同步扫码结果</el-checkbox>
          <div ref="qrcode" id="qrcode"></div>
          <div class="codeOk" v-if="codeOk">
            <i class="el-icon-circle-check iconColor mb-20"></i>
            <div class="mb-60">扫描成功</div>
            <div>请在手机上根据提示操作</div>
            <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
          </div>
        </div>
      </div>
      <unnamed :type="unnamedType" :appendToBody="true" @resh="resh" v-else></unnamed>
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";
import QRCode from "qrcodejs2";
import unnamed from "../org/compoments/unnamed.vue";
export default {
  name: "teamList",
  components: { QRCode, unnamed },
  data() {
    return {
      time1: "",
      time2: "",
      pickerOption: {
        disabledDate: date => {
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        }
      },
      pickerOption2: {
        start: "00:00",
        step: "00:30",
        end: "23:30",
        minTime: "",
        maxTime: ""
      },
      searchOptions: [
        {
          type: "select",
          prop: "fkProjectId",
          value: "",
          title: "标段项目",
          options: []
        },
        {
          type: "select",
          prop: "fkClassId",
          value: "",
          title: "班组类别",
          options: []
        },
        {
          type: "input",
          prop: "leaderName",
          value: "",
          title: "负责人",
          placeholder: "负责人",
          maxlength: "25"
        },
        {
          type: "inputPhone",
          prop: "leaderPhone",
          value: "",
          title: "手机号码",
          placeholder: "手机号码"
        }
      ],
      totalCount: 0,
      tableData: [],
      loading: false,
      formLabelWidth: "110px",
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      show: false,
      parentMenu: [{ a1: "1" }],
      teamShowQuery: {
        pageNum: 1,
        pageSize: 10,
        className: "",
        totalCount: 0
      },
      teamShowData: [],
      teanTypeShow: false,
      ruleForm: {
        className: null, // 班组类别名称
        sortval: null, // 排序值
        remark: null // 备注
      },
      teanTypeTitle: "班组类别",
      rules: {
        sortval: [
          {
            required: true,
            message: "排序值",
            trigger: ["change", "blur"]
          }
        ],
        teamName: [
          {
            required: true,
            message: "班组名称",
            trigger: ["change", "blur"]
          }
        ],
        fkProjectId: [
          {
            required: true,
            message: "所属标段",
            trigger: ["change", "blur"]
          }
        ],
        fkClassId: [
          {
            required: true,
            message: "班组类别",
            trigger: ["change", "blur"]
          }
        ],
        leaderName: [
          {
            required: true,
            message: "负责人",
            trigger: ["change", "blur"]
          }
        ],
        leaderPhone: [
          {
            required: true,
            message: "负责人手机",
            trigger: ["change", "blur"]
          },
          {
            pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
            message: "手机号格式错误",
            trigger: ["change", "blur"]
          }
        ],
        btPermissions: [
          {
            required: true,
            validator: this.$rules.btPermissions,
            trigger: ["change", "blur"]
          }
        ],
        className: [
          {
            required: true,
            message: "类别名称",
            trigger: ["change", "blur"]
          }
        ]
      },
      teamShow: false,
      teamPeopleShow: false,
      teamPeopleQuery: {
        pageNum: 1,
        pageSize: 10,
        name: "",
        totalCount: 0,
        shouji: ""
      },
      teamPeopleData: [],
      joinTeamDate: [],
      teamForm: {
        fkClassId: null, // 班组类别
        fkProjectId: null, // 所属标段
        leaderName: null, // 负责人
        leaderPhone: null, // 负责人手机
        teamName: null, // 班组名称
        remark: null, // 备注
        users: ""
      },
      inviteShow: false,
      inviteForm: {
        // 人员邀请码
        fkTemplateId: "",
        fkTeamId: "",
        deadline: null
      },
      noProjectData: [], // 项目标段下拉
      teamCategoryData: [], // 班组类型下拉
      pactData: [], // 合同模板下拉列表
      teamSpinner: [], // 班组下拉列表
      principalRadio: "",
      relationStatus: "",
      codeOk: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      clickId: "",
      checked: false,
      holdSealTime: "",
      type: 1,
      unnamedType: ""
    };
  },
  mounted() {
    this.teamsSearchPage();
    this.getItemListNoUserId();
    this.listAllTeamsClass();
  },
  beforeDestroy() {
    this.clearCodetime();
  },
  methods: {
    checkChange(val) {
      if (val) {
        this.queryQRCode();
      } else {
        clearInterval(this.codeTimer);
      }
      this.qrCode();
    },
    timeChange1() {
      this.time2 = "";
      this.inviteForm.deadline = null;
      this.pickerOption2.minTime = new Date(this.time1).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) ? moment(Date.now() + 30 * 60 * 1000).format("HH:mm") : "";
      if (this.holdSealTime) {
        if (new Date(this.time1).setHours(0, 0, 0, 0) === new Date(this.holdSealTime).setHours(0, 0, 0, 0)) {
          this.pickerOption2.maxTime = moment(new Date(this.holdSealTime)).format("HH:mm");
        } else if (new Date(this.time1).setHours(0, 0, 0, 0) > new Date(this.holdSealTime).setHours(0, 0, 0, 0)) {
          this.pickerOption2.maxTime = "00:00";
        } else {
          this.pickerOption2.maxTime = "";
        }
      }
      clearInterval(this.codeTimer);
    },
    // 邀请码
    invitationCode() {
      this.inviteForm = {
        fkTemplateId: "",
        fkTeamId: "",
        deadline: null
      };
      this.getEOrgSealState();
      this.inviteShow = true;
    },
    getEOrgSealState() {
      this.$api.getEOrgSealState().then(res => {
        if (res.code == 200) {
          console.log(res.code);
          if (res.data == 0) {
            this.type = 2;
            this.unnamedType = 1;
            return;
          } else if (res.data == 2) {
            this.unnamedType = 2;
            this.type = 2;
            return;
          } else {
            this.type = 1;
            this.listAll();
            this.pactListAll();
            this.$nextTick(() => {
              if (this.$refs.qrcode != undefined) {
                this.$refs.qrcode.innerHTML = "";
              }
            });
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    resh() {
      this.$nextTick(() => {
        this.getEOrgSealState();
      }, 500);
    },
    pactDataChange(val) {
      let holdSealTime = "";
      if (val == "0") {
        holdSealTime = "";
      } else {
        let obj = this.pactData.filter(item => item.value == val)[0];
        holdSealTime = obj.holdSealTime;
      }
      this.holdSealTime = holdSealTime;
      this.pickerOption = Object.assign({}, this.pickerOptions, {
        disabledDate: date => {
          if (holdSealTime) {
            console.log(new Date(holdSealTime).getTime(), date.getTime() < Date.now() - 24 * 60 * 60 * 1000 || date.getTime() > new Date(holdSealTime).getTime());
            return date.getTime() < Date.now() - 24 * 60 * 60 * 1000 || date.getTime() > new Date(holdSealTime).getTime();
          } else {
            return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
          }
        }
      });
      if (this.inviteForm.fkTeamId.length != 0 && val.length != 0 && this.inviteForm.deadline != null) {
        this.qrCode();
      }
    },
    teamSpinnerChange(val) {
      if (this.inviteForm.fkTemplateId.length != 0 && val.length != 0 && this.inviteForm.deadline != null) {
        this.qrCode();
      }
    },
    deadlineChange(val) {
      if (val) {
        this.inviteForm.deadline = moment(this.time1 + " " + this.time2).format("YYYY-MM-DD HH:mm:ss");
        if (this.inviteForm.fkTemplateId.length != 0 && val != null && this.inviteForm.fkTeamId.length != 0 && this.time1) {
          this.qrCode();
        }
      } else {
        this.inviteForm.deadline = null;
        clearInterval(this.codeTimer);
      }
    },
    qrCode() {
      const url = location.origin;
      console.log(url, location);
      this.codeOk = false;
      this.$nextTick(() => {
        this.$refs.qrcode.innerHTML = "";
        if (this.checked) {
          this.$api.addQRCodeLabourTeam({ effectiveDeadline: moment(this.inviteForm.deadline).format("YYYY-MM-DD HH:mm:ss") }).then(res => {
            if (res.code === 200) {
              this.unique = res.data;
              let data = JSON.stringify(encodeURIComponent(url + "/app/labourTeamMembers/addTeamMembers?" + "fkTeamId=" + this.inviteForm.fkTeamId + "&fkTemplateId=" + this.inviteForm.fkTemplateId + "&signValidity=" + moment(this.inviteForm.deadline).format("YYYY-MM-DD HH:mm:ss")));
              new QRCode("qrcode", {
                width: 260,
                height: 260,
                text: `${url}/h5/#/pages/h5/scanCodeTran?type=4&unique=${this.unique}&data=${data}`
              });
            } else {
              this.$message.warning(res.msg);
            }
          });
        } else {
          let data = JSON.stringify(encodeURIComponent(url + "/app/labourTeamMembers/addTeamMembers?" + "fkTeamId=" + this.inviteForm.fkTeamId + "&fkTemplateId=" + this.inviteForm.fkTemplateId + "&signValidity=" + moment(this.inviteForm.deadline).format("YYYY-MM-DD HH:mm:ss")));
          new QRCode("qrcode", {
            width: 260,
            height: 260,
            text: `${url}/h5/#/pages/h5/scanCodeTran?type=4&data=${data}`
          });
        }
      });
    },
    queryQRCode() {
      clearInterval(this.codeTimer);
      this.codeTimer = setInterval(() => {
        this.$api.queryQRCode({ unique: this.unique }).then(res => {
          if (res.code === 200) {
            if (res.data === 1) {
              clearInterval(this.codeTimer);
              this.codeOk = true;
            }
          } else {
            clearInterval(this.codeTimer);
          }
        });
      }, 5000);
      this.codeTimer2 = setTimeout(() => {
        clearInterval(this.codeTimer);
        this.codeOk = true;
      }, 1800000);
    },
    refreshClick() {
      this.codeOk = false;
      this.qrCode();
    },
    clearCodetime() {
      //清除定时器
      clearInterval(this.codeTimer);
      this.codeTimer = null;
      this.codeTimer2 = null;
    },
    inviteShowclose() {
      this.inviteShow = false;
      this.time1 = "";
      this.time2 = "";
      this.clearCodetime();
    },
    // 查询全部班组
    listAll() {
      this.$api.listAll().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.teamName;
            item.value = item.pkId;
          });
          this.teamSpinner = res.data;
        }
      });
    },
    // 合同模板
    pactListAll() {
      this.$api.searchByContractType().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.templateName;
            item.value = item.pkId;
          });
          this.pactData = res.data;
          this.pactData.unshift({ label: "无合同", value: "0" });
        }
      });
    },
    // 标段项目下拉列表
    getItemListNoUserId() {
      this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          const arr = res.data;
          this.searchOptions[0].options = arr;
          this.noProjectData = arr;
        }
      });
    },
    // 班组类型下拉
    listAllTeamsClass() {
      this.$api.listAllTeamsClass().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.className;
            item.value = item.pkId;
          });
          const arr = res.data;
          this.searchOptions[1].options = arr;
          this.teamCategoryData = arr;
        }
      });
    },
    // 新增班组
    addTeam() {
      this.teanTypeTitle = "新增班组";
      this.relationStatus = "";
      this.teamForm = {
        fkClassId: null, // 班组类别
        fkProjectId: null, // 所属标段
        leaderName: null, // 负责人
        leaderPhone: null, // 负责人手机
        teamName: null, // 班组名称
        remark: null, // 备注
        users: null
      };
      if (this.$refs.teamForm != undefined) {
        this.$refs.teamForm.resetFields();
      }
      this.teamShow = true;
    },
    // 选择人员
    selectPersonnel() {
      console.log(this.teamForm.users);
      // this.principalRadio = "";
      this.teamPeopleShow = true;
    },
    // 设为负责人
    principal(val) {
      this.principalRadio = val.pkId;
      this.teamPeopleData.forEach(item => {
        if (item.pkId == val.pkId) {
          item.principalStatus = true;
        } else {
          item.principalStatus = false;
        }
      });
      console.log(this.teamPeopleData);
    },
    // 选择保存
    selectSave() {
      this.teamForm.users = "";
      const arr = [];
      let id = "";
      this.teamPeopleData.forEach(item => {
        if (item.principalStatus == true) {
          id = item.pkId;
          arr.push(item.userName + "(负责人)");
          this.teamForm.leaderName = item.userName;
          this.teamForm.leaderPhone = item.telephone;
        } else {
          arr.push(item.userName);
        }
      });
      if (id.length == 0) {
        return this.$message.warning("请选择负责人");
      }
      this.teamForm.users = arr.toString();
      this.$api.setResponsibility({ teamId: this.teamForm.pkId, id }).then(res => {
        if (res.code == 200) {
          this.$message.success("调整成功");
          this.teamPeopleShow = false;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },

    // 管理班组类别
    teamType() {
      this.teamShowQuery.className = "";
      this.teamShowSearch();
      this.show = true;
    },
    // 管理班组类别弹窗查询
    teamShowSearch() {
      const data = {};
      data.pageSize = this.teamShowQuery.pageSize;
      data.pageNum = this.teamShowQuery.pageNum;
      data.className = this.teamShowQuery.className;
      this.loading = true;
      this.$api
        .teamsClassSearchPage(data)
        .then(res => {
          if (res.code == 200) {
            this.teamShowData = res.data.records;
            this.teamShowQuery.totalCount = parseInt(res.data.total);
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
    // 班组类别页数改变事件
    teamShowSize(pageSize) {
      this.teamShowQuery.pageSize = pageSize;
      this.teamShowSearch();
    },
    // 班组类别页码改变事件
    teamShowpageCurrent(currentPage) {
      this.teamShowQuery.pageNum = currentPage;
      this.teamShowSearch();
    },
    // 新增班组类别
    teamShowAdd() {
      this.teanTypeTitle = "新增班组类别";
      this.teanTypeShow = true;
      this.ruleForm = {
        className: null, // 班组类别名称
        sortval: null, // 排序值
        remark: null // 备注
      };
      if (this.$refs.ruleForm != undefined) {
        this.$refs.ruleForm.resetFields();
      }
    },
    // 班组弹窗确定按钮
    submitTeamForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {};
          data.fkClassId = this.teamForm.fkClassId;
          data.fkProjectId = this.teamForm.fkProjectId;
          data.leaderName = this.teamForm.leaderName;
          data.leaderPhone = this.teamForm.leaderPhone;
          data.teamName = this.teamForm.teamName;
          data.remark = this.teamForm.remark;
          this.loading = true;
          if (this.teanTypeTitle != "编辑班组") {
            this.$api
              .teamsAdd(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "新增成功"
                  });
                  this.teamsSearchPage();
                  this.teamShow = false;
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
            data.pkId = this.teamForm.pkId;
            this.$api
              .teamsUpdate(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "编辑成功"
                  });
                  this.teamsSearchPage();
                  this.teamShow = false;
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
    // 班组类别查看
    teamShowExamine(row) {
      this.teanTypeTitle = "班组类别详情";
      this.teanTypeShow = true;
      this.ruleForm.className = row.className;
      this.ruleForm.remark = row.remark;
      this.ruleForm.sortval = row.sortval;
    },
    // 班组类别查看编辑
    teamShowEdit(row) {
      this.ruleForm.className = row.className;
      this.ruleForm.remark = row.remark;
      this.ruleForm.sortval = row.sortval;
      this.ruleForm.pkId = row.pkId;
      this.teanTypeTitle = "编辑班组类别";
      this.teanTypeShow = true;
    },
    // 管理班组类别弹窗删除
    teamShowDelete(row) {
      this.$confirm("确定删除该类别信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.teamsClassDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.listAllTeamsClass();
              this.teamShowSearch();
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
    // 班组类别弹窗确认
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {};
          data.className = this.ruleForm.className;
          data.remark = this.ruleForm.remark;
          data.sortval = this.ruleForm.sortval;
          this.loading = true;
          if (this.teanTypeTitle != "编辑班组类别") {
            this.$api
              .teamsClassAdd(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "新增成功"
                  });
                  this.teamShowSearch();
                  this.listAllTeamsClass();
                  this.teanTypeShow = false;
                  this.$nextTick(() => {
                    this.$refs.ruleForm.resetFields();
                  });
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
              .teamsClassUpdate(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "编辑成功"
                  });
                  this.teamShowSearch();
                  this.listAllTeamsClass();
                  this.teanTypeShow = false;
                  this.$nextTick(() => {
                    this.$refs.ruleForm.resetFields();
                  });
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
    // 列表查看
    examine(row) {
      this.$api.teamsById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.teamShow = true;
          this.teanTypeTitle = "班组详情";
          this.teamForm.fkClassId = res.data.fkClassId;
          this.teamForm.fkProjectId = res.data.fkProjectId;
          this.teamForm.leaderName = res.data.leaderName;
          this.teamForm.leaderPhone = res.data.leaderPhone;
          this.teamForm.teamName = res.data.teamName;
          this.teamForm.remark = res.data.remark;
          this.teamForm.fkProjectName = res.data.fkProjectName;
          const arr = [];
          res.data.users.forEach(item => {
            if (item.isSupervisor === 0) {
              arr.push(item.userName + "(负责人)");
              this.principalRadio = item.pkId;
            } else {
              arr.push(item.userName);
            }
          });
          this.teamForm.users = arr.toString();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 列表修改
    edit(row) {
      this.$api.teamsById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          console.log("================================");
          console.log(res);
          this.relationStatus = res.data.relationStatus;
          console.log("================================", this.teanTypeTitle != "班组详情" || this.relationStatus != 0);
          this.principalRadio = "";
          this.teamShow = true;
          this.teanTypeTitle = "编辑班组";
          this.teamForm.fkClassId = res.data.fkClassId;
          this.teamForm.fkProjectId = res.data.fkProjectId;
          this.teamForm.leaderName = res.data.leaderName;
          this.teamForm.leaderPhone = res.data.leaderPhone;
          this.teamForm.teamName = res.data.teamName;
          this.teamForm.remark = res.data.remark;
          this.teamForm.pkId = res.data.pkId;
          this.teamForm.fkProjectName = res.data.fkProjectName;
          const arr = [];
          res.data.users.forEach(item => {
            if (item.isSupervisor == 0) {
              arr.push(item.userName + "(负责人)");
              this.principalRadio = item.pkId;
            } else {
              arr.push(item.userName);
            }
          });
          this.teamForm.users = arr.toString();
          this.teamPeopleData = res.data.users.map(item => ({ ...item, principalStatus: !item.isSupervisor }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    teamsSearchPage() {
      this.loading = true;
      this.$api
        .teamsSearchPage(this.listQuery)
        .then(res => {
          if (res.code == 200) {
            const statusOptions = {
              0: "正常",
              1: "停用"
            };
            res.data.records.forEach(item => {
              item.menuStatusName = statusOptions[item.menuStatus];
            });
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
    search(form) {
      if (form.fkProjectId) {
        this.listQuery.fkProjectId = form.fkProjectId;
      } else {
        delete this.listQuery.fkProjectId;
      }
      if (form.fkClassId) {
        this.listQuery.fkClassId = form.fkClassId;
      } else {
        delete this.listQuery.fkClassId;
      }
      if (form.leaderName) {
        this.listQuery.leaderName = form.leaderName;
      } else {
        delete this.listQuery.leaderName;
      }
      if (form.leaderPhone) {
        this.listQuery.leaderPhone = form.leaderPhone;
      } else {
        delete this.listQuery.leaderPhone;
      }
      this.teamsSearchPage();
    },
    // 排序值禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    batchDelete(row) {
      this.$confirm("确定删除该班组信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.teamsDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.teamsSearchPage();
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
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.teamsSearchPage();
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.teamsSearchPage();
    }
  }
};
</script>
<style lang="scss" scoped>
.hader-search {
  position: relative;

  .hader-btn {
    position: absolute;
    top: 26px;
    right: 13px;
  }
}

.search-bar-demo {
  /deep/ .el-date-editor--daterange {
    width: 270px !important;
  }
}

.basi {
  .basi-center {
    border: 1px solid;
    padding: 8px;
    background: #f2f2f2;
  }
}

/deep/ .datetime-end {
  .el-form-item__label {
    width: 2em !important;
  }
}

.team-show-header {
  margin-top: 20px;
  position: relative;

  .team-show-btn {
    position: absolute;
    top: 0;
    right: 0;
  }
}

.invite-form {
  margin-top: 10px;
  padding-top: 0 !important;

  .el-form-item {
    margin-bottom: 0px;
  }
}

//

.team-people-show {
  /deep/ .el-dialog__body {
    padding: 0;
  }

  /deep/ .el-form-item {
    margin-bottom: 0px;
  }

  .btn-box {
    margin: 8px;
    padding-bottom: 10px;
    text-align: center;
  }
}
.codeOk {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 1;
  .iconColor {
    color: #6bc839;
    font-size: 40px;
  }
  .mb-20 {
    margin-bottom: 20px;
  }
  .mb-60 {
    margin-bottom: 60px;
  }
}
.checked {
  position: absolute;
  top: 5px;
  left: 30px;
}
</style>
