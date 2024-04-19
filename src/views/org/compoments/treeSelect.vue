<template>
  <div style="position: relative;">
    <div @click="changeTreeShow" style="position: relative;">
      <!-- clearable @clear="clearable" -->
      <el-input class="input" size="mini" :disabled="disabled" :value="names">
        <i slot="suffix" class="el-input__icon " :class="showTree ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" style="position: absolute; right: 0;">
          <div @click.stop="changeTreeShow" style="width: 100%;height: 100%;position: absolute;top: 0;z-index: 9999"></div>
        </i>
      </el-input>
    </div>
    <div class="treeBox" v-show="showTree">
      <el-tree :data="treeList" @node-expand="nodeExpand" :check-strictly="false"  @check="checkChange" default-expand-all :show-checkbox="showCheckbox" :props="defaultProps" :expand-on-click-node="false" ref="tree" :node-key="nodeKey" :filter-node-method="filterNode" v-if="showCheckbox">
        <div slot-scope="{ node,data }" :title="node.label" class="tree-items">
            <span :class="{'gery':!data.deptName&&!data.orgName&&!data.enableStatus}">{{ node.label }}</span>
        </div>
      </el-tree>
      <el-tree :data="treeList" @node-expand="nodeExpand"  :check-strictly="true" @check="checkChange" default-expand-all :show-checkbox="showCheckbox" :props="defaultProps" :expand-on-click-node="false" ref="tree" :node-key="nodeKey" :filter-node-method="filterNode" @node-click="nodeClick" v-else>
        <div slot-scope="{ node,data }" :title="node.label" class="tree-items">
          <span :class="{'gery':!data.deptName&&!data.orgName&&!data.enableStatus}">{{ node.label }}</span>
        </div>
      </el-tree>
    </div>
    <!-- <div class="placeholder" @click.stop="changeTreeShow" v-if="!!placeholder && !proIds.length">{{ placeholder }}</div> -->
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
    defaultProps: {
      type: Object,
      default: () => {
        return {
          children: "children",
          label: "label"
        };
      }
    },
    treeList: {
      type: Array
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    checkedList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    nodeKey: {
      type: String,
      default: "id"
    }
  },
  created() {
    // window.addEventListener("click", event => {
    //   if (this.showTree) {
    //     this.showTree = false;
    //   }
    // });
  },
  watch: {
    checkedList: {
      deep: true,
      handler(val) {
        if (val.length) {
          this.$refs.tree.setCheckedKeys(val);
          this.proIds = this.$refs.tree.getCheckedNodes(true);
        }
      }
    },
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    proIds:{
      deep:true,
      handler(val){
        console.log(val,val.map(item=>item[this.defaultProps.label]));
        this.names=val.map(item=>item[this.defaultProps.label]).join(',').length==0 && this.disabled?"无":val.map(item=>item[this.defaultProps.label]).join(',')

      }
    },
  },
  data() {
    return {
      showTree: false,
      proIds: [],
      filterText: "",
      names:""
    };
  },
  methods: {
    nodeExpand(data,node){
      if(node.level==1){
        this.expandNodes(node)
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
    closeTag() {
      this.proIds.splice(0, 1);
      this.$refs.tree.setCheckedNodes(this.proIds);
      this.$emit("selectIds", this.$refs.tree.getCheckedKeys(true), this.proIds);
    },
    openTree() {
      console.log(this.showTree);
      // 打开下拉的树形结构
      this.showTree = true;
    },
    checkChange(data, checked) {
      // this.proIds = this.$refs.tree.getCheckedNodes(true);
      // this.$emit("selectIds", this.$refs.tree.getCheckedKeys(true), this.proIds);
      // console.log(data);
      // this.showTree = false;
      // if (data.pkId == this.proIds.pkId) {
      //   this.$refs.tree.setCheckedKeys([]);
      //   this.proIds = {};
      //   this.$emit("selectIds", this.$refs.tree.getCheckedKeys(), this.proIds);
      //   return;
      // }
      this.proIds = this.$refs.tree.getCheckedNodes(true).filter(item=>!item.deptName&&!item.orgName);
      // if (checked) {
      //   this.$refs.tree.setCheckedNodes([data]);
      //   this.$emit("selectIds", this.$refs.tree.getCheckedKeys(), this.proIds);
      // }
      this.$emit("selectIds", this.$refs.tree.getCheckedKeys(true), this.proIds);
    },
    setTreeSelect(ids) {
      this.$refs.tree.setCheckedKeys(ids);
      console.log(ids);
      setTimeout(()=>{
        this.proIds = this.$refs.tree.getCheckedNodes(true);
      },200)
    },

    // 节点被点击的事件共三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身。
    nodeClick(item, node, data) {
      this.checkChange(item, node);
    },
    // 节点过滤
    filterNode(value, data) {
      if (!value) return true;
      return data.itemName.indexOf(value) !== -1;
    },
    // 清空
    clearable() {
      this.proIds=[]
      this.$refs.tree.setCheckedKeys([]);
      // this.checkChange(this.proIds);
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
    background-color: #fff;
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
.gery{
  color: #b2b2c8;
}
</style>
