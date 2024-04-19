<template>
  <div class="app-container">
    <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="类型" label-width="40px">
          <el-select v-model="inpData.noticeType" size="mini">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in typeOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发布日期">
          <el-date-picker size="mini" :picker-options="pickerOptionsAnd" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.beginTime"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" :picker-options="pickerOptionsEnd" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input size="mini" v-model="inpData.keyWord" maxlength="50"></el-input>
        </el-form-item>
        <el-button size="mini" icon="el-icon-search" type="primary" class="ml-20 search" @click="btnSearch">查询</el-button>
      </el-form>
      <el-button size="mini" type="primary" @click="openDialog(2)" v-has="'assess:info:add'">新增</el-button>
    </div>
    <div class="table-data" style="height:  81%;margin-top: 10px;">
      <el-table stripe height="98%" ref="tables" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="文章标题" align="center" prop="noticeTitle">
          <template slot-scope="{ row }">
            <div class="ellipsistwo" style="color:#02a7f0;cursor: pointer;" :title="row.noticeTitle" v-has="'assess:info:query'" @click="openInfoDialog(row)">{{ row.noticeTitle }}</div>
            <!-- <span>{{ row.noticeTitle }}</span> -->
          </template>
        </el-table-column>
        <el-table-column label="摘要" align="center" prop="noticeAbstract" show-overflow-tooltip> </el-table-column>
        <el-table-column label="类型" align="center">
          <template slot-scope="{ row }">
            {{ row.noticeType === 0 ? "公司新闻" : row.noticeType === 1 ? "公司公告" : "" }}
          </template>
        </el-table-column>
        <el-table-column label="APP轮播" align="center" prop="sendingTime">
          <template slot-scope="{ row }">
            {{ row.publishing === 0 ? "启用" : "" }}
          </template>
        </el-table-column>
        <el-table-column label="发布时间" align="center" prop="sendingTime" show-overflow-tooltip> </el-table-column>
        <el-table-column label="发布人" align="center" prop="userName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="状态" align="center" prop="enableStatus">
          <template slot-scope="{ row }">
            {{ row.enableStatus === 0 ? "草稿" : row.enableStatus === 1 ? "已发布" : "" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250">
          <template slot-scope="{ row }">
            <el-button plain type="primary" size="mini" @click="openDialog(1, row)" v-has="'assess:info:query'">查看</el-button>
            <el-button plain type="warning" size="mini" @click="openDialog(3, row)" v-show="row.editStatus" v-has="'assess:info:update'">编辑</el-button>
            <el-button plain type="danger" size="mini" @click="records(row)" v-show="row.cancelStatus" v-has="'assess:info:withdraw'">撤回</el-button>
            <el-button plain type="danger" size="mini" @click="delBtn(row)" v-show="row.deleteStatus" v-has="'assess:info:delete'">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>

    <el-dialog :title="dialogTitle" :visible="dialogVisible" width="60%" @close="closeDialog(false)" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="dialog ">
          <el-row :span="24" class="el-row-data dialog-form">
            <el-col :span="12" class="dialog-form-item mb-10">
              <div class="labels">文章标题</div>
              <div class="content">
                <el-input v-model="dialogForm.noticeTitle" :disabled="dialogType === 1" size="mini" maxlength="100"></el-input>
              </div>
            </el-col>
            <el-col :span="12" class="dialog-form-item mb-10">
              <div class="labels">发布人</div>
              <div class="content">
                <el-input v-model="dialogForm.userName" disabled size="mini"></el-input>
              </div>
            </el-col>
            <el-col :span="12" class="dialog-form-item mb-10">
              <div class="labels">文章类型</div>
              <div class="content">
                <el-select v-model="dialogForm.noticeType" :disabled="dialogType === 1" size="mini" style="width:100%">
                  <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </div>
            </el-col>
            <el-col :span="12" class="dialog-form-item mb-10">
              <div class="labels">APP轮播</div>
              <div class="content">
                <!-- <el-checkbox-group v-model="checkList" :disabled="dialogType === 1"> -->
                <!-- (PC端：0, APP端:1，APP与PC端一起发布：2) -->
                <el-checkbox v-model="checked" :disabled="dialogType === 1">启用</el-checkbox>
                <!-- <el-checkbox :label="1">APP端 <i class="el-icon-mobile-phone iconsColor"></i></el-checkbox> -->
                <!-- </el-checkbox-group> -->
              </div>
            </el-col>
            <el-col :span="12" class="dialog-form-item mb-10">
              <div class="labels">文章摘要</div>
              <div class="content">
                <el-input v-model="dialogForm.noticeAbstract" :disabled="dialogType === 1" type="textarea" size="mini" :rows="4" :resize="'none'" maxlength="800"></el-input>
              </div>
            </el-col>
            <el-col :span="12" class="dialog-form-item mb-10">
              <div class="labels w-110">缩 略 图</div>
              <div class="content imgList">
                <div class="imgs" v-if="dialogForm.rotationUrl">
                  <img :src="dialogForm.rotationUrl" alt="" />
                  <div class="mask">
                    <span class="el-icon-zoom-in maskIcon" @click="perImg(dialogForm.rotationUrl)"></span>
                    <span class="maskIcon el-icon-delete" @click="delImg" v-if="dialogType !== 1"></span>
                  </div>
                </div>
                <div class="uploadDiv" @click="clickUpload" v-if="!dialogForm.rotationUrl && dialogType !== 1">
                  <span class="el-icon-plus uploadIcon"></span>
                </div>
                <div v-if="!dialogForm.rotationUrl && dialogType === 1">暂无轮播图</div>
              </div>
            </el-col>
          </el-row>

          <div class="dialognei">
            <span class="dialognei-size">文章内容</span>
            <div class="dialognei-1">
              <myEditor :pro-html="dialogForm.noticeContent" ref="myEditor" v-if="dialogType !== 1 && dialogVisible"></myEditor>
              <myEditorJustLook :pro-html="dialogForm.noticeContent" v-else></myEditorJustLook>
            </div>
          </div>

          <!-- <div class="editor" v-html="dialogForm.noticeContent" v-else></div> -->
        </div>
      </div>
      <div style="height: 10px;" v-if="dialogType == 1"></div>
      <div slot="footer" v-if="dialogType !== 1">
        <el-button size="mini" type="primary" @click="btnOk(0)">保存草稿</el-button>
        <el-button size="mini" type="primary" @click="btnOk(1)">发布文章</el-button>
        <el-button size="mini" @click="closeDialog(false)">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 上传用input框 -->
    <input v-show="false" type="file" ref="imgFiles" id="upload" accept=".jpeg,.jpg,.png" @change="upLoad" />

    <el-dialog title="文章信息" width="60%" top="2vw" :visible="infoDialog" @close="closeInfoDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="infoDialog">
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
    <!-- 预览图片弹框 -->
    <el-dialog :visible.sync="ImgDialog">
      <div class="dialog-form">
        <div class="prevDialog">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import myEditor from "@/components/myEditor/myEditor.vue";
import myEditorJustLook from "@/components/myEditor/myEditorJustLook.vue";
import { getStringImgSrc } from "../../utils/commond";
import COS from "cos-js-sdk-v5";
import Template from "../sms/template.vue";
export default {
  components: { myEditor, myEditorJustLook, Template },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      loading: false,
      tableData: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      inpData: {
        beginTime: "",
        endTime: "",
        noticeType: "",
        keyWord: ""
      },
      searchData: {
        beginTime: "",
        endTime: "",
        noticeType: "",
        keyWord: ""
      },
      typeOptions: [
        { label: "公司新闻", value: 0 },
        { label: "公司公告", value: 1 }
      ],
      dialogTitle: "新增文章",
      dialogVisible: false,
      dialogType: 1,
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
      checkList: [],
      checked: false,
      ImgDialog: false,
      dialogImageUrl: "",
      infoDialog: false,
      pickerOptionsEnd: {
        disabledDate: time => {
          if (this.inpData.beginTime) {
            let d;
            if (typeof this.inpData.beginTime == "string") {
              d = new Date(this.inpData.beginTime).getTime();
            } else {
              d = this.inpData.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      pickerOptionsAnd: {
        disabledDate: time => {
          if (this.inpData.endTime) {
            let d;
            if (typeof this.inpData.endTime == "string") {
              d = new Date(this.inpData.endTime).getTime();
            } else {
              d = this.inpData.endTime.getTime();
            }
            return time.getTime() > d;
          }
        }
      },
      newAddList: [],
      delList: [],
      saveHtml: ""
    };
  },
  mounted() {
    this.searchNoticPage();
  },
  methods: {
    searchNoticPage() {
      let data = {
        ...this.page,
        ...this.searchData
      };
      this.$api.searchNoticPage(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findNoticeById(pkId, bool) {
      this.$api.findNoticeById({ pkId }).then(res => {
        if (res.code === 200) {
          this.dialogForm = res.data;
          this.saveHtml = res.data.noticeContent;
          if (bool) {
            this.infoDialog = true;
          } else {
            if (res.data.publishing === 0) {
              // this.checkList = [0, 1];
              this.checked = true;
            } else {
              this.checked = false;
            }
            this.dialogVisible = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchNoticPage();
    },
    delBtn(row) {
      this.$confirm("确定删除该文章信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.oaNoticeDelete({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.searchNoticPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    records(row) {
      this.$confirm("确定撤回该文章的发布？", "撤回确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.withdrawOaNotice({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("撤回成功");
            this.searchNoticPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    openDialog(type, row) {
      this.dialogType = type;
      if (type === 2) {
        this.dialogForm.userName = this.user.userName;
        this.dialogVisible = true;
        this.dialogTitle = "新增文章";
      } else {
        console.log(this.dialogType);
        this.findNoticeById(row.pkId);
      }
      if (type == 1) {
        this.dialogTitle = "文章信息";
      } else if (type == 3) {
        this.dialogTitle = "编辑文章";
      }
    },
    btnOk(enableStatus) {
      if(this.$refs.myEditor.loading){
        return this.$message.warning("文章内容加载中")
      }
      let date = { ...this.dialogForm, enableStatus, noticeContent: this.$refs.myEditor.html };
      console.log(date);
      if (!date.noticeAbstract) {
        return this.$message.warning("请填写文章摘要");
      }
      if (!date.noticeContent) {
        return this.$message.warning("请填写文章内容");
      }
      if (!date.noticeTitle) {
        return this.$message.warning("请填写文章标题");
      }
      if (!date.noticeType && date.noticeType !== 0) {
        return this.$message.warning("请选择文章类型");
      }
      // if (!this.checkList.length) {
      //   return this.$message.warning("请选择发布平台");
      // }
      if (this.checked) {
        date.publishing = 0;
      } else {
        date.publishing = 1;
      }
      if (!date.rotationUrl) {
        return this.$message.warning("请上传缩略图");
      }
      this.loading = true;
      if (this.dialogType === 2) {
        this.$api
          .oaNoticeAdd(date)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.closeDialog(true);
              this.searchNoticPage();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else if (this.dialogType === 3) {
        this.$api
          .oaNoticeUpdate(date)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.closeDialog(true);
              this.searchNoticPage();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    closeDialog(isDel) {
      if (this.$refs.myEditor) {
        let arr = getStringImgSrc(this.$refs.myEditor.html);
        let arr2 = JSON.parse(JSON.stringify(this.$refs.myEditor.newAddList));
        if (!isDel) {
          this.delList = [];
          this.delFiles(isDel, arr, arr2);
        } else {
          this.newAddList = [];
          this.$refs.myEditor.newAddList = [];
          this.delFiles(isDel, arr);
        }
        this.$refs.myEditor.html = "";
      }
      this.dialogVisible = false;
      // this.checkList = [];
      this.saveHtml = "";
      this.checked = false;
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
    delFiles(isDel, newImgList, ediNewAddList) {
      let urls = [];
      let imgList = getStringImgSrc(this.saveHtml);
      let arr = [];
      let ediDelList = [];

      if (newImgList && newImgList.length) {
        if (imgList.length) {
          imgList.forEach(item => {
            if (!newImgList.includes(item)) {
              arr.push(item);
            }
          });
        }
      } else {
        arr = !isDel ? imgList : [];
      }
      ediNewAddList &&
        ediNewAddList.forEach(item => {
          if (!newImgList.includes(item)) {
            ediDelList.push(item);
          }
        });
      if (!isDel) {
        if (this.dialogType === 2) {
          urls = [...this.newAddList, ...ediNewAddList].join(",");
        } else {
          urls = [...new Set([...this.delList, ...this.newAddList, ...arr, ...ediDelList])].join(",");
        }
      } else {
        urls = [...new Set([...this.delList, ...ediDelList])].join(",");
      }
      if (urls.length) {
        console.log(urls, this.delList, this.newAddList, newImgList, ediNewAddList);
        this.newAddList = [];
        this.delList = [];
        this.$api.delFiles({ urls });
      }
    },
    openInfoDialog(row) {
      this.findNoticeById(row.pkId, true);
    },
    closeInfoDialog() {
      this.infoDialog = false;
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
      this.searchNoticPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchNoticPage();
    },
    clickUpload() {
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
            _this.newAddList.push(path);
            _this.dialogForm.rotationUrl = path;
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
        this.$refs.imgFiles.value = "";
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
            this.$refs.imgFiles.value = "";
            this.loading = false;
            this.$message({
              type: "warning",
              message: res.msg
            });
          }
        })
        .catch(err => {
          this.$refs.imgFiles.value = "";
          this.loading = false;
        });
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },
    // 预览图片
    perImg(row) {
      this.dialogImageUrl = row;
      this.ImgDialog = true;
    },
    // 删除图片
    delImg() {
      this.delList.push(this.dialogForm.rotationUrl);
      this.dialogForm.rotationUrl = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 5px;
  padding: 0 15px;
  font-size: 14px;
  // margin-bottom: 5px;
  .myform {
    align-items: center;
    margin-top: 20px;
  }
  .search-right {
    display: flex;
    align-items: center;
    .el-radio-group {
      display: flex;
    }
  }
}
.dialognei {
  display: flex;
  justify-content: space-between;
}
.dialognei-1 {
  width: 990px;
  margin-right: 20px;
}
.dialognei-size {
  display: flex;
  margin-left: 30px;
}
.search {
  margin-top: 6px;
}
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.dialog-form {
  display: flex;
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
</style>
