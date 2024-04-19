<template>
  <div class="app-container">
    <!-- 头部搜索框 -->
    <div slot="header" class="clearfix card-header search-bar-box">
      <div class="head">
        <el-form ref="form" label-width="90px">
          <!-- <el-form-item label="项目" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9">
            <el-select v-model="proId" size="mini" @change="proChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="标段项目" v-if="user.orgType !== 5 && user.orgType !== 6 && user.orgType !== 7">
            <!-- <el-select v-model="linkProId" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in proOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
            </el-select> -->
            <proSelct @selectIds="selectIds"></proSelct>
          </el-form-item>
          <el-form-item label="项目部名称">
            <el-input size="mini" v-model="inpData.orgName" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="联系人">
            <el-input size="mini" v-model="inpData.linkMan" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input size="mini" v-model="inpData.linkPhone" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
          </el-form-item>
          <el-button type="primary"  icon="el-icon-search" size="mini" class="btn-serach el-button-primary" @click="searchBtn">查询</el-button>
        </el-form>
      </div>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height: 86%;">
      <!-- 表格 -->
      <el-table stripe :data="tableData" ref="tables" style="width: 100%" height="90%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'"
>
        <el-table-column label="序号" type="index" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="项目部名称" prop="orgName" align="center"> </el-table-column>
        <el-table-column label="联系人" prop="linkMan" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="联系电话" prop="linkPhone" width="150px" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="负责项目" prop="fkProjectName" align="center" v-if="user.orgType == 2 || user.orgType == 3 || user.orgType === 9" show-overflow-tooltip> </el-table-column>
        <el-table-column label="负责标段项目" :prop="user.orgType == 2 || user.orgType == 3 || user.orgType === 9 ? 'projectBidName' : 'fkProjectName'" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="项目地址" prop="projectAddress" width="300px" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="450" v-if="![6, 7].includes(user.orgType)">
          <template slot-scope="{ row }">
            <el-button plain size="mini" type="primary" @click="openCheckDialog(row.pkId)" v-has="'customer:project:query'">查看</el-button>
            <el-button plain size="mini" type="success" @click="openOrgaDialog(row.fkOrgId)" v-has="'customer:project:orgQuery'">组织架构</el-button>
            <el-button plain size="mini" type="info" v-has="'customer:project:infoQuery'" @click="openProInfoDialog(row.fkProjectId)">项目信息</el-button>
            <el-button plain size="mini" type="primary" @click="openProListDialog(row.fkOrgId)" v-has="'customer:project:listQuery'">工程项目表</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 分页组件 -->
      <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    </div>
    </div>
    <!-- 查看模态框 -->
    <el-dialog :close-on-press-escape="false" title="项目部信息" :visible.sync="checkDialog" @close="handleCancel" ref="checkModel" width="20%" v-dialogDrag :close-on-click-modal="false">
      <el-form :model="checkModel" label-width="90px"  class="dialog-form">
        <el-form-item label="企业名称">
          <el-input disabled size="mini" v-model="checkModel.orgName"></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input disabled size="mini" v-model="checkModel.linkMan"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input disabled size="mini" v-model="checkModel.linkPhone" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input disabled size="mini" v-model="checkModel.remark" type="textarea" resize="none" rows="6"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 组织架构模态框 organization-->
    <el-dialog :close-on-press-escape="false" title="组织架构" :visible.sync="orgaDialog" @close="handleCancel" ref="organizationModel" width="70%" v-dialogDrag :close-on-click-modal="false">
       <div class="dialog-form">
        <div class="manage">
        <div class="people">
          <div class="company" @click="companyClick">{{ company }}</div>
          <!-- 引入员工树形组建 -->
          <people :tree="dataStaff" @peopleInfo="peopleInfo" :defaultProps="defaultProps" class="peopletree"></people>
        </div>
        <!-- 员工表格 -->
        <div class="sheet">
          <el-table :data="orgData" border height="100%" :tooltip-effect="'light'">
            <el-table-column label="序号" align="center" type="index" width="60"> </el-table-column>
            <el-table-column prop="userName" label="员工姓名" align="center"> </el-table-column>
            <el-table-column label="性别" align="center">
              <template slot-scope="{ row }">
                <span>{{ row.sex === 1 ? "男" : "女" }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="telephone" label="手机号码" align="center" show-overflow-tooltip> </el-table-column>
            <!-- <el-table-column label="所属项目部" align="center">
              <template slot-scope="{ row }">
                {{ company }}
              </template>
            </el-table-column> -->
            <el-table-column prop="deptName" label="所属部门" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="roleName" label="所属角色" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="areaName" label="所管工区" align="center" show-overflow-tooltip> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
       </div> 

    </el-dialog>
    <!-- 项目信息模态框 -->
    <el-dialog :close-on-press-escape="false" title="项目信息" top="2vw" :visible.sync="ProInfoDialog" @close="handleCancel" ref="ProInfoModel" v-dialogDrag :close-on-click-modal="false">
      <el-form :model="ProInfoModel" label-width="100px"  class="dialog-form">
        <el-form-item label="项目名称：">
          <el-input size="mini" v-model="ProInfoModel.projectName" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="项目地点：">
          <el-input size="mini" v-model="ProInfoModel.detailAddress" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="建设单位：">
          <el-input size="mini" v-model="ProInfoModel.investorName" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="监理单位：">
          <el-input size="mini" v-model="ProInfoModel.supervisorName" class="wh-400" disabled :minlength="2" :maxlength="25"></el-input>
        </el-form-item>
        <el-form-item label="设计院：">
          <el-input size="mini" v-model="ProInfoModel.designName" class="wh-400" disabled :minlength="2" :maxlength="25"></el-input>
        </el-form-item>
        <el-form-item label="施工单位：">
          <el-input size="mini" v-model="ProInfoModel.contractorName" disabled class="wh-400" :minlength="2" :maxlength="25"></el-input>
        </el-form-item>
        <el-form-item label="合同金额：">
          <el-input size="mini" v-model="ProInfoModel.contractAmount" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="工期：">
          <el-input size="mini" v-model="ProInfoModel.duration" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="开工日期：">
          <el-date-picker size="mini" v-model="ProInfoModel.beginTime" type="date" format="yyyy-MM-dd" placeholder="选择日期时间" disabled class="wh-400"> </el-date-picker>
        </el-form-item>
        <el-form-item label="竣工日期：">
          <el-date-picker size="mini" v-model="ProInfoModel.endTime" type="date" format="yyyy-MM-dd" placeholder="选择日期时间" disabled class="wh-400"> </el-date-picker>
        </el-form-item>
        <el-form-item label="项目描述：">
          <el-input size="mini" v-model="ProInfoModel.remark" type="textarea" resize="none" disabled rows="5"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 工程项目表模态框 -->
    <el-dialog :close-on-press-escape="false" title="工程项目表" :visible.sync="ProListDialog" @close="handleCancel" ref="ProInfoModel" v-dialogDrag :close-on-click-modal="false">
      <div class="tables">
        <el-table :data="ProListData" stripe height="100%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'" >
          <el-table-column type="index" label="序号" align="center" width="80">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (proPage.pageNum - 1) * proPage.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="projectName" label="工程项目名称" align="center"></el-table-column>
          <el-table-column prop="manufacture" label="工程造价" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="quantities" label="工程量" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="规模" prop="largeScale" show-overflow-tooltip> </el-table-column>
          <el-table-column align="center" label="结构形式" prop="structure" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="projectScheme" label="施工方案" align="center" show-overflow-tooltip></el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <Pagination :pageSize="proPage.pageSize" :total="proTotal" :currentPage="proPage.pageNum" @handleSizeChange="proSizeChange" @handleCurrentChange="proCurrentChange" />
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
import people from "@/components/staff/people";
import bdMap from "@/components/bdMap/bdMap";
import api from "@/api/api";
export default {
  components: { Pagination, people, bdMap },
  data() {
    return {
      // 表单数据
      tableData: [],
      // 项目信息模态框
      ProInfoDialog: false,
      ProInfoModel: {},
      // 查看模态框
      checkDialog: false,
      checkModel: {},
      // 工程项目表模态框
      ProListDialog: false,
      proPage: {
        pageNum: 1,
        pageSize: 10
      },
      proTotal: 0,
      ProListData: [],
      // 组织架构模态框
      orgaDialog: false,
      // 左边树形结构绑定数据字段
      defaultProps: {
        children: "children",
        label: "aliasName"
      },
      dataStaff: [],
      orgData: [],
      form: {
        deptId: "",
        userId: ""
      },
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      inpData: {
        linkMan: "",
        linkPhone: "",
        orgName: "",
        isWholeBid: 1,
        isWholeProject: 1
      },
      searchData: { isWholeBid: 1, isWholeProject: 1 },
      mapStatus: false,
      company: "",
      proOrgId: "",
      proOptions: [],
      options: [],
      proId: "",
      linkProId: "",
      orgId: ""
    };
  },
  created() {
    if (this.user.orgType === 2 || this.user.orgType === 3 || this.user.orgType === 9) {
      this.getAllProject();
    }
    this.getDeptList();
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  methods: {
    selectIds(arr,obj,isTrue){
      if(arr.length){
        if(arr.length>1){
          this.proId = arr[0]
          this.linkProId=arr[1]
        }else{
          this.linkProId=arr[0]
        }
        if(isTrue){
          this.btnSearch();
        }
      }
    },
    // 获取项目部分页列表
    getDeptList() {
      const data = { ...this.page, customType: 2, ...this.searchData };
      api.getCustomPageListByCondition(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.code);
        }
      });
    },
    // 获取工程项目表
    getEnginnerList(proOrgId) {
      api.epcProjectList({ ...this.proPage, proOrgId }).then(res => {
        if (res.code === 200) {
          const { data } = res;
          this.ProListData = data.records;
          this.proTotal = data.total - 0;
        } else {
          this.$message.warning(res.code);
        }
      });
    },
    // 获取所有项目
    getAllProject() {
      api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
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
    // 搜索按钮
    searchBtn() {
      this.page.pageNum = 1;
      if (this.proId && this.linkProId) {
        this.searchData = {
          ...this.inpData,
          isWholeProject: 0,
          isWholeBid: 0,
          fkProjectId: this.linkProId
        };
      } else if (!this.proId && this.linkProId) {
        this.searchData = {
          ...this.inpData,
          isWholeProject: 1,
          isWholeBid: 0,
          fkProjectId: this.linkProId
        };
      } else if (this.proId && !this.linkProId) {
        this.searchData = {
          ...this.inpData,
          isWholeProject: 0,
          isWholeBid: 1,
          fkProjectId: this.proId
        };
      } else {
        this.searchData = {
          ...this.inpData,
          isWholeProject: 1,
          isWholeBid: 1,
          fkProjectId: ""
        };
      }
      this.getDeptList();
    },
    // 打开工程项目表模态框
    openProListDialog(proOrgId) {
      this.proOrgId = proOrgId;
      this.getEnginnerList(proOrgId);
      this.ProListDialog = true;
    },
    // 工程项目表pageSize改变
    proSizeChange(val) {
      this.proPage.pageSize = val;
      this.getEnginnerList(this.proOrgId);
    },
    // 工程项目表current改变
    proCurrentChange(val) {
      this.proPage.pageNum = val;
      this.getEnginnerList(this.proOrgId);
    },

    // 打开查看模态框
    openCheckDialog(pkId) {
      api.getCustomInfoById({ pkId }).then(res => {
        if (res.code === 200) {
          const { data } = res;
          this.checkModel = data;
          this.checkDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开项目信息模态框
    openProInfoDialog(pkId) {
      api.getProjectInfoById({ pkId }).then(res => {
        if (res.code === 200) {
          this.ProInfoModel = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
      this.ProInfoDialog = true;
    },
    // 打开组织架构模态框
    openOrgaDialog(orgId) {
      this.form = { deptId: "", userId: "" };
      this.getAllDeptAndStaff(orgId);
      this.orgaDialog = true;
      this.orgId = orgId;
      this.getData();
    },

    // 关闭模态框
    handleCancel() {
      this.ProInfoDialog = false;
      this.ProInfoModel = {};
      this.proPage = { pageNum: 1, pageSize: 10 };
      this.ProListData = [];
      this.checkDialog = false;
      this.checkModel = {};
      this.ProListDialog = false;
      this.orgaDialog = false;
      this.dataStaff = [];
      this.orgData = [];
      this.proOrgId = "";
    },
    // 员工信息
    peopleInfo(data) {
      // 清空对象
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      if (data.deptName != null) {
        this.form.userId = "";
        this.form.deptId = data.pkId;
      } else {
        this.form.deptId = "";
        this.form.userId = data.pkId;
      }
      this.getData();
    },
    // 获取数据的方法
    getData() {
      const params = {
        pageNum: 1,
        pageSize: 1000,
        orgId: this.orgId
      };
      this.$api.getUserPageList({ ...params, ...this.form }).then(res => {
        if (res.code === 200) {
          this.orgData = res.data.records;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询树形员工结构
    getAllDeptAndStaff(orgId) {
      this.$api.getAllDeptAndStaff({ orgId }).then(res => {
        if (res.code === 200) {
          // 树形员工集合res.data.children
          this.dataStaff = res.data.children;
          this.company = res.data.aliasName;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getDeptList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getDeptList();
    },
    // 组织公司点击
    companyClick() {
      this.form = { deptId: "", userId: "" };
      this.getData();
    },
    // 选择项目部
    proChange(e) {
      this.linkProId = "";
      if (e) {
        this.allListBidByProId(0, e);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tables {
  height: 500px;
}
.card-header {
  display: flex;
  background-color: $searcHeder;
  margin-bottom: 14px;
  .head {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 4px 0;
    .el-form {
      display: flex;
      align-items: center;
      .el-select,
      .el-input {
        width: 180px;
      }
      .el-form-item {
        margin-bottom: 0;
      }
    }
    .addBtn {
      margin-top: 5px;
      height: 28px;
    }
  }
}
.btn-serach {
  margin-left: 20px;
  height: 28px;
}
.manage {
  display: flex;
  ::-webkit-scrollbar {
    width: 5px;
    color: #fff;
    background-color: #fcfcfc;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgb(209, 209, 209);
  }
}
.people {
  width: 15%;
  height: 520px;
  padding-left: 20px;
  border: 1px solid #ebeef5;
  overflow: auto;
}
.sheet {
  flex: 1;
  width: 0;
  height: 520px;
  .el-table--border {
    width: 98%;
  }
}
.company {
  cursor: pointer;
}
</style>
