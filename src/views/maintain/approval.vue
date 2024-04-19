<template>
  <div class="app-container">
    <div class="pay-header" style="position: relative;">
      <el-tabs v-model="listQuery.type" @tab-click="typeChange">
        <el-tab-pane label="商务用户续费" name="0"></el-tab-pane>
        <el-tab-pane label="付费用户续费" name="1"></el-tab-pane>
        <el-tab-pane label="短信签名申请" name="2"></el-tab-pane>
        <el-tab-pane label="短信赠送及充值申请" name="3"></el-tab-pane>
      </el-tabs>
      <div class="approvals-number" v-if="approvalsNumber.businessNumber > 0">{{ approvalsNumber.businessNumber }}</div>
      <div class="approvals-number tow" v-if="approvalsNumber.payNumber > 0">{{ approvalsNumber.payNumber }}</div>
      <div class="approvals-number three" v-if="approvalsNumber.signNumber > 0">{{ approvalsNumber.signNumber }}</div>
      <div class="approvals-number four" v-if="approvalsNumber.rechargeNumber > 0">{{ approvalsNumber.rechargeNumber }}</div>
      <el-button size="mini" class="approver-add el-button-primary" @click="receiver" type="primary">设置审批人</el-button>
    </div>
    <div class="search-bar-box">
      <span class="label-text">账号类型</span>
      <el-select v-if="listQuery.type == '0'" v-model="listQuery.orgType" placeholder="请选择" size="mini" class="wh-200">
        <el-option label="全部" value="0"></el-option>
        <!-- <el-option label="系统运营商" value="0"></el-option> -->
        <!-- <el-option label="系统代理商" value="1"></el-option> -->
        <el-option label="建设单位子公司" value="2"></el-option>
        <el-option label="监理公司" value="3"></el-option>
        <el-option label="施工单位子公司" value="4"></el-option>
        <el-option label="项目部" value="5"></el-option>
        <!-- <el-option label="供应商" value="6"></el-option> -->
        <!-- <el-option label="分包商" value="7"></el-option> -->
        <!-- <el-option label="劳务工人" value="8"></el-option> -->
        <el-option label="设计院" value="9"></el-option>
        <el-option label="施工单位集团公司" value="10"></el-option>
        <el-option label="政府监管单位" value="11"></el-option>
        <el-option label="建设单位集团公司" value="12"></el-option>
      </el-select>
      <el-select v-if="listQuery.type == 1" v-model="listQuery.orgType" placeholder="请选择" size="mini" class="wh-200">
        <el-option label="全部" value="1"></el-option>
        <el-option label="供应商" value="6"></el-option>
        <el-option label="分包单位" value="7"></el-option>
        <el-option label="劳务工人" value="8"></el-option>
      </el-select>
      <el-select v-if="listQuery.type == 2" v-model="listQuery.orgType" placeholder="请选择" size="mini" class="wh-200">
        <el-option label="全部" value=""></el-option>
        <!-- <el-option label="系统运营商" value="0"></el-option> -->
        <!-- <el-option label="系统代理商" value="1"></el-option> -->
        <el-option label="建设单位子公司" value="2"></el-option>
        <!-- <el-option label="监理公司" value="3"></el-option> -->
        <el-option label="施工单位子公司" value="4"></el-option>
        <el-option label="项目部" value="5"></el-option>
        <el-option label="供应商" value="6"></el-option>
        <el-option label="分包商" value="7"></el-option>
        <!-- <el-option label="劳务工人" value="8"></el-option> -->
        <el-option label="设计院" value="9"></el-option>
        <el-option label="施工单位集团公司" value="10"></el-option>
        <el-option label="政府监管单位" value="11"></el-option>
        <el-option label="建设单位集团公司" value="12"></el-option>
      </el-select>
      <el-select v-if="listQuery.type == 3" v-model="listQuery.orgType" placeholder="请选择" size="mini" class="wh-200">
        <el-option label="全部" value=""></el-option>
        <!-- <el-option label="系统运营商" value="0"></el-option> -->
        <!-- <el-option label="系统代理商" value="1"></el-option> -->
        <el-option label="建设单位子公司" value="2"></el-option>
        <el-option label="监理公司" value="3"></el-option>
        <el-option label="施工单位子公司" value="4"></el-option>
        <el-option label="项目部" value="5"></el-option>
        <el-option label="供应商" value="6"></el-option>
        <el-option label="分包商" value="7"></el-option>
        <!-- <el-option label="劳务工人" value="8"></el-option> -->
        <el-option label="设计院" value="9"></el-option>
        <el-option label="施工单位集团公司" value="10"></el-option>
        <el-option label="政府监管单位" value="11"></el-option>
        <el-option label="建设单位集团公司" value="12"></el-option>
      </el-select>
      <!-- <span class="label-text" v-if="listQuery.type == 3">账号类型</span> -->

      <span class="label-text">状态</span>
      <el-select v-model="listQuery.approveStatus" placeholder="请选择" size="mini" class="wh-200">
        <el-option label="全部" value=""></el-option>
        <el-option v-if="listQuery.type != 2" :label="listQuery.type == 3 ? '待处理' : '审批中'" value="0"></el-option>
        <el-option v-if="listQuery.type != 2" label="审批通过" value="1"></el-option>
        <el-option v-if="listQuery.type != 2" label="审批不通过" value="2"></el-option>
        <el-option v-if="listQuery.type == 2" label="待处理" value="1"></el-option>
        <el-option v-if="listQuery.type == 2" label="审批通过" value="2"></el-option>
        <el-option v-if="listQuery.type == 2" label="审批不通过" value="3"></el-option>
      </el-select>
      <span class="label-text" v-if="listQuery.type == 0 || listQuery.type == 2 || listQuery.type == 3">企业名称</span>
      <span class="label-text" v-else>账号名称</span>
      <el-input v-model="listQuery.keyWord" placeholder="" size="mini" class="wh-200" maxlength="50"></el-input>
      <span class="label-text" v-if="listQuery.type == 0 || listQuery.type == 2">管理员手机号码</span>
      <span class="label-text" v-else>手机号码</span>
      <el-input v-model="listQuery.telephone" placeholder="" size="mini" class="wh-200" maxlength="11"></el-input>
      <el-button type="primary" icon="el-icon-search" size="mini" class="ml-20 el-button-primary" @click="search">搜索</el-button>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height:82%">
        <el-table :tooltip-effect="'light'" v-if="listQuery.type == 0 || listQuery.type == 1" ref="tables" :data="tableData" stripe height="92%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="accountName" :label="listQuery.type == 0 ? '企业名称' : '账号名称'" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="orgTypeName" :label="listQuery.type == 0 ? '企业类型' : '账号类型'" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="telephone" label="管理员手机号码" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createDate" :label="listQuery.type == 0 ? '注册日期' : '系统注册日期'" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="expireDate" label="到期日期" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="renewalDate" label="续租至" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createUser" label="提交人" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createTime" label="提交时间" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approvel" label="审批人" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveTime" label="审批时间" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveStatusName" label="状态" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column prop="alarmLevel" label="操作" min-width="160">
            <template slot-scope="scope">
              <el-button type="primary" plain v-has="'maintain:approval:query'" size="mini" @click.native="examine(scope.row)">查看</el-button>
              <el-button type="success" v-if="scope.row.approveStatus == 0 && scope.row.isAppear == 1" plain size="mini" @click.native="renewalAudit(scope.row)">续期审核</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <el-table :tooltip-effect="'light'" v-if="listQuery.type == 2" ref="tables" :data="tableData" stripe height="92%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="signName" label="申请签名" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="orgName" label="申请企业名称" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="managerMobile" label="管理员手机号码" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createUser" label="申请人" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createTime" label="申请时间" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveName" label="审批人" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveTime" label="审批时间" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="enableStatusName" label="状态" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column prop="alarmLevel" label="操作" min-width="160">
            <template slot-scope="{ row }">
              <el-button type="primary" plain size="mini" @click.native="signature(row, 0)">查看</el-button>
              <el-button type="warning" plain v-if="row.enableStatus == 1 && row.isAppear == 1" size="mini" @click.native="signature(row, 1)">审核</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <el-table :tooltip-effect="'light'" v-if="listQuery.type == 3" ref="tables" :data="tableData" stripe height="92%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="orgName" label="企业名称" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="orgTypeName" label="账号类型1" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="managerMobile" label="管理员手机号码" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="afterGiveNum" label="赠送剩余短信条数" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="afterRechargeNum" label="充值剩余短信条数" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="num" label="申请赠送/充值条数" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approvalType" label="审批类型" min-width="80">
            <template slot-scope="{ row }">
              <span v-if="row.approvalType == 0">充值</span>
              <span v-if="row.approvalType == 1">赠送</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="paymentCode" label="充值方式" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="amount" label="充值金额" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveName" label="审批人" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveTime" label="审批时间" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createTime" label="状态" min-width="80">
            <template slot-scope="{ row }">
              <span v-if="row.approvalStatus == 0">待处理</span>
              <span v-if="row.approvalStatus == 1">审批通过</span>
              <span v-if="row.approvalStatus == 2">审批不成功</span>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" min-width="160">
            <template slot-scope="{ row }">
              <el-button type="primary" plain v-has="'maintain:approval:query'" size="mini" @click.native="topUp(row, 0)">查看</el-button>
              <el-button type="warning" plain v-if="row.approvalStatus == 0 && row.isAppear == 1" size="mini" @click.native="topUp(row, 1)">审核</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
      </div>
    </div>

    <el-dialog :title="renewalTitle" width="520px" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form" style="padding-bottom: 8px;">
        <el-form-item label="用户名称" prop="accountName" label-width="90px">
          <el-input size="mini" v-model="rowDataForm.accountName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="telephone" label-width="90px">
          <el-input size="mini" v-model="rowDataForm.telephone" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号类型" prop="loginName" label-width="90px">
          <el-input size="mini" v-model="rowDataForm.orgTypeName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="续租至" prop="time" label-width="90px">
          <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" disabled v-model="rowDataForm.renewalDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="续租凭证" prop="certificate" label-width="90px">
          <picture-upload size="mini" :apiName="'getUploadFileToken'" disabled :fileList="rowDataForm.proofUrl" :showUpload="false" uploadTip="”uploadTip“" :limit="2"></picture-upload>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" label-width="90px">
          <el-input size="mini" v-model="rowDataForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期'" placeholder="" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="renewalTitle != '续期'">
        <el-button size="mini" type="primary" class="el-button-primary" @click="auditPass('rowDataForm', 1)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="auditPass('rowDataForm', 2)">审批不通过</el-button>
        <el-button size="mini" @click="show2 = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 短信签名详情 -->
    <el-dialog :title="signatureTitle" width="560px" :visible.sync="signatureShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form">
        <el-form-item label="企业名称" prop="orgName" label-width="90px">
          <el-input size="mini" v-model="signatureForm.orgName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="managerMobile" label-width="90px">
          <el-input size="mini" v-model="signatureForm.managerMobile" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号类型" prop="orgTypeName" label-width="90px">
          <el-input size="mini" v-model="signatureForm.orgTypeName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="短信签名" prop="signName" label-width="90px">
          <el-input size="mini" v-model="signatureForm.signName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用途" prop="reason" label-width="90px">
          <el-input size="mini" v-model="signatureForm.reason" type="textarea" style="resize: none" :rows="3" maxlength="100" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="附件" prop="remark" label-width="90px">
          <div v-for="(item, index) in signatureForm.enclosures" :key="index" @click="preview(item)">
            {{ item.enclosureName }}
          </div>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" label-width="90px">
          <el-input size="mini" v-model="signatureForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期' || !!signatureForm.enableStatus" placeholder="" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="signatureForm.type == 1">
        <el-button size="mini" type="primary" class="el-button-primary" @click="signatureApproval(2)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="signatureApproval(3)">审批不通过</el-button>
        <el-button size="mini" @click="signatureShow = false">取 消</el-button>
      </div>
      <div v-else style="height: 10px;"></div>
    </el-dialog>
    <!-- 短信赠送充值详情 -->
    <el-dialog :title="topUpTitle" :visible.sync="topUpShow" width="560px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form" style="padding-bottom: 8px;">
        <el-form-item label="企业名称" prop="orgName" label-width="95px">
          {{ topUpForm.orgName }}
        </el-form-item>
        <el-form-item label="管理员手机号码" prop="managerMobile" label-width="110px">
          {{ topUpForm.managerMobile }}
        </el-form-item>
        <el-form-item label="剩余短信" prop="managerMobile" :label-width="formLabelWidth"> <span>赠送</span>{{ topUpForm.residueGiveNum }}<span>+充值</span>{{ topUpForm.residueRechargeNum }}<span>条</span> </el-form-item>
        <el-form-item label="申请人" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input size="mini" v-model="topUpForm.userName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="赠送短信" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input size="mini" v-model="topUpForm.num" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="赠送原因" prop="reason" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input size="mini" v-model="topUpForm.reason" type="textarea" style="resize: none" :rows="3" maxlength="100" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值金额" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input size="mini" v-model="topUpForm.amount" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值短信" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input size="mini" v-model="topUpForm.num" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值方式" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input size="mini" v-model="topUpForm.paymentCode" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值证明" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <div v-for="(item, index) in topUpForm.enclosures" :key="index">
            {{ item.enclosureName }}
          </div>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" :label-width="formLabelWidth" v-if="(signatureForm.type == 1 && topUpForm.approvalStatus === 0) || topUpForm.approvalStatus !== 0">
          <el-input v-model="topUpForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期' || topUpForm.approvalStatus !== 0" placeholder="" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="signatureForm.type == 1">
        <el-button size="mini" type="primary" class="el-button-primary" @click="topUpApprove(1)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="topUpApprove(2)">审批不通过</el-button>
        <el-button size="mini" @click="topUpShow = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="设置审批人" :visible="receiverShow" width="400px" @close="receiverClose" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog dialog-form">
        <div style="width: 300px;margin: 0 auto;">
          <span>负责人: </span>
          <el-select v-model="receiverTo" placeholder="请选择" size="mini">
            <el-option v-for="item in receiverList" :key="item.pkId" :label="item.userName" :value="item.pkId"> </el-option>
          </el-select>
        </div>
      </div>
      <div style="margin: 8px auto; margin-top: 10px; width: 300px;border: 1px dashed #bbbbbb; padding: 10px;border-radius: 6px;">
        <div>提示:</div>
        <div style="color:  #bbbbbb;">
          此处审批人,可进行续费审批，短信签名审批，短信变动审批等，默认管理员为审批人。
        </div>
      </div>

      <div slot="footer">
        <el-button size="mini" @click="receiverClose">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="receiverEnsure">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + url" v-if="previewType == 1"></iframe>
        <img class="img" :src="url" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
  </div>
</template>

<script>
import pictureUpload from "@/components/pictureUpload";

import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import moment from "moment";
export default {
  name: "payList",
  components: {
    pictureUpload,
    pdfPiev
  },
  data() {
    return {
      previewDialog: false,
      previewType: 3,
      url: "",
      totalCount: 0,
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        type: "0",
        orgType: "0",
        approveStatus: "",
        keyWord: "",
        telephone: ""
      },
      tableData: [],
      maxHeight: 0,
      rowDataForm: {},
      formLabelWidth: "110px",
      show2: false,
      renewalTitle: "",
      loading: false,
      fkRenewalId: "",
      approvalsNumber: {
        businessNumber: 0,
        payNumber: 0,
        rechargeNumber: 0,
        signNumber: 0
      },
      signatureShow: false,
      signatureTitle: "",
      signatureForm: {
        orgName: "", //企业名称
        managerMobile: "", //管理员账号
        signName: "", //短信签名
        reason: "", //用途
        enclosures: [
          // {
          //   enclosureName:"附件名称",
          //   enclosureUrl:"附件路径"
          // }
        ],
        type: 0,
        remark: "",
        pkId: "",
        orgTypeName: ""
      },
      topUpShow: false,
      topUpTitle: "",
      topUpForm: {
        remark: ""
      },
      receiverShow: false,
      receiverList: [],
      receiverTo: ""
    };
  },
  mounted() {
    this.getOrgPageList();
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  methods: {
    // 预览
    preview(row) {
      console.log(row);
      if (!row.enclosureUrl) {
        return this.$message.warning("无法识别的文件");
      }
      const exit = row.enclosureUrl.substring(row.enclosureUrl.lastIndexOf(".") + 1);
      // console.log(exit);
      // let noimgType = ["avi", "wmv", "mpg", "mpeg", "mov", "rm", "ram", "swf", "flv", "mp4", "wma", "rm", "rmvb", "flv", "mpg", "mkv"];
      // if (noimgType.includes(exit)) {
      //   this.videoSrc = row.enclosureUrl;
      //   this.previewDialog2 = true;
      //   return;
      // }
      const imgList = ["png", "jpg", "jpeg"];
      const orderList = ["docx", "xlsx"];
      this.url = row.enclosureUrl;

      if (exit === "pdf") {
        this.$refs.pdfPiev.pdfShow = true;
      } else if (imgList.includes(exit)) {
        this.previewType = 3;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (orderList.includes(exit)) {
        this.previewType = 1;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else {
        this.$message.warning("该文件无法预览");
      }
    },
    // =========================================
    receiverEnsure() {
      let data = {
        enableStatus: 1,
        fkUserId: this.receiverTo,
        setType: 1
      };
      this.loading = true;
      this.$api.configurationSetPost(data).then(res => {
        this.loading = false;
        if (res.code == 200) {
          this.$message.success("操作成功");
          this.receiverClose();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    receiver() {
      this.$api.findSysUserListByOrgId({ orgId: this.user.fkOrgId }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.userName = item.userName + "[" + (item.isMaster ? "管理员" : item.deptName) + "]";
          });
          this.receiverList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
      this.$api.configurationSet({ setType: 1 }).then(res => {
        if (res.code == 200) {
          this.receiverShow = true;
          this.receiverTo = res.data.fkUserId;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    receiverClose() {
      this.receiverShow = false;
    },
    // =========================================
    topUpApprove(type) {
      let data = {
        approvalReason: this.topUpForm.remark,
        pkId: this.topUpForm.pkId,
        approvalStatus: type
      };
      if (!data.approvalReason) {
        return this.$message.warning("请输入审批意见");
      }
      this.loading = true;
      this.$api.sysSmsRechargeApprove(data).then(res => {
        if (res.code == 200) {
          this.topUpShow = false;
          this.loading = false;
          this.$message.success("操作成功");
          this.getOrgPageList();
        } else {
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    topUp(row, type) {
      this.topUpTitle = type == 0 ? "充值赠送短信信息" : "充值赠送短信审批";
      if (type == 0) {
        if (row.approvalType === 0) {
          this.topUpTitle = "短信充值信息";
        } else if (row.approvalType == 1) {
          this.topUpTitle = "赠送短信信息";
        }
      } else {
        if (row.approvalType === 0) {
          this.topUpTitle = "短信充值审批";
        } else if (row.approvalType == 1) {
          this.topUpTitle = "赠送短信审批";
        }
      }
      this.signatureForm.type = type;
      this.$api.sysSmsRechargeFindById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.topUpShow = true;
          this.topUpForm = { ...res.data, remark: res.data.approvalReason ? res.data.approvalReason : "" };
          // this.topUpForm.remark = "";
          this.topUpForm.type = type;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查看签名详情
    signatureApproval(type) {
      let data = {
        approvalReason: this.signatureForm.remark,
        pkId: this.signatureForm.pkId,
        approvalStatus: type
      };
      if (!data.approvalReason) {
        return this.$message.warning("请输入审批意见");
      }
      this.loading = true;
      this.$api.smsSignApprove(data).then(res => {
        this.loading = false;
        if (res.code == 200) {
          this.signatureShow = false;
          this.$message.success("操作成功");
          this.getOrgPageList();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    signature(row, type) {
      this.signatureForm.orgName = row.orgName;
      this.signatureForm.managerMobile = row.managerMobile;
      this.signatureForm.signName = row.signName;
      this.signatureForm.type = type;
      this.signatureForm.remark = "";
      this.signatureTitle = type == 0 ? "短信签名信息" : "签名审批";
      this.$api.smsSignFindById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.signatureForm.enclosures = res.data.enclosures;
          this.signatureForm.reason = res.data.reason;
          this.signatureForm.pkId = res.data.pkId;
          this.signatureForm.remark = res.data.remark;
          let typeObjt = {
            0: "系统运营商",
            1: "系统代理商",
            2: "建设单位子公司",
            3: "监理公司",
            4: "施工单位子公司",
            5: "项目部",
            6: "供应商",
            7: "分包商",
            8: "劳务工人",
            9: "设计院",
            10: "施工单位集团公司",
            11: "政府监管单位",
            12: "建设单位集团公司"
          };
          this.signatureForm.orgTypeName = typeObjt[res.data.orgType];
          this.signatureShow = true;
          if (type === 0) {
            this.signatureForm.enableStatus = res.data.enableStatus;
          } else {
            delete this.signatureForm.enableStatus;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchRenewalNumber() {
      this.$api.searchRenewalNumber().then(res => {
        if (res.code == 200) {
          this.approvalsNumber = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getOrgPageList() {
      if (this.listQuery.type == 0 || this.listQuery.type == 1) {
        this.approvalMatterSearchPage();
      } else if (this.listQuery.type == 2) {
        this.searchApproveSignPage();
      } else if (this.listQuery.type == 3) {
        this.sysSmsRecharge();
      }
    },
    sysSmsRecharge() {
      let data = {
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize,
        useType: 0,
        orgName: this.listQuery.keyWord,
        mobile: this.listQuery.telephone,
        approvalStatus: this.listQuery.approveStatus,
        orgType: this.listQuery.orgType
      };
      this.$api.sysSmsRecharge(data).then(res => {
        if (res.code == 200) {
          this.searchRenewalNumber();
          const orgTypeOptions = {
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
          // res.data.records.forEach(item => {
          //   item.orgTypeName = orgTypeOptions[item.orgType];
          // });
          this.tableData = res.data.records;
          this.totalCount = parseInt(res.data.total);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchApproveSignPage() {
      let data = {
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize,
        orgName: this.listQuery.keyWord,
        mobile: this.listQuery.telephone,
        enableStatus: this.listQuery.approveStatus,
        orgType: this.listQuery.orgType
      };
      this.$api.searchApproveSignPage(data).then(res => {
        if (res.code == 200) {
          this.searchRenewalNumber();
          const options = {
            0: "草稿",
            1: "待处理",
            2: "审批通过",
            3: "审批不通过"
          };
          res.data.records.forEach(item => {
            // item.orgTypeName = orgTypeOptions[item.orgType];
            item.enableStatusName = options[item.enableStatus];
          });
          this.tableData = res.data.records;
          this.totalCount = parseInt(res.data.total);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    approvalMatterSearchPage() {
      let data = {
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize,
        approveStatus: this.listQuery.approveStatus,
        keyWord: this.listQuery.keyWord,
        telephone: this.listQuery.telephone,
        orgType: this.listQuery.orgType
      };
      // data.orgType = this.listQuery.type == 0 ? this.listQuery.type : (data.orgType = this.listQuery.orgType);
      this.loading = true;
      this.$api.approvalMatterSearchPage(data).then(res => {
        if (res.code == 200) {
          this.searchRenewalNumber();
          const options = {
            0: "审批中",
            1: "审批通过",
            2: "审批不通过"
          };
          const orgTypeOptions = {
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
          res.data.records.forEach(item => {
            // item.orgTypeName = orgTypeOptions[item.orgType];
            item.approveStatusName = options[item.approveStatus];
          });
          this.tableData = res.data.records;
          this.totalCount = parseInt(res.data.total);
          // total
          this.loading = false;
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    typeChange(item) {
      let val = item.name;
      this.listQuery = {
        pageNum: 1,
        pageSize: this.listQuery.pageSize,
        type: val,
        orgType: "",
        approveStatus: "",
        keyWord: "",
        telephone: ""
      };

      if (this.listQuery.type == "0") {
        this.listQuery.orgType = "0";
      } else if (this.listQuery.type == "1") {
        this.listQuery.orgType = "1";
      } else {
        this.listQuery.orgType = "";
      }

      // this.listQuery.pageSize = 10;
      // if (val == 3) {
      //   this.listQuery.orgType = ""
      // }
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 查询
    search() {
      this.listQuery.pageNum = 1;
      // this.listQuery.pageSize = 10;
      this.getOrgPageList();
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 查看
    examine(row) {
      this.show2 = true;
      this.renewalTitle = "续期";
      this.findRenewalByPkId(row);
    },
    findRenewalByPkId(item) {
      let data = {
        pkId: item.fkRenewalId,
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
          this.rowDataForm.remark = "";
          this.rowDataForm = res.data;
          this.rowDataForm.proofUrl = [this.rowDataForm.proofUrl];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 续期审核
    renewalAudit(row) {
      this.fkRenewalId = row.fkRenewalId;
      this.show2 = true;
      this.renewalTitle = this.listQuery.type == 0 ? "商务用户-续期" : "付费用户-续期";
      this.findRenewalByPkId(row);
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
          if (!data.remark) {
            return this.$message.warning("请输入审批意见");
          }
          this.loading = true;
          this.$api.renewalAuth(data).then(res => {
            if (res.code == 200) {
              this.loading = false;
              this.$message({
                type: "success",
                message: res.msg
              });
              this.show2 = false;
              this.getOrgPageList();
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
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__header {
  // background-color: #d7d7d7 !important;
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.el-row-data {
  display: flex;
  flex-wrap: wrap;
}

.pay-header {
  position: relative;

  .search-mr {
    position: absolute;
    right: 8px;
  }
}

.charge-bitton {
  text-align: right;
}

.charge-box {
  height: 400px;
  overflow: auto;
}

::-webkit-scrollbar {
  width: 5px;
  color: #fff;
  background-color: #fcfcfc;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}

.chargeRate-input {
  /deep/ .el-input__inner {
    padding: 0 !important;
    text-align: center;
  }
}

.approvals-number {
  position: absolute;
  text-align: center;
  width: 20px;
  line-height: 20px;
  font-size: 14px;
  background: red;
  border-radius: 10px;
  color: rgb(255, 255, 255);
  left: 100px;
  top: -7px;
}

.tow {
  left: 230px;
}

.three {
  left: 350px;
}

.four {
  left: 510px;
}

.approver-add {
  position: absolute;
  right: 15px;
  top: 6px;
}

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}

.label-text {
  font-size: 14px;
  padding: 0 8px;
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
