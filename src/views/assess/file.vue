<template>
  <div class="app-container">
    <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="类型" label-width="40px">
          <el-select v-model="inpData.processType" size="mini">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in typeArr" :key="item.keyVal" :value="item.keyVal" :label="item.keyName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务名称">
          <el-input size="mini" v-model="inpData.businessName" maxlength="50"></el-input>
        </el-form-item>
        <el-button size="mini" icon="el-icon-search" type="primary" class="ml-20 search" @click="btnSearch">查询</el-button>
      </el-form>
    </div>
    <div class="table-data" style="height: 81%; margin-top: 10px">
      <el-table stripe height="98%" ref="tables" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="业务名称" align="center" prop="businessName" show-overflow-tooltip></el-table-column>
        <el-table-column label="发起单位" align="center" prop="startOrgName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="发起人" align="center" prop="startUserName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="发起时间" align="center" prop="startTime" show-overflow-tooltip> </el-table-column>
        <el-table-column label="盖章人" align="center" prop="sealUserName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="盖章时间" align="center" prop="sealTime" show-overflow-tooltip> </el-table-column>
        <el-table-column label="状态" align="center" prop="statusStr" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="160px">
          <template slot-scope="{ row }">
            <el-button plain type="primary" size="mini" @click="examine(row)">查看</el-button>
            <el-button plain type="warning" size="mini" v-if="row.sealStatus == 1" @click="stamp(row)">盖章</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    <!-- 施工验收 -->
    <proCheckDialog :data="disposeData" :proChangeDialog.sync="proChangeDialog" :appDiaType="appDiaType" @getList="getData" />
    <!-- 设计变更 -->
    <approvalDialog  :appDiaType="4" :showData="disposeData" approvalTitle="变更设计详情" :approvalDialog="approvalDialog" @close="approvalDialogClose"></approvalDialog>
    <!-- 结算 -->
    <MyDialog :dialogVisible.sync="dialogVisible" :dialogType="7" :orgType="user.orgType" :pkId="pkId"  :settlementObject="0" :getItemOrgType="'0'" />
    <!-- 盘点 -->
    <approveManageementDialog  ref="approveManageementDialog" :appDialog.sync="appDialog" :appDialogType="4" appDialogTitle="流程信息" @closeLoading="closeLoading"></approveManageementDialog>
    <!-- 盖章 -->
    <chapterProcessApproval @init="getData" :chaptersApprovalDialog.sync="chaptersApprovalDialog" :bizType="0" :sealPersonStatus="sealPersonStatus" :bizId="bizId"></chapterProcessApproval>
  </div>
</template>
  
  <script>
import proCheckDialog from "../home/compoments/proCheckDialog.vue"; // 查看详情
import chapterProcessApproval from "../../components/inChapter/chapterProcessApproval.vue";

import approvalDialog from "../design/component/approvalDialog.vue";
import MyDialog from "../settlement/components/MyDialog.vue";
// import approveManageementDialog from "./approveManageementDialog.vue";
import approveManageementDialog from "../supplies/components/approveManageementDialog.vue"
// /components/MyDialog
export default {
  components: { proCheckDialog, chapterProcessApproval, approvalDialog ,MyDialog,approveManageementDialog},
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
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
        processType: "",
        businessName: ""
      },
      searchData: {
        processType: "",
        businessName: ""
      },
      proChangeDialog: false,
      disposeData: {},
      appDiaType: 4,
      typeArr: [],
      chaptersApprovalDialog: false,
      sealPersonStatus: 1,
      bizId: "",
      approvalDialog: false,
      dialogVisible:false,
      pkId:"",
      appDialog:false
    };
  },
  mounted() {
    this.findProcessByType();
    this.searchNoticPage();
  },
  methods: {
    closeLoading(){
      this.loading=false
    },
    approvalDialogClose() {
      this.approvalDialog = false;
    },
    getData() {
      this.searchNoticPage();
    },
    searchNoticPage() {
      let data = {
        ...this.page,
        ...this.searchData
      };
      this.$api.oaSealSearchPage(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchNoticPage();
    },
    examine(row) {
      this.$api.getBusinessInfo({ businessId: row.businessId, businessType: row.businessType }).then(res => {
        if (res.code == 200) {
          // res.data.reItemApproveDtoList = res.data
          if (row.businessType == 0) {
            this.disposeData = res.data.prodProcessApproveVo;
            this.proChangeDialog = true;
          }
          if (row.businessType == 1) {
            this.disposeData = res.data.statsProjectSettleVo;
            this.pkId = res.data.statsProjectSettleVo.pkId;
            this.dialogVisible = true
          }
          if (row.businessType == 2) {
            this.disposeData = res.data.matOrderInventoryVo;
            this.appDialog = true
            // this.$nextTick()
            this.$refs.approveManageementDialog.findOrderInventoryById(this.disposeData.pkId,1);
          }
          if (row.businessType == 3) {
            // this.disposeData = res.data.changeDesignDetailVo; 6676bug 后端增加了eng
            this.disposeData =  res.data.engChangeDesignDetailVo;// 6676bug 后端增加了eng
            this.approvalDialog = true;
          }
          //   this.disposeData.reItemApproveDtoList =[res.data]
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    stamp(row) {
      this.bizId = row.sealPkId;
      this.chaptersApprovalDialog = true;
    },

    // pageSize改变
    handleSizeChange(val) {
      this.page.pageNum = 1;
      this.page.pageSize = val;
      this.searchNoticPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchNoticPage();
    },
    findProcessByType() {
      this.$api.findProcessByType().then(res => {
        if (res.code == 200) {
          this.typeArr = res.data;
          console.log("-----------------------------------====xxxx===---------");
          console.log(this.typeArr);
          console.log("-----------------------------------====xxxx===---------");
        } else {
          this.$message.error(res.msg);
        }
      });
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
  padding: 0 15px;
  font-size: 14px;
  // margin-bottom: 5px;
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
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
</style>
  