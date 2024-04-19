<template>
  <div class="app-container">
    <!-- 头部搜索框 -->
    <div slot="header" class="clearfix card-header search-mr search-bar-box">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <!-- <el-form-item label="项目" v-if="user.orgType !== 5 && user.orgType !== 4">
            <el-select v-model="proId" size="mini" @change="proChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId"
                :label="item.projectName"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="标段项目" v-if="user.orgType !== 5">
            <!-- <el-select v-model="linkProId" size="mini" v-if="user.orgType !== 4">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in proOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId"
                :label="item.fkBidProjectName"></el-option>
            </el-select>
            <el-select v-model="proId" size="mini" v-else>
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId"
                :label="item.projectName"></el-option>
            </el-select> -->
            <proSelct @selectIds="selectIds"></proSelct>
          </el-form-item>
          <el-form-item label="企业名称" v-if="user.orgType !== 5">
            <el-input size="mini" v-model="inpData.customName" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="联系人" v-if="user.orgType !== 5">
            <el-input size="mini" v-model="inpData.linkMan" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="联系电话" v-if="user.orgType !== 5">
            <el-input size="mini" v-model="inpData.linkPhone" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" icon="el-icon-search" class="btn-serach el-button-primary" @click="btnSearch" v-if="user.orgType !== 5">查询</el-button>
        </el-form>
        <el-button size="mini" type="primary" class="addBtn el-button-primary" @click="handleOpen(1)" v-if="user.orgType === 5">新增</el-button>
      </div>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height: 86%;">
        <!-- 表格 -->
        <el-table stripe :data="tableData" ref="tables" height="90%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
          <el-table-column label="序号" type="index" align="center" width="80">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="监理企业名称" prop="customName" align="center"> </el-table-column>
          <el-table-column :label="user.orgType === 2 ? '监理公司联系人' : '联系人'" prop="linkMan" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column :label="user.orgType === 2 ? '监理公司联系电话' : '联系电话'" prop="linkPhone" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="绑定关联" width="100" align="center" v-if="user.orgType !== 2">
            <template slot-scope="{ row }">
              <span>{{ row.relationStatus === 0 ? "否" : "是" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="项目名称" prop="fkProjectName" align="center" v-if="user.orgType !== 4 && user.orgType !== 5" show-overflow-tooltip> </el-table-column>
          <el-table-column label="监理标段项目" prop="projectBidName" align="center" v-if="user.orgType === 2 || user.orgType === 4" show-overflow-tooltip> </el-table-column>
          <el-table-column label="备注" prop="remark" width="300" align="center" v-if="user.orgType !== 2" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" align="center" width="350" v-if="user.orgType === 5">
            <template slot-scope="{ row }">
              <el-button plain size="mini" type="primary" @click="handleOpen(2, row)">查看</el-button>
              <el-button plain size="mini" type="warning" @click="handleOpen(1, row)" v-if="user.orgType === 5">编辑</el-button>
              <el-button plain size="mini" type="danger" @click="removeBind(row)" v-show="user.orgType === 5 && row.relationStatus == 1">解除关联</el-button>
              <el-button plain size="mini" type="success" @click="openLinkDialog(row)" v-show="row.relationStatus - 0 !== 1 && user.orgType === 5">绑定关联</el-button>
              <el-button plain size="mini" type="danger" @click="btndel(row.pkId)" v-if="user.orgType === 5">删除 </el-button>
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
    </div>
    <!-- 模态框 -->
    <el-dialog :close-on-press-escape="false" :title="(dialogType === 2 ? '查看' : formDate.pkId ? '编辑' : '新增') + '监理公司'" :visible.sync="dialogVisible" @close="handleCancel" ref="model" width="25%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form :model="formDate" class="dialog-form" label-width="90px" :rules="rules" ref="formDate">
        <el-form-item label="企业名称" prop="customName">
          <el-input size="mini" v-model.trim="formDate.customName" :disabled="dialogType === 2" :maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="linkMan">
          <el-input size="mini" v-model.trim="formDate.linkMan" :maxlength="25" :disabled="dialogType === 2"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="linkPhone">
          <el-input size="mini" v-model.trim="formDate.linkPhone" :disabled="dialogType === 2" :maxlength="11" type="number" oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input size="mini" v-model="formDate.remark" maxlength="100" type="textarea" resize="none" :disabled="dialogType === 2" rows="8"></el-input>
        </el-form-item>
      </el-form>
      <div style="height: 10px;" v-if="dialogType != 1"></div>
      <div slot="footer" class="dialog-footer" v-if="dialogType === 1">
        <el-button size="mini" @click="handleCancel">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="btnOk">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 绑定关联模态框 -->
    <el-dialog :close-on-press-escape="false" title="绑定公司" top="15vw" :visible="linkDialog" @close="closeLinkDialog" width="21%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form label-width="80px" class="dialog-form">
        <el-form-item :label="rowDate.fkLinkOrgId != '0' ? '重新绑定' : '绑定公司'">
          <el-autocomplete size="mini" class="inline-input" v-model="state" :disabled="rowDate.fkLinkOrgId != '0'" :fetch-suggestions="querySearch" placeholder="请输入完整的手机号码" :maxlength="11" :trigger-on-focus="false" @select="handleSelect" oninput="if(value.length>11)value=value.slice(0, 11)">
            <template slot-scope="{ item }">
              <a :title="item.orgName" style="text-decoration:none">{{ item.orgName }}</a>
            </template>
          </el-autocomplete>
        </el-form-item>
        <div style="text-align:center;margin-bottom:20px;">
          <i class="el-icon-warning" style="color:#ff2e00"></i>
          <span v-if="rowDate.fkLinkOrgId != '0'">当前已产生关联数据，可重新绑定原公司。</span>
          <span v-else>产生关联数据后不可变更绑定公司</span>
        </div>
      </el-form>
      <div slot="footer">
        <el-button @click="closeLinkDialog" size="mini">取消</el-button>
        <el-button type="primary" class="el-button-primary" @click="addBind" size="mini">保存</el-button>
      </div>
    </el-dialog>
    <!-- 解除绑定模态框 -->
    <el-dialog :close-on-press-escape="false" title="解除关联确认" top="15vw" :visible="relieveDialog" @close="closeRelieve" width="21%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="已绑定公司">
          <el-input disabled v-model="rowDate.customOrgName"></el-input>
        </el-form-item>
        <div style="text-align:center;margin-bottom:20px;">
          <i class="el-icon-warning" style="color:#ff2e00"></i>
          <span>确定解除该客户信息与</span>
          <div>此公司在系统中的关联关系？</div>
        </div>
      </el-form>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" @click="notarize" size="mini">确认</el-button>
        <el-button @click="closeRelieve" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
import api from "@/api/api";
export default {
  components: { Pagination },
  data() {
    return {
      tableData: [],
      options: [],
      proOptions: [],
      dialogVisible: false,
      linkDialog: false,
      // 弹出框数据
      formDate: {
        customName: "",
        customType: 1,
        fkProjectId: "",
        linkMan: "",
        linkPhone: "",
        orgType: 2,
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
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      inpData: {
        fkProjectId: "",
        customName: "",
        linkMan: "",
        linkPhone: "",
        isWholeBid: 1,
        isWholeProject: 1
      },
      searchData: {
        isWholeBid: 1,
        isWholeProject: 1
      },
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
      relieveDialog: false
    };
  },
  created() {
    if (this.user.orgType !== 5) {
      // this.getAllProject();
    } else {
      this.getCompanyList();
    }
    this.formDate.orgType = this.orgType;
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.proId = arr[0];
          this.linkProId = arr[1];
        } else {
          this.linkProId = arr[0];
        }
        if (isTrue) {
          this.btnSearch();
        }
      }
    },
    // 关闭绑定链接模态框
    closeRelieve() {
      this.relieveDialog = false;
    },
    notarize() {
      api.updateCustomRelationById({ pkId: this.rowDate.pkId, orgId: "" }).then(res => {
        if (res.code === 200) {
          this.closeRelieve();
          this.getCompanyList();
          this.$message({
            type: "success",
            message: res.msg
          });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取监理公司列表
    getCompanyList() {
      const data = { ...this.page, customType: 1, ...this.searchData };
      api.getCustomPageListByCondition({ ...data }).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取所有项目部
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
    // 打开模态框
    handleOpen(type, row) {
      this.dialogType = type;
      if (row) {
        this.formDate = { ...row };
        if (this.user.orgType === 2) {
          // 因为建设单位需要显示的是另一个数据，input的v-model绑定原因，所以这里暂时赋值显示
          this.formDate.customName = row.orgName;
        }
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
    // 模态框确定按钮
    async btnOk() {
      await this.$refs.formDate.validate();
      this.formDate.orgType = this.orgType;
      const promist = this.formDate.pkId ? api.editCustomById : api.addCustom;
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
        customType: 1,
        fkProjectId: "",
        linkMan: "",
        linkPhone: "",
        orgType: this.orgType,
        remark: ""
      };
      this.dialogVisible = false;
    },
    // 打开绑定关联模态框
    openLinkDialog(row) {
      let pkId = row.pkId;
      this.rowDate = row;
      if (row.fkLinkOrgId != "0") {
        this.state = row.customOrgName;
        this.bindData = { orgId: row.fkLinkOrgId, pkId };
      } else {
        this.bindData = { ...this.bindData, pkId };
      }
      this.linkDialog = true;
    },
    // 绑定关联
    addBind() {
      if (this.bindData.orgId) {
        this.loading = true;
        api
          .updateCustomRelationById(this.bindData)
          .then(res => {
            if (res.code === 200) {
              this.getCompanyList();
              this.$message.success("操作成功");
              this.closeLinkDialog();
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        this.$message.warning("绑定失败，没有选择关联公司");
      }
    },
    // 解除绑定
    removeBind(row) {
      this.rowDate = row;
      this.relieveDialog = true;
      // this.$confirm("确定解除该客户信息与监理公司在系统中的关联关系？", "解除关联确认", {
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消",
      //   type: "warning"
      // }).then(() => {
      //   api.updateCustomRelationById({ pkId: row.pkId, orgId: "" }).then(res => {
      //     if (res.code === 200) {
      //       this.getCompanyList();
      //       this.$message({
      //         type: "success",
      //         message: res.msg
      //       });
      //     } else {
      //       this.$message.warning(res.msg);
      //     }
      //   });
      // });
    },
    // 删除按钮
    btndel(pkId) {
      this.$confirm("确定删除该监理公司信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        api.delCustomById({ pkId }).then(res => {
          if (res.code === 200) {
            this.getCompanyList();
            this.$message({
              type: "success",
              message: "删除成功!"
            });
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 绑定链接模态框
    querySearch(queryString, cb) {
      if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(queryString)) {
        let date = { linkPhone: queryString, orgType: 3 };
        if (this.rowDate.relationStatus == 0 && this.rowDate.fkLinkOrgId - 0 !== 0) {
          date.linkOrgId = this.rowDate.fkLinkOrgId;
        }
        api.getCustomByPhone(date).then(res => {
          // 调用 callback 返回建议列表的数据,返回[]不显示选择框
          if (res.code === 200) {
            if (!res.data.length) {
              this.$message.warning("没有该电话号码对应的公司");
              cb([]);
            } else {
              const result = res.data.map(item => ({
                value: item.orgName,
                ...item
              }));
              cb(result);
            }
          } else {
            this.$message.warning(res.msg);
            cb([]);
          }
        });
      } else {
        cb([]);
      }
    },
    handleSelect(item) {
      this.bindData.orgId = item.pkId;
    },
    // 关闭绑定链接模态框
    closeLinkDialog() {
      this.state = "";
      this.bindData = {
        pkId: "",
        orgId: ""
      };
      this.linkDialog = false;
    },
    // 搜索按钮
    btnSearch() {
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
      this.getCompanyList();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getCompanyList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getCompanyList();
    },
    // 选择项目部
    proChange(e) {
      this.linkProId = "";
      if (e) {
        this.allListBidByProId(0, e);
      }
    }
  },
  computed: {
    orgType() {
      if (this.user.orgType === 3) {
        return 1;
      } else if (this.user.orgType === 5) {
        return 2;
      }
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
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

.btn-serach {
  margin-left: 20px;
  height: 28px;
}

.inline-input {
  width: 250px;
}
</style>
