<template>
  <div class="panelWrapper">
    <div class="panelHeader">{{ businessObjectName == true ? "节点信息" : workflowType == "0" || workflowType == "13" ? "工序信息" : "流程信息" }}</div>
    <el-form class="panelForm" :model="form" label-position="left">
      <!-- v-if="show" -->
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <div class="panleTitle"><i class="el-icon-info"></i> 节点名称</div>
        <div class="panleCenten">
          <!-- <el-form-item label="节点名称" v-if="businessObjectName"> -->
          <el-input size="mini" :disabled="forbidden" v-model="form.name" @change="v => updateForm('name', v)" maxlength="25"></el-input>
          <!-- </el-form-item> -->
        </div>
      </div>
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <!-- <div class="panleTitle"><i class="el-icon-s-order"></i> 节点设置</div> -->
        <div class="panleCenten" v-if="workflowType.length">
          <div class="panleTitle" v-if="workflowType == '8'"><i class="el-icon-s-order"></i> 节点类型</div>
          <el-radio-group style="padding:4px" :disabled="forbidden" v-model="form.nodeApproveType" @change="v => updateForm('nodeApproveType', v)" v-if="workflowType == '8'">
            <el-radio :label="'0'">审批节点</el-radio>
            <!-- <el-radio :label="'1'" v-if="workflowType == '0'">钢筋加工厂</el-radio> -->
            <!-- <el-radio :label="'2'" v-if="workflowType == '0'">混泥土搅拌</el-radio> -->
            <el-radio :label="'3'" v-if="workflowType == '8'">盖章人节点</el-radio>
          </el-radio-group>
          <div v-if="form.nodeApproveType != 3">
            <!-- <div>{{workflowType != 8?"审批角色":"审批岗位"}}</div> -->
            <div class="panleTitle"><i class="el-icon-s-order"></i> {{ workflowType != 8 ? "审批角色" : "审批岗位" }}</div>
            <el-row style="padding-top:4px">
              <el-col :span="12" v-if="workflowType != 8">
                <el-select :disabled="forbidden" v-model="form.unitId" placeholder="请选择" size="mini" @change="v => unitOptionsChang('unitId', v)">
                  <el-option v-for="item in unitOptions" :key="item.pkId" :label="item.roleName" :value="item.roleType"> </el-option>
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-select v-if="checkStatus" :disabled="forbidden" v-model="form.fkRoleId" placeholder="请选择" size="mini" @change="v => updateForm('fkRoleId', v)">
                  <el-option v-for="item in options" :key="item.pkId" :label="item.roleName" :value="item.pkId"> </el-option>
                </el-select>
              </el-col>
            </el-row>
          </div>
          <div v-if="form.nodeApproveType == 3">
            <!-- <div>盖章人员</div> -->
            <div class="panleTitle"><i class="el-icon-s-order"></i>盖章人员</div>
            <el-row style="padding-top:4px">
              <el-col :span="12">
                <el-select :disabled="forbidden" v-model="form.fkUserId" placeholder="请选择" size="mini" @change="v => unitOptionsChang('fkUserId', v)">
                  <el-option v-for="item in chapterList" :disabled="item.empowerTime == 1" :key="item.pkId" :label="item.realName" :value="item.pkId"> </el-option>
                </el-select>
              </el-col>
            </el-row>
          </div>
          <div class="panleTitle" style="marign-tpo :2px;" v-if="workflowType == '0' || workflowType == 13"><i class="el-icon-s-order"></i>可编辑内容</div>
          <div v-if="workflowType == '0' || workflowType == 13" style="padding: 4px">
            <!-- <div style="line-height: 20px">可编辑内容：</div> -->
            <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 13" v-model="form.quantitiesTable" @change="v => checkboxChange('quantitiesTable', v)" :disabled="forbidden">工程量</el-checkbox>
            <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 13" v-model="form.materialUsedTable" @change="v => checkboxChange('materialUsedTable', v)" :disabled="forbidden">材料用量</el-checkbox>
            <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 0" v-model="form.scoreFlag" @change="v => checkboxChange('scoreFlag', v)" :disabled="forbidden||(!!scoreFlagName&&scoreFlagName!=form.id)">工程评分</el-checkbox>
          </div>
        </div>
      </div>
      <div v-if="!businessObjectName && workflowType != 0 && workflowType != 1 && workflowType != 13&& workflowType != 8">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 发起人设置</div>
        <div class="panleCenten">
          <div style="margin-top: 10px">
            <el-form-item label="" style="margin-right: 6px">
              <el-col :span="12">
                <el-select placeholder="请选择" size="mini" v-model="launchType" @change="launchTypeChange">
                  <el-option v-for="s in initiatorArr" :key="s.id" :value="s.id" :label="s.name" />
                </el-select>
              </el-col>
              <el-col :span="12" v-if="launchType == '1'">
                <el-select clearable placeholder="请选择" size="mini" v-model="fkRoleId" @change="fkRoleIdChange">
                  <el-option v-for="s in fkRoleIdArr" :key="s.pkId" :value="s.pkId" :label="s.roleName" />
                </el-select>
              </el-col>
              <el-col :span="12" v-if="launchType == '2'">
                <el-input size="mini" disabled v-model="firstNode"></el-input>
              </el-col>
            </el-form-item>
          </div>
        </div>
      </div>
      <div v-if="businessObjectType == 'bpmn:UserTask' && workflowType != '' && form.nodeApproveType != 3">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设计</div>
        <!-- <div class="panleCenten" style="line-height: 30px ;margin: 0;padding: 0px 10px;" v-if="tableSource != 1">
          <el-radio-group :disabled="forbidden" v-model="form.tableSource"
            @change="v => tableSourceForm('tableSource', v)">
            <el-radio :label="'0'">系统默认</el-radio>
            <el-radio :label="'1'">自定义</el-radio>
          </el-radio-group>
        </div> -->
        <div class="table-pull-box" v-if="checkStatus" :class="{ 'table-max-height': workflowType == 0 || workflowType == 13 }">
          <el-row v-for="(item, index) in tableIdForm" :key="index" style="margin: 4px 0px">
            <el-col :span="18">
              <el-select style="width: 100%" :disabled="forbidden" filterable v-model="item.fkTableId" clearable placeholder="请选择" size="mini" @focus="setOptionWidth" @change="v => tableIdChange()">
                <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                  <el-option :disabled="tableIdForm.find(s => s.fkTableId === i.pkId) == undefined ? false : true" :value="i.pkId" :label="i.tableName"></el-option>
                </el-tooltip>
              </el-select>
            </el-col>
            <el-col :span="3" style="line-height: 22px; padding-left: 2px">
              <!-- <el-checkbox v-model="item.archives" @change="archivesChang" v-if="user.orgType == 5">档案表</el-checkbox> -->
            </el-col>
            <el-col :span="3" style="line-height: 22px; padding-left: 2px">
              <!-- <i class="el-icon-circle-plus-outline" style="color: #2680f0;" v-if="index == 0" @click="tableIdsAdd"></i>
              <el-button type="danger" size="mini" style="padding: 0;" icon="el-icon-zoom-out" circle v-if="index != 0"
                @click="tableIdsShiftOut(index)"></el-button> -->
              <i class="el-icon-circle-plus-outline" style="color: #2680f0; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index == 0" @click="tableIdsAdd"></i>
              <i class="el-icon-remove-outline" style="color: red; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index != 0" @click="tableIdsShiftOut(index)"></i>
            </el-col>
          </el-row>
        </div>
      </div>
      <div v-if="!businessObjectName && workflowType != 0 && workflowType != 1 && workflowType != 13">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设计</div>
        <!-- <div class="panleCenten" style="line-height: 30px ;margin: 0;padding: 0px 10px;" v-if="workflowType != 8">
          <el-radio-group :disabled="forbidden" v-model="flowFormType">
            <el-radio :label="'0'">系统默认</el-radio>
            <el-radio :label="'1'">自定义</el-radio>
          </el-radio-group>
        </div> -->
        <div class="panleCenten" style="height: 350px; overflow: auto">
          <div style="margin-top: 10px">
            <el-row v-for="(item, index) in flowTable" :key="index" style="margin: 4px 0px">
              <el-col :span="18">
                <el-select style="width: 100%" :disabled="forbidden" filterable v-model="item.tableId" clearable @change="flowTableChange" placeholder="请选择" size="mini" @focus="setOptionWidth">
                  <el-tooltip v-for="i in formTypeArr" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                    <el-option :disabled="flowTable.find(s => s.tableId === i.pkId) == undefined ? false : true" :value="i.pkId" :label="i.tableName"></el-option>
                  </el-tooltip>
                </el-select>
              </el-col>
              <el-col :span="3" style="line-height: 22px; padding-left: 2px">
                <!-- <el-checkbox v-model="item.isArchives" v-if="user.orgType == 5" @change="flowTableChange">档案表</el-checkbox> -->
              </el-col>
              <el-col :span="3" style="line-height: 22px; padding-left: 2px">
                <i class="el-icon-circle-plus-outline" style="color: #2680f0; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index == 0" @click="flowTableAdd"></i>
                <i class="el-icon-remove-outline" style="color: red; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index != 0" @click="flowTableDelete(index)"></i>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      <div v-if="(workflowType == '0' || workflowType == '13') && !businessObjectName">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 关联资料</div>
        <el-form-item label="技术规范" class="ast" label-width="60px">
          <el-col :span="11">
            <el-form-item prop="date1">
              <el-select clearable placeholder="请选择" @change="technologyChang" size="mini" :disabled="addTitle == '查看流程'" v-model="fieldListform.technology">
                <el-option v-for="i in technologyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-input clearable size="mini" type="number" @blur="pdfListChage" @change="jsThePageChang" oninput="value=value.replace(/[^\d.]/g,'')" v-model="fieldListform.jsThePage" />
          </el-col>
          <el-col :span="2">
            <span>页</span>
          </el-col>
          <el-col :span="4">
            <el-input clearable oninput="value=value.replace(/[^\d.]/g,'')" size="mini" type="number" @blur="jsToPageChang" v-model="fieldListform.jsToPage" />
          </el-col>
          <el-col :span="1">
            <span>页</span>
          </el-col>
        </el-form-item>
        <el-form-item label="安全规范" class="ast" label-width="60px">
          <el-col :span="11">
            <el-form-item prop="date1">
              <el-select :disabled="addTitle == '查看流程'" clearable placeholder="请选择" size="mini" @change="safetyChange" v-model="fieldListform.safety">
                <el-option v-for="i in safetyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-input :disabled="addTitle == '查看流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" @input="aqThePageChang" v-model="fieldListform.aqThePage" />
          </el-col>
          <el-col :span="2">
            <span>页</span>
          </el-col>
          <el-col :span="4">
            <el-input :disabled="addTitle == '查看流程'" clearable size="mini" @blur="aqToPageChang" v-model="fieldListform.aqToPage" />
          </el-col>
          <el-col :span="1">
            <span>页</span>
          </el-col>
        </el-form-item>

        <el-form-item label="验收标准" class="ast" label-width="60px">
          <el-col :span="11">
            <el-form-item prop="date1">
              <el-select :disabled="addTitle == '查看流程'" clearable placeholder="请选择" size="mini" @change="standardChange" v-model="fieldListform.standard">
                <el-option v-for="i in acceptanceLevel" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-input :disabled="addTitle == '查看流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" v-model="fieldListform.ysThePage" @input="ysThePageChange" />
          </el-col>
          <el-col :span="2">
            <span>页</span>
          </el-col>
          <el-col :span="4">
            <el-input :disabled="addTitle == '查看流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" @blur="ysToPageChang" v-model="fieldListform.ysToPage" />
          </el-col>
          <el-col :span="1">
            <span>页</span>
          </el-col>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    element: {
      default: function() {
        return {};
      }
    },
    businessObject: {
      default: function() {
        return {};
      }
    },
    forbidden: {
      type: Boolean,
      default: false
    },
    modeling: {},
    moddle: {},
    addTitle: {
      default: "",
      type: String
    },

    workflowType: {
      default: "",
      type: String
    },
    fkOrgId: {
      default: "",
      type: String
    },
    orgType: "",
    fkProfessionalTypeId: {
      default: "",
      type: String
    },
    fkEnginerringTypeId: {
      default: "",
      type: String
    },
    tableSource: {
      default: "",
      type: String
    },
    user: {
      default: {
        orgType: ""
      },
      type: Object
    },
    warehouseType: ""
  },
  data() {
    return {
      show: false,
      activeName: "general",
      form: {
        nodeApproveType: "0",
        tableSource: "0"
      },
      formProperty: [],
      currentRow: "",
      extensionElements: "",
      options: ["long", "string", "boolean", "date", "enum", "custom type"],
      formType: ["bpmn:StartEvent", "bpmn:UserTask"],
      formLabelWidth: "80px",
      options: [],
      unitOptions: [],
      value: "",
      radio: "",
      businessObjectType: "12",
      businessObjectName: true,
      // tableType: "0",
      optionsList: [],
      selectOptionWidth: "",
      chapterList: [],
      checkStatus: true,
      tableIdForm: [],
      flowTable: [{ tableId: "", isArchives: false, tableSource: this.flowFormType }],
      flowFormType: "",
      formTypeArr: [],
      flowTableArr: [],
      fieldListform: {
        technology: "",
        jsThePage: "",
        jsToPage: "",
        safety: "",
        aqThePage: "",
        aqToPage: "",
        standard: "",
        ysThePage: "",
        ysToPage: ""
      },
      technologyDate: [],
      safetyDate: [],
      acceptanceLevel: [],
      initiatorArr: [
        { name: "不限", id: "0" },
        { name: "指定岗位", id: "1" },
        { name: "首个流程节点岗位", id: "2" }
      ],
      launchType: "",
      fkRoleId: "",
      firstNode: "",
      fkRoleIdArr: [],
      accessType: "1", //1 新增  //2编辑
      nodeMarkArr: [],
      scoreFlagStatus: 0, // 控制不让选评分
      scoreFlagName: ""
    };
  },
  // computed: {
  //   user() {
  //     return JSON.parse(sessionStorage.getItem("user") || "{}");
  //   },
  // },
  mounted() {},
  watch: {
    "form.unitId": function(newVal, oldVal) {
      if (newVal != undefined) {
        this.unitOptions.forEach(item => {
          if (item.roleType == newVal) {
            if (item.sysDefaultRoleList != "") {
              this.options = item.sysDefaultRoleList;
            } else {
              this.options = [];
            }
          }
        });
      } else {
        this.options = [];
      }
    },
    workflowType(val) {
      this.$api.customizedAuditRole({ workflowType: val, fkOrgId: this.fkOrgId }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
        }
      });

      // this.formTypeArr = []
      // this.flowTable = [
      //   { tableId: "", isArchives: "", tableSource: val }
      // ]
      if (val == 8) {
        this.flowFormType = "1";
        this.formTypeArrList(this.fkOrgId);
      } else {
        this.flowFormType = "0";
        this.formTypeArrList("1");
      }
    },
    "form.tableSource": function(val) {
      this.optionsList = [];
      // if (val == "0") {
      //   this.customizedSearchTableVos(1);
      // } else if (val == "1") {
      this.customizedSearchTableVos(this.fkOrgId);
      // }
    },
    flowFormType(val) {
      this.flowTable = [{ tableId: "", isArchives: "", tableSource: val }];
      if (val == "0") {
        this.formTypeArrList("1");
      } else if (val == "1") {
        this.formTypeArrList(this.fkOrgId);
      }
    },
    "form.nodeApproveType": function(val) {
      // this.chapterList = [];
      if (val == "3") {
        this.customizedInChapterOne();
      }
    },
    fkProfessionalTypeId: function(newVal, oldVal) {
      this.customizedSearchTableVos(1);
      if (this.workflowType == "0" || this.workflowType == "13") {
        this.quotePdfListByType();
      }
    },
    fkEnginerringTypeId: function(newVal, oldVal) {
      this.customizedSearchTableVos(1);
    },
    // tableType(val) {
    //   if (val == 0) {
    //     this.customizedSearchTableVos();
    //   } else if (val == 1) {
    //     this.customizedSearchTableVos(this.fkOrgId);
    //   }
    // }
    warehouseType(val) {
      this.$api.customizedAuditRole({ warehouseType: val, workflowType: this.workflowType, fkOrgId: this.fkOrgId }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
        }
      });
    }
  },
  methods: {
    launchTypeChange(val) {
      if (val == 1) {
        this.searchAppointRole();
      }
      if (val == 2) {
        //   console.log(this.pitchOnDate[0].workflowNodes[1]);
        //   this.firstNode = this.pitchOnDate[0].workflowNodes[1];
        this.firstNode = this.nodeMarkArr[0].roleName;
      }
      let data = {
        launchType: this.launchType,
        fkRoleId: this.fkRoleId
      };
      this.$emit("launchInit", data);
    },
    fkRoleIdChange() {
      let data = {
        launchType: this.launchType,
        fkRoleId: this.fkRoleId
      };
      this.$emit("launchInit", data);
    },
    searchAppointRole() {
      let data = {
        orgId: this.fkOrgId
      };
      this.$api.searchAppointRoleOperation(data).then(res => {
        if (res.code == 200) {
          this.fkRoleIdArr = res.data;
        } else {
          this.fkRoleIdArr = [];
          this.$message.error(res.msg);
        }
      });
    },
    pdfListChage(val) {
      this.$emit("pdfList", this.fieldListform);
    },
    /// /绑定技术规格
    technologyChang(val) {
      this.fieldListform.jsThePage = "";
      this.fieldListform.jsToPage = "";
      if (val == "" || val == null) {
        return;
      }
      let sum = 0;
      this.technologyDate.forEach(item => {
        if (item.pkId == this.fieldListform.technology) {
          sum = item.bookPages;
        }
      });
      this.fieldListform.jsThePage = 1;
      this.fieldListform.jsToPage = sum - 0;
      this.$emit("pdfList", this.fieldListform);
    },
    // 技术规范开始页
    jsThePageChang(val) {
      console.log("1111111");
      if (this.fieldListform.technology == "" || this.fieldListform.technology == null) {
        this.fieldListform.jsThePage = "";
        return this.$message({
          type: "error",
          message: "请先选择技术规范"
        });
      }
      if (this.fieldListform.jsThePage == 0 || this.fieldListform.jsThePage == "") {
        this.fieldListform.jsThePage = "";
        return this.$message({
          type: "error",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.technologyDate.forEach(item => {
        if (item.pkId == this.fieldListform.technology) {
          sum = item.bookPages;
        }
      });
      if (val - 0 > this.fieldListform.jsToPage - 0) {
        this.fieldListform.jsThePage = 1;
        this.$message.warning("开始也不能大于结束页");
        this.$emit("pdfList", this.fieldListform);
        return;
      }
      if (val > sum) {
        this.fieldListform.jsThePage = 1;
        this.$message({
          type: "error",
          message: "开始页数不能大于文件总页数"
        });
      } else {
        // this.fieldListform.jsToPage = sum;
      }

      this.$emit("pdfList", this.fieldListform);
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     item.bookPdfDTOS.forEach(i => {
      //       if (i.fkBookPdfId == this.fieldListform.technology) {
      //         i.beginPage = this.fieldListform.jsThePage;
      //         i.endPage = this.fieldListform.jsToPage;
      //       }
      //     });
      //   }
      // });
    },
    // 技术规范结束页
    jsToPageChang(val) {
      if (this.fieldListform.technology == "" || this.fieldListform.technology == null) {
        this.fieldListform.jsToPage = "";
        return this.$message.warning("请先选择技术规范");
      }
      if (this.fieldListform.jsToPage == 0 || this.fieldListform.jsToPage == "") {
        this.fieldListform.jsToPage = "";
        return this.$message.warning("结束页数不能为0 或为空");
      }
      if (this.fieldListform.jsToPage - 0 < this.fieldListform.jsThePage - 0) {
        this.fieldListform.jsToPage = this.fieldListform.jsThePage;
        return this.$message.warning("结束页不能小于于开始页");
      }
      let sum = 0;
      this.technologyDate.forEach(item => {
        if (item.pkId == this.fieldListform.technology) {
          sum = item.bookPages;
        }
      });
      if (this.fieldListform.jsToPage - 0 > sum - 0) {
        this.fieldListform.jsToPage = sum;
        return this.$message.warning("结束页数不能大于文件总页数");
      }
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     item.bookPdfDTOS.forEach(i => {
      //       if (i.fkBookPdfId == this.fieldListform.technology) {
      //         i.endPage = this.fieldListform.jsToPage;
      //       }
      //     });
      //   }
      // });
      this.$emit("pdfList", this.fieldListform);
    },
    safetyChange(val) {
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     if (item.bookPdfDTOS != null) {
      //       item.bookPdfDTOS = item.bookPdfDTOS.filter(item => {
      //         return item.bookType != 1;
      //       });
      //     }
      //   }
      // });
      this.fieldListform.aqThePage = "";
      this.fieldListform.aqToPage = "";
      if (val == "" || val == null) {
        return;
      }
      let sum = 0;
      this.safetyDate.forEach(item => {
        if (item.pkId == this.fieldListform.safety) {
          sum = item.bookPages;
        }
      });
      this.fieldListform.aqThePage = 1;
      this.fieldListform.aqToPage = sum - 0;
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     if (item.bookPdfDTOS == null) {
      //       item.bookPdfDTOS = [];
      //     }
      //     item.bookPdfDTOS.push({
      //       fkBookPdfId: val,
      //       beginPage: this.fieldListform.aqThePage,
      //       endPage: this.fieldListform.aqToPage,
      //       sortval: 1,
      //       bookType: 1
      //     });
      //   }
      // });
      this.$emit("pdfList", this.fieldListform);
    },

    // 安全规范开始页
    aqThePageChang(val) {
      //       safety: "", //安全
      // aqThePage: null, //安全开始页
      // aqToPage: null, //安全结束页
      if (this.fieldListform.safety == "" || this.fieldListform.safety == null) {
        this.fieldListform.aqThePage = "";
        // fieldListform.aqThePage
        return this.$message({
          type: "error",
          message: "请先选择安全规范"
        });
      }
      if (this.fieldListform.aqThePage == 0 || this.fieldListform.aqThePage == "") {
        return this.$message({
          type: "error",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.safetyDate.forEach(item => {
        if (item.pkId == this.fieldListform.safety) {
          sum = item.bookPages;
        }
      });
      if (val - 0 > this.fieldListform.aqToPage - 0) {
        this.fieldListform.aqThePage = 1;
        this.$message.warning("开始也不能大于结束页");
        this.$emit("pdfList", this.fieldListform);
        return;
      }
      if (val > sum) {
        this.fieldListform.aqThePage = 1;
        this.$message({
          type: "error",
          message: "开始页数不能大于文件总页数"
        });
      } else {
        // this.fieldListform.aqToPage = sum;
      }
      this.$emit("pdfList", this.fieldListform);
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     item.bookPdfDTOS.forEach(i => {
      //       if (i.fkBookPdfId == this.fieldListform.safety) {
      //         i.beginPage = this.fieldListform.aqThePage;
      //         i.endPage = this.fieldListform.aqToPage;
      //       }
      //     });
      //   }
      // });
    },
    // 安全规范结束页
    aqToPageChang(val) {
      if (this.fieldListform.safety == "" || this.fieldListform.safety == null) {
        this.fieldListform.aqToPage = "";
        return this.$message({
          type: "error",
          message: "请先选择安全规范"
        });
      }
      //  safety: "", //安全
      //     aqThePage: null, //安全开始页
      //     aqToPage: null, //安全结束页
      if (this.fieldListform.aqToPage == 0 || this.fieldListform.aqToPage == "") {
        return this.$message({
          type: "error",
          message: "结束页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.safetyDate.forEach(item => {
        if (item.pkId == this.fieldListform.safety) {
          sum = item.bookPages;
        }
      });

      if (this.fieldListform.aqToPage - 0 > sum || this.fieldListform.aqToPage - 0 < this.fieldListform.aqThePage) {
        this.fieldListform.aqToPage = sum;
        this.$message.warning("结束页数不能小于开始页数 ，大于文件总页数");
      }
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     item.bookPdfDTOS.forEach(i => {
      //       if (i.fkBookPdfId == this.fieldListform.safety) {
      //         i.endPage = this.fieldListform.aqToPage;
      //       }
      //     });
      //   }
      // });
      this.$emit("pdfList", this.fieldListform);
    },

    // 绑定验收标准
    standardChange(val) {
      // standard
      //  standard: "", //验收
      // ysThePage: null, //验收开始页
      // ysToPage: null, //验收结束页
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     if (item.bookPdfDTOS != null) {
      //       item.bookPdfDTOS = item.bookPdfDTOS.filter(item => {
      //         return item.bookType != 2;
      //       });
      //     }
      //   }
      // });
      this.fieldListform.ysThePage = "";
      this.fieldListform.ysToPage = "";
      if (val == "" || val == null) {
        return;
      }
      let sum = 0;
      this.acceptanceLevel.forEach(item => {
        if (item.pkId == this.fieldListform.standard) {
          sum = item.bookPages;
        }
      });
      this.fieldListform.ysThePage = 1;
      this.fieldListform.ysToPage = sum - 0;
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     if (item.bookPdfDTOS == null) {
      //       item.bookPdfDTOS = [];
      //     }
      //     item.bookPdfDTOS.push({
      //       fkBookPdfId: val,
      //       beginPage: this.fieldListform.ysThePage,
      //       endPage: this.fieldListform.ysToPage,
      //       sortval: 2,
      //       bookType: 2
      //     });
      //   }
      // });
      this.$emit("pdfList", this.fieldListform);
    },

    // 验收开始页
    ysThePageChange(val) {
      //  standard: "", //验收
      // ysThePage: null, //验收开始页
      // ysToPage: null, //验收结束页
      if (this.fieldListform.standard == "" || this.fieldListform.standard == null) {
        this.fieldListform.ysThePage = "";
        return this.$message({
          type: "error",
          message: "请先选择验收标准"
        });
      }
      if (this.fieldListform.ysThePage == 0 || this.fieldListform.ysThePage == "") {
        return this.$message({
          type: "error",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.acceptanceLevel.forEach(item => {
        if (item.pkId == this.fieldListform.standard) {
          sum = item.bookPages;
        }
      });
      if (val - 0 > this.fieldListform.ysToPage - 0) {
        this.fieldListform.ysThePage = 1;
        this.$message({
          type: "error",
          message: "开始页数不能大于结束页数"
        });
        this.$emit("pdfList", this.fieldListform);
        return;
      }
      if (val > sum) {
        this.fieldListform.ysThePage = 1;
        this.$message({
          type: "error",
          message: "开始页数不能大于文件总页数"
        });
      } else {
        // this.fieldListform.ysToPage = sum;
      }
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     item.bookPdfDTOS.forEach(i => {
      //       if (i.fkBookPdfId == this.fieldListform.standard) {
      //         i.beginPage = this.fieldListform.ysThePage;
      //         i.endPage = this.fieldListform.ysToPage;
      //       }
      //     });
      //   }
      // });
      this.$emit("pdfList", this.fieldListform);
    },
    // 验收标准结束页
    ysToPageChang(val) {
      //  standard: "", //验收
      // ysThePage: null, //验收开始页
      // ysToPage: null, //验收结束页
      if (this.fieldListform.standard == "" || this.fieldListform.standard == null) {
        this.fieldListform.ysToPage = "";
        return this.$message({
          type: "error",
          message: "请先选择验收标准"
        });
      }
      if (this.fieldListform.ysToPage == 0 || this.fieldListform.ysToPage == "") {
        return this.$message({
          type: "error",
          message: "结束页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.acceptanceLevel.forEach(item => {
        if (item.pkId == this.fieldListform.standard) {
          sum = item.bookPages;
        }
      });

      if (this.fieldListform.ysToPage - 0 > sum || this.fieldListform.ysToPage - 0 < this.fieldListform.ysThePage - 0) {
        this.fieldListform.ysToPage = sum;
        this.$message.warning("结束页数不能小于开始页数 ，大于文件总页数");
      }
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     item.bookPdfDTOS.forEach(i => {
      //       if (i.fkBookPdfId == this.fieldListform.standard) {
      //         i.endPage = this.fieldListform.ysToPage;
      //       }
      //     });
      //   }
      // });
      this.$emit("pdfList", this.fieldListform);
    },

    // 获取pdf下拉列表
    quotePdfListByType() {
      // 0获取技术规范，1获取安全规范，2获取验收标准
      this.$api
        .customizedWorkflowPdf({
          bookType: 0,
          fkProfessionalTypeId: this.fkProfessionalTypeId,
          fkOrgId: this.fkOrgId
        })
        .then(res => {
          if (res.code == 200) {
            this.technologyDate = res.data;
          }
        });
      this.$api
        .customizedWorkflowPdf({
          bookType: 1,
          fkProfessionalTypeId: this.fkProfessionalTypeId,
          fkOrgId: this.fkOrgId
        })
        .then(res => {
          if (res.code == 200) {
            this.safetyDate = res.data;
          }
        });
      this.$api
        .customizedWorkflowPdf({
          bookType: 2,
          fkProfessionalTypeId: this.fkProfessionalTypeId,
          fkOrgId: this.fkOrgId
        })
        .then(res => {
          if (res.code == 200) {
            this.acceptanceLevel = res.data;
          }
        });
    },

    // =====
    tableIdInit(arr, data) {
      debugger;
      this.accessType = "2";
      this.nodeMarkArr = [];
      data.workflowNodeDTOS.forEach(item => {
        if (item.nodeType == 2) {
          this.nodeMarkArr.push(item);
        }
      });
      this.businessObjectType = "";
      this.businessObjectName = false;
      this.flowTableArr = arr;
      console.log("this.flowTableArr");
      console.log(this.flowTableArr);
      console.log("this.flowTableArr");
      if (this.flowTableArr != undefined && this.flowTableArr != null && this.flowTableArr.length != 0) {
        this.flowFormType = this.flowTableArr[0].tableSource == null ? "" : this.flowTableArr[0].tableSource + "";
        // alert("11")
        // this.$nextTick(() => {
        this.flowTable = [];
        this.flowTableArr.forEach(item => {
          this.flowTable.push({
            tableId: item.fkTableId,
            isArchives: item.isArchives == 1 ? true : false
          });
        });
        // });
      } else {
        this.flowTable = [{ tableId: "", isArchives: false, tableSource: "" }];
      }
      this.businessObjectName = false;
      this.customizedAuditRole();
      if (data.workflowType != 0 && data.workflowType != 13) {
        this.launchType = data.launchType + "";
        if (this.launchType == 1) {
          this.fkRoleId = data.fkRoleId;
          this.searchAppointRole();
        } else if (this.launchType == 2) {
          this.firstNode = data.workflowNodeDTOS[1].roleName;
        }
      }
      if (data.workflowType == "0" || data.workflowType == "13") {
        this.quotePdfListByType();
      }

      if ((data.workflowType == "0" || data.workflowType == "13") && data.bookPdfs.length != 0) {
        data.bookPdfs.forEach(item => {
          if (item.bookType == 0) {
            this.fieldListform.technology = item.fkBookPdfId;
            this.fieldListform.jsThePage = item.beginPage;
            this.fieldListform.jsToPage = item.endPage;
          } else if (item.bookType == 1) {
            this.fieldListform.safety = item.fkBookPdfId;
            this.fieldListform.aqThePage = item.beginPage;
            this.fieldListform.aqToPage = item.endPage;
          } else if (item.bookType == 2) {
            this.fieldListform.standard = item.fkBookPdfId;
            this.fieldListform.ysThePage = item.beginPage;
            this.fieldListform.ysToPage = item.endPage;
          }
        });
        this.$emit("pdfList", this.fieldListform);
      }
      if (data) {
        let arr = data.workflowNodeDTOS.filter(item => item.nodeType == 2);
        this.firstNode = arr.length ? arr[0].roleName : "";
      }
      this.customizedSearchTableVos();
      this.formTypeArrList(this.fkOrgId);
      console.log("xxxxxxx1111");
      console.log(this.flowTable);
      console.log("xxxxxxx1111");
      this.$emit("getReply", this.flowTable);
    },
    flowTableChange() {
      this.$emit("getReply", this.flowTable);
    },
    // =====流程表格开始===================
    flowTableAdd() {
      this.flowTable.push({ tableId: "", isArchives: false, tableSource: this.flowFormType });
    },
    flowTableDelete(idx) {
      this.flowTable.splice(idx, 1);
    },
    //=====流程表格结束===================
    tableIdChange() {
      let tableIds = [];
      let archives = [];
      let arr = [];
      this.tableIdForm.forEach(item => {
        if (item.fkTableId != null && item.fkTableId != "") {
          tableIds.push(item.fkTableId);
          arr.push(item);
          if (item.archives == false) {
            archives.push(0);
          } else {
            archives.push(1);
          }
        }
      });
      this.modeling.updateProperties(this.element, {
        ["tableIds"]: tableIds
      });
      this.modeling.updateProperties(this.element, {
        ["archives"]: archives
      });
      this.nodeMarkArr.forEach(item => {
        if (item.nodeMark === this.form.id) {
          item.tableDTOS = arr;
        }
      });
    },
    archivesChang() {
      let archives = [];
      this.tableIdForm.forEach(item => {
        // if (item.tableId != '') {
        if (item.archives == true) {
          archives.push(1);
        } else {
          archives.push(0);
        }
        //
        // }
      });
      // return
      this.modeling.updateProperties(this.element, {
        ["archives"]: archives
      });
    },
    tableIdsAdd() {
      this.checkStatus = false;
      this.tableIdForm.push({ fkTableId: "", archives: false });
      // this.modeling.updateProperties(this.element, {
      //   ["tableIds"]: this.form.tableIds
      // });
      let tableIds = [];
      let archives = [];
      let arr = [];
      this.tableIdForm.forEach(item => {
        if (item.fkTableId != null && item.fkTableId != "") {
          tableIds.push(item.fkTableId);
          arr.push(item);
          if (item.archives == false) {
            archives.push(0);
          } else {
            archives.push(1);
          }
        }
      });
      this.modeling.updateProperties(this.element, {
        ["tableIds"]: tableIds
      });
      this.modeling.updateProperties(this.element, {
        ["archives"]: archives
      });
      this.checkStatus = true;
      // ["tableIds"]: [{tableId:"",archives:""}]
      this.nodeMarkArr.forEach(item => {
        if (item.nodeMark === this.form.id) {
          item.tableDTOS = arr;
        }
      });
    },
    tableIdsShiftOut(idx) {
      this.checkStatus = false;
      this.tableIdForm.splice(idx, 1);
      let tableIds = [];
      let archives = [];
      let arr = [];
      this.tableIdForm.forEach(item => {
        if (item.fkTableId != null && item.fkTableId != "") {
          tableIds.push(item.fkTableId);
          arr.push(item.fkTableId);
          if (item.archives == false) {
            archives.push(0);
          } else {
            archives.push(1);
          }
        }
      });
      this.modeling.updateProperties(this.element, {
        ["tableIds"]: tableIds
      });
      this.modeling.updateProperties(this.element, {
        ["archives"]: archives
      });
      this.checkStatus = true;
      this.nodeMarkArr.forEach(item => {
        if (item.nodeMark === this.form.id) {
          item.tableDTOS = arr;
        }
      });
    },
    checkboxChange(type, v) {
      console.log(v);
      if(type=="scoreFlag"){
        let obj = this.nodeMarkArr.filter(item=>item.nodeMark==this.form.id)[0]
        if(v){
          if(this.scoreFlagName&&(this.scoreFlagName!=this.form.id)){
            obj.scoreFlag = 0
            this.form.scoreFlag = false
            return this.$message.warning("已存在评分节点无需再设置");
          }else{
            this.scoreFlagName = obj.nodeMark
          }
        }else{
          this.scoreFlagName= ""
          obj.scoreFlag = 0
        }
      }
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
      for (let i = 0; i < this.nodeMarkArr.length; i++) {
        // 工程量
        if (this.nodeMarkArr[i].nodeMark === this.form.id && type == "quantitiesTable") {
          this.nodeMarkArr[i].quantitiesTable = v == true ? 1 : 0;
          this.checkStatus = false;
          this.checkStatus = true;
          // return;
        }
        // 材料用量
        if (this.nodeMarkArr[i].nodeMark === this.form.id && type == "materialUsedTable") {
          this.nodeMarkArr[i].materialUsedTable = v == true ? 1 : 0;
          this.checkStatus = false;
          this.checkStatus = true;
          // return;
        }
        if (this.nodeMarkArr[i].nodeMark === this.form.id && type == "scoreFlag") {
          this.nodeMarkArr[i].scoreFlag = v == true ? 1 : 0;
          this.checkStatus = false;
          this.checkStatus = true;
          // return;
        }
        //工程评分
        // 1、后面已勾选 选前面
        // if (this.scoreFlagStatus == 1 && this.nodeMarkArr[i].nodeMark != this.form.id) {
        //   if (this.nodeMarkArr[i].scoreFlag == 1) {
        //     return this.$message.warning("已存在评分节点无需再设置");
        //   }
        // }
        // // 2、已勾选再取消（前面没选中，名字得不一样才能提示）
        // // 3、勾选了当前的 再取消
        // if (this.nodeMarkArr[i].nodeMark === this.form.id) {
        //   if (this.scoreFlagStatus == 1 && this.scoreFlagName == this.nodeMarkArr[i].nodeMark) {
        //     this.nodeMarkArr[i].scoreFlag = 0;
        //     this.scoreFlagStatus = 0;
        //     this.scoreFlagName = "";
        //   } else if (this.scoreFlagName != "") {
        //     return this.$message.warning("已存在评分节点无需再设置");
        //   } else {
        //     this.nodeMarkArr[i].scoreFlag = 1;
        //     this.scoreFlagStatus = this.nodeMarkArr[i].scoreFlag;
        //     this.scoreFlagName = this.nodeMarkArr[i].nodeMark;
        //   }
        //   this.checkStatus = false;
        //   this.checkStatus = true;
        //   break;
        // }
      }
    },
    // 用章人列表inChapterOne
    customizedInChapterOne() {
      this.$api.customizedInChapterOne({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code == 200) {
          this.chapterList = res.data;
        } else {
          this.chapterList = [];
          this.$message.warning(res.msg);
        }
      });
    },
    setOptionWidth(event) {
      // 下拉框弹出时，设置弹框的宽度
      this.$nextTick(() => {
        this.selectOptionWidth = event.srcElement.offsetWidth + "px";
      });
    },
    // 初始化
    init() {
      // this.tableIdForm = [];
      this.tableIdForm = [{ fkTableId: "" }];
      this.show = true;
      this.checkStatus = false;
      this.activeName = "general";
      if (this.formType.includes(this.businessObject.$type)) {
        this.extensionElements = this.businessObject.extensionElements || this.moddle.create("bpmn:ExtensionElements", { values: [] });
        this.modeling.updateProperties(this.element, {
          extensionElements: this.extensionElements
        });
        this.formProperty = this.extensionElements.values;

        //
      }
      // this.currentRow = "";
      // this.form = this.copy(this.businessObject);

      this.businessObjectType = this.businessObject.$type;
      // if (this.addTitle == "设计流程") {
      this.businessObject.$attrs.name = this.businessObject.name;
      if (this.businessObject.$type == "bpmn:UserTask") {
        if (this.businessObject.$attrs.nodeApproveType == undefined) {
          this.businessObject.$attrs.nodeApproveType = "0";
        }
      }
      if (this.businessObject.$type == "bpmn:Process") {
        this.businessObjectName = false;
      } else {
        this.businessObjectName = true;
      }

      // 开始
      // bpmn:UserTask
      if (this.businessObject.$type === "bpmn:UserTask" && this.nodeMarkArr.length === 0) {
        // if () {
        this.tableIdForm = [{ fkTableId: "" }];
        this.nodeMarkArr.push({ nodeMark: this.businessObject.id });
        // this.businessObject.$attrs.id = this.businessObject.id;
      } else if (this.businessObject.$type === "bpmn:UserTask" && this.nodeMarkArr.length != 0) {
        let matchingStatus = false;
        this.nodeMarkArr.forEach(item => {
          if (item.nodeMark == this.businessObject.id) {
            this.businessObject.$attrs.name = item.nodeName;
            this.modeling.updateProperties(this.element, { ["name"]: item.nodeName });
            this.businessObject.$attrs.unitId = item.roleType == undefined ? "" : item.roleType + "";
            this.businessObject.$attrs.fkRoleId = item.fkRoleId;
            this.businessObject.$attrs.tableIds = item.tableIds;
            this.businessObject.$attrs.materialUsedTable = item.materialUsedTable == "1" ? true : false;
            this.businessObject.$attrs.quantitiesTable = item.quantitiesTable == "1" ? true : false;
            this.businessObject.$attrs.scoreFlag = item.scoreFlag == "1" ? true : false;
            this.businessObject.$attrs.id = item.nodeMark;

            matchingStatus = true;
            if (item.tableDTOS != null && item.tableDTOS.length != 0) {
              let arr = JSON.stringify(item.tableDTOS);
              this.tableIdForm = JSON.parse(arr);
            } else {
              this.tableIdForm = [{ fkTableId: "" }];
            }
            this.form = this.businessObject.$attrs;
          }
        });
        if (!matchingStatus) {
          this.nodeMarkArr.push({ nodeMark: this.businessObject.id });
          // this.businessObject.$attrs.id = this.businessObject.id;
          // this.form = this.businessObject.$attrs;
        }
      }
      // form.unitId
      if (this.workflowType == 8) {
        this.businessObject.$attrs.unitId = "-1";
      }
      this.form = this.businessObject.$attrs;
      this.form.id = this.businessObject.id;
      // 处理可编辑内容第一次默认值问题
      if (this.businessObject.$attrs.materialUsedTable == undefined) {
        this.form.materialUsedTable = false;
      }
      if (this.businessObject.$attrs.quantitiesTable == undefined) {
        this.form.quantitiesTable = false;
      }
      if (this.businessObject.$attrs.scoreFlag == undefined) {
        this.form.scoreFlag = false;
      }
      this.checkStatus = false;
      this.checkStatus = true;
      // }
      // 结束

      // if(this.businessObject.$attrs.tableSource == undefined || this.businessObject.$attrs.tableSource== null || this.businessObject.$attrs.tableSource==""){
      //   this.businessObject.$attrs.tableSource ="0"
      // }
      // this.form = this.businessObject.$attrs;
      // if (this.businessObject.$attrs.tableIds != undefined && this.businessObject.$attrs.tableIds != null && this.businessObject.$attrs.tableIds.length && typeof this.businessObject.$attrs.tableIds == "string") {
      //   this.form.tableIds = this.businessObject.$attrs.tableIds.split(",");
      //   this.form.tableIds.forEach((item, idx) => {
      //     this.tableIdForm.push({ tableId: item, archives: false });
      //   });
      // } else {
      //   if (this.businessObject.$attrs.tableIds != undefined && this.businessObject.$attrs.tableIds.length != 0) {
      //     this.form.tableIds.forEach((item, idx) => {
      //       this.tableIdForm.push({ tableId: item, archives: false });
      //     });
      //   } else {
      //     this.tableIdForm = [{ tableId: "", archives: false }];
      //   }
      // }
      // if (this.businessObject.$attrs.archives != undefined && this.businessObject.$attrs.archives != null && this.businessObject.$attrs.archives.length && typeof this.businessObject.$attrs.archives == "string") {
      //   this.form.archives = this.businessObject.$attrs.archives.split(",");
      //   this.form.archives.forEach((item, idx) => {
      //     if (item == "" || item == 0) {
      //       item = false;
      //       this.tableIdForm[idx].archives = false;
      //     } else {
      //       item = true;
      //       this.tableIdForm[idx].archives = true;
      //     }
      //   });
      // } else {
      //   if (this.businessObject.$attrs.archives != undefined && this.businessObject.$attrs.archives.length != 0) {
      //     if (this.form.archives.length) {
      //       this.form.archives.forEach((item, idx) => {
      //         if (item == "" || item == 0 || item == null) {
      //           item = false;
      //           this.tableIdForm[idx].archives = false;
      //         } else {
      //           item = true;
      //           this.tableIdForm[idx].archives = true;
      //         }
      //       });
      //     }
      //   }
      // }
      // if (this.form.quantitiesTable == undefined) {
      //   this.form.quantitiesTable = false;
      // } else {
      //   if (this.form.quantitiesTable == "true") {
      //     this.form.quantitiesTable = true;
      //   } else if (this.form.quantitiesTable == "false") {
      //     this.form.quantitiesTable = false;
      //   } else {
      //     this.form.quantitiesTable = this.form.quantitiesTable == "1" ? true : false;
      //   }
      // }
      // if (this.form.materialUsedTable == undefined) {
      //   this.form.materialUsedTable = false;
      // } else {
      //   if (this.form.materialUsedTable == "true") {
      //     this.form.materialUsedTable = true;
      //   } else if (this.form.materialUsedTable == "false") {
      //     this.form.materialUsedTable = false;
      //   } else {
      //     this.form.materialUsedTable = this.form.materialUsedTable == "1" ? true : false;
      //   }
      // }
      // if (this.form.scoreFlag == undefined) {
      //   this.form.scoreFlag = false;
      // } else {
      //   if (this.form.scoreFlag == "true") {
      //     this.form.scoreFlag = true;
      //   } else if (this.form.scoreFlag == "false") {
      //     this.form.scoreFlag = false;
      //   } else {
      //     this.form.scoreFlag = this.form.scoreFlag == "1" ? true : false;
      //   }
      // }
      // // if (this.form.unitId != undefined && this.form.unitId != null && this.form.unitId.length != 0) {
      // //   let unitIdStatus = true
      // //   this.unitOptions.forEach(item => {
      // //     if (this.form.unitId == item.pkId) {
      // //       unitIdStatus = false
      // //     }
      // //   })
      // //   if (unitIdStatus) {
      // //     // this.form.unitId =""
      // //     // this.unitOptionsChang('unitId', "")
      // //     // this.unitOptionsChang('fkRoleId', "")
      // //     // this.form.fkRoleId =""
      // //   }
      // // }
      // // if(this.form.fkRoleId !=undefined && this.form.fkRoleId != null && this.form.fkRoleId.length !=0){
      // //   let fkRoleIdStatus = true
      // //   this.options.forEach(item=>{
      // //     if(this.form.unitId == item.pkId){
      // //       fkRoleIdStatus = false
      // //     }
      // //   })
      // //   if(fkRoleIdStatus){
      // //     this.unitOptionsChang('fkRoleId', "")
      // //   }
      // // }
      // // if (this.tableIdForm.length != 0) {
      // //   this.tableIdForm.forEach(item => {
      // //     let tableStatus = true
      // //     this.optionsList.forEach(e => {
      // //       if (item.tableId == e.pkId) {
      // //         tableStatus = false
      // //       }
      // //     })
      // //     if (tableStatus) {
      // //       item.tableId = ""
      // //       item.fkTableId = ""

      // //     }
      // //   })
      // // }
      // // if (this.flowTable.length != 0) {
      // //   this.$nextTick(() => {
      // //     this.flowTable.forEach(item => {
      // //       let flowTableStatus = true
      // //       this.formTypeArr.forEach(e => {
      // //         if (item.tableId == e.pkId) {
      // //           flowTableStatus = false
      // //         }
      // //       })
      // //       if (flowTableStatus) {
      // //         item.tableId = ""
      // //       }
      // //     })
      // //   })
      // // }
      // if (this.form.fkRoleId != undefined && this.form.fkRoleId != null && this.form.fkRoleId.length != 0) {
      //   this.$nextTick(() => {
      //     this.options.forEach(item => {
      //       if (this.form.fkRoleId == item.parentId) {
      //         this.form.fkRoleId = item.pkId;
      //         this.modeling.updateProperties(this.element, {
      //           ["fkRoleId"]: item.pkId
      //         });
      //       }
      //     });
      //   });
      // }
      this.checkStatus = false;
      this.checkStatus = true;
      // if(this.form.tableSource !=undefined &&this.form.tableSource !=null){
      // let ids = this.form.tableSource ==0?1:this.fkOrgId
      // this.customizedSearchTableVos(ids);
      // }
      // if (this.tableSource == 1) {
      //   this.form.tableSource = "1";
      // }
      // this.checkStatus = true;
    },
    // tableTypeChange(val) {
    // },
    customizedSearchTableVos() {
      let data = {};
      // if (id) {
      data = {
        fkOrgId: this.fkOrgId,
        dataTypeList: 3,
        fkEnginerringTypeId: this.fkEnginerringTypeId,
        fkProfessionalTypeId: this.fkProfessionalTypeId,
        workflowType: this.workflowType
      };
      // }

      // fkOrgId
      this.optionsList = [];
      this.$api.customizedSearchTableVos(data).then(res => {
        // this.optionsList
        if (res.code == 200) {
          this.optionsList = res.data;
          this.tableIdForm.forEach(item => {
            let tableStatus = true;
            this.optionsList.forEach(e => {
              if (item.fkTableId == e.pkId) {
                tableStatus = false;
              }
            });
            if (tableStatus) {
              item.fkTableId = "";
              item.fkTableId = "";
            }
          });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    formTypeArrList(id) {
      let data = {};
      // if (id) {

      data = {
        fkOrgId: id,
        dataTypeList: 3,
        fkEnginerringTypeId: this.fkEnginerringTypeId,
        fkProfessionalTypeId: this.fkProfessionalTypeId,
        workflowType: this.workflowType
      };
      // }

      this.formTypeArr = [];
      this.$api.customizedSearchTableVos(data).then(res => {
        if (res.code == 200) {
          this.formTypeArr = res.data;
          if (this.flowTable.length != 0) {
            this.$nextTick(() => {
              this.flowTable.forEach(item => {
                let flowTableStatus = true;
                this.formTypeArr.forEach(e => {
                  if (item.tableId == e.pkId) {
                    flowTableStatus = false;
                  }
                });
                if (flowTableStatus) {
                  item.tableId = "";
                }
              });
            });
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    //获取审批角色
    customizedAuditRole() {
      this.$api.customizedAuditRole({ fkOrgId: this.fkOrgId, workflowType: this.workflowType }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
          this.unitOptions.forEach(item => {
            if (item.roleType == this.form.unitId) {
              if (item.sysDefaultRoleList != "") {
                this.options = item.sysDefaultRoleList;
              } else {
                this.options = [];
              }
            }
          });
        }
      });
    },
    // 0：生产验收工序（子流程） 1：生产审批流程模板  2：业主计量审批审批流程模板  3：分包单位结算审批流程模板
    unitOptionsChang(type, v) {
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
      // if (this.addTitle != "新增流程") {
      if (this.form.fkRoleId) {
        this.modeling.updateProperties(this.element, {
          ["fkRoleId"]: null
        });
      }

      // }

      this.unitOptions.forEach(item => {
        if (item.roleType == v) {
          if (item.sysDefaultRoleList != "") {
            this.options = item.sysDefaultRoleList;
          } else {
            this.options = [];
            // this.form.
          }
        }
      });
      this.nodeMarkArr.forEach(item => {
        if (item.nodeMark === this.form.id) {
          if (type == "unitId") {
            item.roleType = v;
          }
          if (type == "fkUserId") {
            item.unitId = v;
          }
        }
      });
    },
    //修改表单
    updateForm(type, v) {
      if (this.form.nodeApproveType == 3) {
        this.form.tableIds = [];
        this.form.archives = [];
      }
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
      this.nodeMarkArr.forEach(item => {
        if (item.nodeMark === this.form.id) {
          if (type == "name") {
            item.nodeName = v;
          }
          if (type == "fkRoleId") {
            item.fkRoleId = v;
            this.options.forEach(e => {
              if (v == e.pkId) {
                item.roleName = e.roleName;
              }
            });
          }
          if (type == "nodeApproveType") {
            item.nodeApproveType = v;
          }
        }
      });
      this.checkStatus = false;
      this.checkStatus = true;
    },

    tableSourceForm(type, v) {
      this.modeling.updateProperties(this.element, {
        [type]: v
      });

      this.tableIdForm = [{ fkTableId: "", archives: false }];
      if (this.form.tableIds) {
        this.modeling.updateProperties(this.element, {
          ["tableIds"]: [{ fkTableId: "", archives: false }]
        });
      }
      // this.modeling.updateProperties(this.element, {
      //   ["tableIds"]: tableIds
      // });
      this.modeling.updateProperties(this.element, {
        ["archives"]: []
      });
    },
    updateFormd(type, v) {
      v = toString(v);
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
    },

    //修改表单字段
    updateFormProperty(type, v) {
      this.modeling.updateProperties(this.element, {
        extensionElements: this.extensionElements
      });
    },
    // 删除表单字段
    delFP() {
      let i = this.formProperty.findIndex(e => e.id == this.currentRow.id);
      this.formProperty.splice(i, 1);
      this.modeling.updateProperties(this.element, {
        extensionElements: this.extensionElements
      });
    },
    // 新增表单字段
    addFP() {
      //activiti:FormProperty里的FormProperty要与activiti.json保持
      let formProperty = this.moddle.create("activiti:FormProperty", {
        id: "FormProperty_" + this.random(100000, 999999)
      });
      this.extensionElements.get("values").push(formProperty);
      this.modeling.updateProperties(this.element, {
        extensionElements: this.extensionElements
      });
      // this.formProperty.push({id: "FormProperty_"+this.random(100000,999999),$type: "activiti:formProperty"})
    },
    // 获取随机数
    random(lower, upper) {
      return Math.floor(Math.random() * (upper - lower)) + lower;
    },
    // 选中表单字段行
    handleCurrentChange(row) {
      this.currentRow = row;
    },
    replacement() {
      this.businessObjectType = "12";
    },
    react() {
      this.nodeMarkArr = [];
      this.accessType = "1";
      this.tableIdForm = [{ fkTableId: "", archives: false }];
      this.flowTable = [{ tableId: "", isArchives: false, tableSource: "1" }];
      // [{ tableId: "", isArchives: false, tableSource: this.flowFormType }]
      this.launchType = "0";
      let data = {
        launchType: this.launchType,
        fkRoleId: this.fkRoleId
      };
      this.formTypeArrList(this.fkOrgId);
      this.$emit("pdfList", this.fieldListform);
      this.$emit("launchInit", data);
      (this.businessObjectType = "12"), (this.businessObjectName = false);
      this.customizedAuditRole();
    }
  }
};
</script>

<style lang="scss" scoped>
.panelWrapper {
  position: absolute;
  right: 0;
  top: 0;
  border-left: 1px solid #ccc;
  height: 100%;
  background-color: #fff;
  width: 410px;

  .panelHeader {
    /**  padding: 15px;
    padding-bottom: 5px;
    font-size: 120%;
    font-weight: bolder;*/
    background: #81d3f8;
    text-align: center;
    padding: 8px;
  }

  .panelForm {
    /**  padding:15px;*/
    .panleTitle {
      padding-left: 12px;
      line-height: 30px;
      background: #ccc;
      border: 1px solid;
      border-top: 2px solid;
    }

    .panleCenten {
      padding: 6px;
    }
  }
}

.tableBtn {
  padding: 0;
  font-size: 18px;
}

.title {
  line-height: 32px;
  font-size: 16px;
}
</style>
<style lang="scss" scoped>
.panelForm {
  .el-form-item {
    margin-bottom: 10px;
  }

  .el-form-item__label {
    /**  line-height: 20px;
    padding-bottom: 0;*/
  }
}

.fpTable {
  height: 150px;
  overflow-y: auto;

  td,
  th {
    padding: 0;
    cursor: pointer;
  }
}

a {
  display: none;
}

/deep/ .el-select__tags-text {
  width: 40px !important;
}

.table-pull-box {
  border-top: 1px solid;
  height: 100px;
  overflow: auto;
  padding: 5px;
  font-size: 11px;
}

.table-max-height {
  height: 50px;
}
.table-max-height {
  height: 60px;
}
.ast {
  /deep/ .el-form-item__label {
    padding: 0 !important;
  }
}
</style>
