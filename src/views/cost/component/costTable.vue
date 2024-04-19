<template>
  <div class="app-container" v-loading="loading">
    <el-tabs v-model="radio" @tab-click="radioChange" v-if="typeShow">
      <el-tab-pane label="分包成本" name="1"></el-tab-pane>
      <el-tab-pane label="物资成本" name="2"></el-tab-pane>
      <el-tab-pane label="设备成本" name="3"></el-tab-pane>
      <el-tab-pane label="管理成本" name="4"></el-tab-pane>
      <el-tab-pane label="成本核算" name="5"></el-tab-pane>
    </el-tabs>
    <!-- 搜索栏 -->
    <div class="header-seach" v-if="searchBarShow">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="标段项目" v-if="user.orgType === 4 || user.orgType === 10">
          <!-- <el-select v-model="inpData.projectBidId" size="mini" class="wh-150" @change="proChange">
            <el-option value="" label="全部" v-if="proAllShow"></el-option>
            <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
        <el-form-item label="分包单位" v-if="(radio == 1 && typeShow) || (radio == 2 && radio2 == 2 && tableType == 2)" label-width="80px">
          <el-select v-model="inpData.fkBySettleOrgId" size="mini" class="wh-150" :disabled="user.orgType !== 5 && !inpData.projectBidId">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in subOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="材料类别" v-if="radio == 2 && typeShow" style="200px">
          <!-- <el-select v-model="inpData.materialTypeId" size="mini" class="wh-150">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in materOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select> -->
          <el-cascader size="mini" style="width: 140px" :options="materOptions" clearable :props="setProps" :emitPath="false" v-model="inpData.materialTypeId" filterable></el-cascader>
        </el-form-item>
        <el-form-item label="设备类型" v-if="radio == 3 && typeShow">
          <el-select v-model="inpData.deviceTypeId" size="mini" class="wh-150">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in facilityTypeOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="签订日期查询" label-width="96px" v-if="radio == 1 && tableType === 1 && typeShow">
          <el-date-picker size="mini" class="wh-150" value-format="yyyy-MM-dd" v-model="inpData.signDate"></el-date-picker>
        </el-form-item>
        <el-form-item label="截止日期" label-width="96px" v-if="radio == 1 && tableType === 2 && typeShow">
          <el-date-picker size="mini" class="wh-150" value-format="yyyy-MM-dd" v-model="inpData.settleEndDate"></el-date-picker>
        </el-form-item>
        <el-form-item label="期截止日期" label-width="96px" v-if="radio == 3 && tableType === 2 && typeShow">
          <el-date-picker v-model="inpData.endDate" class="wh-150" type="month" size="mini" value-format="yyyy-MM"> </el-date-picker>
        </el-form-item>
        <el-form-item label="出库截止日期" label-width="96px" v-if="radio == 2 && tableType === 2 && typeShow">
          <el-date-picker size="mini" style="width: 120px" value-format="yyyy-MM-dd" v-model="inpData.outWarehouseDate"></el-date-picker>
        </el-form-item>
        <el-form-item label="年度" v-if="(radio == 5 && tableType === 2 && radio4 !== 3) || (radio == 4 && tableType === 2 && typeShow)">
          <el-date-picker v-model="inpData.year" type="year" value-format="yyyy" size="mini"> </el-date-picker>
        </el-form-item>
        <el-form-item label="合同名称" v-if="radio == 1 && tableType === 1 && user.orgType == 5 && typeShow">
          <el-input size="mini" class="wh-150" v-model="inpData.contractName" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="期次名称" v-if="radio == 1 && tableType === 2 && typeShow">
          <el-input size="mini" class="wh-150" v-model="inpData.settleName"></el-input>
        </el-form-item>
        <el-form-item label="费用类别" v-if="radio == 4 && tableType === 1 && typeShow">
          <el-select size="mini" style="width:75%" v-model="inpData.fkClassId">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in typeMangerData" :key="item.pkId" :value="item.pkId" :label="item.className"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="材料名称" v-if="radio == 2 && typeShow">
          <el-input size="mini" class="wh-150" v-model="inpData.materialName" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="出库单" v-if="radio == 2 && radio2 === 2 && tableType === 2 && typeShow" label-width="60px">
          <el-input size="mini" class="wh-150" v-model="inpData.orderCodeLike" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="设备名称" v-if="radio == 3 && typeShow">
          <el-input size="mini" class="wh-150" v-model="inpData.deviceName" maxlength="50"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" icon="el-icon-search" class="ml-20 search" @click="btnSearch" v-if="searchBtnShow && typeShow">查询</el-button>
      </el-form>
      <div class="search-right" v-if="typeShow" :class="{ 'h-80': (tableType === 1 && radio == 4) || (tableType === 2 && radio == 5 && radio4 === 3) }">
        <el-radio-group v-model="radio2" v-if="radio == 2" class="mr-20" @change="materialRadio">
          <el-radio :label="1">自使用物资</el-radio>
          <el-radio :label="2">甲供不扣款</el-radio>
        </el-radio-group>
        <el-radio-group v-model="radio3" v-if="radio == 3" class="mr-20" @change="facilityRadio">
          <el-radio :label="1">设备购买</el-radio>
          <el-radio :label="2">设备租赁</el-radio>
        </el-radio-group>
        <el-radio-group v-model="radio4" v-if="radio == 5 && tableType === 2" @change="costRadio">
          <el-radio :label="1">月汇总</el-radio>
          <el-radio :label="2">季汇总</el-radio>
          <el-radio :label="3">年汇总</el-radio>
        </el-radio-group>
        <el-button size="mini" type="primary" @click="addbtn" v-has="'cost:duty:add'" v-if="(user.orgType === 5 && ['3', '4'].includes(radio) && tableType === 1) || (user.orgType === 5 && radio == 2 && tableType === 1)">新增</el-button>
      </div>
    </div>
    <div class="table-data" style="height:73%;margin-top: 10px;" v-if="typeShow">
      <!--分包成本 -->
      <el-table ref="tables1" :key="randomKey" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 1 && tableType === 1" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="projectName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="tableType === 1 ? '分包单位' : '结算对象'" prop="customerOrgName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="合同名称" prop="contractName" align="center"> </el-table-column>
        <el-table-column label="合同签订日期" prop="signDate" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="总设计产值（元）" prop="amount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="250">
          <template slot-scope="{ row }">
            <el-button v-if="tableType === 1" plain size="mini" type="primary" @click="checkDetail(row)" v-has="'cost:duty:query'">查看明细</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-table ref="tables1" :key="randomKey" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 1 && tableType === 2" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column label="结算对象" prop="settleOrgName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="期次名称" prop="settleName" align="center"> </el-table-column>
        <el-table-column label="结算周期" prop="settleCycle" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="上期末结算金额（元）" prop="lastSettleAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="本期结算金额(元）" prop="settleAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="本期末结算金额（元）" prop="endSettleAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="250">
          <template slot-scope="{ row }">
            <el-button size="mini" plain type="primary" @click="checkDetail(row)" v-has="'cost:actual:query'">查看明细</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!--物资成本自使用物资 -->
      <el-table ref="tables2" :key="randomKey1" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 2 && radio2 === 1" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType === 4" show-overflow-tooltip> </el-table-column>
        <el-table-column label="分包单位" prop="customName" align="center" v-if="radio2 === 2 && tableType != 1" show-overflow-tooltip> </el-table-column>
        <el-table-column label="合同名称" prop="contractName" align="center" v-if="radio2 === 2 && tableType != 1" show-overflow-tooltip> </el-table-column>
        <el-table-column label="材料类别" prop="materialTypeName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="材料名称" prop="materialName" align="center"> </el-table-column>
        <el-table-column label="单价" prop="price" align="center" show-overflow-tooltip v-if="tableType === 1"> </el-table-column>
        <el-table-column label="单价" prop="costPrice" align="center" show-overflow-tooltip v-if="tableType === 2"> </el-table-column>
        <el-table-column label="单位" prop="unitName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="计划量" prop="planNum" align="center" show-overflow-tooltip v-if="tableType === 1"> </el-table-column>
        <el-table-column label="出库量" prop="stockNum" align="center" show-overflow-tooltip v-if="tableType === 2"> </el-table-column>
        <el-table-column label="合计" prop="totalPrice" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" v-if="radio2 === 1 && user.orgType === 5" width="300">
          <template slot-scope="{ row }">
            <el-button plain size="mini" v-if="radio2 === 1 && user.orgType === 5 && tableType != 2" type="success" @click="materialUpdate(row)">编辑</el-button>
            <el-button plain size="mini" v-if="radio2 === 1 && user.orgType === 5 && tableType != 2" type="danger" @click="materialdel(row)">删除</el-button>
            <el-button size="mini" v-if="radio2 === 1 && tableType != 1" @click="checkMater(row)" v-has="'cost:duty:query'">查看明细</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 甲供不扣款 -->
      <el-table ref="tables2" :key="randomKey1" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 2 && radio2 === 2">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType === 4" show-overflow-tooltip> </el-table-column>
        <el-table-column label="分包单位" :prop="tableType == 1 ? 'customName' : 'customerName'" align="center" v-if="radio2 === 2 && tableType != 1" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="tableType == 1 ? '合同名称' : '出库单号'" :prop="tableType == 1 ? 'contractName' : 'orderCode'" align="center" v-if="radio2 === 2 && tableType != 1" show-overflow-tooltip> </el-table-column>
        <el-table-column label="材料类别" prop="materialTypeName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="材料名称" prop="materialName" align="center"> </el-table-column>
        <el-table-column label="单价" prop="price" align="center" show-overflow-tooltip v-if="tableType === 1"> </el-table-column>
        <el-table-column label="单价" prop="costPrice" align="center" show-overflow-tooltip v-if="tableType === 2"> </el-table-column>
        <el-table-column label="单位" prop="unitName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="计划量" prop="planNum" align="center" show-overflow-tooltip v-if="tableType === 1"> </el-table-column>
        <el-table-column label="出库量" prop="stockNum" align="center" show-overflow-tooltip v-if="tableType === 2"> </el-table-column>
        <el-table-column v-if="tableType == 2" label="供货时间" prop="deliveryTime" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="tableType == 1 ? '合计' : '材料金额'" prop="totalPrice" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center" width="300">
          <template slot-scope="{ row }">
            <!-- <el-button size="mini" @click="checkMater(row)" v-has="'cost:actual:query'">查看明细</el-button> -->
            <el-button plain size="mini" v-if="user.orgType === 5 && tableType != 2" type="success" @click="materialUpdate(row)">编辑</el-button>
            <el-button plain size="mini" v-if="user.orgType === 5 && tableType != 2" type="danger" @click="materialdel(row)">删除</el-button>
            <el-button size="mini" v-if="radio2 === 2 && tableType != 1" @click="checkMater(row)" v-has="'cost:duty:query'">查看明细</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!--设备成本 -->
      <el-table ref="tables3" :key="randomKey2" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 3" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType === 4" show-overflow-tooltip> </el-table-column>
        <el-table-column label="期次名称" prop="issueName" align="center" v-if="tableType === 2" show-overflow-tooltip> </el-table-column>
        <el-table-column label="设备类型" prop="className" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="设备名称" prop="deviceName" align="center"> </el-table-column>
        <el-table-column :label="radio3 === 1 ? '型号' : '设备型号'" prop="deviceCode" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="(radio3 === 1 ? '购买' : '租赁') + '单价'" prop="price" align="center" show-overflow-tooltip> </el-table-column>
        <!-- <el-table-column v-if="radio3 === 1" label="折旧期限" prop="liveTime" align="center" show-overflow-tooltip></el-table-column> -->
        <el-table-column label="单位" prop="unitName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column v-if="radio3 === 1" label="使用时间(折旧期限)" prop="liveTime" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column :label="(radio3 === 1 ? '月折旧价' : '月租金') + '（元）'" prop="depreciationPrice" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column :label="radio3 === 1 ? '购买数量（单位）' : '租赁数量'" prop="buyNum" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column v-if="radio3 === 2" :label="tableType == 1 ? '使用时间租赁' : '使用时间'" prop="liveTime" align="center" show-overflow-tooltip />
        <el-table-column :label="radio3 === 1 ? '月折旧总价' : '月租金合计'" :prop="tableType === 1 ? 'priceAmount' : 'priceTotal'" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="使用部位" prop="itemName" align="center" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="250px">
          <template slot-scope="{ row }">
            <el-button plain size="mini" type="primary" @click="openFacility(1, row, 3)" v-has="'cost:duty:query'" v-if="tableType === 1">查看</el-button>
            <el-button plain size="mini" type="primary" @click="openFacility(1, row)" v-has="'cost:actual:query'" v-if="tableType === 2">查看明细</el-button>
            <el-button plain size="mini" type="success" @click="openFacility(3, row)" v-if="tableType === 1" v-has="'cost:duty:update'">编辑</el-button>
            <el-button plain size="mini" type="danger" @click="facilitydel(row)" v-if="tableType === 1" v-has="'cost:duty:delete'">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!--管理成本 -->
      <el-table ref="tables4" :key="randomKey4" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 4" :show-summary="radio == 4" :summary-method="getSummaries2" :tooltip-effect="'light'">
        <el-table-column label="序号" type="index" align="center" width="80"> </el-table-column>
        <el-table-column label="费用类别" prop="className" align="center"> </el-table-column>
        <el-table-column label="费用" prop="costAmount" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" @click="openManageDialog(row, 1)">查看</el-button>
            <el-button plain size="mini" type="success" v-if="tableType === 1 && user.orgType === 5" @click="openManageDialog(row, 2)" v-has="'cost:duty:update'">编辑</el-button>
            <el-button plain size="mini" type="danger" v-if="tableType === 1 && user.orgType === 5" @click="manageDel(row)" v-has="'cost:duty:delete'">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- <div v-if="radio == 5 && tableType === 1" class="echartDiv">
        <Echart :option="echartOption" echartName="myEchart" mystyle="width: 80vw;height: 30vw;margin: 20px auto'" />
      </div> -->
      <!--成本核算 (责任)-->
      <el-table ref="tables5" :key="randomKey5" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 5 && tableType === 1" :tooltip-effect="'light'">
        <!-- <el-table-column label="标段项目" prop="projectBidName" align="center" v-if="user.orgType === 4" show-overflow-tooltip> </el-table-column> -->
        <el-table-column label="分包成本（元）" prop="customCost" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="物资成本" prop="" align="center">
          <el-table-column label="自使用物资（元）" prop="ownCost" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="甲供不扣款（元）" prop="nailCost" align="center" show-overflow-tooltip> </el-table-column>
        </el-table-column>
        <el-table-column label="设备成本" prop="" align="center" show-overflow-tooltip>
          <el-table-column label="设备购买（元）" prop="devicePurchase" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="设备租赁（元）" prop="deviceLease" align="center" show-overflow-tooltip> </el-table-column>
        </el-table-column>
        <el-table-column label="管理成本（元）" prop="costManage" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="合计" prop="totalAmount" align="center" show-overflow-tooltip> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!--成本核算 （实际）-->
      <el-table ref="tables5" :key="randomKey5" stripe :data="tableData" height="98%" :header-cell-style="{ background: '#f1f6ff' }" v-if="radio == 5 && tableType === 2" :show-summary="radio == 5" :summary-method="getSummaries">
        <!-- ['月份', '季度', '年度'] -->
        <el-table-column label="序号" align="center" type="index"> </el-table-column>
        <el-table-column label="月份" align="center" v-if="radio4 === 1">
          <template slot-scope="{ row }">
            {{ row.monthly + "月" }}
          </template>
        </el-table-column>
        <el-table-column label="季度" align="center" v-if="radio4 === 2">
          <template slot-scope="{ row }">
            {{ "第" + quarterList[row.quarter] + "季度" }}
          </template>
        </el-table-column>
        <el-table-column label="年度" align="center" v-if="radio4 === 3">
          <template slot-scope="{ row }">
            {{ row.year + "年" }}
          </template>
        </el-table-column>
        <el-table-column label="分包成本" prop="customCost" align="center"> </el-table-column>
        <el-table-column label="物资成本" prop="materialCost" align="center"> </el-table-column>
        <el-table-column label="设备成本" prop="deviceCost" align="center"> </el-table-column>
        <el-table-column label="管理成本" prop="costManage" align="center"> </el-table-column>
        <el-table-column label="合计成本" prop="totalAmount" align="center"> </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <tablePaging v-if="radio < 4 && typeShow" :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!--分包成本 查看明细弹框（责任） -->
    <ContractDialog :dialogVisible.sync="checkDialog1" :dialogShowType="1" :id="4" :user="$store.state.user" @refresh="closeCheckDialog" ref="ContractDialog" />
    <!--分包成本 查看明细弹框（实际） -->
    <!-- @updateList="getValuationList" -->
    <subDialog :dialogVisible.sync="checkDialog2" :dialogType="4" :orgType="user.orgType" :pkId="pkId" :settlementObject="1" :getItemOrgType="'1'" />
    <!-- 物资成本弹框(责任) -->
    <el-dialog :title="materialDialogTitle" :visible="materialDialog" @close="closeMaterialDialog" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form ref="materialForm" style="padding: 20px;" :rules="rules" :model="materialForm" label-width="80px">
        <el-form-item label="物料名称" prop="fkMaterialId">
          <el-cascader size="mini" style="width: 100%" key="pkId" :options="materialOptions" :props="setProps" :emitPath="false" v-model="materialForm.fkMaterialId" filterable ref="cascader"></el-cascader>
        </el-form-item>
        <el-form-item label="计划量" prop="planNum">
          <el-input v-model="materialForm.planNum" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="materialForm.planNum = $event.target.value"></el-input>
        </el-form-item>
        <el-form-item label="物料单价" prop="price">
          <el-input v-model="materialForm.price" size="mini" @input="materialForm.price = $limitInputNumber(materialForm.price, 999999999999.99, 0, 2)"></el-input>
        </el-form-item>
        <el-form-item label="物料总价">
          <el-input v-model="materialFormTotal" size="mini" disabled></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closeMaterialDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="materialDialogOk">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 物资成本弹框(实际) -->
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"></checkOrderDialog>
    <!-- 设备成本弹框 -->
    <facilityDialog :facilityDialogTitle="facilityDialogTitle" :tableType="tableType" :moreShow="tableType === 2" :facilityDialog="facilityDialog" @closeFacilityDialog="closeFacilityDialog" :openType="facilityOpenType" :dialogType="radio3" :deviceId="deviceId"></facilityDialog>
    <!-- 管理成本弹框 -->
    <el-dialog :title="manageDialogTitle" :visible="manageDialog" @close="closeManageDialog" width="35%" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-form ref="manageForm" :rules="rules" :model="manageForm" label-width="80px">
          <el-form-item label="费用类别" prop="fkClassId">
            <el-select size="mini" style="width:75%" v-model="manageForm.fkClassId" :disabled="manageDialogTitle == '费用信息'" v-if="manageDialogTitle != '费用信息'">
              <el-option v-for="item in typeMangerData" :key="item.pkId" :value="item.pkId" :label="item.className"></el-option>
            </el-select>
            <el-input v-model="manageForm.className" style="width:75%" size="mini" disabled v-if="manageDialogTitle == '费用信息'"></el-input>
            <span class="typeManger" v-if="manageDialogTitle != '费用信息'" @click="openTypeMangerDialog">类别管理</span>
          </el-form-item>
          <el-form-item label="金额" prop="costAmount">
            <el-input style="width:75%" v-model="manageForm.costAmount" size="mini" :disabled="manageDialogTitle == '费用信息'" @input="manageForm.costAmount = $limitInputNumber(manageForm.costAmount, 999999999999.99, 0, 2)">
              <span slot="append">元</span>
            </el-input>
          </el-form-item>
          <el-form-item label="费用排序" prop="sortval">
            <el-input style="width:75%" v-model="manageForm.sortval" maxlength="5" size="mini" :disabled="manageDialogTitle == '费用信息'" oninput="value=value.replace(/[^0-9]/g,'')" @blur="manageForm.sortval = $event.target.value"></el-input>
          </el-form-item>
          <!-- <el-form-item label="费用排序" prop="sortval">
            <el-input style="width:75%" v-model="manageForm.sortval" size="mini" :disabled="manageDialogTitle=='费用信息'"
              oninput="value=value.replace(/[^0-9]/g,'')" @blur="manageForm.sortval = $event.target.value"></el-input>
          </el-form-item> -->
          <el-form-item label="备    注">
            <el-input style="width:75%" v-model="manageForm.remark" :disabled="manageDialogTitle == '费用信息'" type="textarea" size="mini" :rows="4" :resize="'none'" maxlength="100"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" v-if="manageDialogTitle != '费用信息'">
        <el-button size="mini" @click="closeManageDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="manageDialogOk">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 类别管理弹框 -->
    <el-dialog title="类别管理" :visible="typeMangerDialog" @close="closeTypeMangerDialog" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="typeMangerDialog dialog-form">
        <el-table ref="typeMangerTables" stripe :data="typeMangerData" height="100%" :header-cell-style="{ background: '#f1f6ff' }">
          <el-table-column label="序号" type="index" align="center" width="80"> </el-table-column>
          <el-table-column label="类别名称" prop="className" align="center"> </el-table-column>
          <el-table-column align="center">
            <template slot="header" slot-scope="{ row }">
              <el-button size="mini" type="primary" @click="openTypeManger(1, row)">新增</el-button>
            </template>
            <template slot-scope="{ row }">
              <el-button plain size="mini" type="success" @click="openTypeManger(2, row)">编辑</el-button>
              <el-button plain size="mini" type="danger" @click="deleteType(row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
    </el-dialog>
    <el-dialog width="30%" top="15vw" :title="typeDialogTitle" :visible="typeDialog" @close="closeTypeDialog" center :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form ref="typeForm" class="dialog-form" :rules="rules" :model="typeForm" label-width="80px">
        <el-form-item label="类别名称" prop="className">
          <el-input size="mini" v-model="typeForm.className" maxlength="25"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="closeTypeDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="typeDialogOk">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 类别管理的操作弹框 -->
  </div>
</template>

<script>
import tablePaging from "@/components/tablePaging";
import ContractDialog from "../../contract/components/ContractDialog.vue";
import subDialog from "../../settlement/components/subDialog.vue";
import facilityDialog from "./facilityDialog.vue";
import checkOrderDialog from "../../supplies/components/checkOrderDialog.vue";
import Echart from "@/components/Echart.vue";
export default {
  props: {
    // 1为责任成本 2为实际成本
    tableType: {
      type: Number
    }
  },
  components: { tablePaging, ContractDialog, facilityDialog, subDialog, checkOrderDialog, Echart },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    materialFormTotal() {
      const pri = this.materialForm.planNum * this.materialForm.price;
      return pri.toFixed(2);
    }
  },
  data() {
    const priceValidator = (rule, value, callback) => {
      if (value > 999999999999.99) {
        callback(new Error("最大值为999999999999.99"));
      } else {
        callback();
      }
    };
    return {
      proOptions: [], // 标段下拉
      loading: false,
      radio: "1",
      radio2: 1,
      radio3: 1,
      radio4: 1,
      tableData: [],
      facilityTypeOptions: [],
      subOptions: [],
      materOptions: [],
      page: {
        pageSize: 10,
        pageNum: 1
      }, // 分页数据
      total: 0, // 分页总数
      materialTypeIds: [""],
      inpData: {
        projectBidId: "",
        deviceName: "",
        deviceTypeId: "",
        settleEndDate: "",
        fkBySettleOrgId: "",
        contractName: "",
        settleName: "",
        signDate: "",
        year: "",
        materialTypeId: "",
        materialName: "",
        endDate: "",
        orderCodeLike: "",
        outWarehouseDate: "",
        fkClassId: ""
      },
      searchData: {
        projectBidId: "",
        deviceName: "",
        deviceTypeId: "",
        settleEndDate: "",
        fkBySettleOrgId: "",
        contractName: "",
        settleName: "",
        signDate: "",
        year: "",
        materialTypeId: "",
        materialName: "",
        endDate: "",
        orderCodeLike: "",
        outWarehouseDate: "",
        fkClassId: ""
      },
      randomKey: Math.random(),
      randomKey1: Math.random(),
      randomKey2: Math.random(),
      randomKey3: Math.random(),
      randomKey4: Math.random(),
      randomKey5: Math.random(),
      searchBarShow: true,
      searchBtnShow: true,
      checkDialog: false,
      checkForm: {},
      activeName: "first",
      checkDialog1: false,
      checkDialog2: false,
      materialDialogTitle: "",
      materialDialog: false,
      materialDialogType: 1,
      materialOptions: [],
      material: "",
      materialForm: { fkMaterialId: "", planNum: "", price: "", sourceType: 0 },
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose",
        emitPath: false
      },
      facilityDialogTitle: "",
      facilityDialog: false,
      deviceId: "",
      facilityOpenType: 1,
      manageDialog: false,
      manageDialogTitle: "",
      manageForm: {
        costAmount: "",
        fkClassId: "",
        sourceType: 0,
        sortval: "",
        remark: ""
      },
      typeMangerOptions: [],
      typeMangerDialog: false,
      typeMangerData: [],
      typeMangerType: 1,
      typeDialog: false,
      typeDialogTitle: "",
      typeForm: {
        className: ""
      },
      pkId: "",
      accountList: {},
      totalData: {},
      rules: {
        className: [{ required: true, message: "请填写类别名称", trigger: "blur" }],
        fkMaterialId: [{ required: true, message: "请选择物料", trigger: "blur" }],
        planNum: [
          { required: true, message: "请填写计划量", trigger: "blur" },
          { validator: priceValidator, trigger: "blur" }
        ],
        price: [
          { required: true, message: "请填写物料单价", trigger: "blur" },
          { validator: priceValidator, trigger: "blur" }
        ],
        sortval: [{ required: true, message: "请填写排序值", trigger: "blur" }],
        fkClassId: [{ required: true, message: "请选择费用类别", trigger: "blur" }],
        costAmount: [{ required: true, message: "请填写金额", trigger: "blur" }]
      },
      subList: [],
      proAllShow: true,
      fkPurchaseId: "",
      fkInputIdList: [],
      fkOrdinaryId: "",
      fkApplyIdList: [],
      checkOrderDialog: false,
      orderType: 4,
      orderPkId: "",
      materialList: [],
      outStoreForm: { customerName: "", driverName: "", driverPhone: "", fkApplyIdList: [], fkBidProjectId: "", fkCustomerId: "", fkInputIdList: [], fkItemId: "", fkOrdinaryId: "", fkPurchaseId: "", fkWarehouseId: "", inventoryCode: "", issueCode: "delivery_unit", leaderName: "", orderCode: "", remark: "", serviceTime: "", vehicleNum: "" },
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
      issueCodeList: { delivery_unit: "无", delivery_supplier: "供应商", delivery_subcontract: "分包单位", delivery_project: "项目部", delivery_position: "施工部位" },
      quarterList: { 1: "一", 2: "二", 3: "三", 4: "四" },
      echartOption: {},
      typeShow: true
    };
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
      } else {
        this.$message.error(res.msg);
      }
    });
    if (this.user.orgType !== 5) {
      this.getAllProject();
    }
    this.getSubList();
    if (this.tableType === 1) {
      this.costSearchPage();
    } else {
      this.actualCostSearchPage();
    }
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.inpData.projectBidId = arr[1];
        } else {
          this.inpData.projectBidId = arr[0];
        }
        if (isTrue) {
          this.btnSearch();
        }
        this.proChange(this.inpData.projectBidId);
      }
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
    // 获取分包单位
    getSubList() {
      this.$api.subcontractor().then(res => {
        if (res.code === 200) {
          if (this.user.orgType === 5) {
            this.subOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
          } else {
            this.subList = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取设备类型
    searchByTree() {
      this.$api.searchByTree().then(res => {
        console.log(res);
        if (res.code === 200) {
          this.facilityTypeOptions = res.data.map(item => ({ ...item, value: item.pkId, label: item.className }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取材料分类
    conditionMaterialclassify() {
      this.$api.conditionMaterialclassify().then(res => {
        if (res.code === 200) {
          this.materOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 责任成本新增时获取的物料
    getMaterialsTree() {
      this.$api.getMaterialsTree({ customerId: "" }).then(res => {
        if (res.code === 200) {
          this.materialOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询费用分类表
    searchProjCostClass() {
      this.$api.searchProjCostClass().then(res => {
        console.log("分类表", res);
        if (res.code === 200) {
          this.typeMangerData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 责任分包成本分页
    costSearchPage() {
      const data = { ...this.page, projectBidId: this.searchData.projectBidId, fkCustomerId: this.searchData.fkBySettleOrgId, signDate: this.searchData.signDate, contractName: this.searchData.contractName };
      this.loading = true;
      this.$api
        .costSearchPage(data)
        .then(res => {
          console.log("责任分包成本", res);
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 实际分包成本分页
    actualCostSearchPage() {
      const data = { ...this.page, projectBidId: this.searchData.projectBidId, settleEndDate: this.searchData.settleEndDate, fkBySettleOrgId: this.searchData.fkBySettleOrgId, settleName: this.searchData.settleName };
      this.loading = true;
      this.$api
        .actualCostSearchPage(data)
        .then(res => {
          console.log("实际分包成本", res);
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 责任物资成本
    searchProjCostMaterialPage() {
      const data = {
        ...this.page,
        sourceType: this.radio2 === 1 ? 0 : 1,
        materialTypeId: this.searchData.materialTypeId,
        contractName: this.searchData.contractName,
        materialName: this.searchData.materialName,
        fkCustomerId: this.searchData.fkBySettleOrgId,
        projectBidId: this.searchData.projectBidId
      };

      console.log("c -----> ", 4444);
      this.loading = true;
      this.$api
        .searchProjCostMaterialPage(data)
        .then(res => {
          console.log("责任物资成本", res);
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 实际物资成本
    actualCostMaterSearchPage() {
      const data = {
        ...this.page,
        sourceType: this.radio2 === 1 ? 0 : 1,
        materialTypeId: this.searchData.materialTypeId,
        fkCustomerId: this.searchData.fkBySettleOrgId,
        materialName: this.searchData.materialName,
        outWarehouseDate: this.searchData.outWarehouseDate,
        projectBidId: this.searchData.projectBidId
      };
      if (this.radio2 === 2) {
        data.orderCodeLike = this.searchData.orderCodeLike;
        // data.outWarehouseDate = this.searchData.outWarehouseDate;
      }
      this.loading = true;
      this.$api
        .actualCostMaterSearchPage(data)
        .then(res => {
          console.log("实际物资成本", res);
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 责任设备分页列表
    facilitySearchPage() {
      const data = { ...this.page, sourceType: this.tableType === 1 ? 0 : 1, consumeType: this.radio3 === 1 ? 1 : 0, projectBidId: this.searchData.projectBidId, deviceName: this.searchData.deviceName, deviceTypeId: this.searchData.deviceTypeId };
      this.loading = true;
      this.$api
        .facilitySearchPage(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables3.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 实际设备分页列表
    actualDeviceCostSearchPage() {
      let time = "";
      if (this.searchData.endDate) {
        const arr = this.searchData.endDate.split("-");
        time = this.searchData.endDate + "-" + new Date(arr[0] - 0, arr[1] - 0, 0).getDate();
      }
      const data = { ...this.page, consumeType: this.radio3 === 1 ? 1 : 0, projectBidId: this.searchData.projectBidId, deviceName: this.searchData.deviceName, deviceTypeId: this.searchData.deviceTypeId, endDate: time };
      this.loading = true;
      this.$api
        .actualDeviceCostSearchPage(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.$refs.tables3.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 管理成本列表
    searchProCostByType() {
      const data = { projectBidId: this.searchData.projectBidId, sourceType: this.tableType === 1 ? 0 : 1, year: this.searchData.year };
      if (this.tableType === 1) {
        data.fkClassId = this.searchData.fkClassId;
      }
      this.loading = true;
      this.$api
        .searchProCostByType(data)
        .then(res => {
          console.log("管理成本", res);
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data;
            this.randomKey4 = Math.random();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 责任成本核算
    businessAccountList() {
      const data = { projectBidId: this.searchData.projectBidId };
      this.loading = true;
      this.$api
        .businessAccountList(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data;
            // this.randomKey5 = Math.random();
            let obj = res.data[0];
            this.echartOption = {
              tooltip: {
                trigger: "item"
              },
              legend: {
                data: ["分包成本", "自使用物资", "甲供不扣款", "设备购买", "设备租赁", "管理成本"],
                orient: "vertical",
                left: "left"
              },
              series: [
                {
                  name: "合计：" + obj.totalAmount,
                  type: "pie",
                  radius: "70%",
                  label: { position: "inner", fontSize: 14, color: "#ffffff" },
                  data: [
                    {
                      value: obj.customCost,
                      name: "分包成本"
                    },
                    {
                      value: obj.ownCost,
                      name: "自使用物资"
                    },
                    {
                      value: obj.nailCost,
                      name: "甲供不扣款"
                    },
                    {
                      value: obj.devicePurchase,
                      name: "设备购买"
                    },
                    {
                      value: obj.deviceLease,
                      name: "设备租赁"
                    },
                    {
                      value: obj.costManage,
                      name: "管理成本"
                    }
                  ]
                }
              ]
            };
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
        });
    },
    // 实际成本核算
    actualCostAccountList() {
      const data = { projectBidId: this.searchData.projectBidId, year: this.searchData.year, type: this.radio4 - 1 };
      if (this.radio4 === 3) {
        data.year = "";
      }
      this.loading = true;
      this.$api
        .actualCostAccountList(data)
        .then(res => {
          console.log("实际成本核算", res);
          this.loading = false;
          if (res.code === 200) {
            this.accountList = res.data;
            if (this.radio4 === 1) {
              this.tableData = res.data.monthlySummary.filter(item => item.monthly !== 13);
              this.totalData = res.data.monthlySummary.filter(item => item.monthly === 13)[0];
            } else if (this.radio4 === 2) {
              this.tableData = res.data.quarterSummary.filter(item => item.quarter !== 5);
              this.totalData = res.data.quarterSummary.filter(item => item.quarter === 5)[0];
            } else if (this.radio4 === 3) {
              this.tableData = res.data.yearSummary.filter(item => item.year !== 0);
              this.totalData = res.data.yearSummary.filter(item => item.year === 0)[0];
            }
            this.randomKey5 = Math.random();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
        });
    },
    // 新增按钮
    addbtn() {
      if (this.radio == 2) {
        this.materialDialogTitle = "新增物料成本";
        this.materialDialogType = 1;
        this.materialDialog = true;
        this.getMaterialsTree();
      } else if (this.radio == 3) {
        this.facilityOpenType = 2;
        this.facilityDialogTitle = this.radio3 === 1 ? "新增设备" : "新增租赁设备";
        this.facilityDialog = true;
      } else if (this.radio == 4) {
        this.manageDialogTitle = "新增管理成本";
        this.manageDialogType = 2;
        this.manageDialog = true;
      }
    },
    radioChange(e) {
      this.page = {
        pageSize: 10,
        pageNum: 1
      };
      this.radio2 = 1;
      this.radio3 = 1;
      this.radio4 = 1;
      // this.materialTypeIds = [""];
      this.cleanData();
      this.tableData = [];
      if (this.user.orgType !== 5) {
        if (e.name == 4 || (e.name == 5 && this.tableType === 2)) {
          // this.inpData.projectBidId = this.proOptions.length ? this.proOptions[0].value : "";
          // this.searchData.projectBidId = this.proOptions.length ? this.proOptions[0].value : "";
          this.proAllShow = false;
        } else {
          this.proAllShow = true;
        }
      }
      if (e.name == 1) {
        this.randomKey = Math.random();
        if (this.tableType === 1) {
          this.costSearchPage();
        } else {
          this.actualCostSearchPage();
        }
      } else if (e.name == 2) {
        this.conditionMaterialclassify();
        if (this.tableType === 1) {
          this.searchProjCostMaterialPage();
        } else {
          this.actualCostMaterSearchPage();
        }
      } else if (e.name == 3) {
        this.searchByTree();
        if (this.tableType === 1) {
          this.facilitySearchPage();
        } else {
          this.actualDeviceCostSearchPage();
        }
      } else if (e.name == 4) {
        if (this.tableType === 1) {
          this.searchProjCostClass();
        } else {
          const time = new Date().getFullYear() + "";
          // 直接赋值会导致日期选择器失效
          this.$set(this.inpData, "year", time);
          this.$set(this.searchData, "year", time);
        }
        this.searchProCostByType();
      } else if (e.name == 5) {
        this.randomKey5 = Math.random();
        const time = new Date().getFullYear() + "";
        // 直接赋值会导致日期选择器失效
        this.$set(this.inpData, "year", time);
        this.$set(this.searchData, "year", time);
        if (this.tableType === 1) {
          this.businessAccountList();
        } else {
          this.actualCostAccountList();
        }
      }
      // if (e.name == 4 && this.user.orgType === 4) {
      //   this.inpData.fkProjectId = this.proOptions.length ? this.proOptions[0].value : "";
      //   this.searchData.fkProjectId = this.proOptions.length ? this.proOptions[0].value : "";
      // }
      if (e.name == 5 && this.tableType == 1 && this.user.orgType == 5) {
        this.searchBarShow = false;
      } else {
        this.searchBarShow = true;
      }
      // if (e.name == 4 && this.tableType == 1 && this.user.orgType == 5) {
      //   this.searchBtnShow = false;
      // } else {
      //   this.searchBtnShow = true;
      // }
      console.log(this.searchBtnShow);
    },
    materialRadio(e) {
      this.randomKey1 = Math.random();
      this.materialTypeIds = [""];
      this.cleanData();
      if (this.tableType === 1) {
        this.searchProjCostMaterialPage();
      } else {
        this.actualCostMaterSearchPage();
      }
    },
    facilityRadio(e) {
      this.randomKey2 = Math.random();
      this.cleanData();
      if (this.tableType === 1) {
        this.facilitySearchPage();
      } else {
        this.actualDeviceCostSearchPage();
      }
    },
    costRadio(e) {
      this.randomKey5 = Math.random();
      this.cleanData();
      if (this.user.orgType !== 5) {
        if (this.tableType === 2) {
          // this.inpData.projectBidId = this.proOptions.length ? this.proOptions[0].value : "";
          // this.searchData.projectBidId = this.proOptions.length ? this.proOptions[0].value : "";
          this.proAllShow = false;
        } else {
          this.proAllShow = true;
        }
      }
      if (e === 3 && this.user.orgType === 5) {
        this.searchBtnShow = false;
      } else {
        this.searchBtnShow = true;
      }
      if (e !== 3) {
        const time = new Date().getFullYear() + "";
        // 直接赋值会导致日期选择器失效
        this.$set(this.inpData, "year", time);
        this.$set(this.searchData, "year", time);
      }
      this.tableData = [];
      this.totalData = {};
      this.actualCostAccountList();
    },
    proChange(e) {
      this.inpData.fkBySettleOrgId = "";
      if (e) {
        this.subOptions = this.subList.filter(item => item.fkProjectId === e);
      }
    },
    // 分包成本查看明细
    checkDetail(row) {
      if (this.tableType === 1) {
        this.$refs.ContractDialog.initialization(row);
        this.checkDialog1 = true;
      } else if (this.tableType === 2) {
        this.pkId = row.pkId;
        this.checkDialog2 = true;
      }
    },
    closeCheckDialog(status) {
      if (this.tableType === 1) {
        this.checkDialog1 = status;
        // this.$refs.ContractDialog.empty();
      } else if (this.tableType === 2) {
        this.checkDialog2 = false;
      }
      this.checkForm = {};
    },
    // cascaderChange(e) {
    //   console.log(e);
    //   this.materialForm.fkMaterialId = e[e.length - 1];
    // },
    // cascaderChange2(e) {
    //   console.log(e);
    //   this.inpData.materialTypeId = e[e.length - 1];
    // },
    // 物料成本编辑按钮
    materialUpdate(row) {
      this.getMaterialsTree();
      this.materialDialogTitle = "编辑物料";
      this.materialDialogType = 2;
      this.material = row.fkMaterialId;
      this.materialForm = { ...row };
      this.materialDialog = true;
    },
    checkMater(row) {
      // this.findOutById(row);
      this.orderType = row.orderType == 0 ? 4 : 5;
      this.orderPkId = row.pkId;
      this.checkOrderDialog = true;
    },
    // 物资成本查看明细
    checkMater2(row) {
      let data = { ...row, pkId: row.fkContractId };
      this.$refs.ContractDialog.initialization(data);
      this.checkDialog1 = true;
    },
    // 根据id获取出库单详情
    findOutById(row) {
      this.$api.findOutById({ pkId: row.pkId }).then(res => {
        if (res.code === 200) {
          this.outStoreForm = res.data;
          this.materialList = res.data.orderDetailsList;
          const arr1 = res.data.orderRelationList.filter(item => item.orderType == 2); // 物资申请单
          const arr2 = res.data.orderRelationList.filter(item => item.orderType == 3); // 入库单
          const arr3 = res.data.orderRelationList.filter(item => item.orderType == 1); // 采购计划单
          const arr4 = res.data.orderRelationList.filter(item => item.orderType == 4); // 发料单
          this.outStoreForm.fkApplyIdList = arr1.length ? arr1.map(item => item.pkId) : [];
          this.outStoreForm.fkInputIdList = arr2.length ? arr2.map(item => item.pkId) : [];
          this.outStoreForm.fkPurchaseId = arr3.length ? arr3[0].pkId : "";
          this.outStoreForm.fkOrdinaryId = arr4.length ? arr4[0].pkId : "";
          this.fkApplyIdList = arr1;
          this.fkInputIdList = arr2;
          this.fkPurchaseId = arr3.length ? arr3[0] : "";
          this.fkOrdinaryId = arr4.length ? arr4[0] : "";
          this.checkOrderDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 关闭出库弹框
    closeOutStoreDialog() {
      this.checkOrderDialog = false;
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
      this.materialIds = [];
      this.fkPurchaseId = "";
      this.fkInputIdList = [];
      this.fkOrdinaryId = "";
      this.fkApplyIdList = [];
    },
    // 物料成本弹框确定按钮
    async materialDialogOk() {
      this.materialForm.sourceType = this.radio2 == 1 ? 0 : 1;
      console.log(this.materialDialogType, await this.$refs.materialForm.validate());
      await this.$refs.materialForm.validate();
      this.loading = true;
      if (this.materialDialogType === 1) {
        this.$api
          .addProjCostMaterial(this.materialForm)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.closeMaterialDialog();
              this.searchProjCostMaterialPage();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            console.error(err);
            this.loading = true;
          });
      } else {
        this.$api
          .updateProjCostMaterial(this.materialForm)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.closeMaterialDialog();
              this.searchProjCostMaterialPage();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            console.error(err);
            this.loading = true;
          });
      }
    },
    // 物料成本弹框
    closeMaterialDialog() {
      this.materialDialog = false;
      this.resetForm("materialForm");
      this.material = "";
      this.materialForm = { fkMaterialId: "", planNum: "", price: "", sourceType: 0 };
    },
    // 物料删除
    materialdel(row) {
      this.$confirm("确定删除该物资?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delProjCostMaterial({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.searchProjCostMaterialPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 设备弹框
    closeFacilityDialog(e) {
      this.facilityDialog = false;
      if (e) {
        this.facilitySearchPage();
      }
    },
    // 设备编辑
    openFacility(type, row, view) {
      this.facilityOpenType = type;
      this.deviceId = this.tableType === 1 ? row.pkId : row.fkDeviceId;
      view === 3 ? (this.facilityDialogTitle = view === 3 ? "查看设备" : "查看租赁设备") : (this.facilityDialogTitle = this.radio3 === 1 ? "编辑设备" : "编辑租赁设备"); //三元
      this.facilityDialog = true;
    },
    // 设备删除
    facilitydel(row) {
      this.$confirm("确定删除该设备?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        // if (this.tableData.length === 1 && this.page.pageNum > 1) {
        //       this.page.pageNum--;
        //     }
        this.$api.projDeviceDelete({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("操作成功");
            if (this.tableData.length === 1 && this.page.pageNum > 1) {
              this.page.pageNum--;
            }
            this.facilitySearchPage();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    openManageDialog(row, type) {
      this.manageDialogType = 3;
      this.manageForm = { ...row };
      this.manageDialogTitle = type == 1 ? "费用信息" : "编辑管理成本";

      this.manageDialog = true;
    },
    async manageDialogOk() {
      await this.$refs.manageForm.validate();
      this.loading = true;
      if (this.manageDialogType === 2) {
        this.$api.addProCost(this.manageForm).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.$message.success("新增成功");
            this.searchProCostByType();
            this.closeManageDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.$api.updateProCost(this.manageForm).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.$message.success("修改成功");
            this.searchProCostByType();
            this.closeManageDialog();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeManageDialog() {
      this.manageDialog = false;
      this.resetForm("manageForm");
      this.manageForm = {
        costAmount: "",
        fkClassId: "",
        sourceType: 0,
        sortval: "",
        remark: ""
      };
    },
    // 打开成本类别管理
    openTypeMangerDialog() {
      this.typeMangerDialog = true;
    },
    // 打开新增，编辑类型弹框
    openTypeManger(type, row) {
      // type 1为新增，2为编辑
      this.typeMangerType = type;
      if (type === 1) {
        this.typeDialogTitle = "新增类型";
      } else {
        this.typeDialogTitle = "编辑类型";
        this.typeForm = { ...row };
      }
      this.typeDialog = true;
    },
    async typeDialogOk() {
      await this.$refs.typeForm.validate();
      if (this.typeMangerType === 1) {
        this.$api.addProjCostClass(this.typeForm).then(res => {
          if (res.code === 200) {
            this.$message.success("新增类别成功");
            this.closeTypeDialog();
            this.searchProjCostClass();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.$api.updateProjCostClass(this.typeForm).then(res => {
          if (res.code === 200) {
            this.$message.success("修改类别成功");
            this.closeTypeDialog();
            this.searchProjCostClass();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeTypeDialog() {
      this.typeDialog = false;
      this.typeForm = {
        className: ""
      };
    },
    // 删除类型
    deleteType(row) {
      this.$confirm("确定删除该类别?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.deleteProjCostClass({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.searchProjCostClass();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    closeTypeMangerDialog() {
      this.typeMangerDialog = false;
    },
    // 删除费用类别
    manageDel(row) {
      this.$confirm("确定删除该费用类别?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delProCost({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.searchProCostByType();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      if (this.radio == 1) {
        if (this.tableType === 1) {
          this.costSearchPage();

          console.log('"1" -----> ', "1");
        } else {
          this.actualCostSearchPage();
          console.log('"1" -----> ', "2");
        }
      } else if (this.radio == 2) {
        if (this.tableType === 1) {
          this.searchProjCostMaterialPage();
          console.log('"1" -----> ', "3");
        } else {
          this.actualCostMaterSearchPage();
          console.log('"1" -----> ', "4");
        }
      } else if (this.radio == 3) {
        if (this.tableType === 1) {
          this.facilitySearchPage();
          console.log('"1" -----> ', "5");
        } else {
          this.actualDeviceCostSearchPage();
          console.log('"1" -----> ', "6");
        }
      } else if (this.radio == 4) {
        this.searchProCostByType();
        console.log('"1" -----> ', "7");
      } else if (this.radio == 5) {
        this.actualCostAccountList();
        console.log('"1" -----> ', "8");
      }
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageNum = 1;
      this.page.pageSize = val;
      if (this.radio == 1) {
        this.randomKey = Math.random();
        if (this.tableType === 1) {
          this.costSearchPage();
        } else {
          this.actualCostSearchPage();
        }
      } else if (this.radio == 2) {
        this.conditionMaterialclassify();
        if (this.tableType === 1) {
          this.searchProjCostMaterialPage();
        } else {
          this.actualCostMaterSearchPage();
        }
      } else if (this.radio == 3) {
        if (this.tableType === 1) {
          this.facilitySearchPage();
        } else {
          this.actualDeviceCostSearchPage();
        }
      }
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      if (this.radio == 1) {
        this.randomKey = Math.random();
        if (this.tableType === 1) {
          this.costSearchPage();
        } else {
          this.actualCostSearchPage();
        }
      } else if (this.radio == 2) {
        this.conditionMaterialclassify();
        if (this.tableType === 1) {
          this.searchProjCostMaterialPage();
        } else {
          this.actualCostMaterSearchPage();
        }
      } else if (this.radio == 3) {
        if (this.tableType === 1) {
          this.facilitySearchPage();
        } else {
          this.actualDeviceCostSearchPage();
        }
      }
    },
    // 合计函数
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      const arr = ["分包成本", "物资成本", "设备成本", "管理成本", "合计成本"];
      columns.forEach((column, index) => {
        if (index === 1) {
          sums[index] = "合计";
          return;
        }
        if (column.label === arr[0]) {
          sums[index] = this.totalData.customCost;
          return;
        }
        if (column.label === arr[1]) {
          sums[index] = this.totalData.materialCost;
          return;
        }
        if (column.label === arr[2]) {
          sums[index] = this.totalData.deviceCost;
          return;
        }
        if (column.label === arr[3]) {
          sums[index] = this.totalData.costManage;
          return;
        }
        if (column.label === arr[4]) {
          sums[index] = this.totalData.totalAmount;
        }
      });
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
        if (column.label === "费用") {
          const values = data.map(item => item[column.property]);
          if (!values.every(value => isNaN(value))) {
            sums[index] =
              values
                .reduce((prev, curr) => {
                  const value = Number(curr);
                  if (!isNaN(value)) {
                    return prev + curr;
                  } else {
                    return prev;
                  }
                }, 0)
                .toFixed(2) - 0;
          }
        }
      });
      return sums;
    },
    cleanData() {
      this.inpData = {
        projectBidId: [4, 10].includes(this.user.orgType) ? this.inpData.projectBidId : "",
        deviceName: "",
        deviceTypeId: "",
        settleEndDate: "",
        fkBySettleOrgId: "",
        contractName: "",
        settleName: "",
        signDate: "",
        year: "",
        materialTypeId: "",
        materialName: "",
        endDate: "",
        orderCodeLike: "",
        outWarehouseDate: "",
        fkClassId: ""
      };
      this.searchData = {
        projectBidId: [4, 10].includes(this.user.orgType) ? this.searchData.projectBidId : "",
        deviceName: "",
        deviceTypeId: "",
        settleEndDate: "",
        fkBySettleOrgId: "",
        contractName: "",
        settleName: "",
        signDate: "",
        year: "",
        materialTypeId: "",
        materialName: "",
        endDate: "",
        orderCodeLike: "",
        outWarehouseDate: "",
        fkClassId: ""
      };
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style lang="scss" scoped>
.el-form {
  width: 100%;
}

.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 5px;
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

.mr-20 {
  margin-right: 20px;
}

.h-80 {
  height: 80px;
}

.dialog-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 10px;
  background-color: #f3f3f3;

  span {
    display: block;
    width: 105px;
    margin-right: 10px;
    text-align: center;
  }

  .dialog-header-item {
    display: flex;
    align-items: center;
    margin: 7px 10px;
  }
}

.table1 {
  height: 400px;
}

.wh-120 {
  width: 120px;
}

.wh-150 {
  width: 150px;
}

.wh-90per {
  width: 90%;
}

.wh-600 {
  width: 600px;
}

.el-row-data {
  display: flex;
  flex-wrap: wrap;
}

.typeManger {
  cursor: pointer;
  color: #4394e6;
}

.typeMangerDialog {
  height: 500px;
}

.dialog-form {
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

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
.echartDiv {
  background: #fff;
  height: calc(100% + 120px);
}
</style>
