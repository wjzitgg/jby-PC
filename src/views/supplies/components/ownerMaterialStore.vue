<template>
  <div>
    <el-dialog title="甲供库存信息" width="70%" :visible="ownerMaterialStoreDialog" @close="closeOwnerMaterialStoreDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
      <div class="header-seach">
        <el-form :inline="true" class="myform" label-width="72px">
          <el-form-item label="分包单位">
            <el-select v-model="inpData.customId" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in subOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="物料类型">
            <!-- <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.materialTypeId" filterable></el-cascader> -->
            <el-select v-model="inpData.materialTypeId" size="mini" class="wh-200">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in materOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="物料名称">
            <el-input size="mini" v-model="inpData.materialName" maxlength="50"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" class="ml-20 search" icon="el-icon-search" @click="btnSearch">查询</el-button>
        </el-form>
      </div>
      <div class="tables table-data">
        <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff'}" height="100%" :data="tableData" ref="tables">
          <el-table-column label="序号" align="center" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="分包单位" align="center" prop="customName"> </el-table-column>
          <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
          <el-table-column label="物料类型" align="center" prop="materialTypeName"> </el-table-column>
          <el-table-column label="仓库" align="center" prop="warehouseName"> </el-table-column>
          <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
          <el-table-column label="供货量" align="center" prop="supplyNum"> </el-table-column>
          <el-table-column label="退货量" align="center">
            <template slot-scope="{ row }">
              <span class="red">{{ row.backNum }}</span>
            </template>
          </el-table-column>
          <el-table-column label="使用量" align="center" prop="useNum"> </el-table-column>
          <el-table-column label="盘盈量" align="center">
            <template slot-scope="{ row }">
              <span class="green">{{ row.inventoryProfit }}</span>
            </template>
          </el-table-column>
          <el-table-column label="盘亏量" align="center">
            <template slot-scope="{ row }">
              <span class="red">{{ row.inventoryLosses }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存数量" align="center" prop="stockNum"> </el-table-column>
          <el-table-column label="仓库台账" align="center">
            <template slot-scope="{ row }">
              <el-button plain type="primary" size="mini" @click="openStoreDialog(row)">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="ownerMaterialStoreDialog"></tablePaging>
      </div>
    </el-dialog>
    <el-dialog title="物料台账记录" :visible="storeDialog" width="70%" @close="closeStoreDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading2" :close-on-press-escape="false">
      <div class="dialog-form">
      <div class="header-seach">
        <el-form :inline="true" class="myform" label-width="72px">  
          <el-form-item label="所选仓库">
            <el-select v-model="dialogInput.fkWarehouseId" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in warehouseList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="变动类型">
            <el-select v-model="dialogInput.changeType" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in changTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="变动时间">
            <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="dialogInput.beginTime"></el-date-picker>
            <span>至</span>
            <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="dialogInput.endTime"></el-date-picker>
          </el-form-item>
          <el-button size="mini" type="primary" class="ml-20 search" icon="el-icon-search" @click="dialogSearch">查询</el-button>
        </el-form>
      </div>
      <div class="tables table-data">
        <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff'}" height="100%" :data="dialogData" ref="tables2">
          <el-table-column label="序号" align="center" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (dialogPage.pageNum - 1) * dialogPage.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
          <el-table-column label="物料类型" align="center" prop="materialTypeName"> </el-table-column>
          <el-table-column label="供应商" align="center" prop="customName"> </el-table-column>
          <el-table-column label="仓库" align="center" prop="warehouseName"> </el-table-column>
          <el-table-column label="变动类型" align="center" prop="changeCode"> </el-table-column>
          <el-table-column label="变动时间" align="center" prop="changeTime"> </el-table-column>
          <el-table-column label="关联单据" align="center" prop="orderCode"> </el-table-column>
          <el-table-column label="变动前数量" align="center" prop="stockNum"> </el-table-column>
          <el-table-column label="变动数量" align="center">
            <template slot-scope="{ row }">
              <span :class="{ red: row.num < 0, green: row.num > 0 }">{{ row.num }}</span>
            </template>
          </el-table-column>
          <el-table-column label="变动后数量" align="center" prop="stockAfterNum"> </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <tablePaging :pageSize="dialogPage.pageSize" :total="dialogTotal" :currentPage="dialogPage.pageNum" @handleSizeChange="handleSizeChange2" @handleCurrentChange="handleCurrentChange2" v-if="storeDialog"></tablePaging>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    ownerMaterialStoreDialog: {
      type: Boolean
    },
    fkOrgId: "",
    orgId: ""
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      loading: false,
      loading2: false,
      tableData: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      inpData: {
        materialTypeId: "",
        materialName: "",
        customId: ""
      },
      searchData: {
        materialTypeId: "",
        materialName: "",
        customId: ""
      },
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      materOptions: [],
      subOptions: [],
      changTypeList: [],
      warehouseList: [],
      storeDialog: false,
      dialogInput: {
        fkMaterialId: "",
        customId: "",
        beginTime: "",
        endTime: "",
        fkWarehouseId: "",
        changeType: ""
      },
      dialogSearchData: {
        fkMaterialId: "",
        customId: "",
        beginTime: "",
        endTime: "",
        fkWarehouseId: "",
        changeType: ""
      },
      dialogData: [],
      dialogPage: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      dialogTotal: 0 //分页总数
    };
  },
  watch: {
    ownerMaterialStoreDialog(val) {
      if (val) {
        this.getSelfMaterialTypes();
        if ([4, 5].includes(this.user.orgType)) {
          this.getSubList();
        }
        this.$store.dispatch("getDictionariesData", 24).then(res => {
          this.changTypeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        });
        this.firstSupplySearchPage();
      }
    }
  },
  methods: {
    firstSupplySearchPage() {
      this.loading = true;
      this.$api
        .firstSupplySearchPage({ ...this.page, ...this.searchData, projectId: this.fkOrgId })
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
    firstChangeRecordSearchPage() {
      this.loading2 = true;
      this.$api
        .firstChangeRecordSearchPage({ ...this.dialogPage, ...this.dialogSearchData })
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.dialogData = res.data.records;
            this.dialogTotal = res.data.total - 0;
            this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    findCustomWarehouse(customId) {
      this.$api.findCustomWarehouse({ customId }).then(res => {
        if (res.code === 200) {
          this.warehouseList = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取材料分类
    getSelfMaterialTypes() {
      this.$api.getSelfMaterialTypes().then(res => {
        if (res.code === 200) {
          this.materOptions = res.data.map(item=>({...item,value:item.pkId,label:item.typeName}));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分包单位
    getSubList() {
      this.$api.subcontractor({ customType: 4 }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
          if (this.user.orgType === 4||this.user.orgType === 10) {
            this.subOptions = arr.filter(item => item.fkOrgId === this.orgId);
          } else {
            this.subOptions = arr;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取字典
    getItemClass(dictType) {
      this.$api.getItemClass({ dictType }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
          if (dictType === 24) {
            this.changTypeList = arr;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeOwnerMaterialStoreDialog() {
      this.$emit("update:ownerMaterialStoreDialog", false);
      this.inpData = {
        materialTypeId: "",
        materialName: "",
        customId: ""
      };
      this.searchData = {
        materialTypeId: "",
        materialName: "",
        customId: ""
      };
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
    },
    openStoreDialog(row) {
      this.dialogInput = { ...this.dialogInput, fkMaterialId: row.fkMaterialId, customId: row.customId };
      this.dialogSearchData = { ...this.dialogSearchData, fkMaterialId: row.fkMaterialId, customId: row.customId };
      this.findCustomWarehouse(row.customId);
      this.firstChangeRecordSearchPage();
      this.storeDialog = true;
    },
    closeStoreDialog() {
      this.storeDialog = false;
      this.dialogPage = {
        pageSize: 10,
        pageNum: 1
      };
      this.dialogInput = {
        fkMaterialId: "",
        customId: "",
        beginTime: "",
        endTime: "",
        fkWarehouseId: "",
        changeType: ""
      };
      this.dialogSearchData = {
        fkMaterialId: "",
        customId: "",
        beginTime: "",
        endTime: "",
        fkWarehouseId: "",
        changeType: ""
      };
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.firstSupplySearchPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.firstSupplySearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.firstSupplySearchPage();
    },
    dialogSearch() {
      this.dialogPage.pageNum = 1;
      this.dialogSearchData = { ...this.dialogInput };
      this.firstChangeRecordSearchPage();
    },
    // pageSize改变
    handleSizeChange2(val) {
      this.dialogPage.pageSize = val;
      this.firstChangeRecordSearchPage();
    },
    // current改变
    handleCurrentChange2(val) {
      this.dialogPage.pageNum = val;
      this.firstChangeRecordSearchPage();
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
</style>
