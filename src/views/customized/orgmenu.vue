<template>
  <div class="app-container">
    <custom @choose="choose" style="height: 93%;" v-show="!basicStatus" :types="'0'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject" style="padding: 0"></el-button>{{ headDate.orgName }}</span>
      <span class="item">管理员手机号码：{{ headDate.telephone }}</span>
      <span class="item">联系人:{{ headDate.linkMan }}</span>
      <span class="item">联系人手机号码：{{ headDate.linkPhone }}</span>
      <span class="item">到期日期：{{ headDate.expireTime }}</span>
    </div>
    <div v-show="basicStatus">
      <!-- <el-radio-group v-model="orgType" class="edit-title" size="mini" @change="orgTypeChange">
        <el-radio-button label="1">PC权限</el-radio-button>
        <el-radio-button label="2">APP权限</el-radio-button>
      </el-radio-group> -->
      <el-tabs v-model="orgType" @tab-click="orgTypeChange">
        <el-tab-pane label="PC权限" name="1"></el-tab-pane>
        <el-tab-pane label="APP权限" name="2"></el-tab-pane>
      </el-tabs>
      <!-- 权限表格 -->
      <div style="background-color: #fff;padding: 20px;border-radius: 5px;">
        <div style="position: relative;">
          <permIssion ref="permIssion" v-loading="loading" @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData" :checkList="selectTree" :typeStatus="!typeStatus" class="permIssion" v-show="orgType == 1"> </permIssion>
          <permIssion ref="permIssion2" v-loading="loading" @getchekcData="getchekcData" @callOff="callOff" :treeData="treeData2" :checkList="selectTree2" :typeStatus="!typeStatus" class="permIssion" v-show="orgType == 2"> </permIssion>
        </div>
        <div style="margin:20px;">
          <el-button type="primary" size="mini" class="el-button-primary" style="margin-left: 22%;" @click="getchekcData">保 存</el-button>
        </div>
      </div>
    </div>
    <el-dialog title="选择企业" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div style="height: 560px;">
        <custom @choose="choose" style="height: 85%;" :types="'0'" ref="custom" :status="choiceShow"></custom>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import tablePaging from "../../components/tablePaging.vue";
import permIssion from "../../components/permission/permission"; // 菜单权限组建
import custom from "./compomemts/custom.vue";
export default {
  name: "orgmenu",

  data() {
    return {
      selectTree: [],
      selectTree2: [],
      typeStatus: false,
      treeData: [], //    权限组件
      treeData2: [], //    权限组件
      params: {},
      loading: false,
      orgType: "1",
      // ===========
      basicStatus: false,
      choiceShow: false,
      headDate: {}
    };
  },
  components: {
    tablePaging,
    permIssion,
    custom
  },
  mounted() {},
  methods: {
    choose(item) {
      this.headDate = item;
      this.basicStatus = false;
      this.choiceShow = false;
      this.$nextTick(() => {
        this.basicStatus = true;
        this.custom(item);
      });
    },
    choiceProject() {
      this.choiceShow = true;
      this.$nextTick(() => {
        this.$refs.custom.reset();
      });
    },

    orgTypeChange(val) {
      this.custom(this.itemData);
    },
    // 点击定制按钮
    custom() {
      this.selectTree = [];
      this.selectTree2 = [];
      // 获取所有权限
      this.$api
        .searchCustomMenu({ orgId: this.headDate.pkId })
        .then(res => {
          if (res.code == 200) {
            this.treeData = res.data.sysMenuListPc;
            this.selectTree = res.data.defaultMenuIdPcList;
            this.treeData2 = res.data.sysMenuListApp;
            this.selectTree2 = res.data.defaultMenuIdAppList;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 弹窗的保存权限
    getchekcData() {
      const data1 = this.$refs.permIssion.getchekcData();
      const data2 = this.$refs.permIssion2.getchekcData();
      const data3 = data1.concat(data2); // 合并PC和APP的选中所有权限
      const data = data3.filter(item => item != undefined);
      const selectData = this.selectTree.concat(this.selectTree2); // 合并PC和APP的选中所有权限
      const arrData = diff(selectData, data);
      const addMenuListSet = arrData[1]; // 新增arr
      // let arr = ["20", "40", "50", "60", "70", "80", "90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "200", "1559354227346677762", "1559359679904129026", "1575313307759099906", "1579305163887038466", "1602623045837643778"
      //   , "1603213334205693953", "1631142560870014978"]
      // this.form.deleteMenuListSet = arrData[0]; // 删除arr
      let c = [];
      for (let i of addMenuListSet) {
        // if (arr.indexOf(i) === -1) {
        c.push(i);
        // }
      }
      this.loading = true;
      const params = {
        addMenuListSet: c,
        fkOrgId: this.headDate.pkId,
        deleteMenuListSet: arrData[0]
        // sourceType: this.orgType
      };

      this.$api
        .addOrUpdate(params)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success(res.msg);
            this.loading = false;
            this.choose(this.headDate);
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });

      // function diff(arr1, arr2) {
      //   const newArr = [];
      //   const arr3 = [];
      //   for (let i = 0; i < arr1.length; i++) {
      //     if (arr2.indexOf(arr1[i]) === -1) arr3.push(arr1[i]);
      //   }
      //   const arr4 = [];
      //   for (let j = 0; j < arr2.length; j++) {
      //     if (arr1.indexOf(arr2[j]) === -1) arr4.push(arr2[j]);
      //   }
      //   // newArr = arr3.concat(arr4);
      //   const names = new Array(arr3, arr4);
      //   return names;
      // }
      function diff(arr1, arr2) {
        const newArr = [];
        const arr3 = [];
        for (let i = 0; i < arr1.length; i++) {
          if (arr2.indexOf(arr1[i]) === -1) arr3.push(arr1[i]);
        }
        const arr4 = [];
        for (let j = 0; j < arr2.length; j++) {
          if (arr1.indexOf(arr2[j]) === -1) arr4.push(arr2[j]);
        }
        // newArr = arr3.concat(arr4);
        const names = new Array(arr3, arr4);
        return names;
      }
    },
    // 弹窗取消按钮
    callOff() {}
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
}

/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #ffffff;
}

.org-type {
  padding-left: 60px;
}

.headline {
  background: #fff;
  font-size: 14px;

  .item {
    padding: 0 10px;
  }
}

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
.search-bgc {
  line-height: 50px;
  border-radius: 5px;
  background-color: #fff;
  font-size: 12px;
}
/deep/ .el-dialog__body .table-data {
  margin-top: 0 !important;
  padding-top: 0;
}
</style>
