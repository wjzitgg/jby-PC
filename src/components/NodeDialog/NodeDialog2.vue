<template>
  <div>
    <!-- 节点信息模态框 -->
    <el-dialog :close-on-press-escape="false" title="节点审批" :visible="nodeDialog" @close="closeNodeDialog" width="75%" center v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <!-- 头部信息 -->
        <ul class="aside">
          <li class="aside-li wh25">
            <div class="aside-div-left">处理结果</div>
            <div class="aside-div-right">
              <span>{{ data.approveStatusStr }}</span>
            </div>
          </li>
          <li class="aside-li wh25">
            <div class="aside-div-left">处理岗位</div>
            <div class="aside-div-right">
              <span>{{ data.roleName }}</span>
            </div>
          </li>
          <li class="aside-li wh25">
            <div class="aside-div-left">处理人</div>
            <div class="aside-div-right">{{ data.approver }}</div>
          </li>
          <li class="aside-li wh25">
            <div class="aside-div-left">处理时间</div>
            <div class="aside-div-right">{{ data.approveTime }}</div>
          </li>
          <li class="aside-li wh75">
            <div class="aside-div-left">处理意见</div>
            <div class="aside-div-right">
              <span>{{ data.approveComment }}</span>
            </div>
          </li>
          <li class="aside-li wh25" v-if="data.checkResult&&data.checkResult!==0">
            <div class="aside-div-left">工程评分</div>
            <div class="aside-div-right">
              {{ ["不合格", "合格", "良好"][this.data.checkResult] }}
            </div>
          </li>
        </ul>
        <!-- <el-row :span="24">
          <el-col :span="6">
            <div class="head-flow">
              <span>处理结果:</span>
              <el-input size="mini" disabled v-model="data.approveStatusStr"></el-input>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="head-flow">
              <span>处理岗位:</span>
              <el-input size="mini" disabled :value="data.roleName"></el-input>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="head-flow">
              <span style="width: 66px;">处理人:</span>
              <el-input size="mini" disabled v-model="data.approver"></el-input>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="head-flow">
              <span>处理时间:</span>
              <el-input size="mini" disabled v-model="data.approveTime"></el-input>
            </div>
          </el-col>
          <el-col :span="18">
            <div class="head-flow">
              <span>处理意见:</span>
              <el-input size="mini" v-model="data.approveComment" disabled> </el-input>
            </div>
          </el-col>
          <el-col :span="6" v-if="data.scoreFlag && data.scoreFlag != 0">
            <div class="head-flow">
              <span>工程评分:</span>
              <el-input size="mini" :value="['不合格', '合格', '良好'][this.data.checkResult]" disabled> </el-input>
            </div>
          </el-col>
        </el-row> -->
        <!-- 表单数据 -->
        <div class="tabelsInfo">
          <div class="header">
            表单数据
            <!-- <div class="print-export">
              <el-button type="primary" size="mini" @click="dataExport">导出</el-button>
              <el-button type="primary" size="mini" @click="dataPrinting">打印</el-button>
            </div> -->
          </div>
          <div class="tabelsInfo-main">
            <el-tabs v-model="activeName" type="card">
              <el-tab-pane label="审批流程" name="1">
                <div class="tables table-data">
                  <taskFinishList :list="list" :show="!!data.isApprovalFailedStatus"></taskFinishList>
                </div>
              </el-tab-pane>
              <el-tab-pane :label="item.tableName" :name="`first${index}`" v-for="(item, index) in data.workflowTableList" :key="item.pkId">
                <div class="tab-box" @scroll="handleScroll">
                  <div class="text-html">
                    <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
                      <tr v-for="(item, idx) in item.tableHtml" :key="idx" style="" v-show="item.status">
                        <td style="box-sizing: content-box;border:none;margin:0;padding:0" :contentEditable="false" @blur="tdBlur(item, id, $event.target.innerText, $event, i)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                          <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                          <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" :disabled="true" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
                          <span v-if="i.attributeTypes == 3"
                            >{{ i.signatureDate.content }}:
                            <el-avatar shape="square" style="width: 30px;height: 20px;" v-if="i.signatureDate.url" :src="i.signatureDate.url"></el-avatar>
                          </span>
                          <el-select ref="scroll" v-if="i.attributeTypes == 2" size="mini" :disabled="true" v-model="i.name" placeholder="请选择">
                            <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                          </el-select>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div class="mask" v-if="!show"></div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="工程量" name="third">
                <div class="tables table-data">
                  <el-table height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :data="data.prodItemList">
                    <el-table-column align="center" label="序号" type="index" width="50" />
                    <el-table-column align="center" label="项目编号" prop="itemCode" />
                    <el-table-column align="center" label="项目名称" prop="itemName" />
                    <el-table-column align="center" label="设计工程量" prop="designQuantities">
                      <template slot-scope="{ row }">
                        {{ row.grade == 4 ? row.designQuantities : "" }}
                      </template>
                    </el-table-column>
                    <el-table-column align="center" label="单位" prop="unitName" />
                    <el-table-column align="center" label="本次完成工程量" prop="completeQuantities">
                      <template slot-scope="{ row }">
                        <!-- <el-input size="mini" type="text" :disabled="data.fillHeight === 0 || data.quantitiesTable == 1 || data.itemType != 1" v-model.trim="row.completeQuantities" class="cent" @input="inputFin($event, row, 1)" v-if="row.grade == 4"></el-input> -->
                        <span>{{ row.completeQuantities }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column align="center" label="备注" prop="remark">
                      <template slot-scope="{ row }">
                        <!-- <el-input size="mini" :disabled="disabled" v-model="row.remark" class="cent" v-if="row.grade == 4 && data.quantitiesTable == 2"></el-input> -->
                        <span>{{ row.remark }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>
              <el-tab-pane label="材料用量" name="fourth" v-if="data.materialItemList&&data.materialItemList.length">
                <div class="tables table-data">
                  <el-table height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :data="data.materialItemList">
                    <el-table-column align="center" label="项目名称" prop="itemName" />
                    <el-table-column align="center" label="物料名称" prop="materialName" />
                    <el-table-column align="center" label="物资类别" prop="typeName" />
                    <el-table-column align="center" label="扣款方式" prop="deductionWay" />
                    <el-table-column align="center" label="单位" prop="materialUnitName" />
                    <el-table-column align="center" label="设计使用量" prop="materiaDesignQuantities" />
                    <el-table-column align="center" label="实际使用量">
                      <template slot-scope="{ row }">
                        <!-- <el-input size="mini" type="text" :disabled="!data.stockNumUpdate || data.materialUsedTable == 1" class="cent" v-model.trim="row.actualUsage" @input="inputFin($event, row, 2)"></el-input> -->
                        {{row.actualUsage}}
                      </template>
                    </el-table-column>
                    <el-table-column align="center" label="备注">
                      <template slot-scope="{ row }">
                        <!-- <el-input size="mini" :disabled="disabled || data.materialUsedTable == 1" v-model="row.materialRemark" class="cent"></el-input> -->
                        <span>{{ row.materialRemark }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-tab-pane>
              <el-tab-pane label="附件" name="fifth" v-if="accessoryList.length > 0">
                <div class="tables table-data">
                  <!-- 用单独一个table使用v-if隐藏某些行会导致样式错乱，所以使用2个table -->
                  <el-table :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                    <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                    <el-table-column label="附件内容描述" align="center" prop="remark">
                      <template slot-scope="{ row }">
                        <!-- <el-input v-if="show" v-model="row.remark" size="mini" :disabled="!row.deleteFlag"
                          maxlength="100"></el-input> -->
                        <el-tooltip effect="dark" :content="row.remark" placement="top">
                          <p class="preRemark">{{ row.remark }}</p>
                        </el-tooltip>
                      </template>
                    </el-table-column>
                    <el-table-column label="附件" align="center" width="180">
                      <template slot-scope="{ row }">
                        <!-- <el-button type="primary" size="mini" v-if="!row.fileName" @click="uploadAcc(row)">上传附件
                        </el-button> -->
                        <a href="#" @click="preview(row)">{{ row.fileName }}</a>
                      </template>
                    </el-table-column>
                    <!-- <el-table-column label="操作" align="center" width="100">
                      <template slot-scope="{ row, $index }">
                        <span class="addAcc" v-if="accessoryList.length == $index + 1 && show" @click="addAcc(row)"
                          title="添加">
                          <i class="el-icon-plus"></i>
                        </span>
                        <span class="delAcc" v-if="row.deleteFlag && show" @click="delAcc(row)" title="删除">
                          <i class="el-icon-close"></i>
                        </span>
                        <el-button size="mini" type="primary" class="downloadAcc" v-if="!show" @click="downloadAcc(row)">
                          下载
                        </el-button>
                      </template>
                    </el-table-column> -->
                    <div slot="empty" class="empty" style="width: 100%">
                      <img src="@/assets/empty.svg" class="zanwu" />
                      <span>暂无数据</span>
                    </div>
                  </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <!-- <div class="tabelsInfo-main empty" v-else>
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div> -->
        </div>
      </div>
      <!-- 隐藏的input file,用于上传附件 -->
      <input ref="upload" type="file" style="display:none" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.docx,image/jpg,image/jpeg,image/png,application/pdf" @change="upLoad" />
    </el-dialog>
    <el-dialog :close-on-press-escape="false" :title="preName" :visible.sync="centerDialogVisible" width="70%" center>
      <div class="can-box dialog-form">
        <!-- <div class="pre-name">{{ preName }}</div> -->
        <taskFinishList :list="data.taskFinishVoList" :show="!!data.isApprovalFailedStatus" :current-node-id="data.currentNodeId"></taskFinishList>
        <!-- <div class="pre-can" ref="preCan" id="preCan" :style="{ height: `${hei}px` }" v-html="preImg"></div> -->
      </div>
    </el-dialog>
    <!-- 预览pdf弹框 -->
    <pdfPiev ref="pdfPiev" :urlr="url" :number="number" />
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.fileUrl" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj.fileUrl" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <approveCodeDialog ref="approveCodeDialog" :approveCodeDialog.sync="approveCodeDialog" :siStatus="siStatus" :sign-date="signDate" @closeLoading="closeLoading" @approveOk="handleFlow" :biz-type="0" />
  </div>
</template>

<script>
import BpmnModdle from "bpmn-js";
import { CustomViewer } from "@/components/customBpmn";
import COS from "cos-js-sdk-v5";
import pdfPiev from "../pdf-preview/pdf-preview.vue";
import approveCodeDialog from "@/components/approveCodeDialog.vue";
import printJs from "print-js";
import html2canvas from "html2canvas";
import { from } from "array-flatten";
import utils from "@/utils/util";
import htmlToPdf from "@/utils/htmlToPdf";
import { uploadObject } from "@/utils/upload";
import { uploadObjectPdf } from "@/utils/uploadPdf";
import htmlToPdfUpload from "@/utils/htmlToPdfUpload";
import taskFinishList from "@/components/taskFinishList/taskFinishList.vue";

export default {
  // computed: {
  //       user() {
  //           return JSON.parse(sessionStorage.getItem("user") || "[]");
  //       }
  //   },
  components: {
    // ImgUpload,
    pdfPiev,
    approveCodeDialog,
    taskFinishList
  },
  props: {
    // 控制模态框显示隐藏
    nodeDialog: {
      type: Boolean,
      default: false
    },
    // 显示负责人和模态框下方按钮
    show: {
      type: Boolean,
      default: false
    },
    // 所有数据
    data: {},
    // 管理人
    custodian: {},
    // 负责人
    principal: {
      type: Array
    },
    parentId: "",
    // 根据这个变量角色名字判断显示隐藏下一审批岗位
    comment: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    // 监听负责人变化,如果只有一个让默认选一个，多个就提示选择
    // principal(val) {
    //   if (val.length == 1) {
    //     this.prinIdName2 = val[0].userName;
    //     this.prinId2 = val[0];
    //   }
    // },
    // 监听弹窗状态清空负责人
    nodeDialog(val) {
      if (val == false) {
        this.prinId2 = {};
        this.prinIdName2 = "";
        // this.principal = [];
        if (this.show) {
          this.principal.splice(0, this.principal.length);
        }
        this.activeName = "1";
      } else {
        this.user = JSON.parse(sessionStorage.getItem("user"));
        this.accessoryList = this.data.fileList && this.data.fileList.length ? this.data.fileList : [];
        // if (this.data.workflowTableList && this.data.workflowTableList.length) {
        //   this.activeName = "first0";
        // } else if (this.data.quantitiesTable) {
        //   this.activeName = "third";
        // } else if (!this.data.quantitiesTable && this.data.materialUsedTable) {
        //   this.activeName = "fourth";
        // }
        this.list = this.data.taskFinishVoList ? this.data.taskFinishVoList : [];
        // console.log("=========xxxxxx=============")
        // // console.log(this.data)
        this.pdfTable = [];
        this.pdfTitle = [];
        // // this.$nextTick(() => {
        this.data.workflowTableList.forEach((item, idx) => {
          // if(utils.unzip(item.tableHtml) instanceof Array){
          //   this.pdfTable.push();
          // }
          const items = utils.unzip(item.tableHtml);
          if (items instanceof Array) {
            this.pdfTable.push(items);
          } else {
            this.pdfTable.push(JSON.parse(items));
          }
          this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
        });
        // // })
        // console.log("=========xxxxxx=============")
      }
    },
    previewDialog(val) {
      if (!val) {
        this.nowPreviewObj = {};
      }
    },
    data(val) {
      if (Object.keys(this.data).length > 0) {
        // 处理工程量 设计 与完成量
        if (this.data.quantitiesTable == 1 && this.data.fillHeight == 0) {
          this.data.prodItemList.forEach(item => {
            item.completeQuantities = item.designQuantities;
          });
          console.log("改变工程量");
        }
        // 处理表格
        if (this.data.workflowTableList) {
          this.data.workflowTableList.forEach(item => {
            item.tableHtml = this.utils.unzip(item.tableHtml);
            if (item.tableHtml instanceof Array) {
            } else {
              item.tableHtml = JSON.parse(item.tableHtml);
            }
          });
        }
      }
    }
  },
  data() {
    return {
      pdfTitle: [],
      pdfTable: [],
      activeName: "1",
      prinId2: {
        userName: "",
        pkId: ""
      }, // 负责人选中对象
      prinIdName2: "", // 选中的负责人名字
      score: 1,
      textare: "",
      centerDialogVisible: false,
      preName: "", // 流程图名称
      preImg: "", // 流程图图片
      contentData: [
        {
          tableHead: [
            { prop: "327", label: "序号", type: "text" },
            { prop: "328", label: "污染物项目", type: "text" },
            { prop: "329", label: "验收值", type: "input" },
            { prop: "330", label: "验收结果", type: "select" }
          ],

          tableHtml: []
        }
      ],
      hei: "", // 获取流程图高度
      loading: false,
      number: 1,
      url: "",
      // 附件列表
      accessoryList: [{ id: 1, fileName: "", remark: "", fileUrl: "", deleteFlag: true }],
      // 当前点击表单上传的数据
      nowUploadObj: {},
      // 当前预览的表单obj
      nowPreviewObj: {},
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      // 附件文件类型
      fileType: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpg", "image/jpeg", "image/png", "application/pdf"],
      approveCodeDialog: false,
      user: {},
      auditStatus: 0,
      signDate: {},
      pdfTable: [],
      pdfTitle: [],
      pdfUrl: [],
      list: [],
      siStatus: false
    };
  },
  methods: {
    dataExport() {
      this.loading = true;
      this.pdfUrl = [];
      if (this.pdfTable.length == 0) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.data.pkId
        };
        this.prodProcessApproveExport(data);
      } else {
        this.pdfTable.forEach((item, idx) => {
          htmlToPdf
            .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false, this.pdfTitle[idx].title.type) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
            .then(res => {
              const _this = this;
              const files = uploadObject(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                _this.urlPush(url, 0);
              });
            });
          if (idx + 1 == this.pdfTable.length) {
          }
        });
      }
    },
    urlPush(url, type) {
      const width = this.pdfTitle[this.pdfUrl.length].type == "2" ? 842 : 596;
      const height = this.pdfTitle[this.pdfUrl.length].type == "2" ? 596 : 842;
      this.pdfUrl.push({ path: url, width, height, name: this.pdfTitle[this.pdfUrl.length].title, direction: this.pdfTitle[this.pdfUrl.length].type });
      if (this.pdfUrl.length == this.pdfTable.length) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.data.pkId
        };
        if (type === 0) {
          this.prodProcessApproveExport(data);
        } else {
          this.prodProcessPrintPDF(data);
        }
      }
    },
    prodProcessApproveExport(data) {
      this.$api.prodProcessApproveExport(data).then(res => {
        if (res.code == 200) {
          this.loading = false;
          utils.downFile(res.data.url, res.data.fileName);
          if (data.engTableExportList.length != 0) {
            const arr = [];
            data.engTableExportList.forEach(item => {
              arr.push(item.path);
            });
            const urls = arr.join(",");
            this.$api.delFiles({ urls });
          }
        } else {
          this.loading = false;
          this.$message.warning(res.msg);
          if (data.engTableExportList.length != 0) {
            const arr = [];
            data.engTableExportList.forEach(item => {
              arr.push(item.path);
            });
            const urls = arr.join(",");
            this.$api.delFiles({ urls });
          }
        }
      });
    },
    dataPrinting() {
      this.loading = true;
      this.pdfUrl = [];
      if (this.pdfTable.length == 0) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.data.pkId
        };
        this.prodProcessPrintPDF(data);
      } else {
        this.pdfTable.forEach((item, idx) => {
          htmlToPdf
            .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
            .then(res => {
              const _this = this;
              const files = uploadObject(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                _this.urlPush(url, 1);
              });
            });
          if (idx + 1 == this.pdfTable.length) {
          }
        });
      }
    },
    prodProcessPrintPDF(data) {
      this.$api
        .prodProcessPrintPDF(data)
        .then(res => {
          if (res.code == 200) {
            //  window.open(res.data.url);
            this.loading = false;
            // 使用 window.open 为了安全可加下面这行
            // otherWindow.opener = null;
            printJS({ printable: res.data.url, type: "pdf" });
            if (data.engTableExportList.length != 0) {
              const arr = [];
              data.engTableExportList.forEach(item => {
                arr.push(item.path);
              });
              const urls = arr.join(",");
              this.$api.delFiles({ urls });
            }
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
            if (data.engTableExportList.length != 0) {
              const arr = [];
              data.engTableExportList.forEach(item => {
                arr.push(item.path);
              });
              const urls = arr.join(",");
              this.$api.delFiles({ urls });
            }
          }
        })
        .catch(error => {
          this.loading = false;
          this.$message.warning(error);
          if (data.engTableExportList.length != 0) {
            const arr = [];
            data.engTableExportList.forEach(item => {
              arr.push(item.path);
            });
            const urls = arr.join(",");
            this.$api.delFiles({ urls });
          }
        });
    },
    // 打印
    print() {
      const num = this.activeName.charAt(this.activeName.length - 1) - 0;
      const printContent = this.$refs.printPage[num];
      // 获取dom 宽度 高度
      // console.log(this.activeName)
      // console.log()
      // return console.log(printContent)
      const width = printContent.clientWidth;
      const height = printContent.clientHeight;
      // 创建一个canvas节点
      const canvas = document.createElement("canvas");
      const scale = 4; // 定义任意放大倍数，支持小数；越大，图片清晰度越高，生成图片越慢。
      canvas.width = width * scale; // 定义canvas 宽度 * 缩放
      canvas.height = height * scale; // 定义canvas高度 *缩放
      canvas.style.width = width * scale + "px";
      canvas.style.height = height * scale + "px";
      canvas.getContext("2d").scale(scale, scale); // 获取context,设置scale
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop; // 获取滚动轴滚动的长度
      const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft; // 获取水平滚动轴的长度
      html2canvas(printContent, {
        canvas,
        backgroundColor: null,
        useCORS: true,
        // windowHeight: document.body.scrollHeight,
        scrollX: -scrollLeft, // 解决水平偏移问题，防止打印的内容不全
        scrollY: -scrollTop
      })
        .then(canvas => {
          const url = canvas.toDataURL("image/png");
          printJS({
            printable: url,
            type: "image",
            documentTitle: "", // 标题
            style: "@page{size:auto;margin: 0cm 1cm 0cm 1cm;}" // 去除页眉页脚
          });
        })
        .catch(err => {
          console.error(err);
        });
    },

    handleScroll(val) {
      if (this.$refs.scroll != undefined) {
        this.$refs.scroll.forEach(item => {
          item.blur();
        });
      }
    },
    tdBlur(item, id, val, e, i) {
      if (item.arr[id].checkout == true) {
        return;
      }
      item.arr[id].name = val;
      e.target.innerText = item.arr[id].name;
      if (i.disabled) {
        // let data = JSON.parse(sessionStorage.getItem("user"))
        i.id = this.user.pkId;
      }
      console.log();
    },
    tdNameChange(item, id, val) {
      //  纯数字
      if (item.arr[id].checkType == 1) {
        val = val.replace(/[^0-9]/g, "");
        item.arr[id].name = val;
      }
      // 小数
      if (item.arr[id].checkType == 2) {
        val = val.replace(/[^\d.]/g, "");
        item.arr[id].name = val;
      }
      // 金额
      if (item.arr[id].checkType == 3) {
        val = val.replace(/[^\d.]/g, ""); // 清除“数字”和“.”以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(".", "$#$");
        val = val.replace(/\./g, "");
        val = val.replace("$#$", ".");
        val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
        item.arr[id].name = val;
      }
      // // 日期
      if (item.checkType == 4) {
        val = val.replace(/[^0-9-]/g, "");
        item.arr[id].name = val;
      }
      // 电话号码
      if (item.arr[id].checkType == 5) {
        val = val.replace(/[^0-9]/g, "");
        val = val.slice(0, 11);
        if (val.length >= 11) {
          const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
          if (!reg.test(val)) {
            this.$message.warning("请输入正确的手机号");
            item.arr[id].name = "";
          } else {
            item.arr[id].name = val;
          }
        }
      }
      // 身份证
      if (item.checkType == 6) {
        val = val.replace(/[\u4e00-\u9fa5/\s+/]|[^a-zA-Z0-9\u4E00-\u9FA5]/g, "");
        item.arr[id].name = val;
      }
    },
    tdNameBlur(item, id, val) {
      // 手机号
      if (item.arr[id].checkType == 5) {
        const mobile = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        if (val.length != 0) {
          if (!mobile.test(val)) {
            this.$message.warning("请输入正确的手机号");
            item.arr[id].name = "";
          }
        }
      }

      // 日期
      if (item.arr[id].checkType == 4) {
        const data = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
        if (val.length != 0) {
          if (data.test(val)) {
          } else {
            item.arr[id].name = "";
            return this.$message.warning("请输入正确的时间格式xxxx-xx-xx");
          }
        }
      }
      // 身份证
      if (item.arr[id].checkType == 6) {
        const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        // 15位身份证号码校验正则
        const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
        if (val.length != 0) {
          if (reg.test(val) || regs.test(val)) {
          } else {
            item.arr[id].name = "";
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
    },
    // 点击查看流程图
    bpmnContent(xml) {
      this.preName = this.data.prodWorkflowTemplate.workflowName;
      this.preImg = xml;
      this.centerDialogVisible = true;
      // this.$nextTick(() => {
      //   this.init2("preCan");
      //   // console.log( document.getElementsByClassName('viewport')[0].offsetHeight);
      //   // this.hei = 1000;
      // });
    },

    // 创建流程图预览的方法
    init2(domId) {
      document.getElementById(domId).innerHTML = "";
      const canva = this.$refs[domId];
      this.bpmnModeler = new CustomViewer({ container: canva });
      this.bpmnModeler.importXML(this.preImg, err => {
        if (err) {
          this.$message.warning("获取流程图失败");
        } else {
          // this.bpmnModeler.get("canvas").zoom('fit-viewport', 'auto')
        }
      });
    },

    // 关闭模态框
    closeNodeDialog() {
      this.textare = "";
      this.$emit("update:nodeDialog", false);
      this.$emit("cleanData");
    },

    // 审批通过按钮
    handleApprove() {
      if (this.principal.length > 0 && this.prinIdName2 == "") {
        this.$message.warning("请选择负责人");
        return;
      }
      if (this.data.quantitiesTable) {
        if (this.data.itemFinalState) {
          for (let i = 0; i < this.data.prodItemList.length; i++) {
            if (this.data.itemType == 1 && this.data.fillHeight != 0 && this.data.quantitiesTable == 2 && this.data.prodItemList[i].grade === 4 && !this.data.prodItemList[i].completeQuantities) {
              return this.$message.warning("请填写工程量");
            }
          }
        }
      }
      if ((this.data.materialUsedTable === 2 && this.data.materialItemList && this.data.materialItemList.length) || !this.data.stockNumUpdate) {
        const arr = this.data.materialItemList;
        const arr2 = arr.filter(item => !item.actualUsage);
        if (arr.length === arr2.length) {
          return this.$message.warning("材料实际用量必填");
        }
        if (this.data.materialFinalState) {
          const arr3 = arr.filter(item => item.actualUsage > 0);
          if (arr3.length !== arr.length) {
            return this.$message.warning("最后一个节点必须填完所有的材料用量");
          }
        }
      }
      this.auditStatus = 1;
      this.loading = true;
      this.siStatus = false;
      this.data.workflowTableList.forEach(item => {
        if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
          item.tableHtml.forEach(e => {
            e.arr.forEach(i => {
              if (i.attributeTypes == 3) {
                this.siStatus = this.user.roleList.filter(item => item == i.signatureDate.signatureUnit);
              }
            });
          });
        }
      });
      this.$refs.approveCodeDialog.getApproveStatus();
    },

    handleUnApprove() {
      // this.approveCodeDialog = true;
      // return;
      this.auditStatus = 2;
      this.loading = true;
      this.siStatus = false;
      this.data.workflowTableList.forEach(item => {
        if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
          item.tableHtml.forEach(e => {
            e.arr.forEach(i => {
              if (i.attributeTypes == 3) {
                this.siStatus = this.user.roleList.filter(item => item == i.signatureDate.signatureUnit);
              }
            });
          });
        }
      });
      this.$refs.approveCodeDialog.getApproveStatus();
    },
    closeLoading() {
      this.loading = false;
    },
    handleFlow(img, roleId) {
      let params = {};
      if (this.auditStatus === 1) {
        this.data.workflowTableList.forEach((item, index) => {
          item.tableHtml.forEach((e, idx) => {
            e.arr.forEach((i, id) => {
              if (i.attributeTypes == 3) {
                // this.user.systemRoleList.forEach(s => {
                if (i.signatureDate.signer == roleId && i.signatureDate.url == undefined) {
                  i.signatureDate.id = this.user.pkId;
                  i.signatureDate.url = img;
                }
                // })
              }
            });
          });
        });

        // 获取里面html的值，赋值给tableDTOS 深拷贝

        const tableData = JSON.parse(JSON.stringify(this.data.workflowTableList));
        // console.log(tableData[0].tableHtml);
        // return;
        if (tableData.length > 0) {
          tableData.forEach(item => {
            item.tableHtml = JSON.stringify(item.tableHtml);
            item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
          });
        }
        params = {
          auditStatus: 1,
          pkId: this.parentId,
          approver: this.prinId2.userName,
          fkApproverId: this.prinId2.pkId,
          checkResult: this.score, // 检查评分 0：不合格 1：合格 2：良好
          approveComment: this.textare, // 审批意见
          materialItemList: this.data.materialUsedTable ? this.data.materialItemList : [], // 材料用量集
          prodItemDtoList: this.data.quantitiesTable ? this.data.prodItemList : [], // 工程用量集
          workflowTableList: tableData, // workflowTableList
          currentNodeId: this.data.currentNodeId,
          prodReProcessFileList: this.accessoryList.filter(item => item.fileUrl)
        };
        if (!params.approveComment) {
          params.approveComment = "审批通过";
        }
        // this.$nextTick(() => {
        // console.log("2222222222222222222222222222222")
        // console.log(img)
        // console.log(this.data.workflowTableList)
        // console.log("2222222222222222222222222222222")
        // })
        // return
      } else if (this.auditStatus === 2) {
        params = {
          auditStatus: this.auditStatus,
          pkId: this.parentId,
          approveComment: this.textare,
          currentNodeId: this.data.currentNodeId
        };
        if (!params.approveComment) {
          params.approveComment = "审批不通过";
        }
      }
      this.loading = true;
      if (this.pdfTable.length == 0 || this.auditStatus === 2) {
        this.handleFlows(params);
      } else {
        this.pdfTable.forEach((item, idx) => {
          // htmlToPdfUpload
          //   .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
          //   .then(res => {
          //     const _this = this;
          //     uploadObjectPdf(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
          //       params.workflowTableList[idx].tablePdfUrl = url;
          //       console.log("xxxxxxxxxxxx");
          //       console.log(idx);
          //       console.log("xxxxxxxxxxxx");
          //       if (idx + 1 === params.workflowTableList.length) {
          //         _this.handleFlows(params);
          //       }
          //     });
          //   });
          if (this.data.workflowTableList[idx].convertPdfStatus == 1) {
            htmlToPdfUpload
              .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
              .then(res => {
                const _this = this;
                uploadObjectPdf(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                  params.workflowTableList[idx].tablePdfUrl = url;
                  console.log("xxxxxxxxxxxx");
                  console.log(idx);
                  console.log("xxxxxxxxxxxx");
                  if (idx + 1 === params.workflowTableList.length) {
                    // _this.handleFlows(params);
                    setTimeout(() => {
                      _this.handleFlows(params);
                    }, 3000);
                  }
                });
              });
          }
          if (idx + 1 === params.workflowTableList.length && this.data.workflowTableList[idx].convertPdfStatus != 1) {
            setTimeout(() => {
              this.handleFlows(params);
            }, 10000);
          }
        });
      }
    },
    handleFlows(params) {
      this.$api
        .handleFlow(params)
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.closeNodeDialog();
            this.$emit("cableck");
          } else {
            if (params.workflowTableList.length != 0) {
              const arr = [];
              params.workflowTableList.forEach(item => {
                arr.push(item.tablePdfUrl);
              });
              const urls = arr.join(",");
              this.$api.delFiles({ urls });
            }
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          if (params.workflowTableList.length != 0) {
            const arr = [];
            params.workflowTableList.forEach(item => {
              arr.push(item.tablePdfUrl);
            });
            const urls = arr.join(",");
            this.$api.delFiles({ urls });
          }
          this.loading = false;
        });
    },
    // 负责人下拉选中事件
    personCharge(data) {
      // console.log(data);
      this.prinId2 = data;
    },

    // 查看pdf
    lookPdf2(item) {
      this.url = item.bookUrl;
      this.number = item.beginPage;
      this.$refs.pdfPiev.pdfShow = true;
    },
    // 根据之前保存的表单，处理数据返回到表格的input select里面
    assignData() {
      const dom_class = document.getElementsByClassName("text-html");
      // 循环从多少个calss里面获取input、select
      for (let i = 0; i < dom_class.length; i++) {
        const inpAll = dom_class[i].getElementsByTagName("input");
        const select = dom_class[i].getElementsByTagName("select");
        const textarea = dom_class[i].getElementsByTagName("textarea");
        // console.log(textarea[0]);
        // this.data.workflowTableList[i].tableColumnData == null ? this.data.workflowTableList[i].tableColumnData='' : this.data.workflowTableList[i].tableColumnData;
        for (let z = 0; z < inpAll.length; z++) {
          inpAll[z].style.textAlign = "center";
          if (this.data.workflowTableList[i].tableColumnData) {
            inpAll[z].value = JSON.parse(this.data.workflowTableList[i].tableColumnData).inpData[z];
          }
        }
        for (let a = 0; a < textarea.length; a++) {
          textarea[a].style.textAlign = "center";
          if (this.data.workflowTableList[i].tableColumnData) {
            textarea[a].value = JSON.parse(this.data.workflowTableList[i].tableColumnData).textData[a];
          }
        }
        for (let j = 0; j < select.length; j++) {
          if (this.data.workflowTableList[i].tableColumnData) {
            select[j].options[JSON.parse(this.data.workflowTableList[i].tableColumnData).selData[j]].selected = true;
          }
        }
      }
    },
    // 完成工程量输入框
    inputFin(e, row, type) {
      let val = e;
      val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
      val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
      val = val.replace(/^0+\./g, "0.");
      val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
      val = val.match(/^\d*(\.?\d{0,6})/g)[0] || "";
      if (type == 1) {
        if (val > row.designQuantities) {
          row.completeQuantities = row.designQuantities;
        } else {
          row.completeQuantities = val;
        }
      } else {
        row.actualUsage = val;
      }
    },
    // 添加附件
    addAcc(row) {
      this.accessoryList = [
        ...this.accessoryList,
        {
          id: this.accessoryList[this.accessoryList.length - 1].id + 1,
          fileName: "",
          remark: "",
          deleteFlag: true
        }
      ];
    },
    // 删除附件
    delAcc(row) {
      if (this.accessoryList.length === 1) {
        this.accessoryList = [{ id: 1, fileName: "", remark: "", fileUrl: "", deleteFlag: true }];
      } else {
        this.accessoryList = this.accessoryList.filter(item => item.id !== row.id);
      }
    },
    // 下载附件
    downloadAcc(row) {
      const url = row.fileUrl;
      const name = row.fileName;
      this.fileLinkToStreamDownload(url, name, "pdf");
    },
    fileLinkToStreamDownload(url, fileName, type) {
      const xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.setRequestHeader("Content-Type", `application/${type}`);
      xhr.responseType = "blob";
      xhr.onload = function() {
        if (this.status == 200) {
          // 接受二进制文件流
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
    },
    // 上传按钮
    uploadAcc(row) {
      this.$nextTick(() => {
        this.$refs.upload.click();
      });
      this.nowUploadObj = row;
    },
    // 上传
    upLoad() {
      const fileObj = this.$refs.upload.files[0];
      // console.log(this.$refs.upload.files[0]);
      if (!fileObj) {
        return this.$message({
          type: "warning",
          message: "请选择上传的文件"
        });
      }
      // 判断文件类型
      if (!this.fileType.includes(fileObj.type)) {
        this.$refs.upload.value = "";
        return this.$message.warning("仅支持上传pdf，jpeg，jpg，pdf，docx，xlsx文件");
      }
      const size = 100 * 1024 * 1024;
      if (fileObj.size > size) {
        this.$refs.upload.value = "";
        return this.$message.warning("附件大小最大为100M");
      }
      const f = this.$refs.upload.files;
      const typeName = f[0].name.substr(f[0].name.lastIndexOf(".")).toLowerCase();
      // return console.log(suffixname)
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
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
            this.$options.methods.upLoads.bind(this)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime, typeName);
            // this.$message.success(res.msg);
          } else {
            this.$message.warning(res.msg);
            this.loading = false;
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime, typeName) {
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
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });

      const _this = this;
      cos.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: _this.uploadDate.objectKey + typeName,
          Body: file,
          onProgress: function(progressData) {
            // console.log(JSON.stringify(progressData));
          }
        },
        function(err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            _this.nowUploadObj.fileUrl = path;
            _this.nowUploadObj.fileName = filename;
            const obj = _this.$refs.upload;
            // obj.outerHTML = obj.outerHTML;
            obj.value = "";
            _this.loading = false;
            _this.$message.success("上传成功");
          } else {
            _this.loading = false;
            _this.$message.error("上传失败");
          }
        }
      );
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },
    // 预览
    preview(row) {
      const str = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1);
      if (str == "xlsx" || str == "docx") {
        this.previewType = 1;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (str == "pdf") {
        this.previewType = 2;
        this.number = 1;
        this.url = row.fileUrl;
        this.$refs.pdfPiev.pdfShow = true;
      } else {
        this.previewType = 3;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 10px;

  span {
    margin-right: 10px;
  }

  .dialog-header-item {
    margin: 10px;
  }
}

.header {
  padding: 0 20px;
  font-size: 16px;
  height: 40px;
  line-height: 40px;
  background-color: #81d3f8;
  position: relative;
}

.tabelsInfo {
  margin-top: 10px;
  margin-bottom: 10px;

  .tabelsInfo-h1 {
    font-size: 20px;
    text-align: center;
    margin: 5px 0;
  }
}

.linkInfo-main {
  display: flex;

  .linkInfo-left,
  .linkInfo-middle,
  .linkInfo-right {
    border: 1px solid #000;
  }

  .linkInfo-left {
    flex: 2;

    .linkInfo-left-main {
      display: flex;
      flex-wrap: wrap;
      height: 100px;
      overflow: auto;

      .linkInfo-left-main-item {
        margin: 10px;
      }
    }
  }

  .linkInfo-middle {
    flex: 1;

    .el-radio-group {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: space-around;

      .el-radio {
        padding: 10px;
      }
    }
  }

  .linkInfo-right {
    flex: 2;
  }
}

.iconfont {
  font-size: 24px;
  color: red;
}

/deep/ .el-dialog__body {
  padding: 0 20px;
}

/deep/ .el-dialog--center {
  margin-top: 10vh !important;
}

/deep/ .el-tabs__header {
  margin-bottom: 2px;
}

/deep/ .el-form-item {
  margin-bottom: 0;
}

.head-flow {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  margin-right: 20px;

  span {
    width: 80px;
    margin-right: 4px;
  }

  .max-lab {
    width: 170px;
  }

  .ml {
    margin-left: 20px;
  }
}

.bnpm-img {
  display: block;
  zoom: 0.5;
  cursor: pointer;
  margin: 0 auto;
}

// 流程图弹框的最外层
.can-box {
  // width: 100%;
  height: 650px;
  overflow: scroll;
  padding: 50px;
}

.pre-name {
  font-size: 20px;
  font-weight: 600;
  padding-left: 50px;
  margin-bottom: 20px;
}

.pre-can {
  width: 100%;
  height: 100%;
  overflow: auto;
  text-align: center;
}

.tab-box {
  position: relative;
  height: 500px;
  overflow: auto;

  .text-html {
    input {
      // background-color: red;
      text-align: center;
    }
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  text-align: center;

  img {
    width: 280px;
  }
}

.cent {
  text-align: center;

  /deep/ .el-input__inner {
    text-align: center;
  }
}

.tables {
  height: 500px;
  overflow: scroll;
}

// .el-tabs {
//   height: 500px;
// }

.addAcc {
  cursor: pointer;
  color: green;
  font-size: 20px;
}

.delAcc {
  cursor: pointer;
  color: red;
  font-size: 20px;
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
  }

  .iframe {
    width: 100%;
    height: 640px;
  }

  .img {
    max-width: 900px;
  }
}

.preRemark {
  display: -webkit-box;
  word-break: break-all;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.print-export {
  position: absolute;
  top: 0px;
  right: 30px;
}
.aside {
  // width: 320px;
  display: flex;
  flex-wrap: wrap;
}

.aside-li {
  display: flex;
  // flex: 1;
  // margin-bottom: 3px;
  border: 1px solid #bbb3b3;
}

.wh100 {
  width: 100%;
}
.wh75 {
  width: 75%;
}
.wh50 {
  width: 50%;
}

.wh25 {
  width: 25%;
}

.aside-div-left,
.aside-div-right {
  height: 36px;
  line-height: 36px;
}

.aside-div-left {
  padding: 0 8px;
  width: 130px;
  text-align: right;
  background-color: #ccc;
}

.aside-div-right {
  flex: 1;
  overflow: hidden;
  /*超出部分隐藏*/
  white-space: nowrap;
  /*禁⽌换⾏*/
  text-overflow: ellipsis;
  /*省略号*/
  margin-left: 5px;
  padding-right: 4px;
}
</style>
