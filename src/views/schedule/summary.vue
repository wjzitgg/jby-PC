<template>
  <div class="app-container" v-loading="loading">
    <!-- 头部tab栏 -->
    <el-tabs v-model="topRadio" v-if="user.orgType === 5">
      <el-tab-pane label="分包单位" name="1"></el-tab-pane>
      <el-tab-pane label="工区" name="2"></el-tab-pane>
    </el-tabs>
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px">
          <el-form-item label="项目" v-if="(user.orgType === 2 || user.orgType === 3 || user.orgType === 9) && Echartradio !== 3">
            <el-select v-model="proId" size="mini" class="wh-200" @change="proChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标段项目" v-if="user.orgType !== 5 && Echartradio != 3">
            <el-select size="mini" class="wh-200" v-model="projectIds" @change="proBidChange" :disabled="[2, 3, 9].includes(user.orgType) && !proId">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分包单位" v-if="user.orgType === 5 && topRadio == 1 && Echartradio != 3">
            <el-select size="mini" multiple collapse-tags class="wh-200" v-model="customerIds" @change="subChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in subOption" :key="item.fkCustomId" :value="item.fkCustomId" :label="item.customName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工区" v-if="user.orgType === 5 && topRadio == 2 && Echartradio != 3">
            <el-select size="mini" multiple collapse-tags class="wh-200" v-model="workAreaIds" @change="areaChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in areaOption" :key="item.pkId" :value="item.pkId" :label="item.areaName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="截止日期">
            <!-- <el-date-picker size="mini" class="wh-200" value-format="yyyy-MM-dd" v-model="searchData.startTime"></el-date-picker>
            <span>至</span> -->
            <el-date-picker size="mini" @change="endTimeChange" class="wh-200" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
          </el-form-item>
          <!-- <el-form-item label="展示方式">
            <el-select size="mini" class="wh-100" v-model="showType">
              <el-option label="表格" :value="1"></el-option>
              <el-option label="图表" :value="2"></el-option>
            </el-select>
          </el-form-item> -->
        </el-form>
      </template>
      <template slot="right">
        <!-- <el-radio-group v-model="radio" v-show="showType === 1">
          <el-radio :label="1">产值汇总</el-radio>
          <el-radio :label="2">清单项目汇总</el-radio>
        </el-radio-group> -->
        <el-radio-group v-model="Echartradio" v-show="showType === 2">
          <el-radio :label="3">饼图</el-radio>
          <el-radio :label="1">柱形图</el-radio>
          <el-radio :label="2">折线图</el-radio>
        </el-radio-group>
      </template>
    </SearchBar>
    <!-- 表格 -->
    <!-- <div v-if="showType === 1" class="h-80per table-data">
      <el-table v-if="radio === 1" ref="tables1" :data="tableData" :show-summary="showSummary" :summary-method="getSummaries1" stripe height="100%" :header-cell-style="{ background: '#f1f6ff' }" :key="tableKey1">
        <el-table-column align="center" prop="fkProjectName" label="项目" v-if="[2, 3].includes(user.orgType)"> </el-table-column>
        <el-table-column align="center" prop="projectName" label="标段项目" v-if="user.orgType !== 5"> </el-table-column>
        <el-table-column align="center" prop="orgName" :label="labelName" v-if="user.orgType === 5" />
        <el-table-column align="center" prop="designAmount" label="设计产值" />
        <el-table-column align="center" prop="finishAmount" label="已完成产值">
          <template slot-scope="{ row }">
            {{ !pricePermission ? "***" : row.finishAmount }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="完成百分比">
          <template slot-scope="{ row }">
            <span>{{ row.designAmount ? (((row.finishAmount - 0) / (row.designAmount - 0)) * 100).toFixed(2) + "%" : "0%" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="handleOpenModel(row)" v-has="'schedule:summary:query'">查看明细</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-table v-if="radio === 2" ref="tables2" :data="tableData" :show-summary="showSummary" :summary-method="getSummaries2" :span-method="objectSpanMethod" :header-cell-style="{ background: '#f1f6ff' }" stripe style="width: 100%; margin-top: 20px" height="100%" :key="tableKey2">
        <el-table-column align="center" :prop="labelName == '项目部' ? 'fkProjectName' : 'orgName'" :label="labelName" />
        <el-table-column align="center" prop="itemName" label="清单名称" />
        <el-table-column align="center" prop="designNumber" label="设计工程量" />
        <el-table-column align="center" prop="price" label="单价">
          <template slot-scope="{ row }">
            {{ !pricePermission ? "***" : row.price }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="designAmount" label="设计产值" />
        <el-table-column align="center" prop="finishNumber" label="已完成工程量">
          <template slot-scope="{ row }">
            {{ !pricePermission ? "***" : row.finishNumber }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="完成工程量百分比">
          <template slot-scope="{ row }">
            <span>{{ row.designNumber > 0 ? (((row.finishNumber - 0) / (row.designNumber - 0)) * 100).toFixed(2) + "%" : "0%" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="finishAmount" label="已完成产值">
          <template slot-scope="{ row }">
            {{ !pricePermission ? "***" : row.finishAmount }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="完成产值百分比">
          <template slot-scope="{ row }">
            <span>{{ row.designAmount > 0 ? (((row.finishAmount - 0) / (row.designAmount - 0)) * 100).toFixed(2) + "%" : "0%" }}</span>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div> -->
    <!-- 图表 -->
    <div v-if="showType === 2" class="echart">
      <div>
        <div v-show="Echartradio === 1" class="echart-item">
          <el-form ref="form" label-width="80px" class="yearSel">
            <el-form-item label="年份">
              <el-select size="mini" class="wh-100" v-model="searchData.year">
                <!-- <el-option v-for="item in yearArr" :key="item" :value="item"></el-option> -->
                <el-option v-for="item in timeArr" :key="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <!-- v-for="item in bar" :key="item.pkId" -->
          <Echart :option="bar[0]" echartName="bar" :mystyle="'width: 80vw;height: 30vw;margin: 20px auto'" />
        </div>
        <div v-show="Echartradio === 2" class="echart-item">
          <el-form ref="form" label-width="80px" class="yearSel">
            <el-form-item label="年份">
              <el-select size="mini" class="wh-100" v-model="searchData.year">
                <!-- <el-option v-for="item in yearArr" :key="item" :value="item"></el-option> -->
                <el-option v-for="item in timeArr" :key="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <!-- v-for="item in line" :key="item.pkId" :option="item" -->
          <Echart :option="line[0]" echartName="line" :mystyle="'width: 80vw;height: 30vw;margin: 20px auto'" />
        </div>
        <div>
          <div v-show="Echartradio === 3" class="echart-item echart-item2">
            <div class="left-table">
              <div class="left-table-title"><span class="ico"></span> 项目<span v-if="user.orgType === 5">部</span>汇总</div>
              <div class="left-table-box">
                <div style="line-height: 30px; border-bottom: 1px solid #d7d7d7">
                  <div class="left-table-item" style="background: #ffff80; color: #b8741a">{{ user.orgType === 5 ? "开累" : "总" }}</div>
                  <div class="left-table-center">合同金额：{{ summarizingData.contractAmount }}元</div>
                  <div class="left-table-center">已完成产值：{{ summarizingData.amount }}元</div>
                  <div class="left-table-center">已完成产值占比：{{ summarizingData.percentage }}%</div>
                </div>
                <div style="line-height: 30px; border-bottom: 1px solid #d7d7d7">
                  <div class="left-table-item" style="background: #facd91; color: #b8741a">本年度</div>
                  <div class="left-table-center">计划产值：{{ summarizingData.yearPlanAmount }}元</div>
                  <div class="left-table-center">已完成产值：{{ summarizingData.yearAmount }} 元</div>
                  <div class="left-table-center">已完成计划占比：{{ summarizingData.yearPercentage }} %</div>
                </div>
                <div style="line-height: 30px; border-bottom: 1px solid #d7d7d7">
                  <div class="left-table-item" style="background: #81d3f8; color: #70b603">本季度</div>
                  <div class="left-table-center">计划产值：{{ summarizingData.quarterPlanAmount }} 元</div>
                  <div class="left-table-center">已完成产值：{{ summarizingData.quarterAmount }} 元</div>
                  <div class="left-table-center">已完成计划占比：{{ summarizingData.quarterPercentage }} %</div>
                </div>
                <div style="line-height: 30px; border-bottom: 1px solid #d7d7d7">
                  <div class="left-table-item" style="background: #80ffff; color: #c280ff">本月度</div>
                  <div class="left-table-center">计划产值：{{ summarizingData.monthlyPlanAmount }} 元</div>
                  <div class="left-table-center">已完成产值：{{ summarizingData.monthlyAmount }} 元</div>
                  <div class="left-table-center">已完成计划占比：{{ summarizingData.monthlyPercentage }} %</div>
                </div>
              </div>
              <div class="left-table-title" v-if="user.orgType === 5"><span class="ico"></span><span v-show="topRadio == 1">各分包单位统计</span> <span v-show="topRadio == 2">各工区汇总</span></div>
              <div class="left-table-title" v-else><span class="ico"></span>各标段项目统计</div>
              <el-table :data="tableData" class="el-table" ref="table" row-key="id" height="70%" :default-expand-all="false" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" highlight-current-row @row-click="handleRowClick">
                <!-- @row-click="handleRowClick"  -->
                <el-table-column v-if="user.orgType === 5" align="center" prop="name" :label="topRadio == 1 ? '分包单位' : '工区'" min-width="80" show-overflow-tooltip fixed> </el-table-column>
                <el-table-column v-if="user.orgType !== 5 && user.orgType !== 4" align="center" prop="projectName" label="项目" min-width="50" show-overflow-tooltip fixed> </el-table-column>
                <el-table-column v-if="user.orgType !== 5&& user.orgType !== 4" align="center" prop="projectBidName" label="标段项目" min-width="77" show-overflow-tooltip> </el-table-column>
                <el-table-column v-if="user.orgType !== 5&& user.orgType == 4" align="center" prop="projectBidName" label="标段项目" min-width="77" show-overflow-tooltip fixed> </el-table-column>
                <!-- <el-table-column v-if="topRadio==2" align="center" prop="date" label="工区" width="80"> </el-table-column> -->
                <el-table-column align="center" label="本月度" min-width="231">
                  <el-table-column align="center" prop="monthlyPlanAmount" label="计划产值" width="100"> </el-table-column>
                  <el-table-column align="center" prop="monthlyAmount" label="完成产值" width="100"> </el-table-column>
                  <el-table-column align="center" prop="monthlyPercentage" label="完成占比" width="100">
                    <template slot-scope="{ row }">{{ row.monthlyPercentage + "%" }}</template>
                  </el-table-column>
                </el-table-column>
                <el-table-column align="center" label="本季度" min-width="231">
                  <el-table-column align="center" prop="quarterPlanAmount" label="计划产值" width="100"> </el-table-column>
                  <el-table-column align="center" prop="quarterAmount" label="完成产值" width="100"> </el-table-column>
                  <el-table-column align="center" prop="quarterPercentage" label="完成占比" width="100">
                    <template slot-scope="{ row }">{{ row.quarterPercentage + "%" }}</template>
                  </el-table-column>
                </el-table-column>
                <el-table-column align="center" label="本年度" min-width="231">
                  <el-table-column align="center" prop="yearPlanAmount" label="计划产值" width="100"> </el-table-column>
                  <el-table-column align="center" prop="yearAmount" label="完成产值" width="100"> </el-table-column>
                  <el-table-column align="center" prop="yearPercentage" label="完成占比" width="100">
                    <template slot-scope="{ row }">{{ row.yearPercentage + "%" }}</template>
                  </el-table-column>
                </el-table-column>
                <el-table-column align="center" label="开累" min-width="231">
                  <el-table-column align="center" prop="contractAmount" label="合同金额" width="100"> </el-table-column>
                  <el-table-column align="center" prop="amount" label="完成产值" width="100"> </el-table-column>
                  <el-table-column align="center" prop="percentage" label="完成占比" width="100">
                    <template slot-scope="{ row }">{{ row.percentage + "%" }}</template>
                  </el-table-column>
                </el-table-column>
                <el-table-column align="center" class="details-box" label="详情" min-width="60" fixed="right">
                  <template slot-scope="{ row }">
                    <!-- <el-button size="mini" @click.stop="handleOpenModel(row)" v-if="row.name != '其他'" v-has="'schedule:summary:query'">查看</el-button> -->
                    <div class="btn-details" @click.stop="handleOpenModel(row)" v-if="row.name != '其他'" v-has="'schedule:summary:query'">查看</div>
                  </template>
                </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                  <img src="@/assets/empty.svg" class="zanwu" />
                  <span>暂无数据</span>
                </div>
              </el-table>
            </div>
            <!-- v-for="item in clicle" :key="item.pkId" :option="item" -->
            <Echart v-if="clicle.length != 0" :option="clicle[0]" echartName="clicle" :mystyle="'width: 25vw;height: 29vw;'" />
            <div v-else style="width: 25vw" class="tabelsInfo-main empty">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="tabelsInfo-main empty" v-else>
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div> -->
    </div>
    <!-- 模态框 -->
    <ScheduleDialog :dialogTableVisible.sync="dialogTableVisible" :labelName="labelName" :customName="customName" :fkProjectId="fkProjectId" :fkWorkAreaId="fkWorkAreaId" :fkCustomerId="fkCustomerId" :showType="topRadio - 0" />
  </div>
</template>

<script>
import SearchBar from "./components/SearchBar.vue";
import ScheduleDialog from "./components/ScheduleDialog";
import Echart from "@/components/Echart.vue";
import api from "@/api/api";
import Template from "../sms/template.vue";
export default {
  components: { SearchBar, ScheduleDialog, Echart, Template },
  data() {
    return {
      tableData: [],
      options: [],
      proOptions: [],
      areaOption: [],
      subOption: [],
      radio: 1,
      Echartradio: 3,
      showType: 2,
      topRadio: "1",
      // 模态框
      dialogTableVisible: false,
      Ids: [],
      searchData: {
        isForm: 0,
        isItemDetail: 0,
        isWhole: 1,
        startTime: "",
        endTime: "",
        isWholeProject: 1,
        isWholeBid: 1,
        year: ""
      },
      proId: "",
      projectIds: "",
      workAreaIds: [""],
      customerIds: [""],
      fkProjectId: "",
      fkWorkAreaId: "",
      fkCustomerId: "",
      // Echart图表
      finishedSche: [],
      noFinishedSche: [],
      // 环形图
      clicle: [],
      // 柱状图
      bar: [],
      // 线形图
      line: [],
      loading: false,
      customName: "",
      showSummary: false,
      tableKey1: Math.random(),
      tableKey2: Math.random(),
      spanArr: [],
      pos: "",
      startTime: "",
      summarizingData: {
        amount: 0,
        contractAmount: 0,
        monthlyAmount: 0,
        monthlyPercentage: 0,
        monthlyPlanAmount: 0,
        percentage: 0,
        quarterAmount: 0,
        quarterPercentage: 0,
        quarterPlanAmount: 0,
        yearAmount: 0,
        yearPercentage: 0,
        yearPlanAmount: 0
      },
      summarizingStatus: false,
      tableArr1: [],
      tableArr2: [],
      designData: [],
      finishData: [],
      timeArr: [],
      itemName: "",
      itemId: ""
    };
  },
  created() {
    if (this.user.orgType !== 5) {
      this.superiorSummaryPie();
      this.superiorSummaryListPie();
    } else {
      this.projectSummaryPie();
    }
    this.topRadio = "1";
    // this.getBySpecial();
  },
  methods: {
    endTimeChange() {
      this.searchSummaryDates();
    },
    searchSummaryDates() {
      let data = {
        fkProjectIds: this.projectIds,
        endTime: this.searchData.endTime
      };
      this.$api.searchSummaryDates(data).then(res => {
        if (res.code == 200) {
          console.log("时间-------------------------------------------");
          console.log(res);
          this.timeArr = res.data;
          console.log("时间-------------------------------------------");
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    columnarInt() {
      if (this.user.orgType == 5) {
        this.projectSummary();
      } else {
        this.superiorSummary();
      }
    },
    projectSummary() {
      let data = {
        type: this.topRadio == 1 ? 0 : 1,
        endTime: this.searchData.endTime,
        ids: this.topRadio == 1 ? this.customerIds.join() : this.workAreaIds.join(),
        year: this.searchData.year
      };
      this.$api.projectSummary(data).then(res => {
        if (res.code == 200) {
          this.designData = [];
          this.finishData = [];
          // alert("2222222")
          if (res.data != null) {
            // res.data.forEach(item => {
            this.designData = res.data[0].design;
            this.finishData = res.data[0].finish;
            // });
          } else {
            this.designData = [12, 323, 423, 23, 234, 23, 23, 42, 23, 23, 42, 23];
            this.finishData = [123, 12, 12, 31, 12, 12, 432, 43, 123, 23, 23, 23];
          }
          this.$nextTick(() => {
            this.drawEchart();
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    superiorSummary() {
      let data = {
        projectIds: this.proId,
        endTime: this.searchData.endTime,
        projectBidIds: this.projectIds,
        year: this.searchData.year
      };
      this.$api.superiorSummary(data).then(res => {
        if (res.code == 200) {
          this.designData = [];
          this.finishData = [];
          if (res.data != null) {
            this.designData = res.data.design;
            this.finishData = res.data.finish;
            // alert("111")
          } else {
            this.designData = [12, 323, 423, 23, 234, 23, 23, 42, 23, 23, 42, 23];
            this.finishData = [123, 12, 12, 31, 12, 12, 432, 43, 123, 23, 23, 23];
          }
          this.$nextTick(() => {
            this.drawEchart();
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    superiorSummaryPie() {
      let data = {
        endTime: this.searchData.endTime
      };
      this.$api.superiorSummaryPie(data).then(res => {
        if (res.code == 200) {
          this.summarizingData = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    superiorSummaryListPie() {
      let data = {
        endTime: this.searchData.endTime
      };
      this.$api.superiorSummaryListPie(data).then(res => {
        if (res.code == 200) {
          this.itemName = "各标段完成产值占比";

          let arr1 = [];
          let arr2 = [];
          if (res.data.length > 10) {
            res.data.forEach((item, index) => {
              item.id = index;
              if (index < 9 || index == 9) {
                arr1.push(item);
              }
              if (index > 9) {
                arr2.push(item);
              }
            });
            this.tableData = arr1;

            let monthlyPlanAmount = 0;
            let monthlyAmount = 0;
            let monthlyPercentage = 0;
            let quarterPlanAmount = 0;
            let quarterAmount = 0;
            let quarterPercentage = 0;
            let yearPlanAmount = 0;
            let yearAmount = 0;
            let yearPercentage = 0;
            let contractAmount = 0;
            let amount = 0;
            let percentage = 0;
            arr2.forEach(item => {
              monthlyPlanAmount = monthlyPlanAmount + item.monthlyPlanAmount;
              monthlyAmount = monthlyAmount + item.monthlyAmount;
              monthlyPercentage = monthlyPercentage + item.monthlyPercentage;
              quarterPlanAmount = quarterPlanAmount + item.quarterPlanAmount;
              quarterAmount = quarterAmount + item.quarterAmount;
              quarterPercentage = quarterPercentage + item.quarterPercentage;
              yearPlanAmount = yearPlanAmount + item.yearPlanAmount;
              yearAmount = yearAmount + item.yearAmount;
              yearPercentage = yearPercentage + item.yearPercentage;
              contractAmount = contractAmount + item.contractAmount;
              amount = amount + item.amount;
              percentage = percentage + item.percentage;
            });
            this.tableData.push({ name: "其他", projectName: "其他", projectBidName: "其他", monthlyPlanAmount: monthlyPlanAmount, monthlyAmount: monthlyAmount, monthlyPercentage: monthlyPercentage, quarterPlanAmount: quarterPlanAmount, quarterAmount: quarterAmount, quarterPercentage: quarterPercentage, yearPlanAmount: yearPlanAmount, yearAmount: yearAmount, yearPercentage: yearPercentage, contractAmount: contractAmount, amount: amount, percentage: percentage, children: arr2, id: "12854" });
          } else {
            this.tableData = res.data;
          }

          this.tableArr1 = [];
          this.tableArr2 = [];
          this.tableData.forEach(item => {
            this.tableArr1.push(item.projectBidName);
            this.tableArr2.push({ value: item.amount, name: item.projectBidName });
          });

          this.drawEchart();
        } else {
          this.$message.error(res.mg);
        }
      });
    },
    projectSummaryPie() {
      let data = {
        type: this.topRadio == 1 ? 0 : 1,
        endTime: this.searchData.endTime
      };
      this.summarizingStatus = false;
      this.$api.projectSummaryPie(data).then(res => {
        if (res.code == 200) {
          this.itemName = this.topRadio == 1 ? "各分包单位完成产值占比" : "各工区完成产值占比";
          this.summarizingData = res.data;
          let arr1 = [];
          let arr2 = [];
          if (res.data.projectSummaryVos.length > 10) {
            res.data.projectSummaryVos.forEach((item, index) => {
              if (index < 9 || index == 9) {
                arr1.push(item);
              }
              if (index > 9) {
                arr2.push(item);
              }
            });
            this.tableData = arr1;

            let monthlyPlanAmount = 0;
            let monthlyAmount = 0;
            let monthlyPercentage = 0;
            let quarterPlanAmount = 0;
            let quarterAmount = 0;
            let quarterPercentage = 0;
            let yearPlanAmount = 0;
            let yearAmount = 0;
            let yearPercentage = 0;
            let contractAmount = 0;
            let amount = 0;
            let percentage = 0;
            arr2.forEach(item => {
              monthlyPlanAmount = monthlyPlanAmount + item.monthlyPlanAmount;
              monthlyAmount = monthlyAmount + item.monthlyAmount;
              monthlyPercentage = monthlyPercentage + item.monthlyPercentage;
              quarterPlanAmount = quarterPlanAmount + item.quarterPlanAmount;
              quarterAmount = quarterAmount + item.quarterAmount;
              quarterPercentage = quarterPercentage + item.quarterPercentage;
              yearPlanAmount = yearPlanAmount + item.yearPlanAmount;
              yearAmount = yearAmount + item.yearAmount;
              yearPercentage = yearPercentage + item.yearPercentage;
              contractAmount = contractAmount + item.contractAmount;
              amount = amount + item.amount;
              percentage = percentage + item.percentage;
            });
            this.tableData.push({ name: "其他", projectName: "其他", projectBidName: "其他", monthlyPlanAmount: monthlyPlanAmount, monthlyAmount: monthlyAmount, monthlyPercentage: monthlyPercentage, quarterPlanAmount: quarterPlanAmount, quarterAmount: quarterAmount, quarterPercentage: quarterPercentage, yearPlanAmount: yearPlanAmount, yearAmount: yearAmount, yearPercentage: yearPercentage, contractAmount: contractAmount, amount: amount, percentage: percentage, children: arr2, id: "12854" });
          } else {
            this.tableData = res.data.projectSummaryVos;
          }
          // this.tableData = res.data == null ? [] : res.data.projectSummaryVos;
          this.tableArr1 = [];
          this.tableArr2 = [];
          this.tableData.forEach(item => {
            this.tableArr1.push(item.name);
            this.tableArr2.push({ value: item.amount, name: item.name });
          });
          this.drawEchart();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleRowClick(row) {
      console.log(row);
      if (row.name == "其他") {
        return console.log(row);
      }
      if (this.user.orgType !== 5) {
        if (this.itemId == row.projectBidId) {
          this.setCurrent();
          this.itemId = "";
          return;
        }
        this.itemName = row.projectBidName + "-各清单产值完成占比";
        this.itemId = row.projectBidId;
        this.superiorDetailPie(row.projectBidId);
      } else {
        if (this.itemId == row.pkId) {
          this.setCurrent();
          this.itemId = "";
          return;
        }
        this.itemName = row.name + "-各清单产值完成占比";
        this.itemId = row.pkId;
        this.projectDetailPie(row.pkId);
      }
    },
    setCurrent() {
      this.$refs.table.setCurrentRow();
      if (this.user.orgType !== 5) {
        this.superiorSummaryListPie();
      } else {
        this.projectSummaryPie();
      }
    },
    projectDetailPie(id) {
      let data = {
        id: id,
        type: this.topRadio == 1 ? 0 : 1,
        endTime: this.searchData.endTime
      };
      this.$api.projectDetailPie(data).then(res => {
        if (res.code == 200) {
          this.tableArr1 = [];
          this.tableArr2 = [];
          res.data.forEach(item => {
            this.tableArr1.push(item.detailName);
            this.tableArr2.push({ value: item.amount, name: item.detailName });
          });
          this.drawEchart();
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    superiorDetailPie(id) {
      let data = {
        projectBidId: id
      };
      this.$api.superiorDetailPie(data).then(res => {
        if (res.code == 200) {
          this.tableArr1 = [];
          this.tableArr2 = [];
          res.data.forEach(item => {
            this.tableArr1.push(item.detailName);
            this.tableArr2.push({ value: item.finishAmount, name: item.detailName });
          });
          this.drawEchart();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getBySpecial() {
      let data = {};
      if (this.user.orgType != 5) {
        data.projectBidId = this.projectIds;
      }
      if (![4, 5].includes(this.user.orgType)) {
        data.projectId = this.proId;
      }
      this.$api.getBySpecial(data).then(res => {
        if (res.code == 200) {
          this.startTime = res.data.filter(item => item.key == "projectBeginTime")[0].name;
        }
      });
    },
    // 获取进度汇总表
    // getScheduleList(isDraw) {
    //   this.loading = true;
    //   api
    //     .getScheduleAndSumByCondition({ ...this.searchData })
    //     .then(res => {
    //       if (res.code === 200) {
    //         this.showSummary = false;
    //         // this.tableData = res.data;
    //         if (this.radio == 2) {
    //           let id = this.topRadio == 1 ? "fkCustomerId" : this.topRadio == 2 ? "fkWorkAreaId" : "fkProjectId";
    //           this.getSpanArr(res.data, id);
    //         }
    //         this.$nextTick(() => {
    //           if (this.showType === 2) {
    //             this.drawEchart();
    //           } else {
    //             this.tableKey1 = Math.random();
    //             this.tableKey2 = Math.random();
    //             this.showSummary = true;
    //           }
    //         });
    //         if (this.$refs.tables1) {
    //           this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
    //         }
    //         if (this.$refs.tables2) {
    //           this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
    //         }
    //         // if(isDraw){
    //         //   this.drawEchart();
    //         // }
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //       this.loading = false;
    //     })
    //     .catch(err => {
    //       this.loading = false;
    //       console.error(err);
    //     });
    // },
    // 获取项目部
    // getAllProject() {
    //   api.getItemListByCustom().then(res => {
    //     if (res.code === 200) {
    //       this.options = res.data;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 获取所有项目部
    // getAllProject() {
    //   this.$api.getAllProjectInfo().then(res => {
    //     if (res.code === 200) {
    //       if ([2, 3, 9].includes(this.user.orgType)) {
    //         this.options = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
    //       } else {
    //         this.proOptions = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
    //       }
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "") {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.fkBidProjectId, label: item.fkBidProjectName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 选择项目部
    proChange(e) {
      this.projectIds = "";
      delete this.searchData.projectIds;
      if (e) {
        this.searchData = { ...this.searchData, isWholeProject: 0, isWholeBid: 1, fkProjectId: e };
        this.allListBidByProId(0, e);
      } else {
        delete this.searchData.fkProjectId;
        this.searchData = { ...this.searchData, isWhole: 1, isWholeProject: 1, isWholeBid: 1 };
      }
      this.getBySpecial();
    },
    // 获取分包单位
    getSubList() {
      api.findCustomByUserId().then(res => {
        if (res.code === 200) {
          this.subOption = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取工区
    getAreaList() {
      api.findWorkAreasByUserId().then(res => {
        if (res.code === 200) {
          this.areaOption = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 改变项目部
    proBidChange() {
      this.searchSummaryDates();
      if (this.projectIds.length) {
        let index = this.projectIds.findIndex(item => item === "");
        if (this.projectIds[this.projectIds.length - 1] === "") {
          this.projectIds = [""];
          delete this.searchData.projectIds;
          this.searchData = {
            ...this.searchData,
            isWhole: 1,
            isWholeBid: 1
          };
        } else {
          if (index !== -1) {
            this.projectIds.splice(index, 1);
          }
          this.searchData = {
            ...this.searchData,
            isWhole: 0,
            isWholeBid: 0,
            projectIds: this.projectIds
          };
        }
      } else {
        delete this.searchData.projectIds;
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          isWholeBid: 1,
          customerOrWorkArea: 0
        };
      }
      this.getBySpecial();
      // if (this.showType === 2) {
      //   this.drawEchart();
      // }
    },
    // 改变分包单位
    subChange() {
      if (this.customerIds.length) {
        let index = this.customerIds.findIndex(item => item === "");
        if (this.customerIds[this.customerIds.length - 1] === "") {
          this.customerIds = [""];
          delete this.searchData.customerIds;
          this.searchData = {
            ...this.searchData,
            isWhole: 1,
            customerOrWorkArea: 0
          };
        } else {
          if (index !== -1) {
            this.customerIds.splice(index, 1);
          }
          this.searchData = {
            ...this.searchData,
            isWhole: 0,
            customerIds: this.customerIds.join(","),
            customerOrWorkArea: 0
          };
        }
      } else {
        delete this.searchData.customerIds;
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 0
        };
      }
      // if (this.showType === 2) {
      //   this.drawEchart();
      // }
    },
    // 工区变化
    areaChange() {
      if (this.workAreaIds.length) {
        let index = this.workAreaIds.findIndex(item => item === "");
        if (this.workAreaIds[this.workAreaIds.length - 1] === "") {
          this.workAreaIds = [""];
          delete this.searchData.workAreaIds;
          this.searchData = {
            ...this.searchData,
            isWhole: 1,
            customerOrWorkArea: 1
          };
        } else {
          if (index !== -1) {
            this.workAreaIds.splice(index, 1);
          }
          this.searchData = {
            ...this.searchData,
            isWhole: 0,
            workAreaIds: this.workAreaIds.join(","),
            customerOrWorkArea: 1
          };
        }
      } else {
        delete this.searchData.workAreaIds;
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 1
        };
      }
      // if (this.showType === 2) {
      //   this.drawEchart();
      // }
    },
    //总价
    getSummaries1(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        let arr = [];
        if ([4, 5].includes(this.user.orgType)) {
          arr = [1, 2];
        } else if ([2, 3].includes(this.user.orgType)) {
          arr = [2, 3];
        }
        if (!this.pricePermission) {
          return (sums[index] = "***");
        } else {
          if (arr.includes(index)) {
            const values = data.map(item => item[column.property]);
            if (!values.every(value => isNaN(value))) {
              sums[index] =
                values
                  .reduce((prev, curr) => {
                    const value = Number(curr);
                    if (!isNaN(value)) {
                      return prev + curr;
                    } else {
                      return prev;
                    }
                  }, 0)
                  .toFixed(6) - 0;
            } else {
              sums[index] = "NaN";
            }
          }
        }
        if ([4, 5].includes(this.user.orgType) && index === 3) {
          sums[index] = sums[1] > 0 ? ((sums[2] / sums[1]) * 100).toFixed(2) + "%" : "0%";
        }
        if ([2, 3].includes(this.user.orgType) && index === 4) {
          sums[index] = sums[2] > 0 ? ((sums[3] / sums[2]) * 100).toFixed(2) + "%" : "0%";
        }
      });
      return sums;
    },
    getSummaries2(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (!this.pricePermission) {
          return (sums[index] = "***");
        } else {
          if ([4, 7].findIndex(item => item === index) !== -1) {
            const values = data.map(item => item[column.property]);
            if (!values.every(value => isNaN(value))) {
              sums[index] =
                values
                  .reduce((prev, curr) => {
                    const value = Number(curr);
                    if (!isNaN(value)) {
                      return prev + curr;
                    } else {
                      return prev;
                    }
                  }, 0)
                  .toFixed(6) - 0;
            } else {
              sums[index] = "NaN";
            }
          }
        }
        if (index === 8) {
          sums[index] = sums[4] > 0 ? ((sums[7] / sums[4]) * 100).toFixed(2) + "%" : "0%";
        }
      });
      return sums;
    },
    // 合并行
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          // [0,0] 表示这一行不显示， [2,1]表示行的合并数
          rowspan: _row,
          colspan: _col
        };
      }
    },
    // 筛选合并行的数组
    getSpanArr(data, id) {
      // data就是我们从后台拿到的数据
      this.spanArr = [];
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1);
          this.pos = 0;
        } else {
          // 判断当前元素与上一个元素是否相同
          if (data[i][id] === data[i - 1][id]) {
            this.spanArr[this.pos] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            this.pos = i;
          }
        }
      }
    },
    // 打开模态框
    handleOpenModel(row) {
      console.log("Xxxxxxxxxx1111xxxxxxxxxxx");
      console.log(row);
      console.log("Xxxxxxxxxx1111xxxxxxxxxxx");
      if (this.user.orgType == 5) {
        if (this.topRadio == 1) {
          // return alert("11111111111")
          this.fkCustomerId = row.pkId;
          this.customName = row.name;
        } else if (this.topRadio == 2) {
          this.fkWorkAreaId = row.pkId;
          this.customName = row.name;
        } else {
          this.fkProjectId = row.pkId;
          this.customName = row.name;
        }
      } else {
        if (this.topRadio == 1) {
          // alert("1111111111")
          this.fkWorkAreaId = row.pkId;
          this.customName = row.name;
        } else if (this.topRadio == 2) {
          // alert("22222222222")
          this.fkWorkAreaId = row.pkId;
          this.customName = row.name;
        } else {
          // alert("3333333333")
          this.fkWorkAreaId = row.pkId;
          this.customName = row.name;
        }
      }

      this.dialogTableVisible = true;
    },
    // 更新echart
    drawEchart() {
      let that = this;
      if (this.Echartradio === 1) {
        // 因为tableData没更改就直接渲染echart，所以需要延时器，nextTick不行
        // setTimeout(() => {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        console.log(this.designData);
        console.log(this.finishData);
        console.log(this.bar);
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        this.tableData = [{ pkId: 11 }];
        this.bar = this.tableData.map(item => {
          return {
            pkId: item.pkId,
            title: {
              text: item.orgName ? item.orgName : "全部汇总表",
              left: "center"
            },
            tooltip: {
              trigger: "axis",
              formatter: function (params) {
                var res = params[0].name + "<br/>";
                params.forEach(item => {
                  res += `${item.seriesName}:${!that.pricePermission ? "***" : item.value}<br/>`;
                });
                return res;
              }
            },
            legend: {
              data: ["计划完成产值", "实际完成产值"],
              orient: "vertical",
              left: "left"
            },
            xAxis: [
              {
                type: "category",
                axisTick: { show: false },
                data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
              }
            ],
            yAxis: [{ type: "value" }],
            series: [
              {
                name: "实际完成产值",
                type: "bar",
                data: that.finishData
              },
              {
                name: "计划完成产值",
                type: "bar",
                data: that.designData
              }
            ]
          };
        });
        // }, 200);
      } else if (this.Echartradio === 2) {
        // setTimeout(() => {
        this.tableData = [{ pkId: 11 }];
        console.log(1);
        this.line = this.tableData.map(item => {
          return {
            pkId: item.pkId,
            title: {
              text: item.orgName ? item.orgName : "全部汇总表",
              left: "center"
            },
            tooltip: {
              trigger: "axis",
              formatter: function (params) {
                var res = params[0].name + "<br/>";
                params.forEach(item => {
                  res += `${item.seriesName}:${!that.pricePermission ? "***" : item.value}<br/>`;
                });
                return res;
              }
            },
            legend: {
              data: ["计划完成产值", "已完成产值"],
              orient: "vertical",
              left: "left",
              itemWidth: 24,
              itemHeight: 18
            },
            grid: {
              left: "3%",
              right: "4%",
              bottom: "3%",
              containLabel: true
            },
            xAxis: {
              type: "category",
              boundaryGap: false,
              data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
            },
            yAxis: { type: "value" },
            series: [
              {
                name: "已完成产值",
                type: "line",
                stack: "Total",
                data: that.finishData
              },
              {
                name: "计划完成产值",
                type: "line",
                stack: "Total",
                data: that.designData
              }
            ]
          };
        });
        // }, 200);
      } else if (this.Echartradio === 3) {
        // setTimeout(() => {
        // let tableArr = []
        // if(this.summarizingStatus == false){
        //   // tableArr = this.testList.filter(item => item.name);
        //  this.tableData.forEach(item=>{
        //   tableArr.push(item.name)
        //  })
        // }
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        console.log(that.tableArr1);
        console.log(that.tableArr2);
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        let arr = this.tableData.map(item => ({ name: item.name, value: item.amount }));
        if (arr.length) {
          // this.clicle = this.tableData.map(item => {
          //   return {
          //     pkId: item.pkId,
          //     title: {
          //       text: that.itemName,
          //       left: "center",
          //       top: 10
          //     },

          //     tooltip: {
          //       trigger: "axis",
          //       formatter: function (params) {
          //         var res = params[0].name + "<br/>";
          //         params.forEach(item => {
          //           res += `${item.seriesName}:${!that.pricePermission ? "***" : item.value}<br/>`;
          //         });
          //         return res;
          //       }
          //     },

          //     legend: {
          //       data: that.tableArr1,
          //       // data: ["未完成产值", "已完成产值"],
          //       // orient: "vertical",
          //       left: "center",
          //       bottom: 0
          //     },
          //     legend: {
          //       data: arr.map(item => item.name),
          //       left: "center",
          //       bottom: 0
          //     },
          //     series: [
          //       {
          //         name: "Access From",
          //         type: "pie",
          //         radius: "60%",
          //         data: that.tableArr2,
          //         label: {
          //           formatter: "{d}%",
          //           emphasis: {
          //             show: true,
          //             textStyle: {
          //               fontSize: "16",
          //               position: "inner",
          //               fontWeight: "bold"
          //             }
          //           }
          //         }
          //       }
          //     ]
          //   };
          // });
          this.clicle = [
            {
              title: {
                text: `${this.itemName}`,
                left: "center",
                top: 10
              },
              tooltip: {
                trigger: "item"
              },
              legend: {
                data: arr.map(item => item.name),
                left: "center",
                bottom: 0
              },
              series: [
                {
                  name: `${this.itemName}`,
                  type: "pie",
                  radius: "60%",

                  data: arr,
                  label: {
                    formatter: "{d}%",
                    emphasis: {
                      show: true,
                      textStyle: {
                        fontSize: "16",
                        position: "inner",
                        fontWeight: "bold"
                      }
                    }
                  }
                }
              ]
            }
          ];
        } else {
          this.clicle = [];
        }

        // }, 200);
      }
    }
  },
  computed: {
    pricePermission() {
      let arr = this.$store.state.menuData.filter(item => item.menuCode == "schedule");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    },
    labelName() {
      if (this.topRadio == 1) return "分包单位";
      if (this.topRadio == 2) return "工区";
      return "项目部";
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    // 获取年份
    yearArr() {
      let arr = [];
      let nowYear = new Date().getFullYear();
      let start = "";
      let end = "";
      if (this.searchData.startTime) {
        start = new Date(this.searchData.startTime).getFullYear();
      } else {
        start = this.startTime ? new Date(this.startTime).getFullYear() : nowYear;
      }
      if (this.searchData.endTime) {
        end = new Date(this.searchData.endTime).getFullYear();
      } else {
        end = nowYear - 0 + 5;
      }
      for (let i = start; i <= end; i++) {
        arr.push(i);
      }
      return arr;
    }
  },
  watch: {
    topRadio(val) {
      this.Echartradio = 3;
      delete this.searchData.customerIds;
      delete this.searchData.workAreaIds;
      delete this.searchData.projectIds;
      if (val == 1) {
        this.getSubList();
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 0
        };
      } else if (val == 2) {
        this.getAreaList();
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 1
        };
      } else {
        // this.getAllProject();
      }
    },
    searchData: {
      handler(val) {
        // this.getScheduleList(!!this.searchData.isForm);
        //
        if (this.Echartradio == 3) {
          if (this.user.orgType !== 5) {
            this.superiorSummaryPie();
            this.superiorSummaryListPie();
          } else {
            this.projectSummaryPie();
          }
        } else {
          this.columnarInt();
        }
      },
      deep: true
    },
    showType(val) {
      if (val === 1) {
        this.searchData.isForm = 0;
        this.searchData.year = "";
      } else {
        this.searchData.isForm = 1;
        this.Echartradio = 1;
        this.searchData.year = new Date().getFullYear();
      }
    },
    radio(val) {
      if (val === 1) {
        this.searchData.isItemDetail = 0;
      } else {
        this.searchData.isItemDetail = 1;
      }
    },
    Echartradio(val, oldval) {
      if (val == 3) {
        this.searchData.year = "";
        this.searchData.isForm = 2;
      } else if (this.showType == 2) {
        this.searchData.isForm = 1;
        this.searchData.year = new Date().getFullYear();
      }
      if (val == 1 || val == 2) {
        this.columnarInt();
        this.searchSummaryDates();
      }
    }
    // tableData: {
    //   deep: true,
    //   handler(val) {
    //     if (this.showType === 2) {
    //       this.drawEchart();
    //     }
    //   }
    // }
  }
};
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 0;
}
.echart {
  width: 100%;
  height: 630px;
  overflow: auto;
  background-color: #fff;
}
.echart-item {
  position: relative;
  width: 1690px;
  height: 100%;
  display: flex;
  // justify-content: space-evenly;
  flex-wrap: wrap;
  margin: 0 auto;
  .yearSel {
    position: absolute;
    left: 180px;
    top: 10px;
    z-index: 5;
  }
  .left-table {
    width: 1125px;
    .left-table-title {
      background: #d7d7d7;
      line-height: 30px;
      .ico {
        background: #80ffff;
        display: inline-block;
        margin: 4px 4px 0px 8px;
        height: 15px;
        width: 6px;
      }
    }
    .left-table-box {
      background: #f5f7fa;
      font-size: 16px;
    }
    .left-table-item {
      display: inline-block;
      width: 100px;
      text-align: center;
    }
    .left-table-center {
      display: inline-block;
      width: 300px;
    }
  }
  ::-webkit-scrollbar {
    width: 5px;
    color: #fff;
    background-color: #fcfcfc;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgb(209, 209, 209);
  }
}
.echart-item2{
  width: 100%;
}
.empty {
  margin: 100px 0;
  text-align: center;
  img {
    width: 280px;
  }
}
/deep/.el-select {
  .el-select__tags-text {
    max-width: 100px;
  }
}
.h-80per {
  height: 80%;
}
/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
/deep/ .el-table tr:hover {
  cursor: pointer;
}
.btn-details {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.btn-details:hover {
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  color: #1890ff;
}
/deep/ .gutter {
  border: none !important;
}

/deep/ .el-table_1_column_18 {
  border-right: 0;
}
/deep/ th {
  &:nth-child(6) {
    border-right: 0 !important;
  }
}
/deep/ .el-table_5_column_66 {
  border-right: 0 !important;
}
</style>
