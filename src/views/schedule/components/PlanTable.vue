<template>
  <div class="tab-container" v-loading="loading">
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px" v-model="searchData">
          <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)">
            <treeSelect @selectIds="selectIds"></treeSelect>
          </el-form-item>
          <el-form-item label="标段项目" v-if="user.orgType == 7 && typeShow">
            <el-select size="mini" class="wh-100" v-model="searchData.fkOrgId">
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="年份" v-if="true && typeShow">
            <el-select size="mini" class="wh-100" v-model="searchData.planYear">
              <el-option v-for="item in yearArr" :key="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="季度" v-if="planType === 1 && typeShow">
            <el-select size="mini" class="wh-100" v-model="searchData.planQuarter">
              <el-option :value="1" label="一季度"></el-option>
              <el-option :value="2" label="二季度"></el-option>
              <el-option :value="3" label="三季度"></el-option>
              <el-option :value="4" label="四季度"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="月份" v-if="planType === 2 && typeShow">
            <el-select size="mini" class="wh-100" v-model="searchData.planMonth">
              <el-option v-for="item in month" :key="item.value" :value="item.value" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="完成状态">
            <el-select size="mini" class="wh-100" v-model="searchData.finishStatus">
              <el-option value="" label="全部"></el-option>
              <el-option :value="0" label="未完成"></el-option>
              <el-option :value="1" label="已完成"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item v-if="typeShow">
            <el-radio-group v-model="isItemDetail">
              <el-radio :label="0">按分项列表</el-radio>
              <el-radio :label="1">按清单项目</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
      <template slot="right" v-if="true && typeShow">
        <el-button size="mini" type="primary" @click="openPlanDialog" v-if="user.orgType === 5">编辑</el-button>
      </template>
    </SearchBar>
    <!-- 表格 -->
    <div class="table-data" style="height: 86%; margin-top: 10px" v-if="typeShow">
      <!-- 分项列表 -->
      <el-table :tooltip-effect="'light'" height="99%" ref="tables" stripe v-show="isItemDetail === 0" @expand-change="expandChange" :tree-props="{ children: 'children' }" row-key="fkSubitemId" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
        <!-- <el-table-column align="center" label="序号" type="index" width="80" /> -->
        <el-table-column align="center" prop="itemCode" show-overflow-tooltip>
          <template slot="header" slot-scope="{ row }">
            <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
            <span :cleanRed="row">项目编号</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="项目名称" prop="itemName" show-overflow-tooltip />
        <el-table-column align="center" label="单位" prop="unitName" show-overflow-tooltip />
        <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ !pricePermission ? "***" : row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设计工程量" prop="planQuantities" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ row.planQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="合同金额" prop="designAmount" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.designAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="planType == 1 ? '上季度末累计计划' : planType == 2 ? '上月度末累计计划' : '上年度末累计计划'" prop="planQuantities" show-overflow-tooltip>
          <el-table-column align="center" label="工程量" prop="upperPlanFinishQuantities" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span v-if="row.grade === 4">{{ row.upperPlanFinishQuantities }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="产值" prop="upperAmount" show-overflow-tooltip> </el-table-column>
        </el-table-column>
        <el-table-column align="center" :label="planType == 1 ? '上季度末累计已完成' : planType == 2 ? '上月度末累计已完成' : '上年度末累计已完成'" prop="planQuantities" show-overflow-tooltip>
          <el-table-column align="center" label="工程量" prop="upperFinishQuantities" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span v-if="row.grade === 4">{{ row.upperFinishQuantities }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="产值" prop="upperFinishAmount" show-overflow-tooltip> </el-table-column>
        </el-table-column>
        <el-table-column align="center" :label="planType == 1 ? '本季度末计划' : planType == 2 ? '本月度计划' : '本年度计划'" show-overflow-tooltip>
          <el-table-column align="center" label="工程量" prop="planFinishQuantities" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span v-if="row.grade === 4">{{ row.planFinishQuantities }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="产值" prop="amount" show-overflow-tooltip> </el-table-column>
        </el-table-column>
        <el-table-column align="center" :label="planType == 1 ? '本季度末计划累计完成' : planType == 2 ? '本月度末计划累计完成' : '本年度末计划累计完成'" prop="planQuantities" show-overflow-tooltip>
          <el-table-column align="center" label="工程量" prop="finishQuantities" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span v-if="row.grade === 4">{{ row.finishQuantities }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="产值" prop="finishAmount" show-overflow-tooltip> </el-table-column>
        </el-table-column>
        <!-- <el-table-column align="center" label="设计工程量" prop="planQuantities" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ row.planQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="计划完成工作量" prop="planQuantities" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ row.planQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ !pricePermission ? "***" : row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="计划完成产值" prop="amount" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="已完成产值" prop="finishAmount" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.finishAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="完成状态" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span>{{ row.finishStatus == 0 ? "未完成" : row.finishStatus == 1 ? "已完成" : "" }}</span>
          </template>
        </el-table-column> -->
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 工程细目 -->
      <!-- <el-table :tooltip-effect="'light'" style="width: 100%" :key="searchData.finishStatus" stripe v-show="isItemDetail === 1" height="98%" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
        <el-table-column align="center" label="序号" type="index" width="80" />
        <el-table-column align="center" label="清单项目名称" prop="itemName"> </el-table-column>
        <el-table-column align="center" label="设计工程量" prop="planQuantities" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ row.planQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="计划完成工程量" prop="planQuantities" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ row.planQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ !pricePermission ? "***" : row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="计划完成产值" prop="amount" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ !pricePermission ? "***" : row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="已完成工程量" prop="finishQuantities" show-overflow-tooltip v-if="searchData.finishStatus!==0">
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.finishQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="已完成产值" prop="finishAmount" show-overflow-tooltip v-if="searchData.finishStatus!==0">
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.finishAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="完成百分比" show-overflow-tooltip v-if="searchData.finishStatus!==0">
          <template slot-scope="{ row }">
            <span>{{ row.amount ? (((row.finishAmount - 0) / (row.amount - 0)) * 100).toFixed(2) + "%" : "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="未完成工程量" prop="incompleteQuantities" show-overflow-tooltip v-if="searchData.finishStatus===0">
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.incompleteQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="未完成产值" prop="incompleteAmount" show-overflow-tooltip v-if="searchData.finishStatus===0">
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.incompleteAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="未完成百分比" show-overflow-tooltip v-if="searchData.finishStatus===0">
          <template slot-scope="{ row }">
            <span>{{ row.amount ? (((row.incompleteAmount - 0) / (row.amount - 0)) * 100).toFixed(2) + "%" : "-" }}</span>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table> -->

      <div style="height: 100%; position: relative" v-if="isItemDetail === 1">
        <el-select v-model="contractId" size="mini" @change="contentChange" class="contentSel">
          <el-option v-for="item in contractList" :key="item.pkId" :label="item.contractName" :value="item.pkId"> </el-option>
        </el-select>
        <el-tabs v-model="detailRadio" v-if="tableData.length" style="height: 100%">
          <el-tab-pane :label="item.chapterName" :name="item.pkId" v-for="(item, index) in tableData" :key="index" style="height: 100%">
            <el-table :tooltip-effect="'light'" style="width: 100%" :key="detailRadio" stripe height="98%" :data="item.planDetails" :header-cell-style="{ background: '#f1f6ff' }" :show-summary="true" :summary-method="getSummaries">
              <el-table-column align="center" label="子目号" prop="itemCode" width="80" show-overflow-tooltip />
              <el-table-column align="center" label="清单项目名称" prop="itemName"> </el-table-column>
              <el-table-column align="center" label="单位" prop="unitName" show-overflow-tooltip />
              <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <span>{{ !pricePermission ? "***" : row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="合同工程量" prop="planQuantities" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <span>{{ row.planQuantities }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="合同金额" prop="designAmount" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <span>{{ !pricePermission ? "***" : row.designAmount }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" :label="planType == 1 ? '上季度末计划' : planType == 2 ? '上月度末计划' : '上年度末计划'" prop="planQuantities" show-overflow-tooltip>
                <el-table-column align="center" label="工程量" prop="upperPlanFinishQuantities" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" label="产值" prop="upperAmount" show-overflow-tooltip> </el-table-column>
              </el-table-column>
              <el-table-column align="center" :label="planType == 1 ? '上季度末已完成' : planType == 2 ? '上月度末已完成' : '上年度末已完成'" prop="planQuantities" show-overflow-tooltip>
                <el-table-column align="center" label="工程量" prop="upperFinishQuantities" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" label="产值" prop="upperFinishAmount" show-overflow-tooltip> </el-table-column>
              </el-table-column>
              <el-table-column align="center" :label="planType == 1 ? '本季度末计划' : planType == 2 ? '本月度计划' : '本年度计划'" show-overflow-tooltip>
                <el-table-column align="center" label="工程量" prop="planFinishQuantities" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" label="产值" prop="amount" show-overflow-tooltip> </el-table-column>
              </el-table-column>
              <el-table-column align="center" :label="planType == 1 ? '本季度末计划累计完成' : planType == 2 ? '本月度末计划累计完成' : '本年度末计划累计完成'" prop="planQuantities" show-overflow-tooltip>
                <el-table-column align="center" label="工程量" prop="finishQuantities" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" label="产值" prop="finishAmount" show-overflow-tooltip> </el-table-column>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <div class="empty empty2" style="width: 100%; height: 100%" v-if="isItemDetail === 1 && !tableData.length">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </div>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 模态框 -->
    <el-dialog :close-on-press-escape="false" :title="title" width="70%" :visible.sync="dialogTableVisible" @close="closePlanDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <div class="dialog-header">
          <el-select class="wh-100" v-model="year" size="small" @change="yearChange">
            <el-option v-for="item in yearArr" :key="item" :value="item"></el-option>
          </el-select>
          <h1>年度</h1>
          <el-select size="small" class="wh-100" v-model="quarter" v-if="planType === 1" @change="quarterChange">
            <el-option :value="1" label="一季度"></el-option>
            <el-option :value="2" label="二季度"></el-option>
            <el-option :value="3" label="三季度"></el-option>
            <el-option :value="4" label="四季度"></el-option>
          </el-select>
          <el-select size="small" class="wh-100" v-model="months" v-if="planType === 2" @change="monthChange">
            <el-option v-for="item in month" :key="item.value" :value="item.value" :label="item.name"></el-option>
          </el-select>
          <h1>工程量计划表</h1>
          <el-button size="mini" type="primary" class="selectProBtn" @click="openSelectDialog">选择分项工程</el-button>
        </div>
        <div class="dialog-main">
          <el-table :tooltip-effect="'light'" stripe ref="table2" :header-cell-style="{ background: '#f1f6ff' }" @expand-change="expandChange2" height="100%" :data="editTableData.planDetails" :tree-props="{ children: 'children' }" row-key="fkSubitemId">
            <!-- <el-table-column align="center" type="index" label="序号" width="80"></el-table-column> -->
            <el-table-column align="center" label="项目编号" prop="itemCode" show-overflow-tooltip>
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand2('table2', 'isExpand2')"></i>
                <span :cleanRed="row">项目编号</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="项目名称" prop="itemName" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" label="单位" prop="numberUnit"></el-table-column>
            <el-table-column align="center" label="合同单价" prop="price">
              <template slot-scope="{ row }">
                <span v-if="row.grade === 4">{{ !pricePermission ? "***" : row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="设计工程量" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <span v-if="row.grade === 4 || (row.grade == 3 && row.itemType == 2)">{{ row.planQuantities }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="planType == 1 ? '上季度末计划' : planType == 2 ? '上月度末计划' : '上年度末计划'">
              <el-table-column align="center" label="工程量" prop="upperPlanFinishQuantities">
                <template slot-scope="{ row }">
                  <span v-if="row.grade === 4 || (row.grade == 3 && row.itemType == 2)">{{ row.upperPlanFinishQuantities }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="产值" prop="upperAmount"></el-table-column>
            </el-table-column>
            <el-table-column align="center" :label="planType == 1 ? '上季度末已完成' : planType == 2 ? '上月度末已完成' : '上年度末已完成'">
              <el-table-column align="center" label="工程量" prop="upperFinishQuantities">
                <template slot-scope="{ row }">
                  <span v-if="row.grade === 4 || (row.grade == 3 && row.itemType == 2)">{{ row.upperFinishQuantities }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="产值" prop="upperFinishAmount"></el-table-column>
            </el-table-column>
            <el-table-column align="center" :label="planType == 1 ? '本季度末计划' : planType == 2 ? '本月度计划' : '本年度计划'">
              <el-table-column align="center" label="工程量">
                <template slot-scope="{ row }">
                  <el-input v-if="row.grade == 4 && row.itemType == 1" v-model="row.planFinishQuantities" size="mini" @input="planInput($event, row)"></el-input>
                  <el-input v-if="row.grade == 3 && row.itemType == 2" v-model="row.number" size="mini" @input="sizeInput($event, row)"></el-input>
                  <span v-if="row.grade === 4 && row.itemType != 1"
                    >{{ row.planFinishQuantities }} <span v-if="row.itemType == 2" class="unitQuantity">{{ "(" + row.unitQuantity + row.numberUnit + "/米)" }}</span></span
                  >
                </template>
              </el-table-column>
              <el-table-column align="center" label="产值" prop="amount"></el-table-column>
            </el-table-column>
            <el-table-column align="center" :label="planType == 1 ? '本季度末计划累计完成' : planType == 2 ? '本月度末计划累计完成' : '本年度末计划累计完成'">
              <el-table-column align="center" label="工程量" prop="finishQuantities">
                <template slot-scope="{ row }">
                  <span v-if="row.grade === 4 || (row.grade == 3 && row.itemType == 2)">{{ row.finishQuantities }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="产值" prop="finishAmount"></el-table-column>
            </el-table-column>
            <!-- <el-table-column align="center" label="隧道延长米" prop="number" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <span v-if="[3, 4].includes(row.grade)">{{row.itemType == 2? row.itemNumber :'/'}}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="计划施工延长米" prop="itemNumber" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <el-input v-if="row.grade == 3 && row.itemType == 2" v-model="row.number" size="mini" @input="sizeInput($event,row)"></el-input>
                <span v-if="row.grade == 4 && row.itemType == 2">{{row.number + '米'}}</span>
                <span v-if="[3, 4].includes(row.grade) && row.itemType != 2">/</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="设计工程量" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <span v-if="row.grade === 4">{{ row.planQuantities }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="计划完成工程量" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <el-input v-if="row.grade == 4&&row.itemType==1" v-model="row.planFinishQuantities" size="mini" @input="planInput($event,row)"></el-input>
                <span v-if="row.grade === 4&&row.itemType!=1">{{row.planFinishQuantities + (row.itemType==2?row.numberUnit:'')}}</span>
                <span v-if="row.grade === 4">{{ row.planFinishQuantities+''+(row.itemType==2&&row.numberUnit&&row.planFinishQuantities?row.numberUnit:'') }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="合同单价" v-if="pricePermission" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <el-input size="mini" oninput="value=value.replace(/[^\d.]/g,/[^\d.]/g)" v-model.trim="row.price" v-if="row.grade === 4" type="number" @keydown.native="keyDown" @input="priceChange($event, row)"></el-input>
                <span v-if="row.grade === 4">{{ row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="设计产值" prop="designAmount" v-if="pricePermission" show-overflow-tooltip> </el-table-column>
            <el-table-column align="center" label="计划完成产值" prop="amount" v-if="pricePermission"> </el-table-column> -->
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="closePlanDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="savePlan">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 选择工程量模态框 -->
    <el-dialog :close-on-press-escape="false" title="选择分项工程" :visible.sync="selectDialog" width="30%" @close="closeSelectDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <div class="select-dialog-header">请选择细目</div>

        <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
        <el-tree @node-expand="nodeExpand" ref="tree" :data="treedata" show-checkbox node-key="pkId" :props="defaultProps" default-expand-all :filter-node-method="filterNode" class="showTree">
          <!-- check-strictly -->
          <span slot-scope="{ node, data }">
            <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
              <div :class="'label' + data.grade" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)" :style="{ color: data.isChoose ? '#c0c4cc' : '' }">
                <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
              </div>
            </el-tooltip>
          </span>
        </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="selectDialog = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveSelect">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SearchBar from "./SearchBar.vue";
import api from "@/api/api";
import treeSelect from "../../../components/proTreeSelect/treeSelect.vue";
// import elTree2 from "../../../utils/tree/src/tree.vue";
export default {
  // elTree2
  components: { SearchBar, treeSelect },
  props: {
    //   0为年度，1为季度，2为月度
    planType: {
      type: Number
    }
  },
  data() {
    return {
      tableData: [],
      // 模态框数据
      editTableData: {
        planDetails: []
      },
      // 计划id
      pkId: "",
      projectId: "",
      // 项目部下拉框
      options: [],
      proOptions: [],
      radio: 0,
      searchData: {
        fkOrgId: "",
        planYear: "",
        planQuarter: "",
        planMonth: "",
        isDetail: 0,
        finishStatus: ""
      },
      finishStatus: "",
      isItemDetail: 0, // 0为分享列表，1为工程细目
      // 月份选择数据
      month: [
        { value: 1, name: "一月" },
        { value: 2, name: "二月" },
        { value: 3, name: "三月" },
        { value: 4, name: "四月" },
        { value: 5, name: "五月" },
        { value: 6, name: "六月" },
        { value: 7, name: "七月" },
        { value: 8, name: "八月" },
        { value: 9, name: "九月" },
        { value: 10, name: "十月" },
        { value: 11, name: "十一月" },
        { value: 12, name: "十二月" }
      ],
      dialogTableVisible: false,
      selectDialog: false,
      // 新增/编辑时选择的数据
      modelData: {
        planYear: "",
        planQuarter: "",
        planMonth: "",
        planDetails: []
      },
      // 树形结构模拟数据
      treedata: [],
      checkedIds: [],
      defaultProps: {
        children: "prodItemLists",
        label: "itemName",
        disabled:this.disabledFn
      },
      loading: false,
      filterText: "",
      details: [],
      isShowTooltip: true,
      proId: "",
      isChange: false,
      year: "",
      quarter: "",
      months: "",
      isExpand: false,
      isExpand2: false,
      bianList: [],
      detailRadio: "",
      contractList: [],
      contractId: "",
      typeShow: true
    };
  },
  created() {
    this.searchData.planYear = new Date().getFullYear();
    if (this.planType === 1) {
      const nowMonth = new Date().getMonth() + 1;
      if ([1, 2, 3].includes(nowMonth)) {
        this.searchData.planQuarter = 1;
      } else if ([4, 5, 6].includes(nowMonth)) {
        this.searchData.planQuarter = 2;
      } else if ([7, 8, 9].includes(nowMonth)) {
        this.searchData.planQuarter = 3;
      } else if ([10, 11, 12].includes(nowMonth)) {
        this.searchData.planQuarter = 4;
      }
    }
    if (this.planType === 2) {
      this.searchData.planMonth = new Date().getMonth() + 1;
    }
    if([2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)){
      this.$api.getProjectTreeByOrgType().then(res => {
        if (res.code == 200) {
          if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
            return (this.typeShow = false);
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    }

    if (this.user.orgType === 7) {
      this.projectBidByProjectId();
    }
  },
  methods: {
    disabledFn(data, node){
      if(data.isDisable){
        return true
      }
      return false
    },
    setDisabled() {
      this.treedata.forEach(item => {
        let num1 = 0;
        item.prodItemLists.forEach(item2 => {
          let num2 = item2.prodItemLists.filter(item4 => item4.isDisable).length;
          if (num2 == item2.prodItemLists.length) {
              num1 = num1 + 1;
              item2.isDisable = true;
            } else {
              item2.isDisable = false;
            }
          });
        if (num1 == item.prodItemLists.length) {
          item.isDisable = true;
        } else {
          item.isDisable = false;
        }
      });
    },
    selectIds(arr, obj) {
      if (arr.length) {
        if (arr.length > 1) {
          this.searchData.fkOrgId = arr[1];
        } else {
          this.searchData.fkOrgId = arr[0];
        }
      }
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (["合同金额", "产值"].includes(column.label)) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return (prev + curr).toFixed(6) - 0;
              } else {
                return prev;
              }
            }, 0);
          } else {
            sums[index] = "N/A";
          }
        }
      });
      return sums;
    },
    contentChange() {
      this.getPlanList();
    },
    sizeInput(e, row) {
      console.log(e, row);
      // 后端返回后number判断去除
      row.number = this.$limitInputNumber(e, row.planQuantities - row.upperPlanFinishQuantities, 0, 3);
      row.children.forEach(item => {
        item.number = row.number;
        // 1为每延米工程量，后端返回后替换
        item.planFinishQuantities = item.unitQuantity * item.number;
        item.amount = (item.price * item.planFinishQuantities).toFixed(2) - 0;
      });
      this.comput();
    },
    planInput(e, row) {
      row.planFinishQuantities = this.$limitInputNumber(e, 100000000, 1, 3);
      row.amount = row.planFinishQuantities * row.price;
      this.comput();
    },
    comput() {
      const arr1 = this.bianList.filter(item => item.grade === 1);
      const arr2 = this.bianList.filter(item => item.grade === 2);
      const arr3 = this.bianList.filter(item => item.grade === 3);
      const arr4 = this.bianList.filter(item => item.grade === 4);

      arr3.forEach(item => {
        item.amount = 0;
        arr4.forEach(item2 => {
          if (item.fkSubitemId == item2.fkParentId) {
            item.amount = item.amount - 0 + (item2.amount - 0);
          }
        });
      });
      arr2.forEach(item => {
        item.amount = 0;
        arr3.forEach(item2 => {
          if (item.fkSubitemId == item2.fkParentId) {
            item.amount = item.amount - 0 + (item2.amount - 0);
          }
        });
      });
      arr1.forEach(item => {
        item.amount = 0;
        arr2.forEach(item2 => {
          if (item.fkSubitemId == item2.fkParentId) {
            item.amount = item.amount - 0 + (item2.amount - 0);
          }
        });
      });
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
    yearChange(e) {
      if (this.isChange) {
        this.$confirm("是否切换，切换后新增加的数据将不保存", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.modelData.planYear = e;
            this.isChange = false;
          })
          .catch(err => {
            this.year = this.modelData.planYear;
          });
      } else {
        this.modelData.planYear = e;
      }
    },
    quarterChange(e) {
      if (this.isChange) {
        this.$confirm("是否切换，切换后新增加的数据将不保存", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.modelData.planQuarter = e;
            this.isChange = false;
          })
          .catch(err => {
            this.quarter = this.modelData.planQuarter;
          });
      } else {
        this.modelData.planQuarter = e;
      }
    },
    monthChange(e) {
      if (this.isChange) {
        this.$confirm("是否切换，切换后新增加的数据将不保存", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.modelData.planMonth = e;
            this.isChange = false;
          })
          .catch(err => {
            this.months = this.modelData.planMonth;
          });
      } else {
        this.modelData.planMonth = e;
      }
    },
    getContractList() {
      this.$api.searchContracts({ contractType: 1, fkProjectId: this.searchData.fkOrgId }).then(res => {
        if (res.code == 200) {
          this.contractList = res.data;
          if (res.data.length) {
            this.contractId = res.data[0].pkId;
            this.searchData.isDetail = 1;
          }
        }
      });
    },
    // 获取计划表
    getPlanList() {
      const data = {
        ...this.searchData,
        planType: this.planType,
        isBring: 1
      };
      if (this.isItemDetail === 1) {
        data.contractId = this.contractId;
      }
      // if (this.user.orgType === 5) {
      //   data = { ...data, fkOrgId: this.user.fkOrgId };
      // }
      this.loading = true;
      api
        .getPlanAndDetailByCondition(data)
        .then(res => {
          if (res.code === 200) {
            if (res.data.length) {
              if (this.isItemDetail === 1) {
                this.tableData = res.data[0].planChapterVos ? res.data[0].planChapterVos : [];
                this.detailRadio = this.tableData[0].pkId;
              } else {
                this.tableData = res.data[0].planDetails ? res.data[0].planDetails : [];
              }
              // this.editTableData = res.data[0];
              // this.editTableData.planDetails = res.data[0].planDetails?res.data[0].planDetails:[];
              // this.pkId = res.data[0].pkId;
              // this.projectId = res.data[0].fkProjectId;
            } else {
              this.pkId = "";
            }
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 根据id获取计划表
    getPlanListById(pkId) {
      api.getPlanByProjectId({ pkId }).then(res => {
        if (res.code === 200) {
          this.editTableData = res.data;
          // this.checkedIds = res.data.planDetails
          //   .filter(item => item.grade === 4)
          //   .map(item => item.fkSubitemId);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取项目部
    // getItemListByCustom() {
    //   api.getItemListByCustom().then(res => {
    //     if (res.code === 200) {
    //       this.options = res.data;
    //       if (res.data.length) {
    //         this.searchData.fkOrgId = res.data[0].pkId;
    //       }
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    projectBidByProjectId(){
      this.$api.projectBidByProjectId().then(res=>{
        if(res.code==200){
          if (res.data.length) {
            this.searchData.fkOrgId = res.data[0].pkId;
          }
          this.proOptions = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
        }else {
          this.$message.warning(res.msg);
        }
      })
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.searchProject().then(res => {
        if (res.code === 200) {
          if ([2, 3, 9,10,11,12].includes(this.user.orgType)) {
            this.options = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
            if (res.data.length) {
              this.proId = res.data[0].pkId;
              this.allListBidByProId(0, res.data[0].pkId);
            }
          } else {
            if (res.data.length) {
              this.searchData.fkOrgId = res.data[0].pkId;
            }
            this.proOptions = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "") {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.fkBidProjectId, label: item.fkBidProjectName }));
          if (res.data.length) {
            this.searchData.fkOrgId = res.data[0].fkBidProjectId;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 选择项目部
    proChange(e) {
      if (e) {
        this.allListBidByProId(0, e);
      }
    },
    listToTree(list, myId) {
      const children = [];
      list.forEach(item => {
        if (item.pid === myId) {
          item.children = this.listToTree(list, item.pkId);
          children.push(item);
        }
      });
      return children;
    },
    // 获取细目表
    getProdItemListById() {
      let data = { ifTree: 0, planId: this.pkId ? this.pkId : "", planType: this.planType, planYear: this.modelData.planYear };
      if (this.planType === 1) {
        data = { ...data, planQuarter: this.modelData.planQuarter };
      } else if (this.planType === 2) {
        data = { ...data, planMonth: this.modelData.planMonth };
      }
      api.searchByProjectId(data).then(res => {
        if (res.code === 200) {
          // prodItemLists
          res.data.forEach(item => {
            item.pid = "0";
            item.prodItemLists.forEach(e => {
              e.pid = item.pkId;
              e.prodItemLists.forEach(s => {
                s.pid = e.pkId;
                s.arr = s.prodItemLists.map(item2 => ({ ...item2, pid: s.pkId }));
                s.prodItemLists = null;
              });
            });
          });
          this.treedata = res.data
          this.setDisabled()
          this.selectDialog = true;
          this.checkedIds = [];
          if (this.editTableData.planDetails) {
            this.editTableData.planDetails.forEach(item => item.children.forEach(item2 => item2.children.forEach(item3 => this.checkedIds.push(item3.fkSubitemId))));
          }
          this.$nextTick(() => {
            this.$refs.tree.setCheckedKeys(this.checkedIds);
          });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开编辑计划模态框
    openPlanDialog() {
      this.year = this.searchData.planYear;
      this.modelData.planYear = this.searchData.planYear;
      if (this.planType === 1) {
        this.quarter = this.searchData.planQuarter;
        this.modelData.planQuarter = this.searchData.planQuarter;
      }
      if (this.planType === 2) {
        this.months = this.searchData.planMonth;
        this.modelData.planMonth = this.searchData.planMonth;
      }
      // if (this.user.orgType === 5) {
      //   this.searchData = { ...this.searchData, fkOrgId: this.user.fkOrgId };
      // }
      // if (this.pkId) {
      //   this.getPlanListById(this.pkId);
      // }
      const data = {
        ...this.searchData,
        planType: this.planType,
        isDetail: 0
      };
      this.loading = true;
      api
        .getPlanAndDetailByCondition(data)
        .then(res => {
          if (res.code === 200) {
            if (res.data.length) {
              this.editTableData = res.data[0];
              this.editTableData.planDetails = res.data[0].planDetails ? res.data[0].planDetails : [];
              this.pkId = res.data[0].pkId;
              this.projectId = res.data[0].fkProjectId;
            } else {
              this.pkId = "";
              this.editTableData = {
                planType: this.planType,
                ...this.modelData
              };
            }
            this.dialogTableVisible = true;
            // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.editTableData = {
              planType: this.planType,
              ...this.modelData
            };
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 关闭编辑计划模态框
    closePlanDialog() {
      this.dialogTableVisible = false;
      this.isChange = false;
      // this.editTableData = { planType: this.planType, ...this.modelData };
    },
    // 保存计划
    savePlan() {
      // if (!this.editTableData.planDetails || !this.editTableData.planDetails.length) {
      //   return this.$message.warning("请先选择工程量");
      // }
      for (let i = 0; i < this.editTableData.planDetails.length; i++) {
        if (this.editTableData.planDetails[i].amount > 999999999999.99) {
          return this.$message.warning("计划完成产值不能超过：999999999999.99");
        }
      }
      // let details = this.editTableData.planDetails.filter(item => item.grade == 4).map(item => ({ fkSubitemId: item.pkId, price: item.price }));
      const details = [];
      let showToast = false
      this.editTableData.planDetails.forEach(item => {
        item.children.forEach(item2 => {
          item2.children.forEach(item3 => {
            if(item3.itemType==2&&!item3.number){
              showToast =true
            }
            item3.children.forEach(item4 => {
              if (item4.itemType == 2) {
                details.push({ fkSubitemId: item4.fkSubitemId, price: item4.price, number: item4.number, planQuantities: item4.planFinishQuantities });
              } else {
                details.push({ fkSubitemId: item4.fkSubitemId, price: item4.price, planQuantities: item4.planFinishQuantities });
                if(!item4.planFinishQuantities||item4.planFinishQuantities==0){
                  showToast =true
                }
              }
            });
          });
        });
      });
      if(showToast){
        this.$message.warning("分项工程的计划工程量不能为0")
        return
      }
      let data = {
        details,
        pkId: this.editTableData.pkId ? this.editTableData.pkId : "",
        planType: this.planType,
        planYear: this.modelData.planYear
      };
      if (this.planType === 1) {
        data = { ...data, planQuarter: this.modelData.planQuarter };
      } else if (this.planType === 2) {
        data = { ...data, planMonth: this.modelData.planMonth };
      }
      this.loading = true;
      api
        .addAndUpdatePlanDetail(data)
        .then(res => {
          if (res.code === 200) {
            this.$message.success("保存成功");
            this.getPlanList();
            this.closePlanDialog();
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
      // this.loading = true;
      // api
      //   .addOrUpdatePlan({ ...this.editTableData, planType: this.planType })
      //   .then(res => {
      //     if (res.code === 200) {
      //       this.$message.success("保存成功");
      //       this.closePlanDialog();
      //       this.getPlanList();
      //     } else {
      //       this.$message.warning(res.msg);
      //     }
      //     this.loading = false;
      //   })
      //   .catch(err => {
      //     this.loading = false;
      //
      //   });
    },
    // 打开选择工程量模态框
    openSelectDialog() {
      this.getProdItemListById();
    },
    // 选择工程量模态框确定按钮
    saveSelect() {
      const filteArr = [];
      this.editTableData.planDetails.forEach(item => {
        item.children.forEach(item2 => {
          item2.children.forEach(item3 => {
            if (item3.itemType == 2) {
              filteArr.push(item3);
            }
            item3.children.forEach(item4 => {
              filteArr.push(item4);
            });
          });
        });
      });
      const getArr = this.$refs.tree.getCheckedNodes(false, true).map(item => ({
        ...item,
        planQuantities: item.designQuantities,
        planFinishQuantities: item.itemType == 2 ? "" : item.designQuantities,
        fkSubitemId: item.pkId,
        unitQuantity: item.unitQuantity ? item.unitQuantity : 0,
        amount: item.amount ? item.amount : 0,
        number: filteArr.filter(item2 => item2.fkSubitemId == item.pkId).length ? filteArr.filter(item2 => item2.fkSubitemId == item.pkId)[0].number : 0
      }));
      const getArr2 = [...getArr];
      getArr.forEach((item, index) => {
        if (item.arr) {
          item.arr.forEach(e => {
            const idx = getArr2.findIndex(item2 => item2.pkId === item.pkId);
            const arr = filteArr.filter(item3 => item3.fkSubitemId == e.pkId);
            getArr2.splice(idx + 1, 0, {
              ...e,
              itemNumber: e.itemType == 2 ? item.itemNumber : 0,
              number: e.itemType == 2 ? (arr.length ? arr[0].number : item.number) : 0,
              planQuantities: e.designQuantities,
              planFinishQuantities: e.itemType == 2 ? item.number * e.unitQuantity : arr.length ? arr[0].planFinishQuantities : e.designQuantities,
              unitQuantity: e.unitQuantity ? e.unitQuantity : 0,
              fkSubitemId: e.pkId,
              amount: e.amount ? e.amount : 0
            });
          });
        }
      });
      const arr = getArr2;
      // return console.log(arr);
      for (let i = 0; i < arr.length; i++) {
        for (let k = 0; k < arr.length; k++) {
          if (arr[i].fkSubitemId == arr[k].fkParentId) {
            arr[i].designAmount = arr[i].designAmount - 0 + (arr[k].designAmount - 0);
          }
        }
      }
      const arr1 = arr.filter(item => item.grade === 1);
      const arr2 = arr.filter(item => item.grade === 2);
      const arr3 = arr.filter(item => item.grade === 3);
      const arr4 = arr.filter(item => item.grade === 4);
      arr4.forEach(item => {
        item.amount = (item.planQuantities * item.price).toFixed(2) - 0;
        item.designAmount = (item.planQuantities * item.price).toFixed(2) - 0;
      });
      arr3.forEach(item => {
        arr4.forEach(item2 => {
          if (item.fkSubitemId == item2.fkParentId) {
            item.amount = item.amount - 0 + (item2.amount - 0);
            item.designAmount = item.designAmount - 0 + (item2.designAmount - 0);
          }
        });
      });
      arr2.forEach(item => {
        arr3.forEach(item2 => {
          if (item.fkSubitemId == item2.fkParentId) {
            item.amount = item.amount - 0 + (item2.amount - 0);
            item.designAmount = item.designAmount - 0 + (item2.designAmount - 0);
          }
        });
      });
      arr1.forEach(item => {
        arr2.forEach(item2 => {
          if (item.fkSubitemId == item2.fkParentId) {
            item.amount = item.amount - 0 + (item2.amount - 0);
            item.designAmount = item.designAmount - 0 + (item2.designAmount - 0);
          }
        });
      });
      this.bianList = arr;
      this.editTableData.planDetails = this.listToTree(arr, "0");
      this.isChange = true;
      this.closeSelectDialog();
      // let data = {
      //   details: this.details,
      //   pkId: this.editTableData.pkId,
      //   planType: this.editTableData.planType,
      //   planYear: this.editTableData.planYear
      // };
      // if (this.editTableData.planType === 1) {
      //   data = { ...data, planQuarter: this.editTableData.planQuarter };
      // } else if (this.editTableData.planType === 2) {
      //   data = { ...data, planMonth: this.editTableData.planMonth };
      // }
      // this.loading = true;
      // api
      //   .addAndUpdatePlanDetail(data)
      //   .then(res => {
      //     if (res.code === 200) {
      //       this.getPlanListById(res.data);
      //       this.closeSelectDialog();
      //       this.getPlanList();
      //     } else {
      //       this.$message.warning(res.msg);
      //     }
      //     this.loading = false;
      //   })
      //   .catch(err => {
      //     this.loading = false;
      //
      //   });
    },
    // 关闭选择工程量模态框
    closeSelectDialog() {
      this.$refs.tree.setCheckedKeys([]);
      this.selectDialog = false;
    },
    // 树形筛选
    filterNode(value, data) {
      if (!value) return true;
      return data.itemName.indexOf(value) !== -1 && data.grade == 3;
    },
    // 树形选中
    checkNode(data, checked) {
      if (checked) {
        if (this.details.filter(item => item.fkSubitemId === data.pkId).length === 0) {
          this.details = [...this.details, { fkSubitemId: data.pkId, price: data.price }];
        }
      } else {
        this.details = this.details.filter(item => item.fkSubitemId !== data.pkId);
      }
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        console.log(this[list]);
        this.forArr(this[list], this[isExpand], ref);
      });
    },
    handleExpand2(ref, isExpand) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        this.forArr(this.editTableData.planDetails, this[isExpand], ref);
      });
    },
    // 遍历
    forArr(arr, isExpand, ref) {
      arr.forEach(i => {
        if (!i.children) {
          return;
        }
        if (!i.children.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.children && i.children.length) {
          this.forArr(i.children, isExpand, ref);
        }
      });
    },
    expandChange(row, expend, ref) {
      if (row.grade == 1 && expend) {
        this.forArr(row.children, true, "tables");
      }
    },
    expandChange2(row, expend, ref) {
      if (row.grade == 1 && expend) {
        this.forArr(row.children, true, "table2");
      }
    },
    // 树形超过宽度提示
    onMouseEnter(str) {
      const tag = this.$refs[str];
      const parentWidth = tag.parentNode.offsetWidth; // 获取元素父级可视宽度
      const contentWidth = tag.offsetWidth; // 获取元素可视宽度
      this.isShowTooltip = contentWidth <= parentWidth;
    },
    priceChange(e, row) {
      console.log(row.price);
      // if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(e)) {
      //   e = e.replace(/^[0-9]+(\.[0-9]{1,2})?$/);
      //   row.price = row.price.replace(/^[0-9]+(\.[0-9]{1,2})?$/, "");
      // }
      this.isChange = true;
      if (row.price < 0) {
        row.price = 0;
      }
      row.amount = (row.planQuantities * row.price).toFixed(2) - 0;
      this.editTableData.planDetails.forEach(item => {
        let sum3 = 0;
        item.children.forEach(item2 => {
          let sum2 = 0;
          item2.children.forEach(item3 => {
            let sum1 = 0;
            item3.children.forEach(item4 => {
              sum1 += item4.amount - 0;
            });
            item3.amount = sum1;
            sum2 += item3.amount - 0;
          });
          item2.amount = sum2;
          sum3 += item2.amount - 0;
        });
        item.amount = sum3;
      });
      // let obj1 = this.editTableData.planDetails.filter(item => item.fkSubitemId === row.fkParentId)[0];
      // let obj2 = this.editTableData.planDetails.filter(item => item.fkSubitemId === obj1.fkParentId)[0];
      // let obj3 = this.editTableData.planDetails.filter(item => item.fkSubitemId === obj2.fkParentId)[0];
      // let sum1 = 0;
      // let sum2 = 0;
      // let sum3 = 0;
      // this.editTableData.planDetails
      //   .filter(item => item.fkParentId === obj1.fkSubitemId)
      //   .forEach(item => {
      //     sum1 += item.amount - 0;
      //   });
      // obj1.amount = sum1;
      // this.$nextTick(() => {
      //   this.editTableData.planDetails
      //     .filter(item => item.fkParentId === obj2.fkSubitemId)
      //     .forEach(item => {
      //       sum2 += item.amount - 0;
      //     });
      //   obj2.amount = sum2;
      //   this.$nextTick(() => {
      //     this.editTableData.planDetails
      //       .filter(item => item.fkParentId === obj3.fkSubitemId)
      //       .forEach(item => {
      //         sum3 += item.amount - 0;
      //       });
      //     obj3.amount = sum3;
      //   });
      // });
    },
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    }
  },
  computed: {
    pricePermission() {
      const arr = this.$store.state.menuData.filter(item => item.menuCode == "schedule");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    },
    // 获取年份
    yearArr() {
      const arr = [];
      const nowYear = new Date().getFullYear();
      for (let i = nowYear - 3; i <= nowYear + 5; i++) {
        arr.push(i);
      }
      return arr;
    },
    // 当前季度
    nowQuarter() {
      const nowMounth = new Date().getMonth() + 1;
      if (nowMounth <= 3) return 1;
      if (nowMounth > 3 && nowMounth < 6) return 2;
      if (nowMounth > 6 && nowMounth < 9) return 3;
      if (nowMounth > 9 && nowMounth < 12) return 4;
    },
    // 模态框名字
    title() {
      if (this.planType === 0) return "新增年度计划";
      if (this.planType === 1) return "新增季度计划";
      if (this.planType === 2) return "新增月度计划";
    },
    // 返回完成列表
    showList() {
      if (this.finishStatus === 0) {
        return this.tableData.filter(item => !item.finishStatus);
      } else if (this.finishStatus === 1) {
        return this.tableData.filter(item => item.finishStatus);
      } else {
        return this.tableData;
      }
    },
    // 组织id
    // fkOrgId() {
    //   return this.user.fkOrgId;
    // },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {
    // 侦听搜索数据的变化，请求数据
    searchData: {
      handler(newval) {
        this.tableData = [];
        if (this.searchData.planYear) {
          if (this.user.orgType !== 5) {
            if (this.searchData.fkOrgId) {
              this.getPlanList();
            }
          } else {
            this.getPlanList();
          }
        }
      },
      immediate: true,
      deep: true
    },
    modelData: {
      handler(newval) {
        if (this.dialogTableVisible) {
          api
            .getPlanAndDetailByCondition({
              ...newval,
              planType: this.planType,
              isDetail: 0
            })
            .then(res => {
              if (res.code === 200) {
                if (res.data.length) {
                  this.editTableData = res.data[0];
                  this.editTableData.planDetails = res.data[0].planDetails ? res.data[0].planDetails : [];
                  this.pkId = res.data[0].pkId;
                  // this.checkedIds = res.data[0].planDetails
                  //   ? res.data[0].planDetails
                  //       .filter(item => item.grade === 4)
                  //       .map(item => item.fkSubitemId)
                  //   : [];
                } else {
                  this.pkId = "";
                  this.editTableData = {
                    planType: this.planType,
                    ...newval
                  };
                  // this.checkedIds = [];
                }
              } else {
                this.$message.warning(res.msg);
                this.editTableData = {
                  planType: this.planType,
                  ...newval
                };
                // this.checkedIds = [];
              }
            });
        }
      },
      deep: true
    },
    isItemDetail(val) {
      if (val == 1) {
        // 请求合同选中第一个再赋值
        this.getContractList();
        //  this.searchData.isDetail =val
      } else {
        this.searchData.isDetail = val;
      }
      this.isExpand = false;
    },
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-bottom: 3px;
  .selectProBtn {
    position: absolute;
    right: 10px;
  }
}
.dialog-main {
  height: 500px;
}
.select-dialog-header {
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
  background-color: #d7d7d7;
  border: 1px solid #000;
}
.dialog-form {
  /deep/ .el-tree {
    height: 400px;
    overflow: auto;
    .label1 {
      width: 480px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .label2 {
      width: 460px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .label3 {
      width: 440px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .label4 {
      width: 400px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
  }
}
// /deep/ .el-tree-node {
//   .is-leaf + .el-checkbox .el-checkbox__inner {
//     display: inline-block;
//   }
//   .el-checkbox .el-checkbox__inner {
//     display: none;
//   }
// }
.el-form {
  display: flex;
  align-items: center;
  .el-select,
  .el-input {
    width: 180px;
  }
  .el-form-item {
    margin-bottom: 0;
  }
}
.btn-serach {
  margin-left: 20px;
  height: 28px;
}
.table-data {
  /deep/ .el-tabs__content {
    height: 90%;
  }
}
.unitQuantity {
  font-size: 12px;
  color: #ccc;
}
.contentSel {
  position: absolute;
  top: 0px;
  right: 0;
  z-index: 99;
}
.empty2 {
  margin: 0;
}
</style>
