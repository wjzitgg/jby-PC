<template>
  <el-dialog title="选择物料" :visible="materDialog" @close="closeMaterDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" :loading="loading">
    <div class="dialog-form">
    <div class="materDialog">
      <div class="tree-search">
        <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
      </div>
      <el-tree class="main blue" default-expand-all node-key="pkId" @node-expand="nodeExpand" @node-click="handleNodeClick" :data="checkList" :props="defaultProps" ref="checkList" v-if="materDialog" :filter-node-method="filterNode">
        <span slot-scope="{ node, data }">
          <span @click="nodeClick(data, node)" :class="{blue:!data.isChildren}">{{node.label}}</span>
        </span>
      </el-tree>
    </div>
  </div>
    <!-- <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="物料类型">
          <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.materialTypeId" filterable></el-cascader>
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input size="mini" v-model="inpData.materialName" class="wh-140"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" class="ml-20 search" @click="btnSearch">查询</el-button>
      </el-form>
    </div>
    <div class="tables">
      <el-table style="width: 100%" border height="100%" :data="materialData" ref="tables">
        <el-table-column label="选择" align="center" width="80">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="materDialogOk(row)" :disabled="selectMater.includes(row.pkId)">选择</el-button>
          </template>
        </el-table-column>
        <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
        <el-table-column label="物料分类" align="center" prop="fkTypeName"> </el-table-column>
        <el-table-column label="单位" align="center" prop="fkUnitName"> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="materDialog"></tablePaging> -->
  </el-dialog>
</template>

<script>
// import virtualNodeTree from "../../../components/virtualNodeTree/tree.vue";
export default {
  // components: { virtualNodeTree },
  props: {
    materDialog: {
      type: Boolean
    },
    customId: "",
    disabledType: "",
    selectMater: {
      type: Array,
      default: () => {
        return [];
      }
    },
    selectMaters: {
      type: Array,
      default: () => {
        return [];
      }
    },
    contractId: "",
    isOrder:{
      type:Number,
      default:0
    }//是否为其他材料
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      materialData: [],
      inpData: {
        materialTypeId: "",
        materialName: ""
      },
      searchData: {
        materialTypeId: "",
        materialName: ""
      },
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      materOptions: [],
      subOptions: [],
      approveMaterialsList: [],
      checkList: [],
      filterText: "",
      defaultProps: {
        label: "typeName",
        children: "childList"
      },
      loading:false
    };
  },
  watch: {
    materDialog(val) {
      if (val) {
        this.searchMaterialTypes();
        // this.conditionMaterialclassify();
        // this.searchMaterialPage();
      }
    },
    filterText(val) {
     this.materDialog&& this.$refs.checkList.filter(val);
    },
  },
  methods: {
    nodeExpand(data,node){
      console.log(data,node);
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
    searchMaterialTypes() {
      this.loading=true
      this.$api.searchMaterialTypes({ customerId: this.customId,contractId:this.contractId,isOrder:this.isOrder }).then(res => {
        this.loading=false
        if (res.code === 200) {
          this.checkList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      }).catch(err=>{
        this.loading=false
      });
    },
    // 获取供应商fkCustomId
    getSubList() {
      let data = {};
      if (this.user.orgType !== 5) {
        data.projectBidId = this.fkBidProjectId;
      }
      this.$api.searchNoLinkOrgId({ customType: 3, ...data }).then(res => {
        if (res.code === 200) {
          this.subOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取材料分类
    conditionMaterialclassify() {
      this.$api.searchMaterialTypes({ customerId: this.customId }).then(res => {
        if (res.code === 200) {
          this.materOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchMaterialPage() {
      let data = { ...this.page, ...this.searchData, customId: this.customId };
      if (this.contractId) {
        data.contractId = this.contractId;
      }
      console.log(data);
      this.$api.searchContentMaterialPage(data).then(res => {
        if (res.code === 200) {
          this.materialData = res.data.records;
          this.total = res.data.total - 0;
          if (this.$refs.tables) {
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeMaterDialog() {
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.$emit("update:materDialog", false);
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.inpData = {
        materialTypeId: "",
        materialName: ""
      };
      this.searchData = {
        materialTypeId: "",
        materialName: ""
      };
      this.filterText=""
      this.checkList =[]
    },
    materDialogOk(row) {
      this.$emit("getSelect", row);
      this.closeMaterDialog();
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchMaterialPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.searchMaterialPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchMaterialPage();
    },
    nodeClick(data, node){
      
      // if(!!data.isChildren){
      //   return
      // }
      // if(this.selectMater.includes(data.pkId)){
      //   return this.$message.warning("该物料已存在")
      // }
      // console.log(data);
      // this.$emit("getSelect", data);
      // this.closeMaterDialog();
    },
    handleNodeClick(data) {
      console.log(data)
      console.log("==================")
      // console.log(this.selectMaters)
      // return console.log(this.selectMater)
      console.log(this.selectMaters)
      console.log(data.pkId)
      console.log("==================")
      if((data.childList ==null || data.childList.length==0) && this.selectMater.includes(data.pkId)){
        
        return this.$message.warning("该物料已存在")
      }else if( this.selectMaters.includes(data.pkId)){
        return this.$message.warning("该物料已存在")
      }
      
      let datas = data
     if(!!data.isChildren ){
      // debugger
      datas.showType = false
      }else{
        datas.showType = true
      }
      this.$emit("getSelect", datas);
      this.closeMaterDialog()
      },
    // 树形筛选
    filterNode(value, data, node) {
        if (!value) return true;
        return data.typeName.indexOf(value) !== -1;
    },
  },
};
</script>

<style lang="scss" scoped>
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f3f3f3;
  padding: 0 20px;
  margin-bottom: 5px;
  .myform {
    align-items: center;
    margin-top: 20px;
  }
  .search-right {
    display: flex;
    align-items: center;
    .el-radio-group {
      display: flex;
    }
  }
}
.search {
  margin-top: 6px;
}
.tables {
  height: 500px;
}

.tree-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .el-input {
    width: 100%;
  }
  .el-checkbox {
    margin-right: 5px;
  }
}
.materDialog {
  /deep/ .main {
    width: 100%;
    height: 500px;
    overflow: auto;
  }
}
.blue {
  color: #02a7f0;
}
</style>
