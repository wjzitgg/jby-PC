<template>
  <div style="height:100%">
    <!-- 头部搜索框 -->
    <div slot="header" class="card-header">
      <div class="head2">
        <div class="label">选择项目</div>
        <!-- fkProjectId -->
        <el-select v-model="proId" size="mini">
          <el-option label="全部" value=""> </el-option>
          <el-option v-for="item in proOptions" :key="item.pkId" :label="item.projectName" :value="item.pkId"> </el-option>
        </el-select>
      </div>
      <div class="head">
        <el-input size="mini" type="text" placeholder="工程项目名称" class="wh-200" v-model="projectName" maxlength="50"></el-input>
        <el-button size="mini" type="primary" class="ml el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
      </div>
      <!-- 新增按钮 -->
      <el-button type="primary" class="addBtn el-button-primary" @click="handleOpen(1)" size="mini" v-has="'projectManage:info:itemAdd'">新增</el-button>
    </div>
    <!-- 表格 -->
    <div class="table-data">
      <el-table ref="tables" :data="tableData" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column align="center" label="序号" type="index" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="所属项目" prop="proName" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="工程项目名称" prop="projectName"> </el-table-column>
        <el-table-column prop="manufacture" label="工程造价" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="工程量" prop="quantities" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="规模" prop="largeScale" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="结构形式" prop="structure" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="施工方案" prop="projectScheme" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="操作" width="250">
          <template slot-scope="{ row }">
            <el-button size="mini" plain type="primary" @click="handleOpen(2, row.pkId)">查看</el-button>
            <el-button size="mini" plain type="success" @click="handleOpen(1, row.pkId)" v-has="'projectManage:info:itemEdit'">编辑</el-button>
            <el-button size="mini" plain type="danger" @click="handleDel(row.pkId)" v-has="'projectManage:info:itemDelete'">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <Pagination :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    <!-- 模态框 -->
    <el-dialog :close-on-press-escape="false" :title="(dialogType === 2 ? '查看' : formDate.pkId ? '编辑' : '新增') + '工程项目'" :visible.sync="dialogVisible" @close="handleCancel" ref="model" width="25%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-form :model="formDate" :rules="rules" ref="dialog">
          <el-form-item label="所属项目" label-width="80px" v-if="user.orgType !== 5">
            <el-select v-model="formDate.fkProjectId" style="width:100%" placeholder="想选择所属项目" size="mini" :disabled="dialogType === 2">
              <el-option :value="item.pkId" v-for="item in options" :key="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目名称" label-width="80px" prop="projectName">
            <el-input size="mini" v-model.trim="formDate.projectName" :disabled="dialogType === 2" :maxlength="50" :minlength="2" @input="verify"></el-input>
          </el-form-item>         
          <!-- xxxxxx -->
          <el-form-item label="工程造价" label-width="80px" prop="manufacture">
            <el-input size="mini" v-model.trim="formDate.manufacture" maxlength="50" :disabled="dialogType === 2" @keydown.native="keyDown" oninput="if(value.length > 50) value=value.slice(0, 50)"></el-input>
          </el-form-item>
          <!-- ============ -->
          <el-form-item label="工程量" label-width="80px" prop="quantities">
            <el-input size="mini" v-model.trim="formDate.quantities" maxlength="50" :disabled="dialogType === 2"></el-input>
          </el-form-item>
          <!-- ========== -->
          <el-form-item label="规模" label-width="80px" prop="largeScale">
            <!-- <el-input size="mini" v-model="formDate.largeScale" :disabled="dialogType === 2" type="number" @keydown.native="keyDown"></el-input> -->
            <el-input size="mini" show-word-limit v-model="formDate.largeScale" type="textarea" resize="none" :disabled="dialogType === 2" :maxlength="50" rows="4"></el-input>
          </el-form-item>
          <el-form-item label="结构形式" label-width="80px" prop="structure">
            <!-- <el-input size="mini" v-model="formDate.structure" :disabled="dialogType === 2" type="number" @keydown.native="keyDown"></el-input> -->
            <el-input size="mini" show-word-limit v-model="formDate.structure" type="textarea" resize="none" :disabled="dialogType === 2" :maxlength="50" rows="4"></el-input>
          </el-form-item>
          <!-- ========== -->
          <el-form-item label="施工方案" label-width="80px" prop="projectScheme">
            <el-input size="mini" show-word-limit v-model="formDate.projectScheme" type="textarea" resize="none" :disabled="dialogType === 2" :maxlength="500" rows="4"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" v-show="dialogType === 1">
        <el-button type="primary" plain @click="handleCancel">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="btnOk">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
import api from "@/api/api";
export default {
  components: { Pagination },
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      formDate: {
        projectName: "",
        projectScheme: "",
        quantities: "",
        fkProjectId: "",
        manufacture: "", // 工程造价
        largeScale: "", // 规模
        structure: "" // 结构形式
      },
      proId: "",
      fkProjectId: "",
      options: [],
      proOptions: [],
      rules: {
        projectName: [
          { required: true, message: "请输入项目名称", trigger: "blur" },
          { max: 25, min: 2, message: "项目名称长度为2-25", trigger: "blur" }
        ],
        projectScheme: [{ required: true, message: "请输入施工方案", trigger: "blur" }],
        quantities: [{ required: true, message: "请输入工程量", trigger: "blur" }],
        manufacture: [{ required: true, message: "请输入工程量造价", trigger: "blur" }],
        largeScale: [{ required: true, message: "请输入规模", trigger: "blur" }],
        structure: [{ required: true, message: "请输入结构形式", trigger: "blur" }]
      },
      // 1为新增/编辑，2为查看
      dialogType: 1,
      page: { pageNum: 1, pageSize: 10 },
      total: 0,
      // 搜索框数据
      projectName: "",
      searchName: "",
      loading: false
    };
  },
  created() {
    this.getEnginnerList();
    this.searchProject();
    this.getAllProject();
  },
  methods: {
    // 获取工程项目表
    getEnginnerList() {
      const data = { ...this.page, fkProjectId: this.fkProjectId, projectName: this.searchName };
      api.projectTableSearchPage(data).then(res => {
        if (res.code === 200) {
          const { data } = res;
          this.tableData = data.records;
          this.total = data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchProject() {
      this.$api.searchProject().then(res => {
        if (res.code === 200) {
          this.proOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取所有项目信息
    getAllProject() {
      api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开模态框
    handleOpen(type, pkId) {
      this.dialogType = type;
      if (pkId) {
        api.findProjectTableById({ pkId }).then(res => {
          this.formDate = res.data;
        });
      }
      this.dialogVisible = true;
    },
    // 搜索按钮
    btnSearch() {
      this.page = { pageNum: 1, pageSize: 10 };
      this.searchName = this.projectName;
      this.fkProjectId = this.proId;
      this.getEnginnerList(this.projectName);
    },
    // 模态框确定按钮
    async btnOk() {
      await this.$refs.dialog.validate();
      const promise = this.formDate.pkId ? api.updateProjectTable : api.projectInfoAddProjectTable;
      this.loading = true;
      promise(this.formDate)
        .then(res => {
          if (res.code === 200) {
            this.getEnginnerList();
            this.$message.success("操作成功");
            this.handleCancel();
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 关闭模态框
    handleCancel() {
      this.formDate = {
        projectName: "",
        projectScheme: "",
        quantities: null,
        fkProjectId: ""
      };
      this.dialogVisible = false;
      this.$refs.dialog.clearValidate();
    },
    // 删除按钮
    handleDel(pkId) {
      this.$confirm("确定删除该工程项目信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        api.deleteProjectTable({ pkId }).then(res => {
          if (res.code === 200) {
            this.getEnginnerList();
            this.$message.success("删除成功!");
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getEnginnerList(this.searchName);
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getEnginnerList(this.searchName);
    },
     verify(value) {
      console.log(value);
      this.formDate.projectName = value.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\-\_\——]/g, "");
    },
    // 工程量
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-") {
        e.returnValue = false;
        return false;
      }
      return true;
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  }
};
</script>

<style lang="scss" scoped>
.card-header {
  position: relative;
  display: flex;
  align-items: center;
  background-color: $searcHeder;
  height: 80px;
  padding: 0 20px;
  margin-bottom: 10px;
}
.head {
  display: flex;
}
.ml {
  margin-left: 20px;
}
.table-data {
  height: 78%;
}
.addBtn {
  position: absolute;
  right: 20px;
}
/deep/ .el-textarea .el-input__count {
  background-color: transparent;
  color: #e5e5e5;
}
.head2 {
  display: flex;
  align-items: center;
  margin-right: 10px;
  .label {
    font-size: 14px;
    margin-right: 4px;
  }
}
</style>
