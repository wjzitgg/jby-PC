<template>
  <div class="app-container">
    <custom @choose="chooses" style="height: 93%" v-show="!basicStatus" :types="'5'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"
        ><el-button icon="el-icon-s-unfold" style="padding: 0" size="mini" @click="productDept"></el-button> <span>{{ customData.orgName }}</span>
      </span>
      <span class="item">管理员手机号码:{{ customData.telephone }}</span>
      <span class="item">联系人:{{ customData.linkMan }}</span>
      <span class="item">联系人手机号码:{{ customData.linkPhone }}</span>
      <span class="item">到期日期:{{ customData.expireTime }}</span>
    </div>
    <el-tabs v-model="tabPosition" @tab-click="tabPositionChange" v-show="basicStatus" v-if="customData.orgType == '5'">
      <el-tab-pane label="验收工序与流程" name="moban"></el-tab-pane>
      <el-tab-pane label="其它业务流程" name="fenx"></el-tab-pane>
    </el-tabs>
    <div class="acceptance-header" v-if="workflowTypeArr.length > 1" v-show="basicStatus">
      <el-tabs v-model="typeWorkflowType" @tab-click="typeWorkflowTypeChange">
        <el-tab-pane v-for="(item, index) in workflowTypeArr" :key="index" :label="item.name" :name="item.key"></el-tab-pane>
      </el-tabs>
    </div>
    <div v-show="basicStatus" class="search-bar-box" style="position: relative">
      <span v-if="tabPosition == 'moban'">专业类别</span>
      <el-select v-if="tabPosition == 'moban'" v-model="listQuery.fkProfessionalTypeId" clearable placeholder="专业类别" size="mini" class="wh-150">
        <el-option v-for="(item, index) in expertSortData" :label="item.label" :value="item.value" :key="index"></el-option>
      </el-select>
      <span>{{ typeWorkflowType == 0 || typeWorkflowType == 13 ? "工序名称" : "流程名称" }}</span>
      <el-input v-model="listQuery.workflowName" placeholder="请输入流程名称" size="mini" class="wh-150" maxlength="50"></el-input>
      <span v-if="tabPosition == 'moban' && typeWorkflowType == '1'">关联分项</span>
      <el-input v-if="tabPosition == 'moban' && typeWorkflowType == '1'" maxlength="100" v-model="listQuery.keyWord" placeholder="请输入关联分项" size="mini" class="wh-150"></el-input>
      <span v-if="typeWorkflowType == '0' || typeWorkflowType == '13'">应用流程</span>
      <el-input v-if="typeWorkflowType == '0' || typeWorkflowType == '13'" v-model="listQuery.workflowTemplateName" placeholder="请输入应用流程" size="mini" class="wh-150"></el-input>
      <el-button type="primary" size="mini" icon="el-icon-search" class="ml-20 el-button-primary" @click="search">查询</el-button>
      <!-- tableData -->
      <el-button v-if="typeWorkflowType != 2 && typeWorkflowType != 3 && typeWorkflowType != 5" type="primary" size="mini" class="search-mr add-btn el-button-primary" @click="addFlow" v-has="'customized:process:add'">
        {{ typeWorkflowType == 0 || typeWorkflowType == 13 ? "新增工序" : "新增流程" }}
      </el-button>
      <el-button v-if="(typeWorkflowType == 2 || typeWorkflowType == 3 || typeWorkflowType == 5) && tableData.length == 0" type="primary" size="mini" class="search-mr add-btn el-button-primary" @click="addFlow" v-has="'customized:process:add'"> 新增流程 </el-button>
    </div>
    <div v-show="tabPosition == 'moban' && basicStatus" :class="{ 'h-78': customData.orgType == '5', 'h-85': customData.orgType != '5' }" class="tab-container table-data">
      <el-table :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
        <el-table-column align="center" label="序号" min-width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="workflowName" label="流程名称" min-width="130"></el-table-column>
        <el-table-column align="center" prop="workflowTypeName" label="工程大类" min-width="90" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="professionalTypeName" label="专业类别" min-width="90" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="completeItemName" v-if="typeWorkflowType == '1'" label="已配置分项工程" min-width="160" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="applicationName" v-if="typeWorkflowType != '1'" label="已应用流程" min-width="160" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="createTime" label="最后修改时间" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="alarmLevel" label="操作" min-width="340">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" v-has="'customized:process:query'" @click.native="examine(scope.row)">查看</el-button>
            <el-button v-if="scope.row.updateStatus" type="primary" plain size="mini" v-has="'customized:process:set'" @click.native="designFlow(scope.row)">{{ scope.row.workflowType == "0" || scope.row.workflowType == "13" ? "编辑工序" : "编辑流程" }}</el-button>
            <!-- <el-button v-else type="primary" plain size="mini" v-has="'customized:process:set'" @click.native="designFlow(scope.row)">编辑流程</el-button> -->
            <el-button type="primary" plain size="mini" v-has="'customized:process:itemEdit'" v-if="scope.row.workflowType == 1" @click.native="apportion(scope.row)">关联分项工程</el-button>
            <el-button type="danger" plain size="mini" v-if="scope.row.deleteStatus == '1'" v-has="'customized:process:delete'" @click.native="remove(scope.row)">删除{{ scope.row.workflowTypeName }}</el-button>
            <el-button type="primary" plain size="mini" v-if="scope.row.workflowTypeName == '用章审批流程'" v-has="'customized:process:configure'" @click.native="sceneClick(scope.row)">配置场景</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
    </div>
    <div v-show="tabPosition == 'fenx' && basicStatus" class="tab-container table-data" :class="{ 'h-78': customData.orgType == '5', 'h-85': customData.orgType != '5' }">
      <el-table :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
        <el-table-column align="center" label="序号" min-width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="workflowName" label="流程名称" min-width="130"></el-table-column>
        <el-table-column align="center" prop="completeItemName" v-if="typeWorkflowType == '8'" label="应用场景" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="examineStatus" v-if="typeWorkflowType == '4' || typeWorkflowType == '2'" label="状态" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="updateUser" label="最后修改人" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="updateTime" label="最后修改时间" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="alarmLevel" label="操作" min-width="240">
          <template slot-scope="scope">
            <el-button type="primary" plain size="mini" v-has="'customized:process:query'" @click.native="examine(scope.row)">查看</el-button>
            <el-button v-if="scope.row.workflowType == '0' || scope.row.workflowType == '13'" type="primary" plain size="mini" v-has="'customized:process:set'" @click.native="designFlow(scope.row)">编辑工序</el-button>
            <el-button v-else type="primary" plain size="mini" v-has="'customized:process:set'" @click.native="designFlow(scope.row)">编辑流程</el-button>
            <el-button type="primary" plain size="mini" v-has="'customized:process:itemEdit'" v-if="scope.row.workflowType == 1" @click.native="apportion(scope.row)">关联分项工程</el-button>
            <el-button type="danger" plain size="mini" v-if="(typeWorkflowType == 4 || typeWorkflowType == 8) && scope.row.deleteStatus == '1'" v-has="'customized:process:delete'" @click.native="remove(scope.row)">删除{{ scope.row.workflowTypeName }}</el-button>
            <el-button type="primary" plain size="mini" v-if="scope.row.workflowTypeName == '用章审批流程'" v-has="'customized:process:configure'" @click.native="sceneClick(scope.row)">配置场景</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <!-- 新建 设计流程弹窗 -->
    <el-dialog :title="addTitle" :visible.sync="show1" width="90%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <!-- 流程属性 -->
      <el-form :model="form" :rules="rules" ref="formDate" style="padding: 12px 10px 0 0">
        <el-row>
          <el-col :span="4">
            <el-form-item label="企业名称" prop="fkOrgId" :label-width="formLabelWidth">
              <el-input ize="mini" disabled v-model="customData.orgName" size="mini"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="form.workflowType == '0' || form.workflowType == '1' || form.workflowType == '13'">
            <el-form-item label="专业类别" prop="fkProfessionalTypeId" :label-width="formLabelWidth">
              <el-select :disabled="(addTitle == '编辑流程' || addTitle == '查看流程') && form.fkProfessionalTypeId != 0" style="width: 100%" placeholder="请选择" size="mini" @change="typeIdChange" v-model="form.fkProfessionalTypeId">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 1111111111111111111111111 -->
          <el-col :span="4" v-if="(customData.orgType == '2' || customData.orgType == '3' || customData.orgType == '9') && typeWorkflowType == '4'">
            <el-form-item label="项目" prop="fkProjectId" :label-width="formLabelWidth">
              <el-select style="width: 100%" placeholder="请选择" size="mini" @change="projectByOrgIdChange" v-model="form.fkProjectId">
                <el-option v-for="item in projectByOrgIdArr" :key="item.pkId" :label="item.projectName" :value="item.pkId"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="(customData.orgType == '2' || customData.orgType == '3' || customData.orgType == '9') && typeWorkflowType == '4'">
            <el-form-item label="标段" prop="fkBidProjectId" :label-width="formLabelWidth">
              <el-select style="width: 100%" placeholder="请选择" size="mini" v-model="form.fkBidProjectId">
                <el-option v-for="item in fkBidProjectIArr" :key="item.pkId" :label="item.projectName" :value="item.pkId"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 1111111111111111111111111 -->
          <!-- <el-col :span="4" v-if="form.workflowType == 5 && customData.orgType == '5'">
            <el-form-item label="盘点仓库类型" prop="type" label-width="110px">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" @change="warehouseTypeChange" style="width: 100%" placeholder="请选择" size="mini" v-model="form.type">
                <el-option v-for="item in typeList" :key="item.key" :label="item.name" :value="item.key"> </el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="4">
            <el-form-item label="流程名称" prop="workflowName" :label-width="formLabelWidth">
              <el-input :disabled="addTitle == '查看流程'" v-model="form.workflowName" size="mini" autocomplete="off" maxlength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="流程备注" prop="remark" :label-width="formLabelWidth">
              <el-input :disabled="addTitle == '查看流程'" v-model="form.remark" size="mini" autocomplete="off" maxlength="100"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="width: 100%; border: 1px solid"></div>
      <!--流程图  -->
      <div v-show="form.workflowType != 1 && unnamedType.length == 0" v-if="show1">
        <panl-show :fkEnginerringTypeId="customData.fkEnginerringTypeId" :fkProfessionalTypeId="form.fkProfessionalTypeId" :fkOrgId="listQuery.fkOrgId" style="width: 100%; height: 450px" ref="regPanl" :orgType="customData.orgType" @ensureab="ensureab" :workflowType="typeWorkflowType" :user="customData" :flowTableArr="flowTableArr" :warehouseType="warehouseType" @pdfList="pdfList" @launchInit="launchInit"></panl-show>
      </div>
      <!-- 生产验收流程 -->
      <productionApproval v-if="typeWorkflowType == 1 && unnamedType.length == 0" :addTitle="addTitle" ref="productionApproval" :fessionalTypeId="this.form.fkProfessionalTypeId" :workflowType="typeWorkflowType" :editStatus="editStatus" :accessType="'2'" :fkOrgId="listQuery.fkOrgId"></productionApproval>
      <div v-if="unnamedType.length != 0" class="h-500">
        {{ unnamedType == 0 ? "企业未实名请联系该企业管理员实名" : "企业授权已过期，请联系该企业管理员进行授权" }}
      </div>
      <div style="width: 100%; height: 1px; background: #000"></div>
      <div slot="footer" class="dialog-footer" v-show="showType != 4 && unnamedType.length == 0">
        <el-button size="mini" @click="show1 = false">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="addFlowSubmit('formDate')" v-show="addTitle != '查看流程'">保 存</el-button>
      </div>
    </el-dialog>
    <!-- /配置分项工程弹窗/ -->
    <el-dialog title="配置分项工程" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false">
      <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
      <el-tree style="height: 400px; overflow: auto" :data="subentryData" ref="treeDefaultKey" show-checkbox @node-expand="nodeExpand" node-key="pkId" :default-checked-keys="defaultKey" :filter-node-method="filterNode" :props="defaultProps" :check-strictly="true" @check-change="setCheckedNodes" :default-expand-all="true"></el-tree>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="show2 = false">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="ensure">保 存</el-button>
      </div>
    </el-dialog>
    <!-- /查看流程弹窗/ -->
    <el-dialog :title="addTitle" :visible.sync="show3" width="90%" v-dialogDrag :close-on-click-modal="false">
      <el-tabs v-model="messageType" v-if="typeWorkflowType == 2 || typeWorkflowType == 4">
        <el-tab-pane label="基本信息" name="1"></el-tab-pane>
        <el-tab-pane label="审核记录" name="2"></el-tab-pane>
      </el-tabs>
      <div v-show="messageType == '1'">
        <el-form :model="form" :rules="rules" ref="form" style="padding: 12px 10px 0 0">
          <el-row>
            <el-col :span="4">
              <el-form-item label="企业名称" prop="fkOrgId" :label-width="formLabelWidth">
                <el-input ize="mini" disabled v-model="customData.orgName" size="mini"></el-input>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="4">
            <el-form-item label="流程类型" prop="workflowType" :label-width="formLabelWidth">
              <el-select disabled style="width: 100%" placeholder="请选择" size="mini" v-model="form.workflowType">
                <el-option key="0" label="生产验收工序" value="0"></el-option>
                <el-option key="13" label="最终质量验收工序" value="13"></el-option>
                <el-option v-for="item in typeData" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
            <el-col :span="4" v-if="form.workflowType == '0' || form.workflowType == '1'">
              <el-form-item label="专业类别" prop="fkProfessionalTypeId" :label-width="formLabelWidth">
                <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" style="width: 100%" placeholder="请选择" size="mini" v-model="form.fkProfessionalTypeId">
                  <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4" v-if="(customData.orgType == '2' || customData.orgType == '3' || customData.orgType == '9') && typeWorkflowType == '4'">
              <el-form-item label="项目" prop="fkProjectId" :label-width="formLabelWidth">
                <el-input disabled v-model="form.fkProjectName" size="mini" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" v-if="(customData.orgType == '2' || customData.orgType == '3' || customData.orgType == '9') && typeWorkflowType == '4'">
              <el-form-item label="标段" prop="fkBidProjectId" :label-width="formLabelWidth">
                <el-input disabled v-model="form.fkBidProjectName" size="mini" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="流程名称" prop="workflowName" :label-width="formLabelWidth">
                <el-input disabled v-model="form.workflowName" size="mini" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="流程备注" prop="remark" :label-width="formLabelWidth">
                <el-input disabled v-model="form.remark" size="mini" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div style="width: 100%; border: 1px solid"></div>
        <div class="examineBpmn">
          <examine-bpmn :fkEnginerringTypeId="customData.fkEnginerringTypeId" :dataList="form" :fkProfessionalTypeId="form.fkProfessionalTypeId" style="width: 100%; height: 500px" :workflowType="form.workflowType" :fkOrgId="listQuery.fkOrgId" ref="examineBpmn" :XmlStr="XmlStr" @ensureab="ensureab" :flowTableArr="flowTableArr" :user="customData" :warehouseType="warehouseType"></examine-bpmn>
        </div>
      </div>
      <div v-if="messageType == '2'" style="height: 570px">
        <el-table :data="form.businessApprovalRecordVos" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column type="index" width="50" align="center" label="序号"> </el-table-column>
          <el-table-column align="center" prop="approvalType" label="申请类型" min-width="120"></el-table-column>
          <el-table-column align="center" prop="createUser" label="申请人" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="createTime" label="申请时间" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="fkApproveName" label="审核人" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveTime" label="审核时间" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="enableStatus" label="审核结果" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="remark" label="审核备注" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="alarmLevel" label="详情" min-width="85">
            <template slot-scope="scope">
              <el-button type="primary" plain size="mini" v-has="'customized:process:query'" @click.native="particulars(scope.row)">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
    </el-dialog>

    <el-dialog title="选择企业" width="70%" :visible.sync="show6" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div style="height: 560px">
        <custom @choose="chooses" style="height: 85%" ref="custom" :status="show6" :types="'5'"></custom>
      </div>
    </el-dialog>

    <!-- /配置场景弹窗/ -->
    <el-dialog title="配置场景" :visible.sync="sceneDialog" width="500px" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-checkbox-group v-model="sealCodes">
          <div v-for="item in sceneList" :key="item.key">
            <el-checkbox :label="item.key" :value="item.key">{{ item.name }}</el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="sceneDialog = false">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="sceneSubmit">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 验收流程详情 提交审批撤回-->
    <el-dialog title="验收流程详情" :visible.sync="acceptanceDetails" width="90%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="acceptDia">
        <!-- <div class="itemTree" v-if="isBatch">
          <div v-for="(item, index) in multipleSelection" :key="index" @click="multipleClick(index)" class="left-table" :class="{ 'left-table-set': multipleIndex == index }">{{ item.workflowName }}</div>
        </div> -->
        <div class="acceptDia-right">
          <div class="dialog-head">
            <el-row :gutter="24" style="width: 100%">
              <el-col :span="4">
                <span>流程类型：</span>
                <div class="content" :title="acceptanceForm.workflowTypeName">{{ acceptanceForm.workflowTemplateVo.workflowTypeName }}</div>
              </el-col>
              <el-col :span="4">
                <span>流程名称：</span>
                <div class="content">{{ acceptanceForm.workflowTemplateVo.workflowName }}</div>
              </el-col>
              <el-col :span="4">
                <span>申请人：</span>
                <div class="content">{{ acceptanceForm.createUserName }}</div>
              </el-col>
              <el-col :span="4">
                <span>申请时间：</span>
                <div class="content">{{ acceptanceForm.createTime }}</div>
              </el-col>
              <el-col :span="4">
                <span>审批人：</span>
                <div class="content">{{ acceptanceForm.fkApproveName }}</div>
              </el-col>
              <el-col :span="4">
                <span>审批时间：</span>
                <div class="content">{{ acceptanceForm.approveTime }}</div>
              </el-col>
              <el-col :span="4">
                <span>审批状态：</span>
                <div class="content">{{ acceptanceForm.enableStatus }}</div>
              </el-col>
              <el-col :span="4">
                <span>审批意见：</span>
                <div class="content">{{ acceptanceForm.remark }}</div>
              </el-col>
            </el-row>
          </div>
          <div style="width: 100%; border: 1px solid"></div>
          <!-- <acceptanceProcess :editStatus="false" :workflowType="'1'" :accessType="'3'" ref="productionApproval2"></acceptanceProcess> -->
          <div class="examineBpmn">
            <!-- <examine-bpmn  :fkEnginerringTypeId="customData.fkEnginerringTypeId" :fkProfessionalTypeId="form.fkProfessionalTypeId"
             style="width: 100%; height: 500px" :workflowType="typeWorkflowType" :fkOrgId="typeWorkflowType.fkOrgId" ref="acceptanceBpmn"
              :XmlStr="XmlStr" @ensureab="ensureab" :tableSource="'1'" :warehouseType="warehouseType" :dataList="form" :fkWorkflowId="formFkWorkflowId">
            </examine-bpmn> -->
            <examine-bpmn :fkEnginerringTypeId="customData.fkEnginerringTypeId" :dataList="form" :fkProfessionalTypeId="form.fkProfessionalTypeId" style="width: 100%; height: 500px" :workflowType="typeWorkflowType" :fkOrgId="listQuery.fkOrgId" ref="acceptanceBpmn" :XmlStr="XmlStr" @ensureab="ensureab" :flowTableArr="flowTableArr" :user="customData" :warehouseType="warehouseType"></examine-bpmn>
          </div>
          <div style="width: 100%; height: 1px; background: #000"></div>
        </div>
      </div>
      <!-- <div slot="footer" class="dialog-footer" v-if="acceptanceType != 3">
        <el-button v-if="acceptanceType == 0" size="mini" @click="comeUpForReview" type="primary">提交审批</el-button>
        <el-button v-if="acceptanceType == 1" size="mini" @click="recall" type="danger">撤回</el-button>
        <el-button v-if="acceptanceType == 2" size="mini" @click="withdrawAnApplication" type="primary">申请撤回</el-button>
        <el-button size="mini" @click="acceptanceDetails = false">取 消</el-button>
      </div> -->
    </el-dialog>
  </div>
</template>

<script>
import panlShow from "../../components/custom-basic/customBasic.vue";
import examineBpmn from "./../../components/custom-basic/examineBpmn.vue";
import bpmShow from "./../../components/bpmShow.vue";
import { extractTree, listToTree } from "@/utils/commond";
import { CustomViewer } from "@/components/customBpmn";
import custom from "./compomemts/custom.vue";
import unnamed from "../org/compoments/unnamed.vue";
import productionApproval from "../../components/acceptanceProcess.vue";
export default {
  directives: {
    "el-select-loadmore": {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector(".el-select-dropdown .el-select-dropdown__wrap");
        SELECTWRAP_DOM.addEventListener("scroll", function() {
          /**
           * scrollHeight 获取元素内容高度(只读)
           * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
           * clientHeight 读取元素的可见高度(只读)
           * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
           * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
           */
          const condition = this.scrollHeight - this.scrollTop <= this.clientHeight;
          if (condition) {
            binding.value();
          }
        });
      }
    }
  },
  components: {
    panlShow,
    examineBpmn,
    bpmShow,
    custom,
    unnamed,
    productionApproval
  },
  name: "customizedProcess",
  data() {
    return {
      totalCount: 0,
      //搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        fkOrgId: "",
        fkProfessionalTypeId: "",
        workflowName: "",
        keyWord: "",
        workflowTemplateName: ""
      },
      tableData: [],
      maxHeight: 0,
      show1: false,
      formLabelWidth: "90px",
      form: {
        workflowName: "", //流程名称
        fkEnginerringTypeId: "", //工程类型
        fkProfessionalTypeId: "", //专业类别
        workflowType: "", //流程类别
        remark: "", //流程备注
        fkOrgId: "",
        type: "",
        types: "",
        fkProjectId:"",
        fkBidProjectId:""
      },
      addTitle: "新增单位工程分类",
      rules: {
        workflowName: [
          {
            required: true,
            message: "流程名称",
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
        workflowType: [
          {
            required: true,
            message: "流程类别",
            trigger: ["change", "blur"]
          }
        ],
        fkProfessionalTypeId: [
          {
            required: true,
            message: "专业级别",
            trigger: ["change", "blur"]
          }
        ],
        fkProjectId: [
          {
            required: true,
            message: "请选择项目",
            trigger: ["change", "blur"]
          }
        ],
        fkBidProjectId: [
          {
            required: true,
            message: "请选择标段",
            trigger: ["change", "blur"]
          }
        ]
      },
      showType: null,
      show2: false,
      subentryData: [],
      defaultProps: {
        children: "prodItemLists",
        label: "itemName"
      },
      projectType: [], //工程类型
      defaultKey: [],
      showDate: {},
      show3: false,
      productionApproval: [],
      pitchOnDate: [],
      // fieldList: [],
      fieldListform: {
        name: "",
        tableIds: [],
        technology: "", //技术
        jsThePage: null, //技术开始页
        jsToPage: null, //技术结束页
        safety: "", //安全
        aqThePage: null, //安全开始页
        aqToPage: null, //安全结束页
        standard: "", //验收
        ysThePage: null, //验收开始页
        ysToPage: null, //验收结束页
        quantitiesTable: "", //工程量
        materialUsedTable: "", //材料用量
        scoreFlag: "", //评分量
        workflowType: ""
      },
      technologyDate: [],
      safetyDate: [],
      acceptanceLevel: [],
      relatedForm: [],
      ereas: [],
      XmlStr: "",
      loading: false,
      nodeShow: false, //
      expertSortData: [],
      show4: false,
      subflowForm: {
        workflowName: "", //流程名称
        fkEnginerringTypeId: "", //工程类型
        fkProfessionalTypeId: "", //专业类别
        workflowType: "", //流程类别
        remark: "" //流程备注
      },
      seedDate: {},
      selectOptionWidth: "",
      show6: false,
      customPageNum: 1,
      customPageSize: 10,
      customTotal: 0,
      customDataArr: [],
      customData: {
        orgName: "",
        linkMan: "",
        linkPhone: "",
        expireTime: "",
        projectName: "",
        contractAmount: ""
      },
      projectData: [],
      filterText: "",
      // linkMan: null,
      // orgName: null,
      // telephone: null,
      tabPosition: "moban",
      searchData: [],
      preName: "",
      preName: "",
      ProcessDialog: false,
      bpmnModeler: null,
      radio: "0",
      radioStatus: false,
      subentryShow: false,
      userDefined: "1",
      acceptanceProcess: [],
      acceptanceAs: "",
      itemData: {},
      formData: {
        pageIndex: 1
      },
      prodItemId: "",
      basicStatus: false,
      typeData: [],
      sceneDialog: false,
      sceneList: [],
      sealCodes: [],
      fkTemplateId: "",
      typeList: [],
      flowTableArr: [],
      workflowNameLike: "",
      fessionalTypeId: "",
      warehouseType: "",
      marginNum: "70px 0",
      acceptanceDetails: false,
      acceptanceType: "",
      acceptanceData: {},
      reasonWithdrawal: false,
      reasonRemark: "",
      acceptanceForm: {
        workflowTemplateVo: {}
      },
      tableTypeSource: "",
      tableProfessionalTypeId: "",
      // bpmnContentStatus: false,
      addTitleFour: "",
      unnamedType: "",
      typeWorkflowType: "1",
      workflowTypeArr: [],
      pdfListData: [],
      editStatus: true,
      launchType: "",
      fkRoleId: "",
      fkBidProjectIArr: [],
      projectByOrgIdArr: [],
      messageType: "1"
    };
  },
  mounted() {
    // this.pagingDisplay();
    // this.searchTypeList();
    // this.int();
    this.searchOrgList();
    // this.$store.dispatch("getDictionariesData", 30).then(res => {
    //   this.sceneList = res;
    // });
  },
  watch: {
    filterText(val) {
      this.$refs.treeDefaultKey.filter(val);
    },
    tabPosition(val) {
      // this.searchTypeList();

      this.int();
      this.searchOrgList();
      this.searchMajorTypeList();
    }
  },
  methods: {
    //   particulars
    particulars(row) {
      // findByPkIdOperation
      this.$api.findByPkIdOperation({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.acceptanceForm = res.data;
          this.acceptanceDetails = true;
          // this.XmlStr = res.data.bpmnContent;
          // if (res.data.workflowType == 5) {
          //   this.customGetWorkflowType(res.data.workflowType);
          //   this.warehouseType = res.data.type;
          // } res.data.workflowNodeTables
          this.$nextTick(() => {
            this.$refs.acceptanceBpmn.exportDiagram(res.data.workflowTemplateVo.bpmnContent, res.data.workflowTemplateVo.workflowNodeTables, res.data.workflowTemplateVo);
          });
          this.loading = false;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    searchProjectByOrgId(id) {
      this.$api.searchProjectByOrgId({ fkOrgId: id }).then(res => {
        if (res.code == 200) {
          this.projectByOrgIdArr = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    projectByOrgIdChange(val) {
      this.form.fkBidProjectId = "";
      this.fkBidProjectIArr = [];

      this.searchByProjectIdOperation(val);
    },
    searchByProjectIdOperation(id) {
      this.$api.searchByProjectIdOperation({ fkProjectId: id }).then(res => {
        if (res.code == 200) {
          this.fkBidProjectIArr = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    launchInit(data) {
      this.launchType = data.launchType;
      this.fkRoleId = data.fkRoleId;
    },
    pdfList(data) {
      this.pdfListData = [
        { fkBookPdfId: data.technology, beginPage: data.jsThePage, endPage: data.jsToPage, sortval: 1 },
        { fkBookPdfId: data.safety, beginPage: data.aqThePage, endPage: data.aqToPage, sortval: 2 },
        { fkBookPdfId: data.standard, beginPage: data.ysThePage, endPage: data.ysToPage, sortval: 3 }
      ];
      let arr = [];
      this.pdfListData.forEach(item => {
        if (item.fkBookPdfId != undefined && item.fkBookPdfId != null && item.fkBookPdfId.length != 0) {
          arr.push(item);
        }
      });
      this.pdfListData = arr;
    },
    tabPositionChange(val) {
      this.listQuery.fkProfessionalTypeId = "";
      this.listQuery.workflowName = "";
      this.listQuery.keyWord = "";
      this.listQuery.workflowTemplateName = "";

      if (val.name == "moban") {
        this.typeWorkflowType = "1";
        this.workflowTypeArr = [
          { name: "生产验收流程", key: "1" },
          { name: "生产验收工序", key: "0" },
          { name: "最终质量验收工序", key: "13" }
        ];
      } else {
        this.workflowTypeArr = this.typeData;
        this.typeWorkflowType = this.typeData[0].key;
      }
      this.search();
    },
    typeWorkflowTypeChange() {
      this.listQuery.fkProfessionalTypeId = "";
      this.listQuery.workflowName = "";
      this.listQuery.keyWord = "";
      this.listQuery.workflowTemplateName = "";

      this.search();
    },

    warehouseTypeChange(val) {
      this.warehouseType = val;
    },
    nodeExpand(data, node) {
      if (node.level == 1) {
        this.expandNodes(node);
      }
    },
    expandNodes(node) {
      node.expanded = true;
      for (let i = 0; i < node.childNodes.length; i++) {
        node.childNodes[i].expanded = true;
        if (node.childNodes[i].childNodes.length > 0) {
          this.expandNodes(node.childNodes[i]);
        }
      }
    },
    sceneClick(row) {
      this.$api.getCustomizedSealScene({ templateId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.sealCodes = res.data;
          this.fkTemplateId = row.pkId;
          this.sceneDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    sceneSubmit() {
      let data = {
        fkTemplateId: this.fkTemplateId,
        sealCodes: this.sealCodes
        // fkOrgId:this.customData.fkOrgId
      };
      this.$api.customizedSetSealScene(data).then(res => {
        if (res.code == 200) {
          this.$message.success("配置成功");
          this.sceneDialog = false;
          this.chooses(this.customData);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    chooses(item) {
      console.log("xxxxxxxxxxx---xxxxxxxxxxx");
      console.log();
      console.log();
      if (item.orgType == 5) {
        this.tabPosition = "moban";
      }

      this.listQuery.fkProfessionalTypeId = "";
      this.listQuery.workflowName = "";
      this.listQuery.keyWord = "";
      this.listQuery.workflowTemplateName = "";

      if (this.tabPosition == "moban") {
        this.typeWorkflowType = "1";
        this.workflowTypeArr = [
          { name: "生产验收流程", key: "1" },
          { name: "生产验收工序", key: "0" },
          { name: "最终质量验收工序", key: "13" }
        ];
      } else {
        // this.workflowTypeArr = this.typeData;
        // this.typeWorkflowType = this.typeData[0].key;
      }
      this.search();
      console.log("xxxxxxxxxxx---xxxxxxxxxxx");
      // tabPosition
      this.customData = item;
      this.basicStatus = true;
      this.listQuery.fkOrgId = item.pkId;
      this.form.fkOrgId = item.pkId;
      this.show6 = false;
      this.$api.customizedSearchUsingScene({ orgId: item.pkId }).then(res => {
        if (res.code == 200) {
          this.sceneList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });

      this.searchMajorTypeList();
      if (this.customData.orgType == "2" || this.customData.orgType == "3" || this.customData.orgType == "9") {
        this.searchProjectByOrgId(item.pkId);
      }
      let arr = [];
      this.$api.customizedWorkTypeQuery({ orgType: item.orgType }).then(res => {
        if (res.code == 200) {
          this.listQuery.workflowType = res.data[0].key;
          res.data.forEach(item => {
            item.label = item.name;
            item.value = item.key;
            if (this.customData.orgType != "5") {
              if (item.value != "0" && item.value != "1") {
                arr.push(item);
              }
            } else {
              arr.push(item);
            }
          });
          this.typeData = arr;
          if (item.orgType == "5") {
            this.workflowTypeArr = [
              { name: "生产验收流程", key: "1" },
              { name: "生产验收工序", key: "0" },
              { name: "最终质量验收工序", key: "13" }
            ];
          } else {
            this.tabPosition = "fenx";
            this.workflowTypeArr = this.typeData;
            this.typeWorkflowType = this.typeData[0].key;
          }
          this.pagingDisplay();
        }
      });
    },
    loadmore() {
      this.formData.pageIndex++;
      // this.getList(this.formData);
    },
    init(domId) {
      // 获取到属性ref为“canvas”的dom节点
      document.getElementById(domId).innerHTML = "";
      const canva = this.$refs[domId];
      //新建流程 用dom元素绘画svg ====> canvas
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

    filterNode(value, data) {
      if (!value) return true;
      return data.itemName.indexOf(value) !== -1;
    },
    searchOrgList() {
      this.$api.searchOrgList({ type: 5 }).then(res => {
        if (res.code == 200) {
          this.projectData = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    int() {
      this.loading = true;
      let data = {
        orgType: 5,
        pageNum: this.customPageNum,
        pageSize: this.customPageSize,
        enableStatus: -1,
        orgScale: -1
      };
      this.$api
        .searchLinkPage(data)
        .then(res => {
          if (res.code == 200) {
            this.listQuery.fkOrgId = res.data.records[0].pkId;
            this.form.fkOrgId = res.data.records[0].pkId;
            this.loading = false;
            this.pagingDisplay();
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

    productDept() {
      // this.linkMan = null;
      // this.orgName = null;
      // this.telephone = null;

      this.show6 = true;
      this.basicStatus = false;
      this.$nextTick(() => {
        this.$refs.custom.reset();
        this.basicStatus = true;
      });
      // this.getOrgPageList();
    },
    // customSizeChange(val) {
    //   this.customPageSize = val;
    //   this.getOrgPageList();
    // },
    // customCurrentChange(val) {
    //   this.customPageNum = val;
    //   this.getOrgPageList();
    // },
    setOptionWidth(event) {
      // 下拉框弹出时，设置弹框的宽度
      this.$nextTick(() => {
        this.selectOptionWidth = event.srcElement.offsetWidth + "px";
      });
    },
    searchMajorTypeList(id, typeId) {
      // if(this.customData.fkEnginerringTypeId==undefined || this.customData.fkEnginerringTypeId==null){
      this.expertSortData = [];
      // }
      this.$api.searchMajorTypeList({ typeId: this.customData.fkEnginerringTypeId }).then(res => {
        if (res.code == 200) {
          let typeIdStatus = false;
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
            if (item.pkId == typeId) {
              typeIdStatus = true;
            }
          });
          this.expertSortData = res.data;
        }
      });
    },

    // getCustomizedWorkflowType(val) {
    //   this.$api.getCustomizedWorkflowType().then(res => {
    //     if (res.code == 200) {
    //       this.typeList = res.data;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },

    typeIdChange(val) {
      // this.customizedWorkflowPdf(val);
      if (this.form.workflowType == 1) {
        this.pitchOnDate = [];
        // this.workflowTypeChange(this.form.fkProfessionalTypeId, this.customData.fkEnginerringTypeId);
        this.tableProfessionalTypeId = this.form.fkProfessionalTypeId;
      }
    },

    //配置分项确认
    ensure() {
      let data = {
        pkId: this.showDate.pkId,
        items: this.defaultKey.toString(),
        fkOrgId: this.listQuery.fkOrgId
      };
      this.$api.customizedConfigurationItem(data).then(res => {
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: "配置成功"
          });
          this.pagingDisplay();
          this.show2 = false;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },

    ensureab(a, b, tableArr) {
      const _this = this;
      let workflowNodes = [];
      let endEventStatus = false;
      let startEventStatus = false;
      this.loading = true;
      if (a.businessObject.flowElements == undefined) {
        this.loading = false;
        return this.$message.error("流程图不能为空");
      }
      a.businessObject.flowElements.forEach(item => {
        if (item.$type == "bpmn:UserTask") {
          let workflowNodeTables = [];
          if (item.$attrs.tableIds == undefined || item.$attrs.tableIds.length == 0) {
          } else {
            if (typeof item.$attrs.tableIds == "string") {
              item.$attrs.tableIds = item.$attrs.tableIds.split(",");
            }
            if (typeof item.$attrs.archives == "string") {
              item.$attrs.archives = item.$attrs.archives.split(",");
            }
            item.$attrs.tableIds.forEach((e, index) => {
              if (e.length != 0 && e != null && e != "null" && e != "undefined") {
                workflowNodeTables.push(
                  e
                  //   {
                  //   fkTableId: e,
                  //   isArchives: item.$attrs.archives[index],
                  //   tableSource: item.$attrs.tableSource
                  // }
                );
              }
            });
          }

          workflowNodes.push({
            fkRoleId: item.$attrs.fkRoleId,
            name: item.name,
            nodeApproveType: item.$attrs.nodeApproveType,
            nodeType: 2,
            nodeMark: item.id,
            // tableIds: item.$attrs.tableIds,
            // tableSource: item.$attrs.tableSource,
            roleSource: item.$attrs.unitId == "-1" ? "1" : "0",
            fkUserId: item.$attrs.fkUserId,
            // archives: archives,
            tableIds: workflowNodeTables,
            // quantitiesTable: item.$attrs.quantitiesTable == true ? 1 : 0,
            // materialUsedTable: item.$attrs.materialUsedTable == true ? 1 : 0,
            // scoreFlag: item.$attrs.scoreFlag == true ? 1 : 0
            quantitiesTable: item.$attrs.quantitiesTable == true ? 1 : item.$attrs.quantitiesTable == 1 ? 1 : item.$attrs.quantitiesTable == "true" ? 1 : 0,
            materialUsedTable: item.$attrs.materialUsedTable == true ? 1 : item.$attrs.materialUsedTable == 1 ? 1 : item.$attrs.materialUsedTable == "true" ? 1 : 0,
            scoreFlag: item.$attrs.scoreFlag == true ? 1 : item.$attrs.scoreFlag == 1 ? 1 : item.$attrs.scoreFlag == "true" ? 1 : 0
          });
        }
        if (item.$type == "bpmn:EndEvent") {
          endEventStatus = true;
        }
        if (item.$type == "bpmn:StartEvent") {
          startEventStatus = true;
        }
      });

      if (startEventStatus) {
        workflowNodes.unshift({
          nodeType: 0,
          name: "开始"
        });
      } else {
        this.loading = false;
        return this.$message({
          type: "info",
          message: "流程图没有开始事件"
        });
      }

      if (endEventStatus) {
        workflowNodes.push({
          nodeType: 1,
          name: "结束"
        });
      } else {
        this.loading = false;
        return this.$message({
          type: "error",
          message: "流程图没有结束事件"
        });
      }

      workflowNodes.forEach((item, i) => {
        item.sortval = i;
      });
      // }

      b.saveXML({ format: true }, (err, xml) => {
        // let str =  xml.replaceAll('name=\"undefined\"',"")
        // str =  str.replaceAll('name=\"null\"',"")
        let str = xml.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        let data = {
          bpmnContent: str,
          fkEnginerringTypeId: _this.customData.fkEnginerringTypeId,
          workflowName: _this.form.workflowName,
          workflowType: _this.form.workflowType,
          remark: _this.form.remark,
          fkProfessionalTypeId: _this.form.fkProfessionalTypeId,
          workflowNodes: workflowNodes,
          fkOrgId: _this.listQuery.fkOrgId
          // type: _this.form.type
        };

        let tableArrAy = [];
        if (tableArr.length) {
          tableArr.forEach(item => {
            if (item.tableId != "") {
              tableArrAy.push(
                item.tableId
                //   {
                //   fkTableId: item.tableId,
                //   isArchives: item.isArchives,
                //   tableSource: item.tableSource
                // }
              );
            }
          });
        }
        // tableArr.forEach(item=>{
        //   // item.fkTableId =item.tableId
        //   delete item.tableId
        // })
        // 最终工序评分
        let scoreFlagStatus = false;
        if (data.workflowType == 13) {
          scoreFlagStatus = true;
          for (let i = 0; i < data.workflowNodes.length; i++) {
            if (data.workflowNodes[i].nodeType == 2 && data.workflowNodes[i].scoreFlag) {
              scoreFlagStatus = false;
            }
            if (data.workflowNodes[i].scoreFlag && data.workflowNodes[i].tableIds.length == 0) {
              this.loading = false;
              return this.$message.warning("评分节点必须关联一个评定表");
            }
          }
        }
        if (scoreFlagStatus) {
          this.loading = false;
          return this.$message.warning("最终验收工序必须设置一个评分节点");
        }
        data.tableIds = tableArrAy;
        if (data.workflowType == 0 || data.workflowType == 13) {
          data.pdfIdList = this.pdfListData;
        } else {
          data.launchType = this.launchType;
          if (data.launchType == 1) {
            data.fkRoleId = this.fkRoleId;
          }
        }
        if ((this.customData.orgType == "2" || this.customData.orgType == "3" || this.customData.orgType == "9") && this.typeWorkflowType == "4") {
          data.fkBidProjectId = this.form.fkBidProjectId;
        }
        if (this.addTitle == "新增流程") {
          this.$api
            .customizedAddFlow(data)
            .then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.$message({
                  type: "success",
                  message: "新增成功"
                });
                _this.show1 = false;
                _this.subentryShow = false;
                _this.pagingDisplay();
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
        } else if (this.addTitle == "编辑流程") {
          data.pkId = _this.form.pkId;
          this.$api
            .customizedBaseWorkflowUpdate(data)
            .then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.$message({
                  type: "success",
                  message: "编辑成功"
                });
                _this.show1 = false;
                _this.subentryShow = false;
                _this.pagingDisplay();
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
        }
      });
    },
    setCheckedNodes(nodes) {
      this.defaultKey = this.$refs.treeDefaultKey.getCheckedKeys();
    },
    //新增修改确认
    addFlowSubmit(formName) {
      const _this = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.form.workflowType == 1) {
            this.pitchOnDate = this.$refs.productionApproval.pitchOnDate;
            if (this.pitchOnDate.length == 0) {
              return _this.$message({
                type: "warning",
                message: "请选择流程节点"
              });
            }
            let arr = [{ nodeType: 0, sortval: 0 }];
            this.loading = true;
            let tableIds = this.$refs.productionApproval.tableIds.filter(item => item.fkTableId).map(item => item.fkTableId);
            this.pitchOnDate.forEach((item, idx) => {
              if (item.materialUsedTable == null || item.materialUsedTable == undefined) {
                item.materialUsedTable = 0;
              }
              if (item.quantitiesTable == null || item.quantitiesTable == undefined) {
                item.quantitiesTable = 0;
              }
              if (item.scoreFlag == null || item.scoreFlag == undefined) {
                item.scoreFlag = 0;
              }
              let itemTableList = [];
              if (item.tableDTOS != undefined && item.tableDTOS.length != 0) {
                item.tableDTOS.forEach(s => {
                  if (s.fkTableId.length != 0) {
                    itemTableList.push(
                      s.fkTableId
                      //   {
                      //   isArchives: i.isArchives,
                      //   fkTableId: s.fkTableId,
                      //   tableSource: s.tableSource
                      // }
                    );
                  }
                });
              }

              arr.push({
                name: item.workflowName,
                nodeType: 3,
                sortval: idx + 1,
                fkWorkflowId: item.fkWorkflowId == undefined ? item.pkId : item.fkWorkflowId,
                materialUsedTable: item.materialUsedTable,
                quantitiesTable: item.quantitiesTable,
                scoreFlag: item.scoreFlag,
                // tableIds: item.tableDTOS == Object ? item.tableDTOS.pkId : item.tableDTOS,
                tableIds: itemTableList,
                pdfIdList: item.bookPdfDTOS
              });
            });
            arr.push({ nodeType: 1, sortval: arr.length });
            let data = {
              bpmnContent: this.pitchOnDate[0].bpmnContent,
              fkEnginerringTypeId: _this.customData.fkEnginerringTypeId,
              workflowName: _this.form.workflowName,
              workflowType: _this.form.workflowType,
              fkProfessionalTypeId: _this.form.fkProfessionalTypeId,
              remark: _this.form.remark,
              workflowNodes: arr,
              fkOrgId: _this.listQuery.fkOrgId,
              tableIds
            };
            data.launchType = this.$refs.productionApproval.launchType;
            if (data.launchType == 1) {
              data.fkRoleId = this.$refs.productionApproval.fkRoleId;
            }
            if (this.addTitle == "新增流程") {
              this.$api
                .customizedAddFlow(data)
                .then(res => {
                  if (res.code == 200) {
                    this.loading = false;
                    this.$message({
                      type: "success",
                      message: "新增成功"
                    });
                    _this.show1 = false;
                    _this.subentryShow = false;
                    _this.pagingDisplay();
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
            } else {
              let tableIdsArr = [];
              let arr = [{ nodeType: 0, sortval: 0 }];
              this.pitchOnDate.forEach((item, idx) => {
                tableIdsArr = [];
                if (item.tableDTOS == null || item.tableDTOS.length == 0) {
                  tableIdsArr = [];
                } else {
                  if (item.tableDTOS[0].fkTableId != undefined) {
                    item.tableDTOS.forEach(i => {
                      if (i.fkTableId.length != 0) {
                        // tableIdsArr.push({ fkTableId: i.fkTableId, isArchives: i.isArchives, tableSource: i.tableSource });
                        tableIdsArr.push(i.fkTableId);
                      }
                    });
                  }
                }
                arr.push({
                  name: item.workflowName,
                  nodeType: 3,
                  sortval: idx + 1,
                  fkWorkflowId: item.fkWorkflowId == undefined ? item.pkId : item.fkWorkflowId,
                  pkId: item.pkId,
                  materialUsedTable: item.materialUsedTable,
                  quantitiesTable: item.quantitiesTable,
                  scoreFlag: item.scoreFlag,
                  // tableIds: tableIdsArr,
                  pdfIdList: item.bookPdfDTOS,
                  tableIds: tableIdsArr
                });
              });

              arr.push({ nodeType: 1, sortval: arr.length });
              let data = {
                bpmnContent: this.pitchOnDate[0].bpmnContent,
                fkEnginerringTypeId: _this.customData.fkEnginerringTypeId,
                workflowName: _this.form.workflowName,
                workflowType: _this.form.workflowType,
                fkProfessionalTypeId: _this.form.fkProfessionalTypeId,
                remark: _this.form.remark,
                workflowNodes: arr,
                pkId: _this.form.pkId,
                fkOrgId: _this.listQuery.fkOrgId,
                tableIds
              };
              data.bpmnContent = this.form.bpmnContent;
              data.launchType = this.$refs.productionApproval.launchType;
              if (data.launchType == 1) {
                data.fkRoleId = this.$refs.productionApproval.fkRoleId;
              }
              this.$api
                .customizedBaseWorkflowUpdate(data)
                .then(res => {
                  if (res.code == 200) {
                    this.loading = false;
                    this.$message({
                      type: "success",
                      message: "编辑成功"
                    });
                    _this.show1 = false;
                    _this.subentryShow = false;
                    _this.pagingDisplay();
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
            }
          } else {
            this.$refs.regPanl.dataOh();
          }
        } else {
          return false;
        }
      });
    },
    // 分页列表
    pagingDisplay() {
      this.loading = true;
      this.listQuery.fkOrgId = this.customData.pkId;
      this.listQuery.workflowType = this.typeWorkflowType;
      this.$api
        .customizedWorkflowSearch(this.listQuery)
        .then(res => {
          if (res.code == 200) {
            this.tableData = res.data.records;
            this.totalCount = parseInt(res.data.total);
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
    //查询
    search(form) {
      this.listQuery.pageNum = 1;
      this.pagingDisplay();
    },
    //页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.pagingDisplay();
    },
    //页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.pagingDisplay();
    },
    // 查看
    examine(row) {
      this.messageType = "1";
      this.editStatus = false;
      this.loading = true;
      if (row.workflowType == 1) {
        this.pitchOnDate = [];
        this.show1 = true;
        this.radioStatus = false;
        this.marginNum = "70px 0";
        this.addTitle = "查看流程";
        // this.workflowTypeChange(row.fkProfessionalTypeId, row.fkEnginerringTypeId);
        let ss = row.fkProfessionalTypeId == 0 ? row.fkEnginerringTypeId : row.fkProfessionalTypeId;

        this.$api
          .customizedFindWorkflowTemplateById({ pkId: row.pkId })
          .then(res => {
            if (res.code == 200) {
              res.data.workflowType = res.data.workflowType.toString();
              this.form = res.data;
              this.$nextTick(() => {
                this.$refs.productionApproval.editInit(res.data, false);
              });
              // let arr = [];
              // res.data.workflowNodeDTOS.forEach(item => {
              //   if (item.nodeType == 3) {
              //     arr.push(item);
              //   }
              // });
              // let nodeList = res.data.nodeList.join(",");
              // this.$api
              //   .customWorkflowById({ pkIds: nodeList })
              //   .then(res => {
              //     if (res.code == 200) {
              //       let arr1 = res.data;
              //       arr.forEach(item => {
              //         arr1.forEach(e => {
              //           if (item.pkId == e.pkId) {
              //             item.isActive = true;
              //           }
              //         });
              //       });
              //       arr1.forEach(item => {
              //         arr.forEach(e => {
              //           if (item.pkId == e.fkWorkflowId) {
              //             e.bpmnContent = item.bpmnContent;
              //             e.workflowName = item.workflowName;
              //             e.workflowType = item.workflowType;
              //           }
              //         });
              //       });
              //       this.pitchOnDate = arr;
              //       this.loading = false;
              //     } else {
              //       this.loading = false;
              //       this.$message({
              //         type: "error",
              //         message: res.msg
              //       });
              //     }
              //   })
              //   .catch(err => {
              //     this.loading = false;
              //   });
              // this.pitchOnDate = newArr;
              this.loading = false;
            } else {
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        this.$api
          .customizedFindWorkflowTemplateById({ pkId: row.pkId })
          .then(res => {
            if (res.code == 200) {
              this.flowTableArr = res.data.tableIds;
              // this.flowTableArr = res.data.
              this.show3 = true;
              this.addTitle = "查看流程";
              res.data.workflowType = res.data.workflowType.toString();
              this.form = res.data;
              this.XmlStr = res.data.bpmnContent;
              if (row.workflowType == 5) {
                res.data.type = res.data.type.toString();
                // this.getCustomizedWorkflowType();
                this.warehouseType = res.data.type;
              }
              // if (this.$refs.examineBpmn != undefined) {
              this.$nextTick(() => {
                this.$refs.examineBpmn.exportDiagram(res.data.bpmnContent, res.data.workflowTableList, res.data);
              });

              // }
              this.loading = false;
            } else {
              this.loading = false;
            }
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    //编辑流程
    designFlow(row) {
      this.editStatus = true;
      if (row.workflowType == 8) {
        this.getEOrgSealState();
      } else {
        this.unnamedType = "";
      }
      this.seedDate = row;
      this.show1 = true;
      this.radioStatus = false;
      this.marginNum = "70px 0";
      this.addTitle = "编辑流程";
      this.loading = true;
      if (row.workflowType == 1) {
        this.nodeShow = false;
        this.pitchOnDate = [];
        let data = row.fkProfessionalTypeId == 0 ? row.fkEnginerringTypeId : row.fkProfessionalTypeId;
        this.tableProfessionalTypeId = row.fkProfessionalTypeId;
        this.$api
          .customizedFindWorkflowTemplateById({ pkId: row.pkId })
          .then(res => {
            if (res.code == 200) {
              res.data.workflowType = res.data.workflowType.toString();
              this.form = res.data;

              this.loading = false;
              this.$nextTick(() => {
                this.$refs.productionApproval.editInit(res.data, true);
              });
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
      } else {
        this.$api
          .customizedFindWorkflowTemplateById({
            pkId: row.pkId
          })
          .then(res => {
            if (res.code == 200) {
              this.flowTableArr = res.data.workflowTableList;
              res.data.workflowType = res.data.workflowType.toString();

              if (row.workflowType == 5) {
                res.data.type = res.data.type.toString();
                // this.getCustomizedWorkflowType();
                this.warehouseType = res.data.type;
              }
              if ((this.customData.orgType == "2" || this.customData.orgType == "3" || this.customData.orgType == "9") && res.data.workflowType == "4") {
                this.searchByProjectIdOperation(res.data.fkProjectId);
              }
              this.form = res.data;
              if (this.$refs.regPanl != undefined) {
                // workflowTableList
                this.$refs.regPanl.exportDiagram(res.data.bpmnContent, this.addTitle, this.flowTableArr, res.data);
              }
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
      }
    },
    getEOrgSealState() {
      this.$api.operationCustomizedWorkflow({ fkOrgId: this.listQuery.fkOrgId }).then(res => {
        if (res.code == 200) {
          if (res.data == 0) {
            this.unnamedType = 0;
          } else if (res.data == 2) {
            this.unnamedType = 2;
          } else {
            this.unnamedType = "";
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    //删除
    remove(row) {
      const _this = this;
      _this
        .$confirm("确认删除该流程内容?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.customizedDeleteFlow({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功"
              });
              this.pagingDisplay();
            } else {
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    //新增
    addFlow() {
      // this.expertSortData = [];
      // this.form = {}
      this.fkBidProjectIArr = [];
      this.editStatus = true;
      this.unnamedType = "";
      this.form.fkProfessionalTypeId = "";
      this.form.workflowName = "";
      this.form.type = "";
      this.form.remark = "";
      this.form.fkProjectId=""
      this.form.fkBidProjectId=""
      this.radioStatus = false;
      this.marginNum = "70px 0";
      this.form.workflowType = this.typeWorkflowType;
      this.show1 = true;
      this.nodeShow = false;
      this.addTitle = "新增流程";

      this.pitchOnDate = [];
      // if (this.$refs.formDate != undefined) {

      // }
      this.$nextTick(() => {
        this.$refs.formDate.resetFields();
        if (this.$refs.form != undefined) {
          this.$refs.formDate.resetFields();
          this.form.workflowType = this.typeWorkflowType;
        }
        if (this.$refs.regPanl != undefined) {
          this.$refs.regPanl.intCreateNewDiagram();
        }
        if (this.typeWorkflowType == "1") {
          this.$refs.productionApproval.init();
        }
      });
      this.form.workflowType = this.typeWorkflowType;
      this.listQuery.fkOrgId = this.customData.pkId;
    },
    //配置分项工程
    apportion(row) {
      this.show2 = true;
      this.termQueryEPC(row.pkId, row.fkProfessionalTypeId, row.publishStatus, row.fkEnginerringTypeId);
      this.showDate = row;
      this.defaultKey = [];
      if (this.$refs.treeDefaultKey != undefined) {
        this.$refs.treeDefaultKey.setCheckedKeys([]);
      }
      if (row.items != undefined && row.items != null && row.items.length != 0) {
        row.items.forEach(item => {
          this.defaultKey.push(item.pkId);
        });
      }
    },

    //配置分项工程
    termQueryEPC(pkId, id, status, typeId) {
      let data = id == 0 ? typeId : id;
      this.$api.customizedSearchItemsByOrgId({ fkOrgId: this.listQuery.fkOrgId, workflowId: pkId }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.prodItemLists.forEach(i => {
              i.prodItemLists.forEach(j => {
                if (j.isDisabled == 1) {
                  j.disabled = true;
                } else {
                  j.disabled = false;
                }
              });
            });
          });
          this.subentryData = res.data;
          return;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
// /deep/ .el-dialog__header {
//   background-color: #d7d7d7 !important;
// }
/deep/ .el-dialog__body {
  padding: 0 0px 10px;
}

.examineBpmn /deep/ .djs-palette {
  display: none;
}

/deep/ svg a {
  display: none;
}

/deep/ .el-form--inline {
  margin-bottom: 0;
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
    position: relative;

    .header-query {
      position: fixed;
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

/deep/ .canvas a {
  display: none !important;
}

/deep/ .el-tree {
  // 不可全选样式
  .el-tree-node {
    .is-leaf + .el-checkbox .el-checkbox__inner {
      display: inline-block;
    }

    .el-checkbox .el-checkbox__inner {
      display: none;
    }
  }
}

.status {
  padding: 2px;
  color: #fff;
}

.statuscg {
  background: #67c23a;
}

.statuswfb {
  background: #909399;
}

/deep/ .el-select__tags-text {
  width: 50px !important;
}

.headline {
  line-height: 50px;
  background: #fff;
  font-size: 12px;

  .item {
    padding: 0 20px;
  }
}

.flowChart-btn {
  color: #409eff;
}

.flowChart-btn:hover {
  cursor: pointer;
}

/deep/ .table-data {
  margin-top: 10px;
}

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}

.h-78 {
  height: 68%;
}

.h-85 {
  height: 81%;
}

/deep/ .el-dialog__body .table-data {
  margin-top: 0 !important;
  padding-top: 0;
}

.violet {
  border: 2px dashed #c280ff !important;
}

.h-500 {
  height: 500px;
  text-align: center;
  padding-top: 12%;
  font-size: 30px;
  font-weight: 500;
}
.wh-150 {
  width: 150px !important;
}
.acceptance-header {
  /deep/ .el-tabs__header {
    margin: 0;
    background-color: #fff;
  }
  /deep/ .el-tabs__nav {
    margin-left: 35% !important;
  }
}
.add-btn {
  position: absolute;
  right: 50px;
  top: 27px;
}
.acceptDia {
  display: flex;
  width: 100%;
  .acceptDia-right {
    flex: 1;
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
      .mt-10 {
        margin-top: 10px;
      }
    }
  }
  .itemTree {
    width: 300px;
    height: 562px;
    border-right: 1px solid #e8f0f4;
    /deep/ .el-tree {
      width: 300px;
      height: 580px;
      overflow: auto;
    }
    .left-table {
      line-height: 30px;
      padding-left: 10px;
      // background: #f2f2f2;
    }
    .left-table-set {
      background: #81d3f8;
    }
    // background: #81d3f8;
  }
}
</style>
