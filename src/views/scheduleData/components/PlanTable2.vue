<template>
  <div class="tab-container" v-loading="loading">
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px">
          <!-- <el-form-item label="年份" v-if="true">
            <el-select size="mini" class="wh-100" v-model="searchData.planYear">
              <el-option v-for="item in yearArr" :key="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="季度" v-if="planType === 1">
            <el-select size="mini" class="wh-100" v-model="searchData.planQuarter">
              <el-option :value="1" label="一季度"></el-option>
              <el-option :value="2" label="二季度"></el-option>
              <el-option :value="3" label="三季度"></el-option>
              <el-option :value="4" label="四季度"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="月份" v-if="planType === 2">
            <el-select size="mini" class="wh-100" v-model="searchData.planMonth">
              <el-option v-for="item in month" :key="item.value" :value="item.value" :label="item.name"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item>
            <el-radio-group v-model="isItemDetail" @change="radioChange">
              <el-radio :label="0">按分项列表</el-radio>
              <el-radio :label="1">按清单项目</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
    </SearchBar>
    <!-- 表格 -->
    <div class="table-data">
      <!-- 分项列表 -->
      <el-table :tooltip-effect="'light'" height="99%" ref="tables" stripe v-show="isItemDetail === 0" @expand-change="expandChange" :tree-props="{ children: 'children' }" row-key="fkSubitemId" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
        <el-table-column align="center" prop="itemCode" show-overflow-tooltip>
          <template slot="header" slot-scope="{ row }">
            <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
            <span :cleanRed="row">项目编号</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="项目名称" prop="itemName" show-overflow-tooltip />
        <el-table-column align="center" label="单位" prop="unitName" show-overflow-tooltip />
        <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设计工程量" prop="planQuantities" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ row.planQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="合同金额" prop="designAmount" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span>{{ row.designAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="planType == 1 ? '上季度末计划' : planType == 2 ? '上月度末计划' : '上年度末计划'" prop="planQuantities" show-overflow-tooltip>
          <el-table-column align="center" label="工程量" prop="upperPlanFinishQuantities" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span v-if="row.grade === 4">{{ row.upperPlanFinishQuantities }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="产值" prop="upperAmount" show-overflow-tooltip> </el-table-column>
        </el-table-column>
        <el-table-column align="center" :label="planType == 1 ? '上季度末已完成' : planType == 2 ? '上月度末已完成' : '上年度末已完成'" prop="planQuantities" show-overflow-tooltip>
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
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <div style="height:100%;position: relative;" v-if="isItemDetail === 1">
        <el-select v-model="contractId" size="mini" @change="contentChange" class="contentSel">
          <el-option v-for="item in contractList" :key="item.pkId" :label="item.contractName" :value="item.pkId"> </el-option>
        </el-select>
        <el-tabs v-model="detailRadio" v-if="tableData.length" style="height:100%;">
          <el-tab-pane :label="item.chapterName" :name="item.pkId" v-for="(item, index) in tableData" :key="index" style="height:100%">
            <el-table :tooltip-effect="'light'" style="width: 100%" :key="detailRadio" stripe height="98%" :data="item.planDetails" :header-cell-style="{ background: '#f1f6ff' }" :show-summary="true" :summary-method="getSummaries">
              <el-table-column align="center" label="子目号" prop="itemCode" width="80" show-overflow-tooltip />
              <el-table-column align="center" label="清单项目名称" prop="itemName"> </el-table-column>
              <el-table-column align="center" label="单位" prop="unitName" show-overflow-tooltip />
              <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip>
              </el-table-column>
              <el-table-column align="center" label="合同工程量" prop="planQuantities" show-overflow-tooltip>
              </el-table-column>
              <el-table-column align="center" label="合同金额" prop="designAmount" show-overflow-tooltip>
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
        <div class="empty empty2" style="width: 100%;height:100%;" v-if="isItemDetail === 1 && !tableData.length">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchBar from "../../schedule/components/SearchBar.vue";
import api from "@/api/api";
export default {
  components: { SearchBar },
  props: {
    //   0为年度，1为季度，2为月度
    planType: {
      type: Number
    },
    endData:"",
    fkOrgId:""
  },
  data() {
    return {
      tableData: [],
      // 模态框数据
      editTableData: {
        planDetails: []
      },
      //计划id
      pkId: "",
      radio: 0,
      searchData: {
        planYear: "",
        planQuarter: "",
        planMonth: "",
        isDetail: 0,
      },
      isItemDetail: 0, //0为分享列表，1为工程细目
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
      checkedIds: [],
      loading: false,
      filterText: "",
      details: [],
      isExpand: false,
      detailRadio: "",
      contractList: [],
      contractId: ""
    };
  },
  created() {
    // this.searchData.planYear = new Date().getFullYear();
    // if (this.planType === 1) {
    //   let nowMonth = new Date().getMonth() + 1;
    //   if ([1, 2, 3].includes(nowMonth)) {
    //     this.searchData.planQuarter = 1;
    //   } else if ([4, 5, 6].includes(nowMonth)) {
    //     this.searchData.planQuarter = 2;
    //   } else if ([7, 8, 9].includes(nowMonth)) {
    //     this.searchData.planQuarter = 3;
    //   } else if ([10, 11, 12].includes(nowMonth)) {
    //     this.searchData.planQuarter = 4;
    //   }
    // }
    // if (this.planType === 2) {
    //   this.searchData.planMonth = new Date().getMonth() + 1;
    // }
    this.getPlanList();
  },
  methods: {
    radioChange(){
      if(this.isItemDetail==1){
        this.getContractList()
      }
      this.getPlanList()
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
    getContractList() {
      this.$api.searchContracts({ contractType: 1, fkProjectId: this.fkOrgId }).then(res => {
        if (res.code == 200) {
          this.contractList = res.data;
          if (res.data.length) {
            this.contractId = res.data[0].pkId;
            this.searchData.isDetail = 1;
            this.getPlanList();
          }
        }
      });
    },
    // 获取计划表
    getPlanList() {
      let data = {
        ...this.searchData,
        planType: this.planType,
        fkOrgId:this.fkOrgId
      };
      if(this.endData){
        data.planYear= this.endData.planYear
        data.planQuarter= this.endData.planQuarter
        data.planMonth= this.endData.planMonth
      }
      if (this.isItemDetail === 1) {
        data.contractId = this.contractId;
      }
      this.loading = true;
      api.getPlanAndDetailByCondition(data).then(res => {
          if (res.code === 200) {
            if (res.data.length) {
              if (this.isItemDetail === 1) {
                this.tableData = res.data[0].planChapterVos ? res.data[0].planChapterVos : [];
                this.detailRadio = this.tableData[0].pkId;
              } else {
                this.tableData = res.data[0].planDetails ? res.data[0].planDetails : [];
              }
            } else {
              this.pkId = "";
            }
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        console.log(this[list]);
        this.forArr(this[list], this[isExpand], ref);
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
  },
  computed: {
    // // 获取年份
    // yearArr() {
    //   let arr = [];
    //   let nowYear = new Date().getFullYear();
    //   for (let i = nowYear - 3; i <= nowYear + 5; i++) {
    //     arr.push(i);
    //   }
    //   return arr;
    // },
    // // 当前季度
    // nowQuarter() {
    //   let nowMounth = new Date().getMonth() + 1;
    //   if (nowMounth <= 3) return 1;
    //   if (nowMounth > 3 && nowMounth < 6) return 2;
    //   if (nowMounth > 6 && nowMounth < 9) return 3;
    //   if (nowMounth > 9 && nowMounth < 12) return 4;
    // },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
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
  height: 500px;
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
