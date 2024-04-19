<template>
  <div class="app-container">
    <!-- 头部tab栏 -->
    <el-radio-group v-model="topRadio" size="mini" v-if="user.orgType === 5">
      <el-radio-button :label="1">分包单位</el-radio-button>
      <el-radio-button :label="2">工区</el-radio-button>
    </el-radio-group>
    <!-- 头部搜索框 -->
    <div slot="header" class="clearfix card-header">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <el-form-item label="项目" v-if="user.orgType == 2 || user.orgType == 3">
            <el-select v-model="proId" size="mini" @change="linkProChange">
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="labelName">
            <el-select v-model="fkProjectId" size="mini" @change="proChange" v-if="(topRadio > 2 && user.orgType == 2) || (topRadio > 2 && user.orgType == 3)">
              <el-option v-for="item in proOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
            </el-select>
            <el-select v-model="fkProjectId" size="mini" @change="proChange" v-if="topRadio > 2 && user.orgType !== 2 && topRadio > 2 && user.orgType !== 3">
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
            <el-select v-model="customerIds" size="mini" @change="cusChange" multiple collapse-tags class="sa" v-if="topRadio === 1">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in subOption" :key="item.fkCustomId" :value="item.fkCustomId" :label="item.customName"></el-option>
            </el-select>
            <el-select v-model="workAreaIds" size="mini" multiple collapse-tags @change="areaChange" class="sa" v-if="topRadio === 2">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in areaOption" :key="item.pkId" :value="item.pkId" :label="item.areaName"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="项目编号">
            <el-input size="mini" v-model="inpData.itemCode"></el-input>
          </el-form-item> -->
          <el-form-item label="检查状态">
            <el-select v-model="inpData.finishStatus" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option :value="1" label="未完成"></el-option>
              <el-option :value="2" label="已完成"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input size="mini" v-model="inpData.itemName"></el-input>
          </el-form-item>

          <!-- <el-form-item>
            <el-button size="mini" type="primary" @click="search"
              >搜索</el-button
            >
          </el-form-item> -->
        </el-form>
      </div>
    </div>
    <!-- 表单 -->
    <el-table border :data="showList" ref="tables" height="70%" :row-class-name="tableRowClassName" :header-cell-style="{ background: '#f3f3f3' }" v-loading="loading2">
      <el-table-column align="center" label="序号" width="60" type="index">
        <!-- <template slot-scope="scope">
          <div style="text-align: center">
            {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
          </div>
        </template> -->
      </el-table-column>
      <el-table-column align="center" label="编号" prop="itemCode"></el-table-column>
      <el-table-column align="center" label="项目名称" prop="itemName"></el-table-column>
      <el-table-column align="center" label="分包单位" prop="customerName" v-if="topRadio !== 2"></el-table-column>
      <el-table-column align="center" label="工区" prop="areaName" v-if="topRadio !== 1"></el-table-column>
      <el-table-column align="center" label="施工工序流程" prop="workflowName"></el-table-column>
      <el-table-column align="center" label="完成状态">
        <template slot-scope="{ row }">
          <span>{{ row.completionStatus === 1 ? "未完成" : row.completionStatus === 2 ? "已完成" : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="检查结果">
        <template slot-scope="{ row }">
          <span>{{ row.checkResult === 0 ? "不合格" : row.checkResult === 1 ? "合格" : row.checkResult === 2 ? "良好" : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <el-button size="mini" @click="openDialog(row.pkId)" v-if="row.grade == 3">检查详情</el-button>
        </template>
      </el-table-column>
      <div slot="empty" class="empty" style="width: 100%">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </el-table>
    <!-- 分页组件 -->
    <!-- <Pagination
      class="pagination"
      :pageSize="page.pageSize"
      :total="total"
      :currentPage="page.pageNum"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    /> -->

    <!-- 模态框 -->
    <el-dialog :close-on-press-escape="false" title="分项工程审批流程详情" :visible.sync="dialogVisible" @close="btnClose" width="70%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="基本信息" name="basicInform">
          <el-container class="basicInform">
            <!-- 左侧 -->
            <div class="basicInform-left">
              <ul class="aside-ul">
                <li class="aside-li">
                  <div class="aside-div-left">流程名称</div>
                  <div class="aside-div-right">
                    <el-tooltip effect="dark" :content="itemData.processName" placement="bottom-start">
                      <span>{{ itemData.processName }}</span>
                    </el-tooltip>
                  </div>
                </li>
                <li class="aside-li">
                  <div class="aside-div-left">分项工程</div>
                  <div class="aside-div-right">
                    <el-tooltip effect="dark" :content="basicInfo.itemName" placement="bottom-start">
                      <span>{{ basicInfo.itemName }}</span>
                    </el-tooltip>
                  </div>
                </li>
                <li class="aside-li">
                  <div class="aside-div-left">所属单位工程</div>
                  <div class="aside-div-right">
                    <el-tooltip effect="dark" :content="basicInfo.unitItemName" placement="bottom-start">
                      <span>{{ basicInfo.unitItemName }}</span>
                    </el-tooltip>
                  </div>
                </li>
                <li class="aside-li">
                  <div class="aside-div-left">所属分部工程</div>
                  <div class="aside-div-right">
                    <el-tooltip effect="dark" :content="basicInfo.partItemName" placement="bottom-start">
                      <span>{{ basicInfo.partItemName }}</span>
                    </el-tooltip>
                  </div>
                </li>
                <li class="aside-li">
                  <div class="aside-div-left">完成状态</div>
                  <div class="aside-div-right">
                    {{ itemData.approveStatus == 2 ? "已完成" : "未完成" }}
                  </div>
                </li>
                <li class="aside-li">
                  <div class="aside-div-left">完成时间</div>
                  <div class="aside-div-right">
                    {{ itemData.finishTime ? itemData.finishTime : "" }}
                  </div>
                </li>
              </ul>
            </div>
            <!-- 右侧 -->
            <el-main class="dialogMain bpmns">
              <div class="process-name">{{ proceName }}</div>
              <div class="canvas" ref="lookCanva" id="lookCanva" v-html="bpmnImg"></div>
            </el-main>
          </el-container>
        </el-tab-pane>
        <el-tab-pane label="审批记录" name="record">
          <div class="tables">
            <el-table height="100%" :data="ApprovalList" border :header-cell-style="{ background: '#f3f3f3' }">
              <el-table-column align="center" label="序号" width="60" type="index" />
              <!-- <el-table-column
                align="center"
                label="流程节点"
                prop="activityName"
              /> -->
              <el-table-column align="center" label="所属工序" prop="processName" />
              <el-table-column align="center" label="负责人" prop="assignee" />
              <el-table-column align="center" label="审批意见" prop="comment" />
              <el-table-column align="center" label="审批时间" prop="startTime" />
              <el-table-column align="center" label="操作" prop="startTime">
                <template slot-scope="{ row }">
                  <el-button size="mini" @click="openNodeDialog(row.taskId, row.comment)">详情</el-button>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="关联资料" name="associatedData">
          <div class="tables">
            <el-table height="100%" :data="linkList" border :header-cell-style="{ background: '#f3f3f3' }">
              <el-table-column align="center" width="60" label="序号" type="index" />
              <!-- <el-table-column
                align="center"
                label="流程节点"
                prop="nodeName"
              /> -->
              <el-table-column align="center" label="所属工序" prop="workflowName" />
              <el-table-column align="center" label="资料类型" prop="bookType">
                <template slot-scope="{ row }">
                  <span v-if="row.bookType == 0">施工技术规范</span>
                  <span v-if="row.bookType == 1">安全规范</span>
                  <span v-if="row.bookType == 2">验收标准</span>
                  <span v-if="row.bookType == 3">工程图纸</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="资料名称" prop="bookName" />
              <el-table-column align="center" label="资料内容" prop="data.content">
                <template slot-scope="{ row }">
                  <span v-if="row.beginPage == row.endPage">资料第{{ row.beginPage }}页</span>
                  <span v-else>资料第{{ row.beginPage }}~{{ row.endPage }}页</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作">
                <template slot-scope="{ row }">
                  <!-- 查看pdf -->
                  <el-button size="mini" @click="lookPdf(row)">查看</el-button>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="关联表格" name="associatedList">
          <el-container>
            <!-- 左侧 -->
            <div class="table-aside-left">
              <div class="tables">
                <el-table :data="linkTableLift" border height="100%" :header-cell-style="{ background: '#f3f3f3' }">
                  <el-table-column align="center" label="流程节点" prop="nodeName" />
                  <el-table-column align="center" label="状态" width="80">
                    <template slot-scope="{ row }">
                      {{ row.nodeTableStatus == 1 ? "已完成" : "未完成" }}
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="表格">
                    <template slot-scope="{ row }">
                      <el-radio-group v-model="tableRadio" size="mini" @change="tabChange(row)">
                        <el-radio-button :label="row.pkId" v-if="row.tableName">
                          {{ row.tableName }}
                        </el-radio-button>
                        <el-radio-button :label="row.pkId" v-else>
                          {{ "按钮" }}
                        </el-radio-button>
                      </el-radio-group>
                    </template>
                  </el-table-column>
                  <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                  </div>
                </el-table>
              </div>
            </div>
            <!-- 右侧 -->
            <el-main class="dialogMain">
              <div class="html-content">
                <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
                  <tr v-for="(item, idx) in tabContent" :key="idx" style="" v-show="item.status">
                    <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                      <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                      <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" v-model="i.name" size="mini"></el-input>
                      <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:
                        <el-avatar shape="square" style="width: 30px;height: 20px;" v-if="i.signatureDate.url"  :src="i.signatureDate.url"></el-avatar>
                      </span>
                      <el-select v-if="i.attributeTypes == 2" size="mini" v-model="i.name" placeholder="请选择">
                        <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                      </el-select>
                    </td>
                  </tr>
                </table>
              </div>
            </el-main>
          </el-container>
        </el-tab-pane>
        <el-tab-pane label="工程量" name="quantities" v-if="itemData.quantitiesTable">
          <div class="tables">
            <el-table height="100%" :data="workAmount" border :header-cell-style="{ background: '#f3f3f3' }">
              <el-table-column align="center" label="序号" width="50" type="index" />
              <el-table-column align="center" label="项目编号" prop="itemCode" />
              <el-table-column align="center" label="项目名称" prop="itemName" />
              <el-table-column align="center" label="设计工程量">
                <template slot-scope="{ row }">
                  <span>{{ row.designQuantities ? row.designQuantities : "" }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="已完成工作量">
                <template slot-scope="{ row }">
                  <span>{{ row.completeQuantities ? row.completeQuantities : "" }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="完成时间" prop="updateTime">
                <template slot-scope="{ row }">
                  <span>{{ itemData.finishTime ? itemData.finishTime : "" }}</span>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="材料用量" name="materialsNum" v-if="itemData.materialUsedTable">
          <div class="tables">
            <el-table height="100%" :data="materials" border :header-cell-style="{ background: '#f3f3f3' }">
              <el-table-column align="center" width="60" label="序号" type="index" />
              <el-table-column align="center" label="物料名称" prop="materialName" />
              <el-table-column align="center" label="物资类别" prop="typeName" />
              <el-table-column align="center" label="扣款方式">
                <template slot-scope="{ row }">
                  <span>定量供应，超额扣款</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="单位" prop="materialUnitName" />
              <el-table-column align="center" label="定量供应量" prop="materiaDesignQuantities" />
              <el-table-column align="center" label="实际使用量" prop="actualUsage" />
              <el-table-column align="center" label="单价" prop="materialPrice" />
              <el-table-column align="center" label="扣款金额" prop="deductionAmout" />
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="附件" name="accessory">
          <div class="tables">
            <el-table :data="accessoryList" height="100%" style="width: 100%" border>
              <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
              <el-table-column label="流程节点" align="center" prop="processName"> </el-table-column>
              <el-table-column label="所属工序" align="center" prop="nodeName"> </el-table-column>
              <el-table-column label="上传人" align="center" prop="createUserName"> </el-table-column>
              <el-table-column label="上传时间" align="center" prop="createTime"> </el-table-column>
              <el-table-column label="附件内容描述" align="center" prop="remark"> </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="{ row }">
                  <el-button size="mini" type="primary" class="previewAcc" @click="preview(row)">
                    预览
                  </el-button>
                  <el-button size="mini" class="downloadAcc" @click="downloadAcc(row)">
                    下载
                  </el-button>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <!-- 节点信息模态框 -->
    <NodeDialog :nodeDialog.sync="nodeDialog" :data="disposeData" :roleDtoName="''" :comment="comment" @cleanData="cleanData" />
    <!-- 预览pdf弹框 -->
    <pdfPiev ref="pdfPiev" :urlr="url" :number="number" />
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.fileUrl" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj.fileUrl" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
import NodeDialog from "@/components/NodeDialog/NodeDialog";
import { CustomViewer } from "@/components/customBpmn";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
export default {
  components: { Pagination, NodeDialog, pdfPiev },
  data() {
    return {
      // 主表格数据
      tableData: [],
      options: [],
      areaOption: [],
      subOption: [],
      // 搜索条件
      inpData: {
        finishStatus: "",
        // itemCode: "",
        itemName: ""
      },
      searchData: {
        // checkResult: -1,
        // finishStatus: 0,
        isWholeCustomOrg: 1,
        isWholeWorkAreaOrg: 1,
        isWholeProject: 1,
        isWholeBid: 1
      },
      // page: { pageNum: 1, pageSize: 10 },
      // total: 0,
      // 模态框
      dialogVisible: false,
      // 搜索栏下拉框
      fkProjectId: "",
      proId: "",
      workAreaIds: [""],
      customerIds: [""],
      // 模态框里当前tab
      activeName: "basicInform",
      // 基本信息
      basicInfo: {},
      // 审批记录表
      ApprovalList: [],
      // 关联资料表
      linkList: [],
      // 关联表格左侧
      linkTableLift: [],
      // 施工评定表
      conEvaList: [],
      // 工程量
      workAmount: [],
      // 材料用量
      materials: [],
      topRadio: 3,
      tableRadio: 1,
      // 节点信息模态框
      nodeDialog: false,
      // 详情信息
      itemData: {},
      tabTitle: "",
      tabContent: "",
      tabData: {}, // 新增的表格数据
      bpmnImg: "",
      proceName: "",
      disposeData: {},
      fkItemId: "",
      comment: "",
      loading: false,
      loading2: false,
      proOptions: [],
      number: 1,
      url: "",
      // 附件列表
      accessoryList: [],
      // 当前点击表单上传的数据
      nowUploadObj: {},
      // 当前预览的表单obj
      nowPreviewObj: {},
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      // 附件文件类型
      fileType: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpg", "image/jpeg", "image/png", "application/pdf"]
    };
  },
  mounted() {
    if (this.user.orgType !== 5) {
      this.getItemListByCustom();
      // this.getQualityAndSecurity();
    } else {
      this.topRadio = 1;
    }
  },
  methods: {
    // 根据条件查询质量与安全管理
    // { ...this.page, ...this.searchData }
    getQualityAndSecurity() {
      this.loading2 = true;
      this.$api
        .searchQualityAndSecurity(this.searchData)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data;
            // this.total = res.data.total - 0;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading2 = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 根据id获取详情
    getOneQualityAndSecurityByItemId(itemId) {
      this.loading = true;
      this.$api
        .getOneQualityAndSecurityByItemId({ itemId })
        .then(res => {
          if (res.code === 200) {
            if (res.data) {
              this.itemData = res.data;
              this.basicInfo = res.data.reItemApproveDtoList[0]; // 基本信息
              this.ApprovalList = res.data.prodTaskFinishList; // 审批记录
              this.linkList = res.data.bookPdfDTOS; // 关联资料
              this.linkTableLift = res.data.tableDTOS; // 关联表格
              this.workAmount = res.data.prodItemList; // 工程量
              this.materials = res.data.materialItemList; // 材料用量
              this.accessoryList = res.data.prodReProcessFileList ? res.data.prodReProcessFileList : []; // 附件列表
              //  流程图
              this.bpmnImg = res.data.hisProcessDiagram;
              this.proceName = res.data.prodWorkflowTemplate.workflowName;
              // this.init("lookCanva"); //创建流程图
              this.$nextTick(() => {
                if (this.linkTableLift && this.linkTableLift.length) {
                  this.tableRadio = this.linkTableLift[0].pkId;
                  this.tabTitle = this.linkTableLift[0].tableName;
                  // this.tabContent = JSON.parse(this.linkTableLift[0].tableHtml);
                  this.tabContent = JSON.parse(this.utils.unzip(this.linkTableLift[0].tableHtml));
                  this.tabData = this.linkTableLift[0].tableColumnData == null ? {} : JSON.parse(this.linkTableLift[0].tableColumnData);
                  // setTimeout(() => {
                  //   this.handleTable();
                  // }, 200);
                }
              });
            }
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 获取项目部
    getItemListByCustom() {
      const api = this.user.orgType == 2 || this.user.orgType == 3 ? this.$api.getAllProjectInfo : this.$api.getItemListByCustom;
      api().then(res => {
        if (res.code === 200) {
          this.options = res.data;
          if (res.data.length) {
            if (this.user.orgType == 2 || this.user.orgType == 3) {
              this.proId = res.data[0].pkId;
              this.allListBidByProId(0, res.data[0].pkId);
            } else {
              this.fkProjectId = res.data[0].pkId;
              this.searchData = {
                ...this.searchData,
                fkProjectId: res.data[0].pkId,
                isWholeBid: 0
              };
              // this.getQualityAndSecurity();
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId) {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data;
          if (res.data.length) {
            this.fkProjectId = res.data[0].fkBidProjectId;
            this.searchData = {
              ...this.searchData,
              isWholeProject: 0,
              isWholeBid: 0,
              fkProjectId: this.fkProjectId
            };
          } else {
            this.fkProjectId = "";
            this.searchData = {
              ...this.searchData,
              isWholeProject: 0,
              isWholeBid: 1,
              fkProjectId: this.proId
            };
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分包单位
    getSubList() {
      this.$api.findCustomByUserId().then(res => {
        if (res.code === 200) {
          this.subOption = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取工区
    getAreaList() {
      this.$api.findWorkAreasByUserId().then(res => {
        if (res.code === 200) {
          this.areaOption = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 项目部下拉框发生改变时的事件
    proChange() {
      this.inpData = {
        finishStatus: "",
        // itemCode: "",
        itemName: ""
      };
      this.searchData = {
        ...this.searchData,
        fkProjectId: this.fkProjectId,
        isWholeBid: 0
      };
    },
    linkProChange(e) {
      this.fkProjectId = "";
      if (e) {
        this.allListBidByProId(0, e);
      }
    },
    // 分包单位
    cusChange() {
      delete this.searchData.isWholeWorkAreaOrg;
      let customerIds = "";
      if (this.customerIds.length) {
        const index = this.customerIds.findIndex(item => item === "");
        if (this.customerIds[this.customerIds.length - 1] === "") {
          this.customerIds = [""];
          this.searchData = {
            ...this.searchData,
            isWholeCustomOrg: 1,
            customerIds
          };
          // customerIds = this.subOption.map((item) => item.pkId).join(",");
        } else {
          if (index !== -1) {
            this.customerIds.splice(index, 1);
          }
          customerIds = this.customerIds.join(",");
          this.searchData = {
            ...this.searchData,
            isWholeCustomOrg: 0,
            customerIds
          };
        }
      }
    },
    // 工区
    areaChange() {
      delete this.searchData.isWholeCustomOrg;
      let workAreaIds = "";
      if (this.workAreaIds.length) {
        const index = this.workAreaIds.findIndex(item => item === "");
        if (this.workAreaIds[this.workAreaIds.length - 1] === "") {
          this.workAreaIds = [""];
          // workAreaIds = this.areaOption.map((item) => item.pkId).join(",");
          this.searchData = {
            ...this.searchData,
            isWholeWorkAreaOrg: 1,
            workAreaIds
          };
        } else {
          if (index !== -1) {
            this.workAreaIds.splice(index, 1);
          }
          workAreaIds = this.workAreaIds.join(",");
          this.searchData = {
            ...this.searchData,
            isWholeWorkAreaOrg: 0,
            workAreaIds
          };
        }
      }
    },
    // 给表单添加样式
    tableRowClassName({ row }) {
      if (!row.workArea) {
        return "father";
      }
      return "";
    },
    // 搜索按钮点击
    // search() {
    //   this.searchData = this.inpData;
    //   if (this.fkProjectId) {
    //     this.searchData = { ...this.searchData, fkProjectId: this.fkProjectId };
    //   }
    //   this.page.pageNum = 1;
    //   this.getQualityAndSecurity();
    // },
    // 打开模态框
    openDialog(fkItemId) {
      this.bpmnImg = "";
      this.getOneQualityAndSecurityByItemId(fkItemId);
      this.dialogVisible = true;
    },
    // 关闭模态框
    btnClose() {
      this.dialogVisible = false;
      this.activeName = "basicInform";
      this.itemData = {};
      this.basicInfo = [];
      this.ApprovalList = [];
      this.linkList = [];
      this.linkTableLift = [];
      this.workAmount = [];
      this.materials = [];
      this.accessoryList = [];
      this.bpmnImg = "";
      this.proceName = "";
      this.tabTitle = "";
      this.tabContent = "";
    },
    // 打开节点信息模态框
    openNodeDialog(taskId, comment) {
      this.lookOver(taskId);
      this.comment = comment;
    },
    // 清除节点信息模态框信息
    cleanData() {
      this.disposeData = {};
      this.comment = "";
    },
    // pageSize改变
    // handleSizeChange(val) {
    //   this.page.pageSize = val;
    //   this.getQualityAndSecurity();
    // },
    // // current改变
    // handleCurrentChange(val) {
    //   this.page.pageNum = val;
    //   this.getQualityAndSecurity();
    // },
    // 查看pdf
    lookPdf(item) {
      this.url = item.bookUrl;
      this.number = item.beginPage;
      this.$refs.pdfPiev.pdfShow = true;
    },
    // 表格管理返回来的表格
    tabChange(data) {
      this.tabTitle = data.tableName;
      // this.tabContent = JSON.parse(data.tableHtml);
      this.tabContent = JSON.parse(this.utils.unzip(data.tableHtml));
      this.tabData = data.tableColumnData == null ? {} : JSON.parse(data.tableColumnData);
      // this.$nextTick(() => {
      //   this.handleTable();
      // });
    },
    // 创建流程图预览的方法
    init(domId) {
      // 获取到属性ref为“canvas”的dom节点
      document.getElementById(domId).innerHTML = "";
      const canva = this.$refs[domId];
      // 新建流程 用dom元素绘画svg ====> canvas
      this.bpmnModeler = new CustomViewer({ container: canva });
      // this.bpmnImg 是xml 后端返回的数据
      this.bpmnModeler.importXML(this.bpmnImg, err => {
        if (err) {
          this.$message.warning("获取流程图失败");
        } else {
          // 这里是成功之后的回调, 可以在这里做一系列事情
          // this.bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
          document.querySelector(".bjs-powered-by").style = "display:none";
        }
      });
    },
    lookOver(taskId) {
      // 查询流程信息
      this.$api
        .getOneQualityAndSecurityByItemIdAndActivityId({
          taskId
        })
        .then(res => {
          if (res.code === 200) {
            this.disposeData = res.data;
            this.nodeDialog = true;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {});
    },
    // 处理表格input selcect
    handleTable() {
      const dom_class = document.getElementsByClassName("html-content")[0];
      const inpAll = dom_class.getElementsByTagName("input");
      const select = dom_class.getElementsByTagName("select");
      const textarea = dom_class.getElementsByTagName("textarea");
      for (let i = 0; i < inpAll.length; i++) {
        inpAll[i].disabled = true;
        // 判断有没没有数据
        if (this.tabData.inpData) {
          inpAll[i].value = this.tabData.inpData[i];
        }
      }
      for (let i = 0; i < textarea.length; i++) {
        textarea[i].disabled = true;
        // 判断有没没有数据
        if (this.tabData.textData) {
          textarea[i].value = this.tabData.textData[i];
        }
      }
      for (let j = 0; j < select.length; j++) {
        select[j].disabled = true;
        if (this.tabData.selData) {
          select[j].options[this.tabData.selData[j]].selected = true;
        }
      }
    },
    // 下载附件
    downloadAcc(row) {
      const url = row.fileUrl;
      const name = row.fileName;
      this.fileLinkToStreamDownload(url, name, "pdf");
    },
    fileLinkToStreamDownload(url, fileName, type) {
      const xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.setRequestHeader("Content-Type", `application/${type}`);
      xhr.responseType = "blob";
      xhr.onload = function() {
        if (this.status == 200) {
          // 接受二进制文件流
          const blob = this.response;
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
    },
    // 预览
    preview(row) {
      const str = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1);
      if (str == "xlsx" || str == "docx") {
        this.previewType = 1;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (str == "pdf") {
        this.previewType = 2;
        this.url = row.fileUrl;
        this.$refs.pdfPiev.pdfShow = true;
      } else {
        this.previewType = 3;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      }
    }
  },
  computed: {
    labelName() {
      if (this.topRadio === 1) return "分包单位";
      if (this.topRadio === 2) return "工区";
      return "标段项目";
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    showList() {
      const { itemName, finishStatus } = this.inpData;
      if (!itemName && !finishStatus) {
        return this.tableData;
      } else {
        const arr = this.tableData.filter(item => item.itemName.indexOf(itemName) !== -1 && String(item.completionStatus).indexOf(finishStatus) !== -1);
        return arr;
      }
    }
  },
  watch: {
    pdfShow(val) {
      if (!val) {
        this.url = "";
      }
    },
    previewDialog(val) {
      if (!val) {
        this.nowPreviewObj = {};
      }
    },
    topRadio(val) {
      if (val === 1) {
        delete this.searchData.workAreaIds;
        delete this.searchData.isWholeWorkAreaOrg;
        this.searchData = { ...this.searchData, isWholeCustomOrg: 1 };
        this.getSubList();
        // this.getQualityAndSecurity();
      } else if (val === 2) {
        delete this.searchData.customerIds;
        delete this.searchData.isWholeCustomOrg;
        this.searchData = { ...this.searchData, isWholeWorkAreaOrg: 1 };
        this.getAreaList();
        // this.getQualityAndSecurity();
      }
    },
    searchData: {
      deep: true,
      handler(val) {
        this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        this.getQualityAndSecurity();
      }
    },
    inpData: {
      deep: true,
      handler(val) {
        this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tables {
  height: 500px;
  .empty {
    margin: 140px 0;
  }
}
.card-header {
  display: flex;
  background-color: #f3f3f3;
  margin-bottom: 14px;
  padding: 4px 0;
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .el-form {
      display: flex;
      .el-select,
      .el-input {
        width: 150px;
      }
      .sa {
        width: 200px;
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
}
.dialogMain {
  position: relative;
  width: 900px;
  height: 500px;
  padding: 0;
  border-right: 1px solid #f3f3f3;
  padding-top: 20px;
  .dialogMain-h1 {
    font-size: 20px;
    text-align: center;
    margin: 5px 0;
  }
  .process-name {
    position: absolute;
    top: 0;
    font-size: 16px;
    font-weight: 700;
    z-index: 2;
  }
  .html-content {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  .html-content:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0px;
    background: transparent;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
.basicInform {
  // height: 500px;
  overflow: auto;
  .basicInform-left {
    width: 320px;
  }
}
.aside-li {
  display: flex;
  margin-bottom: 3px;
  border: 1px solid #f3f3f3;
}
.aside-div-left,
.aside-div-right {
  height: 36px;
  line-height: 36px;
}
.aside-div-left {
  width: 120px;
  text-align: center;
  background-color: #ccc;
}
.aside-div-right {
  flex: 1;
  overflow: hidden; /*超出部分隐藏*/
  white-space: nowrap; /*禁⽌换⾏*/
  text-overflow: ellipsis; /*省略号*/
  margin-left: 5px;
}
.canvas {
  width: 100%;
  height: 100%;
  overflow: auto;
  text-align: center;
}
.table-aside-left {
  width: 400px;
  height: 500px;
  overflow: auto;
  margin-right: 10px;
  .el-radio-group {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 4px;
    .el-radio-button {
      width: 100%;
      /deep/ span {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
/deep/.el-select {
  .el-select__tags-text {
    max-width: 100px;
  }
}
.addAcc {
  cursor: pointer;
  color: green;
  font-size: 20px;
}
.delAcc {
  cursor: pointer;
  color: red;
  font-size: 20px;
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
</style>
