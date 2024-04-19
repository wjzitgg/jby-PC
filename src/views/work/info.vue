<!-- 劳务信息 -->
<template>
  <div class="app-container">
    <div class="header-seach">
      <el-collapse-transition>
        <el-form :inline="true" :model="form" class="search-mr">
          <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)">
            <treeSelect @selectIds="selectIds"></treeSelect>
          </el-form-item>
          <el-form-item label="标段项目" label-width="70px" v-if="user.orgType == 7">
            <el-select size="mini" class="wh-150" v-model="form.noProjectId" placeholder="请选择" @change="listByProjectId" :disabled="projectStatus">
              <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分包单位" label-width="70px" v-if="user.orgType != 7 && typeShow">
            <el-select size="mini" class="wh-150" v-model="form.fkOrgId" placeholder="请选择" @change="subcontractorSelect" :disabled="subcontractorStatus">
              <el-option v-for="item in subcontractorData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="班组类别" label-width="70px" v-if="typeShow">
            <el-select size="mini" class="wh-150" v-model="form.fkClassId" placeholder="请选择" @change="typeChange" :disabled="user.orgType!=7&&!form.fkOrgId">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in classTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="班组" label-width="60px" v-if="typeShow">
            <el-select size="mini" class="wh-150" v-model="form.fkTeamId" placeholder="请选择" :disabled="!form.fkClassId">
              <el-option v-for="item in searchTeamData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="入职时间" label-width="70px" v-if="typeShow">
            <el-date-picker class="wh-150" value-format="yyyy-MM-dd" size="mini" v-model="form.beginTime" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="至" label-width="30px" v-if="typeShow">
            <el-date-picker class="wh-150" value-format="yyyy-MM-dd" :picker-options="pickerOptionsEnd" size="mini" v-model="form.endTime" type="date" placeholder="选择日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="劳务人员" label-width="70px" v-if="typeShow">
            <el-input size="mini" class="wh-150" v-model="form.userName" autocomplete="off" maxlength="25"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" label-width="70px" v-if="typeShow">
            <el-input class="wh-150" size="mini" @keydown.native="keyDown($event, 1)" type="number" oninput="if(value.length>11)value=value.slice(0, 11)" v-model="form.telephone" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label-width="1px" v-if="typeShow">
            <el-button type="primary" icon="el-icon-search" class="el-button-primary" size="mini" @click.native="search">查询</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-transition>
    </div>
    <div class="tab-container" v-if="typeShow">
      <div class="table-data" style="margin-top: 10px" :style="{ height: [2, 3, 9].includes(user.orgType) ? '80%' : '88%' }">
        <el-table :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column align="center" prop="userName" label="劳务人员" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="cardNum" label="身份证号码" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="telephone" label="手机号" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="inductionTime" label="入职日期" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="resignationTime" label="离职日期" min-width="100"> </el-table-column>
          <!-- <el-table-column v-if="user.orgType == 2 || user.orgType == 3" align="center" prop="projectName" label="项目" min-width="100"> </el-table-column>
          <el-table-column v-if="user.orgType != 5" align="center" prop="projectBidName" label="标段项目" min-width="100"> </el-table-column> -->
          <el-table-column v-if="user.orgType != 7" align="center" prop="orgName" label="所属分包单位" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="className" label="班组类别" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="teamName" label="所属班组" min-width="90"> </el-table-column>
          <el-table-column prop="alarmLevel" label="详情" align="center" min-width="80">
            <template slot-scope="scope">
              <el-button plain type="primary" size="mini" @click.native="examine(scope.row)">查看</el-button>
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
    <el-dialog title="劳务信息" :visible.sync="show" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="basi">
          <div class="basi-title">基本信息</div>
          <div class="basi-center">
            <el-row :gutter="20">
              <el-col :span="8">劳务人员：{{ serviceInformation.userName }}</el-col>
              <el-col :span="8">身份证号：{{ serviceInformation.cardNum }}</el-col>
              <el-col :span="8">手机号码：{{ serviceInformation.telephone }}</el-col>
              <el-col :span="8">所在班组：{{ serviceInformation.teamName }}</el-col>
              <el-col :span="8">入职日期：{{ serviceInformation.inductionTime }}</el-col>
              <el-col :span="8">离职日期：{{ serviceInformation.resignationTime }}</el-col>
            </el-row>
          </div>
          <div style="margin-top: 10px">
            <el-tabs v-model="orgType">
              <el-tab-pane label="工资发放" name="1"></el-tab-pane>
              <el-tab-pane label="劳务合同" name="2"></el-tab-pane>
              <el-tab-pane label="保险" name="3"></el-tab-pane>
              <el-tab-pane label="培训" name="4"></el-tab-pane>
            </el-tabs>
            <!-- 工资 -->
            <el-table
              v-show="orgType == 1"
              :data="serviceInformation.paymentBalanceListVos"
              stripe
              height="470px"
              :show-summary="orgType==1"
              style="width: 100%"
              v-loading="loading"
              :summary-method="getSummaries"
              :header-cell-style="{
                background: '#f1f6ff',
                'text-align': 'center'
              }"
              :cell-style="{ align: 'center' }"
            >
              <el-table-column align="center" label="序号" min-width="60">
                <template slot-scope="scope">
                  <div style="text-align: center">
                    {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="settlementTime" label="日期" min-width="130">
                <template slot-scope="scope">
                  <span v-if="scope.row.settlementTime != null">{{ /\d{4}-\d{1,2}-\d{1,2}/g.exec(scope.row.settlementTime)[0] }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="menuName" label="类型" min-width="90">
                <template slot-scope="scope">
                  <span v-if="scope.row.settlementType == 1">结算</span>
                  <span v-if="scope.row.settlementType == 2">发放</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="settlementAmount" label="结算金额" min-width="80"> </el-table-column>
              <el-table-column align="center" prop="grantAmount" label="发放金额" min-width="80"> </el-table-column>
              <el-table-column align="center" prop="remark" label="备注" min-width="100"> </el-table-column>
              <el-table-column align="center" prop="paymentAmount" label="结余" min-width="80"> </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
            <!-- 劳动 -->
            <el-table
              v-show="orgType == 2"
              :data="serviceInformation.teamMembersContractListVos"
              stripe
              height="500px"
              style="width: 100%"
              v-loading="loading"
              :header-cell-style="{
                background: '#f1f6ff',
                'text-align': 'center'
              }"
              :cell-style="{ align: 'center' }"
            >
              <el-table-column align="center" label="序号" min-width="60">
                <template slot-scope="scope">
                  <div style="text-align: center">
                    {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="contractName" label="劳动合同" min-width="130"> </el-table-column>
              <el-table-column align="center" prop="signingTime" label="签订日期" min-width="90">
                <template slot-scope="scope">
                  <span v-if="scope.row.signingTime != null">{{ /\d{4}-\d{1,2}-\d{1,2}/g.exec(scope.row.signingTime)[0] }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="menuUrl" label="状态" min-width="80">
                <template slot-scope="scope">
                  <div v-if="scope.row.contractStatus == 0">已签署</div>
                  <div v-if="scope.row.contractStatus == 1">失效</div>
                  <div v-if="scope.row.contractStatus == 2">待签署</div>
                  <div v-if="scope.row.contractStatus == 3">已作废</div>
                </template>
              </el-table-column>
              <el-table-column prop="alarmLevel" label="详情" align="center" min-width="80">
                <template slot-scope="scope">
                  <el-button plain v-if="scope.row.contractUrl != null" type="primary" size="mini" @click.native="preview(scope.row)">查看</el-button>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
            <!-- 保险 -->
            <el-table
              v-show="orgType == 3"
              :data="serviceInformation.teamMembersInsureListVos"
              stripe
              height="500px"
              style="width: 100%"
              v-loading="loading"
              :header-cell-style="{
                background: '#f1f6ff',
                'text-align': 'center'
              }"
              :cell-style="{ align: 'center' }"
            >
              <el-table-column align="center" label="序号" min-width="60">
                <template slot-scope="scope">
                  <div style="text-align: center">
                    {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="insureType" label="保险类型" min-width="90">
                <template slot-scope="scope">
                  <div v-if="scope.row.insureType == 1">社保</div>
                  <div v-if="scope.row.insureType == 2">意外险</div>
                  <div v-if="scope.row.insureType == 3">其他</div>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="menuName" label="保险有效日期" min-width="130">
                <template slot-scope="scope">
                  <span v-if="scope.row.beginTime != null">{{ /\d{4}-\d{1,2}-\d{1,2}/g.exec(scope.row.beginTime)[0] }}</span
                  >~<span v-if="scope.row.endTime != null">{{ /\d{4}-\d{1,2}-\d{1,2}/g.exec(scope.row.endTime)[0] }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="userName" label="购买人" min-width="80"> </el-table-column>
              <el-table-column align="center" prop="purchaseTime" label="购买日期" min-width="80">
                <template slot-scope="scope">
                  <span v-if="scope.row.purchaseTime != null">{{ /\d{4}-\d{1,2}-\d{1,2}/g.exec(scope.row.purchaseTime)[0] }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="alarmLevel" label="详情" align="center" min-width="80">
                <template slot-scope="scope">
                  <el-button plain type="primary" v-if="scope.row.enclosureUrl" size="mini" @click.native="trainView(scope.row)">查看</el-button>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
            <!-- 培训 -->
            <el-table
              v-show="orgType == 4"
              :data="serviceInformation.trainListVos"
              stripe
              height="500px"
              style="width: 100%"
              v-loading="loading"
              :header-cell-style="{
                background: '#f1f6ff',
                'text-align': 'center'
              }"
              :cell-style="{ align: 'center' }"
            >
              <el-table-column align="center" label="序号" min-width="60">
                <template slot-scope="scope">
                  <div style="text-align: center">
                    {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="speakerTypeName" label="主讲类型" min-width="130"> </el-table-column>
              <el-table-column align="center" prop="title" label="培训主题" min-width="90"> </el-table-column>
              <el-table-column align="center" prop="trainingTime" label="培训日期" min-width="80">
                <template slot-scope="scope">
                  <span v-if="scope.row.trainingTime != null">{{ /\d{4}-\d{1,2}-\d{1,2}/g.exec(scope.row.trainingTime)[0] }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="detailAddress" label="培训地点" min-width="80"> </el-table-column>
              <el-table-column align="center" prop="speaker" label="发起人" min-width="100"> </el-table-column>
              <el-table-column prop="alarmLevel" label="详情" align="center" min-width="80">
                <template slot-scope="scope">
                  <el-button plain type="primary" v-if="scope.row.enclosureUrl" size="mini" @click.native="trainExamine(scope.row)">查看</el-button>
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
    </el-dialog>
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <el-dialog title="预览" width="600px" :visible.sync="imgShow" v-dialogDrag :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div>
          <el-carousel trigger="click" height="730px">
            <el-carousel-item v-for="(item, idx) in fileList" :key="idx">
              <img :src="item.path" alt="Smiley" width="100%" />
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </el-dialog>
    <!-- 凭证预览 -->
    <el-dialog title="预览" width="500px" :visible.sync="imgShow2" v-dialogDrag :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading">
      <div>
        <img width="100%" :src="imgUrl" alt="" />
      </div>
    </el-dialog>
    <el-dialog title="培训信息" :visible.sync="viewshow" top="2vw" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <el-radio-group v-model="viewshowRadio">
          <el-radio-button :label="1">培训信息</el-radio-button>
          <el-radio-button :label="2">签到信息</el-radio-button>
        </el-radio-group>
        <div class="dialogs">
          <div v-if="viewshowRadio === 1">
            <el-form :model="detailDtata" ref="detailDtata" style="margin-top: 20px">
              <el-row :span="24" class="el-row-data">
                <el-col :span="12">
                  <el-form-item label="培训主题" prop="title" :label-width="formLabelWidth">
                    <el-input disabled size="mini" v-model="detailDtata.title" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="培训类型" prop="speakerType" :label-width="formLabelWidth">
                    <el-input v-model="detailDtata.speakerTypeName" disabled size="mini"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-if="user.orgType !== 5">
                  <el-form-item label="标段项目" prop="projectBidName" :label-width="formLabelWidth">
                    <el-input disabled size="mini" v-model="detailDtata.projectBidName" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="班组选择" prop="teamName" :label-width="formLabelWidth">
                    <el-input disabled size="mini" v-model="detailDtata.teamName" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12"><div></div></el-col>
                <el-col :span="8">
                  <el-form-item label="培训日期" prop="trainingTime" :label-width="formLabelWidth">
                    <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" v-model="detailDtata.trainingTime" type="date" placeholder="选择日期" disabled></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="开始时间" :label-width="formLabelWidth">
                    <el-time-select disabled size="mini" v-model="detailDtata.trainingStartTime" :picker-options="{ start: '00:00', step: '00:05', end: '23:30' }"> </el-time-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="持续时间" :label-width="formLabelWidth">
                    <el-select size="mini" v-model="selTime" disabled placeholder="请选择" style="width: 100%">
                      <el-option v-for="item in timeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="培训地点" prop="detailAddress" :label-width="formLabelWidth">
                    <el-input disabled size="mini" v-model="detailDtata.detailAddress" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-if="user.orgType === 5">
                  <el-form-item label="发起单位" prop="fkCompanyId" :label-width="formLabelWidth">
                    <el-input disabled size="mini" v-model="detailDtata.speakerCompany" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="主讲人" prop="menuName" :label-width="formLabelWidth">
                    <el-input disabled size="mini" v-model="detailDtata.speaker" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="是否需要签到" prop="speaker" :label-width="formLabelWidth">
                    <el-radio-group size="mini" v-model="detailDtata.signStatus" disabled>
                      <el-radio :label="0">是</el-radio>
                      <el-radio :label="1">否</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="附件" prop="remark" :label-width="formLabelWidth" v-if="fileList.length != 0">
                    <div class="upLoad-show">
                      <p v-for="(item, idx) in fileList" :key="idx">
                        <span>{{ item.name }}</span>
                        <!-- trainView(scope.row) -->
                        <el-button size="mini" @click="imgPreview(item)">预览</el-button>
                      </p>
                    </div>
                  </el-form-item>
                </el-col>
                <!-- <el-col :span="12"></el-col>
          <el-col :span="12"></el-col> -->
              </el-row>
            </el-form>
            <myEditorJustLook :pro-html="detailDtata.trainingContent"></myEditorJustLook>
          </div>
          <div v-if="viewshowRadio === 2">
            <div style="text-align: right">已签到{{ detailQuery.totalCount }}人</div>
            <div>
              <el-table
                :data="detailArr"
                height="300px"
                style="width: 100%"
                v-loading="loading"
                :header-cell-style="{
                  background: '#f1f6ff',
                  'text-align': 'center'
                }"
                :cell-style="{ align: 'center' }"
              >
                <el-table-column align="center" label="序号" min-width="60">
                  <template slot-scope="scope">
                    <div style="text-align: center">
                      {{ (detailQuery.pageNum - 1) * detailQuery.pageSize + (scope.$index + 1) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="center" prop="userName" label="劳务人员" min-width="90"> </el-table-column>
                <el-table-column align="center" prop="orgName" v-if="user.orgType == 2 && user.orgType == 3" label="归属分包单位" min-width="90"> </el-table-column>
                <el-table-column align="center" prop="createTime" label="签到日期" min-width="90"> </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                  <img src="@/assets/empty.svg" class="zanwu" />
                  <span>暂无数据</span>
                </div>
              </el-table>
              <table-paging :current-page="detailQuery.pageNum" :page-size="detailQuery.pageSize" :total="detailQuery.totalCount" @handleSizeChange="viewsQuerySize" @handleCurrentChange="viewsQueryCurrent"></table-paging>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import myEditorJustLook from "@/components/myEditor/myEditorJustLook.vue";
import treeSelect from "../../components/proTreeSelect/treeSelect.vue";
export default {
  components: {
    pdfPiev,
    myEditorJustLook,
    treeSelect
  },
  data() {
    return {
      totalCount: 0,
      tableData: [],
      loading: false,
      formLabelWidth: "110px",
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      form: {
        projectId: "",
        noProjectId: "",
        fkOrgId: "",
        fkTeamId: "",
        startTime: "",
        behindTime: "",
        userName: "",
        telephone: "",
        beginTime: "",
        endTime: "",
        fkClassId:""
      },
      ruleForm: {},
      show: false,
      parentMenu: [{ a1: "1" }],
      orgType: "1",

      user: {},
      serviceInformation: {
        userName: "张三", // 劳务人员
        cardNum: "430523198207213351", // 身份证
        telephone: "13856585868",
        teamName: "路面班组",
        inductionTime: "2022-05-1",
        resignationTime: "",
        paymentBalanceListVos: [], // 详情工资列表
        teamMembersContractListVos: [], // 详情劳务合同列表
        teamMembersInsureListVos: [], // 详情保险列表
        trainListVos: [] // 详情培训列表
      },
      teamSpinner: [], // 班组下拉
      noProjectData: [], // 标段项目
      options: [], // 项目
      subcontractorData: [{ label: "全部", value: "" }], // 分部商
      url: "",
      pickerOptionsEnd: {
        disabledDate: time => {
          if (this.form.startTime) {
            let d;
            if (typeof this.form.startTime == "string") {
              d = new Date(this.form.startTime).getTime();
            } else {
              d = this.form.startTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      imgShow: false,
      imgShow2: false,
      imgUrl: "",
      fileList: [],
      searchTeamData: [{ label: "全部", value: "" }], // 班组下拉数据
      projectStatus: false, // 控制标段项目不能选择
      subcontractorStatus: true, // 控制分包单位不能选择
      groupStatus: true, // 控制班组不能选择
      viewshow: false,
      detailQuery: {
        pkId: "",
        pageNum: 1,
        pageSize: 10,
        totalCount: 0
      },
      detailDtata: {
        title: "",
        speakerType: "",
        projectBidName: "",
        teamName: "",
        trainingTime: "",
        detailAddress: "",
        speaker: ""
      },
      times: ["", ""],
      viewshowRadio: 1,
      timeList: [
        { value: 15 * 60 * 1000, label: "15分钟" },
        { value: 30 * 60 * 1000, label: "30分钟" },
        { value: 45 * 60 * 1000, label: "45分钟" },
        { value: 60 * 60 * 1000, label: "1小时" },
        { value: 2 * 60 * 60 * 1000, label: "2小时" },
        { value: 3 * 60 * 60 * 1000, label: "3小时" }
      ],
      selTime: "",
      typeShow: true,
      classTypeList:[]
    };
  },
  mounted() {
    this.user = JSON.parse(sessionStorage.getItem("user"));
    // 如果是建设、监理、设计院才隐藏下面的
    // if (this.user.orgType == 2 || this.user.orgType == 3 || this.user.orgType == 9) {
    //   this.projectStatus = true;
    // }
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }

        // 分包单位、施工、供应商展示标段项目
        if (this.user.orgType == 4 || this.user.orgType == 6 || this.user.orgType == 7) {
          // 获取标段项目，标段项目下拉选择获取班组
          // this.listByProjectId();
          if(this.user.orgType == 7){
            this.teamClassSearch()
          }
          this.getOrgPageList();
        }

        if (this.user.orgType == 5) {
          this.subcontractorStatus = false;
          this.subcontractor();
          this.getOrgPageList();
        }
        this.noProject();
      } else {
        this.$message.error(res.msg);
      }
    });

    // this.listAll();
  },

  methods: {
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      console.log('合计',param);
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (["结算金额", "发放金额"].includes(column.label)) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return (prev + curr).toFixed(6) - 0;
              } else {
                return prev;
              }
            }, 0);
          }else {
            sums[index] = "N/A";
          }
        }
      });
      sums[6] = sums[3] - sums[4]
      return sums;
    },
    typeChange(e){
      this.form.fkTeamId=""
      this.searchTeamData=[]
      if(e){
        this.labourTeamSearch(e)
      }
    },
    teamClassSearch(){
      let data={
        fkOrgId:this.user.orgType==7?'':this.form.fkOrgId
      }
      this.$api.teamClassSearch(data).then(res=>{
        if(res.code===200){
         this.classTypeList=res.data.map(item=>({...item,label:item.className,value:item.pkId}))
        }
      })
    },
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.form.projectId = arr[0];
          this.form.noProjectId = arr[1];
        } else {
          this.form.noProjectId = arr[0];
        }
        if (isTrue) {
          this.search();
        }
        this.listByProjectId(this.form.noProjectId);
      }
    },
    // 凭证预览
    imgPreview(item) {
      this.imgUrl = "";
      this.imgUrl = item.path;
      this.imgShow = true;
    },
    trainView(row) {
      //
      this.fileList = [];
      // enclosureUrl
      // return console.log(row)
      this.fileList = JSON.parse(row.enclosureUrl);
      this.imgUrl = row.enclosureUrl;
      this.imgShow = true;
    },
    // 查询全部班组
    listAll() {
      this.$api.listAll().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.teamName;
            item.value = item.pkId;
          });
          this.teamSpinner = res.data;
          this.teamSpinner.unshift({ value: "", label: "全部" });
        }
      });
    },
    // 顶部项目搜索下拉列表 两种权限所有进来得调用 2 3 9 4 6 7 角色
    noProject() {
      this.$api.getItemListNoUserId({ isWhole: 1, projectId: "" }).then(res => {
        // this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          if (this.user.orgType == 4 || this.user.orgType == 6 || this.user.orgType == 7) {
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
    // 项目部登录 获取分包单位 下拉列表
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
      this.form.fkClassId=""
      this.classTypeList=[]
      if (id) {
        this.teamClassSearch()
        // this.groupStatus = false;
      } else {
        // id等于空的时候
        // this.groupStatus = true;
        this.form.fkTeamId = "";
      }
    },
    labourTeamSearch(id){
      this.$api.labourTeamSearch({ projectId: this.form.noProjectId,fkClassId:id }).then(res => {
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
    },
    // 根据项目id获取标段项目下拉列表
    projectIdChange(val) {
      this.form.noProjectId = "";
      const data = {};
      if (val.length == 0) {
        data.isWhole = 1;
        data.projectId = val;
        this.projectStatus = true;
        this.subcontractorStatus = true;
        // this.groupStatus = true;
        this.form.noProjectId = ""; // 清空标段项目
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
    // 联动的时候 根据标段项目调取班组 根据分包单位获取班组也是这方法
    listByProjectId() {
      let id = "";
      this.form.fkOrgId=""
      this.subcontractorData=[]
      this.form.fkClassId=""
      this.classTypeList=[]
      this.form.fkTeamId=""
      this.searchTeamData=[]
      // 标段项目如果不是全部
      if (this.form.noProjectId != "") {
        id = this.form.noProjectId;
        if (this.user.orgType == 6 || this.user.orgType == 7) {
          this.groupStatus = false; // 班组展示
        } else {
          this.subcontractorStatus = false; // 分包单位展示
        }
      }
      if (this.form.noProjectId == "") {
        id = "";
        this.groupStatus = true;
        this.subcontractorStatus = true;
        this.form.fkOrgId = ""; // 分包单位为空
        this.form.fkTeamId = ""; // 班组清空
        return;
      }
      if (this.user.orgType == 2 || this.user.orgType == 3 ||this.user.orgType == 4|| this.user.orgType == 9 || this.user.orgType == 10 || this.user.orgType == 11 || this.user.orgType == 12) {
        // 根据标段项目获取分包单位下拉列表
        this.subcontractorList(id);
      } else {
        // 4 6 7情况
        // this.$api.listByProjectId({ projectId: id }).then(res => {
        //   if (res.code == 200) {
        //     res.data.forEach(item => {
        //       item.label = item.teamName;
        //       item.value = item.pkId;
        //     });
        //     if (this.form.fkTeamId != undefined && this.form.fkTeamId != null) {
        //       this.form.fkTeamId = "";
        //     }
        //     this.searchTeamData = res.data; // 班主下拉列表
        //     this.searchTeamData.unshift({ label: "全部", value: "" });
        //   } else {
        //     this.$message.warning(res.msg);
        //   }
        // });
      }
    },
    examine(row) {
      this.orgType = "1";
      this.show = true;
      this.$api.labourServicefindById({ pkId: row.pkId }).then(res => {
        if (res.code == 200) {
          this.serviceInformation.userName = res.data.userName;
          this.serviceInformation.cardNum = res.data.cardNum;
          this.serviceInformation.telephone = res.data.telephone;
          this.serviceInformation.teamName = res.data.teamName;
          if (res.data.inductionTime != null) {
            this.serviceInformation.inductionTime = /\d{4}-\d{1,2}-\d{1,2}/g.exec(res.data.inductionTime)[0];
          } else {
            this.serviceInformation.inductionTime = res.data.inductionTime;
          }
          if (res.data.resignationTime != null) {
            this.serviceInformation.resignationTime = /\d{4}-\d{1,2}-\d{1,2}/g.exec(res.data.resignationTime)[0];
          } else {
            this.serviceInformation.resignationTime = res.data.resignationTime;
          }
          this.serviceInformation.paymentBalanceListVos = res.data.paymentBalanceListVos;
          this.serviceInformation.teamMembersContractListVos = res.data.teamMembersContractListVos;
          this.serviceInformation.teamMembersInsureListVos = res.data.teamMembersInsureListVos;
          this.serviceInformation.trainListVos = res.data.trainListVos;
        }
      });
    },
    preview(row) {
      this.url = row.contractUrl;
      this.$refs.pdfPiev.pdfShow = true;
    },
    getOrgPageList() {
      this.loading = true;
      this.$api
        .crewSearchPage(this.listQuery)
        .then(res => {
          if (res.code == 200) {
            const statusOptions = {
              0: "正常",
              1: "停用"
            };
            res.data.records.forEach(item => {
              item.menuStatusName = statusOptions[item.menuStatus];
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
      this.listQuery = {
        pageNum: 1,
        pageSize: 10
      };
      this.listQuery.beginTime = this.form.beginTime;
      this.listQuery.endTime = this.form.endTime;
      this.listQuery.fkTeamId = this.form.fkTeamId;
      this.listQuery.fkOrgId = this.form.fkOrgId;
      this.listQuery.userName = this.form.userName;
      this.listQuery.telephone = this.form.telephone;
      this.listQuery.fkProjectId = this.form.projectId;
      this.listQuery.fkProjectBidId = this.form.noProjectId;
      this.listQuery.fkClassId = this.form.fkClassId;
      this.getOrgPageList();
    },
    // 排序值禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    batchDelete(row) {
      this.$confirm("确定删除该劳务工人信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.sysMenuDelete({ pkId: row.pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.getOrgPageList();
              // this.allListByThree();
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
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.getOrgPageList();
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.getOrgPageList();
    },
    trainExamine(row) {
      this.fileList = [];
      this.times = ["", ""];
      this.viewshowRadio = 1;
      this.viewshow = true;
      this.detailQuery.pkId = row.pkId;
      this.labourTrainFindById();
    },
    labourTrainFindById() {
      this.$api.labourTrainFindById(this.detailQuery).then(res => {
        if (res.code == 200) {
          this.detailDtata = res.data;
          this.detailDtata.trainingStartTime = moment(new Date(res.data.trainingTime + " " + res.data.trainingStartTime)).format("HH:mm");
          this.fileList = JSON.parse(res.data.enclosureUrl);
          this.detailArr = res.data.userSignPageVo.records;
          this.detailQuery.totalCount = parseInt(res.data.userSignPageVo.total);
          this.times = [res.data.trainingStartTime, res.data.trainingEndTime];
          let beginTime = Date.parse(new Date(res.data.trainingTime + " " + res.data.trainingStartTime));
          let endTime = Date.parse(new Date(res.data.trainingTime + " " + res.data.trainingEndTime));
          let time = endTime - beginTime;
          if (time < 15 * 60 * 1000) {
            this.selTime = "";
          } else if (time > 3 * 60 * 60 * 1000) {
            this.selTime = "";
          } else {
            this.selTime = time;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 页数改变事件
    viewsQuerySize(pageSize) {
      this.detailQuery.pageSize = pageSize;
      this.labourTrainFindById();
    },
    // 页码改变事件
    viewsQueryCurrent(currentPage) {
      this.detailQuery.pageNum = currentPage;
      this.labourTrainFindById();
    }
  }
};
</script>
<style lang="scss" scoped>
.header-seach {
  background: #fff;
  padding-top: 15px;
  padding-left: 5px;
  border-radius: 5px;
}
.basi {
  .basi-title {
    font-size: 15px;
    font-weight: 700;
    line-height: 20px;
  }
  .basi-center {
    padding: 8px;
    background: #fff;
    border-radius: 5px;
    // box-shadow: 0px 0px 2px 2px #ccc;
    border: 1px solid #ccc;
    .el-col {
      line-height: 40px;
    }
  }
}

/deep/ .datetime-end {
  .el-form-item__label {
    width: 2em !important;
  }
}
// /deep/ .btn-wrap {
//     width: 100%;
//     text-align: right;
// }
.wh-150 {
  width: 150px;
}
/deep/ .el-tabs__header {
  background-color: #fff;
}
/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
</style>
