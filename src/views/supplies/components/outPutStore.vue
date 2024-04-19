<template>
  <div>
    <el-dialog title="出入库管理" top="3vw" width="85%" :visible="outPutStoreDialog" @close="closeOutPutStoreDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
        <el-radio-group v-model="radio" size="small" @change="radioChange">
          <el-radio-button :label="1">出库</el-radio-button>
          <el-radio-button :label="2">入库</el-radio-button>
        </el-radio-group>
        <div class="header-seach">
          <el-form :inline="true" class="myform" label-width="72px">
            <el-form-item label="标段项目" v-if="([6].includes(user.orgType) && radio == 1) || user.orgType === 7">
              <el-select v-model="inpData.fkBidProjectId" size="mini" class="wh-140" @change="proChange($event, 1)">
                <el-option value="" label="全部"></el-option>
                <!-- <el-option value="0" label="无" v-if="user.orgType === 7"></el-option> -->
                <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所选仓库" v-if="radio === 2">
              <el-select v-model="inpData.fkWarehouseId" size="mini" class="wh-140">
                <el-option value="" label="全部"></el-option>
                <el-option v-for="item in warehouseList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="状态" label-width="40px">
              <el-select v-model="inpData.inventoryCode" size="mini" class="wh-100">
                <el-option value="" label="全部"></el-option>
                <el-option v-for="item in typeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="检验状态" v-if="radio === 2 && [5, 7].includes(user.orgType)">
            <el-select v-model="inpData.detectionStatus" size="mini" class="wh-100">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in checkTypeList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item> -->
            <el-form-item :label="radio === 1 ? '确认时间' : '单据时间'">
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.beginTime"></el-date-picker>
              <span>至</span>
              <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker>
            </el-form-item>
            <el-form-item :label="(radio === 1 ? '收货' : '入库') + '单号'">
              <el-input size="mini" v-model="inpData.orderCode" class="wh-140" maxlength="50"></el-input>
            </el-form-item>
            <el-button size="mini" type="primary" class="ml-20 search el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
          </el-form>
          <div class="right">
            <el-button class="el-button-primary" size="mini" type="primary" v-if="user.orgType !== 4 && user.orgType !== 10 && radio === 2" @click="openPutStoreDialog(7)">扫码入库</el-button>
            <el-button class="el-button-primary" size="mini" type="primary" v-if="user.orgType !== 4 && user.orgType !== 10 && radio === 2" @click="openPutStoreDialog(2)">新增入库单</el-button>
            <el-button class="el-button-primary" size="mini" type="primary" v-if="user.orgType !== 4 && user.orgType !== 10 && radio === 1" @click="openOutStoreDialog(2)">新增出库单</el-button>
          </div>
        </div>
        <!-- 表单 -->
        <div class="tables table-data">
          <!-- 出库单 -->
          <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" ref="tables1" :data="tableData" :key="randomKey" v-if="radio === 1">
            <el-table-column label="序号" align="center" width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单据编号" align="center" prop="orderCode"> </el-table-column>
            <el-table-column label="单据类型" align="center" prop="orderType"> </el-table-column>
            <!-- <el-table-column label="标段项目" align="center" prop="projectName" v-if="user.orgType !== 5"> </el-table-column> -->
            <el-table-column label="关联单据" align="center">
              <template slot-scope="{ row }">
                <div style="text-align:center;" v-if="row.orderRelationList.length">
                  <span v-for="(item, index) in row.orderRelationList" :key="item.pkId" class="blue" @click="orderClick(item, 1)">{{ item.orderCode + (row.orderRelationList.length - 1 === index ? "" : ",") }}</span>
                </div>
                <span v-else>无</span>
              </template>
            </el-table-column>
            <el-table-column label="出库时间" align="center" prop="deliveryTime"> </el-table-column>
            <el-table-column label="填表人" align="center" prop="createUserName"> </el-table-column>
            <el-table-column label="单据时间" align="center" prop="createTime"> </el-table-column>
            <el-table-column label="出库对象" align="center" prop="issueCode">
              <template slot-scope="{ row }">
                <span>{{ outIsscodeList[row.issueCode] }}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column label="单据类型" align="center" prop=""> </el-table-column> -->
            <el-table-column label="状态" align="center" prop="inventoryCodeName"> </el-table-column>
            <el-table-column label="操作" align="center" width="250">
              <template slot-scope="{ row }">
                <el-button plain type="primary" size="mini" @click="openOutStoreDialog(1, row)">查看</el-button>
                <el-button plain type="success" v-show="row.editButton" size="mini" @click="openOutStoreDialog(3, row)">编辑</el-button>
                <el-button plain type="primary" v-show="row.enterButton" size="mini" @click="openOutStoreDialog(4, row)">录入签收信息</el-button>
                <el-button plain type="danger" v-show="row.deleteButton" size="mini" @click="outStoreDialogDel(row)">删除</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <!-- 入库单 -->
          <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" ref="tables2" :data="tableData" :key="randomKey" v-if="radio === 2">
            <el-table-column label="序号" align="center" width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单据编号" align="center" prop="orderCode"> </el-table-column>
            <el-table-column label="单据类型" align="center" prop="orderType"> </el-table-column>
            <el-table-column label="入库仓库" align="center" prop="warehouseName"> </el-table-column>
            <el-table-column label="单据对象" align="center" prop="customerName"> </el-table-column>
            <el-table-column label="关联单据" align="center">
              <template slot-scope="{ row }">
                <span v-for="(item, index) in row.orderRelationList" :key="item.pkId" :class="{ blue: item.isQuery === 1 }" @click="orderClick(item, 2)">{{ item.orderCode + (row.orderRelationList.length - 1 === index ? "" : ",") }}</span>
              </template>
            </el-table-column>
            <el-table-column label="填表人" align="center" prop="createUserName"> </el-table-column>
            <el-table-column label="单据时间" align="center" prop="createTime"> </el-table-column>
            <!-- <el-table-column label="单据来源" align="center">
            <template slot-scope="{ row }">
              <span>{{ billCodeList[row.billCode] }}</span>
            </template>
          </el-table-column> -->
            <el-table-column label="单据类型" align="center" prop="orderType"> </el-table-column>
            <el-table-column label="状态" align="center" prop="inventoryCodeName"></el-table-column>
            <el-table-column label="操作" align="center" width="250">
              <template slot-scope="{ row }">
                <el-button plain type="primary" size="mini" @click="openPutStoreDialog(1, row)">查看</el-button>
                <el-button plain type="success" size="mini" v-show="row.editButton" @click="openPutStoreDialog(3, row)">编辑</el-button>
                <el-button plain type="primary" size="mini" v-show="row.handleButton" @click="openPutStoreDialog(4, row)">处理</el-button>
                <el-button plain type="primary" size="mini" v-show="row.warehousingButton" @click="openPutStoreDialog(5, row)">入库</el-button>
                <!-- <el-button type="primary" size="mini" v-show="row.checkButton" @click="detection(row, 1)">检测</el-button> -->
                <el-button plain type="primary" size="mini" v-has="'supplies:inventory:check'" v-show="row.checkInforButton" @click="detection(row, 2)">检测信息</el-button>
                <el-button plain type="danger" size="mini" v-show="row.retreatButton" @click="returnBtn(row)">退货</el-button>
                <el-button plain type="danger" size="mini" @click="putStoreDialogDel(row)" v-show="row.deleteButton">删除</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" v-if="pagesShow"></tablePaging>
      </div>
    </el-dialog>
    <!-- 出库单弹框-->
    <el-dialog :title="outStoreDialogTitle" top="3vw" center :visible="outStoreDialog" width="61%" @close="closeOutStoreDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form" v-if="user.orgType == 6 && outStoreForm.issueCode !== 'delivery_unit' && !outStoreForm.fkOutApplyId">
        <el-row :span="24" class="el-row-data dialog-forms" :key="randomKey4">
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库单号</div>
            <div class="content"><el-input v-model="outStoreForm.orderCode" @change="orderChange" size="mini" :disabled="!!allowModify || [1, 4].includes(outStoreDialogType)" :maxlength="50"></el-input></div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库对象</div>
            <div class="content">
              <el-select v-model="outStoreForm.issueCode" size="mini" style="width:100%" :disabled="[1, 4].includes(outStoreDialogType)" @change="issueCodeChange($event, 1)">
                <el-option v-for="item in outObjectList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">供货申请单</div>
            <div class="content">
              <!-- <el-select v-model="outStoreForm.fkOutApplyId" size="mini" style="width:100%" >
              <el-option value="" label="请选择"></el-option>
              <el-option v-for="item in outObjectList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select> -->
              <el-select v-model="fkOutApplyId" placeholder="无" value-key="pkId" size="mini" style="width:100%" v-if="[2, 3].includes(outStoreDialogType)" filterable remote :remote-method="remoteMethod9" @change="change9" @visible-change="restoreSelect9" reserve-keyword :loading="loading2">
                <el-option :value="{ pkId: '' }" label="请选择"></el-option>
                <el-option v-for="item in supAppList" :key="item.value" :value="item" :label="item.label"></el-option>
              </el-select>
              <el-input :value="fkOutApplyId.orderCode ? fkOutApplyId.orderCode : '无'" size="mini" disabled v-else></el-input>
            </div>
          </el-col>
        </el-row>
        <div class="outContent">
          <h2>请选择供货申请单</h2>
        </div>
      </div>
      <div class="dialog-form" v-else>
        <el-row :span="24" class="el-row-data dialog-forms">
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库单号</div>
            <div class="content"><el-input v-model="outStoreForm.orderCode" @change="orderChange" size="mini" :disabled="!!allowModify || [1, 4].includes(outStoreDialogType)" :maxlength="50"></el-input></div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库对象</div>
            <div class="content">
              <el-select v-model="outStoreForm.issueCode" size="mini" style="width:100%" :disabled="[1, 4].includes(outStoreDialogType)" @change="issueCodeChange($event, 1)">
                <el-option v-for="item in outObjectList" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="user.orgType == 6 && outStoreForm.issueCode !== 'delivery_unit'">
            <div class="labels">供货申请单</div>
            <div class="content">
              <!-- <el-select v-model="outStoreForm.fkOutApplyId" size="mini" style="width:100%" >
              <el-option value="" label="请选择"></el-option>
              <el-option v-for="item in outObjectList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select> -->
              <el-select v-model="fkOutApplyId" placeholder="无" value-key="pkId" size="mini" style="width:100%" :disabled="!outStoreForm.issueCode" v-if="[2, 3].includes(outStoreDialogType)" filterable remote :remote-method="remoteMethod9" @change="change9" @visible-change="restoreSelect9" reserve-keyword :loading="loading2">
                <el-option :value="{ pkId: '' }" label="请选择"></el-option>
                <el-option v-for="item in supAppList" :key="item.value" :value="item" :label="item.label"></el-option>
              </el-select>
              <el-input :value="fkOutApplyId.orderCode ? fkOutApplyId.orderCode : '无'" size="mini" disabled v-else></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="!!outStoreForm.issueCode && outStoreForm.issueCode !== 'delivery_unit' && [6, 7].includes(user.orgType)">
            <div class="labels">标段项目</div>
            <div class="content">
              <el-select v-model="outStoreForm.fkBidProjectId" size="mini" style="width:100%" v-if="[2, 3].includes(outStoreDialogType) && user.orgType == 7" @change="proChange($event, 2)">
                <!-- <el-option value="0" label="无" v-if="user.orgType === 7"></el-option> -->
                <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
              <el-input v-model="outStoreForm.projectName" size="mini" disabled v-else></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库仓库</div>
            <div class="content">
              <el-select v-model="outStoreForm.fkWarehouseId" size="mini" style="width:100%" v-if="[2, 3].includes(outStoreDialogType)" @change="warehouseChange($event, 1)">
                <el-option v-for="item in warehouseList2" :key="item.value" :value="item.value" :label="item.label"></el-option>
              </el-select>
              <el-input v-model="outStoreForm.warehouseName" size="mini" disabled v-else></el-input>
            </div>
          </el-col>

          <el-col :span="8" v-if="outStoreForm.issueCode === 'delivery_subcontract'" class="dialog-form-item mb-10">
            <div class="labels">分包单位</div>
            <div class="content">
              <el-select v-model="fkCustomerId" value-key="pkId" size="mini" style="width:100%" v-if="[2, 3].includes(outStoreDialogType) && user.orgType !== 6" @change="customChange">
                <el-option v-for="item in subOptions" :key="item.value" :value="item" :label="item.label"></el-option>
              </el-select>
              <el-input v-model="outStoreForm.customerName" size="mini" disabled v-else></el-input>
            </div>
          </el-col>
          <el-col :span="8" v-if="outStoreForm.issueCode === 'delivery_supplier'" class="dialog-form-item mb-10">
            <div class="labels">供应商</div>
            <div class="content">
              <el-select v-model="fkCustomerId" value-key="pkId" size="mini" style="width:100%" v-if="[2, 3].includes(outStoreDialogType)" @change="customChange" :disabled="user.orgType !== 5 && !outStoreForm.fkBidProjectId">
                <el-option v-for="item in supOptions" :key="item.value" :value="item" :label="item.label"></el-option>
              </el-select>
              <el-input v-model="outStoreForm.customerName" size="mini" disabled v-else></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="outStoreForm.issueCode === 'delivery_position'">
            <div class="labels">分项工程</div>
            <div class="content">
              <treeSelect v-if="[2, 3].includes(outStoreDialogType)" :defaultProps="defaultProps" :nodeKey="'pkId'" :checkedList="checkedList" :treeList="treeData" @selectIds="selectIds" ref="treeSelect" />
              <el-input :value="outStoreForm.orderItemList && outStoreForm.orderItemList.length ? outStoreForm.orderItemList[0].itemName : ''" size="mini" disabled v-else></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="[4, 5].includes(user.orgType)">
            <div class="labels">关联发料单</div>
            <div class="content">
              <el-select v-model="fkOrdinaryId" size="mini" value-key="pkId" style="width:100%" v-if="[2, 3].includes(outStoreDialogType)" :disabled="(outStoreForm.issueCode === 'delivery_unit' && !outStoreForm.fkWarehouseId) || (outStoreForm.issueCode !== 'delivery_unit' && !outStoreForm.fkCustomerId) || (outStoreForm.issueCode !== 'delivery_unit' && !outStoreForm.fkWarehouseId)" filterable remote :remote-method="remoteMethod1" @visible-change="restoreSelect1" @change="change1" reserve-keyword :loading="loading2">
                <el-option value="" label="无"></el-option>
                <el-option v-for="item in linkSendList" :key="item.value" :value="item" :label="item.label"></el-option>
              </el-select>
              <el-input :value="!fkOrdinaryId ? '无' : fkOrdinaryId.orderCode" size="mini" disabled v-else></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="user.orgType === 6 && outStoreForm.issueCode !== 'delivery_unit'">
            <div class="labels w-110">关联采购计划单</div>
            <div class="content">
              <!-- <el-select v-model="fkPurchaseId" placeholder="无" value-key="pkId" :disabled="!outStoreForm.fkWarehouseId && !outStoreForm.fkCustomerId" size="mini" style="width:100%" v-if="[2, 3].includes(outStoreDialogType)" filterable remote :remote-method="remoteMethod2" @change="change2" @visible-change="restoreSelect2" reserve-keyword :loading="loading2">
              <el-option v-for="item in planBuyList" :key="item.value" :value="item" :label="item.label"></el-option>
            </el-select> -->
              <el-input :value="fkPurchaseId.orderCode ? fkPurchaseId.orderCode : '无'" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="user.orgType === 7">
            <div class="labels">关联入库单</div>
            <div class="content">
              <el-select v-model="fkInputIdList" collapse-tags multiple @change="change3" size="mini" style="width:100%" value-key="pkId" :disabled="!outStoreForm.fkWarehouseId || (!outStoreForm.fkBidProjectId && outStoreForm.issueCode !== 'delivery_unit') || (outStoreForm.issueCode === 'delivery_position' && !this.outStoreForm.fkItemId)" v-if="[2, 3].includes(outStoreDialogType)" filterable remote :remote-method="remoteMethod3" @visible-change="restoreSelect3" reserve-keyword :loading="loading2" placeholder="无">
                <el-option v-for="item in putDeliveryList" :key="item.value" :value="item" :label="item.label" :disabled="deliveryDisabled === 0 ? false : deliveryDisabled === 1 ? item.isMultiple !== 0 : deliveryDisabled === 2 ? fkInputIdList[0].pkId !== item.pkId : false"></el-option>
              </el-select>
              <el-input :title="fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(',') : '无'" :value="fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(',') : '无'" size="mini" disabled v-else></el-input>
            </div>
          </el-col>

          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">填表人</div>
            <div class="content">
              <el-input v-model="outStoreForm.leaderName" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="16" class="dialog-form-item mb-10" v-if="[4, 5].includes(user.orgType)">
            <div class="labels">关联入库单</div>
            <div class="content">
              <el-select size="mini" value-key="pkId" collapse-tags multiple filterable remote :remote-method="remoteMethod4" @visible-change="restoreSelect4" :disabled="(outStoreForm.issueCode === 'delivery_unit' && !outStoreForm.fkWarehouseId) || (outStoreForm.issueCode !== 'delivery_unit' && !outStoreForm.fkCustomerId) || (outStoreForm.issueCode !== 'delivery_unit' && !outStoreForm.fkWarehouseId)" @change="change4" reserve-keyword v-model="fkInputIdList" style="width:100%" :loading="loading2" v-if="[2, 3].includes(outStoreDialogType) && !outStoreForm.fkOrdinaryId" placeholder="无">
                <el-option v-for="item in putDeliveryList" :key="item.value" :label="item.label" :value="item" :disabled="deliveryDisabled === 0 ? false : deliveryDisabled === 1 ? item.isMultiple !== 0 : deliveryDisabled === 2 ? fkInputIdList[0].pkId !== item.pkId : false"></el-option>
              </el-select>
              <el-input :title="fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(',') : '无'" :value="fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(',') : '无'" size="mini" disabled v-else></el-input>
              <!-- <el-tooltip class="item" effect="light" placement="bottom-start" v-else>
              <div slot="content" v-if="fkInputIdList.length">
                <div v-for="(item, index) in fkInputIdList" :key="index">{{ item.orderCode }}</div>
              </div>
              <div slot="content" v-else>无</div>
              <div class="tree-box">
                <span>{{ fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(",") : "无" }}</span>
              </div>
            </el-tooltip> -->
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">业务时间</div>
            <div class="content">
              <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="outStoreForm.serviceTime" :disabled="[1, 4].includes(outStoreDialogType)"></el-date-picker>
            </div>
          </el-col>
          <el-col :span="16" class="dialog-form-item mb-10" v-if="[4, 5].includes(user.orgType) && outStoreForm.issueCode === 'delivery_subcontract'">
            <div class="labels">关联申请单</div>
            <div class="content">
              <el-select placeholder="无" size="mini" value-key="pkId" collapse-tags multiple filterable remote :remote-method="remoteMethod5" @visible-change="restoreSelect5" reserve-keyword v-model="fkApplyIdList" @change="change5" style="width:100%" :loading="loading2" v-if="[2, 3].includes(outStoreDialogType) && !outStoreForm.fkOrdinaryId" :disabled="(outStoreForm.issueCode === 'delivery_unit' && !outStoreForm.fkWarehouseId) || (outStoreForm.issueCode !== 'delivery_unit' && !outStoreForm.fkCustomerId) || (outStoreForm.issueCode !== 'delivery_unit' && !outStoreForm.fkWarehouseId)">
                <el-option v-for="item in applyList" :key="item.pkId" :label="item.orderCode" :value="item"></el-option>
              </el-select>
              <el-input :title="fkApplyIdList.length ? fkApplyIdList.map(item => item.orderCode).join(',') : '无'" :value="fkApplyIdList.length ? fkApplyIdList.map(item => item.orderCode).join(',') : '无'" size="mini" disabled v-else></el-input>
              <!-- <el-tooltip class="item" effect="light" placement="bottom-start" v-else>
              <div slot="content" v-if="fkApplyIdList.length">
                <div v-for="(item, index) in fkApplyIdList" :key="index">{{ item.orderCode }}</div>
              </div>
              <div slot="content" v-else>无</div>
              <div class="tree-box">
                <span>{{ fkApplyIdList.length ? fkApplyIdList.map(item => item.orderCode).join(",") : "无" }}</span>
              </div>
            </el-tooltip> -->
            </div>
          </el-col>
          <!-- <el-col :span="8" class="dialog-form-item mb-10" v-if="[1, 4].includes(outStoreDialogType)">
          <div class="labels">制单人</div>
          <div class="content">
            <el-input v-model="outStoreForm.createUserName" size="mini" disabled></el-input>
          </div>
        </el-col> -->
          <el-col :span="8" class="dialog-form-item mb-10" v-if="[1, 4].includes(outStoreDialogType)">
            <div class="labels">录入时间</div>
            <div class="content">
              <el-input v-model="outStoreForm.createTime" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="[1, 4].includes(outStoreDialogType)">
            <div class="labels">单据状态</div>
            <div class="content">
              <el-input v-model="outStatesList[outStoreForm.inventoryCode]" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10" v-if="outStoreForm.checkStatus !== 1">
            <div class="labels">收料地址</div>
            <div class="content">
              <el-input v-model="outStoreForm.receiptAddress" size="mini" :disabled="[1, 4].includes(outStoreDialogType)" maxlength="100"></el-input>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="labels">备注</div>
            <div class="content">
              <el-input v-model="outStoreForm.remark" type="textarea" :rows="4" resize="none" size="mini" :disabled="[1, 4].includes(outStoreDialogType)"></el-input>
            </div>
          </el-col>
          <div class="dashedDiv mb-10" v-if="outStoreForm.checkStatus !== 1">
            <div class="title">运输信息</div>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">车牌号</div>
              <div class="content">
                <el-input v-model="outStoreForm.vehicleNum" size="mini" :disabled="[1, 4].includes(outStoreDialogType)" maxlength="25"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">运输司机</div>
              <div class="content">
                <el-input v-model="outStoreForm.driverName" size="mini" :disabled="[1, 4].includes(outStoreDialogType)" maxlength="50"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">联系方式</div>
              <div class="content">
                <el-input v-model="outStoreForm.driverPhone" size="mini" :disabled="[1, 4].includes(outStoreDialogType)" maxlength="50"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="timeShow && outStoreDialogType !== 1">
              <div class="labels">签收状态</div>
              <div class="content h-28">
                <el-radio-group v-model="outStoreForm.receiverStatus" :disabled="outStoreDialogType === 1">
                  <el-radio :label="0" v-if="outStoreDialogType !== 4">待签收</el-radio>
                  <el-radio :label="1">已签收</el-radio>
                </el-radio-group>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="outStoreForm.receiverStatus === 1 && outStoreDialogType !== 1">
              <div class="labels">签收人</div>
              <div class="content">
                <el-input v-model="outStoreForm.receiverName" size="mini" :disabled="outStoreDialogType === 1" maxlength="25"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="outStoreForm.receiverStatus === 1 && outStoreDialogType !== 1">
              <div class="labels">签收时间</div>
              <div class="content">
                <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="outStoreForm.receiverTime" :disabled="outStoreDialogType === 1"></el-date-picker>
              </div>
            </el-col>
          </div>
          <div class="dashedDiv mb-10" v-if="outStoreForm.pkId && outStoreForm.receiverStatus > 0 && outStoreDialogType === 1">
            <el-col :span="12" class="dialog-form-item" v-show="outStoreForm.pkId && outStoreForm.receiverStatus == 1">
              <div class="labels">签收人</div>
              <div class="content">{{ outStoreForm.receiverName }}</div>
            </el-col>
            <el-col :span="12" class="dialog-form-item" v-show="outStoreForm.pkId && outStoreForm.receiverStatus == 1">
              <div class="labels">签收时间</div>
              <div class="content">{{ outStoreForm.receiverTime }}</div>
            </el-col>
            <el-col :span="12" class="dialog-form-item" v-show="outStoreForm.pkId && outStoreForm.receiverStatus == 2">
              <div class="labels">拒收人</div>
              <div class="content">{{ outStoreForm.receiverName }}</div>
            </el-col>
            <el-col :span="12" class="dialog-form-item" v-show="outStoreForm.pkId && outStoreForm.receiverStatus == 2">
              <div class="labels">拒收时间</div>
              <div class="content">{{ outStoreForm.receiverTime }}</div>
            </el-col>
            <el-col :span="24" class="dialog-form-item" v-show="outStoreForm.pkId && outStoreForm.receiverStatus == 2">
              <div class="labels">拒收理由</div>
              <div class="content">{{ outStoreForm.reason }}</div>
            </el-col>
          </div>
        </el-row>
        <!-- <div class="dialog-form">
        <div class="dialog-form-item">
          <div class="labels"></div>
          <div class="content"></div>
        </div>
      </div> -->
        <h3 class="tac">物料信息</h3>
        <div class="h-200 table-data">
          <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" :data="materialList" :key="randomKey2" ref="materialList">
            <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
            <el-table-column label="物料名称" align="center" prop="" width="200">
              <template slot-scope="{ row }">
                <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)" v-if="[2, 3].includes(outStoreDialogType) && !outStoreForm.fkOrdinaryId && !outStoreForm.fkInputIdList.length && !outStoreForm.fkOutApplyId">
                  <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
                </el-input>
                <span v-else>{{ row.materialName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="物料分类" align="center" prop="fkTypeName"> </el-table-column>
            <el-table-column label="检测状态" align="center" v-if="user.orgType !== 6">
              <template slot-scope="{ row }">
                <span>{{ row.passStatus === 0 ? "合格" : row.passStatus === 1 ? "不合格" : row.passStatus === 2 ? "待检测" : "" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="供应商" align="center" prop="customerName" v-if="user.orgType !== 6 && outStoreForm.issueCode !== 'delivery_supplier'">
              <template slot-scope="{ row }">{{ row.fkCustomerId === "0" ? "无" : row.customerName }}</template>
            </el-table-column>
            <el-table-column label="单位" align="center" prop="fkUnitName"> </el-table-column>
            <el-table-column label="当前库存量" align="center" prop="supplyNum" v-if="[2, 3].includes(outStoreDialogType)"> </el-table-column>
            <el-table-column label="单据数量" align="center" prop="applyNum" v-if="user.orgType === 6 && outStoreForm.issueCode !== 'delivery_unit' && [2, 3].includes(outStoreDialogType)"> </el-table-column>
            <el-table-column label="已供数量" align="center" prop="applyProvidedNum" v-if="user.orgType === 6 && outStoreForm.issueCode !== 'delivery_unit' && [2, 3].includes(outStoreDialogType)"> </el-table-column>
            <el-table-column label="物料单价" align="center" v-if="pricePermission">
              <template slot-scope="{ row }">
                <!-- oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="row.materialPrice = $event.target.value"  -->
                <el-input v-if="[2, 3].includes(outStoreDialogType)" :disabled="(user.orgType === 5 && outStoreForm.issueCode === 'delivery_subcontract' && !pricePermission2) || row.bool" v-model="row.materialPrice" size="mini" @input="maxPrice($event, row)"></el-input>
                <span v-if="[1, 4].includes(outStoreDialogType)">{{ row.materialPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="本次出库数量" align="center">
              <template slot-scope="{ row }">
                <!-- bool -->
                <el-input :title="user.orgType === 5 && outStoreForm.issueCode === 'delivery_subcontract' && row.bool && row.validNum < row.stockNum - row.validNum ? '已超出甲供不扣款数量' : ''" :class="{ inputRed: user.orgType === 5 && outStoreForm.issueCode === 'delivery_subcontract' && row.bool && row.validNum < row.stockNum - row.validNum }" v-if="[2, 3].includes(outStoreDialogType)" v-model="row.stockNum" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')" @blur="row.stockNum = $event.target.value" @input="limitMax(row)"></el-input>
                <span v-if="[1, 4].includes(outStoreDialogType)">{{ row.stockNum }}</span>
              </template>
            </el-table-column>
            <el-table-column label="总额" align="center" prop="amount" v-if="this.outStoreDialogType == 1"> </el-table-column>
            <el-table-column label="检测状态" align="center" v-if="user.orgType === 7 && outStoreForm.issueCode !== 'delivery_unit'">
              <template slot-scope="{ row }">
                <!-- 合格状态（合格：0，不合格：1，待检测：2） -->
                <span>{{ row.passStatus === 0 ? "合格" : row.passStatus === 1 ? "不合格" : row.passStatus === 2 ? "待检测" : "" }}</span>
              </template>
            </el-table-column>
            <!-- !outStoreForm.fkPurchaseId -->
            <el-table-column label="操作" align="center" v-if="[2, 3].includes(outStoreDialogType) && !outStoreForm.fkOrdinaryId && !outStoreForm.fkInputIdList.length && !outStoreForm.fkOutApplyId">
              <template slot-scope="{ row, $index }">
                <span class="addAcc el-icon-plus" v-if="materialList.length == $index + 1" @click="addMater(1)" title="添加"> </span>
                <span class="delAcc el-icon-close" @click="delMater(row, $index, 1)" title="删除"> </span>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>

      <div slot="footer" v-if="[2, 3, 4].includes(outStoreDialogType)">
        <el-button class="el-button-primary" type="primary" @click="outStoreDialogOk(0)" v-if="[2, 3].includes(outStoreDialogType)">保存草稿</el-button>
        <el-button class="el-button-primary" type="primary" @click="outStoreDialogOk(1)" v-if="[2, 3].includes(outStoreDialogType)">确定出库</el-button>
        <el-button class="el-button-primary" type="primary" @click="enterInfo" v-if="outStoreDialogType === 4">确定</el-button>
        <el-button type="primary" plain @click="closeOutStoreDialog">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 入库单弹框 -->
    <el-dialog :title="putStoreDialogTitle" top="5vw" center :visible="putStoreDialog" width="60%" @close="closePutStoreDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="putStoreDialog dialog-form">
        <!-- 扫一扫遮罩层 -->
        <div class="mask" v-if="maskShow">
          <div class="mask-item">
            <img src="@/assets/u1156.svg" alt="" />
            <h3>扫一扫</h3>
            <div>提示：仅识别出入库单据</div>
          </div>
          <el-input v-model="orderCode" class="wh-300" ref="scanCode" @keyup.enter.native="scanCode" @blur="scanCodeBlur"></el-input>
        </div>
        <img src="@/assets/u1156.svg" alt="" class="scan" @click="maskShow = true" v-if="putStoreDialogType === 7 && !maskShow" />
        <el-radio-group v-model="radio3" size="small" @change="radioChange3" v-if="['4', '6'].includes(putStoreForm.inventoryCode)">
          <el-radio-button :label="1">入库单信息</el-radio-button>
          <el-radio-button :label="2" v-if="!([5, 7].includes(user.orgType) && putStoreForm.inventoryCode === '4' && !putStoreForm.warehousingUser)">退货信息</el-radio-button>
        </el-radio-group>
        <!-- 弹框内容 -->
        <div v-show="radio3 === 1" class="mt-10">
          <el-row :span="24" class="el-row-data dialog-forms">
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">入库单号</div>
              <div class="content">
                <el-input v-model="putStoreForm.orderCode" size="mini" @change="orderChange" :disabled="!!allowModify || ![2, 3].includes(putStoreDialogType)" :maxlength="50"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">来料对象</div>
              <div class="content">
                <el-select v-model="putStoreForm.issueCode" size="mini" style="width:100%" v-if="[2, 3].includes(putStoreDialogType)" @change="issueCodeChange($event, 2)">
                  <el-option v-for="item in putObjectList" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
                <el-input :value="putIsscodeList[putStoreForm.issueCode]" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="[6, 7].includes(user.orgType) && putStoreForm.issueCode !== 'issue_unit'">
              <div class="labels">标段项目</div>
              <div class="content">
                <el-select v-model="putStoreForm.fkBidProjectId" size="mini" style="width:100%" v-if="[2, 3].includes(putStoreDialogType)" @change="proChange($event, 2)">
                  <!-- <el-option value="0" label="无"></el-option> -->
                  <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
                <el-input v-model="putStoreForm.projectName" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="16" class="dialog-form-item mb-10" v-if="[7].includes(user.orgType) && ![2, 3].includes(putStoreDialogType) && !['issue_position', 'issue_unit'].includes(putStoreForm.issueCode)">
              <div class="labels">关联申请单</div>
              <div class="content">
                <el-select placeholder="无" size="mini" value-key="pkId" collapse-tags multiple filterable remote :remote-method="remoteMethod8" @visible-change="restoreSelect8" reserve-keyword v-model="putAppList" style="width:100%" :loading="loading2" v-if="!!putStoreForm.applyStatus && putStoreDialogType === 4">
                  <el-option v-for="item in putApplyList" :key="item.pkId" :label="item.orderCode" :value="item.pkId"></el-option>
                </el-select>
                <el-input :title="putStoreForm.applyOrderCode" :value="putStoreForm.applyOrderCode" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="!subSelShow">
              <div class="labels">入库仓库</div>
              <div class="content">
                <el-select v-model="putStoreForm.fkWarehouseId" size="mini" style="width:100%" v-if="[2, 3, 4].includes(putStoreDialogType) || (putStoreDialogType === 7 && [2].includes(scanCodeType))" @change="warehouseChange($event, 2)">
                  <el-option v-for="item in warehouseList2" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
                <!-- warehouseName -->
                <el-input v-model="putStoreForm.warehouseName" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_subcontract'">
              <div class="labels">分包单位</div>
              <div class="content">
                <el-select v-model="putStoreForm.fkCustomerId" size="mini" style="width:100%" v-if="[2, 3].includes(putStoreDialogType)">
                  <el-option v-for="item in subOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
                <el-input v-model="putStoreForm.customerName" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_supplier'">
              <div class="labels">供应商</div>
              <div class="content">
                <el-select v-model="putStoreForm.fkCustomerId" size="mini" style="width:100%" v-if="[2, 3].includes(putStoreDialogType)" @change="putSupChange">
                  <el-option v-for="item in supOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
                <el-input v-model="putStoreForm.customerName" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_position'">
              <div class="labels">分项工程</div>
              <div class="content">
                <treeSelect :disabled="!putStoreForm.fkBidProjectId" v-if="[2, 3].includes(putStoreDialogType)" :defaultProps="defaultProps" :nodeKey="'pkId'" :checkedList="checkedList" :treeList="treeData" @selectIds="selectIds2" ref="treeSelect2" />
                <!-- :disabled="!putStoreForm.fkBidProjectId" v-if="[2, 3].includes(putStoreDialogType)" -->
                <el-input :value="putStoreForm.orderItemList && putStoreForm.orderItemList.length ? putStoreForm.orderItemList[0].itemName : ''" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="subSelShow">
              <div class="labels w-110">直供分包单位</div>
              <div class="content">
                <el-select v-model="putStoreForm.fkSupplyCustomerId" size="mini" style="width:100%" v-if="[2, 3].includes(putStoreDialogType)" @change="linkSupChange">
                  <el-option v-for="item in supSubOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
                <el-input v-model="putStoreForm.supplyCustomerName" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_unit' || (user.orgType === 5 && putStoreForm.issueCode === 'issue_subcontract')">
              <div class="labels">关联出库单</div>
              <div class="content">
                <el-select size="mini" placeholder="无" value-key="pkId" :disabled="!putStoreForm.fkWarehouseId" collapse-tags multiple filterable remote @change="change6" :remote-method="remoteMethod6" @visible-change="restoreSelect6" reserve-keyword v-model="fkInventoryIdList" style="width:100%" :loading="loading2" v-if="[2, 3].includes(putStoreDialogType)">
                  <el-option v-for="item in outDeliveryList" :key="item.pkId" :label="item.orderCode" :value="item"></el-option>
                </el-select>
                <el-tooltip class="item" effect="light" placement="bottom-start" v-else>
                  <div slot="content" v-if="putStoreForm.orderRelationList && putStoreForm.orderRelationList.length">
                    <div v-for="(item, index) in putStoreForm.orderRelationList" :key="index">{{ item.orderCode }}</div>
                  </div>
                  <div slot="content" v-else>无</div>
                  <el-input size="mini" disabled :value="fkInventoryIdList.length ? fkInventoryIdList.map(item => item.orderCode).join(',') : '无'" placeholder=""></el-input>
                  <!-- <div class="tree-box">
                    <span>{{  }}</span>
                  </div> -->
                </el-tooltip>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_supplier' && [4, 5].includes(user.orgType)">
              <div class="labels w-110">关联采购计划单</div>
              <div class="content">
                <el-select size="mini" value-key="pkId" :disabled="!putStoreForm.fkWarehouseId || !putStoreForm.fkCustomerId" filterable remote @change="change7" :remote-method="remoteMethod7" @visible-change="restoreSelect7" reserve-keyword v-model="fkPurchaseId" style="width:100%" :loading="loading2" v-if="[2, 3].includes(putStoreDialogType)">
                  <el-option value="" label="无"></el-option>
                  <el-option v-for="item in planBuyList" :key="item.value" :label="item.label" :value="item"></el-option>
                </el-select>
                <el-input :value="fkPurchaseId.pkId ? fkPurchaseId.orderCode : '无'" size="mini" disabled v-else></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">填表人</div>
              <div class="content">
                <el-input v-model="putStoreForm.leaderName" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">业务时间</div>
              <div class="content">
                <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="putStoreForm.serviceTime" :disabled="[1, 5, 6].includes(putStoreDialogType) || (putStoreDialogType === 7 && [1, 3].includes(scanCodeType))"></el-date-picker>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="(putStoreForm.billCode === '0' && !subSelShow) || (putStoreDialogType === 7 && !subSelShow)">
              <div class="labels">签收人</div>
              <div class="content">
                <el-input v-model="putStoreForm.receiverName" size="mini" maxlength="25" :disabled="![2, 3].includes(putStoreDialogType)"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="(putStoreForm.billCode === '0' && !subSelShow) || (putStoreDialogType === 7 && !subSelShow)">
              <div class="labels">签收时间</div>
              <div class="content">
                <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="putStoreForm.receiverTime" :disabled="![2, 3].includes(putStoreDialogType)"></el-date-picker>
              </div>
            </el-col>
            <!-- <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.inventoryCode">
              <div class="labels">制单人</div>
              <div class="content">
                <el-input v-model="putStoreForm.createUserName" size="mini" disabled></el-input>
              </div>
            </el-col> -->
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.inventoryCode">
              <div class="labels">录入时间</div>
              <div class="content">
                <el-input v-model="putStoreForm.createTime" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.inventoryCode">
              <div class="labels">单据状态</div>
              <div class="content">
                <el-input :value="[5, 7].includes(user.orgType) && putStoreForm.inventoryCode === 4 && !putStoreForm.warehousingUser ? '未入库已退货' : putStatesList[putStoreForm.inventoryCode]" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="24" class="dialog-form-item mb-10">
              <div class="labels">备注</div>
              <div class="content">
                <el-input v-model="putStoreForm.remark" type="textarea" :rows="4" resize="none" size="mini" :disabled="![2, 3, 4].includes(putStoreDialogType)"></el-input>
              </div>
            </el-col>
            <div class="dashedDiv mb-10" v-if="subSelShow">
              <div class="title">运输信息</div>
              <el-col :span="8" class="dialog-form-item mb-10">
                <div class="labels">车牌号</div>
                <div class="content">
                  <el-input v-model="outStoreForm.vehicleNum" size="mini" :disabled="![2, 3].includes(putStoreDialogType)" maxlength="25"></el-input>
                </div>
              </el-col>
              <el-col :span="8" class="dialog-form-item mb-10">
                <div class="labels">运输司机</div>
                <div class="content">
                  <el-input v-model="outStoreForm.driverName" size="mini" :disabled="![2, 3].includes(putStoreDialogType)" maxlength="50"></el-input>
                </div>
              </el-col>
              <el-col :span="8" class="dialog-form-item mb-10">
                <div class="labels">联系方式</div>
                <div class="content">
                  <el-input v-model="outStoreForm.driverPhone" size="mini" :disabled="![2, 3].includes(putStoreDialogType)" maxlength="50"></el-input>
                </div>
              </el-col>
              <el-col :span="24" class="dialog-form-item mb-10">
                <div class="labels">收料地址</div>
                <div class="content">
                  <el-input v-model="putStoreForm.receiptAddress" size="mini" :disabled="![2, 3].includes(putStoreDialogType)" maxlength="100"></el-input>
                </div>
              </el-col>
              <div v-if="linksSel">
                <el-col :span="8" class="dialog-form-item ">
                  <div class="labels">签收状态</div>
                  <div class="content h-28">
                    <el-radio-group v-model="putStoreForm.receiverStatus" :disabled="![2, 3].includes(putStoreDialogType)">
                      <el-radio :label="0">待签收</el-radio>
                      <el-radio :label="1">已签收</el-radio>
                    </el-radio-group>
                  </div>
                </el-col>
                <el-col :span="8" class="dialog-form-item " v-if="putStoreForm.receiverStatus === 1">
                  <div class="labels">签收人</div>
                  <div class="content">
                    <el-input v-model="putStoreForm.receiverName" maxlength="20" size="mini"></el-input>
                  </div>
                </el-col>
                <el-col :span="8" class="dialog-form-item" v-if="putStoreForm.receiverStatus === 1">
                  <div class="labels">签收时间</div>
                  <div class="content">
                    <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="putStoreForm.receiverTime"></el-date-picker>
                  </div>
                </el-col>
              </div>
            </div>
            <div class="dashedDiv" v-if="putStoreForm.receiverStatus === 2 || ['2', '3'].includes(putStoreForm.inventoryCode)">
              <el-col :span="12" v-show="['2', '3'].includes(putStoreForm.inventoryCode)">
                <span>签收人:</span>
                <span>{{ putStoreForm.receiverName }}</span>
              </el-col>
              <el-col :span="12" v-show="['2', '3'].includes(putStoreForm.inventoryCode)">
                <span>签收时间:</span>
                <span>{{ putStoreForm.receiverTime }}</span>
              </el-col>
              <el-col :span="12" v-show="['3'].includes(putStoreForm.inventoryCode)">
                <span>入库人:</span>
                <span>{{ putStoreForm.warehousingUserName }}</span>
              </el-col>
              <el-col :span="12" v-show="['3'].includes(putStoreForm.inventoryCode)">
                <span>入库时间:</span>
                <span>{{ putStoreForm.warehousingTime }}</span>
              </el-col>
              <el-col :span="12" v-show="[2].includes(putStoreForm.receiverStatus)">
                <span>拒收人:</span>
                <span>{{ putStoreForm.receiverName }}</span>
              </el-col>
              <el-col :span="12" v-show="[2].includes(putStoreForm.receiverStatus)">
                <span>拒收时间:</span>
                <span>{{ putStoreForm.receiverTime }}</span>
              </el-col>
              <el-col :span="24" v-show="[2].includes(putStoreForm.receiverStatus)">
                <span>拒收理由:</span>
                <span>{{ putStoreForm.reason }}</span>
              </el-col>
            </div>
          </el-row>

          <h3 class="tac">物料信息</h3>
          <div class="table-data" :class="{ 'h-300': !putStoreForm.inventoryCode || putStoreForm.inventoryCode < 2, 'h-200': putStoreForm.inventoryCode >= 2 }">
            <el-table style="width: 100%" height="100%" :data="putmaterialList" :key="randomKey2" ref="putmaterialList" stripe :header-cell-style="{ background: '#f1f6ff' }">
              <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
              <el-table-column label="物料名称" align="center" prop="" width="200">
                <template slot-scope="{ row }">
                  <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)" v-if="[2, 3].includes(putStoreDialogType) && !putStoreForm.fkPurchaseId && !putStoreForm.fkInventoryIdList.length">
                    <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
                  </el-input>
                  <span v-else>{{ row.materialName }}</span>
                </template>
              </el-table-column>
              <el-table-column label="物料分类" align="center" prop="fkTypeName"> </el-table-column>
              <el-table-column label="供应商" align="center" prop="customerName">
                <template slot-scope="{ row }">{{ row.fkCustomerId === "0" ? "无" : row.customerName }}</template>
              </el-table-column>
              <el-table-column label="单位" align="center" prop="fkUnitName"> </el-table-column>
              <!-- <el-table-column label="单据数量" align="center" prop="maxNum" v-if="[2, 3, 4, 5].includes(putStoreDialogType) && putStoreForm.fkInventoryIdList && putStoreForm.fkInventoryIdList.length"> </el-table-column> -->
              <el-table-column label="物料单价" align="center" v-if="pricePermission">
                <template slot-scope="{ row }">
                  <!-- oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="row.materialPrice = $event.target.value" -->
                  <el-input v-if="[2, 3].includes(putStoreDialogType)" :disabled="!pricePermission2" v-model="row.materialPrice" size="mini" @input="maxPrice($event, row)"></el-input>
                  <span v-else>{{ row.materialPrice }}</span>
                </template>
              </el-table-column>
              <el-table-column label="入库数量" align="center">
                <template slot-scope="{ row }">
                  <el-input v-if="[2, 3].includes(putStoreDialogType)" v-model="row.stockNum" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')" @blur="row.stockNum = $event.target.value" @input="InputNumChange($event, row)"></el-input>
                  <span v-else>{{ row.stockNum }}</span>
                </template>
              </el-table-column>
              <el-table-column label="总额" align="center" prop="amount" v-if="this.putStoreDialogType == 1"> </el-table-column>
              <el-table-column label="检测状态" align="center" v-if="user.orgType === 7 && putStoreForm.issueCode !== 'issue_unit'">
                <template slot-scope="{ row }">
                  <!-- 合格状态（合格：0，不合格：1，待检测：2） -->
                  <span>{{ row.passStatus === 0 ? "合格" : row.passStatus === 1 ? "不合格" : row.passStatus === 2 ? "待检测" : "" }}</span>
                </template>
              </el-table-column>
              <!-- <el-table-column label="退货数量" align="center" v-if="putStoreDialogType === 6">
                <template slot-scope="{ row }">
                  <el-input v-model="row.stockNum" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')" @blur="row.stockNum = $event.target.value"></el-input>
                </template>
              </el-table-column> -->
              <el-table-column label="操作" align="center" v-if="[2, 3].includes(putStoreDialogType) && !putStoreForm.fkPurchaseId && !putStoreForm.fkInventoryIdList.length">
                <template slot-scope="{ row, $index }">
                  <span class="addAcc el-icon-plus" v-if="putmaterialList.length == $index + 1" @click="addMater(2)" title="添加"> </span>
                  <span class="delAcc el-icon-close" @click="delMater(row, $index, 2)" title="删除"> </span>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </div>
        <div class="mt-10 h-500 table-data" v-show="radio3 === 2">
          <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" :data="putStoreForm.orderReturnVos">
            <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
            <el-table-column label="单据编号" align="center" prop="code">
              <template slot-scope="{ row }">
                <span @click="orderClick(row, 4)" class="blue">{{ row.code }}</span>
              </template>
            </el-table-column>
            <el-table-column label="供应商" align="center" prop="customName" v-if="user.orgType !== 6"> </el-table-column>
            <el-table-column label="物料名称" align="center" prop="materialName"></el-table-column>
            <el-table-column label="物料分类" align="center" prop="materialType"> </el-table-column>
            <el-table-column label="单位" align="center" prop="unit"> </el-table-column>
            <el-table-column label="退货数量" align="center" prop="num"> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
      <div slot="footer" v-if="putStoreDialogType !== 1 && !maskShow">
        <el-button type="primary" class="el-button-primary" @click="putStoreDialogOk(1)" v-if="[2, 3].includes(putStoreDialogType) && !subSelShow">保存草稿</el-button>
        <el-button type="primary" class="el-button-primary" @click="putStoreDialogOk(2)" v-if="[2, 3].includes(putStoreDialogType)">确认提交</el-button>
        <!-- putStoreDialogOk(3) -->
        <el-button type="danger" @click="openIdeaDialog(1)" v-if="(putStoreForm.rejectionButton && [4, 7].includes(putStoreDialogType)) || (putStoreForm.signWarehousingButton && [7].includes(putStoreDialogType) && scanCodeType === 2)">拒收</el-button>
        <el-button type="primary" class="el-button-primary" @click="putStoreDialogOk(4)" v-if="(putStoreForm.signButton && [4, 7].includes(putStoreDialogType)) || (putStoreForm.signWarehousingButton && [7].includes(putStoreDialogType) && scanCodeType === 2)">签收</el-button>
        <el-button type="primary" class="el-button-primary" @click="putStoreDialogOk(5)" v-if="(putStoreForm.signWarehousingButton && [4].includes(putStoreDialogType)) || (putStoreForm.signWarehousingButton && [7].includes(putStoreDialogType) && scanCodeType === 2)">签收入库</el-button>
        <!-- && putStoreForm.warehousingButton -->
        <el-button type="primary" class="el-button-primary" @click="putStoreDialogOk(6)" v-if="[5].includes(putStoreDialogType) || (putStoreDialogType === 7 && scanCodeType === 3)">入库</el-button>
        <!-- putStoreDialogOk(7) -->
        <!-- <el-button type="primary" @click="openIdeaDialog(2)" v-if="[6].includes(putStoreDialogType)">确认退货</el-button> -->
        <el-button type="primary" plain @click="closePutStoreDialog">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择物料弹框 -->
    <selectMaterDialog :materDialog.sync="materDialog" :disabledType="typeCode" :fkCustomId="fkCustomId" @getSelect="getSelect" :fkWarehouseId="outStoreDialog ? outStoreForm.fkWarehouseId : putStoreDialog ? putStoreForm.fkWarehouseId : ''" :showType="selectMaterType" :issueTypeCode="putStoreForm.issueCode" :outTypeCode="outStoreForm.issueCode" :materialIds="materialIds" :fkBidProjectId="fkBidProjectId" :fkItemId="fkItemId" :selectMater="outStoreDialog ? materialList : putStoreDialog ? putmaterialList : []" :fkSupplyCustomerId="putStoreForm.fkSupplyCustomerId"></selectMaterDialog>
    <!-- 检测弹框 -->
    <el-dialog center :title="checkDialogTitle" :visible="checkDialog" @close="closeCheckDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading3" :close-on-press-escape="false">
      <div class="dialog-form">
        <el-form label-width="80px" :model="checkForm">
          <el-row :span="24" class="el-row-data">
            <el-col :span="12">
              <el-form-item label="检测编号">
                <el-input v-model="checkForm.orderCode" size="mini" @change="orderChange" :disabled="!!allowModify || checkDialogType === 2" :maxlength="limitNum"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检测结果">
                <!-- <el-input v-model="checkForm.detectionCode" size="mini"></el-input> -->
                <el-select v-model="checkForm.detectionCode" style="width:100%" size="mini" :disabled="checkDialogType === 2">
                  <el-option value="1" label="合格"></el-option>
                  <el-option value="2" label="不合格"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="填表人">
                <el-input v-model="checkForm.inspectorName" size="mini" :disabled="checkDialogType === 2"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检测时间">
                <el-date-picker size="mini" type="datetime" :disabled="checkDialogType === 2" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="checkForm.serviceTime"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="checkDialogType === 1 || (checkDialogType === 2 && fileList.length)">
              <el-form-item label="附件">
                <input type="file" ref="files" id="upload" @change="upLoad" v-if="fileList.length < 10 && checkDialogType === 1" />
                <div class="fileList" v-if="fileList.length">
                  <div class="fileList-item" v-for="(item, index) in fileList" :key="index">
                    <div class="fileName" :title="item.fileName">{{ item.fileName }}</div>
                    <span class="delBtn" @click="delFile(index)" v-if="checkDialogType === 1">X</span>
                    <el-button size="mini" @click="download(item)" type="success" plain>下载</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="检测报告">
                <el-input v-model="checkForm.reports" type="textarea" :rows="4" resize="none" size="mini" :disabled="checkDialogType === 2"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" @click="checkDialogOk" v-if="checkDialogType === 1">保存</el-button>
        <el-button type="primary" plain @click="closeCheckDialog">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog center :title="checkMaterDialogTitle" :visible="checkMaterDialog" @close="closeCheckMaterDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading2" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="tabs" v-if="checkMaterDialogType === 2">
          <div class="tabs-item" :class="{ nobd: index !== dateList.length - 1, clicknow: index === tab }" v-for="(item, index) in dateList" :key="index" @click="tabsClick(index, item)">
            {{ item.ageTerm }}
            <i class="icons" :class="{ 'el-icon-check': true, 'el-icon-close': false }"></i>
          </div>
        </div>
        <el-form label-width="80px" :model="checkForm">
          <el-row :span="24" class="el-row-data">
            <el-col :span="8">
              <el-form-item label="检测编号">
                <el-input v-model="checkForm.orderCode" size="mini" :disabled="checkMaterDialogType === 2"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="入库单号">
                <el-input v-model="checkForm.publicClassForm" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="龄期">
                <el-input v-model="checkForm.ageTerm" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="检测人">
                <el-input v-model="checkForm.inspectorName" size="mini" :disabled="checkMaterDialogType === 2"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="检测时间">
                <el-date-picker size="mini" type="datetime" :disabled="checkMaterDialogType === 2" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="checkForm.serviceTime"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="checkMaterDialogType === 1 || (checkMaterDialogType === 2 && fileList.length)">
              <el-form-item label="附件">
                <input type="file" ref="files" id="upload" @change="upLoad" v-if="fileList.length < 10 && checkMaterDialogType === 1" />
                <div class="fileList" v-if="fileList.length">
                  <div class="fileList-item" v-for="(item, index) in fileList" :key="index">
                    <div class="fileName" :title="item.fileName">{{ item.fileName }}</div>
                    <span class="delBtn" @click="delFile(index)" v-if="checkMaterDialogType === 1">X</span>
                    <el-button size="mini" @click="download(item)" type="success" plain>下载</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="检测报告">
                <el-input v-model="checkForm.reports" type="textarea" :rows="4" resize="none" size="mini" :disabled="checkMaterDialogType === 2"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <h3 class="tac">检测物料信息</h3>
        <div class="h-200 table-data">
          <el-table :data="checkMaterList" style="width: 100%" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column align="center" label="序号" type="index" width="60"> </el-table-column>
            <el-table-column align="center" label="物料名称" prop="materialName"> </el-table-column>
            <el-table-column align="center" label="物料类型" :prop="checkMaterDialogType === 2 ? 'materialTypeName' : 'fkTypeName'"> </el-table-column>
            <el-table-column align="center" label="检测结果">
              <template slot-scope="{ row }">
                <el-select v-model="row.detectionCode" style="width:100%" size="mini" :disabled="checkMaterDialogType === 2">
                  <el-option value="1" label="合格"></el-option>
                  <el-option value="2" label="不合格"></el-option>
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div slot="footer">
        <!-- <el-button type="primary" @click="checkMaterDialogOk" v-if="checkMaterDialogType === 1">保存</el-button> -->
        <el-button type="primary" plain @click="closeCheckMaterDialog">取消</el-button>
      </div>
    </el-dialog>
    <!-- 意见弹框 -->
    <el-dialog width="30%" title="拒收原因" center :visible="ideaDialog" @close="closeIdeaDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
        <el-input v-model="reason" type="textarea" :rows="4" resize="none" size="mini" maxlength="100"></el-input>
      </div>
      <div slot="footer">
        <el-button type="primary" plain @click="closeIdeaDialog">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="ideaDialogOk">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 退货弹框 -->
    <el-dialog title="退货" top="1vw" width="60%" :visible="returnDialog" @close="closeReturnDialog" center v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog-form">
        <el-row :span="24" class="el-row-data dialog-forms mb-10">
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">入库单号</div>
            <div class="content">
              <el-input v-model="putStoreForm.orderCode" size="mini" disabled maxlength="50"></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">来料对象</div>
            <div class="content">
              <el-input :value="putIsscodeList[putStoreForm.issueCode]" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">标段项目</div>
            <div class="content">
              <el-input v-model="putStoreForm.projectName" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="[2, 3].includes(interfaceType)">
            <div class="labels">入库仓库</div>
            <div class="content">
              <el-input v-model="putStoreForm.warehouseName" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">供应商</div>
            <div class="content">
              <el-input v-model="putStoreForm.customerName" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="interfaceType !== 4">
            <div class="labels">签收人</div>
            <div class="content">
              <el-input v-model="putStoreForm.leaderName" maxlength="20" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="[2, 3].includes(interfaceType)">
            <div class="labels">入库时间</div>
            <div class="content">
              <el-input v-model="putStoreForm.serviceTime" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">单据状态</div>
            <div class="content">
              <el-input :value="putStatesList[putStoreForm.inventoryCode]" size="mini" disabled></el-input>
            </div>
          </el-col>
          <!-- <el-col :span="8" class="dialog-form-item mb-10" v-if="interfaceType === 1 && user.orgType === 5">
          <div class="labels">退货人</div>
          <div class="content">
            <el-input v-model="subReturnForm.leaderName" size="mini"></el-input>
          </div>
        </el-col> -->
          <el-col :span="8" class="dialog-form-item mb-10" v-if="interfaceType === 1 && user.orgType === 5">
            <div class="labels">退货时间</div>
            <div class="content">
              <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="subReturnForm.serviceTime"></el-date-picker>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10" v-if="user.orgType === 5">
            <div class="labels">退回地址</div>
            <div class="content">
              <el-input v-model="subReturnForm.receiptAddress" size="mini" maxlength="100"></el-input>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10" v-if="(interfaceType === 1 && user.orgType === 5) || (user.orgType === 7 && interfaceType !== 4)">
            <div class="labels">备注</div>
            <div class="content">
              <el-input v-model="putStoreForm.remark" size="mini" disabled></el-input>
            </div>
          </el-col>
          <div class="dashedDiv mb-10" v-if="user.orgType === 7">
            <div class="title">退货信息</div>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="[2, 3].includes(interfaceType)">
              <div class="labels">出库单号</div>
              <div class="content">
                <el-input v-model="subReturnForm.orderCode" size="mini" maxlength="50"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="[2, 3].includes(interfaceType)">
              <div class="labels">填表人</div>
              <div class="content">
                <el-input v-model="subReturnForm.leaderName" size="mini" maxlength="25"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="[2, 3].includes(interfaceType)">
              <div class="labels">退货时间</div>
              <div class="content">
                <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="subReturnForm.serviceTime"></el-date-picker>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="interfaceType !== 1 && putStoreForm.signStatus">
              <div class="labels">签收人</div>
              <div class="content">
                <el-input v-model="subReturnForm.receiverName" maxlength="25" size="mini"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="interfaceType === 4 && putStoreForm.signStatus"></el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="interfaceType !== 1 && putStoreForm.signStatus">
              <div class="labels">签收时间</div>
              <div class="content">
                <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="subReturnForm.receiverTime"></el-date-picker>
              </div>
            </el-col>
            <el-col :span="24" class="dialog-form-item mb-10" v-if="user.orgType === 7">
              <div class="labels">退回地址</div>
              <div class="content">
                <el-input v-model="subReturnForm.receiptAddress" size="mini" maxlength="100"></el-input>
              </div>
            </el-col>
            <el-col :span="24" class="dialog-form-item mb-10" v-if="[2, 3].includes(interfaceType)">
              <div class="labels">备注</div>
              <div class="content">
                <el-input v-model="subReturnForm.remark" size="mini" maxlength="100"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">车牌号</div>
              <div class="content">
                <el-input v-model="subReturnForm.vehicleNum" size="mini" maxlength="25"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">运输司机</div>
              <div class="content">
                <el-input v-model="subReturnForm.driverName" size="mini" maxlength="50"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">联系方式</div>
              <div class="content">
                <el-input v-model="subReturnForm.driverPhone" size="mini" maxlength="50"></el-input>
              </div>
            </el-col>
          </div>
        </el-row>
        <el-radio-group v-model="radio2" size="small mb-10" @change="radioChange2" v-if="user.orgType === 5">
          <el-radio-button :label="1" v-if="[0, 2].includes(putStoreForm.showTabStatus)">本单位库存部分</el-radio-button>
          <el-radio-button :label="2" v-if="[1, 2].includes(putStoreForm.showTabStatus)">已出料部分</el-radio-button>
        </el-radio-group>
        <el-row :span="24" class="el-row-data dialog-forms dashedDiv" v-if="radio2 === 1 && user.orgType === 5 && interfaceType !== 1">
          <div class="title">退货信息</div>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库单号</div>
            <div class="content">
              <el-input v-model="subReturnForm.orderCode" @change="orderChange" size="mini" :maxlength="limitNum" :disabled="!!allowModify"></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">填表人</div>
            <div class="content">
              <el-input v-model="subReturnForm.leaderName" disabled size="mini"></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">退货时间</div>
            <div class="content">
              <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="subReturnForm.serviceTime"></el-date-picker>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="labels">备注</div>
            <div class="content">
              <el-input v-model="subReturnForm.remark" size="mini" maxlength="100"></el-input>
            </div>
          </el-col>
          <div class="dashedDiv mb-10">
            <div class="title">运输信息</div>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">车牌号</div>
              <div class="content">
                <el-input v-model="subReturnForm.vehicleNum" size="mini" maxlength="25"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">运输司机</div>
              <div class="content">
                <el-input v-model="subReturnForm.driverName" size="mini" maxlength="50"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">联系方式</div>
              <div class="content">
                <el-input v-model="subReturnForm.driverPhone" size="mini" maxlength="50"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item " v-if="putStoreForm.signStatus">
              <div class="labels">签收状态</div>
              <div class="content h-28">
                <el-radio-group v-model="subReturnForm.receiverStatus">
                  <el-radio :label="0">待签收</el-radio>
                  <el-radio :label="1">已签收</el-radio>
                </el-radio-group>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="subReturnForm.receiverStatus === 1">
              <div class="labels">签收人</div>
              <div class="content">
                <el-input v-model="subReturnForm.receiverName" maxlength="25" size="mini"></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="subReturnForm.receiverStatus === 1">
              <div class="labels">签收时间</div>
              <div class="content">
                <el-date-picker size="mini" type="datetime" :picker-options="pickerOptions" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="subReturnForm.receiverTime"></el-date-picker>
              </div>
            </el-col>
          </div>
        </el-row>
        <h3 class="tac">物料信息</h3>
        <div class="h-300 table-data" v-if="radio2 === 1">
          <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" :data="returnMaterialList" :key="randomKey3">
            <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
            <el-table-column label="物料名称" align="center" prop="materialName"></el-table-column>
            <el-table-column label="物料分类" align="center" prop="fkTypeName"> </el-table-column>
            <el-table-column label="单位" align="center" prop="fkUnitName"> </el-table-column>
            <el-table-column label="单据数量" align="center" prop="stockNum"> </el-table-column>
            <el-table-column label="可退数量" align="center" prop="marginNum" v-if="interfaceType === 2 && putStoreForm.showTabStatus === 2"> </el-table-column>
            <el-table-column label="物料单价" align="center" prop="materialPrice" v-if="pricePermission"> </el-table-column>
            <el-table-column label="退货数量" align="center">
              <template slot-scope="{ row }">
                <el-input v-model="row.retreatNum" v-if="[2, 3].includes(interfaceType)" size="mini" oninput="value=value.replace(/[^0-9]/g,'')" @blur="row.retreatNum = $event.target.value" @input="numChange($event, row, 1)"></el-input>
                <span v-else>{{ row.retreatNum }}</span>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <div class="h-500 table-data" v-if="radio2 === 2">
          <el-table style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" height="100%" :data="afterMaterialList" :key="randomKey3" v-if="radio2 === 2">
            <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
            <el-table-column label="出料对象" align="center" prop="customName"></el-table-column>
            <el-table-column label="关联单据" align="center" prop="codeUrl">
              <template slot-scope="{ row }">
                <!-- @click="orderClick(row, 3)"fkOutId -->
                <span class="blue" @click="orderClick(row, 3)">{{ row.codeUrl }}</span>
              </template>
            </el-table-column>
            <el-table-column label="物料名称" align="center" prop="materialName"></el-table-column>
            <el-table-column label="物料分类" align="center" prop="materialTypeName"> </el-table-column>
            <el-table-column label="单位" align="center" prop="fkUnitName"> </el-table-column>
            <el-table-column label="单据数量" align="center" prop="stockNum"> </el-table-column>
            <el-table-column label="物料单价" align="center" prop="price" v-if="pricePermission"> </el-table-column>
            <el-table-column label="退货数量" align="center">
              <template slot-scope="{ row }" v-if="row.type == 4">
                <el-input v-model="row.retreatNum" size="mini" oninput="value=value.replace(/[^0-9]/g,'')" @blur="row.retreatNum = $event.target.value" @input="numChange($event, row, 2)"></el-input>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>

      <div slot="footer">
        <el-button type="primary" class="el-button-primary" @click="returnDialogOk">{{ interfaceType === 4 ? "原路退回" : "确定退货" }}</el-button>
        <el-button type="primary" plain @click="closeReturnDialog">取消</el-button>
      </div>
    </el-dialog>
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"></checkOrderDialog>
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5";
import selectMaterDialog from "./selectMaterDialog.vue";
import treeSelect from "./treeSelect.vue";
import moment from "moment";
import checkOrderDialog from "./checkOrderDialog.vue";
export default {
  components: { selectMaterDialog, treeSelect, checkOrderDialog },
  props: {
    outPutStoreDialog: {
      type: Boolean
    },
    fkOrgId: ""
  },
  mounted() {
    var code = "";
    var lastTime, nextTime; // 上次时间、最新时间
    var lastCode, nextCode; // 上次按键、最新按键
    document.onkeypress = e => {
      // 获取按键
      if (window.event) {
        // IE
        nextCode = e.keyCode;
      } else if (e.which) {
        // Netscape/Firefox/Opera
        nextCode = e.which;
      }
      // 如果触发了回车事件(扫码结束时间)
      if (nextCode === 13) {
        if (code.length < 3) return; // 手动输入的时间不会让code的长度大于2，所以这里只会对扫码枪有
        this.orderCode = code;
        this.scanCode(); // 获取到扫码枪输入的内容，做别的操作

        code = "";
        lastCode = "";
        lastTime = "";
        return;
      }
      nextTime = new Date().getTime(); // 记录最新时间
      if (!lastTime && !lastCode) {
        // 如果上次时间和上次按键为空
        code += e.key; // 执行叠加操作
      }
      // 如果有上次时间及上次按键
      if (lastCode && lastTime && nextTime - lastTime > 30) {
        // 当扫码前有keypress事件时,防止首字缺失
        code = e.key;
      } else if (lastCode && lastTime) {
        code += e.key;
      }
      lastCode = nextCode;
      lastTime = nextTime;
    };
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    },
    pricePermission() {
      let arr = this.$store.state.menuData.filter(item => item.menuCode == "supplies");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    },
    pricePermission2() {
      let arr = this.$store.state.menuData.filter(item => item.menuCode == "updatePrice");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    },
    typeCode() {
      if (this.putStoreDialog) {
        return this.putmaterialList.filter(item => item.fkMaterialId).length ? this.putmaterialList.filter(item => item.fkMaterialId)[0].typeCode : "";
      } else if (this.outStoreDialog) {
        return this.materialList.filter(item => item.fkMaterialId).length ? this.materialList.filter(item => item.fkMaterialId)[0].typeCode : "";
      }
    },
    fkCustomId() {
      if (this.selectMaterType === 3) {
        if (["issue_supplier", "issue_subcontract"].includes(this.putStoreForm.issueCode)) {
          return this.putStoreForm.fkCustomerId;
        } else {
          return "0";
        }
      } else if (this.selectMaterType === 2) {
        if (["delivery_supplier", "delivery_subcontract"].includes(this.outStoreForm.issueCode)) {
          return this.outStoreForm.fkCustomerId;
        } else {
          return "0";
        }
      } else {
        return "0";
      }
    },
    fkBidProjectId() {
      if (this.selectMaterType === 3) {
        return this.putStoreForm.fkBidProjectId;
      } else if (this.selectMaterType === 2) {
        return this.outStoreForm.fkBidProjectId;
      }
    },
    fkItemId() {
      if (this.selectMaterType === 3) {
        return this.putStoreForm.fkItemId;
      } else if (this.selectMaterType === 2) {
        return this.outStoreForm.fkItemId;
      }
    }
  },
  data() {
    return {
      loading: false,
      loading2: false,
      loading3: false,
      tableData: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, //分页数据
      total: 0, //分页总数
      inpData: { beginTime: "", endTime: "", orderCode: "", fkWarehouseId: "", fkBidProjectId: "", inventoryCode: "", detectionStatus: "" },
      searchData: { beginTime: "", endTime: "", orderCode: "", fkWarehouseId: "", fkBidProjectId: "", inventoryCode: "", detectionStatus: "" },
      radio: 1,
      randomKey: Math.random(),
      randomKey2: Math.random(),
      pagesShow: true,
      outStoreDialogTitle: "",
      outStoreDialogType: 1,
      outStoreDialog: false,
      outStoreForm: {
        customerName: "",
        driverName: "",
        driverPhone: "",
        fkApplyIdList: [],
        fkBidProjectId: "",
        fkCustomerId: "",
        fkInputIdList: [],
        fkItemId: "",
        fkOrdinaryId: "",
        fkPurchaseId: "",
        fkWarehouseId: "",
        inventoryCode: "",
        issueCode: "delivery_unit",
        leaderName: "",
        orderCode: "",
        remark: "",
        serviceTime: "",
        vehicleNum: "",
        receiverStatus: 0,
        receiptAddress: ""
      },
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
      materDialog: false,
      materialList: [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }],
      putmaterialList: [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }],
      putStoreDialogTitle: "",
      putStoreDialogType: 1,
      putStoreDialog: false,
      billCodeList: ["自主创建", "项目部推送", "分包单位推送", "供应商推送", "出库单被拒收", "库存盘盈", "余料入库"],
      putStatesList: ["草稿", "运输中", "待入库", "已完成", "已退货", "待退货", "退货中", "已拒收"],
      outStatesList: ["草稿", "运输中", "被拒收", "已完成"],
      putIsscodeList: { issue_unit: "无", issue_supplier: "供应商", issue_subcontract: "分包单位", issue_project: "项目部", issue_position: "施工部位" },
      outIsscodeList: { delivery_unit: "无", delivery_supplier: "供应商", delivery_subcontract: "分包单位", delivery_project: "项目部", delivery_position: "施工部位" },
      putStoreForm: {
        customerName: "",
        billCode: "0",
        fkBidProjectId: "",
        fkCustomerId: "",
        fkItemId: "",
        fkPurchaseId: "",
        fkInventoryIdList: [],
        fkWarehouseId: "",
        inventoryCode: "",
        issueCode: "issue_unit",
        leaderName: "",
        orderCode: "",
        receiverName: "",
        receiverTime: "",
        remark: "",
        serviceTime: "",
        fkSupplyCustomerId: "",
        receiptAddress: "",
        receiverStatus: 0
      },
      putApplyList: [], //分包商查询到的申请单列表
      putAppList: [], //分包商选择的申请单id
      outObjectList: [],
      putObjectList: [],
      checkDialogTitle: "",
      checkDialog: false,
      checkDialogType: 1,
      checkForm: {
        detectionCode: "",
        fileName: "",
        fileUrl: "",
        fkInventoryId: 0,
        inspectorName: "",
        orderCode: "",
        reports: "",
        serviceTime: ""
      },
      checkMaterDialogTitle: "",
      checkMaterDialog: false,
      checkMaterDialogType: 1,
      checkMaterList: [],
      dateList: [],
      tab: 0,
      checkTypeList: [
        { label: "待检测", value: "0" },
        { label: "检测中", value: "1" },
        { label: "检测合格", value: "2" },
        { label: "检测不合格", value: "3" }
      ],
      fileList: [],
      signInfoShow: false,
      subOptions: [],
      supOptions: [],
      proOptions: [],
      typeList: [],
      checkTypeList: [],
      defaultProps: {
        children: "children",
        label: "itemName"
      },
      checkedList: [],
      treeData: [],
      ideaDialog: false,
      ideaDialogType: 1,
      warehouseList: [],
      warehouseList2: [],
      outDeliveryList: [],
      putDeliveryList: [],
      timer: null,
      planBuyList: [],
      nowAddMaterObj: {},
      reason: "",
      maskShow: false,
      timeShow: true,
      selectMaterType: 2,
      linkSendList: [],
      materialIds: [],
      applyList: [],
      fkPurchaseId: "",
      fkInputIdList: [],
      fkOrdinaryId: "",
      fkApplyIdList: [],
      fkCustomerId: "",
      fkInventoryIdList: [],
      returnDialog: false,
      radio2: 1,
      returnMaterialList: [],
      afterMaterialList: [],
      randomKey3: Math.random(),
      radio3: 1,
      deliveryDisabled: 0,
      subReturnForm: {
        driverName: "",
        driverPhone: "",
        inputId: "",
        leaderName: "",
        orderCode: "",
        remark: "",
        serviceTime: "",
        vehicleNum: "",
        receiverName: "",
        receiverTime: ""
      },
      orderCode: "",
      scanCodeType: 1, //1为查看，2为处理，3为入库
      interfaceType: "", //interfaceType 未入库时(项目部和分包单位公用)：1，入库单退货-项目部已入库通用退货版:2,分包单位已入库退货：3
      checkOrderDialog: false,
      orderType: 1,
      orderPkId: "",
      allowModify: 0,
      limitNum: "",
      isUpdate: 0,
      subSelShow: false,
      supSubOptions: [],
      linksSel: false,
      fkOutApplyId: { pkId: "" },
      randomKey4: Math.random(),
      supAppList: []
    };
  },
  watch: {
    outPutStoreDialog(val) {
      if (val) {
        if (this.user.orgType === 7) {
          // this.searchItemsByProjectId("");
          this.treeData = [];
        }
        this.findWarehouseByProjectId("", this.user.orgType === 7 ? 1 : 3);
        if (this.user.orgType === 7) {
          this.findWarehouseByProjectId("0", 2);
        }

        this.$store.dispatch("getDictionariesData", 19).then(res => {
          this.typeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        });
        this.$store.dispatch("getDictionariesData", 26).then(res => {
          this.outObjectList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        });
        this.$store.dispatch("getDictionariesData", 21).then(res => {
          this.checkTypeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        });
        this.$store.dispatch("getDictionariesData", 17).then(res => {
          this.putObjectList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        });
        this.searchOutInventoryPage();
      }
    }
  },
  methods: {
    // 出库单分页
    searchOutInventoryPage() {
      let { beginTime, endTime, orderCode, fkBidProjectId, inventoryCode } = this.searchData;
      let data = { ...this.page, beginTime, endTime, orderCode, fkBidProjectId, inventoryCode };
      if (this.user.orgType === 4 || this.user.orgType === 10) {
        data.fkBidProjectId = this.fkOrgId;
      }
      this.$api.searchOutInventoryPage(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 入库单分页
    searchPutInventoryPage() {
      let { beginTime, endTime, orderCode, fkWarehouseId, fkBidProjectId, inventoryCode, detectionStatus } = this.searchData;
      let data = { ...this.page, beginTime, endTime, orderCode, fkWarehouseId, fkBidProjectId, inventoryCode, detectionStatus };
      if (this.user.orgType === 4 || this.user.orgType === 10) {
        data.fkBidProjectId = this.fkOrgId;
      }
      this.$api.searchPutInventoryPage(data).then(res => {
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据查询条件获取出库单列表-入库时使用-来料对象为无时使用
    findOrderOutByWarehouseId(fkWarehouseId, orderCode, outIds, isOk) {
      let data = { pageNum: 1, pageSize: 20, fkWarehouseId, orderCode, outIds: outIds && outIds.length ? outIds.join(",") : "" };
      this.$api.findOrderOutByWarehouseId(data).then(res => {
        this.loading2 = false;
        if (res.code === 200) {
          this.outDeliveryList = res.data.map(item => ({ ...item, value: item.pkId, label: item.orderCode }));
          if (outIds && outIds.length) {
            let arr = [];
            this.outDeliveryList.forEach(item =>
              outIds.forEach(item2 => {
                if (item.pkId === item2) {
                  arr.push(item);
                }
              })
            );
            this.fkInventoryIdList = arr;
            if (this.putStoreDialogType === 3 && this.putStoreForm.billCode === "6" && isOk) {
              console.log("计算了");
              let arr2 = [];
              arr.forEach(item => {
                item.materialVos.forEach(item2 => {
                  arr2.push(item2);
                });
              });
              arr2.forEach(item => {
                this.putmaterialList.forEach(item2 => {
                  if (item.pkId === item2.fkMaterialId && item.fkCustomerId === item.fkCustomerId) {
                    item2.maxNum += item.stockNum;
                  }
                });
              });
            }
          }
        } else {
          this.loading2 = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据查询条件获取入库单列表-出库时使用
    findOrderInputByWarehouseId(fkWarehouseId, issueCode, fkCustomerId, orderCode, inputIds, isTrue) {
      let data = { pageNum: 1, pageSize: 20, fkWarehouseId, issueCode, fkCustomerId, orderCode, inputIds: inputIds ? inputIds.join(",") : "" };
      if (this.user.orgType !== 5) {
        data.fkBidProjectId = issueCode !== "delivery_unit" ? this.outStoreForm.fkBidProjectId : "0";
      }
      if (data.issueCode === "delivery_position") {
        data.fkItemId = this.outStoreForm.fkItemId;
      }
      console.log(data);
      this.$api.findOrderInputByWarehouseId(data).then(res => {
        this.loading2 = false;
        if (res.code === 200) {
          this.putDeliveryList = res.data.map(item => ({ ...item, value: item.pkId, label: item.orderCode }));
          if (inputIds && inputIds.length) {
            let arr = [];
            this.putDeliveryList.forEach(item =>
              inputIds.forEach(item2 => {
                if (item.pkId === item2) {
                  arr.push(item);
                }
              })
            );
            this.fkInputIdList = arr;
          }
          if (isTrue && this.materialList.length) {
            let arr1 = [];
            let arr2 = [];
            this.fkInputIdList.forEach(item => {
              if (inputIds.includes(item.pkId) && item.materialVos) {
                arr1.push(...item.materialVos);
              }
            });
            for (let i = 0; i < arr1.length; i++) {
              let flag = true;
              for (let j = 0; j < arr2.length; j++) {
                if (arr1[i].pkId === arr2[j].fkMaterialId && arr1[i].fkCustomerId === arr2[j].fkCustomerId && arr1[i].passStatus === arr2[j].passStatus) {
                  arr2[j].supplyNum += arr1[i].supplyNum;
                  flag = false;
                }
              }
              if (flag) {
                arr2.push({ ...arr1[i] });
              }
            }
            this.materialList.forEach(item => {
              arr2.forEach(item2 => {
                if (item.fkMaterialId === item2.pkId) {
                  this.$set(item, "supplyNum", item2.supplyNum);
                }
              });
            });
          }
        } else {
          this.loading2 = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据id获取入库单
    findInputById(row, type) {
      this.$api.findInputById({ pkId: row.pkId }).then(res => {
        if (res.code === 200) {
          console.log(res.data, row, type);
          this.putStoreForm = res.data;
          let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
          if (type === 4) {
            this.putStoreForm.serviceTime = time;
            this.putStoreForm.receiverTime = time;
            this.putStoreForm.fkWarehouseId = "";
            this.putStoreForm.leaderName = this.user.userName;
            if (this.user.orgType === 7 && res.data.applyStatus) {
              this.findOrderApplyByInputId();
            }
          }
          if (type !== 6) {
            this.putmaterialList = res.data.detailsVoList.map(item => ({ ...item, maxNum: 0 }));
            if (this.user.orgType !== 7 && res.data.issueCode === "issue_supplier" && res.data.supplyStatus) {
              this.subSelShow = true;
            } else {
              this.subSelShow = false;
            }
            if (this.putStoreDialogType !== 1) {
              this.findProjectListByType(2, this.putStoreForm.issueCode);
            }
            let arr1 = res.data.orderRelationList.filter(item => item.orderType === 1); //采购单
            let arr2 = res.data.orderRelationList.filter(item => item.orderType === 2); //出库单
            // let arr3 = res.data.orderRelationList.filter(item => item.orderType === 3); //入库单
            this.putStoreForm.fkPurchaseId = arr1.length ? arr1[0].pkId : "";
            this.fkPurchaseId = arr1.length ? arr1[0] : "";
            this.fkInventoryIdList = arr2;
            this.putStoreForm.fkInventoryIdList = arr2.length ? arr2.map(item => item.pkId) : [];
            this.putStoreForm.fkItemId = res.data.orderItemList && res.data.orderItemList.length ? res.data.orderItemList[0].fkItemId : "";
            if (this.putStoreDialogType === 3) {
              if (res.data.issueCode === "issue_position") {
                this.putStoreForm.fkItemId = res.data.orderItemList ? res.data.orderItemList[0].fkItemId : "";
                this.searchItemsByProjectId(res.data.fkBidProjectId, 2);
              }
            }
            if (this.putStoreForm.issueCode === "issue_unit" && this.putStoreDialogType === 3) {
              this.findOrderOutByWarehouseId(this.putStoreForm.fkWarehouseId, "", this.putStoreForm.fkInventoryIdList, true);
            }
            if ([3].includes(type)) {
              this.findWarehouseByProjectId(res.data.fkBidProjectId, 2);
            }
            if ([4, 5].includes(type)) {
              this.findWarehouseByProjectId(res.data.fkBidProjectId, 2, true);
            }
            this.randomKey2 = Math.random();
            this.putStoreDialog = true;
          } else {
            this.interfaceType = row.interfaceType;
            //interfaceType 未入库时(项目部和分包单位公用)：1，入库单退货-项目部已入库通用退货版:2,分包单位已入库退货：3
            if (this.user.orgType === 7) {
              this.subReturnForm.receiptAddress = res.data.receiptAddress;
            }
            if (row.interfaceType === 1) {
              this.subReturnForm.serviceTime = time;
              this.returnMaterialList = res.data.detailsVoList.map(item => ({ ...item, retreatNum: item.stockNum, price: item.materialPrice }));
            } else {
              // this.putStoreForm.receiverTime = "";
              // this.putStoreForm.serviceTime = "";
              // this.putStoreForm.leaderName = "";
              // this.putStoreForm.remark = "";
              if (row.interfaceType !== 4) {
                this.getBusinessCode(7);
              }
              this.subReturnForm.serviceTime = time;
              this.subReturnForm.receiverTime = time;
              this.subReturnForm.leaderName = this.user.userName;
              if (row.interfaceType === 2) {
                if (res.data.showTabStatus !== 2) {
                  this.returnMaterialList = res.data.engOrderInputInventoryReturnDetailsVos ? res.data.engOrderInputInventoryReturnDetailsVos.map(item => ({ ...item, retreatNum: item.stockNum, price: item.materialPrice, fkUnitName: item.fkUnitName ? item.fkUnitName : item.unitName })) : [];
                }
                this.afterMaterialList = res.data.engDischargeVos ? res.data.engDischargeVos.map(item => ({ ...item, retreatNum: item.type == 4 ? item.returnNum : "", fkUnitName: item.fkUnitName ? item.fkUnitName : item.unitName })) : [];
                if (res.data.showTabStatus === 1) {
                  this.radio2 = 2;
                } else if (res.data.showTabStatus === 2) {
                  this.returnMaterialList = res.data.engOrderInputInventoryReturnDetailsVos ? res.data.engOrderInputInventoryReturnDetailsVos.map(item => ({ ...item, retreatNum: item.marginNum, price: item.materialPrice, fkUnitName: item.fkUnitName ? item.fkUnitName : item.unitName })) : [];
                }
              } else if (row.interfaceType === 3) {
                //  row.retreatNum = row.marginNum row.retreatNum = row.stockNum;
                // this.returnMaterialList = res.data.engOrderInputInventoryReturnDetailsVos ? res.data.engOrderInputInventoryReturnDetailsVos.map(item => ({ ...item, retreatNum: item.marginNum })) : [];
                // this.afterMaterialList = res.data.engDischargeVos ? res.data.engDischargeVos.map(item => ({ ...item, retreatNum: item.type == 4 ? item.returnNum : "" })) : [];
                this.returnMaterialList = res.data.detailsVoList.map(item => ({ ...item, retreatNum: item.stockNum, price: item.materialPrice }));
              } else if (row.interfaceType === 4) {
                this.returnMaterialList = res.data.detailsVoList.map(item => ({ ...item, retreatNum: item.stockNum, price: item.materialPrice }));
              }
            }
            this.returnDialog = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据客户id和申请单编码获取物资申请单列表
    getOrderApply(fkCustomerId, orderCode, applyIds, inputIds) {
      // 出库对象编码（delivery_unit：无， delivery_supplier：供应商， delivery_subcontract：分包单位， delivery_project：项目部， delivery_position：施工部位）
      let customerType = this.outStoreForm.issueCode === "delivery_subcontract" ? 4 : 3;
      let arr = applyIds.length ? applyIds.join(",") : "";
      let data = { pageNum: 1, pageSize: 20, customerType, fkCustomerId, orderCode, applyIds: arr, inputIds: inputIds ? inputIds.join(",") : "" };
      this.$api.getOrderApply(data).then(res => {
        this.loading2 = false;
        if (res.code === 200) {
          this.applyList = res.data;
          if (applyIds.length) {
            let arr = [];
            let arr2 = [];
            this.applyList.forEach(item =>
              applyIds.forEach(item2 => {
                if (item.pkId === item2) {
                  arr.push(item);
                }
              })
            );
            this.fkApplyIdList = arr;
            arr.forEach(item => item.materialVos.forEach(item2 => arr2.push(item2)));
            this.materialIds = arr2.map(item => item.pkId);
          }
        } else {
          this.loading2 = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // 采购计划单
    findPurchaseOrderByProjectId(fkBidProjectId, fkWarehouseId, fkCustomerId, purchaseIds, orderCode, isTrue, fkSupplyCustomerId) {
      let data = { pageNum: 1, pageSize: 20, fkBidProjectId, fkWarehouseId, fkCustomerId, purchaseIds, orderCode, fkSupplyCustomerId };
      if (this.outStoreForm.issueCode === "delivery_project") {
        delete data.fkCustomerId;
      }
      this.$api
        .findPurchaseOrderByProjectId(data)
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.planBuyList = res.data.map(item => ({ ...item, value: item.pkId, label: item.orderCode }));
            if (isTrue && this.materialList.length) {
              let obj = this.planBuyList.filter(item => item.pkId === purchaseIds)[0];
              this.materialList.forEach(item => {
                obj.materialVos.forEach(item2 => {
                  if (item.fkMaterialId === item2.pkId) {
                    this.$set(item, "supplyNum", item2.supplyNum);
                  }
                });
              });
            }
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 关联发料单
    findOrderOrdinaryByWarehouseId(fkWarehouseId, typeCode, fkCustomerId, orderCode, ordinaryIds, isTrue) {
      let data = { pageNum: 1, pageSize: 20, fkWarehouseId, typeCode, fkCustomerId, orderCode, ordinaryIds };
      this.$api
        .findOrderOrdinaryByWarehouseId(data)
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.linkSendList = res.data.map(item => ({ ...item, value: item.pkId, label: item.orderCode }));
            if (isTrue && this.materialList.length) {
              let obj = this.linkSendList.filter(item => item.pkId === ordinaryIds)[0];
              this.materialList.forEach(item => {
                obj.materialVos.forEach(item2 => {
                  if (item.fkMaterialId === item2.pkId) {
                    this.$set(item, "supplyNum", item2.supplyNum);
                  }
                });
              });
            }
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 出入库对象变更
    issueCodeChange(e, type) {
      this.randomKey2 = Math.random();
      if (type === 1) {
        this.outStoreForm.fkBidProjectId = "";
        this.outStoreForm.fkCustomerId = "";
        this.outStoreForm.fkItemId = "";
        this.outStoreForm.fkOrdinaryId = "";
        this.outStoreForm.fkApplyIdList = "";
        this.outStoreForm.fkInputIdList = "";
        this.outStoreForm.fkPurchaseId = "";
        this.outStoreForm.receiptAddress = "";
        this.outStoreForm.fkOutApplyId = "";
        this.materialIds = [];
        this.fkOrdinaryId = "";
        this.fkApplyIdList = [];
        this.fkInputIdList = [];
        this.fkPurchaseId = "";
        this.fkCustomerId = "";
        this.fkOutApplyId = { pkId: "" };
        if (["delivery_unit", "delivery_position"].includes(e)) {
          this.timeShow = true;
        } else {
          this.timeShow = false;
        }
        this.materialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
        if (this.user.orgType === 5) {
          if (e === "delivery_unit" && this.outStoreForm.fkWarehouseId) {
            this.findOrderOrdinaryByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode);
          }
        } else {
          this.outStoreForm.fkWarehouseId = "";
          this.findProjectListByType(1, this.outStoreForm.issueCode);
        }
        if (this.user.orgType === 6) {
          this.randomKey4 = Math.random();
          if (e !== "delivery_unit") {
            this.findOrderOutApplyBySource();
          }
        }
      } else {
        this.putStoreForm.fkBidProjectId = "";
        this.putStoreForm.fkCustomerId = "";
        this.putStoreForm.fkItemId = "";
        this.putStoreForm.fkSupplyCustomerId = "";
        this.subSelShow = false;
        // if(){}
        if (this.user.orgType !== 5) {
          this.putStoreForm.fkWarehouseId = "";
        }
        this.fkInventoryIdList = [];
        this.putStoreForm.fkInventoryIdList = [];
        this.putStoreForm.fkPurchaseId = "";
        this.fkPurchaseId = "";
        this.putmaterialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
        if (this.user.orgType !== 5) {
          this.findProjectListByType(2, this.putStoreForm.issueCode);
        }
      }
      if (this.user.orgType !== 5) {
        if (["delivery_unit", "issue_unit"].includes(e)) {
          this.findWarehouseByProjectId("0", 2);
        } else {
          this.warehouseList2 = [];
        }
      }
    },
    // 仓库变更
    warehouseChange(e, type) {
      if (type === 1) {
        this.materialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "" }];
        this.outStoreForm.fkPurchaseId = "";
        this.outStoreForm.receiptAddress = "";
        if (e && this.user.orgType === 6 && this.outStoreForm.issueCode != "delivery_unit") {
          this.searchOrderOutApply();
        }
      } else {
        if (this.putStoreDialogType !== 4) {
          // this.putmaterialList = [
          //   {
          //     fkMaterialId: "",
          //     materialPrice: "",
          //     stockNum: "",
          //     fkCustomerId: "",
          //     passStatus: ""
          //   }
          // ];
          this.putStoreForm.fkPurchaseId = "";
          this.fkPurchaseId = "";
        }
      }
      if (e) {
        if (type === 1) {
          if ((this.user.orgType === 5 && this.outStoreForm.issueCode === "delivery_unit") || (this.user.orgType === 5 && this.outStoreForm.issueCode !== "delivery_unit" && this.outStoreForm.fkCustomerId)) {
            this.findOrderOrdinaryByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId);
            this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId);
          }
          // if (this.outStoreForm.issueCode !== "delivery_unit" && this.user.orgType === 6 && this.outStoreForm.fkBidProjectId && this.outStoreForm.fkWarehouseId && this.outStoreForm.fkCustomerId) {
          //   this.findPurchaseOrderByProjectId(this.outStoreForm.fkBidProjectId, this.outStoreForm.fkWarehouseId, this.outStoreForm.fkCustomerId, this.outStoreForm.fkPurchaseId);
          // }
          if ((this.user.orgType === 7 && this.outStoreForm.fkBidProjectId && this.outStoreForm.issueCode !== "delivery_unit") || (this.user.orgType === 7 && this.outStoreForm.issueCode === "delivery_unit")) {
            if (this.outStoreForm.issueCode === "delivery_position") {
              if (this.outStoreForm.fkItemId) {
                this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId);
              }
            } else {
              this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId);
            }
          }
          // console.log(this.outStoreForm.issueCode);
          // if (this.user.orgType === 6 && this.outStoreForm.issueCode === "delivery_project" && this.outStoreForm.fkBidProjectId && this.outStoreForm.fkWarehouseId) {
          //   this.findPurchaseOrderByProjectId(this.outStoreForm.fkBidProjectId, this.outStoreForm.fkWarehouseId, "0", this.outStoreForm.fkPurchaseId);
          // }
        } else {
          if (this.putStoreForm.issueCode === "issue_unit") {
            this.findOrderOutByWarehouseId(e);
          }
          if ([2, 3].includes(this.putStoreDialogType)) {
            let bidId = this.user.orgType === 5 ? this.proOptions[0].pkId : this.putStoreForm.fkBidProjectId;
            if (this.putStoreForm.issueCode === "issue_supplier" && bidId && this.putStoreForm.fkWarehouseId && this.putStoreForm.fkCustomerId && [2, 3].includes(this.putStoreDialogType)) {
              this.findPurchaseOrderByProjectId(bidId, this.putStoreForm.fkWarehouseId, this.putStoreForm.fkCustomerId, this.putStoreForm.fkPurchaseId);
            }
            if (this.putStoreForm.issueCode === "issue_project" && bidId && this.putStoreForm.fkWarehouseId && [2, 3].includes(this.putStoreDialogType)) {
              this.findPurchaseOrderByProjectId(bidId, this.putStoreForm.fkWarehouseId, "0", this.putStoreForm.fkPurchaseId);
            }
          }
        }
      }
    },
    // 关闭出入库弹框
    closeOutPutStoreDialog() {
      this.$emit("update:outPutStoreDialog", false);
      this.radio = 1;
      this.pagesShow = false;
      this.cleanSearchData();
      this.$nextTick(() => {
        this.pagesShow = true;
      });
    },
    // 根据类型获取标段项目列表信息
    findProjectListByType(accessType, accessCode, isTrue) {
      let data = { accessType, accessCode };
      this.$api.findProjectListByType(data).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectName }));
          if (this.user.orgType === 5) {
            if (this.putStoreDialog) {
              this.getSubList(3, 2, 0);
              this.getSubList(4, 2, 0);
            } else if (this.outStoreDialog) {
              this.getSubList(3, 0, 1);
              this.getSubList(4, 0, 1);
            }
          }
          if (isTrue) {
            if (accessType === 1) {
              this.warehouseChange(this.outStoreForm.fkWarehouseId, 1);
            } else if (accessType === 2) {
              this.warehouseChange(this.putStoreForm.fkWarehouseId, 2);
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 标段项目下拉变更
    proChange(e, type) {
      if (type === 1) {
        this.inpData.fkWarehouseId = "";
      } else {
        this.putStoreForm.fkWarehouseId = "";
        this.outStoreForm.fkWarehouseId = "";
        this.fkInputIdList = [];
        this.outStoreForm.fkInputIdList = [];
        this.fkPurchaseId = "";
        if (this.putStoreForm.issueCode === "issue_position" || this.outStoreForm.issueCode === "delivery_position") {
          this.searchItemsByProjectId(e, 1);
          if (this.putStoreDialog) {
            this.$nextTick(() => {
              this.$refs.treeSelect2.clearable();
            });
          } else if (this.outStoreDialog) {
            this.$nextTick(() => {
              this.$refs.treeSelect.clearable();
            });
          }
        }
      }
      if (e) {
        if (type === 1) {
          this.findWarehouseByProjectId(e, type);
        } else if (type === 2) {
          this.findWarehouseByProjectId(e, type, true);
          let bidId = this.user.orgType === 5 ? this.proOptions[0].pkId : this.putStoreForm.fkBidProjectId;
          if (this.putStoreForm.issueCode === "issue_supplier" && bidId && this.putStoreForm.fkWarehouseId && this.putStoreForm.fkCustomerId) {
            this.findPurchaseOrderByProjectId(bidId, this.putStoreForm.fkWarehouseId, this.putStoreForm.fkCustomerId, this.putStoreForm.fkPurchaseId);
          }
          // if (this.outStoreForm.issueCode !== "delivery_unit" && this.user.orgType === 6 && this.outStoreForm.fkBidProjectId && this.outStoreForm.fkWarehouseId && this.outStoreForm.fkCustomerId) {
          //   this.findPurchaseOrderByProjectId(this.outStoreForm.fkBidProjectId, this.outStoreForm.fkWarehouseId, this.outStoreForm.fkCustomerId, this.outStoreForm.fkPurchaseId);
          // }
          if (this.putStoreForm.issueCode === "issue_project" && this.user.orgType === 7 && this.putStoreForm.fkBidProjectId && this.putStoreForm.fkWarehouseId) {
            this.findPurchaseOrderByProjectId(this.putStoreForm.fkBidProjectId, this.putStoreForm.fkWarehouseId, "0", this.putStoreForm.fkPurchaseId);
          }
          if (this.putStoreDialog) {
            this.getSubList(3, 2, 0);
            this.getSubList(4, 2, 0);
          } else if (this.outStoreDialog) {
            this.getSubList(3, 0, 1);
            this.getSubList(4, 0, 1);
          }
        }
      }
      // else {
      //   if (type === 1) {
      //     this.findWarehouseByProjectId("", type);
      //   } else if (type === 2) {
      //     this.findWarehouseByProjectId("0", type);
      //   }
      // }
    },
    // 获取仓库下拉
    findWarehouseByProjectId(bidProjectId, type, isTrue) {
      let bidId = this.user.orgType === 4 ? this.fkOrgId : bidProjectId;
      this.$api.findWarehouseByProjectId({ bidProjectId: bidId }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.pkId, label: item.warehouseName }));
          if (type === 1) {
            this.warehouseList = arr;
          } else if (type === 2) {
            this.warehouseList2 = arr;
            if (isTrue) {
              if (this.putStoreDialog) {
                this.putStoreForm.fkWarehouseId = res.data.length ? res.data[0].pkId : "";
                if (this.putStoreForm.fkWarehouseId) {
                  this.warehouseChange(this.putStoreForm.fkWarehouseId, 2);
                }
              } else if (this.outStoreDialog) {
                this.outStoreForm.fkWarehouseId = res.data.length ? res.data[0].pkId : "";
                if (this.outStoreForm.fkWarehouseId) {
                  this.warehouseChange(this.outStoreForm.fkWarehouseId, 1);
                }
              }
            }
          } else if (type === 3) {
            this.warehouseList = [...arr];
            this.warehouseList2 = [...arr];
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取供应商、分包单位
    getSubList(customType, isZero, sourceType) {
      let bidProjectId = "";
      if (this.user.orgType === 5) {
        bidProjectId = this.proOptions[0].pkId;
      } else {
        if (this.putStoreDialog) {
          bidProjectId = this.putStoreForm.fkBidProjectId;
        } else if (this.outStoreDialog) {
          bidProjectId = this.outStoreForm.fkBidProjectId;
        }
      }
      //isZero 是否过滤已关联公司标识 0:不过滤，1：过滤
      let data = { bidProjectId, customType, isZero, sourceType };
      this.$api.searchProjCustomByType(data).then(res => {
        if (res.code === 200) {
          let arr = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
          if (this.user.orgType === 5) {
            if (customType === 3) {
              this.supOptions = arr;
              if (!!this.outStoreForm.pkId && this.outStoreForm.issueCode === "delivery_supplier") {
                let arr2 = arr.filter(item => item.pkId === this.outStoreForm.fkCustomerId);
                if (arr2.length && arr2[0].relationStatus === 0) {
                  this.timeShow = true;
                } else {
                  this.timeShow = false;
                }
              }
            } else if (customType === 4) {
              this.subOptions = arr;
              if (!!this.outStoreForm.pkId && this.outStoreForm.issueCode === "delivery_subcontract") {
                let arr2 = arr.filter(item => item.pkId === this.outStoreForm.fkCustomerId);
                if (arr2.length && arr2[0].relationStatus === 0) {
                  this.timeShow = true;
                } else {
                  this.timeShow = false;
                }
              }
            }
          } else {
            if (customType === 3) {
              // .filter(item => item.fkProjectId === this.fkOrgId);
              this.supOptions = arr;
            } else if (customType === 4) {
              // .filter(item => item.fkProjectId === this.fkOrgId);
              this.subOptions = arr;
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分项工程
    searchItemsByProjectId(id, type) {
      let isOut = 0;
      if (this.putStoreDialog) {
        isOut = 1;
      } else if (this.outStoreDialog) {
        isOut = 0;
      }
      this.$api.searchItemsByProjectId({ projectId: id, filterStatus: 1, isOut }).then(res => {
        if (res.code == 200) {
          this.treeData = res.data;
          if (type === 2) {
            if (this.putStoreDialog) {
              this.$nextTick(() => {
                this.$refs.treeSelect2.setTreeSelect(this.putStoreForm.fkItemId.split(","));
              });
            } else if (this.outStoreDialog) {
              this.$nextTick(() => {
                this.$refs.treeSelect.setTreeSelect(this.outStoreForm.fkItemId.split(","));
              });
            }
          }
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
          if (dictType === 26) {
            this.outObjectList = arr;
          } else if (dictType === 20) {
            this.typeList = arr;
          } else if (dictType === 21) {
            this.checkTypeList = arr;
          } else if (dictType === 19) {
            this.typeList = arr;
          } else if (dictType === 17) {
            this.putObjectList = arr;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取业务单号
    getBusinessCode(businessType) {
      this.$api.getBusinessCode({ businessType }).then(res => {
        console.log("业务单号", res);
        if (res.code === 200) {
          this.allowModify = res.data.allowModify;
          this.limitNum = res.data.limitNum;
          if (businessType === 7) {
            if (this.returnDialog) {
              this.subReturnForm.orderCode = res.data.typeCode;
            } else {
              this.outStoreForm.orderCode = res.data.typeCode;
            }
          } else if (businessType === 8) {
            this.putStoreForm.orderCode = res.data.typeCode;
          } else if (businessType === 10) {
            this.checkForm.orderCode = res.data.typeCode;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    radioChange(e) {
      this.tableData = [];
      this.randomKey = Math.random();
      this.cleanSearchData();
      this.pagesShow = false;
      if (e === 1) {
        this.$store.dispatch("getDictionariesData", 19).then(res => {
          this.typeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        });

        this.searchOutInventoryPage();
      } else {
        this.$store.dispatch("getDictionariesData", 20).then(res => {
          this.typeList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        });
        this.searchPutInventoryPage();
      }
      this.$nextTick(() => {
        this.pagesShow = true;
      });
    },
    radioChange2(e) {
      this.randomKey3 = Math.random();
    },
    radioChange3() {},
    // 下拉框失去焦点还原原始下拉数据
    restoreSelect1(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        this.findOrderOrdinaryByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkOrdinaryId);
      }
    },
    // 所有远程搜索下拉框事件
    // 远程输入搜索
    remoteMethod1(query) {
      console.log(query);
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findOrderOrdinaryByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, query, this.outStoreForm.fkOrdinaryId);
        }, 200);
      } else {
        // 请求初始列表
        this.findOrderOrdinaryByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkOrdinaryId);
      }
    },
    change1(e) {
      console.log(e);
      this.materialIds = [];
      this.fkApplyIdList = [];
      this.fkInputIdList = [];
      this.outStoreForm.fkInputIdList = [];
      this.outStoreForm.fkApplyIdList = [];
      if (!e) {
        this.materialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
        this.outStoreForm.receiptAddress = "";
        return (this.outStoreForm.fkOrdinaryId = e);
      }
      this.outStoreForm.receiptAddress = e.receiptAddress;
      this.outStoreForm.fkOrdinaryId = e.pkId;
      this.fkInputIdList = e.inputName ? e.inputName.split(",").map(item => ({ orderCode: item })) : [];
      this.fkApplyIdList = e.applyName ? e.applyName.split(",").map(item => ({ orderCode: item })) : [];
      console.log(this.fkInputIdList, this.fkApplyIdList);
      this.materialList = e.materialVos
        ? e.materialVos.map(item => ({
            bool: item.bool,
            validNum: item.validNum,
            materialPrice: item.bool ? 0 : item.price,
            stockNum: item.issueNum,
            fkMaterialId: item.pkId,
            materialName: item.materialName,
            fkTypeName: item.fkTypeName,
            fkUnitName: item.fkUnitName,
            supplyNum: item.supplyNum,
            fkCustomerId: item.fkCustomerId,
            purchaseNum: item.issueNum,
            passStatus: item.passStatus,
            customerName: item.customerName
          }))
        : [];
    },
    restoreSelect2(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        // fkBidProjectId, fkWarehouseId, fkCustomerId, purchaseIds, orderCode;
        this.findPurchaseOrderByProjectId(this.outStoreForm.fkBidProjectId, this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode === "issue_project" ? "0" : this.outStoreForm.fkCustomerId, this.outStoreForm.fkPurchaseId);
      }
    },
    remoteMethod2(query) {
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findPurchaseOrderByProjectId(this.outStoreForm.fkBidProjectId, this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode === "issue_project" ? "0" : this.outStoreForm.fkCustomerId, this.outStoreForm.fkPurchaseId, query);
        }, 200);
      } else {
        // 请求初始列表
        this.findPurchaseOrderByProjectId(this.outStoreForm.fkBidProjectId, this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode === "issue_project" ? "0" : this.outStoreForm.fkCustomerId, this.outStoreForm.fkPurchaseId, query);
      }
    },
    change2(e) {
      if (!e) {
        this.materialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
        this.outStoreForm.fkPurchaseId = e;
        this.outStoreForm.receiptAddress = "";
      } else {
        this.outStoreForm.fkPurchaseId = e.pkId;
        this.outStoreForm.receiptAddress = e.receiptAddress;
        this.materialList = e.materialVos.map(item => ({
          materialPrice: item.price,
          stockNum: item.issueNum - item.providedNum > item.supplyNum ? item.supplyNum : item.issueNum - item.providedNum,
          fkMaterialId: item.pkId,
          materialName: item.materialName,
          fkTypeName: item.fkTypeName,
          fkUnitName: item.fkUnitName,
          supplyNum: item.supplyNum,
          fkCustomerId: item.fkCustomerId,
          purchaseNum: item.issueNum,
          passStatus: item.passStatus,
          customerName: item.customerName,
          providedNum: item.providedNum
        }));
      }
    },
    restoreSelect3(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId === "0" ? "" : this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkInputIdList);
      }
    },
    remoteMethod3(query) {
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId === "0" ? "" : this.outStoreForm.fkCustomerId, query, this.outStoreForm.fkInputIdList);
        }, 200);
      } else {
        // 请求初始列表
        this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId === "0" ? "" : this.outStoreForm.fkCustomerId, query, this.outStoreForm.fkInputIdList);
      }
    },
    change3(e) {
      console.log(e);
      if (e.length === 0) {
        this.deliveryDisabled = 0;
        this.outStoreForm.fkInputIdList = "";
        this.materialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
        return;
      }
      // 禁用情况
      if (e.filter(item => item.isMultiple === 0).length) {
        this.deliveryDisabled = 1;
      } else if (e.filter(item => item.isMultiple === 1).length) {
        this.deliveryDisabled = 2;
      }
      console.log(this.deliveryDisabled);
      this.outStoreForm.fkInputIdList = e.map(item => item.pkId);
      let arr1 = [];
      let arr2 = [];
      e.forEach(item => {
        item.materialVos.forEach(item2 => {
          arr1.push(item2);
        });
      });
      for (let i = 0; i < arr1.length; i++) {
        let flag = true;
        for (let j = 0; j < arr2.length; j++) {
          if (arr1[i].pkId === arr2[j].fkMaterialId && arr1[i].fkCustomerId === arr2[j].fkCustomerId) {
            arr2[j].supplyNum += arr1[i].supplyNum;
            if (new Date(arr2[j].createTime) < new Date(arr1[i].createTime)) {
              arr2[j].materialPrice = arr1[i].price;
            }
            flag = false;
          }
        }
        if (flag) {
          arr2.push({
            materialPrice: arr1[i].price,
            stockNum: arr1[i].issueNum,
            fkMaterialId: arr1[i].pkId,
            materialName: arr1[i].materialName,
            fkTypeName: arr1[i].fkTypeName,
            fkUnitName: arr1[i].fkUnitName,
            supplyNum: arr1[i].supplyNum,
            purchaseNum: arr1[i].issueNum,
            fkCustomerId: arr1[i].fkCustomerId,
            passStatus: arr1[i].passStatus,
            customerName: arr1[i].customerName,
            createTime: arr1[i].createTime
          });
        }
      }
      this.materialList = arr2;
    },
    restoreSelect4(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkInputIdList);
      }
    },
    remoteMethod4(query) {
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, query, this.outStoreForm.fkInputIdList);
        }, 200);
      } else {
        // 请求初始列表
        this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, query, this.outStoreForm.fkInputIdList);
      }
    },
    change4(e) {
      console.log(e);
      this.fkApplyIdList = [];
      this.outStoreForm.fkApplyIdList = "";
      console.log(this.fkApplyIdList, this.outStoreForm.fkApplyIdList);
      if (e.length === 0) {
        this.deliveryDisabled = 0;
        this.outStoreForm.fkInputIdList = "";
        this.materialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
        if (this.outStoreForm.issueCode === "issue_subcontract") {
          this.getOrderApply(this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkApplyIdList, "");
        }
        return;
      }
      // 禁用情况
      if (e.filter(item => item.isMultiple === 0).length) {
        this.deliveryDisabled = 1;
      } else if (e.filter(item => item.isMultiple === 1).length) {
        this.deliveryDisabled = 2;
      }

      this.outStoreForm.fkInputIdList = e.map(item => item.pkId);
      if (this.outStoreForm.issueCode === "issue_subcontract") {
        this.getOrderApply(this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkApplyIdList, this.outStoreForm.fkInputIdList);
      }
      let arr1 = [];
      let arr2 = [];
      e.forEach(item => {
        item.materialVos.forEach(item2 => {
          arr1.push(item2);
        });
      });
      for (let i = 0; i < arr1.length; i++) {
        let flag = true;
        for (let j = 0; j < arr2.length; j++) {
          if (arr1[i].pkId === arr2[j].fkMaterialId && arr1[i].fkCustomerId === arr2[j].fkCustomerId && arr1[i].passStatus === arr2[j].passStatus) {
            if (new Date(arr2[j].createTime) < new Date(arr1[i].createTime) && arr2[j].bool) {
              arr2[j].materialPrice = arr1[i].price;
            }
            arr2[j].supplyNum += arr1[i].supplyNum;
            arr2[j].stockNum += arr1[i].issueNum;
            // arr2[j].supplyNum += arr1[i].supplyNum;
            flag = false;
          }
        }
        if (flag) {
          let stockNum = arr1[i].issueNum > arr1[i].supplyNum - arr1[i].providedNum ? arr1[i].supplyNum : arr1[i].issueNum - arr1[i].providedNum;
          arr2.push({
            bool: arr1[i].bool,
            validNum: arr1[i].validNum,
            price: arr1[i].price,
            materialPrice: this.user.orgType === 5 && arr1[i].bool ? 0 : arr1[i].price,
            stockNum: stockNum,
            fkMaterialId: arr1[i].pkId,
            materialName: arr1[i].materialName,
            fkTypeName: arr1[i].fkTypeName,
            fkUnitName: arr1[i].fkUnitName,
            supplyNum: arr1[i].supplyNum,
            purchaseNum: arr1[i].issueNum,
            fkCustomerId: arr1[i].fkCustomerId,
            passStatus: arr1[i].passStatus,
            customerName: arr1[i].customerName,
            createTime: arr1[i].createTime
          });
        }
      }
      this.materialList = arr2;
    },
    restoreSelect5(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        this.getOrderApply(this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkApplyIdList, this.outStoreForm.fkInputIdList);
      }
    },
    remoteMethod5(query) {
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.getOrderApply(this.outStoreForm.fkCustomerId, query, this.outStoreForm.fkApplyIdList, this.outStoreForm.fkInputIdList);
        }, 200);
      } else {
        // 请求初始列表
        this.getOrderApply(this.outStoreForm.fkCustomerId, query, this.outStoreForm.fkApplyIdList, this.outStoreForm.fkInputIdList);
      }
    },
    change5(e) {
      console.log(e);
      this.outStoreForm.fkApplyIdList = e.map(item => item.pkId);
      let arr = [];
      e.forEach(item =>
        item.materialVos.forEach(item2 => {
          arr.push(item2);
        })
      );
      // if (this.fkInputIdList.length) {
      //   this.materialList.forEach(item => {
      //     item.stockNum = 0;
      //   });
      //   if (!e.length) {
      //     let arr1 = [];
      //     this.fkInputIdList.forEach(item => {
      //       item.materialVos.forEach(item2 => {
      //         arr1.push(item2);
      //       });
      //     });
      //     for (let i = 0; i < arr1.length; i++) {
      //       for (let j = 0; j < this.materialList.length; j++) {
      //         if (arr1[i].pkId === this.materialList[j].fkMaterialId && arr1[i].fkCustomerId === this.materialList[j].fkCustomerId && arr1[i].passStatus === this.materialList[j].passStatus) {
      //           this.materialList[j].stockNum += arr1[i].issueNum;
      //         }
      //       }
      //     }
      //     return;
      //   }
      //   this.materialList.forEach(item => {
      //     arr.forEach(item2 => {
      //       if (item.fkMaterialId === item2.pkId) {
      //         console.log(item2.supplyNum);
      //         item.stockNum += item2.supplyNum;
      //         if (item.stockNum > item.supplyNum) {
      //           item.stockNum = item.supplyNum;
      //         }
      //       }
      //     });
      //   });
      // } else {
      this.materialIds = arr.map(item => item.pkId);
      // }
    },
    // 下拉框失去焦点还原原始下拉数据
    restoreSelect6(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        this.findOrderOutByWarehouseId(this.putStoreForm.fkWarehouseId, "", this.putStoreForm.fkInventoryIdList);
      }
    },
    // 远程输入搜索
    remoteMethod6(query) {
      console.log(query);
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findOrderOutByWarehouseId(this.putStoreForm.fkWarehouseId, query, this.putStoreForm.fkInventoryIdList);
        }, 200);
      } else {
        // 请求初始列表
        this.findOrderOutByWarehouseId(this.putStoreForm.fkWarehouseId, "", this.putStoreForm.fkInventoryIdList);
      }
    },
    change6(e) {
      console.log(e);
      this.randomKey2 = Math.random();
      if (e.length === 0) {
        this.putStoreForm.fkInventoryIdList = e;
        this.putmaterialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
        return;
      }
      this.putStoreForm.fkInventoryIdList = e.map(item => item.pkId);
      let arr1 = [];
      let arr2 = [];
      e.forEach(item => {
        item.materialVos.forEach(item2 => {
          arr1.push(item2);
        });
      });
      for (let i = 0; i < arr1.length; i++) {
        let flag = true;
        for (let j = 0; j < arr2.length; j++) {
          if (arr1[i].pkId === arr2[j].fkMaterialId && arr1[i].fkCustomerId === arr2[j].fkCustomerId) {
            if (new Date(arr2[j].createTime) < new Date(arr1[i].createTime)) {
              arr2[j].materialPrice = arr1[i].price;
            }
            arr2[j].maxNum += arr1[i].stockNum;
            arr2[j].stockNum += arr1[i].stockNum;
            flag = false;
          }
        }
        if (flag) {
          // putStoreForm.fkInventoryIdList
          arr2.push({
            materialPrice: arr1[i].price,
            stockNum: arr1[i].stockNum,
            maxNum: arr1[i].stockNum,
            fkMaterialId: arr1[i].pkId,
            materialName: arr1[i].materialName,
            fkTypeName: arr1[i].fkTypeName,
            fkUnitName: arr1[i].fkUnitName,
            supplyNum: arr1[i].supplyNum,
            purchaseNum: arr1[i].issueNum,
            fkCustomerId: arr1[i].fkCustomerId,
            passStatus: arr1[i].passStatus,
            customerName: arr1[i].customerName,
            createTime: arr1[i].createTime
          });
        }
      }
      this.putmaterialList = arr2;
    },
    InputNumChange(e, row) {
      if (this.putStoreForm.fkInventoryIdList.length) {
        console.log(row.maxNum);
        if (row.maxNum && row.stockNum > row.maxNum) {
          row.stockNum = row.maxNum;
        }
      }
    },
    restoreSelect7(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        let bidId = this.user.orgType === 5 ? this.proOptions[0].pkId : this.putStoreForm.fkBidProjectId;
        if (bidId && this.putStoreForm.fkWarehouseId && this.putStoreForm.fkCustomerId) {
          this.findPurchaseOrderByProjectId(bidId, this.putStoreForm.fkWarehouseId, this.putStoreForm.fkCustomerId, this.putStoreForm.fkPurchaseId, "", false, this.putStoreForm.fkSupplyCustomerId);
        }
      }
    },
    remoteMethod7(query) {
      let bidId = this.user.orgType === 5 ? this.proOptions[0].pkId : this.putStoreForm.fkBidProjectId;
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findPurchaseOrderByProjectId(bidId, this.putStoreForm.fkWarehouseId, this.putStoreForm.fkCustomerId, this.putStoreForm.fkPurchaseId, query, false, this.putStoreForm.fkSupplyCustomerId);
        }, 200);
      } else {
        // 请求初始列表
        this.findPurchaseOrderByProjectId(bidId, this.putStoreForm.fkWarehouseId, this.putStoreForm.fkCustomerId, this.putStoreForm.fkPurchaseId);
      }
    },
    change7(e) {
      this.randomKey2 = Math.random();
      if (!e) {
        this.putStoreForm.fkPurchaseId = e;
        this.putmaterialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
      } else {
        this.putStoreForm.fkPurchaseId = e.pkId;
        this.putmaterialList = e.materialVos.map(item => ({
          materialPrice: item.price,
          stockNum: item.issueNum,
          fkMaterialId: item.pkId,
          materialName: item.materialName,
          fkTypeName: item.fkTypeName,
          fkUnitName: item.fkUnitName,
          supplyNum: item.supplyNum,
          fkCustomerId: item.fkCustomerId,
          passStatus: item.passStatus,
          customerName: item.customerName
        }));
      }
    },
    restoreSelect8(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        this.findOrderApplyByInputId();
      }
    },
    remoteMethod8(query) {
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findOrderApplyByInputId(query);
        }, 200);
      } else {
        // 请求初始列表
        this.findOrderApplyByInputId("");
      }
    },
    change8(e) {
      if (!e) {
      } else {
      }
    },
    restoreSelect9(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        this.findOrderOutApplyBySource();
      }
    },
    remoteMethod9(query) {
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findOrderOutApplyBySource(query);
        }, 200);
      } else {
        // 请求初始列表
        this.findOrderOutApplyBySource(query);
      }
    },
    change9(e) {
      console.log(e);
      if (!e) {
        this.materialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
        this.outStoreForm.fkOutApplyId = e;
      } else {
        this.outStoreForm.fkOutApplyId = e.pkId;
        this.outStoreForm.fkBidProjectId = e.fkBidProjectId;
        this.outStoreForm.projectName = e.projectName;
        this.outStoreForm.fkPurchaseId = e.purchaseId;
        if (this.outStoreForm.issueCode === "delivery_subcontract") {
          this.outStoreForm.fkCustomerId = e.fkCustomerId;
          this.outStoreForm.customerName = e.customName;
        }
        this.fkPurchaseId = { pkId: e.purchaseId, orderCode: e.purchaseOrderCode };
        if (e.pkId) {
          this.findWarehouseByProjectId(e.fkBidProjectId, 2);
          if (this.outStoreForm.fkWarehouseId) {
            this.searchOrderOutApply();
          }
        }
      }
    },
    searchOrderOutApply(isTrue) {
      let data = { outApplyId: this.outStoreForm.fkOutApplyId, fkWarehouseId: this.outStoreForm.fkWarehouseId };
      this.$api.searchOrderOutApply(data).then(res => {
        if (res.code == 200) {
          if (isTrue) {
            this.materialList.forEach(item => {
              res.data.forEach(item2 => {
                if (item.fkMaterialId === item2.pkId) {
                  this.$set(item, "supplyNum", item2.supplyNum);
                  this.$set(item, "applyProvidedNum", item2.applyProvidedNum);
                  this.$set(item, "applyNum", item2.applyNum);
                }
              });
            });
          } else {
            this.materialList = res.data.map(item => ({
              materialPrice: item.price,
              stockNum: "",
              fkMaterialId: item.pkId,
              materialName: item.materialName,
              fkTypeName: item.fkTypeName,
              fkUnitName: item.fkUnitName,
              supplyNum: item.supplyNum,
              fkCustomerId: item.fkCustomerId,
              purchaseNum: item.purchaseNum,
              passStatus: item.passStatus,
              customerName: item.customerName,
              providedNum: item.providedNum,
              applyProvidedNum: item.applyProvidedNum,
              applyNum: item.applyNum,
              passStatus: item.passStatus
            }));
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findOrderOutApplyBySource(orderCode) {
      let data = { pageNum: 1, pageSize: 20, issueCode: this.outStoreForm.issueCode, applyIds: this.outStoreForm.fkOutApplyId, orderCode };
      this.$api
        .findOrderOutApplyBySource(data)
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.supAppList = res.data.map(item => ({ ...item, value: item.pkId, label: item.orderCode }));
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    findOrderApplyByInputId(orderCode) {
      let data = { pageNum: 1, pageSize: 20, inputId: this.putStoreForm.pkId, orderCode, applyIds: this.putAppList.join(",") };
      this.$api
        .findOrderApplyByInputId(data)
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.putApplyList = res.data.map(item => ({ ...item, value: item.pkId, label: item.orderCode }));
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    putSupChange(e) {
      this.putmaterialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
      this.putStoreForm.fkSupplyCustomerId = "";
      if (e) {
        let bidId = this.user.orgType === 5 ? this.proOptions[0].pkId : this.putStoreForm.fkBidProjectId;
        let obj = this.supOptions.filter(item => item.value === e)[0];
        if (this.user.orgType === 5 && obj.supplyCode !== "supply_common") {
          this.subSelShow = true;
          this.supSubOptions = obj.supplyCustoms ? obj.supplyCustoms.map(item => ({ ...item, value: item.pkId, label: item.customName })) : [];
        } else {
          this.subSelShow = false;
        }
        if (bidId && this.putStoreForm.fkWarehouseId && this.putStoreForm.fkCustomerId) {
          this.findPurchaseOrderByProjectId(bidId, this.putStoreForm.fkWarehouseId, this.putStoreForm.fkCustomerId, this.putStoreForm.fkPurchaseId);
        }
      }
    },
    linkSupChange(e) {
      this.putmaterialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "", typeCode: "" }];
      this.fkPurchaseId = "";
      this.putStoreForm.fkPurchaseId = "";
      let obj = this.supSubOptions.filter(item => item.value === e)[0];
      if (obj.relationStatus === 0) {
        this.linksSel = true;
      } else {
        this.linksSel = false;
        this.putStoreForm.receiverStatus = 0;
      }
      if (e) {
        let bidId = this.user.orgType === 5 ? this.proOptions[0].pkId : this.putStoreForm.fkBidProjectId;
        if (bidId && this.putStoreForm.fkWarehouseId && this.putStoreForm.fkCustomerId) {
          this.findPurchaseOrderByProjectId(bidId, this.putStoreForm.fkWarehouseId, this.putStoreForm.fkCustomerId, this.putStoreForm.fkPurchaseId, "", false, e);
        }
      }
    },
    selectIds(id) {
      console.log(id);
      this.outStoreForm.fkItemId = id.join(",");
      this.materialList = [{ fkMaterialId: "", materialPrice: "", stockNum: "", fkCustomerId: "", passStatus: "" }];
      this.fkInputIdList = [];
      this.deliveryDisabled = 0;
      if (this.outStoreForm.fkItemId && this.outStoreForm.fkWarehouseId) {
        this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode);
      }
    },
    selectIds2(id) {
      console.log(id);
      this.putStoreForm.fkItemId = id.join(",");
    },
    // 根据id获取出库单详情
    findOutById(row) {
      this.$api.findOutById({ pkId: row.pkId }).then(res => {
        if (res.code === 200) {
          this.outStoreForm = res.data;
          this.allowModify = res.data.allowModify;
          this.limitNum = res.data.limitNum;
          console.log(res.data.checkStatus !== 1);
          if (this.outStoreDialogType === 4) {
            this.outStoreForm.receiverStatus = 1;
          }
          this.materialList = res.data.orderDetailsList.map(item => ({ ...item, fkUnitName: item.unitName }));
          let arr1 = res.data.orderRelationList.filter(item => item.orderType == 2); //物资申请单
          let arr2 = res.data.orderRelationList.filter(item => item.orderType == 3); // 入库单
          let arr3 = res.data.orderRelationList.filter(item => item.orderType == 1); // 采购计划单
          let arr4 = res.data.orderRelationList.filter(item => item.orderType == 4); // 发料单
          this.fkApplyIdList = arr1;
          this.fkInputIdList = arr2;
          this.fkPurchaseId = arr3.length ? arr3[0] : "";
          this.fkOrdinaryId = arr4.length ? arr4[0] : "";

          if (this.user.orgType === 6 && res.data.issueCode !== "delivery_unit") {
            let arr5 = res.data.orderRelationList.filter(item => item.orderType == 6);
            this.fkOutApplyId = arr5.length ? arr5[0] : { pkId: "" };
            this.outStoreForm.fkOutApplyId = arr5.length ? arr5[0].pkId : "";
          }
          if ([2, 3].includes(this.outStoreDialogType)) {
            if (this.outStoreDialogType === 3) {
              this.findProjectListByType(1, this.outStoreForm.issueCode);
            }
            this.outStoreForm.leaderName = this.user.userName;
            this.fkCustomerId = { pkId: this.outStoreForm.fkCustomerId };
            this.outStoreForm.fkApplyIdList = arr1.length ? arr1.map(item => item.pkId) : [];
            this.outStoreForm.fkInputIdList = arr2.length ? arr2.map(item => item.pkId) : [];
            this.outStoreForm.fkPurchaseId = arr3.length ? arr3[0].pkId : "";
            this.outStoreForm.fkOrdinaryId = arr4.length ? arr4[0].pkId : "";
            // 出库对象编码（delivery_unit：无， delivery_supplier：供应商， delivery_subcontract：分包单位， delivery_project：项目部， delivery_position：施工部位）
            if (["delivery_unit", "delivery_position"].includes(res.data.issueCode)) {
              this.timeShow = true;
            } else {
              this.timeShow = false;
            }
            if (res.data.issueCode === "delivery_position") {
              this.outStoreForm.fkItemId = res.data.orderItemList ? res.data.orderItemList[0].fkItemId : "";
              this.searchItemsByProjectId(this.outStoreForm.fkBidProjectId, 2);
            }
            if ([5, 7].includes(this.user.orgType)) {
              this.findWarehouseByProjectId(this.outStoreForm.fkBidProjectId, 2);
              this.findOrderOrdinaryByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkOrdinaryId, true);
              this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId === "0" ? "" : this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkInputIdList, true);
              if (this.user.orgType === 5) {
                if (res.data.issueCode === "delivery_subcontract") {
                  this.getOrderApply(this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkApplyIdList, this.outStoreForm.fkInputIdList);
                }
              }
            } else if (this.user.orgType === 6) {
              if (res.data.issueCode !== "delivery_unit") {
                this.findOrderOutApplyBySource();
                this.searchOrderOutApply(true);
                // this.findPurchaseOrderByProjectId(this.outStoreForm.fkBidProjectId, this.outStoreForm.fkWarehouseId, this.outStoreForm.fkCustomerId, this.outStoreForm.fkPurchaseId, "", true);
              }
            }
          }

          this.randomKey2 = Math.random();
          this.outStoreDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开出库单弹框
    openOutStoreDialog(type, row) {
      this.outStoreDialogType = type;
      this.selectMaterType = 2;
      if (type === 1) {
        this.outStoreDialogTitle = "查看出库单";
        this.findOutById(row);
      } else if (type === 2) {
        this.outStoreDialogTitle = "新增出库单";
        this.getBusinessCode(7);
        this.findProjectListByType(1, this.outStoreForm.issueCode, true);
        this.outStoreForm.fkWarehouseId = this.warehouseList2.length ? this.warehouseList2[0].pkId : "";

        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        this.outStoreForm.serviceTime = time;
        // this.outStoreForm.receiverTime = time;
        this.outStoreForm.leaderName = this.user.userName;
        this.outStoreDialog = true;
      } else if (type === 3) {
        this.outStoreDialogTitle = "编辑出库单";
        this.findOutById(row);
      } else if (type === 4) {
        this.outStoreDialogTitle = "录入签收信息";
        this.findOutById(row);
      }
    },
    // 客户变更事件
    customChange(e) {
      this.outStoreForm.fkCustomerId = e.pkId;
      if (this.user.orgType === 5) {
        if (e.relationStatus === 0) {
          this.timeShow = true;
        } else {
          this.timeShow = false;
        }
      }
      this.materialIds = [];
      this.fkApplyIdList = [];
      this.outStoreForm.fkApplyIdList = [];
      if (this.user.orgType === 5) {
        if (this.outStoreForm.fkWarehouseId) {
          this.findOrderOrdinaryByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkOrdinaryId);
          this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkInputIdList);
        }
        if (this.outStoreForm.issueCode === "delivery_subcontract") {
          this.getOrderApply(this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkApplyIdList, this.outStoreForm.fkInputIdList);
        }
      }
      if (this.user.orgType === 7) {
        if (this.outStoreForm.fkWarehouseId) {
          this.findOrderInputByWarehouseId(this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode, this.outStoreForm.fkCustomerId, "", this.outStoreForm.fkInputIdList);
        }
      }
      if (this.user.orgType === 6 && this.outStoreForm.fkBidProjectId && this.outStoreForm.fkWarehouseId) {
        this.findPurchaseOrderByProjectId(this.outStoreForm.fkBidProjectId, this.outStoreForm.fkWarehouseId, this.outStoreForm.issueCode === "issue_project" ? "0" : this.outStoreForm.fkCustomerId, this.outStoreForm.fkPurchaseId);
      }
    },
    // 出库弹框确认
    outStoreDialogOk(type) {
      //issueCode （delivery_unit：无， delivery_supplier：供应商， delivery_subcontract：分包单位， delivery_project：项目部， delivery_position：施工部位）
      let materList = this.materialList.filter(item => item.fkMaterialId && item.stockNum > 0);
      if (!materList.length) {
        return this.$message.warning("请录入正确的出库物料和数量");
      }
      for (let i = 0; i < materList.length; i++) {
        if (!materList[i].materialPrice && materList[i].materialPrice != 0) {
          if (this.outStoreForm.issueCode === "delivery_unit" && ![6, 7].includes(this.user.orderType)) {
            if (this.pricePermission) {
              return this.$message.warning("没有查看金额权限");
            }
            if (this.pricePermission2) {
              return this.$message.warning("没有修改金额权限");
            }
          }
          return this.$message.warning("物料单价不能为空");
        }
      }
      let data = { ...this.outStoreForm, inventoryCode: type, isUpdate: this.isUpdate };
      if (!data.orderCode) {
        return this.$message.warning("请填写出库单号");
      }
      if (!data.fkWarehouseId) {
        return this.$message.warning("请选择仓库");
      }
      if (!data.leaderName) {
        return this.$message.warning("请填写负责人");
      }
      if (!data.serviceTime) {
        return this.$message.warning("请选择业务时间");
      }
      if (!data.receiptAddress) {
        return this.$message.warning("请填写收货地址");
      }
      if (this.outStoreDialogType === 2) {
        data.detailListAdd = materList.filter(item => item.stockNum);
      } else if (this.outStoreDialogType === 3) {
        data.detailUpdateList = materList.filter(item => item.stockNum);
      }

      if (this.user.orgType === 5 || (this.user.orgType !== 5 && data.issueCode === "delivery_unit")) {
        delete data.fkBidProjectId;
      } else {
        if (!data.fkBidProjectId) {
          return this.$message.warning("请选择标段项目");
        }
      }
      if (["delivery_supplier", "delivery_subcontract"].includes(data.issueCode) && !data.fkCustomerId) {
        return this.$message.warning("请选择客户");
      }
      if (this.timeShow && data.receiverStatus === 1) {
        if (!data.receiverName) {
          return this.$message.warning("请输入签收人");
        }
        if (!data.receiverTime) {
          return this.$message.warning("请输入签收时间");
        }
      }
      // user.orgType === 6 && outStoreForm.issueCode !== 'delivery_unit'
      // if (data.issueCode !== "delivery_supplier") {
      //   delete data.fkPurchaseId;
      // }
      if (data.issueCode !== "delivery_subcontract") {
        delete data.fkApplyIdList;
      }
      if (data.issueCode !== "delivery_position") {
        delete data.fkItemId;
      } else {
        if (!data.fkItemId) {
          return this.$message.warning("请选择项目部位");
        }
      }
      let comireShow = false;
      let limitList = [];
      if (this.user.orgType === 5) {
        materList.forEach(item => {
          if (item.bool && item.stockNum > item.validNum) {
            comireShow = true;
            limitList.push(item.materialName);
          }
        });
      }
      console.log(data);
      if (comireShow) {
        this.$confirm(`[${limitList.join(",")}]等甲供不扣款材料已超额供应，确认继续供应？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.loading = true;
          if (this.outStoreDialogType === 2) {
            this.$api
              .addOutInventory(data)
              .then(res => {
                this.loading = false;
                if (res.code === 200) {
                  this.$message.success("新增成功");
                  this.searchOutInventoryPage();
                  this.closeOutStoreDialog();
                } else {
                  this.$message.warning(res.msg);
                }
              })
              .catch(err => {
                this.loading = false;
              });
          } else if (this.outStoreDialogType === 3) {
            this.$api
              .updateOutInventory(data)
              .then(res => {
                this.loading = false;
                if (res.code === 200) {
                  this.$message.success("编辑成功");
                  this.searchOutInventoryPage();
                  this.closeOutStoreDialog();
                } else {
                  this.$message.warning(res.msg);
                }
              })
              .catch(err => {
                this.loading = false;
              });
          }
        });
      } else {
        this.loading = true;
        if (this.outStoreDialogType === 2) {
          this.$api
            .addOutInventory(data)
            .then(res => {
              this.loading = false;
              if (res.code === 200) {
                this.$message.success("新增成功");
                this.searchOutInventoryPage();
                this.closeOutStoreDialog();
              } else {
                this.$message.warning(res.msg);
              }
            })
            .catch(err => {
              this.loading = false;
            });
        } else if (this.outStoreDialogType === 3) {
          this.$api
            .updateOutInventory(data)
            .then(res => {
              this.loading = false;
              if (res.code === 200) {
                this.$message.success("编辑成功");
                this.searchOutInventoryPage();
                this.closeOutStoreDialog();
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
    // 录入签收信息
    enterInfo() {
      let data = {
        pkId: this.outStoreForm.pkId,
        receiverStatus: this.outStoreForm.receiverStatus
      };
      if (data.receiverStatus == 1) {
        data.receiverName = this.outStoreForm.receiverName;
        data.receiverTime = this.outStoreForm.receiverTime;
        if (!data.receiverName) {
          return this.$message.warning("请输入签收人");
        }
        if (!data.receiverTime) {
          return this.$message.warning("请输入签收时间");
        }
      }
      this.$api.enterInfo(data).then(res => {
        if (res.code === 200) {
          this.$message.success("录入成功");
          this.searchOutInventoryPage();
          this.closeOutStoreDialog();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 物料表加号事件
    addMater(type) {
      if (type === 1) {
        this.materialList.push({
          fkMaterialId: "",
          materialPrice: "",
          stockNum: "",
          fkCustomerId: "",
          passStatus: ""
        });
        this.$nextTick(() => {
          this.$refs.materialList.bodyWrapper.scrollTop = this.$refs.materialList.bodyWrapper.scrollHeight;
        });
      } else {
        this.putmaterialList.push({
          fkMaterialId: "",
          materialPrice: "",
          stockNum: "",
          fkCustomerId: "",
          passStatus: ""
        });
        this.$nextTick(() => {
          this.$refs.putmaterialList.bodyWrapper.scrollTop = this.$refs.putmaterialList.bodyWrapper.scrollHeight;
        });
      }
    },
    // 物料表减号事件
    delMater(row, index, type) {
      if (type === 1) {
        if (this.materialList.length === 1) {
          this.materialList = [
            {
              fkMaterialId: "",
              materialPrice: "",
              stockNum: "",
              fkCustomerId: "",
              passStatus: ""
            }
          ];
        } else {
          this.materialList.splice(index, 1);
        }
      } else {
        if (this.putmaterialList.length === 1) {
          this.putmaterialList = [
            {
              fkMaterialId: "",
              materialPrice: "",
              stockNum: "",
              fkCustomerId: "",
              passStatus: ""
            }
          ];
        } else {
          this.putmaterialList.splice(index, 1);
        }
      }
    },
    // 选择物料弹框
    selectMater(row) {
      console.log(this.putStoreForm);
      if (this.putStoreForm.issueCode === "issue_supplier" && !this.putStoreForm.fkCustomerId) {
        return this.$message.warning("请选择供应商");
      }
      if (this.putStoreForm.issueCode === "issue_subcontract" && !this.putStoreForm.fkWarehouseId) {
        return this.$message.warning("请选择仓库");
      }
      if (this.putStoreForm.issueCode === "issue_subcontract" && !this.putStoreForm.fkCustomerId) {
        return this.$message.warning("请选择分包单位");
      }
      if (this.putStoreForm.issueCode === "issue_position" && !this.putStoreForm.fkItemId) {
        return this.$message.warning("请选择分项工程");
      }
      if (this.user.orgType === 5 && this.putStoreForm.issueCode === "issue_supplier" && this.subSelShow && !this.putStoreForm.fkSupplyCustomerId) {
        return this.$message.warning("请选择直供分包单位");
      }
      if (this.outStoreForm.issueCode === "delivery_supplier" && !this.outStoreForm.fkCustomerId) {
        return this.$message.warning("请选择供应商");
      }
      if (this.outStoreForm.issueCode === "delivery_subcontract" && !this.outStoreForm.fkCustomerId) {
        return this.$message.warning("请选择分包单位");
      }
      if (this.outStoreDialog && !this.outStoreForm.fkWarehouseId) {
        return this.$message.warning("请选择仓库");
      }
      if (this.outStoreForm.issueCode === "delivery_position" && !this.outStoreForm.fkItemId) {
        return this.$message.warning("请选择分项工程");
      }
      if (this.user.orgType === 6 && this.outStoreForm.issueCode !== "delivery_unit") {
        return this.$message.warning("请选择关联采购计划单");
      }

      // if (this.selectMaterType === 2) {}
      this.nowAddMaterObj = row;
      this.materDialog = true;
    },
    // 在选择物料弹框获取到的物料信息
    getSelect(row) {
      if (this.selectMaterType === 2) {
        if (this.materialList.filter(item => item.fkMaterialId === row.pkId && row.fkCustomerId === item.fkCustomerId && row.passStatus === item.passStatus).length) {
          return this.$message.warning("该物料已经存在出库物料表中");
        }
      } else if (this.selectMaterType === 3) {
        if (this.putmaterialList.filter(item => item.fkMaterialId === row.pkId && row.fkCustomerId === item.fkCustomerId).length) {
          return this.$message.warning("该物料已经存在入库物料表中");
        }
      }
      // this.nowAddMaterObj.fkMaterialId = row.pkId;
      // this.nowAddMaterObj.materialName = row.materialName;
      // this.nowAddMaterObj.fkTypeName = row.fkTypeName;
      // this.nowAddMaterObj.fkUnitName = row.fkUnitName;
      // this.nowAddMaterObj.supplyNum = row.supplyNum;
      // this.nowAddMaterObj.passStatus = row.passStatus;
      // this.nowAddMaterObj.fkCustomerId = row.fkCustomerId;
      // this.nowAddMaterObj.customerName = row.customerName;
      // this.nowAddMaterObj.typeCode = row.typeCode;
      // 不全部set会导致表格样式错乱
      this.$set(this.nowAddMaterObj, "fkMaterialId", row.pkId);
      this.$set(this.nowAddMaterObj, "materialName", row.materialName);
      this.$set(this.nowAddMaterObj, "fkUnitName", row.fkUnitName);
      this.$set(this.nowAddMaterObj, "fkTypeName", row.fkTypeName);
      this.$set(this.nowAddMaterObj, "passStatus", row.passStatus);
      this.$set(this.nowAddMaterObj, "fkCustomerId", row.fkCustomerId);
      this.$set(this.nowAddMaterObj, "customerName", row.customerName);
      if (this.user.orgType === 5 && this.selectMaterType === 2) {
        this.$set(this.nowAddMaterObj, "supplyNum", row.sureNum);
      } else {
        this.$set(this.nowAddMaterObj, "supplyNum", row.supplyNum);
      }
      this.$set(this.nowAddMaterObj, "purchaseNum", row.supplyNum);
      this.$set(this.nowAddMaterObj, "typeCode", row.typeCode);
      this.$set(this.nowAddMaterObj, "stockNum", "");
      this.$set(this.nowAddMaterObj, "materialPrice", row.price);
      if (this.user.orgType === 5 && this.selectMaterType === 2) {
        this.$set(this.nowAddMaterObj, "price", row.price);
        this.$set(this.nowAddMaterObj, "validNum", row.validNum);
        this.$set(this.nowAddMaterObj, "bool", row.bool);
        this.$set(this.nowAddMaterObj, "providedNum", row.providedNum ? row.providedNum : 0);
      }
      // this.randomKey2 = Math.random();
    },
    // 关闭出库弹框
    closeOutStoreDialog() {
      if (this.$refs.treeSelect) {
        this.$refs.treeSelect.clearable();
      }
      this.outStoreDialog = false;
      this.allowModify = 0;
      this.limitNum = 10000;
      this.isUpdate = 0;
      this.outStoreForm = {
        customerName: "",
        driverName: "",
        driverPhone: "",
        fkApplyIdList: [],
        fkBidProjectId: "",
        fkCustomerId: "",
        fkInputIdList: [],
        fkItemId: "",
        fkOrdinaryId: "",
        fkPurchaseId: "",
        fkWarehouseId: "",
        inventoryCode: "",
        issueCode: "delivery_unit",
        leaderName: "",
        orderCode: "",
        remark: "",
        serviceTime: "",
        vehicleNum: "",
        receiverStatus: 0,
        receiptAddress: ""
      };
      this.timeShow = true;
      this.materialList = [
        {
          fkMaterialId: "",
          materialPrice: "",
          stockNum: "",
          fkCustomerId: "",
          passStatus: ""
        }
      ];
      this.deliveryDisabled = 0;
      this.materialIds = [];
      this.fkPurchaseId = "";
      this.fkInputIdList = [];
      this.fkOrdinaryId = "";
      this.fkApplyIdList = [];
      this.fkCustomerId = "";
      this.randomKey2 = Math.random();
      if ([6, 7].includes(this.user.orgType)) {
        // this.searchItemsByProjectId("");
        this.treeData = [];
        this.findWarehouseByProjectId("0", 2);
      }
    },
    // 删除出库单
    outStoreDialogDel(row) {
      this.$confirm("确定删除该出库单?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delOutInventory({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.searchOutInventoryPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    limitMax(row) {
      if (row.stockNum > row.supplyNum) {
        row.stockNum = row.supplyNum;
      }
      if (this.user.orgType === 6 && this.outStoreForm.issueCode != "delivery_unit") {
        let max = row.applyNum - row.applyProvidedNum;
        if (row.stockNum > max) {
          row.stockNum = max;
        }
      }
      if (this.user.orgType === 5) {
        console.log(row.validNum, row.providedNum, row.stockNum);
        if (row.validNum < row.stockNum - 0) {
          row.materialPrice = row.price;
        }
      }
    },
    // 打开入库单
    openPutStoreDialog(type, row) {
      console.log(type, row);
      this.putStoreDialogType = type;
      this.selectMaterType = 3;
      if (type === 1) {
        this.putStoreDialogTitle = "查看入库单";
      } else if (type === 2) {
        this.putStoreDialogTitle = "新增入库单";
        this.getBusinessCode(8);
        this.findProjectListByType(2, this.putStoreForm.issueCode, true);
        this.putStoreForm.fkWarehouseId = this.warehouseList2.length ? this.warehouseList2[0].pkId : "";
        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        this.putStoreForm.serviceTime = time;
        this.putStoreForm.receiverTime = time;
        this.putStoreForm.leaderName = this.user.userName;
        this.putStoreDialog = true;
      } else if (type === 3) {
        this.putStoreDialogTitle = "编辑入库单";
      } else if (type === 4) {
        this.putStoreDialogTitle = "处理入库单";
      } else if (type === 5) {
        this.putStoreDialogTitle = "单据物料入库";
      } else if (type === 6) {
        this.putStoreDialogTitle = "退货";
      } else if (type === 7) {
        this.putStoreDialogTitle = "扫码入库";
        this.maskShow = true;
        this.putStoreDialog = true;
        this.$nextTick(() => {
          this.$refs.scanCode.focus();
        });
      }
      if (![2, 7].includes(type)) {
        this.findInputById(row, type);
      }
    },
    // 入库单按钮事件
    putStoreDialogOk(type) {
      //type 1保存草稿，2确认提交 3拒收，4签收，5签收入库，6入库，7退货
      //issueCode (issue_unit：无， issue_supplier：供应商 ， issue_subcontract：分包单位， issue_project：项目部,issue_position: 施工部位 )
      // 新增、编辑
      if ([2, 3].includes(this.putStoreDialogType)) {
        let materList = this.putmaterialList.filter(item => item.fkMaterialId && item.stockNum > 0);
        if (this.putStoreForm.issueCode === "issue_supplier") {
          materList = materList.map(item => ({ ...item, fkCustomerId: this.putStoreForm.fkCustomerId }));
        }
        if (!materList.length) {
          return this.$message.warning("请录入正确的入库物料和数量");
        }
        for (let i = 0; i < materList.length; i++) {
          if (!materList[i].materialPrice) {
            if (this.putStoreForm.issueCode === "issue_unit" && ![6, 7].includes(this.user.orderType)) {
              if (this.pricePermission) {
                return this.$message.warning("没有查看金额权限");
              }
              if (this.pricePermission2) {
                return this.$message.warning("没有修改金额权限");
              }
            }
            return this.$message.warning("物料单价不能为空");
          }
        }
        let data = { ...this.putStoreForm, inventoryCode: type === 1 ? 0 : 2, isUpdate: this.isUpdate };
        if ([6, 7].includes(this.user.orgType)) {
          data.receiverStatus = 1;
        }
        // if (this.user.orgType === 5 && data.issueCode === "issue_supplier" && this.subSelShow) {
        //   data.receiverStatus = 0;
        // } else {
        //   data.receiverStatus = 1;
        // }
        if (this.user.orgType === 5 && !this.linksSel) {
          data.receiverStatus = 1;
        }
        if (!data.orderCode) {
          return this.$message.warning("请填写入库单号");
        }
        if (!data.fkWarehouseId) {
          return this.$message.warning("请选择仓库");
        }
        if (!data.leaderName) {
          return this.$message.warning("请填写负责人");
        }
        if (!data.receiverName && !this.subSelShow) {
          return this.$message.warning("请填写签收人");
        }
        if (!data.serviceTime) {
          return this.$message.warning("请选择业务时间");
        }
        if (!data.receiverTime) {
          return this.$message.warning("请填写签收时间");
        }
        if (this.putStoreDialogType === 2) {
          data.detailListAdd = materList;
        } else {
          data.detailUpdateList = materList;
        }
        if (this.user.orgType === 5 || (this.user.orgType !== 5 && data.issueCode === "issue_unit")) {
          delete data.fkBidProjectId;
        } else {
          if (!data.fkBidProjectId) {
            return this.$message.warning("请选择标段项目");
          }
        }
        if (!["issue_supplier", "issue_subcontract"].includes(data.issueCode)) {
          delete data.fkCustomerId;
        } else {
          if (!data.fkCustomerId) {
            return this.$message.warning("请选择客户");
          }
        }
        if (data.issueCode !== "issue_unit") {
          delete data.fkInventoryIdList;
        }
        if (data.issueCode !== "issue_supplier") {
          delete data.fkPurchaseId;
        }
        if (data.issueCode !== "issue_position") {
          delete data.fkItemId;
        } else {
          if (!data.fkItemId) {
            return this.$message.warning("请选择标段项目");
          }
        }
        if (this.subSelShow && !data.fkSupplyCustomerId) {
          return this.$message.warning("请选择直供分包单位");
        }
        // if (!data.detailListAdd.length) {
        //   return this.$message.warning("请添加入库物料");
        // }
        if (this.putStoreDialogType === 2) {
          this.$api.addPutInventory(data).then(res => {
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.searchPutInventoryPage();
              this.closePutStoreDialog();
            } else {
              this.$message.warning(res.msg);
            }
          });
        } else if (this.putStoreDialogType === 3) {
          this.$api.updatePutInventory(data).then(res => {
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.searchPutInventoryPage();
              this.closePutStoreDialog();
            } else {
              this.$message.warning(res.msg);
            }
          });
        }
      }

      if ([3, 4, 5].includes(type)) {
        let data = { pkId: this.putStoreForm.pkId, leaderName: this.putStoreForm.leaderName, serviceTime: this.putStoreForm.serviceTime, fkWarehouseId: this.putStoreForm.fkWarehouseId, remark: this.putStoreForm.remark };
        if (type !== 3 && !data.fkWarehouseId) {
          return this.$message.warning("请选择仓库");
        }
        if (!data.leaderName) {
          return this.$message.warning("请填写负责人");
        }
        if (!data.serviceTime) {
          return this.$message.warning("请选择业务时间");
        }
        if (type === 3) {
          data = { ...data, handleStatus: 3, reason: this.reason };
          if (!data.reason) {
            return this.$message.warning("请填写拒收理由");
          }
        } else if (type === 4) {
          data = { ...data, handleStatus: 1 };
        } else if (type === 5) {
          data = { ...data, handleStatus: 2 };
        }
        if (this.user.orgType === 7 && !!this.putStoreForm.applyStatus && [4, 5].includes(type) && this.putStoreForm.issueCode !== "issue_unit") {
          data.fkApplyIdList = this.putAppList;
          if (!data.fkApplyIdList.length) {
            return this.$message.warning("请选择申请单");
          }
        }
        this.loading = true;
        this.$api
          .handlePutInventory(data)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success(type === 3 ? "拒收成功" : type === 4 ? "签收成功" : "签收入库成功");
              this.searchPutInventoryPage();
              this.closePutStoreDialog();
              if (type === 3) {
                this.closeIdeaDialog();
              }
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else if (type === 6) {
        this.loading = true;
        this.$api
          .inputWarehousing({ pkId: this.putStoreForm.pkId })
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("入库成功");
              this.searchPutInventoryPage();
              this.closePutStoreDialog();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    // 扫码入库
    scanCode() {
      this.$api.findInputByOrderCode({ orderCode: this.orderCode }).then(res => {
        if (res.code === 200) {
          if (res.data) {
            console.log("订单号查询详情", res.data);
            this.scanCodeType = res.data.inventoryCode === "1" ? 2 : res.data.inventoryCode === "2" ? 3 : 1;
            this.putStoreForm = res.data;
            this.allowModify = res.data.allowModify;
            this.limitNum = res.data.limitNum;
            if (this.scanCodeType === 2) {
              this.putStoreForm.serviceTime = "";
            }
            this.putmaterialList = res.data.detailsVoList;
            this.findProjectListByType(2, this.putStoreForm.issueCode);
            let arr1 = res.data.orderRelationList.filter(item => item.orderType === 1); //采购单
            let arr2 = res.data.orderRelationList.filter(item => item.orderType === 2); //出库单
            // let arr3 = res.data.orderRelationList.filter(item => item.orderType === 3); //入库单
            this.putStoreForm.fkPurchaseId = arr1.length ? arr1[0].pkId : "";
            this.fkPurchaseId = arr1.length ? arr1[0] : "";
            this.fkInventoryIdList = arr2;
            this.putStoreForm.fkInventoryIdList = arr2.length ? arr2.map(item => item.pkId) : [];
            this.putStoreForm.fkItemId = res.data.orderItemList && res.data.orderItemList.length ? res.data.orderItemList[0].fkItemId : "";
            this.findWarehouseByProjectId(res.data.fkBidProjectId, 2, true);
            this.maskShow = false;
            this.orderCode = "";
          } else {
            this.$message.warning("该入库单不存在");
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    scanCodeBlur() {
      if (this.$refs.scanCode) {
        this.$refs.scanCode.focus();
      }
    },
    // 关闭入库单
    closePutStoreDialog() {
      if (this.$refs.treeSelect2) {
        this.$refs.treeSelect2.clearable();
      }
      this.putStoreDialog = false;
      this.subSelShow = false;
      this.linksSel = false;
      this.putStoreForm = {
        customerName: "",
        billCode: "0",
        fkBidProjectId: "",
        fkCustomerId: "",
        fkItemId: "",
        fkPurchaseId: "",
        fkInventoryIdList: [],
        fkWarehouseId: "",
        inventoryCode: "",
        issueCode: "issue_unit",
        leaderName: "",
        orderCode: "",
        receiverName: "",
        receiverTime: "",
        remark: "",
        serviceTime: "",
        fkSupplyCustomerId: "",
        receiptAddress: "",
        receiverStatus: 0
      };
      this.allowModify = 0;
      this.limitNum = 10000;
      this.isUpdate = 0;
      this.putmaterialList = [
        {
          fkMaterialId: "",
          materialPrice: "",
          stockNum: ""
        }
      ];
      this.radio3 = 1;
      this.fkPurchaseId = "";
      this.fkInputIdList = [];
      this.fkOrdinaryId = "";
      this.fkApplyIdList = [];
      this.fkCustomerId = "";
      this.materialIds = [];
      this.fkInventoryIdList = [];
      this.putApplyList = [];
      this.putAppList = [];
      if ([6, 7].includes(this.user.orgType)) {
        this.findWarehouseByProjectId("0", 2);
      }
      if ([7].includes(this.user.orgType)) {
        // this.searchItemsByProjectId("");
        this.treeData = [];
      }
      this.orderCode = "";
      this.maskShow = false;
    },
    // 入库单删除事件
    putStoreDialogDel(row) {
      this.$confirm("确定删除该入库单?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delPutInventory({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.searchPutInventoryPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 检测
    // detection(row, type) {
    //   this.checkDialogType = type;
    //   if (type === 1) {
    //     this.checkDialogTitle = "检测";
    //     this.getBusinessCode(10);
    //     this.checkForm.fkInventoryId = row.pkId;
    //     let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    //     this.checkForm.serviceTime = time;
    //     this.checkForm.inspectorName = this.user.userName;
    //     this.checkDialog = true;
    //   } else {
    //     this.checkDialogTitle = "检测信息";
    //     this.$api.findInputDetectionInfoById({ pkId: row.pkId }).then(res => {
    //       if (res.code === 200) {
    //         this.checkForm = res.data;
    //         let arr = this.checkForm.fileName ? this.checkForm.fileName.split(",") : [];
    //         let arr2 = this.checkForm.fileUrl ? this.checkForm.fileUrl.split(",") : [];
    //         let arr3 = [];
    //         for (let i = 0; i < arr.length; i++) {
    //           arr3.push({ fileName: arr[i], fileUrl: arr2[i] });
    //         }
    //         this.fileList = arr3;
    //         this.checkDialog = true;
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //     });
    //   }
    // },
    detection(row, type) {
      this.checkMaterDialogType = type;
      this.checkForm.ageTerm = row.ageTerm;
      this.checkForm.publicClassForm = row.orderCode;
      if (type === 1) {
        this.checkMaterDialogTitle = "检测";
        this.getBusinessCode(10);
        this.checkForm.fkInventoryId = row.pkId;
        let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        this.checkForm.serviceTime = time;
        this.checkMaterDialog = true;
        this.findInputById(row.pkId);
      } else {
        this.checkMaterDialogTitle = "检测信息";
        this.checkMaterDialog = true;
        this.testCheckEdit(row.pkId);
      }
    },
    // 查看检测详情接口
    testCheckEdit(id) {
      this.$api.findCheckByInputId({ inputId: id }).then(res => {
        if (res.code == 200) {
          this.dateList = [];
          this.tab = 0;
          // res.data.forEach(item => {
          //   this.dateList.push(item.ageTerm);
          // });
          this.dateList = res.data;
          this.fileList = res.data[0].enclosures.map(item => ({ fileName: item.enclosureName, fileUrl: item.enclosureUrl }));
          this.checkForm.orderCode = res.data[0].orderCode;
          this.checkForm.ageTerm = res.data[0].ageTerm;
          this.checkForm.inspectorName = res.data[0].inspectorName;
          this.checkForm.serviceTime = res.data[0].serviceTime;
          this.checkForm.reports = res.data[0].reports;
          this.checkMaterList = res.data[0].detectionDetails;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeCheckMaterDialog() {
      this.checkMaterDialog = false;
      this.checkForm = { detectionCode: "", fileName: "", fileUrl: "", fkInventoryId: 0, inspectorName: "", orderCode: "", reports: "", serviceTime: "" };
      this.fileList = [];
    },
    tabsClick(index, item) {
      console.log(item);
      this.tab = index;
      this.fileList = item.enclosures.map(item => ({ fileName: item.enclosureName, fileUrl: item.enclosureUrl }));
      this.checkForm.orderCode = item.orderCode;
      this.checkForm.ageTerm = item.ageTerm;
      this.checkForm.inspectorName = item.inspectorName;
      this.checkForm.serviceTime = item.serviceTime;
      this.checkForm.reports = item.reports;
      this.checkMaterList = item.detectionDetails;
    },
    // 检测弹框确认
    checkDialogOk() {
      let fileName = this.fileList.map(item => item.fileName).join(",");
      let fileUrl = this.fileList.map(item => item.fileUrl).join(",");
      let data = { ...this.checkForm, fileName, fileUrl, isUpdate: this.isUpdate };
      this.loading3 = true;
      this.$api
        .checkPutInventory(data)
        .then(res => {
          this.loading3 = false;
          if (res.code === 200) {
            this.$message.success("保存成功");
            this.getPageList();
            this.closeCheckDialog();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading3 = false;
        });
    },
    closeCheckDialog() {
      this.checkDialog = false;
      this.checkForm = { detectionCode: "", fileName: "", fileUrl: "", fkInventoryId: 0, inspectorName: "", orderCode: "", reports: "", serviceTime: "" };
      this.fileList = [];
      this.allowModify = 0;
      this.limitNum = 10000;
      this.isUpdate = 0;
    },
    delFile(index) {
      this.fileList.splice(index, 1);
    },
    // 打开意见弹框
    openIdeaDialog(type) {
      this.ideaDialogType = type;
      this.ideaDialog = true;
    },
    // 关闭意见弹框
    closeIdeaDialog() {
      this.ideaDialog = false;
      this.reason = "";
    },
    // 意见弹框确认按钮
    ideaDialogOk() {
      if (this.ideaDialogType === 1) {
        this.putStoreDialogOk(3);
      } else {
        this.putStoreDialogOk(7);
      }
    },
    // 退货按钮
    returnBtn(row) {
      if ([3, 4].includes(row.interfaceType)) {
        this.subReturnForm.inputId = row.pkId;
      }
      this.openReturnDialog(row);
      return;
      if (row.interfaceType === 1) {
        this.openReturnDialog(row);
      } else if (row.interfaceType === 2) {
        this.openReturnDialog(row);
      } else if (row.interfaceType === 3) {
        this.openReturnDialog(row);
      }
    },
    openReturnDialog(row) {
      this.putStoreDialogType = 6;
      this.findInputById(row, 6);
    },
    returnDialogOk() {
      // 未入库时(项目部和分包单位公用)：1，入库单退货-项目部已入库通用退货版:2,分包单位已入库退货：3
      if (this.interfaceType === 1) {
        let data = { pkId: this.putStoreForm.pkId, receiptAddress: this.subReturnForm.receiptAddress };
        if (this.user.orgType === 5) {
          data = { ...data, serviceTime: this.subReturnForm.serviceTime };
          if (!data.serviceTime) {
            return this.$message.warning("请填写退货时间");
          }
        }
        if (this.user.orgType === 7) {
          data = {
            ...data,
            driverName: this.subReturnForm.driverName,
            driverPhone: this.subReturnForm.driverPhone,
            vehicleNum: this.subReturnForm.vehicleNum
          };
          if (!data.driverName) {
            return this.$message.warning("请填写司机名称");
          }
          if (!data.driverPhone) {
            return this.$message.warning("请填写司机联系方式");
          }
          if (!data.vehicleNum) {
            return this.$message.warning("请填写车牌号");
          }
          if (this.putStoreForm.signStatus) {
            data.receiverName = this.subReturnForm.receiverName;
            data.receiverTime = this.subReturnForm.receiverTime;
            if (!data.receiverName) {
              return this.$message.warning("请填写签收人");
            }
            if (!data.receiverTime) {
              return this.$message.warning("请填写签收时间");
            }
          }
        }
        console.log(data);
        this.$api.retreatPutInventoryNoOut(data).then(res => {
          if (res.code === 200) {
            this.$message.success("退货成功");
            this.searchPutInventoryPage();
            this.closeReturnDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else if (this.interfaceType === 2) {
        let data = {
          detailInputAddList: this.returnMaterialList.map(item => ({ fkDetailsId: item.pkId, retreatNum: item.retreatNum })).filter(item => item.retreatNum > 0),
          detailOutAddList: this.afterMaterialList.map(item => ({ fkDetailsId: item.pkId, retreatNum: item.retreatNum })).filter(item => item.retreatNum > 0),
          orderCode: this.subReturnForm.orderCode,
          leaderName: this.subReturnForm.leaderName,
          serviceTime: this.subReturnForm.serviceTime,
          driverName: this.subReturnForm.driverName,
          driverPhone: this.subReturnForm.driverPhone,
          vehicleNum: this.subReturnForm.vehicleNum,
          remark: this.subReturnForm.remark,
          isUpdate: this.isUpdate,
          receiptAddress: this.subReturnForm.receiptAddress,
          receiverStatus: this.subReturnForm.receiverStatus
        };
        if (this.putStoreForm.showTabStatus === 0) {
          delete data.detailOutAddList;
        } else if (this.putStoreForm.showTabStatus === 1) {
          delete data.detailInputAddList;
        }
        if (this.putStoreForm.showTabStatus !== 1) {
          if (!data.leaderName) {
            return this.$message.warning("请填写负责人");
          }
          if (!data.serviceTime) {
            return this.$message.warning("请填写退货时间");
          }
          if (!data.driverName) {
            return this.$message.warning("请填写司机名称");
          }
          if (!data.driverPhone) {
            return this.$message.warning("请填写司机联系方式");
          }
          if (!data.vehicleNum) {
            return this.$message.warning("请填写车牌号");
          }
        }
        if (this.putStoreForm.signStatus && this.putStoreForm.showTabStatus !== 1) {
          data.receiverName = this.subReturnForm.receiverName;
          data.receiverTime = this.subReturnForm.receiverTime;
          if (!data.receiverStatus) {
            return this.$message.warning("请选择签收状态");
          } else {
            if (!data.receiverName) {
              return this.$message.warning("请填写签收人");
            }
            if (!data.receiverTime) {
              return this.$message.warning("请填写签收时间");
            }
          }
        }
        if (this.putStoreForm.showTabStatus === 1) {
          data = { detailOutAddList: data.detailOutAddList, receiptAddress: data.receiptAddress };
        }
        // if (this.user.orgType === 5) {
        //   data.detailOutAddList = this.afterMaterialList.map(item => ({ fkDetailsId: item.pkId, retreatNum: item.retreatNum })).filter(item => item.retreatNum > 0);
        // } else {
        // }
        this.$api.retreatPutInventoryPro(data).then(res => {
          if (res.code === 200) {
            this.$message.success("退货成功");
            this.getPageList();
            this.closeReturnDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else if (this.interfaceType === 3) {
        let { driverName, driverPhone, inputId, leaderName, orderCode, receiverName, receiverTime, remark, serviceTime, vehicleNum, receiptAddress } = this.subReturnForm;
        if (!orderCode) {
          return this.$message.warning("请填写出库编号");
        }
        if (!leaderName) {
          return this.$message.warning("请填写负责人");
        }
        if (!serviceTime) {
          return this.$message.warning("请填写退货时间");
        }
        if (!driverPhone) {
          return this.$message.warning("请填写司机联系方式");
        }
        if (!driverName) {
          return this.$message.warning("请填写司机名称");
        }
        if (!vehicleNum) {
          return this.$message.warning("请填写车牌号");
        }
        let data = { detailListAdd: this.returnMaterialList.map(item => ({ fkDetailsId: item.pkId, retreatNum: item.retreatNum })), driverName, driverPhone, inputId, leaderName, orderCode, remark, serviceTime, vehicleNum, isUpdate: this.isUpdate, receiptAddress };
        if (this.putStoreForm.signStatus) {
          data.receiverName = receiverName;
          data.receiverTime = receiverTime;
          if (!receiverName) {
            return this.$message.warning("请填写签收人");
          }
          if (!receiverTime) {
            return this.$message.warning("请填写签收时间");
          }
        }
        this.$api.retreatPutInventorySub(data).then(res => {
          if (res.code === 200) {
            this.$message.success("退货成功");
            this.getPageList();
            this.closeReturnDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else if (this.interfaceType === 4) {
        let { driverName, driverPhone, inputId, receiverName, receiverTime, vehicleNum, receiptAddress } = this.subReturnForm;
        if (!driverPhone) {
          return this.$message.warning("请填写司机联系方式");
        }
        if (!driverName) {
          return this.$message.warning("请填写司机名称");
        }
        if (!vehicleNum) {
          return this.$message.warning("请填写车牌号");
        }
        let data = { driverName, driverPhone, pkId: inputId, vehicleNum, receiptAddress };
        if (this.putStoreForm.signStatus) {
          data.receiverName = receiverName;
          data.receiverTime = receiverTime;
          if (!receiverName) {
            return this.$message.warning("请填写签收人");
          }
          if (!receiverTime) {
            return this.$message.warning("请填写签收时间");
          }
        }
        this.$api.retreatPutInventoryNoInput(data).then(res => {
          if (res.code === 200) {
            this.$message.success("退货成功");
            this.getPageList();
            this.closeReturnDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeReturnDialog() {
      this.returnDialog = false;
      this.putStoreForm = {
        customerName: "",
        billCode: "0",
        fkBidProjectId: "",
        fkCustomerId: "",
        fkItemId: "",
        fkPurchaseId: "",
        fkInventoryIdList: [],
        fkWarehouseId: "",
        inventoryCode: "",
        issueCode: "issue_unit",
        leaderName: "",
        orderCode: "",
        receiverName: "",
        receiverTime: "",
        remark: "",
        serviceTime: "",
        fkSupplyCustomerId: "",
        receiptAddress: "",
        receiverStatus: 0
      };
      this.subReturnForm = {
        driverName: "",
        driverPhone: "",
        inputId: "",
        leaderName: "",
        orderCode: "",
        remark: "",
        serviceTime: "",
        vehicleNum: "",
        receiverName: "",
        receiverTime: ""
      };
      this.allowModify = 0;
      this.limitNum = 10000;
      this.isUpdate = 0;
      this.radio2 = 1;
      this.returnMaterialList = [];
      this.afterMaterialList = [];
    },
    numChange(e, row, type) {
      if (type === 1) {
        if (this.interfaceType === 2 && this.putStoreForm.showTabStatus === 2) {
          if (row.retreatNum > row.marginNum) {
            row.retreatNum = row.marginNum;
          }
        } else {
          if (row.retreatNum > row.stockNum) {
            row.retreatNum = row.stockNum;
          }
        }
      } else if (type === 2) {
        if (row.retreatNum > row.stockNum) {
          row.retreatNum = row.stockNum;
        }
      }
    },
    orderClick(item, type) {
      if (type == 2 && item.isQuery === 0) {
        return;
      }
      // type 1出库单，2入库单 3退货的关联单据
      //orderType 1申请单；2采购单，3：发料单，4出库单，5入库单，6盘点单
      console.log(item);
      if (type === 1) {
        //item.orderType 采购单：1，申请单：2，入库单：3，发料单：4，盘点单：5
        this.orderType = item.orderType === 1 ? 2 : item.orderType === 2 ? 1 : item.orderType === 3 ? 5 : item.orderType === 4 ? 3 : item.orderType === 5 ? 6 : 7;
        this.orderPkId = item.pkId;
      } else if (type === 2) {
        //item.orderType 采购单：1，出库单：2，盘点单：3
        this.orderType = item.orderType === 1 ? 2 : item.orderType === 2 ? 4 : 6;
        this.orderPkId = item.pkId;
      } else if (type === 3) {
        this.orderType = 4;
        this.orderPkId = item.fkOutId;
      } else if (type === 4) {
        // 123
        this.orderType = 4;
        this.orderPkId = item.bizId;
      }
      this.checkOrderDialog = true;
    },
    orderChange() {
      this.isUpdate = 1;
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.getPageList();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.getPageList();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.getPageList();
    },
    // 获取分页
    getPageList() {
      if (this.radio === 1) {
        this.searchOutInventoryPage();
      } else if (this.radio === 2) {
        this.searchPutInventoryPage();
      }
    },
    // 清空搜索栏
    cleanSearchData() {
      this.inpData = { beginTime: "", endTime: "", orderCode: "", fkWarehouseId: "", fkBidProjectId: "", inventoryCode: "", detectionStatus: "" };
      this.searchData = { beginTime: "", endTime: "", orderCode: "", fkWarehouseId: "", fkBidProjectId: "", inventoryCode: "", detectionStatus: "" };
      this.page = { pageSize: 10, pageNum: 1 };
    },
    maxPrice(e, row) {
      row.materialPrice = this.$limitInputNumber(e, 999999999999.99, 0, 2);
      // if (e >= 999999999999.99) {
      //   row.materialPrice = 999999999999.99;
      // }
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
    // 下载
    download(item) {
      let exit = item.fileUrl.substring(item.fileUrl.lastIndexOf(".") + 1);
      this.fileLinkToStreamDownload(item.fileUrl, item.fileName, exit);
    },
    fileLinkToStreamDownload(url, fileName, type) {
      let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/;
      if (!reg.test(url)) {
        throw new Error("传入参数不合法,不是标准的文件链接");
      } else {
        let xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.setRequestHeader("Content-Type", `application/${type}`);
        xhr.responseType = "blob";
        xhr.onload = function() {
          if (this.status == 200) {
            //接受二进制文件流
            // console.log(this);
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
  padding: 0 20px;
  margin-bottom: 5px;
  .myform {
    width: 85%;
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
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.dashedDiv {
  position: relative;
  width: 100%;
  padding: 20px 10px;
  border: 1px dashed #c0ccda;
  .title {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
  }
}
.tac {
  text-align: center;
}
.h-200 {
  height: 200px;
}
.h-300 {
  height: 300px;
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
.tree-box {
  // position: absolute;
  width: 100%;
  // top: 5px;
  font-size: 12px;
  height: 28px;
  line-height: 28px;
  padding-left: 15px;
  overflow-x: auto;
  border: 1px solid #e4e7ed;
  background-color: #f5f7fa;
  color: #c0c4cc;
  border-radius: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.fileList {
  display: flex;
  flex-wrap: wrap;
  .fileList-item {
    display: flex;
    align-items: center;
    width: 50%;
    .fileName {
      width: 300px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .delBtn {
      cursor: pointer;
      color: red;
      margin-right: 10px;
    }
  }
}
.dialog-forms {
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
    /deep/ .el-tree {
      .label {
        display: block;
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
.mb-10 {
  margin-bottom: 10px;
}
.mt-10 {
  margin-top: 10px;
}
.blue {
  color: #02aff4;
  cursor: pointer;
}
.putStoreDialog {
  // width: 100%;
  height: 100%;
  position: relative;
  .scan {
    position: absolute;
    right: 50px;
    top: -40px;
    width: 30px;
    height: 30px;
    z-index: 1;
    cursor: pointer;
  }
}
.mask {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 6;
  background-color: #fff;
  .mask-item {
    padding: 50px;
    background-color: #f2f2f2;
    text-align: center;
  }
  img {
    width: 200px;
    height: 200px;
  }
}
.h-500 {
  height: 500px;
}
.wh-300 {
  width: 300px;
}
.bd {
  border: 1px solid #000;
}
/deep/ .inputRed {
  .el-input__inner {
    color: red;
  }
}
.tabs {
  display: flex;
  width: 100%;
  height: 40px;
  border-bottom: 1px solid #c0c4cc;
  overflow: hidden;
  .tabs-item {
    position: relative;
    min-width: 80px;
    padding: 0 10px;
    height: 100%;
    line-height: 40px;
    text-align: center;
    cursor: pointer;
    border: 1px solid #c0c4cc;
    border-bottom: none;
    .icons {
      position: absolute;
      right: 3px;
      bottom: 2px;
      font-weight: 700;
    }
    .el-icon-check {
      color: green;
    }
    .el-icon-close {
      color: red;
    }
  }
  .nobd {
    border-right: none;
  }
  .clicknow {
    background-color: #409eff;
    color: #fff;
    transition: 0.3s;
  }
}
.h-28 {
  display: flex;
  align-items: center;
  height: 28px;
}
.outContent {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 520px;
}
</style>
