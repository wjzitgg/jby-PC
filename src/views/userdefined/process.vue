<template>
  <div class="app-container">
    <el-tabs v-model="tabPosition"  @tab-click="tabPositionClick">
      <el-tab-pane v-for="(item, index) in typeData" :key="index" :label="item.label" :name="item.value"></el-tab-pane>
      <!-- <el-tab-pane label="验收流程" name="fenx"></el-tab-pane> -->
    </el-tabs>
    <!-- <div style="position: relative">
      <search-bar  class="search-bar-demo" @search="search" :options="searchOptions"
        :total="totalCount" labelWidth="8em" ref="searchBar" :showHandler="false" @change="change"
        style="margin-bottom: 0"></search-bar>
      <el-button  type="primary" size="mini"
        style="position: absolute; right: 18px; top: 11px" @click="addFlow">新增自定义流程</el-button>
    </div> -->
    <div v-show="tabPosition == '4' || tabPosition == '8'" class="search-bar-box" style="position: relative">
      <span v-show="tabPosition == '8' || (tabPosition == '4' && user.orgType == 2)">流程名称</span>
      <el-input v-show="tabPosition == '8'|| (tabPosition == '4' && user.orgType == 2)" v-model="listQuery.workflowName" placeholder="请输入流程名称" size="mini" class="wh-200" maxlength="50"></el-input>
      <el-button type="primary" v-show="tabPosition == '8' || (tabPosition == '4' && user.orgType == 2)" size="mini" icon="el-icon-search" class="ml-20 el-button-primary" @click="search">查询</el-button>
      <el-button type="primary" v-show="tabPosition == '4' && user.isBinding ==1" size="mini"  v-has="'userdefined:process:examine'" :disabled="![1].includes(disabledType)" class="el-button-primary" @click="batch(0)">批量提交审批</el-button>
      <el-button type="primary" v-show="tabPosition == '4' && user.isBinding ==1" size="mini" v-has="'userdefined:process:withdraw'" :disabled="![2].includes(disabledType)" class="el-button-primary" @click="batch(1)">批量撤回</el-button>
      <el-button type="primary" v-show="tabPosition == '4' && user.isBinding ==1" size="mini" v-has="'userdefined:process:applyWithdraw'" :disabled="![3].includes(disabledType)" class="el-button-primary" @click="batch(2)">批量申请撤回</el-button>
      <el-button type="primary" size="mini" class="search-mr el-button-primary" @click="addFlow">新增流程</el-button>
    </div>
    <div class="tab-container table-data" :style="{ marginTop: '10px', height: tableHt }">
      <el-table :data="tableData" table-data height="90%" style="width: 100%" :key="tabPosition" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" ref="tableDataS">
        <el-table-column align="center" label="选择" min-width="60" v-if="tabPosition == '4'&&user.orgType!=2">
          <template slot-scope="{ row }">
            <div style="text-align: center">
              <el-checkbox @change="checkBoxChange($event, row)" :value="isCheck(row)" :disabled="chekDisable(row)" class="mychecked"></el-checkbox>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column type="selection" width="50"></el-table-column> -->
        <el-table-column align="center" label="序号" min-width="60" v-else>
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" v-if="tabPosition == '4' && (user.orgType == 2 ||user.orgType == 3 || user.orgType == 9)" prop="fkProjectName" label="项目" min-width="130"></el-table-column>
        <el-table-column align="center" v-if="tabPosition == '4' && (user.orgType == 2 ||user.orgType == 3 ||user.orgType == 4 || user.orgType == 9)" prop="fkBidProjectName" label="标段" min-width="130"></el-table-column>
        <el-table-column align="center" prop="workflowName" label="流程名称" min-width="130"></el-table-column>
        <el-table-column align="center" v-if="(tabPosition == '4' || tabPosition == '2')&&user.orgType!=2" prop="examineStatus" label="状态" min-width="90"></el-table-column>
        <el-table-column align="center" v-if="tabPosition == '8'" prop="completeItemName" label="应用场景" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="updateUser" label="最后修改人" min-width="90"></el-table-column>
        <el-table-column align="center" prop="updateTime" label="最后修改时间" min-width="120"></el-table-column>
        <el-table-column align="center" prop="alarmLevel" label="操作" min-width="240">
          <template slot-scope="scope">
            <el-button plain type="primary" size="mini" @click.native="examine(scope.row)">查看</el-button>
            <el-button plain type="primary" v-if="scope.row.updateStatus ==1" size="mini" @click.native="designFlow(scope.row)">编辑流程</el-button>
            <el-button plain type="primary" size="mini" v-has="'userdefined:process:examine'" v-if="scope.row.submitApproveStatus==1" @click.native="btnClick(scope.row,0)">提交审批</el-button>
            <el-button plain type="primary" size="mini" v-has="'userdefined:process:withdraw'" v-if="scope.row.revokeStatus==1" @click.native="btnClick(scope.row,1)">撤回</el-button>
            <el-button plain type="primary" size="mini" v-has="'userdefined:process:applyWithdraw'" v-if="scope.row.applyRevokeStatus==1" @click.native="btnClick(scope.row,2)">申请撤回</el-button>
            <el-button plain type="danger" v-if="scope.row.deleteStatus ==1" size="mini" @click.native="remove(scope.row)">删除</el-button>
            <el-button type="primary" plain size="mini" v-show="tabPosition == '8'" v-has="'userdefined:process:configure'" @click.native="sceneClick(scope.row)">配置场景</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
    </div>

    <!-- <div v-show="tabPosition == 'fenx'" class="tab-container table-data" style="height: 93%;">
      <el-table :data="searchData" table-data height="92%" style="width: 100%" v-loading="loading"
        :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }">
        <el-table-column align="center" label="序号" min-width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="itemCode" label="编号"></el-table-column>
        <el-table-column align="center" prop="itemName" label="项目名称"></el-table-column>
        <el-table-column align="center" prop="statusName" label="流程图">
          <template slot-scope="scope">
            <div v-if="scope.row.grade == 3">
              <div class="flowChart-btn" type="text" @click="inEstimate(scope.row.fkWorkflowId)">{{ scope.row.workflowName
              }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="examineStatus" label="状态" v-if="user.isBinding == 1">
          <template slot-scope="scope">
            <span v-if="scope.row.examineStatus == 0">未发起审核</span>
            <span v-if="scope.row.examineStatus == 1">审核中</span>
            <span v-if="scope.row.examineStatus == 2">审核通过</span>
            <span v-if="scope.row.examineStatus == 3">已驳回</span>
            <span v-if="scope.row.examineStatus == 3">申请撤回中</span>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" prop="alarmLevel" label="操作" min-width="210">
          <template slot-scope="scope">
            <div v-if="scope.row.grade == 3 && scope.row.fkWorkflowId != 0">
              <el-button v-if="scope.row.queryStatus == 1" plain type="primary" @click="particulars(scope.row, 3)"
                size="mini">查看流程</el-button>
              <el-button v-if="user.isBinding == 1 && scope.row.submitApproveStatus == 1" plain type="primary"
                @click="particulars(scope.row, 0)" size="mini">提交审批</el-button>
              <el-button v-if="scope.row.revokeStatus == 1" plain type="danger" @click="particulars(scope.row, 1)"
                size="mini">撤回</el-button>
              <el-button v-if="scope.row.applyRevokeStatus == 1" plain type="primary" @click="particulars(scope.row, 2)"
                size="mini">申请撤回</el-button>
              <el-button plain type="primary" v-if="scope.row.updateStatus == 1" size="mini"
                @click.native="inspectionReport(scope.row)">设置流程</el-button>
              <el-button plain type="primary" size="mini" v-if="scope.row.quoteUpdateStatus == 1"
                @click.native="referEditor(scope.row)">引用编辑</el-button>
              <el-button plain type="primary" v-if="scope.row.switchStatus == 1" @click="switchover(scope.row)"
                size="mini">切换流程模板</el-button>
            </div>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div> -->
    <!-- 新建 设计流程弹窗 -->
    <el-dialog :title="addTitle" :visible.sync="show1" width="90%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <!-- 流程属性 -->
      <el-form :model="form" :rules="rulesa" ref="formDates" style="padding: 12px 10px 0 0">
        <el-row>
          <!-- <el-col :span="4">
            <el-form-item label="流程类型" prop="workflowType" :label-width="formLabelWidth">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" style="width: 100%" placeholder="请选择" size="mini" v-model="form.workflowType" @change="workflowTypeChang">
                <el-option v-for="item in typeData" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="4" v-if="form.workflowType == '0' || form.workflowType == '1' || form.workflowType == '13'">
            <el-form-item label="专业类别" prop="fkProfessionalTypeId" :label-width="formLabelWidth">
              <el-select :disabled="(addTitle == '编辑流程' || addTitle == '查看流程') && form.fkProfessionalTypeId != 0" style="width: 100%" placeholder="请选择" size="mini" @change="typeIdChange" v-model="form.fkProfessionalTypeId">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="流程名称" prop="workflowName" :label-width="formLabelWidth">
              <el-input :disabled="addTitle == '查看流程'" v-model="form.workflowName" size="mini"  maxlength="50"></el-input>
            </el-form-item>
          </el-col>
          <!--  -->
          <el-col :span="4" v-if="(user.orgType == '2' || user.orgType == '3' || user.orgType == '9') && tabPosition == '4'">
            <el-form-item label="项目" prop="fkProjectId" :label-width="formLabelWidth">
              <el-select style="width: 100%" placeholder="请选择" size="mini" @change="projectByOrgIdChange" v-model="form.fkProjectId">
                <el-option v-for="item in projectByOrgIdArr" :key="item.pkId" :label="item.projectName" :value="item.pkId"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="(user.orgType == '2' || user.orgType == '3' || user.orgType == '9') && tabPosition == '4'">
            <el-form-item label="标段" prop="fkBidProjectId" :label-width="formLabelWidth">
              <el-select style="width: 100%" placeholder="请选择" size="mini" v-model="form.fkBidProjectId">
                <el-option v-for="item in fkBidProjectIArr" :key="item.fkBidProjectId" :label="item.fkBidProjectName" :value="item.fkBidProjectId"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!--  -->
          <el-col :span="4" v-if="form.workflowType == 5 && user.orgType == 5">
            <el-form-item label="盘点仓库类型" prop="type" label-width="110px">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" @change="warehouseTypeChange" style="width: 100%" placeholder="请选择" size="mini" v-model="form.type">
                <el-option v-for="item in typeList" :key="item.key" :label="item.name" :value="item.key"> </el-option>
              </el-select>
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
      <div v-if="form.workflowType != 1 && unnamedType.length == 0">
        <panl-show :fkEnginerringTypeId="user.fkEnginerringTypeId" :fkProfessionalTypeId="form.fkProfessionalTypeId" :fkOrgId="user.fkOrgId" style="width: 100%; height: 450px" ref="regPanl" @ensureab="ensureab" :workflowType="form.workflowType" :tableSource="'1'"
         :flowTableArr="flowTableArr" :addTitle="addTitle" :fkWorkflowId="formFkWorkflowId"  @pdfList="pdfList" @launchInit="launchInit"></panl-show>
      </div>
      <!-- 生产验收流程 -->
      <div class="productionApproval" style="height: 450px" v-if="form.workflowType == 1 && unnamedType.length == 0">
        <div class="left" id="left" v-show="addTitle != '查看流程'">
          <div class="header-query">
            <el-select size="mini" v-if="radioStatus" v-model="radio" @change="radioChange" placeholder="请选择">
              <el-option label="全部" value="0"> </el-option>
              <el-option label="系统工序" value="1"> </el-option>
              <el-option label="自定义工序" value="2"> </el-option>
            </el-select>
            <div style="background-color: #ccc; margin: 0 auto; text-align: center; padding: 5px" @click="link">生产施工工序</div>
            <el-input size="mini" v-model="workflowNameLike" style="margin-top: 6px">
              <i class="el-icon-search el-input__icon" slot="suffix" @click="workflowNameLikeQuery"></i>
            </el-input>
          </div>
          <div :style="{ margin: marginNum }">
            <div id="mao-dian"></div>
            <div class="item" v-for="item in productionApproval" v-show="item.workflowType != '13'" :class="{ active: item.isActive == true, violet: item.workflowType == '13' }" :key="item.pkId" @click="itemClick(item)">
              {{ item.workflowName }}
            </div>
            <div style="background-color: #ccc; margin: 0 auto; text-align: center; margin-top: 6px; padding: 5px">最终质量验收工序</div>
            <div class="item" v-for="(item, index) in productionApproval" v-show="item.workflowType == '13'" :class="{ active: item.isActive == true, violet: item.workflowType == '13' }" :key="index" @click="itemClick(item)">
              {{ item.workflowName }}
            </div>
          </div>
        </div>
        <div class="center">
          <div class="kaishi">
            <span>开始</span>
          </div>
          <img src="../../assets/jiantou.svg" class="jiantou" alt="" />
          <div v-for="(item, index) in pitchOnDate" :key="index" @click="bpmShowClick(item)">
            <div class="bpmShow">
              <div class="box">
                <bpm-show v-if="!bpmnContentStatus" :bpmnContent="item.bpmnContent" style="width: 100%" ref="bpmShow" @ensureab="ensureab"></bpm-show>
              </div>
              <span class="bpmShowxshou">{{ item.workflowName }}</span>
              <div style="position: absolute; right: 8px; top: 8px; z-index: 1000">
                <el-button v-if="index != pitchOnDate.length - 1 && addTitle != '查看流程' && pitchOnDate[index + 1].workflowType != 13" class="bpmShowxshouButm" @click.stop="itemDown(pitchOnDate, index)" type="primary" icon="el-icon-bottom" size="mini" circle></el-button>
                <el-button class="bpmShowxshouButm" v-if="index != 0 && addTitle != '查看流程' && pitchOnDate[index].workflowType != 13" @click.stop="itemUpward(pitchOnDate, index)" type="primary" icon="el-icon-top" size="mini" circle></el-button>
                <el-button class="bpmShowxshouButm" v-if="addTitle != '查看流程'" @click.stop="itemDelete(item, index)" type="danger" icon="el-icon-delete" size="mini" circle></el-button>
                <el-button class="bpmShowxshouButm" v-if="addTitle != '查看流程' && addTitle != '新增流程'" @click.stop="editSeed(item, index)" size="mini" type="primary" icon="el-icon-edit" circle></el-button>
              </div>
            </div>
            <img src="../../assets/jiantou.svg" class="jiantou" alt="" />
          </div>
          <div class="kaishi jieshu">
            <span>结束</span>
          </div>
        </div>
        <div class="right">
          <div class="title">节点信息</div>
          <div class="panleTitle" v-if="nodeShow"><i class="el-icon-info"></i> 常规</div>
          <div v-if="nodeShow">
            <el-form :model="form" :rules="rules" ref="nodeForm" style="padding: 0">
              <el-form-item label="节点名称" :label-width="formLabelWidth" style="margin-right: 6px">
                <el-input disabled v-model="fieldListform.name" size="mini" autocomplete="off"></el-input>
              </el-form-item>
              <div class="panleTitle"><i class="el-icon-s-order"></i> 节点设置</div>
              <el-form-item label="技术规范">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select clearable placeholder="请选择" size="mini" :disabled="addTitle == '查看流程'" v-model="fieldListform.technology" @change="technologyChang">
                      <el-option v-for="i in technologyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input clearable :disabled="addTitle == '查看流程'" size="mini" type="number" @input="jsThePageChang" oninput="value=value.replace(/[^\d.]/g,'')" v-model="fieldListform.jsThePage" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input clearable :disabled="addTitle == '查看流程'" oninput="value=value.replace(/[^\d.]/g,'')" size="mini" type="number" @blur="jsToPageChang" v-model="fieldListform.jsToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </el-form-item>
              <el-form-item label="安全规范">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select :disabled="addTitle == '查看流程'" clearable placeholder="请选择" size="mini" @change="safetyChange" v-model="fieldListform.safety">
                      <el-option v-for="i in safetyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input :disabled="addTitle == '查看流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" @input="aqThePageChang" v-model="fieldListform.aqThePage" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input :disabled="addTitle == '查看流程'" clearable size="mini" @blur="aqToPageChang" v-model="fieldListform.aqToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </el-form-item>
              <el-form-item label="验收标准">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select :disabled="addTitle == '查看流程'" clearable placeholder="请选择" size="mini" @change="standardChange" v-model="fieldListform.standard">
                      <el-option v-for="i in acceptanceLevel" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input :disabled="addTitle == '查看流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" v-model="fieldListform.ysThePage" @input="ysThePageChange" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input :disabled="addTitle == '查看流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" @blur="ysToPageChang" v-model="fieldListform.ysToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </el-form-item>
              <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设置设置</div>
              <!-- <div class="panleCenten" style="line-height: 30px ;margin: 0;padding: 0px 10px;">
                <el-radio-group v-model="tableTypeSource">
                  <el-radio :label="'1'">自定义</el-radio>
                </el-radio-group>
              </div> -->
              <el-form-item prop="date1" style="max-height: 80px; overflow: auto; border-top: 1px solid; border-bottom: 1px solid">
                <el-row v-for="(item, index) in fieldListform.tableIds" :key="index" style="margin: 4px 0px">
                  <el-col :span="15">
                    <el-select :disabled="addTitle == '查看流程'" style="width: 100%" filterable v-model="item.fkTableId" @change="tableIdsChange" placeholder="请选择" size="mini">
                      <el-tooltip v-for="i in relatedForm" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                        <el-option style="width: 200px" :disabled="fieldListform.tableIds.find(s => s.fkTableId === i.pkId) == undefined ? false : true" :value="i.pkId" :label="i.tableName"></el-option>
                      </el-tooltip>
                    </el-select>
                  </el-col>
                  <el-col :span="5" style="padding-left: 2px" v-if="user.orgType == 5">
                    <el-checkbox v-model="item.isArchives" :true-label="0" :false-label="1" @change="isArchivesChange" :disabled="addTitle == '查看流程'">档案表</el-checkbox>
                  </el-col>
                  <el-col :span="4" style="line-height: 28px; padding-left: 2px" v-if="addTitle != '查看流程'">
                    <i class="el-icon-circle-plus-outline" style="color: #2680f0; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index == 0" @click="tableIdsAdd"></i>
                    <i class="el-icon-remove-outline" style="color: red; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index != 0" @click="tableIdsShiftOut(index)"></i>
                  </el-col>
                </el-row>
              </el-form-item>
              <div style="margin: 6px">
                <div>工序所有人可查看以下内容：</div>
                <el-checkbox v-model="fieldListform.quantitiesTable" v-if="fieldListform.workflowType == 0" :disabled="addTitle == '查看流程'" @change="quantitiesTableChange">工程量</el-checkbox>
                <el-checkbox v-model="fieldListform.materialUsedTable" v-if="fieldListform.workflowType == 0" :disabled="addTitle == '查看流程'" @change="materialUsedTableChange">材料用量</el-checkbox>
                <el-checkbox v-model="fieldListform.scoreFlag" v-if="fieldListform.workflowType == 13" :disabled="addTitle == '查看流程'" @change="scoreFlagChange">工程评分</el-checkbox>
              </div>
            </el-form>
          </div>
        </div>
      </div>
      <div v-if="unnamedType.length != 0" class="h-500">
        <unnamed :type="unnamedType" @resh="resh" :appendToBody="true"></unnamed>
      </div>

      <div style="width: 100%; height: 1px; background: #000"></div>
      <div slot="footer" class="dialog-footer" v-show="showType != 4 && unnamedType.length == 0">
        <el-button size="mini" @click="show1 = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="addFlowSubmit('formDates')" v-show="addTitle != '查看流程'">保 存</el-button>
      </div>
    </el-dialog>
    <!-- /配置分项工程弹窗/ -->
    <el-dialog title="配置分项工程" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
        <el-tree @node-expand="nodeExpand" style="height: 400px; overflow: auto" :data="subentryData" ref="treeDefaultKey" show-checkbox node-key="pkId" :check-strictly="true" :default-checked-keys="defaultKey" :filter-node-method="filterNode" :props="defaultProps" @check-change="setCheckedNodes" :default-expand-all="true"></el-tree>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="show2 = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="ensure">保 存</el-button>
      </div>
    </el-dialog>
    <!-- /查看流程弹窗/ -->
    <el-dialog :title="addTitle" :visible.sync="show3" width="90%" v-dialogDrag :close-on-click-modal="false">
      <el-tabs v-model="messageType" v-if="tabPosition == 2 || tabPosition == 4" @tab-click="messageTypeClick" >
        <el-tab-pane label="基本信息" name="1"></el-tab-pane>
        <el-tab-pane label="审核记录" name="2"></el-tab-pane>
      </el-tabs>
      <div v-show="messageType=='1'">
        <el-form :model="form" :rules="rules" ref="form" style="padding: 12px 10px 0 0">
        <el-row>
          <el-col :span="4">
            <el-form-item label="流程类型" prop="workflowType" :label-width="formLabelWidth">
              <el-select disabled style="width: 100%" placeholder="请选择" size="mini" v-model="form.workflowType">
                <el-option v-for="item in typeData" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="form.workflowType == '0' || form.workflowType == '1'">
            <el-form-item label="专业类别" prop="fkProfessionalTypeId" :label-width="formLabelWidth">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" style="width: 100%" placeholder="请选择" size="mini" v-model="form.fkProfessionalTypeId">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="流程名称" prop="workflowName" :label-width="formLabelWidth">
              <el-input disabled v-model="form.workflowName" size="mini" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="(user.orgType == '2' || user.orgType == '3' || user.orgType == '9') && tabPosition == '4'">
              <el-form-item label="项目" prop="fkProjectId" :label-width="formLabelWidth">
                <el-input disabled v-model="form.fkProjectName" size="mini" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" v-if="(user.orgType == '2' || user.orgType == '3' || user.orgType == '9') && tabPosition == '4'">
              <el-form-item label="标段" prop="fkBidProjectId" :label-width="formLabelWidth">
                <el-input disabled v-model="form.fkBidProjectName" size="mini" autocomplete="off"></el-input>
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
      <div class="examineBpmn" v-if="show3">
        <examine-bpmn :fkEnginerringTypeId="user.fkEnginerringTypeId" :fkProfessionalTypeId="form.fkProfessionalTypeId" style="width: 100%; height: 500px" :workflowType="form.workflowType" :fkOrgId="user.fkOrgId" ref="examineBpmn" :XmlStr="XmlStr" @ensureab="ensureab" :tableSource="'1'" :warehouseType="warehouseType" :dataList="form" :fkWorkflowId="formFkWorkflowId"></examine-bpmn>
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
              <el-button type="primary" plain size="mini" @click.native="particulars(scope.row)">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
    </el-dialog>
    <!-- 新建 修改子流程 -->
    <el-dialog :title="addTitleFour" :visible.sync="show4" width="90%" v-dialogDrag :close-on-click-modal="false" v-loading="loading" @close="cancelFour">
      <!-- 流程属性 -->
      <el-form :model="subflowForm" :rules="rules" ref="formDateS" style="padding: 12px 10px 0 0">
        <el-row>
          <el-col :span="4">
            <el-form-item label="流程类型" prop="workflowType" :label-width="formLabelWidth">
              <el-select :disabled="addTitleFour == '编辑流程' || addTitleFour == '查看流程'" style="width: 100%" placeholder="请选择" size="mini" v-model="subflowForm.workflowType" @change="workflowTypeChang">
                <el-option v-for="item in typeData" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="subflowForm.workflowType != 2 && subflowForm.workflowType != 3">
            <el-form-item label="专业类别" prop="fkProfessionalTypeId" :label-width="formLabelWidth">
              <el-select :disabled="(addTitleFour == '编辑流程' || addTitleFour == '查看流程') && subflowForm.fkProfessionalTypeId != 0" style="width: 100%" placeholder="请选择" size="mini" @change="typeIdChange" v-model="subflowForm.fkProfessionalTypeId">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="流程名称" prop="workflowName" :label-width="formLabelWidth">
              <el-input :disabled="addTitleFour == '查看流程'" v-model="subflowForm.workflowName" size="mini" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="流程备注" prop="remark" :label-width="formLabelWidth">
              <el-input :disabled="addTitleFour == '查看流程'" v-model="subflowForm.remark" size="mini" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="width: 100%; border: 1px solid"></div>
      <!--流程图  -->
      <div>
        <!-- subflowForm.workflowType -->
        <panl-show :fkEnginerringTypeId="user.fkEnginerringTypeId" :fkProfessionalTypeId="subflowForm.fkProfessionalTypeId" :fkOrgId="user.fkOrgId" style="width: 100%; height: 450px" ref="seedRegPanl" @seedEnsureab="seedEnsureab" :workflowType="form.workflowType" :warehouseType="warehouseType" :addTitle="addTitle" :fkWorkflowId="formFkWorkflowId" :bpmnContentStatus="bpmnContentStatus" :largeProcessPkId="largeProcessPkId" :subProcessPkId="subProcessPkId"></panl-show>
      </div>
      <div style="width: 100%; height: 1px; background: #000"></div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancelFour">取 消</el-button>
        <el-button size="mini" type="primary" @click="seedSubmit('formDateS')">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 流程图模态框 -->
    <el-dialog title="" :visible.sync="ProcessDialog" width="70%" center v-dialogDrag :close-on-click-modal="false">
      <div class="can-box">
        <div class="pre-name">{{ preName }}</div>
        <div style="height: 500px" class="pre-can" ref="preCan" id="preCan"></div>
      </div>
    </el-dialog>
    <!-- 新建 设计流程弹窗 -->
    <el-dialog :title="addTitle" :visible.sync="subentryShow" width="90%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <!-- 流程属性 -->
      <el-form :model="form" :rules="rules" ref="formDate" style="padding: 12px 10px 0 0">
        <el-row>
          <el-col :span="4">
            <el-form-item label="项目部" prop="fkOrgId" :label-width="formLabelWidth">
              <el-select disabled style="width: 100%" placeholder="请选择" size="mini" v-model="listQuery.fkOrgId">
                <el-option v-for="item in projectData" :label="item.orgName" :value="item.pkId" :key="item.pkId"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="form.workflowType != 2 && form.workflowType != 3">
            <el-form-item label="专业类别" prop="fkProfessionalTypeId" :label-width="formLabelWidth">
              <el-select :disabled="(addTitle == '编辑流程' || addTitle == '查看流程' || addTitle == '切换验收流程') && form.fkProfessionalTypeId != 0" style="width: 100%" placeholder="请选择" size="mini" @change="typeIdChange" v-model="form.fkProfessionalTypeId">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="流程分类" prop="remark" :label-width="formLabelWidth">
              <el-select v-model="userDefined" @change="searchListByOrgId" size="mini" placeholder="请选择">
                <!-- <el-option label="自定义流程" value="1"> </el-option>
                <el-option label="系统流程" value="2"> </el-option> -->
                <el-option label="自定义验收流程模板" value="1"> </el-option>
                <el-option label="默认验收流程模板" value="2"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="流程名称" prop="workflowNameaa" :label-width="formLabelWidth">
              <el-select v-model="acceptanceAs" @change="acceptanceAsChange" size="mini" placeholder="请选择" v-el-select-loadmore="loadmore" filterable>
                <el-option v-for="item in acceptanceProcess" :key="item.pkId" :label="item.workflowName" :value="item.pkId"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="width: 100%; border: 1px solid"></div>
      <!-- 生产验收流程 -->
      <div class="productionApproval" style="height: 450px" v-if="form.workflowType == 1">
        <div class="left" v-show="addTitle != '查看流程' && addTitle != '切换验收流程'">
          <el-select v-if="radioStatus" v-model="radio" @change="radioChange" placeholder="请选择">
            <el-option label="全部" value="0"> </el-option>
            <el-option label="系统工序" value="1"> </el-option>
            <el-option label="自定义工序" value="2"> </el-option>
          </el-select>
          <div>
            <el-input size="mini" v-model="workflowNameLike" style="margin: 3px">
              <i class="el-icon-search el-input__icon" slot="suffix" @click="workflowNameLikeQuery"></i>
            </el-input>
          </div>
          <div class="item" v-for="item in productionApproval" :class="{ active: item.isActive == true, violet: item.workflowType == '13' }" :key="item.pkId" @click="itemClick(item)">
            {{ item.workflowName }}
          </div>
        </div>
        <div class="center" v-show="pitchOnDate.length != 0">
          <div class="kaishi">
            <span>开始</span>
          </div>
          <img src="../../assets/jiantou.svg" class="jiantou" alt="" />
          <div v-for="(item, index) in pitchOnDate" :key="index" @click="bpmShowClick(item)">
            <div class="bpmShow">
              <div class="box">
                <bpm-show :bpmnContent="item.bpmnContent" style="width: 100%" ref="bpmShow" @ensureab="ensureab"></bpm-show>
              </div>
              <span class="bpmShowxshou">{{ item.workflowName }}</span>
            </div>
            <img src="../../assets/jiantou.svg" class="jiantou" alt="" />
          </div>
          <div class="kaishi jieshu">
            <span>结束</span>
          </div>
        </div>
        <div class="right" v-show="acceptanceAs != ''">
          <div class="title">节点信息</div>
          <div class="panleTitle" v-if="nodeShow"><i class="el-icon-info"></i> 常规</div>
          <div v-if="nodeShow">
            <el-form :model="form" :rules="rules" ref="nodeForm" style="padding: 0">
              <el-form-item label="节点名称" :label-width="formLabelWidth" style="margin-right: 6px">
                <el-input disabled v-model="fieldListform.name" size="mini" autocomplete="off"></el-input>
              </el-form-item>
              <div class="panleTitle"><i class="el-icon-s-order"></i> 节点设置</div>
              <el-form-item label="技术规范">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select clearable placeholder="请选择" size="mini" :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" v-model="fieldListform.technology" @change="technologyChang">
                      <el-option v-for="i in technologyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input clearable :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" size="mini" type="number" @input="jsThePageChang" oninput="value=value.replace(/[^\d.]/g,'')" v-model="fieldListform.jsThePage" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input clearable :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" oninput="value=value.replace(/[^\d.]/g,'')" size="mini" type="number" @blur="jsToPageChang" v-model="fieldListform.jsToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </el-form-item>
              <el-form-item label="安全规范">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" clearable placeholder="请选择" size="mini" @change="safetyChange" v-model="fieldListform.safety">
                      <el-option v-for="i in safetyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" @input="aqThePageChang" v-model="fieldListform.aqThePage" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" clearable size="mini" @blur="aqToPageChang" v-model="fieldListform.aqToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </el-form-item>
              <el-form-item label="验收标准">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" clearable placeholder="请选择" size="mini" @change="standardChange" v-model="fieldListform.standard">
                      <el-option v-for="i in acceptanceLevel" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" v-model="fieldListform.ysThePage" @input="ysThePageChange" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" clearable size="mini" oninput="value=value.replace(/[^\d.]/g,'')" @blur="ysToPageChang" v-model="fieldListform.ysToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </el-form-item>
              <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设置设置</div>
              <div class="panleCenten" style="line-height: 30px; margin: 0; padding: 0px 10px">
                <el-radio-group v-model="tableTypeSource" :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'">
                  <el-radio :label="'1'">自定义</el-radio>
                </el-radio-group>
              </div>
              <el-form-item prop="date1" style="max-height: 80px; overflow: auto; border-top: 1px solid; border-bottom: 1px solid">
                <el-row v-for="(item, index) in fieldListform.tableIds" :key="index" style="margin: 4px 0px">
                  <el-col :span="15">
                    <el-select :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" style="width: 100%" filterable v-model="item.fkTableId" @change="tableIdsChange" placeholder="请选择" size="mini">
                      <el-tooltip v-for="i in relatedForm" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                        <el-option style="width: 200px" :disabled="fieldListform.tableIds.find(s => s.fkTableId === i.pkId) == undefined ? false : true" :value="i.pkId" :label="i.tableName"></el-option>
                      </el-tooltip>
                    </el-select>
                  </el-col>
                  <el-col :span="5" style="padding-left: 2px" v-if="user.orgType == 5">
                    <el-checkbox v-model="item.isArchives" :true-label="0" :false-label="1" @change="isArchivesChange" :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'">档案表</el-checkbox>
                  </el-col>
                  <el-col :span="4" style="line-height: 28px; padding-left: 2px" v-if="addTitle != '查看流程' && addTitle != '切换验收流程'">
                    <i class="el-icon-circle-plus-outline" style="color: #2680f0; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index == 0" @click="tableIdsAdd"></i>
                    <i class="el-icon-remove-outline" style="color: red; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index != 0" @click="tableIdsShiftOut(index)"></i>
                  </el-col>
                </el-row>
              </el-form-item>
              <div style="margin: 6px">
                <div>工序所有人可查看以下内容：</div>
                <el-checkbox v-model="fieldListform.quantitiesTable" v-if="fieldListform.workflowType == 0" :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" @change="quantitiesTableChange">工程量</el-checkbox>
                <el-checkbox v-model="fieldListform.materialUsedTable" v-if="fieldListform.workflowType == 0" :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" @change="materialUsedTableChange">材料用量</el-checkbox>
                <el-checkbox v-model="fieldListform.scoreFlag" v-if="fieldListform.workflowType == 13" :disabled="addTitle == '查看流程' || addTitle == '切换验收流程'" @change="scoreFlagChange">工程评分</el-checkbox>
              </div>
            </el-form>
          </div>
        </div>
      </div>
      <div style="width: 100%; height: 1px; background: #000"></div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="subentryShow = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="subentrySubmit">保 存</el-button>
      </div>
    </el-dialog>
    <!-- /配置场景弹窗/ -->
    <el-dialog title="配置场景" :visible.sync="sceneDialog" width="500px" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-checkbox-group v-model="sealCodes">
          <div v-for="item in sceneList" :key="item.name">
            <el-checkbox :label="item.name" :value="item.name">{{ item.key }}</el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="sceneDialog = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="sceneSubmit">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 验收流程详情 提交审批撤回-->
    <!-- <el-dialog title="验收流程详情" :visible.sync="acceptanceDetails" width="90%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-form :model="acceptanceForm" ref="formDate" style="padding: 12px 10px 0 0">
        <el-row>
          <el-col :span="4">
            <el-form-item label="流程名称" :label-width="formLabelWidth">
              {{ acceptanceForm.fkItemName }}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="单位工程" :label-width="formLabelWidth">
              {{ acceptanceForm.oneParentName }}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="分部工程" :label-width="formLabelWidth">
              {{ acceptanceForm.secondParentName }}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="分项工程" :label-width="formLabelWidth">
              {{ acceptanceForm.fkItemName }}
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="acceptanceType == 1 || acceptanceType == 2">
            <el-form-item label="申请人" :label-width="formLabelWidth">
              {{ acceptanceForm.createUserName }}
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="acceptanceType == 1 || acceptanceType == 2">
            <el-form-item label="申请时间" :label-width="formLabelWidth">
              {{ acceptanceForm.createTime }}
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="acceptanceType == 2">
            <el-form-item label="审批人" :label-width="formLabelWidth">
              {{ acceptanceForm.fkApproveName }}
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="acceptanceType == 2">
            <el-form-item label="审批时间" :label-width="formLabelWidth">
              {{ acceptanceForm.approveTime }}
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="acceptanceType != 0">
            <el-form-item label="审批状态" :label-width="formLabelWidth">
              {{ acceptanceForm.enableStatus }}
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="acceptanceType == 2">
            <el-form-item label="审批意见" :label-width="formLabelWidth">
              {{ acceptanceForm.remark }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="width: 100%; border: 1px solid"></div>

      <div class="productionApproval" style="height: 450px">
        <div class="center">
          <div class="kaishi">
            <span>开始</span>
          </div>
          <img src="../../assets/jiantou.svg" class="jiantou" alt="" />
          <div v-for="(item, index) in pitchOnDate" :key="index" @click="bpmShowClick(item)">
            <div class="bpmShow">
              <div class="box">
                <bpm-show v-if="!bpmnContentStatus" :bpmnContent="item.bpmnContent" style="width: 100%" ref="bpmShow" @ensureab="ensureab"></bpm-show>
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
          <div class="title">节点信息</div>
          <div class="panleTitle" v-if="nodeShow"><i class="el-icon-info"></i> 常规</div>
          <div v-if="nodeShow">
            <el-form :model="form" :rules="rules" ref="nodeForm" style="padding: 0">
              <el-form-item label="节点名称" :label-width="formLabelWidth" style="margin-right: 6px">
                <el-input disabled v-model="fieldListform.name" size="mini" autocomplete="off"></el-input>
              </el-form-item>
              <div class="panleTitle"><i class="el-icon-s-order"></i> 节点设置</div>
              <el-form-item label="技术规范">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select clearable placeholder="请选择" size="mini" disabled v-model="fieldListform.technology">
                      <el-option v-for="i in technologyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-input clearable disabled size="mini" type="number" v-model="fieldListform.jsThePage" />
                </el-col>
                <el-col :span="2">
                  <span>页 ~</span>
                </el-col>
                <el-col :span="4">
                  <el-input clearable disabled v-model="fieldListform.jsToPage" />
                </el-col>
                <el-col :span="1">
                  <span>页</span>
                </el-col>
              </el-form-item>
              <el-form-item label="安全规范">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select disabled clearable placeholder="请选择" size="mini" v-model="fieldListform.safety">
                      <el-option v-for="i in safetyDate" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
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
              <el-form-item label="验收标准">
                <el-col :span="8">
                  <el-form-item prop="date1">
                    <el-select disabled clearable placeholder="请选择" size="mini" v-model="fieldListform.standard">
                      <el-option v-for="i in acceptanceLevel" :key="i.pkId" :value="i.pkId" :label="i.bookName" />
                    </el-select>
                  </el-form-item>
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
              <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设置设置</div>
              <div class="panleCenten" style="line-height: 30px; margin: 0; padding: 0px 10px">
                <el-radio-group v-model="tableTypeSource" disabled>
                  <el-radio :label="'1'">自定义</el-radio>
                </el-radio-group>
              </div>
              <el-form-item prop="date1" style="max-height: 80px; overflow: auto; border-top: 1px solid; border-bottom: 1px solid">
                <el-row v-for="(item, index) in fieldListform.tableIds" :key="index" style="margin: 4px 0px">
                  <el-col :span="15">
                    <el-select disabled style="width: 100%" filterable v-model="item.fkTableId" @change="tableIdsChange" placeholder="请选择" size="mini">
                      <el-tooltip v-for="i in relatedForm" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                        <el-option style="width: 200px" :value="i.pkId" :label="i.tableName"></el-option>
                      </el-tooltip>
                    </el-select>
                  </el-col>
                  <el-col :span="5" style="padding-left: 2px" v-if="user.orgType == 5">
                    <el-checkbox v-model="item.isArchives" disabled :true-label="0" :false-label="1">档案表</el-checkbox>
                  </el-col>
                </el-row>
              </el-form-item>
              <div style="margin: 6px">
                <div>工序所有人可查看以下内容：</div>
                <el-checkbox v-model="fieldListform.quantitiesTable" disabled v-if="fieldListform.workflowType == 0" @change="quantitiesTableChange">工程量</el-checkbox>
                <el-checkbox v-model="fieldListform.materialUsedTable" disabled v-if="fieldListform.workflowType == 0" @change="materialUsedTableChange">材料用量</el-checkbox>
                <el-checkbox v-model="fieldListform.scoreFlag" disabled v-if="fieldListform.workflowType == 13">工程评分</el-checkbox>
              </div>
            </el-form>
          </div>
        </div>
      </div>
      <div style="width: 100%; height: 1px; background: #000"></div>
      <div slot="footer" class="dialog-footer" v-if="acceptanceType != 3">
        <el-button v-if="acceptanceType == 0" size="mini" @click="comeUpForReview" type="primary">提交审批</el-button>
        <el-button v-if="acceptanceType == 1" size="mini" @click="recall" type="danger">撤回</el-button>
        <el-button v-if="acceptanceType == 2" size="mini" @click="withdrawAnApplication" type="primary">申请撤回</el-button>
        <el-button size="mini" @click="acceptanceDetails = false">取 消</el-button>
      </div>
    </el-dialog> -->
    <!-- /配置场景弹窗/ -->
    <el-dialog title="撤回原因" :visible.sync="reasonWithdrawal" width="500px" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 6 }"  maxlength="100" placeholder="请输撤回原因" v-model.trim="reasonRemark"> </el-input>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" class="el-button-primary" @click="recallSubmit">提交</el-button>
      </div>
    </el-dialog>
    <!-- 验收流程详情 提交审批撤回-->
    <el-dialog title="验收流程详情" :visible.sync="acceptanceDetails" width="90%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="acceptDia">
        <div class="itemTree" v-if="isBatch">
          <!-- <el-tree :data="batchTree" ref="batchTree" node-key="pkId" :filter-node-method="filterNode2" :props="defaultProps" :default-expand-all="true" @node-click="nodeClick"></el-tree> -->
          <div v-for="(item,index) in multipleSelection" :key="index" @click="multipleClick(index)" class="left-table" 
          :class="{'left-table-set':multipleIndex ==index}">{{item.workflowName}}</div>
        </div>
        <div class="acceptDia-right">
          <div class="dialog-head">
            <el-row :gutter="24" style="width: 100%">
              <el-col :span="4">
                <span>流程类型：</span>
                <div class="content" :title="acceptanceForm.workflowTypeName">{{  acceptanceForm.workflowTemplateVo.workflowTypeName }}</div>
              </el-col>
              <el-col :span="4">
                <span>流程名称：</span>
                <div class="content" >
                  <!-- 2222 -->
                  <!-- {{ acceptanceForm.workflowTemplateVo.workflowName }} -->
                  <!-- <span v-if="acceptanceForm.workflowTemplateVo.workflowName != undefined && acceptanceForm.workflowTemplateVo.workflowName.length< 8">1111 {{  acceptanceForm.workflowTemplateVo.workflowName }}</span> -->
                  <!-- <el-tooltip   :content="acceptanceForm.workflowTemplateVo.workflowName" placement="top">
                   
                  </el-tooltip> -->
                  <el-tooltip class="item" :content="acceptanceForm.workflowTemplateVo.workflowName" placement="top"  effect="dark">
                      <span> {{  acceptanceForm.workflowTemplateVo.workflowName }}</span>
                  </el-tooltip>
                </div>
              </el-col>
              <el-col :span="4" v-if="acceptanceType=='1'">
                <span>申请人：</span>
                <div class="content">{{ acceptanceForm.createUserName }}</div>
              </el-col>
              <el-col :span="4" v-if="acceptanceType=='1'">
                <span>申请时间：</span>
                <div class="content">{{ acceptanceForm.createTime}}</div>
              </el-col>
              <el-col :span="4" v-if="acceptanceType=='2'">
                <span>审批人：</span>
                <div class="content">{{ acceptanceForm.fkApproveName }}</div>
              </el-col>
              <el-col :span="4" v-if="acceptanceType=='2'">
                <span>审批时间：</span>
                <div class="content">{{ acceptanceForm.approveTime }}</div>
              </el-col>
              <el-col :span="4" v-if="acceptanceType=='1'">
                <span>审批状态：</span>
                <div class="content">{{ acceptanceForm.enableStatus }}</div>
              </el-col>
              <el-col :span="4" v-if="acceptanceType=='2'">
                <span>审批意见：</span>
                <div class="content">{{ acceptanceForm.remark }}</div>
              </el-col>
            </el-row>
          </div>
          <div style="width: 100%; border: 1px solid"></div>
          <!-- <acceptanceProcess :editStatus="false" :workflowType="'1'" :accessType="'3'" ref="productionApproval2"></acceptanceProcess> -->
          <div class="examineBpmn">
            <examine-bpmn :fkEnginerringTypeId="user.fkEnginerringTypeId" :fkProfessionalTypeId="acceptanceForm.workflowTemplateVo.fkProfessionalTypeId" style="width: 100%; height: 500px" :workflowType="tabPosition" :fkOrgId="user.fkOrgId" ref="examineBpmn1" :XmlStr="XmlStr" @ensureab="ensureab" :tableSource="'1'" :warehouseType="warehouseType" :dataList="acceptanceForm.workflowTemplateVo" :fkWorkflowId="formFkWorkflowId"></examine-bpmn>
          </div>
          <div style="width: 100%; height: 1px; background: #000"></div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" v-if="acceptanceType != 3">
        <el-button v-if="acceptanceType == 0" size="mini" @click="comeUpForReview" type="primary">提交审批</el-button>
        <el-button v-if="acceptanceType == 1" size="mini" @click="recall" type="danger">撤回</el-button>
        <el-button v-if="acceptanceType == 2" size="mini" @click="withdrawAnApplication" type="primary">申请撤回</el-button>
        <el-button size="mini" @click="acceptanceDetails = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import panlShow from "@/components/customBasic.vue";
import panlShow from "../../components/userdefined-basic/customBasic.vue";
import examineBpmn from "../../components/userdefined-basic/examineBpmn.vue";
import bpmShow from "../../components/bpmShow.vue";
import { extractTree, listToTree } from "@/utils/commond";
import { CustomViewer } from "@/components/customBpmn";
import unnamed from "../org/compoments/unnamed.vue";
// import acceptanceProcess from '../../components/acceptanceProcess.vue';
// import custom from "./compomemts/custom.vue";
export default {
  directives: {
    "el-select-loadmore": {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector(".el-select-dropdown .el-select-dropdown__wrap");
        SELECTWRAP_DOM.addEventListener("scroll", function () {
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
    unnamed
    // acceptanceProcess
    // custom
  },
  name: "workflowConfiguration",
  data() {
    return {
      searchOptions: [
        {
          type: "select",
          prop: "workflowType",
          value: "",
          title: "流程类型",
          placeholder: "流程类型",
          options: [],
          clearable: false
        },
        {
          type: "select",
          prop: "fkProfessionalTypeId",
          value: "",
          title: "专业类别",
          placeholder: "专业类别",
          options: []
        },
        {
          type: "input",
          prop: "workflowName",
          value: "",
          title: "流程名称",
          placeholder: "流程名称"
        },
        {
          type: "input",
          prop: "keyWord",
          value: "",
          title: "关联分项",
          placeholder: "关联分项"
        }
      ],
      totalCount: 0,
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        fkOrgId: "",
        workflowName: ""
      },
      tableData: [],
      maxHeight: 0,
      show1: false,
      formLabelWidth: "90px",
      form: {
        workflowName: "", // 流程名称
        fkEnginerringTypeId: "", // 工程类型
        fkProfessionalTypeId: "", // 专业类别
        workflowType: "", // 流程类别
        remark: "", // 流程备注
        fkOrgId: "",
        fkBidProjectId:"",
        fkProjectId:""
        
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
      projectType: [], // 工程类型
      defaultKey: [],
      showDate: {},
      show3: false,
      productionApproval: [],
      pitchOnDate: [],
      // fieldList: [],
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
      tableTypeSource: "1",
      ereas: [],
      XmlStr: "",
      loading: false,
      nodeShow: false, //
      expertSortData: [],
      show4: false,
      subflowForm: {
        workflowName: "", // 流程名称
        fkEnginerringTypeId: "", // 工程类型
        fkProfessionalTypeId: "", // 专业类别
        workflowType: "", // 流程类别
        remark: "" // 流程备注
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
      tabPosition: "",
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
      basicStatus: true,
      typeData: [],
      user: {},
      sceneDialog: false,
      sceneList: [],
      sealCodes: [],
      fkTemplateId: "",
      typeList: [],
      workflowNameLike: "",
      fessionalTypeId: "",
      flowTableArr: [],
      warehouseType: "",
      marginNum: "70px 0",
      acceptanceDetails: false,
      acceptanceType: "",
      acceptanceData: {},
      reasonWithdrawal: false,
      reasonRemark: "",
      acceptanceForm: {
        workflowTemplateVo:{}
      },
      formFkWorkflowId: "",
      bpmnContentStatus: false,
      addTitleFour: "",
      unnamedType: "",
      largeProcessPkId: "",
      subProcessPkId: "",
      tableHt: "82%",
      multipleSelection: [],
      isBatch: false,
      pdfListData: [],
      editStatus: true,
      launchType: "",
      fkRoleId: "",
      disabledType:-1,
      multipleIndex:0,
      messageType:"1",
      fkBidProjectIArr: [],
      projectByOrgIdArr: [],
      rulesa: {
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
    };
  },
  mounted() {
    this.user = JSON.parse(sessionStorage.getItem("user"));
    this.listQuery.fkOrgId = this.user.fkOrgId + "";
    // this.int();
    // this.searchItems();
    this.searchOrgList();
    this.searchMajorTypeList();
    this.$api.customUsingScene().then(res => {
      if (res.code == 200) {
        this.sceneList = res.data;
      } else {
        this.$message.warning(res.msg);
      }
    });
    const arr = [];
    this.$api.customWorkQuery({ type: 1, orgType: this.user.orgType }).then(res => {
      if (res.code == 200) {
        res.data.forEach(item => {
          item.label = item.name;
          item.value = item.key;
          arr.push(item);
        });
        // this.searchOptions[0].options = arr;
        // this.$refs.searchBar.workflowType(res.data[0].key);
        // this.listQuery.workflowType = res.data[0].key;
        this.typeData = arr;
        this.tabPosition = this.typeData[0].value+"";
        console.log(this.tabPosition)
        // debugger
        this.pagingDisplay();
      }
    });
    this.getAllProjectInfo();
  },
  watch: {
    filterText(val) {
      this.$refs.treeDefaultKey.filter(val);
    },
    // tabPosition(val) {
    //   // this.searchTypeList();
    //   // this.int();
    //   // this.searchItems();
    //   // this.searchOrgList();
    //   // this.searchMajorTypeList();

    // }
  },
  methods: {
    tabPositionClick(val){
      this.listQuery.workflowName = "";
      if (val == "4" || val == "8") {
        this.tableHt = "82%";
      } else {
        this.tableHt = "92%";
      }
      this.search();
    },
    getAllProjectInfo() {
      this.$api.getAllProjectInfo().then(res => {
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
      // form.fkBidProjectId
      this.noProject(val);
    },
    noProject(id) {
      this.$api.noProject({ projectId: id,isWhole:0 }).then(res => {
        if (res.code == 200) {
          this.fkBidProjectIArr = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    particulars(row){
      // this.$api.findByPkIdOperation().then(res=>{
      //   if(res.code == 200){}else{
      //     this.$message.error(res.msg)
      //   }
      // })
      this.acceptanceType = "4";
      this.isBatch = false;
      this.acceptanceDetails = true;
      // this.acceptanceInit(row.pkId)
      // 
      this.loading = true;
      this.$api.findProdItemApprovalById({ pkId: row.pkId }).then(res => {
          if (res.code == 200) {
            // this.show3 = true;
            // this.addTitle = "查看流程";
            // res.data.workflowType = res.data.workflowType.toString();
            // this.form = res.data.workflowTemplateVo;
            this.acceptanceForm = res.data
            // this.XmlStr = res.data.bpmnContent;
            // if (res.data.workflowType == 5) {
            //   this.customGetWorkflowType(res.data.workflowType);
            //   this.warehouseType = res.data.type;
            // }
            this.$nextTick(() => {
              this.$refs.examineBpmn1.exportDiagram(res.data.workflowTemplateVo.bpmnContent, res.data.workflowTemplateVo);
            });
            this.loading = false;
          } else {
            this.loading = false;
          }
        })
    },
    multipleClick(idx){
      this.multipleIndex =idx;
      this.acceptanceInit(this.multipleSelection[idx].pkId)
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
      let arr = []
      this.pdfListData.forEach(item=>{
        if(item.fkBookPdfId != undefined&& item.fkBookPdfId !=null && item.fkBookPdfId.length != 0){
          arr.push(item)
        }
      })
      this.pdfListData = arr
    },
    batch(type) {
      this.multipleIndex =0;
      this.isBatch = true;
      this.acceptanceType = type;

      // this.acceptanceData = row;
      // this.loading = true;
      this.acceptanceDetails = true;
      this.acceptanceInit(this.multipleSelection[0].pkId)
      // this.bpmnContentStatus = true;
      // console.log("////////////////////////////////////////////")
      // console.log(this.multipleSelection)
      // console.log("////////////////////////////////////////////")

      // this.$nextTick(()=>{
      //   let arr= this.multipleSelection.map(item=>item.pkId)
      //   this.$refs.batchTree.filter(arr);
      //  let arr2= this.searchData.filter(item=>arr.includes(item.pkId))
      //   this.engFindByItemId(arr2[0].pkId)

      // })
    },
    btnClick(row,type){
      this.acceptanceType = type;
      this.isBatch = false;
      this.form=row
      this.acceptanceDetails = true;
      this.acceptanceInit(row.pkId)
    },
    acceptanceInit(id){
      this.$api
        .findByPkId({ pkId: id })
        .then(res => {
          if (res.code == 200) {
            // this.show3 = true;
            // this.addTitle = "查看流程";
            // res.data.workflowType = res.data.workflowType.toString();
            // this.form = res.data.workflowTemplateVo;
            this.acceptanceForm = res.data
            // this.XmlStr = res.data.bpmnContent;
            // if (res.data.workflowType == 5) {
            //   this.customGetWorkflowType(res.data.workflowType);
            //   this.warehouseType = res.data.type;
            // }
            this.$nextTick(() => {
              this.$refs.examineBpmn1.exportDiagram(res.data.workflowTemplateVo.bpmnContent, res.data.workflowTemplateVo);
            });
            this.loading = false;
          } else {
            this.loading = false;
          }
        })
    },
    // ====================================================
    checkBoxChange(e, row) {
      if (e) {
        this.multipleSelection.push(row);
        if (row.submitApproveStatus) {
          this.disabledType = 1;
        }
        if (row.revokeStatus) {
          this.disabledType = 2;
        }
        if (row.applyRevokeStatus) {
          this.disabledType = 3;
        }
      } else {
        this.multipleSelection = this.multipleSelection.filter(item => item.pkId !== row.pkId);
      }
      if (!this.multipleSelection.length) {
        this.disabledType = -1;
      }
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
      if (!row.submitApproveStatus && this.disabledType == 1) {
        return true;
      }
      if (!row.revokeStatus && this.disabledType == 2) {
        return true;
      }
      if (!row.applyRevokeStatus && this.disabledType == 3) {
        return true;
      }
      if (!row.submitApproveStatus && !row.revokeStatus && !row.applyRevokeStatus) {
        return true;
      }
      return false;
    },
    // row_class_name({ row, rowIndex }) {
    //         return this.selection.find(v => v.value == row.value) ? 'selected' : '';
    //     },
    // selectionChange(selection) {
    //   // this.selection = selection;
    // },
    // row_click(row, column, event) {
    //      console.log( this.$refs.tableDataS.toggleRowSelection(row))
    //     },
    cancelFour() {
      this.show4 = false;
      this.bpmnContentStatus = false;
      // this.addTitle = "引用流程";
    },
    tableIdsAdd() {
      this.fieldListform.tableIds.push({ tableId: "", isArchives: 1, tableSource: 1 });
    },
    tableIdsShiftOut(idx) {
      this.fieldListform.tableIds.splice(idx, 1);
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.tableDTOS = this.fieldListform.tableIds;
        }
      });
    },
    // =========================>
    // 提交审核
    comeUpForReview() {
      this.loading = true;
      let workflowTemplateIds = []
      if(this.isBatch){
        this.multipleSelection.forEach(item=>{
        workflowTemplateIds.push(item.pkId)
      })
      }else{
        workflowTemplateIds = [this.form.pkId]
      }

      this.$api.submitApproveWorkflowTemplate( workflowTemplateIds ).then(res => {
        if (res.code == 200) {
          this.loading = false;
          this.acceptanceDetails = false;
          this.$message.success("提交审核成功");
          this.multipleSelection=[]
          this.disabledType=-1
          this.pagingDisplay();
       
        } else {
          this.$message.warning(res.msg);
          this.loading = false;
        }
      });
    },
    // 撤回
    recall() {
      this.loading = true;
      let workflowTemplateIds = []
      if(this.isBatch){
        this.multipleSelection.forEach(item=>{
        workflowTemplateIds.push(item.pkId)
      })
      }else{
        workflowTemplateIds = [this.form.pkId]
      }
      
      this.$api.withdrawWorkflowTemplate(workflowTemplateIds).then(res => {
        if (res.code == 200) {
          this.loading = false;
          this.acceptanceDetails = false;
          this.$message.success("撤回成功");
          this.multipleSelection=[]
          this.disabledType=-1
          this.pagingDisplay();
        } else {
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // 申请撤回
    withdrawAnApplication() {
      this.reasonRemark = "";
      this.reasonWithdrawal = true;
    },
    // 申请撤回提交
    recallSubmit() {

      this.loading = true;
      let workflowTemplateIds = []
      if(this.isBatch){
        this.multipleSelection.forEach(item=>{
        workflowTemplateIds.push({workflowTemplateId:item.pkId,remark:this.reasonRemark})
      })
      }else{
        workflowTemplateIds = [{workflowTemplateId:this.form.pkId,remark:this.reasonRemark}]
      }
      this.$api.applyWithdrawWorkflowTemplate(workflowTemplateIds).then(res => {
        if (res.code == 200) {
          this.loading = false;
          this.reasonWithdrawal = false;
          this.acceptanceDetails = false;
          this.$message.success("操作成功");
          this.multipleSelection=[]
          this.disabledType=-1
          this.pagingDisplay();
        } else {
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // // 验收流程弹窗
    // particulars(row, type) {
    //   this.acceptanceType = type;
    //   this.acceptanceData = row;
    //   this.acceptanceDetails = true;
    //   this.bpmnContentStatus = true;
    //   this.loading = true;
    //   this.$api.engFindByItemId({ itemId: row.pkId }).then(res => {
    //     if (res.code == 200) {
    //       this.acceptanceForm = res.data;
    //       this.form = res.data.workflowTemplateVo;
    //       const arr = [];
    //       res.data.workflowTemplateVo.workflowNodeDTOS.forEach(item => {
    //         if (item.nodeType == 3) {
    //           arr.push(item);
    //         }
    //       });
    //       const nodeList = res.data.workflowTemplateVo.nodeList.join(",");
    //       this.$api
    //         .engWorkflowById({ pkIds: nodeList })
    //         .then(res => {
    //           if (res.code == 200) {
    //             const arr1 = res.data;
    //             arr1.forEach(item => {
    //               arr.forEach(e => {
    //                 if (item.pkId == e.fkWorkflowId) {
    //                   e.bpmnContent = item.bpmnContent;
    //                   e.workflowName = item.workflowName;
    //                   e.workflowType = item.workflowType;
    //                 }
    //               });
    //             });

    //             this.pitchOnDate = arr;
    //             this.bpmnContentStatus = false;
    //             this.loading = false;
    //           } else {
    //             this.bpmnContentStatus = false;
    //             this.loading = false;
    //             this.$message.warning(res.msg);
    //           }
    //         })
    //         .catch(err => {
    //           this.loading = false;
    //         });
    //     } else {
    //       this.bpmnContentStatus = false;
    //       this.loading = false;
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // =========================>
    link() {
      const target = document.getElementById("mao-dian");
      const parent = document.getElementById("left");
      parent.scrollTop = target.offsetTop - parent.offsetTop;
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
      this.$api.customWorkScene({ templateId: row.pkId }).then(res => {
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
      const data = {
        fkTemplateId: this.fkTemplateId,
        sealCodes: this.sealCodes
      };
      this.$api.customWorkSealScene(data).then(res => {
        if (res.code == 200) {
          this.$message.success("配置成功");
          this.pagingDisplay();
          this.sceneDialog = false;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    loadmore() {
      this.formData.pageIndex++;
      this.getList(this.formData);
    },
    getList(formData) {
      const data = {
        fkProfessionalTypeId: this.form.fkProfessionalTypeId,
        pageNum: formData.pageIndex,
        pageSize: 20,
        workflowId: this.itemData.fkWorkflowId
      };
      if (this.userDefined == 1) {
        data.fkOrgId = this.listQuery.fkOrgId;
      } else {
        data.fkOrgId = 1;
      }
      this.$api.customListByOrgId(data).then(res => {
        if (res.code == 200) {
          this.acceptanceProcess = [...this.acceptanceProcess, ...res.data.records];
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    subentrySubmit() {
      this.$api
        .switchWorkflowTemplate({
          itemId: this.itemData.pkId,
          workflowId: this.acceptanceAs
        })
        .then(res => {
          if (res.code == 200) {
            this.subentryShow = false;
            // this.searchItems(this.user.fkOrgId);
            this.$message({
              type: "success",
              message: "切换成功"
            });
          } else {
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
    },
    searchListByOrgId() {
      this.pitchOnDate = [];
      this.formData.pageIndex = 1;
      this.acceptanceAs = "";
      const data = {
        fkProfessionalTypeId: this.form.fkProfessionalTypeId,
        pageNum: 1,
        pageSize: 20,
        workflowId: this.itemData.fkWorkflowId
      };
      // if (this.userDefined == 1) {
      //   data.fkOrgId = this.listQuery.fkOrgId;
      // } else {
      //   data.fkOrgId = 1;
      // }
      this.$api.customListByOrgId(data).then(res => {
        if (res.code == 200) {
          this.acceptanceProcess = res.data.records;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    acceptanceAsChange(val) {
      this.pitchOnDate = [];
      this.acceptanceProcess.forEach(item => {
        if (item.pkId == val) {
          const arr = [];
          item.workflowNodeDTOS.forEach((i, idx) => {
            if (i.nodeType != 0 && i.nodeType != 1) {
              arr.push(i);
            }
          });
          this.pitchOnDate = arr;
        }
      });
    },
    inEstimate(itemId) {
      this.ProcessDialog = true;
      this.$api.customById({ pkId: itemId }).then(res => {
        if (res.code === 200) {
          this.bpmnImg = res.data.bpmnContent;
          this.preName = res.data.workflowName;
          this.init("preCan");
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
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
    // 把树形数据转为扁平数据
    treeToArr(list) {
      return extractTree(list, "prodItemLists", ["designQuantities", "fkNumberUnitId", "fkProjectId", "fkSysItemDetailId", "fkSysItemId", "fkSysParentId", "fkUnitId", "fkWorkflowId", "grade", "itemCode", "itemName", "itemType", "number", "numberUnit", "pkId", "prodItemListAdds", "reItemMaterials", "sortval", "unitName", "unitQuantity", "parentId", "index", "faIndex", "fkWorkflowTemplateId", "detailTables", "pid", "myId", "materials", "fkParentId", "isChoose", "fkUnitName", "reItemDrawings", "workflowName", "isQuote", "selfDefined", "submitApproveStatus", "revokeStatus", "applyRevokeStatus", "queryStatus", "examineStatus", "switchStatus", "quoteUpdateStatus", "updateStatus"]);
    },
    // searchItems(id) {
    //   const data = {};

    //   if (this.user.orgType != 5) {
    //     data.fkOrgId = this.user.fkOrgId;
    //   }
    //   this.$api.acceptanceProcessList(data).then(res => {
    //     if (res.code == 200) {
    //       if (res.data.length != 0) {
    //         const arrs = res.data.map((item, index) => ({
    //           ...item,
    //           myId: String(index),
    //           pid: 0,
    //           prodItemLists: item.prodItemLists.map((item2, index2) => ({
    //             ...item2,
    //             myId: [index, index2].join("-"),
    //             pid: String(index),
    //             prodItemLists: item2.prodItemLists.map((item3, index3) => ({
    //               ...item3,
    //               myId: [index, index2, index3].join("-"),
    //               pid: [index, index2].join("-")
    //             }))
    //           }))
    //         }));
    //         const arr = this.treeToArr(
    //           arrs.map(item => ({
    //             ...item,
    //             prodItemLists: item.prodItemLists.map(item2 => ({
    //               ...item2,
    //               prodItemLists: item2.prodItemLists.map(item3 => ({
    //                 ...item3
    //               }))
    //             }))
    //           }))
    //         );
    //         this.searchData = arr;
    //       } else {
    //         this.searchData = [];
    //       }
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
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
      const data = {
        orgType: 5,
        pageNum: this.customPageNum,
        pageSize: this.customPageSize,
        enableStatus: -1,
        orgScale: -1
      };
      this.listQuery.fkOrgId = this.user.fkOrgId;
      this.form.fkOrgId = this.user.fkOrgId;
      // this.searchItems();
    },
    getOrgPageList() {
      this.loading = true;
      const data = {
        orgType: 5,
        pageNum: this.customPageNum,
        pageSize: this.customPageSize,
        enableStatus: -1,
        orgScale: -1,
        linkMan: this.linkMan,
        orgName: this.orgName,
        telephone: this.telephone
      };
      this.$api
        .searchLinkPage(data)
        .then(res => {
          if (res.code == 200) {
            this.customDataArr = res.data.records;
            this.customTotal = parseInt(res.data.total);
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

    productDept() {
      this.show6 = true;
      this.basicStatus = false;
      this.$nextTick(() => {
        this.$refs.custom.reset();
        this.basicStatus = true;
      });
    },
    setOptionWidth(event) {
      // 下拉框弹出时，设置弹框的宽度
      this.$nextTick(() => {
        this.selectOptionWidth = event.srcElement.offsetWidth + "px";
      });
    },
    editSeed(row, idx) {
      this.show4 = true;
      // addTitle
      this.bpmnContentStatus = this.addTitle == "引用流程";
      this.addTitleFour = "编辑流程";
      // addTitleFour: ""
      this.loading = true;
      if (this.bpmnContentStatus == true) {
        this.largeProcessPkId = this.form.pkId;
        this.subProcessPkId = row.pkId;
        console.log("aaaaaaaaaaaaaaaaaaaa");
        console.log(row);
        console.log("aaaaaaaaaaaaaaaaaaaa");
        if (row.workflowType != undefined) {
          row.workflowType = row.workflowType.toString();
        }

        // let rowData = JSON.stringify(row)
        const rowData = { ...row };
        this.subflowForm = rowData;
        this.subflowForm.fkProfessionalTypeId = row.baseSubWorkflow.fkProfessionalTypeId == undefined ? "" : row.baseSubWorkflow.fkProfessionalTypeId;
        this.subflowForm.remark = row.baseSubWorkflow.remark == undefined ? "" : row.baseSubWorkflow.remark;
        this.formFkWorkflowId = row.pkId;
        this.$nextTick(() => {
          this.$refs.seedRegPanl.exportDiagram(this.pitchOnDate[idx].bpmnContent, this.addTitle);
        });
        this.loading = false;
        return;
      }
      this.$api
        .customById({ pkId: row.fkWorkflowId })
        .then(res => {
          if (res.code == 200) {
            res.data.workflowType = res.data.workflowType.toString();
            this.subflowForm = res.data;
            this.formFkWorkflowId = res.data.pkId;
            // return console.log(res.data)
            this.$refs.seedRegPanl.exportDiagram(res.data.bpmnContent, this.addTitle, res.data.workflowTableList == null ? [] : workflowTableList);
            // }
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
    seedSubmit(formName) {
      const _this = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$refs.seedRegPanl.dataOhsa();
        } else {
          return false;
        }
      });
    },
    seedEnsureab(a, b, tableArr) {
      const _this = this;
      const workflowNodes = [];
      let endEventStatus = false;
      let startEventStatus = false;
      this.loading = true;
      a.businessObject.flowElements.forEach(item => {
        if (item.$type == "bpmn:UserTask") {
          const workflowNodeTables = [];
          if (item.$attrs.tableIds == undefined || item.$attrs.tableIds.length == 0) {
          } else {
            if (typeof item.$attrs.tableIds == "string") {
              item.$attrs.tableIds = item.$attrs.tableIds.split(",");
            }
            if (typeof item.$attrs.archives == "string") {
              item.$attrs.archives = item.$attrs.archives.split(",");
            }
            if (item.$attrs.archives == undefined) {
              item.$attrs.archives = [];
              item.$attrs.tableIds.forEach(z => {
                item.$attrs.archives.push(0);
              });
            }
            // console.log(item.$attrs.archive)
       
            item.$attrs.tableIds.forEach((e, index) => {
              console.log(e);
              if (e.length != 0 &&e != undefined && e != 'undefined') {
                workflowNodeTables.push({
                  fkTableId: e,
                  isArchives: item.$attrs.archives[index],
                  tableSource: "1",
                  sortval: workflowNodeTables.length
                });
              }
            });
          }
          workflowNodes.push({
            fkRoleId: item.$attrs.fkRoleId,
            name: item.name,
            nodeApproveType: item.$attrs.nodeApproveType,
            nodeType: 2,
            // quantitiesTable: item.$attrs.quantitiesTable == true ? 1 : 0,
            // materialUsedTable: item.$attrs.materialUsedTable == true ? 1 : 0,
            // scoreFlag: item.$attrs.scoreFlag == true ? 1 : 0,
            quantitiesTable: item.$attrs.quantitiesTable == true ? 1 : item.$attrs.quantitiesTable == 1 ? 1 : item.$attrs.quantitiesTable == "true" ? 1 : 0,
            materialUsedTable: item.$attrs.materialUsedTable == true ? 1 : item.$attrs.materialUsedTable == 1 ? 1 : item.$attrs.materialUsedTable == "true" ? 1 : 0,
            scoreFlag: item.$attrs.scoreFlag == true ? 1 : item.$attrs.scoreFlag == 1 ? 1 : item.$attrs.scoreFlag == "true" ? 1 : 0,
            tables: workflowNodeTables
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
      b.saveXML({ format: true }, (err, xml) => {
        let str = xml.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name=\"undefined\"',"")
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        const tableArrAy = [];
        if (tableArr.length) {
          tableArr.forEach(item => {
            if (item.tableId != "") {
              tableArrAy.push({
                fkTableId: item.tableId,
                isArchives: item.isArchives,
                tableSource: item.tableSource
              });
            }
          });
        }
        const data = {
          bpmnContent: str,
          fkEnginerringTypeId: _this.subflowForm.fkEnginerringTypeId,
          workflowName: _this.subflowForm.workflowName,
          workflowType: _this.subflowForm.workflowType,
          remark: _this.subflowForm.remark,
          fkProfessionalTypeId: _this.subflowForm.fkProfessionalTypeId,
          workflowNodes
        };

        data.pkId = _this.subflowForm.pkId;
        if (this.bpmnContentStatus) {
          data.pkId = _this.subflowForm.fkWorkflowId;
          // this.pitchOnDate.forEach(item => {
          //   if (item.pkId == data.pkId) {
          //     item.bpmnContent = data.bpmnContent
          //     // item.baseSubWorkflow.bpmnContent = data.bpmnContent
          //     // item.baseSubWorkflow.workflowNodeDTOS = data.workflowNodes
          //     // item.workflowName = data.workflowName
          //     // item.baseSubWorkflow.bpmnContent =data.bpmnContent
          //     // item.baseSubWorkflow.workflowName =data.workflowName
          //     // item.baseSubWorkflow.workflowNodeDTOS = data.workflowNodes
          //     // item.baseSubWorkflow.workflowNodes =data.workflowNodes
          //   }
          // })
          this.pitchOnDate.forEach(item => {
            if (item.fkWorkflowId == data.pkId) {
              item.bpmnContent = data.bpmnContent;
              item.workflowName = data.workflowName;
              item.baseSubWorkflow.bpmnContent = data.bpmnContent;
              item.baseSubWorkflow.workflowName = data.workflowName;
              item.baseSubWorkflow.workflowNodeDTOS = data.workflowNodes;
              item.baseSubWorkflow.workflowNodes = data.workflowNodes;

              // item.baseSubWorkflow = {
              //   workflowName:data.workflowName,
              //   workflowNodes:data.workflowNodes,
              //   bpmnContent:data.bpmnContent
              // }
              console.log("xxxxxxxxxxxxxxxx111xxxxxxxxxxxxxxxxxxxxxx");
              console.log(data.workflowNodes);
              console.log("xxxxxxxxxxxxxxxx1111xxxxxxxxxxxxxxxxxxxxxx");
            }
          });
          this.bpmnContentStatus = false;
          _this.show4 = false;
          this.addTitle = "引用流程";
          this.loading = false;
          return;
        }

        this.$api
          .customUpdate(data)
          .then(res => {
            if (res.code == 200) {
              this.loading = false;
              _this.bpmnContentStatus = true;
              _this.pitchOnDate.forEach(item => {
                if (item.fkWorkflowId == data.pkId) {
                  item.bpmnContent = data.bpmnContent;
                  if (item.baseSubWorkflow == undefined || item.baseSubWorkflow == null) {
                    item.baseSubWorkflow = {};
                  }
                  item.baseSubWorkflow.bpmnContent = data.bpmnContent;
                  item.baseSubWorkflow.workflowNodeDTOS = data.workflowNodes;
                  item.workflowName = data.workflowName;
                }
              });
              this.$message({
                type: "success",
                message: "编辑成功"
              });

              // _this.designFlow(this.seedDate);
              _this.show4 = false;
              _this.pagingDisplay();
              this.$nextTick(() => {
                this.bpmnContentStatus = false;
              });
            } else {
              this.loading = false;
              this.bpmnContentStatus = false;
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          })
          .catch(err => {
            this.bpmnContentStatus = false;
            this.loading = false;
          });
      });
    },
    searchMajorTypeList() {
      // this.searchOptions[1].options = [];
      this.expertSortData = [];
      this.$api.searchMajorTypeList({ typeId: this.user.fkEnginerringTypeId }).then(res => {
        if (res.code == 200) {
          // let typeIdStatus = false;
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
            if (item.pkId == this.user.fkEnginerringTypeId) {
              typeIdStatus = true;
            }
          });
          // this.searchOptions[1].options = res.data;
          this.expertSortData = res.data;
          // if (typeIdStatus == false) {
          //   this.$refs.searchBar.fkProfessionalTypeId();
          // }
        }
      });
    },
    change(val, val1) {
      // if (val.workflowType != "0" && val.workflowType != "1") {
      //   // this.searchOptions[1].disabled = true;
      //   // this.$refs.searchBar.fkProfessionalTypeId();
      // } else {
      //   // this.searchOptions[1].disabled = false;
      // }
    },
    /// /绑定技术规格
    technologyChang(val) {
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          if (item.bookPdfDTOS != null) {
            item.bookPdfDTOS = item.bookPdfDTOS.filter(item => {
              return item.bookType != 0;
            });
          }
        }
      });
      this.fieldListform.jsThePage = "";
      this.fieldListform.jsToPage = "";
      if (val == "" || val == null) {
        return;
      }

      this.fieldListform.jsThePage = 1;
      this.fieldListform.jsToPage = 1;
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          if (item.bookPdfDTOS == null) {
            item.bookPdfDTOS = [];
          }
          item.bookPdfDTOS.push({
            fkBookPdfId: val,
            beginPage: this.fieldListform.jsThePage,
            endPage: this.fieldListform.jsToPage,
            sortval: 0,
            bookType: 0
          });
        }
      });
    },

    // 技术规范开始页
    jsThePageChang(val) {
      if (this.fieldListform.technology == "" || this.fieldListform.technology == null) {
        this.fieldListform.jsThePage = "";
        return this.$message({
          type: "error",
          message: "请先选择技术规范"
        });
      }
      if (this.fieldListform.jsThePage == 0 || this.fieldListform.jsThePage == "") {
        return this.$message({
          type: "error",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.technologyDate.forEach(item => {
        if (item.pkId == this.fieldListform.technology) {
          sum = item.bookPages;
        }
      });

      if (val > sum) {
        this.fieldListform.jsThePage = 1;
        this.$message({
          type: "error",
          message: "开始页数不能大于文件总页数"
        });
      } else {
        this.fieldListform.jsToPage = sum;
      }

      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.bookPdfDTOS.forEach(i => {
            if (i.fkBookPdfId == this.fieldListform.technology) {
              i.beginPage = this.fieldListform.jsThePage;
              i.endPage = this.fieldListform.jsToPage;
            }
          });
        }
      });
    },
    // 技术规范结束页
    jsToPageChang(val) {
      if (this.fieldListform.technology == "" || this.fieldListform.technology == null) {
        this.fieldListform.jsToPage = "";
        return this.$message.warning("请先选择技术规范");
      }
      if (this.fieldListform.jsToPage == 0 || this.fieldListform.jsToPage == "") {
        this.fieldListform.jsToPage = "";
        return this.$message.warning("结束页数不能为0 或为空");
      }
      if (this.fieldListform.jsToPage - 0 < this.fieldListform.jsThePage - 0) {
        this.fieldListform.jsToPage = this.fieldListform.jsThePage;
        return this.$message.warning("结束页不能小于于开始页");
      }
      let sum = 0;
      this.technologyDate.forEach(item => {
        if (item.pkId == this.fieldListform.technology) {
          sum = item.bookPages;
        }
      });
      if (this.fieldListform.jsToPage - 0 > sum - 0) {
        this.fieldListform.jsToPage = sum;
        return this.$message.warning("结束页数不能大于文件总页数");
      }
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.bookPdfDTOS.forEach(i => {
            if (i.fkBookPdfId == this.fieldListform.technology) {
              i.endPage = this.fieldListform.jsToPage;
            }
          });
        }
      });
    },
    // 绑定安全规范
    safetyChange(val) {
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          if (item.bookPdfDTOS != null) {
            item.bookPdfDTOS = item.bookPdfDTOS.filter(item => {
              return item.bookType != 1;
            });
          }
        }
      });
      this.fieldListform.aqThePage = "";
      this.fieldListform.aqToPage = "";
      if (val == "" || val == null) {
        return;
      }
      this.fieldListform.aqThePage = 1;
      this.fieldListform.aqToPage = 1;
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          if (item.bookPdfDTOS == null) {
            item.bookPdfDTOS = [];
          }
          item.bookPdfDTOS.push({
            fkBookPdfId: val,
            beginPage: this.fieldListform.aqThePage,
            endPage: this.fieldListform.aqToPage,
            sortval: 1,
            bookType: 1
          });
        }
      });
    },

    // 安全规范开始页
    aqThePageChang(val) {
      //       safety: "", //安全
      // aqThePage: null, //安全开始页
      // aqToPage: null, //安全结束页
      if (this.fieldListform.safety == "" || this.fieldListform.safety == null) {
        this.fieldListform.aqThePage = "";
        return this.$message({
          type: "error",
          message: "请先选择安全规范"
        });
      }
      if (this.fieldListform.aqThePage == 0 || this.fieldListform.aqThePage == "") {
        return this.$message({
          type: "error",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.safetyDate.forEach(item => {
        if (item.pkId == this.fieldListform.safety) {
          sum = item.bookPages;
        }
      });

      if (val > sum) {
        this.fieldListform.aqThePage = 1;
        this.$message({
          type: "error",
          message: "开始页数不能大于文件总页数"
        });
      } else {
        this.fieldListform.aqToPage = sum;
      }

      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.bookPdfDTOS.forEach(i => {
            if (i.fkBookPdfId == this.fieldListform.safety) {
              i.beginPage = this.fieldListform.aqThePage;
              i.endPage = this.fieldListform.aqToPage;
            }
          });
        }
      });
    },
    // 安全规范结束页
    aqToPageChang(val) {
      if (this.fieldListform.safety == "" || this.fieldListform.safety == null) {
        this.fieldListform.aqToPage = "";
        return this.$message({
          type: "error",
          message: "请先选择安全规范"
        });
      }
      if (this.fieldListform.aqToPage == 0 || this.fieldListform.aqToPage == "") {
        return this.$message({
          type: "error",
          message: "结束页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.safetyDate.forEach(item => {
        if (item.pkId == this.fieldListform.safety) {
          sum = item.bookPages;
        }
      });

      if (this.fieldListform.aqToPage - 0 > sum || this.fieldListform.aqToPage - 0 < this.fieldListform.aqThePage) {
        this.fieldListform.aqToPage = sum;
        this.$message.warning("结束页数不能小于开始页数 ，大于文件总页数");
      }
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.bookPdfDTOS.forEach(i => {
            if (i.fkBookPdfId == this.fieldListform.safety) {
              i.endPage = this.fieldListform.aqToPage;
            }
          });
        }
      });
    },

    // 绑定验收标准
    standardChange(val) {
      // standard
      //  standard: "", //验收
      // ysThePage: null, //验收开始页
      // ysToPage: null, //验收结束页
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          if (item.bookPdfDTOS != null) {
            item.bookPdfDTOS = item.bookPdfDTOS.filter(item => {
              return item.bookType != 2;
            });
          }
        }
      });
      this.fieldListform.ysThePage = "";
      this.fieldListform.ysToPage = "";
      if (val == "" || val == null) {
        return;
      }
      this.fieldListform.ysThePage = 1;
      this.fieldListform.ysToPage = 1;
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          if (item.bookPdfDTOS == null) {
            item.bookPdfDTOS = [];
          }
          item.bookPdfDTOS.push({
            fkBookPdfId: val,
            beginPage: this.fieldListform.ysThePage,
            endPage: this.fieldListform.ysToPage,
            sortval: 2,
            bookType: 2
          });
        }
      });
    },

    // 验收开始页
    ysThePageChange(val) {
      //  standard: "", //验收
      // ysThePage: null, //验收开始页
      // ysToPage: null, //验收结束页
      if (this.fieldListform.standard == "" || this.fieldListform.standard == null) {
        this.fieldListform.ysThePage = "";
        return this.$message({
          type: "error",
          message: "请先选择验收标准"
        });
      }
      if (this.fieldListform.ysThePage == 0 || this.fieldListform.ysThePage == "") {
        return this.$message({
          type: "error",
          message: "开始页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.acceptanceLevel.forEach(item => {
        if (item.pkId == this.fieldListform.standard) {
          sum = item.bookPages;
        }
      });

      if (val > sum) {
        this.fieldListform.ysThePage = 1;
        this.$message({
          type: "error",
          message: "开始页数不能大于文件总页数"
        });
      } else {
        this.fieldListform.ysToPage = sum;
      }

      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.bookPdfDTOS.forEach(i => {
            if (i.fkBookPdfId == this.fieldListform.standard) {
              i.beginPage = this.fieldListform.ysThePage;
              i.endPage = this.fieldListform.ysToPage;
            }
          });
        }
      });
    },
    // 验收标准结束页
    ysToPageChang(val) {
      if (this.fieldListform.standard == "" || this.fieldListform.standard == null) {
        this.fieldListform.ysToPage = "";
        return this.$message({
          type: "error",
          message: "请先选择验收标准"
        });
      }
      if (this.fieldListform.ysToPage == 0 || this.fieldListform.ysToPage == "") {
        return this.$message({
          type: "error",
          message: "结束页数不能为0 或为空"
        });
      }
      let sum = 0;
      this.acceptanceLevel.forEach(item => {
        if (item.pkId == this.fieldListform.standard) {
          sum = item.bookPages;
        }
      });

      if (this.fieldListform.ysToPage - 0 > sum || this.fieldListform.ysToPage - 0 < this.fieldListform.ysThePage - 0) {
        this.fieldListform.ysToPage = sum;
        this.$message.warning("结束页数不能小于开始页数 ，大于文件总页数");
      }
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.bookPdfDTOS.forEach(i => {
            if (i.fkBookPdfId == this.fieldListform.standard) {
              i.endPage = this.fieldListform.ysToPage;
            }
          });
        }
      });
    },

    // 关联表格
    tableIdsChange(val) {
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.tableDTOS = this.fieldListform.tableIds;
        }
      });
    },
    // 档案表
    isArchivesChange() {
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          const rows = JSON.stringify(this.fieldListform.tableIds);
          item.tableDTOS = JSON.parse(rows);
        }
      });
    },
    // 工程量
    quantitiesTableChange(val) {
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.quantitiesTable = val == true ? 1 : 0;
        }
      });
    },
    // 材料用量
    materialUsedTableChange(val) {
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.materialUsedTable = val == true ? 1 : 0;
        }
      });
    },
    scoreFlagChange(val) {
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.scoreFlag = val == true ? 1 : 0;
        }
      });
    },
    workflowTypeChang(val) {
      if (this.form.fkProfessionalTypeId != "") {
        this.pitchOnDate = [];
        this.workflowTypeChange(this.form.fkProfessionalTypeId, this.form.fkEnginerringTypeId);
      } else {
        this.productionApproval = [];
        this.pitchOnDate = [];
      }
      if (val == 8) {
        this.getEOrgSealState();
      } else {
        this.unnamedType = "";
      }

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
        scoreFlag: "" // 评分量
      };
      if (val == 5) {
        this.customGetWorkflowType(val);
      }
    },
    getEOrgSealState() {
      if (this.user.orgType == 0) {
        this.$api.getOrgSealState().then(res => {
          if (res.code == 200) {
            if (res.data == 0) {
              this.unnamedType = 1;
            } else if (res.data == 2) {
              this.unnamedType = 2;
            } else {
              this.unnamedType = "";
            }
          } else {
            this.$message.error(res.msg);
          }
        });
      } else {
        this.$api.getEOrgSealState().then(res => {
          if (res.code == 200) {
            if (res.data == 0) {
              this.unnamedType = 1;
            } else if (res.data == 2) {
              this.unnamedType = 2;
            } else {
              this.unnamedType = "";
            }
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    resh() {
      this.getEOrgSealState();
    },

    customGetWorkflowType(val) {
      this.$api.customGetWorkflowType({ type: val }).then(res => {
        if (res.code == 200) {
          this.typeList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    typeIdChange() {
      this.customWorkflowPdf();
      if (this.form.workflowType == 1) {
        this.pitchOnDate = [];
        this.workflowTypeChange(this.form.fkProfessionalTypeId, this.form.fkEnginerringTypeId);
        this.searchTableVos(this.form.fkProfessionalTypeId);
      }
    },
    // 子流程点击
    bpmShowClick(row) {
      // return console.log(row)
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
      // if (this.addTitle == "引用流程" || this.addTitle == "切换验收流程") {
      //   // this.customQuotePdfsByType(row.pkId);
      //   // this.quoteSearchTableVos(row.pkId);
      //   // this.customQuotePdfsByType(row.pkId);
      // }
      // if (this.addTitle != "新增流程") {
      //   this.updateSearchPdfListByType(row.pkId);
      // }
      // if (this.addTitle == "编辑流程") {
      //   this.updateSearchTableVos(this.form.pkId, row.pkId);
      // }

      if (this.$refs.nodeForm != undefined) {
        this.$refs.nodeForm.resetFields();
      }
      this.fieldListform.pkId = row.pkId;
      this.fieldListform.name = row.workflowName;
      this.fieldListform.quantitiesTable = row.quantitiesTable == true;
      this.fieldListform.materialUsedTable = row.materialUsedTable == true;
      this.fieldListform.scoreFlag = row.scoreFlag == true;
      this.fieldListform.workflowType = row.workflowType;
      this.fieldListform.tableIds = [];

      if (row.tableDTOS != undefined && row.tableDTOS.length != 0) {
        if (this.addTitle == "新增流程") {
          this.fieldListform.tableIds = row.tableDTOS;
        } else {
          if (row.tableDTOS[0].fkTableId != undefined) {
            row.tableDTOS.forEach(item => {
              this.fieldListform.tableIds.push({
                fkTableId: item.fkTableId,
                isArchives: item.isArchives,
                tableSource: item.tableSource
              });
            });
          } else {
            this.fieldListform.tableIds = row.tableDTOS;
          }
        }
      } else {
        this.fieldListform.tableIds = [{ fkTableId: "", isArchives: 1, tableSource: "1" }];
      }
      setTimeout(() => {
        this.fieldListform.tableIds.forEach(item => {
          let tableIdStatus = true;

          this.relatedForm.forEach(e => {
            if (item.fkTableId == e.pkId) {
              tableIdStatus = false;
            }
          });
          if (tableIdStatus) {
            item.fkTableId = "";
          }
        });
        if (row.bookPdfDTOS != undefined && row.bookPdfDTOS.length != 0) {
          row.bookPdfDTOS.forEach(item => {
            if (item.sortval == 0) {
              this.fieldListform.technology = item.fkBookPdfId;
              this.fieldListform.jsThePage = item.beginPage;
              this.fieldListform.jsToPage = item.endPage;
              if (this.technologyDate.length == 0) {
                this.fieldListform.technology = "";
                this.fieldListform.jsThePage = "";
                this.fieldListform.jsToPage = "";
              } else {
                let technologyStatus = true;
                this.technologyDate.forEach(item => {
                  if (item.pkId == this.fieldListform.technology) {
                    technologyStatus = false;
                  }
                });
                if (technologyStatus) {
                  this.fieldListform.technology = "";
                  this.fieldListform.jsThePage = "";
                  this.fieldListform.jsToPage = "";
                }
              }
            } else if (item.sortval == 1) {
              this.fieldListform.safety = item.fkBookPdfId;
              this.fieldListform.aqThePage = item.beginPage;
              this.fieldListform.aqToPage = item.endPage;
              if (this.safetyDate.length == 0) {
                this.fieldListform.safety = "";
                this.fieldListform.aqThePage = "";
                this.fieldListform.aqToPage = "";
              } else {
                let safetyDateStatus = true;
                this.safetyDate.forEach(item => {
                  if (item.pkId == this.fieldListform.safety) {
                    safetyDateStatus = false;
                  }
                });
                if (safetyDateStatus) {
                  this.fieldListform.safety = "";
                  this.fieldListform.aqThePage = "";
                  this.fieldListform.aqToPage = "";
                }
              }
            } else if (item.sortval == 2) {
              this.fieldListform.standard = item.fkBookPdfId;
              this.fieldListform.ysThePage = item.beginPage;
              this.fieldListform.ysToPage = item.endPage;

              if (this.acceptanceLevel.length == 0) {
                this.fieldListform.standard = "";
                this.fieldListform.ysThePage = "";
                this.fieldListform.ysToPage = "";
              } else {
                let standardStatus = true;
                this.acceptanceLevel.forEach(item => {
                  if (item.pkId == this.fieldListform.standard) {
                    standardStatus = false;
                  }
                });
                if (standardStatus) {
                  this.fieldListform.standard = "";
                  this.fieldListform.ysThePage = "";
                  this.fieldListform.ysToPage = "";
                }
              }
            }
          });
        }
      }, 500);
    },

    /// /绑定事件

    // 选择子流程
    itemClick(item) {
      item.fkWorkflowId = item.pkId;
      if (item.isActive == false) {
        item.isActive = true;
        let status = false;
        this.pitchOnDate.forEach(item => {
          if (item.workflowType == 13) {
            status = true;
          }
        });
        if (status && item.workflowType == 13) {
          return this.$message.warning("已存在生产验收工序 ,生产验收流程只能存在一条生产验收工序");
        }
        if (this.addTitle == "引用流程") {
          this.$api.customById({ pkId: item.pkId }).then(res => {
            if (res.code == 200) {
              res.data.fkWorkflowId = res.data.pkId;
              res.data.baseSubWorkflow = res.data;
              if (status) {
                const arr = [];
                let data = {};
                this.pitchOnDate.forEach(item => {
                  if (item.workflowType == 13) {
                    data = item;
                  } else {
                    arr.push(item);
                  }
                });

                arr.push(res.data);
                arr.push(data);
                this.pitchOnDate = arr;
              } else {
                this.pitchOnDate.push(res.data);
              }
            } else {
              this.$message.warning(res.msg);
            }
          });
        } else {
          this.$api.engWorkflowById({ pkIds: item.pkId }).then(res => {
            if (res.code == 200) {
              if (status) {
                const arr = [];
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
    // 移除某一项
    itemDelete(row, index) {
      row.isActive = false;
      this.pitchOnDate = this.pitchOnDate.filter(items => items.pkId !== row.pkId);
      this.productionApproval.forEach(item => {
        if (item.pkId == row.pkId) {
          item.isActive = false;
        }
      });
      this.pitchOnDate.forEach((item, idx) => {
        this.$refs.bpmShow[idx].flushBpmn(item.bpmnContent);
      });
    },
    // 向下
    itemDown(arr, index) {
      if (index >= this.pitchOnDate.length - 1) return this.pitchOnDate;
      this.pitchOnDate[index] = this.pitchOnDate.splice(index + 1, 1, this.pitchOnDate[index])[0];
      this.pitchOnDate.forEach((item, idx) => {
        this.$refs.bpmShow[idx].flushBpmn(item.bpmnContent);
      });
    },
    // 向上
    itemUpward(arr, index) {
      if (index < 1) return this.pitchOnDate;
      this.pitchOnDate[index] = this.pitchOnDate.splice(index - 1, 1, this.pitchOnDate[index])[0];
      this.pitchOnDate.forEach((item, idx) => {
        this.$refs.bpmShow[idx].flushBpmn(item.bpmnContent);
      });
    },
    // 获取左侧列表
    workflowTypeChange(val, id) {
      const data = val == 0 ? id : val;
      this.fessionalTypeId = data;
      this.$api
        .customSearchWorkflowTemplateList({
          fessionalTypeId: data
        })
        .then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.isActive = false;
            });
            this.productionApproval = res.data;
          }
        });
    },
    workflowNameLikeQuery() {
      const data = {
        fessionalTypeId: this.form.fkProfessionalTypeId,
        workflowNameLike: this.workflowNameLike
      };
      this.$api.customSearchWorkflowTemplateList(data).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.isActive = false;
            this.pitchOnDate.forEach(e => {
              if (item.pkId == e.pkId) {
                item.isActive = true;
              }
            });
          });
          this.productionApproval = res.data;
        }
      });
    },
    // 配置分项确认
    ensure() {
      const data = {
        pkId: this.showDate.pkId,
        items: this.defaultKey.toString(),
        fkOrgId: this.listQuery.fkOrgId
      };
      this.$api.customItem(data).then(res => {
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
      const workflowNodes = [];
      let endEventStatus = false;
      let startEventStatus = false;
      this.loading = true;
      if (a.businessObject.flowElements == undefined) {
        this.loading = false;
        return this.$message.error("流程图不能为空");
      }
      a.businessObject.flowElements.forEach(item => {
        if (item.$type == "bpmn:UserTask") {
          const workflowNodeTables = [];
          if (item.$attrs.tableIds == undefined || item.$attrs.tableIds.length == 0) {
          } else {
            if (typeof item.$attrs.tableIds == "string") {
              item.$attrs.tableIds = item.$attrs.tableIds.split(",");
            }
            if (typeof item.$attrs.archives == "string") {
              item.$attrs.archives = item.$attrs.archives.split(",");
            }
            item.$attrs.tableIds.forEach((e, index) => {
    
              if (e != undefined && e != 'undefined' && e.length != 0  && e != null && e != 'null') {
                workflowNodeTables.push(e
                //   {
                //   fkTableId: e,
                //   isArchives: item.$attrs.archives[index],
                //   tableSource: item.$attrs.tableSource
                // }
                );
              }
            });
          }
          // alert("111111111")
          console.log(item.$attrs)
          workflowNodes.push({
            fkRoleId: item.$attrs.fkRoleId,
            name: item.name,
            nodeApproveType: item.$attrs.nodeApproveType,
            nodeType: 2,
            nodeMark: item.id,
            // workflowNodeTables,
            tableIds:workflowNodeTables,
            roleSource: item.$attrs.unitId == "-1" ? "1" : "0",
            fkUserId: item.$attrs.fkUserId,
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
      let arr=workflowNodes.filter(item=>item.nodeType==2)
      if(this.form.workflowType==8&&this.launchType==2&&arr[0].nodeApproveType=='3'){
        this.loading=false
        return this.$message.warning("发起人设置为首个流程节点岗位时，第一个节点必须为审批节点")
      }
      workflowNodes.forEach((item, i) => {
        item.sortval = i;
      });
      // }

      b.saveXML({ format: true }, (err, xml) => {
        let str = xml.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name=\"undefined\"',"")
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        
        const tableArrAy = [];
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
        const data = {
          bpmnContent: str,
          fkEnginerringTypeId: _this.form.fkEnginerringTypeId,
          workflowName: _this.form.workflowName,
          workflowType: _this.form.workflowType,
          remark: _this.form.remark,
          fkProfessionalTypeId: _this.form.fkProfessionalTypeId,
          workflowNodes,
          fkOrgId: _this.user.fkOrgId,
          tableIds: tableArrAy,
          type: _this.form.type
        };
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
        if (data.workflowType == 0 || data.workflowType == 13) {
          data.pdfIdList = this.pdfListData;
        } else {
          data.launchType = this.launchType;
          if (data.launchType == 1) {
            data.fkRoleId = this.fkRoleId;
          }
        }
        if ((this.user.orgType == "2" || this.user.orgType == "3" || this.user.orgType == "9") && this.tabPosition == "4") {
          data.fkBidProjectId = this.form.fkBidProjectId;
        }
        if (this.addTitle == "新增流程") {
          this.$api
            .customAddFlow(data)
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
            .customUpdate(data)
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
    // 新增修改确认
    addFlowSubmit(formName) {
      const _this = this;
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.form.workflowType == 1) {
            if (this.pitchOnDate.length == 0) {
              return _this.$message({
                type: "warning",
                message: "请选择流程节点"
              });
            }
            const arr = [{ nodeType: 0, sortval: 0 }];
            this.loading = true;
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
              const itemTableList = [];
              if (item.tableDTOS != undefined && item.tableDTOS.length != 0) {
                item.tableDTOS.forEach(i => {
                  if (i.fkTableId.length != 0) {
                    itemTableList.push({
                      isArchives: i.isArchives,
                      fkTableId: i.fkTableId,
                      tableSource: i.tableSource
                    });
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
                workflowNodeTables: itemTableList,
                // tableIds: item.tableDTOS == Object ? item.tableDTOS.pkId : item.tableDTOS,
                pdfIdList: item.bookPdfDTOS
              });
            });
            arr.push({ nodeType: 1, sortval: arr.length });
            const data = {
              bpmnContent: this.pitchOnDate[0].bpmnContent,
              fkEnginerringTypeId: _this.form.fkEnginerringTypeId,
              workflowName: _this.form.workflowName,
              workflowType: _this.form.workflowType,
              fkProfessionalTypeId: _this.form.fkProfessionalTypeId,
              remark: _this.form.remark,
              workflowNodes: arr,
              fkOrgId: _this.user.fkOrgId
            };
            if (this.addTitle == "新增流程") {
              this.$api
                .customAddFlow(data)
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
              const arr = [{ nodeType: 0, sortval: 0 }];
              console.log(this.pitchOnDate);
              this.pitchOnDate.forEach((item, idx) => {
                tableIdsArr = [];
                if (item.tableDTOS == null || item.tableDTOS.length == 0) {
                  tableIdsArr = [];
                } else {
                  if (item.tableDTOS[0].fkTableId != undefined) {
                    item.tableDTOS.forEach(i => {
                      if (i.fkTableId.length != 0) {
                        tableIdsArr.push({ fkTableId: i.fkTableId, isArchives: i.isArchives, tableSource: i.tableSource });
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
                  workflowNodeTables: tableIdsArr
                });
              });
              // subentryData
              arr.push({ nodeType: 1, sortval: arr.length + 1 });
              const data = {
                bpmnContent: this.pitchOnDate[0].bpmnContent,
                fkEnginerringTypeId: _this.form.fkEnginerringTypeId,
                workflowName: _this.form.workflowName,
                workflowType: _this.form.workflowType,
                fkProfessionalTypeId: _this.form.fkProfessionalTypeId,
                remark: _this.form.remark,
                workflowNodes: arr,
                pkId: _this.form.pkId,
                fkOrgId: _this.listQuery.fkOrgId
              };
              // if (this.addTitle == "引用流程") {
              //   // data.prodItemId = this.prodItemId;
              //   data.itemId = this.prodItemId;
              //   data.workflowNodes.forEach(item => {
              //     // item.tables = item.tableIds
              //     if (item.workflowNodeTables != undefined && item.workflowNodeTables != null && item.workflowNodeTables.length != 0) {
              //       const tables1 = JSON.stringify(item.workflowNodeTables);
              //       item.tables = JSON.parse(tables1);
              //     } else {
              //       item.tables = [];
              //     }
              //     delete item.workflowNodeTables;
              //     if (item.tables != undefined && item.tables != null && item.tables.length != 0) {
              //       item.tables.forEach((s, idx) => {
              //         s.sortval = idx;
              //       });
              //     }
              //     item.nodeName = item.name;
              //     item.bookPdfs = item.pdfIdList == undefined ? [] : item.pdfIdList;
              //     this.pitchOnDate.forEach(e => {
              //       if (item.fkWorkflowId == e.fkWorkflowId) {
              //         item.baseSubWorkflow = {
              //           pkId: e.baseSubWorkflow != undefined ? e.baseSubWorkflow.pkId : e.pkId,
              //           workflowName: e.baseSubWorkflow != undefined ? e.baseSubWorkflow.workflowName : e.workflowName,
              //           bpmnContent: e.baseSubWorkflow != undefined ? e.baseSubWorkflow.bpmnContent : e.bpmnContent,
              //           remark: e.baseSubWorkflow != undefined ? e.baseSubWorkflow.remarks : e.remarks,
              //           workflowNodes: e.baseSubWorkflow != undefined ? e.baseSubWorkflow.workflowNodeDTOS : []
              //         };
              //       }
              //     });
              //     if (item.baseSubWorkflow != undefined) {
              //       item.baseSubWorkflow.workflowNodes.forEach(s => {
              //         s.nodeName = s.name;
              //         if (s.tables != undefined) {
              //           s.tables = s.tables;
              //         } else {
              //           s.tables = s.tableDTOS == null ? [] : s.tableDTOS;
              //         }
              //       });
              //     }
              //   });
              //   this.$api
              //     .quoteUpdate(data)
              //     .then(res => {
              //       if (res.code == 200) {
              //         this.loading = false;
              //         this.$message({
              //           type: "success",
              //           message: "编辑成功"
              //         });
              //         _this.show1 = false;
              //         _this.subentryShow = false;
              //         _this.pagingDisplay();
              //         _this.customizedSearchItems(this.listQuery.fkOrgId);
              //       } else {
              //         this.loading = false;
              //         this.$message({
              //           type: "error",
              //           message: res.msg
              //         });
              //       }
              //     })
              //     .catch(err => {
              //       this.loading = false;
              //     });
              // } else {
                this.$api
                  .customUpdate(data)
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
                      // _this.searchItems(this.listQuery.fkOrgId);
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
            // }
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
      this.listQuery.fkOrgId = this.user.fkOrgId;
      this.listQuery.workflowType = this.tabPosition;
      this.$api
        .searchPageCustomU(this.listQuery)
        .then(res => {
          if (res.code == 200) {
            res.data.records.forEach(item => {
              item.checked = false;
            });
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
    // 查询
    search(form) {
      // this.listQuery.fkEnginerringTypeId = form.fkEnginerringTypeId == undefined ? "" : form.fkEnginerringTypeId;
      // this.listQuery.workflowType = form.workflowType == undefined ? "" : form.workflowType;
      // this.listQuery.workflowName = form.workflowName == undefined ? "" : form.workflowName;
      // this.listQuery.keyWord = form.keyWord == undefined ? "" : form.keyWord;
      // this.listQuery.fkProfessionalTypeId = form.fkProfessionalTypeId == undefined ? "" : form.fkProfessionalTypeId;

      this.listQuery.pageNum = 1;
      this.pagingDisplay();
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.pagingDisplay();
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.pagingDisplay();
    },
    messageTypeClick(val){
      // console.log(val)
      if(val.name =='1'){
        // this.examine(this.form)
        // this.$refs.examineBpmn.exportDiagram(res.data.bpmnContent, res.data);
      }
    },
    // 查看
    examine(row) {
      this.messageType ="1"
      this.formFkWorkflowId = row.pkId;
      this.loading = true;
      // if (row.workflowType == 1) {
      //   this.pitchOnDate = [];
      //   this.show1 = true;
      //   this.radioStatus = false;
      //   this.marginNum = "70px 0";
      //   this.addTitle = "查看流程";

      //   this.workflowTypeChange(row.fkProfessionalTypeId, row.fkEnginerringTypeId);
      //   this.searchTableVos(row.fkProfessionalTypeId);
      //   const ss = row.fkProfessionalTypeId == 0 ? row.fkEnginerringTypeId : row.fkProfessionalTypeId;
      //   this.$api
      //     .customById({ pkId: row.pkId })
      //     .then(res => {
      //       if (res.code == 200) {
      //         res.data.workflowType = res.data.workflowType.toString();
      //         this.form = res.data;
      //         this.customWorkflowPdf();
      //         const arr = [];
      //         res.data.workflowNodeDTOS.forEach(item => {
      //           if (item.nodeType == 3) {
      //             arr.push(item);
      //           }
      //         });
      //         const nodeList = res.data.nodeList.join(",");
      //         this.$api
      //           .engWorkflowById({ pkIds: nodeList })
      //           .then(res => {
      //             if (res.code == 200) {
      //               const arr1 = res.data;
      //               arr1.forEach(item => {
      //                 arr.forEach(e => {
      //                   if (item.pkId == e.fkWorkflowId) {
      //                     e.bpmnContent = item.bpmnContent;
      //                     e.workflowName = item.workflowName;
      //                     e.workflowType = item.workflowType;
      //                   }
      //                 });
      //               });
      //               this.pitchOnDate = arr;
      //               this.loading = false;
      //             } else {
      //               this.loading = false;
      //               this.$message.warning(res.msg);
      //             }
      //           })
      //           .catch(err => {
      //             this.loading = false;
      //           });
      //       } else {
      //         this.$message.warning(res.msg);
      //       }
      //     })
      //     .catch(err => {
      //       this.loading = false;
      //     });
      // } else {
      this.$api
        .customById({ pkId: row.pkId })
        .then(res => {
          if (res.code == 200) {
            this.addTitle = "查看流程";
            res.data.workflowType = res.data.workflowType.toString();
            this.form = res.data;
            this.XmlStr = res.data.bpmnContent;
            this.show3 = true;
            if (res.data.workflowType == 5) {
              this.customGetWorkflowType(res.data.workflowType);
              // this.warehouseType = res.data.type;
            }
            this.$nextTick(() => {
              this.$refs.examineBpmn.exportDiagram(res.data.bpmnContent, res.data);
            });
            this.loading = false;
          } else {
            this.loading = false;
          }
        })
        .catch(err => {
          this.loading = false;
        });
      // }
    },
    // 编辑流程
    designFlow(row) {
      if (row.workflowType == 8) {
        this.getEOrgSealState();
      } else {
        this.unnamedType = "";
      }

      this.seedDate = row;
      this.formFkWorkflowId = row.pkId;
      this.radioStatus = false;
      this.marginNum = "70px 0";
      this.addTitle = "编辑流程";
      this.loading = true;
      // if (row.workflowType == 1) {
      //   this.nodeShow = false;
      //   this.pitchOnDate = [];
      //   const data = row.fkProfessionalTypeId == 0 ? row.fkEnginerringTypeId : row.fkProfessionalTypeId;
      //   this.searchTableVos(row.fkProfessionalTypeId);
      //   this.$api
      //     .customSearchWorkflowTemplateList({
      //       fessionalTypeId: data
      //     })
      //     .then(res => {
      //       if (res.code == 200) {
      //         res.data.forEach(item => {
      //           item.isActive = false;
      //         });
      //         this.productionApproval = res.data;
      //         this.$api
      //           .customById({ pkId: row.pkId })
      //           .then(res => {
      //             if (res.code == 200) {
      //               res.data.workflowType = res.data.workflowType.toString();
      //               this.form = res.data;
      //               this.customWorkflowPdf();
      //               const arr = [];
      //               res.data.workflowNodeDTOS.forEach(item => {
      //                 if (item.nodeType == 3) {
      //                   arr.push(item);
      //                 }
      //               });
      //               const nodeList = res.data.nodeList.join(",");
      //               this.$api.engWorkflowById({ pkIds: nodeList }).then(res => {
      //                 if (res.code == 200) {
      //                   const arr1 = res.data;
      //                   this.productionApproval.forEach(item => {
      //                     arr1.forEach(e => {
      //                       if (item.pkId == e.pkId) {
      //                         item.isActive = true;
      //                       }
      //                     });
      //                   });
      //                   arr1.forEach(item => {
      //                     arr.forEach(e => {
      //                       if (item.pkId == e.fkWorkflowId) {
      //                         e.bpmnContent = item.bpmnContent;
      //                         e.workflowName = item.workflowName;
      //                         e.workflowType = item.workflowType;
      //                       }
      //                     });
      //                   });
      //                   this.pitchOnDate = arr;
      //                   console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      //                   console.log(this.pitchOnDate);
      //                   console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      //                   this.loading = false;
      //                 } else {
      //                   this.loading = false;
      //                   this.$message.warning(res.msg);
      //                 }
      //               });
      //               this.loading = false;
      //             } else {
      //               this.loading = false;
      //               this.$message({
      //                 type: "error",
      //                 message: res.msg
      //               });
      //             }
      //           })
      //           .catch(err => {
      //             this.loading = false;
      //           });
      //       } else {
      //         this.loading = false;
      //         this.$message({
      //           type: "error",
      //           message: res.msg
      //         });
      //       }
      //     })
      //     .catch(err => {
      //       this.loading = false;
      //     });
      // } else {
      this.$api
        .customById({ pkId: row.pkId })
        .then(res => {
          if (res.code == 200) {
            res.data.workflowType = res.data.workflowType.toString();
            res.data.type = res.data.type == null ? "" : res.data.type.toString();
            this.flowTableArr = res.data.workflowNodeTables;
            this.form = res.data;
            this.show1 = true;
            this.$nextTick(() => {
              if (this.$refs.regPanl != undefined) {
                this.$refs.regPanl.exportDiagram(res.data.bpmnContent, res.data.workflowTableList, res.data);
              }
            });
            if (res.data.workflowType == 5) {
              this.customGetWorkflowType(res.data.workflowType);
              this.warehouseType = res.data.type;
            }
            if((this.user.orgType == '2' || this.user.orgType == '3' || this.user.orgType == '9') && res.data.workflowType == 4){
              this.noProject(res.data.fkProjectId)
            } 
            // 
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
      // }
    },
    // inspectionReport(item) {
    //   this.radioStatus = false;
    //   this.marginNum = "70px 0";
    //   const itemId = item.pkId;
    //   this.$api.searchOrgProcessByItemId({ itemId }).then(res => {
    //     if (res.code === 200) {
    //       const row = res.data;
    //       this.seedDate = res.data;
    //       this.show1 = true;
    //       this.addTitle = "编辑流程";
    //       this.loading = true;
    //       this.nodeShow = false;
    //       this.pitchOnDate = [];
    //       const data = res.data.fkProfessionalTypeId == 0 ? res.data.fkEnginerringTypeId : row.fkProfessionalTypeId;
    //       this.$api
    //         .customSearchWorkflowTemplateList({
    //           fessionalTypeId: data
    //         })
    //         .then(res => {
    //           if (res.code == 200) {
    //             res.data.forEach(item => {
    //               item.isActive = false;
    //             });
    //             this.productionApproval = res.data;
    //             this.$api
    //               .customById({ pkId: row.pkId })
    //               .then(res => {
    //                 if (res.code == 200) {
    //                   res.data.workflowType = res.data.workflowType.toString();
    //                   this.form = res.data;
    //                   this.customWorkflowPdf();
    //                   if (this.form.workflowType == 1) {
    //                     const arr = [];
    //                     res.data.workflowNodeDTOS.forEach(item => {
    //                       if (item.nodeType == 3) {
    //                         arr.push(item);
    //                       }
    //                     });
    //                     this.formFkWorkflowId = res.data.pkId;
    //                     const nodeList = res.data.nodeList.join(",");
    //                     this.$api.engWorkflowById({ pkIds: nodeList }).then(res => {
    //                       if (res.code == 200) {
    //                         const arr1 = res.data;
    //                         this.productionApproval.forEach(item => {
    //                           arr1.forEach(e => {
    //                             if (item.pkId == e.pkId) {
    //                               item.isActive = true;
    //                             }
    //                           });
    //                         });
    //                         arr1.forEach(item => {
    //                           arr.forEach(e => {
    //                             if (item.pkId == e.fkWorkflowId) {
    //                               e.bpmnContent = item.bpmnContent;
    //                               e.workflowName = item.workflowName;
    //                               e.workflowType = item.workflowType;
    //                             }
    //                           });
    //                         });
    //                         this.pitchOnDate = arr;
    //                         this.loading = false;
    //                       } else {
    //                         this.loading = false;
    //                         this.$message.warning(res.msg);
    //                       }
    //                     });
    //                   } else {
    //                     // this.$refs.regPanl.exportDiagram(res.data.bpmnContent, this.addTitle);
    //                   }
    //                   this.loading = false;
    //                 } else {
    //                   this.loading = false;
    //                   this.$message({
    //                     type: "error",
    //                     message: res.msg
    //                   });
    //                 }
    //               })
    //               .catch(err => {
    //                 this.loading = false;
    //               });
    //           } else {
    //             this.loading = false;
    //             this.$message({
    //               type: "error",
    //               message: res.msg
    //             });
    //           }
    //         })
    //         .catch(err => {
    //           this.loading = false;
    //         });
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    //   /// ///////////////
    // },
    // referEditor(item) {
    //   this.radio = "0";
    //   this.radioStatus = true;
    //   this.marginNum = "100px 0";
    //   const itemId = item.pkId;
    //   this.prodItemId = item.pkId;
    //   this.$api.searchOrgProcessByItemId({ itemId }).then(res => {
    //     if (res.code === 200) {
    //       //= ===================================
    //       const row = res.data;
    //       this.seedDate = res.data;
    //       this.show1 = true;
    //       this.addTitle = "引用流程";
    //       this.loading = true;
    //       // if (row.workflowType == 1) {
    //       this.nodeShow = false;
    //       this.pitchOnDate = [];
    //       const data = res.data.fkProfessionalTypeId == 0 ? res.data.fkEnginerringTypeId : row.fkProfessionalTypeId;

    //       this.searchTableVos(row.fkProfessionalTypeId);
    //       this.$api
    //         .customSearchWorkflowTemplateList({
    //           fessionalTypeId: data
    //           // fkOrgId: this.listQuery.fkOrgId
    //         })
    //         .then(res => {
    //           if (res.code == 200) {
    //             res.data.forEach(item => {
    //               item.isActive = false;
    //             });
    //             this.productionApproval = res.data;

    //             this.$api
    //               .customById({ pkId: row.pkId })
    //               .then(res => {
    //                 if (res.code == 200) {
    //                   res.data.workflowType = res.data.workflowType.toString();
    //                   this.form = res.data;
    //                   if (this.form.workflowType == 1) {
    //                     const arr = [];
    //                     res.data.workflowNodeDTOS.forEach(item => {
    //                       if (item.nodeType == 3) {
    //                         arr.push(item);
    //                       }
    //                     });
    //                     const nodeList = res.data.nodeList.join(",");
    //                     this.$api.engWorkflowById({ pkIds: nodeList }).then(res => {
    //                       if (res.code == 200) {
    //                         const arr1 = res.data;
    //                         this.productionApproval.forEach(item => {
    //                           arr1.forEach(e => {
    //                             if (item.pkId == e.pkId) {
    //                               item.isActive = true;
    //                             }
    //                           });
    //                         });
    //                         arr1.forEach(item => {
    //                           arr.forEach(e => {
    //                             if (item.pkId == e.fkWorkflowId) {
    //                               e.bpmnContent = item.bpmnContent;
    //                               e.workflowName = item.workflowName;
    //                               e.workflowType = item.workflowType;
    //                             }
    //                           });
    //                         });
    //                         this.pitchOnDate = arr;
    //                         this.loading = false;
    //                       } else {
    //                         this.loading = false;
    //                         this.$message.warning(res.msg);
    //                       }
    //                     });
    //                   } else {
    //                     this.$refs.regPanl.exportDiagram(res.data.bpmnContent, this.addTitle);
    //                   }
    //                   this.loading = false;
    //                 } else {
    //                   this.loading = false;
    //                   this.$message({
    //                     type: "error",
    //                     message: res.msg
    //                   });
    //                 }
    //               })
    //               .catch(err => {
    //                 this.loading = false;
    //               });
    //           } else {
    //             this.loading = false;
    //             this.$message({
    //               type: "error",
    //               message: res.msg
    //             });
    //           }
    //         })
    //         .catch(err => {
    //           this.loading = false;
    //         });

    //       //= ===================================
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    //   /// ///////////////
    // },
    // switchover(item) {
    //   // subentryShow

    //   if (item.selfDefined == 0) {
    //     this.userDefined = "2";
    //   } else {
    //     this.userDefined = "1";
    //   }
    //   this.itemData = item;
    //   this.radio = "0";
    //   this.radioStatus = false;
    //   this.marginNum = "70px 0";
    //   if (item.selfDefined == 0) {
    //     const itemId = item.pkId;

    //     this.$api.searchOrgProcessByItemId({ itemId }).then(res => {
    //       if (res.code === 200) {
    //         const row = res.data;
    //         this.seedDate = res.data;
    //         this.subentryShow = true;
    //         this.addTitle = "切换验收流程";
    //         this.loading = true;
    //         this.nodeShow = false;
    //         this.pitchOnDate = [];
    //         const data = res.data.fkProfessionalTypeId == 0 ? res.data.fkEnginerringTypeId : row.fkProfessionalTypeId;

    //         this.searchTableVos(row.fkProfessionalTypeId);

    //         this.$api
    //           .customSearchWorkflowTemplateList({
    //             fessionalTypeId: data
    //           })
    //           .then(res => {
    //             if (res.code == 200) {
    //               res.data.forEach(item => {
    //                 item.isActive = false;
    //               });
    //               this.productionApproval = res.data;
    //               this.pitchOnDate = [];
    //               this.$api
    //                 .customById({ pkId: row.pkId })
    //                 .then(res => {
    //                   if (res.code == 200) {
    //                     res.data.workflowType = res.data.workflowType.toString();
    //                     this.form = res.data;
    //                     this.customWorkflowPdf(item.pkId);
    //                     this.searchListByOrgId();
    //                     this.acceptanceAs = res.data.pkId;
    //                     if (this.form.workflowType == 1) {
    //                       const arr = [];
    //                       res.data.workflowNodeDTOS.forEach(item => {
    //                         if (item.nodeType == 3) {
    //                           arr.push(item);
    //                         }
    //                       });
    //                       const nodeList = res.data.nodeList.join(",");
    //                       this.$api
    //                         .engWorkflowById({ pkIds: nodeList })
    //                         .then(res => {
    //                           if (res.code == 200) {
    //                             const arr1 = res.data;
    //                             this.productionApproval.forEach(item => {
    //                               arr1.forEach(e => {
    //                                 if (item.pkId == e.pkId) {
    //                                   item.isActive = true;
    //                                 }
    //                               });
    //                             });
    //                             arr1.forEach(item => {
    //                               arr.forEach(e => {
    //                                 if (item.pkId == e.fkWorkflowId) {
    //                                   e.bpmnContent = item.bpmnContent;
    //                                   e.workflowName = item.workflowName;
    //                                   e.workflowType = item.workflowType;
    //                                 }
    //                               });
    //                             });
    //                             this.pitchOnDate = arr;
    //                             this.loading = false;
    //                           } else {
    //                             this.loading = false;
    //                             this.$message.warning(res.msg);
    //                           }
    //                         })
    //                         .catch(err => {
    //                           this.loading = false;
    //                         });
    //                     } else {
    //                       this.$refs.regPanl.exportDiagram(res.data.bpmnContent, this.addTitle);
    //                     }
    //                     this.loading = false;
    //                   } else {
    //                     this.loading = false;
    //                     this.$message({
    //                       type: "error",
    //                       message: res.msg
    //                     });
    //                   }
    //                 })
    //                 .catch(err => {
    //                   this.loading = false;
    //                 });
    //             } else {
    //               this.loading = false;
    //               this.$message({
    //                 type: "error",
    //                 message: res.msg
    //               });
    //             }
    //           })
    //           .catch(err => {
    //             this.loading = false;
    //           });
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //     });
    //   } else {
    //     this.radioStatus = false;
    //     this.marginNum = "70px 0";
    //     const itemId = item.pkId;
    //     this.$api.searchOrgProcessByItemId({ itemId }).then(res => {
    //       if (res.code === 200) {
    //         const row = res.data;
    //         this.seedDate = res.data;
    //         this.subentryShow = true;
    //         this.addTitle = "切换验收流程";
    //         this.loading = true;
    //         this.nodeShow = false;
    //         this.pitchOnDate = [];
    //         const data = res.data.fkProfessionalTypeId == 0 ? res.data.fkEnginerringTypeId : row.fkProfessionalTypeId;
    //         this.searchTableVos(row.fkProfessionalTypeId);
    //         this.$api
    //           .customSearchWorkflowTemplateList({
    //             fessionalTypeId: data
    //           })
    //           .then(res => {
    //             if (res.code == 200) {
    //               res.data.forEach(item => {
    //                 item.isActive = false;
    //               });
    //               this.productionApproval = res.data;
    //               this.$api
    //                 .customById({ pkId: row.pkId })
    //                 .then(res => {
    //                   if (res.code == 200) {
    //                     res.data.workflowType = res.data.workflowType.toString();
    //                     this.form = res.data;
    //                     this.customWorkflowPdf();
    //                     this.searchListByOrgId();
    //                     this.acceptanceAs = res.data.pkId;
    //                     if (this.form.workflowType == 1) {
    //                       const arr = [];
    //                       res.data.workflowNodeDTOS.forEach(item => {
    //                         if (item.nodeType == 3) {
    //                           arr.push(item);
    //                         }
    //                       });
    //                       const nodeList = res.data.nodeList.join(",");
    //                       this.$api
    //                         .engWorkflowById({ pkIds: nodeList })
    //                         .then(res => {
    //                           if (res.code == 200) {
    //                             const arr1 = res.data;
    //                             this.productionApproval.forEach(item => {
    //                               arr1.forEach(e => {
    //                                 if (item.pkId == e.pkId) {
    //                                   item.isActive = true;
    //                                 }
    //                               });
    //                             });
    //                             arr1.forEach(item => {
    //                               arr.forEach(e => {
    //                                 if (item.pkId == e.fkWorkflowId) {
    //                                   e.bpmnContent = item.bpmnContent;
    //                                   e.workflowName = item.workflowName;
    //                                   e.workflowType = item.workflowType;
    //                                 }
    //                               });
    //                             });
    //                             this.pitchOnDate = arr;
    //                             this.loading = false;
    //                           } else {
    //                             this.loading = false;
    //                             this.$message.warning(res.msg);
    //                           }
    //                         })
    //                         .catch(err => {
    //                           this.loading = false;
    //                         });
    //                     } else {
    //                       this.$refs.regPanl.exportDiagram(res.data.bpmnContent, this.addTitle);
    //                     }
    //                     this.loading = false;
    //                   } else {
    //                     this.loading = false;
    //                     this.$message({
    //                       type: "error",
    //                       message: res.msg
    //                     });
    //                   }
    //                 })
    //                 .catch(err => {
    //                   this.loading = false;
    //                 });
    //             } else {
    //               this.loading = false;
    //               this.$message({
    //                 type: "error",
    //                 message: res.msg
    //               });
    //             }
    //           })
    //           .catch(err => {
    //             this.loading = false;
    //           });
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //     });
    //   }
    // },
    radioChange(val) {
      this.$api
        .customSearchWorkflowTemplateList({
          fessionalTypeId: this.seedDate.fkProfessionalTypeId,
          // fkOrgId: this.listQuery.fkOrgId,
          sourceType: this.radio
        })
        .then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.isActive = false;
            });
            this.productionApproval = res.data;
          }
        });
    },
    getArrEqual(arr1, arr2) {
      const newArr = [];
      for (let i = 0; i < arr2.length; i++) {
        for (let j = 0; j < arr1.length; j++) {
          if (arr1[j].pkId === arr2[i].pkId) {
            newArr.push(arr1[j]);
          }
        }
      }
      return newArr;
    },
    // 取消流程
    // cancel(row) {
    //   const _this = this;
    //   _this
    //     .$confirm("确认取消该流程?", "取消流程确认", {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     })
    //     .then(() => {
    //       this.$api.customStatus({ pkId: row.pkId, publishStatus: 0 }).then(res => {
    //         if (res.code == 200) {
    //           this.$message({
    //             type: "success",
    //             message: "取消流程成功"
    //           });
    //           this.pagingDisplay();
    //         } else {
    //           this.$message({
    //             type: "error",
    //             message: res.msg
    //           });
    //         }
    //       });
    //     })
    //     .catch(() => { });
    // },
    // 删除
    remove(row) {
      const _this = this;
      _this
        .$confirm("确认删除该流程内容?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.customDeleteFlow({ pkId: row.pkId }).then(res => {
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
    // 新增
    addFlow() {
      const _this = this
      this.show1 = false;
     _this.unnamedType = "";
     _this.fkBidProjectIArr = []
      // this.expertSortData = []; 
      _this.form= {
        workflowName: "", // 流程名称
        fkEnginerringTypeId: "", // 工程类型
        fkProfessionalTypeId: "", // 专业类别
        workflowType: "", // 流程类别
        remark: "", // 流程备注
        fkOrgId: "",
        fkBidProjectId:"",
        fkProjectId:""
      };
    //  let datas1=  {
    //     workflowName: "", // 流程名称
    //     fkEnginerringTypeId: "", // 工程类型
    //     fkProfessionalTypeId: "", // 专业类别
    //     workflowType: "", // 流程类别
    //     remark: "", // 流程备注
    //     fkOrgId: "",
    //     fkBidProjectId:"",
    //     fkProjectId:""
    //   };
    //   _this.$set(_this.form, datas1);
    // //  _this.$set(_this.form, "fkEnginerringTypeId", "");
    // //  _this.$set(_this.form, "fkProfessionalTypeId", "");
    // //  _this.$set(_this.form, "workflowType", "");
    // //  _this.$set(_this.form, "remark", "");
    // //  _this.$set(_this.form, "fkOrgId", "");
    // //  _this.$set(_this.form, "fkBidProjectId", null);
    
      // this.form.fkProfessionalTypeId = "";
      this.radioStatus = false;
      this.marginNum = "70px 0";
      this.form.workflowType = this.tabPosition;
    
      for (let key in this.form) {
        // this.$set(this.form, key, "");
        console.log(key)
       }
      this.show1 = true;
      this.form.workflowName = "";
      this.nodeShow = false;
      this.addTitle = "新增流程";
      this.form.types = "";
      console.log("新增啊------------------------")
      console.log(this.form)
      console.log("新增啊------------------------")
      this.$nextTick(() => {

        this.form.fkProjectId = "";  
        this.form.fkBidProjectId = "";
        this.$refs.formDates.resetFields();
        _this.$set(_this.form, "workflowName", "");
        _this.$set(_this.form, "fkProjectId", "");
        _this.$set(_this.form, "fkBidProjectId", "");
        this.form.workflowType = this.tabPosition;
        // if (this.$refs.regPanl != undefined) {
          this.$refs.regPanl.intCreateNewDiagram();
          this.form.workflowType = this.tabPosition;
        // }
      });
    },
    // 配置分项工程
    apportion(row) {
      this.show2 = true;
      this.termQueryEPC(row.pkId, row.fkProfessionalTypeId, row.publishStatus, row.fkEnginerringTypeId);
      this.showDate = row;
      this.defaultKey = [];
      if (this.$refs.treeDefaultKey != undefined) {
        this.$refs.treeDefaultKey.setCheckedKeys([]);
      }

      row.items.forEach(item => {
        this.defaultKey.push(item.pkId);
      });
    },
    // // 发布流程
    // publish(row) {
    //   const _this = this;
    //   _this
    //     .$confirm("确认发布该流程?", "发布流程确认", {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     })
    //     .then(() => {
    //       this.$api.customStatus({ pkId: row.pkId, publishStatus: 1 }).then(res => {
    //         if (res.code == 200) {
    //           this.$message({
    //             type: "success",
    //             message: "发布流程成功"
    //           });
    //           this.pagingDisplay();
    //         } else {
    //           this.$message({
    //             type: "error",
    //             message: res.msg
    //           });
    //         }
    //       });
    //     })
    //     .catch(() => { });
    // },
    // 配置分项工程
    termQueryEPC(pkId, id, status, typeId) {
      const data = id == 0 ? typeId : id;
      this.$api.searchItemsByOrgId({ fkOrgId: this.listQuery.fkOrgId, workflowId: pkId }).then(res => {
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
        }
      });
    },
    // 获取pdf下拉列表
    customWorkflowPdf(id) {
      // 0获取技术规范，1获取安全规范，2获取验收标准
      this.$api
        .customWorkflowPdf({
          bookType: 0,
          fkProfessionalTypeId: this.form.fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.technologyDate = res.data;
          }
        });
      this.$api
        .customWorkflowPdf({
          bookType: 1,
          fkProfessionalTypeId: this.form.fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.safetyDate = res.data;
          }
        });
      this.$api
        .customWorkflowPdf({
          bookType: 2,
          fkProfessionalTypeId: this.form.fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.acceptanceLevel = res.data;
          }
        });
    },
    // // 引用编辑获取pdf下拉列表
    // customQuotePdfsByType(id) {
    //   // 0获取技术规范，1获取安全规范，2获取验收标准
    //   this.$api
    //     .customQuotePdfsByType({
    //       bookType: 0,
    //       fkNodeId: id,
    //       fkProfessionalTypeId: this.form.fkProfessionalTypeId
    //     })
    //     .then(res => {
    //       if (res.code == 200) {
    //         this.technologyDate = res.data;
    //       }
    //     });
    //   this.$api
    //     .customQuotePdfsByType({
    //       bookType: 1,
    //       fkNodeId: id,
    //       fkProfessionalTypeId: this.form.fkProfessionalTypeId
    //     })
    //     .then(res => {
    //       if (res.code == 200) {
    //         this.safetyDate = res.data;
    //       }
    //     });
    //   this.$api
    //     .customQuotePdfsByType({
    //       bookType: 2,
    //       fkNodeId: id,
    //       fkProfessionalTypeId: this.form.fkProfessionalTypeId
    //     })
    //     .then(res => {
    //       if (res.code == 200) {
    //         this.acceptanceLevel = res.data;
    //       }
    //     });
    // },
    // // 编辑获取pdf下拉列表
    // updateSearchPdfListByType(id) {
    //   // 0获取技术规范，1获取安全规范，2获取验收标准
    //   this.$api
    //     .updateSearchPdfListByType({
    //       bookType: 0,
    //       // fkNodeId: id,
    //       fkProfessionalTypeId: this.form.fkProfessionalTypeId
    //     })
    //     .then(res => {
    //       if (res.code == 200) {
    //         this.technologyDate = res.data;
    //       }
    //     });
    //   this.$api
    //     .updateSearchPdfListByType({
    //       bookType: 1,
    //       // fkNodeId: id,
    //       fkProfessionalTypeId: this.form.fkProfessionalTypeId
    //     })
    //     .then(res => {
    //       if (res.code == 200) {
    //         this.safetyDate = res.data;
    //       }
    //     });
    //   this.$api
    //     .updateSearchPdfListByType({
    //       bookType: 2,
    //       // fkNodeId: id,
    //       fkProfessionalTypeId: this.form.fkProfessionalTypeId
    //     })
    //     .then(res => {
    //       if (res.code == 200) {
    //         this.acceptanceLevel = res.data;
    //       }
    //     });
    // },
    // 引用编辑查询表格数据集
    // quoteSearchTableVos(id) {
    //   const data = {
    //     fkWorkflowNodeId: id,
    //     fkProfessionalTypeId: this.form.fkProfessionalTypeId
    //   };
    //   this.$api.quoteSearchTableVos(data).then(res => {
    //     if (res.code == 200) {
    //       this.relatedForm = res.data;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 编辑查询表格数据集
    // updateSearchTableVos(pkid, id) {
    //   const data = {
    //     fkWorkflowId: pkid,
    //     fkWorkflowNodeId: id,
    //     fkProfessionalTypeId: this.form.fkProfessionalTypeId
    //   };
    //   this.$api.updateSearchTableVos(data).then(res => {
    //     if (res.code == 200) {
    //       this.relatedForm = res.data;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 管理表格下拉
    searchTableVos(id) {
      // this.form.fkProfessionalTypeId
      // searchTableVos
      // fkProfessionalTypeId: id, dataTypeList: 3
      this.$api.searchTableVos({ fkProfessionalTypeId: id }).then(res => {
        if (res.code == 200) {
          this.relatedForm = res.data;
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
  background: #ccc;
  font-size: 16px;

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

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}

.violet {
  border: 2px dashed #c280ff !important;
}

.h-500 {
  height: 500px;
}
.search-mr {
  position: absolute;
  top: 28px;
  right: 50px;
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
    .left-table{
      line-height: 30px;
    padding-left: 10px;
      // background: #f2f2f2;
    }
    .left-table-set{
      background: #81d3f8;
    }
    // background: #81d3f8;
  }
}
</style>
