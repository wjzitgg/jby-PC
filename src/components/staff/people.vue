<template>
  <div class="manage">
    <!-- 员工树形组建 -->
    <el-tree
      :data="tree"
      :props="defaultProps"
      :default-expand-all="true"
      @node-click="handleNodeClick"
      v-if="tree.length"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>
          <i class="iconfont iconduoren" v-if="data.type == '1'"></i>
          <i class="iconfont iconbumen" v-if="data.deptName !== null"></i>
          <i class="iconfont iconren1" v-if="data.deptName === null"></i>
          {{ node.label }}
        </span>
      </span>
    </el-tree>

    <div class="tabelsInfo-main empty" v-else>
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "people",
  data() {
    return {
      //  defaultProps: {
      //   children: 'sysUserList',
      //   label: 'userName'
      // }<span>暂无数据</span>
    };
  },
  props: {
    tree: {
      type: Array,
    },
    //树形结构绑定的树形字段
    defaultProps: {
      children: "sysUserList",
      label: "userName",
    },
  },
  methods: {
    handleNodeClick(item) {
      this.$emit("peopleInfo", item);
    },
  },
};
</script>

<style lang="scss" scoped>
.manage {
  // height: 100%;
  display: flex;
}
.people {
  width: 15%;
  height: 100%;
  // padding: 20px 60px 0 20px;
  padding-left: 20px;
  border: 1px solid #000;
}
.sheet {
  width: 100%;
  height: 100%;
  border: 1px solid yellow;
}
.iconfont {
  color: #796ea1;
}
.add-staff {
  float: right;
}
/deep/.el-tree {
  .el-tree__empty-text {
    padding-left: 80px;
  }
}
.empty {
  // text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ccc;
  img {
    width: 180px;
  }
  .iconfont {
    font-size: 100px;
  }
}
/deep/.el-tree {
  width: 100%;
  height: 100%;
  overflow: auto;
}
::-webkit-scrollbar {
  width: 5px;
  color: #fff;
  background-color: #fcfcfc;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}
// /deep/ .el-input__inner {
//   line-height: 0 !important;
// }
</style>