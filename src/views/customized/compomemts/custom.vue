<template>
  <div>
    <search-bar  @search="searchData" :options="searchOptions" :total="total" labelWidth="8em"
      ref="searchBar" :showHandler="false"></search-bar>
    <div class="tab-container">
      <div class="table-data" style="height:96%;margin-top: 10px;">
        <el-table :data="tableData" ref="tables" stripe height="90%"  v-loading="loading"
          :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
          <el-table-column label="选择" min-width="80" align="center">
            <template slot-scope="{ row }">
              <el-button type="primary" plain size="mini" @click="lookOver(row)">选择</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="企业名称" align="center"> </el-table-column>
          <el-table-column prop="telephone" label="管理员手机号码" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="linkMan" label="联系人" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="linkPhone" label="联系人手机号码" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="createTime" label="注册日期" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="expireTime" label="到期日期" align="center" show-overflow-tooltip> </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <!-- 分页 -->
        <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange"
          @handleCurrentChange="handleCurrentChange"></pageInation>
      </div>
    </div>
  </div>
</template>

<script>
import pageInation from "../../../components/tablePaging.vue";
// import basics from "./compomemts/basics.vue"
export default {
  name: "custom",
  props: {
    types: {
      type: String,
      default: ""
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchOptions: [
        {
          type: "input",
          prop: "orgName",
          value: "",
          title: "企业名称",
          placeholder: "",
          maxlength:"50"
        },
        {
          type: "input",
          prop: "linkMan",
          value: "",
          title: "联系人",
          placeholder: "",
          maxlength:"25"
        },
        {
          type: "inputPhone",
          prop: "telephone",
          value: "",
          title: "管理员手机",
          placeholder: ""
        }
      ],
      tableData: [],
      formLabelWidth: "80px",
      typeStatus: false, //输入框状态
      elTableHeight: "",
      pageNum: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      basicStatus: false
    };
  },
  components: {
    pageInation
    // basics
  },
  watch: {
    status(val) {
      if (val) {
        this.linkMan = "";
        this.orgName = "";
        this.telephone = "";
        this.getData();
      }
    }
  },
  created(){
    // if(this.types == '0'){
    //   this.searchOptions = [
    //   {
    //       type: "input",
    //       prop: "orgName",
    //       value: "",
    //       title: "企业名称",
    //       placeholder: "",
    //       maxlength:"50"
    //     },
    //     {
    //       type: "inputPhone",
    //       prop: "telephone",
    //       value: "",
    //       title: "管理员手机号码",
    //       placeholder: ""
    //     }
    //   ]
    // }
  },
  mounted() {

    this.getData();
  },
  methods: {
    //搜索按钮
    searchData(data) {
      this.pageNum = 1;
      this.linkMan = data.linkMan;
      this.orgName = data.orgName;
      this.telephone = data.telephone;
      this.getData();
    },
    // 获取数据的方法
    getData() {
      this.loading = true;
      let data = {
        // orgType: -1,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        // enableStatus: -1,
        // orgScale: -1,
        linkMan: this.linkMan == undefined ? "" : this.linkMan,
        orgName: this.orgName == undefined ? "" : this.orgName,
        telephone: this.telephone == undefined ? "" : this.telephone,
        type: this.types
      };
      this.$api
        .searchPageByType(data)
        .then(res => {
          if (res.code == 200) {
            this.tableData = res.data.records;
            this.total = parseInt(res.data.total);
            this.loading = false;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
      // let params = {
      //   pageNum: this.pageNum,
      //   pageSize: this.pageSize,
      //   deptName: this.deptName
      // };
      // this.loading = true;
      // this.$api
      //   .getDeptPageList(params)
      //   .then(res => {
      //     if (res.code === 200) {
      //       this.tableData = res.data.records;
      //       this.total = res.data.total - 0;
      //       this.loading = false;
      //       this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      //     } else {
      //       this.loading = false;
      //       this.$message.warning(res.msg);
      //     }
      //   })
      //   .catch(err => {});
    },
    reset() {
      // console.log("1111111111")
      this.$refs.searchBar.reset();
    },
    // 查看
    lookOver(item) {
      this.$emit("choose", item);
      console.log('item -----> ', item);
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

.headline {
  background: #ccc;
  font-size: 16px;

  .item {
    padding: 0 20px;
  }
}</style>
