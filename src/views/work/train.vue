<!-- 培训 -->
<template>
  <div class="app-container">
    <div v-if="user.orgType == 7">
      <el-tabs v-model="orgType" @tab-click="orgTypeChange">
        <el-tab-pane label="内部培训" name="1"></el-tab-pane>
        <el-tab-pane label="上级培训" name="2"></el-tab-pane>
      </el-tabs>
    </div>
    <div v-if="user.orgType == 5">
      <el-tabs v-model="orgType" @tab-click="orgTypeChange">
        <el-tab-pane label="项目部培训" name="2"></el-tab-pane>
        <el-tab-pane label="分包单位培训" name="1"></el-tab-pane>
      </el-tabs>
    </div>
    <div class="header-search">
      <search-bar class="search-bar-demo" ref="searchBar" @search="search" @fkProjectIdChange="trainChange" :options="searchOptions" :total="totalCount" labelWidth="8em" :showHandler="false" :showSearchBtn="typeShow"></search-bar>
      <div class="add-btn">
        <el-button
          v-has="'work:train:add'"
          type="primary"
          class="el-button-primary"
          v-if="(user.orgType == 7 && orgType != 2) || (user.orgType == 5 && orgType == 2 && typeShow)"
          :class="{
            addTrainBtn: (user.orgType == 5 && orgType == 1) || user.orgType == 2 || user.orgType == 3
          }"
          size="mini"
          @click.native="addTrain"
          >新增培训</el-button
        >
      </div>
    </div>
    <div class="tab-container" v-if="typeShow">
      <div class="table-data" style="margin-top: 10px" :style="{ height: [2, 3, 9].includes(user.orgType) ? '88%' : '80%' }">
        <el-table :data="tableData" stripe height="90%" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="title" label="培训主题" min-width="130"> </el-table-column>
          <el-table-column align="center" prop="speakerTypeName" label="培训类型" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="teamName" label="参加班组" min-width="80"> </el-table-column>
          <el-table-column align="center" prop="address" label="培训地点" min-width="100"> </el-table-column>
          <el-table-column align="center" prop="trainingTime" label="培训日期" min-width="100"> </el-table-column>
          <!-- <el-table-column align="center" prop="projectBidName" v-if="user.orgType !== 5" label="标段项目" min-width="80"> </el-table-column> -->
          <el-table-column align="center" prop="orgName" label="培训单位" min-width="90" v-if="user.orgType !== 7"> </el-table-column>
          <!-- <el-table-column align="center" prop="speakerCompany" label="发起单位" v-if="user.orgType == 5 && orgType == 2" min-width="80"> </el-table-column> -->
          <el-table-column align="center" prop="speaker" label="主讲人" min-width="90"> </el-table-column>
          <el-table-column align="center" prop="alarmLevel" label="操作" :min-width="maxWidth">
            <template slot-scope="scope">
              <el-button plain type="primary" size="mini" @click.native="examine(scope.row)">查看</el-button>
              <el-button plain type="success" size="mini" :class="{ shouType: user.orgType == 5 && orgType == 1 }" v-has="'work:train:sign'" v-if="user.orgType != 2 && user.orgType != 3" v-show="scope.row.signStatus === 0" @click.native="signIn(scope.row)">签到</el-button>
              <el-button plain type="warning" size="mini" :class="{ shouType: user.orgType == 5 && orgType == 1 }" v-if="user.orgType == 5 || (user.orgType == 7 && orgType != 2)" v-has="'work:train:update'" @click.native="trainEdit(scope.row)">编辑</el-button>
              <el-button plain type="danger" size="mini" :class="{ shouType: user.orgType == 5 && orgType == 1 }" v-if="user.orgType == 5 || (user.orgType == 7 && orgType != 2)" v-has="'work:train:delete'" @click.native="batchDelete(scope.row)">删除</el-button>
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
    <el-dialog :title="trainTitle" :visible.sync="show" top="2vw" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading" @close="close1">
      <div class="dialog-form">
        <div class="dialogs">
          <el-form :model="trainForm" ref="trainForm" :rules="rules" style="margin-top: 20px">
            <el-row :span="24" class="el-row-data">
              <el-col :span="12">
                <el-form-item label="培训主题" prop="title" :label-width="formLabelWidth">
                  <el-input size="mini" v-model="trainForm.title" autocomplete="off"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="培训类型" prop="speakerType" :label-width="formLabelWidth">
                  <el-select size="mini" v-model="trainForm.speakerType" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in typeAllList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="培训日期" prop="trainingTime" :label-width="formLabelWidth">
                  <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" v-model="trainForm.trainingTime" type="date" placeholder="选择日期"></el-date-picker>
                  <!-- <el-time-picker size="mini" is-range v-model="times" value-format="HH:mm:ss" @change="timePickerChange"
                    range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围">
                  </el-time-picker> -->
                  <!-- <el-time-select placeholder="起始时间" v-model="trainForm.trainingStartTime" :picker-options="{start: '00:00:00 - 23:59:59', maxTime: trainForm.trainingEndTime }" value-format='HH:mm:ss'> </el-time-select>
         <el-time-select placeholder="结束时间" v-model="trainForm.trainingEndTime" :picker-options="{selectableRange: '00:00:00 - 23:59:59', minTime: trainForm.trainingStartTime }" value-format='HH:mm:ss'> </el-time-select> -->
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开始时间" :label-width="formLabelWidth">
                  <el-time-select size="mini" v-model="trainForm.trainingStartTime" :disabled="!trainForm.trainingTime" :picker-options="{ start: '00:00', step: '00:05', end: '23:30' }" @change="timePickerChange"> </el-time-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="持续时间" :label-width="formLabelWidth">
                  <el-select size="mini" v-model="selTime" :disabled="disableStatus" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in timeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="user.orgType !== 5">
                <el-form-item label="标段项目" prop="sortval" :label-width="formLabelWidth">
                  <el-select size="mini" v-model="trainForm.projectId" :disabled="disableStatus" placeholder="请选择" style="width: 100%" @change="fkProjectIdChange">
                    <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="班组选择" prop="teamIds" :label-width="formLabelWidth">
                  <el-select size="mini" multiple v-model="trainForm.teamIds" :disabled="disableStatus" placeholder="请选择" style="width: 100%" collapse-tags>
                    <el-option v-for="item in teamSpinner" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="培训地点" prop="detailAddress" :label-width="formLabelWidth">
                  <el-input size="mini" v-model="trainForm.detailAddress" autocomplete="off"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="user.orgType === 5">
                <el-form-item label="发起单位" prop="fkCompanyId" :label-width="formLabelWidth">
                  <el-select size="mini" v-model="trainForm.fkCompanyId" placeholder="请选择" style="width: 100%">
                    <el-option label="本项目部" :value="user.fkOrgId"></el-option>
                    <!-- 0建设单位 1 监理公司 2 项目部 3 供应商 4分包商 5 设计院 6施工单位 -->
                    <el-option v-for="item in options" :key="item.value" :value="item.value" :label="item.label"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主讲人" prop="speaker" :label-width="formLabelWidth">
                  <el-input size="mini" v-model="trainForm.speaker" autocomplete="off"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否需要签到" prop="speaker" :label-width="formLabelWidth">
                  <el-radio-group size="mini" v-model="trainForm.signStatus">
                    <el-radio :label="0">是</el-radio>
                    <el-radio :label="1">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="附件" prop="enclosureUrl" :label-width="formLabelWidth">
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
                    <input v-show="false" type="file" accept="image/*" ref="files" id="upload" @change="upLoad" />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <myEditor :pro-html="trainForm.trainingContent" ref="myEditor" v-if="show"></myEditor>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="close1">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click="submitTeamForm('trainForm')">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="trainTitle" :visible.sync="viewshow" top="2vw" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
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
                    <el-select size="mini" disabled v-model="detailDtata.speakerType" placeholder="请选择" style="width: 100%">
                      <el-option v-for="item in typeAllList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
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
                <el-col :span="12" v-if="user.orgType == 5"></el-col>
                <el-col :span="8">
                  <el-form-item label="培训日期" prop="trainingTime" :label-width="formLabelWidth">
                    <el-date-picker size="mini" value-format="yyyy-MM-dd" style="width: 100%" v-model="detailDtata.trainingTime" type="date" placeholder="选择日期" disabled></el-date-picker>
                    <!-- <el-time-picker size="mini" is-range v-model="times" value-format="HH:mm:ss" @change="timePickerChange"
                    range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围">
                  </el-time-picker> -->
                    <!-- <el-time-select placeholder="起始时间" v-model="trainForm.trainingStartTime" :picker-options="{start: '00:00:00 - 23:59:59', maxTime: trainForm.trainingEndTime }" value-format='HH:mm:ss'> </el-time-select>
         <el-time-select placeholder="结束时间" v-model="trainForm.trainingEndTime" :picker-options="{selectableRange: '00:00:00 - 23:59:59', minTime: trainForm.trainingStartTime }" value-format='HH:mm:ss'> </el-time-select> -->
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="开始时间" :label-width="formLabelWidth">
                    <el-time-select disabled size="mini" v-model="detailDtata.trainingStartTime" :picker-options="{ start: '00:00', step: '00:05', end: '23:30' }" @change="timePickerChange"> </el-time-select>
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
    <el-dialog title="签到二维码" width="250px" :visible.sync="signInShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-form">
        <div class="qrcode-box" style="padding: 6px">
          <div ref="qrcode" id="qrcode"></div>
        </div>
      </div>
    </el-dialog>
    <!-- 凭证预览 -->
    <el-dialog title="预览" width="500px" :visible.sync="imgShow" v-dialogDrag :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading">
      <div>
        <img width="100%" :src="imgUrl" alt="" />
      </div>
    </el-dialog>
  </div>
</template>
<script>
import moment from "moment";
import QRCode from "qrcodejs2";
import COS from "cos-js-sdk-v5";
import myEditor from "@/components/myEditor/myEditor.vue";
import myEditorJustLook from "@/components/myEditor/myEditorJustLook.vue";
export default {
  components: { QRCode, myEditor, myEditorJustLook },
  data() {
    return {
      // 默认分包单位
      searchOptions: [
        {
          type: "select",
          prop: "fkProjectBidId",
          value: "",
          title: "标段项目",
          options: [],
          change: id => {
            this.selectProject(id);
          }
        },
        {
          type: "select",
          prop: "fkTeamId",
          value: "",
          title: "班组",
          disabled: true,
          options: []
        },
        {
          type: "select",
          prop: "speakerType",
          value: "",
          title: "培训类型",
          options: []
        },
        {
          type: "datepicker",
          prop: "beginTime",
          value: "",
          title: "培训日期",
          placeholder: "开始日期"
          // pickerOptions: {
          //   disabledDate(time,e,a,r) {
          //     return time.getTime() > Date.now();
          //   }
          // }
        },
        {
          type: "datetime-end",
          prop: "endTime",
          value: "",
          title: "至",
          placeholder: "结束时间"
          // pickerOptions: {
          //   disabledDate(time) {
          //     return time.getTime() < Date.now();
          //   }
          // }
        },
        {
          type: "input",
          prop: "title",
          value: "",
          title: "培训主题",
          placeholder: "培训主题",
          maxlength: "25"
        }
      ],
      totalCount: 0,
      tableData: [],
      loading: false,
      formLabelWidth: "110px",
      // 搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        trainingType: ""
      },
      ruleForm: {},
      show: false,
      parentMenu: [{ a1: "1" }],
      orgType: "1",
      trainForm: {
        title: "", // 培训主题
        speakerType: "", // 培训类型
        projectId: "", // 项目类型id
        teamIds: [], // 班组选择
        trainingTime: "", // 培训日期
        detailAddress: "", // 培训地点
        speaker: "", // 主讲人
        enclosureUrl: "", // 附件
        fkCompanyId: "",
        trainingStartTime: "",
        trainingEndTime: "",
        signStatus: "",
        trainingContent: ""
      },
      trainTitle: "培训",
      rules: {},
      options: [],
      form: {
        bookUrl: ""
      },
      maxWidth: "200",
      viewshow: false,
      viewsQuery: {
        pageNum: 1,
        pageSize: 10,
        totalCount: 0
      },
      signInShow: false,
      typeAllList: [], // 培训类型
      teamSpinner: [], // 班组下拉
      noProjectData: [], // 项目下拉
      user: {},
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
      detailArr: [],
      imgUrl: "",
      imgShow: false,
      fileList: [],
      fkProjectIdstatus: "",
      disableStatus: false,
      times: ["", ""],
      viewshowRadio: 1,
      newAddList: [],
      delList: [],
      timeList: [
        { value: 15 * 60 * 1000, label: "15分钟" },
        { value: 30 * 60 * 1000, label: "30分钟" },
        { value: 45 * 60 * 1000, label: "45分钟" },
        { value: 60 * 60 * 1000, label: "1小时" },
        { value: 2 * 60 * 60 * 1000, label: "2小时" },
        { value: 3 * 60 * 60 * 1000, label: "3小时" }
      ],
      selTime: "",
      typeShow: true
    };
  },
  created() {
    this.user = JSON.parse(sessionStorage.getItem("user"));
    // 项目部登录
    if (this.user.orgType == 5) {
      this.orgType = "2";
      this.searchOptions = [
        {
          type: "select",
          prop: "fkTeamId",
          value: "",
          title: "班组",
          options: []
        },
        {
          type: "select",
          prop: "speakerType",
          value: "",
          title: "培训类型",
          options: []
        },
        {
          type: "datepicker",
          prop: "beginTime",
          value: "",
          title: "培训日期",
          placeholder: "开始日期"
          // pickerOptions: {
          //   disabledDate(time) {
          //     return time.getTime() > Date.now();
          //   }
          // }
        },
        {
          type: "datetime-end",
          prop: "endTime",
          value: "",
          title: "至",
          placeholder: "结束时间"
          // pickerOptions: {
          //   disabledDate(time) {
          //     return time.getTime() < Date.now();
          //   }
          // }
        },
        {
          type: "input",
          prop: "title",
          value: "",
          title: "培训主题",
          placeholder: "培训主题",
          maxlength: "25"
        }
      ];
    } else if (this.user.orgType != 7) {
      this.searchOptions = [
        {
          type: "proSel",
          prop: "fkProjectId",
          value: "",
          title: "标段项目",
          options: []
        },
        // {
        //   type: "select",
        //   prop: "fkProjectBidId",
        //   value: "",
        //   title: "标段项目",
        //   options: []
        // },
        {
          type: "select",
          prop: "speakerType",
          value: "",
          title: "培训类型",
          options: []
        },
        {
          type: "datepicker",
          prop: "beginTime",
          value: "",
          title: "培训日期",
          placeholder: "开始日期"
          // pickerOptions: {
          //   disabledDate(time) {
          //     return time.getTime() > Date.now();
          //   }
          // }
        },
        {
          type: "datetime-end",
          prop: "endTime",
          value: "",
          title: "至",
          placeholder: "结束时间"
          // pickerOptions: {
          //   disabledDate(time) {
          //     return time.getTime() < Date.now();
          //   }
          // }
        },
        {
          type: "input",
          prop: "title",
          value: "",
          title: "培训主题",
          placeholder: "培训主题",
          maxlength: "25"
        }
      ];
    }
    const id = JSON.parse(sessionStorage.getItem("user"));
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          this.searchOptions = [];
          this.searchOptions = [
            {
              type: "proSel",
              prop: "fkProjectId",
              value: "",
              title: "标段项目",
              options: []
            }
          ];
          // this.$refs.searchBar.showSearch = false;
          // console.log(this.searchOptions);
          console.log(this.$refs.searchBar);
          return (this.typeShow = false);
        }
        if (id.orgType == 2 || id.orgType == 3) {
          this.maxWidth = "70";
        } else {
        }
        if (this.user.orgType == 7) {
          this.listQuery.trainingType = 1;
        } else if (this.user.orgType == 5) {
          this.listQuery.trainingType = 2;
        } else {
          this.listQuery.trainingType = 2;
        }
        this.getOrgPageList();
        this.speakerTypeAllList();
        // 项目部的时候查询所有班主
        if (this.user.orgType === 5) {
          this.getAllClass();
        }
        if (this.user.orgType == 6 || this.user.orgType == 7) {
          this.noProject();
        }
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  mounted() {
    // const id = JSON.parse(sessionStorage.getItem("user"));
    // this.$api.getProjectTreeByOrgType().then(res => {
    //   if (res.code == 200) {
    //     if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
    //       this.searchOptions = [];
    //       this.searchOptions = [
    //         {
    //           type: "proSel",
    //           prop: "fkProjectId",
    //           value: "",
    //           title: "标段项目",
    //           options: []
    //         }
    //       ];
    //       return (this.typeShow = false);
    //     }
    //     if (id.orgType == 2 || id.orgType == 3) {
    //       this.maxWidth = "70";
    //     } else {
    //     }
    //     if (this.user.orgType == 7) {
    //       this.listQuery.trainingType = 1;
    //     } else if (this.user.orgType == 5) {
    //       this.listQuery.trainingType = 2;
    //     } else {
    //       this.listQuery.trainingType = 2;
    //     }
    //     this.getOrgPageList();
    //     this.speakerTypeAllList();
    //     // 项目部的时候查询所有班主
    //     if (this.user.orgType === 5) {
    //       this.getAllClass();
    //     }
    //     if (this.user.orgType == 6 || this.user.orgType == 7) {
    //       this.noProject();
    //     }
    //   } else {
    //     this.$message.error(res.msg);
    //   }
    // });
    // this.listAll();
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
    }
  },
  methods: {
    close1() {
      this.delList = [];
      this.show = false;
    },
    // 删除附件
    delFiles() {
      let urls = [];
      if (this.trainTitle.indexOf("新增") !== -1) {
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
    timePickerChange(e) {
      console.log(e);
      this.trainForm.trainingStartTime = e;
      // this.trainForm.trainingEndTime = e[1];
    },
    // 搜索标段项目下拉选择
    selectProject(id) {
      if (id) {
        this.searchOptions[1].disabled = false;
        this.fkProjectIdChange(id);
      } else {
        // 清空班组
        this.searchOptions[1].disabled = true;
        this.searchOptions[1].options = [{ value: "", label: "全部" }];
        this.$refs.searchBar.clean("fkTeamId");
        // this.listAllTeamsClass(id);
      }
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
    // 凭证预览
    imgPreview(item) {
      this.imgUrl = "";
      this.imgUrl = item.path;
      this.imgShow = true;
    },
    // 弹窗确定按钮
    submitTeamForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const url = JSON.stringify(this.fileList);
          const data = {};
          data.enclosureUrl = url;
          data.speaker = this.trainForm.speaker;
          data.speakerType = this.trainForm.speakerType;
          data.teamIds = this.trainForm.teamIds;
          data.title = this.trainForm.title;
          data.trainingTime = this.trainForm.trainingTime;
          data.trainingStartTime = this.trainForm.trainingStartTime + ":00";
          // data.trainingEndTime = this.trainForm.trainingEndTime;
          let dat = Date.parse(new Date(data.trainingTime + " " + data.trainingStartTime));
          data.trainingEndTime = moment(dat + this.selTime).format("HH:mm:ss");
          data.trainingEndTime = data.trainingEndTime == "Invalid date" ? "" : data.trainingEndTime;
          if (this.trainForm.trainingTime == "") {
            return this.$message.warning("培训日期不能为空");
          }
          if (this.trainForm.trainingStartTime == "") {
            return this.$message.warning("培训开始时间不能为空");
          }
          if (data.trainingEndTime == "") {
            return this.$message.warning("持续时间不能为空");
          }
          // data.trainingEndTime= moment(data.trainingStartTime + this.selTime).format("YYYY-MM-DD HH:mm:ss")
          data.detailAddress = this.trainForm.detailAddress;
          data.address = this.trainForm.detailAddress;
          data.fkCompanyId = this.trainForm.fkCompanyId;
          data.trainingType = this.orgType;
          data.trainingContent = this.$refs.myEditor.html;
          data.signStatus = this.trainForm.signStatus;

          // return console.log(data);
          this.loading = true;
          if (this.trainTitle == "新增培训") {
            data.trainingType = this.orgType;
            if (this.user.orgType == 5) {
              data.trainingType = 2;
            }
            this.$api
              .labourTrainAdd(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "新增成功"
                  });
                  this.newAddList = [];
                  this.getOrgPageList();
                  this.show = false;
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
            data.pkId = this.trainForm.pkId;

            this.$api
              .labourTrainUpdate(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: "编辑成功"
                  });
                  this.newAddList = [];
                  this.getOrgPageList();
                  this.show = false;
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
    // 点击新增弹框里面的标段项目下拉选择，搜搜索也是
    fkProjectIdChange(val) {
      this.trainForm.teamIds = [];
      if (val) {
        this.$api.listByProjectId({ projectId: val }).then(res => {
          if (res.code == 200) {
            res.data.forEach(item => {
              item.label = item.teamName;
              item.value = item.pkId;
            });
            this.teamSpinner = res.data; // 新增弹框里面的班主
            if (this.user.orgType == 5) {
              this.searchOptions[0].options = this.typeAllList;
            } else if (this.user.orgType == 6 || (this.user.orgType == 7 && this.show == false)) {
              this.searchOptions[1].options = res.data;
              this.searchOptions[1].options.unshift({ value: "", label: "全部" });
            }
          }
        });
      } else {
        this.trainForm.teamIds = [];
        this.teamSpinner = [];
      }
    },
    // 发起单位下拉框
    searchByCompany() {
      this.$api.searchByCompany().then(res => {
        if (res.code === 200) {
          let arr = { 0: "建设单位", 1: "监理公司", 2: "项目部", 3: "供应商", 4: "分包商", 5: "设计院", 6: "施工单位" };
          res.data.forEach(item => {
            item.label = item.customName + "(" + arr[item.customType] + ")";
            item.value = item.fkLinkOrgId;
          });
          console.log("11111111");
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 主讲类型下拉
    speakerTypeAllList() {
      this.$api.speakerTypeAllList().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.speakerTypeName;
            item.value = item.pkId;
          });
          this.typeAllList = res.data;
          if (this.user.orgType == 5) {
            this.searchOptions[1].options = res.data;
          } else if (this.user.orgType == 7) {
            this.searchOptions[2].options = res.data;
          } else {
            this.searchOptions[1].options = res.data;
          }
        }
      });
    },
    // 根据项目ID查询班组
    listAll(val) {
      let id = "";
      if (val != undefined) {
        id = val;
      }
      this.$api.listByProjectId({ projectId: id }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.teamName;
            item.value = item.pkId;
          });
          if (this.user.orgType == 5) {
            // this.searchOptions[0].options = res.data;
          } else if (this.user.orgType == 7) {
            this.searchOptions[0].options = res.data;
            this.searchOptions[1].options = res.data;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 标段项目下拉列表
    noProject() {
      this.$api.getItemListNoUserId({ isWhole: 1, projectId: "" }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          this.noProjectData = res.data.map(item => ({ ...item }));
          if (this.user.orgType == 7 && this.show == false) {
            this.searchOptions[0].options = res.data;
            this.searchOptions[0].options.unshift({ value: "", label: "全部" });
            this.searchOptions[1].options.unshift({ value: "", label: "全部" });
          }
        }
      });
    },
    noProjects(val) {
      let data = {
        isWhole: 0,
        projectId: val
      };
      this.$api.noProject(data).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.fkBidProjectName;
            item.value = item.fkBidProjectId;
          });
          this.searchOptions[1].options = res.data;
          this.searchOptions[1].options.unshift({ value: "", label: "全部" });
        }
      });
    },
    trainChange(val, val1) {
      if (val && val.length != 0) {
        this.noProjects(val);
      }
      this.$refs.searchBar.noProjects();
    },
    // 项目部情况时查询班组
    getAllClass() {
      this.$api.listAll().then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            item.label = item.teamName;
            item.value = item.pkId;
          });
          this.teamSpinner = res.data;
          if (this.show === false) {
            this.searchOptions[0].options = res.data;
            this.searchOptions[0].options.unshift({ value: "", label: "全部" });
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    orgTypeChange(val) {
      this.listQuery.trainingType = val.name;
      this.searchOptions.forEach(item => {
        this.$refs.searchBar.clean(item.prop);
      });
      this.listQuery = {
        pageNum: 1,
        pageSize: 10,
        trainingType: val.name
      };
      // Object.keys(this.listQuery).forEach(key => {
      //   this.listQuery[key] = "";
      // });
      if (this.user.orgType !== 5) {
        this.searchOptions[1].disabled = true;
      }
      if (this.user.orgType == 5 && val.name == 1) {
        this.maxWidth = "80";
      } else if (this.user.orgType == 5 && val.name == 2) {
        this.maxWidth = "200";
      }
      this.getOrgPageList();
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
            const imgIdx = path.lastIndexOf("com/");
            const imgName = path.substring(imgIdx + 4, path.length);
            _this.fileList.push({ name: imgName, path });
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.file.value = "";
          } else {
            _this.loading = false;
            _this.$refs.file.value = "";
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
        this.$refs.file.value = "";
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
    signIn(row) {
      const url = localStorage.getItem("httpurl");
      this.signInShow = true;
      this.$nextTick(() => {
        this.$refs.qrcode.innerHTML = "";
        new QRCode("qrcode", {
          width: 200,
          height: 200,
          text: url + "/app/labourTrain/addTrainUserSign?fkTrainId=" + row.pkId
        });
      });
    },
    examine(row) {
      this.fileList = [];
      this.times = ["", ""];
      this.selTime = "";
      this.viewshowRadio = 1;
      this.viewshow = true;
      this.trainTitle = "培训信息";
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
    addTrain() {
      this.searchByCompany();
      this.noProject();
      this.fileList = [];
      this.trainForm = {
        title: "", // 培训主题
        speakerType: "", // 培训类型
        teamIds: [], // 班组选择
        trainingTime: "", // 培训日期
        detailAddress: "", // 培训地点
        speaker: "", // 主讲人
        enclosureUrl: "", // 附件
        fkCompanyId: "",
        trainingStartTime: "",
        trainingEndTime: "",
        trainingContent: ""
      };
      this.selTime = "";
      this.disableStatus = false;
      this.times = ["", ""];
      this.trainTitle = "新增培训";
      if (this.user.orgType === 5) {
        this.getAllClass();
      }
      this.show = true;
    },
    trainEdit(row) {
      this.noProject();
      this.trainTitle = "编辑培训";
      this.trainForm = {
        projectId: "",
        title: "", // 培训主题
        speakerType: "", // 培训类型
        teamIds: [], // 班组选择
        trainingTime: "", // 培训日期
        detailAddress: "", // 培训地点
        speaker: "", // 主讲人
        enclosureUrl: "", // 附件
        fkCompanyId: "",
        trainingStartTime: "",
        trainingEndTime: "",
        signStatus: "",
        trainingContent: ""
      };
      this.selTime = "";
      this.show = true;
      this.fileList = [];
      if (this.user.orgType === 5) {
        this.getAllClass();
      }
      this.$api.labourTrainFindById({ pkId: row.pkId, pageNum: 1, pageSize: 10 }).then(res => {
        if (res.code == 200) {
          this.trainForm.pkId = res.data.pkId;
          this.trainForm.title = res.data.title;
          this.trainForm.speakerType = res.data.speakerType;
          this.trainForm.trainingTime = res.data.trainingTime;
          this.trainForm.detailAddress = res.data.detailAddress;
          this.trainForm.address = res.data.detailAddress;
          this.trainForm.speaker = res.data.speaker;
          this.trainForm.fkCompanyId = res.data.fkCompanyId;
          this.trainForm.projectId = res.data.projectId;
          this.fkProjectIdChange(this.trainForm.projectId);
          this.trainForm.teamIds = res.data.teamIds;
          this.trainForm.trainingStartTime = moment(new Date(res.data.trainingTime + " " + res.data.trainingStartTime)).format("HH:mm");
          this.trainForm.trainingEndTime = res.data.trainingEndTime;
          this.trainForm.signStatus = res.data.signStatus;
          this.trainForm.trainingContent = res.data.trainingContent;
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
          this.fileList = JSON.parse(res.data.enclosureUrl);
          if (res.data.userSignPageVo.records.length > 0) {
            this.disableStatus = true;
          }
        }
      });
    },
    getOrgPageList() {
      this.loading = true;
      this.$api
        .labourTrainSearchPage(this.listQuery)
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
    search(form) {
      if (!this.typeShow) {
        return;
      }
      this.listQuery = {
        pageNum: 1,
        pageSize: 10
      };
      console.log(form);
      if (form.beginTime) {
        this.listQuery.beginTime = moment(form.beginTime).format("YYYY-MM-DD");
      } else {
        this.listQuery.beginTime = "";
      }
      if (form.endTime) {
        this.listQuery.endTime = moment(form.endTime).format("YYYY-MM-DD");
      } else {
        this.listQuery.endTime = "";
      }
      if (form.fkProjectId) {
        this.listQuery.fkProjectId = form.fkProjectId;
      } else {
        this.listQuery.fkProjectId = "";
      }
      if (form.fkProjectBidId) {
        this.listQuery.fkProjectBidId = form.fkProjectBidId;
      } else {
        this.listQuery.fkProjectBidId = "";
      }
      if (form.fkTeamId) {
        this.listQuery.fkTeamId = form.fkTeamId;
      } else {
        this.listQuery.fkTeamId = "";
      }
      if (form.title) {
        this.listQuery.title = form.title;
      } else {
        this.listQuery.title = "";
      }
      if (form.speakerType) {
        this.listQuery.speakerType = form.speakerType;
      } else {
        this.listQuery.speakerType = "";
      }
      if (form.fkProjectId) {
        this.listQuery.fkProjectId = form.fkProjectId;
      } else {
        this.listQuery.fkProjectId = "";
      }
      this.listQuery.trainingType = this.orgType;

      this.getOrgPageList();
    },
    // 搜索组件事件
    change(form) {
      if (this.user.orgType !== 5) {
        if (this.fkProjectIdstatus != form.fkProjectId) {
          this.fkProjectIdstatus = form.fkProjectId;
          this.$refs.searchBar.fkTeamIdChange();
          this.listAll(this.fkProjectIdstatus);
        }
      }
      if (form.fkProjectId == undefined) {
        this.fkProjectIdstatus = "";
      }
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
      this.$confirm("确定删除该培训信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.labourTrainDelete({ pkId: row.pkId }).then(res => {
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
.header-search {
  position: relative;

  .add-btn {
    position: absolute;
    top: 26px;
    right: 8px;
  }

  .addTrainBtn {
    display: none !important;
  }
}

.search-bar-demo {
  /deep/ .el-date-editor--daterange {
    width: 270px !important;
  }
}

/deep/ .datetime-end {
  .el-form-item__label {
    width: 2em !important;
  }
}

.shouType {
  display: none !important;
}

.qrcode-box {
  text-align: center;
  margin: 0 auto;
}

#qrcode {
  margin: 0 auto;
}

.upLoad-show {
  max-height: 80px;
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

.el-row-data {
  display: flex;
  flex-wrap: wrap;
}

.dialogs {
  /deep/ .editor {
    height: 220px;
  }
}

/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
</style>
