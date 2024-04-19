<template>
  <div class="app-container" v-loading="loading">
    <!-- <el-radio-group v-model="topRadio" size="mini" v-if="user.orgType === 5" @change="changeTopRadio">
      <el-radio-button :label="1">总分项工程</el-radio-button>
      <el-radio-button :label="2">按工区</el-radio-button>
      <el-radio-button :label="3">按分包单位</el-radio-button>
    </el-radio-group> -->
    <div class="topTabs">
      <el-tabs v-model="topRadio" v-if="user.orgType === 5" @tab-click="changeTopRadio">
        <el-tab-pane label="总分项工程" name="1"></el-tab-pane>
        <el-tab-pane label="按工区" name="2"></el-tab-pane>
        <el-tab-pane label="按分包单位" name="3"></el-tab-pane>
      </el-tabs>
    </div>
    <div class="dirver"></div>
    <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="标段项目" v-if="user.orgType !== 5">
          <!-- <el-select v-model="inpData.projectBidId" size="mini" class="wh-140" @change="proChange($event, 1)">
            <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
        <el-form-item label="物料类型" v-if="typeShow">
          <el-cascader size="mini" style="width: 100%" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.materialTypeId" filterable></el-cascader>
          <!-- <el-select v-model="inpData.materialTypeId" :disabled="user.orgType == 4 && !inpData.projectBidId" size="mini" class="wh-200">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in materOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item label="物料名称" v-if="typeShow">
          <el-input size="mini" v-model="inpData.materialName" maxlength="50"></el-input>
        </el-form-item>
        <el-button size="mini" v-if="typeShow" type="primary" icon="el-icon-search" class="ml-20 search" @click="btnSearch">查询</el-button>
      </el-form>
    </div>
    <div class="table-data" style="height: 77%" v-if="typeShow">
      <el-table height="100%" ref="tables" :key="ranKey" v-if="topRadio == 1" :data="tableData" :tree-props="{ children: 'childList' }" row-key="pkId" :header-cell-style="{ background: '#f1f6ff' }">
        <!-- <el-table-column align="center" label="序号" type="index" width="80" /> -->
        <el-table-column>
          <template slot="header" slot-scope="scope">
            <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
            <span>{{ topRadio == 1 ? "物料分类" : topRadio == 2 ? "工区" : topRadio == 3 ? "分包单位" : "" }}</span>
          </template>
          <template slot-scope="{ row }">
            <span>{{ row.isChildren === 1 ? row.typeName : "" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="物料名称">
          <template slot-scope="{ row }">
            <span>{{ row.isChildren === 0 ? row.typeName : "" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="单位" prop="unitName" />
        <!-- <el-table-column align="center" label="单价" prop="" /> -->
        <el-table-column align="center" label="设计用量" prop="designQuantities" />
        <!-- <el-table-column align="center" label="设计金额" prop="" /> -->
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-table height="100%" ref="tables" :key="ranKey" v-if="topRadio != 1" :data="tableData" :tree-props="{ children: 'childList' }" row-key="setId" stripe :header-cell-style="{ background: '#f1f6ff' }">
        <!-- <el-table-column align="center" label="序号" type="index" width="80" /> -->
        <el-table-column>
          <template slot="header" slot-scope="scope">
            <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
            <span>{{ topRadio == 1 ? "物料分类" : topRadio == 2 ? "工区" : topRadio == 3 ? "分包单位" : "" }}</span>
          </template>
          <template slot-scope="{ row }">
            <span>{{ row.isChildren === 1 ? row.typeName : "" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="物料名称">
          <template slot-scope="{ row }">
            <span>{{ row.isChildren === 0 ? row.typeName : "" }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="单位" prop="unitName" />
        <!-- <el-table-column align="center" label="单价" prop="" /> -->
        <el-table-column align="center" label="设计用量" prop="designQuantities" />
        <!-- <el-table-column align="center" label="设计金额" prop="" /> -->
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  data() {
    return {
      loading: false,
      topRadio: "1",
      inpData: {
        projectBidId: "",
        materialTypeId: "0",
        materialName: ""
      },
      searchData: {
        projectBidId: "",
        materialTypeId: "",
        materialName: ""
      },
      materOptions: [],
      proOptions: [],
      tableData: [],
      ranKey: Math.random(),
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        emitPath: false
      },
      showIndex: 1,
      isExpand: false,
      typeShow:true
    };
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        if (this.user.orgType !== 5) {
          // this.getAllProject();
        } else {
          this.searchMaterialTypeByProjectId();
          this.searchMaterialTypesByProjectId();
        }
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          console.log("11111111111111111111")
          console.log(arr)
          console.log(obj)
          console.log(isTrue)
          this.inpData.projectBidId = arr[1];
        } else {
          console.log("2222222222222")
          console.log(arr)
          console.log(obj)
          console.log(isTrue)
          this.inpData.projectBidId = arr[0];
        }
        if (isTrue) {
          this.btnSearch();
        }
        this.proChange(this.inpData.projectBidId, 1);
        this.searchMaterialTypeByProjectId();
      }
    },
    // 获取标段项目
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
          if (res.data && res.data.length) {
            this.inpData.projectBidId = res.data[0].pkId;
            this.searchData.projectBidId = res.data[0].pkId;
            // projectBidId
            this.searchMaterialTypeByProjectId();
            this.searchMaterialTypesByProjectId();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取材料分类
    searchMaterialTypeByProjectId() {
      this.$api.searchMaterialTypeByProjectId({ projectId:  this.inpData.projectBidId }).then(res => {
        if (res.code === 200) {
          this.materOptions = [{ pkId: "0", typeName: "全部" }, ...res.data];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchMaterialTypesByProjectId() {
      this.loading = true;
      this.$api
        .searchMaterialTypesByProjectId(this.searchData)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data;
            this.ranKey = Math.random();
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    searchItemMaterialTypes() {
      let data = {
        ...this.searchData,
        type: this.topRadio == 2 ? 1 : this.topRadio == 3 ? 2 : ""
      };
      this.showIndex = 1;
      delete data.projectBidId;
      this.loading = true;
      this.$api
        .searchItemMaterialTypes(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            console.log(res);
            let list = res.data;
            this.addOnlyKey(list);
            this.tableData = res.data;
            this.ranKey = Math.random();
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    addOnlyKey(list) {
      //  childList
      list.forEach(item => {
        item.setId = this.showIndex;
        this.showIndex++;
        if (item.childList) {
          this.addOnlyKey(item.childList);
        }
      });
    },
    changeTopRadio(e) {
      // this.cleanSearch();
      this.tableData = [];
      this.isExpand = false;
      this.getList();
    },
    proChange(e) {
      this.searchMaterialTypeByProjectId();
    },
    btnSearch() {
      this.searchData = { ...this.inpData, materialTypeId: this.inpData.materialTypeId === "0" ? "" : this.inpData.materialTypeId };
      // this.inpData
      this.getList();
    },
    getList() {
      if (this.topRadio == 1) {
        // alert(11111)
        this.searchMaterialTypesByProjectId();
      } else {
        this.searchItemMaterialTypes();
      }
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        this.forArr(this[list], this[isExpand], ref);
      });
    },
    // 遍历
    forArr(arr, isExpand, ref) {
      arr.forEach(i => {
        if (!i.childList) {
          return;
        }
        if (!i.childList.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.childList && i.childList.length) {
          this.forArr(i.childList, isExpand, ref);
        }
      });
    },
    cleanSearch() {
      this.inpData = {
        projectBidId: "",
        materialTypeId: "0",
        materialName: ""
      };
      this.searchData = {
        projectBidId: "",
        materialTypeId: "",
        materialName: ""
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.table-data {
  /deep/ .el-icon-arrow-right:before {
    content: "\e791";
    font-size: 16px;
  }
}
.topTabs {
  padding: 5px;
  background-color: #fff;
}
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
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
.dirver {
  height: 12px;
  background-color: #fafbfc;
}
</style>
