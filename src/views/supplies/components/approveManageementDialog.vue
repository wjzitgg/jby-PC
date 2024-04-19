<template>
  <div>
    <!-- 审批弹框 -->
    <el-dialog center top="3vw" :title="appDialogTitle" :visible="appDialog" width="70%" @close="closeAppDialog(false)" v-dialogDrag :close-on-click-modal="false" v-loading="loading2" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="workflowDialog">
          <div class="left-tabs" v-if="[4, 5].includes(appDialogType)">
            <div class="tabs-item" :class="{ currentTab: nowTab === 0 }" @click="nowTab = 0">盖章详情</div>
            <div class="tabs-item" :class="{ currentTab: nowTab === 1 }" @click="nowTab = 1">业务详情</div>
          </div>
          <div :class="{ 'right-content': [4, 5, 7].includes(appDialogType) }" :style="{ width: [4, 5, 7].includes(appDialogType) ? '' : '100%' }">
            <div class="signDetail h600" v-show="nowTab === 0">
              <div class="print-export2" v-if="appDialogType != 7">
                <el-button type="primary" class="el-button-primary" v-has="'supplies:inventory:orderInventoryOut'" size="mini" @click="dataExport">导出</el-button>
                <el-button type="primary" class="el-button-primary" v-has="'supplies:inventory:orderInventoryPut'" size="mini" @click="dataPrinting">打印</el-button>
              </div>
              <el-tabs v-model="signTab" v-if="[4, 5, 7].includes(appDialogType)">
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
                        <div class="flow-char-begin">
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
                            <div>{{ addForm.createUserName }}</div>
                            <div>{{ addForm.createTime }}</div>
                            <div>发起流程</div>
                          </div>
                        </div>

                        <div class="flow-char-item" v-for="(item, index) in signDetail.sealApproveDetailVo ? signDetail.sealApproveDetailVo.taskFinishList : []" :key="index">
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
                      <el-table :tooltip-effect="'light'" stripe style="width: 100%" height="100%" :data="signDetail.sealApproveDetailVo ? signDetail.sealApproveDetailVo.approveDetailList : []" :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
                        <el-table-column label="流程节点" align="center" prop="activityName"> </el-table-column>
                        <el-table-column label="填表人" align="center" prop="approver"></el-table-column>
                        <el-table-column label="审批意见" align="center" prop="approveComment" show-overflow-tooltip></el-table-column>
                        <el-table-column label="审批时间" align="center" prop="approveTime"> </el-table-column>
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
            <div class="appDialog" v-show="nowTab === 1" v-if="appDialogType != 7">
              <div class="appDialog-left" v-if="!['0', '7'].includes(appDialogForm.inventoryCode) && appDialog">
                <div class="flow-chart-box">
                  <div class="flow-char-begin">
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
                      <div>{{ appDialogForm.createUserName }}</div>
                      <div>{{ appDialogForm.createTime }}</div>
                      <div>发起流程</div>
                    </div>
                  </div>
                  <div class="flow-char-item" v-for="(item, index) in appDialogForm.taskFinishVoList.slice(1)" :key="index">
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
                      <div v-show="approveSum > index || approveSum == index" :class="{ 'upper-right': item.approveStatus == 3, 'upper-right2': item.approveStatus == 1 || (beginRow && approveSum > index) }"></div>
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
              <div class="appDialog-right" :class="{ 'wh-100per': appDialogForm.inventoryCode == 0, 'wh-ok': appDialogForm.inventoryCode >= 1 }">
                <el-tabs v-model="activeName" type="card">
                  <el-tab-pane label="盘点信息" name="first">
                    <div class="appDialog-right-header">
                      <el-row :span="24" class="el-row-data dialog-forms">
                        <el-col :span="8" class="dialog-form-item">
                          <div class="labels">盘点单号</div>
                          <div class="content">
                            <el-input v-model="appDialogForm.orderCode" size="mini" disabled> </el-input>
                          </div>
                        </el-col>
                        <el-col :span="8" class="dialog-form-item">
                          <div class="labels">仓库</div>
                          <div class="content">
                            <el-input v-model="appDialogForm.warehouseName" size="mini" disabled> </el-input>
                          </div>
                        </el-col>
                        <!-- <el-col :span="8" class="dialog-form-item">
                          <div class="labels">填表人</div>
                          <div class="content">
                            <el-input v-model="appDialogForm.leaderName" size="mini" disabled> </el-input>
                          </div>
                        </el-col> -->
                        <el-col :span="8" class="dialog-form-item">
                          <div class="labels">业务时间</div>
                          <div class="content">
                            <el-input v-model="appDialogForm.serviceTime" size="mini" disabled> </el-input>
                          </div>
                        </el-col>
                        <el-col :span="8" class="dialog-form-item">
                          <div class="labels">填表人</div>
                          <div class="content">
                            <el-input v-model="appDialogForm.createUserName" size="mini" disabled> </el-input>
                          </div>
                        </el-col>
                        <el-col :span="8" class="dialog-form-item">
                          <div class="labels">录入时间</div>
                          <div class="content">
                            <el-input v-model="appDialogForm.createTime" size="mini" disabled> </el-input>
                          </div>
                        </el-col>
                        <el-col :span="8" class="dialog-form-item" v-if="appDialogType !== 3">
                          <div class="labels">单据状态</div>
                          <div class="content">
                            <el-input v-model="appDialogForm.inventoryCodeName" size="mini" disabled> </el-input>
                          </div>
                        </el-col>
                        <!-- <el-col :span="8" class="dialog-form-item" v-if="appDialogType != 1 appDialogType nextShow">
                    <div class="labels w-90">下一审批岗位</div>
                    <div class="content">
                      <el-input v-model="nextRoleName" size="mini" disabled> </el-input>
                    </div>
                  </el-col> -->
                        <el-col :span="8" class="dialog-form-item" v-if="appDialogType == 2">
                          <div class="labels">审批人</div>
                          <div class="content">
                            <!-- <el-select v-model="appDialogForm.fkApproverId" size="mini" style="width:100%">
                        <el-option v-for="item in peopleList" :key="item.pkId" :value="item.pkId" :label="item.userName"></el-option>
                      </el-select> -->
                            <el-button size="mini" type="danger" v-if="!approvalStatus" @click="setWorldata">未设置</el-button>
                            <el-button size="mini" type="success" v-if="approvalStatus" @click="setWorldata">重新设置</el-button>
                          </div>
                        </el-col>
                        <el-col :span="24" class="dialog-form-item">
                          <div class="labels">备注</div>
                          <div class="content">
                            <el-input :value="appDialogForm.remark" size="mini" disabled></el-input>
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                    <!-- <el-radio-group v-model="dialogRadio2" size="mini">
                <el-radio-button :label="1">盘点物料</el-radio-button>
                <el-radio-button :label="2">附件</el-radio-button>
              </el-radio-group> -->
                    <el-tabs v-model="dialogRadio2" type="card">
                      <el-tab-pane label="盘点物料" name="1">
                        <div class="table-data" :class="{ 'h-280': appDialogType === 3, 'h-350': appDialogType !== 3 }">
                          <el-table :tooltip-effect="'light'" style="width: 100%" height="100%" :data="materialList" stripe :header-cell-style="{ background: '#f1f6ff' }">
                            <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
                            <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
                            <el-table-column label="物料类型" align="center" prop="materialTypeName" show-overflow-tooltip> </el-table-column>
                            <el-table-column label="供应商" align="center" prop="customerName">
                              <template slot-scope="{ row }">
                                {{ row.fkCustomerId === "0" ? "无" : row.customerName }}
                              </template>
                            </el-table-column>
                            <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
                            <el-table-column label="库存数量" align="center" prop="beforeNum"> </el-table-column>
                            <el-table-column label="盘点数量" align="center" prop="inventoryNum"> </el-table-column>
                            <el-table-column label="盘盈数" align="center">
                              <template slot-scope="{ row }">
                                <span v-if="row.inventoryNum - row.beforeNum >= 0" class="green">{{ (row.inventoryNum - row.beforeNum).toFixed(6) - 0 }}</span>
                              </template>
                            </el-table-column>
                            <el-table-column label="盘亏数" align="center">
                              <template slot-scope="{ row }">
                                <span v-if="row.inventoryNum - row.beforeNum <= 0" class="red">{{ 0 - ((row.inventoryNum - row.beforeNum).toFixed(6) - 0) }}</span>
                              </template>
                            </el-table-column>
                            <div slot="empty" class="empty" style="width: 100%">
                              <img src="@/assets/empty.svg" class="zanwu" />
                              <span>暂无数据</span>
                            </div>
                          </el-table>
                        </div>
                      </el-tab-pane>
                      <el-tab-pane :label="item.tableName" :name="'userTables' + index" v-for="(item, index) in tableDTOS" :key="index">
                        <div class="tab-box" :class="{ 'h-280': appDialogType === 3, 'h-350': appDialogType !== 3 }" @scroll="handleScroll" v-if="dialogRadio2 == 'userTables' + index">
                          <div class="text-html" v-if="tableStatus">
                            <table style="border-collapse: collapse; overflow: auto; margin: 0 auto" ref="printPage">
                              <tr v-for="(item, idx) in item.tableHtml" :key="idx" style="" v-show="item.status">
                                <td style="box-sizing: content-box; border: none; margin: 0; padding: 0" :contentEditable="i.attributeTypes == 1 && i.disabled == true && i.checkout == false && appDialogType !== 1 && (i.id == '' || i.id == appDialogForm.currentNodeId || i.name == '')" @blur="tdBlur(item, id, $event.target.innerText, $event, i)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                                  <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                                  <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" :disabled="i.id != '' && i.id == appDialogForm.currentNodeId && i.name != ''" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
                                  <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}: <img width="100px" crossorigin="anonymous" :src="i.signatureDate.img" alt="" /> </span>
                                  <el-select ref="scroll" v-if="i.attributeTypes == 2" size="mini" :disabled="i.id != '' && i.id == appDialogForm.currentNodeId && i.name != ''" v-model="i.name" placeholder="请选择">
                                    <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                                  </el-select>
                                </td>
                              </tr>
                            </table>
                          </div>
                          <div class="mask" v-if="appDialogType === 1"></div>
                        </div>
                      </el-tab-pane>
                      <el-tab-pane label="附件" name="2">
                        <div class="table-data" :class="{ 'h-280': appDialogType === 3, 'h-350': appDialogType !== 3 }">
                          <el-table :tooltip-effect="'light'" :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" v-if="appDialogType === 2">
                            <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                            <el-table-column label="附件内容描述" align="center" prop="remark" show-overflow-tooltip>
                              <template slot-scope="{ row }">
                                <el-input v-model="row.remark" size="mini" v-if="appDialogType !== 1" maxlength="100"></el-input>
                                <span v-else>{{ row.remark }}</span>
                              </template>
                            </el-table-column>
                            <el-table-column label="附件" align="center" width="180">
                              <template slot-scope="{ row }">
                                <el-button type="primary" class="el-button-primary" size="mini" v-if="!row.fileName" @click="uploadAcc(row)">上传附件 </el-button>
                                <a href="#" @click="preview(row)" v-else>{{ row.fileName }}</a>
                              </template>
                            </el-table-column>
                            <el-table-column label="操作" align="center" width="100" v-if="appDialogType !== 1">
                              <template slot-scope="{ row, $index }">
                                <span class="addAcc" v-if="accessoryList.length == $index + 1" @click="addAcc(row)" title="添加">
                                  <i class="el-icon-plus"></i>
                                </span>
                                <span class="delAcc" @click="delAcc(row, $index)" title="删除">
                                  <i class="el-icon-close"></i>
                                </span>
                              </template>
                            </el-table-column>
                            <div slot="empty" class="empty" style="width: 100%">
                              <img src="@/assets/empty.svg" class="zanwu" />
                              <span>暂无数据</span>
                            </div>
                          </el-table>
                          <el-table :tooltip-effect="'light'" :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" v-if="appDialogType !== 2">
                            <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                            <el-table-column label="上传人" align="center" prop="createUserName"> </el-table-column>
                            <el-table-column label="上传时间" align="center" prop="createTime"> </el-table-column>
                            <el-table-column label="附件内容描述" align="center" prop="remark" show-overflow-tooltip> </el-table-column>
                            <el-table-column label="操作" align="center">
                              <template slot-scope="{ row }">
                                <el-button size="mini" type="primary" class="previewAcc" @click="preview(row)"> 预览 </el-button>
                                <el-button size="mini" class="downloadAcc" @click="downloadAcc(row)"> 下载 </el-button>
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
                    <!-- <div class="table-data" :class="{ 'h-280': appDialogType === 3, 'h-350': appDialogType !== 3 }">
                <el-table :tooltip-effect="'light'" style="width: 100%" height="100%" :data="materialList" v-if="dialogRadio2 === 1" stripe :header-cell-style="{ background: '#f1f6ff' }">
                  <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
                  <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
                  <el-table-column label="物料类型" align="center" prop="materialTypeName"> </el-table-column>
                  <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
                  <el-table-column label="库存数量" align="center" prop="beforeNum"> </el-table-column>
                  <el-table-column label="盘点数量" align="center" prop="inventoryNum"> </el-table-column>
                  <el-table-column label="盘盈数" align="center">
                    <template slot-scope="{ row }">
                      <span v-if="row.inventoryNum - row.beforeNum > 0" class="green">{{ (row.inventoryNum - row.beforeNum).toFixed(6) - 0 }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="盘亏数" align="center">
                    <template slot-scope="{ row }">
                      <span v-if="row.inventoryNum - row.beforeNum < 0" class="red">{{ 0 - ((row.inventoryNum - row.beforeNum).toFixed(6) - 0) }}</span>
                    </template>
                  </el-table-column>
                  <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                  </div>
                </el-table>
                <el-table :tooltip-effect="'light'" :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" v-if="dialogRadio2 === 2 && appDialogType === 2">
                  <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                  <el-table-column label="附件内容描述" align="center" prop="remark">
                    <template slot-scope="{ row }">
                      <el-input v-model="row.remark" size="mini" v-if="appDialogType !== 1" maxlength="100"></el-input>
                      <span v-else>{{ row.remark }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="附件" align="center" width="180">
                    <template slot-scope="{ row }">
                      <el-button type="primary" class="el-button-primary" size="mini" v-if="!row.fileName" @click="uploadAcc(row)">上传附件 </el-button>
                      <a href="#" @click="preview(row)" v-else>{{ row.fileName }}</a>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" align="center" width="100" v-if="appDialogType !== 1">
                    <template slot-scope="{ row, $index }">
                      <span class="addAcc" v-if="accessoryList.length == $index + 1" @click="addAcc(row)" title="添加">
                        <i class="el-icon-plus"></i>
                      </span>
                      <span class="delAcc" @click="delAcc(row, $index)" title="删除">
                        <i class="el-icon-close"></i>
                      </span>
                    </template>
                  </el-table-column>
                  <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                  </div>
                </el-table>
                <el-table :tooltip-effect="'light'" :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" v-if="dialogRadio2 === 2 && appDialogType !== 2">
                  <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                  <el-table-column label="上传人" align="center" prop="createUserName"> </el-table-column>
                  <el-table-column label="上传时间" align="center" prop="createTime"> </el-table-column>
                  <el-table-column label="附件内容描述" align="center" prop="remark"> </el-table-column>
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
              </div> -->
                  </el-tab-pane>
                  <el-tab-pane label="审批记录" name="second" v-if="appDialogForm.inventoryCode >= 1">
                    <div class="h-450 table-data">
                      <el-table :tooltip-effect="'light'" style="width: 100%" height="100%" :data="approverList" stripe :header-cell-style="{ background: '#f1f6ff' }">
                        <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
                        <el-table-column label="流程节点" align="center" prop="activityName"> </el-table-column>
                        <el-table-column label="填表人" align="center" prop="approver"></el-table-column>
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
                <div v-if="appDialogType === 3">
                  <div class="approveDetail">
                    <div class="approveDetail-left">
                      <div class="approveDetail-head">审批意见</div>
                      <!-- <div class="pd-6">
                        <div class="appResult">
                          审批结果： <el-radio v-model="approvalForm.approveStatus" :label="1">审批通过</el-radio><br />
                          <el-radio v-model="approvalForm.approveStatus" :label="0">审批不通过</el-radio>
                        </div>
                        <div class="appReamrk">
                          <div class="remark">被批意见</div>
                        </div>
                      </div> -->
                      <el-input type="textarea" resize="none" v-model="approvalForm.approveComment" maxlength="200"> </el-input>
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
                      <!-- <div class="accessory-item" v-for="(item, index) in appAccList" :key="item.id">
                  <span>附件描述</span>
                  <span><el-input v-model="item.remark" size="mini" class="wh-120" maxlength="100"></el-input></span>
                  <span v-if="!!item.fileName" class="fileName" :title="item.fileName">
                    <i class="el-icon-link"></i>
                    <a href="#" @click="preview(item)">{{ item.fileName }}</a>
                  </span>
                  <span v-if="!item.fileName" class="uploadBtn" @click="uploadAcc(item)">
                    <i class="el-icon-upload2"></i>
                  </span>
                  <span>
                    <span class="addAcc" v-if="appAccList.length == index + 1" @click="addAcc(item)">
                      <i class="el-icon-plus"></i>
                    </span>
                    <span class="delAcc" @click="delAcc(item, index)">
                      <i class="el-icon-close"></i>
                    </span>
                  </span>
                </div> -->
                    </div>
                  </div>
                </div>
              </div>
              <div class="print-export" :class="{ pst: ![1, 2].includes(appDialogType) }" v-if="appDialogType == 1">
                <el-button type="primary" class="el-button-primary" size="mini" v-has="'supplies:inventory:orderInventoryOut'" @click="dataExport">导出</el-button>
                <el-button type="primary" class="el-button-primary" size="mini" v-has="'supplies:inventory:orderInventoryPut'" @click="dataPrinting">打印</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" v-if="[2, 3, 6, 7].includes(appDialogType)">
        <el-button type="primary" @click="signerClick" @keyup.space.native.prevent @keyup.prevent @keydown.enter.native.prevent :disabled="loading2" v-if="siStatus && ![6, 7].includes(appDialogType)">签名</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="appDialogOk(2, 1)" v-if="appDialogType === 3 && !siStatus">审批通过</el-button>
        <el-button size="mini" type="danger" @click="appDialogOk(2, 0)" v-if="appDialogType === 3">审批不通过</el-button>
        <el-button type="primary" class="el-button-primary" @click="checkCode" v-if="appDialogType === 2 && !siStatus">提交审批</el-button>
        <el-button type="danger" @click="withdraw" :disabled="loading2" v-if="[6, 7].includes(appDialogType)">撤回</el-button>
        <el-button type="primary" plain @click="closeAppDialog(false)">取 消</el-button>
      </div>
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
    <approveCodeDialog ref="approveCodeDialog" :approveCodeDialog.sync="approveCodeDialog" :siStatus="siStatus" :signed="signed" @signature="signature" @closeLoading="closeLoading2" :sign-date="signDate" @approveOk="approveOk" :noApprove="[6, 7].includes(appDialogType) ? true : false" :biz-type="2" :appCodeType="appCodeType" @getNew="getNew"/>
    <input ref="upload" type="file" style="display: none" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.docx,image/jpg,image/jpeg,image/png,application/pdf" @change="upLoad" />

    <!-- 设置审批人 -->
    <el-dialog :close-on-press-escape="false" title="设置审批人" width="70%" class="tree-dialog" top="5vh" :visible="approvalShow" v-loading="loading2" v-dialogDrag :close-on-click-modal="false" @close="approvalCancel(0)">
      <div class="approver-edit" v-if="!errShow" :style="{ overflow: approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId ? 'hidden' : 'auto' }">
        <div class="begin-box">
          <div class="begin">
            <div class="circle"></div>
          </div>
          <div class="begin-text wh-100" style="">审批人员</div>
        </div>
        <div class="node-box">
          <div v-for="(item, index) in approvalData.workflowNodeDTOS" :key="index" v-show="item.nodeType == 2" style="margin-top: 20px">
            <div class="node">
              <i class="el-icon-user-solid"></i>
              {{ item.nodeName }}
              <i class="el-icon-bottom node-icon"></i>
            </div>
            <el-select @change="selectedUserIdChange" :clearable="item.prodSysRoleVo.sysUserList.length != 0" :disabled="item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1)" v-model="item.prodSysRoleVo.selectedUserId" size="mini" class="wh-100 ml-20" v-if="item.nodeType == 2" :class="{ 'background-red': item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1 && !item.prodSysRoleVo.selectedUserId) }">
              <el-option v-for="items in item.prodSysRoleVo.sysUserList" :key="items.pkId" :label="items.userName" :value="items.pkId"></el-option>
              <el-option v-if="item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1 && !item.prodSysRoleVo.selectedUserId)" style="background-color: red" label="未找到匹配人员" value=""></el-option>
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
        <div class="noAppMask" v-if="approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId">此流程节点只能由【{{ approvalData.workflowNodeDTOS[1].prodSysRoleVo.roleName }}】发起</div>
        <!-- <div class="explain">说明：如果企业设置了不可跳过节点，点击设置时，有未选择人员的节点或未找到匹配人员的节点，都提示“XXX（节点名称）未配置人员”。</div> -->
      </div>
      <div v-if="errShow" class="approver-edit errMsg">
        <h2>请先设置盘点审批流程</h2>
      </div>
      <div slot="footer" v-if="!errShow && !(approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId)">
        <el-button size="mini" type="primary" class="el-button-primary" @click="approvalSet">设置</el-button>
        <el-button size="mini" @click="approvalCancel(0)">取 消</el-button>
      </div>
    </el-dialog>
    <nodeDetail :dialogVisible2.sync="dialogVisible2" :getData="nodeData" :nodeStart="nodeStart"></nodeDetail>
    <chapterProcessApproval :chaptersApprovalDialog.sync="chaptersApprovalDialog" :not-now="true" :not-now-data="nodeData"></chapterProcessApproval>

    <div style="position: absolute; left: -9999999px" v-if="pdfShows">
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
import pdfPiev from "@/components/pdf-preview/pdf-preview.vue";
import COS from "cos-js-sdk-v5";
import approveCodeDialog from "@/components/approveCodeDialog.vue";
import utils from "@/utils/util";
import htmlToPdf from "@/utils/htmlToPdf";
import { uploadObject } from "@/utils/upload";
import htmlToPdfUpload from "@/utils/htmlToPdfUpload";
import { uploadObjectPdf } from "@/utils/uploadPdf";
import printJs from "print-js";
import nodeDetail from "./nodeDetail.vue";
import signPdf from "../../../components/signPdf/signPdf.vue";
import chapterProcessApproval from "../../../components/inChapter/chapterProcessApproval2.vue";
export default {
  components: { pdfPiev, approveCodeDialog, nodeDetail, signPdf, chapterProcessApproval },
  props: {
    appDialog: {
      type: Boolean,
      default: false
    },
    appDialogType: "", // 1查看，2提交审批，3审批，4查看盖章信息，5已办查看,6撤回，7盖章撤回
    appDialogTitle: "",
    signData: {}
  },

  data() {
    return {
      nowTab: 1,
      signTab: "1",
      loading2: false,
      statusList: ["草稿", "审批中", "审批通过", "审批不通过"],
      addForm: {
        orderCode: "",
        approveStatus: "",
        fkWarehouseId: "",
        leaderName: "",
        serviceTime: "",
        fkBidProjectId: null
      },
      materialList: [
        {
          beforeNum: "",
          costPrice: "",
          fkMaterialId: "",
          inventoryNum: "",
          materialPrice: "",
          materialName: "",
          materialTypeName: ""
        }
      ],
      materDialog: false,
      //   appDialogTitle: "",
      //   appDialog: false,
      appDialogForm: {},
      approvalForm: {
        approveComment: "",
        approveStatus: 1
      },
      accessoryList: [{ fileName: "", remark: "", fileUrl: "" }],
      activeName: "first",
      dialogRadio2: "1",
      appAccList: [],
      nowUploadObj: {},
      // 附件文件类型
      fileType: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpg", "image/jpeg", "image/png", "application/pdf"],
      url: "",
      previewDialog: false,
      previewType: 1,
      nowPreviewObj: {},
      approverList: [],
      nextRoleName: "",
      peopleList: [],
      bpmnImg: "",
      nextShow: false,
      approveCodeDialog: false,
      signDate: {},
      tableDTOS: [],
      pdfTable: [],
      pdfTitle: [],
      pdfUrl: [],
      newAddList: [],
      delList: [],
      approvalShow: false,
      approvalData: {
        workflowNodeDTOS: [
          {
            prodSysRoleVo: {
              sysUserList: []
            }
          }
        ]
      },
      approvalStatus: false,
      approveSum: null,
      dialogVisible2: false,
      nodeData: {},
      signDetail: {
        sealApproveDetailVo: {},
        sealScheduleDetailList: [],
        sealTableList: []
      },
      modifiedList: [],
      chaptersApprovalDialog: false,
      pdfShows: false,
      siStatus: false,
      tableStatus: true,
      beginRow: false,
      errShow: false,
      nodeStart: false,
      signed: false,
      appCodeType: 0,
      workflowNodeDTOS2: []
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user")) || [];
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
    appDialog(val) {
      if (val) {
        if ([4, 5, 7].includes(this.appDialogType)) {
          this.nowTab = 0;
        } else {
          this.nowTab = 1;
        }
        if (this.appDialogType === 5) {
          this.addForm = this.signData;
          this.appDialogForm = this.signData;
          this.approveSum = null;
          if (this.signData.taskFinishVoList != null) {
            this.signData.taskFinishVoList.slice(1).forEach((item, index) => {
              if (item.approveStatus == 1 || item.approveStatus == 3) {
                this.approveSum = index;
              }
              if (item.approveStatus == 1) {
                this.beginRow = true;
              }
            });
          }
          this.materialList = this.signData.engMatOrderInventoryDetailsVos ? this.signData.engMatOrderInventoryDetailsVos : [];
          this.approverList = this.signData.approveDetailList ? this.signData.approveDetailList : []; // 审批记录
          this.accessoryList = this.signData.fileList ? this.signData.fileList : [];
          this.nowTab = 0;
          this.signDetail = this.signData.sealBusinessVo
            ? this.signData.sealBusinessVo
            : {
                sealApproveDetailVo: {},
                sealScheduleDetailList: [],
                sealTableList: []
              };
          this.tableDTOS = this.signData.workflowTableList ? this.signData.workflowTableList : [];
          if (this.tableDTOS) {
            this.tableDTOS.forEach(item => {
              item.tableHtml = this.utils.unzip(item.tableHtml);
              if (item.tableHtml instanceof Array) {
                this.pdfTable.push(item.tableHtml);
              } else {
                item.tableHtml = JSON.parse(item.tableHtml);
                this.pdfTable.push(item.tableHtml);
              }
              this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
            });
          }
        }
      } else {
        this.beginRow = false;
      }
    }
  },
  methods: {
    getNew() {
      if (this.appDialogType === 3) {
        this.siStatus = false;
        const roleId = this.appDialogForm.roleId;
        const sysRoleId = this.appDialogForm.sysRoleId;
        this.$api.getApproveStatus().then(res => {
          this.appCodeType = res.data
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
    // 点击打开设置审批人 以及解决取消时 数据保存 错误问题
    setWorldata() {
      this.approvalShow = true;
      this.workflowNodeDTOS2 = JSON.parse(JSON.stringify(this.approvalData.workflowNodeDTOS)); // 用于临时保存克隆数据
    },
    approvalCancel(num) {
      // this.approvalStatus = false;
      // this.approvalShow = false;
      // this.getOrderInventoryApprover({
      //   warehouseId: this.appDialogForm.fkWarehouseId,
      //   pkId: this.appDialogForm.pkId
      // });
      if (num == 1 && this.approvalShow == true) {
        this.approvalShow = false;
      }
      if (num == 0 && this.approvalShow == true) {
        this.approvalShow = false;
        this.approvalData.workflowNodeDTOS = this.workflowNodeDTOS2;
      }
    },
    getSign() {
      this.siStatus = false;
      this.signed = false;
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
    checkCode() {
      if (!this.approvalStatus) {
        return this.$message.warning("请至少设置一个审批人");
      }
      if (this.approvalData.launchType == 2) {
        this.$refs.approveCodeDialog.getApproveStatus();
      } else {
        this.appDialogOk(1, null);
      }
    },
    approveOk(unique) {
      if (this.appDialogType == 2) {
        this.appDialogOk(1, null, unique);
      } else {
        this.approvalOrderInventory(unique);
      }
    },
    signature(res) {
      if (this.appDialogType == 2) {
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
                  if (i.signatureDate.signer == this.addForm.roleId || i.signatureDate.signer == this.addForm.sysRoleId) {
                    i.signatureDate.img = res.data.url;
                    this.pdfShows = false;
                    this.pdfShows = true;
                    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                  }
                }
              });
            });
          });
        }
        console.log(res);
        this.tableDTOS.forEach(item => {
          if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
            item.tableHtml.forEach(e => {
              e.arr.forEach(i => {
                if (i.attributeTypes == 3) {
                  console.log(i.signatureDate.signer, i.signatureDate.signer == res.data.roleId);
                  if (i.signatureDate.signer == this.addForm.roleId || i.signatureDate.signer == this.addForm.sysRoleId) {
                    console.log(res.data.url);
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
      }
    },
    signerClick() {
      if (!this.approvalStatus) {
        return this.$message.warning("请至少设置一个审批人");
      }
      this.$refs.approveCodeDialog.getApproveStatus(true);
    },
    withdraw() {
      this.loading2 = true;
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
    checkNodes(row) {
      const data = {
        flowCaseId: row.flowCaseId,
        nodeId: row.currentNodeId,
        taskId: row.taskId
      };
      this.$api.searchByBusinessNode(data).then(res => {
        if (res.code === 200) {
          this.nodeData = res.data.engMatOrderInventoryVo;
          this.nodeStart = row.currentNodeId == 0 ? true : false;
          this.dialogVisible2 = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    selectedUserIdChange() {
      // this.approvalStatus = true;
    },
    approvalSet() {
      let nodeArr = this.approvalData.workflowNodeDTOS.filter(item => item.nodeType == 2);
      if (this.approvalData.launchType == 2 && !nodeArr[0].prodSysRoleVo.selectedUserId) {
        return this.$message.warning("首个节点必须有人");
      }
      let arr = this.approvalData.workflowNodeDTOS;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].nodeType == 2) {
          console.log(arr[i]);
          if (arr[i].prodSysRoleVo && !!arr[i].prodSysRoleVo.selectedUserId) {
            console.log(arr[i].prodSysRoleVo.selectedUserId);
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

    getOrderInventoryApprover(data) {
      this.errShow = false;
      this.$api.getOrderInventoryApprover(data).then(res => {
        if (res.code == 200) {
          if (res.data) {
            res.data.workflowNodeDTOS.forEach((item, index) => {
              if (item.nodeType == 2) {
                item.prodSysRoleVo = item.prodSysRoleVo == null ? { selectedUserId: "", sysUserList: [] } : item.prodSysRoleVo;
                if (res.data.launchType == 2 && index == 1) {
                  let arr = item.prodSysRoleVo.sysUserList.filter(item => item.pkId == this.user.pkId);
                  item.prodSysRoleVo.selectedUserId = arr.length ? this.user.pkId : "";
                  this.signDate = {
                    fkNodeId: item.pkId,
                    fkTemplateId: item.fkWorkflowTemplateId
                  };
                } else {
                  item.prodSysRoleVo.selectedUserId = item.prodSysRoleVo.selectedUserId == null ? "" : item.prodSysRoleVo.selectedUserId;
                }
                // if (item.prodSysRoleVo.selectedUserId.length != 0) {
                //   // this.approvalStatus = true;
                // }
              }
            });
            this.approvalData = res.data;
            if (res.data.launchType == 2) {
              this.getSign();
            }
          } else {
            this.errShow = true;
            this.approvalStatus = false;
          }
          // this.approvalData.workflowNodeDTOS.forEach(item=>{
          //   if(item.nodeType ==2)
          // })
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 导出
    dataExport() {
      this.pdfUrl = [];
      this.pdfShows = true;
      this.$nextTick(() => {
        this.loading2 = true;
        if (this.pdfTable.length == 0) {
          const data = {
            engTableExportList: this.pdfUrl,
            pkId: this.addForm.pkId
          };
          this.orderInventoryExport(data);
        } else {
          this.pdfTable.forEach((item, idx) => {
            htmlToPdf
              .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false, this.pdfTitle[idx].title.type) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
              .then(res => {
                const _this = this;
                const files = uploadObject(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                  _this.urlPush(url, 0);
                });
              })
              .catch(err => {
                this.loading2 = false;
              });
            if (idx + 1 == this.pdfTable.length) {
            }
          });
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
          pkId: this.addForm.pkId
        };
        if (type === 0) {
          this.orderInventoryExport(data);
        } else {
          this.orderInventoryPrintPDF(data);
        }
      }
    },
    // 导出接口
    orderInventoryExport(data) {
      this.$api
        .orderInventoryExport(data)
        .then(res => {
          this.loading2 = false;
          if (res.code == 200) {
            utils.downFile(res.data.url, res.data.fileName);
          } else {
            this.$message.warning(res.msg);
          }
          this.pdfShows = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 打印接口
    dataPrinting() {
      this.pdfUrl = [];
      this.pdfShows = true;
      this.$nextTick(() => {
        this.loading2 = true;
        if (this.pdfTable.length == 0) {
          const data = {
            engTableExportList: this.pdfUrl,
            pkId: this.addForm.pkId
          };
          this.orderInventoryPrintPDF(data);
        } else {
          this.pdfTable.forEach((item, idx) => {
            htmlToPdf
              .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
              .then(res => {
                const _this = this;
                const files = uploadObject(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                  _this.urlPush(url, 1);
                });
              })
              .catch(err => {
                this.loading2 = false;
              });
            if (idx + 1 == this.pdfTable.length) {
            }
          });
        }
      });
    },
    orderInventoryPrintPDF(data) {
      this.$api
        .orderInventoryPrintPDF(data)
        .then(res => {
          this.loading2 = false;
          if (res.code == 200) {
            printJS({ printable: res.data.url, type: "pdf" });
          } else {
            this.$message.warning(res.msg);
          }
          this.pdfShows = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // ===============================================================================
    // 审批时员工列表
    // findUserList(warehouseId) {
    //   this.$api.findUserList({ warehouseId }).then(res => {
    //     if (res.code === 200) {
    //       this.nextShow = res.data ? true : false;
    //       this.nextRoleName = res.data.roleName;
    //       this.peopleList = res.data.sysUserList;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 审批时员工列表
    // findUserList2(flowCaseId) {
    //   this.$api.findNextUserOrderInv({ flowCaseId }).then(res => {
    //     if (res.code === 200) {
    //       if(res.data){
    //         this.nextShow =true
    //         this.nextRoleName = res.data.roleName;
    //         this.peopleList = res.data.sysUserList;
    //       }else{
    //         this.nextShow =false
    //       }
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 根据id查询盘点单
    findOrderInventoryById(pkId, type) {
      this.$api
        .findOrderInventoryById({ pkId, type })
        .then(res => {
          if (res.code === 200) {
            this.addForm = res.data;
            this.appDialogForm = res.data;
            this.approveSum = null;
            if (res.data.taskFinishVoList != null) {
              res.data.taskFinishVoList.slice(1).forEach((item, index) => {
                if (item.approveStatus == 1 || item.approveStatus == 3) {
                  this.approveSum = index;
                }
                if (item.approveStatus == 1) {
                  this.beginRow = true;
                }
              });
            }
            this.approvalStatus = !res.data.settingApproveFlag;
            this.materialList = res.data.engMatOrderInventoryDetailsVos ? res.data.engMatOrderInventoryDetailsVos : [];
            this.approverList = res.data.approveDetailList ? res.data.approveDetailList : []; // 审批记录
            // fileList 附件列表  deleteFlag是否可删除
            if (this.appDialogType === 1) {
              this.accessoryList = res.data.fileList ? res.data.fileList : [];
            } else {
              if (res.data.inventoryCode === "1") {
                if (res.data.fileList) {
                  this.accessoryList = res.data.fileList.filter(item => !item.deleteFlag);
                  this.appAccList = res.data.fileList.filter(item => item.deleteFlag).length ? res.data.fileList.filter(item => item.deleteFlag) : [];
                } else {
                  this.accessoryList = [];
                  this.appAccList = [];
                }
              } else {
                if (res.data.inventoryCode === "0" || res.data.inventoryCode === "7") {
                  this.accessoryList = res.data.fileList && res.data.fileList.length ? res.data.fileList : [{ fileName: "", remark: "", fileUrl: "" }];
                } else {
                  this.accessoryList = res.data.fileList ? res.data.fileList : [];
                }
              }
              this.signDate = {
                fkBizId: res.data.pkId,
                fkNodeId: res.data.currentNodeId,
                fkTemplateId: res.data.fkWorkflowTemplateId
              };
            }

            // this.bpmnImg = res.data.hisProcessDiagram; // hisProcessDiagram 流程图
            //   this[dialogName] = true;
            console.log("xxxxxxxxxxxxxxxxxxxxx");
            // console.log(this.pdfTitle)
            // console.log(this.pdfTable)
            console.log("xxxxxxxxxxxxxxxxxxxxx");
            if (["0", "1", "3", "7"].includes(res.data.inventoryCode)) {
              this.appDialogForm.fkApproverId = "";
              // this.appDialogType != 3 ? this.findUserList(res.data.fkWarehouseId) : this.findUserList2(res.data.fkFlowCaseId);
              // this.approvalStatus = false;
            }

            this.$emit("closeLoading");
            this.$emit("update:appDialog", true);
            this.signDetail = res.data.sealBusinessVo
              ? res.data.sealBusinessVo
              : {
                  sealApproveDetailVo: {},
                  sealScheduleDetailList: [],
                  sealTableList: []
                };
            this.tableDTOS = res.data.workflowTableList ? res.data.workflowTableList : [];
            if (this.tableDTOS) {
              let arr1 = JSON.stringify(this.tableDTOS);
              this.modifiedList = JSON.parse(arr1);
              this.modifiedList.forEach(item => {
                item.tableHtml = utils.unzip(item.tableHtml);
              });
              this.tableDTOS.forEach(item => {
                item.tableHtml = this.utils.unzip(item.tableHtml);
                if (item.tableHtml instanceof Array) {
                  this.pdfTable.push(item.tableHtml);
                } else {
                  item.tableHtml = JSON.parse(item.tableHtml);
                  this.pdfTable.push(item.tableHtml);
                }
                this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
              });
            }
            if (this.tableDTOS) {
              this.pdfTitle = [];
              this.pdfTable = [];
              this.tableDTOS.forEach(item => {
                if (item.tableHtml instanceof Array) {
                  // this.pdfTable.push(item.tableHtml);
                } else {
                  item.tableHtml = this.utils.unzip(item.tableHtml);
                  item.tableHtml = JSON.parse(item.tableHtml);
                  // this.pdfTable.push(item.tableHtml);
                }
                this.pdfTable.push(item.tableHtml);
                this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
              });
            }
            if (this.appDialogType == 2) {
              this.getOrderInventoryApprover({
                warehouseId: res.data.fkWarehouseId,
                pkId: res.data.pkId
              });
            }
            if (this.appDialogType === 3) {
              this.siStatus = false;
              this.signed = false;
              const roleId = res.data.roleId;
              const sysRoleId = res.data.sysRoleId;
              this.$api.getApproveStatus().then(res => {
                this.appCodeType = res.data;
                if (res.data == 2 || res.data == 3) {
                  this.tableDTOS.forEach(item => {
                    if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
                      // debugger
                      item.tableHtml.forEach(e => {
                        e.arr.forEach(i => {
                          if (i.attributeTypes == 3) {
                            // this.siStatus = this.user.systemRoleList.filter(item => item == i.signatureDate.signer);
                            // this.user.systemRoleList.forEach(a => {
                            if (roleId == i.signatureDate.signer) {
                              i.signatureDate.img = "";
                              this.siStatus = true;
                            }
                            // });
                            // this.user.roleList.forEach(a => {
                            if (sysRoleId == i.signatureDate.signer) {
                              i.signatureDate.img = "";
                              this.siStatus = true;
                            }
                            // });
                          }
                        });
                      });
                    }
                  });
                }
              });
            }
            console.log("表格ok", this.pdfTable);
            // this.$nextTick(() => {
            //   res.data.tableDTOS.forEach((item, idx) => {
            //     if (utils.unzip(item.tableHtml) instanceof Array) {
            //       this.pdfTable.push(utils.unzip(item.tableHtml))
            //     }else{
            //       this.pdfTable.push(JSON.parse(utils.unzip(item.tableHtml)));
            //     }
            //     // this.pdfTable.push(JSON.parse());
            //     this.pdfTitle.push({ title: item.tableName, type: item.tableHead });
            //   });
            //   console.log("xxxxxxxxxxxxxxxxxxxxx")
            //   console.log(res.data.tableDTOS)
            //   console.log(this.pdfTable)
            //   console.log("xxxxxxxxxxxxxxxxxxxxx")
            // });
          } else {
            this.$emit("closeLoading");
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
          this.$emit("closeLoading");
        });
    },
    // openAppDialog(type, row) {
    //   this.appDialogType = type;
    //   this.findUserList();
    //   if (type === 2) {
    //     this.appDialogTitle = "提交审批";
    //     this.findOrderInventoryById(row.pkId, "appDialog");
    //   } else if (type === 3) {
    //     this.appDialogTitle = "审批盘点单";
    //     this.findOrderInventoryById(row.pkId, "appDialog");
    //   }
    // },
    appDialogOk(type, approveStatus, unique) {
      if (type === 1) {
        // if (!this.appDialogForm.fkApproverId) {
        //   return this.$message.warning("请选择审批人");
        // }
        const engMatOrderInventoryDetailsAdds = this.materialList.filter(item => item.fkMaterialId);
        const fileList = this.accessoryList.filter(item => item.fileUrl);
        // fkApproverId: this.appDialogForm.fkApproverId,
        const data = { ...this.addForm, approveStatus: 1, engMatOrderInventoryDetailsAdds, fileList };
        // delete data.fileList
        this.loading2 = true;
        data.prodWorkflowUserAddList = [];
        this.approvalData.workflowNodeDTOS.forEach(item => {
          if (item.nodeType == 2) {
            data.prodWorkflowUserAddList.push({
              bizType: 2,
              fkRoleId: item.fkRoleId,
              currentNodeId: item.pkId,
              fkApproverId: item.prodSysRoleVo.selectedUserId
            });
          }
        });
        const tableData = this.tableDTOS.length ? JSON.parse(JSON.stringify(this.tableDTOS)) : [];
        if (tableData.length) {
          tableData.forEach((item, idx) => {
            if (item.tableHtml.length == 0 || item.tableHtml == null) {
              this.$message.warning("表格数据为空 请检查表格数据是否正常");
              return (this.loading2 = false);
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
        if (!this.loading2) {
          return;
        }
        data.workflowTableList = tableData;
        if (unique) {
          data.unique = unique;
        }
        this.$api
          .updateOrderInventory(data)
          .then(res => {
            this.loading2 = false;
            if (res.code === 200) {
              this.$message.success("提交审批成功");
              this.getList();
              this.closeAppDialog(true);
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading2 = false;
          });
      } else {
        // if (this.nextShow && this.approvalForm.approveStatus && !this.appDialogForm.fkApproverId) {
        //   return this.$message.warning("请选择审批人");
        // }
        this.$confirm("确定审批?", "审批提醒", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          // console.log("xcccccccccccccccccccccccccccccc");
          // this.siStatus = false;
          // this.tableDTOS.forEach(item => {
          //   if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
          //     item.tableHtml.forEach(e => {
          //       e.arr.forEach(i => {
          //         if (i.attributeTypes == 3) {
          //           // this.siStatus = this.user.roleList.filter(item => item == i.signatureDate.signatureUnit);
          //           this.user.systemRoleList.forEach(a=>{
          //             if(a == i.signatureDate.signer){
          //               this.siStatus = true
          //             }
          //           })
          //           this.user.roleList.forEach(a=>{
          //             if(a == i.signatureDate.signer){
          //               this.siStatus = true
          //             }
          //           })
          //         }
          //       });
          //     });
          //   }
          // });
          // console.log("xcccccccccccccccccccccccccccccc");
          // return;
          this.loading2 = true;
          this.approvalForm.approveStatus = approveStatus;
          if (approveStatus == 0) {
            const fileList = [...this.accessoryList.filter(item => item.fileUrl), ...this.appAccList.filter(item => item.fileUrl)];
            return this.$refs.approveCodeDialog.getApproveStatus(null, true);
          }
          this.$refs.approveCodeDialog.getApproveStatus();
        });
        // this.approvalOrderInventory();
      }
    },
    closeLoading2() {
      this.loading2 = false;
    },
    approvalOrderInventory(unique) {
      if (this.appDialogType == 3) {
        const fileList = [...this.accessoryList.filter(item => item.fileUrl), ...this.appAccList.filter(item => item.fileUrl)];
        const tableData = JSON.parse(JSON.stringify(this.tableDTOS));
        let num1 = tableData.filter(item => item.convertPdfStatus == 1).length;
        if (tableData.length) {
          tableData.forEach((item, idx) => {
            item.tableHtml = JSON.stringify(item.tableHtml);
            item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
          });
        }
        this.accountability(tableData, fileList, unique);
        return;
        if (num1 > 0) {
          // return console.log(this.pdfTable)
          let num2 = 0;
          this.pdfShows = true;
          this.$nextTick(() => {
            this.pdfTable.forEach((item, idx) => {
              // return console.log(tableData)
              if (tableData[idx].convertPdfStatus == 1) {
                htmlToPdfUpload
                  .getPdf("#pdfDom" + idx, tableData[idx].tableName, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
                  .then(res => {
                    const _this = this;
                    uploadObjectPdf(utils.dataURLtoFile(res, item.tableName), url => {
                      tableData[idx].tablePdfUrl = url;
                      // let num2 = tableData.filter(item => item.convertPdfStatus == 1 && !!item.tablePdfUrl).length;
                      num2++;
                      if (num1 == num2) {
                        _this.accountability(tableData, fileList);
                      }
                    });
                  });
              }
            });
          });
        } else {
          this.accountability(tableData, fileList);
        }
      } else {
        if (this.appDialogType == 7) {
          this.loading2 = true;
          this.$api
            .revocationWithdrawSeal({ pkId: this.addForm.pkId, unique })
            .then(res => {
              this.closeLoading2();
              if (res.code == 200) {
                this.$message.success("撤回成功");
                this.getList();
                this.$emit("closeLoading");
                this.$emit("update:appDialog", false);
              } else {
                this.$message.warning(res.msg);
              }
            })
            .catch(() => {
              this.closeLoading2();
            });
        } else {
          this.loading2 = true;
          this.$api
            .recallOrderInventory({ pkId: this.addForm.pkId, unique })
            .then(res => {
              this.closeLoading2();
              if (res.code === 200) {
                this.$message.success("撤回成功");
                this.getList();
                this.$emit("closeLoading");
                this.$emit("update:appDialog", false);
              } else {
                this.$message.warning(res.msg);
              }
            })
            .catch(() => {
              this.closeLoading2();
            });
        }
      }
    },
    accountability(tableData, fileList, unique) {
      if (tableData.length) {
        tableData.forEach((item, idx) => {
          if (item.tableHtml.length == 0 || item.tableHtml == null) {
            this.$message.warning("表格数据为空 请检查表格数据是否正常");
            return (this.loading2 = false);
          }
          // item.tableHtml = JSON.stringify(item.tableHtml);
          // debugger
          if (this.modifiedList[idx].tableHtml == item.tableHtml) {
            item.isModified = 0;
          } else {
            item.isModified = 1;
          }
          // item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
        });
      }
      const data = {
        ...this.approvalForm,
        fileList,
        pkId: this.appDialogForm.pkId,
        workflowTableList: tableData
      };
      if (!data.approveComment) {
        data.approveComment = data.approveStatus ? "审批通过" : "审批不通过";
      }
      if (unique) {
        data.unique = unique;
      }
      // return console.log(data)
      this.loading2 = true;
      this.$api
        .approvalOrderInventory(data)
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.$message.success("审批成功");
            this.getList();
            this.closeAppDialog(true);
          } else {
            this.$message.warning(res.msg);
            if (data.workflowTableList.length != 0) {
              const arr = [];
              data.workflowTableList.forEach(item => {
                arr.push(item.tablePdfUrl);
              });
              const urls = arr.join(",");
              this.$api.delFiles({ urls });
            }
          }
          this.pdfShows = false;
        })
        .catch(err => {
          console.log(err);
          this.loading2 = false;
          if (data.workflowTableList.length != 0) {
            const arr = [];
            data.workflowTableList.forEach(item => {
              arr.push(item.tablePdfUrl);
            });
            const urls = arr.join(",");
            this.$api.delFiles({ urls });
          }
          this.pdfShows = false;
        });
    },
    getList() {
      this.$emit("getList");
    },
    closeAppDialog(isDel) {
      this.$emit("update:appDialog", false);
      this.$emit("close");
      this.activeName = "first";
      this.dialogRadio2 = "1";
      this.approvalForm = {
        approveComment: "",
        approveStatus: 1
      };
      this.siStatus = false;
      this.signed=false
      this.addForm = {
        orderCode: "",
        approveStatus: "",
        fkWarehouseId: "",
        leaderName: "",
        serviceTime: ""
      };
      this.materialList = [
        {
          beforeNum: "",
          costPrice: "",
          fkMaterialId: "",
          inventoryNum: "",
          materialPrice: "",
          materialName: "",
          materialTypeName: ""
        }
      ];
      this.approvalStatus = false;
      this.appDialogForm = {};
      this.accessoryList = [{ fileName: "", remark: "", fileUrl: "" }];
      this.appAccList = [];
      this.approverList = [];
      this.nowTab = 1;
      this.signTab = "1";
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      this.pdfShows = false;
    },
    // 添加附件
    addAcc(row) {
      if (this.appDialogType === 3) {
        this.appAccList = [
          ...this.appAccList,
          {
            fileName: "",
            remark: "",
            fileUrl: ""
          }
        ];
      } else {
        this.accessoryList = [
          ...this.accessoryList,
          {
            fileName: "",
            remark: "",
            fileUrl: ""
          }
        ];
      }
    },
    // 删除附件
    delAcc(row, index) {
      this.delList.push(row.fileUrl);
      if (this.appDialogType === 3) {
        if (this.appAccList.length === 1) {
          this.appAccList = [];
        } else {
          this.appAccList.splice(index, 1);
        }
      } else {
        if (this.accessoryList.length === 1) {
          this.accessoryList = [{ fileName: "", remark: "", fileUrl: "" }];
        } else {
          this.accessoryList.splice(index, 1);
        }
      }
    },
    // 下载附件
    downloadAcc(row) {
      const url = row.fileUrl;
      const name = row.fileName;
      const str = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1);
      this.fileLinkToStreamDownload(url, name, str);
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
      this.loading2 = true;
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
            this.loading2 = false;
          }
        })
        .catch(err => {
          this.loading2 = false;
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
            if (_this.appDialogType === 3) {
              _this.appAccList.push({ fileName: filename, remark: "", fileUrl: path });
            } else {
              _this.nowUploadObj.fileUrl = path;
              _this.nowUploadObj.fileName = filename;
            }
            const obj = _this.$refs.upload;
            // obj.outerHTML = obj.outerHTML;
            obj.value = "";
            _this.loading2 = false;
            _this.$message.success("上传成功");
          } else {
            _this.loading2 = false;
            _this.$message.error("上传失败");
          }
        }
      );
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
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
        i.id = this.appDialogForm.currentNodeId;
      }
      if (!val) {
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
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f3f3f3;
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
}

.search {
  margin-top: 6px;
}

.tables {
  height: 500px;
}

.tables2 {
  height: 400px;
}

.red {
  color: red;
}

.green {
  color: #72b74b;
}

.tac {
  text-align: center;
}

.el-row-data {
  display: flex;
  flex-wrap: wrap;
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

.appDialog {
  display: flex;
  height: 670px;

  .appDialog-left {
    width: 300px;
    height: 100%;
    overflow: auto;
    // border: 1px solid #000;
  }

  .appDialog-right {
    flex: 1;
    height: 100%;
  }
}

.dialog-forms {
  display: flex;
  align-items: center;

  .dialog-form-item {
    position: relative;
    display: flex;
    margin-bottom: 10px;

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

.appDialog-right-header {
  padding: 10px;
  background-color: #fff;
}

.h-280 {
  height: 300px;
}

.h-350 {
  height: 360px;
}

.h-450 {
  height: 490px;
}

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
    .el-textarea {
      width: 100%;
      /deep/ .el-textarea__inner {
        height: 85px;
        border: none;
      }
    }
    // border-right: 1px #ccc solid;
    // padding-right: 5px;
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

.addAcc {
  cursor: pointer;
  color: green;
  font-size: 20px;
}

.fileName {
  max-width: 210px;
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

.tab-box {
  position: relative;
  // height: 450px;
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

.print-export {
  position: absolute;
  top: 70px;
  right: 30px;
}

.pst {
  top: 130px;
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

    .node {
      border: 1px solid;
      width: 120px;
      height: 60px;
      line-height: 60px;
      display: inline-block;
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
        height: 110px;
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

.wh-100per {
  width: 100%;
}

.wh-ok {
  width: calc(100% - 300px);
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

      .bpmns {
        width: 300px;
      }

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
.background-red {
  /deep/ .el-input__inner {
    padding: 0;
    background-color: #f4b4bc !important;
  }
}
</style>
