<template>
  <div class="app-container">
    <!-- 头部tab栏 -->
    <!-- <el-radio-group v-model="topRadio" size="mini" v-if="user.orgType === 5">
      <el-radio-button :label="1">分包单位</el-radio-button>
      <el-radio-button :label="2">工区</el-radio-button>
    </el-radio-group> -->
    <!-- 业主 施工合同 -->
    <!-- 分包计价 分包合同 -->
    <div class="topTabs">
      <el-tabs v-model="topRadio" v-if="user.orgType === 5">
        <el-tab-pane label="业主计量" name="1"></el-tab-pane>
        <el-tab-pane label="分包计价" name="2"></el-tab-pane>
      </el-tabs>
    </div>
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px">
          <el-form-item label="项目" v-if="user.orgType === 2 || user.orgType === 3">
            <el-select v-model="proId" size="mini" class="wh-200" @change="proChange">
              <!-- <el-option value="" label="全部"></el-option> -->
              <el-option v-for="item in options" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标段项目" v-if="user.orgType !== 5">
            <el-select size="mini" class="wh-200" v-model="projectIds" @change="proBidChange" :disabled="[2, 3].includes(user.orgType) && !proId">
              <!-- <el-option value="" label="全部"></el-option> -->
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分包单位" v-if="user.orgType === 5 && topRadio == 2">
            <el-select size="mini" class="wh-200" v-model="customerIds" @change="subChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in subOption" :key="item.fkCustomId" :value="item.fkCustomId" :label="item.customName"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="工区" v-if="user.orgType === 5 && topRadio == 2">
            <el-select size="mini" multiple collapse-tags class="wh-200" v-model="workAreaIds" @change="areaChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in areaOption" :key="item.pkId" :value="item.pkId" :label="item.areaName"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="合同">
            <el-select size="mini" class="wh-200" v-model="contractId" @change="contractIdChange">
              <el-option v-for="item in contractData" :key="item.pkId" :value="item.pkId" :label="item.contractName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="截止日期">
            <!-- <el-date-picker size="mini" class="wh-200" value-format="yyyy-MM-dd" v-model="searchData.startTime" @change="beginChange"></el-date-picker>
            <span>至</span> -->
            <el-date-picker size="mini" @change="endTimeChange" class="wh-200" value-format="yyyy-MM-dd" v-model="searchData.endTime" :picker-options="searchOptionsEnd"></el-date-picker>
          </el-form-item>
          <!-- <el-form-item label="展示方式">
            <el-select size="mini" class="wh-100" v-model="showType">
              <el-option label="表格" :value="1"></el-option>
              <el-option label="图表" :value="2"></el-option>
            </el-select>
          </el-form-item> -->
        </el-form>
      </template>
      <!-- <template slot="right">
        <el-radio-group v-model="radio" v-show="showType === 1">
          <el-radio :label="1">产值汇总</el-radio>
          <el-radio :label="2">清单项目汇总</el-radio>
        </el-radio-group>
        <el-radio-group v-model="Echartradio" v-show="showType === 2">
          <el-radio :label="1">柱形图</el-radio>
          <el-radio :label="2">折线图</el-radio>
          <el-radio :label="3">环形图</el-radio>
        </el-radio-group>
      </template> -->
    </SearchBar>
    <!-- 表格 -->
    <!-- <div v-if="showType === 1" class="tables table-data">
      <el-table v-if="radio === 1" ref="tables1" :data="tableData" stripe :show-summary="showSum" :summary-method="getSummaries1" :key="tableKey1"  height="100%" :header-cell-style="{ background: '#f1f6ff' }">
        <el-table-column align="center" prop="fkProjectName" label="项目" v-if="[2, 3].includes(user.orgType)"> </el-table-column>
        <el-table-column align="center" prop="projectName" label="标段项目" v-if="user.orgType !== 5"> </el-table-column>
        <el-table-column align="center" prop="orgName" :label="labelName" v-if="user.orgType === 5"> </el-table-column>
        <el-table-column align="center" prop="designAmount" label="设计产值"> </el-table-column>
        <el-table-column align="center" prop="finishAmount" label="已完成产值"> 
          <template slot-scope="{ row }">
            <span>{{ !pricePermission?"***":row.finishAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="完成百分比">
          <template slot-scope="{ row }">
            <span>{{ row.designAmount > 0 ? (((row.finishAmount - 0) / (row.designAmount - 0)) * 100).toFixed(2) + "%" : "0%" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="settleAmount" label="已结算金额"> 
          <template slot-scope="{ row }">
            <span>{{ !pricePermission?"***":row.settleAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="结算百分比">
          <template slot-scope="{ row }">
            <span>{{ row.finishAmount > 0 ? (((row.settleAmount - 0) / (row.finishAmount - 0)) * 100).toFixed(2) + "%" : "0%" }}</span>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-table v-if="radio === 2" :data="tableData" ref="tables2" stripe :show-summary="showSum" :summary-method="getSummaries2" style="width: 100%;" height="100%" :header-cell-style="{ background: '#f1f6ff' }" :key="tableKey2" :span-method="objectSpanMethod">
        <el-table-column align="center" :prop="labelName=='项目部'?'fkProjectName':'orgName'" :label="labelName" />
        <el-table-column align="center" prop="itemName" label="清单名称"> </el-table-column>
        <el-table-column align="center" prop="designNumber" label="设计工程量"> </el-table-column>
        <el-table-column align="center" prop="price" label="单价"> 
          <template slot-scope="{ row }">
            <span>{{ !pricePermission?"***":row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="designAmount" label="设计产值"> </el-table-column>
        <el-table-column align="center" prop="finishNumber" label="已完成工程量"> 
          <template slot-scope="{ row }">
            <span>{{ !pricePermission?"***":row.finishNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="完成工程量百分比">
          <template slot-scope="{ row }">
            <span>{{ row.designNumber > 0 ? (((row.finishNumber - 0) / (row.designNumber - 0)) * 100).toFixed(2) + "%" : "0%" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="finishAmount" label="已完成产值"> </el-table-column>
        <el-table-column align="center" label="完成产值百分比">
          <template slot-scope="{ row }">
            <span>{{ row.designAmount > 0 ? (((row.finishAmount - 0) / (row.designAmount - 0)) * 100).toFixed(2) + "%" : "0%" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="settleAmount" label="已结算金额"> 
          <template slot-scope="{ row }">
            <span>{{ !pricePermission?"***":row.settleAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="已结算百分比">
          <template slot-scope="{ row }">
            <span>{{ row.finishAmount > 0 ? (((row.settleAmount - 0) / (row.finishAmount - 0)) * 100).toFixed(2) + "%" : "" }}</span>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div> -->
    <!-- 图表 -->
    <div v-if="showType === 2" class="echart" v-loading="loading">
      <div>
        <!-- <div v-show="Echartradio === 1" class="echart-item">
          <el-form ref="form" label-width="80px" class="yearSel">
            <el-form-item label="年份">
              <el-select size="mini" class="wh-100" v-model="searchData.year">
                <el-option v-for="item in yearArr" :key="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
           </el-form>
          <Echart v-for="item in bar" :key="item.pkId" :option="item" echartName="bar" :mystyle="'width: 80vw;height: 30vw;margin: 20px auto'" />
        </div>
        <div v-show="Echartradio === 2" class="echart-item">
          <el-form ref="form" label-width="80px" class="yearSel">
            <el-form-item label="年份">
              <el-select size="mini" class="wh-100" v-model="searchData.year">
                <el-option v-for="item in yearArr" :key="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
           </el-form>
          <Echart v-for="item in line" :key="item.pkId" :option="item" echartName="line" :mystyle="'width: 80vw;height: 30vw;margin: 20px auto'" />
        </div>
        <div v-show="Echartradio === 3" class="echart-item">
          <Echart v-for="item in clicle" :key="item.pkId" :option="item" echartName="clicle" :mystyle="'width: 30vw;height: 20vw;'" />
        </div> -->
        <div v-show="Echartradio === 3" class="echart-item">
          <div class="left-table">
            <div class="left-table-title" v-if="user.orgType === 5"><span class="ico"></span> 计量汇总</div>
            <div class="left-table-box">
              <div style="line-height: 35px; border-bottom: 1px solid #d7d7d7">
                <div class="left-table-item" style="background: #ffff80">合同金额</div>
                <div class="left-table-centers">{{ summarizingData.amount }}元</div>
              </div>
              <div style="line-height: 35px; border-bottom: 1px solid #d7d7d7">
                <div class="left-table-item" style="background: #80ffff">已完成产值</div>
                <div class="left-table-centers">{{ summarizingData.finishAmount }} 元</div>

                <div class="left-table-item" style="background: #80ffff">完成产值占比</div>
                <div class="left-table-center">{{ summarizingData.finishAmountPercentage }} %</div>
              </div>
              <div style="line-height: 35px; border-bottom: 1px solid #d7d7d7">
                <div class="left-table-item" style="background: #81d3f8">已结算金额</div>
                <div class="left-table-centers">{{ summarizingData.settleAmount }} 元</div>

                <div class="left-table-item" style="background: #81d3f8">已结算占完成占比</div>
                <div class="left-table-center">{{ summarizingData.settleAmountPercentage }} %</div>
              </div>
            </div>
            <div class="left-table-title" v-if="user.orgType === 5"><span class="ico"></span>按章节统计</div>
            <el-tabs v-model="detailRadio" v-if="tableData.length" style="height: 100%">
              <el-tab-pane :label="item.chapterName" :name="index + ''" v-for="(item, index) in tableData" :key="index" style="height: 100%">
                <div class="tablH">
                <el-table :tooltip-effect="'light'" height="100%" stripe ref="tables2" :data="item.details" :key="ranKey2" :summary-method="getSummaries" show-summary :header-cell-style="{ background: '#f1f6ff' }">
                  <el-table-column align="center" label="子目号" prop="subitemNum" />
                  <el-table-column align="center" label="清单名称" prop="detailName" />
                  <el-table-column align="center" label="单位" prop="unitName" show-overflow-tooltip />
                  <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      {{ !pricePermission ? "***" : row.price }}
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="合同工程量" prop="quantities" show-overflow-tooltip />
                  <el-table-column align="center" label="合同金额" prop="amount" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      {{ !pricePermission ? "***" : row.amount }}
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="完成工程量" prop="finishNumber" show-overflow-tooltip />
                  <el-table-column align="center" label="已完成产值" prop="finishAmount" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      {{ !pricePermission ? "***" : row.finishAmount }}
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="已结算金额" prop="settleAmount" show-overflow-tooltip />
                  <el-table-column align="center" label="已结算占比" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <span>
                        {{ row.settleAmountPercentage == null ? "" :row.finishAmount? (row.settleAmountPercentage + "%"):'-' }}
                      </span>
                    </template>
                  </el-table-column>
                  <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                  </div>
                </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
            <div v-else class="tabelsInfo-main empty">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </div>
          <!-- v-for="item in clicle" :key="item.pkId" :option="item" -->
          <Echart v-if="clicle.length != 0" :option="clicle[0]" echartName="clicle" :mystyle="'width: 30vw;height: 26vw;'" />
          <div v-if="clicle.length == 0" style="width: 30vw;"  class="tabelsInfo-main empty">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
          </div>
        </div>
      </div>
      <!-- <div class="tabelsInfo-main empty" >
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div> -->
    </div>
  </div>
</template>

<script>
import SearchBar from "./components/SearchBar.vue";
import Echart from "@/components/Echart.vue";
import api from "@/api/api";
export default {
  components: { SearchBar, Echart },
  data() {
    return {
      tableData: [],
      options: [],
      proOptions: [],
      areaOption: [],
      subOption: [],
      radio: 1,
      Echartradio: 3,
      showType: 2,
      topRadio: "3",
      searchData: {
        isForm: 0,
        isItemDetail: 0,
        isWhole: 1,
        startTime: "",
        endTime: "",
        isWholeProject: 1,
        isWholeBid: 1,
        year: ""
      },
      proId: "",
      projectIds: "",
      workAreaIds: [""],
      customerIds: "",
      collectTime: [],
      // Echart数据
      // 环形图
      clicle: [],
      // 柱状图
      bar: [],
      // 线形图
      line: [],
      tableKey1: Math.random(),
      tableKey2: Math.random(),
      showSum: false,
      spanArr: [],
      pos: "",
      loading: false,
      timer: null,
      startTime: "",
      searchOptionsEnd: {
        disabledDate: time => {
          if (this.searchData.startTime) {
            let d;
            if (typeof this.searchData.startTime == "string") {
              d = new Date(this.searchData.startTime).getTime();
            } else {
              d = this.searchData.startTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      summarizingData: {
        finishAmount: 0,
        finishAmountPercentage: 0,
        settleAmount: 0,
        settleAmountPercentage: 0,
        amount: 0
      },
      detailRadio: "",
      ranKey2: Math.random(),
      contractData: [],
      contractId: "",
      tableArr1: [],
      tableArr2: []
    };
  },
  created() {
    if (this.user.orgType !== 5) {
      this.getAllProject();
      // this.getScheduleList();
    } else {
      this.topRadio = "1";
      this.searchContracts();
    }
    this.getBySpecial();
    // this.searchContracts();
  },
  // mounted(){

  // },
  methods: {
    endTimeChange() {
      this.settleSummary();
    },
    contractIdChange(val) {
      this.settleSummary();
    },
    searchContracts() {
      let data = {
        contractType: this.topRadio == 1 ? 1 : 4,
        customId: this.customerIds,
        fkProjectId: this.projectIds
      };
      this.$api.searchContracts(data).then(res => {
        if (res.code == 200) {
          this.contractData = res.data;
          if (res.data.length) {
            this.contractId = res.data[0].pkId;
          }
          this.settleSummary();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    settleSummary() {
      let data = {
        contractId: this.contractId,
        endTime: this.searchData.endTime
      };
      if (this.contractId == undefined || this.contractId == null || this.contractId == "") {
        return;
      }
      this.$api.settleSummary(data).then(res => {
        if (res.code == 200) {
          this.summarizingData = res.data;
          this.tableData = res.data.contractChapters;
          this.detailRadio='0'
          this.tableArr1 = [];
          this.tableArr2 = [];
          res.data.contractDetailPieVos.forEach(item => {
            this.tableArr1.push(item.detailName);
            this.tableArr2.push({ value: item.settleAmount, name: item.detailName });
          });

          this.drawEchart();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (index != 5 && index != 7 && index != 8 && index != 9) {
          sums[index] = "";
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = ((values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0)).toFixed(2)-0);
          // sums[index] += ' 元';
        } else {
          sums[index] = "N/A";
        }
        // if(sums[index]  )
        // console.log(sums[index])
        sums[9] = this.tableData[this.detailRadio].settleAmountPercentage + "%";
      });

      return sums;
    },
    beginChange() {
      this.searchData.endTime = "";
    },
    getBySpecial() {
      let data = {};
      if (this.user.orgType != 5) {
        data.projectBidId = this.projectIds;
      }
      if (![4, 5].includes(this.user.orgType)) {
        data.projectId = this.proId;
      }
      this.$api.getBySpecial(data).then(res => {
        if (res.code == 200) {
          if (res.data.length) {
            this.startTime = res.data.filter(item => item.key == "projectBeginTime")[0].name;
          }
        }
      });
    },
    // 获取汇总表
    // getScheduleList() {
    //   if (this.showType === 2) {
    //     this.loading = true;
    //   }
    //   api
    //     .searchMeteringSummary({ ...this.searchData, type: 1 })
    //     .then(res => {
    //       if (res.code === 200) {
    //         this.showSum = false;
    //         this.tableData = res.data;
    //         if (this.radio == 2) {
    //           let id = this.topRadio == 1 ? "fkCustomerId" : this.topRadio == 2 ? "fkWorkAreaId" : "fkProjectId";
    //           this.getSpanArr(res.data, id);
    //         }
    //         this.$nextTick(() => {
    //           if (this.showType === 2) {
    //             this.drawEchart();
    //           } else {
    //             this.tableKey1 = Math.random();
    //             this.tableKey2 = Math.random();
    //             this.showSum = true;
    //           }
    //         });
    //         if (this.$refs.tables1) {
    //           this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
    //         }
    //         if (this.$refs.tables2) {
    //           this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
    //         }
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //       this.loading = false;
    //     })
    //     .catch(err => {
    //       this.loading = false;
    //       console.error(err);
    //     });
    // },
    // 获取项目部
    // getAllProject() {
    //   api.getItemListByCustom().then(res => {
    //     if (res.code === 200) {
    //       this.options = res.data;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 获取所有项目
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          if ([2, 3, 9].includes(this.user.orgType)) {
            this.options = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
            if (res.data.length) {
              this.proId = res.data[0].pkId;
              // console.log("Xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
              this.allListBidByProId(0, this.proId);
              // console.log(res.data)
            }
          } else {
            this.proOptions = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
            if (res.data.length) {
              this.projectIds = res.data[0].pkId;
            }
            this.searchContracts();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "") {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.fkBidProjectId, label: item.fkBidProjectName }));
          if (res.data.length) {
            this.projectIds = res.data[0].fkBidProjectId;
            this.searchContracts();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 选择项目部
    proChange(e) {
      this.projectIds = [""];
      delete this.searchData.projectIds;
      if (e) {
        this.searchData = { ...this.searchData, isWholeProject: 0, isWholeBid: 1, fkProjectId: e };
        this.allListBidByProId(0, e);
        this.getBySpecial();
      } else {
        delete this.searchData.fkProjectId;
        this.searchData = { ...this.searchData, isWhole: 1, isWholeProject: 1, isWholeBid: 1 };
      }
    },
    // 获取分包单位
    getSubList() {
      api.findCustomByUserId().then(res => {
        if (res.code === 200) {
          this.subOption = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取工区
    getAreaList() {
      api.findWorkAreasByUserId().then(res => {
        if (res.code === 200) {
          this.areaOption = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 改变项目部
    proBidChange() {
      this.searchContracts();
      // if (this.projectIds.length) {
      //   let index = this.projectIds.findIndex(item => item === "");
      //   if (this.projectIds[this.projectIds.length - 1] === "") {
      //     this.projectIds = [""];
      //     delete this.searchData.projectIds;
      //     this.searchData = {
      //       ...this.searchData,
      //       isWhole: 1,
      //       isWholeBid: 1
      //     };
      //   } else {
      //     if (index !== -1) {
      //       this.projectIds.splice(index, 1);
      //     }
      //     this.searchData = {
      //       ...this.searchData,
      //       isWhole: 0,
      //       isWholeBid: 0,
      //       projectIds: this.projectIds.join(",")
      //     };
      //   }
      // } else {
      //   delete this.searchData.projectIds;
      //   this.searchData = {
      //     ...this.searchData,
      //     isWhole: 1,
      //     isWholeBid: 1,
      //     customerOrWorkArea: 0
      //   };
      // }
      // this.getBySpecial();
      // if (this.showType === 2) {
      //   this.drawEchart();
      // }
    },
    // 改变分包单位
    subChange(val) {
      this.searchContracts();
      // if (this.customerIds.length) {
      //   let index = this.customerIds.findIndex(item => item === "");
      //   if (this.customerIds[this.customerIds.length - 1] === "") {
      //     this.customerIds = [""];
      //     delete this.searchData.customerIds;
      //     this.searchData = {
      //       ...this.searchData,
      //       isWhole: 1,
      //       customerOrWorkArea: 0
      //     };
      //   } else {
      //     if (index !== -1) {
      //       this.customerIds.splice(index, 1);
      //     }
      //     this.searchData = {
      //       ...this.searchData,
      //       isWhole: 0,
      //       customerIds: this.customerIds.join(","),
      //       customerOrWorkArea: 0
      //     };
      //   }
      // } else {
      //   delete this.searchData.customerIds;
      //   this.searchData = {
      //     ...this.searchData,
      //     isWhole: 1,
      //     customerOrWorkArea: 0
      //   };
      // }
      // if (this.showType === 2) {
      //   this.drawEchart();
      // }
    },
    // 工区变化
    areaChange() {
      if (this.workAreaIds.length) {
        let index = this.workAreaIds.findIndex(item => item === "");
        if (this.workAreaIds[this.workAreaIds.length - 1] === "") {
          this.workAreaIds = [""];
          delete this.searchData.workAreaIds;
          this.searchData = {
            ...this.searchData,
            isWhole: 1,
            customerOrWorkArea: 1
          };
        } else {
          if (index !== -1) {
            this.workAreaIds.splice(index, 1);
          }
          this.searchData = {
            ...this.searchData,
            isWhole: 0,
            workAreaIds: this.workAreaIds.join(","),
            customerOrWorkArea: 1
          };
        }
      } else {
        delete this.searchData.workAreaIds;
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 1
        };
      }
      // if (this.showType === 2) {
      //   this.drawEchart();
      // }
    },
    //总价
    getSummaries1(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
        } else {
          sums[index] = "N/A";
        }
        if ([4, 5].includes(this.user.orgType) && index === 3) {
          sums[index] = sums[1] > 0 ? ((sums[2] / sums[1]) * 100).toFixed(2) + "%" : "0%";
        }
        if ([2, 3].includes(this.user.orgType) && index === 4) {
          sums[index] = sums[2] > 0 ? ((sums[3] / sums[2]) * 100).toFixed(2) + "%" : "0%";
        }

        if ([4, 5].includes(this.user.orgType) && index === 5) {
          sums[index] = sums[2] > 0 ? ((sums[4] / sums[2]) * 100).toFixed(2) + "%" : "0%";
        }
        if ([2, 3].includes(this.user.orgType) && index === 6) {
          sums[index] = sums[3] > 0 ? ((sums[5] / sums[3]) * 100).toFixed(2) + "%" : "0%";
        }
      });
      return sums;
    },
    getSummaries2(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if ([4, 7, 9].includes(index)) {
          if (!this.pricePermission) {
            return (sums[index] = "***");
          } else {
            const values = data.map(item => Number(item[column.property]));
            if (!values.every(value => isNaN(value))) {
              sums[index] = values.reduce((prev, curr) => {
                const value = Number(curr);
                if (!isNaN(value)) {
                  return (prev + curr).toFixed(2) - 0;
                } else {
                  return prev;
                }
              }, 0);
            } else {
              sums[index] = "N/A";
            }
          }
        }
        if (index === 8) {
          sums[index] = sums[4] > 0 ? ((sums[7] / sums[4]) * 100).toFixed(2) + "%" : "0%";
        }
        if (index === 10) {
          sums[index] = sums[7] > 0 ? ((sums[9] / sums[7]) * 100).toFixed(2) + "%" : "0%";
        }
      });
      return sums;
    },
    // 更新echart
    drawEchart() {
      let that = this;
      // if (this.Echartradio === 1) {
      //   // 因为tableData没更改就直接渲染echart，所以需要延时器，nextTick不行
      //   // setTimeout(() => {
      //   this.bar = this.tableData.map(item => {
      //     return {
      //       legend: {
      //         data: ["计划完成产值", "实际完成产值", "已结算金额"],
      //         orient: "vertical",
      //         left: "right"
      //       },
      //       tooltip: {
      //         trigger: "axis",
      //         formatter: function (params) {
      //           var res = params[0].name + "<br/>";
      //           params.forEach(item => {
      //             res += `${item.seriesName}:${!that.pricePermission ? "***" : item.value}<br/>`;
      //           });
      //           return res;
      //         }
      //       },
      //       title: {
      //         text: item.orgName ? item.orgName : "全部汇总表",
      //         left: "center"
      //       },
      //       xAxis: [
      //         {
      //           type: "category",
      //           axisTick: { show: false },
      //           data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
      //         }
      //       ],
      //       yAxis: [
      //         {
      //           type: "value"
      //         }
      //       ],
      //       series: [
      //         {
      //           name: "已结算金额",
      //           type: "bar",
      //           barGap: 0,
      //           data: item.settle
      //         },
      //         {
      //           name: "实际完成产值",
      //           type: "bar",
      //           data: item.finish
      //         },
      //         {
      //           name: "计划完成产值",
      //           type: "bar",
      //           data: item.design
      //         }
      //       ]
      //     };
      //   });
      //   // }, 200);
      // } else if (this.Echartradio === 2) {
      //   // setTimeout(() => {
      //   this.line = this.tableData.map(item => {
      //     return {
      //       title: {
      //         text: item.orgName ? item.orgName : "全部汇总表",
      //         left: "center"
      //       },
      //       legend: {
      //         data: ["计划完成产值", "已完成产值", "已结算金额"],
      //         orient: "vertical",
      //         left: "right"
      //       },
      //       tooltip: {
      //         trigger: "axis",
      //         formatter: function (params) {
      //           var res = params[0].name + "<br/>";
      //           params.forEach(item => {
      //             res += `${item.seriesName}:${!that.pricePermission ? "***" : item.value}<br/>`;
      //           });
      //           return res;
      //         }
      //       },
      //       xAxis: {
      //         type: "category",
      //         boundaryGap: false,
      //         data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
      //       },
      //       yAxis: {
      //         type: "value"
      //       },
      //       series: [
      //         {
      //           name: "计划完成产值",
      //           type: "line",
      //           stack: "Total",
      //           data: item.design
      //         },
      //         {
      //           name: "已完成产值",
      //           type: "line",
      //           stack: "Total",
      //           data: item.finish
      //         },
      //         {
      //           name: "已结算金额",
      //           type: "line",
      //           stack: "Total",
      //           data: item.settle
      //         }
      //       ]
      //     };
      //   });
      //   // }, 200);
      // } else if (this.Echartradio === 3) {
      //   // setTimeout(() => {
      //   this.clicle = this.tableData.map(item => {
      //     return {
      //       title: {
      //         text: item.orgName ? item.orgName : "全部汇总表",
      //         left: "center"
      //       },
      //       tooltip: {
      //         trigger: "axis",
      //         formatter: function (params) {
      //           var res = params[0].name + "<br/>";
      //           params.forEach(item => {
      //             res += `${item.seriesName}:${!that.pricePermission ? "***" : item.value}<br/>`;
      //           });
      //           return res;
      //         }
      //       },
      //       legend: {
      //         data: ["未完成产值", "已完成产值", "未结算金额", "已结算金额"],
      //         orient: "vertical",
      //         left: "right"
      //       },
      //       series: [
      //         {
      //           name: "Access From",
      //           type: "pie",
      //           radius: ["30%", "50%"],
      //           label: {
      //             position: "inner",
      //             fontSize: 12
      //           },
      //           title: {
      //             text: item.orgName ? item.name : "全部汇总表",
      //             left: "center"
      //           },
      //           data: [
      //             {
      //               value: item.designAmount - item.finishAmount,
      //               name: "未完成产值",
      //               itemStyle: { color: "#d7d7d7" }
      //             },
      //             {
      //               value: item.finishAmount,
      //               name: "已完成产值",
      //               itemStyle: { color: "#95f204" }
      //             }
      //           ]
      //         },
      //         {
      //           name: "Access From",
      //           type: "pie",
      //           radius: ["45%", "60%"],
      //           data: [
      //             {
      //               value: item.designAmount - item.finishAmount,
      //               name: "未完成产值",
      //               itemStyle: { color: "#d7d7d7" }
      //             },
      //             {
      //               value: item.finishAmount - item.settleAmount,
      //               name: "未结算金额",
      //               itemStyle: { color: "#80ffff" }
      //             },
      //             {
      //               value: item.settleAmount,
      //               name: "已结算金额",
      //               itemStyle: { color: "#ec808d" }
      //             }
      //           ]
      //         }
      //       ]
      //     };
      //   });
      //   // }, 200);
      // }
      // this.clicle = this.tableData.map(item => {
      //   return {
      //     pkId: item.pkId,
      //     title: {
      //       text: "清单结算占比",
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
      //       data: this.tableArr1,
      //       left: "center",
      //       bottom: 0
      //     },
      //     series: [
      //       {
      //         name: "Access From",
      //         type: "pie",
      //         radius: "80%",

      //         data: this.tableArr2,
      //         label: {
      //           formatter: "{d}%)",
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
      //   };
      // });
      // let arr = this.tableData.map(item => ({ name: item.detailName, value: item.settleAmount }));
      // con
      console.log("aaaaaaaaaaaaaaaaaaaaaa")
      console.log(this.tableArr2)
      console.log("aaaaaaaaaaaaaaaaaaaaaa")
      if(this.tableArr2.legend != 0){
        this.clicle = [
            {
              title: {
                text: "清单结算占比",
                left: "center",
                top: 10
              },
              tooltip: {
                trigger: "item"
              },
              legend: {
                data: this.tableArr2.map(item => item.name),
                left: "center",
                bottom: 0
              },
              series: [
                {
                  name: "清单结算占比",
                  type: "pie",
                  radius: "60%",

                  data: this.tableArr2,
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
      }else{
        this.clicle = []
      }
   
    },
    // 合并行
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          // [0,0] 表示这一行不显示， [2,1]表示行的合并数
          rowspan: _row,
          colspan: _col
        };
      }
    },
    // 筛选合并行的数组
    getSpanArr(data, id) {
      // data就是我们从后台拿到的数据
      this.spanArr = [];
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1);
          this.pos = 0;
        } else {
          // 判断当前元素与上一个元素是否相同
          if (data[i][id] === data[i - 1][id]) {
            this.spanArr[this.pos] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            this.pos = i;
          }
        }
      }
    }
  },
  computed: {
    labelName() {
      if (this.topRadio == 1) return "分包单位";
      if (this.topRadio == 2) return "工区";
      return "项目部";
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    pricePermission() {
      let arr = this.$store.state.menuData.filter(item => item.menuCode == "settlement");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    },
    // 获取年份
    yearArr() {
      let arr = [];
      let nowYear = new Date().getFullYear();
      let start = "";
      let end = "";
      if (this.searchData.startTime) {
        start = new Date(this.searchData.startTime).getFullYear();
      } else {
        start = this.startTime ? new Date(this.startTime).getFullYear() : nowYear;
      }
      if (this.searchData.endTime) {
        end = new Date(this.searchData.endTime).getFullYear();
      } else {
        end = nowYear;
      }
      for (let i = start; i <= end; i++) {
        arr.push(i);
      }
      return arr;
    }
  },
  watch: {
    topRadio(val) {
      // this.customerIds
      this.projectIds = "";
      this.customerIds = "";
      this.workAreaIds = [""];
      this.searchData.startTime = "";
      this.searchData.endTime = "";
      // this.tableData = [];
      this.showType = 2;
      // this.radio = 1;
      this.Echartradio = 3;
      delete this.searchData.customerIds;
      delete this.searchData.workAreaIds;
      delete this.searchData.projectIds;
      if (val == 1) {
        this.getSubList();
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 0
        };
      } else if (val == 2) {
        this.getAreaList();
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 1
        };
      } else {
        this.getAllProject();
      }
      this.searchContracts();
    }
  }
};
</script>

<style lang="scss" scoped>
.echart {
  width: 100%;
  height: 620px;
  // overflow: auto;
  overflow: hidden;
  background-color: #fff;
}
.echart-item {
  position: relative;
  width: 1690px;
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  // margin: 0 auto;
  .yearSel {
    position: absolute;
    left: 180px;
    top: 10px;
    z-index: 5;
  }
  .left-table {
    width: 1110px;
    .left-table-title {
      background: #d7d7d7;
      line-height: 30px;
      .ico {
        background: #80ffff;
        display: inline-block;
        margin: 4px 4px 0px 8px;
        height: 15px;
        width: 6px;
      }
    }
    .left-table-box {
      background: #f5f7fa;
      font-size: 16px;
    }
    .left-table-item {
      display: inline-block;
      width: 160px;
      text-align: center;
    }
    .left-table-centers {
      display: inline-block;
      width: 500px;
    }
    .left-table-center {
      display: inline-block;
      width: 260px;
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
.tables {
  height: 80%;
}
/deep/.el-select {
  .el-select__tags-text {
    max-width: 100px;
  }
}
.topTabs {
  padding: 5px;
  background-color: #fff;
}
.tablH{
  height: 400px;
}
</style>
