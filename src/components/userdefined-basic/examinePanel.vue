<template>
  <div class="panelWrapper">
    <div class="panelHeader">{{ businessObjectName == true ? "节点信息" : workflowType == "0" || workflowType == "13" ? "工序信息" : "流程信息" }}</div>
    <el-form class="panelForm" :model="form" label-position="left">
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <div class="panleTitle"><i class="el-icon-info"></i> 节点名称</div>
        <div class="panleCenten" v-if="businessObjectName">
          <!-- <el-form-item label="节点名称"> -->
          <el-input size="mini" :disabled="forbidden" v-model="form.name" @change="v => updateForm('name', v)"></el-input>
          <!-- </el-form-item> -->
        </div>
      </div>
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <!-- <div class="panleTitle"><i class="el-icon-s-order"></i> 节点设置</div> -->
        <div class="panleTitle" v-if="workflowType == '8'"><i class="el-icon-s-order"></i> 节点类型</div>
        <div class="panleCenten">
          <el-radio-group v-if="workflowType == '8'" :disabled="forbidden" v-model="form.nodeApproveType" @change="v => updateForm('nodeApproveType', v)">
            <el-radio :label="'0'">审批节点</el-radio>
            <el-radio :label="'3'">盖章人节点</el-radio>
          </el-radio-group>
          <div v-if="form.nodeApproveType != 3">
            <!-- <div>{{workflowType != 8?"审批角色":"审批岗位"}}</div> -->
            <div class="panleTitle"><i class="el-icon-s-order"></i> {{ workflowType != 8 ? "审批角色" : "审批岗位" }}</div>
            <el-row>
              <el-col :span="12" v-if="workflowType != 8">
                <el-input size="mini" :disabled="true" v-model="form.roleTypeName"></el-input>
              </el-col>
              <el-col :span="12">
                <el-input size="mini" :disabled="true" v-model="form.roleName"></el-input>
              </el-col>
            </el-row>
          </div>
          <div v-if="form.nodeApproveType == 3">
            <div class="panleTitle"><i class="el-icon-s-order"></i>盖章人员</div>
            <el-row>
              <el-col :span="12">
                <el-input size="mini" :disabled="true" v-model="form.userName"></el-input>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="panleTitle" v-if="workflowType == '0' || workflowType == '13'"><i class="el-icon-s-order"></i>可编辑内容</div>
        <div style="padding: 4px" v-if="workflowType == '0' || workflowType == '13'">
          <!-- <div style="line-height: 20px">可编辑内容：</div> -->
          <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 13" v-model="form.quantitiesTable" @change="v => checkboxChange('quantitiesTable', v)" :disabled="forbidden">工程量</el-checkbox>
          <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 13" v-model="form.materialUsedTable" @change="v => checkboxChange('materialUsedTable', v)" :disabled="forbidden">材料用量</el-checkbox>
          <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 0" v-model="form.scoreFlag" @change="v => checkboxChange('scoreFlag', v)" :disabled="forbidden">工程评分</el-checkbox>
        </div>
      </div>
      <div v-if="businessObjectType == 'bpmn:UserTask' && workflowType != '' && form.nodeApproveType != 3" style="margin-top: 30px">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设计</div>
        <div class="table-pull-box" v-if="checkStatus" :class="{ 'table-max-height': workflowType == 0 || workflowType == 13 }">
          <el-row v-for="(item, index) in tableIdForm" :key="index" style="margin: 4px 0px">
            <el-col :span="14">
              <!-- <el-select disabled filterable v-model="item.tableId" placeholder="请选择" size="mini" @focus="setOptionWidth">
                <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName"
                  placement="left-start">
                  <el-option style="width:200px" :value="i.pkId" :label="i.tableName"></el-option>
                </el-tooltip>
              </el-select> -->
              <el-input size="mini" :disabled="true" v-model="item.tableName"></el-input>
            </el-col>
            <el-col :span="7" style="line-height: 22px; padding-left: 2px">
              <!-- <el-checkbox v-model="item.archives" v-if="user.orgType == 5" disabled>档案表</el-checkbox> -->
            </el-col>
            <el-col :span="3" style="line-height: 22px; padding-left: 2px">
              <!-- <i class="el-icon-circle-plus-outline" style="color: #2680f0;" v-if="index == 0" @click="tableIdsAdd"></i>
              <el-button type="danger" size="mini" style="padding: 0;" icon="el-icon-zoom-out" circle v-if="index != 0"
                @click="tableIdsShiftOut(index)"></el-button> -->
            </el-col>
          </el-row>
          <div v-if="tableIdForm.length == 0" class="no-data">暂无数据</div>
        </div>
        <!-- <div class="panleCenten">
          <div style="margin-top:10px">
            <div>审批角色</div>
            <el-col :span="7">
              <span>关联表格</span>
            </el-col>
            <el-col :span="17">
              <el-select :disabled="forbidden" filterable v-model="form.tableIds" placeholder="请选择" size="mini"
                @focus="setOptionWidth" @change="v => updateForm('tableIds', v)" multiple collapse-tags>
                <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName"
                  placement="left-start">
                  <el-option style="width:200px" :value="i.pkId" :label="i.tableName"></el-option>
                </el-tooltip>
              </el-select>
            </el-col>
          </div>
        </div> -->
      </div>
      <div v-if="!businessObjectName && workflowType != 0 && workflowType != 1 && workflowType != 13&& workflowType != 8">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 发起人设置</div>
        <div class="panleCenten">
          <div style="margin-top: 10px">
            <el-form-item label="" style="margin-right: 6px">
              <el-col :span="12">
                <el-input disabled size="mini" v-model="launchTypeName" />
              </el-col>
              <el-col :span="12" v-if="launchType == '1'">
                <el-input disabled size="mini" v-model="fkRoleId" />
              </el-col>
              <el-col :span="12" v-if="launchType == '2'">
                <el-input size="mini" disabled v-model="firstNode"></el-input>
              </el-col>
            </el-form-item>
          </div>
        </div>
      </div>
      <div v-if="!businessObjectName && workflowType != 0 && workflowType != 1 && workflowType != 13">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设计</div>
        <div class="panleCenten" style="height: 350px; overflow: auto">
          <div style="margin-top: 10px">
            <el-row v-for="(item, index) in flowTable" :key="index" style="margin: 4px 0px">
              <el-col :span="21">
                <!-- <el-select :disabled="forbidden" filterable v-model="item.tableId" placeholder="请选择" size="mini"
                  @focus="setOptionWidth">
                  <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName"
                    placement="left-start">
                    <el-option style="width:200px" :value="i.pkId" :label="i.tableName"></el-option>
                  </el-tooltip>
                </el-select> -->
                <el-input size="mini" :disabled="true" v-model="item.tableName"></el-input>
              </el-col>
              <!-- <el-col :span="3" style="line-height: 22px;padding-left: 2px;" v-if="forbidden == false">
                <i class="el-icon-circle-plus-outline"
                  style="color: #2680f0;font-weight: 800;font-size: 18px;vertical-align: bottom;" v-if="index == 0"
                  @click="flowTableAdd"></i>
                <i class="el-icon-remove-outline"
                  style="color: red;font-weight: 800;font-size: 18px;vertical-align: bottom;" v-if="index != 0"
                  @click="flowTableDelete(index)"></i>
              </el-col> -->
            </el-row>
            <div v-if="flowTable.length == 0" class="no-data">暂无数据</div>
          </div>
        </div>
      </div>
      <div v-if="(workflowType == '0' || workflowType == '13') && !businessObjectName">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 关联资料</div>
        <el-form-item label="技术规范" class="ast" label-width="70px" v-if="fieldListform.technology != undefined && fieldListform.technology != null && fieldListform.technology.length != 0">
          <el-col :span="11">
            <el-form-item prop="date1">
              <!-- <el-select clearable placeholder="请选择" @change="pdfListChage" size="mini" :disabled="addTitle == '查看流程'" v-model="fieldListform.technology">
                <el-option v-for="i in technologyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
              </el-select> -->
              <el-input :value="fieldListform.technology" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-input size="mini" disabled :value="fieldListform.jsThePage" />
          </el-col>
          <el-col :span="2">
            <span>页</span>
          </el-col>
          <el-col :span="4">
            <el-input size="mini" disabled :value="fieldListform.jsToPage" />
          </el-col>
          <el-col :span="1">
            <span>页</span>
          </el-col>
        </el-form-item>
        <el-form-item label="安全规范" class="ast" label-width="70px" v-if="fieldListform.safety != undefined && fieldListform.safety != null && fieldListform.safety.length != 0">
          <el-col :span="11">
            <el-form-item prop="date1">
              <el-input :value="fieldListform.safety" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-input disabled size="mini" :value="fieldListform.aqThePage" />
          </el-col>
          <el-col :span="2">
            <span>页</span>
          </el-col>
          <el-col :span="4">
            <el-input disabled size="mini" :value="fieldListform.aqToPage" />
          </el-col>
          <el-col :span="1">
            <span>页</span>
          </el-col>
        </el-form-item>
        <el-form-item label="验收标准" class="ast" label-width="70px" v-if="fieldListform.standard != undefined && fieldListform.standard != null && fieldListform.standard.length != 0">
          <el-col :span="11">
            <el-form-item prop="date1">
              <el-input :value="fieldListform.standard" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-input disabled size="mini" :value="fieldListform.ysThePage" />
          </el-col>
          <el-col :span="2">
            <span>页</span>
          </el-col>
          <el-col :span="4">
            <el-input disabled size="mini" :value="fieldListform.ysToPage" />
          </el-col>
          <el-col :span="1">
            <span>页</span>
          </el-col>
        </el-form-item>
        <div class="no-data" v-if="(fieldListform.technology == undefined || fieldListform.technology == null || fieldListform.technology.length == 0) && (fieldListform.safety == undefined || fieldListform.safety == null || fieldListform.safety.length == 0) && (fieldListform.standard == undefined || fieldListform.standard == null || fieldListform.standard.length == 0)">暂无数据</div>
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
    fkProfessionalTypeId: {
      default: "",
      type: String
    },
    fkEnginerringTypeId: {
      default: "",
      type: String
    },
    workflowType: {
      default: "",
      type: String
    },
    flowTableArr: [],
    fkOrgId: {
      default: "",
      type: String
    },
    warehouseType: "",
    fkWorkflowId: "",
    dataList: {},
    formTypeArr: []
  },
  data() {
    return {
      show: false,
      activeName: "general",
      form: {
        nodeApproveType: "0"
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
      businessObjectName: true,
      businessObjectType: "12",
      selectOptionWidth: "",
      optionsList: [],
      checkStatus: true,
      tableIdForm: [],
      flowTable: [{ tableId: "" }],
      bookPdfs: [],
      flowFormType: "",
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

      launchType: "",
      launchTypeName: "",
      fkRoleId: "",
      firstNode: ""
    };
  },
  // mounted() {
  //   this.customSysAuditRole();
  //   this.baseTableSearch();
  //   this.tableIdInit();
  // },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {
    // "form.unitId": function (newVal, oldVal) {
    //   if (newVal != undefined) {
    //     this.unitOptions.forEach(item => {
    //       if (item.roleType == newVal) {
    //         if (item.sysDefaultRoleList != "") {
    //           this.options = item.sysDefaultRoleList;
    //         } else {
    //           this.options = [];
    //         }
    //       }
    //     });
    //   }
    // },
    fkProfessionalTypeId: function(newVal, oldVal) {
      // this.baseTableSearch()
    },
    fkEnginerringTypeId: function(newVal, oldVal) {
      // this.baseTableSearch()
    }
    // workflowType(val) {
    //   this.$api.customizedAuditRole({ fkOrgId: this.fkOrgId }).then(res => {
    //     if (res.code == 200) {
    //       res.data.forEach(item => {
    //         item.roleType = item.roleType + ""
    //       })
    //       this.unitOptions = res.data;
    //     }
    //   });
    // },
  },
  methods: {
    tableIdInit(data) {
      // this.businessObjectType = ""
      // if (this.flowTableArr != null && this.flowTableArr != undefined && this.flowTableArr.length != 0) {
      //   this.flowTable = []
      //   this.flowTableArr.forEach(item => {
      //     this.flowTable.push({ tableId: item })
      //   })
      // }
      // this.customSysAuditRole();
      this.businessObjectName = false;
      // this.baseTableSearch();
      this.launchType = data.launchType + "";
      if (this.launchType == "0") {
        this.launchTypeName = "不限";
      } else if (this.launchType == "1") {
        this.launchTypeName = "指定岗位";
      } else if (this.launchType == "2") {
        this.launchTypeName = "首个流程节点岗位";
      }
      this.flowTable = data.workflowTableList ? data.workflowTableList : [];
      this.fkRoleId = data.fkRoleIdName;
      this.firstNode = data.workflowNodeDTOS[1].roleName;
      console.log("a", data.bookPdfs);
      if ((data.workflowType == "0" || data.workflowType == "13") && data.bookPdfs.length != 0) {
        data.bookPdfs.forEach(item => {
          if (item.bookType == 0) {
            this.fieldListform.technology = item.bookName;
            this.fieldListform.jsThePage = item.beginPage;
            this.fieldListform.jsToPage = item.endPage;
          } else if (item.bookType == 1) {
            this.fieldListform.safety = item.bookName;
            this.fieldListform.aqThePage = item.beginPage;
            this.fieldListform.aqToPage = item.endPage;
          } else if (item.bookType == 2) {
            this.fieldListform.standard = item.bookName;
            this.fieldListform.ysThePage = item.beginPage;
            this.fieldListform.ysToPage = item.endPage;
          }
        });
      }
      console.log("ffff", this.businessObjectName);
    },
    checkboxChange(type, v) {
      this.checkStatus = false;
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
      this.checkStatus = true;
    },
    setOptionWidth(event) {
      // 下拉框弹出时，设置弹框的宽度
      this.$nextTick(() => {
        this.selectOptionWidth = event.srcElement.offsetWidth + "px";
      });
    },
    baseTableSearch() {
      this.optionsList = [];

      // this.$api.baseTableSearch({ dataTypeList: 3, fkEnginerringTypeId: this.fkEnginerringTypeId, fkProfessionalTypeId: this.fkProfessionalTypeId }).then(res => {
      //   if (res.code == 200) {
      //     this.optionsList = res.data;
      //   } else {
      //     this.$message.warning(res.msg);
      //   }
      // });
      // updateSearchTableVos
      let data = {
        fkWorkflowId: this.fkWorkflowId,
        fkProfessionalTypeId: this.fkProfessionalTypeId
      };
      this.$api.searchTableVos(data).then(res => {
        if (res.code == 200) {
          this.optionsList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 初始化
    init() {
      this.checkStatus = false;
      this.show = true;
      this.tableIdForm = [];
      this.activeName = "general";
      this.form = this.businessObject;
      this.businessObject.fkRoleId = this.businessObject.$attrs.fkRoleId;
      this.businessObject.nodeApproveType = this.businessObject.$attrs.nodeApproveType;
      this.businessObject.unitId = this.businessObject.$attrs.unitId;
      this.businessObject.tableSource = this.businessObject.$attrs.tableSource;
      this.businessObject.materialUsedTable = this.businessObject.$attrs.materialUsedTable;
      this.businessObject.quantitiesTable = this.businessObject.$attrs.quantitiesTable;
      this.businessObject.scoreFlag = this.businessObject.$attrs.scoreFlag;
      this.businessObjectType = this.businessObject.$type;
      this.form = this.businessObject;

      // this.checkStatus = false
      // this.checkStatus = true

      // if (this.businessObject.$attrs.tableIds != undefined && this.businessObject.$attrs.tableIds != null && this.businessObject.$attrs.tableIds.length && typeof this.businessObject.$attrs.tableIds == 'string') {
      //   this.form.tableIds = this.businessObject.$attrs.tableIds.split(",");
      //   this.form.tableIds.forEach((item, idx) => {
      //     this.tableIdForm.push({ tableId: item, archives: false })
      //   })
      // } else {
      //   if (this.businessObject.$attrs.tableIds != undefined && this.businessObject.$attrs.tableIds.length != 0) {
      //     console.log("==============================")
      //     console.log(this.businessObject.$attrs.tableIds)
      //     console.log("==============================")
      //     this.form.tableIds.forEach((item, idx) => {
      //       this.tableIdForm.push({ tableId: item, archives: false })
      //     })
      //   } else {
      //     this.tableIdForm = [{ tableId: "", archives: false }]
      //   }
      // }
      // if (this.businessObject.$attrs.archives != undefined && this.businessObject.$attrs.archives != null && this.businessObject.$attrs.archives.length && typeof this.businessObject.$attrs.archives == "string") {
      //   this.form.archives = this.businessObject.$attrs.archives.split(",");
      //   this.form.archives.forEach((item, idx) => {
      //     if (item == '' || item == 0) {
      //       item = false
      //       this.tableIdForm[idx].archives = false
      //     } else {
      //       item = true
      //       this.tableIdForm[idx].archives = true
      //     }
      //   })
      // } else {
      //   if (this.businessObject.$attrs.archives != undefined) {
      //     this.form.archives.forEach((item, idx) => {
      //       if (item == '' || item == 0) {
      //         item = false
      //         this.tableIdForm[idx].archives = false
      //       } else {
      //         item = true
      //         this.tableIdForm[idx].archives = true
      //       }

      //     })
      //   }
      // }

      if (this.form.quantitiesTable == undefined) {
        this.form.quantitiesTable = false;
      } else {
        if (this.form.quantitiesTable == "true") {
          this.form.quantitiesTable = true;
        } else if (this.form.quantitiesTable == "false") {
          this.form.quantitiesTable = false;
        } else {
          this.form.quantitiesTable = this.form.quantitiesTable == "1" ? true : false;
        }
      }
      if (this.form.materialUsedTable == undefined) {
        this.form.materialUsedTable = false;
      } else {
        if (this.form.materialUsedTable == "true") {
          this.form.materialUsedTable = true;
        } else if (this.form.materialUsedTable == "false") {
          this.form.materialUsedTable = false;
        } else {
          this.form.materialUsedTable = this.form.materialUsedTable == "1" ? true : false;
        }
      }
      if (this.form.scoreFlag == undefined) {
        this.form.scoreFlag = false;
      } else {
        if (this.form.scoreFlag == "true") {
          this.form.scoreFlag = true;
        } else if (this.form.scoreFlag == "false") {
          this.form.scoreFlag = false;
        } else {
          this.form.scoreFlag = this.form.scoreFlag == "1" ? true : false;
        }
      }
      // if (this.form.fkRoleId != undefined && this.form.fkRoleId != null && this.form.fkRoleId.length != 0) {
      //   // debugger
      //   this.$nextTick(() => {
      //     this.options.forEach(item => {
      //       if (this.form.fkRoleId == item.parentId) {
      //         this.form.fkRoleId = item.pkId
      //         this.modeling.updateProperties(this.element, {
      //           ['fkRoleId']: item.pkId
      //         });
      //       }
      //     })
      //   })
      // }
      // if (this.form.unitId != undefined && this.form.unitId != null && this.form.unitId.length != 0) {
      //   let unitIdStatus = true
      //   this.unitOptions.forEach(item => {
      //     if (this.form.unitId == item.pkId) {
      //       unitIdStatus = false
      //     }
      //   })
      //   if (unitIdStatus) {
      //     this.form.unitId = ""
      //     this.form.fkRoleId = ""
      //   }
      // }
      //
      // if (this.form.fkUserId != undefined && this.form.fkUserId != null && this.form.fkUserId.length != 0) {
      //   let fkUserIdStatus = true
      //   this.chapterList.forEach(item => {
      //     if (this.form.fkUserId == item.pkId) {
      //       fkUserIdStatus = false
      //     }
      //   })
      //   if (fkUserIdStatus) {
      //     this.form.fkUserId = ""
      //   }
      // }
      // if(this.form.fkRoleId !=undefined && this.form.fkRoleId != null && this.form.fkRoleId.length !=0){
      //   let fkRoleIdStatus = true
      //   this.options.forEach(item=>{
      //     if(this.form.unitId == item.pkId){
      //       fkRoleIdStatus = false
      //     }
      //   })
      //   if(fkRoleIdStatus){
      //     this.form.fkRoleId =""
      //   }
      // }
      // if (this.tableIdForm.length != 0) {
      //   this.tableIdForm.forEach(item => {
      //     let tableStatus = true
      //     this.optionsList.forEach(e => {
      //       if (item.tableId == e.pkId) {
      //         tableStatus = false
      //       }
      //     })
      //     if (tableStatus) {
      //       item.tableId = ""
      //     }
      //   })
      // }
      // if (this.flowTable.length != 0) {
      //   this.flowTable.forEach(item => {
      //     let flowTableStatus = true
      //     this.optionsList.forEach(e => {
      //       if (item.tableId == e.pkId) {
      //         flowTableStatus = false
      //       }
      //     })
      //     if (flowTableStatus) {
      //       item.tableId = ""
      //     }
      //   })
      // }
      console.log("xxxxxxxxxxxxxx点击时间xxxxxxxxxxxx");
      console.log(this.form);
      console.log(this.dataList);
      console.log("xxxxxxxxxxxxxx点击时间xxxxxxxxxxxx");
      if (this.dataList.workflowNodeDTOS != undefined && this.dataList.workflowNodeDTOS != null) {
        this.dataList.workflowNodeDTOS.forEach(item => {
          if (item.nodeMark == this.form.id) {
            //  debugger
            this.form.roleName = item.roleName;
            this.form.roleTypeName = item.roleTypeName;
            this.form.userName = item.userName;
            // 节点数据从后端数据取 新增三行
            this.form.materialUsedTable = item.materialUsedTable == "1" ? true : false;
            this.form.quantitiesTable = item.quantitiesTable == "1" ? true : false;
            this.form.scoreFlag = item.scoreFlag == "1" ? true : false;
            if (item.tableDTOS != null && item.tableDTOS.length != 0) {
              item.tableDTOS.forEach(e => {
                if (e.isArchives == 1) {
                  e.archives = true;
                } else {
                  e.archives = false;
                }
              });
              this.tableIdForm = item.tableDTOS;
            }
            //
          }
        });
      }
      this.flowTable = [];
      if (this.dataList.workflowTableList != undefined && this.dataList.workflowTableList != null && this.dataList.workflowTableList.length != 0) {
        this.dataList.workflowTableList.forEach(item => {
          this.flowTable.push(item);
        });
        console.log("Xxxxxxxxxxxxxxxxxxxxxx");
        console.log(this.dataList.workflowTableList);
        console.log(this.flowTable);
        console.log("Xxxxxxxxxxxxxxxxxxxxxx");
      }
      this.checkStatus = false;
      this.bookPdfs = [];
      if (this.workflowType == "0" || this.workflowType == "13") {
        this.bookPdfs = this.dataList.bookPdfs ? this.dataList.bookPdfs : [];
      }
      if (this.businessObject.$type == "bpmn:Process") {
        this.businessObjectName = false;
      } else {
        this.businessObjectName = true;
      }
      this.checkStatus = true;
    },
    //获取审批角色
    customSysAuditRole() {
      console.log("Xxxxxxxxxxxxxxxxxxxxxx");
      console.log(this.workflowType);
      console.log("Xxxxxxxxxxxxxxxxxxxxxx");
      let data = { workflowType: this.workflowType };
      // console.log("Xxxxxxxxxxxxxxxxxxxxxx")
      // warehouseType
      // if (this.warehouseType.length != 0) {
      //   data.warehouseType = this.warehouseType
      // }
      this.$api.customSysAuditRole(data).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
        }
      });
    },
    unitOptionsChang(type, v) {
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
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
    },
    //修改表单
    updateForm(type, v) {
      this.modeling.updateProperties(this.element, {
        [type]: v
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

.table-pull-box {
  border-top: 1px solid;
  height: 130px;
  overflow: scroll;
  padding: 5px;
  font-size: 11px;
}
.table-pull-box::-webkit-scrollbar {
  width: 20px;
}

.table-pull-box::-webkit-scrollbar-track {
  // background-color: ;
}

.table-pull-box::-webkit-scrollbar-thumb {
  background: #7c7c7c;
  border-radius: 25px;
}
.table-max-height {
  height: 160px;
}
.no-data {
  line-height: 40px;
  font-size: 16px;
  text-align: center;
}
</style>
