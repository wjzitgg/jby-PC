<template>
  <div class="app-container">
    <div class="pay-header">
      <el-tabs v-model="headerType" @tab-click="typeChange">
        <el-tab-pane label="验收工序与流程" name="1"></el-tab-pane>
        <el-tab-pane label="其他业务流程" name="2"></el-tab-pane>
      </el-tabs>
    </div>
    <div class="acceptance-header">
      <el-tabs v-model="typeWorkflowType" @tab-click="typeWorkflowTypeChange" v-if="headerType == '1'">
        <el-tab-pane label="生产验收流程" name="1"></el-tab-pane>
        <el-tab-pane label="生产验收工序" name="0"></el-tab-pane>
        <el-tab-pane label="最终质量验收工序" name="13"></el-tab-pane>
      </el-tabs>
      <el-tabs v-model="typeWorkflowType" @tab-click="typeWorkflowTypeChange" v-if="headerType == '2'">
        <el-tab-pane v-for="(item, index) in processType" :key="index" :label="item.name" :name="item.key"></el-tab-pane>
      </el-tabs>
    </div>
    <!-- <search-bar @search="search" :options="searchOptions" :total="totalCount" labelWidth="8em" ref="searchBar"
      :showHandler="false" @change="change"></search-bar> -->
    <div class="search-bar-box" style="position: relative">
      <!-- <span v-if="headerType != '1'">流程类型</span>
      <el-select v-if="headerType != '1'" v-model="listQuery.workflowType" placeholder="" size="mini" class="wh-150">
        <el-option v-for="(item ,index) in processType" :label="item.name" :value="item.key" :key="index"></el-option>
      </el-select> -->
      <span v-if="typeWorkflowType != '5'">工程大类</span>
      <el-select v-if="typeWorkflowType != '5'" v-model="listQuery.fkEnginerringTypeId" @change="projectTypeChang" clearable placeholder="工程大类" size="mini" class="wh-150">
        <el-option v-for="(item, index) in projectType" :label="item.label" :value="item.value" :key="index"></el-option>
      </el-select>
      <span v-if="headerType == '1'">专业类别</span>
      <el-select v-if="headerType == '1'" v-model="listQuery.fkProfessionalTypeId" clearable placeholder="专业类别" size="mini" class="wh-150">
        <el-option v-for="(item, index) in jorTypeList" :label="item.label" :value="item.value" :key="index"></el-option>
      </el-select>
      <span>{{ typeWorkflowType == 0 || typeWorkflowType == 13 ? "工序名称" : "流程名称" }}</span>
      <el-input v-model="listQuery.workflowName" placeholder="请输入流程名称" size="mini" class="wh-150" maxlength="50"></el-input>
      <span v-if="typeWorkflowType == '1'">关联分项</span>
      <el-input v-if="typeWorkflowType == '1'" maxlength="100" v-model="listQuery.keyWord" placeholder="请输入关联分项" size="mini" class="wh-150"></el-input>
      <span v-if="typeWorkflowType == '0' || typeWorkflowType == '13'">应用流程</span>
      <el-input v-if="typeWorkflowType == '0' || typeWorkflowType == '13'" v-model="listQuery.workflowTemplateName" placeholder="请输入应用流程" size="mini" class="wh-150"></el-input>
      <el-button type="primary" size="mini" icon="el-icon-search" class="ml-20 el-button-primary" @click="search">查询</el-button>
      <el-button type="primary" size="mini" class="search-mr el-button-primary" @click="addFlow" v-has="'system:process:add'" v-if="typeWorkflowType == '0' || (typeWorkflowType == '13' && headerType == '1')">新增工序</el-button>
      <el-button v-else type="primary" size="mini" class="search-mr el-button-primary" @click="addFlow" v-has="'system:process:add'">新增流程</el-button>
    </div>

    <div class="tab-container">
      <div class="table-data" :style="{ height: tableH, marginTop: '10px' }">
        <el-table ref="tables" :data="tableData" stripe height="90%" style="width: 100%" :key="typeWorkflowType" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="workflowName" :label="typeWorkflowType == 0 || typeWorkflowType == 13 ? '工序名称' : '流程名称'" min-width="130"></el-table-column>
          <!-- <el-table-column align="center" v-if="headerType == 2" prop="workflowTypeName" label="流程类型" min-width="90"></el-table-column> -->
          <el-table-column align="center" prop="enginerringTypeName" v-if="typeWorkflowType != '5'" label="工程大类" min-width="90"></el-table-column>
          <el-table-column align="center" prop="professionalTypeName" v-if="headerType == '1'" label="专业类别" min-width="90"></el-table-column>
          <el-table-column align="center" prop="completeItemName" v-if="typeWorkflowType == '1'" label="已配置分项工程" min-width="160" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="applicationName" v-if="typeWorkflowType == '0' || typeWorkflowType == '13'" label="已应用流程" min-width="160" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="approveOrgName" v-if="headerType == '2' && typeWorkflowType != 2 && typeWorkflowType != 3" label="可发起单位" min-width="160"></el-table-column>

          <el-table-column align="center" prop="statusName" label="发布状态" min-width="90" v-if="typeWorkflowType != '0' && typeWorkflowType != '13'">
            <template slot-scope="scope">
              <div class="status statuscg" v-if="scope.row.publishStatus == 1">已发布</div>
              <div class="status statuswfb" v-else>未发布</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="createTime" label="创建时间" min-width="120"></el-table-column>
          <el-table-column align="center" fixed="right" prop="alarmLevel" label="操作" min-width="440">
            <template slot-scope="scope">
              <el-button type="primary" plain v-has="'system:process:query'" size="mini" @click.native="examine(scope.row)">查看</el-button>
              <el-button v-if="scope.row.workflowType == '0' || scope.row.workflowType == '13'" type="success" plain size="mini" v-has="'system:process:set'" v-show="scope.row.publishStatus == 0" @click.native="designFlow(scope.row)">编辑工序</el-button>
              <el-button v-else type="success" plain size="mini" v-has="'system:process:set'" v-show="scope.row.publishStatus == 0" @click.native="designFlow(scope.row)">编辑流程</el-button>
              <el-button type="primary" plain size="mini" v-has="'system:process:itemEdit'" v-if="scope.row.workflowType == 1" @click.native="apportion(scope.row)">关联分项工程</el-button>
              <el-button type="success" plain size="mini" v-has="'system:process:release'" v-if="scope.row.publishStatus == 0 && scope.row.workflowType != 0 && scope.row.workflowType != 13" @click.native="publish(scope.row)">发布流程</el-button>
              <el-button type="warning" plain size="mini" v-has="'system:process:cancel'" v-if="scope.row.publishStatus == 1" @click.native="cancel(scope.row)">取消流程</el-button>
              <el-button type="danger" plain size="mini" v-has="'system:process:delete'" v-if="scope.row.publishStatus == 0" @click.native="remove(scope.row)">删除</el-button>
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
    <!-- 新建 设计流程弹窗 -->
    <el-dialog :title="addTitle" :visible.sync="show1" width="90%" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <!-- 流程属性 -->
      <el-form :model="form" :rules="rules" ref="formDate" style="padding: 12px 10px 0 0">
        <el-row>
          <el-col :span="4">
            <!-- 只有验收工序与流程显示 -->
            <el-form-item label="流程类型" prop="workflowType" :label-width="formLabelWidth" v-if="headerType == '2'">
              <el-select disabled style="width: 100%" placeholder="请选择" size="mini" v-model="form.workflowType" @change="workflowTypeChang">
                <el-option v-for="item in processType" :label="item.name" :value="item.key" :key="item.key"></el-option>
                <!-- <el-option label="生产验收流程" value="1"></el-option>
                <el-option label="业主计量审批" value="2"></el-option>
                <el-option label="分包单位结算审批" value="3"></el-option> -->
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="form.workflowType != 4 && form.workflowType != 6 && form.workflowType != 7 && form.workflowType != 5">
            <el-form-item label="工程大类" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" style="width: 100%" placeholder="请选择" size="mini" v-model="form.fkEnginerringTypeId" @change="typeIdChang">
                <el-option v-for="item in projectType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="form.workflowType != 2 && form.workflowType != 3 && form.workflowType != 4 && form.workflowType != 5 && form.workflowType != 6 && form.workflowType != 7">
            <el-form-item label="专业类别" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
              <el-select :disabled="(addTitle == '编辑流程' || addTitle == '查看流程') && form.fkProfessionalTypeId != 0" style="width: 100%" placeholder="请选择" size="mini" @change="typeIdChange" v-model="form.fkProfessionalTypeId">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- ========================================== -->
          <el-col :span="4" v-if="form.workflowType == 5">
            <el-form-item label="发起单位" prop="type" label-width="110px">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" @change="roleTypeChange" style="width: 100%" placeholder="请选择" size="mini" v-model="form.type">
                <el-option v-for="item in typeList" :key="item.key" :label="item.name" :value="item.key"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="4" v-if="form.workflowType == 5">
            <el-form-item label="盘点仓库类型" prop="types" label-width="110px">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" @change="warehouseTypeChange" style="width: 100%" placeholder="请选择" size="mini" v-model="form.types">
                <el-option v-for="item in typeList" :key="item.key" :label="item.name" :value="item.key"> </el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
          <!-- ========================================== -->
          <el-col :span="4">
            <el-form-item label="流程名称" prop="workflowName" :label-width="formLabelWidth">
              <el-input :disabled="addTitle == '查看流程'" v-model="form.workflowName" size="mini" autocomplete="off" maxlength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="流程备注" prop="remark" :label-width="formLabelWidth">
              <el-input :disabled="addTitle == '查看流程'" v-model="form.remark" size="mini" autocomplete="off" maxlength="100"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="width: 100%; border: 1px solid"></div>
      <!--流程图  -->
      <div v-if="form.workflowType != 1 && typeWorkflowType != 1 && show1">
        <panl-show style="width: 100%; height: 450px" ref="regPanl" :fkProfessionalTypeId="form.fkProfessionalTypeId" @pdfList="pdfList" :fkEnginerringTypeId="form.fkEnginerringTypeId" :workflowType="form.workflowType" :flowTableArr="flowTableArr" @ensureab="ensureab" :warehouseType="form.type" @launchInit="launchInit"></panl-show>
      </div>
      <!-- 生产验收流程 -->
      <!-- <div class="productionApproval" style="height: 450px" v-if="form.workflowType == 1">
        <div class="left" id="left" style="height: 450px" v-show="addTitle != '查看流程'">
          <div class="header-query" id="header-query">
            <div style="background-color: #ccc; margin: 0 auto; text-align: center; padding: 5px" @click="link">生产施工工序</div>
            <el-input size="mini" v-model="workflowNameLike" style="margin-top: 6px">
              <i class="el-icon-search el-input__icon" slot="suffix" @click="workflowNameLikeQuery"></i>
            </el-input>
          </div>
          <div style="margin: 70px 0">
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
              <div class="box" style="position: relative;display:flex;height: 200px; justify-content: center;align-items: center;">
                  <div class="kaishi" style="margin:0" ></div>
                  <div style="width: 100px;height: 72px;border:1px;border: 1px solid;margin:0;margin-left:30px;position: relative;border-radius: 5px;padding-top: 10px;">
                    <i class="el-icon-right" style="    position: absolute; top: 18px;left: -30px;font-size: 30px;"></i>
                    <div><i class="el-icon-user-solid"></i>项目部</div>
                    <div>暂ccc</div>
                  </div>
                  <div style="width: 100px;height: 73px;border:1px;border: 1px solid;margin:0;margin-left:30px;position: relative;border-radius: 5px;">
                    <i class="el-icon-right" style="    position: absolute; top: 18px;left: -30px;font-size: 30px;"></i>
                  </div>
                  <div style="width: 100px;height: 73px;border:1px;border: 1px solid;margin:0;margin-left:30px;position: relative;border-radius: 5px;">
                    <i class="el-icon-right" style="    position: absolute; top: 18px;left: -30px;font-size: 30px;"></i>
                  </div>
                  <div class="kaishi" style="display: inline-block;background-color:#ccc;margin:0;margin-left:30px;position: relative">
                    <i class="el-icon-right" style="    position: absolute; top: -5px;left: -30px;font-size: 30px;"></i>
                  </div>
              </div>
              <span class="bpmShowxshou">{{ item.workflowName }}</span>
              <div style="position: absolute; right: 8px; top: 8px; z-index: 1000">
                <el-button v-if="index != pitchOnDate.length - 1 && addTitle != '查看流程' && pitchOnDate[index + 1].workflowType != 13" class="bpmShowxshouButm" @click.stop="itemDown(pitchOnDate, index)" type="primary" icon="el-icon-bottom" size="mini" circle></el-button>
                <el-button class="bpmShowxshouButm" v-if="index != 0 && addTitle != '查看流程' && pitchOnDate[index].workflowType != 13" @click.stop="itemUpward(pitchOnDate, index)" type="primary" icon="el-icon-top" size="mini" circle></el-button>
                <el-button class="bpmShowxshouButm" v-if="addTitle != '查看流程'" @click.stop="itemDelete(item, index)" type="danger" icon="el-icon-delete" size="mini" circle></el-button>
                <el-button class="bpmShowxshouButm" v-if="addTitle != '查看流程' && addTitle != '新增流程'" @click.stop="editSeed(pitchOnDate, index)" size="mini" type="primary" icon="el-icon-edit" circle></el-button>
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
                  <el-input clearable :disabled="addTitle == '查看流程'" size="mini" type="number" @change="jsThePageChang" oninput="value=value.replace(/[^\d.]/g,'')" v-model="fieldListform.jsThePage" />
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
              <div class="panleTitle"><i class="el-icon-s-order"></i> 动态表格设置</div>
              <el-form-item prop="date1" style="max-height: 100px; overflow: auto; border-top: 1px solid; border-bottom: 1px solid; padding-left: 2px">
                <el-row v-for="(item, index) in fieldListform.tableIds" :key="index" style="margin: 4px 0px">
                  <el-col :span="20">
                    <el-select :disabled="addTitle == '查看流程'" style="width: 100%" filterable v-model="item.fkTableId" @change="tableIdsChange" placeholder="请选择" size="mini">
                      <el-tooltip v-for="i in relatedForm" :key="i.pkId" class="item" effect="dark" :content="i.tableName" placement="left-start">
                        <el-option style="width: 200px" :disabled="fieldListform.tableIds.find(s => s.fkTableId === i.pkId) == undefined ? false : true" :value="i.pkId" :label="i.tableName"></el-option>
                      </el-tooltip>
                    </el-select>
                  </el-col>
                  <el-col :span="4" style="line-height: 28px; padding-left: 2px" v-if="addTitle != '查看流程'">
                    <i class="el-icon-circle-plus-outline" style="color: #2680f0; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index == 0" @click="tableIdsAdd"></i>
                    <i class="el-icon-remove-outline" style="color: red; font-weight: 800; font-size: 18px; vertical-align: bottom" v-if="index != 0" @click="tableIdsShiftOut(index)"></i>
                  </el-col>
                </el-row>
              </el-form-item>
              <div>工序所有人可查看以下内容：</div>
              <div style="margin: 6px">
                <el-checkbox v-model="fieldListform.quantitiesTable" :disabled="addTitle == '查看流程'" v-if="fieldListform.workflowType == 0" @change="quantitiesTableChange">工程量</el-checkbox>
                <el-checkbox v-model="fieldListform.materialUsedTable" :disabled="addTitle == '查看流程'" v-if="fieldListform.workflowType == 0" @change="materialUsedTableChange">材料用量</el-checkbox>
                <el-checkbox v-model="fieldListform.scoreFlag" :disabled="addTitle == '查看流程'" v-if="fieldListform.workflowType == 13" @change="scoreFlagChange">工程评分</el-checkbox>
              </div>
            </el-form>
          </div>
        </div>
      </div> -->
      <productionApproval v-if="form.workflowType == 1 && show1" :addTitle="addTitle" ref="productionApproval" :fessionalTypeId="this.form.fkProfessionalTypeId" :workflowType="form.workflowType" :editStatus="editStatus"></productionApproval>
      <div style="width: 100%; height: 1px; background: #000"></div>
      <div slot="footer" class="dialog-footer" v-show="showType != 4">
        <el-button size="mini" @click="show1 = false">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="addFlowSubmit('formDate')" v-show="addTitle != '查看流程'">保 存</el-button>
      </div>
    </el-dialog>
    <!-- /配置分项工程弹窗/ -->
    <el-dialog title="配置分项工程" width="520px" :visible.sync="show2" v-dialogDrag :close-on-press-escape="false" :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <el-input placeholder="输入关键字进行过滤" size="mini" class="wh-260" v-model="filterText"></el-input>
        <el-tree @node-expand="nodeExpand" style="height: 400px; overflow: auto" :data="subentryData" ref="treeDefaultKey" show-checkbox node-key="pkId" :default-checked-keys="defaultKey" :filter-node-method="filterNode" :props="defaultProps" @check-change="setCheckedNodes" :default-expand-all="true">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span style="position: relative;" :class="{ treeColor: !!data.invalidFlag }">{{ node.label }}</span>
            <i class="el-icon-paperclip" style="color:'#0c457a'" v-if="(data.fkWorkflowTemplateId != undefined && data.fkWorkflowTemplateId != null && data.fkWorkflowTemplateId != '') || data.disabled"></i>
            <div class="reminder">已关联其他流程</div>
          </span>
        </el-tree>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="show2 = false">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="ensure">保 存</el-button>
      </div>
    </el-dialog>
    <!-- /查看流程弹窗/ -->
    <el-dialog :title="addTitle" :visible.sync="show3" width="90%" v-dialogDrag :close-on-press-escape="false" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="form" style="padding: 12px 10px 0 0">
        <el-row>
          <el-col :span="4">
            <el-form-item label="流程类型" prop="workflowType" :label-width="formLabelWidth">
              <el-select disabled style="width: 100%" placeholder="请选择" size="mini" v-model="form.workflowType">
                <el-option label="生产验收工序" value="0"></el-option>
                <el-option label="最终质量验收工序" value="13"></el-option>
                <el-option v-for="item in processType" :label="item.name" :value="item.key" :key="item.key"></el-option>
                <!-- <el-option label="生产验收工序" value="0"></el-option>
                <el-option label="生产验收流程" value="1"></el-option>
                <el-option label="业主计量审批" value="2"></el-option>
                <el-option label="分包单位结算审批" value="3"></el-option> -->
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="form.workflowType != 4 && form.workflowType != 6 && form.workflowType != 7 && form.workflowType != 5">
            <el-form-item label="工程大类" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
              <el-select disabled style="width: 100%" placeholder="请选择" size="mini" v-model="form.fkEnginerringTypeId">
                <el-option v-for="item in projectType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="form.workflowType != 2 && form.workflowType != 3 && form.workflowType != 4 && form.workflowType != 5 && form.workflowType != 6 && form.workflowType != 7">
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
          <el-col :span="4" v-if="form.workflowType == 5">
            <el-form-item label="发起角色类型" prop="type" label-width="110px">
              <el-select disabled style="width: 100%" placeholder="请选择" size="mini" v-model="form.type">
                <!-- <el-option v-for="item in typeList" :key="item.key" :label="item.name" :value="item.key"> -->
                <el-option v-for="item in typeList" :key="item.key" :label="item.name" :value="item.key"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="4" v-if="form.workflowType == 5">
            <el-form-item label="盘点仓库类型" prop="types" label-width="110px">
              <el-select disabled style="width: 100%" placeholder="请选择" size="mini" v-model="form.types">
                <el-option v-for="item in typeList" :key="item.key" :label="item.name" :value="item.key"> </el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="8">
            <el-form-item label="流程备注" prop="remark" :label-width="formLabelWidth">
              <el-input disabled v-model="form.remark" size="mini" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="width: 100%; border: 1px solid"></div>
      <div class="examineBpmn">
        <examine-bpmn style="width: 100%; height: 500px" :workflowType="form.workflowType" ref="examineBpmn" :XmlStr="XmlStr" @ensureab="ensureab" :flowTableArr="flowTableArr" :roleType="roleType" :dataList="form" :warehouseType="warehouseType"></examine-bpmn>
      </div>
    </el-dialog>
    <!-- 新建 修改子流程 -->
    <el-dialog :title="addTitle" :visible.sync="show4" width="90%" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <!-- 流程属性 -->
      <el-form :model="subflowForm" :rules="rules" ref="formDateS" style="padding: 12px 10px 0 0">
        <el-row>
          <el-col :span="4">
            <el-form-item label="流程类型" prop="workflowType" :label-width="formLabelWidth">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" style="width: 100%" placeholder="请选择" size="mini" v-model="subflowForm.workflowType" @change="workflowTypeChang">
                <el-option v-for="item in processType" :label="item.name" :value="item.key" :key="item.key"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="工程大类" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
              <el-select :disabled="addTitle == '编辑流程' || addTitle == '查看流程'" style="width: 100%" placeholder="请选择" size="mini" v-model="subflowForm.fkEnginerringTypeId" @change="typeIdChang">
                <el-option v-for="item in projectType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="subflowForm.workflowType != 2 && subflowForm.workflowType != 3">
            <el-form-item label="专业类别" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
              <el-select :disabled="(addTitle == '编辑流程' || addTitle == '查看流程') && subflowForm.fkProfessionalTypeId != 0" style="width: 100%" placeholder="请选择" size="mini" @change="typeIdChange" v-model="subflowForm.fkProfessionalTypeId">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- ========================================== -->
          <el-col :span="4" v-if="subflowForm.workflowType == 4">
            <el-form-item label="发起角色类型" prop="type" :label-width="formLabelWidth">
              <el-select :disabled="(addTitle == '编辑流程' || addTitle == '查看流程') && subflowForm.fkProfessionalTypeId != 0" style="width: 100%" placeholder="请选择" size="mini" v-model="subflowForm.type">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" v-if="subflowForm.workflowType == 5">
            <el-form-item label="盘点仓库类型" prop="types" :label-width="formLabelWidth">
              <el-select :disabled="(addTitle == '编辑流程' || addTitle == '查看流程') && subflowForm.fkProfessionalTypeId != 0" style="width: 100%" placeholder="请选择" size="mini" v-model="subflowForm.types">
                <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- ========================================== -->
          <el-col :span="4">
            <el-form-item label="流程名称" prop="workflowName" :label-width="formLabelWidth">
              <el-input :disabled="addTitle == '查看流程'" v-model="subflowForm.workflowName" size="mini" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="流程备注" prop="remark" :label-width="formLabelWidth">
              <el-input :disabled="addTitle == '查看流程'" v-model="subflowForm.remark" size="mini" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div style="width: 100%; border: 1px solid"></div>
      <!--流程图  -->
      <div>
        <panl-show :fkProfessionalTypeId="subflowForm.fkProfessionalTypeId" :fkEnginerringTypeId="subflowForm.fkEnginerringTypeId" :workflowType="subflowForm.workflowType" style="width: 100%; height: 450px" ref="seedRegPanl" @seedEnsureab="seedEnsureab" :flowTableArr="flowTableArr"></panl-show>
      </div>
      <div style="width: 100%; height: 1px; background: #000"></div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="show4 = false">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="seedSubmit('formDateS')">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import panlShow from "../../components/basic.vue";
import examineBpmn from "./../../components/examineBpmn.vue";
import bpmShow from "./../../components/bpmShow.vue";
import productionApproval from "../../components/acceptanceProcess.vue";
// import productionApproval from "@/components/acceptanceProcess"
export default {
  components: {
    panlShow,
    examineBpmn,
    bpmShow,
    productionApproval
  },
  name: "processLine",
  data() {
    return {
      tableH: "79%",
      // searchOptions: [
      //   {
      //     type: "select",
      //     prop: "workflowType",
      //     value: "",
      //     title: "流程类型",
      //     placeholder: "流程类型",
      //     options: [
      //       { label: "生产验收工序", value: 0 },
      //       { label: "生产验收流程", value: 1 },
      //       { label: "业主计量审批", value: 2 },
      //       { label: "分包单位结算审批", value: 3 }
      //     ],
      //     disabled: false,
      //     clearable: false
      //   },
      //   {
      //     type: "select",
      //     prop: "fkEnginerringTypeId",
      //     value: "",
      //     title: "工程大类",
      //     placeholder: "工程大类",
      //     options: [],
      //     disabled: false
      //   },
      //   {
      //     type: "select",
      //     prop: "fkProfessionalTypeId",
      //     value: "",
      //     title: "专业类别",
      //     placeholder: "专业类别",
      //     options: [],
      //     disabled: false
      //   },
      //   {
      //     type: "input",
      //     prop: "workflowName",
      //     value: "",
      //     title: "流程名称",
      //     placeholder: "流程名称",
      //     disabled: false
      //   },
      //   {
      //     type: "input",
      //     prop: "keyWord",
      //     value: "",
      //     title: "关联分项",
      //     placeholder: "关联分项",
      //     disabled: false
      //   }
      // ],
      totalCount: 0,
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        workflowType: "",
        fkEnginerringTypeId: "",
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
        workflowName: "", // 流程名称
        fkEnginerringTypeId: "", // 工程类型
        fkProfessionalTypeId: "", // 专业类别
        workflowType: "", // 流程类别
        remark: "", // 流程备注
        type: "",
        types: ""
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
        type: [
          {
            required: true,
            message: "发起角色类型",
            trigger: ["change", "blur"]
          }
        ],
        types: [
          {
            required: true,
            message: "盘点仓库类型",
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
        remark: "", // 流程备注
        type: "",
        types: ""
      },
      seedDate: {},
      selectOptionWidth: "",
      filterText: "",
      processType: [],
      typeList: [],
      flowTableArr: [],
      workflowNameLike: "",
      fessionalTypeId: "",
      roleType: "",
      warehouseType: "",
      bpmnContentStatus: false,
      headerType: "1",
      typeWorkflowType: "1",
      jorTypeList: [],
      pdfListData: [],
      editStatus: true,
      launchType: "",
      fkRoleId: ""
    };
  },
  mounted() {
    this.searchTypeList();
    this.workTypeQuery();
    this.search();
  },
  watch: {
    filterText(val) {
      this.$refs.treeDefaultKey.filter(val);
    }
  },
  methods: {
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
    typeChange(item) {
      this.headerType = item.name;
      console.log(item);
      // typeWorkflowType
      if (this.headerType == "1") {
        this.typeWorkflowType = "1";
        this.tableH = "79%";
      } else {
        this.typeWorkflowType = this.processType[0].key;
        // this.tableH ="84%";
        // this.listQuery.workflowType = this.processType[0].key
      }
      // headerType
      this.listQuery.fkEnginerringTypeId = "";
      this.listQuery.fkProfessionalTypeId = "";
      this.listQuery.workflowName = "";
      this.listQuery.keyWord = "";
      this.listQuery.workflowTemplateName = "";
      this.jorTypeList = [];
      this.search();
    },
    typeWorkflowTypeChange() {
      this.listQuery.fkEnginerringTypeId = "";
      this.listQuery.fkProfessionalTypeId = "";
      this.listQuery.workflowName = "";
      this.listQuery.keyWord = "";
      this.listQuery.workflowTemplateName = "";
      this.jorTypeList = [];
      this.search();
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
    link() {
      let target = document.getElementById("mao-dian");
      let parent = document.getElementById("left");
      parent.scrollTop = target.offsetTop - parent.offsetTop;
    },
    roleTypeChange(val) {
      this.roleType = val;
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
    workTypeQuery() {
      this.$api.workTypeQuery().then(res => {
        if (res.code == 200) {
          // res.data.forEach(item => {
          //   item.label = item.name;
          //   item.value = item.key;
          // });
          // this.searchOptions[0].options = res.data;
          // this.$refs.searchBar.workflowType(res.data[0].key);
          // this.listQuery.workflowType = res.data[0].key;
          // this.pagingDisplay();
          this.processType = res.data;
        }
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.itemName.indexOf(value) !== -1;
    },
    setOptionWidth(event) {
      // 下拉框弹出时，设置弹框的宽度
      this.$nextTick(() => {
        this.selectOptionWidth = event.srcElement.offsetWidth + "px";
      });
    },
    editSeed(row, idx) {
      this.addTitle = "编辑流程";
      this.loading = true;

      this.$api
        .findWorkflowTemplateById({ pkId: row[idx].pkId })
        .then(res => {
          if (res.code == 200) {
            res.data.workflowType = res.data.workflowType.toString();
            this.subflowForm = res.data;
            this.show4 = true;
            this.$nextTick(() => {
              this.$refs.seedRegPanl.exportDiagram(res.data.bpmnContent, this.addTitle);
            });
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
    seedEnsureab(a, b) {
      const _this = this;
      const workflowNodes = [];
      let endEventStatus = false;
      let startEventStatus = false;
      this.loading = true;
      a.businessObject.flowElements.forEach(item => {
        if (item.$type == "bpmn:UserTask") {
          workflowNodes.push({
            fkRoleId: item.$attrs.fkRoleId,
            name: item.name,
            nodeApproveType: item.$attrs.nodeApproveType,
            tableIds: item.$attrs.tableIds,
            nodeType: 2,
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
      b.saveXML({ format: true }, (err, xml) => {
        let str = xml.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
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
        data.workflowNodes.forEach(item => {
          if (item.tableIds) {
            if (item.tableIds instanceof Array) {
            } else {
              item.tableIds = item.tableIds.split(",");
            }
          }
        });

        this.$api
          .baseWorkflowUpdate(data)
          .then(res => {
            if (res.code == 200) {
              this.loading = false;
              this.$message({
                type: "success",
                message: "编辑成功"
              });
              this.bpmnContentStatus = true;
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
              // this.bpmnContentStatus = false
              // _this.designFlow(this.seedDate);
              // _this.show4 = false;
              this.$nextTick(() => {
                _this.bpmnContentStatus = false;
                _this.show4 = false;
              });
              _this.pagingDisplay();
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
    searchMajorTypeList(id, typeId) {
      this.$api.searchMajorTypeList({ typeId: id }).then(res => {
        if (res.code == 200) {
          // let typeIdStatus = false;
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
            // if (item.pkId == typeId) {
            //   typeIdStatus = true;
            // }
          });
          this.jorTypeList = res.data;
          // this.searchOptions[2].options = res.data;
          // if (typeIdStatus == false) {
          //   this.$refs.searchBar.fkProfessionalTypeId();
          // }
        }
      });
    },
    // change(val, val1) {
    //   // searchOptions
    //   if (val.workflowType == 2 || val.workflowType == 3 || val.workflowType == 5) {
    //     this.searchOptions[1].disabled = false;
    //     this.searchOptions[2].disabled = true;
    //     this.$refs.searchBar.fkProfessionalTypeId();
    //   } else if (val.workflowType == 4 || val.workflowType == 6 || val.workflowType == 7) {
    //     this.searchOptions[1].disabled = true;
    //     this.searchOptions[2].disabled = true;
    //     this.$refs.searchBar.fkEnginerringTypeId();
    //   } else {
    //     this.searchOptions[1].disabled = false;
    //     this.searchOptions[2].disabled = false;
    //   }
    //   if (val.fkEnginerringTypeId != "") {
    //     this.searchMajorTypeList(val.fkEnginerringTypeId, val.fkProfessionalTypeId);
    //   } else {
    //     this.searchOptions[2].options = [];
    //     this.$refs.searchBar.fkProfessionalTypeId();
    //   }
    // },
    projectTypeChang(val) {
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      console.log(val);
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      this.listQuery.fkProfessionalTypeId = "";
      if (val) {
        this.searchMajorTypeList(val);
      } else {
        this.jorTypeList = [];
      }
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
      console.log("1111111");
      if (this.fieldListform.technology == "" || this.fieldListform.technology == null) {
        this.fieldListform.jsThePage = "";
        return this.$message({
          type: "error",
          message: "请先选择技术规范"
        });
      }
      if (this.fieldListform.jsThePage == 0 || this.fieldListform.jsThePage == "") {
        this.fieldListform.jsThePage = "";
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
        // fieldListform.aqThePage
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
      //  safety: "", //安全
      //     aqThePage: null, //安全开始页
      //     aqToPage: null, //安全结束页
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
      //  standard: "", //验收
      // ysThePage: null, //验收开始页
      // ysToPage: null, //验收结束页
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
      // this.pitchOnDate.forEach(item => {
      //   if (item.pkId == this.fieldListform.pkId) {
      //     item.tableDTOS = val;
      //   }
      // });
      this.pitchOnDate.forEach(item => {
        if (item.pkId == this.fieldListform.pkId) {
          item.tableDTOS = this.fieldListform.tableIds;
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
    getWorkflowType(val) {
      this.$api.getWorkflowType({ type: val }).then(res => {
        if (res.code == 200) {
          this.typeList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    workflowTypeChang(val) {
      console.log("xxxxxxxxxxxxxxxxxxx");
      console.log(val);
      if (val == 1) {
        this.workflowNameLike = "";
      }
      console.log("xxxxxxxxxxxxxxxxxxx");
      if (val == 4 || val == 5) {
        this.subflowForm.type = "";
        this.form.type = "";
        this.form.types = "";
        this.getWorkflowType(val);
      }
      if (this.form.fkProfessionalTypeId != "") {
        this.pitchOnDate = [];
        this.workflowTypeChange(this.form.fkProfessionalTypeId, this.form.fkEnginerringTypeId);
        // this.searchTableVosList(this.form.fkProfessionalTypeId);
      } else {
        this.productionApproval = [];
        this.pitchOnDate = [];
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
    },
    typeIdChang(val) {
      this.form.fkProfessionalTypeId = "";
      this.typeIdChangTypeList(val);
      if (this.form.workflowType == 1) {
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
      }
    },
    typeIdChange() {
      // this.quotePdfListByType();
      if (this.form.workflowType == 1) {
        this.pitchOnDate = [];
        this.workflowTypeChange(this.form.fkProfessionalTypeId, this.form.fkEnginerringTypeId);
        // this.searchTableVosList(this.form.fkProfessionalTypeId);
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
      }
    },
    typeIdChangTypeList(id) {
      this.$api.searchMajorTypeList({ typeId: id }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
          });
          this.expertSortData = res.data;
        }
      });
    },
    // 子流程点击
    bpmShowClick(row) {
      console.log("============================");
      console.log(row);
      console.log("============================");
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
      this.fieldListform.tableIds = [];
      // debugger
      if (row.tableDTOS != undefined && row.tableDTOS.length != 0) {
        if (this.addTitle == "新增流程") {
          console.log("********************");
          console.log(row.tableDTOS);
          console.log("********************");
          this.fieldListform.tableIds = row.tableDTOS;
        } else {
          if (row.tableDTOS[0].fkTableId != undefined) {
            row.tableDTOS.forEach(item => {
              this.fieldListform.tableIds.push({ fkTableId: item.fkTableId, isArchives: 1, tableSource: "1" });
            });
          } else {
            // this.fieldListform.tableIds = row.tableDTOS;
            this.fieldListform.tableIds = [{ fkTableId: "", isArchives: 1, tableSource: "1" }];
          }
        }
      } else {
        this.fieldListform.tableIds = [{ fkTableId: "", isArchives: 1, tableSource: "1" }];
      }
      console.log("=========222==========");
      console.log(row.tableDTOS);
      console.log(this.fieldListform.tableIds);
      console.log("=========222===========");
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
      console.log("+++++++++++++++++++++");
      console.log(this.fieldListform.tableIds);
      console.log("+++++++++++++++++++++");
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
    },

    /// /绑定事件

    // 选择子流程
    itemClick(item) {
      item.fkWorkflowId = item.pkId;
      if (item.isActive == false) {
        let status = false;
        this.pitchOnDate.forEach(item => {
          if (item.workflowType == 13) {
            status = true;
          }
        });
        if (status && item.workflowType == 13) {
          return this.$message.warning("已存在生产验收工序 ,生产验收流程只能存在一条生产验收工序");
        }
        this.$api.workflowById({ pkIds: item.pkId }).then(res => {
          if (res.code == 200) {
            item.isActive = true;
            // if(res.data[0].workflowType == 13){

            // }
            if (status) {
              let arr = [];
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
      // if (index >= arr.length - 1) return arr;
      // arr[index] = arr.splice(index + 1, 1, arr[index])[0];
      // return arr;
    },
    // 向上
    itemUpward(arr, index) {
      if (index < 1) return this.pitchOnDate;
      this.pitchOnDate[index] = this.pitchOnDate.splice(index - 1, 1, this.pitchOnDate[index])[0];
      this.pitchOnDate.forEach((item, idx) => {
        this.$refs.bpmShow[idx].flushBpmn(item.bpmnContent);
      });
      // if (index < 1) return arr;
      // arr[index] = arr.splice(index - 1, 1, arr[index])[0];
      // return arr;
    },
    // 获取左侧列表
    workflowTypeChange(val, id) {
      const data = val == 0 ? id : val;
      // if(val == 0){
      //   data = id
      // }
      this.fessionalTypeId = data;
      this.$api.searchWorkflowTemplateList({ fessionalTypeId: data }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.isActive = false;
          });
          this.productionApproval = res.data;
        }
      });
    },
    workflowNameLikeQuery() {
      this.$api.searchWorkflowTemplateList({ fessionalTypeId: this.form.fkProfessionalTypeId, workflowNameLike: this.workflowNameLike }).then(res => {
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
        items: this.defaultKey.toString()
      };
      this.loading = true;
      this.$api
        .configurationItem(data)
        .then(res => {
          this.loading = false;
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
        })
        .catch(err => {
          this.loading = false;
        });
    },

    ensureab(a, b, tableIds) {
      const _this = this;
      const workflowNodes = [];
      let endEventStatus = false;
      let startEventStatus = false;
      if (a.businessObject.flowElements == undefined) {
        return this.$message.warning("还未绘制流程图");
      }
      // return console.log(tableIds)
      this.loading = true;
      // return console.log( a.businessObject.flowElements)

      a.businessObject.flowElements.forEach(item => {
        if (item.$type == "bpmn:UserTask") {
          // console.log(item)
          // debugger
          // item.$attrs.tableIds
          const workflowNodeTables = [];
          if (!item.$attrs.tableIds || item.$attrs.tableIds == "null" || item.$attrs.tableIds == undefined || item.$attrs.tableIds == "undefined" || item.$attrs.tableIds.length == 0) {
          } else {
            if (typeof item.$attrs.tableIds == "string") {
              item.$attrs.tableIds = item.$attrs.tableIds.split(",");
            }
            if (typeof item.$attrs.archives == "string") {
              item.$attrs.archives = item.$attrs.archives.split(",");
            }
            item.$attrs.tableIds.forEach((e, index) => {
              if (!isNaN(e - 0) && e.length != 0) {
                workflowNodeTables.push(e);
              }
            });
          }
          workflowNodes.push({
            fkRoleId: item.$attrs.fkRoleId,
            name: item.name,
            nodeApproveType: item.$attrs.nodeApproveType,
            tableIds: workflowNodeTables,
            nodeType: 2,
            nodeMark: item.id,
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
        // let str = xml.replaceAll('name="undefined"', "");
        // str = str.replaceAll('name="null"', "");
        let str = xml.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="undefined"', "");
        str = str.replace('name="null"', "");
        str = str.replace('name="null"', "");
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

        const data = {
          bpmnContent: str,
          fkEnginerringTypeId: _this.form.fkEnginerringTypeId,
          workflowName: _this.form.workflowName,
          workflowType: _this.form.workflowType,
          remark: _this.form.remark,
          fkProfessionalTypeId: _this.form.fkProfessionalTypeId,
          workflowNodes,
          type: _this.form.type
        };
        // tableIds
        // pdfList this.pdfListData
        // data.launchType = "0"
        // data.fkRoleId = ""
        if (data.workflowType == 0 || data.workflowType == 13) {
          data.pdfIdList = this.pdfListData;
        } else {
          data.launchType = this.launchType;
          if (data.launchType == 1) {
            data.fkRoleId = this.fkRoleId;
            if (!data.fkRoleId) {
              this.loading = false;
              return this.$message.warning("请选择指定岗位角色");
            }
          }
        }

        let tableArr = [];
        if (tableIds.length != 0) {
          tableIds.forEach(item => {
            if (item.tableId != "") {
              tableArr.push(item.tableId);
            }
          });
          data.tableIds = tableArr;
        }
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
        if (this.addTitle == "新增流程") {
          this.$api
            .addFlow(data)
            .then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.$message({
                  type: "success",
                  message: "新增成功"
                });
                _this.show1 = false;
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
          data.workflowNodes.forEach(item => {
            if (item.tableIds) {
              if (item.tableIds instanceof Array) {
              } else {
                item.tableIds = item.tableIds.split(",");
              }
            }
          });
          this.$api
            .baseWorkflowUpdate(data)
            .then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.$message({
                  type: "success",
                  message: "编辑成功"
                });
                _this.show1 = false;
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
            this.pitchOnDate = this.$refs.productionApproval.pitchOnDate;
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
              // console.log(item);
              //  let arr4 = [];
              //  if (item.tableIds!= null ){
              //   item.tableIds =[]
              //  }
              // if (item.tableDTOS!=null) {
              //   item.tableDTOS.forEach(i => {
              //     arr4.push(i.pkId);

              //   });
              //   console.log("xxxxxxxxxxxxxxxxxx")
              //     console.log(item.tableDTOS)

              //     console.log("xxxxxxxxxxxxxxxxxx")
              // // }else{
              // //   arr4 = item.tableDTOS
              // //   console.log("============")
              // //     console.log(arr4)
              // //     console.log("=========")
              // // }
              // // return
              // if(item.tableDTOS != null){
              //   let tableArr = []
              //   item.tableDTOS.forEach(s=>{
              //     tableArr.push(s.pkId)
              //     console.log("s.pkIds.pkIds.pkIds.pkIds.pkIds.pkId")
              //     console.log(item.tableDTOS)
              //     console.log("s.pkIds.pkIds.pkIds.pkIds.pkIds.pkId")
              //   })
              //   item.tableDTOS = tableArr
              // }
              let tableIdArr = [];
              if (item.tableDTOS != undefined && item.tableDTOS != null && item.tableDTOS.length != 0) {
                item.tableDTOS.forEach(i => {
                  tableIdArr.push(i.fkTableId);
                });
              }
              arr.push({
                name: item.workflowName,
                nodeType: 3,
                sortval: idx + 1,
                fkWorkflowId: this.addTitle == "编辑流程" ? item.fkWorkflowId : item.pkId,
                materialUsedTable: item.materialUsedTable,
                quantitiesTable: item.quantitiesTable,
                scoreFlag: item.scoreFlag,
                tableIds: tableIdArr,
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
              workflowNodes: arr
            };
            data.tableIds = this.$refs.productionApproval.tableIds.filter(item => item.fkTableId).map(item => item.fkTableId);
            data.launchType = this.$refs.productionApproval.launchType;
            if (data.launchType == 1) {
              data.fkRoleId = this.$refs.productionApproval.fkRoleId;
              if (!data.fkRoleId) {
                return this.$message.warning("请选择指定岗位角色");
              }
            }
            // productionApproval
            // workflowNodesthis.pitchOnDate[0].bpmnContent,
            if (this.addTitle == "新增流程") {
              this.$api
                .addFlow(data)
                .then(res => {
                  if (res.code == 200) {
                    this.loading = false;
                    this.$message({
                      type: "success",
                      message: "新增成功"
                    });
                    _this.show1 = false;
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
              // let tableIdsArr = [];
              // const arr = [{ nodeType: 0, sortval: 0 }];
              // this.pitchOnDate.forEach((item, idx) => {
              //   tableIdsArr = [];
              //   if (item.tableDTOS == null) {
              //     tableIdsArr = [];
              //   } else {
              //     if (item.tableDTOS.length == 0) {
              //       return;
              //     }
              //     if (item.tableDTOS[0].fkTableId != undefined) {
              //       item.tableDTOS.forEach(i => {
              //         tableIdsArr.push(i.fkTableId);
              //       });
              //     } else {
              //       tableIdsArr = item.tableDTOS;
              //     }
              //   }
              //   arr.push({
              //     name: item.workflowName,
              //     nodeType: 3,
              //     sortval: idx + 1,
              //     fkWorkflowId: item.fkWorkflowId,
              //     materialUsedTable: 1,
              //     quantitiesTable: 1,
              //     scoreFlag: 1,
              //     tableIds: tableIdsArr,
              //     pdfIdList: item.bookPdfDTOS
              //   });
              // });
              // console.log(arr)
              // subentryData
              // arr.push({ nodeType: 1, sortval: arr.length });
              // const data = {
              //   bpmnContent: this.pitchOnDate[0].bpmnContent,
              //   fkEnginerringTypeId: _this.form.fkEnginerringTypeId,
              //   workflowName: _this.form.workflowName,
              //   workflowType: _this.form.workflowType,
              //   fkProfessionalTypeId: _this.form.fkProfessionalTypeId,
              //   remark: _this.form.remark,
              //   workflowNodes: arr,
              //   pkId: _this.form.pkId
              // };
              data.pkId = _this.form.pkId;
              data.bpmnContent = _this.form.bpmnContent;

              let data1 = JSON.stringify(data);
              data1 = JSON.parse(data1);
              data.workflowNodes.forEach((item, idx) => {
                if (idx != 0 && idx != data.workflowNodes.length - 1) {
                  if (item.tableIds instanceof Array) {
                    let tableIdsArr = [];
                    item.tableIds.forEach((e, i) => {
                      if (e.fkTableId == undefined) {
                        tableIdsArr.push(e);
                      } else {
                        tableIdsArr.push(e.fkTableId);
                      }
                    });
                    item.tableIds = tableIdsArr;
                    console.log(tableIdsArr);
                  }
                } else {
                }
              });
              this.$api
                .baseWorkflowUpdate(data)
                .then(res => {
                  if (res.code == 200) {
                    this.loading = false;
                    this.$message({
                      type: "success",
                      message: "编辑成功"
                    });
                    _this.show1 = false;
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
      // if(this.headerType =='1'){
      this.listQuery.workflowType = this.typeWorkflowType;
      // }
      this.$api.pagingDisplay(this.listQuery).then(res => {
        if (res.code == 200) {
          const workflowOption = {
            0: "生产验收工序",
            1: "生产验收流程",
            2: "业主计量审批",
            3: "分包单位结算审批"
          };

          res.data.records.forEach(item => {
            item.flowName = workflowOption[item.workflowType];
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
      });
    },
    // 查询
    search() {
      // this.listQuery.fkEnginerringTypeId = this.listQuery.fkEnginerringTypeId
      // this.listQuery.workflowType =  this.listQuery.workflowType
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
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.pagingDisplay();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 查看
    examine(row) {
      // form.fkEnginerringTypeId
      // projectType
      this.projectType.forEach(item => {
        if (item.pkId == row.fkEnginerringTypeId) {
          item.typeSonList.forEach(i => {
            i.label = i.engTypeName;
            i.value = i.pkId;
          });
          this.expertSortData = item.typeSonList;
        }
      });
      this.loading = true;
      if (row.workflowType == 1) {
        this.pitchOnDate = [];
        this.show1 = true;
        this.addTitle = "查看流程";
        this.editStatus = false;
        this.nodeShow = false;
        this.workflowTypeChange(row.fkProfessionalTypeId, row.fkEnginerringTypeId);
        // this.searchTableVosList(row.fkProfessionalTypeId);
        this.$api
          .findWorkflowTemplateById({ pkId: row.pkId })
          .then(res => {
            if (res.code == 200) {
              res.data.workflowType = res.data.workflowType.toString();
              this.form = res.data;
              // this.form.workflowType = res.data.workflowType +""
              this.loading = false;
              this.$nextTick(() => {
                this.$refs.productionApproval.editInit(res.data, false);
              });
              // const arr = [];
              // res.data.workflowNodeDTOS.forEach(item => {
              //   if (item.nodeType == 3) {
              //     arr.push(item);
              //   }
              // });
              // let nodeList = res.data.nodeList.join(",");
              // this.$api
              //   .workflowById({ pkIds: nodeList })
              //   .then(res => {
              //     if (res.code == 200) {
              //       this.quotePdfListByType();
              //       let arr1 = res.data;
              //       const newArr = [];
              //       this.productionApproval.forEach(item => {
              //         arr.forEach(e => {
              //           if (item.pkId == e.pkId) {
              //             item.isActive = true;
              //           }
              //         });
              //       });
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
              // this.loading = false;
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
          .findWorkflowTemplateById({ pkId: row.pkId })
          .then(res => {
            if (res.code == 200) {
              this.flowTableArr = res.data.tableIds;
              this.show3 = true;
              this.addTitle = "查看流程";
              this.warehouseType = "";
              this.roleType = "";
              res.data.workflowType = res.data.workflowType.toString();
              this.form = res.data;
              if (this.form.type != null) {
                this.form.type = this.form.type + "";
                this.form.types = this.form.type + "";
              }
              this.XmlStr = res.data.bpmnContent;
              if (res.data.workflowType == 4 || res.data.workflowType == 5) {
                this.getWorkflowType(res.data.workflowType);
                if (res.data.workflowType == 4) {
                  this.roleType = res.data.type;
                } else {
                  this.warehouseType = res.data.type;
                }
              }
              this.$nextTick(() => {
                this.$refs.examineBpmn.exportDiagram(res.data.bpmnContent, res.data.tableIds, res.data);
              });
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

    // 编辑流程
    designFlow(row) {
      this.seedDate = row;
      this.projectType.forEach(item => {
        if (item.pkId == row.fkEnginerringTypeId) {
          item.typeSonList.forEach(i => {
            i.label = i.engTypeName;
            i.value = i.pkId;
          });
          this.expertSortData = item.typeSonList;
        }
      });
      this.editStatus = true;
      this.show1 = true;
      this.addTitle = "编辑流程";
      this.loading = true;
      if (row.workflowType == 1) {
        this.nodeShow = false;
        this.pitchOnDate = [];
        const data = row.fkProfessionalTypeId == 0 ? row.fkEnginerringTypeId : row.fkProfessionalTypeId;

        // this.searchTableVosList(row.fkProfessionalTypeId);
        // let arr = [];
        // row.nodeList.forEach(item => {
        //   arr.push(item);
        // });

        // ==============================workflowById

        this.$api
          .findWorkflowTemplateById({ pkId: row.pkId })
          .then(res => {
            if (res.code == 200) {
              // let nodeList = res.data.nodeList.join(",");
              // res.data.workflowType = res.data.workflowType.toString();
              this.form = res.data;
              this.form.workflowType = res.data.workflowType + "";
              this.loading = false;
              this.$nextTick(() => {
                this.$refs.productionApproval.editInit(res.data, true);
              });
              // this.$api
              //   .searchWorkflowTemplateList({ fessionalTypeId: data, nodeList })
              //   .then(res => {
              //     if (res.code == 200) {
              //       res.data.forEach(item => {
              //         item.isActive = false;
              //       });
              //       this.productionApproval = res.data;
              //       this.$api
              //         .workflowById({ pkIds: nodeList })
              //         .then(res => {
              //           if (res.code == 200) {
              //             this.quotePdfListByType();
              //             let arr = res.data;
              //             const newArr = [];
              //             this.productionApproval.forEach(item => {
              //               arr.forEach(e => {
              //                 if (item.pkId == e.pkId) {
              //                   item.isActive = true;
              //                 }
              //               });
              //             });
              //             arr.forEach(item => {
              //               this.form.workflowNodeDTOS.forEach(e => {
              //                 if (item.pkId == e.fkWorkflowId) {
              //                   item.baseSubWorkflow = e.baseSubWorkflow;
              //                   item.bookPdfDTOS = e.bookPdfDTOS;
              //                   item.fkRoleId = e.fkRoleId;
              //                   item.fkWorkflowId = e.fkWorkflowId;
              //                   item.fkWorkflowTemplateId = e.fkWorkflowTemplateId;
              //                   item.materialUsedTable = e.materialUsedTable;
              //                   item.name = e.name;
              //                   item.nodeApproveType = e.nodeApproveType;
              //                   item.nodeName = e.nodeName;
              //                   item.nodeType = e.nodeType;
              //                   item.quantitiesTable = e.quantitiesTable;
              //                   item.roleName = e.roleName;
              //                   item.scoreFlag = e.scoreFlag;
              //                   item.sortval = e.sortval;
              //                   item.tableDTOS = e.tableDTOS;
              //                 }
              //               });
              //             });
              //             this.pitchOnDate = arr;
              //             this.loading = false;
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
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            //
            this.loading = false;
          });
        // return
        // ==============================
        // let nodeList = row.nodeList.join(",");
      } else {
        this.$api
          .findWorkflowTemplateById({ pkId: row.pkId })
          .then(res => {
            if (res.code == 200) {
              this.flowTableArr = res.data.tableIds; //管理表格id集
              this.launchType = res.data.launchType; //发起设置（不限：0，指定角色：1，首个节点：2）
              this.fkRoleId = res.data.fkRoleId; //发起角色ID（关联表sys_role)
              res.data.workflowType = res.data.workflowType.toString();
              this.form = res.data;
              if (this.form.type != null) {
                this.form.type = this.form.type + "";
                this.form.types = this.form.type + "";
              }
              // if (this.form.workflowType == 1) {
              //   // const arr = [];
              //   // res.data.workflowNodeDTOS.forEach(item => {
              //   //   if (item.nodeType == 3) {
              //   //     arr.push(item);
              //   //   }
              //   // });
              //   // const newArr = [];
              //   // this.ereas = arr;
              //   // for (let i = 0; i < arr.length; i++) {
              //   //   for (let j = 0; j < this.productionApproval.length; j++) {
              //   //     if (this.productionApproval[j].pkId == arr[i].fkWorkflowId) {
              //   //       this.productionApproval[j].isActive = true;
              //   //       arr[i].bpmnContent = this.productionApproval[j].bpmnContent;
              //   //       arr[i].workflowName = this.productionApproval[j].workflowName;
              //   //       arr[i].pkId = this.productionApproval[j].pkId;
              //   //       newArr.push(arr[i]);
              //   //     }
              //   //   }
              //   // }
              //   // this.pitchOnDate = newArr;
              //   console.log(111111111111111111)
              // } else {
              // console.log(22222222222222222)
              this.warehouseType = "";
              this.roleType = "";
              if (res.data.workflowType == 4 || res.data.workflowType == 5) {
                this.getWorkflowType(res.data.workflowType);
                if (res.data.workflowType == 4) {
                  this.roleType = res.data.type;
                } else {
                  this.warehouseType = res.data.type;
                }
              }
              this.$nextTick(() => {
                this.$refs.regPanl.exportDiagram(res.data.bpmnContent, this.addTitle, res.data);
              });
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
      }
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
    cancel(row) {
      const _this = this;
      _this
        .$confirm("确认取消该流程?", "取消流程确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.publishStatus({ pkId: row.pkId, publishStatus: 0 }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "取消流程成功"
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
          this.$api.deleteFlow({ pkId: row.pkId }).then(res => {
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
      this.flowTableArr = [];
      this.expertSortData = [];
      this.form.fkProfessionalTypeId = "";
      this.form.fkEnginerringTypeId = "";
      this.launchType = "";
      this.fkRoleId = "";
      this.editStatus = true;
      this.form.workflowType = this.typeWorkflowType + "";
      this.show1 = true;
      this.nodeShow = false;
      this.addTitle = "新增流程";
      // if (this.$refs.form != undefined) {
      //   this.$refs.form.resetFields();
      // }
      // if (this.$refs.regPanl != undefined) {
      //   this.$refs.regPanl.intCreateNewDiagram();
      // }
      // this.pitchOnDate = [];
      // if (this.$refs.formDate != undefined) {
      //   this.$refs.formDate.resetFields();
      // }
      // if(this.headerType =='1'){
      //     this.form.workflowType = this.typeWorkflowType +""
      //   }else{
      //     this.form.workflowType =""
      //   }
      this.flowTableArr = [];

      // debugger
      if (this.typeWorkflowType == 5) {
        this.getWorkflowType(this.typeWorkflowType);
      }

      const _this = this;
      this.$nextTick(() => {
        this.form.workflowType = "";
        this.$refs.formDate.resetFields();
        // if(_this.headerType =='1'){
        _this.$set(_this.form, "workflowName", "");
        _this.$set(_this.form, "fkEnginerringTypeId", "");
        _this.$set(_this.form, "fkProfessionalTypeId", "");
        _this.$set(_this.form, "remark", "");
        _this.form.workflowType = this.typeWorkflowType + "";
        // }else{
        //   _this.form.workflowType = ""
        // }
        // console.log("状态值:", this.form.workflowType);

        // headerType
        if (this.typeWorkflowType != 1 && this.$refs.regPanl != undefined) {
          console.log("进入工序");
          this.$refs.regPanl.intCreateNewDiagram();
        } else {
          this.$refs.productionApproval.init();
        }

        this.form.types = "";
      });
    },
    // 配置分项工程
    apportion(row) {
      this.filterText = "";
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
    // 发布流程
    publish(row) {
      const _this = this;
      _this
        .$confirm("确认发布该流程?", "发布流程确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.publishStatus({ pkId: row.pkId, publishStatus: 1 }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "发布流程成功"
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
    // 工程类型
    searchTypeList() {
      this.$api.searchTypeList().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
          });
          // this.searchOptions[1].options = res.data;
          this.projectType = res.data;
        }
      });
    },
    // 配置分项工程
    termQueryEPC(pkId, id, status, typeId) {
      const data = id == 0 ? typeId : id;
      this.$api.liuchenfenxib({ fessionalTypeId: data }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.prodItemLists.forEach(i => {
              i.prodItemLists.forEach(j => {
                // if (j.fkWorkflowTemplateId != id && j.fkWorkflowTemplateId != null) {
                //   if (pkId == j.fkWorkflowTemplateId) {
                //     j.disabled = false;
                //   } else {
                //     j.disabled = true;
                //   }
                // } else {
                //   j.disabled = false;
                // }
                if (j.isDisable == "1") {
                  j.disabled = true;
                } else {
                  j.disabled = false;
                }
              });
            });
          });
          this.subentryData = res.data;
          if (status == 1) {
            for (let e = 0; e <= this.defaultKey.length; e++) {
              this.subentryData.forEach(item => {
                item.prodItemLists.forEach(i => {
                  i.prodItemLists.forEach(j => {
                    // if (j.pkId == this.defaultKey[e]) {
                    //   j.disabled = true;
                    // }
                    if (j.isDisable == "1") {
                      j.disabled = true;
                    } else {
                      j.disabled = false;
                    }
                  });
                });
              });
            }
          } else {
            this.subentryData = res.data;
          }
        }
      });
    },
    // 获取pdf下拉列表
    quotePdfListByType() {
      // 0获取技术规范，1获取安全规范，2获取验收标准
      this.$api
        .quotePdfListByType({
          bookType: 0,
          // enginerringTypeName: "",
          // bookName: "",
          fkProfessionalTypeId: this.form.fkProfessionalTypeId
          // fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.technologyDate = res.data;
          }
        });
      this.$api
        .quotePdfListByType({
          bookType: 1,
          // enginerringTypeName: "",
          // bookName: "",
          fkProfessionalTypeId: this.form.fkProfessionalTypeId
          // fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.safetyDate = res.data;
          }
        });
      this.$api
        .quotePdfListByType({
          bookType: 2,
          // enginerringTypeName: "",
          // bookName: "",
          fkProfessionalTypeId: this.form.fkProfessionalTypeId
        })
        .then(res => {
          if (res.code == 200) {
            this.acceptanceLevel = res.data;
          }
        });
    },
    // 管理表格下拉
    searchTableVosList(id) {
      // this.form.fkProfessionalTypeId
      this.$api.searchTableVosList({ fkProfessionalTypeId: id }).then(res => {
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

  //

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

  //
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
  max-width: 80px;
}

.search-mr {
  position: absolute;
  top: 27px;
  right: 40px;
  z-index: 2;
}

.violet {
  border: 2px dashed #c280ff !important;
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
/deep/ .el-tabs__header {
  margin: 0;
  // background-color: #fff;
}
.wh-150 {
  width: 150px !important;
}
.custom-tree-node {
  position: relative;
}
.reminder {
  position: absolute;
  right: 0px;
  padding: 8px;
  color: #fff;
  background: #7f7f7f;
  z-index: 9999999999999999;
  display: none;
}
.el-icon-paperclip:hover + .reminder {
  // .{
  display: block !important;
  // }
}
</style>
