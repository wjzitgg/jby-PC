<template>
  <div class="app-container">
    <!-- 头部搜索框 -->
    <el-radio-group v-model="bizType" @change="bizChange">
      <!-- 分项工程：1，业主计量模板：2，设计变更模板：4 -->
      <el-radio-button label="1">生产验收流程</el-radio-button>
      <el-radio-button label="2">业主结算流程</el-radio-button>
      <el-radio-button label="4">变更设计流程</el-radio-button>
    </el-radio-group>
    <div class="clearfix card-header search-mr">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <el-form-item label="项目" label-width="50px">
            <el-select v-model="inpData.fkProjectId" size="mini" @change="projectIdChange">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in projectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标段项目" label-width="90px">
            <el-select v-model="inpData.fkProjectBidId" size="mini">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" label-width="50px">
            <el-select v-model="inpData.enableStatus" size="mini">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in typeOptions" :key="item.name" :label="item.key" :value="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="流程名称" label-width="90px">
            <el-input size="mini" v-model="inpData.workflowName" maxlength="50"></el-input>
          </el-form-item>
          <el-button size="mini" class="btn-serach el-button-primary" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        </el-form>
      </div>
      <div class="batchBtn">
        <el-button type="primary" :disabled="![1].includes(disabledType)" @click="batch(2)" size="mini">批量审批</el-button>
        <el-button type="primary" :disabled="![2].includes(disabledType)" @click="batch(3)" size="mini">批量处理撤回</el-button>
      </div>
    </div>
    <!-- 表ge -->
    <div class="table-data" style="height:75%">
      <el-table ref="tables" v-loading="loading" :data="tableData" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <!-- <el-table-column align="center" label="序号" type="index" width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column> -->
        <el-table-column align="center" label="选择" min-width="60">
          <template slot-scope="{ row }">
            <div style="text-align: center">
              <el-checkbox @change="checkBoxChange($event, row)" :value="isCheck(row)" :disabled="chekDisable(row)" class="mychecked"></el-checkbox>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="项目" prop="fkProjectName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="标段项目" prop="fkProjectBidName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="流程名称" prop="workflowName">
          <template slot-scope="{ row }">
            <div class="ellipsistwo" :title="row.workflowName">{{ row.workflowName }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="使用场景" v-if="bizType == 1" prop="fkItemName" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="申请人" prop="createUser" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="申请时间" prop="createTime" min-width="130" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="审批人" prop="fkApproveName" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="审批时间" prop="approveTime" min-width="130" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="状态" prop="enableStatusName"></el-table-column>
        <el-table-column label="操作" align="center" width="320">
          <template slot-scope="{ row }">
            <el-button plain type="primary" size="mini" @click="openDialog(row, 1)">查看</el-button>
            <el-button plain size="mini" type="primary" @click="openDialog(row, 2)" v-show="row.changeStatus">审批</el-button>
            <el-button plain size="mini" type="primary" @click="openDialog(row, 3)" v-show="row.handleStatus">处理</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" top="10vh" width="80%" @close="closeDialog" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="acceptDia">
        <div class="itemTree" v-if="isBatch">
          <el-tree :data="batchTree" ref="batchTree" node-key="pkId" :props="defaultProps" :default-expand-all="true" @node-click="nodeClick"></el-tree>
        </div>
        <div class="acceptDia-right" :class="{ 'righy-wh': isBatch, 'righy-wh2': !isBatch }">
          <div class="dialog-head" :key="dialogVisible">
            <el-row :gutter="24" style="width:100%">
              <el-col :span="4" class="mt-10" v-if="dialogType == 2 || dialogType == 3">
                <span>流程类型：</span>
                <div class="content" :title="bizType == 1 ? '生产验收流程' : bizType == 2 ? '业主结算流程' : '变更设计流程'">{{ bizType == 1 ? "生产验收流程" : bizType == 2 ? "业主结算流程" : "变更设计流程" }}</div>
              </el-col>
              <el-col :span="4" class="mt-10" v-if="dialogType != 1 || bizType == 2 || bizType == 4">
                <span>项目：</span>
                <div class="content" :title="form.fkProjectName">{{ form.fkProjectName }}</div>
              </el-col>
              <el-col :span="4" class="mt-10" v-if="dialogType != 1 || bizType == 2 || bizType == 4">
                <span>标段项目：</span>
                <div class="content" :title="form.fkBidProjectName">{{ form.fkBidProjectName }}</div>
              </el-col>
              <el-col :span="4" class="mt-10">
                <span>流程名称：</span>
                <div class="content" :title="form.workflowTemplateVo.workflowName">{{ form.workflowTemplateVo.workflowName }}</div>
              </el-col>
              <el-col :span="4" class="mt-10" v-if="bizType == 1">
                <span>单位工程：</span>
                <div class="content" :title="form.oneParentName">{{ form.oneParentName }}</div>
              </el-col>
              <el-col :span="4" class="mt-10" v-if="bizType == 1">
                <span>分部工程：</span>
                <div class="content" :title="form.secondParentName">{{ form.secondParentName }}</div>
              </el-col>
              <el-col :span="4" class="mt-10" v-if="bizType == 1">
                <span>分项工程：</span>
                <div class="content" :title="form.fkItemName">{{ form.fkItemName }}</div>
              </el-col>
              <el-col :span="4" class="mt-10" v-if="form.approvalType != 1">
                <span>申请人：</span>
                <div class="content" :title="form.createUserName">{{ form.createUserName }}</div>
              </el-col>
              <el-col :span="4" class="mt-10" v-if="form.approvalType != 1">
                <span>申请时间：</span>
                <div class="content" :title="form.createTime">{{ form.createTime }}</div>
              </el-col>
              <el-col :span="4" class="mt-10" v-if="this.dialogType == 1 && form.enableStatus == '待审批' && form.enableStatus != '申请撤回'">
                <span>审批状态：</span>
                <div class="content" :title="form.enableStatus">{{ form.enableStatus }}</div>
              </el-col>
              <template v-if="form.enableStatus != '待审批' && form.approvalType != 1">
                <el-col :span="4" class="mt-10">
                  <span>审批人：</span>
                  <div class="content" :title="form.fkApproveName">{{ form.fkApproveName }}</div>
                </el-col>
                <el-col :span="4" class="mt-10">
                  <span>审批时间：</span>
                  <div class="content" :title="form.approveTime">{{ form.approveTime }}</div>
                </el-col>
                <el-col :span="4" class="mt-10">
                  <span>审批状态：</span>
                  <div class="content" :title="form.enableStatus">{{ form.enableStatus }}</div>
                </el-col>
                <el-col :span="4" class="mt-10">
                  <span>审批意见：</span>
                  <div class="content" :title="form.remark">{{ form.remark }}</div>
                </el-col>
              </template>
              <template v-if="form.approvalType == 1">
                <el-col :span="4" class="mt-10">
                  <span>申请撤回人：</span>
                  <div class="content content2" :title="form.withdrawApproveName">{{ form.withdrawApproveName }}</div>
                </el-col>
                <el-col :span="4" class="mt-10">
                  <span>申请撤回时间：</span>
                  <div class="content content2" :title="form.withdrawApproveTime">{{ form.withdrawApproveTime }}</div>
                </el-col>
                <el-col :span="4" class="mt-10">
                  <span>申请撤回原因：</span>
                  <div class="content content2" :title="form.reason">{{ form.reason }}</div>
                </el-col>
                <template v-if="form.enableStatus == '批准撤回' || form.enableStatus == '不予撤回'">
                  <el-col :span="4" class="mt-10">
                    <span>审批人：</span>
                    <div class="content" :title="form.fkApproveName">{{ form.fkApproveName }}</div>
                  </el-col>
                  <el-col :span="4" class="mt-10">
                    <span>审批时间：</span>
                    <div class="content" :title="form.approveTime">{{ form.approveTime }}</div>
                  </el-col>
                  <el-col :span="4" class="mt-10">
                    <span>审批状态：</span>
                    <div class="content" :title="form.enableStatus">{{ form.enableStatus }}</div>
                  </el-col>
                  <el-col :span="4" class="mt-10">
                    <span>审批意见：</span>
                    <div class="content" :title="form.remark">{{ form.remark }}</div>
                  </el-col>
                </template>
              </template>
            </el-row>
          </div>
          <acceptanceProcess :editStatus="false" :workflowType="'1'" :accessType="'3'" ref="productionApproval" v-if="bizType == 1"></acceptanceProcess>
          <examine-bpmn :fkProfessionalTypeId="form.fkProfessionalTypeId" v-if="bizType != 1" style="width: 100%; height: 500px" :workflowType="bizType" :fkOrgId="user.fkOrgId" ref="examineBpmn" :XmlStr="XmlStr" :tableSource="'1'" :dataList="form.workflowTemplateVo" :fkWorkflowId="form.fkWorkflowId"></examine-bpmn>
        </div>
        <!-- <div class="productionApproval" style="height: 450px">
          <div class="center">
            <div class="kaishi">
              <span>开始</span>
            </div>
            <img src="../../assets/jiantou.svg" class="jiantou" alt="" />
            <div v-for="(item, index) in pitchOnDate" :key="index" @click="bpmShowClick(item)">
              <div class="bpmShow">
                <div class="box">
                  <bpm-show :bpmnContent="item.bpmnContent" style="width: 100%" ref="bpmShow"></bpm-show>
                </div>
                <span class="bpmShowxshou">{{ item.workflowName }}</span>
              </div>
              <img src="../../assets/jiantou.svg" class="jiantou" alt="" />
            </div>
            <div class="kaishi jieshu">
              <span>结束</span>
            </div>
          </div>
          <div class="right">
            <div class="title">工序信息</div>
            <div class="panleTitle" v-if="nodeShow"><i class="el-icon-info"></i> 常规</div>
            <div v-if="nodeShow">
              <el-form ref="nodeForm" style="padding: 0">
                <el-form-item label="节点名称" :label-width="formLabelWidth" style="margin-right: 6px">
                  <el-input disabled v-model="fieldListform.name" size="mini" autocomplete="off"></el-input>
                </el-form-item>
                <div class="panleTitle"><i class="el-icon-s-order"></i> 资料设置</div>
                <el-form-item label="技术规范">
                  <el-col :span="8">
                    <el-input clearable disabled size="mini" v-model="fieldListform.technology" />
                  </el-col>
                  <el-col :span="4">
                    <el-input clearable disabled size="mini" type="number" v-model="fieldListform.jsThePage" />
                  </el-col>
                  <el-col :span="2">
                    <span>页 ~</span>
                  </el-col>
                  <el-col :span="4">
                    <el-input clearable disabled size="mini" v-model="fieldListform.jsToPage" />
                  </el-col>
                  <el-col :span="1">
                    <span>页</span>
                  </el-col>
                </el-form-item>
                <el-form-item label="安全规范" >
                  <el-col :span="8">
                    <el-input clearable disabled size="mini" v-model="fieldListform.safety" />
                  </el-col>
                  <el-col :span="4">
                    <el-input disabled clearable size="mini" v-model="fieldListform.aqThePage" />
                  </el-col>
                  <el-col :span="2">
                    <span>页 ~</span>
                  </el-col>
                  <el-col :span="4">
                    <el-input disabled clearable size="mini" v-model="fieldListform.aqToPage" />
                  </el-col>
                  <el-col :span="1">
                    <span>页</span>
                  </el-col>
                </el-form-item>
                <el-form-item label="验收标准" >
                  <el-col :span="8">
                    <el-input clearable disabled size="mini"  v-model="fieldListform.standard" />
                  </el-col>
                  <el-col :span="4">
                    <el-input disabled clearable size="mini" v-model="fieldListform.ysThePage" />
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
                </el-form-item>
                <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设置</div>
                <div class="tableList">
                  <el-row v-for="(item, index) in fieldListform.tableIds" :key="index" style="margin: 4px 0px;" class="table-item">
                    <el-col :span="16">
                      <el-input clearable disabled size="mini" :value="item.tableName" />
                    </el-col>
                    <el-col :span="1"></el-col>
                    <el-col :span="7">
                      <el-checkbox v-model="item.archives" disabled>档案表</el-checkbox>
                    </el-col>
                  </el-row>
                  <span v-if="!fieldListform.tableIds.length">无动态表格</span>
                </div>
                <div style="margin: 6px">
                  <div>可编辑内容：</div>
                  <el-checkbox v-model="fieldListform.quantitiesTable" disabled v-if="fieldListform.workflowType == 0">工程量</el-checkbox>
                  <el-checkbox v-model="fieldListform.materialUsedTable" disabled v-if="fieldListform.workflowType == 0">材料用量</el-checkbox>
                  <el-checkbox v-model="fieldListform.scoreFlag" disabled v-if="fieldListform.workflowType == 13">工程评分</el-checkbox>
                </div>
              </el-form>
            </div>
          </div>
        </div> -->
      </div>
      <div slot="footer" class="dialog-footer" v-if="dialogType != 1">
        <el-button type="primary" @click="openAppDialog(1)">{{ dialogType == 2 ? "审批通过" : "同意撤回" }}</el-button>
        <el-button type="danger" @click="openAppDialog(2)">驳回</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="approveTitle" :visible.sync="reasonWithdrawal" width="500px" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 6 }" maxlength="100" :placeholder="'请输入' + (appType == 1 ? '意见' : '驳回原因')" v-model.trim="reasonRemark"> </el-input>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" class="el-button-primary" @click="withdrawActivity" v-if="appType == 1">确认</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="turndown" v-if="appType == 2">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import bpmShow from "../../components/bpmShow.vue";
import acceptanceProcess from "../../components/acceptanceProcess.vue";
import examineBpmn from "../../components/userdefined-basic/examineBpmn.vue";
export default {
  components: { bpmShow, acceptanceProcess, examineBpmn },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  data() {
    return {
      loading: false,
      page: {
        pageNum: 1,
        pageSize: 10
      },
      bizType: "1",
      total: 0,
      inpData: {
        fkProjectId: "",
        fkProjectBidId: "",
        enableStatus: "",
        workflowName: ""
      },
      searchData: {
        fkProjectId: "",
        fkProjectBidId: "",
        enableStatus: "",
        workflowName: ""
      },
      tableData: [],
      projectList: [],
      noProjectData: [],
      dialogVisible: false,
      dialogTitle: "验收流程详情",
      dialogType: 1,
      form: {
        workflowTemplateVo: {}
      },
      list: [],
      typeOptions: [],
      pitchOnDate: [],
      fieldListform: {
        name: "",
        tableIds: [],
        technology: "", // 技术
        jsThePage: null, // 技术开始页
        jsToPage: null, // 技术结束页
        safety: "", // 安全
        aqThePage: null, // 安全开始页
        aqToPage: null, // 安全结束页
        standard: "", // 验收
        ysThePage: null, // 验收开始页
        ysToPage: null, // 验收结束页
        quantitiesTable: "", // 工程量
        materialUsedTable: "", // 材料用量
        scoreFlag: "" // 评分量
      },
      technologyDate: [],
      safetyDate: [],
      acceptanceLevel: [],
      relatedForm: [],
      nodeShow: false,
      formLabelWidth: "90px",
      batchTree: [],
      defaultProps: {
        children: "children",
        label: "itemName"
      },
      isBatch: false,
      multipleSelection: [],
      disabledType: -1,
      XmlStr: "",
      reasonWithdrawal: false,
      reasonRemark: "",
      approveTitle: "填写意见",
      appType: 1
    };
  },
  mounted() {
    this.noProject();
    this.searchProdItemApprovalPage();
    this.searchApproveExamineStatsQuery();
  },
  methods: {
    openAppDialog(type) {
      this.appType = type;
      this.reasonRemark = "";
      if (type == 1) {
        this.approveTitle = "填写意见";
      } else {
        this.approveTitle = "驳回原因";
      }
      this.reasonWithdrawal = true;
    },
    searchItemByTemplate() {
      let pkIds = this.multipleSelection.map(item => item.pkId).join(",");
      this.$api.searchItemByTemplateRecordInfo({ pkIds }).then(res => {
        if (res.code === 200) {
          this.batchTree = res.data;
          if (this.batchTree.length) {
            let pkId = this.batchTree[0].children[0].children[0].businessApprovalRecordId;
            this.findProdItemApprovalById(pkId);
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    batch(type) {
      this.dialogType = type;
      this.isBatch = true;
      this.dialogVisible = true;
      this.$nextTick(() => {
        if (this.bizType == "1") {
          this.searchItemByTemplate();
        } else {
          this.batchTree = this.multipleSelection.map(item => ({ itemName: item.workflowName, ...item }));
          this.findProdItemApprovalById(this.multipleSelection[0].pkId);
        }
      });
    },
    nodeClick(data, node) {
      console.log(node);
      console.log(this.bizType, data.grade);
      if (this.bizType == 1 && data.grade == 3) {
        this.findProdItemApprovalById(data.businessApprovalRecordId);
      }
      if (this.bizType != 1) {
        this.findProdItemApprovalById(data.pkId);
      }
    },
    findProdItemApprovalById(pkId) {
      this.$api
        .prodItemApprovalRecordInfoFindById({ pkId })
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.form = res.data;
            this.XmlStr = res.data.workflowTemplateVo.bpmnContent;
            this.$nextTick(() => {
              if (this.bizType == 1) {
                this.$refs.productionApproval.editInit(res.data.workflowTemplateVo, false);
              } else {
                this.$refs.examineBpmn.exportDiagram(res.data.workflowTemplateVo.bpmnContent, res.data.workflowTemplateVo);
              }
              this.loading = false;
            });
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    bizChange() {
      this.multipleSelection = [];
      this.disabledType = -1;
      this.tableData = [];
      this.total = 0;
      this.page.pageNum = 1;
      this.inpData = {
        fkProjectId: "",
        fkProjectBidId: "",
        enableStatus: "",
        workflowName: ""
      };
      this.searchData = {
        fkProjectId: "",
        fkProjectBidId: "",
        enableStatus: "",
        workflowName: ""
      };
      this.searchProdItemApprovalPage();
    },
    isCheck(row) {
      let arr = this.multipleSelection.filter(item => item.pkId == row.pkId);
      if (arr.length) {
        return true;
      } else {
        return false;
      }
    },
    chekDisable(row) {
      if (!row.changeStatus && this.disabledType == 1) {
        return true;
      }
      if (!row.handleStatus && this.disabledType == 2) {
        return true;
      }
      if (!row.changeStatus && !row.handleStatus) {
        return true;
      }
      return false;
    },
    checkBoxChange(e, row) {
      if (e) {
        this.multipleSelection.push(row);
        if (row.changeStatus) {
          this.disabledType = 1;
        }
        if (row.handleStatus) {
          this.disabledType = 2;
        }
      } else {
        this.multipleSelection = this.multipleSelection.filter(item => item.pkId !== row.pkId);
      }
      if (!this.multipleSelection.length) {
        this.disabledType = -1;
      }
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
    // 根据项目id获取标段项目下拉列表
    projectIdChange(val) {
      const data = {};
      if (val.length == 0) {
        this.inpData.fkProjectBidId = ""; // 清空标段项目
        this.noProjectData = [];
        return;
      } else {
        data.isWhole = 0;
        data.projectId = val;
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
    searchApproveExamineStatsQuery() {
      this.$api.searchApproveExamineStatsQuery().then(res => {
        if (res.code === 200) {
          this.typeOptions = res.data;
        }
      });
    },
    searchProdItemApprovalPage() {
      let data = { ...this.page, ...this.searchData, bizType: this.bizType };
      this.$api.prodItemApprovalRecordInfo(data).then(res => {
        if (res.code === 200) {
          if (res.data) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    openDialog(row, type) {
      this.dialogType = type;
      this.isBatch = false;
      this.loading = true;
      this.$api
        .prodItemApprovalRecordInfoFindById({ pkId: row.pkId })
        .then(res => {
          if (res.code == 200) {
            if (res.data) {
              this.form = res.data;
              this.XmlStr = res.data.workflowTemplateVo.bpmnContent;
              this.dialogVisible = true;
              this.$nextTick(() => {
                if (this.bizType == 1) {
                  this.$refs.productionApproval.editInit(res.data.workflowTemplateVo, false, res.data.workflowTableList);
                } else {
                  this.$refs.examineBpmn.exportDiagram(res.data.workflowTemplateVo.bpmnContent, res.data.workflowTemplateVo);
                }
                this.loading = false;
              });
              // let arr = [];
              // res.data.workflowTemplateVo.workflowNodeDTOS.forEach(item => {
              //   if (item.nodeType == 3) {
              //     arr.push(item);
              //   }
              // });
              // let nodeList = res.data.workflowTemplateVo.nodeList.join(",");
              // this.$api
              //   .engWorkflowById({ pkIds: nodeList })
              //   .then(res => {
              //     if (res.code == 200) {
              //       let arr1 = res.data;
              //       arr1.forEach(item => {
              //         arr.forEach(e => {
              //           if (item.pkId == e.fkWorkflowId) {
              //             item.baseSubWorkflow = e.baseSubWorkflow;
              //             item.bookPdfDTOS = e.bookPdfDTOS;
              //             item.fkRoleId = e.fkRoleId;
              //             item.fkWorkflowId = e.fkWorkflowId;
              //             item.fkWorkflowTemplateId = e.fkWorkflowTemplateId;
              //             item.materialUsedTable = e.materialUsedTable;
              //             item.name = e.name;
              //             item.nodeApproveType = e.nodeApproveType;
              //             item.nodeName = e.nodeName;
              //             item.nodeType = e.nodeType;
              //             item.quantitiesTable = e.quantitiesTable;
              //             item.roleName = e.roleName;
              //             item.scoreFlag = e.scoreFlag;
              //             item.sortval = e.sortval;
              //             item.tableDTOS = e.tableDTOS;
              //           }
              //         });
              //       });
              //       this.pitchOnDate = arr1;
              //       this.dialogVisible = true;
              //       this.loading = false;
              //     } else {
              //       this.loading = false;
              //       this.$message.warning(res.msg);
              //     }
              //   })
              //   .catch(err => {
              //     this.loading = false;
              //   });
            } else {
              this.form = { workflowTemplateVo: {} };
              this.list = [];
              this.dialogVisible = true;
            }
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    withdrawActivity() {
      // this.$prompt("", "填写意见", {
      //   inputType: "textarea",
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消"
      // }).then(({ value }) => {
      let arr = [];
      if (this.isBatch) {
        this.multipleSelection.forEach(item => {
          arr.push({ enableStatus: 1, remark: this.reasonRemark ? this.reasonRemark : "审批通过", pkId: item.pkId });
        });
      } else {
        arr = [{ enableStatus: 1, remark: this.reasonRemark ? this.reasonRemark : "审批通过", pkId: this.form.pkId }];
      }
      // let data = { enableStatus: 1, remark: value ? value : "审批通过", pkId: this.form.pkId };
      this.loading = true;
      this.$api
        .approveExamine(arr)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("操作成功");
            this.multipleSelection = [];
            this.disabledType = -1;
            this.reasonWithdrawal = false;
            this.searchProdItemApprovalPage();
            this.closeDialog();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
      // });
    },
    turndown() {
      // this.$prompt("驳回原因", "填写意见", {
      //   inputType: "textarea",
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消"
      // }).then(({ value }) => {
      if (!this.reasonRemark) {
        return this.$message.warning("请填写驳回原因");
      }
      let arr = [];
      if (this.isBatch) {
        this.multipleSelection.forEach(item => {
          arr.push({ enableStatus: 2, remark: this.reasonRemark ? this.reasonRemark : "审批不通过", pkId: item.pkId });
        });
      } else {
        arr = [{ enableStatus: 2, remark: this.reasonRemark ? this.reasonRemark : "审批不通过", pkId: this.form.pkId }];
      }
      // let data = { enableStatus: 2, remark: value ? value : "审批不通过", pkId: this.form.pkId };
      this.$api
        .approveExamine(arr)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("操作成功");
            this.multipleSelection = [];
            this.disabledType = -1;
            this.reasonWithdrawal = false;
            this.searchProdItemApprovalPage();
            this.closeDialog();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
      // });
    },
    closeDialog() {
      this.dialogVisible = false;
      this.fieldListform = {
        name: "",
        tableIds: [],
        technology: "", // 技术
        jsThePage: null, // 技术开始页
        jsToPage: null, // 技术结束页
        safety: "", // 安全
        aqThePage: null, // 安全开始页
        aqToPage: null, // 安全结束页
        standard: "", // 验收
        ysThePage: null, // 验收开始页
        ysToPage: null, // 验收结束页
        quantitiesTable: "", // 工程量
        materialUsedTable: "", // 材料用量
        scoreFlag: "", // 评分量
        workflowType: ""
      };
      this.nodeShow = false;
    },
    search() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.multipleSelection = [];
      this.disabledType = -1;
      this.searchProdItemApprovalPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.searchProdItemApprovalPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchProdItemApprovalPage();
    },
    // 子流程点击
    bpmShowClick(row) {
      //  return
      this.nodeShow = true;
      this.fieldListform = {
        name: "",
        tableIds: [],
        technology: "", // 技术
        jsThePage: null, // 技术开始页
        jsToPage: null, // 技术结束页
        safety: "", // 安全
        aqThePage: null, // 安全开始页
        aqToPage: null, // 安全结束页
        standard: "", // 验收
        ysThePage: null, // 验收开始页
        ysToPage: null, // 验收结束页
        quantitiesTable: "", // 工程量
        materialUsedTable: "", // 材料用量
        scoreFlag: "", // 评分量
        workflowType: ""
      };

      if (this.$refs.nodeForm != undefined) {
        this.$refs.nodeForm.resetFields();
      }
      this.fieldListform.workflowType = row.workflowType;
      this.fieldListform.pkId = row.pkId;
      this.fieldListform.name = row.workflowName;
      this.fieldListform.quantitiesTable = row.quantitiesTable == true;
      this.fieldListform.materialUsedTable = row.materialUsedTable == true;
      this.fieldListform.scoreFlag = row.scoreFlag == true;
      this.fieldListform.tableIds = row.tableDTOS;

      if (row.bookPdfDTOS != undefined && row.bookPdfDTOS.length != 0) {
        row.bookPdfDTOS.forEach(item => {
          if (item.sortval == 0) {
            this.fieldListform.technology = item.bookName;
            this.fieldListform.jsThePage = item.beginPage;
            this.fieldListform.jsToPage = item.endPage;
          } else if (item.sortval == 1) {
            this.fieldListform.safety = item.bookName;
            this.fieldListform.aqThePage = item.beginPage;
            this.fieldListform.aqToPage = item.endPage;
          } else if (item.sortval == 2) {
            this.fieldListform.standard = item.bookName;
            this.fieldListform.ysThePage = item.beginPage;
            this.fieldListform.ysToPage = item.endPage;
          }
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  background: $searcHeder;
  height: 80px;

  .head {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;
    align-items: center;

    .el-form {
      display: flex;
      align-items: center;

      .el-select,
      .el-input {
        width: 150px;
      }

      .el-form-item {
        margin-bottom: 0;
      }
    }

    .addBtn {
      margin-top: 5px;
      height: 28px;
    }
  }
  .btn-serach {
    margin-left: 20px;
    height: 28px;
  }
  .batchBtn {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
// .dialog-head {
//   width: 100%;
//   padding: 20px 10px;
//   background-color: #f2f2f2;
//   .content {
//     display: inline-block;
//     width: 140px;
//     overflow: hidden;
//     white-space: nowrap; /*禁⽌换⾏*/
//     text-overflow: ellipsis; /*省略号*/
//     vertical-align: top;
//   }
//   .wh-100 {
//     width: 100px;
//   }
//   .wh-500 {
//     width: 500px;
//   }
//   .mt-10 {
//     margin-top: 10px;
//   }
// }
.taskFinishList {
  width: 100%;
  height: 500px;
}
.productionApproval {
  display: flex;
  .left {
    width: 130px;
    height: 100%;
    border-right: 1px solid;
    overflow: hidden;
    overflow-x: hidden;
    overflow-y: scroll;

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
      height: 100%;
      text-align: center;
    }

    .bpmShowxshouButm {
      z-index: 1000;
    }
  }

  .right {
    width: 400px;
    height: 100%;

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
/deep/ .canvas a {
  display: none !important;
}
.tableList {
  width: 100%;
  height: 100px;
  overflow: auto;
}
.table-item {
  display: flex;
  align-items: center;
  width: 100%;
}
.acceptDia {
  display: flex;
  width: 100%;
  .acceptDia-right {
    // flex: 1;
    .dialog-head {
      width: 100%;
      padding: 20px 10px;
      background-color: #f2f2f2;
      .content {
        display: inline-block;
        width: calc(100% - 80px);
        overflow: hidden;
        white-space: nowrap; /*禁⽌换⾏*/
        text-overflow: ellipsis; /*省略号*/
        vertical-align: top;
      }
      .content2 {
        width: calc(100% - 110px);
      }
      .mt-10 {
        margin-bottom: 10px;
      }
    }
  }
  .righy-wh {
    width: calc(100% - 300px);
  }
  .righy-wh2 {
    width: 100%;
  }
  .itemTree {
    width: 300px;
    height: 600px;
    /deep/ .el-tree {
      width: 300px;
      height: 580px;
      overflow: auto;
    }
  }
}
.el-button--primary.is-disabled,
.el-button--primary.is-disabled:active,
.el-button--primary.is-disabled:focus,
.el-button--primary.is-disabled:hover {
  background-color: #a0cfff !important;
}
</style>
