<template>
  <div class="app-container">
    <!-- 头部搜索框 -->
    <div slot="header" class="clearfix card-header">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <el-form-item label="联系人">
            <el-input size="mini" v-model="inpData.linkMan"  maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input size="mini" v-model="inpData.linkPhone" type="number"
              oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
          </el-form-item>
          <el-button type="primary" size="mini" icon="el-icon-search" class="btn-serach el-button-primary"
            @click="searchBtn">查询</el-button>
        </el-form>
      </div>
    </div>
    <!-- 表格       height="500"-->
    <div class="tab-container">
      <div class="table-data" style="height: 81%;">
        <el-table  :tooltip-effect="'light'" :data="tableData" stripe ref="tables" style="width: 100%" v-loading="loading" height="100%"
          :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column label="序号" type="index" align="center" width="80">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="项目部名称" prop="orgName" align="center"> </el-table-column>
          <el-table-column label="负责人" prop="linkMan" width="120px" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="联系电话" prop="linkPhone" width="150px" align="center" show-overflow-tooltip> </el-table-column>
          <!-- <el-table-column label="备注" prop="remark" width="300px" align="center" show-overflow-tooltip> </el-table-column> -->
          <el-table-column label="操作" align="center" width="420">
            <template slot-scope="{ row }">
              <el-button plain size="mini" type="primary" @click="openCheckDialog(row)"
                v-has="'org:jurisdiction:query'">查看</el-button>
              <el-button plain size="mini" type="success" @click="Organization(row.pkId)"
                v-has="'org:jurisdiction:framework'">组织架构</el-button>
              <el-button plain size="mini" type="info" @click="openProInfoDialog(row.pkId)"
                v-has="'org:jurisdiction:project'">项目信息</el-button>
              <el-button plain size="mini" type="primary" v-has="'org:jurisdiction:engineering'"
                @click="openProListDialog(row.pkId)">工程项目表</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页组件 -->
      <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum"
        @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    </div>

    <!-- 查看模态框 -->
    <el-dialog :close-on-press-escape="false" title="项目部信息" :visible.sync="checkDialog" @close="handleCancel"
      ref="checkModel" width="20%" v-dialogDrag :close-on-click-modal="false">
      <el-form :model="checkModel" label-width="70px" class="dialog-form" style="padding-bottom:8px">
        <el-form-item label="企业名称">
          <el-input disabled size="mini" v-model="checkModel.orgName"></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input disabled size="mini" v-model="checkModel.linkMan"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input disabled size="mini" v-model="checkModel.linkPhone" type="number"
            oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
        </el-form-item>
        <!-- <el-form-item label="备注">
          <el-input disabled size="mini" v-model="checkModel.remark" type="textarea" resize="none" rows="6"></el-input>
        </el-form-item> -->
      </el-form>
    </el-dialog>
    <!-- 组织架构模态框 organization-->
    <el-dialog :close-on-press-escape="false" title="项目部组织架构" :visible.sync="orgaDialog" @close="handleCancel"
      ref="organizationModel" width="70%" v-dialogDrag :close-on-click-modal="false">
      <div class="manage1">
        <div class="people">
          <div class="peopleClick" style="width: max-content" @click="dianji">
            {{ company }}
          </div>
          <!-- 引入员工树形组建 -->
          <people :tree="dataStaff" @peopleInfo="peopleInfo" :defaultProps="defaultProps"></people>
        </div>
        <!-- 员工表格 -->
        <div class="sheet">
          <el-table  :tooltip-effect="'light'" :data="orgData" border v-loading="loading" height="560">
            <el-table-column prop="id" label="序号" align="center" type="index" width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (pageNum2 - 1) * pageSize2 + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="员工姓名" align="center"> </el-table-column>
            <el-table-column prop="gender" label="性别" align="center" width="60">
              <template slot-scope="{ row }">
                <span v-if="row.sex === 1">男</span>
                <span v-if="row.sex === 2">女</span>
              </template>
            </el-table-column>
            <el-table-column prop="telephone" label="手机号码" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="deptName" label="所属部门" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="roleName" label="所属角色" align="center" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="areaName" label="所管工区" align="center" show-overflow-tooltip> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <!-- 分页组件 -->
          <Pagination :pageSize="pageSize2" :total="total2" :currentPage="pageNum2" @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange" />
        </div>
      </div>
    </el-dialog>
    <!-- 项目信息模态框 -->
    <el-dialog :close-on-press-escape="false" title="项目信息" width="460px" :visible.sync="ProInfoDialog" @close="handleCancel"
      ref="ProInfoModel" v-dialogDrag :close-on-click-modal="false">
      <el-form :model="ProInfoModel" label-width="90px"  class="dialog-form" style="padding-bottom:8px">
        <el-form-item label="项目名称：">
          <el-input size="mini" v-model="ProInfoModel.projectName" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="项目地点：">
          <el-input size="mini" v-model="ProInfoModel.detailAddress" disabled class="wh-400"></el-input>
          <!-- <i class="iconfont icondingwei" @click="appear"></i>
          <div class="bd-map" v-if="mapStatus">
            <i class="el-icon-circle-close" @click="appear"></i>
            <bdMap
              @detailedAddress="detailedAddress"
              :lat="ProInfoModel.longitude"
              :lng="ProInfoModel.latitude"
            ></bdMap>
          </div> -->
        </el-form-item>
        <el-form-item label="建设单位：">
          <el-input size="mini" v-model="ProInfoModel.investorName" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="合同金额：">
          <el-input size="mini" v-model="ProInfoModel.contractAmount" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="工期：">
          <el-input size="mini" v-model="ProInfoModel.duration" disabled class="wh-400"></el-input>
        </el-form-item>
        <el-form-item label="开工日期：">
          <el-date-picker size="mini" v-model="ProInfoModel.beginTime" type="date" format="yyyy-MM-dd"
            placeholder="选择日期时间" disabled class="wh-400"> </el-date-picker>
        </el-form-item>
        <el-form-item label="竣工日期：">
          <el-date-picker size="mini" v-model="ProInfoModel.endTime" type="date" format="yyyy-MM-dd" placeholder="选择日期时间"
            disabled class="wh-400"> </el-date-picker>
        </el-form-item>
        <el-form-item label="项目描述：">
          <el-input size="mini" class="wh-400" v-model="ProInfoModel.remark" type="textarea" resize="none" disabled rows="5"></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 工程项目表模态框 -->
    <el-dialog :close-on-press-escape="false" title="工程项目表" :visible.sync="ProListDialog" @close="handleCancel"
      ref="ProInfoModel" v-dialogDrag :close-on-click-modal="false">
      <el-table  :tooltip-effect="'light'" :data="ProListData" border height="500">
        <el-table-column type="index" label="序号" align="center" width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (proPage.pageNum - 1) * proPage.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="工程项目名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="quantities" label="工程量" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="projectScheme" label="施工方案" align="center" show-overflow-tooltip></el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <Pagination :pageSize="proPage.pageSize" :total="proTotal" :currentPage="proPage.pageNum"
        @handleSizeChange="proSizeChange" @handleCurrentChange="proCurrentChange" />
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
      dataStaff: [],
      orgData: [],
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      // 点击树形传值需用到
      thisPkid: "",
      userId: "",
      deptId: "",
      total2: 0,
      pageNum2: 1,
      pageSize2: 10,
      inpData: {
        linkMan: "",
        linkPhone: ""
      },
      searchData: {},
      mapStatus: false,
      //左边树形结构绑定数据字段
      defaultProps: {
        children: "children",
        label: "aliasName"
      },
      company: "",
      loading: false
    };
  },
  created() {
    this.getDeptList();
  },
  methods: {
    // 获取项目部列表
    getDeptList() {
      let data = { ...this.page, ...this.searchData };
      this.loading = true;
      api.theProject(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.loading = false;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取工程项目表
    epcProjectList() {
      this.$api.epcProjectList({ ...this.proPage, proOrgId: this.thisPkid }).then(res => {
        if (res.code === 200) {
          // let { data } = res;
          // return console.log(res)
          this.ProListData = res.data.records;
          // this.ProListData = data.records;
          this.proTotal = res.data.total - 0;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开工程项目表模态框
    openProListDialog(pkId) {
      this.thisPkid = pkId;
      this.epcProjectList();
      this.ProListDialog = true;
    },
    // 工程项目表pageSize改变
    proSizeChange(val) {
      this.proPage.pageSize = val;
      this.epcProjectList();
    },
    // 工程项目表current改变
    proCurrentChange(val) {
      this.proPage.pageNum = val;
      this.epcProjectList();
    },

    // 打开查看模态框
    openCheckDialog(row) {
      this.checkModel = row;
      this.checkDialog = true;
      // api.getCustomInfoById({ pkId }).then((res) => {
      //   if (res.code === 200) {
      //     let { data } = res;
      //     this.checkModel = data;
      //     this.checkDialog = true;
      //   } else {
      //     this.$message.warning(res.msg);
      //   }
      // });
    },
    // 打开项目信息模态框
    openProInfoDialog(pkId) {
      api.findProjectByProOrgId({ proOrgId: pkId }).then(res => {
        if (res.code === 200) {
          this.ProInfoModel = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
      this.ProInfoDialog = true;
    },
    dianji() {
      this.userId = "";
      this.deptId = "";
      this.employeeList();
    },
    // 组织架构
    Organization(pkId) {
      this.userId = "";
      this.deptId = "";
      this.thisPkid = pkId;
      this.employeeList();
      this.getAllDeptAndStaff(pkId);
      setTimeout(() => {
        this.orgaDialog = true;
      }, 200);
    },
    // 员工列表
    employeeList() {
      let params = {
        pageNum: this.pageNum2,
        pageSize: this.pageSize2,
        orgId: this.thisPkid,
        userId: this.userId,
        deptId: this.deptId
      };
      this.loading = true;
      this.$api
        .getUserPageList(params)
        .then(res => {
          if (res.code === 200) {
            this.orgData = res.data.records;
            this.total2 = res.data.total - 0;
            this.loading = false;
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;

        });
    },
    // 查询树形员工结构
    getAllDeptAndStaff(pkId) {
      this.$api.getAllDeptAndStaff({ orgId: pkId }).then(res => {
        if (res.code === 200) {
          // 树形员工集合
          this.dataStaff = res.data.children;
          this.company = res.data.aliasName;
        } else {
          this.$message.warning(res.msg);
        }
      });
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
    },
    // 员工信息
    peopleInfo(data) {
      console.log(data);
      if (data.deptName != null) {
        this.userId = "";
        this.deptId = data.pkId;
      } else {
        this.deptId = "";
        this.userId = data.pkId;
      }
      // this.userId = data.pkId;
      this.employeeList();
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
    // pageSize改变
    handleSizeChange2(val) {
      this.pageSize2 = val;
      this.employeeList();
    },
    // current改变
    handleCurrentChange2(val) {
      this.pageNum2 = val;
      this.employeeList();
    },
    searchBtn() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.getDeptList();
    },
    // 地图
    // appear() {
    //   this.mapStatus = !this.mapStatus;
    // },
    // 地图详细地址
    detailedAddress(data) {
      console.log(data);
    }
  }
};
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  background-color: $searcHeder;
  margin-bottom: 14px;

  .head {
    display: flex;
    align-items: center;
    width: 100%;
    height: 80px;

    // padding: 4px 0;
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

.manage1 {
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
  width: 20%;
  height: 600px;
  padding-left: 20px;
  border: 1px solid #ebeef5;
  overflow: auto;
}

.sheet {
  width: 100%;
  height: 100%;

  .el-table--border {
    width: 98%;
  }
}

/deep/ .el-form-item__content {
  display: flex;

  .icondingwei {
    color: blue;
    cursor: pointer;
    font-size: 24px;
  }
}

.bd-map {
  width: 400px;
  position: absolute;
  right: 0;
  top: 0;
  border: 1px solid #f3f3f3;
  z-index: 99;

  .el-icon-circle-close {
    cursor: pointer;
    font-size: 20px;
    position: absolute;
    top: -22px;
    left: 48%;
  }
}

.peopleClick:hover {
  cursor: pointer;
}

// /deep/.el-table {
//   height: 600px;
// }</style>
