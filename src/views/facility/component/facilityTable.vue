<template>
  <div class="app-container" v-loading="loading" @click="treeClose">
    <!-- 搜索栏 -->
    <div class="header-seach" v-if="user.orgType !== 5">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="标段项目">
          <!-- <el-select v-model="inpData.projectBidId" size="mini" class="wh-140" @change="proChange">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
      </el-form>
    </div>
    <div class="header-seach" v-if="typeShow">
      <el-form :inline="true" class="myform" label-width="72px">
        <!-- <el-form-item label="标段项目" v-if="user.orgType !== 5">
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item> -->
        <el-form-item label="设备类型">
          <treeSelect :defaultProps="defaultProps" class="wh-200" :showCheckbox="false" :nodeKey="'pkId'" :checkedList="checkedList" :treeList="deviceTypeData" @selectIds="deviceTypeChecked" ref="deviceTypeTree" />
        </el-form-item>
        <el-form-item label="使用部门">
          <el-select v-model="inpData.fkDeptId" size="mini" class="wh-140">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in userDepartment" :key="item.pkId" :value="item.pkId" :label="item.deptName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用部位">
          <treeSelect :defaultProps="defaultProps" class="wh-200" :showCheckbox="false" :nodeKey="'pkId'" :checkedList="checkedList" :treeList="treeData" @selectIds="treeChecked" ref="treeSelect" />
        </el-form-item>
        <el-form-item label="使用状态">
          <el-select v-model="inpData.enableStatus" size="mini" class="wh-140">
            <!-- <el-option value="" label="全部"></el-option> -->
            <el-option value="0" label="服务中"></el-option>
            <el-option value="1" label="已过期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input size="mini" type="text" class="wh-140" v-model="inpData.deviceName" maxlength="50"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" icon="el-icon-search" class="ml-20 search" @click="btnSearch">查询</el-button>
      </el-form>
      <el-button size="mini" type="primary" @click="addFacility" v-if="user.orgType === 5">新增</el-button>
    </div>
    <div v-if="typeShow" class="table-data" style="margin-top: 10px;" :style="{ height: hd }">
      <el-table ref="tables3" :key="randomKey" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType === 4" show-overflow-tooltip> </el-table-column>

        <el-table-column label="设备类型" prop="className" align="center" show-overflow-tooltip> </el-table-column>

        <el-table-column label="设备名称" prop="deviceName" align="center">
          <template slot-scope="{ row }">
            <span class="overHidden" :title="row.deviceName">{{ row.deviceName }}</span>
          </template>
        </el-table-column>

        <el-table-column label="设备型号" prop="deviceCode" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="(tableType === 1 ? '购买' : '租赁') + '单价'" prop="price" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="(tableType === 1 ? '购买' : '租赁') + '数量'" prop="buyNum" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="单位" prop="unitName" align="center"> </el-table-column>
        <el-table-column :label="(tableType === 1 ? '购买' : '租赁') + '日期'" prop="consumeTime" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="tableType === 1 ? '使用期限（月）' : '租用期限（月'" prop="liveTime" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="(tableType === 1 ? '月折旧价' : '月租金') + '（元）'" prop="depreciationPrice" align="center" show-overflow-tooltip> </el-table-column>
        <!-- <el-table-column  :label="tableType === 1 ?'已使用时间（月）':'使用期限（月）'" prop="liveUsedTime" align="center"> </el-table-column> -->

        <el-table-column v-show="tableType != 1" label="使用期限（月）" prop="liveTime" align="center"> </el-table-column>

        <el-table-column :label="tableType === 1 ? '购买金额' : '使用成本合计'" v-show="tableType != 1" prop="priceAmount" align="center" show-overflow-tooltip> </el-table-column>
        <!-- <el-table-column :label="(tableType === 1 ? '购买单价' : '租赁单价') + '小计'" prop="priceAmount" align="center" show-overflow-tooltip> </el-table-column> -->
        <el-table-column label="使用状态" prop="enableStatus" align="center">
          <template slot-scope="{ row }">
            <span v-if="row.enableStatus == 0">服务中</span>
            <span v-if="row.enableStatus == 1">已过期</span>
          </template>
        </el-table-column>
        <el-table-column label="使用部门" prop="deptName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="使用部位" prop="itemName" align="center" show-overflow-tooltip>
          <!-- <template slot-scope="{row}">
          <span class="overHidden" :title="row.itemName">{{row.itemName}}</span>
        </template> -->
        </el-table-column>
        <el-table-column label="操作" align="center" width="250px">
          <template slot-scope="{ row }">
            <el-button plain size="mini" type="primary" @click="openFacility(1, row)">查看</el-button>
            <el-button plain size="mini" type="warning" @click="openFacility(3, row)" v-if="user.orgType === 5 && row.isUpdateAndDelete == '1'">编辑</el-button>
            <el-button plain size="mini" type="danger" @click="facilitydel(row)" v-if="user.orgType === 5 && row.isUpdateAndDelete == '1'">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <tablePaging v-if="typeShow" :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <facilityDialog :facilityDialogTitle="facilityDialogTitle" :deviceId="deviceId" :dialogType="tableType" :facilityDialog="facilityDialog" :openType="openType" @closeFacilityDialog="closeFacilityDialog" :treeSelectData="treeData" :treeDefaultProps="defaultProps" />
  </div>
</template>

<script>
import facilityDialog from "./facilityDialog.vue";
import treeSelect from "./treeSelect.vue";
export default {
  props: {
    tableType: {
      type: Number
    },
    consumeType: {
      type: Number
    }
  },
  components: { facilityDialog, treeSelect },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    hd() {
      return this.user.orgType !== 5 ? "69%" : "81%";
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

    if (this.user.orgType === 5) {
      this.searchItemsByProjectId("");
      this.btnSearch();
    } else {
      this.getAllProject();
    }
    this.projDeviceList();
    this.searchByTree();
  },
  data() {
    return {
      proOptions: [],
      loading: false,
      page: {
        pageSize: 10,
        pageNum: 1,
        sourceType: 1
      }, // 分页数据
      total: 0, // 分页总数
      tableData: [], // 列表数据
      searchData: {}, // 搜素请求时的数据
      inpData: {
        beginTime: "",
        endTime: "",
        deviceTypeId: "",
        projectBidId: "",
        fkDeptId: "",
        fkItemId: "",
        enableStatus: "",
        deviceName: ""
      },
      randomKey: Math.random(),
      facilityDialogTitle: "",
      facilityDialog: false,
      openType: 1,
      treeData: [],
      checkedList: [],
      defaultProps: {
        children: "children",
        label: "itemName"
      },
      deviceTypeData: [],
      userDepartment: [],
      deviceId: "",
      typeShow: true
      // hd:""
    };
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.inpData.projectBidId = arr[1];
        } else {
          this.inpData.projectBidId = arr[0];
        }
        if (isTrue) {
          this.btnSearch();
        }
        this.proChange(this.inpData.projectBidId);
      }
    },
    // 关闭下拉框弹出不关闭问题
    treeClose() {
      this.$refs.treeSelect.showTree = false;
      this.$refs.deviceTypeTree.showTree = false;
    },
    searchPage() {
      const data = {
        pageSize: this.page.pageSize,
        pageNum: this.page.pageNum,
        sourceType: this.page.sourceType,
        consumeType: this.consumeType
      };
      const termData = Object.assign(this.searchData, data);
      this.$api.facilitySearchPage(termData).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.total = parseInt(res.data.total);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 使用部门
    projDeviceList() {
      this.$api.projDeviceList().then(res => {
        if (res.code == 200) {
          this.userDepartment = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取设备类型
    searchByTree() {
      this.$api.searchByTree().then(res => {
        if (res.code == 200) {
          this.deviceTypeData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分项工程
    searchItemsByProjectId(id) {
      this.$api.searchItemsByProjectId({ projectId: id }).then(res => {
        if (res.code == 200) {
          this.treeData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    proChange(e) {
      this.searchItemsByProjectId(e);
    },
    treeChecked(nodes, ids) {
      this.inpData.fkItemId = ids.pkId;
    },
    deviceTypeChecked(nodes, ids) {
      console.log(nodes, ids);
      this.inpData.deviceTypeId = ids.pkId;
    },
    addFacility() {
      this.openType = 2;
      this.facilityDialogTitle = this.tableType == 1 ? "设备购买-新增" : "设备租赁-新增";
      this.facilityDialog = true;
    },
    openFacility(type, row) {
      this.openType = type;
      // projDeviceFindById
      this.deviceId = row.pkId;

      this.facilityDialogTitle = type == 1 ? "查看" : "编辑";
      this.facilityDialog = true;
    },
    closeFacilityDialog(status) {
      this.facilityDialog = false;
      if (status) {
        this.btnSearch();
      }
    },
    facilitydel(row) {
      this.$confirm("确定删除该设备?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        // projDeviceDelete
        this.$api.projDeviceDelete({ pkId: row.pkId }).then(res => {
          if (res.code == 200) {
            this.$message.success("删除成功");
            this.btnSearch();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };

      for (const key in this.searchData) {
        if (this.searchData[key] == "" || this.searchData[key] == undefined) {
          delete this.searchData[key];
        }
      }
      this.searchPage();
    },

    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      // pageSize
      this.searchPage();
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchPage();
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    }
  }
};
</script>

<style lang="scss" scoped>
.device-name::after {
  content: "*";
  color: red;
  display: inline-block;
  position: relative;
  left: 5px;
  transform: translateY(-50%);
}
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 5px;
  padding: 0 20px;
  margin-bottom: 5px;
  .myform {
    align-items: center;
    margin-top: 20px;
  }
}
.search {
  margin-top: 6px;
}
.overHidden {
  overflow: hidden; //溢出内容隐藏
  text-overflow: ellipsis; //文本溢出部分用省略号表示
  display: -webkit-box; //特别显示模式
  -webkit-line-clamp: 2; //行数
  line-clamp: 2;
  -webkit-box-orient: vertical; //盒子中内容竖直排列
}
</style>
