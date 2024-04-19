<template>
  <div class="tab-container" v-loading="loading">
    <div class="searchBar">
      <div>
        <span class="fs-14">计划{{ planTypeName }}</span>
        <el-select size="mini" class="wh-100" v-model="searchData.planYear" @change="endTimeChange">
          <el-option v-for="item in yearArr" :key="item" :value="item"></el-option>
        </el-select>
        <el-select size="mini" class="wh-100" v-model="searchData.planQuarter" v-if="planType === 1"  @change="endTimeChange">
          <el-option :value="1" label="一季度"></el-option>
          <el-option :value="2" label="二季度"></el-option>
          <el-option :value="3" label="三季度"></el-option>
          <el-option :value="4" label="四季度"></el-option>
        </el-select>
        <el-select size="mini" class="wh-100" v-model="searchData.planMonth" v-if="planType === 2"  @change="endTimeChange">
          <el-option v-for="item in month" :key="item.value" :value="item.value" :label="item.name"></el-option>
        </el-select>
        <!-- <el-date-picker size="mini" value-format="yyyy-MM-dd" v-model="endTime" @change="endTimeChange" :clearable="false"></el-date-picker> -->
      </div>
    </div>
    <div class="table-data">
      <div class="left-table">
        <div class="total">
          <div class="total-item">
            <div class="total-item-title">上{{ planTypeName }}计划产值</div>
            <div class="total-item-content">{{ pieData.upperAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">本{{ planTypeName }}计划产值</div>
            <div class="total-item-content">{{ pieData.nowAmount }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">累计计划产值</div>
            <div class="total-item-content">{{ pieData.amount }}</div>
          </div>
        </div>
        <div class="tables">
          <el-table :tooltip-effect="'light'" height="100%" ref="tables" stripe :tree-props="{ children: 'projectContractVos' }" row-key="pkId" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column prop="name" show-overflow-tooltip>
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables', 'isExpand', 'tableData')" v-if="user.orgType != 4"></i>
                <span :cleanRed="row">{{ labelName }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="'上' + planTypeName + '末计划产值'" prop="upperAmount" show-overflow-tooltip />
            <el-table-column align="center" :label="'本' + planTypeName + '计划产值'" prop="nowAmount" show-overflow-tooltip />
            <el-table-column align="center" label="累计计划产值" prop="amount" show-overflow-tooltip />
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
      <div v-if="clicle.length == 0" style="width: 25vw;" class="tabelsInfo-main empty">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </div>
    <el-dialog title="计划详情" :visible.sync="dialogVisible" width="70%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form h-600">
        <PlanTable2 :planType="planType" :fkOrgId="nowClickData.pkId" v-if="dialogVisible" :endData="searchData"></PlanTable2>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Echart from "@/components/Echart.vue";
import PlanTable2 from "./PlanTable2.vue";
import Pagination from "@/components/tablePaging";
export default {
  components: { Pagination, Echart, PlanTable2 },
  props: {
    //   0为年度，1为季度，2为月度
    planType: {
      type: Number
    }
  },
  computed: {
    labelName() {
      if (this.user.orgType == 2) return "项目";
      if (this.user.orgType == 4) return "标段项目";
      if ([10, 12].includes(this.user.orgType)) return "下属单位";
      if (this.user.orgType == 11) return "建设单位";
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    planTypeName() {
      return this.planType === 0 ? "年度" : this.planType === 1 ? "季度" : "月度";
    },
    falseData() {
      if ([2, 10].includes(this.user.orgType)) {
        return [{ pkId: "1", name: "假项目", upperAmount: 123, nowAmount: 123, amount: 123, projectContractVos: [{ pkId: "2", name: "假标段", upperAmount: 123, nowAmount: 123, amount: 123 }] }];
      }
      if (this.user.orgType == 4) {
        return [{ pkId: "2", name: "假标段", upperAmount: 123, nowAmount: 123, amount: 123 }];
      }
      if ([11, 12].includes(this.user.orgType)) {
        return [{ pkId: "3", name: "假建设单位", upperAmount: 123, nowAmount: 123, amount: 123, projectContractVos: [{ pkId: "1", name: "假项目", upperAmount: 123, nowAmount: 123, amount: 123, projectContractVos: [{ pkId: "2", name: "假标段", upperAmount: 123, nowAmount: 123, amount: 123 }] }] }];
      }
    },
    // 获取年份
    yearArr() {
      let arr = [];
      let nowYear = new Date().getFullYear();
      for (let i = nowYear - 3; i <= nowYear + 5; i++) {
        arr.push(i);
      }
      return arr;
    },
    // 当前季度
    nowQuarter() {
      let nowMounth = new Date().getMonth() + 1;
      if (nowMounth <= 3) return 1;
      if (nowMounth > 3 && nowMounth < 6) return 2;
      if (nowMounth > 6 && nowMounth < 9) return 3;
      if (nowMounth > 9 && nowMounth < 12) return 4;
    }
  },
  mounted() {
    // this.endTime = this.$moment(Date.now()).format("YYYY-MM-DD");
    this.searchData.planYear = new Date().getFullYear();
    if (this.planType === 1) {
      let nowMonth = new Date().getMonth() + 1;
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
    this.summaryPlanSearchPage();
    this.getPlanPie();
  },
  data() {
    return {
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      searchData:{
        planYear:"",
        planQuarter:"",
        planMonth:"",
      },
      clicle: [],
      loading: false,
      dialogVisible: false,
      nowClickData: {},
      tableData: [],
      pieData: {
        amount: 0,
        planPieListVos: [],
        upperAmount: 0,
        nowAmount: 0
      },
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
      ]
    };
  },
  methods: {
    endTimeChange() {
      this.summaryPlanSearchPage();
      this.getPlanPie();
    },
    summaryPlanSearchPage() {
      let data = {
        ...this.page,
        planType: this.planType,
        ...this.searchData
      };
      this.$api.summaryPlanSearchPage(data).then(res => {
        if (res.code === 200) {
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
    getPlanPie() {
      let data = {
        planType: this.planType,
        ...this.searchData
      };
      this.$api.getPlanPie(data).then(res => {
        if (res.code == 200) {
        //   if (!res.data) {
        //     let arr = [
        //       { value: Math.floor(Math.random() * 1000), name: "Search Engine3" },
        //       { value: Math.floor(Math.random() * 1000), name: "Search Engine2" },
        //       { value: Math.floor(Math.random() * 1000), name: "Direct2" },
        //       { value: Math.floor(Math.random() * 1000), name: "Search Engine" },
        //       { value: Math.floor(Math.random() * 1000), name: "Direct" },
        //       { value: Math.floor(Math.random() * 1000), name: "Email" },
        //       { value: Math.floor(Math.random() * 1000), name: "Union Ads" },
        //       { value: Math.floor(Math.random() * 1000), name: "Video Ads" }
        //     ];
        //     this.clicle = [
        //       {
        //         title: {
        //           text: `各项目${this.planTypeName}计划产值占比`,
        //           left: "center",
        //           top: 10
        //         },
        //         tooltip: {
        //           trigger: "item"
        //         },
        //         legend: {
        //           data: arr.map(item => item.name),
        //           left: "center",
        //           bottom: 0
        //         },
        //         series: [
        //           {
        //             name: `各项目${this.planTypeName}计划产值占比`,
        //             type: "pie",
        //             radius: "60%",

        //             data: arr,
        //             label: {
        //               formatter: "{d}%",
        //               emphasis: {
        //                 show: true,
        //                 textStyle: {
        //                   fontSize: "16",
        //                   position: "inner",
        //                   fontWeight: "bold"
        //                 }
        //               }
        //             }
        //           }
        //         ]
        //       }
        //     ];
        //     return;
        //   }
          this.pieData = res.data;
          let arr = res.data.planPieListVos.map(item => ({ name: item.name, value: item.nowAmount }));
          if(arr.length){
            this.clicle = [
            {
              title: {
                text: `各项目${this.planTypeName}计划产值占比`,
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
                  name: `各项目${this.planTypeName}计划产值占比`,
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
          }else{
            this.clicle=[]
          }
          
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    check(row) {
      this.nowClickData = { ...row };
      this.dialogVisible = true;
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.summaryPlanSearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.summaryPlanSearchPage();
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
