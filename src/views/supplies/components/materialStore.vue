<template>
  <div>
    <el-dialog title="库存信息" width="70%" :visible="materialStoreDialog" @close="closeMaterialStoreDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
      <div class="header-seach">
        <el-form :inline="true" class="myform" label-width="72px">
          <el-form-item label="标段项目" v-if="user.orgType === 7">
            <el-select v-model="inpData.projectBidId" size="mini" class="wh-140" @change="proChange">
              <el-option value="" label="全部"></el-option>
              <el-option value="0" label="无"></el-option>
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="仓库" label-width="40px">
            <el-select v-model="inpData.fkWarehouseId" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in warehouseList" :key="item.value" :value="item.value" :label="item.label"></el-option>
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
          <el-button size="mini" type="primary" class="ml-20 search el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
        </el-form>
      </div>
      <div class="tables table-data">
        <el-table style="width: 100%" height="100%" :data="tableData" ref="tables" stripe :header-cell-style="{ background: '#f1f6ff'}">
          <el-table-column label="序号" align="center" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="标段项目" align="center" prop="bidProjectName" v-if="user.orgType === 7"> </el-table-column>
          <el-table-column label="仓库" align="center" prop="warehouseName"> </el-table-column>
          <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
          <el-table-column label="物料类型" align="center" prop="materialTypeName"> </el-table-column>
          <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
          <el-table-column label="入库量" align="center" prop="inRepositoryNum"> </el-table-column>
          <el-table-column label="发货量" align="center" prop="outRepositoryNum"> </el-table-column>
          <el-table-column label="盘盈量" align="center" prop="inventoryProfit">
            <template slot-scope="{ row }">
              <span class="green">{{ row.inventoryProfit }}</span>
            </template>
          </el-table-column>
          <el-table-column label="盘亏量" align="center" prop="inventoryLosses">
            <template slot-scope="{ row }">
              <span class="green">{{ row.inventoryLosses }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存数量" align="center" prop="stockNum"> </el-table-column>
          <el-table-column label="变动记录" align="center">
            <template slot-scope="{ row }">
              <el-button size="mini" plain @click="openStoreDialog(row)">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="materialStoreDialog"></tablePaging>
      </div>
    </el-dialog>
    <el-dialog :title="'物料台账记录' + '-' + nowCheckObj.materialName + `(${nowCheckObj.warehouseName})`" :visible="storeDialog" @close="closeStoreDialog" width="70%" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
      <div class="tables">
        <el-table style="width: 100%" height="100%" :data="dialogData" ref="tables2" stripe :header-cell-style="{ background: '#f1f6ff'}">
          <el-table-column label="序号" align="center" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (dialogPage.pageNum - 1) * dialogPage.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="仓库" align="center" prop="">
            <template slot-scope="{ row }">
              {{ nowCheckObj.warehouseName }}
            </template>
          </el-table-column> -->
          <el-table-column label="变动类型" align="center" prop="changeCode"> </el-table-column>
          <el-table-column label="关联单据" align="center" prop="orderCode"> </el-table-column>
          <el-table-column label="单据负责人" align="center" prop="userName"> </el-table-column>
          <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
          <el-table-column label="变动前数量" align="center" prop="stockNum"> </el-table-column>
          <el-table-column label="变动数量" align="center" prop="num">
            <template slot-scope="{ row }">
              <span :class="{ green: row.num > 0, red: row.num < 0 }">{{ (row.num > 0 ? "+" : "") + row.num }}</span>
            </template>
          </el-table-column>
          <el-table-column label="变动后数量" align="center" prop="stockAfterNum"> </el-table-column>
          <el-table-column label="变动时间" align="center" prop="changeTime"> </el-table-column>
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
    materialStoreDialog: {
      type: Boolean
    },
    fkOrgId: "",
    orgId:""
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
        fkWarehouseId: "",
        materialTypeId: "",
        materialName: "",
        projectBidId: ""
      },
      searchData: {
        fkWarehouseId: "",
        materialTypeId: "",
        materialName: "",
        projectBidId: ""
      },
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      materOptions: [],
      storeDialog: false,
      dialogData: [],
      dialogPage: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      dialogTotal: 0, //分页总数
      proOptions: [],
      warehouseList: [],
      nowCheckObj: {}
    };
  },
  watch: {
    materialStoreDialog(val) {
      if (val) {
        this.getSelfMaterialTypes();
        this.findWarehouseByProjectId("");
        if (this.user.orgType === 7) {
          this.getAllProject();
        }
        this.searchMaterialInventoryPage();
      }
    }
  },
  methods: {
    searchMaterialInventoryPage() {
      let data = { ...this.page, ...this.searchData };
      if (this.user.orgType === 4||this.user.orgType === 10) {
        data.projectBidId = this.fkOrgId;
      }
      this.$api.searchMaterialInventoryPage(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    changeRecordSearchPage() {
      // this.nowCheckObj
      let data = { ...this.dialogPage, fkMaterialId: this.nowCheckObj.fkMaterialId, fkWarehouseId: this.nowCheckObj.fkWarehouseId };
      if (this.user.orgType === 4||this.user.orgType === 10) {
        data.fkOrgId = this.orgId;
      }
      this.$api.changeRecordSearchPage(data).then(res => {
        if (res.code === 200) {
          this.dialogData = res.data.records;
          this.dialogTotal = res.data.total - 0;
          this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
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
      let bidId=this.user.orgType===4?this.fkOrgId:bidProjectId
      this.$api.findWarehouseByProjectId({ bidProjectId:bidId }).then(res => {
        if (res.code === 200) {
          this.warehouseList = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    proChange(e) {
      this.inpData.fkWarehouseId = "";
      if (e) {
        this.findWarehouseByProjectId(e);
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
    // 获取物料
    // getMaterialsTree() {
    //   this.$api.getMaterialsTree({ customerId: "" }).then(res => {
    //     if (res.code === 200) {
    //       this.materialOptions = res.data;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    closeMaterialStoreDialog() {
      this.$emit("update:materialStoreDialog", false);
      this.inpData = {
        fkWarehouseId: "",
        materialTypeId: "",
        materialName: "",
        projectBidId: ""
      };
      this.searchData = {
        fkWarehouseId: "",
        materialTypeId: "",
        materialName: "",
        projectBidId: ""
      };
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.total = 0;
    },
    openStoreDialog(row) {
      this.nowCheckObj = { ...row };
      this.changeRecordSearchPage();
      this.storeDialog = true;
    },
    closeStoreDialog() {
      this.storeDialog = false;
      this.dialogPage = {
        pageSize: 10,
        pageNum: 1
      };
      this.nowCheckObj = {};
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchMaterialInventoryPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchMaterialInventoryPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchMaterialInventoryPage();
    },
    // pageSize改变
    handleSizeChange2(val) {
      this.dialogPage.pageSize = val;
      this.changeRecordSearchPage()
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // current改变
    handleCurrentChange2(val) {
      this.dialogPage.pageNum = val;
      this.changeRecordSearchPage()
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    }
  }
};
</script>

<style lang="scss" scoped>
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
