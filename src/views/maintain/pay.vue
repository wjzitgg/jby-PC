<template>
  <div class="app-container">
    <div class="pay-header">
      <el-tabs v-model="listQuery.orgType" @tab-click="typeChange">
        <el-tab-pane label="供应商" name="6"></el-tab-pane>
        <el-tab-pane label="分包单位" name="7"></el-tab-pane>
        <el-tab-pane label="劳务工人" name="8"></el-tab-pane>
      </el-tabs>
    </div>
    <!-- <search-bar class="search-bar-demo" @search="search" v-if="searchShow" :options="searchOptions" :total="totalCount" labelWidth="8em" ref="searchBar" :showHandler="false"></search-bar> -->
    <div class="search-bar-box" style="position: relative">
      <!-- <span v-if="headerType != '1'">流程类型</span>
      <el-select v-if="headerType != '1'" v-model="listQuery.workflowType" placeholder="" size="mini" class="wh-150">
        <el-option v-for="(item ,index) in processType" :label="item.name" :value="item.key" :key="index"></el-option>
      </el-select> -->
      <span>{{ listQuery.orgType == 6 ? "供应商名称" : listQuery.orgType == 7 ? "分包单位名称" : "劳务工人" }}</span>
      <el-input v-model="listQuery.orgName" placeholder="" size="mini" class="wh-150"></el-input>
      <!-- <el-select v-if="typeWorkflowType != '5'" v-model="listQuery.fkEnginerringTypeId" @change="projectTypeChang" clearable placeholder="工程大类" size="mini" class="wh-150">
        <el-option v-for="(item, index) in projectType" :label="item.label" :value="item.value" :key="index"></el-option>
      </el-select> -->
      <span v-if="listQuery.orgType != 8">企业规模</span>
      <el-select v-if="listQuery.orgType != 8" v-model="listQuery.orgScale" placeholder="" size="mini" class="wh-150">
        <el-option label="全部" value="-1"></el-option>
        <el-option label="20人以下" value="0"></el-option>
        <el-option label="20~99人" value="1"></el-option>
        <el-option label="100~499人" value="2"></el-option>
        <el-option label="500~999人" value="3"></el-option>
        <el-option label="1000~4999人" value="4"></el-option>
        <el-option label="5000~9999人" value="5"></el-option>
        <el-option label="10000人以上" value="6"></el-option>
      </el-select>
      <span>{{ listQuery.orgType != 8 ? "管理员手机号码" : "手机号码" }}</span>
      <!-- type="number" oninput="if(value.length>11)value=value.slice(0, 11)" -->
      <el-input v-model="listQuery.telephone" :placeholder="listQuery.orgType != 8 ? '请输入管理员手机号码' : '请输入手机号码'" @input="telephoneInput"  size="mini" class="wh-150" maxlength="11"></el-input>
      <span>有效状态</span>
      <el-select v-model="listQuery.enableStatus" placeholder="" size="mini" class="wh-150">
        <el-option label="正常会员" value="-1"></el-option>
        <el-option label="已禁用" value="0"></el-option>
        <el-option label="付费会员" value="1"></el-option>
        <el-option label="普通会员" value="2"></el-option>
        <el-option label="已注销" value="5"></el-option>
      </el-select>
      <el-button type="primary" size="mini" icon="el-icon-search" class="ml-20 el-button-primary" @click="search">查询</el-button>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height: 82%; margin-top: 10px">
        <el-table ref="tables" :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="orgName" :label="orgName" min-width="130">
            <template slot-scope="{ row }">
              <div v-if="orgName != '劳务工人'">
                <div class="text-bnt" type="text" @click="organization(row)">{{ row.orgName }}</div>
              </div>
              <div v-else>{{ row.orgName }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" v-if="listQuery.orgType != 8" prop="orgScaleName" label="企业规模" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="telephone" :label="telephone" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createTime" label="系统注册时间" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="paidService" label="增值服务" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="paidServiceEndTime" label="有效期" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="statusName" label="有效状态" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="statusName" label="实名状态" min-width="80">
            <template slot-scope="{ row }">
              <span v-if="row.realNameStatus == '0'">未实名</span>
              <span v-if="row.realNameStatus == '1'">已实名</span>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" min-width="200">
            <template slot-scope="scope">
              <el-button type="primary" plain v-has="'system:pay:query'" size="mini" @click.native="examine(scope.row)">查看</el-button>
              <el-button type="danger" plain v-has="'system:pay:editStatus'" size="mini" v-if="scope.row.enableStatus == 1" @click.native="startCenter(scope.row)">禁用</el-button>
              <el-button type="success" plain v-has="'system:pay:editStatus'" size="mini" v-if="scope.row.enableStatus == 0" @click.native="startUsing(scope.row)">启用</el-button>
              <el-button size="mini" v-has="'system:pay:renewal'" plain type="success" v-if="scope.row.enableStatus != 3 && scope.row.enableStatus != 4 && scope.row.enableStatus != 5" @click="renewal(scope.row)">续期</el-button>
              <el-button type="primary" size="mini" plain v-if="scope.row.enableStatus == 3 || (scope.row.enableStatus == 4 && listQuery.orgType != 8)" v-show="scope.row.deregisterStatus != '1'" @click.native="certificationApproval(scope.row)">认证审批</el-button>
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
    <el-dialog :title="addTitle" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-radio-group v-model="diaRadio" size="mini" v-if="addTitle == '查看信息'" class="dialog-table">
        <el-radio-button label="1">{{ ruleForm.orgType == 8 ? "个人信息" : "企业信息" }}</el-radio-button>
        <el-radio-button label="2">续费记录</el-radio-button>
      </el-radio-group>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="dialog-form" v-if="diaRadio == 1">
        <el-row :span="24" class="el-row-data" :class="{ 'form-forbidden': forbidden }">
          <el-col :span="12">
            <el-form-item :label="ruleForm.orgType == 8 ? '用户名称' : '企业名称'" prop="orgName" label-width="95px">
              <el-input size="mini" v-model="ruleForm.orgName" :disabled="forbidden" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="ruleForm.orgType == 8 ? '用户类型' : '企业类型'" prop="orgType" label-width="95px">
              <el-select size="mini" v-model="ruleForm.orgType" :disabled="forbidden" placeholder="请选择" style="width: 100%" @change="orgTypeChange">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="listQuery.orgType != 8">
            <el-form-item label="企业简称" prop="shortName" label-width="95px">
              <el-input size="mini" v-model="ruleForm.shortName" :disabled="forbidden" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="listQuery.orgType != 8">
            <el-form-item label="企业规模" prop="orgScale" label-width="95px">
              <el-select size="mini" v-model="ruleForm.orgScale" :disabled="forbidden" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in userScaleDate" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="listQuery.orgType != 8">
            <el-form-item label="联系人" label-width="95px">
              <el-input size="mini" v-model="ruleForm.linkMan" :disabled="forbidden" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="listQuery.orgType != 8">
            <el-form-item label="手机号码" prop="linkPhone" label-width="95px">
              <el-input size="mini" v-model="ruleForm.linkPhone" :disabled="forbidden" autocomplete="off" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="listQuery.orgType == 8">
            <el-form-item :label="listQuery.orgType == 8 ? '手机号码' : '管理员手机'" label-width="95px">
              <el-input size="mini" v-model="ruleForm.telephone" :disabled="forbidden" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="listQuery.orgType == 8">
            <el-form-item label="注册时间" label-width="95px">
              <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" :disabled="forbidden" v-model="ruleForm.createTime" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="listQuery.orgType == 8">
            <el-form-item label="付费服务" label-width="95px">
              <el-select size="mini" v-model="realNameData.enableHightServer" :disabled="forbidden" placeholder="请选择" style="width: 100%">
                <el-option label="未开启" :value="0"></el-option>
                <el-option label="开启" :value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期时间" label-width="95px">
              <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" :disabled="forbidden" v-model="realNameData.endDateHightServer" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="listQuery.orgType != 8">
            <el-form-item label="管理员手机" label-width="95px">
              <el-input size="mini" v-model="ruleForm.telephone" :disabled="forbidden" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="ruleForm.orgType == 5 && listQuery.orgType != 8">
            <el-form-item label="施工单位" prop="fkParentOrgId" label-width="95px">
              <el-select size="mini" :disabled="forbidden" class="wh-200" v-model="ruleForm.fkParentOrgId">
                <el-option v-for="item in constructionUnits" :key="item.pkId" :value="item.pkId" :label="item.shortName"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="ruleForm.orgType == 5 && listQuery.orgType != 8">
            <el-form-item label="工程大类" prop="fkEnginerringTypeId" label-width="95px">
              <el-select size="mini" :disabled="forbidden" style="width: 100%" placeholder="请选择" v-model="ruleForm.fkEnginerringTypeId">
                <el-option v-for="item in projectType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <el-form-item label="认证信息" prop="authPhotoUrl" :label-width="formLabelWidth">
              <picture-upload :apiName="'getUploadFileToken'" :disabled="forbidden" :fileList="ruleForm.authPhotoUrl" :showUpload="showUpload" uploadTip="”uploadTip“" :limit="1" @onSuccess="onSuccess"></picture-upload>
            </el-form-item>
          </el-col> -->
        </el-row>

        <div style="height: 144px; border: 1px solid #ccc; text-align: center; border-radius: 5px" v-if="ruleForm.realNameStatus == '0'">
          <div v-if="listQuery.orgType != 8" style="font-size: 20px; font-weight: 800; color: #000; line-height: 140px">企业暂未实名验证</div>
          <div v-else style="font-size: 20px; font-weight: 800; color: #000; line-height: 140px">暂未实名验证</div>
        </div>
        <div v-else style="">
          <div style="font-size: 18px; font-weight: 800; color: #000; text-align: center">实名信息</div>
          <div class="auto-nym-box" v-if="listQuery.orgType != 8">
            <div class="auto-nym" v-if="realNameData.legalCardNum && realNameData.legalCardNum != null && realNameData.legalCardNum.length">
              <div style="font-size: 18px; font-weight: 800; color: #000; background: #f2f2f2; width: 50px; padding-top: 8%; text-align: center">
                <div>法</div>
                <div>人</div>
              </div>
              <div style="width: 100%; padding: 8px">
                <el-form-item label="法定代表人姓名" label-width="140px" width="">
                  <el-input size="mini" v-model="realNameData.legalRealName" disabled autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="法定代表人证件类型" label-width="140px" width="">
                  <el-select size="mini" v-model="realNameData.legalCertType" disabled placeholder="请选择" style="width: 100%">
                    <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
                    <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
                    <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
                    <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
                    <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="法定代表人证件号" label-width="140px" width="">
                  <el-input size="mini" v-model="realNameData.legalCardNum" disabled autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="法定代表人手机号码" label-width="140px" width="">
                  <el-input size="mini" v-model="realNameData.legalTelephone" disabled autocomplete="off"></el-input>
                </el-form-item>
              </div>
            </div>
            <div class="auto-nym" v-if="realNameData.handledCardNum && realNameData.handledCardNum != null && realNameData.handledCardNum.length">
              <div style="font-size: 18px; font-weight: 800; color: #000; background: #f2f2f2; width: 50px; padding-top: 8%; text-align: center">
                <div>经</div>
                <div>办</div>
                <div>人</div>
              </div>
              <div style="width: 100%; padding: 8px">
                <el-form-item label="经办人姓名" label-width="140px" width="">
                  <el-input size="mini" v-model="realNameData.handledRealName" disabled autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="经办人证件类型" label-width="140px" width="">
                  <el-select size="mini" v-model="realNameData.handledCertType" disabled placeholder="请选择" style="width: 100%">
                    <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
                    <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
                    <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
                    <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
                    <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="经办人证件号" label-width="140px" width="">
                  <el-input size="mini" v-model="realNameData.handledCardNum" disabled autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="经办人手机号码" label-width="140px" width="">
                  <el-input size="mini" v-model="realNameData.handledTelephone" disabled autocomplete="off"></el-input>
                </el-form-item>
              </div>
            </div>
          </div>
          <div v-else style="border: 1px dashed #666; padding: 8px">
            <el-row :span="24" class="el-row-data" :class="{ 'form-forbidden': forbidden }">
              <el-col :span="12">
                <el-form-item label="个人姓名" label-width="110px" width="">
                  <el-input size="mini" v-model="realNameData.userName" disabled autocomplete="off"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="个人证件类型" label-width="110px" width="">
                  <el-select size="mini" v-model="realNameData.certType" disabled placeholder="请选择" style="width: 100%">
                    <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
                    <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
                    <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
                    <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
                    <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="个人证件号" label-width="110px" width="">
                  <el-input size="mini" v-model="realNameData.cardNum" disabled autocomplete="off"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号码" label-width="110px" width="">
                  <el-input size="mini" v-model="realNameData.telephone" disabled autocomplete="off"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form>
      <div class="table-data h-400" v-if="diaRadio == 2">
        <el-table ref="tables" :data="realNameData.approvalMatterVos" stripe height="100%" style="width: 100%" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column align="center" label="序号" type="index"> </el-table-column>
          <el-table-column align="center" prop="createTime" label="申请时间" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="expireTime" label="到期日期" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="renewalDate" label="续租至" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createUser" label="申请人" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approver" label="审批人" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveTime" label="审批时间" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveStatus" label="状态">
            <template slot-scope="{ row }">
              <!-- 0：审批中 1：审批通过 2：审批不通过 -->
              {{ row.approveStatus == 0 ? "审批中" : row.approveStatus == 1 ? "审批通过" : row.approveStatus == 2 ? "审批不通过" : "" }}
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" width="200">
            <template slot-scope="scope">
              <el-button type="primary" plain size="mini" @click.native="openRenewal(scope.row)">查看</el-button>
              <el-button type="danger" plain size="mini" @click.native="recall(scope.row)" v-if="scope.row.approveStatus == 0">撤回</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无续费记录</span>
          </div>
        </el-table>
      </div>
      <div style="height: 5px"></div>
      <div slot="footer" class="dialog-footer" v-if="showType == 1">
        <el-button size="mini" @click="show1 = false">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="submitForm('ruleForm')">保 存</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-if="showType == 2">
        <el-button size="mini" type="primary" class="el-button-primary" @click="durch">审批通过</el-button>
        <el-button size="mini" type="danger" @click="certificationNo">审批不通过</el-button>
        <el-button size="mini" @click="show1 = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="renewalTitle" width="500px" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false" @close="close2" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="renewForm" ref="renewForm" :rules="rules" class="dialog-form">
        <el-form-item label="用户名称" prop="orgName" label-width="95px">
          <el-input size="mini" v-model="renewForm.orgName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="loginName" label-width="95px">
          <el-input size="mini" v-model="renewForm.loginName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="续租至" prop="time" label-width="95px">
          <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" :disabled="show2Type == 2" v-model="renewForm.time" type="date" placeholder="选择日期" :picker-options="pickerOptionsEnd"></el-date-picker>
        </el-form-item>
        <el-form-item label="续租凭证" prop="certificate" label-width="95px">
          <picture-upload size="mini" :apiName="'getUploadFileToken'" :fileList="renewForm.certificate" :showUpload="showUpload" uploadTip="”uploadTip“" :limit="2" @onSuccess="onSuccessa"></picture-upload>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" v-if="renewalTitle == '续期审批'" label-width="95px">
          <el-input size="mini" v-model="renewForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="showType == 4" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="show2Type == 1">
        <el-button size="mini" @click="close2">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="renewalSubmission('renewForm')">保 存</el-button>
      </div>
      <div slot="footer" class="dialog-footer" v-if="show2Type == 2">
        <el-button size="mini" type="primary" class="el-button-primary" @click="auditPass('renewForm')">审批通过</el-button>
        <el-button size="mini" type="danger" @click="auditFailed('renewForm')">审批不通过</el-button>
        <el-button size="mini" @click="show2 = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="chargeMode" width="80%" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="tab-container" style="margin-top: 12px">
        <div class="charge-bitton">
          <el-button type="primary" size="mini" class="search-mr el-button-primary" v-has="'system:charging:add'" @click="addCharge">新增收费模式</el-button>
        </div>
        <el-table :data="chargeModeData" border height="500px" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (params.pageNum - 1) * params.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="roleTypeName" label="系统角色" min-width="100"></el-table-column>
          <el-table-column align="center" prop="paidService" label="基本费用" min-width="90" show-overflow-tooltip>
            <template slot-scope="scope"> {{ scope.row.chargeMoney }}/月 </template>
          </el-table-column>
          <el-table-column align="center" prop="paidServiceEndTime" label="结算费用" min-width="80">
            <template slot-scope="scope">
              <div v-for="(item, idx) in scope.row.chargingDetails" :key="idx" show-overflow-tooltip>
                <span v-if="item.benginAmount != 0">{{ item.benginAmount }}万元~</span>{{ item.endAmount }}万元 按{{ item.chargeRate }}%计算
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="remark" label="备注" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column prop="alarmLevel" align="center" label="操作" min-width="150">
            <template slot-scope="scope">
              <el-button size="mini" v-has="'system:charging:query'" @click.native="examineCharge(scope.row)">查看</el-button>
              <el-button type="primary" class="el-button-primary" v-has="'system:charging:edit'" size="mini" @click.native="editCharge(scope.row)">编辑</el-button>
              <el-button type="danger" v-has="'system:charging:delete'" size="mini" @click.native="deleteCharge(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="params.pageNum" :page-size="params.pageSize" :total="modetotalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
      </div>
    </el-dialog>
    <el-dialog :title="chargeShowTitle" :visible.sync="chargeShow" width="500px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="charge-box dialog-form">
        <el-form :model="form" :rules="rules" ref="chargeShowForm" :hide-required-asterisk="false" style="padding-top: 20px; padding-bottom: 20px; padding-left: 0">
          <el-form-item label="系统角色" prop="roleType" label-width="80px">
            <el-select v-model="form.roleType" placeholder="请选择" style="width: 100%" size="mini" :disabled="chargeShowTitle == '查看收费模式' || chargeShowTitle == '编辑收费模式'">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="基本月费" prop="chargeMoney" label-width="80px">
            <el-input v-model="form.chargeMoney" type="number" size="mini" @keydown.native="keyDown($event, 1)" :disabled="chargeShowTitle == '查看收费模式'" @input="oninput" autocomplete="off">
              <template slot="append">元/月</template>
            </el-input>
          </el-form-item>
          <el-form-item label="结算费用" label-width="80px">
            <el-row v-for="(item, idx) in form.chargingDetailAdds" :key="idx">
              <el-col :span="8">
                <el-col :span="14">
                  <el-form-item prop="benginAmount" class="chargeRate-input">
                    <el-input v-model="item.benginAmount" :disabled="chargeShowTitle == '查看收费模式'" type="number" size="mini" @keydown.native="keyDown($event, 1)" @input="oninput" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="9" style="text-align: center">万元~</el-col>
              </el-col>
              <el-col :span="7">
                <el-col :span="16">
                  <el-form-item prop="endAmount" class="chargeRate-input">
                    <el-input v-model="item.endAmount" :disabled="chargeShowTitle == '查看收费模式'" type="number" size="mini" @keydown.native="keyDown($event, 1)" @input="oninput" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8" style="text-align: center">万元</el-col>
              </el-col>
              <el-col :span="9">
                <el-col :span="3" style="text-align: center">收</el-col>
                <el-col :span="12">
                  <el-form-item prop="chargeRate" class="chargeRate-input">
                    <el-input @input="oninput2($event, idx)" v-model="item.chargeRate" :disabled="chargeShowTitle == '查看收费模式'" type="number" size="mini" @keydown.native="keyDown($event, 1)" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="9" style="text-align: center"
                  >%
                  <el-button style="margin: 0; padding: 0" size="mini" icon="el-icon-plus" circle v-if="idx == 0 && chargeShowTitle != '查看收费模式'" @click.native="addClearing"></el-button>
                  <el-button style="margin: 0; padding: 0" type="danger" size="mini" icon="el-icon-minus" circle v-if="idx != 0 && chargeShowTitle != '查看收费模式'" @click.native="removeClearing(idx)"></el-button>
                </el-col>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="备注" prop="chargeMoney" label-width="80px">
            <el-input v-model="form.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="chargeShowTitle == '查看收费模式'" placeholder="请输入内容" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: right" v-if="chargeShowTitle != '查看收费模式'">
        <el-button type="info" size="mini" @click="chargeShow = false">取 消</el-button>
        <el-button type="primary" class="el-button-primary" size="mini" @click="submit('chargeShowForm')">保 存</el-button>
      </div>
    </el-dialog>
    <organizationEdit :materDialog.sync="materDialog" @updateMaterDialog="updateMaterDialog" :userNum="userNum"> </organizationEdit>
    <el-dialog title="续期" width="500px" :visible.sync="renewalShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form ref="rowDataForm" class="dialog-form form-forbidden" style="padding-bottom: 8px">
        <el-form-item label="用户名称" prop="accountName" :label-width="formLabelWidth">
          <el-input size="mini" v-model="rowDataForm.accountName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="telephone" :label-width="formLabelWidth">
          <el-input size="mini" v-model="rowDataForm.telephone" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号类型" prop="loginName" :label-width="formLabelWidth">
          <el-input size="mini" v-model="rowDataForm.orgTypeName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="续租至" prop="time" :label-width="formLabelWidth">
          <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" disabled v-model="rowDataForm.renewalDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="续租凭证" prop="certificate" :label-width="formLabelWidth">
          <picture-upload style="margin-bottom: 10px" :apiName="'getUploadFileToken'" disabled :fileList="rowDataForm.proofUrl" :showUpload="false" uploadTip="”uploadTip“" :limit="2"></picture-upload>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" :label-width="formLabelWidth">
          <el-input size="mini" v-model="rowDataForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" disabled autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import pictureUpload from "@/components/pictureUpload";
import organizationEdit from "./compomemts/user.vue";
import moment from "moment";
export default {
  name: "payList",
  components: {
    pictureUpload,
    organizationEdit
  },
  data() {
    return {
      searchOptions: [
        {
          type: "input",
          prop: "orgName",
          value: "",
          title: "供应商名称",
          placeholder: "",
          maxlength: "50"
        },
        {
          type: "select",
          prop: "orgScale",
          value: "-1",
          title: "企业规模",
          placeholder: "请选择",
          options: [
            {
              value: "-1",
              label: "全部"
            },
            {
              value: "0",
              label: "20人以下"
            },
            {
              value: "1",
              label: "20~99人"
            },
            {
              value: "2",
              label: "100~499人"
            },
            {
              value: "3",
              label: "500~999人"
            },
            {
              value: "4",
              label: "1000~4999人"
            },
            {
              value: "5",
              label: "5000~9999人"
            },
            {
              value: "6",
              label: "10000人以上"
            }
          ]
        },
        {
          type: "inputPhone",
          prop: "telephone",
          value: "",
          title: "管理员手机号码",
          placeholder: "手机号码"
        },
        {
          type: "select",
          prop: "enableStatus",
          value: "-1",
          title: "有效状态",
          placeholder: "请选择有效状态",
          options: [
            {
              value: "-1",
              label: "全部"
            },
            {
              value: "0",
              label: "禁用"
            },
            {
              value: "1",
              label: "正常"
            },
            {
              value: "2",
              label: "已过期"
            },
            {
              value: "5",
              label: "已注销"
            }
          ]
        }
      ],
      totalCount: 0,
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        orgType: "6",
        orgScale: "-1",
        enableStatus: "-1",
        telephone: "",
        orgName: ""
      },
      tableData: [],
      maxHeight: 0,
      show1: false,
      formLabelWidth: "110px",
      ruleForm: {
        // 新增弹窗参数
        orgName: null, // 企业名称
        orgType: null, // 企业类型
        shortName: null, // 企业简称
        orgScale: null, // 企业规模
        linkMan: null, // 联系人
        linkPhone: null, // 手机号
        expireTime: "", // 到期时间
        telephone: null, // 管理员手机
        loginName: null, // 管理员账号
        authPhotoUrl: [], // 认证图片
        fkEnginerringTypeId: "", // 工程类型
        fkParentOrgId: "", // 施工单位
        endDateHightServer: ""
      },
      renewForm: {
        // 续费弹窗参数
        orgName: null,
        loginName: null,
        remark: null,
        name: null,
        conservator: null,
        time: "",
        certificate: [],
        opinion: null
      },
      addTitle: "新增单位工程分类",
      rules: {
        orgName: [
          {
            required: true,
            message: "企业名称",
            trigger: ["change", "blur"]
          }
        ],
        orgType: [
          {
            required: true,
            message: "企业类型",
            trigger: ["change", "blur"]
          }
        ],
        shortName: [
          {
            required: true,
            message: "企业简称",
            trigger: ["change", "blur"]
          }
        ],
        orgScale: [
          {
            required: true,
            message: "企业规模",
            trigger: ["change", "blur"]
          }
        ],
        linkMan: [
          {
            required: true,
            message: "联系人",
            trigger: ["change", "blur"]
          }
        ],
        linkPhone: [
          {
            required: true,
            validator: this.$rules.checkPhone,
            trigger: ["change", "blur"]
          }
        ],
        expireTime: [
          {
            required: true,
            message: "到期时间",
            trigger: ["change", "blur"]
          }
        ],
        telephone: [
          {
            required: true,
            validator: this.$rules.checkPhone,
            trigger: ["change", "blur"]
          }
        ],
        loginName: [
          {
            required: true,
            message: "管理员账号",
            trigger: ["change", "blur"]
          }
        ],
        authPhotoUrl: [
          {
            required: true,
            message: "认证图片",
            trigger: ["change", "blur"]
          }
        ],
        time: [
          {
            required: true,
            message: "续租截止时间",
            trigger: ["change", "blur"]
          }
        ],
        remark: [
          {
            required: true,
            message: "审批意见",
            trigger: ["change", "blur"]
          }
        ],
        fkEnginerringTypeId: [
          {
            required: true,
            message: "工程大类",
            trigger: ["change", "blur"]
          }
        ],
        fkParentOrgId: [
          {
            required: true,
            message: "施工单位",
            trigger: ["change", "blur"]
          }
        ],
        certificate: [
          {
            required: true,
            message: "续期凭证",
            trigger: ["change", "blur"]
          }
        ]
      },
      showType: null,
      show2: false,
      options: [
        {
          value: "6",
          label: "供应商"
        },
        {
          value: "7",
          label: "分包单位"
        },
        {
          value: "8",
          label: "劳务工人"
        }
      ],
      userScaleDate: [
        {
          value: "0",
          label: "20人以下"
        },
        {
          value: "1",
          label: "20~99人"
        },
        {
          value: "2",
          label: "100~499人"
        },
        {
          value: "3",
          label: "500~999人"
        },
        {
          value: "4",
          label: "1000~4999人"
        },
        {
          value: "5",
          label: "5000~9999人"
        },
        {
          value: "6",
          label: "10000人以上"
        }
      ],
      dialogImageUrl: "",
      dialogVisible: false,
      newManageForm: [],
      renewalTitle: "",
      show2Type: 1,
      rowDate: {},
      forbidden: false,
      imageUrl: "",
      projectType: [], // 工程类型
      constructionUnits: [], // 施工单位
      showUpload: true, // 控制图片是否可以移除,
      showUploads: true,
      loading: false,
      orgName: "供应商名称",
      loginName: "管理员账号",
      telephone: "管理员手机号码",
      chargeMode: false,
      chargeModeData: [],
      params: {
        pageNum: 1,
        pageSize: 10
      },
      modetotalCount: 0,
      chargeShow: false,
      chargeShowTitle: "新增收费模式",
      form: {
        chargeMoney: null, // 基本月费
        roleType: null, // 系统类型
        chargingDetailAdds: [{ benginAmount: null, endAmount: null, chargeRate: null }], // 收费明细集
        remark: null
      },
      realName: "1",
      realNameData: {
        legalCardNum: "",
        handledCardNum: ""
      },
      materDialog: false,
      userNum: "",
      newAddList: [],
      delList: [],
      diaRadio: "1",
      approvalMatterVos: [],
      renewalShow: false,
      rowDataForm: {},
      searchShow: true,
      pickerOptionsEnd: {
        disabledDate: time => {
          return Date.now() - 24 * 60 * 60 * 1000 >  time.getTime();
        }
      },
    }
  },
  mounted() {
    this.getOrgPageList();
    this.searchTypeList();
    this.getConstructionUnitList();
  },
  watch: {
    show2(val) {
      console.log(val);
      if (!val) {
        this.delFiles();
      }
    }
  },
  methods: {
    telephoneInput(val) {
      let value = this.$limitPhone2(val)
      this.listQuery.telephone = value
      if (value.length == 11) {
        const verify = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!verify.test(value)) {
          this.$message({ message: "请输入正确的手机号码", type: "error" });
          return;
        }
        // this.$api.byTelephone({ telephone: value, sourceType: 2 }).then(res => {
        //   if (res.data.length) {
        //     this.codeStatus = true;
        //   } else {
        //     this.codeStatus = false;
        //     (this.form.code = ""), (this.uuid = "");
        //   }
        // });
      }
    },
    close2() {
      this.delList = [];
      this.show2 = false;
    },
    updateMaterDialog() {
      this.materDialog = false;
    },
    organization(row) {
      this.userNum = row.pkId;
      this.materDialog = true;
    },
    deleteCharge(row) {
      const _this = this;
      _this
        .$confirm("确定删除该收费模式？", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          const modeId = row.pkId;
          _this.$api.delChargingModeById({ modeId }).then(resp => {
            if (resp.code == 200) {
              _this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.getChargingModePageList(this.params);
            } else {
              _this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    editCharge(row) {
      this.chargeShowTitle = "编辑收费模式";
      this.form.chargeMoney = row.chargeMoney;
      this.form.roleType = row.roleType + "";
      this.form.remark = row.remark;
      const arr = [];
      row.chargingDetails.forEach(item => {
        arr.push({ benginAmount: item.benginAmount, chargeRate: item.chargeRate, endAmount: item.endAmount });
      });
      this.form.chargingDetailAdds = arr;
      this.chargeShow = true;
      this.form.pkId = row.pkId;
    },
    examineCharge(row) {
      this.chargeShowTitle = "查看收费模式";
      this.form.chargeMoney = row.chargeMoney;
      this.form.remark = row.remark;
      this.form.roleType = row.roleType + "";
      this.form.chargingDetailAdds = row.chargingDetails;
      this.chargeShow = true;
      // console.log(row);
    },
    addClearing() {
      this.form.chargingDetailAdds.push({ benginAmount: null, endAmount: null, chargeRate: null });
    },
    removeClearing(idx) {
      this.form.chargingDetailAdds.splice(idx, 1);
    },
    // 提交
    submit() {
      this.$refs.chargeShowForm.validate(valid => {
        if (valid) {
          let status = false;
          this.form.chargingDetailAdds.forEach((item, idx) => {
            if (idx != 0) {
              if (this.form.chargingDetailAdds[idx].benginAmount < this.form.chargingDetailAdds[idx - 1].endAmount) {
                this.$message.warning("下级开始金额不能小于上级结束金额");
                status = true;
              }
            } else if (item.endAmount == null || item.benginAmount == null || item.chargeRate == null) {
              status = true;
              this.$message.warning("结算费用不能为空");
            } else if (item.endAmount.length == 0 || item.benginAmount.length == 0 || item.chargeRate.length == 0) {
              status = true;
              this.$message.warning("结算费用不能为空");
            } else if (item.endAmount < item.benginAmount) {
              status = true;
              this.$message.warning("开始费用不能大于结束费用");
            } else if (item.endAmount == item.benginAmount) {
              status = true;
              this.$message.warning("开始结束费用不能一致");
            }
          });
          if (status) {
            return;
          }
          if (this.chargeShowTitle == "编辑收费模式") {
            const data = {
              chargeMoney: this.form.chargeMoney,
              pkId: this.form.pkId,
              chargingDetailUpdates: this.form.chargingDetailAdds,
              remark: this.form.remark
            };

            this.$api.editChargingMode(data).then(res => {
              if (res.code == 200) {
                this.$message.success("编辑成功");
                this.getChargingModePageList(this.params);
                this.chargeShow = false;
              } else {
                this.$message.warning(res.msg);
              }
            });
          } else {
            this.$api.addChargingMode(this.form).then(res => {
              if (res.code == 200) {
                this.$message.success("新增成功");
                this.getChargingModePageList(this.params);
                this.chargeShow = false;
              } else {
                this.$message.warning(res.msg);
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    addCharge() {
      this.form = {
        chargeMoney: null, // 基本月费
        roleType: null, // 系统类型
        chargingDetailAdds: [{ benginAmount: null, endAmount: null, chargeRate: null }], // 收费明细集
        remark: null
      };
      this.chargeShow = true;
      this.chargeShowTitle = "新增收费模式";
    },
    setChargingMode() {
      this.chargeMode = true;
      this.getChargingModePageList(this.params);
    },
    getChargingModePageList(data) {
      const self = this;
      self.loading = true;
      (async data => {
        const res = await self.$api.getChargingModePageList(data);

        if (res && res.code == 200) {
          const options = {
            1: "代理商",
            2: "建设单位",
            3: "监理公司",
            4: "施工单位",
            5: "项目部",
            6: "供应商",
            7: "分包单位",
            8: "劳务工人",
            9: "设计院"
          };
          res.data.records.forEach(item => {
            item.roleTypeName = options[item.roleType];
          });
          this.chargeModeData = res.data.records;
          this.modetotalCount = parseInt(res.data.total);
          self.loading = false;
        } else {
          self.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      })(data);
    },
    typeChange(item) {
      this.orgName = item.label;
      let val = item.name;
      // if (val == 6) {
      //   this.searchOptions = [
      //     {
      //       type: "input",
      //       prop: "orgName",
      //       value: "",
      //       title: "供应商名称",
      //       placeholder: "",
      //       maxlength: "50"
      //     },
      //     {
      //       type: "select",
      //       prop: "orgScale",
      //       value: "-1",
      //       title: "企业规模",
      //       placeholder: "请选择",
      //       clearable:false,
      //       options: [
      //         {
      //           value: "-1",
      //           label: "全部"
      //         },
      //         {
      //           value: "0",
      //           label: "20人以下"
      //         },
      //         {
      //           value: "1",
      //           label: "20~99人"
      //         },
      //         {
      //           value: "2",
      //           label: "100~499人"
      //         },
      //         {
      //           value: "3",
      //           label: "500~999人"
      //         },
      //         {
      //           value: "4",
      //           label: "1000~4999人"
      //         },
      //         {
      //           value: "5",
      //           label: "5000~9999人"
      //         },
      //         {
      //           value: "6",
      //           label: "10000人以上"
      //         }
      //       ]
      //     },
      //     {
      //       type: "inputPhone",
      //       prop: "telephone",
      //       value: "",
      //       title: "管理员手机号码",
      //       placeholder: "手机号码"
      //     },
      //     {
      //       type: "select",
      //       prop: "enableStatus",
      //       value: "-1",
      //       title: "有效状态",
      //       placeholder: "请选择有效状态",
      //       options: [
      //         {
      //           value: "-1",
      //           label: "全部"
      //         },
      //         {
      //           value: "0",
      //           label: "禁用"
      //         },
      //         {
      //           value: "1",
      //           label: "正常"
      //         },
      //         {
      //           value: "2",
      //           label: "已过期"
      //         },
      //         {
      //           value: "5",
      //           label: "已注销"
      //         }
      //       ]
      //     }
      //   ];
      //   // this.searchOptions[0].title = "供应商名称";
      //   this.orgName = "供应商名称";
      //   this.loginName = "管理员账号";
      //   this.telephone = "管理员手机号码";
      //   // this.searchOptions[3].options = [
      //   //   {
      //   //     value: "-1",
      //   //     label: "全部"
      //   //   },
      //   //   {
      //   //     value: "0",
      //   //     label: "禁用"
      //   //   },
      //   //   {
      //   //     value: "1",
      //   //     label: "正常"
      //   //   },
      //   //   {
      //   //     value: "2",
      //   //     label: "已过期"
      //   //   },
      //   //   {
      //   //     value: "5",
      //   //     label: "已注销"
      //   //   }
      //   // ];
      // } else if (val == 7) {
      //   this.searchOptions = [
      //     {
      //       type: "input",
      //       prop: "orgName",
      //       value: "",
      //       title: "分包单位名称",
      //       placeholder: "",
      //       maxlength: "50"
      //     },
      //     {
      //       type: "select",
      //       prop: "orgScale",
      //       value: "-1",
      //       title: "企业规模",
      //       placeholder: "请选择",
      //       options: [
      //         {
      //           value: "-1",
      //           label: "全部"
      //         },
      //         {
      //           value: "0",
      //           label: "20人以下"
      //         },
      //         {
      //           value: "1",
      //           label: "20~99人"
      //         },
      //         {
      //           value: "2",
      //           label: "100~499人"
      //         },
      //         {
      //           value: "3",
      //           label: "500~999人"
      //         },
      //         {
      //           value: "4",
      //           label: "1000~4999人"
      //         },
      //         {
      //           value: "5",
      //           label: "5000~9999人"
      //         },
      //         {
      //           value: "6",
      //           label: "10000人以上"
      //         }
      //       ]
      //     },
      //     {
      //       type: "inputPhone",
      //       prop: "telephone",
      //       value: "",
      //       title: "管理员手机号码",
      //       placeholder: "手机号码"
      //     },
      //     {
      //       type: "select",
      //       prop: "enableStatus",
      //       value: "-1",
      //       title: "有效状态",
      //       placeholder: "请选择有效状态",
      //       clearable:false,
      //       options: [
      //         {
      //           value: "-1",
      //           label: "全部"
      //         },
      //         {
      //           value: "0",
      //           label: "禁用"
      //         },
      //         {
      //           value: "1",
      //           label: "正常"
      //         },
      //         {
      //           value: "2",
      //           label: "已过期"
      //         },
      //         {
      //           value: "5",
      //           label: "已注销"
      //         }
      //       ]
      //     }
      //   ];
      //   this.searchOptions[0].title = "分包单位名称";
      //   this.orgName = "分包单位名称";
      //   this.loginName = "管理员账号";
      //   this.telephone = "管理员手机号码";
      //   // this.searchOptions[3].options = [
      //   //   {
      //   //     value: "-1",
      //   //     label: "全部"
      //   //   },
      //   //   {
      //   //     value: "0",
      //   //     label: "禁用"
      //   //   },
      //   //   {
      //   //     value: "1",
      //   //     label: "正常"
      //   //   },
      //   //   {
      //   //     value: "2",
      //   //     label: "已过期"
      //   //   },
      //   //   {
      //   //     value: "5",
      //   //     label: "已注销"
      //   //   }
      //   // ];
      // } else if (val == 8) {
      //   this.searchOptions = [
      //     {
      //       type: "input",
      //       prop: "orgName",
      //       value: "",
      //       title: "劳务工人",
      //       placeholder: "",
      //       maxlength: "50"
      //     },
      //     {
      //       type: "inputPhone",
      //       prop: "telephone",
      //       value: "",
      //       title: "手机号码",
      //       placeholder: "手机号码"
      //     },
      //     {
      //       type: "select",
      //       prop: "enableStatus",
      //       value: "-1",
      //       title: "有效状态",
      //       placeholder: "请选择有效状态",
      //       clearable:false,
      //       options: [
      //         {
      //           value: "-1",
      //           label: "全部"
      //         },
      //         {
      //           value: "0",
      //           label: "禁用"
      //         },
      //         {
      //           value: "1",
      //           label: "正常"
      //         }
      //       ]
      //     }
      //   ];
      //   // this.searchOptions[0].title = "劳务工人";
      //   this.orgName = "劳务工人";
      //   this.loginName = "账号";
      //   this.telephone = "手机号码";
      //   // this.searchOptions[2].options = [
      //   //   {
      //   //     value: "-1",
      //   //     label: "全部"
      //   //   },
      //   //   {
      //   //     value: "0",
      //   //     label: "禁用"
      //   //   },
      //   //   {
      //   //     value: "1",
      //   //     label: "正常"
      //   //   }
      //   // ];
      // }
      this.listQuery = {
        pageNum: 1,
        pageSize: 10,
        orgType: val,
        orgScale: "-1",
        enableStatus: "-1",
        telephone: "",
        orgName: ""
      };
      // console.log("111111111")
      // console.log(this.searchOptions)
      // console.log("111111111")

      this.searchShow = false;

      this.listQuery.pageNum = 1;
      this.$nextTick(() => {
        this.searchShow = true;
        this.$nextTick(() => {
          // this.$refs.searchBar.payReset();
          this.getOrgPageList();
          // this.$nextTick(()=>{

          // })
        });
      });
    },
    orgTypeChange(v) {
      if (v == 5) {
        this.getConstructionUnitList();
      }
    },
    getConstructionUnitList() {
      this.$api.getConstructionUnitList().then(res => {
        if (res.code == 200) {
          this.constructionUnits = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 获取工程类型数据
    searchTypeList() {
      this.$api.searchTypeList().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
          });
          this.projectType = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    getOrgPageList() {
      this.loading = true;
      this.$api.getOrgPageList(this.listQuery).then(res => {
        if (res.code == 200) {
          const options = {
            0: "禁用",
            1: "启用",
            2: "已过期",
            3: "待认证",
            4: "审核不通过",
            5: "已注销"
          };
          const type0ptions = {
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
          const user0ptions = {
            0: "20人以下",
            1: "20~99人",
            2: "100~499人",
            3: "500~999人",
            4: "1000~4999人",
            5: "5000~9999人",
            6: "10000人以上"
          };
          const paidList = {
            0: "未开启",
            1: "已开启"
          };
          res.data.records.forEach(item => {
            item.statusName = options[item.enableStatus];
            item.orgTypeName = type0ptions[item.orgType];
            item.orgScaleName = user0ptions[item.orgScale];
            item.paidService = paidList[item.paidService];
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
    // 查询
    search() {
      // if (form.telephone != undefined) {
      //   this.listQuery.telephone = form.telephone;
      // } else {
      //   this.listQuery.telephone = "";
      // }
      // if (form.orgName != undefined) {
      //   this.listQuery.orgName = form.orgName;
      // } else {
      //   this.listQuery.orgName = "";
      // }
      // this.listQuery.enableStatus = form.enableStatus;
      // this.listQuery.orgScale = form.orgScale;
      // this.listQuery.orgType = form.orgType;
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = 10;
      // Object.assign(newObj,user,page);
      this.getOrgPageList();
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.getOrgPageList();
      this.$nextTick(() => {
        this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      });
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.getOrgPageList();
      this.$nextTick(() => {
        this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      });
    },
    // 查看
    examine(row) {
      this.show1 = true;
      this.diaRadio = "1";
      this.showType = 3;
      this.addTitle = "查看信息";
      this.showUpload = false;
      const date = JSON.stringify(row);
      const rowDate = JSON.parse(date);
      rowDate.orgType = rowDate.orgType + "";
      rowDate.orgScale = rowDate.orgScale + "";
      const url = rowDate.authPhotoUrl;
      this.ruleForm = rowDate;
      this.forbidden = true;
      this.ruleForm.authPhotoUrl = [];
      this.ruleForm.authPhotoUrl.push(url);
      this.realName = "1";
      console.log(this.ruleForm);
      if (row.orgType == 8) {
        this.$api.findsysUserById({ pkId: row.pkId }).then(res => {
          if (res.code == 200) {
            this.realNameData = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.$api.getInfoByOrgId({ orgId: row.pkId }).then(res => {
          if (res.code == 200) {
            // console.log(res);
            this.realNameData = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    // 禁用
    startCenter(row) {
      const _this = this;
      _this
        .$confirm("确定禁用该用户登录系统权限？?", "禁用确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          const data = {
            orgId: row.pkId,
            enableStatus: 0
          };
          this.$api.editUseTypeById(data).then(res => {
            if (res.code == 200) {
              _this.$message({
                type: "success",
                message: "禁用成功"
              });
              this.getOrgPageList();
            } else {
              _this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 启用
    startUsing(row) {
      const _this = this;
      _this
        .$confirm("确定启用该用户登录系统权限?", "启用确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          const data = {
            orgId: row.pkId,
            enableStatus: 1
          };
          this.$api.editUseTypeById(data).then(res => {
            if (res.code == 200) {
              this.getOrgPageList();
              _this.$message({
                type: "success",
                message: "启用成功"
              });
            } else {
              _this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 认证审批
    certificationApproval(row) {
      this.show1 = true;
      this.diaRadio = "1";
      this.showType = 2;
      this.addTitle = "认证审批";
      this.rowDate = row;
      row.orgType = row.orgType.toString();
      row.orgScale = row.orgScale.toString();
      this.ruleForm = row;
      const url = row.authPhotoUrl;
      this.forbidden = true;
      this.ruleForm.authPhotoUrl = [];
      this.ruleForm.authPhotoUrl.push(url);
      this.showUpload = false;
    },
    formRest() {
      this.ruleForm = {
        // 新增弹窗参数
        orgName: null, // 企业名称
        orgType: null, // 企业类型
        shortName: null, // 企业简称
        orgScale: null, // 企业规模
        linkMan: null, // 联系人
        linkPhone: null, // 手机号
        expireTime: "", // 到期时间
        telephone: null, // 管理员手机
        loginName: null, // 管理员账号
        authPhotoUrl: [], // 认证图片
        fkEnginerringTypeId: "", // 工程类型
        fkParentOrgId: "" // 施工单位
      };
    },
    // 续期
    renewal(row) {
      if (this.$refs.renewForm != undefined) {
        this.$refs.renewForm.resetFields();
      }
      console.log(row);
      this.show2 = true;
      this.show2Type = 1;
      this.renewalTitle = "续期";
      this.renewForm.orgName = row.orgName;
      this.renewForm.loginName = row.loginName;
      this.renewForm.pkId = row.pkId;
      this.renewForm.orgType = row.orgType;
      this.forbidden = false;
      this.showUploads = true;
    },
    // 续期审核
    renewalAudit(row) {
      this.show2 = true;
      this.show2Type = 2;
      this.renewalTitle = "续期审批";
      console.log(row);
      this.forbidden = true;
      this.renewForm.certificate = [];
      this.renewForm.certificate.push(row.proofUrl);
      this.showUpload = false;
      this.renewForm.time = row.renewalTime;
      this.renewForm.orgName = row.orgName;
      this.renewForm.loginName = row.loginName;
      this.renewForm.pkId = row.renewalId;
      // if (this.listQuery.orgType != 8) {
      //   this.$api.getInfoByOrgId({ orgId: row.pkId }).then(res => {
      //     if (res.code == 200) {
      //       const row = res.data;
      //       const url = row.proofUrl;
      //       this.forbidden = true;
      //       this.renewForm.certificate = [];
      //       this.renewForm.certificate.push(url);
      //       this.showUpload = false;
      //       this.renewForm.time = res.data.renewalTime;
      //       this.renewForm.orgName = res.data.orgName;
      //       this.renewForm.loginName = res.data.loginName;
      //       this.renewForm.pkId = res.data.renewalId;
      //     } else {
      //       this.$message({
      //         type: "error",
      //         message: res.msg
      //       });
      //     }
      //   });
      // } else {
      //   this.$api.getUserInfoById({ userId: row.pkId }).then(res => {
      //     if (res.code == 200) {
      //       const row = res.data;
      //       const url = row.proofUrl;
      //       this.forbidden = true;
      //       this.renewForm.certificate = [];
      //       this.renewForm.certificate.push(url);
      //       this.showUpload = false;
      //       this.renewForm.time = res.data.renewalTime;
      //       this.renewForm.orgName = res.data.userName;
      //       this.renewForm.loginName = res.data.loginName;
      //       this.renewForm.pkId = res.data.renewalId;
      //     } else {
      //       this.$message({
      //         type: "error",
      //         message: res.msg
      //       });
      //     }
      //   });
      // }
    },
    onSuccess(item) {
      this.ruleForm.authPhotoUrl = item;
    },
    onSuccessa(item) {
      if (item) {
        this.newAddList.push(item[0]);
      } else {
        this.delList.push(this.renewForm.certificate[0]);
      }
      this.renewForm.certificate = item;
    },
    delFiles() {
      let urls = [];
      urls = [...new Set([...this.delList, ...this.newAddList])].join(",");
      if (!urls.length) {
        return;
      }
      this.newAddList = [];
      this.delList = [];
      this.$api.delFiles({ urls });
    },
    // 注册弹窗确认
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.ruleForm.expireTime = moment(this.ruleForm.expireTime).format("YYYY-MM-DD HH:mm:ss");
          this.loading = true;
          // 注册提交
          if (this.showType == 1) {
            const data = { ...this.ruleForm };
            data.authPhotoUrl = this.ruleForm.authPhotoUrl[0];
            this.$api.addOrg(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.$message({
                  type: "success",
                  message: "注册成功"
                });
                this.getOrgPageList();
                this.show1 = false;
                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message({
                  type: "error",
                  message: res.msg
                });
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    // 认证通过
    durch() {
      const data = {
        approveStatus: "1",
        approveComment: "审核意见",
        orgId: this.rowDate.pkId
      };
      this.loading = true;
      this.$api.certificationAuth(data).then(res => {
        if (res.code == 200) {
          this.loading = false;
          this.$message({
            type: "success",
            message: res.msg
          });
          this.show1 = false;
          this.getOrgPageList();
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 认证不通过
    certificationNo() {
      const data = {
        approveStatus: 2,
        approveComment: "审核意见",
        orgId: this.rowDate.pkId
      };
      this.loading = true;
      this.$api.certificationAuth(data).then(res => {
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: res.msg
          });
          this.loading = false;
          this.show1 = false;
          this.getOrgPageList();
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 续费确认
    renewalSubmission(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            renewalTime: moment(this.renewForm.time).format("YYYY-MM-DD HH:mm:ss"),
            keyWordId: this.renewForm.pkId,
            orgType: this.renewForm.orgType,
            proofUrl: this.renewForm.certificate[0]
          };
          if (this.listQuery.orgType == 8) {
            delete data.fkOrgId;
            data.fkUserId = this.renewForm.pkId;
          }
          this.loading = true;
          this.$api
            .orgApplyRenewal(data)
            .then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.$message({
                  type: "success",
                  message: res.msg
                });
                this.newAddList = [];
                this.getOrgPageList();
                this.show2 = false;
                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message({
                  type: "error",
                  message: res.msg
                });
                // this.show2 = false;
              }
            })
            .catch(err => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    // 续费审核通过
    auditPass(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            remark: this.renewForm.remark,
            renewaId: this.renewForm.pkId,
            approveStatus: 1,
            objectType: 1
          };
          if (this.listQuery.orgType == 8) {
            data.objectType = 2;
          }
          this.loading = true;
          this.$api.renewalAudit(data).then(res => {
            if (res.code == 200) {
              this.loading = false;
              this.$message({
                type: "success",
                message: res.msg
              });
              this.show2 = false;
              this.$refs[formName].resetFields();
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
    },
    // 续费审核不通过
    auditFailed(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            remark: this.renewForm.remark,
            renewaId: this.renewForm.pkId,
            approveStatus: 2
          };
          this.loading = true;
          this.$api.renewalAudit(data).then(res => {
            if (res.code == 200) {
              this.loading = false;
              this.$message({
                type: "success",
                message: "驳回成功"
              });
              this.show2 = false;
              this.$refs[formName].resetFields();
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
    },
    // 校验账号是否唯一
    checkReferenced() {
      if (this.ruleForm.loginName == "" || this.ruleForm.loginName == null) {
        return;
      }
      this.$api.checkReferenced({ loginName: this.ruleForm.loginName }).then(res => {
        if (res.data == true) {
        } else {
          this.ruleForm.loginName = null;
          this.$message({
            type: "error",
            message: "当前管理员账号以存在"
          });
        }
      });
    },
    // 数字输入框禁止输入事件
    keyDown(e, type) {
      const key = e.key;
      if (type === 1) {
        if (key === "e" || key === "-") {
          e.returnValue = false;
          return false;
        }
      } else {
        if (key === "e" || key === "." || key === "-") {
          e.returnValue = false;
          return false;
        }
      }
      return true;
    },
    oninput(e) {
      this.$nextTick(() => {
        let val = e;
        val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(/^0+\./g, "0.");
        val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
        val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
        if (val.includes(".")) {
          this.moneyMaxLeng2 = 15;
        } else {
          this.moneyMaxLeng2 = 12;
        }
      });
    },
    oninput2(e, idx) {
      this.$nextTick(() => {
        let val = e;
        val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(/^0+\./g, "0.");
        val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
        val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
        this.form.chargingDetailAdds[idx].chargeRate = val;
      });
    },
    openRenewal(row) {
      this.renewalShow = true;
      this.findRenewalByPkId(row);
    },
    findRenewalByPkId(item) {
      let data = {
        pkId: item.pkId,
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
    recall(row) {
      this.$confirm("撤回操作系统将会删除该申请记录,确定继续撤回操作？", "撤回确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.withdrawRenewal({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.getDatas(row);
            this.$message.success("撤回成功");
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    getDatas() {
      if (this.ruleForm.orgType == 8) {
        this.$api.findsysUserById({ pkId: this.ruleForm.pkId }).then(res => {
          if (res.code == 200) {
            this.realNameData = res.data;
            // realNameData.legalCardNum
            this.realNameData.legalCardNum = "";
            this.realNameData.handledCardNum = "";
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.$api.getInfoByOrgId({ orgId: this.ruleForm.pkId }).then(res => {
          if (res.code == 200) {
            // console.log(res);
            this.realNameData = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
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

.form-forbidden {
  /deep/ .el-form-item {
    margin: 0;
  }
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

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}

.h-400 {
  height: 440px;
}

.auto-nym-box {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
}

.auto-nym {
  // width: 49%;
  border: 1px dashed #666;
  display: flex;
  flex: 1;
  // padding: 2px;
  // padding-left: 40px;
  /deep/ .el-form-item {
    margin: 0;
  }
}

.dialog-table {
  margin: 20px 20px 0px 20px;
}

.text-bnt {
  color: #409eff;
}
.text-bnt:hover {
  cursor: pointer;
}
.wh-150 {
  width: 150px !important;
}
</style>
