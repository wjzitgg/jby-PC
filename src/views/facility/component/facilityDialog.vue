<template>
  <div @click="closeTree">
    <el-dialog :title="facilityDialogTitle" top="5vw" :visible="facilityDialog" @close="closeFacilityDialog(false)" width="60%" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="facilityDialog dialog-form">
        <el-form ref="facilityForm" :model="facilityForm" label-width="80px" class="dia-left">
          <el-row :span="24" class="el-row-data">
            <el-col :span="12">
              <el-form-item label="设备名称" class="device-name">
                <!-- el-icon-more -->
                <el-input size="mini" :disabled="openType === 1" :value="facilityForm.deviceName" placeholder="点击选择设备" class="selectFac" @focus="selectFac">
                  <el-button slot="append" icon="el-icon-more" @click="selectFac" :disabled="openType === 1"></el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备类别" class="device-name">
                <!-- <span></span> -->
                <el-input size="mini" :value="facilityForm.className" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备型号" class="device-name">
                <el-input size="mini" v-model="facilityForm.deviceCode" :disabled="openType === 1" maxlength="50"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出厂日期" class="device-name">
                <el-date-picker v-model="facilityForm.factoryTime" size="mini" value-format="yyyy-MM-dd" style="width:100%" :disabled="openType === 1"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备品牌" class="device-name">
                <el-input size="mini" v-model="facilityForm.brandName" :disabled="openType === 1" maxlength="50"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备厂商" class="device-name">
                <el-input size="mini" v-model="facilityForm.manufacturer" :disabled="openType === 1" maxlength="250"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <div class="line"></div>
            </el-col>
            <el-col :span="24" class="property" v-if="openType !== 1">
              <span class="add" @click="addProperty" v-if="propertyList.length != 6">+新增设备属性</span>
              <span class="warn">*最多新增6个属性</span>
            </el-col>
            <el-col :span="24" v-if="!propertyList.length">
              <div style="height:50px"></div>
            </el-col>
            <el-col :span="12" v-for="(item, idx) in propertyList" :key="idx">
              <el-form-item :label="item.attributeName" label-width="120px">
                <el-input size="mini" v-model="item.attributeVal" :disabled="openType === 1" maxlength="50"></el-input>
                <div class="delBtn el-icon-minus" @click="delProperty(idx)" v-if="openType !== 1"></div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <div class="line"></div>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="(dialogType === 1 ? '购买' : '租赁') + '单价'">
                <el-input size="mini" @change="handleChange" v-model="facilityForm.price" class="va-m" @input="facilityForm.price = $limitInputNumber(facilityForm.price, 99999999.99, '', 2)" :disabled="openType === 1">
                  <span slot="append">元</span>
                </el-input>
                <!-- <span v-show="priceError" style="color: red;">输入的值过大</span> -->
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用期限">
                <el-input size="mini" @input="facilityForm.liveTime = $limitInputNumber(facilityForm.liveTime, 99999999, '')" v-model="facilityForm.liveTime" class="va-m" :disabled="openType === 1">
                  <span slot="append">月</span>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="dialogType === 1 ? '月折旧价' : '月租金'">
                <el-input @change="handleChange" size="mini" @input="facilityForm.depreciationPrice = $limitInputNumber(facilityForm.depreciationPrice, 99999999.99, 0, 2)" v-model="facilityForm.depreciationPrice" class="va-m" disabled>
                  <span slot="append">元</span>
                </el-input>
                <!-- <span v-show="depreciationPriceError" style="color: red;">输入的值过大</span> -->
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="(dialogType === 1 ? '购买' : '租赁') + '设备数'" label-width="96px">
                <el-input size="mini" type="number" @input="facilityForm.buyNum = $limitInputNumber(facilityForm.buyNum, 99999999, '')" v-model="facilityForm.buyNum" class="va-m" :disabled="openType === 1">
                  <span slot="append">{{ unitName }}</span>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="(dialogType === 1 ? '购买' : '租赁') + '日期'">
                <!-- <el-date-picker v-model="facilityForm.consumeTime " size="mini" value-format="yyyy-MM-dd" style="width:100%" :disabled="openType === 1" ></el-date-picker> -->
                <el-date-picker v-model="facilityForm.consumeTime" size="mini" style="width:100%" :picker-options="pickerOptions" :disabled="openType === 1" value-format="yyyy-MM-dd" :editable="false"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <div class="totalNum">
                总计：<span style="color:red" v-if="facilityForm.price && facilityForm.buyNum"> {{ (facilityForm.price * facilityForm.buyNum) | numFilter }}</span
                >元
              </div>
            </el-col>
            <el-col :span="24">
              <div class="line"></div>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用部门">
                <el-input v-if="openType === 1" size="mini" disabled v-model="facilityForm.deptName"></el-input>
                <el-select v-else size="mini" style="width:100%" v-model="facilityForm.fkDeptId" :disabled="openType === 1">
                  <!-- <el-option label="item.label" value="1"> </el-option> -->
                  <el-option v-for="item in userDepartment" :key="item.pkId" :value="item.pkId" :label="item.deptName"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="使用部位">
                <el-input v-if="openType === 1" size="mini" disabled v-model="facilityForm.consumeItemName"></el-input>
                <treeSelect v-else :defaultProps="treeDefaultProps" :disabled="openType === 1" :showCheckbox="true" :nodeKey="'pkId'" :checkedList="checkedList" :treeList="treeSelectData" @selectIds="treeChecked" ref="treeSelect2" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <!-- 设备图片 -->
        <div class="dia-right">
          <div class="title">设备图片:</div>
          <div class="imgList">
            <div class="imgs" v-for="(item, idx) in imgList" :key="idx">
              <img :src="item" alt="" />
              <div class="mask">
                <span class="el-icon-zoom-in maskIcon" @click="perImg(item)"></span>
                <span class="maskIcon el-icon-delete" v-if="openType !== 1" @click="delImg(idx, item)"></span>
              </div>
            </div>
            <div class="uploadDiv" @click="clickUpload" v-if="imgList.length < 6 && openType !== 1">
              <span class="el-icon-plus uploadIcon"></span>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" v-if="openType !== 1">
        <el-button size="mini" @click="closeFacilityDialog(false)">取 消</el-button>
        <el-button size="mini" type="primary" @click="closeFacilityDialog(true)">保存</el-button>
      </div>
    </el-dialog>
    <!-- 选择设备弹框 -->
    <el-dialog title="选择设备" width="70%" :visible="selectFacilityDialog" @close="closeSelectFacilityDialog" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <div class="selectFacilityDialog">
          <div class="selectFacilityDialog-left">
            <el-tree ref="tree" :data="treeDate" :props="defaultProps" @node-click="handleNodeClick"> </el-tree>
          </div>
          <div class="selectFacilityDialog-right">
            <div class="header">
              <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item v-for="(item, idx) in breadcrumbList" :key="idx">{{ item }}</el-breadcrumb-item>
              </el-breadcrumb>
              <div class="right">
                <span class="label">设备搜索</span>
                <el-input size="mini" v-model="inpName" class="wh-250">
                  <el-button slot="append" icon="el-icon-search" @click="searchBtn"></el-button>
                </el-input>
              </div>
            </div>
            <el-table ref="facilityTables" stripe :data="tableData" height="80%" :header-cell-style="{ background: '#f1f6ff' }" highlight-current-row @current-change="tableCurrentChange" :current-row-key="'pkId'" :tooltip-effect="'light'">
              <el-table-column label="" align="center" width="50px">
                <template slot-scope="{ row }">
                  <!-- <radio-group  v-model="selectedValue" :label="row.pkId" > -->
                  <!-- <el-radio-group v-model="radio"> -->
                  <el-radio v-model="radio" :label="row.pkId" @change="radioChange">{{ "" }}</el-radio>
                  <!-- </el-radio-group> -->
                </template>
              </el-table-column>
              <el-table-column label="序号" align="center" width="80">
                <template slot-scope="scope">
                  <div style="text-align: center">
                    {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="设备名称" prop="deviceName" align="center"> </el-table-column>
              <el-table-column label="设备型号" prop="deviceCode" align="center" show-overflow-tooltip> </el-table-column>
              <el-table-column label="设备品牌" prop="brandName" align="center" show-overflow-tooltip> </el-table-column>
              <el-table-column label="设备厂商" prop="manufacturer" align="center" show-overflow-tooltip> </el-table-column>
              <el-table-column label="出厂日期" prop="factoryTime" align="center" show-overflow-tooltip> </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
            <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
          </div>
        </div>
      </div>

      <div slot="footer">
        <el-button size="mini" @click="closeSelectFacilityDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="selectFacilityOk">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 新增属性弹框 -->
    <el-dialog title="新增设备属性" width="30%" top="15vw" :visible="propertyDialog" @close="closePropertyDialog" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form ref="propertyForm" class="dialog-form" :model="propertyForm" label-width="80px" :rules="rules">
        <el-form-item label="标签名称" prop="attributeName">
          <el-input size="mini" v-model="propertyForm.attributeName" maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="标签内容">
          <el-input size="mini" v-model="propertyForm.attributeVal" maxlength="50"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closePropertyDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="propertyAddBtn">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 预览图片弹框 -->
    <el-dialog :visible.sync="ImgDialog">
      <div class="prevDialog">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </div>
    </el-dialog>
    <!-- 上传用input框 -->
    <input v-show="false" type="file" ref="imgFiles" id="upload" accept=".jpeg,.jpg,.png" @change="upLoad" />
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5";
import treeSelect from "./treeSelect2.vue";
export default {
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  components: { treeSelect },
  filters: {
    numFilter(value) {
      // 截取当前数据到小数点后两位
      let realVal = parseFloat(value).toFixed(2);
      // num.toFixed(2)获取的是字符串
      return parseFloat(realVal);
    }
  },
  props: {
    facilityDialogTitle: {
      type: String,
      default: ""
    },
    facilityDialog: {
      type: Boolean
    },
    // 1为查看，2为新增，3为编辑
    openType: {
      type: Number
    },
    // 1为购买，2为租赁
    dialogType: {
      type: Number
    },
    deviceId: {
      type: String
    }
  },
  watch: {
    facilityDialog(val) {
      if (val) {
        console.log(this.openType);
        if (this.user.orgType === 5) {
          this.searchItemsByProjectId("");
        }
        this.searchByTree();
        this.projDeviceList();
        if (this.openType !== 2) {
          this.projDeviceFindById(this.deviceId);
        }
      }
    },
    // facilityForm 单价变化计算 计算月折旧月租金
    "facilityForm.price"(val) {
      if (this.facilityForm.liveTime != undefined && this.facilityForm.liveTime != null && val) {
        let num = this.facilityForm.price / this.facilityForm.liveTime;
        console.log(parseFloat(num).toFixed(2));
        // 解决值为NAN与Infinity的判断
        if (num !== num || num == "Infinity") {
          this.facilityForm.depreciationPrice = 0;
        } else {
          this.facilityForm.depreciationPrice = parseFloat(num).toFixed(2);
        }
      } else {
        // this.facilityForm.depreciationPrice =""
      }
    },
    // 使用期限变化
    "facilityForm.liveTime"(val) {
      if (this.facilityForm.price != undefined && this.facilityForm.price != null && val) {
        let sum = ((this.facilityForm.price - 0) / (val - 0)).toFixed(2);
        console.log(parseFloat(sum).toFixed(2));
        if (sum == "NaN" || sum == "Infinity") {
          this.facilityForm.depreciationPrice = 0;
        } else {
          this.facilityForm.depreciationPrice = parseFloat(sum).toFixed(2);
        }
        // this.$set(item, "selected", false);
      } else {
        // this.facilityForm.depreciationPrice =""
      }
    }
  },
  data() {
    return {
      loading: false,
      selectedValue: "",
      radio: "",
      rent: "", //初始值
      price: "", //单价
      selectedDate: null,
      pickerOptions: {
        disabledDate(date) {
          return date > new Date(); // 新增选择日期，返回 true 则禁用
        }
      },
      facilityForm: {
        deviceName: "",
        className: "",
        deviceCode: "",
        factoryTime: "",
        brandName: "",
        manufacturer: "",
        fkItemIds: "",
        depreciationPrice: "",
        price: ""
        // fkTemplateId: "",
        // fkUnitId: ""
      },
      ImgDialog: false,
      dialogImageUrl: "",
      imgList: [],
      propertyDialog: false,
      propertyForm: {
        attributeName: "",
        attributeVal: ""
      },
      rules: {
        attributeName: [{ required: true, message: "请填写标签名称", trigger: "blur" }]
      },
      propertyList: [],
      selectFacilityDialog: false,
      treeDate: [],
      defaultProps: {
        children: "children",
        label: "itemName"
      },
      breadcrumbList: [],
      tableData: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, // 分页数据
      total: 0, // 分页总数
      inpName: "",
      searchName: "",
      fkClassId: "",
      radio: "",
      checkFacility: "",
      checkedList: [],
      treeSelectData: [],
      treeDefaultProps: {
        children: "children",
        label: "itemName"
      },
      userDepartment: [],
      unitName: "",
      newAddList: [],
      delList: [],
      linkImgList: []
    };
  },

  methods: {
    handleChange(e) {
      if (this.facilityForm.depreciationPrice > this.facilityForm.price) {
        this.$confirm("月折旧价或单机月租金不能比购买单价或租赁单价大");
        // this.$message.warning()
      }
    },
    onInputBlur(e) {
      console.log(e);
    },
    // 关闭下拉框弹出不关闭问题
    closeTree() {
      this.$refs.treeSelect2.showTree = false;
    },
    projDeviceFindById(id) {
      this.$api.projDeviceFindById({ pkId: id }).then(res => {
        if (res.code == 200) {
          this.facilityForm.price = res.data.price;
          this.facilityForm.liveTime = res.data.liveTime;
          this.facilityForm = res.data;
          this.unitName = res.data.unitName;
          this.propertyList = res.data.deviceAttributes;

          if (res.data.deviceUrl == null || res.data.deviceUrl.length == 0) {
            this.imgList = [];
          } else {
            this.imgList = res.data.deviceUrl.split(",");
          }
          this.facilityForm.fkItemIds = res.data.itemIdList;
          if (this.openType != 1) {
            this.$refs.treeSelect2.setTreeSelect(res.data.itemIdList);
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    disabledDate(time) {
      // 获取今天的日期
      const today = new Date();
      // 将时间戳转换成日期对象，去掉时、分、秒、毫秒
      time = new Date(time.getFullYear(), time.getMonth(), time.getDate());

      // 如果选择的日期在今天之后，则禁用该日期
      return time.getTime() > today.getTime();
    },

    selectIds() {},
    // 获取设备类型
    searchByTree() {
      this.$api.searchByTree().then(res => {
        if (res.code == 200) {
          this.treeDate = res.data;
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
    // 获取分项工程
    searchItemsByProjectId(id) {
      this.$api.searchItemsByProjectId({ projectId: id }).then(res => {
        if (res.code == 200) {
          this.treeSelectData = res.data;
        }
      });
    },
    treeChecked(ids, node) {
      // console.log(nodes, ids);
      this.facilityForm.fkItemIds = ids;
    },
    selectFac() {
      if (this.openType === 1) return;
      this.selectFacilityDialog = true;
      this.$nextTick(() => {
        const obj = this.tableData.filter(item => item.pkId === 1)[0];
        this.$refs.facilityTables.setCurrentRow(obj);
      });
    },

    closeFacilityDialog(val) {
      if (val) {
        // 新增
        let data = {};
        data = { ...this.facilityForm };
        data.deviceAttributes = this.propertyList;
        data.deviceUrl = this.imgList.toString();
        data.consumeType = this.dialogType === 1 ? 1 : 0;
        data.sourceType = 1;
        if (this.facilityForm.deviceName.length == 0) {
          return this.$message.warning("请选择设备");
        }
        if (this.facilityForm.deviceCode == "" || this.facilityForm.deviceCode == null) {
          return this.$message.warning("请填写设备型号");
        }
        if (this.facilityForm.factoryTime == "" || this.facilityForm.factoryTime == null) {
          return this.$message.warning("请选择出厂日期");
        }
        if (this.facilityForm.brandName == "" || this.facilityForm.brandName == null) {
          return this.$message.warning("请填写设备品牌");
        }
        if (this.facilityForm.manufacturer == "" || this.facilityForm.manufacturer == null) {
          return this.$message.warning("请填写设备厂商");
        }
        if (!data.liveTime || data.liveTime == 0) {
          return this.$message.warning("请填写使用期限");
        }
        if (!data.price || data.price == 0) {
          return this.$message.warning(this.dialogType === 1 ? "购买单价不能为空或者零" : "租赁单价不能为空或者零");
        }
        if (!data.depreciationPrice || data.depreciationPrice == 0) {
          return this.$message.warning(this.dialogType === 1 ? "月折旧价不能为空或者零" : "月租金不能为空或者零");
        }

        if (!data.buyNum || data.buyNum == 0) {
          return this.$message.warning(this.dialogType === 1 ? "购买设备数不能为空或者零" : "租赁设备数不能为空或者零");
        }
        if (!data.fkDeptId) {
          return this.$message.warning("使用部门不能为空");
        }
        if (!data.consumeTime) {
          return this.$message.warning(this.dialogType === 1 ? "购买日期不能为空" : "租赁日期不能为空");
        }
        if (!data.fkItemIds) {
          return this.$message.warning("使用部位不能为空");
        }
        //  if(data.depreciationPrice > data.price){
        //     this.$confirm(
        //        "月折旧价或单机月租金不能比购买单价或租赁单价大"
        //     )
        //   }

        // return  console.log(this.facilityForm.deviceName)
        this.loading = true;
        if (this.openType == 2) {
          this.$api.projDeviceAdd(data).then(res => {
            this.loading = false;
            if (res.code == 200) {
              this.$message.success("新增成功");
              this.$emit("closeFacilityDialog", true);
              this.facilityForm = {
                deviceName: "",
                className: "",
                deviceCode: "",
                factoryTime: "",
                brandName: "",
                manufacturer: ""
              };
              this.imgList = [];
              this.propertyList = [];
              this.$refs.treeSelect2.clearable();
            } else {
              this.$message.warning(res.msg);
            }
          });
        } else if (this.openType == 3) {
          delete data.unitName;
          this.$api.projDeviceUpdate(data).then(res => {
            this.loading = false;
            if (res.code == 200) {
              this.$message.success("编辑成功");
              this.$emit("closeFacilityDialog", true);
              this.facilityForm = {
                deviceName: "",
                className: "",
                deviceCode: "",
                factoryTime: "",
                brandName: "",
                manufacturer: ""
              };
              this.imgList = [];
              this.propertyList = [];
              this.$refs.treeSelect2.clearable();
            } else {
              this.$message.warning(res.msg);
            }
          });
        }
      } else {
        this.loading = false;
        this.$emit("closeFacilityDialog", false);
        this.facilityForm = {
          deviceName: "",
          className: "",
          deviceCode: "",
          factoryTime: "",
          brandName: "",
          manufacturer: ""
        };
        this.imgList = [];
        this.propertyList = [];
        this.$refs.treeSelect2.clearable();
      }
      if (!val) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      // return;
      // projDeviceAdd propertyList
      // this.$emit("closeFacilityDialog");
    },

    delFiles() {
      let urls = [];
      if (this.openType == 2) {
        urls = this.newAddList.join(",");
      } else {
        urls = [...new Set([...this.delList, ...this.newAddList])].join(",");
      }
      if (!urls.length) {
        return;
      }
      this.newAddList = [];
      this.delList = [];
      this.$api.delFiles({ urls });
    },
    getList() {
      this.$emit("getList");
    },
    addProperty() {
      this.propertyDialog = true;
    },
    delProperty(idx) {
      this.propertyList.splice(idx, 1);
    },
    async propertyAddBtn() {
      await this.$refs.propertyForm.validate();
      this.propertyList.push({ ...this.propertyForm });
      this.closePropertyDialog();
    },
    closePropertyDialog() {
      this.$refs.propertyForm.resetFields();
      this.propertyDialog = false;
      this.propertyForm = { attributeName: "", attributeVal: "" };
    },
    // 删除图片
    delImg(idx, item) {
      this.imgList.splice(idx, 1);
      this.propertyList = "";
      if (!this.linkImgList.includes(item)) {
        this.delList.push(item);
      }
    },
    // 树形节点点击
    handleNodeClick(item, e) {
      this.breadcrumbList = [];
      this.breadcrumbList.unshift(item.itemName);
      this.fkClassId = item.pkId;
      const vm = this;
      var callback = function(e) {
        if (e.parent.data == undefined) {
          return;
        }
        if (e.parent.data instanceof Array) {
        } else {
          vm.breadcrumbList.unshift(e.parent.data.itemName);
          callback(e.parent);
        }
      };
      if (e.parent.data instanceof Array) {
      } else {
        callback(e);
      }
      this.inpName = "";
      this.searchName = "";
      this.baseDeviceTemplate();
    },
    baseDeviceTemplate() {
      const data = {
        pageSize: this.page.pageSize,
        pageNum: this.page.pageNum,
        keyWord: this.searchName,
        fkClassId: this.fkClassId
      };
      this.$api.baseDeviceTemplate(data).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.total = parseInt(res.data.total);
          // console.log(res);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 设备表单点击切换事件
    tableCurrentChange(val) {
      console.log(val);
      if (val != null) {
        this.radio = val.pkId;
        this.checkFacility = val;
      } else {
        this.radio = "";
      }
    },
    radioChange(e) {
      console.log(e);
      //   this.$refs.facilityTables.setCurrentRow();
    },
    // 选择设备弹框确认按钮
    selectFacilityOk() {
      this.facilityForm.deviceName = this.checkFacility.deviceName;
      this.facilityForm.className = this.checkFacility.className;
      this.facilityForm.deviceCode = this.checkFacility.deviceCode;
      this.facilityForm.factoryTime = this.checkFacility.factoryTime;
      this.facilityForm.brandName = this.checkFacility.brandName;
      this.facilityForm.manufacturer = this.checkFacility.manufacturer;
      this.facilityForm.fkTemplateId = this.checkFacility.pkId;
      this.facilityForm.fkUnitId = this.checkFacility.fkUnitId;
      this.propertyList = this.checkFacility.deviceAttributes == null ? [] : this.checkFacility.deviceAttributes;
      if (this.checkFacility.deviceUrl == null || this.checkFacility.deviceUrl.length == 0) {
        this.imgList = [];
      } else {
        this.imgList = this.checkFacility.deviceUrl == null ? [] : this.checkFacility.deviceUrl.split(",");
        this.linkImgList = this.checkFacility.deviceUrl == null ? [] : this.checkFacility.deviceUrl.split(",");
      }

      this.unitName = this.checkFacility.unitName;

      this.closeSelectFacilityDialog();
    },
    // 关闭选择设备弹框
    closeSelectFacilityDialog() {
      this.breadcrumbList = [];
      this.tableData = [];
      this.selectFacilityDialog = false;
      this.page.pageSize = 10;
      this.page.pageNum = 1;
    },
    clickUpload() {
      this.$refs.imgFiles.click();
    },
    // 获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";
      const cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            StartTime: startTime, // 时间戳，单位秒，如：1580000000
            ExpiredTime: expiredTime, // 时间戳，单位秒，如：1580000900
            // ExpiredTime: 1646819905,
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
      const index = filename.lastIndexOf(".");
      const name = filename.substring(index + 1, filename.length);
      const _this = this;
      cos.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: _this.uploadDate.objectKey + "." + name,
          Body: file,
          onProgress: function(progressData) {
            console.log(JSON.stringify(progressData));
          }
        },
        function(err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            _this.newAddList.push(path);
            _this.imgList.push(path);
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.imgFiles.value = "";
          } else {
            _this.$refs.imgFiles.value = "";
            _this.loading = false;
            _this.$message({
              type: "error",
              message: "上传失败"
            });
          }
        }
      );
    },
    upLoad() {
      const fileObj = document.getElementById("upload").files[0];
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      if (!["image/png", "image/jpeg", "image/jpg"].includes(fileObj.type)) {
        return this.$message.warning("仅支持上传jpeg，jpg，png类型的图片");
      }
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      if (fileObj.size > 5242880) {
        this.$refs.files.value = "";
        return this.$message.warning("文件大小不能超过5M");
      }
      let sign = "";
      let path = "";
      this.loading = true;
      this.$api
        .getUploadFileToken()
        .then(res => {
          if (res.code == 200) {
            sign = res.data.token;
            path = res.data.endpoint;
            this.uploadDate = res.data;
            this.$options.methods.upLoads.bind(this)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime);
          } else {
            console.log("res", res);
            this.$refs.imgFiles.value = "";
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          console.log("err", err);
          this.$refs.imgFiles.value = "";
          this.loading = false;
        });
    },
    // 上传腾讯云
    uploadFile(sign, folder, file, filename) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";

      const cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            // StartTime: 1646818105, // 时间戳，单位秒，如：1580000000
            ExpiredTime: startTime, // 时间戳，单位秒，如：1580000900
            // ExpiredTime: 1646819905,startTime
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },
    // 预览图片
    perImg(row) {
      console.log(row);
      this.dialogImageUrl = row;
      this.ImgDialog = true;
    },
    // 搜索按钮
    searchBtn() {
      this.page.pageSize = 10;
      this.page.pageNum = 1;
      this.searchName = this.inpName;
      this.baseDeviceTemplate();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      // this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.baseDeviceTemplate();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.baseDeviceTemplate();
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
  position: relative; /* 将伪元素的定位方式设置为相对定位 */
  left: 74px;
  top: -20px; /* 将伪元素向左便宜一定的距离 */
  transform: translateY(-50%);
}

.facilityDialog {
  display: flex;

  .dia-left {
    flex: 1;
  }

  .dia-right {
    width: 400px;

    // padding: 0 20px;
    .title {
      line-height: 30px;
      font-size: 16px;
      padding-left: 30px;
    }

    .imgList {
      display: flex;
      //   justify-content: space-evenly;
      flex-wrap: wrap;
      width: 100%;

      .imgs {
        position: relative;
        margin: 0 20px 20px 20px;

        // margin-bottom: 20px;
        img {
          width: 150px;
          height: 150px;
        }

        .mask {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          width: 150px;
          height: 150px;
          background-color: rgba(0, 0, 0, 0);
          z-index: 5;

          .maskIcon {
            display: none;
            color: #fff;
            font-size: 30px;
            cursor: pointer;
          }

          &:hover {
            background-color: rgba(0, 0, 0, 0.3);
            transition: 0.5s;

            .maskIcon {
              display: flex;
            }
          }
        }
      }
    }

    .uploadDiv {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 150px;
      height: 150px;
      margin: 0 20px 20px 20px;
      border: 1px dashed #c0ccda;
      cursor: pointer;

      .uploadIcon {
        font-size: 30px;
        color: #c0ccda;
      }
    }
  }
}

.selectFac {
  cursor: pointer;
  vertical-align: middle;
}

.line {
  border-top: 1px solid #b9b9b9;
}

.property {
  .add {
    cursor: pointer;
    color: #4fa4ff;
  }

  .warn {
    margin-left: 20px;
    color: red;
  }
}

.propertyList {
  height: 120px;
  overflow: auto;
}

.va-m {
  vertical-align: middle;
}

.totalNum {
  text-align: right;
}

.prevDialog {
  width: 100%;
  height: 600px;
  overflow: auto;
  text-align: center;
}

.delBtn {
  cursor: pointer;
  position: absolute;
  top: -10px;
  right: -15px;
  z-index: 3;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  width: 15px;
  height: 15px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background-color: #000;
  border-radius: 50%;
}

.selectFacilityDialog {
  display: flex;
  height: 600px;

  .selectFacilityDialog-left {
    width: 300px;
    height: 100%;
    border: 1px solid #ccc;
    padding: 5px;

    /deep/ .el-tree {
      overflow: auto;
      height: 100%;
    }
  }

  .selectFacilityDialog-right {
    flex: 1;
    border: 1px solid #ccc;
    padding: 5px;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;

      .right {
        display: flex;
        align-items: center;

        .label {
          width: 80px;
          margin-right: 10px;
        }
      }
    }
  }
}

.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
</style>
