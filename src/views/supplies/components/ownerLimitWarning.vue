<template>
  <div>
    <el-dialog title="库存限额预警" width="80%" :visible="ownerLimitWarningDialog" @close="closeOwnerLimitWarningDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
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
            <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.materialTypeId" filterable></el-cascader>
          </el-form-item>
          <el-form-item label="物料名称">
            <el-input size="mini" v-model="inpData.materialName" maxlength="50"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" class="ml-20 search el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
        </el-form>
        <el-button size="mini" type="primary" class="el-button-primary" v-if="user.orgType === 5" @click="openLimitDialog(2)">新增预警项</el-button>
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
          <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
          <el-table-column label="上限预警量" align="center" prop="alertUpperNum"> </el-table-column>
          <el-table-column label="下限预警量" align="center" prop="alertDownNum"> </el-table-column>
          <el-table-column label="当前库存量" align="center" prop="stockNum">
            <template slot-scope="{ row }">
              <span :class="{ red: row.stockNum > row.alertUpperNum || row.stockNum < row.alertDownNum }">{{ row.stockNum }}</span>
            </template>
          </el-table-column>
          <el-table-column label="限额供应量" align="center" prop="restrictSupplyNum">
            <template slot-scope="{ row }">
              {{ row.restrictSupplyNum ? row.restrictSupplyNum : "-" }}
            </template>
          </el-table-column>
          <el-table-column label="已供应量" align="center" prop="supplyNum"> </el-table-column>
          <el-table-column label="超额量" align="center" prop="">
            <template slot-scope="{ row }">
              <span class="red">{{ row.excessNum }}</span>
            </template>
          </el-table-column>
          <el-table-column label="超额扣款金额" align="center" prop="">
            <template slot-scope="{ row }">
              <span class="red">{{ row.excessDeductAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="250" v-if="user.orgType !== 4&&user.orgType !== 10">
            <template slot-scope="{ row }">
              <el-button size="mini" type="success" class="el-button-primary" @click="openLimitDialog(3, row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="delLimit(row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="ownerLimitWarningDialog"></tablePaging>
      </div>
    </el-dialog>
    <el-dialog width="30%" :title="limitDialogTitle" center :visible="limitDialog" @close="closeLimitDialog" v-loading="loading" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="dialog-form">
      <el-form ref="limitForm" :model="limitForm" :rules="rules" label-width="95px">
        <el-form-item label="分包单位" prop="fkCustomerId">
          <el-select v-model="limitForm.fkCustomerId" size="mini" style="width:100%" @change="subChange">
            <el-option v-for="item in subOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="限额物料" prop="fkMaterialId">
          <el-cascader size="mini" style="width: 100%" :disabled='!limitForm.fkCustomerId' :options="materialOptions" clearable :props="setProps" :emitPath="false" v-model="limitForm.fkMaterialId" filterable @change="materChange"></el-cascader>
        </el-form-item>
        <el-form-item label="预警上限量" prop="alertUpperNum">
          <el-input size="mini" v-model="limitForm.alertUpperNum" @input="numInput($event,1)" ></el-input>
        </el-form-item>
        <el-form-item label="预警下限量" prop="alertDownNum">
          <el-input size="mini" v-model="limitForm.alertDownNum" @input="numInput($event,2)"></el-input>
        </el-form-item>
        <el-form-item label="现有库存量">
          <el-input size="mini" v-model="limitForm.inventoryNum" disabled></el-input>
        </el-form-item>
        <el-form-item label="限额库存量">
          <el-input size="mini" v-model="limitForm.restrictSupplyNum" disabled></el-input>
        </el-form-item>
        <el-form-item label="已供应量">
          <el-input size="mini" v-model="limitForm.supplyNum" disabled></el-input>
        </el-form-item>
      </el-form>
      </div>
      <div slot="footer">
        <el-button type="primary" plain @click="closeLimitDialog">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="limitDialogOk">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    ownerLimitWarningDialog: {
      type: Boolean
    },
    fkOrgId: "",
    orgId: ""
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
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
      materialOptions: [],
      limitDialog: false,
      limitDialogTitle: "",
      limitDialogType: 1,
      limitForm: {
        alertDownNum: "",
        alertUpperNum: "",
        fkCustomerId: "",
        fkMaterialId: "",
        inventoryNum: "",
        restrictSupplyNum: "",
        supplyNum: ""
      },
      rules: {
        alertDownNum: [{ required: true, message: "请填写预警下限量", trigger: "blur" }],
        alertUpperNum: [{ required: true, message: "请填写预警上限量", trigger: "blur" }],
        fkMaterialId: [{ required: true, message: "请选择物料", trigger: "blur" }],
        fkCustomerId: [{ required: true, message: "请选择仓库", trigger: "blur" }]
      },
      subOptions: []
    };
  },
  watch: {
    ownerLimitWarningDialog(val) {
      if (val) {
        this.conditionMaterialclassify();
        if ([4, 5].includes(this.user.orgType)) {
          this.getSubList();
        }
        this.searchMaterialInventoryAlertPage();
      }
    }
  },
  methods: {
    numInput(e,type){
      if(type==1){
        this.limitForm.alertUpperNum= this.$limitInputNumber(Number(e),999999999.999999,0,6)-0
      }else{
        this.limitForm.alertDownNum= this.$limitInputNumber(Number(e),999999999.999999,0,6)-0
      }
    },
    // 分页列表
    searchMaterialInventoryAlertPage() {
      let data = { ...this.page, ...this.searchData, type: 1 };
      if (this.user.orgType === 4||this.user.orgType === 10) {
        data.fkBidProjectId = this.fkOrgId;
      }
      this.$api.searchMaterialInventoryAlertPage(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
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
    // 根据标段项目id获取物料
    getMaterials(projectId,customId) {
      this.$api.getMaterials({ projectId,customId }).then(res => {
        if (res.code === 200) {
          this.materialOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    subChange(e) {
      if (this.limitForm.fkCustomerId && this.limitForm.fkMaterialId) {
        this.getMaterialsInventory(this.limitForm.fkCustomerId, this.limitForm.fkMaterialId);
      }
      if(e){
        this.getMaterials("",e);
      }
    },
    materChange(e) {
      if (this.limitForm.fkCustomerId && this.limitForm.fkMaterialId) {
        this.getMaterialsInventory(this.limitForm.fkCustomerId, this.limitForm.fkMaterialId);
      }
    },
    getMaterialsInventory(customId, materialId) {
      this.$api.getMaterialsInventory({ materialId, customId }).then(res => {
        if (res.code === 200) {
          this.limitForm = { ...this.limitForm, ...res.data };
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeOwnerLimitWarningDialog() {
      this.$emit("update:ownerLimitWarningDialog", false);
      this.cleanSearch();
    },
    openLimitDialog(type, row) {
      this.limitDialogType = type;
      if (type === 2) {
        this.limitDialogTitle = "新增物料限额";
        this.limitDialog = true;
      } else if (type === 3) {
        this.limitDialogTitle = "编辑物料限额";
        this.limitForm = { ...row };
        this.getMaterialsInventory(this.limitForm.fkCustomerId, this.limitForm.fkMaterialId);
        this.limitDialog = true;
        this.getMaterials("",this.limitForm.fkCustomerId);
        // this.$api.findMaterialInventoryAlertById({ pkId: row.pkId }).then(res => {
        //   if (res.code === 200) {
        //     this.limitForm = res.data;
        //     this.limitDialog = true;
        //   } else {
        //     this.$message.warning(res.msg);
        //   }
        // });
      }
    },
    async limitDialogOk() {
      await this.$refs.limitForm.validate();
      this.loading = true;
      if (this.limitDialogType === 2) {
        this.$api
          .addMaterialInventoryAlert(this.limitForm)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.closeLimitDialog();
              this.searchMaterialInventoryAlertPage();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        this.$api
          .updateMaterialInventoryAlert(this.limitForm)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.closeLimitDialog();
              this.searchMaterialInventoryAlertPage();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },

    closeLimitDialog() {
      this.$refs.limitForm.resetFields();
      this.limitDialog = false;
      this.limitForm = {
        alertDownNum: "",
        alertUpperNum: "",
        fkCustomerId: "",
        fkMaterialId: "",
        inventoryNum: "",
        restrictSupplyNum: "",
        supplyNum: ""
      };
    },
    delLimit(row) {
      this.$confirm("确定删除该限额?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delMaterialInventoryAlert({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("操作成功");
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.searchMaterialInventoryAlertPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchMaterialInventoryAlertPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.searchMaterialInventoryAlertPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchMaterialInventoryAlertPage();
    },
    cleanSearch() {
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
