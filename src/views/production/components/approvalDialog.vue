<template>
  <div>
    <el-dialog center :title="approvalTitle" top="5vw" :visible="approvalDialog" @close="close(false)" width="70%"
      v-loading="loading" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <div class="workflowDialog">
          <div class="left-tabs">
            <div class="tabs-item" :class="{ currentTab: nowTab === 0 }" @click="nowTab = 0">盖章详情</div>
            <div class="tabs-item" :class="{ currentTab: nowTab === 1 }" @click="nowTab = 1">业务详情</div>
          </div>
          <div :class="{ 'right-content': [4, 5].includes(appDiaType) }"
            :style="{ width: [4, 5].includes(appDiaType) ? '' : '100%' }">
            <div class="signDetail h600" v-if="nowTab === 0">
              <div class="print-export2">
                <el-button type="primary" class="el-button-primary" v-has="'design:change:out'" size="mini"
                  @click="dataExport">导出</el-button>
                <el-button type="primary" class="el-button-primary" v-has="'design:change:put'" size="mini"
                  @click="dataPrinting">打印</el-button>
              </div>
              <el-tabs v-model="signTab">
                <el-tab-pane label="盖章信息" name="1">
                  <div class="signList">
                    <div class="sign-left">
                      <div class="sign-left-item" v-for="(item, index) in signDetail.sealScheduleDetailList" :key="index">
                        <div class="sign-left-item-left"></div>
                        <div class="sign-left-item-right">
                          <div>{{ item.approveTime }}</div>
                          <div class="noTime">审批人:<span>{{ item.approver }}</span></div>
                          <div class="noTime">盖章结果:<span :class="{ red: false, green: false }">{{ item.approveResult
                          }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="sign-right">
                      <signPdf v-for="(item, index) in signDetail.sealTableList" :key="index" :urlr="item.tableUrl">
                      </signPdf>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="本单位审批信息" name="2">
                  <div class="approList">
                    <div class="bpmns">
                      <div class="flow-chart-box h540">
                        <div class=" flow-char-begin">
                          <div class="circle">
                            <div class="circle-item"></div>
                            <div class="circle-icon-bottom">
                              <i class="el-icon-arrow-down circle-icon"></i>
                            </div>
                            <div v-if="approveSum != null" class="circle-icon-right">
                              <i class="el-icon-arrow-left icon-right-left"></i>
                            </div>
                          </div>
                          <div class="begin-details">
                            <div>{{ datas.createUserName }}</div>
                            <div>{{ datas.createTime }}</div>
                            <div>发起流程</div>
                          </div>
                        </div>

                        <div class="flow-char-item" v-for="(item, index) in signDetail.sealApproveDetailVo.taskFinishList"
                          :key="index">
                          <div class="char-item-left"
                            :class="{ 'char-item-pass': item.approveStatus == 2, 'char-item-nopass': item.approveStatus == 1 }">
                            <div class="char-item-left-name">
                              <img src="../../../assets/avg.svg" alt="" />
                              <div>{{ item.activityName }}</div>
                            </div>
                            <div v-if="index != signDetail.sealApproveDetailVo.taskFinishList.length - 1"
                              class="down-arrow">
                              <i class="el-icon-arrow-down arrow"></i>
                            </div>
                            <div v-show="item.approveStatus == 1 || item.approveStatus == 3"
                              :class="{ 'right-arrow': item.approveStatus == 3, 'right-arrow2': item.approveStatus == 1 }">
                            </div>
                            <div v-show="approveSum > index || approveSum == index"
                              :class="{ 'upper-right': item.approveStatus != 1, 'upper-right2': item.approveStatus == 1 }">
                            </div>
                            <div v-show="item.approveStatus == 1 || item.approveStatus == 3" class="turn-down">{{
                              item.approveStatus == 1 ? "审批不通过" : "撤回" }}</div>
                          </div>
                          <div class="char-item-right">
                            <div>{{ item.assignee ? item.assignee : "跳过" }}</div>
                            <div v-if="item.endTime != null">{{ item.endTime }}</div>
                            <div v-if="item.approveStatus == 2">审批通过</div>
                            <div v-if="item.approveStatus == 1">审批不通过</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="approListTable table-data">
                      <el-table stripe style="width: 100%" height="100%"
                        :data="signDetail.sealApproveDetailVo.approveDetailList"
                        :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
                        <el-table-column label="序号" type="index" width="60" align="center" show-overflow-tooltip> </el-table-column>
                        <el-table-column label="流程节点" align="center" prop="activityName" show-overflow-tooltip> </el-table-column>
                        <el-table-column label="负责人" align="center" prop="approver" show-overflow-tooltip></el-table-column>
                        <el-table-column label="审批意见" align="center" prop="approveComment" show-overflow-tooltip></el-table-column>
                        <el-table-column label="审批时间" align="center" prop="approveTime" show-overflow-tooltip> </el-table-column>
                        <el-table-column align="center" label="操作">
                          <template slot-scope="{ row }">
                            <el-button plain @click="checkSignNodes(row)" type="primary" size="mini">查看</el-button>
                          </template>
                        </el-table-column>
                        <div slot="empty" class="empty" style="width: 100%">
                          <img src="@/assets/empty.svg" class="zanwu" />
                          <span>暂无数据</span>
                        </div>
                      </el-table>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
            <!-- 审批信息 -->
            <div class="dialog-form" v-if="nowTab === 1">
              <div class="business-details">
                <el-tabs v-model="activeName" type="card" class="box-dialog">
                  <el-tab-pane label="基本信息" name="basicInform">
                    <el-header>
                      <ul class="aside">
                        <li class="aside-li">
                          <div class="aside-div-left">流程名称</div>
                          <div class="aside-div-right">
                            <el-tooltip effect="dark" :content="itemData.processName" placement="bottom-start">
                              <span>{{ itemData.processName }}</span>
                            </el-tooltip>
                          </div>
                        </li>
                        <li class="aside-li">
                          <div class="aside-div-left">分项工程</div>
                          <div class="aside-div-right">
                            <el-tooltip effect="dark" :content="basicInfo.itemName" placement="bottom-start">
                              <span>{{ basicInfo.itemName }}</span>
                            </el-tooltip>
                          </div>
                        </li>
                        <li class="aside-li">
                          <div class="aside-div-left">所属单位工程</div>
                          <div class="aside-div-right">
                            <el-tooltip effect="dark" :content="basicInfo.unitItemName" placement="bottom-start">
                              <span>{{ basicInfo.unitItemName }}</span>
                            </el-tooltip>
                          </div>
                        </li>
                        <li class="aside-li">
                          <div class="aside-div-left">所属分部工程</div>
                          <div class="aside-div-right">
                            <el-tooltip effect="dark" :content="basicInfo.partItemName" placement="bottom-start">
                              <span>{{ basicInfo.partItemName }}</span>
                            </el-tooltip>
                          </div>
                        </li>
                        <li class="aside-li" v-if="itemData.itemType == 1">
                          <div class="aside-div-left">本次填高</div>
                          <div class="aside-div-right">{{ itemData.currentFillHeight }}米</div>
                        </li>
                        <li class="aside-li" v-if="itemData.itemType == 1 && itemData.approveStatus != 2">
                          <div class="aside-div-left">施工后剩余填高</div>
                          <div class="aside-div-right">{{ itemData.distanceSurface }}米</div>
                        </li>
                        <li class="aside-li" v-if="itemData.itemType == 2">
                          <div class="aside-div-left">本次施工进尺</div>
                          <div class="aside-div-right">{{ itemData.distanceSurface }}米</div>
                        </li>
                        <li class="aside-li" v-if="itemData.itemType == 2 && itemData.approveStatus != 2">
                          <div class="aside-div-left">施工后剩余进尺</div>
                          <div class="aside-div-right">{{ itemData.fillHeight - itemData.distanceSurface }}米</div>
                        </li>
                        <li class="aside-li">
                          <div class="aside-div-left">设计工作量</div>
                          <div class="aside-div-right">
                            {{ basicInfo.designQuantities }}
                          </div>
                        </li>
                        <li class="aside-li">
                          <div class="aside-div-left">完成状态</div>
                          <div class="aside-div-right">
                            {{ itemData.itemApproveStatus == 1 ? "已完成" : "未完成" }}
                          </div>
                        </li>
                        <li class="aside-li">
                          <div class="aside-div-left">审批完成状态</div>
                          <div class="aside-div-right">
                            {{ itemData.approveStatus == 0 ? "草稿" : itemData.approveStatus == 1 ? "审批中" :
                              itemData.approveStatus == 2 ? "审批完成" : itemData.approveStatus == 3 ? "审批不通过" :
                                itemData.approveStatus == 4 ? "待签章" : itemData.approveStatus == 5 ? "签章中" :
                                  itemData.approveStatus == 6 ? "签章已完成" : "" }}
                          </div>
                        </li>
                        <li class="aside-li">
                          <div class="aside-div-left">审批完成时间</div>
                          <div class="aside-div-right">
                            {{ itemData.approveFinishTime ? itemData.approveFinishTime : "" }}
                          </div>
                        </li>
                      </ul>
                    </el-header>
                    <!-- 右侧 -->
                    <el-main class="dialogMain2">
                      <div class="process-name">{{ proceName }}</div>
                      <!-- <div class="canvas" ref="lookCanva" id="lookCanva" v-html="svgHtml"></div> -->
                      <taskFinishList :list="list"></taskFinishList>
                    </el-main>
                    <!-- </el-container> -->
                  </el-tab-pane>
                  <!-- <el-tab-pane label="审批记录" name="record">
                    <div class="tables table-data">
                      <el-table :data="ApprovalList" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column align="center" label="序号" width="50" type="index" />
                        <el-table-column align="center" label="流程节点" prop="activityName" />
                        <el-table-column align="center" label="所属工序" prop="processName" />
                        <el-table-column align="center" label="负责人" prop="assignee" />
                        <el-table-column align="center" label="审批意见" prop="comment" />
                        <el-table-column align="center" label="审批时间" prop="endTime" />
                        <div slot="empty" class="empty" style="width: 100%">
                          <img src="@/assets/empty.svg" class="zanwu" />
                          <span>暂无数据</span>
                        </div>
                      </el-table>
                    </div>
                  </el-tab-pane> -->
                  <!-- <el-tab-pane label="关联资料" name="associatedData" class="tab-item">
                    <div class="tables table-data">
                      <el-table :data="linkList" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column align="center" width="50" label="序号" type="index" />
                        <el-table-column align="center" label="所属工序" prop="workflowName" />
                        <el-table-column align="center" label="资料类型" prop="bookType">
                          <template slot-scope="{ row }">
                            <span v-if="row.bookType == 0">施工技术规范</span>
                            <span v-if="row.bookType == 1">安全规范</span>
                            <span v-if="row.bookType == 2">验收标准</span>
                            <span v-if="row.bookType == 3">工程图纸</span>
                          </template>
                        </el-table-column>
                        <el-table-column align="center" label="资料名称" prop="bookName" />
                        <el-table-column align="center" label="资料内容" prop="data.content">
                          <template slot-scope="{ row }">
                            <span v-if="row.beginPage == row.endPage">资料第{{ row.beginPage }}页</span>
                            <span v-else>资料第{{ row.beginPage }}~{{ row.endPage }}页</span>
                          </template>
                        </el-table-column>
                        <el-table-column align="center" label="操作">
                          <template slot-scope="{ row }">
                            <el-button size="mini" @click="lookPdf(row)">查看</el-button>
                          </template>
                        </el-table-column>
                        <div slot="empty" class="empty" style="width: 100%">
                          <img src="@/assets/empty.svg" class="zanwu" />
                          <span>暂无数据</span>
                        </div>
                      </el-table>
                    </div>
                  </el-tab-pane> -->
                  <!-- <el-tab-pane label="关联表格" name="associatedList">
                    <el-container>
                      <el-aside class="lf-aside">
                        <div class="tables table-data">
                          <el-table :data="linkTableLift" height="100%" stripe
                            :header-cell-style="{ background: '#f1f6ff' }">
                            <el-table-column align="center" label="流程节点" prop="nodeName" />
                            <el-table-column align="center" label="状态" width="80">
                              <template slot-scope="{ row }">
                                {{ row.nodeTableStatus == 2 ? "已完成" : "未完成" }}
                              </template>
                            </el-table-column>
                            <el-table-column align="center" label="表格">
                              <template slot-scope="scope">
                                <el-radio-group v-model="tableRadio" size="mini"
                                  @change="tabChange(scope.row, scope.$index)">
                                  <el-tooltip class="item" effect="dark" :content="scope.row.tableName" placement="top"
                                    :disabled="scope.row.tableName.length > 4 ? false : true">
                                    <el-radio-button :label="scope.row.pkId" v-if="scope.row.tableName">
                                      {{ scope.row.tableName }}
                                    </el-radio-button>
                                    <el-radio-button :label="scope.row.pkId" v-else>
                                      {{ "表格" }}
                                    </el-radio-button>
                                  </el-tooltip>
                                </el-radio-group>
                              </template>
                            </el-table-column>
                            <div slot="empty" class="empty" style="width: 100%">
                              <img src="@/assets/empty.svg" class="zanwu" />
                              <span>暂无数据</span>
                            </div>
                          </el-table>
                        </div>
                      </el-aside>
                      <el-main class="dialogMain">
                        <div class="html-content">
                          <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
                            <tr v-for="(item, idx) in tabContent" :key="idx" style="" v-show="item.status">
                              <td style="box-sizing: content-box;border:none;margin:0;padding:0"
                                v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row"
                                :colspan="i.span">
                                <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                                <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" v-model="i.name"
                                  :disabled="linkTableLift[rowIndex].editFlag == 0" size="mini"></el-input>
                                <span v-if="i.attributeTypes == 3">
                                  {{ i.signatureDate.content }}:
                                  <el-avatar shape="square" style="width: 30px;height: 20px;" v-if="i.signatureDate.url"
                                    :src="i.signatureDate.url"></el-avatar>
                                </span>
                                <el-select v-if="i.attributeTypes == 2" size="mini"
                                  :disabled="linkTableLift[rowIndex].editFlag == 0" v-model="i.name" placeholder="请选择">
                                  <el-option v-for="(e, index) in i.option" :key="index" :label="e.label"
                                    :value="e.label"></el-option>
                                </el-select>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </el-main>
                    </el-container>
                  </el-tab-pane> -->
                  <!-- <el-tab-pane label="工程量" name="quantities">
                    <div class="tables table-data">
                      <el-table :data="workAmount" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column align="center" label="序号" width="50" type="index" />
                        <el-table-column align="center" label="项目编号" prop="itemCode" />
                        <el-table-column align="center" label="项目名称" prop="itemName" />
                        <el-table-column align="center" label="设计工程量" prop="designQuantities" />
                        <el-table-column align="center" label="已完成工作量" prop="completeQuantities" />
                        <el-table-column align="center" label="完成时间" prop="updateTime">
                          <template slot-scope="{ row }">
                            <span :cleanRed="row">{{ itemData.finishTime ? itemData.finishTime : "" }}</span>
                          </template>
                        </el-table-column>
                        <div slot="empty" class="empty" style="width: 100%">
                          <img src="@/assets/empty.svg" class="zanwu" />
                          <span>暂无数据</span>
                        </div>
                      </el-table>
                    </div>
                  </el-tab-pane> -->
                  <!-- <el-tab-pane label="材料用量" name="materialsNum">
                    <div class="tables table-data">
                      <el-table :data="materials" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column align="center" label="项目名称" prop="itemName" />
                        <el-table-column align="center" label="物料名称" prop="materialName" />
                        <el-table-column align="center" label="物资类别" prop="typeName" />
                        <el-table-column align="center" label="扣款方式" prop="deductionWay" />
                        <el-table-column align="center" label="单位" prop="materialUnitName" />
                        <el-table-column align="center" label="定量供应量" prop="materiaDesignQuantities" />
                        <el-table-column align="center" label="实际使用量" prop="actualUsage" />
                        <div slot="empty" class="empty" style="width: 100%">
                          <img src="@/assets/empty.svg" class="zanwu" />
                          <span>暂无数据</span>
                        </div>
                      </el-table>
                    </div>
                  </el-tab-pane> -->
                  <!-- <el-tab-pane label="附件" name="accessory">
                    <div class="tables table-data">
                      <el-table :data="accessoryList" height="100%" style="width: 100%" stripe
                        :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                        <el-table-column label="流程节点" align="center" prop="processName"> </el-table-column>
                        <el-table-column label="所属工序" align="center" prop="nodeName"> </el-table-column>
                        <el-table-column label="上传人" align="center" prop="createUserName"> </el-table-column>
                        <el-table-column label="上传时间" align="center" prop="createTime"> </el-table-column>
                        <el-table-column label="附件内容描述" align="center">
                          <template slot-scope="{ row }">
                            <el-tooltip effect="dark" :content="row.remark" placement="top">
                              <p class="preRemark">{{ row.remark }}</p>
                            </el-tooltip>
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center">
                          <template slot-scope="{ row }">
                            <el-button size="mini" type="primary" class="previewAcc" @click="preview(row)">
                              预览
                            </el-button>
                            <el-button size="mini" class="downloadAcc" @click="downloadAcc(row)">
                              下载
                            </el-button>
                          </template>
                        </el-table-column>
                        <div slot="empty" class="empty" style="width: 100%">
                          <img src="@/assets/empty.svg" class="zanwu" />
                          <span>暂无数据</span>
                        </div>
                      </el-table>
                    </div>
                  </el-tab-pane> -->
                </el-tabs>
                <!-- <div class="print-export">
          <el-button type="primary" class="el-button-primary" v-has="'production:process:out'" size="mini" @click="dataExport">导出</el-button>
          <el-button type="primary" class="el-button-primary" v-has="'production:process:put'" size="mini" @click="dataPrinting">打印</el-button>
        </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <div slot="footer"> -->
        <!-- <el-button type="primary" class="el-button-primary" v-if="appDiaType === 2" @click="btnOk">审批</el-button> -->
        <!-- <el-button type="danger" v-if="appDiaType === 2" @click="btnOk(0)">驳回</el-button> -->
        <!-- <el-button type="danger" v-if="appDiaType === 3" @click="withdrawActivity(datas.pkId)">撤回申请</el-button> -->
        <!-- <el-button type="primary" plain @click="close(false)">取 消</el-button> -->
      <!-- </div> -->
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + url"
          v-if="previewType == 1"></iframe>
        <img class="img" :src="url" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <approveCodeDialog ref="approveCodeDialog" :approveCodeDialog.sync="approveCodeDialog" @closeLoading="closeLoading" :appCodeType="appCodeType"
      :app-status="appStatus" :sign-date="signDate" @approveOk="approve" :biz-type="3" />
    <!-- <nodeDetail :dialogVisible2.sync="dialogVisible2" :getData="nodeData"></nodeDetail> -->
    <!-- 上传使用的input -->
    <input v-show="false" type="file" ref="files1" id="uploads" @change="upLoad" />
    <div style="position: absolute;left: -9999999px;">
      <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="pdfTable"
        v-for="(items, index) in pdfTable" :key="index" :id="'pdfDom' + index">
        <tr v-for="(item, idx) in items" :key="idx" style="" v-show="item.status">
          <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr"
            :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
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
    </div>
    <chapterProcessApproval :chaptersApprovalDialog.sync="chaptersApprovalDialog" :not-now="true"
      :not-now-data="nodeData"></chapterProcessApproval>
  </div>
</template>

<script>
import pdfPiev from "@/components/pdf-preview/pdf-preview.vue";
import COS from "cos-js-sdk-v5";
import pdf from "vue-pdf-signature";
import approveCodeDialog from "@/components/approveCodeDialog.vue";
import { CustomViewer } from "@/components/customBpmn";
import utils from "@/utils/util";
import htmlToPdf from "@/utils/htmlToPdf";
import { uploadObject } from "@/utils/upload";
import htmlToPdfUpload from "@/utils/htmlToPdfUpload";
import { uploadObjectPdf } from "@/utils/uploadPdf";
import printJs from "print-js";
// import nodeDetail from "./nodeDetail.vue";
import signPdf from '../../../components/signPdf/signPdf.vue';
import chapterProcessApproval from '../../../components/inChapter/chapterProcessApproval2.vue';
import taskFinishList from "@/components/taskFinishList/taskFinishList.vue"
export default {
  components: { pdfPiev, pdf, approveCodeDialog, signPdf, chapterProcessApproval,taskFinishList },
  watch: {
    approvalDialog(val) {
      //   if (val) {
      //     this.activeName = "first";
      //     if ([4,5].includes(this.appDiaType)) {
      //       this.nowTab = 0;
      //     } else {
      //       this.nowTab = 1;
      //     }
      //     if (this.appDiaType === 2) {
      //       // this.findNextUser(this.showData.fkWorkflowTemplateId, this.showData.fkFlowCaseId, this.showData.currentNodeId);
      //       // deleteFlag为判定是否撤回后该审批人的附件
      //       this.accessoryList = this.showData.fileList.filter(item => !item.deleteFlag);
      //       this.appFileList = this.showData.fileList.filter(item => item.deleteFlag);
      //     } else {
      //       this.accessoryList = this.showData.fileList;
      //     }
      //     // 查看审批完成的pdf
      //     if (this.state) {
      //       this.getNumPages(this.pdfUrl);
      //     }
      //     this.datas = { ...this.showData };
      //     // if (this.showData.hisProcessDiagram) {
      //     //   this.bpmnImg = this.showData.hisProcessDiagram;
      //     //   this.bpmnShow = false;
      //     // } else {
      //     //   this.bpmnShow = true;
      //     //   this.bpmnImg = this.showData.preProcessDiagram;
      //     //   this.$nextTick(() => {
      //     //     this.init("canvans");
      //     //   });
      //     // }
      //     this.approveSum = null;
      //     this.showData.taskFinishVoList.forEach((item, index) => {
      //       if (item.approveStatus == 1 || item.approveStatus == 3) {
      //         this.approveSum = index;
      //       }
      //     });
      //     this.approvalRecord = this.showData.approveDetailList ? this.showData.approveDetailList.map(item => ({ ...item })) : [];
      //     this.approveDetailList = this.showData.taskFinishVoList ? this.showData.taskFinishVoList.map(item => ({ ...item })) : [];
      //     this.$nextTick(() => {
      //      this.nowTab===1&& this.$refs.contentTable.scrollTo(0, 0);
      //     });
      //     this.signDetail=this.showData.sealBusinessVo?this.showData.sealBusinessVo:{
      //       sealApproveDetailVo:{},
      //       sealScheduleDetailList:[],
      //       sealTableList:[],
      //     }
      //     this.tableDTOS = this.showData.workflowTableList ? this.showData.workflowTableList : [];
      //     if (this.tableDTOS) {
      //       this.pdfTable = [];
      //       let arr1 = JSON.stringify(this.tableDTOS)
      //       this.modifiedList = JSON.parse(arr1)

      //       this.modifiedList.forEach(item=>{
      //         item.tableHtml = utils.unzip(item.tableHtml);
      //       })
      //       this.tableDTOS.forEach(item => {
      //         item.tableHtml = this.utils.unzip(item.tableHtml);
      //         if (item.tableHtml instanceof Array) {
      //         } else {
      //           item.tableHtml = JSON.parse(item.tableHtml);
      //         }
      //         this.pdfTable.push(item.tableHtml);
      //         this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
      //       });
      //     }
      //     this.randomKey = Math.random();
      //   } else {
      //     this.nowTab = 1;
      //     this.signTab = "1";
      //   }
      if (val) {
        this.signDetail = this.showData.sealBusinessVo ? this.showData.sealBusinessVo : {
          sealApproveDetailVo: {},
          sealScheduleDetailList: [],
          sealTableList: [],
        }
        this.itemData = this.disposeData
        // this.basicInfo = this.disposeData.reItemApproveDtoList[0]; // 基本信息
        // this.proceName = this.disposeData.prodWorkflowTemplate.workflowName;
        this.list = this.disposeData.taskFinishVoList;
        this.ApprovalList = this.disposeData.prodTaskFinishList; // 审批记录
        this.linkList = this.disposeData.bookPdfDTOS; // 关联资料
        this.linkTableLift = this.disposeData.tableDTOS; // 关联表格
        this.workAmount = this.disposeData.prodItemList; // 工程量
        this.materials = this.disposeData.materialItemList; // 材料用量
        // workflowName

        if (this.linkTableLift && this.linkTableLift.length) {
          this.tableRadio = this.linkTableLift[0].pkId;
          this.tabTitle = this.linkTableLift[0].tableName;
          this.tabContent = utils.unzip(this.linkTableLift[0].tableHtml);
          if (this.tabContent instanceof Array) {
          } else {
            this.tabContent = JSON.parse(this.tabContent);
          }
        }
      }
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  props: {
    // 开关
    approvalDialog: {
      type: Boolean
    },
    // 标题
    approvalTitle: {
      type: String,
      default: "变更设计审核详情"
    },
    // 审批的数据
    showData: {
      createUserName: ""
    },
    //弹框展示状态 1为查看 2为处理 3为撤回 4为盖章中查看,5为已办查看
    appDiaType: {
      type: Number
    },
    //是否完成审批
    state: {
      type: Boolean,
      default: false
    },
    pdfUrl: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      nowTab: 1,
      signTab: "1",
      datas: {
        createUserName: ""
      },
      approvalOptions: [],
      activeName: "card",
      accessoryList: [], //审批弹框附件列表
      approvalRecord: [], //审批记录
      show: false, //审批底部展示
      appFileList: [], //审批人上传的附件列表
      formData: {
        approveComment: "", //审批意见
        pkId: "", //设计变更主键
        approveStatus: 1, //审批状态 0 拒绝 1 同意
        fileList: [] //附件列表
      }, //审批时需要传的参数
      previewDialog: false, //预览弹框
      previewType: 1, //预览类型，1为work，excel；2为pdf，3为图片
      url: "", //预览pdf的链接
      pageTotalNum: 0, //pdf总页数
      bpmnImg: "",
      approveDetailList: [],
      bpmnShow: false,
      loading: false,
      selectDownloadList: [], //选择下载列表
      nextAppRole: "", //下一节点审批岗位
      postName: "", //负责岗位
      nowNodeName: "", //当前节点
      bottomShow: false, //审批底部展示
      approveCodeDialog: false,
      appStatus: 0,
      signDate: {},
      tableDTOS: [],
      pdfTable: [],
      pdfTitle: [],
      pdfUrlData: [],
      newAddList: [],
      delList: [],
      approveSum: null,
      dialogVisible2: false,
      nodeData: {},
      randomKey: Math.random(),
      signDetail: {
        sealApproveDetailVo: {},
        sealScheduleDetailList: [],
        sealTableList: [],
      },
      modifiedList: [],
      chaptersApprovalDialog: false,
      itemData: {},
      basicInfo: {},
      proceName: "",
      list: [],
      ApprovalList: [],
      linkList: [],
      linkTableLift: [],
      tableRadio: "",
      tabTitle: "",
      tabContent: "",
      workAmount:[],
      materials:[]
    };
  },
  methods: {
    checkSignNodes(row) {
      let data = {
        flowCaseId: row.flowCaseId,
        nodeId: row.currentNodeId,
        taskId:row.taskId
      }
      this.$api.searchByBusinessNode(data).then(res => {
        if (res.code === 200) {
          this.nodeData = res.data.sealDetailVo
          this.chaptersApprovalDialog = true;
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    // 查看审批记录详情
    checkNodes(row) {
      let data = {
        flowCaseId: row.flowCaseId,
        nodeId: row.currentNodeId,
        taskId:row.taskId
      }
      this.$api.searchByBusinessNode(data).then(res => {
        if (res.code === 200) {
          this.nodeData = res.data.changeDesignDetailVo
          this.dialogVisible2 = true;
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    // =====================打印导出开始=========================
    dataExport() {
      this.loading = true;
      this.pdfUrlData = [];
      if (this.pdfTable.length == 0) {
        let data = {
          engTableExportList: this.pdfUrlData,
          pkId: this.datas.pkId
        };
        this.prodChangesDesignExport(data);
      } else {
        this.pdfTable.forEach((item, idx) => {
          htmlToPdf
            .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false, this.pdfTitle[idx].title.type) //download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
            .then(res => {
              const _this = this;
              let files = uploadObject(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                _this.urlPush(url, 0);
              });
            });
          if (idx + 1 == this.pdfTable.length) {
            return;
          }
        });
      }
    },
    urlPush(url, type) {
      let width = this.pdfTitle[this.pdfUrlData.length].type == "2" ? 842 : 596;
      let height = this.pdfTitle[this.pdfUrlData.length].type == "2" ? 596 : 842;
      this.pdfUrlData.push({ path: url, width: width, height: height, name: this.pdfTitle[this.pdfUrlData.length].title, direction: this.pdfTitle[this.pdfUrlData.length].type });
      if (this.pdfUrlData.length == this.pdfTable.length) {
        let data = {
          engTableExportList: this.pdfUrlData,
          pkId: this.datas.pkId
        };
        if (type === 0) {
          this.prodChangesDesignExport(data);
        } else {
          this.prodChangesDesignPrintPDF(data);
        }
      }
    },
    prodChangesDesignExport(data) {
      this.$api.prodChangesDesignExport(data).then(res => {
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
      this.pdfUrlData = [];
      if (this.pdfTable.length == 0) {
        let data = {
          engTableExportList: this.pdfUrlData,
          pkId: this.datas.pkId
        };
        this.prodChangesDesignPrintPDF(data);
      } else {
        this.pdfTable.forEach((item, idx) => {
          htmlToPdf
            .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false, this.pdfTitle[idx].title.type) //download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
            .then(res => {
              const _this = this;
              let files = uploadObject(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                _this.urlPush(url, 1);
              });
            });
          if (idx + 1 == this.pdfTable.length) {
            return;
          }
        });
      }
    },
    prodChangesDesignPrintPDF(data) {
      this.$api
        .prodChangesDesignPrintPDF(data)
        .then(res => {
          if (res.code == 200) {
            this.loading = false;
            //  window.open(res.data.url);
            printJS({ printable: res.data.url, type: "pdf" });
            // 使用 window.open 为了安全可加下面这行
            // otherWindow.opener = null;
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
    // =====================打印导出结束=========================
    // 查询下一节点负责人
    // findNextUser(workflowTemplateId, flowCaseId, currentNodeId) {
    //   this.loading = true;
    //   this.$api
    //     .findNextUser({ workflowTemplateId, flowCaseId, currentNodeId })
    //     .then(res => {
    //       console.log("负责人", res);
    //       if (res.code === 200) {
    //         if (res.data) {
    //           this.approvalOptions = res.data.sysUserList ? res.data.sysUserList.map(item => ({ ...item, value: item.pkId, label: item.userName })) : [];
    //           this.nextAppRole = res.data.roleName;
    //           this.bottomShow = true;
    //         } else {
    //           this.bottomShow = false;
    //           delete this.formData.approveId;
    //         }
    //         this.loading = false;
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //     })
    //     .catch(err => {
    //       console.error(err);
    //       this.loading = false;
    //     });
    // },
    // 触发上传input框
    uploading() {
      this.$refs.files1.click();
    },
    // 删除附件
    removefile(row, idx) {
      this.delList.push(row.fileUrl);
      this.appFileList.splice(idx, 1);
    },
    btnOk() {
      // if (this.bottomShow && !this.formData.approveId && this.formData.approveStatus === 1) {
      //   return this.$message.warning("请选择下一审批人");
      // }
      if (!this.formData.approveComment && this.formData.approveStatus === 0) {
        this.formData.approveComment = "驳回";
      } else if (!this.formData.approveComment && this.formData.approveStatus === 1) {
        this.formData.approveComment = "审批通过";
      }
      // this.formData.approveStatus = approveStatus;
      console.log(this.showData);
      this.signDate = {
        fkBizId: this.showData.pkId,
        fkNodeId: this.showData.currentNodeId,
        fkTemplateId: this.showData.fkWorkflowTemplateId
      };
      // if(data.workflowTableList.length){
      //   data.data.workflowTableList.forEach(item=>{

      //   })
      // }
      this.loading = true;
      this.$refs.approveCodeDialog.getApproveStatus();
      // this.approve()
    },
    closeLoading() {
      this.loading = false;
    },
    // 审批接口
    approve() {
      const tableData = JSON.parse(JSON.stringify(this.tableDTOS));
      if (tableData.length > 0) {
        tableData.forEach((item, idx) => {
          item.tableHtml = JSON.stringify(item.tableHtml);
          if (this.modifiedList[idx].tableHtml == item.tableHtml) {
            item.isModified = 0
          } else {
            item.isModified = 1
          }
          item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));

          htmlToPdfUpload
            .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
            .then(res => {
              const _this = this;
              uploadObjectPdf(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                tableData[idx].tablePdfUrl = url;
                console.log("xxxxxxxxxxxx");
                console.log(idx);
                console.log("xxxxxxxxxxxx");
                if (idx + 1 === tableData.length) {
                  _this.accountability(tableData);
                }
              });
            });
        });
      } else {
        this.accountability(tableData);
      }
    },
    accountability(tableData) {
      let data = { ...this.formData, pkId: this.datas.pkId, fileList: [...this.accessoryList, ...this.appFileList], workflowTableList: tableData };
      // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxx")
      // console.log(data.workflowTableList)
      // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxx")
      this.loading = true;
      this.$api
        .approvalProcess(data)
        .then(res => {
          console.log("审批", res);
          if (res.code === 200) {
            this.$message.success("操作成功");
            this.close(true);
            this.getList();
          } else {
            if (data.workflowTableList.length != 0) {
              let arr = [];
              data.workflowTableList.forEach(item => {
                arr.push(item.tablePdfUrl);
              });
              let urls = arr.join(",");
              this.$api.delFiles({ urls });
            }
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          if (data.workflowTableList.length != 0) {
            let arr = [];
            data.workflowTableList.forEach(item => {
              arr.push(item.tablePdfUrl);
            });
            let urls = arr.join(",");
            this.$api.delFiles({ urls });
          }
          this.loading = false;
        });
    },
    // 获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";
      const cos = new COS({
        // 必选参数
        getAuthorization: function (options, callback) {
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
          onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
          }
        },
        function (err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            _this.newAddList.push(path);
            _this.appFileList.push({ fileName: _this.$refs.files1.files[0].name, fileUrl: path });
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.files1.value = "";
          } else {
            _this.loading = false;
            _this.$message({
              type: "error",
              message: "上传失败"
            });
            _this.$refs.files1.value = "";
          }
        }
      );
    },
    upLoad() {
      const fileObj = document.getElementById("uploads").files[0];
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      if(this.appFileList.filter(item=>item.fileName == filename).length){
        return this.$message.warning("已有相同名字附件")
      }
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      if (fileObj.size > 5242880) {
        this.$refs.files1.value = "";
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
            console.log("res", res);
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
            _this.$refs.files1.value = "";
          }
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
          this.$message({
            type: "error",
            message: err
          });
          _this.$refs.files1.value = "";
        });
    },
    // 上传腾讯云
    uploadFile(sign, folder, file, filename) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";

      const cos = new COS({
        // 必选参数
        getAuthorization: function (options, callback) {
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
    // 预览
    preview(url) {
      console.log(url);
      if (!url) {
        return this.$message.warning("无法识别的文件");
      }
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
        this.previewType = 1;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else {
        this.$message.warning("该文件无法预览");
      }
    },
    // 附件列表选择
    handleSelectionChange(val) {
      console.log(val);
      this.selectDownloadList = val;
    },
    // 选择下载
    downloadMore() {
      if (!this.selectDownloadList.length) {
        return this.$message.warning("请先选择附件");
      }
      if (this.selectDownloadList.length === 1) {
        this.downloadAcc(this.selectDownloadList[0]);
      } else {
        // let fileUrls = this.selectDownloadList.map(item => item.fileUrl).join(",");
        let fileList = this.selectDownloadList.map(item=>({fileUrl:item.fileUrl,fileName:item.fileName}))
        this.$api.compressFile({ fileName: "附件" + Date.now(), fileList }).then(res => {
          console.log("压缩包", res);
          if (res.code === 200) {
            this.fileLinkToStreamDownload(res.data, res.data.substring(res.data.lastIndexOf("/") + 1), "zip");
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
      // this.selectDownloadList.forEach(item => {
      //   this.downloadAcc(item);
      // });
    },
    // 下载附件
    downloadAcc(row) {
      let exit = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1);
      // if (exit == "pdf" || exit == "html") {
      this.fileLinkToStreamDownload(row.fileUrl, row.fileName, exit);
      // } else {
      //   window.open(row.fileUrl);
      // }
    },
    fileLinkToStreamDownload(url, fileName, type) {
      let xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.setRequestHeader("Content-Type", `application/${type}`);
      xhr.responseType = "blob";
      xhr.onload = function () {
        if (this.status == 200) {
          //接受二进制文件流
          var blob = this.response;
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
    // 撤回
    withdrawActivity(changeId) {
      if (this.state) {
        // 撤回签章
        this.$api.withdrawSeal(changeId).then(res => {
          if (res.code === 200) {
            this.$message.success("撤回成功");
            this.getList();
            this.close(true);
          } else {
            this.$message.warning("撤回失败");
          }
        });
      } else {
        // 撤回审批流程
        this.$api.withdrawActivity({ changeId }).then(res => {
          if (res.code === 200) {
            this.$message.success("撤回成功");
            this.getList();
            this.close(true);
          } else {
            this.$message.warning("撤回失败");
          }
        });
      }
    },
    // 获取PDF总页数
    getNumPages(url) {
      const loadingTask = pdf.createLoadingTask(url);
      loadingTask.promise
        .then(pdf => {
          this.pageTotalNum = pdf.numPages;
        })
        .catch(err => {
          this.$message.warning("pdf 加载失败", err);
        });
    },
    // 关闭弹框
    close(isDel) {
      this.$emit("approvalDialogClose");
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      this.formData = {
        approveComment: "", //审批意见
        pkId: "", //设计变更主键
        approveStatus: 1, //审批状态 0 拒绝 1 同意
        fileList: [] //附件列表
      };
      this.siStatus = false;
      this.appFileList = [];
      this.signDate = {};
      this.show = false;
    },
    // 刷新列表
    getList() {
      this.$emit("getList");
    },
    //创建流程图预览的方法
    init(domId) {
      // 获取到属性ref为“canvas”的dom节点
      document.getElementById(domId).innerHTML = "";
      const canva = this.$refs[domId];
      //新建流程 用dom元素绘画svg ====> canvas
      this.bpmnModeler = new CustomViewer({ container: canva });
      // this.bpmnImg 是xml 后端返回的数据
      this.bpmnModeler.importXML(this.bpmnImg, err => {
        if (err) {
          this.$message.warning("获取流程图失败");
        } else {
          // 这里是成功之后的回调, 可以在这里做一系列事情
          // this.bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
          document.querySelector(".bjs-powered-by").style = "display:none";
        }
      });
    },
    // 审批意见input事件
    appOpinionInput(e) {
      this.approveDetailList.filter(item => item.currentNodeId === this.datas.currentNodeId)[0].comment = e;
    },
    delFiles() {
      let urls = [];
      urls = [...new Set([...this.delList, ...this.newAddList])].join(",");
      if (!urls.length) {
        return;
      }
      this.newAddList = [];
      this.delList = [];
      this.$api.delFiles({ urls });
    },
    // 自定义表格方法
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
      if(!val){
         i.id = ''
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
    }
  }
};
</script>

<style lang="scss" scoped>
.table-height {
  overflow: auto;
}

.appDialog {
  display: flex;
  height: 600px;
  margin-bottom: 0;
  overflow: hidden;

  /deep/ .el-textarea__inner {
    width: 400px;
    height: 85px;
  }

  .appDialog-bottom {
    display: flex;
    width: 100%;
    height: 150px;

    .appCommond,
    .fileUpload {
      flex: 1;
      border: 1px solid #d7d7d7;
    }

    .appDialog-bottom-head {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 30px;
      font-size: 14px;
      // color: #fff;
      background-color: #02a7f0;
    }

    .appSta {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }

    .mr-6 {
      margin-right: 6px;
    }

    .appDialog-bottom-main {
      padding: 6px;
    }

    .appFile {
      display: flex;
      align-items: center;
      height: 100px;

      .uploadBtn {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 80px;
        cursor: pointer;

        .icons {
          font-size: 40px;
          color: #1296db;
        }
      }
    }
  }
}

.fileList {
  display: flex;

  .fileList-item {
    display: flex;
    align-items: center;
    // margin-right: 10px;
    height: 120px;
    overflow: auto;

    .fileName {
      cursor: pointer;
      max-width: 250px;
      overflow: hidden;
      white-space: nowrap;
      /*禁⽌换⾏*/
      text-overflow: ellipsis;
      /*省略号*/
    }

    .delFile {
      cursor: pointer;
      color: red;
      margin-left: 8px;
    }
  }
}

.appFileList {
  flex: 1;
  overflow: auto;
  flex-wrap: wrap;

  .fileList-item {
    vertical-align: bottom;
    margin: 10px;
  }

  .fileIcon {
    font-size: 28px;
  }
}

.h-350 {
  height: 390px;
}

.h-500 {
  height: 530px;
}

.fx-1 {
  flex: 1;
}

.fx-2 {
  flex: 2;
}

.bd-r {
  border-right: 1px solid #ccc;
}

.mt-10 {
  margin-top: 10px;
}

td {
  border: 1px solid #000;
  padding: 10px 0;
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
    background: url("../../../assets/loading.gif") no-repeat center center;
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

.commontBottom {
  display: flex;
  justify-content: end;

  .signDiv {
    width: 200px;
  }
}

.max-wh-20 {
  max-width: 20%;
}

.tac {
  text-align: center;
}

.tab-box {
  position: relative;
  // height: 300px;
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

.wh-150 {
  width: 150px;
}

.print-export {
  position: absolute;
  top: 50px;
  right: 30px;
}

.bpmns {
  width: 300px;
  border: 1px solid #d7d7d7;
  border-left: 0;
}

.wh-100per {
  width: 100%;
}

.wh-ok {
  width: calc(100% - 300px);
}

.flow-chart-box {
  width: 300px;
  height: 100%;
  overflow: hidden auto;

  .flow-char-begin {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .circle {
      width: 90px;
      line-height: 60px;
      text-align: center;
      vertical-align: middle;
      text-align: center;
      position: relative;

      .circle-item {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        border: 1px solid;
        vertical-align: middle;
        display: inline-block;
      }

      .circle-icon-bottom {
        width: 1px;
        height: 40px;
        border-right: 1px solid #70b603;
        position: absolute;
        left: 49%;
        bottom: -34px;

        .circle-icon {
          color: #70b603;
          position: absolute;
          bottom: -9px;
          left: -7px;
        }
      }

      .circle-icon-right {
        position: absolute;
        width: 50px;
        border-top: 1px solid;
        top: 27px;
        left: 73%;

        .icon-right-left {
          position: absolute;
          bottom: -7px;
          left: -5px;
        }
      }
    }

    .begin-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 60px;
      // text-align: center;
      border: 1px dashed;
      font-size: 11px;
    }
  }

  .flow-char-item {
    display: flex;
    justify-content: space-between;
    padding: 20px;

    .char-item-left {
      width: 90px;
      // line-height: 60px;
      text-align: center;
      border: 1px solid;
      vertical-align: middle;
      position: relative;
      border-radius: 5px;

      .char-item-left-name {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60px;
      }

      .down-arrow {
        width: 1px;
        height: 40px;
        border-right: 1px dashed;
        position: absolute;
        left: 49%;

        .arrow {
          position: absolute;
          bottom: -6px;
          left: -7px;
        }
      }

      .right-arrow {
        position: absolute;
        width: 70px;
        border-top: 1px solid;
        top: 78px;
        left: 50%;
      }

      .upper-right {
        position: absolute;
        height: 153px;
        border-right: 1px solid;
        left: 114px;
        bottom: -19px;
      }

      .right-arrow2 {
        position: absolute;
        width: 25px;
        border-top: 1px solid;
        top: 35px;
        left: 89px;
      }

      .upper-right2 {
        position: absolute;
        height: 114px;
        border-right: 1px solid;
        left: 114px;
        bottom: 24px;
      }

      .turn-down {
        position: absolute;
        background: #ffff;
        left: 110px;
        top: -77px;
      }
    }

    .char-item-pass {
      background: #dafba9;
      border-color: #dafba9;

      .down-arrow {
        border-right: 1px solid #70b603;

        .arrow {
          color: #70b603;
        }
      }
    }

    .char-item-nopass {
      background: #f2a6af;
      border-color: #f2a6af;
    }

    .char-item-right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 60px;
      // text-align: center;
      border: 1px dashed;
      // line-height: 60px;
      font-size: 12px;
    }
  }
}

.workflowDialog {
  display: flex;
  width: 100%;

  .left-tabs {
    width: 40px;
    border-right: 1px solid #d7d7d7;

    .tabs-item {
      display: flex;
      align-items: center;
      width: 40px;
      padding: 15px 0;
      border: 1px solid #d7d7d7;
      // border-top: 0;
      border-right: 0;
      writing-mode: vertical-lr;
      cursor: pointer;
    }

    .currentTab {
      background-color: #81d3f8;
      color: #fff;
    }
  }

  .right-content {
    width: calc(100% - 40px);
  }

  .signDetail {
    position: relative;
    padding: 0 10px;

    .approList {
      display: flex;

      .approListTable {
        width: calc(100% - 300px);
        height: 540px;
      }
    }

    .signList {
      display: flex;
      height: 540px;

      .sign-left {
        width: 300px;
        height: 100%;
        overflow: auto;
        padding: 0 20px;

        .sign-left-item {
          display: flex;
          width: 260px;
          height: 100px;
          margin-bottom: 20px;

          .sign-left-item-left {
            width: 10px;
            background-color: #02a7f0;
            border: 1px solid #000;
          }

          .sign-left-item-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 6px;
            // align-items: center;
            border: 1px dashed #000;
            border-left: 0;

            div {
              margin-bottom: 10px;
            }

            .noTime {
              text-indent: 2em;
            }

            .red {
              color: red;
            }

            .green {
              color: #70b603;
            }
          }
        }
      }

      .sign-right {
        width: calc(100% - 300px);
        height: 100%;
        overflow: auto;
      }
    }
  }

  .h540 {
    height: 540px;
  }

  .h600 {
    height: 600px;
  }

  .print-export2 {
    position: absolute;
    top: 6px;
    right: 20px;
    z-index: 1;
  }
}

.business-details{
  .card-header {
  display: flex;
  align-items: center;
  background: $searcHeder;
  height: 80px;

  .head {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;
    align-items: center;

    .el-form {
      display: flex;
      align-items: center;

      .el-select,
      .el-input {
        width: 150px;
      }

      .el-form-item {
        margin-bottom: 0;
      }
    }

    .addBtn {
      margin-top: 5px;
      height: 28px;
    }
  }
}

.dialogMain2 {
  height: 500px;
}

.dialogMain {
  padding: 0;
  // border-right: 1px solid #000;
  margin-left: 10px;
  height: 480px;

  .dialogMain-h1 {
    font-size: 20px;
    text-align: center;
    margin: 5px 0;
  }

  .html-content {
    position: relative;
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

.aside {
  // width: 320px;
  display: flex;
  flex-wrap: wrap;
}

.aside-li {
  display: flex;
  flex: 1;
  margin-bottom: 3px;
  border: 1px solid #bbb3b3;
}

.aside-div-left,
.aside-div-right {
  height: 36px;
  line-height: 36px;
}

.aside-div-left {
  padding: 0 10px;
  width: 120px;
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

.el-radio-group {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 4px;

  .el-radio-button {
    width: 100%;

    /deep/ span {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 发起流程
.launch {
  width: 100px;
  height: 28px;
  margin-top: 7px;
}

/deep/ .el-dialog__footer {
  text-align: center !important;
}

.project-list {
  display: flex;

  .hit {
    cursor: pointer;
  }

  .list-item {
    display: flex;
    align-items: center;
    border: 1px solid #edecec;
    margin-right: 20px;
    margin-bottom: 10px;
    font-size: 14px;

    .larby {
      padding: 8px 5px;
      background-color: #f3f3f3;
      border-right: 1px solid #edecec;
    }

    .item-detels {
      max-width: 170px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 0 10px;

      .el-icon-more {
        border: 1px solid rgb(211, 198, 198);
        margin-left: 10px;
      }
    }

    .item-detels2 {
      max-width: 300px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 0 10px;
    }
  }
}

.flow-chart {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: auto;
}

.process-name {
  position: absolute;
  // top: -3px;
  font-size: 20px;
  font-weight: 600;
  z-index: 10;
  // padding-left: 50px;
  // margin-bottom: 20px;
}

.canvas {
  width: 100%;
  height: 100%;
  overflow: auto;
  text-align: center;
  // object-fit: fill;
}

// 树形工程
.tree-project {
  background-color: #fff0f0;
  position: absolute;
  left: 0px;
  top: 85px;
  border: 1px solid #edc7c7;
  z-index: 999;

  // 头部搜索
  .head-selc {
    display: flex;
    justify-content: space-between;
    padding: 5px 10px;

    .text-select {
      margin-right: 20px;
    }
  }

  // 树形数据
  .tree-list {
    height: 400px;
    overflow: auto;

    // 树形结构让叶子才显示选择框
    /deep/ .el-tree {
      width: 100%;
      height: 400px;
      overflow: auto;

      .label {
        display: block;
        width: 250px;
        overflow: hidden;
        /*超出部分隐藏*/
        white-space: nowrap;
        /*禁⽌换⾏*/
        text-overflow: ellipsis;
        /*省略号*/
      }

      .el-tree-node {
        .is-leaf + .el-checkbox .el-checkbox__inner {
          display: inline-block;
        }

        .el-checkbox .el-checkbox__inner {
          display: none;
        }
      }
    }
  }
}

.btn-serach {
  margin-left: 20px;
  height: 28px;
}

.new-process {
  width: 100%;
  flex: 1;

  /deep/ .el-input__inner {
    border: none;
  }
}

/deep/ .bjs-powered-by {
  display: none;
}

// .box-dialog {
//   height: 600px;
//   /deep/ .el-table__body-wrapper {
//     max-height: 480px;
//     overflow-y: auto;
//   }
// }
.tables {
  height: 500px;

  .empty {
    margin: 140px 0;
  }
}

.lf-aside {
  width: 360px;

  // overflow: auto;
}

.table1 {
  height: 550px;
}

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
    background: url("../../../assets/loading.gif") no-repeat center center;
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
  top: 70px;
  right: 30px;
}
}
</style>
