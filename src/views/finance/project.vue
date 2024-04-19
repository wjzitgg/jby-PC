<template>
    <div class="app-container" v-loading="loading">
      <el-tabs v-model="radio" @tab-click="radioChange">
        <el-tab-pane v-if="user.orgType!==6" label="分包计价" name="1"></el-tab-pane>
        <el-tab-pane :label="user.orgType==6?'材料结算':'物资扣除'" name="2"></el-tab-pane>
        <el-tab-pane label="汇总台账" name="3"></el-tab-pane>
        <el-tab-pane label="付账往来" name="4"></el-tab-pane>
      </el-tabs>
      <div class="header-seach">
        <el-form :inline="true" class="myform" label-width="72px">
          <el-form-item label="标段项目" v-if="user.orgType !== 5">
            <el-select v-model="inpData.bidProjectId" size="mini" class="wh-200" @change="proChange" v-if="[5,6, 7].includes(user.orgType)">
              <el-option value="" label="全部" v-if="[5,6, 7].includes(user.orgType)"></el-option>
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
            <proSelct @selectIds="selectIds" v-else></proSelct>
          </el-form-item>
          <el-form-item :label="radio < 3 ? '分包单位' : radio === 3 ? '结算对象' : '支付对象'" v-if="user.orgType !== 7">
            <el-select v-model="inpData.fkCustomerId" size="mini" class="wh-200" :disabled="user.orgType === 4 && !inpData.fkBidProjectId">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in subOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="支付方式" v-if="radio == 4">
            <el-select v-model="inpData.paymentCode" size="mini" class="wh-200">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in payTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="截止日期" v-if="radio != 4">
            <el-date-picker size="mini" class="wh-200" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker>
          </el-form-item>
          <el-form-item label="结算名称" v-if="radio == 1 && user.orgType !== 7">
            <el-input v-model="inpData.settleName" size="mini" maxlength="100"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary"  icon="el-icon-search" class="ml-20 search" @click="btnSearch">查询</el-button>
        </el-form>
        <el-button size="mini" type="primary" @click="openDialog(2)" v-if="user.orgType === 5 && radio == 4" v-has="'finance:subcontractor:add'">新增</el-button>
      </div>
      <div class="table-data" style="height:75%;margin-top: 10px;" >
      <!-- 材料结算 -->
      <el-table ref="tables1"  :key="randomKey" v-if="radio == 1" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :span-method="objectSpanMethod" :tooltip-effect="'light'" :show-summary="radio == 1" :summary-method="getSummaries">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="{ row }">
            {{ (page.pageNum - 1) * page.pageSize + (row.index + 1) }}
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="fkProjectName" align="center" v-if="user.orgType === 7" show-overflow-tooltip> </el-table-column>
        <el-table-column label="分包单位" prop="customName" align="center" v-if="user.orgType !== 7"> </el-table-column>
        <el-table-column label="结算期次" prop="issue" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="本期结算周期" prop="settlePeriod" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="结算日期" prop="steeleDate" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="上期末结算金额(元)" prop="beforeAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="本期结算金额(元)" prop="amount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="本期末结算金额(元)" prop="afterAmount" align="center" show-overflow-tooltip> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 物资扣除 -->
      <el-table ref="tables2" :key="randomKey" v-if="radio == 2&&user.orgType==7" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'" :show-summary="radio == 2" :summary-method="getSummaries">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="fkProjectName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column label="分包单位" prop="customName" align="center" v-if="user.orgType !== 7" show-overflow-tooltip> </el-table-column>
        <el-table-column label="出库单号" prop="orderCode" align="center"> </el-table-column>
        <el-table-column label="物料类型" prop="materType" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="接收日期" prop="acceptDate" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="结算金额" prop="settleAmount" align="center" show-overflow-tooltip> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-table :tooltip-effect="'light'" ref="tables1" :key="randomKey" v-if="radio == 2&&user.orgType==6" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :show-summary="radio == 2" :summary-method="getSummaries">
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
      <el-table ref="tables3" :key="randomKey" v-if="radio == 3&&user.orgType==7" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'" :show-summary="radio == 3" :summary-method="getSummaries">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="fkProjectName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column label="分包单位" prop="customName" align="center" v-if="user.orgType !== 7" show-overflow-tooltip> </el-table-column>
        <el-table-column label="金额变动截止时间" prop="deadlineDate" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="分包计价" prop="priceAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="物资扣除" prop="materialDeduct" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="当前结余金额" prop="residueAmount" align="center" show-overflow-tooltip> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-table :tooltip-effect="'light'" ref="tables3" :key="randomKey" v-if="radio == 3&&user.orgType==6" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :show-summary="radio == 3" :summary-method="getSummaries">
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
      <div slot="empty" class="empty" style="width: 100%">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </el-table>
      <!-- 付账往来 -->
      <el-table ref="tables4" :key="randomKey" v-if="radio == 4" stripe :data="tableData" height="98%" row-key="pkId" :header-cell-style="{ background: '#f1f6ff' }" :tree-props="{ children: 'childList' }" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="90">
          <template slot-scope="{ row }">
            {{ row.index ? (page.pageNum - 1) * page.pageSize + row.index : "" }}
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="projectName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column label="支付对象" prop="customName" align="center" v-if="![6,7].includes(user.orgType)"> </el-table-column>
        <el-table-column label="期次名称" prop="stageName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="收款方式" align="center" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span>{{ !!row.paymentCode?payTypeList.filter(item => item.value === row.paymentCode)[0].label:'' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收款银行" prop="payChannel" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="收款日期" prop="payTime" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="累计结算金额" prop="totalSettlementAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="上期末结算金额" prop="payBalanceFront" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="当前应收金额" prop="totalUnpaidAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="本期收款" prop="payAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="本期末累计收款" prop="payBalanceAfter" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="250px">
          <template slot-scope="{ row }">
            <el-button plain size="mini" type="primary" @click="openDialog(1, row)" v-has="'finance:project:query'">查看</el-button>
            <!-- <el-button plain size="mini" type="warning" @click="openDialog(3, row)" v-if="row.operationFlag" v-has="'finance:subcontractor:update'">编辑</el-button>
            <el-button plain size="mini" type="danger" @click="handleDel(row)" v-if="row.operationFlag" v-has="'finance:subcontractor:delete'">删除</el-button> -->
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
      <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="tablePagingShow"></tablePaging>
      <!-- 付账往来弹框 -->
      <payDialog :tableType="2" :dialogTitle="dialogTitle" :id="sendId" :dialogType="dialogType" :dialogVisible="dialogVisible" @close="closeDialog" @getList="searchProjFinanceIntercoursePage"></payDialog>
    </div>
</template>

  <script>
  import payDialog from "./component/payDialog.vue";
  export default {
    components: { payDialog },
    computed: {
      user() {
        return JSON.parse(sessionStorage.getItem("user") || "{}");
      }
    },
    mounted() {
      if (this.user.orgType===6) {
        this.radio="2"
        this.getPageList()
      }
      if (this.user.orgType !== 5) {
        this.getAllProject();
      }
      if (this.user.orgType !== 7) {
        this.getSubList();
      }
      this.$store.dispatch("getDictionariesData", 14).then(res => {
        this.payTypeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
      });
      if (this.user.orgType == 7) {
        this.subCalculatePriceSearchPage();
      }
      // 测试合并
      // this.spanArr1 = this.getSpanArr(this.tableData, "id", 1);
      // this.spanArr2 = this.getSpanArr(this.tableData, "id", 2, "pkId");
    },
    data() {
      return {
        loading: false,
        radio: "1",
        proOptions: [],
        subOptions: [],
        subList: [],
        payTypeList: [],
        page: {
          pageSize: 10,
          pageNum: 1
        }, //分页数据
        total: 0, //分页总数
        tableData: [], //列表数据
        inpData: {
          endTime: "",
          fkCustomerId: "",
          bidProjectId: "",
          paymentCode: "",
          settleName: ""
        },
        searchData: {
          endTime: "",
          fkCustomerId: "",
          bidProjectId: "",
          paymentCode: "",
          settleName: ""
        },
        randomKey: Math.random(),
        dialogVisible: false,
        dialogTitle: "",
        dialogType: 1,
        tablePagingShow: true,
        spanArr1: [],
        spanArr2: [],
        sendId: "",
        beforeAmount:0,
        afterAmount:0,
        amount:0,
        priceAmount:0,//分包计价合计
        materialDeduct:0,//物资扣除合计
        residueAmount:0,//当前结余金额合计
        supplyAmount:0,
        settleAmount:0,
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
            if(column.label=='上期末结算金额(元)'){
              sums[index] = this.beforeAmount
            }
            if(column.label=='本期末结算金额(元)'){
              sums[index] = this.afterAmount
            }
          }else if(this.radio==2){
            if(column.label=='结算金额'){
              sums[index] = this.amount
            }
          }else if(this.radio==3){
            if(column.label=='分包计价'){
              sums[index] = this.priceAmount
            }
            if(column.label=='物资扣除'){
              sums[index] = this.materialDeduct
            }
            if(column.label=='累计供应'){
              sums[index] = this.supplyAmount
            }
            if(column.label=='已结算金额'){
              sums[index] = this.settleAmount
            }
            if(column.label=='当前结余金额'){
              sums[index] = this.residueAmount
            }
          }
        });
      return sums;
      },
      // 分包计价
      subCalculatePriceSearchPage() {
        let { endTime, fkCustomerId, bidProjectId, settleName } = this.searchData;
        let data = { ...this.page, endTime, customId: fkCustomerId, fkProjectId: bidProjectId, settleName };
        this.loading = true;
        this.$api
          .subCalculatePriceSearchPage(data)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              let arr = [];
              res.data.records.forEach((item, index) => {
                if (item.engSubCalculatePriceChildVos.length) {
                  item.engSubCalculatePriceChildVos.forEach(item2 => {
                    arr.push({ ...item, ...item2, index });
                  });
                } else {
                  arr.push({ ...item, index });
                }
              });
              this.spanArr1 = this.getSpanArr(arr, "pkId", 1);
              this.tableData = arr;
              this.total = res.data.total - 0;
              this.beforeAmount=res.data.beforeAmount
              this.afterAmount=res.data.afterAmount
              this.amount=res.data.amount
              this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            console.error(err);
            this.loading = false;
          });
      },
      // 物资扣除
      materialDeductSearchPage() {
        let { endTime, fkCustomerId, bidProjectId } = this.searchData;
        let data = { ...this.page, customId: fkCustomerId, fkProjectId: bidProjectId, endTime };
        this.loading = true;
        console.log(this.user.orgType);
        let api = this.user.orgType==6?this.$api.materialSettleSearchPage:this.$api.materialDeductSearchPage
        api(data)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.tableData = res.data.records.map((item, index) => ({ ...item, index: index + 1 }));
              this.total = res.data.total - 0;
              this.amount=res.data.amount
              this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      },
      // 汇总台账
      subLedgerAmountSearchPage() {
        let { endTime, fkCustomerId, bidProjectId } = this.searchData;
        let data = { ...this.page, customId: fkCustomerId, fkProjectId: bidProjectId, endTime };
        this.loading = true;
        this.$api
          .subLedgerAmountSearchPage(data)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.tableData = res.data.records.map((item, index) => ({ ...item, index: index + 1 }));
              this.total = res.data.total - 0;
              this.priceAmount=res.data.priceAmount
              this.materialDeduct=res.data.materialDeduct
              this.residueAmount=res.data.residueAmount
              this.$refs.tables3.bodyWrapper.scrollTo(0, 0);
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
            this.$refs.tables3.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
      // 付款往来
      searchProjFinanceIntercoursePage() {
        let { fkCustomerId, bidProjectId, paymentCode } = this.searchData;
        let data = { ...this.page, fkCustomerId, bidProjectId, paymentCode, customType: 4 };
        this.loading = true;
        this.$api
          .searchProjFinanceIntercoursePage(data)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.tableData = res.data.records.map((item, index) => ({ ...item, index: index + 1 }));
              this.total = res.data.total - 0;
              this.$refs.tables4.bodyWrapper.scrollTo(0, 0);
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      },
      // 获取标段项目
      getAllProject() {
        this.$api.getAllProjectInfo().then(res => {
          if (res.code === 200) {
            this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
            // if (this.user.orgType === 4) {
            //   let id = this.proOptions.length ? this.proOptions[0].value : "";
            //   this.inpData.bidProjectId = id;
            //   this.searchData.bidProjectId = id;
            //   this.subCalculatePriceSearchPage();
            // }
          } else {
            this.$message.warning(res.msg);
          }
        });
      },
      // 获取分包单位
      getSubList() {
        this.$api.subcontractor().then(res => {
          if (res.code === 200) {
            if (this.user.orgType === 5) {
              this.subOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
            } else {
              this.subList = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
      },
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
      radioChange(e) {
        this.page = {
          pageSize: 10,
          pageNum: 1
        };
        this.tableData = [];
        this.inpData = {
          endTime: "",
          fkCustomerId: "",
          bidProjectId: [5,6,7].includes(this.user.orgType)?'': this.inpData.bidProjectId,
          paymentCode: "",
          settleName: ""
        };
        this.searchData = {
          endTime: "",
          fkCustomerId: "",
          bidProjectId:  [5,6,7].includes(this.user.orgType)?'': this.searchData.bidProjectId,
          paymentCode: "",
          settleName: ""
        };
        this.randomKey = Math.random();
        this.tablePagingShow = false;
        this.$nextTick(() => {
          this.tablePagingShow = true;
        });
        if (this.user.orgType === 4 && e.name === 1) {
          let id = this.proOptions.length ? this.proOptions[0].value : "";
          this.inpData.bidProjectId = id;
          this.searchData.bidProjectId = id;
        }
        this.getPageList();
      },
      proChange(e) {
        if (e) {
          this.subOptions = this.subList.filter(item => item.fkProjectId === e);
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
          this.dialogTitle = "查看支付";
          this.sendId = row.pkId;
        } else if (type === 2) {
          this.dialogTitle = "新增收款";
        } else {
          this.dialogTitle = "编辑支付";
          this.sendId = row.pkId;
        }
        this.dialogVisible = true;
      },
      closeDialog() {
        this.dialogVisible = false;
        this.sendId = "";
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
      },
      getPageList() {
        if (this.radio == 1) {
          this.subCalculatePriceSearchPage();
        } else if (this.radio == 2) {
          this.materialDeductSearchPage();
        } else if (this.radio == 3) {
          if(this.user.orgType==6){
            this.summaryStandSearch()
          }else{
            this.subLedgerAmountSearchPage();
          }
        } else if (this.radio == 4) {
          this.searchProjFinanceIntercoursePage();
        }
      },
      // 合并行
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        // column.label,['序号','标段项目','分包单位']
        // console.log(column.label);
        // if (this.user.orgType === 4) {
        //   console.log(1);
        //   if (["序号", "标段项目"].includes(column.label)) {
        //     const _row = this.spanArr1[rowIndex];
        //     const _col = _row > 0 ? 1 : 0;
        //     return {
        //       // [0,0] 表示这一行不显示， [2,1]表示行的合并数
        //       rowspan: _row,
        //       colspan: _col
        //     };
        //   } else if (column.label === "分包单位") {
        //     const _row = this.spanArr2[rowIndex];
        //     const _col = _row > 0 ? 1 : 0;
        //     return {
        //       // [0,0] 表示这一行不显示， [2,1]表示行的合并数
        //       rowspan: _row,
        //       colspan: _col
        //     };
        //   }
        // } else {
        //   console.log(2);
        if (["序号", "标段项目", "分包单位"].includes(column.label)) {
          const _row = this.spanArr1[rowIndex];
          const _col = _row > 0 ? 1 : 0;
          return {
            // [0,0] 表示这一行不显示， [2,1]表示行的合并数
            rowspan: _row,
            colspan: _col
          };
          // }
        }
      },
      // 筛选合并行的数组
      getSpanArr(data, id, type, id2) {
        // data就是我们从后台拿到的数据
        let spanArr = [];
        let pos = "";
        for (var i = 0; i < data.length; i++) {
          if (i === 0) {
            spanArr.push(1);
            pos = 0;
          } else {
            if (type === 1) {
              // 判断当前元素与上一个元素是否相同
              if (data[i][id] === data[i - 1][id]) {
                spanArr[pos] += 1;
                spanArr.push(0);
              } else {
                spanArr.push(1);
                pos = i;
              }
            } else if (type === 2) {
              // 判断当前元素与上一个元素是否相同
              if (data[i][id] === data[i - 1][id] && data[i][id2] === data[i - 1][id2]) {
                spanArr[pos] += 1;
                spanArr.push(0);
              } else {
                spanArr.push(1);
                pos = i;
              }
            }
          }
        }
        return spanArr;
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
  /deep/ .el-tabs__header {
    background-color: #fff;
  }

  /deep/ .el-tabs__nav-wrap {
    padding-left: 20px;
  }
  </style>
