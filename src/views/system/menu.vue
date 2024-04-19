<template>
  <div class="app-container">
    <el-tabs v-model="orgType" @tab-click="orgTypeChange">
      <el-tab-pane label="PC权限" name="1"></el-tab-pane>
      <el-tab-pane label="APP权限" name="2"></el-tab-pane>
    </el-tabs>
    <div class="heder">
      <search-bar @search="search" :options="searchOptions" labelWidth="8em" ref="searchBar" :showHandler="false"></search-bar>
      <el-button type="primary" size="mini" v-has="'system:menu:add'" class="search-mr grouping el-button-primary" @click="menuGrouping">菜单分组管理</el-button>
      <el-button type="primary" size="mini" v-has="'system:menu:add'" class="search-mr el-button-primary" @click="registeredUser">新增一级菜单</el-button>
    </div>
    <div class="tab-container" style="margin-top: 10px">
      <div class="table-data" style="height: 82%">
        <el-table :data="tableData" ref="totaltableData" height="100%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" stripe :cell-style="{ align: 'center' }" row-key="pkId" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
          <el-table-column align="left" prop="menuName" label="菜单名称" min-width="90">
            <template slot="header" slot-scope="scope">
              <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('totaltableData', 'isExpand', 'tableData', scope)"></i>
              <span>菜单名称</span>
            </template>
            <template slot-scope="scope">
              <span :class="{ colourGray: scope.row.menuStatus == 1 }">{{ scope.row.menuName }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="menuIcon" label="菜单图标" min-width="130">
            <template slot-scope="{ row }">
              <el-avatar v-if="row.menuIcon != null && row.menuIcon.length" shape="square" :size="30" :src="row.menuIcon"></el-avatar>
              <el-avatar v-if="row.menuSelectedIcon != null && row.menuSelectedIcon.length" shape="square" :size="30" :src="row.menuSelectedIcon"></el-avatar>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="menuUrl" label="路由链接" min-width="80">
            <template slot-scope="scope">
              <div v-if="scope.row.menuType != 2">
                <span :class="{ colourGray: scope.row.menuStatus == 1 }">{{ scope.row.menuUrl }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="menuUrl" label="权限码" min-width="100">
            <template slot-scope="scope">
              <div v-if="scope.row.menuType == 2">
                <span :class="{ colourGray: scope.row.menuStatus == 1 }">{{ scope.row.menuUrl }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="sortval" label="排序号" min-width="80">
            <template slot-scope="scope">
              <span :class="{ colourGray: scope.row.menuStatus == 1 }">{{ scope.row.sortval }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="menuStatusString" label="菜单状态" min-width="90">
            <template slot-scope="scope">
              <span :class="{ colourGray: scope.row.menuStatus == 1 }">{{ scope.row.menuStatusString }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" fixed="right" min-width="280">
            <template slot-scope="scope">
              <el-button type="primary" plain v-has="'system:menu:query'" size="mini" @click.native="examine(scope.row)">查看</el-button>
              <el-button type="warning" plain v-has="'system:menu:add'" size="mini" v-show="scope.row.menuType == 0" @click.native="newSecondary(scope.row)">新增二级菜单</el-button>
              <el-button type="success" plain v-has="'system:menu:add'" size="mini" v-show="scope.row.menuType == 1" @click.native="newButton(scope.row)">新增按钮</el-button>
              <el-button type="success" plain v-has="'system:menu:edit'" size="mini" @click.native="amend(scope.row)">编辑</el-button>
              <el-button type="danger" plain v-has="'system:menu:delete'" size="mini" @click.native="batchDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
    </div>
    <!-- 640px -->
    <el-dialog :title="addTitle" :width="groupingStatus ? '880px' : '640px'" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="edit-box">
        <el-form :model="ruleForm" ref="menuForm" :rules="rules" class="edit-box-left">
          <el-form-item label="菜单类型" prop="sourceType" :label-width="formLabelWidth">
            <el-select v-model="ruleForm.sourceType" size="mini" style="width: 100%" disabled>
              <el-option label="PC" value="1"> </el-option>
              <el-option label="APP" value="2"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="父级菜单" prop="parentId" :label-width="formLabelWidth">
            <el-cascader size="mini" style="width: 100%" @change="parentIdChange" v-model="ruleForm.parentId" placeholder="" :options="parentMenu" :props="setProps" filterable :disabled="addTitle == '菜单信息' || forbidden" ref="organizerUnit"></el-cascader>
          </el-form-item>
          <el-form-item label="菜单名称" prop="menuName" :label-width="formLabelWidth">
            <el-input size="mini" v-model="ruleForm.menuName" :disabled="addTitle == '菜单信息'" maxlength="25" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="菜单图标" :label-width="formLabelWidth" v-if="iconStatus">
            <div v-if="(ruleForm.menuIcon == null || ruleForm.menuIcon == '') && (ruleForm.menuSelectedIcon == null || ruleForm.menuSelectedIcon == '')" style="width: 100px; line-height: 50px; border: 1px solid #ccc; text-align: center; font-size: 32px; color: #7cbd6e" @click="menuIconClick">+</div>
            <div v-else style="position: relative; background: #f2f2f2; padding: 2px 12px; display: inline-block">
              <el-avatar shape="square" v-if="ruleForm.menuIcon != null && ruleForm.menuIcon != ''" style="vertical-align: middle" :size="30" :src="ruleForm.menuIcon"></el-avatar>
              <el-avatar shape="square" v-if="ruleForm.menuSelectedIcon != null && ruleForm.menuSelectedIcon != ''" style="vertical-align: middle" :size="30" :src="ruleForm.menuSelectedIcon"></el-avatar>
              <i v-if="addTitle != '菜单信息'" class="el-icon-close" style="color: red; position: absolute; top: 2px; right: 0px" @click="removeIcon"></i>
            </div>
          </el-form-item>
          <el-form-item v-if="!buttonPermissions" label="路由链接" prop="menuUrl" :label-width="formLabelWidth">
            <el-input size="mini" v-model="ruleForm.menuUrl" :disabled="addTitle == '菜单信息'" autocomplete="off" maxlength="100"></el-input>
          </el-form-item>
          <el-form-item v-if="buttonPermissions" label="按钮权限" prop="btPermissions" :label-width="formLabelWidth">
            <el-input size="mini" v-model="ruleForm.btPermissions" :disabled="addTitle == '菜单信息'" maxlength="100" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="排序值" prop="sortval" :label-width="formLabelWidth">
            <el-input size="mini" v-model="ruleForm.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" :disabled="addTitle == '菜单信息'" @keydown.native="keyDown"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark" :label-width="formLabelWidth">
            <el-input v-if="orgType == 2 && !forbidden" size="mini" v-model="ruleForm.remark" type="textarea" style="resize: none" :rows="7" maxlength="100" placeholder="请输入内容" :disabled="addTitle == '菜单信息'" autocomplete="off"></el-input>
            <el-input v-else size="mini" v-model="ruleForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" placeholder="请输入内容" :disabled="addTitle == '菜单信息'" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="菜单状态" prop="menuStatus" :label-width="formLabelWidth" v-if="forbidden">
            <el-radio-group v-model="ruleForm.menuStatus" :disabled="addTitle == '菜单信息'">
              <el-radio :label="0">正常</el-radio>
              <el-radio :label="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <el-checkbox-group v-model="checkList" class="edit-box-right" :class="{ 'stair-right': groupingStatus }" @change="checkListChange" :disabled="addTitle == '菜单信息'">
          <el-checkbox class="edit-checkbox" v-for="(item, ind) in checkboxList" :label="item.label" :value="item.value" :key="ind"></el-checkbox>
        </el-checkbox-group>
        <div class="edit-box-right stair" v-if="groupingStatus">
          <div v-for="(item, index) in menuGroupArr" :key="index" class="stair-select">
            <!-- , hiddens: !['3', '2', '12', '10', '4'].includes(item.value) -->
            <el-select v-model="item.name" size="mini" placeholder="无" :disabled="addTitle == '菜单信息'" style="width: 100%" v-if="selectStatus" @change="groupingStatusChange" :class="{ hidden: !checkList.includes(item.label) }">
              <el-option v-for="e in menuGroupData" :key="e.pkId" :label="e.groupName" :value="e.pkId"> </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" v-show="addTitle != '菜单信息'">
        <el-button size="mini" class="el-button-primary" type="primary" @click="submitForm('menuForm')">保 存</el-button>
        <el-button size="mini" @click="show1 = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择图标" :visible.sync="menuIconShow" width="800px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="edit-box menuIcon-box">
        <div class="box-left">
          <div @click="clickUpload(1)" v-if="unselectedUrl.length == 0" class="img-box">
            <div class="left-icon">+</div>
            <div class="left-text" v-if="iconType == '1'">未选中</div>
          </div>
          <img v-else :src="unselectedUrl" alt="" class="img-box" style="display: block; border: none" />
          <div @click="clickUpload(2)" v-if="pitchOnUrl.length == 0 && iconType == '1'" class="img-box">
            <div class="left-icon">+</div>
            <div class="left-text">选中</div>
          </div>
          <img v-if="pitchOnUrl.length != 0 && iconType == '1'" :src="pitchOnUrl" alt="" class="img-box" style="display: block; border: none" />
          <el-button size="mini" type="primary" class="el-button-primary" style="margin: 0 auto; margin-top: 20px" @click="addIcon">新增</el-button>
        </div>
        <div class="box-right" v-if="menuIconShow">
          <div style="margin: 0 auto" v-if="iconType == '1'">
            <div class="box-right-item" :class="{ 'item-pitchOn': menuIconId == item.pkId }" v-for="item in menuIconList" :key="item.pkId" @click="rightItemClick(item)">
              <el-avatar shape="square" :size="35" :src="item.iconUrl[0].notSelected"></el-avatar>
              <el-avatar shape="square" :size="35" :src="item.iconUrl[1].selected"></el-avatar>
              <i class="el-icon-close" style="color: red; position: absolute; top: 2px; right: -1px" @click="deleteIcon(item.pkId)"></i>
            </div>
          </div>
          <div style="margin: 0 auto" v-if="iconType == '0'">
            <div class="box-right-item" :class="{ 'item-pitchOn': menuIconId == item.pkId }" v-for="item in menuIconList" :key="item.pkId" @click="rightItemClick(item)">
              <el-avatar shape="square" :size="35" :src="item.iconUrl[0].url"></el-avatar>
              <i class="el-icon-close" style="color: red; position: absolute; top: 2px; right: -1px" @click="deleteIcon(item.pkId)"></i>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" v-show="addTitle != '菜单信息'">
        <el-button size="mini" class="el-button-primary" type="primary" @click="ascertain">确 定</el-button>
        <el-button size="mini" @click="menuIconShow = false">取 消</el-button>
      </div>
    </el-dialog>
    <input v-show="false" type="file" ref="imgFiles" id="upload" accept=".jpeg,.jpg,.png" @change="upLoad" />
    <!-- 菜单分组管理 -->
    <el-dialog title="菜单分组管理" :visible.sync="groupingShow" class="grouping-edit" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div style="width: 100%; height: 1px; background-color: #e8f0f4; margin-top: 18px"></div>
      <div class="dialog-form">
        <div class="unitSearch">
          <span style="margin-right: 6px">分组名称</span>
          <el-input v-model="unitPage.groupName" maxlength="25" placeholder="请输入分组名称" size="mini" style="width: 180px"></el-input>
          <el-button type="primary" class="unitSearchBtn" size="mini" @click="unitSearchBtn">查询</el-button>
          <el-button type="primary" class="addUnit" size="mini" @click="addUnit">新增</el-button>
        </div>
        <el-table :data="groupingData" stripe style="width: 100%" height="500px" :key="orgType" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (unitPage.pageNum - 1) * unitPage.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="groupName" label="分组名称" min-width="80"></el-table-column>
          <el-table-column align="center" label="分组类型" min-width="80" v-if="this.orgType == 2">
            <template slot-scope="{ row }">
              {{ row.groupType == 0 ? "普通分组" : row.groupType == 1 ? "透视分组" : "项目管理分组" }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="sortval" label="排序号" min-width="80"></el-table-column>
          <el-table-column align="center" prop="remark" label="备注" min-width="80"></el-table-column>
          <el-table-column align="center" prop="remark" label="操作" min-width="120">
            <template slot-scope="{ row }">
              <el-button type="success" plain size="mini" style="margin-top: 5px" @click="unitExamine(row)">查看</el-button>
              <el-button type="success" plain size="mini" style="margin-top: 5px" @click="unitEdit(row)">编辑</el-button>
              <el-button type="danger" plain size="mini" style="margin-top: 5px" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="unitPage.pageNum" :page-size="unitPage.pageSize" :total="unitTotal" @handleSizeChange="unitPageSizeChange" @handleCurrentChange="unitPageCurrentChange"></table-paging>
      </div>
      <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
      <div style="height: 8px"></div>
    </el-dialog>
    <!-- 新增 编辑 菜单分组 -->
    <el-dialog :title="groupingTitle" :visible.sync="show4" v-loading="loading" width="400px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="groupingForm" :model="groupingForm" :rules="rules" class="dialog-form" style="margin-top: 20px">
        <el-form-item label="分组名称" prop="groupName" label-width="80px">
          <el-input size="mini" v-model="groupingForm.groupName" autocomplete="off" maxlength="25" :disabled="groupingTitle == '分组信息'"></el-input>
        </el-form-item>
        <el-form-item label="分组类型" prop="groupType" label-width="80px" v-if="orgType == 2">
          <el-select v-model="groupingForm.groupType" size="mini" style="width:100%" :disabled="groupingTitle == '分组信息'">
            <el-option label="普通分组" :value="0"> </el-option>
            <el-option label="透视分组" :value="1"> </el-option>
            <el-option label="项目管理分组" :value="2"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序值" prop="sortval" label-width="80px">
          <el-input size="mini" v-model.trim="groupingForm.sortval" autocomplete="off" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" @keydown.native="keyDown" :disabled="groupingTitle == '分组信息'"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="enName" label-width="80px">
          <el-input size="mini" :disabled="groupingTitle == '分组信息'" v-model="groupingForm.remark" type="textarea" style="resize: none" :rows="7" maxlength="100" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div style="width: 100%; height: 1px; background-color: #e8f0f4"></div>
      <div slot="footer" class="dialog-footer" v-if="groupingTitle != '分组信息'">
        <el-button size="mini" @click="show4 = false">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="unitSubmit('groupingForm')">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import COS from "cos-js-sdk-v5";
import { watch } from "vue";
import template from "../sms/template.vue";
export default {
  components: { template },
  name: "menuList",
  data() {
    return {
      searchOptions: [
        {
          type: "select",
          prop: "menuType",
          value: "",
          clearable: false,
          title: "菜单类型",
          placeholder: "请选择类型",
          options: [
            {
              label: "全部",
              value: ""
            },
            {
              label: "一级菜单",
              value: 0
            },
            {
              label: "二级菜单",
              value: 1
            }
          ]
        },
        {
          type: "input",
          prop: "menuUrl",
          value: "",
          title: "菜单编码",
          placeholder: "菜单编码",
          maxlength: "100"
        },
        {
          type: "input",
          prop: "menuName",
          value: "",
          title: "菜单名称",
          placeholder: "菜单名称",
          maxlength: "25"
        }
      ],
      // 搜索请求参数
      listQuery: {
        menuType: "",
        sourceType: 1
      },
      tableData: [],
      maxHeight: 0,
      show1: false,
      formLabelWidth: "110px",
      ruleForm: {
        // 新增弹窗参数
        menuIcon: null, // 菜单图标
        menuName: null, // 菜单名称
        menuStatus: null, // 菜单状态（0正常 1停用）
        menuType: null, // 菜单类型（0：目录 1：菜单 2：按钮）
        menuUrl: null, // 菜单链接
        parentId: null, // 父级菜单ID（关联表sys_menu）
        sortval: null, // 排序值
        remark: null, // 备注
        btPermissions: null,
        sourceType: null,
        menuSelectedIcon: null
      },
      setProps: {
        value: "pkId",
        label: "menuName",
        children: "children",
        checkStrictly: true
      },
      addTitle: "新增单位工程分类",
      rules: {
        menuName: [
          {
            required: true,
            message: "菜单名称",
            trigger: ["change", "blur"]
          }
        ],
        menuStatus: [
          {
            required: true,
            message: "菜单状态",
            trigger: ["change", "blur"]
          }
        ],
        menuType: [
          {
            required: true,
            message: "菜单类型",
            trigger: ["change", "blur"]
          }
        ],
        menuUrl: [
          {
            required: true,
            message: "菜单链接",
            trigger: ["change", "blur"]
          }
        ],
        parentId: [
          {
            required: true,
            message: "父级菜单",
            trigger: ["change", "blur"]
          }
        ],
        sortval: [
          {
            required: true,
            message: "排序值",
            trigger: ["change", "blur"]
          }
        ],
        btPermissions: [
          {
            required: true,
            validator: this.$rules.btPermissions,
            trigger: ["change", "blur"]
          }
        ],
        groupName: [
          {
            required: true,
            message: "分组名称",
            trigger: ["change", "blur"]
          }
        ],
        groupType: [
          {
            required: true,
            message: "分组类型",
            trigger: ["change", "blur"]
          }
        ]
      },
      loading: false,
      parentMenu: [],
      forbidden: false,
      buttonPermissions: false,
      orgType: "1",
      checkList: [],
      checkboxList: [
        { label: "系统运营商", value: 0 },
        { label: "系统代理商", value: 1 },
        { label: "建设单位(业主方)", value: 2 },
        { label: "监理公司", value: 3 },
        { label: "施工单位", value: 4 },
        { label: "项目部", value: 5 },
        { label: "供应商", value: 6 },
        { label: "分包单位", value: 7 },
        { label: "劳务工人", value: 8 },
        { label: "设计院", value: 9 }
      ],
      menuIconShow: false,
      menuIconList: [],
      imgType: "",
      pitchOnUrl: "", // 选择地址
      unselectedUrl: "", // 未选中地址
      menuIconId: "",
      menuIconRow: {},
      iconType: "1",
      iconStatus: false,
      isExpand: false,
      groupingShow: false,
      groupingData: [],
      unitPage: {
        groupName: "",
        pageSize: 10,
        pageNum: 1
      },
      unitTotal: 0,
      groupingForm: {
        groupName: "",
        remark: "",
        sortval: "",
        groupType: 0
      },
      show4: false,
      groupingTitle: "",
      groupingStatus: false,
      menuGroupData: [],
      menuGroupArr: [],
      selectStatus: true
    };
  },
  mounted() {
    this.getOrgPageList();
    this.allListByThree();
    this.ruleForm.sourceType = this.orgType;
    this.getItemClass();
  },
  methods: {
    getItemClass() {
      this.$api.getItemClass({ dictType: 34 }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.keyVal;
            item.value = item.keyName;
          });
          this.checkboxList = res.data;
          console.log(res.data);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    groupingStatusChange() {
      this.selectStatus = false;
      this.selectStatus = true;
    },
    sysMenuGroupSearch() {
      this.$api.sysMenuGroupSearch({ sourceType: this.orgType }).then(res => {
        if (res.code == 200) {
          this.menuGroupData = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 分组删除
    remove(row) {
      const _this = this;
      _this
        .$confirm("确定删除该分组？", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.sysMenuGroupDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message.success("删除成功");
              this.sysMenuGroupSearchPage();
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    unitEdit(row) {
      this.groupingTitle = "编辑分组";
      this.sysMenuGroupFindById(row.pkId);
    },
    // 分组信息
    unitExamine(row) {
      this.groupingTitle = "分组信息";
      this.sysMenuGroupFindById(row.pkId);
    },
    sysMenuGroupFindById(pkId) {
      this.$api.sysMenuGroupFindById({ pkId }).then(res => {
        if (res.code == 200) {
          this.groupingForm = res.data;
          this.show4 = true;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    unitSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            groupName: this.groupingForm.groupName,
            sortval: this.groupingForm.sortval - 0,
            remark: this.groupingForm.remark,
            sourceType: this.orgType
          };
          if (this.orgType == 2) {
            data.groupType = this.groupingForm.groupType;
          }
          this.loading = true;
          if (this.groupingTitle == "新增分组") {
            this.$api.sysMenuGroupAdd(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.show4 = false;
                this.sysMenuGroupSearchPage();
              } else {
                this.loading = false;
                this.$message.error(res.msg);
              }
            });
          } else {
            data.pkId = this.groupingForm.pkId;
            this.$api.sysMenuGroupUpdate(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                this.show4 = false;
                this.sysMenuGroupSearchPage();
              } else {
                this.loading = false;
                this.$message.error(res.msg);
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    addUnit() {
      this.groupingTitle = "新增分组";

      this.groupingForm.groupName = "";
      this.groupingForm.remark = "";
      this.groupingForm.groupType = 0;
      this.groupingForm.sortval = "";
      this.show4 = true;
      this.$nextTick(() => {
        this.$refs.groupingForm.resetFields();
      });
    },
    unitSearchBtn() {
      this.unitPage.pageNum = 1;
      this.sysMenuGroupSearchPage();
    },
    sysMenuGroupSearchPage() {
      this.loading1 = true;
      this.unitPage.sourceType = this.orgType;
      this.$api.sysMenuGroupSearchPage(this.unitPage).then(res => {
        this.loading1 = false;
        if (res.code == 200) {
          this.groupingData = res.data.records;
          this.unitTotal = res.data.total - 0;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    unitPageSizeChange() {
      this.unitPage.pageSize = pageSize;
      this.sysMenuGroupSearchPage();
    },
    unitPageCurrentChange() {
      this.unitPage.pageNum = currentPage;
      this.sysMenuGroupSearchPage();
    },
    menuGrouping() {
      this.unitPage.pageNum = 1;
      this.unitPage.groupName = "";
      this.unitPage.pageSize = 10;
      this.groupingShow = true;
      this.sysMenuGroupSearchPage();
    },
    // 删除图标
    deleteIcon(id) {
      this.$confirm("确定删除该图标?", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.menuIconDelete({ pkId: id }).then(res => {
            if (res.code == 200) {
              this.$message.success("删除成功");
              this.menuIconId = "";
              this.unselectedUrl = "";
              this.pitchOnUrl = "";
              this.menuIconSearch();
            } else {
              this.$message.warning(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    removeIcon() {
      this.ruleForm.menuIcon = "";
      this.ruleForm.menuSelectedIcon = "";
      this.menuIconId = "";
    },
    rightItemClick(row) {
      this.menuIconId = row.pkId;
    },
    ascertain() {
      if (this.menuIconId.length == 0) {
        return this.$message.warning("请选择图标");
      }
      this.menuIconList.forEach(item => {
        if (item.pkId == this.menuIconId) {
          this.menuIconRow = item;
          if (this.iconType == "1") {
            this.ruleForm.menuIcon = item.iconUrl[0].notSelected;
            this.ruleForm.menuSelectedIcon = item.iconUrl[1].selected;
          } else {
            this.ruleForm.menuIcon = item.iconUrl[0].url;
          }
        }
      });
      this.menuIconShow = false;
      console.log(this.menuIconRow);
    },
    addIcon() {
      if (!this.pitchOnUrl && this.iconType == "1") {
        return this.$message.warning("请上传选中图标");
      }
      if (!this.unselectedUrl) {
        return this.$message.warning(this.iconType == "1" ? "请上传未选中图标" : "请上传图标");
      }
      const data = {
        sourceType: this.orgType,
        iconType: this.iconType
      };
      if (this.iconType == "1") {
        data.menuIconAdds = [
          { iconUrl: this.unselectedUrl, selectedType: 0 },
          { iconUrl: this.pitchOnUrl, selectedType: 1 }
        ];
      } else {
        data.menuIconAdds = [{ iconUrl: this.unselectedUrl }];
      }
      this.$api.menuIconAdd(data).then(res => {
        if (res.code == 200) {
          this.$message.success("新增成功");
          this.unselectedUrl = "";
          this.pitchOnUrl = "";
          this.menuIconSearch();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    menuIconClick() {
      if (this.addTitle == "菜单信息") {
        return;
      }
      this.menuIconShow = true;
      this.unselectedUrl = "";
      this.pitchOnUrl = "";
      this.menuIconSearch();
    },
    menuIconSearch() {
      this.$api.menuIconSearch({ sourceType: this.orgType, iconType: this.iconType }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.iconUrl = JSON.parse(item.iconUrl);
          });
          this.menuIconList = res.data;
        } else {
        }
      });
    },
    // ================================

    clickUpload(val) {
      this.imgType = val;
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
            // _this.newAddList.push(path)
            // _this.imgList.push(path);
            console.log(path);
            if (_this.imgType == 1) {
              _this.unselectedUrl = path;
            } else {
              _this.pitchOnUrl = path;
            }
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
      // console.log(row);
      // this.dialogImageUrl = row;
      // this.ImgDialog = true;
    },
    // ===================================
    checkListChange() {
      // console.log(this.checkList)
      const arr = [];
      this.checkList.forEach(item => {
        this.checkboxList.forEach(e => {
          if (item == e.label) {
            arr.push(e.value);
          }
        });
      });
      console.log("xxxxxxxxxxxxxxxxxxxxxxx");
      console.log(arr);
      console.log(this.checkboxList);
      console.log(this.checkList);
      console.log("xxxxxxxxxxxxxxxxxxxxxxx");
    },
    orgTypeChange(val) {
      this.searchOptions.forEach(item => {
        this.$refs.searchBar.clean(item.prop);
      });
      this.listQuery.menuType = "";
      this.listQuery.menuUrl = "";
      this.listQuery.menuName = "";
      this.$refs.searchBar.menuTypes();
      this.listQuery.menuType = "";
      this.listQuery.sourceType = val.name;
      this.ruleForm.sourceType = val.name;
      this.getOrgPageList();
      this.allListByThree();
    },
    parentIdChange(val) {
      // console.log(val)
      if (val.length == 2) {
        this.buttonPermissions = true;
      } else {
        this.buttonPermissions = false;
      }
    },
    getOrgPageList() {
      this.loading = true;
      this.$api
        .menuIconSearchByTree(this.listQuery)
        .then(res => {
          if (res.code == 200) {
            const statusOptions = {
              0: "正常",
              1: "停用"
            };
            res.data.forEach(item => {
              item.menuStatusName = statusOptions[item.menuStatus];
            });
            this.tableData = res.data;
            // this.totalCount = parseInt(res.data.total);
            this.isExpand = false;
            this.loading = false;
          } else {
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 查询
    search(form) {
      this.listQuery.menuType = form.menuType;
      this.listQuery.menuUrl = form.menuUrl;
      this.listQuery.menuName = form.menuName;
      this.getOrgPageList();
    },
    // 父级菜单下拉
    allListByThree() {
      this.$api.allListByThree({ sourceType: this.orgType }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            if (item.children != null) {
              item.children.forEach(i => {
                if (i.children != null) {
                  i.children = null;
                }
              });
            }
          });
          res.data.unshift({ menuName: "无", pkId: "0" });
          this.parentMenu = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 查看
    examine(row) {
      this.addTitle = "菜单信息";
      console.log(row);
      this.forbidden = true;
      // this.iconStatus = this.orgType ==1?true:false;
      if ((row.menuType == 0 && this.orgType == 1) || (this.orgType == 1 && row.menuType == 2)) {
        this.iconStatus = false;
      } else {
        this.iconStatus = true;
      }
      if (row.menuType == 2) {
        this.buttonPermissions = true;
      } else {
        this.buttonPermissions = false;
      }
      if (row.menuType == 0) {
        this.groupingStatus = true;
      }
      //
      this.show1 = true;
      const data = JSON.stringify(row);
      this.findMenuById(row.pkId);
      this.ruleForm = JSON.parse(data);
      if (this.ruleForm.menuStatus == undefined) {
        this.ruleForm.menuStatus = 0;
      }
      this.ruleForm.btPermissions = row.menuUrl;
    },
    // 新增
    registeredUser() {
      this.menuGroupArr = [...this.checkboxList];
      console.log("aaaaaaaaaaaaaaaaaaaaaaa");
      console.log(this.menuGroupArr);
      this.menuGroupArr.forEach(item => {
        item.name = "";
      });
      this.groupingStatus = true;
      console.log("aaaaaaaaaaaaaaaaaaaaaaa");
      this.sysMenuGroupSearch();

      this.reset();
      this.checkList = [];
      this.show1 = true;
      this.forbidden = false;
      this.addTitle = "新增菜单";
      this.iconStatus = this.orgType == 1;
      this.iconType = this.orgType == 1 ? "1" : "0";
      this.$nextTick(() => {
        this.$refs.menuForm.clearValidate();
      });
      // if(this.orgType =='1' && row.menuType ==2){
      //       this.iconType = 0
      //     }else if(this.orgType =='2'){
      //       this.iconType = 0
      //     }else{
      //       this.iconType = 1
      //     }
    },

    // 新增二级
    newSecondary(row) {
      this.groupingStatus = false;
      // if(){}
      this.iconStatus = this.orgType == 2;
      if (this.orgType == "1" && row.menuType == 2) {
        this.iconType = 0;
      } else if (this.orgType == "2") {
        this.iconType = 0;
      } else {
        this.iconType = 1;
      }
      this.reset();
      this.forbidden = true;
      this.addTitle = "新增菜单";
      this.ruleForm.parentId = row.pkId;
      this.ruleForm.menuType = 1;
      this.buttonPermissions = false;
      this.show1 = true;
      this.$nextTick(() => {
        this.$refs.menuForm.clearValidate();
      });
      this.findMenuById(row.pkId);
    },
    // 新增按钮
    newButton(row) {
      this.groupingStatus = false;
      this.iconType = "0";
      // if(row.menuType ==0 && this.orgType ==1 || this.orgType ==1 &&row.menuType ==2){
      //   this.iconStatus = false
      // }else{
      this.iconStatus = true;
      // }
      this.forbidden = true;
      this.buttonPermissions = true;
      this.show1 = true;
      this.reset();
      this.$nextTick(() => {
        this.$refs.menuForm.clearValidate();
      });
      this.addTitle = "新增按钮";
      this.ruleForm.parentId = row.pkId;
      this.ruleForm.menuType = 2;
      this.findMenuById(row.pkId);
    },
    // 查询详情
    findMenuById(id) {
      this.$api.findMenuById({ pkId: id }).then(res => {
        if (res.code == 200) {
          // console.log(res)
          // this.ruleForm = res.data;
          // this.ruleForm.menuType = res.data.menuType;
          // this.iconType = menuType
          this.ruleForm.menuStatus = res.data.menuStatus == undefined ? 0 : res.data.menuStatus;
          //     if(this.ruleForm.menuStatus ==undefined){
          //   this.ruleForm.menuStatus = 0
          // }
          this.checkList = [];
          if (res.data.parentId == 0) {
            this.menuGroupArr = [...this.checkboxList];
            this.menuGroupArr.forEach(item => {
              item.name = "";
            });

            this.sysMenuGroupSearch();
          }
          res.data.reTypeMenus.forEach(item => {
            this.checkboxList.forEach(e => {
              if (item.orgType == e.value) {
                this.checkList.push(e.label);
              }
            });
            this.menuGroupArr.forEach(e => {
              if (item.orgType == e.value && item.fkGroupId != null && item.fkGroupId != 0) {
                // this.checkList.push(e.label);
                e.name = item.fkGroupId;
              }
              // item.name = "";
            });
          });
          console.log("Xxxxxxxxxxxxxxxxxxxx");
          console.log(this.menuGroupArr);
          console.log("Xxxxxxxxxxxxxxxxxxxx");
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 编辑
    amend(row) {
      console.log(row);
      if (row.parentId == "0") {
        this.groupingStatus = true;
      }
      //
      if ((row.menuType == "0" && this.orgType == "2") || (this.orgType == 1 && row.menuType == 1)) {
        this.iconStatus = false;
      } else {
        this.iconStatus = true;
      }
      if (this.orgType == "1" && row.menuType == 2) {
        this.iconType = 0;
      } else if (this.orgType == "2") {
        this.iconType = 0;
      } else {
        this.iconType = 1;
      }

      this.addTitle = "编辑菜单";
      this.forbidden = true;
      const data = JSON.stringify(row);
      console.log(row);
      const dataform = JSON.parse(data);
      this.ruleForm.menuIcon = dataform.menuIcon; // 菜单图标
      this.ruleForm.menuName = dataform.menuName; // 菜单名称
      this.ruleForm.menuStatus = dataform.menuStatus == undefined ? 0 : dataform.menuStatus; // 菜单状态（0正常 1停用）
      this.ruleForm.menuType = dataform.menuType; // 菜单类型（0：目录 1：菜单 2：按钮）
      this.ruleForm.menuUrl = dataform.menuUrl; // 菜单链接
      this.ruleForm.parentId = dataform.parentId; // 父级菜单ID（关联表sys_menu）
      this.ruleForm.sortval = dataform.sortval; // 排序值
      this.ruleForm.remark = dataform.remark; // 备注
      this.ruleForm.btPermissions = dataform.menuUrl;
      this.ruleForm.menuSelectedIcon = dataform.menuSelectedIcon;
      this.ruleForm.pkId = dataform.pkId;
      if (row.menuType == 2) {
        this.buttonPermissions = true;
      } else {
        this.buttonPermissions = false;
      }
      this.findMenuById(row.pkId);
      this.show1 = true;
    },
    batchDelete(row) {
      this.$confirm("确定删除该系统菜单?", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.sysMenuDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.getOrgPageList();
              this.allListByThree();
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
    // 弹窗确认
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {};
          if (Array.isArray(this.ruleForm.parentId)) {
            if (this.ruleForm.parentId.length == 2) {
              data.menuType = 2;
            } else {
              data.menuType = this.ruleForm.parentId[this.ruleForm.parentId.length - 1] == 0 ? 0 : 1;
            }
            data.parentId = this.ruleForm.parentId[this.ruleForm.parentId.length - 1];
          } else {
            data.parentId = this.ruleForm.parentId;
            data.menuType = this.ruleForm.menuType;
          }
          if (this.buttonPermissions) {
            data.menuUrl = this.ruleForm.btPermissions;
          } else {
            data.menuUrl = this.ruleForm.menuUrl;
          }
          data.menuIcon = this.ruleForm.menuIcon;
          data.menuName = this.ruleForm.menuName;
          data.menuStatus = this.ruleForm.menuStatus;
          if (this.iconType == "1") {
            data.menuSelectedIcon = this.ruleForm.menuSelectedIcon;
          }
          data.sortval = this.ruleForm.sortval;
          data.remark = this.ruleForm.remark;
          data.sourceType = this.orgType;
          this.loading = true;
          // data.orgTypeIds = [];
          data.reTypeMenus = [];
          this.checkList.forEach(item => {
            this.checkboxList.forEach(e => {
              if (item == e.label) {
                // data.orgTypeIds.push(e.value);
                data.reTypeMenus.push({ orgType: e.value });
              }
            });
          });
          if (data.reTypeMenus.length != 0 && this.groupingStatus) {
            data.reTypeMenus.forEach(item => {
              this.menuGroupArr.forEach(e => {
                if (item.orgType == e.value) {
                  item.fkGroupId = e.name;
                }
              });
            });
          }
          // reTypeMenus[reTypeMenus orgType]
          if (this.addTitle != "编辑菜单") {
            this.$api
              .sysMenuAdd(data)
              .then(res => {
                if (res.code == 200) {
                  this.$message({
                    type: "success",
                    message: "新增成功"
                  });
                  this.getOrgPageList();
                  this.allListByThree();
                  this.reset();
                  this.$nextTick(() => {
                    this.$refs[formName].clearValidate();
                    this.show1 = false;
                    this.loading = false;
                  });
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              })
              .catch(err => {
                this.loading = false;
              });
          } else {
            data.pkId = this.ruleForm.pkId;
            this.$api
              .sysMenuUpdate(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "编辑成功"
                  });
                  this.getOrgPageList();
                  this.allListByThree();
                  this.reset();
                  this.$nextTick(() => {
                    this.$refs[formName].clearValidate();
                    this.show1 = false;
                  });
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              })
              .catch(err => {
                this.loading = false;
              });
          }
        } else {
          return false;
        }
      });
    },
    // 排序值禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    reset() {
      this.ruleForm = {
        // 新增弹窗参数
        menuIcon: null, // 菜单图标
        menuName: null, // 菜单名称
        menuStatus: 0, // 菜单状态（0正常 1停用）
        menuType: null, // 菜单类型（0：目录 1：菜单 2：按钮）
        menuUrl: null, // 菜单链接
        parentId: null, // 父级菜单ID（关联表sys_menu）
        sortval: null, // 排序值
        remark: null, // 备注
        btPermissions: null,
        sourceType: this.orgType,
        menuSelectedIcon: null
      };
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
        if (!i.children) {
          return;
        }
        if (!i.children.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.children && i.children.length) {
          this.forArr(i.children, isExpand, ref);
        }
      });
    }
  },
  watch: {
    show1(val) {
      if (!val) {
        this.groupingStatus = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__header {
  // background-color: #d7d7d7 !important;
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.el-row-data {
  display: flex;
  flex-wrap: wrap;
}

.heder {
  position: relative;
}

.search-mr {
  position: absolute;
  right: 34px;
  z-index: 20;
  top: 26px;
}
.grouping {
  right: 150px;
}
.colourGray {
  color: #ccc;
}

.edit-box {
  display: flex;

  .edit-box-left {
    margin-top: 20px;
    width: 350px;
  }

  .edit-box-right {
    padding: 20px;
    width: 250px;
    margin: 20px;
    border: 1px solid #ccc;
    padding-top: 0;
    // height: 450px;
    border-radius: 5px;

    .edit-checkbox {
      display: block;
      margin: 15px;
      margin-left: 0;
    }
  }
  .stair-right {
    margin-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .stair {
    margin-left: 0;
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    .stair-select {
      margin-top: 8px;
      .hidden {
        visibility: hidden;
      }
      .hiddens {
        visibility: hidden;
      }
    }
  }
}

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}

.table-data {
  border-radius: 5px;
  padding: 8px;
  padding-top: 15px;
  background-color: #fff;
}

/deep/ .el-dialog__body {
  padding: 0 !important;
}

.menuIcon-box {
  display: flex;

  .box-left {
    width: 200px;
    border-right: 1px solid #ccc;
    text-align: center;

    .img-box {
      width: 100px;
      line-height: 50px;
      border: 1px solid #e8f0f4;
      text-align: center;
      font-size: 32px;
      color: #7cbd6e;
      margin: 0 auto;
      margin-top: 20px;

      .left-icon {
        margin-top: 20px;
        font-size: 40px;
      }

      .left-text {
        font-size: 13px;
        color: #ccc;
      }
    }
  }

  .box-right {
    margin: 0 auto;
    width: 100%;
    height: 550px;
    overflow: auto;
    background-color: #f2f2f2;

    .box-right-item {
      position: relative;
      display: inline-block;
      padding: 5px 16px;
      background: #fff;
      margin: 7px;
    }

    .item-pitchOn {
      background-color: #b2e0f5;
      // border:1px solid red;
    }
  }
}
.unitSearch {
  position: relative;
  display: flex;
  align-items: center;
  // width: calc(100% - 18px);
  width: 100%;
  height: 60px;
  background-color: #f2f2f2;
  padding: 0 20px;
  margin-bottom: 20px;
  .unitSearchBtn {
    margin-left: 20px;
  }
  .addUnit {
    position: absolute;
    right: 20px;
  }
}

.dialog-form {
  margin: 20px;
}
.grouping-edit {
  /deep/ .el-dialog__header {
    border: none;
  }
}
</style>
