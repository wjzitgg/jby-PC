<!-- 工资发放 -->
<template>
  <div class="app-container">
    <el-tabs v-model="orgType" @tab-click="orgTypeChange" v-if="typeShow">
      <el-tab-pane label="结算情况" name="1"></el-tab-pane>
      <el-tab-pane label="发放情况" name="2"></el-tab-pane>
      <el-tab-pane label="支付结余" name="3"></el-tab-pane>
    </el-tabs>
    <div class="header-seach">
      <el-collapse-transition>
        <el-form :inline="true" :model="searchForm" class="search-mr">
          <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)">
            <proSelct @selectIds="selectIds"></proSelct>
          </el-form-item>
          <el-form-item label="标段项目" label-width="70px" v-if="user.orgType == 7 && typeShow">
            <el-select size="mini" v-model="searchForm.noProjectId" placeholder="请选择" :disabled="projectStatus" class="wh-150" @change="listByProjectId">
              <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分包单位" label-width="70px" v-if="user.orgType != 7 && typeShow">
            <el-select size="mini" v-model="searchForm.fkOrgId" placeholder="请选择" :disabled="subcontractorStatus" class="wh-150">
              <el-option v-for="item in subcontractorData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="timeLabel" label-width="70px" v-if="orgType != 3 && typeShow">
            <el-date-picker value-format="yyyy-MM-dd" size="mini" style="width: 100%" v-model="searchForm.beginTime" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="至" v-if="orgType != 3 && typeShow">
            <el-date-picker value-format="yyyy-MM-dd" :picker-options="searchOptionsEnd" size="mini" style="width: 100%" v-model="searchForm.endTime" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="截止日期" label-width="70px" v-if="orgType == 3 && typeShow">
            <el-date-picker value-format="yyyy-MM-dd" size="mini" style="width: 100%" v-model="searchForm.cutOffTime" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="班组名称" label-width="70px" v-if="typeShow">
            <el-input size="mini" v-model="searchForm.teamName" autocomplete="off" class="wh-150" maxlength="25"></el-input>
          </el-form-item>
          <!-- <el-form-item label-width="1px"> -->
          <el-button type="primary" v-if="typeShow" icon="el-icon-search" v-has="'work:wages:query'" class="el-button-primary el-button-primary mt-6" size="mini" @click.native="search">查询</el-button>
          <!-- </el-form-item> -->
        </el-form>
      </el-collapse-transition>
      <div class="hader-btn" v-if="typeShow">
        <el-button v-has="'work:wages:add'" v-if="orgType == 1 && user.orgType == 7" type="primary" class="el-button-primary el-button-primary" size="mini" @click.native="addSettlement">新增结算</el-button>
        <el-button v-has="'work:wages:add'" v-if="orgType == 2 && user.orgType == 7" type="primary" class="el-button-primary el-button-primary" size="mini" @click.native="addGrant">新增发放</el-button>
      </div>
    </div>
    <div class="tab-container" v-if="typeShow">
      <div class="table-data" style="height: 82%; margin-top: 10px">
        <el-table v-if="orgType == 1" :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="teamName" label="班组名称" min-width="130"> </el-table-column>
          <el-table-column align="center" label="本期结算周期" min-width="90">
            <template slot-scope="scope"> {{ scope.row.beginTime }}至{{ scope.row.endTime }} </template>
          </el-table-column>
          <el-table-column align="center" prop="settlementAmount" label="本期结算金额" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="frontSettlementAmount" label="上期末结算金额" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="afterSettlementAmount" label="本期末结算金额" min-width="100"> </el-table-column>
          <el-table-column align="center" prop="settlementTime" label="结算日期" min-width="80"> </el-table-column>
          <!-- <el-table-column v-if="user.orgType != 7 && user.orgType != 5" align="center" prop="projectName" label="项目" min-width="90"> </el-table-column>
          <el-table-column v-if="user.orgType != 7 && user.orgType != 5" align="center" prop="projectBidName" label="标段项目" min-width="90"> </el-table-column> -->
          <el-table-column v-if="user.orgType != 7" align="center" prop="orgName" label="所属分包单位" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="stats" label="状态" min-width="90">
            <template slot-scope="scope">
              <div v-if="scope.row.stats == 0">待确定</div>
              <div v-if="scope.row.stats == 1">已确定</div>
              <div v-if="scope.row.stats == 2">草稿</div>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" align="center" :min-width="minWidth">
            <template slot-scope="scope">
              <el-button plain type="primary" size="mini" @click.native="settlementView(scope.row)">查看</el-button>
              <el-button plain v-has="'work:wages:update'" v-if="user.orgType == 7 && scope.row.stats == 2" type="warning" size="mini" @click.native="settlementEdit(scope.row)">编辑</el-button>
              <el-button plain v-has="'work:wages:delete'" v-if="user.orgType == 7 && scope.row.stats == 2" type="danger" size="mini" @click.native="settlementDelete(scope.row)">删除</el-button>
              <el-button plain v-if="user.orgType == 7 && scope.row.stats == 0" type="danger" size="mini" @click.native="withdrawSettlement(scope.row)">撤回</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <el-table v-if="orgType == 2" :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="teamName" label="班组名称" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="settlementAmount" label="本次发放金额" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="frontSettlementAmount" label="上期末发放金额" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="afterSettlementAmount" label="本期末发放金额" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="number" label="第几次发放" min-width="100"> </el-table-column>
          <el-table-column align="center" prop="settlementTime" label="本期发放日期" min-width="100"> </el-table-column>
          <!-- <el-table-column v-if="user.orgType != 7 && user.orgType != 5" align="center" prop="projectName" label="项目" min-width="80"> </el-table-column>
          <el-table-column v-if="user.orgType != 7 && user.orgType != 5" align="center" prop="projectBidName" label="标段项目" min-width="80"> </el-table-column> -->
          <el-table-column v-if="user.orgType != 7" align="center" prop="orgName" label="所属分包单位" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="stats" label="状态" min-width="90">
            <template slot-scope="scope">
              <div v-if="scope.row.stats == 0">待确定</div>
              <div v-if="scope.row.stats == 1">已确定</div>
              <div v-if="scope.row.stats == 2">草稿</div>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" align="center" label="操作" :min-width="minWidth">
            <template slot-scope="scope">
              <el-button plain size="mini" type="primary" @click.native="grantView(scope.row)">查看</el-button>
              <el-button plain v-if="user.orgType == 7 && scope.row.stats == 2" type="warning" size="mini" @click.native="grantEdit(scope.row)">编辑</el-button>
              <el-button plain v-if="user.orgType == 7 && scope.row.stats == 2" type="danger" size="mini" @click.native="grantDelete(scope.row)">删除</el-button>
              <el-button plain v-if="user.orgType == 7 && scope.row.stats == 0" type="danger" size="mini" @click.native="withdrawSettlement(scope.row)">撤回</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <el-table v-if="orgType == 3" :data="surplusData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="teamName" label="班组名称" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="cumulativeSettlementAmount" label="累计结算" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="cumulativeGrantAmount" label="累计发放" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="payBalance" label="工资结余" min-width="80"> </el-table-column>
          <!-- <el-table-column v-if="user.orgType != 7 && user.orgType != 5" align="center" prop="projectName" label="项目" min-width="80"> </el-table-column>
          <el-table-column v-if="user.orgType != 7 && user.orgType != 5" align="center" prop="projectBidName" label="标段项目" min-width="80"> </el-table-column> -->
          <el-table-column v-if="user.orgType != 7" align="center" prop="orgName" label="所属分包单位" min-width="100"> </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" align="center" min-width="70">
            <template slot-scope="scope">
              <el-button plain size="mini" type="primary" @click.native="surplusView(scope.row)">查看</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
      </div>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 新增结算 -->
    <el-dialog :title="showTitle" :visible.sync="show" v-dialogDrag :close-on-click-modal="false" @close="close1" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules" class="dialog-form">
        <el-row>
          <el-col :span="24">
            <el-form-item label="班组" prop="sortval" :label-width="formLabelWidth">
              <el-select size="mini" v-model="ruleForm.fkTeamId" placeholder="请选择" style="width: 100%" @change="fkTeamIdChange">
                <el-option v-for="item in teamSpinner" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本期结算周期" prop="sortval" :label-width="formLabelWidth">
              <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" v-model="ruleForm.beginTime" type="date" :picker-options="startTimeOption" @change="ruleForm.endTime = ''" placeholder="选择日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="至" prop="sortval" :label-width="formLabelWidth">
              <el-date-picker size="mini" value-format="yyyy-MM-dd" :picker-options="pickerOptionsEnd" style="width: 100%" v-model="ruleForm.endTime" type="date" placeholder="选择日期" @change="ruleForm.settlementTime = ''"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="本期结算金额" prop="menuName" :label-width="formLabelWidth">
              <el-input size="mini" v-model="ruleForm.settlementAmount" type="number" @keydown.native="keyDown" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="上期末结算金额" prop="menuName" :label-width="formLabelWidth">
              <el-input size="mini" disabled v-model="ruleForm.frontSettlementAmount" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="本期末结算金额" prop="menuName" :label-width="formLabelWidth">
              <el-input size="mini" disabled :value="num" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="结算日期" prop="sortval" :label-width="formLabelWidth"> <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" v-model="ruleForm.settlementTime" type="date" :picker-options="pickerOptionsSettle" placeholder="选择日期"></el-date-picker> </el-form-item
          ></el-col>
          <el-col :span="24">
            <el-form-item label="附件" prop="voucherUrl" :label-width="formLabelWidth">
              <div>
                <el-button size="small" type="primary" class="el-button-primary" @click="uploading">点击上传</el-button>
                <div class="upLoad-show">
                  <p v-for="(item, idx) in fileList" :key="idx">
                    <span>{{ item.name }}</span>
                    <el-button size="mini" @click="imgPreview(item)">预览</el-button>
                    <span>
                      <el-button size="mini" style="color: red; border: none" icon="el-icon-close" @click="remove(item, idx)"></el-button>
                    </span>
                  </p>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="close1">取 消</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="submit('ruleForm', 2)">保存草稿</el-button>
        <el-button size="mini" class="el-button-primary" type="primary" @click="submit('ruleForm', 0)">发送确认</el-button>
      </div>
    </el-dialog>
    <!-- 结算详情 -->
    <el-dialog :title="showTitle" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <el-form :model="ruleForm" ref="ruleForm" :rules="rules" style="margin-top: 20px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="班组" prop="sortval" :label-width="formLabelWidth">
                <el-input size="mini" disabled v-model="ruleParticulars.teamName" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="本期结算周期" prop="sortval" :label-width="formLabelWidth"> <el-date-picker size="mini" value-format="yyyy-MM-dd" disabled style="width: 100%" v-model="ruleParticulars.beginTime" type="date" placeholder="选择日期"></el-date-picker> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="至" prop="sortval" :label-width="formLabelWidth">
                <el-date-picker size="mini" disabled style="width: 100%" v-model="ruleParticulars.endTime" type="date" placeholder="选择日期"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="本期结算金额" prop="menuName" :label-width="formLabelWidth">
                <el-input size="mini" disabled v-model="ruleParticulars.settlementAmount" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="本期末结算金额" prop="menuName" :label-width="formLabelWidth">
                <el-input size="mini" disabled v-model="ruleParticulars.afterSettlementAmount" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="结算日期" prop="sortval" :label-width="formLabelWidth"> <el-date-picker size="mini" value-format="yyyy-MM-dd" disabled style="width: 100%" v-model="ruleParticulars.settlementTime" type="date" placeholder="选择日期"></el-date-picker> </el-form-item
            ></el-col>
            <el-col :span="24" v-if="fileList.length != 0">
              <el-form-item label="附件" prop="remark" :label-width="formLabelWidth">
                <div>
                  <div class="upLoad-show">
                    <div v-for="(item, idx) in fileList" :key="idx">
                      <span>{{ item.name }}</span>
                      <span>
                        <el-button size="mini" @click="imgPreview(item)">预览</el-button>
                      </span>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div>
          <p>班组长结算明细</p>
          <el-table :data="ruleParticulars.settlementMembersListVos" stripe height="200px" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
            <el-table-column type="index" align="center" width="50"> </el-table-column>
            <el-table-column align="center" prop="userName" label="劳务人员" min-width="130"> </el-table-column>
            <el-table-column align="center" prop="frontSettlementAmount" label="上期未结算金额" min-width="90">
              <template slot-scope="scope">
                <span>{{ !scope.row.frontSettlementAmount ? "/" : scope.row.frontSettlementAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="settlementAmount" label="本期结算金额" min-width="80">
              <template slot-scope="scope">
                <span>{{ !scope.row.settlementAmount ? "/" : scope.row.settlementAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="afterSettlementAmount" label="本期末结算金额" min-width="80">
              <template slot-scope="scope">
                <span>{{ !scope.row.afterSettlementAmount ? "/" : scope.row.afterSettlementAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="confirmStatus" label="状态" min-width="90">
              <template slot-scope="scope">
                <div v-if="scope.row.confirmStatus == 0">未确认</div>
                <div v-if="scope.row.confirmStatus == 1">已确认</div>
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
    <!-- 发放详情 -->
    <el-dialog :title="showTitle" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false" @close="close2" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <el-form :model="grantForm" ref="grantForm" :rules="rules" style="margin-top: 20px">
          <el-form-item label="班组" prop="fkTeamId" :label-width="formLabelWidth">
            <el-select size="mini" :disabled="showTitle == '发放信息'" v-if="showTitle === '新增发放'" v-model="grantForm.fkTeamId" @change="grantTeamIdChange" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in teamSpinner" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-input disabled v-model="grantForm.teamName" autocomplete="off" v-else></el-input>
          </el-form-item>
          <el-form-item label="结余金额" prop="anyAmount" :label-width="formLabelWidth">
            <el-input size="mini" disabled type="number" v-model="grantForm.anyAmount" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="本期发放金额" prop="settlementAmount" :label-width="formLabelWidth">
            <el-input size="mini" :disabled="showTitle == '发放信息'" type="number" @input="settlementAmountChange" @keydown.native="keyDown" v-model="grantForm.settlementAmount" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="上期末发放金额" prop="frontSettlementAmount" :label-width="formLabelWidth">
            <el-input size="mini" disabled v-model="grantForm.frontSettlementAmount" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="本期末发放金额" prop="afterSettlementAmount" :label-width="formLabelWidth">
            <el-input size="mini" disabled v-model="grantNum" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="发放日期" prop="settlementTime" :label-width="formLabelWidth">
            <el-date-picker size="mini" value-format="yyyy-MM-dd" :disabled="showTitle == '发放信息'" style="width: 100%" v-model="grantForm.settlementTime" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="附件" prop="remark" :label-width="formLabelWidth" v-if="fileList.length != 0 || showTitle != '发放信息'">
            <div>
              <el-button v-if="showTitle != '发放信息'" size="small" class="el-button-primary" type="primary" @click="uploading">点击上传</el-button>
              <div class="upLoad-show">
                <p v-for="(item, idx) in fileList" :key="idx">
                  <span>{{ item.name }}</span>
                  <el-button size="mini" @click="imgPreview(item)">预览</el-button>
                  <span v-if="showTitle != '发放信息'">
                    <el-button size="mini" style="color: red; border: none" icon="el-icon-close" @click="remove(item, idx)"></el-button>
                  </span>
                </p>
              </div>
            </div>
          </el-form-item>
        </el-form>
        <div v-if="showTitle == '发放信息'">
          <p>本次发放明细</p>
          <el-table :data="ruleForm.settlementMembersListVos" stripe height="200px" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
            <el-table-column align="center" label="序号" min-width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="userName" label="劳务人员" min-width="130"> </el-table-column>
            <el-table-column align="center" prop="frontSettlementAmount" label="上期未结算金额" min-width="90">
              <template slot-scope="scope">
                <span>{{ !scope.row.frontSettlementAmount ? "/" : scope.row.frontSettlementAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="settlementAmount" label="本期发放金额" min-width="80">
              <template slot-scope="scope">
                <span>{{ !scope.row.settlementAmount ? "/" : scope.row.settlementAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="afterSettlementAmount" label="本期末结算金额" min-width="80">
              <template slot-scope="scope">
                <span>{{ !scope.row.afterSettlementAmount ? "/" : scope.row.afterSettlementAmount }}</span>
              </template>
            </el-table-column>

            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>

      <div v-if="showTitle != '发放信息'" slot="footer" class="dialog-footer">
        <el-button @click="close2">取 消</el-button>
        <el-button class="el-button-primary el-button-primary" size="mini" type="primary" @click="grantSubmit('grantForm', 2)">保存草稿</el-button>
        <el-button class="el-button-primary el-button-primary" size="mini" type="primary" @click="grantSubmit('grantForm', 0)">发送确认</el-button>
      </div>
    </el-dialog>
    <!-- 支付结余详情 -->
    <el-dialog :title="showTitle" :visible.sync="show3" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <el-table ref="table1" :data="detailsData.paymentBalancePageVo.records" stripe show-summary :summary-method="getSummaries" height="500px" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="settlementTime" label="日期" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="settlementType" label="类别" min-width="90">
            <template slot-scope="scope">
              <div v-if="scope.row.settlementType == 1">结算</div>
              <div v-if="scope.row.settlementType == 2">发放</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="settlementAmount" label="结算金额" min-width="80">
            <template slot-scope="scope">
              <span>{{ !scope.row.settlementAmount ? "/" : scope.row.settlementAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="grantAmount" label="发放金额" min-width="80">
            <template slot-scope="scope">
              <span>{{ !scope.row.grantAmount ? "/" : scope.row.grantAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column align="支付结余" prop="paymentAmount" label="支付余额" min-width="80">
            <template slot-scope="scope">
              <span>{{ !scope.row.paymentAmount ? "/" : scope.row.paymentAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" align="center" min-width="120">
            <template slot-scope="scope">
              <el-button size="mini" @click.native="surplusDetails(scope.row)">详情</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="detailsQuery.pageNum" :page-size="detailsQuery.pageSize" :total="detailsQuery.total" @handleSizeChange="detailsPageSizeChange" @handleCurrentChange="detailsPageCurrentChange"></table-paging>
      </div>
    </el-dialog>
    <!-- 凭证预览 -->
    <el-dialog title="预览" width="500px" :visible.sync="imgShow" v-dialogDrag :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <img width="100%" :src="imgUrl" alt="" />
      </div>
    </el-dialog>
    <div class="fileT" ref="dsafds" v-show="false">
      <input type="file" accept="image/*" ref="files" id="upload" @change="upLoad" />
    </div>
  </div>
</template>
<script>
import moment from "moment";
import COS from "cos-js-sdk-v5";
// payoffAdd
export default {
  data() {
    return {
      totalCount: 0,
      tableData: [],
      loading: false,
      formLabelWidth: "110px",
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        settlementType: 1
      },
      // 结算
      ruleForm: {
        beginTime: "", // 开始时间
        endTime: "", // 结束时间
        fkTeamId: "", // 班组ID
        settlementAmount: "", // 本期结算金额
        settlementTime: "", // 本期结算时间
        remark: "", // 备注
        voucherUrl: "",
        frontSettlementAmount: "",
        afterSettlementAmount: ""
      },
      // 发放
      grantForm: {
        afterSettlementAmount: "", // 本期末结算金额
        fkTeamId: "", // 班组ID
        frontSettlementAmount: "", // 上期末结算金额
        pkId: "",
        settlementAmount: "", // 本期结算金额
        settlementMembersListVos: [], // 劳务工人结算明细集
        settlementTime: "", // 本期结算时间
        teamName: "", // 班组名称
        voucherUrl: "", // 结算凭证
        settlementType: "", // 结算类型
        anyAmount: 0 // 结余金额
      },
      // 结算详情
      ruleParticulars: {
        afterSettlementAmount: "", // 本期末结算金额
        beginTime: "", // 开始时间
        endTime: "", // 结束时间
        fkTeamId: "", // 班组ID
        frontSettlementAmount: "", // 上期末结算金额
        pkId: "",
        settlementAmount: "", // 本期结算金额
        settlementMembersListVos: [], // 劳务工人结算明细集
        settlementTime: "", // 本期结算时间
        teamName: "", // 班组名称
        voucherUrl: "", // 结算凭证
        settlementType: "" // 结算类型
      },
      show: false,
      orgType: "1",
      form: {
        bookUrl: ""
      },
      searchForm: {
        projectId: "",
        noProjectId: "",
        fkOrgId: "",
        beginTime: "",
        endTime: "",
        cutOffTime: "",
        teamName: ""
      },
      user: {},
      timeLabel: "结算周期",
      rules: {},
      show1: false,
      show2: false,
      show3: false,
      minWidth: "80",
      showTitle: "",
      teamSpinner: [],
      options: [], // 项目
      noProjectData: [], // 标段项目
      settlementForm: {},
      subcontractorData: [], // 分包单位下拉
      surplusData: [], // 支付结余列表
      surplusQuery: {},
      detailsQuery: {
        teamId: "",
        pageSize: 1,
        pageNum: 10,
        total: 0
      },
      detailsData: {
        paymentBalancePageVo: {
          records: []
        },
        settlementAmount: 0,
        grantAmount: 0,
        paymentAmount: 0
      },
      fileList: [],
      imgShow: false,
      imgUrl: "",
      pickerOptionsEnd: {
        disabledDate: time => {
          if (this.ruleForm.beginTime) {
            let d;
            if (typeof this.ruleForm.beginTime == "string") {
              d = new Date(this.ruleForm.beginTime).getTime();
            } else {
              d = this.ruleForm.beginTime.getTime();
            }
            return time.getTime() < d - 24 * 60 * 60 * 1000 || time.getTime() > Date.now();
          } else {
            return time.getTime() > Date.now();
          }
        }
      },
      startTimeOption: {
        disabledDate: time => {
          return time.getTime() > Date.now();
        }
      },
      pickerOptionsSettle: {
        disabledDate: time => {
          if (this.ruleForm.endTime) {
            let d;
            if (typeof this.ruleForm.endTime == "string") {
              d = new Date(this.ruleForm.endTime).getTime();
            } else {
              d = this.ruleForm.endTime.getTime();
            }
            return time.getTime() < d - 24 * 60 * 60 * 1000 || time.getTime() > Date.now();
          } else {
            return time.getTime() > Date.now();
          }
        }
      },
      searchOptionsEnd: {
        disabledDate: time => {
          if (this.searchForm.beginTime) {
            let d;
            if (typeof this.searchForm.beginTime == "string") {
              d = new Date(this.searchForm.beginTime).getTime();
            } else {
              d = this.searchForm.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      projectStatus: false, // 控制标段项目不能选择
      subcontractorStatus: true, // 控制分包单位不能选择
      newAddList: [],
      delList: [],
      typeShow: true
    };
  },
  computed: {
    num() {
      return Number(this.ruleForm.frontSettlementAmount) + Number(this.ruleForm.settlementAmount);
    },
    grantNum() {
      return Number(this.grantForm.frontSettlementAmount) + Number(this.grantForm.settlementAmount);
    }
  },
  updated() {
    this.$nextTick(() => {
      if (this.$refs.table1 != undefined) {
        this.$refs.table1.doLayout();
      }
    });
  },
  watch: {
    imgShow(val) {
      if (val == false) {
        this.imgUrl = "";
      }
    },
    show(val) {
      if (!val) {
        this.delFiles();
      }
    },
    show2(val) {
      if (!val) {
        this.delFiles();
      }
    }
  },
  mounted() {
    // this.getOrgPageList();
    this.user = JSON.parse(sessionStorage.getItem("user"));
    // 如果是建设、监理、设计院才隐藏下面的
    // if (this.user.orgType == 2 || this.user.orgType == 3 || this.user.orgType == 9) {
    //   this.projectStatus = true;
    //   this.noProject();
    // }
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        if (this.user.orgType == 7) {
          this.minWidth = "150";
          this.noProject();
          this.search();
        }

        // 项目部登录
        if (this.user.orgType == 5) {
          this.subcontractorStatus = false;
          this.subcontractor();
          this.search();
        }
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      this.searchForm.fkOrgId = ""; // 分包单位为空
      this.subcontractorData.unshift({ label: "全部", value: "" });
      if (arr.length) {
        if (arr.length > 1) {
          this.searchForm.projectId = arr[0];
          this.searchForm.noProjectId = arr[1];
        } else {
          this.searchForm.noProjectId = arr[0];
        }
        if (isTrue) {
          this.search();
        }
        this.listByProjectId(this.searchForm.noProjectId);
      }
    },
    close1() {
      this.delList = [];
      this.show = false;
    },
    close2() {
      this.delList = [];
      this.show2 = false;
    },
    // 删除附件
    delFiles() {
      let urls = [];
      if (this.showTitle.indexOf("新增") !== -1) {
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
    // 凭证预览
    imgPreview(item) {
      this.imgUrl = item.path;
      this.imgShow = true;
    },
    // 上传
    uploading() {
      this.$refs.files.click();
    },
    // 移除凭证
    remove(item, idx) {
      this.delList.push(item.path);
      this.fileList.splice(idx, 1);
    },
    // 根据班组ID查询上期末结算金额
    fkTeamIdChange(val) {
      this.$api.terminalAmountByTeamId({ teamId: val, settlementType: 1 }).then(res => {
        if (res.code == 200) {
          this.ruleForm.frontSettlementAmount = res.data.frontSettlementAmount;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    grantTeamIdChange(val) {
      this.$api.terminalAmountByTeamId({ teamId: val, settlementType: 2 }).then(res => {
        if (res.code == 200) {
          this.grantForm.settlementAmount = "";
          this.grantForm.frontSettlementAmount = res.data.frontSettlementAmount;
          this.$set(this.grantForm, "anyAmount", res.data.settlementAmount);
          // this.grantForm.anyAmount = res.data.settlementAmount;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 结算
    submit(formName, confirmStatus) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {};
          data.objectType = "1";
          if (this.ruleForm.beginTime != null && this.ruleForm.beginTime.length != 0 && this.ruleForm.beginTime != undefined) {
            data.beginTime = moment(this.ruleForm.beginTime).format("YYYY-MM-DD");
          } else {
            data.beginTime = this.ruleForm.beginTime;
            return this.$message.warning("结算周期开始时间不能为空");
          }
          if (this.ruleForm.endTime != null && this.ruleForm.endTime.length != 0 && this.ruleForm.endTime != undefined) {
            data.endTime = moment(this.ruleForm.endTime).format("YYYY-MM-DD");
          } else {
            data.endTime = this.ruleForm.endTime;
            return this.$message.warning("结算周期结束时间不能为空");
          }
          if (this.ruleForm.settlementTime != null && this.ruleForm.settlementTime.length != 0 && this.ruleForm.settlementTime != undefined) {
            data.settlementTime = moment(this.ruleForm.settlementTime).format("YYYY-MM-DD");
          } else {
            data.settlementTime = this.ruleForm.settlementTime;
            return this.$message.warning("结算日期不能为空");
          }
          data.settlementType = 1;
          data.fkTeamId = this.ruleForm.fkTeamId;
          data.settlementAmount = this.ruleForm.settlementAmount;
          const ure = JSON.stringify(this.fileList);
          data.voucherUrl = ure;
          data.confirmStatus = confirmStatus;
          this.loading = true;
          if (this.showTitle != "编辑结算") {
            this.$api
              .payoffAdd(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message.success("新增成功");
                  this.newAddList = [];
                  this.search();
                  this.show = false;
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message.warning(res.msg);
                }
              })
              .catch(err => {
                this.loading = false;
              });
          } else {
            data.pkId = this.ruleForm.pkId;
            data.frontSettlementAmount = this.ruleForm.frontSettlementAmount;
            this.$api
              .payoffUpdate(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message.success("编辑成功");
                  this.newAddList = [];
                  this.search();
                  this.show = false;
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message.warning(res.msg);
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
    // 发放
    grantSubmit(formName, confirmStatus) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {};
          data.objectType = "1";
          data.settlementType = 2;
          data.fkTeamId = this.grantForm.fkTeamId;
          data.settlementAmount = this.grantForm.settlementAmount;
          data.confirmStatus = confirmStatus;
          const url = JSON.stringify(this.fileList);
          data.voucherUrl = url;
          if (!this.grantForm.settlementAmount || this.grantForm.settlementAmount == 0) {
            return this.$message.warning("发放金额不能为0");
          }
          if (this.grantForm.settlementTime != null && this.grantForm.settlementTime != undefined && this.grantForm.settlementTime.length != 0) {
            data.settlementTime = moment(this.grantForm.settlementTime).format("YYYY-MM-DD");
          } else {
            return this.$message.warning("发放日期不能为空");
          }
          this.loading = true;
          if (this.showTitle != "发放编辑") {
            this.$api
              .payoffAdd(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message.success("新增成功");
                  this.newAddList = [];
                  this.search();
                  this.show2 = false;
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message.warning(res.msg);
                }
              })
              .catch(err => {
                this.loading = false;
              });
          } else {
            data.pkId = this.grantForm.pkId;
            data.frontSettlementAmount = this.grantForm.frontSettlementAmount;
            this.$api
              .payoffUpdate(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.newAddList = [];
                  this.$message.success("编辑成功");
                  this.search();
                  this.show2 = false;
                  this.$refs[formName].resetFields();
                } else {
                  this.loading = false;
                  this.$message.warning(res.msg);
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
    // 查询班组
    listAllByMembers() {
      this.$api.listAllByMembers().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.teamName;
            item.value = item.pkId;
          });
          this.teamSpinner = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 项目下拉列表
    noProject() {
      this.$api.getItemListNoUserId({ isWhole: 1, projectId: "" }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          if (this.user.orgType == 7) {
            this.noProjectData = res.data;
            this.noProjectData.unshift({ value: "", label: "全部" });
          } else {
            this.options = res.data;
            this.options.unshift({ value: "", label: "全部" });
            this.noProjectData.unshift({ value: "", label: "全部" });
          }
        }
      });
    },
    // 239标段项目下拉选择根据ID获取分包单位数据
    listByProjectId(id) {
      //  选择全部禁用分包单位下拉选择
      if (id == "") {
        this.subcontractorStatus = true;
        this.searchForm.fkOrgId = "";
      } else {
        this.subcontractorStatus = false;
        this.$api.searchByProjectIds({ projectId: id, customType: 4 }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.customName;
              item.value = item.fkLinkOrgId;
            });
            this.subcontractorData = res.data;
            this.subcontractorData.unshift({ value: "", label: "全部" });
          }
        });
      }
    },
    // 分部商下拉
    subcontractor() {
      this.$api.searchLinkOrgId().then(res => {
        if (res.code == 200) {
          // subcontractor
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.pkId;
          });
          this.subcontractorData = res.data;
          this.subcontractorData.unshift({ value: "", label: "全部" });
        }
      });
    },
    // 项目获取标段项目下拉
    projectIdChange(val) {
      this.searchForm.noProjectId = "";
      const data = {};
      if (val.length == 0) {
        data.isWhole = 1;
        data.projectId = val;
        this.projectStatus = true;
        this.subcontractorStatus = true;
        this.form.noProjectId = ""; // 清空标段项目
        this.form.fkOrgId = ""; // 分包单位为空
        return;
      } else {
        data.isWhole = 0;
        data.projectId = val;
        this.projectStatus = false;
      }
      this.$api.noProject(data).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.fkBidProjectName;
            item.value = item.fkBidProjectId;
          });
          this.noProjectData = res.data;
          this.noProjectData.unshift({ value: "", label: "全部" });
        }
      });
    },
    // 合计
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计"; // 这里就是显示你要写的啥名字,是合计还是汇总什么
          return;
        }
        if (column.property == "settlementAmount") {
          sums[index] = this.detailsData.settlementAmount;
        } else if (column.property == "grantAmount") {
          sums[index] = this.detailsData.grantAmount;
        } else if (column.property == "paymentAmount") {
          sums[index] = this.detailsData.paymentAmount;
        }
      });
      return sums;
    },
    // 切换工资类型
    orgTypeChange(val) {
      if (!this.typeShow) {
        return;
      }
      this.searchForm = {
        projectId: "",
        noProjectId: "",
        fkOrgId: "",
        beginTime: "",
        endTime: "",
        cutOffTime: "",
        teamName: ""
      };
      this.tableData = [];
      this.listQuery = {
        pageNum: 1,
        pageSize: 10
      };
      if (val.name == 1) {
        this.timeLabel = "结算周期";
        this.listQuery.settlementType = 1;
        this.getOrgPageList();
      } else if (val.name == 2) {
        this.timeLabel = "发放日期";
        this.listQuery.settlementType = 2;
        this.getOrgPageList();
      } else if (val.name == 3) {
        this.searchBalance();
      }
      // 禁用下拉状态
      // 如果是建设、监理、设计院才隐藏下面的
      if (this.user.orgType == 2 || this.user.orgType == 3 || this.user.orgType == 9) {
        this.subcontractorStatus = true;
        this.projectStatus = true;
      }
    },
    // 支付结余
    searchBalance() {
      this.$api.searchBalance(this.surplusQuery).then(res => {
        if (res.code == 200) {
          this.surplusData = res.data;
        }
      });
    },
    // 新增结算
    addSettlement() {
      // 获取所有班组
      this.listAllByMembers();
      this.showTitle = "新增结算";
      if (this.$refs.files != undefined) {
        this.$refs.files.value = "";
      }
      this.fileList = [];
      this.show = true;
      this.ruleForm = {
        beginTime: "", // 开始时间
        endTime: "", // 结束时间
        fkTeamId: "", // 班组ID
        settlementAmount: "", // 本期结算金额
        settlementTime: "", // 本期结算时间
        remark: "", // 备注
        voucherUrl: null,
        frontSettlementAmount: "",
        afterSettlementAmount: ""
      };
    },
    // 结算查看
    settlementView(row) {
      this.showTitle = "结算信息";
      this.fileList = [];
      this.$api.findById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          if (res.data.settlementMembersListVos == null) {
            res.data.settlementMembersListVos = [];
          }
          this.ruleParticulars = res.data;
          this.fileList = JSON.parse(res.data.voucherUrl);
          this.show1 = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 结算编辑
    settlementEdit(row) {
      this.showTitle = "编辑结算";
      this.fileList = [];
      this.listAllByMembers();
      this.$api.findById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.ruleForm.beginTime = res.data.beginTime;
          this.ruleForm.endTime = res.data.endTime;
          this.ruleForm.fkTeamId = res.data.fkTeamId;
          this.ruleForm.settlementAmount = res.data.settlementAmount;
          this.ruleForm.settlementTime = res.data.settlementTime;
          this.ruleForm.voucherUrl = res.data.voucherUrl;
          this.ruleForm.frontSettlementAmount = res.data.frontSettlementAmount;
          this.ruleForm.afterSettlementAmount = res.data.afterSettlementAmount;
          this.fileList = JSON.parse(res.data.voucherUrl);
          this.ruleForm.pkId = res.data.pkId;
          this.show = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 结算删除
    settlementDelete(row) {
      this.$confirm("确定删除该结算信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.salaryDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.getOrgPageList();
            } else {
              this.$message({
                type: "warning",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 撤回
    withdrawSettlement(row) {
      this.$confirm("确定撤回该结算信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.withdrawSettlement({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "撤回成功！"
              });
              this.getOrgPageList();
            } else {
              this.$message({
                type: "warning",
                message: res.msg
              });
            }
          });
        })
        .catch(err => {});
    },
    // 新增发放
    addGrant() {
      this.listAllByMembers();
      this.showTitle = "新增发放";
      this.fileList = [];
      this.grantForm = {
        afterSettlementAmount: "", // 本期末结算金额
        fkTeamId: "", // 班组ID
        frontSettlementAmount: "", // 上期末结算金额
        pkId: "",
        settlementAmount: "", // 本期结算金额
        settlementMembersListVos: [], // 劳务工人结算明细集
        settlementTime: "", // 本期结算时间
        teamName: "", // 班组名称
        voucherUrl: "", // 结算凭证
        settlementType: "" // 结算类型
      };
      this.show2 = true;
    },
    // 发放查看
    grantView(row) {
      this.showTitle = "发放信息";
      this.$api.findById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          if (res.data.settlementMembersListVos == null) {
            res.data.settlementMembersListVos = [];
          }
          this.grantForm = res.data;
          this.$set(this.grantForm, "anyAmount", res.data.balanceAmount);
          this.ruleForm = res.data;
          this.fileList = JSON.parse(res.data.voucherUrl);
          this.show2 = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 发放编辑
    grantEdit(row) {
      this.showTitle = "发放编辑";
      // this.listAllByMembers()
      this.$api.findById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          if (res.data.settlementMembersListVos == null) {
            res.data.settlementMembersListVos = [];
          }
          this.grantForm = res.data;
          this.ruleForm = res.data;
          this.$set(this.grantForm, "anyAmount", res.data.balanceAmount);
          this.fileList = JSON.parse(res.data.voucherUrl);
          this.grantTeamIdChange(res.data.fkTeamId);
          this.show2 = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 发放删除
    grantDelete(row) {
      this.$confirm("确定删除该发放记录？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.salaryDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.getOrgPageList();
            } else {
              this.$message({
                type: "warning",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 支付结余查看
    surplusView(row) {
      this.detailsQuery.teamId = row.fkTeamId;
      this.detailsQuery.pageSize = 10;
      this.detailsQuery.pageNum = 1;

      this.paymentBalanceByTeamId();
      this.showTitle = "路基班组";
      this.show3 = true;
    },
    surplusDetails(row) {
      if (row.settlementType == 1) {
        this.settlementView(row);
      } else if (row.settlementType == 2) {
        this.grantView(row);
      }
    },
    // 路基班组数据
    paymentBalanceByTeamId() {
      const data = {
        teamId: this.detailsQuery.teamId,
        pageSize: this.detailsQuery.pageSize,
        pageNum: this.detailsQuery.pageNum
      };
      this.$api.paymentBalanceByTeamId(data).then(res => {
        if (res.code == 200) {
          this.detailsData = res.data;
          this.detailsQuery.total = parseInt(res.data.paymentBalancePageVo.total);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    detailsPageSizeChange(pageSize) {
      this.detailsQuery.pageSize = pageSize;
      this.paymentBalanceByTeamId();
    },
    detailsPageCurrentChange(currentPage) {
      this.detailsQuery.pageNum = currentPage;
      this.paymentBalanceByTeamId();
    },
    getOrgPageList() {
      this.loading = true;
      this.$api
        .rSettlementSearchPage(this.listQuery)
        .then(res => {
          if (res.code == 200) {
            const statusOptions = {
              0: "正常",
              1: "停用"
            };
            res.data.records.forEach(item => {
              item.menuStatusName = statusOptions[item.menuStatus];
              if (item.beginTime != null) {
                item.beginTime = /\d{4}-\d{1,2}-\d{1,2}/g.exec(item.beginTime)[0];
              }
              if (item.endTime != null) {
                item.endTime = /\d{4}-\d{1,2}-\d{1,2}/g.exec(item.endTime)[0];
              }
              if (item.settlementTime != null) {
                item.settlementTime = /\d{4}-\d{1,2}-\d{1,2}/g.exec(item.settlementTime);
              }
            });
            this.tableData = res.data.records;
            this.totalCount = parseInt(res.data.total);
            this.loading = false;
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
    },
    search() {
      if (this.orgType == 1 || this.orgType == 2) {
        this.listQuery.teamName = this.searchForm.teamName;
        if (this.searchForm.beginTime != null && this.searchForm.beginTime != undefined && this.searchForm.beginTime.length != 0) {
          this.listQuery.beginTime = moment(this.searchForm.beginTime).format("YYYY-MM-DD");
        } else {
          this.listQuery.beginTime = this.searchForm.beginTime;
        }
        if (this.searchForm.endTime != null && this.searchForm.endTime != undefined && this.searchForm.endTime.length != 0) {
          this.listQuery.endTime = moment(this.searchForm.endTime).format("YYYY-MM-DD");
        } else {
          this.listQuery.endTime = this.searchForm.endTime;
        }
        this.listQuery.fkOrgId = this.searchForm.fkOrgId;
        this.listQuery.fkProjectId = this.searchForm.projectId;
        this.listQuery.fkProjectBidId = this.searchForm.noProjectId;
        this.getOrgPageList();
      } else {
        this.surplusQuery = {
          fkOrgId: this.searchForm.fkOrgId,
          teamName: this.searchForm.teamName
        };

        if (this.searchForm.cutOffTime != null && this.searchForm.cutOffTime != undefined && this.searchForm.cutOffTime.length != 0) {
          this.surplusQuery.closingDate = moment(this.searchForm.cutOffTime).format("YYYY-MM-DD");
        } else {
          this.surplusQuery.closingDate = this.searchForm.cutOffTime;
        }
        if (this.searchForm.projectId.length != 0 && this.searchForm.noProjectId.length == 0) {
          this.surplusQuery.fkProjectId = this.searchForm.projectId;
        }
        if (this.searchForm.noProjectId.length != 0) {
          this.surplusQuery.fkProjectId = this.searchForm.noProjectId;
        }

        this.searchBalance();
      }
    },
    change() {},
    // 排序值禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      if (this.orgType == 1) {
        this.getOrgPageList();
      } else if (this.orgType == 2) {
        this.getOrgPageList();
      } else if (this.orgType == 3) {
        this.searchBalance();
      }
      // this.getOrgPageList();
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      if (this.orgType == 1) {
        this.getOrgPageList();
      } else if (this.orgType == 2) {
        this.getOrgPageList();
      } else if (this.orgType == 3) {
        this.searchBalance();
      }
      // this.getOrgPageList();
    },
    // empty() {
    //   this.ruleForm.voucherUrl = null;
    //   this.$refs.file.value = "";
    // },
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
      _this.$refs.files.value = "";
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
            const imgIdx = path.lastIndexOf("com/");
            const imgName = path.substring(imgIdx + 4, path.length);
            _this.fileList.push({ name: imgName, path });
            _this.loading = false;
            _this.$message.success("上传成功");
          } else {
            _this.loading = false;
            _this.$message.error("上传失败");
          }
        }
      );
    },
    upLoad() {
      // this.pdfhuix = "";
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
    settlementAmountChange(e) {
      if (this.grantForm.settlementAmount > this.grantForm.anyAmount) {
        this.grantForm.settlementAmount = this.grantForm.anyAmount;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.header-seach {
  background: #fff;
  padding-top: 15px;
  padding-left: 5px;
  position: relative;
  border-radius: 5px;

  .hader-btn {
    position: absolute;
    top: 23px;
    right: 20px;
  }
}

.basi {
  .basi-center {
    border: 1px solid;
    padding: 8px;
    background: #f2f2f2;
  }
}

/deep/ .datetime-end {
  .el-form-item__label {
    width: 2em !important;
  }
}

.upLoad-show {
  height: 80px;
  overflow: auto;
}

::-webkit-scrollbar {
  width: 5px;
  color: #fff;
  background-color: #fcfcfc;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
.mt-6 {
  margin-top: 6px;
}
// /deep/ .btn-wrap {
//     width: 100%;
//     text-align: right;
// }
.wh-150 {
  width: 150px;
}
</style>
