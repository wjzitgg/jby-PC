<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <custom style="height: 93%;" v-show="!basicStatus" @choose="choose" :types="'0'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject"
          style="padding: 0"></el-button>{{ headDate.orgName }}</span>
      <span class="item">管理员手机号码：{{ headDate.telephone }}</span>
      <span class="item">联系人:{{ headDate.linkMan }}</span>
      <span class="item">联系人手机号码：{{ headDate.linkPhone }}</span>
      <span class="item">到期日期：{{ headDate.expireTime }}</span>
    </div>
    <!-- <material v-show="basicStatus" :headDate="headDate" :basicStatus="basicStatus" :types="'0'"></material> -->
    <el-dialog title="选择项目部" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div style="height: 510px;">
        <custom @choose="choose" ref="custom" :status="choiceShow" :types="'0'"></custom>
      </div>
    </el-dialog>
    <div class="search-bar-box" v-show="basicStatus">
      <span class="label-text">操作人</span>
      <el-cascader size="mini" class="wh-200" ref="cascader" :options="deptOptions" clearable :props="defaultProps"
        :emitPath="false" v-model="listQuery.fkUserId" filterable></el-cascader>
      <span class="m-left label-text">类型</span>
      <el-select v-model="listQuery.logType" placeholder="请选择" size="mini" class="wh-200">
        <el-option label="全部" value=""></el-option>
        <el-option label="登录" value="0"></el-option>
        <el-option label="登出" value="1"></el-option>
        <el-option label="新增" value="2"></el-option>
        <el-option label="修改" value="3"></el-option>
        <el-option label="删除" value="4"></el-option>
        <el-option label="导入" value="5"></el-option>
        <el-option label="到出" value="6"></el-option>
        <el-option label="下载" value="7"></el-option>
        <el-option label="打印" value="8"></el-option>
        <el-option label="其他" value="9"></el-option>
      </el-select>
      <span class="m-left label-text">操作日期</span>
      <el-date-picker value-format="yyyy-MM-dd" size="mini" class="wh-200" v-model="listQuery.beginTime" type="date"
        placeholder="选择日期"></el-date-picker>
      <span class="label-text">起</span>
      <el-date-picker value-format="yyyy-MM-dd" :picker-options="pickerOptionsEnd" size="mini" class="wh-200"
        v-model="listQuery.endTime" type="date" placeholder="选择日期"></el-date-picker>
      <span class="label-text">止</span>
      <span class="m-left label-text">日志内容</span>
      <el-input v-model="listQuery.title" placeholder="请输入日志内容" size="mini" class="wh-200" maxlength="100"></el-input>

      <el-button type="primary"  icon="el-icon-search el-button-primary"  size="mini" class="ml-20" @click="search">查询</el-button>
    </div>
    <div class="tab-container" v-show="basicStatus">
      <div class="table-data" style="height:80%">
        <el-table ref="tables" :data="tableData" stripe height="93%" style="width: 100%" v-loading="loading"
          :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="userName" label="操作人" min-width="80" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" prop="mobile" label="手机号码" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="deptName" label="所属部门" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="roleName" label="岗位" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="ipAddress" label="IP地址" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="operateSource" label="操作端" min-width="80">
            <template slot-scope="{ row }">
              <span v-if="row.operateSource == 0">PC端</span>
              <span v-if="row.operateSource == 1">APP端</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="operateTime" label="操作时间" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="logType" label="操作类型" min-width="80">
            <template slot-scope="{ row }">
              <span v-if="row.logType == 0">登录</span>
              <span v-if="row.logType == 1">登出</span>
              <span v-if="row.logType == 2">新增</span>
              <span v-if="row.logType == 3">修改</span>
              <span v-if="row.logType == 4">删除</span>
              <span v-if="row.logType == 5">导出</span>
              <span v-if="row.logType == 6">下载</span>
              <span v-if="row.logType == 7">打印</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="title" label="操作内容" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="operateParam" label="操作数据" min-width="160" show-overflow-tooltip></el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount"
          @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
      </div>
    </div>
  </div>
</template>

<script>
import custom from "./compomemts/custom.vue";
// import material from "./compomemts/material.vue";
export default {
  name: "customData",
  components: {
    custom,
    // material
  },
  data() {
    return {
      basicStatus: false,
      headDate: {},
      choiceShow: false,
      // ==========================
      loading: false,
      totalCount: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        fkUserId: "",
        logType: "",
        beginTime: "",
        endTime: "",
        title: ""
      },
      tableData: [],
      deptOptions: [],
      defaultProps: {
        value: "pkId",
        label: "aliasName",
        children: "children",
        emitPath: false
      },
      pickerOptionsEnd: {
        disabledDate: time => {
          if (this.listQuery.beginTime) {
            let d;
            if (typeof this.listQuery.beginTime == "string") {
              d = new Date(this.listQuery.beginTime).getTime();
            } else {
              d = this.listQuery.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
    };
  },

  mounted() {
    // this.getData();
  },
  methods: {
    choose(item) {
      console.log(item);
      this.headDate = item;
      this.basicStatus = false;
      this.choiceShow = false;
      this.$nextTick(() => {
        this.basicStatus = true;
        this.getOrgPageList();
        this.getAllDeptAndStaff()
      });
    },
    choiceProject() {
      this.choiceShow = true;
      this.$nextTick(() => {
        this.$refs.custom.reset();
      });
    },
    // 查询公司下所有的部门以及部门下的员工
    getAllDeptAndStaff() {
      this.$api.getAllDeptAndStaff({ orgId: this.headDate.pkId }).then(res => {
        if (res.code == 200) {
          this.deptOptions = res.data.children
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    peopleChange(e) {
      if (e) {
        console.log(e, this.$refs.cascader.getCheckedNodes());
        let people = this.$refs.cascader.getCheckedNodes()[0].data;
        // this.wareForm.people = people.aliasName; //pkId
        // this.wareForm.phoneNum = people.telephone;
      } else {
        // this.wareForm.phoneNum = "";
      }
    },
    // 查询
    search() {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = 10;
      this.getOrgPageList();
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    getOrgPageList() {
      let data = {
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize,
        fkOrgId: this.headDate.pkId,
        fkUserId: this.listQuery.fkUserId,
        logType: this.listQuery.logType,
        beginTime: this.listQuery.beginTime,
        endTime: this.listQuery.endTime,
        title: this.listQuery.title,
      };
      this.loading = true;
      this.$api.sysLogSearchPage(data).then(res => {
        if (res.code == 200) {
          const options = {
            0: "审批中",
            1: "审批通过",
            2: "审批不通过"
          };
          const orgTypeOptions = {
            0: "系统运营商",
            1: "系统代理商",
            2: "建设单位(业主方)",
            3: "监理公司",
            4: "施工单位",
            5: "项目部",
            6: "供应商",
            7: "分包单位",
            8: "劳务工人",
            9: "设计院"
          };
          res.data.records.forEach(item => {
            item.orgTypeName = orgTypeOptions[item.orgType];
            item.approveStatusName = options[item.approveStatus];
          });
          this.tableData = res.data.records;
          this.totalCount = res.data.total - 0;
          // total
          this.loading = false;
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.headline {
  background: #fff;
  font-size: 12px;
  line-height: 50px;
  .item {
    padding: 0 20px;
    font-size: 14px;
    color: #9d9399;
  }
}

// /deep/ .el-dialog__header {
//   background: #ccc;
// }

.m-left {
  margin-left: 8px;
}
.label-text{
  font-size: 14px;
}
/deep/ .el-table__body-wrapper{
  background-color: #fff;
}
</style>
