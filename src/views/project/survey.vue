<template>
  <div class="app-container">
    <!-- <div v-if="user.orgType !== 5" style="height: 100%">
      <div slot="header" class="clearfix card-header">
        <div class="head">
          <el-form ref="form" label-width="80px">
            <el-form-item label="项目名称">
              <el-input size="mini" v-model="searchName" maxlength="50"></el-input>
            </el-form-item>
            <el-button size="mini" type="primary" class="btn-serach el-button-primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
          </el-form>
          <el-button size="mini" type="primary" class="addBtn el-button-primary" @click="handleOpen(1)" v-has="'project:survey:add'">新增项目概况</el-button>
        </div>
      </div>
      <div class="tab-container table-data">
        <el-table ref="tables" :data="tableData" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
          <el-table-column label="序号" type="index" width="80" align="center">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="项目名称" prop="projectName" align="center"> </el-table-column>
          <el-table-column label="合同金额" prop="contractAmount" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="工期" prop="duration" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="开工日期" prop="beginTime" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="竣工日期" prop="endTime" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="项目地点" prop="detailAddress" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" align="center" width="400">
            <template slot-scope="{ row }">
              <el-button size="mini" plain type="primary" @click="handleOpen(2, row.pkId)" v-has="'project:survey:query'">查看</el-button>
              <el-button size="mini" plain type="success" v-has="'project:survey:edit'" @click="handleOpen(1, row.pkId)">编辑</el-button>
              <el-button size="mini" plain v-has="'project:survey:delete'" type="danger" @click="handleDel(row.pkId)">删除</el-button>
              <el-button size="mini" plain @click="openLinkDialog(row.pkId)">关联标段项目</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
      <el-dialog :close-on-press-escape="false" :title="title" :visible="dialogVisible" @close="handleCancel" ref="model" v-loading="loading" :close-on-click-modal="false">
        <div class="dialog-form">
          <el-form :model="formData" label-width="120px" :rules="rules" ref="formData">
            <el-form-item label="项目名称：" prop="projectName">
              <el-input size="mini" v-model="formData.projectName" :disabled="dialogType === 2" :minlength="2" :maxlength="50" class="wh-400"></el-input>
            </el-form-item>
            <el-form-item label="项目地点：" class="elect" v-if="dialogType === 1">
              <el-select size="mini" class="wh-100" v-model="address.province" @change="provinceChange">
                <el-option v-for="item in provinceList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
              </el-select>
              <el-select size="mini" class="wh-100" v-model="address.city" @change="cityChange">
                <el-option v-for="item in cityList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
              </el-select>
              <el-select size="mini" class="wh-100" v-model="address.area">
                <el-option v-for="item in areaList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
              </el-select>
              <el-input size="mini" v-model="address.place" :disabled="dialogType === 2" class="wh-400" maxlength="70"></el-input>
              <i class="iconfont icondingwei" @click="appear"></i>
              <div class="bd-map" v-show="mapStatus && dialogVisible">
                <i class="el-icon-circle-close" @click="appear"></i>
                <bdMap @detailedAddress="detailedAddress" :lat="formData.longitude" :lng="formData.latitude" ref="map" @point="point"></bdMap>
              </div>
            </el-form-item>
            <el-form-item label="项目地点：" v-if="dialogType === 2">
              <el-input size="mini" class="wh-400" v-model="formData.detailAddress" disabled></el-input>
            </el-form-item>
            <el-form-item label="项目金额：" prop="contractAmount">
              <el-input size="mini" v-model.trim="formData.contractAmount" :disabled="dialogType === 2" class="wh-400" type="number" @input="input" @keydown.native="moneyKeyDown"></el-input>
            </el-form-item>
            <el-form-item label="工期：" prop="duration">
              <el-input size="mini" v-model="formData.duration" :disabled="dialogType === 2" class="wh-400" maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="开工日期：" prop="beginTime">
              <el-date-picker size="mini" v-model="formData.beginTime" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="选择日期时间" :disabled="dialogType === 2"> </el-date-picker>
            </el-form-item>
            <el-form-item label="竣工日期：" prop="endTime">
              <el-date-picker size="mini" v-model="formData.endTime" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" placeholder="选择日期时间" :disabled="dialogType === 2"> </el-date-picker>
            </el-form-item>
            <el-form-item label="项目描述：" class="changelh">
              <el-input v-model="formData.remark" type="textarea" maxlength="100" show-word-limit resize="none" rows="4" :disabled="dialogType === 2"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer" v-if="dialogType === 1">
          <el-button type="primary" plain @click="handleCancel">取 消</el-button>
          <el-button type="primary" class="el-button-primary" @click="btnOk">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog :close-on-press-escape="false" title="关联标段项目" :visible="linkDialogVisible" @close="closeLinkDialog" width="30%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
        <div v-if="bindList.length" class="bind">
          <el-checkbox-group v-model="checkList">
            <el-checkbox v-for="item in bindList" :key="item.pkId" :label="item.pkId" :disabled="item.isChecked === 2">{{ item.projectName }}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="tabelsInfo-main empty" v-else>
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" plain @click="closeLinkDialog">取 消</el-button>
          <el-button type="primary" class="el-button-primary" @click="handleSave">保 存</el-button>
        </div>
      </el-dialog>
    </div> -->
    <!-- 项目部登录所看到的页面 -->
    <!-- v-else -->
    <div slot="header" class="clearfix card-header" v-if="user.orgType !== 5">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <el-form-item label="选择标段">
            <treeSelect @selectIds="selectIds"></treeSelect>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="project-detail" :class="{ 'form-mb1': user.orgType == 5, 'form-mb2': user.orgType != 5 }" :style="{ height: user.orgType == 5 ? '100%' : 'calc(100% - 120px)' }" v-if="typeShow">
      <div class="myform" v-loading="loading">
        <el-form :model="formData" label-width="110px" :rules="rules" ref="formData">
          <el-form-item label="项目名称：" prop="projectName">
            <el-input size="mini" v-model.trim="formData.projectName" class="wh-400" :minlength="2" :maxlength="50" :disabled="user.orgType !== 5" @input="verify"></el-input>
          </el-form-item>
          <el-form-item label="所属项目：" prop="itemName">
            <el-input size="mini" v-model.trim="formData.itemName" class="wh-400" :minlength="2" :maxlength="50" :disabled="user.orgType !== 5"></el-input>
          </el-form-item>
          <el-form-item label="项目地点：" class="elect">
            <el-select size="mini" class="wh-100" v-model="address.province" @change="provinceChange" :disabled="user.orgType !== 5">
              <el-option v-for="item in provinceList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
            </el-select>
            <el-select size="mini" class="wh-100" v-model="address.city" @change="cityChange" :disabled="user.orgType !== 5">
              <el-option v-for="item in cityList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
            </el-select>
            <el-select size="mini" class="wh-100" v-model="address.area" :disabled="user.orgType !== 5">
              <el-option v-for="item in areaList" :key="item.pkId" :value="item.areaName" :label="item.areaName"></el-option>
            </el-select>
            <el-input size="mini" v-model.trim="address.place" class="wh-200" maxlength="70" :disabled="user.orgType !== 5"></el-input>
            <i class="iconfont icondingwei" @click="appear"></i>
            <div class="bd-map" v-show="mapStatus">
              <i class="el-icon-circle-close" @click="appear"></i>
              <bdMap @detailedAddress="detailedAddress" :lat="formData.longitude" :lng="formData.latitude" ref="map" @point="point"></bdMap>
              <div class="disabled" v-if="user.orgType !== 5"></div>
            </div>
          </el-form-item>
          <el-form-item label="建设单位：">
            <el-input size="mini" v-model.trim="formData.investorName" class="wh-400" :minlength="2" :maxlength="50" :disabled="user.orgType !== 5"></el-input>
          </el-form-item>
          <el-form-item label="监理单位：">
            <el-input size="mini" v-model.trim="formData.supervisorName" class="wh-400" :minlength="2" :maxlength="50" :disabled="user.orgType !== 5"></el-input>
          </el-form-item>
          <el-form-item label="设计院：">
            <el-input size="mini" v-model.trim="formData.designName" class="wh-400" :minlength="2" :maxlength="50" :disabled="user.orgType !== 5"></el-input>
          </el-form-item>
          <el-form-item label="施工单位：">
            <el-input size="mini" v-model.trim="formData.contractorName" disabled class="wh-400" :minlength="2" :maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="项目金额：" prop="contractAmount">
            <el-input size="mini" v-model.trim="formData.contractAmount" maxlength="15" class="wh-400" @keydown.native="moneyKeyDown" :disabled="user.orgType !== 5"></el-input>
          </el-form-item>
          <el-form-item label="工期：" prop="duration">
            <el-input size="mini" v-model.trim="formData.duration" class="wh-400" maxlength="20" :disabled="user.orgType !== 5"></el-input>
          </el-form-item>
          <el-form-item label="开工日期：" prop="beginTime">
            <el-date-picker size="mini" v-model="formData.beginTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期时间" :disabled="user.orgType !== 5"> </el-date-picker>
          </el-form-item>
          <el-form-item label="竣工日期：" prop="endTime" class="endTimes">
            <el-date-picker size="mini" v-model="formData.endTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期时间" :picker-options="queryOptionsEnd" :disabled="user.orgType !== 5"> </el-date-picker>
          </el-form-item>
          <el-form-item label="项目描述：" class="changelh">
            <el-input v-model="formData.remark" type="textarea" maxlength="100" show-word-limit resize="none" rows="4" :disabled="user.orgType !== 5"></el-input>
          </el-form-item>
        </el-form>
        <el-button size="mini" type="primary" class="el-button-primary" @click="btnOk" v-if="user.orgType == 5">保 存</el-button>
      </div>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import Pagination from "@/components/tablePaging";
import bdMap from "@/components/bdMap/bdMap";
import treeSelect from "../../components/proTreeSelect/treeSelect.vue";
export default {
  components: { Pagination, bdMap, treeSelect },
  data() {
    return {
      tableData: [],
      value: "",
      dialogVisible: false,
      // 1为新增/编辑，2为查看
      dialogType: 1,
      mapStatus: false,
      formData: {
        investorName: "",
        detailAddress: "",
        projectName: "",
        itemName: "",
        remark: "",
        beginTime: "",
        duration: "",
        endTime: "",
        contractAmount: "",
        provinceName: "",
        provinceCode: "",
        cityCode: "",
        cityName: "",
        areaCode: "",
        areaName: "",
        address: "",
        latitude: "",
        longitude: ""
      },
      rules: {
        projectName: [
          {
            required: true,
            min: 2,
            max: 50,
            message: "项目名称长度为2-50之间",
            trigger: "blur"
          }
        ],
        investorName: [
          {
            required: true,
            min: 2,
            max: 50,
            message: "建设单位名称长度为2-50之间",
            trigger: "blur"
          }
        ],
        itemName: [{ required: true, message: "请输入所属项目", trigger: "blur" }],
        beginTime: [{ required: true, message: "请选择开工日期", trigger: "blur" }],
        duration: [{ required: true, message: "请输入工期", trigger: "blur" }],
        endTime: [{ required: true, message: "请输入竣工日期", trigger: "blur" }],
        contractAmount: [{ required: true, message: "请输入合同金额", trigger: "blur" }]
      },
      page: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      searchName: "",
      projectName: "",
      provinceList: [], // 省级列表
      cityList: [],
      areaList: [],
      address: {
        province: "", // 省
        city: "", // 市
        area: "", // 区
        place: "" // 地址
      },
      linkDialogVisible: false,
      checkList: [],
      bindList: [],
      currentPkId: "",
      loading: false,
      typeShow: true,
      queryOptionsEnd: {
        disabledDate: time => {
          if (this.formData.beginTime) {
            let d;
            if (typeof this.formData.beginTime == "string") {
              d = new Date(this.formData.beginTime).getTime();
            } else {
              d = this.formData.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      }
    };
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
    if (this.user.orgType !== 5) {
      // this.getItemList();
    } else {
      this.getProInfoByProId(this.user.fkOrgId);
    }
    if ((this.typeShow = true)) {
      this.getProvinceList();
    }
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        this.getProInfoByProId(obj.fkOrgId);
      }
    },
    // 获取项目概况列表
    getItemList(projectName) {
      let data = this.page;
      if (projectName) {
        data = { ...data, projectName };
      }
      api.getProjectListByCondition(data).then(res => {
        if (res.code === 200) {
          const { data } = res;
          this.tableData = data.records;
          this.total = data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.code);
        }
      });
    },
    //  根据项目部id获取项目信息
    getProInfoByProId(proOrgId) {
      api.findProjectByProOrgId({ proOrgId }).then(res => {
        if (res.code === 200) {
          if (res.data) {
            this.formData = res.data;
            this.address = {
              province: res.data.provinceName, // 省
              city: res.data.cityName, // 市
              area: res.data.areaName, // 区
              place: res.data.address // 地址
            };
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 省份变化
    provinceChange() {
      this.address.city = "";
      this.address.area = "";
      const province = this.provinceList.filter(item => item.areaName.indexOf(this.address.province) !== -1 || this.address.province.indexOf(item.areaName) !== -1);
      // console.log("=====================.")
      // console.log(province)
      // console.log("=====================.")
      this.$api.getCityList({ provinceId: province[0].pkId }).then(res => {
        if (res.code == 200) {
          this.cityList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
      // this.cityList = province[0].sysCityAreaList;
    },
    getCityList() {
      const province = this.provinceList.filter(item => item.areaName.indexOf(this.address.province) !== -1 || this.address.province.indexOf(item.areaName) !== -1);
      this.$api.getCityList({ provinceId: province[0].pkId }).then(res => {
        if (res.code == 200) {
          this.cityList = res.data;
          this.areaList = this.cityList.filter(item => item.areaName.indexOf(this.address.city) !== -1 || this.address.city.indexOf(item.areaName) !== -1)[0].sysAreaList;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 城市变化
    cityChange() {
      this.address.area = "";
      const city = this.cityList.filter(item => item.areaName.indexOf(this.address.city) !== -1 || this.address.city.indexOf(item.areaName) !== -1);
      this.getAreaList(city[0].pkId);
      // this.areaList = city[0].sysAreaList;
    },
    // 获取全部标段信息
    allListBidByOrgId(projectId) {
      api.allListBidByOrgId({ projectId }).then(res => {
        if (res.code === 200) {
          this.bindList = res.data.filter(item => item.projectName);
          if (res.data && res.data.length) {
            this.checkList = res.data.filter(item => item.isChecked === 1).map(item => item.pkId);
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开模态框
    handleOpen(type, pkId) {
      this.dialogType = type;
      if (pkId) {
        api.getProjectInfoById({ pkId }).then(res => {
          if (res.code === 200) {
            this.formData = res.data;
            this.address = {
              province: res.data.provinceName, // 省
              city: res.data.cityName, // 市
              area: res.data.areaName, // 区
              place: res.data.address // 地址
            };
            const id1 = this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1)[0].pkId;
            this.getCityList(id1, 2);
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
      this.dialogVisible = true;
    },
    // 模态框确定按钮
    async btnOk() {
      await this.$refs.formData.validate();
      const { province, city, area, place } = this.address;
      if (!province || !city || !area || !place) {
        return this.$message.warning("请填入完整的地址");
      }
      let promise = "";
      if (this.formData.pkId) {
        promise = api.updateProjectInfoById;
      } else {
        if (this.user.orgType === 5) {
          promise = api.updateProjectInfoById;
        } else {
          promise = api.addProject;
        }
      }
      if (this.user.orgType === 2 || this.user.orgType === 3) {
        this.formData.investorName = this.user.orgName;
      }
      if (new Date(this.formData.endTime) < new Date(this.formData.beginTime)) {
        return this.$message.warning("竣工日期必须在开工日期之后");
      }
      if (this.dialogType === 1) {
        const province = this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1);
        console.log(this.cityList);
        // return console.log(this.address.city)

        this.formData = {
          ...this.formData,
          provinceName: province[0].areaName,
          provinceCode: province[0].pkId,
          address: this.address.place
        };
        if (this.cityList == null) {
          this.formData.cityCode = this.formData.cityCode;
          this.formData.cityName = this.formData.cityName;
          this.formData.areaCode = this.formData.areaCode;
          this.formData.areaName = this.formData.areaName;
        } else {
          const city = this.cityList.filter(item => this.address.city.indexOf(item.areaName) !== -1);
          const area = city[0].sysAreaList.filter(item => item.areaName === this.address.area);
          this.formData.cityCode = city[0].pkId;
          this.formData.cityName = city[0].areaName;
          this.formData.areaCode = area[0].pkId;
          this.formData.areaName = area[0].areaName;
        }
      }
      this.formData.detailAddress = this.formData.provinceName + this.formData.cityName + this.formData.areaName + this.formData.address;
      this.loading = true;
      promise(this.formData).then(res => {
        if (res.code === 200) {
          if (this.user.orgType === 5) {
            this.getProInfoByProId(this.user.fkOrgId);
          } else {
            this.getItemList();
          }
          this.$message.success("操作成功");
          this.handleCancel();
        } else {
          this.$message.warning(res.msg);
        }
        this.loading = false;
      });
    },
    // 关闭模态框
    handleCancel() {
      this.$refs.formData.clearValidate();
      this.formData = {
        investorName: "",
        detailAddress: "",
        projectName: "",
        itemName: "",
        remark: "",
        beginTime: "",
        duration: "",
        endTime: "",
        contractAmount: "",
        provinceName: "",
        provinceCode: "",
        cityCode: "",
        cityName: "",
        areaCode: "",
        areaName: "",
        address: "",
        latitude: "",
        longitude: ""
      };
      this.address = {
        province: "", // 省
        city: "", // 市
        area: "", // 区
        place: "" // 地址
      };
      this.dialogVisible = false;
      this.mapStatus = false;
    },
    // 删除按钮
    handleDel(pkId) {
      console.log(this);
      this.$confirm("确定删除该工程项目信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        api.delProjectById({ pkId }).then(res => {
          if (res.code === 200) {
            console.log(this);
            this.$message({
              message: "删除成功",
              type: "success"
            });
            // this.$message.success(res.msg);
            this.getItemList();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 搜索按钮
    handleSearch() {
      this.projectName = this.searchName;
      this.page.pageNum = 1;
      this.getItemList(this.projectName);
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getItemList(this.projectName);
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getItemList(this.projectName);
    },
    // 获取省级地区
    getProvinceList() {
      api.getProvinceList({ countryId: 45 }).then(res => {
        if (res.code === 200) {
          this.provinceList = res.data;
          const { province } = this.address;
          if (province) {
            // this.cityList = this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1)[0].sysCityAreaList;
            // this.areaList = this.cityList.filter(item => item.areaName === this.address.city)[0].sysAreaList;
            this.$api.getCityList({ provinceId: this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1)[0].pkId }).then(res => {
              if (res.code == 200) {
                this.cityList = res.data;
                this.areaList = this.cityList.filter(item => item.areaName === this.address.city)[0].sysAreaList;
              } else {
                this.$message.warning(res.msg);
              }
            });
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
    // 地图
    appear() {
      this.mapStatus = !this.mapStatus;
    },
    // 地图详细地址
    detailedAddress(data) {
      this.cityList = [];
      this.areaList = [];
      const { addressComponents, point } = data;
      this.address = {
        ...this.address,
        province: addressComponents.province,
        city: addressComponents.city,
        area: addressComponents.district,
        place: addressComponents.street + addressComponents.streetNumber
      };
      this.getCityList();
      // this.cityList = this.provinceList.filter(item => this.address.province.indexOf(item.areaName) !== -1)[0].sysCityAreaList;
      // this.areaList = this.cityList.filter(item => item.areaName.indexOf(this.address.city) !== -1)[0].sysAreaList;
      this.formData.latitude = point.lng;
      this.formData.longitude = point.lat;
      this.mapStatus = false;
    },
    // 获取地址
    point(point) {
      this.formData.latitude = point.lng;
      this.formData.longitude = point.lat;
    },
    // 打开关联标段模态框
    openLinkDialog(pkId) {
      this.currentPkId = pkId;
      this.allListBidByOrgId(pkId);
      this.linkDialogVisible = true;
    },
    // 关闭关联标段模态框
    closeLinkDialog() {
      this.checkList = [];
      this.bindList = [];
      this.linkDialogVisible = false;
    },
    // 关联标段模态框保存按钮
    handleSave() {
      api
        .addProjectBid({
          projectBidIds: this.checkList,
          projectId: this.currentPkId
        })
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.closeLinkDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
    },
    moneyKeyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    input(e) {
      let val = e;
      val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
      val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
      val = val.replace(/^0+\./g, "0.");
      val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
      val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (val.includes(".")) {
        if (val - 0 > 999999999999.99) {
          val = "999999999999.99";
        }
        val = val.slice(0, 15);
      } else {
        val = val.slice(0, 12);
      }
      this.formData.contractAmount = val;
    },
    verify(value) {
      console.log(value);
      this.formData.projectName = value.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\-\_\——]/g, "");
    }
  },
  computed: {
    title() {
      if (this.dialogType === 2) {
        return "查看工程项目";
      } else {
        if (this.formData.pkId) {
          return "编辑工程项目";
        } else {
          return "新增工程项目";
        }
      }
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  watch: {
    address: {
      handler(val) {
        const detail = val.province + val.city + val.area + val.place;
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
.table-data {
  height: 78%;
}
input {
  font-size: 14px;
}
.wh-300 {
  width: 300px;
}
.wh-500 {
  width: 500px;
}
.project-detail {
  width: 100%;
  background-color: #fff;
  padding: 10px 20px 0;
}
.card-header {
  display: flex;
  align-items: center;
  height: 90px;
  background-color: $searcHeder;
  margin-bottom: 14px;
  padding: 0 20px;
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 4px 0;
    .el-form {
      display: flex;
      align-items: center;
      .el-select,
      .el-input {
        width: 180px;
      }
      .el-form-item {
        margin-bottom: 0;
      }
    }
    .addBtn {
      margin-top: 5px;
      height: 28px;
    }
  }
}
.elect {
  .el-select {
    margin-right: 10px;
  }
}
.myform {
  margin: 20px;
  margin-top: 10px;
  width: 800px;
  .el-button {
    padding: 10px 30px;
    margin-left: 300px;
  }
  .bd-map {
    right: -340px;
  }
}
.form-mb1 {
  /deep/ .el-form-item {
    margin-bottom: 12px;
  }
}
.form-mb2 {
  /deep/ .el-form-item {
    margin-bottom: 5px;
  }
}
.btn-serach {
  margin-left: 20px;
  height: 28px;
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
.bd-map {
  width: 400px;
  position: absolute;
  right: -170px;
  top: 0;
  border: 1px solid #f3f3f3;
  z-index: 99;
  .el-icon-circle-close {
    cursor: pointer;
    font-size: 20px;
    position: absolute;
    top: -22px;
    left: 48%;
  }
  .disabled {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 1;
  }
}
.el-checkbox-group {
  margin-left: 30px;
  .el-checkbox {
    width: 100%;
    margin: 5px 0;
  }
}
.empty {
  text-align: center;
  img {
    width: 280px;
  }
}
.bind {
  margin-top: 10px;
  height: 300px;
  overflow: auto;
}
.changelh {
  /deep/ .el-input__count {
    line-height: 100%;
  }
}
.endTimes {
  /deep/ .el-form-item__error {
    padding: 0;
  }
}
</style>
