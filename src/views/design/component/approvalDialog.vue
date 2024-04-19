<template>
  <div>
    <el-dialog center :title="approvalTitle" top="5vw" :visible="approvalDialog" @close="close(false)" width="70%" v-loading="loading" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <div class="workflowDialog">
          <div class="left-tabs" v-if="[4, 5].includes(appDiaType)">
            <div class="tabs-item" :class="{ currentTab: nowTab === 0 }" @click="nowTab = 0">盖章详情</div>
            <div class="tabs-item" :class="{ currentTab: nowTab === 1 }" @click="nowTab = 1">业务详情</div>
          </div>
          <div :class="{ 'right-content': [4, 5, 6].includes(appDiaType) }" :style="{ width: [4, 5, 6].includes(appDiaType) ? '' : '100%' }">
            <!-- 盖章内容 -->
            <div class="signDetail h600" v-show="nowTab === 0">
              <div class="print-export2">
                <el-button type="primary" class="el-button-primary" v-has="'design:change:out'" size="mini" @click="dataExport">导出</el-button>
                <el-button type="primary" class="el-button-primary" v-has="'design:change:put'" size="mini" @click="dataPrinting">打印</el-button>
              </div>
              <el-tabs v-model="signTab" v-if="[4, 5, 6].includes(appDiaType)">
                <el-tab-pane label="盖章信息" name="1">
                  <div class="signList">
                    <div class="sign-left">
                      <div class="sign-left-item" v-for="(item, index) in signDetail.sealScheduleDetailList" :key="index">
                        <div class="sign-left-item-left"></div>
                        <div class="sign-left-item-right">
                          <div>{{ item.approveTime }}</div>
                          <div class="noTime">
                            审批人:<span>{{ item.sealUnitName }}</span>
                          </div>
                          <div class="noTime">
                            盖章结果:<span :class="{ red: false, green: false }">{{ item.approveResult }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="sign-right">
                      <signPdf v-for="(item, index) in signDetail.sealTableList" :key="index" :urlr="item.tableUrl"> </signPdf>
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
                            <div v-if="approveSum != null && beginRow" class="circle-icon-right">
                              <i class="el-icon-arrow-left icon-right-left"></i>
                            </div>
                          </div>
                          <div class="begin-details">
                            <div>{{ datas.createUserName }}</div>
                            <div>{{ datas.createTime }}</div>
                            <div>发起流程</div>
                          </div>
                        </div>

                        <div class="flow-char-item" v-for="(item, index) in signDetail.sealApproveDetailVo.taskFinishList" :key="index">
                          <div class="char-item-left" :class="{ 'char-item-pass': item.approveStatus == 2, 'char-item-nopass': item.approveStatus == 1 }">
                            <div class="char-item-left-name">
                              <img src="../../../assets/avg.svg" alt="" />
                              <div>{{ item.activityName }}</div>
                            </div>
                            <div class="down-arrow">
                              <i class="el-icon-arrow-down arrow"></i>
                            </div>
                            <div class="circle-icon-right" v-show="item.approveStatus == 3">
                              <i class="el-icon-arrow-left icon-right-left"></i>
                            </div>
                            <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'right-arrow': item.approveStatus == 3, 'right-arrow2': item.approveStatus == 1 }"></div>
                            <div v-show="approveSum > index || approveSum == index" :class="{ 'upper-right': item.approveStatus != 1, 'upper-right2': item.approveStatus == 1 }"></div>
                            <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'turn-down': item.approveStatus == 1, 'turn-down2': item.approveStatus == 3 }">{{ item.approveStatus == 1 ? "审批不通过" : "撤回" }}</div>
                          </div>
                          <div class="char-item-right">
                            <div>{{ item.assignee ? item.assignee : "跳过" }}</div>
                            <div v-if="item.endTime != null">{{ item.endTime }}</div>
                            <div v-if="item.approveStatus == 2">审批通过</div>
                            <div v-if="item.approveStatus == 1">审批不通过</div>
                          </div>
                        </div>
                        <div class="flow-char-end">
                          <div class="circle">
                            <div class="circle-item"></div>
                            <div class="end">结束</div>
                          </div>
                          <div class="begin-details"></div>
                        </div>
                      </div>
                    </div>
                    <div class="approListTable table-data">
                      <el-table stripe style="width: 100%" height="100%" :data="signDetail.sealApproveDetailVo.approveDetailList" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
                        <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
                        <el-table-column label="流程节点" align="center" prop="activityName"> </el-table-column>
                        <el-table-column label="负责人" align="center" prop="approver" show-overflow-tooltip></el-table-column>
                        <el-table-column label="审批意见" align="center" prop="approveComment" show-overflow-tooltip></el-table-column>
                        <el-table-column label="审批时间" align="center" prop="approveTime" show-overflow-tooltip> </el-table-column>
                        <el-table-column align="center" label="操作">
                          <template slot-scope="{ row }">
                            <el-button plain @click="checkSignNodes(row)" type="primary" size="mini" v-show="row.approveStatus != 2">查看</el-button>
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
            <div class="appDialog" v-show="nowTab === 1" v-if="appDiaType != 6">
              <!-- 左侧流程图 -->
              <div class="bpmns" v-if="![0].includes(datas.changesStatus) && approvalDialog">
                <div class="flow-chart-box h-500">
                  <div class=" flow-char-begin">
                    <div class="circle">
                      <div class="circle-item"></div>
                      <div class="circle-icon-bottom">
                        <i class="el-icon-arrow-down circle-icon"></i>
                      </div>
                      <div v-if="approveSum != null && beginRow" class="circle-icon-right">
                        <i class="el-icon-arrow-left icon-right-left"></i>
                      </div>
                    </div>
                    <div class="begin-details">
                      <div>{{ showData.createUserName }}</div>
                      <div>{{ showData.createTime }}</div>
                      <div>发起流程</div>
                    </div>
                  </div>

                  <div class="flow-char-item" v-for="(item, index) in showData.taskFinishVoList.slice(1)" :key="index">
                    <div class="char-item-left" :class="{ 'char-item-pass': item.approveStatus == 2, 'char-item-nopass': item.approveStatus == 1 }">
                      <div class="char-item-left-name">
                        <img src="../../../assets/avg.svg" alt="" />
                        <div>{{ item.activityName }}</div>
                      </div>
                      <div class="down-arrow" :class="{ blue: !!item.blue }">
                        <i class="el-icon-arrow-down arrow"></i>
                      </div>
                      <div class="circle-icon-right" v-show="item.approveStatus == 3">
                        <i class="el-icon-arrow-left icon-right-left"></i>
                      </div>
                      <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'right-arrow': item.approveStatus == 3, 'right-arrow2': item.approveStatus == 1 }"></div>
                      <div v-show="approveSum > index || approveSum == index" :class="{ 'upper-right': item.approveStatus != 1, 'upper-right2': item.approveStatus == 1 }"></div>
                      <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'turn-down': item.approveStatus == 1, 'turn-down2': item.approveStatus == 3 }">{{ item.approveStatus == 1 ? "审批不通过" : "撤回" }}</div>
                    </div>
                    <div class="char-item-right">
                      <div>{{ item.assignee ? item.assignee : "跳过" }}</div>
                      <div v-if="item.endTime != null">{{ item.endTime }}</div>
                      <div v-if="item.approveStatus == 2">审批通过</div>
                      <div v-if="item.approveStatus == 1">审批不通过</div>
                    </div>
                  </div>
                  <div class="flow-char-end">
                    <div class="circle">
                      <div class="circle-item"></div>
                      <div class="end">结束</div>
                    </div>
                    <div class="begin-details"></div>
                  </div>
                </div>
              </div>
              <div :class="{ 'wh-100per': [0, 7].includes(datas.changesStatus), 'wh-ok': ![0, 7].includes(datas.changesStatus) }">
                <el-tabs v-model="activeName" type="card">
                  <el-tab-pane label="变更内容详情" name="first">
                    <div ref="contentTable" class="table-height" :class="{ 'h-350': appDiaType === 2, 'h-500': appDiaType !== 2 }">
                      <table v-if="!state" style=" width: 100%; margin: 2px auto; border-collapse: collapse;table-layout:fixed;word-break:break-all;">
                        <tbody>
                          <tr style="text-align:center" v-if="[2, 3, 9].includes(user.orgType)">
                            <td colspan="2">项目</td>
                            <td colspan="3">{{ datas.fkProjectName }}</td>
                            <td colspan="2">标段</td>
                            <td colspan="3">{{ datas.fkBidProjectName }}</td>
                          </tr>
                          <tr style="text-align:center" v-if="user.orgType === 4">
                            <td colspan="2">标段</td>
                            <td colspan="8">{{ datas.fkBidProjectName }}</td>
                          </tr>
                          <tr style="text-align:center">
                            <td colspan="2">变更名称</td>
                            <td colspan="3">
                              <p>{{ datas.changesName }}</p>
                            </td>
                            <td colspan="2">变更申请日期</td>
                            <td colspan="3">{{ datas.createTime }}</td>
                          </tr>
                          <tr style="text-align:center">
                            <td colspan="2">变更申请发起单位</td>
                            <td colspan="3">{{ datas.fkOrgName }}</td>
                            <td colspan="2">变更申请发起人</td>
                            <td colspan="3">{{ datas.createUserName }}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="text-align:center">变更类型</td>
                            <td colspan="8">{{ datas.fkWorkflowTemplateName }}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="text-align:center">变更原因</td>
                            <td colspan="8">
                              <p style="min-height:80px">{{ datas.changesReason }}</p>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="text-align:center">变更理由</td>
                            <td colspan="8">
                              <p style="min-height:80px">{{ datas.changesPlan }}</p>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="text-align:center">估算成本</td>
                            <td colspan="8">
                              <p style="min-height:80px">{{ datas.changesCost }}</p>
                            </td>
                          </tr>
                          <tr v-for="(item, idx) in approveDetailList" :key="idx" style="p">
                            <td colspan="2" class="max-wh-20" style="text-align:center">
                              <div>{{ item.activityName }}</div>
                              <div>{{ item.assignee }}</div>
                            </td>
                            <td colspan="8" style="text-align:left">
                              <p>评审意见:</p>
                              <p style="min-height:80px">{{ item.comment }}</p>
                              <div class="commontBottom">
                                <div>签名/盖章：</div>
                                <div class="signDiv">
                                  <img class="signImg" :src="item.signUrl" alt="" />
                                </div>
                              </div>
                              <div class="commontBottom">
                                <div>日期：</div>
                                <div class="signDiv">{{ item.endTime }}</div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div style="width:100%;height:100%;margin:0 auto" v-if="state && approvalDialog">
                        <pdf v-for="item in pageTotalNum" :key="item" style="width:100%" :page="item" :src="pdfUrl"></pdf>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane :label="item.tableName" :name="'userTables' + index" v-for="(item, index) in tableDTOS" :key="index">
                    <div class="tab-box" :class="{ 'h-350': appDiaType === 2, 'h-500': appDiaType !== 2 }" @scroll="handleScroll">
                      <div class="text-html" v-if="tableStatus">
                        <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
                          <tr v-for="(item, idx) in item.tableHtml" :key="idx" style="" v-show="item.status">
                            <td style="box-sizing: content-box;border:none;margin:0;padding:0" :contentEditable="i.attributeTypes == 1 && i.disabled == true && i.checkout == false && appDiaType !== 1 && (i.id == '' || i.id == user.pkId || i.name == '')" @blur="tdBlur(item, id, $event.target.innerText, $event, i)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                              <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                              <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" :disabled="i.id != '' && i.id == user.pkId && i.name != ''" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
                              <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:<img width="100px" crossorigin="anonymous" :src="i.signatureDate.img" alt=""/></span>
                              <el-select ref="scroll" v-if="i.attributeTypes == 2" size="mini" :disabled="i.id != '' && i.id == user.pkId && i.name != ''" v-model="i.name" placeholder="请选择">
                                <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                              </el-select>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <div class="mask" v-if="[1, 4, 5, 6].includes(appDiaType)"></div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="附件" name="third">
                    <div class="table-height table-data" :class="{ 'h-350': appDiaType === 2, 'h-500': appDiaType !== 2 }">
                      <el-table :data="accessoryList" height="80%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" @selection-change="handleSelectionChange" :tooltip-effect="'light'">
                        <el-table-column align="center" type="selection" width="55"> </el-table-column>
                        <el-table-column align="center" label="序号" type="index" width="60"> </el-table-column>

                        <el-table-column align="center" prop="fileName" label="附件名称">
                          <template slot-scope="{ row }">
                            <div class="ellipsistwo">{{ row.fileName }}</div>
                          </template>
                        </el-table-column>
                        <el-table-column align="center" prop="createUserName" label="上传人" show-overflow-tooltip> </el-table-column>
                        <el-table-column align="center" prop="createTime" label="上传时间" show-overflow-tooltip> </el-table-column>
                        <el-table-column align="center" label="操作">
                          <template slot-scope="{ row }">
                            <el-button plain @click="downloadAcc(row)" size="mini">下载</el-button>
                            <el-button plain @click="preview(row.fileUrl)" type="primary" size="mini">预览</el-button>
                          </template>
                        </el-table-column>
                        <div slot="empty" class="empty" style="width: 100%">
                          <img src="@/assets/empty.svg" class="zanwu" />
                          <span>暂无数据</span>
                        </div>
                      </el-table>
                      <el-button type="primary" class="select-download el-button-primary" v-if="accessoryList.length" @click="downloadMore">选择下载</el-button>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="审批记录" name="fourth" v-if="![0].includes(datas.changesStatus)">
                    <div class="table-height table-data" :class="{ 'h-350': appDiaType === 2, 'h-500': appDiaType !== 2 }">
                      <el-table :data="approvalRecord" style="width: 100%" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
                        <el-table-column align="center" label="序号" type="index" width="60"> </el-table-column>
                        <el-table-column prop="activityName" align="center" label="流程节点"> </el-table-column>
                        <el-table-column prop="approver" align="center" label="审核人" show-overflow-tooltip> </el-table-column>
                        <el-table-column prop="approveComment" align="center" label="建议内容" show-overflow-tooltip> </el-table-column>
                        <el-table-column prop="approveTime" align="center" label="操作时间" show-overflow-tooltip> </el-table-column>
                        <el-table-column align="center" label="操作">
                          <template slot-scope="{ row }">
                            <el-button plain @click="checkNodes(row)" type="primary" size="mini" v-show="row.approveStatus != 2">查看</el-button>
                          </template>
                        </el-table-column>
                        <div slot="empty" class="empty" style="width: 100%">
                          <img src="@/assets/empty.svg" class="zanwu" />
                          <span>暂无数据</span>
                        </div>
                      </el-table>
                    </div>
                  </el-tab-pane>
                </el-tabs>
                <div class="print-export" v-show="[1, 4].includes(appDiaType)">
                  <el-button type="primary" class="el-button-primary" v-has="'design:change:out'" size="mini" @click="dataExport">导出</el-button>
                  <el-button type="primary" class="el-button-primary" v-has="'design:change:put'" size="mini" @click="dataPrinting">打印</el-button>
                </div>
                <div class="appDialog-bottom" v-if="appDiaType === 2">
                  <div class="appCommond">
                    <div class="appDialog-bottom-head">审批意见</div>
                    <div class="appDialog-bottom-main" style="padding:0">
                      <div class="appSta">
                        <!-- <div class="mr-6">同意</div> -->
                        <!-- <div style="display:flex;align-item:center">
                          <el-radio v-model="formData.approveStatus" :label="1">提交意见</el-radio>
                          <el-radio v-model="formData.approveStatus" :label="0">驳回</el-radio>
                        </div> -->
                        <el-input v-model="formData.approveComment" maxlength="150" :autosize="{ minRows: 4, maxRows: 8 }" @input="appOpinionInput" type="textarea" resize="none" placeholder="请输入审批意见"> </el-input>
                        <!-- </div> -->
                        <!-- <div style="display:flex;">
                        <div class="mr-6">审批意见:</div>
                        <div style="display:flex;align-item:center">
                          <el-input v-model="formData.approveComment" maxlength="150" @input="appOpinionInput"
                            type="textarea" resize="none" placeholder="请输入审批意见"> </el-input>
                        </div> -->
                      </div>
                    </div>
                  </div>
                  <div class="fileUpload">
                    <div class="appDialog-bottom-head">上传附件</div>
                    <div class="appDialog-bottom-main">
                      <div class="appFile">
                        <div class="uploadBtn" @click="uploading" v-if="appFileList.length < 10">
                          <i class="el-icon-upload icons"></i>
                          <div>上传</div>
                        </div>
                        <div class="fileList appFileList">
                          <div class="fileList-item" v-for="(row, idx) in appFileList" :key="idx">
                            <!-- <i class="el-icon-document fileIcon"></i> -->
                            <div class="fileName" :title="row.fileName" @click="preview(row.fileUrl)">{{ row.fileName }}</div>
                            <span class="delFile" @click="removefile(row, idx)">X</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" v-if="appDiaType === 2 && !siStatus" @click="btnOk(1)">提交意见</el-button>
        <el-button type="primary" @click="signerClick" @keyup.space.native.prevent @keyup.prevent @keydown.enter.native.prevent :disabled="loading" v-if="appDiaType === 2 && siStatus">签名</el-button>
        <el-button type="danger" v-if="appDiaType === 2" @click="btnOk(0)">驳回</el-button>
        <el-button type="danger" v-if="appDiaType === 3 || appDiaType === 6" @click="withdrawActivity(datas.pkId)">撤回申请</el-button>
        <el-button type="primary" plain @click="close(false)">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + url" v-if="previewType == 1"></iframe>
        <img class="img" :src="url" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <approveCodeDialog ref="approveCodeDialog" :approveCodeDialog.sync="approveCodeDialog" @closeLoading="closeLoading" :signed="signed" :app-status="appStatus" :sign-date="signDate" @approveOk="approve" :noApprove="appDiaType == 2 ? false : true" :biz-type="3" :siStatus="siStatus" @signature="signature" :appCodeType="appCodeType" @getNew="getNew"/>
    <nodeDetail :dialogVisible2.sync="dialogVisible2" :getData="nodeData"></nodeDetail>
    <nodeStarDetail :dialogShow.sync="dialogVisible3" :getData="nodeData"></nodeStarDetail>
    <!-- 上传使用的input -->
    <input v-show="false" type="file" ref="files1" id="uploads" @change="upLoad" />
    <div style="position: absolute;left: -9999999px;" v-if="tableStatus">
      <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="pdfTable" v-for="(items, index) in pdfTable" :key="index" :id="'pdfDom' + index">
        <tr v-for="(item, idx) in items" :key="idx" style="" v-show="item.status">
          <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
            <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
            <!-- <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" v-model="i.name" size="mini"></el-input> -->
            <span v-if="i.attributeTypes == 1 && i.checkout == 1">{{ i.name }}</span>
            <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:<img width="100px" crossorigin="anonymous" :src="i.signatureDate.img" alt=""/></span>
            <!-- <el-select v-if="i.attributeTypes == 2" size="mini" v-model="i.name" placeholder="请选择">
              <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
            </el-select> -->
            <span v-if="i.attributeTypes == 2">{{ i.name }}</span>
          </td>
        </tr>
      </table>
    </div>
    <chapterProcessApproval :chaptersApprovalDialog.sync="chaptersApprovalDialog" :not-now="true" :not-now-data="nodeData"></chapterProcessApproval>
    <!-- <approveCodeDialog ref="approveCodeDialog" :approveCodeDialog.sync="approveCodeDialog" :sign-date="signDate" @approveOk="projectExamine" @close="loading = false" :biz-type="1" :siStatus="siStatus" @signature="signature" /> -->
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
import nodeDetail from "./nodeDetail.vue";
import signPdf from "../../../components/signPdf/signPdf.vue";
import chapterProcessApproval from "../../../components/inChapter/chapterProcessApproval2.vue";
import Template from "../../sms/template.vue";
import nodeStarDetail from "./nodeStarDetail.vue";
export default {
  components: { pdfPiev, pdf, approveCodeDialog, nodeDetail, signPdf, chapterProcessApproval, Template, nodeStarDetail },
  watch: {
    siStatus(val) {
      if (val) {
        this.signed = false;
      } else {
        this.signed = true;
      }
    },
    approvalDialog(val) {
      if (val) {
        this.activeName = "first";
        if ([4, 5, 6].includes(this.appDiaType)) {
          this.nowTab = 0;
        } else {
          this.nowTab = 1;
        }
        if (this.appDiaType === 2) {
          // this.findNextUser(this.showData.fkWorkflowTemplateId, this.showData.fkFlowCaseId, this.showData.currentNodeId);
          // deleteFlag为判定是否撤回后该审批人的附件
          this.accessoryList = this.showData.fileList.filter(item => !item.deleteFlag);
          this.appFileList = this.showData.fileList.filter(item => item.deleteFlag);
        } else {
          this.accessoryList = this.showData.fileList;
        }
        // 查看审批完成的pdf
        if (this.state) {
          this.getNumPages(this.pdfUrl);
        }
        this.datas = { ...this.showData };
        // if (this.showData.hisProcessDiagram) {
        //   this.bpmnImg = this.showData.hisProcessDiagram;
        //   this.bpmnShow = false;
        // } else {
        //   this.bpmnShow = true;
        //   this.bpmnImg = this.showData.preProcessDiagram;
        //   this.$nextTick(() => {
        //     this.init("canvans");
        //   });
        // }
        this.approveSum = null;
        this.showData.taskFinishVoList.slice(1).forEach((item, index) => {
          if (item.approveStatus == 1 || item.approveStatus == 3) {
            this.approveSum = index;
            if (item.approveStatus == 1) {
              this.beginRow = true;
            }
          }
          if (item.currentNodeId == this.showData.currentNodeId) {
            this.showData.taskFinishVoList[index].blue = true;
          }
        });
        this.approvalRecord = this.showData.approveDetailList ? this.showData.approveDetailList.map(item => ({ ...item })) : [];
        this.approveDetailList = this.showData.taskFinishSignVos ? this.showData.taskFinishSignVos : [];
        this.$nextTick(() => {
          this.nowTab === 1 && this.$refs.contentTable.scrollTo(0, 0);
        });
        this.signDetail = this.showData.sealBusinessVo
          ? this.showData.sealBusinessVo
          : {
              sealApproveDetailVo: {},
              sealScheduleDetailList: [],
              sealTableList: []
            };
        this.tableDTOS = this.showData.workflowTableList ? this.showData.workflowTableList : [];
        if (this.tableDTOS) {
          this.pdfTable = [];
          let arr1 = JSON.stringify(this.tableDTOS);
          this.modifiedList = JSON.parse(arr1);

          this.modifiedList.forEach(item => {
            item.tableHtml = utils.unzip(item.tableHtml);
          });
          this.tableDTOS.forEach(item => {
            item.tableHtml = this.utils.unzip(item.tableHtml);
            if (item.tableHtml instanceof Array) {
            } else {
              item.tableHtml = JSON.parse(item.tableHtml);
            }
            this.pdfTable.push(item.tableHtml);
            this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
          });
        }
        this.randomKey = Math.random();
        if (this.appDiaType === 2) {
          // this.siStatus = true;
          const roleId = this.showData.roleId;
          const sysRoleId = this.showData.sysRoleId;
          this.$api.getApproveStatus().then(res => {
            this.appCodeType = res.data;
            if (res.data == 2 || res.data == 3) {
              this.siStatus = true;
              this.tableDTOS.forEach(item => {
                if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
                  item.tableHtml.forEach(e => {
                    e.arr.forEach(i => {
                      if (i.attributeTypes == 3) {
                        if (roleId == i.signatureDate.signer) {
                          i.signatureDate.img = "";
                        }
                        if (sysRoleId == i.signatureDate.signer) {
                          i.signatureDate.img = "";
                        }
                      }
                    });
                  });
                }
              });
            }
          });

          // 擦尼玛
        }
        this.signDate = {
          fkBizId: this.showData.pkId,
          fkNodeId: this.showData.currentNodeId,
          fkTemplateId: this.showData.fkWorkflowTemplateId
        };
      } else {
        this.nowTab = 1;
        this.signTab = "1";
        this.beginRow = false;
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
    showData: {},
    //弹框展示状态 1为查看 2为处理 3为撤回 4为盖章中查看,5为已办查看,6盖章撤回
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
      datas: {},
      approvalOptions: [],
      activeName: "first",
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
      beginRow: false,
      dialogVisible2: false,
      nodeData: {},
      randomKey: Math.random(),
      signDetail: {
        sealApproveDetailVo: {},
        sealScheduleDetailList: [],
        sealTableList: []
      },
      modifiedList: [],
      chaptersApprovalDialog: false,
      isApprove: true, //判断是否审批
      siStatus: false,
      tableStatus: true,
      dialogVisible3: false,
      signed: false,
      appCodeType: 0
    };
  },
  methods: {
    getNew() {
      this.siStatus = false;
      this.signed=false
      const roleId = this.showData.roleId;
      const sysRoleId = this.showData.sysRoleId;
      this.$api.getApproveStatus().then(res => {
        this.appCodeType = res.data;
        if (res.data == 2 || res.data == 3) {
          this.siStatus = true;
          this.tableDTOS.forEach(item => {
            if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
              item.tableHtml.forEach(e => {
                e.arr.forEach(i => {
                  if (i.attributeTypes == 3) {
                    if (roleId == i.signatureDate.signer) {
                      i.signatureDate.img = "";
                    }
                    if (sysRoleId == i.signatureDate.signer) {
                      i.signatureDate.img = "";
                    }
                  }
                });
              });
            }
          });
        }
      });
    },
    signature(res) {
      if (this.pdfTable.length != 0) {
        this.pdfTable.forEach(item => {
          item.forEach(e => {
            e.arr.forEach(i => {
              if (i.attributeTypes == 3) {
                if (i.signatureDate.signer == this.showData.roleId || i.signatureDate.signer == this.showData.sysRoleId) {
                  i.signatureDate.img = res.data.url;
                }
              }
            });
          });
        });
      }
      this.approveDetailList.filter(item => item.currentNodeId === this.datas.currentNodeId)[0].signUrl = res.data.url;
      this.tableDTOS.forEach(item => {
        if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
          item.tableHtml.forEach(e => {
            e.arr.forEach(i => {
              if (i.attributeTypes == 3) {
                if (i.signatureDate.signer == this.showData.roleId || i.signatureDate.signer == this.showData.sysRoleId) {
                  i.signatureDate.img = res.data.url;
                  this.tableStatus = false;
                  this.tableStatus = true;
                  this.siStatus = false;
                }
              }
            });
          });
        }
      });
      this.siStatus = false;
    },
    signerClick() {
      this.signDate = {
        fkBizId: this.showData.pkId,
        fkNodeId: this.showData.currentNodeId,
        fkTemplateId: this.showData.fkWorkflowTemplateId
      };
      // console.log(this.$refs.approveCodeDialog);
      this.$refs.approveCodeDialog.getApproveStatus(true);
    },
    checkSignNodes(row) {
      let data = {
        flowCaseId: row.flowCaseId,
        nodeId: row.currentNodeId,
        taskId: row.taskId
      };
      this.$api.searchByBusinessNode(data).then(res => {
        if (res.code === 200) {
          this.nodeData = res.data.sealDetailVo;
          this.chaptersApprovalDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查看审批记录详情
    checkNodes(row) {
      let data = {
        flowCaseId: row.flowCaseId,
        nodeId: row.currentNodeId,
        taskId: row.taskId
      };
      this.$api.searchByBusinessNode(data).then(res => {
        if (res.code === 200) {
          this.nodeData = res.data.changeDesignDetailVo;
          if (data.nodeId == 0) {
            this.dialogVisible3 = true;
          } else {
            this.dialogVisible2 = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
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
    btnOk(val) {
      // if (this.bottomShow && !this.formData.approveId && this.formData.approveStatus === 1) {
      //   return this.$message.warning("请选择下一审批人");
      // }
      let title = val === 1 ? "确认审批" : "确认驳回";
      this.$confirm(title, "审批提醒", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.isApprove = true;
        this.formData.approveStatus = val;
        console.log(this.showData);
        // if(data.workflowTableList.length){
        //   data.data.workflowTableList.forEach(item=>{

        //   })
        // }
        this.loading = true;
        // if (val == 0) {
        //   return this.approve();
        // }
        this.$refs.approveCodeDialog.getApproveStatus(null, val === 0);
      });
      // this.approve()
    },
    closeLoading() {
      this.loading = false;
    },
    // 审批接口
    approve(unique) {
      if (this.isApprove) {
        const tableData = JSON.parse(JSON.stringify(this.tableDTOS));
        let num1 = tableData.filter(item => item.convertPdfStatus == 1).length;
        if (tableData.length) {
          tableData.forEach((item, idx) => {
            item.tableHtml = JSON.stringify(item.tableHtml);
            if (this.modifiedList[idx].tableHtml == item.tableHtml) {
              item.isModified = 0;
            } else {
              item.isModified = 1;
            }
            item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
          });
        }
        this.accountability(tableData, unique);
        return;
        if (num1 > 0) {
          tableData.forEach((item, idx) => {
            // return console.log(tableData)
            if (item.convertPdfStatus == 1) {
              htmlToPdfUpload
                .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
                .then(res => {
                  const _this = this;
                  uploadObjectPdf(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                    tableData[idx].tablePdfUrl = url;
                    // console.log("xxxxxxxxxxxx");
                    // console.log(idx);
                    // console.log("xxxxxxxxxxxx");
                    let num2 = tableData.filter(item => item.convertPdfStatus == 1 && !!item.tablePdfUrl).length;

                    if (num1 == num2) {
                      _this.accountability(tableData);
                    }
                  });
                });
            }
          });
        } else {
          this.accountability(tableData);
        }
      } else {
        if (this.appDiaType == 6) {
          this.loading = true;
          // 撤回签章
          this.$api
            .revocationWithdrawSeal({ pkId: this.datas.pkId, unique })
            .then(res => {
              this.closeLoading();
              if (res.code === 200) {
                this.$message.success("撤回成功");
                this.getList();
                this.close(true);
              } else {
                this.$message.warning("撤回失败");
              }
            })
            .catch(() => {
              this.closeLoading();
            });
        } else {
          this.loading = true;
          this.$api
            .withdrawActivity({ changeId: this.datas.pkId, unique })
            .then(res => {
              this.closeLoading();
              if (res.code === 200) {
                this.$message.success("撤回成功");
                this.getList();
                this.close(true);
              } else {
                this.$message.warning("撤回失败");
              }
            })
            .catch(() => {
              this.closeLoading();
            });
        }
      }
    },
    accountability(tableData, unique) {
      let data = { ...this.formData, pkId: this.datas.pkId, fileList: [...this.accessoryList, ...this.appFileList], workflowTableList: tableData, unique };
      if (!data.approveComment && data.approveStatus === 0) {
        data.approveComment = "驳回";
      } else if (!data.approveComment && data.approveStatus === 1) {
        data.approveComment = "审批通过";
      }
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
      if (this.appFileList.filter(item => item.fileName == filename).length) {
        return this.$message.warning("已有相同名字附件");
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
        let fileList = this.selectDownloadList.map(item => ({ fileUrl: item.fileUrl, fileName: item.fileName }));
        this.$api.compressFile({ fileName: "附件" + Date.now(), fileList }).then(res => {
          console.log("压缩包", res);
          if (res.code === 200) {
            this.fileLinkToStreamDownload(res.data, this.datas.changesName + "-附件", "zip");
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
      xhr.onload = function() {
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
      this.isApprove = false;
      this.signDate = {
        fkBizId: this.showData.pkId,
        fkNodeId: this.showData.currentNodeId,
        fkTemplateId: this.showData.fkWorkflowTemplateId
      };
      this.loading = true;
      this.$refs.approveCodeDialog.getApproveStatus();
      // 撤回审批流程
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
      this.$emit("close");
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      this.siStatus = false;
      this.signed=false
      this.formData = {
        approveComment: "", //审批意见
        pkId: "", //设计变更主键
        approveStatus: 1, //审批状态 0 拒绝 1 同意
        fileList: [] //附件列表
      };
      this.tableDTOS = [];
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
      let nokong =val.trim()
      let nokong2 =item.arr[id].name.trim()
      if(nokong2 == nokong){
        return
      }
      item.arr[id].name = val;
      e.target.innerText = item.arr[id].name;
      if (i.disabled) {
        // let data = JSON.parse(sessionStorage.getItem("user"))
        i.id = this.user.pkId;
      }
      if (!nokong) {
        i.id = "";
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
  position: relative;
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
      /deep/ .el-textarea__inner {
        width: 100% !important;
        border: none;
      }
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
  height: 110px;
  overflow: auto;
  .fileList-item {
    display: flex;
    align-items: center;
    // margin-right: 10px;

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
    .signImg {
      width: 100px;
    }
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
  top: 6px;
  right: 20px;
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
      .blue {
        background: #dafba9;
        border-color: #dafba9;
        .arrow {
          color: #70b603;
        }
      }
      .circle-icon-right {
        position: absolute;
        width: 25px;
        border-top: 1px solid;
        top: 27px;
        right: -27px;
        .icon-right-left {
          position: absolute;
          bottom: -7px;
          left: -5px;
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
        height: 52px;
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
      .turn-down2 {
        position: absolute;
        background: #ffff;
        left: 110px;
        top: 52%;
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

  .flow-char-end {
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
        background-color: #000;
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

    .end {
      position: absolute;
      top: 0;
      right: -15px;
    }

    .begin-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 60px;
      // text-align: center;
      // border: 1px dashed;
      font-size: 11px;
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
</style>
