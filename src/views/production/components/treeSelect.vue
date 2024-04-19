<template>
  <div style="position: relative;">
    <div @click="changeTreeShow" style="position: relative;">
      <el-input class="input" size="mini" :disabled="disabled">
        <i slot="suffix" class="el-input__icon " :class="showTree ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" style="position: relative;">
          <div @click.stop="changeTreeShow" style="width: 100%;height: 100%;position: absolute;top: 0;z-index: 9999"></div>
        </i>
      </el-input>
      <div class="select-tags" v-if="!!proIds.length">
        <el-tag class="sel-tag" size="mini" closable type="info" @close="closeTag">
          {{ proIds[0][defaultProps.label] }}
        </el-tag>
        <el-tag v-if="proIds.length - 1 > 0" size="mini" class="sel-tag" type="info"> +{{ proIds.length - 1 }} </el-tag>
      </div>
    </div>
    <div class="treeBox" v-show="showTree">
      <el-tree @node-expand="nodeExpand" :data="treeList" @check="checkChange" default-expand-all show-checkbox :props="defaultProps" :expand-on-click-node="false" ref="tree" :node-key="nodeKey">
        <div slot-scope="{ node }" :title="node.label" class="tree-items">
          {{ node.label }}
        </div>
      </el-tree>
    </div>
    <div class="placeholder" @click.stop="changeTreeShow" v-if="!!placeholder && !proIds.length">{{ placeholder }}</div>
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
    window.addEventListener("click", event => {
      if (this.showTree) {
        this.showTree = false;
      }
    });
  },
  watch: {
    checkedList: {
      deep: true,
      handler(val) {
        if (!!val.length) {
          this.$refs.tree.setCheckedKeys(val);
          this.proIds = this.$refs.tree.getCheckedNodes(true);
        }
      }
    }
  },
  data() {
    return {
      showTree: false,
      proIds: []
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
          //动态切换树形组件的显示与否
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
      //打开下拉的树形结构
      this.showTree = true;
    },
    checkChange() {
      this.proIds = this.$refs.tree.getCheckedNodes(true);
      this.$emit("selectIds", this.$refs.tree.getCheckedKeys(true), this.proIds);
    },
    setTreeSelect(ids) {
      this.$refs.tree.setCheckedKeys(ids);
      this.proIds = this.$refs.tree.getCheckedNodes(true);
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
</style>
