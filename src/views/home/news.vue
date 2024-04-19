<template>
  <div class="app-container" v-loading="loading">
    <!-- <el-radio-group v-model="radio" size="mini" @change="radioChange">
      <el-radio-button :label="0">未读会议</el-radio-button>
      <el-radio-button :label="1">已读会议</el-radio-button>
    </el-radio-group> -->
    <div class="topTabs">
      <el-tabs v-model="radio" @tab-click="radioChange">
        <el-tab-pane label="未读新闻" name="0"></el-tab-pane>
        <el-tab-pane label="已读新闻" name="1"></el-tab-pane>
        <el-tab-pane label="我发布的" name="2"></el-tab-pane>
      </el-tabs>
    </div>
    <!-- 表格 -->
    <div class="table-data" style="height:83%">
      <el-table height="100%" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }" stripe ref="tables" :tooltip-effect="'light'">
        <el-table-column align="center" label="序号" type="index" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标题">
          <template slot-scope="{ row }">
            <div style="display:flex">
            <img src="../../assets/u10303.svg" alt="" class="titleIcon noread" v-if="radio == 0" />
            <img src="../../assets/u10260.svg" alt="" class="titleIcon" v-else-if="radio==1" />
            <div v-else-if="radio==2" class="mySend">发布</div>
            <span style="color:#02a7f0;cursor: pointer;" class="ellipsistwo" @click="openInfoDialog(row)" :title="radio==2?row.title:row.noticeTitle">{{ radio==2?row.title:row.noticeTitle }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="发布人" prop="fkLaunchName" show-overflow-tooltip> </el-table-column>
        <el-table-column align="center" label="发布时间" prop="sendingTime" show-overflow-tooltip> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />

    <el-dialog title="文章信息" width="60%" top="2vw" :visible="infoDialog" @close="closeInfoDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="infoDialog dialog-form" v-if="radio==1">
        <div class="infoDialog-head">
          <h2>{{ dialogForm.title }}</h2>
          <div class="sendInfo">
            <span class="mr-20">发布人:{{ dialogForm.fkLaunchName }}</span>
            <span>发布时间:{{ dialogForm.sendingTime }}</span>
          </div>
        </div>
        <el-divider></el-divider>
        <div v-html="dialogForm.content" class="overDiv"></div>
      </div>
      <div class="infoDialog dialog-form" v-if="radio==0||radio==2">
        <div class="infoDialog-head">
          <h2>{{ dialogForm.noticeTitle }}</h2>
          <div class="sendInfo">
            <span class="mr-20">发布人:{{ dialogForm.userName }}</span>
            <span>发布时间:{{ dialogForm.sendingTime }}</span>
          </div>
        </div>
        <el-divider></el-divider>
        <div v-html="dialogForm.noticeContent" class="overDiv"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      tableData: [],
      radio: "0",
      page: {
        pageNum: 1,
        pageSize: 10
      },
      loading: false,
      total: 0,
      dialogForm: {
        enableStatus: "",
        noticeAbstract: "",
        noticeContent: "",
        noticeTitle: "",
        noticeType: "",
        publishing: "",
        rotationUrl: "",
        userName: ""
      },
      infoDialog: false
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      let data = { ...this.page, readStatus: this.radio - 0, noticeType: 0 };
      if (this.radio == 0) {
        this.$api.searchNoticPage(data).then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else if(this.radio == 1){
        let api = this.user.orgType != 0 ? this.$api.noticeReadPage : this.$api.noticeReadPage2;
        api(data).then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        });
      }else if(this.radio==2){
        delete data.readStatus
        this.$api.getRelease(data).then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    radioChange() {
      this.page = {
        pageNum: 1,
        pageSize: 10
      };
      this.tableData = [];
      this.getList();
    },
    openInfoDialog(row) {
      this.findNoticeById(row.pkId, true);
    },
    findNoticeById(pkId) {
      let api = this.radio==1? this.$api.getReadDetail:this.$api.findNoticeById
      api({ pkId }).then(res => {
        if (res.code === 200) {
          this.dialogForm = res.data;
          this.infoDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeInfoDialog() {
      this.infoDialog = false;
      this.getList();
      this.dialogForm = {
        enableStatus: "",
        noticeAbstract: "",
        noticeContent: "",
        noticeTitle: "",
        noticeType: "",
        publishing: "",
        rotationUrl: "",
        userName: ""
      };
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageNum = 1;
      this.page.pageSize = val;
      this.getList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getList();
    }
  }
};
</script>

<style lang="scss" scoped>
.topTabs {
  padding: 5px;
  background-color: #fff;
}
.titleIcon {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}
.noread {
  width: 30px;
  height: 30px;
}
.h-10 {
  height: 10px;
}
.infoDialog {
  height: 700px;
  padding: 20px;
  overflow: auto;
  .infoDialog-head {
    text-align: center;
    .sendInfo {
      display: flex;
      justify-content: flex-end;
    }
  }
  .overDiv {
    height: 550px;
    overflow: auto;
  }
}
.mr-20 {
  margin-right: 20px;
}
.mySend{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 20px;
  color: red;
  font-size: 12px;
  background-color: #e1e1e1;
}
</style>
