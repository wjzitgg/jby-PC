<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bar-box" style="position: relative;">
      <el-input prefix-icon="el-icon-search" v-model="deptName" maxlength="25" placeholder="请输入部门名称" size="mini" class="wh-200"></el-input>
      <el-button type="primary" size="mini" icon="el-icon-search" class="ml-20 el-button-primary" @click="searchData">查询</el-button>
      <el-button style="position: absolute;right: 20px;top:27px" type="primary" class="el-button-primary" size="mini" @click="addDepartment" v-has="'org:dept:add'">新增部门</el-button>
    </div>
    <!-- 新增部门 -->
    <!-- <div class="search-mr">

    </div> -->
    <div class="tab-container">
      <div class="table-data" style="height:  82%;">
        <el-table :tooltip-effect="'light'" :data="tableData" ref="tables" stripe height="98%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column prop="id" label="序号" width="60" align="center" type="index">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="deptName" label="部门名称" min-width="260" align="center"> </el-table-column>
          <el-table-column prop="deptNum" label="部门人数" min-width="180" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="sortval" label="排序值" min-width="80" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="remark" min-width="400" label="部门描述" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" min-width="260" align="center">
            <template slot-scope="{ row }">
              <el-button plain size="mini" type="primary" @click="lookOver(row)" v-has="'org:dept:query'">查看</el-button>
              <el-button plain size="mini" type="success" @click="editItem(row)" v-has="'org:dept:edit'">编辑</el-button>
              <el-button plain size="mini" type="danger" @click="handleDelete(row.pkId)" v-has="'org:dept:delete'">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    </div>

    <!-- 弹窗 -->
    <el-dialog :close-on-press-escape="false" :title="title" width="460px" :visible.sync="popAdd" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-form :model="form" :rules="rules" ref="deptForm" class="dialog-form">
        <el-form-item label="部门名称" prop="deptName" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.deptName" maxlength="25" :disabled="typeStatus"></el-input>
        </el-form-item>
        <el-form-item label="排序值" prop="sortval" :label-width="formLabelWidth">
          <!-- <el-input size="mini" v-model.trim="form.sortval" :disabled="typeStatus" @input="form.sortval=$limitInputNumber(form.sortval, 99999, 1, 0) - 0"></el-input> -->
          <el-input size="mini" v-model.trim="form.sortval" :disabled="typeStatus" maxlength="5" @input="keyDown"></el-input>
        </el-form-item>
        <el-form-item label="部门描述" :label-width="formLabelWidth">
          <el-input size="mini" v-model="form.remark" maxlength="100" type="textarea" :disabled="typeStatus"></el-input>
        </el-form-item>
      </el-form>
      <div style="height: 10px;" v-if="typeStatus"></div>
      <div slot="footer" class="dialog-footer" v-if="!typeStatus">
        <el-button size="mini" @click="popAdd = false">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="submit('deptForm')">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import pageInation from "../../components/tablePaging.vue";
export default {
  name: "divisional",
  data() {
    return {
      tableData: [],
      popAdd: false, // 控制弹窗显示隐藏
      form: {
        id: "",
        deptName: "狗子",
        sortval: 0,
        remark: "张飞大萨达撒所多"
      },
      title: "新增部门信息",
      formLabelWidth: "80px",
      typeStatus: false, // 输入框状态
      elTableHeight: "",
      pageNum: 1,
      pageSize: 10,
      total: 0,
      deptName: "", // 搜索
      rules: {
        deptName: [
          {
            required: true,
            message: "部门名称不能为空",
            trigger: ["change", "blur"]
          }
        ],
        sortval: [
          {
            required: true,
            message: "排序值不能为空",
            trigger: ["change", "blur"]
          }
        ]
      },
      loading: false
    };
  },
  components: {
    pageInation
  },
  mounted() {
    this.getData();
  },
  methods: {
    keyDown(value) {
      let val = value;
      val = val.slice(0, 11);
      val = val.replace(/\D|^'0'/g, "");
      this.form.sortval = val;
    },
    // 搜索按钮
    searchData() {
      this.pageNum = 1;
      this.getData();
    },
    // 获取数据的方法
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        deptName: this.deptName
      };
      this.loading = true;
      this.$api
        .getDeptPageList(params)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.loading = false;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {});
    },
    // 查看
    lookOver(item) {
      this.form = {
        id: "",
        deptName: "",
        sortval: "",
        remark: ""
      };
      if (this.$refs.deptForm != undefined) {
        this.$refs.deptForm.resetFields();
      }
      this.title = "部门信息";
      this.typeStatus = true;
      this.popAdd = true;
      this.form = Object.assign(this.form, item);
    },
    // 新增
    addDepartment() {
      this.title = "新增部门信息";
      this.typeStatus = false;
      this.popAdd = true;
      this.form = {};
      if (this.$refs.deptForm != undefined) {
        this.$refs.deptForm.resetFields();
      }
    },
    // 编辑
    editItem(item) {
      this.form = {
        id: "",
        deptName: "",
        sortval: "",
        remark: ""
      };
      if (this.$refs.deptForm != undefined) {
        this.$refs.deptForm.resetFields();
      }
      this.form = Object.assign(this.form, item);
      this.title = "编辑部门信息";
      this.typeStatus = false;
      this.popAdd = true;
      this.input.value = "";
    },
    // 删除
    handleDelete(id) {
      this.$confirm("确定删除该部门信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api
          .delDeptById({ deptId: id })
          .then(res => {
            if (res.code === 200) {
              this.$message.success("删除部门成功");
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.deptName = "";
          this.loading = true;
          if (this.title == "新增部门信息") {
            this.$api
              .addDept(this.form)
              .then(res => {
                if (res.code === 200) {
                  this.$message.success(res.msg);
                  this.getData();
                  this.popAdd = false;
                } else {
                  this.$message.warning(res.msg);
                }
                this.loading = false;
              })
              .catch(err => {
                this.loading = false;
              });
          } else {
            // 编辑
            this.$api
              .editDept(this.form)
              .then(res => {
                if (res.code === 200) {
                  this.$message.success(res.msg);
                  this.getData();
                  this.popAdd = false;
                } else {
                  this.$message.warning(res.msg);
                }
                this.loading = false;
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

    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
    },
    // 点击那一页
    handleCurrentChange(data) {
      if (!this.deptName) {
        this.deptName = "";
      }
      this.pageNum = data;
      this.getData();
    }
  }
};
</script>

<style lang="scss" scoped>
.add-department {
  margin: 10px 20px;
}
</style>
