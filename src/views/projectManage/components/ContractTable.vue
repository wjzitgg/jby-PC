<template>
  <div style="height:calc(100% - 60px)">
    <!-- 搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px">
          <el-form-item label="项目" v-if="[2, 3, 9].includes(user.orgType)" label-width="60px">
            <el-select v-model="inpData.fkProjectId" size="mini" class="wh-140" @change="proChange($event, 1)">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标段项目" v-if="user.orgType !== 5">
            <el-select v-model="inpData.fkProjectBidId" :disabled="!inpData.fkProjectId" size="mini" v-if="[2, 3, 9].includes(user.orgType)" class="wh-140">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in proOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
            </el-select>
            <el-select v-model="inpData.fkProjectBidId" size="mini" class="wh-140" v-else>
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="合同状态">
            <el-select size="mini" v-model="inpData.enableStatus">
              <el-option value="" label="全部"></el-option>
              <el-option value="0" label="正常"></el-option>
              <el-option value="1" label="终止"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="合同名称">
            <el-input size="mini" v-model="inpData.contractName" maxlength="50"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" icon="el-icon-search" class="btn-serach el-button-primary" @click="search">查询</el-button>
        </el-form>
      </template>
      <div slot="right" v-has="'projectManage:contract:add'">
        <el-button type="primary" class="el-button-primary" size="mini" @click="handleOpen(2)">新增合同</el-button>
      </div>
    </SearchBar>
    <div class="table-data" style="height:87%;margin-top: 10px;">
      <!-- 表格 -->
      <el-table :data="tableData" ref="tables" stripe height="90%" :header-cell-style="{ background: '#f1f6ff' }" :key="randomKey" :tooltip-effect="'light'" :summary-method="getSummaries" show-summary>
        <el-table-column align="center" label="序号" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (query.pageNum - 1) * query.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="contractName" label="合同名称" show-overflow-tooltip>
          <!-- <template slot-scope="{row}">
          <div class="ellipsistwo">{{row.contractName}}</div>
        </template> -->
        </el-table-column>
        <el-table-column align="center" prop="fkProjectName" label="项目" v-if="[2, 3, 9].includes(user.orgType)" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="projectName" label="标段项目" v-if="user.orgType != 5" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="orgName" label="项目部" v-if="id !== 2 && user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="superiorOrgName" label="施工单位" v-if="id === 1 && user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="customerOrgName" label="建设单位" v-if="(id === 1 && user.orgType !== 4) || (id === 2 && user.orgType === 3)" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="orgName" label="监理公司" v-if="(id === 2 && user.orgType !== 3) || (id === 2 && user.orgType === 4)" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="customerOrgName" label="供货商" v-if="id === 3 && user.orgType !== 6" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="customerOrgName" label="分包单位" v-if="id === 4 && user.orgType !== 7" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="signDate" label="合同签订日期" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="beginDate" v-if="id !== 3" label="施工开始日期" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="endDate" v-if="id !== 3" label="施工完成日期" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" prop="amount" label="合同金额(元)" show-overflow-tooltip>
          <template slot-scope="{ row }">
            {{ !pricePermission ? "***" : row.amount }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="enableStatus" label="状态">
          <template slot-scope="{ row }">
            <span v-if="row.enableStatus">已终止</span>
            <span v-else>正常</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="400">
          <template slot-scope="{ row }">
            <el-button plain size="mini" @click="handleOpen(1, row)" type="primary" v-has="'projectManage:contract:query'">查看</el-button>
            <el-button plain size="mini" @click="handleOpen(3, row)" v-if="row.editStatus == 1" v-has="'projectManage:contract:edit'" type="success">编辑</el-button>
            <el-button plain size="mini" @click="termination(row)" v-if="!row.enableStatus" v-has="jurisdiction.termination" type="danger">终止</el-button>
            <el-button plain size="mini" v-if="row.attachments && row.attachments.length" v-has="'projectManage:contract:download'" @click="handleDownload(row)" type="success">下载附件</el-button>
            <el-button plain size="mini" @click="handleDel(row)" v-if="row.deleteStatus == 1" v-has="'projectManage:contract:delete'" type="danger">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 分页组件 -->
      <Pagination :pageSize="query.pageSize" :total="total" :currentPage="query.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    </div>
    <ContractDialog :dialogVisible.sync="dialogVisible" :dialogShowType="dialogShowType" :id="id" :user="$store.state.user" @refresh="refresh" ref="ContractDialog" />
  </div>
</template>

<script>
import SearchBar from "../../contract/components/SearchBar.vue";
import Pagination from "@/components/tablePaging";
// import ContractDialog from "../../contract/components/ContractDialog.vue";
import ContractDialog from "./ContractDialog.vue";
import api from "@/api/api";
export default {
  components: { Pagination, SearchBar, ContractDialog },
  props: {
    id: {
      type: Number
    }
  },
  data() {
    return {
      options: [],
      proOptions: [],
      constructionUnits: [],
      tableData: [],
      dialogVisible: false,
      dialogShowType: 1,
      query: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      inpData: {
        contractName: null, // 合同名称
        fkCustomerId: "",
        fkOrgId: "",
        enableStatus: "",
        fkProjectId: "",
        fkProjectBidId: ""
      },
      randomKey: Math.random(),
      amount: 0
    };
  },
  watch: {
    id() {
      console.log(this.id);
    }
  },
  mounted() {
    console.log("触发");
    this.getContractPageListByCondition();
    if (this.user.orgType !== 5) {
      this.getAllProject();
    }
  },
  methods: {
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (column.label == "合同金额(元)") {
          sums[index] = this.amount;
        }
      });

      return sums;
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "") {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 选择项目部
    proChange(e, type) {
      this.inpData.fkProjectBidId = "";
      if (e) {
        this.allListBidByProId(0, e, type);
      }
    },
    // 获取所有施工单位
    projCustomSearch() {
      this.$api.projCustomSearch({ customType: this.cusType }).then(res => {
        if (res.code == 200) {
          this.constructionUnits = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 下载
    handleDownload(row) {
      row.attachments.forEach(item => {
        item.suffix = item.suffix.substr(1);
        if (item.suffix == "pdf") {
          this.fileLinkToStreamDownload(item.attachUrl, item.attachName, item.suffix);
        } else {
          window.open(item.attachUrl);
        }
      });
    },
    fileLinkToStreamDownload(url, fileName, type) {
      const reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/;
      if (!reg.test(url)) {
        throw new Error("传入参数不合法,不是标准的文件链接");
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.setRequestHeader("Content-Type", `application/${type}`);
        xhr.responseType = "blob";
        xhr.onload = function() {
          if (this.status == 200) {
            // 接受二进制文件流
            // console.log(this);
            const blob = this.response;
            const blobUrl = window.URL.createObjectURL(blob);
            // 这里的文件名根据实际情况从响应头或者url里获取
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(blobUrl);
          }
        };
        xhr.send();
      }
    },
    // 删除
    handleDel(row) {
      this.$confirm("确定删除该合同信息?", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        if ([1, 4].includes(this.id) && row.isChoose === 1) {
          return this.$message.warning("已有审批流程关联，不允许删除");
        }
        // 已换
        this.$api.contractInfoDelete({ pkId: row.pkId }).then(res => {
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: "删除成功!"
            });
            this.getContractPageListByCondition();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 终止
    termination(row) {
      this.$confirm("确定终止该合同？", "终止合同确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        // 已换
        this.$api.contractInfoConstant({ pkId: row.pkId }).then(res => {
          if (res.code == 200) {
            this.getContractPageListByCondition();
            this.$message({
              type: "success",
              message: "终止成功!"
            });
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    handleOpen(type, row) {
      this.dialogVisible = true;
      this.dialogShowType = type;
      if (row) {
        this.$refs.ContractDialog.initialization(row);
      } else {
        this.$refs.ContractDialog.empty();
      }
    },
    // 查询
    search() {
      // return console.log(form)
      this.query.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.getContractPageListByCondition();
    },

    // 分页列表
    getContractPageListByCondition() {
      const contractType = this.id;
      const data = {
        ...this.query,
        ...this.dealObjectValue(this.searchData),
        contractType
      };
      this.$api.contractInfoSearchPage(data).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.amount = res.data.amount;
          this.randomKey = Math.random();
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 对象去"" 去null 去undefig
    dealObjectValue(obj) {
      const param = {};
      if (obj === null || obj === undefined || obj === "") return param;
      for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
          param[key] = obj[key];
        }
      }
      return param;
    },
    refresh(status) {
      // console.log(status)
      // this.dialogVisible = status;
      this.getContractPageListByCondition();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.query.pageSize = val;
      this.getContractPageListByCondition();
    },
    // current改变
    handleCurrentChange(val) {
      this.query.pageNum = val;
      this.getContractPageListByCondition();
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    cusType() {
      if (this.user.orgType === 2 && this.id == 2) return 1;
      if (this.user.orgType === 3 && this.id === 2) return 0;
    },
    jurisdiction() {
      return {
        query: "projectManage:contract:query",
        add: "projectManage:contract:add",
        edit: "projectManage:contract:update",
        delete: "projectManage:contract:delete",
        download: "projectManage:contract:download",
        termination: "projectManage:contract:termination"
      };
    },
    pricePermission() {
      const arr = this.$store.state.menuData.filter(item => item.menuCode == "projectManage/contract");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.downloadBtn {
  margin: 0 10px;
  padding: 5px 5px;
  border: 1px solid #000;
  border-radius: 5px;
}
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
.btn-serach {
  margin-left: 20px;
  height: 28px;
}
</style>
