<template>
  <el-dialog title="选择物料" width="60%" :visible="materDialog" @close="closeMaterDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
    <div class="dialog-form">
    <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="供应商" v-if="(showType === 2 && user.orgType === 5 && outTypeCode !== 'delivery_supplier') || (showType === 3 && user.orgType === 5 && issueTypeCode === 'issue_subcontract') || (showType === 1 && user.orgType === 5) || (showType === 3 && user.orgType === 7 && issueTypeCode === 'issue_position') || (showType === 2 && user.orgType === 7 && outTypeCode !== 'delivery_supplier')">
          <el-select v-model="inpData.customId" size="mini" class="wh-140">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in subOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物料类型">
          <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.materialTypeId" filterable></el-cascader>
          <!-- <el-select v-model="inpData.materialTypeId" size="mini" class="wh-200">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in materOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input size="mini" v-model="inpData.materialName" class="wh-140"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" class="ml-20 search" icon="el-icon-search" @click="btnSearch">查询</el-button>
      </el-form>
    </div>
    <div class="tables table-data">
      <el-table style="width: 100%" height="100%" :data="materialData" ref="tables" stripe :header-cell-style="{ background: '#f1f6ff'}" :tooltip-effect="'light'">
        <el-table-column label="选择" align="center" width="80">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" :disabled="(!!disabledType && disabledType !== row.typeCode) || (showType === 1 && !!approveMaterialsList.filter(item => item.materialId === row.pkId && row.fkCustomerId === item.customId).length) || !!selectMater.filter(item => item.fkMaterialId === row.pkId && row.fkCustomerId === item.fkCustomerId).length||showType===2 && user.orgType === 5&&!row.sureNum" @click="materDialogOk(row)">选择</el-button>
          </template>
        </el-table-column>
        <el-table-column label="序号" align="center" width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="供应商" align="center" prop="customerName" v-if="(showType === 2 && user.orgType === 5 && outTypeCode !== 'delivery_supplier') || (showType === 3 && user.orgType === 5 && issueTypeCode === 'issue_subcontract') || (showType === 1 && user.orgType === 5) || (showType === 3 && user.orgType === 7 && issueTypeCode === 'issue_position') || (showType === 2 && user.orgType === 7 && !['delivery_supplier','delivery_unit'].includes(outTypeCode))"> </el-table-column>
        <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
        <el-table-column label="物料分类" align="center" prop="fkTypeName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="单位" align="center" prop="fkUnitName"> </el-table-column>
        <el-table-column label="库存量" align="center" prop="supplyNum" v-if="showType !== 3"> </el-table-column>
        <el-table-column label="待检测数量" align="center" prop="passFrozenNum" v-if="showType===2 && user.orgType === 5"> </el-table-column>
        <el-table-column label="不合格数量" align="center" prop="flunkFrozenNum" v-if="showType===2 && user.orgType === 5"> </el-table-column>
        <el-table-column label="冻结数量" align="center" prop="frozenNum" v-if="showType===2 && user.orgType === 5"> </el-table-column>
        <el-table-column label="可出库数量" align="center" prop="sureNum" v-if="showType===2 && user.orgType === 5"> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="materDialog"></tablePaging>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    materDialog: {
      type: Boolean
    },
    showType: {
      type: Number,
      default: 1
    },
    fkWarehouseId: "",
    // issueTypeCode 入库对象编码 outTypeCode 出库对象编码
    outTypeCode: "",
    issueTypeCode: "",
    fkCustomId: "",
    materialIds: {
      type: Array,
      default: () => {
        return [];
      }
    },
    disabledType: "",
    fkBidProjectId: "",
    fkItemId: "", // 选择施工部位时必传
    selectMater: {
      type: Array,
      default: () => {
        return [];
      }
    },
    fkSupplyCustomerId:""
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      materialData: [],
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
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      materOptions: [],
      subOptions: [],
      approveMaterialsList: []
    };
  },
  watch: {
    materDialog(val) {
      if (val) {
        this.conditionMaterialclassify();
        if ((this.showType === 2 && this.user.orgType === 5 && this.outTypeCode !== "delivery_supplier") || (this.showType === 3 && this.user.orgType === 5 && this.issueTypeCode === "issue_subcontract") || (this.showType === 1 && this.user.orgType === 5) || (this.showType === 3 && this.user.orgType === 7 && this.issueTypeCode === "issue_position") || (this.showType === 2 && this.user.orgType === 7 && this.outTypeCode !== "delivery_supplier")) {
          this.getSubList();
        }
        if (this.showType === 1) {
          this.getApproveMaterials();
        }
        this.searchMaterialPage();
        console.log(this.disabledType);
      }
    }
  },
  methods: {
    // 获取供应商fkCustomId
    getSubList() {
      let data = {};
      if (this.user.orgType !== 5) {
        data.projectBidId = this.fkBidProjectId;
      }
      this.$api.searchCustomNoLinkOrgId({ customType: 3, ...data }).then(res => {
        if (res.code === 200) {
          this.subOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取材料分类
    conditionMaterialclassify() {
      this.$api.conditionMaterialclassify().then(res => {
        if (res.code === 200) {
          this.materOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取材料分类
    // getSelfMaterialTypes() {
    //   this.$api.getSelfMaterialTypes().then(res => {
    //     if (res.code === 200) {
    //       this.materOptions = res.data.map(item=>({...item,value:item.pkId,label:item.typeName}));
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 获取在盘点物料
    getApproveMaterials() {
      this.$api.getApproveMaterials({ warehouseId: this.fkWarehouseId }).then(res => {
        if (res.code === 200) {
          this.approveMaterialsList = res.data ? res.data : [];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchMaterialPage() {
      let data = { ...this.page, ...this.searchData, type: this.showType === 1 ? 4 : 3, materialIds: this.materialIds.join(","),materialTypeCode:this.disabledType };
      if (this.showType === 1) {
        if (!this.fkWarehouseId) {
          return;
        }
        data.fkWarehouseId = this.fkWarehouseId;
      } else if (this.showType === 2) {
        data.fkWarehouseId = this.fkWarehouseId;
        data.outTypeCode = this.outTypeCode;
        data.fkCustomId = this.fkCustomId;
        if ([6, 7].includes(this.user.orgType)) {
          // delete data.fkCustomId;
          if (this.outTypeCode !== "delivery_unit") {
            data.fkBidProjectId = this.fkBidProjectId;
            if (this.outTypeCode === "delivery_position") {
              data.fkItemId = this.fkItemId;
            }
          }
        }
      } else if (this.showType === 3) {
        data.issueTypeCode = this.issueTypeCode;
        data.fkCustomId = this.fkCustomId;
        if (this.issueTypeCode === "issue_subcontract" && this.user.orgType === 5) {
          data.fkWarehouseId = this.fkWarehouseId;
        }
        if(this.user.orgType===5&&this.issueTypeCode === "issue_supplier"){
          data.fkSupplyCustomerId=this.fkSupplyCustomerId
        }
        if ([6, 7].includes(this.user.orgType)) {
          if (this.issueTypeCode !== "issue_unit") {
            data.fkBidProjectId = this.fkBidProjectId;
            if (this.issueTypeCode === "issue_position") {
              data.fkItemId = this.fkItemId;
            }
          }
        }
      }
      console.log(data);
      this.$api.searchMaterialPage(data).then(res => {
        if (res.code === 200) {
          this.materialData = res.data.records;
          this.total = res.data.total - 0;
          if (this.$refs.tables) {
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeMaterDialog() {
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.$emit("update:materDialog", false);
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
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
    },
    materDialogOk(row) {
      this.$emit("getSelect", row);
      this.closeMaterDialog();
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchMaterialPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.searchMaterialPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchMaterialPage();
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
</style>
