<template>
  <div>
    <el-dialog title="库存限额预警" width="80%" :visible="limitWarningDialog" @close="closeLimitWarningDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
      <div class="header-seach">
        <el-form :inline="true" class="myform" label-width="72px">
          <el-form-item label="标段项目" v-if="user.orgType === 7">
            <el-select v-model="inpData.fkBidProjectId" size="mini" class="wh-140" @change="proChange($event, 1)">
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
            <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.materialTypeId" filterable></el-cascader>
          </el-form-item>
          <el-form-item label="物料名称">
            <el-input size="mini" v-model="inpData.materialName" maxlength="50"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" class="ml-20 search el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
        </el-form>
        <el-button size="mini" type="primary" class="el-button-primary" @click="openLimitDialog(2)" v-if="user.orgType !== 4&&user.orgType !== 10">新增限额</el-button>
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
          <el-table-column label="上限预警量" align="center" prop="alertUpperNum"> </el-table-column>
          <el-table-column label="下限预警量" align="center" prop="alertDownNum"> </el-table-column>
          <el-table-column label="当前库存量" align="center">
            <template slot-scope="{ row }">
              <span :class="{ red: row.stockNum > row.alertUpperNum || row.stockNum < row.alertDownNum }">{{ row.stockNum }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="250" v-if="user.orgType !== 4&&user.orgType !== 10">
            <template slot-scope="{ row }">
              <el-button size="mini" plain type="success" @click="openLimitDialog(3, row)">编辑</el-button>
              <el-button size="mini" plain type="danger" @click="delLimit(row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="limitWarningDialog"></tablePaging>
      </div>
    </el-dialog>
    <el-dialog width="30%" :title="limitDialogTitle" center :visible="limitDialog" @close="closeLimitDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
      <el-form ref="limitForm" :model="limitForm" :rules="rules" label-width="95px">
        <el-form-item label="标段项目" v-if="user.orgType === 7">
          <el-select v-model="limitForm.projectBidId" size="mini" style="width:100%" @change="proChange($event, 2)">
            <el-option value="0" label="无"></el-option>
            <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="仓库" prop="fkWarehouseId">
          <el-select v-model="limitForm.fkWarehouseId" size="mini" style="width:100%" @change="warehouseChange">
            <el-option v-for="item in warehouseList2" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="限额物料" prop="fkMaterialId">
          <!-- <el-select v-model="limitForm.warehouse" size="mini" style="width:100%">
            <el-option v-for="item in materialOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select> -->
          <el-cascader size="mini" style="width: 100%" :options="materialOptions2" clearable :props="setProps" :emitPath="false" v-model="limitForm.fkMaterialId" filterable @change="materChange"></el-cascader>
        </el-form-item>
        <el-form-item label="预警上限量" prop="alertUpperNum">
          <el-input size="mini" v-model="limitForm.alertUpperNum" @input="numInput($event,1)" ></el-input>
        </el-form-item>
        <el-form-item label="预警下限量" prop="alertDownNum">
          <el-input size="mini" v-model="limitForm.alertDownNum" @input="numInput($event,2)"></el-input>
        </el-form-item>
        <el-form-item label="现有库存量">
          <el-input size="mini" :value="storeNum" disabled></el-input>
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
    limitWarningDialog: {
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
    const validator1 = (rule, value, callback) => {
      if (value - 0 > this.limitForm.alertUpperNum - 0) {
        callback(new Error("预警下限量必须比预警上限量小"));
      } else {
        callback();
      }
    };
    const validator2 = (rule, value, callback) => {
      if (value - 0 < this.limitForm.alertDownNum - 0) {
        callback(new Error("预警上限量必须比预警下限量大"));
      } else {
        callback();
      }
    };
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
        fkWarehouseId: "",
        materialName: "",
        fkBidProjectId: ""
      },
      searchData: {
        materialTypeId: "",
        fkWarehouseId: "",
        materialName: "",
        fkBidProjectId: ""
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
      materialOptions2: [],
      limitDialog: false,
      limitDialogTitle: "",
      limitDialogType: 1,
      limitForm: {
        alertDownNum: "",
        alertUpperNum: "",
        fkCustomerId: "",
        fkMaterialId: "",
        fkWarehouseId: "",
        projectBidId: ""
      },
      rules: {
        alertDownNum: [
          { required: true, message: "请填写预警下限量", trigger: "blur" },
          { validator: validator1, trigger: "blur" }
        ],
        alertUpperNum: [
          { required: true, message: "请填写预警上限量", trigger: "blur" },
          { validator: validator2, trigger: "blur" }
        ],
        fkMaterialId: [{ required: true, message: "请选择物料", trigger: "blur" }],
        fkWarehouseId: [{ required: true, message: "请选择仓库", trigger: "blur" }]
      },
      proOptions: [],
      warehouseList: [],
      warehouseList2: [],
      storeNum: ""
    };
  },
  watch: {
    limitWarningDialog(val) {
      if (val) {
        this.conditionMaterialclassify();
        if (this.user.orgType === 7) {
          this.getAllProject();
        } else {
          // this.findSelfWarehouse();
          // if (this.user.orgType !== 4&&this.user.orgType !== 10) {
          //   this.getMaterialsTree();
          // }
        }
        this.findWarehouseByProjectId(this.user.orgType === 4||this.user.orgType === 10 ? this.fkOrgId : "", this.user.orgType === 7 ? 1 : 3, true);
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
    // 获取标段项目
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
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
    // 分页列表
    searchMaterialInventoryAlertPage() {
      let data = { ...this.page, ...this.searchData };
      if (this.user.orgType !== 7) {
        delete data.fkMaterialId;
      }
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
    // 获取仓库
    findSelfWarehouse() {
      this.$api.findSelfWarehouse().then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
          this.warehouseList = arr;
          this.warehouseList2 = arr;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据标段项目id获取物料
    getMaterials(projectId) {
      this.$api.getMaterials({ projectId }).then(res => {
        if (res.code === 200) {
          this.materialOptions2 = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据标段项目id获取仓库
    findWarehouseByProjectId(bidProjectId, type, isTrue) {
      let bidId = this.user.orgType === 4 ||this.user.orgType === 10? this.fkOrgId : bidProjectId;
      this.$api.findWarehouseByProjectId({ bidProjectId: bidId }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
          if (type === 1) {
            this.warehouseList = arr;
          } else if (type === 2) {
            this.warehouseList2 = arr;
            if (isTrue) {
              this.limitForm.fkWarehouseId = arr.length ? arr[0].value : "";
              this.warehouseChange();
            }
          } else if (type === 3) {
            this.warehouseList = [...arr];
            this.warehouseList2 = [...arr];
            if (isTrue) {
              this.limitForm.fkWarehouseId = arr.length ? arr[0].value : "";
              this.warehouseChange();
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    proChange(e, type) {
      if (type === 1) {
        this.inpData.fkWarehouseId = "";
      } else {
        this.limitForm.fkWarehouseId = "";
        this.limitForm.fkMaterialId = "";
      }
      if (e) {
        if (type === 1) {
          this.findWarehouseByProjectId(e, type);
        } else if (type === 2) {
          this.getMaterials(e === "0" ? "" : e);
          this.findWarehouseByProjectId(e, type, true);
        }
      } else {
        if (type === 1) {
          this.findWarehouseByProjectId("", type);
        } else if (type === 2) {
          this.getMaterials("");
          this.findWarehouseByProjectId("0", type, true);
        }
      }
    },
    warehouseChange(e) {
      console.log(e);
      if (this.limitForm.fkMaterialId && this.limitForm.fkWarehouseId) {
        this.getMaterialsInventory(this.limitForm.fkMaterialId, this.limitForm.fkWarehouseId);
      }
    },
    materChange() {
      if (this.limitForm.fkMaterialId && this.limitForm.fkWarehouseId) {
        this.getMaterialsInventory(this.limitForm.fkMaterialId, this.limitForm.fkWarehouseId);
      }
    },
    getMaterialsInventory(materialId, warehouseId) {
      this.$api.getMaterialsInventory({ materialId, warehouseId }).then(res => {
        if (res.code === 200) {
          this.storeNum = res.data.inventoryNum;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeLimitWarningDialog() {
      this.$emit("update:limitWarningDialog", false);
      this.inpData = {
        materialTypeId: "",
        fkWarehouseId: "",
        materialName: "",
        fkBidProjectId: ""
      };
      this.searchData = {
        materialTypeId: "",
        fkWarehouseId: "",
        materialName: "",
        fkBidProjectId: ""
      };
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
    },
    openLimitDialog(type, row) {
      this.limitDialogType = type;
      if (type === 2) {
        this.limitDialogTitle = "新增物料限额";
        this.getMaterials("");
        this.limitDialog = true;
        if (this.user.orgType !== 7) {
          this.limitForm.fkWarehouseId = this.warehouseList2.length ? this.warehouseList2[0].value : "";
          this.warehouseChange();
        }
      } else if (type === 3) {
        this.limitDialogTitle = "编辑物料限额";
        this.$api.findMaterialInventoryAlertById({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.limitForm = res.data;
            this.getMaterials(res.data.fkBidProjectId ? res.data.fkBidProjectId : "");
            this.findWarehouseByProjectId(res.data.fkBidProjectId ? res.data.fkBidProjectId : "0", 2);
            this.storeNum = row.stockNum;
            // this.getMaterialsInventory(this.limitForm.fkMaterialId, this.limitForm.fkWarehouseId);
            this.limitDialog = true;
          } else {
            this.$message.warning(res.msg);
          }
        });
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
        fkWarehouseId: "",
        projectBidId: ""
      };
      this.storeNum = "";
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
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchMaterialInventoryAlertPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchMaterialInventoryAlertPage();
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
</style>
