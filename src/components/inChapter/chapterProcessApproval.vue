<template>
  <div>
    <el-dialog title="发起用章流程" top="5vh" :visible="chaptersApprovalDialog" width="70%" @close="closeCheckDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="show-tow" v-if="orgSealState == 1">
          <div class="left">
            <el-form label-position="top" label-width="80px" :model="rowData">
              <el-form-item label="流程名称">
                <el-input v-model="rowData.workflowName" size="mini" disabled></el-input>
              </el-form-item>
              <el-form-item label="负责岗位" v-if="rowData.sealPersonStatus != 1">
                <el-input v-model="rowData.roleName" size="mini" disabled></el-input>
              </el-form-item>
              <el-form-item label="负责人">
                <el-input v-model="rowData.approver" size="mini" disabled></el-input>
              </el-form-item>
              <el-form-item label="审批意见">
                <el-input v-model="approveComment" size="mini" type="textarea" :rows="5"></el-input>
              </el-form-item>

              <el-form-item label="">
                <div style="text-align: center;"><el-link @click="approverSetting" type="primary">查看审批进度</el-link></div>
              </el-form-item>
            </el-form>
            <el-table :data="rowData.engSealFileVoList" height="120px" border style="width: 100%">
              <el-table-column align="center" prop="fileName" label="附件"> </el-table-column>
              <el-table-column align="center" prop="createUserName" label="上传人"> </el-table-column>
            </el-table>
          </div>
          <div class="right" style="position: relative;width:476px;height:733.6px;">
            <!-- <div class="table-title"> -->
            <!-- 需盖章文件 -->
            <el-radio-group v-model="tabPosition" size="mini" @change="tabPositionChange">
              <el-radio-button v-for="item in tableArrAy" :key="item.pkId" :label="item.pkId">
                <el-tooltip class="item" effect="dark" :content="item.tableName" placement="right-start">
                  <span class="check-label">{{ item.tableName }}</span>
                </el-tooltip>
              </el-radio-button>
            </el-radio-group>
            <!-- </div> -->

            <div v-for="items in tableArrAy" :key="items.pkId">
              <div class="table-box" style="width:500px" v-if="items.type == 1">
                <div v-show="items.pkId == tabPosition">
                  <pdf style="border:1px solid #ccc" :page="pageNum" :src="templateUrl" @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf>
                  <!-- <sealEffect  v-for="item in signaturePosition[tableIndex].engSealCustomAreas" :key="item.id"
                v-show="item.page === pageNum" :content="item.userName" :top="item.ycoordinate"
                :left="item.xcoordinate" /> -->
                <el-button icon="el-icon-arrow-left" size="mini" @click="prePage" style="position: absolute;z-index: 10;left:-60px;top: 50%;"></el-button>
                <el-button size="mini"   icon="el-icon-arrow-right" @click="nextPage" style="position: absolute;z-index: 10;top: 50%;right: -60px;"> </el-button>
                </div>
           
                 <span class="pdf-page" style="position: absolute;z-index: 10;left: 46%;bottom: 18px;"> {{ pageNum }}/{{pageTotalNum }}</span>
      
              </div>
              <div class="table-box" v-if="tableArrAy.length && tableStatus">
                <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage" v-if="tableArrAy[tableIndex].type == 2">
                  <tr v-for="(item, idx) in tableArrAy[tableIndex].tableHtml" :key="idx" style="" v-show="item.status">
                    <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                      <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                      <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" v-model="i.name" size="mini" :disabled="tableArrAy[tableIndex].editFlag == 0"></el-input>
                      <span v-if="i.attributeTypes == 3">
                        {{ i.signatureDate.content }}:<img width="80px" crossorigin="anonymous" :src="i.signatureDate.img" alt="" />
                        <!-- <el-avatar shape="square" style="width: 30px;height: 20px;" v-if="i.signatureDate.url" :src="i.signatureDate.url"></el-avatar> -->
                      </span>
                      <!-- :disabled="linkTableLift[rowIndex].editFlag == 0"  :disabled="linkTableLift[rowIndex].editFlag == 0" -->
                      <el-select v-if="i.attributeTypes == 2" size="mini"  :disabled="tableArrAy[tableIndex].editFlag == 0" v-model="i.name" placeholder="请选择">
                        <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                      </el-select>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            <!-- <el-button icon="el-icon-arrow-left" size="mini" @click="prePage"
              style="position: absolute;z-index: 10;left:20px;top: 50%;"></el-button>
            <span class="pdf-page" style="position: absolute;z-index: 10;left: 46%;bottom: 18px;"> {{ pageNum }}/{{
              pageTotalNum }}</span>
            <el-button size="mini" icon="el-icon-arrow-right" @click="nextPage"
              style="position: absolute;z-index: 10;top: 50%;right: 20px;"> </el-button> -->
          </div>
        </div>
        <div class="unnamed" v-else>
          <unnamed :type="orgSealState === 2 ? 2 : 1" @resh="resh" :appendToBody="true"></unnamed>
        </div>
        <!-- <div class="show-tow" v-else>
          <div class="left">
            <div class="seal-box" v-for="(item, idx) in engSealOrgVoList[tableIndex]" :key="item.orgId">
              <div>{{ item.orgName }}盖章组件：</div>
              <div class="stamp" @click="quoteBquote(item, idx)">
                <i class="el-icon-edit"></i>
                <div>点此盖章</div>
              </div>
            </div>
          </div>
          <div class="right" style="position: relative;width:476px;height:673.6px;">
            <div class="table-box" style="width:500px">
              <pdf style="width:100%;border:1px solid #ccc" :page="pageNum" :src="templateUrl"
                @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf>
              <signBox v-for="item in signaturePosition[tableIndex].engSealCustomAreas" :key="item.id"
                v-show="item.page === pageNum" @close="closeSign(item, 2)" @getPosition="getPosition($event, item)"
                :content="item.userName" :top="item.ycoordinate" :left="item.xcoordinate" />
            </div>
            <el-button icon="el-icon-arrow-left" size="mini" @click="prePage"
              style="position: absolute;z-index: 10;left:20px;top: 50%;"></el-button>
            <span class="pdf-page" style="position: absolute;z-index: 10;left: 46%;bottom: 18px;"> {{ pageNum }}/{{
              pageTotalNum }}</span>
            <el-button size="mini" icon="el-icon-arrow-right" @click="nextPage"
              style="position: absolute;z-index: 10;top: 50%;right: 20px;"> </el-button>
            <div @click="setStatus = true" class="box-btn back-btn"></div>
            <div @click="setStatus = true" class="btn-text back-btn-text">返回</div>
          </div>
        </div> -->
      </div>
      <div slot="footer" v-if="orgSealState == 1" style="text-align: center;">
        <el-button type="primary" @click="signerClick" @keyup.space.native.prevent @keyup.prevent @keydown.enter.native.prevent :disabled="loading" v-if="siStatus">签名</el-button>
        <el-button type="primary"  v-if="!siStatus"  @click="start(1)"> {{ rowData.sealPersonStatus == 1 ? "盖章" : "审批通过" }}</el-button>
        <el-button type="danger" @click="start(0)">{{ rowData.sealPersonStatus == 1 ? "驳回" : "审批不通过" }}</el-button>
        <el-button type="primary" plain @click="closeCheckDialog">取消</el-button>
      </div>
    </el-dialog>
    <!-- 设置审批人 -->
    <el-dialog :close-on-press-escape="false" title="设置审批人" width="70%" class="tree-dialog" top="5vh" :visible.sync="approvalShow" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="flow-chart-box">
        <div class=" flow-char-begin">
          <div class="circle">
            <div class="circle-item"></div>
            <div class="circle-icon-bottom">
              <i class="el-icon-arrow-down circle-icon"></i>
            </div>
            <div v-if="approveSum != null" class="circle-icon-right">
              <i class="el-icon-arrow-left icon-right-left"></i>
            </div>
          </div>
          <div class="begin-details">
            <div>{{ rowData.createUserName }}</div>
            <div>{{ rowData.createTime }}</div>
            <div>发起流程</div>
          </div>
        </div>
        <div class="flow-char-item" v-for="(item, index) in rowData.engSealScheduleDetailVos" :key="index">
          <div class="char-item-left" :class="{ 'char-item-pass': item.approveStatus == 2, 'char-item-nopass': item.approveStatus == 1 }">
            <div class="char-item-left-name">
              <img src="../../assets/avg.svg" alt="" />
              <div>{{ item.activityName }}</div>
            </div>
            <div class="down-arrow">
              <i class="el-icon-arrow-down arrow"></i>
            </div>
            <div class="circle-icon-right" v-show="item.approveStatus == 3">
              <i class="el-icon-arrow-left icon-right-left"></i>
            </div>
            <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'right-arrow': item.approveStatus == 3, 'right-arrow2': item.approveStatus == 1 }"></div>
            <div v-show="approveSum > index || approveSum == index" :class="{ 'upper-right': item.approveStatus != 1, 'upper-right2': item.approveStatus == 1 }"></div>
            <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'turn-down': item.approveStatus == 1, 'turn-down2': item.approveStatus == 3 }">{{ item.approveStatus == 1 ? "审批不通过" : "撤回" }}</div>
          </div>
          <div class="char-item-right">
            <div>{{ item.assignee ? item.assignee : "跳过" }}</div>
            <div v-if="item.endTime != null">{{ item.endTime }}</div>
            <div v-if="item.approveStatus == 2">审批通过</div>
            <div v-if="item.approveStatus == 1">审批不通过</div>
          </div>
        </div>
        <div class="flow-char-end">
          <div class="circle">
            <div class="circle-item"></div>
            <div class="end">结束</div>
          </div>
          <div class="begin-details"></div>
        </div>
      </div>
    </el-dialog>
    <el-dialog width="80%" top="5vw" title="合同信息" :visible="signatureDialog" @close="closeSignatureDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="h-10"></div>
        <iframe :src="signatureUrl" height="680px" width="100%" name="demo" scrolling="auto" sandbox="allow-same-origin allow-scripts"></iframe>
      </div>
    </el-dialog>
    <approveCodeDialog ref="approveCodeDialog"  :siStatus="siStatus" @signature="signature" :signed="signed" :approveCodeDialog.sync="approveCodeDialog" :sign-date="signDate" @approveOk="approve" @closeLoading="closeLoading" :biz-type="0" :appCodeType="appCodeType"/>
  </div>
</template>

<script>
import signBox from "./signBox.vue";
import sealEffect from "./sealEffect.vue";
import pdf from "vue-pdf-signature";
import utils from "@/utils/util";
import unnamed from "../../views/org/compoments/unnamed.vue";
import approveCodeDialog from "@/components/approveCodeDialog.vue";
export default {
  components: {
    signBox,
    pdf,
    unnamed,
    approveCodeDialog
  },
  props: {
    chaptersApprovalDialog: {
      type: Boolean,
      default: false
    },
    orgType: {
      type: Number
    },
    fkOrgId: "",
    bizType: "",
    bizId: {
      type: String,
      default: ""
    },
    sealPersonStatus: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loading: false,
      inpData: {
        detectionCode: ""
      },
      checkTypeList: [],
      formLabelAlign: {},
      checkList: [],
      principalList: [
        { name: "张三", value: "1" },
        { name: "李四", value: "2" },
        { name: "王五", value: "3" },
        { name: "刘麻子", value: "4" }
      ],
      checkboxList: [
        { label: "表一", value: "1", id: 1 },
        { label: "表二", value: "2", id: 2 }
      ],
      tabPosition: "",
      setStatus: true,
      signaturePosition: [
        {
          engSealCustomAreas: [],
          tableId: ""
        }
      ], // 签名位置
      rowData: {
        sysUserList: [], //负责人
        startUserFlag: "", //是否流程发起人发起签章 0:否 1:是
        engSealOrgVoList: [], //签章公司
        engSealTableVoList: [], // 签章表格
        engSealFileVoList: []
      },
      templateUrl: "",
      pageNum: 1,
      pageTotalNum: 0,
      tableIndex: 0, //表格索引
      engSealOrgVoList: [], //签章公司
      showNext: false,
      approvalShow: false,
      approvalData: {
        workflowNodeDTOS: []
      },
      // approvalNum: 0,
      approvalStatus: false,
      approveComment: "",
      approveSum: null,
      tableArrAy: [],
      modifiedList: [],
      times: 0,
      timer: null,
      signatureDialog: false,
      signatureUrl: "",
      orgSealState: "",
      siStatus:false,
      approveCodeDialog: false,
      signDate:{},
      tableStatus:true,
      appType:0,
      signed:false,
      appCodeType:0
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  watch: {
    siStatus(val){
      if(val){
        this.signed=false
      }else{
        this.signed=true
      }
    },
    chaptersApprovalDialog(val) {
      if (val) {
        if (this.sealPersonStatus) {
          this.getOrgSealState();
        } else {
          this.orgSealState = 1;
          this.findSealDetail();
        }
      }
    }
  },
  methods: {
    approve(unique){
      this.approves(this.appType,unique)
    },
    checkCode(appType){
      this.appType = appType
      this.$refs.approveCodeDialog.getApproveStatus();
    },
    closeLoading() {
      this.loading = false;
    },
    signerClick() {
      this.$refs.approveCodeDialog.getApproveStatus(true);
    },
    signature(res) {

      this.tableArrAy.forEach(item => {
        if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
          item.isModified ="0"
          item.tableHtml.forEach(e => {
            e.arr.forEach(i => {
              if (i.attributeTypes == 3) {
                console.log(i.signatureDate.signer)
                
                if (i.signatureDate.signer == this.rowData.roleId || i.signatureDate.signer == this.rowData.sysRoleId) {
                  i.signatureDate.img = res.data.url;
                  console.log("ddddddddddddd")
                  console.log(i.signatureDate.signer)
                  console.log(res.data.roleId)
                  console.log(res.data.sysRoleId)
                  console.log("ddddddddddddd")
                  
                  this.tableStatus = false;
                  this.tableStatus = true;
                  this.siStatus = false;
                  item.isModified ="1"
                }
              }
            });
          });
          
        }
      });

    },
    // 
    closeSignatureDialog() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.times == 3) {
          clearInterval(this.timer);
          this.times = 0;
        }
        this.$emit("init");
        this.times++;
      }, 5000);
      this.signatureDialog = false;
      this.closeCheckDialog();
    },
    approvalSet() {
      this.approvalShow = false;
    },
    approvalCancel() {
      this.approvalShow = false;
      this.approvalStatus = false;
      this.getWorkflowSealApprover();
    },
    selectedUserIdChange() {
      this.approvalStatus = true;
    },
    approverSetting() {
      this.approvalShow = true;
    },
    getWorkflowSealApprover() {
      this.$api.getWorkflowSealApprover().then(res => {
        if (res.code == 200) {
          this.approvalData = res.data;
          // this.approvalShow = true
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 关闭弹窗
    closeCheckDialog() {
      this.siStatus = false;
      this.$emit("update:chaptersApprovalDialog", false);
    },
    // 设置按钮
    settingUp() {
      this.setStatus = false;
    },
    // 上一页
    prePage() {
      let page = this.pageNum;
      page = page > 1 ? page - 1 : this.pageTotalNum;
      if (page == this.pageTotalNum) {
        return;
      }
      this.pageNum = page;
    },
    // 下一页
    nextPage() {
      let page = this.pageNum;
      page = page < this.pageTotalNum ? page + 1 : 1;
      console;
      if (page == 1) {
        return;
      }
      this.pageNum = page;
    },
    // 获取PDF总页数
    getNumPages(url) {
      const loadingTask = pdf.createLoadingTask(url);
      loadingTask.promise
        .then(pdf => {
          this.pageTotalNum = pdf.numPages;
        })
        .catch(err => {
          this.$message.warning("pdf 加载失败", err);
        });
    },
    // tab切换
    tabPositionChange(val) {
      this.tableArrAy.forEach((item, idx) => {
        if (item.pkId == val) {
          this.tableIndex = idx;
          this.pageNum = 1;
          if (item.type == 1) {
            this.templateUrl = item.tableUrl;
            this.getNumPages(this.templateUrl);
          }
        }
      });
      console.log(this.tableArrAy[this.tableIndex]);
    },
    // 盖章
    quoteBquote(item, idx) {
      if (item.disabled == true) {
        return;
      }
      this.engSealOrgVoList[this.tableIndex][idx].disabled = true;
      this.signaturePosition[this.tableIndex].engSealCustomAreas.push({ ...item, tableId: this.tabPosition, id: Date.now(), isNail: 0, page: this.pageNum, ycoordinate: 0, xcoordinate: 0 });
    },
    // 清除盖章
    closeSign(row, type) {
      if (type === 1) {
        this.testList = this.testList.filter(item => item.id !== row.id);
      } else {
        this.signaturePosition[this.tableIndex].engSealCustomAreas = this.signaturePosition[this.tableIndex].engSealCustomAreas.filter(item => item.id !== row.id);
        this.engSealOrgVoList[this.tableIndex].forEach(item => {
          if (item.orgId == row.orgId) {
            item.disabled = false;
          }
        });
      }
    },
    // 获取盖章位置坐标
    getPosition(position, row) {
      row.xcoordinate = position.x;
      row.ycoordinate = position.y;
    },
    // 查询签章表格信息
    findSealDetail() {
      this.loading = true;
      this.$api
        .findSealDetail({ pkId: this.bizId })
        .then(res => {
          if (res.code == 200) {
            // this.getWorkflowSealApprover();
            this.rowData = res.data;
            // if (this.rowData.sysUserList) {
            //   this.showNext = true
            // } else {
            //   this.showNext = false
            // }
            // 默认展示第一个表格
            this.tabPosition = res.data.engSealTableVoList[0].tableId;
            this.templateUrl = res.data.engSealTableVoList[0].tableUrl;
            // res.data.engSealOrgVoList.forEach(item => {
            //   item.disabled = false
            // })
            this.signaturePosition = [];
            (this.tableArrAy = []),
              console.log("====================***************=======================")
              console.log(res.data.engSealTableVoList)
              console.log("====================***************=======================")
              res.data.engSealTableVoList.forEach(item => {
                item.pkId = item.tableId;
                item.type = 1;
                this.tableArrAy.push(item);
                this.signaturePosition.push({
                  tableId: item.tableId,
                  engSealCustomAreas: []
                });
                // engSealFileVoList
                // let arr = JSON.stringify(res.data.engSealOrgVoList)
                // this.engSealOrgVoList.push(JSON.parse(arr))
              });
            if (res.data.workflowTableList != null && res.data.workflowTableList.length != 0) {
              let arr1 = JSON.stringify(res.data.workflowTableList);
              this.modifiedList = JSON.parse(arr1);
              this.modifiedList.forEach(item => {
                item.tableHtml = utils.unzip(item.tableHtml);
              });
              res.data.workflowTableList.forEach(item => {
                item.type = 2;
                item.tableHtml = utils.unzip(item.tableHtml);
                if (item.tableHtml instanceof Array) {
                } else {
                  item.tableHtml = JSON.parse(item.tableHtml);
                }
                this.tableArrAy.push(item);
                //       tableData.forEach(item => {
                //   item.tableHtml = JSON.stringify(item.tableHtml);
                //   item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
                // });
              });
            }
            console.log("====================***************=======================");
            console.log(this.tableArrAy);
            console.log("====================***************=======================");
            this.getNumPages(this.templateUrl);
            this.signDate = {
              fkBizId: res.data.fkBizId,
              fkNodeId: res.data.currentNodeId,
              fkTemplateId: res.data.fkTemplateId
            };
            this.getApproveStatus(res.data.sysRoleId,res.data.roleId)
            this.loading = false;
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
        // this.siStatus = true;
    },
    getApproveStatus(sysRoleId,roleId){
      this.$api.getApproveStatus().then(res => {
        this.appCodeType = res.data
          if (res.data==2||res.data == 3) {
            this.modifiedList.forEach(item => {
              if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
                item.tableHtml.forEach(e => {
                  e.arr.forEach(i => {
                    if (i.attributeTypes == 3) {
                        if (sysRoleId == i.signatureDate.signer) {
                          this.siStatus = true;
                        }
                        if (roleId == i.signatureDate.signer) {
                          this.siStatus = true;
                        }
                    }
                  });
                });
              }
            });
          }
        });
    },

    resh() {
      this.getOrgSealState();
    },
    getOrgSealState(val) {
      let api = this.user.orgType === 0 ? this.$api.getOrgSealState : this.$api.getOrgSealState2;
      api().then(res => {
        if (res.code === 200) {
          this.orgSealState = res.data;
          if (res.data == 1) {
            this.findSealDetail();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 发起用章
    start(val,unique) {
      // owData.sealPersonStatus == 1
      let title  ="";
      let center = "";
      if(val == 1){
        title = this.rowData.sealPersonStatus == 1?"确认盖章":"确定审批";
        center = this.rowData.sealPersonStatus == 1?"盖章提醒":"审批提醒";
      }else{
        title = this.rowData.sealPersonStatus == 1?"确认驳回":"确定审批";
        center = this.rowData.sealPersonStatus == 1?"驳回提醒":"审批提醒";
      }
      this.$confirm(title+"?", center, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        if(this.rowData.sealPersonStatus == 1&&val){
          this.approves(1)
        }else{
          this.checkCode(val)
        }
      });
    },
    approves(val,unique){
      let data = {
          approveStatus: val,
          approveComment: this.approveComment,
          pkId: this.rowData.sealPkId
          // tableDTOS: this.rowData.tableDTOS
        };
        if(unique){
          data.unique = unique
        }
        console.log("**************************************");
        console.log(this.tableArrAy);
        console.log("**************************************");
        let workflowTableList = [];
        this.tableArrAy.forEach(item => {
          if (item.type == 2) {
            item.tableHtml = utils.zip(JSON.stringify(item.tableHtml));
            workflowTableList.push(item);
          }
        });
        workflowTableList.forEach((item, idx) => {
          delete item.type;
          if (item.tableHtml == this.modifiedList[idx].tableHtml) {
            item.isModified = 0;
          } else {
            item.isModified = 1;
          }
        });
        data.workflowTableList = workflowTableList;
        // return console.log(data)
        this.$api.approvalSealProcess(data).then(res => {
          if (res.code == 200) {
            if (res.data != null && res.data != "") {
              // window.open(res.data)
              this.signatureUrl = res.data;
              this.signatureDialog = true;
            } else {
              this.$message.success("操作成功");
              this.closeCheckDialog();
              this.$emit("init");
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-form-item__label {
  padding: 0;
}
.unnamed {
  height: 600px;
}
.show-tow {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  border: 1px solid;

  .left {
    width: 210px;
    padding: 0 12px;
    border-right: 1px solid;

    /deep/ .el-form-item {
      margin: 0;
    }

    .seal-box {
      margin-top: 10px;

      .stamp {
        width: 100px;
        padding: 20px;
        text-align: center;
        /* height: 10px; */
        background: #f3f3f3;
      }
    }
  }

  .right {
    position: relative;
    //width: 500px;
    height: 705px;
    width: 100% !important;
    overflow: hidden;

    .table-title {
      width: 100%;
      text-align: center;
      // border-bottom: 1px solid !important;
    }

    .table-box {
      position: relative;
      margin: 0 auto;
      height: 100%;
      //width: 500px;
      // background: #f3f3f3;
    }

    .box-btn {
      position: absolute;
      top: 29px;
      right: 0;
      border-style: solid;
      border-width: 50px 50px 50px 50px;
      border-color: #409eff #409eff rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);
      width: 0px;
      height: 0px;
    }

    .back-btn {
      top: 0px;
      border-color: #ccc #ccc rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);
    }

    .box-btn:hover {
      cursor: pointer;
    }

    .btn-text {
      position: absolute;
      top: 48px;
      right: 16px;
      color: #fff;
    }

    .btn-text:hover {
      cursor: pointer;
    }

    .back-btn-text {
      top: 22px;
    }
  }
}

// .approver-edit {
//   height: 500px;
//   overflow: auto;
//   padding: 20px;

//   .begin-box {
//     text-align: center;

//     .begin {
//       display: inline-block;
//       width: 120px;
//       text-align: center;

//       .circle {
//         width: 30px;
//         height: 30px;
//         border: 1px solid;
//         border-radius: 15px;
//         display: inline-block;
//         vertical-align: middle;
//       }
//     }

//     .begin-text {
//       display: inline-block;
//       margin-left: 20px;
//       line-height: 30px;
//     }
//   }

//   .node-box {
//     text-align: center;

//     .node {
//       border: 1px solid;
//       width: 120px;
//       height: 60px;
//       line-height: 60px;
//       display: inline-block;
//       border-radius: 6px;
//       position: relative;

//       .node-icon {
//         font-size: 20px;
//         position: absolute;
//         top: -20px;
//         left: 43%;
//       }
//     }
//   }
// }

// .ml-20 {
//   margin-left: 20px
// }
.flow-chart-box {
  width: 400px;
  margin: 0 auto;
  height: 550px;
  overflow: auto;

  .flow-char-begin {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .circle {
      width: 90px;
      line-height: 60px;
      text-align: center;
      vertical-align: middle;
      text-align: center;
      position: relative;

      .circle-item {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        border: 1px solid;
        vertical-align: middle;
        display: inline-block;
      }

      .circle-icon-bottom {
        width: 1px;
        height: 40px;
        border-right: 1px solid #70b603;
        position: absolute;
        left: 49%;
        bottom: -34px;

        .circle-icon {
          color: #70b603;
          position: absolute;
          bottom: -9px;
          left: -7px;
        }
      }

      .circle-icon-right {
        position: absolute;
        width: 50px;
        border-top: 1px solid;
        top: 27px;
        left: 73%;

        .icon-right-left {
          position: absolute;
          bottom: -7px;
          left: -5px;
        }
      }
    }

    .begin-details {
      width: 120px;
      height: 60px;
      text-align: center;
      border: 1px dashed;
      font-size: 11px;
    }
  }

  .flow-char-item {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .char-item-left {
      width: 90px;
      // line-height: 60px;
      text-align: center;
      border: 1px solid;
      vertical-align: middle;
      position: relative;
      border-radius: 5px;

      .char-item-left-name {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60px;
      }

      .down-arrow {
        width: 1px;
        height: 40px;
        border-right: 1px dashed;
        position: absolute;
        left: 49%;

        .arrow {
          position: absolute;
          bottom: -6px;
          left: -7px;
        }
      }
      .circle-icon-right {
        position: absolute;
        width: 25px;
        border-top: 1px solid;
        top: 27px;
        right: -27px;
        .icon-right-left {
          position: absolute;
          bottom: -7px;
          left: -5px;
        }
      }
      .right-arrow {
        position: absolute;
        width: 70px;
        border-top: 1px solid;
        top: 78px;
        left: 50%;
      }

      .upper-right {
        position: absolute;
        height: 52px;
        border-right: 1px solid;
        left: 114px;
        bottom: -19px;
      }

      .right-arrow2 {
        position: absolute;
        width: 25px;
        border-top: 1px solid;
        top: 35px;
        left: 89px;
      }

      .upper-right2 {
        position: absolute;
        height: 114px;
        border-right: 1px solid;
        left: 114px;
        bottom: 24px;
      }

      .turn-down {
        position: absolute;
        background: #ffff;
        left: 110px;
        top: -77px;
      }
      .turn-down2 {
        position: absolute;
        background: #ffff;
        left: 110px;
        top: 52%;
      }
    }

    .char-item-pass {
      background: #dafba9;
      border-color: #dafba9;

      .down-arrow {
        border-right: 1px solid #70b603;

        .arrow {
          color: #70b603;
        }
      }
    }

    .char-item-nopass {
      background: #f2a6af;
      border-color: #f2a6af;
    }

    .char-item-right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 60px;
      // text-align: center;
      border: 1px dashed;
      // line-height: 60px;
      font-size: 12px;
    }
  }
  .flow-char-end {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .circle {
      width: 90px;
      line-height: 60px;
      text-align: center;
      vertical-align: middle;
      text-align: center;
      position: relative;

      .circle-item {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        border: 1px solid;
        vertical-align: middle;
        display: inline-block;
        background-color: #000;
      }

      .circle-icon-bottom {
        width: 1px;
        height: 40px;
        border-right: 1px solid #70b603;
        position: absolute;
        left: 49%;
        bottom: -34px;

        .circle-icon {
          color: #70b603;
          position: absolute;
          bottom: -9px;
          left: -7px;
        }
      }

      .circle-icon-right {
        position: absolute;
        width: 50px;
        border-top: 1px solid;
        top: 27px;
        left: 73%;

        .icon-right-left {
          position: absolute;
          bottom: -7px;
          left: -5px;
        }
      }
    }
    .end {
      position: absolute;
      top: 0;
      right: -15px;
    }
    .begin-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 60px;
      // text-align: center;
      // border: 1px dashed;
      font-size: 11px;
    }
  }
}

.check-label {
  display: inline-block;
  width: 149px;
  overflow: hidden;
  vertical-align: bottom;
  text-overflow: ellipsis;
}
.h-10 {
  height: 10px;
}
</style>
