<template>
  <div class="app-container">
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px">
          <el-form-item label="项目" v-if="user.orgType === 2 || user.orgType === 3">
            <el-select v-model="proId" size="mini" @change="proChange" class="wh-200">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="结算标段" v-if="user.orgType !== 5">
            <el-select v-model="linkProId" size="mini" v-if="user.orgType === 2 || user.orgType === 3" class="wh-200" multiple collapse-tags @change="bidProChange($event, 1)">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in proOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
            </el-select>
            <el-select v-model="linkProId" size="mini" class="wh-200" multiple collapse-tags @change="bidProChange($event, 2)" v-else>
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="项目部">
            <el-select
              size="mini"
              class="wh-200"
              v-model="orgIds"
              multiple
              collapse-tags
              @change="proChange"
            >
              <el-option value="" label="全部"></el-option>
              <el-option
                v-for="item in options"
                :key="item.pkId"
                :value="item.pkId"
                :label="item.projectOrgName"
              ></el-option>
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="分包单位" v-if="user.orgType === 7">
            <el-select
              size="mini"
              class="wh-200"
              v-model="settleOrgIds"
              multiple
              collapse-tags
              @change="subChange"
            >
              <el-option value="" label="全部"></el-option>
              <el-option
                v-for="item in subOptions"
                :key="item.fkCustomId"
                :value="item.fkCustomId"
                :label="item.customName"
              ></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="结算周期">
            <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.beginDate"  @change="beginChange"></el-date-picker>
            <span>至</span>
            <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.endDate" :picker-options="searchOptionsEnd"></el-date-picker>
          </el-form-item>
          <!-- <el-form-item label="结算周期">
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
          <!-- <el-form-item label="结算日期" v-if="false">
            <el-date-picker
              size="mini"
              type="date"
              value-format="yyyy-MM-dd"
              v-model="inpData.settleDate"
            >
            </el-date-picker>
          </el-form-item> -->
          <el-form-item label="审批状态">
            <el-select size="mini" class="wh-100" v-model="settleStatus">
              <el-option label="全部" value=""></el-option>
              <el-option :value="item.name" :label="item.key" v-for="item in stateList" :key="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-button size="mini" type="primary"  icon="el-icon-search" class="ml-20" @click="btnSearch">查询</el-button>
        </el-form>
      </template>
    </SearchBar>
    <!-- 表格 -->
    <div class="table-data" style="height:80%">
    <el-table :tooltip-effect="'light'" :data="tableData" ref="tables" height="100%" :show-summary="showSummary" :summary-method="getSummaries" stripe :header-cell-style="{ background: '#f1f6ff'}" :key="tableKey">
      <el-table-column align="center" label="序号" width="60">
        <template slot-scope="scope">
          <div style="text-align: center">
            {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="结算单名称" prop="settleName" >
        <template slot-scope="{row}">
            <div class="ellipsistwo">{{row.settleName}}</div>
          </template>
      </el-table-column>
      <el-table-column align="center" label="项目" prop="projectName" v-if="[2, 3, 9].includes(user.orgType)" show-overflow-tooltip/>
      <el-table-column align="center" label="结算标段" prop="bidProjectName" show-overflow-tooltip/>
      <el-table-column align="center" label="结算单位" prop="settleOrgName" show-overflow-tooltip/>
      <el-table-column align="center" label="本期结算周期" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span>{{ row.beginDate }}~{{ row.endDate }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="本期结算时间" prop="settleDate" show-overflow-tooltip/>
      <!-- <el-table-column align="center" label="本期完成产值（元）" prop="finishAmount" /> -->
      <el-table-column align="center" label="上期末含税结算金额（元）" prop="lastSettleAmount" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span>{{ !pricePermission?'***':row.lastSettleAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="本期含税结算金额（元）" prop="settleAmount" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span>{{ !pricePermission?'***':row.settleAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="本期末含税结算金额（元）" prop="endSettleAmount" show-overflow-tooltip> 
        <template slot-scope="{ row }">
          <span>{{ !pricePermission?'***':row.endSettleAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="settleStatusStr" show-overflow-tooltip>
        <template slot-scope="{ row }">
        <div style="display:flex;justify-content: center;align-items:center">
            <div>{{row.settleStatusStr}}</div>
            <img src="../../assets/loader.gif" alt="" class="loaders" v-if="row.settleStatusStr=='数据处理中'">
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="350">
        <template slot-scope="{ row }">
          <div>
            <el-button size="mini" type="success" plain v-show="row.sealStatus == '1' || row.sealStatus == '2'" @click="chapterClick(row)">{{ row.sealStatus == 2 ? "重新发起用章" : "发起用章" }}</el-button>
            <el-button size="mini" plain @click="showDialog(4, row.pkId)" v-has="'settlement:project:approveQuery'" v-show="![5,6].includes(row.settleStatus)">查看审批详情</el-button>
            <el-button size="mini" plain @click="showDialog(7, row.pkId)" v-has="'settlement:project:approveQuery'" v-show="[5,6].includes(row.settleStatus)">查看审批详情</el-button>
            <el-button size="mini" plain type="primary" v-if="row.handleStatus === 1&&user.orgType!=7" @click="showDialog(5, row.pkId)">审批</el-button>
            <el-button size="mini" plain type="primary" v-if="row.handleStatus === 1&&user.orgType==7" @click="showDialog(5, row.pkId)">确认</el-button>
            <el-button size="mini" plain type="danger" v-show="row.sealWithdrawStatus == 1" @click="revocation(row)">撤回</el-button>
            <el-button plain size="mini" type="primary" v-show="row.sealApproveStatus" @click="chapterApproveClick(row)">{{row.sealPersonStatus?'盖章':'审批'}}</el-button>
          </div>
        </template>
      </el-table-column>
      <div slot="empty" class="empty" style="width: 100%">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </el-table>
    </div>
    <!-- 分页组件 -->
    <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    <!-- 模态框 -->
    <MyDialog :dialogVisible.sync="dialogVisible" :dialogType="dialogType" :orgType="user.orgType" @updateList="getProSettingList" :pkId="pkId" v-if="user.orgType!==7"/>
    <subDialog :dialogVisible.sync="dialogVisible" :dialogType="dialogType" :orgType="user.orgType" @updateList="getProSettingList" :pkId="pkId" v-if="user.orgType===7"/>
    <!-- 发起印章流程弹窗 -->
    <chapterProcess @init="getProSettingList" :chapterDialog.sync="chapterDialog" :bizType="1" :bizId="bizId"></chapterProcess>
    <chapterProcessApproval @init="getProSettingList" :chaptersApprovalDialog.sync="chaptersApprovalDialog" :bizType="1" :bizId="bizId" :sealPersonStatus="sealPersonStatus"></chapterProcessApproval>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
import MyDialog from "./components/MyDialog";
import subDialog from "./components/subDialog";
import SearchBar from "./components/SearchBar.vue";
import chapterProcess from "../../components/inChapter/chapterProcess.vue";
import chapterProcessApproval from "../../components/inChapter/chapterProcessApproval.vue";
import api from "@/api/api";
export default {
  components: { Pagination, MyDialog,subDialog, SearchBar,chapterProcess,chapterProcessApproval },
  data() {
    return {
      tableData: [],
      options: [], //项目部下拉框
      subOptions: [], //分包单位下拉框
      dialogVisible: false,
      dialogType: 1, // 1为新增/编辑，2为查看，3为发起流程，4为查看审批流程，5为审批，6为确认
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
        beginDate: "",
        endDate: ""
      },
      orgIds: [""],
      settleOrgIds: [""],
      settleStatus: "",
      searchData: {
        isWholeCustomOrg: 1,
        isWholeBuildOrg: 1,
        isWholeBid: 1,
        isWholeProject: 1,
        isWholeProOrg: 1
      },
      collectTime: "",
      pkId: "",
      proId: "",
      linkProId: [""],
      proOptions: [],
      showSummary: false,
      tableKey: Math.random(),
      // stateList: { 0:"草稿",1:"审批中", 2:"审批通过", 3:"审批不通过",4:"待签章",5:"签章中",6:"签章已完成 ",10:"数据处理中" },
      stateList:[],
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
      chapterDialog: false,
      bizId: "",
      chaptersApprovalDialog: false,
      timess:null,
      sealPersonStatus:0
    };
  },
  mounted() {
    // if (this.user.orgType !== 5) {
    //   this.getSubList();
    // } else {
    //   this.getAllProject();
    // }
    if (this.user.orgType === 7) {
      // this.getSubList();
      this.searchData = { ...this.searchData, orgType: 1 };
    }
    if (this.user.orgType === 2 || this.user.orgType === 3) {
      this.searchData = { ...this.searchData, orgType: 0 };
    }
    this.searchSettleStates()
    this.getAllProject();
    this.getProSettingList();
  },
  methods: {
    pageTime(boo){
      clearInterval(this.timess)
      if(boo){
        this.timess=setInterval(()=>{
          if(this.tableData.filter(item=>item.settleStatusStr== '数据处理中').length){
            this.getProSettingList();
          }else{
            clearInterval(this.timess)
          }
        },3000)
      }
    },
    chapterClick(row) {
      this.bizId = row.pkId;
      this.chapterDialog = true;
    },
    chapterApproveClick(row) {
      this.sealPersonStatus=row.sealPersonStatus
      this.bizId = row.sealPkId;
      this.chaptersApprovalDialog = true;
    },
    revocation(row) {
      this.dialogType = 10;
      this.pkId = row.pkId;
      this.dialogVisible = true;
    },
    searchSettleStates(){
      this.$api.searchSettleStates().then(res=>{
        if(res.code===200){
          this.stateList=res.data
        }else{
          this.$message.warning(res.msg)
        }
      })
    },
    beginChange(){
      this.inpData.endDate=""
    },
    // 获取项目结算表
    getProSettingList() {
      api
        .getStatsProjectPageListByCondition({
          ...this.page,
          ...this.searchData,
          settleType:this.user.orgType===7?2:1
        })
        .then(res => {
          if (res.code === 200) {
            this.showSummary = false;
            this.tableData = res.data.records;
            this.pageTime(true)
            this.total = res.data.total - 0;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
            this.$nextTick(() => {
              this.tableKey = Math.random();
              this.showSummary = true;
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
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "") {
      api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 弹出模态框
    showDialog(type, pkId) {
      this.dialogType = type;
      this.pkId = pkId;
      this.dialogVisible = true;
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      if (this.proId && this.linkProId.length && this.linkProId.join(",")) {
        this.searchData = {
          ...this.inpData,
          isWholeProject: 0,
          isWholeBid: 0,
          fkProjectIds: this.linkProId.join(","),
          orgType: this.sendOrgType
        };
      } else if (!this.proId && this.linkProId.length && this.linkProId.join(",")) {
        this.searchData = {
          ...this.inpData,
          isWholeProject: 1,
          isWholeBid: 0,
          fkProjectIds: this.linkProId.join(","),
          orgType: this.sendOrgType
        };
      } else if ((this.proId && !this.linkProId.length) || (this.proId && !this.linkProId.join(""))) {
        this.searchData = {
          ...this.inpData,
          isWholeProject: 0,
          isWholeBid: 1,
          fkProjectIds: this.proId,
          orgType: this.sendOrgType
        };
      } else {
        this.searchData = {
          ...this.inpData,
          isWholeProject: 1,
          isWholeBid: 1,
          fkProjectIds: "",
          orgType: this.sendOrgType
        };
      }
      this.getProSettingList();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getProSettingList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getProSettingList();
    },
    //总价
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
          if(!this.pricePermission){
            sums[index] = "***";
          }else{
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
    // proChange() {
    //   if (this.orgIds.length) {
    //     let index = this.orgIds.findIndex((item) => item === "");
    //     if (this.orgIds[this.orgIds.length - 1] === "") {
    //       this.orgIds = [""];
    //       delete this.inpData.orgIds;
    //       this.inpData = { ...this.inpData, isWholeCustomOrg: 1 };
    //     } else {
    //       if (index !== -1) {
    //         this.orgIds.splice(index, 1);
    //       }
    //       let orgIds = this.orgIds.join(",");
    //       this.inpData = { ...this.inpData, isWholeCustomOrg: 0, orgIds };
    //     }
    //   } else {
    //     delete this.inpData.orgIds;
    //     this.inpData = { ...this.inpData, isWholeCustomOrg: 1 };
    //   }
    // },
    // 项目选择事件
    proChange(e) {
      this.linkProId = "";
      if (e) {
        this.allListBidByProId(0, e);
      } else {
        this.proOptions = [];
      }
    },
    // 标段项目选择事件
    bidProChange(e, type) {
      if (this.linkProId.length) {
        let index = this.linkProId.findIndex(item => item === "");
        if (this.linkProId[this.linkProId.length - 1] === "") {
          this.linkProId = [""];
          this.inpData = { ...this.inpData, isWholeBid: 1 };
        } else {
          if (index !== -1) {
            this.linkProId.splice(index, 1);
          }
          let fkProjectIds = this.linkProId.join(",");
          this.inpData = { ...this.inpData, isWholeBid: 0, fkProjectIds };
        }
      } else {
        this.inpData = { ...this.inpData, isWholeBid: 1 };
      }
    },
    // 分包单位选择
    subChange() {
      if (this.settleOrgIds.length) {
        let index = this.settleOrgIds.findIndex(item => item === "");
        if (this.settleOrgIds[this.settleOrgIds.length - 1] === "") {
          this.settleOrgIds = [""];
          delete this.inpData.settleOrgIds;
          this.inpData = { ...this.inpData, isWholeCustomOrg: 1 };
        } else {
          if (index !== -1) {
            this.settleOrgIds.splice(index, 1);
          }
          let settleOrgIds = this.settleOrgIds.join(",");
          this.inpData = { ...this.inpData, isWholeCustomOrg: 0, settleOrgIds };
        }
      } else {
        delete this.inpData.settleOrgIds;
        this.inpData = { ...this.inpData, isWholeCustomOrg: 1 };
      }
    }
  },
  watch: {
    collectTime(val) {
      if (val) {
        this.inpData = {
          ...this.inpData,
          beginDate: val[0],
          endDate: val[1]
        };
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
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    pricePermission(){
      let arr =this.$store.state.menuData.filter(item=>item.menuCode=='settlement')
      if(![0].includes(this.user.orgType)){
        return arr.length?!!arr[0].states:false
      }else{
        return true
      }
    },
    sendOrgType() {
      if (this.user.orgType === 2 || this.user.orgType === 3) {
        return 0;
      } else {
        return 1;
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
    justify-content: flex-end;
    width: 100%;
    .addBtn {
      margin-top: 5px;
      height: 28px;
    }
  }
}
/deep/.el-select {
  .el-select__tags-text {
    max-width: 100px;
  }
}
.loaders{
  width: 25px;
  height: 25px;
}
</style>
