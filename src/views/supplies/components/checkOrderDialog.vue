<template>
  <div class="content">
    <el-dialog :title="title" v-if="orderTypes < 6" :visible="checkOrderDialog" top="5vw" width="60%" @close="closeDialog" v-loading="loading" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div v-if="orderTypes === 1" class="dialog-form">
        <el-radio-group v-model="isCollapse" size="mini" v-if="form1.applyCode == '已完成' || form1.applyCode == '已确认'">
          <el-radio-button :label="0">基本信息</el-radio-button>
          <el-radio-button :label="1" v-if="user.orgType != 7">关联出库单</el-radio-button>
          <el-radio-button :label="2">关联入库单</el-radio-button>
        </el-radio-group>
        <div :class="user.orgType == 7 ? 'tab-one' : ''" v-show="isCollapse == 0">
          <el-form class="row-height">
            <el-row :span="24" class="el-row-data">
              <el-col :span="8">
                <el-form-item label="申请单号" prop="orderCode" label-width="110px">
                  <el-input v-model="form1.orderCode" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType != 5">
                <el-form-item label="标段项目" prop="fkBidProjectId" label-width="110px">
                  <el-input v-model="form1.projectName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType == 4 || user.orgType == 5">
                <el-form-item label="分包单位" label-width="110px">
                  <el-input v-model="form1.customName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="填表人" label-width="110px" prop="leaderName">
                  <el-input v-model="form1.createUserName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="业务时间" label-width="110px" prop="serviceTime">
                  <el-date-picker size="mini" class="time-wh" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" v-model="form1.serviceTime" disabled></el-date-picker>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="8">
                <el-form-item label="制单人" label-width="110px">
                  <el-input v-model="form1.createUserName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col> -->
              <el-col :span="8">
                <el-form-item label="录入时间" label-width="110px">
                  <el-input v-model="form1.createTime" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="关联项目" prop="associationItems" label-width="110px">
                  <el-tooltip class="item" effect="light" placement="bottom-start">
                    <div slot="content">
                      <div>{{ associationItems2 }}</div>
                    </div>
                    <div class="tree-box">
                      <span>{{ associationItems2 }}，</span>
                    </div>
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单据状态" label-width="110px">
                  <el-input v-model="form1.applyCode" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label-width="110px">
                  <label slot="label">备&emsp;&emsp;注</label>
                  <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" v-model="form1.remark" maxlength="500" class="wh" disabled> </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <div class="affirm" v-if="form1.applyCode == '已驳回'">
                  <div class="person">
                    驳回人: {{ form1.confirmUserName }}
                    <div>驳回时间: {{ form1.reasonTime }}</div>
                  </div>
                  <div>驳回原因：{{ form1.reason }}</div>
                </div>
                <div class="affirm" v-if="form1.applyCode == '已确认'">
                  <div class="person">
                    确认人: {{ form1.confirmUserName }}
                    <div>确认时间: {{ form1.confirmTime }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-form>
          <h3 class="material">物料信息</h3>
          <div class="h-200 table-data">
            <el-table :data="accessoryList" height="100%" style="width: 100%" class="table1" stripe :header-cell-style="{ background: '#f1f6ff' }" :key="random">
              <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
              <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
              <el-table-column label="物料分类" align="center" prop="materialTypeName"> </el-table-column>
              <el-table-column label="单位" width="60" align="center" prop="unitName"> </el-table-column>
              <el-table-column label="申请数量" align="center" prop="applyNum" width="150"> </el-table-column>
              <el-table-column label="收货数量" align="center" prop="applyNum" v-if="user.orgType == 5 && form1.applyCode != '待确认'"> </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </div>
        <!-- tab 1 出入库单子 -->
        <div class="tab-two h-500 table-data" v-show="isCollapse == 1">
          <el-table :data="tableBills2" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column prop="date" label="序号" width="60" align="center">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orderCode" label="出库单据" align="center"> </el-table-column>
            <el-table-column prop="createTime" label="单据日期" align="center"> </el-table-column>
            <el-table-column prop="warehouseName" label="出库仓库" align="center"> </el-table-column>
            <el-table-column prop="receiverName" label="出库人" align="center"> </el-table-column>
            <el-table-column prop="receiverTime" label="出库时间" align="center"> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <div class="tab-two h-500 table-data" v-show="isCollapse == 2">
          <el-table :data="tableBills" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column prop="date" label="序号" width="60" align="center">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orderCode" label="入库单据" align="center"> </el-table-column>
            <el-table-column prop="createTime" label="单据日期" align="center"> </el-table-column>
            <el-table-column prop="warehouseName" label="入库仓库" align="center"> </el-table-column>
            <el-table-column prop="receiverName" label="签收人" align="center"> </el-table-column>
            <el-table-column prop="receiverTime" label="签收时间" align="center"> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
      <div v-if="orderTypes === 2" class="dialog-form">
        <el-radio-group v-model="isCollapse" size="mini">
          <el-radio-button :label="0">基本信息</el-radio-button>
          <el-radio-button :label="1">{{ user.orgType === 6 ? "关联出库单" : "关联入库单" }}</el-radio-button>
        </el-radio-group>
        <div class="tab-two" v-show="isCollapse == 0">
          <el-form class="row-height">
            <el-row :span="24" class="el-row-data">
              <el-col :span="8">
                <el-form-item label="采购计划单号" prop="orderCode" label-width="120px">
                  <el-input v-model="form2.orderCode" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType == 4">
                <el-form-item label="标段项目" prop="orderCode" label-width="120px">
                  <el-input v-model="form2.projectBidName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="供应商" prop="fkCustomerId" label-width="110px">
                  <el-input v-model="form2.customerName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="关联物资申请单" label-width="140px">
                  <el-tooltip class="item" effect="light" placement="bottom-start">
                    <div slot="content">
                      <div>{{ form2.rePurchaseApplies }}</div>
                    </div>
                    <div class="tree-box">
                      <span>{{ form2.rePurchaseApplies }}</span>
                    </div>
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="填表人" prop="leaderName" label-width="120px">
                  <el-input v-model="form2.createUserName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="业务时间" label-width="110px">
                  <el-date-picker size="mini" class="time-wh" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" v-model="form2.serviceTime" disabled></el-date-picker>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="8">
                <el-form-item label="制单人" label-width="140px">
                  <el-input v-model="form2.createUserName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col> -->
              <el-col :span="8">
                <el-form-item label="单据时间" label-width="120px">
                  <el-input v-model="form2.createTime" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单据状态" label-width="110px">
                  <el-input v-model="form2.purchaseCodeName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label-width="120px">
                  <label slot="label">备&emsp;&emsp;注</label>
                  <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" v-model="form2.remark" maxlength="500" class="wh" disabled> </el-input>
                </el-form-item>
              </el-col>
              <!-- 确认查看 -->
              <el-col :span="24" v-if="form2.purchaseCodeName == '已确认'">
                <div class="affirm">
                  <div>确认人:&nbsp; {{ form2.confirmUserName }}</div>
                  <div>确认时间:&nbsp; {{ form2.confirmTime }}</div>
                </div>
              </el-col>
              <!-- 驳回查看 -->
              <el-col :span="24" v-if="form2.purchaseCodeName == '已驳回'">
                <div class="affirm">
                  <div>
                    驳回人:&nbsp; {{ form2.confirmUserName }}
                    <div style="margin-top: 10px;">驳回原因:&nbsp; {{ form2.reason }}</div>
                  </div>
                  <div>驳回时间:&nbsp; {{ form2.reasonTime }}</div>
                </div>
              </el-col>
            </el-row>
          </el-form>
          <h3 class="material">物料信息</h3>
          <div class="h-200 table-data">
            <el-table :data="accessoryList" height="100%" style="width: 100%" class="table1" stripe :header-cell-style="{ background: '#f1f6ff' }" :key="random">
              <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
              <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
              <el-table-column label="物料分类" align="center" prop="materialTypeName"> </el-table-column>
              <el-table-column label="单位" width="80" align="center" prop="unitName"> </el-table-column>
              <el-table-column label="需求数量" align="center" prop="purchaseNum" width="150"> </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </div>
        <div class="tab-two h-500 table-data" v-show="isCollapse == 1">
          <el-table :data="user.orgType === 6 ? tableBills2 : tableBills" border height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column prop="date" label="序号" width="60" align="center">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orderCode" :label="user.orgType === 6 ? '出库单据' : '入库单据'" align="center">
              <template slot-scope="{ row }">
                <span class="blue" @click="orderClick(row, user.orgType === 6 ? 4 : 5)">{{ row.orderCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="单据日期" align="center"> </el-table-column>
            <el-table-column prop="warehouseName" :label="user.orgType === 6 ? '出库仓库' : '入库仓库'" align="center"> </el-table-column>
            <el-table-column prop="inventoryCode" label="出库状态" align="center" v-if="user.orgType === 6"> </el-table-column>
            <el-table-column prop="receiverName" label="签收人" align="center"> </el-table-column>
            <el-table-column prop="receiverTime" label="签收时间" align="center"> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
      <div v-if="orderTypes === 3" class="dialog-form">
        <el-form ref="form" class="row-height">
          <el-row :span="24" class="el-row-data">
            <el-col :span="8">
              <el-form-item label="发料单号" prop="orderCode" label-width="110px">
                <el-input v-model="form3.orderCode" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="出库对象" prop="typeCode" label-width="110px">
                <el-input v-model="form3.typeCodeName" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="stockLabel" prop="fkCustomerId" label-width="110px" v-if="form3.typeCode == 'delivery_supplier' || form3.typeCode == 'delivery_subcontract'">
                <el-input v-model="form3.customerName" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="出库仓库" prop="fkWarehouseId" label-width="110px">
                <el-input v-model="form3.fkWarehouseName" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="填表人" prop="leaderName" label-width="110px">
                <el-input v-model="form3.createUserName" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="业务时间" prop="serviceTime" label-width="110px">
                <el-date-picker size="mini" type="datetime" style="width:100%" disabled class="wh" value-format="yyyy-MM-dd HH:mm:ss" v-model="form3.serviceTime"></el-date-picker>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="8">
              <el-form-item label="制单人" label-width="110px">
                <el-input v-model="form3.createUserName" size="mini" disabled></el-input>
              </el-form-item>
            </el-col> -->
            <el-col :span="8">
              <el-form-item label="录入时间" label-width="110px">
                <el-input v-model="form3.createTime" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单据金额" label-width="110px">
                <el-input v-model="form3.totalAmount" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="关联入库单" prop="warehousingIds" label-width="110px">
                <el-tooltip class="item" effect="light" placement="bottom-start">
                  <div slot="content">
                    <div>{{ form3.warehousingName }}</div>
                  </div>
                  <div class="tree-box">
                    <span>{{ form3.warehousingName }}</span>
                  </div>
                </el-tooltip>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单据状态" label-width="110px">
                <el-select size="mini" v-model="form3.issueCode" class="wh" disabled style="width:100%">
                  <el-option label="草稿" value="0"></el-option>
                  <el-option label="待出库" value="1"></el-option>
                  <el-option label="部分出库" value="2"></el-option>
                  <el-option label="已终止" value="3"></el-option>
                  <el-option label="已完成" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="关联申请单" prop="applyIds" label-width="110px" v-if="form3.typeCode == 'delivery_subcontract'">
                <el-tooltip class="item" effect="light" placement="bottom-start">
                  <div slot="content">
                    <div>{{ form3.applyName }}</div>
                  </div>
                  <div class="tree-box">
                    <span>{{ form3.applyName }}</span>
                  </div>
                </el-tooltip>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label-width="110px">
                <label slot="label">备&emsp;&emsp;注</label>
                <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" v-model="form3.content" maxlength="500" class="wh" disabled> </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <h3 class="material">物料信息</h3>
        <div class="h-200 table-data">
          <el-table :data="accessoryList" height="100%" style="width: 100%" class="table1" stripe :header-cell-style="{ background: '#f1f6ff' }" :key="random">
            <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
            <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
            <el-table-column label="物料分类" align="center" prop="materialTypeName"> </el-table-column>
            <el-table-column label="检测状态" align="center">
              <template slot-scope="{ row }">
                <span v-if="row.passStatus == 0">合格</span>
                <span v-if="row.passStatus == 1">不合格</span>
                <span v-if="row.passStatus == 2">待检测</span>
              </template>
            </el-table-column>
            <el-table-column label="供应商" align="center" prop="customerName"> </el-table-column>
            <el-table-column label="单位" width="80" align="center" prop="unitName"> </el-table-column>
            <el-table-column label="需出库数量" width="120px" align="center" prop="grantNum"> </el-table-column>
            <el-table-column label="物料单价" width="120px" align="center" prop="materialPrice" v-if="pricePermission"> </el-table-column>
            <el-table-column label="金额" align="center" v-if="pricePermission">
              <template slot-scope="{ row }">
                <span v-if="row.materialPrice == undefined || row.grantNum == undefined"></span>
                <span v-else>{{ (row.grantNum * row.materialPrice).toFixed(2) }}</span>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
      <div v-if="orderTypes === 4" class="dialog-form">
        <el-row :span="24" class="el-row-data dialog-forms">
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库单号</div>
            <div class="content"><el-input v-model="outStoreForm.orderCode" size="mini" disabled></el-input></div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库对象</div>
            <div class="content">
              <el-input v-model="outIsscodeList[outStoreForm.issueCode]" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="outStoreForm.issueCode && outStoreForm.issueCode !== 'delivery_unit' && [6, 7].includes(user.orgType)">
            <div class="labels">标段项目</div>
            <div class="content">
              <el-input v-model="outStoreForm.projectName" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">出库仓库</div>
            <div class="content">
              <el-input v-model="outStoreForm.warehouseName" size="mini" disabled></el-input>
            </div>
          </el-col>

          <el-col :span="8" v-if="outStoreForm.issueCode === 'delivery_subcontract'" class="dialog-form-item mb-10">
            <div class="labels">分包单位</div>
            <div class="content">
              <el-input v-model="outStoreForm.customerName" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" v-if="outStoreForm.issueCode === 'delivery_supplier'" class="dialog-form-item mb-10">
            <div class="labels">供应商</div>
            <div class="content">
              <el-input v-model="outStoreForm.customerName" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="outStoreForm.issueCode === 'delivery_position'">
            <div class="labels">分项工程</div>
            <div class="content">
              <el-input :value="outStoreForm.orderItemList && outStoreForm.orderItemList.length ? outStoreForm.orderItemList[0].itemName : ''" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="[4, 5].includes(user.orgType)">
            <div class="labels">关联发料单</div>
            <div class="content">
              <el-input :value="!fkOrdinaryId ? '无' : fkOrdinaryId.orderCode" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="user.orgType === 6 && outStoreForm.issueCode !== 'delivery_unit'">
            <div class="labels w-110">关联采购计划单</div>
            <div class="content">
              <el-input :value="fkPurchaseId.orderCode ? fkPurchaseId.orderCode : '无'" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10" v-if="user.orgType === 7">
            <div class="labels">关联入库单</div>
            <div class="content">
              <el-input :title="fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(',') : '无'" :value="fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(',') : '无'" size="mini" disabled></el-input>
            </div>
          </el-col>

          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">填表人</div>
            <div class="content">
              <el-input v-model="outStoreForm.createUserName" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="16" class="dialog-form-item mb-10" v-if="[4, 5].includes(user.orgType)">
            <div class="labels">关联入库单</div>
            <div class="content">
              <el-input :title="fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(',') : '无'" :value="fkInputIdList.length ? fkInputIdList.map(item => item.orderCode).join(',') : '无'" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">业务时间</div>
            <div class="content">
              <el-date-picker size="mini" type="datetime" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="outStoreForm.serviceTime" disabled></el-date-picker>
            </div>
          </el-col>
          <el-col :span="16" class="dialog-form-item mb-10" v-if="[4, 5].includes(user.orgType) && outStoreForm.issueCode === 'delivery_subcontract'">
            <div class="labels">关联申请单</div>
            <div class="content">
              <el-input :title="fkApplyIdList.length ? fkApplyIdList.map(item => item.orderCode).join(',') : '无'" :value="fkApplyIdList.length ? fkApplyIdList.map(item => item.orderCode).join(',') : '无'" size="mini" disabled></el-input>
            </div>
          </el-col>
          <!-- <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">制单人</div>
            <div class="content">
              <el-input v-model="outStoreForm.createUserName" size="mini" disabled></el-input>
            </div>
          </el-col> -->
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">录入时间</div>
            <div class="content">
              <el-input v-model="outStoreForm.createTime" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">单据状态</div>
            <div class="content">
              <el-input v-model="outStatesList[outStoreForm.inventoryCode]" size="mini" disabled></el-input>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="labels">备注</div>
            <div class="content">
              <el-input v-model="outStoreForm.remark" type="textarea" :rows="4" resize="none" size="mini" disabled></el-input>
            </div>
          </el-col>
          <div class="dashedDiv mb-10">
            <div class="title">运输信息</div>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">车牌号</div>
              <div class="content">
                <el-input v-model="outStoreForm.vehicleNum" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">运输司机</div>
              <div class="content">
                <el-input v-model="outStoreForm.driverName" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item">
              <div class="labels">联系方式</div>
              <div class="content">
                <el-input v-model="outStoreForm.driverPhone" size="mini" disabled></el-input>
              </div>
            </el-col>
          </div>
          <div class="dashedDiv mb-10" v-if="outStoreForm.inventoryCode > 1">
            <el-col :span="12" class="dialog-form-item" v-show="outStoreForm.inventoryCode == 3">
              <div class="labels">签收人</div>
              <div class="content">{{ outStoreForm.receiverName }}</div>
            </el-col>
            <el-col :span="12" class="dialog-form-item" v-show="outStoreForm.inventoryCode == 3">
              <div class="labels">签收时间</div>
              <div class="content">{{ outStoreForm.receiverTime }}</div>
            </el-col>
            <el-col :span="12" class="dialog-form-item" v-show="outStoreForm.inventoryCode == 2">
              <div class="labels">拒收人</div>
              <div class="content">{{ outStoreForm.receiverName }}</div>
            </el-col>
            <el-col :span="12" class="dialog-form-item" v-show="outStoreForm.inventoryCode == 2">
              <div class="labels">拒收时间</div>
              <div class="content">{{ outStoreForm.receiverTime }}</div>
            </el-col>
            <el-col :span="24" class="dialog-form-item" v-show="outStoreForm.inventoryCode == 2">
              <div class="labels">拒收理由</div>
              <div class="content">{{ outStoreForm.reason }}</div>
            </el-col>
          </div>
        </el-row>
        <h3 class="tac">物料信息</h3>
        <div class="h-200 table-data">
          <el-table style="width: 100%" height="100%" :data="materialList" :key="randomKey2" ref="materialList" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
            <el-table-column label="物料名称" align="center" prop="materialName" width="200"></el-table-column>
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
            <el-table-column label="出库单价" align="center" prop="materialPrice" v-if="pricePermission"></el-table-column>
            <el-table-column label="出库数量" align="center" prop="stockNum"></el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
      <div v-if="orderTypes === 5" class="dialog-form">
        <el-radio-group v-model="radio3" size="small" v-if="['4', '6'].includes(putStoreForm.inventoryCode)">
          <el-radio-button :label="1">入库单信息</el-radio-button>
          <el-radio-button :label="2">退货信息</el-radio-button>
        </el-radio-group>
        <!-- 弹框内容 -->
        <div v-show="radio3 === 1" class="mt-10">
          <el-row :span="24" class="el-row-data dialog-forms">
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">入库单号</div>
              <div class="content">
                <el-input v-model="putStoreForm.orderCode" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">来料对象</div>
              <div class="content">
                <el-input :value="putIsscodeList[putStoreForm.issueCode]" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="[6, 7].includes(user.orgType) && putStoreForm.issueCode !== 'issue_unit'">
              <div class="labels">标段项目</div>
              <div class="content">
                <el-input v-model="putStoreForm.projectName" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">入库仓库</div>
              <div class="content">
                <el-input v-model="putStoreForm.warehouseName" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_subcontract'">
              <div class="labels">分包单位</div>
              <div class="content">
                <el-input v-model="putStoreForm.customerName" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_supplier'">
              <div class="labels">供应商</div>
              <div class="content">
                <el-input v-model="putStoreForm.customerName" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_position'">
              <div class="labels">分项工程</div>
              <div class="content">
                <el-input :value="putStoreForm.orderItemList && putStoreForm.orderItemList.length ? putStoreForm.orderItemList[0].itemName : ''" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_unit'">
              <div class="labels">关联出库单</div>
              <div class="content">
                <el-input
                  :title="
                    putStoreForm.orderRelationList && putStoreForm.orderRelationList.filter(item => item.orderType === 2).length
                      ? putStoreForm.orderRelationList
                          .filter(item => item.orderType === 2)
                          .map(item => item.orderCode)
                          .join(',')
                      : '无'
                  "
                  :value="putStoreForm.orderRelationList && putStoreForm.orderRelationList.length ? putStoreForm.orderRelationList.map(item => item.orderCode).join(',') : '无'"
                  size="mini"
                  disabled
                ></el-input>
                <!-- <el-tooltip class="item" effect="light" placement="bottom-start">
                  <div slot="content" v-if="putStoreForm.orderRelationList && putStoreForm.orderRelationList.length">
                    <div v-for="(item, index) in putStoreForm.orderRelationList" :key="index">{{ item.orderCode }}</div>
                  </div>
                  <div slot="content" v-else>无</div>
                  <div class="tree-box">
                    <span>{{ putStoreForm.orderRelationList && putStoreForm.orderRelationList.length ? putStoreForm.orderRelationList.map(item => item.orderCode).join(",") : "无" }}</span>
                  </div>
                </el-tooltip> -->
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10" v-if="putStoreForm.issueCode === 'issue_supplier' && [4, 5].includes(user.orgType)">
              <div class="labels w-110">关联采购计划单</div>
              <div class="content">
                <el-input
                  :value="
                    putStoreForm.orderRelationList && putStoreForm.orderRelationList.filter(item => item.orderType === 1).length
                      ? putStoreForm.orderRelationList
                          .filter(item => item.orderType === 1)
                          .map(item => item.orderCode)
                          .join(',')
                      : '无'
                  "
                  size="mini"
                  disabled
                ></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">填表人</div>
              <div class="content">
                <el-input v-model="putStoreForm.createUserName" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="8" class="dialog-form-item mb-10">
              <div class="labels">业务时间</div>
              <div class="content">
                <el-date-picker size="mini" type="datetime" style="width:100%" value-format="yyyy-MM-dd HH:mm:ss" v-model="putStoreForm.serviceTime" disabled></el-date-picker>
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
                <el-input :value="putStatesList[putStoreForm.inventoryCode]" size="mini" disabled></el-input>
              </div>
            </el-col>
            <el-col :span="24" class="dialog-form-item mb-10">
              <div class="labels">备注</div>
              <div class="content">
                <el-input v-model="putStoreForm.remark" type="textarea" :rows="4" resize="none" size="mini" disabled></el-input>
              </div>
            </el-col>
            <div class="dashedDiv" v-if="putStoreForm.billCode === '4' || ['2', '3'].includes(putStoreForm.inventoryCode)">
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
              <el-col :span="12" v-show="['4'].includes(putStoreForm.billCode)">
                <span>拒收人:</span>
                <span>{{ putStoreForm.receiverName }}</span>
              </el-col>
              <el-col :span="12" v-show="['4'].includes(putStoreForm.billCode)">
                <span>拒收时间:</span>
                <span>{{ putStoreForm.receiverTime }}</span>
              </el-col>
              <el-col :span="24" v-show="['4'].includes(putStoreForm.billCode)">
                <span>拒收原因:</span>
                <span>{{ putStoreForm.reason }}</span>
              </el-col>
            </div>
          </el-row>

          <h3 class="tac">物料信息</h3>
          <div class="h-200 table-data">
            <el-table style="width: 100%" height="100%" :data="putmaterialList" :key="randomKey2" ref="putmaterialList" stripe :header-cell-style="{ background: '#f1f6ff' }">
              <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
              <el-table-column label="物料名称" align="center" prop="materialName" width="200"></el-table-column>
              <el-table-column label="物料分类" align="center" prop="fkTypeName"> </el-table-column>
              <el-table-column label="供应商" align="center" prop="customerName">
                <template slot-scope="{ row }">{{ row.fkCustomerId === "0" ? "无" : row.customerName }}</template>
              </el-table-column>
              <el-table-column label="单位" align="center" prop="fkUnitName"> </el-table-column>
              <el-table-column label="物料单价" align="center" prop="materialPrice" v-if="pricePermission"></el-table-column>
              <el-table-column label="入库数量" align="center" prop="stockNum"></el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </div>
        <div class="mt-10 h-500 table-data" v-show="radio3 === 2">
          <el-table style="width: 100%" height="100%" :data="putStoreForm.orderReturnVos" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column label="序号" type="index" align="center" width="60"> </el-table-column>
            <el-table-column label="单据编号" align="center" prop="code"> </el-table-column>
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
    </el-dialog>
    <approveManageementDialog v-if="orderTypes === 6" ref="approveManageementDialog" @close="closeDialog" @closeLoading="closeLoading" :appDialog.sync="appDialog" :appDialogTitle="'查看盘点单'" :appDialogType="1"></approveManageementDialog>
  </div>
</template>

<script>
import approveManageementDialog from "./approveManageementDialog.vue";
export default {
  components: { approveManageementDialog },
  props: {
    checkOrderDialog: {
      default: false,
      type: Boolean
    },
    // 1申请单；2采购单，3：发料单，4出库单，5入库单，6盘点单
    orderType: {
      type: Number,
      default: 1
    },
    pkId: ""
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
    }
  },
  data() {
    return {
      appDialog: false,
      title: "查看单据",
      loading: false,
      isCollapse: 0,
      id: "",
      orderTypes: "",
      form1: {
        fkBidProjectId: "",
        associationItems: [], // 关联项目
        orderApplyMaterialDetails: [], // 关联项目
        orderCode: "",
        leaderName: "", // 填表人
        serviceTime: "", // 业务时间
        inspectName: "",
        inspectTime: "",
        remark: "",
        customName: "", // 分包单位
        createUserName: "", // 制单人
        createTime: "", // 录入时间
        reason: "", // 驳回原因
        confirmUserName: "", // 驳回人
        reasonTime: "", // 驳回时间
        confirmTime: "", // 驳回时间
        applyCode: "" // 单据状态
      },
      // 新增编辑弹框对象数据
      form2: {
        fkCustomerId: "",
        orderCode: "",
        orderApplyMaterialDetails: [],
        purchaseCode: "",
        leaderName: "",
        fkBidProjectId: "", // 标段项目
        rePurchaseApplies: [], // 关联申请单
        inspectName: "",
        serviceTime: "", // 业务时间
        remark: "",
        reason: "", // 驳回原因
        confirmUserName: "", // 驳回人
        reasonTime: "", // 驳回时间
        confirmTime: "" // 驳回时间
      },
      form3: {
        orderCode: "", // 发料单号
        typeCode: "", // 出库对象
        fkCustomerId: "", // 客户ID
        fkWarehouseId: "", // 出库仓库
        leaderName: "", // 负责人名称,
        serviceTime: "", // 业务时间
        warehousingIds: [], // 物资入库单ID集
        applyIds: [], // 物资申请单ID集
        // orderOrdinaryDetails:[],//普通材料发料单与物资详情表数据集
        inspectType: "",
        companyName: "",
        inspectName: "",
        inspectTime: "",
        content: "",
        hierarchyType: "1",
        totalAmount: "",
        enclosures: []
      },
      random: Math.random(),
      accessoryList: [],
      associationItems2: [],
      tableBills: [],
      tableBills2: [],
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
        vehicleNum: ""
      },
      materialList: [],
      putStatesList: ["草稿", "运输中", "待入库", "已完成", "已退货", "待退货", "退货中"],
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
        serviceTime: ""
      },
      putmaterialList: [],
      radio3: 1,
      fkPurchaseId: "",
      fkInputIdList: [],
      fkOrdinaryId: "",
      fkApplyIdList: [],
      fkInventoryIdList: [],
      randomKey2: Math.random()
    };
  },
  watch: {
    checkOrderDialog(val) {
      if (val) {
        this.id = this.pkId;
        this.orderTypes = this.orderType;
        if (this.orderTypes === 1) {
          this.queryUserinfo(this.pkId);
        } else if (this.orderTypes === 2) {
          this.queryUserinfo2(this.pkId);
        } else if (this.orderTypes === 3) {
          this.queryUserinfo3(this.pkId);
        } else if (this.orderTypes === 4) {
          this.findOutById(this.pkId);
        } else if (this.orderTypes === 5) {
          this.findInputById(this.pkId);
        } else if (this.orderTypes === 6) {
          this.loading = true;
          this.$nextTick(() => {
            this.$refs.approveManageementDialog.findOrderInventoryById(this.pkId, 1);
          });
        }
      }
    }
  },
  methods: {
    // 根据id查询pkID数据
    queryUserinfo(id) {
      this.loading = true;
      this.$api
        .queryApplicationform({ pkId: id })
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.associationItems2 = res.data.itemName;
            this.accessoryList = res.data.orderApplyMaterialDetails;
            this.form1 = res.data;
            this.tableBills = res.data.relationInputInventoryVos; // 入库单
            this.tableBills2 = res.data.relationOutInventoryVos; // 出库单
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 查询采购单信息
    queryUserinfo2(id) {
      this.loading = true;
      this.$api
        .queryPurchaseOrder({ pkId: id })
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.form2 = res.data;
            // 物料信息
            this.accessoryList = res.data.orderApplyMaterialDetails;
            this.tableBills = res.data.relationInputInventoryVos; // 入库单
            this.tableBills2 = res.data.relationOutInventoryVos; // 出库单
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    queryUserinfo3(id) {
      this.loading = true;
      this.$api
        .orderOrdinaryApplyById({ pkId: id })
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            // res.data.inspectType = res.data.inspectType.toString();
            this.form3 = res.data;
            this.accessoryList = res.data.orderOrdinaryDetails;
            this.accessoryList.forEach(item => {
              item.passStatus = item.passStatus;
              item.supplyNum = item.stockNum;
            });
            if (res.data.typeCode == "delivery_supplier") {
              this.stockLabel = "供应商";
            } else if (res.data.typeCode == "delivery_subcontract") {
              this.stockLabel = "分包单位";
            }
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 根据id获取出库单详情
    findOutById(pkId) {
      this.loading = true;
      this.$api
        .findOutById({ pkId })
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.outStoreForm = res.data;
            this.materialList = res.data.orderDetailsList.map(item => ({ ...item, fkUnitName: item.unitName }));
            let arr1 = res.data.orderRelationList.filter(item => item.orderType == 2); //物资申请单
            let arr2 = res.data.orderRelationList.filter(item => item.orderType == 3); // 入库单
            let arr3 = res.data.orderRelationList.filter(item => item.orderType == 1); // 采购计划单
            let arr4 = res.data.orderRelationList.filter(item => item.orderType == 4); // 发料单
            this.fkApplyIdList = arr1;
            this.fkInputIdList = arr2;
            this.fkPurchaseId = arr3.length ? arr3[0] : "";
            this.fkOrdinaryId = arr4.length ? arr4[0] : "";
            this.randomKey2 = Math.random();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 根据id获取入库单
    findInputById(pkId) {
      this.loading = true;
      this.$api
        .findInputById({ pkId })
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.putStoreForm = res.data;
            this.putmaterialList = res.data.detailsVoList;
            let arr1 = res.data.orderRelationList.filter(item => item.orderType === 1); //采购单
            let arr2 = res.data.orderRelationList.filter(item => item.orderType === 2); //出库单
            // let arr3 = res.data.orderRelationList.filter(item => item.orderType === 3); //入库单
            this.fkPurchaseId = arr1.length ? arr1[0] : "";
            this.fkInventoryIdList = arr2;
            this.putStoreForm.fkInventoryIdList = arr2.length ? arr2.map(item => item.pkId) : [];
            this.randomKey2 = Math.random();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    closeDialog() {
      this.$emit("update:checkOrderDialog", false);
      this.isCollapse = 0;
      this.form1 = {
        fkBidProjectId: "",
        associationItems: [], // 关联项目
        orderApplyMaterialDetails: [], // 关联项目
        orderCode: "",
        leaderName: "", // 填表人
        serviceTime: "", // 业务时间
        inspectName: "",
        inspectTime: "",
        remark: "",
        customName: "", // 分包单位
        createUserName: "", // 制单人
        createTime: "", // 录入时间
        reason: "", // 驳回原因
        confirmUserName: "", // 驳回人
        reasonTime: "", // 驳回时间
        confirmTime: "", // 驳回时间
        applyCode: "" // 单据状态}
      };
      this.form2 = {
        fkCustomerId: "",
        orderCode: "",
        orderApplyMaterialDetails: [],
        purchaseCode: "",
        leaderName: "",
        fkBidProjectId: "", // 标段项目
        rePurchaseApplies: [], // 关联申请单
        inspectName: "",
        serviceTime: "", // 业务时间
        remark: "",
        reason: "", // 驳回原因
        confirmUserName: "", // 驳回人
        reasonTime: "", // 驳回时间
        confirmTime: "" // 驳回时间
      };
      this.accessoryList = [];
      this.associationItems2 = [];
      this.tableBills = [];
      this.tableBills2 = [];
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
        vehicleNum: ""
      };
      this.materialList = [];
      this.putmaterialList = [];
      this.radio3 = 1;
      this.fkPurchaseId = "";
      this.fkInputIdList = [];
      this.fkOrdinaryId = "";
      this.fkApplyIdList = [];
      this.fkInventoryIdList = [];
      this.form3 = {
        orderCode: "", // 发料单号
        typeCode: "", // 出库对象
        fkCustomerId: "", // 客户ID
        fkWarehouseId: "", // 出库仓库
        leaderName: "", // 负责人名称,
        serviceTime: "", // 业务时间
        warehousingIds: [], // 物资入库单ID集
        applyIds: [], // 物资申请单ID集
        // orderOrdinaryDetails:[],//普通材料发料单与物资详情表数据集
        inspectType: "",
        companyName: "",
        inspectName: "",
        inspectTime: "",
        content: "",
        hierarchyType: "1",
        totalAmount: "",
        enclosures: []
      };
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
        serviceTime: ""
      };
    },
    closeLoading() {
      this.loading = false;
    },
    orderClick(row, orderType) {
      this.orderTypes = orderType;
      this.id = row.pkId;
      this.getData();
    },
    getData() {
      if (this.orderTypes === 1) {
        this.queryUserinfo(this.id);
      } else if (this.orderTypes === 2) {
        this.queryUserinfo2(this.id);
      } else if (this.orderTypes === 3) {
        this.queryUserinfo3(this.id);
      } else if (this.orderTypes === 4) {
        this.findOutById(this.id);
      } else if (this.orderTypes === 5) {
        this.findInputById(this.id);
      } else if (this.orderTypes === 6) {
        this.loading = true;
        this.$nextTick(() => {
          this.$refs.approveManageementDialog.findOrderInventoryById(this.id, 1);
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
// 设置弹框里面输入框行高
.row-height {
  /deep/ .el-form-item {
    margin-bottom: 10px;
    .el-form-item__error {
      top: 31px;
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
.h-500 {
  height: 500px;
}
.wh-300 {
  width: 300px;
}
.h-200 {
  height: 200px;
}
.h-300 {
  height: 300px;
}
.tab-one {
  border: 1px solid #f3e7e7;
  padding: 10px;
}
.tree-box {
  position: absolute;
  width: 100%;
  top: 5px;
  font-size: 12px;
  height: 30px;
  line-height: 30px;
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
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
// 确认人
.affirm {
  // margin-left: 80px;
  display: flex;
  justify-content: space-between;
  border: 1px dotted #333333;
  padding: 10px;
}
.material {
  text-align: center;
  margin-bottom: 10px;
  span {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-size: 18px;
    position: absolute;
    right: 30px;
    background-color: #f2f2f2;
    color: #8dc180;
  }
}
.blue {
  color: #02aff4;
  cursor: pointer;
}
</style>
