<template>
  <div style="position: relative;" @click.stop>
    <div @click="changeTreeShow" style="position: relative;">
      <el-input class="input" size="mini" :disabled="disabled" :value="proIds[defaultProps.label]" :placeholder="placeholder">
        <i slot="suffix" class="el-input__icon " :class="showTree ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" style="position: absolute; right: 0;">
          <div @click.stop="changeTreeShow" style="width: 100%;height: 100%;position: absolute;top: 0;z-index: 9999"></div>
        </i>
      </el-input>
    </div>
    <div class="treeBox" v-show="showTree">
      <el-input v-model="filterText" size="mini" clearable class="text-select" v-if="!!showTreeList.length" @focus.stop="openTree">
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <el-tree :data="showTreeList" :check-strictly="true" @node-expand="nodeExpand" default-expand-all :props="defaultProps" :expand-on-click-node="false" ref="protree" :node-key="nodeKey" :filter-node-method="filterNode" @node-click="nodeClick">
        <div slot-scope="{ node }" :title="node.label" class="tree-items">
          {{ node.label }}
        </div>
      </el-tree>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    treeWidth: {
      default: "100%"
    },
    placeholder: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    hasAll: {
      type: Boolean,
      default: false
    }
  },
  created() {
    window.addEventListener("click", event => {
      if (this.showTree) {
        this.showTree = false;
      }
    });
  },
  mounted() {
    this.getProjectTreeByOrgType();
  },
  computed: {
    showTreeList() {
      if (this.hasAll) {
        return [{ [this.defaultProps.label]: "全部", [this.nodeKey]: "" }, ...this.treeList];
      } else {
        return this.treeList;
      }
    },
    nowClickPro(){
      return sessionStorage.getItem("saveProId")?JSON.parse(sessionStorage.getItem("saveProId")):[]
    }
  },
  watch: {
    showTree(val) {
      if (!val) {
        this.filterText = "";
      }
    },
    filterText(val) {
      this.$refs.protree.filter(val);
    },
    checkValue() {
      this.getClickNode();
    }
  },
  data() {
    return {
      showTree: false,
      proIds: {},
      filterText: "",
      treeList: [],
      checkValue: "",
      defaultProps: {
        children: "children",
        label: "projectName"
      },
      nodeKey: "pkId"
    };
  },
  methods: {
    getProjectTreeByOrgType() {
      this.$api.getProjectTreeByOrgType().then(res => {
        console.log("树形项目", res);
        if (res.code === 200) {
          this.treeList = res.data;
          if(!this.hasAll){
            if (this.treeList.length) {
              let arr = [];
              let checkNode = {};
              console.log('缓存',this.nowClickPro);
              if(!this.nowClickPro.length){
                if (this.treeList[0].treeType == 1) {
                  if(this.treeList[0].children[0].children.length){
                    checkNode = this.treeList[0].children[0].children[0];
                    this.checkValue = checkNode.pkId;
                    arr = [this.treeList[0].children[0].pkId, this.checkValue];
                  }else{
                    checkNode = this.treeList[0].children[0];
                    this.checkValue = checkNode.pkId;
                    arr = [this.checkValue];
                  }
                } else if (this.treeList[0].treeType == 2) {
                  checkNode = this.treeList[0].children[0];
                  this.checkValue = checkNode.pkId;
                  arr = [this.treeList[0].pkId, this.checkValue];
                } else {
                  checkNode = this.treeList[0];
                  this.checkValue = checkNode.pkId;
                  arr = [this.checkValue];
                }
                sessionStorage.setItem("saveProId",JSON.stringify(arr))
              }else{
                arr = [...this.nowClickPro]
                this.checkValue = arr[arr.length - 1]
              }
              this.getClickNode();
              this.$emit("selectIds", arr,this.proIds,true);
            }else{
               this.$emit("selectIds", [],{},true);
               this.getClickNode();
            }
          }else{
             this.$emit("selectIds", [""],{});
             this.getClickNode();
          }
          
          console.log('筛选好',this.proIds);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
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
    getClickNode() {
      if (this.hasAll && !this.checkValue) {
        this.proIds = { [this.defaultProps.label]: "全部", [this.nodeKey]: "" };
        return;
      }
      if (this.checkValue == this.proIds[this.nodeKey]) {
        return;
      }
      for (let i = 0; i < this.showTreeList.length; i++) {
        const item = this.showTreeList[i];
        if (this.checkValue == item[this.nodeKey]) {
          this.proIds = item;
          return;
        }
        if (item[this.defaultProps.children] && item[this.defaultProps.children].length) {
          for (let j = 0; j < item[this.defaultProps.children].length; j++) {
            const item2 = item[this.defaultProps.children][j];
            if (this.checkValue == item2[this.nodeKey]) {
              this.proIds = item2;
              return;
            }
            if (item2[this.defaultProps.children] && item2[this.defaultProps.children].length) {
              for (let k = 0; k < item2[this.defaultProps.children].length; k++) {
                const item3 = item2[this.defaultProps.children][k];
                if (this.checkValue == item3[this.nodeKey]) {
                  this.proIds = item3;
                  return;
                }
              }
            }
          }
        }
      }
    },
    changeTreeShow() {
      if (this.disabled) {
        return;
      }
      setTimeout(() => {
        this.$nextTick(() => {
          // 动态切换树形组件的显示与否
          this.showTree = !this.showTree;
        });
      });
    },
    openTree() {
      console.log(this.showTree);
      // 打开下拉的树形结构
      this.showTree = true;
    },
    // 节点被点击的事件共三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身。
    nodeClick(item, node, data) {
      if (item.children&&item.children.length) return;
      if(item.pkId==this.checkValue) {
        this.showTree = false;
        return
      }
      this.proIds = item;
      let arr = [];
      if (node.level == 1) {
        arr = [item[this.nodeKey]];
      } else {
        arr = [node.parent.data[this.nodeKey], item[this.nodeKey]];
      }
      this.checkValue = item[this.nodeKey]
      if(!this.hasAll){
        sessionStorage.setItem("saveProId",JSON.stringify(arr))
      }
      this.$emit("selectIds", arr, this.proIds);
      this.showTree = false;
    },
    // 节点过滤
    filterNode(value, data) {
      if (!value) return true;
      if (!this.hasAll) {
        return (!data.children||!data.children.length) && data[this.defaultProps.label].indexOf(value) !== -1;
      } else {
        return ((!data.children||!data.children.length)&& data[this.defaultProps.label].indexOf(value) !== -1) || (!data.children && !data[this.nodeKey] && data[this.defaultProps.label] === "全部");
      }
    },
    // 清空
    clearable() {
      if (this.hasAll) {
        this.proIds = { [this.defaultProps.label]: "全部", [this.nodeKey]: "" };
      } else {
        this.proIds = "";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.input {
  position: relative;
  caret-color: transparent;

  //   z-index: -1;
  &:hover {
    cursor: pointer;
  }
  /deep/ input {
    overflow: hidden;
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
    padding-right: 40px !important;
  }
}
/deep/ .el-input__suffix {
  .el-icon-circle-close:before {
    font-size: 16px;
    position: absolute;
    right: 0;
    top: 5px;
    // background-color: #fff;
    height: 20px;
    width: 30px;
    color: rgb(105, 175, 154);
    z-index: 99999;
  }
}

.treeBox {
  max-height: 300px;
  overflow: auto;
  position: absolute;
  z-index: 999;
  width: 100%;
  border-radius: 0 0 8px 8px;
  border: 1px solid #e0e3e9;
  border-top: 0;
  background-color: #fff;
  //   margin-top: -4px;
  /deep/ .tree-items {
    width: 70%;
    overflow: hidden;
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
}
.select-tags {
  position: absolute;
  width: 100%;
  left: 10px;
  top: 50%;
  transform: translateY(-35%);
  z-index: 1000;
  .sel-tag {
    max-width: 100px;
    overflow: hidden;
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
}
.placeholder {
  position: absolute;
  cursor: pointer;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #b1b1b3;
}
::-webkit-scrollbar {
  width: 5px;
  color: #fff;
  background-color: #fcfcfc;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}
// .text-select {
//   width: 100px;
//   height: 20px;
//   position: absolute;
//   border: 1px solid #000;
//   top: 0;
//   left: 0;
//   z-index: 9999;
// }
</style>
