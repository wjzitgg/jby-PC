<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <el-tabs v-model="topRadio" v-if="user.orgType === 5 || user.orgType === 4" @tab-click="typeChange">
      <el-tab-pane label="分包单位材料申请单" name="1"></el-tab-pane>
      <el-tab-pane label="供应商供货申请单" name="2"></el-tab-pane>
    </el-tabs>
    <div class="search-bgc search-mr">
      <el-form :model="searchData" class="form-data">
        <el-form-item label="标段项目" label-width="80px" v-if="user.orgType == 4 || user.orgType == 10">
          <!-- <el-select v-model="searchData.fkBidProjectId" size="mini" @change="projectIdChange">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
        <el-form-item label="标段项目" label-width="80px" v-if="user.orgType == 7 || user.orgType == 6">
          <el-select v-model="searchData.fkBidProjectId" size="mini" @change="projectIdChange">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分包单位" label-width="80px" v-if="(user.orgType == 5 || user.orgType == 4) && topRadio == 1">
          <el-select v-model="searchData.fkCustomerId" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" label-width="80px" v-if="(user.orgType == 5 || user.orgType == 4) && topRadio == 2">
          <el-select v-model="searchData.fkCustomerId" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in supOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" label-width="60px">
          <el-select v-model="searchData.applyCode" size="mini" class="wh-100">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in statusData" :key="item.keyName" :label="item.keyVal" :value="item.keyName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="writeTime" label="单据时间" label-width="90px">
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.beginTime"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="单据编号" label-width="90px">
          <el-input v-model="searchData.orderCode" maxlength="50" size="mini"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" icon="el-icon-search" class="seek" @click="queryData">查询</el-button>
        <el-button type="primary" size="mini" class="add-staff" @click="addRecord" v-has="'supplies:supplyRequest:add'" v-if="user.orgType != 6">新增申请单</el-button>
        <el-button type="primary" size="mini" class="add-staff" @click="addRecord2" v-has="'supplies:supplyRequest:add'" v-if="user.orgType == 6">新增物资申请单</el-button>
      </el-form>
    </div>
    <div class="tab-container" v-loading="loading" v-if="typeShow">
      <div class="table-data" style="height:72%" v-if="topRadio == 1">
        <el-table :tooltip-effect="'light'" :data="tableData" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" ref="tableBox">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="orderCode" label="单据编号" align="center"> </el-table-column>
          <el-table-column prop="fkBidProjectName" label="标段项目" align="center" v-if="user.orgType == 7 || user.orgType == 4"> </el-table-column>
          <el-table-column prop="customName" label="申请分包单位" align="center" v-if="user.orgType !== 7"> </el-table-column>
          <el-table-column prop="itemName" label="关联项目" align="center"> </el-table-column>
          <el-table-column prop="createUserName" label="填表人" align="center"> </el-table-column>
          <el-table-column prop="serviceTime" label="单据时间" align="center"> </el-table-column>
          <el-table-column prop="confirmUserName" label="确认人" align="center" v-if="user.orgType !== 7"> </el-table-column>
          <el-table-column prop="confirmTime" label="确认时间" align="center" v-if="user.orgType !== 7"> </el-table-column>
          <el-table-column label="状态" align="center" prop="applyCodeName"></el-table-column>
          <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" align="center" width="300">
            <template slot-scope="{ row }">
              <el-button size="mini" plain @click="lookOver(row, 1)" v-has="'supplies:supplyRequest:query'">查看</el-button>
              <el-button size="mini" plain v-has="'supplies:supplyRequest:update'" type="primary" @click="editRecord(row)" v-show="row.isUpdate">编辑</el-button>
              <el-button size="mini" plain v-has="'supplies:supplyRequest:handle'" type="success" @click="lookOver(row, 3)" v-show="row.isHandle">处理</el-button>
              <el-button size="mini" plain v-has="'supplies:supplyRequest:withdraw'" type="danger" @click="deleteRecord2(row.pkId)" v-show="row.isWithdraw">撤回</el-button>
              <el-button size="mini" plain v-has="'supplies:supplyRequest:delete'" type="danger" @click="deleteRecord(row.pkId)" v-show="row.isDelete">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <div class="table-data" style="height:72%" v-if="topRadio == 2">
        <el-table :tooltip-effect="'light'" :data="tableData" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" ref="tableBox">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="orderCode" :label="user.orgType === 5 ? '单据编号' : '供货申请单号'" align="center"> </el-table-column>
          <el-table-column prop="supplierObjectName" label="供货对象" align="center" v-if="user.orgType == 6"> </el-table-column>
          <el-table-column prop="supplierName" label="申请供应商" align="center" v-if="user.orgType !== 6"> </el-table-column>
          <el-table-column prop="itemName" label="关联采购计划单" align="center">
            <template slot-scope="{ row }">
              <div style="text-align:center;">
                <span v-for="(item, index) in row.orderRelationList" :key="item.pkId" class="blue" @click="orderClick(item, 2)">{{ item.orderCode + (row.orderRelationList.length - 1 === index ? "" : ",") }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createUserName" label="填表人" align="center" v-if="user.orgType !== 6"> </el-table-column>
          <el-table-column prop="serviceTime" label="申请时间" align="center" v-if="user.orgType !== 6"> </el-table-column>
          <el-table-column prop="confirmUserName" label="审核人" align="center" v-if="user.orgType !== 6"> </el-table-column>
          <el-table-column prop="confirmTime" label="审核时间" align="center" v-if="user.orgType !== 6">
            <template slot-scope="{row}">{{row.applyCode==3?row.reasonTime:row.confirmTime}}</template>
          </el-table-column>
          <el-table-column prop="createUserName" label="填表人" align="center" v-if="user.orgType === 6"> </el-table-column>
          <el-table-column prop="serviceTime" label="单据时间" align="center" v-if="user.orgType === 6"> </el-table-column>
          <el-table-column label="状态" align="center" prop="applyCodeName"></el-table-column>
          <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" align="center" width="300">
            <template slot-scope="{ row }">
              <el-button size="mini" plain v-has="'supplies:supplyRequest:query'" @click="lookOver2(row, 1)">查看</el-button>
              <el-button size="mini" plain v-has="'supplies:supplyRequest:update'" type="primary" @click="editRecord2(row)" v-show="row.editStatus">编辑</el-button>
              <el-button size="mini" plain v-has="'supplies:supplyRequest:handle'" type="success" @click="lookOver2(row, 3)" v-show="row.handleStatus">处理</el-button>
              <el-button size="mini" plain v-has="'supplies:supplyRequest:withdraw'" type="danger" @click="deleteApply2(row.pkId)" v-show="row.cancelStatus">撤回</el-button>
              <el-button size="mini" plain v-has="'supplies:supplyRequest:delete'" type="danger" @click="deleteApply(row.pkId)" v-show="row.deleteStatus">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 弹窗 -->
    <el-dialog :close-on-press-escape="false" :title="title" :visible="popup" v-dialogDrag :close-on-click-modal="false" v-loading="loading" @close="close" top="3vw" width="60%" class="altitude">
      <div class="dialog-form">
        <el-radio-group v-model="isCollapse" size="mini" v-if="form.applyCode == '已完成' || form.applyCode == '已确认'">
          <el-radio-button :label="0">基本信息</el-radio-button>
          <el-radio-button :label="1" v-if="user.orgType != 7">关联出库单</el-radio-button>
          <el-radio-button :label="2">关联入库单</el-radio-button>
        </el-radio-group>
        <div :class="btnStatus && user.orgType == 7 ? 'tab-one' : ''" v-show="isCollapse == 0">
          <el-form :model="form" :rules="rules" ref="form" class="row-height">
            <el-row :span="24" class="el-row-data">
              <el-col :span="8">
                <el-form-item label="申请单号" prop="orderCode" label-width="110px">
                  <el-input v-model="form.orderCode" size="mini" :disabled="btnStatus || !!allowModify" :maxlength="limitNum"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType != 5">
                <el-form-item label="标段项目" prop="fkBidProjectId" label-width="110px">
                  <el-select size="mini" v-model="form.fkBidProjectId" class="wh" :disabled="btnStatus || num == 2" @change="searchItemsByProjectId">
                    <el-option v-for="item in noProjectData" :key="item.pkId" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType == 4 || user.orgType == 5">
                <el-form-item label="分包单位" label-width="110px">
                  <el-input v-model="form.customName" size="mini" :disabled="btnStatus"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="填表人" label-width="110px" prop="createUserName">
                  <el-input v-model="form.createUserName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="业务时间" label-width="110px" prop="serviceTime">
                  <el-date-picker size="mini" class="time-wh" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" v-model="form.serviceTime" :disabled="btnStatus"></el-date-picker>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="8" v-if="btnStatus || num == 2">
                <el-form-item label="制单人" label-width="110px">
                  <el-input v-model="form.createUserName" size="mini" :disabled="btnStatus || num == 2"></el-input>
                </el-form-item>
              </el-col> -->
              <el-col :span="8" v-if="btnStatus || num == 2">
                <el-form-item label="录入时间" label-width="110px">
                  <el-input v-model="form.createTime" size="mini" :disabled="btnStatus || num == 2"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="关联项目" prop="associationItems" label-width="110px">
                  <selectTree :defaultProps="defaultProps" :nodeKey="'pkId'" :checkedList="form.associationItems" :treeList="treeData" @selectIds="checked2" ref="selectTree2" v-if="!btnStatus" />

                  <el-tooltip class="item" effect="light" placement="bottom-start" v-else>
                    <div slot="content">
                      <div>{{ associationItems2 }}</div>
                    </div>
                    <div class="tree-box">
                      <span>{{ associationItems2 }}，</span>
                    </div>
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="title == '物资申请单信息' || title == '处理物资申请单'">
                <el-form-item label="单据状态" label-width="110px">
                  <el-input v-model="form.applyCode" size="mini" :disabled="btnStatus"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label-width="110px">
                  <label slot="label">备&emsp;&emsp;注</label>
                  <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" v-model="form.remark" maxlength="100" class="wh" :disabled="btnStatus"> </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="num == 1 && title == '物资申请单信息'">
                <div class="affirm" v-if="form.applyCode == '已驳回'">
                  <div class="person">
                    驳回人: {{ form.confirmUserName }}
                    <div>驳回时间: {{ form.reasonTime }}</div>
                  </div>
                  <div>驳回原因：{{ form.reason }}</div>
                </div>
                <div class="affirm" v-if="form.applyCode == '已确认'">
                  <div class="person">
                    确认人: {{ form.confirmUserName }}
                    <div>确认时间: {{ form.confirmTime }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-form>
          <h3 class="material">物料信息</h3>
          <div class="table-data" :class="num == 0 ? 'table2' : 'table1'">
            <el-table :tooltip-effect="'light'" :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :key="random">
              <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
              <el-table-column label="物料名称" align="center" prop="materialName" v-if="!btnStatus">
                <template slot-scope="{ row }">
                  <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)">
                    <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
                  </el-input>
                </template>
              </el-table-column>
              <!-- 查看或者处理状态 -->
              <el-table-column label="物料名称" align="center" prop="materialName" v-else> </el-table-column>
              <el-table-column label="物料分类" align="center" prop="materialTypeName"> </el-table-column>
              <el-table-column label="单位" width="60" align="center" prop="unitName"> </el-table-column>
              <el-table-column label="当前库存" width="100" align="center" prop="supplyNum" v-if="num == 0 || num == 2"> </el-table-column>
              <el-table-column label="申请数量" align="center" prop="applyNum" width="150" v-if="!btnStatus">
                <template slot-scope="{ row }">
                  <el-input v-model.trim="row.applyNum" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="申请数量" align="center" prop="applyNum" width="150" v-else> </el-table-column>
              <el-table-column label="收货数量" align="center" prop="applyNum" v-if="user.orgType == 5 && form.applyCode != '待确认'"> </el-table-column>
              <el-table-column label="操作" align="center" width="100" v-if="!btnStatus">
                <template slot-scope="{ row, $index }">
                  <span class="addAcc" v-if="accessoryList.length == $index + 1" @click="addAcc(row)" title="新增">
                    <i class="el-icon-plus"></i>
                  </span>
                  <span class="delAcc" @click="delAcc(row,$index)" title="删除">
                    <i class="el-icon-close"></i>
                  </span>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
          <div slot="footer" class="dialog-footer" v-if="num != 1">
            <!-- @close="close -->
            <el-button type="primary" class="certainty" @click="modifyState(2)" v-if="num == 3">确认</el-button>
            <el-button type="danger" class="certainty" @click="turnDown" v-if="num == 3">驳回</el-button>
            <el-button type="primary" class="certainty" @click="submit('form', 0)" v-if="num == 0 || num == 2">保存草稿</el-button>
            <el-button type="primary" class="certainty" @click="submit('form', 1)" v-if="num == 0 || num == 2">提交单据</el-button>
            <el-button class="certainty" type="primary" plain @click="popup = false" v-if="num != 1">取 消</el-button>
          </div>
        </div>
        <!-- tab 1 出入库单子 -->
        <div class="tab-two table-data" v-show="isCollapse == 1">
          <el-table :tooltip-effect="'light'" :data="tableBills2" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column prop="date" label="序号" width="60" align="center">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orderCode" label="出库单据" align="center">
              <template slot-scope="{ row }">
                <span class="blue" @click="orderClick(row, 4)">{{ row.orderCode }}</span>
              </template>
            </el-table-column>
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
        <div class="tab-two table-data" v-show="isCollapse == 2">
          <el-table :tooltip-effect="'light'" :data="tableBills" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column prop="date" label="序号" width="60" align="center">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orderCode" label="入库单据" align="center">
              <template slot-scope="{ row }">
                <span class="blue" @click="orderClick(row, 5)">{{ row.orderCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="单据日期" align="center"> </el-table-column>
            <el-table-column prop="warehouseName" label="入库仓库" align="center"> </el-table-column>
            <el-table-column prop="receiverName" label="签收人/拒收人" align="center">
              <template slot-scope="{ row }">
                <el-tooltip v-if="row.reason.length" class="item" effect="dark" content="拒收人" placement="left">
                  <el-button style="color:red">{{ row.receiverName }}</el-button>
                </el-tooltip>
                <el-tooltip v-else class="item" effect="dark" content="签收人" placement="left">
                  <el-button>{{ row.receiverName }}</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="receiverTime" label="签收时间/拒收时间" align="center">
              <template slot-scope="{ row }">
                <el-tooltip v-if="row.reason.length" class="item" effect="dark" content="拒收时间" placement="left">
                  <el-button style="color:red">{{ row.receiverTime }}</el-button>
                </el-tooltip>
                <el-tooltip v-else class="item" effect="dark" content="签收时间" placement="left">
                  <el-button>{{ row.receiverTime }}</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
    </el-dialog>
    <el-dialog :close-on-press-escape="false" :title="title2" :visible="popup2" v-dialogDrag :close-on-click-modal="false" v-loading="loading" @close="close2" top="3vw" width="60%">
      <div class="dialog-form">
        <!-- <el-radio-group v-model="isCollapse" size="mini" v-if="form.applyCode == '已完成' || form.applyCode == '已确认'">
        <el-radio-button :label="0">基本信息</el-radio-button>
        <el-radio-button :label="1" v-if="user.orgType != 7">关联出库单</el-radio-button>
        <el-radio-button :label="2">关联入库单</el-radio-button>
      </el-radio-group> -->
      <!-- :class="btnStatus && user.orgType == 6 ? 'tab-one' : ''" -->
        <div >
          <el-form :model="form" :rules="rules" ref="form" class="row-height">
            <el-row :span="24" class="el-row-data">
              <el-col :span="8" v-if="user.orgType == 6">
                <el-form-item label="出库对象" label-width="110px">
                  <el-select size="mini" v-model="form.issueCode" class="wh" :disabled="btnStatus || num == 2" @change="issueChange">
                    <el-option v-for="item in outObjectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="申请单号" prop="orderCode" label-width="110px">
                  <el-input v-model="form.orderCode" size="mini" :disabled="btnStatus || !!allowModify" :maxlength="limitNum"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType != 6">
                <el-form-item label="供应商" label-width="110px">
                  <el-input v-model="form.supplierName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType != 5">
                <el-form-item label="标段项目" prop="fkBidProjectId" label-width="110px">
                  <el-input v-model="form.projectName" size="mini" disabled v-if="btnStatus || num == 2"></el-input>
                  <el-select size="mini" v-model="form.fkBidProjectId" class="wh" :disabled="btnStatus || num == 2" @change="searchSubByProjectId" v-else>
                    <el-option v-for="item in noProjectData" :key="item.pkId" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType == 6 && form.issueCode == 'delivery_subcontract'">
                <el-form-item label="分包单位" label-width="110px">
                  <el-select size="mini" v-model="form.fkCustomerId" :disabled="btnStatus || num == 2" class="wh" v-if="user.orgType == 6 && [0, 3].includes(num)">
                    <el-option v-for="item in subOptions" :key="item.pkId" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                  <el-input v-model="form.customName" size="mini" disabled v-else></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="关联采购计划单" label-width="110px">
                  <el-select v-model="fkPurchaseId" placeholder="无" value-key="pkId" :disabled="!form.fkBidProjectId" clearable size="mini" style="width:100%" v-if="user.orgType == 6 && [0, 2].includes(num)" filterable remote :remote-method="remoteMethod2" @change="change2" @visible-change="restoreSelect2" reserve-keyword :loading="loading2">
                    <!-- <el-option value="" label="无"></el-option> -->
                    <el-option v-for="item in planBuyList" :key="item.value" :value="item" :label="item.label"></el-option>
                  </el-select>
                  <el-input :value="fkPurchaseId.orderCode ? fkPurchaseId.orderCode : '无'" size="mini" disabled v-else></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" >
                <el-form-item label="填表人" label-width="110px" prop="leaderName">
                  <el-input v-model="form.createUserName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="申请时间" label-width="110px" prop="serviceTime">
                  <el-date-picker size="mini" class="time-wh" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" v-model="form.serviceTime" :disabled="btnStatus"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType != 6">
                <el-form-item label="供应对象" label-width="110px">
                  <el-input v-model="form.projectName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="8" v-if="user.orgType == 6 && num == 1">
                <el-form-item label="制单人" label-width="110px">
                  <el-input v-model="form.createUserName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col> -->
              <el-col :span="8" v-if="user.orgType == 6 && num == 1">
                <el-form-item label="录入时间" label-width="110px">
                  <el-input v-model="form.createTime" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="title2 == '物资申请单信息' || title2 == '处理物资申请单'">
                <el-form-item label="状态" label-width="110px">
                  <el-input v-model="form.applyCode" size="mini" :disabled="btnStatus"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType != 6 && num == 1">
                <el-form-item label="审批人" label-width="110px">
                  <el-input v-model="form.confirmUserName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType != 6 && num == 1">
                <el-form-item label="审批时间" label-width="110px">
                  <el-input :value="form.applyCode==3?form.reasonTime:form.confirmTime" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label-width="110px">
                  <label slot="label">备&emsp;&emsp;注</label>
                  <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" v-model="form.remark" maxlength="500" class="wh" :disabled="btnStatus"> </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="num == 1 && title == '物资申请单信息'">
                <div class="affirm" v-if="form.applyCode == '已驳回'">
                  <div class="person">
                    驳回人: {{ form.confirmUserName }}
                    <div>驳回时间: {{ form.reasonTime }}</div>
                  </div>
                  <div>驳回原因：{{ form.reason }}</div>
                </div>
                <div class="affirm" v-if="form.applyCode == '已确认'">
                  <div class="person">
                    确认人: {{ form.confirmUserName }}
                    <div>确认时间: {{ form.confirmTime }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-form>
          <h3 class="material">物料信息</h3>
          <div class="table-data supTable">
            <el-table :tooltip-effect="'light'" :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :key="random">
              <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
              <el-table-column label="物料名称" align="center" prop="materialName" v-if="!btnStatus">
                <template slot-scope="{ row }">
                  <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)" v-if="!form.fkPurchaseId">
                    <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
                  </el-input>
                  <span v-else>{{row.materialName}}</span>
                </template>
              </el-table-column>
              <!-- 查看或者处理状态 -->
              <el-table-column label="物料名称" align="center" prop="materialName" v-else> </el-table-column>
              <el-table-column label="物料分类" align="center" prop="materialTypeName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="单位" width="60" align="center" prop="unitName"> </el-table-column>
              <el-table-column label="采购计划数量" align="center" prop="purchaseNum" v-if="!!form.fkPurchaseId"> </el-table-column>
              <el-table-column label="已供数量" align="center" prop="providedNum" v-if="!!form.fkPurchaseId && [0, 2].includes(num)"> </el-table-column>
              <el-table-column label="物料单价" align="center" prop="materialPrice" width="150" v-if="pricePermission">
                <template slot-scope="{ row }">
                  <el-input v-model.trim="row.materialPrice" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')" v-if="!btnStatus"></el-input>
                  <span v-else>{{ row.materialPrice }}</span>
                </template>
              </el-table-column>
              <el-table-column label="申请数量" align="center" prop="applyNum" width="150" v-if="user.orgType === 6">
                <template slot-scope="{ row }">
                  <el-input v-model.trim="row.applyNum" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')" v-if="!btnStatus"></el-input>
                  <span v-else>{{ row.applyNum }}</span>
                </template>
              </el-table-column>
              <el-table-column label="本次申请供货数量" align="center" prop="applyNum" width="150" v-else> </el-table-column>
              <el-table-column label="操作" align="center" width="100" v-if="!btnStatus && !form.fkPurchaseId">
                <template slot-scope="{ row, $index }">
                  <span class="addAcc" v-if="accessoryList.length == $index + 1" @click="addAcc(row)" title="新增">
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
          </div>
        </div>
      </div>
      <!-- class="dialog-footer2" -->
      <div slot="footer" v-if="num != 1">
        <!-- @close="close -->
        <el-button type="primary" class="certainty" @click="modifyState2(2)" v-if="num == 3">确认</el-button>
        <el-button type="danger" class="certainty" @click="turnDown2" v-if="num == 3">驳回</el-button>
        <el-button type="primary" class="certainty" @click="submit2('form', 0)" v-if="num == 0 || num == 2">保存草稿</el-button>
        <el-button type="primary" class="certainty" @click="submit2('form', 1)" v-if="num == 0 || num == 2">申请供货</el-button>
        <el-button class="certainty" type="primary" plain @click="popup2 = false" v-if="num != 1">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择物料弹框 -->
    <materialsSelect :fkCustomId="form.fkCustomerId"  :materDialog.sync="materDialog" :supplyNumShow="false" :outTypeCode="form.issueCode" :selectMater="accessoryList" @getSelect="getSelect" :showType="2" :fkBidProjectId="form.fkBidProjectId" v-if="num == 0 || num == 2"></materialsSelect>
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"></checkOrderDialog>
  </div>
</template>

<script>
import pageInation from "../../components/tablePaging";
import selectTree from "../../components/selectTree/selectTree.vue"; // 引入自定义下拉树形组建
import materialsSelect from "../../components/materialsSelect/materialsSelect.vue"; // 物料选择
import checkOrderDialog from "./components/checkOrderDialog.vue"; // 查询出入库单信息
import moment from "moment";
import Template from '../sms/template.vue';
export default {
  name: "request",
  data() {
    return {
      topRadio: "1",
      loading2: true,
      // 搜索数据
      searchData: {
        applyCode: "",
        beginTime: "",
        endTime: "",
        orderCode: "",
        fkCustomerId: "",
        fkBidProjectId: ""
      },
      options: [],
      supOptions: [],
      subOptions: [],
      noProjectData: [], // 标段项目
      statusData: [], // 申请单状态
      // 表格列表
      tableData: [],
      popup: false,
      // 分页数据
      pageNum: 1,
      pageSize: 10,
      total: 20,
      loading: false,
      // 新增编辑弹框对象数据
      form: {
        fkBidProjectId: "",
        associationItems: [], // 关联项目
        orderApplyMaterialDetails: [], // 关联项目
        orderCode: "",
        leaderName: "", // 负责人
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
        applyCode: "", // 单据状态
        issueCode: "",
        fkPurchaseId: "",
        fkCustomerId: ""
      },
      title: "",
      rules: {
        fkBidProjectId: [
          {
            required: true,
            message: "请选择标段项目",
            trigger: ["change", "blur"]
          }
        ],
        associationItems: [
          {
            // min: 1,
            required: true,
            message: "请选择关联项目",
            trigger: ["change", "blur"]
          }
        ],
        orderCode: [
          {
            required: true,
            message: "请输入申请单号",
            trigger: ["change", "blur"]
          }
        ],
        leaderName: [
          {
            required: true,
            message: "请输入负责人",
            trigger: ["change", "blur"]
          }
        ],
        serviceTime: [
          {
            required: true,
            message: "请选择业务时间",
            trigger: ["change", "blur"]
          }
        ]
      },
      // 树形需要的数据
      checkedList: [],
      treeData: [],
      defaultProps: {
        children: "children",
        label: "itemName"
      },
      // 物料
      accessoryList: [],
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose"
      },
      btnStatus: false, // 按钮是查看还是新增控制输入框状态
      associationItems2: "",
      isCollapse: 0, // 控制分包单位查看tab切换状态
      tableBills: [], // 入库
      tableBills2: [], // 出库
      materDialog: false, // 控制物料选择
      rowData: {}, // 物料当前行数据
      random: Math.random(),
      num: 1, // 1 查看 2 处理  3 编辑
      checkOrderDialog: false,
      orderType: 4,
      orderPkId: "",
      allowModify: 0,
      limitNum: 1000,
      typeCode: "",
      popup2: false,
      title2: "",
      fkPurchaseId: "",
      planBuyList: [],
      outObjectList: [],
      typeShow:true
      // checkIsscode:{'delivery_subcontract':'分包商',"delivery_project": "项目部"}
    };
  },
  components: {
    pageInation,
    selectTree,
    materialsSelect,
    checkOrderDialog,
    Template
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    pricePermission() {
      const arr = this.$store.state.menuData.filter(item => item.menuCode == "supplies");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    },
    pricePermission2() {
      const arr = this.$store.state.menuData.filter(item => item.menuCode == "updatePrice");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    }
  },
  mounted() {
    // 在字典获取状态
    this.$store.dispatch("getDictionariesData", 12).then(res => {
      this.statusData = res;
    });
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
          // 项目部登录获取搜索条件分包单位下拉列表
    if (this.user.orgType == 7 || this.user.orgType == 6) {
      this.getItemListNoUserId();
    }
    // 项目部登录获取搜索条件分包单位下拉列表
    if (this.user.orgType == 5) {
      this.subcontractor();
      this.supplier();
    }
    if (this.user.orgType === 6) {
      this.topRadio = "2";
    }
    if ([5, 6].includes(this.user.orgType)) {
      // this.$store.dispatch("getDictionariesData", 26).then(res => {
      //   this.outObjectList = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
      // });
      this.findDictBySupplyType();
    }
    if([5,6,7].includes(this.user.orgType)){
      this.getData();
    }

      } else {
        this.$message.error(res.msg);
      }
    });
  
  },
  methods: {
    selectIds(arr,obj,isTrue){
      if(arr.length){
        if(arr.length>1){
          this.searchData.fkBidProjectId=arr[1]
        }else{
          this.searchData.fkBidProjectId=arr[0]
        }
        if(isTrue){
          this.queryData();
        }
        this.projectIdChange(this.searchData.fkBidProjectId)
      }
    },
    issueChange() {
      this.fkPurchaseId = "";
      this.form.fkPurchaseId = "";
      this.form.fkCustomerId = "";
    },
    findDictBySupplyType() {
      this.$api.findDictBySupplyType().then(res => {
        if (res.code === 200) {
          this.outObjectList = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        }
      });
    },
    // 获取供应商、分包单位
    getSubList() {
      // isZero 是否过滤已关联公司标识 0:不过滤，1：过滤
      const data = { bidProjectId:this.form.fkBidProjectId, customType:4, isZero: 0, sourceType:1 };
      this.$api.searchProjCustomByType(data).then(res => {
        if (res.code === 200) {
          const arr = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
          this.subOptions = arr;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取供应商
    supplier() {
      this.$api.subcontractor({ customType: 3 }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.pkId;
          });
          this.supOptions = res.data;
        }
      });
    },
    typeChange() {
      this.pageNum = 1;
      Object.keys(this.searchData).forEach(key => {
        if (this.searchData[key] instanceof Array) {
          this.searchData[key] = [];
        } else {
          if([4,10].includes(this.user.orgType)&&key == 'fkBidProjectId'){
            
          }else{
            this.searchData[key] = "";
          }
        }
      });
      this.tableData = [];
      this.getData();
    },
    orderClick(item, type) {
      this.orderType = type;
      this.orderPkId = item.pkId;
      this.checkOrderDialog = true;
    },
    // 确认  撤回
    modifyState(num) {
      this.loading = true;
      const params = {
        businessType: num,
        pkId: this.form.pkId,
        reason: this.form.reason
      };
      this.$api.modifyState(params).then(res => {
        this.loading = false;
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.popup = false;
          this.getData();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 驳回
    turnDown() {
      this.$prompt("请输入驳回原因", "提示", {
        inputType: "textarea",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValidator:(e)=>{
          if(e.length>100){
            return '驳回原因最大只能输入100个字'
          }
        }
      })
        .then(({ value }) => {
          if (value) {
            this.form.reason = value;
          } else {
            this.form.reason = "申请不通过";
          }
          this.modifyState(3);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    // 确认  撤回
    modifyState2(num) {
      this.loading = true;
      const params = {
        businessType: num,
        pkId: this.form.pkId,
        reason: this.form.reason
      };
      this.$api.updateApplyCodeByBusinessType(params).then(res => {
        this.loading = false;
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.popup2 = false;
          this.getData();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 驳回
    turnDown2() {
      this.$prompt("请输入驳回原因", "提示", {
        inputType: "textarea",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValidator:(e)=>{
          if(e.length>100){
            return '驳回原因最大只能输入100个字'
          }
        }
      })
        .then(({ value }) => {
          if (value) {
            this.form.reason = value;
          } else {
            this.form.reason = "申请不通过";
          }
          this.modifyState2(3);
        })
        .catch(() => {
        });
    },
    // 物料选择
    getSelect(row) {
      let idStatus = false;
      this.accessoryList.forEach(item => {
        if (item.fkMaterialId && item.fkMaterialId == row.pkId) {
          idStatus = true;
          return this.$message.warning("不能添加相同的物料信息");
        }
      });
      if (!idStatus) {
        this.rowData.fkMaterialId = row.pkId;
        this.rowData.materialName = row.materialName;
        this.rowData.materialTypeName = row.fkTypeName;
        this.rowData.unitName = row.fkUnitName;
        this.rowData.supplyNum = row.supplyNum;
      }

      // 解决table刷新数据问题
      this.random = Math.random();
    },
    selectMater(item) {
      console.log('item -----> ', item);
      if (!this.form.fkBidProjectId) {
        return this.$message.warning("请选择标段项目");
      }
      if(this.form.issueCode == 'delivery_subcontract' && (this.form.fkCustomerId == undefined || this.form.fkCustomerId == null ||this.form.fkCustomerId.length == 0  )){
        return this.$message.warning("请选择分包单位");
      }
      this.rowData = item;
      this.materDialog = true;
    },
    // 树形选中事件
    checked2(arr, obj) {
      // 关联项目
      this.form.associationItems = arr;
    },
    // 根据标段项目id获取关联项目
    searchItemsByProjectId(id) {
      // 新增的时候必须延迟 不然导致第一次获取不到数据报错
      this.$nextTick(() => {
        this.form.associationItems = [];
        this.$refs.selectTree2.setTreeSelect([]);
      });
      // 清空物料
      this.accessoryList = [{ id: 1, materialName: "", materialTypeName: "", unitName: "", applyNum: "" }];
      this.$api.searchItemsByProjectId({ projectId: id, filterStatus: 1 }).then(res => {
        if (res.code == 200) {
          this.treeData = res.data;
          // this.treeData.forEach(item => {
          //   item.disabled = true;
          //   item.children.forEach(i => {
          //     i.disabled = true;
          //     i.children.forEach(e => {
          //       e.disabled = true;
          //     });
          //   });
          // });
        }
      });
    },
    // 根据标段项目id获取分包单位
    searchSubByProjectId(id) {
      // 清空物料
      this.accessoryList = [{ id: 1, materialName: "", materialTypeName: "", unitName: "", applyNum: "" }];
      if (this.form.issueCode === "delivery_subcontract") {
      this.getSubList()
      }
      this.findApplyPurchaseOrderByProjectId();
    },
    // 施工单位登录 根据标段id获取分包单位下拉列表
    projectIdChange(id) {
      this.searchData.fkCustomerId = "";
      //  选择全部禁用分包单位下拉选择
      if (id == "") {
        this.searchData.fkCustomerId = "";
        this.options = [];
      } else if (this.user.orgType == 4||this.user.orgType == 10) {
        this.$api.subcontractorList({ projectId: id, customType: 4 }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.customName;
              item.value = item.pkId;
            });
            this.options = res.data;
          }
        });
      }
    },
    // 获取标段项目
    getItemListNoUserId() {
      this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });

          this.noProjectData = res.data;
        }
      });
    },
    // 获取分页列表
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      };
      const obj = { ...params, ...this.searchData };
      this.loading = true;
      if (this.topRadio == "1") {
        this.$api
          .pageApplicationform(obj)
          .then(res => {
            if (res.code === 200) {
              this.tableData = res.data.records;
              this.total = res.data.total - 0;
              this.loading = false;
            } else {
              this.loading = false;
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else if (this.topRadio == "2") {
        this.$api
          .searchOrderOutApplyPage(obj)
          .then(res => {
            if (res.code === 200) {
              this.tableData = res.data.records;
              this.total = res.data.total - 0;
              this.loading = false;
            } else {
              this.loading = false;
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    // 项目部登录 获取分包单位 下拉列表
    subcontractor() {
      this.$api.subcontractor().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.pkId;
          });
          this.options = res.data;
        }
      });
    },
    // 查看
    lookOver(item, num) {
      this.isCollapse = 0;
      this.num = num;
      if (num == 3) {
        this.title = "处理物资申请单";
      } else {
        this.title = "物资申请单信息";
      }
      this.btnStatus = true;
      this.queryUserinfo(item.pkId);
      this.popup = true;
    },
    lookOver2(item, num) {
      this.num = num;
      if (num == 3) {
        this.title2 = "处理物资申请单";
      } else {
        this.title2 = "物资申请单信息";
      }
      this.btnStatus = true;
      this.findOrderOutApplyById(item.pkId);
      this.popup2 = true;
    },
    // 新增
    addRecord() {
      // 控制弹框底部按钮
      this.num = 0;
      this.btnStatus = false;
      this.isCollapse = 0;
      // 清空对象
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.accessoryList = [{ id: 1, materialName: "", materialTypeName: "", unitName: "", applyNum: "" }];
      // 获取申请单号
      this.$api.getBusinessCode({ businessType: 11 }).then(res => {
        if (res.code === 200) {
          this.form.orderCode = res.data.typeCode;
          this.allowModify = res.data.allowModify;
          this.limitNum = res.data.limitNum;
          this.typeCode = res.data.typeCode;
        } else {
          this.$message.warning(res.msg);
        }
      });
      this.fkPurchaseId = "";
      this.title = "新增物资申请单";
      this.popup = true;
      // 如果标段项目有数据，新增里面的默认选第一个
      this.$nextTick(() => {
        if (this.noProjectData.length) {
          this.form.fkBidProjectId = this.noProjectData[0].pkId;
          this.searchItemsByProjectId(this.form.fkBidProjectId);
        }
      });
      const time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      this.form.serviceTime = time;
      this.form.leaderName = this.user.userName;
      this.form.createUserName = this.user.userName
    },
    addRecord2() {
      // 控制弹框底部按钮
      this.num = 0;
      this.btnStatus = false;
      this.isCollapse = 0;
      // 清空对象
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.accessoryList = [{ id: 1, materialName: "", materialTypeName: "", unitName: "", applyNum: "" }];
      // 获取申请单号
      this.$api.getBusinessCode({ businessType: 11 }).then(res => {
        if (res.code === 200) {
          this.form.orderCode = res.data.typeCode;
          this.allowModify = res.data.allowModify;
          this.limitNum = res.data.limitNum;
          this.typeCode = res.data.typeCode;
        } else {
          this.$message.warning(res.msg);
        }
      });
      this.title2 = "新增物资申请单";
      this.popup2 = true;
      this.form.issueCode=this.outObjectList.length?this.outObjectList[0].keyName:""
      this.fkPurchaseId={}
      this.random = Math.random();
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
      // 如果标段项目有数据，新增里面的默认选第一个
      // this.$nextTick(() => {
      //   if (this.noProjectData.length) {
      //     this.form.fkBidProjectId = this.noProjectData[0].pkId;
      //     this.searchItemsByProjectId(this.form.fkBidProjectId);
      //   }
      // });
      const time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      this.form.serviceTime = time;
      this.form.leaderName = this.user.userName;
      this.form.createUserName = this.user.userName
    },
    // 编辑
    editRecord(item) {
      this.num = 2;
      this.btnStatus = false;
      this.queryUserinfo(item.pkId);
      this.title = "编辑物资申请单";
      this.popup = true;
    },
    // 编辑
    editRecord2(item) {
      this.num = 2;
      this.btnStatus = false;
      this.findOrderOutApplyById(item.pkId, true);
      this.title2 = "编辑物资申请单";
      this.popup2 = true;
    },
    // 根据id查询pkID数据
    queryUserinfo(id) {
      this.$api.queryApplicationform({ pkId: id }).then(res => {
        if (res.code == 200) {
          // 1查看还是2编辑
          if (this.num != 2) {
            this.associationItems2 = res.data.itemName;
          } else {
            // 根据标段id获取关联项目树形
            this.searchItemsByProjectId(res.data.fkBidProjectId);
            this.$nextTick(() => {
              this.form.associationItems = res.data.fkItemIds;
              this.$refs.selectTree2.setTreeSelect2(res.data.fkItemIds);
            });
          }
          this.accessoryList = res.data.orderApplyMaterialDetails;
          this.form.pkId = res.data.pkId;
          this.form.fkBidProjectId = res.data.fkBidProjectId;
          this.form.createTime = res.data.createTime; // 录入时间
          this.form.createUserName = res.data.createUserName; // 制单人
          this.form.customName = res.data.customName;
          this.form.leaderName = res.data.leaderName;
          this.form.orderCode = res.data.orderCode;
          this.form.serviceTime = res.data.serviceTime;
          this.form.remark = res.data.remark;
          this.form.reason = res.data.reason;
          this.form.confirmUserName = res.data.confirmUserName;
          this.form.reasonTime = res.data.reasonTime;
          this.form.confirmTime = res.data.confirmTime;
          this.form.applyCode = res.data.applyCode;
          this.tableBills = res.data.relationInputInventoryVos; // 入库单
          this.tableBills2 = res.data.relationOutInventoryVos; // 出库单

          this.typeCode = res.data.orderCode;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findOrderOutApplyById(id, isTrue) {
      this.$api.findOrderOutApplyById({ pkId: id }).then(res => {
        if (res.code === 200) {
          this.form.pkId = res.data.pkId;
          this.form.fkBidProjectId = res.data.fkBidProjectId;
          this.form.projectName = res.data.projectName;
          this.form.createTime = res.data.createTime; // 录入时间
          this.form.createUserName = res.data.createUserName; // 制单人
          this.form.customName = res.data.customName;
          this.form.leaderName = res.data.leaderName;
          this.form.orderCode = res.data.orderCode;
          this.form.serviceTime = res.data.serviceTime;
          this.form.remark = res.data.remark;
          this.form.reason = res.data.reason;
          this.form.confirmUserName = res.data.confirmUserName;
          this.form.reasonTime = res.data.reasonTime;
          this.form.confirmTime = res.data.confirmTime;
          this.form.applyCode = res.data.applyCode;
          this.form.issueCode = res.data.issueCode;
          this.form.supplierName = res.data.supplierName;
          this.allowModify = res.data.allowModify;
          this.accessoryList = res.data.materialDetailsVoList.map(item => ({ ...item, purchaseNum: item.purchaseApplyNum, providedNum: item.purchaseProvidedNum, materialTypeName: item.fkTypeName, unitName: item.fkUnitName }));
          const arr = res.data.reOutApplyVoList;
          this.form.fkPurchaseId = arr.length ? arr[0].fkPurchaseId : "";
          this.fkPurchaseId = { pkId: this.form.fkPurchaseId, orderCode: arr.length ? arr[0].purchaseOrderCode : "" };
          this.random = Math.random();
          if (isTrue) {
            this.findApplyPurchaseOrderByProjectId();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 删除
    deleteRecord(pkId) {
      this.$confirm("确定删除该申请单信息？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api
          .deleteApplicationform({ pkId })
          .then(res => {
            if (res.code === 200) {
              this.$message.success("删除成功");
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    deleteRecord2(pkId) {
      this.form.pkId = pkId;
      this.$confirm("确定撤回该物资申请单？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.modifyState(1);
      });
    },
    // 删除
    deleteApply(pkId) {
      this.$confirm("确定删除该申请单信息？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api
          .delOrderOutApply({ pkId })
          .then(res => {
            if (res.code === 200) {
              this.$message.success("删除成功");
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    deleteApply2(pkId) {
      this.form.pkId = pkId;
      this.$confirm("确定撤回该物资申请单？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.modifyState2(1);
      });
    },
    // num控制是保存草稿还是新增
    submit(formName, num) {
      // accessoryList是物料信息 编辑赋值的原始值，也是增加删除后的现有值 筛选处出来给到this.form.orderApplyMaterialDetails 传后端
      this.form.orderApplyMaterialDetails = [];
      this.accessoryList.forEach(item => {
        if (item.materialName && item.applyNum) {
          this.form.orderApplyMaterialDetails.push(item);
        }
      });
      if (this.form.orderApplyMaterialDetails.length === 0) {
        return this.$message.warning("请选择物料和申请数量");
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            applyCode: num,
            fkBidProjectId: this.form.fkBidProjectId,
            fkItemIds: this.form.associationItems,
            leaderName: this.form.leaderName, // moment().format("YYYY-MM-DD HH:mm:ss"),
            orderCode: this.form.orderCode,
            serviceTime: this.form.serviceTime,
            remark: this.form.remark,
            orderApplyMaterialDetails: this.form.orderApplyMaterialDetails
          };
          if (this.typeCode == data.orderCode) {
            data.isUpdate = 0;
          } else {
            data.isUpdate = 1;
          }
          this.loading = true;
          if (this.title != "编辑物资申请单") {
            data.allowModify = this.allowModify;
            data.limitNum = this.limitNum;
            this.$api
              .addApplicationform(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  if (num == 0) {
                    this.$message.success("保存草稿成功");
                  } else {
                    this.$message.success("新增成功");
                  }
                  this.getData();
                  this.popup = false;
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              })
              .catch(err => {
                this.loading = false;
              });
          } else {
            data.pkId = this.form.pkId;
            this.$api
              .editApplicationform(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: res.msg
                  });
                  this.getData();
                  this.popup = false;
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              })
              .catch(err => {
                this.loading = false;
              });
          }
        } else {
          return false;
        }
      });
    },
    close() {
      //  this.$nextTick(() => {
      //   this.$refs.form.resetFields();
      // });
      this.popup = false;

      this.form.orderApplyMaterialDetails = [];
    },
    submit2(formName, num) {
      // accessoryList是物料信息 编辑赋值的原始值，也是增加删除后的现有值 筛选处出来给到this.form.orderApplyMaterialDetails 传后端
      this.form.materialDetailList = [];
      this.accessoryList.forEach(item => {
        if (item.materialName && item.applyNum) {
          this.form.materialDetailList.push(item);
        }
      });
      if (this.form.materialDetailList.length === 0) {
        return this.$message.warning("请选择物料和申请数量");
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            applyCode: num,
            fkBidProjectId: this.form.fkBidProjectId,
            leaderName: this.form.leaderName, // moment().format("YYYY-MM-DD HH:mm:ss"),serviceTime
            orderCode: this.form.orderCode,
            serviceTime: this.form.serviceTime,
            remark: this.form.remark,
            materialDetailList: this.form.materialDetailList,
            fkCustomerId: this.form.fkCustomerId,
            fkPurchaseId: this.form.fkPurchaseId,
            issueCode: this.form.issueCode
          };
          if (this.typeCode == data.orderCode) {
            data.isUpdate = 0;
          } else {
            data.isUpdate = 1;
          }
          this.loading = true;
          if (this.title2 != "编辑物资申请单") {
            // data.allowModify = this.allowModify;
            // data.limitNum = this.limitNum;
            this.$api
              .addOrderOutApply(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  if (num == 0) {
                    this.$message.success("保存草稿成功");
                  } else {
                    this.$message.success("新增成功");
                  }
                  this.getData();
                  this.popup2 = false;
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              })
              .catch(err => {
                this.loading = false;
              });
          } else {
            data.pkId = this.form.pkId;
            this.$api
              .updateOrderOutApply(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: res.msg
                  });
                  this.getData();
                  this.popup2 = false;
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message({
                    type: "error",
                    message: res.msg
                  });
                }
              })
              .catch(err => {
                this.loading = false;
              });
          }
        } else {
          return false;
        }
      });
    },
    close2() {
      //  this.$nextTick(() => {
      //   this.$refs.form.resetFields();
      // });
      this.popup2 = false;

      this.form.orderApplyMaterialDetails = [];
    },
    // 外面搜索按钮
    queryData() {
      this.pageNum = 1;
      this.getData();
    },
    // 添加物料
    addAcc(row) {
      this.accessoryList = [
        ...this.accessoryList,
        {
          fkMaterialId: "", // 永远不会重复的id
          materialName: "",
          fkTypeName: "",
          unitName: "",
          applyNum: ""
        }
      ];
    },
    // 删除物料
    delAcc(row, index) {
      if (this.accessoryList.length === 1) {
        this.accessoryList = [{ fkMaterialId: "", materialName: "", fkTypeName: "", unitName: "", applyNum: "" }];
      } else {
        this.accessoryList.splice(index, 1);
      }
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
      this.$refs.tableBox.bodyWrapper.scrollTo(0, 0);
    },
    // 点击那一页
    handleCurrentChange(data) {
      this.pageNum = data;
      this.getData();
      this.$refs.tableBox.bodyWrapper.scrollTo(0, 0);
    },
    restoreSelect2(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        // fkBidProjectId, fkWarehouseId, fkCustomerId, purchaseIds, orderCode;
        this.findApplyPurchaseOrderByProjectId();
      }
    },
    remoteMethod2(query) {
      if (query !== "") {
        clearTimeout(this.timer);
        this.loading2 = true;
        this.timer = setTimeout(() => {
          this.findApplyPurchaseOrderByProjectId(query);
        }, 200);
      } else {
        // 请求初始列表
        this.findApplyPurchaseOrderByProjectId(query);
      }
    },
    change2(e) {
      if (!e) {
        this.accessoryList = [{ fkMaterialId: "", materialName: "", fkTypeName: "", unitName: "", applyNum: "" }];
        this.form.fkPurchaseId = e;
      } else {
        this.form.fkPurchaseId = e.pkId;
        this.accessoryList = e.materialDetailsVoList.map(item => ({
          materialPrice: item.price,
          applyNum: "",
          fkMaterialId: item.fkMaterialId,
          materialName: item.materialName,
          materialTypeName: item.materialTypeName,
          unitName: item.unitName,
          providedNum: item.providedNum,
          purchaseNum: item.purchaseNum
        }));
      }
      this.random = Math.random();
    },
    // 采购计划单
    findApplyPurchaseOrderByProjectId(orderCode) {
      const data = { pageNum: 1, pageSize: 20, fkBidProjectId: this.form.fkBidProjectId, purchaseIds: this.form.fkPurchaseId, orderCode };
      if (this.form.issueCode === "delivery_project") {
        delete data.fkCustomerId;
      }
      this.$api
        .findApplyPurchaseOrderByProjectId(data)
        .then(res => {
          this.loading2 = false;
          if (res.code === 200) {
            this.planBuyList = res.data.map(item => ({ ...item, value: item.pkId, label: item.orderCode }));
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.wraper {
  border: 1px solid #333333;
  width: 100%;
  height: 100%;
}
.form-data {
  display: flex;
  align-items: center;
  height: 80px;
  background-color: #fff;
  /deep/ .el-form-item {
    margin-bottom: 0 !important;
  }
}
.people {
  width: 15%;
  height: 696px;
  padding: 25px 0 25px 20px;
  // padding: 20px 60px 0 20px;
  // padding-left: 20px;
  border: 1px solid #ebeef5;
  font-size: 13px;
}
.form-input {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.form-flex {
  display: flex;
}
.sech-form {
  background-color: #f3f3f3;
  margin-bottom: 10px;
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
}
.seek {
  margin-left: 20px;
  height: 28px;
}
.add-staff {
  position: absolute;
  right: 40px;
}
.wh {
  width: 100%;
}
/deep/ .el-dialog__body {
  margin-top: 10px;
  // height: 100%;
  .el-form {
    /deep/ .el-form-item {
      margin-bottom: 16px !important;
    }
  }
}
// 确认人
.affirm {
  margin-left: 54px;
  border: 1px dotted #333333;
  padding: 10px;
  .person {
    display: flex;
    justify-content: space-between;
  }
}
.material {
  text-align: center;
}
.table1 {
  height: 300px !important;
}
.table2 {
  height: 380px !important;
}
.dialog-footer {
  position: absolute;
  width: 100%;
  height: 60px;
  bottom: 0px;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #f6f6f6;
  .certainty {
    margin: 0 20px 0 35px;
  }
}
.dialog-footer2 {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  .certainty {
    margin: 0 20px 0 35px;
  }
}
// 设置弹框里面输入框行高
.row-height {
  /deep/ .el-form-item {
    margin-bottom: 10px;
    .el-form-item__error {
      top: 31px;
    }
  }
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
  color: #424242;
  background-color: #f6f6f6;
  border-radius: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.tab-one {
  border: 1px solid #f3e7e7;
  padding: 10px;
}
.altitude{
  // 设置弹框高度
  /deep/ .el-dialog {
    min-height: 760px;
  }
}
.tab-two {
  height: 620px;
}
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
// 设置时间格式
.time-wh {
  width: 100% !important;
}
.selectFac {
  cursor: pointer;
  vertical-align: middle;
}
.blue {
  color: #02aff4;
  cursor: pointer;
}
.supTable {
  height: 350px;
}
</style>
