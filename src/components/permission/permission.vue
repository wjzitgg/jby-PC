<template>
  <div class="jurisdiction">
    <!-- <div class="head-list" :style="{width:`${wh}px`}"> -->
    <div class="head-list">
      <div class="stair">一级菜单</div>
      <div class="vfp">二级菜单</div>
      <div class="btns">按钮</div>
    </div>
    <div class="tree-list" ref="treeList">
      <!-- expand-on-click-node,是否在点击节点的时候展开或者收缩节点, 是否在点击节点的时候选中节点，check-on-click-node -->
      <elTree2 :data="showData" show-checkbox node-key="pkId" ref="tree" default-expand-all :default-checked-keys="checkList" :expand-on-click-node="false" :check-strictly="true" check-on-click-node :props="defaultProps" @check="clickDeal"> </elTree2>
      <div v-if="hd" class="tree-border"></div>
    </div>

    <!-- <div class="operate" v-if="typeStatus">
      <el-button type="primary" size="medium" class="save" @click="getchekcData" :disabled="btnDisabled">保存</el-button>
      <el-button size="medium" @click="callOff">取消</el-button>
    </div> -->
  </div>
</template>

<script>
import elTree2 from "./component/tree/src/tree.vue";
export default {
  components: { elTree2 },
  data() {
    return {
      tree: [],
      defaultProps: {
        children: "children",
        label: "menuName"
      },
      wh: "",
      hd: false
    };
  },
  props: {
    // 权限树形结构列表
    treeData: {
      type: Array
    },
    // 编辑的时候后端返回已选择的列表
    checkList: {
      type: Array
    },
    typeStatus: {
      type: Boolean,
      default: false
    },
    btnDisabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    treeData() {
      this.wh = this.$refs.tree.$el.children[1].offsetWidth;
      this.$nextTick(() => {
        if (this.$refs.tree.$el.offsetHeight > 500) {
          this.hd = true;
        }
      });
    }
  },
  computed: {
    showData() {
      const arr = this.treeData.map(item => ({
        ...item,
        children: item.children.map(item2 => ({
          ...item2,
          children: item2.children.length ? item2.children : [{ menuName: "" }]
        }))
      }));
      return arr;
    }
  },
  mounted() {
    this.wh = 726;
    // 表头对其
    // this.wh = document.getElementsByClassName('el-tree-node')[0].offsetWidth;
    // 保存
    setTimeout(() => {
      this.$nextTick(() => {
        // console.log("权限宽度",this.$refs.tree.$el.children[1].offsetWidth)
        // this.wh =  this.$refs.tree.$el.children[1].offsetWidth;
      });
    }, 300);

    // console.log(this.wh, wid)
  },
  methods: {
    // 保存
    getchekcData() {
      // this.$emit("getchekcData", this.$refs.tree.getCheckedKeys());
      console.log("=======AAAAAAAAAAAA==========");
      console.log(this.$refs.tree.getCheckedKeys());
      console.log("=======AAAAAAAAAAAA==========");
      return this.$refs.tree.getCheckedKeys();
    },
    // 取消
    callOff() {
      this.$emit("callOff", "");
    },
    clickDeal(currentObj, treeStatus) {
      console.log(currentObj, treeStatus);
      // 用于：父子节点严格互不关联时，父节点勾选变化时通知子节点同步变化，实现单向关联。
      const selected = treeStatus.checkedKeys.indexOf(currentObj.pkId); // -1未选中
      // 选中
      if (selected !== -1) {
        // alert(1)
        // 子节点只要被选中父节点就被选中
        this.selectedParent(currentObj);
        // 统一处理子节点为相同的勾选状态
        this.uniteChildSame(currentObj, true);
        console.log(currentObj);
      } else {
        //  alert(0)
        // 未选中 处理子节点全部未选中
        console.log("Xxxxxxxxxxxxx");
        // console.log(this.showData)
        console.log(currentObj);
        console.log("Xxxxxxxxxxxxx");
        if (currentObj.children.length !== 0) {
          this.uniteChildSame(currentObj, false);
        }
        if (currentObj.menuType == 1) {
          this.showData.forEach(item => {
            if (item.pkId == currentObj.parentId) {
              var states = true;
              let arr = this.$refs.tree.getCheckedKeys();
              item.children.forEach(e => {
                arr.forEach(s => {
                  if (e.pkId == s) {
                    states = false;
                  }
                });
              });
              if (states) {
                this.uniteChildSame(item, false);
              }
              // console.log(this.$refs.tree.getCheckedKeys())
              // console.log("Xxxxxxxxxxxxxxxxxxxxxxxxxx")
            }
          });
        }
      }
    },
    // 统一处理子节点为相同的勾选状态
    uniteChildSame(treeList, isSelected) {
      this.$refs.tree.setChecked(treeList.pkId, isSelected);
      if (treeList.children) {
        for (let i = 0; i < treeList.children.length; i++) {
          this.uniteChildSame(treeList.children[i], isSelected);
        }
      }
    },
    // 统一处理父节点为选中
    selectedParent(currentObj) {
      const currentNode = this.$refs.tree.getNode(currentObj);
      if (currentNode && currentNode.parent.key !== undefined) {
        this.$refs.tree.setChecked(currentNode.parent, true);
        this.selectedParent(currentNode.parent);
      }
    },
    scrollTo() {
      this.$nextTick(() => {
        this.$refs.treeList.scrollTo(0, 0);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.jurisdiction {
  overflow: hidden;
  padding-left: 60px;
  margin-bottom: 2px;
}

.head-list {
  background-color: #f1f6ff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 725px;
  height: 40px;
  border: 1px solid #dfe3f3;
}

/deep/ table {
  border-collapse: collapse !important;
}

/deep/ .el-tree {
  text-align: center;
}

/deep/ .el-tree-node {
  display: flex;
  border: 1px solid #dfe3f3;
  // border-top: none;
  width: fit-content;
  margin: -1px 0;
}

/deep/ .el-tree-node__content {
  width: 240px;
  height: auto;
  //  padding-left: 20px !important;
  padding: 5px 20px !important;
}

.operate {
  padding: 20px;
  text-align: center;
}

.save {
  margin-right: 50px;
}

// 处理超出滚动
.tree-list {
  height: 500px;
  overflow-y: auto;
}
.tree-list::-webkit-scrollbar {
  width: 30px;
}

.tree-list::-webkit-scrollbar-thumb {
  background: #7c7c7c;
  border-radius: 25px;
}

/deep/ .el-tree-node__content > .el-tree-node__expand-icon {
  display: none;
}

/deep/ .no-menuName {
  height: 31px;
}

/deep/ .set-margin {
  margin-right: -1px;
}

.tree-border {
  position: absolute;
  bottom: 0px;
  width: 725px;
  height: 1px;
  background-color: #dfe3f3;
}
</style>
