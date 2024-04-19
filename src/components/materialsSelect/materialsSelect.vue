<template>
  <el-dialog title="选择物料" :visible="materDialog" @close="closeMaterDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" top="3vw">
    <div class="dialog-form">
      <div class="header-seach">
        <el-form :inline="true" class="myform" label-width="72px">
          <el-form-item label="仓库" v-if="showType === 1">
            <el-select v-model="inpData.warehouse" size="mini" class="wh-140">
              <el-option value="" label="全部"></el-option>
              <!-- <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option> -->
            </el-select>
          </el-form-item>
          <el-form-item label="物料分类">
            <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.materialTypeId" filterable></el-cascader>
          </el-form-item>
          <el-form-item label="物料名称">
            <el-input size="mini" v-model="inpData.odd" class="wh-140"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" class="ml-20 search" icon="el-icon-search" @click="btnSearch">查询</el-button>
        </el-form>
      </div>
      <div class="tables table-data">
        <el-table style="width: 100%" height="100%" :data="materialData" stripe :header-cell-style="{ background: '#f1f6ff' }" ref="tables">
          <el-table-column label="选择" align="center" width="80">
            <template slot-scope="{ row }">
              <el-button type="primary" size="mini" :disabled="!!selectMater.filter(item => item.fkMaterialId === row.pkId).length" @click="materDialogOk(row)">选择</el-button>
            </template>
          </el-table-column>
          <el-table-column label="序号" align="center" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="仓库" align="center" prop="" v-if="showType === 1"> </el-table-column>
          <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
          <el-table-column label="物料分类" align="center" prop="fkTypeName"> </el-table-column>
          <el-table-column label="单位" align="center" prop="fkUnitName"> </el-table-column>
          <el-table-column label="库存量" align="center" prop="supplyNum" v-if="supplyNumShow"> </el-table-column>
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
    fkBidProjectId: "", // 标段项目id
    fkCustomId: "", // 供应商id
    type: {
      type: Number,
      default: 1
    },
    materialTypeCode: "", // 物料分类属性编码: 一般物料：materials_common,混凝土：materials_beton，钢筋半成品：materials_rebar
    fkWarehouseId: {
      type: String,
      default: ""
    },
    outTypeCode: {
      type: String,
      default: ""
    },
    materialIds: {
      type: "",
      default: String
    },
    // 选中的物料不能再次点击
    selectMater: {
      type: Array,
      default: () => {
        return [];
      }
    },
    isSubtra: {
      type: Boolean,
      default: false
    },
    supplyNumShow:{
      type: Boolean,
      default: true
    },
    fkCustomId:{
      type: String,
      default: ""
    }
  },
  data() {
    return {
      materialData: [],
      inpData: {},
      searchData: {},
      page: {
        pageSize: 10,
        pageNum: 1
      }, // 分页数据
      total: 0, // 分页总数
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      materOptions: []
    };
  },
  mounted() {
    // 获取物料分类
    this.conditionMaterialclassify();
  },
  watch: {
    // 标段项目地获取
    // fkBidProjectId(val) {
    //   console.log(val);
    //   if (val) {
    //     this.getTable();
    //   }
    // },
    // // 供应商id获取
    // fkCustomId(val) {
    //   console.log(1111111111);
    //   if (val) {
    //     this.getTable();
    //   }
    // }
    materDialog(val) {
      if (val) {
        this.getTable();
      }
    }
  },
  methods: {
    // 获取table列表
    getTable() {
      const params = {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,
        type: this.type,
        fkBidProjectId: this.fkBidProjectId,
        fkCustomId: this.fkCustomId,
        materialTypeId: this.inpData.materialTypeId,
        materialName: this.inpData.odd,
        materialTypeCode: this.materialTypeCode,
        fkWarehouseId: this.fkWarehouseId,
        outTypeCode: this.outTypeCode,
        materialIds: this.materialIds,
        fkCustomId:this.fkCustomId
      };
      console.log('this.outTypeCode -----> ', this.outTypeCode);
      if (!this.isSubtra) {
        params.isSubtraction = 1;
      }
      if (params.fkCustomId == "") {
        params.fkCustomId = 0;
      }
      this.$api.searchMaterialPage(params).then(res => {
        if (res.code === 200) {
          this.materialData = res.data.records;
          this.total = res.data.total - 0;
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
    closeMaterDialog() {
      this.$emit("update:materDialog", false);
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.inpData = {};
      this.searchData = {};
    },
    materDialogOk(row) {
      console.log(row);
      this.$emit("getSelect", row);
      this.closeMaterDialog();
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.getTable();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.getTable();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.getTable();
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-dialog {
  height: auto !important;
}
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
  height: 550px;
}
</style>
