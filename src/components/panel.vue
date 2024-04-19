<template>
  <div class="panelWrapper">
    <div class="panelHeader">{{ businessObjectName == true ? "节点信息" : workflowType == "0" || workflowType == "13" ? "工序信息" : "流程信息" }}</div>
    <el-form class="panelForm" :model="form" label-position="left">
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <div class="panleTitle"><i class="el-icon-info"></i> 节点名称</div>
        <div class="panleCenten">
          <!-- <el-form-item label="节点名称" v-if="businessObjectName"> -->
          <el-input size="mini" maxlength="25" :disabled="forbidden" v-model="form.name" @change="v => updateForm('name', v)"></el-input>
          <!-- </el-form-item> -->
        </div>
      </div>
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 审批角色</div>
        <div class="panleCenten">
          <!-- 节点类型
          <el-radio-group :disabled="forbidden" v-model="form.nodeApproveType" @change="v => updateForm('nodeApproveType', v)">
            <el-radio :label="'0'">审批节点</el-radio>
          </el-radio-group> -->
          <div>
            <!-- <div>审批角色</div> -->
            <el-row>
              <el-col :span="12">
                <el-select :disabled="forbidden" v-model="form.unitId" placeholder="请选择" size="mini" @change="v => unitOptionsChang('unitId', v)">
                  <el-option v-for="item in unitOptions" :key="item.roleType" :label="item.roleName" :value="item.roleType"> </el-option>
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-select :disabled="forbidden" v-if="checkStatus" v-model="form.fkRoleId" placeholder="请选择" size="mini" @change="v => updateForm('fkRoleId', v)">
                  <el-option v-for="item in options" :key="item.pkId" :label="item.roleName" :value="item.pkId"> </el-option>
                </el-select>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="panleTitle" v-if="workflowType == '0' || workflowType == '13'"><i class="el-icon-s-order"></i> 可编辑内容：</div>
        <div v-if="workflowType == '0' || workflowType == '13'" style="padding: 2px">
          <!-- <div style="line-height: 20px">可编辑内容：</div> -->

          <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 13" v-model="form.quantitiesTable" @change="v => checkboxChange('quantitiesTable', v)" :disabled="forbidden">工程量</el-checkbox>
          <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 13" v-model="form.materialUsedTable" @change="v => checkboxChange('materialUsedTable', v)" :disabled="forbidden">材料用量</el-checkbox>
          <el-checkbox style="margin: 0" v-if="checkStatus && workflowType != 0" v-model="form.scoreFlag" @change="v => checkboxChange('scoreFlag', v)" :disabled="forbidden || (!!scoreFlagName && scoreFlagName != form.id)">工程评分</el-checkbox>
        </div>
      </div>
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设计</div>
        <div class="panleCenten">
          <div v-if="checkStatus" class="table-pull-box" :class="{ 'table-max-height': workflowType == 0 || workflowType == 13 }">
            <!-- <el-col :span="7">
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
            </el-col> -->
            <el-row v-for="(item, index) in tableIdForm" :key="index" style="margin: 4px 0px">
              <el-col :span="21">
                <el-select style="width: 100%" :disabled="forbidden" filterable v-model="item.fkTableId" clearable placeholder="请选择" size="mini" @focus="setOptionWidth" @change="v => tableIdChange()">
                  <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                    <el-option :disabled="tableIdForm.find(s => s.fkTableId === i.pkId) == undefined ? false : true" :value="i.pkId" :label="i.tableName"></el-option>
                  </el-tooltip>
                </el-select>
              </el-col>
              <el-col :span="3" style="line-height: 22px; padding-left: 2px">
                <i class="el-icon-circle-plus-outline" style="color: #2680f0; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index == 0" @click="tableIdsAdd"></i>
                <i class="el-icon-remove-outline" style="color: red; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index != 0" @click="tableIdsShiftOut(index)"></i>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      <div v-if="!businessObjectName && workflowType != 0 && workflowType != 1 && workflowType != 13">
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
                <el-input size="mini" disabled v-model="firstNode.roleName"></el-input>
              </el-col>
            </el-form-item>
          </div>
        </div>
      </div>
      <div v-if="!businessObjectName && workflowType != 0 && workflowType != 1 && workflowType != 13">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设计</div>
        <div class="panleCenten" style="height: 300px; overflow: auto">
          <div style="margin-top: 10px" v-if="launchType != '2'">
            <el-row v-for="(item, index) in flowTable" :key="index" style="margin: 4px 0px">
              <el-col :span="21">
                <el-select style="width: 100%" :disabled="forbidden" filterable v-model="item.tableId" clearable @change="flowTableChange" placeholder="请选择" size="mini" @focus="setOptionWidth">
                  <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                    <el-option :disabled="flowTable.find(s => s.tableId === i.pkId) == undefined ? false : true" :value="i.pkId" :label="i.tableName"></el-option>
                  </el-tooltip>
                </el-select>
              </el-col>
              <el-col :span="3" style="line-height: 22px; padding-left: 2px" v-if="forbidden == false">
                <i class="el-icon-circle-plus-outline" style="color: #2680f0; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index == 0" @click="flowTableAdd"></i>
                <i class="el-icon-remove-outline" style="color: red; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index != 0" @click="flowTableDelete(index)"></i>
              </el-col>
            </el-row>
          </div>
          <div v-else>
            <div v-for="item in firstNode.tableDTOS" :key="item.fkTableId">
              <i class="el-icon-s-grid">{{ item.tableName }}</i>
            </div>
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
        <!-- <div class="panleCenten" style="height:350px;overflow: auto;">
          <div style="margin-top:10px">
            <el-row v-for="(item, index) in flowTable" :key="index" style="margin: 4px 0px;">
              <el-col :span="21">
                <el-select :disabled="forbidden" filterable v-model="item.tableId" clearable @change="flowTableChange"
                  placeholder="请选择" size="mini" @focus="setOptionWidth">
                  <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName"
                    placement="left-start">
                    <el-option style="width:200px" :disabled="flowTable.find(s => s.tableId === i.pkId) == undefined?false:true" :value="i.pkId" :label="i.tableName"></el-option>
                  </el-tooltip>
                </el-select>
              </el-col>
              <el-col :span="3" style="line-height: 22px;padding-left: 2px;" v-if="forbidden == false">
                <i class="el-icon-circle-plus-outline"
                  style="color: #2680f0;font-weight: 800;font-size: 18px;vertical-align: bottom;" v-if="index == 0"
                  @click="flowTableAdd"></i>
                <i class="el-icon-remove-outline"
                  style="color: red;font-weight: 800;font-size: 18px;vertical-align: bottom;" v-if="index != 0"
                  @click="flowTableDelete(index)"></i>
              </el-col>
            </el-row>
          </div>
        </div> -->
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
    fkProfessionalTypeId: {
      default: "",
      type: String
    },
    fkEnginerringTypeId: {
      default: "",
      type: String
    },
    sourceType: {
      default: "",
      type: String
    },
    flowTableArr: [],
    roleType: "",
    warehouseType: ""
    // fieldListform:{}
  },
  data() {
    return {
      show: false,
      activeName: "general",
      form: {
        nodeApproveType: "0",
        materialUsedTable: false,
        quantitiesTable: false,
        scoreFlag: false
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
      selectOptionWidth: "",
      optionsList: [],
      checkStatus: true, // 控制可编辑内容 材料 工程评分 展示
      flowTable: [{ tableId: "" }],
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
      firstNode: {},
      fkRoleIdArr: [],
      accessType: "1", //1 新增  //2编辑
      nodeMarkArr: [],
      scoreFlagStatus: 0, // 控制不让选评分
      scoreFlagName: ""
    };
  },
  mounted() {
    // this.searchTableVosList();
    console.log(this.accessType, this.workflowType);
    if (this.accessType == "1" && this.workflowType == 5) {
      this.searchTableVosList();
    }
    if (this.accessType == "1" && !this.unitOptions.length && this.workflowType) {
      this.$api.searchSysAuditRole({ workflowType: this.workflowType }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
          this.form.unitId = "";
          this.form.fkRoleId = "";
        }
      });
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
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
    // workflowType(val) {
    //   this.$api.searchSysAuditRole({ workflowType: val }).then(res => {
    //     // debugger
    //     if (res.code == 200) {
    //       res.data.forEach(item => {
    //         item.roleType = item.roleType + "";
    //       });
    //       this.unitOptions = res.data;
    //       this.form.unitId = "";
    //       this.form.fkRoleId = "";
    //     }
    //   });
    //   if (this.accessType == "1" && this.workflowType == 5) {
    //     this.searchTableVosList();
    //   }
    // },

    fkProfessionalTypeId(val) {
      this.searchTableVosList();
      if (this.workflowType == "0" || this.workflowType == "13") {
        this.quotePdfListByType();
      }
    },
    fkEnginerringTypeId(val) {
      this.searchTableVosList();
    },

    roleType(val) {
      this.$api.searchSysAuditRole({ workflowType: this.workflowType, roleType: val }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
          this.form.unitId = "";
          this.form.fkRoleId = "";
        }
      });
    },
    warehouseType(val) {
      this.$api.searchSysAuditRole({ workflowType: this.workflowType, warehouseType: val }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
          this.form.unitId = "";
          this.form.fkRoleId = "";
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
        this.flowTable = [{ tableId: "" }];
        // console.log(this.pitchOnDate[0].workflowNodes[1]);
        // this.firstNode = this.pitchOnDate[0].workflowNodes[1];
        this.firstNode = this.nodeMarkArr.length ? this.nodeMarkArr[0] : {};
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
        workflowType: this.workflowType
      };
      if (data.workflowType == 5) {
        data.warehouseType = this.warehouseType;
      }
      this.$api.searchAppointRole(data).then(res => {
        if (res.code == 200) {
          this.fkRoleIdArr = res.data;
        } else {
          this.fkRoleIdArr = [];
          this.$message.warning(res.msg);
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
        this.fieldListform.technology = "";
        // this.$emit("pdfList", this.fieldListform);
        // return;
      } else {
        let sum = 0;
        this.technologyDate.forEach(item => {
          if (item.pkId == this.fieldListform.technology) {
            sum = item.bookPages;
          }
        });
        this.fieldListform.jsThePage = 1;
        this.fieldListform.jsToPage = sum - 0;
      }

      this.$emit("pdfList", this.fieldListform);
    },
    // 技术规范开始页
    jsThePageChang(val) {
      console.log("1111111");
      if (this.fieldListform.technology == "" || this.fieldListform.technology == null) {
        this.fieldListform.jsThePage = "";
        return this.$message({
          type: "warning",
          message: "请先选择技术规范"
        });
      }
      if (this.fieldListform.jsThePage == 0 || this.fieldListform.jsThePage == "") {
        this.fieldListform.jsThePage = "";
        return this.$message({
          type: "warning",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.technologyDate.forEach(item => {
        if (item.pkId == this.fieldListform.technology) {
          sum = item.bookPages;
        }
      });
      if (val > sum) {
        this.fieldListform.jsThePage = 1;
        this.$emit("pdfList", this.fieldListform);
        this.$message.warning("开始页数不能大于文件总页数");
        return;
      }

      if (val - 0 > this.fieldListform.jsToPage - 0 && this.fieldListform.jsToPage != "") {
        this.fieldListform.jsThePage = 1;
        this.$emit("pdfList", this.fieldListform);
        this.$message.warning("开始页数不能大于结束页数");
        return;
      }

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
      this.$emit("pdfList", this.fieldListform);
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
        this.$emit("pdfList", this.fieldListform);
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
        // this.$emit("pdfList", this.fieldListform);
        // return;
        this.fieldListform.safety = "";
      } else {
        let sum = 0;
        this.safetyDate.forEach(item => {
          if (item.pkId == this.fieldListform.safety) {
            sum = item.bookPages;
          }
        });
        this.fieldListform.aqThePage = 1;
        this.fieldListform.aqToPage = sum - 0;
      }

      // alert
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
          type: "warning",
          message: "请先选择安全规范"
        });
      }
      if (this.fieldListform.aqThePage == 0 || this.fieldListform.aqThePage == "") {
        return this.$message({
          type: "warning",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.safetyDate.forEach(item => {
        if (item.pkId == this.fieldListform.safety) {
          sum = item.bookPages;
        }
      });
      if (val > sum) {
        this.fieldListform.aqThePage = 1;
        this.$emit("pdfList", this.fieldListform);
        this.$message({
          type: "warning",
          message: "开始页数不能大于文件总页数"
        });
        return;
      }
      if (val - 0 > this.fieldListform.aqToPage - 0 && this.fieldListform.aqToPage != "") {
        this.fieldListform.aqThePage = 1;
        this.$emit("pdfList", this.fieldListform);
        this.$message.warning("开始页数不能大于结束页数");
        return;
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
          type: "warning",
          message: "请先选择安全规范"
        });
      }
      if (this.fieldListform.aqToPage == 0 || this.fieldListform.aqToPage == "") {
        return this.$message({
          type: "warning",
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
        this.$message.warning("结束页数不能小于开始页数 或 大于文件总页数");
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
        // this.$emit("pdfList", this.fieldListform);
        // return;
        this.fieldListform.standard = "";
      } else {
        let sum = 0;
        this.acceptanceLevel.forEach(item => {
          if (item.pkId == this.fieldListform.standard) {
            sum = item.bookPages;
          }
        });
        this.fieldListform.ysThePage = 1;
        this.fieldListform.ysToPage = sum - 0;
      }

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
          type: "warning",
          message: "请先选择验收标准"
        });
      }
      if (this.fieldListform.ysThePage == 0 || this.fieldListform.ysThePage == "") {
        return this.$message({
          type: "warning",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.acceptanceLevel.forEach(item => {
        if (item.pkId == this.fieldListform.standard) {
          sum = item.bookPages;
        }
      });
      if (val > sum) {
        this.fieldListform.ysThePage = 1;
        this.$message({
          type: "warning",
          message: "开始页数不能大于文件总页数"
        });
        return;
      }
      if (val - 0 > this.fieldListform.ysToPage - 0 && this.fieldListform.ysToPage != "") {
        this.fieldListform.ysThePage = 1;
        this.$message.warning("开始页不能大于结束页");
        this.$emit("pdfList", this.fieldListform);
        return;
      }

      // else {
      //   this.fieldListform.ysToPage = sum;
      // }

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
          type: "warning",
          message: "请先选择验收标准"
        });
      }
      if (this.fieldListform.ysToPage == 0 || this.fieldListform.ysToPage == "") {
        return this.$message({
          type: "warning",
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
        this.$message.warning("结束页数不能小于开始页数 或 大于文件总页数");
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
        .quotePdfListByType({
          bookType: 0,
          // enginerringTypeName: "",
          // bookName: "",
          fkProfessionalTypeId: this.fkProfessionalTypeId
          // fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.technologyDate = res.data;
          }
        });
      this.$api
        .quotePdfListByType({
          bookType: 1,
          // enginerringTypeName: "",
          // bookName: "",
          fkProfessionalTypeId: this.fkProfessionalTypeId
          // fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.safetyDate = res.data;
          }
        });
      this.$api
        .quotePdfListByType({
          bookType: 2,
          // enginerringTypeName: "",
          // bookName: "",
          fkProfessionalTypeId: this.fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.acceptanceLevel = res.data;
          }
        });
    },

    tableIdInit(data) {
      this.accessType = "2";
      this.nodeMarkArr = [];
      data.workflowNodeDTOS.forEach(item => {
        if (item.nodeType == 2) {
          this.nodeMarkArr.push(item);
        }
      });

      this.businessObjectType = "";
      this.businessObjectName = false;
      // this.businessObjectName = false
      this.searchTableVosList();
      if (this.flowTableArr != undefined && this.flowTableArr != null && this.flowTableArr.length != 0) {
        this.flowTable = [];
        this.flowTableArr.forEach(item => {
          this.flowTable.push({ tableId: item });
        });
      }
      this.$api.searchSysAuditRole({ workflowType: this.workflowType, warehouseType: this.warehouseType, roleType: this.roleType }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
          this.form.unitId = "";
          this.form.fkRoleId = "";
        }
      });
      if (data.workflowType != 0 && data.workflowType != 13) {
        this.launchType = data.launchType + "";
        if (this.launchType == 1) {
          this.fkRoleId = data.fkRoleId;
          this.searchAppointRole();
        } else if (this.launchType == 2) {
          this.firstNode = data.workflowNodeDTOS[1];
          console.log(this.firstNode);
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
      } else {
        // if (item.bookType == 0) {
        this.fieldListform.technology = "";
        this.fieldListform.jsThePage = "";
        this.fieldListform.jsToPage = "";
        // } else if (item.bookType == 1) {
        this.fieldListform.safety = "";
        this.fieldListform.aqThePage = "";
        this.fieldListform.aqToPage = "";
        // } else if (item.bookType == 2) {
        this.fieldListform.standard = "";
        this.fieldListform.ysThePage = "";
        this.fieldListform.ysToPage = "";
        this.$emit("pdfList", this.fieldListform);
        // }
      }
    },
    flowTableChange() {
      this.$emit("getReply", this.flowTable);
    },
    // 节点流程-----------
    tableIdChange(e) {
      console.log("xxxxxxxxxx");
      console.log(e);
      console.log("xxxxxxxxxx");
      this.checkStatus = false;
      let tableIds = [];
      let arr = [];
      console.log(this.tableIdForm);
      this.tableIdForm.forEach(item => {
        if (item.fkTableId != null && item.fkTableId != "") {
          let obj = this.optionsList.filter(item2 => item2.pkId == item.fkTableId)[0];
          tableIds.push(item.fkTableId);
          arr.push({ ...item, tableName: obj.tableName });
        }
      });
      this.modeling.updateProperties(this.element, {
        ["tableIds"]: tableIds
      });
      this.checkStatus = true;
      this.nodeMarkArr.forEach(item => {
        if (item.nodeMark === this.form.id) {
          item.tableDTOS = arr;
          item.tableIds = tableIds;
        }
      });
    },

    tableIdsAdd() {
      this.checkStatus = false;
      this.tableIdForm.push({ fkTableId: "" });
      this.checkStatus = true;
    },
    tableIdsShiftOut(idx) {
      this.checkStatus = false;
      this.tableIdForm.splice(idx, 1);
      let tableIds = [];
      let arr = [];
      this.tableIdForm.forEach(item => {
        if (item.fkTableId != null && item.fkTableId != "") {
          tableIds.push(item.fkTableId);
          arr.push(item);
        }
      });

      this.modeling.updateProperties(this.element, {
        ["tableIds"]: tableIds
      });
      this.checkStatus = true;
      this.nodeMarkArr.forEach(item => {
        if (item.nodeMark === this.form.id) {
          item.tableDTOS = arr;
          item.tableIds = tableIds;
        }
      });
    },
    // 节点流程-----------
    // =====流程表格开始===================
    flowTableAdd() {
      this.flowTable.push({ tableId: "" });
    },
    flowTableDelete(idx) {
      this.flowTable.splice(idx, 1);
    },
    //=====流程表格结束===================
    setOptionWidth(event) {
      // 下拉框弹出时，设置弹框的宽度
      this.$nextTick(() => {
        this.selectOptionWidth = event.srcElement.offsetWidth + "px";
      });
    },
    searchTableVosList() {
      this.optionsList = [];
      this.$api.searchTableVosList({ workflowType: this.workflowType, fkEnginerringTypeId: this.fkEnginerringTypeId, fkProfessionalTypeId: this.fkProfessionalTypeId }).then(res => {
        if (res.code == 200) {
          this.optionsList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 初始化
    init() {
      // debugger
      this.show = true;
      this.tableIdForm = [{ fkTableId: "" }];
      let tableArr = [];
      this.activeName = "general";
      if (this.formType.includes(this.businessObject.$type)) {
        this.extensionElements = this.businessObject.extensionElements || this.moddle.create("bpmn:ExtensionElements", { values: [] });
        this.modeling.updateProperties(this.element, {
          extensionElements: this.extensionElements
        });
        this.formProperty = this.extensionElements.values;
      }
      this.businessObjectType = this.businessObject.$type;
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
      // if(this.accessType){}
      // this.form = this.businessObject.$attrs;
      // this.accessType ="2"
      // this.nodeMarkArr = data.workflowNodeDTOS
      // 开始
      // bpmn:UserTask
      // console.log(this.nodeMarkArr.length);
      if (this.businessObject.$type === "bpmn:UserTask" && this.nodeMarkArr.length === 0) {
        // if (this.nodeMarkArr.length === 0) {
        //   // this.form= {
        //   //     nodeApproveType: "0",
        //   //     name:"",
        //   //     unitId:"",
        //   //     fkRoleId:"",
        //   //     materialUsedTable: false,
        //   //     quantitiesTable: false,
        //   //     scoreFlag: false,
        //   //     }
        this.tableIdForm = [{ fkTableId: "" }];
        this.nodeMarkArr.push({ nodeMark: this.businessObject.id });
        // this.businessObject.$attrs.id = this.businessObject.id;
        // this.businessObject.$attrs.unitId = "";

        this.form = this.businessObject.$attrs;
        this.form.id = this.businessObject.id;
      } else if (this.businessObject.$type === "bpmn:UserTask" && this.nodeMarkArr.length != 0) {
        let matchingStatus = false;
        this.nodeMarkArr.forEach(item => {
          // 判断当前点击节点id和数据nodeMarkArr匹配id
          if (item.nodeMark == this.businessObject.id) {
            this.businessObject.$attrs.name = item.nodeName;
            this.businessObject.$attrs.unitId = item.roleType == undefined ? "" : item.roleType + "";
            this.businessObject.$attrs.fkRoleId = item.fkRoleId;
            this.businessObject.$attrs.tableIds = item.tableIds;
            this.businessObject.$attrs.materialUsedTable = item.materialUsedTable == 1 ? true : false;
            this.businessObject.$attrs.quantitiesTable = item.quantitiesTable == 1 ? true : false;
            this.businessObject.$attrs.scoreFlag = item.scoreFlag == 1 ? true : false;
            // console.log(this.businessObject.$attrs);
            this.modeling.updateProperties(this.element, { ["name"]: item.nodeName });
            if (item.tableDTOS != null && item.tableDTOS.length != 0) {
              let arr = JSON.stringify(item.tableDTOS);
              this.tableIdForm = JSON.parse(arr);
              this.modeling.updateProperties(this.element, {
                ["tableIds"]: item.tableIds
              });
              console.log("表格信息啊------------------------------------------------");
              console.log(this.tableIdForm);
              console.log("表格信息啊------------------------------------------------");
              // debugger
            } else {
              this.tableIdForm = [{ fkTableId: "" }];
            }
            matchingStatus = true;
          }
        });
        if (!matchingStatus) {
          this.nodeMarkArr.push({ nodeMark: this.businessObject.id, roleType: "" });
          // this.businessObject.$attrs.unitId = "";
          // this.businessObject.$attrs.id = this.businessObject.id;
          // this.form = this.businessObject.$attrs;
        }
      }
      this.form = this.businessObject.$attrs;
      // console.log(this.form);
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
      // this.tableIdForm = tableArr
      // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      // console.log(this.businessObject);
      // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      // 结束

      // if (this.businessObject.$attrs.tableIds != undefined && this.businessObject.$attrs.tableIds != null && this.businessObject.$attrs.tableIds.length && typeof this.businessObject.$attrs.tableIds == "string") {
      //   this.form.tableIds = this.businessObject.$attrs.tableIds.split(",");
      //   this.form.tableIds.forEach((item, idx) => {
      //     this.tableIdForm.push({ tableId: item });
      //   });
      // } else {
      //   if (this.businessObject.$attrs.tableIds != undefined && this.businessObject.$attrs.tableIds.length != 0) {
      //     this.form.tableIds.forEach((item, idx) => {
      //       this.tableIdForm.push({ tableId: item });
      //     });
      //   } else {
      //     this.tableIdForm = [{ tableId: "" }];
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
      //   }, 2000);
      // }

      // if (this.tableIdForm.length != 0) {
      //   this.tableIdForm.forEach(item => {
      //     let tableStatus = true;
      //     this.optionsList.forEach(e => {
      //       if (item.tableId == e.pkId) {
      //         tableStatus = false;
      //       }
      //     });
      //     if (tableStatus) {
      //       item.tableId = "";
      //     }
      //   });
      // }
      // if (this.flowTable.length != 0) {
      //   this.flowTable.forEach(item => {
      //     let flowTableStatus = true;
      //     this.optionsList.forEach(e => {
      //       if (item.tableId == e.pkId) {
      //         flowTableStatus = false;
      //       }
      //     });
      //     if (flowTableStatus) {
      //       item.tableId = "";
      //     }
      //   });
      // }
      // optionsList
      // console.log("====================xxxxxxxxxxxx=================");
    },
    // //获取审批角色
    searchSysAuditRole(val) {
      this.$api.searchSysAuditRole({ workflowType: this.workflowType }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.roleType = item.roleType + "";
          });
          this.unitOptions = res.data;
        }
      });
    },
    // 0：生产验收工序（子流程） 1：生产审批流程模板  2：业主计量审批审批流程模板  3：分包单位结算审批流程模板
    unitOptionsChang(type, v) {
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
      // unitId

      // if (this.addTitle != "新增流程") {
      if (this.form.fkRoleId) {
        this.modeling.updateProperties(this.element, {
          ["fkRoleId"]: null
        });
      }

      // }
      this.nodeMarkArr.forEach(item => {
        if (item.nodeMark === this.form.id) {
          if (type == "unitId") {
            item.roleType = v;
          }
        }
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
      // if()
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
        }
      });
      console.log("cccccccccccccccccccccc");
      console.log(this.nodeMarkArr);
      console.log("cccccccccccccccccccccc");
      this.checkStatus = false;
      this.checkStatus = true;
    },
    checkboxChange(type, v) {
      // let status  = v ==true?1:0
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
      if (type == "scoreFlag") {
        let obj = this.nodeMarkArr.filter(item => item.nodeMark == this.form.id)[0];
        if (v) {
          if (this.scoreFlagName && this.scoreFlagName != this.form.id) {
            obj.scoreFlag = 0;
            this.form.scoreFlag = false;
            return this.$message.warning("已存在评分节点无需再设置");
          } else {
            this.scoreFlagName = obj.nodeMark;
          }
        } else {
          this.scoreFlagName = "";
          obj.scoreFlag = 0;
        }
      }
      for (let i = 0; i < this.nodeMarkArr.length; i++) {
        // 工程量
        if (this.nodeMarkArr[i].nodeMark === this.form.id && type == "quantitiesTable") {
          this.nodeMarkArr[i].quantitiesTable = v == true ? 1 : 0;
          this.checkStatus = false;
          this.checkStatus = true;
          return;
        }
        // 材料用量
        if (this.nodeMarkArr[i].nodeMark === this.form.id && type == "materialUsedTable") {
          this.nodeMarkArr[i].materialUsedTable = v == true ? 1 : 0;
          this.checkStatus = false;
          this.checkStatus = true;
          return;
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
      // try {
      //   this.nodeMarkArr.forEach(item => {
      //     console.log(this.scoreFlagStatus == 1, this.scoreFlagName == item.nodeMark, item.nodeMark != this.form.id, item.scoreFlag);
      //     console.log(this.scoreFlagName, item.nodeMark);
      //     if (this.scoreFlagStatus == 1 && (item.scoreFlag == 1 || item.scoreFlag == undefined) && this.scoreFlagName != item.nodeMark && item.nodeMark != this.form.id) {
      //       throw Error();
      //     } else if (item.nodeMark == this.form.id && type == "scoreFlag") {
      //       item.scoreFlag = v == true ? 1 : 0;
      //       this.scoreFlagStatus = item.scoreFlag;
      //       this.scoreFlagName = item.nodeMark;
      //     }
      //     this.checkStatus = false;
      //     this.checkStatus = true;
      //     if (item.nodeMark === this.form.id) {
      //       if (type == "quantitiesTable") {
      //         item.quantitiesTable = v == true ? 1 : 0;
      //       }
      //       if (type == "materialUsedTable") {
      //         item.materialUsedTable = v == true ? 1 : 0;
      //       }
      //       // if (type == "scoreFlag") {
      //       //   item.scoreFlag = v == true ? 1 : 0;
      //       // }
      //     }
      //   });
      // } catch (error) {
      //   this.$message.warning("已存在评分节点无需再设置");
      // }
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
    // 创建节点执行
    replacement() {
      console.log("创建节点");
      this.businessObjectType = "12";
      console.log(this.nodeMarkArr);
    },
    react() {
      this.nodeMarkArr = [];
      this.accessType = "1";
      this.launchType = "0";
      let data = {
        launchType: this.launchType,
        fkRoleId: this.fkRoleId
      };
      // this.fieldListform = {
      //   technology: "",
      //   jsThePage: "",
      //   jsToPage: "",
      //   safety: "",
      //   aqThePage: "",
      //   aqToPage: "",
      //   standard: "",
      //   ysThePage: "",
      //   ysToPage: ""
      // };
      this.$emit("pdfList", this.fieldListform);
      this.$emit("launchInit", data);
      this.flowTable = [{ tableId: "" }];
      (this.businessObjectType = "12"), (this.businessObjectName = false);
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
  height: 100px;
  overflow: auto;
  padding: 5px;
  font-size: 11px;
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
