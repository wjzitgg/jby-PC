<template>
  <div class="app-container">
    <!-- 头部搜索框 -->
    <div slot="header" class="clearfix card-header search-mr search-bar-box">
      <div class="head">
        <el-form ref="form" label-width="80px" :model="inpData">
          <el-form-item label="标段项目" v-if="user.orgType === 4 || user.orgType === 10">
            <!-- <el-select v-model="inpData.fkProjectId" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId"
                :label="item.projectName"></el-option>
            </el-select> -->
            <proSelct @selectIds="selectIds"></proSelct>
          </el-form-item>
          <el-form-item label="供应商" v-if="typeShow">
            <el-input size="mini" v-model="inpData.customName" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="联系人" v-if="typeShow">
            <el-input size="mini" v-model="inpData.linkMan" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="联系电话" v-if="typeShow">
            <el-input size="mini" v-model="inpData.linkPhone" maxlength="20" @input="inpData.linkPhone = $limitPhone(inpData.linkPhone)"></el-input>
          </el-form-item>
          <el-button size="mini" v-if="typeShow" type="primary" icon="el-icon-search" class="btn-serach el-button-primary" @click="btnSearch">搜索</el-button>
        </el-form>
        <el-button size="mini" type="primary" class="addBtn el-button-primary" @click="handleOpen(1)" v-if="true" v-has="'customer:supplier:add'">新增</el-button>
      </div>
    </div>
    <div class="tab-container" v-if="typeShow">
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
          <!-- <el-table-column label="标段项目" prop="directSupplyName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column> -->
          <el-table-column label="供应商" prop="customName" align="center">
            <template slot-scope="{ row }">
              <div class="ellipsistwo" :title="row.customName">{{ row.customName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="联系人" prop="linkMan" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="联系电话" prop="linkPhone" width="150px" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="绑定关联" width="100" align="center">
            <template slot-scope="{ row }">
              <span>{{ row.relationStatus - 0 === 0 ? "否" : "是" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="直供分包单位" prop="directSupplyName" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="备注" prop="remark" width="300px" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" align="center" width="350" v-if="user.orgType === 5">
            <template slot-scope="{ row }">
              <el-button plain size="mini" type="primary" @click="handleOpen(2, row)" v-has="'customer:supplier:query'">查看</el-button>
              <el-button plain size="mini" type="warning" @click="handleOpen(1, row)" v-has="'customer:supplier:edit'">编辑</el-button>
              <el-button plain size="mini" type="danger" @click="removeBind(row)" v-show="user.orgType === 5 && row.relationStatus - 0 == 1" v-has="'customer:supplier:relieve'">解除关联</el-button>
              <el-button plain size="mini" type="success" @click="openLinkDialog(row)" v-show="row.relationStatus - 0 !== 1 && user.orgType === 5" v-has="'customer:supplier:binding'">绑定关联</el-button>
              <el-button plain size="mini" type="danger" @click="btndel(row.pkId)" v-has="'customer:supplier:delete'">删除</el-button>
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
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 模态框 -->
    <el-dialog :close-on-press-escape="false" :title="(dialogType === 2 ? '查看' : formDate.pkId ? '编辑' : '新增') + '供应商'" :visible.sync="dialogVisible" @close="handleCancel" ref="model" width="25%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form :model="formDate" ref="formDate" label-width="100px" :rules="rules" class="dialog-form">
        <el-form-item label="供应商" prop="customName">
          <el-input size="mini" v-model.trim="formDate.customName" :disabled="dialogType === 2" :maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="供应商类型">
          <el-select v-model.trim="formDate.supplyCode" size="mini" style="width:100%" :disabled="dialogType === 2" @change="supplyCodeChange">
            <el-option v-for="item in supTypeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="直供分包单位" prop="directSupplyName" v-if="formDate.supplyCode !== 'supply_common'">
          <el-select v-model="supplyIds" multiple collapse-tags size="mini" style="width:100%" @change="testChange" v-if="dialogType !== 2">
            <el-option v-for="item in subOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>

          <el-input size="mini" v-model="formDate.supplyName" v-if="dialogType === 2" disabled :title="formDate.supplyName"></el-input>

          <!-- <el-input size="mini" v-model="formDate.directSupplyName"   :disabled="dialogType === 2" :maxlength="25"></el-input> -->
        </el-form-item>

        <el-form-item label="联系人" prop="linkMan">
          <el-input size="mini" v-model.trim="formDate.linkMan" :disabled="dialogType === 2" :maxlength="25"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="linkPhone">
          <el-input size="mini" v-model.trim="formDate.linkPhone" :disabled="dialogType === 2" maxlength="20" @input="formDate.linkPhone = $limitPhone(formDate.linkPhone)"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input size="mini" v-model="formDate.remark" type="textarea" maxlength="100" resize="none" :disabled="dialogType === 2" rows="8"></el-input>
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
        customType: 3,
        fkProjectId: "",
        linkMan: "",
        linkPhone: "",
        fkProjectName: "",
        directSupplyName: "",
        supplyName: "",
        orgType: 2,
        remark: "",
        supplyIds: [],
        supplyCode: "supply_common"
      },
      rules: {
        customName: [{ required: true, message: "请填写供应商名称", trigger: "blur" }],
        linkMan: [{ required: true, message: "请填写联系人名称", trigger: "blur" }],
        linkPhone: [
          { required: true, message: "请填写联系电话", trigger: "blur" }
          // {
          //   pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
          //   message: "手机号格式错误",
          //   trigger: "blur"
          // }
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
        linkPhone: ""
      },
      searchData: {},
      // 绑定关联模态框获取到的数据
      state: "",
      bindData: {
        pkId: "",
        orgId: ""
      },
      loading: false,
      subOptions: [],
      supTypeList: [],
      rowDate: {},
      relieveDialog: false,
      supplyIds: [],
      typeShow: true
    };
  },
  async created() {
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
      // this.getAllProject();
    } else {
      this.getSupplierList();
    }
    this.customSearchByProOrgId();
    this.formDate.orgType = this.orgType;
    // this.getItemClass(23);
    let arr = await this.$store.dispatch("getDictionariesData", 23);
    this.supTypeList = arr.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
  },
  methods: {
    testChange(e) {
      this.formDate.supplyIds = e;
      console.log(e);
    },
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.inpData.fkProjectId = arr[1];
        } else {
          this.inpData.fkProjectId = arr[0];
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
          this.getSupplierList();
          this.$message({
            type: "success",
            message: res.msg
          });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取供应商列表
    getSupplierList() {
      const data = { ...this.page, customType: 3, ...this.searchData };
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
    customSearchByProOrgId() {
      api.customSearchByProOrgId().then(res => {
        console.log(res);
        if (res.code === 200) {
          this.subOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取字典
    // getItemClass(dictType) {
    //   this.$api.getItemClass({ dictType }).then(res => {
    //     if (res.code === 200) {
    //       let arr = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
    //       this.supTypeList = arr;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    supplyCodeChange(e) {
      if (e === "supply_common") {
        this.formDate.supplyIds = [];
        this.supplyIds = [];
      }
    },
    // 打开模态框
    handleOpen(type, row) {
      this.dialogType = type;
      if (row) {
        // this.formDate = { ...row };
        api.getCustomInfoById({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.formDate = res.data;
            this.formDate.supplyIds = res.data.supplyCustoms ? res.data.supplyCustoms.map(item => item.pkId) : [];
            this.supplyIds = this.formDate.supplyIds;
            console.log(res.data.supplyCustoms, this.formDate.supplyIds);
            this.formDate.supplyName = res.data.supplyName ? res.data.supplyName : row.supplyName;
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
      this.dialogVisible = true;
    },
    // 模态框确定按钮
    async btnOk() {
      await this.$refs.formDate.validate();
      const promist = this.formDate.pkId ? api.editCustomById : api.addCustom;
      this.loading = true;
      promist(this.formDate)
        .then(res => {
          if (res.code === 200) {
            this.getSupplierList();
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
        customType: 3,
        fkProjectId: "",
        linkMan: "",
        linkPhone: "",
        orgType: this.orgType,
        remark: "",
        supplyIds: [],
        supplyCode: "supply_common"
      };
      this.supplyIds = [];
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
              this.getSupplierList();
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
      // this.$confirm("确定解除该客户信息与供应商在系统中的关联关系？", "解除关联确认", {
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消",
      //   type: "warning"
      // }).then(() => {
      //   api.updateCustomRelationById({ pkId: row.pkId, orgId: "" }).then(res => {
      //     if (res.code === 200) {
      //       this.getSupplierList();
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
      this.$confirm("确定删除该供应商信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        api.delCustomById({ pkId }).then(res => {
          if (res.code === 200) {
            this.getSupplierList();
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
        let date = { linkPhone: queryString, orgType: 6 };
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
      this.searchData = { ...this.inpData };
      this.getSupplierList();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getSupplierList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getSupplierList();
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
      margin-top: 5px;
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
