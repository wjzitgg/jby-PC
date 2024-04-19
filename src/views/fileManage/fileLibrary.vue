<template>
  <div class="app-container" v-loading="loading">
    <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <!-- <el-form-item label="项目" label-width="40px" v-if="user.orgType !== 5">
          <el-select v-model="proId" size="mini" @change="proChange">
            <el-option v-for="item in options" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标段项目" v-if="user.orgType !== 5">
          <el-select v-model="inpData.projectId" size="mini">
            <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)">
          <proSelct @selectIds="selectIds2"></proSelct>
        </el-form-item>
        <el-form-item v-if="typeShow">
          <el-input size="mini" v-model="filterText" placeholder="单位分部分项名称/档案名称" class="wh-200" maxlength="50"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" v-if="typeShow" icon="el-icon-search" class="ml-20 search" @click="btnSearch">查询</el-button>
      </el-form>
      <div class="search-right" v-if="typeShow">
        <el-button size="mini" type="primary" @click="openOperationDialog">批量操作</el-button>
        <el-button size="mini" v-has="'fileManage:fileLibrary:add'" type="primary" @click="openUploadDialog">上传档案</el-button>
      </div>
    </div>
    <el-tree class="filter-tree" v-if="typeShow" :data="data" @node-expand="nodeExpand" node-key="pkId" :props="defaultProps" default-expand-all :filter-node-method="filterNode" ref="tree" :expand-on-click-node="false">
      <span slot-scope="{ node, data }">
        <!-- 这里之后要改为5 -->
        <i v-if="node.level !== 4" class="iconfont iconbumen"></i>
        <i v-else class="iconfont" :class="getFileTypes(data)"></i>
        <span :class="{ blue: node.level === 4 }" @click="node.level === 4 ? preview(data, 1) : ''">{{ node.label }}</span>
        <span class="tree-btns" v-if="node.level === 4">
          <el-button type="text" icon="el-icon-download" class="grey" @click="download(node, data)"></el-button>
          <el-button type="text" icon="el-icon-printer" v-if="getFileTypes(data) !== 'iconyasuobao'" class="grey" @click="printer(node, data)"></el-button>
          <el-button type="text" icon="el-icon-delete" class="del" @click="del(node, data)" v-if="data.archivesType === 1"></el-button>
        </span>
      </span>
    </el-tree>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <el-dialog title="批量操作" :visible="operationDialog" @close="closeOperationDialog" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false" v-loading="loading2">
      <div class="operationDialog dialog-form">
        <div class="operationDialog-head">
          <!-- <el-input size="mini" v-model="filterText2" placeholder="单位分部分项名称/档案名称" class="wh-200"></el-input> -->
          <div>
            <el-button type="primary" size="mini" icon="el-icon-download" :disabled="downDisabled" @click="downloadMore">下载</el-button>
            <el-button type="primary" size="mini" icon="el-icon-printer" :disabled="priDisabled" @click="printerMore">打印</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" :disabled="delDisabled" @click="delMore">删除</el-button>
          </div>
        </div>
        <el-tree class="sel-tree" :data="treeData" @node-expand="nodeExpand" :props="defaultProps" default-expand-all ref="tree2" node-key="pkId" @check-change="checkChange" :filter-node-method="filterNode2" :expand-on-click-node="false" show-checkbox>
          <span slot-scope="{ node }">
            <span :class="{ blue: node.level === 4 }">{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </el-dialog>

    <el-dialog title="上传档案" :visible="uploadDialog" top="10vw" @close="closeUploadDialog" width="40%" v-loading="loading3" center :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="uploadDialog dialog-form">
        <el-form label-width="72px">
          <el-form-item label="分项工程">
            <treeSelect :defaultProps="defaultProps" :nodeKey="'pkId'" :treeList="proTree" @selectIds="selectIds" ref="treeSelect" />
          </el-form-item>
          <el-form-item label="档案名称">
            <el-input size="mini" v-model="form.tableName"></el-input>
          </el-form-item>
          <el-form-item label="上传档案">
            <el-button size="small" type="primary" @click="uploading" v-if="fileList.length < 1">点击上传</el-button>
            <div class="fileList">
              <div class="fileList-item" v-for="(row, idx) in fileList" :key="idx">
                <div class="fileName" :title="row.fileName" @click="preview(row, 2)">{{ row.fileName }}</div>
                <span class="delFile" @click="removefile(row, idx)">X</span>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="uploadDialogOk">保 存</el-button>
        <el-button type="primary" plain @click="closeUploadDialog">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + url" v-if="previewType == 1"></iframe>
        <img class="img" :src="url" alt="" v-if="previewType == 3" />
        <div class="html-content" v-if="previewType == 4">
          <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
            <tr v-for="(item, idx) in tabContent" :key="idx" style="" v-show="item.status">
              <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" v-model="i.name" size="mini"></el-input>
                <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:</span>
                <el-select v-if="i.attributeTypes == 2" size="mini" v-model="i.name" placeholder="请选择">
                  <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                </el-select>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <!-- 上传使用的input -->
    <input v-show="false" type="file" ref="files" id="upload" @change="upLoad" />

    <div style="position: absolute;left: -9999999px;z-index:-1;">
      <!-- <div v-for="(nape, itemIndex) in pdfTable" :key="itemIndex"> -->
      <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="pdfTable" v-for="(items, index) in tablesList" :key="index" :id="'pdfDom' + index">
        <tr v-for="(item, idx) in items" :key="idx" style="" v-show="item.status">
          <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
            <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
            <!-- <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" v-model="i.name" size="mini"></el-input> -->
            <span v-if="i.attributeTypes == 1 && i.checkout == 1">{{ i.name }}</span>
            <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:</span>
            <!-- <el-select v-if="i.attributeTypes == 2" size="mini" v-model="i.name" placeholder="请选择">
              <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
            </el-select> -->
            <span v-if="i.attributeTypes == 2">{{ i.name }}</span>
          </td>
        </tr>
      </table>

      <!-- </div> -->
    </div>
  </div>
</template>

<script>
import { getFileType } from "@/utils/commond";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import COS from "cos-js-sdk-v5";
import treeSelect from "./compoments/treeSelect.vue";
import utils from "@/utils/util";
import { uploadObject } from "@/utils/upload";
import htmlToPdf from "@/utils/htmlToPdf";
import printJs from "print-js";
export default {
  components: { pdfPiev, treeSelect },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    },
    checkList() {
      return this.$refs.tree2 ? this.$refs.tree2.getCheckedNodes(true) : [];
    }
  },
  data() {
    return {
      loading: false,
      loading2: false,
      loading3: false,
      filterText: "",
      filterText2: "",
      inpData: {
        projectId: ""
      },
      searchData: {
        projectId: ""
      },
      data: [],
      defaultProps: {
        children: "children",
        label: "itemName"
      },
      options: [],
      proOptions: [],
      treeData: [],
      proTree: [],
      operationDialog: false,
      uploadDialog: false,
      forOk: true,
      form: {
        evaluateUrl: "",
        fkRecordId: "",
        tableName: ""
      },
      fileList: [],
      previewDialog: false, //预览弹框
      previewType: 1, //预览类型，1为work，excel；2为pdf，3为图片
      url: "", //预览pdf的链接,
      proName: "",
      proId: "",
      downDisabled: false,
      priDisabled: false,
      delDisabled: false,
      tabContent: "",
      tablesList: [],
      newAddList: [],
      typeShow: true
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    filterText2(val) {
      this.$refs.tree2.filter(val);
    }
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
      } else {
        this.$message.error(res.msg);
      }
    });
    if (this.user.orgType !== 5) {
      // this.getAllProject();
    } else {
      this.searchStatsItemFinishFile();
    }
  },
  methods: {
    selectIds2(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.inpData.projectId = arr[1];
          if (isTrue) {
            this.searchData.projectId = arr[1];
          }
        } else {
          this.inpData.projectId = arr[0];
          if (isTrue) {
            this.searchData.projectId = arr[0];
          }
        }
        if (isTrue) {
          this.searchStatsItemFinishFile();
        }
      }
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
    searchStatsItemFinishFile() {
      let data = {};
      if (this.user.orgType !== 5) {
        data.projectId = this.searchData.projectId;
      }
      this.$api.searchStatsItemFinishFile(data).then(res => {
        if (res.code === 200) {
          this.data = res.data;
          this.treeData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchCompleted() {
      let data = {};
      if (this.user.orgType !== 5) {
        data.projectId = this.searchData.projectId;
      }
      this.$api.searchCompleted(data).then(res => {
        if (res.code === 200) {
          this.proTree = res.data;
        }
      });
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          if (this.user.orgType != 5) {
            this.options = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
            if (res.data.length) {
              this.proId = res.data[0].pkId;
              this.allListBidByProId(0, res.data[0].pkId);
            } else {
              this.proId = "";
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId) {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.fkBidProjectId, label: item.fkBidProjectName }));
          if (res.data.length) {
            this.inpData.projectId = res.data[0].fkBidProjectId;
            this.searchData.projectId = res.data[0].fkBidProjectId;
            this.searchStatsItemFinishFile();
          } else {
            this.inpData.projectId = "";
            this.searchData.projectId = "";
            this.data = [];
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    batchDownloadItemFinishRecordTable(engTableExportList, pkIds) {
      this.loading2 = true;
      this.loading = true;
      this.$api
        .batchDownloadItemFinishRecordTable({ engTableExportList, pkIds })
        .then(res => {
          this.loading2 = false;
          this.loading = false;
          if (res.code == 200) {
            this.fileLinkToStreamDownload(res.data.tableFileUrl, res.data.fileName, "pdf");
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
          this.loading = false;
        });
    },
    batchPutItemFinishRecordTable(engTableExportList, pkIds) {
      this.loading2 = true;
      this.loading = true;
      this.$api
        .batchPutItemFinishRecordTable({ engTableExportList, pkIds })
        .then(res => {
          this.loading2 = false;
          this.loading = false;
          if (res.code == 200) {
            // window.open(res.data.tableFileUrl);
            printJs({ printable: res.data.tableFileUrl, type: "pdf" });
            // 使用 window.open 为了安全可加下面这行
            // otherWindow.opener = null;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
          this.loading = false;
        });
    },
    proChange(e) {
      if (e) {
        this.allListBidByProId(0, e);
      }
    },
    download(node, data) {
      console.log("导出");
      if (data.archivesType === 0) {
        this.dataPross([data], 1);
      } else {
        let type = getFileType(data.evaluateUrl);
        if (type === "pdf") {
          this.fileLinkToStreamDownload(data.evaluateUrl, data.itemName, type);
        } else {
          window.open(data.evaluateUrl);
        }
      }
    },
    printer(node, data) {
      console.log("打印");
      this.dataPross([data], 2);
    },
    del(node, data) {
      console.log("删除");
      this.$confirm("确定删除该档案?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delStatsItemFinishFile({ fkRecordIds: data.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.searchStatsItemFinishFile();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    openOperationDialog() {
      this.operationDialog = true;
    },
    checkChange(data, check) {
      if (this.forOk) {
        this.forOk = false;
        let num1 = 0;
        let num2 = 0;
        let num3 = 0;
        this.checkList.forEach(item => {
          if (item.grade !== 4) {
            num1++;
          } else {
            if (this.getFileTypes(item) === "iconyasuobao") {
              num2++;
            }
            if (item.archivesType === 0) {
              num3++;
            }
          }
        });
        // let arr1 = this.checkList.filter(item => item.grade !== 4);
        // let arrs = this.checkList.filter(item => item.grade === 4);
        // let arr2 = arrs.filter(item => this.getFileTypes(item) === "iconyasuobao");
        // let arr3 = arrs.filter(item => item.archivesType === 0);
        if (num1) {
          this.downDisabled = true;
          this.priDisabled = true;
          this.delDisabled = true;
        } else {
          this.downDisabled = false;
          this.priDisabled = false;
          this.delDisabled = false;
        }
        if (num2) {
          this.priDisabled = true;
        } else {
          this.priDisabled = false;
        }
        if (num3) {
          this.delDisabled = true;
        } else {
          this.delDisabled = false;
        }
        console.log(this.downDisabled, this.priDisabled, this.delDisabled);
        this.$nextTick(() => {
          this.forOk = true;
        });
      }
    },
    downloadMore() {
      console.log("批量下载", this.$refs.tree2.getCheckedNodes(true));
      let arr = this.$refs.tree2.getCheckedNodes(true).filter(item => item.grade === 4);
      this.dataPross(arr, 1);
    },
    printerMore() {
      console.log("批量打印", this.$refs.tree2.getCheckedNodes(true));
      let arr = this.$refs.tree2.getCheckedNodes(true).filter(item => item.grade === 4);
      this.dataPross(arr, 2);
    },
    dataPross(arr, type) {
      this.loading2 = true;
      this.loading = true;
      let that = this;
      let engTableExportList = [];
      let pkIds = [];
      arr.forEach(item => {
        if (item.archivesType === 0) {
          if (item.evaluateUrl instanceof Array) {
          } else {
            item.evaluateUrl = JSON.parse(this.utils.unzip(item.evaluateUrl));
          }
          this.tablesList.push(item.evaluateUrl);
          engTableExportList.push({ width: 842, height: 596, name: item.itemName, pkId: item.pkId });
        } else if (item.archivesType === 1) {
          pkIds.push(item.pkId);
        }
      });
      this.$nextTick(() => {
        if (engTableExportList.length) {
          engTableExportList.forEach((item, idx) => {
            htmlToPdf.getPdf("#pdfDom" + idx, item.name, false).then(res => {
              uploadObject(utils.dataURLtoFile(res, item.name), url => {
                engTableExportList[idx].path = url;
                if (idx === engTableExportList.length - 1) {
                  console.log(engTableExportList);
                  this.loading2 = false;
                  this.loading = false;
                  if (type === 1) {
                    that.batchDownloadItemFinishRecordTable(engTableExportList, pkIds);
                  } else {
                    that.batchPutItemFinishRecordTable(engTableExportList, pkIds);
                  }
                }
              });
            });
          });
        } else {
          this.loading2 = false;
          this.loading = false;
          if (type === 1) {
            this.batchDownloadItemFinishRecordTable(engTableExportList, pkIds);
          } else {
            this.batchPutItemFinishRecordTable(engTableExportList, pkIds);
          }
        }
      });
    },
    delMore() {
      console.log("批量删除", this.$refs.tree2.getCheckedNodes(true));
      this.$confirm("确定批量删除已选档案?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let arr = this.$refs.tree2
          .getCheckedNodes(true)
          .filter(item => item.grade === 4)
          .map(item => item.pkId);
        this.$api.delStatsItemFinishFile({ fkRecordIds: arr.join(",") }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.searchStatsItemFinishFile();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    closeOperationDialog() {
      this.$refs.tree2.setCheckedKeys([]);
      this.operationDialog = false;
    },
    openUploadDialog() {
      this.searchCompleted();
      this.uploadDialog = true;
    },
    uploadDialogOk() {
      if (!this.fileList.length) {
        return this.$message.warning("请上传档案文件");
      }
      let data = {
        ...this.form,
        evaluateUrl: this.fileList[0].fileUrl
      };
      this.loading = true;
      this.$api.addStatsItemFinishFile(data).then(res => {
        this.loading = false;
        if (res.code === 200) {
          this.$message.success("新增成功");
          this.newAddList = [];
          this.searchStatsItemFinishFile();
          this.closeUploadDialog();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    selectIds(id, e) {
      console.log(id, e);
      this.form.fkRecordId = e.fkRecordId;
    },
    closeUploadDialog() {
      if (this.$refs.treeSelect) {
        this.$refs.treeSelect.clearable();
      }
      this.delFiles();
      this.uploadDialog = false;
      this.fileList = [];
      this.form = {
        evaluateUrl: "",
        fkRecordId: "",
        tableName: ""
      };
      this.downDisabled = false;
      this.priDisabled = false;
      this.delDisabled = false;
    },
    delFiles() {
      let urls = [];
      urls = this.newAddList.join(",");
      if (!urls.length) {
        return;
      }
      this.newAddList = [];
      this.$api.delFiles({ urls });
    },
    getFileTypes(row) {
      if (row.archivesType === 0) {
        return "iconexcel1";
      } else if (row.archivesType === 1) {
        let url = row.evaluateUrl;
        let type = getFileType(url);
        if (type === "image") {
          return "icontupian";
        } else if (type === "excel") {
          return "iconexcel1";
        } else if (type === "word") {
          return "iconwork1";
        } else if (type === "pdf") {
          return "iconpdf";
        } else {
          return "iconyasuobao";
        }
      }
    },
    btnSearch() {
      this.filterText = "";
      this.searchData = { ...this.inpData };
      this.searchStatsItemFinishFile();
    },
    filterNode(value, data, node) {
      if (!value) return true;
      let parentNode = node.parent,
        labels = [node.label],
        level = 1;
      while (level < node.level) {
        labels = [...labels, parentNode.label];
        parentNode = parentNode.parent;
        level++;
      }
      return labels.some(label => label.indexOf(value) !== -1);
    },
    filterNode2(value, data, node) {
      if (!value) return true;
      let parentNode = node.parent,
        labels = [node.label],
        level = 1;
      while (level < node.level) {
        labels = [...labels, parentNode.label];
        parentNode = parentNode.parent;
        level++;
      }
      return labels.some(label => label.indexOf(value) !== -1);
    },
    // 预览
    preview(row, type) {
      if (row.archivesType === 0) {
        this.loading = true;
        this.previewType = 4;
        if (row.evaluateUrl instanceof Array) {
          this.tabContent = row.evaluateUrl;
        } else {
          this.tabContent = JSON.parse(this.utils.unzip(row.evaluateUrl));
        }
        // this.tabContent = JSON.parse(this.utils.unzip(row.evaluateUrl));
        this.previewDialog = true;
        this.$nextTick(() => {
          this.loading = false;
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else {
        let url = type === 1 ? row.evaluateUrl : row.fileUrl;
        if (!url) {
          return this.$message.warning("无法识别的文件");
        }
        console.log(url);
        let exit = url.substring(url.lastIndexOf(".") + 1);
        let imgList = ["png", "jpg", "jpeg"];
        let orderList = ["docx", "xlsx"];
        this.url = url;
        if (exit === "pdf") {
          this.$refs.pdfPiev.pdfShow = true;
        } else if (imgList.includes(exit)) {
          this.previewType = 3;
          this.previewDialog = true;
          this.$nextTick(() => {
            this.$refs.previewHeight.scrollTo(0, 0);
          });
        } else if (orderList.includes(exit)) {
          this.url = encodeURIComponent(url);
          this.previewType = 1;
          this.previewDialog = true;
          this.$nextTick(() => {
            this.$refs.previewHeight.scrollTo(0, 0);
          });
        } else {
          this.$message.warning("该文件无法预览");
        }
      }
    },
    // 触发上传input框
    uploading() {
      this.$refs.files.click();
    },
    // 删除附件
    removefile(row, idx) {
      this.fileList.splice(idx, 1);
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
            _this.fileList.push({ fileName: _this.$refs.files.files[0].name, fileUrl: path });
            _this.loading3 = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.files.value = "";
          } else {
            _this.loading3 = false;
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
      console.log(document.getElementById("upload").files);
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      if (fileObj.size > 5242880) {
        this.$refs.files.value = "";
        return this.$message.warning("文件大小不能超过5M");
      }
      let sign = "";
      let path = "";
      this.loading3 = true;
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
            this.loading3 = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          console.error(err);
          this.loading3 = false;
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
  padding: 0 20px;
  margin-bottom: 5px;
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
  .search {
    margin-top: 6px;
  }
}
.filter-tree {
  height: 82%;
  overflow: auto;
  font-size: 14px;
  .tree-btns {
    margin-left: 20px;
  }
}
.icontupian,
.iconyasuobao,
.iconexcel1,
.iconwork1 {
  color: #409eff;
}
.iconpdf {
  color: red;
}
.grey {
  color: #606266;
}
.del {
  color: red;
}
.blue {
  color: #02a7f0;
}
.operationDialog-head {
  display: flex;
  //   justify-content: space-between;
}
.sel-tree {
  height: 500px;
  overflow: auto;
}
.fileList {
  display: flex;
  .fileList-item {
    display: flex;
    align-items: center;
    margin-right: 10px;
    .fileName {
      cursor: pointer;
      max-width: 240px;
      overflow: hidden;
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .delFile {
      cursor: pointer;
      color: red;
      margin-left: 8px;
    }
  }
}
.preview {
  /deep/ .el-dialog__headerbtn {
    display: none;
  }
  .previewHeight {
    min-height: 100px;
    max-height: 650px;
    overflow: auto;
    text-align: center;
    background: url("../../assets/loading.gif") no-repeat center center;
    .html-content {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: #fff;
    }
    .html-content:after {
      content: "";
      position: absolute;
      top: 0;
      right: 0px;
      background: transparent;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
  }
  .iframe {
    width: 100%;
    height: 640px;
  }
  .img {
    max-width: 900px;
    // max-height: 610px;
  }
}
</style>
