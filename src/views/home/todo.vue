<template>
  <div class="app-container" v-loading="loading">
    <!-- <el-radio-group v-model="radio" size="mini">
      <el-radio-button :label="1">待办事项</el-radio-button>
      <el-radio-button :label="2">已办事项</el-radio-button>
    </el-radio-group> -->
    <div class="topTabs">
      <el-tabs v-model="radio">
        <el-tab-pane label="待办事项" name="1"></el-tab-pane>
        <el-tab-pane label="已办事项" name="2"></el-tab-pane>
      </el-tabs>
      <el-button class="anomalyBtn" size="mini" type="primary" @click="openAnomaly" v-if="user.isMaster === 1">异常待办调整</el-button>
    </div>
    <!-- 表格 -->
    <div class="table-data" style="height:83%">
      <el-table border height="100%" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }" stripe :tooltip-effect="'light'">
        <el-table-column align="center" label="序号" type="index" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标题">
          <template slot-scope="{ row }">
            <div style="display:flex;align-item:center">
            <img src="../../assets/todo.svg" alt="" class="titleIcon" v-if="radio == 1" />
            <img src="../../assets/done.svg" alt="" class="titleIcon" v-else />
            <div :class="{ blueTitle: radio == 2 && row.matterType != 18 }" class="ellipsistwo" @click="radio == 2 && row.matterType != 18? checkDone(row, 1) : ''" :title="row.title">{{ row.title }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="时间" prop="createTime" v-if="radio == 1" width="200" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="待办时间" prop="createTime" v-if="radio == 2" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="处理时间" prop="processingTime" v-if="radio == 2" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="处理结果" prop="processingResult" v-if="radio == 2" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ row.processingResult == 1 ? "审批不通过" : row.processingResult == 2 ? "审批通过" : "" }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="处理意见" prop="processingOpinion" v-if="radio == 2" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="操作" width="200">
          <template slot-scope="{ row }">
            <el-button size="mini" plain type="primary" v-if="radio == 1" @click="approve(row)">{{[6,9,17].includes(row.matterType)?'接收':row.matterType==18?'授权':'审批'}}</el-button>
            <el-button size="mini" plain v-if="radio == 2 && [1, 2, 3, 4, 7, 8].includes(row.matterType)" @click="checkDone(row, 2)">查看</el-button>
            <el-button size="mini" plain v-if="radio == 2 && ![1, 2, 3, 4, 7, 8].includes(row.matterType)" @click="checkDone(row, 1)">查看</el-button>
            <!-- <el-button size="mini" type="primary" @click="approve(row)" v-if="row.matterType === 5">签章</el-button>
          <el-button size="mini" type="primary" @click="approve(row)" v-if="row.matterType === 6">接收</el-button>
          <el-button size="mini" type="primary" @click="approve(row)" v-if="row.matterType === 7">审批</el-button> -->
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    <!-- 结算管理审批弹框 -->
    <MyDialog :signData="disposeData" :dialogVisible.sync="dialogVisible" :settlementObject="0" :dialogType="isCheck ? (isSign?8:4) : 5" :orgType="user.orgType" :pkId="pkId" @updateList="updateList" @closeLoading="closeLoading" />
    <subDialog :signData="disposeData" :dialogVisible.sync="subDialogVisible" :settlementObject="1" :dialogType="isCheck ? (isSign?8:4) : 5" :orgType="user.orgType" :pkId="pkId" @updateList="updateList" @closeLoading="closeLoading" />
    <NodeDialog :nodeDialog.sync="disposeDialog" :show="true" :data="disposeData" :roleDtoName="roleDtoName" :principal="disposeMan" :parentId="pkIdItem" @cableck="updateList" @cleanData="cleanData" v-if="!isCheck" />
    <NodeDialog2 :nodeDialog.sync="disposeDialog" :show="false" :data="disposeData" :roleDtoName="roleDtoName" :principal="disposeMan" :parentId="pkIdItem" @cableck="updateList" @cleanData="cleanData" v-if="isCheck" />
    <approvalDialog :appDiaType="isCheck ? (isSign?5:1) : 2" :showData="designAppData" :approvalTitle="'变更设计审核详情'" :approvalDialog="approvalDialog" @close="approvalDialogClose" @getList="updateList"></approvalDialog>
    <approveManageementDialog ref="approveManageementDialog" :signData="disposeData" @closeLoading="closeLoading" :appDialog.sync="appDialog" :appDialogTitle="isCheck ? (isSign?'查看节点信息':'查看盘点单') :'审批盘点单'" :appDialogType="isCheck ? (isSign?5:1) : 3" @getList="updateList"></approveManageementDialog>
    <chapterProcess :chaptersApprovalDialog.sync="chaptersApprovalDialog" :bizType="3" :bizId="bizId" @init="updateList" :sealPersonStatus="sealPersonStatus" v-if="!isCheck"></chapterProcess>
    <chapterProcess2 :chaptersApprovalDialog.sync="chaptersApprovalDialog" :not-now="true" :not-now-data="disposeData" :bizId="bizId" v-if="isCheck"></chapterProcess2>
    <settingNode :dialogVisible2.sync="dialogVisible2" :getData="disposeData" v-if="[2,3].includes(nodeType)"></settingNode>
    <changeNode :dialogVisible2.sync="dialogVisible2" :getData="designAppData" v-if="nodeType==4"></changeNode>
    <suppliesNode :dialogVisible2.sync="dialogVisible2" :getData="disposeData" v-if="nodeType==7"></suppliesNode>
    <el-dialog :title="renewalTitle" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form" style="padding-bottom: 8px;">
        <el-form-item label="用户名称" prop="accountName" :label-width="formLabelWidth">
          <el-input v-model="rowDataForm.accountName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="telephone" :label-width="formLabelWidth">
          <el-input v-model="rowDataForm.telephone" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号类型" prop="loginName" :label-width="formLabelWidth">
          <el-input v-model="rowDataForm.orgTypeName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="续租至" prop="time" :label-width="formLabelWidth">
          <el-date-picker value-format="yyyy-MM-dd" style="width: 100%" disabled v-model="rowDataForm.renewalDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="续租凭证" prop="certificate" :label-width="formLabelWidth">
          <picture-upload :apiName="'getUploadFileToken'" disabled :fileList="rowDataForm.proofUrl" :showUpload="false" uploadTip="”uploadTip“" :limit="2"></picture-upload>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" :label-width="formLabelWidth">
          <el-input v-model="rowDataForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期' || isCheck" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="renewalTitle != '续期' && !isCheck">
        <el-button size="mini" type="primary" @click="auditPass('rowDataForm', 1)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="auditPass('rowDataForm', 2)">审批不通过</el-button>
        <el-button size="mini" @click="show2 = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 短信签名详情 -->
    <el-dialog :title="signatureTitle" :visible.sync="signatureShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form">
        <el-form-item label="企业名称" prop="orgName" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.orgName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="managerMobile" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.adminName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号类型" prop="managerMobile" :label-width="formLabelWidth">
          <el-input v-model="orgType[signatureForm.orgType]" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="短信签名" prop="signName" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.signName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用途" prop="reason" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.reason" type="textarea" style="resize: none" :rows="3" maxlength="100" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="附件" prop="remark" :label-width="formLabelWidth">
          <div v-for="(item, index) in signatureForm.enclosures" :key="index">
            {{ item.enclosureName }}
          </div>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期' || !!signatureForm.enableStatus || isCheck" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="signatureForm.type == 1 && !isCheck">
        <el-button size="mini" type="primary" @click="signatureApproval(2)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="signatureApproval(3)">审批不通过</el-button>
        <el-button size="mini" @click="signatureShow = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 短信赠送充值详情 -->
    <el-dialog :title="topUpTitle" :visible.sync="topUpShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form" style="padding-bottom: 8px;">
        <el-form-item label="企业名称" prop="orgName" :label-width="formLabelWidth">
          {{ topUpForm.orgName }}
        </el-form-item>
        <el-form-item label="管理员手机号码" prop="managerMobile" :label-width="formLabelWidth">
          {{ topUpForm.managerMobile }}
        </el-form-item>
        <el-form-item label="剩余短信" :label-width="formLabelWidth"> <span>赠送</span>{{ topUpForm.residueGiveNum }}<span>+充值</span>{{ topUpForm.residueRechargeNum }}<span>条</span> </el-form-item>
        <el-form-item label="申请人" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input v-model="topUpForm.userName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="赠送短信" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input v-model="topUpForm.num" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="赠送原因" prop="reason" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input v-model="signatureForm.reason" type="textarea" style="resize: none" :rows="3" maxlength="100" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值金额" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input v-model="topUpForm.amount" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值短信" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input v-model="topUpForm.num" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值方式" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input v-model="topUpForm.paymentCode" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值证明" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <div v-for="(item, index) in topUpForm.enclosures" :key="index">
            {{ item.enclosureName }}
          </div>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" :label-width="formLabelWidth" v-if="(signatureForm.type == 1 && topUpForm.approvalStatus === 0) || topUpForm.approvalStatus !== 0 || isCheck">
          <el-input v-model="topUpForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期' || topUpForm.approvalStatus !== 0 || isCheck" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="signatureForm.type == 1 && !isCheck">
        <el-button size="mini" type="primary" @click="topUpApprove(1)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="topUpApprove(2)">审批不通过</el-button>
        <el-button size="mini" @click="topUpShow = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 签章弹框 -->
    <el-dialog width="80%" top="5vw" title="合同信息" :visible="signatureDialog" @close="closeSignatureDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="h-10"></div>
        <iframe :src="signatureUrl" height="680px" width="100%" name="demo" scrolling="auto" sandbox="allow-same-origin allow-scripts"></iframe>
      </div>
    </el-dialog>
    <!-- 异常待办弹框 -->
    <el-dialog title="异常待办调整" width="65%" :visible="anomalyShow" @close="closeAnomaly" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="header">
          <div class="search">
            <div class="search-item">
              <span class="labels">事项名称</span>
              <el-input size="mini" class="wh-140" maxlength="50" v-model="anomalyInp.titleLike"></el-input>
            </div>
            <div class="search-item">
              <span class="labels">负责人</span>
              <el-input size="mini" class="wh-140" maxlength="25" v-model="anomalyInp.userName"></el-input>
            </div>
            <div class="search-item">
              <span class="labels">待办日期</span>
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="anomalyInp.beginTime" @change="beginChange"></el-date-picker>
              <span>至</span>
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="anomalyInp.endTime" :picker-options="searchOptionsEnd"></el-date-picker>
            </div>
            <el-button size="mini" type="primary" class="ml-20" icon="el-icon-search" @click="anomalySearchbtn">查询</el-button>
          </div>
        </div>
        <div class="tables table-data">
          <el-table style="width: 100%" height="100%" :data="anomalyTable" ref="tables" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
            <el-table-column label="序号" align="center" width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (anomalyPage.pageNum - 1) * anomalyPage.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="事项名称" align="center" prop="title"> </el-table-column>
            <el-table-column label="负责岗位" align="center" prop="roleName" v-if="user.orgType" show-overflow-tooltip> </el-table-column>
            <el-table-column label="负责人" align="center" prop="fkUserName" v-if="user.orgType" show-overflow-tooltip> </el-table-column>
            <el-table-column label="申请人" align="center" prop="applyName" v-if="!user.orgType" show-overflow-tooltip> </el-table-column>
            <el-table-column label="负责人" align="center" prop="fkUserName" v-if="!user.orgType" show-overflow-tooltip> </el-table-column>
            <el-table-column label="待办时间" align="center" prop="createTime" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="{ row }">
                <el-button size="mini" plain @click="openPeoDialog(row)">调整负责人</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <tablePaging :pageSize="anomalyPage.pageSize" :total="anomalyTotal" :currentPage="anomalyPage.pageNum" @handleSizeChange="anomalySizeChange" @handleCurrentChange="anomalyCurrentChange" v-if="anomalyShow"></tablePaging>
      </div>
    </el-dialog>
    <el-dialog title="调整负责人" width="30%" :visible="peoDialog" @close="closePeoDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form class="dialog-form" style="padding-bottom: 8px;" label-width="100px">
        <el-form-item label="事项名称:">
          <el-input v-model="peoForm.title" disabled autocomplete="off" size="mini"></el-input>
        </el-form-item>
        <el-form-item label="当前负责岗位:" v-show="[1,2,3,4,7,8].includes(peoForm.matterType)">
          <el-input v-model="peoForm.roleName" disabled autocomplete="off" size="mini"></el-input>
        </el-form-item>
        <el-form-item label="当前负责人:">
          <el-input v-model="peoForm.fkUserName" disabled autocomplete="off" size="mini"></el-input>
        </el-form-item>
        <el-form-item label="调整新负责人">
          <el-select v-model="peoForm.fkUserId" size="mini" style="width:100%">
            <el-option v-for="item in peoOptons" :key="item.pkId" :label="item.userName+(!!item.empowerTime?'【授权过期】':'')" :value="item.pkId" :disabled="!!item.empowerTime" :class="{red:!!item.empowerTime}"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button size="mini" type="primary" @click="peoDialogOk">确认</el-button>
        <el-button size="mini" @click="closePeoDialog">取 消</el-button>
      </div>
    </el-dialog>
    <proCheckDialog :data="disposeData" :proChangeDialog.sync="proChangeDialog" :appDiaType="nodeType==1?1:5"/>
    <checkDisclosure ref="checkDisclosure" :disclosureDialog.sync="disclosureDialog" @closeLoading="closeLoading" />
    <!-- 文章信息 -->
    <el-dialog title="查看文章" width="60%" top="2vw" :visible="infoDialog" @close="closeInfoDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="infoDialog">
        <div class="infoDialog-head">
          <h2>{{ infoDialogForm.articleTitle }}</h2>
          <div class="sendInfo">
            <span class="mr-20">发布人:{{ infoDialogForm.userName }}</span>
            <span>发布时间:{{ infoDialogForm.sendingTime }}</span>
          </div>
        </div>
        <el-divider></el-divider>
        <div style="margin-top: 10px;">会议简介</div>
        <myEditorJustLook :pro-html="infoDialogForm.articleContent"></myEditorJustLook>
      </div>
    </el-dialog>
    <!-- 变成二维码弹框 -->
    <el-dialog top="10vh" class="qr-title" width="30%" :visible="authenticationShwo" :title="qrcodeTitle"
      :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading" :show-close="false">
      <div class="close-qrcode">
        <el-button icon="el-icon-close" style="border: none;" @click="closeProgram"></el-button>
      </div>
      <p class="hint-tit">请使用系统APP或者微信扫一扫</p>
      <p>{{ hint }}</p>
      <!-- <div v-if="refreshCode"><el-button @click="refreshClick">刷新二维码</el-button></div> -->
      <div ref="qrCode" id="qrCode">
        <div class="codeTime" title="刷新二维码" v-if="refreshCode">
          <i :class="haha ? 'el-icon-refresh-left' : 'el-icon-loading'" @click="refreshClick"></i>
        </div>
        <div class="codeOk" v-if="codeOk">
          <i class="el-icon-circle-check iconColor mb-20"></i>
          <div class="mb-60">扫描成功</div>
          <div>请在手机上根据提示操作</div>
          <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import pagination from "@/components/tablePaging.vue";
import MyDialog from "../settlement/components/MyDialog.vue";
import subDialog from "../settlement/components/subDialog.vue";
import NodeDialog from "@/components/NodeDialog/NodeDialog.vue";
import NodeDialog2 from "@/components/NodeDialog/NodeDialog2.vue";
import approvalDialog from "../design/component/approvalDialog.vue";
import approveManageementDialog from "../supplies/components/approveManageementDialog.vue";
import chapterProcess from "@/components/inChapter/chapterProcessApproval.vue";
import chapterProcess2 from "@/components/inChapter/chapterProcessApproval2.vue";
import pictureUpload from "@/components/pictureUpload";
import proCheckDialog from "./compoments/proCheckDialog";
import checkDisclosure from "./compoments/checkDisclosure";
import settingNode from "../settlement/components/nodeDetail.vue";
import changeNode from '../design/component/nodeDetail.vue';
import suppliesNode from '../supplies/components/nodeDetail.vue';
import QRCode from "qrcodejs2";
import myEditorJustLook from "@/components/myEditor/myEditorJustLook.vue";
export default {
  components: { pagination, MyDialog, NodeDialog, NodeDialog2, approvalDialog, subDialog, approveManageementDialog, chapterProcess, chapterProcess2, pictureUpload, proCheckDialog, checkDisclosure, settingNode,changeNode,suppliesNode,myEditorJustLook },
  data() {
    return {
      tableData: [],
      radio: "1",
      page: {
        pageNum: 1,
        pageSize: 10
      },
      loading: false,
      total: 0,
      dialogVisible: false,
      pkId: "",
      disposeMan: [],
      disposeDialog: false,
      roleDtoName: "",
      pkIdItem: "",
      disposeData: {},
      designAppData: {},
      approvalDialog: false,
      signatureDialog: false,
      signatureUrl: "",
      subDialogVisible: false,
      appDialog: false,
      rowDataForm: {},
      formLabelWidth: "110px",
      gadgetDialog: false,
      gadgetUrl: "",
      chaptersApprovalDialog: false,
      bizId: "",
      show2: false,
      renewalTitle: "",
      loading: false,
      fkRenewalId: "",
      signatureShow: false,
      signatureTitle: "",
      signatureForm: {
        orgName: "", // 企业名称
        managerMobile: "", // 管理员账号
        signName: "", // 短信签名
        reason: "", // 用途
        enclosures: [
          // {
          //   enclosureName:"附件名称",
          //   enclosureUrl:"附件路径"
          // }
        ],
        type: 0,
        remark: "",
        pkId: ""
      },
      topUpShow: false,
      topUpTitle: "",
      topUpForm: {
        remark: ""
      },
      orgType: {
        0: "系统运营商",
        1: "系统代理商",
        2: "建设单位(业主方)",
        3: "监理公司",
        4: "施工单位",
        5: "项目部",
        6: "供应商",
        7: "分包单位",
        8: "劳务工人",
        9: "设计院"
      },
      anomalyShow: false,
      anomalyInp: {
        beginTime: "",
        endTime: "",
        titleLike: "",
        userName: ""
      },
      anomalySearch: {
        beginTime: "",
        endTime: "",
        titleLike: "",
        userName: ""
      },
      anomalyTable: [],
      anomalyPage: {
        pageNum: 1,
        pageSize: 10
      },
      anomalyTotal: 0,
      searchOptionsEnd: {
        disabledDate: time => {
          if (this.anomalyInp.beginTime) {
            let d;
            if (typeof this.anomalyInp.beginTime == "string") {
              d = new Date(this.anomalyInp.beginTime).getTime();
            } else {
              d = this.anomalyInp.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      peoDialog: false,
      peoForm: {},
      peoOptons: [],
      proChangeDialog: false,
      isCheck: false,
      infoDialog: false,
      infoDialogForm: {},
      disclosureDialog: false,
      dialogVisible2: false,
      isSign:false,
      nodeType:"",
      sealPersonStatus:0,
      authenticationUrl: "",
      authenticationShwo: false,
      refreshData: {},
      refreshCode: false,
      codeOk: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      userFaceDistinguishId: "",
      qrcodeTitle: "实名验证",
      hint: "完成企业或个人实名认证",
      haha:false,
      countdownTime:"",
      stopTime:0
    };
  },
  created() {
    this.getList();
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.timer);
    clearInterval(this.codeTimer);
  },
  methods: {
    refreshClick() {
      this.haha = false;
      const dom = this.$refs.qrCode;
      dom.removeChild(dom.childNodes[3]);
      dom.removeChild(dom.childNodes[3]);
      this.codeOk = false;
      this.$api.authorization().then(res => {
        if (res.code == 200) {
          this.authenticationUrl = res.data.faceSwipingUrl;
          this.userFaceDistinguishId = res.data.userFaceDistinguishId;
          this.hint = "完成账号的授权认证";
          this.authenticationShwo = true;
          this.countdownTime = res.data.countdownTime;
          this.getQrcode();
          this.timerTask();
          this.refreshCode = false;
          this.haha = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
     closeProgram() {
        clearInterval(this.timer);
        clearInterval(this.codeTimer);
        this.qrcodeTitle = ""
        this.authenticationShwo = false
        this.loading2 = false;
    },
    //   获取待办事项
    getToDoList() {
      const promise = this.radio == 1 ? this.$api.searchBacklogPageList : this.$api.searchDoneItemsPageList;

      promise(this.page).then(res => {
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
    //   获取待办事项
    getToDoList2() {
      const promise = this.radio == 1 ? this.$api.searchNoAdminBacklogPageList : this.$api.searchNoAdminDoneItemsPageList;

      promise(this.page).then(res => {
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
    getList() {
      if (this.user.orgType != 0) {
        this.getToDoList2();
      } else {
        this.getToDoList();
      }
    },
    //   审批按钮
    approve(item) {
      this.loading = true;
      this.isCheck = false;
      // 事项类型matterType（1：施工验收流程待办，2：业主计量流程待办，3：分包计价流程待办，4：变更设计流程待办 5:会议签到 6：技术交底 7:盘点流程待办 8:申请用章流程待办,9:收发文待办,10:商务用户续费,11:付费用户续费,12:短信签名申请,13:短信赠送及充值申请,14:合同签署，15：工资结算：16：工资发放 ,17:收发文指定人员待办）
      if (item.matterType === 1) {
        this.lookOver(item.fkBusinessId);
      } else if (item.matterType === 2) {
        this.pkId = item.fkBusinessId;
        this.dialogVisible = true;
      } else if (item.matterType === 3) {
        this.pkId = item.fkBusinessId;
        this.subDialogVisible = true;
      } else if (item.matterType === 4) {
        this.getDesignDetail(item.fkBusinessId);
      } else if (item.matterType === 6) {
        this.$confirm("确定接收该交底？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$api.updateEnableStatusAndMatter({ pkId: item.pkId }).then(res => {
              this.closeLoading();
              if (res.code === 200) {
                this.getList();
                this.$message.success("接收成功");
              } else {
                this.$message.warning(res.msg);
              }
            });
          })
          .catch(err => {
            this.loading = false;
          });
      } else if (item.matterType === 7) {
        this.$refs.approveManageementDialog.findOrderInventoryById(item.fkBusinessId,2);
      } else if (item.matterType === 8) {
        this.sealPersonStatus=item.sealPersonStatus
        this.bizId = item.fkBusinessId;
        this.chaptersApprovalDialog = true;
        this.loading = false;
      } else if (item.matterType === 9) {
        this.$confirm("确定接收该发文？", "接收确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$api.acceptArticle({ pkId: item.pkId }).then(res => {
              this.closeLoading();
              if (res.code === 200) {
                this.getList();
                this.$message.success("接收成功");
              } else {
                this.$message.warning(res.msg);
              }
            });
          })
          .catch(err => {
            this.loading = false;
          });
      } else if (item.matterType === 10) {
        this.fkRenewalId = item.fkBusinessId;
        this.show2 = true;
        this.renewalTitle = "商务用户-续期";
        this.findRenewalByPkId(item);
        this.loading = false;
      } else if (item.matterType === 11) {
        this.fkRenewalId = item.fkBusinessId;
        this.renewalTitle = "付费用户-续期";
        this.show2 = true;
        this.findRenewalByPkId(item);
        this.loading = false;
      } else if (item.matterType === 12) {
        this.signature(item);
        this.loading = false;
      } else if (item.matterType === 13) {
        this.topUp(item);
        this.loading = false;
      } else if (item.matterType === 14) {
        this.rescindById(item);
        this.loading = false;
      } else if (item.matterType === 17) {
        this.$confirm("确定接收该发文？", "接收确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$api.acceptArticleAppoint({ pkId: item.pkId }).then(res => {
              this.closeLoading();
              if (res.code === 200) {
                this.getList();
                this.$message.success("接收成功");
              } else {
                this.$message.warning(res.msg);
              }
            });
          })
          .catch(err => {
            this.loading = false;
          });
      }else if(item.matterType === 18){
        if (this.orgType == 0) {
          this.$api.operationAuthorization().then(res => {
            this.loading = false;
            if (res.code == 200) {
              this.authenticationUrl = res.data.faceSwipingUrl;
              this.userFaceDistinguishId = res.data.userFaceDistinguishId;
              this.hint = "完成账号的授权认证";
              this.qrcodeTitle = "授权代办"
              this.authenticationShwo = true;
              this.countdownTime = res.data.countdownTime;
              this.getQrcode();
              this.timerTask();
              this.refreshCode = false;
              this.haha = true;
            } else {
              this.$message.warning(res.msg);
            }
          });
        } else {
          this.$api.authorization().then(res => {
            this.loading = false;
            if (res.code == 200) {
              this.authenticationUrl = res.data.faceSwipingUrl;
              this.userFaceDistinguishId = res.data.userFaceDistinguishId;
              this.qrcodeTitle = "授权代办"
              this.hint = "完成账号的授权认证";
              this.authenticationShwo = true;
              this.countdownTime = res.data.countdownTime;
              this.getQrcode();
              this.timerTask();
              this.refreshCode = false;
              this.haha = true;
            } else {
              this.$message.warning(res.msg);
            }
          });
        }
      }
    },
        // 二维码
    getQrcode() {
      this.$nextTick(res => {
        this.$refs.qrCode.innerHTML = "";
        const location = window.location.origin;
        this.$api.addQRCode().then(res => {
          if (res.code === 200) {
            this.unique = res.data;
            const data = JSON.stringify(encodeURIComponent(this.authenticationUrl));
            new QRCode("qrCode", {
              width: 260,
              height: 260,
              text: `${location}/h5/#/pages/h5/scanCodeTran?type=2&unique=${this.unique}&data=${data}`
            });
            this.queryQRCode();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    timerTask() {
      this.timer = setInterval(() => {
        this.$api
          .userFaceDistinguishState({ pkId: this.userFaceDistinguishId, distinguishType: 0 })
          .then(res => {
            if (res.code == 200) {
              this.stopTime = this.stopTime + 3;
              if (this.stopTime == this.countdownTime) {
                this.stopTime = 0;
                this.countdownTime = "";
                this.refreshCode = true;
                this.codeOk = false;
                return clearInterval(this.timer);
              }
              if (res.data.status == 2) {
                clearInterval(this.timer);
                this.authenticationShwo = false;
                this.personalCertificateShow = false;
                this.enterpriseShow = false;
                this.$message.success("认证成功");
                this.$store.commit("statusAlter", true);
                sessionStorage.setItem("statusAlter", true);
                this.getList();
              }
              if (res.data.status == 3) {
                clearInterval(this.timer);
                this.refreshCode = true;
                this.codeOk = false;
                this.$message({
                  message: res.data.errorInfo,
                  duration: 5000
                });
              }
            } else {
              clearInterval(this.timer);
            }
          })
          .catch(err => {
            clearInterval(this.timer);
          });
      }, 3000);
    },
    //   查看按钮
    checkDone(item, type) {
      console.log(item.matterType);
      this.loading = true;
      this.isCheck = true;
      this.isSign=false
      // 事项类型matterType（1：施工验收流程待办，2：业主计量流程待办，3：分包计价流程待办，4：变更设计流程待办 5:会议签到 6：技术交底 7:盘点流程待办 8:申请用章流程待办,9:收发文待办,10:商务用户续费,11:付费用户续费,12:短信签名申请,13:短信赠送及充值申请,14:合同签署，15：工资结算：16：工资发放 ,17:收发文指定人员待办）
      if (item.matterType === 1) {
        this.getIsDoneTaskDetail(item, type);
      } else if (item.matterType === 2) {
        if (type == 1) {
          this.pkId = item.fkBusinessId;
          this.dialogVisible = true;
        } else {
          this.getIsDoneTaskDetail(item);
        }
      } else if (item.matterType === 3) {
        if (type == 1) {
          this.pkId = item.fkBusinessId;
          this.subDialogVisible = true;
        } else {
          this.getIsDoneTaskDetail(item);
        }
      } else if (item.matterType === 4) {
        if (type == 1) {
          this.getDesignDetail(item.fkBusinessId);
        } else {
          this.getIsDoneTaskDetail(item);
        }
      } else if (item.matterType === 6) {
        this.$refs.checkDisclosure.selectDisclosureById(item.fkBusinessId);
      } else if (item.matterType === 7) {
        if (type == 1) {
          this.$refs.approveManageementDialog.findOrderInventoryById(item.fkBusinessId,2);
        } else {
          this.getIsDoneTaskDetail(item);
        }
      } else if (item.matterType === 8) {
        // if (type == 1) {
        //   this.bizId = item.fkBusinessId;
        //   this.chaptersApprovalDialog = true;
        //   this.loading = false;
        // } else {
          this.getIsDoneTaskDetail(item,type);
        // }
      } else if (item.matterType === 9) {
        this.oaMeetingfindById(item.fkBusinessId);
      } else if (item.matterType === 10) {
        this.fkRenewalId = item.fkBusinessId;
        this.show2 = true;
        this.renewalTitle = "商务用户-续期";
        this.findRenewalByPkId(item);
        this.loading = false;
      } else if (item.matterType === 11) {
        this.fkRenewalId = item.fkBusinessId;
        this.renewalTitle = "付费用户-续期";
        this.show2 = true;
        this.findRenewalByPkId(item);
        this.loading = false;
      } else if (item.matterType === 12) {
        this.signature(item);
        this.loading = false;
      } else if (item.matterType === 13) {
        this.topUp(item);
        this.loading = false;
      } else if (item.matterType === 14) {
        this.nailUrlByOrgId(item);
      } else if (item.matterType === 17) {
        this.oaMeetingfindById(item.fkBusinessId);
      }
    },
    oaMeetingfindById(pkId) {
      this.$api.oaArticleFindById({ pkId }).then(res => {
        this.loading = false;
        if (res.code === 200) {
          this.infoDialogForm = res.data;
          this.infoDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeInfoDialog() {
      this.infoDialog = false;
    },
    getIsDoneTaskDetail(row, type) {
      this.nodeType=row.matterType
      this.$api.getIsDoneTaskDetail({ flowCaseId: row.fkFlowCaseId, nodeId: type && type == 1 ? "" : row.fkNodeId,fkFlowTaskId:row.fkFlowTaskId }).then(res => {
        this.loading = false;
        if (res.code === 200) {
          if (row.matterType == 1) {
            if (type == 1) {
              this.disposeData = res.data.prodProcessApproveVo ? res.data.prodProcessApproveVo : {};
              this.proChangeDialog = true;
            } else {
              this.pkIdItem = row.fkBusinessId;
              this.disposeData = res.data.prodProcessApproveVo ? res.data.prodProcessApproveVo : {};
              this.disposeDialog = true;
            }
          } else if (row.matterType == 2) {
            this.disposeData = res.data.engStatsProjectSettleVo ? res.data.engStatsProjectSettleVo : {};
            this.dialogVisible2 = true;
          } else if (row.matterType == 3) {
            this.disposeData = res.data.engStatsProjectSettleVo ? res.data.engStatsProjectSettleVo : {};
            this.dialogVisible2 = true;
          } else if (row.matterType == 4) {
            this.designAppData = res.data.changeDesignDetailVo ? res.data.changeDesignDetailVo : {};
            this.dialogVisible2 = true;
          } else if (row.matterType == 7) {
            this.disposeData = res.data.engMatOrderInventoryVo ? res.data.engMatOrderInventoryVo : {};
            this.dialogVisible2 = true;
          } else if (row.matterType == 8) {
            if(type===1){
              // 业务类型（1：施工验收流程待办，2：业主计量流程待办，3：分包计价流程待办，4：变更设计流程待办 7:盘点流程待办）
              this.isSign=true
              if(row.businessType===1){
                this.disposeData = res.data.prodProcessApproveVo ? res.data.prodProcessApproveVo : {};
                this.proChangeDialog = true;
              }else if(row.businessType===2){
                this.disposeData = res.data.engStatsProjectSettleVo ? res.data.engStatsProjectSettleVo : {};
                this.dialogVisible = true;
              }else if(row.businessType===3){
                this.disposeData = res.data.engStatsProjectSettleVo ? res.data.engStatsProjectSettleVo : {};
                this.subDialogVisible = true;
              }else if(row.businessType===4){
                this.designAppData = res.data.changeDesignDetailVo ? res.data.changeDesignDetailVo : {};
                this.approvalDialog = true;
              }else if(row.businessType===7){
                this.disposeData = res.data.engMatOrderInventoryVo ? res.data.engMatOrderInventoryVo : {};
                this.appDialog=true
              }
            }else{
              this.disposeData = res.data.sealDetailVo ? res.data.sealDetailVo : {};
              this.chaptersApprovalDialog = true;
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    lookOver(pkId) {
      this.pkIdItem = pkId;
      // 查询流程信息
      this.$api
        .queryProduction({ approveId: pkId, type: 2 })
        .then(res => {
          this.closeLoading();
          if (res.code === 200) {
            this.newProcessname = res.data.processName;
            // 处理按钮需要处理传的数据
            this.disposeData = res.data;
             // 处理分项基本信息
            let unitProject = "";
            let partProject = "";
            let outProject = "";
            this.disposeData.reItemApproveDtoList.forEach(item => {
              unitProject = item.unitItemName + "," + unitProject; //单位
              partProject = item.partItemName + "," + partProject; //分部
              outProject = item.itemName + "," + outProject; //完成分项
            });
            this.disposeData.reItemApproveDtoList[0].unitProject = unitProject.slice(0, -1);
            this.disposeData.reItemApproveDtoList[0].partProject = partProject.slice(0, -1);
            this.disposeData.reItemApproveDtoList[0].outProject = outProject.slice(0, -1);
            // 查询负责人,处理必须调用这个接口查
            const itemId = res.data.reItemApproveDtoList[0].fkItemId;
            const orgid = localStorage.getItem("orgId");
            const mobnaid = res.data.prodWorkflowTemplate.pkId;
            const nodeId = res.data.pkId;
            // this.getstaffList(itemId, orgid, mobnaid, nodeId); // 负责人单独接口
            this.disposeDialog = true;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.closeLoading();
        });
    },
    // // 获取负责人
    // getstaffList(itemId, orgId, pkId, nodeId) {
    //   const params = {
    //     itemId,
    //     orgId,
    //     workflowId: pkId,
    //     processId: nodeId
    //   };
    //   this.$api
    //     .getstaffList(params)
    //     .then(res => {
    //       if (res.code == 200 && res.data !== null) {
    //         this.roleDtoName = res.data.roleName;
    //         this.disposeMan = res.data.sysUserList; // 动态传值给处理那边的负责人
    //       }
    //     })
    //     .catch(err => {
    //       this.$message.warning(err);
    //     });
    // },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getList();
    },
    cleanData() {
      this.disposeData = {};
      this.pkIdItem = "";
      this.disposeMan = [];
      this.roleDtoName = "";
    },
    // 设计变更审批弹框
    approvalDialogClose() {
      this.approvalDialog = false;
      this.designAppData = {};
    },
    // 根据id查询变更详情
    getDesignDetail(changeId) {
      this.loading = true;
      this.$api
        .getDesignDetail({ changeId ,type:2})
        .then(res => {
          this.closeLoading();
          if (res.code === 200) {
            this.designAppData = res.data;
            this.approvalDialog = true;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.closeLoading();
          this.loading = false;
        });
    },
    // 签章弹框
    rescindById(row) {
      this.$api.contractSign({ pkId: row.fkBusinessId }).then(res => {
        this.closeLoading();
        if (res.code === 200) {
          this.signatureUrl = res.data;
          this.signatureDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查看合同
    nailUrlByOrgId(row) {
      this.$api.nailUrlByOrgId({ pkId: row.fkBusinessId, urlType: 1 }).then(res => {
        this.closeLoading();
        if (res.code === 200) {
          this.signatureUrl = res.data;
          this.signatureDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeSignatureDialog() {
      this.signatureDialog = false;
      if (!this.isCheck) {
        this.getList();
      }
    },
    closeLoading() {
      this.loading = false;
    },
    updateList() {
      if (this.tableData.length === 1 && this.page.pageNum > 1) {
        this.page.pageNum--;
      }
      this.getList();
    },
    topUpApprove(type) {
      const data = {
        approvalReason: this.topUpForm.remark,
        pkId: this.topUpForm.pkId,
        approvalStatus: type
      };
      if(!data.approvalReason){
        return this.$message.warning("请输入审批意见")
      }
      this.loading = true;
      this.$api.sysSmsRechargeApprove(data).then(res => {
        if (res.code == 200) {
          this.topUpShow = false;
          this.loading = false;
          this.$message.success("操作成功");
          this.getList();
        } else {
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    topUp(row) {
      this.signatureForm.type = 1;
      this.$api.sysSmsRechargeFindById({ pkId: row.fkBusinessId }).then(res => {
        if (res.code == 200) {
          this.topUpShow = true;
          this.topUpForm = { ...res.data, remark: res.data.approvalReason ? res.data.approvalReason : "" };
          // this.topUpForm.remark = "";
          if (res.data.approvalType === 0) {
            this.topUpTitle = "短信充值审批";
          } else if (res.data.approvalType == 1) {
            this.topUpTitle = "赠送短信审批";
          }
          this.topUpForm.type = 1;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查看签名详情
    signatureApproval(type) {
      const data = {
        approvalReason: this.signatureForm.remark,
        pkId: this.signatureForm.pkId,
        approvalStatus: type
      };
      if(!data.approvalReason){
        return this.$message.warning("请输入审批意见")
      }
      this.loading = true;
      this.$api.smsSignApprove(data).then(res => {
        if (res.code == 200) {
          this.signatureShow = false;
          this.loading = false;
          this.$message.success("操作成功");
          this.getList();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findRenewalByPkId(item) {
      const data = {
        pkId: item.fkBusinessId,
        type: item.orgType == 8 ? 1 : 0
      };
      this.$api.findRenewalByPkId(data).then(res => {
        if (res.code == 200) {
          const orgType = {
            0: "系统运营商",
            1: "系统代理商",
            2: "建设单位(业主方)",
            3: "监理公司",
            4: "施工单位",
            5: "项目部",
            6: "供应商",
            7: "分包单位",
            8: "劳务工人",
            9: "设计院"
          };
          res.data.orgTypeName = orgType[res.data.orgType];
          this.rowDataForm = res.data;
          this.rowDataForm.remark = "";
          this.rowDataForm.proofUrl = [this.rowDataForm.proofUrl];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 续费审核
    auditPass(formName, val) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            remark: this.rowDataForm.remark,
            renewalId: this.fkRenewalId,
            approveStatus: val
          };
          this.loading = true;
          this.$api.renewalAuth(data).then(res => {
            if (res.code == 200) {
              this.loading = false;
              this.$message({
                type: "success",
                message: res.msg
              });
              this.show2 = false;
              this.getList();
            } else {
              this.loading = false;
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    signature(row) {
      this.signatureForm.remark = "";
      this.signatureTitle = "签名审批";
      this.$api.smsSignFindById({ pkId: row.fkBusinessId }).then(res => {
        if (res.code == 200) {
          this.signatureForm = res.data;
          this.signatureForm.enclosures = res.data.enclosures;
          this.signatureForm.reason = res.data.reason;
          this.signatureForm.pkId = res.data.pkId;
          this.signatureForm.remark = res.data.remark;
          this.signatureForm.orgName = res.data.orgName;
          this.signatureForm.managerMobile = res.data.managerMobile;
          this.signatureForm.signName = res.data.signName;
          this.signatureForm.type = 1;
          this.signatureShow = true;
          delete this.signatureForm.enableStatus;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    openAnomaly() {
      this.abnormalMatterSearchPage();
      this.anomalyShow = true;
    },
    anomalySearchbtn() {
      this.anomalyPage.pageNum = 1;
      this.anomalySearch = { ...this.anomalyInp };
      this.abnormalMatterSearchPage();
    },
    closeAnomaly() {
      this.anomalyShow = false;
      this.anomalyInp = {
        beginTime: "",
        endTime: "",
        titleLike: "",
        userName: ""
      };
      this.anomalySearch = {
        beginTime: "",
        endTime: "",
        titleLike: "",
        userName: ""
      };
      this.anomalyTable = [];
      this.anomalyTotal = 0;
      this.anomalyPage = {
        pageNum: 1,
        pageSize: 10
      };
    },
    openPeoDialog(row) {
      this.peoForm = { ...row, fkUserId: "" };
      this.searchMatterUsers(row.pkId);
      this.peoDialog = true;
    },
    peoDialogOk() {
      if (!this.peoForm.fkUserId) {
        return this.$message.warning("请选择新负责人");
      }
      this.updateMatter();
    },
    closePeoDialog() {
      this.peoDialog = false;
      this.peoOptons = [];
      this.peoForm = {};
    },
    beginChange(e) {
      if (e) {
        this.anomalyInp.endTime = "";
      }
    },
    // pageSize改变
    anomalySizeChange(val) {
      this.anomalyPage.pageSize = val;
      this.abnormalMatterSearchPage();
    },
    // current改变
    anomalyCurrentChange(val) {
      this.anomalyPage.pageNum = val;
      this.abnormalMatterSearchPage();
    },
    abnormalMatterSearchPage() {
      const data = {
        ...this.anomalyPage,
        ...this.anomalySearch
      };
      const api = this.user.orgType != 0 ? this.$api.abnormalMatterSearchPageNoMaster : this.$api.abnormalMatterSearchPage;
      api(data).then(res => {
        if (res.code === 200) {
          this.anomalyTable = res.data.records;
          this.anomalyTotal = res.data.total - 0;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchMatterUsers(matterId) {
      const api = this.user.orgType != 0 ? this.$api.searchMatterUsersNoMaster : this.$api.searchMatterUsers;
      api({ matterId }).then(res => {
        if (res.code === 200) {
          this.peoOptons = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    updateMatter() {
      const data = {
        fkUserId: this.peoForm.fkUserId,
        pkId: this.peoForm.pkId
      };
      const api = this.user.orgType != 0 ? this.$api.updateMatterNoMaster : this.$api.updateMatter;
      api(data).then(res => {
        if (res.code === 200) {
          this.$message.success("修改成功");
          this.abnormalMatterSearchPage();
          this.closePeoDialog();
        } else {
          this.$message.warning(res.msg);
        }
      });
    }
  },
  watch: {
    radio(val) {
      this.page = { pageNum: 1, pageSize: 10 };
      this.tableData = [];
      this.getList();
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  }
};
</script>

<style lang="scss" scoped>
.topTabs {
  position: relative;
  padding: 5px;
  background-color: #fff;
  .anomalyBtn {
    position: absolute;
    top: 15%;
    right: 0;
    z-index: 1;
  }
}
.titleIcon {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}
.h-10 {
  height: 10px;
}
.dialog-form {
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .tables {
    height: 500px;
  }
  .search {
    display: flex;
    align-items: center;
    .search-item {
      display: flex;
      align-items: center;
      .labels {
        width: 72px;
        text-align: center;
      }
      .w-50 {
        width: 50px;
      }
    }
  }
}
.blueTitle {
  cursor: pointer;
  color: #02a7f0;
}
.red{
  color:red;
}
.qr-title {
  text-align: center;

  .close-qrcode {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  .hint-tit {
    padding-top: 20px;
  }

  /deep/ .el-dialog__header {
    background-color: #cfd7da;
    text-align: left;
  }

  #qrCode {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    position: relative;
    height: 300px;

    .codeTime {
      width: 260px;
      height: 260px;
      line-height: 260px;
      font-size: 30px;
      font-weight: 600;
      position: absolute;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      text-align: center;

      i {
        cursor: pointer;
      }
    }
  }

  .el-dialog__body {
    p {
      color: #3aa1ff;
    }
  }
}
</style>
