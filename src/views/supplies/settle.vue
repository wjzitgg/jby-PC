<template>
  <div class="app-container">
    <!-- 头部tab栏 -->
    <!-- <el-radio-group v-model="topRadio" size="mini" @change="roleCut" v-if="user.orgType < 6">
      <el-radio-button :label="4">分包单位扣款</el-radio-button>
      <el-radio-button :label="3">供应商结算</el-radio-button>
    </el-radio-group> -->
    <div class="topTabs" v-if="typeShow">
      <el-tabs v-model="topRadio" v-if="[4, 5, 10].includes(user.orgType)" @tab-click="roleCut">
        <el-tab-pane label="分包单位结算" name="4"></el-tab-pane>
        <el-tab-pane label="供应账单" name="3"></el-tab-pane>
      </el-tabs>
    </div>
    <div class="dirver"></div>
    <!-- 头部搜索 -->
    <div class="search-bgc search-mr">
      <el-form :model="searchData" class="form-data">
        <el-form-item label="标段项目" label-width="80px" v-if="user.orgType != 5">
          <el-select v-model="searchData.fkBidProjectId" size="mini" @change="projectIdChange" v-if="[6, 7].includes(user.orgType)">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <proSelct @selectIds="selectIds" v-else></proSelct>
        </el-form-item>

        <el-form-item label="分包单位" label-width="80px" v-if="topRadio == 4 && user.orgType != 7 && typeShow">
          <el-select v-model="searchData.fkCustomerId" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" label-width="80px" v-if="topRadio == 3 && user.orgType != 6 && typeShow">
          <el-select v-model="searchData.fkCustomerId2" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in options2" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物料类型" label-width="90px" v-if="typeShow">
          <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="searchData.materialTypeId" filterable></el-cascader>
        </el-form-item>
        <el-form-item :label="topRadio == 4 ? '签收时间' : '检验日期'" label-width="80px" v-if="typeShow">
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.beginTime"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
        </el-form-item>
        <el-button size="mini" v-if="typeShow" type="primary" class="seek" icon="el-icon-search" @click="queryData">查询</el-button>
      </el-form>
    </div>
    <div class="tab-container" v-if="typeShow">
      <div class="table-data" style="height: 68%">
        <!-- show-summary :summary-method="getSummaries" -->
        <el-table :data="tableData" v-loading="loading" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" ref="tableBox" v-if="topRadio == 4">
          <el-table-column align="center" label="序号" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="标段项目" prop="fkProjectName" v-if="user.orgType != 5" />
          <el-table-column align="center" label="分包单位" prop="customName" v-if="user.orgType == 4 || user.orgType == 5" />
          <el-table-column align="center" label="单据编号" prop="orderCode" />
          <el-table-column align="center" label="供货/退货" prop="inventoryType" v-if="user.orgType == 4">
            <template slot-scope="{ row }">
              <div v-if="row.type == 0">供货</div>
              <div v-if="row.type == 1">退货</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="检验日期" prop="acceptDate" v-if="user.orgType == 4" />
          <el-table-column align="center" label="签收日期" prop="acceptDate" v-else />
          <el-table-column align="center" label="物料类型" prop="materType" />
          <el-table-column align="center" label="上期末结算金额(元)" prop="settleBeforeAmount">
            <template slot-scope="{ row }">{{ pricePermission ? row.settleBeforeAmount : "***" }}</template>
          </el-table-column>
          <el-table-column align="center" label="本期金额(元)" prop="settleAmount">
            <template slot-scope="{ row }">{{ pricePermission ? row.settleAmount : "***" }}</template>
          </el-table-column>
          <el-table-column align="center" label="本期末累计金额(元)" prop="settleAfterAmount">
            <template slot-scope="{ row }">{{ pricePermission ? row.settleAfterAmount : "***" }}</template>
          </el-table-column>
           <el-table-column label="操作" align="center" width="300">
            <template slot-scope="{ row }">
              <el-button size="mini" plain @click="checkOrder(row, 1)">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <!-- show-summary :summary-method="getSummaries" -->
        <el-table :data="tableData2" v-loading="loading" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" ref="tableBox2" v-if="topRadio == 3">
          <el-table-column align="center" label="序号" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="标段项目" prop="projectName" v-if="user.orgType != 5" />
          <el-table-column align="center" label="供应商" prop="customName" v-if="user.orgType == 4 || user.orgType == 5" />
          <el-table-column align="center" label="单据编号" prop="inventoryName" />
          <el-table-column align="center" label="供货/退货" prop="inventoryType" v-if="user.orgType == 4">
            <template slot-scope="{ row }">
              <div v-if="row.inventoryType == 0">供货</div>
              <div v-if="row.inventoryType == 1">退货</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="检验日期" prop="checkDate" />
          <el-table-column align="center" label="物料类型" prop="materialType" />
          <el-table-column align="center" label="上期末结算金额(元)" prop="beforeAmount">
            <template slot-scope="{ row }">{{ pricePermission ? row.beforeAmount : "***" }}</template>
          </el-table-column>
          <el-table-column align="center" label="本期金额(元)" prop="materialAmount">
            <template slot-scope="{ row }">{{ pricePermission ? row.materialAmount : "***" }}</template>
          </el-table-column>
          <el-table-column align="center" label="本期末累计金额(元)" prop="afterAmount">
            <template slot-scope="{ row }">{{ pricePermission ? row.afterAmount : "***" }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="300">
            <template slot-scope="{ row }">
              <el-button size="mini" plain @click="checkOrder(row, 2)">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"> </checkOrderDialog>
  </div>
</template>

<script>
import pageInation from "../../components/tablePaging";
import checkOrderDialog from "../supplies/components/checkOrderDialog.vue"; // 查询出入库单信息
export default {
  name: "settle",
  data() {
    return {
      topRadio: "4",
      // 搜索数据
      searchData: {
        fkBidProjectId: "",
        fkCustomerId: "", // 分包单位
        fkCustomerId2: "", // 供应商
        beginTime: "",
        endTime: "",
        materialTypeId: "" // 物料分类 id
      },
      // 分页数据
      pageNum: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      noProjectData: [],
      options: [], // 分包单位下拉
      options2: [], // 供应商下拉
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      materOptions: [],
      tableData: [],
      tableData2: [],
      pako: "",
      all: "", // 所有合计金额
      subtotal: "", // 当前页小计
      typeShow: true,
      checkOrderDialog:false,
      orderType: 4,
      orderPkId: "",
    };
  },
  components: {
    pageInation,
    checkOrderDialog
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    pricePermission() {
      const arr = this.$store.state.menuData.filter(item => item.menuCode == "supplies");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    }
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        if (this.user.orgType == 6) {
          this.topRadio = "3";
        }
        if (this.user.orgType == 4 || this.user.orgType == 7) {
          this.getItemListNoUserId();
        }
        if (this.user.orgType == 5) {
          this.supplier("", 4);
        }
        // 获取物料分类
        this.conditionMaterialclassify();
        this.getData(this.topRadio);
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    checkOrder(row,type){
      // 1申请单；2采购单，3：发料单，4出库单，5入库单，6盘点单
      if(type==1){
        this.orderType =row.inventoryType==0?4:5
        this.orderPkId = row.inventoryId
        this.checkOrderDialog = true
      }else if(type==2){
        this.orderType =row.inventoryType==0?5:4
        this.orderPkId = row.inventoryId
        this.checkOrderDialog = true
      }
    },
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.searchData.fkBidProjectId = arr[1];
        } else {
          this.searchData.fkBidProjectId = arr[0];
        }
        if (isTrue) {
          this.queryData();
        }
        this.projectIdChange(this.searchData.fkBidProjectId);
      }
    },
    roleCut(val) {
      // 清空搜索条件
      Object.keys(this.searchData).forEach(key => {
        if (this.searchData[key] instanceof Array) {
          this.searchData[key] = [];
        } else {
          this.searchData[key] = "";
        }
      });
      this.options = [];
      this.options2 = [];
      if (this.user.orgType == 5) {
        this.supplier("", this.topRadio);
      }
      this.getData(this.topRadio);
    },
    // 获取分页列表
    getData(typeNum) {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        beginTime: this.searchData.beginTime,
        endTime: this.searchData.endTime,
        customId: this.topRadio == 4 ? this.searchData.fkCustomerId : this.searchData.fkCustomerId2, // 按钮为3传供应商 4为传分包单位
        materialTypeId: this.searchData.materialTypeId
      };
      // 标段项目 fkProjectId  projectBidId传参参数不同 所以判断
      if (this.topRadio == 4) {
        params.fkProjectId = this.searchData.fkBidProjectId;
      } else {
        params.projectBidId = this.searchData.fkBidProjectId;
      }
      // const obj = { ...params, ...this.searchData };
      this.loading = true;
      // typeNum 4 分包单位  3 供应商
      if (typeNum == 4) {
        this.$api
          .subcontractorDeduction(params)
          .then(res => {
            if (res.code === 200) {
              this.tableData = res.data.records;
              this.total = res.data.total - 0;
              if (this.tableData.length) {
                this.all = res.data.records[0].amount;
                this.subtotal = res.data.records[0].subtotal;
              }

              this.loading = false;
            } else {
              this.loading = false;
              this.$message.warning(res.msg);
            }
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.$api
          .settlementSuppliers(params)
          .then(res => {
            if (res.code === 200) {
              this.tableData2 = res.data.records;
              if (this.tableData2.length) {
                this.all = res.data.records[0].amount;
                this.subtotal = res.data.records[0].subtotal;
              }
              this.total = res.data.total - 0;
              this.loading = false;
            } else {
              this.loading = false;
              this.$message.warning(res.msg);
            }
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
    // 施工单位登录 根据标段id获取分包单位下拉列表
    projectIdChange(id) {
      this.searchData.fkCustomerId = "";
      this.searchData.fkCustomerId2 = "";
      //  选择如果是全部清空分包单位列表
      if (id == "") {
        this.searchData.fkCustomerId = "";
        this.searchData.fkCustomerId2 = "";
        this.options = [];
        this.options2 = [];
      } else if (this.user.orgType == 4 || this.user.orgType == 10) {
        this.supplier(id, this.topRadio);
      }
    },
    // 获取标段项目
    getItemListNoUserId() {
      this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });

          this.noProjectData = res.data;
        }
      });
    },
    // 获取供应商
    supplier(id, num) {
      this.$api.searchNoLinkOrgId({ projectBidId: id, customType: num }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.pkId;
          });
          if (this.topRadio == 4) {
            this.options = res.data;
          } else {
            this.options2 = res.data;
          }
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
    // 外面搜索按钮
    queryData() {
      this.pageNum = 1;
      this.getData(this.topRadio);
    },
    // 总价
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (column.label === "结算前结算金额(元)") {
          sums[index] = (
            <p>
              当前页小计
              <br />
              <br />
              合计
              <br />
            </p>
          );
        }
        if (column.label === "结算金额(元)" || column.label === "单据金额(元)") {
          sums[index] = (
            <p>
              {this.pricePermission ? this.subtotal : "***"}
              <br />
              <br />
              {this.pricePermission ? this.all : "***"}
              <br />
            </p>
          );
        }
      });
      return sums;
    },

    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData(this.topRadio);
      this.$refs.tableBox.bodyWrapper.scrollTo(0, 0);
      this.$refs.tableBox2.bodyWrapper.scrollTo(0, 0);
    },
    // 点击那一页
    handleCurrentChange(data) {
      this.pageNum = data;
      this.getData(this.topRadio);
      this.$refs.tableBox.bodyWrapper.scrollTo(0, 0);
      this.$refs.tableBox2.bodyWrapper.scrollTo(0, 0);
    }
  }
};
</script>

<style lang="scss" scoped>
.topTabs {
  padding: 5px;
  background-color: #fff;
}
.form-data {
  display: flex;
  align-items: center;
  height: 80px;
  background-color: #fff;
  /deep/ .el-form-item {
    margin-bottom: 0 !important;
  }
}
.seek {
  margin-left: 20px;
  height: 28px;
}
.dirver {
  height: 12px;
  background-color: #fafbfc;
}
</style>
