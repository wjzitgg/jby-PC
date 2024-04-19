<template>
  <div>
    <el-dialog title="标段仓库管理" width="60%" :visible="bidWarehouseDialog" @close="closeWarehouseDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
      <div class="header">
        <div class="search">
          <div class="search-item" v-if="[7].includes(user.orgType)">
            <span class="labels">标段项目</span>
            <el-select v-model="inpData.fkBidProjectId" size="mini" class="wh-180">
              <!-- <el-option value="" label="全部"></el-option> -->
              <!-- <el-option value="0" label="无"></el-option> -->
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </div>
          <div class="search-item">
            <span class="labels w-50">状态</span>
            <el-select v-model="inpData.enableStatus" size="mini" class="wh-100">
              <el-option v-for="item in typeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </div>
          <div class="search-item">
            <span class="labels">仓库名称</span>
            <el-input size="mini" class="wh-140" v-model="inpData.warehouseName" maxlength="25"></el-input>
          </div>
          <el-button size="mini" type="primary" icon="el-icon-search" class="ml-20 el-button-primary" @click="btnSearch">查询</el-button>
        </div>
        <el-button type="primary" class="el-button-primary" size="mini" @click="openWareDialog(2)" v-if="user.orgType !== 4&&user.orgType !== 10">新增仓库</el-button>
      </div>
      <div class="tables table-data">
        <el-table style="width: 100%" height="100%" :data="tableData" ref="tables" stripe :header-cell-style="{ background: '#f1f6ff'}">
          <el-table-column label="序号" align="center" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="标段项目" align="center" prop="bidProjectName"> </el-table-column>
          <el-table-column label="仓库名称" align="center" prop="warehouseName"> </el-table-column>
          <el-table-column label="负责人" align="center" prop="userName"> </el-table-column>
          <el-table-column label="手机号码" align="center" prop="phoneNum"> </el-table-column>
          <el-table-column label="默认仓库" align="center">
            <template slot-scope="{ row }">
              <span>{{ row.isDefault === 1 ? "是" : "否" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="仓库类型" align="center" prop="">
            <template slot-scope="{ row }">
              <span>{{ row.warehouseType === 1 ? "实体仓" : "虚拟仓" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="detailAddress">
            <template slot-scope="{ row }">
              {{ row.enableStatus === 1 ? "正常" : "停用" }}
            </template>
          </el-table-column>
          <el-table-column label="地址" align="center" prop="detailAddress"> </el-table-column>
          <el-table-column label="操作" align="center" width="300">
            <template slot-scope="{ row }">
              <el-button size="mini" type="primary" plain @click="openWareDialog(1, row)">查看</el-button>
              <el-button size="mini" plain type="success" @click="openWareDialog(3, row)" v-if="user.orgType !== 4&&user.orgType !== 10">编辑</el-button>
              <el-button size="mini" plain :type="row.enableStatus === 1 ? 'danger' : 'primary'" @click="startOrStop(row)" v-if="user.orgType !== 4&&user.orgType !== 10">{{ row.enableStatus === 1 ? "停用" : "启用" }}</el-button>
              <el-button size="mini" plain type="danger" @click="delWare(row)" v-if="user.orgType !== 4&&user.orgType !== 10 && row.warehouseType === 1">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="bidWarehouseDialog"></tablePaging>
      </div>
    </el-dialog>
    <el-dialog center :title="wareDialogTitle" :visible="wareDialog" @close="closeWareDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
      <el-form ref="wareForm" :model="wareForm" :rules="rules" label-width="80px">
        <el-form-item label="仓库名称">
          <el-input v-model="wareForm.warehouseName" maxlength="25" size="mini" :disabled="wareDialogType === 1"></el-input>
        </el-form-item>
        <el-form-item label="标段项目" v-if="[7].includes(user.orgType)">
          <el-select v-model="wareForm.fkBidProjectId" size="mini" style="width:100%" :disabled="wareDialogType === 1">
            <!-- <el-option value="0" label="无"></el-option> -->
            <el-option v-for="item in addproOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="仓库类型">
          <el-input :value="wareForm.warehouseType === 1 ? '实体仓' : '虚拟仓'" size="mini" disabled> </el-input>
        </el-form-item>
        <el-form-item label="负责人">
          <el-cascader size="mini" style="width: 100%" ref="cascader" v-if="wareDialogType !== 1" :options="deptOptions" clearable :props="defaultProps" :emitPath="false" v-model="wareForm.fkUserId" filterable @change="peopleChange"></el-cascader>
          <el-input :value="wareForm.userName" size="mini" v-if="wareDialogType === 1" disabled> </el-input>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="wareForm.phoneNum" size="mini" disabled></el-input>
        </el-form-item>
        <el-form-item label="项目地点" class="elect" v-if="wareDialogType !== 1 && wareForm.warehouseType === 1">
          <el-select size="mini" class="wh-100" v-model="address.province" @change="provinceChange">
            <el-option v-for="item in provinceList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
          </el-select>
          <el-select size="mini" class="wh-100" v-model="address.city" @change="cityChange" :disabled="!address.province">
            <el-option v-for="item in cityList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
          </el-select>
          <el-select size="mini" class="wh-100" v-model="address.area" :disabled="!address.city">
            <el-option v-for="item in areaList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
          </el-select>
          <el-input size="mini" v-model="address.place" class="wh-400" maxlength="70"></el-input>
          <i class="iconfont icondingwei" @click="appear"></i>
          <div class="bd-map" v-if="mapStatus">
            <i class="el-icon-circle-close" @click="appear"></i>
            <bdMap @detailedAddress="detailedAddress" :lat="wareForm.longitude" :lng="wareForm.latitude" ref="map" @point="point"></bdMap>
          </div>
        </el-form-item>
        <el-form-item label="项目地点" v-if="wareDialogType === 1 && wareForm.warehouseType === 1">
          <el-input size="mini" v-model="wareForm.detailAddress" disabled></el-input>
        </el-form-item>
        <el-form-item label="备注" v-if="wareForm.warehouseType === 1">
          <el-input v-model="wareForm.remark" type="textarea" resize="none" rows="4" :disabled="wareDialogType === 1" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="是否默认">
          <el-switch :active-value="1" :inactive-value="0" v-model="wareForm.isDefault" :disabled="wareDialogType === 1"></el-switch>
        </el-form-item>
      </el-form>
      </div>
      <div slot="footer">
        <el-button type="primary" plain @click="closeWareDialog">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="wareDialogOk" v-if="wareDialogType !== 1">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import bdMap from "@/components/bdMap/bdMap";
export default {
  components: { bdMap },
  props: {
    bidWarehouseDialog: {
      type: Boolean
    },
    fkOrgId: ""
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      loading: false,
      tableData: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      inpData: {
        warehouseName: "",
        enableStatus: "",
        fkBidProjectId: ""
      },
      searchData: {},
      proOptions: [],
      wareDialogTitle: "",
      wareDialog: false,
      wareDialogType: 1,
      wareForm: {
        address: "",
        areaCode: "",
        areaName: "",
        cityCode: "",
        cityName: "",
        detailAddress: "",
        fkBidProjectId: "",
        fkUserId: "",
        isDefault: 0,
        provinceCode: "",
        provinceName: "",
        remark: "",
        warehouseName: "",
        warehouseType: 1,
        latitude: "",
        longitude: ""
      },
      rules: {},
      mapStatus: false,
      provinceList: [],
      cityList: [],
      areaList: [],
      address: {
        province: "", //省
        city: "", //市
        area: "", //区
        place: "" //地址
      },
      deptOptions: [],
      typeList: [
        { value: "", label: "全部" },
        { value: 1, label: "正常" },
        { value: 0, label: "停用" }
      ],
      defaultProps: {
        value: "pkId",
        label: "aliasName",
        children: "children",
        emitPath: false
      },
      addproOptions:[]
    };
  },
  methods: {
    // 获取部门以及员工
    getAllDeptAndStaff(orgId) {
      this.$api.getAllDeptAndStaff({ orgId }).then(res => {
        if (res.code === 200) {
          this.deptOptions = res.data.children ? res.data.children.map(item => ({ ...item, value: item.pkId, label: item.deptName })) : [];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.addproOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getWarehouseProject(isFirst){
      this.$api.getWarehouseProject().then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
          if(isFirst){
            this.inpData.fkBidProjectId = this.proOptions.length ? this.proOptions[0].pkId : "";
            this.searchData.fkBidProjectId = this.proOptions.length ? this.proOptions[0].pkId : "";
          }
          this.searchWarehousePage();
        } else {
          this.$message.warning(res.msg);
        }
      })
    },
    // 分页列表
    searchWarehousePage() {
      let data = { ...this.page, ...this.searchData };
      if (this.user.orgType === 4||this.user.orgType === 10) {
        data.fkBidProjectId = this.fkOrgId;
      }
      this.$api.projectWarehouseSearchPage(data).then(res => {
        console.log("仓库分页", res);
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findWarehouseById(pkId, row) {
      this.$api.findWarehouseById({ pkId }).then(res => {
        if (res.code === 200) {
          this.wareForm = res.data;
          this.wareForm.phoneNum = row.phoneNum;
          if (this.wareForm.warehouseType === 1) {
            this.address = {
              province: res.data.provinceName, //省
              city: res.data.cityName, //市
              area: res.data.areaName, //区
              place: res.data.address //地址
            };
            console.log(this.address,this.provinceList.filter(item => this.address.province.indexOf(item.areaName)!== -1));
            let id1 = this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1)[0].pkId;
            this.getCityList(id1,2)
          }
          this.wareDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    peopleChange(e) {
      if (e) {
        console.log(e, this.$refs.cascader.getCheckedNodes());
        let people = this.$refs.cascader.getCheckedNodes()[0].data;
        // this.wareForm.people = people.aliasName; //pkId
        this.wareForm.phoneNum = people.telephone;
      } else {
        this.wareForm.phoneNum = "";
      }
    },
    closeWarehouseDialog() {
      this.$emit("update:bidWarehouseDialog", false);
      this.mapStatus = false;
    },
    // 启用和停用
    startOrStop(row) {
      this.$confirm(`确定${row.enableStatus === 1 ? "停用" : "启用"}该仓库?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        if (row.isDefault === 1 && row.enableStatus === 1) {
          return this.$message.warning("不能停用默认仓库");
        }
        this.$api.toggleRepository({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("操作成功");
            this.searchWarehousePage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    openWareDialog(type, row) {
      this.wareDialogType = type;
      if (type === 1) {
        this.wareDialogTitle = "查看仓库";
        this.findWarehouseById(row.pkId, row);
      } else if (type === 2) {
        this.wareDialogTitle = "新增仓库";
        this.wareDialog = true;
      } else {
        this.findWarehouseById(row.pkId, row);
        this.wareDialogTitle = "编辑仓库";
      }
    },
    wareDialogOk() {
      if (!this.wareForm.warehouseName) {
        return this.$message.warning("请填写仓库名称");
      }
      if (!this.wareForm.fkUserId) {
        return this.$message.warning("请选择负责人");
      }
      if (this.user.orgType === 7 && !this.wareForm.fkBidProjectId) {
        return this.$message.warning("请选择标段项目");
      }
      if (this.wareForm.warehouseType === 1) {
        if (!this.address.province) {
          return this.$message.warning("请选择省份");
        }
        if (!this.address.city) {
          return this.$message.warning("请选择城市");
        }
        if (!this.address.area) {
          return this.$message.warning("请选择区域");
        }
        let province = this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1);
        let city = this.cityList.filter(item => this.address.city.indexOf(item.areaName) !== -1);
        let area = this.areaList.filter(item => item.areaName === this.address.area);
        this.wareForm = {
          ...this.wareForm,
          provinceName: province[0].areaName,
          provinceCode: province[0].pkId,
          cityCode: city[0].pkId,
          cityName: city[0].areaName,
          areaCode: area[0].pkId,
          areaName: area[0].areaName,
          address: this.address.place,
          detailAddress: province[0].areaName + city[0].areaName + area[0].areaName + this.address.place
        };
      }
      this.loading = true;
      if (this.wareDialogType === 2) {
        this.$api
          .addWarehouse(this.wareForm)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.getWarehouseProject();
              this.searchWarehousePage();
              this.closeWareDialog();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else if (this.wareDialogType === 3) {
        this.$api
          .updateWarehouse(this.wareForm)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.getWarehouseProject();
              this.searchWarehousePage();
              this.closeWareDialog();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    closeWareDialog() {
      this.wareDialog = false;
      this.wareForm = {
        address: "",
        areaCode: "",
        areaName: "",
        cityCode: "",
        cityName: "",
        detailAddress: "",
        fkBidProjectId: "",
        fkUserId: "",
        isDefault: 0,
        provinceCode: "",
        provinceName: "",
        remark: "",
        warehouseName: "",
        warehouseType: 1,
        latitude: "",
        longitude: ""
      };
      this.address = {
        province: "", //省
        city: "", //市
        area: "", //区
        place: "" //地址
      };
    },
    delWare(row) {
      this.$confirm("确定删除该仓库?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        if (row.isDefault === 1) {
          return this.$message.warning("不能删除默认仓库");
        }
        this.$api.delWarehouse({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("操作成功");
            this.getWarehouseProject();
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.searchWarehousePage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchWarehousePage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchWarehousePage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchWarehousePage();
    },
    // 获取省级地区
    getProvinceList() {
      this.$api.getProvinceList({ countryId: 45 }).then(res => {
        if (res.code === 200) {
          this.provinceList = res.data;
          let { province } = this.address;
          if (province) {
            this.cityList = this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1)[0].sysCityAreaList;
            this.areaList = this.cityList.filter(item => item.areaName === this.address.city)[0].sysAreaList;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getCityList(provinceId, type) {
      this.$api.getCityList({ provinceId }).then(res => {
        if (res.code === 200) {
          this.cityList = res.data;
          if (type === 2) {
            let id = res.data.filter(item => this.address.city.indexOf(item.areaName) !== -1)[0].pkId;
            this.getAreaList(id);
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getAreaList(cityId) {
      this.$api.getAreaList({ cityId }).then(res => {
        if (res.code === 200) {
          this.areaList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 省份变化
    provinceChange() {
      this.address.city = "";
      this.address.area = "";
      let province = this.provinceList.filter(item => item.areaName.indexOf(this.address.province) !== -1);
      this.getCityList(province[0].pkId);
      // this.cityList = province[0].sysCityAreaList;
    },
    // 城市变化
    cityChange() {
      this.address.area = "";
      let city = this.cityList.filter(item => item.areaName === this.address.city);
      this.getAreaList(city[0].pkId);
      // this.areaList = city[0].sysAreaList;
    },
    // 地图
    appear() {
      this.mapStatus = !this.mapStatus;
    },
    // 地图详细地址
    detailedAddress(data) {
      this.cityList = [];
      this.areaList = [];
      let { addressComponents, point } = data;
      this.address = {
        ...this.address,
        province: addressComponents.province,
        city: addressComponents.city,
        area: addressComponents.district,
        place: addressComponents.street + addressComponents.streetNumber
      };
      let id1 = this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1)[0].pkId;
      //  let id2 = this.cityList.filter(item => item.areaName.indexOf(this.address.city) !== -1)[0].sysAreaList;
      this.getCityList(id1, 2);
      this.wareForm.latitude = point.lng;
      this.wareForm.longitude = point.lat;
      this.mapStatus = false;
    },
    // 获取地址
    point(point) {
      this.wareForm.latitude = point.lng;
      this.wareForm.longitude = point.lat;
    }
  },

  watch: {
    bidWarehouseDialog(val) {
      if (val) {
        if (this.user.orgType !== 4&&this.user.orgType !== 10) {
          this.getProvinceList();
          this.getAllDeptAndStaff(this.user.fkOrgId);
        }
        if (this.user.orgType === 7) {
          this.getAllProject();
          this.getWarehouseProject(true);
        } else {
          this.searchWarehousePage();
        }
      }
    },
    address: {
      handler(val) {
        let detail = val.province + val.city + val.area + val.place;
        if (this.$refs.map) {
          this.$refs.map.getLngAndLat(detail);
        }
      },
      deep: true
    },
    mapStatus(val) {
      if (val) {
        this.$nextTick(() => {
          if (!this.address.province && !this.address.city && !this.address.area && !this.address.place) {
            return;
          }
          this.$refs.map.getLngAndLat(this.address.province + this.address.city + this.address.area + this.address.place);
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.tables {
  height: 500px;
}
.elect {
  .el-select {
    margin-right: 10px;
  }
  /deep/ .el-form-item__content {
    display: flex;
    .icondingwei {
      color: blue;
      cursor: pointer;
      &::before {
        font-size: 24px;
      }
    }
  }
}
.wh-300 {
  width: 300px;
}
.bd-map {
  width: 400px;
  position: absolute;
  right: -100px;
  top: 50px;
  border: 1px solid #f3f3f3;
  z-index: 99;
  .el-icon-circle-close {
    cursor: pointer;
    font-size: 20px;
    position: absolute;
    top: -22px;
    left: 48%;
  }
}
.search {
  display: flex;
  align-items: center;
  .search-item {
    display: flex;
    align-items: center;
    .labels {
      width: 72px;
      text-align: center;
    }
    .w-50 {
      width: 50px;
    }
  }
}
</style>
