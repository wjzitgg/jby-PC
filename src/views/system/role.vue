<template>
  <div class="app-container manage">
    <!-- <el-radio-group v-model="orgType" size="mini" @change="orgTypeChange">
      <el-radio-button label="1">PC权限</el-radio-button>
      <el-radio-button label="2">APP权限</el-radio-button>
    </el-radio-group> -->
    <!-- 员工表格 -->
    <div class="sheet tab-container">
      <!-- 头部搜索 -->
      <div class="search-bar-box">
        角色编码：
        <el-input v-model="searchCoding" placeholder="请输入编码" size="mini" class="wh-200 mr-20" maxlength="50"></el-input>
        角色名称：
        <el-input v-model="searchName" placeholder="请输入名称" size="mini" class="wh-200 mr-20" maxlength="25"></el-input>
        <el-button type="primary" icon="el-icon-search" class="el-button-primary" size="mini" @click="searchData">查 询</el-button>
      </div>
      <div class="table-data" style="height:82%">
        <el-table ref="tables" :data="tableData" stripe v-loading="loading" :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column prop="serial" label="序号" align="center" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="roleCode" label="系统角色编码" align="center"> </el-table-column>
          <el-table-column prop="roleName" label="系统角色名称" align="center"> </el-table-column>
          <el-table-column prop="remark" label="角色描述" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" width="350" align="center">
            <template slot-scope="{ row }">
              <el-button size="mini" type="primary" plain v-has="'system:role:query'" @click="lookOver(row)">查看</el-button>
              <el-button size="mini" type="warning" plain @click="editStaff(row, 1)" v-has="'system:role:permissionSet'">权限设置</el-button>
              <el-button v-if="row.pkId != 1" size="mini" type="success" plain v-has="'system:role:setDefault'" @click="configuration(row)">配置默认角色</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    </div>
    <!-- 权限设置弹窗 -->
    <el-dialog :title="title" :visible.sync="popup" @close="callOff" width="770px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="form" class="sech-form permIssion-box" ref="formObj">
        <el-form-item label="角色编码" label-width="70px">
          <el-input v-model="form.roleCode" maxlength="50" size="mini" :disabled="typeStatus || title == '设置角色权限' || title == '编辑默认角色信息'" class="wh-130"></el-input>
        </el-form-item>
        <el-form-item label="系统角色" label-width="70px" v-if="!deployPop">
          <el-select v-model="form.roleName" placeholder="请选择" :disabled="typeStatus || title == '设置角色权限'" size="mini" class="wh-150">
            <el-option v-for="item in roleList" :key="item.value" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色名称" label-width="70px" v-if="deployPop">
          <el-input v-model="form.roleName" maxlength="25" size="mini" :disabled="typeStatus" class="wh-100"></el-input>
        </el-form-item>
        <!-- <el-form-item label="工区角色" label-width="70px" v-if="deployPop">
          <el-select v-model="form.areaRole" size="mini" :disabled="typeStatus" class="wh-70">
            <el-option :value="0" label="不是"></el-option>
            <el-option :value="1" label="是"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="排序值" label-width="60px" v-if="deployPop">
          <el-input v-model.trim="form.sortval" size="mini" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" :disabled="typeStatus" class="wh-50"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="70px">
          <el-input v-model="form.remark" size="mini" maxlength="100" :disabled="typeStatus"></el-input>
        </el-form-item>
      </el-form>
      <!-- <el-radio-group v-model="orgType" class="edit-title permIssion-box" size="mini" @change="orgTypeChange">
        <el-radio-button label="1">PC权限</el-radio-button>
        <el-radio-button label="2">APP权限</el-radio-button>
      </el-radio-group> -->
      <el-tabs v-model="orgType" @tab-click="orgTypeChange">
        <el-tab-pane label="PC权限" name="1"></el-tab-pane>
        <el-tab-pane label="APP权限" name="2"></el-tab-pane>
      </el-tabs>
      <!-- 权限表格 -->
      <div class="permIssion-box" style="margin-top: 5px;position: relative;">
        <permIssion ref="permIssion" v-loading="loading" @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData" :checkList="selectTree" :typeStatus="!typeStatus" class="permIssion" v-show="orgType == 1"> </permIssion>
        <permIssion ref="permIssion2" v-loading="loading" @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData2" :checkList="selectTree2" :typeStatus="!typeStatus" class="permIssion" v-show="orgType == 2"> </permIssion>
        <!-- <div class="tree-border"></div> -->
        <!-- <div class="tree-border-left"></div>
        <div class="tree-border-right"></div> -->
      </div>
      <div style="height: 10px;" v-if="typeStatus"></div>
      <span slot="footer" class="dialog-footer" style="text-align: center;" v-if="!typeStatus">
        <el-button size="mini" @click="callOff">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="getchekcData">保 存</el-button>
      </span>
    </el-dialog>

    <!-- 配置默认角色弹窗 -->
    <el-dialog title="配置默认角色" width="50%" :visible.sync="deployPop" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="search-bgc">
        角色编码
        <el-input v-model="deployPopForm.searchCoding" placeholder="" size="mini" class="wh-120 mr-20"></el-input>
        角色名称
        <el-input v-model="deployPopForm.searchName" placeholder="" size="mini" class="wh-120 mr-20"></el-input>
        <el-button size="mini" type="primary" icon="el-icon-search" class="el-button-primary" @click="enquiry">查询</el-button>
        <el-button type="primary" size="mini" class="fr el-button-primary" @click="addStaff">新增</el-button>
      </div>

      <!-- 表 -->
      <div class="biao">
        <el-table :data="tableData2" stripe height="100%" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column prop="serial" label="序号" width="60" align="center" :tooltip-effect="'light'">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum2 - 0 - 1) * (pageSize2 - 0) + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="roleCode" label="角色编码" align="center"> </el-table-column>
          <el-table-column prop="roleName" label="角色名称" align="center"> </el-table-column>
          <!-- <el-table-column label="是否工区角色" align="center">
            <template slot-scope="{ row }">
              {{ row.areaRole ? "是" : "不是" }}
            </template>
          </el-table-column> -->
          <el-table-column prop="sortval" label="排序值" align="center"> </el-table-column>
          <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" align="center" width="260">
            <template slot-scope="{ row }">
              <el-button size="mini" type="primary" @click="lookOver(row)">查看</el-button>
              <el-button size="mini" @click="editStaff(row, 2)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(row.pkId)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>

      <!-- 分页 -->
      <pageInation :currentPage="pageNum2" :pageSize="pageSize2" :total="total2" @handleSizeChange="handleSizeChange2" @handleCurrentChange="handleCurrentChange2"></pageInation>
    </el-dialog>
  </div>
</template>

<script>
import pageInation from "../../components/tablePaging";
import permIssion from "../../components/permission/permission";
import pdfComponentsVue from "../work/components/pdfComponents.vue";
export default {
  name: "systemRole",
  data() {
    return {
      searchName: "", // 角色名称
      searchCoding: "", // 角色编码
      pkId: "",
      tableData: [],
      tableData2: [],
      popup: false,
      typeStatus: false, // 输入框状态
      form: {
        roleCode: "",
        roleName: "", // 系统角色
        sortval: "",
        remark: ""
        // areaRole: 0
      },
      // 部门
      options: [],
      // 角色
      roleList: [],
      title: "",
      deployPop: false, // 配置默认角色弹窗
      treeData: [], // PC系统权限默认数据
      selectTree: [], // PC默认后端返回已选中的
      treeData2: [], // APP系统权限默认数据
      selectTree2: [], // APP默认后端返回已选中的
      pageNum: 1,
      pageNum2: 1,
      pageSize: 10,
      pageSize2: 10,
      total: 0,
      total2: 0,
      // 新增需要的参数
      roleFlag: "1", // 0 系统级角色 1企业级角色
      roleType: "", // 系统角色类型
      editPage: 1, // 解决分页搜索bug问题
      loading: false,
      deployPopForm: {
        searchCoding: "",
        searchName: ""
      },
      // pc权限APP权限切换
      orgType: "1"
      // sysMenuPcList: [],
      // sysMenuAppList: []
    };
  },
  components: {
    pageInation,
    permIssion
  },
  mounted() {
    this.getData();
  },
  methods: {
    orgTypeChange(val) {
      // this.character(this.form.pkId);
    },
    // 获取数据
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roleCode: this.searchCoding,
        roleName: this.searchName
        // sourceType: this.orgType
      };
      this.loading = true;
      this.$api
        .getSystemRolePageList(params)
        .then(res => {
          if (res.code === 200) {
            this.loading = false;
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 员工信息
    peopleInfo(data) {
      console.log(data);
    },
    // 查看
    lookOver(item) {
      const data = JSON.stringify(item);
      const items = JSON.parse(data);
      this.typeStatus = true;
      this.orgType = "1"; // pc app切换tab恢复默认值
      this.character(item.pkId);
      this.title = "角色权限信息";
      this.popup = true;
      this.form = items;
      this.$nextTick(() => {
        this.$refs.permIssion.scrollTo();
      });
    },

    // 编辑
    editStaff(item, num) {
      this.editPage = num;
      this.typeStatus = false;
      this.orgType = "1"; // pc app切换tab恢复默认值
      this.character(item.pkId);
      this.form = Object.assign(this.form, item);
      if (num == 1) {
        this.title = "设置角色权限";
      } else {
        this.title = "编辑默认角色信息";
      }
      this.$nextTick(() => {
        this.$refs.permIssion.scrollTo();
      });
      this.popup = true;
    },
    // 根据ID查看角色
    character(id) {
      const that = this;
      that.selectTree = [];
      this.treeData2 = [];
      this.treeData = [];
      this.selectTree2 = [];
      this.loading = true;
      this.$api.getSystemRoleInfoById({ roleId: id }).then(res => {
        if (res.code === 200) {
          // 如果是查看让所有树形禁用状态展示
          if (this.typeStatus == true) {
            // pc权限
            res.data.sysMenuPcList.forEach(item => {
              item.disabled = true;
              if (item.children.length != 0 || item.children.length !== null) {
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
            // app权限
            res.data.sysMenuAppList.forEach(item => {
              item.disabled = true;
              if (item.children.length != 0 || item.children.length !== null) {
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
          this.selectTree = res.data.defaultMenuIdPcList; // pc默认拥有的权限
          this.treeData = res.data.sysMenuPcList;
          this.selectTree2 = res.data.defaultMenuIdAppList; // APP拥有的权限

          this.treeData2 = res.data.sysMenuAppList;

          this.loading = false;
        } else {
          this.loading = false;
        }
      });
    },
    // 配置默认角色按钮点击
    configuration(item) {
      this.deployPopForm = {
        searchCoding: "",
        searchName: ""
      };
      this.pkId = item.pkId;
      this.roleType = item.roleType; // 新增需要的参数
      this.defaultRole();
      this.deployPop = true;
    },
    // 新增
    addStaff() {
      this.orgType = "1";
      this.treeData = [];
      this.treeData2 = [];
      this.selectTree = [];
      this.selectTree2 = [];
      this.getMenuPermissionByRoleType(this.roleType);
      // 清空对象
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.title = "新增默认角色权限";
      // 控制输入框debles
      this.typeStatus = false;
      this.popup = true;
    },
    // 默认角色分页列表
    defaultRole() {
      const params = {};
      params.pkId = this.pkId;
      params.pageNum = this.pageNum2;
      params.pageSize = this.pageSize2;
      params.roleCode = this.deployPopForm.searchCoding;
      params.roleName = this.deployPopForm.searchName;
      this.$api
        .getDefaultSystemRolePageList(params)
        .then(res => {
          if (res.code === 200) {
            this.tableData2 = res.data.records;
            this.total2 = res.data.total - 0;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {});
    },
    // 新增的时候根据企业角色类型获取菜单权限列表
    getMenuPermissionByRoleType(roleType) {
      const params = {
        roleType
      };
      this.loading = true;
      this.$api.getMenuPermissionByRoleType(params).then(res => {
        if (res.code === 200) {
          this.treeData = res.data.sysMenuListPc;
          this.treeData2 = res.data.sysMenuListApp;
          this.loading = false;
        } else {
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // 删除
    handleDelete(id) {
      this.$confirm("确定删除该角色信息？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api
            .delSystemRoleById({ roleId: id })
            .then(res => {
              if (res.code === 200) {
                this.$message.success("删除该角色成功");
                this.defaultRole();
              } else {
                this.$message.warning(res.msg);
              }
            })
            .catch(err => {});
        })
        .catch(() => {});
    },
    // 编辑系统角色
    editSystemRole() {
      // let params = {
      //   pkId:
      // };
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
      this.form.sourceType = this.orgType;
      if (this.deployPop && this.editPage !== 2) {
        // 新增系统角色bianji
        this.form.roleType = this.roleType;
        this.form.roleFlag = this.roleFlag;
        this.loading = true;
        this.$api
          .addSystemRole(this.form)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.popup = false;
              this.defaultRole();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        this.form.deleteMenuListSet = arrData[0]; // 删除arr
        // 保存编辑角色
        this.loading = true;
        this.$api
          .editSystemRole(this.form)
          .then(res => {
            if (res.code === 200) {
              this.loading = false;
              this.$message.success(res.msg);
              if (this.editPage == 1) {
                this.getData();
              } else {
                this.defaultRole();
              }
              this.popup = false;
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      }

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
      // this.searchName = "";
      // this.searchCoding = "";
      this.editPage = 1;
      this.popup = false;
      // 解决接口回显问题
      // setTimeout(() => {
      //   this.getData();
      // }, 200);
    },
    // 外面搜索按钮
    searchData() {
      this.pageNum = 1;
      this.getData();
    },
    // 查询按钮
    enquiry() {
      this.pageNum2 = 1;
      // deployPopForm
      this.defaultRole();
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 点击那一页
    handleCurrentChange(data) {
      if (!this.searchName || !this.searchCoding) {
        this.searchName = "";
        this.searchCoding = "";
      }
      this.pageNum = data;
      this.getData();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 2选择每页多少条
    handleSizeChange2(data) {
      this.pageSize2 = data;
      this.defaultRole();
    },
    // 2点击那一页
    handleCurrentChange2(data) {
      if (!this.searchName || !this.searchCoding) {
        this.searchName = "";
        this.searchCoding = "";
      }
      this.pageNum2 = data;
      this.defaultRole();
    }
  }
};
</script>

<style lang="scss" scoped>
.wraper {
  border: 1px solid $borderColor;
  width: 100%;
  height: 100%;
}

.form-input {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.form-flex {
  display: flex;
}

.sech-form {
  background-color: $searcHeder;
  margin-bottom: 5px;
  padding: 0 5px;
  display: flex;
  margin-top: 10px;
  // justify-content: space-between;
}

/deep/.el-form-item {
  margin-bottom: 0;
}

.permIssion {
  // margin-left: 60px;
}

/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
}

/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #ffffff;
}

.biao {
  height: 500px;
}

// .edit-title {
//   margin-left: 120px;
// }

.table-data {
  border-radius: 5px;
  padding: 8px;
  padding-top: 15px;
  background-color: #fff;
}

/deep/ .jurisdiction {
  padding: 0 !important;
}

.permIssion-box {
  padding-left: 22px;
}

/deep/ .el-tabs__header {
  margin: 0 20px !important;
}
.tree-border {
  position: absolute;
  bottom: 0px;
  width: 725px;
  height: 1px;
  background-color: #ccc;
}
// .tree-border-right{
//   position: absolute;
//   top: 0;
//   left: 22px;
//   width: 1px;
//   height: 520px;
//   background-color: #ccc;
// }
// .tree-border-left{
//   position: absolute;
//   top: 0;
//   right: 22px;
//   width: 1px;
//   height: 520px;
//   background-color: #ccc;

// }
/deep/ .el-dialog__footer {
  text-align: center !important;
}
.wh-50 {
  width: 50px;
}
.search-bgc {
  // padding-left: 10px;
  // height: 50px;
  // line-height: 50px;
  padding: 12px 8px;
  size: 14px;
}
.wh-130 {
  width: 130px;
}
</style>
