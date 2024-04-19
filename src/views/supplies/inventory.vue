<template>
  <div class="app-container">
    <!-- 标段项目下拉选择 -->
    <div class="project-select" v-if="![5, 6, 7].includes(user.orgType)">
      <span class="project-title">标段项目</span>
      <!-- <el-select v-model="sectionProject" @change="selectProject" placeholder="请选择" size="medium">
        <el-option v-for="item in projectArr" :key="item.pkId" :label="item.projectName" :value="item.pkId"> </el-option>
      </el-select> -->
      <proSelct @selectIds="selectIds"></proSelct>
    </div>

    <!-- 项目部库存 -->
    <div class="pro-inventory" v-if="typeShow">
      <h3 v-if="[4, 5].includes(user.orgType)">项目部库存</h3>
      <ul class="icon-list">
        <li @click="warehouseDialog = true" v-if="needShow('supplies/inventory/warehouse')">
          <div><i class="iconfont iconcaidanlan-kucun-cangkuxinxishezhi"></i></div>
          <div>{{ user.orgType === 7 ? "我的仓库" : "仓库信息" }}</div>
        </li>
        <li @click="bidWarehouseDialog = true" v-if="needShow('supplies/inventory/projectWarehouse')">
          <div><i class="iconfont iconcaidanlan-kucun-cangkuxinxishezhi"></i></div>
          <div>标段仓库信息</div>
        </li>
        <li @click="limitWarningDialog = true" v-if="needShow('supplies/inventory/alert')">
          <div>
            <i class="iconfont iconxianzhixiaofeiling"></i>
          </div>
          <div>库存限额预警</div>
        </li>
        <li @click="materialStoreDialog = true" v-if="needShow('supplies/inventory/warehouseMaterial')">
          <div>
            <i class="iconfont iconwuliaokucunguankong"></i>
          </div>
          <div>库存物料</div>
        </li>
        <!--  -->
        <li @click="outPutStoreDialog = true" v-if="needShow('supplies/inventory/warehouseAccess')">
          <div>
            <i class="iconfont iconchurukuguanli"></i>
          </div>
          <div>出入库管理</div>
        </li>
        <!--  -->
        <li @click="checkManagementDialog = true" v-if="needShow('supplies/inventory/orderInventory')">
          <div>
            <i class="iconfont iconpandianguanli_1"></i>
          </div>
          <div>盘点管理</div>
        </li>
        <li @click="storeParameterDialog = true" v-if="needShow('supplies/inventory/account')">
          <div>
            <i class="iconfont icontaizhangguanli"></i>
          </div>
          <div>仓库台账</div>
        </li>
        <li @click="statisticsDialog = true" v-if="needShow('supplies/inventory/classStat')">
          <div>
            <i class="iconfont iconqww4"></i>
          </div>
          <div>分类统计</div>
        </li>
      </ul>
    </div>
    <!-- 分包单位库存 -->
    <div class="sub-inventory" v-if="([4, 5, 10].includes(user.orgType) && user.permissions.includes('supplies:inventory:firstAlert')) || ([4, 5, 10].includes(user.orgType) && user.permissions.includes('supplies:inventory:firstInventory'))" v-show="typeShow">
      <h3>分包单位库存</h3>
      <ul class="icon-list">
        <li @click="ownerLimitWarningDialog = true" v-if="needShow('supplies/inventory/firstAlert')">
          <div><i class="iconfont iconxianzhixiaofeiling"></i></div>
          <div>甲供限额预警</div>
        </li>
        <li @click="ownerMaterialStoreDialog = true" v-if="needShow('supplies/inventory/firstInventory')">
          <div>
            <i class="iconfont iconwuliaokucunguankong"></i>
          </div>
          <div>甲供库存信息</div>
        </li>
      </ul>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="!typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 仓库信息 -->
    <warehouse :warehouseDialog.sync="warehouseDialog" :fkOrgId="sectionProject"></warehouse>
    <bidWarehouse :bidWarehouseDialog.sync="bidWarehouseDialog" :fkOrgId="sectionProject"></bidWarehouse>
    <!-- 库存限额预警 -->
    <limitWarning :limitWarningDialog.sync="limitWarningDialog" :fkOrgId="sectionProject"></limitWarning>
    <!-- 库存物料 -->
    <materialStore :materialStoreDialog.sync="materialStoreDialog" :fkOrgId="sectionProject" :orgId="fkOrgId"></materialStore>
    <!-- 出入库管理 -->
    <outPutStore :outPutStoreDialog.sync="outPutStoreDialog" :fkOrgId="sectionProject"></outPutStore>
    <!-- 盘点管理 -->
    <checkManagement :checkManagementDialog.sync="checkManagementDialog" :fkOrgId="sectionProject"></checkManagement>
    <!-- 仓库台账 -->
    <storeParameter :storeParameterDialog.sync="storeParameterDialog" :fkOrgId="sectionProject"></storeParameter>
    <!-- 分类统计 -->
    <statistics :statisticsDialog.sync="statisticsDialog" :fkOrgId="sectionProject"></statistics>
    <!-- 甲供限额预警 -->
    <ownerLimitWarning :ownerLimitWarningDialog.sync="ownerLimitWarningDialog" :fkOrgId="sectionProject" :orgId="fkOrgId"></ownerLimitWarning>
    <!-- 甲供库存信息 -->
    <ownerMaterialStore :ownerMaterialStoreDialog.sync="ownerMaterialStoreDialog" :fkOrgId="sectionProject" :orgId="fkOrgId"></ownerMaterialStore>
  </div>
</template>

<script>
import warehouse from "./components/warehouse.vue";
import limitWarning from "./components/limitWarning.vue";
import materialStore from "./components/materialStore.vue";
import outPutStore from "./components/outPutStore.vue";
import checkManagement from "./components/checkManagement.vue";
import storeParameter from "./components/storeParameter.vue";
import statistics from "./components/statistics.vue";
import ownerLimitWarning from "./components/ownerLimitWarning.vue";
import ownerMaterialStore from "./components/ownerMaterialStore.vue";
import bidWarehouse from "./components/bidWarehouse.vue";
export default {
  components: { warehouse, limitWarning, materialStore, outPutStore, checkManagement, storeParameter, statistics, ownerLimitWarning, ownerMaterialStore, bidWarehouse },
  data() {
    return {
      warehouseDialog: false,
      limitWarningDialog: false,
      materialStoreDialog: false,
      outPutStoreDialog: false,
      checkManagementDialog: false,
      storeParameterDialog: false,
      statisticsDialog: false,
      ownerLimitWarningDialog: false,
      ownerMaterialStoreDialog: false,
      sectionProject: "", //标段项目值
      projectArr: [],
      // orgid_type: "", //施工单位ID
      customProcess: false,
      bidWarehouseDialog: false,
      fkOrgId: "",
      typeShow: true,
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
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
      } else {
        this.$message.error(res.msg);
      }
    });
    if([5,6,7].includes(this.user.orgType)){
      this.routers.forEach(item=>{
        item.children.forEach(item2=>{
          if(item2.component=='supplies/inventory'&&item2.isNeedInterface){
            this.$api.getChildrenRouters({path:'supplies/inventory'}).then(res=>{
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
    if (this.user.orgType == 4) {
      // this.getData();
    }
  },
  methods: {
    needShow(path){
      if([5,6,7].includes(this.user.orgType)){
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
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.sectionProject = arr[1];
        } else {
          this.sectionProject = arr[0];
        }
        this.fkOrgId = obj.fkOrgId;
      }
    },
    getData() {
      this.$api.getProjectArr().then(res => {
        if (res.code === 200) {
          this.projectArr = res.data;
          // this.sectionProject = this.projectArr[0].pkId;
          this.fkOrgId = this.projectArr.filter(item => item.pkId == this.sectionProject)[0].fkOrgId;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 标段项目下拉选择事件
    selectProject(data) {
      console.log(data);
      this.fkOrgId = this.projectArr.filter(item => item.pkId === data)[0].fkOrgId;
    }
  }
};
</script>

<style lang="scss" scoped>
.pro-inventory {
  min-height: 200px;
}
.icon-list {
  display: flex;
  list-style: none;
  padding: 20px;
  li {
    text-align: center;
    margin-right: 30px;
    cursor: pointer;
    div {
      // width: 60px;
      // height: 60px;
      // border: 1px solid #000;
      margin: 0 auto;
      .iconfont {
        font-size: 60px;
        line-height: normal;
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
</style>
