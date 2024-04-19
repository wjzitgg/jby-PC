<template>
  <div class="app-container">
    <el-tabs v-model="optionType" @tab-click="typeChange">
      <el-tab-pane v-for="item in typeOptions" :key="item.value" :label="item.name" :name="item.value"></el-tab-pane>
    </el-tabs>
    <div slot="header" class="clearfix card-header search-mr search-bar-box">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <el-form-item label="项目">
            <el-select v-model="fkProjectId" size="mini" class="wh-150" @change="fkProjectIdChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="(item, idx) in options" :key="idx" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标段项目">
            <!-- <el-select v-model="fkProjectId" size="mini">
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select> -->
            <el-select v-model="fkProjectBidId" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="企业名称">
            <el-input size="mini" v-model="inpData.orgName" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="联系人">
            <el-input size="mini" v-model="inpData.linkMan" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input size="mini" v-model="inpData.linkPhone" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" class="btn-serach el-button-primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </el-form>
      </div>
    </div>
    <div class="content" style="height: calc(93% - 90px)">
      <el-table stripe :data="tableData" v-loading="loading" ref="tables" height="90%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" type="index" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="项目" prop="fkProjectName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="标段" prop="projectBidName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="设计院名称" prop="customName" align="center" v-if="optionType == 5"> </el-table-column>
        <el-table-column label="监理单位名称" prop="customName" align="center" v-if="optionType == 1"> </el-table-column>
        <el-table-column label="项目部名称" prop="customName" align="center" v-if="optionType == 2"> </el-table-column>
        <el-table-column label="建设单位名称" prop="customName" align="center" v-if="optionType == 0"> </el-table-column>
        <el-table-column label="联系人" prop="linkMan" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="联系电话" prop="linkPhone" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column label="绑定关联" width="100" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.relationStatus == 1 ? "是" : "否" }}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="项目名称" prop="fkProjectName" align="center" show-overflow-tooltip> </el-table-column> -->
        <!-- <el-table-column label="监理标段项目" prop="projectBidName" align="center" show-overflow-tooltip> </el-table-column> -->
        <el-table-column label="备注" prop="remark" width="300" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="{ row }">
            <el-button plain size="mini" type="primary" @click="handleOpen(2, row)">查看</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 分页组件 -->
      <Pagination v-if="user.orgType !== 5" :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    </div>
    <!-- 模态框 -->
    <el-dialog :close-on-press-escape="false" :title="(dialogType === 2 ? '查看' : formDate.pkId ? '编辑' : '新增') + (optionType == 0 ? '建设单位' : optionType == 1 ? '监理单位' : optionType == 2 ? '项目部' : '设计院')" :visible.sync="dialogVisible" @close="handleCancel" ref="model" width="25%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form :model="formDate" label-width="90px" class="dialog-form" :rules="rules" ref="formDate">
        <el-form-item label="企业名称" prop="customName">
          <el-input size="mini" v-model="formDate.customName" :disabled="dialogType === 2" :maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="linkMan">
          <el-input size="mini" v-model="formDate.linkMan" :maxlength="25" :disabled="dialogType === 2"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="linkPhone">
          <el-input size="mini" v-model="formDate.linkPhone" :disabled="dialogType === 2" :maxlength="11" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input size="mini" v-model="formDate.remark" type="textarea" maxlength="100" resize="none" :disabled="dialogType === 2" rows="8"></el-input>
        </el-form-item>
      </el-form>
      <div style="height: 10px" v-if="dialogType != 1"></div>
      <div slot="footer" class="dialog-footer" v-if="dialogType === 1">
        <el-button size="mini" @click="handleCancel">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="btnOk">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
export default {
  components: { Pagination },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  data() {
    return {
      options: [],
      fkProjectId: "",
      obj1: {
        customName: "",
        customType: 0,
        linkMan: "",
        linkPhone: "",
        remark: ""
      },
      obj2: {
        customName: "",
        customType: 5,
        linkMan: "",
        linkPhone: "",
        remark: ""
      },
      obj3: {
        customName: "",
        customType: 1,
        linkMan: "",
        linkPhone: "",
        remark: ""
      },
      dialogVisible: false,
      // linkDialog: false,
      // 弹出框数据
      formDate: {
        customName: "",
        customType: "",
        linkMan: "",
        linkPhone: "",
        remark: ""
      },
      rules: {
        customName: [{ required: true, message: "请填写企业名称", trigger: "blur" }],
        linkMan: [{ required: true, message: "请填写联系人名称", trigger: "blur" }],
        linkPhone: [
          { required: true, message: "请填写联系电话", trigger: "blur" },
          {
            pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
            message: "手机号格式错误",
            trigger: "blur"
          }
        ]
      },
      // 模态框打开状态，1为新增/编辑，2为查看
      dialogType: 1,
      // 绑定关联模态框获取到的数据
      state: "",
      bindData: {
        pkId: "",
        orgId: ""
      },
      loading: false,
      proId: "",
      linkProId: "",
      rowDate: {},
      relieveDialog: false,
      typeOptions: [
        { name: "设计院", value: "5" },
        { name: "监理单位", value: "1" },
        { name: "项目部", value: "2" },
        { name: "建设单位子公司", value: "0" }
      ],
      optionType: "5",
      page: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      total: 0,
      inpData: {},
      fkProjectBidId: "",
      proOptions: []
    };
  },
  mounted() {
    if (this.user.orgType == 9 || this.user.orgType == 3) {
      this.optionType = "2";
      this.typeOptions = [
        // { name: "设计院", value: "5" },
        // { name: "监理单位", value: "1" },
        { name: "项目部", value: "2" },
        { name: "建设单位子公司", value: "0" }
      ];
    }

    if (this.user.orgType == 2) {
      this.optionType = "5";
      this.typeOptions = [
        { name: "设计院", value: "5" },
        { name: "监理单位", value: "1" },
        { name: "项目部", value: "2" }
        // { name: "建设单位子公司", value: "0" },
      ];
    }
    if (this.user.orgType != 5) {
      this.getAllProject();
    } else {
      this.getCompanyList();
    }
    // this.$nextTick(()=>{

    // })
    // this.getAllProjectInfo();
  },
  methods: {
    // 打开模态框
    handleOpen(type, row) {
      this.dialogType = type;
      if (row) {
        this.formDate = { ...row };
        // if (this.user.orgType === 2) {
        //   // 因为建设单位需要显示的是另一个数据，input的v-model绑定原因，所以这里暂时赋值显示
        //   // this.formDate.customName = row.orgName;
        // }
        // api.getCustomInfoById({ pkId }).then((res) => {
        //   if (res.code === 200) {
        //     this.formDate = res.data;
        //   } else {
        //     this.$message.warning(res.msg);
        //   }
        // });
      }
      this.dialogVisible = true;
    },
    fkProjectIdChange(val) {
      this.fkProjectBidId = "";
      this.allListBidByProId(val);
    },
    // 获取标段项目
    allListBidByProId(projectId) {
      this.$api.allListBidByProId({ isWhole: 0, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.fkBidProjectId, label: item.fkBidProjectName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    handleSearch() {
      this.customerInfoSearchPage();
    },
    customerInfoSearchPage() {
      this.loading = true;
      let data = { ...this.page, ...this.inpData };
      data.customType = this.optionType;
      data.fkProjectBidId = this.fkProjectBidId;
      data.fkProjectId = this.fkProjectId;
      this.$api.customerInfoSearchPage(data).then(res => {
        this.loading = false;
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    typeChange() {
      this.page.pageNum = 1;
      this.inpData = {};
      this.fkProjectId = "";
      this.fkProjectBidId = "";
      this.customerInfoSearchPage();
      console.log(this.optionType);
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
          if (res.data.length) {
            // this.fkProjectId = res.data[0].pkId;
            this.getCompanyList();
            this.handleSearch();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getCompanyList() {
      let data = {};
      if (this.user.orgType != 5) {
        data.projectId = this.fkProjectId;
      }
      this.$api.searchManageCustom(data).then(res => {
        if (res.code === 200) {
          console.log(res.data);
          let obj1 = {
            customName: "",
            customType: 0,
            linkMan: "",
            linkPhone: "",
            remark: ""
          };
          let obj2 = {
            customName: "",
            customType: 5,
            linkMan: "",
            linkPhone: "",
            remark: ""
          };
          let obj3 = {
            customName: "",
            customType: 1,
            linkMan: "",
            linkPhone: "",
            remark: ""
          };
          // 客户类型（0 建设单位子公司 , 1 监理公司 ,2 项目部 ,3 供应商, 4 分包单位 ,5 设计院 ,6 施工单位集团公司，7 政府监管单位 ，8 建设单位集团公司 )
          res.data.forEach(item => {
            if (item.customType == 0) {
              console.log(item);
              obj1 = item;
              console.log(obj1);
            }
            if (item.customType == 5) {
              obj2 = item;
            }
            if (item.customType == 1) {
              obj3 = item;
            }
          });
          this.obj1 = obj1;
          this.obj2 = obj2;
          this.obj3 = obj3;
          this.handleSearch();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },

    // 模态框确定按钮
    async btnOk() {
      await this.$refs.formDate.validate();
      this.formDate.orgType = this.orgType;
      let promist = this.formDate.pkId ? this.$api.editCustomById : this.$api.addCustom;
      this.loading = true;
      promist(this.formDate)
        .then(res => {
          if (res.code === 200) {
            this.getCompanyList();
            this.$message.success(res.msg);
            this.handleCancel();
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 关闭模态框
    handleCancel() {
      this.$refs.formDate.resetFields();
      this.formDate = {
        customName: "",
        customType: 5,
        fkProjectId: "",
        linkMan: "",
        linkPhone: "",
        orgType: this.orgType,
        remark: ""
      };
      this.dialogVisible = false;
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.customerInfoSearchPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.customerInfoSearchPage();
    }
    //绑定链接模态框
    // querySearch(queryString, cb) {
    //   if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(queryString)) {
    //     let orgType = this.rowDate.customType === 0 ? 2 : this.rowDate.customType === 1 ? 3 : this.rowDate.customType === 5 ? 9 : "";
    //     console.log(orgType, this.rowDate.customType);
    //     let date = { linkPhone: queryString, orgType: orgType };
    //     if (this.rowDate.relationStatus == 0 && this.rowDate.fkLinkOrgId - 0 !== 0) {
    //       date.linkOrgId = this.rowDate.fkLinkOrgId;
    //     }
    //     this.$api.getCustomByPhone(date).then(res => {
    //       // 调用 callback 返回建议列表的数据,返回[]不显示选择框
    //       if (res.code === 200) {
    //         if (!res.data.length) {
    //           this.$message.warning("没有该电话号码对应的公司");
    //           cb([]);
    //         } else {
    //           let result = res.data.map(item => ({
    //             value: item.orgName,
    //             ...item
    //           }));
    //           cb(result);
    //         }
    //       } else {
    //         this.$message.warning(res.msg);
    //         cb([]);
    //       }
    //     });
    //   } else {
    //     cb([]);
    //   }
    // },
    // handleSelect(item) {
    //   this.bindData.orgId = item.pkId;
    // },
  }
};
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  background-color: $searcHeder;

  .head {
    display: flex;
    justify-content: space-between;
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
      margin: 5px 0;
      height: 28px;
      margin-right: 20px;
    }
  }
}
.mr-20 {
  margin-right: 20px;
}
.content {
  // display: flex;
  padding: 20px;
  background-color: #fff;
}
.custom-item {
  position: relative;
  width: 460px;
  height: 540px;
  margin-right: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  z-index: 1;
  //   background-repeat: no-repeat;
  //   background-size: 200px 200px;
  //   background-position: 230px 300px;
  .orgType,
  .org-title,
  .org-contnet,
  .org-remark {
    padding: 0 10px;
  }
  .logo {
    position: absolute;
    width: 200px;
    height: 200px;
    right: 30px;
    bottom: 40px;
    z-index: -1;
    .pic {
      width: 200px;
      height: 200px;
      filter: drop-shadow(0 0px yellow);
    }
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.6) 100%);
    }
  }
  .btns {
    position: absolute;
    right: 20px;
    top: 20px;
    img {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
  }
  .link {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  .red {
    color: rgba(230, 69, 69, 1);
  }
  .blue {
    color: rgba(42, 130, 228, 1);
  }
  .orgType {
    font-size: 14px;
    margin-bottom: 10px;
    color: rgba(32, 52, 87, 1);
  }
  .orgName {
    margin-bottom: 12px;
    opacity: 0.8;
    line-height: 28px;
    font-size: 20px;
    font-weight: 700;
    // line-height: 40px;
    padding: 6px 10px;
    // color: rgba(46, 99, 191, 1);
  }
  .col1 {
    color: rgba(46, 99, 191, 1);
    background: linear-gradient(90deg, rgba(97, 192, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
  }
  .col2 {
    color: rgba(28, 153, 74, 1);
    background: linear-gradient(90deg, rgba(97, 255, 126, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
  }
  .col3 {
    color: rgba(194, 91, 2, 1);
    background: linear-gradient(90deg, rgba(255, 163, 97, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
  }
  .line {
    height: 2px;
    margin-bottom: 20px;
    background: linear-gradient(90deg, rgba(204, 204, 204, 1) 0%, rgba(204, 204, 204, 0) 100%);
  }
  .org-title {
    font-size: 14px;
    color: rgba(32, 52, 87, 1);
    vertical-align: top;
    margin-bottom: 10px;
  }
  .org-contnet {
    height: 52px;
    margin-bottom: 10px;
    left: -617px;
    opacity: 0.8;
    /** 文本1 */
    font-size: 20px;
    font-weight: 700;
    color: rgba(32, 52, 87, 1);
    vertical-align: top;
  }
  .org-remark {
    font-size: 14px;
    vertical-align: top;
    color: rgba(32, 52, 87, 1);
  }
  .adds {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    color: rgba(32, 52, 87, 0.6);
    font-size: 14px;
    cursor: pointer;
    .icons {
      font-size: 40px;
      color: rgba(204, 204, 204, 1);
      margin-bottom: 14px;
    }
  }
  .emptys {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    color: rgba(32, 52, 87, 0.6);
    font-size: 14px;
  }
}
/deep/ .el-tabs__nav-scroll {
  background: #fff;
  padding-left: 20px;
}
.btn-serach {
  margin-left: 20px;
  height: 28px;
}
</style>
