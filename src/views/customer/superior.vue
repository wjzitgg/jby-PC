<template>
  <div class="app-container">
    <div slot="header" class="clearfix card-header search-mr search-bar-box" v-if="user.orgType != 5">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <el-form-item label="标段项目">
            <!-- <el-select v-model="fkProjectId" size="mini">
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select> -->
            <proSelct @selectIds="selectIds"></proSelct>
          </el-form-item>
          <!-- <el-button size="mini" type="primary" icon="el-icon-search" class="btn-serach el-button-primary" @click="btnSearch">搜索</el-button> -->
        </el-form>
      </div>
    </div>
    <div class="content" :style="{ height: user.orgType != 5 ? 'calc(95% - 90px)' : '95%' }" v-if="(user.orgType != 5 && show) || user.orgType == 5">
      <div class="custom-item">
        <div v-if="!!obj1.pkId">
          <div class="btns">
            <img src="../../assets/edit.png" alt="" class="mr-20" v-has="'customer:superior:edit'" @click="handleOpen(1, obj1)" />
            <img src="../../assets/delete.png" alt="" v-has="'customer:superior:delete'" @click="btndel(obj1)" />
          </div>
          <div class="orgType">建设单位</div>
          <div class="orgName col1">{{ obj1.customName }}</div>
          <!-- <div class="line"></div> -->
          <div class="org-title">联系人</div>
          <div class="org-contnet">{{ obj1.linkMan }}</div>
          <div class="org-title">联系电话</div>
          <div class="org-contnet">{{ obj1.linkPhone }}</div>
          <div class="org-title">
            绑定单位
            <span style="font-weight:700" :class="{ blue: !obj1.relationStatus, red: obj1.relationStatus }">
              <span v-show="obj1.relationStatus" v-has="'customer:superior:relieve'">（ <span class="link" @click="removeBind(obj1)">解除关联</span>）</span>
              <span v-show="!obj1.relationStatus" v-has="'customer:superior:binding'">（<span class="link" @click="openLinkDialog(obj1)"> 绑定关联</span> ）</span>
            </span>
          </div>
          <div class="org-contnet" v-if="obj1.relationStatus">{{ obj1.fkLinkOrgName }}</div>
          <div class="org-contnet" style="color: rgba(32, 52, 87, 0.2);" v-if="!obj1.relationStatus">未绑定</div>
          <div class="org-title">备注</div>
          <div class="org-remark" :style="!obj1.remark ? 'color:rgba(32, 52, 87, 0.2);' : ''">{{ !!obj1.remark ? obj1.remark : "暂无备注" }}</div>
        </div>
        <div v-else-if="user.permissions.includes('customer:superior:add')" class="adds" @click="handleOpen(1, obj1)">
          <div class="icons el-icon-plus"></div>
          <div>添加建设单位</div>
        </div>
        <div class="emptys" v-if="!obj1.pkId && !user.permissions.includes('customer:superior:add')">暂无建设单位</div>
        <div class="logo">
          <img :src="obj1.orgLogo" alt="" class="pic" v-if="obj1.relationStatus" />
          <img src="../../assets/superiors1.png" alt="" class="pic" v-else />
        </div>
      </div>
      <div class="custom-item">
        <div v-if="!!obj2.pkId">
          <div class="btns">
            <img src="../../assets/edit.png" alt="" class="mr-20" v-has="'customer:superior:edit'" @click="handleOpen(1, obj2)" />
            <img src="../../assets/delete.png" alt="" v-has="'customer:superior:delete'" @click="btndel(obj2)" />
          </div>
          <div class="orgType">设计院</div>
          <div class="orgName col2">{{ obj2.customName }}</div>
          <!-- <div class="line"></div> -->
          <div class="org-title">联系人</div>
          <div class="org-contnet">{{ obj2.linkMan }}</div>
          <div class="org-title">联系电话</div>
          <div class="org-contnet">{{ obj2.linkPhone }}</div>
          <div class="org-title">
            绑定单位
            <span style="font-weight:700" :class="{ blue: !obj2.relationStatus, red: obj2.relationStatus }">
              <span v-show="obj2.relationStatus" v-has="'customer:superior:relieve'">（ <span class="link" @click="removeBind(obj2)">解除关联</span>）</span>
              <span v-show="!obj2.relationStatus" v-has="'customer:superior:binding'">（<span class="link" @click="openLinkDialog(obj2)"> 绑定关联</span> ）</span>
            </span>
          </div>
          <div class="org-contnet" v-if="obj2.relationStatus">{{ obj2.fkLinkOrgName }}</div>
          <div class="org-contnet" style="color: rgba(32, 52, 87, 0.2);" v-if="!obj2.relationStatus">未绑定</div>
          <div class="org-title">备注</div>
          <div class="org-remark" :style="!obj2.remark ? 'color:rgba(32, 52, 87, 0.2);' : ''">{{ !!obj2.remark ? obj2.remark : "暂无备注" }}</div>
        </div>
        <div v-else-if="user.permissions.includes('customer:superior:add')" class="adds" @click="handleOpen(1, obj2)">
          <div class="icons el-icon-plus"></div>
          <div>添加设计院</div>
        </div>
        <div class="emptys" v-if="!obj2.pkId && !user.permissions.includes('customer:superior:add')">暂无设计院</div>
        <div class="logo">
          <img :src="obj2.orgLogo" alt="" class="pic" v-if="obj2.relationStatus" />
          <img src="../../assets/superiors2.png" alt="" class="pic" v-else />
        </div>
      </div>
      <div class="custom-item">
        <div v-if="!!obj3.pkId">
          <div class="btns">
            <img src="../../assets/edit.png" alt="" class="mr-20" v-has="'customer:superior:edit'" @click="handleOpen(1, obj3)" />
            <img src="../../assets/delete.png" alt="" v-has="'customer:superior:delete'" @click="btndel(obj3)" />
          </div>
          <div class="orgType">监理公司</div>
          <div class="orgName col3">{{ obj3.customName }}</div>
          <!-- <div class="line"></div> -->
          <div class="org-title">联系人</div>
          <div class="org-contnet">{{ obj3.linkMan }}</div>
          <div class="org-title">联系电话</div>
          <div class="org-contnet">{{ obj3.linkPhone }}</div>
          <div class="org-title">
            绑定单位
            <span style="font-weight:700" :class="{ blue: !obj3.relationStatus, red: obj3.relationStatus }">
              <span v-show="obj3.relationStatus" v-has="'customer:superior:relieve'">（ <span class="link" @click="removeBind(obj3)">解除关联</span>）</span>
              <span v-show="!obj3.relationStatus" v-has="'customer:superior:binding'">（<span class="link" @click="openLinkDialog(obj3)"> 绑定关联</span> ）</span>
            </span>
          </div>
          <div class="org-contnet" v-if="obj3.relationStatus">{{ obj3.fkLinkOrgName }}</div>
          <div class="org-contnet" style="color: rgba(32, 52, 87, 0.2);" v-if="!obj3.relationStatus">未绑定</div>
          <div class="org-title">备注</div>
          <div class="org-remark" :style="!obj3.remark ? 'color:rgba(32, 52, 87, 0.2);' : ''">{{ !!obj3.remark ? obj3.remark : "暂无备注" }}</div>
        </div>
        <div v-else-if="user.permissions.includes('customer:superior:add')" class="adds" @click="handleOpen(1, obj3)">
          <div class="icons el-icon-plus"></div>
          <div>添加监理公司</div>
        </div>
        <div class="emptys" v-if="!obj3.pkId && !user.permissions.includes('customer:superior:add')">暂无监理公司</div>
        <div class="logo">
          <img :src="obj3.orgLogo" alt="" class="pic" v-if="obj3.relationStatus" />
          <img src="../../assets/superiors3.png" alt="" class="pic" v-else />
        </div>
      </div>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !show">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 模态框 -->
    <el-dialog :close-on-press-escape="false" :title="(dialogType === 2 ? '查看' : formDate.pkId ? '编辑' : '新增') + (formDate.customType == 0 ? '建设单位' : formDate.customType == 1 ? '监理公司' : '设计院')" :visible.sync="dialogVisible" @close="handleCancel" ref="model" width="25%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form :model="formDate" label-width="90px" class="dialog-form" :rules="rules" ref="formDate">
        <el-form-item label="企业名称" prop="customName">
          <el-input size="mini" v-model.trim="formDate.customName" :disabled="dialogType === 2" :maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="linkMan">
          <el-input size="mini" v-model.trim="formDate.linkMan" :maxlength="25" :disabled="dialogType === 2"></el-input>
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
          <el-autocomplete size="mini" class="inline-input" v-model="state" :fetch-suggestions="querySearch" :disabled="rowDate.fkLinkOrgId != '0'" placeholder="请输入完整的手机号码" :maxlength="11" :trigger-on-focus="false" @select="handleSelect" oninput="if(value.length>11)value=value.slice(0, 11)">
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
          <el-input disabled v-model="rowDate.fkLinkOrgName"></el-input>
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
export default {
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
      linkDialog: false,
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
      show: false
    };
  },
  mounted() {
    if (this.user.orgType != 5) {
      // this.getAllProject();
    } else {
      this.getCompanyList();
    }
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        this.show = true;
        if (arr.length > 1) {
          this.fkProjectId = arr[1];
        } else {
          this.fkProjectId = arr[0];
        }
        this.getCompanyList();
      } else {
        this.show = false;
      }
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
          if (res.data.length) {
            this.fkProjectId = res.data[0].pkId;
            this.getCompanyList();
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
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 关闭绑定链接模态框
    closeRelieve() {
      this.relieveDialog = false;
    },
    notarize() {
      this.$api.updateCustomRelationById({ pkId: this.rowDate.pkId, orgId: "" }).then(res => {
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
    // 打开模态框
    handleOpen(type, row) {
      this.dialogType = type;
      if (row) {
        this.formDate = { ...row };
        if (this.user.orgType === 2) {
          // 因为建设单位需要显示的是另一个数据，input的v-model绑定原因，所以这里暂时赋值显示
          this.formDate.customName = row.orgName;
        }
      }
      this.dialogVisible = true;
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
    // 打开绑定关联模态框
    openLinkDialog(row) {
      let pkId = row.pkId;
      this.rowDate = row;
      if (row.fkLinkOrgId != "0") {
        this.state = row.fkLinkOrgName;
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
        this.$api
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
    },
    // 删除按钮
    btndel(item) {
      let str = item.customType == 0 ? "建设单位" : item.customType == 1 ? "监理公司" : "设计院";
      this.$confirm(`确定删除该${str}信息？`, "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delCustomById({ pkId: item.pkId }).then(res => {
          if (res.code === 200) {
            this.getCompanyList();
            this.$message({
              type: "success",
              message: `删除成功!`
            });
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    //绑定链接模态框
    querySearch(queryString, cb) {
      if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(queryString)) {
        let orgType = this.rowDate.customType === 0 ? 2 : this.rowDate.customType === 1 ? 3 : this.rowDate.customType === 5 ? 9 : "";
        console.log(orgType, this.rowDate.customType);
        let date = { linkPhone: queryString, orgType: orgType };
        if (this.rowDate.relationStatus == 0 && this.rowDate.fkLinkOrgId - 0 !== 0) {
          date.linkOrgId = this.rowDate.fkLinkOrgId;
        }
        this.$api.getCustomByPhone(date).then(res => {
          // 调用 callback 返回建议列表的数据,返回[]不显示选择框
          if (res.code === 200) {
            if (!res.data.length) {
              this.$message.warning("没有该电话号码对应的公司");
              cb([]);
            } else {
              let result = res.data.map(item => ({
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
.mr-20 {
  margin-right: 20px;
}
.content {
  display: flex;
  padding: 20px;
  background-color: #fff;
}
.custom-item {
  position: relative;
  width: 460px;
  height: 560px;
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
    word-break: break-all;
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
// .item-bg1 {
//   background-image: url("../../assets/superiors1.png");
// }
// .item-bg2 {
//   background-image: url("../../assets/superiors2.png");
// }
// .item-bg3 {
//   background-image: url("../../assets/superiors3.png");
// }
</style>
