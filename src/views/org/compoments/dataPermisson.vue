<template>
  <div class="dataPer">
    <div class="left">
      <div class="header">可查看数据</div>
      <div class="content">
        <div class="title">单价和金额权限</div>
        <div class="permisson">
          <!-- :default-checked-keys="treeCheckList" -->
          <elTree2 :data="showData" class="perTree" show-checkbox node-key="pkId" ref="pertree" default-expand-all  :expand-on-click-node="false" :check-strictly="true" check-on-click-node :props="defaultProps"> </elTree2>
        </div>
      </div>
    </div>
    <div class="right" v-if="user.orgType !== 4 && user.manageDataStatus ==1">
      <div class="header">可管理数据</div>
      <div class="content">
        <div class="title">查看和管理他人数据</div>
        <div class="radios">
          <el-radio-group v-model="radio" :disabled="disabled">
            <el-radio :label="1">仅查看</el-radio>
            <el-radio :label="2">可编辑</el-radio>
          </el-radio-group>
        </div>
        <el-form label-width="80px">
          <el-form-item label="数据权限">
            <treeSelect ref="peoTree" nodeKey="pkId" :defaultProps="defaultProps2" :treeList="deptList" @selectIds="selectIds" :disabled="disabled"></treeSelect>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import elTree2 from "../../../components/permission/component/tree/src/tree.vue"; // 菜单权限组建
import treeSelect from "./treeSelect.vue";
export default {
  components: { elTree2, treeSelect },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    showData() {
      const arr = this.treeData.map(item => ({
        ...item,
        child: item.child.map(item2 => ({
          ...item2,
          child: item2.child.length ? item2.child : [{ menuName: "" }]
        }))
      }));
      return arr;
    }
  },
  props: {
    // 权限树形结构列表
    treeData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    treeCheckList: {
      type: Array
    },
    manageAuthorize: {
      type: Object,
      default: () => {
        return { type: "", userId: [] };
      }
    }
  },
  data() {
    return {
      checkList: [],
      radio: 1,
      permission: [],
      deptList: [],
      defaultProps:{
        children: "child",
        label: "menuName",
        disabled:this.treeDisabled
      },
      defaultProps2: {
        children: "children",
        label: "aliasName"
      },
      userId:[]
    };
  },
  mounted() {
    this.getOrgDeptAndPeo();
  },
  methods: {
    treeDisabled(){
        return this.disabled
    },
    getchekcData() {
      if(![0,4].includes(this.user.orgType)){
        return {
        viewAuthorize:this.$refs.pertree?this.$refs.pertree.getCheckedNodes().filter(item=>!!item.menuType).map(item=>item.pkId):[],
        manageAuthorize:{
            type:this.radio,
            userId:this.userId
        }
      };
      }else if(this.user.orgType==4){
        return {viewAuthorize:this.$refs.pertree?this.$refs.pertree.getCheckedNodes().filter(item=>!!item.menuType).map(item=>item.pkId):[],}
      }else{
        return {}
      }
    },
    getOrgDeptAndPeo() {
      let params = { orgId: this.user.fkOrgId };
      this.$api.getOrgDeptAndPeo(params).then(res => {
        if (res.code === 200) {
          this.deptList = [res.data];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    selectIds(node,ids) {
      this.userId=ids.map(item=>item.pkId)
    }
  },
  watch:{
    manageAuthorize:{
        deep:true,
        handler(val){
            this.radio = val.type;
            this.userId = val.userId;
           this.$refs.peoTree&& this.$refs.peoTree.setTreeSelect(this.userId)
        }
    },
    treeCheckList:{
        deep:true,
        handler(val){
           this.permission = val;
           console.log(val);
           this.$refs.pertree&& this.$refs.pertree.setCheckedKeys(val,false)
        }
    },
    disabled(val){
        console.log(val);
    }
  }
};
</script>

<style lang="scss" scoped>
.dataPer {
  width: 100%;
  height: 100%;
  display: flex;
  padding-right: 20px;
  .left,
  .right {
    flex: 1;
    border: 1px solid #dfe3f3;
    border-top: 0;
    border-bottom: 0;
  }
  .left {
    border-right: 0;
  }
  .header {
    height: 40px;
    padding-left: 20px;
    line-height: 40px;
    background-color: #f1f6ff;
  }
  .content {
    height: 500px;
    padding: 10px;
    overflow: auto;
    .title {
      height: 20px;
      &::before {
        content: "";
        display: inline-block;
        width: 6px;
        height: 20px;
        margin-right: 5px;
        background-color: #00ffff;
        vertical-align: bottom;
      }
    }
    td {
      border: 1px solid #dfe3f3;
      padding: 10px 0;
      padding-left: 6px;
    }
    .radios {
      display: flex;
      align-items: center;
      height: 40px;
    }
    .treeSel {
      display: flex;
    }
  }
}
.permisson {
  // 处理超出滚动
  /deep/ .el-tree {
  text-align: center;
}
/deep/ .perTree > .el-tree-node > .el-tree-node__content .el-checkbox {
  display: none;
}
/deep/ .el-tree-node {
  display: flex;
  border: 1px solid #dfe3f3;
  // border-top: none;
  width: fit-content;
  margin: -1px 0;
}

/deep/ .el-tree-node__content {
  width: 120px;
  height: auto;
  //  padding-left: 20px !important;
  padding: 5px 20px !important;
}
  .tree-list {
    height: 500px;
    overflow-y: auto;
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
}
</style>
