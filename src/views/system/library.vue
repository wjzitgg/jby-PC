<template>
  <div class="app-container">
    <div class="box">
      <div class="left">
        <div class="left-header">
          <div class="left_title">设备分类</div>
        </div>
        <div class="left_center">
          <div class="btn-wh">
            <el-button type="warning" plain size="mini" class="btns btn-add" @click="facilityDialogTypeDialog(1)" v-has="'system:libraryType:add'">新增</el-button>

            <el-button type="danger" plain size="mini" class="btns btn-del" @click="deleteFacType" v-has="'system:libraryType:delete'">删除</el-button>
          </div>
          <el-table :data="tableData" highlight-current-row style="width: 100%; margin-bottom: 20px" row-key="pkId" v-loading="loading" height="98%" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" ref="multipleTable" @row-click="rowClick" tooltip-effect="dark" @select="select" @select-all="selectAll" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column label="分类名称" show-overflow-tooltip class-name="sys-name">
              <template slot-scope="{ row }">
                <span :class="{ disColor: row.invalidFlag == '1' }">
                  {{ row.className }}
                </span>
              </template>
            </el-table-column>
            <el-table-column align="center" min-width="30vw">
              <template slot-scope="scope" v-if="scope.row.parentId !== null">
                <el-button type="primary" plain size="mini" class="btns" @click="facilityDialogTypeDialog(2, scope.row)" v-has="'system:libraryType:edit'">编辑</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <el-dialog :title="typeDialogTitle" :visible="typeDialog" @close="closeTypeDialog" width="500px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
          <!-- :model="form" :rules="rules" -->
          <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
          <el-form style="margin-top: 20px" ref="classTypeForm" :model="form" label-width="85px" class="dialog-form">
            <el-form-item label="上级分类" prop="parentId">
              <el-cascader size="mini" style="width: 100%" v-if="typeDialog" v-model="form.parentId" placeholder="" :options="parentData" :disabled="showType == 2 && !!(form.fkProfessionalTypeId - 0)" :props="setProps" filterable @change="organizerUnit" ref="organizerUnit"></el-cascader>
            </el-form-item>
            <el-form-item label="分类名称" prop="className">
              <el-input size="mini" v-model="form.className" autocomplete="off" maxlength="25"></el-input>
            </el-form-item>
            <el-form-item label="排序号">
              <el-input size="mini" v-model="form.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="channelInputLimit"></el-input>
            </el-form-item>
            <el-form-item label="状态" v-if="showType == 2">
              <el-radio-group v-model="form.invalidFlag">
                <el-radio :label="0">正常</el-radio>
                <el-radio :label="1">作废</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
          <div slot="footer" class="dialog-footer">
            <el-button size="mini" @click="closeTypeDialog">取 消</el-button>
            <el-button size="mini" type="primary" class="el-button-primary" @click="submitClassify">保 存</el-button>
          </div>
        </el-dialog>
      </div>
      <div class="rigth">
        <div class="searchHeader">
          <el-form :inline="true" class="demo-form-inline" label-width="90">
            <el-form-item>
              <el-input prefix-icon="el-icon-search" maxlength="25" v-model="page.deviceName" placeholder="请输入设备名称" size="mini" style="width: 180px"></el-input>
              <el-button type="primary" class="el-button-primary" icon="el-icon-search" size="mini" @click="search">查 询</el-button>
            </el-form-item>
          </el-form>
          <div class="btn">
            <el-button type="warning" size="mini" @click="openUnitDialog" v-has="'system:library:unit'">单位管理</el-button>
            <el-button type="primary" size="mini" class="el-button-primary" @click="openFacilityDialog(2)" v-has="'system:library:add'">新建设备</el-button>
            <el-button type="danger" size="mini" @click="deleteMore" v-has="'system:library:delete'">删除设备</el-button>
          </div>
        </div>
        <div class="tab-container pitch">
          <el-table ref="tables" :data="tableData1" stripe style="width: 100%" height="83%" @selection-change="handleSelectChange" v-loading="loading1" :header-cell-style="{ background: ' #f1f6ff' }">
            <el-table-column type="selection" width="50" align="center"></el-table-column>
            <el-table-column align="center" label="序号" min-width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="className" label="设备类别"></el-table-column>
            <el-table-column align="center" prop="deviceName" label="设备名称"></el-table-column>
            <el-table-column align="center" prop="deviceCode" label="型号"></el-table-column>
            <el-table-column align="center" prop="brandName" label="品牌"></el-table-column>
            <el-table-column align="center" prop="manufacturer" label="厂商"></el-table-column>
            <el-table-column align="center" prop="factoryTime" label="出厂日期"></el-table-column>
            <el-table-column align="center" label="操作" min-width="120">
              <template slot-scope="scope">
                <!-- <el-button type="primary" plain size="mini" @click="openFacilityDialog(1, scope.row)">查看</el-button> -->
                <el-button type="success" plain size="mini" @click="openFacilityDialog(3, scope.row)" v-has="'system:library:edit'">编辑</el-button>
                <el-button type="danger" plain size="mini" @click="Delete(scope.row)" v-has="'system:library:delete'">删除</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <table-paging :current-page="page.pageNum" :page-size="page.pageSize" :total="total" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
        </div>
      </div>

      <!-- 单位弹框 -->
      <el-dialog title="单位管理" :visible.sync="unitDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading1">
        <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
        <div style="padding: 20px">
          <span>单位名称</span>
          <el-input prefix-icon="el-icon-search" v-model="unitPage.keyWord" placeholder="请输入单位名称" size="mini" style="width: 180px"></el-input>
          <el-button type="primary" class="el-button-primary" icon="el-icon-search" size="mini" @click="unitSearchPage">查 询</el-button>
          <el-button size="mini" style="position: absolute;right: 40px;" type="primary" @click="openUnitManDialog(1)">新增</el-button>
        </div>
        <div>
          <el-table :data="unitDataList" stripe style="width: 100%" height="500px" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }">
            <el-table-column align="center" label="序号" type="index" width="60px"></el-table-column>
            <el-table-column align="center" prop="unitName" label="单位名称" min-width="80"></el-table-column>
            <el-table-column align="center" prop="enName" label="子单位" min-width="80"></el-table-column>
            <el-table-column align="center" prop="sortval" label="排序号" min-width="80"></el-table-column>
            <el-table-column align="center" prop="enableStatusName" label="状态" min-width="80"></el-table-column>
            <el-table-column align="center" min-width="120" label="操作">
              <template slot-scope="{ row }">
                <el-button size="mini" @click="openUnitManDialog(2, row)">编辑</el-button>
                <el-button size="mini" type="primary" @click="unitUpdateEnableStatus(row)">{{ row.enableStatus == "1" ? "禁用" : "启用" }}</el-button>
                <el-button size="mini" type="danger" @click="deleteUnit(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <table-paging :current-page="unitPage.pageNum" :page-size="unitPage.pageSize" :total="unitTotal" @handleSizeChange="unitPageSizeChange" @handleCurrentChange="unitPageCurrentChange"></table-paging>
        </div>
      </el-dialog>
      <!-- 新增，编辑单位弹框 -->
      <el-dialog width="400px" top="15vw" :title="unitManDialogTitle" :visible.sync="unitManDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
        <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
        <el-form :model="unitForm" :rules="rules" style="margin-top: 20px" class="dialog-form" label-width="70px">
          <el-form-item label="单位名称" prop="unitName">
            <el-input size="mini" v-model="unitForm.unitName" autocomplete="off" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="子单位" prop="enName">
            <el-input size="mini" v-model="unitForm.enName" autocomplete="off" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="排序号" prop="sortval">
            <el-input size="mini" v-model="unitForm.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="channelInputLimit"></el-input>
          </el-form-item>
        </el-form>
        <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="closeUnitManDialog">取 消</el-button>
          <el-button size="mini" type="primary" @click="unitSubmit">保 存</el-button>
        </div>
      </el-dialog>
      <!-- 设备弹框 -->
      <el-dialog top="5vw" :visible="facilityDialog" :title="facilityDialogTitle" @close="closeFacilityDialogFalse" width="60%" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
        <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
        <el-form ref="facilityForm" :model="facilityForm" label-width="80px" class="dialog-form">
          <el-row :span="24" class="el-row-data">
            <el-col :span="12">
              <el-form-item label="设备名称">
                <el-input size="mini" v-model="facilityForm.deviceName" :disabled="facilityDialogType === 1" maxlength="25"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备类别">
                <!-- oneProps -->
                <!-- <el-cascader style="width: 100%" size="mini" v-model="facilityForm.fkClassId"
                 placeholder="" :options="parentData" :disabled="facilityDialogType === 1" :props="setProps" filterable ref="organizerUnit"></el-cascader> -->
                <el-cascader style="width: 100%" v-model="facilityForm.fkClassId" size="mini" :options="parentData" :disabled="facilityDialogType === 1" :props="oneProps" :show-all-levels="false"></el-cascader>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="设备排序">
                <el-input size="mini" v-model="facilityForm.name" :disabled="facilityDialogType === 1"></el-input>
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item label="设备单位">
                <el-select size="mini" style="width: 100%" v-model="facilityForm.fkUnitId" :disabled="facilityDialogType === 1">
                  <el-option v-for="item in unitData" :key="item.pkId" :label="item.unitName" :value="item.pkId"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备型号">
                <el-input size="mini" v-model="facilityForm.deviceCode" :disabled="facilityDialogType === 1" maxlength="50"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出厂日期">
                <el-date-picker v-model="facilityForm.factoryTime" size="mini" value-format="yyyy-MM-dd" style="width: 100%" :disabled="facilityDialogType === 1"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备品牌">
                <el-input size="mini" v-model="facilityForm.brandName" :disabled="facilityDialogType === 1" maxlength="50"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备厂商">
                <el-input size="mini" v-model="facilityForm.manufacturer" :disabled="facilityDialogType === 1" maxlength="250"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <div class="line"></div>
            </el-col>
            <el-col :span="24" class="property" v-if="facilityDialogType !== 1">
              <span class="add" @click="addProperty" v-if="propertyList.length != 6">+新增设备属性</span>
              <span class="warn">*最多新增6个属性</span>
            </el-col>
            <el-col :span="24" v-if="!propertyList.length">
              <div style="height: 50px"></div>
            </el-col>
            <el-col :span="12" v-for="(item, idx) in propertyList" :key="idx">
              <el-form-item :label="item.attributeName" label-width="120px">
                <el-input maxlength="50" size="mini" v-model="item.attributeVal" :disabled="facilityDialogType === 1"></el-input>
                <div class="delBtn el-icon-minus" @click="delProperty(idx)" v-if="facilityDialogType !== 1"></div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <div class="line"></div>
            </el-col>
            <el-col :span="24">
              <el-form-item label="设备照片" class="property">
                <span class="warn" v-if="facilityDialogType !== 1">*最多添加5张设备图片</span>
                <!-- <el-button size="mini" @click="clickUpload" v-if="imgList.length < 6 && facilityDialogType !== 1">上传</el-button> -->
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <div class="imgList">
                <div class="imgs" v-for="(item, idx) in imgList" :key="idx">
                  <img :src="item" alt="" />
                  <div class="mask">
                    <span class="el-icon-zoom-in maskIcon" @click="perImg(item)"></span>
                    <span class="maskIcon el-icon-delete" v-if="facilityDialogType !== 1" @click="delImg(idx, item)"></span>
                  </div>
                </div>
                <div class="uploadDiv" @click="clickUpload" v-if="imgList.length < 5 && facilityDialogType !== 1">
                  <span class="el-icon-plus uploadIcon"></span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
        <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
        <div slot="footer" v-if="facilityDialogType !== 1" class="dialog-footer">
          <el-button size="mini" @click="closeFacilityDialogFalse">取 消</el-button>
          <el-button size="mini" type="primary" class="el-button-primary" @click="closeFacilityDialog">保 存</el-button>
        </div>
      </el-dialog>
      <!-- 新增属性弹框 -->
      <el-dialog title="新增设备属性" width="400px" top="15vw" :visible="propertyDialog" @close="closePropertyDialog" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
        <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
        <el-form ref="propertyForm" :model="propertyForm" label-width="80px" class="dialog-form" :rules="rules">
          <el-form-item label="标签名称" prop="attributeName">
            <el-input size="mini" v-model="propertyForm.attributeName" maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="标签内容">
            <el-input size="mini" v-model="propertyForm.attributeVal" maxlength="50"></el-input>
          </el-form-item>
        </el-form>
        <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="closePropertyDialog">取 消</el-button>
          <el-button size="mini" type="primary" class="el-button-primary" @click="propertyAddBtn">确 定</el-button>
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
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5";
export default {
  name: "libraryList",
  data() {
    return {
      loading: false,
      loading1: false,
      tableData: [{ name: 1 }],
      tableData1: [{ name: 1 }],
      page: {
        pageSize: 10,
        pageNum: 1
      },
      total: 0,
      typeDialog: false,
      typeDialogTitle: "",
      facilityDialogTitle: "",
      facilityDialog: false,
      facilityDialogType: 1,
      propertyDialog: false,
      unitDialog: false,
      unitDialogTitle: "",
      unitDialogType: 1,
      unitManDialog: false,
      unitManDialogTitle: "",
      parentData: [],
      invalidFlag: 0,
      showType: null,
      setProps: {
        value: "pkId",
        label: "className",
        children: "children",
        checkStrictly: true
      },
      oneProps: {
        value: "pkId",
        label: "className",
        children: "children"
      },
      form: {},
      unitForm: {
        enName: "", // 子单位
        unitName: "", // 单位名称
        sortval: null
      },
      facilityForm: {},
      propertyForm: {
        attributeName: "",
        attributeVal: ""
      },
      rules: {
        attributeName: [{ required: true, message: "请填写标签名称", trigger: "blur" }]
      },
      formRules: {
        className: [
          {
            required: true,
            message: "分类名称",
            trigger: ["change", "blur"]
          }
        ]
      },
      unitData: [],
      propertyList: [],
      ImgDialog: false,
      dialogImageUrl: "",
      imgList: [],
      multipleSelection1: [],
      multipleSelection2: [],
      checkedKeys: false,
      newAddList: [],
      delList: [],
      unitPage: {
        keyWord: "",
        pageSize: 10,
        pageNum: 1,
        unitType: 1
      },
      unitTotal: 0,
      unitDataList: [],
      rowPkId: []
    };
  },
  mounted() {
    this.searchByTree();
    this.baseDeviceTemplate();
    this.conditionUnits();
  },
  watch: {
    facilityDialog(val) {
      if (!val) {
        this.delFiles();
      }
    }
  },
  methods: {
    organizerUnit() {
      if (this.$refs.organizerUnit) {
        this.$refs.organizerUnit.dropDownVisible = false;
      }
    },
    delFiles() {
      let urls = [];
      if (this.facilityDialogType == 2) {
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
    setChildren(children, type) {
      // 编辑多个子层级
      children.map(j => {
        this.toggleSelection(j, type);
        if (j.children) {
          this.setChildren(j.children, type);
        }
      });
    },
    // 选中父节点时，子节点一起选中取消
    select(selection, row) {
      console.log(row);
      if (
        selection.some(el => {
          return row.pkId === el.pkId;
        })
      ) {
        if (row.children) {
          // row.childList.map(j => {
          //     this.toggleSelection(j, true)
          // })
          // 解决子组件没有被勾选到
          this.setChildren(row.children, true);
        }
      } else {
        if (row.children) {
          // row.childList.map(j => {
          //     this.toggleSelection(j, false)
          // })
          this.setChildren(row.children, false);
        }
      }
    },
    toggleSelection(row, select) {
      if (row) {
        this.$nextTick(() => {
          this.$refs.multipleTable && this.$refs.multipleTable.toggleRowSelection(row, select);
        });
      }
    },
    selectAll() {
      this.checkedKeys = !this.checkedKeys;
      this.splite(this.tableData, this.checkedKeys);
    },
    /**
     * 处理数据
     */
    splite(data, flag) {
      data.forEach(row => {
        this.$refs.multipleTable.toggleRowSelection(row, flag);
        if (row.children != undefined) {
          this.splite(row.children);
        }
      });
    },
    searchByTree() {
      this.$api.searchByTree().then(res => {
        if (res.code == 200) {
          this.tableData = res.data;
          const arr = JSON.stringify(res.data);
          this.parentData = JSON.parse(arr);
          this.parentData.unshift({ pkId: "0", className: "无" });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    rowClick(row, column, event) {
      // console.log(row)
      this.rowPkId = [];
      if (row.children == null) {
        if (row.parentId == 0) {
          this.rowPkId = [row.pkId];
        } else {
          this.rowPkId = [row.parentId, row.pkId];
        }
      }
      this.page.fkClassId = row.pkId;
      this.baseDeviceTemplate();
    },
    baseDeviceTemplate() {
      const data = { ...this.page };
      this.$api.baseDeviceTemplate(data).then(res => {
        if (res.code == 200) {
          this.tableData1 = res.data.records;
          this.total = parseInt(res.data.total);
          // console.log(res);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    handleSelectChange(e) {
      console.log(e);
      this.multipleSelection1 = e;
    },
    // 批量删除设备
    deleteMore() {
      console.log(this.multipleSelection1);
      if (this.multipleSelection1.length == 0) {
        return this.$message.warning("请选择需要删除的数据");
      }
      const arr = [];
      this.multipleSelection1.forEach(item => {
        arr.push(item.pkId);
      });
      const ids = arr.toString();
      this.$confirm("确定删除该设备?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.baseDeviceTemplateDelete({ pkIds: ids }).then(res => {
          if (res.code == 200) {
            this.$message.success("删除成功");
            this.baseDeviceTemplate();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    handleSelectionChange(val) {
      // console.log(e);
      // this.multipleSelection2 = e;
      // return console.log(val)
      val.forEach(item => {
        this.$refs.multipleTable.toggleRowExpansion(item, false);
      });
      this.multipleSelection = val;
      //
    },

    deleteFacType() {
      if (this.multipleSelection.length == 0) {
        return this.$message({
          message: "请选择要删除的数据",
          type: "warning"
        });
      }
      const _this = this;
      const pkIds = [];
      this.multipleSelection.forEach(item => {
        pkIds.push(item.pkId);
      });
      _this
        .$confirm("确认删除已选设备分类?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.deviceClassDeleteBatch({ pkIds: pkIds.toString() }).then(res => {
            if (res.code == 200) {
              this.$message.success("删除成功");
              this.searchByTree();
            } else {
              this.$message.warning(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    facilityDialogTypeDialog(type, dialog) {
      this.showType = type;
      if (type === 1) {
        this.form = {};
        this.typeDialogTitle = "新增类别";
      } else {
        this.typeDialogTitle = "编辑类别";
        this.loading = true;
        this.$api.deviceClassFindById({ pkId: dialog.pkId }).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.form = {
              pkId: res.data.pkId,
              className: res.data.className,
              parentId: res.data.parentId,
              sortval: res.data.sortval,
              invalidFlag: res.data.invalidFlag
            };
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
      this.typeDialog = true;

      // this.$nextTick(()=>{
      //   this.$refs.classTypeForm.resetFields();
      // })
    },
    // 禁止输入e和.
    channelInputLimit(e) {
      const key = e.key;
      if (key === "e" || key === ".") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    submitClassify() {
      const data = { ...this.form };
      if (data.parentId instanceof Array) {
        data.parentId = data.parentId[data.parentId.length - 1];
      }
      data.sortval = data.sortval - 0;
      this.loading = true;
      if (this.showType == 1) {
        this.$api.deviceClassAdd(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("新增成功");
            this.closeTypeDialog();
            this.searchByTree();
          } else {
            return this.$message.warning(res.msg);
          }
        });
      } else if (this.showType == 2) {
        this.$api.deviceClassUpdate(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("编辑成功");
            this.closeTypeDialog();
            this.searchByTree();
          } else {
            return this.$message.warning(res.msg);
          }
        });
      }
    },
    closeTypeDialog() {
      this.typeDialog = false;
    },
    // 删除设备
    Delete(row) {
      this.$confirm("确定删除该设备?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.loading = true;
        this.$api.baseDeviceTemplateDelete({ pkIds: row.pkId }).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("删除成功");
            this.baseDeviceTemplate();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 右侧设备弹框
    openFacilityDialog(type, row) {
      console.log("Xxxxxxxxxxxxxxxxxxxxxxxxx");
      console.log(this.facilityForm.fkClassId);
      console.log("Xxxxxxxxxxxxxxxxxxxxxxxxx");
      this.facilityDialogType = type;
      this.propertyList = [];
      this.imgList = [];
      this.facilityForm = {};
      if (type === 1) {
        this.facilityDialogTitle = "查看设备";
        this.baseDeviceTemplateFindById(row.pkId);
      } else if (type === 2) {
        this.facilityDialogTitle = "新增设备";
        this.facilityForm.fkClassId = this.rowPkId;
      } else if (type === 3) {
        this.facilityDialogTitle = "编辑设备";
        this.baseDeviceTemplateFindById(row.pkId);
      }
      this.facilityDialog = true;
    },
    baseDeviceTemplateFindById(id) {
      this.$api.baseDeviceTemplateFindById({ pkId: id }).then(res => {
        if (res.code == 200) {
          console.log(res);
          // this.imgList = [];
          // if(res.data.deviceAttributes == null || res.data.deviceAttributes.length==0 ){
          //   this.imgList = []
          // }else{
          //   this.imgList = res.data.deviceUrl.split(",");
          // }

          this.imgList = res.data.deviceUrl ? res.data.deviceUrl.split(",") : [];
          this.propertyList = res.data.deviceAttributes;
          this.facilityForm = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
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
      this.delList.push(item);
      this.imgList.splice(idx, 1);
    },
    closeFacilityDialog() {
      const data = { ...this.facilityForm };
      data.deviceUrl = this.imgList.toString();
      data.deviceAttributes = this.propertyList;
      if (data.fkClassId instanceof Array) {
        data.fkClassId = data.fkClassId[data.fkClassId.length - 1];
      }
      this.loading = true;
      if (this.facilityDialogType === 2) {
        this.$api.baseDeviceTemplateAdd(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.newAddList = [];
            this.$message.success("新增成功");
            this.facilityDialog = false;
            this.propertyList = [];
            this.imgList = [];
            this.facilityForm = {};
            this.baseDeviceTemplate();
          } else {
            return this.$message.warning(res.msg);
          }
        });
      } else if (this.facilityDialogType === 3) {
        this.$api.baseDeviceTemplateUpdate(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.newAddList = [];
            this.$message.success("编辑成功");
            this.facilityDialog = false;
            this.propertyList = [];
            this.imgList = [];
            this.facilityForm = {};
            this.baseDeviceTemplate();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeFacilityDialogFalse() {
      this.delList = [];
      this.facilityDialog = false;
    },
    // 单位弹框
    openUnitDialog() {
      this.unitPage.pageSize = 10;
      this.unitPage.pageNum = 1;
      this.unitPage.keyWord = "";
      this.unitSearchPage();
      this.unitDialog = true;
    },
    openUnitManDialog(type, row) {
      this.unitDialogType = type;
      this.unitManDialogTitle = type === 1 ? "新增单位" : "编辑单位";
      if (type === 2) {
        console.log(row);
        this.unitForm = { ...row };
      }
      this.unitManDialog = true;
    },
    // 查询所有单位
    conditionUnits() {
      this.$api.conditionUnits({ unitType: 1 }).then(res => {
        if (res.code == 200) {
          this.unitData = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    unitSearchPage() {
      this.loading1 = true;
      this.$api.unitSearchPage(this.unitPage).then(res => {
        this.loading1 = false;
        if (res.code == 200) {
          this.unitDataList = res.data.records;
          this.unitTotal = res.data.total - 0;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 页数改变事件
    unitPageSizeChange(pageSize) {
      this.unitPage.pageSize = pageSize;
      this.unitSearchPage();
    },
    // 页码改变事件
    unitPageCurrentChange(currentPage) {
      this.unitPage.pageNum = currentPage;
      this.unitSearchPage();
    },
    unitSubmit() {
      if (!this.unitForm.unitName) {
        return this.$message.warning("请填写单位名称");
      }
      if (!this.unitForm.enName) {
        return this.$message.warning("请填写子单位");
      }
      if (!this.unitForm.sortval && this.unitForm.sortval !== 0) {
        return this.$message.warning("请填写排序号");
      }
      this.loading = true;
      if (this.unitDialogType === 1) {
        // 新增
        // this.unitForm.enName = this.unitForm.unitName;
        this.$api.addUnits({ ...this.unitForm, unitType: 1 }).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.unitSearchPage();
            this.$message.success("新增成功");
            this.closeUnitManDialog();
          } else {
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      } else {
        // 编辑
        this.$api.modifyUnits(this.unitForm).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.unitSearchPage();
            this.$message({
              type: "success",
              message: "编辑成功！"
            });
            this.closeUnitManDialog();
          } else {
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      }
    },
    deleteUnit(row) {
      this.$confirm("确定删除该单位?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.deleteUnits({ pkId: row.pkId }).then(res => {
          if (res.code == 200) {
            this.$message.success("删除成功");
            this.unitSearchPage();
          } else {
            this.$message({
              type: "warning",
              message: res.msg
            });
          }
        });
      });
    },
    unitUpdateEnableStatus(row) {
      this.$confirm(row.enableStatus == "1" ? "确定禁用该单位" : "确定启用该单位", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        const data = {
          enableStatus: row.enableStatus == "1" ? 0 : 1,
          pkId: row.pkId
        };
        this.$api.unitUpdateEnableStatus(data).then(res => {
          if (res.code == 200) {
            this.unitSearchPage();
            this.$message.success("操作成功");
          } else {
            this.$message.error(res.msg);
          }
        });
      });
    },
    closeUnitManDialog() {
      this.unitForm = {
        enName: "", // 子单位
        unitName: "", // 单位名称
        sortval: null
      };
      this.unitManDialog = false;
    },
    search() {
      this.page.pageNum = 1;
      delete this.page.fkClassId;
      this.baseDeviceTemplate();
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.page.pageSize = pageSize;
      this.baseDeviceTemplate();
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.page.pageNum = currentPage;
      this.baseDeviceTemplate();
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
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  // margin: 20px;
  display: flex;
  // border: 1px solid #f3f3f3;
  //height: 100%;
  .left {
    // margin-top: 10px;
    width: 20%;
    overflow: hidden;
    //border: 1px solid #f3f3f3;
    background-color: #fff;
    border-radius: 5px;
    height: 805px;
    padding: 6px;
    ::-webkit-scrollbar {
      width: 5px;
      color: #fff;
      background-color: #fcfcfc;
    }
    ::-webkit-scrollbar-thumb {
      background-color: rgb(209, 209, 209);
    }
    position: relative;
    // .left_title {
    //   background: #fff;
    //   position: absolute;
    //   left: 116px;
    //   z-index: 2;
    //   top: -11px;
    //   font-size: 16px;
    // }
    .left-header {
      position: relative;
      margin: 15px 15px 10px 15px;
      height: 2px;
      // background: #ccc;
      .left_title {
        position: absolute;
        left: -2px;
        z-index: 2;
        top: -11px;
        padding: 0 6px 0 6px;
        font-size: 16px;
        text-align: center;
        background: #fff;
      }
    }
    .left_center {
      height: 100%;
      font-size: 13px;
      // overflow: auto;
      padding-bottom: 20px;
    }
    .el-icon-edit:hover {
      cursor: pointer;
    }
    // .icon_title{
    //   font-size: 15px;
    // font-weight: 900;
    // color: #0c880c;
    // }
    /deep/ .className .cell {
      width: max-content !important;
      //   overflow:hidden; text-overflow:ellipsis;white-space: nowrap;
    }
    ::-webkit-scrollbar {
      width: 5px;
      color: #fff;
      background-color: #fcfcfc;
    }
    ::-webkit-scrollbar-thumb {
      background-color: rgb(209, 209, 209);
    }
    .el-table::before {
      height: 0;
    }
  }
  .icon_title:hover {
    cursor: pointer;
  }
  .rigth {
    padding-top: 5px;
    // margin-top: 10px;
    margin-left: 10px;
    border-left: 1px solid #f3f3f3;
    width: 79%;
    background-color: #fff;
    border-radius: 5px;
  }
  .unitTable {
    position: absolute;
    top: 4px;
    z-index: 3;
    font-size: 27px;
    font-weight: 900;
  }
  .unitTable:hover {
    cursor: pointer;
  }
}
/deep/.el-button {
  font-size: 12px;
}
/deep/.el-button + .el-button {
  margin: 0;
}
.btns {
  font-size: 12px;
  zoom: 0.85;
}
.searchHeader {
  padding: 0 20px;
  position: relative;
  .btn {
    position: absolute;
    top: 6px;
    right: 22px;
    z-index: 8;
  }
}
.pitch {
  padding: 0 20px 0 20px;
}
.tabs {
  margin-bottom: 10px;
}
.btn-wh {
  position: absolute;
  top: 42px;
  right: 10px;
  z-index: 10;
}
.disColor {
  color: #d7d7d7;
}
.el-row-data {
  display: flex;
  flex-wrap: wrap;
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
.line {
  border-top: 1px solid #b9b9b9;
}
.imgList {
  display: flex;
  // justify-content: space-evenly;
  .imgs {
    position: relative;
    margin: 0 15px;
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
.dialog-footer {
  text-align: center;
}
/deep/ .el-dialog__header {
  border-bottom: none;
}
/deep/ .el-dialog__footer {
  border-top: none;
}
/deep/ .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background-color: #fafcff;
}
/deep/ .el-table__row {
  .el-table__expand-icon .el-icon-arrow-right:before {
    content: "\e6d9";
    border: 1px solid #b4c1df;
    color: rgba(0, 165, 255, 1);
    font-weight: 700;
  }

  .el-table__expand-icon--expanded {
    transform: rotate(0deg);
  }

  .el-table__expand-icon--expanded .el-icon-arrow-right:before {
    content: "\e6d8" !important;
    border: 1px solid #b4c1df;
    color: rgba(0, 165, 255, 1);
    font-weight: 700;
  }
}
</style>
