<template>
  <div>
    <div class="productionApproval" style="height: 450px">
      <div class="left" id="left" style="height: 450px" v-show="editStatus">
        <div class="header-query" id="header-query">
          <el-input size="mini" v-model="workflowNameLike" style="margin-top: 6px" class="workflow-nameLike">
            <i class="el-icon-search el-input__icon" slot="suffix" @click="workflowNameLikeQuery"></i>
          </el-input>
          <!-- <div style="background-color: #ccc; margin: 0 auto; text-align: center; padding: 5px" @click="link">生产施工工序</div> -->
        </div>
        <!-- <div style="margin: 70px 0"> -->
        <div style="background-color: #ccc; margin: 0 auto; text-align: center; padding: 5px 0px; margin-top: 6px">生产施工工序</div>
        <div style="overflow-y: auto; height: 200px">
          <div id="mao-dian"></div>
          <div class="item" v-for="item in productionApproval" v-show="item.workflowType != '13'" :class="{ active: item.isActive == true, violet: item.workflowType == '13' }" :key="item.pkId" @click="itemClick(item)">
            {{ item.workflowName }}
          </div>
        </div>
        <div style="background-color: #ccc; margin: 0 auto; text-align: center; margin-top: 6px; padding: 5px 0px">最终质量验收工序</div>
        <div style="overflow-y: auto; height: 140px">
          <div class="item" v-for="(item, index) in productionApproval" v-show="item.workflowType == '13'" :class="{ active: item.isActive == true, violet: item.workflowType == '13' }" :key="index" @click="itemClick(item)">
            {{ item.workflowName }}
          </div>
        </div>
        <!-- </div> -->
      </div>
      <div class="center" @click.stop="processClick">
        <div class="kaishi">
          <span>开始</span>
        </div>
        <img src="../assets/jiantou.svg" class="jiantou" alt="" />
        <div v-for="(item, index) in pitchOnDate" :key="index">
          <div class="bpmShow" @click.stop="bpmShowClick(item)">
            <div class="box" style="position: relative; display: flex; height: 200px; align-items: center" :class="{ 'jf-conten': item.workflowNodes.length < 8, 'pd-left': item.workflowNodes.length > 8 }">
              <div style="width: 25px; height: 25px; border-radius: 50%; border: 1px solid" :class="{ 'p-left': item.workflowNodes.length > 8 }"></div>

              <div class="item-box" v-for="(arrItm, i) in item.workflowNodes" v-show="arrItm.nodeType == 2" :key="i" @click.stop="nodeClick(arrItm, item.workflowType)" style="width: 100px; height: 72px; border: 1px; border: 1px solid; margin: 0; margin-left: 30px; position: relative; border-radius: 5px; padding-top: 10px">
                <i class="el-icon-right" v-show="arrItm.nodeType == 2" style="position: absolute; top: 18px; left: -30px; font-size: 30px"></i>
                <div>
                  <i class="el-icon-user-solid" v-if="arrItm.nodeName.length < 5"></i>
                  <div style="display: inline-block" v-if="arrItm.nodeName.length < 5">{{ arrItm.nodeName }}</div>
                  <div style="" v-if="arrItm.nodeName.length < 5 && arrItm.userName != undefined && arrItm.userName != null">{{ arrItm.userName }}</div>
                  <div style="" v-if="arrItm.nodeName.length >= 5">
                    <el-tooltip effect="dark" :content="arrItm.nodeName" placement="top">
                      <div class="yc">
                        <i class="el-icon-user-solid"></i>
                        {{ arrItm.nodeName }}
                      </div>
                    </el-tooltip>
                    <div style="" v-if="arrItm.userName != undefined && arrItm.userName != null">{{ arrItm.userName }}</div>
                  </div>
                  <!-- -->
                </div>
              </div>

              <div :class="{ kaishi: item.workflowNodes.length < 8 }" style="display: inline-block; background-color: #ccc; margin: 0; margin-left: 30px; position: relative;border-radius: 50%;">
                <i class="el-icon-right" style="position: absolute; top: -5px; left: -30px; font-size: 30px"></i>
                <div v-if="item.workflowNodes.length > 8" style="width: 25px; height: 25px; border-radius: 50%; border: 1px solid"></div>
              </div>
            </div>
            <span class="bpmShowxshou">{{ item.workflowName }}</span>
            <div style="position: absolute; right: 8px; top: 8px; z-index: 1000">
              <el-button v-if="index != pitchOnDate.length - 1 && editStatus && pitchOnDate[index + 1].workflowType != 13" class="bpmShowxshouButm" @click.stop="itemDown(pitchOnDate, index)" type="primary" icon="el-icon-bottom" size="mini" circle></el-button>
              <el-button class="bpmShowxshouButm" v-if="index != 0 && editStatus && pitchOnDate[index].workflowType != 13" @click.stop="itemUpward(pitchOnDate, index)" type="primary" icon="el-icon-top" size="mini" circle></el-button>
              <el-button class="bpmShowxshouButm" v-if="editStatus" @click.stop="itemDelete(item, index)" type="danger" icon="el-icon-delete" size="mini" circle></el-button>
            </div>
          </div>
          <img src="../assets/jiantou.svg" class="jiantou" alt="" />
        </div>
        <div class="kaishi jieshu">
          <span>结束</span>
        </div>
      </div>
      <div class="right">
        <div class="title" v-if="clickType == 1">流程信息</div>
        <div class="title" v-if="clickType == 2">工序信息</div>
        <div class="title" v-if="clickType == 3">节点信息</div>

        <div v-if="nodeShow">
          <el-form :model="form" ref="nodeForm" style="padding: 0">
            <div class="panleTitle" v-if="clickType == 1"><i class="el-icon-info"></i> 发起人设置</div>
            <el-form-item label="" style="margin-right: 6px" v-if="clickType == 1">
              <el-col :span="12">
                <el-select placeholder="请选择" size="mini" v-model="launchType" :disabled="!editStatus" @change="launchTypeChange">
                  <el-option v-for="s in initiatorArr" :key="s.id" :value="s.id" :label="s.name" />
                </el-select>
              </el-col>
              <el-col :span="12" v-if="launchType == '1'">
                <el-input v-if="!editStatus && fkRoleIdName.length" size="mini" v-model="fkRoleIdName" disabled></el-input>
                <div v-else-if="!editStatus && fkRoleIdName.length == 0" class="no-data">暂无数据</div>
                <el-select v-else clearable placeholder="请选择" size="mini" v-model="fkRoleId">
                  <el-option v-for="s in fkRoleIdArr" :key="s.pkId" :value="s.pkId" :label="s.roleName" />
                </el-select>
              </el-col>
              <el-col :span="12" v-if="launchType == '2'">
                <el-input size="mini" disabled v-model="firstNode.roleName"></el-input>
              </el-col>
            </el-form-item>
            <div class="panleTitle" v-if="clickType == 1 && launchType == '2'"><i class="el-icon-s-order"></i> 发起人填写表格</div>
            <!-- <el-form-item prop="date1" v-show="clickType == 1 && (launchType == '0' || launchType == '1')" style="max-height: 300px; overflow: auto; border-top: 1px solid; padding-left: 2px">
              <el-row v-for="(item, index) in tableIds" :key="index" style="margin: 4px 0px">
                <el-col :span="20">
                  <el-select style="width: 100%" filterable v-model="item.fkTableId" clearable v-if="editStatus" :disabled="!editStatus" @change="tableIdsChange" placeholder="请选择" size="mini">
                    <el-tooltip v-for="i in relatedForm" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                      <el-option style="width: 200px" :disabled="tableIds.find(s => s.fkTableId === i.pkId) == undefined ? false : true" :value="i.pkId" :label="i.tableName"></el-option>
                    </el-tooltip>
                  </el-select>
                  <el-input v-else v-model="item.tableName" size="mini" disabled></el-input>
                </el-col>
                <el-col :span="4" style="line-height: 28px; padding-left: 2px" v-if="editStatus">
                  <i class="el-icon-circle-plus-outline" style="color: #2680f0; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index == 0" @click="tableIdsAdd"></i>
                  <i class="el-icon-remove-outline" style="color: red; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index != 0" @click="tableIdsShiftOut(index)"></i>
                </el-col>
              </el-row>
              <div v-if="!editStatus && tableIds.length == 0" class="no-data">暂无数据</div>
            </el-form-item> -->
            <el-form-item prop="date1" v-if="clickType == 1 && launchType == '2' && firstNode.tableDTOS != undefined && firstNode.tableDTOS != null && firstNode.tableDTOS.length != 0" style="max-height: 300px; overflow: auto; border-top: 1px solid; border-bottom: 1px solid; padding-left: 2px">
              <div v-for="item in firstNode.tableDTOS" :key="item.fkTableId">
                <i class="el-icon-s-grid">{{ item.tableName }}</i>
              </div>
            </el-form-item>

            <div class="panleTitle" v-if="clickType == 2"><i class="el-icon-info"></i> 工序名称</div>
            <el-form-item label="" style="margin-right: 6px" v-if="clickType == 2">
              <el-input disabled v-model="fieldListform.workflowName" size="mini" autocomplete="off"></el-input>
            </el-form-item>
            <div class="panleTitle" v-if="clickType == 2"><i class="el-icon-s-order"></i> 关联资料</div>
            <el-form-item label="技术规范" v-if="clickType == 2 && fieldListform.technology != undefined && fieldListform.technology != null && fieldListform.technology.length != 0">
              <!-- <div v-if="!editStatus && (fieldListform.technology == undefined || fieldListform.technology == null || fieldListform.technology.length == 0)">暂无数据</div> -->
              <div>
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-input disabled size="mini" v-model="fieldListform.technology" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input clearable disabled size="mini" type="number" v-model="fieldListform.jsThePage" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input clearable disabled size="mini" type="number" v-model="fieldListform.jsToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </div>
            </el-form-item>
            <el-form-item label="安全规范" v-if="clickType == 2 && fieldListform.safety != undefined && fieldListform.safety != null && fieldListform.safety.length != 0">
              <!-- <div v-if="!editStatus && (fieldListform.safety == undefined || fieldListform.safety == null || fieldListform.safety.length == 0)">暂无数据</div> -->
              <div>
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-input disabled size="mini" v-model="fieldListform.safety" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input disabled size="mini" v-model="fieldListform.aqThePage" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input disabled size="mini" v-model="fieldListform.aqToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </div>
            </el-form-item>
            <el-form-item label="验收标准" v-if="clickType == 2 && fieldListform.standard != undefined && fieldListform.standard != null && fieldListform.standard.length != 0">
              <!-- <div v-if="!editStatus && (fieldListform.standard == undefined || fieldListform.standard == null || fieldListform.standard.length == 0)">暂无数据</div> -->
              <div>
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-input disabled size="mini" v-model="fieldListform.standard" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input disabled size="mini" v-model="fieldListform.ysThePage" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input disabled clearable size="mini" v-model="fieldListform.ysToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </div>
            </el-form-item>
            <div class="no-data" v-if="clickType == 2 && (fieldListform.technology == undefined || fieldListform.technology == null || fieldListform.technology.length == 0) && (fieldListform.safety == undefined || fieldListform.safety == null || fieldListform.safety.length == 0) && (fieldListform.standard == undefined || fieldListform.standard == null || fieldListform.standard.length == 0)">暂无数据</div>
            <div class="panleTitle" v-if="clickType == 2"><i class="el-icon-s-order"></i>关联表格</div>
            <el-form-item label="" class="table-height" v-if="clickType == 2 && fieldListform.tableDTOS != undefined && fieldListform.tableDTOS != null && fieldListform.tableDTOS.length != 0">
              <div>
                <div v-for="(item, index) in fieldListform.tableDTOS" :key="index">
                  <i class="el-icon-s-grid" style="line-height: 0"> {{ item.tableName }}</i>
                </div>
              </div>
            </el-form-item>
            <div v-if="clickType == 2 && (fieldListform.tableDTOS == undefined || fieldListform.tableDTOS == null || fieldListform.tableDTOS.length == 0)" class="no-data">暂无数据</div>
            <div class="panleTitle" v-if="clickType == 3"><i class="el-icon-info"></i> 节点名称</div>
            <el-form-item label="" style="margin-right: 6px" v-if="clickType == 3">
              <el-input disabled v-model="fieldListform.nodeName" size="mini" autocomplete="off" maxlength="25"></el-input>
            </el-form-item>
            <!-- <div class="panleTitle" v-if="clickType == 3"><i class="el-icon-info"></i> 节点设置</div>
            <el-form-item label="节点类型" style="margin-right: 6px" v-if="clickType == 3">
              <el-radio v-model="radio" label="1">审批节点</el-radio>
            </el-form-item> -->
            <div v-if="clickType == 3">审批角色</div>
            <el-form-item label="" v-if="clickType == 3">
              <el-col :span="12">
                <el-form-item prop="date1">
                  <el-input disabled size="mini" v-model="fieldListform.roleTypeName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-input disabled size="mini" v-model="fieldListform.roleName" />
              </el-col>
            </el-form-item>
            <div class="panleTitle" v-if="clickType == 3"><i class="el-icon-info"></i> 可编辑内容</div>
            <div style="margin: 6px" v-if="clickType == 3">
              <el-checkbox v-model="fieldListform.quantitiesTable" disabled v-if="fieldListform.workflowType != 13">工程量</el-checkbox>
              <el-checkbox v-model="fieldListform.materialUsedTable" disabled v-if="fieldListform.workflowType != 13">材料用量</el-checkbox>
              <el-checkbox v-model="fieldListform.scoreFlag" disabled v-if="fieldListform.workflowType == 13">工程评分</el-checkbox>
            </div>
            <div class="panleTitle" v-if="clickType == 3"><i class="el-icon-s-order"></i>可填写表格</div>
            <el-form-item label="" v-if="clickType == 3 && fieldListform.tableDTOS != undefined && fieldListform.tableDTOS != null && fieldListform.tableDTOS.length != 0">
              <div v-for="(item, index) in fieldListform.tableDTOS" :key="index">
                <i class="el-icon-s-grid"> {{ item.tableName }}</i>
              </div>
            </el-form-item>
            <div v-if="clickType == 3 && !editStatus && (fieldListform.tableDTOS == undefined || fieldListform.tableDTOS == null || fieldListform.tableDTOS.length == 0)" class="no-data">暂无数据</div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "acceptanceProcess",
  props: {
    editStatus: {
      //是否可以编辑 查看进来传flase
      type: Boolean,
      default: true
    },
    fessionalTypeId: {
      //专业类别 通过专业类别 查询左侧流程
      type: String,
      default: ""
    },
    workflowType: {
      type: String,
      default: ""
    },
    accessType: {
      type: String,
      default: "1" // 1 系统 2定制 3自定义
    },
    fkOrgId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      workflowNameLike: "",
      productionApproval: [], //左侧流程
      pitchOnDate: [],
      nodeShow: false,
      clickType: 1, // 1流程新 2 工序信息 3节点信息
      form: {},
      // formLabelWidth: "90px",
      arr: [
        { name: "111", a: "222" },
        { name: "111", a: "222" },
        { name: "111", a: "222" },
        { name: "111", a: "222" }
      ],
      radio: false,
      initiatorArr: [
        { name: "不限", id: "0" },
        { name: "指定岗位", id: "1" },
        { name: "首个流程节点岗位", id: "2" }
      ],
      launchType: "0",
      fieldListform: {
        technology: "",
        jsThePage: ""
      },
      fkRoleIdArr: [],
      fkRoleId: "",
      firstNode: {},
      tableIds: [{ tableName: "", pkId: "" }],
      relatedForm: [],
      fkRoleIdName: ""
    };
  },
  watch: {
    fessionalTypeId(val) {
      if (val.length == 0) {
        return;
      }
      //   console.log("1111111111@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@1111111111");
      //   console.log(val);
      //   console.log("1111111111@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@1111111111");
      this.workflowTypeChange(val);
      this.searchTableVosList(val);
      this.pitchOnDate = [];
    }
    // workflowType(val) {
    //     debugger
    //   if (val.length == 0) {
    //     return;
    //   }
    //   this.searchAppointRole();
    // }
  },
  methods: {
    // 初始化
    init() {
      this.workflowNameLike = "";
      this.productionApproval = [];
      this.pitchOnDate = [];
      this.clickType = "";
      this.launchType = "0";
      this.fkRoleId = "";
      this.tableIds = [{ tableName: "", pkId: "" }];
    },
    editInit(data, status) {
      // !editStatus
      // launchType
      this.clickType = 1;
      this.nodeShow = true;
      let arr = [];
      this.launchType = data.launchType + "";
      // this.launchType = status?data.launchType + "": data.launchType ==''|| data.launchType==null?"暂无数据":data.launchType;
      this.fkRoleId = data.fkRoleId + "";
      this.fkRoleIdName = data.fkRoleIdName;
      if (this.launchType == 1) {
        this.searchAppointRole();
      }
      if (data.workflowTableList && data.workflowTableList.length) {
        this.tableIds = data.workflowTableList;
      } else if (!status) {
        this.tableIds = [];
      }
      data.workflowNodeDTOS.forEach(item => {
        if (item.nodeType == 3) {
          item.bookPdfs = item.bookPdfDTOS;
          item.workflowName = item.nodeName;
          item.workflowType = item.baseSubWorkflow.workflowType;
          item.pkId = item.fkWorkflowId;
          arr.push(item);
        }
      });
      arr.forEach(item => {
        item.workflowNodes = item.baseSubWorkflow.workflowNodeDTOS;
      });
      this.pitchOnDate = arr;
      if (status) {
        // if (this.accessType == 1) {
        this.workflowTypeChange(this.fessionalTypeId);
        this.searchTableVosList(this.fessionalTypeId);
        // }
      }
      if (this.launchType == 2) {
        this.firstNode = this.pitchOnDate[0].workflowNodes[1];
      }
    },
    // 管理表格下拉
    searchTableVosList(id) {
      // this.form.fkProfessionalTypeId
      //   系统流程
      if (this.accessType == 1) {
        this.$api.searchTableVosList({ fkProfessionalTypeId: id, workflowType: this.workflowType }).then(res => {
          if (res.code == 200) {
            this.relatedForm = res.data;
          } else {
            this.$message.error(res.msg);
          }
        });
      }
      //   定制流程
      if (this.accessType == 2) {
        this.$api.customizedSearchTableVos({ workflowType: this.workflowType, fkOrgId: this.fkOrgId, fkProfessionalTypeId: this.tableProfessionalTypeId, dataTypeList: 3 }).then(res => {
          if (res.code == 200) {
            this.relatedForm = res.data;
            // this.fieldListform.tableIds.forEach(item => {
            //   let tableIdStatus = true;
            //   this.relatedForm.forEach(e => {
            //     e.tableSource = id == 1 ? 0 : 1;
            //     if (item.fkTableId == e.pkId) {
            //       tableIdStatus = false;
            //     }
            //   });
            //   if (tableIdStatus) {
            //     item.fkTableId = "";
            //   }
            // });
          }
        });
      }
      //   自定义流程
      if (this.accessType == 3) {
        this.$api.searchTableVos({ fkProfessionalTypeId: id, workflowType: this.workflowType }).then(res => {
          if (res.code == 200) {
            this.relatedForm = res.data;
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    tableIdsAdd() {
      this.tableIds.push({ tableId: "", isArchives: 1, tableSource: 1 });
    },
    tableIdsShiftOut(idx) {
      this.tableIds.splice(idx, 1);
      //   this.pitchOnDate.forEach(item => {
      //     if (item.pkId == this.fieldListform.pkId) {
      //       item.tableDTOS = this.fieldListform.tableIds;
      //     }
      //   });
    },
    tableIdsChange() {},
    launchTypeChange(val) {
      if (val == 1) {
        this.fkRoleId = "";
        this.searchAppointRole();
      }
      if (val == 2) {
        console.log(this.pitchOnDate[0].workflowNodes[1]);
        this.firstNode = this.pitchOnDate[0].workflowNodes[1];
      }
    },
    // 获取 指定发起人角色
    searchAppointRole() {
      let data = {
        workflowType: this.workflowType
      };
      //系统流程
      if (this.accessType == 1) {
        this.$api.searchAppointRole(data).then(res => {
          if (res.code == 200) {
            this.fkRoleIdArr = res.data;
          } else {
            this.fkRoleIdArr = [];
            this.$message.error(res.msg);
          }
        });
      }
      //定制流程
      if (this.accessType == 2) {
        this.$api.searchAppointRoleOperation({ orgId: this.fkOrgId }).then(res => {
          if (res.code == 200) {
            this.fkRoleIdArr = res.data;
          } else {
            this.fkRoleIdArr = [];
            this.$message.error(res.msg);
          }
        });
      }
      //自定义流程
      if (this.accessType == 3) {
        this.$api.searchAppointRoleEng().then(res => {
          if (res.code == 200) {
            this.fkRoleIdArr = res.data;
          } else {
            this.fkRoleIdArr = [];
            this.$message.error(res.msg);
          }
        });
      }
    },

    // 节点点击
    nodeClick(item, workflowType) {
      this.clickType = 3;
      this.nodeShow = true;
      console.log("11111111111111111111");
      console.log(item);
      this.fieldListform = item;
      this.fieldListform.workflowType = workflowType;
      this.fieldListform.quantitiesTable = this.fieldListform.quantitiesTable == 1 ? true : false;
      this.fieldListform.materialUsedTable = this.fieldListform.materialUsedTable == 1 ? true : false;
      this.fieldListform.scoreFlag = this.fieldListform.scoreFlag == 1 ? true : false;
      console.log("11111111111111111111");
    },
    // 工序点击
    bpmShowClick(row) {
      this.clickType = 2;
      this.nodeShow = true;
      this.fieldListform = row;
      if (row.bookPdfs != undefined && row.bookPdfs != null && row.bookPdfs.length != 0) {
        row.bookPdfs.forEach(item => {
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
      let arr = [];
      row.workflowNodes.forEach(item => {
        if (item.nodeType == 2 && item.tableDTOS != null) {
          arr = [...arr, ...item.tableDTOS];
        }
      });
      this.fieldListform.tableDTOS = this.unique(arr);
      console.log("--xxx-----xxxxxxxxxx---");
      console.log(this.fieldListform.tableDTOS);
      console.log("--xxx-----xxxxxxxxxx---");
    },
    // 根据唯一标识id来对数组进行过滤
    unique(arr) {
      const res = new Map(); //定义常量 res,值为一个Map对象实例
      //返回arr数组过滤后的结果，结果为一个数组   过滤条件是，如果res中没有某个键，就设置这                  个键的值为1
      return arr.filter(arr => !res.has(arr.fkTableId) && res.set(arr.fkTableId, 1));
    },
    processClick() {
      this.clickType = 1;
      this.nodeShow = true;
    },
    // 选择子流程 查询子流程所有数据
    itemClick(item) {
      console.log("添加工序", this.pitchOnDate);

      item.fkWorkflowId = item.pkId;
      if (item.isActive == false) {
        let status = false;
        this.pitchOnDate.forEach(item => {
          if (item.workflowType == 13) {
            status = true;
          }
        });
        if (status && item.workflowType == 13) {
          return this.$message.warning("已存在生产验收工序 ,生产验收流程只能存在一条生产验收工序");
        }
        // 系统流程
        if (this.accessType == 1) {
          this.$api.workflowById({ pkIds: item.pkId }).then(res => {
            if (res.code == 200) {
              res.data[0].fkWorkflowId = res.data[0].pkId;
              item.isActive = true;
              if (status) {
                let arr = [];
                let data = {};
                this.pitchOnDate.forEach(item => {
                  if (item.workflowType == 13) {
                    data = item;
                  } else {
                    arr.push(item);
                  }
                });
                arr.push(res.data[0]);
                arr.push(data);
                this.pitchOnDate = arr;
              } else {
                this.pitchOnDate.push(res.data[0]);
              }
            } else {
              this.$message.warning(res.msg);
            }
          });
        }
        //定制流程
        if (this.accessType == 2) {
          this.$api.customWorkflowById({ pkIds: item.pkId }).then(res => {
            if (res.code == 200) {
              res.data[0].fkWorkflowId = res.data[0].pkId;
              item.isActive = true;
              if (status) {
                let arr = [];
                let data = {};
                this.pitchOnDate.forEach(item => {
                  if (item.workflowType == 13) {
                    data = item;
                  } else {
                    arr.push(item);
                  }
                });
                arr.push(res.data[0]);
                arr.push(data);
                this.pitchOnDate = arr;
              } else {
                this.pitchOnDate.push(res.data[0]);
              }
            } else {
              this.$message.warning(res.msg);
            }
          });
        }
        //自定义流程
        if (this.accessType == 3) {
          this.$api.customWorkflowById({ pkIds: item.pkId }).then(res => {
            if (res.code == 200) {
              res.data[0].fkWorkflowId = res.data[0].pkId;
              item.isActive = true;
              if (status) {
                let arr = [];
                let data = {};
                this.pitchOnDate.forEach(item => {
                  if (item.workflowType == 13) {
                    data = item;
                  } else {
                    arr.push(item);
                  }
                });
                arr.push(res.data[0]);
                arr.push(data);
                this.pitchOnDate = arr;
              } else {
                this.pitchOnDate.push(res.data[0]);
              }
            } else {
              this.$message.warning(res.msg);
            }
          });
        }
      } else if (item.isActive == true) {
        item.isActive = false;
        this.pitchOnDate = this.pitchOnDate.filter(items => items.pkId !== item.pkId);
      }
    },
    link() {
      let target = document.getElementById("mao-dian");
      let parent = document.getElementById("left");
      parent.scrollTop = target.offsetTop - parent.offsetTop;
    },
    // 查询左侧数据
    workflowNameLikeQuery() {
      // 系统流程
      if (this.accessType == 1) {
        this.$api.searchWorkflowTemplateList({ fessionalTypeId: this.fessionalTypeId, workflowNameLike: this.workflowNameLike }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.isActive = false;
              if (this.pitchOnDate.length != 0) {
                this.pitchOnDate.forEach(e => {
                  if (item.pkId == e.fkWorkflowId) {
                    item.isActive = true;
                  }
                });
              }
            });
            this.productionApproval = res.data;
          }
        });
      }
      //定制流程
      if (this.accessType == "2") {
        this.$api
          .customizedSearchWorkflowTemplateList({
            fessionalTypeId: this.fessionalTypeId,
            fkOrgId: this.fkOrgId,
            workflowNameLike: this.workflowNameLike
          })
          .then(res => {
            if (res.code == 200) {
              res.data.forEach(item => {
                item.isActive = false;
                if (this.pitchOnDate.length != 0) {
                  this.pitchOnDate.forEach(e => {
                    if (item.pkId == e.fkWorkflowId) {
                      item.isActive = true;
                    }
                  });
                }
              });
              this.productionApproval = res.data;
            }
          });
      }
      //自定义流程
      if (this.accessType == 3) {
        this.$api.customSearchWorkflowTemplateList({ fessionalTypeId: this.fessionalTypeId, workflowNameLike: this.workflowNameLike }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.isActive = false;
              if (this.pitchOnDate.length != 0) {
                this.pitchOnDate.forEach(e => {
                  if (item.pkId == e.fkWorkflowId) {
                    item.isActive = true;
                  }
                });
              }
            });
            this.productionApproval = res.data;
          }
        });
      }
    },
    // 获取左侧列表
    workflowTypeChange(val, id) {
      this.workflowNameLike = "";
      const data = val == 0 ? id : val;
      // if(val == 0){
      //   data = id
      // }
      this.fessionalTypeId = data;
      //   系统流程
      if (this.accessType == 1) {
        this.$api.searchWorkflowTemplateList({ fessionalTypeId: data }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.isActive = false;
              if (this.pitchOnDate.length != 0) {
                this.pitchOnDate.forEach(e => {
                  if (item.pkId == e.fkWorkflowId) {
                    item.isActive = true;
                  }
                });
              }
            });
            this.productionApproval = res.data;
          }
        });
      }
      //定制流程
      if (this.accessType == 2) {
        this.$api
          .customizedSearchWorkflowTemplateList({
            fessionalTypeId: this.fessionalTypeId,
            fkOrgId: this.fkOrgId
          })
          .then(res => {
            if (res.code == 200) {
              res.data.forEach(item => {
                item.isActive = false;
                if (this.pitchOnDate.length != 0) {
                  this.pitchOnDate.forEach(e => {
                    if (item.pkId == e.fkWorkflowId) {
                      item.isActive = true;
                    }
                  });
                }
              });
              this.productionApproval = res.data;
            }
          });
      }
      //自定义流程
      if (this.accessType == 3) {
        this.$api.customSearchWorkflowTemplateList({ fessionalTypeId: data }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.isActive = false;
              if (this.pitchOnDate.length != 0) {
                this.pitchOnDate.forEach(e => {
                  if (item.pkId == e.fkWorkflowId) {
                    item.isActive = true;
                  }
                });
              }
            });
            this.productionApproval = res.data;
          }
        });
      }
    },
    // 移除某一项
    itemDelete(row, index) {
      row.isActive = false;
      this.pitchOnDate = this.pitchOnDate.filter(items => items.pkId !== row.pkId);
      this.productionApproval.forEach(item => {
        console.log(row);
        console.log(item);
        if (item.pkId == row.pkId || item.pkId == row.fkWorkflowId) {
          item.isActive = false;
        }
      });
      if (this.launchType == 2 && this.pitchOnDate.length > 0) {
        this.launchTypeChange(2);
      }
      // this.pitchOnDate.forEach((item, idx) => {
      //   this.$refs.bpmShow[idx].flushBpmn(item.bpmnContent);
      // });
    },
    // 向下
    itemDown(arr, index) {
      if (index >= this.pitchOnDate.length - 1) return this.pitchOnDate;
      this.pitchOnDate[index] = this.pitchOnDate.splice(index + 1, 1, this.pitchOnDate[index])[0];
      //   this.pitchOnDate.forEach((item, idx) => {
      //     this.$refs.bpmShow[idx].flushBpmn(item.bpmnContent);
      //   });
      // if (index >= arr.length - 1) return arr;
      // arr[index] = arr.splice(index + 1, 1, arr[index])[0];
      // return arr;
    },
    // 向上
    itemUpward(arr, index) {
      if (index < 1) return this.pitchOnDate;
      this.pitchOnDate[index] = this.pitchOnDate.splice(index - 1, 1, this.pitchOnDate[index])[0];
      //   this.pitchOnDate.forEach((item, idx) => {
      //     this.$refs.bpmShow[idx].flushBpmn(item.bpmnContent);
      //   });
      // if (index < 1) return arr;
      // arr[index] = arr.splice(index - 1, 1, arr[index])[0];
      // return arr;
    }
  }
};
</script>

<style lang="scss" scoped>
.productionApproval {
  display: flex;

  .left {
    width: 130px;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid;
    // overflow: hidden;
    // overflow-x: hidden;
    // overflow-y: scroll;
    position: relative;

    .header-query {
      // position: fixed;
      width: 125px;
      background: #fff;
    }

    .item {
      width: 80px;
      border: 1px dashed;
      margin: 0 auto;
      text-align: center;
      margin-top: 6px;
      padding: 5px;
    }

    .item:hover {
      cursor: pointer;
    }

    .active {
      background: #81d3f8;
      color: #fff;
    }
  }

  //

  ::-webkit-scrollbar {
    width: 8px;
    height: 10px;
  }

  ::-webkit-scrollbar-button {
    background-color: rgba(255, 255, 255, 255);
  }

  ::-webkit-scrollbar-track-piece {
    background: rgba(255, 255, 255, 255);
  }

  ::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  //
  .center {
    flex: 1;
    text-align: center;
    overflow-y: scroll;

    .kaishi {
      width: 25px;
      height: 25px;
      margin: 5px auto;
      border-radius: 50%;
      border: 1px solid;
      position: relative;

      span {
        position: absolute;
        left: -40px;
      }
    }

    .jieshu {
      background: #000;
    }

    .jiantou {
      transform: rotate(-91deg);
    }

    .bpmShow {
      width: 80%;
      height: 210px;
      border: 1px dashed;
      margin: 0 auto;
      margin-bottom: 8px;
      position: relative;
      overflow: hidden;

      .canvas {
        width: 100%;
      }

      /deep/ .djs-palette,
      /deep/.bjs-powered-by {
        display: none;
      }
    }

    .bpmShowxshou:hover {
      cursor: pointer;
    }

    .bpmShowxshou {
      position: absolute;
      top: 0;
      left: 0;
      padding: 8px;
      width: 100%;
      //   height: 100%;
      text-align: center;
    }

    .bpmShowxshouButm {
      z-index: 1000;
    }
  }

  .right {
    width: 400px;
    height: 100%;
    border-left: 1px solid;

    .title {
      line-height: 32px;
      text-align: center;
      background: #81d3f8;
    }

    .panleTitle {
      padding-left: 12px;
      line-height: 30px;
      background: #ccc;
      border: 1px solid;
      border-top: 2px solid;
    }

    /deep/ .el-form-item {
      margin: 0;
      margin-left: 2px;
    }
  }
}
.table-height {
  max-height: 147px !important;
  overflow: auto;
}
.workflow-nameLike {
  /deep/ .el-input__inner {
    // padding: 0;
    padding-left: 2px;
    padding-right: 26px !important;
  }
}
.no-data {
  line-height: 40px;
  font-size: 16px;
  text-align: center;
}
.yc {
  // display: inline;
  display: inline-block;
  max-width: 7em; //超过15个字 这里注意省略号算一个字 所以字应该是14个
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
//
.box {
  overflow-x: auto;
}
.jf-conten {
  justify-content: center;
}
.p-left {
  position: absolute;
  left: 0;
}
.p-right {
  // position: absolute;
  // // rignth: 0;
  // right:0px
}
.pd-left {
  padding-left: 25px;
  padding-left: 25px;
}
</style>
