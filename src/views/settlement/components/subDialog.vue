<template>
  <div>
    <el-dialog :close-on-press-escape="false" :title="dialogTitle" :visible="dialogVisible" width="77%" top="5vh" @close="handleCancel(false)" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-forms">
        <div class="workflowDialog">
          <div class="left-tabs" v-if="[7, 8].includes(dialogType)">
            <div class="tabs-item" :class="{ currentTab: nowTab === 0 }" @click="nowTab = 0">盖章详情</div>
            <div class="tabs-item" :class="{ currentTab: nowTab === 1 }" @click="nowTab = 1">业务详情</div>
          </div>
          <div :class="{ 'right-content': [7, 8, 10].includes(dialogType) }" :style="{ width: [7, 8, 10].includes(dialogType) ? '' : '100%' }">
            <div class="signDetail h600" v-if="nowTab === 0">
              <div class="print-export">
                <el-button v-has="'settlement:owner:out'" size="mini" @click="dataExport"><img src="@/assets/export.png" alt="" class="iconImg mr5" />导出</el-button>
                <el-button v-has="'settlement:owner:put'" size="mini" @click="dataPrinting"><i class="el-icon-printer mr5"></i>打印</el-button>
              </div>
              <el-tabs v-model="signTab" v-if="[7, 8, 10].includes(dialogType)">
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
                            <div v-if="approveSum != null && beginRow" class="circle-icon-right">
                              <i class="el-icon-arrow-left icon-right-left"></i>
                            </div>
                          </div>
                          <div class="begin-details">
                            <div>{{ formData.createUserName }}</div>
                            <div>{{ formData.createTime }}</div>
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
                          </div>
                          <div class="begin-details"></div>
                        </div>
                      </div>
                    </div>
                    <div class="approListTable table-data">
                      <el-table :tooltip-effect="'light'" stripe style="width: 100%" height="100%" :data="signDetail.sealApproveDetailVo.approveDetailList" :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
                        <el-table-column label="流程节点" align="center" prop="activityName"> </el-table-column>
                        <el-table-column label="负责人" align="center" prop="approver"></el-table-column>
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
            <el-container v-if="nowTab === 1">
              <div v-if="([4, 5, 6, 7, 8, 9].includes(dialogType) || addNum == 2) && dialogVisible" class="bpmns" :class="{ animal: flowShow }">
                <!-- <div :class="['canvas', { h600: dialogType === 4, h700: dialogType === 5 || dialogType === 6 }]"
              ref="lookCanva" id="lookCanva">
              <flows :createAvg="formData.createUserPortraitUrl" :createName="formData.createUserName"
                :createTime="formData.createTime" :list="formData.engWorkflowApproveVos"></flows>
            </div> -->
                <div class="flow-chart-box" :class="[{ h600: dialogType === 4, h700: dialogType === 5 || dialogType === 6 }]">
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
                    <div class="begin-details" v-if="dialogType !== 1">
                      <div>{{ formData.createUserName }}</div>
                      <div>{{ formData.createTime }}</div>
                      <div>发起流程</div>
                    </div>
                  </div>
                  <div class="flow-char-item" v-for="(item, index) in formData.taskFinishVoList.slice(1)" :key="index">
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
                    </div>
                    <div class="begin-details"></div>
                  </div>
                </div>
              </div>
              <div class="showFlowBtn" v-if="([4, 5, 6, 7, 8, 9].includes(dialogType) || addNum == 2) && dialogVisible" @click="flowShow = !flowShow">
                <div class="btnCon">
                  <i class="el-icon-arrow-right btnColor" :class="{ scale: !flowShow }"></i>
                </div>
              </div>
              <el-main style="position: relative;">
                <div class="print-export" v-if="[2, 4].includes(dialogType)">
                  <el-button v-has="'settlement:owner:out'" size="mini" @click="dataExport"><img src="@/assets/export.png" alt="" class="iconImg mr5" />导出</el-button>
                  <el-button v-has="'settlement:owner:put'" size="mini" @click="dataPrinting"><i class="el-icon-printer mr5"></i>打印</el-button>
                </div>
                <el-tabs v-model="activeName1">
                  <el-tab-pane label="结算信息" name="first">
                    <!-- 头部信息 -->
                    <div class="dialog-header">
                      <el-row :span="24">
                        <el-col :span="8">
                          <div class="dialog-header-item">
                            <div class="label">结算单名称</div>
                            <div class="value">
                              <el-input size="mini" v-model="formData.settleName" :disabled="dialogType !== 1 || addNum == 2" maxlength="100"></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="[2, 5].includes(orgType)">
                          <div class="dialog-header-item">
                            <div class="label">分包单位</div>
                            <div class="value">
                              <el-select size="mini" style="width:100%" v-if="dialogType === 1 && !formData.pkId && addNum == 1" v-model="fkBySettleOrgId" @change="subChange">
                                <el-option v-for="item in subOption" :key="item.pkId" :value="item.pkId" :label="item.customName"></el-option>
                              </el-select>
                              <el-input size="mini" v-else :value="formData.customName" disabled></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8">
                          <div class="dialog-header-item">
                            <div class="label">合同名称</div>
                            <div class="value">
                              <el-select size="mini" style="width:100%" v-model="formData.fkContractId" v-if="dialogType === 1 && addNum == 1" @change="contractChange">
                                <el-option v-for="item in contractList" :key="item.pkId" :value="item.pkId" :label="item.contractName"></el-option>
                              </el-select>
                              <el-input size="mini" :value="formData.contractName" v-else disabled></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="showNext">
                          <div class="dialog-header-item">
                            <div class="label">负责人</div>
                            <div class="value">
                              <el-select size="mini" style="width:100%" v-model="fkApproverId" v-if="dialogType === 1 || dialogType === 3 || dialogType === 5 || addNum == 2" @change="approverChange">
                                <el-option v-for="item in userOptions" :key="item.pkId" :value="item.pkId" :label="item.userName"></el-option>
                              </el-select>
                              <el-input size="mini" :value="formData.approver" v-else disabled></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="orgType === 7 || orgType === 2 || orgType === 3">
                          <div class="dialog-header-item">
                            <div class="label">项目部</div>
                            <div class="value">
                              <el-input size="mini" v-model="formData.orgName" :disabled="(dialogType !== 1 && dialogType !== 3) || addNum == 2"></el-input>
                            </div>
                          </div>
                        </el-col>

                        <el-col :span="8">
                          <div class="dialog-header-item">
                            <div class="label">结算周期</div>
                            <div class="value">
                              <el-date-picker class="mr5" size="mini" :class="dialogType === 1 && flowShow ? 'wh-140' : 'wh-120'" value-format="yyyy-MM-dd" v-model="formData.beginDate" disabled></el-date-picker>
                              <el-date-picker size="mini" :class="dialogType === 1 && flowShow ? 'wh-140' : 'wh-120'" value-format="yyyy-MM-dd" v-model="formData.endDate" :disabled="dialogType !== 1 || !formData.fkContractId || addNum == 2" @change="endTimeChange" :picker-options="endTime"></el-date-picker>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8">
                          <div class="dialog-header-item">
                            <div class="label">结算日期</div>
                            <div class="value">
                              <el-date-picker type="date" size="mini" style="width:100%" value-format="yyyy-MM-dd" v-model="formData.settleDate" :disabled="(dialogType !== 1 && dialogType !== 3) || addNum == 2" :picker-options="addTime"> </el-date-picker>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="pricePermission">
                          <div class="dialog-header-item">
                            <div class="label">上期末结算金额</div>
                            <div class="value">
                              <el-input size="mini" :value="formData.lastSettleAmount" type="number" disabled> <template slot="append">元</template></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="pricePermission">
                          <div class="dialog-header-item">
                            <div class="label">本期结算金额</div>
                            <div class="value">
                              <el-input size="mini" :value="formData.settleAmount" type="number" disabled> <template slot="append">元</template></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="pricePermission">
                          <div class="dialog-header-item">
                            <div class="label">税金</div>
                            <div class="value">
                              <el-input size="mini" :value="taxAmount" type="number" disabled> <template slot="append">元</template></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="pricePermission">
                          <div class="dialog-header-item">
                            <div class="label">本期含税结算金额</div>
                            <div class="value">
                              <el-input size="mini" :value="hasTaxAmount" type="number" disabled> <template slot="append">元</template></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="pricePermission">
                          <div class="dialog-header-item">
                            <div class="label">本期末结算金额</div>
                            <div class="value">
                              <el-input size="mini" :value="formData.endSettleAmount" type="number" disabled> <template slot="append">元</template></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="16">
                          <div :class="['dialog-header-item']">
                            <div class="label">备注</div>
                            <div class="value">
                              <el-input size="mini" v-model="formData.remark" :disabled="(dialogType !== 1 && dialogType !== 3) || addNum == 2" maxlength="100"></el-input>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8" v-if="[1, 2, 3].includes(dialogType) && addNum == 1">
                          <div class="dialog-header-item">
                            <div class="label">设置审批人</div>
                            <div class="value">
                              <el-button size="mini" :disabled="dialogType !== 1 && dialogType !== 3" type="danger" v-if="!approvalStatus && dialogType != 2" @click="approvalClick">未设置</el-button>
                              <el-button size="mini" :disabled="dialogType !== 1 && dialogType !== 3" type="success" v-if="approvalStatus && dialogType != 2" @click="approvalClick">重新设置</el-button>
                              <el-button size="mini" type="primary" v-if="dialogType == 2" @click="approvalClick">查看</el-button>
                            </div>
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                    <div class="borders">
                      <el-tabs v-model="activeName2">
                        <el-tab-pane label="分项列表" name="first" v-if="dialogType < 4 && addNum == 1">
                          <div class="table1 table-data" :key="!!treeStatsItem.length">
                            <!-- :show-summary="activeName2 === 'first'" :summary-method="getSummaries" -->
                            <el-table :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff' }" height="100%" style="width: 100%" :data="treeStatsItem" :tree-props="{ children: 'children' }" row-key="pkId" ref="tables1" :key="ranKey">
                              <el-table-column align="center" prop="itemCode">
                                <template slot="header" slot-scope="scope">
                                  <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables1', 'isExpand1', 'treeStatsItem')"></i>
                                  <span :cleanRed="scope">项目名称</span>
                                </template>
                                <template slot-scope="{ row }">
                                  <span>{{ (row.itemCode ? row.itemCode + " " : "") + row.itemName }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="单位" prop="unitName"> </el-table-column>
                              <el-table-column align="center" label="合同单价" v-if="pricePermission">
                                <template slot-scope="{ row }">
                                  <!-- <el-input size="mini" v-if="dialogType === 1 && row.grade === 4" v-model.trim="row.price" @keydown.native="keyDown" @input="input($event, 2, row)" type="number" class="price"></el-input> -->
                                  <p v-if="row.grade === 4">{{ row.price }}</p>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="设计工程量">
                                <template slot-scope="{ row }">
                                  <span v-if="row.grade == 4">{{ row.designNumber }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="金额" prop="designAmount" v-if="pricePermission"> </el-table-column>
                              <el-table-column align="center" label="完成工程量">
                                <template slot-scope="{ row }">
                                  <span v-if="row.grade == 4">{{ row.finishNumber }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="结算金额">
                                <template slot-scope="{ row }">
                                  <span>{{ pricePermission ? row.settleAmount : "***" }}</span>
                                </template>
                              </el-table-column>
                              <!-- <el-table-column align="center" label="上期末">
                                <el-table-column align="center" label="完成工程量">
                                  <template slot-scope="{ row }">
                                    <span v-if="row.grade == 4">{{ row.lastFinishNumber }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column align="center" label="结算金额">
                                  <template slot-scope="{ row }">
                                    <span>{{ pricePermission ? row.lastFinishAmount : "***" }}</span>
                                  </template>
                                </el-table-column>
                              </el-table-column>
                              <el-table-column align="center" label="本期">
                                <el-table-column align="center" label="完成工程量">
                                  <template slot-scope="{ row }">
                                    <span v-if="row.grade == 4">{{ row.finishNumber }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column align="center" label="结算金额">
                                  <template slot-scope="{ row }">
                                    <span>{{ pricePermission ? row.settleAmount : "***" }}</span>
                                  </template>
                                </el-table-column>
                              </el-table-column>
                              <el-table-column align="center" label="本期末">
                                <el-table-column align="center" label="完成工程量">
                                  <template slot-scope="{ row }">
                                    <span v-if="row.grade == 4">{{ row.endFinishNumber }}</span>
                                  </template>
                                </el-table-column>
                                <el-table-column align="center" label="结算金额">
                                  <template slot-scope="{ row }">
                                    <span>{{ pricePermission ? row.endFinishAmount : "***" }}</span>
                                  </template>
                                </el-table-column>
                              </el-table-column>
                              </el-table-column> -->
                              <div slot="empty" class="empty" style="width: 100%">
                                <img src="@/assets/empty.svg" class="zanwu" />
                                <span>暂无数据</span>
                              </div>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="费用列表" name="second" v-if="dialogType < 4 && addNum == 1">
                          <div class="table1 table-data" :key="!!engExpenseDetail.length">
                            <!-- :show-summary="activeName2 === 'second'" :summary-method="getSummaries3" -->
                            <el-table :tooltip-effect="'light'" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" style="width: 100%" :data="engExpenseDetail">
                              <el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
                              <el-table-column align="center" label="费用名称" prop="detailName"></el-table-column>
                              <el-table-column align="center" label="合同金额" prop="costAmount" v-if="pricePermission">
                                <template slot-scope="{ row }">
                                  {{ row.type == 0 ? "" : row.costAmount }}
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="上期末结算金额" prop="afterAmount"></el-table-column>
                              <el-table-column align="center" label="结算金额" prop="settleAmount" v-if="pricePermission">
                                <template slot-scope="{ row }">
                                  <el-input v-model="row.settleAmount" v-if="dialogType === 1 && row.type == 1" size="mini" @input="secondInput($event, 1, row, row.costAmount)" @blur="expenBlur(row)"></el-input>
                                  <span v-else>{{ row.type == 0 ? "" : row.settleAmount }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="本期末结算金额">
                                <template slot-scope="{ row }">
                                  {{ row.type == 0 ? "" : (row.afterAmount - 0 + (row.settleAmount - 0)).toFixed(2) }}
                                </template>
                              </el-table-column>
                              <div slot="empty" class="empty" style="width: 100%">
                                <img src="@/assets/empty.svg" class="zanwu" />
                                <span>暂无数据</span>
                              </div>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <!-- 只在审批开始显示 -->
                        <el-tab-pane label="汇总表" name="five" v-else>
                          <div class="table1 table-data">
                            <el-table :tooltip-effect="'light'" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" style="width: 100%" :data="formData.settleSummaryList" :show-summary="activeName2 === 'five'" :summary-method="getSummaries2">
                              <!-- <el-table-column align="center" type="index" label="序号" width="60"></el-table-column> -->
                              <el-table-column align="center" type="index" label="序号"></el-table-column>
                              <el-table-column align="center" label="章节名称" prop="chapterName"></el-table-column>
                              <el-table-column align="center" label="本期结算金额" prop="currentSettleAmount" v-if="pricePermission"></el-table-column>
                              <el-table-column align="center" label="开累结算金额" prop="settleAmount" v-if="pricePermission"></el-table-column>
                              <div slot="empty" class="empty" style="width: 100%">
                                <img src="@/assets/empty.svg" class="zanwu" />
                                <span>暂无数据</span>
                              </div>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane :label="item.chapterName" :name="index + ''" v-for="(item, index) in settleChapterVos" :key="item.chapterName" v-if="dialogType > 3 || addNum == 2">
                          <div class="table1 table-data">
                            <el-table :tooltip-effect="'light'" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" style="width: 100%" :data="item.details" :show-summary="true" :summary-method="getSummariesChat">
                              <el-table-column align="center" prop="subitemNum" label="子目号"></el-table-column>
                              <el-table-column align="center" label="清单项目名称" prop="detailName"></el-table-column>
                              <el-table-column align="center" label="单位" prop="unitName"> </el-table-column>
                              <el-table-column align="center" label="合同单价" prop="price" v-if="pricePermission"> </el-table-column>
                              <el-table-column align="center" label="上期末" v-if="pricePermission">
                                <el-table-column align="center" label="完成工程量" prop="lastQuantities"></el-table-column>
                                <el-table-column align="center" label="结算金额" prop="lastSettleAmount"> </el-table-column>
                              </el-table-column>
                              <el-table-column align="center" label="本期" v-if="pricePermission">
                                <el-table-column align="center" label="完成工程量" prop="currentQuantities"></el-table-column>
                                <el-table-column align="center" label="结算金额" prop="currentSettleAmount"> </el-table-column>
                              </el-table-column>
                              <el-table-column align="center" label="本期末" v-if="pricePermission">
                                <el-table-column align="center" label="完成工程量" prop="quantitiesAmount"></el-table-column>
                                <el-table-column align="center" label="结算金额" prop="settleAmount"> </el-table-column>
                              </el-table-column>
                              <div slot="empty" class="empty" style="width: 100%">
                                <img src="@/assets/empty.svg" class="zanwu" />
                                <span>暂无数据</span>
                              </div>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="材料扣减列表" name="thith" v-if="(dialogType > 3 && showEngDeductionDetail.length) || dialogType < 4" :key="addNum">
                          <div class="table1 table-data" :key="!!showEngDeductionDetail.length">
                            <el-table :tooltip-effect="'light'" stripe :show-summary="activeName2 === 'thith' && addNum == 2" :summary-method="getSummaries4" :header-cell-style="{ background: '#f1f6ff' }" height="100%" style="width: 100%" :data="showEngDeductionDetail">
                              <el-table-column align="center" label="子目号" prop="subitemNum" width="80"></el-table-column>
                              <el-table-column align="center" label="材料名称" prop="materialName"></el-table-column>
                              <el-table-column align="center" label="单位" prop="unitName"> </el-table-column>
                              <el-table-column align="center" label="超额供应量" prop="supplyNum"> </el-table-column>
                              <el-table-column align="center" label="超额扣款单价" prop="excessPrice" v-if="pricePermission"> </el-table-column>
                              <el-table-column align="center" label="累计超额供应量" prop="supplyNum"> </el-table-column>
                              <el-table-column align="center" label="超额应扣款金额" prop="amount"> </el-table-column>
                              <el-table-column align="center" label="上期末累计扣款金额" prop="lastDeductionAmount"> </el-table-column>
                              <!-- <el-table-column align="center" label="超额扣款结算单价" v-if="pricePermission">
                                <template slot-scope="{ row }">
                                  <el-input
                                    v-model="row.settlePrice"
                                    v-if="dialogType === 1 && row.type == 1 && addNum == 1"
                                    size="mini"
                                    @input="
                                      e => {
                                        row.settlePrice = $limitInputNumber(e, 99999999.99, 0, 2);
                                        computedAmount();
                                      }
                                    "
                                  ></el-input>
                                  <span v-else>{{ row.settlePrice }}</span>
                                </template>
                              </el-table-column> -->
                              <el-table-column align="center" label="本期扣款金额" v-if="pricePermission">
                                <!-- <template slot-scope="{ row }">
                                  <span>{{row.type? 0 - row.settlePrice * row.supplyNum:'' }}</span>
                                </template> -->
                                <template slot-scope="{ row }">
                                  <el-input
                                    v-model="row.settleAmount"
                                    v-if="dialogType === 1 && row.type == 1 && addNum == 1"
                                    size="mini"
                                    @input="
                                      e => {
                                        row.settleAmount = $limitInputNumber(e, row.amount, '', 2);
                                        computedAmount();
                                      }
                                    "
                                  ></el-input>
                                  <span v-else>{{ row.settleAmount }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="本期末累计扣款金额">
                                <template slot-scope="{ row }">
                                  {{ row.settleAmount ? (row.lastDeductionAmount - 0 + (row.settleAmount - 0)).toFixed(2) - 0 : 0 }}
                                </template>
                              </el-table-column>
                              <div slot="empty" class="empty" style="width: 100%">
                                <img src="@/assets/empty.svg" class="zanwu" />
                                <span>暂无数据</span>
                              </div>
                            </el-table>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="分项扣减列表" name="forth" v-if="dialogType < 4 && addNum == 1 && treeItemDeductions.length">
                          <div class="table1 table-data">
                            <!-- :show-summary="activeName2 === 'forth'" :summary-method="getSummaries" -->
                            <el-table :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff' }" height="100%" style="width: 100%" :data="treeItemDeductions" :tree-props="{ children: 'children' }" row-key="fkItemId" ref="tables2">
                              <!-- <el-table-column align="center" type="index" label="序号" width="60"></el-table-column> -->
                              <el-table-column prop="itemCode">
                                <template slot="header" slot-scope="scope">
                                  <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables2', 'isExpand2', 'treeItemDeductions')"></i>
                                  <span :cleanRed="scope">项目名称</span>
                                </template>
                                <template slot-scope="{ row }">
                                  <span>{{ (row.itemCode ? row.itemCode : "") + row.itemName }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="单位" prop="unitName"> </el-table-column>
                              <el-table-column align="center" label="工程量" prop="designNumber">
                                <template slot-scope="{ row }">
                                  <span>{{ row.grade == 4 ? row.designNumber : "" }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="合同单价" prop="price" v-if="pricePermission">
                                <template slot-scope="{ row }">
                                  <span>{{ row.grade == 4 ? row.price : "" }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column align="center" label="合同金额" prop="designAmount"></el-table-column>
                              <el-table-column align="center" label="本期完成工程量" prop="finishNumber">
                                <template slot-scope="{ row }">
                                  <span>{{ row.grade == 4 ? row.finishNumber : "" }}</span>
                                </template>
                              </el-table-column>
                              <!-- <el-table-column align="center" label="结算单价" prop="settlePrice" v-if="pricePermission">
                                <template slot-scope="{ row }">
                                  <span>{{ row.grade==4 ? row.settlePrice : "" }}</span>
                                </template>
                              </el-table-column> -->
                              <el-table-column align="center" label="本期结算金额" prop="settleAmount" v-if="pricePermission">
                                <template slot-scope="{ row }">
                                  <span>{{ 0 - row.settleAmount }}</span>
                                </template>
                              </el-table-column>
                              <div slot="empty" class="empty" style="width: 100%">
                                <img src="@/assets/empty.svg" class="zanwu" />
                                <span>暂无数据</span>
                              </div>
                            </el-table>
                          </div>
                        </el-tab-pane>

                        <!-- <el-tab-pane label="结算表" name="five" v-if="dialogType < 4">
                          <div class="table1 table-data">
                            <el-table :tooltip-effect="'light'" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" style="width: 100%" :data="detail" :show-summary="activeName2 === 'five'" :summary-method="getSummaries">
                              <el-table-column align="center" prop="subitemNum" label="子目号"></el-table-column>
                              <el-table-column align="center" label="清单项目名称" prop="detailName"></el-table-column>
                              <el-table-column align="center" label="设计工程量" prop="quantities"> </el-table-column>
                              <el-table-column align="center" label="合同单价" prop="price" v-if="pricePermission"> </el-table-column>
                              <el-table-column align="center" label="金额" prop="settleAmount"> </el-table-column>
                              <el-table-column align="center" label="本期完成工程量" prop="currentQuantities"> </el-table-column>
                              <el-table-column align="center" label="本期结算金额" prop="currentSettleAmount" v-if="pricePermission"></el-table-column>
                              <div slot="empty" class="empty" style="width: 100%">
                                <img src="@/assets/empty.svg" class="zanwu" />
                                <span>暂无数据</span>
                              </div>
                            </el-table>
                          </div>
                        </el-tab-pane> -->

                        <el-tab-pane :label="item.tableName" :name="'userTables' + index" v-for="(item, index) in tableDTOS" :key="index">
                          <div class="tab-box" @scroll="handleScroll">
                            <div class="text-html" v-if="tableStatus">
                              <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
                                <tr v-for="(item, idx) in item.tableHtml" :key="idx" style="" v-show="item.status">
                                  <td style="box-sizing: content-box;border:none;margin:0;padding:0" :contentEditable="i.attributeTypes == 1 && i.disabled == true && i.checkout == false && tableDTOS[index].editFlag == 1 && (dialogType !== 4 || dialogType === 1) && (i.id == '' || i.id == formData.currentNodeId || i.name == '')" @blur="tdBlur(item, id, $event.target.innerText, $event, i)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                                    <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                                    <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" :disabled="tableDTOS[index].editFlag != 1 && i.id != '' && i.id == formData.currentNodeId && i.name != ''" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
                                    <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}: <img width="100px" :src="i.signatureDate.img" alt="" /> </span>
                                    <el-select ref="scroll" v-if="i.attributeTypes == 2" size="mini" :disabled="tableDTOS[index].editFlag != 1 && i.id != '' && i.id == formData.currentNodeId && i.name != ''" v-model="i.name" placeholder="请选择">
                                      <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                                    </el-select>
                                  </td>
                                </tr>
                              </table>
                            </div>
                            <div class="mask" v-if="dialogType === 4"></div>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="验收流程附件" name="files1" v-if="(dialogType > 3 && treeReProcessFile.length) || dialogType < 4">
                          <div class="table1 table-data">
                            <el-table :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff' }" :data="treeReProcessFile" height="100%" style="width: 100%" :tree-props="{ children: 'children' }" row-key="fkItemId" ref="tables3">
                              <!-- <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column> -->
                              <el-table-column align="center" prop="itemCode">
                                <template slot="header" slot-scope="scope">
                                  <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables3', 'isExpand3', 'treeReProcessFile')"></i>
                                  <span :cleanRed="scope">项目编号</span>
                                </template>
                              </el-table-column>
                              <el-table-column label="项目名称" align="center" prop="itemName"> </el-table-column>
                              <el-table-column label="上传人" align="center" prop="createUserName"> </el-table-column>
                              <el-table-column label="上传时间" align="center" prop="createTime"> </el-table-column>
                              <el-table-column label="附件内容描述" align="center" prop="remark" show-overflow-tooltip> </el-table-column>
                              <el-table-column label="操作" align="center">
                                <template slot-scope="{ row }" v-if="row.grade == 4">
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
                        <el-tab-pane :label="dialogType === 1 ? '上传附件' : '附件'" name="files2">
                          <div class="table1 table-data">
                            <!-- 用单独一个table使用v-if隐藏某些行会导致样式错乱，所以使用2个table -->
                            <el-table :tooltip-effect="'light'" stripe :header-cell-style="{ background: '#f1f6ff' }" :data="accessoryList" height="100%" style="width: 100%" v-if="dialogType <= 3">
                              <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                              <el-table-column label="附件内容描述" align="center" prop="remark" show-overflow-tooltip>
                                <template slot-scope="{ row }">
                                  <el-input v-model="row.remark" size="mini" v-if="dialogType !== 2" maxlength="100"></el-input>
                                  <span v-else>{{ row.remark }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column label="附件" align="center" width="180">
                                <template slot-scope="{ row }">
                                  <el-button type="primary" size="mini" v-if="!row.fileName" @click="uploadAcc(row)">上传附件 </el-button>
                                  <a href="#" @click="preview(row)" v-else>{{ row.fileName }}</a>
                                </template>
                              </el-table-column>
                              <el-table-column label="操作" align="center" width="100" v-if="dialogType !== 2">
                                <template slot-scope="{ row, $index }">
                                  <span class="addAcc" v-if="accessoryList.length == $index + 1" @click="addAcc(row)" title="添加">
                                    <i class="el-icon-plus"></i>
                                  </span>
                                  <span class="delAcc" @click="delAcc(row)" title="删除">
                                    <i class="el-icon-close"></i>
                                  </span>
                                  <!-- <el-button
                            size="mini"
                            type="primary"
                            class="downloadAcc"
                            v-if="dialogType > 3"
                            @click="downloadAcc(row)"
                          >
                            下载
                          </el-button> -->
                                </template>
                              </el-table-column>
                              <div slot="empty" class="empty" style="width: 100%">
                                <img src="@/assets/empty.svg" class="zanwu" />
                                <span>暂无数据</span>
                              </div>
                            </el-table>
                            <el-table :tooltip-effect="'light'" stripe :header-cell-style="{ background: '#f1f6ff' }" :data="accessoryList" height="100%" style="width: 100%" v-if="dialogType > 3">
                              <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                              <el-table-column label="上传人" align="center" prop="createUserName" v-if="dialogType > 3"> </el-table-column>
                              <el-table-column label="上传时间" align="center" prop="createTime" v-if="dialogType > 3"> </el-table-column>
                              <el-table-column label="附件内容描述" align="center" prop="remark" show-overflow-tooltip> </el-table-column>
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
                  </el-tab-pane>
                  <el-tab-pane label="审批记录" name="second" v-if="dialogType === 4 || dialogType === 5 || dialogType === 6">
                    <div class="tables table-data">
                      <el-table :tooltip-effect="'light'" stripe style="width: 100%" height="100%" :data="approverList" :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
                        <el-table-column label="流程节点" align="center" prop="activityName"> </el-table-column>
                        <el-table-column label="负责人" align="center" prop="approver"></el-table-column>
                        <el-table-column label="审批意见" align="center" prop="approveComment" show-overflow-tooltip></el-table-column>
                        <el-table-column label="审批时间" align="center" prop="approveTime"> </el-table-column>
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
                <!-- 审批专用底部 -->
                <div v-if="dialogType === 5 || dialogType === 6">
                  <div class="approveDetail">
                    <div class="approveDetail-left">
                      <div class="approveDetail-head">审批意见</div>
                      <!-- <div class="pd-6">
                        <div class="appResult ">
                          {{ dialogType === 6 && orgType === 7 ? "确认" : "审批" }}结果： <el-radio v-model="approval.auditStatus" :label="1">{{ dialogType === 6 && orgType === 7 ? "确认" : "审批" }}通过</el-radio><br />
                          <el-radio v-model="approval.auditStatus" :label="2">{{ dialogType === 6 && orgType === 7 ? "确认" : "审批" }}不通过</el-radio>
                        </div>
                        <div class="appReamrk">
                          <div class="remark">
                            {{ dialogType === 6 ? "确认备注" : "被批意见" }}
                          </div>
                        </div>
                      </div> -->
                      <el-input type="textarea" resize="none" v-model="approval.approveComment" maxlength="200"> </el-input>
                    </div>
                    <div class="approveDetail-right">
                      <div class="approveDetail-head">附件</div>
                      <div class="appFile">
                        <div class="uploadBtn" @click="uploadAcc2" v-if="appAccList.length < 10">
                          <i class="el-icon-upload icons"></i>
                          <div>上传附件</div>
                        </div>
                        <div class="fileList appFileList">
                          <div class="fileList-item" v-for="(item, index) in appAccList" :key="item.id">
                            <!-- <i class="el-icon-document fileIcon"></i> -->
                            <div class="fileName" :title="item.fileName" @click="preview(item)">{{ item.fileName }}</div>
                            <span class="delFile" @click="delAcc(item, index)">X</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- <div class="approveBtn">
                <el-button size="mini" type="primary" @click="btnOk">{{ (dialogType === 6 && orgType === 7 ? "确认" : "审批")
                  + "验收流程" }}</el-button>
                <el-button size="mini" type="primary" plain @click="handleCancel(false)">取消</el-button>
              </div> -->
                </div>
              </el-main>
            </el-container>
          </div>
        </div>
      </div>
      <!-- 新增、草稿状态时专用底部 -->
      <div slot="footer" class="dialog-footer" v-if="[1, 3, 5, 6, 9, 10].includes(dialogType)">
        <el-button type="primary" v-if="dialogType === 1 && addNum == 2" @click="backNum">上一步</el-button>
        <el-button type="primary" v-if="dialogType === 1 && addNum == 1" @click="nextNum">下一步</el-button>
        <el-button type="primary" v-if="[1, 3].includes(dialogType) && addNum == 2 && !siStatus" @click="checkCode" :disabled="loading">发起审批流程</el-button>
        <el-button type="primary" @click="btnOk(0)" :disabled="loading" v-if="dialogType === 1 && addNum == 1">保存草稿</el-button>
        <el-button type="primary" @click="signerClick" @keyup.space.native.prevent @keyup.prevent @keydown.enter.native.prevent :disabled="loading" v-if="([1, 3].includes(dialogType) && addNum == 2 && siStatus) || (![1, 3].includes(dialogType) && siStatus)">签名</el-button>
        <el-button size="mini" v-if="dialogType === 6 || (dialogType === 5 && !siStatus)" type="primary" @click="btnOk(null, 1)">审批通过</el-button>
        <el-button size="mini" v-if="dialogType === 6 || dialogType === 5" type="danger" @click="btnOk(null, 2)">审批不通过</el-button>
        <el-button type="danger" @click="withdraw" :disabled="loading" v-if="[9, 10].includes(dialogType)">撤回</el-button>
        <el-button type="primary" plain @click="handleCancel(false)">取 消</el-button>
      </div>
      <!-- 隐藏的input file,用于上传附件 -->
      <input ref="upload" type="file" style="display:none" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.docx,image/jpg,image/jpeg,image/png,application/pdf" @change="upLoad" />
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.fileUrl" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj.fileUrl" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <approveCodeDialog ref="approveCodeDialog" :siStatus="siStatus" @signature="signature" :approveCodeDialog.sync="approveCodeDialog" :signed="signed" @closeLoading="closeLoading" :sign-date="signDate" @approveOk="approveOk" :noApprove="[9, 10].includes(dialogType) ? true : false" @close="loading = false" :biz-type="1" :appCodeType="appCodeType" @getNew="getNew"/>
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
    <!-- 设置审批人 -->
    <el-dialog :close-on-press-escape="false" title="设置审批人" width="70%" class="tree-dialog" top="5vh" :visible="approvalShow" v-loading="loading" v-dialogDrag :close-on-click-modal="false" @close="approvalCancel(0)">
      <div class="approver-edit" v-if="!errShow" :style="{ overflow: approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId ? 'hidden' : 'auto' }">
        <div class="begin-box">
          <div class="begin">
            <div class="circle"></div>
          </div>
          <div class="begin-text wh-100" style="">审批人员</div>
        </div>
        <div class="node-box">
          <div v-for="(item, index) in approvalData.workflowNodeDTOS" :key="index" v-show="item.nodeType == 2" style="margin-top:20px" class="node-item">
            <div class="node">
              <i class="el-icon-user-solid"></i>
              {{ item.nodeName }}
              <i class="el-icon-bottom node-icon"></i>
            </div>
            <el-select @change="selectedUserIdChange" :clearable="item.prodSysRoleVo.sysUserList.length != 0" :class="{ 'background-red': item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1 && !item.prodSysRoleVo.selectedUserId) }" v-model="item.prodSysRoleVo.selectedUserId" size="mini" :disabled="chekcDisabled || item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1)" class="wh-100 ml-20" v-if="item.nodeType == 2">
              <el-option v-for="items in item.prodSysRoleVo.sysUserList" :key="items.pkId" :label="items.userName" :value="items.pkId"></el-option>
              <el-option v-if="item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1 && !item.prodSysRoleVo.selectedUserId)" label="未找到匹配人员" value=""></el-option>
            </el-select>
          </div>
        </div>
        <div class="begin-box finish-box">
          <div class="begin finish">
            <div class="circle"></div>
            <div class="finish-text">结束</div>
            <i class="el-icon-bottom finish-icon"></i>
          </div>
          <div class="begin-text wh-100"></div>
        </div>
        <!-- <div class="explain">
          说明：如果企业设置了不可跳过节点，点击设置时，有未选择人员的节点或未找到匹配人员的节点，都提示“XXX（节点名称）未配置人员”。
        </div> -->
        <div class="noAppMask" v-if="approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId">此流程节点只能由【{{ approvalData.workflowNodeDTOS[1].prodSysRoleVo.roleName }}】发起</div>
      </div>
      <div v-if="errShow" class="approver-edit errMsg">
        <h2>请先设置分包计价审批流程</h2>
      </div>
      <div slot="footer" v-if="!chekcDisabled && !errShow && !(approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId)">
        <el-button size="mini" type="primary" @click="approvalSet">设置</el-button>
        <el-button size="mini" @click="approvalCancel(0)">取 消</el-button>
      </div>
    </el-dialog>
    <nodeDetail :dialogVisible2.sync="dialogVisible2" :getData="nodeData" :type="nodeType"></nodeDetail>
    <chapterProcessApproval :chaptersApprovalDialog.sync="chaptersApprovalDialog" :not-now="true" :not-now-data="nodeData"></chapterProcessApproval>
  </div>
</template>

<script>
import api from "@/api/api";
import COS from "cos-js-sdk-v5";
import pdfPiev from "../../../components/pdf-preview/pdf-preview.vue";
import approveCodeDialog from "@/components/approveCodeDialog.vue";
import utils from "@/utils/util";
import { uploadObject } from "@/utils/upload";
import htmlToPdf from "@/utils/htmlToPdf";
import printJs from "print-js";
import flows from "./flow.vue";
import moment from "moment";
import nodeDetail from "./nodeDetail.vue";
import signPdf from "../../../components/signPdf/signPdf.vue";
import chapterProcessApproval from "../../../components/inChapter/chapterProcessApproval2.vue";
import htmlToPdfUpload from "@/utils/htmlToPdfUpload";
import { uploadObjectPdf } from "@/utils/uploadPdf";
export default {
  components: { pdfPiev, approveCodeDialog, flows, nodeDetail, signPdf, chapterProcessApproval },
  props: {
    // 控制弹框开关
    dialogVisible: {
      type: Boolean,
      default: false
    },
    // 打开弹窗类型 1为新增/编辑，2为查看，3为发起流程，4为查看审批流程，5为审批，6为确认,7为查看盖章,8为已办查看,9为审批撤回,10为盖章撤回
    dialogType: {
      type: Number
    },
    orgType: {
      type: Number
    },
    // 用于获取结算信息的id
    pkId: {
      type: String,
      default: ""
    },
    // 辨别分包计价和业主计量,结算对象 建设单位为 0 分包单位为 1
    settlementObject: {
      type: Number,
      default: 1
    },
    getItemOrgType: {
      type: String
    },
    signData: {},
    again: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      nowTab: 1,
      signTab: "1",
      activeName1: "first",
      activeName2: "first",
      options: [],
      subOption: [],
      userOptions: [],
      formData: {
        approver: "",
        settleName: "",
        fkApproverId: "",
        beginDate: "",
        endDate: "",
        endSettleAmount: 0,
        finishAmount: 0,
        lastSettleAmount: 0,
        remark: "",
        settleAmount: 0,
        settleDate: "",
        settleStatus: 0,
        settleDetails: [],
        fkContractId: "",
        taskFinishVoList: []
      },
      approval: {
        auditStatus: 1,
        pkId: "",
        approveComment: "",
        approver: "",
        fkApproverId: "",
        currentNodeId: ""
      },
      fkBySettleOrgId: "",
      isDetail: 0,
      statsItem: [],
      treeStatsItem: [],
      approverList: [],
      fkApproverId: "",
      roleName: "",
      bpmnImg: "",
      bpmnModeler: null,
      loading: false,
      checkList: [],
      // 附件列表
      accessoryList: [{ id: 1, fileName: "", remark: "", fileUrl: "" }],
      // 当前点击表单上传的数据
      nowUploadObj: {},
      // 当前预览的表单obj
      nowPreviewObj: {},
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      // 审批时添加的附件列表
      appAccList: [],
      // 附件文件类型
      fileType: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpg", "image/jpeg", "image/png", "application/pdf"],
      // pdf弹框数据
      url: "",
      secondMaxLength: 12,
      engExpenseDetail: [], // 费用列表
      engDeductionDetail: [], // 材料扣减列表
      itemDeductions: [], // 分项扣减列表
      treeItemDeductions: [],
      taxAmount: 0,
      hasTaxAmount: 0,
      approveCodeDialog: false,
      signDate: {},
      tableDTOS: [],
      reProcessFile: [],
      treeReProcessFile: [],
      contractList: [],
      isExpand1: false,
      isExpand2: false,
      isExpand3: false,
      pdfTable: [],
      pdfTitle: [],
      pdfUrl: [],
      newAddList: [],
      delList: [],
      showNext: false,
      approvalShow: false,
      approvalStatus: false,
      approvalData: {},
      addTime: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      endTime: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      approveSum: null,
      chekcDisabled: false,
      ranKey: Math.random(),
      dialogVisible2: false,
      nodeData: {},
      signDetail: {
        sealApproveDetailVo: {},
        sealScheduleDetailList: [],
        sealTableList: []
      },
      modifiedList: [],
      chaptersApprovalDialog: false,
      siStatus: false,
      tableStatus: true,
      beginRow: false,
      errShow: false,
      detailList: [],
      settleChapterVos: [],
      nodeType: 0,
      addNum: 1, //新增/编辑的步数
      flowShow: true, //流程图显示隐藏
      signed: false,
      appCodeType: 0,
      workflowNodeDTOS2: []
    };
  },
  methods: {
    getNew() {
      if ([5, 6].includes(this.dialogType)) {
        this.siStatus = false;
        this.signed=false
        const roleId = this.formData.roleId;
        const sysRoleId = this.formData.sysRoleId;
        this.$api.getApproveStatus().then(res => {
          this.appCodeType = res.data;
          if (res.data == 2 || res.data == 3) {
            this.tableDTOS.forEach(item => {
              if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
                item.tableHtml.forEach(e => {
                  e.arr.forEach(i => {
                    if (i.attributeTypes == 3) {
                      if (sysRoleId == i.signatureDate.signer) {
                        i.signatureDate.img = "";
                        this.siStatus = true;
                      }
                      if (roleId == i.signatureDate.signer) {
                        i.signatureDate.img = "";
                        this.siStatus = true;
                      }
                    }
                  });
                });
              }
            });
          }
        });
      } else {
        this.getSign();
      }
    },
    getSign() {
      this.siStatus = false;
      this.signed=false
      this.$api.getApproveStatus().then(res => {
        this.appCodeType = res.data;
        if (res.data == 2 || res.data == 3) {
          this.tableDTOS.forEach(item => {
            if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
              item.tableHtml.forEach(e => {
                e.arr.forEach(i => {
                  if (i.attributeTypes == 3) {
                    console.log(i);
                    if ([this.approvalData.workflowNodeDTOS[1].fkRoleId, this.approvalData.workflowNodeDTOS[1].sysRoleId].includes(i.signatureDate.signer)) {
                      i.signatureDate.img = "";
                      this.siStatus = true;
                    }
                  }
                });
              });
            }
          });
        }
      });
    },
    approveOk(unique) {
      console.log(unique);
      if ([1, 3].includes(this.dialogType)) {
        this.btnOk(1, null, unique);
      } else {
        this.projectExamine(unique);
      }
    },
    checkCode() {
      if (this.approvalData.launchType == 2) {
        this.$refs.approveCodeDialog.getApproveStatus();
      } else {
        this.btnOk(1);
      }
    },
    backNum() {
      this.addNum = 1;
      this.activeName2 = "first";
      if (!this.accessoryList.length) {
        this.accessoryList = [{ id: 1, fileName: "", remark: "", fileUrl: "" }];
      }
    },
    nextNum() {
      const { endDate, settleDate, settleName, fkContractId } = this.formData;
      if (!endDate) {
        return this.$message.warning("结算周期结束日期不能为空");
      }
      if (!settleDate) {
        return this.$message.warning("结算日期不能为空");
      }
      if (!settleName) {
        return this.$message.warning("结算单名称不能为空");
      }
      if (!fkContractId) {
        return this.$message.warning("结算清单未选择");
      }
      if (Date.parse(endDate) > Date.parse(settleDate)) {
        return this.$message.warning("结算时间不能比结算周期结束时间小");
      }
      if (!this.approvalStatus) {
        return this.$message.warning("请先设置审批人");
      }
      let NodeArr = this.approvalData.workflowNodeDTOS.filter(item => item.nodeType == 2);
      if (this.approvalData.launchType == 2 && !NodeArr[0].prodSysRoleVo.selectedUserId) {
        return this.$message.warning("首个节点必须有人");
      }
      this.accessoryList = this.accessoryList.filter(item => item.fileUrl);
      let arr = this.approvalData.workflowNodeDTOS;
      let arr2 = arr.map(item => {
        if (item.nodeType == 2) {
          return { activityName: item.prodSysRoleVo.roleName, ...item, assignee: item.prodSysRoleVo.selectedUserId ? item.prodSysRoleVo.sysUserList.filter(item2 => item.prodSysRoleVo.selectedUserId == item2.pkId)[0].userName : "" };
        } else {
          return item;
        }
      });
      arr2.splice(arr2.length - 1);
      this.formData.taskFinishVoList = arr2;
      this.getSettleInfo();
      // this.addNum = 2
    },
    expenBlur(row) {
      this.detailList.forEach(item => {
        if (item.pkId == row.fkDetailId) {
          item.currentSettleAmount = row.settleAmount;
        }
      });
    },
    getSettleInfo() {
      let arr = this.engExpenseDetail.filter(item => item.type);
      let nums = 0;
      this.showEngDeductionDetail.forEach(item => {
        nums = nums + (item.settleAmount - 0);
      });
      let data = {
        endDate: this.formData.endDate,
        contractId: this.formData.fkContractId,
        pkId: this.formData.pkId,
        deductionAmount: nums,
        settleExpenseInfos: arr.map(item => ({ fkDetailId: item.fkDetailId, settleAmount: item.settleAmount }))
      };
      this.$api.getSettleInfo(data).then(res => {
        if (res.code === 200) {
          this.settleChapterVos = res.data.settleChapterVos;
          this.formData.settleSummaryList = res.data.settleSummaryList;
          this.addNum = 2;
          this.activeName2 = "five";
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    signature(res) {
      if ([1, 3].includes(this.dialogType)) {
        this.signUrl = res.data.url;
        this.tableDTOS.forEach(item => {
          if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
            item.tableHtml.forEach(e => {
              e.arr.forEach(i => {
                if (i.attributeTypes == 3) {
                  if ([this.approvalData.workflowNodeDTOS[1].fkRoleId, this.approvalData.workflowNodeDTOS[1].sysRoleId].includes(i.signatureDate.signer)) {
                    i.signatureDate.img = res.data.url;
                    this.siStatus = false;
                    item.isModified = "1";
                  }
                }
              });
            });
          }
        });
      } else {
        if (this.pdfTable.length != 0) {
          this.pdfTable.forEach(item => {
            item.forEach(e => {
              e.arr.forEach(i => {
                if (i.attributeTypes == 3) {
                  if (i.signatureDate.signer == this.formData.roleId || i.signatureDate.signer == this.formData.sysRoleId) {
                    i.signatureDate.img = res.data.url;
                  }
                }
              });
            });
          });
        }
        this.tableDTOS.forEach(item => {
          if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
            item.tableHtml.forEach(e => {
              e.arr.forEach(i => {
                if (i.attributeTypes == 3) {
                  if (i.signatureDate.signer == this.formData.roleId || i.signatureDate.signer == this.formData.sysRoleId) {
                    i.signatureDate.img = res.data.url;
                    this.tableStatus = false;
                    this.tableStatus = true;
                    this.siStatus = false;
                    item.isModified = "1";
                  }
                }
              });
            });
          }
        });
      }
    },
    signerClick() {
      this.$refs.approveCodeDialog.getApproveStatus(true);
    },
    getSummariesChat(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if ((this.pricePermission && index == 7) || (!this.pricePermission && index == 5)) {
          console.log(index);
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return (prev + curr).toFixed(6) - 0;
              } else {
                return prev;
              }
            }, 0);
          } else {
            sums[index] = "N/A";
          }
        }
      });
      return sums;
    },
    getSummaries3(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (["合同金额", "结算金额"].includes(column.label)) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return (prev + curr).toFixed(6) - 0;
              } else {
                return prev;
              }
            }, 0);
          } else {
            sums[index] = "N/A";
          }
        }
      });
      return sums;
    },
    getSummaries4(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (["本期扣款金额"].includes(column.label)) {
          const values = data.map(item => (item.type ? item.settleAmount - 0 : 0));
          console.log(values);
          if (!values.every(value => isNaN(value))) {
            sums[index] =
              0 -
              values.reduce((prev, curr) => {
                const value = Number(curr);
                if (!isNaN(value)) {
                  return (prev + curr).toFixed(6) - 0;
                } else {
                  return prev;
                }
              }, 0);
          } else {
            sums[index] = "N/A";
          }
        }
      });
      return sums;
    },
    withdraw() {
      this.loading = true;
      this.$refs.approveCodeDialog.getApproveStatus();
    },
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
    // 查看审批记录详情
    checkNodes(row) {
      const data = {
        flowCaseId: row.flowCaseId,
        nodeId: row.currentNodeId,
        taskId: row.taskId
      };
      this.nodeType = row.currentNodeId == 0 ? 1 : 0;
      this.$api.searchByBusinessNode(data).then(res => {
        if (res.code === 200) {
          this.nodeData = res.data.engStatsProjectSettleVo;
          this.dialogVisible2 = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getSettleWorkflowTable() {
      this.$api.getSettleWorkflowTable({ settleType: 2 }).then(res => {
        if (res.code == 200) {
          this.tableDTOS = res.data ? res.data : [];
          if (this.tableDTOS) {
            const arr1 = JSON.stringify(this.tableDTOS);
            this.modifiedList = JSON.parse(arr1);
            this.modifiedList.forEach(item => {
              item.tableHtml = this.utils.unzip(item.tableHtml);
            });

            this.tableDTOS.forEach(item => {
              item.pkId = item.fkTableId;
              item.tableHtml = this.utils.unzip(item.tableHtml);
              if (item.tableHtml instanceof Array) {
              } else {
                item.tableHtml = JSON.parse(item.tableHtml);
              }
            });
            if (this.approvalData.launchType == 2) {
              this.getSign();
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    approvalClick() {
      if (!this.fkBySettleOrgId) {
        return this.$message.warning("请选择分包单位");
      }
      if (this.dialogType == 2) {
        this.chekcDisabled = true;
      } else {
        this.chekcDisabled = false;
      }
      this.approvalShow = true;
      this.workflowNodeDTOS2 = JSON.parse(JSON.stringify(this.approvalData.workflowNodeDTOS)); // 用于临时保存克隆数据
    },
    selectedUserIdChange() {
      // this.approvalStatus = true;
    },
    getApproverSettle(data) {
      this.errShow = false;
      this.$api.getApproverSettle(data).then(res => {
        if (res.code == 200) {
          if (res.data) {
            res.data.workflowNodeDTOS.forEach((item, index) => {
              if (item.nodeType == 2) {
                item.prodSysRoleVo = item.prodSysRoleVo == null ? { selectedUserId: "", sysUserList: [] } : item.prodSysRoleVo;
                // item.prodSysRoleVo.selectedUserId = item.prodSysRoleVo.selectedUserId == null ? "" : item.prodSysRoleVo.selectedUserId;
                if (res.data.launchType == 2 && index == 1) {
                  let arr = item.prodSysRoleVo.sysUserList.filter(item => item.pkId == this.user.pkId);
                  item.prodSysRoleVo.selectedUserId = arr.length ? this.user.pkId : "";
                  this.signDate = {
                    fkNodeId: item.pkId,
                    fkTemplateId: item.fkWorkflowTemplateId
                  };
                } else {
                  item.prodSysRoleVo.selectedUserId = item.prodSysRoleVo.selectedUserId == null ? "" : item.prodSysRoleVo.selectedUserId;
                  if (item.prodSysRoleVo.sysUserList.length && !item.prodSysRoleVo.selectedUserId) {
                    item.prodSysRoleVo.selectedUserId = item.prodSysRoleVo.sysUserList[0].pkId;
                  }
                }
              }
            });
            this.approvalData = res.data;
            this.getSettleWorkflowTable();
          } else {
            this.approvalStatus = false;
            this.errShow = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    approvalSet() {
      let nodeArr = this.approvalData.workflowNodeDTOS.filter(item => item.nodeType == 2);
      if (this.approvalData.launchType == 2 && !nodeArr[0].prodSysRoleVo.selectedUserId) {
        return this.$message.warning("首个节点必须有人");
      }
      const arr = this.approvalData.workflowNodeDTOS;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].nodeType == 2) {
          if (arr[i].prodSysRoleVo && !!arr[i].prodSysRoleVo.selectedUserId) {
            this.approvalStatus = true;
            this.approvalCancel(1);
            return;
          } else {
            this.approvalStatus = false;
            this.approvalCancel(1);
          }
        }
      }
    },
    approvalCancel(num) {
        if (num == 1 && this.approvalShow == true) {
        this.approvalShow = false;
      }
      if (num == 0 && this.approvalShow == true) {
        this.approvalShow = false;
        this.approvalData.workflowNodeDTOS = this.workflowNodeDTOS2;
      }
      return;
      if (this.dialogType === 1 && !this.formData.pkId) {
        // this.approvalStatus = false;
        this.getApproverSettle({ settleType: 2, customId: this.fkBySettleOrgId });
      }
      if (this.dialogType === 1 && this.formData.pkId) {
        // this.approvalStatus = true;
        this.getApproverSettle({ settleType: 2, pkId: this.formData.pkId, customId: this.fkBySettleOrgId });
      }
    },
    // ===========================================
    dataExport() {
      this.loading = true;
      this.pdfUrl = [];
      if (this.pdfTable.length == 0) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.pkId
        };
        this.getBatchExportFile(data);
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
    getBatchExportFile(data) {
      this.$api
        .getBatchExportFile(data)
        .then(res => {
          if (res.code == 200) {
            this.loading = false;
            utils.downFile(res.data.tableFileUrl, res.data.fileName);
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
        .catch(err => {
          this.loading = false;
          this.$message.warning(err);
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
    urlPush(url, type) {
      const width = this.pdfTitle[this.pdfUrl.length].type == "2" ? 842 : 596;
      const height = this.pdfTitle[this.pdfUrl.length].type == "2" ? 596 : 842;
      this.pdfUrl.push({ path: url, width, height, name: this.pdfTitle[this.pdfUrl.length].title, direction: this.pdfTitle[this.pdfUrl.length].type });
      if (this.pdfUrl.length == this.pdfTable.length) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.pkId
        };
        if (type === 0) {
          this.getBatchExportFile(data);
        } else {
          this.putExportFile(data);
        }
      }
    },
    dataPrinting() {
      this.loading = true;
      this.pdfUrl = [];
      if (this.pdfTable.length == 0) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.pkId
        };
        this.putExportFile(data);
      } else {
        this.pdfTable.forEach((item, idx) => {
          htmlToPdf
            .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
            .then(res => {
              // console.log(res)
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

    putExportFile(data) {
      this.$api
        .putExportFile(data)
        .then(res => {
          if (res.code == 200) {
            this.loading = false;
            printJS({ printable: res.data.tableFileUrl, type: "pdf" });
            // window.open(res.data.url);
            // // 使用 window.open 为了安全可加下面这行
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
    // ===========================================
    listToTree(list, myId) {
      const children = [];
      list.forEach(item => {
        if (item.fkParentItemId === myId) {
          item.children = this.listToTree(list, item.fkItemId);
          children.push(item);
        }
      });
      return children;
    },
    listToTree2(list, myId) {
      const children = [];
      list.forEach(item => {
        if (item.fkParentId === myId) {
          item.children = this.listToTree2(list, item.fkItemId);
          children.push(item);
        }
      });
      return children;
    },
    getCustomListByType(isTrue) {
      api.getCustomListByType({ contractType: 4, customId: this.fkBySettleOrgId }).then(res => {
        if (res.code === 200) {
          this.contractList = res.data;
          if (isTrue) {
            this.formData.taxRate = this.contractList.filter(item => item.pkId === this.formData.fkContractId)[0].taxRate;
            this.taxAmount = this.formData.taxRate ? (((this.formData.settleAmount * this.formData.taxRate).toFixed(2) - 0) / 100).toFixed(2) - 0 : 0;
            this.hasTaxAmount = (this.formData.settleAmount - 0 + this.taxAmount).toFixed(2) - 0;
            this.formData.endSettleAmount = (this.formData.lastSettleAmount - 0 + this.hasTaxAmount).toFixed(2) - 0;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据id获取项目结算信息
    getProjectSettingById(type) {
      api.getStatsProjectById({ pkId: this.pkId, type }).then(res => {
        if (res.code === 200) {
          this.formData = res.data;
          this.saveAmount = res.data.settleAmount;
          this.fkApproverId = res.data.fkApproverId;
          this.fkBySettleOrgId = res.data.fkBySettleOrgId;
          // if(this.dialogType===1){
          this.formData.taxRate = res.data.taxRate;
          // this.detailList = res.data.settleInfoList ? res.data.settleInfoList : [];
          if (this.user.orgType == 5) {
            this.getCustomListByType(true);
          }
          this.approvalStatus = !res.data.settingApproveFlag;
          // }
          if (this.dialogType === 2) {
            this.accessoryList = res.data.fileList && res.data.fileList.length ? res.data.fileList : [];
          } else {
            this.accessoryList = res.data.fileList && res.data.fileList.length ? res.data.fileList.map((item, index) => ({ ...item, id: index + 1 })) : [{ id: 1, fileName: "", remark: "" }];
          }
          this.getApproverSettle({ settleType: 2, pkId: this.formData.pkId, customId: this.fkBySettleOrgId });
          // this.statsItem = res.data.settleDetails;
          if (type === 2) {
            this.searchStatsItemFinishByPkId();
            // this.getSettleInfo();
          } else {
            const arr = res.data.settleDetails
              ? res.data.settleDetails.map(item => {
                  if (item.isTemporary !== 1) {
                    return {
                      ...item,
                      isChoose: 1,
                      fkItemDetailId: item.fkItemDetailId ? item.fkItemDetailId : item.fkSysItemDetailId
                    };
                  } else {
                    return {
                      ...item,
                      isChoose: 1,
                      fkItemDetailId: item.fkItemDetailId ? item.fkItemDetailId : item.fkSysItemDetailId
                    };
                  }
                })
              : [];
            if (this.dialogType == 1) {
              this.statsItem = arr;
            } else {
              this.statsItem = arr.filter(item => item.isChoose);
            }
            this.treeStatsItem = this.listToTree(this.statsItem, "0");
          }
          this.checkList = this.statsItem.filter(item => item.isChoose && item.grade == 3).map(item => item.fkItemId);
          this.formData.isAgainChoice = false;
          this.engExpenseDetail = res.data.engExpenseDetailVos ? res.data.engExpenseDetailVos : [];
          this.engDeductionDetail = res.data.engDeductionDetailVos ? res.data.engDeductionDetailVos.map(item => ({ ...item, settleAmount: item.deductionAmount })) : [];
          this.itemDeductions = res.data.itemDeductions ? res.data.itemDeductions : [];
          this.treeItemDeductions = this.listToTree2(this.itemDeductions, "0");
          this.ranKey = Math.random();
          const fileArr = [];
          const arr2 = res.data.itemReProcessFileVos ? res.data.itemReProcessFileVos.filter(item => item.grade !== 4) : [];
          arr2.forEach(item => {
            fileArr.push(item);
            if (item.grade === 3 && item.reProcessFileVos) {
              fileArr.push(...item.reProcessFileVos.map((item2, index2) => ({ ...item2, grade: 4, fkItemId: item.fkItemId + "" + index2, fkParentItemId: item.fkItemId })));
            }
          });
          this.reProcessFile = fileArr;
          this.treeReProcessFile = this.listToTree(this.reProcessFile, "0");
          this.tableDTOS = res.data.workflowTableList ? res.data.workflowTableList : [];
          if (this.tableDTOS) {
            const arr1 = JSON.stringify(this.tableDTOS);
            this.modifiedList = JSON.parse(arr1);
            this.modifiedList.forEach(item => {
              item.tableHtml = this.utils.unzip(item.tableHtml);
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
        } else {
          this.$message.warning(res.msg);
        }
      });
      // .catch((err) => {
      //   this.loading = false;
      //
      // });
    },
    // 根据id获取审批信息
    getApprove(type) {
      api
        .getStatsProjectById({ pkId: this.pkId, type })
        .then(res => {
          this.$emit("closeLoading");
          if (res.code === 200) {
            if (res.data) {
              this.approveSum = null;
              res.data.taskFinishVoList.slice(1).forEach((item, index) => {
                if (item.approveStatus == 1 || item.approveStatus == 3) {
                  this.approveSum = index;
                  if (item.approveStatus == 1) {
                    this.beginRow = true;
                  }
                }
              });
              this.formData = res.data;
              console.log(this.formData.currentNodeId);
              this.saveAmount = res.data.settleAmount;
              this.fkBySettleOrgId = res.data.fkBySettleOrgId;
              this.formData.taxRate = res.data.taxRate;
              this.detailList = res.data.settleInfoList ? res.data.settleInfoList : [];
              this.settleChapterVos = res.data.settleChapterVos ? res.data.settleChapterVos : [];
              this.formData.settleSummaryList = res.data.settleSummaryList ? res.data.settleSummaryList : [];
              if (this.user.orgType == 5) {
                this.getCustomListByType(true);
              }
              if (res.data.settleStatus == 7) {
                this.getStatsItemFinish();
                // this.getSettleInfo();
              } else {
                this.statsItem = res.data.settleDetails;
                this.treeStatsItem = this.listToTree(this.statsItem, "0");
              }
              // this.detail = res.data.details;
              this.approverList = res.data.approveDetailList;
              this.engExpenseDetail = res.data.engExpenseDetailVos ? res.data.engExpenseDetailVos : [];
              this.engDeductionDetail = res.data.engDeductionDetailVos ? res.data.engDeductionDetailVos.map(item => ({ ...item, settleAmount: item.deductionAmount })) : [];
              this.itemDeductions = res.data.itemDeductions ? res.data.itemDeductions : [];
              this.treeItemDeductions = this.listToTree2(this.itemDeductions, "0");
              console.log(this.itemDeductions, this.treeItemDeductions);
              this.approval.currentNodeId = res.data.currentNodeId;
              this.ranKey = Math.random();
              this.bpmnImg = res.data.diagramData;
              if (this.dialogType === 4) {
                this.accessoryList = res.data.fileList ? res.data.fileList : [];
              } else {
                this.accessoryList = res.data.fileList ? res.data.fileList.filter(item => !item.deleteFlag) : [];
                this.appAccList = res.data.fileList && res.data.fileList.filter(item => item.deleteFlag).length ? res.data.fileList.filter(item => item.deleteFlag).map((item, index) => ({ ...item, id: index + 1 })) : [];
                // this.findUserListByType2();
              }
              this.$nextTick(() => {
                this.formData.settleAmount = res.data.settleAmount;
              });
              const fileArr = [];
              const arr2 = res.data.itemReProcessFileVos ? res.data.itemReProcessFileVos.filter(item => item.grade !== 4) : [];
              arr2.forEach(item => {
                fileArr.push(item);
                if (item.grade === 3 && item.reProcessFileVos) {
                  fileArr.push(...item.reProcessFileVos.map((item2, index2) => ({ ...item2, grade: 4, fkItemId: item.fkItemId + "" + index2, fkParentItemId: item.fkItemId })));
                }
              });
              this.reProcessFile = fileArr;
              this.treeReProcessFile = this.listToTree(this.reProcessFile, "0");
              this.activeName2 = "five";
              this.signDetail = res.data.sealBusinessVo
                ? res.data.sealBusinessVo
                : {
                    sealApproveDetailVo: {},
                    sealScheduleDetailList: [],
                    sealTableList: []
                  };
              this.tableDTOS = res.data.workflowTableList ? res.data.workflowTableList : [];
              if (this.tableDTOS) {
                const arr1 = JSON.stringify(this.tableDTOS);
                this.modifiedList = JSON.parse(arr1);
                this.modifiedList.forEach(item => {
                  item.tableHtml = utils.unzip(item.tableHtml);
                });
                this.pdfTable = [];
                this.pdfTitle = [];
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
              this.signDate = {
                fkBizId: res.data.pkId,
                fkNodeId: res.data.currentNodeId,
                fkTemplateId: res.data.workflowTemplate.pkId
              };
              // this.init("lookCanva");
            }
            if ([5, 6].includes(this.dialogType)) {
              this.siStatus = false;
              const roleId = res.data.roleId;
              const sysRoleId = res.data.sysRoleId;
              this.$api.getApproveStatus().then(res => {
                this.appCodeType = res.data;
                if (res.data == 2 || res.data == 3) {
                  this.tableDTOS.forEach(item => {
                    if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
                      item.tableHtml.forEach(e => {
                        e.arr.forEach(i => {
                          if (i.attributeTypes == 3) {
                            // console.log("xxxxxxxxxxxxxx")
                            // console.log(i.signatureDate)
                            // console.log(roleId)
                            // console.log(sysRoleId)
                            // console.log("xxxxxxxxxxxxxx")
                            // debugger
                            // let userArr = JSON.parse(sessionStorage.getItem("user"))
                            // console.log("*********************")
                            // console.log( userArr.systemRoleList)
                            // console.log("*********************")
                            // userArr.systemRoleList.forEach(a=>{
                            if (roleId == i.signatureDate.signer) {
                              i.signatureDate.img = "";
                              this.siStatus = true;
                            }
                            // })
                            // userArr.roleList.forEach(a=>{
                            if (sysRoleId == i.signatureDate.signer) {
                              i.signatureDate.img = "";
                              this.siStatus = true;
                            }
                            // })
                            // console.log("Xxxxxxxxxxxxxxxx");
                            // console.log(this.siStatus);
                            // console.log(i.signatureDate);
                            // console.log(this.user.systemRoleList);
                            // console.log("Xxxxxxxxxxxxxxxx");
                          }
                        });
                      });
                    }
                  });
                }
              });

              // 擦尼玛
            }
          } else {
            // this.init("lookCanva");
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.log("xxxxxxxxxxxxxxxxx");
          console.log(err);
          console.log("xxxxxxxxxxxxxxxxx");
          this.$emit("closeLoading");
          // this.init("lookCanva");
          // this.loading = false;
        });
    },
    // 获取项目部
    getAllProject() {
      api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分包单位
    getSubList() {
      api.findCustomByUserId().then(res => {
        if (res.code === 200) {
          this.subOption = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取新增前置条件
    getBeforeAddSetting(data) {
      api.getSettlementFront(data).then(res => {
        if (res.code === 200) {
          this.formData.beginDate = res.data.beginDate;
          this.formData.lastSettleAmount = res.data.lastSettleAmount;
          this.engExpenseDetail = res.data.engExpenseDetailVos ? res.data.engExpenseDetailVos.map(item => ({ ...item, settleAmount: item.costAmount })) : [];
          this.engDeductionDetail = res.data.engDeductionDetailVos ? res.data.engDeductionDetailVos.map(item => ({ ...item, settleAmount: null })) : []; // 默认价格为合同单价
          this.itemDeductions = res.data.itemDeductions ? res.data.itemDeductions : [];
          this.treeItemDeductions = this.listToTree2(this.itemDeductions, "0");
          this.computedAmount();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // // 根据结算类型获取员工列表
    // findUserListByType() {
    //   api
    //     .findUserListByType({
    //       settlementType: this.settlementObject
    //     })
    //     .then(res => {
    //       if (res.code === 200) {
    //         if(res.data){
    //           this.showNext=true
    //           this.userOptions = res.data.sysUserList ? res.data.sysUserList : [];
    //           this.roleName = res.data.roleName;
    //           // 如果列表只有一个，默认选中
    //           if (this.userOptions.length == 1) {
    //             this.fkApproverId = this.userOptions[0].pkId;
    //             this.formData.fkApproverId = this.userOptions[0].pkId;
    //             this.formData.approver = this.userOptions[0].userName;
    //           }
    //         }else{
    //           this.showNext=false
    //         }
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //     });
    // },
    // 根据结算类型获取员工列表
    findUserListByType2() {
      api
        .findUserListByWorkflowIdSettle({
          pkId: this.formData.pkId
        })
        .then(res => {
          if (res.code === 200) {
            if (res.data) {
              this.showNext = true;
              this.userOptions = res.data.sysUserList ? res.data.sysUserList : [];
              this.roleName = res.data.roleName;
              // 如果列表只有一个，默认选中
              if (this.userOptions.length == 1) {
                this.fkApproverId = this.userOptions[0].pkId;
                this.approval.fkApproverId = this.userOptions[0].pkId;
                this.approval.approver = this.userOptions[0].userName;
              }
            } else {
              this.showNext = false;
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
    },
    // 查询分项工程列表或工程细目
    getStatsItemFinish() {
      if (!this.formData.endDate) {
        return this.$message.warning("请先选择截止时间");
      }
      if (this.getItemOrgType == 1 && !this.fkBySettleOrgId) {
        return this.$message.warning("请先选择分包单位");
      }
      api
        .searchStatsItemFinishByProOrgId({
          endDate: this.formData.endDate,
          orgType: this.getItemOrgType,
          customerId: this.fkBySettleOrgId,
          contractId: this.formData.fkContractId
        })
        .then(res => {
          if (res.code === 200) {
            // this.detail = res.data.detailItems;
            // 根据下级数据计算本期完成产值
            const arr = res.data;
            arr.forEach(item => {
              if (item.grade == 4) {
                item.settleAmount = item.finishAmount;
              }
            });
            // const arr1 = res.data.items.filter(item => item.grade === 1);
            // const arr2 = res.data.items.filter(item => item.grade === 2);
            // const arr3 = res.data.items.filter(item => item.grade === 3);
            // const arr4 = res.data.items.filter(item => item.grade === 4);
            // arr.forEach(item => {
            //   if (item.isTemporary === 1 && item.grade === 3) {
            //     // item.finishAmount=item.designNumber
            //   } else {
            //     item.finishAmount = 0;
            //     item.settleAmount = 0;
            //   }
            // });
            // arr4.forEach(item => {
            //   item.settlePrice = item.price;
            //   item.finishAmount = (item.designNumber * item.price).toFixed(2) - 0;
            //   item.settleAmount = (item.finishNumber * item.settlePrice).toFixed(2) - 0;
            // });
            // arr3.forEach(item => {
            //   arr4.forEach(item2 => {
            //     if (item.fkItemId == item2.fkParentItemId) {
            //       item.finishAmount = item.finishAmount - 0 + (item2.finishAmount - 0);
            //       item.settleAmount = item.settleAmount - 0 + (item2.settleAmount - 0);
            //     }
            //   });
            // });
            // arr2.forEach(item => {
            //   arr3.forEach(item2 => {
            //     if (item.fkItemId == item2.fkParentItemId) {
            //       item.finishAmount = item.finishAmount - 0 + (item2.finishAmount - 0);
            //       item.settleAmount = item.settleAmount - 0 + (item2.settleAmount - 0);
            //     }
            //   });
            // });
            // arr1.forEach(item => {
            //   arr2.forEach(item2 => {
            //     if (item.fkItemId == item2.fkParentItemId) {
            //       item.finishAmount = item.finishAmount - 0 + (item2.finishAmount - 0);
            //       item.settleAmount = item.settleAmount - 0 + (item2.settleAmount - 0);
            //     }
            //   });
            // });
            this.statsItem = arr.map(item => {
              if (item.isTemporary !== 1) {
                return { ...item, isChoose: 1 };
              } else {
                return { ...item, isChoose: 1 };
              }
            });
            this.treeStatsItem = this.listToTree(this.statsItem, "0");
            this.getTreeSum();
            this.computedAmount();
            this.checkList = this.statsItem.filter(item => (item.isTemporary !== 1 && item.grade == 3) || (item.isTemporary == 1 && item.grade == 3 && item.isChoose)).map(item => item.fkItemId);
            const fileArr = [];
            const arr5 = res.data ? res.data.filter(item => item.grade !== 4).map(item => ({ ...item })) : [];
            arr5.forEach(item => {
              fileArr.push(item);
              if (item.grade === 3 && item.reProcessFileVos) {
                fileArr.push(...item.reProcessFileVos.map((item2, index2) => ({ ...item2, grade: 4, fkItemId: item.fkItemId + "" + index2, fkParentItemId: item.fkItemId })));
              }
            });
            this.reProcessFile = fileArr;
            this.treeReProcessFile = this.listToTree(this.reProcessFile, "0");
            this.treeReProcessFile.forEach(item =>
              item.children.forEach(item2 =>
                item2.children.forEach(item3 => {
                  if (item3.children && item3.children.length) {
                    item.hasFile = 1;
                  }
                })
              )
            );
            this.treeReProcessFile = this.treeReProcessFile.filter(item => item.hasFile);
            this.ranKey = Math.random();
          } else {
            this.$message.warning(res.msg);
          }
        });
    },
    getTreeSum() {
      this.treeStatsItem.forEach(item => {
        let finishAmount1 = 0;
        let settleAmount1 = 0;
        item.children.forEach(item2 => {
          let finishAmount2 = 0;
          let settleAmount2 = 0;
          item2.children.forEach(item3 => {
            let finishAmount3 = 0;
            let settleAmount3 = 0;
            item3.children.forEach(item4 => {
              if (item4.children && item4.children.length) {
                let finishAmount4 = 0;
                let settleAmount4 = 0;
                item4.children.forEach(item5 => {
                  // item5.settlePrice = item5.price;
                  // item5.finishAmount = (item5.designNumber * item5.price).toFixed(2) - 0;
                  // item5.settleAmount = (item5.finishNumber * item5.settlePrice).toFixed(2) - 0;
                  finishAmount4 += item5.finishAmount - 0;
                  settleAmount4 += item5.settleAmount - 0;
                });
                item4.finishAmount = finishAmount4.toFixed(2) - 0;
                item4.settleAmount = settleAmount4.toFixed(2) - 0;
              } else {
                // item4.settlePrice = item4.price;
                // item4.finishAmount = (item4.designNumber * item4.price).toFixed(2) - 0;
                // item4.settleAmount = (item4.finishNumber * item4.settlePrice).toFixed(2) - 0;
              }
              finishAmount3 += item4.finishAmount - 0;
              settleAmount3 += item4.settleAmount - 0;
            });
            item3.finishAmount = finishAmount3.toFixed(2) - 0;
            item3.settleAmount = settleAmount3.toFixed(2) - 0;
            finishAmount2 += item3.finishAmount - 0;
            settleAmount2 += item3.settleAmount - 0;
          });
          item2.finishAmount = finishAmount2.toFixed(2) - 0;
          item2.settleAmount = settleAmount2.toFixed(2) - 0;
          finishAmount1 += item2.finishAmount - 0;
          settleAmount1 += item2.settleAmount - 0;
        });
        item.finishAmount = finishAmount1.toFixed(2) - 0;
        item.settleAmount = settleAmount1.toFixed(2) - 0;
      });
      console.log(this.treeStatsItem);
    },
    // 查询分项工程列表或工程细目
    searchStatsItemFinishByPkId() {
      this.loading = true;
      api
        .searchStatsItemFinishByPkId({
          endDate: this.formData.endDate,
          orgType: 1,
          customerId: this.fkBySettleOrgId,
          contractId: this.formData.fkContractId,
          pkId: this.formData.pkId
        })
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            // this.detail = res.data.detailItems;
            // 根据下级数据计算本期完成产值
            const arr = res.data;
            arr.forEach(item => {
              if (item.grade == 4) {
                item.settleAmount = item.finishAmount;
              }
            });
            // const arr1 = res.data.items.filter(item => item.grade === 1);
            // const arr2 = res.data.items.filter(item => item.grade === 2);
            // const arr3 = res.data.items.filter(item => item.grade === 3);
            // const arr4 = res.data.items.filter(item => item.grade === 4);
            // arr.forEach(item => {
            //   if (item.isTemporary === 1 && item.grade === 3) {
            //     // item.finishAmount=item.designNumber
            //   } else {
            //     item.finishAmount = 0;
            //     item.settleAmount = 0;
            //   }
            // });
            // arr4.forEach(item => {
            //   item.finishAmount = (item.designNumber * item.price).toFixed(2) - 0;
            //   item.settleAmount = (item.finishNumber * item.settlePrice).toFixed(2) - 0;
            // });
            // arr3.forEach(item => {
            //   arr4.forEach(item2 => {
            //     if (item.fkItemId == item2.fkParentItemId) {
            //       item.finishAmount = item.finishAmount - 0 + (item2.finishAmount - 0);
            //       item.settleAmount = item.settleAmount - 0 + (item2.settleAmount - 0);
            //     }
            //   });
            // });
            // arr2.forEach(item => {
            //   arr3.forEach(item2 => {
            //     if (item.fkItemId == item2.fkParentItemId) {
            //       item.finishAmount = item.finishAmount - 0 + (item2.finishAmount - 0);
            //       item.settleAmount = item.settleAmount - 0 + (item2.settleAmount - 0);
            //     }
            //   });
            // });
            // arr1.forEach(item => {
            //   arr2.forEach(item2 => {
            //     if (item.fkItemId == item2.fkParentItemId) {
            //       item.finishAmount = item.finishAmount - 0 + (item2.finishAmount - 0);
            //       item.settleAmount = item.settleAmount - 0 + (item2.settleAmount - 0);
            //     }
            //   });
            // });
            this.statsItem = arr.map(item => {
              if (item.isTemporary !== 1) {
                return { ...item, isChoose: 1 };
              } else {
                return { ...item, isChoose: 1 };
                // return { ...item, isChoose: item.isChoose ? item.isChoose : 0 };
              }
            });
            this.treeStatsItem = this.listToTree(this.statsItem, "0");
            this.getTreeSum();
            this.computedAmount();
            this.checkList = this.statsItem.filter(item => (item.isTemporary !== 1 && item.grade == 3) || (item.isTemporary == 1 && item.grade == 3 && item.isChoose)).map(item => item.fkItemId);
            const fileArr = [];
            const arr5 = res.data ? res.data.filter(item => item.grade !== 4).map(item => ({ ...item })) : [];
            arr5.forEach(item => {
              fileArr.push(item);
              if (item.grade === 3 && item.reProcessFileVos) {
                console.log(item);
                fileArr.push(...item.reProcessFileVos.map(item2 => ({ ...item2, grade: 4, fkItemId: item.fkItemId + "" + index2, fkParentItemId: item.fkItemId })));
              }
            });
            this.reProcessFile = fileArr;
            // console.log(fileArr);
            this.treeReProcessFile = this.listToTree(this.reProcessFile, "0");
            this.treeReProcessFile.forEach(item =>
              item.children.forEach(item2 =>
                item2.children.forEach(item3 => {
                  if (item3.children && item3.children.length) {
                    item.hasFile = 1;
                  }
                })
              )
            );
            console.log(this.treeReProcessFile);
            this.treeReProcessFile = this.treeReProcessFile.filter(item => item.hasFile);
            this.ranKey = Math.random();
            // let fileArr1=arr.filter(item=>item.grade!==4)
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 模态框确定按钮
    btnOk(settleStatus, auditStatus, unique) {
      console.log("过来了", unique);
      if (this.dialogType === 1 || this.dialogType === 3) {
        const { endDate, settleDate, settleName, settleAmount } = this.formData;
        if (!endDate) {
          return this.$message.warning("结算周期结束日期不能为空");
        }
        // if (!fkApproverId) {
        //   return this.$message.warning("负责人不能为空");
        // }
        if (!settleDate) {
          return this.$message.warning("结算日期不能为空");
        }
        if (!settleName) {
          return this.$message.warning("结算单名称不能为空");
        }
        // if (!settleAmount) {
        //   return this.$message.warning("本期结算金额不能为空");
        // }
        if (Date.parse(endDate) > Date.parse(settleDate)) {
          return this.$message.warning("结算时间不能比结算周期结束时间小");
        }
        if (!this.approvalStatus) {
          return this.$message.warning("请先设置审批人");
        }
        this.formData.settleType = 2;
        this.formData.settleStatus = settleStatus;
        this.formData.settleDetails = this.statsItem.filter(item => item.isChoose);
        this.formData.finishAmount = this.formData.settleDetails.filter(item => item.grade == 3).reduce((total, val) => total - 0 + (val.finishAmount - 0), 0);
        this.formData.engDeductionDetailAdds = this.engDeductionDetail.map(item => ({ ...item, deductionAmount: item.settleAmount }));
        console.log(this.formData.engDeductionDetailAdds);
        this.formData.engExpenseDetailAdds = this.engExpenseDetail;
        this.formData.itemDeductionAdds = this.itemDeductions;
        if (!this.formData.settleDetails.length && !this.formData.engExpenseDetailAdds.length && !this.formData.itemDeductionAdds.length && !this.itemDeductions.length) {
          return this.$message.warning("结算项目不能为空");
        }
        // this.formData.settleInfoList = this.detail
        this.formData.fileList = this.accessoryList.filter(item => item.fileUrl);
        const prodWorkflowUserAdds = [];
        this.approvalData.workflowNodeDTOS.forEach(item => {
          if (item.nodeType == 2) {
            prodWorkflowUserAdds.push({
              bizType: 1,
              currentNodeId: item.pkId,
              fkRoleId: item.fkRoleId,
              fkApproverId: item.prodSysRoleVo.selectedUserId
            });
          }
        });
        if (this.approvalData.launchType == 2 && !prodWorkflowUserAdds[0].fkApproverId) {
          return this.$message.warning("首个节点必须有人");
        }
        prodWorkflowUserAdds.forEach((item, index) => {
          item.sortval = index + 1;
        });
        this.formData.prodWorkflowUserAdds = prodWorkflowUserAdds;
        const tableData = this.tableDTOS.length ? JSON.parse(JSON.stringify(this.tableDTOS)) : [];
        if (tableData.length) {
          tableData.forEach((item, idx) => {
            if (item.tableHtml.length == 0 || item.tableHtml == null) {
              this.$message.warning("表格数据为空 请检查表格数据是否正常");
              return (this.loading = false);
            }
            item.tableHtml = JSON.stringify(item.tableHtml);
            if (this.modifiedList[idx].tableHtml == item.tableHtml) {
              item.isModified = 0;
            } else {
              item.isModified = 1;
            }
            item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
          });
        }
        this.formData.workflowTableList = tableData;
        let data = {
          settleType: 2,
          settleStatus: settleStatus,
          settleDetails: this.formData.settleDetails,
          engExpenseDetailAdds: this.formData.engExpenseDetailAdds,
          fileList: this.formData.fileList,
          prodWorkflowUserAdds: prodWorkflowUserAdds,
          beginDate: this.formData.beginDate,
          endDate: this.formData.endDate,
          workflowTableList: tableData,
          fkContractId: this.formData.fkContractId,
          itemDeductionAdds: this.formData.itemDeductionAdds,
          remark: this.formData.remark,
          settleDate: this.formData.settleDate,
          settleName: this.formData.settleName,
          isAgainChoice: this.formData.isAgainChoice,
          engDeductionDetailAdds: this.formData.engDeductionDetailAdds,
          settlementObject: this.settlementObject,
          fkBySettleOrgId: this.fkBySettleOrgId
        };
        this.formData.signUrl = this.signUrl;
        if (unique) {
          this.formData.unique = unique;
        }
        if (this.formData.pkId) {
          data.pkId = this.formData.pkId;
          this.loading = true;
          api
            .updateStatsProjectById(this.formData)
            .then(res => {
              if (res.code === 200) {
                this.$message.success("操作成功");
                this.handleCancel(true);
                this.$emit("updateList");
              } else {
                this.$message.warning(res.msg);
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
            });
        } else {
          this.formData = {
            ...this.formData,
            settlementObject: this.settlementObject,
            fkBySettleOrgId: this.fkBySettleOrgId
          };
          if (unique) {
            this.formData.unique = unique;
          }
          this.loading = true;
          api
            .addStatsProject({
              ...this.formData
            })
            .then(res => {
              if (res.code === 200) {
                this.$message.success("新增成功");
                this.handleCancel(true);
                this.$emit("updateList");
              } else {
                this.$message.warning(res.msg);
              }
              this.loading = false;
            })
            .catch(err => {
              this.loading = false;
            });
        }
      } else if (this.dialogType === 5 || this.dialogType === 6) {
        // if (this.approval.auditStatus === 1 && !this.approval.fkApproverId && !!this.showNext) {
        //   return this.$message.warning("请选择审批人");
        // }
        this.$confirm("确定审批?", "审批提醒", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          // this.siStatus = false
          // this.tableDTOS.forEach(item => {
          //   if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
          //     item.tableHtml.forEach(e => {
          //       e.arr.forEach(i => {
          //         if (i.attributeTypes == 3) {
          //           this.siStatus = this.user.roleList.filter(item => item == i.signatureDate.signatureUnit);
          //         }
          //       });
          //     });
          //   }
          // });
          this.approval.auditStatus = auditStatus;
          if (auditStatus == 2) {
            return this.$refs.approveCodeDialog.getApproveStatus(null, true);
          }
          this.loading = true;
          this.$refs.approveCodeDialog.getApproveStatus();
        });
        // this.approveCodeDialog = true;
        // return;
        // this.projectExamine();
      }
    },
    closeLoading() {
      this.loading = false;
    },
    // 审批
    projectExamine(unique) {
      if ([5, 6].includes(this.dialogType)) {
        if (this.approval.auditStatus === 2 && !this.approval.approveComment) {
          this.approval.approveComment = "审批不通过";
        } else if (this.approval.auditStatus === 1 && !this.approval.approveComment) {
          this.approval.approveComment = "审批通过";
        }
        const tableData = JSON.parse(JSON.stringify(this.tableDTOS));
        console.log(tableData, this.modifiedList);
        // let status = false
        let num1 = tableData.filter(item => item.convertPdfStatus == 1).length;
        if (tableData.length) {
          tableData.forEach((item, idx) => {
            if (item.tableHtml.length == 0 || item.tableHtml == null) {
              this.$message.warning("表格数据为空 请检查表格数据是否正常");
              return (this.loading = false);
            }
            item.tableHtml = JSON.stringify(item.tableHtml);
            if (this.modifiedList[idx].tableHtml == item.tableHtml) {
              item.isModified = 0;
            } else {
              item.isModified = 1;
            }
            item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
          });
        }
        const data1 = { ...this.approval, fileList: [...this.accessoryList, ...this.appAccList.filter(item => item.fileUrl)], workflowTableList: tableData, unique };
        console.log("传的", data1, unique);
        this.accountability(data1);
        return;
        if (num1 > 0) {
          // status = false
          // tableData.forEach((item, idx) => {
          //   item.tableHtml = JSON.stringify(item.tableHtml);
          //   if (this.modifiedList[idx].tableHtml == item.tableHtml) {
          //     item.isModified = 0;
          //   } else {
          //     item.isModified = 1;
          //   }
          //   item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
          // });
          let num2 = 0;
          tableData.forEach((item, idx) => {
            if (item.convertPdfStatus == 1) {
              htmlToPdfUpload
                .getPdf("#pdfDom" + idx, item.tableName, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
                .then(res => {
                  const _this = this;
                  uploadObjectPdf(utils.dataURLtoFile(res, item.tableName), url => {
                    tableData[idx].tablePdfUrl = url;
                    // let num2 = tableData.filter(item => item.convertPdfStatus == 1 && !!item.tablePdfUrl).length;
                    num2++;
                    if (num1 == num2) {
                      const data = { ...this.approval, fileList: [...this.accessoryList, ...this.appAccList.filter(item => item.fileUrl)], workflowTableList: tableData };
                      _this.accountability(data);
                    }
                  });
                });
            }
          });
        } else {
          const data1 = { ...this.approval, fileList: [...this.accessoryList, ...this.appAccList.filter(item => item.fileUrl)], workflowTableList: tableData };
          this.accountability(data1);
        }
      } else {
        if (this.dialogType == 10) {
          this.loading = true;
          this.$api
            .revocationWithdrawSeal({ pkId: this.formData.pkId, unique })
            .then(res => {
              this.loading = false;
              if (res.code == 200) {
                this.$message.success("撤回成功");
                this.$emit("updateList");
                this.handleCancel(true);
              } else {
                this.$message.warning(res.msg);
              }
            })
            .catch(err => {
              this.loading = false;
            });
        } else {
          this.loading = true;
          api
            .withdrawalProcessingNode({ settleId: this.formData.pkId, unique })
            .then(res => {
              this.loading = false;
              if (res.code === 200) {
                this.$emit("updateList");
                this.handleCancel(true);
                this.$message.success(res.msg);
              } else {
                this.$message.warning(res.msg);
              }
            })
            .catch(err => {
              this.loading = false;
            });
        }
      }
    },
    accountability(data) {
      this.loading = true;
      api
        .projectExamine(data)
        .then(res => {
          if (res.code === 200) {
            this.$message.success("操作成功");
            this.handleCancel(true);
            this.$emit("updateList");
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 关闭模态框
    handleCancel(isDel) {
      this.$emit("update:dialogVisible", false);
      this.formData = {
        approver: "",
        settleName: "",
        fkApproverId: "",
        beginDate: "",
        endDate: "",
        endSettleAmount: 0,
        finishAmount: 0,
        lastSettleAmount: 0,
        remark: "",
        settleAmount: 0,
        settleDate: "",
        settleStatus: 0,
        settleDetails: [],
        fkContractId: "",
        taskFinishVoList: []
      };
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      this.siStatus = false;
      this.signed=false
      this.addNum = 1;
      this.flowShow = true;
      this.isExpand1 = false;
      this.isExpand2 = false;
      this.isExpand3 = false;
      this.showNext = false;
      this.taxAmount = 0;
      this.hasTaxAmount = 0;
      this.engExpenseDetail = [];
      this.treeItemDeductions = [];
      this.engDeductionDetail = [];
      this.itemDeductions = [];
      this.fkBySettleOrgId = "";
      this.statsItem = [];
      this.treeStatsItem = [];
      this.activeName1 = "first";
      this.activeName2 = "first";
      this.userOptions = [];
      this.approverList = [];
      this.reProcessFile = [];
      this.treeReProcessFile = [];
      this.fkApproverId = "";
      this.roleName = "";
      this.approval = {
        auditStatus: 1,
        pkId: "",
        approveComment: "",
        approver: "",
        fkApproverId: "",
        currentNodeId: ""
      };
      this.bpmnImg = "";
      this.accessoryList = [
        {
          id: 1,
          fileName: "",
          remark: "",
          fileUrl: ""
        }
      ];
    },
    // 负责人变化事件
    approverChange() {
      const arr = this.userOptions.filter(item => item.pkId === this.fkApproverId);
      this.formData.fkApproverId = this.fkApproverId;
      this.formData.approver = arr[0].userName;
      if (this.dialogType === 5 || this.dialogType === 6) {
        this.approval = {
          ...this.approval,
          approver: arr[0].userName,
          fkApproverId: this.fkApproverId
        };
      }
    },
    // 选择分包单位
    subChange() {
      this.getCustomListByType();
      this.approvalStatus = false;
      this.formData.fkContractId = "";
      this.statsItem = [];
      this.treeStatsItem = [];
      this.formData.beginDate = "";
      this.formData.lastSettleAmount = 0;
      this.engExpenseDetail = [];
      this.engDeductionDetail = [];
      this.itemDeductions = [];
      this.treeItemDeductions = [];
      let arr = this.subOption.filter(item => item.pkId == this.fkBySettleOrgId);
      this.formData.customName = arr.length ? arr[0].customName : "";
      if (this.pkId) {
        this.getApproverSettle({ settleType: 2, customId: this.fkBySettleOrgId, pkId: this.pkId });
      } else {
        this.getApproverSettle({ settleType: 2, customId: this.fkBySettleOrgId });
      }
      // this.getBeforeAddSetting({ customId: this.fkBySettleOrgId });
      // if (this.formData.endDate) {
      //   this.getStatsItemFinish();
      // }
    },
    contractChange(e) {
      this.statsItem = [];
      this.treeStatsItem = [];
      this.formData.beginDate = "";
      this.formData.lastSettleAmount = 0;
      this.engExpenseDetail = [];
      this.engDeductionDetail = [];
      this.itemDeductions = [];
      this.treeItemDeductions = [];
      let arr = this.contractList.filter(item => item.pkId === e)[0];
      this.formData.taxRate = arr.taxRate;
      this.formData.contractName = arr.contractName;
      this.formData.endDate = "";
      console.log(this.formData.taxRate, this.taxAmount);
      this.getBeforeAddSetting({ customId: this.fkBySettleOrgId, contractId: this.formData.fkContractId });
      this.formData.endDate = "";
    },
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    input(e, type, item) {
      let val = e;
      val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
      val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
      val = val.replace(/^0+\./g, "0.");
      val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
      val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (val.includes(".")) {
        if (val - 0 > 999999999999.99 - this.formData.lastSettleAmount) {
          val = String(999999999999.99 - this.formData.lastSettleAmount);
        }
        val = val.slice(0, 15);
      } else {
        if (val - 0 > 999999999999 - this.formData.lastSettleAmount) {
          val = String(999999999999 - this.formData.lastSettleAmount);
        }
        val = val.slice(0, 12);
      }
      if (type === 1) {
        this.formData.settleAmount = val;
      } else if (type === 2) {
        item.settlePrice = val;
        this.statsItem.forEach(item1 => {
          if (item1.fkItemDetailId == item.fkItemDetailId) {
            item1.settlePrice = val;
          }
        });
        // item.finishAmount = item.price * item.finishNumber;
        const arr = this.statsItem;
        const arr1 = this.statsItem.filter(item => item.grade === 1);
        const arr2 = this.statsItem.filter(item => item.grade === 2);
        const arr3 = this.statsItem.filter(item => item.grade === 3);
        const arr4 = this.statsItem.filter(item => item.grade === 4);
        arr.forEach(item1 => {
          if (item1.isTemporary === 1 && item1.grade === 3) {
          } else {
            item1.settleAmount = 0;
            item1.finishAmount = 0;
          }
        });
        arr4.forEach(item1 => {
          item1.settleAmount = (item1.finishNumber * item1.settlePrice).toFixed(2) - 0;
          item1.finishAmount = (item1.designNumber * item1.price).toFixed(2) - 0;
        });
        arr3.forEach(item1 => {
          arr4.forEach(item2 => {
            if (item1.fkItemId == item2.fkParentItemId) {
              item1.settleAmount = (item1.settleAmount - 0 + (item2.settleAmount - 0)).toFixed(2) - 0;
              item1.finishAmount = (item1.finishAmount - 0 + (item2.finishAmount - 0)).toFixed(2) - 0;
            }
          });
        });
        arr2.forEach(item1 => {
          arr3.forEach(item2 => {
            if (item1.fkItemId == item2.fkParentItemId) {
              item1.settleAmount = (item1.settleAmount - 0 + (item2.settleAmount - 0)).toFixed(2) - 0;
              item1.finishAmount = (item1.finishAmount - 0 + (item2.finishAmount - 0)).toFixed(2) - 0;
            }
          });
        });
        arr1.forEach(item1 => {
          arr2.forEach(item2 => {
            if (item1.fkItemId == item2.fkParentItemId) {
              item1.settleAmount = (item1.settleAmount - 0 + (item2.settleAmount - 0)).toFixed(2) - 0;
              item1.finishAmount = (item1.finishAmount - 0 + (item2.finishAmount - 0)).toFixed(2) - 0;
            }
          });
        });
      }
    },
    endTimeChange(val) {
      if (Date.parse(val + " 23:59:59") < Date.parse(this.formData.beginDate)) {
        this.formData.endDate = "";
        return this.$message.warning("结束时间不能比开始时间早");
      }
      if ((this.dialogType === 1 && !!this.formData.pkId) || this.dialogType === 3) {
        this.formData.isAgainChoice = true;
      }
      this.getStatsItemFinish();
      // this.getSettleInfo();
    },
    selectRow(e, row) {
      // console.log(e, row);
      const obj1 = this.statsItem.filter(item => item.fkItemId == row.fkParentItemId)[0];
      const obj2 = this.statsItem.filter(item => item.fkItemId == obj1.fkParentItemId)[0];
      if (e) {
        row.isChoose = 1;
        obj1.isChoose = 1;
        obj2.isChoose = 1;
        // console.log(row, obj1, obj2);
      } else {
        const obj3 = this.statsItem.filter(item => item.fkParentItemId == row.fkParentItemId && item.pkId !== row.pkId);
        if (obj3.length) {
          row.isChoose = 0;
        } else {
          row.isChoose = 0;
          obj1.isChoose = 0;
          obj2.isChoose = 0;
        }
      }
      // console.log(this.statsItem);
    },
    // 临时工程本期完成产值变化
    finishAmountChange(e, row) {
      // let arr =this.statsItem.filter(item=>item.isTemporary==1)
      const obj1 = this.statsItem.filter(item1 => item1.fkItemId === row.fkParentItemId)[0];
      const obj2 = this.statsItem.filter(item1 => item1.fkItemId === obj1.fkParentItemId)[0];
      let sum1 = 0;
      let sum2 = 0;
      this.statsItem
        .filter(item1 => item1.fkParentItemId === obj1.fkItemId)
        .forEach(item1 => {
          sum1 += item1.finishAmount - 0;
        });
      obj1.finishAmount = sum1.toFixed(2) - 0;
      this.$nextTick(() => {
        this.statsItem
          .filter(item1 => item1.fkParentItemId === obj2.fkItemId)
          .forEach(item1 => {
            sum2 += item1.finishAmount - 0;
          });
        obj2.finishAmount = sum2.toFixed(2) - 0;
      });
    },
    // 添加附件
    addAcc(row) {
      if (this.dialogType > 3) {
        this.appAccList = [
          ...this.appAccList,
          {
            id: this.appAccList[this.appAccList.length - 1].id + 1,
            fileName: "",
            remark: "",
            fileUrl: ""
          }
        ];
      } else {
        this.accessoryList = [
          ...this.accessoryList,
          {
            id: this.accessoryList[this.accessoryList.length - 1].id + 1,
            fileName: "",
            remark: "",
            fileUrl: ""
          }
        ];
      }
    },
    // 删除附件
    delAcc(row) {
      if (this.dialogType > 3) {
        if (this.appAccList.length === 1) {
          this.appAccList = [];
        } else {
          this.appAccList = this.appAccList.filter(item => item.id !== row.id);
        }
      } else {
        if (this.accessoryList.length === 1) {
          this.accessoryList = [{ id: 1, fileName: "", remark: "", fileUrl: "" }];
        } else {
          this.accessoryList = this.accessoryList.filter(item => item.id !== row.id);
        }
      }
      this.delList.push(row.fileUrl);
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
    uploadAcc2() {
      this.$nextTick(() => {
        this.$refs.upload.click();
      });
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
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
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
            _this.newAddList.push(path);
            if (_this.dialogType === 5 || _this.dialogType === 6) {
              _this.appAccList.push({ fileName: filename, remark: "", fileUrl: path });
            } else {
              _this.nowUploadObj.fileUrl = path;
              _this.nowUploadObj.fileName = filename;
            }
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
      console.log(row);
      const str = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1);
      if (str == "xlsx" || str == "docx") {
        this.previewType = 1;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (str == "pdf") {
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
    secondInput(e, type, row, max) {
      if (e.indexOf(".") !== -1) {
        this.secondMaxLength = 15;
      } else {
        this.secondMaxLength = 12;
      }
      if (type === 1) {
        if (e === "") {
          row.settleAmount = 0;
        }
        row.settleAmount = this.$limitInputNumber(e, max, 0, 2);
        this.computedAmount();
        // if (row.settleAmount > max) {
        //   row.settleAmount = max;
        // }
      } else if (type === 3) {
        if (this.formData.settleAmount > 999999999999.99) {
          this.formData.settleAmount = 999999999999.99;
        }
        this.taxAmount = this.formData.taxRate ? (((this.formData.settleAmount * this.formData.taxRate).toFixed(2) - 0) / 100).toFixed(2) - 0 : 0;
        this.hasTaxAmount = (this.formData.settleAmount - 0 + this.taxAmount).toFixed(2) - 0;
        this.formData.endSettleAmount = (this.formData.lastSettleAmount - 0 + this.hasTaxAmount).toFixed(2) - 0;
      }
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (["金额", "本期结算金额"].includes(column.label)) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return (prev + curr).toFixed(6) - 0;
              } else {
                return prev;
              }
            }, 0);
          } else {
            sums[index] = "N/A";
          }
        }
      });
      // sums[4] = sums[4].toFixed(6) - 0;
      // sums[6] = sums[6].toFixed(6) - 0;
      return sums;
    },
    getSummaries2(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (["本期结算金额", "开累结算金额"].includes(column.label)) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return (prev + curr).toFixed(6) - 0;
              } else {
                return prev;
              }
            }, 0);
          } else {
            sums[index] = "N/A";
          }
        }
      });
      return sums;
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        this.forArr(this[list], this[isExpand], ref);
      });
    },
    // 遍历
    forArr(arr, isExpand, ref) {
      arr.forEach(i => {
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.children) {
          this.forArr(i.children, isExpand, ref);
        }
      });
    },
    // 自定义表格方法
    handleScroll(val) {
      if (this.$refs.scroll != undefined) {
        this.$refs.scroll.forEach(item => {
          item.blur();
        });
      }
    },
    delFiles() {
      let urls = [];
      if (this.dialogType === 1) {
        urls = this.newAddList.join(",");
      } else {
        urls = [...new Set([...this.delList, ...this.newAddList])].join(",");
      }
      if (!urls.length) {
        return;
      }
      this.newAddList = [];
      this.delList = [];
      this.$api.delFiles({ urls });
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
        i.id = this.formData.currentNodeId;
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
    },
    computedAmount() {
      let amount = 0;
      const arr = this.statsItem.filter(item => item.grade == 4);
      const arr2 = this.engExpenseDetail.filter(item => item.type == 1);
      const arr3 = this.engDeductionDetail.filter(item => item.type == 1);
      const arr4 = this.itemDeductions.filter(item => item.grade == 4).map(item => ({ ...item, settleAmount: 0 - item.settleAmount }));
      console.log(arr, arr2, arr3, arr4);
      arr.forEach(item => {
        amount += item.settleAmount - 0;
      });
      arr2.forEach(item => {
        amount += item.settleAmount - 0;
      });
      arr3.forEach(item => {
        item.settleAmount = item.settleAmount ? item.settleAmount : null;
        amount -= item.settleAmount - 0;
      });
      arr4.forEach(item => {
        amount += item.settleAmount - 0;
      });
      this.formData.settleAmount = amount.toFixed(2) - 0;
      this.taxAmount = this.formData.taxRate ? (((this.formData.settleAmount * this.formData.taxRate).toFixed(2) - 0) / 100).toFixed(2) - 0 : 0;
      this.hasTaxAmount = (this.formData.settleAmount - 0 + this.taxAmount).toFixed(2) - 0;
      this.formData.endSettleAmount = (this.formData.lastSettleAmount - 0 + this.hasTaxAmount).toFixed(2) - 0;
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user")) || [];
    },
    pricePermission() {
      const arr = this.$store.state.menuData.filter(item => item.menuCode == "settlement");
      if (![0].includes(this.user.orgType)) {
        if (this.dialogType == 1) {
          return true;
        } else {
          return arr.length ? !!arr[0].states : false;
        }
      } else {
        return true;
      }
    },
    dialogTitle() {
      if (this.dialogType === 1 && !this.formData.pkId) {
        this.approvalStatus = false;

        return "新增结算";
      }
      if (this.dialogType === 1 && this.formData.pkId) {
        // this.approvalStatus = false;

        return "编辑结算";
      }
      if (this.dialogType === 2) return "结算信息";
      if (this.dialogType === 3) return "发起流程";
      if (this.dialogType === 4) return "流程信息";
      if (this.dialogType === 5 || this.dialogType === 6) return "审批流程";
      if (this.dialogType === 7 || this.dialogType === 8) return "审批信息";
    },
    // 本期末结算金额
    endSettleAmount() {
      const sum = this.formData.lastSettleAmount - 0 + (this.formData.settleAmount - 0);
      this.formData.endSettleAmount = sum;
      return sum;
    },
    // 本期结算金额
    // settleAmount() {
    //   let arr = [];
    //   let sum = 0;
    //   if (this.statsItem.filter(item => item.isTemporary === 1).length) {
    //     arr = this.statsItem.filter(item => item.grade === 3 && item.isChoose);
    //   } else {
    //     arr = this.statsItem.filter(item => item.grade === 4);
    //   }
    //   arr.forEach(item => (sum = sum - 0 + (item.settleAmount - 0)));
    //   this.formData.settleAmount = sum;
    //   return sum;
    // },
    detail() {
      // const arr = this.statsItem.filter(item=>item.grade==4)
      // console.log(arr);
      // const arr2 = [];
      // for (let i = 0; i < arr.length; i++) {
      //   let flag = true;
      //   for (let j = 0; j < arr2.length; j++) {
      //     if (arr[i].fkItemDetailId === arr2[j].fkItemDetailId) {
      //       arr2[j].finishAmount = (arr2[j].settleAmount - 0 + (arr[i].settleAmount - 0)).toFixed(2) - 0;
      //       arr2[j].designNumber = (arr2[j].designNumber - 0 + (arr[i].designNumber - 0)).toFixed(2) - 0;
      //       arr2[j].designAmount = (arr2[j].designAmount - 0 + (arr[i].designAmount - 0)).toFixed(2) - 0;
      //       arr2[j].finishNumber = (arr2[j].finishNumber - 0 + (arr[i].finishNumber - 0)).toFixed(2) - 0;
      //       arr2[j].settleAmount = (arr2[j].settleAmount - 0 + (arr[i].settleAmount - 0)).toFixed(2) - 0;
      //       flag = false;
      //     }
      //   }
      //   if (flag) {
      //     arr2.push({ ...arr[i], finishAmount: arr[i].settleAmount });
      //   }
      // }
      // const arr3 = this.engExpenseDetail.map(item => ({ ...item, itemName: item.detailName, price: item.costAmount, settlePrice: item.costAmount, designNumber: 1, designAmount: item.costAmount, finishNumber: item.costAmount ? (item.settleAmount / item.costAmount).toFixed(2) - 0 : 0, finishAmount: item.settleAmount }));
      // const arr4 = this.engDeductionDetail.map(item => ({ ...item, itemName: item.materialName, price: item.excessPrice, settlePrice: item.settlePrice, designNumber: item.supplyNum, finishNumber: item.supplyNum, designAmount: (item.supplyNum * item.settlePrice).toFixed(2) - 0, finishAmount: 0 - (item.supplyNum * item.settlePrice).toFixed(2) }));
      // let filterArr = this.itemDeductions.filter(item=>item.grade==4)
      // const arr5 = [];
      // for (let i = 0; i < filterArr.length; i++) {
      //   let flag = true;
      //   for (let j = 0; j < arr5.length; j++) {
      //     if (filterArr[i].fkItemDetailId === arr5[j].fkItemDetailId) {
      //       arr5[j].finishAmount = (arr5[j].finishAmount - 0 + (filterArr[i].finishAmount - 0)).toFixed(2) - 0;
      //       arr5[j].designNumber = (arr5[j].designNumber - 0 + (filterArr[i].designNumber - 0)).toFixed(2) - 0;
      //       arr5[j].designAmount = (arr5[j].designAmount - 0 + (filterArr[i].designAmount - 0)).toFixed(2) - 0;
      //       arr5[j].finishNumber = (arr5[j].finishNumber - 0 + (filterArr[i].finishNumber - 0)).toFixed(2) - 0;
      //       arr5[j].settleAmount = (arr5[j].settleAmount - 0 - (filterArr[i].settleAmount - 0)).toFixed(2) - 0;
      //       flag = false;
      //     }
      //   }
      //   if (flag) {
      //     arr5.push({ ...filterArr[i], settleAmount: 0 - filterArr[i].settleAmount });
      //   }
      // }
      // // let arr5 = this.itemDeductions.filter(item => item.grade == 4).map(item => ({ ...item, itemName: item.itemName, price: item.price, designNumber: item.designNumber, finishAmount:0-item.finishNumber }));
      // const detailList = [...arr2, ...arr3, ...arr4, ...arr5.map(item => ({ ...item, finishAmount: item.settleAmount, finishNumber: 0 - item.finishNumber }))];
      return this.detailList;
    },
    showEngDeductionDetail() {
      if (this.addNum == 1) {
        return this.engDeductionDetail;
      } else {
        return this.engDeductionDetail.filter(item => item.settleAmount);
      }
    }
  },
  watch: {
    siStatus(val) {
      if (val) {
        this.signed = false;
      } else {
        this.signed = true;
      }
    },
    detail: {
      deep: true,
      handler(val) {
        if (this.dialogVisible && this.dialogType < 4) {
          const values = val.map(item => (isNaN(item.currentSettleAmount) ? 0 : Number(item.currentSettleAmount)));
          console.log(val, values);
          let sum = 0;
          if (!values.every(value => isNaN(value))) {
            sum = values.reduce((prev, curr) => {
              return prev + curr;
            }, 0);
          }
          this.formData.settleAmount = sum.toFixed(2) - 0;
          this.taxAmount = this.formData.taxRate ? (((this.formData.settleAmount * this.formData.taxRate).toFixed(2) - 0) / 100).toFixed(2) - 0 : 0;
          this.hasTaxAmount = (this.formData.settleAmount - 0 + this.taxAmount).toFixed(2) - 0;
          this.formData.endSettleAmount = (this.formData.lastSettleAmount - 0 + this.hasTaxAmount).toFixed(2) - 0;
        }
        if (this.dialogVisible && this.dialogType > 4) {
          this.taxAmount = this.formData.taxes;
          this.hasTaxAmount = (this.formData.settleAmount - 0 + this.taxAmount).toFixed(2) - 0;
          this.formData.endSettleAmount = (this.formData.lastSettleAmount - 0 + this.hasTaxAmount).toFixed(2) - 0;
        }
      }
    },
    previewDialog(val) {
      if (!val) {
        this.nowPreviewObj = {};
      }
    },
    dialogVisible(val) {
      if (val) {
        if ([7, 8, 10].includes(this.dialogType)) {
          this.nowTab = 0;
        } else {
          this.nowTab = 1;
        }
        if (this.dialogType === 8) {
          this.formData = this.signData;
          this.signDetail = this.signData.sealBusinessVo
            ? this.signData.sealBusinessVo
            : {
                sealApproveDetailVo: {},
                sealScheduleDetailList: [],
                sealTableList: []
              };
          this.signData.taskFinishVoList.slice(1).forEach((item, index) => {
            if (item.approveStatus == 1 || item.approveStatus == 3) {
              this.approveSum = index;
              if (item.approveStatus == 1) {
                this.beginRow = true;
              }
            }
          });
          this.saveAmount = this.signData.settleAmount;
          this.fkApproverId = this.signData.fkApproverId;
          this.fkBySettleOrgId = this.signData.fkBySettleOrgId;
          this.formData.taxRate = this.signData.taxRate;
          if (this.user.orgType == 5) {
            this.getCustomListByType(true);
          }
          this.accessoryList = this.signData.fileList && this.signData.fileList.length ? this.signData.fileList : [];
          const arr = this.signData.settleDetails ? this.signData.settleDetails : [];
          this.statsItem = arr;
          this.treeStatsItem = this.listToTree(this.statsItem, "0");
          this.checkList = this.statsItem.filter(item => item.isChoose && item.grade == 3).map(item => item.fkItemId);
          this.formData.isAgainChoice = false;
          this.engExpenseDetail = this.signData.engExpenseDetailVos ? this.signData.engExpenseDetailVos : [];
          this.engDeductionDetail = this.signData.engDeductionDetailVos ? this.signData.engDeductionDetailVos : [];
          this.itemDeductions = this.signData.itemDeductions ? this.signData.itemDeductions : [];
          this.treeItemDeductions = this.listToTree2(this.itemDeductions, "0");
          this.ranKey = Math.random();
          const fileArr = [];
          const arr2 = this.signData.itemReProcessFileVos ? this.signData.itemReProcessFileVos.filter(item => item.grade !== 4) : [];
          arr2.forEach(item => {
            fileArr.push(item);
            if (item.grade === 3 && item.reProcessFileVos) {
              fileArr.push(...item.reProcessFileVos.map((item2, index2) => ({ ...item2, grade: 4, pkId: item.fkItemId + "" + index2, fkParentItemId: item.fkItemId })));
            }
          });
          this.reProcessFile = fileArr;
          this.treeReProcessFile = this.listToTree(this.reProcessFile, "0");
          this.tableDTOS = this.signData.workflowTableList ? this.signData.workflowTableList : [];
          if (this.tableDTOS) {
            this.tableDTOS.forEach(item => {
              item.tableHtml = this.utils.unzip(item.tableHtml);
              if (item.tableHtml instanceof Array) {
              } else {
                item.tableHtml = JSON.parse(item.tableHtml);
              }
            });
          }
        } else {
          if (this.pkId) {
            if (this.dialogType === 1 || this.dialogType === 2 || this.dialogType === 3) {
              const type = this.dialogType === 2 ? 1 : 2;
              if (this.again) {
                type == 2;
              }
              this.getProjectSettingById(type);
            } else {
              const type = this.dialogType === 4 ? 1 : 2;
              this.getApprove(type);
              if (this.dialogType === 5) {
                this.approval.pkId = this.pkId;
              }
            }
          } else {
            if (this.dialogType === 1) {
              // this.getSettleWorkflowTable();
              this.formData.settleDate = moment(Date.now()).format("YYYY-MM-DD");
            }
          }
          if (this.dialogType === 1 || this.dialogType === 3) {
            this.getSubList();
          }
        }
      } else {
        this.nowTab = 0;
        this.signTab = "1";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-forms {
  margin: 0 20px 20px;
}

/deep/ .el-dialog__footer {
  text-align: center;
}

.dialog-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 10px;
  background-color: #fff;

  span {
    display: block;
    width: 105px;
    margin-right: 10px;
    text-align: center;
  }

  .wh-60 {
    width: 60px;
  }

  .wh-80 {
    width: 80px;
  }

  .dialog-header-item {
    display: flex;
    align-items: center;
    margin: 7px 0;

    .label {
      width: 130px;
      padding-right: 6px;
      text-align: right;
    }

    .value {
      // flex: 1;
      width: calc(100% - 130px);
      display: flex;
      align-items: center;
    }

    .wh-120 {
      width: 120px;
    }
  }
}

.el-main {
  width: calc(100% - 320px);
  padding-top: 0;
  padding-bottom: 0;

  .approveDetail {
    display: flex;
    justify-content: space-evenly;
    margin-top: 7px;

    .approveDetail-head {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 30px;
      font-size: 14px;
      // color: #fff;
      background-color: #02a7f0;
    }

    .approveDetail-left {
      flex: 1;
      border: 1px solid #d7d7d7;
      height: 120px;

      // border-right: 1px #ccc solid;
      // padding-right: 5px;
      .el-textarea {
        width: 100%;
        /deep/ .el-textarea__inner {
          height: 85px;
          border: none;
        }
      }
      .pd-6 {
        padding: 6px;
      }

      .appResult {
        display: flex;
        align-items: center;
        margin-bottom: 3px;
      }

      .el-radio {
        margin-top: 3px;
      }

      // display: flex;
      .appReamrk {
        flex: 2;
        display: flex;

        .remark {
          width: 80px;
        }
      }
    }

    .approveDetail-right {
      flex: 1;
      // height: 75px;
      height: 120px;
      // margin-left: 5px;
      border: 1px solid #d7d7d7;
      overflow: hidden;

      .appFile {
        display: flex;
        align-items: center;
        height: 90px;

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

        .fileList {
          // display: flex;
          height: 100%;
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
      }

      .accessory-item {
        display: flex;
        align-items: center;

        span {
          margin-right: 5px;
        }

        .uploadBtn {
          cursor: pointer;
          font-size: 20px;
        }
      }
    }
  }

  .approveBtn {
    margin: 20px 0;
    text-align: center;
  }
}

// /deep/.el-date-editor.el-input {
//   width: 140px;
// }

.bpmns {
  width: 300px;
  border-right: 1px solid #f0f0f0;
  transition: width 0.3s;
  max-height: 600px;
  // width: 200px !important;
  // height: 600px;
  ::-webkit-scrollbar {
    height: 8px;
  }

  ::-webkit-scrollbar-track-piece {
    height: 8px;
    border-radius: 10px;
    background-color: #f5f7fa;
  }

  ::-webkit-scrollbar-thumb {
    height: 8px;
    border-radius: 10px;
    background-color: #e9e9e9;
    background-clip: padding-box;
  }

  .canvas {
    width: 300px;
    height: 100%;
    // padding-left: 40px;
    text-align: center;
    overflow: hidden auto;
  }

  .h600 {
    height: 600px;
  }

  .h700 {
    height: 700px;
  }
}

/deep/.price {
  input {
    text-align: center;
  }
}

.wh-90per {
  width: 90%;
}

.tables {
  height: 550px;
}

.table1 {
  height: 300px;
}

.el-checkbox {
  margin-left: 8px;
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

.fileName {
  width: 210px;
  overflow: hidden;
  /*超出部分隐藏*/
  white-space: nowrap;
  /*禁⽌换⾏*/
  text-overflow: ellipsis;
  /*省略号*/
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

.wh-80 {
  width: 80px;
}

.wh-110 {
  width: 110px;
}

.wh-70per {
  width: 70%;
}

.tab-box {
  position: relative;
  height: 300px;
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
  z-index: 1;

  .iconImg {
    width: 12px;
    vertical-align: middle;
  }
}

.mr5 {
  margin-right: 5px;
}

.el-table {
  /deep/ .el-icon-arrow-right:before {
    content: "\e791";
    font-size: 16px;
  }
}

/deep/ .el-tabs__item {
  color: #a8a8a8;

  &:hover {
    color: #3aa3dc;
  }
}

/deep/ .el-tabs__item.is-active {
  color: #3aa3dc;
}

.borders {
  border: 1px solid #f0f0f0;
  padding: 10px 10px 0;
}

.table-data {
  /deep/ .el-table__body-wrapper {
    background-color: #fff;
  }
}

.approver-edit {
  height: 500px;
  overflow: auto;
  padding: 20px;
  position: relative;

  .begin-box {
    text-align: center;

    .begin {
      display: inline-block;
      width: 120px;
      text-align: center;

      .circle {
        width: 30px;
        height: 30px;
        border: 1px solid;
        border-radius: 15px;
        display: inline-block;
        vertical-align: middle;
      }
    }

    .begin-text {
      display: inline-block;
      margin-left: 20px;
      line-height: 30px;
    }
  }

  .finish-box {
    margin-top: 20px;

    .finish {
      position: relative;

      .circle {
        background-color: #606266;
      }

      .finish-text {
        position: absolute;
        right: 0px;
        top: 18%;
      }

      .finish-icon {
        position: absolute;
        left: 42%;
        top: -20px;
        font-size: 20px;
      }
    }
  }

  .node-box {
    text-align: center;
    .node-item {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .node {
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid;
      width: 120px;
      height: 60px;
      // line-height: 60px;
      padding: 5px 10px;
      // display: inline-block;
      border-radius: 6px;
      position: relative;

      .node-icon {
        font-size: 20px;
        position: absolute;
        top: -20px;
        left: 43%;
      }
    }
  }

  .explain {
    position: absolute;
    left: 50px;
    top: 20%;
    width: 200px;
    color: red;
  }
  .noAppMask {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 99;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #ffffffce;
    font-size: 26px;
    font-weight: 700;
  }
}
.errMsg {
  display: flex;
  justify-content: center;
  align-items: center;
}
.ml-20 {
  margin-left: 20px;
}

.flow-chart-box {
  width: 100%;
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
      width: 120px;
      height: 60px;
      text-align: center;
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

.background-red {
  /deep/ .el-input__inner {
    padding: 0;
    background-color: #f4b4bc !important;
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
      border-top: 0;
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
}
.animal {
  width: 0;
}
.showFlowBtn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  max-height: 600px;
  cursor: pointer;
  background: linear-gradient(to right, #c0e9fb, #81d3f8);
  .btnCon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: #00000034;
    .btnColor {
      color: #ffffff5e;
      font-weight: 700;
    }
    .scale {
      transition: all 0.3s;
      transform: rotate(180deg);
    }
  }
}
</style>
