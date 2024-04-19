<template>
  <div class="app-container">
    <!-- <el-radio-group v-model="type" size="mini" class="tabs" @change="typeChange">
      <el-radio-button v-for="item in typeOptions" :key="item.pkId" :label="item.pkId">{{ item.engTypeName }}</el-radio-button>
    </el-radio-group> -->
    <custom @choose="choose" style="height: 93%;" v-show="!basicStatus" :types="'6'"></custom>
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
            清单项目类别
          </div>
        </div>
        <div class="left_center">
          <div class="btn-wh">
            <el-button type="warning" plain style="margin-top: 5px" size="mini" v-has="'customized:detailTable:classAdd'" class="btns btn-add" @click="addClassify">新增</el-button>
            <el-button type="danger" plain class="btns" size="mini" v-has="'customized:detailTable:classDelete'" @click="batchDelete">删除</el-button>
          </div>
          <!-- @row-click="rowClick" @selection-change="handleSelectionChange"-->
          <el-table :data="tableData" style="width: 100%;  margin-bottom: 20px" row-key="pkId" highlight-current-row v-loading="loading" :tree-props="{ children: 'childList', hasChildren: 'hasChildren' }" ref="multipleTable" tooltip-effect="dark" lazy :load="load" height="88%">
            <el-table-column type="selection" width="50">
              <template slot-scope="{ row }">
                <el-checkbox @change="checkBoxChange($event, row)" v-if="row.grade" class="mychecked"></el-checkbox>
                <img src="../../assets/file-read-1164.png" alt="" class="showImg" v-else />
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip class-name="className" label="分类名称">
              <template slot-scope="{ row }">
                <span :class="{ disColor: !!row.invalidFlag }" style="cursor: pointer;" @click="rowClick(row)">
                  {{ row.className }}
                </span>
              </template>
            </el-table-column>
            <el-table-column align="right" min-width="30vw">
              <template slot-scope="scope" v-if="scope.row.parentId !== null">
                <div style="width: 100%">
                  <el-button type="primary" plain size="mini" v-has="'customized:detailTable:classEdit'" class="btns" @click="editClassify(scope.row)">编辑</el-button>
                </div>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <el-dialog :visible.sync="show1" width="500px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
          <el-form :model="form" :rules="rules" class="dialog-form" v-loading="loading">
            <!-- <el-form-item label="工程大类" label-width="75px" >
              <el-select size="mini" style="width: 100%" v-model="form.fkEnginerringTypeId" @change="typeChange2" disabled>
                <el-option v-for="item in typeOptions" :key="item.pkId" :value="item.pkId" :label="item.engTypeName"></el-option>
              </el-select>
            </el-form-item> -->
            <el-form-item label="专业类别" label-width="75px">
              <el-select size="mini" style="width: 100%" v-model="form.fkProfessionalTypeId" @change="professChange" :disabled="!!(form.fkProfessionalTypeId - 0) && showType == 2">
                <el-option v-for="item in typeSonList2" :key="item.pkId" :value="item.pkId" :label="item.engTypeName"></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="上级分类" prop="superiors" label-width="75px">
              <el-input size="mini" autocomplete="off" v-if="form.superiors=='无'" disabled  v-model="form.superiors"></el-input>
              <el-cascader v-else size="mini" style="width: 100%" v-model="form.superiors" :options="parentData" :props="setProps" filterable ref="organizerUnit" @change="organizerUnit" :disabled="!!(form.fkProfessionalTypeId - 0) && showType == 2"></el-cascader>
            </el-form-item> -->
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
            <el-button size="mini" type="primary" :disabled="loading" class="el-button-primary" @click="submitClassify">保 存</el-button>
          </div>
        </el-dialog>
      </div>
      <div class="rigth">
        <div class="searchHeader" style="margin: 0 20px">
          <el-form :inline="true" class="demo-form-inline" label-width="90">
            <el-form-item>
              <el-input prefix-icon="el-icon-search" v-model="query.detailName" maxlength="50" placeholder="请输入搜索内容" size="mini" style="width: 180px"></el-input>
              <el-button type="primary" class="el-button-primary" size="mini" @click="search">查询</el-button>
            </el-form-item>
            <el-form-item> </el-form-item>
            <el-form-item> </el-form-item>
          </el-form>
          <div class="btn">
            <el-button type="primary" class="el-button-primary" size="mini" @click="addMaterial" v-has="'customized:detailTable:add'">新建清单项目</el-button>
            <!-- <el-button type="primary" size="mini" @click="unitManagement" v-has="'system:projectDetails:company'">单位管理</el-button> -->
          </div>
        </div>
        <div class="tab-container pitch">
          <el-table ref="tables" :data="tableData1" stripe style="width: 100%" v-loading="loading1" height="83%" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
            <el-table-column align="center" label="序号" min-width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (query.pageNum - 1) * query.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="detailName" label="清单项目名称" min-width="120"></el-table-column>
            <el-table-column align="center" prop="fkDetailClassName" label="清单项目类别" min-width="120" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="fkUnitName" label="单位" min-width="60" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="sortval" label="排序号" min-width="60" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="remark" label="操作" min-width="150">
              <template slot-scope="scope">
                <el-button type="success" plain size="mini" style="margin-top: 5px" v-has="'customized:detailTable:edit'" @click="edit(scope.row)">编辑</el-button>
                <el-button type="danger" plain size="mini" style="margin-top: 5px" v-has="'customized:detailTable:delete'" @click="Delete(scope.row)">删除</el-button>
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
      <el-dialog :visible.sync="show2" width="560px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
        <el-form :model="materialForm" :rules="rules" style="margin-top: 20px" class="dialog-form">
          <el-form-item label="清单项目名称" prop="materialName" :label-width="formLabelWidth">
            <el-input size="mini" v-model="materialForm.materialName" autocomplete="off" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="清单项目类别" prop="fkTypeId" :label-width="formLabelWidth">
            <el-cascader size="mini" :disabled="showType2 == 2" style="width: 100%" v-model="materialForm.fkTypeId" placeholder="" :options="pareData" :props="setProps2" @change="organizerUnitss" ref="organizerUnitss" filterable></el-cascader>
          </el-form-item>
          <el-form-item label="单位" prop="fkUnitId" :label-width="formLabelWidth">
            <el-select size="mini" v-model="materialForm.fkUnitId" filterable placeholder="请选择" style="width: 100%">
              <el-option v-for="item in unitData" :key="item.pkId" :label="item.unitName" :value="item.pkId"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序号" :label-width="formLabelWidth">
            <el-input size="mini" v-model="materialForm.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="channelInputLimit"></el-input>
          </el-form-item>
          <!-- <el-form-item label="型号" prop="model" :label-width="formLabelWidth">
            <el-input
              v-model="materialForm.model"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="颜色" prop="specs" :label-width="formLabelWidth">
            <el-input
              v-model="materialForm.specs"
              autocomplete="off"
            ></el-input>
          </el-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="show2 = false">取 消</el-button>
          <el-button size="mini" type="primary" class="el-button-primary" :disabled="loaidng" @click="materialSubmit">保 存</el-button>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="show3" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
        <div style="margin-top: 20px">
          <span class="unitTable" @click="addUnit">+</span>
          <el-table :data="unitData" border style="width: 100%" height="500px" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
            <el-table-column align="center" prop="unitName" label="单位名称" min-width="80"></el-table-column>
            <el-table-column align="center" prop="enName" label="子单位" min-width="80" show-overflow-tooltip></el-table-column>
            <el-table-column align="center" prop="sortval" label="排序号" min-width="80" show-overflow-tooltip></el-table-column>
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
      <el-dialog :visible.sync="show4" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
        <el-form :model="unitForm" :rules="rules" style="margin-top: 20px">
          <el-form-item label="单位名称" prop="unitName" :label-width="formLabelWidth">
            <el-input v-model="unitForm.unitName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="子单位" prop="enName" :label-width="formLabelWidth">
            <el-input v-model="unitForm.enName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="排序号" prop="sortval" :label-width="formLabelWidth">
            <el-input v-model.trim="unitForm.sortval" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="show4 = false">取 消</el-button>
          <el-button size="mini" type="primary" class="el-button-primary" :disabled="loaidng" @click="unitSubmit">保 存</el-button>
        </div>
      </el-dialog>
    </div>
    <el-dialog title="选择企业" width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div style="height: 560px;">
        <custom @choose="choose" :types="'6'" style="height: 85%;" ref="custom" :status="choiceShow"></custom>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import custom from "./compomemts/custom.vue";
export default {
  name: "detailTable",
  components: {
    custom
  },
  data() {
    return {
      tableData: [],
      name: "",
      tableData1: [],
      show1: false,
      show2: false,
      show3: false,
      show4: false,
      form: {
        name: "",
        superiors: "",
        sortval: "",
        fkProfessionalTypeId: "",
        fkEnginerringTypeId: "" // 所属工程类型ID
      },
      rules: {},
      formLabelWidth: "120px",
      unitData: [], // 单位列表
      setProps: {
        value: "pkId",
        label: "className",
        children: "childList",
        checkStrictly: true
      },
      setProps2: {
        value: "pkId",
        label: "className",
        children: "childList"
      },
      multipleSelection: [],
      rowDate: [],
      showType: null,
      query: {
        pageNum: 1,
        pageSize: 10,
        detailName: "",
        fkProfessionalTypeId: "", // 专业类别ID
        fkEnginerringTypeId: "" // 所属工程类型ID
      },
      showType2: null,
      materialForm: {
        fkTypeId: null, // 物料类别
        fkUnitId: null, // 单位id
        materialName: null, // 物料名称
        model: null, // 型号
        specs: null, // 规格
        sortval: null
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
      parentData: [],
      pareData: [],
      invalidFlag: 0,
      loadNodeMap: {},
      uploadIdList: [],
      headDate: {},
      basicStatus: false,
      choiceShow: false,
      rowPkId: ""
    };
  },
  watch: {
    show2(val) {
      if (val) {
        this.searchDetailClassByEngTypeId();
      }
    }
  },
  mounted() {},
  methods: {
    choose(item) {
      this.headDate = item;
      this.type = item.fkEnginerringTypeId
      // this.fkOrgId = item.pkId;
      this.basicStatus = false;
      this.choiceShow = false;
      this.$nextTick(() => {
        this.basicStatus = true;
        this.conditionUnits();
        this.searchTypeList();
        this.allCategory();
      });
    },
    choiceProject() {
      this.choiceShow = true;
      this.$nextTick(() => {
        this.$refs.custom.reset();
      });
    },
    rowClick(row) {
      console.log(row.pkId);
      this.rowPkId = row.pkId;
      let data = {};
      if (row.grade == null) {
        data = {
          fkProfessionalTypeId: row.fkProfessionalTypeId,
          pageNum: 1,
          pageSize: 10,
          detailName: ""
        };
      } else {
        data = {
          fkProfessionalTypeId: row.fkProfessionalTypeId,
          fkDetailClassId: row.pkId,
          pageNum: 1,
          pageSize: 10,
          detailName: ""
        };
      }
      if (row.type == 2) {
        data.isBottom = 1;
      } else {
        data.isBottom = 0;
      }
      this.query = { ...this.query, ...data };
      this.tablePage(data);
    },
    organizerUnit(a) {
      if (this.$refs.organizerUnit) {
        this.$refs.organizerUnit.dropDownVisible = false;
      }
    },
    organizerUnitss(a) {
      if (this.$refs.organizerUnitss) {
        this.$refs.organizerUnitss.dropDownVisible = false;
      }
    },
    // 新增物料分类
    addClassify() {
      this.form.sortval = "";
      this.showType = 1;
      this.show1 = true;
      this.form.superiors = null;
      this.form.name = null;
      this.form.fkProfessionalTypeId = this.query.fkProfessionalTypeId;
      this.form.fkEnginerringTypeId = this.type;
      this.typeSonList2 = this.typeSonList;
      if (this.query.fkProfessionalTypeId) {
        this.listAllByProfessionalTypeId(this.form.fkProfessionalTypeId);
      }
    },
    submitClassify() {
      // 新增确定
      if (!this.form.fkEnginerringTypeId) {
        return this.$message.warning("请选择工程大类");
      }
      if (!this.form.fkProfessionalTypeId) {
        return this.$message.warning("请选择专业类别");
      }
      if (!this.form.name) {
        return this.$message.warning("请输入分类名称");
      }
      if (!this.form.sortval) {
        return this.$message.warning("排序值不能为空");
      }
      if (this.showType == 1) {
        let superiors = "";
        if (this.form.superiors != null) {
          superiors = this.form.superiors[this.form.superiors.length - 1];
        } else {
          superiors = 0;
        }
        const data = {
          parentId: superiors,
          className: this.form.name,
          grade: 1,
          sortval: this.form.sortval,
          fkProfessionalTypeId: this.form.fkProfessionalTypeId,
          fkOrgId: this.headDate.pkId
        };
        this.loading = true;
        this.$api.addCategory(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            if (this.loadNodeMap[this.form.fkProfessionalTypeId]) {
              this.detailClassById(this.form.fkProfessionalTypeId);
            }
            this.allCategory();
            this.$message({
              type: "success",
              message: "新增成功！"
            });
            this.show1 = false;
          } else {
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
          parentId = this.form.superiors == "无" ? 0 : this.form.superiors;
        }
        // 修改确认
        const datas = {
          pkId: this.rowDate.pkId,
          grade: this.rowDate.grade,
          sortval: this.form.sortval,
          className: this.form.name,
          parentId,
          fkProfessionalTypeId: this.form.fkProfessionalTypeId,
          invalidFlag: this.invalidFlag,
          fkOrgId: this.headDate.pkId
        };
        if (datas.parentId === datas.pkId) {
          return this.$message.warning("上级分类不能是自己");
        }
        this.loading = true;
        this.$api.modifyCategory(datas).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.show1 = false;
            this.allCategory();
            this.tablePage(this.query);
            if (this.loadNodeMap[this.form.fkProfessionalTypeId]) {
              this.detailClassById(this.form.fkProfessionalTypeId);
            }
            this.$message({
              type: "success",
              message: "修改成功！"
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
      const allType = [];
      this.multipleSelection.forEach(item => {
        pkIds.push(item.pkId);
        allType.push(item.fkProfessionalTypeId);
      });
      this.uploadIdList = Array.from(new Set(allType));
      _this
        .$confirm("确认删除已选清单项目类别?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.deleteCategory({ pkIds: pkIds.toString() }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.allCategory();
              this.uploadIdList.forEach(item => {
                this.detailClassById(item);
              });
              this.uploadIdList = [];
              this.multipleSelection = [];
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
      console.log("==============================>>>>>>>>");
      console.log(row);
      // superiors
      console.log("==============================>>>>>>>>");
      this.showType = 2;
      this.show1 = true;
      this.form.superiors = row.parentId;

      this.form.name = row.className;
      this.rowDate = row;
      this.form.fkProfessionalTypeId = row.fkProfessionalTypeId == 0 ? "" : row.fkProfessionalTypeId;
      this.form.sortval = row.sortval;
      this.form.fkEnginerringTypeId = this.type;
      this.typeSonList2 = this.typeSonList;

      this.listAllByProfessionalTypeId(row.fkProfessionalTypeId);
      this.invalidFlag = row.invalidFlag;
      if (row.grade == 1) {
        this.form.superiors = "无";
      }
    },
    // 获取所有工程细目类别
    allCategory() {
      this.$api.detailClassById({ id: this.type, type: 0, typeId: 0, fkOrgId: this.headDate.pkId }).then(res => {
        if (res.code == 200) {
          res.data.detailClassList.forEach(item => {
            if (item.isChildren == 0) {
              item.hasChildren = false;
            } else {
              item.hasChildren = true;
            }
          });
          this.tableData = res.data.detailClassList;
          // this.tableData = res.data.detailClassList.map(item => ({
          //   ...item,
          //   hasChildren: true
          // }));
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 懒加载刷新
    detailClassById(id) {
      this.$api.detailClassById({ id, type: 1, typeId: 0, fkOrgId: this.headDate.pkId }).then(res => {
        console.log(res);
        if (res.code === 200) {
          this.loadNodeMap[id].resolve(res.data.detailClassList.map(item => ({ ...item, hasChildren: item.isChildren === 1 })));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    handleSelectionChange(val) {
      console.log(val);
      val.forEach(item => {
        this.$refs.multipleTable.toggleRowExpansion(item, false);
      });
      this.multipleSelection = val;
    },
    // 查询物料信息
    tablePage(data) {
      data.fkOrgId = this.headDate.pkId;
      this.loading1 = true;
      this.$api
        .tablePage(data)
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
      this.tablePage(this.query);
    },
    // 物料提交确认
    materialSubmit() {
      if (!this.materialForm.materialName) {
        return this.$message.warning("请填写细目名称");
      }
      if (!this.materialForm.fkUnitId) {
        return this.$message.warning("请选择单位");
      }
      // return console.log(this.materialForm.fkTypeId)
      if (this.materialForm.fkTypeId == null || !this.materialForm.fkTypeId.length) {
        return this.$message.warning("请选择细目分类");
      }
      if (!this.materialForm.sortval) {
        return this.$message.warning("请输入排序号");
      }
      // 新增提交
      const data = this.materialForm;
      if (data.fkTypeId instanceof Array) {
        data.fkTypeId = data.fkTypeId[data.fkTypeId.length - 1];
      }
      const data1 = {
        detailName: data.materialName,
        fkUnitId: data.fkUnitId,
        fkDetailClassId: data.fkTypeId,
        sortval: data.sortval
      };
      data1.fkOrgId = this.headDate.pkId;
      if (this.showType2 == 1) {
        this.loading = true;
        this.$api.addInventory(data1).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.show2 = false;
            this.tablePage(this.query);
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
          datas.fkTypeId = datas.fkTypeId[datas.fkTypeId];
        }
        const data2 = {
          detailName: datas.materialName,
          fkUnitId: datas.fkUnitId,
          fkDetailClassId: datas.fkTypeId,
          sortval: datas.sortval,
          pkId: this.materialRow.pkId
        };
        data2.fkOrgId = this.headDate.pkId;
        this.loading = true;
        this.$api.modifyInventory(data2).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.show2 = false;
            this.tablePage(this.query);
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
      this.materialForm.fkTypeId = item.fkDetailClassId;
      this.materialForm.fkUnitId = item.fkUnitId;
      this.materialForm.materialName = item.detailName;
      this.materialForm.sortval = item.sortval;
      this.materialRow = item;
    },
    // 新增物料
    addMaterial() {
      this.show2 = true;
      this.showType2 = 1;
      this.materialForm = {
        fkTypeId: null, // 物料类别
        fkUnitId: null, // 单位id
        materialName: null, // 物料名称
        model: null, // 型号
        specs: null, // 规格
        sortval: null
        // remark:null
      };
      this.materialForm.fkTypeId = this.rowPkId;
      console.log("Xxxxxxxxxx-=====xxxxxxxxxxxxxxxxxxxx");
      //  console.log(this.query.fkDetailClassId)
      console.log("Xxxxxxxxxx-=====xxxxxxxxxxxxxxxxxxxx");
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
          this.$api.deleteInventory({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.tablePage(this.query);
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
      if (!this.unitForm.unitName) {
        return this.$message.warning("请输入单位名称");
      }
      if (!this.unitForm.enName) {
        return this.$message.warning("请输入子单位");
      }
      if (!this.unitForm.sortval) {
        return this.$message.warning("请输入排序值");
      }
      // 新增单位
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
            this.tablePage(this.query);
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
          this.$api.deleteUnits({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.conditionUnits();
            } else {
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        });
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.query.pageSize = pageSize;
      this.tablePage(this.query);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.query.pageNum = currentPage;
      this.tablePage(this.query);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 获取工程大类下拉框数据
    searchTypeList() {
      this.$api.searchTypeList().then(res => {
        if (res.code === 200) {
          this.typeOptions = res.data;
          if (res.data && res.data.length) {
            // this.type = res.data[0].pkId;
            let obj = res.data.filter(item=>item.pkId == this.type)[0]
            this.query.fkEnginerringTypeId = res.data[0].pkId;
            // this.typeSonList = res.data[0].typeSonList;
            this.typeSonList = obj.typeSonList;
            this.tablePage(this.query);
            this.allCategory();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 工程大类选中事件
    typeChange(e) {
      const val = this.typeOptions.filter(item => item.pkId === e)[0];
      this.query = {
        // ...this.query,
        pageNum: 1,
        pageSize: this.query.pageSize,
        detailName: this.query.detailName,
        fkProfessionalTypeId: "",
        fkEnginerringTypeId: val.pkId
      };
      this.loadNodeMap = {};
      this.tablePage(this.query);
      this.allCategory();
      this.typeSonList = val.typeSonList;
      this.multipleSelection = [];
    },
    typeChange2(e) {
      const val = this.typeOptions.filter(item => item.pkId === e)[0];
      this.form.fkEnginerringTypeId = val.pkId;
      this.form.fkProfessionalTypeId = "";
      this.typeSonList2 = val.typeSonList;
    },
    professChange(e) {
      this.listAllByProfessionalTypeId(e);
      // let data = this.tableData.filter((item) => item.pkId === e)[0];
      // this.parentData = data.childList ? data.childList : [];
    },
    listAllByProfessionalTypeId(professionalTypeId) {
      this.$api.listAllByProfessionalTypeId3({ professionalTypeId, fkOrgId: this.headDate.pkId }).then(res => {
        if (res.code === 200) {
          this.parentData = res.data;
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
    searchDetailClassByEngTypeId() {
      this.$api.searchDetailClassByEngTypeId({ engTypeId: this.type, fkOrgId: this.headDate.pkId }).then(res => {
        if (res.code === 200) {
          this.pareData = this.getTreeData(res.data);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].childList.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].childList = undefined;
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.getTreeData(data[i].childList);
        }
      }
      return data;
    },
    // 懒加载
    load(tree, treeNode, resolve) {
      // let params = { id: tree.pkId, type: 1, typeId: 0 };
      if (tree.childList && tree.childList.length) {
        resolve(
          tree.childList.map(item => ({
            ...item,
            hasChildren: !!(item.childList && item.childList.length)
          }))
        );
      } else {
        // .detailClassById({ id: this.type, type: 0, typeId: 0 })
        // .listAllByProfessionalTypeId({ professionalTypeId: tree.pkId })
        let data = {};
        switch (tree.grade) {
          case null:
            data = {
              id: tree.pkId,
              type: 1,
              typeId: 0,
              fkOrgId: this.headDate.pkId
            };
            break;
          case 1:
            data = {
              id: tree.fkProfessionalTypeId,
              type: 2,
              typeId: tree.pkId,
              fkOrgId: this.headDate.pkId
            };
            break;
        }

        // this.type
        this.$api.detailClassById(data).then(res => {
          if (res.code === 200) {
            resolve(
              res.data.detailClassList.map(item => ({
                ...item,
                // hasChildren: tree.grade == 1 ? false : tree
                hasChildren: item.isChildren == 1
              }))
            );
            this.loadNodeMap[tree.pkId] = { tree, treeNode, resolve };
          } else {
            this.$message.warning(res.msg);
            resolve([]);
          }
        });
      }
    },
    // 左侧表单复选框事件
    checkBoxChange(e, row) {
      if (e) {
        this.multipleSelection.push(row);
      } else {
        this.multipleSelection.filter(item => item.pkId !== row.pkId);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.box {
  // margin: 20px;
  // border: 1px solid #f3f3f3;
  display: flex;
  .left {
    width: 20%;
    // margin-top: 10px;
    height: 755px;
    padding: 6px;
    position: relative;
    background-color: #fff;
    border-radius: 5px;
    ::-webkit-scrollbar {
      width: 5px;
      color: #fff;
      background-color: #fcfcfc;
    }
    ::-webkit-scrollbar-thumb {
      background-color: rgb(209, 209, 209);
    }
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
      // border: 1px solid #f3f3f3;
      height: 100%;
      overflow: auto;
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
      // width: max-content !important;
      //   overflow:hidden; text-overflow:ellipsis;white-space: nowrap;
    }
  }
  .icon_title:hover {
    cursor: pointer;
  }
  .rigth {
    // margin: 0px 20px;
    padding-top: 13px;
    width: 79%;
    border-left: 1px solid #f3f3f3;
    background-color: #fff;
    margin-left: 10px;
    border-radius: 5px;
    .searchHeader {
      position: relative;
      .btn {
        position: absolute;
        top: 6px;
        right: 5px;
        z-index: 8;
      }
    }
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
.btns {
  font-size: 12px;
  zoom: 0.85;
}
.pitch {
  margin: 0 20px 0 20px;
}
// /deep/.el-button + .el-button {
//   margin: 0;
// }
.tabs {
  // margin-bottom: 10px;
}
.btn-wh {
  position: absolute;
  top: 45px;
  right: 10px;
  z-index: 10;
}
.disColor {
  color: #d7d7d7;
}
.showImg {
  width: 14px;
  height: 14px;
}
/deep/ .has-gutter {
  .el-checkbox {
    display: none !important;
  }
}
.headline {
  line-height: 40px;
  border-radius: 4px;
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
