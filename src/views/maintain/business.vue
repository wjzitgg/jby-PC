<template>
  <div class="app-container">
    <search-bar @search="search" :options="searchOptions" :total="totalCount" labelWidth="8em" ref="searchBar" :showHandler="false"></search-bar>
    <el-button type="primary" size="mini" class="search-mr el-button-primary" v-has="'system:business:add'" @click="registeredUser">快速注册</el-button>
    <div class="tab-container">
      <div class="table-data" style="height: 89%; margin-top: 10px">
        <el-table :data="tableData" stripe ref="multipleTable" height="92%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="orgName" label="企业名称" min-width="130">
            <template slot-scope="{ row }">
              <el-button type="text" @click="organization(row)">{{ row.orgName }}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="enginerringTypeName" label="工程大类" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="orgTypeName" label="企业类型" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="orgScaleName" label="公司规模" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createTime" label="系统注册时间" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="expireTime" label="有效期" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="realNameStatus" label="实名状态" min-width="80">
            <template slot-scope="{ row }">
              <span v-if="row.realNameStatus == '0'">未实名</span>
              <span v-if="row.realNameStatus == '1'">已实名</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="telephone" label="管理员手机号码" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="statusName" label="有效状态" min-width="80" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span v-if="row.enableStatus == '0'">禁用</span>
              <span v-if="row.enableStatus == '1'">启用</span>
              <span v-if="row.enableStatus == '2'">已过期</span>
              <span v-if="row.enableStatus == '3'">待认证</span>
              <span v-if="row.enableStatus == '4'">审核不通过</span>
              <span v-if="row.enableStatus == '5'">已注销</span>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" fixed="right" min-width="260">
            <template slot-scope="scope">
              <el-button type="primary" plain size="mini" v-has="'system:business:query'" @click.native="examine(scope.row)">查看</el-button>
              <el-button type="danger" plain size="mini" v-has="'system:business:editStatus'" v-if="scope.row.enableStatus == 1" @click.native="startCenter(scope.row)">禁用</el-button>

              <el-button type="success" plain size="mini" v-has="'system:business:editStatus'" v-if="scope.row.enableStatus == 0" @click.native="startUsing(scope.row)">启用</el-button>
              <!-- v-if="scope.row.enableStatus == 2" -->
              <el-button size="mini" type="success" plain v-if="scope.row.enableStatus != 3 && scope.row.enableStatus != 4 && scope.row.enableStatus != 5" @click="renewal(scope.row)" v-has="'system:business:renewal'">续期</el-button>
              <!-- <el-button type="primary" size="mini" v-if="scope.row.renewalStatus == 1" v-has="'system:business:renewalReview'" @click.native="renewalAudit(scope.row)">续期审核</el-button> -->
              <el-button type="primary" plain size="mini" v-if="scope.row.enableStatus == 3 || scope.row.enableStatus == 4" v-show="scope.row.deregisterStatus != '1'" @click.native="certificationApproval(scope.row)">认证审批</el-button>
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
      <el-radio-group v-model="diaRadio" size="mini" v-if="addTitle == '查看信息'">
        <el-radio-button label="1">{{ ruleForm.orgType == 8 ? "个人信息" : "企业信息" }}</el-radio-button>
        <el-radio-button label="2">续费记录</el-radio-button>
      </el-radio-group>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="dialog-form" v-if="diaRadio == 1">
        <el-row :span="24" class="el-row-data">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="orgName" :label-width="formLabelWidth">
              <el-input size="mini" v-model="ruleForm.orgName" :disabled="forbidden" autocomplete="off" maxlength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业类型" prop="orgType" :label-width="formLabelWidth">
              <el-select size="mini" v-model="ruleForm.orgType" :disabled="forbidden" placeholder="请选择" style="width: 100%" @change="orgTypeChange">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业简称" prop="shortName" :label-width="formLabelWidth">
              <el-input size="mini" v-model="ruleForm.shortName" :disabled="forbidden" autocomplete="off" maxlength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业规模" prop="orgScale" :label-width="formLabelWidth">
              <el-select size="mini" v-model="ruleForm.orgScale" :disabled="forbidden" placeholder="请选择" style="width: 100%">
                <el-option v-for="item in userScaleDate" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="linkMan" :label-width="formLabelWidth">
              <el-input size="mini" v-model="ruleForm.linkMan" :disabled="forbidden" autocomplete="off" maxlength="25"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="linkPhone" :label-width="formLabelWidth">
              <el-input size="mini" v-model="ruleForm.linkPhone" :disabled="forbidden" autocomplete="off" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期时间" prop="expireTime" :label-width="formLabelWidth">
              <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" :disabled="forbidden" v-model="ruleForm.expireTime" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="管理员手机" prop="telephone" :label-width="formLabelWidth">
              <el-input size="mini" v-model="ruleForm.telephone" :disabled="forbidden" autocomplete="off" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="管理员账号" prop="loginName" :label-width="formLabelWidth">
              <el-input v-model.trim="ruleForm.loginName" :disabled="forbidden" autocomplete="off" @blur="checkReferenced"></el-input>
            </el-form-item>
          </el-col> -->
          <el-col :span="12" v-if="ruleForm.orgType == 5 && addTitle == '查看信息'">
            <el-form-item label="施工单位" prop="telephone" :label-width="formLabelWidth">
              <el-input size="mini" v-model="realNameData.parentOrgName" :disabled="forbidden" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="ruleForm.orgType == 5 && addTitle != '查看信息'">
            <el-form-item label="施工单位" prop="fkParentOrgId" :label-width="formLabelWidth">
              <!-- <el-select size="mini" :disabled="forbidden" class="wh-200" v-model="ruleForm.fkParentOrgId">
                <el-option v-for="item in constructionUnits" :key="item.pkId" :value="item.pkId" :label="item.shortName"></el-option>
              </el-select> -->
              <tableSelect
                v-if="typeStatus"
                :value="ruleForm.fkParentOrgId"
                :rowKey="'pkId'"
                :labelKey="'orgName'"
                :disabled="forbidden"
                @row-select-event="getRowSelect"
                @clearVal="clearVal"
                :getData="constructionUnits"
                :columns="[
                  { label: '企业名称', key: 'orgName' },
                  { label: '联系人', key: 'linkMan' },
                  { label: '联系电话', key: 'linkPhone' }
                ]"
              ></tableSelect>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="ruleForm.orgType == 5">
            <el-form-item label="工程大类" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
              <el-select size="mini" :disabled="forbidden" style="width: 100%" placeholder="请选择" v-model="ruleForm.fkEnginerringTypeId">
                <el-option v-for="item in projectType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <!-- <el-col :span="24">
            <el-form-item label="认证信息" prop="authPhotoUrl" :label-width="formLabelWidth">
              <picture-upload @beforeUpload="beforeUpload" @uploadError="uploadError" :apiName="'getUploadFileToken'" :disabled="forbidden" :fileList="ruleForm.authPhotoUrl" :showUpload="showUpload" uploadTip="”uploadTip“" :limit="1" @onSuccess="onSuccess"></picture-upload>
            </el-form-item>
          </el-col> -->
        </el-row>
        <div v-if="addTitle == '查看信息' && ![5, 8, 10, 11, 12].includes(ruleForm.orgType)">
          <div style="height: 144px; border: 1px solid #ccc; text-align: center; border-radius: 5px" v-if="!realNameData.realNameStatus && ruleForm.orgType != 5">
            <div v-if="listQuery.orgType != 8" style="font-size: 20px; font-weight: 800; color: #000; line-height: 140px">企业暂未实名验证</div>
            <div v-else style="font-size: 20px; font-weight: 800; color: #000; line-height: 140px">暂未实名验证</div>
          </div>

          <div v-if="!!realNameData.realNameStatus" style="">
            <!-- <el-radio-group v-model="realName" size="mini">
              <el-radio-button v-if="addTitle != '查看信息' || realName == 1" label="1">法人</el-radio-button>
              <el-radio-button v-if="addTitle != '查看信息' || realName == 2" label="2">经办人</el-radio-button>
            </el-radio-group> -->
            <span style="font-size: 18px; font-weight: 800; color: #000; margin: 0 auto; margin-left: 46%">实名信息</span>
            <div style="border: 1px solid #ccc; text-align: center; position: relative">
              <div style="width: 90%; margin: 0 auto; padding-top: 15px; padding-left: 40px" v-if="realName == 1">
                <div style="font-size: 18px; font-weight: 800; color: #000; background: #f2f2f2; width: 50px; padding-top: 8%; text-align: center; position: absolute; left: 0; top: 0; height: 100%">
                  <div>法</div>
                  <div>人</div>
                </div>
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
              <div style="width: 90%; margin: 0 auto; padding-top: 15px; padding-left: 40px" v-if="realName == 2">
                <div style="font-size: 18px; font-weight: 800; color: #000; background: #f2f2f2; width: 50px; padding-top: 8%; text-align: center; position: absolute; left: 0; top: 0; height: 100%">
                  <div>经</div>
                  <div>办</div>
                  <div>人</div>
                </div>
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
          <el-table-column prop="alarmLevel" label="操作" width="200" align="center">
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
    <el-dialog :title="renewalTitle" width="500px" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading" @close="close2">
      <el-form :model="renewForm" ref="renewForm" :rules="rules" class="dialog-form">
        <el-form-item label="企业名称" prop="orgName" label-width="95px">
          <el-input size="mini" v-model="renewForm.orgName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="loginName" label-width="95px">
          <el-input size="mini" v-model="renewForm.loginName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="续租至" prop="time" label-width="95px">
          <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" :disabled="show2Type == 2" v-model="renewForm.time" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="续租凭证" prop="certificate" label-width="95px">
          <picture-upload :apiName="'getUploadFileToken'" @beforeUpload="beforeUpload" @uploadError="uploadError" :fileList="renewForm.certificate" :showUpload="showUpload" uploadTip="”uploadTip“" :limit="2" @onSuccess="onSuccessa"></picture-upload>
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
    <organizationEdit :materDialog.sync="materDialog" @updateMaterDialog="updateMaterDialog" :userNum="userNum"></organizationEdit>
    <el-dialog title="续期" :visible.sync="renewalShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form ref="rowDataForm" class="dialog-form" style="padding-bottom: 8px">
        <el-form-item label="企业名称" prop="accountName" :label-width="formLabelWidth">
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
          <el-input v-model="rowDataForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" disabled autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import pictureUpload from "@/components/pictureUpload";
import moment from "moment";
import organizationEdit from "./compomemts/user.vue";
import tableSelect from "./compomemts/tableSelect.vue";
export default {
  name: "business",
  components: {
    pictureUpload,
    organizationEdit,
    tableSelect
  },
  data() {
    return {
      searchOptions: [
        {
          type: "input",
          prop: "orgName",
          value: "",
          title: "企业名称",
          placeholder: "企业名称",
          maxlength: "50"
        },
        {
          type: "select",
          prop: "orgType",
          value: -1,
          title: "企业类型",
          placeholder: "请选择类型",
          clearable: false,
          options: [
            {
              label: "全部",
              value: -1
            },
            {
              label: "系统代理商",
              value: 1
            },
            {
              label: "建设单位(业主方)",
              value: 2
            },
            {
              label: "监理公司",
              value: 3
            },
            {
              label: "施工单位",
              value: 4
            },
            {
              label: "项目部",
              value: 5
            },
            // {
            //   label: "供应商",
            //   value: 6,
            // },
            // {
            //   label: "分包单位",
            //   value: 7,
            // },
            // {
            //   label: "劳务工人",
            //   value: 8,
            // },
            {
              label: "设计院",
              value: 9
            },
            {
              value: "10",
              label: "施工单位集团公司"
            },
            {
              value: "11",
              label: "政府监管单位"
            },
            {
              value: "12",
              label: "建设单位集团公司"
            }
          ]
        },
        {
          type: "select",
          prop: "orgScale",
          value: "-1",
          title: "公司规模",
          placeholder: "请选择公司规模",
          clearable: false,
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
          placeholder: "管理员手机号码"
        },
        {
          type: "select",
          prop: "enableStatus",
          value: "-1",
          title: "有效状态",
          placeholder: "请选择有效状态",
          clearable: false,
          options: [
            {
              value: "-1",
              label: "有效"
            },
            {
              value: "0",
              label: "已禁用"
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
        orgType: -1,
        enableStatus: -1,
        orgScale: -1
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
        parentOrgName: ""
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
        opinion: null,
        orgType: ""
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
          value: "1",
          label: "系统代理商"
        },
        {
          value: "2",
          label: "建设单位子公司"
        },
        {
          value: "3",
          label: "监理公司"
        },
        {
          value: "4",
          label: "施工单位子公司"
        },
        {
          value: "5",
          label: "项目部"
        },

        {
          value: "10",
          label: "施工单位集团公司"
        },
        {
          value: "11",
          label: "政府监管单位"
        },
        {
          value: "12",
          label: "建设单位集团公司"
        },
        // {
        //   value: "6",
        //   label: "供应商",
        // },
        // {
        //   value: "7",
        //   label: "分包单位",
        // },
        // {
        //   value: "8",
        //   label: "劳务工人",
        // },
        {
          value: "9",
          label: "设计院"
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
      realNameData: {},
      realName: "1",
      materDialog: false,
      userNum: "",
      newAddList: [],
      delList: [],
      diaRadio: "1",
      approvalMatterVos: [],
      renewalShow: false,
      rowDataForm: {},
      typeStatus: true
    };
  },
  mounted() {
    this.commercialType();
    this.getOrgPageList();
    this.searchTypeList();
    this.getConstructionUnitList();
    // this.getItemClass();
  },
  watch: {
    show2(val) {
      console.log(val);
      if (!val) {
        this.delFiles();
      }
    },
    "$store.state.logDialog"(val) {
      if (val == true) {
        console.log("hahahahahahahahah1");
      } else if (this.ruleForm.orgType == 5 && this.show1 == true) {
        this.getConstructionUnitList();
      }
    }
  },
  methods: {
    clearVal() {
      this.ruleForm.fkParentOrgId = "";
    },
    commercialType() {
      this.$api.commercialType().then(res => {
        if (res.code === 200) {
          console.log("调取", res.data);
          let arr = res.data.map(item => ({ ...item, value: item.keyName - 0, label: item.keyVal }));
          this.options = arr;
          this.searchOptions[1].options = [{ label: "全部", value: -1 }, ...arr];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getItemClass() {
      this.$api.getItemClass({ dictType: 34 }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.keyVal;
            item.value = item.keyName;
          });
          this.options = res.data;
          // console.log(res.data);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getRowSelect(row, column, event) {
      this.ruleForm.fkParentOrgId = row.pkId;
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
    orgTypeChange(v) {
      if (v == 5) {
        this.getConstructionUnitList();
      }
    },
    getConstructionUnitList() {
      this.typeStatus = false;
      this.$api.getConstructionUnitList().then(res => {
        if (res.code == 200) {
          this.constructionUnits = res.data;
          this.typeStatus = true;
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
      this.$api
        .getOrgPageList(this.listQuery)
        .then(res => {
          if (res.code == 200) {
            const options = {
              0: "禁用",
              1: "启用",
              2: "已过期",
              3: "待认证",
              4: "审核不通过"
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
              9: "设计院",
              10: "施工单位集团公司",
              11: "政府监管单位",
              12: "建设单位集团公司"
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
            res.data.records.forEach(item => {
              item.statusName = options[item.enableStatus];
              item.orgTypeName = this.options.filter(item2 => item2.value == item.orgType)[0].label;
              item.orgScaleName = user0ptions[item.orgScale];
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
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 查询
    search(form) {
      if (form.telephone != undefined) {
        this.listQuery.telephone = form.telephone;
      } else {
        this.listQuery.telephone = "";
      }
      if (form.orgName != undefined) {
        this.listQuery.orgName = form.orgName;
      } else {
        this.listQuery.orgName = "";
      }
      this.listQuery.enableStatus = form.enableStatus ? form.enableStatus : -1;
      this.listQuery.orgScale = form.orgScale ? form.orgScale : -1;
      this.listQuery.orgType = form.orgType ? form.orgType : -1;
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = 10;
      // Object.assign(newObj,user,page);
      this.getOrgPageList();
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.$refs.multipleTable.bodyWrapper.scrollTop = 0;
      this.getOrgPageList();
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.$refs.multipleTable.bodyWrapper.scrollTop = 0;
      this.getOrgPageList();
    },
    // 查看
    examine(row) {
      this.show1 = true;
      this.showType = 3;
      this.addTitle = "查看信息";
      this.showUpload = false;
      const date = JSON.stringify(row);
      const rowDate = JSON.parse(date);
      rowDate.orgType = rowDate.orgType + "";
      rowDate.orgScale = rowDate.orgScale + "";
      const url = rowDate.authPhotoUrl;
      this.ruleForm = rowDate;
      this.ruleForm.orgType = this.ruleForm.orgType - 0;
      this.forbidden = true;
      this.ruleForm.authPhotoUrl = [];
      this.ruleForm.authPhotoUrl.push(url);
      this.$api.getInfoByOrgId({ orgId: row.pkId }).then(res => {
        if (res.code == 200) {
          // console.log(res);
          this.realNameData = res.data;
          if (res.data.handledCardNum.length != 0 && res.data.legalCardNum.length == 0) {
            this.realName = "2";
          }
          if (res.data.handledCardNum.length == 0 && res.data.legalCardNum.length == 1) {
            this.realName = "1";
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
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

    // 注册
    registeredUser() {
      // this.formRest();
      this.diaRadio = "1";
      this.show1 = true;
      this.showType = 1;
      this.addTitle = "快速注册";
      this.forbidden = false;
      this.showUpload = true;
      this.formRest();
      if (this.$refs.ruleForm != undefined) {
        this.$refs.ruleForm.resetFields();
      }
    },
    formRest() {
      //  this.$refs.ruleForm.resetFields();
      // this.$refs.ruleForm.clearValidate()
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
        // authPhotoUrl: []
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
      // this.renewForm.certificate = []
      // this.renewForm.time = ""
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
      // this.$api.getInfoByOrgId({ orgId: row.pkId }).then(res => {
      //   if (res.code == 200) {
      //     const row = res.data;
      //     const url = row.proofUrl;
      //     this.forbidden = true;
      //     this.renewForm.certificate = [];
      //     this.renewForm.certificate.push(url);
      //     this.showUpload = false;
      //     this.renewForm.time = res.data.renewalTime;
      //     this.renewForm.orgName = res.data.orgName;
      //     this.renewForm.loginName = res.data.loginName;
      //     this.renewForm.pkId = res.data.renewalId;
      //   } else {
      //     this.$message({
      //       type: "error",
      //       message: res.msg
      //     });
      //   }
      // });
    },
    onSuccess(item) {
      this.ruleForm.authPhotoUrl = item;
      this.loading = false;
    },
    onSuccessa(item) {
      if (item) {
        this.newAddList.push(item[0]);
      } else {
        this.delList.push(this.renewForm.certificate[0]);
      }
      this.renewForm.certificate = item;
      this.loading = false;
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
      console.log("施工ID:", this.ruleForm.fkParentOrgId);
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
            // this.renewForm.certificate[this.form.superiors.length - 1],
          };
          this.loading = true;
          this.$api.orgApplyRenewal(data).then(res => {
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
            objectType: 0
          };
          this.loading = true;
          this.$api.renewalAudit(data).then(res => {
            if (res.code == 200) {
              this.loading = false;
              this.$message({
                type: "success",
                message: res.msg
              });
              this.newAddList = [];
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
    beforeUpload() {
      this.loading = true;
    },
    uploadError() {
      this.loading = false;
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
.search-mr {
  position: absolute;
  top: 86px;
  right: 42px;
  z-index: 2;
}
.h-400 {
  height: 440px;
}
</style>
