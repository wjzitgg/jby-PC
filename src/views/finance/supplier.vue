<template>
  <div class="app-container" v-loading="loading">
    <el-tabs v-model="radio" @tab-click="radioChange" v-if="typeShow">
      <el-tab-pane label="材料结算" name="1"></el-tab-pane>
      <el-tab-pane label="汇总台账" name="2"></el-tab-pane>
      <el-tab-pane label="付账往来" name="3"></el-tab-pane>
    </el-tabs>
    <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="标段项目" v-if="user.orgType !== 5">
          <el-select v-model="inpData.bidProjectId" size="mini" class="wh-200" @change="proChange" v-if="[6,7].includes(user.orgType)">
            <el-option value="" label="全部" v-if="radio == 1"></el-option>
            <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
          <proSelct @selectIds="selectIds" v-else></proSelct>
        </el-form-item>
        <el-form-item v-if="typeShow" :label="radio == 1 ? '供应商' : radio == 2 ? '结算对象' : '支付对象'">
          <el-select v-model="inpData.fkCustomerId" size="mini" class="wh-200">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in subOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式" v-if="radio == 3 && typeShow">
          <el-select v-model="inpData.paymentCode" size="mini" class="wh-200">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in payTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" v-if="radio != 2 && typeShow">
          <el-date-picker size="mini" class="wh-200" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker>
        </el-form-item>
        <el-button size="mini"  v-if="typeShow"  type="primary"  icon="el-icon-search" class="ml-20 search" @click="btnSearch">查询</el-button>
      </el-form>
      <el-button size="mini" type="primary" @click="openDialog(2)" v-if="radio == 3" v-has="'finance:supplier:add'">新增</el-button>
    </div>
    <div class="table-data" style="height:75%;margin-top: 10px;"   v-if="typeShow" >
    <!-- 材料结算 -->
    <el-table :tooltip-effect="'light'" ref="tables1" :key="randomKey" v-if="radio == 1" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :show-summary="radio == 1" :summary-method="getSummaries">
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          <div style="text-align: center">
            {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="标段项目" prop="projectName" align="center" v-if="user.orgType ===6" show-overflow-tooltip> </el-table-column>
      <el-table-column label="供应商" prop="customName" align="center" v-if="user.orgType !== 6" show-overflow-tooltip> </el-table-column>
      <el-table-column label="单据编号" prop="inventoryName" align="center"> 
        <template slot-scope="{ row }">
          <span class="blue" @click="orderClick(row)">{{ row.inventoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料类型" prop="materialType" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="检测日期" prop="checkDate" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="单据金额" prop="materialAmount" align="center" show-overflow-tooltip> </el-table-column>
      <div slot="empty" class="empty" style="width: 100%">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </el-table>
    <!-- 汇总台账 -->
    <el-table :tooltip-effect="'light'" ref="tables2" :key="randomKey" v-if="radio == 2" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :show-summary="radio == 2" :summary-method="getSummaries">
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          <div style="text-align: center">
            {{ scope.$index + 1 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="标段项目" prop="projectName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
      <el-table-column label="供应商" prop="customName" align="center" v-if="user.orgType !== 6" show-overflow-tooltip> </el-table-column>
      <!-- <el-table-column label="截止时间" prop="deadline" align="center" show-overflow-tooltip> </el-table-column> -->
      <el-table-column label="累计供应金额" prop="supplyAmountTotal" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="已结算金额" prop="settleAmount" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="当前结余金额" prop="residueAmount" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="操作" align="center" width="250px">
        <template slot-scope="{ row }">
          <el-button plain size="mini" type="primary" @click="openSumDialog(row)" v-has="'finance:supplier:query'">查看明细</el-button>
        </template>
      </el-table-column>
      <div slot="empty" class="empty" style="width: 100%">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </el-table>
    <!-- 付账往来 -->
    <!--  :show-summary="radio == 3" :summary-method="getSummaries" -->
    <el-table :tooltip-effect="'light'" ref="tables3" :key="randomKey" v-if="radio == 3" stripe :data="tableData" height="98%" row-key="pkId" :header-cell-style="{ background: '#f1f6ff' }" :tree-props="{ children: 'childList' }">
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="标段项目" prop="" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column> -->
      <el-table-column label="供应商" prop="customName" align="center" v-if="user.orgType !== 7" show-overflow-tooltip> </el-table-column>
      <el-table-column label="期次名称" prop="stageName" align="center"> </el-table-column>
      <el-table-column label="支付方式" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span>{{ payTypeList.filter(item => item.value === row.paymentCode)[0].label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付单号" prop="payChannel" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="支付日期" prop="payTime" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="累计结算金额" prop="totalSettlementAmount" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="上期末结算金额" prop="payBalanceFront" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="当前应付金额" prop="totalUnpaidAmount" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="本期付款" prop="payAmount" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="本期末累计付款" prop="payBalanceAfter" align="center" show-overflow-tooltip> </el-table-column>
      <el-table-column label="操作" align="center" width="250px">
        <template slot-scope="{ row }">
          <el-button plain size="mini" type="primary" @click="openDialog(1, row)" v-has="'finance:supplier:query'">查看</el-button>
          <el-button plain size="mini" type="success" @click="openDialog(3, row)" v-if="row.operationFlag" v-has="'finance:supplier:update'">编辑</el-button>
          <el-button plain size="mini" type="danger" @click="handleDel(row)" v-if="row.operationFlag" v-has="'finance:supplier:delete'">删除</el-button>
        </template>
      </el-table-column>
      <div slot="empty" class="empty" style="width: 100%">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </el-table>
  </div>
    <!-- 分页组件 -->
    <!-- :pageSizes="[3, 5, 10, 20]" -->
    <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="tablePagingShow && typeShow"></tablePaging>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 付账往来弹框 -->
    <payDialog :tableType="1" :dialogTitle="dialogTitle" :id="sendId" :dialogType="dialogType" :dialogVisible="dialogVisible" @close="closeDialog" @getList="searchProjFinanceIntercoursePage"></payDialog>
    <!-- 汇总台账弹框 -->
    <el-dialog title="供货流水明细" :visible="sumDialog" width="60%" @close="closeSumDialog" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <h3 class="title">{{ customerName }}供货流水</h3>
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="物料类型">
          <!-- <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="sumDialogSearchData.materialTypeId" filterable></el-cascader> -->
          <el-select v-model="sumDialogSearchData.materialTypeId" size="mini" class="wh-200">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in materOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker size="mini" class="wh-200" value-format="yyyy-MM-dd" v-model="sumDialogSearchData.endTime"></el-date-picker>
        </el-form-item>
      </el-form>
      <div class="tables">
        <el-table :tooltip-effect="'light'" ref="sumDialogTable" stripe :data="sumDialogData" height="100%" :header-cell-style="{ background: '#f1f6ff'}" v-loading="loading2">
          <el-table-column label="序号" align="center" width="80">
            <template slot-scope="scope">
              {{ (dialogPage.pageNum - 1) * dialogPage.pageSize + (scope.$index + 1) }}
            </template>
          </el-table-column>
          <el-table-column label="入库单号" prop="inventoryName" align="center"> </el-table-column>
          <el-table-column label="物料类型" prop="materialType" align="center"> </el-table-column>
          <el-table-column label="检验日期" prop="checkDate" align="center"> </el-table-column>
          <el-table-column label="单据金额" prop="materialAmount" align="center"> </el-table-column>
          <el-table-column label="结余金额" prop="afterAmount" align="center"> </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <tablePaging :pageSize="dialogPage.pageSize" :total="dialogTotal" :currentPage="dialogPage.pageNum" @handleSizeChange="handleSizeChange2" @handleCurrentChange="handleCurrentChange2"></tablePaging> 
      </div>

    </el-dialog>
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"> </checkOrderDialog>
  </div>
</template>

<script>
import payDialog from "./component/payDialog.vue";
import checkOrderDialog from "../supplies/components/checkOrderDialog.vue"; // 查询出入库单信息
export default {
  components: { payDialog,checkOrderDialog },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
      } else {
        this.$message.error(res.msg);
      }
    });
    if (this.user.orgType !== 5) {
      this.getAllProject();
    }
    if (this.user.orgType === 5) {
      this.getSubList();
    }
    this.getItemClass(14);
    this.getSelfMaterialTypes();
    this.materialSettleSearchPage();
  },
  data() {
    return {
      loading: false,
      loading2: false,
      radio: '1',
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      randomKey: Math.random(),
      proOptions: [],
      subOptions: [],
      subList: [],
      payTypeList: [],
      tableData: [], //列表数据
      inpData: {
        endTime: "",
        fkCustomerId: "",
        bidProjectId: "",
        paymentCode: ""
      },
      searchData: {
        endTime: "",
        fkCustomerId: "",
        bidProjectId: "",
        paymentCode: ""
      },
      dialogVisible: false,
      dialogTitle: "",
      dialogType: 1,
      tablePagingShow: true,
      sumDialog: false,
      sumDialogSearchData: {
        materialTypeId: "",
        customId: "",
        projectBidId: "",
        endTime: ""
      },
      sumDialogData: [],
      dialogPage: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      dialogTotal: 0,
      materOptions: [],
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      spanArr1: [],
      spanArr2: [],
      sendId: "",
      customerName: "",
      checkOrderDialog: false,
      orderType: 4,
      orderPkId: "",
      amount:0,
      supplyAmount:0,//累计供应合计
      settleAmount:0,//已结算金额合计
      residueAmount:0,//当前结余金额合计
      totalSettlementAmount:0,//累计结算金额合计
      payBalanceFront:0,//上期末累计付款合计
      totalUnpaidAmount:0,//当前应付金额合计
      payAmount:0,//本期付款合计
      payBalanceAfter:0,//本期末累计付款合计
      typeShow:true
    };
  },
  methods: {
    selectIds(arr,obj,isTrue){
      if(arr.length){
        if(arr.length>1){
          this.inpData.bidProjectId=arr[1]
        }else{
          this.inpData.bidProjectId=arr[0]
        }
        if(isTrue){
          this.btnSearch();
        }
         this.proChange(this.inpData.bidProjectId)
      }
    },
    getSummaries(param){
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = "合计";
            return;
          }
          if(this.radio==1){
            if(column.label=='本期结算金额(元)'){
              sums[index] = this.amount
            }
          }else if(this.radio==2){
            if(column.label=='累计供应'){
              sums[index] = this.supplyAmount
            }
            if(column.label=='已结算金额'){
              sums[index] = this.settleAmount
            }
            if(column.label=='当前结余金额'){
              sums[index] = this.residueAmount
            }
          }else if(this.radio==3){
            if(column.label=='累计结算金额'){
              sums[index] = this.totalSettlementAmount
            }
            if(column.label=='上期末累计付款'){
              sums[index] = this.payBalanceFront
            }
            if(column.label=='当前应付金额'){
              sums[index] = this.totalUnpaidAmount
            }
            if(column.label=='本期付款'){
              sums[index] = this.payAmount
            }
            if(column.label=='本期末累计付款'){
              sums[index] = this.payBalanceAfter
            }
          }
        });
      return sums;
      },
    orderClick(item) {
      this.orderType = item.inventoryType=='0'?5:item.inventoryType=='1'?4:''
      this.orderPkId = item.inventoryId;
      this.checkOrderDialog = true;
    },
    // 材料结算
    materialSettleSearchPage() {
      let { fkCustomerId, bidProjectId, endTime } = this.searchData;
      let data = { ...this.page, customId: fkCustomerId, projectBidId: bidProjectId, endTime };
      this.loading = true;
      this.$api
        .materialSettleSearchPage(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.amount=res.data.amount
            this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 汇总台账
    summaryStandSearch() {
      let { fkCustomerId, bidProjectId } = this.searchData;
      let data = { ...this.page, customId: fkCustomerId, projectBidId: bidProjectId };
      this.loading = true;
      this.$api
        .summaryStandSearch(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.supplyAmount=res.data.supplyAmount
            this.settleAmount=res.data.settleAmount
            this.residueAmount=res.data.residueAmount
            this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 付账往来
    searchProjFinanceIntercoursePage() {
      let { fkCustomerId, bidProjectId, paymentCode ,endTime} = this.searchData;
      let data = { ...this.page, fkCustomerId, bidProjectId, paymentCode,endTime, customType: 3 };
      this.loading = true;
      this.$api
        .searchProjFinanceIntercoursePage(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.totalSettlementAmount=res.data.totalSettlementAmount
            this.payBalanceFront=res.data.payBalanceFront
            this.totalUnpaidAmount=res.data.totalUnpaidAmount
            this.payAmount=res.data.payAmount
            this.payBalanceAfter=res.data.payBalanceAfter
            this.$refs.tables3.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
        });
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
    // 获取供应商
    getSubList() {
      this.$api.searchCustomNoLinkOrgId({ customType: 3,projectBidId: this.inpData.bidProjectId}).then(res => {
        if (res.code === 200) {
            this.subOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 字典查询
    getItemClass(dictType) {
      this.$api.getItemClass({ dictType }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
          if (dictType === 14) {
            this.payTypeList = arr;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取材料分类
    // conditionMaterialclassify() {
    //   this.$api.conditionMaterialclassify().then(res => {
    //     if (res.code === 200) {
    //       this.materOptions = res.data;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
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
    radioChange(e) {
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.inpData = {
        endTime: "",
        fkCustomerId: "",
         bidProjectId:  [5,6,7].includes(this.user.orgType)?'': this.inpData.bidProjectId,
        paymentCode: ""
      };
      this.searchData = {
        endTime: "",
        fkCustomerId: "",
         bidProjectId:  [5,6,7].includes(this.user.orgType)?'': this.searchData.bidProjectId,
        paymentCode: ""
      };
      this.tableData = [];
      this.randomKey = Math.random();
      this.tablePagingShow = false;
      this.$nextTick(() => {
        this.tablePagingShow = true;
      });
      this.getPageList();
    },
    proChange(e) {
      if (e) {
        this.getSubList()
      }
      
    },
    handleDel(row) {
      this.$confirm("确定删除该支付?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delProjFinanceIntercourse({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("操作成功");
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.searchProjFinanceIntercoursePage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    openDialog(type, row) {
      this.dialogType = type;
      if (type === 1) {
        this.dialogTitle = "查看支付记录";
        this.sendId = row.pkId;
      } else if (type === 2) {
        this.dialogTitle = "新增支付记录";
      } else {
        this.dialogTitle = "编辑支付记录";
        this.sendId = row.pkId;
      }
      this.dialogVisible = true;
    },
    closeDialog() {
      this.dialogVisible = false;
      this.sendId = "";
    },
    openSumDialog(row) {
      this.sumDialog = true;
      this.sumDialogSearchData.customId = row.customId;
      this.customerName = row.customName;
      // this.dialogMaterialSettleSearchPage();
    },
    dialogMaterialSettleSearchPage() {
      let data = { ...this.dialogPage, ...this.sumDialogSearchData };
      this.loading2 = true;
      this.$api
        .materialSettleSearchPage(data)
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.sumDialogData = res.data.records;
            this.dialogTotal = res.data.total - 0;
            this.$refs.sumDialogTable.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 弹框pageSize改变
    handleSizeChange2(val) {
      this.dialogPage.pageSize = val;
      this.dialogMaterialSettleSearchPage();
    },
    // 弹框current改变
    handleCurrentChange2(val) {
      this.dialogPage.pageNum = val;
      this.dialogMaterialSettleSearchPage();
    },
    closeSumDialog() {
      this.sumDialog = false;
      this.sumDialogData = [];
      this.sumDialogSearchData = {
        materialTypeId: "",
        customId: "",
        projectBidId: "",
        endTime: ""
      };
      this.dialogPage = {
        pageSize: 10,
        pageNum: 1
      };
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.getPageList();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getPageList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getPageList();
    },
    // 获取分页列表
    getPageList() {
      if (this.radio == 1) {
        this.materialSettleSearchPage();
      } else if (this.radio == 2) {
        this.summaryStandSearch();
      } else if (this.radio == 3) {
        this.searchProjFinanceIntercoursePage();
      }
    }
  },
  watch: {
    sumDialogSearchData: {
      deep: true,
      handler(val) {
        if (this.sumDialog) {
          this.dialogPage.pageNum = 1;
          this.dialogMaterialSettleSearchPage();
        }
      }
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
  border-radius: 5px;
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
.mr-20 {
  margin-right: 20px;
}
.title {
  margin: 10px 0;
}
.tables {
  height: 450px;
}
/deep/ .el-tabs__header {
  background-color: #fff;
}
/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
.blue {
  color: #02aff4;
  cursor: pointer;
}
</style>
