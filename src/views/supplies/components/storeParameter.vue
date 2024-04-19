<template>
  <div>
    <el-dialog title="仓库台账" width="80%" :visible="storeParameterDialog" @close="closeStoreParameterDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="header-seach">
          <el-form :inline="true" class="myform" label-width="72px">
            <el-form-item label="标段项目" v-if="user.orgType === 7">
              <el-select v-model="inpData.fkBidProjectId" size="mini" class="wh-140" @change="proChange($event)">
                <el-option value="" label="全部"></el-option>
                <el-option value="0" label="无"></el-option>
                <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所选仓库">
              <el-select v-model="inpData.warehouseId" size="mini" class="wh-140">
                <el-option value="" label="全部"></el-option>
                <el-option v-for="item in warehouseList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="供应商" v-if="![6,7].includes(user.orgType)">
              <el-select v-model="inpData.customId" size="mini" class="wh-140">
                <el-option value="" label="全部"></el-option>
                <el-option v-for="item in customList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="变动类型">
              <el-select v-model="inpData.changeCode" size="mini" class="wh-140">
                <el-option value="" label="全部"></el-option>
                <el-option v-for="item in changeTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="变动日期">
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.beginTime"></el-date-picker>
              <span>至</span>
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker>
            </el-form-item>
            <el-form-item label="关联单号">
              <el-input size="mini" v-model="inpData.urlCode" class="wh-140" maxlength="50"></el-input>
            </el-form-item>
            <el-button size="mini" type="primary" class="ml-20 search" icon="el-icon-search" @click="btnSearch">查询</el-button>
          </el-form>
        </div>
        <div class="tables table-data">
          <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" :data="tableData" ref="tables" :tooltip-effect="'light'">
            <el-table-column label="序号" align="center" width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
            <el-table-column label="物料类型" align="center" prop="materialTypeName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="供应商" align="center" prop="customName" show-overflow-tooltip v-if="![6,7].includes(user.orgType)"> </el-table-column>
            <el-table-column label="标段项目" align="center" prop="bidProjectName" v-if="user.orgType === 7"> </el-table-column>
            <el-table-column label="仓库" align="center" prop="warehouseName"> </el-table-column>
            <el-table-column label="变动类型" align="center" prop="changeCode">
              <!-- <template slot-scope="{ row }">
              {{ changeTypeList.filter(item => item.value === row.changeCode)[0].label }}
            </template> -->
            </el-table-column>
            <el-table-column label="关联单据" align="center" prop="urlCode">
              <template slot-scope="{ row }">
                <span class="blue" @click="orderClick(row)">{{ row.urlCode }}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column label="单位" align="center" prop="unitName"> </el-table-column> -->
            <el-table-column label="变动前数量" align="center" prop="beforeNum"> </el-table-column>
            <el-table-column label="变动数量" align="center">
              <template slot-scope="{ row }">
                <span :class="{ red: row.num < 0, green: row.num > 0 }">{{ row.num }}</span>
              </template>
            </el-table-column>
            <el-table-column label="变动后数量" align="center" prop="afterNum"> </el-table-column>
            <el-table-column label="变动时间" align="center" prop="changeTime"></el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="storeParameterDialog"></tablePaging>
      </div>
    </el-dialog>
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"></checkOrderDialog>
  </div>
</template>

<script>
import checkOrderDialog from "./checkOrderDialog.vue";
export default {
  components: { checkOrderDialog },
  props: {
    storeParameterDialog: {
      type: Boolean
    },
    fkOrgId: ""
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      loading: false,
      tableData: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      inpData: {
        beginTime: "",
        endTime: "",
        warehouseId: "",
        changeCode: "",
        fkBidProjectId: "",
        urlCode: "",
        customId:""
      },
      searchData: {
        beginTime: "",
        endTime: "",
        warehouseId: "",
        changeCode: "",
        fkBidProjectId: "",
        urlCode: "",
        customId:""
      },
      proOptions: [],
      warehouseList: [],
      changeTypeList: [],
      checkOrderDialog: false,
      orderType: 0,
      orderPkId: "",
      customList:[]
    };
  },
  watch: {
    storeParameterDialog(val) {
      if (val) {
        if (this.user.orgType !== 7) {
          // this.findSelfWarehouse();
          this.findWarehouseByProjectId("");
          this.subcontractorList()
        } else {
          this.getAllProject();
        }
        this.$store.dispatch("getDictionariesData", 24).then(res => {
          this.changeTypeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        });
        this.materialAccountSearchPage();
      }
    }
  },
  methods: {
    orderClick(item) {
      //orderType 1申请单；2采购单，3：发料单，4出库单，5入库单，6盘点单
      this.orderType = item.bizType == 1 ? 5 : 4;
      this.orderPkId = item.bizId;
      this.checkOrderDialog = true;
    },
    materialAccountSearchPage() {
      let data = { ...this.page, ...this.searchData };
      if (this.user.orgType === 4||this.user.orgType === 10) {
        data.fkBidProjectId = this.fkOrgId;
      }
      this.loading = true;
      this.$api
        .materialAccountSearchPage(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findWarehouseByProjectId(bidProjectId) {
      let bidId = this.user.orgType === 4||this.user.orgType === 10 ? this.fkOrgId : bidProjectId;
      this.$api.findWarehouseByProjectId({ bidProjectId: bidId }).then(res => {
        if (res.code === 200) {
          this.warehouseList = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    proChange(e) {
      this.inpData.fkWarehouseId = "";
      this.inpData.customId=""
      if (e) {
        this.findWarehouseByProjectId(e);
        this.subcontractorList()
      } else {
        this.findWarehouseByProjectId("");
      }
    },
    // 获取仓库
    findSelfWarehouse() {
      this.$api.findSelfWarehouse().then(res => {
        if (res.code === 200) {
          this.warehouseList = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取字典
    getItemClass(dictType) {
      if (this.$store.state.dictionariesData.length) {
        return this.$store.state.dictionariesData[dictType - 1].sysDictList.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
      }
      return [];
      this.$api.getItemClass({ dictType }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
          if (dictType === 24) {
            this.changeTypeList = arr;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeStoreParameterDialog() {
      this.$emit("update:storeParameterDialog", false);
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.inpData = {
        beginTime: "",
        endTime: "",
        warehouseId: "",
        changeCode: "",
        fkBidProjectId: "",
        urlCode: "",
        customId:""
      };
      this.searchData = {
        beginTime: "",
        endTime: "",
        warehouseId: "",
        changeCode: "",
        fkBidProjectId: "",
        urlCode: "",
        customId:""
      };
    },
    subcontractorList(){
      this.$api.subcontractorList({ projectId: this.user.orgType==7?this.inpData.fkBidProjectId:this.fkOrgId, customType: 3 }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.customName;
              item.value = item.pkId;
            });
            this.customList = res.data;
          }
        });
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.materialAccountSearchPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.materialAccountSearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.materialAccountSearchPage();
    }
  }
};
</script>

<style lang="scss" scoped>
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 0 20px;
  margin-bottom: 5px;
  .myform {
    align-items: center;
    margin-top: 20px;
  }
  .search-right {
    display: flex;
    align-items: center;
    .el-radio-group {
      display: flex;
    }
  }
}
.search {
  margin-top: 6px;
}
.tables {
  height: 500px;
}
.red {
  color: red;
}
.green {
  color: #72b74b;
}
.blue {
  color: #02aff4;
  cursor: pointer;
}
</style>
