<template>
  <div>
    <!-- 查看分项工程item审批流程详情-->
    <el-dialog :close-on-press-escape="false" title="分项工程审批流程详情" top="5vh" :visible="proChangeDialog" @close="btnClose" width="70%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
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
                <el-button type="primary" class="el-button-primary" v-has="'production:process:out'" size="mini" @click="dataExport">导出</el-button>
                <el-button type="primary" class="el-button-primary" v-has="'production:process:put'" size="mini" @click="dataPrinting">打印</el-button>
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
                            盖章单位:<span>{{ item.sealUnitName }}</span>
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
                <el-tab-pane label="本单位审批信息" name="2" v-if="signDetail.sealApproveDetailVo.taskFinishList && signDetail.sealApproveDetailVo.taskFinishList.length">
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

                        <div class="flow-char-item" v-for="(item, index) in signDetail.sealApproveDetailVo.taskFinishList ? signDetail.sealApproveDetailVo.taskFinishList : []" :key="index">
                          <div class="char-item-left" :class="{ 'char-item-pass': item.approveStatus == 2, 'char-item-nopass': item.approveStatus == 1 }">
                            <div class="char-item-left-name">
                              <img src="../../../assets/avg.svg" alt="" />
                              <div>{{ item.activityName }}</div>
                            </div>
                            <div class="down-arrow">
                              <i class="el-icon-arrow-down arrow"></i>
                            </div>
                            <div v-show="item.approveStatus == 1 || item.approveStatus == 3" :class="{ 'right-arrow': item.approveStatus == 3, 'right-arrow2': item.approveStatus == 1 }"></div>
                            <div v-show="approveSum > index || approveSum == index" :class="{ 'upper-right': item.approveStatus != 1, 'upper-right2': item.approveStatus == 1 }"></div>
                            <div v-show="item.approveStatus == 1 || item.approveStatus == 3" class="turn-down">{{ item.approveStatus == 1 ? "审批不通过" : "撤回" }}</div>
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
                            <!-- <div class="circle-icon-bottom">
                              <i class="el-icon-arrow-down circle-icon"></i>
                            </div> -->
                            <div v-if="approveSum != null" class="circle-icon-right">
                              <i class="el-icon-arrow-left icon-right-left"></i>
                            </div>
                          </div>
                          <div class="begin-details"></div>
                        </div>
                      </div>
                    </div>
                    <div class="approListTable table-data">
                      <el-table :tooltip-effect="'light'" stripe style="width: 100%" height="100%" :data="signDetail.sealApproveDetailVo.approveDetailList" :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
                        <el-table-column label="流程节点" align="center" prop="activityName" show-overflow-tooltip> </el-table-column>
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
            <div v-show="nowTab === 1" v-if="appDiaType != 6">
              <el-tabs v-model="activeName" type="card" class="box-dialog">
                <el-tab-pane label="基本信息" name="basicInform">
                  <!-- <el-container> -->
                  <!-- 左侧 -->
                  <ul class="aside">
                    <li class="aside-li wh100" :class="{ wh75: data.checkResult !== null }">
                      <div class="aside-div-left">流程名称</div>
                      <div class="aside-div-right">
                        <span>{{ itemData.processName }}</span>
                      </div>
                    </li>
                    <!-- 检查评分 0：不合格 1：合格 2：良好 -->
                    <li class="aside-li wh25" v-if="data.checkResult != null">
                      <div class="aside-div-left">工程评分</div>
                      <div class="aside-div-right">
                        <span>{{ data.checkResult == 0 ? "不合格" : data.checkResult == 1 ? "合格" : "良好" }}</span>
                      </div>
                    </li>
                    <li class="aside-li wh25">
                      <div class="aside-div-left">单位工程</div>
                      <div class="aside-div-right">
                        <el-tooltip effect="dark" :content="unitProject" placement="bottom-start">
                          <span>{{ unitProject }}</span>
                        </el-tooltip>
                      </div>
                    </li>
                    <li class="aside-li wh25">
                      <div class="aside-div-left">分部工程</div>
                      <div class="aside-div-right">
                        <el-tooltip effect="dark" :content="partProject" placement="bottom-start">
                          <span>{{ partProject }}</span>
                        </el-tooltip>
                      </div>
                    </li>
                    <li class="aside-li wh50">
                      <div class="aside-div-left">本次完成分项工程</div>
                      <div class="aside-div-right">
                        <el-tooltip effect="dark" :content="outProject" placement="bottom-start">
                          <span>{{ outProject }}</span>
                        </el-tooltip>
                      </div>
                    </li>
                    <li class="aside-li wh25" v-if="itemData.itemType == 1">
                      <div class="aside-div-left">本次填高</div>
                      <div class="aside-div-right">{{ itemData.currentFillHeight }}米</div>
                    </li>
                    <!-- <li class="aside-li wh25" v-if="itemData.itemType == 1 && itemData.approveStatus != 2">
                      <div class="aside-div-left">施工后剩余填高</div>
                      <div class="aside-div-right">{{ itemData.distanceSurface }}米</div>
                    </li> -->
                    <li class="aside-li wh25" v-if="itemData.itemType == 2">
                      <div class="aside-div-left">本次施工进尺</div>
                      <div class="aside-div-right">{{ itemData.distanceSurface }}米</div>
                    </li>
                    <!-- <li class="aside-li wh25" v-if="itemData.itemType == 2 && itemData.approveStatus != 2">
                      <div class="aside-div-left">施工后剩余进尺</div>
                      <div class="aside-div-right">{{ itemData.fillHeight - itemData.distanceSurface }}米</div>
                    </li> -->
                    <!-- <li class="aside-li" style="width: 18%;">
                <div class="aside-div-left">设计工作量</div>
                <div class="aside-div-right">
                  {{ basicInfo.designQuantities }}
                </div>
              </li> -->
                    <li class="aside-li wh25" v-if="itemData.approveStatusStr != '已完成' && itemData.approveStatus != 0 && itemData.approveStatusStr != '审批不通过'">
                      <div class="aside-div-left">当前审批人</div>
                      <div class="aside-div-right">
                        {{ itemData.approver }}
                      </div>
                    </li>
                    <!-- <li class="aside-li wh25">
                      <div class="aside-div-left">完成状态</div>
                      <div class="aside-div-right">
                        {{ itemData.itemApproveStatus == 1 ? "已完成" : "未完成" }}
                      </div>
                    </li> -->
                    <li class="aside-li wh25" v-if="itemData.approveStatus != 0">
                      <div class="aside-div-left">审批完成状态</div>
                      <div class="aside-div-right">
                        {{ itemData.approveStatusStr }}
                        <!-- {{ itemData.approveStatus == 0 ? "草稿" : itemData.approveStatus == 1 ? "审批中" : itemData.approveStatus == 2 ? "审批完成" : itemData.approveStatus == 3 ? "审批不通过" : itemData.approveStatus == 4 ? "待签章" : itemData.approveStatus == 5 ? "签章中" : itemData.approveStatus == 6 ? "签章已完成" : "" }} -->
                      </div>
                    </li>
                    <li class="aside-li wh25" v-if="itemData.approveStatus != 0">
                      <div class="aside-div-left">审批完成时间</div>
                      <div class="aside-div-right">
                        {{ itemData.approveTime ? itemData.approveTime : "" }}
                      </div>
                    </li>
                  </ul>
                  <!-- 右侧 -->
                  <el-main class="dialogMain2">
                    <div class="process-name">{{ proceName }}</div>
                    <!-- <div class="canvas" ref="lookCanva" id="lookCanva" v-html="svgHtml"></div> -->
                    <taskFinishList :list="list" :show="!!datas.isApprovalFailedStatus" :current-node-id="data.currentNodeId"></taskFinishList>
                  </el-main>
                  <!-- </el-container> -->
                </el-tab-pane>
                <el-tab-pane label="审批记录" name="record">
                  <div class="tables table-data">
                    <el-table :tooltip-effect="'light'" :data="ApprovalList" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                      <el-table-column align="center" label="序号" width="50" type="index" />
                      <el-table-column align="center" label="流程节点" prop="activityName" show-overflow-tooltip />
                      <el-table-column align="center" label="所属工序" prop="processName" show-overflow-tooltip />
                      <el-table-column align="center" label="负责人" prop="approver" show-overflow-tooltip />
                      <el-table-column align="center" label="操作内容" prop="approveComment" show-overflow-tooltip />
                      <el-table-column align="center" label="操作时间" prop="approveTime" show-overflow-tooltip />
                      <el-table-column align="center" label="详情">
                        <template slot-scope="{ row }">
                          <el-button plain @click="nodeDetels(row)" type="primary" size="mini" v-show="row.approveStatus != 2">查看</el-button>
                        </template>
                      </el-table-column>
                      <div slot="empty" class="empty" style="width: 100%">
                        <img src="@/assets/empty.svg" class="zanwu" />
                        <span>暂无数据</span>
                      </div>
                    </el-table>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="关联资料" name="associatedData" class="tab-item">
                  <div class="tables table-data">
                    <el-table :tooltip-effect="'light'" :data="linkList" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                      <el-table-column align="center" width="50" label="序号" type="index" />
                      <!-- <el-table-column
                align="center"
                label="流程节点"
                prop="nodeName"
              /> -->
                      <el-table-column align="center" label="所属工序" prop="workflowName" show-overflow-tooltip />
                      <el-table-column align="center" label="资料类型" prop="bookType">
                        <template slot-scope="{ row }">
                          <span v-if="row.bookType == 0">施工技术规范</span>
                          <span v-if="row.bookType == 1">安全规范</span>
                          <span v-if="row.bookType == 2">验收标准</span>
                          <span v-if="row.bookType == 3">工程图纸</span>
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="资料名称" prop="bookName" />
                      <el-table-column align="center" label="资料内容" prop="data.content" show-overflow-tooltip>
                        <template slot-scope="{ row }">
                          <span v-if="row.beginPage == row.endPage">资料第{{ row.beginPage }}页</span>
                          <span v-else>资料第{{ row.beginPage }}~{{ row.endPage }}页</span>
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="操作">
                        <template slot-scope="{ row }">
                          <!-- 查看pdf -->
                          <el-button size="mini" @click="lookPdf(row)">查看</el-button>
                        </template>
                      </el-table-column>
                      <div slot="empty" class="empty" style="width: 100%">
                        <img src="@/assets/empty.svg" class="zanwu" />
                        <span>暂无数据</span>
                      </div>
                    </el-table>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="关联表格" name="associatedList">
                  <el-container>
                    <!-- 左侧 -->
                    <el-aside class="lf-aside">
                      <div class="tables table-data">
                        <el-table :tooltip-effect="'light'" :data="linkTableLift2" height="50%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                          <el-table-column align="center" label="已填写表">
                            <template slot-scope="scope">
                              <el-radio-group v-model="tableRadio" size="mini" @change="tabChange(scope.row, scope.$index)">
                                <el-tooltip class="item" effect="dark" :content="scope.row.tableName" placement="top" :disabled="scope.row.tableName.length > 4 ? false : true">
                                  <el-radio-button :label="scope.row.fkTableId + '' + scope.$index" v-if="scope.row.tableName">
                                    {{ scope.row.tableName }}
                                  </el-radio-button>
                                  <el-radio-button :label="scope.row.fkTableId" v-else>
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
                        <el-table :tooltip-effect="'light'" :data="linkTableLift" height="50%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                          <el-table-column align="center" label="当前节点待填写表">
                            <template slot-scope="scope">
                              <el-radio-group v-model="tableRadio" size="mini" @change="tabChange(scope.row, scope.$index)">
                                <el-tooltip class="item" effect="dark" :content="scope.row.tableName" placement="top" :disabled="scope.row.tableName.length > 4 ? false : true">
                                  <el-radio-button :label="scope.row.fkTableId + '1' + scope.$index" v-if="scope.row.tableName">
                                    {{ scope.row.tableName }}
                                  </el-radio-button>
                                  <el-radio-button :label="scope.row.fkTableId" v-else>
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
                    <!-- 右侧 -->
                    <el-main class="dialogMain">
                      <div class="html-content">
                        <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage" v-if="linkTableLift.length != 0 || linkTableLift2.length != 0">
                          <tr v-for="(item, idx) in tabContent" :key="idx" style="" v-show="item.status">
                            <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                              <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                              <span v-if="i.attributeTypes == 1 && i.checkout == 1">{{ i.name }}</span>
                              <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}: <img width="100px" :src="i.signatureDate.img" alt=""/></span>
                              <span v-if="i.attributeTypes == 2">{{ i.name }}</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </el-main>
                  </el-container>
                </el-tab-pane>
                <el-tab-pane label="工程量" name="quantities" v-if="data.approveStatus != 0 && workAmount.length > 0">
                  <div class="tables table-data">
                    <el-table :tooltip-effect="'light'" :data="workAmount" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                      <el-table-column align="center" label="项目名称" prop="itemName">
                        <template slot-scope="{ row }">
                          {{ (row.itemCode ? row.itemCode : "") + " " + row.itemName }}
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="延长米" prop="number" v-if="itemData.itemType == 2">
                        <template slot-scope="{ row }">
                          {{ row.grade == 3 ? row.number : "" }}
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="每延米工程量" prop="unitQuantity" v-if="itemData.itemType == 2">
                        <template slot-scope="{ row }">
                          <span v-if="row.grade == 4 && row.itemType == 2">{{ row.unitQuantity }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="设计工程量" prop="designQuantities">
                        <template slot-scope="{ row }">
                          {{ row.grade == 4 ? row.designQuantities : "" }}
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="本次完成工程量" prop="completeQuantities" />
                      <el-table-column align="center" label="备注" prop="remark" show-overflow-tooltip>
                        <template slot-scope="{ row }">
                          <span :cleanRed="row">{{ row.remark ? row.remark : "" }}</span>
                        </template>
                      </el-table-column>
                      <div slot="empty" class="empty" style="width: 100%">
                        <img src="@/assets/empty.svg" class="zanwu" />
                        <span>暂无数据</span>
                      </div>
                    </el-table>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="材料用量" name="materialsNum" v-if="data.approveStatus != 0 && materials.length > 0">
                  <div class="tables table-data">
                    <el-table :tooltip-effect="'light'" :data="materials" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                      <el-table-column align="center" label="项目名称" prop="itemName" show-overflow-tooltip />
                      <el-table-column align="center" label="物料名称" prop="materialName" />
                      <el-table-column align="center" label="物资类别" prop="typeName" show-overflow-tooltip />
                      <el-table-column align="center" label="扣款方式" prop="deductionWay" show-overflow-tooltip />
                      <el-table-column align="center" label="单位" prop="materialUnitName" show-overflow-tooltip />
                      <el-table-column align="center" label="定量供应量" prop="materiaDesignQuantities" show-overflow-tooltip />
                      <el-table-column align="center" label="实际使用量" prop="actualUsage" show-overflow-tooltip />
                      <div slot="empty" class="empty" style="width: 100%">
                        <img src="@/assets/empty.svg" class="zanwu" />
                        <span>暂无数据</span>
                      </div>
                    </el-table>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="附件" name="accessory">
                  <div class="tables table-data">
                    <el-table :tooltip-effect="'light'" :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                      <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                      <el-table-column label="流程节点" align="center" prop="processName" show-overflow-tooltip> </el-table-column>
                      <el-table-column label="所属工序" align="center" prop="nodeName" show-overflow-tooltip> </el-table-column>
                      <el-table-column label="上传人" align="center" prop="createUserName" show-overflow-tooltip> </el-table-column>
                      <el-table-column label="上传时间" align="center" prop="createTime" show-overflow-tooltip> </el-table-column>
                      <el-table-column label="附件内容描述" align="center" show-overflow-tooltip>
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
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>

        <div class="print-export" v-show="nowTab === 1">
          <el-button type="primary" class="el-button-primary" v-has="'production:process:out'" size="mini" @click="dataExport">导出</el-button>
          <el-button type="primary" class="el-button-primary" v-has="'production:process:put'" size="mini" @click="dataPrinting">打印</el-button>
        </div>
      </div>
      <div slot="footer" v-if="appDiaType === 3 || appDiaType === 6">
        <el-button type="danger" @click="withdrawActivity">撤回</el-button>
        <el-button @click="btnClose">取消</el-button>
      </div>
    </el-dialog>
    <NodeDialog2 :nodeDialog.sync="disposeDialog" :show="false" :data="nodeData" />
    <proCheckDialogs :data="nodeData" :proChangeDialog.sync="proChangeDialogs" :startNode="true" :appDiaType="1" />
    <!-- 预览pdf弹框 -->
    <pdfPiev ref="pdfPiev" :urlr="url" :number="number" />
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.fileUrl" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj.fileUrl" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <chapterProcessApproval :chaptersApprovalDialog.sync="chaptersApprovalDialog" :not-now="true" :not-now-data="nodeData"></chapterProcessApproval>
    <approveCodeDialog ref="approveCodeDialog" v-if="proChangeDialog" :approveCodeDialog.sync="approveCodeDialog" @closeLoading="loading = false" :sign-date="signDate" @approveOk="withdraw" :noApprove="true" :biz-type="0" :appCodeType="appCodeType"/>
    <div style="position: absolute;left: -99999999px;width: 596px;" v-if="tableStatus">
      <table style="border-collapse: collapse; overflow: auto; margin: 0 auto" ref="pdfTable" v-for="(items, index) in pdfTable" :key="index" :id="'pdfDom' + index">
        <tr v-for="(item, idx) in items" :key="idx" style="" v-show="item.status">
          <td style="box-sizing: content-box; border: none; margin: 0; padding: 0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
            <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
            <span v-if="i.attributeTypes == 1 && i.checkout == 1">{{ i.name }}</span>
            <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:<img width="100px" crossorigin="anonymous" :src="i.signatureDate.img" alt=""/></span>
            <span v-if="i.attributeTypes == 2">{{ i.name }}</span>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import pdfPiev from "../../../components/pdf-preview/pdf-preview.vue";
import utils from "@/utils/util";
import taskFinishList from "@/components/taskFinishList/taskFinishList.vue";
import chapterProcessApproval from "../../../components/inChapter/chapterProcessApproval2.vue";
import htmlToPdf from "@/utils/htmlToPdf";
import { uploadObject } from "@/utils/upload";
import signPdf from "../../../components/signPdf/signPdf.vue";
import NodeDialog2 from "../../../components/NodeDialog/NodeDialog2.vue";
import approveCodeDialog from "@/components/approveCodeDialog.vue";
import printJs from "print-js";
import proCheckDialogs from "../../../components/NodeDialog/proCheckDialog.vue";
import Template from "../../sms/template.vue";
export default {
  components: { pdfPiev, taskFinishList, chapterProcessApproval, signPdf, NodeDialog2, approveCodeDialog, proCheckDialogs, Template },
  props: {
    proChangeDialog: {
      type: Boolean,
      default: false
    },
    data: {},
    // 弹框展示状态 1为查看,3撤回，  4为盖章中查看,5为已办查看，6盖章撤回
    appDiaType: {
      type: Number
    }
  },
  data() {
    return {
      // 模态框里当前tab
      activeName: "basicInform",
      // 基本信息
      unitProject: "",
      partProject: "",
      outProject: "",
      // 审批记录表
      ApprovalList: [],
      // 关联资料表
      linkList: [],
      // 关联表格左侧
      linkTableLift: [],
      linkTableLift2: [],
      // 工程量
      workAmount: [],
      // 材料用量
      materials: [],
      tableRadio: "0",
      proceName: "", // 流程名称
      timer: "",
      newProcessname: "", // 新增的流程名称
      itemData: {}, // 列表每一项的数据
      tabContent: "",
      loading: false,
      svgHtml: "",
      loading2: false,
      url: "",
      number: 1,
      // 附件列表
      accessoryList: [],
      // 当前预览的表单obj
      nowPreviewObj: {},
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      // 附件文件类型
      fileType: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpg", "image/jpeg", "image/png", "application/pdf"],
      rowIndex: 0,
      list: [],
      nowTab: 1,
      signTab: "1",
      signDetail: {
        sealApproveDetailVo: {},
        sealScheduleDetailList: [],
        sealTableList: []
      },
      // modifiedList:[],
      chaptersApprovalDialog: false,
      nodeData: {},
      datas: {},
      approveSum: null,
      disposeDialog: false,
      chaptersApprovalDialog: false,
      approveCodeDialog: false,
      signDate: {},
      pdfTable: [],
      tableStatus: true,
      proChangeDialogs: false,
      appCodeType:0
    };
  },
  methods: {
    withdrawActivity() {
      this.signDate = {
        fkBizId: this.data.pkId,
        fkNodeId: this.data.currentNodeId,
        fkTemplateId: this.data.prodWorkflowTemplate.pkId
      };
      this.loading = true
      this.$refs.approveCodeDialog.getApproveStatus();
    },
    withdraw(unique) {
      if (this.appDiaType === 3) {
        this.loading = true
        this.$api
          .withdrawFlow({ approveId: this.data.pkId ,unique})
          .then(res => {
            if (res.code === 200) {
              this.$message.success("撤回成功");
              this.loading = false;
              this.$emit("update:proChangeDialog", false);
              this.$emit("getList");
            } else {
              this.loading = false;
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        this.loading = true
        this.$api.revocationWithdrawSeal({ pkId: this.data.pkId,unique }).then(res => {
          this.loading = false
          if (res.code == 200) {
            this.$message.success("撤回成功");
            this.$emit("update:proChangeDialog", false);
            this.$emit("getList");
          } else {
            this.$message.warning(res.msg);
          }
        }).catch(err => {
            this.loading = false;
          });
      }
    },
    // 查看节点详情
    nodeDetels(row) {
      console.log(row);
      const data = {
        flowCaseId: row.flowCaseId,
        nodeId: row.currentNodeId,
        taskId: row.taskId
      };
      this.$api.searchByBusinessNode(data).then(res => {
        if (res.code === 200) {
          this.nodeData = res.data.prodProcessApproveVo;
          //处理基本信息拼接问题
          let unitProject = "";
          let partProject = "";
          let outProject = "";
          this.nodeData.reItemApproveDtoList.forEach(item => {
            unitProject = item.unitItemName + "," + unitProject; //单位
            partProject = item.partItemName + "," + partProject; //分部
            outProject = item.itemName + "," + outProject; //完成分项
          });
          this.nodeData.reItemApproveDtoList[0].unitProject = unitProject.slice(0, -1);
          this.nodeData.reItemApproveDtoList[0].partProject = partProject.slice(0, -1);
          this.nodeData.reItemApproveDtoList[0].outProject = outProject.slice(0, -1);
          console.log(this.nodeData.reItemApproveDtoList[0].unitProject); // 拼接名称
          console.log(this.nodeData.reItemApproveDtoList[0].partProject); // 拼接名称
          if (data.nodeId == 0) {
            this.proChangeDialogs = true;
          } else {
            this.disposeDialog = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // =====================打印导出开始=========================
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
              // this.$api.delFiles({ urls });
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
    // =====================打印导出结束=========================
    checkSignNodes(row) {
      const data = {
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
    btnClose() {
      this.siStatus = false;
      this.$emit("update:proChangeDialog", false);
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
        this.number = 1;
        this.previewType = 2;
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
    // 查看pdf
    lookPdf(item) {
      this.url = item.bookUrl;
      this.number = item.beginPage;
      this.$refs.pdfPiev.pdfShow = true;
    },
    // 表格管理返回来的表格
    tabChange(data, index) {
      this.rowIndex = index;
      this.tabTitle = data.tableName;
      this.tabContent = data.tableHtml;
      // if (this.tabContent instanceof Array) {
      // } else {
      //   this.tabContent = JSON.parse(this.tabContent);
      // }

      // this.tabData = data.tableColumnData == null ? {} : JSON.parse(data.tableColumnData);
      // this.$nextTick(() => {
      //   this.handleTable();
      // });
    }
  },
  watch: {
    proChangeDialog(val) {
      this.unitProject = ""; //单位
      this.partProject = ""; //分部
      this.outProject = ""; //完成
      if (val) {
        if ([4, 5, 6].includes(this.appDiaType)) {
          this.nowTab = 0;
        } else {
          this.nowTab = 1;
        }
        this.linkTableLift = [];
        this.dialogVisible = true;
        this.itemData = this.data;
        // this.basicInfo = this.data.reItemApproveDtoList[0]; // 基本信息
        this.data.reItemApproveDtoList.forEach(item => {
          this.unitProject = item.unitItemName + "," + this.unitProject; //单位
          this.partProject = item.partItemName + "," + this.partProject; //分部
          this.outProject = item.itemName + "," + this.outProject; //完成分项
        });
        this.unitProject = this.unitProject.substring(0, this.unitProject.length - 1); //去除逗号
        this.partProject = this.partProject.substring(0, this.partProject.length - 1); //去除逗号
        this.outProject = this.outProject.substring(0, this.outProject.length - 1); //去除逗号
        this.ApprovalList = this.data.approveDetailList; // 审批记录
        this.linkList = this.data.bookPdfDTOS; // 关联资料
        this.linkTableLift = this.data.currentNodeTableList ? this.data.currentNodeTableList : []; // 关联表格
        this.linkTableLift2 = this.data.workflowTableList ? this.data.workflowTableList : []; // 关联表格
        this.workAmount = this.data.prodItemList; // 工程量
        this.materials = this.data.materialItemList?this.data.materialItemList:[]; // 材料用量
        this.accessoryList = this.data.fileList;
        this.signDetail = this.data.sealBusinessVo
          ? this.data.sealBusinessVo
          : {
              sealApproveDetailVo: {},
              sealScheduleDetailList: [],
              sealTableList: []
            };
        this.datas = { ...this.data };
        this.approveSum = null;
        this.data.taskFinishVoList.forEach((item, index) => {
          if (item.approveStatus == 1 || item.approveStatus == 3) {
            this.approveSum = index;
          }
        });
        //  流程图
        this.proceName = this.data.prodWorkflowTemplate.workflowName;
        this.list = this.data.taskFinishVoList;
        this.svgHtml = this.data.hisProcessDiagram;
        this.pdfTable = [];
        this.pdfTitle = [];
        this.linkTableLift.forEach((item, idx) => {
          item.tableHtml = utils.unzip(item.tableHtml);
          if (item.tableHtml instanceof Array) {
          } else {
            item.tableHtml = JSON.parse(item.tableHtml);
          }
          this.pdfTable.push(item.tableHtml);
          this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
        });
        this.linkTableLift2.forEach((item, idx) => {
          this.pdfTable.push(item.tableHtml);
          this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
        });
        if (this.linkTableLift2 && this.linkTableLift2.length) {
          this.tableRadio = this.linkTableLift2[0].fkTableId + "0";
          this.tabTitle = this.linkTableLift2[0].tableName;
          this.tabContent = this.linkTableLift2[0].tableHtml;
          console.log(this.tabContent);
          return;
          this.tabContent = utils.unzip(this.linkTableLift[0].tableHtml);
          console.log(this.tabContent);
          if (this.tabContent instanceof Array) {
          } else {
            this.tabContent = JSON.parse(this.tabContent);
          }
        }
      } else {
        this.activeName = "basicInform";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
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

  // .html-content:after {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   right: 0px;
  //   background: transparent;
  //   width: 100%;
  //   height: 100%;
  //   z-index: 1;
  // }
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
  top: 0px;
  right: 30px;
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
.dialog-form {
  position: relative;
}
</style>
