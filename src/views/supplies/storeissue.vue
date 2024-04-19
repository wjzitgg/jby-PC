<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bgc search-mr">
      <el-form :model="searchData" class="form-data">
        <el-form-item label="标段项目" label-width="80px" v-if="user.orgType != 5">
          <!-- <el-select v-model="searchData.projectBidId" size="mini" @change="projectIdChange">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label"
              :value="item.value"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
        <el-form-item class="writeTime" label="出库对象" label-width="80px" v-if="typeShow">
          <el-select v-model="searchData.typeCode" size="mini" class="wh-100" @change="typeCodeChange">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="(item, idx) in statusData" :key="idx" :label="item.keyVal" :value="item.keyName"></el-option>
          </el-select>
          <el-select v-model="searchData.fkCustomerId" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in options" :key="item.pkId" :label="item.customName" :value="item.pkId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" label-width="60px" v-if="typeShow">
          <el-select v-model="searchData.issueCode" size="mini" class="wh-100">
            <el-option label="全部" value=""></el-option>
            <el-option label="草稿" value="0" v-if="![2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)"></el-option>
            <el-option label="待出库" value="1"></el-option>
            <el-option label="部分出库" value="2"></el-option>
            <el-option label="已终止" value="3"></el-option>
            <el-option label="已完成" value="4"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item class="writeTime" label="单据日期" label-width="90px" v-if="typeShow">
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.beginTime"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-100" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="单据编号" label-width="90px" v-if="typeShow">
          <el-input v-model="searchData.orderCode" size="mini" maxlength="50"></el-input>
        </el-form-item>
        <el-button v-if="typeShow" size="mini" type="primary" icon="el-icon-search" class="seek" @click="queryData">查询</el-button>
        <el-button v-if="typeShow" type="primary" v-has="'supplies:storeissue:add'" size="mini" class="add-staff" @click="addRecord">新增发料单</el-button>
      </el-form>
    </div>
    <div class="tab-container" v-if="typeShow">
      <div class="table-data" style="height: 75%" :tooltip-effect="'light'">
        <el-table :data="tableData" v-loading="loading" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="projectBidName" label="标段项目" align="center" v-if="user.orgType == 4"> </el-table-column>
          <el-table-column prop="orderCode" label="单据编号" align="center"> </el-table-column>
          <el-table-column prop="customerName" label="出库对象" align="center"> </el-table-column>
          <el-table-column prop="warehousingName" label="关联入库单" align="center"> </el-table-column>
          <el-table-column prop="applyName" label="关联物资申请单" align="center"> </el-table-column>
          <el-table-column prop="createUserName" label="填表人" align="center"> </el-table-column>
          <el-table-column prop="serviceTime" label="单据时间" align="center"> </el-table-column>
          <el-table-column prop="typeCode" label="出库类型" align="center" v-if="user.orgType == 4"></el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.issueCode == 0">草稿</span>
              <span v-if="row.issueCode == 1">待出库</span>
              <span v-if="row.issueCode == 2"> 部分出库</span>
              <span v-if="row.issueCode == 3">已终止</span>
              <span v-if="row.issueCode == 4">已完成</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="400">
            <template slot-scope="{ row }">
              <el-button plain size="mini" v-has="'supplies:storeissue:query'" @click="lookOver(row)">查看</el-button>
              <el-button plain size="mini" v-if="row.isUpdate == 1" v-has="'supplies:storeissue:update'" type="primary" @click="editRecord(row)">编辑</el-button>
              <el-button plain size="mini" v-if="row.isTermination == 1" v-has="'supplies:storeissue:termination'" type="info" @click="lookOver(row, 1)">终止</el-button>
              <el-button plain size="mini" v-if="row.isWithdraw == 1" v-has="'supplies:storeissue:withdraw'" type="danger" @click="revocation(row.pkId)">撤回</el-button>
              <el-button plain size="mini" v-if="row.isDelete == 1" v-has="'supplies:storeissue:delete'" type="danger" @click="deleteRecord(row.pkId)">删除</el-button>
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
    <el-dialog :close-on-press-escape="false" width="70%" :title="title" :visible="popup" v-dialogDrag :close-on-click-modal="false" v-loading="loading" @close="close" top="3vw">
      <div class="dialog-form">
        <el-radio-group v-model="tabPosition" style="margin-bottom: 10px" size="mini" v-if="form.issueCode != '草稿' && form.issueCode != '待出库' && title != '新增发料单'">
          <el-radio-button label="top">发料单</el-radio-button>
          <el-radio-button label="right">出库单</el-radio-button>
        </el-radio-group>
        <el-form v-show="tabPosition == 'top'" :model="form" :rules="rules" ref="form" class="row-height">
          <el-row :span="24" class="el-row-data">
            <el-col :span="8">
              <el-form-item label="发料单号" prop="orderCode" label-width="110px">
                <el-input v-model="form.orderCode" size="mini" :disabled="btnStatus || !!allowModify" :maxlength="limitNum"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="出库对象" prop="typeCode" label-width="110px">
                <el-select v-if="!this.btnStatus" v-model="form.typeCode" size="mini" class="wh" @change="stockChange" :disabled="btnStatus">
                  <el-option v-for="(item, idx) in statusData" :key="idx" :label="item.keyVal" :value="item.keyName"></el-option>
                </el-select>
                <el-input v-else v-model="form.typeCodeName" size="mini" disabled :maxlength="limitNum"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="stockLabel" prop="fkCustomerId" label-width="110px" v-if="form.typeCode == 'delivery_supplier' || form.typeCode == 'delivery_subcontract'">
                <el-select v-model="form.fkCustomerId" size="mini" class="wh" @change="fkCustomerChange" :disabled="btnStatus">
                  <el-option v-for="(item, idx) in fkCustomerList" :key="idx" :label="item.customName" :value="item.pkId"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="出库仓库" prop="fkWarehouseId" label-width="110px">
                <el-select v-if="!btnStatus" size="mini" v-model="form.fkWarehouseId" class="wh" :disabled="btnStatus" @change="fkWarehouseChange">
                  <el-option v-for="item in fkWarehouse" :key="item.pkId" :label="item.warehouseName" :value="item.pkId"></el-option>
                </el-select>
                <el-input v-else v-model="form.fkWarehouseName" size="mini" :disabled="btnStatus"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="填表人" prop="leaderName" label-width="110px">
                <el-input v-model="form.leaderName" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="业务时间" prop="serviceTime" label-width="110px">
                <el-date-picker size="mini" type="datetime" :disabled="btnStatus" class="wh" value-format="yyyy-MM-dd HH:mm:ss" v-model="form.serviceTime"></el-date-picker>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="8" v-if="btnStatus">
              <el-form-item label="制单人" label-width="110px">
                <el-input v-model="form.createUserName" size="mini" disabled></el-input>
              </el-form-item>
            </el-col> -->
            <el-col :span="8" v-if="btnStatus">
              <el-form-item label="录入时间" label-width="110px">
                <el-input v-model="form.createTime" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单据金额" label-width="110px" v-if="pricePermission">
                <el-input v-model="form.totalAmount" size="mini" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="关联入库单" prop="warehousingIds" label-width="110px">
                <!-- 启用远程搜索，需要设置 filterable 和 remote -->
                <!-- <el-select size="mini" collapse-tags multiple filterable remote :remote-method="remoteMethod" @visible-change="restoreSelect" reserve-keyword v-model="form.godownEntry" class="wh" :disabled="btnStatus" :loading="loading2" v-if="!btnStatus">
                <el-option v-for="item in noProjectData" :key="item.pkId" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-tooltip class="item" effect="light" placement="bottom-start" v-else>
                <div slot="content">
                  <div v-for="(item, idx) in noProjectData" :key="idx">{{ item.label }}</div>
                </div>
                <div class="tree-box">
                  <span v-for="(item, idx) in noProjectData" :key="idx">{{ item.label }}，</span>
                </div>
              </el-tooltip> -->
                <div v-if="!btnStatus">
                  <el-select size="mini" collapse-tags multiple filterable remote :remote-method="remoteMethod" value-key="pkId" @visible-change="restoreSelect" reserve-keyword @change="warehousingChange" v-model="form.warehousingIds" class="wh" :disabled="btnStatus" :loading="loading2">
                    <!-- <el-tooltip class="item" effect="dark" content="置灰提示：待检和不合格材料不可合并出库" placement="bottom-start"> -->
                    <el-option v-for="item in warehousingList" :disabled="item.disabled" :key="item.pkId" :label="item.orderCode" :value="item"></el-option>
                    <!-- </el-tooltip> -->
                  </el-select>
                  <!-- <span>置灰提示：待检和不合格材料不可合并出库</span> -->
                </div>

                <el-tooltip class="item" effect="light" placement="bottom-start" v-else>
                  <div slot="content">
                    <div>{{ form.warehousingName }}</div>
                  </div>
                  <div class="tree-box">
                    <span>{{ form.warehousingName }}</span>
                  </div>
                </el-tooltip>
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="btnStatus">
              <el-form-item label="单据状态" label-width="110px">
                <el-select size="mini" v-model="form.issueCode" class="wh" :disabled="btnStatus">
                  <el-option label="草稿" value="0"></el-option>
                  <el-option label="待出库" value="1"></el-option>
                  <el-option label="部分出库" value="2"></el-option>
                  <el-option label="已终止" value="3"></el-option>
                  <el-option label="已完成" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="关联申请单" prop="applyIds" label-width="110px" v-if="form.typeCode == 'delivery_subcontract'">
                <!-- 启用远程搜索，需要设置 filterable 和 remote -->
                <el-select size="mini" collapse-tags multiple filterable remote :remote-method="remoteMethod" @visible-change="restoreSelect" reserve-keyword @change="applyIdsChange" v-model="form.applyIds" class="wh" :disabled="btnStatus" :loading="loading2" v-if="!btnStatus">
                  <el-option v-for="item in noProjectData" :key="item.pkId" :label="item.label" :value="item"></el-option>
                </el-select>
                <el-tooltip class="item" effect="light" placement="bottom-start" v-else>
                  <div slot="content">
                    <div>{{ form.applyName }}</div>
                  </div>
                  <div class="tree-box">
                    <span>{{ form.applyName }}</span>
                  </div>
                </el-tooltip>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label-width="110px">
                <label slot="label">收料地址</label>
                <el-input v-model="form.receiptAddress" size="mini" :disabled="btnStatus" class="wh"> </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label-width="110px">
                <label slot="label">备&emsp;&emsp;注</label>
                <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" v-model="form.remark" maxlength="200" class="wh" :disabled="btnStatus"> </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <h3 v-show="tabPosition == 'top'" class="material">物料信息</h3>
        <div v-show="tabPosition == 'top'" class="table-data table1">
          <el-table :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :key="random" :tooltip-effect="'light'">
            <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
            <!-- 查看或者新增样式好看点 if  else -->
            <!-- <el-table-column label="物料名称" align="center" prop="materialName" v-if="form.godownEntry.length == 0">
          <template slot-scope="{ row }">
            <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)">
              <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
            </el-input>
          </template>
        </el-table-column> -->
            <el-table-column label="物料名称" align="center" width="170px" prop="materialName" v-if="form.warehousingIds.length == 0">
              <template slot-scope="{ row }">
                <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)">
                  <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
                </el-input>
              </template>
            </el-table-column>
            <!-- 查看或者处理状态 -->
            <el-table-column label="物料名称" align="center" prop="materialName" v-else> </el-table-column>
            <el-table-column label="物料分类" align="center" prop="materialTypeName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="检测状态" align="center">
              <template slot-scope="{ row }">
                <span v-if="row.passStatus == 0">合格</span>
                <span v-if="row.passStatus == 1">不合格</span>
                <span v-if="row.passStatus == 2">待检测</span>
              </template>
            </el-table-column>
            <el-table-column label="供应商" align="center" prop="customerName">
              <template slot-scope="{ row }">{{ row.fkCustomerId === "0" ? "无" : row.customerName }}</template>
            </el-table-column>
            <el-table-column label="单位" width="80" align="center" prop="unitName"> </el-table-column>
            <el-table-column v-if="!btnStatus" :label="form.warehousingIds.length == 0 && form.applyIds.length == 0 ? '库存数量' : '可出库数量'" align="center" prop="supplyNum"> </el-table-column>
            <!-- 查看或者新增样式好看点 if  else -->
            <el-table-column label="需出库数量" width="120px" align="center" prop="grantNum" v-if="(!btnStatus && form.warehousingIds == undefined) || form.warehousingIds == null || form.warehousingIds.length == 0">
              <template slot-scope="{ row }">
                <el-input v-model.trim="row.grantNum" type="number" @input="totalMoney($event, row, 1)" size="mini" maxlength="100"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="需出库数量" width="120px" align="center" prop="grantNum" v-else> </el-table-column>
            <el-table-column label="物料单价" width="120px" align="center" prop="materialPrice" v-if="(!btnStatus && pricePermission && form.warehousingIds == undefined) || form.warehousingIds == null || form.warehousingIds.length == 0">
              <template slot-scope="{ row }">
                <el-input v-model.trim="row.materialPrice" type="number" :disabled="row.bool && pricePermission2" @input="totalMoney($event, row, 2)" size="mini" maxlength="100"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="物料单价" width="120px" align="center" v-else-if="pricePermission || form.warehousingIds.length" prop="materialPrice"> </el-table-column>
            <el-table-column label="金额" align="center">
              <template slot-scope="{ row }">
                <!-- <el-input v-model.trim="row.materialPrice" type="number" size="mini" maxlength="100"></el-input> -->
                <!-- <span>{{row.grantNum}}</span>
            <span>{{row.materialPrice}}</span> -->
                <span v-if="row.materialPrice == undefined || row.grantNum == undefined"></span>
                <span v-else>{{ (row.grantNum * row.materialPrice).toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="100" v-if="!btnStatus && form.warehousingIds.length == 0">
              <template slot-scope="{ row, $index }">
                <span class="addAcc" v-if="accessoryList.length == $index + 1" @click="addAcc(row)" title="新增">
                  <i class="el-icon-plus"></i>
                </span>
                <span class="delAcc" @click="delAcc(row)" title="删除">
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
        <div v-if="tabPosition == 'right'" class="table-data table1" style="min-height: 500px">
          <el-table :data="relationOutInventoryVos" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :key="random">
            <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
            <el-table-column label="出库单号" align="center" width="170px" prop="materialName">
              <template slot-scope="{ row }">
                <span style="color: #02a7f0" @click="orderClick(row, 4)">{{ row.orderCode }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单据时间" align="center" prop="createTime"> </el-table-column>
            <el-table-column label="出库仓库" align="center" prop="warehouseName"> </el-table-column>
            <el-table-column label="出库人" align="center" prop="receiverName"></el-table-column>
            <el-table-column label="出库时间" align="center" prop="receiverTime"></el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" v-if="!btnStatus">
        <!-- @close="close -->
        <el-button type="primary" @click="submit('form', 0)" v-if="!btnType">保存草稿</el-button>
        <el-button type="primary" @click="submit('form', 2)" v-if="btnType">确认终止</el-button>
        <el-button type="primary" class="certainty" @click="submit('form', 1)" v-if="!btnType">确认单据</el-button>
        <el-button type="primary" plain @click="popup = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 终止弹窗 -->
    <el-dialog :visible.sync="centerDialogVisible" width="30%" center>
      <div class="dialog-form">
        <span>请输入终止原因:</span>
        <div>
          <el-input type="textarea" :rows="5" placeholder="请输入内容" v-model="reason"> </el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="termination">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 选择物料弹框 这里根据出库对象传id拿物料信息 -->
    <materialsSelect :materDialog.sync="materDialog" @getSelect="getSelect" :materialIds="materialIds" :outTypeCode="form.typeCode" :fkWarehouseId="form.fkWarehouseId" :showType="2" :type="2" :isSubtra="true" :fkCustomId="form.fkCustomerId" v-if="num != 1"></materialsSelect>
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"></checkOrderDialog>
  </div>
</template>

<script>
import pageInation from "../../components/tablePaging";
import selectTree from "../../components/selectTree/selectTree.vue"; // 引入自定义下拉树形组建
import materialsSelect from "../../components/materialsSelect/materialsSelect.vue"; // 物料选择
import checkOrderDialog from "./components/checkOrderDialog.vue"; // 查询出入库单信息
import moment from "moment";
export default {
  name: "storeissue",
  data() {
    return {
      // 搜索数据
      searchData: {
        projectBidId: "",
        typeCode: "",
        fkCustomerId: "",
        issueCode: "",
        beginTime: "",
        endTime: "",
        orderCode: ""
      },
      options: [],
      options2: [],
      noProjectData: [], // 标段项目
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
        receiptAddress: "",
        content: "",
        hierarchyType: "1",
        totalAmount: "",
        enclosures: []
      },
      title: "",
      rules: {
        fkWarehouseId: [
          {
            required: true,
            message: "请选择出库仓库",
            trigger: ["blur"]
          }
        ],
        leaderName: [
          {
            required: true,
            message: "请输入负责人",
            trigger: ["blur"]
          }
        ],
        orderCode: [
          {
            required: true,
            message: "请输入出库需求编号",
            trigger: ["blur"]
          }
        ],
        serviceTime: [
          {
            required: true,
            message: "请选择业务时间",
            trigger: ["blur"]
          }
        ],
        typeCode: [
          {
            required: true,
            message: "请选择出库对象",
            trigger: ["blur"]
          }
        ]
      },
      // 物料
      accessoryList: [{ id: "", name: "", classify: "", unit: "", num: "" }],
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose"
      },
      stateType: 4, // 完成状态
      btnStatus: false, // 按钮是查看还是新增控制输入框状态
      btnType: 0,
      loading2: false,
      list: [
        { label: "远程搜索", value: "1223", pkId: "123" },
        { label: "远程搜索2", value: "1233", pkId: "1231" },
        { label: "远程搜索3", value: "12345", pkId: "1232" },
        { label: "大菠萝", value: "1234", pkId: "234" },
        { label: "菠萝", value: "12", pkId: "2344" },
        { label: "傻菠萝", value: "121", pkId: "23443" }
      ],
      materDialog: false, // 控制物料选择
      rowData: {}, // 物料当前行数据
      random: Math.random(),
      num: 1, // 1 查看 2 处理  3 编辑
      statusData: [],
      stockLabel: "分包单位",
      fkCustomerList: [],
      fkWarehouse: [],
      warehousingList: [],
      centerDialogVisible: false,
      reason: "",
      tabPosition: "top",
      materialIds: "",
      allowModify: "",
      limitNum: "",
      typeCode: "",
      relationOutInventoryVos: [],
      checkOrderDialog: false,
      orderType: 4,
      orderPkId: "",
      typeShow: true
    };
  },
  components: {
    pageInation,
    selectTree,
    materialsSelect,
    checkOrderDialog
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
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
    }
  },
  mounted() {
    // if (this.user.orgType == 4 || this.user.orgType == 7) {
    //   this.getItemListNoUserId();
    // }
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        this.getData();
        // 获取分项工程 新增编辑查看用
        this.searchItemsByProjectId("");
        this.$store.dispatch("getDictionariesData", 26).then(res => {
          console.log("=================字典======================");
          console.log(res);
          console.log("=================字典======================");
          this.statusData = res;
        });
        this.findSelfWarehouse();
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.searchData.projectBidId = arr[1];
        } else {
          this.searchData.projectBidId = arr[0];
        }
        if (isTrue) {
          this.queryData();
        }
        this.projectIdChange(this.searchData.projectBidId);
      }
    },
    orderClick(item, type) {
      this.orderType = type;
      this.orderPkId = item.pkId;
      this.checkOrderDialog = true;
    },
    totalMoney(e, val, type) {
      if (type == 1) {
        console.log(val);
        console.log(e);
        val.grantNum = val.grantNum.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, "$1");

        if (val.grantNum - 0 > val.supplyNum) {
          val.grantNum = val.supplyNum;
          return this.$message.warning("出库数量，不能大于库存数量");
        }
      } else if (type == 2) {
        val.materialPrice = val.materialPrice.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
      }
      let sum = 0;
      this.accessoryList.forEach(item => {
        if (item.grantNum != undefined && item.materialPrice != undefined) {
          sum = item.grantNum * item.materialPrice + sum;
          this.form.totalAmount = sum.toFixed(2);
        }
      });
    },
    fkCustomerChange(val) {
      // return  console.log(val)
      this.form.totalAmount = "";
      this.form.warehousingIds = []; // 清空关联入库单
      this.accessoryList = [];
      this.relationOutInventoryVos = [];
      this.form.applyIds = [];
      if (this.form.typeCode == "delivery_subcontract") {
        const data = {
          fkCustomerId: val,
          pageNum: 1,
          pageSize: 100,
          customerType: 4
        };
        if (this.form.warehousingIds.length) {
          console.log(this.form.warehousingIds);
          data.inputIds = [];
          this.form.warehousingIds.forEach(item => {
            data.inputIds.push(item.pkId);
          });
          data.inputIds = data.inputIds.toString();
        }

        this.$api.getOrderApply(data).then(res => {
          res.data.forEach(item => {
            item.label = item.orderCode;
            item.value = item.pkId;
          });
          this.noProjectData = res.data;
        });
      }

      if (this.form.fkWarehouseId != "" && this.form.fkWarehouseId.length != 0) {
        this.findOrderInputBy(this.form.fkWarehouseId);
      }
    },
    warehousingChange(data) {
      data.forEach(item => {
        if (item.materialVos == undefined) {
          this.warehousingList.forEach(e => {
            if (item.pkId == e.pkId) {
              item.materialVos = e.materialVos;
            }
          });
        }
      });
      this.form.applyIds = [];
      if (this.form.typeCode == "delivery_subcontract" && this.form.fkCustomerId != "") {
        const data = {
          fkCustomerId: this.form.fkCustomerId,
          pageNum: 1,
          pageSize: 100,
          customerType: 4,
          inputIds: []
        };
        if (this.form.warehousingIds.length) {
          console.log(this.form.warehousingIds);
          this.form.warehousingIds.forEach(item => {
            data.inputIds.push(item.pkId + "");
          });
        }
        data.inputIds = data.inputIds.join();
        this.$api.getOrderApply(data).then(res => {
          res.data.forEach(item => {
            item.label = item.orderCode;
            item.value = item.pkId;
          });
          this.noProjectData = res.data;
        });
      }
      if (data.length) {
        if (data[0].isMultiple == 1) {
          this.warehousingList.forEach(item => {
            if (data[0].pkId != item.pkId) {
              item.disabled = true;
            }
          });
          this.form.applyIds = [];
        } else {
          this.warehousingList.forEach(item => {
            if (data[0].pkId != item.pkId) {
              item.disabled = item.isMultiple == 1;
            }
          });
        }
      } else {
        this.warehousingList.forEach(item => {
          item.disabled = false;
        });
      }
      if (data.length === 0) {
        this.form.orderApplyMaterialDetails = [];
        return (this.accessoryList = [{ myId: (Math.random() + new Date().getTime()).toString(32).slice(0, 8), fkMaterialId: "", materialName: "", materialTypeName: "", unitName: "", purchaseNum: "" }]); // 初始化物料
      }
      this.accessoryList = [];
      const arr = data;

      arr.forEach(item => {
        if (item.materialVos !== undefined) {
          this.warehousingList.forEach(e => {
            if (item.pkId == e.pkId) {
              item.materialVos = e.materialVos;
            }
          });
        }
      });
      const dataArr = [];
      // 取出物料保存在dataArr
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].materialVos.length; j++) {
          arr[i].materialVos[j].purchaseNum = arr[i].materialVos[j].supplyNum;
          arr[i].materialVos[j].fkMaterialId = arr[i].materialVos[j].pkId;
          arr[i].materialVos[j].unitName = arr[i].materialVos[j].fkUnitName;
          arr[i].materialVos[j].materialTypeName = arr[i].materialVos[j].fkTypeName;
          arr[i].materialVos[j].grantNum = arr[i].materialVos[j].supplyNum;
          arr[i].materialVos[j].materialPrice = arr[i].materialVos[j].price;

          dataArr.push(arr[i].materialVos[j]);
        }
      }
      // 添加到物料信息 去重合并数量
      const baseArr = [];
      const newArry = [];
      for (const i in dataArr) {
        if (baseArr.includes(dataArr[i].pkId)) {
          newArry[baseArr.indexOf(dataArr[i].pkId)].purchaseNum += dataArr[i].purchaseNum;
          newArry[baseArr.indexOf(dataArr[i].pkId)].grantNum += dataArr[i].grantNum;
          console.log("xxxxxxxxxxxxx");
          console.log(dataArr[i]);
          console.log(newArry[baseArr.indexOf(dataArr[i].pkId)]);
          console.log("xxxxxxxxxxxxx");
          // grantNum
        } else {
          baseArr.push(dataArr[i].pkId);
          newArry.push(dataArr[i]);
        }
      }
      console.log(newArry);
      console.log("------------------");
      console.log(dataArr);
      console.log("------------------");
      console.log(baseArr);
      this.accessoryList = newArry.map(item => ({ ...item }));
      let sum = 0;
      this.accessoryList.forEach(item => {
        if (item.grantNum != undefined && item.materialPrice != undefined) {
          sum = item.grantNum * item.materialPrice + sum;
          this.form.totalAmount = sum.toFixed(2);
        }
      });

      // ======================
    },

    applyIdsChange(data) {
      // return console.log(data)
      // data.forEach(item=>{
      //   item.fkCustomerId = 0;
      //   item.isQualified = 0
      // })
      console.log(data);
      if (data.length === 0) {
        // this.form.orderApplyMaterialDetails = [];
        // :materialIds="materialIds"
        // return
        this.materialIds = "";
        // return (this.accessoryList = [{ fkMaterialId: 1, materialName: "", materialTypeName: "", unitName: "", purchaseNum: "" }]); // 初始化物料
      } else {
        const arr = [];
        data.forEach(item => {
          arr.push(item.pkId);
          item.materialVos.forEach((e, i) => {
            //
            // this.accessoryList[i].grantNum = e.supplyNum
          });
        });
        this.materialIds = arr.join(",");
      }
      return;
      // this.accessoryList = [];
      const arr = data;
      const dataArr = [];
      // 取出物料保存在dataArr
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].materialVos.length; j++) {
          arr[i].materialVos[j].purchaseNum = arr[i].materialVos[j].supplyNum;
          arr[i].materialVos[j].fkMaterialId = arr[i].materialVos[j].pkId;
          arr[i].materialVos[j].unitName = arr[i].materialVos[j].fkUnitName;
          arr[i].materialVos[j].materialTypeName = arr[i].materialVos[j].fkTypeName;
          arr[i].materialVos[j].passStatus = 0;
          arr[i].materialVos[j].fkCustomerId = 0;
          dataArr.push(arr[i].materialVos[j]);
        }
      }
      // 添加到物料信息 去重合并数量
      const baseArr = [];
      const newArry = [];
      for (const i in dataArr) {
        if (baseArr.includes(dataArr[i].pkId)) {
          newArry[baseArr.indexOf(dataArr[i].pkId)].purchaseNum += dataArr[i].purchaseNum;
        } else {
          baseArr.push(dataArr[i].pkId);
          newArry.push(dataArr[i]);
        }
      }
      console.log(newArry);
      console.log("------------------");
      console.log(dataArr);
      console.log("------------------");
      console.log(baseArr);
      this.accessoryList = newArry.map(item => ({ ...item }));
    },
    findSelfWarehouse() {
      this.$api.findSelfWarehouse().then(res => {
        if (res.code == 200) {
          this.fkWarehouse = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    typeCodeChange(val) {
      this.searchData.fkCustomerId = "";
      const data = {};
      if (val == "delivery_supplier") {
        data.customType = 3;
        data.supplierType = 1;
      } else if (val == "delivery_subcontract") {
        data.customType = 4;
      } else {
        return (this.options = []);
      }
      if ([4, 10].includes(this.user.orgType)) {
        data.projectBidId = this.searchData.projectBidId;
      }
      this.$api.searchNoLinkOrgId(data).then(res => {
        if (res.code == 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    stockChange(val) {
      const data = {};
      this.form.warehousingIds = [];
      this.form.applyIds = [];
      this.warehousingList = [];
      this.noProjectData = [];
      this.form.fkCustomerId = "";
      this.form.fkWarehouseId = "";
      this.form.totalAmount = "";
      this.accessoryList = [];
      this.relationOutInventoryVos = [];
      if (val == "delivery_supplier") {
        this.stockLabel = "供应商";
        data.customType = 3;
        data.supplierType = 1;
      } else if (val == "delivery_subcontract") {
        this.stockLabel = "分包单位";
        data.customType = 4;
      } else {
        // this.form.fkCustomerId = "0"
        if (this.form.fkWarehouseId != "") {
          this.findOrderInputBy(this.form.fkWarehouseId);
        }
        return (this.fkCustomerList = []);
      }
      // return console.log(val);
      this.$api.searchNoLinkOrgId(data).then(res => {
        if (res.code == 200) {
          this.fkCustomerList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
      // this.findOrderInputBy(this.form.fkWarehouseId);

      this.accessoryList = [{ myId: (Math.random() + new Date().getTime()).toString(32).slice(0, 8), fkMaterialId: "", materialName: "", materialTypeName: "", unitName: "", purchaseNum: "" }];
    },
    fkWarehouseChange(val) {
      this.form.totalAmount = "";
      this.form.warehousingIds = []; // 清空关联入库单
      this.accessoryList = [];
      this.relationOutInventoryVos = [];
      if (this.form.typeCode == "") {
        return;
      }
      if (this.form.typeCode == "delivery_supplier" || this.form.typeCode == "delivery_subcontract") {
        if (this.form.fkCustomerId != "") {
          this.findOrderInputBy(val);
        }
      } else {
        this.findOrderInputBy(val);
      }
    },
    findOrderInputBy(id) {
      const data = { fkWarehouseId: id, issueCode: this.form.typeCode, fkCustomerId: this.form.fkCustomerId, pageNum: "1", pageSize: "1000" };
      this.$api.findOrderInputByWarehouseId(data).then(res => {
        if (res.code == 200) {
          this.warehousingList = res.data;
          // this.warehousingList.forEach(item =>{
          //   // if(item.isMultiple==1){
          //     item.disabled = item.isMultiple==1?true:false
          //   // }
          // })
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // // 在字典获取状态
    // this.$store.dispatch("getDictionariesData", 26).then(res => {
    //   this.statusData = res;
    // });
    selectMater(item) {
      console.log(item);
      if (this.form.typeCode == "delivery_subcontract" || this.form.typeCode == "delivery_supplier") {
        const msg = this.form.typeCode == "delivery_subcontract" ? "分包单位" : "供应商";
        if (this.form.fkCustomerId == "") {
          return this.$message.warning("请先选择" + msg);
        }
      }
      if (this.form.fkWarehouseId == "") {
        return this.$message.warning("请选择先出库仓库");
      }
      this.rowData = item;
      this.materDialog = true;
    },
    // 物料选择
    getSelect(row) {
      let idStatus = false;
      row.grantNum = row.supplyNum;
      this.accessoryList.forEach(item => {
        if (item.fkMaterialId == row.pkId) {
          idStatus = true;
          return this.$message.warning("不能添加相同的物料信息");
        }
      });
      if (!idStatus) {
        this.rowData.fkMaterialId = row.pkId;
        this.rowData.materialName = row.materialName;
        this.rowData.materialTypeName = row.fkTypeName;
        this.rowData.unitName = row.fkUnitName; // 单位
        this.rowData.supplyNum = row.supplyNum;
        this.rowData.passStatus = row.passStatus;
        this.rowData.fkCustomerId = row.fkCustomerId;
        this.rowData.customerName = row.customerName;
        // this.rowData.grantNum = row.supplyNum;
        this.$set(this.rowData, "grantNum", row.supplyNum);

        // supplyNum
      }
      console.log("***************************************");
      console.log(this.accessoryList);
      console.log("***************************************");
      // 解决table刷新数据问题
      this.random = Math.random();
      // this.accessoryList.forEach(item => {
      //   if (item.fkMaterialId == row.pkId) {
      //     item.grantNum = row.supplyNum;
      //   }
      // });
    },
    // 下拉框失去焦点还原原始下拉数据l
    restoreSelect(boole) {
      console.log(boole);
      // 下拉框关闭就请求原始数据
      if (!boole) {
        console.log(boole);
        // this.getItemListNoUserId();
      }
    },
    // 远程输入搜索
    remoteMethod(query) {
      if (query !== "") {
        this.loading2 = true;
        setTimeout(() => {
          this.loading2 = false;
          this.noProjectData = this.list.filter(item => {
            return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }, 200);
      } else {
        // this.getItemListNoUserId();
      }
    },
    // 树形选中事件
    checked2(arr, obj) {
      console.log(arr);
    },
    inspectTypeChange(val) {
      this.$api.searchByCompanyType({ type: val }).then(res => {
        this.form.companyName = res.data;
      });
    },
    // 获取分项工程
    searchItemsByProjectId(id) {
      this.$api.searchItemsByProjectId({ projectId: id }).then(res => {
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
    // 施工单位登录 根据标段id获取分包单位下拉列表
    projectIdChange(id) {
      // this.searchData.fkProjectId = "";
      //  选择全部禁用分包单位下拉选择
      if (id == "") {
        // this.searchData.fkProjectId = "";
        this.options = [];
      } else if (this.user.orgType == 4) {
        this.$api.subcontractorList({ projectId: id, customType: 4 }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.customName;
              item.value = item.fkLinkOrgId;
            });
            // this.options = res.data;
          }
        });
      }
    },
    // 获取标段项目
    // getItemListNoUserId() {
    //   this.$api.getItemListNoUserId().then(res => {
    //     if (res.code == 200) {
    //       res.data.forEach(item => {
    //         item.label = item.projectName;
    //         item.value = item.pkId;
    //       });

    //       // this.noProjectData = res.data;
    //     }
    //   });
    // },
    // 获取分页列表
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      };
      const obj = { ...params, ...this.searchData };
      this.loading = true;
      this.$api
        .orderOrdinaryApplySearchPage(obj)
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
    },
    // 查看
    lookOver(item, btnType) {
      this.btnType = btnType;
      this.tabPosition = "top";
      this.btnStatus = true;
      if (btnType == 1) {
        this.btnStatus = false;
      }
      this.queryUserinfo(item.pkId);
      this.title = "发料单信息";
      this.popup = true;
    },
    // 新增
    addRecord() {
      this.num = 0;
      this.tabPosition = "top";
      this.btnStatus = false;
      // 清空对象
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.title = "新增发料单";
      this.$api.getBusinessCode({ businessType: 4 }).then(res => {
        if (res.code === 200) {
          this.form.orderCode = res.data.typeCode;
          this.allowModify = res.data.allowModify;
          this.limitNum = res.data.limitNum;
          this.typeCode = res.data.typeCode;
        } else {
          this.$message.warning(res.msg);
        }
      });
      // this.accessoryList = [];
      this.accessoryList = [{ myId: (Math.random() + new Date().getTime()).toString(32).slice(0, 8), fkMaterialId: "", materialName: "", materialTypeName: "", grantNum: "", unitName: "", purchaseNum: "" }];
      const time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      this.form.serviceTime = time;
      this.form.leaderName = this.user.userName;
      this.popup = true;
    },
    // 编辑
    editRecord(item) {
      this.tabPosition = "top";
      this.btnStatus = false;
      this.queryUserinfo(item.pkId);
      this.title = "编辑发料单";
      this.popup = true;
    },
    queryUserinfo(id) {
      this.loading = true;

      this.$api.orderOrdinaryApplyById({ pkId: id }).then(res => {
        this.loading = false;
        if (res.code == 200) {
          // res.data.inspectType = res.data.inspectType.toString();
          this.form = res.data;
          this.accessoryList = res.data.orderOrdinaryDetails;
          this.accessoryList.forEach(item => {
            item.myId = (Math.random() + new Date().getTime()).toString(32).slice(0, 8);
            item.passStatus = item.passStatus;
            item.supplyNum = item.stockNum;
          });
          this.typeCode = res.data.orderCode;
          this.relationOutInventoryVos = res.data.relationOutInventoryVos == null ? [] : res.data.relationOutInventoryVos;
          const data = {};
          if (res.data.typeCode == "delivery_supplier") {
            this.stockLabel = "供应商";
            data.customType = 3;
            data.supplierType = 1;
          } else if (res.data.typeCode == "delivery_subcontract") {
            this.stockLabel = "分包单位";
            data.customType = 4;
          } else {
            this.fkCustomerList = [];
          }
          if (this.form.fkWarehouseId.length && !this.btnStatus) {
            this.findOrderInputBy(this.form.fkWarehouseId);
          }
          // form.warehousingIds

          if (this.form.warehousingIds.length) {
            const arr1 = [];
            this.form.warehousingIds.forEach(item => {
              arr1.push({ pkId: item, value: item });
            });
            this.form.warehousingIds = arr1;
          }
          if (this.form.applyIds.length) {
            const arr2 = [];
            this.form.applyIds.forEach(item => {
              arr2.push({ pkId: item, value: item });
            });
            this.form.applyIds = arr2;
          }
          if (this.btnStatus) {
            //   this.form.typeCode = res.data.typeCodeName
            //   // this.form.fkWarehouseId = res.data.fkWarehouseName
            // this.customerName
            this.form.fkCustomerId = res.data.customerName;
          }
          // form.fkCustomerId
          // console.log()
          if (!this.btnStatus && res.data.typeCodeName != "无") {
            this.fkCustomerChange(this.form.fkCustomerId);
            this.$api.searchNoLinkOrgId(data).then(res => {
              if (res.code == 200) {
                this.fkCustomerList = res.data;
              } else {
                this.$message.warning(res.msg);
              }
            });
          }

          this.loading = false;
        } else {
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // 删除
    deleteRecord(pkId) {
      this.$confirm("确定删除该发料需求单？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api
          .orderOrdinaryApplyDelete({ pkId })
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    // 撤回
    revocation(id) {
      this.$confirm("确定撤回该发料需求单？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        const data = {
          businessType: 1,
          pkId: id,
          reason: ""
        };
        this.$api
          .updateOrdinaryApplyByBusinessType(data)
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    termination() {
      const data = {
        businessType: 2,
        pkId: this.form.pkId,
        reason: this.reason
      };
      this.$api.updateOrdinaryApplyByBusinessType(data).then(res => {
        if (res.code == 200) {
          this.centerDialogVisible = false;
          this.$message({
            type: "success",
            message: "终止成功"
          });
          this.getData();
          this.popup = false;
          this.$refs[formName].resetFields();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    submit(formName, code) {
      if (code == 2) {
        this.reason = "";
        return (this.centerDialogVisible = true);
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          const url = JSON.stringify(this.fileList);
          const data = {
            fkWarehouseId: this.form.fkWarehouseId,
            // issueCode: this.form.issueCode,
            leaderName: this.form.leaderName,
            orderCode: this.form.orderCode,
            serviceTime: this.form.serviceTime,
            typeCode: this.form.typeCode,
            applyIds: [],
            fkCustomerId: this.form.fkCustomerId,
            warehousingIds: [],
            receiptAddress: this.form.receiptAddress,
            orderOrdinaryDetails: this.form.orderOrdinaryDetails,
            remark: this.form.remark
          };

          if (data.fkCustomerId.length == 0) {
            data.fkCustomerId = 0;
          }

          // data.warehousingIds =["3123332"]
          // data.applyIds =["3122223332"]
          // data.orderOrdinaryDetails = [{ fkMaterialId: "1212", grantNum: "10", materialPrice: "30" }];
          this.form.applyIds.forEach(item => {
            data.applyIds.push(item.pkId);
          });

          this.form.warehousingIds.forEach(item => {
            if (item instanceof Object) {
              data.warehousingIds.push(item.pkId);
            } else {
              data.warehousingIds.push(item);
            }
          });
          data.issueCode = code;
          data.orderOrdinaryDetails = [];
          this.accessoryList.forEach(item => {
            if (item.grantNum != 0) {
            }
            if (item.fkMaterialId && item.grantNum > 0) {
              data.orderOrdinaryDetails.push({ fkMaterialId: item.fkMaterialId, grantNum: item.grantNum, materialPrice: item.materialPrice, passStatus: item.passStatus, fkCustomerId: item.fkCustomerId });
            }
          });
          console.log(this.accessoryList);
          // return console.log(this.accessoryList)grantNum
          // let arr = []orderOrdinaryDetails
          if (data.orderOrdinaryDetails.length == 1 && data.orderOrdinaryDetails[0].fkMaterialId == 1) {
            data.orderOrdinaryDetails = [];
          }
          if (data.typeCode == this.typeCode) {
            data.isUpdate = 0;
          } else {
            data.isUpdate = 1;
          }
          let status = false;
          data.orderOrdinaryDetails.forEach(item => {
            if (item.grantNum == 0) {
              status = true;
            }
          });
          if (status) {
            return this.$message.warning("出库数量不能为0");
          }
          this.loading = true;
          if (this.title == "新增发料单") {
            data.allowModify = this.allowModify;
            data.limitNum = this.limitNum;

            this.$api
              .addOrderOrdinaryApply(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "新增成功"
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
          } else {
            data.pkId = this.form.pkId;
            this.$api
              .orderOrdinaryApplyUpdate(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "编辑成功"
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
    // 弹窗取消按钮
    callOff() {
      this.popup = false;
    },
    close() {
      // if(this.$refs.form != undefined){
      //   this.$refs.form.resetFields();
      // }

      this.popup = false;
      this.btnType = 0;
    },
    // 外面搜索按钮
    queryData() {
      this.pageNum = 1;
      this.form.deptId = this.form.fkDeptId;
      this.form.roleId = this.addRoleIdList;
      this.getData();
    },
    // 添加物料
    addAcc(row) {
      this.accessoryList = [
        ...this.accessoryList,
        {
          myId: (Math.random() + new Date().getTime()).toString(32).slice(0, 8), // 永远不会重复的id
          fkMaterialId: "", // 永远不会重复的id
          materialName: "",
          materialTypeName: "",
          unitName: "",
          purchaseNum: "",
          supplyNum: ""
        }
      ];
    },
    // 删除物料
    delAcc(row) {
      if (this.accessoryList.length === 1) {
        this.accessoryList = [{ myId: (Math.random() + new Date().getTime()).toString(32).slice(0, 8), fkMaterialId: "", materialName: "", materialTypeName: "", unitName: "", purchaseNum: "", supplyNum: "" }];
      } else {
        this.accessoryList = this.accessoryList.filter(item => item.myId !== row.myId);
      }
    },
    // 物料选择事件
    cascaderChange(row) {
      console.log(this.$refs.cascader.getCheckedNodes());
      row.classify = this.$refs.cascader.getCheckedNodes()[0].pathLabels[0];
      row.name = this.$refs.cascader.getCheckedNodes()[0].value;
      // this.dopeSheet.fkMaterialId = ;
      // this.dopeSheet.detailName = this.$refs.cascader.getCheckedNodes()[this.$refs.cascader.getCheckedNodes().length - 1].data.typeName;
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
    },
    // 点击那一页
    handleCurrentChange(data) {
      // Object.keys(this.form).forEach(key => {
      //   if (this.form[key] instanceof Array) {
      //     this.form[key] = [];
      //   } else {
      //     this.form[key] = "";
      //   }
      // });
      this.pageNum = data;
      this.getData();
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
  width: 100% !important;
}

/deep/ .el-dialog__body {
  margin-top: 20px;

  .el-form {
    /deep/ .el-form-item {
      margin-bottom: 16px !important;
    }
  }
}

// 确认人
.affirm {
  margin-left: 80px;
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

.table1 {
  height: 300px !important;
}

.dialog-footer {
  display: flex;
  justify-content: center;

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

.el-row-data {
  display: flex;
  flex-wrap: wrap;
}

.tree-box {
  position: absolute;
  width: 100%;
  top: 5px;
  font-size: 12px;
  height: 28px;
  line-height: 28px;
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
</style>
