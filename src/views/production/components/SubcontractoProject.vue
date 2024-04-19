<template>
  <div>
    <el-dialog :close-on-press-escape="false" title="分包单位工区划分" :visible="subProDialog" @close="handleClose" width="60%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="main dialog-form">
        <div class="left">
          <!-- 头部搜索框 -->
          <div class="left-header">
            <el-form :inline="true">
              <el-form-item label="分包单位名称">
                <el-input size="mini" class="sub-packaging_unit" v-model="inpData.customName" maxlength="50"></el-input>
              </el-form-item>
              <el-form-item label="联系人">
                <el-input size="mini" class="contact" v-model="inpData.linkMan" maxlength="25"></el-input>
              </el-form-item>
              <el-form-item label="手机号码">
                 <!-- oninput="if(value.length>11)value=value.slice(0, 11)" type="number" -->
                <el-input size="mini" class="phonenumber" @input="inpData.linkPhone = $limitPhone2(inpData.linkPhone)" maxlength="11" v-model="inpData.linkPhone"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button size="mini" class="el-button-primary_search" icon="el-icon-search" @click="btnSearch">查询</el-button>
              </el-form-item>
              <!-- <el-form-item>
                <el-button size="mini" class="el-button-primary_reset">重置</el-button>
              </el-form-item> -->
            </el-form>
          </div>
          <!-- 表格 -->
          <div class="left-main table-data">
            <el-table border style="width: 100%" height="100%" :data="tableData" @row-click="rowClick" :row-style="selectRowStyle" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
              <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
              <el-table-column label="分包单位名称" align="center" prop="customName"> </el-table-column>
              <el-table-column label="联系人" align="center" prop="linkMan" show-overflow-tooltip> </el-table-column>
              <el-table-column label="手机号码" align="center" prop="linkPhone" show-overflow-tooltip> </el-table-column>
              <el-table-column label="管理工区" align="center" prop="areaName" show-overflow-tooltip> </el-table-column>

              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>

            <div class="pagination">
              <!-- 分页组件 -->
              <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
            </div>
          </div>
        </div>
        <div class="right">
          <div class="right-header">{{ nowSub }}</div>
          <div class="right-main">
            <!-- :check-strictly="true" -->
            <el-tree :data="treeList" default-expand-all show-checkbox :props="defaultProps" @node-expand="nodeExpand" node-key="pkId" ref="nodeTree" v-show="dialogType === 2" :expand-on-click-node="false">
              <span slot-scope="{ node }">
                <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                  <div class="label" @mouseenter="onMouseEnter(`label${String(node.id)}`)">
                    <span :ref="'label' + String(node.id)">{{ node.label }}</span>
                  </div>
                </el-tooltip>
              </span>
            </el-tree>
            <el-tree @node-expand="nodeExpand" :data="treeList2" default-expand-all :props="defaultProps2" node-key="pkId" v-show="dialogType === 1">
              <span slot-scope="{ node }">
                <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                  <div class="label" @mouseenter="onMouseEnter(`label2${String(node.id)}`)">
                    <span :ref="'label2' + String(node.id)">{{ node.label }}</span>
                  </div>
                </el-tooltip>
              </span>
            </el-tree>
          </div>
          <div class="right-footer" v-if="dialogType === 2">
            <el-button class="footerbtn_1" @click="handleClose">取 消</el-button>
            <el-button size="mini" type="primary" class="editor" @click="handleSet" :disabled="!treeList.length || !nowClickId">保 存</el-button>
          </div>
        </div>
      </div>

      <span slot="footer" v-if="dialogType === 1">
        <el-button class="footerbtn" @click="handleClose">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="handleEdit" v-has="'production:setting:taskEdit'">编 辑</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tablePaging from "@/components/tablePaging.vue";
import virtualNodeTree from "../../../components/virtualNodeTree/tree.vue";
export default {
  components: { tablePaging, virtualNodeTree },
  props: {
    subProDialog: {
      type: Boolean,
      default: false
    },
    orgType: {
      type: Number
    },
    fkOrgId: ""
  },
  data() {
    return {
      dialogType: 1, //1为预览，2为编辑
      tableData: [],
      treeList: [],
      treeList2: [],
      inpData: {
        customName: "",
        linkMan: "",
        linkPhone: "",
        areaName: ""
      },
      searchData: {
        customName: "",
        linkMan: "",
        linkPhone: "",
        areaName: ""
      },
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      nowSub: "",
      nowClickId: "",
      defaultProps: {
        label: "name",
        children: "children",
        disabled: this.disabledFn
      },
      defaultProps2: {
        children: "children",
        label: "name"
      },
      allCheckedArr: [],
      loading: false,
      isShowTooltip: true,
      nowCheckedList: [],
      disableList: [],
      isChange: false
    };
  },
  methods: {
    nodeExpand(data, node) {
      console.log(node);
      if (node.level == 2) {
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
    // 获取分包单位集
    getSubList() {
      this.$api
        .findCustomByOrgId({
          ...this.searchData,
          ...this.page,
          fkOrgId: this.fkOrgId
        })
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            if (this.tableData.length != 0) {
              this.rowClicks({
                userName: this.tableData[0].linkMan,
                pkId: this.tableData[0].pkId
              });
            } else {
              this.nowSub = "";
              this.nowClickId = "";
              this.treeList2 = [];
              // this.$refs.nodeTree.setCheckedKeys([]);
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
    },
    findCustomAreaItemView() {
      this.$api.findCustomAreaItemView({ customId: this.nowClickId }).then(res => {
        if (res.code === 200) {
          this.treeList2 = res.data;
          this.treeList2.forEach(item => {
            if (item.isRemove == 0) {
              item.disabled = true;
            }
            if (item.children != null && item.children.length) {
              item.children.forEach(e => {
                if (e.isRemove == 0) {
                  e.disabled = true;
                }
                if (e.children != null && e.children.length) {
                  e.children.forEach(s => {
                    if (s.isRemove == 0) {
                      s.disabled = true;
                    }
                    if (s.children != null && s.children.length) {
                      s.children.forEach(i => {
                        if (i.isRemove == 0) {
                          i.disabled = true;
                        }
                      });
                    }
                  });
                }
              });
            }
          });
          console.log(disabled);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取树形分项工程表
    getItemList() {
      this.$api.searchCustomArea({customId:this.nowClickId, fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          this.treeList = res.data;
          this.setDisabled();
          this.$refs.nodeTree.setCheckedKeys(this.nowCheckedList);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分包单位与工区的联系
    getSubLinkArea() {
      this.$api.querySubcontractor({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          this.allCheckedArr = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 关闭弹框
    handleClose() {
      this.$refs.nodeTree.setCheckedKeys([]);
      this.$emit("update:subProDialog", false);
      this.nowClickId = "";
      this.nowSub = "";
      this.dialogType = 1;
    },
    // 设置按钮
    handleSet() {
      let itemIds = this.$refs.nodeTree
        .getCheckedNodes(true, false)
        .filter(item => item.grade === 3)
        .map(item => item.pkId);
      this.loading = true;
      this.$api
        .addSubcontractor({
          customAreaItems: [
            {
              fkCustomId: this.nowClickId,
              itemIds
            }
          ]
        })
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.getSubList();
            // this.getItemList();
            this.getSubLinkArea();
            this.dialogType = 1;
            // this.findCustomAreaItemView()
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 表单点击事件
    rowClick(row) {
      // this.nowSub = row.customName;
      if (this.dialogType === 1) {
        this.nowSub = row.areaName;
        this.nowClickId = row.pkId;
        this.findCustomAreaItemView();
      } else if (this.dialogType === 2) {
        let arr = this.allCheckedArr.filter(item => item.fkCustomId === this.nowClickId).map(item => item.fkSubitemId);
        let fn = () => {
          this.nowSub = row.areaName;
          this.nowClickId = row.pkId;
          this.nowCheckedList = this.allCheckedArr.filter(item => item.fkCustomId === row.pkId).map(item => item.fkSubitemId);
          this.disableList = this.allCheckedArr.filter(item => item.fkCustomId !== row.pkId).map(item => item.fkSubitemId);
          this.getItemList()
          // this.setDisabled();
          // this.$refs.nodeTree.setCheckedKeys(this.nowCheckedList);
        };
        let itemIds = this.$refs.nodeTree
          .getCheckedNodes(true, false)
          .filter(item => item.grade === 3)
          .map(item => item.pkId);
        let arr2 = itemIds.filter(item => !arr.includes(item));
        let arr3 = arr.filter(item => !itemIds.includes(item));
        if (arr2.length || arr3.length) {
          this.$confirm("有未保存变动数据，是否保存？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              this.loading = true;
              this.$api
                .addSubcontractor({ customAreaItems: [{ fkCustomId: this.nowClickId, itemIds }] })
                .then(res => {
                  if (res.code === 200) {
                    this.$api.querySubcontractor({ fkOrgId: this.fkOrgId }).then(res => {
                      if (res.code === 200) {
                        this.allCheckedArr = res.data;
                        fn();
                      } else {
                        this.$message.warning(res.msg);
                      }
                    });
                  } else {
                    this.$message.warning(res.msg);
                  }
                  this.loading = false;
                })
                .catch(err => {
                  this.loading = false;
                });
            })
            .catch(() => {
              fn();
            });
        } else {
          fn();
        }
      }
    },

    //
    rowClicks(row) {
      this.nowSub = row.customName;
      this.nowClickId = row.pkId;
      if (this.dialogType === 1) {
        this.findCustomAreaItemView();
      } else if (this.dialogType === 2) {
        this.nowCheckedList = this.allCheckedArr.filter(item => item.fkCustomId === row.pkId).map(item => item.fkSubitemId);
        this.disableList = this.allCheckedArr.filter(item => item.fkCustomId !== row.pkId).map(item => item.fkSubitemId);
        this.getItemList()
      }
    },
    // 选中添加样式
    selectRowStyle({ row, rowIndex }) {
      if (row.pkId === this.nowClickId) {
        return { "background-color": "#81d3f8 !important" };
      }
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = this.inpData;
      this.nowClickId = "";
      //
      if (this.inpData.linkPhone != "") {
        let myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!myreg.test(this.inpData.linkPhone)) {
          this.$message({ message: "请输入正确的手机号码", type: "error" });
          return;
        }
        this.getSubList();
      } else {
        this.getSubList();
      }
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getSubList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getSubList();
    },
    // 树形禁用
    disabledFn(data) {
      if (this.orgType == 4) {
        return true;
      }
      if (data.disabled) {
        return true;
      }
      if (!this.nowClickId) {
        if (this.allCheckedArr.map(item => item.fkSubitemId).includes(data.pkId)) return true;
      } else {
        if (this.disableList.includes(data.pkId)) {
          return true;
        }
      }
      if (!data.isRemove) {
        return true;
      }
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
      this.nowCheckedList = this.allCheckedArr.filter(item => item.fkCustomId === this.nowClickId).map(item => item.fkSubitemId);
      this.disableList = this.allCheckedArr.filter(item => item.fkCustomId !== this.nowClickId).map(item => item.fkSubitemId);
      this.getItemList()
      // this.setDisabled();
      // this.$refs.nodeTree.setCheckedKeys(this.nowCheckedList);
    },
    setDisabled() {
      this.treeList.forEach(item => {
        let num1 = 0;
        item.children.forEach(item2 => {
          let num2 = 0;
          item2.children.forEach(item3 => {
            let num3 = item3.children.filter(item4 => this.disableList.includes(item4.pkId)||item4.isRemove==0).length;
            if (num3 == item3.children.length) {
              num2 = num2 + 1;
              item3.disabled = true;
            } else {
              item3.disabled = false;
            }
          });
          if (num2 == item2.children.length) {
            num1 = num1 + 1;
            item2.disabled = true;
          } else {
            item2.disabled = false;
          }
        });
        if (num1 == item.children.length) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
    }
  },
  watch: {
    subProDialog(val) {
      if (val) {
        this.getSubList();
        // this.getItemList();
        this.getSubLinkArea();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-data {
  /deep/ .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
    // background: rgba(227, 235, 255, 1);
    background-color: transparent;
  }
  /deep/ .el-table__cell {
    // background: rgba(227, 235, 255, 1);
    background-color: transparent;
  }
}

.main {
  width: 1200px;
  display: flex;
  height: 490px;

  .left {
    width: 66.6%;
    .left-main {
      height: 400px;
    }
  }
  .right {
    width: 320px;
    height: 378px;
    border: 1px solid #ccc;
    margin-top: 50px;
    .right-header {
      height: 63px;
      line-height: 63px;
      padding-left: 10px;
      border-bottom: 1px solid #ccc;
    }
    .right-main {
      height: 80%;
      overflow: auto;
      // border-bottom: 1px solid #ccc;
      /deep/ .el-tree {
        width: 100%;
        overflow: auto;
        height: 400;
        // 不可全选样式
        // .el-tree-node {
        //   .is-leaf + .el-checkbox .el-checkbox__inner {
        //     display: inline-block;
        //   }
        //   .el-checkbox .el-checkbox__inner {
        //     display: none;
        //   }
        // }
        .label {
          width: 260px;
          overflow: hidden; /*超出部分隐藏*/
          white-space: nowrap; /*禁⽌换⾏*/
          text-overflow: ellipsis; /*省略号*/
        }
      }
    }
    .right-footer {
      text-align: center;
      margin-top: 3px;
    }
  }
  /deep/ .el-table__body tr:hover > td {
    background-color: #81d3f8 !important;
    // background: rgba(227, 235, 255, 1)!important;
  }
  /deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    // background-color: #409eff !important;
    background: rgba(227, 235, 255, 1) !important;
    border-color: #409eff !important;
  }
  /deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
    border-color: #ffffff;
  }
}
.footerbtn {
  margin-left: 880px;
}
.el-button-primary_reset {
  width: 80px;
  height: 28px;
  opacity: 1;
  border-radius: 2px;
  background: rgba(255, 255, 255, 1);
  border: 1px solid rgba(238, 238, 238, 1);
}
.el-button-primary_search {
  width: 120px;
  height: 28px;
  opacity: 1;
  border-radius: 2px;
  background: rgba(42, 130, 228, 0.1);
  border: 1px solid rgba(42, 130, 228, 0.4);
}

.sub-packaging_unit {
  width: 160px;
  height: 28px;
  opacity: 1;
  border-radius: 2px;
  background: rgba(255, 255, 255, 1);
}
.contact {
  width: 160px;
  height: 28px;
  opacity: 1;
  border-radius: 2px;
  background: rgba(255, 255, 255, 1);
}
.phonenumber {
  width: 160px;
  height: 28px;
  opacity: 1;
  border-radius: 2px;
  background: rgba(255, 255, 255, 1);
}
.left-header {
  width: 1000px;
  display: flex;
}
.left-main {
  margin-top: -28px;
}
.editor {
  width: 150px;
  height: 40px;
  margin-top: 20px;
  opacity: 1;
  border-radius: 2px;
  background: rgba(24, 144, 255, 1);
}
.footerbtn_1 {
  width: 110px;
  height: 40px;
  opacity: 1;
  border-radius: 2px;
  background: rgba(238, 238, 238, 1);
}
</style>
