<template>
  <div class="app-container" v-loading="loading">
    <!-- <el-radio-group v-model="radio" size="small" @change="radioChange">
      <el-radio-button :label="1">明细流水表</el-radio-button>
      <el-radio-button :label="2">月汇总表</el-radio-button>
    </el-radio-group> -->
    <el-tabs v-model="radio" @tab-click="radioChange" v-if="typeShow">
      <el-tab-pane label="明细流水表" name="1"></el-tab-pane>
      <el-tab-pane label="月汇总表" name="2"></el-tab-pane>
    </el-tabs>
    <!-- 搜索栏 -->
    <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="标段项目" v-if="user.orgType !== 5">
          <el-select v-model="inpData.bidProjectId" size="mini" class="wh-200" @change="proChange" v-if="[6, 7].includes(user.orgType)">
            <el-option value="" label="全部" v-if="radio == 1"></el-option>
            <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
          <proSelct @selectIds="selectIds" v-else></proSelct>
        </el-form-item>
        <el-form-item label="年度" v-if="radio == 2 && typeShow">
          <el-date-picker v-model="inpData.year" type="year" value-format="yyyy" size="mini"> </el-date-picker>
        </el-form-item>
        <el-form-item label="筛选类别" v-if="radio == 1 && typeShow">
          <el-select v-model="inpData.fkClassId" size="mini" class="wh-200">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in typeMangerData" :key="item.pkId" :value="item.pkId" :label="item.className"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" v-if="radio == 1 && typeShow">
          <el-select v-model="inpData.fkDeptId" size="mini" class="wh-200" :disabled="user.orgType !== 5 && !inpData.bidProjectId">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in deptOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" v-if="radio == 1 && typeShow">
          <el-date-picker size="mini" class="wh-200" value-format="yyyy-MM-dd" v-model="inpData.deadline"></el-date-picker>
        </el-form-item>
        <el-button v-if="typeShow" size="mini" type="primary" icon="el-icon-search" class="ml-20 search" @click="btnSearch">查询</el-button>
      </el-form>
      <el-button size="mini" type="primary" @click="openManageDialog(2)" v-if="radio == 1 && typeShow" v-has="'finance:management:add'">新增</el-button>
    </div>
    <div class="table-data" style="height:75%;margin-top: 10px;" v-if="typeShow">
      <!-- 表格 -->
      <el-table ref="tables1" :key="randomKey" v-if="radio == 1" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'" :show-summary="radio == 1" :summary-method="getSummaries2">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="bidProjectName" align="center" v-if="user.orgType === 4" show-overflow-tooltip> </el-table-column>
        <el-table-column label="费用类别" prop="className" align="center"> </el-table-column>
        <el-table-column label="部门" prop="deptName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="负责人" prop="userName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="结算时间" prop="paymentTime" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="金额" prop="costAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="250px">
          <template slot-scope="{ row }">
            <el-button plain size="mini" type="primary" @click="openManageDialog(1, row)" v-has="'finance:management:query'">查看</el-button>
            <el-button plain size="mini" type="success" @click="openManageDialog(3, row)" v-has="'finance:management:update'">编辑</el-button>
            <el-button plain size="mini" type="danger" @click="manageDel(row)" v-has="'finance:management:delete'">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-table ref="tables2" :key="randomKey" v-if="radio == 2" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :show-summary="radio == 2" :summary-method="getSummaries">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="费用类别" prop="costClassName" align="center"> </el-table-column>
        <el-table-column label="一月" prop="costJanuary" align="center"> </el-table-column>
        <el-table-column label="二月" prop="costFebruary" align="center"> </el-table-column>
        <el-table-column label="三月" prop="costMarch" align="center"> </el-table-column>
        <el-table-column label="四月" prop="costApril" align="center"> </el-table-column>
        <el-table-column label="五月" prop="costMay" align="center"> </el-table-column>
        <el-table-column label="六月" prop="costJune" align="center"> </el-table-column>
        <el-table-column label="七月" prop="costJuly" align="center"> </el-table-column>
        <el-table-column label="八月" prop="costAugust" align="center"> </el-table-column>
        <el-table-column label="九月" prop="costSeptember" align="center"> </el-table-column>
        <el-table-column label="十月" prop="costOctober" align="center"> </el-table-column>
        <el-table-column label="十一月" prop="costNovember" align="center"> </el-table-column>
        <el-table-column label="十二月" prop="costDecember" align="center"> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="radio != 2 && typeShow"></tablePaging>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 管理成本弹框 -->
    <el-dialog :title="manageDialogTitle" :visible="manageDialog" @close="closeManageDialog" width="30%" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form ref="manageForm" :model="manageForm" :rules="rules" label-width="80px" class="dialog-form">
        <el-form-item label="费用类别" prop="fkClassId" v-if="this.manageDialogType !== 1">
          <el-select size="mini" style="width:80%" v-model="manageForm.fkClassId" :disabled="manageDialogType === 1">
            <el-option v-for="item in typeMangerData" :key="item.pkId" :value="item.pkId" :label="item.className"></el-option>
          </el-select>
          <span class="typeManger" @click="openTypeMangerDialog" v-if="user.orgType === 5">类别管理</span>
        </el-form-item>
        <el-form-item label="费用类别" prop="fkClassId" v-if="this.manageDialogType === 1">
          <el-input v-model="manageForm.className" size="mini" style="width:80%" disabled></el-input>
          <!-- <span class="typeManger" @click="openTypeMangerDialog" v-if="user.orgType === 5">类别管理</span> -->
        </el-form-item>
        <el-form-item label="部门" prop="fkDeptId">
          <el-select v-model="manageForm.fkDeptId" size="mini" style="width:80%" @change="deptChange" v-if="this.manageDialogType !== 1">
            <el-option v-for="item in deptOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
          <el-input v-model="manageForm.deptName" size="mini" style="width:80%" disabled v-else></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="fkUserId">
          <el-select v-model="manageForm.fkUserId" size="mini" style="width:80%" :disabled="manageDialogType === 1 || !manageForm.fkDeptId" v-if="this.manageDialogType !== 1">
            <el-option v-for="item in peopleOptions" :key="item.value" :value="item.value" :label="item.userName"></el-option>
          </el-select>
          <el-input v-model="manageForm.userName" size="mini" style="width:80%" disabled v-else></el-input>
        </el-form-item>
        <el-form-item label="支付日期" prop="paymentTime">
          <el-date-picker size="mini" style="width:80%" value-format="yyyy-MM-dd" v-model="manageForm.paymentTime" :disabled="manageDialogType === 1" :picker-options="addTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="金额" prop="costAmount">
          <el-input style="width:80%" v-model="manageForm.costAmount" :disabled="manageDialogType === 1" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="manageForm.costAmount = $event.target.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" v-if="manageDialogType !== 1">
        <el-button size="mini" @click="closeManageDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="manageDialogOk">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 类别管理弹框 -->
    <el-dialog title="类别管理" :visible="typeMangerDialog" @close="closeTypeMangerDialog" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <div class="typeMangerDialog">
          <el-table ref="typeMangerTables" border :data="typeMangerData" height="100%" :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column label="序号" type="index" align="center" width="80"> </el-table-column>
            <el-table-column label="类别名称" prop="className" align="center"> </el-table-column>
            <el-table-column align="center">
              <template slot="header" slot-scope="row">
                <el-button v-if="row" size="mini" type="primary" @click="openTypeManger(1)">新增</el-button>
              </template>
              <template slot-scope="{ row }">
                <el-button plain size="mini" type="success" @click="openTypeManger(2, row)">编辑</el-button>
                <el-button plain size="mini" type="danger" @click="deleteType(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
    <el-dialog width="30%" top="15vw" :title="typeDialogTitle" :visible="typeDialog" @close="closeTypeDialog" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form ref="typeForm" class="dialog-form" :model="typeForm" :rules="rules" label-width="80px">
        <el-form-item label="类别名称" prop="className">
          <el-input size="mini" v-model="typeForm.className" maxlength="25" @input="verify"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closeTypeDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="typeDialogOk">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
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
    } else {
      this.getAllDeptAndStaff(this.user.fkOrgId);
      this.searchProCostPage();
    }
    this.searchProjCostClass();
  },
  data() {
    const checkAge = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入金额"));
      }
      if (value > 999999999999.99) {
        callback(new Error("最大值为999999999999.99"));
      } else {
        callback();
      }
    };
    return {
      year: new Date().getFullYear() + "",
      loading: false,
      radio: "1",
      proOptions: [],
      deptOptions: [],
      peopleOptions: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, // 分页数据
      total: 0, // 分页总数
      tableData: [], // 列表数据
      inpData: {
        deadline: "",
        bidProjectId: "",
        fkClassId: "",
        fkDeptId: "",
        year: ""
      },
      searchData: {
        deadline: "",
        bidProjectId: "",
        fkClassId: "",
        fkDeptId: "",
        year: ""
      },
      randomKey: Math.random(),
      manageDialog: false,
      manageDialogType: 1,
      manageDialogTitle: "",
      manageForm: {
        costAmount: "",
        fkClassId: "",
        fkDeptId: "",
        fkUserId: "",
        paymentTime: "",
        sourceType: 1
      },
      rules: {
        costAmount: [{ validator: checkAge, trigger: "blur" }],
        fkClassId: [{ required: true, message: "请选择费用类别", trigger: "change" }],
        fkDeptId: [{ required: true, message: "请选择部门", trigger: "change" }],
        fkUserId: [{ required: true, message: "请选择负责人", trigger: "change" }],
        paymentTime: [{ required: true, message: "请选择支付日期", trigger: "blur" }],
        className: [{ required: true, message: "请请输入类别名称", trigger: "blur" }]
      },
      typeMangerDialog: false,
      typeMangerData: [],
      typeDialog: false,
      typeDialogTitle: "",
      typeForm: {
        className: ""
      },
      typeMangerType: 1,
      addTime: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      amount: 0,
      typeShow: true
    };
  },
  methods: {
    verify(value) {
      console.log(value);
      this.typeForm.className = value.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\-\_\——]/g, "");
    },
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.inpData.bidProjectId = arr[1];
        } else {
          this.inpData.bidProjectId = arr[0];
        }
        if (isTrue) {
          this.btnSearch();
        }
        console.log(arr, this.inpData.bidProjectId);
        // this.getAllProject(true);
        this.inpData.fkDeptId = "";
        this.getAllDeptAndStaff(obj.fkOrgId);
      }
    },
    // 分页列表
    searchProCostPage() {
      const data = { ...this.page, ...this.searchData };
      delete data.year;
      this.$api.searchProCostPage(data).then(res => {
        console.log(res);
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.randomKey = Math.random();
          this.amount = res.data.amount;
          this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 月汇总表
    monthSummary() {
      this.$api.monthSummary({ year: this.searchData.year, bidProjectId: this.searchData.bidProjectId }).then(res => {
        console.log("月汇总表", res);
        if (res.code === 200) {
          this.tableData = res.data;
          this.randomKey = Math.random();
          this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    getAllProject(isTrue) {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
          if (isTrue) {
            this.proChange(this.inpData.bidProjectId);
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取部门
    getAllDeptAndStaff(orgId) {
      this.$api.getAllDeptAndStaff({ orgId }).then(res => {
        console.log("部门", res);
        if (res.code === 200) {
          this.deptOptions = res.data.children ? res.data.children.map(item => ({ ...item, value: item.pkId, label: item.deptName })) : [];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询费用分类表
    searchProjCostClass() {
      this.$api.searchProjCostClass().then(res => {
        console.log("分类表", res);
        if (res.code === 200) {
          this.typeMangerData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 头部radio事件
    radioChange(e) {
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.tableData = [];
      this.randomKey = Math.random();
      this.inpData = {
        deadline: "",
        bidProjectId: [5, 6, 7].includes(this.user.orgType) ? "" : this.inpData.bidProjectId,
        fkClassId: "",
        fkDeptId: "",
        year: ""
      };
      this.searchData = { deadline: "", bidProjectId: [5, 6, 7].includes(this.user.orgType) ? "" : this.searchData.bidProjectId, fkClassId: "", fkDeptId: "", year: "" };
      // if (e.name == 2 && this.user.orgType === 4) {
      //   this.inpData.fkBidProjectId = this.proOptions.length ? this.proOptions[0].pkId : "";
      //   this.searchData.fkBidProjectId = this.proOptions.length ? this.proOptions[0].pkId : "";
      // }
      if (e.name == 1) {
        this.searchProCostPage();
      } else {
        const time = new Date().getFullYear() + "";
        // 直接赋值会导致日期选择器失效
        this.$set(this.inpData, "year", time);
        this.$set(this.searchData, "year", time);
        // this.inpData.year = time;
        // this.searchData.year = time;
        if ([6, 7].includes(this.user.orgType)) {
          const bidId = this.proOptions.length ? this.proOptions[0].pkId : "";
          this.inpData.bidProjectId = bidId;
          this.searchData.bidProjectId = bidId;
        }
        this.monthSummary();
      }
    },
    // 标段修改事件
    proChange(e) {
      this.inpData.fkDeptId = "";
      if (e) {
        const fkOrgId = this.proOptions.filter(item => item.value === e)[0].fkOrgId;
        this.getAllDeptAndStaff(fkOrgId);
      }
    },
    // 部门cahnge事件
    deptChange(e) {
      this.peopleOptions = this.deptOptions.filter(item => item.value === e)[0].children ? this.deptOptions.filter(item => item.value === e)[0].children.map(item => ({ ...item, value: item.pkId, label: item.loginName })) : [];
    },
    openManageDialog(type, row) {
      this.manageDialogType = type;
      if (type === 1) {
        this.manageDialogTitle = "查看成本";
        this.manageForm = { ...row };
        // this.peopleOptions = this.deptOptions.filter(item => item.value === row.fkDeptId)[0].children ? this.deptOptions.filter(item => item.value === row.fkDeptId)[0].children.map(item => ({ ...item, value: item.pkId, label: item.loginName })) : [];
      } else if (type === 2) {
        this.manageDialogTitle = "新增成本";
      } else {
        this.manageDialogTitle = "编辑成本";
        this.manageForm = { ...row };
        this.peopleOptions = this.deptOptions.filter(item => item.value === row.fkDeptId)[0].children ? this.deptOptions.filter(item => item.value === row.fkDeptId)[0].children.map(item => ({ ...item, value: item.pkId, label: item.loginName })) : [];
      }
      this.manageDialog = true;
    },
    async manageDialogOk() {
      await this.$refs.manageForm.validate();
      if (this.manageDialogType === 2) {
        this.loading = true;
        this.$api.addProCost(this.manageForm).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.$message.success("新增成功");
            this.searchProCostPage();
            this.closeManageDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.loading = true;
        this.$api.updateProCost(this.manageForm).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.$message.success("修改成功");
            this.searchProCostPage();
            this.closeManageDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeManageDialog() {
      this.$refs.manageForm.resetFields();
      this.manageDialog = false;
      this.manageForm = {
        costAmount: "",
        fkClassId: "",
        fkDeptId: "",
        fkUserId: "",
        paymentTime: "",
        sourceType: 1
      };
    },
    // 打开成本类别管理
    openTypeMangerDialog() {
      this.typeMangerDialog = true;
    },
    // 打开新增，编辑类型弹框
    openTypeManger(type, row) {
      // type 1为新增，2为编辑
      this.typeMangerType = type;
      if (type === 1) {
        this.typeDialogTitle = "新增类型";
      } else {
        this.typeDialogTitle = "编辑类型";
        this.typeForm = { ...row };
      }
      this.typeDialog = true;
    },
    async typeDialogOk() {
      await this.$refs.typeForm.validate();
      if (this.typeMangerType === 1) {
        this.loading = true;
        this.$api.addProjCostClass(this.typeForm).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.$message.success("新增类别成功");
            this.closeTypeDialog();
            this.searchProjCostClass();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.loading = true;
        this.$api.updateProjCostClass(this.typeForm).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.$message.success("修改类别成功");
            this.closeTypeDialog();
            this.searchProjCostClass();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeTypeDialog() {
      this.$refs.typeForm.resetFields();
      this.typeDialog = false;
      this.typeForm = {
        className: ""
      };
    },
    // 删除类型
    deleteType(row) {
      this.$confirm("确定删除该类别?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.loading = true;
        this.$api.deleteProjCostClass({ pkId: row.pkId }).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.searchProjCostClass();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    closeTypeMangerDialog() {
      this.typeMangerDialog = false;
    },
    // 删除费用类别
    manageDel(row) {
      this.$confirm("确定删除该成本?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delProCost({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.searchProCostPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      if (this.radio == 1) {
        this.searchProCostPage();
      } else {
        this.monthSummary();
      }
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.searchProCostPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchProCostPage();
    },
    // 合计函数
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "总价";
          return;
        }
        if (column.label.includes("月")) {
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
            sums[index] = "";
          }
        }
      });
      return sums;
    },
    // 合计函数
    getSummaries2(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (column.label == "金额") {
          sums[index] = this.amount;
        }
      });
      return sums;
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
.typeMangerDialog {
  height: 500px;
}
.typeManger {
  cursor: pointer;
  color: #4394e6;
}
/deep/ .el-tabs__header {
  background-color: #fff;
}
/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
</style>
