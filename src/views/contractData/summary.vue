<template>
  <!-- 合同汇总 -->
  <div class="tab-container" v-loading="loading">
    <div class="searchBar">
      <div>
        <span class="fs-14">截止日期</span>
        <el-date-picker size="mini" value-format="yyyy-MM-dd" v-model="endTime" :clearable="false" @change="endTimeChange"></el-date-picker>
      </div>
    </div>
    <div class="table-data">
      <div class="left-table">
        <div class="total">
          <div class="total-item">
            <div class="total-item-title">上年度末合同金额</div>
            <div class="total-item-content">{{ topData.upperYearAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">本年度末合同金额</div>
            <div class="total-item-content">{{ topData.yearAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">累计合同金额</div>
            <div class="total-item-content">{{ topData.amount }}</div>
          </div>
        </div>
        <div class="tables">
          <el-table :tooltip-effect="'light'" height="100%" ref="tables" stripe :tree-props="{ children: 'projectContractVos' }" row-key="pkId" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column align="center" label="建设单位" prop="name" show-overflow-tooltip v-if="user.orgType == 11 || user.orgType == 12">
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">建设单位</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="项目" prop="name" show-overflow-tooltip  v-if="user.orgType == 2||user.orgType == 3">
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">项目</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="下属单位" prop="name" show-overflow-tooltip v-if="user.orgType == 10">
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">下属单位</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="标段项目" prop="name" show-overflow-tooltip v-if="user.orgType == 4"></el-table-column>
            <el-table-column align="center" label="合同单位" prop="contractOrgName" show-overflow-tooltip />
            <el-table-column align="center" label="签署工期" prop="signDuration" show-overflow-tooltip />
            <el-table-column align="center" label="合同金额" prop="contractAmount" show-overflow-tooltip />
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
    <el-dialog :title="editTitle" :visible.sync="dialogVisible" width="70%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form h-600">
        <el-table :data="editData" ref="tables" stripe height="595px" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column align="center" label="序号" width="80" type="index" />
          <el-table-column align="center" prop="contractName" label="合同名称">
            <template slot-scope="{ row }">
              <div class="ellipsistwo">{{ row.contractName }}</div>
            </template>
          </el-table-column>
          <!-- <el-table-column align="center" prop="fkProjectName" label="项目" v-if="[2, 3, 9].includes(user.orgType)" show-overflow-tooltip> </el-table-column> -->
          <!-- <el-table-column align="center" prop="projectName" label="标段项目" v-if="user.orgType != 5" show-overflow-tooltip> </el-table-column> -->
          <!-- <el-table-column align="center" prop="orgName" label="项目部" v-if="id !== 2 && user.orgType !== 5" show-overflow-tooltip> </el-table-column> -->
          <!-- <el-table-column align="center" prop="superiorOrgName" label="施工单位" v-if="id === 1 && user.orgType !== 5" show-overflow-tooltip> </el-table-column> -->
          <el-table-column align="center" prop="customerOrgName" label="建设单位" show-overflow-tooltip> </el-table-column>
          <!-- <el-table-column align="center" prop="orgName" label="监理公司" v-if="(id === 2 && user.orgType !== 3) || (id === 2 && user.orgType === 4)" show-overflow-tooltip> </el-table-column> -->
          <!-- <el-table-column align="center" prop="customerOrgName" label="供货商" v-if="id === 3 && user.orgType !== 6" show-overflow-tooltip> </el-table-column> -->
          <!-- <el-table-column align="center" prop="customerOrgName" label="分包单位" v-if="id === 4 && user.orgType !== 7" show-overflow-tooltip> </el-table-column> -->
          <el-table-column align="center" prop="signDate" label="合同签订日期" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="beginDate" label="施工开始日期" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="endDate" label="施工完成日期" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="amount" label="合同金额" show-overflow-tooltip>
            <template slot-scope="{ row }">
              {{ !pricePermission ? "***" : row.amount }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="enableStatus" label="状态">
            <template slot-scope="{ row }">
              <span v-if="row.enableStatus">已终止</span>
              <span v-else>正常</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="80">
            <template slot-scope="{ row }">
              <el-button plain size="mini" @click="handleOpen(row)" type="primary">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <Pagination :pageSize="query.pageSize" :total="total" :currentPage="query.pageNum" @handleSizeChange="querySizeChange" @handleCurrentChange="queryCurrentChange" />
        <!-- <PlanTable2 :planType="planType" :fkOrgId="nowClickData.fkOrgId"></PlanTable2> -->
      </div>
    </el-dialog>
    <ContractDialog :dialogVisible.sync="dialogVisibles" :dialogShowType="1" :id="1" :typeStatus="true" :user="$store.state.user" ref="ContractDialog" />
  </div>
</template>

<script>
import Echart from "@/components/Echart.vue";
// import PlanTable2 from "./PlanTable2.vue";
import Pagination from "@/components/tablePaging";
import ContractDialog from "../contract/components/ContractDialog.vue";
export default {
  components: { Pagination, Echart, ContractDialog },
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
        amount: "",
        upperYearAmount: "",
        yearAmount: ""
      },
      editTitle: "",
      query: {
        pageNum: 1,
        pageSize: 10,
        fkProjectBidId: ""
      },
      dialogVisibles: false
    };
  },
  methods: {
    endTimeChange() {
      this.init();
    },
    init() {
      this.summaryContractSearchPage();
      this.contractPie();
    },
    summaryContractSearchPage() {
      let data = { ...this.page };
      data.engDate = this.endTime;
      this.$api.summaryContractSearchPage(data).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.total = res.data == null ? 1 : res.data.total - 0;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    contractPie() {
      this.$api.contractPie({ engDate: this.endTime }).then(res => {
        if (res.code == 200) {
          this.topData = res.data;
          let arr = [];
          if (res.data != null) {
            res.data.contractPieListVos.forEach(item => {
              arr.push({ value: item.contractAmount, name: item.name });
            });
          }
          if (res.data == null) {
            this.topData = {
              amount: "1255",
              upperYearAmount: "12131",
              yearAmount: "131341212"
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
                text: `各${this.planTypeName}合同金额占比`,
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
       console.log(row,"0o000000000000000000000000")
      this.nowClickData = { ...row };
      // this.editData = [row];
      // return console.log(row)
      this.editTitle = "合同信息-" + row.name;
      this.query.fkProjectBidId = row.pkId;
      this.searchContractPage();
      this.dialogVisible = true;
    },
    // pageSize改变
    querySizeChange(val) {
      this.query.pageSize = val;
      this.searchContractPage();
    },
    // current改变
    queryCurrentChange(val) {
      this.query.pageNum = val;
      this.searchContractPage();
    },
    searchContractPage() {
      this.$api.searchContractPage(this.query).then(res => {
        if (res.code == 200) {
          this.editData = res.data.records;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleOpen(row) {
      // return console.log(row)
      this.dialogVisibles = true;
      this.$refs.ContractDialog.initialization(row);
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
        if (!i.projectContractVos) {
          return;
        }
        if (!i.projectContractVos.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.projectContractVos && i.projectContractVos.length) {
          this.forArr(i.projectContractVos, isExpand, ref);
        }
      });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.summaryContractSearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.summaryContractSearchPage();
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
