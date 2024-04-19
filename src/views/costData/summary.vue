<template>
  <!-- 成本汇总 -->
  <div class="tab-container" v-loading="loading">
    <div class="searchBar">
      <div>
        <span class="fs-14">汇总周期</span>
        <el-date-picker size="mini" value-format="yyyy-MM-dd" :clearable="false" v-model="endTime" @change="endTimeChange"></el-date-picker>
        <span class="fs-14">至今</span>
      </div>
    </div>
    <div class="table-data">
      <div class="left-table">
        <div class="total">
          <div class="total-item">
            <div class="total-item-title">上期末成本</div>
            <div class="total-item-content">{{ topData.lastCost }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">本期成本</div>
            <div class="total-item-content">{{ topData.currentCost }}</div>
          </div>
          <div class="total-item">
            <div class="total-item-title">累计成本</div>
            <div class="total-item-content">{{ topData.costAmount }}</div>
          </div>
        </div>
        <div class="tables">
          <el-table :tooltip-effect="'light'" height="100%" ref="tables" stripe :tree-props="{ children: 'childList' }" row-key="subOrgId" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
            <!-- <el-table-column align="center" label="建设单位" prop="projectName" show-overflow-tooltip v-if="user.orgType == 11 || user.orgType == 12" >
            <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">建设单位</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="项目" prop="projectName" show-overflow-tooltip v-if="user.orgType == 2" />
            <el-table-column align="center" label="下属单位" prop="projectName" show-overflow-tooltip v-if="user.orgType == 10" >
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">建设单位</span>
              </template>
            </el-table-column> -->
            <el-table-column align="center" label="标段项目" prop="subUnitName" show-overflow-tooltip>
              <template slot="header" slot-scope="{ row }">
                <i class="el-icon-s-operation" v-if="user.orgType != 4" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
                <span :cleanRed="row">{{ user.orgType == 4 ? "标段项目" : "下属单位" }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="上期末成本" prop="lastCost" show-overflow-tooltip />
            <el-table-column align="center" label="本期成本" prop="currentCost" show-overflow-tooltip />
            <el-table-column align="center" label="累计成本" prop="costAmount" show-overflow-tooltip />
            <el-table-column align="center" label="查看详情" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <el-button type="primary" size="mini" @click="check(row)" v-if="!row.childList">查看</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
      </div>
      <Echart v-if="clicle.length != 0" :option="clicle[0]" echartName="clicle" :mystyle="'width: 25vw;height: 26vw;'" />
      <div v-if="clicle.length == 0" style="width: 25vw" class="tabelsInfo-main empty">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </div>
    <el-dialog title="成本信息" :visible.sync="dialogVisible" width="70%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form h-600">
        <!-- <el-table :data="editData" ref="tables" stripe height="595px" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column align="center" label="序号" width="80" type="index"></el-table-column>
          <el-table-column align="center" prop="signDate" label="月份" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="signDate" label="分包成本" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="signDate" label="物资成本" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="signDate" label="设备成本" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="signDate" label="管理成本" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="signDate" label="合计成本" show-overflow-tooltip> </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table> -->
        <el-tabs v-model="radio" @tab-click="radioChange">
          <el-tab-pane label="分包成本" name="1"></el-tab-pane>
          <el-tab-pane label="物资成本" name="2"></el-tab-pane>
          <el-tab-pane label="设备成本" name="3"></el-tab-pane>
          <el-tab-pane label="管理成本" name="4"></el-tab-pane>
          <el-tab-pane label="成本核算" name="5"></el-tab-pane>
        </el-tabs>
        <div class="search-right">
          <el-radio-group v-model="radio2" v-if="radio == 2" :class="{ 'mr-20': radio2 == 1 }" @change="materialRadio">
            <el-radio :label="1">自使用物资</el-radio>
            <el-radio :label="2">甲供不扣款</el-radio>
          </el-radio-group>
          <el-radio-group v-model="radio3" v-if="radio == 3" class="mr-20" @change="materialRadio">
            <el-radio :label="1">设备购买</el-radio>
            <el-radio :label="2">设备租赁</el-radio>
          </el-radio-group>
          <el-radio-group v-model="radio4" v-if="radio == 5" @change="materialRadio">
            <el-radio :label="0">月汇总</el-radio>
            <el-radio :label="1">季汇总</el-radio>
            <el-radio :label="2">年汇总</el-radio>
          </el-radio-group>
        </div>
        <div class="table-data" style=" margin-top: 10px">
          <!--分包成本 -->
          <el-table ref="tables1" stripe :data="editData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 1" :tooltip-effect="'light'">
            <el-table-column label="序号" align="center" width="80" type="index"></el-table-column>
            <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
            <el-table-column label="结算对象" prop="settleOrgName" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="合同名称" prop="settleName" align="center"> </el-table-column>
            <el-table-column label="合同签订日期" prop="settleCycle" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="总设计产值（元）" prop="settleAmount" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作" align="center" width="120">
              <template slot-scope="{ row }">
                <el-button plain size="mini" type="primary" @click="checkDetail(row)">查看明细</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <!--物资成本 -->
          <el-table ref="tables2" stripe :data="editData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 2" :tooltip-effect="'light'">
            <el-table-column label="序号" align="center" width="80" type="index"></el-table-column>
            <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType === 4" show-overflow-tooltip> </el-table-column>
            <el-table-column label="分包单位" prop="customName" align="center" v-if="radio2 === 2" show-overflow-tooltip> </el-table-column>
            <el-table-column label="合同名称" prop="contractName" align="center" v-if="radio2 === 2" show-overflow-tooltip> </el-table-column>
            <el-table-column label="材料类别" prop="materialTypeName" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="材料名称" prop="materialName" align="center"> </el-table-column>
            <el-table-column label="单价" prop="price" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="单位" prop="unitName" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="计划量" prop="planNum" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="合计" prop="totalPrice" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="{ row }">
                <el-button size="mini" @click="checkMater(row)">查看明细</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <!--设备成本 -->
          <el-table ref="tables3" stripe :data="editData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 3" :tooltip-effect="'light'">
            <el-table-column label="序号" align="center" width="80" type="index"></el-table-column>
            <!-- <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType === 4" show-overflow-tooltip> </el-table-column>
            <el-table-column label="期名" prop="issueName" align="center" v-if="tableType === 2" show-overflow-tooltip> </el-table-column> -->
            <el-table-column label="设备类型" prop="className" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column label="设备名称" prop="deviceName" align="center"> </el-table-column>
            <!-- <el-table-column label="设备型号" prop="deviceCode" align="center" v-if="tableType === 2" show-overflow-tooltip> </el-table-column> -->
            <el-table-column :label="(radio3 === 1 ? '购买' : '租赁') + '单价（元）'" prop="price" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column :label="(radio3 === 1 ? '折旧' : '租赁') + '期限（月）'" prop="liveTime" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column :label="(radio3 === 1 ? '月折旧价' : '月租金') + '（元）'" prop="depreciationPrice" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column :label="(radio3 === 1 ? '购买' : '租赁') + '数量（单位）'" prop="buyNum" align="center" show-overflow-tooltip> </el-table-column>
            <!-- <el-table-column :label="(radio3 === 1 ? '月折旧金额' : '月租金') + '合计'" :prop="tableType === 1 ? 'priceAmount' : 'priceTotal'" align="center" show-overflow-tooltip> </el-table-column> -->
            <el-table-column label="操作" align="center" width="100px">
              <template slot-scope="{ row }">
                <el-button plain size="mini" type="primary" @click="openFacility(1, row, 3)">查看</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <!--管理成本 -->
          <el-table ref="tables4" stripe :data="editData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 4" :tooltip-effect="'light'">
            <el-table-column label="序号" type="index" align="center" width="80"> </el-table-column>
            <el-table-column label="费用类别" prop="className" align="center"> </el-table-column>
            <el-table-column label="费用" prop="costAmount" align="center" show-overflow-tooltip> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <!--成本核算 （实际）-->
          <el-table ref="tables5" stripe :data="editData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 5" :show-summary="radio == 5" :summary-method="getSummaries">
            <!-- ['月份', '季度', '年度'] -->
            <!-- <el-table-column label="序号" align="center" type="index"> </el-table-column> -->
            <el-table-column label="月份" align="center" v-if="radio4 === 0">
              <template slot-scope="{ row }">
                {{ row.monthly + "月" }}
              </template>
            </el-table-column>
            <el-table-column label="季度" align="center" v-if="radio4 === 1">
              <template slot-scope="{ row }">
                {{ "第" + row.quarter + "季度" }}
              </template>
            </el-table-column>
            <el-table-column label="年度" align="center" v-if="radio4 === 2">
              <template slot-scope="{ row }">
                {{ row.year + "年" }}
              </template>
            </el-table-column>
            <el-table-column label="分包成本" prop="customCost" align="center"> </el-table-column>
            <el-table-column label="物资成本" prop="materialCost" align="center"> </el-table-column>
            <el-table-column label="设备成本" prop="deviceCost" align="center"> </el-table-column>
            <el-table-column label="管理成本" prop="costManage" align="center"> </el-table-column>
            <el-table-column label="合计成本" prop="totalAmount" align="center"> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
    </el-dialog>
    <subDialog :dialogVisible.sync="checkDialog2" :dialogType="4" :orgType="user.orgType" :pkId="pkId"
      :settlementObject="1" :getItemOrgType="'1'" />
    <!--分包成本 查看明细弹框（责任） -->
    <ContractDialog :dialogVisible.sync="checkDialog1" :dialogShowType="1" :id="4" :user="$store.state.user" ref="ContractDialog" />
    <!-- 物资成本弹框(实际) -->
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"></checkOrderDialog>
    <!-- 设备成本弹框 -->
    <facilityDialog :facilityDialogTitle="facilityDialogTitle" :tableType="2" :moreShow="true" :facilityDialog="facilityDialog" @closeFacilityDialog="closeFacilityDialog" :openType="1" :dialogType="radio3" :deviceId="deviceId"></facilityDialog>
  </div>
</template>
  
  <script>
import Echart from "@/components/Echart.vue";
// import PlanTable2 from "./PlanTable2.vue";
import Pagination from "@/components/tablePaging";
import ContractDialog from "../contract/components/ContractDialog.vue";
import checkOrderDialog from "../supplies/components/checkOrderDialog.vue";
import facilityDialog from "../cost/component/facilityDialog.vue";
import subDialog from "../settlement/components/subDialog.vue";
export default {
  components: { Pagination, Echart, ContractDialog, checkOrderDialog, facilityDialog ,subDialog},
  props: {
    //   0为年度，1为季度，2为月度
    // planType: {
    //   type: Number
    // }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    planTypeName() {
      // return :this.user.orgType ==12?"单位"
      if (this.user.orgType == 11 || this.user.orgType == 12 || this.user.orgType == 10) {
        return "单位";
      }
      if (this.user.orgType == 2) {
        return "项目";
      }
      if (this.user.orgType == 4) {
        return "标段";
      } else {
        return "项目";
      }
      return;
    },
    pricePermission() {
      let arr = this.$store.state.menuData.filter(item => item.menuCode == "schedule");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    }
  },
  mounted() {
    this.endTime = this.$moment(Date.now()).format("YYYY-MM-DD");
    this.init();
  },
  data() {
    return {
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      endTime: "",
      clicle: [],
      loading: false,
      dialogVisible: false,
      // nowClickData: {},
      tableData: [],
      editData: [],
      topData: {
        costAmount: "",
        currentCost: "",
        lastCost: ""
      },
      radio: "1",
      rowPkId: "",
      radio2: 1,
      radio3: 1,
      radio4: 0,
      quarterList: { 1: "一", 2: "二", 3: "三", 4: "四" },
      checkDialog1: false,
      checkOrderDialog: false,
      orderPkId: "",
      orderType: 4,
      facilityDialog: false,
      // facilityOpenType:"",
      deviceId:"",
      facilityDialogTitle:"",
      totalData:{},
      checkDialog2:false,
      pkId:""
    };
  },
  methods: {
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      const arr = ["分包成本", "物资成本", "设备成本", "管理成本", "合计成本"];
      columns.forEach((column, index) => {
        if (index === 1) {
          sums[index] = "合计";
          return;
        }
        if (column.label === arr[0]) {
          sums[index] = this.totalData.customCost;
          return;
        }
        if (column.label === arr[1]) {
          sums[index] = this.totalData.materialCost;
          return;
        }
        if (column.label === arr[2]) {
          sums[index] = this.totalData.deviceCost;
          return;
        }
        if (column.label === arr[3]) {
          sums[index] = this.totalData.costManage;
          return;
        }
        if (column.label === arr[4]) {
          sums[index] = this.totalData.totalAmount;
        }
      });
      return sums;
    },
    // 设备编辑
    openFacility(type, row, view) {
      // this.facilityOpenType = type;
      this.deviceId = row.fkDeviceId
      view === 3 ? (this.facilityDialogTitle = view === 3 ? "查看设备" : "查看租赁设备") : (this.facilityDialogTitle = this.radio3 === 1 ? "编辑设备" : "编辑租赁设备"); //三元
      this.facilityDialog = true;
    },
    // 设备弹框
    closeFacilityDialog(e) {
      this.facilityDialog = false;
    },
    checkMater(row) {
      // this.findOutById(row);
      this.orderType = row.orderType == 0 ? 4 : 5;
      this.orderPkId = row.pkId;
      this.checkOrderDialog = true;
    },
    // 分包成本查看明细
    checkDetail(row) {
      // if (this.tableType === 1) {

      // this.checkDialog1 = true;
      // this.$refs.ContractDialog.initialization(row);
      // } else if (this.tableType === 2) {
        this.pkId = row.pkId;
        this.checkDialog2 = true;
      // }
    },
    endTimeChange() {
      this.init();
    },
    init() {
      this.costSummarySearchPage();
      this.costSummaryGetSummaryAmount();
      // this.costSummaryGetSummaryPie();
      // let arr = [
      //   { value: Math.random() * 1000, name: "Search Engine3" },
      //   { value: Math.random() * 1000, name: "Search Engine2" },
      //   { value: Math.random() * 1000, name: "Direct2" },
      //   { value: 1048, name: "Search Engine" },
      //   { value: 735, name: "Direct" },
      //   { value: 580, name: "Email" },
      //   { value: 484, name: "Union Ads" },
      //   { value: 300, name: "Video Ads" }
      // ];
      // this.clicle = [
      //   {
      //     title: {
      //       text: `各${this.planTypeName}本期成本占比`,
      //       left: "center",
      //       top: 10
      //     },
      //     tooltip: {
      //       trigger: "axis",
      //       formatter: function (params) {
      //         var res = params[0].name + "<br/>";
      //         params.forEach(item => {
      //           res += `${item.seriesName}:${!that.pricePermission ? "***" : item.value}<br/>`;
      //         });
      //         return res;
      //       }
      //     },
      //     legend: {
      //       data: arr.map(item => item.name),
      //       left: "center",
      //       bottom: 0
      //     },
      //     series: [
      //       {
      //         name: "Access From",
      //         type: "pie",
      //         radius: "60%",

      //         data: arr,
      //         label: {
      //           formatter: "{d}%",
      //           emphasis: {
      //             show: true,
      //             textStyle: {
      //               fontSize: "16",
      //               position: "inner",
      //               fontWeight: "bold"
      //             }
      //           }
      //         }
      //       }
      //     ]
      //   }
      // ];
    },
    //     costSummarySearchPage: (params = {}) => httpGet({ url: "/eng/query/costSummary/searchPage", params }), // 成本汇总分页
    // costSummaryGetSummaryAmount: (params = {}) => httpGet({ url: "/eng/query/costSummary/getSummaryAmount", params }), // 成本汇总合计
    // costSummaryGetSummaryPie: (params = {}) => httpGet({ url: "/eng/query/costSummary/getSummaryPie", params }) // 成本汇总饼图
    costSummarySearchPage() {
      let data = { ...this.page };
      data.beginTime = this.endTime;
      this.$api.costSummarySearchPage(data).then(res => {
        if (res.code == 200) {
          this.tableData = res.data == null ? [{ subUnitName: "data是Null", pkId: "12" }] : res.data.records;
          this.total = res.data == null ? 1 : res.data.total - 0;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    costSummaryGetSummaryAmount() {
      this.$api.costSummaryGetSummaryAmount({ beginTime: this.endTime }).then(res => {
        if (res.code == 200) {
          this.topData =
            res.data == null
              ? {
                  costAmount: "1586",
                  currentCost: "2222",
                  lastCost: "9654"
                }
              : res.data;
          let arr = [];
          if (res.data != null) {
            res.data.costSummaryPieVoList.forEach(item => {
              arr.push({ value: item.summaryAmount, name: item.unitName });
            });
          }
          if (res.data == null) {
            arr = [
              { value: 12434, name: "项目1" },
              { value: 1313, name: "项目2" },
              { value: 1212, name: "项目3" },
              { value: 1334, name: "项目4" }
            ];
          }
          this.clicle = [
            {
              title: {
                text: `各${this.planTypeName}本期成本占比`,
                left: "center",
                top: 10
              },
              tooltip: {
                trigger: "axis",
                formatter: function (params) {
                  var res = params[0].name + "<br/>";
                  params.forEach(item => {
                    res += `${item.seriesName}:${!that.pricePermission ? "***" : item.value}<br/>`;
                  });
                  return res;
                }
              },
              legend: {
                data: arr.map(item => item.name),
                left: "center",
                bottom: 0
              },
              series: [
                {
                  name: "Access From",
                  type: "pie",
                  radius: "60%",

                  data: arr,
                  label: {
                    formatter: "{d}%",
                    emphasis: {
                      show: true,
                      textStyle: {
                        fontSize: "16",
                        position: "inner",
                        fontWeight: "bold"
                      }
                    }
                  }
                }
              ]
            }
          ];
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // costSummaryGetSummaryPie() {
    //   this.$api.costSummaryGetSummaryPie({ beginTime: this.endTime }).then(res => {
    //     if (res.code == 200) {
    //       //   let arr = [
    //       //   { value: Math.random() * 1000, name: "Search Engine3" },
    //       //   { value: Math.random() * 1000, name: "Search Engine2" },
    //       //   { value: Math.random() * 1000, name: "Direct2" },
    //       //   { value: 1048, name: "Search Engine" },
    //       //   { value: 735, name: "Direct" },
    //       //   { value: 580, name: "Email" },
    //       //   { value: 484, name: "Union Ads" },
    //       //   { value: 300, name: "Video Ads" }
    //       // ];

    //     } else {
    //       this.$message.error(res.msg);
    //     }
    //   });
    // },
    check(row) {
      // return console.log(row)
      // this.nowClickData = { ...row };
      this.editData = [];
      // costSummaryCostSearchPage
      this.rowPkId = row.subOrgId;
      this.dialogVisible = true;
      // con
      // re
      this.editInit();
    },
    radioChange() {
      this.editInit();
    },
    materialRadio() {
      this.editInit();
    },
    editInit() {
      if (this.radio == 1) {
        this.actualSubCostSearchPage();
      } else if (this.radio == 2) {
        this.actualMaterialCostSearchPage();
      } else if (this.radio == 3) {
        this.costSummaryCostSearchPage();
      } else if (this.radio == 4) {
        this.costSummarySearch();
      } else if (this.radio == 5) {
        this.editData=[]
        this.costSummaryAccountList();
      }
    },
    // 分包成本
    actualSubCostSearchPage() {
      let data = {
        pageNum: 1,
        pageSize: 100,
        orgId: this.rowPkId
      };
      this.$api.actualSubCostSearchPage(data).then(res => {
        if (res.code == 200) {
          this.editData = res.data.records;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 物资成本
    actualMaterialCostSearchPage() {
      let data = {
        pageNum: 1,
        pageSize: 100,
        sourceType: this.radio2 == 1 ? "0" : "1",
        orgId: this.rowPkId
      };
      this.$api.actualMaterialCostSearchPage(data).then(res => {
        if (res.code == 200) {
          this.editData = res.data.records;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 设备成本
    costSummaryCostSearchPage(id) {
      let data = {
        pageNum: 1,
        pageSize: 100,
        consumeType: this.radio3 == 1 ? "0" : "1",
        orgId: this.rowPkId
      };
      this.$api.costSummaryCostSearchPage(data).then(res => {
        if (res.code == 200) {
          this.editData = res.data.records;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 管理成本
    costSummarySearch() {
      let data = {
        sourceType: 1,
        orgId: this.rowPkId
      };
      this.$api.costSummarySearch(data).then(res => {
        if (res.code == 200) {
          this.editData = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 成本核算
    costSummaryAccountList() {
      let data = {
        type: this.radio4,
        orgId: this.rowPkId
      };
      this.$api.costSummaryAccountList(data).then(res => {
        if (res.code == 200) {
          if (this.radio4 == 0) {
            this.editData = res.data.monthlySummary.filter(item => item.monthly !== 13);
            this.totalData = res.data.monthlySummary.filter(item => item.monthly === 13)[0];
          } else if (this.radio4 == 1) {
            this.editData = res.data.quarterSummary.filter(item => item.quarter !== 5);
            this.totalData = res.data.quarterSummary.filter(item => item.quarter === 5)[0];
          } else if (this.radio4 == 2) {
            this.editData = res.data.yearSummary.filter(item => item.year !== 0);
            this.totalData = res.data.yearSummary.filter(item => item.year === 0)[0];
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        console.log(this[list]);
        this.forArr(this[list], this[isExpand], ref);
      });
    },
    forArr(arr, isExpand, ref) {
      arr.forEach(i => {
        if (!i.childList) {
          return;
        }
        if (!i.childList.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.childList && i.childList.length) {
          this.forArr(i.childList, isExpand, ref);
        }
      });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.costSummarySearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.costSummarySearchPage();
    }
  }
};
</script>
  
  <style lang="scss" scoped>
.fs-14 {
  font-size: 14px;
}
.searchBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 80px;
  background-color: #fff;
  padding: 4px 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}
.table-data {
  display: flex;
  height: 500px;
  .left-table {
    width: 1110px;
    .total {
      display: flex;
      height: 120px;
      background-color: #f2f2f2;
      .total-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .total-item-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .total-item-content {
          font-size: 18px;
          color: #f59a23;
        }
      }
    }
    .tables {
      height: calc(100% - 180px);
    }
  }
}
.empty {
  margin: 100px 0;
  text-align: center;
  img {
    width: 280px;
  }
}
.h-600 {
  min-height: 600px;
}
</style>
  