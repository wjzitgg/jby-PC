<template>
  <div class="app-container">
    <!-- 标段项目下拉选择 -->
    <div class="project-select" v-if="user.orgType!=5">
      <span class="project-title">标段项目</span>
      <!-- <el-select v-model="sectionProject" @change="selectProject" placeholder="请选择" size="medium">
        <el-option v-for="item in projectArr" :key="item.fkOrgId" :label="item.projectName" :value="item.fkOrgId"> </el-option>
      </el-select> -->
      <proSelct @selectIds="selectIds"></proSelct>
    </div>

    <!-- 外层图标 -->
    <ul class="icon-list" v-if="user.orgType==5||user.orgType!=5&&!!this.pkId">
      <li @click="basicDialog = true" v-if="needShow('production/setting/base')">
        <div><i class="iconfont iconshezhi"></i></div>
        <span>结算龄期</span>
      </li>    
      <li @click="EngDraDialog = true" v-if="needShow('production/setting/drawing')">
        <div>
          <i class="iconfont icongongchengtuzhiguanli"></i>
        </div>
        <span>工程图纸</span>
      </li>
      <li @click="proManDialog = true" v-if="needShow('production/setting/item')">
        <div>
          <i class="iconfont iconfenbufenxiang"></i>
        </div>
        <span>单位分部分项表</span>
      </li>
      <!--  -->
      <li @click="customProcess = true" v-if="needShow('production/setting/custom')">
        <div>
          <i class="iconfont iconfenbufenxiang"></i>
        </div>
        <span>生产验收流程</span>
      </li>
      <li @click="tablesDialog = true" v-if="needShow('production/setting/processTable')">
        <div>
          <i class="iconfont iconfenbufenxiang"></i>
        </div>
        <span>生产流程表格</span>
      </li>
      <!--  -->
      <li @click="ListDialog = true" v-if="needShow('production/setting/itemDetailed')">
        <div>
          <!-- <img src="../../assets/清单.svg" alt="" /> -->
          <i class="iconfont iconjiancewentiqingdanbiao"></i>
        </div>
        <span>分项工程清单细目表</span>
      </li>
      <li @click="materialDialog = true" v-if="needShow('production/setting/itemMaterial')">
        <div>
          <!-- <img src="../../assets/材料.svg" alt="" /> -->
          <i class="iconfont icongouwucheman"></i>
        </div>
        <span>分项工程材料表</span>
      </li>
      <li @click="workAreaDialog = true" v-if="needShow('production/setting/area')">
        <div>
          <i class="iconfont icongongquguanli"></i>
        </div>
        <span>工区管理</span>
      </li>
      <li @click="EmpWorkAreaDialog = true" v-if="needShow('production/setting/use')">
        <div><i class="iconfont iconyuangongguanli"></i></div>
        <span>员工工程任务划分</span>
      </li>
      <li @click="subProDialog = true" v-if="needShow('production/setting/task')">
        <div>
          <i class="iconfont iconfenbaoshang"></i>
        </div>
        <span>分包单位工程任务划分</span>
      </li>
      <!-- <li @click="checkDialog = true"  v-has="'production:setting:check'">
        <div>
          <i class="iconfont iconfenbaoshang"></i>
        </div>
        <span>试验检测</span>
      </li> -->
    </ul>
      <div class="empty" style="width: 100%" v-else>
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    <!-- 基础设置模态框 -->
    <BasicSetting :basicDialog.sync="basicDialog" :orgType="user.orgType" :fkOrgId="sectionProject" />
    <!-- 工程图纸模态框 -->
    <EngineeringDrawing :EngDraDialog.sync="EngDraDialog" :orgType="user.orgType" :fkOrgId="sectionProject" />
    <!-- 单位分部分项表模态框 -->
    <ProjectManagement :proManDialog.sync="proManDialog" :orgType="user.orgType" :fkOrgId="sectionProject" />
    <!-- 清单项目表模态框 -->
    <CheckList :ListDialog.sync="ListDialog" :orgType="user.orgType" :fkOrgId="sectionProject" />
    <!-- 材料项目表模态框 MaterialList-->
    <MaterialList :materialDialog.sync="materialDialog" :orgType="user.orgType" :fkOrgId="sectionProject" />
    <!-- 工区管理 -->
    <WorkArea :workAreaDialog.sync="workAreaDialog" :orgType="user.orgType" :fkOrgId="sectionProject" :pkId="this.pkId"/>
    <!-- 员工工区划分 -->
    <EmployeeWorkArea :EmpWorkAreaDialog.sync="EmpWorkAreaDialog" :orgType="user.orgType" :fkOrgId="sectionProject" />
    <!-- 分包单位工程任务划分 -->
    <SubcontractoProject :subProDialog.sync="subProDialog" :orgType="user.orgType" :fkOrgId="sectionProject" />
    <tablesDialog :tablesDialog.sync="tablesDialog" :orgType="user.orgType" :fkOrgId="sectionProject" :pkId="this.pkId"/>
    <checkDialog :checkDialog.sync="checkDialog" :orgType="user.orgType" :fkOrgId="sectionProject" />
    <processDialog :customProcess.sync="customProcess" :fkOrgId="sectionProject" />
  </div>
</template>

<script>
import BasicSetting from "./components/BasicSetting.vue";
import EngineeringDrawing from "./components/EngineeringDrawing.vue";
import ProjectManagement from "./components/ProjectManagement.vue";
import WorkArea from "./components/WorkArea.vue";
import EmployeeWorkArea from "./components/EmployeeWorkArea.vue";
import SubcontractoProject from "./components/SubcontractoProject.vue";
import CheckList from "./components/CheckList.vue";
import MaterialList from "./components/MaterialList.vue";
import processDialog from "./components/process.vue";
import checkDialog from "./components/checkDialog.vue";
import tablesDialog from './components/tablesDialog.vue';
import "pl-table/themes/index.css"; // 引入样式（必须引入)，vuecli3.0不需要配置，cli2.0请查看webpack是否配置了url-loader对woff，ttf文件的引用,不配置会报错哦
// import "pl-table/themes/plTableStyle.css"; // 默认表格样式很丑 引入这个样式就可以好看啦（如果你不喜欢这个样式，就不要引入，不引入就跟ele表格样式一样）
//
export default {
  components: {
    BasicSetting,
    EngineeringDrawing,
    ProjectManagement,
    WorkArea,
    EmployeeWorkArea,
    SubcontractoProject,
    CheckList,
    MaterialList,
    processDialog,
    checkDialog,
    tablesDialog
  },
  data() {
    return {
      // 基础设置模态框
      basicDialog: false,
      EngDraDialog: false,
      proManDialog: false,
      workAreaDialog: false,
      EmpWorkAreaDialog: false,
      subProDialog: false,
      materialDialog: false,
      ListDialog: false,
      sectionProject: "", //标段项目值
      projectArr: [],
      // orgid_type: "", //施工单位ID
      customProcess: false,
      checkDialog: false,
      pkId:"",
      tablesDialog:false,
      showList:[]
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    routers(){
      return JSON.parse(sessionStorage.getItem("router") || "{}");
    }
  },
  mounted() {
    if(this.user.orgType==5){
      this.routers.forEach(item=>{
        item.children.forEach(item2=>{
          if(item2.component=='production/setting'&&item2.isNeedInterface){
            this.$api.getChildrenRouters({path:'production/setting'}).then(res=>{
              console.log(res);
              if(res.code==200){
                this.showList = res.data
              }else{
                this.$message.warning(res.msg)
              }
            })
          }
        })
      })
    }
    // this.orgid_type = JSON.parse(sessionStorage.getItem("user")).orgType; //用来获取施工单位ID
  },
  created() {
    // if (this.user.orgType == 4) {
    //   this.getData();
    // }
  },
  methods: {
    needShow(path){
      if(this.user.orgType==5){
        let bool = false
        this.showList.forEach(item=>{
          if(item.path == path){
            bool = true
          }
        })
        return bool
      }else{
        return true
      }
    },
    selectIds(arr,obj,isTrue){
      if(arr.length){
        if(arr.length>1){
          this.pkId=arr[1]
        }else{
          this.pkId=arr[0]
        }
        this.sectionProject= obj.fkOrgId
        console.log(this.pkId, this.sectionProject);
      }
    },
    permissions(str){
      let bool=false
      this.user.permissions.forEach(item=>{
        if(item.indexOf(str)!=-1){
          bool=true
        }
      })
      return bool
    },
    getData() {
      this.$api
        .getProjectArr()
        .then(res => {
          if (res.code === 200) {
            this.projectArr = res.data;
            this.sectionProject = this.projectArr[0].fkOrgId;
            this.pkId = this.projectArr[0].pkId;
          }
        })
        .catch(err => {});
    },
    // 标段项目下拉选择事件
    selectProject(data) {
      console.log(data);
      this.projectArr.forEach(item=>{
        if( this.sectionProject == item.fkOrgId){
          this.pkId = item.pkId
        }
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.icon-list {
  display: flex;
  list-style: none;
  padding: 20px;
  li {
    text-align: center;
    margin-right: 30px;
    cursor: pointer;
    div {
      width: 60px;
      height: 50px;
      // border: 1px solid #000;
      margin: 0 auto 10px;
      .iconfont {
        font-size: 50px;
      }
      img {
        width: 50px;
      }
    }
    span {
      display: inline-block;
    }
  }
  li:hover {
    background-color: pink;
  }
}
.project-select {
  display: flex;
  align-items: center;
  padding: 10px;
  .project-title {
    font-weight: 600;
  }
}
.empty{
  height: 100%;
  margin: 0;
}
</style>
