<template>
  <!-- 计量汇总 -->
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
            <div class="total-item-title">合同金额</div>
            <div class="total-item-content">{{ topData.contractAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">上期末结算金额</div>
            <div class="total-item-content">{{ topData.lastSettleAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">本期结算金额</div>
            <div class="total-item-content">{{ topData.currentSettleAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">累计结算金额</div>
            <div class="total-item-content">{{ topData.settleAmount }}</div>
          </div>
        </div>
        <div class="tables">
          <el-table :tooltip-effect="'light'" height="100%" ref="tables" stripe :tree-props="{ children: 'childList' }" row-key="subOrgId" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column align="center" label="建设单位" prop="subUnitName" show-overflow-tooltip v-if="user.orgType == 11 || user.orgType == 12">
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">建设单位</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="项目" prop="subUnitName" show-overflow-tooltip v-if="user.orgType == 2">
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">项目</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="下属单位" prop="subUnitName" show-overflow-tooltip v-if="user.orgType == 10">
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">下属单位</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="标段项目" prop="subUnitName" show-overflow-tooltip v-if="user.orgType == 4" />

            <el-table-column align="center" label="合同金额" prop="contractAmount" show-overflow-tooltip />
            <el-table-column align="center" label="上期末结算金额" prop="lastSettleAmount" show-overflow-tooltip />
            <el-table-column align="center" label="本期结算金额" prop="currentSettleAmount" show-overflow-tooltip />
            <el-table-column align="center" label="累计结算金额" prop="settleAmount" show-overflow-tooltip />
            <el-table-column align="center" label="查看详情" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <el-button type="primary" size="mini" @click="check(row)" v-if="!row.childList">查看</el-button>
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
    <el-dialog title="计量信息" :visible.sync="dialogVisible" width="95%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form h-600">
        <el-table v-loading="loading" ref="tables" :tooltip-effect="'light'" :data="editData" height="596px" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column align="center" label="序号" width="60" type="index"></el-table-column>
          <el-table-column align="center" label="结算单名称" prop="settleName"></el-table-column>
          <!-- <el-table-column align="center" label="项目部" prop="proOrgName" v-if="user.orgType === 4" show-overflow-tooltip /> -->
          <!-- <el-table-column align="center" label="结算单位" prop="settleOrgName" v-if="user.orgType === 4" show-overflow-tooltip /> -->
          <el-table-column align="center" label="本期结算周期" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span>{{ row.beginDate }}~{{ row.endDate }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="本期结算日期" prop="settleDate" show-overflow-tooltip />
          <el-table-column align="center" label="上期末含税结算金额（元）" prop="lastSettleAmount" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="本期含税结算金额（元）" prop="settleAmount" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="本期末含税结算金额（元）" prop="tipSettleAmount" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="状态" prop="settleStatusStr" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="操作" width="120">
            <template slot-scope="{ row }">
              <el-button size="mini" plain @click="showDialog(row.pkId)">查看审批详情</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
    </el-dialog>
    <MyDialog :dialogVisible.sync="dialogVisibles" :dialogType="4" :orgType="user.orgType" :pkId="pkId" :settlementObject="0" :getItemOrgType="'0'" />
  </div>
</template>

<script>
import Echart from "@/components/Echart.vue";
// import PlanTable2 from "./PlanTable2.vue";
import Pagination from "@/components/tablePaging";
import MyDialog from "../settlement/components/MyDialog.vue";
export default {
  components: { Pagination, Echart, MyDialog },
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
    this.endTime = this.$moment(Date.now()).format("YYYY-MM-DD");
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
        contractAmount: "",
        currentSettleAmount: "",
        lastSettleAmount: "",
        settleAmount: ""
      },
      dialogVisibles: false,
      pkId: ""
    };
  },
  methods: {
    showDialog(pkId) {
      this.pkId = pkId;
      this.dialogVisibles = true;
    },
    endTimeChange() {
      this.init();
    },
    init() {
      this.settleSummarySearchPage();
      this.getSummaryAmount();
      // this.getSummaryPie();
    },
    //     settleSummarySearchPage: (params = {}) => httpGet({ url: "/eng/query/settleSummary/searchPage", params }), // 计量汇总分页
    // getSummaryAmount: (params = {}) => httpGet({ url: "/eng/query/settleSummary/getSummaryAmount", params }), // 计量汇总合计
    // getSummaryPie: (params = {}) => httpGet({ url: "/eng/query/settleSummary/getSummaryPie", params }) // 计量汇总饼图
    settleSummarySearchPage() {
      let data = { ...this.page };
      data.beginTime = this.endTime;
      this.$api.settleSummarySearchPage(data).then(res => {
        if (res.code == 200) {
          this.tableData = res.data == null ? [{ name: "A1", subUnitName: "单位", signDuration: "2023-12-24", contractAmount: "888", pkId: "23", childList: [{ name: "A1", pkId: "231", subUnitName: "单位", signDuration: "2023-12-24", contractAmount: "888" }] }] : res.data.records;
          this.total = res.data.total - 0;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getSummaryAmount() {
      this.$api.getSummaryAmount({ beginTime: this.endTime }).then(res => {
        if (res.code == 200) {
          this.topData =
            res.data == null
              ? {
                  contractAmount: "121",
                  currentSettleAmount: "31231",
                  lastSettleAmount: "122",
                  settleAmount: "121312"
                }
              : res.data;
          let arr = [];
          if (res.data != null) {
            res.data.settleSummaryPieVos.forEach(item => {
              arr.push({ value: item.summaryAmount, name: item.unitName });
            });
          } else {
            arr = [
              { value: 12434, name: "项目1" },
              { value: 13122213, name: "项目2" },
              { value: 1212112, name: "项目3" },
              { value: 133121214, name: "项目4" }
            ];
          }

          this.clicle = [
            {
              title: {
                text: `各${this.planTypeName}已结算金额占比`,
                left: "center",
                top: 10
              },
              tooltip: {
                trigger: "axis",
                formatter: function(params) {
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
    // getSummaryPie() {
    //   this.$api.getSummaryPie({ beginTime: this.endTime }).then(res => {
    //     if (res.code == 200) {
    //
    //     } else {
    //       this.$message.error(res.msg);
    //     }
    //   });
    // },
    check(row) {
      // return console.log(row)
      // this.nowClickData = { ...row };

      let data = {
        // contractType:1,
        pageNum: 1,
        pageSize: 100,
        orgId: row.subOrgId
      };
      this.$api.settlementSearchPage(data).then(res => {
        if (res.code == 200) {
          this.editData = res.data.records;
          this.dialogVisible = true;
        } else {
          this.$message.error(res.msg);
        }
      });
      // image.png
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
        if (!i.childList) {
          return;
        }
        if (!i.childList.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.childList && i.childList.length) {
          this.forArr(i.childList, isExpand, ref);
        }
      });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.settleSummarySearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.settleSummarySearchPage();
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
