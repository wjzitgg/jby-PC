<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <search-bar class="search-bar-demo" @search="searchData" :options="searchOptions" :total="totalCount" labelWidth="8em" ref="searchBar" :showHandler="false"></search-bar>
    <div class="tab-container">
      <el-table :data="tableData" border height="70%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" width="60" align="center" type="index">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (params.pageNum - 1) * params.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orgName" label="企业名称" align="center"> </el-table-column>
        <el-table-column prop="telephone" label="管理员手机号码" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="linkMan" label="联系人" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="linkPhone" label="联系人手机号码" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="createTime" label="注册日期" width="180" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column prop="expireTime" label="到期日期" width="180" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="定制" width="90" align="center">
          <template slot-scope="{ row }">
            <el-button v-has="'system:orgmenu:query'" size="mini" @click="custom(row)">定制</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 分页 -->
      <tablePaging :currentPage="params.pageNum" :pageSize="params.pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    </div>

    <!-- 弹窗 -->
    <el-dialog title="定制权限" width="45%" :visible.sync="popup" :destroy-on-close="true" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="form" class="form-input">
        <el-form-item label="企业名称" :label-width="formLabelWidth">
          <el-input v-model="form.orgName" size="mini" disabled class="wh-200"></el-input>
        </el-form-item>
        <el-form-item label="管理员手机号码" label-width="120px">
          <el-input v-model="form.telephone" size="mini" disabled class="wh-200"></el-input>
        </el-form-item>
      </el-form>
      <el-radio-group v-model="orgType" class="org-type" size="mini" @change="orgTypeChange">
        <el-radio-button label="1">PC权限</el-radio-button>
        <el-radio-button label="2">APP权限</el-radio-button>
      </el-radio-group>
      <!-- 权限表格 -->
      <permIssion ref="permIssion" v-loading="loading" @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData" :checkList="selectTree" :typeStatus="!typeStatus" v-show="orgType == 1"></permIssion>
      <permIssion ref="permIssion2" v-loading="loading" @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData2" :checkList="selectTree2" :typeStatus="!typeStatus" v-show="orgType == 2"></permIssion>
      <span slot="footer" class="dialog-footer" v-if="!typeStatus">
        <el-button @click="callOff">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tablePaging from "../../components/tablePaging.vue";
import permIssion from "../../components/permission/permission"; // 菜单权限组建
export default {
  name: "orgmenu",
  watch: {
    popup(val) {
      if (!val) {
        this.orgType = "1";
      }
    }
  },
  data() {
    return {
      searchOptions: [
        {
          type: "input",
          prop: "orgName",
          value: "",
          title: "企业名称",
          placeholder: ""
        },
        // {
        //   type: "input",
        //   prop: "loginName",
        //   value: "",
        //   title: "主账号",
        //   placeholder: ""
        // },
        {
          type: "inputPhone",
          prop: "telephone",
          value: "",
          title: "管理员手机号码",
          placeholder: ""
        }
      ],
      totalCount: 0,
      tableData: [],
      selectTree: [],
      selectTree2: [],
      popup: false, // 控制弹窗显示隐藏
      form: {
        orgName: "",
        loginName: ""
      },
      formLabelWidth: "80px",
      typeStatus: false, // 输入框状态
      treeData: [], //    权限组件
      treeData2: [], //    权限组件
      params: {
        // loginName: null, // 主账号
        orgName: null, // 企业名称
        telephone: null, // 联系电话
        pageNum: 1,
        pageSize: 10,
        type: "0"
        // orgType: -1
      },
      total: 0,
      deptName: "",
      loading: false,
      itemData: {},
      orgType: "1"
    };
  },
  components: {
    tablePaging,
    permIssion
  },
  mounted() {
    this.getData();
  },
  methods: {
    // 获取数据的方法
    getData() {
      this.loading = true;
      this.$api
        .searchPageByType(this.params)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
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
    orgTypeChange(val) {
      this.custom(this.itemData);
    },
    // 点击定制按钮
    custom(item) {
      this.selectTree = [];
      this.selectTree2 = [];
      this.itemData = item;
      // 获取所有权限
      this.$api
        .searchCustomMenu({ orgId: this.orgType })
        .then(res => {
          if (res.code == 200) {
            this.treeData = res.data.sysMenuListPc;
            this.treeData2 = res.data.sysMenuListApp;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
      // 保存后的权限
      this.$api
        .selectListByOrgId({ fkOrgId: item.pkId, sourceType: this.orgType })
        .then(res => {
          if (res.code == 200) {
            const arr = [];
            if (res.data.length != 0) {
              res.data.forEach(item => {
                arr.push(item.fkMenuId);
              });
            }
            this.selectTree = arr;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
      this.form = Object.assign(this.form, item);
      this.typeStatus = false;
      this.popup = true;
    },

    // 弹窗的保存权限
    getchekcData() {
      const data1 = this.$refs.permIssion.getchekcData();
      const data2 = this.$refs.permIssion2.getchekcData();
      const data3 = data1.concat(data2); // 合并PC和APP的选中所有权限
      const data = data3.filter(item => item != undefined);
      const selectData = this.selectTree.concat(this.selectTree2); // 合并PC和APP的选中所有权限
      const arrData = diff(selectData, data);
      this.form.addMenuListSet = arrData[1]; // 新增arr

      // const data1 = this.$refs.permIssion.getchekcData();
      // const data2 = this.$refs.permIssion2.getchekcData();
      // const data = data1.concat(data2); // 合并PC和APP的选中所有权限
      // const selectData = this.selectTree.concat(this.selectTree2); // 合并PC和APP的选中所有权限
      // const arrData = diff(selectData, data);
      // const sysReOrgMenuAddList = arrData[1]; // 新增arr
      this.loading = true;
      const params = {
        sysReOrgMenuAddList,
        fkOrgId: this.itemData.pkId,
        sourceType: this.orgType
      };
      this.$api
        .sysReOrgMenuAdd(params)
        .then(res => {
          if (res.code == 200) {
            this.$message.success(res.msg);
            this.popup = false;
            this.loading = false;
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });

      function diff(arr1, arr2) {
        const newArr = [];
        const arr3 = [];
        for (let i = 0; i < arr1.length; i++) {
          if (arr2.indexOf(arr1[i]) === -1) arr3.push(arr1[i]);
        }
        const arr4 = [];
        for (let j = 0; j < arr2.length; j++) {
          if (arr1.indexOf(arr2[j]) === -1) arr4.push(arr2[j]);
        }
        // newArr = arr3.concat(arr4);
        const names = new Array(arr3, arr4);
        return names;
      }
    },
    // 弹窗取消按钮
    callOff() {
      this.popup = false;
    },
    // 外面搜索按钮
    searchData(form) {
      // this.params.loginName = form.loginName;
      this.params.orgName = form.orgName;
      this.params.telephone = form.telephone;
      this.params.pageNum = 1;
      this.params.pageSize = 10;
      this.getData();
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.params.pageSize = data;
      this.getData();
    },
    // 点击那一页
    handleCurrentChange(data) {
      if (!this.deptName) {
        this.deptName = "";
      }
      this.params.pageNum = data;
      this.getData();
    }
  }
};
</script>

<style lang="scss" scoped>
.form-input {
  display: flex;
}
.add-department {
  margin: 10px 20px;
}
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
}
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #ffffff;
}
.org-type {
  padding-left: 60px;
}
</style>
