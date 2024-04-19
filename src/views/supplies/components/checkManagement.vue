<template>
  <div>
    <el-dialog title="盘点管理" width="80%" :visible="checkManagementDialog" @close="closeCheckManagementDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
      <div class="header-seach">
        <el-form :inline="true" class="myform" label-width="72px">
          <el-form-item label="标段项目" v-if="user.orgType === 7">
            <el-select v-model="inpData.fkBidProjectId" size="mini" class="wh-140" @change="proChange($event, 1)">
              <el-option value="" label="全部"></el-option>
              <el-option value="0" label="无"></el-option>
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="盘点仓库">
            <el-select v-model="inpData.fkWarehouseId" size="mini" class="wh-140">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in warehouseList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="盘点状态">
            <el-select v-model="inpData.inventoryCode" size="mini" class="wh-100">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in typeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="单据日期">
            <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="inpData.beginTime"></el-date-picker>
            <span>至</span>
            <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker>
          </el-form-item>
          <el-form-item label="单据编号">
            <el-input size="mini" v-model="inpData.orderCode" class="wh-140" maxlength="50"></el-input>
          </el-form-item>
          <el-button size="mini" type="primary" class="ml-20 search el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
        </el-form>
        <el-button size="mini" type="primary" class="el-button-primary" @click="openAddDialog(2)" v-if="user.orgType !== 4&user.orgType !== 10">新增盘点单</el-button>
      </div>
      <div class="tables table-data">
        <el-table style="width: 100%" height="100%" :data="tableData" ref="tables" stripe :header-cell-style="{ background: '#f1f6ff'}">
          <el-table-column label="序号" align="center" width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单据编号" align="center" prop="orderCode"> </el-table-column>
          <el-table-column label="盘点仓库" align="center" prop="warehouseName"> </el-table-column>
          <el-table-column label="填表人" align="center" prop="createUserName"> </el-table-column>
          <el-table-column label="单据日期" align="center" prop="serviceTime"> </el-table-column>
          <el-table-column label="状态" align="center" prop="inventoryCodeStr"> 
            <template slot-scope="{row}">
          <div style="display:flex;justify-content: center;align-items:center">
            <div>{{row.inventoryCodeStr}}</div>
            <img src="../../../assets/loader.gif" alt="" class="loaders" v-if="row.inventoryCode==10">
          </div>
        </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="remark"> </el-table-column>
          <el-table-column label="操作" align="center" width="350">
            <template slot-scope="{ row }">
              <el-button size="mini" plain type="primary" @click="openAddDialog(1, row)" v-show="!['5','6'].includes(row.inventoryCode)">查看</el-button>
              <el-button size="mini" plain type="primary" @click="openAppDialog(4, row)" v-show="['5','6'].includes(row.inventoryCode)">查看</el-button>
              <el-button size="mini" plain type="success" @click="openAddDialog(3, row)" v-if="row.inventoryCode === '0' &&row.editStatus">编辑</el-button>
              <el-button size="mini" plain type="primary" @click="openAppDialog(2, row)" v-if="row.inventoryCode === '0' && row.editStatus">提交审批</el-button>
              <el-button size="mini" plain type="primary" @click="openAppDialog(2, row)" v-if="['3','7'].includes(row.inventoryCode) && row.editStatus">重新提交审批</el-button>
              <el-button size="mini" plain type="primary" @click="openAppDialog(3, row)" v-if="row.changeStatus">处理</el-button>
              <el-button size="mini" plain type="danger" @click="recall(row)" v-if="row.revokeStatus ">撤回</el-button>
              <el-button size="mini" plain type="danger" v-if="row.sealWithdrawStatus ==1" @click="revocation(row)">撤回</el-button> 
              <el-button size="mini" plain type="danger" @click="handelDel(row)" v-if="row.deleteStatus">删除</el-button>
              <el-button size="mini" plain type="primary" @click="chapterClick(row)" v-if="row.sealStatus">{{ row.sealStatus ==2?'重新发起':'发起用章'}}</el-button>
              <el-button size="mini" plain type="primary" @click="sealApproveStatus(row)" v-if="row.sealApproveStatus">{{row.sealPersonStatus?'盖章':'审批'}}</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
      </div>
    </el-dialog>
    <!-- 新增/编辑盘点库存弹框 -->
    <el-dialog :title="addDialogTitle" top="5vw" width="60%" :visible="addDialog" @close="closeAddDialog" center v-dialogDrag :close-on-click-modal="false" v-loading="loading2" :close-on-press-escape="false">
      <div class="dialog-form">
      <el-form label-width="80px">
        <el-row :span="24" class="el-row-data">
          <el-col :span="8">
            <el-form-item label="单据编号">
              <el-input v-model="addForm.orderCode"  size="mini" :disabled="!!allowModify||addDialogType === 1" :maxlength="50"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="user.orgType === 7">
            <el-form-item label="标段项目">
              <el-select v-model="addForm.fkBidProjectId" size="mini" style="width:100%" @change="proChange($event, 2)">
                <el-option value="0" label="无"></el-option>
                <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仓库">
              <el-select v-model="addForm.fkWarehouseId" size="mini" style="width:100%" v-if="addDialogType === 2" @change="warehouseChange">
                <el-option v-for="item in warehouseList2" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
              <el-input size="mini" v-model="addForm.warehouseName" disabled v-else></el-input>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item label="填表人">
              <el-input v-model="addForm.leaderName" size="mini" :disabled="addDialogType === 1"></el-input>
            </el-form-item>
          </el-col> -->
          <el-col :span="8">
            <el-form-item label="业务时间">
              <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="addForm.serviceTime" :disabled="addDialogType === 1"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="addDialogType !== 2">
            <el-form-item label="填表人">
              <el-input v-model="addForm.createUserName" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="addDialogType !== 2">
            <el-form-item label="录入时间">
              <el-input v-model="addForm.createTime" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="addDialogType !== 2">
            <el-form-item label="单据状态">
              <el-input :value="addForm.inventoryCodeName" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="user.orgType === 7 ? 24 : 16">
            <el-form-item label="备注">
              <el-input v-model="addForm.remark" size="mini" :disabled="addDialogType === 1" maxlength="100"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <h3 class="tac" style="position: relative;">盘点物料
        <div class="print-export" v-if="addDialogType==1">
          <el-button type="primary" class="el-button-primary" size="mini" v-has="'supplies:inventory:orderInventoryOut'"
            @click="dataExport">导出</el-button>
          <el-button type="primary" class="el-button-primary" size="mini" v-has="'supplies:inventory:orderInventoryPut'"
            @click="dataPrinting">打印</el-button>
        </div>
      </h3>
      <div class="tables2 table-data">
        <el-table style="width: 100%" border height="100%" :data="materialList" :key="materKey" :tooltip-effect="'light'">
          <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
          <el-table-column label="物料名称" align="center" width="200">
            <template slot-scope="{ row }">
              <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)" v-if="addDialogType > 1">
                <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
              </el-input>
              <span v-if="addDialogType === 1">{{ row.materialName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="物料分类" align="center" prop="materialTypeName" show-overflow-tooltip> </el-table-column>
          <el-table-column label="供应商" align="center" prop="customerName"> 
             <template slot-scope="{ row }">
              {{ row.fkCustomerId === "0" ? "无" : row.customerName }}
            </template>
          </el-table-column>
          <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
          <el-table-column label="库存数量" align="center" prop="beforeNum"> </el-table-column>
          <el-table-column label="盘点数量" align="center" prop="inventoryNum">
            <template slot-scope="{ row }">
              <el-input v-if="addDialogType > 1" v-model="row.inventoryNum" size="mini" @input="row.inventoryNum = $limitInputNumber(row.inventoryNum, 99999999.999999, 0,6)" @blur="row.inventoryNum = row.inventoryNum - 0"></el-input>
              <span v-if="addDialogType === 1">{{ row.inventoryNum }}</span>
            </template>
          </el-table-column>
          <el-table-column label="盘盈量/盘亏量" align="center">
            <template slot-scope="{ row }">
              <span :class="{ green: row.inventoryNum - row.beforeNum > 0, red: row.inventoryNum - row.beforeNum < 0 }"> {{ (row.inventoryNum===0||row.inventoryNum)?(row.inventoryNum - row.beforeNum).toFixed(6) - 0:'' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" v-if="addDialogType !== 1">
            <template slot-scope="{ row, $index }">
              <span class="addAcc el-icon-plus" v-if="materialList.length == $index + 1" @click="addMater" title="添加"> </span>
              <span class="delAcc el-icon-close" @click="delMater(row, $index)" title="删除"> </span>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      </div>
      <div slot="footer" v-if="addDialogType !== 1">
        <el-button type="primary" class="el-button-primary" @click="addDialogOk">保存</el-button>
        <el-button type="primary" plain @click="closeAddDialog">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择物料弹框 -->
    <selectMaterDialog :materDialog.sync="materDialog" @getSelect="getSelect" :disabledType="materialList.filter(item => item.fkMaterialId).length ? materialList.filter(item => item.fkMaterialId)[0].typeCode : ''" :showType="1" :fkWarehouseId="addForm.fkWarehouseId" :selectMater="materialList"></selectMaterDialog>
    <!-- 审批弹框 -->
    <approveManageementDialog @init="searchOrderInventoryPage" ref="approveManageementDialog" :appDialog.sync="appDialog" :appDialogType="appDialogType" :appDialogTitle="appDialogTitle" @getList="searchOrderInventoryPage" @closeLoading="closeLoading"></approveManageementDialog>
    <!-- 发起印章流程弹窗 -->
    <chapterProcess @init="searchOrderInventoryPage"  :chapterDialog.sync="chapterDialog" :bizType="2" :bizId="bizId"></chapterProcess>
    <chapterProcessApproval @init="searchOrderInventoryPage" :chaptersApprovalDialog.sync="chaptersApprovalDialog" :bizType="2" :bizId="bizId" :sealPersonStatus="sealPersonStatus"></chapterProcessApproval>
    <div v-if="false">
      <el-dialog center top="3vw" :title="appDialogTitle" :visible="appDialog" width="70%" @close="closeAppDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading2" :close-on-press-escape="false">
        <div class="appDialog">
          <div class="appDialog-left" v-html="bpmnImg" v-if="appDialogForm.inventoryCode >= 1"></div>
          <div class="appDialog-right">
            <el-radio-group v-model="dialogRadio" size="mini" v-if="appDialogForm.inventoryCode >= 1">
              <el-radio-button :label="1">单据编号</el-radio-button>
              <el-radio-button :label="2">审批记录</el-radio-button>
            </el-radio-group>
            <!-- 单据编号 -->
            <div v-if="dialogRadio === 1">
              <div class="appDialog-right-header">
                <el-row :span="24" class="el-row-data dialog-forms">
                  <el-col :span="8" class="dialog-form-item">
                    <div class="labels">单据编号</div>
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
                  <el-col :span="8" class="dialog-form-item">
                    <div class="labels">填表人</div>
                    <div class="content">
                      <el-input v-model="appDialogForm.leaderName" size="mini" disabled> </el-input>
                    </div>
                  </el-col>
                  <el-col :span="8" class="dialog-form-item">
                    <div class="labels">业务时间</div>
                    <div class="content">
                      <el-input v-model="appDialogForm.serviceTime" size="mini" disabled> </el-input>
                    </div>
                  </el-col>
                  <el-col :span="8" class="dialog-form-item">
                    <div class="labels">制单人</div>
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
                      <el-input v-model="appDialogForm.inventoryCodeStr" size="mini" disabled> </el-input>
                    </div>
                  </el-col>
                  <el-col :span="8" class="dialog-form-item" v-if="appDialogType !== 1 && !nextShow">
                    <div class="labels w-90">下一审批岗位</div>
                    <div class="content">
                      <el-input v-model="nextRoleName" size="mini" disabled> </el-input>
                    </div>
                  </el-col>
                  <el-col :span="8" class="dialog-form-item" v-if="appDialogType !== 1 && !nextShow">
                    <div class="labels">审批人</div>
                    <div class="content">
                      <el-select v-model="appDialogForm.fkApproverId" size="mini" style="width:100%">
                        <el-option v-for="item in peopleList" :key="item.pkId" :value="item.pkId" :label="item.userName"></el-option>
                      </el-select>
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
              <el-radio-group v-model="dialogRadio2" size="mini">
                <el-radio-button :label="1">盘点物料</el-radio-button>
                <el-radio-button :label="2">附件</el-radio-button>
              </el-radio-group>
              <div :class="{ 'h-300': appDialogType === 3, 'h-432': appDialogType !== 3 }">
                <el-table style="width: 100%" border height="100%" :data="materialList" v-if="dialogRadio2 === 1">
                  <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
                  <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
                  <el-table-column label="物料类型" align="center" prop="materialTypeName"> </el-table-column>
                  <el-table-column label="单位" align="center" prop="unitName"> </el-table-column>
                  <el-table-column label="库存数量" align="center" prop="beforeNum"> </el-table-column>
                  <el-table-column label="盘点数量" align="center" prop="inventoryNum"> </el-table-column>
                  <el-table-column label="盘盈数" align="center">
                    <template slot-scope="{ row }">
                      <span v-if="row.inventoryNum - row.beforeNum > 0" class="green">{{ row.inventoryNum - row.beforeNum }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="盘亏数" align="center">
                    <template slot-scope="{ row }">
                      <span v-if="row.inventoryNum - row.beforeNum < 0" class="red">{{ 0 - (row.inventoryNum - row.beforeNum) }}</span>
                    </template>
                  </el-table-column>
                  <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                  </div>
                </el-table>
                <el-table :data="accessoryList" height="100%" style="width: 100%" border v-if="dialogRadio2 === 2 && appDialogType === 2" :tooltip-effect="'light'">
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
                <el-table :data="accessoryList" height="100%" style="width: 100%" border v-if="dialogRadio2 === 2 && appDialogType !== 2" :tooltip-effect="'light'">
                  <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                  <el-table-column label="上传人" align="center" prop="createUserName"> </el-table-column>
                  <el-table-column label="上传时间" align="center" prop="createTime"> </el-table-column>
                  <el-table-column label="附件内容描述" align="center" prop="remark" show-overflow-tooltip> </el-table-column>
                  <el-table-column label="操作" align="center">
                    <template slot-scope="{ row }">
                      <el-button size="mini" type="primary" class="previewAcc el-button-primary" @click="preview(row)">
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
            </div>
            <!-- 审批记录 -->
            <div class="h-500" v-if="dialogRadio === 2">
              <el-table border style="width: 100%" height="100%" :data="approverList" :tooltip-effect="'light'">
                <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
                <el-table-column label="流程节点" align="center" prop="activityName"> </el-table-column>
                <el-table-column label="填表人" align="center" prop="createUserName"></el-table-column>
                <el-table-column label="审批意见" align="center" prop="comment" show-overflow-tooltip></el-table-column>
                <el-table-column label="审批时间" align="center" prop="endTime"> </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                  <img src="@/assets/empty.svg" class="zanwu" />
                  <span>暂无数据</span>
                </div>
              </el-table>
            </div>
            <!-- 审批专用底部 -->
            <div v-if="appDialogType === 3">
              <div class="approveDetail">
                <div class="approveDetail-left">
                  <div class="appResult ">
                    审批结果： <el-radio v-model="approvalForm.approveStatus" :label="1">审批通过</el-radio><br />
                    <el-radio v-model="approvalForm.approveStatus" :label="0">审批不通过</el-radio>
                  </div>
                  <div class="appReamrk">
                    <div class="remark">
                      被批意见
                    </div>
                    <el-input type="textarea" resize="none" v-model="approvalForm.approveComment"> </el-input>
                  </div>
                </div>
                <div class="approveDetail-right">
                  <div class="accessory-item" v-for="(item, index) in appAccList" :key="item.id">
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
                  </div>
                </div>
              </div>
              <div class="approveBtn">
                <el-button size="mini" type="primary" class="el-button-primary" @click="appDialogOk(2)">确认</el-button>
                <el-button size="mini" @click="closeAppDialog">取消</el-button>
              </div>
            </div>
          </div>
        </div>
        <div slot="footer" v-if="appDialogType === 2">
          <el-button type="primary" class="el-button-primary" @click="appDialogOk(1)">提交审批</el-button>
          <el-button @click="closeAppDialog">取 消</el-button>
        </div>
      </el-dialog>
      <!-- 查看图片，work，excel文档使用的弹框 -->
      <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
        <div class="previewHeight" ref="previewHeight">
          <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.fileUrl" v-if="previewType == 1"></iframe>
          <img class="img" :src="nowPreviewObj.fileUrl" alt="" v-if="previewType == 3" />
        </div>
      </el-dialog>
      <!-- 查看pdf弹框-->
      <pdfPiev ref="pdfPiev" :urlr="url" />
      <input ref="upload" type="file" style="display:none" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.docx,image/jpg,image/jpeg,image/png,application/pdf" @change="upLoad" />
    </div>
  </div>
</template>

<script>
import selectMaterDialog from "./selectMaterDialog.vue";
// import pdfPiev from "@/components/pdf-preview/pdf-preview.vue";
import approveManageementDialog from "./approveManageementDialog.vue";
import chapterProcess from "@/components/inChapter/chapterProcess.vue"
import moment from "moment";
import utils from "@/utils/util";
import chapterProcessApproval from "../../../components/inChapter/chapterProcessApproval.vue";
// import COS from "cos-js-sdk-v5";
export default {
  components: { selectMaterDialog, approveManageementDialog ,chapterProcess,chapterProcessApproval},
  props: {
    checkManagementDialog: {
      type: Boolean
    },
    fkOrgId: ""
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      loading: false,
      loading2: false,
      tableData: [],
      proOptions: [],
      statusList: { 0:"草稿",1:"审批中", 2:"审批通过", 3:"审批不通过",4:"待签章",5:"签章中",6:"签章已完成",7:"已撤回",10:"数据处理中" },
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      inpData: {
        beginTime: "",
        endTime: "",
        fkBidProjectId: "",
        fkWarehouseId: "",
        inventoryCode: "",
        orderCode: ""
      },
      searchData: {
        beginTime: "",
        endTime: "",
        fkBidProjectId: "",
        fkWarehouseId: "",
        inventoryCode: "",
        orderCode: ""
      },
      addDialog: false,
      addDialogTitle: "",
      addDialogType: 1,
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
          materialTypeName: "",
          typeCode: ""
        }
      ],
      materDialog: false,
      appDialogTitle: "",
      appDialog: false,
      appDialogType: 1,
      appDialogForm: {},
      approvalForm: {
        approveComment: "",
        approveId: "",
        approveStatus: 1
      },
      accessoryList: [{ fileName: "", remark: "", fileUrl: "" }],
      dialogRadio: 1,
      dialogRadio2: 1,
      pickerOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            }
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            }
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            }
          }
        ]
      },
      appAccList: [{ fileName: "", remark: "", fileUrl: "" }],
      nowUploadObj: {},
      // 附件文件类型
      fileType: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpg", "image/jpeg", "image/png", "application/pdf"],
      url: "",
      previewDialog: false,
      previewType: 1,
      nowPreviewObj: {},
      approverList: [],
      warehouseList: [],
      warehouseList2: [],
      typeList: [],
      nextRoleName: "",
      peopleList: [],
      bpmnImg: "",
      nowMaterObj: {},
      materKey: Math.random(),
      nextShow: false,
      allowModify: 0,
      limitNum: 1000,
      typeCode: "",
      chapterDialog:false,
      bizId:"",
      chaptersApprovalDialog: false,
      timess:null,
      sealPersonStatus:0
    };
  },
  watch: {
    checkManagementDialog(val) {
      if (val) {
        if (this.user.orgType === 7) {
          this.getAllProject();
        }
        this.findWarehouseByProjectId("", this.user.orgType === 7 ? 1 : 3,true);
        // this.findSelfWarehouse();
        // this.$store.dispatch("getDictionariesData", 25).then(res => {
        //   this.typeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        // });
        this.searchOrderInventoryStates()
        this.searchOrderInventoryPage();
      }
    }
  },
  methods: {
    pageTime(boo){
      clearInterval(this.timess)
      if(boo){
        this.timess=setInterval(()=>{
          if(this.tableData.filter(item=>item.inventoryCode==10).length){
            this.searchOrderInventoryPage();
          }else{
            clearInterval(this.timess)
          }
        },3000)
      }
    },
    sealApproveStatus(row) {
      this.sealPersonStatus=row.sealPersonStatus
      this.chaptersApprovalDialog = true;
      this.bizId = row.sealPkId;
    },
    searchOrderInventoryStates(){
      this.$api.searchOrderInventoryStates().then(res=>{
        if(res.code===200){
          this.typeList = res.data.map(item => ({ ...item, value: item.name, label: item.key }));
        }else{
          this.$message.warning(res.msg);
        }
      })
    },
    chapterClick(row){
      this.bizId = row.pkId
      this.chapterDialog = true
    },
    searchOrderInventoryPage() {
      let data = { ...this.page, ...this.searchData };
      if (this.user.orgType === 4||this.user.orgType === 10) {
        data.fkBidProjectId = this.fkOrgId;
      }
      this.loading = true;
      this.$api
        .searchOrderInventoryPage(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.pageTime(true)
            this.total = res.data.total - 0;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 获取标段项目
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据标段项目id获取仓库
    findWarehouseByProjectId(bidProjectId, type,isTrue) {
      let bidId = this.user.orgType === 4||this.user.orgType === 10 ? this.fkOrgId : bidProjectId;
      this.$api.findWarehouseByProjectId({ bidProjectId: bidId }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
          if (type === 1) {
            this.warehouseList = arr;
          } else if (type === 2) {
            this.warehouseList2 = arr;
            if(isTrue){
              this.addForm.fkWarehouseId=arr.length?arr[0].value:''
              this.warehouseChange()
            }
          } else if (type === 3) {
            this.warehouseList = [...arr];
            this.warehouseList2 = [...arr];
            if(isTrue){
              this.addForm.fkWarehouseId=arr.length?arr[0].value:''
              this.warehouseChange()
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    proChange(e, type) {
      if (type === 1) {
        this.inpData.fkWarehouseId = "";
      } else {
        this.addForm.fkWarehouseId = "";
      }
      if (e) {
        if (type === 1) {
          this.findWarehouseByProjectId(e, type);
        } else if (type === 2) {
          this.findWarehouseByProjectId(e, type,true);
        }
      } else {
        if (type === 1) {
          this.findWarehouseByProjectId("", type);
        } else if (type === 2) {
          this.findWarehouseByProjectId("0", type,true);
        }
      }
    },
    // 获取仓库
    findSelfWarehouse() {
      this.$api.findSelfWarehouse().then(res => {
        if (res.code === 200) {
          this.warehouseList = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取字典
    getItemClass(dictType) {
      if (this.$store.state.dictionariesData.length) {
        return this.$store.state.dictionariesData[dictType - 1].sysDictList.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
      }
      return [];
      this.$api.getItemClass({ dictType }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
          if (dictType === 25) {
            this.typeList = arr;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取单号
    getBusinessCode() {
      this.$api.getBusinessCode({ businessType: 9 }).then(res => {
        console.log("业务单号", res);
        if (res.code === 200) {
          this.addForm.orderCode = res.data.typeCode;
          this.allowModify = res.data.allowModify;
          this.limitNum = res.data.limitNum;
          this.typeCode = res.data.typeCode;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 审批时员工列表
    // findUserList() {
    //   this.$api.findUserList().then(res => {
    //     if (res.code === 200) {
    //       this.nextShow = res.data.lastNode;
    //       this.nextRoleName = res.data.roleName;
    //       this.peopleList = res.data.sysUserList;
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 根据id查询盘点单
    findOrderInventoryById(pkId, dialogName) {
      this.$api.findOrderInventoryById({ pkId,type:this.addDialogType==3?3:1 }).then(res => {
        if (res.code === 200) {
          this.addForm = res.data;
          this.appDialogForm = res.data;
          this.allowModify = res.data.allowModify;
          // this.limitNum = res.data.limitNum;
          this.materialList = res.data.engMatOrderInventoryDetailsVos ? res.data.engMatOrderInventoryDetailsVos : [];
          this.approverList = res.data.taskFinishVoList ? res.data.taskFinishVoList : []; // 审批记录
          if (this.addDialogType === 1) {
            this.accessoryList = res.data.fileList;
          } else {
            // fileList 附件列表  deleteFlag是否可删除
            if (res.data.inventoryCode === "1") {
              if (res.data.fileList) {
                this.accessoryList = res.data.fileList.filter(item => !item.deleteFlag);
                this.appAccList = res.data.fileList.filter(item => item.deleteFlag).length ? res.data.fileList.filter(item => item.deleteFlag) : [{ fileName: "", remark: "", fileUrl: "" }];
              }
            } else {
              if (res.data.inventoryCode === "0") {
                this.accessoryList = res.data.fileList ? res.data.fileList : [{ fileName: "", remark: "", fileUrl: "" }];
              } else {
                this.accessoryList = res.data.fileList ? res.data.fileList : [];
              }
            }
          }

          this.bpmnImg = res.data.hisProcessDiagram; // hisProcessDiagram 流程图
          this[dialogName] = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeCheckManagementDialog() {
      this.$emit("update:checkManagementDialog", false);
      this.pageTime()
      this.cleanSearBar();
    },
    openAddDialog(type, row) {
      // return console.log(type)
      this.addDialogType = type;
      if (type === 1) {
        this.addDialogTitle = "查看盘点单";
        if (row.inventoryCode === "0") {
          this.findOrderInventoryById(row.pkId, "addDialog");
        } else {
          this.appDialogType = 1;
          this.appDialogTitle = "查看盘点单";
          this.$refs.approveManageementDialog.findOrderInventoryById(row.pkId,1);
          // this.appDialog = true;
          // this.findOrderInventoryById(row.pkId, "appDialog");
        }
      } else if (type === 2) {
        this.addDialogTitle = "新增盘点单";
        this.getBusinessCode();
        if (this.user.orgType === 7) {
          this.addForm.fkBidProjectId = "0";
          this.findWarehouseByProjectId("0", 2,true);
        }else{
           this.addForm.fkWarehouseId=this.warehouseList2.length?this.warehouseList2[0].value:''
           this.warehouseChange()
        }
        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        this.addForm.serviceTime = time;
        this.addForm.receiverTime = time;
        this.addForm.leaderName = this.user.userName;
        this.addDialog = true;
      } else if (type === 3) {
        this.addDialogTitle = "编辑盘点单";
        this.findOrderInventoryById(row.pkId, "addDialog");
      }
    },
    warehouseChange(e) {
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
    },
    addMater() {
      this.materialList.push({
        beforeNum: "",
        costPrice: "",
        fkMaterialId: "",
        inventoryNum: "",
        materialPrice: "",
        materialName: "",
        materialTypeName: ""
      });
    },
    delMater(row, index) {
      if (this.materialList.length === 1) {
        this.materialList = [
          {
            beforeNum: "",
            costPrice: "",
            fkMaterialId: "",
            inventoryNum: "",
            materialPrice: "",
            materialName: "",
            materialTypeName: "",
            typeCode: ""
          }
        ];
      } else {
        this.materialList.splice(index, 1);
      }
    },
    selectMater(row) {
      if (!this.addForm.fkWarehouseId) {
        return this.$message.warning("请先选择仓库");
      }
      this.nowMaterObj = row;
      this.materDialog = true;
    },
    getSelect(row) {
      if (this.materialList.filter(item => item.fkMaterialId === row.pkId && row.fkCustomerId === item.fkCustomerId).length) {
        return this.$message.warning("该物料已经存在盘点物料表中");
      }
      // this.nowMaterObj.beforeNum = row.supplyNum;
      // this.nowMaterObj.fkMaterialId = row.pkId;
      // this.nowMaterObj.materialName = row.materialName;
      // this.nowMaterObj.materialTypeName = row.fkTypeName;
      // this.nowMaterObj.unitName = row.fkUnitName;
      // this.nowMaterObj.fkCustomerId = row.fkCustomerId;
      // this.nowMaterObj.typeCode = row.typeCode;
      this.$set(this.nowMaterObj, "fkMaterialId", row.pkId);
      this.$set(this.nowMaterObj, "materialName", row.materialName);
      this.$set(this.nowMaterObj, "typeCode", row.typeCode);
      this.$set(this.nowMaterObj, "materialTypeName", row.fkTypeName);
      this.$set(this.nowMaterObj, "unitName", row.fkUnitName);
      this.$set(this.nowMaterObj, "beforeNum", row.supplyNum);
      this.$set(this.nowMaterObj, "fkCustomerId", row.fkCustomerId);
      this.$set(this.nowMaterObj, "customerName", row.customerName);
      // this.materKey = Math.random();
    },
    addDialogOk() {
      let engMatOrderInventoryDetailsAdds = this.materialList.filter(item => item.fkMaterialId);
      let arr=engMatOrderInventoryDetailsAdds.filter(item=>!item.inventoryNum&&item.inventoryNum!==0)
      if(arr.length){
        return this.$message.warning("请填写盘点数量");
      }
      let data = { ...this.addForm, approveStatus: 0, engMatOrderInventoryDetailsAdds };
      console.log(data);
      if (!data.orderCode) {
        return this.$message.warning("请填写订单编号");
      }
      if (!data.fkWarehouseId) {
        return this.$message.warning("请选择仓库");
      }
      // if (!data.leaderName) {
      //   return this.$message.warning("请填写负责人名称");
      // }
      if (!data.serviceTime) {
        return this.$message.warning("请选择业务时间");
      }
      if (!engMatOrderInventoryDetailsAdds.length) {
        return this.$message.warning("请添加盘点物料信息");
      }
      if (data.orderCode == this.typeCode) {
        data.isUpdate = 0;
      } else {
        data.isUpdate = 1;
      }
      this.loading2 = true;
      if (this.addDialogType === 2) {
        this.$api
          .addOrderInventory(data)
          .then(res => {
            this.loading2 = false;
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.searchOrderInventoryPage();
              this.closeAddDialog();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading2 = false;
          });
      } else if (this.addDialogType === 3) {
        this.$api
          .updateOrderInventory(data)
          .then(res => {
            this.loading2 = false;
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.searchOrderInventoryPage();
              this.closeAddDialog();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading2 = false;
          });
      }
    },
    closeAddDialog() {
      this.addDialog = false;
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
      this.addForm = {
        orderCode: "",
        approveStatus: "",
        fkWarehouseId: "",
        leaderName: "",
        serviceTime: ""
      };
      this.allowModify= 0
      this.limitNum= 1000
    },
    openAppDialog(type, row) {
      this.appDialogType = type;
      console.log(this.appDialogType);
      // this.findUserList();
      // this.sendPkId = row.pkId;
      this.loading=true
      if (type === 2) {
        this.appDialogTitle = "提交审批";
        // this.findOrderInventoryById(row.pkId, "appDialog");
      } else if (type === 3) {
        this.appDialogTitle = "审批盘点单";
        // this.findOrderInventoryById(row.pkId, "appDialog");
      }else if(type===4){
        this.appDialogTitle = "流程信息";
      }
      this.$refs.approveManageementDialog.findOrderInventoryById(row.pkId,type==4?1:2);
    },
    closeLoading(){
      this.loading=false
    },
    appDialogOk(type) {
      if (type === 1) {
        let engMatOrderInventoryDetailsAdds = this.materialList.filter(item => item.fkMaterialId);
        let fileList = this.accessoryList.filter(item => item.fileUrl);
        let data = { ...this.addForm, approveStatus: 1, engMatOrderInventoryDetailsAdds, fileList };
        console.log(data);
        this.loading2 = true;
        this.$api
          .updateOrderInventory(data)
          .then(res => {
            this.loading2 = false;
            if (res.code === 200) {
              this.$message.success("提交审批成功");
              this.searchOrderInventoryPage();
              this.closeAppDialog();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading2 = false;
          });
      } else {
        let fileList = [...this.accessoryList.filter(item => item.fileUrl), ...this.appAccList.filter(item => item.fileUrl)];
        let data = {
          ...this.approvalForm,
          approveId: this.appDialogForm.fkApproverId,
          fileList,
          pkId: this.appDialogForm.pkId
        };
        if (!data.approveComment) {
          data.approveComment = data.approveStatus ? "审批通过" : "审批不通过";
        }
        this.loading2 = true;
        this.$api
          .approvalOrderInventory(data)
          .then(res => {
            this.loading2 = false;
            if (res.code === 200) {
              this.$message.success("审批成功");
              this.searchOrderInventoryPage();
              this.closeAppDialog();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading2 = false;
          });
      }
    },
    closeAppDialog() {
      this.appDialog = false;
      this.approvalForm = {
        approveComment: "",
        approveId: "",
        approveStatus: 1
      };
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
      this.appDialogForm = {};
      this.accessoryList = [{ fileName: "", remark: "", fileUrl: "" }];
      this.appAccList = [{ fileName: "", remark: "", fileUrl: "" }];
      this.approverList = [];
    },
    recall(row) {
      this.appDialogType=6
      this.$refs.approveManageementDialog.findOrderInventoryById(row.pkId,2);
    },
    revocation(row){
      this.appDialogType=7
      this.$refs.approveManageementDialog.findOrderInventoryById(row.pkId,2);
    },
    handelDel(row) {
      this.$confirm("确定删除该盘点单?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delOrderInventory({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.searchOrderInventoryPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    cleanSearBar() {
      this.inpData = {
        beginTime: "",
        endTime: "",
        fkBidProjectId: "",
        fkWarehouseId: "",
        inventoryCode: "",
        orderCode: ""
      };
      this.searchData = {
        beginTime: "",
        endTime: "",
        fkBidProjectId: "",
        fkWarehouseId: "",
        inventoryCode: "",
        orderCode: ""
      };
    },
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchOrderInventoryPage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.searchOrderInventoryPage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.searchOrderInventoryPage();
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
      if (this.appDialogType === 3) {
        if (this.appAccList.length === 1) {
          this.appAccList = [{ fileName: "", remark: "", fileUrl: "" }];
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
      if(fileObj.size<=0){
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
            _this.nowUploadObj.fileUrl = path;
            _this.nowUploadObj.fileName = filename;
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
    // 导出
    dataExport() {
        let data = {
          engTableExportList: [],
          pkId: this.addForm.pkId
        };
        this.orderInventoryExport(data);
    },
    // 导出接口
    orderInventoryExport(data) {
      this.$api.orderInventoryExport(data).then(res => {
        if (res.code == 200) {
          utils.downFile(res.data.url, res.data.fileName);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打印接口
    dataPrinting() {
        let data = {
          engTableExportList: [],
          pkId: this.addForm.pkId
        };
        this.orderInventoryPrintPDF(data);
    },
    orderInventoryPrintPDF(data) {
      this.$api.orderInventoryPrintPDF(data).then(res => {
        if (res.code == 200) {
          printJS({ printable: res.data.url, type: "pdf" });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
  }
};
</script>

<style lang="scss" scoped>
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // background-color: #f3f3f3;
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
.print-export{
  position: absolute;
  top: 0;
  right: 2px;
}
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.selectFac {
  cursor: pointer;
  vertical-align: middle;
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
    border: 1px solid #000;
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
  background-color: #f3f3f3;
}
.h-300 {
  height: 300px;
}
.h-432 {
  height: 432px;
}
.h-500 {
  height: 500px;
}
.approveDetail {
  display: flex;
  justify-content: space-evenly;
  margin-top: 7px;
  .approveDetail-left {
    flex: 1;
    border-right: 1px #ccc solid;
    padding-right: 5px;
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
    height: 75px;
    margin-left: 5px;
    overflow: auto;
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
  margin-top: 20px;
  text-align: center;
}
.addAcc {
  cursor: pointer;
  color: green;
  font-size: 20px;
}
.fileName {
  max-width: 210px;
  overflow: hidden; /*超出部分隐藏*/
  white-space: nowrap; /*禁⽌换⾏*/
  text-overflow: ellipsis; /*省略号*/
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
.loaders{
  width: 25px;
  height: 25px;
}
</style>
