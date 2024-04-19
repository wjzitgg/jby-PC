<template>
  <el-dialog :close-on-press-escape="false" title="进度明细" :visible="dialogTableVisible" @close="handleClose" width="68%" v-dialogDrag :close-on-click-modal="false">
    <div class="dialog-form">
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px">
          <el-form-item label="标段项目" v-if="user.orgType!=5">
            <el-input size="mini" :value="customName" disabled> </el-input>
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker size="mini" disabled value-format="yyyy-MM-dd" v-model="endTime"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-radio-group v-model="radio">
              <el-radio :label="1">分项列表</el-radio>
              <el-radio :label="2">清单项目</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
    </SearchBar>
    <!-- 表格 -->
    <div class="tables table-data">
      <el-table :tooltip-effect="'light'" style="width: 100%" ref="tables" stripe v-if="radio === 1" :header-cell-style="{ background: '#f1f6ff' }" height="100%" :tree-props="{ children: 'children' }" row-key="pkId" :key="ranKey1" :data="tableData" v-loading="loading">
        <!-- <el-table-column align="center" label="序号" type="index" width="80" /> -->
        <el-table-column align="center" label="项目编号" prop="itemCode" show-overflow-tooltip>
          <template slot="header" slot-scope="{ row }">
            <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
            <span :cleanRed="row">项目编号</span>
        </template>
        </el-table-column>
        <el-table-column align="center" label="项目名称" prop="itemName" />
        <el-table-column align="center" label="设计工程量" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span v-if="row.grade === 4">{{ row.designQuantities }}</span>
        </template>
      </el-table-column>
        <el-table-column align="center" label="设计产值" prop="designAmount" show-overflow-tooltip>
        </el-table-column>
        <el-table-column align="center" label="完成产值" prop="finishAmount" show-overflow-tooltip>
        </el-table-column>
        <el-table-column align="center" label="完成状态" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span :class="{ 'col-green': row.completionStatus == 2 }">{{ row.completionStatus == 1 ? "未完成" : row.completionStatus == 2 ? "已完成" : "" }}</span>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-tabs v-model="detailRadio" v-if="radio == 2&&tableData.length" style="height:100%">
      <el-tab-pane :label="item.itemName" :name="index + ''" v-for="(item,index) in tableData" :key="index" style="height:90%">
        <el-table :tooltip-effect="'light'" style="width: 100%" height="100%" stripe ref="tables2" :data="item.children" :key="ranKey2" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column align="center" label="序号" type="index" width="80" />
          <el-table-column align="center" label="清单名称" prop="itemName" />
          <el-table-column align="center" label="设计工程量" prop="designQuantities" show-overflow-tooltip/>
          <el-table-column align="center" label="单价" prop="price" show-overflow-tooltip>
          </el-table-column>
          <el-table-column align="center" label="设计产值" prop="designAmount" show-overflow-tooltip/>
          <el-table-column align="center" label="完成工程量" prop="completeQuantities" show-overflow-tooltip>
          </el-table-column>
          <el-table-column align="center" label="完成产值" prop="finishAmount" show-overflow-tooltip>
          </el-table-column>
          <el-table-column align="center" label="完成百分比" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span>
                {{ row.designAmount > 0 ? (((row.finishAmount - 0) / (row.designAmount - 0)) * 100).toFixed(2) + "%" : "" }}
              </span>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </el-tab-pane>
    </el-tabs>
      <div class="empty tables" style="width: 100%" v-if="radio == 2&&!tableData.length">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </div>
  </div>
  </el-dialog>
</template>

<script>
import SearchBar from "../../schedule/components/SearchBar.vue";
import api from "@/api/api";
export default {
  props: {
    dialogTableVisible: {
      type: Boolean,
      default: false
    },
    fkProjectId: {
      default: ""
    },
    customName:"",
    endTime:""
  },
  components: { SearchBar },
  data() {
    return {
      tableData: [],
      radio: 1,
      searchData: {
        isItemDetail: 0,
        isWhole: 0,
        startTime: "",
        endTime: "",
        isForm: 0
      },
      finished: "",
      options: [],
      loading: false,
      ranKey1: Math.random(),
      ranKey2: Math.random(),
      isExpand:false,
      detailRadio:""
    };
  },
  methods: {
    // 获取进度汇总表
    getScheduleList() {
      this.loading = true;
      let data = {...this.searchData}
      api
        .searchActual(data)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data;
            if(res.data.length&&this.radio==2){
              this.detailRadio='0'
            }
            this.isExpand=false
            this.ranKey1 = Math.random();
            this.ranKey2 = Math.random();
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    //   关闭弹窗
    handleClose() {
      this.isExpand=false
      this.$emit("update:dialogTableVisible", false);
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
        if(!i.children){
          return
        }
        if(!i.children.length){
          return
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.children&&i.children.length) {
          this.forArr(i.children, isExpand, ref);
        }
      });
    },
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
  },
  watch: {
    searchData: {
      handler(val) {
        if (this.dialogTableVisible) {
          this.getScheduleList();
        }
      },
      deep: true,
      immediate: true
    },
    dialogTableVisible(val) {
      if (val) {
          this.searchData = {
            ...this.searchData,
            fkProjectId: this.fkProjectId
          };
        this.getScheduleList();
      } else {
        this.searchData = {
          isItemDetail: 0,
          isWhole: 0,
          startTime: "",
          endTime: "",
          isForm: 0
        };
        this.radio = 1;
      }
    },
    radio(val) {
      this.tableData=[]
      if (val === 1) {
        this.searchData.isItemDetail = 0;
      } else {
        this.searchData.isItemDetail = 1;
      }
      this.getScheduleList();
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.el-form {
  .el-form-item {
    margin: 0;
  }
}
.tables {
  height: 500px;
}
.col-green {
  color: #70b603;
}
/deep/ .el-tabs__content{
  height: 100%;
}
</style>
