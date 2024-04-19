<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bar-box" style="position: relative" v-if="[0].includes(user.orgType)">
      <!-- 运营商显示 -->
      <span>使用状态</span>
      <el-select v-model="useStatus" placeholder="请选择使用状态" size="mini" class="wh-200">
        <el-option label="全部" value=""></el-option>
        <el-option label="已分配角色" value="1"></el-option>
        <el-option label="未分配角色" value="0"></el-option>
      </el-select>
      <span>角色名称</span>
      <el-input prefix-icon="el-icon-search" v-model="deptName" placeholder="请输入角色名称" maxlength="25" size="mini" class="wh-200"></el-input>

      <el-button type="primary" size="mini" icon="el-icon-search" class="ml-20 el-button-primary" @click="searchData">查询</el-button>
      <el-button style="position: absolute; right: 20px; top: 27px" class="el-button-primary" type="primary" size="mini" @click="addDepartment" v-has="'org:role:add'">新增角色</el-button>
    </div>

    <div class="search-bar-box" style="position: relative" v-else>
      <span>类型</span>
      <el-select v-model="roleFlag" placeholder="" size="mini" class="wh-200">
        <el-option label="全部" value=""></el-option>
        <el-option label="自建角色" value="1"></el-option>
        <el-option label="默认角色" value="0"></el-option>
      </el-select>
      <span>使用状态</span>
      <el-select v-model="useStatus" placeholder="请选择使用状态" size="mini" class="wh-200">
        <el-option label="全部" value=""></el-option>
        <el-option label="已分配角色" value="1"></el-option>
        <el-option label="未分配角色" value="0"></el-option>
      </el-select>
      <span>角色名称</span>
      <el-input prefix-icon="el-icon-search" v-model="deptName" placeholder="请输入角色名称" maxlength="25" size="mini" class="wh-200"></el-input>

      <el-button type="primary" size="mini" icon="el-icon-search" class="ml-20 el-button-primary" @click="searchData">查询</el-button>
      <el-button style="position: absolute; right: 20px; top: 27px" class="el-button-primary" type="primary" size="mini" @click="addDepartment" v-has="'org:role:add'">新增角色</el-button>
    </div>

    <div class="tab-container">
      <div class="table-data" style="height: 82%">
        <el-table :tooltip-effect="'light'" :data="tableData" ref="tables" stripe height="98%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column label="序号" width="60" align="center" type="index">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="roleName" label="角色名称" width="260" align="center"> </el-table-column>

          <el-table-column prop="roleFlag" label="角色类型" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.roleFlag == 0">默认角色</span>
              <span v-if="row.roleFlag == 1">自建角色</span>
            </template>
          </el-table-column>
          <el-table-column prop="staffNum" label="员工人数" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="sortval" label="排序值" width="180" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="remark" label="角色描述" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" width="300" align="center">
            <template slot-scope="{ row }">
              <el-button size="mini" plain type="primary" @click="lookOver(row)" v-has="'org:role:query'">查看</el-button>
              <el-button size="mini" plain type="warning" @click="editItem(row)" v-has="'org:role:edit'">编辑</el-button>
              <el-button size="mini" v-if="row.isDelete == '1'" plain type="danger" @click="handleDelete(row.pkId)" v-has="'org:role:delete'">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <tablePaging :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    </div>

    <!-- 弹窗 :destroy-on-close="true"-->
    <el-dialog :close-on-press-escape="false" :title="title" width="45%" :visible.sync="popup" @close="closePopup" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-form :model="form" class="sech-form permIssion-box">
        <!-- <el-form-item label="角色编码" :label-width="formLabelWidth">
          <el-input
            v-model="form.roleCode"
            size="mini"
            :disabled="typeStatus"
            class="wh-80"
          ></el-input>
        </el-form-item> -->
        <el-form-item label="角色名称" :label-width="formLabelWidth">
          <el-input v-model="form.roleName" size="mini" :disabled="typeStatus" class="wh-100" maxlength="25"></el-input>
        </el-form-item>
        <el-form-item label="排序值" :label-width="formLabelWidth">
          <el-input v-model.trim="form.sortval" size="mini" type="number" oninput="if(!/^[1-9]+$/.test(value)) value=value.replace(/\D/g,'');if(value>9999)value=9999;if(value<0)value=null" :disabled="typeStatus" class="wh-80" @keydown.native="keyDown"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" :label-width="formLabelWidth">
          <el-input v-model="form.remark" size="mini" :disabled="typeStatus" class="wh-200" maxlength="100"></el-input>
        </el-form-item>
      </el-form>

      <!-- <el-radio-group class="edit-title" v-model="orgType" size="mini">
        <el-radio-button label="1">PC权限</el-radio-button>
        <el-radio-button label="2">APP权限</el-radio-button>
      </el-radio-group> -->

      <el-tabs v-model="orgType">
        <el-tab-pane label="PC权限" name="1"></el-tab-pane>
        <el-tab-pane label="APP权限" name="2"></el-tab-pane>
        <el-tab-pane label="数据权限" name="3" v-if="![0, 10, 11, 12].includes(user.orgType)"></el-tab-pane>
      </el-tabs>
      <div style="position: relative;width: 100%;text-align:right">
        <el-tooltip class="orgType-box" effect="dark" placement="left">
          <div slot="content">
            <div>权限分配说明：</div>
            <br />
            <div>一级菜单：功能模块</div>
            <br />
            <div>二级菜单：功能页面，勾选了该项，表示有权限进入该页面查看该页面信息。</div>
            <br />
            <div>按 钮： 页面按钮，勾选了该项。表示有权限看到该按钮，点击该按钮进行该项相关操作。</div>
          </div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <!-- 权限表格 -->
      <div class="permIssion-box" style="margin-top: 5px; position: relative">
        <permIssion ref="permIssion" v-loading="loading" @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData" :checkList="selectTree" :typeStatus="!typeStatus" v-show="orgType == 1"></permIssion>
        <permIssion ref="permIssion2" v-loading="loading" @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData2" :checkList="selectTree2" :typeStatus="!typeStatus" v-show="orgType == 2"></permIssion>
        <dataPermisson ref="dataPermisson" :manageAuthorize="manageAuthorize" :treeData="treeData3" :treeCheckList="selectTree3" :disabled="title == '查看角色权限'" v-if="popup" v-show="orgType == 3"></dataPermisson>
      </div>
      <div style="height: 10px" v-if="typeStatus"></div>
      <span slot="footer" class="dialog-footer" v-if="!typeStatus">
        <el-button size="mini" @click.native="callOff">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click.native="getchekcData">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tablePaging from "../../components/tablePaging.vue";
import permIssion from "../../components/permission/permission"; // 菜单权限组建
import Log from "../../package/Log";
import dataPermisson from "./compoments/dataPermisson.vue";
export default {
  name: "character",
  data() {
    return {
      tableData: [],
      popup: false, // 控制弹窗显示隐藏
      form: {
        roleCode: "",
        roleName: "",
        sortval: "",
        remark: ""
      },
      title: "新增角色权限",
      formLabelWidth: "80px",
      typeStatus: false, // 输入框状态
      elTableHeight: "",
      treeData: [], //    权限组件
      treeData2: [], //    权限组件
      treeData3: [], //    权限组件
      selectTree: [],
      selectTree2: [],
      selectTree3: [],

      pageNum: 1,
      pageSize: 10,
      total: 0,
      deptName: "",
      loading: false,
      // pc权限APP权限切换
      orgType: "1",
      useStatus: "",
      roleFlag: "",
      manageAuthorize: { type: "", userId: [] }
    };
  },
  components: {
    tablePaging,
    permIssion,
    dataPermisson
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  mounted() {
    // 高度调整
    // this.elTableHeight = $(".table-container").height();
    this.getData();
  },
  methods: {
    keyDown(e) {
      const key = e.key;
      if (key == "e" || key == "-" || key == "." || key == 0) {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    getAllCanViewMenu() {
      this.$api.getAllCanViewMenu().then(res => {
        if (res.code === 200) {
          this.treeData3 = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取数据的方法
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roleName: this.deptName,
        useStatus: this.useStatus,
        roleFlag: this.roleFlag
      };
      this.loading = true;
      this.$api.getRolePageList(params).then(res => {
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
    // 查看
    lookOver(item) {
      this.orgType = "1";
      this.title = "查看角色权限";
      this.character(item.pkId);
      this.getAllCanViewMenu();
      this.typeStatus = true;
      this.popup = true;
      this.loading = true;
      this.form = Object.assign(this.form, item);
    },
    // 新增 根据用户获取菜单权限列表
    addDepartment() {
      // this.orgType = "1";
      // this.selectTree = [];
      // this.selectTree2 = [];
      // this.selectTree3=[]
      // this.manageAuthorize={type:"",userId:[]}
      this.$api.getMenuPermissionListByUser().then(res => {
        if (res.code === 200) {
          this.treeData = res.data.sysMenuListPc;
          this.treeData2 = res.data.sysMenuListApp;
        }
      });
      this.getAllCanViewMenu();
      this.title = "新增角色权限";
      this.$nextTick(() => {
        this.popup = true;
      });
      this.typeStatus = false;

      // this.form = {};
    },
    closePopup() {
      this.orgType = "1";
      this.selectTree = [];
      this.selectTree2 = [];
      this.selectTree3 = [];
      this.manageAuthorize = { type: "", userId: [] };
      this.form = {
        roleCode: "",
        roleName: "",
        sortval: "",
        remark: ""
      };
    },
    // 编辑
    editItem(item) {
      this.orgType = "1";
      this.loading = true;
      this.character(item.pkId);
      this.getAllCanViewMenu();
      this.form = Object.assign(this.form, item);
      this.title = "编辑角色权限";
      this.typeStatus = false;
      this.popup = true;
    },
    character(id) {
      this.$api
        .getRoleInfoById({ roleId: id })
        .then(res => {
          if (res.code === 200) {
            if (this.typeStatus == true) {
              res.data.sysMenuPcList.forEach(item => {
                item.disabled = true;
                if (item.children.length != 0) {
                  item.children.forEach(i => {
                    i.disabled = true;
                    if (i.children.length != 0) {
                      i.children.forEach(j => {
                        j.disabled = true;
                      });
                    }
                  });
                }
              });
              res.data.sysMenuAppList.forEach(item => {
                item.disabled = true;
                if (item.children.length != 0) {
                  item.children.forEach(i => {
                    i.disabled = true;
                    if (i.children.length != 0) {
                      i.children.forEach(j => {
                        j.disabled = true;
                      });
                    }
                  });
                }
              });
            }
            this.manageAuthorize = res.data.manageAuthorize;
            this.selectTree = res.data.defaultMenuIdPcList; // pc默认拥有的权限
            this.treeData = res.data.sysMenuPcList;
            this.selectTree2 = res.data.defaultMenuIdAppList; // APP拥有的权限
            this.treeData2 = res.data.sysMenuAppList;
            this.selectTree3 = res.data.viewAuthorize;
            this.form.roleCode = res.data.roleCode;
            this.loading = false;
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {});
    },
    // 删除
    handleDelete(id) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api
          .delRoleById({ roleId: id })
          .then(res => {
            if (res.code === 200) {
              this.$message.success("删除成功");
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.$message.warning(err);
          });
      });
    },

    // 弹窗的保存权限
    getchekcData() {
      if (this.form.roleName == "" || this.form.roleName == undefined) {
        return this.$message.warning("请输入角色名称");
      }
      const data1 = this.$refs.permIssion.getchekcData();
      const data2 = this.$refs.permIssion2.getchekcData();
      const data3 = data1.concat(data2); // 合并PC和APP的选中所有权限
      const data = data3.filter(item => item != undefined);
      const selectData = this.selectTree.concat(this.selectTree2); // 合并PC和APP的选中所有权限
      this.deptName = "";
      const arrData = diff(selectData, data);
      console.log("diff执行通过");
      this.form.addMenuListSet = arrData[1]; // 新增arr
      this.loading = true;
      if (this.$refs.dataPermisson) {
        this.form = { ...this.form, ...this.$refs.dataPermisson.getchekcData() };
      }
      if (this.title == "新增角色权限") {
        // 新增角色
        this.$api
          .addRole(this.form)
          .then(res => {
            if (res.code === 200) {
              this.getData();
              this.$message.success(res.msg);
              this.popup = false;
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            console.log(err);
            this.loading = false;
          });
      } else {
        this.form.deleteMenuListSet = arrData[0]; // 删除arr
        // 保存编辑角色
        this.$api
          .editRole(this.form)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getData();
              this.popup = false;
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            console.log(err);
            this.loading = false;
          });
      }

      function diff(arr1, arr2) {
        console.log("执行了diff");
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
    searchData() {
      this.pageNum = 1;
      this.getData();
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
    },
    // 点击那一页
    handleCurrentChange(data) {
      if (!this.deptName) {
        this.deptName = "";
      }
      this.pageNum = data;
      this.getData();
    }
  }
};
</script>

<style lang="scss" scoped>
.form-input {
  display: flex;
}
.wh-100 {
  width: 130px;
}
.wh-80 {
  width: 130px;
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

.edit-title {
  margin-left: 60px;
}

.search-mr {
  font-size: 14px;
}

.permIssion-box {
  padding-left: 22px;
}

/deep/ .el-tabs__header {
  margin: 0 20px !important;
}

.sech-form {
  // position: relative;
  background-color: $searcHeder;
  margin-bottom: 5px;
  padding: 0 5px;
  display: flex;
  margin-top: 10px;

  // justify-content: space-between;
  /deep/ .el-form-item {
    margin-bottom: 0;
  }
}
.orgType-box {
  position: relative;
  // .item {
  position: absolute;
  top: -20px;
  right: 20px;
  z-index: 9999999999999999999999999;
  // text-align: right;

  // }
  // /deep/ .el-tabs__content{
  //   text-align: right !important;
  // }
  // // /deep/.el-tabs__content{
  //   text-align: center;
  // }
}
</style>
