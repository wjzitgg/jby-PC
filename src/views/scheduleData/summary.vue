<template>
  <div class="app-container">
    <div class="searchBar">
      <div>
        <span class="fs-14">截止日期</span>
        <el-date-picker size="mini" value-format="yyyy-MM-dd" v-model="endTime" :clearable="false" @change="endTimeChange"></el-date-picker>
      </div>
    </div>
    <div class="table-datas table-data">
      <div class="total">
        <div class="total-item bdt">
          <div class="total-item-title" style="background: #ffff80; color: #b8741a">开累</div>
          <div class="total-item-content">
            <div>合同金额：{{ summarizingData.contractAmount }}元</div>
            <div>已完成产值：{{ summarizingData.amount }}元</div>
            <div>已完成产值占比：{{ summarizingData.percentage }}%</div>
          </div>
        </div>
        <div class="total-item">
          <div class="total-item-title" style="background: #facd91; color: #b8741a">本年度</div>
          <div class="total-item-content">
            <div>计划产值：{{ summarizingData.yearPlanAmount }}元</div>
            <div>已完成产值：{{ summarizingData.yearAmount }} 元</div>
            <div>已完成计划占比：{{ summarizingData.yearPercentage }} %</div>
          </div>
        </div>
        <div class="total-item">
          <div class="total-item-title" style="background: #81d3f8; color: #70b603">本季度</div>
          <div class="total-item-content">
            <div>计划产值：{{ summarizingData.quarterPlanAmount }} 元</div>
            <div>已完成产值：{{ summarizingData.quarterAmount }} 元</div>
            <div>已完成计划占比：{{ summarizingData.quarterPercentage }} %</div>
          </div>
        </div>
        <div class="total-item">
          <div class="total-item-title" style="background: #80ffff; color: #c280ff">本月度</div>
          <div class="total-item-content">
            <div>计划产值：{{ summarizingData.monthlyPlanAmount }} 元</div>
            <div>已完成产值：{{ summarizingData.monthlyAmount }} 元</div>
            <div>已完成计划占比：{{ summarizingData.monthlyPercentage }} %</div>
          </div>
        </div>
      </div>
      <div class="left-table-title"><span class="ico"></span>各标段项目统计</div>
      <el-table :data="tableData" class="el-table" ref="table" row-key="pkId" height="65%" :default-expand-all="false" :tree-props="{ children: 'projectSummaryVos' }" :header-cell-style="{ background: '#f1f6ff' }">
        <el-table-column prop="name" min-width="50" show-overflow-tooltip>
          <template slot="header" slot-scope="{ row }">
            <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('table', 'isExpand', 'tableData')" v-if="user.orgType != 4"></i>
            <span :cleanRed="row">{{ labelName }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="本月度" min-width="231">
          <el-table-column align="center" prop="monthlyPlanAmount" label="计划产值" width="88"> </el-table-column>
          <el-table-column align="center" prop="monthlyAmount" label="完成产值" width="88"> </el-table-column>
          <el-table-column align="center" prop="monthlyPercentage" label="完成占比" width="88">
            <template slot-scope="{ row }">{{ row.monthlyPercentage + "%" }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本季度" min-width="231">
          <el-table-column align="center" prop="quarterPlanAmount" label="计划产值" width="88"> </el-table-column>
          <el-table-column align="center" prop="quarterAmount" label="完成产值" width="88"> </el-table-column>
          <el-table-column align="center" prop="quarterPercentage" label="完成占比" width="88">
            <template slot-scope="{ row }">{{ row.quarterPercentage + "%" }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本年度" min-width="231">
          <el-table-column align="center" prop="yearPlanAmount" label="计划产值" width="88"> </el-table-column>
          <el-table-column align="center" prop="yearAmount" label="完成产值" width="88"> </el-table-column>
          <el-table-column align="center" prop="yearPercentage" label="完成占比" width="88">
            <template slot-scope="{ row }">{{ row.yearPercentage + "%" }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" label="开累" min-width="231">
          <el-table-column align="center" prop="contractAmount" label="合同金额" width="88"> </el-table-column>
          <el-table-column align="center" prop="amount" label="完成产值" width="88"> </el-table-column>
          <el-table-column align="center" prop="percentage" label="完成占比" width="88">
            <template slot-scope="{ row }">{{ row.percentage + "%" }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column align="center" class="details-box" label="详情" width="100">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="handleOpenModel(row)" v-if="row.type==2">查看</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
      <ScheduleDialog :dialogTableVisible.sync="dialogTableVisible" :customName="nowClickData.name" :fkProjectId="nowClickData.pkId" :endTime="endTime"></ScheduleDialog>
    </div>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
import ScheduleDialog from "./components/ScheduleDialog";
export default {
  components: { Pagination, ScheduleDialog },
  data() {
    return {
      page: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      total: 0,
      endTime: "",
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
      nowClickData: {},
      dialogTableVisible: false
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    labelName() {
      if (this.user.orgType == 2) return "项目";
      if (this.user.orgType == 4) return "标段项目";
      if (this.user.orgType == 10) return "下属单位";
      if ([11, 12].includes(this.user.orgType)) return "建设单位";
    },
    falseData() {
      if ([2, 10].includes(this.user.orgType)) {
        return [{ id: 1, name: "假项目", amount: 13, contractAmount: 123, monthlyAmount: 13, monthlyPercentage: 5, monthlyPlanAmount: 123, percentage: 0, quarterAmount: 0, quarterPercentage: 0, quarterPlanAmount: 0, yearAmount: 0, yearPercentage: 0, yearPlanAmount: 0, projectSummaryVos: [{ id: 2, name: "假标段", amount: 0, contractAmount: 0, monthlyAmount: 0, monthlyPercentage: 0, monthlyPlanAmount: 0, percentage: 0, quarterAmount: 0, quarterPercentage: 0, quarterPlanAmount: 0, yearAmount: 0, yearPercentage: 0, yearPlanAmount: 0 }] }];
      }
      if (this.user.orgType == 4) {
        return [{ id: 2, name: "假标段", amount: 0, contractAmount: 0, monthlyAmount: 0, monthlyPercentage: 0, monthlyPlanAmount: 0, percentage: 0, quarterAmount: 0, quarterPercentage: 0, quarterPlanAmount: 0, yearAmount: 0, yearPercentage: 0, yearPlanAmount: 0 }];
      }
      if ([11, 12].includes(this.user.orgType)) {
        return [
          {
            id: 3,
            name: "假建设单位",
            amount: 13,
            contractAmount: 123,
            monthlyAmount: 13,
            monthlyPercentage: 5,
            monthlyPlanAmount: 123,
            percentage: 0,
            quarterAmount: 0,
            quarterPercentage: 0,
            quarterPlanAmount: 0,
            yearAmount: 0,
            yearPercentage: 0,
            yearPlanAmount: 0,
            projectSummaryVos: [{ id: 1, name: "假项目", amount: 13, contractAmount: 123, monthlyAmount: 13, monthlyPercentage: 5, monthlyPlanAmount: 123, percentage: 0, quarterAmount: 0, quarterPercentage: 0, quarterPlanAmount: 0, yearAmount: 0, yearPercentage: 0, yearPlanAmount: 0, projectSummaryVos: [{ id: 2, name: "假标段", amount: 0, contractAmount: 0, monthlyAmount: 0, monthlyPercentage: 0, monthlyPlanAmount: 0, percentage: 0, quarterAmount: 0, quarterPercentage: 0, quarterPlanAmount: 0, yearAmount: 0, yearPercentage: 0, yearPlanAmount: 0 }] }]
          }
        ];
      }
    }
  },
  mounted() {
    this.endTime = this.$moment(Date.now()).format("YYYY-MM-DD");
    this.superiorSummarySearchPage();
    this.getSuperiorSummary();
  },
  methods: {
    endTimeChange() {
      this.superiorSummarySearchPage();
      this.getSuperiorSummary();
    },
    superiorSummarySearchPage() {
      let data = {
        ...this.page,
        endTime: this.endTime
      };
      this.$api.superiorSummarySearchPage2(data).then(res => {
        if (res.code == 200) {
          if (!res.data) {
            return (this.tableData = this.falseData);
          }
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getSuperiorSummary() {
      let data = {
        engDate: this.endTime
      };
      this.$api.getSuperiorSummary(data).then(res => {
        if (res.code == 200) {
          if (!res.data) {
            return;
          }
          this.summarizingData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开模态框
    handleOpenModel(row) {
      this.nowClickData = { ...row };
      this.dialogTableVisible = true;
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        this.forArr(this[list], this[isExpand], ref);
      });
    },
    // 遍历
    forArr(arr, isExpand, ref) {
      arr.forEach(i => {
        if (!i.projectSummaryVos) {
          return;
        }
        if (!i.projectSummaryVos.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.projectSummaryVos && i.projectSummaryVos.length) {
          this.forArr(i.projectSummaryVos, isExpand, ref);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.fs-14 {
  font-size: 14px;
}
.searchBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 80px;
  background-color: #fff;
  padding: 4px 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}
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
.table-datas {
  height: calc(100% - 90px);
  background-color: #fff;
  .total {
    background-color: #f5f7fa;
    .total-item {
      display: flex;
      align-items: center;
      height: 30px;
      border-bottom: 1px solid #ccc;
      .total-item-title {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 80px;
        height: 30px;
      }
      .total-item-content {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 20px;
        // padding-right: 120px;
        div {
          width: 20%;
        }
      }
    }
    .bdt {
      border-top: 1px solid #ccc;
    }
  }
}
</style>
