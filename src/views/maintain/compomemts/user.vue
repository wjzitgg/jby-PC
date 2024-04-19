<template>
  <el-dialog title="组织机构" width="80%" top="3vw" :visible="materDialog" @close="closeMaterDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
    <div class="app-container manage">
      <div class="people">
        <div @click="dianjiwa" class="dianjiwa">{{ company }}</div>
        <!-- 引入员工树形组建 -->
        <people :tree="dataStaff" :defaultProps="defaultProps" @peopleInfo="peopleInfo"></people>
      </div>
      <!-- 员工表格 -->
      <div class="sheet">
        <!-- 头部搜索 -->
        <div class="search-bgc search-mr">
          <el-form :model="form" class="form-data">
            <el-form-item label="员工姓名" label-width="80px">
              <el-input v-model="userName" size="mini" class="wh-100" maxlength="25"></el-input>
            </el-form-item>
            <el-form-item label="性别" label-width="60px">
              <el-select v-model="sex" placeholder="请选择" size="mini" class="wh-80">
                <el-option label="全部" value=""></el-option>
                <el-option label="男" value="1"></el-option>
                <el-option label="女" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="手机号码" label-width="80px">
              <el-input v-model="telephone" size="mini" maxlength="11" class="wh-120" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
            </el-form-item>
            <!-- <el-form-item label="所属部门" label-width="80px">
            <el-select
              v-model="form.fkDeptId"
              placeholder="请选择"
              size="mini"
              class="wh-100"
            >
              <el-option
                v-for="item in options"
                :key="item.pkId"
                :label="item.deptName"
                :value="item.pkId"
              >
              </el-option>
            </el-select>
          </el-form-item> -->
            <!-- <el-form-item label="所属角色" label-width="80px">
            <el-select
              v-model="form.addRoleIdList"
              placeholder="请选择"
              size="mini"
              class="wh-120"
            >
              <el-option
                v-for="item in roleList"
                :key="item.pkId"
                :label="item.roleName"
                :value="item.pkId"
              >
              </el-option>
            </el-select>
          </el-form-item> -->
            <el-form-item label="账号状态" label-width="80px">
              <el-select v-model="form.enableStatus" placeholder="请选择" size="mini" class="wh-80">
                <el-option label="全部" value=""></el-option>
                <el-option label="正常" value="1"></el-option>
                <el-option label="禁用" value="0"></el-option>
              </el-select>
            </el-form-item>
            <el-button size="mini" class="seek" @click="searchData" type="primary">搜索</el-button>
            <!-- <el-button type="primary" size="mini" class="add-staff" @click="addStaff" v-has="'org:user:add'">新增员工</el-button> -->
          </el-form>
        </div>
        <el-table :data="tableData" ref="tables" border v-loading="loading" height="80%" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="员工姓名" align="center"> </el-table-column>
          <el-table-column label="性别" width="60" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.sex == 1">男</span>
              <span v-if="row.sex == 2">女</span>
            </template>
          </el-table-column>
          <el-table-column prop="telephone" label="手机号码" align="center"> </el-table-column>
          <el-table-column prop="deptName" label="所属部门" align="center"> </el-table-column>
          <el-table-column prop="roleName" label="所属角色" align="center"> </el-table-column>
          <el-table-column prop="areaName" label="所管工区" align="center" v-if="orgType == 5"> </el-table-column>
          <el-table-column label="操作" align="center" width="300">
            <template slot-scope="{ row }">
              <el-button size="mini" type="primary" @click="lookOver(row)" v-has="'org:user:query'">查看</el-button>
              <el-button size="mini" @click="editStaff(row)" v-has="'org:user:edit'">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(row)" v-if="row.enableStatus" v-has="'org:user:editStatus'">禁用</el-button>
              <el-button size="mini" type="success" @click="handleDelete(row)" v-has="'org:user:editStatus'" v-else>启用</el-button>
              <!-- <el-button size="mini" @click="initPassword(row.pkId)" v-has="'org:user:initialization'">初始化密码</el-button> -->
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>

        <!-- 分页 -->
        <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
      </div>
      <!-- 弹窗 -->
      <el-dialog :close-on-press-escape="false" :modal="false" :title="title" width="45%" top="5vh" :visible.sync="popup" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
        <el-form :model="form" class="sech-form" ref="formInline">
          <el-row style="width:100%">
            <el-col :span="5">
              <el-form-item label="姓名" label-width="40px">
                <el-input v-model="form.userName" size="mini" :disabled="typeStatus" class="wh-100"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="性别" label-width="40px">
                <el-select v-model="form.sex" placeholder="请选择" :disabled="typeStatus" size="mini" class="wh-100">
                  <el-option label="男" :value="1"></el-option>
                  <el-option label="女" :value="2"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="手机号码" label-width="70px">
                <el-input v-model="form.telephone" size="mini" :disabled="typeStatus || !!form.realNameVerify" type="number" @input="telephoneInput" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" v-if="codeStatus" style="text-align: right;">
              <el-form-item>
                <div class="login-code" style="padding-left:10px">
                  <el-button size="mini" @click="getCode" v-if="timerStatus" type="primary">获取验证码</el-button>
                  <el-button size="mini" type="primary" v-else>{{ timer }}秒后重试</el-button>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="验证码 " label-width="60px" v-if="codeStatus">
                <el-input v-model="form.code" size="mini" class="wh-100"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="所属部门" label-width="70px">
                <el-select v-model="form.fkDeptId" placeholder="请选择" :disabled="typeStatus" size="mini">
                  <el-option v-for="item in options" :key="item.pkId" :label="item.deptName" :value="item.pkId"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="所属角色" label-width="70px">
                <el-select v-model="addRoleIdList" multiple @change="change2($event)" @remove-tag="removeTag" :disabled="typeStatus" collapse-tags placeholder="请选择" size="mini">
                  <el-option v-for="item in roleList" :key="item.pkId" :label="item.roleName" :value="item.pkId"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="备注" label-width="50px">
                <el-input v-model="form.remark" size="mini" :disabled="typeStatus"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="管理项目" label-width="80px" v-if="orgType != 5 && orgType != 0">
                <el-select v-model="form.projectIdListSet" multiple :disabled="typeStatus" collapse-tags placeholder="请选择" size="mini">
                  <el-option v-for="item in itemList" :key="item.pkId" :label="item.projectName" :value="item.pkId"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- <el-form-item label="系统账号" label-width="80px">
          <el-input v-model="form.loginName" size="mini" :disabled="typeStatus || title == '编辑用户信息'" @blur="checkReferenced" class="wh-120"></el-input>
        </el-form-item> -->
        </el-form>
        <el-radio-group class="edit-title" v-model="tabType" size="mini">
          <el-radio-button label="1">PC权限</el-radio-button>
          <el-radio-button label="2">APP权限</el-radio-button>
        </el-radio-group>
        <!-- 权限表格 -->
        <permIssion @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData" :checkList="selectTree" ref="permIssion" v-show="tabType == 1"></permIssion>
        <permIssion @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData2" :checkList="selectTree2" ref="permIssion2" v-show="tabType == 2"></permIssion>
        <span slot="footer" class="dialog-footer" v-if="!typeStatus">
          <el-button @click="callOff">取 消</el-button>
          <el-button type="primary" @click="getchekcData">保 存</el-button>
        </span>
      </el-dialog>
      <el-dialog :visible.sync="verify" center top="30vh" title="请输入图形验证码，再获取手机验证码!" width="24%" @close="closePop">
        <img :src="imgCode" class="spacing" />
        <el-input v-model="identifyingCode" placeholder="请输入图形验证码"></el-input>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="getImgecode">切换验证码</el-button>
          <el-button type="success" @click="getNote">获取短信验证码</el-button>
        </div>
      </el-dialog>
    </div>
  </el-dialog>
</template>

<script>
// 引入员工管理组建
import people from "@/components/staff/people";
import pageInation from "@/components/tablePaging";
import permIssion from "@/components/permission/permission";

export default {
  props: {
    materDialog: {
      type: Boolean
    },
    userNum: {
      type: String
    }
  },
  name: "staff",
  data() {
    return {
      searchName: "", // 搜索名字
      searchMoble: "", // 手机号
      dataStaff: [],
      // 左边树形结构绑定数据字段
      defaultProps: {
        children: "children",
        label: "aliasName"
      },
      tableData: [], // 右侧表格数据
      loading: false,
      popup: false,
      typeStatus: false, // 输入框状态
      form: {
        addMenuListSet: [],
        addRoleIdList: [], // 角色idjihe
        fkDeptId: "", // 部门
        loginName: "", // 系统账号
        userName: "",
        sex: "",
        telephone: "",
        remark: "",
        projectIdListSet: [], // 项目集合-项目主键id, orgType= 2 建设单位（业主方） 3监理公司 4施工单位时,用到
        enableStatus: "",
        code: ""
      },
      // 部门
      options: [
        {
          deptName: "全部",
          pkId: ""
        }
      ],
      // 角色
      roleList: [
        {
          pkId: "",
          roleName: "全部"
        }
      ],
      title: "",
      treeData: [], //    权限组件
      treeData2: [], //    权限组件
      selectTree: [], //    选择的
      selectTree2: [], //    选择的
      pageNum: 1,
      pageSize: 10,
      total: 0,
      roleListdata: [], // 最开始拥有的角色id，用来处理新增的id  和删除的id  艹
      company: "", // 公司
      companyId: "",
      itemList: [],
      addRoleIdList: [],
      btnDisabled: false,
      tabType: "1",
      userName: "",
      sex: "",
      telephone: "",
      codeStatus: false,
      timerStatus: true,
      timer: 60,
      uuid: "",
      imgCode: "",
      verify: false,
      identifyingCode: ""
    };
  },
  components: {
    people,
    pageInation,
    permIssion
  },
  computed: {
    // 设置只有在项目部的时候才会显示这些
    // userNum() {
    //   return localStorage.getItem("orgId"); // 设置那个编辑里面的项目集合
    // },
    orgType() {
      let data = sessionStorage.getItem("user"); //
      data = JSON.parse(data);
      return data.orgType;
    }
  },
  mounted() {},
  watch: {
    materDialog(val) {
      if (val) {
        //   this.options = []
        // this.roleList =[]
        this.getAllDeptAndStaff();
        this.getData();

        // 获取部门
        this.getDepartment();
        this.getRoles();
        this.getItemList();
      }
    },
    popup(newVal, delVal) {
      if (newVal) {
        // this.options.splice(0, 1); // 去除最前面一项
        // this.roleList.splice(0, 1); // 去除最前面一项

        if (this.title == "新增员工信息") {
          this.form.fkDeptId = null;
        }
        this.btnDisabled = false;
      } else {
        // this.options.splice(0, 0, { deptName: "全部", pkId: "" }); // 去除最前面一项
        // this.roleList.splice(0, 0, { roleName: "全部", pkId: "" });
        this.addRoleIdList = [];
        this.roleListdata = [];
        // 清空对象
        Object.keys(this.form).forEach(key => {
          if (this.form[key] instanceof Array) {
            this.form[key] = [];
          } else {
            this.form[key] = "";
          }
        });
      }
    }
  },
  mounted() {},
  methods: {
    closeMaterDialog() {
      this.$emit("updateMaterDialog", false);
      // this.page = {
      //   pageSize: 10,
      //   pageNum: 1
      // };
      // this.inpData = {};
      // this.searchData = {};
      this.form = {
        addMenuListSet: [],
        addRoleIdList: [], // 角色idjihe
        fkDeptId: "", // 部门
        loginName: "", // 系统账号
        userName: "",
        sex: "",
        telephone: "",
        remark: "",
        projectIdListSet: [], // 项目集合-项目主键id, orgType= 2 建设单位（业主方） 3监理公司 4施工单位时,用到
        enableStatus: "",
        code: ""
      };
      this.pageNum = 1;
      this.pageSize = 10;
    },
    telephoneInput(val) {
      if (val.length == 11) {
        const verify = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!verify.test(val)) {
          this.$message({ message: "请输入正确的手机号码", type: "error" });
          return;
        }
        this.$api.byTelephone({ telephone: val, sourceType: 2 }).then(res => {
          if (res.data.length) {
            this.codeStatus = true;
          } else {
            this.codeStatus = false;
            (this.form.code = ""), (this.uuid = "");
          }
        });
      }
    },
    getCode() {
      // 校验手机号
      const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(this.form.telephone)) {
        this.$message({ message: "请输入正确的手机号码", type: "error" });
        return;
      }
      this.getImgecode();
      this.verify = true; // 控制弹窗
      this.identifyingCode = "";
    },

    // 获取图形验证码
    async getImgecode() {
      await this.$api
        .imgCode()
        .then(res => {
          if (res.code === 200) {
            this.imgCode = res.img;
            this.uuid = res.uuid;
          } else {
            this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(err => {});
    },
    // 获取短信验证码
    getNote() {
      if (!this.identifyingCode) {
        this.$message({ message: "请输入正确的图形验证码", type: "error" });
        return;
      }
      const data = {
        code: this.identifyingCode,
        phoneNumber: this.form.telephone,
        uuid: this.uuid,
        sendType: 1
      };
      this.$api
        .mobileMsg(data)
        .then(res => {
          // this.closePop(); //清空输入框code uuid
          if (res.code === 200) {
            this.verify = false;
            this.$message({ message: "短信验证码发送成功", type: "success" });
            this.uuid = res.data;
            const _this = this;
            _this.timerStatus = false;
            const authTimer = setInterval(() => {
              _this.timer--;
              if (_this.timer <= 0) {
                _this.timer = 60;
                clearInterval(authTimer);
                _this.timerStatus = true;
              }
            }, 1000);
            // console.log(this.ruleForm.uuid);
          } else {
            this.getImgecode();
            this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(err => {});
    },
    // 关闭获取短信的弹窗
    closePop() {
      this.form.code = "";
      // this.ruleForm.uuid = "";
      console.log("关闭了短信弹窗");
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
      console.log(data);
      if (data.deptName != null) {
        this.form.userId = "";
        this.form.deptId = data.pkId;
      } else {
        this.form.deptId = "";
        this.form.userId = data.pkId;
      }
      this.getData();
    },
    dianjiwa() {
      this.form.userId = "";
      this.form.deptId = "";
      this.getData();
    },
    // 获取数据的方法
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        orgId: this.userNum
      };
      const obj = { ...params, ...this.form };
      this.loading = true;
      //    userName: "",
      // sex: "",
      // telephone: ""
      obj.userName = this.userName;
      obj.sex = this.sex;
      obj.telephone = this.telephone;
      this.$api
        .getUserPageList(obj)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.loading = false;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
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
    getAllDeptAndStaff() {
      this.$api.getAllDeptAndStaff({ orgId: this.userNum }).then(res => {
        if (res.code === 200) {
          // 树形员工集合
          this.dataStaff = res.data.children;
          this.company = res.data.aliasName;
          this.companyId = res.data.pkId;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查看
    lookOver(item) {
      this.queryUserinfo(item.pkId);
      this.title = "员工信息";
      this.typeStatus = true;
      this.codeStatus = false;
    },
    // 新增
    addStaff() {
      this.tabType = 1;
      this.treeData = [];
      this.treeData2 = [];
      this.selectTree = [];
      this.selectTree2 = [];
      // 获取权限列表
      this.getPore();
      // 清空对象
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.title = "新增员工信息";
      this.typeStatus = false;
      this.codeStatus = false;
      this.popup = true;
    },
    // 编辑
    editStaff(item) {
      this.queryUserinfo(item.pkId);
      this.title = "编辑用户信息";
      this.typeStatus = false;
      this.codeStatus = false;
    },
    // 查询员工信息
    queryUserinfo(id) {
      this.tabType = 1;
      this.selectTree = [];
      this.$api
        .getUserInfoById({ userId: id })
        .then(res => {
          if (res.code === 200) {
            console.log(res);
            // const arr1 = res.data.sysMenuList;
            // const arr1Tree = this.iteration(arr1);
            res.data.sysMenuPcList.forEach(item => {
              item.disabled = true;
              item.children.forEach(i => {
                i.disabled = true;
                i.children.forEach(e => {
                  e.disabled = true;
                });
              });
            });
            res.data.sysMenuAppList.forEach(item => {
              item.disabled = true;
              item.children.forEach(i => {
                i.disabled = true;
                i.children.forEach(e => {
                  e.disabled = true;
                });
              });
            });
            this.treeData = res.data.sysMenuPcList;
            this.treeData2 = res.data.sysMenuAppList;
            console.log(this.treeData);
            this.selectTree = res.data.defaultMenuIdPcList; // 默认用的权限
            this.selectTree2 = res.data.defaultMenuIdAppList; // 默认用的权限
            this.form.fkDeptId = res.data.fkDeptId;
            this.form.pkId = res.data.pkId;
            // this.form.addRoleIdList = res.data.roleList;
            this.addRoleIdList = res.data.roleList;
            this.form.loginName = res.data.loginName;
            this.form.userName = res.data.userName;
            this.form.sex = res.data.sex;
            this.form.remark = res.data.remark;
            this.form.telephone = res.data.telephone;
            this.form.projectIdListSet = res.data.projectIdListSet;
            this.form.realNameVerify = res.data.realNameVerify;
            this.roleListdata = res.data.roleList; // 原来拥有的角色，用来判断增加删除分类处理
            this.popup = true;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 禁用和启用
    handleDelete(item) {
      if (item.enableStatus) {
        this.$confirm("确定禁用此员工使用?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          staff(0);
        });
      } else {
        this.$confirm("确定启用此员工使用?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          staff(1);
        });
      }
      const that = this;
      function staff(num) {
        that.$api
          .editUserAccountType({ userId: item.pkId, enableStatus: num })
          .then(res => {
            if (res.code) {
              that.$message.success(res.msg);
              that.getData();
            } else {
              that.$message.error(res.msg);
            }
          })
          .catch(err => {
            that.$message.error(err.msg);
          });
      }
    },
    initPassword(pkId) {
      this.$confirm("确定将该员工登录密码初始化为888888？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api
          .initializingPassword({ userId: pkId })
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    // 弹窗的保存按钮
    getchekcData() {
      this.btnDisabled = true;
      // 校验手机号
      const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(this.form.telephone)) {
        this.$message({ message: "请输入正确的手机号码", type: "error" });
        this.btnDisabled = false;
        return;
      }
      // if (!this.form.loginName) {
      //   this.$message({ message: "请输入系统账号", type: "error" });
      //   this.btnDisabled = false;
      //   return;
      // }
      const data1 = this.$refs.permIssion.getchekcData();
      let data2 = [];
      if (this.$refs.permIssion2 != undefined) {
        data2 = this.$refs.permIssion2.getchekcData();
      }

      const data = data1.concat(data2); // 合并PC和APP的选中所有权限
      // const selectData = this.selectTree.concat(this.selectTree2); // 合并PC和APP的选中所有权限
      // this.deptName = "";
      const arrData = diff(this.selectTree, data);
      const roleData = diff(this.roleListdata, this.addRoleIdList);
      console.log(roleData, this.addRoleIdList);
      this.form.addMenuListSet = arrData[1]; // 新增arr
      const ruleForm = JSON.parse(sessionStorage.getItem("ruleForm"));
      // let data =
      // this.form.code = ruleForm.code;
      this.form.uuid = this.uuid;
      // console.log("==============")
      // return console.log(this.form)
      if (this.title == "新增员工信息") {
        this.form.addRoleIdList = roleData[1];
        this.loading = true;

        this.$api
          .addUser(this.form)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.popup = false;
              this.codeStatus = false;
              this.$nextTick(res => {
                this.getData();
                this.getAllDeptAndStaff();
              });
            } else {
              this.$message.warning(res.msg);
              this.btnDisabled = false;
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
            this.btnDisabled = false;
          });
      } else {
        this.form.deleteMenuListSet = arrData[0]; // 删除arr
        this.form.addRoleIdList = roleData[1]; // 增加的角色ID
        this.form.deleteRoleIdList = roleData[0]; // 删除的橘色ID
        this.loading = true;
        // 编辑
        this.$api
          .editUserInfo(this.form)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              if (this.form.pkId === this.$store.state.user.pkId) {
                this.getUserInfo();
              }
              this.codeStatus = false;
              this.popup = false;
              this.$nextTick(res => {
                this.getData();
                this.getAllDeptAndStaff();
              });
            } else {
              this.$message.warning(res.msg);
              this.btnDisabled = false;
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
            this.btnDisabled = false;
          });
      }

      function diff(arr1, arr2) {
        const arr3 = [];
        for (let i = 0; i < arr1.length; i++) {
          if (arr2.indexOf(arr1[i]) === -1) arr3.push(arr1[i]);
        }
        const arr4 = [];
        for (let j = 0; j < arr2.length; j++) {
          if (arr1.indexOf(arr2[j]) === -1) arr4.push(arr2[j]);
        }
        const names = new Array(arr3, arr4);
        return names;
      }
    },
    // 弹窗取消按钮
    callOff() {
      this.popup = false;
    },
    // 获取部门
    getDepartment() {
      this.options = [];
      this.$api.searchDeptListByOrgId({ orgId: this.userNum }).then(res => {
        if (res.code == 200) {
          this.options = [...this.options, ...res.data];

          this.options = this.options.filter((currentValue, currentIndex, sourceArr) => {
            return sourceArr.findIndex(x => x.pkId === currentValue.pkId) === currentIndex;
          });
        }
      });
    },
    // 获取角色
    getRoles() {
      this.roleList = [];
      this.$api.searchRoleListByOrgId({ orgId: this.userNum }).then(res => {
        if (res.code == 200) {
          console.log("2222222222222222222");
          console.log(res);
          console.log("2222222222222222222");
          this.roleList = res.data;
          // this.roleList =  this.roleList.filter((currentValue, currentIndex, sourceArr) => {
          //   return sourceArr.findIndex(x => x.pkId === currentValue.pkId) === currentIndex;
          // });
        }
      });
    },
    // 根据用户获取菜单权限列表
    async getPore() {
      await this.$api
        .getMenuPermissionListByUser()
        .then(res => {
          if (res.code === 200) {
            res.data.sysMenuListPc.forEach(item => {
              item.disabled = true;
              item.children.forEach(i => {
                i.disabled = true;
                i.children.forEach(e => {
                  e.disabled = true;
                });
              });
            });
            res.data.sysMenuListApp.forEach(item => {
              item.disabled = true;
              item.children.forEach(i => {
                i.disabled = true;
                i.children.forEach(e => {
                  e.disabled = true;
                });
              });
            });
            this.treeData = res.data.sysMenuListPc;
            this.treeData2 = res.data.sysMenuListApp;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {});
    },
    change2(e) {
      if (e.length == 0) {
        this.selectTree = this.selectTree.splice(0, 0);
        this.selectTree2 = this.selectTree2.splice(0, 0);

        if (this.$refs.permIssion != undefined) {
          this.$refs.permIssion.$refs.tree.setCheckedKeys(this.selectTree);
        }
        if (this.$refs.permIssion2 != undefined) {
          this.$refs.permIssion2.$refs.tree.setCheckedKeys(this.selectTree2);
        }
        return;
      }
      const arr = e;
      const roleArr = this.roleList; // 所有角色
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < roleArr.length; j++) {
          if (arr[i] == roleArr[j].pkId) {
            const roleSelect = [...roleSelect, ...roleArr[j].defaultMenuIdPcList];
            if (roleArr[j].defaultMenuIdAppList !== null) {
              const roleSelect2 = [...roleSelect2, ...roleArr[j].defaultMenuIdAppList];
              if (this.$refs.permIssion2 != undefined) {
                this.$refs.permIssion2.$refs.tree.setCheckedKeys(roleSelect2);
              }

              this.selectTree2 = roleSelect2;
            }
            if (this.$refs.permIssion != undefined) {
              this.$refs.permIssion.$refs.tree.setCheckedKeys(roleSelect);
            }
            this.selectTree = roleSelect;
          }
        }
      }
    },
    removeTag(e) {
      // console.log("移除时触发",e);
    },
    // 外面搜索按钮
    searchData() {
      this.pageNum = 1;
      this.form.deptId = this.form.fkDeptId;
      this.form.roleId = this.addRoleIdList;
      this.getData();
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
    },
    // 点击那一页
    handleCurrentChange(data) {
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.pageNum = data;
      this.getData();
    },
    iteration(data) {
      for (let j = 0; j < data.length; j++) {
        data[j].disabled = true;
        if (data[j].children != undefined && data[j].children.length > 0) {
          this.iteration(data[j].children);
        }
      }
    },
    // 校验账号是否唯一
    checkReferenced() {
      this.$api.checkReferenced({ loginName: this.form.loginName }).then(res => {
        if (res.data == true) {
        } else {
          this.form.loginName = "";
          this.$message({
            type: "error",
            message: "此系统账号已存在"
          });
        }
      });
    },
    // 获取个人信息(当修改的账号为当前登录用户时使用)
    getUserInfo() {
      this.$api.getPersonInfo().then(res => {
        if (res.code === 200) {
          this.$store.commit("setUserinfo", res.data);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取管理项目
    getItemList() {
      this.$api.getItemList().then(res => {
        if (res.code === 200) {
          this.itemList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.wraper {
  border: 1px solid #333333;
  width: 100%;
  height: 100%;
}
.form-data {
  display: flex;
  align-items: center;
}
.manage {
  height: 100%;
  display: flex;
}
.people {
  width: 15%;
  height: 696px;
  padding: 25px 0 25px 20px;
  // padding: 20px 60px 0 20px;
  // padding-left: 20px;
  border: 1px solid #ebeef5;
  font-size: 13px;
}
.sheet {
  flex: 1;
  // height: 100%;
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
  background-color: #f3f3f3;
  margin-bottom: 10px;
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
}
/deep/.el-form-item {
  margin-bottom: 0;
}
.seek {
  margin-left: 20px;
  height: 28px;
}
.add-staff {
  position: absolute;
  right: 40px;
}
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #4080ff;
}
.dianjiwa {
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.dianjiwa:hover {
  cursor: pointer;
}
/deep/.el-table {
  height: 600px;
}
.wh-180 {
  width: 180px;
}
/deep/.el-select {
  .el-tag {
    max-width: 100px;
    overflow: hidden;
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
}
.edit-title {
  margin-left: 60px;
}
.spacing {
  display: block;
  margin: 0 auto 15px;
}
</style>
