<template>
  <div class="panelWrapper">
    <div class="panelHeader">{{ businessObjectName == true ? "节点信息" : "流程信息" }}</div>
    <el-form class="panelForm" :model="form" label-position="left">
      <!-- v-if="show" -->
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <div class="panleTitle"><i class="el-icon-info"></i> 常规</div>
        <div class="panleCenten">
          <el-form-item label="节点名称" v-if="businessObjectName">
            <el-input size="mini" :disabled="forbidden" v-model="form.name"
              @change="v => updateForm('name', v)"></el-input>
          </el-form-item>
        </div>
      </div>
      <div v-if="businessObjectType == 'bpmn:UserTask'">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 节点设置</div>
        <div class="panleCenten" v-if="workflowType.length">
          <el-radio-group :disabled="forbidden" v-model="form.nodeApproveType"
            @change="v => updateForm('nodeApproveType', v)">
            <el-radio :label="'0'">审批节点</el-radio>
            <!-- <el-radio :label="'1'" v-if="workflowType == '0'">钢筋加工厂</el-radio> -->
            <!-- <el-radio :label="'2'" v-if="workflowType == '0'">混泥土搅拌</el-radio> -->
            <el-radio :label="'3'" v-if="workflowType == '8'">盖章人节点</el-radio>
          </el-radio-group>
          <div v-if="form.nodeApproveType != 3">
            <div>审批角色</div>
            <el-row>
            <el-col :span="12">
              <el-select :disabled="forbidden" v-model="form.unitId" placeholder="请选择" size="mini"
                @change="v => unitOptionsChang('unitId', v)">
                <el-option v-for="item in unitOptions" :key="item.pkId" :label="item.roleName" :value="item.pkId">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-select :disabled="forbidden" v-model="form.fkRoleId" placeholder="请选择" size="mini"
                @change="v => updateForm('fkRoleId', v)">
                <el-option v-for="item in options" :key="item.pkId" :label="item.roleName" :value="item.pkId">
                </el-option>
              </el-select>
            </el-col>
          </el-row>
          </div>
          <div v-if="form.nodeApproveType == 3">
            <div>盖章人员</div>
            <el-row>
            <el-col :span="12">
              <el-select :disabled="forbidden" v-model="form.fkUserId" placeholder="请选择" size="mini"
                @change="v => unitOptionsChang('fkUserId', v)">
                <el-option v-for="item in chapterList" :key="item.pkId" :label="item.userName" :value="item.pkId">
                </el-option>
              </el-select>
            </el-col>
            </el-row>
          </div>
          <div v-if="workflowType == '0'" style="padding: 4px;">
            <div style="line-height: 20px;">可编辑内容：</div>
            <el-checkbox style="margin: 0;" v-if="checkStatus" v-model="form.quantitiesTable"
              @change="v => checkboxChange('quantitiesTable', v)" :disabled="forbidden">工程量</el-checkbox>
            <el-checkbox style="margin: 0;" v-if="checkStatus" v-model="form.materialUsedTable"
              @change="v => checkboxChange('materialUsedTable', v)" :disabled="forbidden">材料用量</el-checkbox>
            <el-checkbox style="margin: 0;" v-if="checkStatus" v-model="form.scoreFlag"
              @change="v => checkboxChange('scoreFlag', v)" :disabled="forbidden">工程评分</el-checkbox>
          </div>
        </div>
      </div>
      <div v-if="businessObjectType == 'bpmn:UserTask' && workflowType != '' && form.nodeApproveType != 3"  >
        <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设计</div>
        <div class="panleCenten" style="line-height: 30px ;margin: 0;padding: 0px 10px;" v-if="tableSource != 1">
          <el-radio-group :disabled="forbidden" v-model="form.tableSource"
            @change="v => tableSourceForm('tableSource', v)">
            <el-radio :label="'0'">系统默认</el-radio>
            <el-radio :label="'1'">自定义</el-radio>
          </el-radio-group>
        </div>
        <div class="table-pull-box" v-if="checkStatus" :class="{'table-max-height':workflowType==0}">
          <el-row v-for="(item, index) in tableIdForm" :key="index" style="margin: 4px 0px;">
            <el-col :span="14">
              <el-select :disabled="forbidden" filterable v-model="item.tableId" placeholder="请选择" size="mini"
                @focus="setOptionWidth" @change="v => tableIdChange()">
                <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName"
                  placement="left-start">
                  <el-option style="width:200px" :value="i.pkId" :label="i.tableName"></el-option>
                </el-tooltip>
              </el-select>
            </el-col>
            <el-col :span="7" style="line-height: 22px;padding-left: 2px;">
              <el-checkbox v-model="item.archives" v-if="user.orgType == 5" @change="v => archivesChang(v)">档案表</el-checkbox>
            </el-col>
            <el-col :span="3" style="line-height: 22px;padding-left: 2px;">
              <!-- <i class="el-icon-circle-plus-outline" style="color: #2680f0;" v-if="index == 0" @click="tableIdsAdd"></i>
              <el-button type="danger" size="mini" style="padding: 0;" icon="el-icon-zoom-out" circle v-if="index != 0"
                @click="tableIdsShiftOut(index)"></el-button> -->
                <i class="el-icon-circle-plus-outline" style="color: #2680f0;font-weight: 800;font-size: 18px;vertical-align: bottom;" v-if="index == 0" @click="tableIdsAdd"></i>
              <i class="el-icon-remove-outline" style="color: red;font-weight: 800;font-size: 18px;vertical-align: bottom;" v-if="index != 0" @click="tableIdsShiftOut(index)"></i>
            </el-col>
          </el-row>
        </div>
      </div>
      <div v-if="!businessObjectName && workflowType != 0 && workflowType != 1">
        <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设计</div>
        <div class="panleCenten" style="height:350px;overflow: auto;">
          <div style="margin-top:10px">
            <el-row v-for="(item, index) in flowTable" :key="index" style="margin: 4px 0px;">
              <el-col :span="21">
                <el-select :disabled="forbidden" filterable v-model="item.tableId" placeholder="请选择" size="mini"
                  @focus="setOptionWidth">
                  <el-tooltip v-for="i in optionsList" :key="i.pkId" class="item" effect="dark" :content="i.tableName"
                    placement="left-start">
                    <el-option style="width:200px" :value="i.pkId" :label="i.tableName"></el-option>
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
        </div>
      </div>
      
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    element: {
      default: function () {
        return {};
      }
    },
    businessObject: {
      default: function () {
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
      businessObjectType: "12",
      businessObjectName: true,
      // tableType: "0",
      optionsList: [],
      selectOptionWidth: "",
      chapterList: [],
      checkStatus: true,
      tableIdForm: [],
      flowTable: [
        { tableId: "" }
      ],
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
  },
  mounted() {
    this.searchSysAuditRole();
  },
  watch: {
    "form.unitId": function (newVal, oldVal) {
      if (newVal != undefined) {
        this.unitOptions.forEach(item => {
          if (item.pkId == newVal) {
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
    workflowType: function (newVal, oldVal) {
      this.$api.searchSysAuditRole({ type: newVal, sourceType: "1", fkOrgId: this.fkOrgId }).then(res => {
        if (res.code == 200) {
          this.unitOptions = res.data;
        }
      });
    },
    "form.tableSource": function (val) {
      this.optionsList = [];
      if (val == "0") {
        this.baseTableSearch();
      } else if (val == "1") {
        this.baseTableSearch(this.fkOrgId);
      }
    },
    "form.nodeApproveType": function (val) {
      // this.chapterList = [];
      if (val == "3") {
        this.inChapterOne();
      }
    },
    fkProfessionalTypeId: function (newVal, oldVal) {
      console.log("1111111111111111111")
      this.baseTableSearch()
    },
    fkEnginerringTypeId: function (newVal, oldVal) {
      this.baseTableSearch()
    },
    // tableType(val) {
    //   console.log(val);
    //   if (val == 0) {
    //     this.baseTableSearch();
    //   } else if (val == 1) {
    //     this.baseTableSearch(this.fkOrgId);
    //   }
    // }
  },
  methods: {
        // =====流程表格开始===================
        flowTableAdd() {
      this.flowTable.push({ tableId: "" })
    },
    flowTableDelete(idx) {
      this.flowTable.splice(idx, 1);
    },
    //=====流程表格结束===================
    tableIdChange() {
      let tableIds = []
      let archives = []
      this.tableIdForm.forEach(item => {
        if (item.tableId != '') {
          tableIds.push(item.tableId)
          if (item.archives == false) {
            archives.push(0)
          } else {
            archives.push(1)
          }
        }
      })
      console.log(tableIds)
      this.modeling.updateProperties(this.element, {
        ["tableIds"]: tableIds
      });
      this.modeling.updateProperties(this.element, {
        ["archives"]: archives
      });
    },
    archivesChang() {
      let archives = []
      this.tableIdForm.forEach(item => {
        if (item.tableId != '') {
          if (item.archives == true) {
            archives.push(1)
          } else {
            archives.push(0)
          }

        }
      })
      console.log(archives)
      // return
      this.modeling.updateProperties(this.element, {
        ["archives"]: archives
      });
    },
    tableIdsAdd() {
      // console.log(this.form.tableIds)
      this.checkStatus = false
      this.tableIdForm.push({ tableId: "", archives: false })
      // this.modeling.updateProperties(this.element, {
      //   ["tableIds"]: this.form.tableIds
      // });
      this.checkStatus = true
      // console.log(this.form.tableIds)
      // ["tableIds"]: [{tableId:"",archives:""}]
    },
    tableIdsShiftOut(idx) {
      this.checkStatus = false
      this.tableIdForm.splice(idx, 1);
      let tableIds = []
      let archives = []
      this.tableIdForm.forEach(item => {
        if (item.tableId != '') {
          tableIds.push(item.tableId)
          if (item.archives == false) {
            archives.push(0)
          } else {
            archives.push(1)
          }
        }
      })
      console.log(tableIds)
      this.modeling.updateProperties(this.element, {
        ["tableIds"]: tableIds
      });
      this.modeling.updateProperties(this.element, {
        ["archives"]: archives
      });
      this.checkStatus = true
    },
    checkboxChange(type, v) {
      this.checkStatus = false
      // let status  = v ==true?1:0
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
      this.checkStatus = true
    },
    // 用章人列表inChapterOne
    inChapterOne() {
      this.$api.inChapterOne({ fkOrgId: this.fkOrgId }).then(res => {
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
      this.tableIdForm = []
      this.show = true;
      this.checkStatus = false
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
      this.form = this.businessObject.$attrs;
      if (this.businessObject.$attrs.tableIds != undefined && this.businessObject.$attrs.tableIds != null && this.businessObject.$attrs.tableIds.length && typeof this.businessObject.$attrs.tableIds == "string") {
        this.form.tableIds = this.businessObject.$attrs.tableIds.split(",");
        this.form.tableIds.forEach((item, idx) => {
          this.tableIdForm.push({ tableId: item,archives:false })
        })
      } else {
        if (this.businessObject.$attrs.tableIds != undefined && this.businessObject.$attrs.tableIds.length!=0) {
          this.form.tableIds.forEach((item, idx) => {
            this.tableIdForm.push({ tableId: item ,archives:false})
          })
        }else{
          this.tableIdForm=[{ tableId: "" ,archives:false}]
        }
      }
      if (this.businessObject.$attrs.archives != undefined && this.businessObject.$attrs.archives != null && this.businessObject.$attrs.archives.length && typeof this.businessObject.$attrs.archives == "string") {
        this.form.archives = this.businessObject.$attrs.archives.split(",");
        this.form.archives.forEach((item, idx) => {
          if (item == '' || item == 0) {
            item = false
            this.tableIdForm[idx].archives = false
          } else {
            item = true
            this.tableIdForm[idx].archives = true
          }
        })
      }else{
        if(this.businessObject.$attrs.archives!=undefined && this.businessObject.$attrs.archives.length!=0){
          this.form.archives.forEach((item, idx) => {
          if (item == '' || item == 0) {
            item = false
            this.tableIdForm[idx].archives = false
          } else {
            item = true
            this.tableIdForm[idx].archives = true
          }
          
        })
        }
      }
      if (this.form.quantitiesTable == undefined) {
        this.form.quantitiesTable = false
      } else {
        if (this.form.quantitiesTable == 'true') {
          this.form.quantitiesTable = true
        } else if (this.form.quantitiesTable == 'false') {
          this.form.quantitiesTable = false
        } else {
          this.form.quantitiesTable = this.form.quantitiesTable == '1' ? true : false
        }
      }
      if (this.form.materialUsedTable == undefined) {
        this.form.materialUsedTable = false
      } else {
        if (this.form.materialUsedTable == 'true') {
          this.form.materialUsedTable = true
        } else if (this.form.materialUsedTable == 'false') {
          this.form.materialUsedTable = false
        } else {
          this.form.materialUsedTable = this.form.materialUsedTable == '1' ? true : false
        }
      }
      if (this.form.scoreFlag == undefined) {
        this.form.scoreFlag = false
      } else {
        if (this.form.scoreFlag == 'true') {
          this.form.scoreFlag = true
        } else if (this.form.scoreFlag == 'false') {
          this.form.scoreFlag = false
        } else {
          this.form.scoreFlag = this.form.scoreFlag == '1' ? true : false
        }
      }
      this.checkStatus = false
      this.checkStatus = true
      // delete this.businessObject.name;
      // this.businessObject.fkRoleId = this.businessObject.$attrs.fkRoleId;
      // this.businessObject.nodeApproveType = this.businessObject.$attrs.nodeApproveType;
      // this.businessObject.unitId = this.businessObject.$attrs.unitId;
      // this.form = this.businessObject;
      // }
      //  this.form.fkRoleId =  this.form.fkRoleId == undefined?this.form.$attrs.fkRoleId:this.form.fkRoleId;
      // this.form.nodeApproveType =
      //   this.form.nodeApproveType == undefined
      //     ? this.form.$attrs.nodeApproveType

      //     : this.form.nodeApproveType;
      //    this.form.unitId =  this.form.unitId == undefined?this.form.$attrs.unitId:this.form.unitId;

      // this.form.fkRoleId =  this.form.fkRoleId == undefined?this.form.$attrs.fkRoleId:this.form.fkRoleId;
      //       fkRoleId: "1508334132754419713"
      // nodeApproveType: "0"
      // unitId: "6"
      // let data = JSON.stringify(this.businessObject.$attrs);
      // this.form = JSON.parse(data);
      // let data = this.businessObject.$attrs;
      // data.$type = this.businessObject.$type
      // data.nodeApproveType = this.businessObject.nodeApproveType!=undefined?this.businessObject.nodeApproveType: data.nodeApproveType;
      // data.nodeApproveType = data.nodeApproveType==undefined?"":data.nodeApproveType;
      // this.form =data
      // if(this.workflowType == 8){
      //   this.form.tableSource = "1"
      // }
      if(this.tableSource ==1){
        this.form.tableSource = "1"
      }
      this.checkStatus = true
    },
    // tableTypeChange(val) {
    //   // console.log(val);
    //   // console.log(this.fkOrgId)
    // },
    baseTableSearch(id) {
      let data = {};
      if (id) {
        data = {
          fkOrgId: id,
          dataTypeList: 3,
          fkEnginerringTypeId: this.fkEnginerringTypeId,
          fkProfessionalTypeId: this.fkProfessionalTypeId
        };
      }

      // fkOrgId
      this.optionsList = [];
      this.$api.baseTableSearch(data).then(res => {
        // console.log(res)
        // this.optionsList
        if (res.code == 200) {
          this.optionsList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    //获取审批角色
    searchSysAuditRole() {
      this.$api.searchSysAuditRole({ fkOrgId: this.fkOrgId, sourceType: "1" }).then(res => {
        if (res.code == 200) {
          this.unitOptions = res.data;
        }
      });
    },
    // 0：生产验收工序（子流程） 1：生产审批流程模板  2：业主计量审批审批流程模板  3：分包单位结算审批流程模板
    unitOptionsChang(type, v) {
      console.log(v);
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
        if (item.pkId == v) {
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
      if(this.form.nodeApproveType == 3){
        this.form.tableIds = []
        this.form.archives =[]
      }
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
    },

    tableSourceForm(type, v) {
      this.modeling.updateProperties(this.element, {
        [type]: v
      });
      // if (v == 0) {
      //   this.baseTableSearch();
      // } else if (v == 1) {
      //   this.baseTableSearch(this.fkOrgId);
      // }
      if (this.form.tableIds) {
        this.modeling.updateProperties(this.element, {
          ["tableIds"]: [{ tableId: "", archives: false }]
        });
      }
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
  width: 260px;

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
.table-pull-box{
  border-top: 1px solid;height: 100px;overflow: auto;padding: 5px;font-size: 11px;
}
.table-max-height{
  height: 50px;
}
</style>
