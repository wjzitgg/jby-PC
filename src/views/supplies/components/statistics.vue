<template>
  <div>
    <el-dialog title="分类统计" width="73%" top="5vw" :visible="statisticsDialog" @close="closeStatisticsDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
        <el-radio-group v-model="radio" size="small" @change="radioChange">
          <el-radio-button :label="1">物料台账</el-radio-button>
          <el-radio-button :label="2">物料类型台账</el-radio-button>
        </el-radio-group>
        <div class="header-seach">
          <el-form :inline="true" class="myform" label-width="72px">
            <el-form-item label="标段项目" v-if="user.orgType === 7">
              <el-select v-model="inpData.projectId" size="mini" class="wh-140" @change="proChange">
                <el-option value="" label="全部"></el-option>
                <el-option value="0" label="无"></el-option>
                <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="统计仓库">
              <el-select v-model="inpData.fkWarehouseId" size="mini" class="wh-140">
                <el-option value="" label="全部"></el-option>
                <el-option v-for="item in warehouseList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="物料类型">
              <!-- <el-cascader size="mini" class="wh-140" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.fkMaterialTypeId" filterable></el-cascader> -->
              <el-select v-model="inpData.fkMaterialTypeId" size="mini" class="wh-200">
                <el-option value="" label="全部"></el-option>
                <el-option v-for="item in materOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="统计截止日期" label-width="100px">
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker>
            </el-form-item>
            <el-form-item label="物料名称" v-if="radio === 1">
              <el-input size="mini" v-model="inpData.materialName" class="wh-140" maxlength="50"></el-input>
            </el-form-item>
            <el-button size="mini" type="primary" class="ml-20 search" icon="el-icon-search" @click="btnSearch">查询</el-button>
          </el-form>
        </div>
        <div class="tables table-data">
          <el-table style="width: 100%" ref="tables" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" :data="tableData" :key="randomKey" :tooltip-effect="'light'">
            <el-table-column label="序号" align="center" width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="物料名称" align="center" prop="projectName" v-if="user.orgType === 7"> </el-table-column>
            <el-table-column label="物料名称" align="center" prop="materialName" v-if="radio === 1"> </el-table-column>
            <el-table-column label="物料类型" align="center" prop="materialTypeName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="仓库" align="center" prop="warehouseName"> </el-table-column>
            <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
            <el-table-column label="入库总量" align="center" prop="inAmount"> </el-table-column>
            <el-table-column label="发货总量" align="center" prop="outAmount"> </el-table-column>
            <el-table-column label="盘盈总量" align="center">
              <template slot-scope="{ row }" v-if="row.profitAmount > 0">
                <span class="green">{{ row.profitAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="盘亏总量" align="center">
              <template slot-scope="{ row }" v-if="row.loseAmount > 0">
                <span class="red">{{ row.loseAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="剩余库存" align="center" prop="residueAmount"> </el-table-column>
            <!-- <el-table-column label="变动后数量" align="center" prop=""> </el-table-column> -->
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="pagesShow"></tablePaging>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    statisticsDialog: {
      type: Boolean
    },
    fkOrgId: ""
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  watch: {
    statisticsDialog(val) {
      if (val) {
        this.getSelfMaterialTypes();
        this.findWarehouseByProjectId("");
        if (this.user.orgType !== 7) {
          this.getAllProject();
        }
        this.materialLedgerSearchPage();
      }
    }
  },
  data() {
    return {
      loading: false,
      radio: 1,
      tableData: [],
      randomKey: Math.random(),
      page: {
        pageSize: 10,
        pageNum: 1
      }, // 分页数据
      total: 0, // 分页总数
      inpData: {
        endTime: "",
        fkWarehouseId: "",
        fkMaterialTypeId: "",
        materialName: "",
        projectId: ""
      },
      searchData: {
        endTime: "",
        fkWarehouseId: "",
        fkMaterialTypeId: "",
        materialName: "",
        projectId: ""
      },
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      materOptions: [],
      pagesShow: true,
      proOptions: [],
      warehouseList: []
    };
  },
  methods: {
    materialLedgerSearchPage() {
      const data = { ...this.page, ...this.searchData };
      if (this.user.orgType === 4 || this.user.orgType === 10) {
        data.projectId = this.fkOrgId;
      }
      this.loading = true;
      this.$api
        .materialLedgerSearchPage(data)
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
          console.error(err);
          this.loading = false;
        });
    },
    materialTypeLedgerSearchPage() {
      const data = { ...this.page, ...this.searchData };
      delete data.materialName;
      if (this.user.orgType === 4 || this.user.orgType === 10) {
        data.fkBidProjectId = this.fkOrgId;
      } else {
        data.fkBidProjectId = data.projectId;
        delete data.projectId;
      }
      this.loading = true;
      this.$api
        .materialTypeLedgerSearchPage(data)
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
          console.error(err);
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
      const bidId = this.user.orgType === 4 || this.user.orgType === 10 ? this.fkOrgId : bidProjectId;
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
          this.materOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.typeName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    radioChange(e) {
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.randomKey = Math.random();
      this.tableData = [];
      this.cleanSearch();
      this.getPageList();
    },
    getPageList() {
      if (this.radio === 1) {
        this.materialLedgerSearchPage();
      } else if (this.radio === 2) {
        this.materialTypeLedgerSearchPage();
      }
    },
    closeStatisticsDialog() {
      this.$emit("update:statisticsDialog", false);
      this.radio = 1;
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.cleanSearch();
      this.total = 0;
    },
    cleanSearch() {
      this.inpData = {
        endTime: "",
        fkWarehouseId: "",
        fkMaterialTypeId: "",
        materialName: "",
        projectId: ""
      };
      this.searchData = {
        endTime: "",
        fkWarehouseId: "",
        fkMaterialTypeId: "",
        materialName: "",
        projectId: ""
      };
      this.pagesShow = false;
      this.$nextTick(() => {
        this.pagesShow = true;
      });
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.getPageList();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.getPageList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.getPageList();
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
