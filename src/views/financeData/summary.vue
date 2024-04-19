<template>
  <!-- 财务汇总 -->
  <div class="tab-container" v-loading="loading">
    <div class="searchBar">
      <div>
        <span class="fs-14">汇总周期</span>
        <el-date-picker size="mini" value-format="yyyy-MM-dd" :clearable="false" v-model="endTime" @change="endTimeChange"></el-date-picker>
        <span class="fs-14">至今</span>
      </div>
    </div>
    <div class="table-data">
      <div class="left-table">
        <div class="total">
          <div class="total-item">
            <div class="total-item-title">累计结算金额</div>
            <div class="total-item-content">{{ topData.accumulateSettleAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">上期末已付金额</div>
            <div class="total-item-content">{{ topData.upperPayAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">本期支付金额</div>
            <div class="total-item-content">{{ topData.payAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">累计已付金额</div>
            <div class="total-item-content">{{ topData.accumulatePayAmount }}</div>
          </div>
        </div>
        <div class="tables">
          <el-table :tooltip-effect="'light'" height="100%" ref="tables" stripe :tree-props="{ children: 'summaryFinanceVos' }" row-key="pkId" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
            <!-- <el-table-column align="center" label="建设单位" prop="projectName" show-overflow-tooltip v-if="user.orgType == 11 || user.orgType == 12" />
            <el-table-column align="center" label="项目" prop="projectName" show-overflow-tooltip v-if="user.orgType == 2" />
            <el-table-column align="center" label="下属单位" prop="projectName" show-overflow-tooltip v-if="user.orgType == 10" /> -->
            <el-table-column align="center" label="标段项目" prop="name" show-overflow-tooltip>
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" v-if="user.orgType != 4" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">{{ user.orgType == 4 ? "标段项目" : "下属单位" }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="累计结算金额" prop="accumulateSettleAmount" show-overflow-tooltip />
            <el-table-column align="center" label="上期末已付金额" prop="upperPayAmount" show-overflow-tooltip />
            <el-table-column align="center" label="本期支付金额" prop="payAmount" show-overflow-tooltip />
            <el-table-column align="center" label="累计已付金额" prop="accumulatePayAmount" show-overflow-tooltip />
            <el-table-column align="center" label="查看详情" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <el-button type="primary" size="mini" @click="check(row)" v-if="row.type==2">查看</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
      </div>
      <Echart v-if="clicle.length != 0" :option="clicle[0]" echartName="clicle" :mystyle="'width: 25vw;height: 26vw;'" />
      <div v-if="clicle.length == 0" style="width: 25vw" class="tabelsInfo-main empty">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </div>
    <el-dialog title="财务信息" :visible.sync="dialogVisible" width="85%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form h-600">
        <el-tabs v-model="customType" @tab-click="customTypeChange">
          <el-tab-pane label="供应商支付往来" name="3"></el-tab-pane>
          <el-tab-pane label="分包商支付往来" name="4"></el-tab-pane>
        </el-tabs>
        <el-table :data="editData" ref="tables" stripe height="595px" :header-cell-style="{ background: '#f1f6ff' }" :tree-props="{ children: 'childList' }" row-key="pkId">
          <el-table-column align="center" label="序号" width="80" type="index"></el-table-column>
          <el-table-column align="center" prop="customName" :label="customType == 3 ? '供应商' : '分包单位'" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="stageName" label="期次名称" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="paymentCodeStr" :label="customType == 3 ? '支付方式' : '收款方式'" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="payChannel" :label="customType == 3 ? '支付单号' : '收款单号'" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="payTime" :label="customType == 3 ? '支付日期' : '收款日期'" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="totalSettlementAmount" label="累计支付金额" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="payBalanceFront" label="上期末结算金额" show-overflow-tooltip> </el-table-column>
          <!-- <el-table-column align="center" prop="payBalanceFront" label="上期末累计付款" show-overflow-tooltip> </el-table-column> -->
          <el-table-column align="center" prop="totalUnpaidAmount" label="当前应收金额" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="payAmount" label="本期收款" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="payBalanceAfter" label="本期末累计收款" show-overflow-tooltip> </el-table-column>
          <!-- <el-table-column align="center" prop="amount" label="合同金额(元)" show-overflow-tooltip /> -->
          <el-table-column label="操作" align="center" width="250px">
            <template slot-scope="{ row }">
              <el-button plain size="mini" type="primary" @click="openDialog(row)" v-has="'finance:subcontractor:query'">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <Pagination :pageSize="query.pageSize" :total="queryTotal" :currentPage="query.pageNum" @handleSizeChange="querySizeChange" @handleCurrentChange="queryCurrentChange" />
      </div>
    </el-dialog>
    <payDialog :tableType="2" :dialogTitle="dialogTitle" :id="sendId" :dialogType="1" :dialogVisible="dialogVisibles" @close="closeDialog"></payDialog>
  </div>
</template>
  
  <script>
import Echart from "@/components/Echart.vue";
// import PlanTable2 from "./PlanTable2.vue";
import Pagination from "@/components/tablePaging";
import payDialog from "../finance/component/payDialog.vue";
export default {
  components: { Pagination, Echart, payDialog },
  props: {
    //   0为年度，1为季度，2为月度
    // planType: {
    //   type: Number
    // }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    planTypeName() {
      // return :this.user.orgType ==12?"单位"
      if (this.user.orgType == 11 || this.user.orgType == 12 || this.user.orgType == 10) {
        return "单位";
      }
      if (this.user.orgType == 2) {
        return "项目";
      }
      if (this.user.orgType == 4) {
        return "标段";
      } else {
        return "项目";
      }
      return;
    },
    pricePermission() {
      let arr = this.$store.state.menuData.filter(item => item.menuCode == "schedule");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    }
  },
  mounted() {
    // this.endTime = this.$moment(Date.now()).format("YYYY-MM-DD");
    this.getMouthTime();

    this.init();
  },
  data() {
    return {
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      endTime: "",
      clicle: [],
      loading: false,
      dialogVisible: false,
      nowClickData: {},
      tableData: [],
      editData: [],
      topData: {
        accumulatePayAmount: "",
        accumulateSettleAmount: "",
        payAmount: "",
        upperPayAmount: ""
      },
      bidProjectId: "",
      customType: "3",
      dialogVisibles: false,
      sendId: "",
      dialogTitle: "",
      query: {
        pageNum: 1,
        pageSize: 10
      },
      queryTotal:0
    };
  },
  methods: {
    getMouthTime() {
      let nowDate = new Date();
      let date = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        date: nowDate.getDate(),
      };
      // 当前日期
      let systemDate = date.year + "-" + date.month + "-" + date.date;
      let beforedate = new Date(nowDate);
      beforedate.setDate(nowDate.getDate() - 30);
      // 30天前
      let systemDateBegin = `${beforedate.getFullYear()}-${beforedate.getMonth() + 1 < 10 ? `0${beforedate.getMonth() + 1}` : beforedate.getMonth() + 1}-${beforedate.getDate()}`;
      let arr = [systemDateBegin, systemDate]
      this.endTime = systemDateBegin
    },
    openDialog(row) {
      this.dialogTitle = "查看支付";
      this.sendId = row.pkId;
      this.dialogVisibles = true;
    },
    closeDialog() {
      this.dialogVisibles = false;
    },
    endTimeChange() {
      this.init();
    },
    init() {
      this.superiorSummarySearchPage();
      this.superiorSummaryReality();
    },
    superiorSummarySearchPage() {
      let data = { ...this.page };
      data.beginDate = this.endTime;
      this.$api.superiorSummarySearchPage(data).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.total = res.data == null ? 1 : res.data.total - 0;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    superiorSummaryReality() {
      this.$api.superiorSummaryReality({ beginDate: this.endTime }).then(res => {
        if (res.code == 200) {
          this.topData = res.data;
          let arr = [];

          if (res.data != null) {
            res.data.financePieListVos.forEach(item => {
              arr.push({ value: item.accumulatePayAmount, name: item.name });
            });
          }

          if (res.data == null) {
            this.topData = {
              accumulatePayAmount: "12123",
              accumulateSettleAmount: "1333",
              payAmount: "343434",
              upperPayAmount: "1212123"
            };
            arr = [
              { value: 12434, name: "项目1" },
              { value: 1313, name: "项目2" },
              { value: 1212, name: "项目3" },
              { value: 1334, name: "项目4" }
            ];
          }
          this.clicle = [
            {
              title: {
                text: `各${this.planTypeName}已付金额占比`,
                left: "center",
                top: 10
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
                data: arr.map(item => item.name),
                left: "center",
                bottom: 0
              },
              series: [
                {
                  name: "Access From",
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
          this.$message.error(res.msg);
        }
      });
    },
    check(row) {
      this.nowClickData = { ...row };
      this.editData = [];
      this.bidProjectId = row.pkId;
      this.financeSearchPage();
    },
    customTypeChange() {
      this.financeSearchPage();
    },
    // pageSize改变
    querySizeChange(val) {
      this.query.pageSize = val;
      this.financeSearchPage();
    },
    // current改变
    queryCurrentChange(val) {
      this.query.pageNum = val;
      this.financeSearchPage();
    },
    financeSearchPage() {
      let data = {
        // pageNum: 1,
        // pageSize: 10,
        ...this.query,
        bidProjectId: this.bidProjectId,
        customType: this.customType,
        beginTime:this.endTime
      };
      data;
      this.$api.financeSearchPage(data).then(res => {
        if (res.code == 200) {
          this.editData = res.data.records;
          this.queryTotal = res.data.total -0
          this.dialogVisible = true;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        console.log(this[list]);
        this.forArr(this[list], this[isExpand], ref);
      });
    },
    forArr(arr, isExpand, ref) {
      arr.forEach(i => {
        if (!i.summaryFinanceVos) {
          return;
        }
        if (!i.summaryFinanceVos.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.summaryFinanceVos && i.summaryFinanceVos.length) {
          this.forArr(i.summaryFinanceVos, isExpand, ref);
        }
      });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.superiorSummarySearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.superiorSummarySearchPage();
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
.table-data {
  display: flex;
  height: calc(95% - 90px);
  .left-table {
    width: 1110px;
    .total {
      display: flex;
      height: 120px;
      background-color: #f2f2f2;
      .total-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .total-item-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .total-item-content {
          font-size: 18px;
          color: #f59a23;
        }
      }
    }
    .tables {
      height: calc(100% - 180px);
    }
  }
}
.empty {
  margin: 100px 0;
  text-align: center;
  img {
    width: 280px;
  }
}
.h-600 {
  min-height: 600px;
}
</style>
  