<template>
  <div class="app-container">
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px">
          <el-form-item label="结算标段" v-if="user.orgType != 5">
            <!-- <el-select size="mini" v-model="orgIds" @change="proChange" class="wh-220">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select> -->
            <proSelct @selectIds="selectIds"></proSelct>
          </el-form-item>
          <el-form-item label="分包单位" v-if="typeShow">
            <el-select size="mini" v-model="settleOrgIds" @change="subChange" class="wh-200">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in subOptions" :key="item.fkCustomId" :value="item.fkCustomId" :label="item.customName"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="结算周期" v-if="user.orgType === 4">
            <el-date-picker
              size="mini"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              v-model="collectTime"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item> -->
          <el-form-item label="结算周期" v-if="user.orgType === 4 && typeShow">
            <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.beginDate" @change="beginChange"></el-date-picker>
            <span>至</span>
            <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.endDate" :picker-options="searchOptionsEnd"></el-date-picker>
          </el-form-item>
          <el-form-item label="结算日期" v-if="user.orgType === 5 && typeShow">
            <el-date-picker type="date" class="wh-140" size="mini" v-model="settleDate" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="审批状态" v-if="typeShow">
            <el-select size="mini" class="wh-100" v-model="settleStatus">
              <el-option label="全部" value=""></el-option>
              <el-option :value="item.name" :label="item.key" v-for="item in stateList" :key="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="typeShow">
            <el-button size="mini" type="primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template slot="right" v-if="user.orgType === 5">
        <el-button size="mini" type="primary" class="addBtn" @click="showDialog(1)" v-has="'settlement:subcontractor:add'">新增结算</el-button>
      </template>
    </SearchBar>
    <!-- 表格 -->
    <div class="table-data" style="height:80%" v-if="typeShow">
      <el-table :tooltip-effect="'light'" v-loading="loading" ref="tables" :data="tableData" height="100%" :show-summary="showSummary" :summary-method="getSummaries" stripe :header-cell-style="{ background: '#f1f6ff' }" :key="tableKey">
        <el-table-column align="center" label="序号" width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="结算单名称" prop="settleName">
          <template slot-scope="{row}">
            <div class="ellipsistwo">{{row.settleName}}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="结算单位" prop="proOrgName" v-if="user.orgType === 4" />
        <el-table-column align="center" label="结算对象" prop="settleOrgName" />
        <el-table-column align="center" label="本期结算周期">
          <template slot-scope="{ row }">
            <span>{{ row.beginDate }}~{{ row.endDate }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="本期结算时间" prop="settleDate" />
        <!-- <el-table-column align="center" label="本期完成产值（元）" prop="finishAmount" /> -->
        <el-table-column align="center" label="上期末含税结算金额（元）" prop="lastSettleAmount">
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.lastSettleAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="本期含税结算金额（元）" prop="settleAmount">
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.settleAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="本期末含税结算金额（元）" prop="endSettleAmount">
          <template slot-scope="{ row }">
            <span>{{ !pricePermission ? "***" : row.endSettleAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" prop="settleStatusStr">
          <template slot-scope="{ row }">
            <div style="display:flex;justify-content: center;align-items:center">
              <div>{{ row.settleStatusStr }}</div>
              <img src="../../assets/loader.gif" alt="" class="loaders" v-if="row.settleStatusStr == '数据处理中'" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="350">
          <template slot-scope="{ row }">
            <!-- 操作显示分为草稿状态，审核中状态，审核完成三种不同的状态 -->
            <div v-if="row.settleStatus === 0 || row.settleStatus === 3 || row.settleStatus === 7">
              <el-button size="mini" plain @click="showDialog(4, row.pkId)" v-show="row.settleStatus !== 0" v-has="'settlement:subcontractor:query'">查看审批详情</el-button>
              <el-button size="mini" plain v-if="row.sealStatus == '1' || row.sealStatus == '2'" @click="chapterClick(row)">{{ row.sealStatus == 2 ? "重新发起用章" : "发起用章" }}</el-button>
              <el-button size="mini" plain @click="showDialog(2, row.pkId)" v-show="row.settleStatus === 0" v-has="'settlement:subcontractor:query'">查看</el-button>
              <el-button size="mini" plain type="success" v-show="row.editStatus == '1'" @click="showDialog(1, row.pkId,row.settleStatus !== 0)" v-has="'settlement:subcontractor:edit'">{{ row.settleStatus !== 0 ? "重新发起" : "编辑" }}</el-button>
              <el-button size="mini" plain type="danger" @click="handleDel(row.pkId)" v-show="row.deleteStatus == '1'" v-has="'settlement:subcontractor:delete'" v-if="user.orgType === 5">删除</el-button>
              <!-- <el-button size="mini" plain @click="showDialog(3, row.pkId)" v-show="row.isUpdateAndDelete == '1'" v-has="'settlement:subcontractor:launch'" v-if="user.orgType === 5">发起流程</el-button> -->
            </div>
            <div v-else-if="![0, 3, 7].includes(row.settleStatus)">
              <el-button size="mini" plain type="success" v-if="row.sealStatus == '1' || row.sealStatus == '2'" @click="chapterClick(row)">{{ row.sealStatus == 2 ? "重新发起用章" : "发起用章" }}</el-button>
              <el-button size="mini" plain @click="showDialog(4, row.pkId)" v-has="'settlement:subcontractor:query'" v-show="![5, 6].includes(row.settleStatus)">查看审批详情</el-button>
              <el-button size="mini" plain @click="showDialog(7, row.pkId)" v-has="'settlement:subcontractor:query'" v-show="[5, 6].includes(row.settleStatus)">查看审批详情</el-button>
              <el-button size="mini" plain type="primary" v-if="row.handleStatus === 1" @click="showDialog(5, row.pkId)">审批</el-button>
              <el-button plain size="mini" type="primary" v-show="row.sealApproveStatus" @click="chapterApproveClick(row)">{{row.sealPersonStatus?'盖章':'审批'}}</el-button>
              <el-button size="mini" plain type="danger" v-if="row.cancelStatus === 1" @click="handleRecall(row.pkId)">撤回</el-button>
              <el-button size="mini" plain type="danger" v-show="row.sealWithdrawStatus == 1" @click="revocation(row)">撤回</el-button>
            </div>
            <!-- <div v-else-if="row.settleStatus === 2">
            <el-button size="mini" v-if="row.sealStatus == '1'" @click="chapterClick(row)">发起用章</el-button>
            <el-button size="mini" @click="showDialog(4, row.pkId)" v-has="'settlement:subcontractor:query'">查看审批详情</el-button>
          </div> -->
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <Pagination v-if="typeShow" :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 模态框 -->
    <subDialog :dialogVisible.sync="dialogVisible" :dialogType="dialogType" :orgType="user.orgType" :pkId="pkId" @updateList="getValuationList" :settlementObject="1" :getItemOrgType="'1'" :again="again"/>
    <!-- 发起印章流程弹窗 -->
    <chapterProcess :chapterDialog.sync="chapterDialog" @init="btnSearch" :bizType="1" :bizId="bizId"></chapterProcess>
    <chapterProcessApproval @init="getSubList" :chaptersApprovalDialog.sync="chaptersApprovalDialog" :bizType="1" :bizId="bizId" :sealPersonStatus="sealPersonStatus"></chapterProcessApproval>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
import subDialog from "./components/subDialog.vue";
import SearchBar from "./components/SearchBar.vue";
import chapterProcess from "../../components/inChapter/chapterProcess.vue";
import chapterProcessApproval from "../../components/inChapter/chapterProcessApproval.vue";
import api from "@/api/api";
export default {
  components: { Pagination, subDialog, SearchBar, chapterProcess, chapterProcessApproval },
  data() {
    return {
      tableData: [],
      options: [], // 项目部下拉框
      unitoptions: [], // 单位下拉框
      subOptions: [], // 分包单位下拉框
      dialogVisible: false,
      dialogType: 1, // 1为新增/编辑，2为查看，3为发起流程，4为查看审批流程，5为审批
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      inpData: {
        isWholeCustomOrg: 1,
        isWholeBuildOrg: 1,
        isWholeBid: 1,
        isWholeProject: 1,
        isWholeProOrg: 1,
        orgType: 1,
        endDate: "",
        beginDate: ""
      },
      orgIds: [""],
      settleOrgIds: [""],
      settleStatus: "",
      settleDate: "",
      searchData: {
        isWholeCustomOrg: 1,
        isWholeBuildOrg: 1,
        isWholeBid: 1,
        isWholeProject: 1,
        isWholeProOrg: 1,
        orgType: 1
      },
      collectTime: "",
      pkId: "",
      showSummary: false,
      tableKey: Math.random(),
      loading: false,
      chapterDialog: false,
      chaptersApprovalDialog: false,
      bizId: "",
      timess:null,
      // stateList: { 0:"草稿",1:"审批中", 2:"审批通过", 3:"审批不通过",4:"待签章",5:"签章中",6:"签章已完成 ",10:"数据处理中" },
      stateList: [],
      searchOptionsEnd: {
        disabledDate: time => {
          if (this.inpData.beginDate) {
            let d;
            if (typeof this.inpData.beginDate == "string") {
              d = new Date(this.inpData.beginDate).getTime();
            } else {
              d = this.inpData.beginDate.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      sealPersonStatus:0,
      typeShow:true,
      again:false
    };
  },
  created() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
      } else {
        this.$message.error(res.msg);
      }
    });
    this.getValuationList();
    if (this.user.orgType === 4) {
      this.getAllProject();
    }
    this.searchSettleStates();
    this.getSubList();
  },
  methods: {
    selectIds(arr,obj,isTrue){
      if(arr.length){
        if(arr.length>1){
          this.inpData = { ...this.inpData, isWholeBid: 0, fkProjectIds: arr[1] };
        }else{
          this.inpData = { ...this.inpData, isWholeBid: 0, fkProjectIds: arr[0] };
        }
        if(isTrue){
          this.btnSearch();
        }
      }
    },
    pageTime(boo){
      clearInterval(this.timess)
      if(boo){
        this.timess=setInterval(()=>{
          if(this.tableData.filter(item=>item.settleStatusStr== '数据处理中').length){
            this.getValuationList();
          }else{
            clearInterval(this.timess)
          }
        },3000)
      }
    },
    chapterApproveClick(row) {
      this.sealPersonStatus=row.sealPersonStatus
      this.bizId = row.sealPkId;
      this.chaptersApprovalDialog = true;
    },
    searchSettleStates() {
      this.$api.searchSettleStates().then(res => {
        if (res.code === 200) {
          this.stateList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    beginChange() {
      this.inpData.endDate = "";
    },
    chapterClick(row) {
      this.bizId = row.pkId;
      this.chapterDialog = true;
    },
    // 获取分包计价表
    getValuationList() {
      api
        .getStatsProjectPageListByCondition({
          ...this.page,
          ...this.searchData,
          settleType: 2
        })
        .then(res => {
          if (res.code === 200) {
            this.showSummary = false;
            if (res.data) {
              this.tableData = res.data.records;
              this.total = res.data.total - 0;
            } else {
              this.tableData = [];
            }
            this.pageTime(true)
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
            this.$nextTick(() => {
              this.showSummary = true;
              this.tableKey = Math.random();
            });
          } else {
            this.$message.warning(res.msg);
          }
        });
    },
    // 获取项目部
    getAllProject() {
      api.getItemListByCustom().then(res => {
        if (res.code === 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分包单位
    getSubList() {
      api.findCustomByUserId().then(res => {
        if (res.code === 200) {
          this.subOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 弹出模态框
    showDialog(type, pkId,again) {
      this.dialogType = type;
      this.pkId = pkId;
      if(again){
        this.again = true
      }else{
        this.again = false
      }
      console.log(pkId,again);
      this.dialogVisible = true;
    },
    // 删除按钮
    handleDel(pkId) {
      this.$confirm("确定删除该期结算记录？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        api.delStatsProjectById({ pkId }).then(res => {
          if (res.code === 200) {
            this.$message({
              type: "success",
              message: "删除成功!"
            });
            this.getValuationList();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 撤回按钮
    handleRecall(settleId) {
      this.dialogType = 9;
      this.pkId = settleId;
      this.dialogVisible = true;
    },
    revocation(row) {
      this.dialogType = 10;
      this.pkId = row.pkId;
      this.dialogVisible = true;
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.getValuationList();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getValuationList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getValuationList();
    },
    // 总价
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (["上期末含税结算金额（元）", "本期含税结算金额（元）", "本期末含税结算金额（元）"].findIndex(item => item === column.label) !== -1) {
          const values = data.map(item => item[column.property]);
          if (!this.pricePermission) {
            sums[index] = "***";
          } else {
            if (!values.every(value => isNaN(value))) {
              sums[index] =
                values
                  .reduce((prev, curr) => {
                    const value = Number(curr);
                    if (!isNaN(value)) {
                      return prev + curr;
                    } else {
                      return prev;
                    }
                  }, 0)
                  .toFixed(2) - 0;
            } else {
              sums[index] = "0";
            }
          }
        }
      });
      return sums;
    },
    // 项目部选择
    proChange(val) {
      if(val){
        this.inpData = { ...this.inpData, isWholeBid: 0, fkProjectIds: val };
      }else{
        this.inpData = { ...this.inpData, isWholeBid: 1 };
      }
      // if (this.orgIds.length) {
      //   const index = this.orgIds.findIndex(item => item === "");
      //   if (this.orgIds[this.orgIds.length - 1] === "") {
      //     this.orgIds = [""];
      //     delete this.inpData.fkProjectIds;
      //     this.inpData = { ...this.inpData, isWholeBid: 1 };
      //   } else {
      //     if (index !== -1) {
      //       this.orgIds.splice(index, 1);
      //     }
      //     const orgIds = this.orgIds.join(",");
      //     this.inpData = {
      //       ...this.inpData,
      //       isWholeBid: 0,
      //       fkProjectIds: orgIds
      //     };
      //   }
      // } else {
      //   delete this.inpData.fkProjectIds;
      //   this.inpData = { ...this.inpData, isWholeBid: 1 };
      // }
    },
    // 分包单位选择
    subChange() {
      if(val){
        this.inpData = { ...this.inpData, isWholeCustomOrg: 0, settleOrgIds:val };
      }else{
        this.inpData = { ...this.inpData, isWholeCustomOrg: 1 };
      }
      // if (this.settleOrgIds.length) {
      //   const index = this.settleOrgIds.findIndex(item => item === "");
      //   if (this.settleOrgIds[this.settleOrgIds.length - 1] === "") {
      //     this.settleOrgIds = [""];
      //     delete this.inpData.settleOrgIds;
      //     this.inpData = { ...this.inpData, isWholeCustomOrg: 1 };
      //   } else {
      //     if (index !== -1) {
      //       this.settleOrgIds.splice(index, 1);
      //     }
      //     const settleOrgIds = this.settleOrgIds.join(",");
      //     this.inpData = { ...this.inpData, isWholeCustomOrg: 0, settleOrgIds };
      //   }
      // } else {
      //   delete this.inpData.settleOrgIds;
      //   this.inpData = { ...this.inpData, isWholeCustomOrg: 1 };
      // }
    }
  },
  watch: {
    collectTime(val) {
      if (val) {
        this.inpData.beginDate = val[0];
        this.inpData.endDate = val[1];
      } else {
        delete this.inpData.beginDate;
        delete this.inpData.endDate;
      }
    },
    settleStatus(val) {
      if (val || val === 0) {
        this.inpData = { ...this.inpData, settleStatus: val };
      } else {
        delete this.inpData.settleStatus;
      }
    },
    settleDate(val) {
      if (val) {
        this.inpData = { ...this.inpData, settleDate: val };
      } else {
        delete this.inpData.settleDate;
      }
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    pricePermission() {
      const arr = this.$store.state.menuData.filter(item => item.menuCode == "settlement");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  background-color: #f3f3f3;
  .head {
    display: flex;
    align-items: center;
    width: 100%;
    .el-form {
      display: flex;
      align-items: center;
      .el-select,
      .el-input {
        width: 180px;
      }
    }
  }
}
.addBtn {
  margin-right: 20px;
}
.wh-220 {
  width: 220px;
}
/deep/.el-select {
  .el-select__tags-text {
    max-width: 100px;
  }
}
.loaders {
  width: 25px;
  height: 25px;
}
</style>
