<template>
  <div class="app-container">
    <el-tabs v-model="listQuery.orderBy" @tab-click="orderByChange">
      <el-tab-pane label="按分项工程级别排序" name="grade"></el-tab-pane>
      <el-tab-pane label="按录入时间倒序排序" name="create_time"></el-tab-pane>
    </el-tabs>
    <search-bar class="search-bar-demo" @search="search" :options="searchOptions" :total="totalCount" labelWidth="9em" ref="searchBar" :showHandler="false" @change="change"></search-bar>
    <div class="search-mr">
      <el-button type="primary" class="el-button-primary" size="mini" @click="addUnit" v-has="'system:breakdown:add'">新增单位工程分类</el-button>
      <el-button type="primary" class="el-button-primary" size="mini" v-has="'system:breakdown:branchAdd'" @click="branchAdd">新增分部工程分类</el-button>
      <el-button type="primary" class="el-button-primary" size="mini" v-has="'system:breakdown:itemAdd'" @click="itemAdd">新增分项工程分类</el-button>
    </div>
    <!-- <el-radio-group v-model="listQuery.orderBy" @change="orderByChange" style="position: absolute; right: 8px; top: 8px">
        <el-radio :label="'grade'">按分项工程级别排序</el-radio>
        <el-radio :label="'create_time'">按录入时间倒序排序</el-radio>
      </el-radio-group> -->
    <div class="tab-container">
      <div class="table-data" style="height:82%;margin-top: 10px;">
        <el-table :data="tableData" ref="tables" stripe style="width: 100%" height="92%" v-loading="loading" :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="itemCode" label="编号" min-width="90"></el-table-column>
          <el-table-column align="center" prop="itemName" label="名称" min-width="180"></el-table-column>
          <el-table-column align="center" prop="enginerringTypeName" label="工程大类" min-width="90"></el-table-column>
          <el-table-column align="center" prop="professionalTypeName" label="专业类别" min-width="90"></el-table-column>
          <el-table-column align="center" prop="gradeName" label="工程级别" min-width="90"></el-table-column>
          <el-table-column align="center" prop="sortval" label="排序值" min-width="80"></el-table-column>
          <el-table-column align="center" prop="remark" label="描述" min-width="120" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="alarmLevel" label="操作" fixed="right" min-width="420">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" plain v-has="'system:breakdown:query'" @click.native="examine(scope.row)">查看</el-button>
              <el-button type="success" v-has="'system:breakdown:edit'" plain size="mini" @click.native="edit(scope.row)">编辑</el-button>
              <el-button type="primary" size="mini" plain v-has="'system:breakdown:branchAdd'" v-if="scope.row.grade == 1" @click.native="addBranch(scope.row)">新增分部工程分类</el-button>
              <el-button type="primary" size="mini" plain v-has="'system:breakdown:itemAdd'" v-if="scope.row.grade == 2" @click.native="addSubentry(scope.row)">新增分项工程分类</el-button>
              <el-button type="primary" size="mini" plain v-has="'system:breakdown:detailEdit'" v-if="scope.row.grade == 3 && scope.row.itemType != 3" @click.native="setDetail(scope.row)">设置清单类别</el-button>
              <el-button type="primary" size="mini" plain v-has="'system:breakdown:materialEdit'" v-if="scope.row.grade == 3 && scope.row.itemType != 3" @click.native="setClassify(scope.row)">设置材料分类</el-button>
              <el-button v-has="'system:breakdown:delete'" plain type="danger" size="mini" @click.native="remove(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
      </div>
    </div>
    <el-dialog :title="addTitle" width="480px" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="form" ref="breakdownForm" :rules="rules" class="dialog-form">
        <el-form-item label="工程大类" prop="fkEnginerringTypeId" label-width="110px">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkEnginerringTypeId" :disabled="showType != 1" @change="typeIdChang">
            <el-option v-for="item in projectType" :key="item.value + ''" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业类别" label-width="110px" prop="fkProfessionalTypeId">
          <!-- @change="fkProfessionalChange" -->
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkProfessionalTypeId" :disabled="showType != 1 && !newMajor">
            <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item size="mini" label="单位工程分类" prop="unit" v-if="showType == 2" label-width="110px">
          <el-input v-model="form.unitClassification" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item size="mini" label="分部工程分类" prop="branch" v-if="showType == 3" label-width="110px">
          <el-input v-model="form.project" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item size="mini" label="单位工程名称" prop="name" label-width="110px">
          <el-input v-model="form.name" autocomplete="off" :disabled="showType == 4" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item size="mini" label="单位工程编号" prop="serialNumber" label-width="110px">
          <el-input v-model="form.serialNumber" autocomplete="off" :disabled="showType == 4" maxlength="50" @input="form.serialNumber = $limitNums(form.serialNumber)"></el-input>
        </el-form-item>
        <!-- itemType -->
        <el-form-item label="分项类别" prop="itemType" label-width="110px" v-if="showType == 3">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.itemType">
            <el-option value="0" label="通用类型"></el-option>
            <el-option value="1" label="路基土石填方类型"></el-option>
            <el-option value="2" label="隧道进尺类型"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序值" prop="orderValue" label-width="110px">
          <el-input size="mini" v-model.trim="form.orderValue" autocomplete="off" style="width: 30%" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" :disabled="showType == 4" @keydown.native="keyDown"></el-input>
          <span class="hint">同级从小到大排序</span>
        </el-form-item>
        <el-form-item label="单位工程描述" prop="describe" label-width="110px">
          <el-input size="mini" v-model="form.describe" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="showType == 4" placeholder="" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="showType != 4">
        <el-button size="mini" @click="show1 = false">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="submit('breakdownForm')">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="设置工程清单类别" width="650px" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="form" ref="sdaf" :rules="rules" class="dialog-form">
        <el-form-item label="工程大类" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkEnginerringTypeId" disabled @change="typeIdChang">
            <el-option v-for="item in projectType" :key="item.value + ''" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业类别" :label-width="formLabelWidth" prop="fkProfessionalTypeId">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkProfessionalTypeId" disabled>
            <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分项工程分类" prop="name" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.name" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="关联清单类别" prop="name" :label-width="formLabelWidth">
          <el-input size="mini" class="wh-200" placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
          <!-- <el-button>筛选</el-button> -->
          <el-checkbox v-model="checked">显示勾选内容</el-checkbox>
          <el-tree style="height: 260px; overflow: auto" :data="materialsDate" show-checkbox node-key="pkId" @node-expand="nodeExpand" ref="materialsDateTree1" :filter-node-method="filterNode" :default-checked-keys="defaultKey" :props="defaultProps" @check-change="setCheckedNodes1">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span :class="{ treeColor: !!data.invalidFlag }">{{ node.label }}</span>
            </span>
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="showType != 4">
        <el-button size="mini" @click="show2 = false">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="setMaterial">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="设置工程材料分类" width="650px" :visible.sync="show3" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="form" ref="fdsasdad" :rules="rules" class="dialog-form">
        <el-form-item label="工程大类" prop="fkEnginerringTypeId" :label-width="formLabelWidth">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkEnginerringTypeId" disabled @change="typeIdChang">
            <el-option v-for="item in projectType" :key="item.value + ''" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业类别" :label-width="formLabelWidth" prop="fkProfessionalTypeId">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkProfessionalTypeId" disabled>
            <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="管理工程分类" prop="name" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.name" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="关联材料类别" prop="name" :label-width="formLabelWidth">
          <el-input size="mini" class="wh-200" placeholder="输入关键字进行过滤" v-model="filterTexts"> </el-input>
          <el-select size="mini" v-model="typeCode" filterable placeholder="请选择" style="width: 150px" @change="typeCodeChange">
            <el-option label="全部" value=""> </el-option>
            <el-option v-for="item in propertyData" :key="item.pkId" :label="item.keyVal" :value="item.keyName"> </el-option>
          </el-select>
          <!-- <el-button>筛选</el-button> -->
          <el-checkbox v-model="checked2">显示勾选内容</el-checkbox>
          <el-tree style="height: 260px; overflow: auto" :data="materialData" show-checkbox node-key="pkId" @node-expand="nodeExpand" ref="materialsDateTree" :check-strictly="false" :default-checked-keys="defaultKey" :filter-node-method="filterNodes" :props="materialProps" @check-change="setCheckedNodes"></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="showType != 4">
        <el-button size="mini" @click="show3 = false">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="materialSubmit">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="addTitle" width="580px" :visible.sync="show4" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="form" ref="breakdownFormfour" :rules="rules" class="dialog-form">
        <el-form-item label="工程大类" prop="fkEnginerringTypeId" label-width="100px">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkEnginerringTypeId" @change="typeIdChang" :disabled="!newMajor">
            <el-option v-for="item in projectType" :key="item.value + ''" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业类别" label-width="100px" prop="fkProfessionalTypeId">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkProfessionalTypeId" :disabled="!newMajor" @change="professionalLevelChange">
            <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单位工程" prop="unitClassification" label-width="100px">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.unitClassification" :disabled="!newMajor" @change="unitChange">
            <el-option v-for="item in specialist" :key="item.pkId" :label="item.itemName" :value="item.pkId"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分部工程分类" prop="branch" v-if="showType == 3" label-width="100px">
          <el-input size="mini" v-model="form.project" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="分部名称" prop="name" label-width="100px">
          <el-input size="mini" v-model="form.name" autocomplete="off" maxlength="100" :disabled="showType == 4"></el-input>
        </el-form-item>
        <el-form-item label="父级编号" prop="unit" label-width="100px">
          <el-input size="mini" v-model="form.parentCode" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="分部编号" prop="serialNumber" label-width="100px">
          <el-input size="mini" v-model="form.serialNumber" autocomplete="off" maxlength="50" @input="form.serialNumber = $limitNums(form.serialNumber)" :disabled="showType == 4"></el-input>
        </el-form-item>
        <el-form-item label="排序值" prop="orderValue" label-width="100px">
          <el-input size="mini" v-model.trim="form.orderValue" autocomplete="off" style="width: 30%" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" :disabled="showType == 4" @keydown.native="keyDown"></el-input>
          <span class="hint">同级从小到大排序</span>
        </el-form-item>
        <el-form-item label="分部描述" prop="describe" label-width="100px">
          <el-input size="mini" v-model="form.describe" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="showType == 4" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="showType != 4">
        <el-button size="mini" @click="show4 = false">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="submitFour('breakdownFormfour')">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="addTitle" width="580px" :visible.sync="show5" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="form" ref="breakdownFormFive" :rules="rules" class="dialog-form">
        <el-form-item label="工程大类" prop="fkEnginerringTypeId" label-width="110px">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkEnginerringTypeId" :disabled="!newMajor" @change="typeIdChang">
            <el-option v-for="item in projectType" :key="item.value + ''" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="专业类别" label-width="110px" prop="fkProfessionalTypeId">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.fkProfessionalTypeId" @change="professionalLevelChanges" :disabled="!newMajor">
            <el-option v-for="item in expertSortData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分部工程" prop="project" label-width="110px">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.project" :disabled="!newMajor" @change="unitChange">
            <el-option v-for="item in specialist" :key="item.pkId" :label="item.itemName" :value="item.pkId"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分项名称" prop="name" label-width="110px">
          <el-input size="mini" v-model="form.name" autocomplete="off" maxlength="100" :disabled="showType == 4"></el-input>
        </el-form-item>
        <el-form-item label="父级编号" prop="unit" label-width="110px">
          <el-input size="mini" v-model="form.parentCode" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="分项工程编号" prop="serialNumber" label-width="110px">
          <el-input size="mini" v-model="form.serialNumber" autocomplete="off" maxlength="50" @input="form.serialNumber = $limitNums(form.serialNumber)" :disabled="showType == 4"></el-input>
        </el-form-item>
        <el-form-item label="分项类别" prop="itemType" label-width="110px">
          <el-select size="mini" style="width: 100%" placeholder="请选择" v-model="form.itemType" :disabled="showType == 4">
            <el-option value="0" label="通用类型"></el-option>
            <el-option value="1" label="路基土石填方类型"></el-option>
            <el-option value="2" label="隧道进尺类型"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序值" prop="orderValue" label-width="110px">
          <el-input size="mini" v-model.trim="form.orderValue" autocomplete="off" style="width: 30%" type="number" oninput="if(value.length > 6) value=value.slice(0, 6)" :disabled="showType == 4" @keydown.native="keyDown"></el-input>
          <span class="hint">同级从小到大排序</span>
        </el-form-item>
        <el-form-item label="分项描述" prop="describe" label-width="110px">
          <el-input size="mini" v-model="form.describe" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="showType == 4" placeholder="" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="showType != 4">
        <el-button size="mini" @click="show5 = false">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="submitFiv('breakdownFormFive')">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "breakdown",
  data() {
    return {
      searchOptions: [
        {
          type: "select",
          prop: "fkEnginerringTypeId",
          value: "",
          title: "工程大类",
          options: []
        },
        {
          type: "select",
          prop: "fkProfessionalTypeId",
          value: "",
          title: "专业类别",
          placeholder: "专业类别",
          options: []
        },
        {
          type: "select",
          prop: "grade",
          value: "",
          title: "工程级别",
          placeholder: "工程级别",
          options: [
            {
              value: "1",
              label: "单位工程"
            },
            {
              value: "2",
              label: "分部工程"
            },
            {
              value: "3",
              label: "分项工程"
            }
          ]
        },
        {
          type: "input",
          prop: "itemName",
          value: "",
          title: "名    称",
          placeholder: "名称",
          maxlength: "100"
        }
      ],
      totalCount: 6,
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        orderBy: "grade"
        // itemName: null
      },
      tableData: [],
      maxHeight: 0,
      show1: false,
      formLabelWidth: "120px",
      form: {
        name: "",
        serialNumber: "",
        orderValue: "",
        describe: "",
        unit: "",
        branch: "",
        unitClassification: "",
        project: "",
        pkid: "",
        fkEnginerringTypeId: "",
        enginerringTypeName: "",
        itemType: "",
        fkProfessionalTypeId: "", // 专业类别id
        parentCode: "",
        parentName: ""
      },
      addTitle: "新增单位工程",
      rules: {
        name: [
          {
            required: true,
            message: "分类名称",
            trigger: ["change", "blur"]
          }
        ],
        fkEnginerringTypeId: [
          {
            required: true,
            message: "工程类型不能为空",
            trigger: ["change", "blur"]
          }
        ],
        fkProfessionalTypeId: [
          {
            required: true,
            message: "专业类别不能为空",
            trigger: ["change", "blur"]
          }
        ],
        serialNumber: [
          {
            required: true,
            message: "分类编号",
            trigger: ["change", "blur"]
          }
        ],

        orderValue: [
          {
            required: true,
            message: "排序值",
            trigger: ["blur"]
          }
        ],
        unitClassification: [
          {
            required: true,
            message: "单位工程",
            trigger: ["change"]
          }
        ],
        project: [
          {
            required: true,
            message: "分部工程",
            trigger: ["change"]
          }
        ]
      },
      showType: null,
      show2: false,
      data: [
        {
          id: 1,
          label: "一号大桥",
          children: [
            {
              id: 4,
              label: "下部结构",
              children: [
                {
                  id: 9,
                  label: "打桩"
                },
                {
                  id: 10,
                  label: "挖孔"
                }
              ]
            }
          ]
        },
        {
          id: 2,
          label: "二号大桥",
          children: [
            {
              id: 5,
              label: "悬臂施工"
            },
            {
              id: 6,
              label: "钢架安装"
            }
          ]
        },
        {
          id: 3,
          label: "三号大桥",
          children: [
            {
              id: 7,
              label: "人行辅导铺设"
            },
            {
              id: 8,
              label: "栏杆安装"
            }
          ]
        }
      ],
      materialsDate: [],
      defaultProps: {
        children: "childList",
        label: "className",
        disabled: this.treeDisabled
      },
      defaultKey: [],
      rowDate: null,
      projectType: [], // 工程类型
      show3: false,
      materialData: [], // 材料分类数据
      materialProps: {
        children: "childList",
        label: "typeName"
      },
      loading: false,
      show4: false,
      show5: false,
      expertSortData: [],
      newMajor: false, //  编辑控制不让改
      filterText: "",
      filterTexts: "",
      specialist: [],
      checked: false,
      checked2: false,
      propertyData: [],
      typeCode: ""
    };
  },
  watch: {
    filterText(val) {
      this.$refs.materialsDateTree1.filter(val);
    },
    checked(val) {
      this.$refs.materialsDateTree1.filter(val);
    },
    checked2(val) {
      this.$refs.materialsDateTree.filter(val);
    },
    filterTexts(val) {
      this.$refs.materialsDateTree.filter(val);
    }
  },

  mounted() {
    this.termQueryEPC(this.listQuery);
    this.searchTypeList();
    this.getMaterialType();
  },
  methods: {
    typeCodeChange() {
      this.filterTexts = "";
      this.checked2 = false;
      this.conditionMaterialclassify(this.rowDate.fkProfessionalTypeId);
    },
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
    nodeExpand(data, node) {
      if (node.level == 1) {
        this.expandNodes(node);
      }
    },
    expandNodes(node) {
      node.expanded = true;
      for (let i = 0; i < node.childNodes.length; i++) {
        node.childNodes[i].expanded = true;
        if (node.childNodes[i].childNodes.length > 0) {
          this.expandNodes(node.childNodes[i]);
        }
      }
    },
    baseItemListAmount(typeId, parentId) {
      const data = {
        fessionalTypeId: typeId
      };
      if (parentId) {
        data.parentId = parentId;
      }
      this.$api.baseItemListAmount(data).then(res => {
        if (res.code == 200) {
          this.form.orderValue = res.data + 1;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    branchAdd() {
      this.show4 = true;
      this.addTitle = "新增分部工程";
      this.showType = 2;
      this.reset();
      this.newMajor = true;
      if (this.$refs.breakdownFormfour != undefined) {
        this.$refs.breakdownFormfour.resetFields();
      }
    },
    itemAdd() {
      this.addTitle = "新增分项工程";
      this.showType = 3;
      this.reset();
      if (this.$refs.breakdownFormFive != undefined) {
        this.$refs.breakdownFormFive.resetFields();
      }
      this.newMajor = true;
      this.show5 = true;
    },
    professionalLevelChange(val) {
      this.form.unitClassification = "";
      this.form.parentCode = "";
      this.baseItemListFirstAll(val, 1);
    },
    professionalLevelChanges(val) {
      this.form.project = "";
      this.form.parentCode = "";
      this.baseItemListFirstAll(val, 2);
    },
    unitChange(val) {
      this.rowDate = {};
      this.rowDate.pkId = val;
      this.specialist.forEach(item => {
        if (item.pkId == val) {
          this.form.parentCode = item.itemCode;
          if (this.addTitle == "新增分项工程" || this.addTitle == "新增分部工程") {
            this.baseItemListAmount(this.form.fkProfessionalTypeId, item.pkId);
          }
        }
      });
    },
    fkProfessionalChange(val) {
      // if(this.addTitle == "新增单位工程"  ){
      this.baseItemListAmount(val);
      // }
      // this.baseItemListFirstAll(val)
    },
    // 根据专业类别查询所有工程分类
    baseItemListFirstAll(id, grade) {
      const data = {
        fessionalTypeId: id
      };
      if (grade) {
        data.grade = grade;
      }
      this.$api.baseItemListFirstAll(data).then(res => {
        if (res.code == 200) {
          this.specialist = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    filterNode(value, data, node) {
      if (typeof value === "boolean") {
        if (!value) return true;
        return node.checked || node.indeterminate;
      } else {
        if (!value) return true;
        return data.className.indexOf(value) !== -1;
      }
    },
    filterNodes(value, data, node) {
      if (typeof value === "boolean") {
        if (!value) return true;
        return node.checked || node.indeterminate;
      } else {
        if (!value) return true;
        return data.typeName.indexOf(value) !== -1;
      }
    },
    // 获取专业类别
    // searchMajorTypeList(id, typeId) {
    //   this.$api.searchMajorTypeList({ typeId: id }).then((res) => {
    //     if (res.code == 200) {
    //       let typeIdStatus = false;
    //       res.data.forEach((item) => {
    //         item.label = item.engTypeName;
    //         item.value = item.pkId;
    //         if (item.pkId == typeId) {
    //           typeIdStatus = true;
    //         }
    //       });
    //       this.searchOptions[2].options = res.data;
    //       if (typeIdStatus == false) {
    //         this.$refs.searchBar.fkProfessionalTypeId();
    //       }
    //     }
    //   });
    // },
    // 工程选择
    typeIdChang(val) {
      this.form.parentCode = "";
      this.form.project = "";
      this.form.unitClassification = "";
      if (this.form.workflowType == 1) {
        this.workflowTypeChange(this.form.fkEnginerringTypeId);
      }

      this.typeIdChangTypeList(val);
    },
    change(val, val1) {
      if (val.fkEnginerringTypeId != "") {
        let typeIdStatus = false;
        this.projectType.forEach(item => {
          if (val.fkEnginerringTypeId == item.pkId) {
            item.typeSonList.forEach(i => {
              i.label = i.engTypeName;
              i.value = i.pkId;
              if (i.pkId == val.fkProfessionalTypeId) {
                typeIdStatus = true;
              }
            });
            this.searchOptions[1].options = item.typeSonList;
          }
        });
        if (typeIdStatus == false) {
          this.$refs.searchBar.fkProfessionalTypeId();
        }
      } else {
        this.searchOptions[1].options = [];
        this.$refs.searchBar.fkProfessionalTypeId();
      }
    },
    typeIdChangTypeList(id) {
      this.form.fkProfessionalTypeId = "";
      this.$api.searchMajorTypeList({ typeId: id }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
          });
          this.expertSortData = res.data;
        }
      });
    },
    organizerUnit(a) {
      if (this.$refs.organizerUnit) {
        this.$refs.organizerUnit.dropDownVisible = false;
      }
    },
    // 获取工程类型数据
    searchTypeList() {
      this.$api.searchTypeList().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.engTypeName;
            item.value = item.pkId;
          });
          this.projectType = res.data;
          this.searchOptions[0].options = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 设置工程材料分类
    setCheckedNodes(val) {
      // return console.log(val)
      this.defaultKey = this.$refs.materialsDateTree.getCheckedKeys();
    },
    // 设置清单
    setCheckedNodes1() {
      this.defaultKey = this.$refs.materialsDateTree1.getCheckedKeys(true);
    },
    setMaterial() {
      const data = {
        fkItemId: this.rowDate.pkId,
        detailClassIds: this.defaultKey
      };
      const _this = this;
      this.loading = true;
      this.$api.detailDategory(data).then(res => {
        if (res.code == 200) {
          this.loading = false;
          _this.show2 = false;
          this.$message({
            type: "success",
            message: "配置清单类别成功"
          });
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 物料分项提交
    materialSubmit() {
      const data = {
        fkItemId: this.rowDate.pkId,
        materialIds: this.defaultKey
      };
      this.loading = true;
      this.$api.itemClass(data).then(res => {
        if (res.code == 200) {
          this.loading = false;
          this.show3 = false;
          this.$message({
            type: "success",
            message: "设置材料分类成功"
          });
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    orderByChange() {
      this.$refs.searchBar.reset();
      this.$refs.searchBar.onSubmit();
      // this.termQueryEPC(this.listQuery);
    },
    // 查询
    search(form) {
      this.listQuery.itemName = form.itemName;
      this.listQuery.fkEnginerringTypeId = form.fkEnginerringTypeId;
      this.listQuery.fkProfessionalTypeId = form.fkProfessionalTypeId;
      this.listQuery.grade = form.grade;
      this.listQuery.pageNum = 1;
      this.termQueryEPC(this.listQuery);
    },
    // 查询
    termQueryEPC(data) {
      const self = this;
      self.loading = true;
      // (async data => {
      //   let res = await self.$api.termQueryEPC(data);

      //   if (res && res.code == 200) {
      //     this.tableData = res.data.records;
      //     this.totalCount = parseInt(res.data.total);
      //     self.loading = false;
      //   } else {
      //     self.loading = false;
      //     self.$message({
      //       type: "error",
      //       message: res.msg
      //     });
      //   }
      // })(data);
      self.$api
        .termQueryEPC(data)
        .then(res => {
          if (res.code == 200) {
            this.tableData = res.data.records;
            this.totalCount = parseInt(res.data.total);
            self.loading = false;
          } else {
            self.loading = false;
            self.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      // this.listQuery.pageNum = 1;
      this.termQueryEPC(this.listQuery);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.termQueryEPC(this.listQuery);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 查看
    examine(row) {
      if (this.$refs.breakdownForm != undefined) {
        this.$refs.breakdownForm.resetFields();
      }
      switch (row.grade) {
        case 1:
          this.addTitle = "单位工程信息";
          this.show1 = true;
          break;
        case 2:
          this.addTitle = "单分部工程信息";
          this.form.unitClassification = row.parentName;
          this.show4 = true;
          break;
        case 3:
          this.show5 = true;
          this.form.project = row.parentName;
          this.addTitle = "分项工程信息";
          this.form.itemType = row.itemType + "";
          break;
      }
      let rowDate = JSON.stringify(row);
      rowDate = JSON.parse(rowDate);
      this.showType = 4;
      this.newMajor = false;
      this.form.fkEnginerringTypeId = rowDate.fkEnginerringTypeId;
      this.form.name = rowDate.itemName;
      this.form.parentCode = rowDate.parentCode;
      this.form.serialNumber = rowDate.itemCode;
      this.form.orderValue = rowDate.sortval;
      this.form.describe = rowDate.remark;
      this.form.fkProfessionalTypeId = rowDate.professionalTypeName;
    },
    // 编辑
    edit(row) {
      if (this.$refs.breakdownForm != undefined) {
        this.$refs.breakdownForm.resetFields();
      }
      switch (row.grade) {
        case 1:
          this.addTitle = "编辑单位工程";
          this.show1 = true;
          break;
        case 2:
          this.addTitle = "编辑单位分部工程";
          this.form.unitClassification = row.parentName;
          this.show4 = true;
          if (this.$refs.breakdownFormfour != undefined) {
            this.$refs.breakdownFormfour.resetFields();
          }
          break;
        case 3:
          if (this.$refs.breakdownFormFive != undefined) {
            this.$refs.breakdownFormFive.resetFields();
          }
          this.show5 = true;
          this.form.project = row.parentName;
          this.addTitle = "编辑分项工程";
          this.form.itemType = row.itemType + "";
          break;
      }

      this.showType = 5;
      this.form.name = row.itemName;
      this.form.serialNumber = row.itemCode;
      this.form.orderValue = row.sortval;
      this.form.describe = row.remark;
      this.form.pkid = row.pkId;
      this.rowDate = row;
      this.form.fkEnginerringTypeId = row.fkEnginerringTypeId;
      this.form.parentCode = row.parentCode;
      this.typeIdChangTypeList(row.fkEnginerringTypeId);
      if (row.fkProfessionalTypeId == 0) {
        this.newMajor = true;
        this.form.fkProfessionalTypeId = "";
      } else {
        this.newMajor = false;
        this.form.fkProfessionalTypeId = row.fkProfessionalTypeId;
      }
    },
    // 设置清单类别
    setDetail(row) {
      this.filterText = "";
      if (row.professionalTypeName == null || row.professionalTypeName == "") {
        this.$message.warning("请先在编辑里设置专业类别");
        return;
      }
      this.checked = false;
      this.allCategory(row.fkProfessionalTypeId);
      this.form.fkEnginerringTypeId = row.fkEnginerringTypeId;
      this.form.fkProfessionalTypeId = row.professionalTypeName;

      this.form.name = row.itemName;
      this.show2 = true;
      this.rowDate = row;
      this.$nextTick(() => {
        this.$refs.materialsDateTree1.$el.scrollTo(0, 0);
      });
      if (this.$refs.materialsDateTree1 != undefined) {
        this.$refs.materialsDateTree1.setCheckedKeys([]);
      }
      this.$api.queryEPC({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.defaultKey = res.data.detailClassIds;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },

    // 设置材料分类
    setClassify(row) {
      this.filterTexts = "";
      if (row.professionalTypeName == null || row.professionalTypeName == "") {
        this.$message.warning("请先在编辑里设置专业类别");
        return;
      }
      this.checked2 = false;
      this.typeCode = "";
      this.conditionMaterialclassify(row.fkProfessionalTypeId);
      this.form.fkEnginerringTypeId = row.fkEnginerringTypeId;
      this.form.fkProfessionalTypeId = row.professionalTypeName;
      this.defaultKey = [];
      this.form.name = row.itemName;

      this.show3 = true;
      this.$nextTick(() => {
        this.$refs.materialsDateTree.$el.scrollTo(0, 0);
      });
      this.rowDate = row;
      if (this.$refs.materialsDateTree != undefined) {
        this.$refs.materialsDateTree.setCheckedKeys([]);
      }

      this.$api.queryEPC({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.defaultKey = res.data.materialTypeIds;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 删除
    remove(row) {
      const _this = this;
      _this
        .$confirm("确定删除该项目？", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.deleteEPC({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.termQueryEPC(this.listQuery);
            } else {
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 新增
    addUnit() {
      this.reset();
      this.show1 = true;
      this.showType = 1;
      this.addTitle = "新增单位工程";
      if (this.$refs.breakdownForm != undefined) {
        this.$refs.breakdownForm.resetFields();
      }
    },
    // 新增分部
    addBranch(row) {
      this.reset();
      this.typeIdChangTypeList(row.fkEnginerringTypeId);

      if (row.fkProfessionalTypeId == 0) {
        this.newMajor = true;
        this.form.fkProfessionalTypeId = "";
      } else {
        this.newMajor = false;
        this.form.fkProfessionalTypeId = row.fkProfessionalTypeId;
      }
      if (this.$refs.breakdownFormfour != undefined) {
        this.$refs.breakdownFormfour.resetFields();
      }
      this.show4 = true;
      this.showType = 2;
      this.addTitle = "新增分部工程";
      this.rowDate = JSON.stringify(row);
      this.rowDate = JSON.parse(this.rowDate);
      this.form.fkEnginerringTypeId = this.rowDate.fkEnginerringTypeId;
      this.form.unitClassification = this.rowDate.itemName;
      this.form.parentCode = this.rowDate.itemCode;
      this.form.parentName = this.rowDate.itemName;
      this.baseItemListAmount(this.form.fkProfessionalTypeId, row.pkId);
    },
    submitFour(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          const data = {
            // fkWorkflowTemplateId: 1,
            grade: this.showType,
            // itemCode
            itemCode: this.form.serialNumber,
            itemName: this.form.name,
            parentId: 0,
            remark: this.form.describe,
            sortval: this.form.orderValue,
            fkEnginerringTypeId: this.form.fkEnginerringTypeId,
            fkProfessionalTypeId: this.form.fkProfessionalTypeId
          };
          // 新增分部工程form.unitClassification
          if (this.addTitle == "新增分部工程") {
            data.parentId = this.form.unitClassification;
          }
          this.projectType.forEach(item => {
            if (item.value == data.fkEnginerringTypeId) {
              // label
              data.enginerringTypeName = item.label;
            }
          });
          if (this.showType != 1) {
            data.parentId = this.rowDate.pkId;
          }
          if (this.showType == 3) {
            data.itemType = this.form.itemType;
          }
          if (this.showType != 5) {
            this.$api.addSystemEPC(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                // this.show1 = false;
                // if(this.addTitle =="新增分部工程"){
                this.show4 = false;
                // }
                // if(this.addTitle =="新增单位工程分类"){
                this.show1 = false;
                // }
                //  if(this.addTitle =="新增分项工程"){
                this.show5 = false;
                // }
                this.reset();
                this.termQueryEPC(this.listQuery);
                this.$message({
                  type: "success",
                  message: "新增成功！"
                });

                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message({
                  type: "error",
                  message: res.msg
                });
              }
            });
          } else if (this.showType == 5) {
            data.pkId = this.form.pkid;
            data.grade = this.rowDate.grade;
            if (this.addTitle == "编辑分项工程") {
              data.itemType = this.form.itemType;
            }
            (data.parentId = this.rowDate.parentId),
              this.$api.modifyEPC(data).then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.show1 = false;
                  //  if(this.addTitle =="新增分部工程"){
                  this.show4 = false;
                  // }
                  // if(this.addTitle =="新增单位工程分类"){
                  // this.show1 = false
                  // }
                  //  if(this.addTitle =="新增分项工程"){
                  this.show5 = false;
                  // }
                  this.reset();
                  this.termQueryEPC(this.listQuery);
                  this.$message({
                    type: "success",
                    message: "编辑成功！"
                  });
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              });
          }
        } else {
          return false;
        }
      });
    },
    // breakdownFormfour
    // 新增分项
    addSubentry(row) {
      this.reset();
      if (this.$refs.breakdownFormFive != undefined) {
        this.$refs.breakdownFormFive.resetFields();
      }
      this.newMajor = false;
      this.typeIdChangTypeList(row.fkEnginerringTypeId);
      this.show5 = true;
      this.showType = 3;
      this.addTitle = "新增分项工程";
      this.rowDate = row;
      this.form.project = row.itemName;
      this.form.fkEnginerringTypeId = row.fkEnginerringTypeId;
      this.form.fkProfessionalTypeId = row.fkProfessionalTypeId;
      this.form.parentCode = row.itemCode;
      this.form.parentName = row.itemName;
      this.baseItemListAmount(this.form.fkProfessionalTypeId, row.pkId);
    },

    submitFiv(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          const data = {
            // fkWorkflowTemplateId: 1,
            grade: this.showType,
            // itemCode
            itemCode: this.form.serialNumber,
            itemName: this.form.name,
            parentId: 0,
            remark: this.form.describe,
            sortval: this.form.orderValue,
            fkEnginerringTypeId: this.form.fkEnginerringTypeId,
            fkProfessionalTypeId: this.form.fkProfessionalTypeId
          };
          this.projectType.forEach(item => {
            if (item.value == data.fkEnginerringTypeId) {
              // label
              data.enginerringTypeName = item.label;
            }
          });

          if (this.form.project.length != 0) {
            data.parentId = this.form.project;
          }
          if (this.showType != 1) {
            data.parentId = this.rowDate.pkId;
          }
          if (this.show5) {
            data.itemType = this.form.itemType;
          }
          // itemType
          if (this.showType != 5) {
            this.$api.addSystemEPC(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                // this.show1 = false;
                // if(this.addTitle =="新增分部工程"){
                this.show4 = false;
                // }
                // if(this.addTitle =="新增单位工程分类"){
                this.show1 = false;
                // }
                //  if(this.addTitle =="新增分项工程"){
                this.show5 = false;
                // }
                this.reset();
                this.termQueryEPC(this.listQuery);
                this.$message({
                  type: "success",
                  message: "新增成功！"
                });

                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message({
                  type: "error",
                  message: res.msg
                });
              }
            });
          } else if (this.showType == 5) {
            data.pkId = this.form.pkid;
            data.grade = this.rowDate.grade;
            if (this.addTitle == "编辑分项工程") {
              data.itemType = this.form.itemType;
            }
            (data.parentId = this.rowDate.parentId),
              this.$api.modifyEPC(data).then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.show1 = false;
                  //  if(this.addTitle =="新增分部工程"){
                  this.show4 = false;
                  // }
                  // if(this.addTitle =="新增单位工程分类"){
                  // this.show1 = false
                  // }
                  //  if(this.addTitle =="新增分项工程"){
                  this.show5 = false;
                  // }
                  this.reset();
                  this.termQueryEPC(this.listQuery);
                  this.$message({
                    type: "success",
                    message: "编辑成功！"
                  });
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              });
          }
        } else {
          return false;
        }
      });
    },
    // breakdownFormFive
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          const data = {
            // fkWorkflowTemplateId: 1,
            grade: this.showType,
            // itemCode
            itemCode: this.form.serialNumber,
            itemName: this.form.name,
            parentId: 0,
            remark: this.form.describe,
            sortval: this.form.orderValue,
            fkEnginerringTypeId: this.form.fkEnginerringTypeId,
            fkProfessionalTypeId: this.form.fkProfessionalTypeId
          };
          this.projectType.forEach(item => {
            if (item.value == data.fkEnginerringTypeId) {
              // label
              data.enginerringTypeName = item.label;
            }
          });
          if (this.showType != 1) {
            data.parentId = this.rowDate.pkId;
          }
          if (this.showType == 3) {
            data.itemType = this.form.itemType;
          }
          if (this.showType != 5) {
            this.$api.addSystemEPC(data).then(res => {
              if (res.code == 200) {
                this.loading = false;
                // this.show1 = false;
                // if(this.addTitle =="新增分部工程"){
                this.show4 = false;
                // }
                // if(this.addTitle =="新增单位工程分类"){
                this.show1 = false;
                // }
                //  if(this.addTitle =="新增分项工程"){
                this.show5 = false;
                // }
                this.reset();
                this.termQueryEPC(this.listQuery);
                this.$message({
                  type: "success",
                  message: "新增成功！"
                });

                this.$refs[formName].resetFields();
              } else {
                this.loading = false;
                this.$message({
                  type: "error",
                  message: res.msg
                });
              }
            });
          } else if (this.showType == 5) {
            data.pkId = this.form.pkid;
            data.grade = this.rowDate.grade;
            if (this.addTitle == "编辑分项工程") {
              data.itemType = this.form.itemType;
            }
            (data.parentId = this.rowDate.parentId),
              this.$api.modifyEPC(data).then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.show1 = false;
                  //  if(this.addTitle =="新增分部工程"){
                  this.show4 = false;
                  // }
                  // if(this.addTitle =="新增单位工程分类"){
                  // this.show1 = false
                  // }
                  //  if(this.addTitle =="新增分项工程"){
                  this.show5 = false;
                  // }
                  this.reset();
                  this.termQueryEPC(this.listQuery);
                  this.$message({
                    type: "success",
                    message: "编辑成功！"
                  });
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              });
          }
        } else {
          return false;
        }
      });
    },
    // 材料分类
    async conditionMaterialclassify(id) {
      await this.$api.conditionMaterialclassify({ professionalTypeId: id, typeCode: this.typeCode }).then(res => {
        if (res.code == 200) {
          this.materialData = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    // 清单分类
    async allCategory(id) {
      await this.$api.listAllByProfessionalTypeId({ professionalTypeId: id }).then(res => {
        if (res.code == 200) {
          this.materialsDate = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    reset() {
      this.form = {
        name: "",
        serialNumber: "",
        orderValue: "",
        describe: "",
        unit: "",
        branch: "",
        unitClassification: "",
        project: "",
        pkid: "",
        fkEnginerringTypeId: null,
        enginerringTypeName: "",
        itemType: "",
        fkProfessionalTypeId: "",
        parentCode: "",
        parentName: ""
      };
    },
    // 树形禁用
    treeDisabled(data, node) {
      if (data.invalidFlag == 1) {
        return true;
      }
      return false;
    },
    // 排序值禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
// /deep/ .el-dialog__header {
//   background-color: #d7d7d7 !important;
// }
.el-cascader-panel .el-scrollbar__wrap {
  background-color: #fff !important;
}

// 排序提示
.hint {
  color: #d7d7d7;
}

.tab-container {
  height: 100%;

  .el-table {
    // height: 600px;
    // overflow: auto;
  }
}

.treeColor {
  color: #d7d7d7;
}

.search-mr {
  position: absolute;
  top: 140px;
  right: 40px;
  z-index: 2;
}

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
</style>
