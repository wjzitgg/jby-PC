<template>
  <!-- 技术交底 -->
  <div class="app-container">
    <!-- 头部tab栏 -->
    <!-- <el-radio-group v-model="radio" size="mini" v-if="user.orgType === 4 || user.orgType === 5">
      <el-radio-button :label="1">上级交底</el-radio-button>
      <el-radio-button :label="2">内部交底</el-radio-button>
      <el-radio-button :label="3">对下交底</el-radio-button>
    </el-radio-group> -->
    <div class="topTabs" v-if="typeShow">
      <el-tabs v-model="radio" v-if="user.orgType === 3 || user.orgType === 4 || user.orgType === 5 || user.orgType === 12 || user.orgType === 10 || user.orgType === 11">
        <el-tab-pane label="上级交底" name="1"></el-tab-pane>
        <el-tab-pane label="内部交底" name="2"></el-tab-pane>
        <el-tab-pane label="对下交底" name="3"></el-tab-pane>
      </el-tabs>
    </div>
    <!-- 搜索栏 -->
    <div class="header-seach">
      <el-form :inline="true" class="myform" label-width="72px">
        <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)">
          <treeSelect @selectIds="selectIds"></treeSelect>
        </el-form-item>
        <el-form-item label="标段项目" v-if="user.orgType == 7 && typeShow">
          <!-- <el-select v-model="inpData.fkBidProjectId" :disabled="!inpData.fkProjectId" @change="fkBidProjectIdChange($event, 1)" size="mini" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9" class="w-180">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in proOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
          </el-select> -->
          <el-select v-model="inpData.fkBidProjectId" size="mini" class="w-180" @change="fkBidProjectIdChange($event, 1)">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="交底单位" v-if="[4, 5, 7, 11, 12, 10].includes(this.user.orgType) && radio == 1 && typeShow">
          <el-select v-model="inpData.fkOrgId" size="mini" class="w-180">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in disclosureUnitList" :key="item.pkId" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="交底部门" v-if="([4, 5, 11, 12, 10].includes(this.user.orgType) && radio != 1) || ([2, 3, 9].includes(this.user.orgType) && typeShow)">
          <el-select v-model="inpData.fkDeptId" size="mini" class="w-180">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in disclosureDepList" :key="item.pkId" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接收单位" v-if="([4, 5, 11, 12, 10].includes(this.user.orgType) && radio == 3) || ([2, 3, 9].includes(this.user.orgType) && typeShow)">
          <el-select v-model="inpData.fkReceivingOrgId" size="mini" class="w-180">
            <!-- :disabled="!inpData.fkBidProjectId && this.user.orgType !== 5" -->
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in receiveUnitList" :key="item.pkId" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接收部门" v-if="[4, 5, 11, 12, 10].includes(this.user.orgType) && radio != 3 && typeShow">
          <el-select v-model="inpData.fkReceivingDeptId" size="mini" class="w-180">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in receiveDepList" :key="item.pkId" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" v-if="typeShow">
          <el-date-picker size="mini" class="wh-140" value-format="yyyy-MM-dd" v-model="inpData.beginTime" :picker-options="pickerOptionsAnd"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-140" :picker-options="searchOptionsEnd" value-format="yyyy-MM-dd" v-model="inpData.endTime"></el-date-picker
        ></el-form-item>
        <el-form-item label="交底名称" v-if="typeShow">
          <el-input size="mini" type="text" class="w-180" v-model="inpData.disclosureName"></el-input>
        </el-form-item>
        <el-button size="mini" v-if="typeShow" type="primary" class="ml-20 search el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
      </el-form>
      <el-button size="mini" type="primary" class="el-button-primary" v-has="'production:disclosure:add'" v-if="(this.user.orgType === 5 && radio != 1) || ([2, 3, 9].includes(this.user.orgType) && typeShow)" @click="handleOpen(2)">新增交底</el-button>
    </div>
    <!-- 表格 -->
    <div v-if="typeShow" class="table-data" :style="{ height: ([4, 5].includes(this.user.orgType) && radio == 3) || [2, 3, 9].includes(this.user.orgType) ? '65%' : '73%' }">
      <el-table :tooltip-effect="'light'" ref="tables" :key="randomKey" :data="tableData" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
        <!-- <el-table-column label="编号" prop="technicalCode" align="center" show-overflow-tooltip> </el-table-column> -->
        <!-- <el-table-column label="项目" prop="fkProjectName" align="center" show-overflow-tooltip v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9"> </el-table-column> -->
        <!-- <el-table-column label="标段" prop="fkBidProjectName" align="center" show-overflow-tooltip v-if="![5, 7,12,11,10].includes(user.orgType)"> </el-table-column> -->
        <el-table-column label="交底名称" prop="disclosureName" align="center"> </el-table-column>
        <el-table-column label="交底部门" prop="fkDeptName" align="center" show-overflow-tooltip v-if="([4, 5, 11, 12, 11].includes(this.user.orgType) && radio != 1) || [2, 3, 9].includes(this.user.orgType)"> </el-table-column>
        <el-table-column label="交底单位" prop="fkOrgName" align="center" show-overflow-tooltip v-if="([4, 5, 11, 12, 11].includes(this.user.orgType) && radio == 1) || user.orgType === 7"> </el-table-column>
        <el-table-column label="交底人" prop="fkUserName" align="center" show-overflow-tooltip> </el-table-column>

        <el-table-column label="接收单位" prop="fkReceivingOrgName" align="center" show-overflow-tooltip v-if="([4, 5, 11, 12, 11].includes(this.user.orgType) && radio == 3) || [2, 3, 9].includes(this.user.orgType)"> </el-table-column>
        <el-table-column label="接收部门" prop="fkReceivingDeptName" align="center" show-overflow-tooltip v-if="[4, 5, 11, 12, 11].includes(this.user.orgType) && radio != 3"> </el-table-column>
        <el-table-column label="接收人" prop="fkReceivingUserName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="交底方式" prop="" align="center">
          <template slot-scope="{ row }">
            {{ row.receivingType === 1 ? "会议交底" : row.receivingType === 2 ? "书面交底" : row.receivingType === 3 ? "会议与书面交底" : "" }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="disclosureTime" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="交底状态" prop="enableStatus" align="center" show-overflow-tooltip v-if="([4, 5, 11].includes(user.orgType) && radio != 1) || [2, 3, 9].includes(user.orgType)">
          <template slot-scope="{ row }">
            {{ row.enableStatus === 1 ? "草稿" : row.enableStatus === 2 ? "待接收" : row.enableStatus === 3 ? "已接收" : "" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250">
          <template slot-scope="{ row }">
            <el-button plain type="primary" @click="handleOpen(1, row)" v-show="([1, 3].includes(row.enableStatus) && user.orgType === 4) || (user.orgType !== 4 && row.isReceive != 1)" size="mini">查看</el-button>
            <el-button plain size="mini" type="success" v-show="row.isReceive" @click="accept(row)">接收</el-button>
            <el-button plain size="mini" v-show="row.isCopy" v-has="'production:disclosure:distribute'" @click="openCopyDialog(row)">抄送</el-button>
            <el-button plain size="mini" type="success" v-has="'production:disclosure:update'" v-show="row.editStatus" @click="handleOpen(3, row)">编辑</el-button>
            <el-button plain size="mini" type="danger" v-has="'production:disclosure:delete'" v-show="row.deleteStatus" @click="handleDel(row)">删除</el-button>
            <el-button plain size="mini" type="danger" v-has="'production:disclosure:withdraw'" v-show="row.isWithdraw" @click="recall(row)">撤回</el-button>
            <span v-if="user.orgType === 4 && row.enableStatus === 2">待接收</span>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 分页组件 -->
    <tablePaging v-if="typeShow" :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>

    <!-- 新增弹框 -->
    <el-dialog :title="title" top="1vw" center :visible="dialogVisible" width="30%" @close="handleClose(false)" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div style="position: relative" class="dialog-form">
        <el-form ref="forms" label-width="120px" :rules="rules" :model="formDate">
          <el-form-item label="项目" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9" prop="fkProjectId">
            <el-select v-model="formDate.fkProjectId" @change="proChange($event, 2)" size="mini" class="wh-100per">
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标段项目" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9" prop="fkBidProjectId">
            <el-select v-model="formDate.fkBidProjectId" @change="fkBidProjectIdChange($event, 2)" size="mini" class="wh-100per" :disabled="!formDate.fkProjectId && [2, 3, 9].includes(this.user.orgType)">
              <el-option v-for="item in addBidoptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="交底名称" prop="disclosureName">
            <el-input size="mini" v-model="formDate.disclosureName" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="交底部门" prop="fkDeptId">
            <!-- <el-select v-model="formDate.fkDeptId" size="mini" class="wh-100per" @change="fkDeptIdChange">
              <el-option v-for="item in disclosureDepList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select> -->
            <el-input size="mini" disabled v-model="user.deptName" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="交底人" prop="fkUserId">
            <!-- <el-select v-model="formDate.fkUserId" size="mini" class="wh-100per" :disabled="!formDate.fkDeptId">
              <el-option v-for="item in disclosurePeopleList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select> -->
            <!-- 修改为当前自己 -->
            <el-input size="mini" disabled v-model="user.orgName" placeholder=""></el-input>
          </el-form-item>
          <!-- <el-form-item label="交底时间" prop="disclosureTime">
            <el-date-picker size="mini" class="wh-100per" value-format="yyyy-MM-dd" v-model="formDate.disclosureTime"></el-date-picker>
          </el-form-item> -->
          <el-form-item label="接收单位" v-if="(this.user.orgType === 5 && radio == 3) || [2, 3, 9].includes(this.user.orgType)" prop="fkReceivingOrgId">
            <el-select v-model="formDate.fkReceivingOrgId" size="mini" class="wh-100per" @change="fkReceivingOrgIdChange" :disabled="!formDate.fkBidProjectId && [2, 3, 9].includes(this.user.orgType)">
              <el-option v-for="item in addreceiveUnitList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="接收部门" v-if="(this.user.orgType === 5 && radio == 2) || [2, 3, 9].includes(this.user.orgType)" prop="fkReceivingDeptId">
            <el-select v-model="formDate.fkReceivingDeptId" size="mini" class="wh-100per" @change="fkReceivingDeptIdChange" :disabled="!formDate.fkReceivingOrgId && [2, 3, 9].includes(this.user.orgType)">
              <el-option v-for="item in receiveDepList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="接收人" prop="fkReceivingUserId">
            <el-select v-model="formDate.fkReceivingUserId" size="mini" class="wh-100per" :disabled="!formDate.fkReceivingDeptId && [2, 3, 9].includes(this.user.orgType)">
              <el-option v-for="item in receivePeopleList" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="交底方式" prop="receivingType">
            <el-select v-model="formDate.receivingType" size="mini" class="wh-100per">
              <el-option v-for="(item, idx) in receivingTypeList" :key="idx" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否允许抄送" prop="forwardType">
            <el-select v-model="formDate.forwardType" size="mini" class="wh-100per">
              <el-option :value="1" label="是"></el-option>
              <el-option :value="2" label="否"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="附件" prop="fileList">
            <el-button size="small" type="primary" class="el-button-primary" @click="uploading" v-if="fileList.length < 10">点击上传</el-button><br v-if="fileList.length < 10" />
            <div class="fileList">
              <span class="fileList-item" v-for="(item, idx) in fileList" :key="idx">
                <div class="fileName" :title="item.enclosureName" @click="preview(item)">{{ item.enclosureName }}</div>
                <el-button size="mini" style="color: red; border: none" icon="el-icon-close" @click="remove(item, idx)"></el-button>
              </span>
            </div>
          </el-form-item>
        </el-form>
        <!-- <el-form label-width="80px" class="number2">
          <el-form-item label="编号" v-if="dialogType === 3">
            <el-input class="wh-140" :value="formDate.technicalCode" size="mini" disabled></el-input>
          </el-form-item>
        </el-form> -->
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="handleClose(false)">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="btnAdd(2)">发起</el-button>
        <el-button type="primary" class="el-button-primary" @click="btnAdd(1)">保存</el-button>
      </span>
    </el-dialog>
    <!-- 查看弹框 -->
    <el-dialog title="查看交底" center top="5vw" width="80%" :visible="show" @close="checkDialogClose" :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div style="position: relative" class="dialog-form">
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="查看交底" name="first">
            <div class="h-520">
              <el-form label-width="80px">
                <el-row :span="24" class="el-row-data">
                  <el-col :span="12" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9">
                    <el-form-item label="项目">
                      <el-input :value="formDate.fkProjectName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="user.orgType !== 5">
                    <el-form-item label="标段项目">
                      <el-input :value="formDate.fkBidProjectName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交底名称">
                      <el-input :value="formDate.disclosureName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交底方式">
                      <el-select v-model="formDate.receivingType" size="mini" class="wh-100per" disabled>
                        <el-option v-for="(item, idx) in receivingTypeList" :key="idx" :value="item.value" :label="item.label"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="radio != 2">
                    <el-form-item label="交底单位">
                      <el-input :value="formDate.fkOrgName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交底部门">
                      <el-input :value="formDate.fkDeptName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交底人">
                      <el-input :value="formDate.fkUserName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <!-- <el-col :span="12">
                    <el-form-item label="交底时间">
                      <el-input :value="formDate.disclosureTime" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col> -->
                  <el-col :span="12" v-if="radio != 2">
                    <el-form-item label="接收单位">
                      <el-input :value="formDate.fkReceivingOrgName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="radio != 3 && user.orgType != 7">
                    <el-form-item label="接收部门">
                      <el-input :value="formDate.fkReceivingDeptName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="接收人">
                      <el-input :value="formDate.fkReceivingUserName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="接收时间">
                      <el-input :value="formDate.receivingTime" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="this.formDate.fkParentId == 0 ? '发起人' : '抄送人'">
                      <el-input :value="formDate.userName" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="this.formDate.fkParentId == 0 ? '创建时间' : '抄送时间'">
                      <el-input :value="formDate.createTime" size="mini" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="附件" v-if="fileList.length">
                      <div>
                        <span v-for="(item, idx) in fileList" :key="idx" class="file-item">
                          <input class="fileCheckBox" type="checkbox" checked @change="checkBoxChange($event, item)" />
                          <span type="primary" style="text-decoration: underline; color: #4196e8; cursor: pointer" @click="preview(item)">{{ item.enclosureName }}</span>
                        </span>
                      </div>
                      <span style="color: #4196e8; cursor: pointer" @click="downLoad">下载</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="抄送记录" name="second" v-if="this.formDate.fkParentId === '0'">
            <div class="h-520 table-data">
              <el-table :tooltip-effect="'light'" :data="copyRecordList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                <el-table-column align="center" label="选择">
                  <template slot-scope="{ row }">
                    <!--  v-show="row.receiveStatus == 2" -->
                    <el-checkbox v-model="row.checked" v-if="copyRecordListStatus && row.receiveStatus == 2" @change="checkedChange"></el-checkbox>
                  </template>
                </el-table-column>
                <el-table-column align="center" prop="disclosureName" label="交底名称"> </el-table-column>
                <el-table-column align="center" label="交流方式">
                  <template slot-scope="{ row }">
                    {{ row.receivingType === 1 ? "会议交底" : row.receivingType === 2 ? "书面交底" : row.receivingType === 3 ? "会议与书面交底" : "" }}
                  </template>
                </el-table-column>
                <el-table-column align="center" prop="fkDeptName" label="抄送人部门" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="fkUserName" label="抄送人" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="createTime" label="抄送时间" min-width="130px" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="fkReceivingDeptName" label="接收部门" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="fkReceivingUserName" label="接收人" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="receiveStatusStr" label="接收状态" show-overflow-tooltip> </el-table-column>
                <el-table-column align="center" prop="receivingTime" label="接收时间" min-width="130px" show-overflow-tooltip> </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                  <img src="@/assets/empty.svg" class="zanwu" />
                  <span>暂无数据</span>
                </div>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
        <!-- <el-form label-width="80px" class="number">
          <el-form-item label="编号">
            <el-input :value="formDate.technicalCode" size="mini" disabled></el-input>
          </el-form-item>
        </el-form> -->
      </div>
      <span slot="footer" class="dialog-footer">
        <div style="text-align: left !important;" v-if="activeName == 'second'">
          <!-- <el-checkbox v-model="checked">{{checked?"反选":"全选"}}</el-checkbox> -->
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <el-button @click="withdraw" style="margin-left:8px;">撤回抄送记录</el-button>
          <span style="color:#bfbfbf;font-size:13px;margin-left:8px">(请选择抄送记录并撤回，仅可撤回未接受项)</span>
        </div>
        <!-- <el-button @click="checkDialogClose">取 消</el-button> -->
      </span>
    </el-dialog>
    <!-- 抄送弹框 -->
    <el-dialog title="抄送" :visible="copyDialog" @close="copyDialogClose" width="30%" center :close-on-press-escape="false" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-tree ref="tree" :data="treeList" :props="defaultProps" node-key="pkId" show-checkbox default-expand-all> </el-tree>
      </div>
      <div slot="footer">
        <el-button @click="copyDialogClose">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="copyOk">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + url" v-if="previewType == 1"></iframe>
        <img class="img" :src="url" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog2" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <video :src="videoSrc" controls="controls" autoplay height="650px"></video>
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <input v-show="false" type="file" ref="files" id="upload" @change="upLoad" />
  </div>
</template>

<script>
import tablePaging from "@/components/tablePaging";
import COS from "cos-js-sdk-v5";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import treeSelect from "../../components/proTreeSelect/treeSelect.vue";
export default {
  components: { tablePaging, pdfPiev, treeSelect },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {
    radio: {
      handler(val) {
        if (!this.typeShow) {
          return;
        }
        this.randomKey = Math.random();
        this.tableData = [];
        this.searchData = {}; // 搜素请求时的数据
        this.inpData = {
          fkOrgId: "", // 组织ID
          fkProjectId: this.inpData.fkProjectId, // 项目ID
          fkBidProjectId: this.inpData.fkBidProjectId, // 标段项目ID
          disclosureName: "", // 交底名称
          fkDeptId: "", // 交底部门ID
          fkReceivingOrgId: "", // 接收单位ID
          fkReceivingDeptId: "", // 接收部门ID
          beginTime: "", // 查询开始时间
          endTime: "" // 查询结束时间
        };
        if (val == 1) {
          this.receiveDepList = this.allDeptList;
          this.searchByCompanies();
        } else if (val == 2) {
          this.disclosureDepList = this.allDeptList;
          this.receiveDepList = this.allDeptList;
        } else if (val == 3) {
          this.receiveUnitList = this.subList;
          this.disclosureDepList = this.allDeptList;
          this.customsContainUsers();
        }
        this.searchDisclosurePage();
      }
    }
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        if (this.user.orgType !== 5) {
          this.getAllProject();
          this.projectListByOrgId();
        }
        // else if ([2, 3, 9].includes(this.user.orgType)) {
        //   this.projectListByOrgId();
        // }
        this.deptListByOrgId();
        this.searchDisclosurePage();
      } else {
        this.$message.error(res.msg);
      }
    });
    this.searchByCompanies();
  },
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === this.formDate.fkUserId) {
        callback(new Error("接收人和交底人不能为同一人"));
      } else {
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === this.formDate.fkReceivingUserId) {
        callback(new Error("接收人和交底人不能为同一人"));
      } else {
        callback();
      }
    };
    return {
      radio: "1", // 顶部按钮选择
      options: [], // 项目下拉
      addBidoptions: [], // 新增里的标段项目下拉
      proOptions: [], // 标段下拉
      page: {
        pageSize: 10,
        pageNum: 1
      }, // 分页数据
      total: 0, // 分页总数
      tableData: [], // 列表数据
      searchData: {}, // 搜素请求时的数据
      inpData: {
        fkOrgId: "", // 组织ID
        fkProjectId: "", // 项目ID
        fkBidProjectId: "", // 标段项目ID
        disclosureName: "", // 交底名称
        fkDeptId: "", // 交底部门ID
        fkReceivingOrgId: "", // 接收单位ID
        fkReceivingDeptId: "", // 接收部门ID
        beginTime: "", // 查询开始时间
        endTime: "" // 查询结束时间
      }, // 搜索框数据
      disclosureUnitList: [], // 交底单位下拉
      disclosureDepList: [], // 交底部门下拉
      receiveUnitList: [], // 接收单位下拉
      receiveDepList: [], // 接收部门下拉
      disclosurePeopleList: [], // 交底人下拉
      receivePeopleList: [], // 接收人下拉
      allDeptList: [], // 项目部下的部门
      subList: [], // 接收单位下拉（分包单位，带员工）
      addreceiveUnitList: [], // 新增时的接收单位下拉
      linkProList: [],
      dialogType: 2,
      title: "新增交底", // 弹框名称
      dialogVisible: false,
      formDate: {
        disclosureName: "",
        // disclosureTime: "",
        disclosureType: null,
        enableStatus: null,
        enclosures: [],
        fkBidProjectId: null,
        fkDeptId: null,
        fkProjectId: null,
        fkReceivingDeptId: null,
        fkReceivingOrgId: null,
        fkReceivingUserId: null,
        fkUserId: null,
        forwardType: null,
        receivingType: null,
        fileList: []
      },
      rules: {
        fkBidProjectId: [{ required: true, message: "请选择标段", trigger: "blur" }],
        fkProjectId: [{ required: true, message: "请选择项目", trigger: "blur" }],
        disclosureName: [{ required: true, message: "请输入交底名称", trigger: "blur" }],
        fkReceivingDeptId: [{ required: true, message: "请选择接收部门", trigger: "blur" }],
        fkReceivingOrgId: [{ required: true, message: "请选择接收单位", trigger: "blur" }],
        fkReceivingUserId: [
          { required: true, message: "请选择接收人", trigger: "blur" },
          { validator: validatePass, trigger: "blur" }
        ],
        forwardType: [{ required: true, message: "请选择是否可以转发", trigger: "blur" }],
        receivingType: [{ required: true, message: "请选择交底方式", trigger: "blur" }]
      },
      // 1：会议交底， 2：书面交底，3：会议与书面交底
      receivingTypeList: [
        { value: 1, label: "会议交底" },
        { value: 2, label: "书面交底" },
        { value: 3, label: "会议与书面交底" }
      ],
      loading: false,
      show: false,
      checkList: [],
      fileList: [],
      url: "",
      previewType: 3,
      previewDialog: false,
      previewDialog2: false,
      videoSrc: "",
      copyDialog: false,
      treeList: [],
      defaultProps: {
        label: "label",
        children: "users",
        disabled: this.treeDisabled
      },
      randomKey: Math.random(), // 防止表单样式错乱的随机key值
      activeName: "first",
      copyRecordList: [], // 抄送记录
      copyPkId: "",
      newAddList: [],
      delList: [],
      typeShow: true,
      searchOptionsEnd: {
        disabledDate: time => {
          if (this.inpData.beginTime) {
            let d;
            if (typeof this.inpData.beginTime == "string") {
              d = new Date(this.inpData.beginTime).getTime();
            } else {
              d = this.inpData.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      pickerOptionsAnd: {
        disabledDate: time => {
          if (this.inpData.endTime) {
            let d;
            if (typeof this.inpData.endTime == "string") {
              d = new Date(this.inpData.endTime).getTime();
            } else {
              d = this.inpData.endTime.getTime();
            }
            return time.getTime() > d;
          }
        }
      },
      immediate: true,
      checkAll: false,
      isIndeterminate: false,
      copyRecordListStatus: true
    };
  },
  methods: {
    handleCheckAllChange(val) {
      console.log(val);
      this.copyRecordList.forEach(item => {
        item.checked = val;
      });
      console.log(this.copyRecordList);
      this.copyRecordListStatus = false;
      this.copyRecordListStatus = true;

      this.isIndeterminate = false;
    },
    checkedChange() {
      let arr = [];
      this.copyRecordList.forEach(item => {
        if (item.checked) {
          arr.push(item.pkId);
        }
      });
      if (arr.length == this.copyRecordList.length) {
        this.checkAll = true;
        this.isIndeterminate = false;
      } else {
        this.checkAll = false;
        this.isIndeterminate = arr.length == 0 ? false : true;
        // this.isIndeterminate = arr.length ==  this.copyRecordList.length?false:true;
      }
      this.copyRecordListStatus = false;
      this.copyRecordListStatus = true;
      // this.isIndeterminate = arr.length ==  this.copyRecordList.length?false:;
    },
    selectIds(arr, obj, isTrue) {
      console.log("获取到的", arr, obj);
      if (arr.length) {
        if (arr.length > 1) {
          this.inpData.fkProjectId = arr[0];
          this.inpData.fkBidProjectId = arr[1];
        } else {
          this.inpData.fkBidProjectId = arr[0];
        }
      }
      if (isTrue) {
        this.btnSearch();
      }
    },
    withdraw() {
      const arr = [];
      this.copyRecordList.forEach(item => {
        if (item.checked) {
          arr.push(item.pkId);
        }
      });
      if (arr.length == 0) {
        return this.$message.error("请选择至少一条数据");
      }
      this.$confirm("确定撤回抄送记录?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.retractCopy({ copyIds: arr }).then(res => {
          if (res.code === 200) {
            this.checkDialogClose();
            this.searchDisclosurePage();
            this.$message.success("撤回成功");
          } else {
            this.$message.warning("撤回失败");
          }
        });
      });
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "", type) {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          if (type === 1) {
            this.proOptions = res.data;
          } else {
            this.addBidoptions = res.data;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取关联项目部（接收单位）
    projectListByOrgId() {
      this.$api.projectListByOrgId().then(res => {
        if (res.code === 200) {
          this.linkProList = res.data.map(item => ({ ...item, value: item.pkId, label: item.projectOrgName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 技术交底分页列表
    searchDisclosurePage() {
      let disclosureType = "";
      if (this.user.orgType === 5 || this.user.orgType === 4 || this.user.orgType === 11 || this.user.orgType === 12 || this.user.orgType === 10) {
        disclosureType = this.radio - 0;
      } else if (this.user.orgType === 7) {
        disclosureType = 3;
      } else {
        disclosureType = 1;
      }
      // disclosureType
      //       this.inpData.fkProjectId = arr[0];
      // this.inpData.fkBidProjectId = arr[1];
      this.$api.searchDisclosurePage({ ...this.page, disclosureType, ...this.searchData, ...this.inpData }).then(res => {
        console.log("分页", res);
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询交底单位
    searchByCompanies() {
      this.$api.searchByCompanies().then(res => {
        console.log("交底单位", res);
        if (res.code === 200) {
          this.disclosureUnitList = res.data.map(item => ({ ...item, value: item.fkLinkOrgId, label: item.customName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询当前登录组织下的所有部门和员工
    deptListByOrgId() {
      this.$api.deptListByOrgId().then(res => {
        console.log("所有部门", res);
        if (res.code === 200) {
          this.allDeptList = res.data.map(item => ({ ...item, value: item.pkId, label: item.deptName }));
          if (this.radio == 1 && [4, 5].includes(this.user.orgType)) {
            this.receiveDepList = this.allDeptList;
          } else if ([2, 3, 9].includes(this.user.orgType)) {
            this.disclosureDepList = this.allDeptList;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 项目部下级分包单位
    // subcontractor() {
    //   this.$api.subcontractor().then(res => {
    //     console.log("下级接收单位", res);
    //     if (res.code === 200) {
    //       this.receiveUnitList = res.data.map(item => ({ ...item, value: item.pkId, label: item.customName }));
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    // 分包单位下拉（带员工）
    customsContainUsers() {
      this.$api.customsContainUsers().then(res => {
        console.log("分包单位", res);
        if (res.code === 200) {
          this.receiveUnitList = res.data.map(item => ({ ...item, value: item.fkLinkOrgId, label: item.customName }));
          this.subList = res.data.map(item => ({ ...item, value: item.fkLinkOrgId, label: item.customName }));
          this.addreceiveUnitList = this.subList;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 新增/编辑交底
    async btnAdd(enableStatus) {
      await this.$refs.forms.validate();
      // 新增
      if (this.fileList == undefined || this.fileList == null || this.fileList.length == 0) {
        return this.$message.warning("附件不能为空");
      }
      if (this.user.orgType === 5) {
        this.formDate.disclosureType = this.radio - 0;
      } else {
        // 其他上级部门新增都是上级交底
        this.formDate.disclosureType = 1;
      }
      const data = { ...this.formDate, enclosures: this.fileList, enableStatus };
      this.loading = true;
      if (this.dialogType === 2) {
        this.$api
          .addDisclosure(data)
          .then(res => {
            console.log("新增", res);
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.searchDisclosurePage();
              this.handleClose(true);
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
            console.error(err);
          });
      } else if (this.dialogType === 3) {
        // 编辑
        this.$api
          .updateDisclosure(data)
          .then(res => {
            console.log("编辑", res);
            this.loading = false;
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.searchDisclosurePage();
              this.handleClose(true);
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
            console.error(err);
          });
      }
    },
    // 选择交底部门后的change事件
    fkDeptIdChange(e) {
      const arr = this.disclosureDepList.filter(item => item.pkId === e)[0].users ? this.disclosureDepList.filter(item => item.pkId === e)[0].users : [];
      this.disclosurePeopleList = arr.map(item => ({ ...item, value: item.pkId, label: item.userName }));
    },
    // 选择接收单位后的change事件
    fkReceivingOrgIdChange(e) {
      if (this.user.orgType === 5) {
        const arr = this.subList.filter(item => item.fkLinkOrgId === e)[0].users ? this.subList.filter(item => item.fkLinkOrgId === e)[0].users : [];
        this.receivePeopleList = arr.map(item => ({ ...item, value: item.pkId, label: item.userName }));
      } else {
        this.formDate.fkReceivingDeptId = "";
        this.formDate.fkReceivingUserId = "";
        const arr = this.addreceiveUnitList.filter(item => item.fkOrgId === e).length ? this.addreceiveUnitList.filter(item => item.fkOrgId === e)[0].deptVoLists.map(item => ({ ...item, value: item.pkId, label: item.deptName })) : [];
        this.receiveDepList = arr;
      }
    },
    // 选择接收部门后的change事件
    fkReceivingDeptIdChange(e) {
      this.formDate.fkReceivingUserId = "";
      if (this.user.orgType === 5) {
        const arr = this.receiveDepList.filter(item => item.pkId === e)[0].users ? this.receiveDepList.filter(item => item.pkId === e)[0].users : [];
        this.receivePeopleList = arr.map(item => ({ ...item, value: item.pkId, label: item.userName }));
      } else {
        this.formDate.fkReceivingUserId = "";
        const arr = this.receiveDepList.filter(item => item.pkId === e).length ? this.receiveDepList.filter(item => item.pkId === e)[0].users.map(item => ({ ...item, value: item.pkId, label: item.userName })) : [];
        this.receivePeopleList = arr;
      }
    },
    // 标段change事件
    fkBidProjectIdChange(e, type) {
      const arr = this.linkProList.filter(item => item.pkId === e).length ? this.linkProList.filter(item => item.pkId === e) : [];
      if (type === 1) {
        this.inpData.fkReceivingOrgId = "";
        this.receiveUnitList = arr.map(item => ({ ...item, value: item.fkOrgId, label: item.projectOrgName }));
      } else {
        this.formDate.fkReceivingOrgId = "";
        this.formDate.fkReceivingDeptId = "";
        this.formDate.fkReceivingUserId = "";
        this.addreceiveUnitList = arr.map(item => ({ ...item, value: item.fkOrgId, label: item.projectOrgName }));
      }
    },
    // 接收
    accept(row) {
      this.updateEnableStatus(row.pkId, 1);
    },
    // 删除
    handleDel(row) {
      this.$confirm("确定删除该交底?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.delDisclosureById({ pkId: row.pkId }).then(res => {
          if (res.code === 200) {
            this.searchDisclosurePage();
            this.$message.success("删除成功");
          } else {
            this.$message.warning("删除失败");
          }
        });
      });
    },
    // 撤回
    recall(row) {
      this.$confirm("确定撤回该交底?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.updateEnableStatus(row.pkId, 2);
      });
    },
    // 打开弹框
    handleOpen(type, row) {
      this.dialogType = type;
      // if (type !== 1 && this.radio === 3) {
      //   this.customsContainUsers();
      // }
      if (type !== 2) {
        this.selectDisclosureById(row.pkId);
      }
      if (type === 1) {
        // 查看
        this.show = true;
        this.activeName = "first";
        this.checkAll = false;
      } else if (type === 2) {
        // 新增
        this.title = "新增交底";
        this.dialogVisible = true;
        this.formDate.fkDeptId = this.user.fkDeptId == null ? 0 : this.user.fkDeptId;
        this.formDate.fkUserId = this.user.pkId;
        if (this.user.fkDeptId) {
          this.formDate.fkDeptId = this.user.fkDeptId == null ? 0 : this.user.fkDeptId;
          this.formDate.fkUserId = this.user.pkId;
          this.disclosurePeopleList = this.disclosureDepList.filter(item => item.pkId === this.user.fkDeptId)[0].users.map(item => ({ ...item, value: item.pkId, label: item.userName }));
        }
        if (this.user.orgType === 5) {
          this.formDate.disclosureType = this.radio - 0;
        } else {
          // 其他上级部门新增都是上级交底
          this.formDate.disclosureType = 1;
        }
      } else {
        // 编辑
        this.title = "编辑交底";
        this.dialogVisible = true;
      }
    },
    // 根据ID接收或撤回技术交底
    updateEnableStatus(pkId, enableStatus) {
      this.$api.updateEnableStatus({ pkId, enableStatus }).then(res => {
        if (res.code === 200) {
          this.searchDisclosurePage();
          this.$message.success(enableStatus == 1 ? "接收成功" : "撤回成功");
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据id查询交底
    selectDisclosureById(pkId) {
      this.$api.selectDisclosureById({ pkId }).then(res => {
        if (res.code === 200) {
          this.formDate = res.data;
          this.fileList = res.data.enclosures ? res.data.enclosures : [];
          this.checkList = this.fileList;
          this.copyRecordList = res.data.copyVos ? res.data.copyVos : [];
          if (this.dialogType !== 1) {
            if (this.user.orgType === 5) {
              this.disclosurePeopleList = this.disclosureDepList.filter(item => item.pkId === res.data.fkDeptId)[0].users.map(item => ({ ...item, value: item.pkId, label: item.userName }));
              if (this.radio == 2) {
                this.receivePeopleList = this.receiveDepList.filter(item => item.pkId === res.data.fkReceivingDeptId)[0].users.map(item => ({ ...item, value: item.pkId, label: item.userName }));
              } else if (this.radio == 3) {
                this.addreceiveUnitList = this.subList;
                this.receivePeopleList = this.subList.filter(item => item.fkLinkOrgId === res.data.fkReceivingOrgId)[0].users.map(item => ({ ...item, value: item.pkId, label: item.userName }));
              }
            } else if ([2, 3, 9].includes(this.user.orgType)) {
              this.disclosurePeopleList = this.disclosureDepList.filter(item => item.pkId === res.data.fkDeptId)[0].users.map(item => ({ ...item, value: item.pkId, label: item.userName }));
              this.allListBidByProId(0, res.data.fkProjectId, 2);
              const arr = this.linkProList.filter(item => item.pkId === res.data.fkBidProjectId).length ? this.linkProList.filter(item => item.pkId === res.data.fkBidProjectId) : [];
              this.addreceiveUnitList = arr.map(item => ({ ...item, value: item.fkOrgId, label: item.projectOrgName }));
              this.receiveDepList = this.addreceiveUnitList.filter(item => item.fkOrgId === res.data.fkReceivingOrgId).length ? this.addreceiveUnitList.filter(item => item.fkOrgId === res.data.fkReceivingOrgId)[0].deptVoLists.map(item => ({ ...item, value: item.pkId, label: item.deptName })) : [];
              this.receivePeopleList = this.receiveDepList.filter(item => item.pkId === res.data.fkReceivingDeptId).length ? this.receiveDepList.filter(item => item.pkId === res.data.fkReceivingDeptId)[0].users.map(item => ({ ...item, value: item.pkId, label: item.userName })) : [];
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    handleClose(isDel) {
      this.$refs.forms.resetFields();
      this.dialogVisible = false;
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      this.fileList = [];
      this.formDate = {
        disclosureName: "",
        // disclosureTime: "",
        disclosureType: null,
        enclosures: [],
        enableStatus: null,
        fkBidProjectId: null,
        fkDeptId: null,
        fkProjectId: null,
        fkReceivingDeptId: null,
        fkReceivingOrgId: null,
        fkReceivingUserId: null,
        fkUserId: null,
        forwardType: null,
        receivingType: null
      };
      this.disclosurePeopleList = []; // 交底人下拉
      this.receivePeopleList = []; // 接收人下拉
      this.addBidoptions = [];
    },
    delFiles() {
      let urls = [];
      if (this.dialogType === 2) {
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
    checkDialogClose() {
      if (this.$refs.forms) {
        this.$refs.forms.resetFields();
      }
      document.querySelectorAll(".fileCheckBox").forEach(item => {
        item.checked = false;
      });
      this.fileList = [];
      this.formDate = {
        disclosureName: "",
        // disclosureTime: "",
        disclosureType: null,
        enclosures: [],
        enableStatus: null,
        fkBidProjectId: null,
        fkDeptId: null,
        fkProjectId: null,
        fkReceivingDeptId: null,
        fkReceivingOrgId: null,
        fkReceivingUserId: null,
        fkUserId: null,
        forwardType: null,
        receivingType: null
      };
      this.show = false;
    },
    // 根据交底id获取
    deptListById(pkId) {
      this.$api.deptListById({ pkId }).then(res => {
        if (res.code === 200) {
          this.treeList = res.data.map(item => ({ ...item, label: item.deptName, users: item.users.map(item2 => ({ ...item2, label: item2.userName })) }));
          let arr = [];
          res.data.forEach(item => {
            arr = [...arr, ...item.users];
          });
          this.copyDialog = true;
          this.$nextTick(() => {
            const ids = arr.length ? arr.filter(item => item.isSelect).map(item => item.pkId) : [];
            this.$refs.tree.setCheckedKeys(ids);
          });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchDisclosurePage();
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchDisclosurePage();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchDisclosurePage();
    },
    // 选择项目部
    proChange(e, type) {
      if (type === 1) {
        this.inpData.fkBidProjectId = "";
        this.inpData.fkReceivingOrgId = "";
      } else {
        this.formDate.fkBidProjectId = "";
        this.formDate.fkReceivingOrgId = "";
        this.formDate.fkReceivingDeptId = "";
        this.formDate.fkReceivingUserId = "";
      }
      if (e) {
        this.allListBidByProId(0, e, type);
      }
    },
    // 触发上传input框
    uploading() {
      this.$refs.files.click();
    },
    // 删除附件
    remove(row, idx) {
      this.delList.push(row.enclosureUrl);
      this.fileList.splice(idx, 1);
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
            _this.newAddList.push(path);
            _this.fileList.push({ enclosureName: _this.$refs.files.files[0].name, enclosureUrl: path });
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.files.value = "";
          } else {
            _this.loading = false;
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
      if (this.fileList.filter(item => item.enclosureName == filename).length) {
        return this.$message.warning("已有相同名字附件");
      }
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      if (fileObj.size > 104857600) {
        this.$refs.files.value = "";
        return this.$message.warning("文件大小不能超过100M");
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
            console.log("res", res);
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          console.log("err", err);
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
    // 下载
    downLoad() {
      if (this.checkList.length == 0) {
        return this.$message.warning("请勾选需要下载的附件");
      }
      if (this.checkList.length === 1) {
        const exit = this.checkList[0].enclosureUrl.substring(this.checkList[0].enclosureUrl.lastIndexOf(".") + 1);
        this.fileLinkToStreamDownload(this.checkList[0].enclosureUrl, this.checkList[0].enclosureName, exit);
      } else if (this.checkList.length > 1) {
        // const fileUrls = this.checkList.map(item => item.enclosureUrl).join(",");
        let fileList = this.checkList.map(item => ({ fileUrl: item.enclosureUrl, fileName: item.enclosureName }));
        this.loading = true;
        this.$api
          .compressFile({ fileName: "附件" + Date.now(), fileList })
          .then(res => {
            console.log("压缩包", res);
            if (res.code === 200) {
              this.fileLinkToStreamDownload(res.data, this.formDate.disclosureName + "-附件", "zip");
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    fileLinkToStreamDownload(url, fileName, type) {
      const reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/;
      if (!reg.test(url)) {
        throw new Error("传入参数不合法,不是标准的文件链接");
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.setRequestHeader("Content-Type", `application/${type}`);
        xhr.responseType = "blob";
        xhr.onload = function() {
          if (this.status == 200) {
            // 接受二进制文件流
            // console.log(this);
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
      }
    },
    // 下载多选框
    checkBoxChange(e, row) {
      const check = e.target.checked;
      if (check) {
        this.checkList.push(row);
      } else {
        this.checkList = this.checkList.filter(item => item !== row);
      }
    },
    // 预览
    preview(row) {
      console.log(row);
      if (!row.enclosureUrl) {
        return this.$message.warning("无法识别的文件");
      }
      const exit = row.enclosureUrl.substring(row.enclosureUrl.lastIndexOf(".") + 1);
      console.log(exit);
      let noimgType = ["avi", "wmv", "mpg", "mpeg", "mov", "rm", "ram", "swf", "flv", "mp4", "wma", "rm", "rmvb", "flv", "mpg", "mkv"];
      if (noimgType.includes(exit)) {
        this.videoSrc = row.enclosureUrl;
        this.previewDialog2 = true;
        return;
      }
      const imgList = ["png", "jpg", "jpeg"];
      const orderList = ["docx", "xlsx"];
      this.url = row.enclosureUrl;

      if (exit === "pdf") {
        this.$refs.pdfPiev.pdfShow = true;
      } else if (imgList.includes(exit)) {
        this.previewType = 3;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (orderList.includes(exit)) {
        this.previewType = 1;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else {
        this.$message.warning("该文件无法预览");
      }
    },
    // 抄送弹框
    openCopyDialog(row) {
      this.deptListById(row.pkId);
      this.copyPkId = row.pkId;
    },
    copyOk() {
      const nodes = this.$refs.tree.getCheckedNodes(true);
      const userIds = nodes.filter(item => item.isSelect !== 1).map(item => item.pkId);
      if (!userIds.length) {
        return this.$message.warning("未选择抄送人");
      }
      this.$api.copyDisclosure({ pkId: this.copyPkId, userIds }).then(res => {
        console.log(res);
        if (res.code === 200) {
          this.$message.success("抄送成功");
          this.searchDisclosurePage();
          this.copyDialogClose();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    copyDialogClose() {
      this.$refs.tree.getCheckedNodes([]);
      this.copyDialog = false;
      this.copyPkId = "";
    },
    treeDisabled(data, node) {
      if (data.isSelect === 1) {
        return true;
      }
      return false;
    }
  }
};
</script>

<style lang="scss" scoped>
.topTabs {
  padding: 5px;
  background-color: #fff;
}
.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 0 20px;
  margin-bottom: 5px;
  .myform {
    align-items: center;
    margin-top: 20px;
  }
}
.search {
  margin-top: 6px;
}
.wh-100per {
  width: 100%;
}
.fileList {
  display: flex;
  flex-wrap: wrap;
  max-height: 80px;
  overflow: auto;
  .fileList-item {
    display: flex;
    .fileName {
      cursor: pointer;
      max-width: 120px;
      overflow: hidden;
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
  }
}
::-webkit-scrollbar {
  width: 5px;
  color: #fff;
  background-color: #fcfcfc;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.file-item {
  margin: 0 10px;
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
    background: url("../../assets/loading.gif") no-repeat center center;
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
/deep/ .el-tree {
  height: 500px;
  overflow: auto;
}
.h-520 {
  height: 520px;
}
.number {
  position: absolute;
  top: 0;
  right: 0;
}
.number2 {
  position: absolute;
  top: -60px;
  left: -30px;
}
.w-180 {
  width: 180px;
}
</style>
