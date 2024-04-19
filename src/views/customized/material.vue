<template>
  <div class="app-container">
    <custom @choose="choose" style="height: 93%;" v-show="!basicStatus" :types="'7'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject" style="padding: 0"></el-button>{{ headDate.orgName }}</span>
      <span class="item">管理员手机号码：{{ headDate.telephone }}</span>
      <span class="item">联系人:{{ headDate.linkMan }}</span>
      <span class="item">联系人手机号码：{{ headDate.linkPhone }}</span>
      <span class="item">到期日期：{{ headDate.expireTime }}</span>
    </div>
    <div class="box" v-show="basicStatus">
      <div class="left">
        <div class="left-header">
          <div class="left_title">
            物料分类
          </div>
        </div>
        <div class="left_center">
          <div class="btn-wh">
            <el-button plain type="primary" size="mini" class="btns btn-add" v-has="'customized:material:classAdd'" @click="addClassify">新增</el-button>
            <el-button plain type="danger" size="mini" class="btns btn-del" v-has="'customized:material:classDelete'" @click="batchDelete">删除</el-button>
          </div>
          <el-table :data="tableData" style="width: 100%; margin-bottom: 20px" row-key="pkId" v-loading="loading" height="88%" :tree-props="{ children: 'childList', hasChildren: 'hasChildren' }" ref="multipleTable" @select="select" @select-all="selectAll" tooltip-effect="dark" @selection-change="handleSelectionChange" @row-click="rowClick">
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column label="分类名称" show-overflow-tooltip class-name="sys-name">
              <template slot-scope="{ row }">
                <span :class="{ disColor: !!row.invalidFlag }">
                  {{ row.typeName }}
                </span>
              </template>
            </el-table-column>
            <el-table-column align="center" min-width="30vw">
              <template slot-scope="scope" v-if="scope.row.parentId !== null">
                <el-button plain type="primary" size="mini" v-has="'customized:material:classEdit'" class="btns" @click="editClassify(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <el-dialog :visible.sync="show1" width="450px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
          <el-form :model="form" :rules="rules" class="dialog-form" v-loading="loading">
            <!-- <el-form-item label="上级分类" prop="superiors" label-width="75px">
              <el-cascader size="mini" style="width: 100%" v-model="form.superiors" placeholder="" :options="parentData" :disabled="showType == 2" :props="setProps" filterable ref="organizerUnit" @change="organizerUnit"></el-cascader>
            </el-form-item> -->
            <el-form-item label="分类属性" prop="property" label-width="75px">
              <el-select size="mini" v-model="form.property" filterable placeholder="请选择" style="width: 100%" :disabled="forbidden">
                <el-option v-for="item in propertyData" :key="item.pkId" :label="item.keyVal" :value="item.keyName"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="分类名称" prop="name" label-width="75px">
              <el-input size="mini" v-model="form.name" autocomplete="off" maxlength="25"></el-input>
            </el-form-item>
            <el-form-item label="排序号" label-width="75px">
              <el-input size="mini" v-model="form.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="channelInputLimit"></el-input>
            </el-form-item>
            <el-form-item label="状态" label-width="75px" v-if="showType == 2">
              <el-radio-group v-model="invalidFlag">
                <el-radio :label="0">正常</el-radio>
                <!-- <el-radio :label="1">作废</el-radio> -->
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button size="mini" @click="show1 = false">取 消</el-button>
            <el-button size="mini" type="primary" :disabled="loading" class="el-button-primary" @click="submitClassify">保存</el-button>
          </div>
        </el-dialog>
      </div>
      <div class="rigth">
        <div class="searchHeader">
          <el-form :inline="true" class="demo-form-inline" label-width="90">
            <el-form-item>
              <el-input prefix-icon="el-icon-search" v-model="query.materialName" maxlength="50" placeholder="请输入物料名称" size="mini" style="width: 180px"></el-input>

              <el-button type="primary" class="el-button-primary" size="mini" @click="search">查询</el-button>
            </el-form-item>
            <el-form-item> </el-form-item>
            <el-form-item> </el-form-item>
          </el-form>
          <div class="btn">
            <el-button type="primary" class="el-button-primary" size="mini" @click="addMaterial" v-has="'customized:material:add'">新建物料</el-button>
            <!-- <el-button type="primary" size="mini" @click="unitManagement" v-has="'system:material:company'">单位管理</el-button> -->
          </div>
        </div>
        <div class="tab-container pitch">
          <el-table ref="tables" :data="tableData1" stripe style="width: 100%" height="83%" v-loading="loading1" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
            <el-table-column align="center" label="序号" min-width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (query.pageNum - 1) * query.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="materialName" label="物料名称"></el-table-column>
            <el-table-column align="center" prop="fkTypeName" label="分类" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="fkUnitName" label="单位" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="specs" label="规格" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="model" label="型号" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="remark" label="操作" min-width="120">
              <template slot-scope="scope">
                <el-button plain type="primary" size="mini" v-has="'customized:material:edit'" @click="edit(scope.row)">编辑</el-button>
                <el-button plain type="danger" size="mini" v-has="'customized:material:delete'" @click="Delete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <table-paging :current-page="query.pageNum" :page-size="query.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
        </div>
      </div>
      <el-dialog :visible.sync="show2" width="500px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form :model="materialForm" :rules="rules" class="dialog-form" v-loading="loading">
          <el-form-item label="物料名称" prop="materialName" label-width="75px">
            <el-input size="mini" v-model="materialForm.materialName" autocomplete="off" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="物料分类" prop="fkTypeId" label-width="75px">
            <el-cascader size="mini" style="width: 100%" v-model="materialForm.fkTypeId" placeholder="" :options="tableData" :props="setProps2" :disabled="showType2 == 2" @change="organizerUnitss" ref="organizerUnitss" filterable></el-cascader>
          </el-form-item>
          <el-form-item label="单位" prop="fkUnitId" label-width="75px">
            <el-select size="mini" v-model="materialForm.fkUnitId" filterable placeholder="请选择" style="width: 100%">
              <el-option v-for="item in unitData" :key="item.pkId" :label="item.unitName" :value="item.pkId"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="型号" prop="model" label-width="75px">
            <el-input size="mini" v-model="materialForm.model" autocomplete="off" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="规格" prop="specs" label-width="75px">
            <el-input size="mini" v-model="materialForm.specs" autocomplete="off" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="排序号" prop="sortval" label-width="75px">
            <el-input size="mini" v-model="materialForm.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="keyDown"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark" label-width="75px">
            <el-input size="mini" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" maxlength="100" v-model="materialForm.remark" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="show2 = false">取 消</el-button>
          <el-button type="primary" class="el-button-primary" :disabled="loading" @click="materialSubmit">保存</el-button>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="show3" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
        <div style="margin-top: 20px">
          <span class="unitTable" @click="addUnit">+</span>
          <el-table :data="unitData" border style="width: 100%" height="500px" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
            <el-table-column align="center" prop="unitName" label="单位名称" min-width="80"></el-table-column>
            <el-table-column align="center" prop="enName" label="子单位" min-width="80" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="remark" label="操作" min-width="80">
              <template slot-scope="scope">
                <el-tooltip style="margin-left: 16px" class="item icon_title" effect="dark" content="编辑" placement="left">
                  <i class="iconfont iconicon-pencil icon_title" @click="unitEdit(scope.row)"></i>
                </el-tooltip>
                <el-tooltip style="margin-left: 20px" class="item icon_title" effect="dark" content="删除" placement="right">
                  <i class="iconfont iconjianhao" @click="remove(scope.row)"></i>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="show4" width="450px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
        <el-form :model="unitForm" :rules="rules" style="margin-top: 20px">
          <el-form-item label="单位名称" prop="unitName" :label-width="formLabelWidth">
            <el-input size="mini" v-model="unitForm.unitName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="子单位" prop="enName" :label-width="formLabelWidth">
            <el-input size="mini" v-model="unitForm.enName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="排序号" prop="sortval" :label-width="formLabelWidth">
            <el-input size="mini" v-model="unitForm.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="keyDown"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="show4 = false">取 消</el-button>
          <el-button type="primary" class="el-button-primary" @click="unitSubmit">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <el-dialog title="选择企业" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div style="height: 560px;">
        <custom @choose="choose" style="height: 85%;" :types="'7'" ref="custom" :status="choiceShow"></custom>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import custom from "./compomemts/custom.vue";
export default {
  name: "material",
  components: {
    custom
  },
  data() {
    return {
      tableData: [],
      parentData: [],
      pareData: [],
      name: "",
      tableData1: [],
      show1: false,
      show2: false,
      show3: false,
      show4: false,
      form: {
        name: "",
        property: "",
        superiors: "",
        sortval: "",
        fkProfessionalTypeId: "",
        fkEnginerringTypeId: "" // 所属工程类型ID
      },
      propertyData: [],
      rules: {},
      formLabelWidth: "75px",
      unitData: [], // 单位列表
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        checkStrictly: true
      },
      setProps2: {
        value: "pkId",
        label: "typeName",
        children: "childList"
      },
      multipleSelection: [],
      rowDate: [],
      showType: null,
      query: {
        pageNum: 1,
        pageSize: 10,
        materialName: ""
        // fkProfessionalTypeId: "", //专业类别ID
        // fkEnginerringTypeId: "", //所属工程类型ID
      },
      showType2: null,
      materialForm: {
        fkTypeId: null, // 物料类别
        fkUnitId: null, // 单位id
        materialName: null, // 物料名称
        model: null, // 型号
        specs: null, // 规格
        remark: "",
        sortval: ""
        // remark:null
      },
      unitForm: {
        enName: null, // 子单位
        unitName: null, // 单位名称
        sortval: null
      },
      showType4: null,
      unitRow: {},
      materialRow: null,
      totalCount: 0,
      loading: false,
      loading1: false,
      typeOptions: [],
      typeSonList: [],
      typeSonList2: [],
      type: "",
      invalidFlag: 0,
      forbidden: false, // 控制
      checkedKeys: false,
      headDate: {},
      basicStatus: false,
      choiceShow: false,
      rowPkId: ""
    };
  },
  watch: {
    show2(val) {
      if (val) {
        this.searchMaterialTypeByEngTypeId();
      }
    }
  },
  mounted() {},
  methods: {
    choose(item) {
      this.headDate = item;
      // this.fkOrgId = item.pkId;
      this.basicStatus = false;
      this.choiceShow = false;
      this.$nextTick(() => {
        this.basicStatus = true;
        this.conditionUnits();
        this.searchTypeList();
        // 获取物料分类
        this.getMaterialType();
        // this.conditionUnits();
        // this.searchTypeList();
      });
    },
    choiceProject() {
      this.choiceShow = true;
      this.$nextTick(() => {
        this.$refs.custom.reset();
      });
    },
    setChildren(children, type) {
      // 编辑多个子层级
      children.map(j => {
        this.toggleSelection(j, type);
        if (j.childList) {
          this.setChildren(j.childList, type);
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
        if (row.childList) {
          // row.childList.map(j => {
          //     this.toggleSelection(j, true)
          // })
          // 解决子组件没有被勾选到
          this.setChildren(row.childList, true);
        }
      } else {
        if (row.childList) {
          // row.childList.map(j => {
          //     this.toggleSelection(j, false)
          // })
          this.setChildren(row.childList, false);
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
        if (row.childList != undefined) {
          this.splite(row.childList);
        }
      });
    },
    // 获取物料分类属性
    getMaterialType() {
      this.$api
        .getItemClass({ dictType: 9 })
        .then(res => {
          if (res.code === 200) {
            this.propertyData = res.data;
          } else {
            this.$message.warning("获取物料分类属性失败");
          }
        })
        .catch(err => {});
    },
    rowClick(row, column, event) {
      // console.log(row)
      this.rowPkId = row.pkId;
      const data = {
        materialTypeId: row.pkId,
        pageNum: 1,
        pageSize: 10,
        materialName: ""
      };
      this.Material(data);
    },
    // 新增物料选择
    organizerUnit(a) {
      // console.log(a[a.length - 1]);
      // const typeCode = this.$refs.organizerUnit.getCheckedNodes()[0].parentTypeCode;
      // console.log(typeCode);
      // this.form.property = typeCode || "materials_common";
      this.forbidden = true;
      if (this.$refs.organizerUnit) {
        this.$refs.organizerUnit.dropDownVisible = false;
      }
      const id = a[a.length - 1];
      this.$api.queryMaterialclassify({ pkId: id }).then(res => {
        if (res.code == 200) {
          this.form.property = res.data.typeCode;
        }
      });
    },
    organizerUnitss(a) {
      if (this.$refs.organizerUnitss) {
        this.$refs.organizerUnitss.dropDownVisible = false;
      }
    },
    // 新增物料分类
    addClassify() {
      this.showType = 1;
      this.show1 = true;
      this.form.superiors = null;
      this.form.property = null;
      this.forbidden = false;
      this.form.name = null;
      this.form.sortval = null;
      // this.form.fkProfessionalTypeId = this.query.fkProfessionalTypeId;
      // this.form.fkEnginerringTypeId = this.type;
      // this.typeSonList2 = this.typeSonList;
      // this.parentData = [];
      this.parentData = this.tableData;
    },
    submitClassify() {
      // 新增确定
      if (this.showType == 1) {
        let superiors = "";
        if (this.form.superiors != null) {
          superiors = this.form.superiors[this.form.superiors.length - 1];
        } else {
          superiors = 0;
        }
        const data = {
          parentId: superiors,
          typeName: this.form.name,
          typeCode: this.form.property,
          grade: 1,
          sortval: this.form.sortval,
          fkOrgId: this.headDate.pkId
          // fkProfessionalTypeId: this.form.fkProfessionalTypeId,
        };
        this.loading = true;
        this.$api.addMaterialclassify(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.show1 = false;
            this.conditionMaterialclassify();
            this.loading = false;
            this.$message({
              type: "success",
              message: "新增成功！"
            });
          } else {
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      } else if (this.showType == 2) {
        let parentId = "";
        if (this.form.superiors instanceof Array) {
          parentId = this.form.superiors[this.form.superiors.length - 1];
        } else {
          parentId = this.form.superiors;
        }
        // 修改确认
        const datas = {
          pkId: this.rowDate.pkId,
          grade: this.rowDate.grade,
          typeCode: this.form.property,
          sortval: this.form.sortval,
          typeName: this.form.name,
          parentId,
          // fkProfessionalTypeId: this.form.fkProfessionalTypeId,
          invalidFlag: this.invalidFlag,
          fkOrgId: this.headDate.pkId
        };
        this.loading = true;
        this.$api.modifyMaterialclassify(datas).then(res => {
          if (res.code == 200) {
            this.show1 = false;
            this.conditionMaterialclassify();
            this.Material(this.query);
            this.loading = false;
            this.$message({
              type: "success",
              message: "修改成功！"
            });
          } else {
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      }
    },
    // 删除物料分类
    batchDelete() {
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
        .$confirm("确认删除已选物料分类?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.deleteMaterialclassify({ pkIds: pkIds.toString() }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.conditionMaterialclassify();
            } else {
              this.$message({
                type: "warning",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 修改物料分类
    editClassify(row) {
      console.log(row);
      this.showType = 2;
      this.forbidden = true;
      this.show1 = true;
      this.form.superiors = row.parentId;
      this.form.property = row.parentTypeCode || "materials_common";
      this.form.name = row.typeName;
      this.rowDate = row;
      this.form.sortval = row.sortval;
      this.typeSonList2 = this.typeSonList;
      this.parentData = this.tableData;
      this.invalidFlag = row.invalidFlag;
    },
    // 获取所有物料分类
    conditionMaterialclassify() {
      this.loading = false;
      this.$api.conditionMaterialclassify({ fkOrgId: this.headDate.pkId }).then(res => {
        if (res.code == 200) {
          this.tableData = res.data;
          // this.propertyData = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    handleSelectionChange(val) {
      val.forEach(item => {
        this.$refs.multipleTable.toggleRowExpansion(item, false);
      });
      this.multipleSelection = val;
    },
    // 查询物料信息
    Material(data) {
      this.loading1 = true;
      data.fkOrgId = this.headDate.pkId;
      this.$api
        .Material(data)
        .then(res => {
          if (res.code == 200) {
            this.tableData1 = res.data.records;
            this.totalCount = parseInt(res.data.total);
            this.loading1 = false;
          } else {
            this.loading1 = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          this.loading1 = false;
        });
    },
    // 查询所有单位
    conditionUnits() {
      this.$api.conditionUnits({ unitType: 0 }).then(res => {
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
    // 查询物料
    search() {
      this.query.pageNum = 1;
      this.Material(this.query);
    },
    // 物料提交确认
    materialSubmit() {
      // 新增提交
      const data = this.materialForm;
      if (data.fkTypeId instanceof Array) {
        data.fkTypeId = data.fkTypeId[data.fkTypeId.length - 1];
      }
      if (!data.materialName) {
        return this.$message.warning("请填写物料名称");
      }
      if (!data.fkTypeId) {
        return this.$message.warning("请选择物料分类");
      }
      if (!data.fkUnitId) {
        return this.$message.warning("请选择单位");
      }
      if (!data.model) {
        return this.$message.warning("请填写型号");
      }
      if (!data.specs) {
        return this.$message.warning("请填写规格");
      }
      data.fkOrgId = this.headDate.pkId;
      if (this.showType2 == 1) {
        this.loading = true;
        this.$api.addMaterial(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.show2 = false;
            this.Material(this.query);
            this.$message({
              type: "success",
              message: "新增成功！"
            });
          } else {
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      } else if (this.showType2 == 2) {
        const datas = this.materialForm;
        if (datas.fkTypeId instanceof Array) {
          datas.fkTypeId = datas.fkTypeId[datas.fkTypeId.length - 1];
        }
        datas.pkId = this.materialRow.pkId;
        this.loading = true;
        this.$api.modifyMaterial(datas).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.show2 = false;
            this.Material(this.query);
            this.$message({
              type: "success",
              message: "编辑成功！"
            });
          } else {
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      }
    },
    // 编辑物料
    edit(item) {
      this.show2 = true;
      this.showType2 = 2;
      this.materialForm.fkTypeId = item.fkTypeId; // 物料类别
      this.materialForm.fkUnitId = item.fkUnitId; // 单位id
      this.materialForm.materialName = item.materialName; // 物料名称
      this.materialForm.model = item.model; // 型号
      this.materialForm.specs = item.specs; // 规格
      this.materialForm.remark = item.remark; //
      this.materialForm.sortval = item.sortval; //

      this.materialRow = item;
    },
    // 新增物料
    addMaterial() {
      this.show2 = true;
      this.showType2 = 1;
      this.materialForm = {
        fkTypeId: this.rowPkId, // 物料类别
        fkUnitId: null, // 单位id
        materialName: null, // 物料名称
        model: null, // 型号
        specs: null, // 规格
        remark: null,
        sortval: null
      };
    },
    // 删除物料
    Delete(row) {
      const _this = this;
      _this
        .$confirm("确认删除该数据?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.deleteMaterial({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.Material(this.query);
            } else {
              this.$message({
                type: "warning",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 查看单位列表
    unitManagement() {
      this.show3 = true;
    },
    // 新增单位
    addUnit() {
      this.show4 = true;
      this.unitForm = {
        enName: null, // 子单位
        unitName: null, // 单位名称
        sortval: null
      };
      this.showType4 = 1;
    },
    // 单位确定按钮事假
    unitSubmit() {
      // 新增单位
      if (!this.unitForm.unitName) {
        return this.$message.warning("请输入单位名称");
      }
      if (!this.unitForm.enName) {
        return this.$message.warning("请输入子单位");
      }
      if (!this.unitForm.sortval) {
        return this.$message.warning("请输入排序值");
      }
      if (this.showType4 == 1) {
        this.loading = true;
        this.$api.addUnits({ ...this.unitForm, unitType: 0 }).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.conditionUnits();
            this.$message({
              type: "success",
              message: "新增成功！"
            });
            this.show4 = false;
          } else {
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      } else if (this.showType4 == 2) {
        const data = { ...this.unitForm, unitType: 0 };
        data.pkId = this.unitRow.pkId;
        // 编辑单位
        this.loading = true;
        this.$api.modifyUnits(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.conditionUnits();
            this.Material(this.query);
            this.$message({
              type: "success",
              message: "编辑成功！"
            });
            this.show4 = false;
          } else {
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      }
      //
    },
    // 单位编辑
    unitEdit(row) {
      this.show4 = true;
      this.showType4 = 2;
      this.unitForm.enName = row.enName;
      this.unitForm.unitName = row.unitName;
      this.unitForm.sortval = row.sortval;
      this.unitRow = row;
    },
    // 单位删除
    remove(row) {
      const _this = this;
      _this
        .$confirm("确认删除该单位?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.loading = true;
          this.$api.deleteUnits({ pkId: row.pkId }).then(res => {
            this.loading = false;
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.conditionUnits();
            } else {
              this.$message({
                type: "warning",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.query.pageSize = pageSize;
      this.Material(this.query);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.query.pageNum = currentPage;
      this.Material(this.query);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 获取工程大类下拉框数据
    searchTypeList() {
      this.$api.searchTypeList().then(res => {
        if (res.code === 200) {
          this.typeOptions = res.data;
          if (res.data && res.data.length) {
            this.type = res.data[0].pkId;
            this.typeSonList = res.data[0].typeSonList;
            this.Material(this.query);
            this.conditionMaterialclassify();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
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
    // 根据工程类型ID查询物料分类全部数据
    searchMaterialTypeByEngTypeId() {
      this.$api.conditionMaterialclassify().then(res => {
        if (res.code === 200) {
          this.pareData = this.getTreeData(res.data);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === ".") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    // 递归判断列表，把最后的children设为undefined
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].childList == null || data[i].childList.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].childList = undefined;
        } else {
          // children若不为空数组，则继续递归调⽤本⽅法
          this.getTreeData(data[i].childList);
        }
      }
      return data;
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
    // margin-top: 20px;
    width: 20%;
    overflow: hidden;
    //border: 1px solid #f3f3f3;
    background-color: #fff;
    border-radius: 5px;
    height: 755px;
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
      margin: 15px 15px 15px 15px;
      height: 2px;
      // background: #ccc;
      .left_title {
        position: absolute;
        left: -5px;
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
    padding-top: 20px;
    background-color: #fff;
    border-radius: 5px;
    // border-left: 1px solid #f3f3f3;
    width: 79%;
    margin-left: 10px;
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
  top: 48px;
  right: 10px;
  z-index: 10;
}
.disColor {
  color: #d7d7d7;
}
.headline {
  line-height: 40px;
  background: #fff;
  font-size: 12px;
  .item {
    padding: 0 20px;
  }
}
/deep/ .el-dialog__header {
  padding: 20px 5px;
}
/deep/ .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background-color: #fafcff;
}
/deep/ .el-dialog__body .table-data {
  margin-top: 0 !important;
  padding-top: 0;
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
