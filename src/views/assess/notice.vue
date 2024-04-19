<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bgc search-mr">
      <span class="m-left">会议日期</span>
      <el-date-picker v-model="listQuery.beginTime" :picker-options="pickerOptionsAnd" value-format="yyyy-MM-dd HH:mm:ss" class="wh-200" size="mini" type="datetime" placeholder="选择日期时间"> </el-date-picker>
      <span>起</span>
      <el-date-picker v-model="listQuery.endTime" value-format="yyyy-MM-dd HH:mm:ss" class="wh-200" :picker-options="pickerOptionsEnd" size="mini" type="datetime" placeholder="选择日期时间"> </el-date-picker>
      <span>止</span>
      <span class="m-left">关键字</span>
      <el-input v-model="listQuery.title" placeholder="请输入日志内容" size="mini" class="wh-200" maxlength="50"></el-input>
      <el-button type="primary" size="mini" icon="el-icon-search" class="ml-20" @click="search">查询</el-button>
      <el-button size="mini" class="add" type="primary" v-has="'assess:notice:add'" @click="add">新增</el-button>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height:  82%;margin-top: 10px;">
        <el-table ref="tables" :data="tableData" stripe height="96%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="meetingTitle" label="会议主题" min-width="120">
            <template slot-scope="{ row }">
              <div v-has="'assess:notice:query'" class="ellipsistwo" :title="row.meetingTitle" style="color:#02a7f0;cursor: pointer;" @click="openInfoDialog(row, 0)">{{ row.meetingTitle }}</div></template
            >
          </el-table-column>
          <el-table-column align="center" prop="meetingPlace" label="会议场所" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="meetingTime" label="会议时间" min-width="160" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="speaker" label="主讲人" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="enableStatusName" label="状态" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="operateSource" label="操作" min-width="180">
            <template slot-scope="{ row }">
              <el-button plain type="primary" size="mini" v-has="'assess:notice:query'" @click="openInfoDialog(row, 1)">查看</el-button>
              <el-button plain type="warning" size="mini" v-has="'assess:notice:update'" v-show="row.editStatus" @click="compile(row.pkId)">编辑</el-button>
              <el-button plain type="danger" size="mini" v-has="'assess:notice:delete'" v-show="row.deleteStatus" @click="expurgate(row.pkId)">删除</el-button>
              <el-button plain type="danger" v-show="row.cancelStatus" size="mini" v-has="'assess:notice:withdraw'" @click="cancel(row.pkId)">撤回</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
    </div>
    <el-dialog title="文章信息" width="60%" top="2vw" :visible="infoDialog" @close="closeInfoDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="infoDialog">
        <div class="infoDialog-head">
          <h2>{{ dialogForm.meetingTitle }}</h2>
          <div class="sendInfo">
            <span class="mr-20">发布人:{{ dialogForm.userName }}</span>
            <span>发布时间:{{ dialogForm.createTime }}</span>
          </div>
        </div>
        <el-divider></el-divider>
        <div style="display: flex;">
          <span style="width:33%">会议场所：{{ dialogForm.meetingPlace }}</span>
          <span style="width:30%">主讲人：{{ dialogForm.speaker }}</span>
          <span>会议时间：{{ dialogForm.meetingStartTime }}~{{ dialogForm.meetingEndTime }}</span>
        </div>
        <div style="margin-top: 10px;">会议简介</div>
        <!-- <div v-html="dialogForm.meetingContent" class="overDiv"></div> -->
        <myEditorJustLook :pro-html="dialogForm.meetingContent"></myEditorJustLook>
      </div>
    </el-dialog>
    <el-dialog :title="dialogTitle" :visible="dialogVisible" width="60%" @close="closeDialog(false)" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog">
        <el-row :span="24" class="el-row-data dialog-form">
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">会议标题</div>
            <div class="content">
              <el-input v-model="dialogForm.meetingTitle" :disabled="dialogType === 1" size="mini" maxlength="100"></el-input>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10"> </el-col>
          <el-col :span="6" class="dialog-form-item mb-10"> </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">发布人</div>
            <div class="content">
              <el-input v-model="dialogForm.userName" disabled size="mini"></el-input>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">会议场所</div>
            <div class="content">
              <el-input v-model="dialogForm.meetingPlace" :disabled="dialogType === 1" size="mini" maxlength="100"></el-input>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">主讲人</div>
            <div class="content">
              <el-input v-model="dialogForm.speaker" :disabled="dialogType === 1" size="mini" maxlength="50"></el-input>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">会议时间</div>
            <div class="content">
              <el-date-picker :disabled="dialogType === 1" v-model="dialogForm.meetingStartTime" class="wh-200" value-format="yyyy-MM-dd HH:mm:ss" size="mini" type="datetime" placeholder="选择日期时间"> </el-date-picker>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">至</div>
            <div class="content">
              <el-date-picker :disabled="dialogType === 1" v-model="dialogForm.meetingEndTime" class="wh-200" value-format="yyyy-MM-dd HH:mm:ss" size="mini" type="datetime" placeholder="选择日期时间"> </el-date-picker>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="alabels">
              <div>参加人员</div>
              <div><el-button v-if="dialogType != 1" type="primary" @click="choice" size="mini">选择</el-button></div>
            </div>
            <div class="content">
              <div style="    background: #f2f2f2;">
                <div v-for="(item, idx) in this.checkList" :key="idx" style="position: relative;display: inline-block;margin: 4px;background: #fff;border: 1px solid;padding: 3px 15px;">
                  <span>{{ item.userName }}</span>
                  <span v-if="dialogType != 1" style="color:red;position: absolute;right: 3px;top: 0px;" @click="remove(idx)">x</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="labels">其他人员</div>
            <div class="content">
              <el-input v-model="dialogForm.otherStaff" :disabled="dialogType === 1" size="mini" maxlength="200"></el-input>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="alabels">会议简介</div>
            <div class="content">
              <myEditor :pro-html="dialogForm.meetingContent" ref="myEditor" v-if="dialogType !== 1 && dialogVisible"></myEditor>
              <myEditorJustLook :pro-html="dialogForm.meetingContent" v-else></myEditorJustLook>
            </div>
          </el-col>
        </el-row>
      </div>
      <div slot="footer" v-if="dialogType != 1">
        <el-button size="mini" type="primary" @click="preserve(0)">保存草稿</el-button>
        <el-button size="mini" type="primary" @click="preserve(1)">发布会议</el-button>
        <el-button size="mini" @click="closeDialog(false)">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择人员" :visible="personnelVisible" width="50%" @close="personnelDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog">
        <el-row :span="24" class="el-row-data dialog-form">
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">选择部门</div>
            <div class="content">
              <!-- <el-input v-model="dialogForm.meetingTitle" :disabled="dialogType === 1" size="mini" maxlength="100"></el-input> -->
              <el-select size="mini" v-model="department" placeholder="请选择" @change="departmentChange">
                <el-option size="mini" v-for="item in departmentList" :key="item.pkId" :label="item.deptName" :value="item.pkId"> </el-option>
              </el-select>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="tab-container">
        <el-table ref="tables" :data="orgList" stripe height="70%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center" width="50"> </el-table-column>
          <el-table-column align="center" label="序号" min-width="50">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (orgPage.pageNum - 1) * orgPage.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="userName" label="姓名" min-width="80"></el-table-column>
          <el-table-column align="center" prop="telephone" label="联系电话" min-width="160"></el-table-column>
          <el-table-column align="center" prop="deptName" label="所属部门" min-width="100"></el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="orgPage.pageNum" :page-size="orgPage.pageSize" :total="total" @handleSizeChange="orgSizeChange" @handleCurrentChange="orgCurrentChange"></table-paging>
      </div>
      <div slot="footer">
        <el-button size="mini" @click="personnelDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="ensure">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import myEditor from "@/components/myEditor/myEditor.vue";
import myEditorJustLook from "@/components/myEditor/myEditorJustLook.vue";
import { getStringImgSrc } from "../../utils/commond";
import COS from "cos-js-sdk-v5";
export default {
  name: "notice",
  components: { myEditor, myEditorJustLook },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      loading: false,
      totalCount: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        fkUserId: "",
        logType: "",
        beginTime: "",
        endTime: "",
        title: ""
      },
      tableData: [],
      pickerOptionsEnd: {
        disabledDate: time => {
          if (this.listQuery.beginTime) {
            let d;
            if (typeof this.listQuery.beginTime == "string") {
              d = new Date(this.listQuery.beginTime).getTime();
            } else {
              d = this.listQuery.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      pickerOptionsAnd: {
        disabledDate: time => {
          if (this.listQuery.endTime) {
            let d;
            if (typeof this.listQuery.endTime == "string") {
              d = new Date(this.listQuery.endTime).getTime();
            } else {
              d = this.listQuery.endTime.getTime();
            }
            return time.getTime() > d;
          }
        }
      },
      infoDialog: false,
      dialogTitle: "新增会议",
      dialogVisible: false,
      dialogForm: {},
      dialogType: "",
      checkList: [],
      personnelVisible: false,
      departmentList: [],
      department: "-1",
      orgPage: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      orgList: [],
      multipleSelection: [],
      newAddList: [],
      delList: [],
      saveHtml: ""
    };
  },
  mounted() {
    this.search();
    this.getOrgAllDeptList();
  },
  methods: {
    remove(idx) {
      this.checkList.splice(idx, 1);
    },
    ensure() {
      this.multipleSelection.forEach((item, index) => {
        item.fkUserId = item.pkId;
        this.checkList.push(item);
      });
      this.checkList = this.unique(this.checkList);
      this.personnelVisible = false;
      console.log(this.checkList);
    },
    unique(arr) {
      const res = new Map();
      return arr.filter(arr => !res.has(arr.fkUserId) && res.set(arr.fkUserId, 1));
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    departmentChange() {
      this.orgPage = {
        pageNum: 1,
        pageSize: 10
      };
      this.getUserPageList();
    },
    getOrgAllDeptList() {
      this.$api.getOrgAllDeptList().then(res => {
        if (res.code == 200) {
          this.departmentList = res.data;
          this.departmentList.unshift({ deptName: "全部", pkId: "-1" });
        } else {
        }
      });
    },
    choice() {
      this.department = "-1";
      this.personnelVisible = true;

      this.getUserPageList();
    },
    getUserPageList() {
      const data = { ...this.orgPage };
      data.orgId = this.user.fkOrgId;
      data.deptId = this.department;
      this.$api.getUserPageList(data).then(res => {
        if (res.code == 200) {
          this.orgList = res.data.records;
          this.total = res.data.total - 0;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 页数改变事件
    orgSizeChange(pageSize) {
      this.orgPage.pageSize = pageSize;
      this.getUserPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    orgCurrentChange(currentPage) {
      this.orgPage.pageNum = currentPage;
      this.getUserPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },

    personnelDialog() {
      this.personnelVisible = false;
    },
    openInfoDialog(row, type) {
      this.dialogType = 1;
      if (type == 0) {
        this.oaMeetingfindById(row.pkId, true);
      } else {
        this.oaMeetingfindById(row.pkId);
        this.dialogTitle = "会议信息";
      }
    },
    compile(pkId) {
      this.dialogType = "";
      this.dialogTitle = "编辑会议";
      this.oaMeetingfindById(pkId);
    },
    closeInfoDialog() {
      this.infoDialog = false;
      this.dialogForm = {
        enableStatus: "",
        meetingContent: "",
        meetingEndTime: "",
        meetingPlace: "",
        meetingStartTime: "",
        meetingTitle: "",
        speaker: "",
        userName: "",
        otherStaff: ""
      };
    },
    oaMeetingfindById(pkId, bool) {
      this.$api.oaMeetingfindById({ pkId }).then(res => {
        if (res.code === 200) {
          this.dialogForm = res.data;
          this.checkList = res.data.users;
          this.saveHtml = res.data.meetingContent;
          if (bool) {
            this.infoDialog = true;
          } else {
            this.dialogVisible = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    add() {
      this.dialogForm.userName = this.user.userName;
      this.dialogTitle = "新增会议";
      this.dialogVisible = true;
      this.dialogType = "";
    },
    preserve(enableStatus) {
      const date = { ...this.dialogForm, enableStatus, meetingContent: this.$refs.myEditor.html };
      if(this.$refs.myEditor.loading){
        return this.$message.warning("文章内容加载中")
      }
      console.log(date);
      if (!date.meetingTitle) {
        return this.$message.warning("请填写会议标题");
      }
      if (!date.meetingPlace) {
        return this.$message.warning("请填写会议场所");
      }
      if (!date.speaker) {
        return this.$message.warning("请填写主讲人");
      }
      if (!date.meetingStartTime) {
        return this.$message.warning("请填写会议开始时间");
      }
      if (!date.meetingEndTime) {
        return this.$message.warning("请填写会议结束时间");
      }
      if (this.checkList.length == 0&&!date.otherStaff) {
        return this.$message.warning("请填选择参加人员");
      } else {
        date.userIds = [];
        this.checkList.forEach(item => {
          date.userIds.push(item.fkUserId);
        });
      }
      this.loading = true;
      if (this.dialogTitle == "新增会议") {
        this.$api.oaMeetingAdd(date).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("新增成功");
            this.closeDialog(true);
            this.search();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        delete date.users;
        delete date.userName;
        this.$api.oaMeetingUpdate(date).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("编辑成功");
            this.closeDialog(true);
            this.search();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeDialog(isDel) {
      if (this.$refs.myEditor) {
        const arr = getStringImgSrc(this.$refs.myEditor.html);
        const arr2 = [...this.$refs.myEditor.newAddList];
        console.log(this.$refs.myEditor.newAddList, arr2);
        if (!isDel) {
          this.delList = [];
          this.delFiles(arr, arr2);
        } else {
          this.newAddList = [];
          this.$refs.myEditor.newAddList=[]
          this.delFiles(arr, arr2);
        }
        this.$refs.myEditor.html = "";
      }
      this.dialogVisible = false;
      // this.checkList = [];
      this.saveHtml = "";
      this.checkList = [];
      this.dialogForm = {
        enableStatus: "",
        meetingContent: "",
        meetingEndTime: "",
        meetingPlace: "",
        meetingStartTime: "",
        meetingTitle: "",
        speaker: "",
        userName: "",
        otherStaff: ""
      };
    },
    delFiles(newImgList, ediNewAddList) {
      console.log(newImgList, ediNewAddList);
      let urls = [];
      const imgList = getStringImgSrc(this.saveHtml);
      let arr = [];
      const ediDelList = [];

      if (newImgList && newImgList.length) {
        if (imgList.length) {
          imgList.forEach(item => {
            if (!newImgList.includes(item)) {
              arr.push(item);
            }
          });
        }
      } else {
        arr = imgList;
      }
      ediNewAddList &&
        ediNewAddList.forEach(item => {
          if (!newImgList.includes(item)) {
            ediDelList.push(item);
          }
        });
      if (this.dialogType === 2) {
        urls = [...this.newAddList, ...ediNewAddList].join(",");
      } else {
        urls = [...new Set([...this.delList, ...this.newAddList, ...arr, ...ediDelList])].join(",");
      }
      console.log(urls);
      if (!urls.length) {
        return;
      }
      this.newAddList = [];
      this.delList = [];
      this.$refs.myEditor.newAddList = [];
      this.$api.delFiles({ urls });
    },
    // 删除会议
    expurgate(pkId) {
      const _this = this;
      _this
        .$confirm("确定删除该会议信息?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.oaMeetingDelete({ pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: res.msg
              });
              this.search();
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
    // 取消会议
    cancel(pkId) {
      const _this = this;
      _this
        .$confirm("确定撤回该会议信息?", "撤回确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.oaMeetingCancel({ pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: res.msg
              });
              this.search();
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
    // 查询
    search() {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = 10;
      this.getOrgPageList();
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },

    getOrgPageList() {
      const data = {
        pageNum: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize,
        beginTime: this.listQuery.beginTime,
        endTime: this.listQuery.endTime,
        keyWord: this.listQuery.title
      };
      this.loading = true;
      this.$api.oaMeetingSearchPage(data).then(res => {
        if (res.code == 200) {
          const options = {
            0: "草稿",
            1: "已发布"
          };
          res.data.records.forEach(item => {
            item.enableStatusName = options[item.enableStatus];
          });
          this.tableData = res.data.records;
          this.totalCount = res.data.total - 0;
          this.loading = false;
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.search-mr {
  position: relative;
}
.add {
  position: absolute;
  top: 22px;
  right: 8px;
}

// /deep/ .el-dialog__header {
//   background: #ccc;
//   height: 40px;
// }
.m-left {
  margin-left: 8px;
}
el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.dialog-form {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .dialog-form-item {
    position: relative;
    display: flex;
    .labels {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 80px;
    }
    .alabels {
      vertical-align: top;
      width: 80px;
    }
    .content {
      flex: 1;
    }
    .w-90 {
      width: 90px;
    }
    .w-100 {
      width: 100px;
    }
    .w-110 {
      width: 110px;
    }
  }
}
.mb-10 {
  margin-bottom: 10px;
}
.iconsColor {
  font-size: 16px;
  color: #3aa1ff;
}
.uploadDiv {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 90px;
  //   margin: 0 20px 20px 20px;
  border: 1px dashed #c0ccda;
  cursor: pointer;
  .uploadIcon {
    font-size: 30px;
    color: #c0ccda;
  }
}
.imgList {
  display: flex;
  //   justify-content: space-evenly;
  flex-wrap: wrap;
  width: 100%;
  .imgs {
    position: relative;
    // margin: 0 20px 20px 20px;
    // margin-bottom: 20px;
    img {
      width: 150px;
      height: 90px;
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      width: 150px;
      height: 90px;
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
}
.prevDialog {
  width: 100%;
  height: 600px;
  overflow: auto;
  text-align: center;
}
.editor {
  width: 100%;
  height: 380px;
  overflow: auto;
  border: 1px solid #cccccc;
}
.infoDialog {
  padding: 20px;
  height: 700px;
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
.search-bgc {
  font-size: 14px;
  line-height: 50px;
}
</style>
