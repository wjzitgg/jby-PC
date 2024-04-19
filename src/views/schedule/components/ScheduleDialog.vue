<template>
  <el-dialog :close-on-press-escape="false" :title="`${labelName}进度明细`" :visible="dialogTableVisible" @close="handleClose" width="68%" v-dialogDrag :close-on-click-modal="false">
    <div class="dialog-form">
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px" v-model="searchData">
          <el-form-item :label="labelName" v-if="user.orgType==5">
            <el-input size="mini" class="wh-100" :value="customName" disabled> </el-input>
          </el-form-item>
          <el-form-item label="项目部" v-if="user.orgType!=5">
            <el-input size="mini" class="wh-100" :value="customName" disabled> </el-input>
          </el-form-item>
          <!-- <el-form-item label="完成状态">
            <el-select size="mini" class="wh-120" v-model="finished">
              <el-option value="" label="全部"></el-option>
              <el-option :value="0" label="未完成"></el-option>
              <el-option :value="1" label="已完成"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="截止日期">
            <!-- <el-date-picker size="mini" value-format="yyyy-MM-dd" class="wh-120" v-model="searchData.startTime"></el-date-picker>
            <span>至</span> -->
            <el-date-picker size="mini" disabled value-format="yyyy-MM-dd" v-model="searchData.endTime" class="wh-120"></el-date-picker>
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
        <el-table-column align="center" :label="labelName" :prop="labelName == '分包单位' ? 'customerName' : labelName == '工区' ? 'areaName' : 'orgName'" v-if="user.orgType==5" show-overflow-tooltip/>
        <el-table-column align="center" label="设计工程量" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span v-if="row.grade === 4">{{ row.designQuantities }}</span>
        </template>
      </el-table-column>
        <el-table-column align="center" label="设计产值" prop="designAmount" show-overflow-tooltip>
          <template slot-scope="{row}">
          {{ !pricePermission?'***':row.designAmount }}
        </template>
        </el-table-column>
        <el-table-column align="center" label="完成产值" prop="finishAmount" show-overflow-tooltip>
          <template slot-scope="{row}">
          {{ !pricePermission?'***':row.finishAmount }}
        </template>
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
      
      <!-- <el-table :tooltip-effect="'light'" style="width: 100%" stripe v-show="radio === 2" :header-cell-style="{ background: '#f1f6ff' }" height="100%" :key="ranKey2" :data="tableData">
        <el-table-column align="center" label="序号" type="index" width="80" />
        <el-table-column align="center" label="清单项目名称" prop="itemName" />
        <el-table-column align="center" label="设计工程量" prop="designQuantities" show-overflow-tooltip>
          <template slot-scope="{row}">
          {{ !pricePermission?'***':row.designQuantities }}
        </template>
        </el-table-column>
        <el-table-column align="center" label="设计产值" prop="designAmount" show-overflow-tooltip>
          <template slot-scope="{row}">
          {{ !pricePermission?'***':row.designAmount }}
        </template>
        </el-table-column>
        <el-table-column align="center" label="完成工程量" prop="completeQuantities" show-overflow-tooltip>
          <template slot-scope="{row}">
          {{ !pricePermission?'***':row.completeQuantities }}
        </template>
        </el-table-column>
        <el-table-column align="center" label="完成产值" prop="finishAmount" show-overflow-tooltip >
          <template slot-scope="{row}">
          {{ !pricePermission?'***':row.finishAmount }}
        </template>
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
      </el-table> -->
      <el-tabs v-model="detailRadio" v-if="radio == 2&&tableData.length" style="height:100%">
      <el-tab-pane :label="item.itemName" :name="index + ''" v-for="(item,index) in tableData" :key="index" style="height:90%">
        <el-table :tooltip-effect="'light'" style="width: 100%" height="100%" stripe ref="tables2" :data="item.children" :key="ranKey2" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column align="center" label="序号" type="index" width="80" />
          <el-table-column align="center" label="清单名称" prop="itemName" />
          <el-table-column align="center" label="设计工程量" prop="designQuantities" show-overflow-tooltip/>
          <el-table-column align="center" label="单价" prop="price" show-overflow-tooltip>
            <template slot-scope="{row}">
              {{ !pricePermission?'***':row.price }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="设计产值" prop="designAmount" show-overflow-tooltip/>
          <el-table-column align="center" label="完成工程量" prop="completeQuantities" show-overflow-tooltip>
            <template slot-scope="{row}">
              {{ !pricePermission?'***':row.completeQuantities }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="完成产值" prop="finishAmount" show-overflow-tooltip>
            <template slot-scope="{row}">
              {{ !pricePermission?'***':row.finishAmount }}
            </template>
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
import SearchBar from "./SearchBar.vue";
import api from "@/api/api";
export default {
  props: {
    dialogTableVisible: {
      type: Boolean,
      default: false
    },
    labelName: {
      type: String
    },
    // 1分包单位，2工区，3项目
    showType: {
      type: Number
    },
    fkProjectId: {
      default: ""
    },
    fkWorkAreaId: {
      default: ""
    },
    fkCustomerId: {
      default: ""
    },
    customName: {
      default: ""
    }
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
      data.customerIds = this.fkCustomerId
      data.workAreaIds = this.fkWorkAreaId
      
      // console.log("----------------")
      // console.log(this.fkCustomerId)
      // console.log("----------------")
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
    // 返回完成列表
    showList() {
      if (this.finished === 0) {
        return this.tableData.filter(item => item.completionStatus == 1);
      } else if (this.finished === 1) {
        return this.tableData.filter(item => item.completionStatus == 2);
      } else {
        return this.tableData;
      }
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    pricePermission(){
      let arr =this.$store.state.menuData.filter(item=>item.menuCode=='schedule')
      if(![0].includes(this.user.orgType)){
        return arr.length?!!arr[0].states:false
      }else{
        return true
      }
    },
  },
  watch: {
    searchData: {
      handler(val) {
        if (this.dialogTableVisible) {
          if (this.fkProjectId || this.fkWorkAreaId || this.fkCustomerId) {
            this.getScheduleList();
          }
        }
      },
      deep: true,
      immediate: true
    },
    dialogTableVisible(val) {
      if (val) {
        console.log(this.showType);
        if (this.showType === 3) {
          this.searchData = {
            ...this.searchData,
            fkProjectId: this.fkProjectId
          };
        }
        if (this.showType === 2) {
          this.searchData = {
            ...this.searchData,
            customerOrWorkArea: 1,
            workAreaIds: this.fkWorkAreaId
          };
        }
        if (this.showType === 1) {
          this.searchData = {
            ...this.searchData,
            customerOrWorkArea: 0,
            customerIds: this.fkCustomerId
          };
        }
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
