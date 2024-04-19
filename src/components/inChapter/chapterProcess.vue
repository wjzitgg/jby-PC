<template>
  <div>
    <el-dialog :title="UseSealTitle" top="8vh" :visible="chapterDialog" width="70%" @close="closeCheckDialog" v-dialogDrag
      :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="show-tow" v-if="step == 0">
          <div class="left">
            <el-form label-position="top" label-width="80px" :model="rowData">
              <el-form-item label="流程名称">
                <el-input v-model="rowData.workflowName" size="mini" disabled></el-input>
              </el-form-item>
              <el-form-item label="需盖章表单" >
                <el-checkbox-group v-model="checkList" style="max-height: 200px;overflow: auto;" v-if="rowData.startUserFlag == '1'">
                  <el-checkbox v-for="item in rowData.engSealTableVoList" :key="item.keys" :label="item.keys">
                    <el-tooltip class="item" effect="dark" :content="item.tableName" placement="right-start">
                      <span class="check-label">{{ item.tableName }}</span>
                    </el-tooltip>
                    <span style="color: #66b1ff;" @click.stop="lookOver(item)">查看</span>
                  </el-checkbox>

                </el-checkbox-group>
                <div v-else>
                  <div v-for="item in rowData.engSealTableVoList" :key="item.keys">{{item.tableName}} <span style="color: #66b1ff;" @click.stop="lookOver(item)">查看</span></div>
                </div>
              </el-form-item>
            </el-form>
            <div class="left-table">
              <div class="left-table-title">业务附件</div>
              <el-table ref="tables" :data="rowData.engSealFileVoList" height="160px">
                <el-table-column label="附件" prop="fileName" align="center">
                  <template slot-scope="{ row }">
                    <el-link type="primary" @click="fileNameClick(row)">{{ row.fileName }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column label="上传人" prop="createUserName" align="center"> </el-table-column>
                <div slot="empty" class="empty" style="width: 100%;padding: 5px;">
                  <img src="@/assets/empty.svg" height="50px" class="zanwu" />
                  <span>暂无数据</span>
                </div>
              </el-table>
            </div>
          </div>
          <div class="right" style="position: relative;width:476px;height:673.6px;">
            <div class="table-title">
              <el-radio-group v-model="approvalTable" size="mini" @change="approvalTableChange">
                <el-radio-button v-for="(item, index) in rowData.workflowTableList" :key="index" :label="index">{{
                  item.tableName }}</el-radio-button>
              </el-radio-group>
            </div>
            <div class="">
              <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="pdfTable" id="pdfDom"
                v-if="approvalTable.length != 0">
                <tr v-for="(item, idx) in rowData.workflowTableList[approvalTable].tableHtml" :key="idx" style=""
                  v-show="item.status">
                  <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr"
                    :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                    <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                    <span v-if="i.attributeTypes == 1 && i.checkout == 1">{{ i.name }}</span>
                    <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:<img width="100px" crossorigin="anonymous" :src="i.signatureDate.img" alt="" /></span>
                    <span v-if="i.attributeTypes == 2">{{ i.name }}</span>
                  </td>
                </tr>
              </table>
            </div>
            <!-- <el-button icon="el-icon-arrow-left" size="mini" @click="prePage"
              style="position: absolute;z-index: 10;left:20px;top: 50%;"></el-button>
            <span class="pdf-page" style="position: absolute;z-index: 10;left: 46%;bottom: 18px;"> {{ pageNum }}/{{
              pageTotalNum }}</span>
            <el-button size="mini" icon="el-icon-arrow-right" @click="nextPage"
              style="position: absolute;z-index: 10;top: 50%;right: 20px;"> </el-button> -->
            <!-- <div v-if="rowData.startUserFlag == '1'" @click="settingUp" class="box-btn"></div> -->
            <!-- <div v-if="rowData.startUserFlag == '1'" @click="settingUp" class="btn-text">设置</div> -->
          </div>
        </div>
        <div class="show-tow" v-if="step == 1 && setStatus">
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
            <div class="table-title">
              <el-radio-group v-model="tabPosition" size="mini" @change="tabPositionChange">
                <el-radio-button v-for="item in stampTableList" :key="item.keys" :label="item.keys">{{
                  item.tableName }}</el-radio-button>
              </el-radio-group>
            </div>
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
            <!-- <div @click="setStatus = true" class="box-btn back-btn"></div> -->
            <!-- <div @click="setStatus = true" class="btn-text back-btn-text">返回</div> -->
          </div>
        </div>
        <div v-if="step == 2">
          <div class="approver-edit">
            <div class="begin-box">
              <div class="begin">
                <div class="circle"></div>
              </div>
              <div class="begin-text wh-100" style="">审批人员</div>
            </div>
            <div class="node-box">
              <div v-for="(item, index) in approvalData.workflowNodeDTOS" :key="index" v-show="item.nodeType == 2"
                style="margin-top:20px">
                <div class="node">
                  <i class="el-icon-user-solid"></i>
                  {{ item.nodeName }}
                  <i class="el-icon-bottom node-icon"></i>
                </div>
                <el-select @change="selectedUserIdChange" :clearable="item.prodSysRoleVo.sysUserList.length != 0" :disabled="item.prodSysRoleVo.sysUserList.length == 0" v-model="item.prodSysRoleVo.selectedUserId" size="mini"
                  class="wh-100 ml-20" v-if="item.nodeType == 2">
                  <el-option v-for="items in item.prodSysRoleVo.sysUserList" :key="items.pkId" :label="items.userName"
                    :value="items.pkId"></el-option>
                  <el-option style="background-color: red;" v-if="item.prodSysRoleVo.sysUserList.length == 0"
                    label="未找到匹配人员" value=""></el-option>
                </el-select>
              </div>

            </div>
            <div class="begin-box finish-box">
              <div class="begin finish">
                <div class="circle"></div>
                <div class="finish-text">结束</div>
                <i class="el-icon-bottom finish-icon"></i>
              </div>
              <div class="begin-text wh-100"></div>
            </div>
            <!-- <div class="explain">
              说明：如果企业设置了不可跳过节点，点击设置时，有未选择人员的节点或未找到匹配人员的节点，都提示“XXX（节点名称）未配置人员”，盖章节点不可在发起时设置人员，用章流程至少有一个非盖章节点有人。
            </div> -->
          </div>
        </div>
      </div>
      <div slot="footer" v-loading="loading" style="text-align: center;">
        <!-- <el-button type="primary" @click="start(1)">发起用章</el-button> -->
        <el-button type="success" @click="start(0)" v-if="step == 0">不用盖章</el-button>
        <el-button type="primary" @click="lastStep" v-if="step != 0"> 上一步 </el-button>
        <el-button type="primary" @click="nexStep" v-if="step != 2">下一步 </el-button>
        <el-button type="primary" @click="start(1)" v-if="step == 2">发起用章</el-button>
        <el-button type="primary" plain @click="closeCheckDialog" v-if="step == 0">取消</el-button>
      </div>

    </el-dialog>
    <!-- 设置审批人 -->
    <el-dialog :close-on-press-escape="false" title="设置审批人" width="70%" class="tree-dialog" top="5vh"
      :visible.sync="approvalShow" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="approver-edit">
        <div class="begin-box">
          <div class="begin">
            <div class="circle"></div>
          </div>
          <div class="begin-text wh-100" style="">审批人员</div>
        </div>
        <div class="node-box">
          <div v-for="(item, index) in approvalData.workflowNodeDTOS" :key="index" v-show="item.nodeType == 2"
            style="margin-top:20px">
            <div class="node">
              <i class="el-icon-user-solid"></i>
              {{ item.nodeName }}
              <i class="el-icon-bottom node-icon"></i>
            </div>
            <el-select @change="selectedUserIdChange" v-model="item.prodSysRoleVo.selectedUserId" size="mini"
              class="wh-100 ml-20" v-if="item.nodeType == 2">
              <el-option v-for="items in item.prodSysRoleVo.sysUserList" :key="items.pkId" :label="items.userName"
                :value="items.pkId"></el-option>
              <el-option style="background-color: red;" v-if="item.prodSysRoleVo.sysUserList.length == 0" label="未找到匹配人员"
                value=""></el-option>
            </el-select>
          </div>

        </div>
        <div class="begin-box finish-box">
          <div class="begin finish">
            <div class="circle"></div>
            <div class="finish-text">结束</div>
            <i class="el-icon-bottom finish-icon"></i>
          </div>
          <div class="begin-text wh-100"></div>
        </div>
        <div class="explain">
          说明：如果企业设置了不可跳过节点，点击设置时，有未选择人员的节点或未找到匹配人员的节点，都提示“XXX（节点名称）未配置人员”，盖章节点不可在发起时设置人员，用章流程至少有一个非盖章节点有人。
        </div>
      </div>
      <div slot="footer">
        <el-button size="mini" type="primary" @click="approvalSet">设置</el-button>
        <el-button size="mini" @click="approvalCancel">取 消</el-button>
      </div>
    </el-dialog>

    <pdfPiev ref="pdfPiev" :urlr="url" />
    <div style="position: absolute; left: -99999999px" v-if="chapterDialog">
      <!-- <div v-for="(nape, itemIndex) in pdfTable" :key="itemIndex"> -->
      <table style="border-collapse: collapse; overflow: auto; margin: 0 auto" ref="pdfTable" v-for="(items, index) in pdfTable" :key="index" :id="'pdfDom' + index">
        <tr v-for="(item, idx) in items" :key="idx" style="" v-show="item.status">
          <td style="box-sizing: content-box; border: none; margin: 0; padding: 0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
            <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
            <span v-if="i.attributeTypes == 1 && i.checkout == 1">{{ i.name }}</span>
            <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:<img width="100px"  crossorigin="anonymous" :src="i.signatureDate.img" alt="" /></span>
            <span v-if="i.attributeTypes == 2">{{ i.name }}</span>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import signBox from "./signBox.vue";
import sealEffect from "./sealEffect.vue";
// import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import pdfPiev from "../pdf-preview/pdf-preview.vue"
import pdf from "vue-pdf-signature";
import utils from "@/utils/util";
import { uploadObjectPdf } from "@/utils/uploadPdf";
import htmlToPdfUpload from "@/utils/htmlToPdfUpload";
export default {
  components: {
    signBox,
    pdf,
    sealEffect,
    pdfPiev
  },
  props: {
    chapterDialog: {
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
        workflowTableList: []//
      },
      templateUrl: "",
      pageNum: 1,
      pageTotalNum: 0,
      tableIndex: 0,//表格索引
      engSealOrgVoList: [], //签章公司
      showNext: false,
      approvalShow: false,
      approvalData: {
        workflowNodeDTOS: []
      },
      // approvalNum: 0,
      approvalStatus: false,
      url: "",
      UseSealTitle: "",
      step: 0,
      approvalTable: "",
      stampTableList: [],
      modifiedList: [],
      pdfTable:[],
      pdfTitle:[],
      toType:false,
    };
  },
  mounted() {
    this.step = 0
    this.UseSealTitle = "发起用章流程 - 第一步：填写信息"
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  watch: {
    chapterDialog(val) {
      if (val) {
        this.step = 0
        this.findSealDetail();

      }
    },
    step(val) {
      if (val == 0) {
        this.UseSealTitle = "发起用章流程 - 第一步：填写信息"
      }
      if (val == 1) {
        this.UseSealTitle = "发起用章流程 - 第二步：确定盖章位置"
      }
      if (val == 2) {
        this.UseSealTitle = "发起用章流程 - 第三步：设置审批人"
      }
    },
  },
  methods: {
    toPdf(){
      if(this.toType){
        this.handFlow()
      }else{
        this.loading =true
        let arrs = this.rowData.engSealTableVoList.filter(item=>item.tableId==0)
        if(arrs.length&&this.rowData.engSealTableVoList.length==1){
          this.loading =false
          this.handFlow()
          return
        }
        this.pdfTable.forEach((item, idx) => {
          console.log(idx);
          if(this.rowData.engSealTableVoList[idx].tableId==0){

          }else{
            htmlToPdfUpload
              .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
              .then(res => {
                const _this = this;
                uploadObjectPdf(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                  this.rowData.engSealTableVoList[idx].tableUrl = url;
                  if(this.pdfTable.length - 1 ==idx){
                    this.toType=true
                    this.loading =false
                    this.handFlow()
                  }
                });
              })
          }
            });
      }
    },
    approvalTableChange(val) {
      this.approvalTable = ""
      this.approvalTable = val
    },
    nexStep() {
      if(this.rowData.startUserFlag != 1){
        if(this.step==2&&!this.approvalStatus){
          return this.$message.warning("请至少设置一个审批人")
        }
        this.step = this.step + 2
      }else{
        if (this.step == 0 && this.checkList.length == 0) {
          return this.$message.warning("请至少给一个表格设置签署区")
        }
        if (this.step == 0) {
        // 
        this.toPdf()
      }
      if(this.step==2&&!this.approvalStatus){
        return this.$message.warning("请至少设置一个审批人")
      }
      this.step = this.step + 1
      }
    },
    handFlow(){
      this.stampTableList = []
        this.rowData.engSealTableVoList.forEach(items => {
          this.checkList.forEach(item => {
            let ids = item.split(',')
            if (items.tableId == ids[0]&&items.nodeId == ids[1]) {
              this.stampTableList.push(items)
            }
          })
        })
        console.log("*********************************")
        console.log(this.stampTableList)
        console.log("*********************************")
        this.stampTableList[0].tableUrl = this.stampTableList[0].tableUrl == null ? "https://epms-1307524156.cos.ap-guangzhou.myqcloud.com/202303161611526412cf48848e9021d5b974b5.pdf" : this.stampTableList[0].tableUrl
        this.tabPosition = this.stampTableList[0].tableId + ',' + this.stampTableList[0].nodeId
        this.templateUrl = this.stampTableList[0].tableUrl
        this.getNumPages(this.templateUrl);
    },
    lastStep() {
      if(this.rowData.startUserFlag != 1){
        this.step = this.step - 2
      }else{
        this.step = this.step - 1
      }
    },
    lookOver(row) {
      this.url = row.tableUrl;
      this.$refs.pdfPiev.pdfShow = true;
    },
    fileNameClick(row) {
      // console.log(row)
      window.open(row.fileUrl)
    },
    approvalSet() {
      let arr=this.approvalData.workflowNodeDTOS
      for(let i =0;i<arr.length;i++){
        if(arr[i].nodeType == 2){
          if(arr[i].prodSysRoleVo&&!!arr[i].prodSysRoleVo.selectedUserId){
            this.approvalStatus = true
            this.approvalShow = false;
            return
          }else{
            this.approvalStatus = false
            this.approvalShow = false;
          }
        }
      }
    },
    approvalCancel() {
      this.approvalShow = false;
      this.approvalStatus = false
      this.getWorkflowSealApprover()
    },
    selectedUserIdChange() {
      this.approvalStatus = true
    },
    approverSetting() {
      this.approvalShow = true
    },
    getWorkflowSealApprover() {
      this.$api.getWorkflowSealApprover().then(res => {
        if (res.code == 200) {
          if(!res.data){
            this.approvalData= {
              workflowNodeDTOS: [
                {
                  prodSysRoleVo: {
                    sysUserList: []
                  }
                }
              ]
            }
            return
          }
          res.data.workflowNodeDTOS.forEach((item,index) => {
            if (item.nodeType == 2) {
              item.prodSysRoleVo = item.prodSysRoleVo == null ? { selectedUserId: "", sysUserList: [] } : item.prodSysRoleVo;
              if(res.data.launchType==2&&index==1){
                  let arr = item.prodSysRoleVo.sysUserList.filter(item=>item.pkId==this.user.pkId)
                  item.prodSysRoleVo.selectedUserId =arr.length? this.user.pkId:item.prodSysRoleVo.selectedUserId
                }else{
                  item.prodSysRoleVo.selectedUserId = item.prodSysRoleVo.selectedUserId == null ? "" : item.prodSysRoleVo.selectedUserId;
                }
            }
          });
          this.approvalData = res.data
          // this.approvalShow = true
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    // 关闭弹窗
    closeCheckDialog() {
      this.$emit("update:chapterDialog", false);
      this.toType=false
    },
    // 设置按钮
    // settingUp() {
    //   this.setStatus = false;
    // },
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

      console.log(val)
      this.tableIndex = val
      this.setStatus = false
      this.setStatus = true
      let ids = val.split(",")
      this.rowData.engSealTableVoList.forEach((item, idx) => {
        if (item.tableId == ids[0]&&item.nodeId==ids[1]) {
          this.pageNum = 1;
          this.templateUrl = item.tableUrl;
          this.tableIndex = idx
          this.templateUrl = this.templateUrl == null ? "https://epms-1307524156.cos.ap-guangzhou.myqcloud.com/202303161611526412cf48848e9021d5b974b5.pdf" : this.templateUrl
          this.getNumPages(this.templateUrl);
        }
      });

    },
    // 盖章
    quoteBquote(item, idx) {
      // if (item.disabled == true) {
      //   return;
      // }
      let ids = this.tabPosition.split(",")
      this.engSealOrgVoList[this.tableIndex][idx].disabled = true
      this.signaturePosition[this.tableIndex].engSealCustomAreas.push({ ...item, tableId:ids[0],nodeId:ids[1] , id: Date.now(), isNail: 0, page: this.pageNum, ycoordinate: 0, xcoordinate: 0 });
        
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
      this.loading = true
      this.pdfTable = []
      this.checkList = []
      this.$api.initiateSealProcessBefore({ bizId: this.bizId, bizType: this.bizType }).then(res => {
        if (res.code == 200) {
          this.getWorkflowSealApprover();
          this.rowData = res.data;
          this.rowData.engSealTableVoList = res.data.engSealTableVoList.map(item=>({...item,keys:item.tableId +',' +item.nodeId}))
          if (this.rowData.workflowTableList == undefined || this.rowData.workflowTableList == null || this.rowData.workflowTableList.length == 0) {
            this.rowData.workflowTableList = []
          } else {
            let arr1 = JSON.stringify(this.rowData.workflowTableList)
            this.modifiedList = JSON.parse(arr1)
            this.modifiedList.forEach(item => {
              item.tableHtml = utils.unzip(item.tableHtml);
            })
            this.rowData.workflowTableList.forEach((item, idx) => {
              let items = utils.unzip(item.tableHtml);
              if (items instanceof Array) {
                item.tableHtml = items
              } else {
                item.tableHtml = JSON.parse(items)
              }
            });
            this.approvalTable = 0
          }
          console.log("----------------------------------------")
          console.log(this.rowData)
          console.log('-------------------------------------------')
          if (this.rowData.sysUserList) {
            this.showNext = true
          } else {
            this.showNext = false
          }
          // 默认展示第一个表格
          // this.tabPosition = res.data.engSealTableVoList[0].tableId;
          // this.templateUrl = res.data.engSealTableVoList[0].tableUrl;
          res.data.engSealOrgVoList.forEach(item => {
            item.disabled = false
          })
          this.signaturePosition = []
          this.rowData.engSealTableVoList.forEach(item => {
            this.signaturePosition.push({
              tableId: item.tableId,
              nodeId:item.nodeId,
              engSealCustomAreas: [],
              pdfUrl:""
            })
            let arr = JSON.stringify(res.data.engSealOrgVoList)
            this.engSealOrgVoList.push(JSON.parse(arr))
            const items =item.tableId=='0'?[]: utils.unzip(item.tableHtml);
            if (items instanceof Array) {
              this.pdfTable.push(items);
            } else {
              this.pdfTable.push(JSON.parse(items));
            }
            this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
          })
          console.log('表格',this.pdfTable);
          this.loading = false
          // console.log("===================================")
          // console.log(this.signaturePosition)
          // console.log("===================================")
          // this.getNumPages(this.templateUrl);
        } else {
          this.loading = false
          this.$message.warning(res.msg);
        }
      }).catch(err => {
        console.error(err);
        this.loading = false
      })
    },
    // 发起用章
    start(val) {
      let data = {
        // approveId: this.inpData.roleId, //审批人id
        bizType: this.bizType, //业务类型
        fkBizId: this.bizId, //业务ID
        // startUserFlag: this.rowData.startUserFlag, //是否发起人 0:否 1:是
        needSealStatus: val
      };
      if(this.rowData.startUserFlag == 1){
        data.engSealTables = []; //签名表格
        data.engSealTables = this.signaturePosition
        console.log(data.engSealTables);
        data.engSealTables.forEach((item,idx) => {
          item.engSealCustomAreas.forEach(items => {
            items.xcoordinate = items.xcoordinate / 0.8 + 50;
            items.ycoordinate = (673.6 - items.ycoordinate) / 0.8 - 50
          })
          item.pdfUrl=this.rowData.engSealTableVoList[idx].tableUrl
        })
       let arr1 =[]
       data.engSealTables.forEach(item=>{
        if(item.engSealCustomAreas.length != 0){
          item.engSealCustomAreas.forEach(e=>{
            arr1.push(e)
          })
        }
       })
       data.engSealTables.forEach(item=>{
        item.engSealCustomAreas = []
        arr1.forEach(e=>{
          if(e.tableId == item.tableId&&e.nodeId == item.nodeId){
            item.engSealCustomAreas.push(e)
          }
        })
       })
      // data.engSealTables = data.engSealTables.filter(item=>this.checkList.includes(item.tableId) )
       let tabArrs=[]
       data.engSealTables.forEach(item=>{
        this.checkList.forEach(item2=>{
          let ids = item2.split(",")
          if(item.tableId==ids[0]&&item.nodeId==ids[1]){
            tabArrs.push(item)
          }
        })
       })
       data.engSealTables = tabArrs
       
       let workflowTableList = []
      this.rowData.workflowTableList.forEach((item,index) => {
        item.tableHtml = JSON.stringify(item.tableHtml)
        if(this.modifiedList[index].tableHtml ==item.tableHtml){
            item.isModified = 0
          }else{
            item.isModified = 1
          }   
        workflowTableList.push({
          fkTableId: item.fkTableId,
          isModified:item.isModified,
          tableHtml: utils.zip(item.tableHtml)
        })
      })
       data.workflowTableList = workflowTableList
      }
      let prodWorkflowUserAdds = []
      this.approvalData.workflowNodeDTOS.forEach(item => {
        if (item.nodeType == 2) {
          prodWorkflowUserAdds.push({
            bizType: 4,
            currentNodeId: item.pkId,
            fkRoleId: item.fkRoleId,
            fkApproverId: item.prodSysRoleVo.selectedUserId
          })
        }
      })
      if(this.approvalData.launchType==2&&!prodWorkflowUserAdds[0].fkApproverId){
          return this.$message("首个节点必须有人")
        }
      prodWorkflowUserAdds.forEach((item, index) => {
        item.sortval = index + 1
      })
      data.prodWorkflowUserAdds = prodWorkflowUserAdds
      // let status = false
      // this.checkList.forEach(item => {
      //   this.signaturePosition.forEach((e, idx) => {
      //     if (item == e.tableId && e.engSealCustomAreas.length == 0) {
      //       return status = true
      //     }
      //   })
      // })
       console.log(data.engSealTables);
      if (data.prodWorkflowUserAdds.length == 0 && val == 1) {
        return this.$message.warning("未选择审批人")
      }
      if (val == 0) {
        delete data.prodWorkflowUserAdds
        delete data.engSealTables
      }
      // if (this.checkList.length == 0 && this.rowData.startUserFlag == 1 && val == 1) {
      //   return this.$message.warning("请至少给一个表格设置签署区")
      // }
      // let status = false
      // if (val == 1) {
      //   data.engSealTables.forEach(item => {
      //     this.checkList.forEach(e => {
      //       if (e == item.tableId && item.engSealCustomAreas.length == 0) {
      //         status = true
      //       }
      //     })
      //   })
      // }

      // if (status) {
      //   return this.$message.warning("需盖章表格未盖章")
      // }
      // console.log(data)
      // console.log("===============")
      // return console.log(this.checkList)
      this.loading = true
      this.$api.initiateSealProcess(data).then(res => {
        if (res.code == 200) {
          this.loading = false
          this.$message.success(res.msg);
          this.closeCheckDialog();
          this.$emit('init')
        } else {
          console.log("xxxxxxxxxxxxxxxxx")
          this.loading = false
          console.log(this.loading)

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

.show-tow {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  border: 1px solid;

  .left {
    width: 210px;
    padding: 0 12px;
    border-right: 1px solid;
    position: relative;

    .left-table {
      position: absolute;
      height: 200px;
      width: 100%;

      .left-table-title {
        line-height: 40px;
        text-indent: 1em;
        background: #f6f6f6;
      }

      // width: 198px;
      overflow: hidden;
      bottom: 0;
      left: 0;
    }

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
      border-bottom: 1px solid !important;
    }

    .table-box {
      position: relative;
      margin: 0 auto;
      height: 100%;
      //width: 500px;
      background: #f3f3f3;
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

.approver-edit {
  height: 500px;
  overflow: auto;
  padding: 20px;
  position: relative;

  .begin-box {
    text-align: center;

    .begin {
      display: inline-block;
      width: 120px;
      text-align: center;

      .circle {
        width: 30px;
        height: 30px;
        border: 1px solid;
        border-radius: 15px;
        display: inline-block;
        vertical-align: middle;
      }
    }

    .begin-text {
      display: inline-block;
      margin-left: 20px;
      line-height: 30px;
    }
  }

  .node-box {
    text-align: center;

    .node {
      border: 1px solid;
      width: 120px;
      height: 60px;
      line-height: 60px;
      display: inline-block;
      border-radius: 6px;
      position: relative;

      .node-icon {
        font-size: 20px;
        position: absolute;
        top: -20px;
        left: 43%;
      }
    }
  }

  .finish-box {
    margin-top: 20px;

    .finish {
      position: relative;

      .circle {
        background-color: #606266;
      }

      .finish-text {
        position: absolute;
        right: 0px;
        top: 18%;
      }

      .finish-icon {
        position: absolute;
        left: 42%;
        top: -20px;
        font-size: 20px;
      }
    }
  }

  .explain {
    position: absolute;
    left: 50px;
    top: 20%;
    width: 200px;
    color: red;
  }
}

.ml-20 {
  margin-left: 20px
}

.check-label {
  display: inline-block;
  width: 130px;
  overflow: hidden;
  vertical-align: bottom;
  text-overflow: ellipsis;
}
</style>
