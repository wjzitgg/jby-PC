<template>
  <div>
    <el-dialog :close-on-press-escape="false" title="工区管理" v-if="workAreaDialog" :visible="workAreaDialog" @close="handleClose" center v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form" v-if="workAreaStart">
        <el-button type="primary" size="mini" @click="openAddDialog(2)" class="btnadd el-button-primary" v-if="dialogType === 2">新增工区</el-button>
        <div class="main" v-loading="loading3">
          <div class="left">
            <el-radio-group v-model="radio" @change="radioChange">
              <el-radio-button v-for="item in areaList" :key="item.pkId" :label="item.pkId">
                <div class="overFlow" :title="item.areaName">{{ item.areaName }}</div>
                <i class="el-icon-edit edit" @click="openAddDialog(3, item)" v-if="dialogType === 2"></i>
                <i class="el-icon-view check" @click="openAddDialog(1, item)" v-if="dialogType === 2"></i>
                <!-- <span class="del" @click="handelDel(item.pkId)" >X</span> -->
                <span class="del" @click="handelDel(item.pkId)" v-if="dialogType === 2">X</span>
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="right">
            <el-tree @node-expand="nodeExpand" :data="treeList2" :props="defaultProps2" default-expand-all node-key="pkId" v-loading="loading2" v-show="dialogType === 1">
              <span slot-scope="{ node, data }">
                <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                  <div :class="'label' + data.grade" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                    <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                  </div>
                </el-tooltip>
              </span>
            </el-tree>
            <el-tree @node-expand="nodeExpand" :data="treeList" :props="defaultProps" @check-change="checkChange" default-expand-all show-checkbox node-key="pkId" ref="tree" v-loading="loading2" v-show="dialogType === 2">
              <span slot-scope="{ node, data }">
                <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                  <div :class="'label' + data.grade" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                    <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                  </div>
                </el-tooltip>
              </span>
            </el-tree>
          </div>
        </div>
      </div>
      <div class="dialog-form notStart" v-else>
        <h2>未启用工区管理</h2>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" class="el-button-primary" @click="handleEdit" v-if="dialogType === 1 && workAreaStart" v-has="'production:setting:areaEdit'">编 辑</el-button>
        <el-button type="primary" class="el-button-primary" @click="handleSave" v-if="dialogType === 2">保 存</el-button>
        <el-button type="primary" plain @click="handleClose2" v-if="dialogType === 2">取 消</el-button>
        <el-button type="primary" v-has="'production:setting:areaEnable'" class="el-button-primary" @click="startArea(1)" v-if="dialogType === 1 && !workAreaStart">启用工区管理</el-button>
        <el-button type="danger" v-has="'production:setting:areaDisable'" class="stopBtn" @click="startArea(0)" v-if="dialogType === 2 && workAreaStart">停止工区管理</el-button>
        <el-button @click="handleClose" v-if="dialogType === 1">关 闭</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="(addType == 1 ? '查看' : addType == 2 ? '新增' : '编辑') + '工区'" width="20%" :visible="addDialog" @close="closeAddDialog" center v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form pb-20">
        <el-form label-width="80px" :model="formData">
          <el-form-item label="工区名称">
            <el-input size="mini" v-model="formData.areaName" :disabled="addType === 1" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="工区描述">
            <el-input size="mini" type="textarea" resize="none" rows="3" maxlength="100" v-model="formData.remark" :disabled="addType === 1"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer" v-if="addType !== 1">
        <el-button type="primary" class="el-button-primary" @click="handleAdd">保 存</el-button>
        <el-button type="primary" plain @click="closeAddDialog">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    workAreaDialog: {
      type: Boolean,
      default: false
    },
    orgType: {
      type: Number
    },
    fkOrgId: "",
    pkId: ""
  },
  data() {
    return {
      dialogType: 1, //1为预览，2为编辑
      areaList: [],
      treeList: [],
      treeList2: [],
      linkList: [],
      radio: 0,
      addDialog: false,
      formData: {
        areaName: "",
        remark: ""
      },
      defaultProps: {
        children: "prodItemLists",
        label: "itemName",
        disabled: this.disabledFn
      },
      defaultProps2: {
        children: "children",
        label: "name"
      },
      loading: false,
      isShowTooltip: true,
      isChange: false,
      noSet: false,
      loading2: false,
      loading3: false,
      addType: 1,
      workAreaStart: true
    };
  },
  methods: {
    nodeExpand(data, node) {
      if (node.level == 1) {
        this.expandNodes(node);
      }
    },
    expandNodes(node) {
      node.expanded = true;
      for (let i = 0; i < node.childNodes.length; i++) {
        node.childNodes[i].expanded = true;
        if (node.childNodes[i].childNodes.length > 0) {
          this.expandNodes(node.childNodes[i]);
        }
      }
    },
    findWorkAreaStats() {
      let data = { fkOrgId: this.fkOrgId };
      if (this.user.orgType != 5) {
        data.projectId = this.pkId;
      }
      this.$api.findWorkAreaStats(data).then(res => {
        if (res.code === 200) {
          this.workAreaStart = res.data;
          if (res.data) {
            this.getAreaList(true);
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    startArea(state) {
      if (state == 0) {
        this.$confirm("停用后，将会清除已添加的工区信息", "确认停用工区管理？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.updateWorkAreaStats(state);
          })
          .catch(() => {});
      } else {
        this.updateWorkAreaStats(state);
      }
    },
    updateWorkAreaStats(state) {
      this.$api.updateWorkAreaStats({ state }).then(res => {
        if (res.code === 200) {
          if (state) {
            this.workAreaStart = true;
            this.getAreaList(true);
          } else {
            this.workAreaStart = false;
            this.dialogType = 1;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取工区列表
    getAreaList(change) {
      this.$api.queryCondition({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          this.areaList = res.data;
          if (change && res.data && res.data.length) {
            this.radio = res.data[0].pkId;
            this.getLinkInfo();
            this.findAreaItem();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findAreaItem() {
      this.loading2 = true;
      this.$api
        .findAreaItem({ areaId: this.radio })
        .then(res => {
          if (res.code === 200) {
            this.treeList2 = res.data;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading2 = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 获取工程细目
    getItemDetail() {
      this.loading2 = true;
      this.$api
        .searchItemsWorkArea({ fkOrgId: this.fkOrgId })
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.treeList = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 获取分项工程和工区的关联数据
    getLinkInfo() {
      this.$api.queryProject({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          this.linkList = res.data;
          this.noSet = true;
          let arr = res.data.filter(item => item.fkWorkAreaId === this.radio).map(item => item.fkSubitemId);
          this.$refs.tree.setCheckedKeys(arr);
          this.$nextTick(() => {
            this.noSet = false;
          });
        } else {
          this.$message.warning(res.code);
        }
      });
    },
    radioChange(e) {
      // clearTimeout(this.timer)
      setTimeout(() => {
        if (this.dialogType === 1) {
          this.findAreaItem();
        } else if (this.dialogType === 2) {
          this.loading3 = true;
          this.noSet = true;
          let arr = this.linkList.filter(item => item.fkWorkAreaId === this.radio).map(item => item.fkSubitemId);
          this.$refs.tree.setCheckedKeys(arr);
          this.$nextTick(() => {
            this.noSet = false;
            this.loading3 = false;
          });
        }
      }, 200);
    },
    // 关闭事件
    handleClose() {
      if (this.isChange) {
        this.$confirm("是否取消，取消后新增加的数据将不保存", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.$emit("update:workAreaDialog", false);
          this.isChange = false;
          this.dialogType = 1;
          this.areaList = [];
          this.treeList = [];
          this.linkList = [];
        });
      } else {
        this.$emit("update:workAreaDialog", false);
        this.isChange = false;
        this.dialogType = 1;
        this.areaList = [];
        this.treeList = [];
        this.linkList = [];
      }
    },
    handleClose2() {
      if (this.isChange) {
        this.$confirm("是否取消，取消后新增加的数据将不保存", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          // this.$emit("update:workAreaDialog", false);
          this.isChange = false;
          this.dialogType = 1;
          this.findAreaItem();
        });
      } else {
        // this.$emit("update:workAreaDialog", false);
        this.isChange = false;
        this.dialogType = 1;
        this.findAreaItem();
      }
    },
    // 保存按钮
    handleSave() {
      if (!this.areaList.length) {
        return this.$message.warning("未新增工区，无法设置分项工程");
      }
      if (!this.treeList.length) {
        return this.$message.warning("未设置分项表，无法绑定工区");
      }
      this.loading = true;
      this.$api
        .addProjectData({ reAreaItemAdds: this.linkList })
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.findAreaItem();
            this.dialogType = 1;
            this.isChange = false;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 打开新增模态框
    openAddDialog(type, item) {
      this.addType = type;
      if (type !== 2) {
        this.formData = { ...item };
      }
      this.addDialog = true;
    },
    // 关闭新增模态框
    closeAddDialog() {
      this.addDialog = false;
      this.formData = { areaName: "", remark: "" };
    },
    // 新增工区
    handleAdd() {
      if (!this.formData.areaName) {
        return this.$message.warning("工区名称不能为空");
      }
      if (this.areaList.filter(item => item.areaName == this.formData.areaName && item.pkId !== this.formData.pkId).length) {
        return this.$message.warning("工区名称不能重复");
      }
      this.loading = true;
      if (this.addType === 2) {
        this.$api
          .addWorkspace(this.formData)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getAreaList();
              this.closeAddDialog();
              // this.getLinkInfo();
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      } else if (this.addType === 3) {
        this.$api
          .updateWorkspace(this.formData)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getAreaList();
              this.closeAddDialog();
              // this.getLinkInfo();
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    // 删除工区
    handelDel(pkId) {
      this.$confirm("确定删除该工区信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.deleteWorkspace({ pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.radio = "";
            this.getAreaList();
            this.getItemDetail();
            this.getLinkInfo();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 选中树形复选框触发的事件
    checkChange(data, checked) {
      if (this.noSet) {
        return;
      }
      console.log(1);
      this.isChange = true;
      if (!this.radio) {
        return;
      }
      let arr2 = this.linkList.filter(item => item.fkWorkAreaId !== this.radio);
      let arr3 = this.$refs.tree.getCheckedKeys(true);
      this.linkList = [...arr2, ...arr3.map(item => ({ fkWorkAreaId: this.radio, fkSubitemId: item }))];
      return;
      if (checked) {
        let arr = this.linkList.filter(item => item.fkSubitemId === data.pkId);
        if (!arr.length) {
          this.linkList = [...this.linkList, { fkWorkAreaId: this.radio, fkSubitemId: data.pkId }];
        }
      } else {
        this.linkList = this.linkList.filter(item => item.fkSubitemId !== data.pkId);
      }
    },
    // 设置禁用
    disabledFn(data, node) {
      // let arr = this.linkList
      //   .filter(item => item.fkWorkAreaId !== this.radio)
      //   .map(item => item.fkSubitemId);
      if (this.treeShow.includes(data.pkId)) {
        this.$set(data, "disabled", true);
        return true;
      }
      if (data.isChooseByArea) {
        this.$set(data, "disabled", true);
        return true;
      }
      if (node.level < 3) {
        let bol = data.prodItemLists.every(item => item.disabled);
        if (bol) {
          this.$set(data, "disabled", true);
          return true;
        } else {
          this.$set(data, "disabled", false);
          return false;
        }
      }
      this.$set(data, "disabled", false);
      return false;
    },
    // 树形超过宽度提示
    onMouseEnter(str) {
      const tag = this.$refs[str];
      const parentWidth = tag.parentNode.offsetWidth; // 获取元素父级可视宽度
      const contentWidth = tag.offsetWidth; // 获取元素可视宽度
      this.isShowTooltip = contentWidth <= parentWidth;
    },
    handleEdit() {
      this.dialogType = 2;
      this.getItemDetail();
      this.getLinkInfo();
    }
  },
  watch: {
    workAreaDialog(val) {
      if (val) {
        this.findWorkAreaStats();
        // if(this.workAreaStart){
        //   this.getAreaList(true);
        // }
      }
    }
  },
  computed: {
    treeShow() {
      return this.linkList.filter(item => item.fkWorkAreaId !== this.radio).map(item => item.fkSubitemId);
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  }
};
</script>

<style lang="scss" scoped>
.notStart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
}
.main {
  display: flex;
  height: 500px;
  .left {
    overflow: auto;
    width: 200px;
    padding: 10px 4px;
    border: 1px solid #ccc;
    /deep/ .el-radio-button__inner {
      position: relative;
      padding: 9px 0px;
      width: 190px;
    }
    .overFlow {
      width: 120px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .del {
      position: absolute;
      cursor: pointer;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      color: red;
      z-index: 5;
    }
    .edit {
      position: absolute;
      cursor: pointer;
      top: 50%;
      right: 50px;
      transform: translateY(-50%);
      z-index: 5;
    }
    .check {
      position: absolute;
      cursor: pointer;
      top: 50%;
      right: 30px;
      transform: translateY(-50%);
      z-index: 5;
    }
  }
  .right {
    flex: 1;
    padding: 10px 5px;
    border: 1px solid #ccc;
    border-left: none;
    overflow: hidden;
    /deep/ .el-tree {
      height: 480px;
      overflow: auto;
      // 不可全选样式
      // .el-tree-node {
      //   .is-leaf + .el-checkbox .el-checkbox__inner {
      //     display: inline-block;
      //   }
      //   .el-checkbox .el-checkbox__inner {
      //     display: none;
      //   }
      // }
      .label1 {
        width: 600px;
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*禁⽌换⾏*/
        text-overflow: ellipsis; /*省略号*/
      }
      .label2 {
        width: 580px;
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*禁⽌换⾏*/
        text-overflow: ellipsis; /*省略号*/
      }
      .label3 {
        width: 560px;
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*禁⽌换⾏*/
        text-overflow: ellipsis; /*省略号*/
      }
      .label4 {
        width: 540px;
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*禁⽌换⾏*/
        text-overflow: ellipsis; /*省略号*/
      }
    }
  }
  // .el-tabs {
  //   .el-tabs__nav {
  //     .el-tree {
  //       padding: 10px;
  //     }
  //   }
  // }
}
.btnadd {
  margin-bottom: 10px;
}
.stopBtn {
  position: absolute;
  left: 40px;
}
.pb-20 {
  padding-bottom: 20px;
}
</style>
