<template>
  <div>
    <el-dialog :close-on-press-escape="false" title="员工工程任务划分" top="8vh" :visible="EmpWorkAreaDialog"  @close="handleClose" :width="dialogType==1?'60%':'80%'" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="main dialog-form">
        <div class="searchCon" v-if="dialogType==2">
          <div class="searchCon-left">
            <div class="headerTitle">部门选择</div>
            <div class="list" v-if="deptOptions.length">
            <div class="btn-item" :class="{'click-item':searchData.deptId==item.pkId}" v-for="item in deptOptions" :key="item.pkId" @click="deptClick(item.pkId)">{{item.deptName}}</div>
            </div>
            <div class="empty" style="width: 100%" v-else>
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </div>
          <div class="searchCon-right">
            <div class="headerTitle">岗位选择</div>
            <div class="list" v-if="searchData.deptId!=-1">
              <div class="btn-item" :class="{'click-item':searchData.roleId==item.pkId}" v-for="item in roleOption" :key="item.pkId" @click="roleClick(item.pkId)">{{item.roleName}}</div>
            </div>
            <div class="empty" style="width: 100%" v-else>
              <span>请先选择部门</span>
            </div>
          </div>
        </div>
        <div class="noPriview" :key="dialogType" v-if="dialogType==1||(dialogType==2&&searchData.roleId!=-1)">
        <div class="left">
          <!-- 搜索框 -->
          <div class="headerTitle" v-if="dialogType==2">人员选择</div>
          <div class="left-header">
            <el-form :inline="true">
              <el-form-item label="部门" v-if="dialogType===1">
                <el-select size="mini" class="department" v-model="inpData.deptId">
                  <el-option label="全部" :value="-1"></el-option>
                  <el-option v-for="item in deptOptions" :key="item.pkId" :label="item.deptName" :value="item.pkId"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="岗位" v-if="dialogType===1">
                <el-select size="mini" class="post" v-model="inpData.roleId">
                  <el-option label="全部" :value="-1"></el-option>
                  <el-option v-for="item in inproleOption" :key="item.pkId" :label="item.roleName" :value="item.pkId"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="员工姓名">
                <el-input size="mini" class="ygname" placeholder="请输入" v-model="inpData.userName" maxlength="25"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button size="mini"  class="el-button-primary-search" icon="el-icon-search" @click="btnSearch">查询</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 表格 -->
          <div class="left-main table-data" :class="{'leftHeight':dialogType==1,'leftHeight2':dialogType==2}">
            <el-table style="width: 100%" border height="100%" :data="userList" @row-click="rowClick" :row-style="selectRowStyle" stripe :header-cell-style="{ background: '#f1f6ff'}" :tooltip-effect="'light'">
              <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
              <el-table-column label="员工姓名" align="center" prop="userName"> </el-table-column>
              <el-table-column label="所属部门" align="center" prop="deptName" show-overflow-tooltip v-if="dialogType===1"> </el-table-column>
              <el-table-column label="岗位" align="center" prop="roleName" show-overflow-tooltip v-if="dialogType===1"> </el-table-column>
              <el-table-column label="管理工区" align="center" prop="areaName" show-overflow-tooltip> </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
          <!-- 分页组件 -->
          <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
        </div>
        <!-- 右侧树形 -->
        <div class="right">
          <div class="headerTitle" v-if="dialogType==2">任务选择</div>
          <h3 class="right-header">{{ nowUser }}</h3>
          <div class="right-main"   :class="{'rightHeight':dialogType==1,'rightHeight2':dialogType==2}">
            <el-tree  @node-expand="nodeExpand" :data="treeList2" default-expand-all :props="defaultProps2" node-key="pkId" v-show="dialogType===1">
              <span slot-scope="{ node }">
                <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                  <div class="label" @mouseenter="onMouseEnter(`label2${String(node.id)}`)">
                    <span :ref="'label2' + String(node.id)">{{ node.label }}</span>
                  </div>
                </el-tooltip>
              </span>
            </el-tree>
            <el-tree  @node-expand="nodeExpand" :data="treeList" default-expand-all show-checkbox :props="defaultProps" node-key="pkId" ref="nodeTree" v-show="dialogType===2">
              <span slot-scope="{ node,data }">
                <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                  <div class="label" @mouseenter="onMouseEnter(`label${String(node.id)}`)" :style="{ color: !!data.isGrey ? '#c0c4cc' : '' }">
                    <span :ref="'label' + String(node.id)">{{ node.label }}</span>
                  </div>
                </el-tooltip>
              </span>
            </el-tree>
          </div>
          <div class="right-footer-setting" v-if="dialogType===2">
            <el-button size="mini" type="primary" class="el-button-primary" @click="handleSet" :disabled="!treeList.length || !nowClickId">设置</el-button>
          </div>
        </div>
        </div>
        <div class="empty" style="width: 100%" v-else>
          <span>请先选择岗位</span>
        </div>
      </div>
      <span slot="footer" v-if="dialogType===1">
        <el-button type="primary" class="el-button-primary-edit" @click="handleEdit" v-has="'production:setting:userEdit'">编 辑</el-button>
        <!-- <el-button @click="handleClose" >关 闭</el-button> -->
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tablePaging from "@/components/tablePaging.vue";
export default {
  components: { tablePaging },
  props: {
    EmpWorkAreaDialog: {
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
      dialogType:1,//1为预览，2为编辑
      userList: [],
      deptOptions: [],
      roleOption: [],
      inproleOption:[],
      treeList: [],
      treeList2: [],
      inpData: {
        roleId: -1,
        deptId: -1,
        userName: ""
      },
      searchData: {
        roleId: -1,
        deptId: -1
      },
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      defaultProps: {
        label: "itemName",
        children: "prodItemLists",
        disabled: this.disabledFn
      },
      defaultProps2: {
        children: "children",
        label: "name"
      },
      nowUser: "",
      nowClickId: "",
      loading: false,
      isShowTooltip: true
    };
  },
  methods: {
    deptClick(pkId){
      this.$refs.nodeTree&&this.$refs.nodeTree.setCheckedKeys([]);
      this.searchData.deptId=pkId
      this.searchData.roleId=-1
      this.page.pageNum=1
      this.userList=[]
      this.getAllRole(this.searchData.deptId);
    },
    roleClick(pkId){
      this.searchData.roleId=pkId
      this.getItemList(pkId);
    },
    nodeExpand(data,node){
      if(node.level==2){
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
    // 获取员工列表
    getUserList() {
      this.$api
        .searchUserPageForOrgId({
          ...this.searchData,
          ...this.page,
          fkOrgId: this.fkOrgId
        })
        .then(res => {
          if (res.code === 200) {
            this.userList = res.data.records;
            this.total = res.data.total - 0;
            if (this.userList.length != 0) {
              this.rowClicks({
                userName: this.userList[0].userName,
                pkId: this.userList[0].pkId
              });
            } else {
              this.nowUser = "";
              this.nowClickId = "";
              // this.$refs.nodeTree.setCheckedKeys([]);
              this.treeList2=[]
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
    },
    findReUserAreaItemViewByUserId(){
      this.$api.findReUserAreaItemViewByUserId({userId:this.nowClickId}).then(res=>{
        if(res.code===200){
          this.treeList2=res.data
        }else{
          this.$message.warning(res.msg);
        }
      })
    },
    // 获取树形分项工程表
    getItemList(roleId) {
      this.$api.findWorkAreaAndItemByOrgId({ fkOrgId: this.fkOrgId,roleId }).then(res => {
        if (res.code === 200) {
          this.treeList = res.data;
          this.getUserList()
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取全部部门
    getAllDept() {
      this.$api.getOrgAllDeptList2({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          this.deptOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取全部角色
    getAllRole(deptId) {
      this.$api.getOrgAllRoleList2({ fkOrgId: this.fkOrgId,deptId }).then(res => {
        if (res.code === 200) {
          if(!!deptId){
            this.roleOption = res.data;
            if(this.roleOption.length){
              this.roleClick(this.roleOption[0].pkId)
            }
          }else{
            this.inproleOption=res.data
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据id获取员工与工区的联系
    getUserLinkArea(userId) {
      this.$api.queryStaff({ userId, fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => item.fkSubitemId);
          this.$refs.nodeTree.setCheckedKeys(arr);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 关闭弹框
    handleClose() {
      this.$emit("update:EmpWorkAreaDialog", false);
      this.inpData = {
        roleId: -1,
        deptId: -1,
        userName: ""
      };
      this.searchData = {
        roleId: -1,
        deptId: -1
      };
      this.nowClickId = "";
      this.nowUser = "";
      this.$refs.nodeTree&&this.$refs.nodeTree.setCheckedKeys([]);
      this.dialogType=1
    },
    // 搜索按钮
    btnSearch() {
      // console.log(this.inpData);
      this.page.pageNum=1
      if(this.dialogType===1){
        this.searchData = this.inpData;
      }else{
        this.searchData.userName= this.inpData.userName
      }
      this.getUserList();
    },
    // 表单行被点击事件
    rowClick(row, column) {
      this.nowUser = row.userName;
      this.nowClickId = row.pkId;
      if(this.dialogType===1){
        this.findReUserAreaItemViewByUserId()
      }else if(this.dialogType===2){
        this.getUserLinkArea(row.pkId);
      }
    },
    //
    rowClicks(row) {
      this.nowUser = row.userName;
      this.nowClickId = row.pkId;
      if(this.dialogType===1){
        this.findReUserAreaItemViewByUserId()
      }else if(this.dialogType===2){
        this.getUserLinkArea(row.pkId);
      }
    },
    selectRowStyle({ row, rowIndex }) {
      if (row.pkId === this.nowClickId) {
        return { "background-color": "#81d3f8 !important" };
      }
    },
    // 设置按钮
    handleSet() {
      let itemIds = this.$refs.nodeTree.getCheckedNodes(true,false).filter(item=>item.grade===3).map(item=>item.pkId);
      this.loading = true;
      this.$api
        .addStaffWork({
          userAreaItems: [
            {
              fkUserId: this.nowClickId,
              itemIds
            }
          ]
        })
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            // this.getUserList();
            // this.getItemList();
            // this.getUserLinkArea(this.nowClickId);
            this.dialogType=1
            this.page.pageNum=1
            this.searchData= {
              roleId: -1,
              deptId: -1
            }
            this.getUserList();
            // this.findReUserAreaItemViewByUserId()
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
          
        });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getUserList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getUserList();
    },
    // 树形超过宽度提示
    onMouseEnter(str) {
      const tag = this.$refs[str];
      const parentWidth = tag.parentNode.offsetWidth; // 获取元素父级可视宽度
      const contentWidth = tag.offsetWidth; // 获取元素可视宽度
      this.isShowTooltip = contentWidth <= parentWidth;
    },
    // 树形禁用
    disabledFn(data) {
      if (this.orgType == 4) {
        return true;
      }
      return false;
    },
    handleEdit(){
      this.dialogType=2
      this.searchData= {
        roleId: -1,
        deptId: -1
      }
      this.inpData= {
        roleId: -1,
        deptId: -1,
        userName: ""
      }
      this.nowClickId = "";
      if(this.deptOptions.length){
        this.deptClick(this.deptOptions[0].pkId)
      }
      // this.getUserLinkArea(this.nowClickId);
    },
  },
  watch: {
    EmpWorkAreaDialog(val) {
      if (val) {
        this.getUserList();
        this.getAllDept();
        this.getAllRole()
        // console.log("11111111111111111111111111111111111")
        // console.log(val)
        //    this.nowUser = row.userName;
        // this.nowClickId = row.pkId;

        // console.log("11111111111111111111111111111111111")
      } else {
        this.$refs.nodeTree&&this.$refs.nodeTree.setCheckedKeys([]);
        this.nowClickId = "";
        this.nowUser = "";
      }
    },
    dialogType(val){
      if(val==1){
        // if(this.EmpWorkAreaDialog){
        //   this.page.pageNum=1
        //   this.searchData= {
        //     roleId: -1,
        //     deptId: -1
        //   }
        //   this.getUserList();
        // }
      }else if(val==2){
        this.userList=[]
        this.page.pageNum=1
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-data{
  /deep/ .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell{
    background-color: transparent;
  }
  /deep/ .el-table__cell{
    background-color: transparent;
  }
}
.main {
  display: flex;
  width: calc(100% - 40px);
  height: 540px;
  box-sizing: border-box;
  .headerTitle{
      display: flex;
      // justify-content: center;
      align-items: center;
      height: 30px;
      padding-left: 6px;
      border-bottom: 1px solid #d7d7d7;
      font-weight: 700;
    }
  .searchCon{
    display: flex;
    width: 500px;
    .searchCon-left,.searchCon-right{
      width: 250px;
      border: 1px solid #d7d7d7;
      border-right: none;
    }
    .list{
      height: calc(100% - 30px);
      overflow: auto;
    }
    .btn-item{
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      height: 40px;
      background-color: #e5edf0;
      margin: 4px;
    }
    .click-item{
      background: #22b0ee;
      color: #fff;
    }
  }
  .noPriview{
    flex: 1;
    display: flex;
  }
  .left {
    flex:1;
    // border: 1px solid #d7d7d7;
    border-right: none;
    .left-header{
      display: flex;
      align-items: center;
      height: 40px;
      padding-left: 10px;
      /deep/ .el-form-item{
        margin-bottom: 0;
      }
    }
    .left-main {
      width: 100%;
      height: calc(100% - 100px);
    }
    .leftHeight{
      height: calc(100% - 100px);
    }
    .leftHeight2{
      height: calc(100% - 130px);
    }
  }
  .right {
    width: 350px;
    // height: 100%;
    height: 414px;
    border: 1px solid #d7d7d7;
    border-bottom:none ;
    margin-top: 56px;
    
   background: linear-gradient(180deg, rgba(249, 249, 255, 1) 0%, rgba(249, 249, 255, 0) 100%);
    
    .right-header {
      width: 100%;
      height: 40px;
      line-height: 40px;
      padding-left: 10px;
      border-bottom: 1px solid #d7d7d7;
      font-weight: 800;
    }
    .rightHeight{
      height: calc(100% - 40px);
      

    }
    .rightHeight2{
      height: calc(100% - 100px);
    }
    .right-main {
      width: 100%;
      overflow: auto;
      border-bottom: 1px solid #d7d7d7;
      
      /deep/ .el-tree {
        overflow: auto;
        width: 100%;
        height: 100%;
   background: linear-gradient(180deg, rgba(249, 249, 255, 1) 0%, rgba(249, 249, 255, 0) 100%);

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
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      // text-align: center;
      // margin-top: 3px;
    }
  }
}
/deep/ .el-table__body tr:hover > td {
  background-color: #81d3f8 !important;
}
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
}
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #ffffff;
}
.el-button-primary-search{
  width: 80px;
height: 28px;
opacity: 1;
border-radius: 2px;
background: rgba(42, 130, 228, 0.1);

border: 1px solid rgba(42, 130, 228, 0.4);
}
.el-button-primary-edit{
width: 240px;
height: 40px;
opacity: 1;
border-radius: 2px;
background: rgba(24, 144, 255, 1);
margin-left:800px ;

}
.ygname{
  width: 140px;
height: 28px;
}
.post{
  width: 140px;
  height: 28px;
  opacity: 1;
  background: rgba(255, 255, 255, 1);

}
.department{
  width: 140px;
  height: 28px;
  opacity: 1;
  background: rgba(255, 255, 255, 1);

}
.right-footer-setting{
    margin-left:155px;
    
}
</style>
