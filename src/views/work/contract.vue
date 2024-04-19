<!-- 劳务合同 -->
<template>
  <div class="app-container">
    <el-tabs v-model="orgType" @tab-click="orgTypeChange" v-if="typeShow">
      <el-tab-pane label="已签合同" name="1"></el-tab-pane>
      <el-tab-pane label="未完成合同" name="2"></el-tab-pane>
      <el-tab-pane label="失效合同" name="4" v-if="user.orgType == 7"></el-tab-pane>
      <el-tab-pane v-if="user.orgType == 7" label="合同模板" name="3"></el-tab-pane>
    </el-tabs>
    <div class="header-seach">
      <el-collapse-transition>
        <el-form :inline="true" :model="form" label-width="50px" class="search-mr">
          <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)" label-width="70px">
            <treeSelect @selectIds="selectIds"></treeSelect>
          </el-form-item>
          <el-form-item label="标段项目" prop="fkProjectId" label-width="70px" v-if="user.orgType == 7 && typeShow">
            <el-select size="mini" v-model="form.fkProjectId" placeholder="请选择" style="width: 100%" @change="listByProjectId">
              <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分包单位" prop="fkOrgId" label-width="70px" v-if="(user.orgType == 2 || user.orgType == 3 || user.orgType == 9 || user.orgType == 5 || user.orgType == 10 || user.orgType == 11 || user.orgType == 12) && typeShow">
            <el-select size="mini" v-model="form.fkOrgId" placeholder="请选择" style="width: 100%" :disabled="subcontractorStatus" @change="subcontractorSelect">
              <el-option v-for="item in subcontractorData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="班组" prop="fkTeamId" label-width="50px" v-if="orgType != 3 && typeShow">
            <el-select size="mini" v-model="form.fkTeamId" placeholder="请选择" style="width: 100%" :disabled="groupStatus">
              <el-option v-for="item in searchTeamData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="orgType != 2 && orgType != 3 && typeShow" label="合同类型" prop="remark" label-width="70">
            <el-select size="mini" v-model="form.contractType" placeholder="请选择" style="width: 100%">
              <el-option label="全部" value=""></el-option>
              <el-option label="入职合同" value="1"></el-option>
              <el-option label="定向邀签" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="劳务人员" prop="userName" label-width="70px" v-if="orgType != 3 && typeShow">
            <el-input size="mini" v-model="form.userName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="模板名称" prop="remark" label-width="70px" v-if="orgType == 3 && typeShow">
            <el-input size="mini" v-model="form.templateName" autocomplete="off" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="关键字" prop="remark" label-width="60px" v-if="orgType == 3 && typeShow">
            <el-input size="mini" v-model="form.keyword" autocomplete="off" maxlength="100"></el-input>
          </el-form-item>
          <el-form-item prop="remark" label-width="1px" v-if="typeShow">
            <el-button type="primary" class="el-button-primary" icon="el-icon-search" size="mini" @click.native="search">查询</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-transition>
      <div class="hader-btn" v-if="typeShow">
        <!-- <el-button type="primary" class="el-button-primary" size="mini" v-if="orgType == 3" @click.native="signatureManagement">管理印章</el-button> -->
        <el-button type="primary" class="el-button-primary" size="mini" v-if="orgType == 3" @click.native="getOrgSealState(1)">新增合同模板</el-button>
      </div>
    </div>
    <div class="tab-container" v-if="typeShow">
      <div class="table-data" style="margin-top: 10px" :style="{ height: [2, 3, 9].includes(user.orgType) && orgType != 2 ? '73%' : '82%' }">
        <el-table v-if="orgType != 3" :key="randomKey" :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="userName" label="劳务人员" min-width="130"> </el-table-column>
          <el-table-column v-if="orgType == 1" align="center" prop="contractType" label="合同类型" min-width="90">
            <template slot-scope="scope">
              <div v-if="scope.row.contractType == 1">入职合同</div>
              <div v-if="scope.row.contractType == 2">定向邀签</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="cardNum" label="身份证号码" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="telephone" label="手机号码" min-width="80"> </el-table-column>
          <el-table-column v-if="orgType == 1" align="center" prop="signingTime" label="签订日期" min-width="100"> </el-table-column>
          <!-- <el-table-column v-if="user.orgType != 5 && user.orgType != 7" align="center" prop="projectName" label="项目" min-width="100"> </el-table-column>
          <el-table-column v-if="user.orgType != 5 && user.orgType != 7" align="center" prop="projectBidName" label="标段项目" min-width="100"> </el-table-column> -->
          <el-table-column v-if="user.orgType != 7" align="center" prop="orgName" label="所属分包单位" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="teamName" label="所属班组" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="nailState" :label="'甲方签署状态'" min-width="90">
            <template slot-scope="scope">
              <div v-if="scope.row.nailState == 0" style="color: red">待签署</div>
              <div v-if="scope.row.nailState == 1">已签署</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="bstate" label="乙方签署状态" min-width="90">
            <template slot-scope="scope">
              <div v-if="scope.row.bstate == 0" style="color: red">待签署</div>
              <div v-if="scope.row.bstate == 1">已签署</div>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" align="center" label="操作" min-width="360">
            <template slot-scope="scope">
              <el-button plain type="primary" size="mini" @click.native="contractView(scope.row)">查看合同</el-button>
              <el-button plain type="primary" size="mini" v-if="[5, 7].includes(user.orgType)" @click.native="signedProgress(scope.row)">签署进度</el-button>
              <el-button plain type="primary" v-show="scope.row.nailAllow == 1 && scope.row.nailState == 0 && orgType == 2" size="mini" @click.native="pecificSign(scope.row)">甲方签署</el-button>
              <el-button plain type="primary" v-has="'work:contract:acetylene'" v-show="scope.row.bstate == 0 && orgType == 2" size="mini" @click.native="signBtn(scope.row)">乙方签署</el-button>
              <el-button plain type="danger" v-show="orgType == 2 && user.orgType == 7" size="mini" @click.native="cancellation(scope.row)">作废</el-button>
              <el-button plain type="danger" v-has="'work:contract:termination'" v-show="orgType == 1 && user.orgType == 7" size="mini" @click.native="unwind(scope.row)">解约</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <el-table v-if="orgType == 3" :key="randomKey" :data="templateList" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="templateName" label="模板名称" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="templateCode" label="模板编号" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="keyword" label="关键字" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="contractType" label="合同类型" min-width="130">
            <template slot-scope="scope">
              <div v-if="scope.row.contractType == 1">入职合同</div>
              <div v-if="scope.row.contractType == 2">定向邀签</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="enableStatus" label="状态" min-width="130">
            <template slot-scope="scope">
              <div v-if="scope.row.enableStatus == 1">禁用</div>
              <div v-if="scope.row.enableStatus == 2">正常</div>
            </template>
          </el-table-column>
          <el-table-column prop="alarmLevel" label="操作" min-width="260" align="center">
            <template slot-scope="scope">
              <el-button plain type="primary" size="mini" @click.native="examine(scope.row)">查看</el-button>
              <el-button plain type="warning" size="mini" v-has="'work:contract:updateTemplate'" @click.native="getOrgSealState(2, scope.row)">编辑</el-button>
              <el-button plain v-if="scope.row.enableStatus == 2" type="warning" size="mini" v-has="'work:contract:enableTemplate'" @click.native="forbiddenBtn(scope.row)">禁用</el-button>
              <el-button plain v-if="scope.row.enableStatus == 1" type="success" size="mini" v-has="'work:contract:enableTemplate'" @click.native="startUsing(scope.row)">启用</el-button>
              <el-button plain type="danger" size="mini" v-has="'work:contract:deleteTemplate'" @click.native="batchDelete(scope.row)">删除</el-button>
              <el-button plain v-if="scope.row.enableStatus == 2 && scope.row.contractType == 2" v-has="'work:contract:directional'" type="primary" size="mini" @click.native="getOrgSealState(3, scope.row)">定向邀签</el-button>
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
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <!-- 签署提示 -->
    <el-dialog title="签署提示" class="sign-dialog" :visible.sync="show1" width="400px" v-dialogDrag :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="prompt-content">
          <div class="centent">已生成合同，请提醒</div>
          <div class="centent">该劳务人员在手机端完成“云签”操作</div>
        </div>
      </div>
    </el-dialog>
    <!-- 新增合同模板 -->
    <el-dialog top="5vh" :title="contractTitle" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading" @close="close2">
      <div class="dialog-form" v-if="orgSealState === 1">
        <div class="show-tow">
          <div class="left" style="width: 300px">
            <el-form :model="contractForm" ref="contractForm" label-width="70px" class="search-mr">
              <el-form-item label="模板名称" prop="name" label-width="70px">
                <el-input :disabled="contractTitle == '合同模板信息'" size="mini" maxlength="25" v-model="contractForm.templateName" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="模板类型" prop="type" label-width="70px">
                <el-select :disabled="contractTitle == '合同模板信息'" size="mini" v-model="contractForm.contractType" placeholder="请选择" style="width: 100%">
                  <el-option value="1" label="入职合同"></el-option>
                  <el-option value="2" label="定向签约"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="模板编号" prop="serialNumber" label-width="70px">
                <el-input :disabled="contractTitle == '合同模板信息'" size="mini" maxlength="25" v-model="contractForm.templateCode" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="关键字" prop="keyword" label-width="70px">
                <el-input :disabled="contractTitle == '合同模板信息'" size="mini" maxlength="100" v-model="contractForm.keyword" autocomplete="off"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div class="right" style="width: 476px; height: 673.6px; border: 1px solid #ccc">
            <div class="right-box" v-if="contractForm.templateUrl.length != 0 && contractForm.templateUrl != null">
              <pdf style="width: 100%" :page="pageNum" :src="contractForm.templateUrl" @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf>
              <!-- ============================================= -->
              <el-button icon="el-icon-arrow-left" size="mini" @click="prePage" style="position: absolute; z-index: 10; left: -17px; top: 50%"></el-button>
              <span class="pdf-page" style="position: absolute; z-index: 10; left: 46%; bottom: -18px"> {{ pageNum }}/{{ pageTotalNum }}</span>
              <el-button size="mini" icon="el-icon-arrow-right" @click="nextPage" style="position: absolute; z-index: 10; top: 50%; right: -17px"> </el-button>
              <!-- ============================================= -->
            </div>
            <div class="right-btn" v-if="contractForm.templateUrl.length != 0 && contractForm.templateUrl != null" v-show="contractTitle != '合同模板信息'">
              <el-button size="mini" v-if="contractForm.contractType == 1" icon="el-icon-edit" @click="contractEdit"></el-button>
              <el-button size="mini" type="danger" icon="el-icon-minus" circle @click="contractRemove"></el-button>
            </div>
            <div v-if="contractForm.templateUrl.length == 0 || contractForm.templateUrl == null" class="upload-demo" @click="uploading">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">请上传合同</div>
            </div>
            <input v-show="false" accept=".pdf" type="file" ref="file" id="upload" @change="upLoad" />
          </div>
        </div>
      </div>
      <div style="height: 10px"></div>
      <div class="dialog-form h-600" v-if="orgSealState != 1">
        <unnamed :type="orgSealState === 2 ? 2 : 1" @resh="resh" :appendToBody="true"></unnamed>
      </div>
      <div slot="footer" v-if="contractTitle != '合同模板信息' && orgSealState === 1">
        <el-button size="mini" @click="close2">取 消</el-button>
        <el-button type="primary" class="el-button-primary" size="mini" @click.native="addSubmit('contractForm')">保存</el-button>
      </div>
    </el-dialog>
    <!-- 定向邀签合同模板文件编辑 -->
    <el-dialog top="5vh" title="合同模板" :visible.sync="show3" v-dialogDrag width="1080px" :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="show-tow">
          <div class="left">
            <div class="custom-field">
              <p>自定义组件：</p>
              <el-form :inline="true" :model="form" label-width="50px" class="custom-field-from">
                <el-form-item prop="remark" label-width="0px">
                  <el-row v-for="(item, idx) in customAfield" :key="idx">
                    <el-col :span="3" style="text-align: center">组件名</el-col>
                    <el-col :span="6" style="text-align: center"><el-input size="mini" style="padding: 0" v-model="item.field" autocomplete="off" :disabled="item.disable"></el-input></el-col>
                    <el-col :span="3" style="text-align: center">值</el-col>
                    <el-col :span="6" style="text-align: center"><el-input size="mini" style="padding: 0" v-model="item.explain" autocomplete="off" :disabled="item.disable"></el-input></el-col>
                    <el-col :span="5" style="text-align: center">
                      <el-button style="margin: 0; padding: 0" :disabled="item.disable" @click="quoteAquote(item, idx)" size="mini">引用</el-button>
                      <el-button style="margin: 0; padding: 0" icon="el-icon-plus" v-if="idx == customAfield.length - 1" @click="addCustomAField" circle size="mini"></el-button>
                      <el-button style="margin: 0; padding: 0" icon="el-icon-close" v-if="idx != customAfield.length - 1" @click="removeCustomAField(item)" circle size="mini"></el-button>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-form>
            </div>
            <div>
              <p>甲方签名组件：</p>
            </div>
            <div style="width: 100px; height: 100px; text-align: center; background: #f3f3f3">
              <i class="el-icon-upload" style="font-size: 22px; margin-top: 20px"></i>
              <el-button @click="partySignature" type="text" style="display: block; margin: 0 auto; margin-top: 10px">点击签名</el-button>
            </div>
            <div>
              <div style="display: inline-block" v-for="(item, idx) in inviteData" :key="idx">
                <div>
                  <p>{{ item.userName }}签名组件：</p>
                </div>
                <div style="width: 100px; height: 100px; text-align: center; background: #f3f3f3">
                  <i class="el-icon-upload" style="font-size: 22px; margin-top: 20px"></i>
                  <el-button @click="quoteBquote(item, idx)" type="text" style="display: block; margin: 0 auto; margin-top: 10px">点击签名</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- <div class="right" style="position: relative;width:560px;height:668px;border: 1px solid;"> -->
          <div class="right" style="position: relative; width: 476px; height: 673.6px" v-if="show3">
            <!-- :page="pageNum" -->
            <!-- <pdf width="100%" height="100%" :src="invitedSignForm.templateUrl"></pdf> -->
            <div class="right-box">
              <pdf style="width: 100%" :page="pageNum" :src="invitedSignForm.templateUrl" @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf>
            </div>
            <!-- ============================================= -->
            <el-button icon="el-icon-arrow-left" size="mini" @click="prePage" style="position: absolute; z-index: 10; left: -17px; top: 50%"></el-button>
            <span class="pdf-page" style="position: absolute; z-index: 10; left: 46%; bottom: -18px"> {{ pageNum }}/{{ pageTotalNum }}</span>
            <el-button size="mini" icon="el-icon-arrow-right" @click="nextPage" style="position: absolute; z-index: 10; top: 50%; right: -17px"> </el-button>
            <!-- ============================================= -->
            <!-- <div v-for="(item, idx) in offsideModule" :key="idx" v-show="item.page === pageNum">
            <div v-dragging="isDrags" @mouseup="move(item, $event)" :style="'width:100px;line-height: 20px;position: absolute;z-index: 5; background: #f3f3f3;'">
              {{ item.explain }}
              <div style="position: absolute;top: 0px;right: 0px;z-index: 55;color: red;"><i class="el-icon-close" @click="remove(item, idx)"></i></div>
            </div>
          </div> -->
            <pdfCom v-for="(item, idx) in offsideModule" :key="idx" v-show="item.page === pageNum" @remove="remove(item)" @move="comMove($event, item)" :explain="item.explain" :top="item.y" :left="item.x" />
            <signBox v-for="item in signaturePosition" :key="item.id" v-show="item.page === pageNum" @close="closeSign(item, 2)" @getPosition="getPosition($event, item)" :content="item.userName + '签名'" :top="item.ycoordinate" :left="item.xcoordinate" />
            <!-- <div v-for="(item, idx) in signaturePosition" :key="idx">
            <div @mouseup="move(item, $event)" style="position: absolute; text-align: center;background: #f3f3f3;width:110px;height:90px" v-drag="isDrag">
              <div style="text-align: right;"><i class="el-icon-close" @click="signRemove(item, idx)"></i></div>
              <div style="margin-top:35px">{{ item.userName }}签名</div>
            </div>
          </div> -->
          </div>
        </div>
      </div>

      <div slot="footer">
        <el-button type="primary" class="el-button-primary" size="mini" @click.native="invitedSubmit">确认</el-button>
        <el-button size="mini" @click="show3 = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 定向邀签 -->
    <el-dialog title="定向邀签" width="500px" :visible.sync="show4" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form" v-if="orgSealState == 1">
        <el-form :model="invitedSignForm" label-width="70px" class="invited-sign-form">
          <el-form-item label="合同名称" prop="name" label-width="100px">
            <span>{{ invitedSignForm.templateName }}</span>
          </el-form-item>
          <el-form-item label="甲方签署人" prop="type" label-width="100px">
            <el-select size="mini" v-model="invitedSignForm.party" placeholder="请选择" style="width: 100%">
              <el-option v-for="item in nailUsers" :key="item.value" :value="item.value" :label="item.label + (!!item.empowerTime ? '【授权过期】' : '')" :disabled="!!item.empowerTime" :class="{ red: !!item.empowerTime }"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="签署截止时间" prop="serialNumber" label-width="100px">
            <!-- <el-date-picker value-format="yyyy-MM-dd HH:mm:ss"  style="width: 100%" v-model="invitedSignForm.serialNumber" size="mini" type="datetime" placeholder="选择日期"></el-date-picker> -->
            <div style="display: flex">
              <el-date-picker v-model="time1" size="mini" :picker-options="pickerOption" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" style="width: 50%" @change="timeChange1"> </el-date-picker>
              <el-time-select placeholder="选择时间" size="mini" value-format="HH:mm:ss" v-model="time2" :picker-options="pickerOption2" style="width: 50%"> </el-time-select>
            </div>
          </el-form-item>
          <el-form-item label="邀约对象" prop="keyword" label-width="100px">
            <el-button size="mini" circle icon="el-icon-user-solid" @click="inviteObject"></el-button>
          </el-form-item>
        </el-form>
        <el-table
          :data="inviteData"
          stripe
          height="200px"
          style="width: 100%"
          v-loading="loading"
          :header-cell-style="{
            background: '#f1f6ff',
            'text-align': 'center'
          }"
          :cell-style="{ align: 'center' }"
        >
          <el-table-column type="index" align="center" width="50"> </el-table-column>
          <el-table-column align="center" prop="userName" label="邀签对象" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="telephone" label="手机号码" min-width="90"> </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <div class="dialog-form h-300" v-if="orgSealState != 1">
        <unnamed :type="orgSealState === 2 ? 2 : 1" @resh="resh" :appendToBody="true" :ids="'qred2'"></unnamed>
      </div>
      <div slot="footer" v-if="orgSealState == 1">
        <el-button type="primary" class="el-button-primary" size="mini" @click.native="nextStep">下一步</el-button>
        <el-button size="mini" @click="show4 = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择人员 -->
    <el-dialog class="select-personnel" width="80%" title="选择人员" :visible.sync="show5" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="header-search">
          <span>班组</span>
          <el-select size="mini" v-model="teamPeopleQuery.fkTeamId" placeholder="请选择" style="width: 150px">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in teamData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <span>入职时间</span>
          <el-date-picker value-format="yyyy-MM-dd" style="width: 150px" v-model="teamPeopleQuery.startTime" size="mini" type="date" placeholder="选择日期"></el-date-picker>
          <span>至</span>
          <el-date-picker value-format="yyyy-MM-dd" style="width: 150px" v-model="teamPeopleQuery.behindTime" size="mini" type="date" placeholder="选择日期"></el-date-picker>
          <span>劳务人员</span>
          <el-input style="display: inline-block; width: 150px" v-model="teamPeopleQuery.userName" size="mini" autocomplete="off"></el-input>
          <span>手机号码</span>
          <el-input style="display: inline-block; width: 150px" v-model="teamPeopleQuery.telephone" size="mini" autocomplete="off"></el-input>
          <el-button size="mini" @click="eopleShowSearch">搜索</el-button>
        </div>
        <div style="margin-top: 20px">
          <el-table
            :data="clericalWorkers"
            stripe
            height="460px"
            style="width: 100%"
            v-loading="loading"
            :header-cell-style="{
              background: '#f1f6ff',
              'text-align': 'center'
            }"
            @selection-change="handleSelectionChange"
          >
            <!-- :cell-style="{ align: 'center' }" > -->
            <el-table-column type="selection" align="center" width="55"></el-table-column>
            <el-table-column align="center" label="序号" min-width="60">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ (teamPeopleQuery.pageNum - 1) * teamPeopleQuery.pageSize + (scope.$index + 1) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="teamName" label="所属班组" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="userName" label="劳务人员" min-width="90">
              <template slot-scope="{ row }">
                {{ row.userName + row.expireStatus == 1 ? "授权已过期" : row.userName }}
              </template>
            </el-table-column>
            <el-table-column align="center" prop="cardNum" label="身份证号码" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="telephone" label="手机号码" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="inductionTime" label="入职日期" min-width="90"> </el-table-column>
            <!-- <el-table-column align="center" prop="resignationTime" label="离职日期" min-width="90"> </el-table-column> -->

            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
          <table-paging :current-page="teamPeopleQuery.pageNum" :page-size="teamPeopleQuery.pageSize" :total="teamPeopleQuery.totalCount" @handleSizeChange="teamShowSize" @handleCurrentChange="teamShowpageCurrent"></table-paging>
          <div style="padding: 8px; text-align: center">
            <el-button type="primary" class="el-button-primary" size="mini" @click.native="multiUserConfirm">确定</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <!-- 签署进度 -->
    <el-dialog class="select-personnel" title="签署进度" :visible.sync="show6" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div style="margin-top: 20px">
          <el-table
            :data="scheduleData"
            stripe
            height="460px"
            style="width: 100%"
            v-loading="loading"
            :header-cell-style="{
              background: '#f1f6ff',
              'text-align': 'center'
            }"
            :cell-style="{ align: 'center' }"
          >
            <el-table-column type="index" width="50"> </el-table-column>
            <el-table-column align="center" prop="userName" label="签署方" min-width="90"> </el-table-column>
            <el-table-column align="center" prop="updateTime" label="签署时间" min-width="90"> </el-table-column>
            <el-table-column align="center" label="签署状态" min-width="90">
              <template slot-scope="scope">
                <div v-if="scope.row.contractStatus == 0" style="color: red">待签署</div>
                <div v-if="scope.row.contractStatus == 1">已签署</div>
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
    <!-- 印章管理 -->
    <el-dialog class="select-personnel" :title="iframeTitle" width="80%" :visible.sync="show7" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div style="position: relative">
        <iframe :src="signatureUrl" height="680px" width="100%" name="demo" scrolling="auto" sandbox="allow-same-origin allow-scripts"></iframe>
        <div style="height: 680px; width: 100%" class="mask" v-if="maskShow">签署时间过长，请重新打开该页面进行签署</div>
      </div>
    </el-dialog>
    <!-- 合同模板文件编辑 -->
    <el-dialog top="5vh" title="合同模板" :visible="show8" @close="show8Close" v-dialogDrag width="1000px" :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="show-tow">
          <div class="left">
            <div class="custom-field">
              <el-form :inline="true" :model="form" label-width="150px">
                <el-form-item label="甲方签署人" label-width="110px" prop="remark">
                  <el-select size="mini" @change="signUserChange" v-model="contractEditorList.fkUserId" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in nailUsers" :key="item.value" :value="item.value" :label="item.label + (!!item.empowerTime ? '【授权过期】' : '')" :disabled="!!item.empowerTime" :class="{ red: !!item.empowerTime }"></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            <div style="margin-left: 40px; margin-top: 20px">
              <div>
                <p>甲方签名组件：</p>
              </div>
              <div style="width: 100px; height: 100px; text-align: center; background: #f3f3f3">
                <i class="el-icon-upload" style="font-size: 22px; margin-top: 20px"></i>
                <el-button @click="firstParty" type="text" style="display: block; margin: 0 auto; margin-top: 10px">点击签名</el-button>
              </div>
              <div>
                <p>乙方签名组件：</p>
              </div>
              <div style="width: 100px; height: 100px; text-align: center; background: #f3f3f3">
                <i class="el-icon-upload" style="font-size: 22px; margin-top: 20px"></i>
                <el-button @click="secondParty" type="text" style="display: block; margin: 0 auto; margin-top: 10px">点击签名</el-button>
              </div>
            </div>
          </div>

          <!-- <div class="right" style="position: relative;width:560px;height:668px;border: 1px solid;"> -->
          <div class="right" style="position: relative; width: 476px; height: 673.6px; border: 1px solid" v-if="show8">
            <!-- <pdf width="100%" height="100%" :src="contractForm.templateUrl" @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf> -->
            <div class="right-box">
              <pdf style="width: 100%" v-if="contractForm.templateUrl.length != 0 && contractForm.templateUrl != null" :page="pageNum" :src="contractForm.templateUrl" @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf>
            </div>
            <!-- ============================================= -->
            <el-button icon="el-icon-arrow-left" size="mini" @click="prePage" style="position: absolute; z-index: 10; left: -17px; top: 50%"></el-button>
            <span class="pdf-page" style="position: absolute; z-index: 10; left: 46%; bottom: -18px"> {{ pageNum }}/{{ pageTotalNum }}</span>
            <el-button size="mini" icon="el-icon-arrow-right" @click="nextPage" style="position: absolute; z-index: 10; top: 50%; right: -17px"> </el-button>
            <!-- ============================================= -->
            <!-- 签名组件 -->
            <signBox v-for="item in testList" :key="item.id" v-show="item.page === pageNum" @close="closeSign(item, 1)" @getPosition="getPosition($event, item)" :content="item.content" :top="item.ycoordinate" :left="item.xcoordinate" />
            <!-- <div v-if="firstPartyStatus"> -->
            <!-- <div @mouseup="firstMove(1, $event)" style="position: absolute; text-align: center;background: #f3f3f3;width:110px;height:90px" v-drag="isDrag">
              <div style="text-align: right;"><i class="el-icon-close" @click="firstRemo"></i></div>
              <div style="margin-top:35px">甲方签名</div>
            </div> -->
            <!-- </div> -->
            <!-- <div v-if="secondPartyStatus">
            <div @mouseup="firstMove(2, $event)" style="position: absolute; text-align: center;background: #f3f3f3;width:110px;height:90px" v-drag="isDrag">
              <div style="text-align: right;"><i class="el-icon-close" @click="partyRemo"></i></div>
              <div style="margin-top:35px">乙方签名</div>
            </div>
          </div> -->
          </div>
        </div>
      </div>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" size="mini" @click.native="editContract">确认</el-button>
        <el-button size="mini" @click="show8Close">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 未完成合同和失效合同点击查看时的弹框 -->
    <el-dialog :visible.sync="show9" width="70%" :show-close="false">
      <iframe class="pdfIframe" :src="url" frameborder="0"></iframe>
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import pictureUpload from "./components/uploadContract.vue";
import { VueCropper } from "vue-cropper";
import COS from "cos-js-sdk-v5";
import pdf from "vue-pdf-signature";
import signBox from "./components/signBox.vue";
import pdfCom from "./components/pdfComponents.vue";
import unnamed from "../org/compoments/unnamed.vue";
import treeSelect from "../../components/proTreeSelect/treeSelect.vue";
// 中文PDF加载空白引入依赖
import CMapReaderFactory from "vue-pdf-signature/src/CMapReaderFactory.js";
export default {
  components: {
    pdfPiev,
    pictureUpload,
    VueCropper,
    pdf,
    signBox,
    pdfCom,
    unnamed,
    treeSelect
  },
  watch: {
    show7(val) {
      if (!val) {
        clearInterval(this.timer);
        this.inTime = 0;
        this.maskShow = false;
      }
    },
    show2(val) {
      if (!val) {
        this.delFiles();
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  data() {
    return {
      time1: "",
      time2: "",
      totalCount: 0,
      tableData: [],
      loading: false,
      formLabelWidth: "110px",
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      ruleForm: {},
      show: false,
      parentMenu: [{ a1: "1" }],
      orgType: "1",
      user: {},
      form: {
        fkProjectId: "",
        projectId: "",
        fkOrgId: "", // 分包单位id
        fkTeamId: "" // 班组id
      },
      url: "",
      show1: false,
      show2: false,
      show3: false,
      forbidden: false,
      isDrag: true,
      isDrags: true,
      editInfo: {
        coordinatesX: "",
        coordinatesY: ""
      },
      noProjectData: [], // 标段项目
      options: [],
      contractForm: {
        templateName: "", // 模板名称
        templateCode: "", // 模板编号
        contractType: "", // 模板类型
        keyword: "", // 关键词
        templateUrl: "", // 附件路
        fileUrl: "" // 附件名称
      },
      templateNumber: [], // 模板人数下拉
      customAfield: [{ field: "", explain: "", disable: false, id: 1 }], // 自定义字段
      // customBfield: [{ field: "", explain: "", disable: false }], //乙方自定义字段
      show4: false,
      show5: false,
      teamPeopleQuery: {
        // 选择劳务人员搜索条件
        pageNum: 1,
        pageSize: 10,
        startTime: "", // 入职开始时间
        behindTime: "", // 入职结束时间
        userName: "", // 劳务人员
        telephone: "", // 手机号码
        fkTeamId: "", // 班组id
        totalCount: 0
      },
      invitedSignForm: {
        // 定向邀签表单
        templateName: "",
        party: "",
        type: "",
        serialNumber: "",
        number: ""
      },
      inviteData: [], // 已选邀约对象
      clericalWorkers: [], // 劳务人员
      url: "",
      templateList: [], // 合同模板列表
      subcontractorData: [{ label: "全部", value: "" }], // 分部商下拉
      multipleSelection: [],
      teamData: [], // 全部班组下拉
      show6: false,
      formData: {},
      scheduleData: [], // 签署进度
      show7: false,
      signatureUrl: "", // 签章管理地址
      offsideModule: [], // 组件位置
      signaturePosition: [], // 签名位置
      partyStatus: false,
      nailUsers: [],
      show8: false, // 合同模板开关
      contractEditorList: {
        fkUserId: "",
        jx: "",
        jy: "",
        yx: "",
        yy: ""
      },
      firstPartyStatus: false,
      secondPartyStatus: false,
      iframeTitle: "",
      contractTitle: "",
      searchTeamData: [{ label: "全部", value: "" }],
      pageNum: 1,
      pageTotalNum: "",
      testList: [], // 签名区列表
      show9: false, // 控制查看e签宝pdf弹框
      clean: true,
      temporaryList: {}, // 用于临时存储合同模板数据的列表
      projectStatus: false, // 控制标段项目不能选择
      subcontractorStatus: true, // 控制分包单位不能选择
      groupStatus: true, // 控制班组不能选择
      inTime: 0,
      maskShow: false,
      randomKey: Math.random(),
      pickerOption: {
        disabledDate: date => {
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        }
      },
      pickerOption2: {
        start: "00:00",
        step: "00:30",
        end: "23:30",
        minTime: ""
      },
      newAddList: [],
      delList: [],
      startTimeRange: "",
      orgSealState: "",
      reshType: "",
      typeShow: true
    };
  },
  // 拖拽指令
  // directives: {
  //   // 注册指令
  //   drag(el, binding, vnode) {
  //     const dragBox = el; // 获取当前元素
  //     // console.log("获取当前元素");
  //     // console.log("获取当前元素");
  //     // // if(this.signaturePosition.length){

  //     // }
  //     // dragBox.style.top = i * 90 + "px";
  //     // this获取不到，所以要通过传参的方式做出来，是这个指令自带的参数
  //     const _self = vnode.context;
  //     // 当前元素位置
  //     if (_self.editInfo.coordinatesX != "") {
  //       dragBox.style.left = parseInt(_self.editInfo.coordinatesX * (480 - 110)) + "px";
  //     }
  //     if (_self.editInfo.coordinatesY != "") {
  //       dragBox.style.top = parseInt(_self.editInfo.coordinatesY * (704 - 90)) + "px";
  //     }
  //     // 如果当前元素位置为空
  //     if (_self.editInfo.coordinatesX == "") {
  //       dragBox.style.left = "0px";
  //     }
  //     if (_self.editInfo.coordinatesY == "") {
  //       let i = 1;
  //       i++;
  //       dragBox.style.top = i * 90 + "px";
  //     }
  //     // 移动盒子
  //     dragBox.onmousedown = e => {
  //       e.preventDefault();
  //       // 算出鼠标相对元素的位置
  //       const disX = e.clientX - dragBox.offsetLeft;
  //       const disY = e.clientY - dragBox.offsetTop;
  //       document.onmousemove = e => {
  //         // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
  //         e.preventDefault();
  //         let left = e.clientX - disX;
  //         let top = e.clientY - disY;
  //         // 移动当前元素
  //         dragBox.style.left = left + "px";
  //         dragBox.style.top = top + "px";

  //         let x = (left / (480 - 110)).toFixed(2);
  //         let y = (top / (704 - 90)).toFixed(2);
  //         // 当x为0或者1都使它不能拖动
  //         if (left <= 0) {
  //           x = "0.00";
  //           // 使左边距离的边距为固定的，就不会拖动出去了
  //           dragBox.style.left = "0px";
  //         } else if (left >= 480 - 90) {
  //           x = "1.00";
  //           left = 480 - 90;
  //           dragBox.style.left = left + "px";
  //         }
  //         if (top <= 0) {
  //           y = "0.00";
  //           dragBox.style.top = "0px";
  //         } else if (top >= 704 - 90) {
  //           y = "1.00";
  //           top = 704 - 90;
  //           dragBox.style.top = top + "px";
  //         }

  //         _self.editInfo.coordinatesX = x;
  //         _self.editInfo.coordinatesY = y;
  //         // console.log(_self.editInfo.coordinatesX + "========x========");
  //         // console.log(_self.editInfo.coordinatesY + "========y========");
  //       };
  //       document.onmouseup = e => {
  //         e.preventDefault();
  //         // 鼠标弹起来的时候不再移动
  //         document.onmousemove = null;
  //         // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
  //         document.onmouseup = null;
  //       };
  //       return false;
  //     };
  //   },
  //   dragging(el, binding, vnode) {
  //     const dragBox = el; // 获取当前元素
  //     // this获取不到，所以要通过传参的方式做出来，是这个指令自带的参数
  //     const _self = vnode.context;
  //     // 当前元素位置
  //     if (_self.editInfo.coordinatesX != "") {
  //       dragBox.style.left = parseInt(_self.editInfo.coordinatesX * (476 - 100)) + "px";
  //     }
  //     if (_self.editInfo.coordinatesY != "") {
  //       dragBox.style.top = parseInt(_self.editInfo.coordinatesY * (673.6 - 20)) + "px";
  //     }
  //     // 如果当前元素位置为空
  //     if (_self.editInfo.coordinatesX == "") {
  //       dragBox.style.left = "0px";
  //     }
  //     if (_self.editInfo.coordinatesY == "") {
  //       dragBox.style.top = "0px";
  //     }
  //     // 移动盒子
  //     dragBox.onmousedown = e => {
  //       e.preventDefault();
  //       // 算出鼠标相对元素的位置
  //       const disX = e.clientX - dragBox.offsetLeft;
  //       const disY = e.clientY - dragBox.offsetTop;
  //       document.onmousemove = e => {
  //         // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
  //         e.preventDefault();
  //         let left = e.clientX - disX;
  //         let top = e.clientY - disY;
  //         // 移动当前元素
  //         dragBox.style.left = left + "px";
  //         dragBox.style.top = top + "px";

  //         let x = (left / (476 - 100)).toFixed(2);
  //         let y = (top / (673.6 - 20)).toFixed(2);
  //         // 当x为0或者1都使它不能拖动
  //         if (left <= 0) {
  //           x = "0.00";
  //           // 使左边距离的边距为固定的，就不会拖动出去了
  //           dragBox.style.left = "0px";
  //         } else if (left >= 476 - 100) {
  //           x = "1.00";
  //           left = 476 - 100;
  //           dragBox.style.left = left + "px";
  //         }
  //         if (top <= 0) {
  //           y = "0.00";
  //           dragBox.style.top = "0px";
  //         } else if (top >= 673.6 - 20) {
  //           y = "1.00";
  //           top = 673.6 - 20;
  //           dragBox.style.top = top + "px";
  //         }

  //         _self.editInfo.coordinatesX = x;
  //         _self.editInfo.coordinatesY = y;
  //         console.log(_self.editInfo.coordinatesX + "========x========");
  //         console.log(_self.editInfo.coordinatesY + "========y========");
  //       };
  //       document.onmouseup = e => {
  //         e.preventDefault();
  //         // 鼠标弹起来的时候不再移动
  //         document.onmousemove = null;
  //         // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
  //         document.onmouseup = null;
  //       };
  //     };
  //   }
  // },
  mounted() {
    this.user = JSON.parse(sessionStorage.getItem("user"));

    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        // 分包单位、施工、供应商展示标段项目
        if (this.user.orgType == 6 || this.user.orgType == 7) {
          // 获取标段项目，标段项目下拉选择获取班组
          this.listByProjectId();
          this.getOrgPageList();
        }

        if (this.user.orgType == 5) {
          this.subcontractorStatus = false;
          this.subcontractor();
          this.getOrgPageList();
        }
        // this.listAll();
        this.noProject();
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        this.form.fkOrgId = ""; // 分包单位为空
        this.form.fkTeamId = ""; // 班组清空
        this.groupStatus = true;
        this.searchTeamData.unshift({ label: "全部", value: "" });
        if (arr.length > 1) {
          this.form.projectId = arr[0];
          this.form.fkProjectId = arr[1];
        } else {
          this.form.fkProjectId = arr[0];
        }
        if (isTrue) {
          this.getOrgPageList();
        }
        this.listByProjectId(this.form.fkProjectId);
      }
    },
    resh() {
      this.getOrgSealState(this.reshType);
    },
    getOrgSealState(type, row) {
      let api = this.user.orgType === 0 ? this.$api.getOrgSealState : this.$api.getOrgSealState2;
      this.reshType = type;
      api().then(res => {
        if (res.code === 200) {
          this.orgSealState = res.data;
          if (res.data == 1) {
            if (type == 1) {
              this.addContract();
            } else if (type == 2) {
              this.editTemplate(row);
            } else if (type == 3) {
              this.invitedSign(row);
            }
          } else {
            if (type == 1) {
              this.contractTitle = "新增合同模板";
              this.show2 = true;
            } else if (type == 2) {
              this.contractTitle = "编辑合同模板";
              this.show2 = true;
            } else if (type == 3) {
              this.show4 = true;
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    timeChange1() {
      this.time2 = "";
      this.pickerOption2.minTime = new Date(this.time1).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) ? moment(Date.now() + 30 * 60 * 1000).format("HH:mm") : "";
    },
    close2() {
      this.delList = [];
      this.show2 = false;
    },
    // 删除附件
    delFiles() {
      let urls = [];
      if (this.contractTitle.indexOf("新增") !== -1) {
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
    // 上一页
    prePage() {
      let page = this.pageNum;
      page = page > 1 ? page - 1 : this.pageTotalNum;
      if (page == this.pageTotalNum) {
        return;
      }
      this.pageNum = page;
      // this.$refs.pdfWrap.scrollTo(0, 0);
    },
    // 下一页
    nextPage() {
      let page = this.pageNum;
      page = page < this.pageTotalNum ? page + 1 : 1;
      console;
      if (page == 1) {
        return;
      }
      this.pageNum = page;
      // this.$refs.pdfWrap.scrollTo(0, 0);
    },
    // 获取PDF总页数
    getNumPages(url) {
      const loadingTask = pdf.createLoadingTask(url);
      console.log("测试", url);
      loadingTask.promise
        .then(pdf => {
          this.pageTotalNum = pdf.numPages;
        })
        .catch(err => {
          this.$message.warning("pdf 加载失败", err);
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
          if (this.user.orgType == 6 || this.user.orgType == 7) {
            this.projectStatus = false;
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
    // 根据项目id获取标段项目下拉列表
    projectIdChange(val) {
      this.form.fkProjectId = "";
      const data = {};
      if (val.length == 0) {
        data.isWhole = 1;
        data.projectId = val;
        this.projectStatus = true;
        this.subcontractorStatus = true;
        this.groupStatus = true;
        this.form.fkProjectId = ""; // 清空标段项目
        this.form.fkOrgId = ""; // 分包单位为空
        this.form.fkTeamId = ""; // 班组清空
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
            // item.value = item.pkId;
          });
          this.noProjectData = res.data;
          this.noProjectData.unshift({ value: "", label: "全部" });
        }
      });
    },
    // 编辑合同甲方签名
    firstParty() {
      this.testList.push({ fkUserId: this.contractEditorList.fkUserId, id: Date.now(), page: this.pageNum, ycoordinate: 0, xcoordinate: 0, content: "甲方签名" });
      this.firstPartyStatus = true;
    },
    firstRemo() {
      this.firstPartyStatus = false;
    },
    partyRemo() {
      this.secondPartyStatus = false;
    },
    // 编辑合同乙方签名
    secondParty() {
      this.testList.push({ fkUserId: 0, id: Date.now(), page: this.pageNum, ycoordinate: 0, xcoordinate: 0, content: "乙方签名" });
      this.secondPartyStatus = true;
    },
    editContract() {
      if (this.contractEditorList.fkUserId == null || this.contractEditorList.fkUserId.length == 0) {
        return this.$message.warning("请选择甲方签署人");
      }
      for (let i = 0; i < this.nailUsers.length; i++) {
        if (this.nailUsers[i].pkId === this.contractEditorList.fkUserId && this.nailUsers[i].enableStatus === 0) {
          return this.$message.warning("该账号已禁用，请更换签署人");
        }
      }
      const arr = document.querySelectorAll(".signBox");
      this.temporaryList = {
        fkUserId: this.contractEditorList.fkUserId,
        contractTemplateCustoms: this.testList.map((item, i) => ({ ...item, ycoordinate: arr[i].style.top.replace("px", ""), xcoordinate: arr[i].style.left.replace("px", "") }))
      };
      this.show8 = false;
    },
    move(item, e) {
      item.x = e.x;
      item.y = e.y;
      item.page = this.pageNum;
    },
    // firstMove(i, e) {
    getPosition(position, row) {
      row.xcoordinate = position.x;
      row.ycoordinate = position.y;
    },
    remove(row) {
      this.offsideModule = this.offsideModule.filter(item => item.id !== row.id);
      this.customAfield.forEach(i => {
        if (i.id == row.id) {
          i.disable = false;
        }
      });
    },
    signRemove(item, idx) {
      this.signaturePosition.splice(idx, 1);
      if (item.userName == "甲方") {
        this.partyStatus = false;
      } else {
        this.inviteData.forEach(i => {
          if (i.userName == item.userName) {
            i.disable = false;
          }
        });
      }
      console.log(this.signaturePosition);
    },
    // 分部商下拉
    subcontractor() {
      this.$api.searchLinkOrgId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.fkLinkOrgId;
          });
          this.subcontractorData = res.data;
          this.subcontractorData.unshift({ value: "", label: "全部" });
        }
      });
    },
    // 班组下拉
    listAll() {
      this.$api.listAll().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.teamName;
            item.value = item.pkId;
          });
          this.teamData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    listByProjectId() {
      let id = "";
      // 标段项目如果不是全部
      if (this.form.fkProjectId != "") {
        id = this.form.fkProjectId;
        if (this.user.orgType == 4 || this.user.orgType == 6 || this.user.orgType == 7) {
          this.groupStatus = false; // 班组展示
        } else {
          this.subcontractorStatus = false; // 分包单位展示
        }
      }
      if (this.form.fkProjectId == "") {
        id = "";
        this.groupStatus = true;
        this.subcontractorStatus = true;
        this.form.fkOrgId = ""; // 分包单位为空
        this.form.fkTeamId = ""; // 班组清空
        return;
      }
      if (this.user.orgType == 2 || this.user.orgType == 3 || this.user.orgType == 9 || this.user.orgType == 10 || this.user.orgType == 11 || this.user.orgType == 12) {
        // 根据标段项目获取分包单位下拉列表
        this.subcontractorList(id);
      } else {
        // 4 6 7情况
        this.$api.listByProjectId({ projectId: this.form.fkProjectId, fkOrgId: this.form.fkOrgId }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.teamName;
              item.value = item.pkId;
            });
            if (this.form.fkTeamId != undefined && this.form.fkTeamId != null) {
              this.form.fkTeamId = "";
            }
            this.searchTeamData = res.data; // 班主下拉列表
            this.searchTeamData.unshift({ label: "全部", value: "" });
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    // 根据标段项目获取分包单位下拉列表
    subcontractorList(id) {
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
    },
    // 分包单位下拉列表选择
    subcontractorSelect(id) {
      console.log(this.form.fkProjectId);
      console.log(this.form.fkOrgId);
      if (id) {
        this.groupStatus = false;
        this.$api.listByProjectId({ projectId: this.form.fkProjectId, fkOrgId: this.form.fkOrgId }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.teamName;
              item.value = item.pkId;
            });
            if (this.form.fkTeamId != undefined && this.form.fkTeamId != null) {
              this.form.fkTeamId = "";
            }
            this.searchTeamData = res.data; // 班主下拉列表
            this.searchTeamData.unshift({ label: "全部", value: "" });
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        // id等于空的时候
        this.groupStatus = true;
        this.form.fkTeamId = "";
      }
    },
    // 新增保存
    addSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = this.contractForm;
          if (data.contractType == 1) {
            if (!this.temporaryList.fkUserId) {
              return this.$message.warning("请先设定签署人");
            }
            if (!this.temporaryList.contractTemplateCustoms || !this.temporaryList.contractTemplateCustoms.length) {
              return this.$message.warning("请先设定签名区");
            }
            let a = false;
            let b = false;
            this.temporaryList.contractTemplateCustoms.forEach(item => {
              if (!(item.fkUserId - 0)) {
                a = true;
              } else {
                b = true;
              }
            });
            if (!b) {
              return this.$message.warning("请设定甲方签署区");
            }
            if (!a) {
              return this.$message.warning("请设定乙方签署区");
            }
            data.contractTemplateCustoms = this.temporaryList.contractTemplateCustoms ? this.temporaryList.contractTemplateCustoms.map(item => ({ ...item })) : [];
            data.contractTemplateCustoms.forEach(item => {
              item.xcoordinate = item.xcoordinate / 0.8 + 50;
              item.ycoordinate = (673.6 - item.ycoordinate) / 0.8 - 45;
            });
            // if (this.firstPartyStatus) {
            //   data.contractTemplateCustoms.push({ fkUserId: this.contractEditorList.fkUserId, xcoordinate: this.contractEditorList.jx, ycoordinate: this.contractEditorList.jy });
            // }
            // if (this.secondPartyStatus) {
            //   data.contractTemplateCustoms.push({ xcoordinate: this.contractEditorList.yx, ycoordinate: this.contractEditorList.yy });
            // }
          }

          this.loading = true;
          if (this.contractTitle == "新增合同模板") {
            console.log("新增", data);
            this.$api
              .contractAdd(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message.success("新增成功");
                  this.newAddList = [];
                  this.contractTemplateList();
                  this.show2 = false;
                  this.temporaryList = {};
                } else {
                  this.loading = false;
                  this.$message.warning(res.msg);
                }
              })
              .catch(err => {
                this.loading = false;
              });
          } else {
            // contractupdate
            const datas = {
              pkId: this.contractForm.pkId,
              contractType: this.contractForm.contractType,
              templateCode: this.contractForm.templateCode,
              templateName: this.contractForm.templateName,
              templateUrl: this.contractForm.templateUrl,
              keyword: this.contractForm.keyword,
              fileUrl: this.contractForm.fileUrl
            };
            if (datas.contractType == 1) {
              datas.contractTemplateCustoms = data.contractTemplateCustoms;
              // if (this.firstPartyStatus) {
              //   datas.contractTemplateCustoms.push({ fkUserId: this.contractEditorList.fkUserId, xcoordinate: this.contractEditorList.jx, ycoordinate: this.contractEditorList.jy });
              // }
              // if (this.secondPartyStatus) {
              //   datas.contractTemplateCustoms.push({ xcoordinate: this.contractEditorList.yx, ycoordinate: this.contractEditorList.yy });
              // }
            }
            for (let i = 0; i < this.nailUsers.length; i++) {
              if (this.nailUsers[i].pkId === this.temporaryList.fkUserId && this.nailUsers[i].enableStatus === 0) {
                return this.$message.warning("该账号已禁用，请更换签署人");
              }
            }
            console.log("编辑", datas);
            this.$api
              .contractupdate(datas)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message.success("编辑成功");
                  this.newAddList = [];
                  this.contractTemplateList();
                  this.show2 = false;
                  this.temporaryList = {};
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
    // 禁用
    forbiddenBtn(row) {
      this.$confirm("确定禁用该合同模板信息？", "禁用确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.updateStatusById({ id: row.pkId, status: 1 }).then(res => {
            if (res.code == 200) {
              this.$message.success("禁用成功！");
              this.contractTemplateList();
            } else {
              this.$message.warning(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    // 启用
    startUsing(row) {
      this.$confirm("确定启用该合同模板信息？", "启用确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.updateStatusById({ id: row.pkId, status: 2 }).then(res => {
            if (res.code == 200) {
              this.$message.success("启用成功");
              this.contractTemplateList();
            } else {
              this.$message.warning(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    // 删除
    batchDelete(row) {
      this.$confirm("确定删除该合同模板信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.contractDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message.success("删除成功！");
              this.contractTemplateList();
            } else {
              this.$message.warning(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    uploading() {
      this.contractForm.templateUrl = "";
      this.$refs.file.value = "";
      this.$refs.file.click();
    },
    // 定向邀签
    invitedSign(row) {
      console.log(row);
      // this.invitedSignForm = {
      //   // 定向邀签表单
      //   templateName: "",
      //   party: "",
      //   type: "",
      //   serialNumber: "",
      //   number: ""
      // };
      this.invitedSignForm.party = null;
      this.pageNum = 1;
      this.formData = row;
      this.time1 = "";
      this.time2 = "";
      this.offsideModule = [];
      this.invitedSignForm.templateName = row.templateName;
      this.invitedSignForm.serialNumber = "";
      this.invitedSignForm.templateUrl = row.templateUrl;
      this.inviteData = [];
      this.nailUsersByOrgId(0);
      this.show4 = true;
      console.log(this.invitedSignForm);
      // this.dialogStatusVisible = true;
    },
    // 获取甲方签署人
    nailUsersByOrgId(enableStatus) {
      this.$api.nailUsersByOrgId({ enableStatus }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.realName;
            item.value = item.pkId;
          });
          this.nailUsers = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 选择邀约人员
    inviteObject() {
      this.show5 = true;
      this.teamPeopleQuery = {
        // 选择劳务人员搜索条件
        pageNum: 1,
        pageSize: 10,
        startTime: "", // 入职开始时间
        behindTime: "", // 入职结束时间
        userName: "", // 劳务人员
        telephone: "", // 手机号码
        fkTeamId: "", // 班组id
        totalCount: 0
      };
      this.listAll();
      this.crewSearchPage();
    },
    // 选择劳务人员搜索
    eopleShowSearch() {
      this.teamPeopleQuery.pageNum = 1;
      this.teamPeopleQuery.pageSize = 10;
      this.crewSearchPage();
    },
    // 选择人员确认
    multiUserConfirm() {
      if (this.multipleSelection.length == 0) {
        return this.$message.warning("请选择至少一条数据");
      }
      this.inviteData = this.multipleSelection;
      this.show5 = false;
    },
    // 选择劳务人员页数改变事件
    teamShowSize(pageSize) {
      this.teamPeopleQuery.pageSize = pageSize;
      this.crewSearchPage();
    },
    // 选择劳务人员页码改变事件
    teamShowpageCurrent(currentPage) {
      this.teamPeopleQuery.pageNum = currentPage;
      this.crewSearchPage();
    },
    crewSearchPage() {
      const data = {
        pageNum: this.teamPeopleQuery.pageNum,
        pageSize: this.teamPeopleQuery.pageSize,
        startTime: this.teamPeopleQuery.startTime,
        behindTime: this.teamPeopleQuery.behindTime,
        userName: this.teamPeopleQuery.userName,
        telephone: this.teamPeopleQuery.telephone,
        fkTeamId: this.teamPeopleQuery.fkTeamId
      };
      if (data.startTime.length != 0) {
        data.startTime = moment(data.startTime).format("YYYY-MM-DD HH:mm:ss");
      }
      if (data.behindTime.length != 0) {
        data.behindTime = moment(data.behindTime).format("YYYY-MM-DD HH:mm:ss");
      }
      this.$api.directionalSearchPage(data).then(res => {
        if (res.code == 200) {
          this.clericalWorkers = res.data.records;
          this.teamPeopleQuery.totalCount = parseInt(res.data.total);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 定向邀签下一步
    nextStep() {
      if (this.inviteData.length == 0) {
        return this.$message.warning("请选择邀约对象");
      }
      if (!this.time1 || !this.time2) {
        return this.$message.warning("请选择截止时间");
      }
      this.getNumPages(this.invitedSignForm.templateUrl);
      this.show4 = false;
      this.pageNum = 1;
      this.show3 = true;
      this.partyStatus = false;
      this.offsideModule = [];
      this.signaturePosition = [];
      this.customAfield = [{ field: "", explain: "", disable: false, x: 0, y: 0, id: 1 }];
    },
    // 邀签确认
    invitedSubmit() {
      const data = {
        componentAdds: [],
        contractTemplateCustoms: [],
        labourNotSignedContractAdds: []
      };
      // ycoordinate: arr[i].style.top.replace("px", "")
      const pdfComs = document.querySelectorAll(".pdfcop");
      const signBoxs = document.querySelectorAll(".signBox");
      this.offsideModule.forEach((item, i) => {
        data.componentAdds.push({ componentName: item.field, componentValue: item.explain, height: 20, page: item.page, width: 100, x: pdfComs[i].style.left.replace("px", "") / 0.8 + 50, y: (673.6 - pdfComs[i].style.top.replace("px", "")) / 0.8 - 45 });
      });
      this.signaturePosition.forEach((item, i) => {
        data.contractTemplateCustoms.push({ fkUserId: item.fkUserId, x: signBoxs[i].style.left.replace("px", "") / 0.8 + 50, y: (673.6 - signBoxs[i].style.top.replace("px", "")) / 0.8 - 45, page: item.page, isNail: item.isNail });
      });
      data.deadline = moment(this.time1 + " " + this.time2).format("YYYY-MM-DD HH:mm:ss");
      data.fkTemplateId = this.formData.pkId;
      this.inviteData.forEach(item => {
        data.labourNotSignedContractAdds.push({ memberIds: item.pkId });
      });
      data.templateUrl = this.formData.templateUrl;
      data.redirectUrl = "https://erp.jianwangkeji.cn/back.html";
      // return console.log(data);
      this.loading = true;
      this.$api
        .labourContractAdd(data)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("邀签成功");
            this.show3 = false;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 移除合同文件
    contractRemove() {
      this.delList.push(this.contractForm.templateUrl);
      this.contractForm.templateUrl = "";
      this.$refs.file.value = "";
      this.temporaryList = {};
      this.testList = [];
      this.pageNum = 1;
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
      const _this = this;
      _this.contractForm.fileUrl = filename;
      const index = filename.lastIndexOf(".");
      const name = filename.substring(index + 1, filename.length);
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
            _this.contractForm.templateUrl = path;
            // _this.pdfhuix = filename;
            // _this.getNumPages();
            _this.getNumPages(path);
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
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
      this.pdfhuix = "";
      const fileObj = document.getElementById("upload").files[0];
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      if (fileObj.size > 5242880) {
        this.$refs.file.value = "";
        return this.$message.warning("文件大小不能超过5M");
      }
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      const index = filename.lastIndexOf(".");
      const name = filename.substring(index + 1, filename.length);
      if (name != "pdf") {
        return this.$message.warning("请上传pdf文件");
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
    // 甲方追加自定义字段
    addCustomAField() {
      this.customAfield.push({ field: "", explain: "", disable: false, x: 0, y: 0, id: Date.now() });
    },
    // 甲方移除自定义字段
    removeCustomAField(row) {
      this.customAfield = this.customAfield.filter(item => item.id !== row.id);
      this.offsideModule = this.offsideModule.filter(item => item.id !== row.id);
    },
    // 甲方引用
    quoteAquote(item, idx) {
      //       explain: ""
      // field: ""
      if (item.explain == "" || item.field == "") {
        return this.$message.warning("组件名称或类型不能为空");
      }
      item.disable = true;
      // console.log(item);
      this.offsideModule.push({ ...item, page: this.pageNum });
    },
    partySignature() {
      this.partyStatus = true;
      this.signaturePosition.push({ userName: "甲方", isNail: 1, fkUserId: this.invitedSignForm.party, id: Date.now(), page: this.pageNum, ycoordinate: 0, xcoordinate: 0 });
    },
    // 乙方引用
    quoteBquote(item, idx) {
      item.disable = true;
      this.signaturePosition.push({ ...item, id: Date.now(), isNail: 0, page: this.pageNum, ycoordinate: 0, xcoordinate: 0 });
    },
    cancel() {
      this.show3 = false;
    },

    // 编辑合同文件
    contractEdit() {
      // this.huah()
      // this.firstPartyStatus = false;
      // this.secondPartyStatus = false;
      this.pageNum = 1;
      this.contractEditorList.fkUserId = this.temporaryList.fkUserId ? this.temporaryList.fkUserId : null;
      this.testList = this.temporaryList.contractTemplateCustoms ? this.temporaryList.contractTemplateCustoms.map(item => ({ ...item })) : [];
      this.show8 = true;
    },

    onSuccess(item) {
      this.ruleForm.authPhotoUrl = item;
    },
    orgTypeChange(val) {
      if (!this.typeShow) {
        return;
      }
      Object.keys(this.form).forEach(key => {
        if (key == "fkProjectId" || key == "fkProjectBidId") {
        } else {
          this.form[key] = "";
        }
      });
      this.tableData = [];
      this.templateList = [];
      this.form.fkProjectId = "";
      if (this.user.orgType == 2 || this.user.orgType == 7 || this.user.orgType == 3 || this.user.orgType == 9 || this.user.orgType == 10 || this.user.orgType == 11 || this.user.orgType == 12) {
        this.subcontractorStatus = false;
        this.groupStatus = true;
        this.projectStatus = true;
      } else {
        this.groupStatus = false;
      }
      if (this.user.orgType == 5) {
        this.groupStatus = true;
      }
      if (val.name == 3) {
        this.contractTemplateList();
      } else {
        this.getOrgPageList();
      }
    },
    // 查看合同
    contractView(row) {
      if (this.orgType == 1 || this.orgType == 3 || this.orgType == 4) {
        this.url = row.templateUrl;
        this.$refs.pdfPiev.pdfShow = true;
      } else {
        const data = {
          urlType: 1,
          pkId: row.pkId
        };
        this.$api.nailUrlByOrgId(data).then(res => {
          console.log(res);
          if (res.code == 200) {
            this.url = res.data.shortUrl;
            this.show9 = true;
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    // 合同作废
    cancellation(row) {
      if (this.orgType != 4 && this.user.orgType == 7) {
        this.$confirm("确定作废该合同信息？", "作废确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$api.cancelById({ pkId: row.pkId }).then(res => {
              if (res.code == 200) {
                this.$message.success("作废成功");
                this.getOrgPageList();
              } else {
                this.$message.warning(res.msg);
              }
            });
          })
          .catch(() => {});
      }
    },
    // 解约合同
    unwind(row) {
      if (this.orgType == 1 && this.user.orgType == 7) {
        this.$api.rescindById({ pkId: row.pkId }).then(res => {
          if (res.code == 200) {
            // this.$message.success("作废成功");
            // this.getOrgPageList();
            this.url = res.data;
            this.show9 = true;
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    // 签署进度
    signedProgress(row) {
      this.$api.signScheduleById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.show6 = true;
          this.scheduleData = res.data;
        }
      });
    },
    // 获取合同是否签署成功
    userFaceDistinguishState(pkId) {
      setTimeout(() => {
        this.timer = setInterval(() => {
          this.$api
            .userFaceDistinguishState({ pkId, distinguishType: 1 })
            .then(res => {
              this.inTime++;
              if (this.inTime > 37) {
                this.maskShow = true;
                clearInterval(this.timer);
              }
              if (res.code == 200) {
                if (res.data.status === 2) {
                  clearInterval(this.timer);
                  this.$message.success("签署成功");
                  this.show7 = false;
                } else if (res.data.status == 3) {
                  clearInterval(this.timer);
                  this.$message.warning(res.data.errorInfo);
                }
              } else {
                clearInterval(this.timer);
              }
            })
            .catch(err => {
              clearInterval(this.timer);
            });
        }, 5000);
      }, 5000);
    },
    // 甲方签署
    pecificSign(row) {
      if (row.nailAllow == 1 && row.nailState == 0 && this.orgType == 2) {
        console.log(row);
        const data = {
          urlType: 2,
          pkId: row.pkId
        };
        this.$api.nailUrlByOrgId(data).then(res => {
          if (res.code == 200) {
            this.iframeTitle = "甲方签署";
            this.signatureUrl = res.data.shortUrl;
            this.show7 = true;
            this.userFaceDistinguishState(row.pkId);
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    // 乙方签署
    signBtn(row) {
      if (row.bstate == 0 && this.orgType == 2) {
        this.show1 = true;
      }
    },
    // 新增合同
    addContract() {
      this.nailUsersByOrgId(0);
      this.pageNum = 1;
      this.contractTitle = "新增合同模板";
      this.contractForm = {
        templateName: "", // 模板名称
        templateCode: "", // 模板编号
        contractType: "", // 模板类型
        keyword: "", // 关键词
        templateUrl: "" // 附件路
      };
      this.temporaryList = {};
      this.contractEditorList.fkUserId = null;
      this.show2 = true;
    },
    // 管理签章
    signatureManagement() {
      this.iframeTitle = "管理印章";
      this.$api
        .accountUrlByOrgId()
        .then(res => {
          if (res.code == 200) {
            // console.log(res);
            this.signatureUrl = res.data;
            // this.$nextTick(() => {
            this.show7 = true;
            // });
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {});
    },
    examine(row) {
      this.contractTitle = "合同模板信息";
      this.contractFindById(row.pkId);
      let api = this.user.orgType === 0 ? this.$api.getOrgSealState : this.$api.getOrgSealState2;
      // this.reshType=type
      api().then(res => {
        if (res.code === 200) {
          this.orgSealState = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
      // this.contractForm = row;
      // this.contractForm.contractType = this.contractForm.contractType.toString();
      // this.getNumPages(this.contractForm.templateUrl);
      // this.pageNum = 1;
      // this.show2 = true;
    },
    editTemplate(row) {
      this.contractTitle = "编辑合同模板";
      this.nailUsersByOrgId(1);
      this.contractFindById(row.pkId);
      // this.contractForm = row;
      // this.contractForm.contractType = this.contractForm.contractType.toString();
      // this.getNumPages(this.contractForm.templateUrl);
      // this.pageNum = 1;
      // this.show2 = true;
    },
    getOrgPageList() {
      this.listQuery.fkProjectId = this.form.projectId;
      this.listQuery.fkProjectBidId = this.form.fkProjectId;
      this.listQuery.fkOrgId = this.form.fkOrgId;
      // if (this.form.contractType.length != 0) {
      this.listQuery.contractType = this.form.contractType;
      // }
      this.listQuery.userName = this.form.userName;
      this.listQuery.fkTeamId = this.form.fkTeamId;
      // fkProjectId   contractStatus:1
      if (this.orgType == 1) {
        this.listQuery.contractStatus = 0;
      } else if (this.orgType == 2) {
        this.listQuery.contractStatus = 2;
      } else if (this.orgType == 4) {
        this.listQuery.contractStatus = 1;
      }
      this.randomKey = Math.random();
      this.loading = true;
      this.$api
        .projectSearchPage(this.listQuery)
        .then(res => {
          if (res.code == 200) {
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
    contractTemplateList() {
      // this.listQuery = {
      //   pageNum: 1,
      //   pageSize: 10
      // };
      this.loading = true;
      this.listQuery.keyword = this.form.keyword;
      this.listQuery.templateName = this.form.templateName;
      this.$api
        .contractTemplateList(this.listQuery)
        .then(res => {
          if (res.code == 200) {
            this.templateList = res.data.records;
            this.totalCount = parseInt(res.data.total);
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
    search() {
      if (this.orgType == 3) {
        this.contractTemplateList();
      } else {
        this.getOrgPageList();
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
      console.log(pageSize, this.listQuery);
      if (this.orgType == 3) {
        this.contractTemplateList();
      } else {
        this.getOrgPageList();
      }
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      if (this.orgType == 3) {
        this.contractTemplateList();
      } else {
        this.getOrgPageList();
      }
    },
    // 根据id获取合同详情
    contractFindById(pkId) {
      this.$api.contractFindById({ pkId }).then(res => {
        if (res.code === 200) {
          this.contractForm = res.data;
          this.contractForm.contractType = res.data.contractType.toString();
          this.testList = this.contractForm.contractTemplateCustoms ? this.contractForm.contractTemplateCustoms.map((item, index) => ({ ...item, id: index, content: item.fkUserId === "0" ? "乙方签名" : "甲方签名", xcoordinate: (item.xcoordinate - 50) * 0.8, ycoordinate: 673.6 - (item.ycoordinate + 45) * 0.8 })) : [];
          this.contractEditorList.fkUserId = this.contractForm.contractTemplateCustoms && this.contractForm.contractTemplateCustoms.length ? this.contractForm.contractTemplateCustoms.filter(item => item.fkUserId !== "0")[0].fkUserId : null;
          this.temporaryList = {
            fkUserId: this.contractEditorList.fkUserId,
            contractTemplateCustoms: [...this.testList]
          };
          this.getNumPages(res.data.templateUrl);
          this.pageNum = 1;
          this.show2 = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeSign(row, type) {
      if (type === 1) {
        this.testList = this.testList.filter(item => item.id !== row.id);
      } else {
        this.signaturePosition = this.signaturePosition.filter(item => item.id !== row.id);
      }
    },
    signUserChange() {
      this.testList
        .filter(item => item.content === "甲方签名")
        .forEach(item => {
          item.fkUserId = this.contractEditorList.fkUserId;
        });
    },
    comMove(pos, row) {
      row.x = pos.x;
      row.y = pos.y;
    },
    show8Close() {
      this.show8 = false;
      this.testList = [];
      this.contractEditorList.fkUserId = "";
      this.clean = true;
    }
  }
};
</script>
<style lang="scss" scoped>
.header-search {
  position: relative;
  .add-btn {
    position: absolute;
    top: 12px;
    right: 8px;
  }
  .addTrainBtn {
    display: none !important;
  }
}
.header-seach {
  background: #fff;
  padding-top: 15px;
  position: relative;
  padding-left: 20px;
  border-radius: 5px;
  .hader-btn {
    position: absolute;
    top: 23px;
    right: 20px;
  }
}
.sign-dialog {
  // /deep/ .el-dialog__header {
  //   background-color: #f3f3f3;
  // }
  .prompt-content {
    margin: 20px 0 20px 0;
    .centent {
      line-height: 60px;
      text-align: center;
      font-size: 20px;
    }
  }
}
.show-tow {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  .left {
    /deep/ .el-form-item {
      margin: 0;
    }
    .custom-field {
      .custom-field-from {
        height: 260px;
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
    }
  }
  .right {
    position: relative;
    // width: 560px;
    // height: 668px;
    width: 500px;
    height: 705px;
    .right-box {
      width: 100%;
      height: 100%;
      margin-bottom: 10px;
      overflow: hidden;
      border: 1px solid !important;
    }
    .right-btn {
      position: absolute;
      top: 5px;
      right: 7px;
      z-index: 3;
    }
  }
  .upload-demo {
    width: 250px;
    height: 250px;
    margin: 0 auto;
    border: dashed 1px #ccc;
    margin-top: 20%;
    text-align: center;
    padding-top: 60px;
    .el-icon-upload {
      font-size: 40px;
    }
  }
}
.bottom {
  text-align: center;
  margin: 10px;
}
// /deep/ .el-dialog__header {
//   background-color: #f3f3f3;
// }

.invited-sign-form {
  .el-form-item {
    margin-bottom: 0;
  }
}
.select-personnel {
  .header-search {
    margin-top: 20px;
  }
}
.pdfIframe {
  width: 100%;
  height: 650px;
}
.mask {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.295);
  z-index: 9999;
}
/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
.red {
  color: red;
}
.h-300 {
  height: 300px;
}
.h-600 {
  height: 600px;
}
</style>
